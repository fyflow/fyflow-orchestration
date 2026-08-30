# ADR 0003 — A join is satisfied when its region has no live branches, not when N branches have arrived

**Date:** 2026-08-30
**Status:** accepted — **one false statement corrected in place, 2026-08-30**, see *Correction*
**Raised by:** [Q4](../open-questions.md), decided by [W4](../work-items/w4-the-join-failure-matrix.md)
under [P1](../plans/p1-what-satisfies-a-join.md)

## Context

[Q4](../open-questions.md) is the hard question in this repository, and it was **deliberately not
decided by argument**. The argument for live-token accounting was strong when P1 was written and was
**refused as sufficient**: P1 built both policies behind one interface
([spec/join-policy.md](../../spec/join-policy.md)) and settled it with an executable test, on the
stated understanding that *"arrival-counting winning is a real possible outcome, not a courtesy"*.

Two guards were written before either policy existed, because the obvious repairs would have
returned *"the two policies are equivalent"* as a **passing test**: `JP-R7` (decrementing
`arrival-count`'s `N` on `branch.exited`) and `JP-R8` (requiring `live-token` to see an arrival).
Both are third policies, and both are now run under their own ids in
`test/matrix/variants.test.ts` rather than argued about.

The evidence is the matrix — nine rows, two policies, every cell's expected value written by hand
from `spec/join-policy.md` sections 2-4 before it was run, green in all five runtimes:

| row | arrival-count | live-token |
|---|---|---|
| **all-arrive** — both branches reach the join | `satisfied` / joined | `satisfied` / joined |
| **routed-away** — a decision sends one branch to an `end` (**P1's case**) | `waiting` / **stuck** | `satisfied` / joined |
| **lost-settled** — an `optional` branch settles `failed`, no edge opts in | `waiting` / **stuck** | `satisfied` / joined |
| **lost-resolved** — a human resolves a suspended branch `failed` | `waiting` / **stuck** | `satisfied` / joined |
| **optional-null** — an `optional` branch fails onto an `on:["failed"]` edge | `waiting` / **stuck** | `satisfied` / joined |
| **suspended** — a branch is parked on a person | `waiting` / waiting-on-human | `waiting` / waiting-on-human |
| **resumed** — that branch is resolved `done` and arrives | `satisfied` / joined | `satisfied` / joined |
| **all-exit** — every branch reaches an `end`, nothing arrives | `waiting` / **stuck** | `satisfied` / joined |
| **six-events** — one lost, one exited, one suspended-resumed-arrived | `waiting` / **stuck** | `satisfied` / joined |

**The result is larger than the question asked for.** P1 predicted that arrival-counting breaks on
one exotic case — a decision inside a fan-out branch routing away from its join. The matrix says it
breaks on **six of nine rows**, and those six are **two distinct mechanisms**, only one of which P1
named:

| mechanism | rows | is it exotic? |
|---|---|---|
| the branch **reached an `end` node** — `branch.exited` | `routed-away`, `optional-null`, `all-exit`, and one branch of `six-events` | this is P1's case. `optional-null` and `all-exit` reach it by an `on: ["failed"]` edge rather than by a `when`, but the event is the same and both policies are indifferent to the difference |
| the branch was **lost with no eligible edge** — `branch.lost` | `lost-settled`, `lost-resolved`, and one branch of `six-events` | **no.** An `optional` task failing, or a human declining one, with no edge opting into `failed`. This is an ordinary Tuesday |

Fixed-`N` is wrong whenever *"how many branches will arrive"* differs from *"how many branches
opened"* — and **every non-success outcome makes it differ.** Q4's framing treated the routed-away
branch as the sharp edge; the second mechanism decides this, and an `optional` node failing is not
exotic at all.

**And the failure mode is a silent hang.** `arrival-count` never returns `unsatisfiable` — that is
its section 3 definition, not an oversight — so on all six rows it reports `waiting` forever with
nothing queued, nothing running and nobody to ask. That is character-for-character the signature
[P1](../plans/p1-what-satisfies-a-join.md) exists to attribute, and it is now attributed.

## Decision

1. **A join is satisfied when its region has no live branches, having had at least one.** The
   `live-token` policy of `spec/join-policy.md` section 3 is the one this library uses:
   `branch.opened` increments; `branch.arrived`, `branch.exited` and `branch.lost` each decrement;
   `branch.suspended` and `branch.resumed` do neither.
2. **`arrival-count` stays in the tree, and stays shipped.** It is not deleted and not deprecated:
   it is the falsifiable form of the simpler mechanism, and the matrix is only meaningful for as
   long as both columns can be run. `POLICIES` continues to export both.
3. **`live-token` is not a default the driver carries.** [ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md)
   and `spec/join-policy.md` section 4 keep the policy an injected dependency, and a definition
   with a fan-out and no policy is still refused at instantiation. What this ADR fixes is **which
   policy an application should pass**, not where the choice lives.
4. **The count is not a number a flow author writes.** Nothing in a definition states how many
   branches must arrive, and nothing may be added that does — a written `N` reintroduces exactly
   the coupling this decision removes.
5. **Neither of `JP-R7`'s and `JP-R8`'s refinements is adopted.** Both remain
   [Q24](../open-questions.md), both remain unshipped, and either is built under its own `id` if a
   flow needs it. See *Consequences*.

## Consequences

**What this makes easy.** A branch may do anything a flow allows — succeed, fail, be abandoned by a
decision, be declined by a human — and the join still resolves. Every one of those is a
`-1`, and the region empties by the same arithmetic regardless of which road a branch took. That is
the property arrival-counting cannot have without knowing the future.

**What this makes hard, and the cost is real.** On the **all-exit** row `live-token` fires a join
that **no branch reached**, and it carries `null` downstream. A flow author reading *"the join
fired"* would reasonably expect at least one branch to have arrived, and here none did. `JP-R8`'s
variant answers that case gracefully — it returns `unsatisfiable` — and this ADR **does not adopt
it**, because doing so inside the comparison would have been the asymmetry `JP-R8` was written to
forbid. Now that the comparison is over, that objection is spent: **whether a join with zero
arrivals should fire is [Q24](../open-questions.md), and it is the first thing a reader of this ADR
should look at.** It is a smaller question than Q4 and it is no longer entangled with it.

**What a future reader is likely to try that this forbids.** Reintroducing a count. It arrives in
three disguises: a `count` field on the join node, a *"wait for all branches"* flag that resolves to
`branches.length`, and — the one that has already happened once — a one-line decrement of `N` on
`branch.exited`. `test/matrix/variants.test.ts` shows what that third one actually does: it repairs
**only** the row P1 named, leaves both `branch.lost` rows waiting forever, and reduces the two
policies' divergence from six rows to three. It is a fix fitted to the test rather than to the
problem.

**What it does not decide.** A stuck join is still detected by **quiescence**, not by any policy:
neither shipped policy ever returns `unsatisfiable`, which section 4 records as a result rather than
a gap. W4 showed the detection is decidable from the log alone — every dispatched task has an
outcome, no branch is parked on a person, and the join has not fired — so a **timeout is not
required for detection**, and [Q7](../open-questions.md) narrows to whether a join should time out
for any other reason. Where that predicate should live is [Q42](../open-questions.md).

**A join still carries `null` downstream** ([Q36](../open-questions.md)). This decision does not
touch it, and W4 found that nothing had been asserting it: replacing the driver's `null` with `{}`
survived all 251 assertions in five runtimes. The matrix asserts it now.

## Alternatives rejected

| | why not |
|---|---|
| **`arrival-count`** — `N` fixed at `open` from `region.branches.length` | It hangs on six of the matrix's nine rows, and reports `waiting` while doing it. **Two of those six have nothing to do with the routed-away case Q4 was written about** — an `optional` failure with no edge opting into it, and a human declining a task — so an ordinary failure alone is enough. **It was a real candidate and it lost on evidence**, which is what P1 asked for |
| **`arrival-count` with `N` decremented on `branch.exited`** (`JP-R7`) | A third policy, and one shaped like the single test it was written to pass. It still hangs on both `branch.lost` rows, because a lost branch is not an exited one — and `test/matrix/variants.test.ts` runs exactly that. Building it needs its own id and its own reason, which is [Q24](../open-questions.md) |
| **`live-token` requiring one arrival before `satisfied`** (`JP-R8`) | Very possibly the right answer, and **not decidable inside this comparison**: giving one side a graceful `unsatisfiable` that the other is structurally denied is not a comparison of the two. Deferred to [Q24](../open-questions.md) with the all-exit row as its motivating case |
| **Per-join configuration — the author picks a policy** | [Q5](../open-questions.md)'s remainder, and premature: it presumes there are two answers worth offering, and the matrix says one of them hangs. Revisit if Q24 produces a second policy that does not |
| **Deciding by argument, without the matrix** | It would have reached the same policy and missed the finding: that the failure is ordinary rather than exotic, and that `branch.exited` — the event P1 was written around — is only *half* the reason. The argument P1 refused as sufficient was, in the end, right about the winner and wrong about the size of the effect |

## Correction — 2026-08-30

**Found by W4's spec-conformity pass and independently by its test-adequacy pass**, both run against
the commit that first carried this ADR.

The *Context* section originally read: *"only **one** of those six is that case. The other five are
an `optional` task failing, a human declining a task, an optional-null, every branch ending, and a
mixed run."* **That enumerated five mechanisms where there are two.** `optional-null` and `all-exit`
both reach an `end` node — the first through an `on: ["failed"]` edge rather than a `when` — so
their region event streams are branch-index permutations of `routed-away`'s, and both policies are
indifferent to the permutation. The matrix distinguishes **two** mechanisms across six rows, not
six, and the table above now says so.

The same paragraph is corrected in the *Alternatives rejected* row for `arrival-count`: **two** of
the six, not five, are unrelated to the routed-away case.

**The decision is unchanged and so is the reason for it.** The substantive claim — that
arrival-counting fails on an ordinary `optional` failure and not only on P1's exotic case — is
carried by `lost-settled` and `lost-resolved`, which are genuinely the second mechanism, and both
are asserted (`test/matrix/matrix.test.ts`). What was wrong was the count of *kinds*, not the count
of rows: *"six of nine rows"* is asserted as an exact list and reproduces. A reader who acted on the
old text and one who acts on this one would do the same thing.

Left visible rather than edited away, per `doc/decisions/README.md`: *"Deleting the correction
notice would be the violation, not the edit."*
