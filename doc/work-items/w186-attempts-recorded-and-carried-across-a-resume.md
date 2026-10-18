# W186 — a task's ATTEMPTS, recorded and carried across a resume: `attempted` and `attemptsSpent`

**Status:** done 2026-10-18 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, no BLOCKER, A1-A4, C3, C4 and C6 acted on, A5, C1, C2 and C7 noted for the plan; R1 and R4 confirmed by the coordinator; Q365 and Q26 closed; no question raised; not committed. Earlier: READY-FOR-READERS 2026-10-18 (`npm run gate` EXIT 0); declared 2026-10-18 on `d2f724d` (W185 done); P36's THIRD item: fyflow-app's #10 with #18's answer, stop-and-asks (f)-(i) as answered, facts 3 and 6-8; ADR 0113 (reserved for it); not committed
**Plan:** [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) — *which run and attempt does a
task's activity belong to, without parsing its id, and what of a run survives a crash and a resume?* — the fyflow-app asks
**#10** (a resumed task starts at a fresh retry budget) and **#18** (does a stopped attempt count as spent?). **As
answered**: (f) a FED fold input `{ kind: 'attempted', taskId, attemptNumber }`, appended on `task.running` for this run's
own tasks only when the number exceeds the last recorded for that task — a requeue appends nothing — for EVERY task; the
replay feeds it; BREAKING for `FoldInput`. (g) a resume re-hands each in-flight task with `attemptsSpent` = the highest
recorded number, the key optional on `TaskFactory`, present only when > 0, also for a task with no `retryPolicy`; a spent
budget is handed on anyway and the scheduler runs it once; `AGENTS.md` warns a field-by-field `createTask` must copy the
key. (h) a stopped attempt counts as spent, as a kill does — no special case. (i) `OutcomeRecord.attempts` keeps the
scheduler's value, now including earlier processes' attempts. ADR 0113 amends ADR 0065's *fresh budget*; closes
[Q365](../questions/q365.md) and [Q26](../questions/q26.md) at the record step.

```
Spec:       spec/run-state.md v0.25 -> v0.26: `RN-R40` (NEW, section 17) — each attempt recorded, at rest, and the highest
            handed on; `RN-R19` (the seventh fed kind), `RN-R21` (`attemptsSpent`, the FRESH-budget clause replaced and kept
            visible), `RN-R26` (the fed-kind count) and section 4's *no `pending`* and section 9's intro and *does NOT fix*
            list move. spec/outcome-record.md v0.19 -> v0.20: `OR-R4` (where `task.running` is recorded; Q26 answered) and
            section 2's `attempts` (P36 (i)). spec/task-id.md v0.14 -> v0.15: section 1's `attempt` bullet, one sentence.
            spec/README.md: the three rows and their version columns. Next free rule id `RN-R41`.
Owns:       from P36's W186 row, exactly: src/driver/driver.ts, src/driver/listener.ts, src/fold/run-state.ts,
            src/scheduler/runtime.ts (if its readers move — none did: the router routes `task.running` by `detail.id` as it
            routes a settlement, unchanged), spec/run-state.md, spec/outcome-record.md (`OR-R4`, `attempts`),
            spec/task-id.md (section 1's `attempts` sentence), spec/README.md, test/driver/**, test/fold/**,
            test/scheduler/**, test/definition/l4-corpus.test.ts, examples/l6.ts (`DRIVER_FIELDS`, if moved — moved; and
            reading R4: the rows P36 prediction 3 says MOVE), examples/run-flow.ts (`NOT_RUN_STATE`, if moved — not moved;
            reading R4: `onDelivery`), AGENTS.md (the WHOLE file, D′), scripts/check-docs.mjs, doc/decisions/0113-*.
            Exceptions: none declared. Anything else found to need an edit is a STOP-AND-ASK (S-n), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q365 and Q26 closed — their
            `resolved-by` ADR 0113, and ADR 0113's `resolves` then names both, `check:register` `R8`; Q686-Q689 only if
            raised), doc/decisions/** (ADR 0065's dated pointers — rule 77's and consequence 2's *fresh retry budget*), the
            plan's Record, README.md, this file.
            Overlap with W185 (serial, done): src/driver/driver.ts, spec/run-state.md, spec/README.md, test/driver/**,
            test/scheduler/**, test/definition/l4-corpus.test.ts, AGENTS.md, scripts/check-docs.mjs. With W187 (next): the
            same, plus src/fold/run-state.ts, src/driver/listener.ts, spec/task-id.md, test/fold/**, examples/l6.ts and
            examples/run-flow.ts, less doc/decisions/0113-*.
Inputs:     P36 stop-and-asks (f)-(i) as answered, facts 3, 6, 7 and 8, prediction 3, decisions 6-9, the census sites D′
            names for this row (`RUN_FOR`, `isFed`, `DRIVER_FIELDS`/`NOT_RUN_STATE` if a field is added, the premises *a
            re-run task gets a FRESH retry budget* and *`task.running` produces no record* / *the driver subscribes to
            four*), sentences B′, C, D′, E and the two brief sentences; W184's and W185's Records (a halt lands at the element
            thrown on; a sweep asserts what FOLLOWS; a copy claim's observer on the copy itself; W185's census note — a
            new `DriverOptions`/`StartOptions` member moves the binding count: none is added here); the scheduler's own
            `AGENTS.md` at the pin (`attemptsSpent`, `attemptNumber`, `task.running`, `retryPolicy`, the *Resuming after a
            restart* recipe); ADR 0065, ADR 0007, ADR 0060 rule 3, ADR 0088, `RN-R19`-`RN-R21`, `RN-R33`, `OR-R4`.
Outputs:    (1) src/driver/driver.ts: `task.running` subscribed (`SUBSCRIBED_EVENTS`, five names); `heardRunning` — the
                id and number copied in the listener, own dispatched tasks only, the number RISING only, everything else
                dropped silently; two fields — `lastAttempt` (the highest recorded per task) and `attemptsPending` (heard,
                not yet appended); `takeAttempts`, called FIRST by `leaveStep` when a step ends — one step of its own, a
                consumer throw on it `OR-R10`'s; `isFed` gains `attempted` and `feedOne` feeds it (refused `diverged` for an
                undispatched task or a malformed number); `resumeStep` re-hands each in-flight task with `attemptsSpent` the
                highest recorded (the held configs, so a paused resume carries it too); `TaskFactory`'s config gains the
                optional `attemptsSpent`; the module-private `attemptNumberOf`; `freezeInput`'s flat-kind count.
            (2) src/fold/run-state.ts: `FoldInput` gains `{ kind: 'attempted'; taskId; attemptNumber }` (BREAKING); `step`'s
                arm returns the state it was handed. src/driver/listener.ts: `TaskDetailLike.attemptNumber?` (additive) and
                `OR-R4`'s comment (Q26 answered).
            (3) spec run-state v0.26 (`RN-R40`, section 17), outcome-record v0.20, task-id v0.15, spec/README.md's rows.
            (4) tests: test/driver/attempts.test.ts (L2, NEW, 13 cases); test/fold/attempted.test.ts (L1/L3, NEW, 4);
                test/scheduler/runtime.test.ts — a W186 suite (2, through `createRuntime`) and the three subscription
                counts (4 -> 5); test/driver/checkpoint.test.ts — `RUN_FOR`'s sixteenth entry and its count; the
                `DRIVER_FIELDS` ratchet (test/driver/retention.test.ts); test/driver/cancelled.test.ts's subscription
                list; l4-corpus's census (+3) and a per-suite count case.
            (5) examples/l6.ts: `DRIVER_FIELDS` (+2); the rows prediction 3 names (M5); examples/run-flow.ts `onDelivery`.
            (6) AGENTS.md: section 3 (the `retryPolicy` row, *what `attempts` counts*), section 12 (*a field-by-field
                `createTask` must copy `attemptsSpent`*, the snippet's *subscribes to four*), section 18 (the FRESH-budget
                bullet rewritten, the TRUSTED-store bullet, the stop table's attempt row, a new subsection with one `run`
                snippet, the BREAKING paragraph); `RUN_FLOOR` 45 -> 46.
            (7) doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md.
Depends on: W185 (done, `d2f724d`)
Blocks:     W187
Tests:      L2, expected values hand-written from (f)-(i), `RN-R19`-`RN-R21` and each flow's shape, never from output, over a
            double that plays the scheduler's numbering (an INLINE mode firing `task.running` inside `addTask` with
            `(attemptsSpent ?? 0) + 1`, M3's measured shape): an increasing sequence and a requeue repeating a number (and a
            lower one) — one element per rise; another run's, an unminted, an undispatched and five malformed details —
            nothing appended, nothing reported, beside the controls that each channel is live; every policy; an inline
            double's attempts appended after the whole step, ARRANGED BOTH WAYS against the same attempts heard later, and
            its checkpoint resumed; the attempts taken before a pause and a stop called mid-step; (h) — attempts before
            `interrupted`, one after the stop not recorded (the control: the double fired it), the resume re-handing 2; the
            fed resume — the stored prefix regenerated, `attemptsSpent` the highest on one task and ABSENT on another,
            beside the control cut before the attempts, and a requeue after the resume; no `retryPolicy` and a spent
            budget handed on with no settlement written (the control: the scheduler's settlement then appended); five
            forged elements refused `diverged` at their position, beside the unforged control resumed; a paused resume's
            held task carrying the key to the unpause; a throwing callback on a scheduler event's step and at `start()`'s
            step end (`OR-R10`), beside a non-throwing control; a run with no `task.running` unmoved. L1/L3: eight outcomes,
            with and without the elements, equal at every prefix; `step`'s identity; folded twice. L1 through
            `createRuntime`: two runs on one runtime each recording only its own attempts, an unminted id's recorded by
            neither (the control: its settlement reaches both); `runtime.resume` with the DEFAULT factory handing the
            scheduler a `FyflowTask` carrying `attemptsSpent` 2 and the other its own 0. `RUN_FOR`'s sixteenth run. RED on
            `d2f724d`'s `src/` where a behaviour is claimed (M3). A real-scheduler probe (M7), not checked in: P36's exit
            clause 4's shape in node and deno. One-clause mutations (sentence E) in the byte copy C:/tmp-w186/m, graded on
            each suite's failure lines, grader controls (clean, crash); a time-out is NO VERDICT.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. The row's clauses: L2 one `attempted` per `task.running` of a
            dispatched task, none for a repeated number (a requeue), none for another run's or after a stop; fed at its
            position by the replay and refused `diverged` nowhere it was stored; a resume re-handing each in-flight task
            with `attemptsSpent` the highest recorded, ABSENT where none was, and a spent budget handed on; a stopped attempt
            counted ((h)); `RUN_FOR`'s sixteenth run; L3 folded twice; every flow on a double that fires no `task.running`
            byte-identical in its fold inputs; Q365 and Q26 closed at the record step.
Reserves:   Q686-Q689 (P36's per-item line); ADR 0113 (P36 decision 9)
```

## Scope

**In** — Outputs (1)-(7).

**Out** — named rather than left implicit, with where it goes instead

- **`NodeRun`'s `runId`, `flowAttempt` and `attemptNumber`** — W187 ((j)): the fold moves nothing for `attempted` here,
  and W187 reads it.
- **`task.message`, `task.progress`, the router's `detail.taskId`** — W187 ((k), (l)).
- **`task.retrying` as an element** — out ((n)).
- **An L6 row of its own** — W188's exit artifact clauses (4)-(6) run the attempt count on real workers in both runtimes;
  M7's probe is clause (4)'s shape, run here and not checked in. No L6 assertion or run is ADDED here (`X10` unmoved).
- **A `DriverOptions` or `StartOptions` member** — none: the binding count (21), the observer map and `RESUME_OMITS` do
  not move (W185's census note does not bind this item).
- **`src/driver/ids.ts`'s `TaskIdParts.attempt` comment** — named by P36's premise list for *W186-W187*; read and still
  TRUE (*the scheduler's `attempts`, which counts retries within one task* — a resume re-dispatches at the same id), and
  outside this row's `Owns`: not edited.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `check:docs:selftest` (B′: a snippet
added); the author's ONE-clause provocations in the byte copy `C:/tmp-w186/m`, each graded on the named suites' `FAIL`
lines; then the readers; then `npm run gate:item` once. Routing coverage: a nested fan-out (Q6), no matching decision edge
(Q10), a branch routed away from its join (Q4) — not applicable: no routing rule moves, and `attempted` is appended outside
every routing step; `user_action` (Q17) — covered: a task out of retries parks with its attempts recorded (the fold
suite's `awaiting_action` row, M7's probe); a duplicate task id (Q13) — not applicable: a requeue repeats an attempt
number under one id, which is (f)'s *nothing appended*, and no id is minted.

## What the declaration step measured

*Measured 2026-10-18 in a BYTE COPY of `d2f724d` (`git archive` into `C:/tmp-w186/m`, `node_modules` copied, never linked;
`find -type l` zero), node 24.20.0, deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node test/runner.ts` EXIT 0: 76 files / 2002 cases |
| M2 | **P36 prediction 3, L1-L5 half**: the `src/` change ALONE (no test touched), `node test/runner.ts` | **5 cases RED and none a sequence**: `test/driver/cancelled.test.ts`'s subscription list, `test/driver/retention.test.ts`'s `DRIVER_FIELDS` ratchet (the two new fields, by name), and `test/scheduler/runtime.test.ts`'s three subscription counts (rule 2's list, rule 7's count, the release's count — `4` -> `5`, W158's E2 precedent). Every other case of 76 files green: NO fold-input sequence on a double moved — no double in `test/**` fires `task.running` with an `attemptNumber` (`cancel.test.ts` and `stop.test.ts` fire it with none, which records nothing). `RUN_FOR` is `typecheck:tests`'s alone (L0), as at W93 and W180 |
| M3 | **`task.running` at the pin, inline and threaded** — `scratch-w186/probe-sync.ts`, a real `FyflowScheduler`, two `addTask`s | node and deno byte-identical: on an INLINE pool `task.running` fires SYNCHRONOUSLY INSIDE `addTask` (`add a begin`, `running a #1`, `add a end`); on a THREADED pool after both `addTask`s returned, on a later turn. **So an `attempted` element appended where it is heard sits between two elements of the driver's own step** — reading R1 |
| M4 | the new suites against `d2f724d`'s `src/` (written from (f)-(i) before any run; `src/` swapped and restored, SHA-256 equal) | `attempts.test.ts`: **11 of 13 RED** (re-taken after the forgery case gained its arrangement — on the first take it was GREEN: an unfed `attempted` is refused `diverged` by the regenerated-element check anyway, so it claimed nothing `d2f724d` lacks until it held the stored run to carry a real `attempted` element); GREEN: the *no `task.running`, unmoved* case (it claims nothing moves) and the membership. `attempted.test.ts`: 3 of 4 RED (the fold threw on the kind). `runtime.test.ts`: W186's two and the three counts RED |
| M5 | **P36 prediction 3, L6 half** — the `src/` change alone, `node examples/l6.ts` | **39 of 2743 assertions RED, 203 runs** — every one a value the new elements move, none a run refused or a crash: the four pair rows' *what this driver was HANDED* (`task.running` delivered too — `onDelivery`, reading R4); block (2g)'s claims (2), (3), (4), (5), (7), the cuts claim and the K = 1 control — its *next stimulus past the cut* was a settlement and the replay now stops at the next FED element, an `attempted` one (reading R5); block (2h)'s re-dispatch claim (the same); W160's three per running road and its control; W176's (1) c3/c4/c11, (2) s2, (3) k1/k2, (4) u1 ×2, (5) four; W182's (1) a3, (4) d2/d3, (5) e1/e3, (6) f2/f4; and `DRIVER_FIELDS`. After the edits (R4, R5 and each row's expected values written from the scheduler events each row already reads): node and deno **EXIT 0, 2743 assertions, 203 runs** — `X10` unmoved |
| M6 | **B′ / D′ — the census sites**, each by its lane | `RUN_FOR` +1 and its count 15 -> 16 (`checkpoint.test.ts`); `isFed` 6 -> 7; `DRIVER_FIELDS` +2 in BOTH lists (`lastAttempt`, `attemptsPending` — WALKED, no result); `NOT_RUN_STATE` unmoved; `LATE_SUITES` +3 and a per-suite count case (13, 4, 2); the subscription counts 4 -> 5 (three cases) and a list (one); `RUN_FLOOR` 45 -> 46 (`check:docs`; `check:docs:selftest` run, the Record); spec versions run-state v0.26, outcome-record v0.20, task-id v0.15 and their three `spec/README.md` rows; next free rule id `RN-R41`. **Unmoved**: `X10` (2743 / 203), the `StartOptions` binding (no member), `check:budget` (no always-read document edited). Node: **78 files / 2022 cases** (+2 files, +20 cases) |
| M7 | **a real-scheduler probe — P36 exit clause 4's shape** — `scratch-w186/probe-resume.ts` + `fail-worker.ts`, `createRuntime` over a real `FyflowScheduler`, an inline pool counting worker calls on `globalThis`; not checked in | node 24.20.0 and deno 2.9.6 EXIT 0, **the same JSON byte for byte**: a task of `retryPolicy: { maxRetries: 2, backoffMs: 300 }` whose worker always fails, its store frozen at its SECOND attempt's `attempted` element, the runtime shut down (it drained attempt 2; the retry's backoff was discarded), resumed on a FRESH runtime: handed `attemptsSpent: 2`, the tail `resumed`, `attempted #3`, `outcome user_action attempts=2` — **three worker calls across both processes**. **The CONTROL** — the same store with its `attempted` elements removed: handed `attemptsSpent` 0, the tail `attempted #1, #2, #3` — **five** |
| M8 | **now-false statements** — `git grep` over the tree but `dev-dist/` and `node_modules/` for each changed name (`SETTLEMENT_EVENTS`, `isFed`, `TaskFactory`, `attemptsSpent`, `attemptNumber`, `task.running`) and each PREMISE (*a re-run task gets a FRESH retry budget*, *two attempts ran three times*, *`task.running` writes no record* / *the only signal the fold has is the dispatch*, *the driver subscribes to four*, *fifteen kinds*, *six fed kinds*, *the log records `attempts` only at a settlement*, *whether the driver logs any of them is Q26*) | rewritten in `Owns`: `resume()`'s doc, `isFed`'s, `freezeInput`'s count, `TaskFactory`'s (src/driver/driver.ts); `NodeState`'s *no `pending`* (src/fold/run-state.ts); `OR-R4`'s comment (src/driver/listener.ts); `RN-R19`, `RN-R21`, `RN-R26`, section 4's *no `pending`*, section 9's intro and *does NOT fix* (spec/run-state.md); `OR-R4` and `attempts` (spec/outcome-record.md); task-id section 1; AGENTS.md sections 3, 12 and 18; `onDelivery`'s doc (examples/run-flow.ts). **Outside `Owns`, record-step files**: ADR 0065's rule 77 and consequence 2 — a dated pointer each, at the record step. **Still true, left**: `src/driver/ids.ts`'s `TaskIdParts.attempt` comment (Out, above); `listener.ts`'s *the four settlement events*; spec/task-id.md section 2's duplicate-id `task.running` (a pin citation); `doc/concept.md` section 3's *none subscribed yet* — NOT false: that row (line 80) lists `task.retrying`, `task.cancelling`, `task.cancelled` and `task.message`; `task.running` is on line 79, which says nothing of subscription (*corrected after the conformity reader's C3 — this cell first said it was false for `task.running`*) |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **An `attempted` element is appended when the step it was heard on ENDS** — every attempt heard on a step, in the order heard, as ONE step of its own, FIRST at `leaveStep` (before a pending pause, unpause, answer or stop) | M3: an inline pool fires `task.running` INSIDE `addTask`, on the driver's own step; appended there it lies between two elements of one step, and the replay — which regenerates a step whole — refuses the checkpoint `diverged` (P36's own premise, *appended on a scheduler event's own step*, holds on threaded pools only). The brief's sentence — *an owner element a resume's replay feeds is TAKEN AT REST* — applied to the one scheduler element fed. First, so the attempt in flight at a stop called on the step is in the log before `interrupted` ((h)). One step of its own, so a stop called from a callback on it is taken after the rest; a loop, not a recursion, so a fan-out of thousands on an inline pool does not deepen the stack | `RN-R40`; ADR 0113 rule 3 and its rejected row; `takeAttempts`' doc; L2 cases 4 and 5. **The coordinator may wish to confirm it**: it is the plan's sentence applied, not a new fork, but the plan did not measure M3 |
| **R2** | **What is dropped is dropped SILENTLY** — another run's id, an unminted id, our own undispatched task, a detail with no positive integer `attemptNumber` — no `onUnmintedTask`, no `UndispatchedTask` | (f) says *own tasks only*; P36 (k)'s rule for the pass-throughs (*a message never stops a run by existing*) is the nearest stated precedent; the SETTLEMENT of each of those ids is still reported by its existing channel, so nothing goes unheard — and reporting an unminted id's `task.running` too would double every plain task's report on a shared scheduler | `heardRunning`'s doc; `RN-R40`; L2 case 2 (with the three channels' controls) |
| **R3** | **A stored `attempted` the replay cannot place is refused `diverged`** — a task the replay never dispatched (`ID-R4` asked of the replay, as for a stored settlement), a number that is not a positive integer, or — after the readers (A3, C5) — a number that does not RISE over the last stored for its task | (f) says *fed*; `RN-R20` refuses a stored settlement for an undispatched task at its position, and a malformed number would reach the scheduler's `FyflowTask` constructor as `attemptsSpent` and THROW there (`RangeError`, its §5) — after `resumed` was appended. Refused before anything is handed on instead | `feedOne`; `RN-R19`, `RN-R40`; L2 case 9 |
| **R4** | **`examples/l6.ts` and `examples/run-flow.ts` are edited beyond their row's parentheticals** — the 39 L6 assertions M5 names, and `onDelivery` recording settlement events only | both files are in the row's `Owns`; P36 prediction 3 says *L6's existing rows that compare a whole sequence or count elements MOVE, and W186's copy names them* (M5 names them); `onDelivery`'s *one entry per scheduler event* was a settlement count by construction (*installed after `start` returns, before anything can settle*) — `task.running` on an inline pool fires before it is installed, so counting it would be a sample of that timing. W185's R3 precedent: *the same file, a clause the change itself falsifies* — stated, not asked | M5; `onDelivery`'s doc; each L6 row's W186 comment. **The coordinator may wish to confirm it** — the alternative is a stop-and-ask per file with the gate red meanwhile |
| **R5** | **L6 block (2g)/(2h)'s *next stimulus past the cut* is the next FED element, not the next settlement** — `isFedElement` beside `isStimulus`; the kill points stay settlements (no run count moves) | `RN-R19` decides where a replay stops regenerating, and `attempted` is fed since v0.26. The cuts claim's *`resumed` lands at the same position after both cuts* was true while every fed element was a settlement; the mid-step store now LOSES the step's `attempted` elements the quiescent one holds, so its `resumed` lands where they begin — asserted, with the lost elements held equal to the step's dispatches' first attempts, both from the killed run | examples/l6.ts block (2g)'s `isFedElement` doc and the cuts claim's comment |
| **R6** | **`lastAttempt` is kept for the life of the run**, one integer per task that ever started | `dispatched`'s precedent (ids for the life of the run); dropping an entry at settlement would add a clause and a test for no reader — a settled task is never re-handed. No result: not an `RN-R13` term | the field's doc; `DRIVER_FIELDS`' comments |

## Predictions, and what happened

| | prediction (at declaration) | outcome |
|---|---|---|
| 1 | **P36 prediction 3**: every flow on a double that fires no `task.running` byte-identical in its fold inputs; on real workers each run's sequence grows by exactly one `attempted` per attempt started — so L6 rows comparing a whole sequence or counting elements MOVE, named by this copy; `RUN_FOR` the one L0 site | **HOLDS** at L1-L5 (M2: five cases, none a sequence) and at L6 (M5: 39 value assertions, each by one `attempted` per attempt the row's own scheduler events show started — W160's, W176's and W182's rows read `task.running` in their own observers). **One refinement**: block (2g)'s and (2h)'s derivation of *where `resumed` lands* moved too (R5) — a counted position, not a compared sequence. `RUN_FOR` is L0's (M2) |
| 2 | census: `RUN_FOR` +1, `isFed` +1, `DRIVER_FIELDS` +2, `LATE_SUITES` +3, `RUN_FLOOR` +1, one rule id (`RN-R40`), no `X10`, no binding-test pin | HOLDS (M6) |

## The author's provocations (before the readers)

`C:/tmp-w186/mutate.mjs` in the byte copy `C:/tmp-w186/m`; each anchor checked to occur once in the CURRENT text, every
file restored from its FIRST snapshot and its SHA-256 compared after every probe and at the end (all equal); graded on the
`FAIL` lines of `node test/runner.ts` for `driver/attempts`, `fold/attempted`, `scheduler/runtime`, `driver/checkpoint` and
`driver/cancelled` (P21 on `tsc -p tsconfig.json`, L0); a time-out NO VERDICT (none); an import failure CRASH. **Grader
controls**: CONTROL graded CLEAN; GRADER-CRASH graded CRASH. **Before the readers: 21 one-clause probes, 20 KILLED, 1 SURVIVED
(P3, a declared equivalent)** (`C:/tmp-w186/mut.log`). **Re-run after acting on the readers, their surviving probes added
(P22-P25): 25 one-clause probes, 24 KILLED, 1 SURVIVED (P3)**, no NO VERDICT, every file restored and its digest equal
(`C:/tmp-w186/mut2.log`, `C:/tmp-w186/mut2.json`). P12's anchor moved with the A3 fix (the fed number is now set
unconditionally, behind the new refusal).

| id | the ONE clause broken | verdict — killed by |
|---|---|---|
| P1 | SUBSCRIBE — `task.running` not subscribed | KILLED — 11 L2 cases, the five runtime cases (three subscription counts, W186's two), `RUN_FOR`'s round trip, the subscription list |
| P2 | DISPATCHED — our undispatched task's attempt recorded | KILLED — L2 *none for another run`s task…* only |
| P3 | OWN RUN — the run-id test removed, the dispatched test kept | **SURVIVED — an EQUIVALENT mutant, declared by id**: `dispatched` holds only ids this driver minted with its own run id, so the dispatched test alone drops every foreign id; the second route — on a runtime ADR 0088 routes by run id before the driver sees it — agrees. The clause is kept as `ID-R4`'s tier order, readable, and cannot be killed |
| P4 | RISE — a repeated number (a requeue) appends | KILLED — L2 *one per task.running…* and *a resume FEEDS…* (the requeue after the resume) |
| P5 | RISE — no rise check | KILLED — the same two |
| P6 | NUMBER — any number is an attempt | KILLED — L2 *none for another run`s task…* |
| P7 | AT REST — appended where heard | KILLED — L2 *an attempt heard INSIDE addTask…* (the step and its resume) and *a consumer THROW…* (the throw at `start()`'s end) |
| P8 | FIRST — attempts taken after a pending pause and stop | KILLED — L2 *the attempts taken FIRST…* only |
| P9 | THROW HALTS — rethrown without halting | KILLED — L2 *a consumer THROW…* |
| P10 | SILENT — a throw on an attempt after the halt replaces the first error | KILLED — L2 *a consumer THROW…*, its ONCE clause (written to the rule before the probe ran) |
| P11 | FED — `attempted` not in `isFed` | KILLED — six L2 resume cases and the runtime's FyflowTask case |
| P12 | FEED RECORDS — the fed number not recorded | KILLED — L2 *(h)*, *a resume FEEDS…*, *a SPENT budget…*, the forgery case's control, *a PAUSED resume…*; the runtime's FyflowTask case |
| P13 | FEED REFUSES AN UNDISPATCHED TASK | KILLED — L2 forgery case |
| P14 | FEED REFUSES A MALFORMED NUMBER | KILLED — L2 forgery case |
| P15 | ABSENT AT 0 — the key handed on at 0 | KILLED — L2 *a resume FEEDS…* (ABSENT) and *a run with NO task.running unmoved*; the runtime's FyflowTask case reads `0` either way (the scheduler's default) and does not see it |
| P16 | THE HIGHEST — one less (the in-flight attempt not counted: (h)'s alternative) | KILLED — the five L2 cases P12 names, and the runtime's FyflowTask case |
| P17 | PAUSED RESUME — the held task carries no key | KILLED — L2 *a PAUSED resume…* only |
| P18 | HALTED RUN RECORDS — attempts dropped once halted | KILLED — L2 *a consumer THROW…*, its ONCE clause |
| P19 | FOLD — the arm removed | KILLED — the fold suite's three cases, and four runtime cases whose real runs fold the element |
| P20 | FOLD IDENTITY — a copy returned | KILLED — the fold suite's identity case only |
| P22 | FEED REFUSES A NUMBER THAT DOES NOT RISE (the readers' M2 / A3 / C5) | KILLED — L2 forgery case (*#2 then #1*, *#1 twice*) |
| P23 | HALTED RUN RECORDS — `if (this.failed) return;` at `heardRunning`'s head (the readers' M1 / A2) | KILLED — L2 *none for another run`s task…*, its after-the-halt clause |
| P24 | RESUME'S HAND-OFF — the attempts heard inside `resume()`'s own inline hand-off dropped (the readers' M6 / A1) | KILLED — L2 *a resume FEEDS…*, its inline-resume clause |
| P25 | UNPAUSE'S HAND-OFF — the same in `unpause()`'s (A1's second road) | KILLED — L2 *a resume of a PAUSED run…*, its inline-unpause clause |
| P21 | `RUN_FOR` — the sixteenth entry removed | KILLED — `typecheck:tests` (`TS2353`: the `Record` over the union refuses the entry renamed away from `attempted`), L0 |

**Ceilings, declared by id**: P3 (equivalent, above). Not probed, named: `attemptNumberOf`'s copy AT the listener (`OR-R1`)
— a mutation reading the live detail later needs two edits (keep the detail, read it at the flush), so it is compound by
sentence E and is not counted; the order of attempts heard on one step among themselves — the double hears them in
`addTask` order, which is dispatch order, so a reversal of `attemptsPending` would be a second clause no fixture separates
from the dispatch order (L2 case 4 asserts the heard order, which is that order).

## Stop-and-asks

None raised. Two readings are flagged for the coordinator's confirmation rather than asked: **R1** (the plan's own sentence
applied to M3's measurement) and **R4** (edits in owned files beyond their row's parentheticals, forced by the change and
forecast by P36 prediction 3).

## Notes for the plan's Record

- W187 reads `attempted` for `NodeRun.attemptNumber` ((j)); the fold arm here returns the state unchanged and says so.
- W188's exit clauses (4)-(6) are M7's shape; M7's probe (`C:/tmp-w186/m/scratch-w186/`) is left in place.
- *(Withdrawn, conformity reader C3: this note said `doc/concept.md` section 3's *none subscribed yet* is false for
  `task.running` from this item on. It is not — `task.running` is on line 79, outside that row; nothing is handed to
  W187.)*
- At the record step: Q365 and Q26 closed (`resolved-by` ADR 0113), ADR 0113's `resolves: Q365, Q26` (`R8` binds both
  ways — `resolves: ""` until then), and ADR 0065's two dated pointers.
- This item's Record states its readers' overlap.
- **What broke before READY, for the Record's *What broke***: (1) `check:scheduler` `D7` — the pin's number written in two
  `driver.ts` comments (*a scheduler before …*), rewritten as *older than the pin*; (2) `test:browser` (chromium) — the
  new suite's module-scope `class Boom` took the bundle's `Boom` name and W93's `gate.test.ts`, which reads the literal,
  saw `Boom2` (two cases RED in chromium only, node and deno green) — the classes renamed `AttemptBoom`, `AttemptAgain`,
  `AttemptFake`. Neither touched behaviour; both were caught by their lane on the copy or the tree, not by a reader.
- `npm run gate` on the real tree: **EXIT 0** (`C:/tmp-w186/gate2.log`) — lint, typecheck, every check (`check:docs` 46
  `run` / 6 `check`), L1-L5 78 files / 2022 cases in node, deno and chromium, L6 2743 assertions / 203 runs, 0 failed, in
  node 24.20.0 and deno 2.9.6. `check:docs:selftest` EXIT 0, 24/24 noticed (`C:/tmp-w186/docs-self.log`).

## Readers — round 1 (2026-10-18), and what was acted on

*Both readers ran with fresh contexts, spec first; each reported and fixed nothing. No BLOCKER. The coordinator CONFIRMED
readings R1 (attempts appended at the step's end) and R4 (the `examples/l6.ts` and `examples/run-flow.ts` edits). Every
finding was in `Owns` or a record-step file; none needed a stop-and-ask.*

| reader | finding | kind | acted on |
|---|---|---|---|
| adequacy | **A1 SHOULD** — an attempt heard inside `resume()`'s own hand-off on an inline pool never asserted (its M6 SURVIVED L1-L6); the unpause's hand-off the same, unprobed | test | **FIXED** — the fed-resume case resumes onto the inline double (`resumed`, then a #3, b #1, c #2), the paused case unpauses onto it (`unpaused`, then x #2); probes **P24**, **P25** KILLED |
| adequacy | **A2 SHOULD** — *a halted run records them* untested for a `task.running` on a scheduler event's step after the halt (M1 SURVIVED) | test | **FIXED** — case 2 halts the run by an undispatched settlement, then x #2 is recorded after `halted`; probe **P23** KILLED |
| adequacy | **A3 NIT** — *the HIGHEST recorded* vs *the last fed*: a stored #2 then #1 accepted (M2 SURVIVED, an equivalent on driver-written logs) | code + spec | **FIXED as an R3 extension** — a stored `attempted` that does not RISE over the last stored for its task is refused `diverged` at its position (`feedOne`, `RN-R19`, `RN-R40`, ADR 0113 rule 4, AGENTS.md section 18); so the last fed IS the highest. Forgery case: *#2 then #1* and *#1 twice*; probe **P22** KILLED |
| adequacy | **A4 NIT** — no A -> B -> C double resume | test | **FIXED** — the fed-resume case resumes B's checkpoint onto C: `a` carries 3 |
| adequacy | **A5 NIT** — the 3-vs-5 worker calls and `OutcomeRecord.attempts` after a resume pinned only by the uncommitted M7 probe | record | **STATED** — below: their executable home is W188's L6 exit clauses (4)-(6) |
| conformity | **C1 SHOULD** — P36:409-411's premise *appended on a scheduler event's own step* false on inline pools (M3) | plan Record | **NOTED** for the plan's Record (below); not this item's file |
| conformity | **C2 SHOULD** — `onDelivery` now filters `task.running`, so L6 never observes its ROUTING (only the L1 runtime suite does) | record | **NOTED** — a W188 hand-off (below) |
| conformity | **C3 NIT** — M8 and the Notes claimed `doc/concept.md`'s *none subscribed yet* false for `task.running`; it is on line 79, outside that row | text | **FIXED** — M8 corrected and the Note withdrawn, visibly |
| conformity | **C4 NIT** — two incomplete fed-kind lists: AGENTS.md section 18's *REPLAYS the stored settlements and resolutions* and `sameData`'s doc | text | **FIXED** — both name every fed kind, `attempted` included |
| conformity | **C5 NIT** = A3 | — | as A3 |
| conformity | **C6 NIT** — `spec/run-state.md` section 9's intro and ADR 0113's Consequences cite the uncommitted M7 probe | text | **FIXED** — each says its executable home is W188's L6 clauses (4)-(6) |
| conformity | **C7 NIT** — L6 (2g)'s `midQ` is computed with the same `isFedElement` predicate the resume path uses: a relation, not a hand-written value | record | **NOTED** — below; no hand-written position pinned beside it (the position moves with the flow's timing per kill point, and (2g)'s other claims hold the element kinds) |

**The readers' overlap: TWO shared subjects** — (1) a stored `attempted` that does not rise (A3 and C5 — the same
finding, reached independently: one by mutation, one by construction); (2) the uncommitted M7 probe as the only pin of the
3-vs-5 count (A5 on what it pins, C6 on what cites it). *Under the stricter predicate — the same finding — it is ONE.*
Every other finding was one reader's alone. *(P36's brief sentence; the ordinal is a retro's.)*

## Record

*Filled 2026-10-18, after the readers' round. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | `C:/tmp-w186/gate2.log`: lint; typecheck; every check, `check:docs` 46 `run` / 6 `check`; L1-L5 78 files / 2022 cases in node, deno and chromium; L6 2743 assertions / 203 runs, 0 failed, node and deno. The first run was RED in chromium only (the `Boom` class name, *What broke*) |
| `check:docs:selftest` (B′: a snippet added) | RAN — EXIT 0, 24/24 noticed | `C:/tmp-w186/docs-self.log` |
| L2 one `attempted` per `task.running` of a dispatched task; none for a repeat (a requeue), another run's, or after a stop | RAN — green | `test/driver/attempts.test.ts` cases 1, 2, 6; RED on `d2f724d` (M4) |
| fed at its position by the replay, refused `diverged` nowhere it was stored | RAN — green | the inline run's checkpoint resumed, the fed resume, A -> B -> C; the forged ones refused at their positions |
| a resume re-hands `attemptsSpent` the highest, ABSENT where none, a spent budget handed on | RAN — green | cases 7, 8, 10, 12; through `createRuntime`, a `FyflowTask` carrying it |
| a stopped attempt counted ((h)) | RAN — green | case 6, beside the control that the deaf driver was sent the later attempt |
| `RUN_FOR`'s sixteenth run; L3 folded twice | RAN — green | `checkpoint.test.ts`; `test/fold/attempted.test.ts` |
| every flow on a double that fires no `task.running` byte-identical in its fold inputs | RAN — green | M2 (no sequence moved across 76 files) and case 12 |
| real-scheduler probe (M7) | RAN — before the readers | node and deno byte-identical; not re-run (no behaviour it reaches moved after it: A3's refusal is reached only by a forged store) |
| conformity reader | RAN | C1-C7, no BLOCKER; C3, C4, C6 fixed, C1, C2, C7 noted, C5 = A3 |
| adequacy reader | RAN | A1-A5, no BLOCKER; A1-A4 fixed (its M1, M2, M6 re-cut as P23, P22, P24 — and P25 — all KILLED), A5 noted |
| the author's probes, re-run after the readers | RAN | **25 one-clause probes + 2 grader controls: 24 KILLED, 1 SURVIVED (P3, a declared equivalent)**, no NO VERDICT; every file restored, digests equal (`C:/tmp-w186/mut2.log`) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w186/gateitem.log`) | lint; typecheck; every check, `check:docs` 46 `run` / 6 `check`; L1-L5 **78 files / 2022 cases** in node, deno and chromium; L6 2743 assertions / 203 runs, 0 failed, node 24.20.0 and deno 2.9.6; selftests 10/10 ok (995.0 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the driver: `task.running` heard, `attempted` appended at rest, fed, `attemptsSpent` re-handed | yes | P1-P18, P22-P25 |
| (2) `FoldInput`'s kind and the fold's arm; `TaskDetailLike.attemptNumber?` | yes | P19, P20; `typecheck` |
| (3) run-state v0.26, outcome-record v0.20, task-id v0.15, `spec/README.md` | yes | `check:spec` (owner, version) |
| (4) the tests | yes | M4; the probe table |
| (5) the L6 rows and `onDelivery` | yes | M5: 39 L6 assertions red without them |
| (6) AGENTS.md and its `run` snippet | yes | `check:docs` (`RUN_FLOOR` 46) |
| (7) ADR 0113 | yes | `check:register` (`R6`-`R8`: `resolves: Q365, Q26` and each question's `resolved-by`) |

**Prediction 1 (P36 prediction 3) HOLDS, with R5's refinement; prediction 2 (the census) HOLDS** — the tables above.

**What broke.** Nothing at a rung after READY. Before it: `check:scheduler` `D7` (the pin's number in two `driver.ts`
comments) and `test:browser` in chromium alone (the new suite's module-scope `class Boom` took the bundle's `Boom` name,
so W93's `gate.test.ts`, which reads the literal, saw `Boom2` — renamed `AttemptBoom`, `AttemptAgain`, `AttemptFake`).
The readers found three gaps no rung saw: an attempt heard inside `resume()`'s or `unpause()`'s inline hand-off, one heard
after a halt (both rules held, untested), and a stored attempt that does not rise, accepted.

**What this taught.** *For the retro*: a rule stated over ROADS (*heard on a step*, *after a halt*) needs one case per road
the code has a door for — `start()`, `resume()`, `unpause()`, a scheduler event's step — and the author's set covered the
first and the last. And a module-scope class name in a test file is a bundle-wide identifier in the browser lane:
`Boom` was free in node and deno and taken in chromium.

**Questions raised.** None (Q686-Q689 SPENT, unissued). **Closed.** [Q365](../questions/q365.md) and
[Q26](../questions/q26.md), `resolved-by` ADR 0113; ADR 0065's rule 7 and consequence 2 carry dated pointers.

**Notes for the plan's Record and its retro.**
- **C1** — P36 lines 409-411 (*"(f)'s `attempted` is a SCHEDULER element, fed but appended on a scheduler event's own
  step"*) is FALSE on an inline pool: `task.running` fires inside `addTask`, on the driver's own step (M3). The item
  applied the plan's own *taken at rest* sentence instead (R1, confirmed by the coordinator).
- **A5 / C6** — the 3-vs-5 worker-call count and `OutcomeRecord.attempts` counting every process's attempts are pinned
  only by M7's uncommitted probe; their executable home is **W188's L6 exit clauses (4)-(6)**.
- **C2** — `onDelivery` records settlement events only, so L6 does not observe `task.running`'s ROUTING (only
  `test/scheduler/runtime.test.ts`'s W186 suite does, over a double): a W188 hand-off.
- **C7** — L6 block (2g)'s `midQ` and (2h)'s `q` use `isFedElement`, the predicate the resume path implements: a
  relation, not a hand-written position.
- W187 reads `attempted` for `NodeRun.attemptNumber` ((j)).
