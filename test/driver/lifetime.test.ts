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
 *   `hasFailed()` takes no argument. [Q53](../../doc/questions/q53.md).
 *   Its refusals are tested where their rules already lived: `ID-R2` in
 *   `driver.test.ts`, `ID-R3` in `fold-inputs.test.ts`.
 * - [**ADR 0023**](../../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
 *   — **`ID-R4`**, two tiers, because "another run's settlement" and "our run id
 *   on a task we never dispatched" are different failures and only one is ours.
 *   [Q72](../../doc/questions/q72.md).
 *
 * **Expected values come from `spec/task-id.md` sections 2-3.** A task id
 * identifies one `(run, node, branch, attempt)`, and two outcomes under one key is
 * the corruption section 2 exists to describe — never from what the driver emits.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver, UndispatchedTask } from '../../src/driver/driver.ts';
import { buildTaskId } from '../../src/driver/ids.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import type { UnmintedTask } from '../../src/driver/driver.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };

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
  // `cancelled` since W158 (ADR 0094): the scheduler fires `task.cancelled` ALONE for it.
  settle(id: string, state: 'done' | 'failed' | 'user_action' | 'cancelled', over: Record<string, unknown> = {}): void {
    const d = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', d);
    else if (state === 'cancelled') this.fire('task.cancelled', d);
    else { this.fire('task.failed', d); if (state === 'user_action') this.fire('task.user_action', d); }
  }
  ids(): string[] { return this.added.map((t) => t.id); }
  /**
   * An event whose `detail` is whatever the caller says, including one with no
   * `id`. `settle` always supplies one, so it cannot reach `ID-R5`'s version-skew
   * case — a scheduler whose detail stopped carrying the field we read.
   */
  raw(type: string, detail: unknown): void { this.fire(type, detail); }
  private fire(t: string, detail: unknown): void { for (const f of this.l.get(t) ?? []) f({ detail }); }
}

interface Rig { driver: Driver; failures: string[]; failureRunIds: string[]; unminted: UnmintedTask[]; causes: unknown[]; messages: string[] }

function attach(scheduler: Fake, def: FlowDefinition, runId: string): Rig {
  const failures: string[] = [];
  const failureRunIds: string[] = [];
  const unminted: UnmintedTask[] = [];
  const causes: unknown[] = [];
  const messages: string[] = [];
  const driver = new Driver(def, {
    runId,
    scheduler,
    createTask: (c) => c,
    predicates: new Map(),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    now: () => 1,
    joinPolicy: stubPolicy as unknown as JoinPolicy,
    onRunFailure: (f) => { failures.push(f.kind); failureRunIds.push(f.runId); causes.push(f.cause); messages.push(f.message); },
    onUnmintedTask: (i) => unminted.push(i),
  });
  return { driver, failures, failureRunIds, unminted, causes, messages };
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
      // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
      equal([r.messages[0]!.startsWith(`"${taskId}" settled in run "r1"`), String(r.causes[0]), String(fold(r.driver.foldInputs()).stoppedBy), `${r.failures[0]}: ${r.messages[0]}`].map((s, i) => i === 0 ? s : String(s).split('UndispatchedTask').length),
        [true, 2, 2, 2], `the message opens with the task id, and String(e), stoppedBy and kind: message each name the class EXACTLY once: ${String(r.causes[0]).slice(0, 80)}`);
      equal((r.causes[0] as Error).name, 'UndispatchedTask', 'the class sets its OWN name, not one that merely contains it (W140 adequacy reader, finding 1)');
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

  test('a MALFORMED id is NOT ID-R4, and since ADR 0027 is not a refusal at all', async () => {
    // **This assertion is reversed by [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // and it was reversed on purpose.** It read `equal(r.failures, ['InvalidTaskId'])`
    // under ADR 0023 rule 2 — *"does not parse" is not "not ours", it is a defect* —
    // which made one plain non-flow task settling stop every driver on a shared
    // scheduler. `ID-R5` is the replacement and `ID-R4` is untouched: the point
    // this case has always made is that the two rules are different, and it still
    // makes it. The full `ID-R5` surface is the suite below.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('not-a-task-id', 'done', { result: null });
    equal(r.failures, [], 'ID-R5: reported, not refused — and never as ID-R4, which needs a run id to compare');
    equal(r.unminted.map((u) => u.taskId), ['not-a-task-id'], 'on its own channel instead');
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
  // the least coverage before this suite existed. **`cancelled` since W158** (ADR 0094): the fourth terminal
  // state, on the same two tiers, for the same reason — the guards sit above the state and must not read it.
  for (const state of ['done', 'failed', 'user_action', 'cancelled'] as const) {
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

  test('and it does NOT reach onUnmintedTask either — that channel is tier 0 only', async () => {
    // `ID-R5`'s asymmetry with ADR 0023 rule 3, asserted rather than described.
    // A parseable id belonging to another run **will** be reported, by the driver
    // that owns that run; an unparseable one is owned by nobody. That is the whole
    // argument for giving one a channel and not the other, so a driver that
    // reported both would have made the argument false.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('run-9:ingest:-:0', 'done', { result: null });
    equal(r.unminted, [], 'ADR 0027 adds a tier-0 report and leaves rule 3`s silence exactly as it was');
  });
});

/**
 * **`ID-R5` — [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md).**
 *
 * Expected values are re-derived from `spec/task-id.md` section 3's `ID-R5` row
 * and section 1's grammar, never from what the driver emits: `buildTaskId` joins
 * exactly four segments, so *"could a driver have minted this"* and *"does
 * `parseTaskId` accept it"* are the same question, and the answer to the first is
 * what decides the behaviour.
 */
suite('ID-R5 — an inbound id no driver minted is reported and dropped, not refused', (test) => {
  // **All four terminal states — `cancelled` since W158 — and that is W13's adequacy reader's finding
  // applied one tier out** (`spec/task-id.md` `ID-R4`: *"a guard the fixtures only
  // exercise in one state can be conditioned on the state"*). Tier 0 sits above
  // `normalizeEvent`, so it cannot read a terminal state — and a guard that cannot
  // read one cannot be conditioned on it. These rows are what says so.
  for (const state of ['done', 'failed', 'user_action', 'cancelled'] as const) {
    test(`a foreign task settling \`${state}\` leaves the run running`, async () => {
      const s = new Fake();
      const r = attach(s, await load('valid/linear.flow.json'), 'r1');
      r.driver.start({});
      const dispatched = s.ids().length;

      s.settle('nightly-cleanup', state, { result: null });

      equal(r.failures, [],
        'ADR 0027: an id no driver minted is not this run`s defect. Before it, this one line ' +
        'stopped EVERY driver subscribed to the scheduler');
      ok(!r.driver.hasFailed(), 'so the run is still routing');
      equal(r.driver.snapshot().length, 0, 'nothing is appended — it is not an outcome of ours');
      equal(s.ids().length, dispatched, 'and nothing is dispatched from it');
      // `user_action` fires the ADR 0007 rule 2 pair, so the report count is the
      // event count rather than one per task. Stated here because a reader will
      // otherwise read `2` as a bug.
      equal(r.unminted.map((u) => u.event),
        state === 'user_action' ? ['task.failed', 'task.user_action']
          : [`task.${state === 'done' ? 'completed' : state === 'cancelled' ? 'cancelled' : 'failed'}`],
        'reported once per EVENT: tier 0 is above normalizeEvent, so OR-R3 has not yet dropped the pair`s first');
    });
  }

  // **`ID-R5` is one guard over SIX refusals, and W18's adequacy reader found five
  // of them never delivered.** Every fixture above is `nightly-cleanup` or
  // `not-a-task-id` — single-segment, colon-free — so only `parseTaskId`'s
  // **arity** refusal ever reached the listener. With that, `if (typeof taskId ===
  // 'string' && taskId.includes(':')) throw e;` narrows tier 0 to colon-free ids
  // and **all 402 assertions stayed green**, restoring ADR 0023 rule 2 for five of
  // six shapes; so does `taskId.startsWith(this.runId + ':')`, which is
  // character-for-character ADR 0027's own last *rejected* alternative.
  //
  // **The rows below are the ones the decision argues about.** `r1:ingest:x:0` is
  // *"a corrupted id for a task that IS ours"* — the against-case's whole
  // referent, and the only shape a version skew inside our own id scheme
  // produces. Expected value from `spec/task-id.md` section 1: four segments in
  // the stated grammar, or it did not come from `buildTaskId`.
  const SHAPES: [string, unknown, string][] = [
    ['a foreign task, no delimiters at all', 'nightly-cleanup', 'arity — one segment'],
    ['our run id with a malformed branchPath', 'r1:ingest:x:0', '`branchPath` is `-` or dotted indices'],
    ['our run id with a malformed attempt', 'r1:ingest:-:00', '`attempt` has no leading zeros'],
    ['our run id with a nodeId outside the charset', 'r1:ing est:-:0', 'the segment charset — a space'],
    ['a runId segment outside the charset', 'r 1:ingest:-:0', 'the same refusal on the FIRST segment'],
    ['three segments', 'r1:ingest:-', 'arity — too few, but WITH delimiters'],
    ['five segments', 'r1:ingest:-:0:9', 'arity — too many'],
  ];
  for (const [name, id, why] of SHAPES) {
    test(`${name} is reported and dropped (${why})`, async () => {
      const s = new Fake();
      const r = attach(s, await load('valid/linear.flow.json'), 'r1');
      r.driver.start({});
      const before = s.ids().length;

      s.settle(id as string, 'done', { result: null });

      equal(r.failures, [], 'ID-R5 is one guard over every shape `parseTaskId` refuses, not over one of them');
      ok(!r.driver.hasFailed(), 'the run keeps routing');
      equal(r.unminted.map((u) => u.taskId), [id], 'reported, with the id the scheduler actually sent');
      equal(s.ids().length, before, 'and nothing dispatched from it');
    });
  }

  test('the report carries this driver`s run id, and it could not have come from anywhere else', async () => {
    const s = new Fake();
    // **A run id no other case uses.** W18's adequacy reader: with `run-a` here,
    // replacing `runId: this.runId` with the literal `'run-a'` passed this case —
    // the fixture and the constant were the same string, so the case named as the
    // moved discrimination could not, alone, make it.
    const r = attach(s, await load('valid/linear.flow.json'), 'zz9');
    r.driver.start({});
    s.settle('nightly-cleanup', 'done', { result: null });
    equal(r.unminted.map((u) => u.runId), ['zz9'],
      'ADR 0022 rule 1. **This is the assertion that moved here from `onRunFailure`** when ADR 0027 ' +
      'took away its vehicle: an unparseable id is the ONLY inbound id with no run id to parse one ' +
      'out of, so it is the only case where "from the constructor" and "from the event" differ');
  });

  test('a `detail` with no `id` at all is reported UNCOERCED, which is the case worth having', async () => {
    // The one way ADR 0027's inference could be wrong — an id that IS ours and is
    // not recognisable — and it is not hypothetical: `task.progress`'s detail
    // changed shape at 0.3.0 and a 0.2.1 consumer reading `detail.taskId` got
    // `undefined` (CLAUDE.md). Reporting `''` here would hide exactly that.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.raw('task.completed', { state: 'done', attempts: 0, timestamp: 1 });
    equal(r.unminted.length, 1, 'reported rather than dropped in silence');
    equal(r.unminted[0]!.taskId, undefined,
      'undefined, not the empty string the parse was handed — a consumer debugging a version skew ' +
      'needs to see that there was no id, not that there was a bad one');
    // **W18's conformity reader.** This read `reason.includes('1 segments')` — a
    // pass on `parseTaskId`'s message ABOUT THE STAND-IN, which is a sentence
    // describing `''`, a value the scheduler never sent. In the one case a
    // consumer most needs the report, the report was about our substitution.
    ok(r.unminted[0]!.reason.includes('no string `id`'),
      'the reason describes what ARRIVED. `parseTaskId`s own message is used when there IS an id ' +
      'to describe, which the case below pins');
    ok(!r.unminted[0]!.reason.includes('""'), 'and never quotes the empty string we invented');
  });

  test('when there IS a string id, the reason is `parseTaskId`s own message', async () => {
    // The other half of the case above: `ID-R5` says the reason is `parseTaskId`'s,
    // so the grammar is stated in one place (`spec/task-id.md` section 2). Both
    // halves are needed — asserting only this one lets the `''` message through,
    // and asserting only the other lets our own text replace the grammar's.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('nightly-cleanup', 'done', { result: null });
    ok(r.unminted[0]!.reason.includes('"nightly-cleanup"') && r.unminted[0]!.reason.includes('1 segments'),
      'the parser`s own sentence, naming the id the scheduler actually sent');
  });

  test('FD-V16 accepts exactly the node ids buildTaskId accepts, which the refusal argument rests on', () => {
    // **W18's conformity reader, and it is the sharper half of a NOTE.** ADR 0027
    // and `spec/outcome-record.md` section 6 both claim `InvalidTaskId` can no
    // longer reach `onRunFailure`. `advance()` and `dispatch()` call `buildTaskId`
    // from INSIDE the listener, where a throw becomes a `RunFailure`, and the only
    // thing stopping it is that **a node id the definition validator accepted is a
    // node id `buildTaskId` accepts**. Nothing asserted that.
    //
    // **Asserted as the PROPERTY, not as the spelling.** The first version of this
    // case read both source files and compared the two regex literals as text: it
    // passed in node and deno and **failed in chromium**, where nothing can read
    // `src/` (`RT-R1` — three runtimes from one source tree). Comparing behaviour
    // is portable *and* strictly stronger — it survives either constant being
    // rewritten in a different but equivalent form, which a text compare would
    // call a failure.
    const CANDIDATES = [
      'ok', 'ok-1', 'ok_1', 'OK', 'a'.repeat(64),          // in both, or in neither
      'a'.repeat(65), '', 'has space', 'has:colon', 'has.dot', 'has/slash', 'é', 'a+b',
    ];
    const disagree: string[] = [];
    for (const id of CANDIDATES) {
      const def = {
        flowId: 'f', version: 1, entry: id,
        nodes: [{ id, kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [] }],
      } as unknown as FlowDefinition;
      const validatorAccepts = !validateDefinition(def, { workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, predicates: [] })
        .some((v) => v.rule === 'FD-V16');
      let minterAccepts = true;
      try { buildTaskId('r1', id, null); } catch { minterAccepts = false; }
      if (validatorAccepts !== minterAccepts) disagree.push(id);
    }
    equal(disagree, [],
      'FD-V16 and ID-R2 must accept the same node ids. Where they diverge, buildTaskId throws ' +
      'InvalidTaskId from inside the listener and `spec/outcome-record.md` section 6`s "no raise ' +
      'site the library reaches" becomes false');
  });

  test('the run keeps working: a legitimate settlement after a foreign one still routes', async () => {
    // **The whole of ADR 0027 in one assertion.** Under ADR 0023 rule 2 this
    // dispatched nothing, because the run had already stopped.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('nightly-cleanup', 'done', { result: null });
    s.settle('r1:ingest:-:0', 'done', { result: null });
    ok(s.ids().includes('r1:publish:-:0'),
      'the successor is dispatched — a foreign task on the scheduler no longer kills an unrelated run');
  });

  test('two drivers on one scheduler both survive it, which is the topology ADR 0023 blessed', async () => {
    // `AGENTS.md` section 9 recommends this topology. Measured by W13's conformity
    // reader under ADR 0023 rule 2: **both** drivers reported `InvalidTaskId` and
    // **both** stopped. That is the defect ADR 0027 exists to remove, so it is
    // asserted at the multiplicity that made it matter rather than on one driver.
    const s = new Fake();
    const a = attach(s, await load('valid/linear.flow.json'), 'run-a');
    const b = attach(s, await load('valid/linear.flow.json'), 'run-b');
    a.driver.start({});
    b.driver.start({});

    s.settle('nightly-cleanup', 'done', { result: null });

    equal([...a.failures, ...b.failures], [], 'neither run is stopped by a task neither of them owns');
    ok(!a.driver.hasFailed() && !b.driver.hasFailed(), 'both are still routing');
    // **W18's conformity reader.** This asserted `[a.unminted.length, b.unminted.length]`
    // and claimed *"under its own run id"* in its message — which a driver
    // reporting the OTHER driver's run id passes. The single-driver case above
    // pins `runId`, but not at the multiplicity where the two could be confused,
    // and that multiplicity is the whole reason this case exists. `ID-R5`'s test
    // list asks for the run ids, so this asserts the run ids.
    equal([...a.unminted, ...b.unminted].map((u) => u.runId), ['run-a', 'run-b'],
      'one report each, and each under its OWN run id — nobody else is going to tell either of them');

    s.settle('run-a:ingest:-:0', 'done', { result: null });
    s.settle('run-b:ingest:-:0', 'done', { result: null });
    ok(s.ids().includes('run-a:publish:-:0') && s.ids().includes('run-b:publish:-:0'),
      'and both runs complete their next step, which is P6`s question answered');
  });

  test('a driver that registers no callback still routes correctly', async () => {
    // `onUnmintedTask` is optional and the run must not depend on it: the dropped
    // settlement was never this run's, so nothing it waits for goes missing.
    const s = new Fake();
    const driver = new Driver(await load('valid/linear.flow.json'), {
      runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, now: () => 1,
    });
    driver.start({});
    s.settle('nightly-cleanup', 'done', { result: null });
    s.settle('r1:ingest:-:0', 'done', { result: null });
    ok(!driver.hasFailed() && s.ids().includes('r1:publish:-:0'),
      'no callback, no failure, and the run advances');
  });

  test('a throwing onUnmintedTask DOES stop the run, which is the documented behaviour', async () => {
    // **ADR 0027 chose "documented rather than guarded" and nothing asserted the
    // choice** — W18's adequacy reader wrapped the call in `try {} catch {}` and
    // all 402 assertions stayed green, silently reversing a stated ADR position
    // and an `AGENTS.md` §9 warning printed in bold. Three observables flip, so
    // three are asserted. The value comes from the decision, not from the code:
    // every callback on this surface is invoked inside the listener and a throw
    // from any of them reaches `failRun`; swallowing a consumer's throw is its
    // own defect.
    const s = new Fake();
    const failures: string[] = [];
    const driver = new Driver(await load('valid/linear.flow.json'), {
      runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, now: () => 1,
      onRunFailure: (f) => failures.push(f.kind),
      onUnmintedTask: () => { throw new TypeError('consumer bug'); },
    });
    driver.start({});
    const before = s.ids().length;
    s.settle('nightly-cleanup', 'done', { result: null });

    equal(failures, ['TypeError'], 'reported under the CONSUMER`s error class, at the listener boundary');
    ok(driver.hasFailed(), 'and the run is stopped — a foreign task takes it down through their code');
    s.settle('r1:ingest:-:0', 'done', { result: null });
    equal(s.ids().length, before, 'so the legitimate settlement that follows routes nothing');
  });

  test('a refusal raised BELOW tier 0 still stops the run', async () => {
    // **This case's first comment claimed it exercised the `instanceof` in tier 0's
    // catch. It does not, and W18's own provocation is what said so** — widening
    // that catch to bare `catch (e)` leaves every assertion here green, because
    // tier 0's `try` wraps one call raising one class and nothing else can reach
    // it. The guard is a forward guard; `src/driver/driver.ts` says that in place.
    //
    // What this case does cover is the ORDERING, which is a real clause of
    // ADR 0027 and is killable: `normalizeEvent` raises `OR-R6` **below** tier 0
    // and outside its block, so a refusal from there must still reach `failRun`
    // rather than being reported as a foreign task. Move `normalizeEvent` inside
    // that `try` and this goes red.
    const s = new Fake();
    const r = attach(s, await load('valid/linear.flow.json'), 'r1');
    r.driver.start({});
    s.settle('r1:ingest:-:0', 'done', { result: () => 1 });
    equal(r.failures, ['UncloneableResult'], 'OR-R10, unchanged — tier 0 catches its own throw and no other');
    equal(r.unminted, [], 'and it is not misreported as an unminted task');
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
    //
    // **[ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // took this case's discriminating vehicle away and it is recorded rather than
    // quietly swapped.** It used to settle `'not-a-task-id'`, the only inbound id
    // with **no run id in it** — which is what made "from the constructor" and
    // "parsed from the event" distinguishable. Every refusal that can still reach
    // `failRun` from the listener sits *below* `ID-R4` tier 1, so its id's run
    // segment is now necessarily this driver's, and this case can no longer tell
    // the two sources apart on its own. **The discrimination moved with the
    // vehicle**, to `ID-R5`'s *"the report carries this driver's run id"* above;
    // this row keeps the `runId`-is-asserted-at-all property that W13's adequacy
    // reader added, and says plainly that it is now the weaker half.
    const s = new Fake();
    const seen: string[] = [];
    const driver = new Driver(await load('valid/linear.flow.json'), {
      runId: 'run-a',
      scheduler: s,
      createTask: (c) => c,
      predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      now: () => 1,
      onRunFailure: (f) => seen.push(f.runId),
    });
    driver.start({});
    s.settle('run-a:nosuch:-:0', 'done', { result: null });
    equal(seen, ['run-a'],
      'ID-R4 tier 2 is the vehicle now, and a RunFailure still names the run that failed');
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
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
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
    equal((s.added[0] as unknown as { payload: unknown }).payload, { settings: {}, input: { seed: 7 } },
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
        predicates: new Map(), workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
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
        predicates: new Map(), workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      }),
      'not [A-Za-z0-9_-]',
      'the run id is refused first — InvalidDefinition would be the second answer, not the first',
    );
  });
});
