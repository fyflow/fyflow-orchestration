# W160 — a task cancelled while RUNNING and while QUEUED, on real workers: P33's exit artifact

**Status:** done 2026-10-15 — **`npm run gate:full` EXIT 0** on the final tree, one command, the plan's last item;
declared 2026-10-15 on `db2f4b0`, declaration step RUN the same day in a byte copy; exceptions E1 and E2 ASKED at the
declaration step, ANSWERED YES by the maintainer 2026-10-15 and recorded before their edits; both reader passes RUN,
neither found a defect, their items R1-R7 directed by the coordinator and recorded before the edits; nothing raised,
nothing closed
**Plan:** [P33](../plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) — *what does a run fold to when the
scheduler under it can end a task cancelled?* — and this is its LAST item and its EXIT ARTIFACT.

```
Spec:       NONE moves — an exit artifact writes no rule (W94's and W155's precedent). The expected values are
            written from spec/run-state.md v0.15 (RN-R8's chain, RN-R23's sixth reason, RN-R28), spec/outcome-record.md
            v0.13 (OR-R3, OR-R4, section 4's result: null), spec/task-id.md section 1 (the four segments), ADR 0094,
            ADR 0058 rule 3 (what settles `done`), and the scheduler's own reference at the pin
            (node_modules/fyflow-scheduler/AGENTS.md sections 4, 5 and 6: cancel(), the two roads, task.cancelling,
            task.cancelled, resource.unblocked's `cancelled` reason, context.signal and context.emit).
Owns:       from P33's index row: examples/flows/**, examples/l6.ts. And by the Exceptions below, ANSWERED YES 2026-10-15:
            examples/README.md (E1, the two X10 copies and one run-count sentence); AGENTS.md :2234-2237 (E2,
            a sentence false since W158).
Inputs:     P33's exit-artifact sentence, decisions 2-4, facts 1, 3 and 9, P32-retro sentences B and C; W158's Out (the
            L6 rows should AWAIT `done` — Q606's runtime half — and `examples/l6.ts:6947`'s undated citation is W160's,
            handed on from W157's Out); W159's Out (an optional L6 row of a typed worker seeing context.signal and
            context.emit through createRuntime); W141's block as the shape (examples/l6.ts, its own registry, data:
            workers, settleWithin, a finally shutdown); the group row's hold (examples/run-flow.ts `holdGroup`).
Outputs:    (1) ONE cross-row block in examples/l6.ts, W141's shape — three runs on a runtime built from a registry
                written in the block: a linear flow `work` -> `after` -> `done`; `work`'s worker emits `started`
                through context.emit and waits for context.signal, emitting `aborted:<reason>` when it aborts.
                (a) RUNNING, inline pool; (b) RUNNING, threaded pool — the harness cancels on `started`;
                (c) QUEUED — `work`'s type declares a ConcurrentLimitGroup(1) the harness holds before the run
                starts, and the harness cancels on `resource.blocked`. Each cancel through
                `runtime.scheduler.cancel(id, { reason })`, deferred to a macrotask, the id from spec/task-id.md.
            (2) per run, ten claims: the fold sequence ends at the cancelled settlement with `after` never
                dispatched; the scheduler's own events are the road's; what the worker emitted and the group's exits;
                cancel() resolved true and the scheduler's task cancelled with the reason, not forced; `done` WON
                the race with outcome `cancelled`, terminal; `done` IS fold(driver.foldInputs()); the node and its
                record cancelled, result null; nothing reported; a resume of the run's checkpoint on a FRESH runtime
                refused `cancelled` at position 1 with that scheduler holding nothing; and its CONTROL — the same
                checkpoint cut before the cancel is not refused. Plus the block's control: the two roads ran, each
                pool read back as the scheduler built it. 1 + 3 x 10 = 31 cross-row assertions.
                *(As declared. After the readers — R1-R7 below — TWELVE per run and the cut-checkpoint control
                replaced by a FOURTH run's control: 1 + 3 x 12 + 1 = 38, and five runs.)*
            (3) every L6 census the block moves, moved in the same diff: CROSS_ROW, DECLARED_TOTAL, DECLARED_RUNS,
                CROSS_ROW_SUBJECTS (eleven entries), the printed run count's derivation (`pairRunCount`), the file
                header (P33 in the list of exit artifacts, one row in its table).
            (4) `examples/l6.ts:6947`'s undated citation `core/FyflowScheduler.ts:894-897` re-taken at the pin:
                `:1151-1154` (W157's Out, W158's Out).
            (5) W159's optional L6 row — TAKEN, inside (1)(a) and (1)(b): a typed worker reaching context.emit and
                context.signal through createRuntime's envelope, inline and threaded.
Depends on: W158, W159
Blocks:     nothing — P33's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24.20.0 and deno 2.9.6. Every expected value written from the specs
            and the scheduler's reference BEFORE the block was run (the block's first run read 31 assertions passing,
            the whole count failing only on the three count constants); nothing depends on a completion order (each
            run is one task until the cancel). Each new clause shown able to fail by a provocation (rule 8), in a byte
            copy, recorded below.
Gate:       `npm run gate` before the readers (P32-retro C), and L6 in node and deno run repeatedly for timing (Q599);
            then the conformity and adequacy readers, NOT run by this item's author; then `npm run gate:full` ONCE on
            the final tree (the plan's LAST item, workflow v0.29), at the coordinator's instruction.
Reserves:   Q613-Q614, and NO ADR
```

*Reserves: `npm run state` on `db2f4b0` reads the next free ids as **W160, Q607, ADR 0095** from the tree and **W157,
Q600, ADR 0094** from the ledger, which DISAGREE because P33 has been declared since that sentence (both printed,
neither picked). P33 reserves Q600-Q614 and ADR 0094-0095; W158 spent Q605-Q606 and released Q607-Q609, W159 released
Q610-Q612, all skipped, never reissued. So this item takes **Q613-Q614**. **No ADR**: an exit artifact writes no rule,
and nothing here decides anything ADR 0094 did not — ADR 0095 is left unused. **W161 stays reserved and expected
unused** (P33's block).*

## Scope

**In** — Outputs (1)-(5).

**Out** — named rather than left implicit, with where it goes instead

- **Any call in `src/` that cancels, stops or pauses a RUN; whether a cancel's `done` waits for the run's other tasks** —
  P34 (P33 Out, decision 3). The block cancels a task by id on the runtime's scheduler, which is the consumer's road
  today (`AGENTS.md` section 11's *cancelling a RUN* row) — **reachable from `examples/` with no edit to `src/`**:
  `Runtime.scheduler` is typed `FyflowScheduler` (`src/scheduler/runtime.ts:317`), so `cancel` is the scheduler's own,
  and the task id is spec/task-id.md's derivation. No stop-and-ask on that question was needed.
- **A run with a sibling still in flight when the cancel lands** — W158's L2 holds it (`test/driver/cancelled.test.ts`,
  a cancel mid-fan-out); on a runtime the run is RELEASED at `done` (ADR 0091) and a late sibling's settlement reaches no
  driver, so an L6 row would assert what the router drops — not in P33's exit sentence.
- **A flow file under `examples/flows/`** — the flow is written in `examples/l6.ts`, W141's precedent, because its
  types are not `registry.json`'s (a worker that waits for its signal has no place in the shared document every row's
  runtime builds), and a file there is walked by the L6 corpus censuses (`test/definition/wiring.test.ts`, the task-node
  census `spec/outcome-record.md` section 4 states) — two files outside `Owns` moved for no claim. *The plan's row owns
  `examples/flows/**`; this item adds nothing there.*
- **`task.cancelling` as a fold input** — decision 5; asserted here only as the scheduler's event, the second observer.
- **`src/scheduler/envelope-worker.ts:346`'s doc comment** (W159's Out, *W160 or P34*) — outside `Owns` and not
  touched by any claim here; left to **P34**.
- **`CLAUDE.md`'s scheduler fact** *"Until P33's W158 the listener DROPS a cancelled task and its run never ends, so
  nothing here calls it"* — its first half is dated history; *"nothing here calls it"* stops being true with this item's
  block, which calls `cancel` at L6. Outside `Owns` and `CLAUDE.md` takes no item's status; **named for P33's retro**.
- **`doc/scheduler-upstream.md` S2's *"What it costs us before P33 lands"*** — dated history, true as written; left.
- **Named for P33's retro, after the readers:**
  - **Adequacy F8 — the two runtimes disagree at `graceMs: 0`**: node reads `forced: false` with the abort arriving,
    deno reads `forced: true`. A scheduler observation, a candidate for `doc/scheduler-upstream.md`; not asserted here
    (the block uses the default grace).
  - **Adequacy F9 — two cancel roads no rung exercises**: a cancel BEFORE the thread picked the task up (`task.cancelling`
    with no `task.running`, the scheduler's section 6), and a cancel during a retry BACKOFF. **P34's.**
  - **Conformity F2 — P33 prediction 3** (*"`resource.unblocked`'s new `'cancelled'` reason reaches no assertion"*) was
    overtaken by this item: the queued run asserts that reason.
  - **`CLAUDE.md`'s *"nothing here calls it"*** (above).
  - **W159's adequacy F9** — `flushIntervalMs: 1e300` admitted by both, clamped to 1 ms by `setTimeout`; recorded there,
    a candidate for `doc/scheduler-upstream.md`.

## What the declaration step measured before anything was edited

*P15 decision 5 and P32-retro B: measured 2026-10-15 in a BYTE COPY of `db2f4b0` (`git archive` into `C:/tmp-w160/m`,
`node_modules` copied, **zero links** by `find -type l` and by PowerShell's `ReparsePoint` scan), node 24.20.0 and deno
2.9.6. The change was built there whole, and every lane run.*

| # | fact | measured |
|---|---|---|
| M1 | how a consumer reaches `scheduler.cancel(id)` for a run's task today | `Runtime.scheduler` is typed `FyflowScheduler` (`src/scheduler/runtime.ts:317`), the runtime's own scheduler and not a per-run view, so `runtime.scheduler.cancel(id, { reason })` is the scheduler's public call and compiles in `examples/` (`typecheck:examples`). The id is `spec/task-id.md` section 1's four segments over the run id the caller chose. **No edit to `src/` — not a stop-and-ask** |
| M2 | the baseline, re-run in the copy | `node examples/l6.ts` **EXIT 0, 2602 assertions / 168 real runs**, 33.5 s |
| M3 | the block, before any count moved | node: **31 new assertions, all passing**; the run EXIT 1 on exactly three count lines — the derived count (2621 against 2590), `DECLARED_TOTAL` (2634 against 2602, the three failures counted in) and `DECLARED_RUNS` (171 against 168). `1 + 3 x 10 = 31`, as written before the run |
| M4 | what the block MOVES | `CROSS_ROW` 269 -> 300, `DECLARED_TOTAL` 2602 -> 2633, `DECLARED_RUNS` 168 -> 171, `CROSS_ROW_SUBJECTS` +11, `pairRunCount` + the block's runs — all in `examples/l6.ts`. **Outside `Owns`**: `check-docs` `X10`'s two copies, `examples/README.md:38` and `:70` (red on the real tree until E1), and `:70`'s *69 row labels and 168 runs* (read by nothing — E1). **Unmoved, measured**: `test/definition/wiring.test.ts`'s L6 corpus census and `spec/outcome-record.md` section 4's task-node census (no file under `examples/flows/`); `check:workers`, `registry.json`, `THREADABLE_TYPES` (no shared worker or type); `RUN_FLOOR` (no snippet); `check:spec` (no rule, no corpus file); L1-L5 (no test) |
| M5 | the whole ladder, E1 applied in the copy | **`npm run gate` EXIT 0**: `lint` 146 files; the five `typecheck` lanes; the twelve checks — `check:spec` 7 documents / 75 examples / 134 rules, `check:docs` *X10 compared 2 copies … 2633 / 171*; L1-L5 **62 files / 1689 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1689) — unmoved; L6 **2633 / 171, 0 failed** in node and in deno |
| M6 | E2, applied in the copy | `check:docs`, `check:budget`, `check:markdown`, `check:wiring`, `check:source` each EXIT 0 |
| M7 | `examples/l6.ts:6947`'s citation at the pin | `core/FyflowScheduler.ts:894-897` is 0.5.2's optional branch (`task.state = 'failed'; task.resolve?.(null);`); at the pin it is **`:1151-1154`**, read in W157's scratch copy of the JSR source — the claim unchanged |
| M8 | the author's provocations | **11 of 11 RED for the reason each names, and the control CLEAN** — in a second byte copy (`C:/tmp-w160/p`), each edit asserted to occur once and to change its file, every file restored from its first snapshot and digest-compared, node 24.20.0 asserted as the environment (its first pass ran no node at all, exit 127 on every probe, and the CONTROL said so). Against the RULE: the driver not subscribing `task.cancelled` (18 red); the halt removed (3); `withOutcome` not ranking `cancelled` (3); `resumeRefusal`'s cancel clause disabled (3); the runtime's `done` ignoring `cancelled` (6); a refusal that is not the cancel's — every checkpoint refused (27, the CONTROL among them). Against the HARNESS: the cancel never sent (25); the worker ignoring its signal (3 — the emit clause and `forced`); the queued road without the hold (8); a claim deleted with both counts lowered (1, the subjects clause); the block's runs not counted (1, `DECLARED_RUNS`). The harness is a scratch script (`C:/tmp-w160/probes.py`), NOT in the tree |
| M9 | timing, the block's runs repeated | **No timing failure in 8 node runs and 7 deno runs**: on the real tree, `node examples/l6.ts` and `npm run test:l6:deno` five times each, every one EXIT 0 at 2633 / 171; in the copy, three more node runs and two more deno runs (the first full run, `npm run gate`'s two lanes, and the probe control). The block arranges its timing by EVENTS rather than clocks — the cancel is sent on `started` or on `resource.blocked` — and its only clocks are the 15 s deadline and the worker's 8 s backstop, each a failure path. [Q599](../questions/q599.md)'s three rows did not flake in these runs either |

## Exceptions — ASKED at the declaration step, ANSWERED YES by the maintainer 2026-10-15, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6 and section 7 rule 2. Each is the edit and nothing else. Both answered YES on
2026-10-15, relayed by the coordinator; this table was written before either was applied to the real tree.*

| | file | the edit, and nothing else | why, and its precedent | answer |
|---|---|---|---|---|
| **E1** | `examples/README.md` | three count sites, each moved from W155's figures to this item's and the old figure kept in the cell's parenthetical trail, W155's own form: **:38**, the paragraph under the two commands — *2602 assertions over 168 real runs* becomes *2633 assertions over 171 real runs*, the trail gaining *2602 / 168 until W160, whose cancel block is P33's exit artifact* with one clause on what it runs; **:70**, the `l6.ts` row's head — *168 real runs, 2602 assertions* becomes *171 real runs, 2633 assertions*, the trail gaining *168 / 2602 until W160 — three runs and no label*; **:70**, the same cell's tail — *69 row labels and 168 runs* becomes *69 row labels and 171 runs*, after one clause naming W160's CANCEL block (THREE runs, no label) beside W141's. The exact bytes are the copy's (`C:/tmp-w160/readme_edit.py`) | `check-docs` `X10` binds the first two to `DECLARED_TOTAL` and `DECLARED_RUNS` (M4) — **the real tree is RED at `check:docs` until this lands**; the third is the same cell's run count, read by nothing, stale otherwise. **Precedent: W155** (its `Owns` took both `X10` copies and the cell), **W141** and **W94**. P33's row omits the file. **Recommended: YES** | **YES** 2026-10-15, the maintainer, relayed by the coordinator; recorded before the edit |
| **E2** | `AGENTS.md:2234-2237` (section 12) | the sentence pair *"The current pin adds one thing this release does NOT yet handle: a sixth task state, `cancelled`, reached only through `scheduler.cancel(id)`. The listener drops a cancelled task and its run never ends — so do not call `cancel` on a task this library dispatched until P33 lands it."* becomes *"The current pin adds a sixth task state, `cancelled`, reached only through `scheduler.cancel(id)`, and a run hears it: a cancelled task ends its run `cancelled` and settles its `done` (section 6, P33) — on real workers in ladder L6, a task cancelled while running and while queued."* — the P33 link kept as it is. The exact bytes are the copy's (`C:/tmp-w160/e2_edit.py`) | **false since W158** and contradicted by section 6 of the same document and by this item's block: the reference tells a consumer NOT to make the call P33's exit artifact makes. A defect one decision settles, so ASKED (`doc/workflow.md` section 1 rule 6). Not required by any lane (M6). **Precedent: W158's E4** (a comment its change made false). **Recommended: YES** — the alternative is a question for P34, leaving a false sentence in the published reference until then | **YES** 2026-10-15, the maintainer, relayed by the coordinator; recorded before the edit |

## The readers' items — directed by the coordinator 2026-10-15, recorded here before their edits

*Every edit is in `examples/l6.ts` (in `Owns`), this file, or E1's README sites (E1 covers the same count copies).
Nothing outside them was needed.*

| | finding | the edit |
|---|---|---|
| **R1** | adequacy F1 (`OR-R4`, ADR 0094 rule 4): a driver recording at `task.cancelling` survived in both lanes — every read came after the cancel had finished | per run, a snapshot taken IN `done`'s settlement callback: the scheduler events heard so far and the scheduler task's state; asserted to hold `task.cancelled` and `cancelled` |
| **R2** | adequacy F2 (`RN-R28` *dispatches nothing further*): a halt that dispatched `after` one macrotask later survived | per run, the fold-input count at `done`, 25 ms later, and after shutdown, all 2, and the scheduler holding no task for `after`'s id |
| **R3** | shared (ii) — conformity F3 = adequacy F3: the cut-checkpoint control did not discriminate and over-labelled | the per-run cut control REMOVED; a FOURTH run, the same flow with `work` FAILING and parked `user_action` (nobody cancels), its checkpoint resumed by `runtime.resume` on the same fresh runtime — not refused, the resumed run `awaiting_action`. A NON-cancel, NON-`done` settlement, so a refusal keyed on any outcome or on any state but `done` refuses it |
| **R4** | adequacy F7: `result: null` compared through `JSON.stringify` | its own assertion, `=== null` |
| **R5** | adequacy F4 (low): the refusal index cannot tell first from last | NOT made to discriminate — each run stores one cancel; a comment names `test/driver/cancelled.test.ts`'s RN-R23 case (two cancels, neither first nor last) as where *first* is held |
| **R6** | shared (i) — conformity F1 = adequacy F6, with adequacy F5: "Q606's runtime half" claimed the RELEASE, which nothing asserts | relabelled *Q606's L6 clause (`done` settles `cancelled`)* in the header row, the block's comment and the label; the comment says the release half is P34's `test/scheduler/runtime.test.ts` case and that one run per runtime exercises no routing to a sibling |
| **R7** | conformity F4 (optional): the id hand-built rather than through `buildTaskId` | LEFT, with the comment saying why: the id is written from `spec/task-id.md`, not from the implementation's own derivation |

## Choices made inside the declaration and not named by P33

1. **One block, not `EXPECTED` rows** — W141's shape: a row runs through `runFlow`, which cancels nothing and whose
   backstop would name an unheard cancel (P33 fact 1, a run that never ends) after itself; and the worker is one no
   row should run. Its three runs and their claims are bound by `CROSS_ROW_SUBJECTS`.
2. **QUEUED behind a group the HARNESS holds**, not behind a sibling task of the run: the group row's arrangement
   (`holdGroup`), so the queued run is one task and nothing about it depends on which of two tasks acquired first.
3. **The cancel is deferred to a macrotask** on the event that proves the task's position (`started` through
   `context.emit` for a running task — the task is provably RUNNING; `resource.blocked` for a queued one), so it is the
   consumer's act and not a call re-entering the scheduler's own dispatch; `cancel()` of a waiting task fires
   `task.cancelled` synchronously inside the call.
4. **RUNNING on both pool modes, QUEUED on one**: the running road reaches the signal two ways (in-process, and as a
   message to a thread), and a queued task never reaches a worker, so its pool mode is not a variable.
5. **The resume is refused on ONE FRESH runtime** for all three checkpoints — so `RunIdInUse` cannot be the refusal —
   and its control reads the cut checkpoint through `resumeRefusal`, the one function `runtime.resume` calls first, so
   the control hands no scheduler a task. *(The control as declared did NOT discriminate — both readers' shared
   finding (ii): it cut BEFORE any settlement, so a refusal of any stored outcome passed it. Replaced after the readers
   by R3: a fourth run parked `user_action`, its checkpoint resumed by the same instrument on the same fresh runtime.)*
6. **W159's optional row is TAKEN** inside the running runs, not as a fourth run: the `started` message is what makes
   the cancel land on a running task, so emit is load-bearing, and the `aborted:<reason>` message is the signal seen.
7. **`forced: false` is asserted** on the threaded run: the worker honoured the signal inside the pool's default
   `cancelGraceMs` (2000 ms), so the thread was not retired — the forced stop is the scheduler's, and is not this
   library's claim.

## Verification

`npm run gate` (each rung's exit read on its own line), L6 in node and deno run repeatedly, the author's rule-8
provocations in a byte copy; then the readers; then `npm run gate:full` once. Routing coverage: a branch routed away
from its join (Q4) — not applicable, the flow has no region; `user_action` (Q17) — the refusal's CONTROL run parks `user_action` and its
checkpoint resumes (R3; W158's L2 and L5 hold a parked task beside a cancel); no matching decision edge (Q10) — not applicable; a duplicate task id
(Q13) — not applicable, each run has its own id; a nested fan-out (Q6) — not applicable.

## Record

**Gate — what ran.** Baseline `db2f4b0`; every number below is the final tree's.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `deno lint` (146 files), the five `typecheck` lanes |
| the checks | **RAN, pass** | the ladder's twelve; `check:spec` 7 documents / 75 examples / 134 rules (unmoved — no rule); `check:docs` `X10` compared both README copies against **2640 / 173** |
| L1-L5 | **RAN, pass** | **62 files / 1689 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1689) — UNMOVED; firefox and webkit NOT RUN (`test:browser:all` is not on the gate) |
| L6 node 24 | **RAN, pass** | **2640 assertions / 173 real runs**, 0 failed. Baseline 2602 / 168 |
| L6 deno | **RAN, pass** | **2640 / 173**, 0 failed |
| `npm run gate`, before the readers | **RAN, first EXIT 1 then `GATE EXIT=0`** | EXIT 1 at `check:docs` `X10` alone before E1 (the declaration's prediction, M4); `GATE EXIT=0` after E1 and E2, at 2633 / 171 |
| conformity reader | **RAN** | no defect; F1-F4 (below) |
| adequacy reader | **RAN** | no defect; F1-F9 (below) |
| overlap | | **2 shared subjects**: (i) *Q606's runtime half* claimed the release, which the block does not assert (conformity F1 = adequacy F6); (ii) the cut-checkpoint control did not discriminate and over-labelled (conformity F3 = adequacy F3) |
| `npm run gate`, after the readers' items | **RAN, first EXIT 1 then `GATE EXIT=0`** | EXIT 1 at `lint` — `resumeRefusal` imported and no longer used once R3 removed the cut control; the import removed, then `GATE EXIT=0` |
| **`gate:full`, the confirming run** | **RAN, `GATE:FULL EXIT=0`** | ONE command on the final tree, held still: the ladder, then **11/11 self-test lanes ok** (`check:register:selftest` included), 2362.9 s self-test wall, 41 m 41 s in all |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| C-F1 / A-F6 (shared (i)), A-F5 | *Q606's runtime half* claimed the release; one run per runtime exercises no routing to a sibling | R6: relabelled *Q606's L6 clause (`done` settles `cancelled`)* in the header row, the block comment and the label; the release half named as P34's `test/scheduler/runtime.test.ts` case |
| C-F3 / A-F3 (shared (ii)) | the cut-checkpoint control cut before any settlement, so a refusal of any outcome passed it | R3: replaced by a FOURTH run parked `user_action`, resumed by `runtime.resume` on the same fresh runtime — not refused, `awaiting_action`. The `!== 'done'` and `kind === 'outcome'` mutations of `driver.ts:401` are now RED in this block, both lanes (rC, rD below) |
| A-F1 | recording at `task.cancelling` survived — every read came after the cancel finished | R1: the scheduler's events and task state read IN `done`'s settlement callback; the mutation (rA) RED both lanes |
| A-F2 | a dispatch one macrotask after the halt survived | R2: fold-input counts at `done`, 25 ms later and after shutdown, and `after` not held; the mutation (rB) RED both lanes |
| A-F7 | `result: null` through `JSON.stringify` | R4: its own `=== null` assertion |
| A-F4 (low) | the refusal index cannot tell first from last | R5: a comment; `test/driver/cancelled.test.ts`'s RN-R23 case holds it |
| C-F4 (optional) | id hand-built, not `buildTaskId` | R7: left, the comment says why |
| C-F2, A-F8, A-F9 | prediction 3 overtaken; `graceMs: 0` differs between runtimes; two unexercised cancel roads | Out, for P33's retro and P34 |

**The provocations** (`doc/workflow.md` section 5 rule 8; scratch harness `C:/tmp-w160/probes.py`, NOT in the tree; each edit
asserted to occur once and to change its file, every file restored and digest-checked, node 24.20.0 asserted). **After the
readers, re-run in a byte copy of the final block (`C:/tmp-w160/q`) in BOTH lanes: 15 of 15 RED for the reason each names,
the control CLEAN, in node AND in deno** — the author's eleven (driver not subscribing `task.cancelled`; the halt removed;
`withOutcome` not ranking `cancelled`; the resume's cancel clause disabled; the runtime's `done` ignoring `cancelled`; every
checkpoint refused; the cancel never sent; the worker ignoring its signal; the queued road without the hold; the control
claim deleted with both counts lowered; the block's runs not counted) and the readers' four — **rA** the listener and
driver recording at `task.cancelling` (2 red: the two running runs' at-`done` clause), **rB** the halt advancing to `after`
on a later macrotask (12 red), **rC** a refusal of any settlement but `done` (5 red, the CONTROL among them), **rD** a refusal
of any outcome (22 red, the CONTROL among them). Before the readers the author's eleven were run in node only (M8).

**Timing.** No timing failure in any run: the author's 10 node and 9 deno runs before the readers (M9 and the pre-reader
gate), and after them two more each plus the two gate runs and the 32 probe runs' clean controls. **The adequacy reader saw
about 28 node and 13 deno runs green, with the threaded run's cancel to `cancelled` at 2-8 ms — about 250x inside the
default 2000 ms grace.** [Q599](../questions/q599.md)'s three rows did not flake in any of them.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the block | `examples/l6.ts`, four runs on their own runtimes and one fresh runtime for the resumes — five runs counted | every probe above; the runs' count (p11) |
| (2) the claims | 1 + 3 x 12 + 1 = **38** cross-row assertions (31 as declared; R1, R2, R4 +3 per run, R3 -1 per run and +1) | `CROSS_ROW_SUBJECTS` (p10); each claim's provocation |
| (3) the censuses | `CROSS_ROW` 269 -> 307, `DECLARED_TOTAL` 2602 -> 2640, `DECLARED_RUNS` 168 -> 173, subjects +14, `pairRunCount`, the header | the file's own count checks; `X10` against E1's copies |
| (4) the citation | `:1151-1154` | nothing but the readers |
| (5) W159's optional row | inside the two running runs | p8 (the emit clause) |

**`git diff --name-only` against `Owns` and the exceptions**, on the final tree: `examples/l6.ts` (Owns),
`examples/README.md` (E1), `AGENTS.md` (E2), and this file, new. Nothing is undeclared.

**What broke.**

1. **The declared control could not fail where its claim was vacuous** — `doc/workflow.md` section 5 rule 8 (d)'s v0.21
   clause, followed and missed: it cut the checkpoint before any settlement, the one cut every wrong refusal keyed on an
   outcome also passes. Both readers found it (overlap (ii)); the author's eleven provocations did not, because the one
   aimed at it (p6, *every checkpoint refused*) was the widest wrong refusal rather than the nearest.
2. **Two claims were read too late to see their own failure** — the record at `done` (R1) and *nothing further* (R2) were
   each read after the cancel had finished or before a later turn, so a driver that recorded early or dispatched late was
   green. Found by the adequacy reader, by mutation.
3. **A label claimed more than its block asserted** — Q606's release half (overlap (i)).

**What this taught.** Nothing proposed here; the retro decides. A control derived by cutting the CLAIM's own input is the
first control an author reaches for and the one that shares the claim's blind spot.

**Questions.** Raised: none. Closed: none. **Q613-Q614 released unused**; no ADR (**ADR 0095 unused**). **W161 unused**, as
P33 expected.
