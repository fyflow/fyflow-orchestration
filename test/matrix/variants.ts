/**
 * **`JP-R7`'s variant — the one-line change ADR 0025 refused — and the matrix's
 * four columns.**
 *
 * **This file used to define two variants; it defines one.**
 * [W15](../../doc/work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md)
 * moved both here verbatim out of `variants.test.ts` so the matrix could run them
 * as **columns**; [W16](../../doc/work-items/w16-the-decision-and-what-it-ships.md)
 * then answered [Q24](../../doc/open-questions.md) as
 * [ADR 0025](../../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
 * and the two rules got different answers:
 *
 *   `JP-R8`'s  **shipped**, under its own id, and is now imported from `src/`
 *              rather than defined here. The column is the same object a consumer
 *              gets, which is what makes *"moving it into `src/` changes not one
 *              of the 36 cells"* a literal claim rather than a hope.
 *   `JP-R7`'s  **refused**, and stays here — defined in the test tree, exported
 *              from nowhere, and still run as a column. **A refusal that stops
 *              being executed is a refusal nobody can falsify**, and the reason
 *              ADR 0025 gives for it is a statement about all nine rows.
 *
 * `arrivalCountDecrementing` below is W4's, byte for byte, apart from the `export`
 * keyword the move needed.
 */
// **`Region` is no longer imported, and that is a RESULT rather than tidying.**
// W33 re-sourced `arrival-count`'s `N` from `branch.opened` and recorded the
// sharpest form of [Q159](../../doc/open-questions.md)'s answer as `deno lint`
// reporting the `Region` import unused in `src/fold/policies.ts` — *not one
// shipped policy reads its region*. This file was the last object satisfying
// `JoinPolicy` that still did, and re-sourcing `JP-R7`'s variant to match the
// policy it is a variant OF produced the same signal here
// ([W34](../../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)).
// **So now NOTHING that implements the interface reads the `Region` it is opened
// with**, shipped or not — which is why `spec/join-policy.md` section 1 can say a
// policy is not told which node kind opened its region.
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { arrivalCount, liveToken, liveTokenRequiringArrival } from '../../src/fold/policies.ts';

/**
 * `JP-R7`'s variant: `arrival-count`, plus one line that decrements N on
 * `branch.exited`.
 *
 * **`need` is COUNTED from `branch.opened`, because `arrival-count`'s is** —
 * [W34](../../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md).
 * `JP-R7` defines this as *"a variant of `arrival-count`"*, so it inherits that
 * policy's source; `spec/join-policy.md` v0.12 re-sourced it and **this file was
 * not followed through**, leaving a declared variant that is a variant of a policy
 * that no longer exists.
 *
 * **No static row could tell, which is why it stood.** On every `fanout` region the
 * counted N equals `region.branches.length`, so the two sources agree on all 36
 * depth-1 and all 16 depth-2 cells — the same identity that made W33's re-sourcing
 * move none of them. **The first input that can tell is a `map` row**, and the
 * moment `MAP_SCENARIOS` existed this column fired `map-all-arrive`'s join after
 * **one of three** arrivals with `need: 1`, carrying one key of three downstream:
 * P10 fact 4's early fire, alive in the column nobody had re-sourced.
 *
 * **This is still `JP-R7`'s REFUSED variant and this is not a repair of it.**
 * [ADR 0025](../../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
 * refused it for firing a join zero branches reached, and it still does — see
 * `map-all-routed-away`, where `need` goes 2 → 1 → 0 with nothing arrived. Fixing
 * the SOURCE of N does not fix the DECREMENT, and the column exists so that
 * refusal stays falsifiable.
 */
export const arrivalCountDecrementing: JoinPolicy<{ need: number; arrived: string[] }> = {
  id: 'arrival-count-decrementing',
  open: () => ({ need: 0, arrived: [] }),
  step: (s, e) => {
    if (e.type === 'branch.opened') return { ...s, need: s.need + 1 };
    if (e.type === 'branch.exited') return { ...s, need: s.need - 1 }; // <- the one line
    if (e.type !== 'branch.arrived' || s.arrived.includes(e.branchPath)) return s;
    return { ...s, arrived: [...s.arrived, e.branchPath] };
  },
  status: (s) => (s.arrived.length >= s.need ? 'satisfied' : 'waiting'),
  describe: (s) => ({ need: s.need, arrived: [...s.arrived] }),
};

/**
 * **The matrix's four columns, in the order they are rendered and asserted:** the
 * two `spec/join-policy.md` section 3 named when W4 ran, then the two `JP-R7` and
 * `JP-R8` refine, in that rule order.
 *
 * The W4 pair comes first so the two-column comparison ADR 0003 was written from
 * is still readable off the left of the table; the refinements are columns three
 * and four rather than replacements, which is `JP-R7`'s *"a third policy, not a
 * repair"* expressed as a layout.
 *
 * **This order is DELIBERATELY unchanged by ADR 0025, and the reason is the
 * comparison rather than inertia.** One of the two refinements is now shipped and
 * the other is refused, so an order derived from *"shipped first, then variants"*
 * would move `live-token-requiring-arrival` into column three and put the refused
 * one last — reshuffling every column of the artifact P5 exists to produce, at the
 * moment a reader most wants to hold the before and after side by side. What a
 * column IS is asserted separately, by `SHIPPED_POLICY_IDS` below and by
 * `matrix.test.ts` reading `POLICIES` itself; the layout is not the claim.
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

/**
 * **The ids `src/fold/policies.ts` exports** — `spec/join-policy.md` section 3's
 * table, written out by hand so `matrix.test.ts` compares it to `POLICIES` rather
 * than deriving one from the other. **Three since ADR 0025**, sorted, because that
 * is how `Object.keys(POLICIES).sort()` comes back.
 */
export const SHIPPED_POLICY_IDS = ['arrival-count', 'live-token', 'live-token-requiring-arrival'];

/**
 * **The two `spec/join-policy.md` section 3 pins to [Q4](../../doc/open-questions.md)'s
 * own wording**, and after ADR 0025 that is no longer the same set as
 * `SHIPPED_POLICY_IDS`. *Pinned* is a claim about a definition — neither of these
 * two may gain a clause, which is what `JP-R7` and `JP-R8` forbid and what makes
 * W4's comparison still runnable. *Shipped* is a claim about `POLICIES`. They
 * coincided until a third policy existed and the assertions that read one of them
 * had no way to say which they meant.
 */
export const PINNED_POLICY_IDS = ['arrival-count', 'live-token'];

/**
 * **The one that is NOT shipped** — `JP-R7`'s refinement, refused by ADR 0025 and
 * still run as a column so the refusal can be falsified. It was two until W16;
 * `live-token-requiring-arrival` moved into `SHIPPED_POLICY_IDS` and did not move
 * column.
 */
export const VARIANT_POLICY_IDS = ['arrival-count-decrementing'];
