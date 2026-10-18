/**
 * Ladder L2 — **a task's messages and progress, PASSED THROUGH with its attribution as fields** — `spec/run-state.md` v0.27
 * `RN-R42`, [ADR 0114](../../doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md),
 * [P36](../../doc/plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) stop-and-ask (k),
 * [W187](../../doc/work-items/w187-attribution-on-the-fold-and-messages-passed-through.md).
 *
 * **The contract, as P36 answered it**: `onTaskMessage(m)` and `onTaskProgress(p)`, each carrying `runId`, `nodeId`,
 * `branchPath`, `taskId`, `flowAttempt` and `attemptNumber` beside the scheduler's own fields, handed out FROZEN; the driver
 * subscribes to `task.message` / `task.progress` ONLY when the callback is given; only this run's dispatched tasks are
 * delivered, everything else dropped in silence; nothing once the driver is stopped; a throw takes `onUnmintedTask`'s road —
 * reported once, the run halted. A pass-through is never a fold input (P36 decision 5).
 *
 * **The double fires the scheduler's two shapes as its `AGENTS.md` §6 states them and W187's declaration step measured them
 * at the pin**: `task.message`'s detail is `{ taskId, workerId, attemptNumber, name, data, seq, timestamp, dropped?, error? }`
 * — NO `id` — and `task.progress`'s is the task SPREAD FLAT (`id`, the task's own fields, `workerType` overwritten with
 * `'inline'`/`'thread'`) plus `{ progress, message, details, workerId, timestamp }`. Every expected value is written from the
 * rule and the id's segments, never read off a run; each claim beside a CONTROL showing its observer live.
 */
import { collected, equal, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, type DriverOptions, type RunFailure, type TaskMessage, type TaskProgress, type UnmintedTask } from '../../src/driver/driver.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

/** The consumer's own error class — read as `PassBoom.name`, because the browser bundle renames classes. */
class PassBoom extends Error {}

/** L2's scheduler double: what it was SUBSCRIBED to, in order, what it was handed, and the two pass-through shapes on demand. */
class PassFake {
  readonly subscribed: string[] = [];
  readonly added: { id: string }[] = [];
  /** How many listeners each `emit` reached — what says a name nobody subscribed reaches nobody. */
  readonly reached: number[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.subscribed.push(type);
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  emit(type: string, detail: unknown): void {
    const fns = this.listeners.get(type) ?? [];
    this.reached.push(fns.length);
    for (const fn of fns) fn({ detail });
  }
  /** A `context.emit()` — the scheduler's `TaskMessageDetail`, keyed `taskId`, with no `id`. */
  message(taskId: unknown, more: Record<string, unknown> = {}): Record<string, unknown> {
    const detail = { taskId, workerId: 'w-1', attemptNumber: 1, name: 'log', data: { line: 1 }, seq: 0, timestamp: 1000, ...more };
    this.emit('task.message', detail);
    return detail;
  }
  /** A progress report — the TASK spread flat, as the scheduler dispatches it, plus the report's own fields. */
  progress(id: unknown, more: Record<string, unknown> = {}): Record<string, unknown> {
    const detail = {
      id, state: 'running', payload: { secret: 'the task`s own' }, attempts: 0, attemptNumber: 1, workerType: 'inline',
      progress: 0.5, message: 'half', details: { rows: 10 }, workerId: 'w-1', timestamp: 2000, ...more,
    };
    this.emit('task.progress', detail);
    return detail;
  }
  settle(id: string): void {
    this.emit('task.completed', { id, state: 'done', result: { v: id }, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
}

const flow = (flowId: string, nodes: unknown[], entry: string): FlowDefinition =>
  ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
/** x -> y -> done. */
const LINE = flow('pt-line', [
  { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'x');
/** An entry fan-out of two: `a` on branch 0, `b` on branch 1 — so a pass-through's `branchPath` is not always `-` (the adequacy reader's A1). */
const FAN = flow('pt-fan', [
  { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'split');

interface Rig {
  readonly d: Driver;
  readonly s: PassFake;
  readonly messages: TaskMessage[];
  readonly progress: TaskProgress[];
  readonly failures: RunFailure[];
  readonly unminted: UnmintedTask[];
}
function rig(opts: { message?: boolean; progress?: boolean; onMessage?: (m: TaskMessage) => void; runId?: string; flow?: FlowDefinition } = {}): Rig {
  const s = new PassFake();
  const messages: TaskMessage[] = [];
  const progress: TaskProgress[] = [];
  const failures: RunFailure[] = [];
  const unminted: UnmintedTask[] = [];
  const o: DriverOptions = {
    runId: opts.runId ?? 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']), now: () => 0,
    onRunFailure: (f) => { failures.push(f); },
    onUnmintedTask: (u) => { unminted.push(u); }, joinPolicy: liveToken as unknown as JoinPolicy,
  };
  if (opts.message !== false) o.onTaskMessage = (m) => { messages.push(m); opts.onMessage?.(m); };
  if (opts.progress !== false) o.onTaskProgress = (p) => { progress.push(p); };
  const d = new Driver(opts.flow ?? LINE, o);
  return { d, s, messages, progress, failures, unminted };
}
const kinds = (d: Driver): string[] => d.foldInputs().map((e: FoldInput) => (e.kind === 'dispatched' ? `dispatched ${e.taskId}` : e.kind));
const X = 'r1:x:-:0';
/** The five names the driver always subscribes (`SUBSCRIBED_EVENTS`): four settlements and `task.running`. */
const ALWAYS = ['task.cancelled', 'task.completed', 'task.failed', 'task.running', 'task.user_action'];

const SUITE = 'L2 — RN-R42: onTaskMessage and onTaskProgress — a task`s messages and progress passed through with its attribution as fields (P36 (k))';
const DECLARED_CASES = [
  'a task.message of this run`s task is handed over with every field — the attribution and the scheduler`s own, dropped and error only when carried',
  'a task.progress of this run`s task is handed over with the report`s fields and the attribution — NONE of the task`s own',
  'another run`s, an id no driver minted, and this run`s UNDISPATCHED task are dropped in silence — nothing reported, nothing halted — beside the delivery that shows the channel live',
  'the driver subscribes task.message and task.progress ONLY for a callback given — the subscription list read both ways, and an event nobody subscribed reaches no listener',
  'the copy is FROZEN and the driver`s own, read on the copy both ways — and a value that cannot be cloned is handed on undefined, the run unhalted',
  'NOTHING after a stop — the same task`s message and progress delivered before it, dropped after',
  'a THROW from either callback is reported ONCE and HALTS the run — nothing leaves the event, a later message still arrives, and a later settlement routes nothing',
  'a pass-through is never a fold input: the same events with and without both callbacks leave the same fold-input sequence',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('a task.message of this run`s task is handed over with every field — the attribution and the scheduler`s own, dropped and error only when carried', () => {
    const r = rig();
    r.d.start({});
    r.s.message(X, { attemptNumber: 2, name: 'log', data: { line: 7 }, seq: 3, timestamp: 1234 });
    r.s.message(X, { attemptNumber: 2, name: 'metric', data: undefined, seq: 9, timestamp: 1240, dropped: 5, error: 'Discarded at the message cap' });
    r.s.message(X, { attemptNumber: undefined });
    equal(r.messages.map((m) => ({ ...m })), [
      { runId: 'r1', nodeId: 'x', branchPath: '-', taskId: X, flowAttempt: 0, attemptNumber: 2, name: 'log', data: { line: 7 }, seq: 3, timestamp: 1234 },
      { runId: 'r1', nodeId: 'x', branchPath: '-', taskId: X, flowAttempt: 0, attemptNumber: 2, name: 'metric', data: undefined, seq: 9, timestamp: 1240, dropped: 5, error: 'Discarded at the message cap' },
      { runId: 'r1', nodeId: 'x', branchPath: '-', taskId: X, flowAttempt: 0, attemptNumber: null, name: 'log', data: { line: 1 }, seq: 0, timestamp: 1000 },
    ], 'three messages, in the order fired: the id`s four segments as fields, the event`s attempt number (null where it carried none), the scheduler`s fields');
    equal(r.messages.map((m) => ['dropped' in m, 'error' in m, 'workerId' in m]), [[false, false, false], [true, true, false], [false, false, false]],
      'dropped and error PRESENT only on the message that carried them; workerId never — it names the pool`s worker, not the task');
    equal([r.failures.length, r.unminted.length], [0, 0], 'and nothing reported');
    // A BRANCH task's: the path is the id's third segment, '0' and '1', never a constant '-' (the adequacy reader's A1).
    const f = rig({ flow: FAN });
    f.d.start({});
    f.s.message('r1:a:0:0');
    f.s.progress('r1:b:1:0');
    equal([f.messages.map((m) => [m.nodeId, m.branchPath]), f.progress.map((q) => [q.nodeId, q.branchPath])], [[['a', '0']], [['b', '1']]],
      'a branch task`s message and progress carry its node and its branch path');
    // R6, arranged (the adequacy reader's A3): attempt 1's messages are BATCHED (M3), so one can arrive after attempt 2's
    // task.running was recorded. Each is attributed to the attempt that EMITTED it — the event's number, not the driver's last.
    const late = rig();
    late.d.start({});
    late.s.emit('task.running', { id: X, state: 'running', attemptNumber: 1 });
    late.s.emit('task.running', { id: X, state: 'running', attemptNumber: 2 });
    late.s.message(X, { attemptNumber: 1, seq: 1 });
    late.s.progress(X, { attemptNumber: 1 });
    equal([late.messages.map((m) => m.attemptNumber), late.progress.map((q) => q.attemptNumber), fold(late.d.foldInputs()).nodes[X]!.attemptNumber], [[1], [1], 2],
      'a late message and report of attempt 1 read 1, while the fold`s entry reads 2 — they differ, and each is right');
  });

  test('a task.progress of this run`s task is handed over with the report`s fields and the attribution — NONE of the task`s own', () => {
    const r = rig();
    r.d.start({});
    r.s.progress(X, { attemptNumber: 3, progress: 0.25, message: 'a quarter', details: { rows: 4 }, timestamp: 2222 });
    r.s.progress(X, { message: undefined, details: undefined });
    equal(r.progress.map((p) => ({ ...p })), [
      { runId: 'r1', nodeId: 'x', branchPath: '-', taskId: X, flowAttempt: 0, attemptNumber: 3, progress: 0.25, message: 'a quarter', details: { rows: 4 }, timestamp: 2222 },
      { runId: 'r1', nodeId: 'x', branchPath: '-', taskId: X, flowAttempt: 0, attemptNumber: 1, progress: 0.5, message: undefined, details: undefined, timestamp: 2000 },
    ], 'the id read from `id` — the task spread flat — and the report`s four fields beside the attribution');
    equal(Object.keys(r.progress[0]!).sort(),
      ['attemptNumber', 'branchPath', 'details', 'flowAttempt', 'message', 'nodeId', 'progress', 'runId', 'taskId', 'timestamp'],
      'EXACTLY those ten keys: no `state`, `payload`, `attempts`, `workerType` (the scheduler`s inline/thread) or `workerId`');
  });

  test('another run`s, an id no driver minted, and this run`s UNDISPATCHED task are dropped in silence — nothing reported, nothing halted — beside the delivery that shows the channel live', () => {
    const r = rig();
    r.d.start({});
    for (const id of ['r2:x:-:0', 'nightly-cleanup', 'r1:y:-:0', 'r1:x:x:0', undefined, 7]) {
      r.s.message(id);
      r.s.progress(id);
    }
    // A message carrying the task under `id` — a progress report's key — and NOT `taskId`: a message names its task `taskId`.
    r.s.emit('task.message', { id: X, workerId: 'w-1', attemptNumber: 1, name: 'log', data: null, seq: 0, timestamp: 1 });
    equal([r.messages.length, r.progress.length], [0, 0], 'none of them handed over: r2`s, an unminted id, y (not yet dispatched), a malformed id, no id, a number');
    equal([r.failures.length, r.unminted.length, r.d.hasFailed()], [0, 0, false], 'and none of them reported or halting — a message never stops a run by existing');
    // The CONTROL: the same channels deliver this run's dispatched task, so the drops above are drops.
    r.s.message(X);
    r.s.progress(X);
    equal([r.messages.map((m) => m.taskId), r.progress.map((p) => p.taskId)], [[X], [X]], 'the CONTROL: x`s own message and progress delivered');
    // And once y IS dispatched, its message is delivered — the drop above was of an undispatched task, not of the node.
    r.s.settle(X);
    r.s.message('r1:y:-:0');
    equal(r.messages.map((m) => m.taskId), [X, 'r1:y:-:0'], 'y`s message delivered once y is dispatched');
  });

  test('the driver subscribes task.message and task.progress ONLY for a callback given — the subscription list read both ways, and an event nobody subscribed reaches no listener', () => {
    const none = rig({ message: false, progress: false });
    equal([...none.s.subscribed].sort(), ALWAYS, 'neither callback: the five names it always subscribes, and NOT task.message or task.progress');
    const m = rig({ progress: false });
    equal([...m.s.subscribed].sort(), [...ALWAYS, 'task.message'].sort(), 'onTaskMessage alone: task.message added, task.progress not');
    const p = rig({ message: false });
    equal([...p.s.subscribed].sort(), [...ALWAYS, 'task.progress'].sort(), 'onTaskProgress alone: task.progress added, task.message not');
    const both = rig();
    equal([...both.s.subscribed].sort(), [...ALWAYS, 'task.message', 'task.progress'].sort(), 'both: seven names, each once');
    none.d.start({});
    none.s.message(X);
    none.s.progress(X);
    both.d.start({});
    both.s.message(X);
    both.s.progress(X);
    equal([none.s.reached, both.s.reached], [[0, 0], [1, 1]],
      'with neither callback the scheduler`s message and progress reach NO listener — the scheduler then sends nothing (its §6); with both, each reaches one');
  });

  test('the copy is FROZEN and the driver`s own, read on the copy both ways — and a value that cannot be cloned is handed on undefined, the run unhalted', () => {
    const r = rig();
    r.d.start({});
    const md = r.s.message(X, { data: { line: 1, nested: { deep: true } } });
    const pd = r.s.progress(X, { details: { rows: 10, nested: { deep: true } } });
    const m = r.messages[0]!;
    const p = r.progress[0]!;
    equal([Object.isFrozen(m), Object.isFrozen(m.data), Object.isFrozen(p), Object.isFrozen(p.details)], [true, true, true, true], 'each object and its value frozen');
    equal([m.data === md.data, p.details === pd.details], [false, false], 'and each value the DRIVER`s own clone, not the detail`s');
    // Source -> copy: the scheduler's object changed after the delivery does not reach what the consumer holds.
    (md.data as { line: number }).line = 99;
    (pd.details as { rows: number }).rows = 99;
    // And a NESTED field — a shallow copy would share it (the adequacy reader's A2).
    (md.data as { nested: { deep: boolean } }).nested.deep = false;
    (pd.details as { nested: { deep: boolean } }).nested.deep = false;
    equal([m.data, p.details], [{ line: 1, nested: { deep: true } }, { rows: 10, nested: { deep: true } }], 'source -> copy: the detail`s values mutated after delivery, top-level and nested, the copies unchanged');
    // Copy -> source, nested: the copy's nested object is not frozen (the freeze is shallow, as onFoldInput's is) — but it
    // is the driver's own, so a write there reaches no scheduler object.
    (m.data as { nested: { deep: string } }).nested.deep = 'consumer';
    (p.details as { nested: { deep: string } }).nested.deep = 'consumer';
    equal([(md.data as { nested: unknown }).nested, (pd.details as { nested: unknown }).nested], [{ deep: false }, { deep: false }],
      'copy -> source, nested: the consumer`s write to the copy`s nested object leaves the scheduler`s as it was');
    // Copy -> source: the consumer cannot write the copy, and the scheduler's object is untouched by the attempt.
    let threw = 0;
    try { (m as unknown as { name: string }).name = 'x'; } catch { threw += 1; }
    try { (m.data as { line: number }).line = 5; } catch { threw += 1; }
    try { (p as unknown as { progress: number }).progress = 1; } catch { threw += 1; }
    equal([threw, m.name, (m.data as { line: number }).line, (md.data as { line: number }).line], [3, 'log', 1, 99],
      'copy -> source: three writes refused (module code is strict), the copy and the source each as they were');
    // A function in an inline worker's details: nothing cloned it on the way, and `structuredClone` refuses it.
    r.s.progress(X, { details: { fn: () => 1 } });
    equal([r.progress.length, r.progress[1]!.details, r.failures.length, r.d.hasFailed()], [2, undefined, 0, false],
      'an uncloneable `details` is handed on undefined — the scheduler`s own treatment of an emit it cannot clone — and the run is NOT halted');
  });

  test('NOTHING after a stop — the same task`s message and progress delivered before it, dropped after', async () => {
    const r = rig();
    r.d.start({});
    r.s.message(X, { seq: 0 });
    r.s.progress(X, { progress: 0.1 });
    equal([r.messages.length, r.progress.length], [1, 1], 'the CONTROL: before the stop, x`s message and progress delivered');
    await r.d.stop({ actor: 'ops' });
    equal(fold(r.d.foldInputs()).outcome, 'interrupted', 'the run is STOPPED');
    r.s.message(X, { seq: 1 });
    r.s.progress(X, { progress: 0.2 });
    equal([r.messages.map((m) => m.seq), r.progress.map((p) => p.progress), r.s.reached.slice(-2)], [[0], [0.1], [1, 1]],
      'after it, NOTHING handed over — though the scheduler still reached the driver`s listener once each: the driver is deaf (RN-R33)');
  });

  test('a THROW from either callback is reported ONCE and HALTS the run — nothing leaves the event, a later message still arrives, and a later settlement routes nothing', () => {
    let calls = 0;
    const r = rig({ onMessage: () => { calls += 1; throw new PassBoom(`no log store (${calls})`); } });
    r.d.start({});
    let escaped: unknown = null;
    try { r.s.message(X); } catch (e) { escaped = e; }
    equal([escaped, r.failures.map((f) => [f.kind, f.message]), kinds(r.d)], [null, [[PassBoom.name, 'no log store (1)']], [`dispatched ${X}`, 'halted']],
      'nothing escaped the scheduler`s event; reported once under the consumer`s class; `halted` appended (onUnmintedTask`s road, OR-R10)');
    // A HALTED run's task still runs, and its messages still arrive — and the second throw is not reported again.
    try { r.s.message(X, { seq: 1 }); } catch (e) { escaped = e; }
    equal([escaped, calls, r.failures.length], [null, 2, 1], 'the second message delivered on the halted run; its throw discarded, the failure still reported ONCE');
    // And the halt is the dispatch hold: x's settlement routes nothing — y is never dispatched.
    r.s.settle(X);
    equal(r.s.added.map((t) => t.id), [X], 'x`s settlement dispatched NOTHING after the halt');
    // The progress callback takes the same road.
    const s = new PassFake();
    const failures: RunFailure[] = [];
    const d = new Driver(LINE, {
      runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']), now: () => 0,
      onRunFailure: (f) => { failures.push(f); }, onTaskProgress: () => { throw new PassBoom('no bar'); },
    });
    d.start({});
    s.progress(X);
    equal([failures.map((f) => f.kind), d.hasFailed()], [[PassBoom.name], true], 'onTaskProgress`s throw: reported once, the run halted');
    // The CONTROL: callbacks that do not throw halt nothing.
    const fine = rig();
    fine.d.start({});
    fine.s.message(X);
    fine.s.progress(X);
    fine.s.settle(X);
    equal([fine.failures.length, fine.d.hasFailed(), fine.s.added.map((t) => t.id)], [0, false, [X, 'r1:y:-:0']], 'the CONTROL: no throw, no halt, y dispatched');
  });

  test('a pass-through is never a fold input: the same events with and without both callbacks leave the same fold-input sequence', () => {
    const drive = (r: Rig) => {
      r.d.start({});
      r.s.message(X);
      r.s.progress(X);
      r.s.settle(X);
      r.s.message('r1:y:-:0');
      r.s.progress('r1:y:-:0');
    };
    const withBoth = rig();
    const without = rig({ message: false, progress: false });
    drive(withBoth);
    drive(without);
    equal([withBoth.messages.length, withBoth.progress.length], [2, 2], 'the CONTROL: with the callbacks, all four were handed over');
    equal(withBoth.d.foldInputs(), without.d.foldInputs(), 'the SAME sequence, element for element (P36 decision 5: never a fold input)');
    equal(kinds(withBoth.d), [`dispatched ${X}`, 'outcome', 'dispatched r1:y:-:0'], 'and it is the run`s routing alone, hand-written from the flow');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
