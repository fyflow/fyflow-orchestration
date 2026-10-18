/**
 * Ladder L2 — **`"$payload"` composed: the run's payload as a reference, at every site a run composes `needs`** —
 * `spec/flow-definition.md` v0.44 `FD-C1`, `FD-C3` and `FD-R4`, [ADR 0117](../../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md),
 * [P38](../../doc/plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) stop-and-asks (d), (f), (l)
 * and (m), facts 2, 4, 6 and 8, decisions 2, 4 and 5; [W190](../../doc/work-items/w190-the-runs-payload-as-a-reference.md).
 *
 * **Every expected value is written from those rows, never read off a run**: a `"$payload"` key is the value `start()`
 * was handed — at the entry, two hops on, on a map node (whose `over` is then read off it), on an ask (whose `asked`
 * element keeps the copy, (m)) and on an edge (whose predicate routes on it) — each its OWN deep copy per key per read
 * (decision 4); `FD-R4` composes it from the CALLER's value, before the header exists (f); a resume composes it from the
 * stored header and writes nothing new (decision 5); and a flow that names it nowhere is unchanged (decision 2). The
 * COPY claim is provoked by an ALIAS and by a SHALLOW copy over a NESTED payload, read both ways (P38's brief sentence).
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { BoundaryRefused, Driver, NotStarted } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — W190: "$payload" composed at every site — the entry, two hops on, a map node, an ask, an edge, FD-R4 and a resume, each its own copy';

/** A scheduler double: it RECORDS every `addTask` and fires nothing on its own. */
class Fake {
  readonly added: { id: string; payload: { input?: unknown } }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string; payload: { input?: unknown } }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
  ids(): string[] { return this.added.map((t) => t.id); }
  inputOf(id: string): unknown { return this.added.find((t) => t.id === id)?.payload?.input; }
  done(id: string, result: unknown): void {
    const detail = { id, state: 'done', result, error: null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

const AMOUNT_IN: JsonSchema = { type: 'object', required: ['run'], properties: { run: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' } } } } };
const ITEM_IN: JsonSchema = { type: 'number' };
const TYPES = typesFor(['T'], { Checked: { worker: 'checked' }, PerItem: { worker: 'perItem' } },
  { checked: { url: 'test://checked', inputSchema: AMOUNT_IN }, perItem: { url: 'test://perItem', inputSchema: ITEM_IN } });

function make(def: FlowDefinition, predicates: Map<string, (c: DecisionContext) => boolean> = new Map(), runId = 'r1') {
  const sch = new Fake();
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId, scheduler: sch as never, createTask: (c) => c as never, predicates, now: () => 42,
    joinPolicy: liveToken as unknown as JoinPolicy, ...TYPES,
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); },
  });
  return { driver, sch, failures };
}
const flow = (flowId: string, entry: string, nodes: unknown[]): FlowDefinition => ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const task = (id: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type: 'T', edges: [{ to }], ...extra });

/** A NESTED payload, so a shallow copy is distinguishable from a deep one (P38's brief sentence). */
const nested = () => ({ invoice: { id: 'INV-1', amount: 120, lines: [{ sku: 'a', qty: 1 }] } });

const DECLARED_CASES = [
  'the ENTRY: a "$payload" key is the value start() was handed, its own copy — distinct from the "." key`s beside it',
  'TWO HOPS ON: a "$payload" key is the run`s payload, never the predecessor`s result — and a node declaring none receives what it did',
  'a MAP node: its `over` is read off the composed object, so the ARITY is the payload`s and not the predecessor`s',
  'an ASK: what reached it carries the copy — its `asked` element`s input and the node`s kept input (P38 (m))',
  'the app`s case 1: an ENTRY ask, and its successor reaches the invoice the run started with beside the person`s answer',
  'an EDGE: a declared predicate routes on needs.run.amount, both ways, with no task before the decision',
  'FD-R4 at start(): a "$payload" key is composed from the CALLER`s value before the header exists — refused with the driver unstarted, accepted when it fits',
  'a RESUME on a fresh driver composes the same value — the header five keys at format 1, and no fold-input kind the "." control lacks',
  'the COPY claim over a NESTED payload, read both ways: the caller`s object after start(), and a worker`s and a predicate`s nested write to what they received',
  'a flow naming "$payload" nowhere is unchanged — its fold inputs and dispatched inputs equal the same flow`s without the key, the key aside',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('the ENTRY: a "$payload" key is the value start() was handed, its own copy — distinct from the "." key`s beside it', () => {
    const m = make(flow('entry', 'x', [task('x', 'done', { needs: { run: '$payload', own: '.' } }), END]));
    const payload = nested();
    m.driver.start(payload);
    const got = m.sch.inputOf('r1:x:-:0') as { run: unknown; own: unknown };
    equal(got, { run: nested(), own: nested() }, 'both keys are the payload — at the entry "." and "$payload" are one value (P38 (d))');
    ok(got.run !== got.own && got.run !== payload && got.own !== payload, 'and three different objects: each key its own copy, neither the caller`s');
  });

  test('TWO HOPS ON: a "$payload" key is the run`s payload, never the predecessor`s result — and a node declaring none receives what it did', () => {
    const m = make(flow('hops', 'a', [task('a', 'b'), task('b', 'c'), task('c', 'done', { needs: { run: '$payload', prev: '.' } }), END]));
    m.driver.start({ tenant: 't-7', threshold: 3 });
    m.sch.done('r1:a:-:0', { from: 'a' });
    equal(m.sch.inputOf('r1:b:-:0'), { from: 'a' }, 'the CONTROL: b declares nothing and receives a`s result (FD-C1 rule 1)');
    m.sch.done('r1:b:-:0', { from: 'b' });
    equal(m.sch.inputOf('r1:c:-:0'), { run: { tenant: 't-7', threshold: 3 }, prev: { from: 'b' } },
      'c: the run`s payload under `run`, b`s result under `prev` — two hops on, nothing passed it through (the app`s case 3)');
    equal(m.failures, [], 'nothing reported');
    // A run started with `null`: the payload IS `null`, and "$payload" composes `null` — never a fallback to the edge's
    // value (W190's adequacy reader, A3: `runPayload ?? edgeValue` survived).
    const n = make(flow('hops', 'a', [task('a', 'b'), task('b', 'c'), task('c', 'done', { needs: { run: '$payload', prev: '.' } }), END]));
    n.driver.start(null);
    n.sch.done('r1:a:-:0', { from: 'a' });
    n.sch.done('r1:b:-:0', { from: 'b' });
    equal(n.sch.inputOf('r1:c:-:0'), { run: null, prev: { from: 'b' } }, 'a null payload: `run` is null, present, and not b`s result');
  });

  test('a MAP node: its `over` is read off the composed object, so the ARITY is the payload`s and not the predecessor`s', () => {
    const m = make(flow('map', 'ingest', [
      task('ingest', 'split'),
      { id: 'split', kind: 'map', over: 'items', branch: 'score', needs: { items: '$payload' } },
      task('score', 'collect'),
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ]));
    m.driver.start(['p', 'q', 'r']);
    // ingest returns an `items` list of TWO: a map reading `over` off what ingest returned would open two instances;
    // reading it off the run's payload — three elements — opens three, each its own item (JP-R11).
    m.sch.done('r1:ingest:-:0', { items: ['i1', 'i2'] });
    equal(m.sch.ids(), ['r1:ingest:-:0', 'r1:score:0:0', 'r1:score:1:0', 'r1:score:2:0'], 'three instances — the payload`s arity');
    equal(['r1:score:0:0', 'r1:score:1:0', 'r1:score:2:0'].map((id) => m.sch.inputOf(id)), ['p', 'q', 'r'], 'each instance its own element');
    equal(m.failures, [], 'and no UnresolvedMapArity — a "$payload" key read as "." would put ingest`s whole object under `items`');
  });

  test('an ASK: what reached it carries the copy — its `asked` element`s input and the node`s kept input (P38 (m))', () => {
    const m = make(flow('ask', 'draft', [
      task('draft', 'approve'),
      { id: 'approve', kind: 'ask', needs: { draft: '.', request: '$payload' }, edges: [{ to: 'done' }] },
      END,
    ]));
    m.driver.start({ topic: 'release notes' });
    m.sch.done('r1:draft:-:0', { text: 'a draft' });
    const asked = m.driver.foldInputs().filter((e) => e.kind === 'asked') as { input: unknown }[];
    const want = { draft: { text: 'a draft' }, request: { topic: 'release notes' } };
    equal(asked.map((e) => e.input), [want], 'one `asked` element, the payload composed into what the person is shown — a copy in the LOG (m)');
    equal(fold(m.driver.foldInputs()).nodes['r1:approve:-:0']?.input, want, 'and the node keeps it as `input`');
    equal(m.sch.ids(), ['r1:draft:-:0'], 'nothing handed to the scheduler for the ask');
  });

  test('the app`s case 1: an ENTRY ask, and its successor reaches the invoice the run started with beside the person`s answer', () => {
    const app = (invoiceRef: string) => flow('pay', 'approve', [
      { id: 'approve', kind: 'ask', answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
        edges: [{ to: 'pay' }] },
      task('pay', 'done', { needs: { invoice: invoiceRef, answer: 'approve' } }),
      END,
    ]);
    const m = make(app('$payload'));
    m.driver.start({ id: 'INV-1', amount: 120 });
    ok(m.driver.resolve('r1:approve:-:0', 'done', { result: { approved: true }, actor: 'ana' }), 'the answer is accepted');
    equal(m.sch.inputOf('r1:pay:-:0'), { invoice: { id: 'INV-1', amount: 120 }, answer: { approved: true } },
      '`pay` receives the invoice AND the answer — with no task before the ask (P38 fact 3`s road, retired)');
    // The CONTROL, P38 fact 2: with "." in its place `pay` receives the ANSWER twice — no reference reached the payload.
    const dot = make(app('.'));
    dot.driver.start({ id: 'INV-1', amount: 120 });
    dot.driver.resolve('r1:approve:-:0', 'done', { result: { approved: true }, actor: 'ana' });
    equal(dot.sch.inputOf('r1:pay:-:0'), { invoice: { approved: true }, answer: { approved: true } }, '"." is what the edge carried — the answer');
  });

  test('an EDGE: a declared predicate routes on needs.run.amount, both ways, with no task before the decision', () => {
    const routed = flow('route', 'approve', [
      { id: 'approve', kind: 'ask', edges: [
        { when: { path: 'needs.run.amount', op: 'gt', value: 100 }, to: 'review', needs: { run: '$payload' } },
        { to: 'pay' },
      ] },
      task('review', 'pay'),
      task('pay', 'done'),
      END,
    ]);
    const run = (amount: number, runId: string) => {
      const m = make(routed, new Map(), runId);
      m.driver.start({ id: 'INV-1', amount });
      m.driver.resolve(`${runId}:approve:-:0`, 'done', { result: { approved: true }, actor: 'ana' });
      return m.sch.ids();
    };
    equal(run(120, 'big'), ['big:review:-:0'], '120 > 100: the guarded edge, to review');
    equal(run(50, 'small'), ['small:pay:-:0'], '50: the default, to pay — the same document, the payload alone decides');
  });

  test('FD-R4 at start(): a "$payload" key is composed from the CALLER`s value before the header exists — refused with the driver unstarted, accepted when it fits', () => {
    const entry = flow('fdr4', 'x', [{ id: 'x', kind: 'task', type: 'Checked', needs: { run: '$payload' }, edges: [{ to: 'done' }] }, END]);
    const m = make(entry);
    let refused: unknown = null;
    try { m.driver.start({ amount: 'not a number' }); } catch (e) { refused = e; }
    ok(refused instanceof BoundaryRefused, `a payload whose composed "$payload" key the inputSchema refuses: BoundaryRefused — got ${String(refused)}`);
    ok((refused as BoundaryRefused).message.includes('$.run.amount'), 'and the finding is about the COMPOSED key — `$.run.amount`');
    equal([m.sch.ids(), m.driver.foldInputs().length], [[], 0], 'nothing dispatched, nothing appended');
    let unstarted = false;
    try { m.driver.checkpoint(); } catch (e) { unstarted = e instanceof NotStarted; }
    ok(unstarted, 'the driver is UNSTARTED — the header never existed, so the boundary could not have read it');
    // Accepted on the SAME driver: the composed value FITS — and it fits only if the key was composed from the
    // caller's value, because no header exists while FD-R4 runs (P38 (f)): read from the header, `run` is undefined.
    m.driver.start({ amount: 3 });
    equal(m.sch.inputOf('r1:x:-:0'), { run: { amount: 3 } }, 'a corrected payload starts the same driver, composed as the boundary held it');
    // And through an ENTRY MAP whose `over` is read off a "$payload" key: the walk composes it, element by element.
    const mapped = flow('fdr4-map', 'split', [
      { id: 'split', kind: 'map', over: 'items', branch: 'each', needs: { items: '$payload' } },
      // `each` declares no `needs` of its own: a map-branch task that does is composed at FD-R4 with no item index and
      // throws `UnresolvedBranchPath` — on `86b0c7c` too, for a `"."` key (W190's S-1; answered by the maintainer 2026-10-19: W191 fixes it and adds a
      // `"."` and a `"$payload"` regression case here).
      { id: 'each', kind: 'task', type: 'PerItem', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ]);
    const bad = make(mapped);
    let second: unknown = null;
    try { bad.driver.start([1, 'two', 3]); } catch (e) { second = e; }
    ok(second instanceof BoundaryRefused && (second as BoundaryRefused).nodeId === 'each', 'the element the schema refuses is found through the "$payload" key');
    const good = make(mapped);
    good.driver.start([1, 2, 3]);
    equal(good.sch.ids(), ['r1:each:0:0', 'r1:each:1:0', 'r1:each:2:0'], 'and a list that fits starts three instances');
  });

  test('a RESUME on a fresh driver composes the same value — the header five keys at format 1, and no fold-input kind the "." control lacks', () => {
    const resumable = (ref: string) => flow('resume', 'a', [
      task('a', 'approve'),
      { id: 'approve', kind: 'ask', needs: { inv: ref, prev: '.' }, edges: [{ to: 'pay' }] },
      task('pay', 'done', { needs: { invoice: ref, answer: 'approve' } }),
      END,
    ]);
    // The UNINTERRUPTED control: the same run answered on the driver that started it.
    const control = make(resumable('$payload'));
    control.driver.start(nested());
    control.sch.done('r1:a:-:0', { from: 'a' });
    control.driver.resolve('r1:approve:-:0', 'done', { result: { ok: true }, actor: 'ana' });
    // The STORED run: parked at the ask, checkpointed, resumed on a FRESH driver and scheduler.
    const first = make(resumable('$payload'));
    first.driver.start(nested());
    first.sch.done('r1:a:-:0', { from: 'a' });
    const cp = structuredClone(first.driver.checkpoint());
    equal(Object.keys(cp.header).sort(), ['entryPayload', 'flowId', 'format', 'runId', 'version'], 'the header: the same five keys (decision 5)');
    equal(cp.header.format, 1, 'at format 1 — CHECKPOINT_FORMAT unmoved');
    const again = make(resumable('$payload'));
    again.driver.resume(cp);
    // The STORE's object written after the resume, nested: the resumed run holds its own copy of the stored header's
    // payload (W190's adequacy reader, A2 — an alias of `checkpoint.header.entryPayload` survived here).
    (cp.header.entryPayload as ReturnType<typeof nested>).invoice.lines[0]!.sku = 'from-the-store';
    equal(again.failures, [], 'the replay REGENERATED the `asked` element with the "$payload" key — no `diverged`');
    ok(again.driver.resolve('r1:approve:-:0', 'done', { result: { ok: true }, actor: 'ana' }), 'answered on the fresh driver');
    equal(again.sch.inputOf('r1:pay:-:0'), control.sch.inputOf('r1:pay:-:0'), 'pay receives what the uninterrupted run`s pay received');
    equal(again.sch.inputOf('r1:pay:-:0'), { invoice: nested(), answer: { ok: true } }, 'which is the invoice the run started with');
    // Nothing new is written: the resumed log holds no kind the same resume of a "." flow does not (decision 5).
    const dot = make(resumable('.'));
    dot.driver.start(nested());
    dot.sch.done('r1:a:-:0', { from: 'a' });
    const dotAgain = make(resumable('.'));
    dotAgain.driver.resume(structuredClone(dot.driver.checkpoint()));
    dotAgain.driver.resolve('r1:approve:-:0', 'done', { result: { ok: true }, actor: 'ana' });
    const kindsOf = (d: Driver) => d.foldInputs().map((e: FoldInput) => e.kind);
    equal(kindsOf(again.driver), kindsOf(dotAgain.driver), 'the same fold-input KINDS, in the same order, as the "." control`s resume');
  });

  test('the COPY claim over a NESTED payload, read both ways: the caller`s object after start(), and a worker`s and a predicate`s nested write to what they received', () => {
    // a's EDGE carries a "$payload" key to a registered predicate that WRITES into what it was handed; a's task does too.
    // It writes `run` and then READS `also`, a second "$payload" key on the same edge: one copy per KEY, not per edge
    // (W190's adequacy reader, A1).
    const sawAlso: unknown[] = [];
    const writes = new Map<string, (c: DecisionContext) => boolean>([['scribble', (ctx) => {
      (ctx.needs.run as ReturnType<typeof nested>).invoice.lines[0]!.sku = 'from-the-predicate';
      sawAlso.push(structuredClone(ctx.needs.also));
      return false;
    }]]);
    const m = make(flow('copies', 'a', [
      { id: 'a', kind: 'task', type: 'T', needs: { run: '$payload' },
        edges: [{ when: { predicate: 'scribble' }, to: 'done', needs: { run: '$payload', also: '$payload' } }, { to: 'b' }] },
      task('b', 'done', { needs: { run: '$payload', also: '$payload' } }),
      END,
    ]), writes);
    const caller = nested();
    m.driver.start(caller);
    // DIRECTION 1 — the SOURCE written after the copy: the caller mutates its own payload, nested, after start().
    caller.invoice.lines[0]!.qty = 99;
    // DIRECTION 2 — the COPY written: a's worker writes into what it RECEIVED, nested (an inline worker holds the object).
    const aRun = (m.sch.inputOf('r1:a:-:0') as { run: ReturnType<typeof nested> }).run;
    equal(aRun, nested(), 'a received the payload as it was at start() — the caller`s later write is not in it');
    aRun.invoice.lines[0]!.sku = 'from-a-worker';
    m.sch.done('r1:a:-:0', null);
    equal(sawAlso, [nested()], 'the predicate`s write into `run` is not in `also` beside it on the same edge — one copy per KEY');
    const bIn = m.sch.inputOf('r1:b:-:0') as { run: ReturnType<typeof nested>; also: ReturnType<typeof nested> };
    const bRun = bIn.run;
    ok(bIn.also !== bIn.run && bIn.also.invoice !== bIn.run.invoice && bIn.also.invoice.lines !== bIn.run.invoice.lines,
      'and two "$payload" keys on ONE node share no object at any depth — one copy per KEY (A1)');
    equal(bRun, nested(), 'b receives the ORIGINAL — neither the caller`s write, nor a`s worker`s, nor the predicate`s reached it');
    equal(m.driver.checkpoint().header.entryPayload, nested(), 'and the header — the one retained copy — is untouched by all three');
    ok(bRun !== aRun && bRun.invoice !== aRun.invoice && bRun.invoice.lines !== aRun.invoice.lines,
      'and b`s copy shares no object with a`s at any depth — an ALIAS or a SHALLOW copy fails here');
    equal(m.failures, [], 'nothing reported');
  });

  test('a flow naming "$payload" nowhere is unchanged — its fold inputs and dispatched inputs equal the same flow`s without the key, the key aside', () => {
    // The `needs` is on `b`, AFTER the entry, so its "." is a's RESULT and not the payload — an edit composing "." from the
    // run's payload is visible here (W190's adequacy reader, A4: at the entry the two are one value).
    const shape = (needs: Record<string, unknown>) => flow('same', 'a', [task('a', 'b'), task('b', 'done', { needs }), END]);
    const drive = (needs: Record<string, unknown>) => {
      const m = make(shape(needs));
      m.driver.start({ v: 1 });
      m.sch.done('r1:a:-:0', { from: 'a' });
      m.sch.done('r1:b:-:0', null);
      return m;
    };
    const plain = drive({ own: '.' });
    const both = drive({ own: '.', run: '$payload' });
    equal(plain.driver.foldInputs(), both.driver.foldInputs(), 'the same fold inputs, element for element (decision 5: nothing in the log)');
    equal([plain.sch.inputOf('r1:a:-:0'), both.sch.inputOf('r1:a:-:0')], [{ v: 1 }, { v: 1 }], 'a, declaring nothing, the payload in both');
    equal(plain.sch.inputOf('r1:b:-:0'), { own: { from: 'a' } }, 'the "." flow`s b: a`s result, what it received before v0.44');
    equal(both.sch.inputOf('r1:b:-:0'), { own: { from: 'a' }, run: { v: 1 } }, 'and with the key: the same `own`, and the run`s payload beside it');
    equal(fold(plain.driver.foldInputs()).outcome, 'completed', 'and both complete');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
