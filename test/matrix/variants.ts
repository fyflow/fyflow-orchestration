/**
 * **`JP-R7`'s and `JP-R8`'s variants — the two one-line changes that would delete
 * P1**, moved here **verbatim** from `variants.test.ts` by
 * [W15](../../doc/work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md).
 *
 * **Only their location changed.** W15 owns `test/matrix/**` and its declaration
 * says it changes *what is run against them*, not them: both policy objects below
 * are W4's byte for byte **apart from the two `export` keywords the move needs**,
 * and `variants.test.ts` still makes the same claims about them. The move exists because a policy defined in the local scope of one
 * `.test.ts` file cannot be a **column** of the matrix, and the fourth column is
 * W15's first declared output.
 *
 * **Neither is exported from `src/`, and that is the whole point.**
 * `spec/join-policy.md` section 3: *"if it is built it is built under its own
 * id"*. Whether either is adopted is [Q24](../../doc/open-questions.md), taken as
 * ADR 0025 by W16 — and `variants.test.ts`'s *"neither has an entry in
 * `POLICIES`"* is the assertion that decision would falsify. It is **true today**
 * and W15 leaves it that way.
 */
import type { JoinPolicy, JoinStatus, Region } from '../../src/driver/policy.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';

/** `JP-R7`'s variant: `arrival-count`, plus one line that decrements N on `branch.exited`. */
export const arrivalCountDecrementing: JoinPolicy<{ need: number; arrived: string[] }> = {
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
export const liveTokenRequiringArrival: JoinPolicy<{ live: number; positive: boolean; arrived: number }> = {
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

/**
 * **The matrix's four columns, in the order they are rendered and asserted:** the
 * two `spec/join-policy.md` section 3 names, then the two `JP-R7`/`JP-R8` refine.
 *
 * The shipped pair comes first so the two-column comparison ADR 0003 was written
 * from is still readable off the left of the table; the refinements are columns
 * three and four rather than replacements, which is `JP-R7`'s *"a third policy,
 * not a repair"* expressed as a layout.
 */
export const MATRIX_POLICY_IDS = [
  'arrival-count',
  'live-token',
  'arrival-count-decrementing',
  'live-token-requiring-arrival',
] as const;

/**
 * **The four columns themselves, and there is exactly ONE of this list.**
 *
 * `matrix.test.ts` asserts against it and `render.ts` prints from it. They used to
 * build a list each, which is the hazard `MATRIX_POLICY_IDS`' comment names — and
 * W15's conformity reader found the fix had been applied only inside the test
 * file: **duplicating a policy in `render.ts`'s private list left `npm run gate`
 * fully green while the exit artifact printed wrong.** The item's own provocation
 * F1 mutated the test's list and was cited as protecting the renderer, which it
 * could not.
 *
 * One list is the whole repair: there is no second place for the two to disagree,
 * and `matrix.test.ts` asserts `MATRIX_COLUMNS.map(p => p.id)` equals
 * `MATRIX_POLICY_IDS` so the ids and the policies cannot drift either.
 */
export const MATRIX_COLUMNS: JoinPolicy[] = [
  arrivalCount as JoinPolicy,
  liveToken as JoinPolicy,
  arrivalCountDecrementing as JoinPolicy,
  liveTokenRequiringArrival as JoinPolicy,
];

/** The two ids `src/fold/policies.ts` exports. A subset of the above, deliberately. */
export const SHIPPED_POLICY_IDS = ['arrival-count', 'live-token'];

/** The two that are NOT shipped — Q24's variants, run here and exported nowhere. */
export const VARIANT_POLICY_IDS = ['arrival-count-decrementing', 'live-token-requiring-arrival'];
