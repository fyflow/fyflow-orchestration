/**
 * Ladder L2 — **what a CHECKPOINT is**: `spec/run-state.md` section 8, `RN-R14` to `RN-R18`,
 * [ADR 0064](../../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md),
 * [W88](../../doc/work-items/w88-what-a-checkpoint-is.md). No scheduler; the fake is L2's usual one.
 *
 * **The header SELECTS, so every fixture here puts the right selection where the well-formed wrong
 * ones DIFFER** (`doc/workflow.md` rule 8 obligation (a), v0.23 — this item is that clause's first
 * test). Every corpus flow is at `version: 1`, a runtime's first minted id is `r1`, and a flow whose
 * entry declares no `needs` hands its entry node exactly the value `start()` was called with — so on
 * the corpus a hard-coded `1`, a hard-coded `r1` and *the entry node's received payload* all
 * coincide with the right answer. `SELECTS` is at version 7, runs as `batch42`, and its entry
 * composes `{ seed: "." }`; the case that uses it asserts the ARRANGEMENT's own effect beside the
 * claim, so a fixture that drifted back to the default position fails as a fixture.
 *
 * **Every expected header field is a literal derived from the definition and the `start()` call
 * written in this file, never read back from `checkpoint()`** (the item's `Tests:` line).
 *
 * **The round trip is judged by {@link sameData}, NOT by the harness's `equal`**, and that is a
 * measurement: `deepEqual` compares own enumerable keys and never a prototype, so a class instance
 * and the plain object `structuredClone` turns it into are EQUAL to it (W88's declaration step,
 * re-take 3). `OR-R11`'s lossy boundary is exactly what an `equal`-based round trip cannot see.
 */
import { collected, deepEqual, equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { CHECKPOINT_FORMAT, Driver, NotStarted } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; pools: Record<string, { type: string }> };

class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else {
      this.fire('task.failed', detail);
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
  /** W186 — an attempt STARTS: `task.running`, its detail the task with the scheduler's 1-based `attemptNumber` (`RN-R40`). */
  running(id: string, attemptNumber: number): void {
    this.fire('task.running', { id, state: 'running', attempts: attemptNumber - 1, attemptNumber, timestamp: 1 });
  }
  /** W173 — `cancel` on the WAITING road (P34 fact 8): `task.cancelled` fires inside the call, and it resolves `true`. */
  cancel(id: string): Promise<boolean> {
    this.fire('task.cancelled', { id, state: 'cancelled', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
    return Promise.resolve(true);
  }
}

/**
 * **Version 7, run `batch42`, and an entry that COMPOSES** — the three arrangements named above.
 * `head` receives `{ seed: <the payload> }`, so the entry node's received payload is not the entry
 * payload; `head`'s result is a third value; `tail` receives that result.
 */
const SELECTS = {
  flowId: 'ckpt-selects', version: 7, entry: 'head',
  nodes: [
    { id: 'head', kind: 'task', type: 'T', needs: { seed: '.' }, edges: [{ to: 'tail' }] },
    { id: 'tail', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
/** A second flow, so two drivers on one scheduler can be told apart by EVERY header field. */
const OTHER = {
  flowId: 'ckpt-other', version: 2, entry: 'only',
  nodes: [
    { id: 'only', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

function driverFor(def: FlowDefinition, runId: string, scheduler: FakeScheduler, extra: Record<string, unknown> = {}) {
  return new Driver(def, {
    runId, scheduler, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, ...extra,
  });
}
function corpusDriver(def: FlowDefinition, extra: Record<string, unknown> = {}) {
  const scheduler = new FakeScheduler();
  const driver = new Driver(def, {
    runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    joinPolicy: liveToken as unknown as JoinPolicy, onRunFailure: () => {}, ...extra,
  });
  return { driver, scheduler };
}

/**
 * **Data AND prototype, at every depth — what `RN-R17` means by *round-trips exactly*.** Own keys
 * (symbols included) in order, data rather than accessor, the same prototype, `Object.is` on
 * primitives so `-0` is not `0`, and a `Map`/`Set`/`Date`'s internal state. **Not** property
 * ATTRIBUTES: a frozen object arrives unfrozen, which `OR-R11` names as not crossing, and every
 * event `foldInputs()` hands out is frozen — so writable/configurable are deliberately not compared.
 */
function sameData(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || typeof a !== 'object' || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Date) return a.getTime() === (b as Date).getTime();
  if (a instanceof Map || a instanceof Set) {
    const x = [...(a as Map<unknown, unknown>).entries()], y = [...(b as Map<unknown, unknown>).entries()];
    return x.length === y.length && x.every((e, i) => sameData(e[0], y[i]![0]) && sameData(e[1], y[i]![1]));
  }
  const ka = Reflect.ownKeys(a), kb = Reflect.ownKeys(b as object);
  if (ka.length !== kb.length || ka.some((k, i) => k !== kb[i])) return false;
  for (const k of ka) {
    const da = Object.getOwnPropertyDescriptor(a, k)!, db = Object.getOwnPropertyDescriptor(b, k)!;
    // An accessor on ONE side is a getter the clone read once (`OR-R11`) and is not the same data.
    // On BOTH sides it is the engine's own - V8 gives a cloned `Error` an own `stack` ACCESSOR, so
    // an Error result re-cloned has one on each side (W88's conformity reader, finding 7) - and
    // what it READS is the data.
    const accA = 'get' in da || 'set' in da, accB = 'get' in db || 'set' in db;
    if (accA !== accB) return false;
    if (accA) { if (!sameData((a as Record<PropertyKey, unknown>)[k], (b as Record<PropertyKey, unknown>)[k])) return false; continue; }
    if (da.enumerable !== db.enumerable) return false;
    if (!sameData(da.value, db.value)) return false;
  }
  return true;
}
const roundTrips = (v: unknown) => sameData(structuredClone(v), v);

class Score { v = 1; get doubled() { return this.v * 2; } }

/**
 * A result carrying every structured-clone type JSON cannot, so `RN-R17`'s *structuredClone, not
 * JSON* is exercised by what the events CARRY and not only argued (P23 decision 5).
 */
const RICH = () => ({ m: new Map<unknown, unknown>([['k', new Date(7)]]), s: new Set([1, 2]), z: -0, big: 10n, d: new Date(3), a: [1, { b: 'c' }], e: new Error('boom') });

/**
 * **One run per fold-input KIND, keyed by `FoldInput['kind']` — the list is bound to the union BOTH
 * ways at L0**: a `Record` over the union's key type refuses a missing kind AND an unknown one under
 * `typecheck:tests`, the one lane whose config includes `test/**` (the other four do not — W88's
 * conformity reader, finding 5) (a type alone closes one direction — [Q196](../../doc/questions/q196.md) —
 * and a `Record` literal is the shape that closes both). Each entry drives a run whose events carry
 * that kind; the case asserts it does, so an entry that stopped producing its kind fails naming it.
 */
const RUN_FOR: Record<FoldInput['kind'], () => Promise<Driver>> = {
  outcome: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 1 });
    scheduler.settle('r1:ingest:-:0', 'done', { result: RICH() });
    scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });
    return driver;
  },
  resolution: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 2 });
    scheduler.settle('r1:ingest:-:0', 'user_action', { error: 'needs a person' });
    ok(driver.resolve('r1:ingest:-:0', 'done', { result: RICH(), actor: 'ana' }), 'the resolution was accepted');
    return driver;
  },
  region: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/fanout-join.flow.json'));
    driver.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: { n: 1 } });
    scheduler.settle('r1:scoreB:1:0', 'done', { result: RICH() });
    scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 0.5 } });
    scheduler.settle('r1:publish:-:0', 'done', { result: null });
    return driver;
  },
  regionEntered: () => RUN_FOR.region(),
  dispatched: async () => {
    const { driver } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 3 });
    return driver;
  },
  // W180 (`RN-R36`, `RN-R37`, ADR 0109): a run that reaches an ASK after a task — the corpus's own `ask-after-a-task` —
  // whose task returned what JSON cannot carry, so the `asked` element's `input` (that result, kept) is held to
  // `structuredClone` round-tripping and to being a COPY a consumer cannot write through. The ask is then answered and
  // routes on, so the run carries the `asked` element AND the resolution after it. *This entry is why W180's L0 was red
  // in `typecheck:tests` and nowhere else — the binding doing its job, as at W93.*
  asked: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/ask-after-a-task.flow.json'));
    driver.start({ seed: 9 });
    scheduler.settle('r1:summarise:-:0', 'done', { result: RICH() });
    ok(driver.resolve('r1:approve:-:0', 'done', { result: { approved: true }, actor: 'ana' }), 'the answer was accepted');
    scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });
    return driver;
  },
  // W186 (`RN-R40`, ADR 0113): a run whose task STARTS twice — attempt 1 fails into a retry, attempt 2 succeeds — so the
  // run carries two `attempted` elements, each a task id and a number, and a requeue repeating number 2 appends nothing.
  // *This entry is why W186's L0 was red in `typecheck:tests` and nowhere else — the binding doing its job, as at W93.*
  attempted: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 10 });
    scheduler.running('r1:ingest:-:0', 1);
    scheduler.running('r1:ingest:-:0', 2);
    scheduler.running('r1:ingest:-:0', 2);
    scheduler.settle('r1:ingest:-:0', 'done', { result: RICH(), attempts: 1 });
    return driver;
  },
  pathEnded: () => RUN_FOR.outcome(),
  joinSettled: () => RUN_FOR.region(),
  halted: async () => {
    // `OR-R6`: a result `structuredClone` refuses halts the run and appends a `halted` element.
    const { driver, scheduler } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 4 });
    scheduler.settle('r1:ingest:-:0', 'done', { result: { f: () => 1 } });
    return driver;
  },
  // W173 (`RN-R30`, `RN-R31`): a run its OWNER cancelled, with a `reason`, so the element carries both of its strings;
  // its one task in flight is cancelled on the waiting road and settles inside the call.
  cancelRequested: async () => {
    const { driver } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 6 });
    await driver.cancel({ actor: 'ana', reason: 'no longer needed' });
    return driver;
  },
  // W174 (`RN-R32`, `RN-R33`): a run its OWNER stopped, with a `reason`, so the element carries both of its strings; its
  // one task in flight is cancelled after the driver went deaf, so the element is the sequence's last.
  interrupted: async () => {
    const { driver } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 7 });
    await driver.stop({ actor: 'ops', reason: 'upgrade' });
    return driver;
  },
  // W175 (`RN-R34`, `RN-R35`): a run its OWNER paused while `ingest` ran, so `publish` is dispatched and HELD; then
  // unpaused, which hands it on, and the run completes — the one run carries both elements, each with its actor.
  paused: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/linear.flow.json'));
    driver.start({ seed: 8 });
    driver.pause({ actor: 'ops' });
    scheduler.settle('r1:ingest:-:0', 'done', { result: RICH() });
    driver.unpause({ actor: 'ana' });
    scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });
    return driver;
  },
  unpaused: () => RUN_FOR.paused(),
  // W89 (`RN-R22`): a run RESUMED from its own checkpoint, cut with `ingest` in flight, so the
  // `resumed` element names one task and the run then completes on the resumed driver.
  resumed: async () => {
    const def = await load('valid/linear.flow.json');
    const { driver: first } = corpusDriver(def);
    first.start({ seed: 5 });
    const { driver, scheduler } = corpusDriver(def);
    driver.resume(first.checkpoint());
    scheduler.settle('r1:ingest:-:0', 'done', { result: RICH() });
    scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });
    return driver;
  },
  // W93 (`RN-R26`): a run through a GATE — the corpus's own `gated-map` — whose second file's key path ends on an
  // OBJECT carrying what JSON cannot, so a `gated` element's `key` is held to `structuredClone` round-tripping too,
  // and to being frozen when a consumer is handed it. *This entry is why W93's L0 was red in `typecheck:tests`
  // and nowhere else: the `Record` refuses a kind with no run, which is the binding doing its job.*
  gated: async () => {
    const { driver, scheduler } = corpusDriver(await load('valid/gated-map.flow.json'));
    driver.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: { files: [{ n: 0 }, { n: 1 }] } });
    scheduler.settle('r1:identify:0:0', 'done', { result: { series: { id: 's1' } } });
    scheduler.settle('r1:identify:1:0', 'done', { result: { series: { id: RICH() } } });
    return driver;
  },
};

const SUITE = 'W88 — what a checkpoint IS: RN-R14 to RN-R18';

/** This file's own `ROW_KEYS` — compared to what ran by the last case, both ways and by count. */
const DECLARED_CASES = [
  'RN-R15 — every header field is the RIGHT selection where each wrong one differs',
  'RN-R15 — the entry payload is a COPY taken at the call, and every checkpoint hands out its own',
  'RN-R15 — two drivers on one scheduler each carry their own header, field by field',
  'RN-R14 — no checkpoint before start(), and an uncloneable payload leaves the driver unstarted',
  'RN-R14 — `events` IS foldInputs() at that moment, element for element, in append order',
  'RN-R17 — every fold-input KIND round-trips structuredClone as data AND prototype',
  'RN-R17 — the comparator can fail: the controls the round trip is judged against',
  'RN-R17 — a checkpoint is a COPY: writing into one moves nothing the driver holds',
  'RN-R17 — the copy holds for EVERY kind: a write into any event of any run reaches nothing the driver holds',
  'RN-R15 — a start() refused by FD-R4 or by MultipleRuns leaves the header as it was',
  'RN-R18 — the position is the driver`s index, and a checkpoint taken at position k holds k + 1',
  'RN-R18 — a re-entrant append inside onFoldInput keeps every position its own',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('RN-R15 — every header field is the RIGHT selection where each wrong one differs', () => {
    const scheduler = new FakeScheduler();
    const d = driverFor(SELECTS, 'batch42', scheduler);
    d.start({ n: 3, tag: 'x', when: new Date(11) });
    scheduler.settle('batch42:head:-:0', 'done', { result: { out: 'head-result' } });

    // **The arrangement, asserted as the fixture's own effect** — each wrong selection DIFFERS here.
    const headInput = (scheduler.added.find((t) => t.id === 'batch42:head:-:0')!.payload as { input: unknown }).input;
    ok(SELECTS.version !== 1, 'the ARRANGEMENT: the flow is not at version 1, so a hard-coded 1 fails');
    ok(d.runId !== 'r1', 'the ARRANGEMENT: the run is not `r1`, so a hard-coded or first-minted id fails');
    ok(SELECTS.flowId !== SELECTS.entry, 'the ARRANGEMENT: the flow id is not the entry node`s id');
    equal(headInput, { seed: { n: 3, tag: 'x', when: new Date(11) } },
      'the ARRANGEMENT: the entry node RECEIVED the composed `{ seed }` — so storing the entry node`s received payload is a different value');

    equal(d.checkpoint().header, {
      format: 1, runId: 'batch42', flowId: 'ckpt-selects', version: 7,
      entryPayload: { n: 3, tag: 'x', when: new Date(11) },
    }, 'RN-R15: the header — every field a literal from the definition and the start() call above');
    equal(CHECKPOINT_FORMAT, 1, 'RN-R16: the format this version writes is 1, and the header carries that constant');
    ok(!deepEqual(d.checkpoint().header.entryPayload, headInput) && !deepEqual(d.checkpoint().header.entryPayload, { out: 'head-result' }),
      'and it is NEITHER the entry node`s received payload NOR its result — the two wrong selections a store is most likely to write');
    ok(Object.getPrototypeOf((d.checkpoint().header.entryPayload as { when: object }).when) === Date.prototype,
      'a Date in the entry payload arrives as a Date — structuredClone, not JSON (RN-R17)');
  });

  test('RN-R15 — the entry payload is a COPY taken at the call, and every checkpoint hands out its own', () => {
    const scheduler = new FakeScheduler();
    const d = driverFor(SELECTS, 'batch42', scheduler);
    const payload = { n: 3, nested: { k: 'v' }, score: new Score() };
    d.start(payload);
    // Mutated BEFORE the first checkpoint, so *clone at checkpoint()* is a different answer from
    // *clone at start()* — the second wrong selection a copy can make.
    payload.n = 99;
    payload.nested.k = 'CHANGED';
    const first = d.checkpoint().header.entryPayload as { n: number; nested: { k: string }; score: unknown };
    equal(first, { n: 3, nested: { k: 'v' }, score: { v: 1 } },
      'the value start() was CALLED with, not the object as the caller left it — and the class instance arrived as the data it carried (OR-R11)');
    ok(Object.getPrototypeOf(first.score) === Object.prototype,
      'the header holds what crosses the clone: `Score``s prototype is gone, which is OR-R11 applied to the entry payload');
    (first.nested as { k: string }).k = 'EDITED THROUGH A CHECKPOINT';
    equal((d.checkpoint().header.entryPayload as { nested: { k: string } }).nested.k, 'v',
      'and each checkpoint hands out its OWN copy — writing into one header moves the next one not at all');
    // On an entry with NO `needs` the entry node is handed the caller`s value itself (SELECTS` `"."`
    // form clones it, which is FD-C1`s and not this item`s) — so W88 changed nothing it receives.
    const s2 = new FakeScheduler();
    const o = driverFor(OTHER, 'job-o', s2);
    const mine = { k: 1 };
    o.start(mine);
    ok((s2.added[0]!.payload as { input: unknown }).input === mine,
      'the ENTRY NODE still receives the caller`s own value, exactly as before W88 — the copy is the header`s alone');
    ok(o.checkpoint().header.entryPayload !== mine, 'while the header holds a different object');
  });

  test('RN-R15 — two drivers on one scheduler each carry their own header, field by field', () => {
    const scheduler = new FakeScheduler();
    const a = driverFor(SELECTS, 'batch42', scheduler);
    const b = driverFor(OTHER, 'job-7', scheduler);
    a.start({ who: 'a' });
    b.start({ who: 'b', extra: [1] });
    scheduler.settle('job-7:only:-:0', 'done', { result: 1 });
    const ha = a.checkpoint().header, hb = b.checkpoint().header;
    equal(ha, { format: 1, runId: 'batch42', flowId: 'ckpt-selects', version: 7, entryPayload: { who: 'a' } }, 'driver A`s header is A`s');
    equal(hb, { format: 1, runId: 'job-7', flowId: 'ckpt-other', version: 2, entryPayload: { who: 'b', extra: [1] } }, 'driver B`s header is B`s');
    const differs = (['runId', 'flowId', 'version', 'entryPayload'] as const).filter((k) => deepEqual(ha[k], hb[k]));
    equal(differs, [], 'the ARRANGEMENT: the two headers differ in EVERY selected field, so one driver reading the other`s cannot pass on any of them');
  });

  test('RN-R14 — no checkpoint before start(), and an uncloneable payload leaves the driver unstarted', () => {
    const scheduler = new FakeScheduler();
    const d = driverFor(SELECTS, 'batch42', scheduler);
    throws(() => d.checkpoint(), 'NotStarted', 'RN-R14: before start() there is no run, and no header to invent');
    let caught: unknown;
    try { d.checkpoint(); } catch (e) { caught = e; }
    // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
    equal([(caught as Error).name, (caught as Error).message.startsWith('driver for run "batch42" holds no run to checkpoint'), String(caught).split('NotStarted').length],
      ['NotStarted', true, 2], `String(e) names the class EXACTLY once: ${String(caught).slice(0, 80)}`);
    ok(caught instanceof NotStarted, 'and it is the named class, exported from the package root');

    let cloneError: unknown;
    try { d.start({ fn: () => 1 }); } catch (e) { cloneError = e; }
    equal((cloneError as { name?: string } | undefined)?.name, 'DataCloneError',
      'RN-R15: an entry payload structuredClone refuses throws the platform`s DataCloneError from start() — OR-R12`s shape at the start boundary');
    equal(scheduler.added.length, 0, 'nothing was dispatched');
    equal(d.foldInputs().length, 0, 'nothing was appended');
    throws(() => d.checkpoint(), 'NotStarted', 'and the driver is still UNSTARTED — no header was kept');
    d.start({ fn: 'a string this time' });
    equal(d.checkpoint().header.entryPayload, { fn: 'a string this time' }, 'so a corrected payload starts it, as FD-R4`s refusal allows');

    const u = driverFor(OTHER, 'job-u', new FakeScheduler());
    u.start(undefined);
    const hu = u.checkpoint().header;
    ok('entryPayload' in hu && hu.entryPayload === undefined,
      'a run started with `undefined` HAS a header whose entry payload is `undefined` — which is why the unstarted case refuses instead of answering with one');
  });

  test('RN-R14 — `events` IS foldInputs() at that moment, element for element, in append order', async () => {
    const d = await RUN_FOR.region();
    const cp = d.checkpoint();
    const fi = d.foldInputs();
    ok(fi.length > 8, `the CONTROL: a real sequence, ${fi.length} elements`);
    equal(cp.events.length, fi.length, 'every element — a checkpoint is the WHOLE sequence, not the settlements alone');
    for (let i = 0; i < fi.length; i += 1) ok(sameData(cp.events[i], fi[i]), `element ${i} is the one foldInputs() holds there`);
    const settlements = cp.events.filter((e) => e.kind === 'outcome' || e.kind === 'resolution').length;
    ok(settlements < cp.events.length, `and it is more than the settlements: ${settlements} of ${cp.events.length}`);
    equal(fold(cp.events), fold(fi), 'so folding a checkpoint is folding the run');
  });

  test('RN-R17 — every fold-input KIND round-trips structuredClone as data AND prototype', async () => {
    const kinds = Object.keys(RUN_FOR) as FoldInput['kind'][];
    equal(kinds.length, 16, 'the union has sixteen kinds since W186 added `attempted` (fifteen since W180 added `asked`, fourteen since W175 added `paused` and `unpaused`, twelve since W174 added `interrupted`, eleven since W173 added `cancelRequested`, ten since W93 added `gated`, nine since W89 added `resumed`) — the Record is what binds it, this is the COUNT beside that membership');
    // **The kinds VISITED, bound to the kinds DECLARED** - W88's own rule 8 set (`d2`): with the
    // loop truncated to one kind the count above still read 8 and every per-kind clause below was
    // simply never asked, for ZERO. The count is of the list; this is of the iterations.
    const visited: string[] = [];
    for (const kind of kinds) {
      visited.push(kind);
      const cp: Checkpoint = (await RUN_FOR[kind]()).checkpoint();
      const ofKind = cp.events.filter((e) => e.kind === kind);
      ok(ofKind.length > 0, `the run for "${kind}" carries at least one "${kind}" event — else this kind is observed by nothing`);
      for (const e of cp.events) ok(roundTrips(e), `a "${e.kind}" event (in the "${kind}" run) round-trips structuredClone exactly`);
      ok(roundTrips(cp.header), `the "${kind}" run's header round-trips`);
      ok(roundTrips(cp), `and the checkpoint as ONE value round-trips — the shape a store is handed`);
    }
    equal(visited, kinds, 'every declared kind was VISITED — a loop cut short fails here, naming the kinds it skipped');
    const rich = (await RUN_FOR.outcome()).checkpoint().events.find((e) => e.kind === 'outcome')!;
    const r = (rich as { record: { result: Record<string, unknown> } }).record.result;
    ok(r.m instanceof Map && r.s instanceof Set && r.d instanceof Date && typeof r.big === 'bigint' && Object.is(r.z, -0),
      'the events CARRY what JSON cannot — a Map, a Set, a Date, a BigInt and -0 — which is why the contract is structuredClone');
  });

  test('RN-R17 — the comparator can fail: the controls the round trip is judged against', () => {
    const lossy = structuredClone({ result: new Score() });
    ok(!sameData(lossy, { result: new Score() }), 'a class instance and its clone are NOT the same data — the prototype is part of it');
    ok(deepEqual(lossy, { result: new Score() }),
      'and the harness`s deepEqual calls them EQUAL — which is why the round trip is not judged with it (W88`s declaration step)');
    ok(!sameData({ z: -0 }, { z: 0 }), '-0 is not 0 (the harness`s equal sees this one too)');
    ok(!sameData(structuredClone({ get g() { return 1; } }), { get g() { return 1; } }), 'an accessor is not the data it returned (equal misses this)');
    ok(!sameData(new Map([['k', 1]]), new Map([['k', 2]])), 'a Map`s entries are compared (so does equal)');
    ok(!sameData(new Date(1), new Date(2)), 'a Date`s time is compared — the Date branch had no control (W88`s adequacy reader, d2)');
    const err = { e: new Error('boom') };
    ok(sameData(structuredClone(structuredClone(err)), structuredClone(err)),
      'an Error that has crossed the clone round-trips again — its `stack` is an accessor on both sides and reads the same');
    // **And the CLAIM's own expression, not only the comparator under it** - W88's rule 8 set (`b7`):
    // `roundTrips` made `() => true` cost ZERO, because every control above called `sameData`
    // directly. A control must fail where its claim is vacuous (v0.21); this is that tree.
    ok(!roundTrips({ result: new Score() }), 'roundTrips itself refuses a value the clone loses a prototype from');
    ok(roundTrips({ result: { v: 1 } }), 'and accepts one it does not');
    ok(!sameData({ a: 1, b: 2 }, { b: 2, a: 1 }), 'key ORDER is part of what a clone preserves (equal misses this)');
  });

  test('RN-R17 — a checkpoint is a COPY: writing into one moves nothing the driver holds', async () => {
    const d = await RUN_FOR.outcome();
    const before = d.foldInputs();
    const cp = d.checkpoint();
    const rec = cp.events.find((e) => e.kind === 'outcome')!;
    const result = (rec as { record: { result: Record<string, unknown> } }).record.result;
    result.a = 'WRITTEN THROUGH A CHECKPOINT';
    (result.m as Map<string, unknown>).set('k', 'ALSO');
    ok(cp.events !== d.checkpoint().events, 'each call is a new array');
    equal(d.foldInputs(), before, 'the driver`s own sequence is unmoved');
    const again = d.checkpoint().events.find((e) => e.kind === 'outcome')!;
    equal((again as { record: { result: Record<string, unknown> } }).record.result.a, [1, { b: 'c' }],
      'and the next checkpoint carries the result as the run settled it — the first was a copy, not a window');
    ok(Object.isFrozen(cp) && Object.isFrozen(cp.events) && Object.isFrozen(cp.header),
      'the checkpoint, its array and its header are frozen, as foldInputs() is (OR-R7)');
  });

  test('RN-R18 — the position is the driver`s index, and a checkpoint taken at position k holds k + 1', async () => {
    const def = await load('valid/fanout-join.flow.json');
    const seen: { seq: number; input: FoldInput; held: number }[] = [];
    const ref = {} as { d: Driver };
    const h = corpusDriver(def, {
      onFoldInput: (input: FoldInput, seq: number) => { seen.push({ seq, input, held: ref.d.checkpoint().events.length }); },
    });
    ref.d = h.driver;
    const d = ref.d;
    d.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { n: 1 } });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { s: 1 } });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 0 } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: null });
    const all = d.checkpoint().events;
    ok(all.length > 8 && all.some((e) => e.kind !== 'outcome' && e.kind !== 'dispatched'),
      `the ARRANGEMENT: ${all.length} events of several kinds, so a count of SETTLEMENTS is not the position`);
    equal(seen.map((s) => s.seq), all.map((_, i) => i), 'positions are 0 … n-1, contiguous, in delivery order');
    for (const s of seen) ok(deepEqual(s.input, all[s.seq]), `the element delivered at position ${s.seq} is the one the checkpoint holds there`);
    equal(seen.map((s) => s.held), seen.map((s) => s.seq + 1),
      'a checkpoint taken INSIDE the callback for position k holds exactly k + 1 events — everything up to and including k, and the prefix a store holds is named by its length');
  });

  test('RN-R18 — a re-entrant append inside onFoldInput keeps every position its own', async () => {
    const seen: { seq: number; kind: string }[] = [];
    const ref = {} as { d: Driver };
    const h = corpusDriver(await load('valid/linear.flow.json'), {
      onFoldInput: (input: FoldInput, seq: number) => {
        seen.push({ seq, kind: input.kind });
        // A person answers from INSIDE the callback for the `user_action` outcome, so the resolution
        // and everything it dispatches are appended while position k's callback is still running.
        if (input.kind === 'outcome' && input.record.kind === 'outcome' && input.record.terminalState === 'user_action') {
          ref.d.resolve(input.record.taskId, 'done', { result: { by: 'hand' }, actor: 'ana' });
        }
      },
    });
    ref.d = h.driver;
    const d = ref.d;
    d.start({ seed: 1 });
    h.scheduler.settle('r1:ingest:-:0', 'user_action', { error: 'needs a person' });
    const kinds = d.foldInputs().map((e) => e.kind);
    ok(kinds.includes('resolution') && kinds.indexOf('resolution') > kinds.indexOf('outcome'),
      'the ARRANGEMENT: the resolution was appended during the outcome`s own callback');
    equal(seen.map((s) => s.seq).sort((a, b) => a - b), kinds.map((_, i) => i), 'every position delivered exactly once');
    equal(seen.map((s) => s.kind), seen.map((s) => kinds[s.seq]), 'and each is the kind the sequence holds at that index — a counter bumped AFTER the callback would hand the outer call a later number');
  });

  test('RN-R17 — the copy holds for EVERY kind: a write into any event of any run reaches nothing the driver holds', async () => {
    // W88's adequacy reader, F1: the first copy case wrote through an `outcome` only, so handing out
    // the driver's own `resolution` elements was green everywhere — and a person's resolution is the
    // value a store is likeliest to edit. So every run, every event with an object to write into.
    const wroteInto: string[] = [];
    for (const kind of Object.keys(RUN_FOR) as FoldInput['kind'][]) {
      const d = await RUN_FOR[kind]();
      const before = d.foldInputs();
      for (const e of d.checkpoint().events) {
        if (e.kind === 'outcome' || e.kind === 'resolution') {
          const res = e.record.result;
          if (res !== null && typeof res === 'object') { (res as Record<string, unknown>).WRITTEN = kind; wroteInto.push(`${kind}:${e.kind}`); }
        } else {
          // every other kind is frozen all the way down, so no write can reach the driver — and it has to
          // be the ELEMENT that is frozen, not only what it wraps: handing out the driver's own `region`
          // element, whose `event` IS frozen, fails here, because the element wrapping it is not and a
          // consumer reassigning `.event` would rewrite the driver's sequence. (W88's adequacy reader
          // called that mutation equivalent, F8; this case is what measured it is not.)
          ok(Object.isFrozen(e) && Object.values(e).every((v) => v === null || typeof v !== 'object' || Object.isFrozen(v)),
            `a "${e.kind}" event is frozen all the way down`);
        }
      }
      equal(d.foldInputs(), before, `the "${kind}" run's sequence is unmoved by writes through its checkpoint`);
    }
    ok(wroteInto.includes('resolution:resolution') && wroteInto.includes('outcome:outcome'),
      `the ARRANGEMENT: a RESOLUTION's result and an OUTCOME's were both written through — ${wroteInto.length} writes`);
  });

  test('RN-R15 — a start() refused by FD-R4 or by MultipleRuns leaves the header as it was', () => {
    // W88's adequacy reader, F2 and F3: the header written BEFORE the FD-R4 walk, or before the
    // MultipleRuns check, is still refused by `start()` — and `checkpoint()` would then carry a
    // payload the run never started with. Neither ordering had a fixture.
    const strict = typesFor(['T'], {}, { T: { url: 'test://T', inputSchema: { type: 'object', required: ['must'] } } } as never);
    const scheduler = new FakeScheduler();
    const d = driverFor(OTHER, 'job-s', scheduler, strict);
    throws(() => d.start({ nope: 1 }), 'BoundaryRefused', 'the ARRANGEMENT: FD-R4 refuses this payload at start()');
    throws(() => d.checkpoint(), 'NotStarted', 'and the driver has NO header — the refused payload is not one it started with');
    d.start({ must: 'first' });
    throws(() => d.start({ must: 'second' }), 'MultipleRuns', 'the ARRANGEMENT: a second start() is refused');
    equal(d.checkpoint().header.entryPayload, { must: 'first' }, 'and the header is still the FIRST start`s — a refused call writes nothing');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
