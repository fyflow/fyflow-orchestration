/**
 * Ladder L2 — routing from a fixture log of outcomes, with no scheduler.
 *
 * `doc/workflow.md` section 4: *"Level 2 is where this repo's value is proved and
 * it costs almost nothing"* — and *"if level 2 is hard to write, the driver has
 * reached for the scheduler somewhere it should not have."* The fake below is
 * twelve lines, which is the check passing.
 *
 * Covers FD-R1, ID-R1, JP-R5, RS-R2, RS-R3, and the region event stream P1's whole
 * question is asked over. Expected values come from `spec/`, and every event
 * sequence is asserted against the vocabulary in `spec/join-policy.md` section 2 —
 * never against what the driver happened to emit.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver, DuplicateTaskId, InvalidDefinition, MissingJoinPolicy } from '../../src/driver/driver.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { selectEdge, type Predicate } from '../../src/driver/routing.ts';
import { fold } from '../../src/fold/run-state.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };

/** The whole scheduler, for level 2. It queues nothing and runs nothing. */
class FakeScheduler {
  readonly added: { id: string; workerType: string; payload: unknown; optional: boolean }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push(task as { id: string; workerType: string; payload: unknown; optional: boolean });
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  /** Deliver a settlement exactly as 0.3.0 does — including the pair for `user_action`. */
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else {
      this.fire('task.failed', detail);              // fires for user_action too, first
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

/**
 * A STUB policy, and deliberately a naive one: `N` from the declared branch count,
 * satisfied on `N` arrivals, never `unsatisfiable`. It exists to exercise W3's
 * SEAM, not to be a policy — both real ones are W2's (`JP-R7`, `JP-R8`) and which
 * is right is W4's question. **W3 ships no policy**, and this one lives in the
 * test tree so it cannot be mistaken for one.
 */
interface StubState { need: number; seen: number }
const stubPolicy: JoinPolicy<StubState> = {
  id: 'stub-arrival',
  open: (r: Region) => ({ need: r.branches.length, seen: 0 }),
  step: (st, e) => (e.type === 'branch.arrived' ? { ...st, seen: st.seen + 1 } : st),
  status: (st) => (st.seen >= st.need ? 'satisfied' : 'waiting'),
  describe: (st) => ({ need: st.need, seen: st.seen }),
};

function harness(
  def: FlowDefinition,
  predicates: Record<string, Predicate> = {},
  over: { joinPolicy?: JoinPolicy<never> } = {},
) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  const unsatisfiable: unknown[] = [];
  let clock = 1000;
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: new Map(Object.entries(predicates)),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    now: () => ++clock,
    onRegionEvent: (e) => events.push(e),
    joinPolicy: (over.joinPolicy ?? stubPolicy) as unknown as JoinPolicy,
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i),
  });
  return { scheduler, driver, events, unsatisfiable, ids: () => scheduler.added.map((t) => t.id) };
}

const alwaysFalse: Predicate = () => false;
const alwaysTrue: Predicate = () => true;

suite('L2 — sequence routes from a fixture log, with no scheduler', (test) => {
  test('linear: each settlement dispatches the next node', async () => {
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({ seed: 1 });
    equal(h.ids(), ['r1:ingest:-:0'], 'start dispatches the entry node and nothing else');
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { a: 1 } });
    equal(h.ids(), ['r1:ingest:-:0', 'r1:publish:-:0'], 'the settlement routes to the next node');
    // Inside the envelope every task node carries since v0.19 (ADR 0054): the ordinary edge's value is `input`.
    equal(h.scheduler.added[1]!.payload, { settings: {}, input: { a: 1 } }, "the next node receives the previous node's output, as the envelope's input");
    h.scheduler.settle('r1:publish:-:0', 'done', { result: null });
    equal(h.ids().length, 2, 'an `end` node dispatches nothing');
  });
});

suite('L2 — a decision picks the first eligible edge whose predicate passes', (test) => {
  test('the guarded edge is taken when its predicate is true', async () => {
    const h = harness(await load('valid/decision.flow.json'), { isLowConfidence: alwaysTrue });
    h.driver.start({});
    h.scheduler.settle('r1:score:-:0', 'done', { result: { confidence: 0.1 } });
    equal(h.ids(), ['r1:score:-:0', 'r1:review:-:0'], 'the first matching edge in declaration order wins');
  });

  test('the default edge is taken when no guard passes', async () => {
    const h = harness(await load('valid/decision.flow.json'), { isLowConfidence: alwaysFalse });
    h.driver.start({});
    h.scheduler.settle('r1:score:-:0', 'done', { result: { confidence: 0.9 } });
    equal(h.ids(), ['r1:score:-:0', 'r1:publish:-:0'], 'the no-`when` edge is the default and is last');
  });

  test('the predicate receives the effective outcome, not the raw event', async () => {
    let seen: unknown = undefined;
    const h = harness(await load('valid/decision.flow.json'), {
      isLowConfidence: (ctx) => { seen = ctx.outcome; return false; },
    });
    h.driver.start({});
    h.scheduler.settle('r1:score:-:0', 'done', { result: { confidence: 0.9 } });
    const o = seen as { kind: string; terminalState: string; result: unknown };
    equal(o.kind, 'outcome', 'OR-R9 — one shape, always');
    equal(o.terminalState, 'done', 'terminalState is never undefined in a DecisionContext');
    equal(o.result, { confidence: 0.9 }, 'the predicate sees the copied result');
  });
});

suite('FD-R1 — eligible edges exist and none matches: the run fails loudly', (test) => {
  test('the error names the run and the node', () => {
    // FD-R1 is UNREACHABLE through the public API on a valid definition — FD-V7
    // guarantees a default edge with no `when`, and a default always passes. That
    // is the rule working, so the assertion is made against the pure routing
    // function directly rather than by contorting a driver into an invalid state.
    const node = {
      id: 'score', kind: 'task' as const, type: 'ScoreWorker',
      edges: [{ when: 'isLowConfidence', to: 'review' }, { when: 'isHighConfidence', to: 'publish' }],
    };
    // **A context PER EDGE since W42** — `FD-C3`. `selectEdge` takes a builder, not
    // a `DecisionContext`, because each edge declares its own `needs`. Here every
    // edge gets the same one, which is what a flow that declares nothing gets.
    const ctx = () => ({ outcome: { kind: 'outcome', terminalState: 'done' } as never, needs: {} });
    throws(
      () => selectEdge(node, 'r1', 'done', ctx, new Map([
        ['isLowConfidence', alwaysFalse], ['isHighConfidence', alwaysFalse],
      ])),
      'FD-R1',
      'reaching a node with eligible edges and no match must terminate the run, not stop quietly',
    );
    throws(
      () => selectEdge(node, 'r1', 'done', ctx, new Map([
        ['isLowConfidence', alwaysFalse], ['isHighConfidence', alwaysFalse],
      ])),
      'r1',
      'the error names the run so a stuck run is attributable',
    );
  });

  test('no eligible edge at all is a path end, NOT FD-R1', () => {
    // The two are different things and only the second is an error
    // (spec/flow-definition.md section 3).
    const node = {
      id: 'score', kind: 'task' as const, type: 'ScoreWorker',
      edges: [{ to: 'publish' }], // opts into "done" only, by default
    };
    const r = selectEdge(node, 'r1', 'failed', () => ({ outcome: {} as never, needs: {} }), new Map());
    equal(r, { taken: null, reason: 'no-eligible-edge' }, 'a failure with no on:["failed"] edge ends the path');
  });

  test('a definition with no default edge is rejected at instantiation instead', async () => {
    const bad = JSON.parse(await readText(`${EX}/invalid/FD-V7--no-default-edge.flow.json`)) as FlowDefinition;
    throws(
      () => harness(bad, { isLowConfidence: alwaysFalse, isHighConfidence: alwaysFalse }),
      'FD-V7',
      'ADR 0002 rule 3 — validated in full before any task is queued',
    );
  });
});

suite('ID-R1 — a duplicate dispatch is refused before addTask sees it', (test) => {
  test('the refusal names the id and the scheduler receives nothing', async () => {
    // **This provocation replaces the one W3 used, and the substitution is
    // deliberate rather than incidental.** W3 provoked ID-R1 by calling
    // `start('r1', …)` twice: the second `enter` redispatched the entry node and
    // ID-R1 THREW. `spec/task-id.md` v0.4 section 3 kept ID-R3 narrow precisely to
    // preserve that, and said in writing that widening it would trade a tested
    // rule for an untested one. ADR 0022 widened it — a second `start` is now
    // MultipleRuns — having measured this replacement first.
    //
    // The same settlement delivered twice routes twice, and ID-R1 refuses the
    // SUCCESSOR's redispatch. It is REPORTED through onRunFailure rather than
    // thrown, because it is reached from a scheduler listener — which is the form
    // OR-R10 describes and the thrown one never was. It exercises the rule on a
    // path a real scheduler could reach rather than on one only a caller could.
    const failures: { kind: string; message: string }[] = [];
    const scheduler = new FakeScheduler();
    const driver = new Driver(await load('valid/linear.flow.json'), {
      runId: 'r1',
      scheduler,
      createTask: (c) => c,
      predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      now: () => 1,
      onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
    });
    driver.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: null });
    const before = scheduler.added.length;
    scheduler.settle('r1:ingest:-:0', 'done', { result: null });

    equal(failures.map((f) => f.kind), ['DuplicateTaskId'],
      'a second dispatch of the same (run, node, branch, attempt) must be refused');
    ok(failures[0]!.message.includes('r1:publish:-:0'),
      'and it names the id it refused — the SUCCESSOR, not the settled task');
    equal(scheduler.added.length, before, 'addTask is NOT called — at 0.3.0 both tasks would run');
    ok(driver.hasFailed(), 'and the run is stopped, so nothing routes for it again');
    ok(new DuplicateTaskId('x') instanceof Error, 'DuplicateTaskId is an Error');
  });
});

suite('JP-R5 — the region event stream', (test) => {
  test('every branch.opened precedes any other event for the region', async () => {
    // The assertion this replaces compared a multiset of event TYPES, which is
    // identical whether the driver emits both `opened` before dispatching either
    // branch or interleaves emit and dispatch — dispatch emits nothing
    // synchronously. W3's conformity pass replaced the two-pass loop with an
    // interleaved one and all 68 assertions still passed. `JP-R5` is the rule
    // whose failure would settle Q4 from inside W3, and its test could not fail.
    //
    // This asserts the ORDER, over a run that produces both kinds of event: the
    // last `branch.opened` must precede the first event that is not one.
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });

    const types = h.events.map((e) => e.type);
    const lastOpened = types.lastIndexOf('branch.opened');
    const firstOther = types.findIndex((t) => t !== 'branch.opened');
    ok(
      lastOpened >= 0 && firstOther >= 0,
      `the run must produce both an opened and a non-opened event; got ${types.join(', ')}`,
    );
    ok(
      lastOpened < firstOther,
      'every branch.opened for a region must precede any other event for it — a live-token ' +
        'policy sees the count reach zero while a branch is still running otherwise.\n' +
        `    order was: ${types.join(', ')}`,
    );
    equal(
      types.filter((t) => t === 'branch.opened').length,
      2,
      'one branch.opened per declared branch, no more and no fewer',
    );
    // **This assertion cannot currently distinguish the two-pass emission in
    // `Driver.enter` from an interleaved one, and that is a property of the spec
    // rather than a weak test.** `FD-V9` requires every branch entry to be a
    // `task`, and entering a task dispatches without emitting, so no event can
    // appear between two `branch.opened`s. The mutation is equivalent today.
    //
    // The two-pass loop is kept as insurance: it is what keeps `JP-R5` true if
    // `FD-V9` or `FD-V19` is ever relaxed (Q27), and the assertion above starts
    // discriminating the moment a branch entry can emit on entry. Recorded in
    // `spec/join-policy.md` so the next reader does not mistake it for coverage.
    equal(h.ids().slice(1, 3), ['r1:scoreA:0:0', 'r1:scoreB:1:0'], 'branch index is the third id segment');

    equal(h.events.at(-1), { type: 'branch.arrived', regionId: 'split', regionPath: '-', branchPath: '0' },
      'branch 0 arrives');
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(h.events.at(-1), { type: 'branch.arrived', regionId: 'split', regionPath: '-', branchPath: '1' },
      'branch 1 arrives');
    equal(h.events.filter((e) => e.type === 'branch.arrived').length, 2, 'exactly two arrivals');
  });

  test('at most one terminal event per branch, and none for a branch still in flight', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    const terminals = h.events.filter((e) => e.type !== 'branch.opened');
    equal(terminals.length, 1, 'JP-R5 says AT MOST one — branch 1 has not settled and emits nothing');
  });
});

suite('JP-R5 — branch.lost and branch.resumed, which nothing drove before', (test) => {
  // Both are reachable with the existing corpus and neither was asserted: the
  // RS-R3 test checked only `events.at(-1)`, so deleting `branch.resumed`
  // entirely survived the suite.
  test('a resolved-to-failed branch with no eligible edge emits the full sequence', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'user_action', { error: 'needs a human' });
    h.driver.resolve('r1:scoreA:0:0', 'failed', { error: 'gave up', actor: 'ops:sam' });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });

    equal(
      h.events.map((e) => `${e.type}:${e.branchPath}`),
      [
        'branch.opened:0', 'branch.opened:1',
        'branch.suspended:0', 'branch.resumed:0', 'branch.lost:0',
        'branch.arrived:1',
      ],
      'the whole Q5 row: suspend, resume, and lose the branch because `scoreA` has no ' +
        'on:["failed"] edge — while branch 1 arrives normally',
    );
    const lost = h.events.find((e) => e.type === 'branch.lost') as { reason: string };
    equal(lost.reason, 'failed', "the vocabulary's single permitted reason today");
    const resumed = h.events.find((e) => e.type === 'branch.resumed') as { at: string; resolvedAs: string };
    equal(resumed.at, 'scoreA', 'branch.resumed names the node that was suspended');
    equal(resumed.resolvedAs, 'failed', 'and the state the human chose');
  });

  test('branch.suspended and branch.resumed are NOT terminal', async () => {
    // JP-R5: at most one terminal event per branch, with nothing after it. A
    // suspend/resume pair sits before the terminal one rather than being it.
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'user_action', { error: 'x' });
    const terminalsBefore = h.events.filter((e) =>
      ['branch.arrived', 'branch.exited', 'branch.lost'].includes(e.type)).length;
    equal(terminalsBefore, 0, 'a suspended branch has emitted no terminal event — it is still live');
    h.driver.resolve('r1:scoreA:0:0', 'done', { result: {}, actor: 'a' });
    const terminals = h.events.filter((e) =>
      ['branch.arrived', 'branch.exited', 'branch.lost'].includes(e.type));
    equal(terminals.length, 1, 'exactly one terminal event, after the resume');
    equal(h.events.at(-1)!.type, 'branch.arrived', 'and it comes last for that branch');
  });
});

suite('the join seam — the driver asks a policy and acts on the answer', (test) => {
  test('a satisfied join routes out through its single edge', async () => {
    // Before this seam existed the driver emitted `branch.arrived` for every
    // branch and then stopped: the join could never fire, and the run looked
    // exactly like the hang P1 exists to attribute to a policy.
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    equal(h.ids().includes('r1:publish:-:0'), false, 'one arrival is not two — the join waits');
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(h.ids().at(-1), 'r1:publish:-:0', 'the second arrival satisfies it and the join routes');
  });

  test('a join fires at most once', async () => {
    const always = {
      id: 'always', open: () => null, step: (st: null) => st,
      status: () => 'satisfied' as const, describe: () => null,
    };
    const h = harness(await load('valid/fanout-join.flow.json'), {}, { joinPolicy: always as never });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(h.ids().filter((i) => i === 'r1:publish:-:0').length, 1,
      'a policy satisfied from its first event must still dispatch the join exactly once');
    // **This line is what makes the one above able to fail**, and it was added by
    // W4's test-adequacy pass rather than by W3. Removing the `firedJoins` latch
    // leaves the count at 1 anyway: the second `settleJoin` re-enters the join's
    // edge, `ID-R1` refuses the duplicate BEFORE `addTask` sees it, and the throw
    // is caught at the listener boundary and turned into a silent `failRun`. So
    // the test named for `spec/join-policy.md` section 4's *"at most once"* was
    // passing on `ID-R1`'s refusal, and the run it described was dead.
    equal(h.driver.hasFailed(), false,
      'and it fires once because the JOIN is latched, not because ID-R1 refused a second ' +
      'dispatch. A run that reached this line with hasFailed() true has already stopped routing');
  });

  test('the policy is opened before the first branch.opened, and sees every event', async () => {
    const seen: string[] = [];
    const recorder = {
      id: 'recorder', open: () => { seen.push('open'); return null; },
      step: (st: null, e: { type: string }) => { seen.push(e.type); return st; },
      status: () => 'waiting' as const, describe: () => null,
    };
    const h = harness(await load('valid/p1-routed-away.flow.json'), { isLowConfidence: alwaysTrue },
      { joinPolicy: recorder as never });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { c: 0.1 } });
    equal(seen, ['open', 'branch.opened', 'branch.opened', 'branch.arrived', 'branch.exited'],
      'JP-R4: the vocabulary is sized for the richer policy, so the driver forwards all six and ' +
      "lets a policy ignore what it does not need — one that never saw branch.exited could not " +
      "survive P1's case");
  });

  test('an unsatisfiable join is reported, and the driver invents no run outcome', async () => {
    const dead = {
      id: 'dead', open: () => null, step: (st: null) => st,
      status: () => 'unsatisfiable' as const, describe: () => ({ why: 'test' }),
    };
    const h = harness(await load('valid/fanout-join.flow.json'), {}, { joinPolicy: dead as never });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    equal(h.unsatisfiable.length, 1, 'the driver reports it');
    equal(h.unsatisfiable[0],
      { fanoutId: 'split', regionPath: '-', joinId: 'collect', describe: { why: 'test' }, policyId: 'dead' },
      "and carries the policy's own account — the run-level outcome is W2's (Q25), not this file's");
    equal(h.ids().includes('r1:publish:-:0'), false, 'and does not route out of the join');
  });

  /**
   * **[Q95](../../doc/open-questions.md) — the `unsatisfiable` exit's `at most
   * once` latch, made load-bearing.**
   *
   * `spec/join-policy.md` section 4 fixes both exits: a **satisfied** join is
   * routed out of *"at most once per region however many events follow"*, and an
   * **unsatisfiable** one is *"reported with the policy's own `describe`, and
   * routes nowhere"*. Those two clauses are the expected values below. **They are
   * not the `DuplicateTaskId` the register measured** — that is what the latch's
   * *absence* produces, and reading it as the expectation is `doc/workflow.md`
   * section 5 rule 1's snapshot.
   *
   * The seam has two exits and, of what this repository ships, **neither can
   * reach this clause**: all four policies satisfy only when every branch is
   * terminal, so the settling event is always the last one and nothing follows
   * it. Measured across all forty matrix cells: zero region events after a
   * settlement. A stub is the instrument, exactly as `driver.test.ts`'s `dead`
   * above and `fold-inputs.test.ts`'s `never` already are.
   *
   * **The satisfied half is already covered** by *"a join fires at most once"*
   * above — deleting its latch costs that case one assertion. **The
   * unsatisfiable half was covered by nothing**: deleting *its* latch left all
   * 386 assertions green, which is W15's provocation G1 and the whole of Q95.
   *
   * **Shipping an early-settling policy is a feature question and this is not
   * one.** Whether a join may fire on anything short of every branch is
   * [Q5](../../doc/open-questions.md)/[Q7](../../doc/open-questions.md), which
   * [P6](../../doc/plans/p6-what-may-share-a-scheduler-with-a-driver.md) does not
   * take. These policies are test instruments and live here rather than in
   * `src/fold/policies.ts` for that reason.
   */
  const arrivals = (over: Partial<JoinPolicy<{ a: number }>>): JoinPolicy<{ a: number }> => ({
    id: 'stub', open: () => ({ a: 0 }),
    step: (st, e) => (e.type === 'branch.arrived' ? { a: st.a + 1 } : st),
    status: () => 'waiting', describe: (st) => ({ ...st }), ...over,
  });

  /**
   * Both branches settle `done`, so `branch.arrived(split:1)` FOLLOWS the join's
   * settlement at `arrived(split:0)`.
   *
   * **The `ok(...)` is the fix for the only survivor W18's own provocation set
   * found in these two cases, and it is the reader-survivor shape this repository
   * keeps meeting: a probe changed the input without changing an observable.**
   * Two independent mutations — weakening the stub to settle on the *second*
   * arrival, and deleting the third settlement — made *"an event follows the
   * settlement"* false, and **both left every assertion below green**, because the
   * cases assert what the driver did and not that the situation they exist for
   * occurred. Under either, `at most once` is satisfied by there being only one
   * chance. **The precondition is now asserted here**, once, for both cases.
   */
  async function bothArrive(policy: JoinPolicy<{ a: number }>) {
    const h = harness(await load('valid/fanout-join.flow.json'), {}, { joinPolicy: policy as never });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    const seq = h.driver.foldInputs();
    const settled = seq.findIndex((i) => i.kind === 'joinSettled');
    // **`settleJoin` is re-entered — not merely "a region event follows".**
    // W18's adequacy reader broke the weaker form with one token: settling the
    // second branch `user_action` emits `branch.suspended`, which satisfies *"a
    // region event follows"* and then **`return`s before `advance()`**, so the
    // latch is never asked. With that, deleting the `unsatisfiable` latch was
    // green again at 402 — Q95 restored by the guard written to prevent it.
    // `branch.opened` has the same property. Only the three TERMINAL region
    // events reach `settleJoin` (`spec/join-policy.md` section 4: *status is
    // asked after every terminal event*), so those are what this asserts.
    const REENTERS = ['branch.arrived', 'branch.lost', 'branch.exited'];
    ok(settled >= 0 && seq.slice(settled + 1)
      .some((i) => i.kind === 'region' && REENTERS.includes((i as { event: { type: string } }).event.type)),
      'the scenario`s own precondition: the join settles and a TERMINAL region event follows it, so ' +
      '`settleJoin` is entered again. Across all forty matrix cells that never happens, which is why ' +
      'Q95 needed a stub — a stub that settles last is not a stub, and so is one whose trailing ' +
      'event returns before the join is asked');
    return h;
  }

  test('Q95: an unsatisfiable join is settled ONCE however many events follow it', async () => {
    // `spec/join-policy.md` section 4, `unsatisfiable`: the driver **reports** it.
    // One region, one settlement, so one report — and `branch.arrived(1)` arrives
    // after the join is already decided, which is the situation that clause is
    // written about and which nothing in this repository had ever produced.
    const h = await bothArrive(arrivals({
      id: 'dead-on-first-arrival', status: (st) => (st.a >= 1 ? 'unsatisfiable' : 'waiting'),
    }));
    equal(h.unsatisfiable.length, 1,
      'reported once per region, not once per terminal event — the second arrival re-enters ' +
      'settleJoin and the latch is the only thing that stops it');
    equal(h.driver.foldInputs().filter((i) => i.kind === 'joinSettled').length, 1,
      'and the sequence records one settlement: a second `joinSettled(fired: false)` would make ' +
      'ADR 0015`s `joined` a value the fold derives from a repeated input');
  });

  test('Q95: and it NEVER routes, even when the policy later says satisfied', async () => {
    // The sharper half, and the one that is not merely a duplicate report.
    // Section 4's `unsatisfiable` row says the driver *"routes nowhere"*; without
    // the latch the later `satisfied` is acted on, `r1:publish:-:0` is dispatched
    // out of a join the driver has already declared dead, and `RunState.outcome`
    // reads `completed` for a run that was `stuck`. **That is character-for-character
    // the false statement ADR 0015 exists to remove**, reached through the
    // driver's own surface and with `hasFailed()` false the whole way.
    const h = await bothArrive(arrivals({
      id: 'dead-then-alive',
      status: (st) => (st.a >= 2 ? 'satisfied' : st.a >= 1 ? 'unsatisfiable' : 'waiting'),
    }));
    equal(h.ids().includes('r1:publish:-:0'), false,
      'a join declared unfireable stays unfireable, whatever the policy says next');
    equal(h.unsatisfiable.length, 1, 'and it is still reported exactly once');
    equal(h.driver.foldInputs().filter((i) => i.kind === 'joinSettled').map((i) => (i as { fired: boolean }).fired),
      [false], 'one settlement, and it did not fire — never [false, true]');
    ok(!h.driver.hasFailed(),
      'and nothing refuses it on the way, which is why the latch is the only thing between these ' +
      'two runs — a DuplicateTaskId here would be the ABSENCE of the guard, not the expectation');
  });

  test('a fan-out definition with no policy is refused at construction', async () => {
    const def = await load('valid/fanout-join.flow.json');
    throws(
      () => new Driver(def, {
        runId: 'r1',
        scheduler: new FakeScheduler(), createTask: (c) => c,
        predicates: new Map(), workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      }),
      'MissingJoinPolicy',
      'a driver with a fan-out and no policy produces a run that stops with no error — a SECOND ' +
        'cause behind the observation P1 turns on, so it is refused up front',
    );
    ok(new MissingJoinPolicy('x') instanceof Error, 'MissingJoinPolicy is an Error');
  });

  test('a flow with no fan-out needs no policy', async () => {
    const def = await load('valid/linear.flow.json');
    const d = new Driver(def, {
      runId: 'r1',
      scheduler: new FakeScheduler(), createTask: (c) => c,
      predicates: new Map(), workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    });
    ok(d instanceof Driver, 'the refusal is scoped to definitions that actually have a region');
  });

  test('regionsForPolicies returns the shape spec/join-policy.md section 1 fixes', async () => {
    const h = harness(await load('valid/p1-routed-away.flow.json'), { isLowConfidence: alwaysTrue });
    equal(h.driver.regionsForPolicies(), [{
      fanoutId: 'split', joinId: 'collect',
      branches: ['scoreA', 'scoreB'],
      members: ['abandoned', 'scoreA', 'scoreB'],
    }], 'four fields only, branches in declaration order, members SORTED so the value is stable ' +
        'across folds. branchOf and after are the validator\u2019s working set and are not handed over');
  });
});

suite("P1's case is now mechanically observable, which is what the plan needs", (test) => {
  test('naive arrival-counting leaves the join waiting, and can say why', async () => {
    // P1's exit artifact, reachable at ladder L2 with no scheduler. The stub is
    // the naive arrival counter Q4 describes; the point is that the hang is a
    // REPORTABLE state rather than silence.
    const h = harness(await load('valid/p1-routed-away.flow.json'), { isLowConfidence: alwaysTrue });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { c: 0.1 } });

    equal(h.ids().includes('r1:publish:-:0'), false,
      'the join never fires — one branch legitimately left the region');
    equal(h.driver.joinStatusOf('split'), { status: 'waiting', describe: { need: 2, seen: 1 } },
      'and the driver can say what it is waiting for, which is the whole of Q7 detection today ' +
      '(spec/join-policy.md section 4) — neither pinned policy ever returns unsatisfiable');
  });
});

suite("P1's case — a decision inside a branch routes away from the join", (test) => {
  test('the routed-away branch emits branch.exited and the join sees one arrival', async () => {
    // The flow the whole plan exists to run. The driver reports what happened;
    // whether the join is satisfied is a policy's answer (W2) and W4's question.
    const h = harness(await load('valid/p1-routed-away.flow.json'), { isLowConfidence: alwaysTrue });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { confidence: 0.1 } });

    equal(
      h.events.map((e) => `${e.type}:${e.branchPath}`),
      ['branch.opened:0', 'branch.opened:1', 'branch.arrived:0', 'branch.exited:1'],
      'branch 1 reached an `end` node instead of the join — this is the event the experiment turns on',
    );
    const exited = h.events.find((e) => e.type === 'branch.exited') as { at: string };
    equal(exited.at, 'abandoned', '`at` names the `end` node reached, which is INSIDE region(split)');
    equal(h.ids().includes('r1:publish:-:0'), false, 'the join has not fired: no policy said it was satisfied');
  });
});

suite('the dispatched task carries what the definition declared', (test) => {
  // Replacing workerType with a wrong one, and forcing `optional` to false, both
  // survived W3's mutation pass. `optional` is not cosmetic: at 0.3.0 it is the
  // library's own branch (FyflowScheduler.ts:894-897), so forcing it false turns
  // every optional node's failure into a user_action suspend.
  test('workerType and optional are passed through from the node', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start({});
    equal(h.scheduler.added[0]!.workerType, 'IngestWorker', 'workerType comes from the node');
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    const byId = Object.fromEntries(h.scheduler.added.map((t) => [t.id, t]));
    equal(byId['r1:scoreA:0:0']!.workerType, 'ScoreWorker', 'each node dispatches under its own workerType');
    equal(byId['r1:scoreA:0:0']!.optional, true, 'optional: true reaches the scheduler task');
    equal(byId['r1:reviewB:1:0']!.optional, false, 'and the default reaches it as false');
  });
});

suite('ID-R2 — the charset is enforced at run creation, not just in the helper', (test) => {
  test('the Driver CONSTRUCTOR refuses a malformed runId before ANY side effect', () => {
    // The earlier test called assertRunId directly, which proves the regex works
    // rather than that the driver applies it. Removing the call from start() then
    // survived, because buildTaskId re-checks — so the charset is still enforced,
    // just one frame later.
    //
    // That is only equivalent when the entry node is a task. With a FANOUT entry,
    // `enter` emits every `branch.opened` before dispatching anything, so a check
    // deferred to buildTaskId lets region events escape for a run that was never
    // valid. This flow is built here rather than added to spec/examples/, which is
    // W1's normative corpus.
    const fanoutEntry = {
      flowId: 'fanout-entry', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    // **ADR 0022 rule 3 moved this refusal from `start` to the constructor**, and
    // that makes the assertion stronger rather than merely different: the driver
    // is never built, so it cannot have subscribed to the scheduler for a run it
    // cannot name. `assertRunId` runs BEFORE `validateDefinition` and before
    // `addEventListener`, and this counts both.
    const events: RegionEvent[] = [];
    let added = 0;
    let subscribed = 0;
    const counting = {
      addTask() { added++; },
      addEventListener() { subscribed++; },
    };
    throws(
      () =>
        new Driver(fanoutEntry, {
          runId: 'run:1',
          scheduler: counting,
          createTask: (c) => c,
          predicates: new Map(),
          workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
          joinPolicy: stubPolicy as unknown as JoinPolicy,
          onRegionEvent: (e) => events.push(e),
        }),
      'not [A-Za-z0-9_-]',
      'a colon would make the parse ambiguous',
    );
    equal(added, 0, 'nothing was dispatched');
    equal(subscribed, 0,
      'and nothing was SUBSCRIBED — ID-R2 fires before the constructor registers a listener, so a ' +
      'driver for an unnameable run never sees a scheduler event');
    equal(events, [], 'and no region event escaped: with a FANOUT entry, `enter` emits every ' +
      'branch.opened before dispatching, so a check deferred to buildTaskId would let them out');
  });
});

suite('ADR 0004 — user_action suspends, and a resolution resumes the path', (test) => {
  const susp = 'r1:reviewB:1:0';

  test('a user_action settlement suspends rather than routing', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    const before = h.ids().length;
    h.scheduler.settle(susp, 'user_action', { error: 'needs a human' });
    equal(h.ids().length, before, 'a suspended node dispatches nothing');
    equal(
      h.events.at(-1),
      { type: 'branch.suspended', regionId: 'split', regionPath: '-', branchPath: '1', at: 'reviewB' },
      'branch.suspended is NOT terminal — a join waiting on a person is not stuck (Q7)',
    );
    equal(h.driver.snapshot().filter((r) => r.taskId === susp).length, 1,
      'OR-R3: the task.failed that precedes task.user_action wrote nothing');
  });

  test('RS-R3 — resolving failed routes through the on:["failed"] edge of a NON-optional node', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'needs a human' });
    equal(h.driver.resolve(susp, 'failed', { error: 'gave up', actor: 'ops:sam' }), true, 'a suspended task resolves');
    equal(h.events.at(-1),
      { type: 'branch.exited', regionId: 'split', regionPath: '-', branchPath: '1', at: 'droppedB' },
      'the human giving up routes down the failure edge to an `end` — the only road a non-optional ' +
      'node has to an on:["failed"] edge');
  });

  test('RS-R1 — a second resolution is refused and appends nothing', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'x' });
    h.driver.resolve(susp, 'done', { result: { ok: true }, actor: 'a' });
    const len = h.driver.snapshot().length;
    equal(h.driver.resolve(susp, 'failed', { error: 'again', actor: 'b' }), false, 'refused, not thrown');
    equal(h.driver.snapshot().length, len, 'nothing appended — a rejected command, not a run failure');
  });

  test("a resolution's result is deep-copied on the way in, like OR-R2", async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'x' });
    const answer = { deep: { approved: true } };
    h.driver.resolve(susp, 'done', { result: answer, actor: 'ops:jane' });
    answer.deep.approved = false;
    const rec = h.driver.snapshot().find((r) => r.kind === 'resolution')!;
    equal((rec as { result: unknown }).result, { deep: { approved: true } },
      'section 5: "Deep-copied on the way in, for the same reason as OR-R2"');
    equal((rec as { actor: string }).actor, 'ops:jane', 'the actor is carried, not invented');
  });

  test('RS-R2 — a resolution supplies an outcome and never re-dispatches', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'x' });
    const before = h.ids().filter((id) => id === susp).length;
    h.driver.resolve(susp, 'done', { result: {}, actor: 'a' });
    equal(h.ids().filter((id) => id === susp).length, before, 'the node is not re-run — that is Q16/Q28');
  });
});

suite('ADR 0002 rule 3 — the definition is validated in full at instantiation', (test) => {
  test('an unknown predicate name fails before any task is queued', async () => {
    const def = await load('valid/decision.flow.json');
    throws(
      () => harness(def, {}), // registry has no predicates at all
      'FD-V4',
      'a typo must not become a routing failure on the one workload that takes that branch',
    );
  });

  test('the error carries the rule ids, so a caller can act on them', async () => {
    const bad = JSON.parse(await readText(`${EX}/invalid/FD-V24--unknown-node-kind.flow.json`)) as FlowDefinition;
    try {
      harness(bad, { isLowConfidence: alwaysTrue });
      ok(false, 'expected InvalidDefinition');
    } catch (e) {
      ok(e instanceof InvalidDefinition, 'InvalidDefinition is thrown');
      ok((e as InvalidDefinition).rules.includes('FD-V24'), 'the rule id is on the error, not just in the text');
    }
  });
});

/**
 * **A node kind the driver cannot execute REFUSES rather than returning** — added
 * by [W32](../../doc/work-items/w32-what-a-map-fanout-is.md) as a declared late
 * exception, and this suite is the fifth one because a fix needs a test
 * (`doc/workflow.md` section 1 rule 2 and section 5 rule 8).
 *
 * **The hole, measured before the arm was written.** `spec/flow-definition.md`
 * v0.8 adds a fifth node kind, `map`, and W32 made such a definition VALID while
 * the driver that executes it is [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s.
 * `enter`'s switch had four arms, no `map` arm and **no `default`** — and
 * `node.kind` is a union TypeScript does not require a switch to exhaust, so
 * `npm run typecheck` was green. A run routed into a map node did **nothing**: no
 * dispatch, no `branch.opened`, no `pathEnded`, no `RunFailure`, and the fold
 * reported **`completed`** — character for character the false statement
 * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
 * exists to remove, and the silent stop `spec/flow-definition.md` section 3
 * refuses BY NAME on P1's own validity grounds.
 *
 * **W33 has landed and these are its cases now**, exactly as the sentence this
 * replaces asked. The first two below asserted that a `map` STOPS the run; a map
 * now runs, so they are gone and `test/driver/map.test.ts` carries what replaces
 * them. What survives here is the third, widened from four kinds to five.
 *
 * **The `default` arm is now UNREACHABLE through the driver's declared surface,
 * and that is recorded rather than asserted** (`doc/workflow.md` section 5 rule 8:
 * *where the corpus cannot express a case, record that rather than arguing it*).
 * Measured: a node carrying a kind outside the union is refused by **`FD-V24` at
 * construction** — `InvalidDefinition: FD-V24 at b: node kind "teleport" is not
 * task|fanout|map|join|end|gate` (the list gained `gate` at v0.23, W92) — so no definition a
 * `Driver` will accept can reach the arm. It is kept as defence in depth, and **W33 gave it the exhaustiveness check
 * W32's comment described and could not write**: with every kind handled, `node`
 * narrows to `never` in that arm, so a kind added to `FlowNode` without an arm is a
 * COMPILE error in five typecheck projects — measured when W92 added the sixth, `gate`:
 * exactly that one error, in all five lanes, and it is why `gate` has an explicit arm. That is a stronger guarantee
 * than the run-time test that used to stand here, and it is the reason the run-time
 * one is not replaced by a contrivance.
 */
suite('every executable node kind has an arm — the default is not a narrowing', (test) => {
  /** Local, because the shared `harness` registers no `onRunFailure`. */
  const withFailures = (def: FlowDefinition) => {
    const scheduler = new FakeScheduler();
    const failures: { kind: string; message: string }[] = [];
    const driver = new Driver(def, {
      runId: 'r1',
      scheduler,
      createTask: (c) => c,
      predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      joinPolicy: stubPolicy as unknown as JoinPolicy,
      onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
    });
    return { scheduler, driver, failures, ids: () => scheduler.added.map((t) => t.id) };
  };

  /** Settle everything dispatched, so the run actually reaches the map node. */
  const drain = (h: ReturnType<typeof withFailures>) => {
    const done = new Set<string>();
    for (let guard = 0; guard < 30; guard++) {
      const next = h.ids().find((id) => !done.has(id));
      if (next === undefined) return;
      done.add(next);
      // **Every settlement carries the arrays the map corpus flows map OVER.**
      // It was `{ result: {} }`, and once `map` became executable that made
      // `map-fanout` refuse with `UnresolvedMapArity` — the check working, on a
      // fixture that had never had to supply an arity. The keys are the two the
      // corpus declares (`over: "items"` and `over: "rows"`).
      h.scheduler.settle(next, 'done', { result: { items: ['a', 'b', 'c'], rows: ['x', 'y'] } });
    }
    ok(false, 'the drain loop did not terminate — the fixture changed shape');
  };

  test('all FIVE executable kinds are untouched — the arm is a default, not a narrowing', async () => {
    // The regression this arm could have caused: a `default` placed wrong catches
    // a kind that HAS an arm. One flow per executable kind, asserted to reach a
    // terminal state with NO refusal.
    //
    // **`map-fanout` is the row W33 adds**, and it is the one that discriminates:
    // while the `default` arm was the only thing handling a map, this row reported
    // `stopped` with one refusal. It is also what would catch a `default` placed
    // ABOVE the `map` arm, which is the mistake this test exists for.
    // **Bounded by what the loop DID** -- W33's adequacy reader measured
    // `].slice(0, 1) as [string, string][]` at **0 failures**, which leaves
    // `linear.flow.json` alone with the title still advertising five: both map rows
    // gone, and `nested-fanout` (P7's coverage) with them. W23's `UNMINTED` finding
    // in a second file.
    const flows = [
      ['valid/linear.flow.json', 'completed'],
      ['valid/fanout-join.flow.json', 'completed'],
      ['valid/map-fanout.flow.json', 'completed'],
      ['valid/map-in-fanout.flow.json', 'completed'],
      ['valid/nested-fanout.flow.json', 'completed'],
    ] as [string, string][];
    const ran: string[] = [];
    for (const [file, expected] of flows) {
      ran.push(file);
      const h = withFailures(await load(file));
      h.driver.start({});
      drain(h);
      equal(h.failures, [], `${file} must reach no refusal — task, fanout, join and end all have arms`);
      equal(fold(h.driver.foldInputs()).outcome, expected, `${file} still folds to ${expected}`);
    }
    equal(ran, flows.map(([f]) => f), 'every flow ran — counted from what the loop did');
    equal(ran.length, 5, 'FIVE, which is the number in this test`s own title');
  });
});
