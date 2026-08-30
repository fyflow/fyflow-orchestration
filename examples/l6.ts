/**
 * **Ladder L6 — the gate.** Twelve real runs on a real scheduler: P1's exit
 * artifact, and P2's.
 *
 * ```
 *   npm run test:l6         node examples/l6.ts
 *   npm run test:l6:deno    deno run --import-map=examples/deno-import-map.json ... examples/l6.ts
 * ```
 *
 * **Every expected value below was written from the spec before anything ran**,
 * and each is derivable without a scheduler:
 *
 *   - the run-state outcome from `spec/run-state.md` section 3's precedence;
 *   - which policy fires from
 *     [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s
 *     matrix, whose eighteen cells were themselves hand-derived from
 *     `spec/join-policy.md` sections 2-4;
 *   - the dispatched task ids from `spec/task-id.md`'s four-segment scheme and
 *     the flow's own node ids.
 *
 * A value taken from output is a snapshot rather than a test
 * (`doc/workflow.md` section 5 rule 2), and the rendered table at the bottom is a
 * **by-product** of the same values the assertions use — never their source.
 *
 * ## What each row is for
 *
 * | | |
 * |---|---|
 * | `fanout-join` x both | the control. Both policies must agree, or the comparison has no baseline — ADR 0003's `all-arrive` row |
 * | `p1-routed-away` at **high** confidence x both | the predicate returns **false**, both branches arrive, both policies fire. Without this row `isLowConfidence` is an assertion that cannot fail |
 * | `p1-routed-away` at **low** confidence x both | **P1's case, on real workers.** `live-token` completes; `arrival-count` hangs, and run state now says `stuck` rather than `completed` ([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)) |
 * | `optional-loss` x both | **ADR 0003's second mechanism, and the ordinary one.** No decision and no routing away — an `optional` task simply fails and its branch is LOST. `live-token` still fires the join; `arrival-count` is `stuck` anyway. It is also the only row where a task settles as anything but `done`, which is what makes the terminal-state assertions able to fail |
 * | **W6 — `failure-edge`** | a failure that **routes**. The one definition feature no P1 row reached: an `on: ["failed"]` edge, ADR 0004's central mechanism, and the case `spec/run-state.md` section 3 uses to define `completed` against `failed` |
 * | **W6 — `suspend / resolve / resume`** | the human-in-the-loop half, and the only inbound API the library has. `user_action` → `awaiting_action` → `Driver.resolve()` → the branch arrives |
 * | **W6 — `suspend / nobody comes`** | the row that separates **waiting on a person** from **stuck**. Same flow, no human: the join has not fired and the run is `awaiting_action`, not `stuck`. It is the only row that ends with a node still `suspended`, and it is expected NOT to finish |
 * | **W6 — `uncloneable`** | a refusal that stops a run, on real workers. `OR-R6` at the listener boundary, reported rather than thrown, folding to `stopped` |
 */
import {
  POLICIES,
  type FlowDefinition,
  type Predicate,
  type RunOutcome,
} from '../index.ts';
import { runFlow, type RunReport } from './run-flow.ts';
import fanoutJoin from '../spec/examples/valid/fanout-join.flow.json' with { type: 'json' };
import routedAway from '../spec/examples/valid/p1-routed-away.flow.json' with { type: 'json' };
// **Local to `examples/`, and that is [Q44](../doc/open-questions.md) again.** The
// corpus cannot express an `optional` branch node with no `on: ["failed"]` edge —
// the only shape that reaches `branch.lost` by SETTLING — so W4 defined one in
// `test/matrix/` and W5 defines one here. Second occurrence; the register row says
// a gap re-found by every later item is the signal, and this is that.
import optionalLoss from './flows/optional-loss.flow.json' with { type: 'json' };
// W6's two, and the same [Q44](../doc/open-questions.md) reasoning: the corpus has
// no flow whose branch is a NON-optional task that fails (the only road to
// `user_action`), and none whose task returns a value `structuredClone` refuses.
import suspendResume from './flows/suspend-resume.flow.json' with { type: 'json' };
import uncloneable from './flows/uncloneable.flow.json' with { type: 'json' };
import failureEdge from '../spec/examples/valid/failure-edge.flow.json' with { type: 'json' };

/**
 * The corpus's `isLowConfidence`, registered for real. It reads the **effective
 * outcome** (`OR-R9`), so it sees one shape whether the node settled or a human
 * resolved it.
 */
const isLowConfidence: Predicate = (ctx) => {
  const r = ctx.outcome.result as { confidence?: number } | null;
  return typeof r?.confidence === 'number' && r.confidence < 0.5;
};
const predicates = new Map<string, Predicate>([['isLowConfidence', isLowConfidence]]);

interface Expectation {
  key: string;
  definition: FlowDefinition;
  policyId: 'arrival-count' | 'live-token';
  payload: { confidence: number };
  threaded: boolean;
  /** From `spec/run-state.md` section 3. */
  outcome: RunOutcome;
  /** From `spec/task-id.md`, in dispatch order. */
  dispatched: string[];
  /** From ADR 0003's matrix: did the driver route out of the join. */
  joined: boolean | null;
  /** From `spec/join-policy.md` section 2 — how each branch left its region. */
  settled: Record<string, 'arrived' | 'exited' | 'lost'>;
  why: string;

  // --- W6's rows need three things W5's did not ---
  /** `null` when the flow has no fan-out, and then `regions` must be empty. */
  regionId?: string | null;
  /**
   * Dispatched ids this row expects to have **no** effective outcome. Empty
   * everywhere but the refusal row, where `OR-R6` throws at the listener boundary
   * and therefore writes no record at all.
   */
  unsettled?: string[];
  /** A substring the single reported `onRunFailure` must contain. Absent = none expected. */
  runFailure?: string;
  /** Branch paths this row's "human" resolves when they suspend. */
  resolveOnSuspend?: Record<string, { as: 'done' | 'failed'; result?: unknown; actor: string }>;
  /** Overrides the harness default. Set only where the backstop is the expected result. */
  backstopMs?: number;
  /** Outcomes the run must have passed through, even if it did not end in them. */
  outcomesSeen?: string[];
  /**
   * **This row's run is expected NOT to finish**, and reaching the backstop is
   * its result rather than its failure. True only for a run parked on a person
   * that nobody resolves — `RN-R12` makes `awaiting_action` non-terminal because
   * such a run genuinely is not over, and asserting otherwise would be asserting
   * the opposite of the rule.
   */
  expectBackstop?: true;
}

const FJ = fanoutJoin as unknown as FlowDefinition;
const RA = routedAway as unknown as FlowDefinition;
const OL = optionalLoss as unknown as FlowDefinition;
const SR = suspendResume as unknown as FlowDefinition;
const UC = uncloneable as unknown as FlowDefinition;
const FE = failureEdge as unknown as FlowDefinition;

const HIGH = { confidence: 0.9 };
const LOW = { confidence: 0.1 };

const EXPECTED: Expectation[] = [
  {
    key: 'fanout-join / live-token',
    definition: FJ, policyId: 'live-token', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r1:ingest:-:0', 'r1:scoreA:0:0', 'r1:scoreB:1:0', 'r1:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'both branches arrive; the live count reaches zero having been positive (JP section 3)',
  },
  {
    key: 'fanout-join / arrival-count',
    definition: FJ, policyId: 'arrival-count', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r2:ingest:-:0', 'r2:scoreA:0:0', 'r2:scoreB:1:0', 'r2:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'the control row — N=2 arrivals of 2. ADR 0003 all-arrive: the two policies MUST agree here',
  },
  {
    key: 'p1-routed-away high / live-token',
    definition: RA, policyId: 'live-token', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r3:ingest:-:0', 'r3:scoreA:0:0', 'r3:scoreB:1:0', 'r3:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'isLowConfidence is FALSE at 0.9, so scoreB takes the default edge to the join',
  },
  {
    key: 'p1-routed-away high / arrival-count',
    definition: RA, policyId: 'arrival-count', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r4:ingest:-:0', 'r4:scoreA:0:0', 'r4:scoreB:1:0', 'r4:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'same flow, same predicate, false — arrival-counting is correct whenever every branch arrives',
  },
  {
    key: 'p1-routed-away LOW / live-token',
    definition: RA, policyId: 'live-token', payload: LOW, threaded: true,
    outcome: 'completed',
    dispatched: ['r5:ingest:-:0', 'r5:scoreA:0:0', 'r5:scoreB:1:0', 'r5:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'exited' },
    why: 'P1 CASE. branch 1 reaches `abandoned`; branch.exited decrements, the count reaches zero, ' +
      'the join fires and publish is dispatched (ADR 0003 routed-away)',
  },
  {
    key: 'p1-routed-away LOW / arrival-count',
    definition: RA, policyId: 'arrival-count', payload: LOW, threaded: true,
    outcome: 'stuck',
    // **Four ids, not five.** `publish` is NEVER dispatched, and that absence is
    // the whole finding: it is also why the fold needed `joinSettled` rather than
    // being able to read the answer off `regions` (ADR 0015).
    dispatched: ['r6:ingest:-:0', 'r6:scoreA:0:0', 'r6:scoreB:1:0'],
    joined: null,
    settled: { '0': 'arrived', '1': 'exited' },
    why: 'P1 CASE, and the policy that loses. N is fixed at 2 and only one branch ever arrives, so ' +
      'the join waits forever with nothing queued and nothing running. Run state says stuck ' +
      '(RN-R10); at spec/run-state.md v0.2 it said completed',
  },
  {
    key: 'optional-loss / live-token',
    definition: OL, policyId: 'live-token', payload: HIGH, threaded: true,
    outcome: 'failed',
    dispatched: ['r7:ingest:-:0', 'r7:scoreA:0:0', 'r7:flaky:1:0', 'r7:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'lost' },
    why: 'ADR 0003s SECOND mechanism, and the ordinary one: an `optional` task fails, no edge opts ' +
      'into `failed`, the branch is LOST and the count still reaches zero — so the join fires and ' +
      'the run reaches its `end`. `failed` outranks `completed` because a path ended with no ' +
      'eligible edge (RN-R10s neighbour in section 3)',
  },
  {
    key: 'optional-loss / arrival-count',
    definition: OL, policyId: 'arrival-count', payload: HIGH, threaded: true,
    outcome: 'stuck',
    dispatched: ['r8:ingest:-:0', 'r8:scoreA:0:0', 'r8:flaky:1:0'],
    joined: null,
    settled: { '0': 'arrived', '1': 'lost' },
    why: 'the row that matters most: NO decision, NO routing away, just a task that failed. ' +
      'Arrival-counting hangs anyway, which is ADR 0003s finding that the sharp edge is the ' +
      'common case. `stuck` outranks `failed` — the run did not merely fail, it will not finish',
  },
  {
    key: 'failure-edge / routes on',
    definition: FE, policyId: 'live-token', payload: HIGH, threaded: false,
    regionId: null,
    outcome: 'completed',
    // One task, and one only: `quarantine` is an `end`, and an `end` dispatches
    // nothing. `review` and `publish` are never reached.
    dispatched: ['r9:extract:-:0'],
    joined: null, settled: {},
    why: 'W6 row 1 — a failure that ROUTES, the one definition feature no L6 flow reached. ' +
      '`extract` is optional and throws, so it settles `failed`; its FIRST edge opts into ' +
      '`failed` and goes to the `quarantine` end. The path ended AT AN END NODE, so the run is ' +
      '`completed` and not `failed` — spec/run-state.md section 3, and the case W2s conformity ' +
      'pass found the code getting wrong',
  },
  {
    key: 'suspend / resolve / resume',
    definition: SR, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r10:ingest:-:0', 'r10:scoreA:0:0', 'r10:needsAPerson:1:0', 'r10:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    // The same throwing worker as `optional-loss`, on a node that is NOT
    // `optional` — so the scheduler ends it `user_action` rather than `failed`.
    // One worker, two outcomes, chosen by the definition.
    resolveOnSuspend: { '1': { as: 'done', result: { confidence: 0.9 }, actor: 'a-person' } },
    outcomesSeen: ['awaiting_action'],
    why: 'W6 row 2 — the whole human-in-the-loop half, and the only inbound API the library has. ' +
      'The branch suspends (ADR 0007 rule 2), the join keeps waiting because `branch.suspended` ' +
      'decrements nothing, run state is `awaiting_action` (RN-R7), a person resolves it `done`, ' +
      'and RN-R9 makes the resumed branch indistinguishable from one that settled that way — so ' +
      'it ARRIVES and the join fires',
  },
  {
    key: 'suspend / nobody comes',
    definition: SR, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'awaiting_action',
    // **Three, not four.** The join never fires, because a suspended branch is
    // still live and `branch.suspended` decrements nothing — so `publish` is
    // never dispatched. That is the same shape as the `arrival-count` rows and it
    // is NOT the same thing, which is the entire point of this row.
    dispatched: ['r11:ingest:-:0', 'r11:scoreA:0:0', 'r11:needsAPerson:1:0'],
    joined: null,
    settled: { '0': 'arrived' },
    unsettled: ['r11:needsAPerson:1:0'],
    outcomesSeen: ['awaiting_action'],
    expectBackstop: true,
    backstopMs: 400,
    why: 'W6 row 4 — the row that separates WAITING ON A PERSON from STUCK, which ADR 0003 and ' +
      'ADR 0015 both lean on and which no L6 row demonstrated. Same flow as row 2 with nobody to ' +
      'resolve it: the join has not fired and never will unaided, and run state says ' +
      '`awaiting_action` rather than `stuck` — RN-R10 sits BELOW awaiting_action for exactly this ' +
      'case. It is also the only row that ends with a node still `suspended`, which is what makes ' +
      'the effective-outcome mapping falsifiable',
  },
  {
    key: 'uncloneable / OR-R6',
    definition: UC, policyId: 'live-token', payload: HIGH, threaded: false,
    regionId: null,
    outcome: 'stopped',
    dispatched: ['r12:merge:-:0'],
    joined: null, settled: {},
    // **`OR-R6` writes no record.** `normalizeEvent` throws before anything is
    // appended, so the task is dispatched and has no effective outcome — the one
    // place in the gate where Q32's property legitimately does not hold.
    unsettled: ['r12:merge:-:0'],
    runFailure: 'UncloneableResult',
    why: 'W6 row 3 — a refusal that stops a run, on a real scheduler. The worker returns a ' +
      'function; from an INLINE pool it reaches the driver intact and our own structuredClone ' +
      'refuses it (Q61). OR-R6, caught at the listener boundary, reported through onRunFailure ' +
      'and NOT thrown — because dispatchEvent discards a listener throw — and RN-R8 makes the ' +
      'run `stopped` whatever its nodes say',
  },
];

// --- assertions ---------------------------------------------------------------

const failures: string[] = [];
let passed = 0;

const check = (row: string, what: string, actual: unknown, expected: unknown): void => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else failures.push(`${row}\n      ${what}\n      expected: ${e}\n      actual:   ${a}`);
};
const assertThat = (row: string, what: string, cond: boolean, detail = ''): void => {
  if (cond) passed++;
  else failures.push(`${row}\n      ${what}${detail ? `\n      ${detail}` : ''}`);
};

const reports: RunReport[] = [];
/** Per row: key, shape, assertions actually run, and how many are row-specific extras. */
const rowCosts: [string, string, number, number][] = [];

for (const [i, e] of EXPECTED.entries()) {
  const report = await runFlow({
    definition: e.definition,
    policy: POLICIES[e.policyId],
    runId: `r${i + 1}`,
    payload: e.payload,
    predicates,
    threaded: e.threaded,
    delayMs: 5,
    resolveOnSuspend: e.resolveOnSuspend,
    // Short only for the row whose result IS the backstop. Nothing can change
    // after the branch suspends, so a longer wait would measure the same thing
    // more slowly — and if it were ever too short the row fails loudly, with the
    // outcome reading `running` rather than `awaiting_action`.
    backstopMs: e.backstopMs,
  });
  reports.push(report);
  const before = passed + failures.length;

  // The backstop is not a result. Reaching it means the run neither finished nor
  // reached a terminal outcome, and every row below is then meaningless.
  // **The wait ended BECAUSE `isTerminal(state)` fired, not because a clock did.**
  // `!timedOut` alone does not say that: a harness whose wait ends on a 1 ms timer
  // sets no flag and still reports every value correctly, because
  // `scheduler.shutdown()` drains the run before the report is built. That
  // mutation survived every assertion here until this line existed.
  const wantFinish = e.expectBackstop ? 'backstop' : 'run-state';
  assertThat(e.key,
    e.expectBackstop
      ? 'RN-R12: the run did NOT finish, because it is parked on a person'
      : 'RN-R12: the wait ended because the run-state outcome became terminal',
    report.finishedBy === wantFinish,
    `finishedBy=${report.finishedBy}, wall ${report.wallMs}ms, outcome ${report.state.outcome}`);
  if (report.finishedBy !== wantFinish) continue;

  check(e.key, 'run-state outcome — spec/run-state.md section 3', report.state.outcome, e.outcome);
  check(e.key, 'dispatched task ids, in order — spec/task-id.md', [...report.dispatched], e.dispatched);
  if (e.regionId === null) {
    // A flow with no fan-out enters no region, and `RN-R10` must therefore not
    // be able to call it `stuck` — which is the clause a fan-out-free flow
    // exists to hold down.
    check(e.key, 'a flow with no fan-out enters no region', Object.keys(report.state.regions), []);
  } else {
    check(e.key, 'the join fired — RN-R11', report.state.regions['split']?.joined ?? null, e.joined);
    check(e.key, 'how each branch left its region — spec/join-policy.md section 2',
      report.state.regions['split']?.settled, e.settled);
  }

  // **Q32 — every dispatched node produces an outcome record.** Cheap insurance
  // since 0.3.0's `_failOrphanedTask` rather than the validity gate P1 wrote it
  // as, and it is the assertion no fixture can make: it is about the scheduler
  // actually settling what it accepted.
  //
  // **Asserted against the scheduler's own events, not against the driver's
  // record of them.** `report.settled` is built by calling
  // `driver.terminalStateOf`, so an assertion over it alone is an assertion about
  // the code it exists to check — section 5 rule 4, found by W5's test-adequacy
  // pass, which replaced `terminalStateOf` with the constant `'done'` and watched
  // this pass. The two sources must agree, and both must cover every dispatch.
  //
  // **W6 added the exception, and it is a real one rather than a loosening.**
  // `OR-R6` throws at the listener boundary *before* anything is appended, so a
  // task can be dispatched, settle at the scheduler, and have no record here. A
  // row that expects that must SAY which id and why; every other row still
  // expects none, so the assertion did not get weaker.
  const unsettled = report.dispatched.filter((id) => report.settled[id] === null);
  check(e.key, 'Q32: the driver has an effective outcome for every dispatched task, except as declared',
    unsettled, e.unsettled ?? []);
  const unheard = report.dispatched.filter((id) => !report.settledByScheduler.includes(id));
  assertThat(e.key, 'Q32: and the SCHEDULER reported a settlement event for every one of them',
    unheard.length === 0, unheard.length ? `no event seen: ${unheard.join(', ')}` : '');
  check(e.key, 'Q32: the two sources agree on which ids settled',
    [...report.settledByScheduler].sort(), [...report.dispatched].sort());
  // And the two paths through the driver's own data agree on WHAT each settled
  // as: `settled` comes from `effectiveOutcomeOf`, `nodes` from folding the
  // sequence. Without this, replacing `terminalStateOf` with the constant
  // `'done'` survived — because until the `optional-loss` rows existed, **no L6
  // task settled as anything but `done`**, so no assertion could tell a constant
  // from the truth. Found by W5's test-adequacy pass.
  //
  // `running` and `suspended` both mean *not settled*, and `effectiveOutcome`
  // returns `null` for each — for `suspended` because a node parked on a person
  // has not finished and nothing routes (`spec/outcome-record.md` section 7). The
  // mapping is that rule, written out.
  const asTerminal = (st: string | undefined) =>
    st === undefined || st === 'running' || st === 'suspended' ? null : st;
  check(e.key, 'the effective outcome and the folded node state agree, per task',
    report.settled,
    Object.fromEntries(report.dispatched.map((id) => [id, asTerminal(report.state.nodes[id]?.state)])));

  // `ID-R1` at L6 — the only rung where the ids the driver mints reach the
  // scheduler's real task map, which is what `spec/task-id.md` section 2 is about.
  assertThat(e.key, 'ID-R1: every dispatched id is distinct',
    new Set(report.dispatched).size === report.dispatched.length);

  // `RN-R4` — a node in `nodes` was dispatched, and every dispatched node is there.
  check(e.key, 'RN-R4: `nodes` holds exactly the dispatched task ids',
    Object.keys(report.state.nodes).sort(), [...report.dispatched].sort());

  // **ADR 0014's redundancy, checked rather than trusted.** `snapshot()` is
  // defined as the record-kind subsequence of `foldInputs()`; the driver keeps
  // two arrays and a drift between them would be silent.
  const fromInputs = report.inputs
    .filter((x) => x.kind === 'outcome' || x.kind === 'resolution')
    .map((x) => (x as { record: { taskId: string } }).record.taskId);
  check(e.key, 'ADR 0014: snapshot() is exactly the record-kind subsequence of foldInputs()',
    fromInputs, report.log.map((r) => r.taskId));

  if (e.runFailure) {
    assertThat(e.key, `OR-R10: exactly one run failure, naming ${e.runFailure}`,
      report.failures.length === 1 && report.failures[0]!.includes(e.runFailure),
      report.failures.join('; ') || '(none reported)');
  } else {
    assertThat(e.key, 'no run failure and no unsatisfiable join was reported',
      report.failures.length === 0, report.failures.join('; '));
  }

  // **RN-R12, checked rather than assumed.** A terminal outcome means no more
  // input is coming; an input that arrives after the run was declared finished
  // means the predicate was read at a point that was not quiescent. W5's own
  // mutation sweep found that removing the microtask boundary survived every
  // other assertion here, because `scheduler.shutdown()` happened to take long
  // enough to hide it.
  assertThat(e.key, 'RN-R12: nothing arrived after the run was declared finished',
    report.lateInputs.length === 0, `late: ${report.lateInputs.join(', ')}`);

  // **An outcome the run passed THROUGH.** `awaiting_action` is durable — a
  // branch parked on a person — but a run that is then resolved ends
  // `completed`, so the final state does not record that it happened. Asserted
  // as an inclusion only; see `RunReport.outcomesSeen` for why an exclusion
  // would not be sound.
  for (const want of e.outcomesSeen ?? []) {
    assertThat(e.key, `the run passed through \`${want}\` on its way to ${e.outcome}`,
      report.outcomesSeen.includes(want as RunOutcome),
      `saw: ${report.outcomesSeen.join(', ')}`);
  }
  // The human actually acted. Without this the row would pass if the branch
  // suspended and the resolution silently never fired — the run would then hit
  // the backstop, but `finishedBy` is the only thing that would say so.
  check(e.key, 'the inbound step resolved exactly the branches the row declares',
    [...report.resolved].sort(),
    Object.entries(e.resolveOnSuspend ?? {}).map(([b]) =>
      `r${i + 1}:${(e.definition.nodes.find((n) => n.kind === 'fanout')?.branches ?? [])[Number(b)]}:${b}:0`).sort());

  // **`branchesOverlapped` is REPORTED and not asserted, deliberately.** Whether
  // two branches are in flight at the same instant is a timing property the spec
  // does not fix, and W5 measured it varying run to run on the same machine — so
  // asserting it would be a test that flakes in CI and nowhere else, which
  // `doc/workflow.md` section 5 rule 5 forbids for exactly this reason. It is a
  // column in the table below instead, and the cost is named in the Record: the
  // `threaded` and `delayMs` knobs have no assertion behind them.

  rowCosts.push([e.key, e.regionId === null ? 'no-region' : 'region',
    passed + failures.length - before, (e.outcomesSeen ?? []).length]);
}

// --- cross-row assertions, which are where the finding lives -------------------

const byRun = (prefix: string) => reports.find((r) => r.runId === prefix);
const low = byRun('r5');
const lowAc = byRun('r6');
const highRouted = byRun('r3');

if (low && lowAc) {
  // **ADR 0015's motivating claim, asserted rather than argued.** The two runs
  // are the same flow, the same payload and the same workers; `regions` apart
  // from `joined` is identical, and only `joined` — and therefore the outcome —
  // differs. Q43's register entry said `regions` already held the data to tell
  // them apart. This is the assertion that says it did not.
  check('cross-row', 'RN-R6: the two policies agree on WHAT HAPPENED in the region',
    { opened: low.state.regions['split']?.opened, settled: low.state.regions['split']?.settled },
    { opened: lowAc.state.regions['split']?.opened, settled: lowAc.state.regions['split']?.settled });
  check('cross-row', 'RN-R11: and disagree only on whether the driver routed out of the join',
    [low.state.regions['split']?.joined, lowAc.state.regions['split']?.joined], [true, null]);
  assertThat('cross-row',
    'ADR 0015: at spec/run-state.md v0.2 both of these folded to completed; they no longer do',
    low.state.outcome === 'completed' && lowAc.state.outcome === 'stuck',
    `${low.state.outcome} / ${lowAc.state.outcome}`);

  // Q41's own point: the sequence exists and carries the kinds nothing produced.
  const kinds = new Set(lowAc.inputs.map((i) => i.kind));
  assertThat('cross-row', 'Q41: the sequence carries pathEnded, which had no producer anywhere',
    kinds.has('pathEnded'), `kinds seen: ${[...kinds].sort().join(', ')}`);
  assertThat('cross-row', 'Q41: and dispatched, which had no channel at all',
    kinds.has('dispatched'));
}

// The predicate has to be able to return both answers, or the routed-away rows
// prove only that a constant is constant (`doc/workflow.md` section 5 rule 3).
assertThat('cross-row', 'isLowConfidence returned FALSE at 0.9 and TRUE at 0.1 — it can fail',
  highRouted?.state.regions['split']?.settled['1'] === 'arrived' &&
    low?.state.regions['split']?.settled['1'] === 'exited',
  `high: ${highRouted?.state.regions['split']?.settled['1']}, ` +
  `low: ${low?.state.regions['split']?.settled['1']}`);

// --- the table a person looks at ----------------------------------------------

const runtime = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined'
  ? `deno ${(globalThis as unknown as { Deno: { version: { deno: string } } }).Deno.version.deno}`
  : `node ${(globalThis as unknown as { process: { versions: { node: string } } }).process.versions.node}`;

const w = (s: string, n: number) => s.padEnd(n).slice(0, n);
// The count is derived, not typed: this line said "six" for two rows longer than
// it was true, which is the smallest possible version of the thing this whole
// review pass was about.
console.log(`\n  ladder L6 — ${reports.length} real runs on fyflow-scheduler 0.3.0, on ${runtime}\n`);
console.log(`  ${w('run', 36)}${w('outcome', 11)}${w('join', 7)}${w('branches', 22)}${w('tasks', 6)}${w('ms', 6)}overlap`);
console.log(`  ${'-'.repeat(94)}`);
for (const [i, r] of reports.entries()) {
  const region = r.state.regions['split'];
  const branches = region
    ? Object.entries(region.settled).map(([b, s]) => `${b}:${s}`).join(' ')
    : '-';
  const joined = region === undefined ? '-' : region.joined === null ? 'never' : String(region.joined);
  console.log(
    `  ${w(EXPECTED[i]!.key, 36)}${w(r.state.outcome, 11)}${w(joined, 7)}` +
    `${w(branches, 22)}${w(String(r.dispatched.length), 6)}${w(String(r.wallMs), 6)}` +
    `${r.branchesOverlapped ? 'yes' : 'no'}`,
  );
}

// Where each row's expected values came from. Printed so the human artifact
// carries its own derivation: `doc/workflow.md` section 5 rule 1 — expected
// values come from the spec, and a reader should not have to take that on trust.
console.log('\n  why each row reads as it does:');
for (const e of EXPECTED) console.log(`    ${w(e.key, 36)}${e.why}`);

// **An assertion-count floor, because a skipped assertion reports as a pass.**
// `doc/workflow.md` section 1 rule 4 at assertion granularity: W5's test-adequacy
// pass turned the per-row `continue` into an unconditional one and watched this
// file print `24 assertions, 0 failed` — 48 assertions silently gone, exit 0. Same
// for the cross-row block, which is where ADR 0015's motivating claim lives.
//
// The total is derived from two declared constants rather than typed as one
// number, so adding an assertion to the loop updates it in one place. What it pins
// is that **every row ran the whole block**.
// **Shape-aware since W6**, because the rows are no longer uniform: a flow with no
// fan-out asserts one thing about `regions` where a fan-out asserts two, and a row
// may declare extra `outcomesSeen` assertions. So the floor is per-row and derived,
// and it is checked TWO ways — every row ran what its shape says, and the total is
// what this file declares. Either alone misses a uniform reduction.
const PER_REGION_ROW = 15;
const PER_PLAIN_ROW = 14;
const CROSS_ROW = 6;
const base = (shape: string) => (shape === 'region' ? PER_REGION_ROW : PER_PLAIN_ROW);
for (const [key, shape, cost, extras] of rowCosts) {
  if (cost !== base(shape) + extras) {
    failures.push(`gate\n      ${key} ran ${cost} assertions, not ${base(shape) + extras}` +
      ` (${shape}, +${extras} declared extra) — a block was skipped`);
  }
}
if (rowCosts.length !== EXPECTED.length) {
  failures.push(`gate\n      ${rowCosts.length} of ${EXPECTED.length} rows completed their assertion block`);
}
const EXPECTED_TOTAL =
  rowCosts.reduce((n, [, shape, , extras]) => n + base(shape) + extras, 0) + CROSS_ROW;
if (passed + failures.length !== EXPECTED_TOTAL) {
  failures.push(
    'gate\n      the assertion count is not what this file declares — a block was skipped\n' +
      `      expected: ${EXPECTED_TOTAL}\n` +
      `      actual:   ${passed + failures.length}`,
  );
}

console.log(`\n  ${passed + failures.length} assertions, ${failures.length} failed`);
if (failures.length) {
  console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n\n') + '\n');
  exit(1);
}
console.log('  all passed\n');

function exit(code: number): never {
  const g = globalThis as Record<string, any>;
  if (g.Deno) g.Deno.exit(code);
  g.process.exit(code);
  throw new Error('unreachable');
}
