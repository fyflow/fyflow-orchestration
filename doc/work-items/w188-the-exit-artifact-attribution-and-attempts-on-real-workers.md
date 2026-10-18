# W188 — the exit artifact: a task's attribution and what survives a resume, on real workers in both runtimes

**Status:** done 2026-10-18 — **`npm run gate:full` EXIT 0** on the final tree, one command, the plan's last item; both reader passes RAN, no BLOCKER — conformity: the six clauses CONFORM, C1-C5 acted on; adequacy: A1-A3 SHOULDs fixed or recorded, A4 narrowed; readers' overlap ONE; no question raised; no exception. Earlier: READY-FOR-READERS 2026-10-18 (`npm run gate` EXIT 0, L6 6/6 in node and deno) — declared 2026-10-18 on `382cf3e` (W187 committed); P36's LAST item, its exit artifact; not committed
**Plan:** [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) — *which run and attempt does a
task's activity belong to, without parsing its id, and what of a run — its header, its attempts — survives a crash and a
resume?* — its LAST item and its EXIT ARTIFACT: the header's six clauses, one cross-row block in `examples/l6.ts`, green in
node 24 and in deno; and P35 (l)'s phrase (fact 13).

```
Spec:       NONE moves — an exit artifact writes no rule (W94's, W155's, W160's, W167's, W176's and W182's precedent). The
            expected values are written from spec/run-state.md v0.27 — RN-R39 (onHeader: once, inside start(), after FD-R4
            and the payload's clone, before anything is appended or handed on, a frozen copy equal to checkpoint().header and
            handle.header; a throw leaves the driver UNSTARTED, nothing appended, handed or reported), RN-R40 (one `attempted`
            element per attempt STARTED, own tasks only, on task.running; a resume re-hands each in-flight task with
            `attemptsSpent` the highest recorded; a spent budget handed on and run once by the scheduler; a stopped attempt
            counted, no special case), RN-R41 (a nodes entry's runId, flowAttempt, attemptNumber), RN-R42 (onTaskMessage /
            onTaskProgress: the attribution as fields, frozen, own tasks only), RN-R21/RN-R22 (the resume's in-flight set),
            RN-R32/RN-R33 (a stop); spec/outcome-record.md v0.20 section 2 (`attempts` is the scheduler's count, starting at
            attemptsSpent — P36 (i)); spec/task-id.md v0.16 section 1 (the ids; `flowAttempt` 0); P36 facts 2, 3, 6-9 and
            stop-and-asks (d)-(l) as answered; the scheduler's own AGENTS.md at the pin (§5's attempts table, §6's
            task.message: per attempt, in seq order, before the attempt settles, a retry restarting seq at 0).
Owns:       from P36's W188 row, exactly: examples/l6.ts, examples/flows/**, examples/workers/**, examples/README.md.
            examples/flows/** and examples/workers/** are in the row and are NOT expected to be edited: the flows and the
            workers are written in the block with data: workers (W182's precedent). examples/run-flow.ts is NOT in the row
            and is NOT edited (reading R7: W186's C2 hand-off is met by the block, not by restoring `onDelivery`).
            Exceptions: none declared. Anything else (src/**, spec/**, AGENTS.md, test/**, scripts/**, examples/run-flow.ts)
            found to need an edit is a STOP-AND-ASK (S-n, a recommendation and alternatives), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q694-Q696 only if raised),
            doc/decisions/** (dated pointers only, if any), README.md (only if the precedent touches it), this file.
            NOT the plan's Record or Retro — the coordinator's, after this item.
            Overlap with W187 (serial, P36's rows): examples/l6.ts (W187's row named it for its census sites; W187 moved
            the W182 block's `askEntry` helper).
Inputs:     P36's Exit artifact (six clauses, read word for word), facts 2, 3, 6-9 and 13, stop-and-asks (d)-(l) as answered,
            prediction 5, sentences B′, C, D′, E and the two brief sentences; the hand-ons of W185 (the RN-R18 rows'
            *HEADER arrives AFTER*, true of the HANDLE's header), W186 (M7's probe C:/tmp-w186/m/scratch-w186/probe-resume.ts
            as clauses (4)-(6)'s shape; `OutcomeRecord.attempts` after a resume; C2: run-flow.ts' `onDelivery` filters
            task.running, so no L6 row observes its ROUTING; C7: (2g)'s midQ is a relation) and W187 (M7's probe
            C:/tmp-w187/m/scratch-w187/ as clauses (1)-(2)'s shape; task.message keyed `taskId`, task.progress spread flat;
            A8: no checked-in real-scheduler test of the pass-through shapes); W182's block as the shape and its Record's
            lessons.
Outputs:    (1) ONE cross-row block in examples/l6.ts — `W188 exit` — its registry DOCUMENT written in the block with data:
                workers, every runtime shut down in a finally, each clause guarded by its own catch (W182's askClause),
                every wait a latch that throws a NAMED error at 15 s, bound by CROSS_ROW_SUBJECTS. By the header's clauses:
                (1) a fan-out of a task on a THREADED pool and one on an INLINE pool, each worker calling context.emit three
                    times per attempt and failing its FIRST attempt, run beside a SIBLING run of the same flow on the SAME
                    runtime that fails nothing: each run's onTaskMessage receives every message the scheduler fired for its
                    own tasks — runId, nodeId, branchPath, taskId, flowAttempt, attemptNumber as fields, frozen — in seq
                    order per attempt, attempt 2's under attemptNumber 2; nothing of the other run's. Each run is the other's
                    control. And (reading R3) each attempt's progress through onTaskProgress, attributed the same way.
                (2) the same two runs' folds: each task's nodes entry carries its run id, flowAttempt 0 and attemptNumber
                    EQUAL to the attempts the scheduler made — read off the scheduler's task, its task.running events and
                    the worker's own count — 2 in the run that retried, 1 in the sibling (the control); each run's
                    `attempted` elements naming its own tasks only (reading R7).
                (3) a run whose onHeader THROWS — the consumer's error at start()'s caller, onFoldInput never called,
                    onRunFailure never called, nothing handed to the scheduler, no id in its task map — then, on the SAME
                    runtime, a run whose onHeader is called ONCE inside start(), with NOTHING yet appended or handed, a
                    FROZEN header equal to the handle's and the checkpoint's; the CONTROL — the same observers then saw that
                    run's five entry elements and its two hand-offs before start() returned.
                (4) a task of retryPolicy { maxRetries: 2 } whose THREADED worker always fails, the consumer's positional
                    store (onHeader + onFoldInput) FROZEN at its second attempt's `attempted` element, the runtime shut down
                    (it drains: attempt 2 runs out, the third is never started), resumed on a FRESH runtime: re-handed with
                    attemptsSpent 2, run ONCE more as attempt 3, user_action — THREE worker calls across both processes,
                    OutcomeRecord.attempts 2 (both processes'); the CONTROL — the same checkpoint with its `attempted`
                    elements removed, on a third runtime: attemptsSpent 0, attempts 1-3, FIVE calls in all.
                (5) a task of { maxRetries: 1 } STOPPED (RunHandle.stop) during its first attempt — the attempt in the log
                    before `interrupted`, the task cancelled — and resumed on a FRESH runtime: attemptsSpent 1, ONE attempt
                    (#2) and user_action; the CONTROL — the stopped checkpoint without its `attempted` element: TWO.
                (6) a task of { maxRetries: 1 } whose budget is SPENT at the kill (the store frozen at attempt #2 of 2):
                    resumed on a FRESH runtime, handed on with attemptsSpent 2, nothing settled by resume() itself, run
                    ONCE (#3), folding from the scheduler's own task.failed/user_action — the record's error the worker's
                    own text.
            (2) the claims, each in CROSS_ROW_SUBJECTS, counted at the build and written here before the block's first
                complete run.
            (3) every L6 census the block moves, in the same diff: CROSS_ROW, DECLARED_TOTAL, DECLARED_RUNS,
                CROSS_ROW_SUBJECTS, pairRunCount, the file header (P36 in the exit-artifact list, one table row);
                examples/README.md's two X10 copies and the l6.ts row's run tail and block list.
            (4) the stale comments: DRIVER_FIELDS' `gateMemory` comment (P35 (l), fact 13); the two `RN-R18 at L6` texts (the
                CROSS_ROW_SUBJECTS entry and its assertion's label) reworded to *the HANDLE's header* (W185's hand-on).
Depends on: W187 (done, `382cf3e`)
Blocks:     nothing — P36's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24 and deno. Every expected value hand-written from the spec, the scheduler's
            AGENTS.md at the pin and the fixture, never from a run's output: each id from spec/task-id.md section 1; each
            message line generated from the worker source's three emits per attempt BY HAND; each attempt count from §5's
            table and RN-R40; each sequence from RN-R4, RN-R40 and the flow's shape. NEVER a completion order across tasks:
            messages are compared SORTED by (taskId, attemptNumber, seq), and the per-attempt order is the scheduler's own
            promise (§6), read on the arrival order within ONE attempt. Each claim shown able to fail by a ONE-clause
            provocation (sentence E) — of src/ under test and of the block's own arrangement — in the byte copy
            C:/tmp-w188/m (find -type l empty; every file restored and its digest compared; a timeout NO VERDICT; a probe
            substituting the expected literal invalid; the grader controlled); probes in node, the key ones in deno too.
Gate:       `npm run gate` before the readers (P36 sentence C), plus test:l6 and test:l6:deno repeated (>= 5 each) on the
            tree held still; then the conformity and adequacy readers, NOT run by this item's author; then `npm run
            gate:full` ONCE on the final tree — the plan's LAST item (workflow v0.29).
Reserves:   Q694-Q696 (P36's per-item line); no ADR (an exit artifact decides nothing; ADR 0115-0116 the plan's, expected
            unused)
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **A requeue's repeated `task.running`, an `attempted` heard after a halt or inside `resume()`'s/`unpause()`'s inline
  hand-off, a forged stored `attempted` refused `diverged`** — held at L2 by W186's suites (`test/driver/attempts.test.ts`);
  the header names none of them, and a requeue cannot be provoked on a real pool without killing a worker.
- **A pass-through throw halting the run, a message after a stop or a release, an uncloneable `details`** — held at L2 by
  W187's `test/driver/pass-through.test.ts`; the header names none.
- **`onHeader` on `resume()` (never called), an `FD-R4`-refused or uncloneable payload (never called), a throwing
  `onHeader`'s run id refused `RunIdInUse`** — W185's L1/L2 suites; not in the header.
- **Anything in `src/`, `spec/`, `AGENTS.md`, `test/`, `scripts/`, `examples/run-flow.ts`** — out of the row; a defect or a
  now-false sentence there is a stop-and-ask, never an edit.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `npm run test:l6` and `npm run
test:l6:deno` repeated on the same tree; the author's ONE-clause provocations in the byte copy `C:/tmp-w188/m`, graded on
L6's `FAIL` blocks naming `W188 exit`; then the readers; then `npm run gate:full` once. Routing coverage: `user_action`
(Q17) — exercised: clauses (4)-(6) each end a non-optional task out of retries `user_action`, the run `awaiting_action`,
keyed on the terminal state; a branch routed away from its join (Q4), no matching decision edge (Q10), a nested fan-out
(Q6) — not applicable (no routing rule moves); a duplicate task id (Q13) — each resume re-hands the SAME id on a fresh
scheduler, and the two runs of clause (1) share one scheduler with distinct ids.

## What the declaration step measured

*Measured 2026-10-18 in a BYTE COPY of `382cf3e` (`git archive` into `C:/tmp-w188/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node examples/l6.ts` EXIT 0: **2743 assertions, 0 failed** (45 s) |
| M2 | **the six clauses in miniature** (`C:/tmp-w188/m/scratch-w188/probe.ts`, a real `FyflowScheduler` through `createRuntime`) | node and deno EQUAL on every clause's values; they DIFFER only in the arrival interleaving ACROSS tasks (the scheduler-fired message order, the `task.running` order, the run's whole sequence) — so the block compares messages sorted by `(taskId, attemptNumber, seq)` and reads the order within ONE attempt only |
| M3 | **the attempt counts, at the pin** | (4) the store frozen at `attempted #2`: process A made 2 calls — `shutdown()` drains attempt 2 and its `task.retrying` is the last event, the third attempt never started (W186 M7's measurement, now on a THREADED pool); B handed `attemptsSpent: 2`, ran `#3`, `user_action`, the record's `attempts` 2; the stripped control handed `attemptsSpent: 0` (the `FyflowTask`'s default — the driver's config carries no key, so the task reads `0`: reading R5), ran `#1`-`#3`, 3 calls. (5) stopped in attempt 1: the log `[dispatched, attempted #1, interrupted]`, A's scheduler firing `task.running`, `task.cancelled`; B `attemptsSpent: 1`, `#2`, `user_action`, `attempts` 1; control 2 calls. (6) `maxRetries: 1` frozen at `#2`: A's attempt 2 ended `user_action` in A (the store frozen before it); B `attemptsSpent: 2`, `#3`, `user_action`, `attempts` 2, the error *call 1 in this thread*; `resume()` returned with only `resumed` appended |
| M4 | **the pass-through shapes, at the pin** (W187 A8) | `TaskMessage` keys exactly `attemptNumber, branchPath, data, flowAttempt, name, nodeId, runId, seq, taskId, timestamp`, frozen, on the threaded and the inline pool; `TaskProgress` keys `attemptNumber, branchPath, details, flowAttempt, message, nodeId, progress, runId, taskId, timestamp` — no `workerType`, no `id`; the retried attempt's three messages under `#2` with the worker's own count 2; the sibling's six messages on its own callback only |
| M5 | **`onHeader`, at the pin** | called once, while `start()` had not returned, before every `onFoldInput` and every `addTask`; the header `{ format: 1, runId, flowId, version: 1, entryPayload }` frozen and equal to `handle.header`; a throwing `onHeader`: the consumer's class at the caller, 0 `onFoldInput`, 0 `onRunFailure`, nothing handed, no id in the task map |
| M6 | **B′ / D′ — the census sites this change moves** | written at the build: `CROSS_ROW`, `DECLARED_TOTAL`, `DECLARED_RUNS`, `CROSS_ROW_SUBJECTS`, `pairRunCount`, the file header; `examples/README.md`'s two `X10` copies and the `l6.ts` row's tail. **NOT moved**: `DRIVER_FIELDS` (its `gateMemory` COMMENT only), `RUN_FLOOR` (no snippet), `LATE_SUITES` (no suite), the row-label count (no label), `examples/flows/` and `examples/workers/` (nothing added) |

## How each exit clause is asserted — `examples/l6.ts`, `W188 exit (n)`, every claim in `CROSS_ROW_SUBJECTS`

Twenty-four claims over eleven runs. Observers: the LOG (`foldInputs()`, and a consumer's positional store in (4) and (6)),
the FOLD, the run's own callbacks, and the REAL scheduler — every task handed to its `addTask` with the `attemptsSpent` it
carries (the instance's method wrapped before any run), its `tasks` map, and every `task.*` event recorded by id: its
`task.running` numbers are the ATTEMPTS, the worker's own `call` messages the CALLS.

| clause | the claims | the CONTROL beside them |
|---|---|---|
| (1) messages, two runs on ONE runtime | per run, four: its `onTaskMessage` received exactly the lines `AT_EMIT` makes BY HAND — per task, per attempt, `start`/`mid`/`end` at `seq` 0-2 with `{ role, call, at }` — each `[runId, nodeId, branchPath, taskId, flowAttempt 0, attemptNumber, name, seq, data]`, every one frozen, its keys exactly the ten, `timestamp` a number, on pools read back `threaded` and `inline`; the arrival order WITHIN each attempt `[0, 1, 2]` (the retried run's attempt 2 under `#2`, its data `call: 2`); none of another run's, and as many as the scheduler fired for its tasks — `6 × attempts` — equal to them field for field (the harness's own `task.message` listener); and each attempt's progress through `onTaskProgress`, attributed, its keys exactly the ten, none of the task's. *Since the readers (A1)*: every line and report carries a NESTED `deep: { call }`, and each delivered `data` / `details` is NOT the scheduler's own object (kept uncopied by the harness's listener), is frozen, and a nested field mutated on either side after delivery leaves the other as it was. *Since the readers (A4)*: the order claim holds the order DELIVERED; a late delivery finer than the scheduler's flush is separable only where two lines of one attempt share a flush (ceiling A4/R5) | the two runs are each other's: the retried run hears 12 lines under `#1` and `#2`, the sibling 6 under `#1` — a callback fed the other run's, or every run's, fails both |
| (2) the fold's entries | per run: `completed`; each task's entry `[runId, 0, attemptNumber, 'done']` beside the scheduler's task `attemptNumber`, its `task.running` numbers and the worker's own `calls` — `2, [1, 2], 2` where it retried; the run's `attempted` elements naming its own tasks only (R7) | the sibling: `1, [1], 1` on every observer — a constant fails one run |
| (3) the header | `onHeader` called ONCE, while `start()` had not returned, with 0 elements appended and 0 tasks handed at that moment; the header frozen, equal to `handle.header` and to `checkpoint().header`, and EQUAL to `{ format: 1, runId, flowId, version: 1, entryPayload }` written by hand; *since the readers (A2)*, a copy of its OWN — its `entryPayload` is not the caller's object, the caller's nested field mutated leaves it as it was, and its own nested field mutated leaves `handle.header` and `checkpoint().header` as they were; a run whose `onHeader` throws: the consumer's `W188StoreDown` at the caller, 0 `onFoldInput`, 0 `onRunFailure`, nothing handed, no id in the task map, none on an event — read once the header run had SETTLED | the same observers at `start()`'s return saw the entry step's five elements (`regionEntered`, two `branch.opened`, two `dispatched` — 2N + 1) and both hand-offs, and the run's tasks in the task map and on events |
| (4) killed in attempt 2 of 3 | the store `[dispatched, attempted #1, attempted #2]`, 2 calls and attempts `[1, 2]` in A, `threaded`; on B `attemptsSpent: 2` handed, only `resumed` appended by `resume()`, then `[attempted #3, outcome user_action]`, attempts `[3]`, 1 call; THREE calls in all, the record `['user_action', 2, <the worker's text>]`, the entry on attempt 3, `suspended`, the run `awaiting_action` | the same checkpoint less its `attempted` elements on C: `attemptsSpent: 0`, `#1`-`#3`, 3 calls — FIVE in all |
| (5) stopped in attempt 1 of 2 | `stop()` resolved, `done` `interrupted`, the log `[dispatched, attempted #1, interrupted]`, A's scheduler firing `task.running #1`, `task.cancelled`, 1 call; on B `attemptsSpent: 1`, `[resumed, attempted #2, outcome user_action]`, 1 call, `attempts` 1 | the checkpoint less its `attempted` element: `attemptsSpent: 0`, `#1`, `#2` — TWO calls |
| (6) the budget spent at the kill | the store frozen at `#2` of `maxRetries: 1`'s two, 2 calls in A; on B `attemptsSpent: 2` handed and only `resumed` appended by `resume()`; then ONE call, the scheduler firing `task.running #3`, `task.failed`, `task.user_action`, the tail `[resumed, attempted #3, outcome user_action]`, the record `['user_action', 2, 'W188: always fails, call 1 in this thread']` — the worker's own text from B's fresh thread — the entry `#3` `suspended` with that error, `awaiting_action` | (4)'s control: what a budget NOT carried runs |

## Readings the plan did not settle — taken here, for the readers

| | the reading | why |
|---|---|---|
| R1 | **Clause (1)'s two workers are ONE fan-out** — `t` on a threaded pool (branch 0), `i` inline (branch 1) — and BOTH fail their first attempt, so each pool mode carries a retried attempt | *a worker on a THREADED pool and one INLINE* and *a retried attempt's messages* — read over both modes rather than one; a fan-out makes `branchPath` a value, not `'-'` (W187 A1) |
| R2 | **"In `seq` order per attempt" is the ARRIVAL order within ONE attempt**; across tasks no order is claimed — M2: node and deno interleave the two tasks differently | `doc/workflow.md` section 5 rule 5; the scheduler promises order per attempt (§6) and nothing across tasks |
| R3 | **Two claims the header does not name: each run's `onTaskProgress`** (one per run) | W187's A8 hand-on (*no real-scheduler test of the pass-through shapes*): `task.progress` is the task spread flat, so its shape is the one a real pool could break |
| R4 | **"Every message" has a second observer**: the harness's own `task.message` listener on the same scheduler — the count `6 × attempts` and the content field for field | independent of the driver: a callback that dropped a message passes a hand-written list only if the list were wrong too |
| R5 | **`attemptsSpent` is read off the `FyflowTask` the scheduler was HANDED**, where a key the driver did not give reads `0` (the class's default) — so the controls read `0`, not *absent* | the observer is the scheduler's input, which is what decides the budget; *absent* is held at L2 (W186) |
| R6 | **Clause (2)'s "equal to the attempts the scheduler made" is three observers** — the scheduler's task `attemptNumber`, its `task.running` numbers, and the worker's own call count in its result | the fold's number is the claim; a sensor cannot corroborate itself (rule 8 (c)) |
| R7 | **W186's C2 hand-on is met in the block, and `examples/run-flow.ts` is NOT edited**: two runs on ONE runtime, each run's `attempted` elements naming only its own tasks — `task.running` routed per run at L6. *Since the readers (C1, A3)*: what SHOWS the claim can see that routing is the COMPOUND **R1b** (the router handing `task.running` to every driver AND the driver's own filter removed — KILLED, node and deno); either guard cut alone (R2b, A3) survives, because the other holds | restoring `onDelivery` would edit a file outside the row (an exception) to observe what the block already observes |
| R8 | **Clause (3)'s "before the first `onFoldInput` and before anything reaches the scheduler" is read AT the call** — 0 elements and 0 hand-offs inside `onHeader` — **beside a CONTROL at `start()`'s return**: 5 elements and 2 hand-offs, so the observers could see them (*"after X" needs a distinct first and last*); *inside `start()`* is `start()` not yet returned. The INLINE task's `attempted` element is left out of the control: whether an inline pool starts the task inside `addTask` is the pool's timing, not the rule's | W185's ceiling (no one-clause edit separates the two *before*s) stands; H4 defers the call past both |
| R9 | **The throwing run's "nothing appended" is `onFoldInput` never called** — on a runtime a throwing `start()` returns no handle, so there is no `foldInputs()` to read — and its "nothing handed" three observers (`addTask`, the task map, events), read once the header run on the same runtime has SETTLED (a horizon told by an event) | each observer shown live by (3)'s control (rule 8 (d)) |
| R10 | **"Today's driver makes five" is the stripped checkpoint resumed by THIS driver** — what a store written before 0.8.0 holds — not the old code | an L6 row cannot run two versions; the control removes exactly what W186 added to the log |
| R11 | **Clause (5) stops in attempt 1 of `maxRetries: 1`**, so *counted* is one attempt more (its last) and *not counted* two — fact 8's *a stop costs one retry, never its last run*; a CONTROL the header does not name | without it, *counted* is one number beside nothing it differs from |
| R12 | **Clause (6)'s "no settlement the driver wrote" is three readings**: `resume()` returns with only `resumed` appended; the settlement follows the scheduler's own `task.failed` and `task.user_action` on an independent listener; the record's error is the worker's own text from B's fresh thread | a driver-written settlement would appear at the resume, would have no scheduler event, and could not carry `call 1 in this thread` |
| R13 | **"Killed" is the store frozen and the runtime shut down** — W90's precedent: `shutdown()` DRAINS, so the attempt running at the kill finishes in A and its retry is never started (M3) | a process cannot be killed inside one L6 run; the store is what a resume reads |
| R14 | **Clauses (1) and (2) share their two runs** (*"the same run's fold"*), so one guard covers both and a throw there fails both by name; every other clause has its own `atClause` | the header's own wording |

## Departures

None from the header's six clauses. R3 (two progress claims) adds to them; R5 (`0`, not *absent*) and R8 (the inline
attempt left out of the control) are the readings a reader may weigh.

## What the build measured

| # | fact | measured |
|---|---|---|
| M7 | the block's first complete run, in node | every one of the 24 claims GREEN at the first run; the only reds the two count guards (`2731` derived against `2755`; `2743` declared against `2768`, the guard's own line among them) and the run count before `pairRunCount` counted the block. `CROSS_ROW` 410 -> 434, `DECLARED_TOTAL` 2743 -> 2767, `DECLARED_RUNS` 203 -> 214 |
| M8 | **P36 prediction 5** — *W188 moves `X10` by its block alone, and no existing L6 row; P35 (l)'s phrase is its one edit outside the block* | **`X10` HOLDS**: 2743 / 203 -> 2767 / 214, exactly the block's 24 claims and 11 runs; no `EXPECTED` row, pair row or other block's count moved. **"One edit outside the block" is REFUTED in letter**: besides the `gateMemory` comment, W185's hand-on (written after the prediction) rewords the `RN-R18 at L6` subject and its assertion's label to *the HANDLE's header* — text only, no count — and the file header gains P36 and one table row (the census every exit artifact moves) |
| M9 | now-false statements, `git grep` over the tree but `dev-dist/` and `node_modules/` for *2743*, *203 real runs*, *HEADER arrives AFTER*, *no L6 row runs a gate* | rewritten in `Owns`: `examples/README.md`'s two `X10` copies and the `l6.ts` row's block list and run tail; the `RN-R18` texts; the `gateMemory` comment. **Left**: dated history in `examples/l6.ts`'s census comments and in `doc/work-items/**` and `doc/plans/**` |

## The author's provocations (before the readers)

`C:/tmp-w188/mutate.mjs` with `C:/tmp-w188/probes.mjs`, in the byte copy `C:/tmp-w188/m` (`git archive` of `382cf3e`,
`node_modules` copied, never linked — `find -type l` zero; this item's three files copied in and `cmp`-equal). Before each
first touch the copy's file is asserted byte-equal to the real tree's; each anchor asserted to occur ONCE and the edit to
change the file; every touched file restored from its FIRST snapshot and its SHA-256 compared after each probe and on any
abort; node 24 asserted; a 900 s time-out graded NO VERDICT (none occurred). Graded on L6's `FAIL` blocks naming `W188 exit`:
KILLED when one names a claim the probe was written to fail, WRONG-REASON when only others do. **CONTROL clean three times in
node, once in deno.** **The grader controlled**: G1 (a syntax error) CRASH and G2 (T5 graded against (4)'s claim) WRONG-REASON,
as declared, in node AND deno. After the set every touched file `cmp`-equal to the real tree. Every one of the 24 claims is
named by at least one one-clause kill (`C:/tmp-w188/cov.mjs`).

**38 one-clause probes and 1 COMPOUND graded, 2 grader controls: 32 KILLED, 5 SURVIVED — each DECLARED before it ran
(A2, A3, T4, T9, T10, argued below); 1 INVALID re-cut (H4 -> H4b); the COMPOUND (T11) KILLED.** In deno: CTRL, H4b, A5, F1,
T1, T11, X9 — every one KILLED as in node — and G1, G2 as declared.

| id | the clause broken | verdict, the claim that failed |
|---|---|---|
| H1 | `onHeader` never called | KILLED — (3) once, its copy, the throw; (4) and (6) THREW by name (the store has no header) |
| H2 | the header not frozen | KILLED — (3) its header is a FROZEN copy |
| H3 | `onHeader`'s throw swallowed, the run started | KILLED — (3) a run whose onHeader THROWS |
| H4 | `onHeader` deferred to a microtask | **INVALID** — CRASH: the deferred THROW became an uncaught exception, so the probe tested the harness; re-cut as H4b |
| H4b | `onHeader` deferred to a microtask, its throw lost | KILLED — (3) called ONCE, INSIDE start(), with NOTHING yet appended (and the throw); node and deno |
| H5 | the header handed with `entryPayload: null` | KILLED — (3) its header … equal to the handle's |
| A1 | `task.running` records nothing | KILLED — (2) both runs; (4)-(6) (the kill latch on `attempted #2` throws by name) |
| A2 | a repeated attempt number recorded again | **SURVIVED — DECLARED**: only a REQUEUE repeats a number, and no real pool requeues without a worker dying under a task; held at L2 (`test/driver/attempts.test.ts`) |
| A3 | `heardRunning`'s own-run filter removed | **SURVIVED — DECLARED**: the runtime's router (ADR 0088) delivers a `task.running` only to its own run's driver, so the driver's filter is unreachable through a runtime; L2 holds it on a bare `Driver` |
| A4 | a resume re-hands no `attemptsSpent` | KILLED — (4) resumed, three calls; (5) counted; (6) handed on, run once |
| A5 | `attemptsSpent` one less than the highest — (h)'s *not counted* | KILLED — (4), (5), (6); node and deno |
| A6 | a resume drops a task with two attempts recorded (a spent budget not handed on) | KILLED — (4) and (6), the resumed task's latch throwing by name, and their claims |
| F1 | the `attempted` arm sets no `attemptNumber` | KILLED — (2) both runs; (4) the entry; (6) the entry; node and deno |
| F2 | a settled entry's `runId` the node id | KILLED — (2) both runs |
| F3 | a settled entry's `flowAttempt` 1 | KILLED — (2) both runs |
| F4 | a settlement resets the attempt number | KILLED — (2), (4), (6) |
| T1 | a message's `branchPath` constant `'-'` | KILLED — (1) messages and progress, both runs; node and deno |
| T2 | `flowAttempt` 1 | KILLED — (1) both runs |
| T3 | `attemptNumber` constant 1 | KILLED — (1, the run that retried) messages and seq order per attempt |
| T4 | `attemptNumber` the run's LATEST recorded, not the event's | **SURVIVED — DECLARED**: equal on every message here — an attempt's messages arrive before its `task.retrying` (§6), so before the next `task.running`; a late-batched message is arranged at L2 (W187 A3) |
| T5 | a message not frozen | KILLED — (1) both runs |
| T6 | `seq` constant 0 | KILLED — (1) both runs, every claim |
| T7 | a progress report's value constant | KILLED — (1) progress, both runs |
| T8 | the pass-through subscribed only when NO callback is given | KILLED — (1) every claim, both runs |
| T9 | the pass-through's own-run filter removed | **SURVIVED — DECLARED**: the router delivers each message to its own run's driver alone (ADR 0114's amendment) — T11 is the compound |
| T10 | the router reads `id` only — every message broadcast to every driver | **SURVIVED — DECLARED**: each driver drops the other run's (its own filter); the N-fold delivery is invisible at a callback and is counted at L1 (`test/scheduler/runtime.test.ts`, W187) |
| T11 (COMPOUND) | T9 and T10 together | KILLED — (1) *NOTHING of the other run*, both runs; node and deno. **Counted as killing neither T9 nor T10** (sentence E) |
| X1 | `t` on an INLINE pool | KILLED — (1) the pools read back |
| X2 | the run that retries does not fail first | KILLED — (1) and (2), that run |
| X3 | the sibling also fails first | KILLED — (1) and (2), the SIBLING |
| X4 | (4) frozen in the FIRST attempt | KILLED — (4) the store, the resume, the three calls |
| X5 | (4)'s control not stripped | KILLED — (4) CONTROL |
| X6 | `FailT` on an INLINE pool | KILLED — (4), (5), (6) |
| X7 | (5) stopped only after the first attempt FAILED | KILLED — (5) STOPPED during its first attempt |
| X8 | (3)'s `onHeader` does not throw | KILLED — (3) a run whose onHeader THROWS |
| X9 | the harness records nothing handed | KILLED — (3) CONTROL (the throwing run's *nothing handed* stays green: R9), (4)-(6)'s `attemptsSpent`; node and deno |
| X10 | the harness records no event | KILLED — (3) CONTROL, (2) both runs, (4)-(6) |
| X11 | the harness's own message listener records nothing | KILLED — (1) EVERY message the scheduler fired, both runs |
| X12 | (6) frozen with budget left (`#1`) | KILLED — (6) every claim |
| G1 | GRADER: a syntax error | CRASH, as declared — node and deno |
| G2 | GRADER: T5 graded against (4)'s claim | WRONG-REASON, as declared — node and deno |

**Ceilings, declared by id**: A2, A3, T4, T9, T10 — each SURVIVED as declared, for the reason in its row; A3, T9 and T10 are
two guards in series (the router and the driver's own filter), so a single cut of either is masked by the other at any
runtime, and the compound T11 shows the claim sees both gone — and, *since the readers (A3)*, the compound **R1b** does the
same for A3's pair (the router's `task.running` delivery and `heardRunning`'s filter): A3's ceiling stays *a single guard is
not separable through a runtime*, R1b is its compound as T11 is T9's and T10's. Not probed: W185's ceiling — no one-clause edit separates
*before the first `onFoldInput`* from *before the first `addTask`*.

## Gate before the readers — RAN

| clause | verdict | notes |
|---|---|---|
| `npm run gate`, the real tree held still (SHA-256 of the three changed and new files equal before and after the gate and the ten repeats, `C:/tmp-w188/dig-before.txt`) | **RAN, `GATE EXIT=0`** | `C:/tmp-w188/gate.log`: `lint` 164 files; `check:spec` 7 documents / 81 examples / 151 rules; `check:docs` `X10` *compared 2 copies … 2767 / 214*; L1-L5 **80 files / 2047 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 2047); L6 **2767 assertions, 0 failed, 214 real runs** in node and in deno |
| `npm run test:l6` and `npm run test:l6:deno`, repeated on the same tree | **RAN — 5/5 and 5/5 EXIT 0**, each `2767 assertions, 0 failed`, 214 runs | with the gate's own two runs, 6/6 in each runtime (`C:/tmp-w188/rep-*.log`) |
| conformity and adequacy readers | **RAN** after READY — see the Record | |
| `npm run gate:full` | owed then ONCE, on the final tree — see the Record | firefox and webkit NOT RUN |

*This file's sections below its declaration were written after the build; nothing else moved.*

## Record

*Filled 2026-10-18, after the readers' round. Not committed. Written before `npm run gate:full`, but for its row and the Status line.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | the table above: L6 **2767 / 214**, 0 failed, node and deno; `test:l6` and `test:l6:deno` 5/5 each besides |
| conformity reader | **RAN** — the six clauses CONFORM, no BLOCKER | C1 SHOULD (R7 and the ceilings claimed W186's C2 met without the compound that shows it), C2-C5 NITs — all acted on (below) |
| adequacy reader | **RAN** — no BLOCKER | A1 SHOULD (the message/progress copy read only at the top level: its R3 and R6 SURVIVED), A2 SHOULD (the header's copy: its R4 SURVIVED), A3 SHOULD (A3's ceiling shown live by its compound R1b, KILLED; R2b survived), A4 NIT (a late seq-0 delivery killed only on the retried run) — all acted on |
| **the readers' overlap** | **ONE shared subject** | A3's ceiling / W186's C2 — `task.running`'s routing at L6: the conformity reader by reading (C1), the adequacy reader by its compound R1b (A3). Every other finding was one reader's alone (`doc/workflow.md` section 6) |
| author's provocations, re-run after the readers | **RAN** | the table below; CONTROL clean four more times (three node, one deno); every file restored, digest equal, `find -type l` zero |
| L6 after the readers' items | **RAN — EXIT 0**, node: `2767 assertions, 0 failed, 214 real runs` | no claim and no run added: A1 and A2 widened existing claims |
| **`npm run gate:full`, the confirming run** | **RAN, `GATE:FULL EXIT=0`** | ONE command on the final tree, held still (SHA-256 of the three changed and new files equal before and after; `C:/tmp-w188/gatefull.log`), after the readers' items and this Record (but for this row and the Status line): the ladder — `lint` 164 files, `check:spec` 7 / 81 / 151 rules, `check:docs` `X10` 2767 / 214, L1-L5 **80 files / 2047 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 2047), L6 **2767 assertions, 0 failed, 214 real runs** in node and deno — then EVERY self-test, `check:register:selftest` included: **11/11 completed, 11 ok**, 2254.0 s wall (2436 s for the command). firefox and webkit NOT RUN |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| A1 | the pass-through copy read at the top level only | **fixed** — every line and report carries a NESTED `deep: { call }`; the harness keeps the scheduler's own `data` / `details` objects uncopied; (1)'s message and progress claims each gain `[count, not the scheduler's object, frozen, detached one level down both ways]`. R3 and R6 now KILLED, node and deno |
| A2 | the header's copy not read one level down | **fixed** — the payload carries a nested field; (3)'s copy claim gains `[not the caller's object, the caller's nested mutation not seen, its own nested mutation not seen by handle.header or checkpoint().header]`. R4 now KILLED, node and deno |
| A3 | A3's ceiling can be shown live | **recorded** — R1b (the router delivers `task.running` to every driver AND `heardRunning`'s filter removed) KILLED node and deno, as A3's compound (T11's role for T9/T10); R2b (router alone) SURVIVED; the ceiling *a single guard is not separable through a runtime* kept |
| A4 | the sibling's order claim cannot fail on a late seq 0 | **narrowed** — measured (`C:/tmp-w188/m/scratch-w188/timing.ts`): the scheduler delivers an attempt's first emit at once and the rest a flush (~20 ms) later, so on an idle loop a delay under one flush reorders nothing; the sibling's label now says *not a delay finer than the scheduler's flush*, the code comment says why, and the retried run's kill of R5 is COINCIDENT (two lines of one attempt sharing a flush on a busy loop) — a declared ceiling, A4/R5 |
| C1 | R7 and the ceilings | **fixed** — both cite R1b as the compound that shows `task.running`'s routing at L6 |
| C2 | the `gateMemory` comment named gate types | **fixed** — it names the gate IDS (`dedupe`; `triage`, `grade`) with their types beside them |
| C3 | odd backticks in prose | **fixed** — apostrophes |
| C4 | prediction 5's refutation in letter | **kept for the plan's Record and retro** (below; M8 states it here) |
| C5 | the `CROSS_ROW` comment | **fixed** — *410 at W182, +24 by W188* |

**The author's provocations after the readers** — the same harness, the copy re-synced from the real tree (`cmp` clean per
touched file), node, and the readers' probes in deno too (`C:/tmp-w188/mut4.log`-`mut6.log`).

| id | the clause broken | verdict |
|---|---|---|
| R3 | a message's `data` handed out as the scheduler's own object | **KILLED** — (1) *its onTaskMessage received every message*, both runs; node and deno |
| R6 | a progress report's `details` aliased | **KILLED** — (1) progress, both runs; node and deno |
| R4 | `onHeader` handed a frozen header sharing the run's own entry payload | **KILLED** — (3) *its header is a FROZEN copy … of its OWN*; node and deno |
| R5 | a seq-0 message delivered 5 ms late | KILLED on the retried run only — **COINCIDENT** (A4, narrowed; a declared ceiling) |
| R2b | the router hands `task.running` to every driver | **SURVIVED — DECLARED** (the driver's filter holds); node and deno |
| R1b (COMPOUND) | R2b and A3 together | **KILLED** — (2) both runs; node and deno. Counted as killing neither R2b nor A3 (sentence E) |
| A3, T9, T10 | re-run | SURVIVED, as declared |
| T11 (COMPOUND) | re-run | KILLED |
| H5, T5, T7 | the earlier probes over the claims the fixes widened | KILLED, each, as before |
| G1, G2 | grader controls | CRASH and WRONG-REASON, as declared |

**Totals over both rounds: 43 distinct one-clause probes — 35 KILLED, 6 SURVIVED as declared (A2, A3, T4, T9, T10, R2b),
1 KILLED only coincidentally (R5, a declared ceiling), 1 INVALID re-cut (H4 -> H4b)**; 2 COMPOUNDS (T11, R1b) KILLED; 2
grader controls graded as declared. The readers' R3, R4, R6 and R1b KILLED in both runtimes.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W188 exit` block, six clauses | yes | the `CROSS_ROW_SUBJECTS` both-ways clause (24 subjects), `CROSS_ROW` 434, `DECLARED_TOTAL` 2767, `DECLARED_RUNS` 214 |
| (2) the claims | yes — 24 over 11 runs | each named by a one-clause kill (`C:/tmp-w188/cov.mjs`) |
| (3) the census | yes | `check:docs` `X10` (the two README copies, 2767 / 214); L6's own count guards |
| (4) the stale comments | yes | nothing executes them; M9's `git grep` |

**Owns, checked by hand** (`git status --porcelain`): `examples/l6.ts`, `examples/README.md` — in the row; this file — the
record step. `examples/flows/**`, `examples/workers/**` and `examples/run-flow.ts` NOT edited; no `doc/questions/**` or
`doc/decisions/**` file touched. No exception taken. Every changed file LF.

**What broke.** At the ladder, nothing, in either round. Before READY, one probe of the author's own (H4: a deferred THROW
became an uncaught exception — the probe tested the harness). At the readers, the block's ADEQUACY in four places: two copy
claims read only at the top level (A1, A2 — the brief's own lesson *a copy claim read on the copy both ways and one level
down*, followed for the fields and not for the values inside them), a ceiling its compound could show (A3), and an order
claim whose discrimination depends on the scheduler's flush (A4).

**What this taught.** *For the retro*: the shape of every value a claim reads is part of the arrangement — a FLAT `data`
made *one level down* unreadable, so the lesson was followed and could not bite. And an order claim over a batched channel
discriminates only as finely as the batch: *in order* is measurable, *not late* is not, below the flush.

**Questions raised.** None — Q694-Q696 unused, skipped. **Closed.** None.

**For P36's Record and retro** — not edited here:
- **Prediction 5** — `X10` moved by the block alone (+24 / +11): HOLDS. *"P35 (l)'s phrase is its one edit outside the
  block"*: REFUTED in letter — W185's hand-on (after the prediction) rewords the `RN-R18 at L6` subject and label, text only,
  and the file header gains P36's row (C4).
- **W186's C2** met in the block (R7), shown live by the compound R1b; `examples/run-flow.ts` not edited.
- **W186's A5/C6 and W187's A8** now have their checked-in homes: clauses (4)-(6) and clause (1).
- Measured at the pin: `shutdown()` on a threaded pool drains the running attempt and never starts its retry; a config with
  no `attemptsSpent` reads `0` on the `FyflowTask`; the scheduler delivers an attempt's first emit at once and the rest a
  flush later; node and deno interleave messages across tasks differently.
- The readers' overlap: ONE shared subject.
