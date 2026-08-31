# W14 — Two runs, two drivers, one scheduler — at L6

**Status:** todo
**Plan:** [P4](../plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) — its exit artifact

```
Spec:       spec/task-id.md (as W13 leaves it) and spec/run-state.md section 3.
            This item writes no spec and changes none. If two drivers on a REAL
            scheduler behave differently from two on the fake, that is a finding
            about the fake and belongs in the Record
Owns:       examples/**  — inherited from W6, which is done, the same way W6
            inherited it from W5. P4's takeover table is the declaration
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
| **L6** | `npm run test:l6` and `npm run test:l6:deno` — **fourteen rows**. The new one reports both outcomes, both join states and both dispatch sets |
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

*Filled in when the item is done.*
