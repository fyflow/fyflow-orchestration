# W14 — Two runs, two drivers, one scheduler — at L6

**Status:** **done** - built, both readers run, every finding acted on, gate re-run
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

**Status: done** — built, both readers run, every finding acted on, gate re-run.

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0-L5 | **RAN** — pass | all five | **326 assertions**, unchanged: this item touches no `src/` file and no test under `test/` |
| **L6** | **RAN** — pass | Node, Deno | **240 assertions, was 219** — the pair block is **21**, was 14 before the readers |
| **the negative test** | **RAN** — and it found something | Node | table below |
| **conformity reader** | **RAN** — **0 blocking, 6 defect, 6 note** | n/a | derived the row's expected values from `spec/` before opening it, and its derivation was **stronger than the row** on four counts |
| **adequacy reader** | **RAN** — **39 mutations, 17 survived every layer, 2 blocking** | n/a | 15/15 flake runs green; Deno green |
| **re-run after acting on both** | **RAN** — pass | all five, both L6 runtimes | `npm run gate` exit 0 |

**The negative test, which the declaration required.** *"A row added after the fix that has never been
red is a row that cannot fail."* Both readers reproduced all three results independently, from a
pristine checkout:

| provocation | result |
|---|---|
| the whole `ID-R4` guard removed — the pre-W13 driver | **RED, 5** → now **8** |
| tier 1 only removed | **RED, 7** |
| tier 2 only removed | **GREEN** — [Q90](../open-questions.md), and correct |

**And the five mutations that survived the first version, now red:**

| provocation | before | after |
|---|---|---|
| **X13** — guard removed **and** `dispatchedIds()`/`snapshot()` filtered by run id | **GREEN, 233/0** while `addTask` was called **55 times for 50 distinct ids** | **RED, 5** |
| **H1** — `ownsScheduler` always true, so the first run to finish drains the other | GREEN 5/5 | **RED, 1** |
| **H3** — `runPair` sequential rather than concurrent | RED 1 (one assertion, timing-dependent) | **RED, 1** (structural) |
| **H4** — run `b` given its own scheduler | RED 1 (same one) | **RED, 2** |
| **F5** — the pair loop iterates `pa` twice, `pb` asserted by nothing | **GREEN at an unchanged 233** | **RED, 1** |

## What broke

**1. The row's central claim had one source of truth and it was the code under test.** Every
disjointness assertion read `driver.dispatchedIds()` and `driver.snapshot()`. The adequacy reader
removed the `ID-R4` guard **and** filtered those two accessors by run id: the row stayed **green at
233/0** while the real scheduler was handed 55 `addTask` calls for 50 distinct ids — five task ids
dispatched twice, Q72's corruption in full, reported by nothing. `doc/workflow.md` section 5 rule 4,
at the one place this harness already knew to avoid it: it uses `settledByScheduler` for *"every
dispatch settled"* precisely because `driver.terminalStateOf` would be circular, and then used the
driver for disjointness anyway.

**`runPair` now reads four facts from the scheduler itself, before either driver exists** — the
settlement ids in order **with duplicates kept**, the `addTask` count, the listener counts, and the
shutdown count. Every one is a count of *structure*, not of order.

**2. The assertion meant to be the independent one contained a tautology.**
`settledByScheduler.length === new Set(...).size` cannot fail: `settledByScheduler` **is** a `Set`,
returned as an array. The scheduler's own contradicting evidence was discarded one line earlier —
measured at the listener under the guard-removed mutation: **`raw=12, distinct=7`**, five ids
settling twice, which is `spec/task-id.md` section 2 point 3 exactly. The new recorder `push`es.

**3. An assertion depended on an interleaving `spec/` does not fix — rule 5, in a file that refuses
that elsewhere.** `pa.settledByScheduler.some(id => id.startsWith('pb:'))` needed a `pb` settlement
to land before `pa` reached its terminal outcome. It was robust in practice (the single-thread
`IngestWorker` pool forces the order under equal delays) and **that argument was written nowhere**.
Worse, both readers found it was the **only** assertion pinning the shared-scheduler topology at all:
give run `b` its own scheduler and exactly one assertion failed. Replaced by two timing-free ones —
the settlement-id set, and *both runs attached before the first settlement*.

**4. That replacement was wrong on its first try, and the gate said so.** I first asserted both runs
were attached before the first **dispatch**. They are not: `runFlow` is synchronous up to its first
`await`, so run `a` has already called `addTask` before run `b` is constructed — measured **8 of 14**.
The boundary that matters is the first **settlement**, because a driver attached after it would never
see that settlement, and that is what tier 1 is about.

**5. The pair block had one fewer floor than any row, and duplicating its subject defeated all of
them.** It never enters `rowCosts`, so `PAIR_ROW` was hand-typed rather than derived. The adequacy
reader iterated `pa` twice — **`pb` asserted by nothing, at an unchanged 233, exit 0**. No counting
floor can see a duplicated subject, so the fix is not a floor: the block now asserts its subjects are
**two distinct runs**, and `PAIR_ROW` is derived from the list's length.

**6. The block omitted six assertions every single-driver row makes.** Both readers, independently.
Added: the four dispatched ids **in full** (a prefix predicate passes for a run that dispatched one
task or seven), `regions.split.settled`, and **`lateInputs === []`** — `RN-R12`, and this row is the
best place in the file for it, because it is the only one where a settlement for another run
genuinely arrives after this run is declared finished.

**7. Three stale counts and two wrong comments**, all in files this item owns or updated:
`examples/README.md` said 219; `CLAUDE.md` said *"thirteen rows, 219 assertions"* two lines below the
line this item had already corrected to 233; the `settledByScheduler` comment claimed it holds both
runs' tasks (it holds **7 of 8** — it is snapshotted when `pa` returns); the tier-1 comment said
deleting tier 1 makes `pb` fail (it fails **both**); and `${reports.length + 2}` put a typed constant
back into the one line whose comment reads *"the count is derived, not typed"*.

**8. A process failure that is mine, not the item's.** Both readers ran concurrently against **one
working tree**, and the adequacy reader mutates in place. The conformity reader's early measurements
picked up the other's instrumentation — a stray debug line, and a Deno run reporting `declared: 219`
against a file reading 233 — and it re-took every number from an isolated copy, so its report is
sound. The reader's own cleanup then **deleted `node_modules`**, which cost an `npm install`. I have
now run three reader pairs this way and this is the first time it was caught. **For P4's retro.**

## What this taught

- **"Independent source" is a property to check, not to declare.** This harness knew the rule — it
  built `settledByScheduler` *because* `driver.terminalStateOf` would be circular — and then wrote the
  row's headline assertion against the driver anyway, with the one independent source reduced to a
  tautology beside it. **The knowledge was present and did not transfer to the new block.**
- **A row's claim and a row's assertions are different things, and the negative test measures the
  gap.** W14's own provocation caught one over-claim before either reader ran (tier 2); the readers
  caught three more (the topology resting on one timing-dependent assertion, the subject duplication,
  the driver-sourced disjointness). Every one was a *sentence* that outran its evidence.
- **Two readers, ~26 findings, 4 clean overlaps ≈ 15%** — W12 3/18, W13 4/24, W14 4/26. The absolute
  count is 1-4 across six items of very different sizes, which is now a firmer statement than any
  fraction.

## Questions raised

**Q90** from W14's block. Q89 and below belong to W13.

| Q | | raised by |
|---|---|---|
| Q90 | **`ID-R4` tier 2 has no L6 coverage and this row cannot give it any** — deleting tier 2 leaves the row green, confirmed by both readers. A real scheduler reaches tier 2 only if something injects a task the driver did not mint | W14's own negative test |
