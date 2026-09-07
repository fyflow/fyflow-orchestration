# spec/join-policy — the interface the join policies sit behind

**Status:** v0.14 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2 acts on the W1 spec-conformity pass**:
`branch.lost` is redefined against
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
(finding B1), suspension events are added, `JP-R5` closes the ordering hole (B4), `live-token` is
pinned to Q4's own wording (D10), and every rule names the item owing its test (D8). **v0.3 acts on
the second pass**: `branch.exited` was defined against a condition that is never true, and
`branch.lost` could not fire for a resolved branch. **v0.4 acts on the third**: `JP-R5` asserted an
invariant that a legal run breaks, and the Q5 table restated a clause ADR 0004 had corrected.
**v0.5 records what W3's pass found about `JP-R5`'s ordering clause**: it is currently implied by
`FD-V9` and cannot be falsified. **v0.6 pins the driver side of section 4**, after W3's second pass
found the driver had no policy seam at all and the join could never fire. **v0.7 records what a
satisfied join carries downstream**, which nothing said and the code was deciding.
**v0.8 is [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
landing in this document** — [W16](../doc/work-items/w16-the-decision-and-what-it-ships.md) under
[P5](../doc/plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md), answering
[Q24](../doc/open-questions.md). Section 3 gains a **third name**,
`live-token-requiring-arrival` — `JP-R8`'s refinement built as `JP-R8` itself prescribes, under its
own `id`, with `live-token` unchanged; `JP-R7`'s is **refused**. Section 4's *"neither pinned policy
ever returns `unsatisfiable`"* is still true and **the consequence drawn from it is not**, so that
paragraph is corrected rather than left standing.
**v0.9 is [W18](../doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
under [P6](../doc/plans/p6-what-may-share-a-scheduler-with-a-driver.md), and it writes down a rule the
driver has always enforced and this document never stated**: section 4's `unsatisfiable` exit is
**once per region and terminal for it**. [Q95](../doc/open-questions.md) is the measurement that the
second half was enforced by one unexercised latch — deleting it left every assertion green — and
section 4 says what it costs when it goes.
**v0.10 is [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
landing in this document** — [W22](../doc/work-items/w22-what-an-inner-join-does-to-the-outer-one.md)
under [P7](../doc/plans/p7-is-a-join-transitive-over-nested-fan-out.md), answering
[Q6](../doc/open-questions.md). Two changes and **section 3 is byte-unchanged**, which is the result
rather than a restraint: **every policy named there is transitive over nested fan-out and none of
them needed a clause for it.** Section 4's `unsatisfiable` exit now **ends the branch it sits in** —
the one behavioural change, and the gap it closes was a `JP-R5` violation that depth 1 could not
express. Section 5's transitivity bullet is replaced by the ruling it was waiting for, and **`JP-R10`
is new**.

**v0.11 is [W32](../doc/work-items/w32-what-a-map-fanout-is.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), taken as a declared LATE exception**, and
it corrects one false sentence: section 1's `branches` row claimed *"a branch's index in this array
is its `branchPath` segment"*, which is true of a `fanout` and false of a `map`. Nothing else
changed. *(This paragraph is W33's: v0.11 bumped the header and recorded itself only in the section 1
note, so the status block jumped v0.10 to v0.12 with no entry for it. Added here rather than left,
because this block is the document's own version history and a missing entry reads as a missing
change.)*

**v0.12 is [W33](../doc/work-items/w33-a-map-at-run-time-arity.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it is the first change to section 3
since [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md).**
A `map` region opens N branches at run time and its `branches` array names **one**, so
`arrival-count`'s `N` was 1 at every arity — and on a three-item map it **routed the join out after
four of six region events with two branches still live**, measured end to end at ladder L2. Section
3's first row now **counts** `branch.opened` instead, which answers the same about every input W4 ran
and something new about an input W4 could not construct. **[Q159](../doc/open-questions.md) is
answered NO and section 1 says so**: a policy is not told which node kind opened its region, because
the one policy that appeared to need that needed the **arity**, and the event stream already carries
it. **Section 5 gains the N = 0 ruling**, and it adds **no POLICY mechanism** — no fourth region
event, no fourth verdict, no definition-level refusal. It does add a `regionEntered` input to
`spec/run-state.md`, which that document's own section 5 records; *"adds no mechanism"* would
generalise past what was measured (`doc/workflow.md` section 1 rule 5's writing clause).

**v0.13 is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it is
[ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
landing in this document** — answering [Q36](../doc/open-questions.md), [Q11](../doc/open-questions.md)
narrowed to the fan-out edge, and [Q154](../doc/open-questions.md). Section 4 gains **`JP-R11`** and
**`JP-R12`**, and the paragraph declaring `null` *"a placeholder rather than an answer"* is replaced by
the answer. **The argument that paragraph made is unchanged** — which event satisfies a join is decided
by fan-out completion order — and `JP-R12` satisfies it by carrying **all** the arrivals keyed by
`branchPath` rather than by carrying none. **`settleJoin` still takes no payload parameter**, and the
owner table gains an **`opened`** row for the moment nothing fixed. **Section 3 is byte-unchanged for
the second version running**: what a policy sees did not move, because a payload is not a region event.


**v0.14 is [W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md), and it is a VERSION
re-dating rather than a rule change.** The `fyflow-scheduler` pin moved 0.3.0 to 0.5.1; section 2's Q5 table is re-dated from 0.3.0 to 0.5.1.
**No rule id, no rule text and no test owed changed** — `core/FyflowScheduler.ts` is **byte-identical**
between the two versions, so every line this document cites is unmoved and every claim it makes about
0.3.0 is true at 0.5.1. *(The bump was first shipped with these documents edited and NOT re-versioned,
which left `spec/README.md`'s column unchanged and made `check-spec`'s `C8` vacuous for the whole
change — the one check that exists to notice a stale version row. W36's conformity reader.)*

**Normative.**

> **This document does not answer [Q4](../doc/open-questions.md) and must not be read as leaning.**
> It fixes an interface, an event vocabulary, and what each policy *name* means. Which policy is
> correct is settled by **W4**, with the branch-routed-away case as an executable test, and recorded
> as **ADR 0003**. Arrival-counting winning is a real outcome
> (`doc/plans/p1-what-satisfies-a-join.md`).

---

## 1. The interface

A join policy is a pure state machine over one fan-out region.

```
JoinPolicy = {
  id:       string                                  // the section 3 names, and only those
  open:     (region: Region) => S                   // region entered
  step:     (S, ev: RegionEvent) => S               // one event
  status:   (S) => 'waiting' | 'satisfied' | 'unsatisfiable'
  describe: (S) => JsonValue                        // for W4's matrix, and a future UI
}
```

`S` is the policy's own opaque state type. Nothing outside the policy reads it; `describe` is the
only way its contents leave.

`JsonValue` is `null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue }`. It is
**not** the structured-cloneable set that `spec/outcome-record.md` section 4 admits for `result` —
`describe`'s output is for display and for a matrix cell, so it is pinned to JSON.

`Region` is computed at instantiation by [spec/flow-definition.md](flow-definition.md) section 4:

| field | type | |
|---|---|---|
| `fanoutId` | string | |
| `joinId` | string | |
| `branches` | string[] | the branch entries of the node that OPENED the region, **in declaration order**. For a `fanout` a branch's index in this array **is** its `branchPath` segment ([spec/task-id.md](task-id.md)); **for a `map` it is not** — see the note below |

> **v0.11 — a `map` region's `branches` is not indexed by `branchPath`, and this row said it was.**
> [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
> makes a `map` a second kind of region opener: it declares **one** branch and the run opens N
> instances of it. `toRegion` is unchanged, so a policy is handed `branches: ['score']` for a map
> region — and index 0 of that array is **not** the `branchPath` segment. The segment is the run-time
> **item index**; `branchIndexOf` refuses rather than answering `0`, and `ID-R6` is why.
>
> **What a policy can and cannot tell, and v0.12 decides that it stays this way.** A policy is handed
> these four fields and no more: it cannot tell a `map` region from a `fanout` region, and
> `opensWith` stays on the internal `RegionSets`. **[Q159](../doc/open-questions.md) is answered NO**
> by [W33](../doc/work-items/w33-a-map-at-run-time-arity.md), and the argument is a measurement
> rather than a taste.
>
> **The question turned out not to be about the KIND.** Exactly one shipped policy read this array —
> `arrival-count`, for its `need` — and what it wanted was never *which kind opened this region* but
> **how many branches this region opened**. A policy able to tell the kinds apart would answer that
> by branching on the kind, which is deciding satisfaction from *why* a region is shaped as it is
> rather than from *what happened in it* — the move
> [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
> settled against. **The arity is already in the event stream**: one `branch.opened` per branch
> opened, before any other event for the region (`JP-R5`). So section 3's first row counts them, and
> this shape needs nothing.
>
> **The two rejected alternatives, both measured, because a refusal that was considered is cheaper to
> read than one rediscovered:**
>
> | | why not |
> |---|---|
> | add a fifth field carrying the arity | it would be a **second source** for a number the event stream already carries, and nothing could see the two disagree — the provenance hazard `doc/workflow.md` section 5 rule 8 (c) is about. `branch.opened` is the one the driver must emit correctly anyway |
> | hand a map region `branches` of length N — the declared entry repeated | `arrival-count` would then need no change at all, and **at N = 0 it would report `satisfied` at `open` and fire a join no branch ever reached** — character for character the defect [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) REFUSED `JP-R7`'s variant for. Measured, not argued |
>
> **`branches` therefore keeps its meaning: the branch entries the DOCUMENT declares.** For a
> `fanout` that is also how many the run opens; for a `map` it is not, and no policy should read it
> as if it were. *(The row above is [W32](../doc/work-items/w32-what-a-map-fanout-is.md)'s conformity
> reader's correction, taken under a declared late exception because **a deferred field is a scope
> call and a false normative sentence is not** — `doc/workflow.md` v0.7 change 3's own case.)*
| `members` | string[] | `region(F)`, sorted by node id so the value is stable across folds |

| id | | Test owed by |
|---|---|---|
| `JP-R1` | **Every method is pure.** No clock, no scheduler, no IO, no mutation of `S`. The same `S` and the same event sequence produce the same `S` — this is what makes ladder L3 a real check rather than an aspiration (`doc/concept.md` section 5). Test: run every event sequence in W4's matrix twice and deep-compare | W2 |
| `JP-R2` | **`describe` returns `JsonValue`.** It is how W4's matrix reports *what the policy thought it was waiting for*, and how a UI would ever show a join ([Q21](../doc/open-questions.md)). A policy whose state is not describable is not usable. Test: `JSON.stringify(describe(S))` round-trips for every state in the matrix | W2 |
| `JP-R3` | **`status` is total.** Every reachable `S` answers one of the three. There is no "unknown". Test: every matrix cell asserts one of the three, and no cell is blank | W4 |

## 2. The region event vocabulary

They are **flow-level facts**, not scheduler outcomes: the driver derives them while routing, and a
policy never sees an outcome record or a scheduler task.

**Terminal** — exactly one per branch, and the branch is finished with the region. The three are
mutually exclusive and exhaustive: a branch either reaches the join, reaches an `end`, or **stops
without reaching either**. `FD-V7`, `FD-V8` and `FD-V10` are what make that exhaustive
(`spec/flow-definition.md` section 4, under `FD-V14`).

**The third case has TWO roads and v0.9 named one**, which is
[W22](../doc/work-items/w22-what-an-inner-join-does-to-the-outer-one.md)'s correction rather than an
addition: this paragraph read *"runs out of eligible edges"*, and `FD-V7`, `FD-V8` and `FD-V10` are
about **nodes**, so they make the *node* road exhaustive and say nothing about a region nested inside
a branch. Since `JP-R10` a branch also stops when **its own inner join can never fire** — nothing in
it settled, nothing was resolved, and the inner join's edge was eligible the whole time. The event is
still `branch.lost`; what widened is the condition below.

| event | fields | emitted when |
|---|---|---|
| `branch.arrived` | `branchPath` | that branch reached the region's join |
| `branch.exited` | `branchPath`, `at` (the `end` node's id) | that branch reached an **`end` node** instead of the join |
| `branch.lost` | `branchPath`, `reason` | **either** (a) a node in that branch reached a terminal state — by settling, **or by being resolved** — and **no edge was eligible** for it (`spec/flow-definition.md` section 3); **or** (b) a fan-out region **nested inside that branch** was declared `unsatisfiable` (`JP-R10`). Both mean the path ended inside the region without reaching an `end` node, which is what the event says; they differ in what stopped it. **(b) is [W22](../doc/work-items/w22-what-an-inner-join-does-to-the-outer-one.md)'s and it is a widening, stated as one** — under (a) alone this event is emitted for a dead join **never**, because a `join` node neither settles nor is resolved and its edge stays eligible while the join simply does not fire |

**Non-terminal** — the branch is still live and the join is still waiting:

| event | fields | emitted when |
|---|---|---|
| `branch.opened` | `branchPath` | the region's **opener** — a `fanout` or, since v0.8, a `map` — opens that branch. *(Read *"the fanout dispatches that branch"* until v0.12, which is wrong twice: a `map` is not a `fanout`, and the driver emits every `branch.opened` **before** dispatching anything, which is `JP-R5`'s own requirement. Section 4's `open` row was corrected from *"the fanout"* to *"the opener"* in this same version; this row is the same fix one section up, found by W33's conformity reader.)* |
| `branch.suspended` | `branchPath`, `at` (node id) | a node in that branch settled `user_action` and parked (ADR 0004 rule 3) |
| `branch.resumed` | `branchPath`, `at`, `resolvedAs` | a resolution record for that node was appended (ADR 0004 rule 4) |

### `branch.exited` is defined on what the branch reached, not on where it went

**Stated because the obvious wording is wrong.** *"The branch left the region"* is how this event
reads, and it is never true: `region(F)` is everything reachable from a branch entry cut at the join
(`spec/flow-definition.md` section 4), so the `end` node a routed-away branch reaches is **inside**
`region(F)`. An implementer computing `to ∉ region.members` emits this event never — and `JP-R4`
below says exactly what that costs: *"deleting `branch.exited` makes P1's case unobservable, which
decides Q4 by omission."*

So the condition is **"the branch reached a node of kind `end`"**, which is local, computable from
the definition alone, and does not depend on region membership at all.

### Q5's four cases are three events, and one of the four is not a separate case

[Q5](../doc/open-questions.md) names four ways a branch can fail to succeed. Read against 0.5.1 they
are not four:

| Q5's case | what it is here | |
|---|---|---|
| a branch task **failed** | `branch.lost` with `reason: 'failed'` | by **either** road — an `optional` node settling, or a human resolving a suspended node `failed` (`RS-R3`). See below |
| an **`optional`** branch resolving `null` | **the same event.** `state = 'failed'` and `resolve(null)` are two lines of one branch (`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`), and `resolve(null)` is invisible to a listener | |
| a branch ending in **`user_action`** | `branch.suspended` — **not** a loss. The branch is still live and the join keeps waiting | |
| a branch **routed away** | `branch.exited` | it reached an `end` node — P1's case |

`reason` therefore has exactly one permitted value today, `'failed'` — reached by **three** roads
since `JP-R10`: an `optional` node settling; a human resolving a suspended node with
`resolvedAs: "failed"` (`RS-R3`), in both cases with no eligible edge to take; and **a nested region
declared `unsatisfiable`**. **The field is kept anyway**, because the alternative is adding it back
later and rewriting every fixture; and its single value is the finding rather than an oversight.

**The third road does not widen the vocabulary, and that is a decision rather than an omission** —
W22's conformity reader, and `doc/workflow.md` section 1 rule 3. A dead join is not a *failure*: no
node failed, and `'failed'` here means *"the path stopped and nothing opted into what stopped it"*,
which is exactly what happened. A second value — `'join-unsatisfiable'`, say — would be readable by a
policy, and **no policy may branch on it**: `JP-R4` sizes the vocabulary for the richer policy, and a
policy that treated one road differently from another would be deciding satisfaction from *why* a
branch ended rather than from *that* it ended, which is the move
[ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) settled
against. **Which region died is already reported**, through `onUnsatisfiableJoin`, on a channel no
policy sees.

| id | | Test owed by |
|---|---|---|
| `JP-R4` | **The vocabulary is sized for the richer policy.** A policy that needs fewer events ignores the rest. Designing it around what arrival-counting needs would delete `branch.exited` and `branch.lost` — and deleting `branch.exited` makes P1's case unobservable, which decides Q4 by omission | W4, as a matrix column that exercises every event |
| `JP-R5` | **At most one terminal event per branch, with nothing after it, and every `branch.opened` for a region precedes any other event for that region.** A branch is `opened` once, may be `suspended`/`resumed` any number of times, and then `arrived`, `exited` or `lost` **at most** once — **not** exactly once: a branch that suspends and is never resolved emits no terminal event at all, which section 4 says is a legal and expected state, and neither does any branch in a run still in flight. An assertion written `count === 1` fails on Q5's `user_action` row. The opening rule is a **driver obligation**, not a policy's problem — see below. **`FD-V22` is what makes the one-`opened`-per-branch half true**: without it a token can enter a branch from outside the region and arrive at a join that never opened it. Test: assert both properties over the event stream of every W5 run, including a run where a branch is resolved | W3 |
| `JP-R6` | **Adding an event is a spec change with its own rationale** (`spec/README.md` rule 1), never a side effect of making a policy work | — |

### JP-R5's ordering clause is currently unfalsifiable, and that is `FD-V9` doing it

**Stated because a reader will otherwise mistake the driver's two-pass emission for the thing making
this true, or mistake a passing test for evidence.** `FD-V9` requires every branch entry to be a
`task`, and entering a task **dispatches without emitting** — so no event can appear between two
`branch.opened`s no matter how the driver is written. W3's conformity pass replaced its two-pass
loop with an interleaved one and the whole suite still passed, because the two implementations are
**behaviourally identical under `FD-V9`**.

Three consequences, and the third is the one that matters:

1. The rule is not redundant. It is **insurance**, and it becomes load-bearing the moment `FD-V9` or
   `FD-V19` is relaxed ([Q27](../doc/open-questions.md)) — a branch entry that is an `end`, or a
   shared node, emits on entry and the order becomes observable.
2. **No test can currently distinguish a conforming driver from a non-conforming one**, so a green
   suite is not evidence for this clause. W3's test asserts the invariant over a real stream, which
   catches a driver that emits `branch.opened` *after* a terminal event; it cannot catch
   interleaving.
3. **A driver written after `FD-V9` is relaxed will not be caught by the existing test**, which is
   why this paragraph exists rather than a `TODO`.

### Why JP-R5 fixes the opening order, and why that is not a thumb on the scale

Without it, `opened(0) → arrived(0) → opened(1)` is a legal stream: a policy counting live branches
sees the count reach zero while branch 1 is still running, and the join fires early.

> **v0.12 — `arrival-count` is NO LONGER immune, and this paragraph said it was.** It read
> *"`arrival-count` is immune, because its `N` comes from `region.branches.length` at `open`"*, which
> was true for as long as that was the source. Since section 3's re-sourcing, `N` is counted from
> `branch.opened` — so **both counting policies now depend on this rule**, and on the stream above
> `arrival-count` would see `N = 1` when branch 0 arrives and fire with branch 1 about to open.
>
> **The clause is still unfalsifiable through a conformant driver, and its guarantor is now two rules
> rather than one.** `FD-V9` makes every `fanout` branch entry a `task` and `FD-V25` makes a `map`'s
> branch a `task`; entering a task **dispatches without emitting**, so no event can appear between
> two `branch.opened`s whichever kind opened the region. Consequence 3 below is therefore unchanged
> and consequence 1's *"it becomes load-bearing the moment `FD-V9` or `FD-V19` is relaxed"* gains
> `FD-V25` to its list. **What changed is not whether the rule can be broken but how much rests on
> it**, and that is worth saying in the document rather than leaving a reader to infer it from a
> policy.

**The fix belongs in the driver rather than in either policy.** A rule saying *"seed the count from
`branches.length`"* would repair `live-token` by making it more like `arrival-count`, which is a
Q4-relevant change dressed as a bug fix. A rule about **when the driver emits** is neutral between
the two and is true of the real system anyway: a fanout dispatches all its branches in one turn.

## 3. What each policy name means

**This section fixes the names, not the winner.** W4 compares the two policies P1 named; a
comparison against some third thing is a different experiment. **The first two** are pinned to
[Q4](../doc/open-questions.md)'s own wording, and where a pin needed a clarification to be
well-defined at all, the *minimal* one was taken. **The third is not one of the two P1 named and must
not be read as a column of that comparison** — it is `JP-R8`'s refinement, adopted by
[ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
under its own `id` as `JP-R8` itself prescribes.


| `id` | Definition |
|---|---|
| `arrival-count` | `N` is **counted from `branch.opened`** — one per branch the region opened. `satisfied` when `N` distinct `branch.arrived` events have been seen **and `N` is at least one**. **Never `unsatisfiable`.** Every other event is ignored |
| `live-token` | `open` starts a live count at zero. `branch.opened` increments; `arrived`, `exited` and `lost` each decrement; `suspended` and `resumed` do neither. `satisfied` when the count reaches zero **having been positive**. **Never `unsatisfiable`** |
| `live-token-requiring-arrival` | As `live-token`, and additionally counts `branch.arrived`. `satisfied` when the live count reaches zero **having been positive** *and* **at least one `branch.arrived` has been seen**; **`unsatisfiable`** when the count reaches zero having been positive with **no** arrival; `waiting` otherwise. `suspended` and `resumed` still do neither. **Neither verdict latches** — a later `branch.opened` puts it back to `waiting`, exactly as `live-token`'s `satisfied` does, because `status` is a pure function of the current state (`JP-R3`) |

**v0.12 changes `arrival-count`'s row, and `live-token`'s is still byte-identical to what W4 ran.**
That sentence used to cover both of the first two and now covers one, which is stated rather than
quietly narrowed. What changed is where `N` comes from; **what it answers did not**, and the
distinction is the whole argument:

| | |
|---|---|
| **what forced it** | a `map` region's `branches` names the **one** entry the document declares whatever the run opens ([ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)), so `N` was **1** at every arity. Measured end to end at ladder L2 on a three-item map: this policy **routed the join out after four of six region events, with two branches still live**. Every failure W4 recorded was `N` too **large**, which hangs and which `ADR 0015` names; this was `N` too **small**, which **completes the run wrong** — a successor dispatched over work that had not happened, for which there is no vocabulary and should not have to be |
| **why it is not `JP-R7`'s line** | `JP-R7` forbids **decrementing `N` on `branch.exited`**, which changes three of the nine matrix rows and makes this policy survive P1's case. Counting `branch.opened` changes **no** verdict: a `fanout` emits exactly one `branch.opened` per declared entry, so on every static region the two sources are the same number — **measured, 6 of the corpus's 6 STATIC regions** (it holds eight; the other two are `map`), **with all 36 matrix cells unmoved**. P1's routed-away case still hangs. It answers the same about every input W4 ran and something new about an input W4 could not construct |
| **the asymmetry inside `step`** | arrivals are de-duplicated by `branchPath` and opens are **counted as events**, on the half v0.12 just made load-bearing. The direction of harm is why: a duplicated open over-counts `N` and **hangs**, which is the failure direction `ADR 0003` already records for this policy, while a duplicated arrival would fire it **early**. `JP-R5` makes neither reachable through a conformant driver |
| **the one behaviour that moved** | on a **non-conformant** stream — a `branch.opened` arriving *after* a terminal event, which `JP-R5` forbids and a driver cannot produce — this policy used to stay `satisfied` and now returns to `waiting`, which is what `live-token` already did. **One VERDICT** in the repository asserted the old answer, and its own message read *"neither answer is wrong here — the stream is not conformant"*. **Three expected values moved in total** — that verdict, plus two `describe`s whose fixtures stepped `branch.arrived` having never stepped `branch.opened`, which is a branch arriving at a join it never entered. Those two are fixtures corrected toward conformity rather than behaviour that changed |
| **why `at least one`** | a bare *"N distinct arrivals"* is true at `0 >= 0`, so without the pin `open` itself reports **`satisfied`** for a region that opened nothing. That is exactly `JP-R8`'s *"having been positive"* argument, in the policy that argument was denied to, and it is **vacuous on every `fanout`** because `FD-V9`'s floor puts `N` at two or more. *(**This row said the join would FIRE, and that is false against the driver this version ships** — W33's conformity reader. Measured with the pin deleted and everything else as shipped: `ids=[]`, `outcome=stuck`. The only call site that could have fired it at N = 0 was removed by this same item, on the ground that the answer there is fixed at `waiting` — **which is true because of the pin**. The two changes were circularly load-bearing and neither alone moves anything. What the pin reachably buys is that `joinStatusOf` does not report `satisfied` to a consumer about a region no branch entered, which is `JP-R2`'s channel and worth having. Corrected in place under this document's own standard, quoted in `settleJoin`: *a defensive clause that cannot fail is not a defect; describing it as though it could is*.)* |

**And it makes `JP-R5`'s ordering clause load-bearing for a second policy** — see that rule's own
subsection, whose *"`arrival-count` is immune"* sentence v0.12 corrects.

**One observable DID move on a static region, and it is `describe` rather than a verdict.** Asked
**inside** the opening burst — `joinStatusOf` called from an `onRegionEvent` listener, which is a
pairing `AGENTS.md` advertises — this policy now reports `need: 1` on a two-branch fanout's first
`branch.opened` where it used to report `need: 2`, reaching `need: 2` on the second. **No verdict can
differ**, because a `satisfied` answer needs an arrival and `JP-R5` puts every open before one; but
`describe` is `JP-R2`'s channel — *"how a UI would ever show a join"* — and the driver steps the
policy **before** notifying the observer precisely so that this observation point exists. Measured by
W33's conformity reader, and stated here rather than left for a consumer to notice.

| id | | Test owed by |
|---|---|---|
| `JP-R7` | **A variant of `arrival-count` that decrements `N` on `branch.exited` is a third policy, not a repair of the first.** If it is built it is built under its own `id` ([Q24](../doc/open-questions.md)). **Not built — refused by [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)**, which measured what it does over all nine matrix rows: it is `live-token` weakened, never strengthened. Every row on which it differs from `live-token` is a row where it reports `waiting` and `live-token` is `satisfied`, and it cannot report `unsatisfiable` — so the whole of its contribution is a **silent hang** where the adopted policy proceeds. The rule stands as written and now cites the decision that applied it | W4 |
| `JP-R8` | **A variant of `live-token` that requires at least one `branch.arrived` before reporting `satisfied` is likewise a third policy** ([Q24](../doc/open-questions.md)). The `having been positive` clause is a pin, not a refinement: a bare *"count is zero"* is true before any branch opens, so without it `open` itself reports `satisfied`. **Built, and built the way this rule requires — under its own `id`, `live-token-requiring-arrival`, with `live-token` unchanged** ([ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)). This rule was **followed, not overridden**: what it forbids is the refinement written *into* `live-token`, and that is still forbidden | W4, and **W16** for the shipped policy |
| `JP-R9` | **Every key of `POLICIES` names a row of the table above, and every row names a key.** A policy *shipped* under a name this document does not fix, or a name fixed here with nothing behind it, is a defect in whichever half is younger. **The rule is about `POLICIES`, not about every object that satisfies the interface** — a `JoinPolicy` written in the test tree and run as a matrix column is neither shipped nor named here, and [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) rule 3 **requires** one to exist: `arrival-count-decrementing` is a refused refinement that is still executed so the refusal can be falsified — **This is what ADR 0025 makes checkable**: the set was frozen at two by four hand-written literals, and the rule that lets it grow is the rule that needs the two halves compared rather than copied. Test: `scripts/check-policies.mjs`, run by `npm run gate` | **W16** |
| `JP-R10` | **A join that can never fire ends the branch it sits in.** When `status` is `unsatisfiable` for `region(F)` and `F` is itself inside a region, the driver emits `branch.lost` for **`innermost(F)`** — `spec/flow-definition.md` section 4's term, the region `F`'s own `fanout` node is most tightly in — at `F`'s own `branchPath` (`spec/task-id.md` section 1). **`innermost` and not *some* enclosing region**: at depth 3 there are two, and naming the inner one is what makes the cascade below reach the rest in order. Three things this is **not**: it is not a new **event**, though it IS a widening of section 2's emission condition and that section says so rather than this rule implying otherwise — `JP-R6` asks for a rationale, not for a new name, and the rationale is that a dead join ends a path exactly as an ineligible edge does; it is not the driver deciding the enclosing region's verdict, which stays section 4's owner table and [ADR 0001](../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 1's — that region's policy is stepped with the fact and answers for itself; and it is not a walk outward, because the enclosing region may in turn be `unsatisfiable` and the same clause applies to it, so the cascade is one rule applied repeatedly rather than a traversal. **Why it is a rule and not a note**: without it that branch has **no terminal event at all** in a run that is neither suspended nor in flight, which `JP-R5`'s own enumeration does not admit, and `RunState.regions[G].settled` simply omits it. **Unobservable at depth 1**, where `F` is in no region — which is why this document could stand at v0.9 without it. Test: `test/driver/surface.test.ts`, in both fanout declaration orders and at depth 3; and `test/matrix/matrix.test.ts`' `nested-inner-all-exit` row | **W22** |

### JP-R7 and JP-R8 — the one-line changes that would delete P1

Arrival-counting fails P1's case because `N` is fixed and one branch never arrives. The obvious fix
is to decrement `N` when `branch.exited` arrives — one line, and it makes arrival-counting survive
the case.

**A W2 implementer who writes that line has answered Q4 before W4 ran**, and the answer is *"the two
policies are equivalent"*, which is false about the two policies the plan named and true only about
a third one nobody proposed. Worse, it would look like a passing test.

`JP-R8` is the same guard pointed the other way, and it exists because **v0.1 of this document
failed it.** `live-token` was written with an extra clause — *satisfied only if at least one branch
arrived, otherwise `unsatisfiable`* — which handed it a graceful answer on the all-branches-exited
row that `arrival-count` was explicitly denied. The argument in `JP-R7` is symmetric and had been
applied in one direction only. Both policies are now pinned to Q4's wording plus the minimum needed
to be well-defined, and **both refinements are Q24**, to be built as named variants if W4's result
makes them interesting. Either may well be the right answer; neither is one of the two things P1 is
measuring.

**Q24 is answered and the two rules got different answers**
([ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md),
from W15's four-column matrix rather than from the argument above). **Both guards worked**: each
refinement was built under its own `id` and run against all nine rows before either was ruled on, and
what that showed is that they **point in opposite directions** rather than being two sizes of the
same move.

| | what running it showed |
|---|---|
| `JP-R8`'s | changes **one** row, `all-exit`, and changes it from *"the join fires having been reached by nothing"* to *"the join can never fire, and here is the state that says so"*. **Adopted**, under its own `id`, with `live-token` byte-identical |
| `JP-R7`'s | changes **three** rows — `routed-away`, `optional-null`, `all-exit` — and one of the three is `all-exit`, where it decrements `N` to **zero against an empty arrival list** and so fires a join **no branch reached**. It is a second road to the very defect `JP-R8` removes. **Refused** |

**The paragraph above is left standing rather than rewritten**, because its warning is about a W2
implementer writing either line *into* an existing policy, and that is still exactly as wrong as it
was: what ADR 0025 adopted is a third `id`, which is what this rule asks for.

## 4. `unsatisfiable`, and what it is not

`status` has three values because [Q7](../doc/open-questions.md) needs a stuck join to be
**reportable** rather than observable only as a hang. A stuck join has nothing queued and nothing
running, so no `resource.blocked` fires and `getAdmissionQueue()` is empty — 0.3.0's resource events
make a *scheduler-level* stall legible and say nothing about this one
(`doc/scheduler-upstream.md`). Detection is entirely ours.

**Neither pinned policy ever returns `unsatisfiable`, and that is a result rather than a gap.** That
sentence is about `arrival-count` and `live-token`, it was true when W4 ran and **it is still true**:
neither was changed by
[ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md).
The value stays in the interface because `JP-R3` requires `status` to be total for **every** policy,
and because removing it would have to be added back by whichever policy wins. *(That last clause is
vestigial since 2026-08-31: a policy has won, and a third one now returns the value rather than
hypothetically needing it back.)*

**The consequence v0.6 drew from it is what stopped being true, and it is corrected here rather than
left standing** (`spec/README.md` rule 1). This document read: *"It means P1 ships with no policy that
can say 'this join can never fire', so a stuck join in W4 is detected by the driver or not at all —
which is precisely the pressure [Q7](../doc/open-questions.md) describes."* **P1 shipped no such
policy; P5 does.** `live-token-requiring-arrival` returns `unsatisfiable` on the all-branches-exited
row, and section 3's third row is what it means. So:

| | |
|---|---|
| what is **unchanged** | quiescence is still the only *general* detection, and it is still **the fold's** — `stuck` is decided in run state from `regions[…].joined !== true` ([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md), `RN-R10`), not by the driver, whose `joinStatusOf` is a per-region accessor. A policy can say `unsatisfiable` only about the shapes its own state can see, and `live-token-requiring-arrival` sees exactly one: every branch terminal, none arrived |
| what **changed** | *"detected by the driver or not at all"* was already the wrong half of a true sentence — detection is the fold's — and it is now false for that one shape in a second way, and it is the shape [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) records as `live-token`'s cost. A run that **completes** under `live-token` is **`stuck` with `joined: false`** under this policy — reported through `onUnsatisfiableJoin` with the policy's own `describe`, and visible in `RunState.outcome` to a consumer who registers no callback at all |
| what is **still open** | [Q7](../doc/open-questions.md), unnarrowed on its own terms. This is not a timeout and gives a join no clock; it makes **one more** class of dead join reportable without one, which is the same direction [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) already pushed Q7 in |

**v0.7's clause for this exit was written by [W18](../doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
and it is a rule this document did not have.** The `satisfied` row has said *"at most once per region
however many events follow"* since W3; the `unsatisfiable` row said only *"reports it … and routes
nowhere"*, which fixes no multiplicity and says nothing about a policy that answers `unsatisfiable`
and then `satisfied`. **One latch in the driver has always enforced both**, and
[Q95](../doc/open-questions.md) is the measurement that it enforced the second **untested**: deleting
it left all 386 assertions green. So the behaviour is not new and the sentence is — which is exactly
the state `doc/workflow.md` section 1 rule 3 refuses (*a decision not in `spec/`, an ADR or a plan did
not happen*), and W18's two Q95 cases were asserting it before this row said it.

**Why *terminal*, and not merely *once*.** Reporting twice is untidy; **routing out of a join already
declared dead is a correctness failure with a name.** Measured with a stub that answers
`unsatisfiable` on the first arrival and `satisfied` on the second: without the latch the driver
dispatches the join's successor, `regions[…].joined` becomes `true`, and `RunState.outcome` goes from
`stuck` to `completed` — with `hasFailed()` false throughout. That is character-for-character the
false statement
[ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists to remove,
reached through the driver's own surface. **`spec/join-policy.md` is [W1](../doc/work-items/w1-the-normative-layer.md)'s
and was not in W18's `Owns`; the exception is declared late in that item's Exceptions table rather
than the rule being left unwritten**, which is the trade `doc/workflow.md` v0.7 change 3 made for
`doc/decisions/**` and has not made for `spec/**`.

**`unsatisfiable` is not a timeout and does not decide Q7:**

| | owner |
|---|---|
| what a policy returns | this document, section 3 |
| what the driver does when a join is `unsatisfiable`, and how it detects a stuck one when no policy says so | W3 — **built**: it reports the policy's own `describe` through a callback and does **not** route out of the join, and `joinStatusOf(fanoutId)` is the whole of stuck-join detection today |
| what run-level outcome that becomes | W2 — [Q17](../doc/open-questions.md), [Q25](../doc/open-questions.md) |
| whether a join may time out at all | [Q7](../doc/open-questions.md), W4 |

**A join waiting on a suspended branch is not stuck.** It is waiting on a person, and
`branch.suspended` is what lets anything tell the difference. Reporting *"waiting on a human"* as
*"stuck"* is the specific mistake this event exists to prevent (ADR 0004, *Consequences*).

### What the driver owes a policy, and what it does with the answer

**Fixed here because W3 shipped once with none of it**, and a driver that emits every
`branch.arrived` and then stops is indistinguishable from the hang this plan exists to attribute to
a policy.

| | |
|---|---|
| **open** | The driver calls `open(region)` when the region's opener is entered, **before the first `branch.opened`** — the same constraint `JP-R5` states from the other side. **v0.12: "the opener", not "the fanout"** — a `map` opens a region too, and it does so at the same point in the traversal. A map's arity is known only once the previous node settles, and the map node is entered *because* it settled, so N is known **at this call** exactly as a fanout's is: the two-pass emission below is available to both |
| **entered** | The driver records that the region was **entered**, whether or not it opens a branch. `spec/run-state.md`'s `regions` is *"one entry per fan-out region ENTERED"* and until v0.8 nothing could supply that for a region opening nothing, because `FD-V9`'s floor makes a `fanout` open at least two. **A map of zero items separates *entered* from *opened at least one branch***, and without this the fold reports such a run **`completed`** — see section 5 |
| **opened** | Each branch the opener opens is entered with **its own copy** of what `JP-R11` gives it — for a `fanout` the value the fanout node received, for a `map` that instance's own item. **A row of this table since v0.13, and before that the driver's choice**: `open` and `satisfied` fixed what the driver owes at the two ends of a region and nothing fixed what it hands the branches in between, which is the gap [Q154](../doc/open-questions.md) lived in |
| **step** | **Every** region event is forwarded, all six. `JP-R4` sizes the vocabulary for the richer policy, so a policy ignores what it does not need; a driver that filtered would decide Q4 by omission |
| **status** | Asked after **every terminal event**, not only on arrival — a join can become satisfiable because the last live branch was `lost` or `exited` without anything arriving, which is P1's case |
| **satisfied** | The driver routes out of the join's single edge, **at most once** per region however many events follow. **It carries the arrived branches' results keyed by `branchPath`** — `JP-R12` below. *(Read *"it carries `null`"* until v0.13, which was a placeholder and said so.)* |
| **unsatisfiable** | The driver **reports** it with the policy's own `describe`, and routes nowhere. It does **not** invent a run-level outcome: that vocabulary is run state's ([Q25](../doc/open-questions.md)). **Once per region, and terminal for it: however many events follow, the join is not reported again and is not routed out of — including when the policy later answers `satisfied`** ([W18](../doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md), [Q95](../doc/open-questions.md)). **And it emits `branch.lost` for the branch of the ENCLOSING region that the dead region sits in, at that fanout's own `branchPath`** — `JP-R10`, [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) rule 4. For a region in no region there is nothing to emit and nothing is emitted, which is why this said nothing until nesting existed |
| **no policy at all** | A definition containing a fan-out is **refused at instantiation**. The alternative is a run that dispatches every branch, sees every one arrive and stops silently — a second cause behind the observation P1 turns on |

### What a branch receives and what a join carries — v0.13

[ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md),
answering [Q36](../doc/open-questions.md), [Q11](../doc/open-questions.md) **narrowed to the fan-out
edge**, and [Q154](../doc/open-questions.md). **Both moments are this section's** — the driver opens a
region and the driver routes out of a satisfied join — so both rules live beside the owner table that
already fixes them, rather than a payload contract being split across the three documents that
mention the word.

**This replaces a paragraph that said `null` was a placeholder, and the argument that paragraph made
is UNCHANGED and is what rule `JP-R12` is built to satisfy.** It read: *"`status` is asked after every
terminal event, so which event satisfies a join is decided by fan-out completion order … a join that
forwarded 'whichever branch finished last' would make a run's data order-dependent, which is worse
than a flaky test: it is a flaky result."* **Every word of that is still true.** What changed is the
observation that the order-dependence is in *which one*, and that carrying **all of them, keyed by the
branch each arrived on**, is not picking one: the collection is the same value whatever order the
branches settled in. **`settleJoin` still takes no payload parameter**, which is the guard that kept
this a question rather than a convention; the driver records arrivals as they happen and reads the
whole map at the exit.

| id | | Test owed by |
|---|---|---|
| `JP-R11` | **What a branch the opener opens receives is a property of the OPENER, and no two nodes ever receive the same object.** A **`fanout`** branch entry receives the value the fanout node received, **as its own copy**. A **`map`** instance receives **its own item** — `over`'s array at that instance's index — **as its own copy**. *Its own copy* rather than *its own value* in both halves, because `structuredClone` preserves aliasing **within** one clone: `{items: [x, x]}` survives the edge hop as an array holding one object twice, so indexing alone does not give the invariant. **Before this rule one clone was shared N ways** and a branch mutating what it was given mutated its siblings' input ([Q154](../doc/open-questions.md)) — measured as `a.payload === b.payload` being `true` for a `fanout`, and **every pair** being `true` for a map. **It is a driver-level fact in both pool kinds and only its OBSERVABILITY differs**: measured on a real scheduler, an inline sibling saw the other's write and a threaded one did not, which is why the rule is not conditioned on the pool — the driver cannot see it, and that is `OR-R2`'s own reason for cloning *including where it is redundant*. Test: at ladder L2, `a.payload === b.payload` for a `fanout` at **arity 2 AND at an arity above 2** — a two-branch fixture has one pair, so a driver that copied for all but one branch would pass it; for a `map` at **N = 1, 2, 3 and 7**, N = 1 being the arity a `fanout` can never reach (`FD-V9`'s floor) and the one where the pairwise check iterates **zero** pairs; that a map instance receives `over[i]` and **not** the value the map node received, asserted **at N = 1 as well**, because at that arity the two differ by one array wrapper and nothing else; and the constructed `[x, x]` case, asserting the two instances do not share. **The invariant is about OBJECTS**: a map over repeated primitives (`['a','a']`) hands two instances the same primitive and that is not a violation, because a primitive cannot be mutated | **[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)** |
| `JP-R12` | **A satisfied join carries an object keyed by `branchPath`, one entry per branch that emitted `branch.arrived`, whose value is what that branch carried into the join.** Keys are inserted in **ascending `branchPath` order, compared segment-wise as numbers** — so `1` precedes `1.0` precedes `2` precedes `10` — which is what makes the object the same value whatever order the branches settled in. **A branch that was routed away, lost, or is still suspended has NO entry**, so the key set is exactly *which branches arrived* and is not the region's width; a join nothing arrived at carries `{}`, which is live rather than defensive because `live-token` fires over an all-exited region ([ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s recorded cost). **The key order must be PINNED and that is not decoration**: measured, integer-like object keys are re-ordered ascending **by the language**, so a depth-1 join is deterministic for free, while **dotted keys keep insertion order — which for a join is settlement order.** The hazard is therefore invisible at depth 1 and live at depth 2. Test: at ladder L5, every cell whose join fires, asserting the collected object against a value derived from the row's own steps; the all-exited row asserting `{}`; a routed-away row asserting the absent branch has no key; **a branch that arrived carrying `null`, asserting it has a KEY** — the clause distinguishing *present with `null`* from *absent*, which every other row leaves unexercised because their arrivals all carry objects. **The key-order clause is tested at L2, not at L5, and the reason is structural**: every depth-2 matrix row settles its inner branches in ascending path order, so insertion order already equals sorted order there and no L5 cell can discriminate. The discriminating fixture is a map at **N = 12 nested in a fan-out branch, settled descending** (`1.0 … 1.11`), where unsorted, lexicographic and segment-wise-numeric give three different answers. **The *suspended* road has NO live case and cannot have one**: no shipped or variant policy fires a join while a branch is parked — `arrival-count` is short an arrival and both live-token variants still hold a token — so that third absence road is recorded as untestable rather than left looking covered | **[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)** |

**What is NOT decided here, named rather than left implicit.**

- **A declared reducer on the join node** — [Q36](../doc/open-questions.md)'s second candidate — is
  **not built**, and not because it is wrong:
  [ADR 0002](../doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
  rule 3's registered-by-name mechanism would carry it exactly as it carries `when`. It is refused
  because **a reducer is a function of what the join collects, so it cannot be specified before
  `JP-R12` is**. `JP-R12` is what a reducer would receive, and adding one is additive.
  [Q165](../doc/open-questions.md).
- **[Q11](../doc/open-questions.md) in general.** `JP-R11` is about the fan-out edge. An ordinary edge
  still carries the previous node's `result` unchanged, a run-scoped accumulator is still unbuilt, and
  a per-edge mapping is still unbuilt.
- **What a map instance LOSES** by receiving its item rather than the value around it —
  [Q166](../doc/open-questions.md), which is Q11-in-general's to fix.
- **[Q8](../doc/open-questions.md)** — what a decision sees. A predicate still receives one field,
  the node's effective outcome (`OR-R9`), and `JP-R12` does not change it.

**The driver ships no policy.** All three are W2's, `JP-R7` and `JP-R8` pin what their names mean,
and W4 decides between the first two. A driver carrying a default would answer
[Q4](../doc/open-questions.md) from inside W3 — and it would now also answer, from inside W3, the
question ADR 0025 deliberately left open: **which of the three an application should pass is still
one global choice per run**, made by the caller, and whether it may be made per *join* is
[Q5](../doc/open-questions.md)'s remainder, which a third policy makes sharper and does not answer.

## 5. What this document does not fix

- **Whether a policy is per-join configurable** rather than global ([Q5](../doc/open-questions.md)).
  P1 runs one policy per whole run so the matrix has two columns rather than a product. *(Four columns
  since W15 — still one policy per run, and still not a product.)*
- **Transitivity over nested fan-out** ([Q6](../doc/open-questions.md)) — **answered, by
  [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
  ([W22](../doc/work-items/w22-what-an-inner-join-does-to-the-outer-one.md)), and the answer needed
  no clause in section 3.** Every policy named there is transitive, measured over four depth-2 rows
  against all four matrix columns: **each region behaves exactly as the depth-1 row of the same shape
  does**, statuses and `describe`s alike, with only the branch paths renamed. Nesting adds no
  mechanism — an outer region's `branches` is unchanged by what nests inside it, and an inner join
  firing enters the outer join at the path its own `fanout` sits at, which **is** the outer branch's
  arrival. *(This bullet twice recorded the question as open on grounds that had stopped being true.
  It read "`FD-V15` refuses nested fan-out, so … the question stays clean for P2" until
  [W20](../doc/work-items/w20-what-a-nested-region-is.md) retired the rule, and then "no policy has
  been ruled transitive over one" until this. Both corrections were made in place — `spec/README.md`
  rule 1 — rather than the wrong version being deleted.)*
- **What a policy-dependent refusal of nesting would have been.** [P7](../doc/plans/p7-is-a-join-transitive-over-nested-fan-out.md)
  proposed refusing a nested definition under `arrival-count` at `Driver` construction, on the ground
  that *"`N` is fixed at the outer branch list and an inner branch has no way to be counted"*.
  **Measured false and not built**: `N` is per-region, and `arrival-count` reports `satisfied` at both
  depths on an all-arriving nested flow. Its depth-2 hangs are its depth-1 hangs at a second region,
  and [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
  already decided that trade. Recorded here because a refusal that was considered and rejected is
  cheaper to read than one rediscovered.
- **The run-level outcome** of a join that never fires. See section 4.
- **Whether a map of ZERO items should be a policy's CHOICE.** Ruled on below rather than left
  implicit; what is *not* fixed is the question one layer out.

### N = 0 — a map over an empty list, and why it adds no POLICY mechanism — v0.12

**`FD-V9`'s arity floor means the static feature can never reach this**; a `map` produces it the
first time a filter returns nothing, and it is the one place a map is not the static feature at a
different arity ([P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md) fact 5). The ruling, by
[W33](../doc/work-items/w33-a-map-at-run-time-arity.md):

> **All three policies answer `waiting`, the region is recorded as ENTERED, and the FOLD reports the
> run `stuck` — at every depth and including a `map` at the `entry` node. A map region nested in a
> branch additionally ends that branch, by `JP-R10`'s rule and without a policy verdict. No fourth
> region event, no fourth verdict, and no definition-level refusal.**

| | |
|---|---|
| **why not a definition-level refusal** | there is nothing to refuse. A map's arity is **not in the document at all** ([ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md), and `spec/flow-definition.md` section 4's *"What a map changes"*), so a map of zero items is an ordinary run of a definition that validates. `FD-V9`'s floor and `FD-V11`'s reachability cannot fire for an arity reason |
| **why no policy says `unsatisfiable`** | **none can tell.** A policy's state after a region opens nothing is byte-identical to its state before any branch opens — `live-token` reads `{live: 0, positive: false}` in both — so the distinction does not exist inside the interface. That is not an oversight in the policies; it is what `open` plus six branch events can express |
| **why not a fourth event to let them tell** | `JP-R6` asks for a rationale, and the only available one is *"so a policy can choose"*. The two readings — the region finished, and the region failed — reach the same **run-level** answer, `stuck`; what differs is the **reason**, which is exactly [Q97](../doc/open-questions.md), open since P5 with **ADR 0026 held for it**. Building the event here would answer Q97 from **one case**, which is the failure `doc/workflow.md` names as *a claim written from a mechanism instead of from the cases*. Left for whoever answers Q97, **with the narrowing below in hand** |
| **why not let the driver fire the join** | it would be the driver deciding satisfaction, which [ADR 0001](../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 1 and section 4's owner table both forbid |

> **The scope this ruling was MEASURED at, and the two places it was wrong** —
> `doc/workflow.md` section 1 rule 5's writing clause, and W33's adequacy reader. The four rows above
> were written from **one** shape: a `map` at depth 1, reached through a task that had already
> dispatched. Both other shapes a map can be in were wrong, and neither is exotic:
>
> | | what was measured |
> |---|---|
> | a `map` as the **`entry`** node | the run reported **`running`**, not `stuck`. `FD-V3` refuses only a `join` or an `end` as `entry`, so this is legal — and nothing had been dispatched, so `RunState.nodes` was empty and the fold's *nothing-has-happened-yet* clause returned before `RN-R10`. `RN-R12` then calls the run unfinished, so a clock-free harness waits on it **forever**. The depth-1 case passed only because its `ingest` task put a node in `nodes` first |
> | a `map` **nested** in a branch | the enclosing branch was **opened with no terminal event at all**, which `JP-R5`'s own enumeration does not admit. `JP-R10` exists for exactly this shape and **could not fire**, because it triggers on a policy answering `unsatisfiable` and this ruling is that no policy can |
>
> **The second narrows the fourth-event rejection above rather than merely being a bug.** That row
> says both readings *"reach the same run-level answer"*; at depth 2 they do not — one of them
> produces a stream that breaks `JP-R5`. The rejection stands, because the fix does not need a policy
> to choose: **that a region which opened zero branches can never be satisfied is arithmetic over
> section 2's vocabulary**, not a judgement. `branch.arrived` is emitted only for a branch that was
> opened, so with none opened no arrival can occur, and every policy section 3 fixes needs one. So the
> driver emits `JP-R10`'s consequence — `branch.lost` for the enclosing branch — and does **not**
> report a join verdict: no `joinSettled`, no `onUnsatisfiableJoin`, and `joined` stays `null`,
> because `RN-R11` gives `false` the meaning *"a policy reported it unsatisfiable"* and none did.
> **The driver reports a routing fact it alone knows; the enclosing region's policy decides what it
> means.** Section 4's owner table is intact.
>
> **What this leaves for whoever answers [Q97](../doc/open-questions.md)** is a sharper question than
> the row above states: the case for a fourth event is no longer *"so a policy can choose between two
> readings that agree"* — it is that a policy cannot see a fact the driver has to act on alone.
>
> **And the *"why no policy says `unsatisfiable`"* row's scope is narrower than it reads — v0.13.**
> It says *"**none can tell**: a policy's state after a region opens nothing is byte-identical to its
> state before any branch opens"*, and that is **true of the three policies section 3 names** and
> false of a policy in general. `arrival-count-decrementing` — `JP-R7`'s refused variant, which
> [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
> rule 3 requires to stay executable — has **no `need > 0` pin**, so `0 >= 0` reports **`satisfied`**
> at `open`. Measured at ladder L5 on the `map-zero-items` row by
> [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md), which is the first
> input in the repository that could show it.
>
> **This makes W33's removal of the N = 0 `settleJoin` call load-bearing, where that item measured it
> as costing zero.** Its argument was *"the answer is fixed, so the call claims to consult a policy
> when it cannot"* — right about the shipped three, and with the call restored this variant would
> **route the join's successor out over a region no branch ever reached**, which is character for
> character what ADR 0025 refused it for. The ruling is unchanged; what is corrected is the reason
> given for one row of it (`doc/workflow.md` section 1 rule 5's writing clause, the same clause this
> section was already corrected under once).

**What makes the ruling safe rather than merely quiet is the *entered* row in section 4, and it was
measured before it was written.** Without it a map of zero items appends **nothing at all**: the
fold's `regions` is `{}`, `RN-R10` iterates nothing, and the run reports **`completed`** having
reached no `end` node — through the fold's final fall-back rather than by any positive
determination. That is character for character the false statement
[ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists to remove,
and it is the same shape [W32](../doc/work-items/w32-what-a-map-fanout-is.md)'s conformity reader
found behind a missing `default` arm one item earlier. **With it, the run is `stuck` and visible in
`RunState.outcome` with no callback registered, no poll and no clock**, which is where
[ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) already
put detection.
