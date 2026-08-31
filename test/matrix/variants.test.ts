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
import { arrivalCount, liveToken, POLICIES } from '../../src/fold/policies.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';
import { runCell } from './run.ts';
import { SCENARIOS } from './scenarios.ts';
import { arrivalCountDecrementing, liveTokenRequiringArrival } from './variants.ts';

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
});

suite('JP-R8 — requiring an arrival before satisfied is a third policy', (test) => {
  test('it hands live-token an answer arrival-count is structurally denied', () => {
    // On the all-branches-exited row nothing arrives. The named live-token fires
    // a join no branch reached; the variant declines and says the join can never
    // fire. The variant's answer is arguably better — and giving it to one side
    // of a two-sided comparison is the asymmetry JP-R8 exists to forbid.
    equal(status('all-exit', liveToken as JoinPolicy), 'satisfied',
      'the named policy: the count reached zero having been positive, so the join fires with ' +
      'zero arrivals and carries `null` downstream');
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

suite('the variants are not shipped', (test) => {
  test('neither has an entry in POLICIES', () => {
    ok(!Object.keys(POLICIES).includes('arrival-count-decrementing'), 'JP-R7');
    ok(!Object.keys(POLICIES).includes('live-token-requiring-arrival'), 'JP-R8');
    equal(Object.keys(POLICIES).sort(), ['arrival-count', 'live-token'],
      'W2 ships the two P1 named. These two live in W4\'s test tree, under their own ids, and ' +
      'building them for real is Q24 — after ADR 0003, if the result makes them interesting');
  });
});

/**
 * **The clause-level rules the shipped pair is held to, applied to the two
 * variants** — added after W15's adequacy reader found that promoting them from
 * a local `const` to matrix **columns** and to ADR 0025's evidence had not
 * brought any of `test/fold/policies.test.ts`'s per-policy loop with them.
 *
 * Four mutations survived the whole suite because of it: `step` mutating its
 * input, `describe` handing out the policy's own array, the distinct-arrival
 * guard deleted, and `positive` set unconditionally. **Every one has a named
 * test for `arrival-count` and `live-token` and had none here.**
 *
 * `test/fold/policies.test.ts` is W2's file and W15 owns `test/matrix/**`, so the
 * loop is written here against the two policies this directory owns rather than
 * by widening W2's. If ADR 0025 ships either variant, W16 moves it into that loop
 * and deletes this suite — which is the right shape for a thing that exists
 * because these two are not shipped.
 */
suite('the variants are held to the same clause-level rules as the shipped pair', (test) => {
  const VARIANTS = [arrivalCountDecrementing, liveTokenRequiringArrival] as JoinPolicy[];
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

  test('JP-R8`s variant sets `positive` only on branch.opened', () => {
    // The `having been positive` pin, which section 3 calls a pin rather than a
    // refinement: without it a bare zero-check reports `satisfied` at `open`.
    // Setting `positive` unconditionally survived the suite, because `JP-R5`
    // makes `branch.opened` come first on every row — the ordering clause the
    // spec already records as unfalsifiable in the driver is what hides it here.
    const fresh = liveTokenRequiringArrival.open(region);
    equal(liveTokenRequiringArrival.status(fresh), 'waiting', 'nothing has opened yet');
    for (const type of ['branch.arrived', 'branch.exited', 'branch.lost', 'branch.suspended', 'branch.resumed'] as const) {
      const st = liveTokenRequiringArrival.step(fresh, ev(type, '0'));
      equal(liveTokenRequiringArrival.describe(st), { live: type === 'branch.arrived' ? -1 : (type === 'branch.exited' || type === 'branch.lost') ? -1 : 0, positive: false, arrived: type === 'branch.arrived' ? 1 : 0 },
        `${type} before any branch opened must not set \`positive\` — only branch.opened does`);
      equal(liveTokenRequiringArrival.status(st), 'waiting',
        `and the status stays \`waiting\`: an unopened region is not a satisfied one, and it is ` +
        'not an unsatisfiable one either');
    }
  });
});
