# W158 — `cancelled` is a library state and a run outcome: a cancelled task is recorded, halts its run, and refuses its resume

**Status:** done 2026-10-15 — **`npm run gate:item` EXIT 0** on the final tree, one command, after a first run RED on
`check:docs:selftest` (Record); declared 2026-10-15 on `f73ed3c`, declaration step RUN the same day in a byte copy;
exceptions E1-E4 ASKED at the declaration step and E5 after the readers, all ANSWERED YES by the maintainer
2026-10-15 and recorded before their edits; both reader passes RUN; Q605 and Q606 raised, nothing closed
**Plan:** [P33](../plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) — *what does a run fold to when the
scheduler under it can end a task cancelled?* — its SECOND item.

```
Spec:       spec/outcome-record.md v0.12 -> v0.13 (OR-R3 and OR-R4's text; section 1's comment, section 2's
            terminalState row and live-detail list, section 3's walkthrough); spec/run-state.md v0.14 -> v0.15
            (section 3's table and count, section 4's state list, RN-R23's text, and ONE rule, RN-R28);
            spec/join-policy.md v0.19 -> v0.20 (a paragraph after section 2's Q5 table; JP-R12's run-level release
            clause); spec/README.md's three rows. No FD-V id moves; no FoldInput kind, no RunState cell.
Owns:       from P33's index row: src/definition/types.ts, src/driver/listener.ts, src/driver/driver.ts,
            src/fold/run-state.ts, spec/outcome-record.md, spec/run-state.md, spec/join-policy.md,
            spec/README.md, AGENTS.md, test/driver/**, test/fold/**, test/matrix/**, doc/decisions/0094-*.
            And by the Exceptions below, ANSWERED YES 2026-10-15: test/definition/l4-corpus.test.ts (E1),
            test/scheduler/runtime.test.ts (E2), examples/l6.ts (E3), examples/run-flow.ts (E4);
            and scripts/check-docs.mjs:726 (E5, ANSWERED YES 2026-10-15, after the readers).
Inputs:     P33 facts 1-3 and 9, decisions 2-5, 7 and 8, the ANSWERED stop-and-asks (a)-(e) with the maintainer's
            amendment, P32-retro sentences B and C, prediction 4; W157's Out (the four sites it handed here); the
            scheduler's contract at the pin — node_modules/fyflow-scheduler/AGENTS.md sections 5 and 6 (cancel(),
            task.cancelling, task.cancelled, the cancelled state) and the JSR source W157 fetched into scratch
            (core/FyflowScheduler.ts).
Outputs:    (1) the listener: task.cancelled subscribed (SETTLEMENT_EVENTS), TERMINAL gains cancelled, one record
                copied verbatim (OR-R3), task.cancelling writing nothing (OR-R4).
            (2) the four unions widened — TerminalState, NodeState, RunOutcome, ResumeRefusalReason — each stated
                BREAKING where it is widened; RoutableState NOT widened (FD-V18 unchanged).
            (3) the fold: NodeState `cancelled` copied verbatim; RunOutcome `cancelled` in withOutcome below
                `stopped` and above `awaiting_action` (RN-R28).
            (4) the driver's halt: the first cancelled settlement sets a `cancelled` flag that shuts the doors
                `failed` shuts (settle, resolve, settleJoin's door on the stack), releases every region's
                collection, appends no `stopped`, reports nothing.
            (5) resumeRefusal's sixth reason, `cancelled`, after `stopped`, at the FIRST stored cancel.
            (6) the three specs and spec/README.md's rows, versioned; ADR 0094.
            (7) AGENTS.md: section 6 (a subsection, an executed snippet), section 7 (:1024's sentence, W157's F4),
                section 8 (the precedence snippet and the outcome table, seven), section 9's and section 18's
                refusal reasons, section 11's cancellation and durability rows, section 12's snippet comment.
            (8) W157's handed-over citations re-taken at the pin: src/driver/listener.ts:5, test/matrix/run.ts:168,
                test/driver/driver.test.ts:630.
            (9) tests (below).
Depends on: W157
Blocks:     W159 (serial — both edit src/definition/types.ts and AGENTS.md), W160
Tests:      L1 test/driver/cancelled.test.ts (the record, the subscription, FD-V18), test/fold/cancelled.test.ts
            (the node, the outcome beside each neighbour in both orders); L2 test/driver/cancelled.test.ts (a cancel
            mid-fan-out against its control, the in-flight sibling, a second cancel, a parked task's resolve
            refused, a cancel at a sequence's entry, a cancel on a join's stack); L3 both files (driven twice,
            folded twice, prefix by prefix); L5 test/matrix/cancelled.test.ts (three rows x four columns); RN-R23
            in test/driver/cancelled.test.ts; and `cancelled` added to the tier loops of
            test/driver/lifetime.test.ts (ID-R4 tiers 1 and 2, ID-R5). Expected values from the specs and the
            scheduler's reference; each claim beside its control.
Gate:       `npm run gate` before the readers (P32-retro C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree.
Reserves:   Q605-Q609, ADR 0094
```

*Reserves: `npm run state` on `f73ed3c` reads the next free ids as **W158, Q600, ADR 0094** from the tree, and
**W157, Q600, ADR 0094** from the ledger, which DISAGREE on W only because P33 has been declared since that sentence
(both are printed, neither picked). P33 reserves Q600-Q614 and ADR 0094-0095; W157 reserved Q600-Q604 and spent none,
and ADR 0094 is this item's by the plan's row. So this item takes **Q605-Q609 and ADR 0094**.*

## Scope

**In** — Outputs (1)-(9).

**Out** — named rather than left implicit, with where it goes instead

- **Any call that cancels, stops or pauses a RUN, and a `cancelling` run state** — P34 (P33 Out). This item makes a
  cancel NOTICED and adds no call that cancels.
- **Whether a cancel's `done` waits for the run's other tasks to stop** — P34 (decision 3). Here `done` settles on
  the first cancel.
- **The rename of `stopped`** — P34. Every `stopped` here is today's halt.
- **The cancel's `reason` on the record** — the record stays eleven fields (`OR-R3`); ADR 0094 consequence 4.
- **`cancelGraceMs`, `messages`, `context.signal`, `context.emit`** — W159.
- **The exit artifact on real workers** (cancel while running and while queued, both runtimes) — W160. **No rung of
  this item touches a real scheduler**: L6 is unmoved except E3's one list entry, and that a cancel REACHES a driver
  through `createRuntime`'s routing (ADR 0088) is asserted by nothing here — the runtime routes by event name and
  every subscription (E2's count proves the fourth reaches it), and W160 runs it.
- **`examples/l6.ts:6947`'s undated citation** — W160's (W157's Out).
- **`src/scheduler/runtime.ts`'s doc comments** naming `done`'s terminal outcomes (*"`stopped` — and never
  rejects"*, `:285`) and `resume`'s refusals (*"`resumeRefusal` — format, flow id, version, a stopped run"*, `:331`,
  which omits `cancelled`) — incomplete rather than false, outside `Owns`; **P34's**, whose cancel lives on the runtime.
- **Two doors a RE-ENTRANT halt does not shut, a cancel's or a stop's** — a fan-out's remaining branch dispatches
  and a resolution's routing after its append — found by both readers (conformity F1, adequacy F2), **decided by
  the maintainer for P34's dispatch hold rather than patched here**: [Q605](../questions/q605.md). `RN-R28` and
  ADR 0094 consequence 6 say the cancel shuts exactly `OR-R10`'s doors and not these.
- **A runtime's `done` settling on `cancelled` and its release of the run** (`src/scheduler/runtime.ts:646-651`) —
  asserted by nothing with no workers, and `test/scheduler/runtime.test.ts`'s per-outcome release case (`:2687`)
  has no `cancelled` row; `test/scheduler/**` is not this item's beyond E2: [Q606](../questions/q606.md), P34. **W160's
  L6 cancel rows should AWAIT `done`**, not only fold the sequence, so the exit artifact asserts it on real
  workers.
- **`examples/settlement-cost.ts:181`** and **`test/scheduler/transform.test.ts:522`** subscribe three settlement
  events on a scheduler of their own — measurements of the scheduler, not of the driver, and neither cancels; left.

## What the declaration step measured before anything was edited

*P15 decision 5 and P32-retro B: measured 2026-10-15 in a BYTE COPY of `f73ed3c` (`git archive` into `C:/tmp-w158/m`,
`node_modules` copied, **zero links** by `find -type l` and by PowerShell's `ReparsePoint` scan), node 24.20.0 and
deno 2.9.6. The change was built there whole, and every lane run.*

| # | fact | measured |
|---|---|---|
| M1 | the dispatch sites at the pin | in W157's scratch copy of the JSR source: `task.cancelled` at `core/FyflowScheduler.ts:1198` (`_finishCancelled`), reached from `_settleCancelled` (`:1181-1192`, a dispatched task) and `_cancelUndispatched` (the function at `:1268`, its call to `_finishCancelled` at `:1312`; a waiting task — **synchronously, inside `cancel()`**) *(this cell cited `:1293-1312` for the function; `:1293` is its state assignment — the conformity reader's F6)*; `task.cancelling` at `:1250`, state still `running`; `error` cleared on every road. The four undated live-detail sites W157 re-took (`:1093, 1164, 1166, 1554, 1556`) read the same |
| M2 | the code change, in-`Owns` only | `typecheck` RED at ONE site: `test/driver/resume.test.ts:160`, a fake's `settle(state: 'done' \| 'failed' \| 'user_action')` handed a stored record's `TerminalState` — **prediction 4's LOUD half**. `examples/` and every `AGENTS.md` snippet compiled unchanged |
| M3 | `npm test`, in-`Owns` only | **5 failures**: the suite census (`test/definition/l4-corpus.test.ts`, eight new suite names — E1); `test/driver/retention.test.ts`'s `DRIVER_FIELDS` ratchet (the new `cancelled` field — in `Owns`); and **three** assertions in `test/scheduler/runtime.test.ts` counting the driver's subscriptions (`:2314` the list, `:2441` and `:2633` the count 3 — E2) — **prediction 4's SILENT half**: each compiled, and each is a consumer of `SETTLEMENT_EVENTS` counting what it held |
| M4 | L6, node and deno | **1 failure each**, `cross-row`: `examples/l6.ts`'s own `DRIVER_FIELDS` ratchet (`:10973-10998`) — E3. Every other L6 row unmoved: no row cancels |
| M5 | stale prose the change makes false and no check sees | `examples/run-flow.ts:1495` (*"the driver's three subscriptions"* — E4); `AGENTS.md` section 12's no-scheduler snippet comment (*"subscribes to three of them … writes THREE records"* — in `Owns`) |
| M6 | with E1-E4 applied in the copy | every lane of `npm run gate` EXIT 0 — the numbers are the Record's, re-taken on the real tree |
| M7 | the author's own provocations, in the copy | 14 mutations of the new clauses against the three new suites: **12 caught**, **2 survive by design** — deleting `task.cancelling` from `normalizeEvent`'s early return, and adding it to `SETTLEMENT`: each guard alone is redundant with the other, exactly as `task.running`/`task.progress` already are (the early return and the settlement-name check both refuse them). Stated, not hidden. **After the readers** (adequacy F4/F7): the two `task.cancelling` assertions (`test/driver/cancelled.test.ts`, the L1 case and the mid-fan-out case) are CARRIED by that redundancy and say so in a comment; the driver case gains an assertion that `task.cancelling` is not subscribed, which fails on its own if it is |

## Exceptions — ASKED at the declaration step, ANSWERED YES by the maintainer 2026-10-15, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6 and section 7 rule 2. Each is the edit and nothing else. All four answered YES on
2026-10-15, relayed by the coordinator; this table was written before any of them was applied to the real tree.*

| | file | the edit, and nothing else | why, and its precedent | answer |
|---|---|---|---|---|
| **E1** | `test/definition/l4-corpus.test.ts` | `LATE_SUITES` (opening at `:426`) gains this item's eight suite names, under a two-line comment naming their files | the census is set-equal by design (`S12`); **precedent: W153 and W154** took the same exception for their suites | **YES** 2026-10-15 |
| **E2** | `test/scheduler/runtime.test.ts` | `:2313-2315` the subscription list gains `task.cancelled` (and *"nine, three per driver"* becomes *"twelve, four"*), `:2441` and `:2633` the count 3 becomes 4 | `SETTLEMENT_EVENTS` gains a fourth name; the runtime subscribes once per name | **YES** 2026-10-15 |
| **E3** | `examples/l6.ts` | `DRIVER_FIELDS` (`:10973-10998`) gains `'cancelled'`, with a two-line comment | L6's driver-field ratchet, `RN-R13`'s observer at L6; W160 owns the file and has not started. **Precedent: W151** took the same exception for `deaf` | **YES** 2026-10-15 |
| **E5** | `scripts/check-docs.mjs:726` | `RUN_FLOOR = 35` becomes `36`, plus one history comment line above it (*"Raised 35 -> 36 by W158 … exception E5"*) | section 6's new `run` snippet made the floor stale: the first `gate:item` was RED on `check:docs:selftest`'s X4 probe (*a whole `run` snippet deleted*, wanted `[X4,X8]`, got `[X8]`). **Precedent: W101, W108, W110 and W154** (its exception (o)), each recorded in the ratchet's own comment | **YES** 2026-10-15, asked after the readers |
| **E4** | `examples/run-flow.ts:1494-1495` | *"The driver's three subscriptions"* becomes *"four subscriptions (three until W158 added `task.cancelled`)"* | a comment made false by this item; not required by any lane | **YES** 2026-10-15 |

## Choices made inside the declaration and not named by P33

1. **The halt is a SEPARATE flag, not `failRun`.** `failRun` appends `stopped`, calls `onRunFailure` and makes
   `hasFailed()` true — three readers that would each call an owner's cancel a refusal. The new `cancelled` field
   is read at every door `failed` is (settle, resolve, `settleJoin`'s guard), and nowhere else.
2. **The fold derives `cancelled` from `nodes`, not from a new fold input.** The settlement is already in the log,
   so `withOutcome` reads it; no `FoldInput` kind is added and a stored run's sequence is unchanged in shape.
3. **A defect AFTER a cancel still stops the run** — `failRun` is unchanged, so a later settlement `OR-R6` refuses
   appends `stopped`, which outranks (`RN-R8`), and the resume is refused `stopped`. Asserted.
4. **The `cancelled` rows are not in `SCENARIOS`**: Q5's nine are counted by ADR 0003 and a cancel halts the run
   rather than ending a branch — `CANCELLED_SCENARIOS`, beside `TWO_REGIONS`, `NESTED_SCENARIOS` and
   `MAP_SCENARIOS`, with `Verdict` gaining `cancelled`.
5. **`resumeRefusal` names the FIRST stored cancel**, and a cancel is any `outcome` element with
   `terminalState: 'cancelled'` — the fixture holds two, neither first nor last, so every wrong selection differs.
6. **`RN-R28` is a new rule rather than a sentence in `RN-R8`**, because it has its own test obligations and owner.
7. **`AGENTS.md` sections 9, 12 and 18 are edited too** — the plan's row owns `AGENTS.md`; the brief named 6, 8,
   11 and :1024. Section 9's and 18's enumerate `ResumeRefused`'s reasons and would be false; section 12's comment
   counts the driver's subscriptions.
8. **The amended ADRs carry a note** — 0007 rule 2, 0058 rule 3 and 0065 rule 2 — on ADR 0088's precedent for
   ADR 0091 (`doc/decisions/**` is a record-step file). ADR 0058 rule 3 was added to `amends` after the readers
   (conformity F4).

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: a branch routed away from its join (Q4) — not applicable, a cancel is not a routing; `user_action` (Q17) —
a parked task beside a cancel, at L1, L2 and L5; no matching decision edge (Q10) — not applicable; a duplicate task id
(Q13) — not applicable; a nested fan-out (Q6) — the cancel on a join's stack is a depth-2 flow.

## Record

**Gate — what ran.** Baseline `f73ed3c`; every number below is the final tree's, from the confirming `gate:item`.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `deno lint`, the five `typecheck` lanes — `test/fold/cancelled.test.ts`'s two `@ts-expect-error` lines pin `RoutableState` there |
| the checks | **RAN, pass** | the ladder's twelve; `check:spec` 7 documents / 75 examples / **134 rules** (`RN-R28` the new one) |
| L1-L5 | **RAN, pass** | **61 files / 1682 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1682); firefox and webkit NOT RUN (`test:browser:all` is not on the gate). Baseline 58 / 1635 |
| L6 node 24 | **RAN, pass** | **2602 assertions / 168 real runs**, 0 failed — no row cancels; E3's list entry is the one line moved |
| L6 deno | **RAN, pass** | **2602 / 168**, 0 failed |
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree after E1-E4 (P32-retro C); before them EXIT 1, exactly E1's census and E2's three assertions at `npm test`, and E3's `cross-row` at L6 — the declaration step's prediction |
| `gate:item`, first run | **RAN, RED** | the ladder green and nine self-test lanes green; **`check:docs:selftest` 46/47** — the X4 probe *a whole `run` snippet deleted* wanted `[X4,X8]`, got `[X8]`: section 6's new `run` snippet made `RUN_FLOOR = 35` stale. E5, answered YES |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still: the ladder, then the self-tests less `check:register:selftest` — **10/10 lanes completed, 10 ok**, 787.5 s wall; `check:docs:selftest` 47/47. `gate:full` NOT RUN and not owed (W160 is P33's last item) |
| conformity reader | **RAN** | F1-F7, all acted on or handed on (below) |
| adequacy reader | **RAN** | F1-F7, all acted on or handed on (below) |
| overlap | | **2 shared subjects**: (i) the re-entrant halt's two open doors (conformity F1 = adequacy F2); (ii) the runtime's `done` and release on `cancelled`, unasserted (conformity F7b = adequacy F3) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| C-F1 / A-F2 | a fan-out's remaining branch dispatches (`driver.ts:2372`) and `resolve()`'s routing after its append (`:1809-1843`) re-check no halt; a stop leaks the same | **the maintainer's decision: handed to P34's dispatch hold**, [Q605](../questions/q605.md) raised; `RN-R28`, ADR 0094 rule 3 and consequence 6, and `AGENTS.md` section 6's row say the cancel shuts exactly `OR-R10`'s doors and not these |
| C-F2 | *"still APPENDED"* is a bare `Driver`'s; a runtime releases the run at `done` | `RN-R28`, `AGENTS.md` section 6 and ADR 0094 consequence 7 qualified |
| C-F3 | `RN-R12`'s rationale and `isTerminal`'s comment called every terminal outcome *nothing live* | both corrected: `stopped` and `cancelled` are terminal with dispatched nodes possibly unsettled |
| C-F4 | ADR 0058 rule 3 (what settles `done`) is amended and not listed | added to `amends`; notes in ADRs 0007, 0058 and 0065 on ADR 0088's precedent |
| C-F5 | `spec/outcome-record.md` section 4's `result: null` table; run-state's *"not a sixth precedence row"* | a `cancelled` row; the count dropped |
| C-F6 | `_cancelUndispatched` cited at `:1293-1312` | `:1268` the function, `:1312` its call — ADR 0094 and M1 |
| C-F7a | the cancelled-then-stopped case did not assert the later report | asserts `onRunFailure` once and `hasFailed()` true |
| C-F7b / A-F3 | the runtime's `done` and release on `cancelled` asserted by nothing; `runtime.test.ts:2687` has no `cancelled` row | [Q606](../questions/q606.md) raised, owner P34; Out tells W160 to await `done` |
| A-F1 | deleting the cancel's `arrivals.clear()` survived | the twin of the stop's retention case; **provoked**: the deletion turns `retention.test.ts` red |
| A-F4 / A-F7 | the two `task.cancelling` assertions could not fail alone | the driver case asserts the event is not subscribed; the L1 one is stated as carried (M7) |
| A-F5 | `RoutableState` pinned by nothing at the type level | two `@ts-expect-error` assignments, `typecheck:tests` |
| A-F6 | `RN-R28` is not monotone | one sentence in `RN-R28` and ADR 0094 consequence 8: unreachable at the pin |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the listener | `src/driver/listener.ts`, `SETTLEMENT_EVENTS` | `test/driver/cancelled.test.ts` L1 and L2; E2's subscription counts |
| (2) the four unions | `src/definition/types.ts`, `src/fold/run-state.ts`, `src/driver/driver.ts` | `typecheck` (the fold's verbatim copy and every `cancelled` literal in the tests) |
| (3) the fold | `withOutcome` | `test/fold/cancelled.test.ts`, every neighbour both orders; the L5 rows |
| (4) the halt | the `cancelled` flag at three doors, the release | L2 and L5; the retention twin; E3's and `retention.test.ts`'s ratchets |
| (5) `resumeRefusal` | `src/driver/driver.ts` | the RN-R23 suite, first-of-two position |
| (6) specs, ADR | three specs versioned, README rows, ADR 0094 | `check:spec` `C8`, `C2`/`C6` for `RN-R28` |
| (7) `AGENTS.md` | sections 6-9, 11, 12, 18 | `check:docs` X3/X4 (section 6's and 8's snippets), `RUN_FLOOR` (E5) |
| (8) the citations | `listener.ts:5`, `run.ts:168`, `driver.test.ts:630` | nothing but the readers |
| (9) tests | three new files, five extended | — |

**`git diff --name-only` against `Owns` and the exceptions**, on the final tree: 23 modified and 7 new files. Every
one is in the plan row's `Owns`, in E1-E5, or in the record step (`doc/questions/q605.md`, `doc/questions/q606.md`,
and the amendment notes in `doc/decisions/0007-*`, `0058-*`, `0065-*`). Nothing is undeclared.

**What broke.**

1. **Prediction 4, measured**: LOUD at one site (a test fake's state parameter, M2); SILENT at three runtime
   assertions, a suite census, two driver-field ratchets and two comments (M3-M5) — and, found only by the first
   `gate:item`, a SNIPPET FLOOR (E5): adding an executed snippet is a count a self-test reads.
2. **The halt's re-entrant doors** were stated as shut and are not, for a stop either (Q605) — the conformity
   reader's construction, which no mutation of this item's code could have found.

**What this taught.** A floor that only the self-tests read cannot be seen by the ladder an item runs before its
readers, so P32-retro sentence B's census missed it in the byte copy (which ran `npm run gate`, not the self-tests).
Nothing proposed here; the retro decides.

**Questions.** Raised: **[Q605](../questions/q605.md)** (the two doors a re-entrant halt does not shut — P34) and
**[Q606](../questions/q606.md)** (the runtime's `done` and release on `cancelled`, unasserted — P34, and W160's L6).
Closed: none. **Q607-Q609 released unused**; ADR 0094 used, ADR 0095 not this item's.
