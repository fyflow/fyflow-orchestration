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
 * Both variants live **here**, under their own ids, and neither is exported from
 * `src/`. `spec/join-policy.md`: *"if it is built it is built under its own id"*,
 * and [Q24](../../doc/open-questions.md) is where they go if W4's result makes
 * them interesting.
 *
 * The point is not that the refinements are bad. **Either may well be right.**
 * The point is that each one, written into the policy it improves, changes what
 * the matrix reports about the OTHER — so a W2 implementer who wrote either line
 * would have answered Q4 before W4 ran, and it would have looked like a passing
 * test.
 */
import { equal, ok, suite } from '../harness.ts';
import { arrivalCount, liveToken, POLICIES } from '../../src/fold/policies.ts';
import type { JoinPolicy, JoinStatus, Region } from '../../src/driver/policy.ts';
import { runCell } from './run.ts';
import { SCENARIOS } from './scenarios.ts';

/** `JP-R7`'s variant: `arrival-count`, plus one line that decrements N on `branch.exited`. */
const arrivalCountDecrementing: JoinPolicy<{ need: number; arrived: string[] }> = {
  id: 'arrival-count-decrementing',
  open: (r: Region) => ({ need: r.branches.length, arrived: [] }),
  step: (s, e) => {
    if (e.type === 'branch.exited') return { ...s, need: s.need - 1 }; // <- the one line
    if (e.type !== 'branch.arrived' || s.arrived.includes(e.branchPath)) return s;
    return { ...s, arrived: [...s.arrived, e.branchPath] };
  },
  status: (s) => (s.arrived.length >= s.need ? 'satisfied' : 'waiting'),
  describe: (s) => ({ need: s.need, arrived: [...s.arrived] }),
};

/** `JP-R8`'s variant: `live-token`, plus the clause v0.1 of the spec actually shipped. */
const liveTokenRequiringArrival: JoinPolicy<{ live: number; positive: boolean; arrived: number }> = {
  id: 'live-token-requiring-arrival',
  open: () => ({ live: 0, positive: false, arrived: 0 }),
  step: (s, e) => {
    if (e.type === 'branch.opened') return { ...s, live: s.live + 1, positive: true };
    if (e.type === 'branch.arrived') return { ...s, live: s.live - 1, arrived: s.arrived + 1 };
    if (e.type === 'branch.exited' || e.type === 'branch.lost') return { ...s, live: s.live - 1 };
    return s;
  },
  status: (s): JoinStatus => {
    if (!s.positive || s.live > 0) return 'waiting';
    return s.arrived > 0 ? 'satisfied' : 'unsatisfiable'; // <- the one line
  },
  describe: (s) => ({ live: s.live, positive: s.positive, arrived: s.arrived }),
};

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
    equal(status('all-exit', liveTokenRequiringArrival as JoinPolicy), 'unsatisfiable',
      'the variant: a graceful, reportable answer — and arrival-count has no way to produce ' +
      'one, because nothing in its definition can distinguish "not yet" from "never"');
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
