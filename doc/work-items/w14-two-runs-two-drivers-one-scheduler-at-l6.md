# W14 — Two runs, two drivers, one scheduler — at L6

**Status:** **in review** - built, gate green, both readers owed
**Plan:** [P4](../plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) — its exit artifact

```
Spec:       spec/task-id.md (as W13 leaves it) and spec/run-state.md section 3.
            This item writes no spec and changes none. If two drivers on a REAL
            scheduler behave differently from two on the fake, that is a finding
            about the fake and belongs in the Record
Owns:       examples/**  — inherited from W6, which is done, the same way W6
            inherited it from W5. P4's takeover table is the declaration
            plus one declared exception: doc/open-questions.md, for Q90. W12
            raised that section 1 rule 5's record-step list omits this file
            while every Reserves: line obliges it
Inputs:     W13's driver, and the L6 harness as it stands: examples/run-flow.ts
            builds ONE scheduler, ONE driver, ONE run and resolves on a
            termination predicate over that run's fold. The shape this item
            needs — two drivers sharing one scheduler, terminating when BOTH
            runs are terminal — does not exist. That is the item's only design
            work and it is named here so it is not discovered halfway through
Outputs:    (1) a fourteenth L6 row: two runs, two drivers, one scheduler, both
            completing on real workers, in Node and Deno; (2) whatever the
            harness needs to run two runs at once, which is a change to W6's
            file rather than to src/; (3) the assertion that each driver's
            snapshot() holds only its own run's task ids — the corruption Q72
            described, stated as a thing that cannot happen
Depends on: W13. Before it, this row FAILS, and running it first to watch it
            fail is this item's negative test rather than a mistake
Blocks:     nothing
Tests:      the row IS the test, as every L6 row is. Expected values come from
            spec/run-state.md section 3 (both runs `completed`) and from
            spec/task-id.md section 2 (a task id identifies one run, so the two
            dispatch sets are disjoint) — derived before running, never pasted
            from output
Gate:       L0-L6. L0-L5 in all five runtimes, L6 in Node and Deno. Then pass 2
            — TWO readers
Reserves:   Q90, ADR — none expected
```

**Every line is fillable.** The one that needed stating rather than measuring is `Inputs:` — the
harness has no two-run shape — and P2 learned to name that kind of thing in the plan rather than
meet it halfway through (*"the known design problem, stated before it is hit"*).

---

## Scope

**In**

1. **One row, two runs.** Two `Driver`s over the same definition with different run ids, both
   constructed against **one** `FyflowScheduler`, both started, both reaching `completed`.
   `fanout-join` is the right flow: it has a join, so a cross-routed settlement corrupts region state
   as well as the log, and it is the flow every other row is calibrated against.
2. **The harness learns to terminate on two runs.** `examples/run-flow.ts` folds one driver's inputs
   and stops when that run is terminal. Two runs means terminating when **both** are, with the same
   clock-free predicate ADR 0014 made possible — **not** a timeout, which is what W5's adequacy
   reader caught the harness doing under a different name.
3. **The disjointness assertion.** Each driver's `snapshot()` contains only its own run's task ids,
   and `dispatchedIds()` for the two drivers do not intersect. That is Q72's corruption written as
   something that must not happen, and it is what would fail if W13 regressed.

**Out** — named rather than left implicit, with where it goes instead

- **Any change to `src/`.** If this row needs one, W13 was not finished and the change belongs there.
  This item touching `src/driver/**` is a finding, not a fix.
- **Two runs of *different* definitions.** One flow, two runs is the pairing Q72 is about. Two
  definitions adds a variable and answers nothing extra.
- **Scale.** Two, not two hundred. Whether a scheduler shared by many drivers has a throughput or
  retention problem is [Q19](../open-questions.md)/[Q20](../open-questions.md), and it is not
  answered by a row.
- **The browser at L6** — [Q52](../open-questions.md), unchanged and still open.

## Verification

| Clause | How it is run |
|---|---|
| L0-L5 | unchanged, five runtimes. This item touches no `src/` file, so a failure there is this item's fixture |
| **L6** | `npm run test:l6` and `npm run test:l6:deno` — **fifteen runs in fourteen rows**. The new one reports both outcomes, both join states and both dispatch sets |
| **the negative test** | **run the row against `main` before W13 lands and watch it fail** — `doc/workflow.md` section 5 rule 7 and rule 8. A row added after the fix that has never been red is a row that cannot fail, and this repository has shipped three of those |
| pass 2 | two readers |

**Routing cases** (`TEMPLATE.md` asks each in turn):

| case | covered |
|---|---|
| a branch routed away from its join (Q4) | **no** — the twelve existing rows cover it and adding a second run does not change it |
| `user_action` (Q17) | **no.** Rows 10 and 11 cover it. Combining suspension with two runs would test two things at once |
| no matching decision edge (Q10) | no |
| a duplicate task id (Q13) | **yes, and it is the point** — under one scheduler, two runs' ids must not collide, and today `run-a:publish:-:0` is dispatched twice |
| a nested fan-out (Q6) | forbidden by `FD-V15` |

## Record

**Status: built, gate green, both readers owed.**

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0-L5 | **RAN** — pass | all five | **326 assertions**, unchanged by this item — it touches no `src/` file and no test under `test/` |
| **L6** | **RAN** — pass | Node, Deno | **233 assertions, was 219** — thirteen rows plus the pair, which is **two runs and 14 assertions** |
| **the negative test** | **RAN** — and it found something | Node | table below |
| conformity reader | **NOT RUN** | | owed |
| adequacy reader | **NOT RUN** | | owed |
| re-run at `<sha>` | **NOT RUN** | | owed |

**The negative test, which the declaration required and which is the item's most useful output.**
*"Run the row against `main` before W13 lands and watch it fail — a row added after the fix that has
never been red is a row that cannot fail."* W13 has landed, so the equivalent is to revert the
mechanism:

| provocation | result |
|---|---|
| **the whole `ID-R4` guard removed** — the driver as it was before W13 | **RED, 5 failures** |
| **tier 1 only removed** — every foreign settlement then reaches tier 2 | **RED, 7 failures** |
| **tier 2 only removed** | **GREEN — and that is the finding.** See *What broke* 2 |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| a fourteenth L6 row: two runs, two drivers, one scheduler, on real workers | **yes**, printed as two lines because it is two runs | provocations 1-2 |
| whatever the harness needed to run two runs at once | **yes, and it is one option**: `RunOptions.scheduler`, plus `runPair`. `runFlow` will not `shutdown()` a scheduler it did not build | L6 hangs or drains the other run out from under itself |
| the assertion that each driver's `snapshot()` holds only its own run's task ids | **yes**, and its stronger sibling: **across both drivers, no task id is dispatched twice** — `spec/task-id.md` section 2's collision, stated as a thing that cannot happen | provocation 1 |

## What broke

**1. Nothing, and that is the weaker result this item should have predicted.** W13 proved the
mechanism at L2 against a fake; this row proves the fake was not lying. It passed first time. The
only new information is in the negative test.

**2. The pair row does not cover `ID-R4` tier 2, and the first version of this row claimed it did.**
The comment said *"it is the only L6 coverage `ID-R4` has"*. **Deleting tier 2 leaves the row green**,
because a foreign settlement returns at tier 1 and never reaches tier 2 — so the claim was true of
tier 1 and false of the rule. Tier 2 needs a settlement carrying *this* run's id for a task the driver
never dispatched, and a real scheduler produces one only if something **injects** it, which no L6 row
does. **Found by the item's own declared negative test, before either reader ran** — which is the
first time a provocation in this repository has caught a false claim rather than a weak assertion.
Corrected in place, and the gap is [Q90](../open-questions.md) rather than a silent hole.

**3. The harness change is one option, and that was not obvious in advance.** The declaration said
*"the shape this item needs does not exist"* and named the two-run termination as its only design
work. It turned out `runFlow` already terminates per run, clock-free, so two of them run concurrently
against one scheduler with no change to the mechanism at all — the only thing that had to move was
who owns the scheduler's lifetime. **`buildScheduler` was extracted so the two entry points cannot
drift about what a worker does**, which is the one duplication this file's own comments warn about
twice.

## What this taught

- **A negative test can falsify a claim, not just a weak assertion.** Rule 8 exists because three
  items shipped a fix that could not fail; here the provocation instead showed that a *sentence* in
  the row was wrong. That is a use the rule does not name and it cost four minutes.
- **The exit artifact confirmed rather than discovered, and the plan predicted that.** Every finding
  of substance in P4 came from the spikes and the readers. What L6 adds is that the L2 fake is
  faithful on this pairing — which is worth having precisely because *"fixtures-versus-reality is
  where this repository has been wrong"*, and this time it was not.

## Questions raised

**Q90** from P4's remaining block.

| Q | | raised by |
|---|---|---|
| Q90 | **`ID-R4` tier 2 has no L6 coverage and the two-driver row cannot give it any** — deleting tier 2 leaves the row green. L2 covers it three shapes × three terminal states; a real scheduler reaches it only if something injects a task the driver did not mint | W14's own negative test |
