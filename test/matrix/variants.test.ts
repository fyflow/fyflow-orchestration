/**
 * **`JP-R7` and `JP-R8` — the two one-line changes that would delete P1**, and
 * the tests `spec/join-policy.md` section 3 assigns to W4.
 *
 * Both rules are claims about what a refinement *does*, and until now both were
 * asserted in prose. Here they are run:
 *
 *   `JP-R7`  decrementing `arrival-count`'s N on `branch.exited` is a THIRD
 *            policy, not a repair of the first.
 *   `JP-R8`  requiring `live-token` to see an arrival before reporting
 *            `satisfied` is likewise a third.
 *
 * Both variants live in **`./variants.ts`** — moved there verbatim by
 * [W15](../../doc/work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md)
 * so the matrix can run them as its third and fourth **columns**. Neither is
 * exported from `src/`. `spec/join-policy.md`: *"if it is built it is built under
 * its own id"*, and [Q24](../../doc/open-questions.md) is where they go if W4's
 * result makes them interesting.
 *
 * **This file's job is unchanged and it is not the matrix's.** It asserts what
 * `JP-R7` and `JP-R8` CLAIM — that each refinement is a third policy rather than
 * a repair — against the two rows each claim is about. `matrix.test.ts` asserts
 * what the refinements DO across all nine. The last suite here, *"neither has an
 * entry in `POLICIES`"*, is the assertion ADR 0025 would falsify; it is **true
 * today** and W15 leaves it that way.
 *
 * The point is not that the refinements are bad. **Either may well be right.**
 * The point is that each one, written into the policy it improves, changes what
 * the matrix reports about the OTHER — so a W2 implementer who wrote either line
 * would have answered Q4 before W4 ran, and it would have looked like a passing
 * test.
 */
import { equal, ok, suite } from '../harness.ts';
import { arrivalCount, liveToken, liveTokenRequiringArrival, POLICIES } from '../../src/fold/policies.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';
import { runCell } from './run.ts';
import { SCENARIOS } from './scenarios.ts';
import { arrivalCountDecrementing } from './variants.ts';

const status = (key: string, policy: JoinPolicy) =>
  runCell(SCENARIOS.find((s) => s.key === key)!, policy).status;

const divergingRows = (a: JoinPolicy, b: JoinPolicy) =>
  SCENARIOS.filter((s) => runCell(s, a).status !== runCell(s, b).status).map((s) => s.key);

suite('JP-R7 — decrementing N on branch.exited is a third policy', (test) => {
  test("it repairs exactly P1's row, and only rows shaped like it", () => {
    // The refinement makes arrival-counting survive the case P1 was built to
    // expose. That is what makes it dangerous rather than obviously wrong.
    equal(status('routed-away', arrivalCount as JoinPolicy), 'waiting',
      'the named policy, on P1\'s case: N is fixed and one branch never arrives');
    equal(status('routed-away', arrivalCountDecrementing as JoinPolicy), 'satisfied',
      'and one line makes it fire. A W2 implementer who wrote that line would have returned ' +
      '"the two policies are equivalent" as a PASSING test');

    // And it does not repair the lost rows at all, because `branch.lost` is not
    // `branch.exited`. The refinement is shaped like the row it was written for.
    equal(status('lost-settled', arrivalCountDecrementing as JoinPolicy), 'waiting',
      'a lost branch still never arrives and N is not decremented for it — so the "fix" is ' +
      'fitted to the test rather than to the problem, which is the sharpest argument for ' +
      'calling it a third policy');
  });

  test('it changes what the matrix reports about the OTHER policy', () => {
    // Six rows diverge between the two policies P1 named. With the refinement in
    // place the comparison reports three, and the three it loses are the ones the
    // plan's whole question is about.
    equal(divergingRows(arrivalCount as JoinPolicy, liveToken as JoinPolicy).length, 6,
      'the two policies section 3 names differ on six of nine rows');
    equal(divergingRows(arrivalCountDecrementing as JoinPolicy, liveToken as JoinPolicy),
      ['lost-settled', 'lost-resolved', 'six-events'],
      'with the one line, three. The experiment did not get a different ANSWER — it got a ' +
      'different QUESTION, which is what JP-R7 means by "a third policy, not a repair"');
  });

  test('ADR 0025`s reason for refusing it: it is live-token weakened, never strengthened', () => {
    // **The decision's argument, as an assertion.** Derived from the two section
    // 3 definitions before it was run: the variant is `satisfied` only when
    // arrivals + exits >= branches, which means every branch is terminal and none
    // was LOST — and that is a strict subset of the states in which `live-token`
    // sees a live count of zero having been positive. So `satisfied` implies
    // live-token `satisfied`, and its status set excludes `unsatisfiable` by its
    // own definition (it is `arrival-count`'s status function, untouched).
    //
    // The consequence is what ADR 0025 turns on: **every row on which the two
    // differ is a row where the variant HANGS and live-token proceeds.** There is
    // no row on which it is more informative, more cautious, or faster — only
    // rows on which it says nothing for longer. A policy whose entire divergence
    // from the recommended one is a silent wait has no flow it is right for.
    const differ = SCENARIOS
      .map((sc) => ({
        key: sc.key,
        variant: runCell(sc, arrivalCountDecrementing as JoinPolicy).status,
        token: runCell(sc, liveToken as JoinPolicy).status,
      }))
      .filter((r) => r.variant !== r.token);

    equal(differ.map((r) => r.key), ['lost-settled', 'lost-resolved', 'six-events'],
      'the three rows carrying a branch.lost, which is the event JP-R7 does not decrement on');
    equal([...new Set(differ.map((r) => `${r.variant}/${r.token}`))], ['waiting/satisfied'],
      '**and every one of them is waiting-against-satisfied.** If a future refinement ever made ' +
      'this variant say `unsatisfiable` — or satisfied a row live-token waits on — this ' +
      'assertion goes red and ADR 0025`s reason for refusing it has expired');

    const statuses = new Set(SCENARIOS.map((sc) => runCell(sc, arrivalCountDecrementing as JoinPolicy).status));
    equal([...statuses].sort(), ['satisfied', 'waiting'],
      'and it can never say why: JP-R7 changes WHEN N is reached, not whether "not yet" can be ' +
      'told from "never". That is the second half of the refusal, and it is Q91 — on all-exit ' +
      'the variant reaches need 0 against an empty arrival list and FIRES a join zero branches ' +
      'reached, which is the very defect JP-R8`s refinement removes');
  });

  test('Q91: on all-exit it fires a join no branch reached, which JP-R8`s refinement declines', () => {
    // The two refinements pointing in opposite directions, on one row, as three
    // cells. ADR 0003 records the zero-arrival join as `live-token`'s cost;
    // JP-R8's refinement removes it and JP-R7's adds a second road to it.
    const allExit = SCENARIOS.find((sc) => sc.key === 'all-exit')!;
    const variant = runCell(allExit, arrivalCountDecrementing as JoinPolicy);
    equal(variant.status, 'satisfied', 'N decremented once per exit reaches zero');
    equal(variant.describe, { need: 0, arrived: [] },
      'against an EMPTY arrival list — `0 >= 0`. This is the state the count `three rows ' +
      'changed` hid, and it is why the two refinements could not be ruled on together');
    equal(variant.joinFired, true, 'and the driver routes out of it, carrying null downstream');
    equal(runCell(allExit, liveTokenRequiringArrival as JoinPolicy).joinFired, false,
      'while the refinement ADR 0025 ADOPTED declines the same row. Adopting both under one ' +
      'library is coherent only because they are two ids a caller chooses between');
  });
});

suite('JP-R8 — requiring an arrival before satisfied is a third policy, and it is SHIPPED', (test) => {
  test('it hands live-token an answer arrival-count is structurally denied', () => {
    // On the all-branches-exited row nothing arrives. The named live-token fires
    // a join no branch reached; the variant declines and says the join can never
    // fire. The variant's answer is arguably better — and giving it to one side
    // of a two-sided comparison is the asymmetry JP-R8 exists to forbid.
    equal(status('all-exit', liveToken as JoinPolicy), 'satisfied',
      'the named policy: the count reached zero having been positive, so the join fires with ' +
      'zero arrivals and carries an EMPTY collection downstream — `JP-R12`, and `{}` rather than `null` since ADR 0037');
    const variant = runCell(SCENARIOS.find((s) => s.key === 'all-exit')!, liveTokenRequiringArrival as JoinPolicy);
    equal(variant.status, 'unsatisfiable',
      'the variant: a graceful, reportable answer — and arrival-count has no way to produce ' +
      'one, because nothing in its definition can distinguish "not yet" from "never"');
    // `spec/join-policy.md` section 4: on `unsatisfiable` the driver **reports**
    // with the policy's own describe and **routes nowhere**. Reading only
    // `.status` would let a driver that routed anyway pass this row.
    equal(variant.joinFired, false, 'and the driver routes NOWHERE — an unsatisfiable join is ' +
      'not a satisfied one, and inventing a run-level outcome for it belongs to run state (Q25)');
    equal(variant.unsatisfiable, [{ fanoutId: 'split', policyId: 'live-token-requiring-arrival' }],
      'it is reported once, with the policy that said it — that report is the whole of what Q7 ' +
      'calls detection, on the one row in this repository where a policy can say it at all');
    equal(status('all-exit', arrivalCount as JoinPolicy), 'waiting',
      'which is the whole of the asymmetry: one policy refined until it can say `unsatisfiable` ' +
      'while the other is held to its section 3 wording is not a comparison of the two');
  });

  test('the bare "count is zero" the pin protects against is still wrong', () => {
    // `having been positive` is a pin, not a refinement (JP-R8): without it a
    // policy reports `satisfied` at `open`, before any branch exists.
    const bare = { ...liveToken, id: 'live-token-bare', status: (s: unknown) => (s as { live: number }).live === 0 ? 'satisfied' as const : 'waiting' as const };
    const region: Region = { fanoutId: 'split', joinId: 'collect', branches: ['a', 'b'], members: [] };
    equal(bare.status(bare.open(region)), 'satisfied',
      'a bare zero-check is true before anything opens, which is why the clause is in the ' +
      'section 3 definition rather than being one of Q24\'s variants');
    equal(liveToken.status(liveToken.open(region)), 'waiting', 'and the pinned policy is not');
  });
});

/**
 * **This suite used to say *"neither has an entry in `POLICIES`"* and
 * [ADR 0025](../../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
 * falsified half of it**, which is exactly what W15 said it was there for. The
 * half that survives is the half that is now load-bearing: **one refinement was
 * adopted and the other refused, and a refusal nothing asserts decays into an
 * oversight.**
 */
suite('one refinement is shipped and the other is refused — ADR 0025', (test) => {
  const REG: Region = { fanoutId: 'split', joinId: 'collect', branches: ['a', 'b'], members: [] };

  test('JP-R7`s has no entry in POLICIES, and that is the decision rather than an omission', () => {
    ok(!Object.keys(POLICIES).includes('arrival-count-decrementing'),
      'refused by ADR 0025. It lives in `./variants.ts`, is exported from nowhere, and is still ' +
      'run as a matrix column — which is what lets the reason for the refusal be re-checked');
  });

  test('JP-R8`s IS in POLICIES, under its own id, and live-token is untouched', () => {
    ok(Object.keys(POLICIES).includes('live-token-requiring-arrival'),
      'adopted by ADR 0025 — as a third policy, which is what JP-R8 itself prescribes');
    equal(Object.keys(POLICIES).sort(), ['arrival-count', 'live-token', 'live-token-requiring-arrival'],
      'the three names `spec/join-policy.md` section 3 fixes. **JP-R9 is what compares this ' +
      'literal to the spec** rather than letting two hand-written copies of one claim drift');
    equal(liveToken.describe(liveToken.open(REG)), { live: 0, positive: false },
      '**and `live-token` did not acquire the refinement`s counter, which is the assertion that ' +
      'says ADR 0025 built BESIDE rather than INSIDE.** A `live-token` whose state had grown an ' +
      '`arrived` field would be JP-R8`s forbidden move wearing the adopted one`s clothes');
    equal(status('all-exit', liveToken as JoinPolicy), 'satisfied',
      'and it still fires on zero arrivals — ADR 0003 rule 1 unchanged, and the cost ADR 0025 ' +
      'declined to charge to the policy this library recommends');
    equal(status('all-exit', liveTokenRequiringArrival as JoinPolicy), 'unsatisfiable',
      'while the policy shipped beside it declines the same row. Two exported policies, one ' +
      'row, two answers: that is what Q24 asked for and what a refinement folded into ' +
      'live-token would have destroyed');
  });
});

/**
 * **The clause-level rules the shipped policies are held to, applied to the ONE
 * variant that is left** — added by W15 after its adequacy reader found that
 * promoting the two from a local `const` to matrix **columns** and to ADR 0025's
 * evidence had brought none of `test/fold/policies.test.ts`'s per-policy loop
 * with them. Four mutations survived the whole suite because of it.
 *
 * **W16 did what this comment told it to.** It said: *"if ADR 0025 ships either
 * variant, W16 moves it into that loop and deletes this suite"*. ADR 0025 shipped
 * **one**, so:
 *
 *   `live-token-requiring-arrival`  is in `POLICIES`, so W2's per-policy loop
 *                                   over `Object.entries(POLICIES)` now covers it
 *                                   for `JP-R1`, `JP-R2` and `JP-R3` **without
 *                                   anyone widening anything** — and its
 *                                   `positive`-pin test moved into that file
 *                                   rather than being copied.
 *   `arrival-count-decrementing`    is refused, stays a column, and is still not
 *                                   in any loop that reads `POLICIES`. So this
 *                                   suite shrinks to it and does not go away.
 *
 * **That the suite shrinks rather than vanishing is the shape to notice**: a
 * refused policy that is still executed needs exactly the same clause-level cover
 * as a shipped one, because the argument for refusing it is a claim about how it
 * behaves.
 */
suite('the refused variant is held to the same clause-level rules as the shipped ones', (test) => {
  const VARIANTS = [arrivalCountDecrementing] as JoinPolicy[];
  const region: Region = { fanoutId: 'split', joinId: 'collect', branches: ['a', 'b'], members: [] };
  const EVENTS = ['branch.opened', 'branch.arrived', 'branch.exited', 'branch.lost',
    'branch.suspended', 'branch.resumed'] as const;
  const ev = (type: string, branchPath: string) =>
    ({ type, regionId: 'split', branchPath } as never);

  test('JP-R1: `step` does not mutate the state it is given', () => {
    // The clause, not the consequence. `matrix.test.ts`'s determinism test
    // re-runs `runCell` from scratch, so it measures REPRODUCIBILITY across
    // independent runs — a policy that mutates `S` in place is perfectly
    // reproducible and fails this. Two different properties; only one was checked.
    for (const policy of VARIANTS) {
      for (const type of EVENTS) {
        const before = policy.open(region);
        const frozen = JSON.stringify(before);
        const after = policy.step(before, ev(type, '0'));
        equal(JSON.stringify(before), frozen,
          `${policy.id}: step(${type}) mutated the state it was handed. JP-R1 says the same S and ` +
          'the same event sequence produce the same S, which a policy that edits S in place ' +
          'satisfies while making every caller`s retained state wrong');
        ok(after !== before || JSON.stringify(after) === frozen,
          `${policy.id}: step(${type}) returned the same object with different contents`);
      }
    }
  });

  test('JP-R1/JP-R2: `describe` does not hand out the policy`s own array', () => {
    // The aliasing hazard — the same class as Q73's unfrozen region event, and
    // `arrival-count` has a test named for it. A caller that sorts the array it
    // was given would be editing the policy's state through a display value.
    const opened = arrivalCountDecrementing.step(arrivalCountDecrementing.open(region), ev('branch.opened', '0'));
    const s1 = arrivalCountDecrementing.step(opened, ev('branch.arrived', '0'));
    const d = arrivalCountDecrementing.describe(s1) as { arrived: string[] };
    equal(d.arrived, ['0'], 'one arrival, so far');
    d.arrived.push('tampered');
    equal((arrivalCountDecrementing.describe(s1) as { arrived: string[] }).arrived, ['0'],
      'and editing what `describe` returned did NOT reach the policy`s state — JP-R1 makes S ' +
      'opaque and JP-R2 makes describe the only way out, so handing out the live array is both ' +
      'rules broken by one missing spread');
  });

  test('JP-R2: every describe round-trips as JSON, from every reachable state', () => {
    for (const policy of VARIANTS) {
      let st = policy.open(region);
      for (const type of [...EVENTS, 'branch.arrived', 'branch.exited'] as const) {
        st = policy.step(st, ev(type, '0'));
        const d = policy.describe(st);
        equal(JSON.parse(JSON.stringify(d)), d, `${policy.id}: describe is not JsonValue after ${type}`);
      }
    }
  });

  test('JP-R3: `status` is total — every reachable state answers one of the three', () => {
    for (const policy of VARIANTS) {
      let st = policy.open(region);
      ok(['waiting', 'satisfied', 'unsatisfiable'].includes(policy.status(st)),
        `${policy.id}: open() produces a state with no status`);
      for (const type of [...EVENTS, 'branch.arrived', 'branch.exited', 'branch.lost'] as const) {
        st = policy.step(st, ev(type, '0'));
        ok(['waiting', 'satisfied', 'unsatisfiable'].includes(policy.status(st)),
          `${policy.id}: no status after ${type}. JP-R3 admits no fourth answer and no blank`);
      }
    }
  });

  test('JP-R7`s variant counts DISTINCT arrivals, exactly as the policy it refines does', () => {
    // `arrival-count` has this test; the variant inherited the guard in its code
    // and none of the assertion. Deleting `s.arrived.includes(e.branchPath)`
    // survived the whole suite, because no matrix row emits a branch's terminal
    // event twice — `JP-R5` forbids it, which is exactly why the guard needs a
    // test rather than a row.
    let st = arrivalCountDecrementing.open(region);
    for (const t of ['branch.opened', 'branch.opened'] as const) st = arrivalCountDecrementing.step(st, ev(t, '0'));
    st = arrivalCountDecrementing.step(st, ev('branch.arrived', '0'));
    st = arrivalCountDecrementing.step(st, ev('branch.arrived', '0'));
    equal(arrivalCountDecrementing.describe(st), { need: 2, arrived: ['0'] },
      'one branch arriving twice is one arrival. Without the guard N=2 is satisfied by a single ' +
      'branch reporting twice, and the join fires with one branch still running');
    equal(arrivalCountDecrementing.status(st), 'waiting', 'so the join is NOT satisfied');
  });

  // **`JP-R8`'s variant no longer appears in this file.** Its `positive`-pin test
  // moved to `test/fold/policies.test.ts` when ADR 0025 shipped it, per this
  // suite's own instruction — moved, not copied, because two homes for one
  // assertion is how a clause ends up asserted about the wrong object.
});
