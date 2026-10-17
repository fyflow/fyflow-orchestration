# W178 — the throwing-callback fixes before 0.8.0, and (m)'s three titles

**Status:** done 2026-10-17 — `npm run gate:item` EXIT 0 on the final tree, one command; both readers RAN — D1 fixed by S-1 (YES), G1, G2 and adequacy finding 1 FIXED; exception E1 granted (S-2); no question raised; not committed — declared 2026-10-17 on `dd5821f`; P35's FIRST item: decision 4 (o), stop-and-ask (j) (p), fact 11 (m); no ADR (ADR 0110 stays unused, (j) as answered)
**Plan:** [P35](../plans/p35-may-a-node-wait-for-a-person-by-design.md) — *may a flow declare a node that waits for a
person, keeps what reached it, and holds the person's answer to a schema?* — its FIRST item, and the one that carries
P34's retro hand-offs (m), (o) and (p) before 0.8.0 is published. **Two defects of one class** (P34 retro section 4 (f):
*a consumer callback THROWING between two of a control's side effects*) and three test titles:

- **(o)** `driver.cancel()` with a consumer `onFoldInput` THROWING on its `cancelRequested` element sends no cancel, and a
  PAUSED run's held tasks are never handed on — `cancelling` for ever (fact 9). Fixed in `takeStop`'s shape (decision
  4): the held tasks taken out BEFORE the element, the element appended in a `try`, the cancels and hand-offs sent in a
  `finally`, the throw reaching the caller.
- **(p)** a consumer's throw on a `paused`, `unpaused` or `interrupted` element TAKEN at `leaveStep()` at the end of a
  SCHEDULER EVENT's step leaves `Driver.onEvent` into the scheduler's `dispatchEvent` — an uncaught exception that ends
  the process in node 24 and deno (fact 10). As (j) was answered: caught at the listener boundary, reported through
  `onRunFailure` and the run HALTED — `OR-R10`'s treatment of a throw on any other element of that step.
- **(m)** `RN-R12`'s two suite titles omit `cancelling` (they move together; `l4-corpus` counts the suite by name), and
  `test/scheduler/runtime.test.ts`'s *"the six outcomes"* predates the nine `RunOutcome` values.

```
Spec:       spec/run-state.md v0.20 -> v0.21: `RN-R31` (the cancel's step (4) sent in a `finally` — a throw on the
            element still sends every cancel and hands on every held task, and reaches the caller); `RN-R33` and
            `RN-R35` cross-reference the scheduler-event road where they say *the step's caller* (P35 (j)).
            spec/outcome-record.md v0.16 -> v0.17: `OR-R10` names the road — a throw from a consumer callback on an
            element a SCHEDULER EVENT's step appends, a take at the step's end included, is caught at the listener
            boundary, reported, and halts the run; and section 6's *dispatchEvent discards a listener throw* corrected
            to what fact 10 measured. spec/README.md: both rows and their version columns.
Owns:       from P35's W178 row, exactly: src/driver/driver.ts, spec/run-state.md (`RN-R31`), spec/outcome-record.md
            (`OR-R10`), spec/README.md, test/driver/cancel.test.ts, test/driver/pause.test.ts, test/driver/stop.test.ts,
            test/scheduler/runtime.test.ts, test/fold/stuck.test.ts, test/definition/l4-corpus.test.ts, AGENTS.md (the
            WHOLE file, D′), scripts/check-docs.mjs.
            Exceptions: E1 — granted by the maintainer 2026-10-17 (S-2, *"As recommended"*), applied minimally:
            E1 src/scheduler/runtime.ts :879-883 — the router's comment on a listener throw, corrected to what is true
            since W178 (a driver's listener discards a throw out of its failure path; what escapes a listener reaches
            `dispatchEvent`, an uncaught exception in node 24 and deno). DECLINED by the maintainer (S-2): the three
            assertion MESSAGES examples/l6.ts:1669, test/driver/seam-paths.test.ts:206, test/driver/result-schema.test.ts:460
            — left. Anything else outside the row is a stop-and-ask, never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q660-Q662 only if raised),
            doc/decisions/** (pointers only, if any), the plan's Record, README.md, this file.
Inputs:     P35 decision 4, stop-and-ask (j) as answered, facts 9, 10 and 11, prediction 1, sentences B′, C, D′, E and
            the two brief sentences; P34 retro (m), (o), (p) and section 4 (f); W174's conformity finding C5 (`takeStop`'s
            `finally`); W175's N5 / R14; ADR 0104, ADR 0105, ADR 0106; `RN-R31`, `RN-R33`, `RN-R35`, `OR-R10`.
Outputs:    (1) src: `Driver.cancel()` — the held tasks released before the `cancelRequested` element, the element in a
                `try`, every cancel and hand-off in its `finally`; `Driver.onEvent()` — a throw from the step's end
                (`leaveStep()`: a pause, an unpause or a stop taken there) caught and handed to `failRun`, so nothing
                leaves the listener. No new field, no new export, no surface change.
            (2) spec run-state v0.21, outcome-record v0.17, spec/README.md's two rows.
            (3) tests: test/driver/cancel.test.ts (L2: fact 9's three rows, mid-step, a second call — new cases),
                test/driver/pause.test.ts (L2 (j): a throw on `paused` and on `unpaused` taken from a scheduler event's
                step — halted and reported, nothing escaping; the driver-call road kept beside it), test/driver/stop.test.ts
                (L2 (j): a throw on `interrupted` taken from a scheduler event's step), test/scheduler/runtime.test.ts
                (the title), test/fold/stuck.test.ts and test/definition/l4-corpus.test.ts (`RN-R12`'s title; the
                per-suite counts the new cases move).
            (4) AGENTS.md: whatever sentence the change makes false, found by grep over the whole file (D′).
Depends on: nothing (P35's first item; P34 done, `d67138f`)
Blocks:     W179
Tests:      L2 — expected values hand-written from `RN-R31` and (j) and the flows' shapes, never from output:
            (o) over `test/driver/cancel.test.ts`'s fake (whose `cancel` of a RUNNING task never settles until the test
            says so): the CONTROL (nothing throws — `a`, `b` sent); a throw on `cancelRequested` AT REST — the throw at
            `cancel()`'s caller, `a` and `b` sent, `cancelling`, `cancelled` once both stop; the same on a PAUSED run
            with `a` settled and `a2` HELD — `a2` handed on, then cancelled, `paused` still true, `cancelled` once the
            last stops; MID-STEP (a cancel raised from a callback on a settlement's element, which then throws on the
            element) — the throw at the callback that called `cancel()`, every task in flight sent its cancel and every
            held task handed on and cancelled; a SECOND call after the throw appending nothing; each asserted on the
            log AND on the fake's `added` and `cancels`. (j) over the fakes of `pause.test.ts` and `stop.test.ts`, whose
            `emit` is a scheduler event's step: a throw on `paused`, `unpaused` and `interrupted`, each taken at the end
            of a SETTLEMENT's step — nothing thrown out of `emit`, `onRunFailure` called once with the consumer's error,
            the element then `halted` in the log, `hasFailed()` true, the fold `halted`; beside each the CONTROL with no
            throw (not halted) and the DRIVER-CALL road (the throw reaching `start()`'s / `pause()`'s caller, unchanged).
            (m) the three titles renamed, the two `RN-R12` titles together. Prediction 1 tested on the real tree with
            the src change alone (no test touched) and recorded. Each new assertion shown able to fail by ONE-clause
            mutations (sentence E) in the byte copy C:/tmp-w178/m.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. The row's clauses: L2 fact 9's three rows, and mid-step:
            after a throwing `cancelRequested` every task in flight is sent its cancel and every HELD task handed on and
            cancelled, the throw reaching the caller, the run `cancelled` once the last settles; L2 (j): a throw on
            `paused`, `unpaused` and `interrupted` taken from a scheduler event's step reaches `onRunFailure` and halts
            the run, nothing escaping the listener; the three titles renamed, the two `RN-R12` titles together.
Reserves:   Q660-Q662 (P35's per-item line); no ADR (ADR 0110 unused, (j) as answered)
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **An ask node** — W179-W182.
- **The L6 row** — none is owed: P35's exit artifact names no throwing callback. A real-scheduler PROBE is run here
  through `createRuntime` in node 24 and deno (fact 10's shape), and not checked in.
- **A `Driver` field** — none is added, so `DRIVER_FIELDS` (`test/driver/retention.test.ts`, `examples/l6.ts`) does not
  move; `examples/l6.ts` is not in the row.
- **Nothing else out of `Owns`** — every site this item makes false outside it is a stop-and-ask below.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w178/m`, each graded on the named suites' `FAIL` lines; then the readers; then `npm run gate:item`
once. Routing coverage: a nested fan-out (Q6), a branch routed away from its join (Q4), no matching decision edge (Q10),
a duplicate task id (Q13) — not applicable (no route moves); `user_action` (Q17) — not exercised by the new cases (a
parked task is sent nothing by a cancel, `RN-R31`'s existing case).

## What the declaration step measured

*Measured 2026-10-17. M1 in a BYTE COPY of `dd5821f` (`git archive` into `C:/tmp-w178/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0, deno 2.9.6, chromium; M2-M6 as the item was built.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 153 files; `check:spec` 7 / 75 / 142 rules; `check:docs` 40 `run` snippets; L1-L5 **69 files / 1877 cases** in node, deno and chromium; L6 **2711** assertions, 0 failed, in node and deno |
| M2 | **P35 prediction 1**, with the `src/` change ALONE on the real tree (no test touched), `node test/runner.ts` | **FALSIFIED in one case, and it is the defect's own test.** 1876 of 1877 green; RED: `test/driver/pause.test.ts` case 5 (W175), whose two MID-STEP rows raised the pause and the unpause on a SETTLEMENT's element and asserted the throw *"reaches the step's caller"* — the fake's `emit`, i.e. the scheduler's `dispatchEvent`: they asserted fact 10's escape. Rewritten onto a DRIVER CALL's step (`start()`, `resolve()`), where the throw still reaches the caller; the scheduler-event road is the new case 13. Beyond the titles and `LATE_SUITES`' one entry, three per-suite COUNTS moved too (`l4-corpus`: `RN-R31` 13 -> 15, `RN-R33` 16 -> 17, `RN-R35` 14 -> 15) — the prediction did not name them |
| M3 | the new (o) and (j) cases on TODAY's `src/` (the new test files copied into the M1 copy) | **all four RED in node and in deno** — (o) at rest: `cancels` `[]` where `[a, b]` is expected; (o) mid-step: `a2` never handed on; (j) pause and (j) stop: the consumer's throw left `emit` |
| M4 | **B′ / D′ — census sites**, each by its lane | `LATE_SUITES`: `RN-R12`'s entry renamed (with `test/fold/stuck.test.ts`, the same string); the three per-suite counts (M2). No `Driver` field (`DRIVER_FIELDS` unmoved), no export, no snippet (`RUN_FLOOR` 40 unmoved), no spec rule id; `spec/README.md`'s two rows and version columns |
| M5 | **now-false statements**, grepped over the tree but `dev-dist/`, `dist/`, `node_modules/` for *discard*, *listener throw*, *step's caller*, *for ever* | in `Owns` — rewritten: `src/driver/driver.ts` (`RunFailure`'s and `onRunFailure`'s docs, `onEventStep`'s boundary comment, `cancel()`'s step 4, `takeStop`'s and `takePause`'s *whoever is on the stack*), `spec/outcome-record.md` section 6 and `OR-R10`, `spec/run-state.md` `RN-R31`/`RN-R33`/`RN-R35`, `AGENTS.md` section 9 (two sentences, one `run` snippet's comment, one paragraph) and section 6 (one cancel-table row). Outside `Owns` — NOT edited, stop-and-ask S-2: `examples/l6.ts:1669` and `test/driver/seam-paths.test.ts:206` (assertion MESSAGES saying *dispatchEvent discards a listener throw*). History left: `doc/work-items/w3-*.md:279` |
| M6 | **a real-scheduler probe** — P35's own `probe-p.ts` and `probe-o.ts`, copied to `C:/tmp-w178/m/scratch-me/` and run against the built `src/` (not checked in) | **`probe-p`** (`x` -> `y` inline through `createRuntime`, `pause()` from `onFoldInput` on `x`'s settlement, the consumer throwing on `paused`): node 24.20.0 and deno 2.9.6 each **EXIT 0** — no handler: `paused` then `halted` in the log, `hasFailed()` true, `onRunFailure` `['Error']` once, `done` settled `halted`; with a global handler installed it is NEVER called; control `completed`. Fact 10 measured EXIT 1 without a handler. **`probe-o`**: both runtimes — at rest the throwing first `cancel()` sends `a`, `b`; on the paused run it hands `a2` on and sends `b`, `a2` (fact 9: none, and `a2` never) |

## The author's provocations (before the readers)

`C:/tmp-w178/mutate.mjs` in the byte copy `C:/tmp-w178/m`, synced with the real tree (`cmp` per changed file, `find -type
l` zero); each probe's anchors checked against the CURRENT text, the file restored from its first snapshot and its
SHA-256 compared after every probe and at the end; graded on the `FAIL` lines of the `RN-R31`, `RN-R33` and `RN-R35` L2
suites over `node test/runner.ts driver/`; a time-out graded NO VERDICT (none occurred). **Grader controls**: CONTROL
(no edit) clean; GRADER-CRASH (a syntax error) graded CRASH, not KILLED. **16 one-clause probes beside the two grader
controls: 15 KILLED, 1 SURVIVED (O7, declared equivalent before the run).**

| id | the ONE clause broken | verdict |
|---|---|---|
| O1 | the cancels and hand-offs NOT in a `finally` (the element's throw skips them — today's shape) | KILLED — both new (o) cases |
| O2 | the in-flight set read BEFORE the element (R1's alternative; two edits, ONE clause — the declaration alone is unused, the loop alone does not compile — declared compound per E, and neither half is a meaningful probe alone) | KILLED — the R1 row (a task the callback had settle is sent nothing) and an existing case |
| O3 | the held tasks not handed on in the `finally` | KILLED — (o) both cases and W175's cancel case |
| O4 | the hold not emptied before the element | KILLED |
| O5 | the released ids not marked `unhanded` | KILLED — by W175's case 7 only, not by a W178 case |
| O6 | the running tasks not cancelled in the `finally` | KILLED |
| **O7** | the inner `finally` that unmarks the released ids removed | **SURVIVED — EQUIVALENT, declared**: `handOn` unmarks each in its own `finally` (W175's P9, the same) |
| J1 | the step's end NOT inside the boundary — `leaveStep()` bare (today's tree) | KILLED — (j) pause and stop cases |
| J2 | the throw caught and DISCARDED, unreported | KILLED |
| J3 | the ONCE guard removed | KILLED — R2's row (the scheduler's throw reported twice) |
| J4 | the ONCE guard inverted | KILLED |
| J5 | halted without element or report (`failed = true` only) | KILLED |
| J6 | reported but NOT halted — (j)'s first alternative | KILLED |
| T1 | the stop's cancels not in a `finally` (W174 C5 undone) | KILLED — W174's case and the new (j) stop case |
| T2 | the unpause's hand-off not in a `finally` | KILLED — W175's case 5 and the new (j) case |
| M-T1 | `test/fold/stuck.test.ts`'s title reverted alone (`l4-corpus`'s left renamed) | KILLED — `L1 — every suite this tree declares actually RAN`, by name |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **The cancel's in-flight set is read AFTER the element, in the `finally`** — decision 4 says *read BEFORE*, copying `takeStop` | `takeStop` reads it before because the stop is DEAF and held, so the set cannot change across the element (W174 C5). A cancel's driver still HEARS: a callback on `cancelRequested` can have a task settle (a real scheduler's waiting-task `cancel` fires `task.cancelled` inside the call), and read before, that task — no longer in flight — would be sent a cancel `RN-R31` (4) does not send. What decision 4 is FOR — the sends survive the throw — holds either way. The HELD tasks are taken out before, as decision 4 says (held, the run adds nothing to the hold). A departure from decision 4's letter, so the readers may hold it to the letter: O2 is the probe that tells the two apart | `RN-R31` v0.21, `cancel()`'s comment; the R1 row in case 12 |
| **R2** | **Reported ONCE**: the boundary does not call `failRun` when the run is already halted | the scheduler's throw inside an unpause's hand-off is reported and rethrown by `drainHeld` (for a caller at rest); on a scheduler event's step it then reached the boundary and was reported a SECOND time (measured, `scratch-me/probe-double.ts`: `['Error','Error']`). The cost: a consumer throw at the end of a step whose run an earlier element already halted is not reported again (the run's halt was) | `OR-R10` v0.17, `onEvent`'s comment, case 13's R2 row |
| **R3** | **A stop whose `interrupted` element a callback throws on, taken at a scheduler event's step end, leaves the run HALTED and so NOT resumable** | (j) as answered — *halt the run* — and `RN-R8`: `halted` outranks `interrupted`; `RN-R23` refuses a halted checkpoint. The tasks are still cancelled and the promise settles | `RN-R33` v0.21, `AGENTS.md` section 9; the (j) stop case asserts the refusal |
| **R4** | `RN-R33`'s and `RN-R35`'s TEXT moved, though the plan's row says `spec/run-state.md (RN-R31)` | the brief allowed the cross-references; each said *the throw reaches the step's caller*, which on a scheduler event's step is now the boundary — leaving them would leave two now-false sentences in a file the row owns | v0.21's status line |
| **R5** | `test/scheduler/runtime.test.ts`'s title is not *"the nine outcomes"* | the block runs FIVE outcomes (`running`, `awaiting_action`, `completed`, `failed`, `stuck`) and never ran `halted`, so *six … four terminal* was already wrong by one; the new title says five of nine and names where the other four are asserted | the block's docblock |
| **R6** | `AGENTS.md`: section 6 gains ONE cancel-table row; section 9's *discards a listener throw* (prose and one `run` snippet's comment) corrected, and its *Reported, not thrown* paragraph gains the take road | D′: the WHOLE file owned; each is a sentence the change or fact 10 made false, or the one place a consumer meets the new behaviour. No snippet added or removed (`RUN_FLOOR` 40) | — |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-17 (*"As recommended"*): S-1 YES, S-2 as recommended (E1), S-3 YES

| | the question | recommended | the alternative |
|---|---|---|---|
| **S-1** | **A consumer `onFoldInput` that throws on the `halted` element itself still escapes the listener**, and `onRunFailure` is never called (`failRun` appends before it reports). Measured (`scratch-me/probe-halted.ts`, L2's fake): a consumer throwing on `paused` AND `halted` — `emit` throws `boom on halted`, `failures` `[]`. Pre-existing on EVERY `OR-R10` road from a scheduler event (`onEventStep`'s catch calls the same `failRun`), so not (j)'s three elements — but the same class, and on a real scheduler it ends the process (fact 10) | **Fix it in W178** (in `Owns`, small): `failRun` reports in a `finally` around its `halted` append, and the listener boundary discards a throw out of `failRun` itself after it has reported — one more L2 row | **Raise Q660** (owner P35 or P36, closes-when that row), and say in `AGENTS.md` section 9 that `onFoldInput` must not throw on `halted` |
| **S-2** | **Stale text OUTSIDE `Owns`** about a listener throw: the assertion MESSAGES `examples/l6.ts:1669` and `test/driver/seam-paths.test.ts:206` (*dispatchEvent discards a listener throw*) and `test/driver/result-schema.test.ts:460` (*dispatchEvent would discard it* — the conformity reader's G3), and the COMMENT `src/scheduler/runtime.ts:879-881` (*reached the scheduler's dispatchEvent, which reports it* — after fact 10 the process dies; and S-1's fix would leave it partly stale, G3) | **Leave the three messages**; **widen `Owns` by `src/scheduler/runtime.ts`'s comment**, one sentence — it is the code comment on the very road (j) closed | **Widen `Owns` by all four**, one phrase each; or leave all four |
| **S-3** | **ADR pointers** (record step, `doc/decisions/**`): ADR 0104 rule 2 (the cancel's sends now in a `finally`), ADR 0105 rule 4 and ADR 0106 rule 5 (*whoever is on the stack* — on a scheduler event's step, the boundary, `OR-R10` v0.17) | **One dated line under each, at the Record** — none is false, each is now incomplete | **None** — the specs carry it |

## Notes for later items

- **W179-W181 add owner and driver elements** (`asked`, an answer's `resolution`): any element a take or a scheduler
  event's step appends is now inside the boundary — a test of a throwing callback on a NEW element should assert the
  halt and the single report, beside the driver-call road.
- **The re-entrant double report on `onEventStep`'s road** (a consumer calling `resolve()` from a callback on a
  settlement's element, refused by a `failRun` + rethrow, then caught by `onEventStep`'s catch) is NOT changed by R2 —
  read from the code, not measured; a reader may want R2's guard there too. Not in (j)'s scope.
- `pause.test.ts` case 5's title now says *at rest and at the end of a DRIVER CALL's step*; its old mid-step rows are
  case 13's controls' counterpart.

## Readers — round 1 (2026-10-17), and what was acted on

*Both readers ran with fresh contexts, spec first; each reported and fixed nothing. The in-`Owns` findings below were
applied by the author at the coordinator's direction; S-1 and the S-2/S-3 extensions wait on the maintainer.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | **D1** — `OR-R10` v0.17 (`spec/outcome-record.md`) and `AGENTS.md` section 9 say a throw on ANY element a scheduler event's step appends is caught, reported and halts: false at the `halted` element itself (`failRun` appends before it reports, and neither boundary guards `failRun`), and a consumer `onRunFailure` that throws on the take road escapes too | DEFECT in the TEXT (the code is S-1's pre-existing hole) | **NOT YET** — S-1, the maintainer's; the fix design is below. If Q660 is chosen instead, `OR-R10` and `AGENTS.md` section 9 are NARROWED to exclude `halted` and a throwing `onRunFailure` |
| conformity | **G1** — `l4-corpus`'s three count MESSAGES still said *thirteen / sixteen / fourteen* and listed no W178 case | stale text (in `Owns`) | **FIXED** — *fifteen / seventeen / fifteen*, each W178 case named |
| conformity | **G2** — `test/scheduler/runtime.test.ts` W77 docblock, row III: *a throw from a listener being discarded* | stale text (in `Owns`) | **FIXED** — says what `dispatchEvent` does (fact 10) |
| conformity | **G3** — `test/driver/result-schema.test.ts:460` (*dispatchEvent would discard it*) and `src/scheduler/runtime.ts:879-881` (*reached the scheduler's dispatchEvent, which reports it*) | stale text OUT of `Owns` | **NOT edited** — added to S-2 |
| conformity | NOTES: R1 sound (from `cancelRequest` on, `shut()` holds every dispatch and `resolve()` is refused, so the set can only SHRINK across the element); a second `cancel()` from a callback ON the element double-sends (pre-existing, harmless: `cancelTask` keeps the first promise); R2's cost — a second error at a step's end on an already-halted run is dropped, and a pause AND a stop both throwing at one step's end report only the SECOND (the pause's nested `leaveStep` takes the stop in its `finally`, whose throw replaces the first); R3 conforms — but the ROAD ASYMMETRY is recorded for the retro: a take throwing on a DRIVER-CALL step throws to the caller WITHOUT halting, whereas `start()` halts on a throw on any other element of its step; (j) complete — no other take road escapes but D1's | notes | recorded here |
| adequacy | 29 one-clause probes, **26 KILLED**; O-c EQUIVALENT; M-d a cosmetic title no check reads (harmless). Verdict: ADEQUATE | — | — |
| adequacy | **Finding 1** — no RUNTIME-level test of either fix | gap (in `Owns`) | **FIXED** — a case in the W174 runtime suite (`test/scheduler/runtime.test.ts`), through `createRuntime` and its routing seam: (j) a pause from `onFoldInput` on a settlement, the callback throwing on `paused` — nothing escapes the routed event, `onRunFailure` once with the consumer's error, `done` `halted`, beside the control; (o) a callback throwing on `cancelRequested` — the throw at the caller, both cancels sent through the per-run view, `done` PENDING while one stops and `cancelled` after the last. No suite added (`LATE_SUITES` and the counts unmoved; that suite is not case-counted) |
| adequacy | **Finding 2** = G1 | — | FIXED (above) |
| adequacy | O-d and O-j KILLED only by W175's or older cases, not by a W178 case | note | O-j: **a W178 row added** — case 12's second call re-sends to `a` and `b` (the author's O8, re-run: now KILLED by that row too). O-d noted |

**The readers' overlap: ONE shared subject** — conformity G1 = adequacy finding 2 (`l4-corpus`'s stale count
messages). Every other finding was one reader's. *(P35's brief sentence; the ordinal is a retro's.)*

**The author's set, RE-RUN on the changed tree** (`C:/tmp-w178/mutate.mjs`, now grading the `W174` runtime suite as
well; copy re-synced, `cmp` clean, `find -type l` zero; every file restored, digest equal; CONTROL clean, GRADER-CRASH
CRASH): **17 one-clause probes, 16 KILLED, O7 SURVIVED (equivalent, declared)**. The new runtime case now also kills
O1, O6, J1, J2, J4, J5 and J6; **O8** (a second call re-sends nothing) is KILLED by case 12's new row and by W173's and
W175's cases.

### S-1's fix design — APPLIED on the maintainer's YES (3: discarded)

1. **`failRun` reports in a `finally` around its `halted` append** — so a consumer throw on `halted` can no longer
   suppress `onRunFailure`. The `RN-R24` replay guard reads `seq`, which stays `null` if the append threw: in a replay
   that case is not reported (the resume is being refused `diverged` below the stored events, or the element never
   landed).
2. **Both listener boundaries discard a throw OUT OF `failRun` itself, after it has reported** — `onEventStep`'s catch and
   `onEvent`'s `leaveStep` catch each wrap their `failRun(e)` in a `try` whose `catch` drops the throw: the run is
   halted, its element in the log, and nobody is on the stack to throw to.
3. **A consumer `onRunFailure` that THROWS on the take road**: with (2) it is discarded at the boundary — the run is
   already halted. *Recommended*: discard it, and say in `OR-R10` and `AGENTS.md` section 9 that `onFoldInput` on
   `halted` and `onRunFailure` must not throw — their throw is discarded. *Alternative*: report it through
   `console.error`, a side channel the library uses nowhere else.
4. On a DRIVER-CALL step (`start`'s, `drainHeld`'s, `resolve`'s catch) nothing changes: the caller is on the stack.
5. Tests: L2 rows at each boundary — a consumer throwing on `paused` AND `halted`, and on a refusal's settlement AND
   `halted`: nothing escapes, `onRunFailure` once — and one with `onRunFailure` throwing: nothing escapes, the run
   halted. `OR-R10` and `AGENTS.md` section 9 then stand as written (D1 resolved by the code, not the text).

## Record

*Filled 2026-10-17, after the readers' round and the maintainer's answers (*"As recommended"* to S-1, S-2 and S-3). Not
committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | lint 153 files; `check:spec` 7 / 75 / 142; `check:docs` 40 `run` snippets; L1-L5 69 files / 1881 cases in node, deno and chromium; L6 2711 assertions, 0 failed, node and deno (`C:/tmp-w178/gate2.log`) |
| L2 fact 9's three rows, and mid-step (o) | RAN — green | `test/driver/cancel.test.ts` cases 12 and 13: the control; a throw on `cancelRequested` at rest — the throw at the caller, `a` and `b` sent, `cancelling`, a second call appending nothing and re-sending, `cancelled` once both stop; the same on a PAUSED run with `a2` held — `a2` handed on then cancelled, `cancelled` once the last stops; mid-step from a settlement's element — caught by the calling callback, and uncaught (OR-R10's halt, the cancels still sent). Red on `dd5821f`'s `src/` in node and deno (M3) |
| L2 (j): `paused`, `unpaused`, `interrupted` from a scheduler event's step | RAN — green | `pause.test.ts` case 13, `stop.test.ts` case 15: nothing leaves the event, `onRunFailure` once with the consumer's error, `halted` after the element, the run `halted` (a stopped one refused `halted` on resume), each beside its control. Red on `dd5821f` (M3) |
| S-1 rows at both boundaries | RAN — green | `pause.test.ts` case 13: a throw on `paused` then on `halted` (the step's end), on a settlement's element then on `halted` (`onEventStep`), and a THROWING `onRunFailure` on each road — nothing escapes, reported once, `halted`; the driver-call road (`start()`) unchanged — reported once, the throw at the caller |
| through `createRuntime` (adequacy finding 1) | RAN — green | the W174 runtime suite's new case: (j) `done` `halted`, reported once, nothing escaping the routed event; (o) both cancels through the per-run view, `done` `cancelled` after the last |
| the three titles, the two `RN-R12` titles together | RAN — green | `stuck.test.ts` and `l4-corpus`'s `LATE_SUITES` (*… neither running, awaiting_action nor cancelling*); `runtime.test.ts` (*five of the nine outcomes …*, R5); M-T1 kills the pair split |
| conformity reader | RAN | D1 (text, = S-1, FIXED by the code), G1 and G2 FIXED, G3 to S-2; notes recorded (section *Readers — round 1*) |
| adequacy reader | RAN | 29 probes, 26 killed, O-c equivalent, M-d cosmetic; finding 1 FIXED, finding 2 = G1 FIXED; O-j given a W178 row |
| the author's probes, re-run after S-1 | RAN | 20 one-clause probes + 2 grader controls (CONTROL clean, GRADER-CRASH CRASH): **19 KILLED, O7 SURVIVED (equivalent, declared)**; S1a-S1c (the `finally`, each boundary's discard) KILLED; no NO VERDICT; every file restored, digest equal (`C:/tmp-w178/mut4.json`) |
| real-scheduler probe (M6) | RAN | node 24.20.0 and deno 2.9.6: EXIT 0 where fact 10 measured EXIT 1; `halted`, reported once |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w178/gateitem.log`) | the ladder: lint 153 files, `check:spec` 7 / 75 / 142, L1-L5 69 files / 1882 cases in node, deno and chromium, L6 2711 assertions 0 failed in node and deno; selftests 10/10 ok (912 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `cancel()`'s `finally` | yes | O1, O3, O6 — cases 12, 13 and the runtime case |
| (1) `onEvent()`'s step-end boundary | yes | J1-J6 — pause 13, stop 15, the runtime case |
| (1) S-1: `failRun` reports in a `finally`; both boundaries discard a throw out of it | yes | S1a, S1b, S1c — pause 13's S-1 rows |
| (2) run-state v0.21, outcome-record v0.17, `spec/README.md` | yes | `check:spec`, `check:markdown` (links to this file) |
| (3) the tests | yes | M3: four cases red on `dd5821f`; the probe table |
| (4) `AGENTS.md` | yes | section 6's row, section 9's corrected sentences and the two must-not-throw callbacks — prose, no snippet (`RUN_FLOOR` 40) |
| E1: `src/scheduler/runtime.ts`'s comment | yes | a comment; no check reads it |

**Prediction 1 — FALSIFIED in its *nothing else moves* half; its red/green half HOLDS.** The (o) and (j) cases are red
on today's tree in node and deno and green after (M3). But besides the titles and `LATE_SUITES`' one entry: (a) W175's
`pause.test.ts` case 5 went red — its two mid-step rows asserted fact 10's escape through the fake's `emit` (M2), and
were moved onto a driver call's step; (b) the three per-suite counts moved (13 -> 15, 16 -> 17, 14 -> 15) with their
messages (G1); (c) with S-1, W142's runtime case *a throw out of one driver's listener … still reaches the dispatcher*
lost its instrument — it used a consumer `onRunFailure` throwing, which S-1 now discards — and now makes the driver's
listener itself throw (the router's rule is the claim, unchanged).

**The readers' overlap: ONE shared subject** — conformity G1 = adequacy finding 2.

**The rulings (maintainer, 2026-10-17, *"As recommended"*).** S-1 YES — built (design 1-5; a throwing `onRunFailure`
DISCARDED, not `console.error`). S-2 — the three assertion MESSAGES (`examples/l6.ts:1669`,
`test/driver/seam-paths.test.ts:206`, `test/driver/result-schema.test.ts:460`) LEFT, the maintainer declining their
edit; `src/scheduler/runtime.ts:879-881`'s comment corrected as E1. S-3 YES — one dated line under ADR 0104 rule 2,
ADR 0105 rule 4 and ADR 0106 rule 5.

**What broke.** Fact 9's and fact 10's two defects (P34 retro (o), (p)) and, found by the conformity reader, the
pre-existing third of the same class: a consumer throw on `halted` itself, or from `onRunFailure`, escaped every listener
boundary with `onRunFailure` never called (D1 / S-1). W175's case 5 had pinned fact 10's escape as correct.

**What this taught.** *For the retro*: (1) **the road asymmetry** (conformity R3 note) — a take whose element a callback
throws on, on a DRIVER-CALL step, throws to the caller WITHOUT halting, while `start()` halts on a throw on any other
element of its step; (j) decided only the scheduler road. (2) A test asserting *the throw reaches the step's caller* on a
fake's `emit` asserts what the real `dispatchEvent` does with it — an escape; the fake's direct call hid it (M2).
(3) R2's cost: at one step's end a pause AND a stop both throwing report only the second.

**Questions raised.** None (Q660-Q662 SPENT, unissued). **Closed.** None.
