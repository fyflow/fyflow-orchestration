/**
 * Ladder L2 — **`"$item"` composed: a map instance's item as a reference, and what an instance keeps for it** —
 * `spec/flow-definition.md` v0.45 `FD-C1`, `FD-C3` and `FD-R4`, `spec/run-state.md` v0.28 `RN-R13`,
 * [ADR 0118](../../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md),
 * [P38](../../doc/plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) stop-and-asks (c), (e), (l)
 * and (m), facts 5 and 6, decisions 2, 4 and 5; [W191](../../doc/work-items/w191-the-map-instances-item-as-a-reference.md).
 *
 * **Every expected value is written from those rows, never read off a run**: a `"$item"` key is the element of `over`'s
 * array the INNERMOST map instance containing the reader was opened with (c) — on the branch entry (where it equals
 * `"."`), however many hops in, after an ask, on an edge, in a fanout inside the instance, in a nested map — each its OWN
 * deep copy per key per read (decision 4, (l)); an instance KEEPS its item only where its region has a `"$item"` reader,
 * and lets go when nothing of the instance may still be entered (e) — its BRANCH terminal and no branch nested in it live,
 * each told by its own terminal event (W191's conformity reader, C1); a resume REBUILDS what is kept by
 * replay, writing nothing new (decision 5); `FD-R4` composes it from the walk's own element (W190's S-1, answered: fixed
 * here); and a flow that names it nowhere is unchanged (decision 2). The COPY claim is provoked by an ALIAS and by a
 * SHALLOW copy over NESTED items, read both ways and with two keys on one node and on one edge (P38's brief sentence).
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { BoundaryRefused, Driver } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — W191: "$item" composed — the branch entry, after an ask, two hops in, an edge, nested maps, kept where read, released by its branch`s terminal event, rebuilt by a resume';

/** A scheduler double: it RECORDS every `addTask` and fires only what a case tells it to. */
class Fake {
  readonly added: { id: string; payload: { input?: unknown } }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string; payload: { input?: unknown } }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
  /** The scheduler's `task.cancelled` for a task — the run's first `cancelled` settlement HALTS it (`RN-R28`). */
  cancelled(id: string): void { this.fire('task.cancelled', { id, state: 'cancelled', result: null, error: 'cancelled' }); }
  ids(): string[] { return this.added.map((t) => t.id); }
  inputOf(id: string): unknown { return this.added.find((t) => t.id === id)?.payload?.input; }
  done(id: string, result: unknown = null): void { this.fire('task.completed', { id, state: 'done', result, error: null }); }
  /** An OPTIONAL task failing: `task.failed` alone, `state: 'failed'` — with no `on: ['failed']` edge its path ENDS. */
  failed(id: string): void { this.fire('task.failed', { id, state: 'failed', result: null, error: 'boom' }); }
  private fire(name: string, d: Record<string, unknown>): void {
    const detail = { ...d, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get(name) ?? []) fn({ detail });
  }
}

const NUM_IT: JsonSchema = { type: 'object', required: ['it'], properties: { it: { type: 'number' } } };
const TAGGED: JsonSchema = { type: 'object', required: ['run'], properties: { run: { type: 'object', required: ['tag'], properties: { tag: { type: 'string' } } } } };
const TYPES = typesFor(['T'], { NumIt: { worker: 'numIt' }, Tagged: { worker: 'tagged' } },
  { numIt: { url: 'test://numIt', inputSchema: NUM_IT }, tagged: { url: 'test://tagged', inputSchema: TAGGED } });

function make(def: FlowDefinition, opts: { predicates?: Map<string, (c: DecisionContext) => boolean>; runId?: string; onRegionEvent?: (e: RegionEvent) => void; joinPolicy?: JoinPolicy } = {}) {
  const sch = new Fake();
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId: opts.runId ?? 'r1', scheduler: sch as never, createTask: (c) => c as never, predicates: opts.predicates ?? new Map(), now: () => 42,
    joinPolicy: opts.joinPolicy ?? (liveToken as unknown as JoinPolicy), ...TYPES,
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); },
    ...(opts.onRegionEvent ? { onRegionEvent: opts.onRegionEvent } : {}),
  });
  return { driver, sch, failures };
}
const flow = (flowId: string, entry: string, nodes: unknown[]): FlowDefinition => ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const task = (id: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type: 'T', edges: [{ to }], ...extra });
const join = (id: string, of: string, to = 'done') => ({ id, kind: 'join', of, edges: [{ to }] });

/** What the driver HOLDS for `"$item"` — `Driver.items`, read as an observer (`RN-R13`'s sixth term): map -> paths held. */
const held = (d: Driver): Record<string, string[]> => {
  const s = (d as unknown as { items: { held: Map<string, Map<string, unknown>> } }).items.held;
  return Object.fromEntries([...s].map(([k, v]) => [k, [...v.keys()].sort()]));
};

/**
 * **A consumer's policy that fires the named regions' joins at their FIRST arrival** — Q583's shape, through the public
 * `joinPolicy` seam; `liveToken` for every other region. No shipped policy does this, and it is the case P38 (e) releases
 * per INSTANCE for: a join satisfied while other branches of its region still run.
 */
const firstArrival = (early: readonly string[]): JoinPolicy => {
  const lt = liveToken as unknown as JoinPolicy;
  type S = { id: string; inner: unknown; arrived: number };
  return {
    id: 'first-arrival', open: (r: { fanoutId: string }) => ({ id: r.fanoutId, inner: lt.open(r as never), arrived: 0 }),
    step: (s: S, e: RegionEvent) => ({ ...s, inner: lt.step(s.inner as never, e), arrived: s.arrived + (e.type === 'branch.arrived' ? 1 : 0) }),
    status: (s: S) => (early.includes(s.id) && s.arrived >= 1 ? 'satisfied' : lt.status(s.inner as never)),
    describe: (s: S) => ({ arrived: s.arrived }),
  } as unknown as JoinPolicy;
};

/** NESTED invoices, so a shallow copy is distinguishable from a deep one. */
const invoice = (id: string, amount: number) => ({ id, amount, lines: [{ sku: `${id}-a`, qty: 1 }] });
const INVOICES = () => [invoice('A', 150), invoice('B', 50), invoice('C', 300)];

/** The app's case 2: an ENTRY map over `invoices`, its branch an ASK, and `pay` after it reaching its item and its answer. */
const appCase2 = (invoiceRef = '$item') => flow('review-each', 'each', [
  { id: 'each', kind: 'map', over: 'invoices', branch: 'check' },
  { id: 'check', kind: 'ask', answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
    edges: [{ on: ['failed'], to: 'skipped' }, { to: 'pay' }] },
  task('pay', 'collect', { needs: { invoice: invoiceRef, answer: 'check' } }),
  { id: 'skipped', kind: 'end', outcome: 'skipped' },
  join('collect', 'each'),
  END,
]);

const DECLARED_CASES = [
  'the BRANCH ENTRY: a "$item" key is the instance`s own item — "." beside it the same value, and three different objects',
  'the app`s case 2: an ENTRY map whose branch is an ASK — each `pay` its OWN item beside its OWN answer, answered out of order',
  'TWO HOPS into an instance: a "$item" key is the item, never the predecessor`s result — at an arity of eleven, "1" against "10"',
  'an EDGE: a declared predicate routes on needs.it.amount from "$item", both ways in ONE run',
  'NESTED maps: the inner node`s "$item" is the INNER item, the inner MAP node`s its enclosing one, and a node after the inner join the OUTER item',
  'a FANOUT inside an instance: a node in its branch reads the MAP`s item',
  'the COPY claim over NESTED items, read both ways — two "$item" keys on one node and one edge, a worker`s and a predicate`s write, the caller`s payload',
  'KEPT only where read: a map with no "$item" reader holds nothing, nor a map of ZERO items — beside a control holding every live instance`s item',
  'RELEASED by the instance`s own terminal event — arrived, exited, lost — a parked instance kept until its answer, and everything at a halt',
  'a NESTED join fired early: the instance`s branch arrives while a nested branch still runs — the item kept until that branch ends too',
  'per INSTANCE, never with the join: a map`s join fired at its FIRST arrival — a late instance still reads, and a second map`s instance of the same path releases only its own',
  'nesting DEEPER than one level, per instance, both orders: a fanout in a fanout in each instance, joins fired early — each instance released by whichever of its events comes last',
  'a nested branch ending LOST or EXITED releases an instance whose branch already arrived — and a map under an outer fanout (instance "1.0") keeps its item for its nested branch',
  'a STOPPED run, RESUMED on a fresh driver: the store rebuilt by the replay, the successor`s value the uninterrupted control`s, nothing new in the checkpoint',
  'FD-R4 at start() over an ENTRY map`s branch task: ".", "$payload" and "$item" each composed from the walk — accepted, or BoundaryRefused, never UnresolvedBranchPath',
  'a map flow naming "$item" nowhere is unchanged — the same fold inputs and dispatched inputs, the key aside, and nothing kept',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const m = make(flow('entry', 'ingest', [
      task('ingest', 'split'),
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'collect', { needs: { it: '$item', own: '.' } }),
      join('collect', 'split'),
      END,
    ]));
    m.driver.start({});
    m.sch.done('r1:ingest:-:0', { items: [invoice('A', 1), invoice('B', 2)] });
    for (const [i, id] of [[0, 'A'], [1, 'B']] as const) {
      const got = m.sch.inputOf(`r1:a:${i}:0`) as { it: unknown; own: unknown };
      equal(got, { it: invoice(id, i + 1), own: invoice(id, i + 1) }, `instance ${i}: "$item" and "." are its own item (P38 (d))`);
      ok(got.it !== got.own, `instance ${i}: two keys, two objects`);
    }
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[1]!, () => {
    const m = make(appCase2());
    const payload = { invoices: INVOICES() };
    m.driver.start(payload);
    equal(m.sch.ids(), [], 'three asks parked, nothing dispatched');
    // Answered OUT of order, each answer distinct, so a mix-up between instances shows as a wrong pair.
    m.driver.resolve('r1:check:2:0', 'done', { result: { approved: true, note: 'c' }, actor: 'ana' });
    m.driver.resolve('r1:check:0:0', 'done', { result: { approved: false, note: 'a' }, actor: 'bo' });
    m.driver.resolve('r1:check:1:0', 'done', { result: { approved: true, note: 'b' }, actor: 'cy' });
    equal(m.sch.ids(), ['r1:pay:2:0', 'r1:pay:0:0', 'r1:pay:1:0'], 'one `pay` per answer, in answer order');
    equal(['0', '1', '2'].map((i) => m.sch.inputOf(`r1:pay:${i}:0`)), [
      { invoice: invoice('A', 150), answer: { approved: false, note: 'a' } },
      { invoice: invoice('B', 50), answer: { approved: true, note: 'b' } },
      { invoice: invoice('C', 300), answer: { approved: true, note: 'c' } },
    ], 'each `pay` its OWN invoice beside its OWN answer — the item reached past the ask, with no pass-through task (P38 fact 3`s road, retired)');
    // The CONTROL, P38 fact 5: with "." in its place `pay` receives the ANSWER twice — nothing kept the item.
    const dot = make(appCase2('.'));
    dot.driver.start({ invoices: INVOICES() });
    dot.driver.resolve('r1:check:0:0', 'done', { result: { approved: true }, actor: 'ana' });
    equal(dot.sch.inputOf('r1:pay:0:0'), { invoice: { approved: true }, answer: { approved: true } }, '"." is what the edge carried — the answer');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[2]!, () => {
    const m = make(flow('hops', 'ingest', [
      task('ingest', 'split'),
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'b'),
      task('b', 'c'),
      task('c', 'collect', { needs: { it: '$item', prev: '.' } }),
      join('collect', 'split'),
      END,
    ]));
    m.driver.start({});
    const items = Array.from({ length: 11 }, (_v, i) => ({ n: i, tag: `item-${i}` }));
    m.sch.done('r1:ingest:-:0', { items });
    // Instances 10 and 1 settle FIRST and their paths are "10" and "1" — a store keyed by anything but the whole
    // segment (a prefix, a sort) would hand 10 the item of 1, or the reverse (section 3's segment-wise rule).
    for (const i of [10, 1, 0, 2, 3, 4, 5, 6, 7, 8, 9]) {
      m.sch.done(`r1:a:${i}:0`, { from: `a${i}` });
      m.sch.done(`r1:b:${i}:0`, { from: `b${i}` });
    }
    equal(m.sch.inputOf('r1:c:10:0'), { it: { n: 10, tag: 'item-10' }, prev: { from: 'b10' } }, 'instance 10: its OWN item, and b`s result under `prev`');
    equal(m.sch.inputOf('r1:c:1:0'), { it: { n: 1, tag: 'item-1' }, prev: { from: 'b1' } }, 'instance 1: its own — not 10`s');
    equal(Array.from({ length: 11 }, (_v, i) => (m.sch.inputOf(`r1:c:${i}:0`) as { it: unknown }).it), items, 'all eleven, each its own');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[3]!, () => {
    const m = make(flow('route', 'split', [
      { id: 'split', kind: 'map', over: 'invoices', branch: 'a' },
      { id: 'a', kind: 'task', type: 'T', edges: [
        { when: { path: 'needs.it.amount', op: 'gt', value: 100 }, to: 'audit', needs: { it: '$item' } },
        { to: 'b' },
      ] },
      task('audit', 'collect'),
      task('b', 'collect'),
      join('collect', 'split'),
      END,
    ]));
    m.driver.start({ invoices: INVOICES() });
    // a's RESULT says nothing about the amount: the route can only come from the item.
    for (const i of [0, 1, 2]) m.sch.done(`r1:a:${i}:0`, { checked: true });
    equal(m.sch.ids().filter((id) => !id.startsWith('r1:a:')).sort(), ['r1:audit:0:0', 'r1:audit:2:0', 'r1:b:1:0'],
      '150 and 300 > 100 audit, 50 takes the default — one document, one run, the item alone decides');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[4]!, () => {
    const m = make(flow('nested', 'ingest', [
      task('ingest', 'outer'),
      { id: 'outer', kind: 'map', over: 'groups', branch: 'g' },
      task('g', 'inner'),
      // The inner MAP reads its `over` off its ENCLOSING instance's item — never off g's result.
      { id: 'inner', kind: 'map', over: 'rows', branch: 'r', needs: { rows: '$item' } },
      task('r', 'innerJoin', { needs: { row: '$item' } }),
      join('innerJoin', 'inner', 'h'),
      task('h', 'outerJoin', { needs: { group: '$item' } }),
      join('outerJoin', 'outer'),
      END,
    ]));
    m.driver.start({});
    m.sch.done('r1:ingest:-:0', { groups: [['x', 'y'], ['z']] });
    m.sch.done('r1:g:0:0', { rows: ['WRONG'] });
    m.sch.done('r1:g:1:0', { rows: ['WRONG'] });
    equal(['r1:r:0.0:0', 'r1:r:0.1:0', 'r1:r:1.0:0'].map((id) => m.sch.inputOf(id)), [{ row: 'x' }, { row: 'y' }, { row: 'z' }],
      'the inner map opened over the OUTER item (2 + 1 instances, not g`s one-element list), and each r its INNER item');
    for (const id of ['r1:r:0.0:0', 'r1:r:0.1:0', 'r1:r:1.0:0']) m.sch.done(id, null);
    equal([m.sch.inputOf('r1:h:0:0'), m.sch.inputOf('r1:h:1:0')], [{ group: ['x', 'y'] }, { group: ['z'] }],
      'h, after the inner join and still in the outer instance, reads the OUTER item');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[5]!, () => {
    const m = make(flow('fan-in-map', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'fan'),
      { id: 'fan', kind: 'fanout', branches: ['l', 'rr'] },
      task('l', 'fj', { needs: { it: '$item', own: '.' } }),
      task('rr', 'fj'),
      join('fj', 'fan', 'collect'),
      join('collect', 'split'),
      END,
    ]));
    m.driver.start({ items: ['p', 'q'] });
    m.sch.done('r1:a:0:0', { from: 'a0' });
    m.sch.done('r1:a:1:0', { from: 'a1' });
    equal([m.sch.inputOf('r1:l:0.0:0'), m.sch.inputOf('r1:l:1.0:0')], [{ it: 'p', own: { from: 'a0' } }, { it: 'q', own: { from: 'a1' } }],
      'l, in branch 0 of a fanout inside each instance: the MAP`s item, and "." the fanout`s copy of a`s result');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[6]!, () => {
    type Inv = ReturnType<typeof invoice>;
    const sawAlso: unknown[] = [];
    const writes = new Map<string, (c: DecisionContext) => boolean>([['scribble', (ctx) => {
      (ctx.needs.it as Inv).lines[0]!.sku = 'from-the-predicate';
      sawAlso.push(structuredClone(ctx.needs.also));
      return false;
    }]]);
    type Road = 'entry' | 'gate' | 'task';
    const build = (road: Road) => flow('copies', road === 'entry' ? 'split' : road === 'gate' ? 'g' : 'ingest', [
      ...(road === 'task' ? [task('ingest', 'split')] : []),
      // A built-in `if` gate hands on what reached it, unchanged — at the entry, the CALLER's own payload.
      ...(road === 'gate' ? [{ id: 'g', kind: 'gate', type: 'if', settings: { when: { path: 'input.go', op: 'eq', value: true } },
        edges: [{ route: 'then', to: 'split' }, { to: 'done' }] }] : []),
      { id: 'split', kind: 'map', over: 'invoices', branch: 'a' },
      task('a', 'b', { needs: { it: '$item', own: '.' } }),
      { id: 'b', kind: 'task', type: 'T', needs: { it: '$item', also: '$item' },
        edges: [{ when: { predicate: 'scribble' }, to: 'collect', needs: { it: '$item', also: '$item' } }, { to: 'c' }] },
      task('c', 'collect', { needs: { it: '$item' } }),
      join('collect', 'split'),
      END,
    ]);
    // Every STORE road: an ENTRY map and a map behind an entry GATE, whose received value is the CALLER's own payload (each
    // keeps its own copy), and a map after a task, whose received value is the driver's own edge-hop clone (it keeps a
    // reference) — ADR 0118, W191's reading R3.
    const roads: Road[] = ['entry', 'gate', 'task'];
    for (const road of roads) {
      const entry = road !== 'task';
      sawAlso.length = 0;
      const m = make(build(road), { predicates: writes });
      const caller = { go: true, invoices: [invoice('A', 1), invoice('B', 2)] };
      m.driver.start(entry ? caller : {});
      if (!entry) m.sch.done('r1:ingest:-:0', caller);
      // DIRECTION 1 — the SOURCE written after the copy: the caller's nested object, after start() / after it settled.
      caller.invoices[0]!.lines[0]!.qty = 99;
      // DIRECTION 2 — the COPY written: a's worker writes into BOTH keys it received, nested (an inline worker holds them).
      const aIn = m.sch.inputOf('r1:a:0:0') as { it: Inv; own: Inv };
      equal(aIn.it, invoice('A', 1), `${road}: a received the item as the map received it`);
      aIn.it.lines[0]!.sku = 'from-a-worker';
      aIn.own.lines[0]!.sku = 'from-a-worker-own';
      m.sch.done('r1:a:0:0', null);
      const bIn = m.sch.inputOf('r1:b:0:0') as { it: Inv; also: Inv };
      equal(bIn, { it: invoice('A', 1), also: invoice('A', 1) }, 'b receives the ORIGINAL under both keys — neither the caller`s write nor a`s worker`s');
      ok(bIn.it !== bIn.also && bIn.it.lines !== bIn.also.lines && bIn.it.lines[0] !== bIn.also.lines[0],
        'two "$item" keys on ONE node share no object at any depth — one copy per KEY (an ALIAS or a SHALLOW copy fails here)');
      bIn.it.lines[0]!.sku = 'from-b-worker';
      m.sch.done('r1:b:0:0', null);
      equal(sawAlso, [invoice('A', 1)], 'the predicate`s nested write into `it` is not in `also` beside it on the same EDGE — one copy per KEY');
      equal(m.sch.inputOf('r1:c:0:0'), { it: invoice('A', 1) }, 'and c, after all three writes, still receives the original — the kept item untouched');
      equal(m.failures, [], `${road}: nothing reported`);
    }
  });

  test(DECLARED_CASES[7]!, () => {
    const shape = (needs: Record<string, unknown>) => flow('kept', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'b'),
      task('b', 'collect', { needs }),
      join('collect', 'split'),
      END,
    ]);
    const none = make(shape({ prev: '.' }));
    none.driver.start({ items: ['p', 'q', 'r'] });
    equal(held(none.driver), {}, 'no "$item" reader in the region: NOTHING is held while three instances run (P38 (e))');
    equal((none.driver as unknown as { items: { kept: Map<string, boolean> } }).items.kept.size, 0, 'and no map is marked to keep');
    // The CONTROL showing the observer SEES the store: the same document with one "$item" key holds all three.
    const reader = make(shape({ prev: '.', it: '$item' }));
    reader.driver.start({ items: ['p', 'q', 'r'] });
    equal(held(reader.driver), { split: ['0', '1', '2'] }, 'the CONTROL: one reader, and every live instance`s item is held');
    // A map of ZERO items opens no instance, so it keeps nothing — not an empty entry that no terminal event could release.
    const zero = make(shape({ prev: '.', it: '$item' }));
    zero.driver.start({ items: [] });
    equal(held(zero.driver), {}, 'zero items: nothing held — no key for the map at all');
  });

  test(DECLARED_CASES[8]!, () => {
    // Three instances, each ending by a different TERMINAL event: 1 ARRIVES at the join, 2 is declined to an `end`
    // inside the region (EXITED), 0's `pay` — optional — fails with no failed edge (LOST).
    const def = flow('release', 'each', [
      { id: 'each', kind: 'map', over: 'invoices', branch: 'check' },
      { id: 'check', kind: 'ask', edges: [{ on: ['failed'], to: 'skipped' }, { to: 'pay' }] },
      task('pay', 'collect', { needs: { invoice: '$item' }, optional: true }),
      { id: 'skipped', kind: 'end', outcome: 'skipped' },
      join('collect', 'each'),
      END,
    ]);
    // Read INSIDE the consumer's callback on each terminal event: the horizon is the EVENT, so the store is read there.
    const atEvent: string[] = [];
    let d: Driver | null = null;
    const m = make(def, { onRegionEvent: (e) => {
      if (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost') {
        atEvent.push(`${e.type}@${e.branchPath}: ${JSON.stringify(held(d!))}`);
      }
    } });
    d = m.driver;
    m.driver.start({ invoices: INVOICES() });
    equal(held(m.driver), { each: ['0', '1', '2'] }, 'three asks parked: each instance keeps its item — a SUSPENDED node keeps its instance live');
    m.driver.resolve('r1:check:1:0', 'done', { result: { approved: true }, actor: 'ana' });
    equal(held(m.driver), { each: ['0', '1', '2'] }, 'answered, `pay` in flight: instance 1 is still live, still kept');
    m.sch.done('r1:pay:1:0', null);
    m.driver.resolve('r1:check:2:0', 'failed', { actor: 'ana' });
    m.driver.resolve('r1:check:0:0', 'done', { result: { approved: true }, actor: 'ana' });
    equal(held(m.driver), { each: ['0'] }, 'two instances ended: only the one whose `pay` runs is kept');
    m.sch.failed('r1:pay:0:0');
    equal(atEvent, [
      'branch.arrived@1: {"each":["0","2"]}',
      'branch.exited@2: {"each":["0"]}',
      'branch.lost@0: {}',
    ], 'each release is TOLD by that instance`s own terminal event — gone when the event is delivered, and no other instance`s with it');
    equal(held(m.driver), {}, 'the last instance released: the map`s own key goes with it');
    // `spec/run-state.md` section 3: a path that ended with NO ELIGIBLE EDGE — instance 0's — makes the run `failed`,
    // inside a region or out; the run is over, nothing waits.
    equal(fold(m.driver.foldInputs()).outcome, 'failed', 'and the run is over — `failed`, by instance 0`s path end');
    // A RUN-LEVEL moment: a predicate that throws HALTS the run — and nothing is entered after, so nothing is kept.
    const halt = make(flow('halt', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      { id: 'a', kind: 'task', type: 'T', needs: { it: '$item' }, edges: [{ when: { predicate: 'explode' }, to: 'collect' }, { to: 'collect' }] },
      join('collect', 'split'),
      END,
    ]), { predicates: new Map([['explode', () => { throw new Error('boom'); }]]) });
    halt.driver.start({ items: ['p', 'q'] });
    equal(held(halt.driver), { split: ['0', '1'] }, 'two instances running, both kept');
    halt.sch.done('r1:a:0:0', null);
    equal([halt.failures.length, held(halt.driver)], [1, {}], 'the halt: reported once, and every instance`s item released with it');
    // The other run-level moments: the owner's CANCEL — nothing is entered after it — and a `cancelled` SETTLEMENT, which
    // halts the run (`RN-R28`). Each beside the same run holding before it.
    const parked = () => {
      const p = make(def);
      p.driver.start({ invoices: INVOICES() });
      p.driver.resolve('r1:check:0:0', 'done', { result: { approved: true }, actor: 'ana' });
      equal(held(p.driver), { each: ['0', '1', '2'] }, 'before: three instances kept');
      return p;
    };
    const cancelling = parked();
    void cancelling.driver.cancel({ actor: 'ops' });
    equal(held(cancelling.driver), {}, 'the owner`s CANCEL: every instance`s item released at once');
    const settled = parked();
    settled.sch.cancelled('r1:pay:0:0');
    equal(held(settled.driver), {}, 'a `cancelled` SETTLEMENT halts the run: every instance`s item released');
  });

  test(DECLARED_CASES[9]!, () => {
    // Inside each instance a FANOUT whose join a policy fires at its FIRST arrival: `l` arrives, `fj` fires, `c` runs and
    // the instance's branch ARRIVES at `collect` — while `rr` still runs, and `x` after it reads "$item" (W191's conformity
    // reader, C1). The horizon is *nothing of the instance may still be entered*, not the instance's own event.
    const nestedEarly = (ref: string) => flow('nested-early', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'fan'),
      { id: 'fan', kind: 'fanout', branches: ['l', 'rr'] },
      task('l', 'fj'),
      task('rr', 'x'),
      task('x', 'fj', { needs: { it: ref } }),
      join('fj', 'fan', 'c'),
      task('c', 'collect'),
      join('collect', 'split'),
      END,
    ]);
    const m = make(nestedEarly('$item'), { joinPolicy: firstArrival(['fan']) });
    m.driver.start({ items: ['p'] });
    m.sch.done('r1:a:0:0', { from: 'a' });
    m.sch.done('r1:l:0.0:0', { from: 'l' });
    m.sch.done('r1:c:0:0', { from: 'c' });
    equal(held(m.driver), { split: ['0'] }, 'the instance`s branch ARRIVED — and its item is KEPT: `rr`, nested in it, is still live');
    m.sch.done('r1:rr:0.1:0', { from: 'rr' });
    equal(m.sch.inputOf('r1:x:0.1:0'), { it: 'p' }, '`x`, entered AFTER its instance`s branch arrived, reads the item');
    equal(m.failures, [], 'nothing reported — no "holds no item"');
    m.sch.done('r1:x:0.1:0', null);
    equal(held(m.driver), {}, 'and `rr``s branch, the last live one nested in the instance, ending releases it');
    // The CONTROL: the same document with "." at `x` — the road runs clean, so the case is about the item and not the policy.
    const dot = make(nestedEarly('.'), { joinPolicy: firstArrival(['fan']) });
    dot.driver.start({ items: ['p'] });
    for (const id of ['r1:a:0:0', 'r1:l:0.0:0', 'r1:c:0:0', 'r1:rr:0.1:0']) dot.sch.done(id, { from: id });
    equal([dot.sch.inputOf('r1:x:0.1:0'), dot.failures], [{ it: { from: 'r1:rr:0.1:0' } }, []], 'the "." CONTROL: x entered with rr`s result under `it`, nothing reported');
  });

  test(DECLARED_CASES[10]!, () => {
    // Map A's join fires at its FIRST arrival, and map B — after it, over the run's payload — opens while A's instance 1 still
    // runs. B's instance "1" ARRIVES first: it must release B's "1" alone. Then A's instance 1 reaches `b`, which reads A's item.
    const m = make(flow('two-maps', 'ingest', [
      task('ingest', 'A'),
      { id: 'A', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'b'),
      task('b', 'joinA', { needs: { it: '$item' } }),
      join('joinA', 'A', 'B'),
      { id: 'B', kind: 'map', over: 'rows', branch: 'a2', needs: { rows: '$payload' } },
      task('a2', 'joinB', { needs: { it: '$item' } }),
      join('joinB', 'B'),
      END,
    ]), { joinPolicy: firstArrival(['A']) });
    m.driver.start(['u', 'v']);
    m.sch.done('r1:ingest:-:0', { items: ['p', 'q'] });
    m.sch.done('r1:a:0:0', null);
    m.sch.done('r1:b:0:0', null);
    equal(m.sch.ids().filter((id) => id.startsWith('r1:a2:')), ['r1:a2:0:0', 'r1:a2:1:0'], 'A`s join FIRED at its first arrival, and B opened two instances');
    equal(held(m.driver), { A: ['1'], B: ['0', '1'] }, 'A`s instance 1 is still live, so ITS item is kept — the join firing released nothing of it');
    m.sch.done('r1:a2:1:0', null);
    equal(held(m.driver), { A: ['1'], B: ['0'] }, 'B`s "1" arrived: B`s item released, A`s "1" — the same PATH, another map — kept');
    m.sch.done('r1:a:1:0', null);
    equal(m.sch.inputOf('r1:b:1:0'), { it: 'q' }, 'A`s late instance reaches b, and b reads ITS item');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[11]!, () => {
    // Each instance: `a -> fan [l, rr]`, and `rr -> fan2 [p, q]`, `q -> x` reading "$item" — a region nested TWO levels in the
    // instance. Both inner joins fire at their FIRST arrival (round 2's S1). Three instances, three orders.
    const m = make(flow('deep', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'fan'),
      { id: 'fan', kind: 'fanout', branches: ['l', 'rr'] },
      task('l', 'fj'),
      task('rr', 'fan2'),
      { id: 'fan2', kind: 'fanout', branches: ['p', 'q'] },
      task('p', 'f2j'),
      task('q', 'x'),
      task('x', 'f2j', { needs: { it: '$item' } }),
      join('f2j', 'fan2', 'fj'),
      join('fj', 'fan', 'c'),
      task('c', 'collect'),
      join('collect', 'split'),
      END,
    ]), { joinPolicy: firstArrival(['fan', 'fan2']) });
    m.driver.start({ items: ['P', 'Q', 'R'] });
    // Instance 0: its OWN branch arrives first (l arrives, fj fires, c runs) while rr — and the region rr will open — still run.
    for (const id of ['r1:a:0:0', 'r1:l:0.0:0', 'r1:c:0:0']) m.sch.done(id);
    equal(held(m.driver), { split: ['0', '1', '2'] }, 'instance 0`s branch ARRIVED, and it is kept: rr, nested in it, is live');
    // Instance 1, start to finish: its own event first too, then its two-deep nested branches end — and it alone is released.
    for (const id of ['r1:a:1:0', 'r1:l:1.0:0', 'r1:c:1:0', 'r1:rr:1.1:0', 'r1:p:1.1.0:0', 'r1:q:1.1.1:0', 'r1:x:1.1.1:0']) m.sch.done(id);
    equal(held(m.driver), { split: ['0', '2'] }, 'instance 1 released when ITS last nested branch ended — instance 0`s live ones are not its');
    // Instance 2, the OTHER order: every nested branch ends BEFORE the instance's own event — released AT that event.
    for (const id of ['r1:a:2:0', 'r1:rr:2.1:0', 'r1:p:2.1.0:0', 'r1:q:2.1.1:0', 'r1:x:2.1.1:0', 'r1:l:2.0:0']) m.sch.done(id);
    equal(held(m.driver), { split: ['0', '2'] }, 'instance 2: every nested branch ended, its own branch not yet — still kept');
    m.sch.done('r1:c:2:0');
    equal(held(m.driver), { split: ['0'] }, 'and released by its own arrival, the event that came last');
    // Back to instance 0: fan2 opens AFTER its branch arrived, fires early on p, and fan's branch 0.1 arrives — while q, two
    // levels down, still runs and leads to x.
    for (const id of ['r1:rr:0.1:0', 'r1:p:0.1.0:0']) m.sch.done(id);
    equal(held(m.driver), { split: ['0'] }, 'fan`s last branch arrived, but fan2`s q — two levels down — is live: kept');
    m.sch.done('r1:q:0.1.1:0');
    equal(['0', '1', '2'].map((i) => m.sch.inputOf(`r1:x:${i}.1.1:0`)), [{ it: 'P' }, { it: 'Q' }, { it: 'R' }], 'each x read its OWN instance`s item');
    m.sch.done('r1:x:0.1.1:0');
    equal([held(m.driver), m.failures], [{}, []], 'and the last nested branch ending released the last instance; nothing reported');
  });

  test(DECLARED_CASES[12]!, () => {
    // Round 2's S3: the instance's branch ARRIVES first (fan fired at l), then the nested branch rr ends by LOSS (an optional
    // task failing, no failed edge) or by EXITING to an `end` — either terminal event releases the instance.
    for (const how of ['lost', 'exited'] as const) {
      const m = make(flow('nested-end', 'split', [
        { id: 'split', kind: 'map', over: 'items', branch: 'a' },
        task('a', 'fan'),
        { id: 'fan', kind: 'fanout', branches: ['l', 'rr'] },
        task('l', 'fj', { needs: { it: '$item' } }),
        how === 'lost' ? task('rr', 'fj', { optional: true }) : task('rr', 'stop'),
        ...(how === 'exited' ? [{ id: 'stop', kind: 'end', outcome: 'skipped' }] : []),
        join('fj', 'fan', 'c'),
        task('c', 'collect'),
        join('collect', 'split'),
        END,
      ]), { joinPolicy: firstArrival(['fan']) });
      m.driver.start({ items: ['P'] });
      for (const id of ['r1:a:0:0', 'r1:l:0.0:0', 'r1:c:0:0']) m.sch.done(id);
      equal(held(m.driver), { split: ['0'] }, `${how}: the instance's branch arrived, rr live — kept`);
      if (how === 'lost') m.sch.failed('r1:rr:0.1:0'); else m.sch.done('r1:rr:0.1:0');
      equal(held(m.driver), {}, `${how}: rr's branch ${how === 'lost' ? 'LOST' : 'EXITED'} — the last nested branch — and the instance is released`);
    }
    // Round 2's S11: the kept map sits in branch 1 of an outer FANOUT, so its instance path is "1.0" — two segments — and a
    // fanout inside the instance fires its join early. x, after the instance's branch arrived, reads the item.
    const m = make(flow('map-in-fan', 'top', [
      { id: 'top', kind: 'fanout', branches: ['side', 'pre'] },
      task('side', 'tj'),
      task('pre', 'split'),
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'fan'),
      { id: 'fan', kind: 'fanout', branches: ['l', 'rr'] },
      task('l', 'fj'),
      task('rr', 'x'),
      task('x', 'fj', { needs: { it: '$item' } }),
      join('fj', 'fan', 'c'),
      task('c', 'collect'),
      join('collect', 'split', 'tj'),
      join('tj', 'top'),
      END,
    ]), { joinPolicy: firstArrival(['fan']) });
    m.driver.start({});
    m.sch.done('r1:pre:1:0', { items: ['P'] });
    for (const id of ['r1:a:1.0:0', 'r1:l:1.0.0:0', 'r1:c:1.0:0']) m.sch.done(id);
    equal(held(m.driver), { split: ['1.0'] }, 'instance "1.0": its branch arrived, rr live — kept under its whole two-segment path');
    m.sch.done('r1:rr:1.0.1:0');
    equal([m.sch.inputOf('r1:x:1.0.1:0'), m.failures], [{ it: 'P' }, []], 'x reads the item — no "holds no item"');
    m.sch.done('r1:x:1.0.1:0');
    equal(held(m.driver), {}, 'and x`s branch ending releases it');
  });

  test(DECLARED_CASES[13]!, async () => {
    const answerAll = (m: ReturnType<typeof make>) => {
      m.driver.resolve('r1:check:1:0', 'done', { result: { approved: true, note: 'b' }, actor: 'ana' });
    };
    // The UNINTERRUPTED control: the same run, its first instance answered, then instance 1, on the driver that started it.
    const control = make(appCase2());
    control.driver.start({ invoices: INVOICES() });
    control.driver.resolve('r1:check:0:0', 'done', { result: { approved: false }, actor: 'bo' });
    control.driver.resolve('r1:check:2:0', 'failed', { actor: 'cy' });
    answerAll(control);
    // The STORED run: instance 0 answered (its `pay` dispatched), 1 and 2 PARKED — then stopped by its owner.
    const first = make(appCase2());
    first.driver.start({ invoices: INVOICES() });
    first.driver.resolve('r1:check:0:0', 'done', { result: { approved: false }, actor: 'bo' });
    // Instance 2 is DECLINED to its `end` before the stop: its branch EXITED, so its item is already released.
    first.driver.resolve('r1:check:2:0', 'failed', { actor: 'cy' });
    equal(held(first.driver), { each: ['0', '1'] }, 'before the stop: two live instances kept, the one that ended released');
    await first.driver.stop({ actor: 'ops' });
    equal(held(first.driver), {}, 'STOPPED: nothing is entered on this driver again, so it keeps nothing (a run-level moment)');
    const cp = structuredClone(first.driver.checkpoint());
    equal(Object.keys(cp.header).sort(), ['entryPayload', 'flowId', 'format', 'runId', 'version'], 'the header: the same five keys (decision 5)');
    equal(cp.header.format, 2, 'at format 2 — CHECKPOINT_FORMAT, unmoved by "$item" (W191); 2 since ADR 0138 moved it for the join`s keys');
    // A FRESH driver and scheduler: nothing is in the checkpoint for the items, so the replay must REBUILD them.
    const again = make(appCase2());
    again.driver.resume(cp);
    equal(again.failures, [], 'the replay regenerated every element — no `diverged`');
    equal(held(again.driver), { each: ['0', '1'] }, 'the store REBUILT by the replay IDENTICALLY — releases included: the two live instances` items, not the one that had ended');
    (cp.header.entryPayload as { invoices: ReturnType<typeof invoice>[] }).invoices[1]!.lines[0]!.sku = 'from-the-store';
    answerAll(again);
    equal(again.sch.inputOf('r1:pay:1:0'), control.sch.inputOf('r1:pay:1:0'), 'pay@1 receives what the uninterrupted run`s pay@1 received');
    equal(again.sch.inputOf('r1:pay:1:0'), { invoice: invoice('B', 50), answer: { approved: true, note: 'b' } }, 'which is instance 1`s own invoice');
    // Nothing new is written: the resumed log holds no kind the same resume of a "." flow does not.
    const dot = make(appCase2('.'));
    dot.driver.start({ invoices: INVOICES() });
    dot.driver.resolve('r1:check:0:0', 'done', { result: { approved: false }, actor: 'bo' });
    dot.driver.resolve('r1:check:2:0', 'failed', { actor: 'cy' });
    await dot.driver.stop({ actor: 'ops' });
    const dotAgain = make(appCase2('.'));
    dotAgain.driver.resume(structuredClone(dot.driver.checkpoint()));
    answerAll(dotAgain);
    const kindsOf = (d: Driver) => d.foldInputs().map((e: FoldInput) => e.kind);
    equal(kindsOf(again.driver), kindsOf(dotAgain.driver), 'the same fold-input KINDS, in the same order, as the "." control`s resume');
  });

  test(DECLARED_CASES[14]!, () => {
    // An ENTRY map, its branch task holding a schema over the value its `needs` composes. Until W191 ANY `needs` here threw a
    // raw `UnresolvedBranchPath` out of start() — FD-R4 composed with no item index (W190's S-1).
    const entryMap = (type: string, needs: Record<string, unknown>) => flow('fdr4-map', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'each' },
      { id: 'each', kind: 'task', type, needs, edges: [{ to: 'collect' }] },
      join('collect', 'split'),
      END,
    ]);
    const cases: [string, FlowDefinition, unknown, unknown, unknown][] = [
      ['"."', entryMap('NumIt', { it: '.' }), { items: [1, 2] }, { items: [1, 'two'] }, { it: 1 }],
      ['"$item"', entryMap('NumIt', { it: '$item' }), { items: [1, 2] }, { items: [1, 'two'] }, { it: 1 }],
      ['"$payload"', entryMap('Tagged', { run: '$payload' }), { items: [1, 2], tag: 't' }, { items: [1, 2] }, { run: { items: [1, 2], tag: 't' } }],
    ];
    for (const [label, def, good, bad, want] of cases) {
      const g = make(def);
      g.driver.start(good);
      equal(g.sch.ids(), ['r1:each:0:0', 'r1:each:1:0'], `${label}: a payload that fits STARTS — two instances`);
      equal(g.sch.inputOf('r1:each:0:0'), want, `${label}: composed as the boundary held it`);
      const b = make(def);
      let refused: unknown = null;
      try { b.driver.start(bad); } catch (e) { refused = e; }
      ok(refused instanceof BoundaryRefused, `${label}: a payload that does not fit is BoundaryRefused — got ${String(refused)}`);
      equal([(refused as BoundaryRefused).nodeId, b.sch.ids(), b.driver.foldInputs().length], ['each', [], 0], `${label}: naming the branch task, nothing dispatched or appended`);
    }
  });

  test(DECLARED_CASES[15]!, () => {
    const shape = (needs: Record<string, unknown>) => flow('same', 'ingest', [
      task('ingest', 'split'),
      { id: 'split', kind: 'map', over: 'items', branch: 'a' },
      task('a', 'b'),
      task('b', 'collect', { needs }),
      join('collect', 'split'),
      END,
    ]);
    const drive = (needs: Record<string, unknown>) => {
      const m = make(shape(needs));
      m.driver.start({ v: 1 });
      m.sch.done('r1:ingest:-:0', { items: ['p', 'q'] });
      for (const i of [0, 1]) m.sch.done(`r1:a:${i}:0`, { from: `a${i}` });
      for (const i of [1, 0]) m.sch.done(`r1:b:${i}:0`, null);
      return m;
    };
    const plain = drive({ prev: '.' });
    const both = drive({ prev: '.', it: '$item' });
    equal(plain.driver.foldInputs(), both.driver.foldInputs(), 'the same fold inputs, element for element (decision 5: nothing in the log)');
    equal(['r1:b:0:0', 'r1:b:1:0'].map((id) => plain.sch.inputOf(id)), [{ prev: { from: 'a0' } }, { prev: { from: 'a1' } }], 'the plain flow`s b: a`s result');
    equal(['r1:b:0:0', 'r1:b:1:0'].map((id) => both.sch.inputOf(id)), [{ prev: { from: 'a0' }, it: 'p' }, { prev: { from: 'a1' }, it: 'q' }],
      'and with the key: the same `prev`, and the item beside it');
    equal([fold(plain.driver.foldInputs()).outcome, held(plain.driver), held(both.driver)], ['completed', {}, {}], 'both complete, and neither holds anything at the end');
  });

  test(DECLARED_CASES[16]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
