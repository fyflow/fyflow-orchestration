/**
 * Ladder L2 — **a reference's value is ONE deep-frozen copy shared by every reader** — `spec/flow-definition.md` v0.47
 * `FD-C1` and `FD-C3`, `spec/run-state.md` v0.33 `RN-R13`,
 * [ADR 0126](../../doc/decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md),
 * [P41](../../doc/plans/p41-what-a-reference-to-a-large-value-costs-inside-a-map.md) decisions 1-6 and stop-and-asks (a)-(c),
 * (f2), (g1); [W202](../../doc/work-items/w202-one-shared-copy-per-output-read.md).
 *
 * **Every expected value is written from those rows, never read off a run**: the first read of an output entry makes ONE
 * deep copy of its result, deep-frozen, and every later read of that entry — any reader, a node's `needs` or an edge's,
 * `"n"`, `["n"]`, either with `?` — is handed that object (decision 1); an `all` answer is a FRESH array of those copies;
 * `"$payload"` is one such copy of the header's payload per run (decision 2); the stored record is untouched and
 * unfrozen (decision 4); a write into a freezable referenced value THROWS — an inline worker's (its attempt), a predicate's
 * (the run) — and in the named GAP it does not: a typed array or `DataView` is shared UNFROZEN and never handed to
 * `Object.freeze`, a `Map`, `Set`, `Date` or `ArrayBuffer` is frozen SHALLOWLY, and a write through each reaches every
 * reader (f2). `"."` and `"$item"` keep their per-key clone ((b)).
 *
 * **The oracle is the spec and a hand-written value**, never another read through the package: a shared copy compared
 * with `===` to another read proves SHARING, not the value — so every value claim here also holds the hand-written
 * expected value (P40's retro (a), carried by P41). The private counter `outputsCache.copies` is read by a cast and
 * shares `sharedOf` / `sharedPayload` with its subject; it is never the only observer of a claim.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — W202, ADR 0126: a reference`s value is ONE deep-frozen copy shared by every reader — both sites, every form, "$payload", the stored record untouched, the named gap pinned';

/** A scheduler double: it RECORDS every `addTask` and fires only what a case tells it to. */
class Fake {
  readonly added: { id: string; payload: { input?: unknown } }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string; payload: { input?: unknown } }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
  ids(): string[] { return this.added.map((t) => t.id); }
  inputOf(id: string): Record<string, unknown> { return this.added.find((t) => t.id === id)?.payload?.input as Record<string, unknown>; }
  fire(type: string, detail: Record<string, unknown>): void {
    const d = { attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, error: null, ...detail };
    for (const fn of this.listeners.get(type) ?? []) fn({ detail: d });
  }
  done(id: string, result: unknown): void { this.fire('task.completed', { id, state: 'done', result }); }
}

const TYPES = typesFor(['T'], {}, {});

function make(def: FlowDefinition, predicates: Map<string, (c: DecisionContext) => boolean> = new Map(), runId = 'r1') {
  const sch = new Fake();
  const failures: { kind: string; message: string }[] = [];
  const driver = new Driver(def, {
    runId, scheduler: sch as never, createTask: (c) => c as never, predicates, now: () => 42,
    joinPolicy: liveToken as unknown as JoinPolicy, ...TYPES,
    onRunFailure: (f) => { failures.push({ kind: f.kind, message: f.message }); },
  });
  return { driver, sch, failures };
}
const flow = (flowId: string, entry: string, nodes: unknown[]): FlowDefinition => ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
const END = { id: 'done', kind: 'end', outcome: 'completed' };

/** The driver's private projection, read by a cast — never a public surface (ADR 0121 rule 7). */
interface Cache {
  copies: number;
  payload: { value: unknown } | null;
  byNode: Map<string, { path: string; result: unknown; shared?: unknown }[]>;
}
const cacheOf = (d: Driver) => (d as unknown as { outputsCache: Cache | null }).outputsCache;
const copiesOf = (d: Driver) => cacheOf(d)?.copies ?? 0;
/** The driver's OWN stored record of a task — the log's object, by reference. */
const storedOf = (d: Driver, taskId: string) =>
  (d as unknown as { log: { taskId: string; result?: unknown }[] }).log.filter((r) => r.taskId === taskId).at(-1)!;

/** What `fetch` returns, nested — so a shallow freeze is told apart from a deep one. */
const FETCHED = () => ({ items: [{ n: 0 }, { n: 1 }, { n: 2 }], deep: { tag: 'original', list: [1, 2] } });

/**
 * **The fetch-then-map shape, every reader at once**: each map instance's `work` reads `fetch` and `"$payload"` on its
 * node AND on its guarded edge (whose predicate records `ctx.needs` and declines); after the join, `after` reads `fetch`
 * and `["work"]` under two keys, and `after2` reads `["work"]` again.
 */
const FETCH_MAP = flow('fetch-map', 'fetch', [
  { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
  { id: 'split', kind: 'map', over: 'items', branch: 'work' },
  {
    id: 'work', kind: 'task', type: 'T', needs: { item: '$item', f: 'fetch', run: '$payload' },
    edges: [{ when: { predicate: 'look' }, to: 'collect', needs: { f: 'fetch', run: '$payload' } }, { to: 'collect' }],
  },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
  { id: 'after', kind: 'task', type: 'T', needs: { f: 'fetch', a: ['work'], b: ['work'] }, edges: [{ to: 'after2' }] },
  { id: 'after2', kind: 'task', type: 'T', needs: { a: ['work'], c: ['work?'] }, edges: [{ to: 'done' }] },
  END,
]);

/** Drive FETCH_MAP to its end: `fetch`, the three `work`s, `after`, `after2`. */
function driveFetchMap(payload: unknown = { tenant: 't1', deep: { k: 1 } }) {
  const seen: Record<string, unknown>[] = [];
  const m = make(FETCH_MAP, new Map([['look', (ctx) => { seen.push(ctx.needs as Record<string, unknown>); return false; }]]));
  m.driver.start(payload);
  m.sch.done('r1:fetch:-:0', FETCHED());
  for (const i of [0, 1, 2]) m.sch.done(`r1:work:${i}:0`, { w: i, deep: { i } });
  m.sch.done('r1:after:-:0', null);
  m.sch.done('r1:after2:-:0', null);
  return { ...m, seen };
}

const DECLARED_CASES = [
  'every reader of one output is handed ONE frozen copy — the instances, their edges and a node after the join, equal to the value by hand',
  '"$payload" is ONE frozen copy per run, at both sites — not the header`s, and another run`s is another object',
  'an INLINE-shaped write into a referenced value THROWS TypeError, nested at any depth — and a write into the reader`s own "$item" or composed object lands',
  'a PREDICATE writing into a referenced value stops the run with the TypeError — the same write into its own "$item" does not',
  'an `all` answer is a FRESH array per read whose elements are the outputs` shared copies',
  'a CONDITIONAL reference, both arms: present it is the shared copy at both sites, absent the key is not there and nothing is copied',
  'a REPLACED output`s copy and a REMOVED one`s go with their entry — the next read makes a new one, and the driver holds the old nowhere',
  'a RESUMED driver makes its copies afresh — equal values, other objects, counted from zero',
  'the GAP, pinned per type: a typed array and a DataView shared UNFROZEN, a Map, Set, Date and ArrayBuffer frozen SHALLOWLY, a write through each reaching every reader — beside a freezable control that throws',
  'every reader at ANY depth and in every form shares it — a reader of its own instance`s output at both sites, readers two maps deep, and `["n?"]` beside `["n"]`',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const m = driveFetchMap();
    equal(m.failures, [], 'the run did not stop');
    equal(fold(m.driver.foldInputs()).outcome, 'completed', 'and it completed — the arrangement');
    const ins = [0, 1, 2].map((i) => m.sch.inputOf(`r1:work:${i}:0`));
    const after = m.sch.inputOf('r1:after:-:0');
    // The VALUE, by hand (FD-C1's table): `fetch`'s result, whole.
    equal(ins.map((x) => x.f), [FETCHED(), FETCHED(), FETCHED()], 'each instance`s `f` is fetch`s result — the value, by hand');
    equal(after.f, FETCHED(), 'and so is after`s');
    equal(m.seen.map((n) => n.f), [FETCHED(), FETCHED(), FETCHED()], 'and each edge predicate`s ctx.needs.f');
    // The IDENTITY: one object for every reader, at both sites (ADR 0126 rule 1, P41 (g1)).
    const shared = ins[0]!.f;
    ok(ins.every((x) => x.f === shared), 'three instances: ONE object');
    ok(m.seen.every((n) => n.f === shared), 'their three edges: the same object — one resolver (ADR 0041 rule 4)');
    ok(after.f === shared, 'and the node after the join: the same object');
    // Frozen at every depth the walk reaches (ADR 0126 rule 2).
    const f = shared as ReturnType<typeof FETCHED>;
    ok([f, f.items, f.items[0], f.items[2], f.deep, f.deep.list].every((x) => Object.isFrozen(x)), 'frozen: the object, its array, the array`s elements, a nested object and ITS array');
    // Never the stored record (decision 4): a SECOND copy, and the record stays unfrozen.
    const stored = storedOf(m.driver, 'r1:fetch:-:0').result;
    ok(stored !== shared && !Object.isFrozen(stored) && !Object.isFrozen((stored as ReturnType<typeof FETCHED>).deep), 'not the log`s record, which stays unfrozen at every depth');
    equal(m.driver.snapshot().find((r) => r.taskId === 'r1:fetch:-:0')!.result, FETCHED(), 'and what snapshot() hands out is the value, as before');
    // `"$item"` keeps its per-key clone ((b)): each instance its own, unfrozen.
    equal(ins.map((x) => x.item), [{ n: 0 }, { n: 1 }, { n: 2 }], 'each instance`s "$item" — its own element');
    ok(ins[0]!.item !== f.items[0] && !Object.isFrozen(ins[0]!.item), '"$item" is its OWN copy, unfrozen — not the shared value`s element');
    // The count — what it counts, derived: `fetch`'s one entry (1), the run's payload (1), and the three `work` entries
    // `after`'s `["work"]` first reads (3) — 5. Every other read reuses one of those five.
    equal(copiesOf(m.driver), 5, 'outputsCache.copies: 1 (fetch) + 1 ("$payload") + 3 (work@0..2) — one per distinct output read');
  });

  test(DECLARED_CASES[1]!, () => {
    const payload = { tenant: 't1', deep: { k: 1 } };
    const m = driveFetchMap(payload);
    const ins = [0, 1, 2].map((i) => m.sch.inputOf(`r1:work:${i}:0`));
    equal(ins.map((x) => x.run), [payload, payload, payload], 'the VALUE: the payload start() was handed, by hand');
    const run = ins[0]!.run as typeof payload;
    ok(ins.every((x) => x.run === run) && m.seen.every((n) => n.run === run), 'ONE object across the three instances and their three edges — both sites');
    ok(Object.isFrozen(run) && Object.isFrozen(run.deep), 'deep-frozen');
    ok(run !== payload, 'not the caller`s object');
    const header = (m.driver as unknown as { header: { entryPayload: unknown } }).header;
    ok(header.entryPayload !== run && !Object.isFrozen(header.entryPayload), 'nor the header`s own copy, which stays unfrozen (RN-R15 untouched)');
    equal(cacheOf(m.driver)!.payload, { value: payload }, 'held ONCE, inside the projection — no new driver field (P41 prediction 3)');
    const other = driveFetchMap(payload);
    const otherRun = other.sch.inputOf('r1:work:0:0').run;
    equal(otherRun, payload, 'another run of the same flow: the same VALUE');
    ok(otherRun !== run, 'and another object — the copy is per RUN');
  });

  test(DECLARED_CASES[2]!, () => {
    const m = make(FETCH_MAP, new Map([['look', () => false]]));
    m.driver.start({ tenant: 't1' });
    m.sch.done('r1:fetch:-:0', FETCHED());
    const input = m.sch.inputOf('r1:work:1:0') as { item: { n: number }; f: ReturnType<typeof FETCHED>; run: { tenant: string }; mine?: number };
    // What an INLINE pool's worker holds is this very object (fact 6); an ES module is strict, so is this file.
    const attempt = (write: () => void) => { try { write(); return 'LANDED'; } catch (e) { return (e as Error).constructor.name; } };
    equal([
      attempt(() => { input.f.deep.tag = 'by-a-worker'; }),
      attempt(() => { input.f.items.push({ n: 9 }); }),
      attempt(() => { input.f.items[0]!.n = 9; }),
      attempt(() => { (input.f as { extra?: number }).extra = 1; }),
      attempt(() => { input.run.tenant = 'x'; }),
    ], ['TypeError', 'TypeError', 'TypeError', 'TypeError', 'TypeError'],
    'a write into the shared value — a nested field, an array push, an element`s field, a new key, the "$payload" copy — each THROWS TypeError (ADR 0126 rule 3)');
    // The CONTROLS on the same observer: the reader's own objects take the same kinds of write.
    equal([
      attempt(() => { input.item.n = 9; }),
      attempt(() => { input.mine = 1; }),
    ], ['LANDED', 'LANDED'], 'the CONTROL: its own "$item" and its own composed object take a write — the throw above is the freeze');
    const sibling = m.sch.inputOf('r1:work:2:0') as { f: ReturnType<typeof FETCHED>; item: { n: number } };
    equal([sibling.f, sibling.item], [FETCHED(), { n: 2 }], 'and nothing reached a sibling — the shared value as fetched, its own item');
  });

  test(DECLARED_CASES[3]!, () => {
    const SCRIBBLE = (key: 'f' | 'item') => flow('scribble', 'fetch', [
      { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'work' },
      { id: 'work', kind: 'task', type: 'T', edges: [{ when: { predicate: 'scribble' }, to: 'collect', needs: { [key]: key === 'f' ? 'fetch' : '$item' } }, { to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ]);
    const drive = (key: 'f' | 'item') => {
      const m = make(SCRIBBLE(key), new Map([['scribble', (ctx) => {
        const v = ctx.needs[key] as { deep?: { tag: string }; n?: number };
        if (key === 'f') v.deep!.tag = 'by-a-predicate';
        else v.n = 99;
        return false;
      }]]));
      m.driver.start({});
      m.sch.done('r1:fetch:-:0', FETCHED());
      m.sch.done('r1:work:0:0', { w: 0 });
      return m;
    };
    const hit = drive('f');
    equal(hit.failures.map((f) => f.kind), ['TypeError'], 'the predicate`s write into its referenced value THREW, and the run reported it once — as the TypeError (P41 (g1))');
    equal(fold(hit.driver.foldInputs()).outcome, 'halted', 'and the run is STOPPED — a throwing predicate halts it (spec/flow-definition.md, ADR 0002 rule 4 now partly enforced)');
    equal(hit.sch.ids().filter((id) => id.startsWith('r1:work:')).length, 3, 'the arrangement: the three instances had been dispatched');
    const control = drive('item');
    equal(control.failures, [], 'the CONTROL: the same write into its own "$item" lands, and nothing is reported');
    for (const i of [1, 2]) control.sch.done(`r1:work:${i}:0`, { w: i });
    equal(fold(control.driver.foldInputs()).outcome, 'completed', 'and that run completes');
  });

  test(DECLARED_CASES[4]!, () => {
    const m = driveFetchMap();
    const after = m.sch.inputOf('r1:after:-:0') as { a: unknown[]; b: unknown[] };
    const after2 = m.sch.inputOf('r1:after2:-:0') as { a: unknown[]; c: unknown[] };
    const W = [{ w: 0, deep: { i: 0 } }, { w: 1, deep: { i: 1 } }, { w: 2, deep: { i: 2 } }];
    equal([after.a, after.b, after2.a], [W, W, W], 'the VALUE: work`s three outputs in branch-path order, by hand');
    ok(after.a !== after.b && after.a !== after2.a, 'each read`s ARRAY is its own — fresh per read');
    ok(!Object.isFrozen(after.a), 'and not frozen: the array is the reader`s');
    ok([0, 1, 2].every((i) => after.a[i] === after.b[i] && after.a[i] === after2.a[i]), 'its ELEMENTS are the outputs` shared copies — the same objects at every read');
    ok(after.a.every((e) => Object.isFrozen(e) && Object.isFrozen((e as { deep: object }).deep)), 'each deep-frozen');
    ok(after.a[0] !== after.a[1], 'and one copy per OUTPUT, not one for the node');
    ok(after2.c !== after2.a && [0, 1, 2].every((i) => after2.c[i] === after.a[i]), 'the CONDITIONAL array form `["work?"]` too: its own array, the same shared elements (the adequacy reader`s R8)');
    ok(after.a.every((e, i) => e !== storedOf(m.driver, `r1:work:${i}:0`).result), 'none is the stored record');
  });

  test(DECLARED_CASES[5]!, () => {
    const COND = flow('cond', 'fetch', [
      { id: 'fetch', kind: 'task', type: 'T', edges: [{ when: { predicate: 'go' }, to: 'review' }, { to: 'publish' }] },
      { id: 'review', kind: 'task', type: 'T', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'T', needs: { r: 'review?', r2: 'review?' },
        edges: [{ when: { predicate: 'peek' }, to: 'done', needs: { r: 'review?' } }, { to: 'done' }] },
      END,
    ]);
    const drive = (go: boolean) => {
      const peeked: Record<string, unknown>[] = [];
      const m = make(COND, new Map<string, (c: DecisionContext) => boolean>([['go', () => go], ['peek', (ctx) => { peeked.push(ctx.needs as Record<string, unknown>); return false; }]]));
      m.driver.start({});
      m.sch.done('r1:fetch:-:0', { f: 1 });
      if (go) m.sch.done('r1:review:-:0', { verdict: 'ok', deep: { x: 1 } });
      m.sch.done('r1:publish:-:0', null);
      return { ...m, peeked };
    };
    const yes = drive(true);
    const pIn = yes.sch.inputOf('r1:publish:-:0') as { r: unknown; r2: unknown };
    equal([pIn.r, pIn.r2, yes.peeked[0]!.r], [{ verdict: 'ok', deep: { x: 1 } }, { verdict: 'ok', deep: { x: 1 } }, { verdict: 'ok', deep: { x: 1 } }], 'PRESENT: review`s result under both keys and on the edge, by hand');
    ok(pIn.r === pIn.r2 && pIn.r === yes.peeked[0]!.r && Object.isFrozen((pIn.r as { deep: object }).deep), 'one shared frozen copy — two keys and the edge');
    equal(copiesOf(yes.driver), 1, 'one copy made');
    const no = drive(false);
    const nIn = no.sch.inputOf('r1:publish:-:0');
    equal([nIn, no.peeked[0]], [{}, {}], 'ABSENT: the keys are not there, at either site (FD-C4)');
    equal(copiesOf(no.driver), 0, 'and nothing is copied');
    equal([yes.failures, no.failures], [[], []], 'neither run reported anything');
  });

  test(DECLARED_CASES[6]!, () => {
    // W199's arrangement: a LEAF task re-settled (`pub`'s edge goes to an end, so a repeated settlement re-dispatches
    // nothing); `ID-R4` asks only whether its id was dispatched. The reads are the driver's own resolver, called directly.
    const LEAF = flow('leaf', 'fetch', [
      { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'pub' }] },
      { id: 'pub', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      END,
    ]);
    const m = make(LEAF);
    m.driver.start({});
    m.sch.done('r1:fetch:-:0', null);
    m.sch.done('r1:pub:-:0', { v: 'first', deep: { n: 1 } });
    const read = () => (m.driver as unknown as { resolveReference: (a: string, h: string, k: string, t: unknown, s: string) => unknown })
      .resolveReference('done', '-', 'k', { form: 'one', node: 'pub', conditional: true }, 'needs');
    // A PRIMITIVE output is handed as it is and counted ONCE however often it is read (the adequacy reader's S4).
    const z = make(LEAF);
    z.driver.start({});
    z.sch.done('r1:fetch:-:0', null);
    z.sch.done('r1:pub:-:0', 0);
    const readZ = () => (z.driver as unknown as { resolveReference: (a: string, h: string, k: string, t: unknown, s: string) => unknown })
      .resolveReference('done', '-', 'k', { form: 'one', node: 'pub', conditional: false }, 'needs');
    equal([readZ(), readZ(), readZ(), copiesOf(z.driver)], [0, 0, 0, 1], 'a primitive output: handed as it is, three reads, one copy counted');
    const c1 = read();
    ok(c1 === read(), 'the arrangement: two reads, one copy');
    equal([c1, copiesOf(m.driver)], [{ v: 'first', deep: { n: 1 } }, 1], 'the first copy, counted once');
    // A REPLACEMENT: a repeated `done` with a new result — the last settlement wins, so `place` makes a NEW entry object.
    m.sch.done('r1:pub:-:0', { v: 'second', deep: { n: 2 } });
    const c2 = read();
    equal([c2, copiesOf(m.driver)], [{ v: 'second', deep: { n: 2 } }, 2], 'replaced: the next read makes a NEW copy of the NEW result');
    ok(c2 !== c1 && Object.isFrozen(c2), 'another object, frozen');
    equal(c1, { v: 'first', deep: { n: 1 } }, 'and the copy already handed out is unchanged — frozen, it cannot be');
    ok(!reaches(m.driver, c1), 'the driver holds the replaced copy NOWHERE — it went with its entry (RN-R13, ADR 0046)');
    ok(reaches(m.driver, c2), 'the CONTROL: the same walk finds the live copy');
    // A REMOVAL: a `done` then a `user_action` leaves the task with no effective outcome, so `place` drops the entry.
    m.sch.fire('task.failed', { id: 'r1:pub:-:0', state: 'user_action' });
    m.sch.fire('task.user_action', { id: 'r1:pub:-:0', state: 'user_action' });
    equal(typeof read(), 'symbol', 'removed: the conditional read finds NOTHING (the driver`s ABSENT)');
    ok(!reaches(m.driver, c2), 'and the removed entry`s copy is held nowhere');
    equal(m.driver.resolve('r1:pub:-:0', 'done', { result: { v: 'third' }, actor: 'ana' }), true, 'the arrangement: pub parked, so resolvable');
    const c3 = read();
    equal([c3, copiesOf(m.driver)], [{ v: 'third' }, 3], 'placed AGAIN: a third copy, of the resolution`s result');
    ok(c3 !== c2 && c3 !== c1, 'another object');
  });

  test(DECLARED_CASES[7]!, () => {
    const SIMPLE = flow('simple', 'fetch', [
      { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'work' },
      { id: 'work', kind: 'task', type: 'T', needs: { f: 'fetch', run: '$payload' }, edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ]);
    const a = make(SIMPLE);
    a.driver.start({ tenant: 't1' });
    a.sch.done('r1:fetch:-:0', FETCHED());
    const aIn = a.sch.inputOf('r1:work:0:0');
    equal(copiesOf(a.driver), 2, 'the arrangement: run A made two copies — fetch`s and the payload`s');
    const b = make(SIMPLE);
    equal(copiesOf(b.driver), 0, 'a fresh driver has made none');
    b.driver.resume(structuredClone(a.driver.checkpoint()));
    const bIns = [0, 1, 2].map((i) => b.sch.inputOf(`r1:work:${i}:0`));
    equal(bIns.map((x) => [x?.f, x?.run]), [0, 1, 2].map(() => [FETCHED(), { tenant: 't1' }]), 'the resumed driver hands every instance the same VALUES, by hand');
    ok(bIns.every((x) => x.f === bIns[0]!.f && x.run === bIns[0]!.run), 'shared across its instances');
    ok(bIns[0]!.f !== aIn.f && bIns[0]!.run !== aIn.run, 'and they are ITS copies, not run A`s');
    ok(Object.isFrozen(bIns[0]!.f) && Object.isFrozen(bIns[0]!.run), 'frozen');
    equal(copiesOf(b.driver), 2, 'made afresh — two, counted from zero');
  });

  test(DECLARED_CASES[9]!, () => {
    // The adequacy reader's R14 and R15: decision 1 says EVERY reader, at any depth, of an output made anywhere.
    const DEEP = flow('deep', 'fetch', [
      { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'outer' }] },
      { id: 'outer', kind: 'map', over: 'groups', branch: 'prep' },
      { id: 'prep', kind: 'task', type: 'T', edges: [{ to: 'inner' }] },
      { id: 'inner', kind: 'map', over: 'sub', branch: 'leaf' },
      { id: 'leaf', kind: 'task', type: 'T', needs: { f: 'fetch' }, edges: [{ to: 'mid' }] },
      { id: 'mid', kind: 'task', type: 'T', needs: { mine: 'leaf' },
        edges: [{ when: { predicate: 'look' }, to: 'ij', needs: { mine: 'leaf' } }, { to: 'ij' }] },
      { id: 'ij', kind: 'join', of: 'inner', edges: [{ to: 'oj' }] },
      { id: 'oj', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      END,
    ]);
    const seen: Record<string, unknown>[] = [];
    const m = make(DEEP, new Map([['look', (ctx) => { seen.push(ctx.needs as Record<string, unknown>); return false; }]]));
    m.driver.start({});
    m.sch.done('r1:fetch:-:0', { groups: [0, 1], deep: { k: 1 } });
    for (const g of [0, 1]) m.sch.done(`r1:prep:${g}:0`, { sub: [0, 1] });
    const paths = ['0.0', '0.1', '1.0', '1.1'];
    const leafIn = paths.map((p) => m.sch.inputOf(`r1:leaf:${p}:0`) as { f: { deep: object } });
    equal(leafIn.map((x) => x.f), paths.map(() => ({ groups: [0, 1], deep: { k: 1 } })), 'four readers TWO maps deep: the result of fetch, by hand');
    ok(leafIn.every((x) => x.f === leafIn[0]!.f) && Object.isFrozen(leafIn[0]!.f.deep), 'one shared, frozen object — readers at depth 2');
    for (const p of paths) m.sch.done(`r1:leaf:${p}:0`, { leaf: p, deep: { p } });
    const midIn = paths.map((p) => m.sch.inputOf(`r1:mid:${p}:0`) as { mine: { leaf: string; deep: { p: string } } });
    equal(midIn.map((x) => x.mine), paths.map((p) => ({ leaf: p, deep: { p } })), 'each mid reads the leaf of ITS OWN instance — an output made inside a region');
    for (const p of paths) m.sch.done(`r1:mid:${p}:0`, null);
    equal(seen.map((n) => (n.mine as { leaf: string }).leaf), paths, 'and so does the edge of each mid');
    ok(paths.every((_p, i) => seen[i]!.mine === midIn[i]!.mine), 'the read of the node and of its edge are ONE object per output — both sites (R15)');
    ok(midIn.every((x) => Object.isFrozen(x.mine.deep)), 'frozen');
    let threw = 'LANDED';
    try { midIn[0]!.mine.deep.p = 'x'; } catch (e) { threw = (e as Error).constructor.name; }
    equal(threw, 'TypeError', 'and a write into it throws — the in-region output is shared and frozen like any other');
    equal(copiesOf(m.driver), 5, 'copies: the one output of fetch (1) and the four leaf outputs (4)');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[8]!, () => {
    const GAP = flow('gap', 'fetch', [
      { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'work' },
      { id: 'work', kind: 'task', type: 'T', needs: { g: 'fetch' }, edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ]);
    const buf = new ArrayBuffer(4);
    new Uint8Array(buf).set([1, 2, 3, 4]);
    const value = {
      items: [0, 1],
      bytes: new Uint8Array([1, 2, 3]), empty: new Uint8Array(0), view: new DataView(new ArrayBuffer(2)),
      map: new Map<string, { v: number }>([['k', { v: 1 }]]), set: new Set([1]), when: new Date(0), buf,
      plain: { deep: { n: 1 } },
      keyed: new Map<{ k: number }, number>([[{ k: 1 }, 1]]), members: new Set([{ s: 1 }]), re: /a/g,
      cyc: { name: 'cyc' } as { name: string; self?: unknown },
    };
    value.cyc.self = value.cyc;
    const m = make(GAP);
    m.driver.start({});
    m.sch.done('r1:fetch:-:0', value);
    equal(m.failures, [], 'sharing a value that holds every gap type never throws — the walk does not hand a typed array to Object.freeze');
    type G = typeof value;
    const A = (m.sch.inputOf('r1:work:0:0') as { g: G }).g;
    const B = (m.sch.inputOf('r1:work:1:0') as { g: G }).g;
    ok(A === B, 'the arrangement: two instances, one shared value');
    // UNFROZEN: an ArrayBuffer view is never handed to Object.freeze. An EMPTY typed array would freeze without a throw,
    // so its being unfrozen says the call was never made (fact 5: a frozen DataView reports frozen too).
    equal([Object.isFrozen(A.bytes), Object.isFrozen(A.empty), Object.isFrozen(A.view)], [false, false, false],
      'a typed array with elements, an empty one and a DataView: shared UNFROZEN — Object.freeze never called on them');
    // SHALLOW: frozen, and not entered.
    equal([Object.isFrozen(A.map), Object.isFrozen(A.set), Object.isFrozen(A.when), Object.isFrozen(A.buf)], [true, true, true, true],
      'a Map, a Set, a Date and an ArrayBuffer: frozen');
    equal(Object.isFrozen(A.map.get('k')), false, 'SHALLOWLY — the walk does not enter a Map: its value object is unfrozen');
    // A write through each, by reader A, read by reader B: it LANDS and reaches every reader (the gap, (f2)).
    A.bytes[0] = 9;
    A.view.setUint8(0, 9);
    A.map.set('x', { v: 2 });
    A.set.add(2);
    A.when.setTime(5);
    new Uint8Array(A.buf)[0] = 9;
    A.map.get('k')!.v = 7;
    equal([B.bytes[0], B.view.getUint8(0), B.map.get('x'), B.set.has(2), B.when.getTime(), new Uint8Array(B.buf)[0], B.map.get('k')!.v],
      [9, 9, { v: 2 }, true, 5, 9, 7], 'a write through each — an element, setUint8, set, add, setTime, a view on the buffer, a Map value`s field — reaches the OTHER reader');
    // The CONTROL, beside them in the same value: a freezable object refuses the same kind of write.
    let control = 'LANDED';
    try { A.plain.deep.n = 2; } catch (e) { control = (e as Error).constructor.name; }
    equal([control, B.plain.deep.n], ['TypeError', 1], 'the CONTROL: a plain nested object in the same value THROWS TypeError, and B reads 1');
    // And the gap reaches no stored record: the log's own copy is OR-R2's clone, untouched.
    const stored = storedOf(m.driver, 'r1:fetch:-:0').result as G;
    equal([stored.bytes[0], stored.map.has('x'), stored.when.getTime(), new Uint8Array(stored.buf)[0]], [1, false, 0, 1], 'the stored record is untouched by every write');
    // What a non-plain object HOLDS is not entered: a Map's KEY object and a Set's MEMBER stay unfrozen (both readers' F7b/F8).
    equal([Object.isFrozen(A.keyed), Object.isFrozen([...A.keyed.keys()][0]), Object.isFrozen(A.members), Object.isFrozen([...A.members][0])], [true, false, true, false],
      'a Map and a Set frozen, their key object and member NOT — not entered');
    // A RegExp is shared UNFROZEN (both readers): frozen, its read-only `lastIndex` would make a global one's own READ throw.
    ok(A.re === B.re && !Object.isFrozen(A.re), 'a RegExp: shared, unfrozen');
    equal([A.re.test('aa'), B.re.lastIndex], [true, 1], 'a global RegExp`s own read works — and its lastIndex is shared state, the gap');
    // A CYCLE `structuredClone` preserved: the walk ends on it, and the copy keeps it (adequacy reader's F14).
    ok(A.cyc.self === A.cyc && Object.isFrozen(A.cyc), 'a cyclic value: shared, frozen, its cycle kept — and the walk ended');

  });

  test(DECLARED_CASES[10]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});

/**
 * **Does anything the driver holds reach `target`?** — every own property, `Map` key and value and `Set` value, from the
 * driver down, functions skipped. The walk is this file's own (never the package's), and the case beside each `false`
 * runs it to a `true` on the same driver.
 */
function reaches(root: unknown, target: unknown): boolean {
  const seen = new Set<object>();
  const stack: unknown[] = [root];
  while (stack.length > 0) {
    const v = stack.pop();
    if (v === target) return true;
    if (v === null || typeof v !== 'object' || seen.has(v)) continue;
    seen.add(v);
    if (v instanceof Map) for (const [k, x] of v) stack.push(k, x);
    else if (v instanceof Set) for (const x of v) stack.push(x);
    if (ArrayBuffer.isView(v)) continue;
    for (const k of Reflect.ownKeys(v)) {
      const d = Object.getOwnPropertyDescriptor(v, k);
      if (d && 'value' in d && typeof d.value !== 'function') stack.push(d.value);
    }
  }
  return false;
}
