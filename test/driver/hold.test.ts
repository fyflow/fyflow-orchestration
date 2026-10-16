/**
 * Ladder L2 — **the dispatch hold: a halt raised ON THE STACK of the driver's own step dispatches, routes and
 * emits nothing further** — `spec/run-state.md` `RN-R29` (v0.17),
 * [ADR 0103](../../doc/decisions/0103-every-halt-shares-one-dispatch-hold.md),
 * [Q605](../../doc/questions/q605.md)'s `closes-when`, P34 decision 8,
 * [W172](../../doc/work-items/w172-the-dispatch-hold-and-q605.md).
 *
 * **The two doors Q605 names, each with each of the two halts there are today**, raised from the consumer's own
 * `onFoldInput` while the driver is mid-step:
 *
 *   - door (a) — a fan-out's FIRST branch, and a `map`'s FIRST instance: the halt is raised on that task's
 *     `dispatched` element, and the region's remaining branches must not be entered;
 *   - door (b) — a resolution: the halt is raised on the `resolution` element `resolve()` appends, and neither its
 *     `branch.resumed` nor the routing after it may run.
 *
 * The two halts: a REFUSAL (`OR-R10`, `RN-R8` — here an `UndispatchedTask`, a settlement under this run's id for a
 * task it never dispatched, `ID-R4` tier 2) and a CANCELLED settlement (`RN-R28`) for a task of the run. **Every
 * expected value is derived from the flow and the spec** — `JP-R5` (every `branch.opened` before any branch is
 * entered), `RN-R4` (a `dispatched` element before the task is handed on), `RS-R2` (a resolution appended, then its
 * region told, then routed) — and never from a run's output. **Each claim sits beside its CONTROL**: the same flow,
 * the same hook firing at the same element and raising nothing, which dispatches, routes and emits exactly what the
 * held case must not.
 */
import { equal, collected, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken, liveTokenRequiringArrival } from '../../src/fold/policies.ts';

type State = 'done' | 'failed' | 'user_action' | 'cancelled';

/** L2's fake: it records what it is handed and fires what a test tells it to. It queues nothing and runs nothing. */
class FakeScheduler {
  readonly added: string[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push((task as { id: string }).id);
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: State, result: unknown = null): void {
    const detail = { id, state, result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    const fire = (type: string) => { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); };
    if (state === 'done') fire('task.completed');
    else if (state === 'cancelled') fire('task.cancelled');
    else {
      fire('task.failed');
      if (state === 'user_action') fire('task.user_action');
    }
  }
}

/** ingest -> split(a -> a2, b, c) -> collect -> publish -> end. THREE branches, so two remain after the first (fact 1's shape). */
const FAN = {
  flowId: 'hold-fan', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['a', 'b', 'c'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'a2' }] },
    { id: 'a2', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** ingest -> each(map over `items`, branch t -> t2) -> collect -> done. ingest returns THREE items. */
const MAP = {
  flowId: 'hold-map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'items', branch: 't' },
    { id: 't', kind: 'task', type: 'T', edges: [{ to: 't2' }] },
    { id: 't2', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** ingest -> split(a -> a2, b) -> collect -> done. `a` parks at `user_action`; `b` is in flight while a person resolves `a`. */
const PARK = {
  flowId: 'hold-park', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'a2' }] },
    { id: 'a2', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** One element, as a short string a hand-written expectation can name. */
const label = (e: FoldInput): string => {
  switch (e.kind) {
    case 'dispatched': return `dispatched ${e.taskId}`;
    case 'outcome': return `outcome ${e.record.taskId} ${(e.record as { terminalState: string }).terminalState}`;
    case 'resolution': return `resolution ${e.record.taskId}`;
    case 'region': return `${e.event.type} ${e.event.branchPath}`;
    case 'halted': return 'halted';
    case 'joinSettled': return `joinSettled ${e.fired ? 'fired' : 'not-fired'}`;
    default: return e.kind;
  }
};

/**
 * A driver whose `onFoldInput` fires `raise` ONCE, on the first element `at` names — the consumer's callback on the
 * driver's own stack, which is the whole of Q605. `raise` is `undefined` for the CONTROL: the hook still matches.
 */
function harness(def: FlowDefinition, at: (e: FoldInput) => boolean, raise?: (s: FakeScheduler) => void, extra: Record<string, unknown> = {}) {
  const scheduler = new FakeScheduler();
  const events: string[] = [];
  const failures: string[] = [];
  let fired = 0;
  const driver = new Driver(def, {
    runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRegionEvent: (e: RegionEvent) => events.push(`${e.type} ${e.branchPath}`),
    onRunFailure: (f) => failures.push(f.kind),
    onFoldInput: (e) => {
      if (fired === 0 && at(e)) {
        fired += 1;
        raise?.(scheduler);
      }
    },
    ...extra,
  });
  const log = () => driver.foldInputs().map(label);
  return { scheduler, driver, events, failures, log, fired: () => fired };
}

const dispatchedOf = (id: string) => (e: FoldInput) => e.kind === 'dispatched' && e.taskId === id;
const resolutionOf = (id: string) => (e: FoldInput) => e.kind === 'resolution' && e.record.taskId === id;
/** The REFUSAL: a settlement under this run's id for a task it never dispatched — `ID-R4` tier 2, `OR-R10`. */
const refusal = (s: FakeScheduler) => s.settle('r1:ghost:-:0', 'done');
/** The CANCEL: a `cancelled` settlement for a task of the run, as `cancel()` of a WAITING task fires inside the call. */
const cancelOf = (id: string) => (s: FakeScheduler) => s.settle(id, 'cancelled');

/** Every element up to and including the first branch's dispatch, for FAN — JP-R5 and RN-R4, by hand. */
const FAN_PREFIX = [
  'dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0 done', 'regionEntered',
  'branch.opened 0', 'branch.opened 1', 'branch.opened 2',
  'dispatched r1:a:0:0',
];
/** The same for MAP: one instance per item, its path the item's index (`ID-R6`). */
const MAP_PREFIX = [
  'dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0 done', 'regionEntered',
  'branch.opened 0', 'branch.opened 1', 'branch.opened 2',
  'dispatched r1:t:0:0',
];
/** PARK up to and including `a` parking: `b` in flight, `a` suspended. */
const PARK_PREFIX = [
  'dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0 done', 'regionEntered',
  'branch.opened 0', 'branch.opened 1',
  'dispatched r1:a:0:0', 'dispatched r1:b:1:0',
  'outcome r1:a:0:0 user_action', 'branch.suspended 0',
];

const SUITE = 'L2 — RN-R29: the dispatch hold — a halt ON THE STACK of a fan-out, a map or a resolution dispatches, routes and emits nothing further (Q605)';

const DECLARED_CASES = [
  'door (a), fan-out — the CONTROL: the hook fires on the first branch`s dispatch and raises nothing',
  'door (a), fan-out — a REFUSAL on the first branch`s dispatch: the other branches are never entered',
  'door (a), fan-out — a CANCELLED settlement on the first branch`s dispatch: the same',
  'door (a), map — the CONTROL: the hook fires on the first instance`s dispatch and raises nothing',
  'door (a), map — a REFUSAL on the first instance`s dispatch: the other instances are never entered',
  'door (a), map — a CANCELLED settlement on the first instance`s dispatch: the same',
  'door (b) — the CONTROL: the hook fires on the resolution and raises nothing',
  'door (b) — a REFUSAL on the resolution`s own element: no `branch.resumed`, nothing routed',
  'door (b) — a CANCELLED settlement on the resolution`s own element: the same',
  'door (b) — a REFUSAL on the `branch.resumed` element: the routing after it does not run',
  'the head of `enter`, on a node that is NOT a task: a refusal on a gate`s `gated` element enters no route',
  'what the hold does NOT shut, stated so it cannot change in silence: the step`s own appends before the next check',
  'resume()`s re-dispatch — a halt on the `resumed` element hands nothing on, and one raised by a hand-off holds the next (S-1)',
  'the head of `enter`, under a CANCEL: a cancelled settlement on a gate`s `gated` element enters no route, and a later `user_action` emits nothing',
  'door (b) — a CANCELLED settlement on the `branch.resumed` element: the routing after it does not run',
  'the head of a DISPATCH: a refusal raised inside `compose` — a getter on start()`s payload — dispatches nothing',
  'every case this file declares actually RAN',
];

suite(SUITE, (test) => {
  // --- door (a), a fan-out ------------------------------------------------------------------------------------

  /** FAN, run to the fan-out: `start`, then `ingest` settles and the listener enters `split` — the stack Q605 names. */
  const fan = (raise?: (s: FakeScheduler) => void) => {
    const h = harness(FAN, dispatchedOf('r1:a:0:0'), raise);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { n: 1 });
    equal(h.fired(), 1, 'the hook fired, once, on the first branch`s `dispatched` element — the arrangement every claim below stands on');
    return h;
  };

  test(DECLARED_CASES[0]!, () => {
    const h = fan();
    equal(h.log(), [...FAN_PREFIX, 'dispatched r1:b:1:0', 'dispatched r1:c:2:0'],
      'all three branches dispatched in the definition`s order (RN-R27 (b)) — so the held cases below CAN fail');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0', 'r1:c:2:0'], 'and all three handed to the scheduler');
    h.scheduler.settle('r1:a:0:0', 'done');
    equal(h.scheduler.added.at(-1), 'r1:a2:0:0', 'and `a`s settlement ROUTES: `a2` is dispatched');
    equal(fold(h.driver.foldInputs()).outcome, 'running', 'the control run is live');
  });

  test(DECLARED_CASES[1]!, () => {
    const h = fan(refusal);
    equal(h.log(), [...FAN_PREFIX, 'halted'],
      'the log ENDS at the halt: no `dispatched` for `b` or `c` after it — Q605 door (a), shut');
    equal(h.driver.dispatchedIds(), ['r1:ingest:-:0', 'r1:a:0:0'], 'the driver dispatched nothing after the halt — `b` and `c` were never entered');
    // `a` IS handed on: its `dispatched` element is the halted step's own, appended before the halt was raised on
    // it, and `RN-R29` holds the NEXT dispatch, not the one in progress (`RN-R4`'s order, ADR 0103 rule 3).
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0'], 'the scheduler was handed the dispatch in progress and nothing after it');
    equal(h.events, ['branch.opened 0', 'branch.opened 1', 'branch.opened 2'], 'no region event after the halt');
    equal(h.failures, ['UndispatchedTask'], 'the refusal is reported ONCE, under its own name (OR-R10)');
    // The later settlement is a `user_action`, and the state is the point: it routes NOTHING through `enter` — a parked
    // task emits `branch.suspended` inside `settle` itself — so only `settle`'s own check holds it (adequacy A2).
    h.scheduler.settle('r1:a:0:0', 'user_action');
    equal(h.log().slice(FAN_PREFIX.length), ['halted', 'outcome r1:a:0:0 user_action'], '`a`s later settlement is appended, and NOTHING after it — no `branch.suspended`');
    equal(h.events, ['branch.opened 0', 'branch.opened 1', 'branch.opened 2'], '`onRegionEvent` heard no suspension');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0'], 'and nothing handed on');
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.haltedBy?.startsWith('UndispatchedTask: ')], ['halted', true], 'and the run folds `halted`, naming the refusal');
  });

  test(DECLARED_CASES[2]!, () => {
    const h = fan(cancelOf('r1:a:0:0'));
    equal(h.log(), [...FAN_PREFIX, 'outcome r1:a:0:0 cancelled'],
      'the log ENDS at the cancelled settlement: no `dispatched` for `b` or `c` — a cancel shuts door (a) as a refusal does');
    equal(h.driver.dispatchedIds(), ['r1:ingest:-:0', 'r1:a:0:0'], 'nothing dispatched after the cancel');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0'], 'nothing handed on after the dispatch in progress');
    equal(h.events, ['branch.opened 0', 'branch.opened 1', 'branch.opened 2'], 'no region event after the cancel');
    equal([h.failures, h.driver.hasFailed()], [[], false], 'a cancel is not a refusal: nothing reported (RN-R28)');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'and the run folds `cancelled`');
  });

  // --- door (a), a map ----------------------------------------------------------------------------------------

  const map = (raise?: (s: FakeScheduler) => void) => {
    const h = harness(MAP, dispatchedOf('r1:t:0:0'), raise);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { items: ['x', 'y', 'z'] });
    equal(h.fired(), 1, 'the hook fired, once, on the first instance`s `dispatched` element');
    return h;
  };

  test(DECLARED_CASES[3]!, () => {
    const h = map();
    equal(h.log(), [...MAP_PREFIX, 'dispatched r1:t:1:0', 'dispatched r1:t:2:0'], 'three instances, in the array`s order');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:t:0:0', 'r1:t:1:0', 'r1:t:2:0'], 'all three handed on');
    h.scheduler.settle('r1:t:0:0', 'done');
    equal(h.scheduler.added.at(-1), 'r1:t2:0:0', 'and instance 0`s settlement routes to `t2`');
  });

  test(DECLARED_CASES[4]!, () => {
    const h = map(refusal);
    equal(h.log(), [...MAP_PREFIX, 'halted'], 'the log ENDS at the halt: instances 1 and 2 are never entered');
    equal(h.driver.dispatchedIds(), ['r1:ingest:-:0', 'r1:t:0:0'], 'nothing dispatched after the halt');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:t:0:0'], 'nothing handed on after the dispatch in progress');
    equal(h.events, ['branch.opened 0', 'branch.opened 1', 'branch.opened 2'], 'no region event after the halt');
    // `failed`, and no edge of `t` opts into it: the routing would END the path inside `advance` (`branch.lost`, then
    // `pathEnded`) without entering a node, so only `settle`'s own check holds it (adequacy A2).
    h.scheduler.settle('r1:t:0:0', 'failed');
    equal(h.log().slice(MAP_PREFIX.length), ['halted', 'outcome r1:t:0:0 failed'], 'a later `failed` settlement appended, and NOTHING after it — no `branch.lost`, no `pathEnded`');
    equal(h.events, ['branch.opened 0', 'branch.opened 1', 'branch.opened 2'], 'no region event for it');
    equal(h.scheduler.added.length, 2, 'and nothing handed on');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the run folds `halted`');
  });

  test(DECLARED_CASES[5]!, () => {
    const h = map(cancelOf('r1:t:0:0'));
    equal(h.log(), [...MAP_PREFIX, 'outcome r1:t:0:0 cancelled'], 'the log ENDS at the cancel: instances 1 and 2 are never entered');
    equal(h.driver.dispatchedIds(), ['r1:ingest:-:0', 'r1:t:0:0'], 'nothing dispatched after the cancel');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:t:0:0'], 'nothing handed on after the dispatch in progress');
    equal(h.events, ['branch.opened 0', 'branch.opened 1', 'branch.opened 2'], 'no region event after the cancel');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'the run folds `cancelled`');
  });

  // --- door (b), a resolution ---------------------------------------------------------------------------------

  /** PARK, run until `a` parks with `b` in flight; then a person resolves `a` and the hook fires on `at`. */
  const park = (at: (e: FoldInput) => boolean, raise?: (s: FakeScheduler) => void, as: 'done' | 'failed' = 'done') => {
    const h = harness(PARK, at, raise);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { n: 1 });
    h.scheduler.settle('r1:a:0:0', 'user_action');
    equal(h.log(), PARK_PREFIX, 'the arrangement: `a` parked, `b` in flight, nothing else');
    const accepted = h.driver.resolve('r1:a:0:0', as, as === 'done' ? { result: { ok: 1 }, actor: 'person' } : { error: 'no', actor: 'person' });
    equal([accepted, h.fired()], [true, 1], 'the resolution is ACCEPTED — its element is appended — and the hook fired once');
    return h;
  };

  test(DECLARED_CASES[6]!, () => {
    const h = park(resolutionOf('r1:a:0:0'));
    equal(h.log().slice(PARK_PREFIX.length), ['resolution r1:a:0:0', 'branch.resumed 0', 'dispatched r1:a2:0:0'],
      'RS-R2: the resolution, its region told, then the route out of `a` — so the held cases below CAN fail');
    equal(h.scheduler.added.at(-1), 'r1:a2:0:0', 'and `a2` is handed on');
    equal(h.events.at(-1), 'branch.resumed 0', 'and `onRegionEvent` heard the resume');
  });

  test(DECLARED_CASES[7]!, () => {
    const h = park(resolutionOf('r1:a:0:0'), refusal);
    equal(h.log().slice(PARK_PREFIX.length), ['resolution r1:a:0:0', 'halted'],
      'the log ENDS at the halt: no `branch.resumed` and no `dispatched a2` — Q605 door (b), shut');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], 'nothing handed on after the resolution');
    equal(h.events.at(-1), 'branch.suspended 0', 'no region event after the halt — `onRegionEvent` never heard a resume');
    equal(h.driver.snapshot().map((r) => `${r.kind} ${r.taskId}`).at(-1), 'resolution r1:a:0:0', 'the log`s records end at the resolution');
    h.scheduler.settle('r1:b:1:0', 'done');
    equal([h.scheduler.added.length, h.log().at(-1)], [3, 'outcome r1:b:1:0 done'], 'the in-flight sibling is appended and routed nowhere');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the run folds `halted`');
  });

  test(DECLARED_CASES[8]!, () => {
    const h = park(resolutionOf('r1:a:0:0'), cancelOf('r1:b:1:0'));
    equal(h.log().slice(PARK_PREFIX.length), ['resolution r1:a:0:0', 'outcome r1:b:1:0 cancelled'],
      'the log ENDS at the in-flight sibling`s cancel: no `branch.resumed`, no `dispatched a2`');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], 'nothing handed on after the resolution');
    equal(h.events.at(-1), 'branch.suspended 0', 'no region event after the cancel');
    equal([h.failures, fold(h.driver.foldInputs()).outcome], [[], 'cancelled'], 'nothing reported, and the run folds `cancelled`');
  });

  test(DECLARED_CASES[9]!, () => {
    // The halt raised one element LATER — on the `branch.resumed` the resolution emits — so the region WAS told, and
    // what must not run is the routing after it: the second of door (b)'s two checks. **Resolved `failed`, and the
    // choice is the point**: `a`'s one edge opts into nothing but `done`, so the routing ENDS THE PATH inside
    // `advance` itself — a `branch.lost` and a `pathEnded` (`RN-R10`'s neighbour) — and only this check holds
    // that; a `done` resolution's routing enters `a2`, which `enter`'s own check would hold without it.
    const at = (e: FoldInput) => e.kind === 'region' && e.event.type === 'branch.resumed';
    const control = park(at, undefined, 'failed');
    equal(control.log().slice(PARK_PREFIX.length), ['resolution r1:a:0:0', 'branch.resumed 0', 'branch.lost 0', 'pathEnded'],
      'the CONTROL: a `failed` resolution with no edge opting in ends the path — `branch.lost`, then `pathEnded`');
    const h = park(at, refusal, 'failed');
    equal(h.log().slice(PARK_PREFIX.length), ['resolution r1:a:0:0', 'branch.resumed 0', 'halted'],
      'the resume is emitted, the halt follows it, and NOTHING follows the halt: no `branch.lost`, no `pathEnded`');
    equal(h.events.at(-1), 'branch.resumed 0', 'no region event after the halt');
    equal(h.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], 'nothing handed on');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the run folds `halted`');
  });

  test(DECLARED_CASES[10]!, () => {
    // `RN-R29`'s check (1) on a node that is not a task. Door (a)'s branches are tasks (`FD-V9`, `FD-V25`), so the
    // dispatch's own check would hold them even without this one; a gate's ROUTE is entered after the `gated`
    // append (`RN-R26`), and here it is an `end`, which dispatches nothing — only the head of `enter` holds it.
    // ingest -> g (built-in `if`: input.n >= 1 takes `then`) -> done (end); the default route to `other`.
    const GATE = {
      flowId: 'hold-gate', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', type: 'if', settings: { when: { path: 'input.n', op: 'gte', value: 1 } },
          edges: [{ route: 'then', to: 'done' }, { to: 'other' }] },
        { id: 'other', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const gated = (e: FoldInput) => e.kind === 'gated';
    const control = harness(GATE, gated);
    control.driver.start({});
    control.scheduler.settle('r1:ingest:-:0', 'done', { n: 5 });
    equal([control.fired(), control.log()], [1, ['dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0 done', 'gated', 'pathEnded']],
      'the CONTROL: the gate decides `then`, and its route — the `end` — is entered: `pathEnded`');
    const h = harness(GATE, gated, refusal);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { n: 5 });
    equal(h.log(), ['dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0 done', 'gated', 'halted'],
      'the log ENDS at the halt: the route is not entered, so no `pathEnded`');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the run folds `halted` — not `completed`, which the control`s path end gives');
  });

  // --- the limit, stated --------------------------------------------------------------------------------------

  test(DECLARED_CASES[11]!, () => {
    // `RN-R29`'s limit: the hold is re-checked at the head of entering a node, at a dispatch, and after a
    // resolution's append — not after EVERY append. A halt raised on the region's `regionEntered` element lands
    // inside the fan-out arm's `JP-R5` loop, which emits every `branch.opened` before entering any branch; those
    // events still land, and no branch is entered. Asserted so that the behaviour cannot change unannounced.
    const h = harness(FAN, (e) => e.kind === 'regionEntered', refusal);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { n: 1 });
    equal(h.fired(), 1, 'the hook fired on `regionEntered`');
    equal(h.log(), ['dispatched r1:ingest:-:0', 'outcome r1:ingest:-:0 done', 'regionEntered', 'halted',
      'branch.opened 0', 'branch.opened 1', 'branch.opened 2'],
    'the three `branch.opened` of the step in progress land after the halt, and NO `dispatched` does');
    equal(h.scheduler.added, ['r1:ingest:-:0'], 'no branch handed on');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the run folds `halted` — what landed moves no outcome (RN-R8)');
    // The same limit on a JOIN (conformity C1): a halt raised on the last branch`s `branch.arrived` lands inside the
    // join arm, which asks the policy next; `live-token` answers satisfied and `joinSettled` (fired) is appended — then
    // `settleJoin`'s own check stops the routing out of it. Two branches, `a` and `b`; the join`s successor `publish`.
    const JOIN = {
      flowId: 'hold-join', version: 1, entry: 'ingest',
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
    const j = harness(JOIN, (e) => e.kind === 'region' && e.event.type === 'branch.arrived' && e.event.branchPath === '1', refusal);
    j.driver.start({});
    j.scheduler.settle('r1:ingest:-:0', 'done');
    j.scheduler.settle('r1:a:0:0', 'done');
    j.scheduler.settle('r1:b:1:0', 'done');
    equal(j.fired(), 1, 'the hook fired on branch 1`s arrival');
    equal(j.log().slice(-3), ['branch.arrived 1', 'halted', 'joinSettled fired'],
      'the join step in progress lands its `joinSettled` after the halt …');
    equal(j.scheduler.added, ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], '… and routes nothing out of it: no `publish`');
    // And on a branch`s `branch.lost` (conformity C1): the same flow with `a` and `b` OPTIONAL, both failing, no edge
    // opting into `failed`, under `live-token-requiring-arrival` — so the second loss makes the join unsatisfiable. A
    // halt on branch 1`s `branch.lost` lands inside `advance`, which appends the path`s `pathEnded` next and asks the
    // join, which settles NOT fired and reports it — a report for a run already halted.
    const LOST = JSON.parse(JSON.stringify(JOIN)) as { nodes: { id: string; optional?: boolean }[] };
    for (const n of LOST.nodes) if (n.id === 'a' || n.id === 'b') n.optional = true;
    const unsatisfiable: string[] = [];
    const l = harness(LOST as unknown as FlowDefinition, (e) => e.kind === 'region' && e.event.type === 'branch.lost' && e.event.branchPath === '1', refusal, {
      joinPolicy: liveTokenRequiringArrival as unknown as JoinPolicy, onUnsatisfiableJoin: (u: { joinId: string }) => unsatisfiable.push(u.joinId) });
    l.driver.start({});
    l.scheduler.settle('r1:ingest:-:0', 'done');
    l.scheduler.settle('r1:a:0:0', 'failed');
    l.scheduler.settle('r1:b:1:0', 'failed');
    equal(l.fired(), 1, 'the hook fired on branch 1`s loss');
    equal(l.log().slice(-4), ['branch.lost 1', 'halted', 'pathEnded', 'joinSettled not-fired'],
      'the step in progress lands its `pathEnded` and the join`s settlement after the halt');
    equal(unsatisfiable, ['collect'], 'and `onUnsatisfiableJoin` is still CALLED, once, for the halted run');
    equal(fold(l.driver.foldInputs()).outcome, 'halted', 'which folds `halted` all the same');
  });

  test(DECLARED_CASES[12]!, () => {
    // `RN-R29`'s check before EACH of `resume()`'s re-dispatches — the maintainer's answer to W172's S-1 (2026-10-16),
    // which made a limit of v0.17's first cut a checked place. `resume()` appends `resumed` naming the in-flight set
    // (`RN-R22`) and then hands each to the scheduler (`RN-R21`). The run: an entry fan-out `split(y, z)`, checkpointed
    // with both in flight, so the set is `[y, z]` in dispatch order.
    const SPLIT = {
      flowId: 'hold-resume', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['y', 'z'] },
        { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'z', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const first = harness(SPLIT, () => false);
    first.driver.start({});
    const cp = first.driver.checkpoint();
    const resumed = (e: FoldInput) => e.kind === 'resumed';
    const control = harness(SPLIT, resumed);
    control.driver.resume(cp);
    equal([control.fired(), control.scheduler.added], [1, ['r1:y:0:0', 'r1:z:1:0']], 'the CONTROL: the hook fired on `resumed` and both are handed on');
    // A REFUSAL on the `resumed` element: nothing handed on.
    const h = harness(SPLIT, resumed, refusal);
    h.driver.resume(cp);
    equal(h.log().slice(cp.events.length), ['resumed', 'halted'], 'the halt lands on the `resumed` element`s stack');
    equal(h.scheduler.added, [], 'and NOTHING is handed to the scheduler');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the run folds `halted`');
    // A CANCEL of `y` on the same element: the same.
    const c = harness(SPLIT, resumed, cancelOf('r1:y:0:0'));
    c.driver.resume(cp);
    equal([c.log().slice(cp.events.length), c.scheduler.added], [['resumed', 'outcome r1:y:0:0 cancelled'], []], 'a cancel there hands nothing on either');
    // The check is per re-dispatch, not once before the loop: a halt raised while `y` is handed on — a scheduler that
    // fires a refusal inside `addTask` — holds `z`.
    const k = harness(SPLIT, () => false);
    const add = k.scheduler.addTask.bind(k.scheduler);
    k.scheduler.addTask = (t: unknown) => { add(t); if ((t as { id: string }).id === 'r1:y:0:0') refusal(k.scheduler); };
    k.driver.resume(cp);
    equal(k.scheduler.added, ['r1:y:0:0'], '`y` handed on, the halt raised inside its hand-off, and `z` held');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'for a run that folds `halted`');
  });

  test(DECLARED_CASES[13]!, () => {
    // Check (1) under a CANCEL (adequacy A3): the gate case above under a refusal, again with the halt a cancelled
    // settlement — which needs a task in flight to cancel, so the gate sits in branch 1 of a three-branch fan-out and
    // branch 0's `a` is cancelled from the `gated` element. Branch 2's `c` is still in flight after, and its later
    // `user_action` emits nothing: `settle`'s own check under the cancel (adequacy A2).
    // ingest -> split(a, b -> g, c); g (`if` on input.n >= 1): `then` -> done (end), default -> collect.
    const GATE3 = {
      flowId: 'hold-gate3', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['a', 'b', 'c'] },
        { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', type: 'if', settings: { when: { path: 'input.n', op: 'gte', value: 1 } },
          edges: [{ route: 'then', to: 'done' }, { to: 'collect' }] },
        { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const gated = (e: FoldInput) => e.kind === 'gated';
    const drive = (raise?: (s: FakeScheduler) => void) => {
      const h = harness(GATE3, gated, raise);
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done');
      h.scheduler.settle('r1:b:1:0', 'done', { n: 5 });
      equal(h.fired(), 1, 'the hook fired on the gate`s decision');
      return h;
    };
    const control = drive();
    equal(control.log().slice(-3), ['gated', 'branch.exited 1', 'pathEnded'],
      'the CONTROL: the route is the `end`, inside the region — `branch.exited`, then `pathEnded`');
    const h = drive(cancelOf('r1:a:0:0'));
    equal(h.log().slice(-3), ['outcome r1:b:1:0 done', 'gated', 'outcome r1:a:0:0 cancelled'],
      'the log ENDS at the cancel: the route is not entered — no `branch.exited`, no `pathEnded`');
    h.scheduler.settle('r1:c:2:0', 'user_action');
    equal(h.log().slice(-2), ['outcome r1:a:0:0 cancelled', 'outcome r1:c:2:0 user_action'],
      'the in-flight `c` parks and NOTHING follows — no `branch.suspended`');
    equal(h.events.at(-1), 'branch.opened 2', 'no region event since the branches opened');
    equal([h.failures, fold(h.driver.foldInputs()).outcome], [[], 'cancelled'], 'nothing reported; the run folds `cancelled`');
  });

  test(DECLARED_CASES[14]!, () => {
    // Door (b)'s second check under a CANCEL (adequacy A3, the reader's P4): `b`, in flight, is cancelled from the
    // `branch.resumed` element of a `failed` resolution, whose routing would end the path inside `advance`.
    const h = park((e) => e.kind === 'region' && e.event.type === 'branch.resumed', cancelOf('r1:b:1:0'), 'failed');
    equal(h.log().slice(PARK_PREFIX.length), ['resolution r1:a:0:0', 'branch.resumed 0', 'outcome r1:b:1:0 cancelled'],
      'the log ENDS at the cancel: no `branch.lost`, no `pathEnded`');
    equal(h.driver.dispatchedIds(), ['r1:ingest:-:0', 'r1:a:0:0', 'r1:b:1:0'], 'nothing dispatched after it');
    equal([h.failures, fold(h.driver.foldInputs()).outcome], [[], 'cancelled'], 'nothing reported; the run folds `cancelled`');
  });

  test(DECLARED_CASES[15]!, () => {
    // Check (2) is REACHABLE (adequacy A1, the reader's P1): `enter` checks the hold and then calls `compose`, and for
    // an entry declaring `needs: { v: "." }` that clones the CALLER's payload — `start()` hands `enter` the value it
    // was called with, not its header copy — and a clone runs the payload's getters: consumer code between the head
    // of `enter` and the head of `dispatch`. A getter whose SECOND read (the first is `start()`'s header clone)
    // raises a refusal halts the run there; only the dispatch's own check then holds the entry task.
    const SEQ = {
      flowId: 'hold-compose', version: 1, entry: 'x',
      nodes: [
        { id: 'x', kind: 'task', type: 'T', needs: { v: '.' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const drive = (raise: boolean) => {
      const h = harness(SEQ, () => false);
      let reads = 0;
      const payload = {};
      Object.defineProperty(payload, 'k', { enumerable: true, get() {
        reads += 1;
        if (raise && reads === 2) refusal(h.scheduler);
        return 1;
      } });
      h.driver.start(payload);
      equal(reads, 2, 'the getter ran twice: the header`s clone, then `compose``s');
      return h;
    };
    const control = drive(false);
    equal([control.log(), control.scheduler.added], [['dispatched r1:x:-:0'], ['r1:x:-:0']], 'the CONTROL: the entry is dispatched and handed on');
    const h = drive(true);
    equal(h.log(), ['halted'], 'the halt is the whole log: no `dispatched` after it');
    equal([h.scheduler.added, h.driver.dispatchedIds(), h.failures], [[], [], ['UndispatchedTask']], 'nothing handed on or dispatched; the refusal reported once');
  });

  test(DECLARED_CASES[16]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
