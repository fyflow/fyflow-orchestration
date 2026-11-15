/**
 * **L2 — a settlement heard INSIDE the driver's own step** — `spec/run-state.md` `RN-R46`,
 * [ADR 0146](../../doc/decisions/0146-a-settlement-heard-inside-the-drivers-own-step-is-taken-when-that-step-ends.md),
 * [W232](../../doc/work-items/w232-a-settlement-inside-the-drivers-own-step-is-taken-when-that-step-ends.md).
 *
 * `SchedulerLike` lets a scheduler settle a task inside `addTask`; `fyflow-scheduler` at the pin does not, a consumer's
 * double or own scheduler may. The rule: such a settlement is COPIED where it is heard and appended and routed when the
 * step that dispatched it has ended — so the log is the one a scheduler that settles LATER produces.
 *
 * **Most expected values here are that later log**, produced by the suite's `Fake` settled at rest in dispatch order —
 * a sequence the rest of `test/driver/**` and `test/matrix/**` already holds to the spec by hand. A differential cannot
 * see a payload (a `dispatched` element carries none), so task INPUTS, ids and join values are also written by hand from
 * `ID-R6`, `JP-R12` and `JP-R15`. Both doubles settle in dispatch order, so no case depends on completion order.
 */
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { Driver, type Checkpoint, type RunFailure } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import { Fake } from '../matrix/run.ts';

const SUITE = 'W232 — L2: a settlement heard inside the driver`s own step is copied there and taken when that step ends (RN-R46)';

const reg = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as {
  workers: never; nodeTypes: never; pools?: never; groups?: Record<string, unknown>;
};

/** What a scripted scheduler does with one task, or `undefined` to leave it in flight. */
type Script = (taskId: string) => { state: 'done' | 'failed' | 'user_action'; result: unknown } | undefined;

/** Settles inside `addTask`: the suite's `Fake` with one line added, so both doubles fire the same events. */
class Sync extends Fake {
  private readonly script: Script;
  /** The stack depth at which each task was handed over, by task id — the probe for `RN-R46`'s flat stack. */
  readonly depth = new Map<string, number>();
  constructor(script: Script) { super(); this.script = script; }
  override addTask(t: unknown): void {
    super.addTask(t);
    const id = (t as { id: string }).id;
    this.depth.set(id, (new Error().stack ?? '').split('\n').length);
    const s = this.script(id);
    if (s !== undefined) this.settle(id, s.state, s.result);
  }
}

/** A double whose `addTask` does what the case says, after recording the task: settle it, settle another, fire `task.running`. */
class Hooked extends Fake {
  private readonly onAdd: (id: string, sch: Hooked) => void;
  constructor(onAdd: (id: string, sch: Hooked) => void) { super(); this.onAdd = onAdd; }
  override addTask(t: unknown): void {
    super.addTask(t);
    this.onAdd((t as { id: string }).id, this);
  }
  /** `task.running`, as an inline pool fires it inside `addTask` (`RN-R40`). */
  running(id: string, attemptNumber: number): void {
    (this as unknown as { fire(type: string, detail: unknown): void }).fire('task.running', { id, state: 'running', attemptNumber, attempts: attemptNumber - 1, timestamp: 1 });
  }
}

/** The settlements heard inside a step and not yet taken, read WHITE-BOX — as `retention.test.ts` walks the driver's fields. */
const waiting = (d: Driver): number => (d as unknown as { settlementsPending: { length: number } }).settlementsPending.length;

interface Opts {
  policy?: JoinPolicy;
  onFoldInput?: (i: FoldInput, seq: number, d: Driver) => void;
  createTask?: (c: unknown) => unknown;
}
interface Run { d: Driver; sch: Fake; failures: RunFailure[]; thrown: unknown }

function build(flow: FlowDefinition, sch: Fake, o: Opts = {}): Run {
  const failures: RunFailure[] = [];
  const ref = {} as { d: Driver };
  ref.d = new Driver(flow, {
    runId: 'r1', scheduler: sch, createTask: (o.createTask ?? ((c: unknown) => c)) as never, predicates: new Map(),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}),
    validateBoundaries: false, now: () => 1, joinPolicy: (o.policy ?? liveToken) as JoinPolicy,
    onRunFailure: (f) => failures.push(f),
    onFoldInput: (i, seq) => o.onFoldInput?.(i, seq, ref.d),
  });
  return { d: ref.d, sch, failures, thrown: null };
}

/** The script on a scheduler that settles INSIDE `addTask`. */
function runSync(flow: FlowDefinition, script: Script, o: Opts = {}): Run & { sch: Sync } {
  const sch = new Sync(script);
  const r = build(flow, sch, o);
  try { r.d.start({}); } catch (e) { r.thrown = e; }
  return r as Run & { sch: Sync };
}

/** The same script on a scheduler that settles LATER: each task at rest, in dispatch order. */
function runLater(flow: FlowDefinition, script: Script, o: Opts = {}): Run {
  const r = build(flow, new Fake(), o);
  try { r.d.start({}); } catch (e) { r.thrown = e; }
  settleRest(r, script, 0);
  return r;
}

function settleRest(r: Run, script: Script, from: number): void {
  for (let i = from; i < r.sch.added.length; i += 1) {
    const id = r.sch.added[i]!.id;
    const s = script(id);
    if (s !== undefined) r.sch.settle(id, s.state, s.result);
  }
}

const ids = (r: Run): string[] => r.sch.added.map((t) => t.id);
const input = (r: Run, id: string): unknown => (r.sch.added.find((t) => t.id === id)?.payload as { input?: unknown } | undefined)?.input;
const kinds = (r: Run): string[] => r.d.foldInputs().map((e) => e.kind === 'outcome' ? `outcome ${e.record.taskId}`
  : e.kind === 'dispatched' ? `dispatched ${e.taskId}` : e.kind === 'region' ? `${e.event.type} ${e.event.regionId}:${e.event.branchPath}`
  : e.kind === 'attempted' ? `attempted ${e.taskId} #${e.attemptNumber}` : e.kind);
const node = (id: string): string => id.split(':')[1]!;
const path = (id: string): string => id.split(':')[2]!;
const DONE = (result: unknown) => ({ state: 'done' as const, result });

const task = (id: string, type: string, to: string, more: Record<string, unknown> = {}) => ({ id, kind: 'task', type, ...more, edges: [{ to }] });
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const flow = (flowId: string, entry: string, nodes: unknown[]): FlowDefinition => ({ flowId, version: 1, entry, nodes: [...nodes, END] }) as unknown as FlowDefinition;

/** `ingest → a → b → done`. */
const SEQUENCE = flow('w232-seq', 'ingest', [task('ingest', 'IngestWorker', 'a'), task('a', 'ExtractWorker', 'b'), task('b', 'PublishWorker', 'done')]);
/** `ingest → F[a, b, c] → J → after`. */
const FANOUT = flow('w232-fanout', 'ingest', [
  task('ingest', 'IngestWorker', 'F'), { id: 'F', kind: 'fanout', branches: ['a', 'b', 'c'] },
  task('a', 'ExtractWorker', 'J'), task('b', 'ScoreWorker', 'J'), task('c', 'ReviewWorker', 'J'),
  { id: 'J', kind: 'join', of: 'F', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `FANOUT` with `a` OPTIONAL: it may settle `failed`, and with no failed edge its branch is lost. */
const FANOUT_OPT = flow('w232-fanout-opt', 'ingest', [
  task('ingest', 'IngestWorker', 'F'), { id: 'F', kind: 'fanout', branches: ['a', 'b', 'c'] },
  task('a', 'ExtractWorker', 'J', { optional: true }), task('b', 'ScoreWorker', 'J'), task('c', 'ReviewWorker', 'J'),
  { id: 'J', kind: 'join', of: 'F', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `a` fails, `b` is out of retries and parks, `c` is done: the two settlements that are not `done`, inside `addTask`. */
const NOT_DONE: Script = (id) => node(id) === 'a' ? { state: 'failed', result: null }
  : node(id) === 'b' ? { state: 'user_action', result: null } : DONE({ n: node(id) });

/** `ingest → M(over items: t) → J → after`. */
const MAP = flow('w232-map', 'ingest', [
  task('ingest', 'IngestWorker', 'M'), { id: 'M', kind: 'map', over: 'items', branch: 't' }, task('t', 'ScoreWorker', 'J'),
  { id: 'J', kind: 'join', of: 'M', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `ingest → F[a → G[x, y] → GJ, b] → J → after`: a fan-out in a fan-out. */
const NESTED = flow('w232-nested', 'ingest', [
  task('ingest', 'IngestWorker', 'F'), { id: 'F', kind: 'fanout', branches: ['a', 'b'] },
  task('a', 'ExtractWorker', 'G'), { id: 'G', kind: 'fanout', branches: ['x', 'y'] },
  task('x', 'ScoreWorker', 'GJ'), task('y', 'ReviewWorker', 'GJ'), { id: 'GJ', kind: 'join', of: 'G', edges: [{ to: 'J' }] },
  task('b', 'MergeWorker', 'J'), { id: 'J', kind: 'join', of: 'F', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
const UNTIL = { path: 'input.ok', op: 'eq', value: true };
/** `ingest → L(work) → J → after`. */
const LOOP = (maxIterations: number) => flow('w232-loop', 'ingest', [
  task('ingest', 'IngestWorker', 'L'), { id: 'L', kind: 'loop', branch: 'work', until: UNTIL, maxIterations },
  task('work', 'ScoreWorker', 'J'), { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `ingest → M(pre → L(work) → LJ) → MJ → after`: a loop in each map instance. */
const LOOP_IN_MAP = flow('w232-loop-in-map', 'ingest', [
  task('ingest', 'IngestWorker', 'M'), { id: 'M', kind: 'map', over: 'items', branch: 'pre' }, task('pre', 'ExtractWorker', 'L'),
  { id: 'L', kind: 'loop', branch: 'work', until: UNTIL, maxIterations: 3 }, task('work', 'ScoreWorker', 'LJ'),
  { id: 'LJ', kind: 'join', of: 'L', edges: [{ to: 'MJ' }] }, { id: 'MJ', kind: 'join', of: 'M', edges: [{ to: 'after' }] },
  task('after', 'PublishWorker', 'done'),
]);
/** `ingest → L(plan → M(roll) → MJ → fit) → J → after`: a map in each round. */
const MAP_IN_LOOP = flow('w232-map-in-loop', 'ingest', [
  task('ingest', 'IngestWorker', 'L'), { id: 'L', kind: 'loop', branch: 'plan', until: UNTIL, maxIterations: 2 },
  task('plan', 'ExtractWorker', 'M'), { id: 'M', kind: 'map', over: 'items', branch: 'roll' }, task('roll', 'ScoreWorker', 'MJ'),
  { id: 'MJ', kind: 'join', of: 'M', edges: [{ to: 'fit' }] }, task('fit', 'MergeWorker', 'J'),
  { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `ingest → L(pre → F[a, b] → FJ) → J → after`: a fan-out in the body — with a policy firing on the FIRST arrival, W232's shape 1. */
const FANOUT_IN_LOOP = flow('w232-fanout-in-loop', 'ingest', [
  task('ingest', 'IngestWorker', 'L'), { id: 'L', kind: 'loop', branch: 'pre', until: UNTIL, maxIterations: 2 },
  task('pre', 'ExtractWorker', 'F'), { id: 'F', kind: 'fanout', branches: ['a', 'b'] },
  task('a', 'ScoreWorker', 'FJ'), task('b', 'ReviewWorker', 'FJ'), { id: 'FJ', kind: 'join', of: 'F', edges: [{ to: 'J' }] },
  { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);

/** The common script: `ingest` and `plan` hand a two-item list, a loop is done on its round 1, everything else returns its node. */
const COMMON: Script = (id) => {
  const n = node(id);
  if (n === 'ingest' || n === 'plan') return DONE({ items: ['p', 'q'], n });
  if (n === 'work' || n === 'fit' || n === 'a' || n === 'b') return DONE({ ok: path(id).split('.').pop() === '1' || path(id) === '1', n, at: path(id) });
  return DONE({ n, at: path(id) });
};

// --- W233, Q813: what a step's END takes, when a consumer's callback is what queued it --------------------------------

/** `ingest → L(approve: an ASK) → J → after`: a loop whose body dispatches nothing. */
const ASK_LOOP = (maxIterations: number) => flow('w233-ask-loop', 'ingest', [
  task('ingest', 'IngestWorker', 'L'), { id: 'L', kind: 'loop', branch: 'approve', until: UNTIL, maxIterations },
  { id: 'approve', kind: 'ask', edges: [{ to: 'J' }] }, { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `ingest → F[p: an ask, b] → J → after`. */
const ASK_BESIDE_TASK = flow('w233-ask-beside-task', 'ingest', [
  task('ingest', 'IngestWorker', 'F'), { id: 'F', kind: 'fanout', branches: ['p', 'b'] },
  { id: 'p', kind: 'ask', edges: [{ to: 'J' }] }, task('b', 'ScoreWorker', 'J'),
  { id: 'J', kind: 'join', of: 'F', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** `F[p: an ask, q: an ask] → J → after`, the fan-out the ENTRY: both asks are asked on start()'s own step. */
const TWO_ASKS = flow('w233-two-asks', 'F', [
  { id: 'F', kind: 'fanout', branches: ['p', 'q'] }, { id: 'p', kind: 'ask', edges: [{ to: 'J' }] }, { id: 'q', kind: 'ask', edges: [{ to: 'J' }] },
  { id: 'J', kind: 'join', of: 'F', edges: [{ to: 'after' }] }, task('after', 'PublishWorker', 'done'),
]);
/** The loop's answer for a round: `ok` only in the last one, so `until` holds exactly there. */
const answerOf = (rounds: number) => (id: string) => ({ ok: path(id) === String(rounds - 1), r: path(id) });
/** Every ask answered ON its own `asked` element — a resolution given mid-step, taken when the step ends (`RN-R37`). */
const answering = (answer: (id: string) => unknown, seen?: (id: string) => void) => (i: FoldInput, _s: number, d: Driver) => {
  if (i.kind !== 'asked') return;
  seen?.(i.taskId);
  d.resolve(i.taskId, 'done', { result: answer(i.taskId), actor: 'bot' });
};
/** The asks asked and not answered, in the order asked. */
const parkedAsks = (r: Run): string[] => {
  const f = r.d.foldInputs();
  const answered = new Set(f.flatMap((e) => e.kind === 'resolution' ? [e.record.taskId] : []));
  return f.flatMap((e) => e.kind === 'asked' && !answered.has(e.taskId) ? [e.taskId] : []);
};
/** Drive a run to its end AT REST: each task settled in dispatch order, each ask answered in the order asked. */
function finish(r: Run, script: Script, answer: (id: string) => unknown): void {
  const settled = new Set<string>();
  for (let moved = true; moved;) {
    moved = false;
    for (const t of [...r.sch.added]) {
      if (settled.has(t.id)) continue;
      settled.add(t.id);
      const s = script(t.id);
      if (s !== undefined) { r.sch.settle(t.id, s.state, s.result); moved = true; }
    }
    for (const id of parkedAsks(r)) if (r.d.resolve(id, 'done', { result: answer(id), actor: 'bot' })) moved = true;
  }
}
/** `kinds`, with the task an `asked` or a `resolution` element is for. */
const marks = (r: Run): string[] => {
  const k = kinds(r);
  return r.d.foldInputs().map((e, at) => e.kind === 'asked' ? `asked ${e.taskId}` : e.kind === 'resolution' ? `resolution ${e.record.taskId}` : k[at]!);
};

const DECLARED_CASES = [
  'the log on a scheduler that settles inside addTask IS the log of one that settles later, in dispatch order — a sequence, a fan-out, a map, a fan-out in a fan-out, a loop, a loop in a map, a map in a loop',
  'the two shapes W232`s first attempt moved: a fan-out in a loop`s body under a policy that fires on the first arrival, and a scheduler that settles a held task inside another`s addTask',
  'what each task is HANDED on such a scheduler, by hand: a map`s items, a loop`s rounds, the join values',
  'RN-R19: a checkpoint cut at every element of such a run resumes to the same sequence — the fan-out that was refused included',
  'the stack does not grow with the run: a task is handed over at the same depth at round 1 and at round 2400, and across a map`s instances',
  'a pause, a stop and a cancel called from a callback are taken at the step they were called on, as on a scheduler that settles later',
  'OR-R1 and OR-R6 at the place the event is heard: the record is the copy taken inside addTask, and an uncloneable result is refused there',
  'a throw while a queued settlement is routed is a LISTENER`s: reported once, the run halted, nothing thrown to start()`s caller',
  'RN-R28: a `cancelled` settlement heard inside a step does NOT wait — it halts the run where it is heard',
  'a non-optional task out of retries settled inside addTask: the paired task.failed and task.user_action write ONE record and the run awaits',
  // After W232's readers — each a road the eleven above did not walk (the adequacy reader's survivors).
  'a driver drained more than once: some tasks settled inside addTask, others later at rest, and task.running fired beside a completion',
  'a HALT heard inside a step is taken where it is heard — a cancelled settlement, an uncloneable result, a task this run never dispatched — and what waited is appended after it, routed nowhere',
  'an owner`s cancel and a stop with settlements waiting: a cancel still appends them, a stop drops them, and nothing is left queued',
  'settlements waiting when the run halts are appended in the order heard, and the failure is reported ONCE however many follow',
  'a throw from a take at the step`s end — a callback on `paused`, on `interrupted` — still leaves nothing queued',
  // W233, Q813 — the PENDING CALLS a step's end takes, as the settlements above: one loop, the same log.
  'W233: a loop of 20,000 ask-only rounds, each answered on its own `asked` element, completes — and round 2400 is asked at the depth round 1 was',
  'W233, a control: an ask answered on its `asked` element lands where one answered at rest lands (RN-R37) — the two logs are equal, and every cut resumes',
  'W233, a control: one step`s end takes its attempts, then a pause and an answer in call order, then a stop (RN-R40, RN-R35, RN-R33) — and its settlements after them, or never once deaf',
  'W233, a control: a take that throws halts the run once and reaches the caller; the answer behind it is dropped and the stop pending beside it is still taken (OR-R10)',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const ROWS: [string, FlowDefinition, Script, string][] = [
      ['a sequence', SEQUENCE, COMMON, 'completed'], ['a fan-out', FANOUT, COMMON, 'completed'], ['a map', MAP, COMMON, 'completed'],
      ['a fan-out in a fan-out', NESTED, COMMON, 'completed'], ['a loop', LOOP(3), COMMON, 'completed'],
      ['a loop in a map', LOOP_IN_MAP, COMMON, 'completed'], ['a map in a loop', MAP_IN_LOOP, COMMON, 'completed'],
      // A hundred in flight at once: every settlement of one step waits, not the first few.
      ['a map of 100', MAP, (id) => node(id) === 'ingest' ? DONE({ items: Array.from({ length: 100 }, (_, i) => i) }) : DONE({ n: node(id), at: path(id) }), 'completed'],
      // Every terminal state that ROUTES waits, not `done` alone: a branch lost to a failure, and one parked on a person.
      ['a fan-out with a failed branch and a parked one', FANOUT_OPT, NOT_DONE, 'awaiting_action'],
    ];
    for (const [row, f, script, outcome] of ROWS) {
      const s = runSync(f, script);
      const l = runLater(f, script);
      equal(fold(l.d.foldInputs()).outcome, outcome, `${row}, the CONTROL: the later run ends ${outcome}`);
      equal(s.d.foldInputs(), l.d.foldInputs(), `${row}: the two logs are equal, element for element (RN-R46)`);
      equal(ids(s), ids(l), `${row}: and the tasks are handed over in the same order`);
      equal(s.sch.added.map((t) => t.payload), l.sch.added.map((t) => t.payload), `${row}: with the same payloads`);
      equal(s.failures, [], `${row}: nothing reported`);
    }
  });

  test(DECLARED_CASES[1]!, () => {
    // Shape 1: `arrival-count` needing ONE arrival fires FJ on `a`, before `b` settles.
    const first = {
      ...arrivalCount,
      step: (s: never, e: never) => { const n = arrivalCount.step(s, e); return { ...n, need: Math.min(n.need, 1) }; },
    } as unknown as JoinPolicy;
    const s1 = runSync(FANOUT_IN_LOOP, COMMON, { policy: first });
    const l1 = runLater(FANOUT_IN_LOOP, COMMON, { policy: first });
    ok(kinds(l1).some((k) => k === 'branch.opened L:1'), `the ARRANGEMENT: the later run opened round 1 — ${kinds(l1).join(' | ')}`);
    equal(s1.d.foldInputs(), l1.d.foldInputs(), 'a fan-out in the body, the join fired on the first arrival: the two logs are equal');

    // Shape 2: `F[side, pre → L(work) → LJ] → FJ`; the scheduler HOLDS `side` and settles it inside `work`'s round-0 addTask,
    // after settling `work` itself. Later: the same order at rest — work:1.0, then side.
    const held = flow('w232-held', 'ingest', [
      task('ingest', 'IngestWorker', 'F'), { id: 'F', kind: 'fanout', branches: ['side', 'pre'] },
      task('side', 'ReviewWorker', 'FJ'), task('pre', 'ExtractWorker', 'L'),
      { id: 'L', kind: 'loop', branch: 'work', until: UNTIL, maxIterations: 3 }, task('work', 'ScoreWorker', 'LJ'),
      { id: 'LJ', kind: 'join', of: 'L', edges: [{ to: 'FJ' }] }, { id: 'FJ', kind: 'join', of: 'F', edges: [{ to: 'after' }] },
      task('after', 'PublishWorker', 'done'),
    ]);
    const result = (id: string) => node(id) === 'work' ? { ok: path(id) === '1.2' } : { n: node(id) };
    const sch = new Fake();
    const add = sch.addTask.bind(sch);
    sch.addTask = (t: unknown) => {
      add(t);
      const id = (t as { id: string }).id;
      if (id === 'r1:side:0:0') return; // held
      sch.settle(id, 'done', result(id));
      if (id === 'r1:work:1.0:0') sch.settle('r1:side:0:0', 'done', result('r1:side:0:0'));
    };
    const s2 = build(held, sch);
    s2.d.start({});
    const l2 = build(held, new Fake());
    l2.d.start({});
    const order = ['r1:ingest:-:0', 'r1:pre:1:0', 'r1:work:1.0:0', 'r1:side:0:0', 'r1:work:1.1:0', 'r1:work:1.2:0', 'r1:after:-:0'];
    for (const id of order) l2.sch.settle(id, 'done', result(id));
    equal(fold(l2.d.foldInputs()).outcome, 'completed', 'the CONTROL: the later run, settled in that order, completes');
    equal(s2.d.foldInputs(), l2.d.foldInputs(), 'a held task settled inside another`s addTask: the two logs are equal');
    const cp = s2.d.checkpoint();
    for (let k = 0; k <= cp.events.length; k += 1) {
      const d = build(held, new Fake()).d;
      let refused: unknown = null;
      try { d.resume({ header: cp.header, events: cp.events.slice(0, k) }); } catch (e) { refused = e; }
      equal(refused, null, `and its checkpoint cut at ${k} is not refused at resume (RN-R19)`);
    }
  });

  test(DECLARED_CASES[2]!, () => {
    const m = runSync(MAP, COMMON);
    equal(ids(m), ['r1:ingest:-:0', 'r1:t:0:0', 'r1:t:1:0', 'r1:after:-:0'], 'a map: every instance handed over, then the join`s successor (ID-R6)');
    equal([input(m, 'r1:t:0:0'), input(m, 'r1:t:1:0')], ['p', 'q'], 'each instance its own item');
    equal(input(m, 'r1:after:-:0'), { 0: { n: 't', at: '0' }, 1: { n: 't', at: '1' } }, 'the map`s join hands on the collection keyed by item index (JP-R12)');

    const script: Script = (id) => node(id) === 'work' ? DONE({ ok: path(id) === '3', r: Number(path(id)) }) : DONE({ seed: 1 });
    const l = runSync(LOOP(5), script);
    equal(ids(l), ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:work:2:0', 'r1:work:3:0', 'r1:after:-:0'], 'a loop: four rounds, each at its own path');
    equal([0, 1, 2, 3].map((k) => input(l, `r1:work:${k}:0`)), [{ seed: 1 }, { ok: false, r: 0 }, { ok: false, r: 1 }, { ok: false, r: 2 }],
      'round 0 receives the seed and round k what round k − 1 arrived with (JP-R15)');
    equal(input(l, 'r1:after:-:0'), { last: { ok: true, r: 3 }, iterations: 4, exhausted: false }, 'and the loop`s join hands on its value');

    const lm = runSync(LOOP_IN_MAP, COMMON);
    equal(ids(lm), ['r1:ingest:-:0', 'r1:pre:0:0', 'r1:pre:1:0', 'r1:work:0.0:0', 'r1:work:1.0:0', 'r1:work:0.1:0', 'r1:work:1.1:0', 'r1:after:-:0'],
      'a loop in a map: both instances` round 0, then both round 1 — the order a scheduler settling later in dispatch order gives');
    equal(input(lm, 'r1:after:-:0'), {
      0: { last: { ok: true, n: 'work', at: '0.1' }, iterations: 2, exhausted: false },
      1: { last: { ok: true, n: 'work', at: '1.1' }, iterations: 2, exhausted: false },
    }, 'each instance`s loop value, keyed by item index');
  });

  test(DECLARED_CASES[3]!, () => {
    for (const [row, f] of [['a fan-out', FANOUT], ['a map in a loop', MAP_IN_LOOP], ['a loop in a map', LOOP_IN_MAP]] as const) {
      const whole = runSync(f, COMMON);
      const cp: Checkpoint = whole.d.checkpoint();
      ok(cp.events.length > 8, `${row}, the ARRANGEMENT: a completed log of ${cp.events.length} elements`);
      let redispatched = 0;
      for (let k = 0; k <= cp.events.length; k += 1) {
        const sch = new Sync(COMMON);
        const r = build(f, sch);
        let refused: unknown = null;
        try { r.d.resume({ header: cp.header, events: cp.events.slice(0, k) }); } catch (e) { refused = e; }
        equal(refused, null, `${row}, cut at ${k}: the resume is accepted`);
        equal(r.d.foldInputs().filter((e) => e.kind !== 'resumed'), cp.events, `${row}, cut at ${k}: the sequence, \`resumed\` aside, IS the uninterrupted run's`);
        redispatched += sch.added.length;
      }
      ok(redispatched > 0, `${row}: the CONTROL — ${redispatched} tasks re-dispatched across the cuts`);
    }
  });

  test(DECLARED_CASES[4]!, () => {
    const limit = (Error as { stackTraceLimit?: number }).stackTraceLimit;
    (Error as { stackTraceLimit?: number }).stackTraceLimit = Infinity; // V8 keeps 10 frames by default, which would make every depth equal
    try {
      const ROUNDS = 2401;
      const script: Script = (id) => node(id) === 'work' ? DONE({ ok: path(id) === String(ROUNDS - 1) }) : DONE({ seed: 1 });
      const r = runSync(LOOP(ROUNDS), script);
      equal(r.sch.added.length, ROUNDS + 2, 'the ARRANGEMENT: every round ran');
      const d0 = r.sch.depth.get('r1:work:0:0')!;
      // V8 keeps 10 frames unless told otherwise, and every depth then reads 11 lines — on a stack that grows too.
      ok(d0 > 11, `the ARRANGEMENT: the limit is lifted and the probe reads the real stack — ${d0} lines at round 0`);
      // Round 1 on, each round is opened by the step of the settlement before it; round 0 by `ingest`'s, two frames shallower.
      equal(r.sch.depth.get('r1:work:1:0'), r.sch.depth.get('r1:work:2400:0'), 'a loop: round 2400 is handed over at the depth round 1 was');
      const items = Array.from({ length: 50 }, (_, i) => i);
      const m = runSync(MAP, (id) => node(id) === 'ingest' ? DONE({ items }) : DONE({ n: node(id) }));
      equal(m.sch.depth.get('r1:t:49:0'), m.sch.depth.get('r1:t:0:0'), 'a map: instance 49 at the depth instance 0 was');
      const seq = runSync(SEQUENCE, COMMON);
      equal(seq.sch.depth.get('r1:b:-:0'), seq.sch.depth.get('r1:a:-:0'), 'a sequence: the third task at the depth the second was — each settlement is its own step');
    } finally {
      (Error as { stackTraceLimit?: number }).stackTraceLimit = limit;
    }
  });

  test(DECLARED_CASES[5]!, () => {
    const script: Script = (id) => node(id) === 'work' ? DONE({ ok: false }) : DONE({ seed: 1 });
    const on = (call: (d: Driver) => void) => (i: FoldInput, _s: number, d: Driver) => {
      if (i.kind === 'region' && i.event.type === 'branch.opened' && i.event.branchPath === '2') call(d);
    };
    for (const [what, call] of [
      ['a pause', (d: Driver) => { d.pause({ actor: 'ana' }); }],
      ['a stop', (d: Driver) => { void d.stop({ actor: 'ana' }); }],
      ['a cancel', (d: Driver) => { void d.cancel({ actor: 'ana' }); }],
    ] as const) {
      const s = runSync(LOOP(6), script, { onFoldInput: on(call) });
      const l = runLater(LOOP(6), script, { onFoldInput: on(call) });
      ok(!ids(l).includes('r1:work:3:0'), `${what}, the CONTROL: on the later scheduler round 3's task is never handed over — ${kinds(l).slice(-4).join(' | ')}`);
      equal(ids(s), ids(l), `${what}: the same tasks handed over`);
      equal(kinds(s), kinds(l), `${what} called on round 2's opening: the log is the later scheduler's — taken at that step, not after the run`);
    }
    // On start()'s OWN step, where the queue is drained by the outermost step's end: a stop called on the first dispatch is
    // taken BEFORE that task's settlement, which the driver — deaf by then — never hears (RN-R33).
    const first = (i: FoldInput, _s: number, d: Driver) => { if (i.kind === 'dispatched' && i.taskId === 'r1:ingest:-:0') void d.stop({ actor: 'ana' }); };
    const s0 = runSync(LOOP(6), script, { onFoldInput: first });
    equal(kinds(s0), ['dispatched r1:ingest:-:0', 'interrupted'], 'a stop on the first dispatch: taken before the settlement heard inside that addTask, which is not appended');
    equal(kinds(s0), kinds(runLater(LOOP(6), script, { onFoldInput: first })), 'as on the later scheduler');
  });

  test(DECLARED_CASES[6]!, () => {
    // The live detail, mutated AFTER the listener returned and before the step ends.
    const live = { id: 'r1:a:-:0', state: 'done', result: { v: 1 }, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    const sch = new Fake();
    const add = sch.addTask.bind(sch);
    sch.addTask = (t: unknown) => {
      add(t);
      const id = (t as { id: string }).id;
      if (id !== 'r1:a:-:0') return;
      (sch as unknown as { fire(type: string, detail: unknown): void }).fire('task.completed', live);
      live.result.v = 2; // the producer still holds it
      live.timestamp = 99;
    };
    const r = build(SEQUENCE, sch);
    r.d.start({});
    sch.settle('r1:ingest:-:0', 'done', {});
    const rec = r.d.foldInputs().find((e) => e.kind === 'outcome' && e.record.taskId === 'r1:a:-:0');
    ok(rec?.kind === 'outcome', 'the ARRANGEMENT: a`s settlement, heard inside its own addTask, is in the log');
    if (rec?.kind !== 'outcome') return;
    equal(rec.record.result, { v: 1 }, 'the record holds the value as it was when the event was heard (OR-R1, OR-R2)');
    equal(input(r, 'r1:b:-:0'), { v: 1 }, 'and so does what the next task is handed');

    const bad = runSync(SEQUENCE, (id) => node(id) === 'a' ? DONE({ fn: () => 1 }) : node(id) === 'ingest' ? DONE({}) : undefined);
    equal(bad.failures.map((f) => f.kind), ['UncloneableResult'], 'an uncloneable result settled inside addTask: refused where it is heard (OR-R6), once');
    equal(ids(bad), ['r1:ingest:-:0', 'r1:a:-:0'], 'and nothing is routed from it');
    equal(fold(bad.d.foldInputs()).outcome, 'halted', 'the run is halted');
  });

  test(DECLARED_CASES[7]!, () => {
    const script: Script = (id) => node(id) === 'work' ? DONE({ ok: false }) : DONE({ seed: 1 });
    const createTask = (c: unknown) => { if ((c as { id: string }).id === 'r1:work:2:0') throw new Error('createTask refused round 2'); return c; };
    const s = runSync(LOOP(5), script, { createTask });
    const l = runLater(LOOP(5), script, { createTask });
    equal(s.thrown, null, 'start() returns: round 2 is dispatched by a settlement`s step, a listener`s, not by start()');
    equal(s.failures.map((f) => f.message), ['createTask refused round 2'], 'reported once (OR-R10)');
    equal(kinds(s), kinds(l), 'and the log is the later scheduler`s, ending halted');
    equal(kinds(s).at(-1), 'halted', 'halted is its last element');
    const first = runSync(LOOP(5), script, { createTask: () => { throw new Error('createTask refused ingest'); } });
    ok(first.thrown instanceof Error && first.thrown.message === 'createTask refused ingest', 'the CONTROL: a throw on start()`s OWN dispatch still reaches its caller');
  });

  test(DECLARED_CASES[8]!, () => {
    // `a`'s addTask fires `task.cancelled` for `a` itself: RN-R28 halts the run THERE, so `b` and `c` are never dispatched.
    const sch = new Fake();
    const add = sch.addTask.bind(sch);
    sch.addTask = (t: unknown) => {
      add(t);
      if ((t as { id: string }).id === 'r1:a:0:0') sch.settle('r1:a:0:0', 'cancelled', null);
    };
    const r = build(FANOUT, sch);
    r.d.start({});
    sch.settle('r1:ingest:-:0', 'done', {});
    equal(ids(r), ['r1:ingest:-:0', 'r1:a:0:0'], 'the fan-out stops at the cancelled settlement: b and c are not handed over (RN-R29 door (a))');
    equal(kinds(r).at(-1), 'outcome r1:a:0:0', 'and the log ends at it');
    equal(fold(r.d.foldInputs()).outcome, 'cancelled', 'the fold: cancelled');
  });

  test(DECLARED_CASES[9]!, () => {
    const script: Script = (id) => node(id) === 'a' ? { state: 'user_action', result: null } : DONE({});
    const s = runSync(SEQUENCE, script);
    const l = runLater(SEQUENCE, script);
    equal(s.d.foldInputs().filter((e) => e.kind === 'outcome' && e.record.taskId === 'r1:a:-:0').length, 1, 'one record for the pair (ADR 0007 rule 2)');
    equal(fold(s.d.foldInputs()).outcome, 'awaiting_action', 'the run awaits a person');
    equal(s.d.foldInputs(), l.d.foldInputs(), 'and the log is the later scheduler`s');
  });

  test(DECLARED_CASES[10]!, () => {
    // `a`, `c` and `after` settle inside addTask; `ingest` and `b` at rest. The queue is drained, emptied, and drained again.
    const inside = new Set(['a', 'c', 'after']);
    const sch = new Hooked((id, s) => { if (inside.has(node(id))) s.settle(id, 'done', { n: node(id) }); });
    const r = build(FANOUT, sch);
    r.d.start({});
    sch.settle('r1:ingest:-:0', 'done', {});
    equal(waiting(r.d), 0, 'after the first step: a and c taken, nothing waiting');
    equal(fold(r.d.foldInputs()).outcome, 'running', 'the ARRANGEMENT: b is still in flight');
    sch.settle('r1:b:1:0', 'done', { n: 'b' });
    equal(fold(r.d.foldInputs()).outcome, 'completed', 'b at rest fires the join, and `after` — settled inside its addTask — is taken by a SECOND drain');
    const l = build(FANOUT, new Fake());
    l.d.start({});
    for (const id of ['r1:ingest:-:0', 'r1:a:0:0', 'r1:c:2:0', 'r1:b:1:0', 'r1:after:-:0']) l.sch.settle(id, 'done', node(id) === 'ingest' ? {} : { n: node(id) });
    equal(r.d.foldInputs(), l.d.foldInputs(), 'and the log is that of a scheduler settling all five later, in the order they were heard');

    // `task.running` and the completion both inside addTask: the attempt is appended before its outcome, as when the
    // completion comes later (RN-R40: an attempt is taken FIRST at a step's end).
    for (const [row, f] of [['a sequence', SEQUENCE], ['a fan-out', FANOUT]] as const) {
      const both = new Hooked((id, s) => { s.running(id, 1); s.settle(id, 'done', { n: node(id) }); });
      const s = build(f, both);
      s.d.start({});
      const inline = new Hooked((id, sc) => sc.running(id, 1));
      const lt = build(f, inline);
      lt.d.start({});
      settleRest(lt, (id) => DONE({ n: node(id) }), 0);
      const ks = kinds(s);
      ok(ks.indexOf('attempted r1:a:' + (f === SEQUENCE ? '-' : '0') + ':0 #1') >= 0, `${row}, the ARRANGEMENT: a's attempt is recorded — ${ks.join(' | ')}`);
      equal(s.d.foldInputs(), lt.d.foldInputs(), `${row}: with task.running fired beside the completion, the log is the inline pool's that completes later`);
    }
  });

  test(DECLARED_CASES[11]!, () => {
    const HEAD = ['dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0', 'regionEntered', 'branch.opened F:0', 'branch.opened F:1', 'branch.opened F:2',
      'dispatched r1:a:0:0', 'dispatched r1:b:1:0'];
    // (1) `a` is held; inside `b`'s addTask the scheduler settles `b` done — which WAITS — and then fires `a` cancelled.
    // `ingest` settles inside its own addTask, so the fan-out is entered by a WAITING settlement's step: the cancel is
    // heard while the queue is being drained, and is still taken at once.
    const cancelling = new Hooked((id, s) => {
      if (id === 'r1:ingest:-:0') s.settle(id, 'done', {});
      if (id === 'r1:b:1:0') { s.settle(id, 'done', { n: 'b' }); s.settle('r1:a:0:0', 'cancelled', null); }
    });
    const c = build(FANOUT, cancelling);
    c.d.start({});
    equal(kinds(c), [...HEAD, 'outcome r1:a:0:0', 'outcome r1:b:1:0'],
      'a cancelled settlement heard after a done one that waits: the cancel is taken where it is heard (RN-R28), c is never handed over (RN-R29), and b`s outcome is appended after it with no arrival');
    equal(fold(c.d.foldInputs()).outcome, 'cancelled', 'the fold: cancelled');
    equal(waiting(c.d), 0, 'nothing left waiting');

    // (2) `a` done inside its own addTask (it waits); `b`'s result cannot be cloned: OR-R6 refuses it where it is heard.
    const u = runSync(FANOUT, (id) => node(id) === 'ingest' ? undefined : node(id) === 'b' ? DONE({ fn: () => 1 }) : DONE({ n: node(id) }));
    u.sch.settle('r1:ingest:-:0', 'done', {});
    equal(kinds(u), [...HEAD, 'halted', 'outcome r1:a:0:0'], 'an uncloneable result: halted where heard, c never handed over, a`s outcome after the halt and unrouted');
    equal(u.failures.map((f) => f.kind), ['UncloneableResult'], 'reported once');

    // (3) inside `b`'s addTask the scheduler settles a task this run has not dispatched: ID-R4 tier 2, where it is heard.
    const foreign = new Hooked((id, s) => {
      if (id === 'r1:a:0:0') s.settle(id, 'done', { n: 'a' });
      if (id === 'r1:b:1:0') (s as unknown as { fire(type: string, detail: unknown): void }).fire('task.completed', { id: 'r1:c:2:0', state: 'done', result: {}, attempts: 0, timestamp: 1 });
    });
    const f = build(FANOUT, foreign);
    f.d.start({});
    foreign.settle('r1:ingest:-:0', 'done', {});
    equal(kinds(f), [...HEAD, 'halted', 'outcome r1:a:0:0'], 'an undispatched task`s settlement: the tiers are decided where the event is heard, not when the step ends');
    equal(f.failures.map((x) => x.kind), ['UndispatchedTask'], 'reported once');
    equal(ids(f), ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], 'and c is never handed over');

    // (4) a settlement heard on a run ALREADY halted, in the same step: it waits its turn behind the one heard before the
    // halt. t:0 settles inside its own addTask; t:1 is held; t:2's addTask fires t:2 uncloneable, then t:1 done.
    const late = new Hooked((id, s) => {
      if (id === 'r1:t:0:0') s.settle(id, 'done', { n: 't' });
      if (id === 'r1:t:2:0') { s.settle(id, 'done', { fn: () => 1 }); s.settle('r1:t:1:0', 'done', { n: 't' }); }
    });
    const g = build(MAP, late);
    g.d.start({});
    late.settle('r1:ingest:-:0', 'done', { items: [0, 1, 2, 3] });
    equal(kinds(g).slice(-4), ['dispatched r1:t:2:0', 'halted', 'outcome r1:t:0:0', 'outcome r1:t:1:0'],
      'heard after the halt, in its step: appended after the one heard before it — the order heard, on a halted run too');
    equal(ids(g), ['r1:ingest:-:0', 'r1:t:0:0', 'r1:t:1:0', 'r1:t:2:0'], 'and t:3 is never handed over');
  });

  test(DECLARED_CASES[12]!, () => {
    const four: Script = (id) => node(id) === 'ingest' ? undefined : DONE({ n: node(id), at: path(id) });
    const on = (call: (d: Driver) => void) => (i: FoldInput, _s: number, d: Driver) => { if (i.kind === 'dispatched' && i.taskId === 'r1:t:2:0') call(d); };
    const go = (call: (d: Driver) => void, sync: boolean): Run => {
      const r = build(MAP, sync ? new Sync(four) : new Fake(), { onFoldInput: on(call) });
      r.d.start({});
      r.sch.settle('r1:ingest:-:0', 'done', { items: [0, 1, 2, 3] });
      if (!sync) settleRest(r, four, 1);
      return r;
    };
    // t:0 and t:1 are waiting, t:2 is being dispatched, when the owner cancels.
    const c = go((d) => { void d.cancel({ actor: 'ana' }); }, true);
    equal(kinds(c).slice(-5), ['dispatched r1:t:2:0', 'cancelRequested', 'outcome r1:t:0:0', 'outcome r1:t:1:0', 'outcome r1:t:2:0'],
      'a cancel: the dispatch in progress is handed on, t:3 is not, and the three settlements are appended after the request, in the order heard');
    equal(fold(c.d.foldInputs()).outcome, 'cancelled', 'so every task has stopped and the fold reads cancelled, not cancelling');
    equal(kinds(c), kinds(go((d) => { void d.cancel({ actor: 'ana' }); }, false)), 'as on the later scheduler');
    equal(waiting(c.d), 0, 'nothing left waiting');

    const s = go((d) => { void d.stop({ actor: 'ana' }); }, true);
    equal(kinds(s).slice(-2), ['dispatched r1:t:3:0', 'interrupted'], 'a stop: taken at the step`s end, and the settlements that waited are not heard (RN-R33: deaf)');
    equal(kinds(s), kinds(go((d) => { void d.stop({ actor: 'ana' }); }, false)), 'as on the later scheduler');
    equal(waiting(s.d), 0, 'and they are DROPPED, not kept: nothing left waiting on a deaf driver');
  });

  test(DECLARED_CASES[13]!, () => {
    const four: Script = (id) => node(id) === 'ingest' ? undefined : DONE({ n: node(id), at: path(id) });
    const go = (o: Opts, sync: boolean): Run => {
      const r = build(MAP, sync ? new Sync(four) : new Fake(), o);
      r.d.start({});
      try { r.sch.settle('r1:ingest:-:0', 'done', { items: [0, 1, 2, 3] }); } catch (e) { r.thrown = e; }
      if (!sync) settleRest(r, four, 1);
      return r;
    };
    // `createTask` throws for t:2 with t:0 and t:1 waiting.
    const createTask = (c: unknown) => { if ((c as { id: string }).id === 'r1:t:2:0') throw new Error('no t:2'); return c; };
    const h = go({ createTask }, true);
    equal(kinds(h).slice(-4), ['dispatched r1:t:2:0', 'halted', 'outcome r1:t:0:0', 'outcome r1:t:1:0'],
      'a halt with two waiting: both are appended after it, in the order heard, and nothing is routed');
    equal(h.failures.length, 1, 'reported once');
    equal(waiting(h.d), 0, 'nothing left waiting');
    equal(kinds(h), kinds(go({ createTask }, false)), 'as on the later scheduler');

    // A consumer callback that throws on EVERY outcome of `t`: the first halts and reports, the rest are appended in silence.
    const thrower = (i: FoldInput) => { if (i.kind === 'outcome' && i.record.taskId.startsWith('r1:t:')) throw new Error('on every outcome'); };
    const e = go({ onFoldInput: thrower }, true);
    equal(kinds(e).slice(-5), ['outcome r1:t:0:0', 'halted', 'outcome r1:t:1:0', 'outcome r1:t:2:0', 'outcome r1:t:3:0'], 'the first throw halts; the three behind it are still appended');
    equal(e.failures.map((f) => f.message), ['on every outcome'], 'and the failure is reported ONCE, not once per throw (OR-R10)');
    equal(e.thrown, null, 'nothing is thrown to the scheduler that fired ingest`s settlement');
    equal(kinds(e), kinds(go({ onFoldInput: thrower }, false)), 'as on the later scheduler');
  });

  test(DECLARED_CASES[14]!, () => {
    const four: Script = (id) => node(id) === 'ingest' ? undefined : DONE({ n: node(id), at: path(id) });
    // A pause called on t:0's outcome — taken at the end of that settlement's step — whose `paused` element throws.
    const pausing = (i: FoldInput, _s: number, d: Driver) => {
      if (i.kind === 'outcome' && i.record.taskId === 'r1:t:0:0') d.pause({ actor: 'ana' });
      if (i.kind === 'paused') throw new Error('on paused');
    };
    const go = (sync: boolean): Run => {
      const r = build(MAP, sync ? new Sync(four) : new Fake(), { onFoldInput: pausing });
      r.d.start({});
      try { r.sch.settle('r1:ingest:-:0', 'done', { items: [0, 1, 2, 3] }); } catch (e) { r.thrown = e; }
      if (!sync) settleRest(r, four, 1);
      return r;
    };
    const s = go(true);
    equal(s.failures.map((f) => f.message), ['on paused'], 'a throw on `paused`, taken at a waiting settlement`s step end: reported once');
    equal(s.thrown, null, 'not thrown to the scheduler');
    equal(kinds(s).slice(-5), ['paused', 'halted', 'outcome r1:t:1:0', 'outcome r1:t:2:0', 'outcome r1:t:3:0'], 'and the three still waiting are appended after the halt');
    equal(waiting(s.d), 0, 'nothing left waiting');
    equal(kinds(s), kinds(go(false)), 'as on the later scheduler');

    // On start()'s OWN step: a stop on the first dispatch, whose `interrupted` element throws. The throw reaches start()'s
    // caller, as any throw on its own step does — and the settlement that waited is dropped by the deaf driver, not kept.
    const stopping = (i: FoldInput, _s: number, d: Driver) => {
      if (i.kind === 'dispatched' && i.taskId === 'r1:ingest:-:0') void d.stop({ actor: 'ana' });
      if (i.kind === 'interrupted') throw new Error('on interrupted');
    };
    const z = runSync(SEQUENCE, COMMON, { onFoldInput: stopping });
    ok(z.thrown instanceof Error && z.thrown.message === 'on interrupted', `the throw reaches start()'s caller — ${String(z.thrown)}`);
    equal(kinds(z).slice(0, 2), ['dispatched r1:ingest:-:0', 'interrupted'], 'the stop was taken');
    equal(waiting(z.d), 0, 'and ingest`s settlement, heard inside that addTask, is not left queued');
  });

  test(DECLARED_CASES[15]!, () => {
    const limit = (Error as { stackTraceLimit?: number }).stackTraceLimit;
    (Error as { stackTraceLimit?: number }).stackTraceLimit = Infinity;
    try {
      const ROUNDS = 20000;
      const depth = new Map<string, number>();
      const probe = new Set(['r1:approve:0:0', 'r1:approve:1:0', 'r1:approve:2400:0']);
      const script: Script = () => DONE({ seed: 1 });
      const r = runLater(ASK_LOOP(ROUNDS), script, {
        onFoldInput: answering(answerOf(ROUNDS), (id) => { if (probe.has(id)) depth.set(id, (new Error().stack ?? '').split('\n').length); }),
      });
      equal(r.thrown, null, 'nothing thrown');
      equal(r.failures.map((f) => f.message), [], 'and nothing reported: the run is not halted by its own stack');
      equal(r.d.foldInputs().filter((e) => e.kind === 'resolution').length, ROUNDS, 'every round was asked and answered');
      equal(input(r, 'r1:after:-:0'), { last: { ok: true, r: String(ROUNDS - 1) }, iterations: ROUNDS, exhausted: false },
        'and the loop`s join hands on the last answer (JP-R15): `until` held on the bound`s own round, so not exhausted (JP-R14)');
      ok(depth.get('r1:approve:0:0')! > 11, `the ARRANGEMENT: the limit is lifted and the probe reads the real stack — ${depth.get('r1:approve:0:0')} lines at round 0`);
      // Round 0 is asked on the step of `ingest`'s settlement; round 1 on, each on the step of the answer before it.
      equal(depth.get('r1:approve:2400:0'), depth.get('r1:approve:1:0'), 'round 2400 is asked at the depth round 1 was');

      // The same queue's other calls (the conformity reader): a pause whose element unpauses, whose element pauses … from
      // a pause() AT REST. Each take queues the next; until W233 the 2,500th overflowed into pause()'s caller.
      const FLIPS = 20000;
      const at = new Map<number, number>();
      let flips = 0;
      const p = build(SEQUENCE, new Fake(), {
        onFoldInput: (i, _s, d) => {
          if (i.kind !== 'paused' && i.kind !== 'unpaused') return;
          flips += 1;
          if (flips === 2 || flips === 2400) at.set(flips, (new Error().stack ?? '').split('\n').length);
          if (flips === FLIPS) return;
          if (i.kind === 'paused') d.unpause({ actor: 'ana' }); else d.pause({ actor: 'ana' });
        },
      });
      p.d.start({});
      try { p.d.pause({ actor: 'ana' }); } catch (e) { p.thrown = e; }
      equal(p.thrown, null, 'a chain of 20,000 pauses and unpauses, each called on the one before: nothing thrown to pause()`s caller');
      equal(p.d.foldInputs().filter((e) => e.kind === 'paused' || e.kind === 'unpaused').length, FLIPS, 'every one recorded');
      equal(at.get(2400), at.get(2), 'and the 2400th is taken at the depth the 2nd was');
    } finally {
      (Error as { stackTraceLimit?: number }).stackTraceLimit = limit;
    }
  });

  test(DECLARED_CASES[16]!, () => {
    const ROUNDS = 6;
    const script: Script = () => DONE({ seed: 1 });
    const answer = answerOf(ROUNDS);
    const mid = runLater(ASK_LOOP(ROUNDS), script, { onFoldInput: answering(answer) });
    const rest = build(ASK_LOOP(ROUNDS), new Fake());
    rest.d.start({});
    finish(rest, script, answer);
    equal(marks(rest).filter((m) => m.startsWith('resolution')).length, ROUNDS, 'the ARRANGEMENT: at rest, six answers, each a step of its own');
    equal(mid.d.foldInputs(), rest.d.foldInputs(), 'answered on the element, the sequence IS the one answered at rest: each resolution between two steps');
    const cp: Checkpoint = mid.d.checkpoint();
    for (let k = 0; k <= cp.events.length; k += 1) {
      const r = build(ASK_LOOP(ROUNDS), new Fake());
      let refused: unknown = null;
      try { r.d.resume({ header: cp.header, events: cp.events.slice(0, k) }); } catch (e) { refused = e; }
      equal(refused, null, `cut at ${k}: the resume is accepted`);
      finish(r, script, answer);
      equal(r.d.foldInputs().filter((e) => e.kind !== 'resumed'), cp.events, `cut at ${k}: the sequence, \`resumed\` aside, IS the uninterrupted run's`);
    }
  });

  test(DECLARED_CASES[17]!, () => {
    // `ingest` settles at rest; on that ONE step the fan-out asks `p` and hands `b` over, and the scheduler starts `b`
    // and settles it inside `addTask`. On `asked`: a pause, then the answer — and, in the second run, a stop.
    const go = (stop: boolean) => {
      const sch = new Hooked((id, h) => { if (node(id) === 'b') { h.running(id, 1); h.settle(id, 'done', { n: 'b' }); } });
      const r = build(ASK_BESIDE_TASK, sch, {
        onFoldInput: (i, _s, d) => {
          if (i.kind !== 'asked') return;
          d.pause({ actor: 'ana' });
          d.resolve(i.taskId, 'done', { result: { n: 'p' }, actor: 'bot' });
          if (stop) void d.stop({ actor: 'ana' });
        },
      });
      r.d.start({});
      sch.settle('r1:ingest:-:0', 'done', { seed: 1 });
      return r;
    };
    const tail = (r: Run) => { const m = marks(r); return m.slice(m.indexOf('dispatched r1:b:1:0') + 1); };
    equal(tail(go(false)), [
      'attempted r1:b:1:0 #1',                         // RN-R40: FIRST — the attempt started before anything taken here
      'paused',                                        // RN-R35: the pause, called first
      'resolution r1:p:0:0', 'branch.resumed F:0', 'branch.arrived F:0',   // RN-R37: the answer, called second, routed to the join
      'outcome r1:b:1:0', 'branch.arrived F:1',        // RN-R46: the settlement heard inside addTask, after every call
      'joinSettled', 'dispatched r1:after:-:0',        // and the join fires; `after` is HELD by the pause, appended (RN-R35)
    ], 'no stop: attempts, the calls in call order, then the settlement');
    equal(tail(go(true)), [
      'attempted r1:b:1:0 #1', 'paused',
      'resolution r1:p:0:0', 'branch.resumed F:0', 'branch.arrived F:0',
      'interrupted',                                   // RN-R33: the stop, after every call made before it — and the driver is deaf
    ], 'with a stop: it is taken last, and the settlement that waited is never heard');

    // A pause() called AT REST is the same end of a step (the adequacy reader's A14): a settlement heard on the take's own
    // element waits for that take to end and is then taken — routed, its successor held by the pause, appended (RN-R35).
    const r = build(SEQUENCE, new Fake(), { onFoldInput: (i) => { if (i.kind === 'paused') r.sch.settle('r1:ingest:-:0', 'done', { seed: 1 }); } });
    r.d.start({});
    r.d.pause({ actor: 'ana' });
    equal(marks(r), ['dispatched r1:ingest:-:0', 'paused', 'outcome r1:ingest:-:0', 'dispatched r1:a:-:0'], 'pause() at rest: the settlement heard on `paused` is taken when the take ends');
    equal(waiting(r.d), 0, 'and nothing is left waiting');
  });

  test(DECLARED_CASES[18]!, () => {
    // Both asks are asked on start()'s own step. `p` and `q` are each answered on their element, and a stop is called on
    // `q`'s. The first answer's own element throws.
    const r = build(TWO_ASKS, new Fake(), {
      onFoldInput: (i, _s, d) => {
        if (i.kind === 'asked') {
          d.resolve(i.taskId, 'done', { result: { n: node(i.taskId) }, actor: 'bot' });
          if (node(i.taskId) === 'q') void d.stop({ actor: 'ana' });
        }
        if (i.kind === 'resolution') throw new Error('on resolution');
      },
    });
    try { r.d.start({}); } catch (e) { r.thrown = e; }
    ok(r.thrown instanceof Error && r.thrown.message === 'on resolution', `the throw reaches start()'s caller — ${String(r.thrown)}`);
    equal(r.failures.map((f) => f.message), ['on resolution'], 'reported ONCE');
    const m = marks(r);
    equal(m.slice(m.indexOf('asked r1:q:1:0') + 1), ['branch.suspended F:1', 'resolution r1:p:0:0', 'halted', 'interrupted'],
      'the step ends whole — `q` parked — and then: the first answer is appended and the run halted on it; the second is dropped (RN-R37); the stop is taken even so, silently (RN-R33)');
    equal(parkedAsks(r), ['r1:q:1:0'], 'and `q` is still parked: its answer was never recorded');
    equal((r.d as unknown as { pausePending: { length: number } }).pausePending.length, 0, 'DROPPED, not kept: no call is left pending behind the throw (white-box, as `waiting`)');
  });

  test(DECLARED_CASES[DECLARED_CASES.length - 1]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'the cases that ran ARE the declared ones, both ways');
  });
});
