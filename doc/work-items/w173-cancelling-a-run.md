# W173 — cancelling a run: `driver.cancel`, the `cancelling` outcome, and `done` after the last task has stopped

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; both reader passes RAN — two DEFECTS (D-1 a mid-step cancel refused `ended`, D-2 a second call resolving early) FIXED, SHOULD-FIXes S-a..S-g acted on; exceptions E1-E5 granted by the maintainer (S-1..S-5); Q18 and Q606 RESOLVED by ADR 0104; no question raised — declared 2026-10-16 on `43cdd7d`; P34's FIFTH item: stop-and-asks (b), (c), (h), (i), (j) and the `AGENTS.md` half of (g); ADR 0104; `doc/concept.md` section 7 amended; Q18 and Q606's runtime row; P33's pre-pickup and backoff roads at L2
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its FIFTH item. **A run's OWNER cancels it through ONE
call on the driver**: `SchedulerLike` gains an OPTIONAL `cancel?(taskId, options?)` that the runtime's per-run view
forwards (b); `driver.cancel({ actor, reason?, graceMs? })` holds the run (ADR 0103's hold), appends ONE
`cancelRequested` fold input and asks the scheduler to cancel each task in flight (c); the fold reads a new,
NON-terminal outcome `cancelling` until the last task has stopped and `cancelled` after, so a runtime's `done` settles
after the last `task.cancelled` (c), ranked as (h) says; nothing is written per parked task (i); a task a worker spawned
is not cancelled (j). **And the hazard ADR 0103 hands on** (`RN-R29` (i)): a cancel raised on a task's own `dispatched`
element cancels that task AFTER its hand-off.

```
Spec:       spec/run-state.md v0.17 -> v0.18: section 13 and TWO rules — `RN-R30` (the fold: `cancelRequested`,
            `cancelling`, (h)'s precedence) and `RN-R31` (the call: its refusals, its order, the second call, the
            runtime's `done`, `graceMs: 0` a request). Rules whose TEXT moves: `RN-R12`, `RN-R23`, `RN-R28`, `RN-R29`;
            section 2's shape (`cancelRequest`), section 3's table and its count (EIGHT outcomes), section 6's
            `stuck` bullet. One `FoldInput` kind (`cancelRequested`), one `RunState` cell (`cancelRequest`), one
            `RunOutcome` (`cancelling`) — each BREAKING (P34 decision 10).
            spec/outcome-record.md v0.15 -> v0.16: `OR-R4`'s *"P34's to record"* — the request is a fold input.
            spec/join-policy.md v0.20 -> v0.21: section 2's cancelled-branch paragraph and `JP-R12`'s run-level
            release gain the request.
            spec/README.md: the three rows and their version columns; run-state's outcome count.
Owns:       from P34's W173 row, exactly: src/driver/driver.ts, src/fold/run-state.ts, src/scheduler/runtime.ts,
            spec/run-state.md, spec/outcome-record.md, spec/join-policy.md, spec/README.md, test/driver/**,
            test/fold/**, test/matrix/**, test/scheduler/runtime.test.ts, test/definition/l4-corpus.test.ts,
            examples/l6.ts (DRIVER_FIELDS), examples/run-flow.ts, AGENTS.md (sections 6, 8, 11, 12),
            scripts/check-docs.mjs, doc/concept.md (section 7).
            Exceptions: E1-E5 — granted by the maintainer 2026-10-16 (YES to S-1..S-5, before the readers' findings;
            see the stop-and-asks below), each applied minimally, nothing else changed there:
            E1 (S-1) AGENTS.md section 9 — the census snippet's import and one `documented` line for
            `RunControlRefused`, and one refusal-table row beside `ResumeRefused`'s;
            E2 (S-2) AGENTS.md section 18 (:3749) — `index` is the first cancelled settlement or the cancel request,
            whichever is first;
            E3 (S-3) AGENTS.md section 1 (:45) — two methods plus an optional `cancel`; and section 7's snippet
            comment (:1247) — `isTerminal`'s expression with `cancelling`;
            E4 (S-4) CLAUDE.md :196 and :260 — the two sentences only: the seam's optional `cancel`; `src/` calls it
            only from `driver.cancel`, cancelling a run is ADR 0104, Q18 resolved;
            E5 (S-5) src/driver/listener.ts :79-81 and test/definition/schema.test.ts :580 — one comment clause each.
            NOT taken: doc/concept.md :85 (section 3, stale since W158) — not W173's; listed for P34's retro.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q18 resolved; Q606 resolved;
            Q647-Q650 if raised), doc/decisions/** (ADR 0104 new; ADR 0094 consequences 4 and 7, ADR 0058 rule 3,
            ADR 0103's inherited-hazard consequence — pointers), the plan's Record, README.md, this file.
Inputs:     P34 decisions 1, 4, 5, 6, 10 and 11, facts 2, 5, 6, 8 and 9, stop-and-asks (b), (c), (g), (h), (i), (j),
            prediction 5, sentences B′, C, D′ and E; ADR 0103 (the hold, and its inherited hazard); ADR 0094; ADR 0091;
            ADR 0088; ADR 0058; ADR 0007; the scheduler's AGENTS.md §5 `cancel(taskId, options?)`.
Outputs:    (1) src: `SchedulerLike.cancel?` (optional; the `_Q71` assertion unmoved); `RunControlRefused` (one class,
                `control: 'cancel'`, a `reason`); `Driver.cancel()`; the hold joined by the request; the in-progress
                task cancelled after `addTask` in `dispatch`; `resume()`'s re-dispatch handing on and cancelling under
                a request; `resumeRefusal` refusing a stored `cancelRequested`; the fold's `cancelRequested` arm,
                `cancelRequest` cell, `cancelling` outcome and `isTerminal`; the runtime's per-run view forwarding
                `cancel`.
            (2) spec run-state v0.18, outcome-record v0.16, join-policy v0.21, spec/README.md's rows.
            (3) ADR 0104.
            (4) doc/concept.md section 7: run control leaves the non-goals.
            (5) AGENTS.md sections 6, 8, 11, 12 — one new `run` snippet (section 6), so `RUN_FLOOR` 37 -> 38.
            (6) tests: test/fold/cancelling.test.ts (L1/L3, new suite), test/driver/cancel.test.ts (L2, new suite),
                test/matrix/cancelled.test.ts (L5, the `cancelling` row), test/scheduler/runtime.test.ts (Q606: two
                cases in W151's suite), l4-corpus's `LATE_SUITES` and case counts, `DRIVER_FIELDS` in
                test/driver/retention.test.ts and examples/l6.ts.
Depends on: W172 (done, 43cdd7d)
Blocks:     W174
Tests:      L1 — test/fold/cancelling.test.ts, `RN-R30` over hand-written sequences: `cancelling` -> `cancelled` by
            the fold alone; the last wait ended by `cancelled`, `done` and `failed`; a parked node not waited on and
            left `suspended`; a request with nothing running; (h)'s precedence against `halted` (both orders), an
            earlier `RN-R28` cancel, a second request, `awaiting_action`, `running` and a waiting join; `isTerminal`;
            L3 folded twice. L2 — test/driver/cancel.test.ts, `RN-R31` over a fake whose `cancel` plays each road of
            P34 fact 8: a cancel mid-fan-out with tasks RUNNING, WAITING, PRE-PICKUP, in BACKOFF and PARKED — the
            element before every `task.cancelled`, nothing dispatched/routed/emitted after it, `cancelling` until the
            last, the promise resolved after it; a second cancel's `graceMs` forwarded to what is still stopping and
            nothing appended; each refusal by name with nothing appended or sent; the `RN-R29` (i) task cancelled
            after its hand-off; a resumed run cancelled on its `resumed` element; a parked-only run; the checkpoint
            refused `cancelled`; folded twice. L5 — the `cancelling` row under every column. Runtime (Q606) — through
            `createRuntime`'s routing, a `RN-R28` cancel's `done` and release, and a requested cancel's `done` pending
            while a task stops, then `cancelled`, equal to the caller's fold, and the run released.
            Expected values from spec v0.18 and the flows' own shape — never from the implementation's output. Each
            clause shown able to fail by a ONE-clause mutation (sentence E) in the byte copy C:/tmp-w173/m.
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree; and B′'s `check:budget:selftest`
            (doc/concept.md is in the always-read set) and `check:docs:selftest` (an executed snippet added). The row's
            clause: L1 `cancelling` -> `cancelled` by the fold alone; L2 a cancel mid-fan-out with tasks running,
            queued, PRE-PICKUP, in BACKOFF and parked, the element before every `task.cancelled`, nothing routed after
            it, a second cancel's `graceMs` forwarded and nothing appended; L3 folded twice; L5 the `cancelling` row;
            Q606 — `done` resolves `cancelled` after the last settlement and the run is RELEASED, through
            `createRuntime`'s routing.
Reserves:   Q647-Q650 (P34's per-item line); ADR 0104 (P34 decision 11)
```

## Scope

**In** — Outputs (1)-(6).

**Out** — named rather than left implicit, with where it goes instead

- **Stopping a run** (`interrupted`, `RunHandle.stop()`, deaf-before-cancel) — W174, ADR 0105. `interrupted`'s place in
  the precedence (between `cancelling` and `awaiting_action`) is stated in `RN-R30` and built there.
- **Pausing a run**, and "a paused run's held tasks added then cancelled" — W175, ADR 0106. The mechanism this item
  builds for a resume's not-yet-handed tasks (hand on, then cancel) is the one W175 reuses.
- **Cancelling tasks a worker spawned** — Out by P34 (j); `AGENTS.md` section 11 says so.
- **A `RunHandle.cancel()`** — not asked: (c) puts the call on the driver, and `handle.driver.cancel()` reaches it.
- **The L6 rows** (real workers, `graceMs: 0` escalation, the pre-pickup and backoff roads on threads) — W176.
- **`src/definition/types.ts:757`/`:790`** (*"STOPS the run"*) — W174's, as W171 recorded.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations
in the byte copy `C:/tmp-w173/m`, each graded on the named suite's `FAIL` lines; then the readers; then
`npm run gate:item` once. Routing coverage: a nested fan-out (Q6) — not exercised (the hold is `enter`'s, unchanged);
`user_action` (Q17) — the parked task the cancel sends nothing for, and `resolve()` refused after; a branch routed away
from its join (Q4), no matching decision edge (Q10), a duplicate task id (Q13) — not applicable: this item adds no route
and mints no id.

## What the declaration step measured

*Measured 2026-10-16 in a BYTE COPY of `43cdd7d` (`git archive` into `C:/tmp-w173/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 / 75 / 136 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **63 files / 1798 cases** in node, deno and chromium; L6 **2664 / 176**, 0 failed, in node and deno |
| M2 | **B′ / D′ — the census sites this change moves**, each found by its own lane going red by name | `DRIVER_FIELDS` (`test/driver/retention.test.ts`, `examples/l6.ts`) +`cancelRequest`, +`unhanded`; `test/driver/checkpoint.test.ts`'s `RUN_FOR` (a `Record<FoldInput['kind'], …>` — L0 red) and its kind count 10 -> 11; `test/fold/fold-rules.test.ts`'s two `RunState` literals (L0 red, the new cell); `l4-corpus`'s `LATE_SUITES` +2 suites and a count case; `RUN_FLOOR` 37 -> 38 (one `run` snippet, section 6); `spec/README.md`'s three rows; `check:spec`'s rule count 136 -> 138 (derived, written nowhere); **NOT moved**: `examples/run-flow.ts`'s `NOT_RUN_STATE` (both fields are run state, walked), `examples/README.md`'s `X10` (no L6 change). **And one site OUT of `Owns`: `AGENTS.md` section 9's refusal-census snippet** — S-1 |
| M3 | **P34 prediction 5** — W160's L6 rows, which cancel through `runtime.scheduler.cancel(id)` and request nothing | L6 **2664 / 176**, 0 failed, in node and deno on the real tree with W173 built — unmoved. **Prediction 5 HOLDS** |
| M5 | **S-1's edit, measured in the byte copy only** — the copy synced with the final tree plus section 9's one import and one `documented` line | `npm run gate` **EXIT 0**: `lint` 149 files; `check:spec` 7 / 75 / **138** rules; `check:docs` 44 snippets (**38 run**, 6 check); L1-L5 **65 files / 1820 cases** in node, deno 2.9.6 and chromium; L6 **2664 / 176**, 0 failed, in node and deno. B′: `check:budget:selftest` **EXIT 0** and `check:docs:selftest` **EXIT 0** (`doc/concept.md` 16,544 bytes against its 17,408 ceiling) |
| M4 | **the tree's now-false statements**, grepped for *two methods*, *two-method*, *P34's to record*, *no call that cancels*, *seven outcomes*, *first cancelled settlement*, *on the FIRST cancel*, *running and awaiting_action*, *there is no cancel* over everything but `dev-dist/` and `node_modules` | in `Owns` — rewritten: `src/driver/driver.ts` (`SchedulerLike`'s doc, `MultipleRuns`' message comment), `src/fold/run-state.ts` (`isTerminal`, `RN-R12`'s comment), `src/scheduler/runtime.ts` (`RunHandle.done`, `inUse`), `spec/run-state.md` (`RN-R12`'s head, section 6's bullet), `spec/outcome-record.md` (`OR-R4`), `examples/run-flow.ts:5`, `test/driver/lifetime.test.ts:629`, `test/scheduler/runtime.test.ts:1801`, `AGENTS.md` sections 6, 8, 11, 12; record step — pointers: ADR 0015, ADR 0058 rule 3, ADR 0091 rule 3, ADR 0094 consequences 4 and 7, ADR 0103's hazard; **OUT of `Owns`**: S-1 to S-5 below. History (plans, finished items) is true of its version and stays |

## The author's provocations (before the readers)

`C:/tmp-w173/mutate.mjs` in the byte copy `C:/tmp-w173/m`, synced with the real tree; each ONE clause (sentence E),
graded on the `FAIL` lines of the `cancel`, `scheduler/runtime`, `driver/retention`, `driver/hold`, `driver/checkpoint`
and `driver/resume` suites; every file restored, digest equal; CONTROL clean. **First run: 37 killed, D18 SURVIVED,
D19 CRASHED (a hang), D27 a declared survivor** — D18 and D19 each earned a case (below), and re-run, both are KILLED.

| id | the clause broken | verdict |
|---|---|---|
| F1 / F2 | the fold records a request after the run is `cancelled` / a second request overwrites the first | KILLED |
| F3 | `RN-R28` applies under a request too | KILLED (8 cases) |
| F4 / F5 | a request always `cancelling` / always `cancelled` | KILLED |
| F6 / F7 | a parked node waited on / the request ranked below `awaiting_action` | KILLED |
| F8 | `isTerminal` calls `cancelling` terminal | KILLED — the fold case and Q606's runtime case |
| F9 | the cell drops the reason | KILLED |
| D1 | `shut()` without the request | KILLED |
| D2-D10 | each refusal (`unsupported`, `TypeError`, `NaN`, negative, `not-started`, `halted`, `cancelled`, `ended`, `ended` ignoring a parked task) removed | KILLED, each |
| D11-D13 | the second call: takes the first road / ignores its `graceMs` / re-sends stopped tasks | KILLED |
| D14 | collections not released at the request | KILLED — the retention twin |
| D15 / D16 / D17 | reason not null-defaulted / unhanded tasks sent / the promise not waiting | KILLED |
| D18 | the in-flight set read BEFORE the element | **SURVIVED, then KILLED** by the case a consumer's own cancel on the element's stack |
| D19 | the hold set AFTER the element (the assignment moved past the append — the adequacy reader's A20 cuts it as ONE statement) | **CRASH (hung on an unresolved cancel) on the first run; KILLED** once the case's task takes the waiting road — by the *hold before the element* sub-case; A20 KILLED by the same (adequacy finding 10 corrected this row) |
| D20-D22 | no cancel after the hand-off; the in-progress / resumed task not marked unhanded | KILLED — `RN-R29` (i) and the resume case |
| D23 / D24 | the resume loop holds a request / stops holding `RN-R28`'s cancel | KILLED |
| D25 / D26 | `reason` / `graceMs` not passed to the scheduler | KILLED |
| D27 | a repeat's promise replaces the first | **SURVIVED, declared EQUIVALENT** under the scheduler's *a repeat call returns the same promise* — every double here honours it |
| D28 | a settled promise not dropped | KILLED — the retention twin |
| D29 | a stored `cancelRequested` not refused by a resume | KILLED |
| R1 | the runtime's per-run view does not forward `cancel` | KILLED — Q606's runtime case |

## Readings the plan did not settle — taken here, each stated in `RN-R30`/`RN-R31` and ADR 0104, for the readers

| | the reading | why |
|---|---|---|
| R1 | **Five refusal reasons, not two**: (c) names *after a halt or a stop*; W173 adds `not-started` (no run; a spent driver), `cancelled` (`RN-R28` already ended it — it is one of W172's two halts) and `ended` (nothing in flight, nothing parked — a `completed`/`failed`/`stuck` run, which a request would otherwise turn `cancelled`) | each is a call that would otherwise record a request against a run that has no work to stop, or rewrite a terminal outcome |
| R2 | **`graceMs` is held to the scheduler's own refusals BEFORE anything is recorded** (`TypeError`, `RangeError`) | the scheduler throws synchronously for them, which would land half-way through step 4 with the element appended |
| R3 | **A resumed run's in-flight set is handed on and CANCELLED under a request**, not held as `RN-R29` (4) holds it for a halt (ADR 0103 rule 7) | held, those `dispatched` tasks never settle: the run reads `cancelling` for ever and `done` never comes. P34 (c)'s *held tasks added then cancelled* is the same road for a pause |
| R4 | **The fold does not record a request folded after the run is already `cancelled`** | (h)'s `cancelled` > `cancelling` for a hand-written log: otherwise `RN-R28` + request + a running task read `cancelling` — a terminal run made live again |
| R5 | **`resumeRefusal`'s `index` is the first of EITHER kind** (the request, or a cancelled settlement) | a run cancelled while parked holds no cancelled settlement at all, and would otherwise resume |
| R6 | **A SECOND call forwards only its `graceMs`**; the run's `reason` stays the first's, and a second call with nothing still stopping resolves at once | the scheduler keeps the first `reason` on a repeat anyway, and (c) names `graceMs` alone |
| R7 | **The names**: `RunControlRefused` (`control: 'cancel'`, a `reason`) on `ResumeRefused`'s one-class precedent, so W174/W175 widen it; `RunCancelOptions` (not `CancelOptions`, the scheduler's own export's name); the fold input `cancelRequested` and the cell `cancelRequest` | (c) names the element `cancelRequested`; the rest is unnamed by the plan |
| R8 | **No `RunHandle.cancel()`** | (c) puts the call on the driver; `handle.driver.cancel()` reaches it |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-16: YES to all five (exceptions E1-E5)

| | the question | recommended | the alternatives |
|---|---|---|---|
| **S-1** | **`AGENTS.md` section 9's refusal census goes RED** (`check:docs` `X4`, the only red lane): its executed snippet lists every `Error` class the package root exports, and `RunControlRefused` — P34 (b)'s *refused by name* — is a new one. Section 9 is not in P34's W173 row | **YES — widen `Owns` by section 9's snippet and its refusal table**: one import and one `documented` line (`RunControlRefused, // thrown at you from driver.cancel() — RN-R31`), and one table row beside `ResumeRefused`'s. Measured in the byte copy: with that edit, `npm run gate` EXIT 0 | **No new class** — refuse with an existing one: none means *unsupported*, *ended* or *halted*, and `NotStarted` would lie for four of the five. **Not exported** — a consumer could not `instanceof` it, against (b)'s *by name* |
| **S-2** | **`AGENTS.md` section 18 (`:3749`)**: *"`index` is the first cancelled settlement"* is false for a run its owner cancelled — `index` is the `cancelRequested` element, which precedes every settlement (`RN-R23` v0.18) | **YES — one clause**: *"the first cancelled settlement, or the cancel request, whichever is first"* | **Leave it for W176** (which edits examples, not `AGENTS.md`) — the reference then states a wrong index |
| **S-3** | **`AGENTS.md` section 1 (`:45`)** *"`SchedulerLike` is a two-method structural interface"*, and **section 7 (`:1247`)**'s snippet comment *"`isTerminal` is `outcome !== 'running' && outcome !== 'awaiting_action'`"* — each now short by the optional `cancel` and by `cancelling` | **YES — two phrases**, no code moves (the section 7 line is a comment inside a `run` snippet) | **Leave both**: the first is still true of the REQUIRED members; the second is a comment no check reads — but it is the expression a reader copies |
| **S-4** | **`CLAUDE.md`** `:196` (*"`SchedulerLike` is still a two-method structural interface"*) and `:260` (*"`src/` calls no `cancel` … what cancelling a RUN does is P34's (Q18)"*) — the second is now false | **YES — the maintainer's file; two clauses**: *"two required methods and an optional `cancel`"*; *"`src/` calls `cancel` only from `driver.cancel` (ADR 0104, Q18 resolved)"* | **Leave `:196`**, which is true of the required members, and fix `:260` only |
| **S-5** | **Two comments out of `Owns`**: `src/driver/listener.ts:79-81` (*"a run whose cancel the driver requested is P34's to record"* — it is recorded since W173, as `cancelRequested`) and `test/definition/schema.test.ts:580` (*"the driver's two-method seam"*). *(Found beside them and not this item's: `doc/concept.md:85`, section 3 — "Not yet folded here — P33" — stale since W158.)* | **YES for the two comments** (one clause each); concept section 3 is outside every P34 row and is a retro's | **Leave them for W174**, whose row owns `test/**` broadly but not `listener.ts` |


## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=1` — `check:docs` `X4` alone** | real tree, node 24.20.0: section 9's refusal census did not name `RunControlRefused` (S-1, out of `Owns`). Every lane after it run alone, each EXIT 0: L1-L5 **65 files / 1820 cases** in node, deno 2.9.6 and chromium; L6 **2664 / 176**, 0 failed, in node and deno. In the byte copy with S-1's edit: `npm run gate` **EXIT 0**, `check:budget:selftest` and `check:docs:selftest` **EXIT 0** (M5) |
| `npm run gate`, after E1-E5 (the maintainer's YES to S-1..S-5) | **RAN, `GATE EXIT=0`** | real tree: `lint` 149 files; `check:spec` 7 / 75 / 138 rules; `check:docs` 44 snippets (38 run, 6 check); L1-L5 **65 / 1820** in node, deno and chromium; L6 **2664 / 176** in node and deno |
| L1 — `cancelling` -> `cancelled` by the fold alone | **RAN** | `test/fold/cancelling.test.ts`, ten cases; F1-F9 |
| L2 — the roads (running, waiting, PRE-PICKUP, BACKOFF, parked), the element before every `task.cancelled`, nothing routed after it, a second cancel's `graceMs` forwarded and nothing appended | **RAN** | `test/driver/cancel.test.ts`, thirteen cases after the readers; D1-D36 |
| L3 — folded twice | **RAN** | the fold suite's L3 case and the L2 roads case |
| L5 — the `cancelling` row | **RAN** | `test/matrix/cancelled.test.ts`, under all four columns |
| Q606 — `done` resolves `cancelled` after the last settlement, the run RELEASED, through `createRuntime`'s routing | **RAN** | `test/scheduler/runtime.test.ts`, W151's suite: the `RN-R28` cancel and the requested one, and (after the readers) the bound forward and `unsupported` through a runtime; R1, R2 |
| B′ — `check:budget:selftest`, `check:docs:selftest` | **RAN, EXIT 0 each** | in the byte copy with S-1 applied (M5), and inside `gate:item` below |
| conformity reader | **RAN** | **TWO DEFECTS** (F1 = D-1, and with the adequacy reader's finding 1 = D-2); F2-F11 — acted on below |
| adequacy reader | **RAN** | **one DEFECT** (finding 1 = D-2, probe P8); A1, A4, A5, A14, A15, A18 SHOULD-FIX; equivalents and notes below — acted on |
| author's provocations, re-run after the readers' items | **RAN** | `C:/tmp-w173/mutate.mjs` in the byte copy re-synced with the final tree: CONTROL clean; **46 one-clause probes, 45 KILLED, 1 declared EQUIVALENT (D27)**; every file restored, digest equal |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items and E1-E5 (this Record written before it, but for this row and the Status line): the ladder — `lint` 149 files, `check:spec` 7 / 75 / 138 rules, `check:docs` 44 snippets (38 run, 6 check), L1-L5 **65 files / 1826 cases** in node 24.20.0, deno 2.9.6 and chromium (1798 at M1: +13 `cancel`, +10 `cancelling`, +1 L5 row, +1 retention twin, +2 runtime, +1 l4-corpus count), L6 **2664 / 176**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 914.2 s wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation tables.** *Before the readers* — the table above (*The author's provocations*): 39 probes,
37 killed, D18 SURVIVED (a case added, then KILLED), D19 a hang (then KILLED), D27 declared equivalent. *After the
readers* — every probe above re-run, D9/D10/D13/D17/D23/D24 re-anchored on the changed code, and the readers' survivors
re-cut ONE clause each:

| id | the clause broken | verdict, killed by |
|---|---|---|
| D31 | D-1: `ended` refused mid-step too (`stepping === 0` dropped) | KILLED — the mid-step case |
| D32 | D-1: a scheduler event does not count itself in | KILLED — the refusals case and the mid-step case |
| D33 | D-2: the second call resolves on what it SENT (the pre-fix road) | KILLED — the two-cancels case (P8) |
| D34 | S-a / A4: the first call reads its promises without the microtask | KILLED — the RUNNING-road case, the two-cancels case |
| D35 | S-b / A5: `handedOn` ignores the replay | KILLED — the lost-tail case (P6) |
| D36 | S-c / A1: `ended` when EVERY dispatched task is parked (`.some` -> `.every`) | KILLED — the done-and-parked case (P1) |
| R2 | S-e / A14: the forwarded `cancel` unbound | KILLED — the bound-forward case (P4) |
| D13 | S-d / A18: the second call re-sends every dispatched task | KILLED — the second-call case (P7's subject, also asserted by the two-cancels case) |
| D17 | the promise does not wait at all | KILLED (4 cases) |
| D23 / D24 | the resume loop's `holdsResume()` without the request exemption / `shut()` without `RN-R28`'s cancel | KILLED |
| D27 | a repeat's promise replaces the first | **SURVIVED — EQUIVALENT**, confirmed by the adequacy reader (A10) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| **D-1** (conformity F1, DEFECT) | a cancel raised MID-STEP was refused `ended` while the run carried on — on `x`'s `outcome` element (`y` then dispatched, `running`) and on a fan-out's `regionEntered` (both branches dispatched) | **fixed**: `stepping` — the driver counts its own step (`start`, `resume`, `resolve`, a scheduler event, each a wrapper over its old body) and refuses `ended` only at REST; mid-step the call is accepted and the hold stops the dispatch. `RN-R31` (1), ADR 0104 rule 3, the refusal table; L2 case per element, beside the at-rest control; D31, D32. A third new `Driver` field: `DRIVER_FIELDS` moves by name again |
| **D-2** (adequacy 1 / conformity, DEFECT) | a SECOND cancel made while a task is not yet handed on resolved at once (`Promise.all([])`) | **fixed**: the second call sends to what is handed and then resolves as the first does — a microtask on, on every task still stopping. `RN-R31`, ADR 0104 rule 8; P8 as an L2 case; D33 |
| S-a (A4, F2) | removing the one-microtask deferral survived (the cases used the WAITING road) | **RUNNING-road variants** of the `dispatched`-element and `resumed`-element cases, the promise pending until the task stops (P3); D34 |
| S-b (A5, F3) | `handedOn`'s replay clause unreached | **case added**: a cancel on a REGENERATED element of a resume's lost tail — nothing sent during the replay, one cancel after the hand-off, pending until it stops (P6); the road named in `RN-R31`; D35 |
| S-c (A1) | `ended` exercised only with every dispatched task parked | **case added**: `x` done, `y` parked — accepted, `cancelled` (P1); D36 |
| S-d (A18) | the second call's `handedOn` filter untested | **asserted** by the two-cancels case (one cancel, held) (P7); D13 |
| S-e (A14, A15, F4) | the runtime's `cancel.call(scheduler, …)` binding unchecked; `unsupported` through a runtime untested | **case added** in W151's suite: a class-method `cancel` reading `this`, through `createRuntime` and `driver.cancel` (P4), and a scheduler with none refused `unsupported` with nothing recorded (P5); R2 |
| S-f (F5) | two stale `isTerminal` comments in `test/scheduler/runtime.test.ts` | **amended** in place (`cancelling` named) |
| S-g (F7) | the resume loop read `this.failed \|\| this.cancelled`, a second copy of `shut()` | **`holdsResume()`** — `shut()` less the request — so W174's stop flag holds there too; ADR 0103 rule 1's *"`failed \|\| cancelled` today"* gets a pointer (record step); D23, D24 |
| A3 | request, then an `OR-R10` halt, then a second cancel — unpinned | **stated** in `RN-R31` and ADR 0104 rule 8 (*nor for a refusal after it*) and **asserted** in the second-call case |
| A10 (= D27), A2, A8, A6, A7, A21, A24, A12 | equivalent | recorded; D27 kept as the declared equivalent |
| A11 | unreachable through a never-rejecting scheduler | recorded; F8 below says so on the seam |
| F8 | a double whose `cancel` rejects leaves the run `cancelling` for ever | **one line** on `SchedulerLike.cancel`'s doc |
| F9 | `not-started`'s *"a driver a refused resume left spent"* too broad | **tightened** in `RN-R31` and the refusal table: a resume refused for a halt regenerated in its lost tail keeps the run and is `halted` |
| F10 | Q606's case is a sibling test, not a row of the per-outcome release test | **recorded**: its content meets `closes-when` — `done` `cancelled` through `createRuntime`'s routing and the release — and Q606's own note says where |
| F11 | `OR-R4`'s *"the log that settlement's record alone"* covered only indirectly | recorded (the roads case's log assertions and `snapshot()` are the indirect cover) |
| F12, A17, A27, A9 | `RunControlRefused`'s `name` and `control`, and the resume message text, unasserted | **`name` and `control` asserted** in the refusals case; message text left unasserted (it is prose) |
| A20 / adequacy 10 | the author's D19 verdict out of date | **corrected** in the table above |
| F6 (OUT OF OWNS) | `examples/README.md:118` — the run *"stops when the outcome leaves running and awaiting_action"* | **not edited** — **handed to W176**, whose row owns `examples/README.md` |
| `doc/concept.md:85` | section 3's *"Not yet folded here — P33"*, stale since W158 | **handed to P34's retro** (not W173's) |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) src — `SchedulerLike.cancel?`, `RunControlRefused`, `Driver.cancel`, the hold joined, `handOn`, `holdsResume`, `stepping`, `resumeRefusal`, the fold's arm, cell, outcome and `isTerminal`, the runtime's forward | yes | F1-F9, D1-D36, R1, R2 |
| (2) spec run-state v0.18, outcome-record v0.16, join-policy v0.21, README rows | yes | `check:spec` C2/C6 (the two new rules), C8 (three version columns); the prose by no test |
| (3) ADR 0104 | yes | `check:register` R6-R8 (`resolves: Q18, Q606` against both questions' `resolved-by`) |
| (4) `doc/concept.md` section 7 | yes | `check:budget` (16,544 of 17,408 bytes); the prose by no test |
| (5) `AGENTS.md` sections 6, 8, 11, 12 and E1-E3 | yes | `check:docs` X4 runs the new section 6 snippet and section 8's eight-outcome snippet; section 9's census names the class; `RUN_FLOOR` 38 |
| (6) tests | yes | the tables above; l4-corpus's counts of 13 and 10, the census rows; `DRIVER_FIELDS` in both lists |

**Exceptions** E1-E5 — the maintainer's YES to S-1..S-5, 2026-10-16, each applied minimally (the `Owns` block names
each site). **Owns, checked by hand** (`git status --porcelain` against that block): every file changed is in P34's
W173 row, one of E1-E5, or a record-step file (`doc/decisions/**`, `doc/questions/**`, this file).

**Record-step files**: ADR 0104 (new); pointers in ADR 0015, ADR 0058 rule 3, ADR 0091 rule 3, ADR 0094 consequences
4 and 7, ADR 0103 (its hazard consequence and rule 1); Q18 RESOLVED, Q606 RESOLVED (both `resolved-by` ADR 0104); this
file. The plan's Record is the join's. `README.md` not edited.

**What broke.** At the ladder, only S-1's census (an out-of-`Owns` executed snippet that names every exported
`Error` class). The readers found two DEFECTS the author's 39 probes did not: a mid-step cancel refused `ended`
(D-1) — the refusal read a PREFIX as a finished run, which is exactly what `RN-R12`'s quiescent-point caveat warns of —
and a second call resolving early on an unhanded task (D-2). Both cases were constructible by a consumer's own
`onFoldInput`, and none of the author's cases raised a cancel there except on a `dispatched` or `resumed` element.

**What this taught.**
- **A refusal that reads the run's STATE must say whether it holds mid-step** (D-1): *nothing in flight* is true at
  every settlement's element of a sequence. For P34's retro, and for W174's stop, whose refusals read the same state.
- **A promise the API returns must be tested on the slow road** (S-a, D-2): every early case used the WAITING road,
  which settles inside the call and so hides any deferral.
- **P34's D′ sentence was right for W173** (`DRIVER_FIELDS` moved — by three fields); **prediction 5 HOLDS** (L6
  unmoved).

**Questions raised.** None — Q647-Q650 unused, skipped. **Closed**: [Q18](../questions/q18.md) and
[Q606](../questions/q606.md), by ADR 0104. **Handed on**: F6 to W176; `doc/concept.md:85` to P34's retro.
