# W175 — pausing a run: `driver.pause` / `driver.unpause`, `RunState.paused`, and a held dispatch handed on in order

**Status:** done 2026-10-17 — **`npm run gate:item` EXIT 0** on the final tree, one command; both reader passes RAN — two DEFECTS (D1, D2) FIXED, G1 changed and RATIFIED by the maintainer, G2 stated, G3 and notes acted on; exceptions E1-E5 granted by the maintainer (S-1..S-4, S-6), S-5 declined; no question raised — declared 2026-10-16 on `7915005`; P34's SEVENTH item: stop-and-ask (e), decision 5's deferred
form, prediction 7; ADR 0106; built under B′, `npm run gate` before the readers
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its SEVENTH item. **A run's OWNER pauses it through ONE
call on the driver and unpauses it through another**: `driver.pause({ actor })` / `driver.unpause({ actor })`, each
appending ONE fold input (`paused`, `unpaused`) and each refused by name where it cannot apply. While paused the run
still ROUTES and still accepts a resolution, and every dispatch it makes is HELD as the replay holds one — its
`dispatched` element appended, `addTask` deferred (P34 fact 3) — while the tasks already handed on finish and settle;
the unpause hands the held tasks on in DISPATCH ORDER. The fold gains `RunState.paused: boolean` and no outcome: a held
task reads `running`. A stop of a paused run cancels only what was handed on, leaves the held tasks in flight, and a
resume FEEDS `paused`/`unpaused`, so a run stopped while paused resumes PAUSED; a cancel of a paused run hands each held
task on and cancels it, so the scheduler settles every one (c).

```
Spec:       spec/run-state.md v0.19 -> v0.20: section 15 and TWO rules — `RN-R34` (the fold: `paused`, `unpaused`, the
            cell; no outcome) and `RN-R35` (the calls: their refusals, taken at rest, the held dispatch, the unpause's
            order, a stop and a cancel of a paused run, the resume). Rules whose TEXT moves: `RN-R13` (a held dispatch's
            configuration, retained while paused — found while building, M4), `RN-R19` (a fifth and sixth
            fed kind), `RN-R21` (a resumed PAUSED run holds its in-flight set), `RN-R22` (`resumed` names the held
            tasks too), `RN-R26` (the fed-kind count), `RN-R29`
            (the deferred form at check (2); check (4) under a pause), `RN-R31` (a cancel of a paused run hands each held
            task on, then cancels it), `RN-R33` (a stop of a paused run cancels only what was handed on); section 2's
            shape (`paused`), section 12's paragraph on the two forms. Two `FoldInput` kinds (`paused`, `unpaused`) and
            one `RunState` cell (`paused`) — each BREAKING (P34 decision 10); `RunControlRefused.control` gains `'pause'`
            and `'unpause'`, its `reason` `'paused'` and `'not-paused'`. No `RunOutcome` moves.
            spec/README.md: run-state's row and its version column.
Owns:       from P34's W175 row, exactly: src/driver/driver.ts, src/fold/run-state.ts, spec/run-state.md,
            spec/README.md, test/driver/**, test/fold/**, test/definition/l4-corpus.test.ts, examples/l6.ts
            (DRIVER_FIELDS), examples/run-flow.ts, AGENTS.md (sections 8, 11), scripts/check-docs.mjs,
            doc/scheduler-upstream.md (S6 only).
            Exceptions: E1-E5 — granted by the maintainer 2026-10-17 (*"As recommended"*: YES to S-1..S-4 and S-6, after
            the readers' round; see the stop-and-asks below), each applied minimally, nothing else changed there:
            E1 (S-1) AGENTS.md section 9 — ONE refusal-table row for `driver.pause` / `driver.unpause`, and the census
            snippet's comment on `RunControlRefused` (thrown from cancel(), stop(), pause() and unpause());
            E2 (S-2) AGENTS.md section 6 — ONE cancel-table row: a task held by a pause is handed on, then cancelled;
            E3 (S-3) AGENTS.md section 18 — ONE stop-table row: a held task is sent nothing and resumes PAUSED;
            E4 (S-4) doc/scheduler-upstream.md :36 — *S6 waits for P34* -> *S6 is not needed (P34's pause, W175)*;
            E5 (S-6) AGENTS.md section 18 (the resume's promise, ~:3815) — a PAUSED checkpoint's in-flight set is held
            until an unpause (`RN-R21` v0.20).
            DECLINED: S-5 (`RunHandle.pause()` / `unpause()`) — NO; `src/scheduler/runtime.ts` untouched, the call is
            reached as `handle.driver.pause()`.
            Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/** (ADR 0106 new; pointers in ADR 0103,
            ADR 0104, ADR 0105), doc/questions/** (Q655-Q657 if raised), the plan's Record, README.md, this file.
Inputs:     P34 decisions 5, 8, 10 and 11, facts 3 and 4, stop-and-asks (c), (d), (e) and (h), prediction 7, sentences
            B′, C, D′ and E; ADR 0103 (the hold's two forms — a pause takes the DEFERRED one at the dispatch door and does
            NOT join `shut()`); ADR 0104 (the cancel, `handOn`, its *held tasks added then cancelled*); ADR 0105 (the
            stop, R1's *taken at rest*, its last consequence: *for W175's pause*); ADR 0065 (the replay).
Outputs:    (1) src: `Driver.pause()`, `Driver.unpause()`, `RunPauseOptions`; `RunControlRefused.control` `'pause'` /
                `'unpause'` and reasons `'paused'` / `'not-paused'`; the fields `paused` (the pause TAKEN), `pauseHeld`
                (each held dispatch, in dispatch order) and `pausePending` (calls accepted mid-step, taken at rest);
                `dispatch` holding into `pauseHeld`; the unpause's drain; `handedOn` excluding a held task; `cancel()`
                handing each held task on and cancelling it; `resume()`'s re-dispatch holding under a fed pause;
                `isFed` + `feedOne` for both kinds; the fold's two arms and `RunState.paused`.
            (2) spec run-state v0.20, spec/README.md's row.
            (3) ADR 0106.
            (4) AGENTS.md section 8 (a new subsection, ONE new `run` snippet — `RUN_FLOOR` 39 -> 40) and section 11
                (the pausing row BUILT).
            (5) doc/scheduler-upstream.md: S6's index row — not needed, pause is ours.
            (6) tests: test/fold/paused.test.ts (L1/L3, new suite), test/driver/pause.test.ts (L2, new suite),
                test/driver/checkpoint.test.ts (`RUN_FOR.paused`/`unpaused`, kinds 12 -> 14), l4-corpus's `LATE_SUITES`
                (+2) and a count case, `DRIVER_FIELDS` in test/driver/retention.test.ts and examples/l6.ts, the `RunState`
                literals the new cell turns red.
Depends on: W174 (done, 7915005)
Blocks:     W176
Tests:      L1 — test/fold/paused.test.ts, `RN-R34` over hand-written sequences: `paused` sets the cell and moves no
            outcome — over a running task, a parked one, a completed run; `unpaused` clears it; a second `paused` and an
            `unpaused` of a run not paused move nothing; `resumed` and `interrupted` leave it; beside every outcome of
            (h)'s order the outcome is the one without it; `isTerminal` unmoved; L3 folded twice. L2 —
            test/driver/pause.test.ts, `RN-R35` over a fake whose `cancel` plays P34 fact 8's roads: nothing handed on
            while paused, the held tasks `dispatched` and `running` in the fold, a held task's successor never reached;
            the unpause handing them on in DISPATCH ORDER (a fixture where every wrong order differs); routing and
            `resolve()` while paused; each refusal by name with nothing appended; a pause raised mid-step — on a
            `dispatched` element and on a settlement's — taken when the step ends, and its checkpoint resuming (the
            control: the same pause taken mid-step diverges); a pause and an unpause both raised in one step; a callback
            THROWING on either element; a stop of a paused run — the held tasks sent no cancel and left in flight — its
            checkpoint resumed PAUSED on a fresh driver, nothing handed on until an unpause there, to `completed`; a
            cancel of a paused run — each held task handed on and then cancelled, ending `cancelled` with every held task
            settled by the scheduler; a pause with a stop and with an unpause PENDING; folded twice. Prediction 7: every
            L2-L5 case that never pauses unmoved (the ladder green with the item built, before any new case is added).
            Expected values from spec v0.20 and the flows' own shape — never from the implementation's output. Each
            clause shown able to fail by a ONE-clause mutation (sentence E) in the byte copy C:/tmp-w175/m.
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree; and B′'s `check:docs:selftest` (an
            executed snippet added). The row's clause: L2 nothing handed on while paused, the held tasks `dispatched` and
            `running` in the fold, handed on in dispatch order at unpause; a paused run stopped and resumed resumes
            PAUSED; a paused run cancelled ends `cancelled` with every held task settled by the scheduler; L3 folded
            twice.
Reserves:   Q655-Q657 (P34's per-item line); ADR 0106 (P34 decision 11)
```

## Scope

**In** — Outputs (1)-(6).

**Out** — named rather than left implicit, with where it goes instead

- **`RunHandle.pause()` / `unpause()`** — `src/scheduler/runtime.ts` is not in P34's W175 row, and (e) names the call on
  the DRIVER; `handle.driver.pause()` reaches it, as `handle.driver.cancel()` reaches W173's (W173's R8). A stop-and-ask
  below asks whether the handle should forward it.
- **The L6 row** (a run paused mid-fan-out on real workers, unpaused, to `completed`) — W176 (P34's exit clause (4)). A
  real-scheduler probe is run here, not checked in.
- **The scheduler's own pause** — S6, not needed (e).
- **Nothing else out of `Owns`** — every site this item makes false outside it is a stop-and-ask below.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w175/m`, each graded on the named suites' `FAIL` lines; then the readers; then `npm run gate:item`
once. Routing coverage: a nested fan-out (Q6) — not exercised (a pause adds no route); `user_action` (Q17) — a parked
task resolved while paused, its successor held; a branch routed away from its join (Q4), no matching decision edge (Q10)
— not applicable; a duplicate task id (Q13) — a held task is handed on ONCE at the id it was dispatched at, and a resume
re-holds the SAME ids (asserted by the resume case).

## What the declaration step measured

*Measured 2026-10-16. M1 in a BYTE COPY of `7915005` (`git archive` into `C:/tmp-w175/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6; M2-M5 on the real tree as the item was built.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 151 files; `check:spec` 7 / 75 / 140 rules; `check:docs` 39 `run` snippets; L1-L5 **67 files / 1854 cases** in node, deno and chromium; L6 **2664** assertions, 0 failed, in node and deno |
| M2 | **B′ / D′ — the census sites this change moves**, each found by its own lane going red by name | `DRIVER_FIELDS` (`test/driver/retention.test.ts`, `examples/l6.ts`) +`paused`, +`pauseHeld`, +`pausePending`; `test/driver/checkpoint.test.ts`'s `RUN_FOR` (L0 red, `typecheck:tests`) and its kind count 12 -> 14; four `RunState` literals — `test/fold/fold-rules.test.ts` two, `test/fold/cancelling.test.ts` one, `test/fold/interrupted.test.ts` one (L0 red, the new cell); `l4-corpus`'s `LATE_SUITES` +2 and a count case; `RUN_FLOOR` 39 -> 40; `spec/README.md`'s row; `check:spec`'s rule count 140 -> 142 (derived, written nowhere). **NOT moved**: `examples/run-flow.ts`'s `NOT_RUN_STATE` (all three fields are run state, WALKED — `pauseHeld` holds `createTask` configurations, plain data); `examples/README.md`'s `X10` (no L6 change) |
| M3 | **P34 prediction 7** — *W175's held tasks are invisible to every L2-L5 case that never pauses* | **HOLDS.** `npm run test` with the driver and fold built and NO case or census site touched: 67 files / 1854 cases, **5 red, each a census site** — `DRIVER_FIELDS` (the three new names) and the four `RunState` literals (the new cell) — and **no routing, dispatch, resume, cancel or stop assertion moved** (`C:/tmp-w175/p7-test.log`) |
| M4 | **the tree's now-false statements**, grepped for *W175*, *pause is to*, *P34's pause*, *is to widen*, *nothing yet*, *S6 waits*, *fed kinds*, *FEED every stored* over everything but `dev-dist/`, `dist/` and `node_modules` | in `Owns` — rewritten: `src/driver/driver.ts` (`RunControlRefusalReason`'s table and *W175's pause is to widen*, `dispatch`'s *W175 widens*, `resume()`'s steps 2 and 5, `feedOne`'s summary, `cancel()`'s step 4, `stop()`'s step 5), `spec/run-state.md` (section 12's *P34's pause is to take*), `AGENTS.md` section 11's row; **and one rule the item had not declared**: `RN-R13`, whose retained footprint gains the held configurations while a run is paused — added to the moved rules above. Record step — pointers: ADR 0103 (two consequences), ADR 0104 rule 7, ADR 0105's last consequence. **OUT of `Owns`**: S-1..S-4 below. History (plans, finished items, decided ADRs' bodies) is true of its version and stays |
| M5 | **a real-scheduler probe** through `createRuntime` (`C:/tmp-w175/probe.ts`, not checked in): a two-branch fan-out, each branch two tasks, paused right after `start` — node 24.20.0 and deno 2.9.6, inline and threaded | all four: while paused (700 ms) the scheduler ran ONLY `a` and `b`, the log held `dispatched a2` and `b2` and folded `running`, `paused: true`; the unpause handed them on and `done` settled `completed`, equal to the caller's fold. The same run paused, STOPPED on runtime C and resumed on a fresh runtime D: `done` on C `interrupted`; on D the fold `running`, `paused: true`, `resumes` naming the two held tasks, NOTHING run in 500 ms; unpaused there, `completed` |

## The author's provocations (before the readers)

`C:/tmp-w175/mutate.mjs` in the byte copy `C:/tmp-w175/m`, synced with the real tree (`cmp` per changed file, `find -type
l` zero); each ONE clause (sentence E) but P20, P35, P37 and P39, each one statement MOVED or two lines of one clause and
declared compound; graded on the `FAIL` lines of the `driver/pause`, `fold/paused`, `driver/stop`, `driver/cancel`,
`driver/resume`, `driver/checkpoint`, `driver/retention` and `driver/hold` suites; every file restored, digest equal;
CONTROL clean. **52 probes: 48 KILLED, 4 SURVIVED — F1, P9 and P13 declared EQUIVALENT before the run, and P4 found
equivalent by it.** The first run left P8 and P39 alive and P44 an anchor error; each earned a case (a second cancel
inside the first cancel's hand-off; a stop on the `unpaused` element) or a corrected anchor, and re-run, each is KILLED —
P39 re-cut alone as P39a and P39b, both KILLED.

| id | the clause broken | verdict |
|---|---|---|
| F2-F6 | the fold: `unpaused` not clearing; `paused` not setting; the arm moving the outcome; `emptyState` paused; `resumed` lifting the pause | KILLED, each |
| P1-P3 | `dispatch`: no hold; held only during a hand-off; **a dispatch on the hand-off's stack jumping the queue** | KILLED, each — P3 by the dispatch-order case alone |
| P5 | `handedOn` counting a held task as handed on | KILLED — the stop sends it a cancel |
| P6-P8, P10 | the cancel: held tasks never released; the hold not emptied; released ids not marked `unhanded`; released tasks cancelled without a hand-off | KILLED, each (P8 after its case was added) |
| P11, P12 | the resume: a paused replay handing on; holding under a requested cancel | KILLED |
| P14-P18 | the replay: the pause kinds not fed; the flag not set from a fed element; a fed `unpaused` not lifting it; neither kind fed; `unpaused` not fed | KILLED, each |
| P19, P21, P22 | taken at rest: a pending call never taken; **a pause, and an unpause, taken at once mid-step (R1's alternative)** | KILLED — P21 by the resume refused `diverged` |
| P23-P33 | each refusal clause, the requested state, `ended` mid-step and its parked clause | KILLED, each |
| P34, P36, P40 | the take: the pause's flag not set; the unpause's flag not cleared; the unpause handing nothing on | KILLED |
| P38 | the hand-off not in a `finally` | KILLED — the throwing callback |
| P39a / P39b | the take not counted in / out as a step | KILLED |
| P41-P44 | the hand-off: no hold check; a handed task left in the hold; not marked `unhanded`; a scheduler throw not reported | KILLED, each |
| P20, P35, P37, P39 | COMPOUND (one statement moved): the stop taken before a pending pause; the pause's flag after its element; the unpause's flag after its element; the take not a step | KILLED, each — and each one's deletion alone is P19, P34, P36, P39a/b, KILLED; the insertion alone is a no-op |
| **F1** | the fold's `prev.paused === paused` short-circuit removed | **SURVIVED — EQUIVALENT, declared**: the state returned is deep-equal either way; the short-circuit only keeps identity |
| **P9** | the cancel's `finally` that unmarks the released ids | **SURVIVED — EQUIVALENT, declared**: `handOn` unmarks each in its own `finally`; only an `addTask` throw could leave one, and the run is then halted |
| **P13** | the resume's hold branch leaving the id `unhanded` | **SURVIVED — EQUIVALENT, declared**: the resume loop's `finally` clears `unhanded` |
| **P4** | `dispatch`'s hold leaving the held id in `unhanded` | **SURVIVED — EQUIVALENT, found**: `handedOn` already excludes a held task, and both roads out of the hold (the hand-off, a cancel's release) mark it `unhanded` again before `handOn` clears it. Kept, so `unhanded` is empty at rest as its doc says |

**Re-run after the readers' in-`Owns` findings** (D1, D2, G1, G2 fixed; the adequacy reader's six gaps and a mid-step
throw on `paused` each given an assertion), the copy re-synced (`cmp` per changed file, no links), CONTROL clean, every
file restored, digest equal. P11-P13 retired with the code they cut (the resume's hold moved before `resumed`); new:
N1 (D1's `!shut()` reverted), N2/N3 (the paused resume handing on / holding nothing), N4 (the hold moved after
`resumed`, D2 reverted — COMPOUND), N5-N9 (G1's drop removed, each clause of it dropped, and a drop beside a pending stop),
A1/A2 (a held configuration altered at the dispatch and at the resume — the adequacy reader's D6/Z7), A3 (the hand-off
before the `unpaused` element — U5, COMPOUND), A4 (a fed element not appended as stored — Z6); M7 and R12 are P39b and
P33, killed. F4 SURVIVED the first re-run (the halt-dropped pause no longer appended after `halted`) and earned an
assertion — a pause as the LAST element over each outcome — and is KILLED. **62 probes: 59 KILLED, 3 SURVIVED — F1, P9
declared and P4 found EQUIVALENT, as above.**

## Readings the plan did not settle — taken here, each stated in `RN-R34`/`RN-R35` and ADR 0106, for the readers

| | the reading | why |
|---|---|---|
| R1 | **A pause and an unpause are TAKEN AT REST**: a call made mid-step (from a callback on the driver's own step) is accepted and taken when that step ends (`pausePending`, `leaveStep()`), in call order and BEFORE a stop pending on the same step | `RN-R19` feeds an owner's element only BETWEEN two steps: the replay regenerates a step whole, so an element appended mid-step is refused `diverged` at its own position — measured in case 2's control (a `paused` element moved between `dispatched a` and `dispatched b`, refused at 5). The cost, stated in `RN-R35` and `AGENTS.md` section 8: a pause from a callback does not hold that step's own dispatches. W174's R1, for the replay rather than the routing |
| R2 | **The refusals and their order**: `not-started`, `halted`, `cancelled` (`RN-R28`'s or requested), `interrupted` (a stop taken or pending), then `paused` / `not-paused` against the pause the owner has ASKED for (the last pending call, else the pause taken), then `ended` at rest for a pause only. **No `unsupported`** (a pause needs no `cancel`); **an unpause is never `ended`** | (e) names only *a second pause or an unpause of a running run*; the shared four follow W173/W174's table; the requested state makes two calls in one step refuse as two at rest would; an unpause rewrites no outcome, so refusing it on a finished run would leave `paused: true` there for good |
| R3 | **The unpause appends its element, THEN hands the held tasks on, in a `finally`**; a dispatch made on that hand-off's own stack joins the END of the queue (`dispatch` holds while `pauseHeld` is not empty) | `resumed`'s precedent: a consumer learns before any of it can settle. The queue keeps the scheduler's order equal to the log's when a callback on `unpaused` resolves a parked task (case 4). The `finally` is W174's C5 lesson |
| R4 | **A halt raised inside the hand-off holds the rest** — `holdsResume()` before each, as a resume's re-dispatch — and what is left is never handed on | `RN-R29` check (4)'s rule, on the one other loop that hands a set on |
| R5 | **`RunState.paused` is lifted ONLY by `unpaused`** — not by a stop, a resume, a cancel or a halt; a cancelled or halted paused run reads `paused: true`, its outcome saying it ended | (e): *a run stopped while paused resumes PAUSED*. A cancel appends no `unpaused` (it is one element, `cancelRequested`), and the flag is not an outcome |
| R6 | **A take is a step of its own** (`stepping`), so a call made from a callback on a `paused` or `unpaused` element is pending until the take ends; **a pending call whose step then HALTED or CANCELLED the run is DROPPED at the take, recording nothing** — *changed after the readers (conformity G1)*: the first build took it anyway (W174's R9), and a `paused` landed AFTER a `cancelRequested`. A step that ENDS the run does not drop it (a pause of a finished run is harmless, and unpause is never `ended`), nor does a stop pending beside it, which was called after it | a call made now would be refused `halted` or `cancelled`; the stop differs from W174's R9 because a stop's element must land for the resume, a pause's need not |
| R7 | **`pause()` and `unpause()` return `void`** | nothing is cancelled, so there is nothing to wait for |
| R8 | **A cancel of a paused run walks the in-flight set ONCE, in dispatch order**: a held task is handed on and cancelled, a handed one cancelled — interleaved by dispatch order, each held one marked `unhanded` first | P34 (c)'s *added then cancelled*; ADR 0104 rule 7's mechanism (`handOn` cancels under the request); marking first means a second cancel raised inside one hand-off sends nothing for an id the scheduler does not hold |
| R9 | **A stop leaves the held configurations on the stopped driver** | it hands nothing on again; the resume rebuilds them from the replay. Released with the driver |
| R10 | **No `RunHandle.pause()`** — `handle.driver.pause()` | (e) names the call on the driver; `src/scheduler/runtime.ts` is not in the row. S-5 asks |
| R12 | **A paused run resumed HOLDS its WHOLE in-flight set — a task the stopped (or crashed) run had handed on as much as one it held** (conformity G2) — and holds it BEFORE `resumed` is appended (conformity D2) | the log cannot tell a handed task from a held one (both are dispatched and unsettled), the resumed driver has handed on neither, and the pause holds every dispatch from its element on; holding before the element keeps a dispatch a callback on `resumed` causes behind them, in dispatch order |
| R13 | **A dispatch is not held once a halt or a cancel request is on the run** — one raised on the task's own `dispatched` element (conformity D1) | `RN-R29` (i): the dispatch in progress is handed on, and a requested cancel then cancels it; held after the cancel had released the hold, it would never settle |
| R14 | **A consumer callback THROWING on a `paused` or `unpaused` element taken at `leaveStep()` from a scheduler event escapes `onEvent`'s `finally` into the scheduler's `dispatchEvent`, rather than halting the run under `OR-R10`** (conformity N5) — not changed here | inherited from W174's `takeStop`, the same shape; the element is in the log and the run is what it says (held, or handed on). For P34's retro, with W174's C5 note on the cancel |
| R11 | **The S6 SECTION gained a closing note**, beside its index row | the brief says *its index row*, the plan row *S6 only*; the note is S6's own text and says the same thing. Flagged: revert it if *S6 only* meant the row alone |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-17 (*"As recommended"*): YES to S-1..S-4 and S-6 (exceptions E1-E5), NO to S-5

**S-6**, raised by the conformity reader: `AGENTS.md` section 18's resume promise (~:3815) — *hands every task still in
flight to the new scheduler at the SAME task id* — is false for a PAUSED checkpoint, whose in-flight set is held until
an unpause. Recommended YES (qualify the sentence); applied as E5.

| | the question | recommended | the alternative |
|---|---|---|---|
| **S-1** | **`AGENTS.md` section 9's refusal table** (`:1688-1689`) has a row for `driver.cancel` and one for `driver.stop`, none for a pause; and its census comment (`:1858`) says `RunControlRefused` is thrown *from driver.cancel()* | **YES — one row**: *"`driver.pause(options)` / `driver.unpause(options)` the driver will not make — `RunControlRefused`, `control: 'pause'` or `'unpause'`, `reason` `not-started`, `halted`, `cancelled`, `interrupted`, `paused`, `not-paused`, or (a pause) `ended`; nothing recorded (`RN-R35`, ADR 0106, section 8)"* — and the census comment *"from driver.cancel(), stop(), pause() and unpause()"* | **Leave it**: section 8's table states the refusals |
| **S-2** | **`AGENTS.md` section 6's cancel table** (`:1100-1107`) names every road a task can be on when its run is cancelled; a task HELD by a pause is a new one | **YES — one row**: *"a task HELD by a pause (section 8) — handed to the scheduler and cancelled at once, so it too ends with a `task.cancelled`"* | **Leave it**: section 8's table states it from the pause's side |
| **S-3** | **`AGENTS.md` section 18's stop table** (`:3870-3880`) — a stop of a paused run sends a held task nothing and its checkpoint resumes PAUSED | **YES — one row**: *"a task HELD by a pause (section 8) — sent nothing: it stays in flight, and the checkpoint resumes PAUSED, held again until you unpause there"* | **Leave it**: section 8's table states it |
| **S-4** | **`doc/scheduler-upstream.md:36`** — *"and S6 waits for P34"* — the register's opening paragraph, not S6's row | **YES — four words**: *"and S6 is not needed (P34's pause, W175)"* | **Leave it**: the index row below says it |
| **S-5** | **`RunHandle.pause()` / `unpause()`** — `src/scheduler/runtime.ts` and `test/scheduler/**` are not in the row | **NO — leave it**: (e) names the call on the driver, W173's cancel set the precedent of no handle method (its R8), and `handle.driver.pause()` reaches it; `AGENTS.md` section 11 says so | **YES** — widen `Owns` by `runtime.ts` and a runtime case: one forwarding method each, as `RunHandle.stop()`; BREAKING only for code that builds a handle |

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | real tree held still: `lint` 153 files, `check:spec` 7 / 75 / 142 rules, `check:docs` 46 snippets (40 run, 6 check), L1-L5 **69 files / 1875 cases** in node 24.20.0, deno 2.9.6 and chromium, L6 **2664**, 0 failed, in node and deno |
| B′ — `check:docs:selftest` (an executed snippet added) | **RAN, EXIT 0** | 24/24 noticed, before the readers; and inside `gate:item` below |
| L1 — `RN-R34` | **RAN** | `test/fold/paused.test.ts`, eight cases; F1-F6 |
| L2 — nothing handed on while paused, the held tasks `dispatched` and `running`, handed on in dispatch order at unpause | **RAN** | `test/driver/pause.test.ts` case 0 (the fixture where every wrong order differs) and case 4 (a dispatch on the hand-off's stack); P1-P3, P40-P43 |
| L2 — a paused run stopped and resumed resumes PAUSED | **RAN** | cases 2 and 6 (and case 12, a dispatch caused on `resumed`); P11-P18 then N2-N4 |
| L2 — a paused run cancelled ends `cancelled`, every held task settled by the scheduler | **RAN** | case 7 (and case 11, a cancel on a held task's own element); P5-P10, N1 |
| L3 — folded twice | **RAN** | the fold suite's L3 case (35 sequences) and the pause suite's case 0 |
| P34 prediction 7 | **RAN — HOLDS** | M3: with the item built and nothing else touched, the only red were the five census sites; no routing, resume, cancel or stop assertion moved |
| real-scheduler probe | **RAN, not checked in** | M5: node and deno, inline and threaded |
| conformity reader | **RAN** | two DEFECTS (D1, D2), two GAPS on the design (G1, G2), one stale in-`Owns` sentence (G3), notes N2, N4, N5, N9 and a new out-of-`Owns` site (S-6) — all acted on below |
| adequacy reader | **RAN** | 62 probes: 52 killed, 4 equivalent (its D5 = the author's P4, U7, C7 = P9, F6), and six real gaps (D6, Z7, U5, M7, R12, Z6) plus RN-R35's owed mid-step throw on `paused` — each given an assertion |
| author's provocations, re-run after the readers' items | **RAN** | `C:/tmp-w175/mutate.mjs` in the byte copy re-synced with the final tree: CONTROL clean; **62 one-clause probes, 59 KILLED, 3 SURVIVED — each argued equivalent**; every file restored, digest equal |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items and E1-E5 (this Record written before it, but for this row and the Status line): the ladder — `lint` 153 files, `check:spec` 7 / 75 / 142 rules, `check:docs` 46 snippets (40 run, 6 check), L1-L5 **69 files / 1877 cases** in node 24.20.0, deno 2.9.6 and chromium (1854 at M1: +8 `paused`, +14 `pause`, +1 l4-corpus count), L6 **2664**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 845.0 s wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation table, whole** — the table under *The author's provocations*, re-run after the readers:

| id | the clause broken | verdict, killed by |
|---|---|---|
| F2-F6 | the fold: `unpaused` not clearing; `paused` not setting; the arm moving the outcome; `emptyState` paused; `resumed` lifting the pause | KILLED, each — F4 after the readers by the *pause as the LAST element* assertion (it survived the re-run once G1 stopped appending a pause after a halt) |
| P1-P10 | the dispatch hold and its clauses; `handedOn`; the cancel's release, emptying, marking and hand-off | KILLED, each but P4 and P9 (below) — P8 by the readers'-round case *a second cancel inside the first cancel's hand-off* |
| P14-P44, P39a, P39b | the replay's feed; taken at rest; every refusal clause; the take and its step; the hand-off | KILLED, each — P39 re-cut as P39a/P39b |
| N1 | D1 reverted: a dispatch held after a halt or cancel request on its own element | KILLED — the new case 11 |
| N2 / N3 / N4 | the paused resume handing on / holding nothing / holding AFTER `resumed` (D2 reverted, COMPOUND) | KILLED, each |
| N5-N9 | G1's drop removed; each of its three clauses dropped; a drop beside a pending stop | KILLED, each |
| A1 / A2 | a held configuration altered at the dispatch / at the resume (the adequacy reader's D6, Z7) | KILLED |
| A3 | the hand-off BEFORE the `unpaused` element (U5, COMPOUND) | KILLED |
| A4 | a fed element not appended as stored (Z6) | KILLED |
| P11-P13 | the in-loop pause branch of the resume | RETIRED with the code (D2 moved the hold before `resumed`) |
| **F1** | the fold's flag short-circuit | **SURVIVED — EQUIVALENT, declared**: deep-equal state either way |
| **P9** | the cancel's `finally` unmarking released ids | **SURVIVED — EQUIVALENT, declared** (the adequacy reader's C7): `handOn` unmarks each in its own `finally` |
| **P4** | the dispatch hold leaving the held id in `unhanded` | **SURVIVED — EQUIVALENT, found** (the adequacy reader's D5): `handedOn` excludes a held task, and both roads out of the hold re-mark it |

**The adequacy reader's own rows**, as reported: 62 probes, 52 killed; equivalent D5 (= P4), U7, C7 (= P9) and F6; real gaps D6
(held config never compared), Z7 (the same on resume), U5 (the `unpaused` element before the hand-off's effects), M7 (the
take's outer `finally`), R12 (both calls refused after a stop), Z6 (fed elements appended as stored) — each now an
assertion, probed as A1, A2, A3, P39b, P33 and A4, all KILLED.

**What was done for each finding.**

| | finding | done |
|---|---|---|
| **D1** (DEFECT, constructible) | a cancel raised on a HELD task's own `dispatched` element left it held for ever — `cancelling` for ever, `done` never | **fixed**: `dispatch` holds only while `!shut()`, so that task is handed on as `RN-R29` (i)'s dispatch in progress and the request cancels it; the halt variant pinned too. `RN-R35`, ADR 0106 decision 4; case 11; N1 |
| **D2** (DEFECT, constructible) | a paused resume re-held its in-flight set AFTER `resumed`, so a dispatch caused on that element jumped the queue | **fixed**: the whole set is held BEFORE `resumed` is appended. `RN-R21`, `RN-R35`, ADR 0106 decision 8; case 12; N2-N4 |
| **G1** (GAP) | a pending call taken after its step halted or cancelled the run appended `paused` after `cancelRequested` | **changed**: such a call is DROPPED at the take, recording nothing; not when the step merely ended the run or a stop is pending. **RATIFIED by the maintainer 2026-10-17.** R6, `RN-R35`, ADR 0106 decision 3; case 3's halt, RN-R28, requested-cancel and pending-unpause variants; N5-N9 |
| **G2** (GAP) | a task RUNNING at a paused run's stop is held on resume — wider than (e)'s words | **stated** as R12, in `RN-R21`, `RN-R35` and ADR 0106 decision 8, with the reason; case 6's control resumed |
| **G3** | S6's *What we do without it* said a pause holds routing decisions | **fixed** within S6 |
| N2 / N4 / N9 | the Spec field omitted `RN-R22`; §8 had no warning that `paused` can read true on an ended run; ADR 0103's pointer ambiguous | **fixed**, each |
| N5 | a throw on a pause element taken at `leaveStep()` from a scheduler event escapes into `dispatchEvent` | **noted** (R14), not changed — inherited from W174's `takeStop`; for P34's retro |
| adequacy D6, Z7, U5, M7, R12, Z6; RN-R35's mid-step throw on `paused` | each unasserted | **an assertion each**, in `test/driver/pause.test.ts` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) src — `pause`, `unpause`, `RunPauseOptions`, the refusals, `paused`/`pauseHeld`/`pausePending`, the hold, the hand-off, the cancel's release, the paused resume, the fed kinds, the fold's arm and cell | yes | F2-F6, P1-P44, N1-N9, A1-A4 |
| (2) spec run-state v0.20, spec/README.md | yes | `check:spec` C2/C6 (two new rules), C8 (version columns); the prose by no test |
| (3) ADR 0106 | yes | `check:markdown`'s links from the spec and the code; `check:register` |
| (4) AGENTS.md sections 8, 11 (and E1-E3, E5) | yes | `check:docs` X4 runs section 8's new snippet; `RUN_FLOOR` 40 |
| (5) doc/scheduler-upstream.md S6 (and E4) | yes | `check:markdown`'s links; nothing else reads it |
| (6) tests | yes | the tables above; l4-corpus's counts of 14 and 8; the census rows; `DRIVER_FIELDS` in both lists |

**Exceptions** E1-E5 — the maintainer's YES to S-1..S-4 and S-6, 2026-10-17, each applied minimally (the `Owns` block names
each site); **S-5 DECLINED** — no `RunHandle.pause()`, `src/scheduler/runtime.ts` untouched, the call reached as
`handle.driver.pause()`. **The departures ratified** the same day: R1 (taken at rest), `RN-R13` among the moved rules, R11
(the closing note inside S6's section), and G1's drop. **Owns, checked by hand** (`git status --porcelain` against that
block): every file changed is in P34's W175 row, one of E1-E5, or a record-step file (`doc/decisions/**`, this file).
Every changed file LF, no carriage return.

**Record-step files**: ADR 0106 (new); pointers in ADR 0103 (two consequences), ADR 0104 rule 7, ADR 0105's last
consequence; this file. The plan's Record is the join's. `README.md` not edited; `doc/questions/**` not edited.

**What broke.** At the ladder, nothing. The design broke twice at the readers' — both at a SEAM between the pause and an
earlier item's mechanism: a cancel on a held task's own element met the hold after the cancel had emptied it (D1), and the
resume's hold ran after the `resumed` element whose callbacks dispatch (D2). One reading reversed (G1), one widened in
writing (G2).

**What this taught.**
- **A new hold meets every older halt at its OWN door**: D1 is ADR 0103's inherited hazard (`RN-R29` (i)) once more, for a
  hold that is not a halt. An item adding a form of the hold walks each halt on the task-in-progress's element.
- **An element whose callbacks can dispatch must come AFTER the state those dispatches queue behind** (D2) — the same
  shape as W174's R2 (deaf before the element): set the driver's state, then append.
- **"Taken at rest" generalises**: any element the replay feeds must land between two steps — a stop's and a pause's
  alike. For P34's retro.

**Questions raised.** None — Q655-Q657 unused, skipped. **Handed on**: N5 (a throw on a pause element at `leaveStep()`
escaping into the scheduler's `dispatchEvent`) beside W174's C5 note, to P34's retro.
