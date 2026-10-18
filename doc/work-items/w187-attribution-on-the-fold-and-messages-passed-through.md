# W187 — a task's ATTRIBUTION as fields: `runId`, `flowAttempt` and `attemptNumber` on the fold, and its messages and progress passed through

**Status:** done 2026-10-18 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, no BLOCKER; S-1 answered YES by the maintainer; no question raised; not committed. Earlier: readers round 1 RAN, no BLOCKER, A1-A3 and C1, C3-C8 acted on, A4-A7 declared, S-1 WITH THE MAINTAINER; earlier READY-FOR-READERS 2026-10-18 (`npm run gate` EXIT 0 on the real tree); declared 2026-10-18 on `99001d6` (W186 done); P36's FOURTH item: fyflow-app's #8, stop-and-asks (j), (k), (l) and (o) as answered, facts 2, 9 and 10; ADR 0114 (reserved for it); not committed
**Plan:** [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) — *which run and attempt does a
task's activity belong to, without parsing its id, and what of a run survives a crash and a resume?* — the fyflow-app ask
**#8** (attribution as fields, on progress events reaching the caller and on `RunState.nodes`). **As answered**: (j) `NodeRun`
gains three REQUIRED fields — `runId: string`, `flowAttempt: number` (the id's segment, `0` today) and `attemptNumber:
number | null` (the scheduler's, from the latest `attempted` element; `null` before the first attempt, on an ask, and on a
log written before 0.8.0) — BREAKING for a `NodeRun` literal, fold OUTPUT only; (k) `onTaskMessage` and `onTaskProgress`,
`DriverOptions` members in `StartOptions`' `Pick`, each a frozen copy carrying the attribution and the scheduler's fields,
subscribed only when given, this run's tasks only, nothing after a stop or a release, a throw on `onUnmintedTask`'s road;
(l) ADR 0088 rule 3 amended — the router reads `detail.id`, else `detail.taskId`; (o) one clause of `doc/concept.md`
section 3's events row; (p) each BREAKING surface stated where it changes.

```
Spec:       spec/run-state.md v0.26 -> v0.27: section 18 (NEW) — `RN-R41` (the attribution on a `nodes` entry) and `RN-R42`
            (the pass-through); section 2's example entry; `RN-R40`'s *the fold moves NOTHING for it* becomes *one cell*.
            spec/task-id.md v0.15 -> v0.16: section 1's `attempt` bullet, one sentence (the segment is `flowAttempt`). spec/README.md:
            the two rows and their version columns. Next free rule id `RN-R43`.
Owns:       from P36's W187 row, exactly: src/fold/run-state.ts, src/driver/driver.ts, src/driver/listener.ts (not moved: its
            `OR-R4` comment is still true — a pass-through is no record), src/scheduler/runtime.ts (the router, `StartOptions`),
            spec/run-state.md, spec/task-id.md, spec/README.md, test/fold/**, test/driver/**, test/scheduler/**,
            test/definition/l4-corpus.test.ts, examples/l6.ts and examples/run-flow.ts (the census sites, if moved —
            `DRIVER_FIELDS` and `NOT_RUN_STATE` NOT moved; examples/l6.ts's W182 `askEntry` helper moved, reading R4;
            examples/run-flow.ts not edited), AGENTS.md (the WHOLE file, D′), scripts/check-docs.mjs, doc/concept.md
            (section 3's events row, one clause), doc/decisions/0114-*.
            Exceptions: none declared. Anything else found to need an edit is a STOP-AND-ASK (S-n), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/** (ADR 0088 rule 3's dated pointer to ADR
            0114, P36 (l); and ADR 0113 rule 8's *the fold moves nothing for it at v0.26* — a dated pointer to `RN-R41`),
            doc/questions/** (Q690-Q693 only if raised), the plan's Record, README.md, this file.
            Overlap with W186 (serial, done): src/driver/driver.ts, src/fold/run-state.ts, src/scheduler/runtime.ts,
            spec/run-state.md, spec/task-id.md, spec/README.md, test/driver/**, test/fold/**, test/scheduler/**,
            test/definition/l4-corpus.test.ts, examples/l6.ts, AGENTS.md, scripts/check-docs.mjs. With W188 (next):
            examples/l6.ts.
Inputs:     P36 stop-and-asks (j), (k), (l), (o) and (p) as answered, facts 2, 9 and 10, decisions 5 and 8, prediction 4, the
            census sites D′ names for this row (the `StartOptions` binding test, the router, `RUN_FLOOR`, `LATE_SUITES`, the
            premises *the library reads neither* and *none subscribed yet*), sentences B′, C, D′, E and the two brief
            sentences; W184-W186's Records (a halt lands at the element thrown on; a sweep asserts what follows; a copy claim
            read on the copy itself both ways; an inline pool fires `task.running` inside `addTask`; a new
            `DriverOptions`/`StartOptions` member moves the binding count, the observer map and `RESUME_OMITS`); the
            scheduler's own `AGENTS.md` at the pin (§6's `task.message` and `task.progress` rows, *Subscribe before adding
            tasks*, `emit` *delivers asynchronously*, the `workerType` warning); ADR 0007, ADR 0088, ADR 0091, `OR-R7`,
            `OR-R10`, `RN-R33`, `RN-R40`.
Outputs:    (1) src/fold/run-state.ts: `NodeRun` gains REQUIRED `runId`, `flowAttempt`, `attemptNumber` (BREAKING); the
                `dispatched` and `asked` arms set them from the id (`attemptNumber` null); the `attempted` arm sets the
                task's `attemptNumber` (a task not in `nodes`: the state it was handed); a settlement and a resolution keep
                the entry's number; the `attempted` kind's doc.
            (2) src/driver/driver.ts: `TaskAttribution`, `TaskMessage`, `TaskProgress` (exported from the root by its
                `export *`); `DriverOptions.onTaskMessage` / `onTaskProgress`; `PASS_THROUGH` — subscribed only for a
                callback given, through `onEvent`; `heardPassThrough` — the id by `taskId` (message) or `id` (progress), own
                dispatched tasks only, every field copied and the copy frozen; the module-private `frozenCopy`.
            (3) src/scheduler/runtime.ts: `StartOptions`' `Pick` +2 (kept by `ResumeOptions`, reading R1); `openRun`'s two
                conditional spreads; the router reads `detail.id`, else `detail.taskId` (ADR 0088 rule 3 amended).
            (4) spec run-state v0.27 (section 18, `RN-R41`, `RN-R42`), task-id v0.16, spec/README.md's two rows.
            (5) tests: test/fold/attribution.test.ts (L1/L3, NEW, 8 cases); test/driver/pass-through.test.ts (L2, NEW, 9);
                test/scheduler/runtime.test.ts — a W187 suite (3, through `createRuntime`), two observers (4 cases: start and
                resume), the binding count 21 -> 23, `seams()`'s `emit`; test/fold/attempted.test.ts — its two v0.26 claims
                re-written to v0.27 and its suite RENAMED (reading R5); the NodeRun-shaped expected values in six suites
                (M2); l4-corpus's census (+3, one renamed) and a per-suite count case.
            (6) examples/l6.ts: the W182 block's `askEntry` (reading R4).
            (7) AGENTS.md: section 8's new subsection *Whose task it is* with one `run` snippet and the BREAKING paragraph;
                section 9 (the pass-through's throw), section 10's snippet comment (twenty-three), section 12's snippet
                comment (what the driver subscribes), section 13 (*the library reads neither*), section 18 (*moves nothing in
                run state*, and its snippet's assertion); `RUN_FLOOR` 46 -> 47.
            (8) doc/concept.md section 3's events row, one clause (+63 bytes of 636 headroom).
            (9) doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md.
Depends on: W186 (done, `99001d6`)
Blocks:     W188
Tests:      L1/L3, expected values hand-written from (j), `RN-R41` and each id's segments, never from output: a dispatched task
            at two run ids and two flow-level segments (0 and 1), `attemptNumber` null; 1, then 2 after a retry, kept through
            the settlement; after a resume, 3; an ask parked and answered, null; a parked task's resolution keeping 2; a log
            with no `attempted` element, null whatever the records' `attempts`; a fan-out; L3 folded twice and every prefix.
            L2 over a double firing the scheduler's two shapes as measured (M3: `taskId`, no `id`; the task spread flat):
            every field, `dropped`/`error` only when carried, none of the task's own; another run's, an unminted, an
            undispatched, a malformed and a missing id dropped and reported nowhere, beside the control deliveries; the
            subscription list with neither, either and both, and an event nobody subscribed reaching no listener; the frozen
            copy read on the copy both ways, an uncloneable value handed on undefined; nothing after a stop beside the control
            before it; a throw from each reported once and halting, a halted run still delivering, the dispatch hold; the
            fold-input sequence the same with and without. L1 through `createRuntime`: two runs on one runtime each HANDED
            only its own task's events (the instrument at the driver's entry), the broadcast control; a run passing neither
            never handed one and the scheduler not subscribed; nothing after the release. The observer map's two members on
            start and resume. RED on `99001d6`'s `src/` where a behaviour is claimed (M4). A real-scheduler probe (M7), not
            checked in. One-clause mutations (sentence E) in the byte copy C:/tmp-w187/m, graded on the named suites'
            `FAIL` lines (L0 on `tsc`), grader controls (clean, crash); a time-out is NO VERDICT.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author; then
            `npm run gate:item` ONCE on the final tree. The row's clauses: L1 `NodeRun`'s three fields over hand-written logs
            — before the first attempt (`null`), after a retry, after a resume, an ask (`null`), a pre-0.8.0 log (`null`); L2
            `onTaskMessage` and `onTaskProgress` over a double firing `task.message` and `task.progress` — every field, frozen,
            only this run's tasks, NO subscription without the callback, nothing after a stop, a throw halting the run; L1
            through `createRuntime`: two runs on ONE runtime, each hearing only its own messages, and the router's delivery
            count linear; B′'s `check:budget:selftest`.
Reserves:   Q690-Q693 (P36's per-item line); ADR 0114 (P36 decision 9)
```

## Scope

**In** — Outputs (1)-(9).

**Out** — named rather than left implicit, with where it goes instead

- **The exit artifact on real workers** — W188 (P36 exit clauses (1)-(2)); M7's probe is their shape, run here and not
  checked in. No L6 assertion or run is ADDED here (`X10` unmoved).
- **A pool's `worker.message`** ((m)) and **`task.retrying`** ((n)) — out.
- **`src/driver/ids.ts`'s `TaskIdParts.attempt` comment** — named by P36's premise list for *W186-W187*; read and still
  TRUE (*not the scheduler's `attempts`*), and outside this row's `Owns`: not edited.
- **`spec/outcome-record.md`** — not in the row: `OR-R4` (*`task.progress` produces no record*) and `OR-R10` hold unchanged
  (a pass-through is no record, and its throw is a scheduler event step's — M3).

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `check:docs:selftest` (B′: a snippet added)
and `check:budget:selftest` (B′: an always-read document's size moved); the author's ONE-clause provocations in the byte copy
`C:/tmp-w187/m`; then the readers; then `npm run gate:item` once. Routing coverage: a nested fan-out (Q6), no matching
decision edge (Q10), a branch routed away from its join (Q4) — not applicable: no routing rule moves and a pass-through
routes nothing (L2 *never a fold input*); `user_action` (Q17) — covered at L1: a task out of retries parks with its attempt
number and its resolution keeps it; a duplicate task id (Q13) — not applicable: no id is minted, and `flowAttempt` reads the
segment (Q16's flow half mints nothing).

## What the declaration step measured

*Measured 2026-10-18 in a BYTE COPY of `99001d6` (`git archive` into `C:/tmp-w187/m`, `node_modules` copied, never linked;
`find -type l` zero), node 24.20.0, deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node test/runner.ts` EXIT 0: 78 files / 2022 cases |
| M2 | **P36 prediction 4**: the `src/` change ALONE (no test touched) | **L0**: `typecheck:tests` 3 errors, all one site — `test/fold/fold-rules.test.ts`'s `satisfies RunState` literal (`TS2739`, three entries). **L1-L5: 12 cases RED**: the three binding cases (`ORPHAN COUNT` 21 -> 23, the observer membership, the resume `Omit` membership) and **NINE whose expected value is a `NodeRun`-shaped literal NOT typed as one** — `test/fold/asked.test.ts` 2, `test/fold/cancelled.test.ts` 1, `test/fold/fold-rules.test.ts` 1 (the L0 site), `test/fold/attempted.test.ts` 2 (W186's *moves NOTHING* — the claim (j) falsifies, reading R5), `test/driver/ask.test.ts` 2, `test/driver/ask-control.test.ts` 1. **No fold-input sequence assertion moved.** **`check:docs`: EXIT 0, unmoved** — no `AGENTS.md` snippet builds a `NodeRun` literal. **L6: 5 of 2743 RED**, all W182's exit block, through one helper (`askEntry`: (1), (2) ×2, (3), (5)) — reading R4 |
| M3 | **where the two events arrive, at the pin, inline and threaded** — `scratch-w187/probe-sync.ts`, a real `FyflowScheduler`, a worker calling `sendProgress` and `emit` at the TOP of `run()` | node and deno byte-identical: on an INLINE pool `task.running` fires inside `addTask` (W186's M3) but the worker's body runs AFTER `addTask` returns — the synchronous `sendProgress` arrives after `add end`; `task.message` always later (the scheduler batches it). **So neither event arrives on a driver call's own step**: `OR-R10` on a scheduler event's step is the whole of the throw rule — *no conflict with W184's rule* (the brief's check). Detail keys as P36 fact 2 measured: `task.message` `attemptNumber, data, name, seq, taskId, timestamp, workerId` (no `id`); `task.progress` the task flat (`id`, `attemptNumber`, …) plus `progress, message, details, workerId, workerType` (`'inline'`/`'thread'`), `timestamp` |
| M4 | the new and moved suites against `99001d6`'s `src/` (written from (j)-(l) before any run; four `src/` files swapped and restored, SHA-256 equal) | `attribution.test.ts`: **6 of 8 RED** — GREEN: L3 and the membership (neither claims a behaviour). `pass-through.test.ts`: **8 of 9 RED** (GREEN: the membership). `attempted.test.ts`: its two re-written cases RED, L3 and membership green. `runtime.test.ts`: **10 RED** — the three binding cases, the four observer cases and W187's three |
| M5 | **B′ / D′ — the census sites**, each by its lane | the binding count 21 -> 23 (one pin, moved deliberately); the observer map +2, so +4 registered cases (start and resume each); `RESUME_OMITS` unmoved (reading R1); `RUN_FLOOR` 46 -> 47 (`check:docs`: 47 `run` / 6 `check`); `LATE_SUITES` +3 and one RENAMED (W186's fold suite) and a per-suite count case (8, 9, 3); `DRIVER_FIELDS` and `NOT_RUN_STATE` UNMOVED (no `Driver` instance field: `heardPassThrough` reads `dispatched` and `opts`); the subscription counts in `cancelled.test.ts` and `runtime.test.ts` UNMOVED (five: no test there passes a pass-through); `X10` unmoved (2743 / 203); spec versions run-state v0.27, task-id v0.16 and their two `spec/README.md` rows; next free rule id `RN-R43`; `check:budget` — `doc/concept.md` +63 bytes of its 636 headroom. Node: **80 files / 2047 cases** (+2 files, +25 cases) |
| M6 | **now-false statements** — `git grep` over the tree but `dev-dist/` and `node_modules/` for each changed name (`NodeRun`, `attemptNumber`, `flowAttempt`, `onTaskMessage`, `onTaskProgress`, `task.message`, `task.progress`, `detail.id`, `StartOptions`, `twenty-one`) and each PREMISE (*the library reads neither*, *none subscribed yet*, *the fold moves nothing for it*, *`task.progress` and `task.message` are not heard*, *read for `detail.id` and nothing else*, *the driver subscribes to five*) | rewritten in `Owns`: `SUBSCRIBED_EVENTS`' doc (src/driver/driver.ts); the `attempted` kind's doc and its arm (src/fold/run-state.ts); the router's doc (src/scheduler/runtime.ts); `RN-R40`'s fold sentence and its test sentence (spec/run-state.md); task-id section 1; AGENTS.md sections 9, 10, 12, 13 and 18; doc/concept.md section 3's row; W186's fold suite (reading R5). **Outside `Owns`, record-step files**: ADR 0088 rule 3 and ADR 0113 rule 8 — a dated pointer each, at the record step. **Still true, left**: `src/driver/listener.ts`'s `OR-R4` comment (*`task.progress` is not recorded at all*); `spec/outcome-record.md` `OR-R4`; `src/driver/ids.ts`'s `TaskIdParts.attempt` (Out); runtime.ts's *`onHeader` is the TWENTY-FIRST member* (history); AGENTS.md section 12's *the driver subscribes to five* (that snippet passes no pass-through — a parenthesis added); `doc/concept.md` line 79 (lists `task.progress`, says nothing of subscription) |
| M7 | **a real-scheduler probe — P36 exit clause (1)-(2)'s shape** — `scratch-w187/probe-runtime.ts` + `emit-worker.ts`, `createRuntime` over a real `FyflowScheduler`, a pool of EACH mode, three runs on one runtime; not checked in | node 24.20.0 and deno 2.9.6 EXIT 0, **the same JSON byte for byte**: run `pa` (first attempt fails, retried) heard its four messages under `#1` seq 0,1 and `#2` seq 0,1 and two progress reports `#1`, `#2`, every one `runId pa`, `nodeId work`, `branchPath -`, `flowAttempt 0`, frozen, ten progress keys; run `pb` its own three and nothing of `pa`'s; run `pc` (no callback) completed; `pa`'s entry `["pa", 0, 2, "done"]`, `pb`'s `["pb", 0, 1, "done"]`; no fold input but `dispatched`, `attempted`, `outcome`, `pathEnded` — inline and threaded alike |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **`ResumeOptions` KEEPS `onTaskMessage` and `onTaskProgress`** — `Omit<StartOptions, 'runId' \| 'onHeader'>` unchanged | (k) puts both in the `Pick`; (d) omitted `onHeader` for a stated reason (*the caller holds the header*) that does not apply here — a resumed run's re-dispatched tasks emit as a started run's do, and the app's #8 needs their messages most after a resume. Omitting would be a decision; keeping is the type's default | `StartOptions`' doc; `RN-R42`; ADR 0114 rule 3; the resume observer cases. **S-1 asks the coordinator to confirm** |
| **R2** | **A HALTED run still delivers; a throw on a halted run is discarded** | (k) lists *nothing after a stop or a release*, not a halt; `OR-R10` halts routing only and the driver is not deaf (W186's attempts are recorded after a halt for the same reason: the tasks still run); a second throw finds the run halted and `haltOnce` reports nothing — *reported once* | `onTaskMessage`'s doc; `RN-R42`; L2 throw case |
| **R3** | **A value `structuredClone` refuses is handed on `undefined`** | (k) says *copied, frozen*; an inline worker's progress `details` is the worker's own object (no thread boundary cloned it) and may hold a function. Halting the run would break *a message never stops a run by existing*; aliasing would break the copy. The scheduler's own treatment of an uncloneable `emit` is `data: undefined` | `frozenCopy`'s doc; `RN-R42`; ADR 0114 rule 9; L2 frozen case |
| **R4** | **`examples/l6.ts`'s W182 `askEntry` helper is edited beyond the row's *(the census sites, if moved)*** | M2: five L6 assertions compare a `nodes` entry through that one helper; (j) moves the entry's shape. W186's R4 precedent (*the same file, a clause the change itself falsifies*) — stated, not asked | the helper's comment |
| **R5** | **W186's fold suite is RE-WRITTEN and RENAMED**: *moves NOTHING in run state* -> *moves ONE cell — its task's attemptNumber* | (j) makes the old claim false by design; the suite now holds every other cell equal at every prefix and the one cell to the latest element's number, hand-written | test/fold/attempted.test.ts's header; l4-corpus's census |
| **R6** | **A pass-through's `attemptNumber` is the EVENT's own** (`null` where it carries no positive integer), never the driver's `lastAttempt` | (k) names *the scheduler's own fields*; both events carry the scheduler's number for the attempt that emitted (§6). `lastAttempt` would mis-attribute a message from an attempt the driver has not yet appended (inline: attempts are appended at the step's end) | `TaskAttribution`'s doc; L2 message case (#2 where no attempt was recorded) |

## Predictions, and what happened

| | prediction (at declaration) | outcome |
|---|---|---|
| 1 | **P36 prediction 4**: *W187 moves no fold input; every `NodeRun` literal — in `test/**` and in `AGENTS.md`'s snippets — fails L0 until it carries the three fields, and nothing else moves at L1-L5* | **PARTLY REFUTED** (M2). *Moves no fold input*: HOLDS — no sequence assertion moved at L1-L6, and the L2 case holds the sequence equal with and without both callbacks. *Every `NodeRun` literal fails L0*: only the TYPED one does (one site, three entries); NINE expected values are `NodeRun`-shaped literals typed as nothing, so they fail at L1/L2 instead — and five L6 assertions through one helper; `AGENTS.md` has NO such literal (`check:docs` unmoved). *Nothing else at L1-L5*: false by the three binding cases, which D′ forecast for this row |
| 2 | census: binding count +2, observer map +2, `RUN_FLOOR` +1, `LATE_SUITES` +3, two rule ids (`RN-R41`, `RN-R42`), no `X10`, no `DRIVER_FIELDS` | HOLDS (M5), with one suite RENAMED (R5) |

## The author's provocations (before the readers)

`C:/tmp-w187/mutate.mjs` in the byte copy `C:/tmp-w187/m`; each anchor checked to occur once in the CURRENT text, every file
restored from its FIRST snapshot and its SHA-256 compared after every probe and at the end; graded on the `FAIL` lines of
`node test/runner.ts` for `fold/attribution`, `fold/attempted`, `driver/pass-through` and `scheduler/runtime` (P31 on
`tsc -p tsconfig.json`, L0); a time-out NO VERDICT; an import failure CRASH. **Grader controls**: CONTROL must grade CLEAN,
GRADER-CRASH must grade CRASH. *(The first pass graded GRADER-CRASH as KILLED — the runner prints an import failure as a FAIL
line — and was stopped; the grader now reads an import failure as CRASH, and the set was re-run whole.)*

**Before the readers: 29 one-clause probes + 2 grader controls: 28 KILLED, 1 SURVIVED (P15, a declared equivalent)** (`C:/tmp-w187/mut.log`, `mut.json`). **Re-run after acting on the readers, their survivors re-cut as one clause each and added (R1-R4, R6, R8, R9, R11 — reconstructed from the adequacy reader's descriptions): 37 probes + 2 grader controls: 32 KILLED, 5 SURVIVED (P15, R2, R8, R9, R11 — each a declared equivalent, below)**, CONTROL CLEAN, GRADER-CRASH CRASH, no NO VERDICT, no ABORTED; every file restored, digests equal (`C:/tmp-w187/mut2.log`, `mut2.json`). The table is the re-run. P10 is not a probe: `flowAttempt` on a resolution (`existing?.flowAttempt ?? attempt`) cannot differ from the segment on any id the fold accepts — named, not counted.

| id | the ONE clause broken | verdict |
|---|---|---|
| CONTROL | — | CLEAN — the grader`s clean control |
| GRADER-CRASH | — | CRASH — the grader`s crash control (an import failure) |
| P1 | RUNID FROM ID | KILLED — 1 case(s) in `fold/attribution` |
| P2 | FLOWATTEMPT FROM SEGMENT | KILLED — 1 case(s) in `fold/attribution` |
| P3 | NULL BEFORE THE FIRST ATTEMPT | KILLED — 4 case(s) in `fold/attribution`, `fold/attempted` |
| P4 | ATTEMPTED SETS THE CELL | KILLED — 6 case(s) in `fold/attribution`, `fold/attempted` |
| P5 | ATTEMPTED FOR AN ABSENT TASK MOVES NOTHING | KILLED — 1 case(s) in `fold/attempted` |
| P6 | A SETTLEMENT KEEPS IT | KILLED — 3 case(s) in `fold/attribution`, `fold/attempted` |
| P7 | NEVER FROM attempts | KILLED — 3 case(s) in `fold/attribution`, `fold/attempted` |
| P8 | A RESOLUTION KEEPS IT | KILLED — 1 case(s) in `fold/attribution` |
| P9 | AN ASK IS NULL | KILLED — 1 case(s) in `fold/attribution` |
| P11 | SUBSCRIBED ONLY WHEN GIVEN | KILLED — 5 case(s) in `driver/pass-through`, `scheduler/runtime` |
| P12 | MESSAGE SUBSCRIBED | KILLED — 12 case(s) in `driver/pass-through`, `scheduler/runtime` |
| P13 | A MESSAGE IS KEYED taskId | KILLED — 11 case(s) in `driver/pass-through`, `scheduler/runtime` |
| P14 | A PROGRESS IS KEYED id | KILLED — 9 case(s) in `driver/pass-through`, `scheduler/runtime` |
| P15 | OWN RUN | SURVIVED — **an EQUIVALENT mutant, declared by id**: `dispatched` holds only ids this driver minted under its own run id, so the dispatched test alone drops every foreign id (W186 P3`s shape); on a runtime the router drops them first. Kept as `ID-R4`'s tier order |
| P16 | DISPATCHED | KILLED — 1 case(s) in `driver/pass-through` |
| P17 | THE EVENT`S ATTEMPT NUMBER | KILLED — 2 case(s) in `driver/pass-through` |
| P18 | A MESSAGE FROZEN | KILLED — 1 case(s) in `driver/pass-through` |
| P19 | DATA COPIED | KILLED — 1 case(s) in `driver/pass-through` |
| P20 | DETAILS COPIED | KILLED — 1 case(s) in `driver/pass-through` |
| P21 | UNCLONEABLE IS UNDEFINED | KILLED — 1 case(s) in `driver/pass-through` |
| P22 | NONE OF THE TASK`S FIELDS | KILLED — 1 case(s) in `driver/pass-through` |
| P23 | DROPPED ONLY WHEN CARRIED | KILLED — 1 case(s) in `driver/pass-through` |
| P24 | NOTHING ONCE DEAF | KILLED — 1 case(s) in `driver/pass-through` |
| P25 | A THROW HALTS | KILLED — 1 case(s) in `driver/pass-through` |
| P26 | A HALTED RUN STILL DELIVERS | KILLED — 1 case(s) in `driver/pass-through` |
| P27 | NEVER A FOLD INPUT | KILLED — 1 case(s) in `driver/pass-through` |
| R1 | BRANCH PATH FROM THE ID — the adequacy reader's A1 (constant `'-'`) | KILLED — L2 message case, its fan-out clause |
| R3 | DATA A DEEP COPY — A2 (a shallow `Object.freeze({ ...v })`) | KILLED — L2 frozen case, its nested clauses |
| R4 | DETAILS A DEEP COPY — A2, the progress half | KILLED — L2 frozen case, its nested clauses |
| R6 | THE EMITTING ATTEMPT, NOT THE LAST — A3 (`lastAttempt` preferred) | KILLED — L2 message case, its late-message clause |
| R2 | `flowAttempt` CONSTANT 0 — A4 | SURVIVED — **a declared EQUIVALENT**: every id a driver dispatches is minted with segment `0` (`buildTaskId`'s three sites; Q16's flow half mints nothing), and `dispatched` admits no other, so no reachable delivery differs. The fold's `flowAttempt` IS killed at segment 1 (P2), where a hand-written log can reach it |
| R8 | ROUTER `taskId` FIRST — A5 | SURVIVED — **a declared EQUIVALENT**: no scheduler event carries both a string `id` and a string `taskId` (a lifecycle detail is the task, which has no `taskId`; a message has no `id`; a progress detail is the task spread flat), so the order is never consulted |
| R9 | FOLD `Math.max` — A6 | SURVIVED — **a declared EQUIVALENT on every driver-written log**: the driver appends `attempted` only when the number RISES, and the replay refuses a stored one that does not (`RN-R19`, W186's A3) — latest IS highest. Only a hand-written log that falls could tell them apart, and `RN-R41` reads *the latest* |
| R11 | PROGRESS `message` UNCOPIED — A7 | SURVIVED — **a declared EQUIVALENT**: the scheduler types it `string` (`sendProgress(progress, message?: string, …)`), a primitive that `frozenCopy` returns as it is |
| P28 | ROUTER READS taskId | KILLED — 2 case(s) in `scheduler/runtime` |
| P29 | START FORWARDS onTaskMessage | KILLED — 6 case(s) in `scheduler/runtime` |
| P30 | RESUME KEEPS onTaskProgress | KILLED — 1 case(s) in `scheduler/runtime` |
| P31 | NodeRun.runId TYPED (L0) | KILLED — L0, `tsc -p tsconfig.json` (`TS2322`/`TS2353`: the fold's own entries carry `runId`) |

## Stop-and-asks

**S-1 — does `ResumeOptions` carry `onTaskMessage` and `onTaskProgress`?** (the brief's check; the plan does not settle it.)
**Recommended, and built: YES** — reading R1: a resumed run's tasks emit as a started run's do, (d)'s reason for omitting
`onHeader` does not apply, and keeping them is the type's default (no edit). **The alternative**: add both to the `Omit`
(`RESUME_OMITS` +2, the two resume observer cases go) — a resumed run then reports nothing a worker emits unless its owner
subscribes the scheduler itself, which is #8's stopgap again. Nothing else is asked: the brief's OR-R10 check found no
conflict (M3).

**S-1 ANSWERED by the maintainer, 2026-10-18: *"As recommended"* — YES.** `ResumeOptions` keeps `onTaskMessage` and
`onTaskProgress`; reading R1 is the decision, and the four sites the conformity reader's C2 named (ADR 0114 rule 3, `RN-R42`,
AGENTS.md section 8, `StartOptions`' doc) stand as written. No edit followed from it.

## Readers — round 1 (2026-10-18), and what was acted on

*Both readers ran with fresh contexts, spec first; each reported and fixed nothing. No BLOCKER. S-1 is with the maintainer.*

| reader | finding | kind | acted on |
|---|---|---|---|
| adequacy | **A1 SHOULD** — every pass-through case used a task outside any region; `branchPath` constant `'-'` survived | test | **FIXED** — the message case adds an entry fan-out: `a`'s message on `'0'`, `b`'s progress on `'1'`; R1 KILLED |
| adequacy | **A2 SHOULD** — only a top-level field was mutated; a shallow copy survived, for `data` and `details` | test | **FIXED** — the frozen case mutates a NESTED field both ways (source -> copy, copy -> source); R3, R4 KILLED |
| adequacy | **A3 SHOULD** — R6 never arranged: a message of attempt 1 after attempt 2's `task.running` | test + doc | **FIXED** — the message case arranges it (message and progress of #1 after #2 recorded: both read 1, the fold's entry 2); AGENTS.md section 8's snippet now shows the late message too; R6 KILLED |
| adequacy | **A4-A7 NIT** — R2, R8, R9, R11 equivalent in practice | record | **DECLARED** — each by id with its reason in the table above, and RUN |
| adequacy | **A8 NIT** — no real-scheduler test of the shapes | record | **NOTED** — W188's L6 (below) |
| conformity | **C1 SHOULD** — AGENTS.md section 8's *never even handed to this run's driver* true only of ANOTHER run's task | text | **FIXED** — scoped: an unparseable id reaches every driver that asked, an undispatched task of this run reaches this run's driver; each drops it |
| conformity | **C2 SHOULD** — S-1 stated as settled in four places | record | **LEFT** for S-1's answer (Notes) |
| conformity | **C3 SHOULD** — `undefined` for an uncloneable value carries no marker; `TaskMessage.data`'s *error is then set* holds only for the scheduler's clone | text | **FIXED as text** — `RN-R42`, ADR 0114 rule 9, AGENTS.md section 8's table and `TaskMessage.data`/`TaskProgress.details` docs say the consumer cannot tell it from a value never given and when `error` is set. **A marker is NOT added**: it changes the shape (k) fixed — not asked as a stop-and-ask, since the doc statement closes the finding; the coordinator may raise it if a marker is wanted |
| conformity | **C4 NIT** — a delivery after a halt vs `OR-R10`'s *nothing … emitted* | text | **FIXED** — one clause in `RN-R42`: a delivery is no element. `OR-R10` not edited (outside `Owns`) |
| conformity | **C5 NIT** — the event's `attemptNumber` vs the fold's | text | **FIXED** — `RN-R42` says when they agree (during the attempt, after a resume too) and when they differ (a late-batched message — A3's case) |
| conformity | **C6 NIT** — section 9's *never inside your call* rests on the code too | text | **FIXED** — the guarantee is the driver's listener boundary, the timing besides |
| conformity | **C7 NIT** — section 12's *key it on `detail.id`* | text | **FIXED** — *or `detail.taskId` for `task.message`* |
| conformity | **C8 NIT** — ADR 0114 rule 8's *else* looser than the code | text | **FIXED** — *`detail.id` when it is a string, else `detail.taskId`*, and section 18's intro the same |

**The readers' overlap: ONE shared subject** — R6 / the event's `attemptNumber` against the fold's (A3 by mutation, C5 by reading). Every other finding was one reader's alone. *(P36's brief sentence; the ordinal is a retro's.)*

## Notes for the plan's Record

- **P36 prediction 4 is partly refuted** (above): a `NodeRun` literal typed as nothing fails at L1/L2, not L0.
- At the record step: ADR 0088 rule 3 gains a dated pointer to ADR 0114 (P36 (l)); ADR 0113 rule 8 (*the fold moves nothing
  for it at v0.26*) a dated pointer to `RN-R41`.
- M7's probe (`C:/tmp-w187/m/scratch-w187/`) is W188's exit clauses (1)-(2)'s shape, left in place.
- This item's Record states its readers' overlap.
- **A8** (adequacy NIT): no checked-in real-scheduler test of the pass-through shapes here — M7's probe only; their executable home is **W188's L6 exit clauses (1)-(2)**.
- **C2** (conformity): S-1 is written as settled in ADR 0114 rule 3, `RN-R42` (*kept by its `ResumeOptions`*), AGENTS.md section 8 (*and `runtime.resume`'s*) and `StartOptions`' doc in runtime.ts — they stand on a YES; on a NO they move with `RESUME_OMITS` +2 and the two resume observer cases.
- `npm run gate` on the real tree: **EXIT 0** (`C:/tmp-w187/gate.log`) — lint, typecheck, every check (`check:docs` 47 `run` / 6 `check`), L1-L5 80 files / 2047 cases in node, deno and chromium, L6 2743 assertions / 203 runs, 0 failed, node 24.20.0 and deno 2.9.6. `check:docs:selftest` EXIT 0, 24/24 noticed; `check:budget:selftest` EXIT 0 (`C:/tmp-w187/docs-self.log`, `C:/tmp-w187/budget-self.log`).

## Record

*Filled 2026-10-18, after the readers' round and S-1's answer. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | `C:/tmp-w187/gate.log`: lint; typecheck; every check, `check:docs` 47 `run` / 6 `check`; L1-L5 80 files / 2047 cases in node, deno and chromium; L6 2743 assertions / 203 runs, 0 failed, node 24.20.0 and deno 2.9.6 |
| `check:docs:selftest` (B′: a snippet added) | RAN — EXIT 0, 24/24 noticed | `C:/tmp-w187/docs-self.log` |
| `check:budget:selftest` (B′: `doc/concept.md`'s size moved, +63 bytes) | RAN — EXIT 0 | `C:/tmp-w187/budget-self.log` |
| L1 `NodeRun`'s three fields — before the first attempt (`null`), after a retry, after a resume, an ask (`null`), a pre-0.8.0 log (`null`) | RAN — green | `test/fold/attribution.test.ts` (8 cases; 6 RED on `99001d6`, M4); `test/fold/attempted.test.ts` re-written (R5) |
| L2 `onTaskMessage` / `onTaskProgress` — every field, frozen, only this run's tasks, no subscription without the callback, nothing after a stop, a throw halting | RAN — green | `test/driver/pass-through.test.ts` (9 cases; 8 RED on `99001d6`) — and, after the readers, a branch task's path, a nested field both ways, a late message of an earlier attempt |
| L1 through `createRuntime`: two runs on ONE runtime, each hearing only its own messages; the delivery count linear | RAN — green | `test/scheduler/runtime.test.ts`'s W187 suite (3), read at each driver's ENTRY beside the broadcast control; P28 (router reads `id` only) KILLED there |
| real-scheduler probe (M7) | RAN — before the readers | node and deno byte-identical; not re-run (no behaviour it reaches moved after it: the readers' fixes are tests and text) |
| conformity reader | RAN | C1-C8, no BLOCKER; C1, C3-C8 fixed, C2 settled by S-1's answer (the four sites stand) |
| adequacy reader | RAN | A1-A8, no BLOCKER; A1-A3 fixed (R1, R3, R4, R6 re-cut and KILLED), A4-A7 declared equivalents (R2, R8, R9, R11 — RUN, SURVIVED), A8 noted |
| the author's probes, re-run after the readers | RAN | **37 one-clause probes + 2 grader controls: 32 KILLED, 5 SURVIVED (P15, R2, R8, R9, R11 — each a declared equivalent, by id)**, CONTROL CLEAN, GRADER-CRASH CRASH, no NO VERDICT; every file restored, digests equal (`C:/tmp-w187/mut2.log`) |
| `npm run gate` after the readers' fixes | RAN — EXIT 0 | `C:/tmp-w187/gate2.log`: the same counts as the first run |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w187/gateitem.log`) | lint; typecheck; every check, `check:docs` 47 `run` / 6 `check`; L1-L5 **80 files / 2047 cases** in node, deno and chromium; L6 2743 assertions / 203 runs, 0 failed, node 24.20.0 and deno 2.9.6; selftests 10/10 ok (979.2 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the fold's three fields and their arms | yes | P1-P9, P31 (L0) |
| (2) the driver's pass-through: types, members, `PASS_THROUGH`, `heardPassThrough`, `frozenCopy` | yes | P11-P27, R1, R3, R4, R6 |
| (3) the runtime: `StartOptions`' `Pick`, `openRun`'s spreads, the router's `taskId` | yes | P28-P30; the binding count and observer membership |
| (4) run-state v0.27, task-id v0.16, `spec/README.md` | yes | `check:spec` (`C2` rule ids, `C8` versions) |
| (5) the tests | yes | M4; the probe table |
| (6) examples/l6.ts's `askEntry` | yes | M2: five L6 assertions RED without it |
| (7) AGENTS.md and its `run` snippet | yes | `check:docs` (`RUN_FLOOR` 47) |
| (8) doc/concept.md's clause | yes | the always-read set's statement; `check:budget` holds its size |
| (9) ADR 0114 | yes | `check:register` (front matter); `check:markdown` (the links to it) |

**Prediction 1 (P36 prediction 4) PARTLY REFUTED; prediction 2 (the census) HOLDS** — the tables above: a `NodeRun`
literal typed as nothing fails at L1/L2 and L6, not L0; no fold input moved.

**What broke.** Nothing at a rung after READY. Before it: the harness's first pass graded its crash control KILLED (the
runner prints an import failure as a FAIL line) — the grader was fixed and the set re-run whole. The readers found three
gaps no rung saw: every pass-through case was outside a region (`branchPath` unread), the copy was asserted at the top
level only (a shallow copy passed), and the reading R6 named — a late message of an earlier attempt — was never arranged.

**What this taught.** *For the retro*: a copy claim is read on a NESTED field, or a shallow copy satisfies it — W185's *read
on the copy both ways* was followed and fell short one level down. And a prediction about where a type change fails
(*every literal fails L0*) holds only for literals carrying the type: an expected value in an assertion is untyped and
fails at run time.

**Questions raised.** None (Q690-Q693 SPENT, unissued). **Closed.** None. **S-1** answered by the maintainer (YES,
2026-10-18). **Record step**: ADR 0088 rule 3 and ADR 0113 rule 8 carry dated pointers to ADR 0114 / `RN-R41`.

**The readers' overlap: ONE** — R6, the event's `attemptNumber` against the fold's (A3 by mutation, C5 by reading).
