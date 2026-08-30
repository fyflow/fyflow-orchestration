/**
 * The two join policies of `spec/join-policy.md` section 3 — **and nothing else.**
 *
 * > **Neither of these is the answer to [Q4](../../doc/open-questions.md).** They
 * > are the two candidates the plan named; W4 runs them against each other and
 * > records the winner as ADR 0003. A work item that reports a winner has skipped
 * > the plan, and **arrival-counting winning is a real possible outcome.**
 *
 * Both are written from the document rather than from an idea of what a join
 * should do, because `JP-R7` and `JP-R8` pin exactly that:
 *
 *   `JP-R7`  a variant of `arrival-count` that decrements `N` on `branch.exited`
 *            is a THIRD policy, not a repair of the first.
 *   `JP-R8`  a variant of `live-token` that requires at least one arrival before
 *            reporting `satisfied` is likewise a third.
 *
 * Both refinements are one line, both make the policy "better", and **either one
 * written here returns "the two policies are equivalent" as a passing test.** They
 * are [Q24](../../doc/open-questions.md) and they are built after W4, if at all.
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

/** The two P1 named, by the ids `JP-R7` and `JP-R8` pin. Nothing else belongs here. */
export const POLICIES = { 'arrival-count': arrivalCount, 'live-token': liveToken } as const;

export type PolicyId = keyof typeof POLICIES;
