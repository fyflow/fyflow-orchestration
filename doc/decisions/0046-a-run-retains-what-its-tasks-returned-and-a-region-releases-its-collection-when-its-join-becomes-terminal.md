# ADR 0046 — A run retains what its tasks returned, and a region releases its collection when its join becomes terminal

**Date:** 2026-09-11
**Status:** accepted
**Raised by:** [Q19](../open-questions.md), decided by
[W53](../work-items/w53-what-a-run-retains-that-nothing-reads.md) under
[P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

## Context

**[Q19](../open-questions.md) has asked *is per-run retained state bounded?* since P1, and its owner
cell said *no owner — needs a measured run* for fourteen plans.** `spec/run-state.md` section 6
carried the same question as an unanswered bullet since v0.1, in the form *"a run's footprint is
proportional to its dispatched-node count"*. **Both are wrong in the same half**, and
[P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s declaration took the run that
says so.

**Nothing was broken.** Every measurement below is of a run that completes correctly, and the target
scale runs. What the measurement found is that **half of what a region-bearing run holds is a second
copy that nothing reads**, and that no rung of `doc/workflow.md` section 4 can see it removed —
[Q214](../open-questions.md)'s shape from the removal side.

### What was measured, at the scope it was measured at

`doc/workflow.md` section 1 rule 5's writing clause. Every figure is from a run on the tree this item
ships, at node 24.20.0, through `dev-dist/p15/facts.ts` and `dev-dist/p15/scale.ts` — an L2 probe
over a generated flow family and a concurrency run. **Retained size is `v8.serialize(...).length`
over the driver's own structures in ONE call**, so an object reachable twice is counted once; the
scale run carries a second observer, `process.memoryUsage().heapUsed` after a forced `gc()`, because
a sensor cannot corroborate itself. **P15 measured all of this at its declaration and W53 re-ran
every number rather than transcribing it**, which is what the two corrections below came from.

**1. The footprint is *(tasks settled) x (bytes each returned)*.** Four dimensions varied one at a
time: **~262 B/node**, **~469 B/fan-out branch**, **~456 B/map instance** — one variable, *how many
tasks settle* — and **linear in the whole of every result**, which is the factor neither Q19's row
nor the spec bullet named. A **4**-node chain returning 256 KiB retains **1025 KiB**; a **128**-node
chain returning one key retains **33 KiB**.

**2. The driver holds SEVEN own properties that grow with the run, in the FIVE groups below, and
Q19's row names TWO of them.** *(The grouping is stated because it has to be: this table reaches
five by putting `dispatched`, `joinState` and `firedJoins` in one row while splitting `log` out of
`inputs`, and P15 fact 1's **four** used a different grouping again — so *four* and *five* were
never comparable, and the first draft of this ADR did arithmetic across them. W53's conformity
reader. The seven are `log`, `inputs`, `dispatched`, `joinState`, `firedJoins`, `arrivals` and
`outputsCache`, which is what `RN-R13` enumerates and what the L2 suite binds by name.)*

| | | what it holds |
|---|---|---|
| `inputs` | `FoldInput[]` | **everything**, and it is what `Driver.foldInputs()` returns. **In no row of the register.** |
| `log` | `LogRecord[]` | `inputs`' record-kind subsequence **by reference** — `bytes([log, inputs])` exceeds `bytes(inputs)` by **16 B** on a 3-record fanout run and by **18 B** at 4, 32 and 128 KiB results alike. Free. |
| `arrivals` | `Map<region, Map<branchPath, unknown>>` | fact 3 — and it is a **second copy** |
| `dispatched`, `joinState`, `firedJoins` | per id / per region | **44 B** for 3 ids, **41 B** and **14 B** on a one-region flow. Not a hazard |
| `outputsCache` | a memo over the log | **an ALIAS, and P15 fact 1 recorded it as `null`** |

**`outputsCache` is prediction 1's named candidate and W53 took it apart rather than inheriting the
note.** Fact 1 enumerated the driver's own properties after runs on flows with **no `needs`**, so
`outputs()` was never called and the field was `null` for a reason that is a property of the
fixtures rather than of the driver. On a flow that declares one it is **non-null**, and it **aliases**:
**5/5, 17/17 and 65/65** of its entries are a log record's own `result` object, and it adds **155 /
427 / 1593 B** at map arities 4 / 16 / 64 over 64 KiB results — ~25 B an entry, for the `branchPath`
string beside the pointer. **So prediction 1's conclusion holds and its scope cell was narrow in a
direction that mattered**: there is no second 49.8% to find, and the reason is not that the fifth
structure is empty.

**3. `arrivals` is a SECOND COPY and it is half of a region-bearing run.** The collection is
**49.8% of `bytes([inputs, arrivals])`** at map arities 4, 16 **and** 64 over 64 KiB results — which
is what *half of what a region-bearing run holds* means — and an
identity check says the stored value is neither the log record's `result` object nor the worker's
own — it is the arriving branch's own edge-hop clone. **What it costs to release it:**

| probe | L1-L5 | L6 |
|---|---|---|
| release the region's collection **BEFORE** the join reads it — the negative control | **14 failures** on the tree this ADR ships; **13** on the suite as it stood before W53, the fourteenth being W53's own *the release is AFTER the read* | not run |
| release it **AFTER** the join reads it — what this ADR takes | **0 failures** | **0 failures** |

*(**This sentence read *"`bytes([inputs, arrivals])` exceeds `bytes(inputs)` by 49.8%"*, and that is
a different ratio** — [W55](../work-items/w55-a-run-at-scale-on-real-workers.md), by re-running
`dev-dist/p15/facts.ts` with rule 3 reverted rather than transcribing its number. That harness
computes `(both - inp) / both` and prints *"of the pair"*; as an EXCESS over `bytes(inputs)` the same
three runs read **+99.2 / +99.4 / +99.4%**. The error is by a factor of two and it **UNDERSTATES the
saving**; the conclusion, the headline and every MiB figure below are unaffected, because they are
measurements of the whole rather than of the ratio. Four documents carried the derived sentence and
`spec/join-policy.md`'s `JP-R12`, W53's own file and [Q19](../open-questions.md)'s resolved row
carried the correct one. [Q243](../open-questions.md), which also records that **neither ratio is a
constant**: the divisor is one copy per SETTLED RESULT, so it is a property of the FLOW as well as of
the payload — +97.5% with no node after the join, +49.3% with one that echoes the collection, +33.0%
on the flow ladder L6 measures.)*

**And what it buys, re-taken with the change in place:** a completed region-bearing run's `arrivals`
share goes **49.8% → 0.0%** at all three arities, and the scale table moves

| runs x arity x result | before | after |
|---|---|---|
| 1 000 x 4 x 1 KiB | 10.2 MiB | **6.2 MiB** |
| 10 000 x 4 x 1 KiB | 101.8 MiB | **62.1 MiB** |
| 1 000 x 10 x 16 KiB | 317.4 MiB | **161.1 MiB** |
| **10 000 x 10 x 16 KiB** | **3174.8 MiB** | **1610.9 MiB** |

**4. A fold over an incomplete log reports a plausible wrong answer.** `maxCompletedTasks` caps
`scheduler.tasks`, the scheduler's own map, and reaches nothing this driver holds — so there is no
answer to inherit, only a shape. Applying the shape: a 37-input sequence truncated to its last 18
folds to `completed` with **8** nodes, and truncated to its last **1** folds to `completed` with
**ZERO** nodes and **ZERO** regions. **No throw and no signal.**

**5. The exception, re-measured at three shapes rather than one.** A clear at a join's exit never
runs for a region whose join never fires:

| | `firedJoins` | held |
|---|---|---|
| a 3-branch `fanout`, 1 branch settled | 0 | **65 571 B** |
| an 8-branch `fanout`, 7 settled | 0 | **458 865 B** |
| a map of 16, 15 settled | 0 | **983 262 B** |

*A run that hangs is exactly the run that keeps everything*, and it scales with the arity.

## Decision

**Six rules. Two are what a run retains, three are the lifetime of what a join collects, and one is
the exception stated rather than left to the clear site.**

1. **What a run retains is what its tasks returned, once — *(tasks settled) x (bytes each
   returned)*.** `inputs` is the structure that holds it and `log` is its record-kind subsequence by
   reference. `spec/run-state.md` section 7's **`RN-R13`** is the rule, and its falsifiable form is
   **a SET and an IDENTITY**: *which* of the driver's growing structures a settled result is
   reachable from, and *whether* each holds a **copy** or an alias. **A new structure holding a COPY
   is what the pair says so about**, and the L2 suite binds the walk's own universe to the driver's
   own property names both ways, so a field added to the driver fails there naming itself.

   *(The first draft said the SET alone was the test, and that it was "exactly `{inputs, log}`".
   **Both of W53's readers falsified that from opposite ends, and it is the one subject they
   shared.** The conformity reader ran the stated predicate on a corpus flow that declares a `needs`
   and got a THIRD name — `outputsCache` holds a settled result, so the claim is false wherever
   `outputs()` has been called. The adequacy reader came the other way and made that memo
   `structuredClone` what it stores — **a real second copy of every result, for ZERO failures across
   lint, typecheck, `check:spec`, L1-L5 and L6** — because both of the L2 suite's fixtures declared
   no `needs`, so the memo was `null` in every one of its cases. **A reachability SET cannot tell an
   alias from a copy.** And it is measurement 2's own defect one layer in: fact 1 recorded
   `outputsCache` as `null` because it enumerated properties on flows with no `needs`, this ADR
   corrects that by name, and the test written to make the rule falsifiable then chose its fixtures
   the same way.)*

2. **Nothing may be evicted from `inputs`, and the reason is the fold rather than the bytes.**
   `RN-R1` makes the fold a pure function of the sequence and `RN-R2` makes it total over any
   **prefix**; neither covers a sequence with a hole in it, and measurement 4 says what happens —
   `completed` with zero nodes, no throw, no signal. That is not a silent eviction but a **plausible
   wrong answer**, which is worse: a caller cannot tell it from the truth. **An eviction candidate
   therefore needs a way for the fold to say it was handed less than the whole log**, and every
   candidate for that is a new `FoldInput` kind — a change to the one value this repository's whole
   invariant hangs off. **Not taken, and P15 decision 2 is why.**

3. **A region's collection is RELEASED when its join becomes TERMINAL, and there are exactly three
   moments the driver can observe.** Two are per region and one is per run:

   | moment | where | why nothing can read it again |
   |---|---|---|
   | the join is **routed out of** | `settleJoin`'s satisfied exit, **after** `collectArrivals` reads it | `firedJoins` holds the region, so every later `settleJoin` returns at the first guard |
   | a policy reports it **`unsatisfiable`** | `settleJoin`'s unsatisfiable exit, right after the same latch | this arm routes nowhere and never reads the collection at all |
   | a refusal **stops the run** | `failRun`, as `arrivals.clear()` | `OR-R10` — the driver has stopped routing, and all three doors into `settleJoin` are shut behind `this.failed` |

   **The ORDER at the first is the rule and it has a measured negative control**: released after the
   read it costs **0** at both rungs; released before it, the join carries `{}` and L1-L5 reports
   **14** on the tree this ADR ships (**13** before W53's own suite existed).

   **The third moment needs one guard, and W53's conformity reader is what bought it.** `failRun`'s
   argument enumerates the three doors into `settleJoin` and they are all shut behind `this.failed`
   — but it missed the door on the **stack**: `append` calls `onFoldInput` un-wrapped, so a
   re-entrant listener can reach `failRun` from inside `settleJoin`, and `failRun` is where every
   collection is released. **W53 did not create the defect and it made it SILENT**: a stopped run
   routing out of a join at all is `OR-R10`'s own violation and pre-dates this decision, but before
   it the successor was dispatched with the full collection and after it with **`{}`** — which is
   indistinguishable from `live-token`'s legitimate all-exited case. `settleJoin` therefore returns
   at `this.failed` immediately after announcing the join. **Measured at 0 failures at L1-L5 and 0
   at L6**, and it TIGHTENS an existing rule rather than relaxing one.

   **The LOG is untouched at all three**, including the third. A stopped run is a run a consumer
   folds to find out what happened, so releasing what the fold reads there would be rule 2's
   plausible wrong answer arriving by another road.

4. **Outside that window nothing is RECORDED**, and without this rule 3 is a leak with a narrower
   mouth. An arrival reaching a join that has already become terminal would mint a fresh entry and
   store a payload nothing can ever read — once per late arrival, for the life of the run. **No
   shipped policy produces that arrival and a third-party one may**: all three settle a join only
   once nothing is left to arrive, and a policy that settles one **before every branch is terminal**
   is exactly the precondition [Q95](../open-questions.md) records for `settleJoin`'s own *at most
   once* latch. **The same hypothetical policy, reaching the same region through a second door**, and
   it is guarded rather than commented for that reason.

5. **In a run that has NOT STOPPED, a region whose join never becomes terminal holds its collection
   until the caller releases the driver, and that is the BOUND rather than a leak.** This is the run
   whose footprint matters most and the two PER-REGION moments above do not reach it.

   *(The scope — *in a run that has not stopped* — is W53's conformity reader, and without it this
   rule contradicted rule 3: the third moment reaches exactly that region, which is what the L2 row
   asserting a `failRun` release with the join still `waiting` measures. Three documents also
   enumerated only the two per-region moments while the code had three, so a reader implementing the
   driver from `spec/` alone would not have written the third; all three name it now.)*

   **The driver cannot know**: `stuck` is decided in the
   **fold**, at a quiescent point, from a region whose `joined` is not `true` (`RN-R10`), and giving
   the driver an event for it would put a run-state determination inside the driver —
   [ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) rule 4 and
   [ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 1 both refuse it.
   **So `RN-R13`'s second term is stated over regions whose join is still live**, which makes the
   bound true rather than aspirational, and the L2 row for it asserts the retention on the corpus
   flow the fold calls `stuck`.

6. **`maxCompletedTasks` is a candidate MEASURED AND REFUSED, not an open option.**
   [Q19](../open-questions.md)'s row said *"we would inherit the answer and its sharp edge (eviction
   is silent)"*. Measured: it caps `scheduler.tasks`, which is the scheduler's own map, and reaches
   nothing this layer holds. **There is no answer to inherit, only a shape**, and rule 2 is what
   applying the shape here costs. Recorded so the next reader does not go looking for it.

## What this does NOT decide

- **Bounding what a CONSUMER reads.** `RunState.nodes[taskId].result` **is** the retained result, so
  dropping one changes what the library reports. Measured: blanking every `result` takes a fold's
  input from 13984 B to 1612 B — a factor of **8.7** — and `RunState` changes. Over both corpora
  **110 of 124 task nodes (89%)** are named by no `needs`, so *drop a result no reference can name*
  is decidable from the document and is **not free** the way rule 3's 49.8% is. **P15 decision 1
  forbids taking the second on the strength of the first**;
  [W54](../work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) prices it and the
  maintainer takes it.
- **What a result may BE** — [Q22](../open-questions.md), `OR-R2` and `OR-R6`. **W54's.**
- **Durability** — [Q15](../open-questions.md), deferred, and this ADR sharpens it rather than
  answering it. **A join's collection is in no `FoldInput` at all**: `dispatched` carries a `taskId`
  and nothing else, so a run resumed from a persisted sequence cannot be handed what a join collected
  and cannot recompute it. That was true before this decision; giving the collection a stated
  lifetime is what makes it visible.
- **A region's collection being REFERENCEABLE** — [Q219](../open-questions.md), whose whole cost is
  retaining the collection or recomputing `JP-R12` at a second site. **Rule 3 moves that cost**: the
  collection is now gone by the time any later node could name it, so Q219's price is *retain it
  again* rather than *it is already there*. P15 declares it the follow-on and it relaxes an existing
  rule, which is the maintainer's call.
- **[Q186](../open-questions.md)'s threshold** — *how large is too large*.
  [W46](../work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) decided **nothing
  warns** and left it open deliberately. **Not reopened.** The numbers above are the first that could
  answer it, and saying so is as far as this goes.
- **A rung, or a row in `doc/workflow.md` section 8's budget table.** P15 decision 3 refuses both on
  a measurement, and both are on that plan's stop-and-ask list.

## Consequences

**The library's answer to *is per-run retained state bounded* is now a sentence somebody can
falsify**, which is what `spec/run-state.md` section 6's bullet was not: *bounded by what a run does
and by nothing else, at (tasks settled) x (bytes each returned), plus one further copy per live
region's arrived branches.* `RN-R13` is the rule and its test is a set of holders rather than a byte
count, so it works in all five runtimes and fails naming the field a new copy landed in.

**A consumer holding many drivers gets the saving without changing a line.** At the top of the range
P15 measured, **3174.8 MiB → 1610.9 MiB**.

**What it costs a consumer: nothing observable, and that is also the problem.** No rung of section 4
saw a whole structure leave — at this decision the release cost 0 at L1-L5 and 0 at L6, and the only
thing distinguishing it from doing nothing at all was the L2 pair this item added. **That is
[Q214](../open-questions.md)'s third instance and the first from the REMOVAL side**, which is P15
prediction 4.

**And [W55](../work-items/w55-a-run-at-scale-on-real-workers.md) REVERSED that prediction, which
sharpens this paragraph rather than deleting it.** Reverting rule 3 now costs **29 L6 failures in
both runtimes**, across 23 distinct rows — so a rung CAN see it, and the rung is `examples/l6.ts`
asserting the RELATION on every row: the collection non-empty before its join becomes terminal, empty
after, with the run's outcome and every task id unchanged. **What stays true is the sentence that
matters to a consumer**: nothing a run *reports* moves. The outcome, the ids, the log, the fold and
every callback are byte-identical either way, which is why the release was safe to make, and the only
observer is a reach past that surface into the driver's own state — [Q233](../open-questions.md)'s
subject. *A rung made of runs cannot see this through anything a run reports; it can see it by not
being made only of what a run reports.*

**And it moves a cost onto [Q219](../open-questions.md) rather than off it**, which is recorded
above rather than discovered later: a decision that makes a region's collection unreachable sooner
makes referencing it dearer, and the two are the same plan's subjects.

**[ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 1 is still stated wider than the code holds it, and this decision BOUNDS that rather than
closing it.** That rule says *a node's payload is reachable from nothing else the run holds*;
[Q19](../open-questions.md)'s row recorded that the join's successor payload **is** reachable from
`arrivals`, and it still is — **inside `JP-R12`'s window**. What changes is that the window now has
an end. The sub-finding is carried here because resolving Q19 retires the row it was written in and
it would otherwise reach no owner: W53's conformity reader.

**The rule's only observer is one L2 file, and that is stated rather than left to be discovered.**
W53's adequacy reader measured it: outside `test/driver/retention.test.ts`, rules 3, 4 and 5 and the
whole of `RN-R13` have **zero** observers — only the read/release **ORDER** has a second route, the
thirteen pre-existing `JP-R12` cases. That is obligation (c)'s LIMIT for four of the six rules here,
and it is why that file binds its own case list, its own walk universe and the driver's own field
names: with one observer, the observer's bounds are the decision's bounds.
