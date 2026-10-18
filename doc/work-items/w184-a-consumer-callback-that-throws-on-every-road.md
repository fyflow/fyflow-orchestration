# W184 — a consumer callback that THROWS, on every road, before 0.8.0

**Status:** done 2026-10-18 — `npm run gate:item` on the final tree, one command (the Record); both readers RAN, C1 (BLOCKER) and every SHOULD and NIT FIXED in `Owns`; no stop-and-ask; no question raised; not committed. Earlier: READY-FOR-READERS 2026-10-18 (27 probes, all KILLED; `npm run gate` EXIT 0); declared 2026-10-18 on `b0d46a4` (P36 declared, `(a)`-`(q)` answered as recommended); P36's FIRST item: P35's retro (k), stop-and-asks (b) and (c), fact 11; no ADR (P36 decision 9: P35 (k)'s rule is a SPEC row, `OR-R10`'s precedent); not committed
**Plan:** [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) — *which run and attempt does a
task's activity belong to, without parsing its id, and what of a run survives a crash and a resume?* — its FIRST item
(decision 4), so every element a later item adds is born under the rule and its sweep. **One rule, three parts, on every
road** (P36's brief to W184): a consumer `onFoldInput` throw on any element the driver appends (i) is reported ONCE
through `onRunFailure` under the consumer's class; (ii) HALTS the run — `halted` after the element thrown on, nothing
further dispatched, routed or emitted; (iii) on a DRIVER CALL's step — `start`, `resume`, `resolve`, `cancel`, `stop`,
`pause`, `unpause` — also reaches the caller, and on a scheduler event's step does not. Today's control is fact 11's R1
(`start()`); R2, R4, R5-R9 and R11 are brought to it.

```
Spec:       spec/outcome-record.md v0.18 -> v0.19: `OR-R10` — the rule on EVERY road: a throw on a driver call's step,
            once the call is accepted, is reported once and HALTS the run, and reaches the caller (P35 (k)); the
            sentence *a DRIVER CALL's step … still throws to its caller* (the at-rest asymmetry) replaced.
            spec/run-state.md v0.23 -> v0.24: the throw clauses of `RN-R31` (cancel), `RN-R33` (stop), `RN-R35` (pause,
            unpause) and `RN-R37` (a resolution's element, `resume()`'s `resumed`), and `RN-R22`/`RN-R23` where a resume's
            `resumed` throw lands (P36 (c)); no rule id added (next free stays `RN-R39`).
            spec/README.md: both rows and their version columns.
Owns:       from P36's W184 row, exactly: src/driver/driver.ts, src/scheduler/runtime.ts (comments stating the rule),
            spec/outcome-record.md (`OR-R10`), spec/run-state.md (`RN-R31`, `RN-R33`, `RN-R35`, `RN-R37`, the resume
            rules), spec/README.md, test/driver/**, test/scheduler/runtime.test.ts, test/definition/l4-corpus.test.ts,
            AGENTS.md (the WHOLE file, D′), scripts/check-docs.mjs.
            Exceptions: none declared. Anything else found to need an edit is a STOP-AND-ASK (S-n), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q680-Q682 only if raised),
            doc/decisions/** (dated pointers only — ADR 0104 rule 2, ADR 0105 rule 4, ADR 0106 rule 5, ADR 0109 — if
            the readers agree they are now incomplete), the plan's Record, README.md, this file.
            Overlap with W185 (serial, P36's rows): src/driver/driver.ts, src/scheduler/runtime.ts, spec/run-state.md,
            spec/README.md, test/driver/**, test/definition/l4-corpus.test.ts, AGENTS.md, scripts/check-docs.mjs.
Inputs:     P36 decision 4, stop-and-asks (b) and (c) as answered, facts 11 and 12, prediction 1, the brief's six
            points, sentences B′, C, D′, E and the two brief sentences; P35's retro (k); W178's Record (its R2 and R3
            notes, S-1); W180's Notes; `OR-R10` v0.17, `RN-R23`, `RN-R29`, `RN-R31`, `RN-R33`, `RN-R35`, `RN-R37`.
Outputs:    (1) src/driver/driver.ts: ONE boundary per driver call — `haltOnce` (report once and halt unless already
                halted) at the point each call is ACCEPTED: `start` (unchanged but once), `resume` (its `resumed` element
                inside the hand-off's boundary), `resolve` (the resolution's elements inside it), `cancel` (around the
                record and its `finally`), `stop` and `pause`/`unpause` at rest (around the take), and `leaveCall` — the
                step's end of `start`, `resume` and `resolve`, where a mid-step pause, unpause, stop or answer is taken.
                No field, no export, no type moves.
            (2) src/scheduler/runtime.ts: `RunHandle.stop`'s and `Runtime.resume`'s `@throws`, stating the rule.
            (3) spec outcome-record v0.19, run-state v0.24, spec/README.md's two rows.
            (4) tests: test/driver/throwing-callback.test.ts (L2, NEW) — the SWEEP; the existing cases that asserted
                *thrown, not halted* moved (pause, stop, cancel, the ask suite, the runtime's W178 case); l4-corpus's
                census and count.
            (5) AGENTS.md: section 9's sentence and a BREAKING note, sections 6, 7, 8 and 18's throw rows — and whatever
                else a grep for each premise finds (D′); one `run` snippet in section 9 (RUN_FLOOR 43 -> 44).
Depends on: nothing (P36's first item; P35 done, `77cf810`)
Blocks:     W185
Tests:      L2, expected values hand-written from the rule and each flow's shape, never from output: the SWEEP —
            every driver call AT REST (`start` of an entry fan-out, `resume` of a quiescent checkpoint and of one cut
            mid-step, `resolve` of an ask and of a parked task, `cancel` of a running and of a paused run, `stop`,
            `pause`, `unpause`) and each control MID-STEP (a pause and an unpause on `resolve()`'s step, a stop, a cancel
            and an answer on `start()`'s, a pause on `resume()`'s `resumed`), plus the scheduler event's road (R10) as
            the rule's other half — × a callback throwing ONCE on EACH element that step appends, the step's element
            list HAND-WRITTEN and the non-throwing CONTROL held to it; per element: the throw at the caller (the lost
            tail: `ResumeRefused('halted')`; R10: nothing escaping), `onRunFailure` once under the consumer's class with
            its error as `cause`, `hasFailed()` and the fold `halted`, `halted` after the element, nothing dispatched,
            routed, emitted or handed on after it, and (b)'s side effects — a stop's and a cancel's cancels, an
            unpause's and a cancel's hand-off — equal to the control's; (c): a throw on `resumed` hands nothing on and
            its checkpoint is refused `halted`; brief point 5's double throw; a refused call halting nothing. RED on
            today's tree at fact 11's non-halting roads in node and deno, green after. One-clause mutations (sentence E)
            in the byte copy C:/tmp-w184/m, each graded on its suite's failure lines; a time-out is NO VERDICT.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. The row's clauses: L2 the SWEEP as Tests says, each road
            asserting the halt, the one report and the throw at the caller, (b)'s `finally` side effects made, a
            non-throwing control beside each; fact 11's R2, R4, R5-R9 and R11 RED on today's tree and green after.
Reserves:   Q680-Q682 (P36's per-item line); no ADR (P36 decision 9)
```

## Scope

**In** — Outputs (1)-(5).

**Out** — named rather than left implicit, with where it goes instead

- **`onHeader`, attempts, attribution** — W185, W186, W187.
- **The L6 row** — none is owed: P36's exit artifact names no throwing callback. A real-scheduler probe through
  `createRuntime` is run here in node 24 and deno, and not checked in.
- **A `Driver` field** — none is added (`DRIVER_FIELDS` in `test/driver/retention.test.ts` and `examples/l6.ts`, and
  `NOT_RUN_STATE`, do not move).
- **A throw from the SCHEDULER** inside a hand-off or a cancel — not a consumer callback; reached by the same boundary
  where it already was (`drainHeld`, `start`, `resume`), and newly by `cancel()`'s (reading R3).

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w184/m`, each graded on the named suites' `FAIL` lines; then the readers; then `npm run gate:item`
once. Routing coverage: a nested fan-out (Q6), no matching decision edge (Q10), a duplicate task id (Q13) — not
applicable (no routing rule moves); a branch routed away from its join (Q4) — not exercised; `user_action` (Q17) — a
parked task's resolution is a swept road (R4, R5, the mid-step unpause).

## What the declaration step measured

*Measured 2026-10-18 in a BYTE COPY of `b0d46a4` (`git archive` into `C:/tmp-w184/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0, deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node test/runner.ts` EXIT 0: 74 files / 1958 cases |
| M2 | **P36 prediction 1**, the `src/` change ALONE (no test touched), `node test/runner.ts` | **5 existing cases RED**, every one asserting *thrown, not halted*: `cancel.test.ts` cases 12 and 13 (W178 (o) at rest, and MID-STEP — reading R2), `pause.test.ts` case 5, `stop.test.ts`'s throwing-callback case, and `test/scheduler/runtime.test.ts`'s W178 case (its `cancelRequested` half: `done` now `halted`). The ask suite's resolve-road case did NOT go red — it asserts the throw and never the absence of a halt — and is strengthened |
| M3 | **the new sweep against today's `src/`** (`test/driver/throwing-callback.test.ts`, written from the rule before any run) | **RED in node AND deno at exactly fact 11's non-halting roads**: R2, R4 (the `resolution` element, folding `completed`), R5, R6, R7 (`running`), R8 (`interrupted`, the checkpoint resumable), R9 (`cancelling`), R11 at rest and on `resumed` past a lost tail (`running`), the mid-step stop, answer, pause on `resumed` and unpause — and a road fact 11 did not name, a throw on a resolution's **`branch.resumed`** (the mid-step unpause row). **GREEN on today's tree**: R1, R3 (the successor's `dispatched`), R10, the lost tail's `ResumeRefused('halted')`, the mid-step cancel on `start()`'s step, and the refused-call control. 16 of 21 cases red, both runtimes |
| M4 | the sweep on the changed `src/` | all GREEN, node and deno. Three ONCE roads were added after M3 (mid-step cancels on `resolve()`'s routing, `resume()`'s `resumed`, a taken answer's routing): **green on today's tree too** — they guard `haltOnce` at those boundaries, not a fact 11 road (24 cases) |
| M5 | **B′ / D′ — the census sites**, each by its lane, on the final tree | `LATE_SUITES` +1 and a per-suite count case (24); `RUN_FLOOR` 43 -> 44 (section 9's snippet; `check:docs` 44 `run` / 6 `check`; `check:docs:selftest` 24/24 noticed); `check:spec` 7 / 81 / 147 UNMOVED (no rule id); `spec/outcome-record.md` v0.18 -> v0.19 and `spec/run-state.md` v0.23 -> v0.24, both `spec/README.md` rows; L1-L5 74 / 1958 -> **75 / 1984** in node, deno and chromium (24 sweep + 1 count + 1 runtime case) — **1988** after the readers' rows. **Unmoved**: `DRIVER_FIELDS` and `NOT_RUN_STATE` (`haltOnce`, `leaveCall`, `takeAtRest` are methods, no field), `RUN_FOR`, `X10` (L6 2743 / 203, no L6 file touched), `check:budget` (`AGENTS.md` is not in the always-read set, so no `check:budget:selftest`) |
| M6 | **now-false statements**, `git grep` over the tree but `dev-dist/`, `node_modules/` and the history folders for *whoever is on the stack*, *thrown to you instead*, *reaches the caller*, *throws to its caller*, *not halted* | rewritten in `Owns`: `OR-R10` (and outcome-record's status), `RN-R22`, `RN-R31`, `RN-R33`, `RN-R35`, `RN-R37`; `src/driver/driver.ts` — `onRunFailure`'s and `onFoldInput`'s docs, `cancel()`'s step 4, `takeStop`'s `finally`, `takePending`'s and `takeAnswer`'s docblocks; `src/scheduler/runtime.ts` — `RunHandle.stop`'s `@throws`, `Runtime.resume`'s doc; `AGENTS.md` sections 6 (cancel row), 8 (`done`'s stop bullet, a pause-table throw row), 9 (the sentence, the BREAKING note, a `run` snippet), 18 (a stop-table throw row, a resume bullet); the moved tests' titles and messages. **Outside `Owns`, record-step files**: ADR 0104 rule 2, ADR 0105 rule 4 and ADR 0106 rule 5 each say *the throw then reaches whoever is on the stack* — now incomplete, a dated pointer each at the Record (W178's S-3 precedent). History left (v0.21 status lines, W178/W180 items) |
| M7 | **a real-scheduler probe** — `C:/tmp-w184/m/scratch-w184/probe.ts`, `createRuntime` over a real `FyflowScheduler`, inline pools, not checked in | node 24.20.0 and deno 2.9.6 EXIT 0, **the same JSON byte for byte**: (1) `handle.stop()` at rest throwing on `interrupted` — the consumer's error at the caller, `onRunFailure` `['Boom']`, `done` `halted` at once, the checkpoint refused `halted`; (2) `runtime.resume()` on a fresh runtime throwing on `resumed` — the consumer's error, `['Boom']`, nothing in the new scheduler's `tasks`, the id then `RunIdInUse`; (3) `resolve()` of a really-parked task throwing on `resolution` — `halted`, `y` never dispatched. **On `b0d46a4`'s driver** the same probe: (1) `interrupted`, resumable, nothing reported; (2) nothing reported; (3) **`completed` with `y` never dispatched** — fact 11's false outcome on a real scheduler |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | ~~**The halt lands at the call's BOUNDARY, not at the element**~~ — **WITHDRAWN at the readers' round (C1, BLOCKER)**: a take still pending behind the throwing one ran before the halt, and its successor was handed to a scheduler for a run reported halted (`unpaused, resolution q2, branch.resumed 1, dispatched t2, halted`). **Now EVERY take halts the run at its own element** — `takePause`, `takeAnswer`, `takeStop`, after the element's own `finally` (cancels, hand-off) — so `halted` follows the element thrown on and a pause, unpause or answer pending behind it is DROPPED by its existing halted guard; on the scheduler road too (the same takes). `leaveCall`, `stop()`'s and `takeAtRest`'s catches were then dead backstops (their probes L1-L4, T1, Q1 SURVIVED) and are REMOVED | P36's brief rule (ii): *`halted` after the element thrown on, nothing further dispatched, routed or emitted* | `haltOnce`'s, `takePause`'s, `takeAnswer`'s and `takeStop`'s docs; `OR-R10` v0.19; `RN-R33`, `RN-R35` v0.24 |
| **R2** | **A `cancel()` called MID-STEP whose own element threw halts the run at `cancel()`'s boundary, even when the calling callback catches the throw** | (i)/(ii) are about ANY element the driver appends, and a cancel's element is appended in the call, unlike a deferred take; (iii)'s caller is the callback. Moves W178's `cancel.test.ts` case 13 caught row (`cancelling` -> `halted`) — the one existing assertion on a scheduler event's step that moved | `RN-R31` v0.24; case 13 |
| **R3** | **"Accepted" = past every refusal; ANY throw after it at a driver call's boundary halts** — the consumer's callbacks AND a scheduler's or `createTask`'s throw inside `cancel()`'s hand-off and sends | `start()`'s treatment since W3, `resume()`'s and `drainHeld`'s already; one boundary, not a list of throwers. New only for `cancel()` (a scheduler `cancel`/`addTask` throwing there used to rethrow unhalted). Not provoked by a test — no double's `cancel` throws synchronously | Scope Out; `haltOnce` doc |
| **R4** | **ONCE at every boundary that used to report unconditionally** — `start`'s catch, `resume`'s hand-off catch, `resolve`'s and a taken answer's routing catch, and `onEventStep`'s (W178's Notes: the re-entrant double report) — now `haltOnce`. `drainHeld` left as it was (its `failRun` cannot meet an already-halted run: the hold breaks the loop first) | without it a mid-step `cancel()` whose element threw reported twice (measured: `['Error','Error']` on case 13's uncaught row) | `OR-R10` v0.19's *Reported ONCE* |
| **R5** | **Brief point 5 — the FIRST throw halts and is the one reported AND thrown** (revised at the readers' round, C2/A3; the first reading — both taken, the LATER reported — WITHDRAWN): (a) a pause AND a stop pending at `resolve()`'s end, both throwing — the pause halts at its element, the stop behind it is TAKEN (`RN-R33`: even after a halt) SILENTLY, its throw discarded; reported and thrown: the pause's error; (b) a throw on the step's own element with a stop pending — halted there, the stop taken after `halted` silently; reported and thrown: the first. The one exception stays W178's S-1: a throw on the `halted` element itself replaces the first at a driver call's caller | the brief: *whatever the halt does not drop is taken silently*; `RN-R33` keeps a stop pending after a halt (W174's R9 case), so `interrupted` may follow `halted` — the ONE element that may (reading R7) | `RN-R33` v0.24; the ONCE case |
| **R6** | **The lost tail keeps `ResumeRefused('halted')`**; a throw on `resumed` throws the consumer's error | P36 (c) as answered | `RN-R22`, `RN-R37` |
| **R7** | **`interrupted` is the one element that may follow `halted` in a step** — a stop raised on the step, taken after the halt silently (R5) | the readers' C4 asked for NOTHING after `halted`; a pending stop is the exception `RN-R33` already makes (*taken even if the rest of that step halted the run*, W174's R9 case asserts it) and the brief's point 5 allows (*taken silently*). Dropping it too would move `RN-R33` and W174's case — a design fork the plan did not ask, NOT taken | the sweep's `silentStop` rows |

## Predictions, and what happened

| | prediction (at declaration) | outcome |
|---|---|---|
| 1 | P36 prediction 1: the sweep RED at exactly fact 11's non-halting roads in both runtimes, green after; the moved assertions those asserting *thrown, not halted* in pause, stop, cancel and the ask suites, and `AGENTS.md` section 9's sentence; no settlement-road assertion moves | **red/green half HOLDS** (M3, M4) — and found a road fact 11 did not name, a throw on a resolution's `branch.resumed`. **The moves half: PARTLY FALSIFIED** — pause, stop and cancel moved as named; the ask suite moved NOTHING (it never asserted the absence of a halt; strengthened anyway); `test/scheduler/runtime.test.ts`'s W178 case moved (not named); and ONE scheduler-event-step assertion moved — cancel case 13's caught row (R2) |
| 2 | census: `LATE_SUITES` +1 and a count, `RUN_FLOOR` +1, no rule id, no `DRIVER_FIELDS`, no `X10` | HOLDS (M5) |

## The author's provocations (before the readers)

`C:/tmp-w184/mutate.mjs` in the byte copy `C:/tmp-w184/m` (synced, `cmp` per changed file, `find -type l` zero); each anchor checked to occur once in the CURRENT text, the file restored from its first snapshot and its SHA-256 compared after every probe and at the end (all equal); graded on the `FAIL` lines of `node test/runner.ts driver` and `node test/runner.ts scheduler/runtime`; a time-out NO VERDICT (none); a FAIL line naming an import CRASH. **Grader controls**: CONTROL clean; GRADER-CRASH graded CRASH (the first harness graded it KILLED — import failures print as FAIL lines; fixed before any verdict was taken). **27 one-clause probes: 27 KILLED, no survivor, no NO VERDICT** (`C:/tmp-w184/mut.json`).

| id | the ONE clause broken | verdict — killed by |
|---|---|---|
| L1 | `leaveCall` rethrows without halting | KILLED — sweep R5, the mid-step stop/answer/pause/unpause rows, pause 5, stop's throwing case |
| L2 / L3 / L4 | `start` / `resume` / `resolve` end their step with the bare `leaveStep` | KILLED each — the mid-step rows of that call |
| H1 | `haltOnce`'s guard removed (reports twice) | KILLED — cancel 13, the mid-step cancel row, W175's halt-in-hand-off case |
| H2 / H3 | `haltOnce` a no-op / inverted | KILLED — 100 FAIL lines each |
| S1 | `start`'s catch reports unconditionally | KILLED — the mid-step cancel row |
| U1 | `resumed` appended before its `try` (moved: two edits, ONE clause — its position; neither half alone is a meaningful program) | KILLED — both R11 rows, the pause-on-`resumed` row, the halted-resume case |
| U2 / U3 | `resume`'s boundary rethrows unhalted / reports unconditionally | KILLED — R11 rows / the cancel-on-`resumed` ONCE row |
| V1 | the resolution element outside `resolve()`'s boundary | KILLED — R2, R4, the ask suite's strengthened case |
| V2 / A1 | `resolve`'s / a taken answer's routing catch reports unconditionally | KILLED — each by its own ONCE row only |
| C1 / C2 | `cancel()`'s boundary removed / its sends not in a `finally` | KILLED — R9 rows, cancel 12 and 13 |
| T1 / T2 | `stop()` at rest unbounded / its cancels not in a `finally` | KILLED — R8, stop's throwing case, the runtime W184 case |
| Q1 / Q2 | `takeAtRest`'s boundary removed / the unpause's hand-off not in a `finally` | KILLED — R6, R7, pause 5 |
| E1 | `onEventStep` reports unconditionally | KILLED — cancel case 13's uncaught row only |
| X1 / X2 | the acceptance point moved BEFORE a refusal (an ask's schema refusal; a second pause) | KILLED — the refused-call control, the ask and pause refusal cases |
| **AR1** | ARRANGEMENT — a halted run's `done` WAITS on the cancels as an interrupted one does (`runtime.ts`) | KILLED — the runtime W178 and W184 cases: *at once* is not carried by a double resolving its cancels (`stoppable()` holds them unresolved) |
| **AR2** | ARRANGEMENT — `dispatch`'s `shut()` door removed | KILLED by `hold.test.ts` ONLY — **the sweep's *nothing dispatched after the halt* is carried by the throw UNWINDING the step, not by the hold**: no swept road reaches a dispatch door after its halt. Recorded for the readers |

*The browser lane went red on the first `npm run gate` (the bundle renames `class Boom`; the assertion read the literal `'Boom'`, now `Boom.name`); the gate was re-run whole, EXIT 0. The probe set was not re-run for that one-token test edit.*

## Stop-and-asks

None raised. Nothing outside `Owns` was edited. Reading R7 declines one clause of the readers' C4 (nothing after `halted`) for a pending STOP, because dropping it would move `RN-R33` and W174's R9 case — stated, not asked: the brief's point 5 settles it (*taken silently*). The three ADR pointers (M6) are record-step files, written at the Record.

## Notes for the plan's Record

- Every element W185-W187 add is born under `haltOnce`: a new driver-call road needs one row in `test/driver/throwing-callback.test.ts`'s `ROADS`.
- **The readers' C1 is a rule FOLLOWED that fell short** (`doc/workflow.md` section 6 pass 3 rule 3): the author's sweep asserted `halted` *somewhere after* the element and nothing dispatched after it — so a take pending BEHIND the throwing one, run before a deferred halt, passed it. Both readers found the narrow check. The sweep now asserts `halted` IMMEDIATELY after the element and NOTHING after it but a silent stop (R7). For the retro.
- W178's scheduler road had the same deferred halt (`onEvent`'s step-end catch, since W178): fixed here by the same takes, and its R2 note (*a pause and a stop both throwing report only the second*) is now the FIRST.
- This item's Record states its readers' overlap.

## Readers — round 1 (2026-10-18), and what was acted on

*Both readers ran with fresh contexts, spec first; each reported and fixed nothing. Every finding was in `Owns` and was
applied by the author at the coordinator's direction; none needed a stop-and-ask.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | **C1 BLOCKER** — R1's deferred halt broke the brief's rule (ii): a take pending BEHIND the throwing one ran before the halt — `unpaused, resolution q2, branch.resumed 1, dispatched t2, halted`, t2 HANDED to the scheduler for a run reported halted; the same with a pause; the scheduler road (W178's) shares it | defect (code) | **FIXED** — every take halts at its own element (`takePause`, `takeAnswer`, `takeStop`), the pending calls behind it dropped by their halted guards, on both roads; the dead backstops (`leaveCall`, `stop()`'s and `takeAtRest`'s catches) removed; three C1 sweep rows (an unpause then an answer on `resolve()`'s step, a pause then an answer on a scheduler event's, an answer then a pause on `start()`'s); R1 WITHDRAWN |
| conformity | **C2** — R5 both halves: the first error reached neither channel, and the reported error was not the caller's | defect (rule) | **FIXED** by C1's fix plus a SILENT stop after a halt (`takeStop`): the FIRST throw is reported AND thrown; R5 rewritten from the rule; `onFoldInput`'s doc sentence made true |
| conformity | **C3** — R3 (a scheduler's or `createTask`'s throw inside `cancel()`, a stop's cancels) halts but `OR-R10` said *a consumer callback* | text | **FIXED** — `OR-R10` v0.19 and `AGENTS.md` section 9 state it; tested (A1) |
| conformity | **C4** — the sweep's (ii) check was narrow: `halted` anywhere after, only `dispatched`/`branch.`/`resolution` excluded | test | **FIXED** — `halted` IMMEDIATELY after the element (after whatever the raiser appended on that same callback), and NOTHING after it but a silent stop's `interrupted` (reading R7) |
| conformity | **C5** — section 8's `done` bullet covered a stop's `halted` at once, not a cancel's | text | **FIXED** — both |
| conformity | **C6** — the W184 runtime case sat inside the W174 suite titled *settles `interrupted`* | test | **FIXED** — its own suite (`LATE_SUITES` +1, counted) |
| conformity | **C7** — ADR pointers | record step | **DONE** — ADR 0104 rule 2, ADR 0105 rule 4, ADR 0106 rule 5, one dated line each |
| adequacy | **A1** — R3 untested (its probe M4, `cancelTask` swallowing a throw, SURVIVED) | gap | **FIXED** — the double's `cancel` throws once: `cancel()` and a stop at rest halted, one report under the scheduler's class, its error at the caller; and a pending stop's second promise settling (O4) |
| adequacy | **A2** — the take's order (cancels BEFORE the halt) unobserved (M5 SURVIVED) | gap | **FIXED** — `cancelsAtHalt` recorded when `halted` is delivered and held to each stop/cancel row's hand-written count; O1, O2 kill |
| adequacy | **A3** = C2; **A4** = C4 | — | FIXED (above) |
| adequacy | **A5** — a comment claimed a later unpause refused `halted` with no assertion | test | **FIXED** — asserted |

**The readers' overlap: THREE shared subjects** — R5 (C2 = A3), R3 untested (C3 = A1) and the sweep's narrow check
on what follows `halted` (C4 = A4). C1, C5, C6, C7 were the conformity reader's alone; A2 and A5 the adequacy reader's.
*(P36's brief sentence; the ordinal is a retro's.)*

## Record

*Filled 2026-10-18, after the readers' round. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 (second run) | the first EXIT 1 in the browser lane only: the bundle renamed `class Boom`, the assertion read the literal; `Boom.name` since (`C:/tmp-w184/gate2.log`) |
| L2 the SWEEP | RAN — green | `test/driver/throwing-callback.test.ts`: 23 roads × every element of each step — at rest, mid-step, the scheduler event's road, the ONCE roads and the three C1 rows — the throw at the caller, one report under the consumer's class, `halted` immediately after the element and nothing after it but a silent stop, nothing handed on after it, (b)'s side effects and the cancels-before-halt order hand-written; RED on `b0d46a4` at exactly fact 11's non-halting roads in node and deno (M3) |
| (c), ONCE, R3, refusals | RAN — green | the halted resume refused `halted` and an unpause refused; the double throw — the FIRST reported and thrown, a stop taken silently; a scheduler's throw in a cancel and a stop; a refused call halting nothing |
| through `createRuntime` | RAN — green | its own suite: `handle.stop()` throwing — `done` `halted` at once with the cancels unresolved; `runtime.resume()` throwing on `resumed` — nothing handed on, `RunIdInUse` after |
| conformity reader | RAN | C1 BLOCKER and C2-C7 — all FIXED (above) |
| adequacy reader | RAN | A1, A2, A5 FIXED; A3 = C2, A4 = C4 |
| the author's probes, re-run after the readers | RAN | **27 one-clause probes + 2 grader controls (CONTROL clean, GRADER-CRASH CRASH): 27 KILLED**, no survivor, no NO VERDICT; new: K1-K4 (each take halts at its element; the silent stop), O1/O2 (halt before the cancels), O3 (`cancelTask` swallowing — the adequacy reader's M4), O4 (`taken()` out of its `finally`); RETIRED with the code they broke: L1-L4, T1, Q1 (dead backstops — SURVIVED on the fixed tree, then removed); every file restored, digest equal (`C:/tmp-w184/mut.json`) |
| real-scheduler probe (M7) | RAN — before the readers | node and deno byte-identical; not re-run after the fix (the three roads it drives take no pending call) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w184/gateitem.log`) | lint 159 files; `check:spec` 7 / 81 / 147; `check:docs` 44 `run` / 6 `check`; L1-L5 **75 files / 1988 cases** in node, deno and chromium; L6 2743 assertions, 0 failed, node and deno; selftests 10/10 ok (977 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `haltOnce` at every boundary, and every take halting at its element | yes | H1-H3, S1, U1-U3, V1-V2, A1, K1-K4, C1, E1 |
| (1) the element's side effects first (`finally`) | yes | C2, T2, Q2, O1, O2, O4 |
| (2) `runtime.ts` comments | yes | a comment; no check reads it |
| (3) outcome-record v0.19, run-state v0.24, `spec/README.md` | yes | `check:spec`, `check:markdown` |
| (4) the tests | yes | M3; the probe table |
| (5) `AGENTS.md` and its `run` snippet | yes | `check:docs` (`RUN_FLOOR` 44) |

**Prediction 1 — red/green HOLDS; the *moves* half PARTLY FALSIFIED** (the table above: the ask suite moved nothing, the
runtime W178 case and cancel case 13's caught row moved). Prediction 2 HOLDS; M5's L1-L5 figure is 1988 on the final tree
(1984 before the readers' rows).

**What broke.** Fact 11's roads, and one it did not name (a resolution's `branch.resumed`). Then the author's own R1: a
deferred halt let a take pending behind the throwing one run — the readers' BLOCKER, which W178's scheduler road shared.

**What this taught.** *For the retro*: a sweep that asserts *halted somewhere after, nothing dispatched after* is satisfied
by work done BETWEEN the throw and a deferred halt; the claim needs *immediately after, nothing after*. And every
deferred-halt boundary (`leaveCall`, the at-rest catches) went dead once the takes halted themselves — found by their probes
surviving, and removed.

**Questions raised.** None (Q680-Q682 SPENT, unissued). **Closed.** None.
