# W195 — the driver's per-task view of its log: a settlement's reads cost the task, not the run

**Status:** done 2026-10-21 — `npm run gate:item` on the final tree, one command, EXIT 0 (re-run after the maintainer's YES to the stop-and-ask, the Record's last gate row); both readers RAN, every finding acted on; 29 provocations KILLED, none surviving; no question raised. Earlier: declared 2026-10-21 on `7b47f78`; P39's SECOND item: decision 4, 5 and 6's driver half, stop-and-asks (a) and (e) as answered; the declaration step RUN before any `src/` edit (below)
**Plan:** [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) — *what does a step cost on a long
run, and where may its owner read the run's live state?* — and this is its SECOND item: the driver's own cost, fyflow-app
pass 2 #4.

```
Spec:       spec/run-state.md v0.29 -> v0.30 — RN-R13 (what the driver retains: the view joins the holders, BY REFERENCE);
            spec/outcome-record.md NOT moved (re-take 5: section 7 names no scan); spec/README.md's row for v0.30.
Owns:       from P39's W195 row: src/driver/driver.ts, test/driver/**, test/definition/l4-corpus.test.ts, examples/l6.ts
            (DRIVER_FIELDS only), examples/run-flow.ts (NOT_RUN_STATE, only if a field lands there — none does),
            spec/run-state.md (the WHOLE file), spec/outcome-record.md (as above — not edited), spec/README.md, AGENTS.md
            (the WHOLE file, sentence D′), doc/decisions/0121-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): none at declaration; ONE after the readers,
            by the maintainer's YES (2026-10-21) to the stop-and-ask in the Record — spec/flow-definition.md, FD-C1's prose
            sentence on the projection (one dated note). The record step's four files carry
            ADR 0040's dated amendment note (doc/decisions/**). Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P39 decisions 4, 5, 6 and stop-and-asks (a), (e) ANSWERED 2026-10-21 as recommended ((f) is W196's, not read
            here); P39 facts 4-8, RE-RUN at this item's declaration step; ADR 0040 rule 2 and its ADR 0118 amendment;
            ADR 0014; outputs()'s own comment; RN-R13; W194's note on test/driver/fold-inputs.test.ts:228.
Outputs:    (1) ADR 0121 — the driver keeps a per-task view of its log: each task's SUB-log, references to the records
                `append` pushed, in order, and nothing derived; the merge stays in `effectiveOutcome` and `isSuspended`,
                handed the sub-log. Amends ADR 0040 rule 2 a second time.
            (2) the view (`TaskLog`, the private field `taskLog`), maintained in `append`; `advance`, `parked`,
                `hasParked`, `inFlight`, `effectiveOutcomeOf` and `outputs()` read through it.
            (3) `outputs()` CAUGHT UP from the records appended since its last read, never rebuilt — equal to a rebuild at
                every read.
            (4) what the profile found on the `attempted` road: `attemptsPending.shift()` under an INLINE pool — the same
                class (a per-element cost growing with the run) — fixed here: `Fifo`, for it and `pausePending`.
            (5) the driver's counter, `taskLog.visits` — a field of the private view, never module state, named in
                ADR 0121 rule 7 — and DRIVER_FIELDS moved by its NAME (`taskLog`).
            (6) RN-R13's text, spec/README.md's row, ADR 0121, AGENTS.md's sentence on the driver's cost;
                test/driver/fold-inputs.test.ts's stale `parseTaskId` pointer corrected (W194's C7).
Depends on: W194
Blocks:     W196
Tests:      L2 — test/driver/log-view.test.ts: over every valid corpus flow on a double under six drains, at EVERY fold
            input, every per-task read the driver makes — effectiveOutcomeOf, parked, inFlight, hasParked, outputs() —
            equal to the SECOND route: the public `effectiveOutcome`/`isSuspended` over the public `snapshot()`, and the
            pre-W195 rebuild of outputs() (its algorithm, in the test); a user_action then its resolution, an ask
            answered, a resolution placed BEFORE a later sibling's entry; outputs() over a long tail; a run RESUMED from
            every rest point, before and after its parked tasks are resolved; a SECOND settlement of a settled task
            (its entry removed, then placed again on its resolution); the view's records the log's own objects, in append
            order; an inline pool's 300 attempt starts appended in the order heard, and a throw with attempts queued
            behind it; the EXACT count on three runs (n + 1, 3n + 2, and 3 for a sub-log of two); the COUNT ratio at 500 and
            2,000 map items with `task.running` (attemptNumber 1) before each settlement, with and without a `needs` read
            per settlement, below 6x, above a floor of one visit per settlement; the driver's SOURCE as the second observer
            of the count. test/driver/retention.test.ts: the holder sets with `taskLog`, and every result it reaches `===`
            a log record's. Fold inputs, snapshots and resumes byte-identical to the pre-change driver (a measurement).
Gate:       `npm run gate:item`; then the conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q725-Q729, ADR 0121
```

## Scope

**In**

1. **The view and its readers** — Outputs (1)-(3).
2. **The `attempted` road** — Outputs (4).
3. **The counter and the census** — Outputs (5); **the record** — Outputs (6).

**Out** — named rather than left implicit, with where it goes instead

- **`effectiveOutcome`'s and `isSuspended`'s public signatures and semantics** — unchanged (P39 fact 5); they are what the
  view is handed. `src/driver/log.ts` is not edited.
- **The fold** — W194. **The runtime and (f)** — W196. **The gate's standing ratio at 2,000 / 8,000 and its checked-in
  provocations** — W197; this item holds its own at 500 / 2,000.
- **The scheduler's own cost** and **the app's harness** (`queue.shift()`, P39 fact 4) — the reply, W197.
- **Any element added, removed or reordered** — none (P39 decision 5; prediction 5).
- **`pausePending`'s answer scan in `resolveStep`** (one pass over the calls pending on the step, per mid-step resolve) — a
  consumer's call count, not the run's; kept, stated in the Record.

## What the declaration step re-took, before anything was edited

*P15 decision 5: every fact is re-run by the item that acts on it. Taken 2026-10-21 on `7b47f78`, the tree clean. The
harness is the session scratchpad's `w195/drv.ts`: the app's repro, driver only, its queue walked by INDEX, each size a
FRESH process.*

| # | re-take | measured |
|---|---|---|
| 1 | P39 fact 4, node 24.20.0 | no `task.running`: **106 / 324 / 999 ms** at 4,000 / 8,000 / 16,000 items (16,003 / 32,003 / 64,003 inputs); with `task.running` carrying `attemptNumber: 1` before each settlement: **108 / 338 / 1,037 ms** (20,003 / 40,003 / 80,003). 32,000 items: 10,015 / 9,066 ms. **deno 2.9.6**: 121 / 399 / 1,363 and 123 / 437 / 1,230 ms. **Fact 4's steeper right-hand column did NOT reproduce**: with the queue walked by index, `attempted` elements cost ~4%. (With the harness's `queue.shift()` restored, 1,535 / 1,656 ms at 16,000 — the coordinator's 2,870 is not reproduced either way) |
| 2 | a CPU profile at 16,000 items WITH `attempted` elements (scratchpad `w195/prof-before`) | **`advance` 43.5% self + `effectiveOutcome` 16.9%** — the whole-log scan at `driver.ts:3665` (`log.ts:95` its loop) — `settle` 8.0% (its inlined `advance`); `takeAttempts`, `leaveStep` and `enter` do NOT grow on this road (`enter` 1.6%, `heardRunning` 1.6%). **Under an INLINE pool** (`task.running` fired inside `addTask`, `w195/prof-inline`, 32,000 items): **`takeAttempts` 14.3%, all of it `attemptsPending.shift()`** (`:1873`) — n elements queued in ONE step for a map, each `shift` moving the rest |
| 3 | every read of `this.log` and every `effectiveOutcome`/`isSuspended` call in `src/driver/` | `advance` (`:3665`), `parked` (`:4860`), `hasParked` (`:4870`, once per DISPATCHED task — O(dispatched × log) a call), `effectiveOutcomeOf` (`:5646`), `outputs()` (`:4372-4427`), **and one P39 did not list: `inFlight` (`:2540`)**, a set built from the whole log at every run-control call and at every `resumed` element a replay feeds; `append` (`:5194`) and `snapshot()` (`:5526`) read it whole by nature. `log.ts` has no other caller in `src/driver/` |
| 4 | is `this.log` still needed once the view exists | **YES — the view ADDS a field**: `snapshot()` reads the whole log in order, `outputs()`'s catch-up indexes it, and `examples/run-flow.ts`' retention alias check reads `Driver.log` (outside this item's Owns). Kept; DRIVER_FIELDS gains `taskLog` |
| 5 | `spec/outcome-record.md` sections 6-7 and `RN-R13` | `outcome-record.md` names no scan and no cost — NOT moved. `RN-R13` names `log` and `outputsCache` as holders: its text moves (the view joins every holder set) |
| 6 | the ladder counts — `npm run gate` on `7b47f78`, EXIT 0 | L1-L5 **85 files / 2,111 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,111); L6 **2,789 assertions / 0 failed** in node and deno; `check:docs` 50 `run` snippets; `check:spec` C4 45 (scratchpad `w195/gate-base.log`) |

## Verification

`npm run gate` before the readers; then the two readers; then `npm run gate:item` once, on the final tree. **Routing
coverage**: a branch routed away from its join (Q4) and a nested fan-out (Q6) — the corpus flows (`p1-routed-away`,
`nested-fanout`), their per-task reads and their fold inputs byte-identical; `user_action` (Q17) — the settlement-then-
resolution case through the view, a sub-log of two, and its mid-list placement in `outputs()`; no matching decision edge
(Q10) — `advance`'s read is the same view, every corpus flow; a duplicate task id (Q13) — not applicable, the view is keyed
by the id `ID-R1` already guarantees unique.

## Record

*Filled 2026-10-21, after both readers and the confirming gate; the stop-and-ask below answered (a) by the maintainer the
same day, and the gate re-run after it.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0** | L1-L5 86 files / 2,119 cases in node 24.20.0, deno 2.9.6 and chromium (parity); L6 2,789 / 0 failed in node and deno; `check:docs` 50 `run` |
| L2 the per-task reads, `outputs()`, a resume, the view's records, the queues, the count | RAN — green | `test/driver/log-view.test.ts`, 10 cases after the readers (7 before); `retention.test.ts`'s holder sets and identity; no other suite's expected value moved |
| conformity reader | RAN | C1-C10, no BLOCKER; its own differential (2,415 seeded transcripts, payloads included) byte-identical to `7b47f78` |
| adequacy reader | RAN | 79 probes; 6 real gaps (G1-G6), 4 NITs; every gap closed and re-cut below |
| the author's probes | RAN, three times | **after the readers (`C:/tmp-w195/mut3.log`): 29 probes + 3 grader controls — 29 KILLED, 0 SURVIVED**, controls CLEAN / CRASH / WRONG-REASON, digests equal |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w195/gateitem.log`) | lint; typecheck; every check, `check:docs` 50 `run`, `check:spec` C4 45; L1-L5 **86 files / 2,122 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,122); L6 **2,789 / 0 failed** in node and deno; selftests 10/10 ok (1,014.2 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and Status — `check:register`, `check:markdown`, `check:spec`, `check:budget` and `check:wiring` re-run on them, EXIT 0 — and ONE comment line in `driver.ts` (`TaskLog`'s *no public surface reaches it*, withdrawn by C7 and found by the rule-5 grep), `lint`, `check:source` and the suite re-run, EXIT 0 |
| **`npm run gate:item` re-run** after the stop-and-ask's answer (the `flow-definition.md` note), on the final tree held still | RAN — **EXIT 0**, one command (`C:/tmp-w195/gateitem2.log`) | L1-L5 **86 files / 2,122 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,122); L6 **2,789 / 0 failed** in node and deno; `check:docs` 50 `run`; selftests 10/10 ok (978.4 s wall), `check:register:selftest` left out. Written after it: this row and Status — `check:register`, `check:markdown` re-run |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0121 | yes | `check:spec` C5 (the spec links it); `check:register` |
| (2) the view and its readers | yes | Q01-Q10, Q29: the per-task case, the resume case, the source observer |
| (3) `outputs()` caught up | yes | Q11-Q17, Q31; the count's `needs` arm (Q12: 15.8x restored) |
| (4) the `attempted` road — `Fifo` | yes | Q19-Q22, Q30: the queue case, the throw case, the pause/answer suites |
| (5) the count, `taskLog.visits`; `DRIVER_FIELDS` | yes | Q23, Q24, Q27, Q28 (exact counts, ratio, a second fresh run); the retention ratchet and L6 `cross-row` |
| (6) `RN-R13`, README row, AGENTS.md, the `fold-inputs` pointer | yes | `check:spec` C8; `check:docs` |

**The numbers** (each size a fresh process; the session scratchpad's `w195/drv.ts`, the queue walked by index):

| items | driver before, node | after, node | before, deno | after, deno |
|---|---|---|---|---|
| 4,000 | 106 ms (108 with `task.running`) | 71 (75) | 121 (123) | 83 (88) |
| 8,000 | 324 (338) | 131 (143) | 399 (437) | 154 (161) |
| 16,000 | 999 (1,037) | 229 (248) | 1,363 (1,230) | 283 (299) |
| 32,000 | 10,015 (9,066); inline pool 8,894 | 465 (507); inline 482 | — | — |

Counted work: 501 / 2,001 visits plain and 1,502 / 6,002 with a `needs` per settlement, at 500 / 2,000 items — 3.99x and
4.00x, exactly as ADR 0121 rule 7 derives. The fold inputs, snapshots and resumes byte-identical to `7b47f78` over 182 runs.

**Predictions.** P39 prediction 3 **HOLDS, and more**: the superlinearity is gone WITH `attempted` elements too — fact 4's
steeper right-hand column did not reproduce with the harness's queue walked by index, and the one `attempted`-road cause
found is the INLINE pool's queue (`shift`), fixed here. Prediction 5 holds for this item: no `FoldInput`, `RunState`,
`CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` or `snapshot()` change.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity | C1 SHOULD — `outputsCache` now ~88 B an entry, not ~25 | **FIXED** — `RN-R13`, ADR 0121 consequence 3, the driver's doc |
| conformity | C2 SHOULD — `spec/flow-definition.md:1546-1549` says the projection *adds zero fields* and is *computed on demand rather than maintained* | **FIXED** — a dated note, by the maintainer's YES to the stop-and-ask below (an Exception, in the declaration) |
| conformity | C3 NIT — ADR 0040's two other present-tense sentences | **FIXED** — dated notes (record step) |
| conformity | C4 SHOULD — `place()`'s *no reachable case* for a removal is false: a second settlement event is appended | **FIXED** — the comment, and a case driving a `done` then a `user_action` then its resolution (Q31 KILLED) |
| conformity | C5, C6, C8, C10 NIT — the drain counts, *five drains*, *a fourth holder*, *every task id* | **FIXED** |
| conformity | C7 NIT — *no public surface reaches it* | **FIXED** — *no public TYPE names it*, ADR 0121 rule 7 |
| conformity | C9 NIT — *the memo* in present tense | **FIXED** at the two code sites; older test-comment prose left as history |
| adequacy | G1 — case 1's per-input reads unguarded | **FIXED** — reads ≥ fold inputs, per run |
| adequacy | G2, G3 — the count's `needs` arm and what it counts unpinned (CP4: the scan back with every case green) | **FIXED** — EXACT counts (n + 1, 3n + 2, and 3 for a sub-log of two); Q27 KILLED |
| adequacy | G4 — *never module state* untested | **FIXED** — two fresh runs count the same; Q28 KILLED |
| adequacy | G5 — `inFlight`'s cost unobserved | **FIXED** — the source observer reads its body; Q29 KILLED |
| adequacy | G6 — a throw on an `attempted` element with others queued | **FIXED** — a case; Q30 KILLED |
| adequacy | N2 the long tail's loop guard; N3 the exact five-call count; N4 = C6 | **FIXED** (a floor of five, not an exact count) |
| adequacy | N1 — the identity check walks only `byTask` | **DECLARED** — a copy under an existing name is the holder walk's limit since W53; a copy in `byTask` is killed (Q03, Q26) |

**What this taught.** *For the retro*: a count is an instrument only once its EXACT value on a small run is derived and
asserted — a ratio and a floor both passed a counter that counted calls instead of records, and that counter with the scan
restored left all 2,119 cases green (the adequacy reader's CP4). And a comment's *no reachable case* is a claim like any
other: the removal it called unreachable was one repeated event away.

**Questions raised.** None (Q725-Q729 SPENT, unissued). **Closed.** None.
**Record step**: ADR 0121 written; ADR 0040 rule 2 amended and two of its sentences dated. The plan's Record is the last
item's (P38's precedent). (f) is W196's and is not recorded here.

**The readers' overlap.** **TWO** — the removal branch in `outputs()` (the conformity reader's C4 found it reachable; the
adequacy reader's X1 measured it unreached by the suite — one subject, two halves) and the case title's *five drains*
(C6 / N4).

### Stop-and-ask — ANSWERED (a), YES, by the maintainer 2026-10-21

`spec/flow-definition.md:1546-1549` (FD-C1's prose) reads *"the projection adds **zero** fields, and it is computed on
demand rather than maintained, so a second source cannot disagree with the log"* — false since W41 added `outputsCache`,
and falser now it is caught up from a maintained view. The file is outside this item's `Owns`.
(a) **YES — widen `Owns` by that one sentence**: a dated note naming `outputsCache` and ADR 0121, then `gate:item` re-run
and commit. *Recommended* (workflow section 1 rule 6: one simple decision). (b) NO — commit as is and raise Q725 for it.
**Answered (a)**: the note is written, the Exception declared, and `gate:item` re-run on the final tree (the gate table's
last row). Closed by the fix; no question raised.
