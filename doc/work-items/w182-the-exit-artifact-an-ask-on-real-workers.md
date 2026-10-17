# W182 — the exit artifact: a node that waits for a person, on real workers in both runtimes

**Status:** done 2026-10-18 — **`npm run gate:full` EXIT 0** on the final tree, one command, the plan's last item; both reader passes RAN, no BLOCKER — conformity: the seven clauses CONFORM, three NITs fixed; adequacy: one SHOULD (A1) and two NITs fixed, a note acted on; readers' overlap ZERO; no question raised; no exception. Earlier: READY-FOR-READERS 2026-10-17 (`npm run gate` EXIT 0, L6 5/5 in node and
5/5 in deno, 41 of 42 one-clause probes KILLED) — declared 2026-10-17 on `adb453e`
(W181 committed); P35's LAST item, its exit artifact; not committed
**Plan:** [P35](../plans/p35-may-a-node-wait-for-a-person-by-design.md) — *may a flow declare a node that waits for a
person, keeps what reached it, and holds the person's answer to a schema — without a task failing to get there?* — its
LAST item and its EXIT ARTIFACT: the header's seven clauses, one cross-row block in `examples/l6.ts`, green in node 24
and in deno.

```
Spec:       NONE moves — an exit artifact writes no rule (W94's, W155's, W160's, W167's and W176's precedent). The
            expected values are written from spec/flow-definition.md section 2's `ask` (v0.43) and FD-R4's resolve
            boundary; spec/run-state.md v0.23 — RN-R36 (the `asked` element folds the node `suspended` with its input
            KEPT, the run `awaiting_action`), RN-R37 (the park appends ONE `asked` element and hands NOTHING to the
            scheduler; `resolve()` answers it, held to `answerSchema`, refused by name with nothing appended; the
            answer routes as a task's settlement — `on` and a `when` over `outcome.result`; in a region
            `branch.suspended` at the park and `branch.resumed` at the answer), RN-R38 (a parked ask under cancel,
            stop, pause and resume), RN-R30/RN-R31 (a cancel), RN-R32/RN-R33 (a stop), RN-R21/RN-R22 (the resume
            re-dispatching only what is in flight), RN-R34/RN-R35 (a pause holding the dispatch it appends), section
            3's precedence; spec/outcome-record.md section 7 v0.18 (an ask's effective outcome — the answer IS its
            result); spec/join-policy.md section 2 and JP-R5/JP-R12 (an ask in a region; the join's collection);
            spec/task-id.md section 1 and its ask paragraph; P35's facts 2-6, decisions 5-6 and stop-and-asks (a)-(h).
Owns:       from P35's W182 row, exactly: examples/l6.ts, examples/flows/**, examples/workers/**, examples/README.md.
            examples/flows/** is in the row and is NOT expected to be edited: the flows and the workers are written in
            the block with data: workers (W141's, W160's, W167's and W176's precedent). examples/workers/** is edited
            at ONE comment: shard.ts:5's "a map region's branch entry is a TASK" premise (W179's and W180's hand-on).
            Exceptions: none declared. Anything else (src/**, spec/**, AGENTS.md, test/**, scripts/**) found to need an
            edit is a STOP-AND-ASK (S-n, a recommendation and an alternative), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q675-Q677 only if raised),
            doc/decisions/** (dated pointers only, if any), README.md (only if the precedent touches it), this file.
            NOT the plan's Record or Retro — the coordinator's, after this item.
            Overlap with W181 (serial, P35's rows): none — W181's row owned no file under examples/.
Inputs:     P35's Exit artifact (seven clauses, read word for word), facts 2-6, decisions 5-6, stop-and-asks (a)-(j) as
            answered, prediction 5, sentences B′, C, D′, E and the two brief sentences; W179's R9 (the L6 kind
            exemption expires at this row), W180's and W181's hand-ons (the exemption, examples/l6.ts:6916 and :12628,
            examples/workers/shard.ts:5, X10; the probes C:/tmp-w180/probe/probe.ts and C:/tmp-w181/probe/probe.ts as
            the clauses in miniature); W176's block as the shape and its Record's lessons.
Outputs:    (1) ONE cross-row block in examples/l6.ts — `W182 exit` — its registry DOCUMENT written in the block with
                data: workers, every runtime shut down in a finally, each clause guarded by its own catch (W176's
                rcClause), bound by CROSS_ROW_SUBJECTS. By the header's clauses:
                (1) task `draft` on a THREADED pool -> ask `approve` (answerSchema `{ approved: boolean }` required):
                    the park, read on the log, the fold and the real scheduler (its task map, every id its events
                    carried, every id handed to addTask); the CONTROL beside it — `draft` WAS handed and seen by the
                    same observers.
                (2) the same flow, answered TWICE (two runs): a schema-refused `done` answer thrown by name with
                    nothing appended, then the conforming one on the SAME driver — `approved: true` routing by the
                    `when` to the end `published`, `approved: false` by the default edge to `shelved`; each run the
                    other's control.
                (3) the same flow, a `failed` answer (a decline) routing `on: ['failed']` to the end `declined`.
                (4) a fan-out of an ask `review` beside a task `score`, joined, then `publish`: run TWICE — answered
                    after `score` has arrived (the join fires AT the answer) and answered while `score` still runs
                    (the join fires at `score`'s settlement) — so "holds the join until it is answered" is arranged
                    both ways.
                (5) task -> ask -> task `publish`: parked on runtime A, STOPPED, the answer refused on A and A refusing
                    the resume; the checkpoint resumed on a FRESH runtime B — the `asked` element regenerated at its
                    stored position with the same id and kept input, nothing handed to B for it — and answered on B,
                    `publish` B's only task, to `completed`.
                (6) the same flow parked and CANCELLED through driver.cancel: no cancel sent to the scheduler, `done`
                    `cancelled`; the CONTROL — the same flow cancelled while `draft` RUNS, its cancel sent.
                (7) the same flow parked, PAUSED, answered: the successor appended and held — not handed on — until
                    the unpause hands it on; the CONTROL — the same answer on a run not paused hands it on at once.
            (2) the claims, each in CROSS_ROW_SUBJECTS, counted at the build and written here before the block's first
                complete run.
            (3) every L6 census the block moves, in the same diff: CROSS_ROW, DECLARED_TOTAL, DECLARED_RUNS,
                CROSS_ROW_SUBJECTS, pairRunCount, the file header (P35 in the exit-artifact list, one table row);
                examples/README.md's two X10 copies (and the l6.ts row's run tail, if stale).
            (4) the L6 kind clause's `ask` exemption (NOT_YET_AT_L6, W179 R9) REMOVED — the clause reading the kinds
                of the flows this block STARTED beside EXPECTED's, so it sees an ask at L6; its constructed inputs
                re-cut to the un-exempt form (W94's precedent for `gate`).
            (5) the stale comments: examples/l6.ts's exemption comment (:6916), DRIVER_FIELDS' `asked` comment
                (:12628), examples/workers/shard.ts:5.
Depends on: W181 (done, `adb453e`)
Blocks:     nothing — P35's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24 and deno. Every expected value hand-written from the spec and the
            fixture, never from a run's output: each id from spec/task-id.md section 1; each sequence from RN-R4,
            RN-R37 and JP-R5 and the flow's own shape; each outcome from section 3's precedence; each kept input and
            each worker's result computed BY HAND from the payload and the data: worker's source beside it. NEVER a
            fan-out completion order and NEVER task.running order on threads: clause (4)'s order is ARRANGED, both
            ways, and read back. Each claim shown able to fail by a ONE-clause provocation (sentence E) — of src/
            under test and of the block's own arrangement — in the byte copy C:/tmp-w182/m (find -type l empty; every
            file restored and its digest compared; restore on abort; control clean; a timeout NO VERDICT; a probe
            substituting the expected literal invalid); every survivor argued.
Gate:       `npm run gate` before the readers (P35 sentence C), plus test:l6 and test:l6:deno repeated (>= 5 each) on
            the tree held still; then the conformity and adequacy readers, NOT run by this item's author; then `npm run
            gate:full` ONCE on the final tree — the plan's LAST item (workflow v0.29).
Reserves:   Q675-Q677 (P35's per-item line); no ADR (an exit artifact decides nothing; ADR 0110-0111 the plan's,
            expected unused)
```

## Scope

**In** — Outputs (1)-(5).

**Out** — named rather than left implicit, with where it goes instead

- **An ask in a `map`, a refused answer under `validateBoundaries: false`, an answer mid-step, a stored answer fed across
  a second stop, a forged kept input refused `diverged`** — held at L2 by W180's and W181's suites
  (`test/driver/ask.test.ts`, `test/driver/ask-control.test.ts`); the header names none of them.
- **Anything in `src/`, `spec/`, `AGENTS.md`, `test/`, `scripts/`** — out of the row; a defect or a now-false sentence
  there is a stop-and-ask, never an edit.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `npm run test:l6` and `npm run
test:l6:deno` repeated on the same tree; the author's ONE-clause provocations in the byte copy `C:/tmp-w182/m`, graded on
L6's `FAIL` lines naming `W182 exit`; then the readers; then `npm run gate:full` once. Routing coverage: `user_action`
(Q17) — not exercised: an ask parks with NO settlement (P35 decision 5), which is the plan's point, and W176's clause (3)
holds the settlement road; a branch routed away from its join (Q4) — not applicable; no matching decision edge (Q10) —
not exercised (clause (2)'s `false` answer takes the DEFAULT edge, which is what keeps `FD-V7` satisfied); a duplicate
task id (Q13) — clause (5)'s resume re-parks at the SAME id on a fresh scheduler, and A, which still holds the run,
refuses the resume; a nested fan-out (Q6) — not exercised.

## What the build measured

*Measured 2026-10-17 on `adb453e` plus this item's diff, node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline | `npm run test:l6` and `npm run test:l6:deno` on the real tree before any edit: **2711 assertions, 0 failed, 190 real runs**, EXIT 0 each |
| M2 | **B′ / D′ — the census sites this change moves** | `CROSS_ROW` 378 -> 410, `DECLARED_TOTAL` 2711 -> 2743, `DECLARED_RUNS` 190 -> 202, `CROSS_ROW_SUBJECTS` +32, `pairRunCount` +`askBlock`, the file header (P35 in the exit-artifact list, one table row); `examples/README.md`'s two `X10` copies (`check:docs` EXIT 0, *compared 2 copies … 2743 / 202*). **NOT moved**: `DRIVER_FIELDS` (no driver field — its `asked` COMMENT only), `RUN_FLOOR` (no snippet), `LATE_SUITES` (no suite), the row-label count (no label), `examples/flows/` and `examples/workers/` counts (nothing added) |
| M3 | **the L6 kind exemption EXPIRED LOUDLY** (W179's R9) | the block's first run in node, the exemption still in place: the kind clause read `[["ask"],["ask","phantom"],["ask","gate"],["ask"],["ask"]]` against `[[],["phantom"],["gate"],["ask"],["ask"]]` — RED naming `ask`, as W179 built it to. The exemption was then removed (Outputs (4)) |
| M4 | **the first run's one other red was the BLOCK's** | clause (4, answered last)'s *nothing handed* read the scheduler AFTER the answer (`publish` in it); the read moved before the answer (`handedAtHold`). No product defect. Every other claim green at the first run, in node |
| M5 | the probes the hand-ons named | `C:/tmp-w180/probe/probe.ts` (clauses (1)-(2)) and `C:/tmp-w181/probe/probe.ts` (clauses (5)-(7)) — their shapes reused: `addTask`/`cancel` wrapped on the runtime's scheduler instance, `draft -> ask -> publish`. W181's probe never showed its `cancel` wrap NON-empty, so clause (6) carries a CONTROL that does (R6) |
| M6 | **now-false statements**, `git grep` over the tree but `dev-dist/` and `node_modules/` for *W182*, *NOT_YET_AT_L6*, *exempt*, *no L6 row*, *2711*, *190 real runs* | rewritten in `Owns`: `examples/l6.ts`'s kind-clause comment (:6916 then) and `DRIVER_FIELDS`' `asked` comment (:12628 then), `examples/workers/shard.ts:5`, `examples/README.md`'s `l6.ts` row TAIL (*69 row labels and 176 runs* — stale since W176's record step, which moved the cell's head and not its end: [Q171](../questions/q171.md)'s class). **Left**: every other hit is dated history in `doc/plans/**` and `doc/work-items/**`; `spec/flow-definition.md:2527`'s *until P35's next item ran an ask* (history, W181 left it); `examples/l6.ts`'s `gateMemory` comment (*empty on every run here since no L6 row runs a gate* — false since W94, not this item's claim; a note for P35's retro) |

## How each exit clause is asserted — `examples/l6.ts`, `W182 exit (n)`, every claim in `CROSS_ROW_SUBJECTS`

Thirty-two claims over twelve runs — thirteen after the readers (clause (7)'s witness run). Observers: the LOG (`foldInputs()`), the FOLD, and the REAL scheduler three ways —
every id handed to its `addTask` (the instance's method wrapped before any run), its `tasks` map, and every id any
`task.*` event carried; its `cancel` wrapped the same way.

| clause | the claims | the CONTROL beside them |
|---|---|---|
| (1) parked, after a THREADED task | the ask's id on none of the three scheduler observers; the log `[dispatched draft, outcome draft done, asked approve]` and the element field for field `{ kind, taskId, input }`; the fold `awaiting_action`, not terminal, `done` pending, the node `{ nodeId, branchPath: '-', state: 'suspended', result: null, error: null, input }` with `input` EXACTLY `{ summary: 'w182a (drafted)' }` — the value `Draft` RETURNED, equal to the fold's own `draft` result | `draft` itself WAS handed, held and seen by all three observers, on a pool read back `threaded` |
| (2) refused, then routed — TWICE | per run: `{ approve: <bool> }` (a typo) THROWN as `BoundaryRefused` (`name`, `boundary: 'resolve'`, `nodeId`, `taskId`, findings `['$.approved required']`), 0 elements appended, the node `suspended`, the run `awaiting_action`, nothing handed; the conforming answer on the SAME driver `true`, the log's tail `[resolution done, pathEnded end <end>]`, `pathEnds` that end, the node `done` with the answer as result and the input kept; `done` `completed`, terminal, equal to the fold, nothing handed after `draft`, the ask never seen | the two runs are each other's: `approved: true` ends at `published` (the `when`), `approved: false` at `shelved` (the default) — any fixed selection fails one |
| (3) declined | *(since the readers, A2: `on: ['failed']` is the LAST edge, after the default)* `resolve(…, 'failed', { error })` `true`; the tail `[resolution failed, pathEnded end declined]`; the node `failed`, `result: null`, the decline's error, the input kept; `completed`, equal to the fold, nothing handed after `draft` | (2)'s two ends — neither taken here |
| (4) in a fan-out, holding the join — TWICE | per run: the start `[regionEntered, opened 0, opened 1, asked review, branch.suspended 0, dispatched score]` (`JP-R5`, `RN-R37`), the ask on no observer; **answered LAST**: with `score` settled and a macrotask on, `[outcome score, arrived 1]` and NO `joinSettled`, the region `suspended ['0']`, `settled {1: arrived}`, only `score` handed, `awaiting_action` — then the answer's own call appends `[resolution, resumed 0, arrived 0, joinSettled collect true, dispatched publish]` and hands `publish`; **answered FIRST** (`score`'s state read back `running` at the answer): the call appends `[resolution, resumed 0, arrived 0]` and nothing else, `settled {0: arrived}`, only `score` handed, `running` — then `[outcome score, arrived 1, joinSettled collect true, dispatched publish]`; per run `publish` received `{0: {ok: true}, 1: {scored: <runId>}}` (`JP-R12`), `completed`, equal to the fold | the two runs are each other's: a join that ignores the ask's branch fails LAST, one that fires at any answer fails FIRST |
| (5) stopped on A, resumed on a FRESH B | on A: `stop()` resolved, `done` `interrupted`, terminal, the log `[…, asked approve, interrupted]`, NO cancel sent, the node `suspended`, equal to the fold; on B when `resume()` returns: NOTHING handed, the task map EMPTY, `resumes` `[[]]`, the log's one new element `resumed`; the `asked` element at index 2, `{ kind, taskId: 'w182s:approve:-:0', input: { summary: 'w182s (drafted)' } }`, EQUAL to A's; the fold `awaiting_action` with the same node entry; answered on B: `true`, B handed exactly `[publish]`, `publish` received `{ approved: true }`, `completed`, equal to the fold, B never seeing the ask — and, since the readers (A3), B's event observer seeing `publish`, so it is live on B | on A the same answer `false`, nothing appended or handed, and A's own resume refused `RunIdInUse` — why B is fresh (R5) |
| (6) cancelled while parked | NO cancel sent, nothing handed after `draft`; `cancel()` resolved, `done` `cancelled`, terminal, the log ending `[asked approve, cancelRequested]`, the node still `suspended`, `cancelRequest` the caller's actor and reason, equal to the fold; the answer then refused, nothing appended | the same flow cancelled while `draft` RUNS (held by its payload's `holdMs`): its cancel IS sent through the same wrap, `done` `cancelled`, the log `[dispatched draft, cancelRequested, outcome draft cancelled]` (R6) |
| (7) answered while paused | the answer `true`; the log's tail `[paused, resolution done, dispatched publish]`; *since the readers (A1)*, once a WITNESS run on the same runtime — its `draft` slow by `ASK_SLOW_MS` on its own timer — has parked, its elapsed time read back (before them: two macrotasks later) `publish` NOT handed and not in the task map, `done` pending, the run `running` and `paused`, `publish`'s node `running`; unpaused: `publish` handed at once, `unpaused` the next element with the scheduler holding `draft` alone ON it, `completed`, no longer paused, `publish` received `{ approved: true }`, equal to the fold | the same answer on a run NOT paused hands `publish` on inside the answer's own call (R7) |

**And the every-kind clause** (Outputs (4)): `L6 runs a flow containing every node kind the spec corpus expresses`,
one assertion as before, now over EXPECTED's flows AND the flows the block STARTED, its constructed inputs
`[[], ['phantom'], ['gate'], ['ask']]` — the fourth now *`ask` taken back out of L6 must be named*.

## Readings the plan did not settle — taken here, for the readers

| | the reading | why |
|---|---|---|
| R1 | **Clause (2) runs TWICE** — `approved: true` to `published` by the `when`, `approved: false` to `shelved` by the default edge; *routes by a `when` over the answer* is read as *the `when` over the answer decides*, which it does in both | rule 8 (a) SELECTS: one run leaves a fixed selection undetected |
| R2 | **Clause (1)'s *the scheduler never sees its id* is THREE observers** — `addTask` (the harness's wrap: an instrument inside what it measures), the `tasks` map and every `task.*` event's id — each shown able to see a task by the control on `draft` | rule 8 (c): the wrap alone could be vacuous (A11 kills only the control) |
| R3 | **"Reached after a task on real workers" is a THREADED pool**, read back, whose worker returns a value no payload carries — so *the value that reached it (the predecessor's result)* is the worker's, not the payload passed through | A2 (the worker returning its payload) kills (1)'s log and fold claims |
| R4 | **Clause (4) runs TWICE**, answered after `score` arrived and while it still ran, and the second's arrangement is READ BACK (`score`'s scheduler state `running` at the answer); the ask is the branch ENTRY — *inside a fan-out branch* read as *in a branch*, the entry being the shape W179's G1 made load-bearing (`JP-R5`); an ask deeper in a branch is L2's (`test/driver/ask.test.ts`) | *holds the join until answered* is an order claim (W176's lesson: arranged both ways) |
| R5 | **Clause (5) carries two controls the header does not name**: the answer refused on A (P34 decision 9, `RN-R38` (2)) and A refusing the resume `RunIdInUse` (`RN-R25`) | a `true` on B beside no `false` on A could be a `resolve()` that never refuses; *FRESH* is shown necessary |
| R6 | **Clause (6) carries a CONTROL the header does not name** — a cancel while `draft` runs IS sent — and one claim it does not: the answer refused after the cancel (`RN-R38` (1)) | W181's probe's `cancel` wrap was never shown non-empty; *nothing sent* beside a wrap that cannot see a send is vacuous (A12 kills only the control) |
| R7 | **Clause (7)'s *held* is read three ways** — not handed, not in the task map, `done` pending — **and ON the `unpaused` element** (W176's M11), beside a CONTROL: an unpaused answer hands `publish` on inside its own call | *held until unpause* needs the moment it would otherwise be handed |
| R8 | **The every-kind clause became a FUNCTION called after the block**, reading the flows the block records as it STARTS each — the block is not a row, and at the clause's own line it has not run. Its constructed fifth input went with the exemption's third disjunct | W179's R9: the exemption expires at this row; W94's precedent for the re-cut |
| R9 | **A clause that throws fails its OWN claims** (`askClause`, W176's `rcClause`), and every latch throws a NAMED error at 15 s — a clause whose arrangement never happened is a crash reported by name, not a pass | W176 R10 |

## Departures

None from the header's seven clauses. R4's reading (the branch ENTRY) and R1's (the `false` run by the default edge)
are the two a reader may weigh.

## The author's provocations (before the readers)

`C:/tmp-w182/mutate.mjs` with `probes.mjs`, in two byte copies `C:/tmp-w182/m1` and `m2` (`tar` of the working tree less
`.git` and `dev-dist`, `node_modules` copied, never linked — `find -type l` zero in both). Before each first touch the
copy's file is asserted byte-equal to the real tree's; each anchor asserted to occur ONCE and the edit to change the
file; every file restored from its FIRST snapshot and its SHA-256 compared after each probe, and on exit, SIGINT,
SIGTERM and an uncaught throw; node 24 asserted; a 900 s time-out graded NO VERDICT (none occurred). Graded on L6's
`FAIL` blocks naming `W182 exit` (or the every-kind clause): KILLED when one names a claim the probe was written to
fail, WRONG-REASON when only others do. **Node only** — the probes were not re-run under deno. **CONTROL clean three
times** (44 s, 44 s, 40 s). **The grader controlled**: G1 (a syntax error) graded CRASH and G2 (D11 graded against a
claim it does not break) WRONG-REASON, as declared. After the set, every touched file in both copies `cmp`-equal to the
real tree.

**45 probes over the final claims: 42 one-clause probes and 1 COMPOUND graded, 2 grader controls. 41 one-clause KILLED,
1 SURVIVED (argued below); the COMPOUND (D13) KILLED.** Every one of the 32 claims is named by at least one one-clause
kill (`C:/tmp-w182/coverage.mjs`).

| id | the clause broken | verdict, the claim that failed |
|---|---|---|
| D1 | the park keeps `{}` rather than what reached the ask | KILLED — (1) the log, the fold; (2), (3), (5) |
| D2 | a branch-entry ask emits no `branch.suspended` | KILLED — (4) the park, both runs |
| D3 | the `ask` arm DISPATCHES (as a task) | KILLED — every clause: the `asked` latch never fires and each clause reports *the ask parking never happened* by name — a crash of the arrangement, not the claim's own reason; **D3b** is the one-clause probe for that |
| D3b | the park ALSO hands the ask to the scheduler (one added hand-off) | KILLED — (1) *the scheduler never saw its id*, for its reason |
| D4 | an ask counts as IN FLIGHT | KILLED — (5) a cancel sent on A, B's resume re-dispatching it; (6) |
| D5 | the three `ended` refusals ignore an unanswered ask (fact 5 (iv)) | KILLED — (5), (6), (7): `RunControlRefused (ended)` |
| D6 | the answer schema not held | KILLED — (2) THROWN, both runs |
| D7 | the schema held to the call's value object, not the answer | KILLED — (2) |
| D8 | a `done` answer's result not recorded | KILLED — (2) routed, (4) `publish`'s collection, (5), (7) |
| D9 | a decline's error not recorded | KILLED — (3) the node |
| D10 | an answer in a region emits no `branch.resumed` | KILLED — (4) both runs |
| D11 | a pause holds no dispatch | KILLED — (7) PAUSED |
| D12 | the unpause hands nothing on | KILLED — (7) UNPAUSED |
| D13 (COMPOUND, one statement moved) | the unpause hands on BEFORE its element | KILLED — (7) UNPAUSED (the scheduler holding `publish` ON `unpaused`) |
| D14 | an answer refused while paused | KILLED — (7) PAUSED |
| D17 | a runtime keeps no run id in use | KILLED — (5) A refuses the resume |
| D18 | a fan-out opens only its first branch before entering | KILLED — (4) the park, both runs |
| D19 | a cancelled run still takes an answer | KILLED — (6) the answer refused from the cancel on |
| E1 | an ask's effective outcome always `done` | KILLED — (3) routed `on: ['failed']` |
| E2 | an ask's effective result not the answer | KILLED — (2, true) routed; (4) the collection; (5) answered THERE; (7) |
| E3 | `RS-R1` not widened (an asked id not suspended) | KILLED — (2)-(7) |
| F1 | the `asked` arm folds the node `running` | KILLED — (1) the fold |
| F2 | the `asked` arm keeps no input | KILLED — (1) the fold, (2), (3), (5) |
| F3 | `RN-R30` waits on a SUSPENDED node | KILLED — (6) `done` settled cancelled |
| F4 | the resolution arm drops the kept input | KILLED — (2) routed, (3) the node |
| F5 | `RN-R7` removed | KILLED — (1) the fold and onward |
| P1 | `live-token` counts a suspended branch as no longer live | KILLED — (4) both runs |
| A1 | `draft` on an INLINE pool | KILLED — (1) CONTROL (`threaded`) |
| A2 | `draft` returns its payload | KILLED — (1) the log, the fold (the kept input's provenance) |
| A3 | the "refused" answer conforms | KILLED — (2) THROWN |
| A4 | `approve` declares no `answerSchema` | KILLED — (2) THROWN |
| A5 | answered "last" without waiting for `score` | KILLED — (4, last) |
| **A6** | answered "first" with `score` NOT slowed (`delayMs: 0`) | **SURVIVED — COINCIDENT**: the answer is given on the `started` message, and on this machine a threaded worker's settlement reaches the scheduler in a LATER message than its `emit`, so `score` reads `running` at the answer even unslowed. The arrangement is a margin, not the mechanism; the READ-BACK is what holds the order, and **A6b** confirms it can fail |
| A6b | answered "first" only once `score` has SETTLED | KILLED — (4, first) *answered while `score` still RAN* (the read-back `running`) |
| A7 | resumed on A, not on a fresh B | KILLED — (5) |
| A8 | (6)'s control: `draft` not held | KILLED — (6) CONTROL (the latch on `started` throws by name) |
| A9 | (7) not paused | KILLED — (7) PAUSED |
| A10 | (7)'s control paused | KILLED — (7) CONTROL |
| A11 | the harness records nothing handed | KILLED — (1) CONTROL (and every claim reading `handed`) — *the claim (1) alone stays green: R2* |
| A12 | the harness records no cancel | KILLED — (6) CONTROL only — *R6* |
| A13 | the harness records no event id | KILLED — (1) CONTROL |
| A14 | (6) cancelled before the park, while `draft` runs | KILLED — (6) nothing sent, `done` |
| K1 | the every-kind clause given none of the block's flows | KILLED — *L6 runs a flow containing every node kind …* naming `ask` |
| G1 | GRADER: a syntax error | CRASH, as declared |
| G2 | GRADER: D11 graded against (1)'s log claim | WRONG-REASON, as declared |

## Gate before the readers — RAN

| clause | verdict | notes |
|---|---|---|
| `npm run gate`, the real tree held still (SHA-256 of the four changed and new files equal before and after) | **RAN, `GATE EXIT=0`** | `lint` 158 files; `check:spec` 7 documents / 81 examples / 147 rules; `check:docs` `X10` *compared 2 copies … 2743 / 202*; L1-L5 **74 files / 1958 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 1958); L6 **2743 assertions, 0 failed, 202 real runs** in node and in deno |
| `npm run test:l6` and `npm run test:l6:deno`, repeated on the same tree | **RAN — 5/5 and 5/5 EXIT 0**, each `2743 assertions, 0 failed` | with the gate's own two runs, 6/6 in each runtime; digests equal after. W174's deno flake did not recur |
| conformity and adequacy readers | **NOT RUN** — owed, not by this item's author | |
| `npm run gate:full` | **NOT RUN** — owed ONCE, on the final tree, after the readers | firefox and webkit NOT RUN |

**P35 prediction 5 — *W182 moves `X10` by its block alone, and no existing L6 row*: HOLDS.** `X10` moved 2711 / 190 ->
2743 / 202, exactly the block's 32 cross-row claims and 12 runs; the derived per-row total (`rowCosts`) is unchanged and
no `EXPECTED` row, pair row or other block moved. One existing cross-row assertion changed FORM and not count: the
every-kind clause, moved below the block, its exemption removed and its constructed inputs re-cut (Outputs (4)).

*This file's sections below its declaration were written before the gate and this one after it; nothing else moved.*

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | the table above: L6 **2743 / 202**, 0 failed, in node and deno; `test:l6` and `test:l6:deno` 5/5 each besides |
| conformity reader | **RAN** — the seven clauses CONFORM, no BLOCKER | three NITs — C1 the `(2, approved false)` label said *routes by the `when`* where it routes by the default edge; C2 a comment cited *W182's Record* for the first-run red that is M3; C3 `examples/README.md`'s run-history tail skipped 187 (W176's readers) — and C4, not this item's (the `gateMemory` comment, false since W94: P35's retro) — all three acted on |
| adequacy reader | **RAN** — no BLOCKER | A1 SHOULD — clause (7)'s *held until unpause* observed for ~50 ms only: its R1 (the pause's held dispatch leaking to the scheduler on a 150 ms timer) SURVIVED the block in node and deno, killed only by W176's clause (4); A2 NIT — clause (3)'s `on: ['failed']` edge was FIRST, so its R5 (an edge with no `on` eligible for `failed`, `src/driver/routing.ts`'s `onOf`) survived; A3 NIT — clause (5)'s event observer never shown live on B; A4 note — `e3`'s comparison to A's element would be `undefined === undefined` if both were absent — all four acted on |
| **the readers' overlap** | **ZERO shared findings** | the conformity reader's findings are wording and census (C1-C3); the adequacy reader's the discrimination of clauses (3), (5) and (7) (A1-A4). No subject in common (`doc/workflow.md` section 6) |
| L6 after the readers' items, the real tree held still | **RAN — `test:l6` and `test:l6:deno` EXIT 0**, each **2743 assertions, 0 failed, 203 real runs** | |
| author's provocations, re-run on the tightened claims | **RAN** | the table below — CONTROL clean twice more, every file restored, digest equal |
| **`npm run gate:full`, the confirming run** | **RAN, `GATE:FULL EXIT=0`** | ONE command on the final tree, held still (SHA-256 of the four changed and new files equal before and after; `C:/tmp-w182/gatefull.log`), after the readers' items and the record step (this Record written before it, but for this row and the Status line): the ladder — `lint` 158 files, `check:spec` 7 / 81 / 147 rules, `check:docs` `X10` 2743 / 203, L1-L5 **74 files / 1958 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 1958), L6 **2743 assertions, 0 failed, 203 real runs** in node and deno — then EVERY self-test, `check:register:selftest` included: **11/11 completed, 11 ok**, 2217.9 s wall (2390 s for the command). firefox and webkit NOT RUN |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| A1 | *held until unpause* observed for ~50 ms | **fixed** — clause (7) reads its hold once a WITNESS run on the same runtime has PARKED: its `draft` holds `ASK_SLOW_MS` (1500 ms) on its own timer, so the read follows an EVENT that arrives after a deliberately slow task, and its elapsed time (`>= ASK_SLOW_MS`) is read back inside the claim; +1 run, no claim added. The reader's R1 (150 ms) now KILLED by the W182 block itself in node AND deno; 30 ms and 1000 ms leaks KILLED as well |
| A2 | `on: ['failed']` listed first | **fixed** — `ASK_ENDS_FLOW`'s edges are now the `when`, the default, then `on: ['failed']` LAST; R5 now KILLED by *(3) a `failed` answer … routes the ask's on: [`failed`] edge* in node and deno |
| A3 | B's event observer never shown live | **fixed** — `e5` carries `B.seen.has(publish)` `true` beside `B.seen.has(approve)` `false`; A15 (the observer recording nothing) KILLED by (5) *answered THERE* |
| A4 | `e3`'s equality vacuous if both absent | **fixed** — `aAsked !== undefined &&` before the comparison |
| C1 | the `false` run's label | **fixed** — *routes by the default edge, the `when` over the answer being false, to `shelved`*, in the check and in `CROSS_ROW_SUBJECTS` |
| C2 | the comment's citation | **fixed** — *(W182's item file, M3 in What the build measured)* |
| C3 | the README tail skipping 187 | **fixed** — *202 runs until W182's readers; 190 until W182; 187 until W176's readers; 176 until W176*; both `X10` copies 2743 / 203 with their histories |
| C4 | `gateMemory` comment | **not this item's** — left for P35's retro, as directed |

**The author's provocations after the readers** — the same harness, the two copies re-synced from the real tree (`cmp`
clean per touched file, `find -type l` zero), node; and R1 and R5 also graded under DENO (`C:/tmp-w182/deno-r1.mjs`,
restored and digest-compared). **15 probes, CONTROL clean twice: every one KILLED.**

| id | the clause broken | verdict |
|---|---|---|
| R1 | the adequacy reader's — a pause's held dispatch leaks to the scheduler 150 ms later | **KILLED** — (7) PAUSED, UNPAUSED; node and deno |
| R1b, R1c | the same leak at 30 ms and at 1000 ms | KILLED — (7) PAUSED |
| R5 | the adequacy reader's — an edge with no `on` eligible for `failed` | **KILLED** — (3) a `failed` answer routes `on: ['failed']`; node and deno |
| A15 | the event observer records nothing | KILLED — (5) *answered THERE* (the new control on B) and (1) CONTROL |
| A16 | (7) without its witness run | KILLED — (7) PAUSED (the elapsed read-back) |
| D9, D11, D12, D14, E1, F4, A9, A10, A13 | the earlier probes over the claims the fixes touched | KILLED, each, as before |

**Totals over both rounds: 48 distinct one-clause probes — 47 KILLED, 1 SURVIVED (A6, COINCIDENT, argued above; A6b kills its
read-back)**, 1 COMPOUND (D13) KILLED, 2 grader controls graded as declared; the readers' R1 and R5 KILLED in both runtimes.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W182 exit` block, seven clauses | yes | the `CROSS_ROW_SUBJECTS` both-ways clause (32 subjects), `CROSS_ROW` 410, `DECLARED_TOTAL` 2743, `DECLARED_RUNS` 203 |
| (2) the claims | yes — 32 over 13 runs | each named by a one-clause kill (`C:/tmp-w182/coverage.mjs`) |
| (3) the census | yes | `check:docs` `X10` (the two README copies, 2743 / 203); L6's own count guards |
| (4) the kind exemption removed, the clause reading the block's flows | yes | K1 — the clause given none of the block's flows names `ask` |
| (5) the stale comments | yes | nothing executes them; the `git grep` of M6 |

**Owns, checked by hand** (`git status --porcelain`): `examples/l6.ts`, `examples/README.md`, `examples/workers/shard.ts` —
in the row; this file — the record step. `examples/flows/**` NOT edited; no `doc/questions/**` or `doc/decisions/**` file
touched. No exception taken. Every changed file LF, no carriage return.

**What broke.** At the ladder, nothing in the product, in either round; at the first run, the block's own late read in
clause (4) (M4). At the readers, the block's ADEQUACY in three places: a hold observed for less time than a plausible leak
(A1 — a short sleep where an event was needed), an edge order that let *the first eligible edge* stand in for *routed by
its `on`* (A2), and an observer never shown live on the runtime it read (A3).

**What this taught.**
- **"Held" needs a horizon told by an EVENT** (A1): two macrotasks prove that nothing was handed on *so far*, which is a
  claim about the sleep. W176's *a timeout is NO VERDICT* has a sibling — *a short wait is no hold*.
- **An edge order is part of the arrangement** (A2): a claim that a decline takes its `on: ['failed']` edge needs the
  wrong candidates listed BEFORE it, rule 8 (a)'s *where it SELECTS, every wrong selection differs* applied to edge order.
- **An observer is shown live on every runtime it reads** (A3), not once per block — W181's never-non-empty `cancel` wrap
  was the same class one item earlier.

**Questions raised.** None — Q675-Q677 unused, skipped. **Closed.** None.

**For P35's Record and retro** — not edited here: `examples/l6.ts`'s `gateMemory` comment (*empty on every run here since
no L6 row runs a gate*), false since W94 (C4); the probes before the readers ran in node only (R1 and R5 graded in deno
too); A6 is a COINCIDENT survivor on this machine; the README's `l6.ts` row tail was stale from W176's record step (fixed
here).
