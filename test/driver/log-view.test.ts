/**
 * Ladder L2 — **the driver's per-task view of its log** — [W195](../../doc/work-items/w195-the-drivers-per-task-view-of-its-log.md)
 * under [P39](../../doc/plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) decision 4,
 * [ADR 0121](../../doc/decisions/0121-the-driver-keeps-a-per-task-view-of-its-log.md), `RN-R13` v0.30.
 *
 * The driver reads one task's records on every settlement (`advance`), on every `resolve` (`parked`), at every run-control
 * call (`inFlight`, `hasParked`) and wherever a node composes a `needs` (`outputs()`). Until W195 each read scanned the
 * WHOLE log (P39 facts 5 and 7), so a run's settlements cost O(run²). The view hands each reader that task's records
 * alone — references to what `append` pushed, in order — and the merge stays in `effectiveOutcome` and `isSuspended`.
 *
 * **Every expected value is computed by a SECOND ROUTE that is not the code under test**: the PUBLIC `effectiveOutcome`
 * and `isSuspended` (`src/driver/log.ts`, unchanged by W195) over the PUBLIC `snapshot()` — the whole log — and the
 * pre-W195 `outputs()` rebuild, copied below verbatim in its algorithm and run over `snapshot()`. The private reads are
 * reached by a cast; nothing here is a public surface.
 *
 * | what | from |
 * |---|---|
 * | an effective outcome, a task's suspension | `spec/outcome-record.md` sections 6 and 7, `RS-R1` — through `log.ts`'s two public functions over the whole log |
 * | what is in flight | `RN-R21`: dispatched, in dispatch order, and no settlement in the log |
 * | whether a person is waited on | `RN-R38`: a parked dispatched task or an unanswered ask |
 * | what a node can reach | `FD-C2`, ADR 0040 rule 2: one entry per `(node, branchPath)` with an effective outcome, its `result` by reference |
 * | the cost | `RN-R13` v0.30, P39 (e): records visited per settlement do not grow with the run — 4x the items, below 6x the visits |
 */
import { equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { effectiveOutcome, isSuspended, type LogRecord } from '../../src/driver/log.ts';
import { parseTaskId } from '../../src/driver/ids.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import { CORPUS_LANGUAGES } from '../definition/corpus-types.ts';

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>;
  pools: Record<string, { type: string }>; predicates: string[];
};

/** L2's scheduler double: it queues nothing and runs nothing; the drain below fires what a scheduler would. */
class Double {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push((task as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

/** What every task returns — `test/fold/accumulator.test.ts`'s value, which every corpus flow's `over`, `needs` and gate key can read. */
const RESULT = (id: string) => ({
  by: id, from: 'ingest', items: ['a', 'b', 'c'], rows: ['p', 'q'], files: ['a', 'b', 'c'], slots: ['x', 'y'],
  config: { threshold: 7 }, runLabel: 'nightly', series: { id: ['s1', 's1', 's2'][Number(id.split(':')[2]) % 3] ?? 's1' },
});

type Entry = { path: string; result: unknown };

/** The private reads W195 moves, reached by a cast — the driver's own, at the moment the test asks. */
interface Private {
  parked(taskId: string): boolean;
  hasParked(): boolean;
  inFlight(): string[];
  outputs(): Map<string, Entry[]>;
  taskLog: { visits: number };
}
const priv = (d: Driver): Private => d as unknown as Private;

/**
 * **The pre-W195 `outputs()`, its algorithm verbatim, over the PUBLIC whole log** — the rebuild the view must equal at
 * every read: grouped by task id in first-record order, each group's effective outcome through the public function,
 * a node's list in that order, an unparseable id and a group with no effective outcome contributing nothing.
 */
function rebuiltOutputs(log: readonly LogRecord[]): Map<string, Entry[]> {
  const byNode = new Map<string, Entry[]>();
  const groups = new Map<string, LogRecord[]>();
  for (const r of log) {
    const g = groups.get(r.taskId);
    if (g) g.push(r);
    else groups.set(r.taskId, [r]);
  }
  for (const [taskId, group] of groups) {
    const eff = effectiveOutcome(group, taskId);
    if (!eff) continue;
    let parts;
    try {
      parts = parseTaskId(taskId);
    } catch {
      continue;
    }
    const list = byNode.get(parts.nodeId);
    if (list) list.push({ path: parts.branchPath, result: eff.result });
    else byNode.set(parts.nodeId, [{ path: parts.branchPath, result: eff.result }]);
  }
  return byNode;
}

/** A map compared node by node — the key ORDER of the outer map is no reader's (`resolveReference` reads `get`). */
function sameOutputs(a: Map<string, Entry[]>, b: Map<string, Entry[]>): string | null {
  const ka = [...a.keys()].sort();
  const kb = [...b.keys()].sort();
  if (JSON.stringify(ka) !== JSON.stringify(kb)) return `nodes ${JSON.stringify(ka)} vs ${JSON.stringify(kb)}`;
  for (const k of ka) {
    const x = a.get(k)!;
    const y = b.get(k)!;
    if (x.length !== y.length) return `${k}: ${x.length} entries vs ${y.length}`;
    for (let i = 0; i < x.length; i += 1) {
      // The ORDER inside a node's list, its path, and its result by IDENTITY — both are the log's own object (`RN-R13`).
      if (x[i]!.path !== y[i]!.path || x[i]!.result !== y[i]!.result) return `${k}[${i}]: ${x[i]!.path} vs ${y[i]!.path}`;
    }
  }
  return null;
}

/** Every read the view serves, against the whole log's answer. Returns the first disagreement, or `null`. */
function disagreement(d: Driver, opts: { outputs: boolean }): string | null {
  const log = d.snapshot();
  const inputs = d.foldInputs();
  const p = priv(d);
  const ids = new Set<string>();
  const dispatched: string[] = [];
  const asked = new Set<string>();
  for (const i of inputs) {
    if (i.kind === 'dispatched') { ids.add(i.taskId); dispatched.push(i.taskId); }
    if (i.kind === 'asked') { ids.add(i.taskId); asked.add(i.taskId); }
  }
  for (const r of log) ids.add(r.taskId);
  for (const id of ids) {
    const want = effectiveOutcome(log, id);
    const got = d.effectiveOutcomeOf(id);
    if (JSON.stringify(want) !== JSON.stringify(got)) return `effectiveOutcomeOf(${id}): ${JSON.stringify(got)} vs ${JSON.stringify(want)}`;
    if (p.parked(id) !== isSuspended(log, id, asked.has(id))) return `parked(${id})`;
  }
  const settled = new Set(log.filter((r) => r.kind === 'outcome').map((r) => r.taskId));
  const inFlight = dispatched.filter((id) => !settled.has(id));
  if (JSON.stringify(p.inFlight()) !== JSON.stringify(inFlight)) return `inFlight ${JSON.stringify(p.inFlight())} vs ${JSON.stringify(inFlight)}`;
  const hasParked = dispatched.some((id) => isSuspended(log, id)) || [...asked].some((id) => isSuspended(log, id, true));
  if (p.hasParked() !== hasParked) return `hasParked ${p.hasParked()} vs ${hasParked}`;
  if (opts.outputs) {
    // `snapshot()` hands out COPIES, so the rebuild's results are compared to the driver's own log by identity below,
    // not to the copies: the rebuild runs over the driver's own records, read through the same private cast.
    const own = (d as unknown as { log: LogRecord[] }).log;
    const why = sameOutputs(p.outputs(), rebuiltOutputs(own));
    if (why !== null) return `outputs(): ${why}`;
  }
  return null;
}

type Drain = 'in order' | 'reverse' | 'alternate failures' | 'parked, attempted, resolved' | 'parked and left' | 'every other parked, resolved last';
/**
 * Six drains. The last parks every OTHER task and settles the rest, so a parked task's resolution comes AFTER a later
 * sibling's settlement — the one entry `outputs()` places before an existing one rather than at the end of its node's list.
 */
const DRAINS: Drain[] = ['in order', 'reverse', 'alternate failures', 'parked, attempted, resolved', 'parked and left', 'every other parked, resolved last'];

interface Driven {
  /** The first disagreement seen at any read, or `null`. */
  why: string | null;
  /** How many reads were compared, how many fold inputs the run appended, and what the arrangement reached. */
  reads: number;
  inputs: number;
  resolvedAfterUserAction: number;
  asksAnswered: number;
  /** Resolutions of a task whose node already had an output from a task first recorded AFTER it — a mid-list placement. */
  placedBefore: number;
  outputEntries: number;
  /** A checkpoint at every rest point of the drain, for the resume case. */
  rests: Checkpoint[];
  atRest: boolean;
}

function driverFor(def: FlowDefinition, s: Double, onFoldInput?: (i: FoldInput) => void): Driver {
  return new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c,
    predicates: new Map(reg.predicates.map((n, i) => [n, () => i % 2 === 0])),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}), languages: CORPUS_LANGUAGES,
    joinPolicy: liveToken as JoinPolicy,
    validateBoundaries: false,
    onRunFailure: () => {},
    ...(onFoldInput ? { onFoldInput } : {}),
  });
}

/**
 * One flow driven to rest under one drain, the view's reads compared at EVERY fold input (`readEvery`) — from inside the
 * driver's own steps, so the reads land mid-step as `advance` and `compose` land — or only at each rest point. Bounded,
 * and the bound is reported, never thrown.
 */
function drive(def: FlowDefinition, drain: Drain, readEvery: boolean): Driven {
  const s = new Double();
  const out: Driven = { why: null, reads: 0, inputs: 0, resolvedAfterUserAction: 0, asksAnswered: 0, placedBefore: 0, outputEntries: 0, rests: [], atRest: false };
  const ref: { d: Driver | null } = { d: null };
  const check = (outputs: boolean) => {
    if (out.why !== null || ref.d === null) return;
    out.reads += 1;
    out.why = disagreement(ref.d, { outputs });
  };
  const d = ref.d = driverFor(def, s, readEvery ? () => check(true) : undefined);
  d.start(RESULT('payload'));
  const settledIds = new Set<string>();
  let flip = false;
  let other = false;
  for (let guard = 0; guard < 400; guard += 1) {
    // Reading every fold input, outputs() is caught up at every read; reading only at rest, it is NOT read here at all —
    // only at the end — so the catch-up there spans every record the driver's own `needs` reads did not.
    check(readEvery);
    out.rests.push(d.checkpoint());
    const open = s.added.filter((id) => !settledIds.has(id));
    if (open.length > 0) {
      const id = drain === 'reverse' ? open[open.length - 1]! : open[0]!;
      settledIds.add(id);
      const detail = { id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: RESULT(id) };
      if (drain === 'parked, attempted, resolved' || drain === 'parked and left' || (drain === 'every other parked, resolved last' && (other = !other))) {
        s.fire('task.running', { id, state: 'running', attemptNumber: 1, attempts: 0, timestamp: 1 });
        s.fire('task.failed', { ...detail, state: 'user_action', error: 'boom' });
        s.fire('task.user_action', { ...detail, state: 'user_action', error: 'boom' });
      } else if (drain === 'alternate failures' && (flip = !flip)) {
        s.fire('task.failed', { ...detail, state: 'failed', error: 'boom' });
      } else {
        s.fire('task.completed', { ...detail, state: 'done' });
      }
      continue;
    }
    const state = fold(d.foldInputs());
    const waiting = Object.entries(state.nodes).find(([, n]) => n.state === 'suspended');
    if (waiting === undefined || state.outcome !== 'awaiting_action' || drain === 'parked and left') {
      out.atRest = true;
      break;
    }
    const log = d.snapshot();
    const wasSettled = log.some((r) => r.taskId === waiting[0] && r.kind === 'outcome');
    // The arrangement for a mid-list placement: a sibling on the same node, first recorded AFTER this task, already has an
    // effective outcome — so this task's entry belongs BEFORE it in the node's first-record order.
    const node = parseTaskId(waiting[0]).nodeId;
    const firstAt = log.findIndex((r) => r.taskId === waiting[0]);
    if (firstAt >= 0 && log.some((r, i) => i > firstAt && r.taskId !== waiting[0] && parseTaskId(r.taskId).nodeId === node &&
      log.findIndex((x) => x.taskId === r.taskId) > firstAt && effectiveOutcome(log, r.taskId) !== null)) out.placedBefore += 1;
    if (!d.resolve(waiting[0], 'done', { result: RESULT(waiting[0]), actor: 'ana' })) { out.atRest = true; break; }
    if (wasSettled) out.resolvedAfterUserAction += 1;
    else out.asksAnswered += 1;
  }
  check(true);
  out.inputs = d.foldInputs().length;
  out.outputEntries = [...priv(d).outputs().values()].reduce((n, l) => n + l.length, 0);
  return out;
}

const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
const DEFS: Record<string, FlowDefinition> = {};
for (const name of validNames) DEFS[name] = JSON.parse(await readText(`${EX}/valid/${name}`)) as FlowDefinition;

/** A `map` over `n` items, its branch task `work`, each preceded by `task.running` carrying `attemptNumber` 1 (P39 fact 6). */
function mapRun(n: number, needs: boolean): { visits: number; settled: number; inputs: number } {
  const def = {
    flowId: 'big-map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'Work', edges: [{ to: 'each' }] },
      { id: 'each', kind: 'map', over: 'items', branch: 'work' },
      // With `needs`, a SECOND branch task, `post`, composes a reference to `ingest`'s output: it is entered when its
      // instance's `work` settles, so `outputs()` is read once per SETTLEMENT with the log one record longer each time —
      // the case P39 fact 7 says a length-keyed memo misses by construction. (`work` itself is dispatched for every
      // item in ONE step, over a one-record log, so a `needs` there would not see the run grow.)
      { id: 'work', kind: 'task', type: 'Work', edges: [{ to: needs ? 'post' : 'collect' }] },
      ...(needs ? [{ id: 'post', kind: 'task', type: 'Work', needs: { ctx: 'ingest', it: '.' }, edges: [{ to: 'collect' }] }] : []),
      { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const s = new Double();
  let inputs = 0;
  const d = new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(),
    workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } }, joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => { throw new Error(`the arrangement failed: ${f.kind}`); },
    onFoldInput: () => { inputs += 1; },
  });
  d.start({});
  let settled = 0;
  // The queue walked by INDEX: a `shift()` here would be the harness's own quadratic (P39 fact 4).
  for (let q = 0; q < s.added.length; q += 1) {
    const id = s.added[q]!;
    s.fire('task.running', { id, state: 'running', attemptNumber: 1 });
    const result = id.includes(':ingest:') ? { items: Array.from({ length: n }, (_, i) => i) } : { i: q };
    s.fire('task.completed', { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result });
    settled += 1;
  }
  if (fold(d.foldInputs()).outcome !== 'completed') throw new Error('the arrangement did not complete');
  return { visits: priv(d).taskLog.visits, settled, inputs };
}

suite('L2 — RN-R13 v0.30: the driver`s per-task view of its log — every per-task read equal to the whole log`s, outputs() equal to a rebuild, linear in its settlements', (test) => {
  test('every per-task read — effectiveOutcomeOf, parked, inFlight, hasParked, outputs() — equals the whole log`s, at EVERY fold input, over every valid corpus flow under six drains', () => {
    let reads = 0;
    let resolved = 0;
    let answered = 0;
    let entries = 0;
    let placedBefore = 0;
    for (const name of validNames) {
      for (const drain of DRAINS) {
        const r = drive(DEFS[name]!, drain, true);
        placedBefore += r.placedBefore;
        // Reading at EVERY fold input is the claim: at least one read per element appended (the adequacy reader's G1 —
        // a placement before a later sibling is seen only by a read BETWEEN the sibling's settlement and the resolution).
        ok(r.reads >= r.inputs, `${name} / ${drain}: ${r.reads} reads over ${r.inputs} fold inputs`);
        equal(r.why, null, `${name} / ${drain}: the view and the whole log agree at every read`);
        ok(r.atRest, `${name} / ${drain}: the drain came to rest in 400 steps`);
        reads += r.reads;
        resolved += r.resolvedAfterUserAction;
        answered += r.asksAnswered;
        entries += r.outputEntries;
      }
    }
    // The ARRANGEMENT — the corpus reached the reads that merge: a `user_action` settlement then its resolution (a sub-log of
    // two records, the effective outcome the RESOLUTION's), an ask answered (a resolution with no settlement, `OR-R8`'s
    // derived record), and a `needs` flow's projection non-empty.
    ok(resolved > 0, `a user_action settlement then its resolution was read (${resolved})`);
    ok(answered > 0, `an ask answered was read (${answered})`);
    ok(entries > 0, `outputs() held entries (${entries})`);
    ok(placedBefore > 0, `a resolution placed BEFORE a later sibling's entry was read (${placedBefore})`);
    ok(reads > validNames.length * DRAINS.length, `reads compared at every fold input (${reads})`);
  });

  test('outputs() caught up over a LONG tail equals the rebuild — read once, at the end, so one catch-up spans many records', () => {
    let runs = 0;
    for (const name of validNames) {
      for (const drain of DRAINS) {
        const r = drive(DEFS[name]!, drain, false);
        equal(r.why, null, `${name} / ${drain}: equal at every rest point`);
        runs += 1;
      }
    }
    equal(runs, validNames.length * DRAINS.length, 'every valid corpus flow, under every drain');
    ok(validNames.length >= 20, `the corpus is the valid examples (${validNames.length})`);
  });

  test('a SECOND settlement of a settled task — a done, then a user_action for the same id — moves its effective outcome back to none, and every read follows the whole log, outputs() REMOVING the entry and placing it again on its resolution', () => {
    // The conformity reader's C4: `ID-R4` asks only whether the id was dispatched, so a settlement event repeated for a
    // settled task is appended (`settle`), and `RS-R1` governs resolutions alone — the log then ends in `user_action`.
    const s = new Double();
    const d = driverFor(DEFS['map-with-context.flow.json']!, s);
    d.start(RESULT('payload'));
    const detail = (id: string) => ({ id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: RESULT(id) });
    for (let q = 0; q < s.added.length; q += 1) s.fire('task.completed', { ...detail(s.added[q]!), state: 'done' });
    // The LAST task the run dispatched — `publish`, whose edge goes to an end — so routing it again re-dispatches nothing.
    const first = s.added[s.added.length - 1]!;
    equal(parseTaskId(first).nodeId, 'publish', 'the arrangement: the leaf task');
    equal(disagreement(d, { outputs: true }), null, 'every task settled once');
    const node = parseTaskId(first).nodeId;
    const has = () => (priv(d).outputs().get(node) ?? []).some((e) => e.path === parseTaskId(first).branchPath);
    equal(has(), true, 'the arrangement: its output is an entry');
    s.fire('task.failed', { ...detail(first), state: 'user_action', error: 'again' });
    s.fire('task.user_action', { ...detail(first), state: 'user_action', error: 'again' });
    equal(d.snapshot().filter((r) => r.taskId === first).map((r) => (r as { terminalState?: string }).terminalState), ['done', 'user_action'],
      'the arrangement: the log holds both settlements');
    equal(disagreement(d, { outputs: true }), null, 'after the second settlement');
    equal(has(), false, 'and its entry REMOVED — the task has no effective outcome');
    equal(d.resolve(first, 'done', { result: RESULT('again'), actor: 'ana' }), true, 'the arrangement: parked again, so resolvable');
    equal(disagreement(d, { outputs: true }), null, 'after its resolution');
    equal(has(), true, 'and its entry placed AGAIN');
  });

  test('a RESUMED run — the view rebuilt by the replay, at rest — answers every read as the whole log does, before and after its parked tasks are resolved', () => {
    let resumed = 0;
    let parkedSeen = 0;
    for (const name of validNames) {
      for (const drain of ['in order', 'parked and left'] as Drain[]) {
        const r = drive(DEFS[name]!, drain, false);
        for (const cp of r.rests) {
          const s = new Double();
          const d = driverFor(DEFS[name]!, s);
          d.resume(cp);
          resumed += 1;
          equal(disagreement(d, { outputs: true }), null, `${name} / ${drain}: resumed at ${cp.events.length} events`);
          const state = fold(d.foldInputs());
          for (const [id, n] of Object.entries(state.nodes)) {
            if (n.state !== 'suspended') continue;
            parkedSeen += 1;
            equal(priv(d).parked(id), true, `${name}: ${id} is parked on the resumed driver`);
            d.resolve(id, 'done', { result: RESULT(id), actor: 'ana' });
            equal(disagreement(d, { outputs: true }), null, `${name} / ${drain}: after resolving ${id} on the resumed driver`);
          }
        }
      }
    }
    ok(resumed > validNames.length, `resumed from every rest point (${resumed})`);
    ok(parkedSeen > 0, `a resumed run held a parked task and resolved it (${parkedSeen})`);
  });

  test('the view holds the log`s OWN records — every record in it IS one the log holds, and each task`s are in append order', () => {
    const r = drive(DEFS['map-with-context.flow.json'] ?? DEFS[validNames[0]!]!, 'parked, attempted, resolved', false);
    equal(r.why, null, 'the arrangement agreed');
    const s = new Double();
    const d = driverFor(DEFS['map-with-context.flow.json']!, s);
    d.start(RESULT('payload'));
    for (const id of [...s.added]) {
      s.fire('task.failed', { id, state: 'user_action', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, error: 'x' });
      s.fire('task.user_action', { id, state: 'user_action', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, error: 'x' });
      d.resolve(id, 'done', { result: RESULT(id), actor: 'ana' });
    }
    const log = (d as unknown as { log: LogRecord[] }).log;
    const view = (d as unknown as { taskLog: { byTask: Map<string, LogRecord[]> } }).taskLog.byTask;
    const flat = [...view.values()].flat();
    equal(flat.length, log.length, 'as many records as the log, no more');
    ok(flat.every((x) => log.includes(x)), 'each one the log`s own object — by reference, never a copy (RN-R13)');
    for (const [taskId, sub] of view) {
      equal(sub.map((x) => log.indexOf(x)), log.flatMap((x, i) => x.taskId === taskId ? [i] : []), `${taskId}: the records the log holds for it, in append order`);
    }
    ok([...view.values()].some((sub) => sub.length === 2), 'the arrangement: a sub-log of two — a settlement and its resolution');
  });

  test('the step`s queues drain FIRST-IN FIRST-OUT — an INLINE pool`s 300 attempt starts heard inside addTask, appended at the step`s end in the order heard (RN-R40), and nothing kept once taken', () => {
    // W195's declaration-step profile: `attemptsPending` was drained by `Array.prototype.shift`, O(n) a call, and an inline
    // pool fills it with one element per item of a `map` in ONE step. The queue is now a head index; this holds its ORDER.
    const n = 300;
    const def = {
      flowId: 'inline-map', version: 1, entry: 'each',
      nodes: [
        { id: 'each', kind: 'map', over: 'items', branch: 'work' },
        { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const s = new Double();
    // The INLINE pool: `task.running` fires inside `addTask`, on the driver's own step (`RN-R40`).
    const inline = { addTask: (task: unknown) => { s.addTask(task); s.fire('task.running', { id: (task as { id: string }).id, state: 'running', attemptNumber: 1 }); },
      addEventListener: (t: string, fn: (e: { detail: unknown }) => void) => s.addEventListener(t, fn) };
    type Q = { length: number; items: unknown[] } & Iterable<{ taskId: string }>;
    const ref: { d: Driver | null } = { d: null };
    // MID-DRAIN, on each `attempted` element as it is appended: the queue no longer holds the element just taken —
    // neither in what it would still hand on nor in its backing array (a slot is CLEARED as it is taken).
    const heldAfterTake: string[] = [];
    const d = ref.d = new Driver(def, {
      runId: 'r1', scheduler: inline, createTask: (c) => c, predicates: new Map(),
      workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } }, joinPolicy: liveToken as JoinPolicy,
      onRunFailure: (f) => { throw new Error(`the arrangement failed: ${f.kind}`); },
      onFoldInput: (i) => {
        if (i.kind !== 'attempted' || ref.d === null) return;
        const q = (ref.d as unknown as { attemptsPending: Q }).attemptsPending;
        if ([...q].some((a) => a.taskId === i.taskId) || JSON.stringify(q.items).includes(`"${i.taskId}"`)) heldAfterTake.push(i.taskId);
      },
    });
    d.start({ items: Array.from({ length: n }, (_, i) => i) });
    const kinds = d.foldInputs().map((i) => i.kind);
    const dispatched = d.foldInputs().flatMap((i) => i.kind === 'dispatched' ? [i.taskId] : []);
    const attempted = d.foldInputs().flatMap((i) => i.kind === 'attempted' ? [i.taskId] : []);
    equal(dispatched.length, n, 'the arrangement: every item dispatched in the one step');
    equal(attempted, dispatched, 'RN-R40 — one `attempted` element per start heard, in the order HEARD, which is dispatch order');
    equal(kinds.indexOf('attempted'), kinds.lastIndexOf('dispatched') + 1, 'appended when the step ENDS — after its last dispatch, never between two of its elements');
    equal(kinds.slice(kinds.indexOf('attempted')).every((k) => k === 'attempted'), true, 'and nothing of the step after them');
    // Taken means released: the queue keeps no reference to an element it handed on.
    equal(heldAfterTake, [], 'mid-drain, no element is still held once taken — its slot cleared');
    const q = (d as unknown as { attemptsPending: Q }).attemptsPending;
    equal([q.length, [...q].length, q.items.length], [0, 0, 0], 'empty at rest, and the backing array DROPPED — not 300 cleared slots');
  });

  test('a throw on an `attempted` element with others QUEUED behind it — the run halts, and the rest are still appended by the step`s end, in the order heard (RN-R40, OR-R10 v0.19)', () => {
    const def = {
      flowId: 'inline-map', version: 1, entry: 'each',
      nodes: [
        { id: 'each', kind: 'map', over: 'items', branch: 'work' },
        { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const s = new Double();
    const inline = { addTask: (task: unknown) => { s.addTask(task); s.fire('task.running', { id: (task as { id: string }).id, state: 'running', attemptNumber: 1 }); },
      addEventListener: (ty: string, fn: (e: { detail: unknown }) => void) => s.addEventListener(ty, fn) };
    let thrown = 0;
    const d = new Driver(def, {
      runId: 'r1', scheduler: inline, createTask: (c) => c, predicates: new Map(),
      workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } }, joinPolicy: liveToken as JoinPolicy,
      onRunFailure: () => {},
      onFoldInput: (i) => { if (i.kind === 'attempted' && thrown === 0) { thrown += 1; throw new Error('the consumer'); } },
    });
    let reached = false;
    try { d.start({ items: ['a', 'b', 'c'] }); } catch { reached = true; }
    equal(reached, true, 'the arrangement: the throw reached start()`s caller');
    const tail = d.foldInputs().map((i) => i.kind).filter((k) => k === 'attempted' || k === 'halted');
    equal(tail, ['attempted', 'halted', 'attempted', 'attempted'], 'the first attempt, the halt after it, then the two still queued — appended SILENTLY at the step`s end');
    equal(d.foldInputs().flatMap((i) => i.kind === 'attempted' ? [i.taskId] : []), s.added, 'in the order heard');
  });

  test('the COUNT: records visited per run grow LINEARLY in the items — 4x the items, below 6x the visits — with an `attempted` element per task, with and without a `needs` read per settlement', () => {
    for (const needs of [false, true]) {
      const small = mapRun(500, needs);
      const large = mapRun(2000, needs);
      // The ARRANGEMENT: 1 + n settlements, and with `task.running` before each, 1 + 4 + 5n inputs (dispatched, attempted,
      // outcome per item; the map's opened and the branch's arrived region events; the ingest's three; the join and the end).
      // ingest, then one task per item — two with `needs` (work, post).
      equal([small.settled, large.settled], needs ? [1001, 4001] : [501, 2001], `${needs ? 'needs' : 'plain'}: every task settled`);
      // A FLOOR, so a counter that counts nothing fails: every settlement's `advance` reads its own task's records at least once.
      ok(small.visits >= small.settled && large.visits >= large.settled, `${needs ? 'needs' : 'plain'}: at least one visit per settlement (${small.visits}, ${large.visits})`);
      // EXACT, derived from ADR 0121 rule 7 — `of` adds the length of the sub-log it hands out, and every task here has ONE
      // record: plain, one `advance` read per settlement, n + 1. With `needs`, 2n + 1 settlements read once each, plus
      // outputs()`s catch-up — one `of` per record read — whose last read is at the last `post` dispatch, when the log
      // holds ingest and the n `work` settlements (the queue settles every `work` before any `post`): n + 1. So 3n + 2.
      equal([small.visits, large.visits], needs ? [3 * 500 + 2, 3 * 2000 + 2] : [501, 2001], `${needs ? 'needs' : 'plain'}: the visits rule 7 derives`);
      // Not module state (rule 7): a fresh run counts from zero, so two runs of one size count the same.
      equal(mapRun(500, needs).visits, small.visits, `${needs ? 'needs' : 'plain'}: a second fresh run counts the same`);
      const ratio = large.visits / small.visits;
      // Linear is 4x (2000 / 500); a whole-log scan per settlement is 16x. P39 (e)'s bound: below 6x.
      ok(ratio < 6, `${needs ? 'needs' : 'plain'}: ${large.visits} / ${small.visits} = ${ratio.toFixed(2)}x, below 6x`);
    }
  });

  test('the COUNT is of RECORDS, not of reads — a sub-log of two, a user_action and its resolution, counts two', () => {
    const def = {
      flowId: 'one', version: 1, entry: 't',
      nodes: [{ id: 't', kind: 'task', type: 'Work', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }],
    } as unknown as FlowDefinition;
    const s = new Double();
    const d = new Driver(def, {
      runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(),
      workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } }, joinPolicy: liveToken as JoinPolicy, onRunFailure: () => {},
    });
    d.start({});
    const id = s.added[0]!;
    const detail = { id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, error: 'x' };
    s.fire('task.failed', { ...detail, state: 'user_action' });
    s.fire('task.user_action', { ...detail, state: 'user_action' });
    // A user_action settlement routes nothing, so nothing is read: 0.
    equal(priv(d).taskLog.visits, 0, 'a parked settlement reads nothing');
    equal(d.resolve(id, 'done', { result: 1, actor: 'ana' }), true, 'the arrangement: resolved');
    // resolve(): `parked` reads the one record (1); then `advance` reads the sub-log of TWO (2) — 3. Counting reads would say 2.
    equal(priv(d).taskLog.visits, 3, 'parked`s one record and advance`s two');
  });

  test('the SECOND observer, independent of the count: the driver`s source hands `effectiveOutcome` and `isSuspended` one task`s records, and reads `this.log` whole only where a whole log is the answer', async () => {
    // The count sees only reads that go through `TaskLog.of` — a scan restored by handing `this.log` to the merge again
    // would leave it green (P39's W194 adequacy finding C4, rule 8 (c)'s LIMIT). So the SOURCE is read: node and deno read
    // the file; the browser bundle does not carry it, and the skip is asserted.
    if (ROOT === '/__repo__/') {
      ok(typeof (globalThis as Record<string, unknown>).Deno === 'undefined', 'the source read is skipped ONLY in the browser bundle');
      return;
    }
    const src = await readText(`${ROOT}src/driver/driver.ts`);
    // Code only: a line comment and a JSDoc/block comment line are prose, which may name the old scan.
    const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    const calls = code.match(/\b(effectiveOutcome|isSuspended)\([^,]*/g) ?? [];
    // At least five: advance, outputs()`s catch-up, parked, hasParked, effectiveOutcomeOf — a FLOOR, so a refactor that routes
    // one through another is not refused (the adequacy reader's N3), and a deleted read fails its behaviour elsewhere.
    ok(calls.length >= 5, `the merge is called where the driver reads a task (${calls.length})`);
    // inFlight reads no merge, so the calls above cannot see it: its body is read too (the adequacy reader's G5).
    const from = code.indexOf('  private inFlight(): string[] {');
    const body = code.slice(from, code.indexOf('\n  }\n', from));
    ok(from > 0 && body.includes('this.taskLog.of('), 'inFlight reads each dispatched task through the view');
    equal(body.match(/this\.(log|inputs)\b/g), null, 'and never the whole log or the whole input sequence (ADR 0121 rule 3)');
    equal(calls.filter((c) => !c.includes('(this.taskLog.of(')), [],
      'every effectiveOutcome / isSuspended call is handed `this.taskLog.of(…)` — one task`s records, never the whole log (ADR 0121 rule 3)');
    equal((code.match(/\bthis\.log\b(\.\w+|\[[^\]]*\])?/g) ?? []).sort(),
      ['this.log.length', 'this.log.map', 'this.log.push', 'this.log[c.at]'],
      '`this.log` is read whole only by snapshot() (map), pushed by append, and indexed by outputs()`s catch-up (length, [c.at]) — ADR 0121 rule 5');
  });
});
