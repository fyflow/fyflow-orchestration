---
id: ADR 0121
title: "The driver keeps a per-task view of its log"
status: accepted
date: "2026-10-21"
item: W195
raised-by: P39
supersedes: ""
amends: ADR 0040 rule 2 in part
resolves: ""
---

# ADR 0121 — The driver keeps a per-task view of its log

**Status:** accepted — [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) decisions 4, 5 and 6,
and stop-and-asks (a) and (e), answered *"as recommended"* by the maintainer 2026-10-21; written by
[W195](../work-items/w195-the-drivers-per-task-view-of-its-log.md). It defines `spec/run-state.md` v0.30 (`RN-R13`'s text).
**It amends [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2** — *computed rather than maintained* — a second time, after
[ADR 0118](0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md). It resolves no question; it
answers [Q43](../questions/q43.md)'s concern for this structure by the condition in rule 2 below.

## Context

fyflow-app's pass 2, #4: the driver's own cost on a long `map`. Re-taken at W195's declaration on `7b47f78`, the app's
repro with its queue walked by INDEX (P39 fact 4), each size a fresh process, node 24.20.0: **106 / 324 / 999 ms at 4,000 /
8,000 / 16,000 items, and 10,015 ms at 32,000** — 3.1x, 3.1x and 10x per doubling. A CPU profile at 16,000 items, an
`attempted` element per task: **~60% of the run in `effectiveOutcome(this.log, taskId)`** called from `advance`, the scan of
the WHOLE log made once per settlement (P39 fact 5). The same function, and `isSuspended`, are what `parked`, `hasParked`
and `effectiveOutcomeOf` asked, and `inFlight` built a set from the whole log; `outputs()` rebuilt its projection from the
whole log whenever the log had grown, so a `needs` read once per settlement paid O(log) each time (P39 fact 7).

A second cause, found by the same profile under an INLINE pool (which fires `task.running` inside `addTask`): the driver's
queue of attempt starts heard on a step, `attemptsPending`, drained by `Array.prototype.shift` — O(n) a call, n one per
item of a map dispatched in that step — **14% of a 32,000-item run**. P39 fact 4's steeper right-hand column (`task.running`
before each settlement) did NOT reproduce with the queue walked by index: 999 ms without, 1,037 ms with, at 16,000.

The constraint: `effectiveOutcome` and `isSuspended` are PUBLIC (`index.ts` re-exports `src/driver/log.ts`) and keep their
signatures and semantics (P39 fact 5); and ADR 0040 rule 2 refuses a MAINTAINED index as *"a second source that can
disagree with the log"*.

## Decision

1. **The driver keeps each task's SUB-LOG** — `TaskLog`, a private field `taskLog`: for every task id, the records `append`
   pushed for it, **by reference and in append order** — the very objects `log` holds — and NOTHING derived. Written in
   `append`, beside `log`: the one place every element passes (ADR 0014), so the view cannot lag the log.
2. **It is not a second source, and that is the condition this amendment rests on**: it holds no conclusion — no
   settlement-or-resolution merge, no suspended flag — only the log's own records, grouped. Every reader hands its
   task's sub-log to the PUBLIC `effectiveOutcome` or `isSuspended`, each already total on a sub-log because each filters
   by `taskId` first; the merge stays in ONE place (`outputs()`'s own comment stated this condition before W195).
3. **Every per-task question the driver asks of its log reads the view**: `advance` (a settlement's effective outcome),
   `parked` and `hasParked` (`RS-R1`), `inFlight` (`RN-R21`: dispatched and no settlement), `effectiveOutcomeOf`, and
   `outputs()`. Each costs the task's records — one or two — where it cost the run.
4. **`outputs()` is CAUGHT UP, not rebuilt**: it reads only the records appended since its last read (an index into the
   append-only `log`), and for each sets that task's entry to the merge of the task's whole sub-log at that moment —
   removed, replaced, appended, or, for a resolution after a `user_action`, placed at the task's FIRST-record position, the
   order the rebuild grouped in. **Equal to a rebuild at every read**, and still LAZY: built only when a `needs` asks, so
   ADR 0040 rule 1's *the default is unchanged* holds of the cost.
5. **`log` STAYS** — re-take 4: the view ADDS a field rather than replacing one. `snapshot()` reads the whole log in append
   order, `outputs()`'s catch-up indexes it, and the L6 retention walk's alias check reads it; at ~3 B a record by
   `v8.serialize` it is cheaper than deriving it.
6. **The driver's step queues drain in O(1) a take** — `Fifo`, a head index, a slot cleared as it is taken and the backing
   array dropped when the queue empties — for `attemptsPending` (the cause above) and `pausePending` (the same shape, a
   consumer's calls on one step). Same order, same semantics (`RN-R40`, `RN-R35`, `RN-R37`).
7. **The driver's COUNT is `taskLog.visits`** (P39 decision 6, for W197): the number of RECORDS handed to a reader —
   each `of(taskId)` adds the length of the sub-log it hands out, and `outputs()`'s catch-up reads every record through
   `of`, so it is counted there. Exact on the item's runs: a `map` of n items, n + 1; with a `needs` read per
   settlement, 3n + 2; a `user_action` then its resolution, 3 (`parked`'s one record and `advance`'s two). **A field of
   the private view, never module state** (`RN-R1`'s *no module-level mutation*, held of the driver too): two fresh runs
   count the same. **No public TYPE names it** — `TaskLog` is unexported (`index.ts` re-exports neither class) and the
   field TypeScript-private; at run time it is an own property of the `Driver`, as every private field is, which is how
   the item's tests read it. It costs one addition a read — 258 against 248 ms, medians of seven, at 16,000 items with it
   and with the line deleted, node 24.20.0. What it does NOT count: work that reads no record — the queues of rule 6 among
   them, whose cost no clock-free count can see (`Array.prototype.shift`'s move is not a JavaScript step).
8. **What does NOT move** (P39 decision 5): no `FoldInput` kind, no element, no order, no `RunState` cell, no checkpoint
   field, no value `effectiveOutcome`, `isSuspended`, `snapshot()` or `foldInputs()` returns. Measured: the fold inputs,
   the snapshot and a resume from every rest point are byte-identical to `7b47f78`'s over every valid corpus flow under
   seven drains (182 runs: the test's six and *an uncloneable result first*); and so are the conformity reader's 2,415
   seeded transcripts of random settlements, resolutions, pauses, stops, cancels, throwing callbacks and resumes, the
   `createTask` payloads — where `outputs()` surfaces — included.

## Consequences

1. **The driver at 4,000 / 8,000 / 16,000 / 32,000 map items: 71 / 131 / 229 / 465 ms in node** (106 / 324 / 999 / 10,015
   before) — 1.8-2.0x per doubling; deno 83 / 154 / 283 ms (121 / 399 / 1,363 before). The CPU profile is flat:
   `structuredClone` of each result (OR-R2) leads it.
2. **ADR 0040 rule 2 reads, from here**: *what a node can reach is the run's own outputs — a projection of the log, its
   entries the merge `effectiveOutcome` makes of each task's own records, caught up as the log grows — the value the run
   was handed (ADR 0117), and the item of its own map instance (ADR 0118).*
3. **`RN-R13` gains a holder, never a copy**: `taskLog` reaches every settled result by reference; the walk's holder sets
   each gain one name, and `test/driver/retention.test.ts` asserts every result it reaches `===` a log record's. Its cost,
   ~26-28 B a task by `v8.serialize`, is its task id and an array. **And `outputsCache` costs more than it did**: beside
   its entries it keeps a slot per task id read and each entry's position — ~88 B an entry where the length-keyed memo cost
   ~25 (87.5 / 87.6 / 90.7 against 24.6 / 24.2 / 24.9 B at 10 / 100 / 1,000 instances of a `needs` read; the conformity
   reader's measurement, C1) — still per task, and no result held twice.
4. **`DRIVER_FIELDS` moves by one name, `taskLog`** — `test/driver/retention.test.ts` and `examples/l6.ts`;
   `examples/run-flow.ts`' `NOT_RUN_STATE` does not (the view is walked).
5. **For P39's W197**: the count is `taskLog.visits`, read by a cast; restoring the whole-log scan in `TaskLog.of` (the
   visits of `log.length`) or a rebuild per `outputs()` call is the provocation that makes the ratio red.
