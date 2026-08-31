/**
 * The join policies of `spec/join-policy.md` section 3 — **and nothing else.**
 * `JP-R9`: every name in that table is a key here and every key is a name there,
 * which `scripts/check-policies.mjs` compares rather than trusting.
 *
 * > **Neither of the first two is the answer to [Q4](../../doc/open-questions.md).**
 * > They are the two candidates the plan named; W4 ran them against each other and
 * > recorded the winner as ADR 0003. A work item that reports a winner has skipped
 * > the plan, and **arrival-counting winning was a real possible outcome.**
 *
 * All three are written from the document rather than from an idea of what a join
 * should do, because `JP-R7` and `JP-R8` pin exactly that:
 *
 *   `JP-R7`  a variant of `arrival-count` that decrements `N` on `branch.exited`
 *            is a THIRD policy, not a repair of the first.
 *   `JP-R8`  a variant of `live-token` that requires at least one arrival before
 *            reporting `satisfied` is likewise a third.
 *
 * Both refinements are one line, both make the policy "better", and **either one
 * written INTO the policy it refines returns "the two policies are equivalent" as
 * a passing test.** That is still true and still forbidden.
 *
 * **[Q24](../../doc/open-questions.md) is answered by ADR 0025 and the two rules
 * got different answers.** `JP-R8`'s refinement is built — as a THIRD policy under
 * its own id, `live-token-requiring-arrival`, which is what `JP-R8` asks for — and
 * `live-token` below is unchanged. `JP-R7`'s is **refused**: over all nine matrix
 * rows it is `live-token` weakened and never strengthened, differing from it only
 * by reporting `waiting` where `live-token` is `satisfied`, and it cannot say
 * `unsatisfiable` — so its whole contribution is a silent hang. It stays unbuilt,
 * and `test/matrix/variants.ts` still runs it as a matrix column so the refusal
 * remains falsifiable.
 */
import type { JoinPolicy, Region } from '../driver/policy.ts';

export interface ArrivalCountState {
  /** Fixed at `open` from `region.branches.length`. Never adjusted. */
  need: number;
  /** Distinct branch paths that have arrived. */
  arrived: string[];
}

/**
 * `arrival-count` — *"N is fixed at `open` from `region.branches.length`.
 * `satisfied` when N distinct `branch.arrived` events have been seen. **Never
 * `unsatisfiable`.** Every other event is ignored."*
 *
 * **The "every other event is ignored" clause is load-bearing and deliberate.**
 * This policy cannot survive P1's case — a branch routed away never arrives, the
 * counter never reaches N, and the run waits with no error. That is not a bug to
 * fix here; it is the property W4 is measuring.
 */
export const arrivalCount: JoinPolicy<ArrivalCountState> = {
  id: 'arrival-count',

  open: (region: Region) => ({ need: region.branches.length, arrived: [] }),

  step: (s, e) => {
    // Distinct arrivals: `JP-R5` gives at most one terminal event per branch, so
    // this is belt-and-braces rather than load-bearing — but a policy that
    // double-counted would look satisfied early and be blamed on the driver.
    if (e.type !== 'branch.arrived' || s.arrived.includes(e.branchPath)) return s;
    return { ...s, arrived: [...s.arrived, e.branchPath] };
    // NOT decrementing `need` on `branch.exited`. That is JP-R7's third policy.
  },

  status: (s) => (s.arrived.length >= s.need ? 'satisfied' : 'waiting'),
  // Never `unsatisfiable`: this policy has no way to know a join can never fire,
  // which is precisely the argument Q4 states as a testable claim.

  describe: (s) => ({ need: s.need, arrived: [...s.arrived] }),
};

export interface LiveTokenState {
  /** Outstanding branches. `branch.opened` increments; the three terminal events decrement. */
  live: number;
  /** Whether the count has ever been above zero — a bare "is zero" is true before `open`. */
  positive: boolean;
}

/**
 * `live-token` — *"`open` starts a count of live branches. `branch.opened`
 * increments; `arrived`, `exited` and `lost` each decrement; `suspended` and
 * `resumed` do neither. `satisfied` when the count reaches zero **having been
 * positive**. **Never `unsatisfiable`.**"*
 *
 * **`suspended` and `resumed` doing neither is the interesting half.** A branch
 * waiting on a person is still live, so the count does not fall and the join does
 * not fire — which is what keeps *"waiting on a human"* distinguishable from
 * *"stuck"* (ADR 0004, and `spec/join-policy.md` section 4).
 */
export const liveToken: JoinPolicy<LiveTokenState> = {
  id: 'live-token',

  open: () => ({ live: 0, positive: false }),

  step: (s, e) => {
    if (e.type === 'branch.opened') return { live: s.live + 1, positive: true };
    if (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost') {
      return { ...s, live: s.live - 1 };
    }
    // `branch.suspended` and `branch.resumed`: a suspended branch is still live.
    return s;
  },

  status: (s) => (s.positive && s.live === 0 ? 'satisfied' : 'waiting'),
  // NOT requiring an arrival before reporting `satisfied`, and NOT returning
  // `unsatisfiable` on zero-with-no-arrivals. That is JP-R8's third policy, and
  // it is the one that would hand live-token a graceful answer arrival-count is
  // structurally denied — which is the asymmetry JP-R8 exists to forbid.

  describe: (s) => ({ live: s.live, positive: s.positive }),
};

export interface LiveTokenRequiringArrivalState {
  /** As `live-token`. */
  live: number;
  /** As `live-token` — the pin `JP-R8` names, not the refinement it names. */
  positive: boolean;
  /** How many `branch.arrived` events have been seen. The refinement. */
  arrived: number;
}

/**
 * `live-token-requiring-arrival` — *"As `live-token`, and additionally counts
 * `branch.arrived`. `satisfied` when the live count reaches zero having been
 * positive AND at least one `branch.arrived` has been seen; `unsatisfiable` when
 * the count reaches zero having been positive with no arrival; `waiting`
 * otherwise."*
 *
 * **`JP-R8`'s refinement, built under its own id and not into `live-token`**,
 * which is what `JP-R8` requires and what ADR 0025 decided. `liveToken` above is
 * byte-identical to what W4 ran, so ADR 0003's comparison is still readable and
 * still runnable — that is ADR 0003 rule 2, and shipping this beside them rather
 * than inside one of them is the whole reason it survives.
 *
 * **It is the only policy here that can return `unsatisfiable`, and it says it
 * about exactly one shape**: every branch terminal, none arrived — the
 * all-branches-exited row, which ADR 0003 records as `live-token`'s cost. Under
 * `live-token` that run **completes**, having routed out of a join no branch
 * reached, carrying `null`. Under this one it is `stuck` with `joined: false`.
 *
 * **Neither verdict latches.** `status` is a pure function of the current state
 * (`JP-R3`), so a later `branch.opened` puts it back to `waiting` — the same
 * property `live-token`'s `satisfied` has, and the reason `unsatisfiable` is not
 * recorded in the state.
 *
 * **This is not the library's recommendation.** ADR 0003 rule 1 is unchanged and
 * `liveToken` is still what an application passes; this is for a flow in which a
 * join reached by nothing should be reported rather than fired. Whether it should
 * *become* the recommendation is [Q96](../../doc/open-questions.md), and it is not
 * answerable from fixtures.
 */
export const liveTokenRequiringArrival: JoinPolicy<LiveTokenRequiringArrivalState> = {
  id: 'live-token-requiring-arrival',

  open: () => ({ live: 0, positive: false, arrived: 0 }),

  step: (s, e) => {
    if (e.type === 'branch.opened') return { ...s, live: s.live + 1, positive: true };
    if (e.type === 'branch.arrived') return { ...s, live: s.live - 1, arrived: s.arrived + 1 };
    if (e.type === 'branch.exited' || e.type === 'branch.lost') return { ...s, live: s.live - 1 };
    // `branch.suspended` and `branch.resumed`: still neither, for `live-token`'s
    // reason — a branch waiting on a person is still live, and a join waiting on
    // one is not stuck (`spec/join-policy.md` section 4).
    return s;
  },

  status: (s) => {
    // `s.live !== 0`, NOT `s.live > 0`. Section 3's third row pins both verdicts
    // to *"the count reaches zero"* and opens with *"as `live-token`"*, whose own
    // test is `s.live === 0`. Under `> 0` a NEGATIVE count — one branch opened,
    // two terminal events — reports `unsatisfiable` where `live-token` reports
    // `waiting`, so a driver that double-decremented would turn a silent miscount
    // into an actively reported dead join, and only in the one policy whose
    // verdict stops a run. `JP-R5` makes it unreachable through a conformant
    // driver; the definition does not depend on that and neither does this.
    if (!s.positive || s.live !== 0) return 'waiting';
    return s.arrived > 0 ? 'satisfied' : 'unsatisfiable';
  },

  describe: (s) => ({ live: s.live, positive: s.positive, arrived: s.arrived }),
};

/**
 * The names `spec/join-policy.md` section 3 fixes, and nothing else. `JP-R9`: a
 * key here with no row there, or a row there with no key here, is a defect —
 * `scripts/check-policies.mjs` is what compares the two halves instead of a
 * hand-written literal repeating one of them.
 */
export const POLICIES = {
  'arrival-count': arrivalCount,
  'live-token': liveToken,
  'live-token-requiring-arrival': liveTokenRequiringArrival,
} as const;

export type PolicyId = keyof typeof POLICIES;
