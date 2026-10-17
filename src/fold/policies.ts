/**
 * The join policies of `spec/join-policy.md` section 3 — **and nothing else.**
 * `JP-R9`: every name in that table is a key here and every key is a name there,
 * which `scripts/check-policies.mjs` compares rather than trusting.
 *
 * > **Neither of the first two is the answer to [Q4](../../doc/questions/q4.md).**
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
 * **[Q24](../../doc/questions/q24.md) is answered by ADR 0025 and the two rules
 * got different answers.** `JP-R8`'s refinement is built — as a THIRD policy under
 * its own id, `live-token-requiring-arrival`, which is what `JP-R8` asks for — and
 * `live-token` below is unchanged. `JP-R7`'s is **refused**: over all nine matrix
 * rows it is `live-token` weakened and never strengthened, differing from it only
 * by reporting `waiting` where `live-token` is `satisfied`, and it cannot say
 * `unsatisfiable` — so its whole contribution is a silent hang. It stays unbuilt,
 * and `test/matrix/variants.ts` still runs it as a matrix column so the refusal
 * remains falsifiable.
 */
// **`Region` is no longer imported, and that is a RESULT rather than tidying.**
// After the v0.12 re-sourcing below, NOT ONE shipped policy reads the region it is
// opened with - `arrival-count` was the last, and P10 fact 3 measured it as the
// only one. The seam still passes it (`spec/join-policy.md` section 1 fixes the
// shape and `JoinPolicy.open` still takes it), and every policy here now answers
// from the EVENT STREAM alone. That is the sharpest form of Q159's answer: the
// interface does not need to say which node kind opened a region, because nothing
// reads the region.
import type { JoinPolicy } from '../driver/policy.ts';

export interface ArrivalCountState {
  /**
   * How many branches the region **opened** — one per `branch.opened`.
   *
   * **Read `region.branches.length` at `open` until v0.12**, which is the same
   * number for every `fanout` region and is **1 for every `map` region whatever the
   * run opens**. See `arrivalCount` below.
   */
  need: number;
  /** Distinct branch paths that have arrived. */
  arrived: string[];
}

/**
 * `arrival-count` — *"N is **counted from `branch.opened`** — one per branch the
 * region opened. `satisfied` when N distinct `branch.arrived` events have been seen
 * **and N is at least one**. **Never `unsatisfiable`.** Every other event is
 * ignored."*
 *
 * *(That quotation is `spec/join-policy.md` section 3's row at v0.12. It read the
 * v0.7 row — *"N is fixed at `open` from `region.branches.length`"* — until this
 * change, and a doc comment quoting a spec row it no longer implements is the
 * `spec/README.md` rule 4 shape one layer down.)*
 *
 * **The "every other event is ignored" clause is load-bearing and deliberate.**
 * This policy cannot survive P1's case — a branch routed away never arrives, the
 * counter never reaches N, and the run waits with no error. That is not a bug to
 * fix here; it is the property W4 is measuring.
 *
 * ---
 *
 * **v0.12 — `N` is COUNTED from `branch.opened` rather than read from
 * `region.branches.length`, and it is a re-sourcing rather than `JP-R7`'s
 * refinement.** [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md),
 * `spec/join-policy.md` section 3.
 *
 * **What forced it, measured end to end through a real `Driver` at ladder L2.** A
 * `map` region's `region.branches` is the ONE declared branch entry whatever the
 * run opens ([ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)),
 * so the old source gave `need: 1` at every arity — and on a three-item map this
 * policy **routed the join out after 4 of 6 region events with TWO branches still
 * live**. Every failure W4 recorded was `need` being too LARGE, which hangs; this
 * is `need` too SMALL, which **completes the run wrong**. A hang is a run that does
 * not finish and `ADR 0015` gives it a name; there is no vocabulary for a run that
 * finished having published work that had not happened, and there should not have
 * to be.
 *
 * **Why this is not `JP-R7`'s forbidden line.** `JP-R7` forbids *decrementing `N`
 * on `branch.exited`*, which changes three of the nine matrix rows and makes this
 * policy survive P1's case. Counting `branch.opened` changes **no** verdict: a
 * `fanout` emits exactly one `branch.opened` per declared entry, so the two sources
 * are the same number on every static region — **measured, 6 of 6 regions over the
 * valid corpus and all 36 matrix cells unmoved**. P1's routed-away case still
 * hangs (`need` 2, one arrival, forever), which is this policy's defining property
 * and the whole of what `ADR 0003` measured. It answers the same about every input
 * W4 ran and something new about an input W4 could not construct.
 *
 * **`JP-R5` is what makes it sound, and this is the first thing to depend on it.**
 * That rule's own section says *"`arrival-count` is immune, because its `N` comes
 * from `region.branches.length` at `open`"* — true until this change and false
 * after it. Every `branch.opened` for a region precedes any other event for it, so
 * `need` is final before any arrival can be counted against it. *(This read "the clause remains unfalsifiable through
 * a conformant driver" until W180: since `spec/flow-definition.md` v0.42 a branch entry or a map's branch may be an
 * `ask`, which EMITS on entry, so the clause's guarantor is the driver's two-pass emission — `spec/join-policy.md`
 * v0.23.)* What RESTS on it is now both counting policies rather than one.
 */
export const arrivalCount: JoinPolicy<ArrivalCountState> = {
  id: 'arrival-count',

  // **`region` is deliberately unread.** It was the source of `need` and is now
  // the source of nothing: `branches` cannot answer *how many branches did this
  // region open* for a map, and a policy that read it for a fanout and counted for
  // a map would be branching on the node kind — which it cannot see
  // ([Q159](../../doc/questions/q159.md)) and, per that row, should not.
  open: () => ({ need: 0, arrived: [] }),

  step: (s, e) => {
    // The re-sourcing. One per branch the region actually opened.
    if (e.type === 'branch.opened') return { ...s, need: s.need + 1 };
    // Distinct arrivals: `JP-R5` gives at most one terminal event per branch, so
    // this is belt-and-braces rather than load-bearing — but a policy that
    // double-counted would look satisfied early and be blamed on the driver.
    if (e.type !== 'branch.arrived' || s.arrived.includes(e.branchPath)) return s;
    return { ...s, arrived: [...s.arrived, e.branchPath] };
    // NOT decrementing `need` on `branch.exited`. That is JP-R7's third policy.
  },

  // **`s.need > 0` is a PIN, not a refinement**, and it is exactly `JP-R8`'s own
  // *"having been positive"* argument in the policy that argument was denied to.
  // A bare `arrived.length >= need` is true at `0 >= 0`, so without it `open`
  // itself reports `satisfied` — and at a map of zero items this policy would fire
  // a join **no branch ever reached**, which is character for character what
  // [ADR 0025](../../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
  // REFUSED `JP-R7`'s variant for. It is vacuous on every `fanout` region, because
  // `FD-V9`'s floor puts `need` at 2 or more.
  status: (s) => (s.need > 0 && s.arrived.length >= s.need ? 'satisfied' : 'waiting'),
  // Never `unsatisfiable`: this policy has no way to know a join can never fire,
  // which is precisely the argument Q4 states as a testable claim. **At a map of
  // zero items it says `waiting`, exactly as the other two do** — the region is
  // reported dead by the FOLD (`RN-R10`, via the `regionEntered` input) rather
  // than by any policy, which is `spec/join-policy.md` section 5's own case.

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
 * *become* the recommendation is [Q96](../../doc/questions/q96.md), and it is not
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
