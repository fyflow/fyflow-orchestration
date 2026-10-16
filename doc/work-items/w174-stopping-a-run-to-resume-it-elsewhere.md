# W174 — stopping a run to resume it elsewhere: `driver.stop`, `RunHandle.stop`, the `interrupted` outcome, and a resume that takes it

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; both reader passes RAN — five DEFECTS (C1-C5, C5 a throwing callback leaving the stop half-done) FIXED, gaps C6-C8 and C12 closed, notes C9-C11 acted on; exceptions E1-E6 granted by the maintainer (S-1..S-6), and R2 RATIFIED by the maintainer 2026-10-16; no question raised — declared 2026-10-16 on `a707de0`; P34's SIXTH item: stop-and-ask (d), decisions 3 and 9, (h)'s `interrupted` row, (i) for a stop; ADR 0105; built under B′, `npm run gate` run before the readers; readers not yet run, `gate:item` not yet run
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its SIXTH item. **A run's OWNER stops it through ONE call
on the driver**, forwarded by the runtime's handle: `driver.stop({ actor, reason?, graceMs? })` / `RunHandle.stop()`
holds the run, goes DEAF, appends ONE `interrupted` fold input and only then asks the scheduler to cancel each task in
flight (decision 3), so no `task.cancelled` of the stop is appended and the log ends with the in-flight set dispatched
and unsettled; `resolve()` is refused from the call (decision 9); the fold reads a NINTH outcome, `interrupted`, terminal
for `done` and NOT refused by a resume, which feeds the element and re-dispatches the in-flight set at the same ids on a
FRESH runtime; a runtime's `done` settles once the stop's cancels have resolved (d); ranked as (h) says.

```
Spec:       spec/run-state.md v0.18 -> v0.19: section 14 and TWO rules — `RN-R32` (the fold: `interrupted`,
            `interruption`, (h)'s whole precedence) and `RN-R33` (the call: its refusals, its ORDER, taken at rest, the
            second call, the runtime's `done`, the resume elsewhere). Rules whose TEXT moves: `RN-R12`, `RN-R19` (a fourth
            fed kind), `RN-R22` (`resumed` ends a stop), `RN-R23` (a stored `interrupted` is not refused), `RN-R25` (the
            handle's `stop`), `RN-R29` (the stop is a halt; limit (i) and check (4) for it), `RN-R30` (its precedence
            pointer); section 2's shape (`interruption`), section 3's table and its count (NINE outcomes). One `FoldInput`
            kind (`interrupted`), one `RunState` cell (`interruption`), one `RunOutcome` (`interrupted`) — each BREAKING
            (P34 decision 10).
            spec/README.md: run-state's row, its outcome count and its version column.
Owns:       from P34's W174 row, exactly: src/driver/driver.ts, src/fold/run-state.ts, src/scheduler/runtime.ts,
            spec/run-state.md, spec/README.md, test/driver/**, test/fold/**, test/scheduler/**,
            test/definition/l4-corpus.test.ts, examples/l6.ts (DRIVER_FIELDS), examples/run-flow.ts, AGENTS.md (sections
            8, 11, 18), scripts/check-docs.mjs.
            Exceptions: E1-E6 — granted by the maintainer 2026-10-16 (YES to S-1..S-6, after the readers' round; see the
            stop-and-asks below), each applied minimally, nothing else changed there:
            E1 (S-1) AGENTS.md section 6 — `:1086` the ninth `Record<RunOutcome, …>` key, `interrupted`; `:1106` the
            cancel's refusal list gains `interrupted`;
            E2 (S-2) AGENTS.md section 9's refusal table (`:1612`) — the cancel row gains `interrupted`, and ONE new row for
            `driver.stop` / `handle.stop`;
            E3 (S-3) AGENTS.md section 12 (`:2407`) — `SchedulerLike.cancel` read by `driver.cancel` AND `driver.stop`;
            E4 (S-4) CLAUDE.md `:261-262` — `src/` calls `cancel` from `driver.cancel` and `driver.stop`; ADR 0105 named;
            E5 (S-5) src/definition/types.ts `:757`, `:790` — *STOPS* -> *HALTS* (and `:790`'s *a throw stops it* -> *halts*);
            E6 (S-6) spec/join-policy.md v0.21 -> v0.22 — `JP-R12`'s run-level release names a STOP as a fourth road, and
            its status line; spec/README.md's join-policy row and version column.
            Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/** (ADR 0105 new; ADR 0058 rule 3,
            ADR 0091 rule 3, ADR 0103's hazard consequence — pointers), doc/questions/** (Q651-Q654 if raised), the plan's
            Record, README.md, this file.
Inputs:     P34 decisions 3, 5, 9, 10 and 11, facts 3, 4, 5, 6, 8 and 9, stop-and-asks (b), (c), (d), (e), (g), (h), (i),
            prediction 6, sentences B′, C, D′ and E; ADR 0104 (the cancel this mirrors, `stepping`, `handOn`,
            `holdsResume()`); ADR 0103 (the hold, and its inherited hazard); ADR 0091; ADR 0065; ADR 0058.
Outputs:    (1) src: `Driver.stop()`, `RunStopOptions`, `RunControlRefused.control` `'stop'` and reason `'interrupted'`
                (a cancel after a stop); the `stopRequest` field (pending while a mid-step call waits for its step to end,
                taken at rest), `leaveStep()` taking it, `shut()` joined by a TAKEN stop, `resolve()` refused from the call;
                `isFed` + the replay feeding and holding at a stored `interrupted`, and `resumed` (fed and live) ending it;
                the fold's `interrupted` arm, `interruption` cell and outcome, `resumed` ending it; `RunHandle.stop()` and
                the runtime's `done` waiting on the stop's cancels through the per-run view.
            (2) spec run-state v0.19, spec/README.md's row.
            (3) ADR 0105.
            (4) AGENTS.md sections 8 (the nine outcomes, the precedence snippet), 11 (the row BUILT), 18 (a new
                subsection and ONE new `run` snippet), so `RUN_FLOOR` 38 -> 39.
            (5) tests: test/fold/interrupted.test.ts (L1/L3, new suite), test/driver/stop.test.ts (L2, new suite),
                test/scheduler/runtime.test.ts (a new suite, two cases), test/driver/retention.test.ts (the stop's release
                twin), test/driver/checkpoint.test.ts (`RUN_FOR.interrupted`, kinds 11 -> 12), l4-corpus's
                `LATE_SUITES` (+3) and a count case, `DRIVER_FIELDS` in test/driver/retention.test.ts and examples/l6.ts,
                the two `RunState` literals in test/fold/fold-rules.test.ts and one in test/fold/cancelling.test.ts.
Depends on: W173 (done, a707de0)
Blocks:     W175
Tests:      L1 — test/fold/interrupted.test.ts, `RN-R32` over hand-written sequences: the element over a running and a
            parked task; `resumed` ending it (`awaiting_action`, `running`, then `completed`); a second element; (h)
            against `halted` and `RN-R28`'s cancel in both orders, and a cancel request after it; over a waiting join and after an
            `end`; `isTerminal`; L3 folded twice. L2 — test/driver/stop.test.ts, `RN-R33` over a fake whose `cancel` plays
            P34 fact 8's roads and runs a hook at its START: THE ORDER (element in place, deaf, `resolve()` refused at the
            first cancel; no `task.cancelled` appended; the in-flight set unsettled; the control a cancel, which appends
            them); every refusal; the second call; a parked run, resumed and resolved THERE; RN-R29 (i); a mid-step stop
            whose checkpoint resumes the successor; the resume of the stopped checkpoint re-dispatching EXACTLY the
            in-flight set at the same ids, stopped and resumed again; a stop on `resumed`; a stop in a resume's lost
            tail; a settlement provoked on the element's callback not heard — and, after the readers, deafness observed inside the FIRST cancel, a callback THROWING on the element (at rest and mid-step), the three R9 steps (the run ENDED, HALTED, RN-R28-CANCELLED in the step), a second call while PENDING, and `cancelled` before `ended` (C12). L1 through `createRuntime` — two runs on one
            runtime: `done` PENDING until the last cancel resolves, then `interrupted`, released, the sibling untouched
            and completing, the checkpoint resumed on a FRESH runtime to `completed` and refused `RunIdInUse` on the
            first; the same through `handle.driver.stop()`; a parked run's `done` settling with `resolve()` refused.
            Expected values from spec v0.19 and the flows' own shape — never from the implementation's output. Each
            clause shown able to fail by a ONE-clause mutation (sentence E) in the byte copy C:/tmp-w174/m.
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree; and B′'s `check:docs:selftest` (an
            executed snippet added). The row's clause: L2 the ORDER — deaf before the first `cancel`, no `task.cancelled`
            of a stop appended, the in-flight set unsettled; a parked run stopped with `resolve()` refused; L2 a resume of
            the stopped checkpoint re-dispatching exactly the in-flight set at the same ids; L1 `done` settling after the
            stop's cancels resolve, with a sibling run on the same runtime untouched.
Reserves:   Q651-Q654 (P34's per-item line); ADR 0105 (P34 decision 11)
```

## Scope

**In** — Outputs (1)-(5).

**Out** — named rather than left implicit, with where it goes instead

- **Pausing a run** — W175, ADR 0106. Designed for here (ADR 0105's last consequence): a stop of a paused run cancels
  only what `handedOn` says the scheduler holds, the held tasks stay in flight, and a resume FEEDS `paused` as it feeds
  `interrupted` — so a stopped paused run resumes paused. Not built.
- **The L6 rows** (a run stopped on real workers beside a sibling, resumed on a fresh runtime; a parked run stopped) —
  W176. A real-scheduler probe was run here (M5), not checked in.
- **Attempts spent by a stop** — P36.
- **Tasks a worker spawned** — Out by P34 (j), as for a cancel.
- Nothing else out of `Owns` — the six sites S-1..S-6 are E1-E6.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w174/m`, each graded on the named suites' `FAIL` lines; then the readers; then `npm run gate:item`
once. Routing coverage: a nested fan-out (Q6) — not exercised (the stop adds no route); `user_action` (Q17) — the parked
task a stop sends nothing for, whose `resolve()` is refused on the stopping driver and accepted on the resumed one; a
branch routed away from its join (Q4) — not applicable; no matching decision edge (Q10) — not applicable; a duplicate
task id (Q13) — the resume re-dispatches at the SAME ids, which `ID-R1` would refuse on the same driver and does not on a
fresh one (asserted by the resume cases).

## What the declaration step measured

*Measured 2026-10-16 in a BYTE COPY of `a707de0` (`git archive` into `C:/tmp-w174/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 149 files; `check:spec` 7 / 75 / 138 rules; `check:docs` 38 `run` snippets; L1-L5 **65 files / 1826 cases** in node, deno and chromium; L6 **2664 / 176** in node and deno |
| M2 | **B′ / D′ — the census sites this change moves**, each found by its own lane going red by name | `DRIVER_FIELDS` (`test/driver/retention.test.ts`, `examples/l6.ts`) +`stopRequest`; `test/driver/checkpoint.test.ts`'s `RUN_FOR` (L0 red) and its kind count 11 -> 12; `test/fold/fold-rules.test.ts`'s two `RunState` literals and `test/fold/cancelling.test.ts`'s one (L0 red, the new cell); `l4-corpus`'s `LATE_SUITES` +3 suites (red by name) and a count case; `RUN_FLOOR` 38 -> 39; `spec/README.md`'s row; `check:spec`'s rule count 138 -> 140 (derived, written nowhere). **NOT moved**: `examples/run-flow.ts`'s `NOT_RUN_STATE` (the field is run state, walked); `examples/README.md`'s `X10` (no L6 change) |
| M3 | **P34 prediction 6** — *W174 changes no line of `resume()`'s re-dispatch* | **HOLDS for the loop**: the re-dispatch loop (`holdsResume()`, `handOn`) is unchanged. Two lines BEFORE it move — the replay's fed stop is cleared before `resumed` — and the fed kinds gain `interrupted` |
| M4 | **the tree's now-false statements**, grepped for *eight outcomes*, *an eighth*, *nothing yet*, *W174*, *stopping a run*, *driver.cancel alone*, *only from `driver.cancel`*, *STOPS the run*, *resumable stop*, *isTerminal … cancelling* over everything but `dev-dist/`, `dist/` and `node_modules` | in `Owns` — rewritten: `src/driver/driver.ts` (the refusal table, `SchedulerLike.cancel`'s doc, `deaf`, `shut()`, `holdsResume()`, `handOn`, `dispatch`'s hazard comment, `resumeRefusal`'s comment), `src/fold/run-state.ts`, `src/scheduler/runtime.ts` (`RunHandle.done`, `inUse`), `test/scheduler/runtime.test.ts:1803`, `AGENTS.md` sections 8, 11, 18; **OUT of `Owns`**: S-1..S-6. History (plans, finished items, decided ADRs) is true of its version and stays; the ADR pointers are the record step's |
| M5 | **a real-scheduler probe** through `createRuntime` (`C:/tmp-w174/probe.ts`, not checked in): a two-task fan-out stopped on runtime A beside a running sibling, its checkpoint resumed on a fresh runtime B — node 24.20.0 and deno 2.9.6, inline and threaded | all four: `done` `interrupted` (5-129 ms after the call), the log ending `dispatched a, dispatched b, interrupted` with every `task.cancelled` fired and none appended, the sibling `completed`, `A.resume` refused `RunIdInUse`, B `completed` with `resumes` the two ids and B's fold equal to its `done` |

## The author's provocations (before the readers)

`C:/tmp-w174/mutate.mjs` in the byte copy `C:/tmp-w174/m`, synced with the real tree; each ONE clause (sentence E) but
D3 and D5, each one statement MOVED and declared compound; graded on the `FAIL` lines of the `driver/stop`,
`fold/interrupted`, `scheduler/runtime`, `driver/retention`, `driver/checkpoint`, `driver/resume`, `driver/cancel` and
`driver/hold` suites; every file restored, digest equal; CONTROL clean. **52 probes: 47 KILLED, 5 SURVIVED — D10, D30,
D36 and R3 declared EQUIVALENT before the run, and D1 found equivalent by it.**

| id | the clause broken | verdict |
|---|---|---|
| F1-F9 | the fold: a second element overwrites; `resumed` not ending the stop; `resumed` not recomputing; `interrupted` below `awaiting_action`, above `cancelling`, above `RN-R28`, below `running`; the reason dropped; `isTerminal` calling it unfinished | KILLED, each |
| D2 / D19 | **R1's alternative, twice**: the hold taken while the stop is PENDING (`shut()`), and the stop taken at once mid-step | KILLED (5 cases each) — the dropped routing measured: b never entered, y never dispatched, the lost tail's y never handed |
| D3 / D4 | deaf AFTER the cancels (compound) / never deaf | KILLED — the waiting and backoff roads' `task.cancelled` appended |
| D5 | **R2's alternative**: deaf after the element (compound) | KILLED — by the *deaf with the hold* case alone |
| D6-D9, D11 | no element; reason not defaulted; no cancels; collections not released; `took` not dropped | KILLED, each (D9, D11 by the retention twin) |
| D12 / D13 | `resolve()` not refused while PENDING / a cancel after a stop not refused | KILLED |
| D14-D18, D20-D25 | each refusal and `graceMs` clause removed; `ended` refused mid-step; `ended` ignoring a parked task | KILLED, each |
| D26-D29 | the second call: the first road; its `graceMs` ignored; re-sending stopped tasks / the promise not waiting | KILLED, each |
| D31-D35, D37, D38 | a pending stop never taken; the replay's stop not cleared, or a pending one cleared; a fed `resumed` not ending it; `interrupted` not fed; refused by a resume; the stop's options not read | KILLED, each |
| R1, R2, R4, R5 | `done` not waiting; a cancel not tracked; `RunHandle.stop` a no-op; the release not deferred | KILLED, each |
| **D1** | `shut()` without a TAKEN stop | **SURVIVED — EQUIVALENT**: once taken the driver is deaf (no settlement reaches a door) and `resolve()` refuses on `stopRequest` itself, so no door `shut()` guards is reachable for a stopped driver. Kept, as ADR 0103's consequence directs, as the stopped run's faithful state |
| D10 / D30 / R3 / D36 | the `handedOn` filter at rest; the microtask before the promise; a settled view-promise not dropped; the replay not holding at a fed stop | **SURVIVED — EQUIVALENT, declared**: nothing is unhanded at rest; every cancel is sent before the promise is read; a settled promise resolves at once; under R2 nothing the driver writes follows the element before a `resumed` |

## Readings the plan did not settle — taken here, each stated in `RN-R32`/`RN-R33` and ADR 0105, for the readers

| | the reading | why |
|---|---|---|
| R1 | **A stop called MID-STEP is ACCEPTED and TAKEN when the driver's step ends** (`stepping` back to `0`, `leaveStep()`): its hold, deafness, element and cancels at rest; `resolve()` and `cancel()` refused from the call | a hold taken mid-step drops the rest of that step's routing, and a resume re-dispatches only what is IN FLIGHT — so a fan-out's later branch, or a settlement's successor, would be lost to the resumed run for good (D2/D19 below measure it). The cancel keeps its immediate hold: its run never resumes |
| R2 | **DEAF with the hold, BEFORE the element** — (d) lists *append; set deaf*. **RATIFIED by the maintainer 2026-10-16** (*"Yes from my side"*), and recorded so in ADR 0105 | a settlement a consumer's callback on the element provokes would be appended after the stop, routed nowhere (held), and never routed by the resume (it is settled, so not in flight): that task's routing lost. Deaf first, it stays in flight and runs again. *Deaf before the first cancel*, decision 3's point, holds either way |
| R3 | **The runtime's `done` waits on the cancels the driver sent THROUGH ITS PER-RUN VIEW** — (d) says *awaits the promise `driver.stop` returns* | the same promises; observed at the view, `handle.driver.stop()` — a road that never passes through the handle — settles `done` too, with no new driver surface |
| R4 | **`RunState.interruption` is CURRENT** (`null` again after `resumed`), not cumulative | `RN-R6`'s `suspended` precedent; the history is in the input sequence, and the outcome needs only the current stop |
| R5 | **The refusals**: `unsupported`, `not-started`, `halted`, `cancelled` (`RN-R28`'s AND a requested cancel — (c) *after a cancel, a stop is refused*), `ended` at rest; a cancel after a stop refused with a NEW reason `interrupted` | (c) names both refusals; the reason names are W173's table widened as its own comment said W174 would |
| R6 | **A SECOND stop** forwards its `graceMs` to each task STILL stopping (by its pending promise — the log cannot say, the driver being deaf) and appends nothing | the cancel's road (c); (d) is silent |
| R7 | **The RN-R29 (i) task and a resumed run's in-flight set are handed on, then cancelled** — by WHEN the stop is taken, not by `handOn` | ADR 0103's hazard: *cancel the in-progress task AFTER its hand-off*; taken at rest, every such task has been handed |
| R8 | **The replay holds from a fed `interrupted` until a fed `resumed`**, and the stop's deafness, cancels and release are not replayed | the stored run was held there; with R2 nothing the driver writes can follow the element before a `resumed`, so this is the faithful state and defensive (A25 below) |
| R9 | **A stop accepted mid-step is taken even if the rest of the step halted or ended the run** | the precedence then reads `halted`/`cancelled` (not resumable) or the resume reaches `completed`; nothing is half-recorded |
| R10 | **`RunHandle.stop(options)`**, and no `runtime.stop(runId)` | (d) names `RunHandle.stop()`; its alternatives column rejects the runtime road |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-16: YES to all six (exceptions E1-E6)

| | the question | recommended | the alternatives |
|---|---|---|---|
| **S-1** | **`AGENTS.md` section 6** — `:1086` *"A `Record<RunOutcome, …>` needs a seventh key — and since 0.8.0 an eighth, `cancelling`"* is now short by `interrupted`; and `:1106`'s cancel refusal list lacks the new `interrupted` reason (a cancel after a stop) | **YES — two clauses**: *"… an eighth, `cancelling`, below, and a ninth, `interrupted` (section 18)"*; and *"… `ended` …, and `interrupted` (the run was STOPPED — cancel it where it resumes)"* | **Leave both**: the count is a reference a consumer types a `Record` from |
| **S-2** | **`AGENTS.md` section 9's refusal table** (`:1612` — the declaration said `:1600`; the maintainer corrected it) names the cancel's five reasons and has no row for a stop | **YES — the cancel row gains `interrupted`, and ONE new row**: *"`driver.stop(options)` / `handle.stop(options)` the driver will not make — `RunControlRefused`, `control: 'stop'`, `reason` `unsupported`, `not-started`, `halted`, `cancelled` or `ended`; nothing recorded or sent (`RN-R33`, ADR 0105, section 18)"*. The census snippet needs nothing (no new class) | **Leave it**: section 18's table states them |
| **S-3** | **`AGENTS.md` section 12** (`:2407`) — `SchedulerLike.cancel` *"is read by `driver.cancel` alone"* — now false | **YES — one clause**: *"read by `driver.cancel` and `driver.stop` (sections 6 and 18) … and either over it is refused `unsupported`"* | **Leave it for W175** (whose row does not own section 12) |
| **S-4** | **`CLAUDE.md` `:261`** — *"`src/` calls `cancel` only from `driver.cancel`"* — now false | **YES — the maintainer's file; one clause**: *"only from `driver.cancel` and `driver.stop` (ADR 0104, ADR 0105)"* | **Leave it** — a guidance file stating a false fact about `src/` |
| **S-5** | **`src/definition/types.ts:757` and `:790`** — a gate route not declared *"STOPS the run"* means today's HALT (W171's hand-off), now ambiguous with the resumable stop | **YES — two words**: *"HALTS the run"* in both comments | **Leave them**: `stops` in lowercase prose is used for the halt across ~40 historical sites; only these two are on the public types a consumer reads |
| **S-6** | **`spec/join-policy.md` `JP-R12`** enumerates the run-level release's roads — `OR-R10`, v0.20's cancel and v0.21's requested cancel — and a stop is a fourth (`RN-R33` step 2) | **YES — one clause and a version row**: *"— and, since v0.22, a STOP its owner requests (`RN-R33`), when it is taken"*; `join-policy.md` v0.21 -> v0.22 and `spec/README.md`'s version column | **No release on a stop**: the stopped driver keeps every collection until it is dropped — nothing false, but a held handle retains them, against ADR 0046 rule 3's run-level moment |

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=1`, then `GATE EXIT=0`** | first run: L6 under deno only, two rows (`uncloneable / OR-R6, threaded`, and `perShard`'s cross-row ordering); no L6 row stops a run, `test:l6:deno` alone straight after was 2664 / 0 failed — read as a timing flake, seen once. Re-run on the tree held still: **EXIT 0** — `lint` 151 files, `check:spec` 7 / 75 / 140 rules, `check:docs` 39 `run` snippets, L1-L5 **67 files / 1849 cases** in node 24.20.0, deno 2.9.6 and chromium, L6 **2664 / 176**, 0 failed, in node and deno |
| B′ — `check:docs:selftest` (an executed snippet added) | **RAN, EXIT 0** | 24/24 noticed, before the readers; and inside `gate:item` below |
| L1 — `RN-R32` | **RAN** | `test/fold/interrupted.test.ts`, eight cases; F1-F9 |
| L2 — the ORDER, the parked run, the resume of the stopped checkpoint at the same ids | **RAN** | `test/driver/stop.test.ts`, sixteen cases after the readers; D1-D43 |
| L1 — `done` after the stop's cancels resolve, a sibling untouched | **RAN** | `test/scheduler/runtime.test.ts`, W174's suite, two cases; R1-R5 |
| L3 — folded twice | **RAN** | the fold suite's L3 case and the ORDER case |
| real-scheduler probe | **RAN, not checked in** | M5: node and deno, inline and threaded |
| conformity reader | **RAN** | five DEFECTS (1-5), three GAPS (6-8), three NOTES (9-11) — all acted on below |
| adequacy reader | **RAN** | 66 one-clause probes, 56 killed, 6 equivalent (B8 = D1, E5, E8 = D30, G4 = D36, H4, R7); real gaps B4/B5/B6 (= conformity 7) and C12 — acted on below |
| author's provocations, re-run after the readers' items | **RAN** | `C:/tmp-w174/mutate2.mjs` in the byte copy re-synced with the final tree: CONTROL clean; **57 one-clause probes, 50 KILLED, 7 SURVIVED — each argued equivalent** (table below); every file restored, digest equal |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items and E1-E6 (this Record written before it, but for this row and the Status line): the ladder — `lint` 151 files, `check:spec` 7 / 75 / 140 rules, `check:docs` 39 `run` snippets, L1-L5 **67 files / 1854 cases** in node 24.20.0, deno 2.9.6 and chromium (1826 at M1: +8 `interrupted`, +16 `stop`, +2 runtime, +1 retention twin, +1 l4-corpus count), L6 **2664 / 176**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 894.2 s wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation table, after the readers** — the table above (*before the readers*) re-run, its takeStop rows
re-anchored on the `finally`, and five new rows:

| id | the clause broken | verdict, killed by |
|---|---|---|
| D39 | finding 5: the cancels NOT in a `finally` | KILLED — the throwing-callback case |
| D40 | finding 5: the in-flight set read after the element, inside the `finally` | **SURVIVED — EQUIVALENT**: deaf and held, nothing a callback on the element does can settle or dispatch a task |
| D41 | finding 5: `taken()` outside the `finally` | KILLED — the throwing-callback case (mid-step, the first promise hangs) |
| D42 | finding 10: a fed element's missing `reason` not normalised | KILLED — the parked-run case's store without a `reason` |
| D43 | item 8: a second call while PENDING resolves without waiting on `took` | **SURVIVED — EQUIVALENT**: a step is synchronous, so the microtask `stopSettled` reads its promises at always comes after `leaveStep()` has taken the stop and sent its cancels |
| D1, D10, D30, D36, R3 | as before the readers | **SURVIVED — EQUIVALENT**, unchanged; D1 = the adequacy reader's B8, D30 = E8, D36 = G4 |
| every other row | as before the readers | KILLED, each (D3-D8 re-anchored) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| **C1** (DEFECT) | `RN-R29` said a stop holds *likewise* from the call, its headline *at rest or on the stack* | **fixed**: the headline names the stop as the one halt on the run only once TAKEN; its clause says a mid-step stop holds when the step ends, and only `resolve()`/`cancel()` are refused from the call |
| **C2** (DEFECT) | `FoldInput` `interrupted`'s doc: *before the driver goes deaf* | **fixed**: after the hold and the driver going deaf, before any cancel |
| **C3** (DEFECT) | `RunHandle.stop`'s doc: element then deaf | **fixed**: held and deaf, then the element |
| **C4** (DEFECT) | `RN-R26`: *the three kinds `RN-R19` FEEDS* | **fixed**: three until v0.19, four since |
| **C5** (DEFECT, constructible) | a consumer `onFoldInput` THROWING on the element: no cancel sent, `took` never resolved, `done` settling while workers ran | **fixed**: `takeStop` reads the in-flight set before the element and sends the cancels and resolves `took` in a `finally`; the throw reaches the caller. `RN-R33` and ADR 0105 decision 2 say so; L2 case at rest and mid-step; D39, D41. *Not added: a runtime case* — the runtime's `done` reads the same cancels at the view, and the driver half is what was broken. **W173's cancel has the same shape** (`cancel()` appends, then loops; a throw on `cancelRequested` sends nothing) but a DIFFERENT code path, and its second call recovers (it re-sends to every handed task in flight) — NOT widened here; for P34's retro |
| **C6** (GAP) | deafness observed only at the 2nd/4th cancel | **case extended**: inside the FIRST cancel (a, running road) a settlement is provoked and asserted not heard |
| **C7** = adequacy B4/B5/B6 (GAP) | R9 untested | **three cases**: the step ENDS the run (element last, `interrupted`), HALTS it (`halted`), RN-R28-CANCELS it (`cancelled`); named in `RN-R33`'s Test clause |
| **C8** (GAP) | a second stop while the first is PENDING | **case added**: nothing sent while pending, its `graceMs` used by the cancels, one element, both resolve on the stop; D43 |
| **C9** (NOTE) | a pending stop whose step halts or cancels the run: `done` settles at once | **stated, not changed** — `RN-R33` and ADR 0105 decision 8: only `interrupted` waits; `done` reports the outcome, and a halted or cancelled run's tasks may run on unheard by construction (`RN-R12`) |
| **C10** (NOTE) | `feedInterrupted` copies `reason` unnormalised | **fixed**: `?? null`; asserted; D42 |
| **C11** (record step) | pointers | ADR 0058 rule 3, ADR 0091 rule 3, ADR 0103 rule 1 (the stop the one halt not shut mid-step) and its hazard consequence (W174 did, by WHEN the stop is taken) |
| adequacy **C12** | `cancelled` and `ended` both true for a run RN-R28 ended with nothing in flight | **stated** in `RN-R33` (`cancelled` checked first) and **asserted** in the refusals case |
| adequacy, wording | *a cancel request, in both orders* | **corrected** in `Tests:` — the request is folded after the stop only |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) src — `Driver.stop`, `RunStopOptions`, the refusals, `stopRequest`/`leaveStep`/`takeStop`, the replay's fed stop, the fold's arm, cell and outcome, `RunHandle.stop` and the runtime's wait | yes | F1-F9, D1-D43, R1-R5 |
| (2) spec run-state v0.19, spec/README.md | yes | `check:spec` C2/C6 (two new rules), C8 (version columns); the prose by no test |
| (3) ADR 0105 | yes | `check:markdown`'s links from the spec and the code; `check:register` |
| (4) AGENTS.md sections 8, 11, 18 (and E1-E3) | yes | `check:docs` X4 runs section 18's new snippet and section 8's nine-outcome snippet; `RUN_FLOOR` 39 |
| (5) tests | yes | the tables above; l4-corpus's counts of 16 and 8; the census rows; `DRIVER_FIELDS` in both lists |

**Exceptions** E1-E6 — the maintainer's YES to S-1..S-6, 2026-10-16, each applied minimally (the `Owns` block names
each site). **And R2 — deaf with the hold, before the element, reversing the order P34 (d) lists — RATIFIED by the
maintainer 2026-10-16** (*"Yes from my side"*), recorded in ADR 0105's status line and decision 2. R1 needed none.
**Owns, checked by hand** (`git status --porcelain` against that block): every file changed is in P34's W174 row, one of
E1-E6, or a record-step file (`doc/decisions/**`, this file). Every changed file LF, no carriage return.

**Record-step files**: ADR 0105 (new); pointers in ADR 0058 rule 3, ADR 0091 rule 3, ADR 0103 rule 1 and its hazard
consequence; this file. The plan's Record is the join's. `README.md` not edited; `doc/questions/**` not edited.

**What broke.** At the ladder, only a deno L6 timing flake (no stop involved). The design broke twice at the AUTHOR's
desk and twice at the readers'. The plan's literal *hold at the call* would have dropped a mid-step stop's routing for
good (R1), and its *append, then deaf* would have lost a settlement provoked on the element (R2) — both found by
constructing the case, both measured as mutants (D2/D19, D5). The readers found that a consumer callback THROWING on the
element left the stop half-done — no cancels, a promise that never settled, `done` settling while workers ran (C5) — and
four spec/doc sentences still saying the pre-R1/R2 order (C1-C4).

**What this taught.**
- **A halt that is meant to be RESUMED cannot be taken mid-step** — the hold that suits a cancel or a refusal drops work a
  resume has no way to recover. *When* a control is taken is part of its contract; for P34's retro, and for W175's pause.
- **A step that calls consumer code between two of a control's side effects must finish the second in a `finally`**
  (C5) — and W173's cancel has the same shape, recovered only by its second call.
- **When the author changes a design mid-item, every sentence written under the old one is a now-false claim in his own
  diff** (C1-C4): the grep for withdrawn claims applies to the item's own new text, too.

**Questions raised.** None — Q651-Q654 unused, skipped. **Handed on**: W173's cancel and a throwing callback on
`cancelRequested` (C5's note) to P34's retro; the deno L6 flake (`uncloneable / OR-R6, threaded`; `perShard` ordering),
seen once, to P34's retro.
