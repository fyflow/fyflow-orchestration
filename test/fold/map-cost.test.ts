/**
 * Ladder L1-L2 — **what a large `map` costs, held as CLOCK-FREE COUNTS** — P39 stop-and-ask (e) and its exit artifact's
 * clause (1), [W197](../../doc/work-items/w197-the-cost-check-and-the-exit-artifact.md) under
 * [P39](../../doc/plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md): the work of a `map` run at
 * **8,000 items is below 6x its work at 2,000** — linear is 4x, a per-input cost that grows with the run 16x — for the
 * three subjects P39 made linear, each read through the counter its own item placed:
 *
 * | subject | the count | placed by |
 * |---|---|---|
 * | `fold` | `FoldCounter.visits` through the internal `foldWith(inputs, counter)` — one per input applied, one per entry, element or cell read or written | W194, [ADR 0120](../../doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md) rule 7, `RN-R43` |
 * | the driver, an `attempted` element per task | `taskLog.visits`, a field of the driver's PRIVATE per-task view, read by a cast — the records handed to `effectiveOutcome` and `isSuspended` | W195, [ADR 0121](../../doc/decisions/0121-the-driver-keeps-a-per-task-view-of-its-log.md) rule 7, `RN-R13` |
 * | a runtime's run, an `attempted` element per task, its consumer reading `handle.outcome()` and `handle.node()` after every input it is handed once the handle exists | NO counter in `src/` (ADR 0122 consequence 5): `Accumulator.load` wrapped HERE to hand the runtime's accumulator a counter, and `apply` / `materialise` wrapped to count calls | W196, [ADR 0122](../../doc/decisions/0122-a-runtimes-live-state-is-a-frozen-copy-on-its-handle.md), `RN-R44` |
 *
 * **A ratio and a floor are not an instrument; an EXACT value is** — W195's adequacy reader: a counter that counted CALLS
 * instead of records passed both, with the whole-log scan restored. So every subject's count is PINNED at both sizes to a
 * value derived by hand from the counted code's tick sites and the inputs the case drives (each derivation beside its
 * assertion), and the ratio is asserted beside it. **Every expected value is derived, never read off a run.**
 *
 * **What a count cannot see is what its subject does not tick** — four times in P39: W194's re-tally outside
 * `precedence()`, W195's counter of calls, W196's cache hiding a per-input materialisation from a one-burst count, and
 * this file's own WALL while it was sized, which found a `needs` reference read inside a `map` instance searching EVERY
 * output of the node it names — O(items) per read, [Q735](../../doc/questions/q735.md), raised by W197, not fixed by P39
 * (the driver arm's `post` therefore reads a node with ONE output). So **every subject is run TWICE**: once with its
 * counter, and once — with no counter — under an ITERATION observer that does not go through any counter: `Map` and `Set`
 * iterator steps and `forEach`, `Object.keys` / `values` / `entries`, and the `Array.prototype` methods that walk an array
 * (`forEach`, `map`, `filter`, `some`, `every`, `find`, `findIndex`, `findLast`, `findLastIndex`, `indexOf`,
 * `lastIndexOf`, `includes`, `reduce`, `reduceRight`, `flatMap`, `flat`, `slice`, `concat`, `join`), each counted by the
 * elements it walks; that count's ratio is asserted below 6x too. In its own pass, never beside the counter
 * (`examples/settlement-cost.ts`' *the two observers do not run in the same pass*). **Its stated limit**, measured by
 * W197's adequacy reader: what walks an array without a method — `for…of`, an array spread `[...a]`, an index loop — and
 * an OBJECT spread `{...o}` are not counted. Patching `%ArrayIteratorPrototype%.next` was measured: it broke the rest of
 * the suite's run outright, so it is not done.
 *
 * **The provocations are CHECKED IN, as cases** (`doc/workflow.md` section 5 rule 7): each restores ONE cost at ONE site —
 * by a wrapper this file installs and removes, never an edit to `src/` — and asserts (a) that it RAN (its own call count
 * above zero, rule 7 (b)) and (b) the EXACT set of this file's clauses it turns red (rule 7 (c)). The author's
 * source-edit set, run in a byte copy, is the item's Record. **None runs unbounded** (P39's W197 outputs): every
 * observer reads its count against a CEILING — a small multiple of the subject's linear work — and STOPS there:
 *
 * - the fold THROWS from its counter and from the iteration observer (one synchronous call, no microtask on its stack);
 * - the driver's observers RECORD the crossing and the drive stops at the next settlement (a throw inside its listener is
 *   the driver's own business — `OR-R10` — and is not this file's to provoke);
 * - the runtime's instruments STOP DOING THE WORK once over (a throw there would land on `done`'s microtask, an uncaught
 *   exception that takes the runner down with no `FAIL` line — a crash is not a detection), and the drive stops.
 *
 * **One settlement per macrotask turn** for the runtime (W196's D15): settled in one synchronous burst, every one of
 * `done`'s per-input predicate checks runs AFTER the burst, so all but the first read the cache, and a materialisation
 * restored in the predicate costs one. The turn is a `MessageChannel` message, not `setTimeout` — no clamp, in node,
 * deno and the browser alike — closed when the drive ends.
 *
 * Runs in all three L0-L5 runtimes; nothing here reads a file, so nothing is skipped in the browser bundle.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { Accumulator, foldWith, type FoldCounter } from '../../src/fold/accumulator.ts';
import { emptyState, type FoldInput, type RunState } from '../../src/fold/run-state.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { LogRecord } from '../../src/driver/log.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { createRuntime } from '../../src/scheduler/runtime.ts';
import type { RunHandle } from '../../src/scheduler/runtime.ts';
import type { FlowDefinition, RegistryDocument } from '../../src/definition/types.ts';

/** P39 (e)'s two sizes. 4x the items: linear is 4x the work, a per-input cost that grows with the run 16x. */
const SMALL = 2000;
const LARGE = 8000;
/** P39 (e)'s line. */
const BOUND = 6;
/** The ceiling, as a multiple of a subject's DERIVED linear work at that size: past it the observer stops. */
const CEILING_TIMES = 4;

/** What an observer reports: the count, and whether it crossed its ceiling and stopped. */
type Reading = { count: number; hit: boolean };

/**
 * **The clauses a subject's two counted readings fail** — `ceiling` (either size crossed it and stopped), else `exact` (a
 * count that is not its derived value at either size) and `ratio` (the larger size's count at or above 6x the smaller's).
 */
function failing(small: Reading, large: Reading, exact: (n: number) => number): string[] {
  if (small.hit || large.hit) return ['ceiling'];
  const out: string[] = [];
  if (small.count !== exact(SMALL) || large.count !== exact(LARGE)) out.push('exact');
  if (large.count / small.count >= BOUND) out.push('ratio');
  return out;
}
/** The iteration observer's clause: `iterations` when either size crossed its ceiling or the ratio is 6x or more. */
const iterationsFail = (small: Reading, large: Reading) => small.hit || large.hit || large.count / small.count >= BOUND;

class CeilingReached extends Error {}

/** A `FoldCounter` whose `visits` is an accessor that THROWS past `ceiling` — the fold's own stop. */
function ceilingCounter(ceiling: number): FoldCounter & { hit: boolean } {
  let visits = 0;
  const c = {
    hit: false,
    get visits() { return visits; },
    set visits(v: number) {
      visits = v;
      if (v > ceiling) {
        c.hit = true;
        throw new CeilingReached(`past ${ceiling}`);
      }
    },
  };
  return c;
}

/** A wrapper installed on an object for the length of `body`, and restored — asserted restored — after it. */
function wrapped<T>(target: object, key: string, make: (orig: (...a: unknown[]) => unknown) => (...a: unknown[]) => unknown, body: () => T): T {
  const t = target as Record<string, (...a: unknown[]) => unknown>;
  const orig = t[key]!;
  t[key] = make(orig);
  let out: T;
  try {
    out = body();
  } finally {
    t[key] = orig;
  }
  if (t[key] !== orig) throw new Error(`${key}: the instrument was not removed`);
  return out;
}

/**
 * **The ITERATION observer — the second, independent of every counter.** Counts every element walked by a `Map` or
 * `Set` iterator step or `forEach`, by `Object.keys` / `values` / `entries`, and by the `Array.prototype` methods the
 * header lists. Installed by the call, removed by `remove()` (asserted). Past `ceiling` it records the crossing and, when
 * `throwing`, THROWS — only where nothing but a synchronous call is on the stack.
 */
function observe(ceiling: number, throwing: boolean): { reading: Reading; remove: () => void } {
  const reading: Reading = { count: 0, hit: false };
  const bump = (by: number) => {
    reading.count += by;
    if (reading.count > ceiling) {
      reading.hit = true;
      if (throwing) throw new CeilingReached(`past ${ceiling}`);
    }
  };
  const restore: (() => void)[] = [];
  const patch = (target: object, key: string, by: (self: unknown, out: unknown) => number, before: boolean) => {
    const t = target as Record<string, (...a: unknown[]) => unknown>;
    const orig = t[key]!;
    t[key] = function (this: unknown, ...args: unknown[]) {
      if (before) bump(by(this, undefined));
      const out = orig.apply(this, args);
      if (!before) bump(by(this, out));
      return out;
    };
    restore.push(() => { t[key] = orig; });
  };
  for (const proto of [Object.getPrototypeOf(new Map()[Symbol.iterator]()), Object.getPrototypeOf(new Set()[Symbol.iterator]())]) {
    patch(proto, 'next', () => 1, true);
  }
  patch(Map.prototype, 'forEach', (self) => (self as Map<unknown, unknown>).size, true);
  patch(Set.prototype, 'forEach', (self) => (self as Set<unknown>).size, true);
  for (const k of ['keys', 'values', 'entries']) patch(Object, k, (_s, out) => (out as unknown[]).length, false);
  for (const k of ['forEach', 'map', 'filter', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'indexOf',
    'lastIndexOf', 'includes', 'reduce', 'reduceRight', 'flatMap', 'flat', 'slice', 'concat', 'join']) {
    patch(Array.prototype, k, (self) => (self as unknown[]).length, true);
  }
  const originals = restore.length;
  return {
    reading,
    remove: () => {
      for (const r of restore.reverse()) r();
      if (restore.length !== originals || Object.keys !== Object.getOwnPropertyDescriptor(Object, 'keys')!.value) {
        throw new Error('the iteration observer was not removed');
      }
    },
  };
}

// --- the fold -------------------------------------------------------------------------------------------------------

const settledRecord = (taskId: string): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: 'done', result: { v: taskId }, error: null,
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const regionEvent = (type: RegionEvent['type'], branchPath: string): FoldInput =>
  ({ kind: 'region', event: { type, regionId: 'each', regionPath: '-', branchPath, at: 'x' } as RegionEvent });

/**
 * **A top-level `map` over `n` items, as a driver appends it** (`spec/run-state.md` sections 2-3): the region entered, the
 * `n` branches opened, the `n` tasks dispatched, an `attempted` element for each (`RN-R40`, attempt 1 — P39 fact 6's road,
 * the Host's fifth input per item), each settled and its branch arrived, the join fired, the path ended — `5n + 3`
 * inputs, hand-written from the spec and never produced by the code under test.
 */
function mapInputs(n: number): FoldInput[] {
  const ids = Array.from({ length: n }, (_, i) => String(i));
  return [
    { kind: 'regionEntered', regionId: 'each', regionPath: '-' },
    ...ids.map((b) => regionEvent('branch.opened', b)),
    ...ids.map((b): FoldInput => ({ kind: 'dispatched', taskId: `r1:work:${b}:0` })),
    ...ids.map((b): FoldInput => ({ kind: 'attempted', taskId: `r1:work:${b}:0`, attemptNumber: 1 })),
    ...ids.flatMap((b) => [settledRecord(`r1:work:${b}:0`), regionEvent('branch.arrived', b)]),
    { kind: 'joinSettled', regionId: 'each', regionPath: '-', joinId: 'collect', fired: true },
    { kind: 'pathEnded', reason: 'end', at: 'done' },
  ];
}

/**
 * **The fold's counted work over `mapInputs(n)`, DERIVED from `src/fold/accumulator.ts`'s tick sites — `13n + 9`:**
 * one per input `apply`d (`5n + 3`); `regionEntered` touches a NEW instance (1) and its outcome's first `tally()` reads
 * the one touched instance (1); each `branch.opened` and `branch.arrived` touches the instance (`2n`); each `dispatched`,
 * `attempted` and settlement writes one entry (`3n`); the `joinSettled` touches it (1) and `pathEnded` adds one end (1);
 * and the ONE materialisation writes the `n` entries (`n`), the instance's `n` opened, `n` settled and itself (`2n + 1`)
 * and the one-element path-end list (1). `5n + 3 + 2 + 5n + 2 + 3n + 2`.
 */
const foldWork = (n: number) => 13 * n + 9;
/**
 * **The fold's iteration ceiling.** The one materialisation walks the `n` entries and the instance's `n` settlements
 * through `Map` iterators — `2n` steps and a constant, the floor asserted below. The rest is the runtime's own (an
 * iterator's closing step, what a parse walks), so it is not pinned: a RATIO is asserted, the ceiling `CEILING_TIMES` x `2n`
 * plus 10,000.
 */
const foldIterationCeiling = (n: number) => CEILING_TIMES * 2 * n + 10_000;

function foldReading(n: number): Reading {
  const inputs = mapInputs(n);
  const counter = ceilingCounter(CEILING_TIMES * foldWork(n));
  try {
    const s = foldWith(inputs, counter);
    // The ARRANGEMENT: the counted fold IS the fold of the run it claims — completed, `n` nodes.
    if (s.outcome !== 'completed' || Object.keys(s.nodes).length !== n) throw new Error(`the ${n}-item fold did not complete with ${n} nodes`);
  } catch (e) {
    if (!(e instanceof CeilingReached)) throw e;
  }
  return { count: counter.visits, hit: counter.hit };
}

function foldIterations(n: number): Reading {
  const inputs = mapInputs(n);
  const o = observe(foldIterationCeiling(n), true);
  try {
    foldWith(inputs);
  } catch (e) {
    if (!(e instanceof CeilingReached)) throw e;
  } finally {
    o.remove();
  }
  return o.reading;
}

/** The fold's clauses: the counter's (`failing`), and the iteration observer's (`iterations`). */
function foldFailing(): { failed: string[]; counts: number[]; iterations: number[] } {
  const small = foldReading(SMALL);
  const large = foldReading(LARGE);
  const failed = failing(small, large, foldWork);
  const iSmall = foldIterations(SMALL);
  const iLarge = foldIterations(LARGE);
  if (iterationsFail(iSmall, iLarge)) failed.push('iterations');
  return { failed, counts: [small.count, large.count], iterations: [iSmall.count, iLarge.count] };
}

// --- the driver -----------------------------------------------------------------------------------------------------

/** L2's scheduler double: it queues nothing and runs nothing; the drive below fires what a scheduler would. */
class Double {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push((task as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

/** The driver's private view, reached by a cast — nothing here is a public surface (ADR 0121 rule 7). */
interface View {
  visits: number;
  push(record: LogRecord): void;
  of(taskId: string): readonly LogRecord[];
}
interface DriverPrivate {
  taskLog: View;
  outputs(): unknown;
  outputsCache: unknown;
}
const priv = (d: Driver): DriverPrivate => d as unknown as DriverPrivate;

const detail = (id: string, over: Record<string, unknown> = {}) =>
  ({ id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over });

/**
 * **A `map` over `n` items on a double, `task.running` carrying `attemptNumber: 1` before every settlement** (P39 fact 6:
 * an `attempted` element per task), one settlement at a time, its queue walked by INDEX (a `shift()` would be the
 * harness's own quadratic, P39 fact 4). With `needs`, a second branch task `post` composes a reference to `ingest`, so
 * `outputs()` is read once per SETTLEMENT with the log one record longer each time (P39 fact 7) — `log-view.test.ts`'s
 * flow, with ONE difference: the map reads its items from `list`, a task of its own, so `ingest`'s result — what `post`
 * reads and clones per key — is ONE small value. With the items in it, every read cloned an `n`-element list — `n` per
 * settlement, 10.8 s at 8,000 items, 89% of it `structuredClone`: a reference to a LARGE value, [Q186](../../doc/questions/q186.md)'s
 * cost and not one this plan moved. `provoke` runs on the driver before `start`. With `observer`, the drive also stops
 * once THAT has crossed its ceiling.
 *
 * **The arrangement is checked WITHOUT a fold** — every task settled, no failure, and the run's last element its path
 * end — so a quadratic fold cannot make this subject's wall a fold's (W197's adequacy reader, gap 3).
 */
function driverReading(n: number, needs: boolean, ceiling: number, provoke?: (d: Driver) => void, observer?: Reading): Reading & { settled: number } {
  const def = {
    flowId: 'big-map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'Work', edges: [{ to: 'list' }] },
      { id: 'list', kind: 'task', type: 'Work', edges: [{ to: 'each' }] },
      { id: 'each', kind: 'map', over: 'items', branch: 'work' },
      { id: 'work', kind: 'task', type: 'Work', edges: [{ to: needs ? 'post' : 'collect' }] },
      ...(needs ? [{ id: 'post', kind: 'task', type: 'Work', needs: { ctx: 'ingest', it: '.' }, edges: [{ to: 'collect' }] }] : []),
      { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const s = new Double();
  let failure: string | null = null;
  const d = new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(),
    workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } }, joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => { failure = f.kind; },
  });
  // The counter's field becomes an accessor that RECORDS the ceiling's crossing — installed before anything is read.
  let visits = 0;
  let hit = false;
  Object.defineProperty(priv(d).taskLog, 'visits', {
    configurable: true, enumerable: true,
    get: () => visits,
    set: (v: number) => { visits = v; if (v > ceiling) hit = true; },
  });
  provoke?.(d);
  const stopped = () => hit || observer?.hit === true;
  d.start({});
  let settled = 0;
  for (let q = 0; q < s.added.length && !stopped(); q += 1) {
    const id = s.added[q]!;
    s.fire('task.running', { id, state: 'running', attemptNumber: 1 });
    const result = id.includes(':list:') ? { items: Array.from({ length: n }, (_, i) => i) } : { i: q };
    s.fire('task.completed', detail(id, { result }));
    settled += 1;
  }
  if (!stopped()) {
    const expected = needs ? 2 * n + 2 : n + 2;
    const inputs = d.foldInputs();
    const last = inputs[inputs.length - 1];
    if (failure !== null || settled !== expected || last?.kind !== 'pathEnded' || last.reason !== 'end') {
      throw new Error(`the ${n}-item driver run (${needs ? 'needs' : 'plain'}) did not complete: ${failure}, ${settled} of ${expected} settled`);
    }
  }
  return { count: visits, hit, settled };
}

/**
 * **The driver's visits, DERIVED** — ADR 0121 rule 7: `TaskLog.of` adds the length of the sub-log it hands out, and every
 * task here has ONE record. Plain: one `advance` read per settlement — `ingest`, `list` and the `n` items — `n + 2`. With
 * `needs`: `2n + 2` settlements read once each, plus `outputs()`' catch-up, one `of` per record it reads, whose last read is
 * at the last `post` dispatch, when the log holds `ingest`, `list` and the `n` `work` settlements — `n + 2` more:
 * `3n + 4`. `log-view.test.ts`'s flow, one task shorter, derives `n + 1` and `3n + 2` the same way at 500 and 2,000.
 */
const driverWork = (needs: boolean) => (n: number) => (needs ? 3 * n + 4 : n + 2);
/** The driver's iteration ceiling — generous, its exact value the runtime's: `CEILING_TIMES` x 40 per item, plus 10,000. */
const driverIterationCeiling = (n: number) => CEILING_TIMES * 40 * n + 10_000;

function driverFailing(provoke?: (d: Driver) => void): { plain: string[]; needs: string[]; counts: number[][]; iterations: number[][] } {
  const out = { plain: [] as string[], needs: [] as string[], counts: [] as number[][], iterations: [] as number[][] };
  for (const needs of [false, true]) {
    const work = driverWork(needs);
    const small = driverReading(SMALL, needs, CEILING_TIMES * work(SMALL), provoke);
    const large = driverReading(LARGE, needs, CEILING_TIMES * work(LARGE), provoke);
    const failed = failing(small, large, work);
    // The iteration pass keeps the COUNTER's ceiling as a STOP and reads nothing from it: a cost the counter sees would
    // otherwise run unstopped here (an `outputs()` rebuild per read is 81 s at 8,000 items, its work invisible to this
    // observer). A pass the counter stopped judges nothing — the counter's pass has already said `ceiling`.
    let byCounter = false;
    const iter = (n: number) => {
      const o = observe(driverIterationCeiling(n), false);
      try {
        byCounter = driverReading(n, needs, CEILING_TIMES * work(n), provoke, o.reading).hit || byCounter;
      } finally {
        o.remove();
      }
      return o.reading;
    };
    const iSmall = iter(SMALL);
    const iLarge = iter(LARGE);
    if (!byCounter && iterationsFail(iSmall, iLarge)) failed.push('iterations');
    out[needs ? 'needs' : 'plain'] = failed;
    out.counts.push([small.count, large.count]);
    out.iterations.push([iSmall.count, iLarge.count]);
  }
  return out;
}

// --- the runtime ----------------------------------------------------------------------------------------------------

/** A `map` over `items`, one task per item — `live-state.test.ts`'s `MAP`, the shape P39 is about. */
const MAP = {
  flowId: 'map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'items', branch: 'work' },
    { id: 'work', kind: 'task', type: 'T', edges: [{ to: 'joined' }] },
    { id: 'joined', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
const DOCUMENT = {
  workers: { w: { url: 'https://example.test/w.js' } },
  nodeTypes: { T: { worker: 'w', inline: true } },
  predicates: [],
} as unknown as RegistryDocument;

/** The seams: pools and the scheduler recorded rather than built. */
function seams() {
  const added: { id: string }[] = [];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const fire = (type: string, d: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail: d }); };
  /** `task.running` with attempt 1 — an `attempted` element — and then the settlement, as a scheduler reports a task. */
  const settle = (id: string, result: unknown) => {
    fire('task.running', { id, state: 'running', attemptNumber: 1 });
    fire('task.completed', detail(id, { result, error: null }));
  };
  const createPool = (url: string, options: unknown) => ({ url, options }) as never;
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => ({
    workerPools: p, groups: g,
    addTask(t: unknown) { added.push(t as { id: string }); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    shutdown() { return Promise.resolve(); },
  }) as never;
  return { added, settle, createPool, createScheduler };
}

/**
 * **One macrotask turn per settlement**, by `MessageChannel` — every microtask queued in a turn (`done`'s predicate, the
 * consumer's reads) runs before the next message. Unclamped where `setTimeout` is clamped; `close()` releases the port.
 */
function turns() {
  const ch = new MessageChannel();
  const waiting: (() => void)[] = [];
  ch.port1.onmessage = () => { waiting.shift()?.(); };
  return {
    turn: () => new Promise<void>((res) => { waiting.push(res); ch.port2.postMessage(null); }),
    close: () => { ch.port1.close(); ch.port2.close(); },
  };
}

type RuntimeReading = Reading & { applies: number; materialisations: number; delivered: number };

/** A second stop on the calls themselves: the derived run materialises ONCE, so far past it is a per-input cost. */
const MATERIALISATION_CEILING = 64;
/**
 * Set by the runtime drive's consumer around its own `outcome()` / `node()` reads — so a provocation can restore a cost
 * at ONE call site of a function two sites share (W197's conformity reader: `outcomeNow` is both `done`'s predicate's and
 * `RunHandle.outcome()`'s).
 */
const site = { consumer: false };

/**
 * **A runtime's run of a `map` over `n` items, its consumer reading `outcome()` and `node()` after every input it is
 * handed once the handle exists** — all but the first, `ingest`'s dispatch, which `start()` delivers before it returns
 * the handle. The instruments, installed here and removed after: `Accumulator.load` hands the runtime's ONE accumulator a
 * counter whose crossing of `ceiling` is RECORDED; `apply` and `materialise` count their calls and, once the ceiling is
 * crossed — or `materialise` is called more than `MATERIALISATION_CEILING` times — do no work at all, so a restored
 * per-input cost stops where it is crossed, inside a synchronous burst too. `provoke` installs ON TOP of the instruments
 * and returns its own removal. With `observer`, the drive also stops once THAT has crossed its ceiling.
 */
async function runtimeReading(n: number, ceiling: number, provoke?: () => () => void, observer?: Reading): Promise<RuntimeReading> {
  const A = Accumulator as unknown as { load: (s: RunState, c?: FoldCounter) => Accumulator };
  const proto = Accumulator.prototype as unknown as { apply: (i: FoldInput) => boolean; materialise: () => RunState };
  let visits = 0;
  let hit = false;
  const counter: FoldCounter = {
    get visits() { return visits; },
    set visits(v: number) { visits = v; if (v > ceiling) hit = true; },
  };
  const tally = { applies: 0, materialisations: 0 };
  let last: RunState | null = null;
  const orig = { load: A.load, apply: proto.apply, materialise: proto.materialise };
  A.load = (s: RunState) => orig.load.call(Accumulator, s, counter);
  proto.apply = function (this: Accumulator, i: FoldInput) {
    tally.applies += 1;
    return hit ? false : orig.apply.call(this, i);
  };
  proto.materialise = function (this: Accumulator) {
    tally.materialisations += 1;
    if (tally.materialisations > MATERIALISATION_CEILING) hit = true;
    if (hit) return last ?? emptyState();
    return (last = orig.materialise.call(this));
  };
  const stopped = () => hit || observer?.hit === true;
  const unprovoke = provoke?.();
  const t = turns();
  let reading: RuntimeReading;
  try {
    reading = await (async (): Promise<RuntimeReading> => {
      const s = seams();
      const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler, validateBoundaries: false });
      const ref: { h: RunHandle | null } = { h: null };
      let delivered = 0;
      let h: RunHandle;
      try {
        h = ref.h = r.start(MAP, {}, {
          onFoldInput: () => {
            delivered += 1;
            if (ref.h === null) return;
            site.consumer = true;
            try {
              ref.h.outcome();
              ref.h.node(String(s.added[0]!.id));
            } finally {
              site.consumer = false;
            }
          },
        });
      } catch (e) {
        // A restored cost the instruments stopped inside `start`'s burst may surface as the run's own refusal (`OR-R10`).
        if (!stopped()) throw e;
        return { count: visits, hit: true, ...tally, delivered };
      }
      // ONE settlement per macrotask turn, as a scheduler delivers them.
      s.settle(String(s.added[0]!.id), { items: Array.from({ length: n }, (_, i) => i) });
      for (let i = 1; i < s.added.length && !stopped(); i += 1) {
        await t.turn();
        s.settle(String(s.added[i]!.id), { i });
      }
      if (stopped()) return { count: visits, hit, ...tally, delivered };
      const end = await Promise.race([h.done, t.turn().then(() => t.turn()).then(() => null)]);
      if (end === null || end.outcome !== 'completed') throw new Error(`the ${n}-item runtime run did not settle completed`);
      return { count: visits, hit, ...tally, delivered };
    })();
  } finally {
    t.close();
    unprovoke?.();
    A.load = orig.load;
    proto.apply = orig.apply;
    proto.materialise = orig.materialise;
  }
  if (A.load !== orig.load || proto.apply !== orig.apply || proto.materialise !== orig.materialise) throw new Error('the instruments were not removed');
  return reading;
}

/**
 * **The runtime's work, DERIVED** — the run delivers `5n + 6` inputs: `ingest` dispatched, attempted and settled, the
 * region entered, the `n` branches opened, the `n` tasks dispatched, attempted and settled, the `n` branches arrived, the
 * join, the path end. Each is applied ONCE, and there is ONE materialisation, `done`'s: `outcome()` and `node()` read the
 * accumulator, never a materialisation. Its counted work, from the tick sites: `5n + 6` applies; `ingest` dispatched (1)
 * and its outcome's first `tally()` reading the one entry (1); `ingest` attempted (1) and settled (1); the region
 * entered (1); `n` opened, `n` dispatched, `n` attempted, `n` settled, `n` arrived; the join (1) and the end (1); and the
 * one materialisation — the `n + 1` entries, the instance's `n` opened, `n` settled and itself (`2n + 1`), the one path
 * end (1). `5n + 6 + 7 + 5n + 3n + 3` = `13n + 16`.
 */
const runtimeApplies = (n: number) => 5 * n + 6;
const runtimeWork = (n: number) => 13 * n + 16;
/** The runtime's iteration ceiling — generous, its exact value the runtime's: `CEILING_TIMES` x 40 per item, plus 10,000. */
const runtimeIterationCeiling = (n: number) => CEILING_TIMES * 40 * n + 10_000;

async function runtimeFailing(provoke?: () => () => void): Promise<{ failed: string[]; readings: RuntimeReading[]; iterations: number[] }> {
  const small = await runtimeReading(SMALL, CEILING_TIMES * runtimeWork(SMALL), provoke);
  const large = await runtimeReading(LARGE, CEILING_TIMES * runtimeWork(LARGE), provoke);
  const failed = failing(small, large, runtimeWork);
  if (!failed.includes('ceiling')) {
    if (small.applies !== runtimeApplies(SMALL) || large.applies !== runtimeApplies(LARGE)
      || small.delivered !== runtimeApplies(SMALL) || large.delivered !== runtimeApplies(LARGE)) failed.push('applies');
    if (small.materialisations !== 1 || large.materialisations !== 1) failed.push('materialisations');
  }
  // As the driver's: the counter's ceiling and the materialisation stop are kept as STOPS, and a pass they stopped judges
  // nothing.
  let byCounter = false;
  const iter = async (n: number) => {
    const o = observe(runtimeIterationCeiling(n), false);
    try {
      byCounter = (await runtimeReading(n, CEILING_TIMES * runtimeWork(n), provoke, o.reading)).hit || byCounter;
    } finally {
      o.remove();
    }
    return o.reading;
  };
  const iSmall = await iter(SMALL);
  const iLarge = await iter(LARGE);
  if (!byCounter && iterationsFail(iSmall, iLarge)) failed.push('iterations');
  return { failed, readings: [small, large], iterations: [iSmall.count, iLarge.count] };
}

// --- the provocations, by the cost each restores ----------------------------------------------------------------------

/** Rule 7 (b): every provocation counts its own calls, so one whose wrapper never ran is a failure, not a pass. */
const calls = { n: 0 };
const counted = <F extends (...a: never[]) => unknown>(f: F): F =>
  (function (this: unknown, ...a: Parameters<F>) { calls.n += 1; return f.apply(this, a); }) as unknown as F;

const accProto = Accumulator.prototype as unknown as Record<string, (...a: unknown[]) => unknown> & { counter: unknown };

/** Installs `make(orig)` over `accProto[key]` and returns its removal — a runtime provocation's shape. */
const over = (key: string, make: (orig: (...a: unknown[]) => unknown) => (...a: unknown[]) => unknown) => () => {
  const orig = accProto[key]!;
  accProto[key] = make(orig);
  return () => { accProto[key] = orig; };
};

const SUITE = 'L1-L2 — P39 (e): a large map`s cost as CLOCK-FREE COUNTS at 2,000 and 8,000 items — fold, driver and runtime each pinned exactly and below 6x, every restored cost red';
const DECLARED_CASES = [
  'the FOLD, an `attempted` element per task: foldWith`s counted work over a 2,000- and an 8,000-item map is EXACTLY 13n + 9 and below 6x — and the iteration observer, independent of every counter, below 6x too',
  'the DRIVER, an `attempted` element per task: taskLog.visits EXACTLY n + 2, and 3n + 4 with a `needs` read per settlement, below 6x — a user_action then its resolution visits 3, the records not the calls — and its iterations below 6x',
  'the RUNTIME, an `attempted` element per task, outcome() and node() read after every input once the handle exists, one settlement per macrotask turn: 5n + 6 inputs each applied once, ONE materialisation, the counted work EXACTLY 13n + 16 and below 6x — and its iterations below 6x',
  'PROVOKED, the fold: the spread-per-step restored is red at the ceiling on both observers; a re-tally OUTSIDE precedence() with its ticks removed is red on the iteration observer ALONE',
  'PROVOKED, the driver: the whole-log scan restored in TaskLog.of, counted, is red at the ceiling; the same scan UNCOUNTED is red on the iteration observer ALONE; outputs() rebuilt on every call is red with needs ALONE',
  'PROVOKED, the runtime: a materialisation per input in take, in done`s predicate ALONE, and in the consumer`s outcome() read ALONE is each red at the ceiling; an uncounted search of every input kept so far is red on the iteration observer ALONE',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];
const ran: string[] = [];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    ran.push(DECLARED_CASES[0]!);
    const f = foldFailing();
    equal(f.counts, [foldWork(SMALL), foldWork(LARGE)], `the fold's counted work is 13n + 9 at ${SMALL} and ${LARGE}: [26009, 104009]`);
    equal(f.failed, [], `no clause fails — the work ${f.counts.join(' -> ')} (${(f.counts[1]! / f.counts[0]!).toFixed(2)}x), the iterations ${f.iterations.join(' -> ')} (${(f.iterations[1]! / f.iterations[0]!).toFixed(2)}x)`);
    // The iteration observer is LIVE: the materialisation walks its 2n through Map iterators.
    ok(f.iterations[0]! >= 2 * SMALL && f.iterations[1]! >= 2 * LARGE, `the iteration observer saw the materialisation walk its 2n: ${f.iterations.join(', ')}`);
  });

  test(DECLARED_CASES[1]!, () => {
    ran.push(DECLARED_CASES[1]!);
    const d = driverFailing();
    equal(d.counts, [[SMALL + 2, LARGE + 2], [3 * SMALL + 4, 3 * LARGE + 4]], 'the visits ADR 0121 rule 7 derives: n + 2 plain, 3n + 4 with needs');
    equal([d.plain, d.needs], [[], []], `no clause fails, plain or with needs — iterations ${JSON.stringify(d.iterations)}`);
    // The iteration observer is LIVE on the driver: every settlement walks at least one element (its sub-log, its edges).
    ok(d.iterations.every(([s, l]) => s! >= SMALL && l! >= LARGE), `the iteration observer saw the driver walk: ${JSON.stringify(d.iterations)}`);
    // The COUNT is of RECORDS, not of reads: a parked task's settlement then its resolution — `parked` reads the sub-log of
    // ONE (1), then `advance` the sub-log of TWO (2). A counter of calls would say 2.
    const def = {
      flowId: 'one', version: 1, entry: 't',
      nodes: [{ id: 't', kind: 'task', type: 'Work', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }],
    } as unknown as FlowDefinition;
    const s = new Double();
    const drv = new Driver(def, {
      runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(),
      workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } }, joinPolicy: liveToken as JoinPolicy, onRunFailure: () => {},
    });
    drv.start({});
    const id = s.added[0]!;
    const parked = detail(id, { state: 'user_action', error: 'x' });
    s.fire('task.failed', parked);
    s.fire('task.user_action', parked);
    equal(priv(drv).taskLog.visits, 0, 'a parked settlement reads nothing');
    equal(drv.resolve(id, 'done', { result: 1, actor: 'ana' }), true, 'the arrangement: resolved');
    equal(priv(drv).taskLog.visits, 3, 'parked`s one record and advance`s two — 3');
  });

  test(DECLARED_CASES[2]!, async () => {
    ran.push(DECLARED_CASES[2]!);
    const r = await runtimeFailing();
    equal(r.readings.map((x) => [x.delivered, x.applies, x.materialisations, x.count]),
      [[runtimeApplies(SMALL), runtimeApplies(SMALL), 1, runtimeWork(SMALL)], [runtimeApplies(LARGE), runtimeApplies(LARGE), 1, runtimeWork(LARGE)]],
      'delivered, applied, materialised and counted: 5n + 6, 5n + 6, 1, 13n + 16 at each size');
    equal(r.failed, [], `no clause fails — ${r.readings.map((x) => x.count).join(' -> ')}, iterations ${r.iterations.join(' -> ')}`);
    ok(r.iterations[0]! >= SMALL && r.iterations[1]! >= LARGE, `the iteration observer saw the runtime walk: ${r.iterations.join(', ')}`);
  });

  test(DECLARED_CASES[3]!, () => {
    ran.push(DECLARED_CASES[3]!);
    // P35 of W194's set: `fold`'s loop with a materialisation after every apply — the spread-per-step, restored.
    calls.n = 0;
    const spread = wrapped(accProto, 'apply', (orig) => counted(function (this: unknown, ...a: unknown[]) {
      const moved = orig.apply(this, a);
      (this as { materialise(): unknown }).materialise();
      return moved;
    }), () => foldFailing());
    ok(calls.n > 0, `the spread provocation RAN (${calls.n} applies wrapped)`);
    equal(spread.failed, ['ceiling', 'iterations'], 'the spread-per-step restored: red at the counter`s ceiling AND on the iteration observer');
    // W194's adequacy reader's compound C4: the counts recomputed from scratch at an outcome — OUTSIDE `precedence()` —
    // with their ticks removed (the counter detached for the re-tally; the FIRST tally, `precedence()`'s own, still
    // ticks as it always did). Every tick-count stays exact; only an observer that does not go through `tick` can see it.
    // At every 64th outcome, not every one: still O(the run) per re-tally and so quadratic over it, but its own UNCOUNTED
    // work at 8,000 items — which no ceiling stops in the counter's pass, because nothing there counts it — stays a
    // fraction of a second instead of the eight it took at every outcome.
    calls.n = 0;
    let outcomes = 0;
    const retally = wrapped(accProto, 'withOutcome', (orig) => counted(function (this: unknown, ...a: unknown[]) {
      const self = this as { counts: unknown; counter: unknown; tally(): unknown };
      if (self.counts !== null && ++outcomes % 64 === 0) {
        const counter = self.counter;
        self.counts = null;
        self.counter = undefined;
        self.tally();
        self.counter = counter;
      }
      return orig.apply(this, a);
    }), () => foldFailing());
    ok(calls.n > 0, `the re-tally provocation RAN (${calls.n} outcomes wrapped)`);
    equal(retally.failed, ['iterations'], `a re-tally with its ticks removed: the counter exact and below 6x (${retally.counts.join(' -> ')}), the iteration observer red`);
  });

  test(DECLARED_CASES[4]!, () => {
    ran.push(DECLARED_CASES[4]!);
    // The whole-log scan restored IN the view: every record kept in one array, and `of` handing out the task's records by
    // FILTERING it — counted as it walks, `visits += the log`, which is the cost ADR 0121 removed.
    const scan = (countIt: boolean) => (d: Driver) => {
      const view = priv(d).taskLog;
      const all: LogRecord[] = [];
      const push = view.push.bind(view);
      const of = view.of.bind(view);
      let reads = 0;
      view.push = (r) => { all.push(r); push(r); };
      view.of = counted((taskId: string) => {
        // UNCOUNTED, the scan runs at every 16th read only — still O(the log) a scan, so quadratic over the run, but its
        // own work in the counter's pass, which nothing there stops, stays under a second at 8,000 items.
        if (!countIt && ++reads % 16 !== 0) return of(taskId);
        const sub = all.filter((r) => r.taskId === taskId);
        view.visits += countIt ? all.length : sub.length;
        return sub;
      });
    };
    calls.n = 0;
    const counted_ = driverFailing(scan(true));
    ok(calls.n > 0, `the counted scan provocation RAN (${calls.n} reads)`);
    equal([counted_.plain, counted_.needs], [['ceiling'], ['ceiling']], 'the whole-log scan restored and counted: red at the counter`s ceiling, plain and with needs');
    // The same scan with its ticks REMOVED — W197's adequacy reader's D1: `visits` charged only what is handed out, so the
    // counter stays exact; the scan is a `filter`, and only the iteration observer sees it.
    calls.n = 0;
    const blind = driverFailing(scan(false));
    ok(calls.n > 0, `the uncounted scan provocation RAN (${calls.n} reads)`);
    equal([blind.plain, blind.needs], [['iterations'], ['iterations']], 'the whole-log scan UNCOUNTED: the counter exact, the iteration observer red, plain and with needs');
    // `outputs()` rebuilt from the whole log on EVERY call — its cache dropped first (P39 fact 7's memo, restored worse).
    calls.n = 0;
    const rebuild = driverFailing((d) => {
      const p = priv(d);
      const outputs = p.outputs;
      p.outputs = counted(function (this: DriverPrivate) {
        p.outputsCache = null;
        return outputs.call(p);
      });
    });
    ok(calls.n > 0, `the rebuild provocation RAN (${calls.n} reads)`);
    equal([rebuild.plain, rebuild.needs], [[], ['ceiling']], 'outputs() rebuilt per call: no `needs`, no read — plain stays green; with needs, red at the counter`s ceiling');
  });

  test(DECLARED_CASES[5]!, async () => {
    ran.push(DECLARED_CASES[5]!);
    // `current()` inside `take`: every input applied AND materialised (ADR 0122 consequence 5's own provocation).
    calls.n = 0;
    const take = await runtimeFailing(over('apply', (apply) => counted(function (this: unknown, ...a: unknown[]) {
      const moved = apply.apply(this, a);
      (this as { materialise(): unknown }).materialise();
      return moved;
    })));
    ok(calls.n > 0, `the take provocation RAN (${calls.n} applies wrapped)`);
    equal(take.failed, ['ceiling'], 'a materialisation per input in take: red at the ceiling');
    // `isTerminal(current())` in `settleIfTerminal`: `done`'s predicate materialising — and ONLY the predicate: the outcome
    // read through a materialisation where no consumer read is on the stack (W197's conformity reader, finding 1).
    calls.n = 0;
    const predicate = await runtimeFailing(over('outcomeNow', (outcomeNow) => function (this: unknown, ...a: unknown[]) {
      if (!site.consumer) {
        calls.n += 1;
        (this as { materialise(): unknown }).materialise();
      }
      return outcomeNow.apply(this, a);
    }));
    ok(calls.n > 0, `the predicate provocation RAN (${calls.n} predicate reads wrapped)`);
    equal(predicate.failed, ['ceiling'], 'done`s predicate materialising, alone: red at the ceiling');
    // `RunHandle.outcome()` reading through `current()` — ONLY the consumer's read.
    calls.n = 0;
    const read = await runtimeFailing(over('outcomeNow', (outcomeNow) => function (this: unknown, ...a: unknown[]) {
      if (site.consumer) {
        calls.n += 1;
        (this as { materialise(): unknown }).materialise();
      }
      return outcomeNow.apply(this, a);
    }));
    ok(calls.n > 0, `the outcome() provocation RAN (${calls.n} consumer reads wrapped)`);
    equal(read.failed, ['ceiling'], 'the consumer`s outcome() materialising, alone: red at the ceiling');
    // An UNCOUNTED O(run) step per input — W197's adequacy reader's R9: each input searched for among every input kept so
    // far (a dedupe), with no tick. The counter stays exact; only the iteration observer sees the `includes`. At every 16th
    // input, for the reason the fold's re-tally is sparse: its UNCOUNTED work in the counter's pass has nothing to stop it.
    calls.n = 0;
    const dedupe = await runtimeFailing(over('apply', (apply) => {
      const kept: unknown[] = [];
      return counted(function (this: unknown, ...a: unknown[]) {
        if (kept.push(a[0]) % 16 === 0 && kept.includes(null)) throw new Error('unreachable: no input is null');
        return apply.apply(this, a);
      });
    }));
    ok(calls.n > 0, `the dedupe provocation RAN (${calls.n} applies wrapped)`);
    equal(dedupe.failed, ['iterations'], 'an uncounted search of every input kept so far: the counter exact, the iteration observer red');
  });

  test(DECLARED_CASES[6]!, () => {
    equal(ran, DECLARED_CASES.slice(0, -1), 'every declared case ran, in order — a case that leaves the suite fails here naming itself');
    equal(collected().filter((s) => s.suite === SUITE).reduce((n, s) => n + s.cases.length, 0), DECLARED_CASES.length,
      'and the suite registers exactly the cases it declares');
  });
});
