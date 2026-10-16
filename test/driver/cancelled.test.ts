/**
 * Ladder L1, L2 and L3 — **a task that ends CANCELLED**, at the listener, in the driver and on resume:
 * `spec/outcome-record.md` `OR-R3` and `OR-R4`, `spec/run-state.md` `RN-R23` and `RN-R28`,
 * [ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md),
 * [W158](../../doc/work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md).
 *
 * **What the fake models, and where it comes from.** The scheduler's own reference (its `AGENTS.md` sections
 * 5 and 6, in the installed package): `cancel()` ends a task in state `'cancelled'` and fires **`task.cancelled`
 * alone** — after `task.cancelling` if it was running, with nothing before it if it was still waiting — and
 * none of `task.completed`, `task.failed` or `task.user_action` follows; `error` is cleared by the cancel; and
 * `detail` is the live task, so a `result` the attempt produced may still be on it. **Every expected value
 * below is derived from the flow and the settlements this file delivers**, never from a run's output.
 *
 * **Each claim is asserted beside its CONTROL** — the same flow and the same settlements without the cancel —
 * so an assertion that the run did NOT route can fail: a driver that ignored `task.cancelled` would dispatch
 * the control's successor here too.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, ResumeRefused, resumeRefusal } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import { normalizeEvent, type TaskDetailLike } from '../../src/driver/listener.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

type State = 'done' | 'failed' | 'user_action' | 'cancelled';

/** L2's fake, plus the two events a cancel fires. It queues nothing and runs nothing. */
class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  readonly subscriptions: string[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push(task as { id: string; payload: unknown });
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.subscriptions.push(type);
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: State, over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else if (state === 'cancelled') this.fire('task.cancelled', detail);
    else {
      this.fire('task.failed', detail);
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  /** A cancel REQUESTED of a running task: state still `running`, `cancellation` set. */
  cancelling(id: string): void {
    this.fire('task.cancelling', { id, state: 'running', cancellation: { requestedAt: 1, forced: false }, attempts: 0, timestamp: 1 });
  }
  fire(type: string, detail: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

/** ingest -> fanout(a, b) -> join -> publish -> end. Two branches, so a cancel can land MID-fan-out. */
const FAN = {
  flowId: 'cancel-fan', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** outer(a, b); b -> inner(c, d) -> innerJoin -> outerJoin. A join that fires while `a` is still in flight. */
const NESTED = {
  flowId: 'cancel-nested', version: 1, entry: 'outer',
  nodes: [
    { id: 'outer', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'outerJoin' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'inner' }] },
    { id: 'inner', kind: 'fanout', branches: ['c', 'd'] },
    { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'innerJoin' }] },
    { id: 'd', kind: 'task', type: 'T', edges: [{ to: 'innerJoin' }] },
    { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
    { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

function harness(def: FlowDefinition = FAN, extra: Record<string, unknown> = {}) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  const failures: unknown[] = [];
  const driver = new Driver(def, {
    runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRegionEvent: (e) => events.push(e), onRunFailure: (f) => failures.push(f), ...extra,
  });
  const ids = () => scheduler.added.map((t) => t.id);
  const kinds = () => driver.foldInputs().map((e) => (e.kind === 'outcome' ? `outcome:${e.record.taskId}:${(e.record as { terminalState: string }).terminalState}` : e.kind));
  return { scheduler, driver, events, failures, ids, kinds, rx: () => events.map((e) => `${e.type}(${e.regionId}:${e.branchPath})`) };
}

const NOW = 1_756_512_000_000;
const live = (over: Partial<TaskDetailLike>): TaskDetailLike =>
  ({ id: 'r1:a:-:0', state: 'running', attempts: 0, timestamp: NOW - 1, startTime: NOW - 200, endTime: NOW - 2, executionTime: 198, ...over });

suite('L1 — OR-R3 and OR-R4: a cancel writes ONE record, keyed on its state; a cancel REQUESTED writes none', (test) => {
  test('`task.cancelled` writes one record, `terminalState: "cancelled"`', () => {
    const r = normalizeEvent('task.cancelled', live({ state: 'cancelled' }), NOW);
    equal(r?.terminalState, 'cancelled', 'the state is copied VERBATIM — not mapped to `failed` (ADR 0094 rule 1)');
    equal([r?.kind, r?.taskId, r?.error, r?.attempts, r?.schedulerTimestamp, r?.observedAt], ['outcome', 'r1:a:-:0', null, 0, NOW - 1, NOW],
      'the eleven fields are section 2`s, read the same way — `error` `null` because the scheduler clears it on a cancel');
  });

  test('`result` is `null` for a cancel WHATEVER the attempt produced — even a value OR-R6 would refuse', () => {
    const r = normalizeEvent('task.cancelled', live({ state: 'cancelled', result: { kept: 1 } }), NOW);
    equal(r?.result, null, 'OR-R2`s guard is part of the expression: `done` only. A cancelled task "ends cancelled whatever its run produced"');
    const fn = normalizeEvent('task.cancelled', live({ state: 'cancelled', result: { f: () => 1 } }), NOW);
    equal(fn?.result, null, 'and an UNCLONEABLE result is never cloned, so a cancel cannot stop the run as OR-R6');
    // The CONTROL: the same uncloneable value on a `done` settlement is refused — the guard is what saves the cancel.
    throws(() => normalizeEvent('task.completed', live({ state: 'done', result: { f: () => 1 } }), NOW), 'UncloneableResult',
      'the control: on `done` the same value is OR-R6`s refusal');
  });

  test('`task.cancelling` writes NOTHING — whatever state its detail carries (OR-R4)', () => {
    equal(normalizeEvent('task.cancelling', live({ state: 'running', cancellation: undefined } as Partial<TaskDetailLike>), NOW), null,
      'a cancel REQUESTED of a running task is not a settlement');
    equal(normalizeEvent('task.cancelling', live({ state: 'cancelled' }), NOW), null,
      'and it is refused by NAME, as `task.running` and `task.progress` are — a terminal-looking state does not make it one');
    // *(Carried, not independent: the early return and the settlement-name check each refuse this event, so
    // deleting either alone survives — `task.running`'s and `task.progress`'s existing shape. Removing the early
    // return AND admitting the name as a settlement together is caught by the assertion above. W158 M7.)*
  });

  test('the driver SUBSCRIBES `task.cancelled` and not `task.cancelling`', () => {
    const h = harness();
    equal([...h.scheduler.subscriptions].sort(), ['task.cancelled', 'task.completed', 'task.failed', 'task.user_action'],
      'four settlement events, one per terminal state — without `task.cancelled` a cancelled task is never heard (P33 fact 1)');
  });

  test('`on: ["cancelled"]` is refused at construction — FD-V18 still admits only `done` and `failed`', () => {
    const bad = JSON.parse(JSON.stringify(FAN)) as { nodes: { id: string; edges?: unknown[] }[] };
    bad.nodes.find((n) => n.id === 'a')!.edges = [{ on: ['cancelled'], to: 'collect' }, { to: 'collect' }];
    throws(() => harness(bad as unknown as FlowDefinition), 'FD-V18', 'a cancel routes no edge (ADR 0094 rule 1)');
    // The CONTROL: the same edge opting into `failed` is admitted, so the refusal is about the VALUE.
    const fine = JSON.parse(JSON.stringify(FAN)) as { nodes: { id: string; edges?: unknown[]; optional?: boolean }[] };
    const a = fine.nodes.find((n) => n.id === 'a')!;
    a.edges = [{ on: ['failed'], to: 'collect' }, { to: 'collect' }];
    a.optional = true;
    harness(fine as unknown as FlowDefinition);
  });
});

suite('L2 — RN-R28: the first cancelled settlement HALTS the run (a cancel mid-fan-out)', (test) => {
  /** The run up to the fan-out: ingest settled, `a` and `b` dispatched and in flight. */
  const midFan = (extra: Record<string, unknown> = {}) => {
    const h = harness(FAN, extra);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { n: 1 } });
    return h;
  };

  test('the CONTROL: without a cancel, the two branches arrive and the join dispatches `publish`', () => {
    const h = midFan();
    h.scheduler.settle('r1:a:0:0', 'done', { result: { a: 1 } });
    h.scheduler.settle('r1:b:1:0', 'done', { result: { b: 1 } });
    equal(h.ids(), ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0', 'r1:publish:-:0'], 'the successor IS dispatched — so the assertions below can fail');
  });

  test('a cancel of `a` with `b` in flight: recorded, nothing dispatched, nothing routed, nothing reported', () => {
    const h = midFan();
    const before = h.driver.foldInputs().length;
    h.scheduler.cancelling('r1:a:0:0');
    equal(h.driver.foldInputs().length, before, '`task.cancelling` appends nothing — the driver does not subscribe it (OR-R4)');
    ok(!h.scheduler.subscriptions.includes('task.cancelling'), 'and the reason is that it is not subscribed: the driver never hears it'); 
    h.scheduler.settle('r1:a:0:0', 'cancelled');
    equal(h.kinds().slice(before), ['outcome:r1:a:0:0:cancelled'], 'ONE element: the settlement, with no `halted` after it');
    equal(h.ids(), ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], 'no dispatch');
    equal(h.rx(), ['branch.opened(split:0)', 'branch.opened(split:1)'], 'no region event for the cancelled branch — the run is halted, not the branch lost');
    equal([h.failures.length, h.driver.hasFailed()], [0, false], 'a cancel is its owner`s act: `onRunFailure` is not called and `hasFailed()` is false');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'and the run folds to `cancelled`');
  });

  test('a task IN FLIGHT when the cancel lands is appended as it settles and routed NOWHERE', () => {
    const h = midFan();
    h.scheduler.settle('r1:a:0:0', 'cancelled');
    const before = h.driver.foldInputs().length;
    h.scheduler.settle('r1:b:1:0', 'done', { result: { b: 1 } });
    equal(h.kinds().slice(before), ['outcome:r1:b:1:0:done'], 'its settlement is appended — the log is what happened');
    equal(h.ids().includes('r1:publish:-:0'), false, 'and it routes nowhere: under live-token the CONTROL dispatched `publish` here');
    equal(h.rx(), ['branch.opened(split:0)', 'branch.opened(split:1)'], 'not even a `branch.arrived`');
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.nodes['r1:b:1:0']?.state, s.regions.split?.['-']?.joined], ['cancelled', 'done', null],
      'the run stays `cancelled`, the in-flight node folds `done`, and the join it left waiting is `null` — and the run is NOT `stuck`');
  });

  test('a SECOND cancel, and a later `user_action`, are appended and change nothing', () => {
    const h = harness({
      ...FAN,
      nodes: [...(FAN as unknown as { nodes: object[] }).nodes.slice(0, 1),
        { id: 'split', kind: 'fanout', branches: ['a', 'b', 'c'] },
        ...(FAN as unknown as { nodes: object[] }).nodes.slice(2, 4),
        { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        ...(FAN as unknown as { nodes: object[] }).nodes.slice(4)],
    } as unknown as FlowDefinition);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done');
    h.scheduler.settle('r1:b:1:0', 'cancelled');
    const before = h.driver.foldInputs().length;
    h.scheduler.settle('r1:a:0:0', 'cancelled');
    h.scheduler.settle('r1:c:2:0', 'user_action');
    equal(h.kinds().slice(before), ['outcome:r1:a:0:0:cancelled', 'outcome:r1:c:2:0:user_action'], 'both appended, one record each');
    equal(h.rx().filter((e) => !e.startsWith('branch.opened')), [], 'no `branch.suspended` for the parked task: the run is halted');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'and a parked task does not make the run `awaiting_action`');
  });

  test('a PARKED task stays parked and `resolve()` is REFUSED after the cancel', () => {
    const h = midFan();
    h.scheduler.settle('r1:a:0:0', 'user_action', { error: 'ask a person' });
    // The CONTROL, on a twin run: the parked task resolves and routes.
    const twin = midFan();
    twin.scheduler.settle('r1:a:0:0', 'user_action', { error: 'ask a person' });
    ok(twin.driver.resolve('r1:a:0:0', 'done', { result: { a: 'by hand' }, actor: 'ana' }), 'the control: without the cancel the resolution is accepted');
    h.scheduler.settle('r1:b:1:0', 'cancelled');
    const before = h.driver.foldInputs().length;
    equal(h.driver.resolve('r1:a:0:0', 'done', { result: { a: 'by hand' }, actor: 'ana' }), false, 'refused — a rejected command, as after `halted`');
    equal(h.driver.foldInputs().length, before, 'nothing appended');
    const s = fold(h.driver.foldInputs());
    equal([s.nodes['r1:a:0:0']?.state, s.outcome], ['suspended', 'cancelled'], 'the parked node stays `suspended`; the run is `cancelled`, not `awaiting_action`');
  });

  test('a cancel at the ENTRY of a sequence: the successor is never dispatched', () => {
    const LINEAR = { flowId: 'cancel-linear', version: 1, entry: 'ingest', nodes: [
      { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(LINEAR);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'cancelled');
    equal(h.ids(), ['r1:ingest:-:0'], 'nothing after the entry');
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.pathEnds], ['cancelled', []], '`cancelled`, and no path end — the path was not ENDED, the run was halted');
  });

  test('a cancel on the STACK of a join firing: the join routes nowhere (the door `settleJoin` shares with a halt)', () => {
    // `cancel()` of a task still WAITING fires `task.cancelled` synchronously, so a listener on the driver's own
    // callbacks can halt the run mid-step. Arranged: the inner join fires while the outer branch `a` is in flight,
    // and the consumer's `onFoldInput` cancels `a` on the inner join's own element.
    const run = (cancelOnJoin: boolean) => {
      const box = {} as { h: ReturnType<typeof harness> };
      box.h = harness(NESTED, { onFoldInput: (i: FoldInput) => {
        if (cancelOnJoin && i.kind === 'joinSettled' && i.regionId === 'inner') box.h.scheduler.settle('r1:a:0:0', 'cancelled');
      } });
      box.h.driver.start({});
      box.h.scheduler.settle('r1:b:1:0', 'done');
      box.h.scheduler.settle('r1:c:1.0:0', 'done');
      box.h.scheduler.settle('r1:d:1.1:0', 'done');
      return box.h;
    };
    const control = run(false);
    ok(control.rx().includes('branch.arrived(outer:1)'), 'the CONTROL: without the cancel the inner join routes, and branch 1 ARRIVES at the outer join');
    const h = run(true);
    ok(h.kinds().includes('joinSettled') && h.kinds().includes('outcome:r1:a:0:0:cancelled'), 'the ARRANGEMENT: the inner join settled and the cancel was appended');
    equal(h.rx().includes('branch.arrived(outer:1)'), false, 'with the cancel on the stack, the join routes NOWHERE');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'and the run is `cancelled`');
  });
});

suite('L3 — a cancelled run is deterministic: driven twice, folded twice', (test) => {
  const drive = () => {
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { n: 1 } });
    h.scheduler.settle('r1:a:0:0', 'cancelled');
    h.scheduler.settle('r1:b:1:0', 'done', { result: { b: 1 } });
    return h.driver.foldInputs();
  };
  test('the same stimuli give the same sequence, and the sequence folds to the same state twice', () => {
    const one = drive();
    equal(drive(), one, 'driven twice, the same fold-input sequence');
    equal(fold(one), fold(one), 'folded twice, the same state');
    equal(fold(one).outcome, 'cancelled', 'and it is the cancelled run');
  });
});

suite('RN-R23 — a resume of a CANCELLED run is refused as `cancelled`, naming the cancel`s position', (test) => {
  const cancelledRun = () => {
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done');
    const quiet = h.driver.checkpoint();
    h.scheduler.settle('r1:a:0:0', 'cancelled');
    h.scheduler.settle('r1:b:1:0', 'cancelled');
    return { h, quiet, cp: h.driver.checkpoint() };
  };
  const refusal = (fn: () => unknown): ResumeRefused => {
    try { fn(); } catch (e) { if (e instanceof ResumeRefused) return e; throw e; }
    throw new Error('expected ResumeRefused, nothing was thrown');
  };

  test('refused `cancelled` at the FIRST cancel`s position — not 0, not the last element, not the second cancel', () => {
    const { cp } = cancelledRun();
    const first = cp.events.findIndex((e) => e.kind === 'outcome' && e.record.kind === 'outcome' && e.record.terminalState === 'cancelled');
    ok(first > 0 && first < cp.events.length - 1, 'the ARRANGEMENT: the first cancel is neither the first element nor the last — a second cancel follows it');
    const s = new FakeScheduler();
    const d = new Driver(FAN, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']), joinPolicy: liveToken as unknown as JoinPolicy });
    const r = refusal(() => d.resume(cp));
    equal([r.reason, r.index], ['cancelled', first], 'refused as `cancelled` (ADR 0094 rule 5), naming the first cancel');
    equal(resumeRefusal(FAN, cp, 'r1')?.reason, 'cancelled', 'and the pure pre-check the runtime calls agrees');
    equal([s.added.length, d.foldInputs().length], [0, 0], 'nothing replayed, nothing handed to a scheduler');
    throws(() => d.start({}), 'MultipleRuns', 'and the driver is SPENT');
  });

  test('the CONTROL: the same run`s checkpoint taken BEFORE the cancel resumes', () => {
    const { quiet } = cancelledRun();
    equal(resumeRefusal(FAN, quiet, 'r1'), null, 'no cancel in the events, no refusal');
    const s = new FakeScheduler();
    const d = new Driver(FAN, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']), joinPolicy: liveToken as unknown as JoinPolicy });
    d.resume(quiet);
    equal(s.added.map((t) => t.id), ['r1:a:0:0', 'r1:b:1:0'], 'and re-dispatches what was in flight (RN-R21)');
  });

  test('`halted` outranks `cancelled` here too: a run cancelled and THEN halted is refused `halted`', () => {
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done');
    h.scheduler.settle('r1:a:0:0', 'cancelled');
    // An inline worker's result the clone refuses (OR-R6): the listener throws, and the driver stops the run.
    equal([h.failures.length, h.driver.hasFailed()], [0, false], 'the ARRANGEMENT: after the cancel alone, nothing reported');
    h.scheduler.settle('r1:b:1:0', 'done', { result: { f: () => 1 } });
    equal([h.failures.map((f) => (f as { kind: string }).kind), h.driver.hasFailed()], [['UncloneableResult'], true],
      'the later defect IS a refusal: `onRunFailure` fires exactly once and `hasFailed()` is true — the cancel did not mute OR-R10');
    const cp: Checkpoint = h.driver.checkpoint();
    const c = cp.events.findIndex((e) => e.kind === 'outcome' && e.record.kind === 'outcome' && e.record.terminalState === 'cancelled');
    const k = cp.events.findIndex((e) => e.kind === 'halted');
    ok(c >= 0 && k > c, 'the ARRANGEMENT: the cancel is stored BEFORE the halt');
    equal(fold(cp.events).outcome, 'halted', 'the fold reads `halted` (RN-R8 outranks RN-R28)');
    const r = resumeRefusal(FAN, cp, 'r1');
    equal([r?.reason, r?.index], ['halted', k], 'and the resume is refused `halted`, at the halt — not `cancelled` at the earlier cancel');
  });
});
