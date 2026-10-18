# W185 — the header BEFORE the first event: `onHeader`

**Status:** done 2026-10-18 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, no BLOCKER, C1-C4, C6 and A1-A3 acted on, C5 outside `Owns` (recorded for the retro); no stop-and-ask; no question raised; not committed. Earlier: earlier READY-FOR-READERS 2026-10-18 (`npm run gate` EXIT 0); declared 2026-10-18 on `890e243` (W184 done); P36's SECOND item: decision 1, stop-and-asks (d) and (e) as answered, fact 5; ADR 0112 (reserved for it); not committed
**Plan:** [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) — *which run and attempt does a
task's activity belong to, without parsing its id, and what of a run survives a crash and a resume?* — the fyflow-app ask
**#9**: a run whose events were written before its header can be lost. **As answered** ((d), (e)): `onHeader(header)` is a
`DriverOptions` member, in `StartOptions`' `Pick` and OMITTED from `ResumeOptions`; called by `start()` only, ONCE,
synchronously, after `FD-R4`'s check and the payload's clone and BEFORE anything is appended or handed to the scheduler,
with a FROZEN copy equal to `checkpoint().header` and `handle.header`. A throw leaves the driver UNSTARTED — nothing
appended, nothing handed on, nothing reported — reaches the caller, and a retry may start the same driver; on a runtime the
run id is spent. Never called after an `FD-R4` refusal or a `DataCloneError`. ADR 0112 reverses ADR 0064's
rejected-alternative row and says so.

```
Spec:       spec/run-state.md v0.24 -> v0.25: `RN-R39` (NEW, section 8) — the header handed to `onHeader` before the
            first event; `RN-R15` (where the header is written, and a throw from `onHeader` leaving it unwritten) and
            `RN-R18` (the first events arrive before the HANDLE's header — and after `onHeader`'s) move — and
            `RN-R25`'s *`options` every `StartOptions` member but `runId`* (found by the premise grep, reading R3); next
            free `RN-R40`. spec/README.md: the run-state row and its version column.
Owns:       from P36's W185 row, exactly: src/driver/driver.ts, src/scheduler/runtime.ts, src/scheduler/index.ts (if a type
            is exported — none is: `CheckpointHeader` is exported already), spec/run-state.md (`RN-R15`, `RN-R18`, a new
            `RN-R39`), spec/README.md, test/driver/**, test/scheduler/**, test/definition/l4-corpus.test.ts, AGENTS.md (the
            WHOLE file, D′), scripts/check-docs.mjs, doc/decisions/0112-*.
            Exceptions: none declared. Anything else found to need an edit is a STOP-AND-ASK (S-n), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q683-Q685 only if raised),
            doc/decisions/** (ADR 0064's dated pointer — P36 decision 1's reversal of its rejected-alternative row, and its
            consequence 1), the plan's Record, README.md, this file.
            Overlap with W184 (serial, done): src/driver/driver.ts, src/scheduler/runtime.ts, spec/run-state.md,
            spec/README.md, test/driver/**, test/scheduler/runtime.test.ts, test/definition/l4-corpus.test.ts, AGENTS.md,
            scripts/check-docs.mjs. With W186 (next): the same, less doc/decisions/0112-*.
Inputs:     P36 decision 1, stop-and-asks (d) and (e) as answered, fact 5, prediction 2, decision 9 (ADR 0112), the census
            sites D′ names for this row (the binding test's pins, `ResumeOptions`' `Omit`, the premise *the header arrives
            after the first events*), sentences B′, C, D′, E and the two brief sentences; W184's Record (a halt lands at
            the element; a sweep asserts what FOLLOWS, not *somewhere after*); ADR 0064 (its fact 5, consequence 1 and
            rejected row), `RN-R14`, `RN-R15`, `RN-R18`, `RN-R25`, ADR 0091 rule 4.
Outputs:    (1) src/driver/driver.ts: `DriverOptions.onHeader?: (header: CheckpointHeader) => void`; `startStep` calls it
                after `FD-R4` and the clone, before `header`/`started` are kept and before `enter` — the driver counted
                started with NO header while it runs (so a re-entrant `start`/`resume` is `MultipleRuns` and every other
                call refuses as on an unstarted driver), reset to unstarted if it throws. No field, no export moves.
            (2) src/scheduler/runtime.ts: `StartOptions`' `Pick` gains `onHeader`, `ResumeOptions` is
                `Omit<StartOptions, 'runId' | 'onHeader'>`, `openRun` spreads it conditionally; `RunHandle.header`'s comment
                (*measured rather than avoidable*) rewritten.
            (3) spec run-state v0.25 (`RN-R39`, `RN-R15`, `RN-R18`), spec/README.md's row.
            (4) tests: test/driver/on-header.test.ts (L2, NEW); test/scheduler/runtime.test.ts — a W185 suite (L1 through
                `createRuntime`), the binding test's pins moved by name (`DriverOptions` 20 -> 21, an `onHeader` observer,
                the resume loop's filter a list held to the source's `Omit` both ways); l4-corpus's census and count.
            (5) AGENTS.md: section 18's table, paragraph and snippet comment (*a store that must write its header first
                cannot*), sections 2, 8 and 12's handle sentences where they state the order, section 9's start rows,
                section 10's member count — and whatever else the premise grep finds (D′); one `run` snippet in section 18
                (RUN_FLOOR 44 -> 45).
            (6) doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md.
Depends on: W184 (done, `890e243`)
Blocks:     W186
Tests:      L2, expected values hand-written from (e), `RN-R15` and each flow's shape, never from output: `onHeader` called
            ONCE, its position in ONE log the double, `onFoldInput` and the callback all write to, held BEFORE the first
            element AND BEFORE the first `addTask` — an entry task, and an entry fan-out of three before all seven
            elements (2N + 1) and three hand-offs — each beside a CONTROL showing the log saw what follows; a frozen copy
            equal to `checkpoint().header`, a write into its entry payload reaching nothing; a THROW: nothing appended,
            nothing handed on, nothing reported, `NotStarted`, the error at the caller by identity — and a retry on the same
            driver starting it, the same log now seeing the element and the hand-off (the control); `FD-R4`'s refusal, an
            uncloneable payload and `MultipleRuns`: never called, beside the control that a good payload is; `resume()`:
            never called, beside the control that it re-dispatched; a call back into the driver from the callback refused
            and the run started once; a run with no `onHeader` unmoved (prediction 2). L1 through `createRuntime`: equal to
            `handle.header`, before the composed `onFoldInput`'s first element and the view's first `addTask`, on the
            runtime's second minted run; a throw spending the run id (`RunIdInUse`), nothing handed on, beside a control run;
            `runtime.resume()` never calling one passed past the type. RED on `890e243`'s `src/` where a call is claimed.
            One-clause mutations (sentence E) in the byte copy C:/tmp-w185/m, graded on each suite's failure lines, grader
            controls (clean, crash); a time-out is NO VERDICT.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. The row's clauses: L2 `onHeader` once, before the first
            `onFoldInput` AND before `addTask` — an entry task, and an entry fan-out of three before all seven elements —
            with a frozen copy equal to `checkpoint().header`; a throw: nothing appended, nothing handed on, the driver
            unstarted and a second `start()` accepted; `FD-R4`'s refusal and an uncloneable payload: never called;
            `resume()`: never called; L1 through `createRuntime`: equal to `handle.header`, and after a throw the run id
            refused `RunIdInUse`; the binding test's pins moved by name.
Reserves:   Q683-Q685 (P36's per-item line); ADR 0112 (P36 decision 9)
```

## Scope

**In** — Outputs (1)-(6).

**Out** — named rather than left implicit, with where it goes instead

- **Attempts, attribution, the pass-throughs** — W186, W187.
- **An L6 row** — W188's exit artifact clause (3) runs `onHeader` on real workers in both runtimes. A real-scheduler
  probe through `createRuntime` is run here in node 24 and deno, and not checked in.
- **A `Driver` field** — none is added (`started` and `header` already carry the states); `DRIVER_FIELDS` in
  `test/driver/retention.test.ts` and `examples/l6.ts`, and `NOT_RUN_STATE`, do not move.
- **A row in W184's sweep** — `onHeader` appends nothing and is not a driver-call road: its throw is a refusal BEFORE
  acceptance (`haltOnce`'s doc: *a rejected command halts nothing*), so W184's Notes' *a new driver-call road needs one row*
  does not bind it. Its throw path is this item's suite.
- **`examples/l6.ts`'s *"RN-R18 at L6: the HEADER arrives AFTER the first events"*** — still TRUE of the HANDLE's
  header, which is what that row measures; W188's file, named for its author.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w185/m`, each graded on the named suites' `FAIL` lines; then the readers; then `npm run gate:item`
once. Routing coverage: a nested fan-out (Q6), no matching decision edge (Q10), a duplicate task id (Q13),
`user_action` (Q17), a branch routed away from its join (Q4) — not applicable: no routing rule moves; the header is
delivered before the run's first routing step and the fan-out case is an entry region's first step only.

## What the declaration step measured

*Measured 2026-10-18 in a BYTE COPY of `890e243` (`git archive` into `C:/tmp-w185/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0, deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node test/runner.ts` EXIT 0: 75 files / 1988 cases |
| M2 | **P36 prediction 2**, the `src/` change ALONE (no test touched), `node test/runner.ts` | **3 cases RED, all three the binding test's pins and none a sequence**: `test/scheduler/runtime.test.ts`'s *ORPHAN COUNT 0* (its COUNT, `expected: 20 actual: 21` — the orphan clause itself green, the road added in the same edit), *the observer list IS StartOptions` membership* (`onHeader` with no observer) and *every StartOptions member but runId has a resume() observer* (the `Omit` now takes `onHeader` too). Every other case of 75 files green: no fold-input sequence moved |
| M3 | **the new suites against `890e243`'s `src/`** (written from (e) before any run) | `test/driver/on-header.test.ts`: **7 of 9 RED** — every case claiming a call, the refusal case by its control; GREEN `resume()` (it claims none) and the membership case. `test/scheduler/runtime.test.ts`: the three pins, the `onHeader` start observer, and W185's order and throw cases RED (6); its resume case GREEN (claims none) |
| M4 | the suites on the changed `src/` | all GREEN: node **76 files / 2002 cases**, deno 76 / 2002 (+9 L2, +3 L1, +1 start observer, +1 l4-corpus count) |
| M5 | **B′ / D′ — the census sites**, each by its lane | `LATE_SUITES` +2 and a per-suite count case (9 and 3); the binding test's pins moved BY NAME (`DriverOptions` 20 -> 21, an `onHeader` observer, the resume loop's filter `RESUME_OMITS` held to the source's `Omit` both ways — its case renamed from *but runId*); `RUN_FLOOR` 44 -> 45 (section 18's new snippet; `check:docs` 45 `run` / 6 `check`; `check:docs:selftest` run, below); `spec/run-state.md` v0.24 -> v0.25 and its `spec/README.md` row; next free rule id `RN-R40`. **Unmoved**: `DRIVER_FIELDS` and `NOT_RUN_STATE` (no field: `started` and `header` carry the states), `RUN_FOR` and `isFed` (no kind), `X10` (no L6 file touched), `check:budget` (`AGENTS.md` is not in the always-read set) |
| M6 | **now-false statements** — `git grep` over the tree but `dev-dist/` and `node_modules/` for each changed name (`onHeader`, `StartOptions`, `ResumeOptions`, `DriverOptions`) and each PREMISE (*the header arrives after the first events*, *a store that must write its header first cannot*, *measured rather than avoidable*, *every StartOptions member but runId*, *the driver's twenty*, *the header cannot be written strictly first*) | rewritten in `Owns`: `RunHandle.header`'s comment and `StartOptions`'/`ResumeOptions`' docs (`src/scheduler/runtime.ts`); `RN-R15`, `RN-R18` and — found by the premise grep, NOT named in the row's parenthetical — **`RN-R25`'s *`options` every `StartOptions` member but `runId`***, same file (reading R3); `AGENTS.md` sections 8 and 12 (the handle's header sentence), 9 (a throw row and the *refused before accepted* sentence), 10 (the snippet comment's *the driver's twenty*), 18 (the table, the paragraph, the snippet's *a store that had to write its header first could not* — the snippet now writes the header through `onHeader` and holds it equal to the handle's — and a new snippet); `test/scheduler/checkpoint.test.ts`'s message *the header cannot be written strictly first*. **Outside `Owns`, record-step files**: ADR 0064's last rejected-alternative row and consequence 1 — a dated pointer each, written (P36 decision 1). **Still true, left**: `examples/l6.ts`'s *RN-R18 at L6: the HEADER arrives AFTER the first events* (the HANDLE's — W188's file), ADR 0064 fact 5, ADR 0058's *before `start` returns* |
| M7 | **a real-scheduler probe** — `C:/tmp-w185/m/scratch-w185/probe.ts`, `createRuntime` over a real `FyflowScheduler`, an inline pool, an entry fan-out of three, `runtime.scheduler.addTask` wrapped into the same log as `onFoldInput` and `onHeader`; not checked in | node 24.20.0 and deno 2.9.6 EXIT 0, **the same JSON byte for byte**: (1) `onHeader` once at log position 0, the first element at 1, the first `addTask` at 6, equal to `handle.header`, frozen, the run `completed`; (2) a throwing `onHeader` — the consumer's error at the caller, nothing handed on, nothing reported, no `p2:` task in the scheduler, the id then `RunIdInUse`; (3) `runtime.resume()` passed one past the type — not called, the resumed run `completed` |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **While `onHeader` runs the driver counts as STARTED with NO header** — the state a refused resume leaves — so a `start()` or `resume()` the callback makes is `MultipleRuns`, and every other call refuses as on an unstarted driver (`checkpoint()` `NotStarted`, `cancel`/`stop`/`pause` `RunControlRefused('not-started')`, `resolve()` `false`); reset to unstarted if it throws | (e) settles a retry AFTER a throw, not a call from INSIDE the callback; with no guard a re-entrant `start()` enters the run and the outer one enters it again — two runs merged into one driver, `ID-R3`'s defect, so the alternative is not a design but a defect. No field is added: `started` and `header` already carry the state, and a scheduler event in that window is dropped by the existing *started with no header* test (none can arrive: nothing was dispatched) | `startStep`'s comment; `RN-R39`; ADR 0112 rule 5; the L2 re-entry case; P6 |
| **R2** | **The header handed over is a shallow-frozen object with a fresh clone of the entry payload** — the shape `checkpoint()` hands out, so *a frozen copy equal to `checkpoint().header`* holds field for field and a write into its entry payload reaches nothing | (e) says *frozen copy*; `checkpoint()`'s own header is frozen at the top and its entry payload a new clone on each call (`RN-R17`), and the two must be equal and separately owned | `DriverOptions.onHeader`'s doc; the L2 copy case; P3, P4 |
| **R3** | **`RN-R25`'s `options` clause moved** — *every `StartOptions` member but `runId`* is false once `ResumeOptions` omits `onHeader` | the row's parenthetical names `RN-R15`, `RN-R18` and a new `RN-R39`; `spec/run-state.md` is in `Owns` whole, and D′'s premise grep found the fourth. Stated, not asked: the same file, a clause the change itself falsifies | `RN-R25` v0.25; M6 |
| **R4** | **A throw from `onHeader` is a REFUSAL of `start()`, outside W184's sweep** — nothing is appended, so `OR-R10`'s rule (a throw on an element the driver appends) does not reach it; `OR-R10` is NOT edited | its *a call refused before it is accepted halts nothing* already covers it, and P36 (e) answered *nothing reported*. `AGENTS.md` section 9 names it in that sentence | AGENTS.md section 9; ADR 0112 consequence 2 |

## Predictions, and what happened

| | prediction (at declaration) | outcome |
|---|---|---|
| 1 | **P36 prediction 2**: a run that passes no `onHeader` moves nothing — every fold-input sequence byte-identical; the only forced edits the binding test's pins and `ResumeOptions`' type | **HOLDS** at L1-L5 (M2: the three binding cases and nothing else, 75 files) and at L2 directly (the *unmoved* case); `ResumeOptions`' type moved, and the resume observer's filter with it (M5). L6 is not touched by this item and runs unchanged under `npm run gate` |
| 2 | census: `LATE_SUITES` +2 and a count, `RUN_FLOOR` +1, one rule id (`RN-R39`), no `DRIVER_FIELDS`, no `X10` | HOLDS (M5) |

## The author's provocations (before the readers)

`C:/tmp-w185/mutate.mjs` in the byte copy `C:/tmp-w185/m` (synced, `cmp` per changed `src/` file, `find -type l` zero); each
anchor checked to occur once in the CURRENT text, both files restored from their FIRST snapshot and their SHA-256 compared
after every probe and at the end (all equal); graded on the `FAIL` lines of `node test/runner.ts on-header` and
`node test/runner.ts scheduler/runtime`; a time-out NO VERDICT (none); an import failure CRASH. **Grader controls**:
CONTROL graded clean; GRADER-CRASH graded CRASH. **14 one-clause probes: 14 KILLED**, no survivor, no NO VERDICT
(`C:/tmp-w185/mut.json`).

| id | the ONE clause broken | verdict — killed by |
|---|---|---|
| P1 | ORDER — the call made after `enter` (its position: two edits, one clause) | KILLED — the entry task's and the fan-out's order cases, the throw case, the re-entry case, the runtime's order and throw cases |
| P2 | UNSTARTED — the reset after a throw removed | KILLED — the throw case's retry (`MultipleRuns`) ONLY: `checkpoint()` reads the header, which stays unkept either way |
| P3 | FROZEN — handed over unfrozen | KILLED — the entry task case, the copy case, the runtime's order case |
| P4 | OWN COPY — the entry payload shared with the driver's header | KILLED — the copy case only |
| P5 | ONCE — called twice | KILLED — 8 cases |
| P6 | RE-ENTRY — the started-with-no-header guard removed (R1) | KILLED — the re-entry case only |
| P7 | AFTER `FD-R4` — the call made before the boundary walk (two edits, one clause) | KILLED — the refusal case; with it the copy and re-entry cases |
| P8 | AFTER THE CLONE — the call made before the clone, the payload uncloned (two edits, one clause) | KILLED — the refusal case (`DataCloneError`), the copy and re-entry cases, the runtime's order case |
| P9 | THE THROW REACHES THE CALLER — discarded, the run started | KILLED — the throw case, the runtime's throw case |
| P10 | NOTHING REPORTED — the throw reported through `onRunFailure` | KILLED — the throw case, the runtime's throw case |
| R1 | FORWARD — the runtime's conditional spread removed | KILLED — the binding (*REACHED by start*), the `onHeader` observer, both W185 order and throw cases |
| R2 | RESUME OMITS — `ResumeOptions` omits `runId` alone | KILLED — the renamed resume-observer membership (its `RESUME_OMITS` clause) only |
| R3 | RESUME NEVER CALLS — `resume()` calls it | KILLED — the L2 resume case, the runtime's resume case |
| R4 | THE PICK — `onHeader` out of `StartOptions`' `Pick` | KILLED — the orphan count, *REACHED by start*, the observer membership |

**Ceiling, declared by id**: no probe separates *before the first `onFoldInput`* from *before the first `addTask`* — the
one call site precedes both, and no one-clause edit puts it between them (a dispatch appends its element and then hands
on: M7's first element at 1, first `addTask` at 6). Each case asserts both; P1 breaks both at once.

## Stop-and-asks

None raised. Nothing outside `Owns` was edited but ADR 0064's dated pointer — a record-step file, P36 decision 1's
reversal, which the brief asks for. Reading R3 edits `RN-R25`'s clause in an owned file, beyond the row's
parenthetical — stated, not asked.

## Notes for the plan's Record

- W188's exit artifact clause (3) runs `onHeader` on real workers; M7's probe is that clause's shape at one flow.
- `examples/l6.ts`'s *RN-R18 at L6: the HEADER arrives AFTER the first events* stays true of the HANDLE — W188 may
  want its row's text to say so.
- W186 and W187 add `StartOptions`/`DriverOptions` members: the binding test's count (now 21), the observer map and
  `RESUME_OMITS` (held to the source's `Omit`) are their census sites.
- This item's Record states its readers' overlap.

## Readers — round 1 (2026-10-18), and what was acted on

*Both readers ran with fresh contexts, spec first; each reported and fixed nothing. No BLOCKER. Every finding but C5 was
in `Owns` or a record-step file and was applied by the author at the coordinator's direction; none needed a stop-and-ask.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | **C1 SHOULD** — ADR 0065 rule 1's *every `StartOptions` member but `runId` reaches it by the same road* is false once `ResumeOptions` omits `onHeader` | record step | **DONE** — a dated pointer under rule 1, as under ADR 0064 |
| conformity | **C2 SHOULD** — `openRun`'s doc *every `StartOptions` member reaches a resumed driver by the same road* | text | **FIXED** — every `ResumeOptions` member; an `onHeader` passed past the type is spread and never called, the old sentence kept visible |
| conformity | **C3 NIT** — R2's latent risk: the copy is whole only while every other header field is a primitive | text | **FIXED** — one line in `DriverOptions.onHeader`'s doc |
| conformity | **C4 NIT** — `RN-R15` said `FD-R4` *runs first*, where `RN-R39`, ADR 0112 rule 2 and the code ask `MultipleRuns` first | spec text | **FIXED** — `RN-R15` v0.25, the false clause kept visible and attributed (it was false since W73, not made so by this item) |
| conformity | **C5 NIT** — `OR-R10`'s refusal list (`spec/outcome-record.md`) does not name an `onHeader` throw; `AGENTS.md` section 9 does | spec text, OUTSIDE `Owns` | **NOT EDITED** — recorded for the plan's retro (Notes, below) |
| conformity | **C6 NIT** — R1's re-entry: `unpause` and answering an ask from inside `onHeader` unexercised | test | **FIXED** — `unpause` refused `not-started`; an entry ASK answered from the callback refused `false`, the run parked after with no answer taken, the same answer accepted after (the control) |
| adequacy | **A1 SHOULD** — probe A (`onHeader` handed the CALLER's payload, not a clone) SURVIVED at L2: the copy case read only `checkpoint().header` | test | **FIXED** — the hook reads its own copy after the caller writes, and the caller's object after the consumer writes; probe **A1** added to the harness and KILLED by that case at L2 alone (and the runtime's order case) |
| adequacy | **A2 NIT** — *not called again by the fan-out's further steps* with no further step driven | test | **FIXED** — a branch settles, the step's `outcome` seen in the log (the control), and the header still once |
| adequacy | **A3 NIT** — the runtime throw case's `folds`/`failures` observers had no in-case control | test | **FIXED** — the control run passes both, and both are shown live: its element, and an `UncloneableResult` its settlement reports |

**The readers' overlap: ONE shared subject** — the COPY handed to `onHeader` (reading R2): C3 on its completeness against
the header's other fields, A1 on its separateness from the caller's payload; two findings on one subject, which section 6
counts as an overlap. *Under the stricter predicate — the same finding — it is zero, which is the coordinator's reading.*
Every other finding was one reader's alone. *(P36's brief sentence; the ordinal is a retro's.)*

## Record

*Filled 2026-10-18, after the readers' round. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | lint 160 files; `check:spec` 7 / 81 / 148; `check:docs` 45 `run` / 6 `check`; L1-L5 76 files / 2002 cases in node, deno and chromium; L6 2743 assertions, 0 failed, node and deno (`C:/tmp-w185/gate.log`) |
| `check:docs:selftest` (B′: a snippet added) | RAN — EXIT 0, 24/24 noticed | `C:/tmp-w185/docs-self.log` |
| L2 `onHeader` once, before the first `onFoldInput` AND before `addTask` — an entry task, an entry fan-out of three before all seven elements — a frozen copy equal to `checkpoint().header` | RAN — green | `test/driver/on-header.test.ts`, each order beside its control; RED on `890e243`'s `src/` (M3) |
| a throw: nothing appended, nothing handed on, unstarted, a second `start()` accepted | RAN — green | the log exactly `['header']`, then the retry's element and hand-off on the same log |
| `FD-R4`'s refusal and an uncloneable payload never called; `resume()` never called | RAN — green | each beside the control that the callback is wired / the resume re-dispatched |
| L1 through `createRuntime`: equal to `handle.header`; after a throw the run id `RunIdInUse` | RAN — green | W185's runtime suite, its control run's observers shown live (A3) |
| the binding test's pins moved by name | RAN — green | `DriverOptions` 21, the `onHeader` observer, `RESUME_OMITS` held to the source's `Omit` both ways |
| real-scheduler probe (M7) | RAN — before the readers | node and deno byte-identical; not re-run (no `src/` behaviour moved after it) |
| conformity reader | RAN | C1-C6, no BLOCKER; C1-C4, C6 acted on, C5 outside `Owns` |
| adequacy reader | RAN | A1 (probe A SURVIVED at L2), A2, A3 — all FIXED |
| the author's probes, re-run after the readers | RAN | **15 one-clause probes + 2 grader controls (CONTROL clean, GRADER-CRASH CRASH): 15 KILLED**, no survivor, no NO VERDICT; new: **A1** (the caller's payload handed over), killed at L2 by the copy case; every file restored, digests equal (`C:/tmp-w185/mut.json`) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w185/gateitem.log`) | lint 160 files; `check:spec` 7 / 81 / 148; `check:docs` 45 `run` / 6 `check`; L1-L5 **76 files / 2002 cases** in node, deno and chromium; L6 2743 assertions, 0 failed, node and deno; selftests 10/10 ok (1023.6 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `DriverOptions.onHeader`, called in `startStep` after the refusals and the clone, before anything is kept or appended | yes | P1-P10, A1 |
| (2) `StartOptions`' `Pick`, `ResumeOptions`' `Omit`, the spread; the comments | yes | R1, R2, R4; a comment no check reads |
| (3) run-state v0.25 (`RN-R39`, `RN-R15`, `RN-R18`, `RN-R25`), `spec/README.md` | yes | `check:spec` (C6 owner, C8 version), `check:markdown` |
| (4) the tests | yes | M3; the probe table |
| (5) `AGENTS.md` and its `run` snippet | yes | `check:docs` (`RUN_FLOOR` 45) |
| (6) ADR 0112 | yes | `check:register` (`R6`-`R8`), `check:spec` `C5` (its links) |

**Prediction 1 (P36 prediction 2) HOLDS; prediction 2 (the census) HOLDS** — the tables above.

**What broke.** Nothing at a rung. The readers found an L2 copy case that could not see the caller's own payload handed
over (A1), and a `RN-R15` clause false since W73 that this item's new rule contradicted (C4).

**What this taught.** *For the retro*: a COPY claim needs its observer on the copy itself, read in both directions while
both objects are live — the case read the driver's header afterwards, which a probe sharing the CALLER's object (rather
than the driver's) leaves unmoved. And C5: a refusal list in one spec (`OR-R10`) and its mirror in `AGENTS.md` section 9
can diverge when a row's `Owns` holds only the second.

**Questions raised.** None (Q683-Q685 SPENT, unissued). **Closed.** None.

**Notes for the plan's retro.** **C5** — `spec/outcome-record.md` `OR-R10`'s *a call refused before it is accepted
halts nothing* list does not name an `onHeader` throw; `AGENTS.md` section 9 does. Outside W185's `Owns`, not edited.
