# P7 — Is a join transitive over nested fan-out?

**Status:** **COMPLETE — all four items done and the retro is run; `doc/workflow.md` is v0.9.** [W20](../work-items/w20-what-a-nested-region-is.md) and
[W21](../work-items/w21-the-branch-path-is-a-path.md) are **DONE**;
[W22](../work-items/w22-what-an-inner-join-does-to-the-outer-one.md) and
[W23](../work-items/w23-a-nested-flow-on-real-workers.md) are **DONE**. **All four items are built and
the plan's exit artifact exists**; the retro has not run. Read each item's status from its
own file, never from this line (`doc/workflow.md` section 1 rule 5).
**Runs after [P6](p6-what-may-share-a-scheduler-with-a-driver.md)**

> **Correction, at W20's declaration — this plan's work-item table was wrong twice, and the
> declaration step is what found it.** Recorded here rather than silently rewritten, because a plan
> that edits its own evidence to match a later measurement leaves nothing for a reader to check.
> **The corrected version is in [W20's own file](../work-items/w20-what-a-nested-region-is.md), and
> that is what an item reasons from.** In short: *"`regionOf` resolves innermost"* is a
> **`src/driver/**`** change and the row gave W20 `src/definition/**`, so W20 puts the resolver in
> `src/definition/regions.ts` beside `branchIndexOf` — which has the **identical** defect and is
> already in its `Owns` — and takes **one** declared exception into `driver.ts` for a delegation and
> a comment. And **`spec/examples/**` was in nobody's `Owns`**, while lifting a refusal moves that
> refusal's example and `check-spec`'s C3, C4 and C7 all read it. **This is the tenth plan running to
> have a load-bearing fact change what got written, and the first time it was the plan's own table.**

> **Correction, at W22's declaration — this time it is the plan's own DECISION, not its table, and
> measurement falsified it.** *"Nested fan-out is supported under `live-token` and its refinement, and
> `arrival-count` REFUSES it"* is struck. **The corrected version is in
> [W22's own file](../work-items/w22-what-an-inner-join-does-to-the-outer-one.md), and that is what an
> item reasons from**; the sections below are left standing as the evidence a reader checks, per the
> same reasoning as the correction above. In short: the stated mechanism —
> *"`N` is fixed at the outer branch list and an inner branch has no way to be counted"* — is **not a
> mechanism**. `N` is per-region; an outer region's `branches` is unchanged by nesting; and when an
> inner join fires it enters the outer join carrying the inner fanout's own path, which **is** the
> outer branch's arrival ([W21](../work-items/w21-the-branch-path-is-a-path.md)'s
> [Q114](../questions/q114.md) fix). Measured over **four depth-2 rows × the four matrix columns:
> every one of the sixteen cells equals the corresponding depth-1 cell**, `describe`s included — so
> `arrival-count` **joins** on an all-arriving nested flow, which is the shape the refusal would have
> forbidden. Its depth-2 hangs are its depth-1 hangs at a second region.
> **Three consequences.** Scope item 5 is struck and there is **no `JP-R*` refusal and no
> construction refusal**; the matrix's **declared-empty cells do not arise**, so
> [Q100](../questions/q100.md) does not reach a third file; and W22's size worry below is answered by
> measurement rather than by the decomposition the plan proposed. **What ADR 0030 actually rules on
> moved**: the only depth-2 behaviour that is not a depth-1 behaviour one level down is what an inner
> join's verdict does to the outer branch — see W22.

**Question this plan answers:** [Q6](../questions/q6.md) — *if a branch itself fans out, does the
outer join wait for the grandchildren?*

**Exit artifact:** **a nested fan-out running end to end on a real scheduler, with the outer join
firing over branches it never directly opened** — and the join/failure matrix run at depth 2.

**Reserves:** W20-W23, Q112-Q120, ADR 0030-0031

---

## Why this plan, and why now

**Six plans have hardened the edges of a feature set the concept calls incomplete.** P1 settled what
satisfies a join; P2 ran the non-success half on real workers; P3 built the reference; P4, P5 and P6
took the driver's lifetime, the policy set and the scheduler edge. **Every one of them worked on a
library that refuses the shape `doc/concept.md` section 2 names**: fan-out and join, *nested*.

`FD-V15` refuses it, and the refusal has been forward-looking rather than principled since W1.
`spec/task-id.md` reserved the dotted `branchPath` for it in P1 — *"an id format change is a change
to every fixture, every log line and every test name written before it"* — and `spec/join-policy.md`
section 5 lists transitivity as a thing that document does not fix. **Both say the question was
scheduled for P2. It was not taken there, and four plans have passed since.** That is the
`doc/`-is-checked-by-nothing class in `spec/`, and this plan is where those two sentences stop being
wrong.

## The facts, measured before this plan was written

*`doc/workflow.md`: eight consecutive plans measured their load-bearing fact before declaring and in
all eight it changed what got written. **This is the ninth, and fact 7 moved a work item's
document.***

| | measured |
|---|---|
| **`FD-V15` is one line, and it is the least of the work** | one `add()` at `src/definition/validate.ts:301`. Lifting it takes a spec change and a deletion; everything below is what makes the deletion safe |
| **The region maths is ALREADY nesting-ready** | `regionSets` computes `members` transitively — `reaches(b, joinId)` — so an outer region's member set **already contains** the inner fan-out's nodes and its grandchildren. Nothing needs to be added for an outer region to *know about* an inner one |
| **The LOOKUP is not, and it fails silently** | `Driver.regionOf(nodeId)` is `this.regions.find((r) => r.members.has(nodeId))`, over `allRegions`, which returns regions in **node-declaration order**. With nesting a node is in **two** regions and `.find` returns whichever `fanout` appears first in the file. **No test can see this today**, because `FD-V15` refuses the only input that would distinguish them. It is the plan's central defect and it is one line |
| **The dotted `branchPath` has never been produced by this library** | `parseTaskId` accepts `'1.0'` and `branchIndices` splits it, but **`buildTaskId` cannot emit one**: its parameter is `branchIndex: number \| null`. The grammar is asymmetric, `spec/task-id.md` calls the shape *"forward-looking"*, and **the reserved half is reachable only by hand-writing a string** |
| **Nothing pushes a segment, and two sites read only the first** | `Driver.branchPathFor(nodeId, inherited)` returns `inherited` unchanged — there is no code path that lengthens a path. `driver.ts:646` and `driver.ts:757` both take `branchPath.split('.')[0]`, the **outermost** index only, which is correct at depth 1 and wrong at depth 2 |
| **The fold and the policy interface need little or nothing** | `RunState.regions` is a **flat map keyed by `regionId`**, `settled` is keyed by `branchPath` **strings**, and `Region.branches` is per-region. All three already carry depth 2 without a shape change. `step()`'s per-input copying is unchanged by nesting; the fold's quadratic ([Q19](../questions/q19.md)) is a node-count question and depth 2 does not move it |
| **A policy-dependent refusal CANNOT be an `FD-V*` rule, and the precedent for where it goes is three lines away** | `validateDefinition(doc, registry)` takes `{ workerTypes, predicates }` and **does not know the policy**, so `FD-V*` cannot express *"invalid under arrival-counting"* without changing the validator's public signature. **`driver.ts:370` already throws `MissingJoinPolicy` at construction on exactly this shape** — a refusal that reads the definition and the policy together, before `start()`. **This moved the refusal from W20's document to W22's** |

## The decision that is NOT taken before fan-out

**Is the outer join transitive over the inner one?** The plan states the options with their costs and
**W22 takes the decision as ADR 0030**. `doc/workflow.md` section 7 rule 3 — decide, then fan out —
binds the *shape*, and the shape is settled below; the *answer* is the plan's question and an item
owns it.

**Q6's own reading is that it is nearly free under a token policy and needs a separate mechanism under
arrival-counting, and the code agrees.** Under `live-token` an outer branch holds one token from
`branch.opened` until it arrives at or exits the outer region; an inner region lives *inside* that
token's lifetime, so the outer count is untouched by how many grandchildren exist. Under
`arrival-count`, `N` is fixed at the outer branch list and an inner branch has no way to be counted —
which is fixed-`N`'s failure mode from [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
arriving one level down.

**What is settled before fan-out, and it is what sizes W22:** **nested fan-out is supported under
`live-token` and its refinement, and `arrival-count` REFUSES it.** Not *hangs on it* — refuses, at
`Driver` construction, beside `MissingJoinPolicy`.

| | |
|---|---|
| **`live-token`** | transitive for free, on the reading above. `live-token-requiring-arrival` inherits it: [ADR 0025](../decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) makes it `live-token` plus one clause, and the clause is about arrivals rather than about depth |
| **`arrival-count`** | **refuses.** Repairing fixed-`N` by recomputing it as branches open is the repair [ADR 0025](../decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) already weighed and **refused** for a different reason, and reopening it here would relitigate two decisions to serve a policy ADR 0003 says nobody should pass. **A refusal a caller sees at construction is strictly better than a hang they see at runtime**, which is the whole of ADR 0015's argument for `stuck` |

**The cost of that choice, stated so W22 cannot discover it late:** the matrix gains its **first
declared-empty cells**. Nine rows × four columns has never had a cell that is *"refused"* rather than
a result, and `test/matrix/**` renders a table that a reader takes as exhaustive. **How a refusal
renders in that table is W22's problem and it is named here rather than left to the first draft** —
[Q100](../questions/q100.md) is what happens to a rendered artifact nobody asserts on.

## Scope

**In**

1. **Lifting `FD-V15`**, with `spec/flow-definition.md`'s rationale rewritten from *"out of P1's
   scope"* to what nesting now means — and its **stale *"scheduled for P2"*** removed.
2. **Innermost-region resolution.** `regionOf` must return the region a node is *most tightly* in,
   and the order-dependence must die with a test that would have caught it.
3. **A `branchPath` that is a path.** `buildTaskId` emits one; the driver pushes a segment on
   entering an inner region; the two `split('.')[0]` sites read what they mean.
4. **ADR 0030 — transitivity**, with the matrix at depth 2 as its evidence.
5. **`arrival-count` refuses nesting**, as a `JP-R*` rule and a `Driver` construction refusal.
6. **The exit artifact**: a nested flow on real workers at L6.

**Out** — named rather than left implicit, with where it goes instead

- **Map-style fan-out** ([Q12](../questions/q12.md)). A dotted path admits it and this plan does not
  build it. It is also where the fold's quadratic ([Q19](../questions/q19.md)) would start to
  matter, and that is a different plan's measurement.
- **Convergent branches**, `FD-V19` and `FD-V22` ([Q27](../questions/q27.md)). Adjacent restrictions
  in the same family; lifting one is not lifting three.
- **Unbounded depth as a *tested* claim.** The grammar admits any depth and the code should not care,
  but the matrix and L6 are run at **depth 2**. An item that claims depth 3 works owes a row.
- **Per-join policies** ([Q5](../questions/q5.md)). Nesting makes *"one policy per run"* feel
  wrong, and it is not this plan's question — one policy per run stays.
- **[Q19](../questions/q19.md)'s scale measurement.** Named because W21 is where it would surface,
  and refused because a curve is not this plan's exit artifact.

## Work items

**Four, serial, and each separated by a spec document** — `doc/workflow.md` section 7 rule 1's test,
not intuition. No two edit the same file.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| **W20** — *declared* | What a nested region **is**: `FD-V15` lifted, innermost resolution as **region maths** | `src/definition/**` (W1/W2), `spec/flow-definition.md` (W1), **`spec/examples/**` (W1)**, `spec/README.md` | nothing | L0-L5 climbed, own coverage at **L0/L1/L4**, then two readers |
| **W21** — *done* | The **path**: a nested run mints the ids the grammar reserved | `src/driver/ids.ts` (W3), `spec/task-id.md` (W1), **`spec/README.md`**, **`test/driver/log.test.ts` (W3)** | W20 | **L0-L5**, own coverage at **L1/L2**, then two readers |
| **W22** — *done* | **The decision.** ADR 0030; the matrix at depth 2; ~~`arrival-count`'s refusal~~ — **struck, see the correction at the top**; what an inner join's verdict does to the outer branch takes its place | `spec/join-policy.md` (W1), `test/matrix/**` (W4), and `src/driver/driver.ts` — **still, and the `Owns` cell is unchanged**: the file is W22's for the propagation fix rather than for the refusal | W21 | **L0-L5**, ADR 0030, then two readers |
| **W23** — *done* | A nested flow on **real workers** | `examples/**` (from W19) | W22 | **L0-L6, both L6 runtimes**, then two readers |

**Why four and not three.** W20 and W21 look like one item and are not: W20 answers *which region is
this node in*, which is a definition question with no id in it, and W21 answers *what is this task
called*, which is `spec/task-id.md`'s and touches the published id grammar. **They are separated by a
spec, which is the rule.** W22 and W23 are P6's split re-used — decide over fixtures, then demonstrate
on real workers — and P6's retro records that splitting on exactly that line is what let W18 decide
and W19 demonstrate.

**W21's declaration names a FORK it does not close, and that is deliberate.** Both arms mint the same
ids; they differ in whether a node's `branchPath` is **threaded** through `enter()` or **derived**
from the graph. Threading is local and leaves [Q114](../questions/q114.md) needing the first mutable
per-run map added to the driver since W3; deriving makes `spec/task-id.md` section 1's *"a property
of the node"* literally true, dissolves Q114, and wants a function in **W20's** file. The item
measures both before choosing. **P7's ADR block holds nothing for it** — 0030 is W22's and 0031 was
W20's, now skipped — so if the choice needs a decision it takes the next free id on ADR 0029's
precedent.

**W22 is the one to watch for size.** It carries an ADR, a spec rule, a driver refusal and a matrix
dimension. If its declaration cannot state a gate, section 1 rule 1 says the decomposition is wrong;
the obvious cut is the refusal into its own item, and it is named here so it is not discovered late.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q6](../questions/q6.md) | is a join transitive over nested fan-out | **W22** — closed by ADR 0030, whichever way it goes |
| [Q90](../questions/q90.md) | `ID-R4` tier 2 has no L6 coverage | **candidate for W23.** P6's retro ruled it a work item rather than a plan, and its instrument — `ForeignTask` in `examples/run-flow.ts` — is W23's file. **The marginal cost is a string**, and the *against* case is untouched: injecting a task the driver did not mint is a scenario no consumer produces on purpose. W23's declaration rules |
| [Q107](../questions/q107.md) | `ID-R5` at L6 sees `task.completed` and nothing else | **candidate for W23**, same file. Needs a worker role that fails fast enough to keep W19's ordering determinate |
| [Q108](../questions/q108.md) | ADR 0027's `context.spawnTask()` producer is demonstrated nowhere | **no owner.** It needs a worker that spawns, which runs into [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 2 and needs its framing decided first. **Not W23's by default** |
| [Q5](../questions/q5.md) | per-join configurable policies | **no owner, and nesting makes it louder.** `spec/join-policy.md` section 5 already lists it beside Q6; this plan answers one and not the other |
| [Q23](../questions/q23.md), [Q27](../questions/q27.md) | `FD-V13`, `FD-V19`, `FD-V22` — the other liftable restrictions | **no owner.** Named so that lifting `FD-V15` is not read as lifting the family |

## A note on ids

**P7 starts at W20**: W1-W19 exist, **W10 stays held** and **W11 stays skipped**, for the fourth plan
running and on P2's and P4's reasoning — P4's retro retired `check-owns.mjs` as a proposal, and taking
W10 here would make P2's Record false.

**Q ids resume at Q112.** P6 reserved Q101-Q110 and used Q101-Q108; **Q109 and Q110 are skipped,
never reissued**. Q111 is P5's retro's, taken outside every block on ADR 0029's precedent.

**ADR ids resume at 0030.** P6 reserved 0027-0028 and used 0027, so **0028 is skipped**. **0026 stays
held for [Q97](../questions/q97.md)** — P5 reserved it for the `stuck` conflation and deliberately
did not take it, and this plan does not take it either.

## Record

### The retro — `doc/workflow.md` is v0.9

**Four items, eight reader passes, sixty-nine findings, sixteen BLOCKING. Not one pass came back
empty; that is now thirty-nine consecutive.** Four changes adopted, one refusal repeated for the
seventh time, and one finding that belongs to the next plan rather than to this document.

| | conformity | adequacy | BLOCKING | late `Owns` exceptions |
|---|---|---|---|---|
| W20 | 11 findings, 3 blocking | 36 mutations, 11 survivors, 5 blocking | **8** | **5** |
| W21 | 13 findings, 3 blocking | 52 mutations, 5 blocking | **8** | **4** |
| W22 | 12 findings, 1 blocking | 41 mutations, 2 blocking | **3** | **2** |
| W23 | 13 findings, 5 blocking | 21 mutations, 3 blocking | **8** | **0** |

#### 1. LOOP BOUNDS is a fourth obligation for rule 8, and it has the evidence

**Two occurrences, two items, four instances, every one BLOCKING and every one found by an adequacy
reader** — section 6 pass 3 rule 2's bar, met without needing the generalisation argument.

W22: a matrix **row** deletable for 0 failures, and a whole **column** droppable from the depth-2 loop
**with the assertion count unmoved**, while the render kept advertising four. W23: **four L6 rows**
deletable for one edited number — green at **388** with `lint`, `typecheck` and all five `check:*`
passing, and no dotted task id dispatched anywhere above L2 — and the **whole foreign-task list**
emptiable for 0, deleting **P6's** exit artifact as well as W23's own.

**The sharpest half is that W23 knew about the axis and instantiated it too narrowly.** It ran five
bounds probes deliberately — a row, a region, a foreign task, a branch, the cost model — **and all
five were caught, and its reader still found two more.** The author bounded the lists a **row**
iterates; the reader bounded the lists the **file** iterates. *Knowing an axis is not instantiating
it* is this rule's own recurring lesson, and it is why change 2 exists as well.

#### 2. The provenance obligation was right and could not be instantiated from what it said

**[Q112](../questions/q112.md) has been corrected four times across three items**, and **three of
those were an author repeating a correction a reader had made to them one item earlier**:

| | the correction |
|---|---|
| W20 | *"expected-side probes prove nothing"* — they survive by construction |
| W21 | *"a source choice cannot be proved by a single-file probe"* — refuted with a counterexample at 1 failure; the author's probe survived because it made a **second** edit |
| W22 | three probes were rewrites rather than source swaps; the author had read W21's correction and instantiated it wrongly anyway |
| W23 | `x && y` — which evaluates a source and **discards** it, changing nothing at all |

The procedure is one sentence and it now lives in rule 8 rather than in a register row: **a
provenance probe changes the source expression and nothing else.** v0.8 named the axis; naming the
axis was not enough four times running.

#### 3. `Owns` is written from the plan's index row, and the numbers are the whole argument

**Five, four, two, zero.** W20's block gave it no file it was allowed to *test* in; W21's named paths
and still narrowed `src/driver/driver.ts` out of a block **this plan's own table had put it in**; W22
wrote its block from the row and kept that file for a different reason than the row gave; W23 took the
whole `examples/**` block and declared **no exceptions at all** — the first item of P7 to take none.

**`check-owns.mjs` stays retired for the fourth plan**, and this is the strongest evidence it has had:
a sentence took the count to zero without a script.

#### 4. Reading a claim from a copy — and the copy that bites is your own

Section 1 rule 5 says a claim about another item's status is read from that item's own file, **never
from an index**. W23 reported a count to a human that was wrong because it read it from
`examples/README.md` — **a file that item had written itself**, for an earlier version of its own
work. One occurrence, with the argument rule 2 asks for: the rule names indexes because indexes are
where the failure had been seen; **the mechanism is reading a derived claim instead of deriving it**,
and an author's own summary is the copy most likely to be trusted. P7's second instance is the
register, which described [Q117](../questions/q117.md)'s failure incorrectly in **two successive
items**, in the file read before every one of them.

#### 5. What did NOT change, and one thing that is the next plan's

**Rule 7 (c) is unexercised for the fifth plan**, and P7 declined **two** checks —
[Q121](../questions/q121.md) (dead links in `doc/**` and `AGENTS.md`, which `check-spec`'s C5 already
does for `spec/**`) and [Q126](../questions/q126.md) (a runtime droppable from the gate chain for 0
failures). **Both were declined for the same reason: `scripts/**` and `package.json` are in nobody's
`Owns`.** That is v0.7 change 3's shape — *a gap that blocks a fix rather than hiding an edit* — twice
in one plan. **It is not a workflow rule; it is a plan's scope**, and the next plan that wants either
check must own those paths. Named here so it is not rediscovered a third time.

**The two-reader split is settled at twelve measurements** — W22 2 of 19, W23 3 of 16, both inside the
1-4 band — and closed to re-litigation. **`doc/` is refused a seventh time**, with its one checkable
sub-case now identified twice and given an owner-shaped answer rather than a rule.

#### 6. The declaration step falsified a plan's DECISION, and that had not happened before

Nine plans have measured a load-bearing fact before declaring, and in all nine it changed what got
written; W20 corrected **this plan's work-item table**. **W22 falsified this plan's decision.**
*"`arrival-count` REFUSES nested fan-out"* rested on *"`N` is fixed at the outer branch list and an
inner branch has no way to be counted"* — and `N` is per-region, so an inner branch never needed
counting by the outer join. `arrival-count` **joins** on an all-arriving nested flow. The refusal, a
driver construction check, a new error class and the matrix's first declared-empty cells all went with
it, and **the size problem this plan flagged W22 for dissolved.**

**Eleven plans of measuring before declaring, and this is the strongest single result the practice has
produced.** It needs no rule; it needs recording, which is what the correction blocks at the top of
this file are for.

#### 7. What the ladder did not catch

Of the sixteen blocking findings, **L0-L6 caught none** — every one came from a reader, which is P1's
central measurement holding for a seventh plan. Two are worth naming against a rung: the **rendered
L6 table printing P7's exit artifact as a region-free run** is L7's, and it was found by a reader
reading L6's code rather than by a person looking at the table — [Q100](../questions/q100.md) in a
fifth file. And **a valid definition that hangs** (W21) is L2's and was reachable there; nothing
drove a `Driver` through a nested flow until the item that built one.


### W22 — the plan's question is answered, and the plan's own decision was wrong

**[Q6](../questions/q6.md) is closed by [ADR 0030](../decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md):
a join is transitive over nested fan-out, for every policy, and it needed no mechanism.** Sixteen
cells — four depth-2 rows × four columns — each reproducing the depth-1 row of the same shape.

**The plan's *"what is settled before fan-out"* was falsified at the declaration step, and this is the
first time a plan's DECISION rather than its table has gone that way.** *"`N` is fixed at the outer
branch list and an inner branch has no way to be counted"* is not a mechanism: `N` is per-region, and
an inner join firing enters the outer join at its own `fanout`'s path, which **is** the outer branch's
arrival. The refusal would have rejected a definition `arrival-count` handles. **Struck**, and with
it the whole of the size problem the plan flagged W22 for.

**What the decision actually turns on moved.** The only depth-2 behaviour that is not a depth-1
behaviour one level down is an `unsatisfiable` join's exit, which emitted nothing — unobservable at
depth 1, and at depth 2 a `JP-R5` violation. `JP-R10`.

**Three findings for the retro.**

1. **An author's probes break VALUES; a reader's break BOUNDS.** All 28 of W22's changed what a thing
   *is*; both of the adequacy reader's blocking findings changed **how many things are iterated**, and
   no probe of the first kind reaches one. Not v0.7's two obligations and not v0.8's third — a loop
   bound is not a value with a source, it is the shape of the set the values live in. **W15's
   column-deletion finding is arguably the second occurrence.**
2. **[Q112](../questions/q112.md)'s correction did not survive one item.** W21's reader established
   that *a provenance probe changes the source expression and nothing else*; W22's author edited the
   projection alongside the source **three times** and read three passes as findings. Third
   consecutive item in which the author's account of v0.8's provenance obligation needed correcting,
   and the first in which it was the author repeating a correction already made **to them**.
3. **Declaring `AGENTS.md` up front worked and was still not enough.** W20 and W21 both took it late;
   W22 declared it and still shipped a false sentence in a **different section** — §5's *"stops the
   run"*, true at depth 1 and false at depth 2. `Owns` and *which section* are different questions.

### W23 — the exit artifact exists, and the harness had the same defect the driver did

**A nested fan-out runs end to end on a real scheduler, in both runtimes, with the outer join firing
over branches it never opened.** Ladder L6 is **489 assertions, 23 row labels, 25 real runs**, from
373 / 19 / 21 — and the **first dotted task ids any rung above L2 has asserted**, nine of them.
Three rows on one flow give ADR 0030's three answers; a fourth, on a suspend variant, exists because
reverting [Q117](../questions/q117.md)'s fix cost **0 assertions** without it.

**Two findings for the retro, and the second is a rule.**

1. **[Q112](../questions/q112.md)'s correction failed a fourth time, and rule 8's founding case
   fired inside rule 8's own procedure for the third consecutive plan.** The author's first
   provenance probe was `x && y` — which evaluates a source and discards it, changing nothing — and
   the author's *fix* for the adequacy reader's blocking provenance finding recorded the value **from
   the same local the probe swaps**, so the reader's probe still cost 0 after it. Only the re-run saw
   either.
2. **LOOP BOUNDS is a fourth obligation for rule 8 and now has two occurrences in two items.** W22's
   reader found a row and a column deletable for 0; W23's found **four rows and a whole foreign-task
   list** deletable for 0 — the second deleting **P6's** exit artifact as well as this item's own
   Q107 closure. **W23's author ran five bounds probes deliberately and all five were caught**, and
   the reader still found two more: the author bounded the lists a *row* iterates, not the lists the
   *file* iterates. Both occurrences are BLOCKING and neither is reachable by a value probe.

**And the one number this item got wrong was one it read from its own summary.** The Record reports
23 labels and 25 runs; an earlier report of 22 and 24 came from `examples/README.md`, written for a
three-row version of the item and not updated when its fourth row landed. Section 1 rule 5 names
*indexes*; the failure is any copy.

**[W20](../work-items/w20-what-a-nested-region-is.md), [W21](../work-items/w21-the-branch-path-is-a-path.md),
[W22](../work-items/w22-what-an-inner-join-does-to-the-outer-one.md) and
[W23](../work-items/w23-a-nested-flow-on-real-workers.md) are all built, gated and read. P7's retro
has not run.**

### W21 — a nested run mints the ids the grammar reserved, and the fork was closed on evidence

**Deriving beat threading.** `branchPathOf` is total over the valid corpus and agrees with the
threaded value on every depth-1 flow, so replacing the threading changed **no existing id**. It
closed [Q114](../questions/q114.md) with **no new state** — a join's successor's path is the path its
region sits at, and a region's fanout is a node. Both `split('.')[0]` sites are **gone** rather than
fixed, and `dispatch` lost its `branchPath` parameter entirely: it took a path and immediately
reduced it to the outermost index, so the caller threaded a value the callee threw away.

**One of the fork's stated costs was wrong** and the decision stands anyway —
[Q119](../questions/q119.md): the walk is O(depth × |regions|²) with a doubled inner call, not the
O(depth) this plan priced. None of the reasons it was chosen depended on the cost.

**Three findings for the retro.**

1. **The `Owns` gap recurred, and this plan's own table had the answer.** W20's finding was that a
   `Tests:` line naming assertions and not paths cannot be audited. W21's declaration named paths —
   and still narrowed **`src/driver/driver.ts` out of a block this plan's index table had put it
   in**. Five late exceptions. **The failure is not the `Tests:` line; it is that an item's `Owns`
   was written from its title rather than from its plan row.** Two occurrences, two items, different
   causes, one symptom.
2. **[Q112](../questions/q112.md) needed correcting for the second item running, both times by the
   adequacy reader, and both times about how the obligation is INSTANTIATED.** W20 corrected
   *"expected-side probes prove nothing"*; W21 corrected *"a source choice cannot be proved by a
   single-file probe"* with a counterexample at 1 failure — substituting **only the source
   expression** is caught, and the author's probe survived because it made a second edit. **A
   provenance probe changes the source expression and nothing else.**
3. **A fix made earlier guards dead, and only the re-run saw it.** Adding an `INDEX` test to
   `buildTaskId` for `1e21` made `Number.isInteger(n)` and `n < 0` unreachable — both caught before,
   one survived after. Three clauses collapsed to one. **Rule 8's re-run requirement, adopted by P6's
   retro, earning itself on something other than a reader's fix.**

**And the item shipped a valid definition that hangs**, found by the conformity reader: Q114's first
fix carried the path and dropped the region, so an inner join routing to an `end` inside the
enclosing region emitted no terminal event for the outer branch and the outer join sat at `live: 1`
forever. **The fix for that was then found blind at depth 2**, where the truncation the adequacy
reader probed is the identity. Both are asserted now, the second on a depth-3 sibling shape where
truncation collapses two arrivals and hangs a run.
**[W20](../work-items/w20-what-a-nested-region-is.md) is built, provoked and gated; its two readers
have not run. W21-W23 have not started.**

### W20 — what it settled, and the two things for the retro

**`FD-V15` is retired** and `spec/flow-definition.md` is **v0.7**, with a new section 4 subsection
saying which region a node is in when it is in two. **The measurement that mattered was taken before
any of it**: with `FD-V15` set aside, the nested example produced **no other finding** — `FD-V13`,
`FD-V19` and `FD-V22` all accept it — so this was a lift rather than a redesign, and the plan's
central claim held.

**The order-dependence was total rather than subtle.** Same graph, only the node order changed:
`regionOf(scoreC)` gave `outer`/branch **1** with the outer fanout declared first and `inner`/branch
**0** with the inner one first. Both `regionOf` and `branchIndexOf` flipped.

**Two findings the retro should have:**

1. **A `Tests:` line that names assertions and not paths is a declaration that cannot be audited.**
   W20's `Owns` was `src/definition/**` plus three `spec/` paths and its `Tests:` line said *"L1 over
   `src/definition/**`"* without saying **where** — so the item had **no file it was allowed to test
   in**, and both test files are late exceptions. It noticed by running the audit before the Record
   rather than after, which is the only reason it is a finding and not a miscount.
2. **v0.8's provenance obligation was refined by its own first outing** — [Q112](../questions/q112.md).
   It does not distinguish breaking the **actual** side of an assertion from the **expected** side,
   and the second always survives. Three of six provenance probes survived and **none was a hole**;
   the three that caught all broke the input or the declared value. **First rule in that document to
   be corrected by its first use.**

**And rule 8's own founding case occurred inside rule 8's procedure again** — W18's shape, one plan
on. Reverting `Driver.regionOf` to `.find` cost **nothing**: every probe against the region maths was
caught by its own tests, and the driver's one-line delegation — what P7 called *the plan's central
defect* — was held down by no assertion, because nothing drove a `Driver` through a nested flow.
Closing it produced [Q113](../questions/q113.md): `regionOf` is read on **three** paths only, and
`branch.arrived`/`branch.opened` use keyed lookups — so innermost resolution is load-bearing on the
**non-success paths only**, which is why the defect survived four plans, and which **W22 needs before
its declaration rather than inside it**.
