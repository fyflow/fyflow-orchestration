/**
 * **W13 — a driver's lifetime, and what makes an inbound settlement this run's.**
 *
 * Ladder L2: a fixture log of outcomes in, an asserted dispatch sequence out, with
 * no scheduler. `doc/workflow.md` section 4 — *"if level 2 is hard to write, the
 * driver has reached for the scheduler somewhere it should not have"*, and the
 * fake below is fifteen lines.
 *
 * Two decisions are under test and they are separable in mechanism:
 *
 * - [**ADR 0022**](../../doc/decisions/0022-a-driver-takes-its-run-at-construction.md)
 *   — the run id is a constructor option, `start()` takes the payload alone, and
 *   `hasFailed()` takes no argument. [Q53](../../doc/open-questions.md).
 *   Its refusals are tested where their rules already lived: `ID-R2` in
 *   `driver.test.ts`, `ID-R3` in `fold-inputs.test.ts`.
 * - [**ADR 0023**](../../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
 *   — **`ID-R4`**, two tiers, because "another run's settlement" and "our run id
 *   on a task we never dispatched" are different failures and only one is ours.
 *   [Q72](../../doc/open-questions.md).
 *
 * **Expected values come from `spec/task-id.md` sections 2-3.** A task id
 * identifies one `(run, node, branch, attempt)`, and two outcomes under one key is
 * the corruption section 2 exists to describe — never from what the driver emits.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver, UndispatchedTask } from '../../src/driver/driver.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workerTypes: string[] };

interface StubState { need: number; seen: number }
const stubPolicy: JoinPolicy<StubState> = {
  id: 'stub-arrival',
  open: (r: Region) => ({ need: r.branches.length, seen: 0 }),
  step: (st, e) => (e.type === 'branch.arrived' ? { ...st, seen: st.seen + 1 } : st),
  status: (st) => (st.seen >= st.need ? 'satisfied' : 'waiting'),
  describe: (st) => ({ need: st.need, seen: st.seen }),
};

/** One scheduler, however many drivers subscribe to it — which is the point. */
class Fake {
  readonly added: { id: string }[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string }); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void): void {
    this.l.set(t, [...(this.l.get(t) ?? []), f]);
  }
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const d = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', d);
    else { this.fire('task.failed', d); if (state === 'user_action') this.fire('task.user_action', d); }
  }
  ids(): string[] { return this.added.map((t) => t.id); }
  private fire(t: string, detail: unknown): void { for (const f of this.l.get(t) ?? []) f({ detail }); }
}

interface Rig { driver: Driver; failures: string[] }

function attach(scheduler: Fake, def: FlowDefinition, runId: string): Rig {
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId,
    scheduler,
    createTask: (c) => c,
    predicates: new Map(),
    workerTypes: reg.workerTypes,
    now: () => 1,
    joinPolicy: stubPolicy as unknown as JoinPolicy,
    onRunFailure: (f) => failures.push(f.kind),
  });
  return { driver, failures };
}

suite('ID-R4 — a settlement carrying OUR run id for a task we never dispatched stops the run', (test) => {
  // The three shapes `spec/task-id.md` section 3 names. Every one of them was
  // silently accepted and routed before W13 — measured on the shipped driver, not
  // imagined — and none of them is reachable by a scheduler running tasks this
  // driver dispatched.
  const cases: [string, string, string][] = [
    ['a node of ours we never dispatched', 'r1:publish:-:0',
      'the successor exists in the definition, and its task does not exist yet'],
    ['a node not in the definition at all', 'r1:nosuch:-:0',
      'nothing validates an inbound node id, so this used to be appended and then routed on'],
    ['a branch path we never opened', 'r1:ingest:7:0',
      'branchPath is part of the key (spec/task-id.md section 2), so branch 7 is a different task'],
  ];
  for (const [name, taskId, why] of cases) {
    test(name, async () => {
      const s = new Fake();
      const r = attach(s, await load('valid/linear.flow.json'), 'r1');
      r.driver.start({});
      const dispatched = s.ids().length;

      s.settle(taskId, 'done', { result: null });

      equal(r.failures, ['UndispatchedTask'], `ID-R4 refuses it: ${why}`);
      equal(r.driver.snapshot().length, 0,
        'and NOTHING is appended — the record is refused before it enters the sequence, for the ' +
        'reason ID-R1 refuses before addTask sees the task');
      equal(s.ids().length, dispatched, 'nothing was dispatched from it');
      ok(r.driver.hasFailed(), 'RN-R8: the run is stopped, whatever its nodes say');
    });
  }

  test('the class is an Error and is exported under its own name', () => {
    ok(new UndispatchedTask('x') instanceof Error, 'so a caller can key on it, not on a message');
  });

  test('a MALFORMED id still stops the run, and not as ID-R4', async () => {
    // The guard sits AFTER parseTaskId, deliberately (ADR 0023 rule 2): "does not
    // parse" is not "not ours", it is a defect and it stays attributable.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('not-a-task-id', 'done', { result: null });
    equal(r.failures, ['InvalidTaskId'],
      'OR-R10, unchanged — an unparseable id is refused before the run-id comparison can be made');
  });

  test('a `user_action` task fires TWO events for ONE dispatched id, and both pass', async () => {
    // ADR 0007 rule 2. **This comment used to claim the test would catch a guard
    // keyed on a consumable "seen" set. It would not**, and W13's adequacy reader
    // measured it: three seen-set mutants killed ZERO cases here. Since W13
    // reordered the guard ahead of `normalizeEvent` BOTH events of the pair now
    // reach it, where before `OR-R3` dropped the first one — so the pair is a real
    // exercise of the guard's idempotence, which is what the second assertion
    // below pins. The seen-set property itself is killed by `ID-R1`'s replacement
    // in `driver.test.ts`, and that is where the credit belongs.
    const s = new Fake();
    const r = attach(s, await load('valid/fanout-join.flow.json'), 'r1');
    r.driver.start({});
    s.settle('r1:ingest:-:0', 'done', { result: {} });
    const dispatched = s.ids().length;
    s.settle('r1:scoreA:0:0', 'user_action', { error: 'needs a human' });
    equal(r.failures, [], 'neither event of the pair is refused');
    equal(r.driver.snapshot().filter((rec) => rec.taskId === 'r1:scoreA:0:0').length, 1,
      'and OR-R3 still writes exactly one record for the pair');
    equal(s.ids().length, dispatched, 'a suspended branch dispatches nothing — it is waiting on a person');
  });
});

suite('ID-R4 — both tiers are decided before the terminal state is read', (test) => {
  // **The three fixtures above all settle `done`.** W13's adequacy reader exempted
  // one terminal state at a time from the guard and found three surviving
  // mutations: `failed` and `user_action` had no `ID-R4` coverage on either tier,
  // while `done` was killed by five cases. A guard the fixtures only ever exercise
  // in one state is a guard that can be conditioned on the state.
  //
  // ADR 0023's own Consequences paragraph turns on `user_action` — the state with
  // the least coverage before this suite existed.
  for (const state of ['done', 'failed', 'user_action'] as const) {
    test(`tier 2 refuses an undispatched task settling \`${state}\``, async () => {
      const s = new Fake();
      const r = attach(s, await load('valid/linear.flow.json'), 'r1');
      r.driver.start({});
      s.settle('r1:publish:-:0', state, { result: null, error: 'x' });
      ok(r.failures.length > 0 && r.failures.every((k) => k === 'UndispatchedTask'),
        `ID-R4 says "a settlement", not "a settlement that succeeded" — ${state} is a settlement`);
      equal(r.driver.snapshot().length, 0, 'and no OUTCOME record is appended');
      // **A `user_action` task fires TWO events for one task** (ADR 0007 rule 2),
      // and since the guard moved ahead of `normalizeEvent` both of them reach it,
      // so both are refused. That is two reports for one settlement — honest, and
      // noisier than the other two states. What must NOT differ by state is the
      // run stopping once, which is what `RN-R8` and the fold care about.
      equal(r.driver.foldInputs().filter((i) => i.kind === 'stopped').length, 1,
        'the run stops exactly once, however many events the pair carries');
    });

    test(`tier 1 ignores ANOTHER run's task settling \`${state}\``, async () => {
      const s = new Fake();
      const r = attach(s, await load('valid/linear.flow.json'), 'r1');
      r.driver.start({});
      s.settle('run-9:ingest:-:0', state, { result: null, error: 'x' });
      equal(r.failures, [],
        `ADR 0023 rule 3 is about whose run it is, not about how it ended — ${state} included`);
      ok(!r.driver.hasFailed(), 'our run is untouched');
    });
  }

  test('a FOREIGN settlement with an uncloneable result does not stop our run', async () => {
    // **W13's conformity reader's blocking finding.** `normalizeEvent` throws
    // `UncloneableResult` (`OR-R6`) while copying `result`, and W13 first shipped
    // the guard AFTER it — so a foreign settlement stopped this run and reported a
    // `RunFailure` carrying the OTHER run's id, falsifying all three clauses of
    // ADR 0023 rule 3 at once. It is the `OR-R6` path L6's `uncloneable` row
    // exercises, on the topology ADR 0023 exists to bless.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('run-9:ingest:-:0', 'done', { result: () => 1 });
    equal(r.failures, [], 'rule 3: not a failure, not counted, does not reach onRunFailure');
    ok(!r.driver.hasFailed(), 'and our run is not stopped by another run`s worker bug');
  });

  test('OUR OWN uncloneable result still stops the run — OR-R6 is intact', async () => {
    // The converse, and the reason the reorder is not a weakening: moving the
    // ownership test earlier must not move `OR-R6` out of reach for a task that
    // IS ours.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('r1:ingest:-:0', 'done', { result: () => 1 });
    equal(r.failures, ['UncloneableResult'], 'OR-R6, at the listener boundary, reported not thrown');
    ok(r.driver.hasFailed(), 'and the run is stopped');
  });
});

suite('OR-R10 — a stopped run dispatches nothing further on the SCHEDULER edge', (test) => {
  test('after a refusal, a settlement for a dispatched task routes nothing', async () => {
    // **W13's adequacy reader's blocking finding.** `OR-R10` names the test it
    // owes: *"asserting the failure is reported AND that no further task is
    // dispatched for that run"*. The only test that asserted "nothing after the
    // stop" exercises `resolve()` — the INBOUND edge, added by W5 — and the
    // `onEvent` edge `OR-R10` was written for had none. Deleting
    // `if (this.failed) return` from `onEventOrThrow` left 314 assertions and 219
    // L6 assertions green while a stopped run kept dispatching.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('r1:nosuch:-:0', 'done', { result: null });      // ID-R4 stops the run
    ok(r.driver.hasFailed(), 'the run is stopped');
    const dispatched = s.ids().length;

    s.settle('r1:ingest:-:0', 'done', { result: null });      // a REAL, dispatched task
    equal(s.ids().length, dispatched,
      'OR-R10: nothing routes for a stopped run again, on the edge the rule is about');
  });
});

suite('ID-R4 — a settlement for ANOTHER run is ignored, silently', (test) => {
  test('nothing is appended, nothing is dispatched, and it is NOT a failure', async () => {
    // ADR 0023 rule 3, and the silence is the decision rather than an oversight:
    // with two drivers legitimately sharing one scheduler this is the normal case,
    // and a refusal that fires on the normal case is noise.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    const dispatched = s.ids().length;

    s.settle('run-9:ingest:-:0', 'done', { result: null });

    equal(r.failures, [], 'another run is not this driver`s business, and it does not judge it');
    equal(r.driver.snapshot().length, 0, 'nothing is appended');
    equal(s.ids().length, dispatched,
      'and nothing is dispatched — before W13 this dispatched `run-9:publish:-:0` from a run-1 driver');
    ok(!r.driver.hasFailed(), 'the run is untouched');
  });
});

suite('Q72 — two Drivers on ONE scheduler, which is what MultipleRuns tells you to build', (test) => {
  test('both runs complete, and neither log holds the other run`s records', async () => {
    // **Measured before W13 on the shipped driver**: driver A's settlement caused
    // `run-a:publish:-:0` to be dispatched TWICE — once by A, once by B — which is
    // the two-outcomes-under-one-key corruption `spec/task-id.md` section 2 exists
    // to describe, and NOTHING was reported, because each driver keeps its own
    // dispatched-id set so ID-R1 could not fire. Driver B's log held driver A's
    // outcome record.
    const s = new Fake();
    const def = await load('valid/linear.flow.json');
    const a = attach(s, def, 'run-a');
    const b = attach(s, def, 'run-b');
    a.driver.start({ seed: 1 });
    b.driver.start({ seed: 2 });
    equal(s.ids(), ['run-a:ingest:-:0', 'run-b:ingest:-:0'], 'one entry task each');

    s.settle('run-a:ingest:-:0', 'done', { result: { x: 1 } });
    s.settle('run-b:ingest:-:0', 'done', { result: { x: 2 } });
    s.settle('run-a:publish:-:0', 'done', { result: null });
    s.settle('run-b:publish:-:0', 'done', { result: null });

    equal(s.ids(), [
      'run-a:ingest:-:0', 'run-b:ingest:-:0', 'run-a:publish:-:0', 'run-b:publish:-:0',
    ], 'each task is dispatched EXACTLY once: no id is minted twice under two outcomes');
    equal(a.failures, [], 'and neither run is stopped');
    equal(b.failures, [], 'nor the other');

    for (const [label, rig, prefix] of [['a', a, 'run-a:'], ['b', b, 'run-b:']] as const) {
      ok(rig.driver.snapshot().every((rec) => rec.taskId.startsWith(prefix)),
        `driver ${label}'s log holds only its own run's records`);
      ok(rig.driver.dispatchedIds().every((id) => id.startsWith(prefix)),
        `and it dispatched only its own run's tasks`);
    }
    equal(fold(a.driver.foldInputs()).outcome, 'completed', 'run a completes');
    equal(fold(b.driver.foldInputs()).outcome, 'completed', 'and so does run b, independently');
  });

  test('a refusal in one run does not stop the other', async () => {
    // `failed` is per-driver, and after ADR 0022 that is the same thing as
    // per-run. Before it, `failedRuns` was a set on a driver that served one run —
    // the shape that made the merge look supported.
    const s = new Fake();
    const def = await load('valid/linear.flow.json');
    const a = attach(s, def, 'run-a');
    const b = attach(s, def, 'run-b');
    a.driver.start({});
    b.driver.start({});
    s.settle('run-a:nosuch:-:0', 'done', { result: null });

    equal(a.failures, ['UndispatchedTask'], 'a is stopped by ID-R4');
    ok(a.driver.hasFailed() && !b.driver.hasFailed(), 'and b is untouched');
    s.settle('run-b:ingest:-:0', 'done', { result: {} });
    ok(s.ids().includes('run-b:publish:-:0'), 'b keeps routing');
  });
});

suite('Q72 — the precondition the topology has, stated rather than assumed', (test) => {
  test('two Drivers sharing ONE run id still corrupt each other, and ID-R4 cannot see it', async () => {
    // **Both of W13's readers measured this independently.** ADR 0022 rule 6 and
    // ADR 0023 rule 6 say a second `Driver` on one scheduler is now safe; that is
    // true only for DISTINCT run ids. With the same id, both drivers mint the same
    // task ids, so `dispatched.has()` is true in both and `ID-R4` is not violated
    // — it is a limit of the rule, not a bug in it, and no driver can detect it
    // from inside (`SchedulerLike` has two methods and neither asks).
    //
    // This test pins the known limit so the claim cannot quietly widen. The
    // precondition is stated in ADR 0023's Correction, in `spec/task-id.md`
    // `ID-R4`, and in `AGENTS.md` section 9.
    const s = new Fake();
    const def = await load('valid/linear.flow.json');
    const a = attach(s, def, 'r1');
    const b = attach(s, def, 'r1');
    a.driver.start({});
    b.driver.start({});
    equal(s.ids(), ['r1:ingest:-:0', 'r1:ingest:-:0'],
      'the SAME task id is dispatched twice — spec/task-id.md section 2`s collision, before anything settles');

    s.settle('r1:ingest:-:0', 'done', { result: null });
    equal(a.failures, [], 'and neither driver can report it: each dispatched that id itself');
    equal(b.failures, [], 'nor the second');
    equal(s.ids().filter((id) => id === 'r1:publish:-:0').length, 2,
      'so one settlement produces two dispatches of the successor. Run ids must be unique per ' +
      'scheduler, and nothing in the library enforces that — Q87');
  });
});

suite('ADR 0022 — the surface says what ID-R3 says', (test) => {
  test('a RunFailure names THIS driver`s run, never the inbound id`s', async () => {
    // W13's conformity reader: three sources for one constant value. A malformed
    // settlement reported `'<unknown>'` for a run that has a name, and a foreign
    // one reported ANOTHER run's id. Its adequacy counterpart found the field was
    // asserted nowhere at all — every onRunFailure capture in the repository read
    // `kind` and dropped `runId`.
    const s = new Fake();
    const seen: string[] = [];
    const driver = new Driver(await load('valid/linear.flow.json'), {
      runId: 'run-a',
      scheduler: s,
      createTask: (c) => c,
      predicates: new Map(),
      workerTypes: reg.workerTypes,
      now: () => 1,
      onRunFailure: (f) => seen.push(f.runId),
    });
    driver.start({});
    s.settle('not-a-task-id', 'done', { result: null });
    equal(seen, ['run-a'],
      'not `<unknown>`: after ADR 0022 the driver knows its run from the constructor`s first line');
  });

  test('a throwing start() BOTH reports and rethrows, and is still a used start', async () => {
    // `start`'s catch block carries a comment stating this contract and nothing
    // exercised it — three surviving mutations (report-only, rethrow-only, and
    // latching `started` only on success). The last matters most: ADR 0022 rule 4
    // says ANY second `start` is refused, so a failed one must still count.
    const s = new Fake();
    const failures: string[] = [];
    const driver = new Driver(await load('valid/linear.flow.json'), {
      runId: 'r1',
      scheduler: {
        addTask() { throw new Error('scheduler is down'); },
        addEventListener() {},
      },
      createTask: (c) => c,
      predicates: new Map(),
      workerTypes: reg.workerTypes,
      now: () => 1,
      onRunFailure: (f) => failures.push(f.kind),
    });
    throws(() => driver.start({}), 'scheduler is down',
      'the caller is on the stack, so start() rethrows');
    equal(failures, ['Error'], 'AND reports — the run is stopped either way');
    ok(driver.hasFailed(), 'the run is stopped');
    throws(() => driver.start({}), 'MultipleRuns',
      'ID-R3: a start that threw is still a start. Retrying it would re-enter a stopped run');
    void s;
  });

  test('start() takes the payload alone, and the payload reaches the entry task', async () => {
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({ seed: 7 });
    equal((s.added[0] as unknown as { payload: unknown }).payload, { seed: 7 },
      'the run id is no longer a per-call argument, and the payload is not shifted by its removal');
  });

  test('hasFailed() takes no argument and answers for the one run', async () => {
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    ok(!r.driver.hasFailed(), 'false before any refusal');
    s.settle('r1:nosuch:-:0', 'done', { result: null });
    ok(r.driver.hasFailed(), 'and true after one — there is no other run it could be about');
  });

  test('a run id outside the charset is refused at CONSTRUCTION, before a listener is registered', async () => {
    let subscribed = 0;
    const counting = { addTask() {}, addEventListener() { subscribed++; } };
    const def = await load('valid/linear.flow.json');
    throws(
      () => new Driver(def, {
        runId: 'run:1', scheduler: counting, createTask: (c) => c,
        predicates: new Map(), workerTypes: reg.workerTypes,
      }),
      'not [A-Za-z0-9_-]',
      'ID-R2, and ADR 0022 rule 3 moves it here from start()',
    );
    equal(subscribed, 0, 'a driver for an unnameable run never subscribes to a scheduler');
  });

  test('an INVALID DEFINITION is still refused, and the run id is checked first', () => {
    // Ordering is load-bearing: `assertRunId` runs before `validateDefinition`, so
    // a caller who gets both wrong hears about the run id. Both are configuration
    // and both are refused before anything is queued (ADR 0002 rule 3).
    const bad = { flowId: 'b', version: 1, entry: 'nope', nodes: [] } as unknown as FlowDefinition;
    throws(
      () => new Driver(bad, {
        runId: 'run:1', scheduler: new Fake(), createTask: (c) => c,
        predicates: new Map(), workerTypes: reg.workerTypes,
      }),
      'not [A-Za-z0-9_-]',
      'the run id is refused first — InvalidDefinition would be the second answer, not the first',
    );
  });
});
