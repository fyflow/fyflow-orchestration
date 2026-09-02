# P7 — Is a join transitive over nested fan-out?

**Status:** **RUNNING.** [W20](../work-items/w20-what-a-nested-region-is.md) is **declared in its own
file**; W21-W23 exist in the index table below and in no file yet. Read each item's status from its
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

**Question this plan answers:** [Q6](../open-questions.md) — *if a branch itself fans out, does the
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
| **The fold and the policy interface need little or nothing** | `RunState.regions` is a **flat map keyed by `regionId`**, `settled` is keyed by `branchPath` **strings**, and `Region.branches` is per-region. All three already carry depth 2 without a shape change. `step()`'s per-input copying is unchanged by nesting; the fold's quadratic ([Q19](../open-questions.md)) is a node-count question and depth 2 does not move it |
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
[Q100](../open-questions.md) is what happens to a rendered artifact nobody asserts on.

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

- **Map-style fan-out** ([Q12](../open-questions.md)). A dotted path admits it and this plan does not
  build it. It is also where the fold's quadratic ([Q19](../open-questions.md)) would start to
  matter, and that is a different plan's measurement.
- **Convergent branches**, `FD-V19` and `FD-V22` ([Q27](../open-questions.md)). Adjacent restrictions
  in the same family; lifting one is not lifting three.
- **Unbounded depth as a *tested* claim.** The grammar admits any depth and the code should not care,
  but the matrix and L6 are run at **depth 2**. An item that claims depth 3 works owes a row.
- **Per-join policies** ([Q5](../open-questions.md)). Nesting makes *"one policy per run"* feel
  wrong, and it is not this plan's question — one policy per run stays.
- **[Q19](../open-questions.md)'s scale measurement.** Named because W21 is where it would surface,
  and refused because a curve is not this plan's exit artifact.

## Work items

**Four, serial, and each separated by a spec document** — `doc/workflow.md` section 7 rule 1's test,
not intuition. No two edit the same file.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| **W20** — *declared* | What a nested region **is**: `FD-V15` lifted, innermost resolution as **region maths** | `src/definition/**` (W1/W2), `spec/flow-definition.md` (W1), **`spec/examples/**` (W1)**, `spec/README.md` | nothing | L0-L5 climbed, own coverage at **L0/L1/L4**, then two readers |
| **W21** | The **path**: `buildTaskId` emits a dotted `branchPath`, the driver pushes a segment | `src/driver/ids.ts` and the two `split('.')` sites in `src/driver/driver.ts` (W3), `spec/task-id.md` (W1) | W20 | L0-L3, then two readers |
| **W22** | **The decision.** ADR 0030; the matrix at depth 2; `arrival-count`'s refusal | `spec/join-policy.md` (W1), `test/matrix/**` (W4), and the construction refusal in `src/driver/driver.ts` | W21 | **L0-L5**, ADR 0030, then two readers |
| **W23** | A nested flow on **real workers** | `examples/**` (from W19) | W22 | **L0-L6, both L6 runtimes**, then two readers |

**Why four and not three.** W20 and W21 look like one item and are not: W20 answers *which region is
this node in*, which is a definition question with no id in it, and W21 answers *what is this task
called*, which is `spec/task-id.md`'s and touches the published id grammar. **They are separated by a
spec, which is the rule.** W22 and W23 are P6's split re-used — decide over fixtures, then demonstrate
on real workers — and P6's retro records that splitting on exactly that line is what let W18 decide
and W19 demonstrate.

**W22 is the one to watch for size.** It carries an ADR, a spec rule, a driver refusal and a matrix
dimension. If its declaration cannot state a gate, section 1 rule 1 says the decomposition is wrong;
the obvious cut is the refusal into its own item, and it is named here so it is not discovered late.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q6](../open-questions.md) | is a join transitive over nested fan-out | **W22** — closed by ADR 0030, whichever way it goes |
| [Q90](../open-questions.md) | `ID-R4` tier 2 has no L6 coverage | **candidate for W23.** P6's retro ruled it a work item rather than a plan, and its instrument — `ForeignTask` in `examples/run-flow.ts` — is W23's file. **The marginal cost is a string**, and the *against* case is untouched: injecting a task the driver did not mint is a scenario no consumer produces on purpose. W23's declaration rules |
| [Q107](../open-questions.md) | `ID-R5` at L6 sees `task.completed` and nothing else | **candidate for W23**, same file. Needs a worker role that fails fast enough to keep W19's ordering determinate |
| [Q108](../open-questions.md) | ADR 0027's `context.spawnTask()` producer is demonstrated nowhere | **no owner.** It needs a worker that spawns, which runs into [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 2 and needs its framing decided first. **Not W23's by default** |
| [Q5](../open-questions.md) | per-join configurable policies | **no owner, and nesting makes it louder.** `spec/join-policy.md` section 5 already lists it beside Q6; this plan answers one and not the other |
| [Q23](../open-questions.md), [Q27](../open-questions.md) | `FD-V13`, `FD-V19`, `FD-V22` — the other liftable restrictions | **no owner.** Named so that lifting `FD-V15` is not read as lifting the family |

## A note on ids

**P7 starts at W20**: W1-W19 exist, **W10 stays held** and **W11 stays skipped**, for the fourth plan
running and on P2's and P4's reasoning — P4's retro retired `check-owns.mjs` as a proposal, and taking
W10 here would make P2's Record false.

**Q ids resume at Q112.** P6 reserved Q101-Q110 and used Q101-Q108; **Q109 and Q110 are skipped,
never reissued**. Q111 is P5's retro's, taken outside every block on ADR 0029's precedent.

**ADR ids resume at 0030.** P6 reserved 0027-0028 and used 0027, so **0028 is skipped**. **0026 stays
held for [Q97](../open-questions.md)** — P5 reserved it for the `stuck` conflation and deliberately
did not take it, and this plan does not take it either.

## Record

*Filled in when the plan's items are merged and its retro is run.*
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
2. **v0.8's provenance obligation was refined by its own first outing** — [Q112](../open-questions.md).
   It does not distinguish breaking the **actual** side of an assertion from the **expected** side,
   and the second always survives. Three of six provenance probes survived and **none was a hole**;
   the three that caught all broke the input or the declared value. **First rule in that document to
   be corrected by its first use.**

**And rule 8's own founding case occurred inside rule 8's procedure again** — W18's shape, one plan
on. Reverting `Driver.regionOf` to `.find` cost **nothing**: every probe against the region maths was
caught by its own tests, and the driver's one-line delegation — what P7 called *the plan's central
defect* — was held down by no assertion, because nothing drove a `Driver` through a nested flow.
Closing it produced [Q113](../open-questions.md): `regionOf` is read on **three** paths only, and
`branch.arrived`/`branch.opened` use keyed lookups — so innermost resolution is load-bearing on the
**non-success paths only**, which is why the defect survived four plans, and which **W22 needs before
its declaration rather than inside it**.
