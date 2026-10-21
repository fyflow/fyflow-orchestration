/**
 * Ladder L2 — **the fold's input sequence**, which nothing produced before W5.
 * [ADR 0014](../../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md),
 * [Q41](../../doc/questions/q41.md).
 *
 * The three things this file exists to hold down, none of which any earlier suite
 * could have noticed:
 *
 *   1. **`pathEnded` has a producer, and it fires outside a region.** That is the
 *      half that had none anywhere: inside a region an `end` was reported as
 *      `branch.exited`, and outside one nothing was reported at all — so
 *      `spec/run-state.md` section 3's `completed` was not derivable for a linear
 *      flow.
 *   2. **`snapshot()` is exactly the record-kind subsequence of `foldInputs()`.**
 *      The driver keeps two arrays and ADR 0014 accepts that as a cost; this is
 *      the assertion that makes it *checked* rather than trusted.
 *   3. **Append order is a contract, not an accident** (ADR 0014 rule 6) — a
 *      dispatch before the `addTask` it causes, and a path end before the join
 *      dispatch it precedes.
 *
 * No scheduler. The fake is the same twelve lines L2 has always used.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { Predicate } from '../../src/driver/routing.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
// W4's local flow: the only one in the repository whose branch reaches
// `branch.lost` by SETTLING rather than by a human resolving a suspended node.
// The corpus cannot express it ([Q44](../../doc/questions/q44.md)).
import { optionalLost } from '../matrix/flows.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };

class FakeScheduler {
  readonly added: { id: string }[] = [];
  /** Every `addTask` call, paired with how long the sequence was at that moment. */
  readonly addedAt: number[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  private seqLength: () => number = () => 0;
  watch(f: () => number): void {
    this.seqLength = f;
  }
  addTask(task: unknown): void {
    this.added.push(task as { id: string });
    this.addedAt.push(this.seqLength());
  }
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
  private fire(type: string, detail: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

function harness(
  def: FlowDefinition,
  predicates: Record<string, Predicate> = {},
  policy: JoinPolicy = liveToken as unknown as JoinPolicy,
) {
  const scheduler = new FakeScheduler();
  const pushed: FoldInput[] = [];
  const unsatisfiable: unknown[] = [];
  let clock = 1000;
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: new Map(Object.entries(predicates)),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    now: () => ++clock,
    joinPolicy: policy,
    onFoldInput: (i) => pushed.push(i),
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i),
  });
  scheduler.watch(() => pushed.length);
  return { scheduler, driver, pushed, unsatisfiable, ids: () => scheduler.added.map((t) => t.id) };
}

const kinds = (seq: readonly FoldInput[]) => seq.map((i) => i.kind);

suite('ADR 0014 — the driver produces one ordered input sequence', (test) => {
  test('pathEnded fires for an `end` node OUTSIDE a region — the half nothing produced', async () => {
    // `linear.flow.json` has no fan-out at all, so no region event can stand in.
    // Before W5 this sequence contained no `pathEnded` of any kind, and
    // `spec/run-state.md` section 3's `completed` was therefore underivable for it.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({ seed: 1 });
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { a: 1 } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: null });

    const ends = h.driver.foldInputs().filter((i) => i.kind === 'pathEnded');
    equal(ends, [{ kind: 'pathEnded', reason: 'end', at: 'done' }],
      'one path end, at the `end` node the flow names, with no region anywhere in the run');
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      "spec/run-state.md section 3: `completed` is *at least one path ended at an `end` node*, " +
      'which is exactly what this input carries');
  });

  test('pathEnded fires with reason `no-eligible-edge` outside a region too', async () => {
    // `linear`'s `ingest` has one edge and it opts into `done` only, so a `failed`
    // settlement has no eligible edge and the path ends. `FD-R1` is a different
    // rule — that is *edges exist and none matched*; this is *no edge opts in*.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'failed', { error: 'nope' });

    equal(h.driver.foldInputs().filter((i) => i.kind === 'pathEnded'),
      [{ kind: 'pathEnded', reason: 'no-eligible-edge', at: 'ingest' }],
      'ADR 0004: a non-success outcome routes only where an edge opts in; here none does');
    equal(fold(h.driver.foldInputs()).outcome, 'failed',
      'section 3: `failed` is *a path ended with no eligible edge*, outside or inside a region');
  });

  test('snapshot() is exactly the record-kind subsequence of foldInputs()', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { a: 1 } });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 1 } });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { s: 2 } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: null });

    const fromSeq = h.driver.foldInputs()
      .filter((i) => i.kind === 'outcome' || i.kind === 'resolution')
      .map((i) => (i as { record: { taskId: string } }).record.taskId);
    equal(fromSeq, h.driver.snapshot().map((r) => r.taskId),
      'ADR 0014 cost 1: the driver keeps two arrays, so this is what stops them drifting');
    ok(fromSeq.length === 4, 'four settlements, and the sequence is longer than the log');
    ok(h.driver.foldInputs().length > fromSeq.length,
      'the sequence carries the routing facts no record does — that is the whole point of it');
  });

  test('append order: a dispatch precedes the addTask it causes', async () => {
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    // `addedAt[i]` is the sequence length when `addTask` was called. The dispatch
    // input is appended first, so the length must already include it.
    equal(h.scheduler.addedAt, [1], 'ADR 0014 rule 6: `dispatched` is appended BEFORE addTask');
    equal(kinds(h.driver.foldInputs()), ['dispatched'], 'and it is the first element of the run');
  });

  test('append order: a path end precedes the dispatch the join makes after it', async () => {
    // `p1-routed-away` at low confidence: branch 1 exits at `abandoned`, which
    // satisfies live-token, which routes out of the join. The path end must land
    // between them or a fold of a prefix reports the join's dispatch before the
    // event that authorised it.
    const h = harness(await load('valid/p1-routed-away.flow.json'), { isLowConfidence: () => true });
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { confidence: 0.1 } });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { confidence: 0.1 } });

    const seq = h.driver.foldInputs();
    const exited = seq.findIndex((i) => i.kind === 'region' && i.event.type === 'branch.exited');
    const ended = seq.findIndex((i) => i.kind === 'pathEnded');
    const joined = seq.findIndex((i) => i.kind === 'joinSettled');
    const publish = seq.findIndex((i) => i.kind === 'dispatched' && i.taskId === 'r1:publish:-:0');
    ok(exited >= 0 && ended > exited, 'the region event first, then the path end');
    ok(joined > ended, 'then the join settles');
    ok(publish > joined, 'and only then is the join`s successor dispatched');
  });

  test('an unsatisfiable join appends joinSettled with fired: false', async () => {
    // **Found by W5's own mutation sweep**: deleting this append survived all 278
    // assertions, because *neither shipped policy ever returns `unsatisfiable`*
    // (`spec/join-policy.md` section 4) — so no real run reaches the line, and the
    // fold-level test for `joined: false` builds the input by hand and proves
    // nothing about the driver emitting it.
    //
    // A stub policy is the right instrument and W3's suite already uses one for
    // the same reason: the seam has two exits and only one of them is reachable
    // from what we ship. ADR 0015 calls `joined: false` the empty half; this is
    // what stops "empty" meaning "unwritten".
    const never: JoinPolicy = {
      id: 'stub-unsatisfiable',
      open: () => ({}),
      step: (st) => st,
      status: () => 'unsatisfiable' as const,
      describe: () => ({ why: 'a stub, so the driver`s other exit is reachable at all' }),
    };
    const h = harness(await load('valid/fanout-join.flow.json'), {}, never);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    // The policy is only ASKED after a terminal region event, so one branch has
    // to arrive before the seam's other exit is reachable at all.
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });

    equal(h.unsatisfiable.length, 1, 'the driver reports it once');
    equal(h.driver.foldInputs().filter((i) => i.kind === 'joinSettled'),
      [{ kind: 'joinSettled', regionId: 'split', regionPath: '-', joinId: 'collect', fired: false }],
      'and the sequence records that the join settled WITHOUT routing — ADR 0015 rule 2');
    equal(fold(h.driver.foldInputs()).regions['split']!['-']!.joined, false,
      'which the fold reads as `joined: false`, not `null`: it will never fire, rather than not yet');
  });

  test('a run the driver halted appends `halted`, once', async () => {
    // **The vehicle changed and the rule did not.** This used to deliver two
    // malformed ids, which `parseTaskId` refused at the listener boundary; since
    // [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // an unparseable id is not a refusal at all, so the simplest reachable one is
    // `ID-R4` tier 2 — our own run id for a node we never dispatched, twice.
    // `OR-R10`'s *"once"* is what is under test either way.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:nosuch:-:0', 'done');
    h.scheduler.settle('r1:alsonosuch:-:0', 'done');
    const stops = h.driver.foldInputs().filter((i) => i.kind === 'halted');
    equal(stops.length, 1, '`OR-R10` stops the run once; a second refusal for the same run adds nothing');
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'RN-R8: halted outranks everything');
  });

  test('an id NO driver minted appends nothing at all, and the sequence keeps going', async () => {
    // `ID-R5`'s fold-side half, and it is the one ADR 0027's third option would
    // have broken: *"ignore it, but report it"* is a **callback**, deliberately,
    // and not a `FoldInput` kind. The fold calls `parseTaskId` on the task id of a
    // `dispatched`, an `asked` and a record — in
    // `src/fold/accumulator.ts` since W194 (ADR 0120); this cited
    // `src/fold/run-state.ts:154` and `:179`, stale before W194 and named by its
    // conformity reader (C7), corrected by W195 — so a fold input carrying the
    // offending string would make `fold()` — a pure function — throw
    // `InvalidTaskId`. ADR 0027 rules that out in as many words.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    h.scheduler.settle('nightly-cleanup', 'done');
    equal(h.driver.foldInputs().map((i) => i.kind), ['dispatched'],
      'no `halted`, and no fifth input kind carrying an id the fold would then try to parse');
    h.scheduler.settle('r1:ingest:-:0', 'done');
    equal(fold(h.driver.foldInputs()).outcome, 'running', 'the run is unharmed and still going');
  });

  test('what leaves through onFoldInput is a frozen copy, not the driver`s own element', async () => {
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { a: 1 } });

    const pushedRecord = h.pushed.find((i) => i.kind === 'outcome') as { record: { result: { a: number } } };
    ok(Object.isFrozen(pushedRecord), 'OR-R7: a listener cannot edit the driver`s sequence');
    // Mutating the copy's result must not reach the driver's stored record.
    try {
      pushedRecord.record.result.a = 99;
    } catch { /* frozen at the top level; the nested object may or may not be */ }
    equal(h.driver.effectiveOutcomeOf('r1:ingest:-:0')?.result, { a: 1 },
      'the stored record is unchanged, which is `spec/outcome-record.md` section 4 applied on the way out');
  });

  test('the pushed sequence and foldInputs() agree, element for element', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(kinds(h.pushed), kinds(h.driver.foldInputs()),
      'the push half and the pull half are the same sequence, or one of them is lying');
  });
});

suite('ADR 0014 — the ordering clauses no test reached', (test) => {
  test('rule 6b: a region event is appended AFTER the policy has stepped', async () => {
    // The clause exists so *"an `onFoldInput` listener asking `joinStatusOf` sees
    // the status that event produced"*. Nothing registered such a listener, so
    // appending before the step survived both suites — found by W5's
    // test-adequacy pass. This is that listener.
    const seen: { branchPath: string; live: number }[] = [];
    const scheduler = new FakeScheduler();
    const driver = new Driver(await load('valid/fanout-join.flow.json'), {
      runId: 'r1',
      scheduler,
      createTask: (c) => c,
      predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      joinPolicy: liveToken as unknown as JoinPolicy,
      onFoldInput: (i) => {
        if (i.kind !== 'region') return;
        const status = driver.joinStatusOf('split') as { describe: { live: number } } | null;
        seen.push({ branchPath: i.event.branchPath, live: status?.describe.live ?? -1 });
      },
    });
    driver.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });

    // `live-token` increments on each `branch.opened`. If the append ran before
    // the step, the listener would read 0 then 1 instead of 1 then 2.
    equal(seen, [{ branchPath: '0', live: 1 }, { branchPath: '1', live: 2 }],
      'the policy has already consumed the event the listener is being told about');
  });

  test('rule 6c: a path end precedes the join dispatch on the `no-eligible-edge` route too', () => {
    // The `end`-node route is covered above. This is the `branch.lost` route — the
    // one where a join becomes satisfiable *because a branch was lost*, which is
    // the family P1 is about, and moving the append past `settleJoin` survived
    // every assertion until now.
    //
    // **The first version of this test passed vacuously**, on `fanout-failure`,
    // whose optional node has an `on: ["failed"]` edge and therefore *exits*
    // rather than being lost — so the branch under test was never entered. Found
    // by re-running the reviewer's own mutation against it. It uses W4's
    // `matrix-optional-lost`, which is the only flow in the repository that
    // reaches `branch.lost` by settling ([Q44](../../doc/questions/q44.md)).
    const h = harness(optionalLost);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    // `optional: true` on the node, so the scheduler settles it `failed` rather
    // than parking it in `user_action` — the road ADR 0003 calls ordinary.
    h.scheduler.settle('r1:scoreB:1:0', 'failed', { error: 'nope' });

    const seq = h.driver.foldInputs();
    const lost = seq.findIndex((i) => i.kind === 'region' && i.event.type === 'branch.lost');
    const ended = seq.findIndex((i) => i.kind === 'pathEnded' && i.reason === 'no-eligible-edge');
    const joined = seq.findIndex((i) => i.kind === 'joinSettled');
    const publish = seq.findIndex((i) => i.kind === 'dispatched' && i.taskId === 'r1:publish:-:0');
    ok(lost >= 0, 'the branch was LOST, not exited — this is the route under test');
    ok(ended > lost, 'the region event first, then the path end');
    ok(joined > ended, 'then the join settles, authorised by a region that is now empty');
    ok(publish > joined, 'and only then is the join`s successor dispatched');
  });

  test('foldInputs() returns a frozen copy, not the driver`s own array', async () => {
    // Asserted for `onFoldInput` and for `snapshot()`; `foldInputs()` is the half
    // ADR 0014 rule 2 names by name, and returning `this.inputs` directly survived
    // both suites.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { a: 1 } });

    const seq = h.driver.foldInputs();
    ok(Object.isFrozen(seq), 'the sequence itself is frozen');
    ok(seq.every((i) => Object.isFrozen(i)), 'and so is every element');
    const before = h.driver.foldInputs().length;
    try {
      (seq as FoldInput[]).push({ kind: 'pathEnded', reason: 'end', at: 'forged' });
    } catch { /* frozen arrays throw in strict mode, which module code is */ }
    equal(h.driver.foldInputs().length, before,
      'OR-R7: a caller cannot append to the driver`s sequence and forge a path end');
  });
});

suite('ID-R3 — a driver serves exactly one run, and start() is called at most once', (test) => {
  test('a second start is refused and the scheduler receives nothing', async () => {
    // Measured by W5's spec-conformity pass before this refusal existed: the
    // second run's join never fired (`firedJoins` already held `split`), and
    // `fold(driver.foldInputs())` returned ONE RunState carrying the first run's
    // id and reporting `completed` — for a state holding a permanently hung run.
    //
    // **ADR 0022 rule 4 widened the rule and this test with it.** The run id is a
    // constructor option now, so "a second, DIFFERENT run" is not a thing a caller
    // can express: any second `start` is refused, and there is no id to compare.
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    const before = h.scheduler.added.length;

    throws(() => h.driver.start({}), 'MultipleRuns',
      'ID-R3: the sequence, the fired joins and the policy state carry no run id');
    equal(h.scheduler.added.length, before, 'and nothing was dispatched for the refused start');
    equal(h.driver.foldInputs().filter((i) => i.kind === 'dispatched')
      .every((i) => (i as { taskId: string }).taskId.startsWith('r1:')), true,
      'the sequence still describes exactly one run');
  });

  test('a second start no longer falls through to ID-R1, which is what widening the rule cost', async () => {
    // v0.4 of `spec/task-id.md` kept ID-R3 narrow so that a second `start` with
    // the SAME id fell through to ID-R1 — W3's only direct provocation of it —
    // and section 3 said in writing that widening the rule would trade a tested
    // rule for an untested one. This asserts the trade actually happened, so that
    // ID-R1's replacement cannot quietly go missing: it now lives in
    // `test/driver/driver.test.ts`, provoked by the same settlement delivered
    // twice, and it is the REPORTED form rather than the thrown one.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    throws(() => h.driver.start({}), 'MultipleRuns',
      'ID-R3 now answers first — the DuplicateTaskId this used to raise is unreachable from start()');
  });

  test('Q87: the advice it gives says WITH A DIFFERENT RUN ID, because it used not to', async () => {
    // **A one-sentence defect, and the text is the whole of it.** The message
    // ended at *"Construct a second Driver; ADR 0023 makes that safe on the same
    // scheduler"*, so the library's own error recommended the one topology
    // ADR 0023 does **not** make safe: two drivers on ONE run id mint the same task
    // ids, `dispatched.has()` is true in both, and `ID-R4` is structurally blind to
    // it (`spec/task-id.md` section 3, `ID-R4`'s second precondition — measured, and
    // asserted in `lifetime.test.ts`'s Q87 case).
    //
    // Asserted on the TEXT because `throws(..., 'MultipleRuns')` matches the class
    // and would pass with the sentence still wrong. The enforcement half stays a
    // precondition and P6 does not take it — no driver can detect the violation.
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start({});
    let message = '';
    try { h.driver.start({}); } catch (e) { message = (e as Error).message; }
    ok(/different run id/i.test(message),
      'the advice names the precondition it is advice about');
    ok(message.includes('unique across the drivers sharing one'),
      'and says the rule, not just the workaround — a caller who reads only this line has been told');
  });
});

suite('OR-R10 — a halted run stops on the INBOUND edge too', (test) => {
  test('resolve() is refused for a run a refusal already terminated', async () => {
    // `onEventOrThrow` checked `failedRuns`; `resolve()` did not, so a resolution
    // for a suspended task in a halted run appended a record and dispatched.
    // W5's sequence made it visible: elements kept arriving after the `halted`
    // element while `withOutcome` pins the outcome to `halted`, so the work
    // landed in `nodes` and no outcome reflected it. Found by W5's
    // spec-conformity pass; pre-existing since W3.
    //
    // A fan-out, because the two halves must be in flight at once: one branch
    // suspends and stays resolvable, the other stops the run.
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'user_action');
    ok(h.driver.terminalStateOf('r1:scoreA:0:0') === null,
      'branch 0 is suspended, so it is resolvable — RS-R1');

    // Halt the run with `OR-R6` — a result `structuredClone` refuses.
    // Deliberately NOT a malformed task id: that refusal cannot be attributed to
    // a run, so `failRun` marks the sentinel `'<unknown>'` and stops nothing.
    // That is W3's and is recorded in W5's Record rather than fixed here.
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { fn: () => 1 } });
    ok(h.driver.hasFailed(), 'the run is halted, and halted under its own id');

    const lenBefore = h.driver.foldInputs().length;
    const dispatchedBefore = h.driver.dispatchedIds().length;
    equal(h.driver.resolve('r1:scoreA:0:0', 'done', { result: {}, actor: 'a-person' }), false,
      'OR-R10: refused, and refused as a rejected command rather than as a run failure');
    equal(h.driver.foldInputs().length, lenBefore, 'nothing was appended');
    equal(h.driver.dispatchedIds().length, dispatchedBefore, 'and nothing was dispatched');
    equal(fold(h.driver.foldInputs()).outcome, 'halted',
      'RN-R8: and the run stays halted, with no work landing after the halt');
  });
});
