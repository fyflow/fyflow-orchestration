# ADR 0030 — A join is transitive over nested fan-out, and a join that can never fire ends the branch it sits in

**Date:** 2026-09-02
**Status:** accepted
**Raised by:** [Q6](../open-questions.md), decided by
[W22](../work-items/w22-what-an-inner-join-does-to-the-outer-one.md) under
[P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md)

## Context

**[Q6](../open-questions.md) has been open since P1 and was scheduled for P2 by two spec documents
that were still saying so four plans later.** `FD-V15` refused nested fan-out, `spec/task-id.md`
reserved the dotted `branchPath` for it, and `spec/join-policy.md` section 5 listed transitivity as
something that document did not fix. [W20](../work-items/w20-what-a-nested-region-is.md) retired the
rule and [W21](../work-items/w21-the-branch-path-is-a-path.md) made the ids right, which is what made
the question askable rather than hypothetical.

**The question is: if a branch itself fans out, does the outer join wait for the grandchildren?**

### What P7 settled before fan-out, and what measuring it did to that

P7's *"decision that is NOT taken before fan-out"* section fixed the shape: **nested fan-out
supported under `live-token` and its refinement, and `arrival-count` REFUSING it** at `Driver`
construction, beside `MissingJoinPolicy`. Its stated mechanism:

> Under `arrival-count`, `N` is fixed at the outer branch list and an inner branch has no way to be
> counted.

**That is not a mechanism, and the correction is recorded in the plan rather than folded away.** `N`
is per-region. An outer region's `branches` is `[scoreA, scoreB]` whatever nests inside it, and when
the inner join fires, `settleJoin` enters the outer join carrying `pathOf(inner)` — which **is** outer
branch 1's arrival. W21 built that for [Q114](../open-questions.md), for a different reason, and it
is the whole of transitivity.

So the refusal would have rejected a definition on which the policy is measured to work, while
leaving the same policy shipped for `lost-settled` at depth 1, where it hangs.
[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) already made that trade
the other way, deliberately: *"`arrival-count` stays shipped, because the matrix is only meaningful
while both columns can be run."*

### The measurement

Four depth-2 rows against the four matrix columns, with every expected value hand-derived from
`spec/join-policy.md` sections 2 and 3 before running. Each row's **inner** region is a depth-1 row
one level down, and the pairing is the claim:

| depth-2 row | its inner region | ≡ depth-1 row |
|---|---|---|
| `nested-all-arrive` | both inner branches arrive | `all-arrive` |
| `nested-inner-lost` | an `optional` inner branch settles `failed`, no edge opts in | `lost-settled` |
| `nested-inner-exit` | one inner branch reaches an `end` | `routed-away` |
| `nested-inner-all-exit` | **both** inner branches reach an `end` | `all-exit` |

**Sixteen cells, and every one matches its depth-1 counterpart** — status, `describe` and all, with
only the branch paths renamed (`1.0`/`1.1` for `0`/`1`). Asserted in
`test/matrix/matrix.test.ts`, with the depth-1 side read from the hand-written `EXPECTED` table
rather than re-derived from the same run.

### The one thing that is NOT a depth-1 behaviour one level down

`live-token-requiring-arrival` can answer `unsatisfiable`. At depth 1 that is the end of it: the join
routes nowhere, nothing downstream is dispatched, and `RN-R10` folds the run to `stuck`. **At depth 2
the dead region sits inside a branch of another one**, and `settleJoin`'s `unsatisfiable` arm
reported the join and **returned, emitting nothing**.

Measured on `nested-inner-all-exit` before the change:

| | |
|---|---|
| `onUnsatisfiableJoin` | named `inner` **only** |
| the outer join | `waiting {live: 1, positive: true, arrived: 1}`, forever |
| `RunState.regions.outer.settled` | `{"0": "arrived"}` — **branch 1 simply missing** |
| outer branch 1's terminal events | **zero**, with `verdict: 'stuck'`: nothing suspended, nothing in flight |

`JP-R5` enumerates the two states in which a branch may emit no terminal event — *"a branch that
suspends and is never resolved … and neither does any branch in a run still in flight"*. **This is
neither.** So the old behaviour was a rule violation rather than a design choice, and it was
**unobservable rather than absent** at depth 1, where the region's `fanout` is in no region and there
is nothing to emit. That is [Q114](../open-questions.md)'s shape one item earlier: a `settleJoin` exit
that was right only because its wrong value could not be seen.

## Decision

1. **Every policy `spec/join-policy.md` section 3 names is transitive over nested fan-out, and none
   of them needed a clause for it.** Section 3 is byte-unchanged by this decision, which is the
   result rather than a restraint. `arrival-count`, `live-token`, `live-token-requiring-arrival` and
   the refused `arrival-count-decrementing` variant each answer, **for a nested region, exactly as
   they answer for the depth-1 row of the same shape**. **What is measured is the four shapes below at
   depth 2, in one nesting position, with no suspension shape among them** — this rule read *"region
   by region"*, which its own rule 2 contradicts and which W22's conformity reader read as broader
   than the evidence.

2. **Transitivity is a property of a REGION, not of a row.** Each region answers as it would if it
   were not nested; what the *outer* join then does depends on what its own branches did, one of
   which happens to contain the inner region. Reading the claim per row would make it false on
   `nested-inner-all-exit`, where the inner join is `unsatisfiable` and the outer one is `satisfied`.

3. **Nesting adds no mechanism.** No new state, no walk over the containment relation, no field on
   `Region`. `region(F).branches` is unchanged by what nests inside `F`, and an inner join's firing
   enters the outer join at `pathOf(F)` — already built, for [Q114](../open-questions.md).
   **It does depend on innermost region resolution** ([Q113](../open-questions.md)): `branch.exited`
   and `branch.lost` are the only two `regionOf`-sourced events any shipped policy acts on, and both
   decrement a live count. The dependency is named here rather than left as a property of
   `src/definition/regions.ts` that nothing points at.

4. **A join that can never fire ends the branch it sits in.** When `status` is `unsatisfiable` for
   `region(F)` and `F` is inside a region `G`, the driver emits `branch.lost` for `G` at `pathOf(F)`.
   `JP-R10`, and `spec/join-policy.md` section 4's `unsatisfiable` row. Three things it is not:
   - **not a new event — but it IS a widening of section 2's emission condition, and the first
     version of this decision elided that.** Section 2's own condition was *"a node in that branch
     reached a terminal state — by settling, **or by being resolved** — and **no edge was eligible**
     for it"*, and a dead join satisfies **neither** clause: a `join` node never settles and is never
     resolved, and its edge stays eligible while the join simply does not fire. This ADR quoted only
     the trailing *"so the path ended inside the region"* and read it as a definition. **W22's
     conformity reader found it**, and the fix is in `spec/join-policy.md` section 2 rather than
     here: the condition now has an (a) and a (b), the *"exhaustive"* paragraph names two roads to
     the third case rather than one, and `reason` has three roads rather than two. `JP-R6` asks that
     adding an event be a spec change with its own rationale; **widening the condition for an
     existing one is the same obligation**, and it is now discharged in the section that defines the
     emission rather than in the rule that consumes it.
   - **not the driver deciding `G`'s verdict.** `G`'s policy is stepped with the fact and answers for
     itself. [ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 1 and
     section 4's owner table both put satisfaction in a policy, and the alternative considered —
     walking outward marking every enclosing join dead — would have moved it into the driver.
   - **not a traversal.** `G` may itself be `unsatisfiable`, and the same clause applies to it.
     Measured at depth 3: one emission gives `inner` dead → `lost(mid:1.1)` → `mid` dead → 
     `lost(outer:1)` → `outer` **satisfied**, because `a` arrived there and nothing arrived at the
     other two. **Three different verdicts, one line, none of them the driver's.**

5. **The outer join firing does not hide the dead inner region.** `RN-R10` reads *every* region, so
   `regions.inner.joined === false` carries the run to `stuck` whatever the outer join did. What
   changes is that real downstream work now runs first: the outer join fires, `publish` is dispatched,
   and the run reads `running` until it settles and `stuck` after. **That is stated as a cost, not
   hidden.** It is the same trade `live-token` already makes at depth 1, where a `lost` branch
   satisfies a join and downstream work proceeds in a run that folds to `failed`.

6. **No `arrival-count` refusal is built** — no `JP-R*` refusal, no construction refusal, no new
   error class, and therefore **no declared-empty matrix cell.** P7's stated ground is measured false
   (Context above). Reopening it needs a new argument.

7. **No `pathEnded` is appended for the ended branch.** Both of its reasons are false here:
   `'end'` plainly, and `'no-eligible-edge'` because the join *has* an eligible edge and simply never
   fires. A third reason is a `spec/run-state.md` change W22 does not own, and the `joinSettled`
   record with `fired: false` already says the path stopped there — `RN-R10` derives `stuck` from it.
   **Measured both ways**: the variant appending it changes nothing but `RunState.pathEnds`, and what
   it adds there is a false reason.

## Consequences

**`spec/join-policy.md` is v0.10** with `JP-R10` added, section 4's `unsatisfiable` row extended and
section 5's transitivity bullet replaced. Section 3 is untouched.

**Depth is bounded at 2 as a TESTED claim and at nothing as a designed one.** The matrix and the
driver seam run at depth 2; the cascade in rule 4 is asserted at depth 3, and `test/driver/surface.test.ts`
already carried a depth-3 sibling shape from W21. **What is not covered**: the `fromRegion` a join's
**successor** is entered with cannot discriminate at depth 2 and does at depth 3, and nothing tests it
([Q113](../open-questions.md)). An item claiming depth 3 works owes that row. *(That site is at
`driver.ts:1069` after this change and Q113's row names it at `:1022`, which is the line it was at
when the row was written **one step earlier in this same item**. This decision's own first draft
called it *"the fifth call site"*; `regionOf` now has **six**, because rule 4 added one. The count is
stated here as a predicate rather than a number — `grep -c "this\.regionOf(" src/driver/driver.ts` —
which is `CLAUDE.md`'s own remedy for the failure this paragraph committed.)* **Rule 4's own new site
is NOT in that gap**: at depth 3 `innermost` of a dead region's fanout has two candidates and the
checked-in cascade test discriminates them.

**The matrix's own premise is narrower than it was.** The nine depth-1 rows assert one event stream
per row and then assert it is identical under all four columns, on the ground that *"a policy cannot
change what the driver emits"*. **At depth 2 that is false**: an inner join's firing is itself an
event for the enclosing region, so the tail depends on what the inner policy concluded. The
comparison survives — all four columns still see identical input **up to the inner join's verdict** —
and the depth-2 rows assert a shared prefix and a per-column tail rather than one stream.

**The refused variant's known defect launders itself upward.** `arrival-count-decrementing` reaches
`need: 0` against an empty arrival list and fires a join no branch reached — [Q91](../open-questions.md),
and the cost [ADR 0025](0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
refused it for. At depth 2 that bogus firing produces a **real** `arrived(outer:1)`, the outer join
fires legitimately, and the run reports **`completed`**. At depth 1 the defect is confined to one
join; nesting turns it into a run-level verdict. **ADR 0025's refusal is strengthened by a fact it
did not have**, and the variant stays a matrix column so that stays falsifiable.

**What is still open.** [Q5](../open-questions.md) — whether a policy may be chosen per join rather
than per run — is louder with nesting and is not answered here: one policy per run stays, so an inner
and an outer join cannot disagree about what satisfies them. [Q36](../open-questions.md), what a
satisfied join carries downstream, is untouched; a join still forwards `null`, at both depths.
