/**
 * **The chain nothing runs** —
 * [W15](../../doc/work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md)'s
 * third declared output, and ladder **L2**: a fake scheduler, no workers.
 *
 * A policy says `unsatisfiable`; four links later a consumer reads
 * `RunState.outcome === 'stuck'`. **Every link already had a test and nothing ran
 * them as one sequence:**
 *
 * | link | where it was already asserted |
 * |---|---|
 * | the driver **reports** with the policy's own `describe` | `test/driver/driver.test.ts:389`, from a stub policy |
 * | `foldInputs()` gains `joinSettled(fired: false)` | `test/driver/fold-inputs.test.ts:176`, from a different stub |
 * | the fold reads that as `joined: false` and `stuck` | `test/fold/stuck.test.ts:108`, from a **hand-built** input array |
 * | and the join's successor is never dispatched | nowhere, for a real policy |
 *
 * **Those three tests stay.** This does not replace them; it connects them, with
 * one run, one driver and one policy — and with a policy that is a *candidate*
 * (`JP-R8`'s variant, which ADR 0025 may adopt) rather than a stub written to
 * make an unreachable line reachable. `test/fold/stuck.test.ts:108` in particular
 * folds an array assembled by hand: it proves the fold's arithmetic and says
 * nothing about whether any driver ever produces that array.
 *
 * ---
 *
 * **Two sources of truth meet here for the first time, and they must not be
 * conflated.** Each assertion below says which one it reads:
 *
 *   - **the DRIVER's public surface** — `dispatchedIds()`, `snapshot()`,
 *     `terminalStateOf()`, `joinStatusOf()`. `Cell.verdict` is computed from
 *     these by `verdictOf` in `run.ts`, and **the matrix has printed `stuck` in a
 *     column for the whole of P1 with the fold never involved.**
 *   - **the FOLD** — `fold(driver.foldInputs()).outcome`, which is
 *     `spec/run-state.md` section 3's precedence over ADR 0014's input sequence.
 *
 * They are different computations over different inputs and nothing has ever
 * compared them. That they agree on this row is an assertion here, not an
 * assumption.
 */
import { equal, ok, suite } from '../harness.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { fold, isTerminal } from '../../src/fold/run-state.ts';
import { allRegions, branchPathOf, buildGraph } from '../../src/definition/regions.ts';
import { driveScenario, runCell } from './run.ts';
import { NESTED_SCENARIOS, SCENARIOS } from './scenarios.ts';
// **`liveTokenRequiringArrival` comes from `src/` since ADR 0025**, not from
// `./variants.ts` where W15 found it. The chain this file drives is now a SHIPPED
// policy's chain — same object, same 36 cells, one import line.
import { liveTokenRequiringArrival } from '../../src/fold/policies.ts';
import { MATRIX_COLUMNS } from './variants.ts';

/**
 * `all-exit` — every branch reaches an `end` and nothing arrives at the join.
 * **The only row in this repository where a policy can say `unsatisfiable` at
 * all**, and the exact row
 * [ADR 0003](../../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
 * records as `live-token`'s cost.
 */
const ALL_EXIT = SCENARIOS.find((s) => s.key === 'all-exit')!;
const REGION = 'split';
const JOIN = 'collect';
/** The task the join routes to when it fires. Its dispatch IS "the join fired". */
const SUCCESSOR = ALL_EXIT.downstream;

const drive = (policy: JoinPolicy) => driveScenario(ALL_EXIT, policy);

suite('L2 — from `unsatisfiable` to `stuck`, in one run', (test) => {
  test('link 1 — the driver reports ONCE, carrying the policy`s own describe', () => {
    // Reads: the callback. `spec/join-policy.md` section 4 — on `unsatisfiable`
    // the driver **reports it with the policy's own `describe`**.
    //
    // The expected value is derived, not observed: at the end of this row the
    // variant's state is `live: 0` (two opened, two exited), `positive: true`
    // (a branch did open), `arrived: 0` (nothing reached the join) — which is
    // precisely the state its one line reads to answer `unsatisfiable`.
    const { unsatisfiable } = drive(liveTokenRequiringArrival as JoinPolicy);
    equal(unsatisfiable, [{
      fanoutId: REGION,
      // The region INSTANCE — `split` opens at top level, so `'-'` (W84, ADR 0062).
      regionPath: '-',
      joinId: JOIN,
      describe: { live: 0, positive: true, arrived: 0 },
      policyId: 'live-token-requiring-arrival',
    }], 'once, with the region, the join, the policy that said it, and WHAT it was waiting for. ' +
        'A report that carried a driver-invented summary instead of the policy`s own describe ' +
        'would leave a consumer unable to tell which of four columns produced it');
  });

  test('link 1a — the describe is the policy`s, and no other column produces its shape', () => {
    // The half that makes the above a test of *whose* account it is. `live` and
    // `arrived` are this policy's state fields; `arrival-count`'s describe is
    // `{need, arrived}` and shipped `live-token`'s is `{live, positive}`. A
    // driver that summarised the join itself could not produce this object.
    const { driver, unsatisfiable } = drive(liveTokenRequiringArrival as JoinPolicy);
    const reported = unsatisfiable[0]!.describe as Record<string, unknown>;
    equal(Object.keys(reported).sort(), ['arrived', 'live', 'positive'],
      'the variant`s own three fields — JP-R2: `describe` is the ONLY way a policy`s state ' +
      'leaves it (JP-R1 makes S opaque), so this is what a UI or an operator would see');

    // **Recomputed independently: the POLICY, stepped over the DRIVER'S OWN
    // event stream.** Reading `driver.foldInputs()` rather than the harness's
    // `events` array, and stepping the policy here rather than asking the driver
    // what it got — so this is a different channel from link 1's callback at both
    // ends. W15's adequacy reader is why: the previous form compared the
    // callback's value to a hand-written literal, and a harness that fabricated
    // that literal (T7) satisfied both this and link 1.
    let state = liveTokenRequiringArrival.open({
      fanoutId: REGION, joinId: JOIN, branches: ['scoreA', 'reviewB'], members: [],
    });
    for (const i of driver.foldInputs()) {
      if (i.kind === 'region' && i.event.regionId === REGION) {
        state = liveTokenRequiringArrival.step(state, i.event);
      }
    }
    equal(liveTokenRequiringArrival.status(state), 'unsatisfiable',
      'stepping the policy over the driver`s own recorded event stream reaches the same answer, ' +
      'so the driver forwarded the region events it recorded — JP-R1 purity is what makes this a ' +
      'valid re-derivation rather than a second guess');
    equal(reported, liveTokenRequiringArrival.describe(state),
      'and the reported describe is what THAT state produces. Two channels — the callback and ' +
      '`foldInputs()` — and the policy applied by this test rather than by the driver');

    // And a third, which the harness does not touch at all: the poll.
    equal(driver.joinStatusOf(REGION),
      { status: 'unsatisfiable', describe: liveTokenRequiringArrival.describe(state) },
      '`joinStatusOf` reports the same status and the same describe — compared against the ' +
      'RECOMPUTED state rather than against what the callback handed us, so the poll and the ' +
      'callback are two independent reads. Section 4 gives the driver two outbound channels for ' +
      'one fact and nothing had asserted they agree');
  });

  test('link 2 — foldInputs() records the join settling WITHOUT routing', () => {
    // Reads: the driver's fold-input sequence (ADR 0014). `ADR 0015` rule 2 —
    // the join is settled and it did NOT fire.
    const { driver } = drive(liveTokenRequiringArrival as JoinPolicy);
    const settled = driver.foldInputs().filter((i) => i.kind === 'joinSettled');
    equal(settled, [{ kind: 'joinSettled', regionId: REGION, regionPath: '-', joinId: JOIN, fired: false }],
      'exactly one, and `fired: false`. Without this input a permanently stuck run and a ' +
      'completed one are the SAME fold — which is what ADR 0015 was written for');
  });

  test('link 2a — and it is appended after both branches finish, and nothing after it', () => {
    // The ordering the sequence has to have for the fold to be total over any
    // prefix (`RN-R2`) and still land on `stuck`: the join cannot settle before
    // the last terminal region event, and nothing may be dispatched after it.
    const { driver } = drive(liveTokenRequiringArrival as JoinPolicy);
    const seq = driver.foldInputs();
    const settledAt = seq.findIndex((i) => i.kind === 'joinSettled');
    const terminals = seq
      .map((i, n) => ({ i, n }))
      .filter(({ i }) => i.kind === 'region' && i.event.type === 'branch.exited')
      .map(({ n }) => n);
    equal(terminals.length, 2, 'both branches exited — the row`s whole premise');
    ok(settledAt > terminals[1]!,
      'and the policy was asked AFTER the last terminal event, not before it. ' +
      'spec/join-policy.md section 4: status is asked after every terminal event, because a ' +
      'join can become decidable on a branch that was lost or exited rather than one that arrived');
    ok(!seq.slice(settledAt + 1).some((i) => i.kind === 'dispatched'),
      'and NOTHING was dispatched after it. This is the assertion that would still pass if the ' +
      'driver routed out of the join *before* appending the record, which is why link 3 reads a ' +
      'different source rather than trusting the order');
  });

  test('link 3 — the join`s successor is not dispatched, read three ways', () => {
    // Reads: the DRIVER's surface, twice, and the scheduler once. Section 4 —
    // on `unsatisfiable` the driver **routes nowhere**.
    const { driver, scheduler } = drive(liveTokenRequiringArrival as JoinPolicy);
    ok(!driver.dispatchedIds().includes(SUCCESSOR),
      `the driver never dispatched ${SUCCESSOR}`);
    ok(!scheduler.added.some((t) => t.id === SUCCESSOR),
      'and the scheduler was never asked to add it — the driver`s own bookkeeping and what ' +
      'actually reached the scheduler are two different claims, and a driver that recorded a ' +
      'dispatch it never made would satisfy only the first');
    ok(!driver.foldInputs().some((i) => i.kind === 'dispatched' && i.taskId === SUCCESSOR),
      'and the fold`s input sequence carries no dispatch for it either, so all three agree');
  });

  test('link 4 — the fold reads that as `joined: false`, not `null`', () => {
    // Reads: the FOLD. `RN-R11` — `false` means a policy reported the join
    // unsatisfiable and it never will fire; `null` means neither yet. The
    // distinction is the whole of the field's reason for existing.
    const { driver } = drive(liveTokenRequiringArrival as JoinPolicy);
    const state = fold(driver.foldInputs());
    equal(Object.keys(state.regions), [REGION], 'one region was entered');
    equal(state.regions[REGION]!['-']!.joined, false,
      'the driver settled the join and did not route — not `null`, which would say "not yet"');
    equal(state.regions[REGION]!['-']!.settled, { '0': 'exited', '1': 'exited' },
      'and `RN-R6` still holds: `regions` records the EVENTS, so this is what every column ' +
      'produces on this row. `joined` is the only field a policy`s behaviour reaches that is ' +
      'DECIDABLE WITHOUT THE DEFINITION — the qualifier is load-bearing and ADR 0015`s Correction ' +
      'is what added it: the four columns also differ in `nodes` (live-token dispatches `publish` ' +
      'here and arrival-count does not) and therefore in `pathEnds`, but an absence in `nodes` is ' +
      'legible only against a flow the fold does not have and RN-R4 says it must not acquire');
  });

  test('link 5 — and the run`s outcome is `stuck`', () => {
    // Reads: the FOLD. `spec/run-state.md` section 3 and `RN-R10` — nothing
    // running, nothing suspended, and an entered region's `joined` is not `true`.
    const { driver } = drive(liveTokenRequiringArrival as JoinPolicy);
    const state = fold(driver.foldInputs());
    ok(Object.values(state.nodes).every((n) => n.state !== 'running'), 'nothing is live');
    ok(Object.values(state.nodes).every((n) => n.state !== 'suspended'), 'nobody waits on a person');
    equal(state.haltedBy, null, 'and no refusal terminated the run — `halted` outranks `stuck`');
    ok(state.pathEnds.some((e) => e.reason === 'end'),
      'a path DID end at an `end` node, so `completed` is what this would be called without ' +
      'RN-R10 — which is exactly the false statement ADR 0015 was written to remove');
    equal(state.outcome, 'stuck',
      'RN-R10: `stuck` outranks `failed` and `completed`. The join can never fire, so nothing ' +
      'downstream of it will ever be dispatched');
    ok(isTerminal(state),
      'RN-R12: and the run is FINISHED — a consumer folding incrementally stops here without a ' +
      'clock, which is the whole reason `stuck` is an outcome rather than a hang');
  });

  test('the driver`s verdict and the fold`s outcome agree — two computations, one row', () => {
    // **The conflation this file exists to refuse.** `Cell.verdict` comes from
    // `verdictOf`, which reads `dispatchedIds`, `snapshot` and `terminalStateOf`
    // and never calls `fold`. `RunState.outcome` comes from the fold and never
    // sees the driver. The matrix has reported `stuck` from the first of these
    // since P1; this is the first time anything has checked the second says so too.
    const cell = runCell(ALL_EXIT, liveTokenRequiringArrival as JoinPolicy);
    equal(cell.verdict, 'stuck', 'the DRIVER`s surface, via verdictOf');
    equal(fold(drive(liveTokenRequiringArrival as JoinPolicy).driver.foldInputs()).outcome, 'stuck',
      'and the FOLD, via spec/run-state.md section 3. Two independent computations over two ' +
      'different inputs — if they ever disagree, one of them is lying and the matrix cannot ' +
      'tell you which');
  });
});

suite('L2 — `joined: false` and `joined: null` are the same outcome', (test) => {
  test('the same row under `arrival-count` is stuck with `joined: null`', () => {
    // Reads: the FOLD. `arrival-count` waits forever on this row — N is two and
    // nothing arrives — so `settleJoin` is never reached and no `joinSettled`
    // input is appended at all.
    const { driver, unsatisfiable } = drive(arrivalCount as JoinPolicy);
    equal(unsatisfiable, [], 'section 3: `arrival-count` is NEVER unsatisfiable, so nothing is reported');
    equal(driver.foldInputs().filter((i) => i.kind === 'joinSettled'), [],
      'and the join never settled either way');
    const state = fold(driver.foldInputs());
    equal(state.regions[REGION]!['-']!.joined, null, '`null` — neither fired nor declared unfireable');
    equal(state.outcome, 'stuck', 'and the run is stuck all the same');
  });

  test('so the outcome vocabulary does not distinguish reported from silent', () => {
    // **Asserted as a SHAPE and deliberately not fixed.** `withOutcome` maps
    // `joined !== true` to `stuck`, so a run whose join was *reported*
    // unsatisfiable and one whose join is *silently* waiting forever are the same
    // outcome. Whether that should be two outcomes is a `spec/run-state.md`
    // question and W15 owns neither that file nor `src/fold/**`.
    const reported = fold(drive(liveTokenRequiringArrival as JoinPolicy).driver.foldInputs());
    const silent = fold(drive(arrivalCount as JoinPolicy).driver.foldInputs());
    equal(reported.outcome, silent.outcome,
      'one row, two policies, the same `stuck` — the difference survives ONLY in ' +
      '`regions[*].joined` and in whether `onUnsatisfiableJoin` fired');
    ok(reported.regions[REGION]!['-']!.joined !== silent.regions[REGION]!['-']!.joined,
      'and there it does survive: `false` against `null`. If this ever stopped being true the ' +
      'two runs would be indistinguishable end to end, which is the state ADR 0015 removed');
  });
});

suite('Q37 — what a consumer WITHOUT the callback can learn', (test) => {
  test('under a shipped policy there is nothing to learn from the callback at all', () => {
    // **Measured, recorded, and not fixed** — W15's fourth declared output, and
    // [Q37](../../doc/questions/q37.md). `onUnsatisfiableJoin` is optional
    // (`DriverOptions`), so the whole seam is opt-in; but on this row it is worse
    // than optional under both shipped policies, because neither ever calls it.
    // `spec/join-policy.md` section 4 calls that a result rather than a gap.
    for (const policy of [arrivalCount, liveToken]) {
      const { unsatisfiable } = drive(policy as JoinPolicy);
      equal(unsatisfiable, [],
        `${policy.id}: never reports, on the one row where a join demonstrably can never fire`);
    }
  });

  test('and the only other channel is a poll nobody is obliged to make', () => {
    // `joinStatusOf(fanoutId)` is the whole of stuck-join detection today
    // (`spec/join-policy.md` section 4). It answers when asked and announces
    // nothing — and under `arrival-count` its answer on a permanently stuck join
    // is `waiting`, which is indistinguishable from a run still in progress.
    const stuck = drive(arrivalCount as JoinPolicy);
    equal(stuck.driver.joinStatusOf(REGION), { status: 'waiting', describe: { need: 2, arrived: [] } },
      'a poll returning `waiting` forever. Nothing in the driver`s outbound surface — no ' +
      'callback, no event — distinguishes this from a branch that has not finished yet');
    equal(stuck.driver.joinStatusOf('no-such-fanout'), null,
      'and the poll needs the fanout id, so a consumer must already know which regions exist');
    // The fold DOES know, from the same run, with no poll and no callback: this
    // is what a consumer who folds `foldInputs()` gets for free, and it is the
    // argument Q37 has to weigh against adding an outbound signal.
    equal(fold(stuck.driver.foldInputs()).outcome, 'stuck',
      'while the FOLD says `stuck` from the same run — RN-R12`s quiescence predicate, no clock ' +
      'and no poll. Q37 is therefore about whether the DRIVER owes a signal the fold already ' +
      'supplies, which is why W15 records it rather than fixing it: src/driver/** is not P5`s');
  });
});

/**
 * **The two whole-matrix cross-checks, added after W15's adequacy reader.**
 *
 * They live in this file rather than in `matrix.test.ts` deliberately: this is
 * the file that goes to the **fold**, and W4 kept `Cell` on the driver's public
 * surface on purpose so a fold defect could not make a policy cell look right.
 * Whether a `Cell` should itself carry run state is [Q92](../../doc/questions/q92.md)
 * and stays open — these are assertions beside the matrix, not a widening of it.
 */
suite('L2 — the whole matrix, checked against the fold and against the scheduler', (test) => {
  // **Why this walk does NOT run over `NESTED_SCENARIOS`, measured rather than
  // assumed** (W84). Every scenario in `SCENARIOS` has ONE region and it opens at top
  // level, so `'-'` is the right instance path for all of them — which means the walk
  // below can be narrowed from region INSTANCES back to openers for ZERO, and rule
  // 8's set says so. Adding the nested rows was the obvious answer and it is WRONG:
  // it goes red on `nested-inner-lost/outer@-`, where `live-token` folds
  // `{"0":"arrived","1":"arrived"}` and `arrival-count` folds `{"0":"arrived"}`.
  //
  // **That red is right.** `RN-R6`'s premise is *two policies folded over THE SAME
  // region events*; under nesting the two policies disagree about the INNER join, and
  // `JP-R10` turns that disagreement into a `branch.lost` on the OUTER branch — so
  // the two runs do not see the same outer events. That is
  // [ADR 0030](../../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
  // rule 4's content, not a defect, and widening this claim to cover it would make it
  // false. What binds the instance keying instead is the test directly below, which
  // compares each instance's key against the DOCUMENT rather than across policies.
  const ROWS = SCENARIOS.map((scenario) => ({
    scenario,
    runs: MATRIX_COLUMNS.map((policy) => ({ policy, driven: driveScenario(scenario, policy) })),
  }));

  test('RN-R6: all four columns fold to the SAME opened, settled and suspended', () => {
    // **`RN-R6`'s first four-column test, and its first at the FOLDED level.**
    // The rule says two policies over the same region events produce the same
    // `opened`/`settled`/`suspended`, differing only in `joined` — and until now
    // the matrix asserted that on the raw event STRINGS while `fold()` ran on two
    // of thirty-six cells, both on one row.
    //
    // What that cost, measured: the driver could stop appending region events to
    // `foldInputs()` **for one policy id** and all 361 assertions passed, because
    // `Cell.events` comes from the `onRegionEvent` callback — a different channel
    // — and nothing compared the two.
    for (const { scenario, runs } of ROWS) {
      const states = runs.map(({ policy, driven }) =>
        ({ id: policy.id, state: fold(driven.driver.foldInputs()) }));
      const [first, ...rest] = states as [{ id: string; state: ReturnType<typeof fold> }, ...typeof states];
      // **Over region INSTANCES and not over openers** — W84. `regions` is two-level
      // since ADR 0062, so the pair `(openerId, openerPath)` is what `RN-R6`
      // quantifies over; iterating openers alone would compare the inner RECORDS and
      // pass on any two states whose instance sets happen to have the same keys.
      const instances = Object.entries(first.state.regions)
        .flatMap(([id, byPath]) => Object.keys(byPath).map((rp) => [id, rp] as const));
      // **The walk asserts it COMPARED something** — rule 8's set found that narrowing
      // the instance list makes `shape()` return `null` on BOTH sides, so the loop
      // compares `null` to `null` and is vacuous exactly when it is wrong (W84).
      ok(instances.length > 0, `${scenario.key}: the instance list is not empty`);
      for (const [regionId, regionPath] of instances) {
        const shape = (st: ReturnType<typeof fold>) => {
          const r = st.regions[regionId]?.[regionPath];
          return r ? { opened: r.opened, settled: r.settled, suspended: r.suspended } : null;
        };
        ok(shape(first.state) !== null,
          `${scenario.key}/${regionId}@${regionPath}: the instance this walk names is PRESENT in ` +
          'the state it was derived from — a path that names no instance makes every comparison ' +
          'below `null` against `null`');
        for (const other of rest) {
          equal(shape(other.state), shape(first.state),
            `${scenario.key}/${regionId}@${regionPath}: ${other.id} folded to a different region shape from ` +
            `${first.id}. RN-R6 — \`regions\` records the EVENTS, not what a policy concluded, so ` +
            'the only field the four columns may differ in is `joined`');
        }
      }
    }
  });

  test('and they differ in `joined` exactly where the policies differ', () => {
    // The other half of `RN-R6`, and `RN-R11`: `joined` IS reachable by a
    // policy's behaviour. Without this the assertion above is satisfied by a
    // fold that produced nothing at all for every column.
    const joined = ROWS.map(({ scenario, runs }) => [scenario.key, runs.map(({ policy, driven }) =>
      `${policy.id}=${String(fold(driven.driver.foldInputs()).regions['split']?.['-']?.joined)}`)] as const);
    const allExit = joined.find(([k]) => k === 'all-exit')![1];
    equal(allExit, [
      'arrival-count=null',
      'live-token=true',
      'arrival-count-decrementing=true',
      'live-token-requiring-arrival=false',
    ], 'all three values of `joined` on one row, from four policies over one event stream: ' +
       '`null` never settled, `true` the driver routed out, `false` a policy said it never will. ' +
       'RN-R11 is the only field that carries this and ADR 0015 is why it costs a field');
    const allArrive = joined.find(([k]) => k === 'all-arrive')![1];
    ok(allArrive.every((x) => x.endsWith('=true')),
      'and on the control row every column fires, so `joined` is not simply tracking the policy id');
  });

  test('every dispatch the driver recorded actually reached the scheduler', () => {
    // **The two-channel check `Cell` cannot make.** `Cell.joinFired` is read from
    // the fake scheduler's `added` list, and it drives the per-row assertion on
    // all 36 cells, `verdictOf`, the `fired.length === 22` count and the payload
    // loop. W15's adequacy reader re-sourced it from `driver.dispatchedIds()` and
    // **nothing failed** — so across 36 cells nothing checked that a fired join's
    // dispatch left the driver at all.
    for (const { scenario, runs } of ROWS) {
      for (const { policy, driven } of runs) {
        equal([...driven.driver.dispatchedIds()].sort(), driven.scheduler.added.map((t) => t.id).sort(),
          `${scenario.key}/${policy.id}: the driver's own dispatch record and what reached the ` +
          'scheduler disagree. These are two claims, not one, and a driver that recorded a ' +
          'dispatch it never made would satisfy only the first');
        equal(driven.driver.foldInputs().filter((i) => i.kind === 'dispatched').map((i) => i.taskId).sort(),
          driven.scheduler.added.map((t) => t.id).sort(),
          `${scenario.key}/${policy.id}: and the FOLD's input sequence agrees with both — which ` +
          'is what makes `RN-R4` true (a node absent from `nodes` was never dispatched)');
      }
    }
  });
});

/**
 * **The nested chain — W22.** `matrix.test.ts` asserts what each POLICY said; a
 * `Cell` cannot see the fold, so what a dead inner region does to
 * `RunState.outcome` is asserted here, where the depth-1 chain already is.
 *
 * The claim [ADR 0030](../../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
 * rule 5 makes: **the outer join firing does not hide the dead inner region.**
 * `RN-R10` reads *every* region, so `regions.inner.joined === false` is what
 * carries the run to `stuck` — and the outer join fires anyway, which is the
 * policy's answer rather than the driver's.
 */
const NESTED_ALL_EXIT = NESTED_SCENARIOS.find((s) => s.key === 'nested-inner-all-exit')!;

suite('L2 — a dead INNER join, through the fold', (test) => {
  test('the outer join fires and the run is still `stuck`', () => {
    const { driver, scheduler, unsatisfiable } = driveScenario(NESTED_ALL_EXIT, liveTokenRequiringArrival as JoinPolicy);
    // **`publish` is settled HERE and by no other row, and that is a consequence
    // of ADR 0030 rule 4 rather than harness bookkeeping.** The outer join fires
    // over a region containing a dead one, so real downstream work is dispatched
    // in a run that can only end `stuck` — and until that work settles the run is
    // `running`, not `stuck`. The first version of this test asserted `stuck`
    // without settling it and read `running`, which is the fact rather than a
    // slip: at depth 1 an `unsatisfiable` join dispatches nothing at all.
    scheduler.settle('r1:publish:-:0', 'done', null);
    const state = fold(driver.foldInputs());

    equal(unsatisfiable.map((u) => u.fanoutId), ['inner'],
      'exactly one region is reported dead, and it is the inner one');
    equal(state.regions['inner']?.['1']?.joined, false,
      '`joinSettled fired:false` for the inner region — ADR 0015');
    equal(state.regions['outer']?.['-']?.joined, true,
      'and the outer join DID fire: its live count reached zero having been positive, and ' +
      '`scoreA` arrived. That is the policy answering, not the driver deciding');
    equal(state.outcome, 'stuck',
      '`RN-R10` reads every region, so one `joined !== true` is enough. Without that the run ' +
      'would report `completed` over a region that can never fire, which is the false statement ' +
      'ADR 0015 exists to remove — reached at depth 2 by a road depth 1 has not got');
  });

  test('and the outer branch has exactly one terminal event, which is what JP-R5 requires', () => {
    const { driver, events } = driveScenario(NESTED_ALL_EXIT, liveTokenRequiringArrival as JoinPolicy);
    const outer1 = events.filter((e) => e.regionId === 'outer' && e.branchPath === '1');
    equal(outer1.map((e) => e.type), ['branch.opened', 'branch.lost'],
      '`JP-R5` names the two states in which a branch may have NO terminal event — suspended ' +
      'and unresolved, or still in flight. Before W22 this branch had none while being neither, ' +
      'and `RunState.regions.outer.settled` simply omitted it');
    equal(fold(driver.foldInputs()).regions['outer']?.['-']?.settled, { '0': 'arrived', '1': 'lost' },
      'both outer branches are accounted for. The `1` entry is the one that did not exist');
  });

  test('ADR 0030 rule 7: the ended branch appends NO pathEnded, and neither reason is true', () => {
    // **W22's conformity reader**: rule 7 was asserted by nothing. Adding
    // `append({ kind: 'pathEnded', reason: 'no-eligible-edge', at: region.joinId })`
    // to the `unsatisfiable` arm left every assertion green, because nothing read
    // `pathEnds` on any nested row and `stuck` outranks `failed` either way.
    //
    // **Both of `pathEnded`'s reasons are FALSE for this path**: it did not end at
    // an `end` node, and it did not run out of eligible edges — `innerJoin` has an
    // eligible edge to `outerJoin` and simply never fires. A third reason would be
    // a `spec/run-state.md` change W22 does not own, and the `joinSettled` record
    // with `fired: false` already carries the fact.
    const { driver, scheduler } = driveScenario(NESTED_ALL_EXIT, liveTokenRequiringArrival as JoinPolicy);
    scheduler.settle('r1:publish:-:0', 'done', null);
    const ends = fold(driver.foldInputs()).pathEnds;
    equal(ends.filter((e) => e.at === 'innerJoin'), [],
      'no path end is recorded AT the dead join');
    equal(ends.map((e) => `${e.reason}@${e.at}`), ['end@abandoned', 'end@abandoned', 'end@done'],
      'the only path ends are the two inner branches reaching their `end` node and the run ' +
      'reaching its own — the dead join contributes none');
  });

  test('the report names the inner region under the OUTER run, with the policy own describe', () => {
    const { unsatisfiable } = driveScenario(NESTED_ALL_EXIT, liveTokenRequiringArrival as JoinPolicy);
    equal(unsatisfiable.length, 1, 'one report');
    equal({ fanoutId: unsatisfiable[0]!.fanoutId, regionPath: unsatisfiable[0]!.regionPath,
            joinId: unsatisfiable[0]!.joinId,
            describe: unsatisfiable[0]!.describe, policyId: unsatisfiable[0]!.policyId },
      // `inner` opens inside branch `1` of `outer` (W84, ADR 0062).
      { fanoutId: 'inner', regionPath: '1', joinId: 'innerJoin',
        describe: { live: 0, positive: true, arrived: 0 },
        policyId: 'live-token-requiring-arrival' },
      'section 4: the driver reports the POLICY`s own describe and invents no run-level outcome');
  });

  test('a region instance is keyed by its OPENER and that opener`s OWN path — from the DOCUMENT', () => {
    // **W84, ADR 0062, and it is what binds the two-level keying here.** The walk
    // above cannot: every `SCENARIOS` region opens at top level, so `'-'` is right for
    // all of them and *instances* and *openers* are the same list. These rows nest.
    //
    // The expected key is derived from the scenario's own definition — `allRegions`
    // for the openers, `branchPathOf` for each opener's own path — and compared with
    // what the FOLD produced.
    //
    // **Two CALL SITES of one derivation, not two derivations** — W84's conformity
    // reader, finding 13. The driver reaches `branchPathOf` through `rpathOf` and
    // `pathOf`; this reaches it directly. So a defect INSIDE `branchPathOf` is
    // invisible here, and what this binds is that the driver KEYS BY that derivation
    // rather than by something else — which is the claim ADR 0062 makes. The
    // derivation itself is bound by `test/definition/map.test.ts`'s round trip
    // against `parseTaskId`'s grammar.
    let nested = 0;
    for (const scenario of NESTED_SCENARIOS) {
      const { driver } = driveScenario(scenario, liveToken as JoinPolicy);
      const state = fold(driver.foldInputs());
      const regions = allRegions(buildGraph(scenario.flow), scenario.flow);
      const expected = regions
        .map((r) => [r.fanoutId, branchPathOf(regions, r.fanoutId)] as const)
        .filter(([id]) => state.regions[id] !== undefined)
        .map(([id, rp]) => `${id}@${rp}`)
        .sort();
      const actual = Object.entries(state.regions)
        .flatMap(([id, byPath]) => Object.keys(byPath).map((rp) => `${id}@${rp}`))
        .sort();
      equal(actual, expected,
        `${scenario.key}: every region instance the fold carries is keyed by (opener, the ` +
        'opener`s own branchPath), derived from the document');
      nested += expected.filter((k) => !k.endsWith('@-')).length;
    }
    ok(nested > 0,
      'and at least one of those keys is NOT `-` — otherwise this claim is true of a walk over ' +
      'openers too, which is the whole thing it exists to separate');
  });

  test('under the other three columns nothing is reported dead and the run is not `stuck` for that reason', () => {
    // The discriminator. If this passed under every column, the row above would
    // be asserting something true of the harness rather than of the policy.
    for (const policy of MATRIX_COLUMNS) {
      if (policy.id === 'live-token-requiring-arrival') continue;
      const { driver, unsatisfiable } = driveScenario(NESTED_ALL_EXIT, policy);
      equal(unsatisfiable.length, 0, `${policy.id}: reports no dead join`);
      const state = fold(driver.foldInputs());
      // `inner` opens inside branch `1` of `outer`, so its instance is `'1'` — the
      // path is derived from the scenario's own document, not from the state (W84).
      equal(state.regions['inner']?.['1']?.joined !== false, true,
        `${policy.id}: the inner region is not marked dead`);
    }
  });
});
