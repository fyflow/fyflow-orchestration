# W180 — asking and answering in a run

**Status:** done 2026-10-17 — `npm run gate:item` on the final tree, one command (the Record); both readers RAN, their in-`Owns` findings FIXED; S-1..S-5 answered *"As recommended"* and applied (E2-E5, S-4 a ratified design change); no question raised; not committed. Earlier: FIXES-DONE after the readers' round 1; READY-FOR-READERS 2026-10-17: built, the author's 41 one-clause probes all KILLED, `npm run gate` EXIT 0 in the byte copy with S-1 and S-2's patches and RED on the real tree at exactly those two out-of-`Owns` cases; five stop-and-asks open (S-1..S-5), none edited; the readers, `gate:item` and the Record follow — declared 2026-10-17 on `b71fc8e` (W179 committed); P35's THIRD item: stop-and-asks (b)-(f) and (i) as answered, decisions 5, 8 and 9; ADR 0109; not committed
**Plan:** [P35](../plans/p35-may-a-node-wait-for-a-person-by-design.md) — *may a flow declare a node that waits for a
person, keeps what reached it, and holds the person's answer to a schema?* — its third item. A run REACHES an ask: it
parks with nothing handed to the scheduler, keeps what reached it, and takes the person's answer at `resolve()`, held to
the ask's `answerSchema`; the answer is the node's result and routes as a task's settlement does.

```
Spec:       spec/run-state.md v0.21 -> v0.22: section 16 and TWO rules — RN-R36 (the fold's `asked` arm and
            NodeRun.input) and RN-R37 (what the driver does when a branch reaches an ask, and when it is answered);
            RN-R4's *never dispatched* widened to an ask; section 2's shape gains `input`.
            spec/outcome-record.md v0.17 -> v0.18: RS-R1 widened (an `asked` element and no record after it is
            suspended); section 7's effective outcome of an ASK (OR-R8's derivation: the resolution's state, result and
            error, attempts 0, the timing fields null, schedulerTimestamp null); `schedulerTimestamp: number | null`
            (BREAKING); section 4's OR-R11 census sentence moved with the new valid flows (S-2).
            spec/flow-definition.md v0.42 -> v0.43: FD-R4's resolve boundary reads an ask's `answerSchema`; the ask
            subsection's *until it lands a Driver refuses* sentence made true. spec/join-policy.md v0.22 -> v0.23:
            JP-R5's ordering clause is LOAD-BEARING (W179's G1). spec/README.md: the four rows. After the maintainer's
            answer to S-3: spec/task-id.md v0.13 -> v0.14 (E4), ID-R1/ID-R4 for an ask's id settled, and its row.
Owns:       from P35's W180 row, exactly: src/driver/driver.ts, src/driver/log.ts, src/driver/routing.ts,
            src/fold/run-state.ts, src/scheduler/runtime.ts (if its readers move), spec/run-state.md,
            spec/outcome-record.md, spec/flow-definition.md (FD-R4), spec/join-policy.md, spec/README.md,
            test/driver/**, test/fold/**, test/matrix/**, test/scheduler/**, test/definition/l4-corpus.test.ts,
            examples/l6.ts (DRIVER_FIELDS, if moved), examples/run-flow.ts (NOT_RUN_STATE, if moved), AGENTS.md (the
            WHOLE file, D′), scripts/check-docs.mjs, doc/concept.md (section 7), doc/decisions/0109-*.
            Exceptions: E1 — spec/examples/valid/** (the task-bearing and region-bearing ask flows), granted by the
            maintainer's ruling on W179's S-2 (*"W180 adds the task-bearing and region-bearing ask flows"*).
            E2 — test/definition/ask.test.ts (W179's L2 refusal case, its designed expiry, rewritten to assert the park;
            its unused import), S-1. E3 — test/definition/wiring.test.ts (the L4 arc total 70 -> 74 and its comment),
            S-2. E4 — spec/task-id.md (v0.14: ID-R1/ID-R4 for an ask's id, section 1's ask paragraph), S-3, with its
            spec/README.md row (in the row). E5 — src/fold/policies.ts (arrivalCount's docblock sentence only), S-5.
            E2-E5 each a YES of the maintainer, 2026-10-17 (*"As recommended"*), given BEFORE its edit. S-4 is not an
            exception (src/driver/driver.ts is in the row) but a DESIGN CHANGE the maintainer RATIFIED: every mid-step
            resolution is taken at rest. src/definition/** untouched.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q667-Q670 only if raised; a note on
            q118.md's deferral), doc/decisions/** (ADR 0109 and its index line), the plan's Record, README.md, this file.
            Overlap with W179 (serial, P35's rows): src/driver/driver.ts, spec/README.md, AGENTS.md,
            scripts/check-docs.mjs, test/definition/l4-corpus.test.ts.
Inputs:     P35 stop-and-asks (b)-(f) and (i) as answered, (g) and (h) where (b) forces them, decisions 5, 8 and 9, facts
            2-7, 12 and 13, prediction 3, sentences B′, C, D′, E and the two brief sentences; W179's Notes for W180 (G1,
            S-1, S-2, FD-R4's answerSchema, ID-R1/ID-R4, the isSuspended and schedulerTimestamp readers, the expiring L2
            case); ADR 0108; ADR 0004, ADR 0007, ADR 0046, ADR 0060; OR-R3.
Outputs:    (1) src: `FoldInput` gains `{ kind: 'asked', taskId, input }` (BREAKING for an exhaustive switch); the fold's
                arm — node `suspended`, `NodeRun.input` (optional, additive) kept through the answer; the driver's
                `ask` arm PARKS — nothing handed to the scheduler, the composed input deep-copied onto the element,
                `branch.suspended` in a region; RS-R1's suspended widened at every reader; `resolve()` holds a `done`
                answer to `answerSchema` (FD-R4); the effective outcome of an ask derived (OR-R8); `eligibleEdges`
                admits an ask; `schedulerTimestamp: number | null` (BREAKING); `freezeInput`'s asked arm (RN-R17).
            (2) spec run-state v0.22, outcome-record v0.18, flow-definition v0.43, join-policy v0.23, spec/README.md;
                spec/examples/valid/: a task-bearing and a region-bearing ask flow (E1).
            (3) tests: test/driver/ask.test.ts (L2), test/fold/asked.test.ts (L1/L3), the L5 row in test/matrix/**,
                RUN_FOR's `asked` run, and the census sites the change moves.
            (4) AGENTS.md (whole, D′); doc/concept.md section 7's resolve exception (one clause); ADR 0109.
Depends on: W179 (done, `b71fc8e`)
Blocks:     W181
Tests:      expected values hand-written from the spec's rows, never from output. L1 — the `asked` arm: node
            `suspended`, run `awaiting_action`, `NodeRun.input` the composed value; an answered ask indistinguishable
            in `nodes` from a resolved task but for `input`; prefixes (RN-R2). L2 — over a scheduler double that
            records `addTask`: entry ask, ask after a task, ask in a fan-out branch (holding its join), ask in a map
            branch, ask before a join; nothing handed for an ask; answered then routed by `when`; a decline routed
            `on: ['failed']`; a refused answer appending nothing, corrected on the same driver; validateBoundaries:false;
            an answer from inside onFoldInput; a second resolve refused; JP-R5's ordering with a branch-entry ask (fails
            under an interleaved emission); replay/resume re-creating `asked` with the same and a different input; a
            consumer callback throwing on `asked` on a driver-call step vs a scheduler-event step (W178's boundary).
            L3 — folded twice. L5 — an ask in a fan-out holds its join. One-clause mutations (sentence E) in the byte
            copy C:/tmp-w180/m. A real-scheduler probe through createRuntime in scratch, node 24 and deno.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 the `asked` arm — node `suspended`,
            run `awaiting_action`, `NodeRun.input` the composed value — and an answered ask indistinguishable in
            `nodes` from a resolved task but for `input`; L2 an ask parks with nothing handed to the scheduler, a
            refused answer appends nothing and the corrected one routes by `when` over the answer, a decline routes
            `on: ['failed']`, an ask in a fan-out holds its join (L5's row); L3 folded twice; `RUN_FOR`'s `asked` run;
            B′'s `check:budget:selftest`.
Reserves:   Q667-Q670 (P35's per-item line); ADR 0109
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **An ask under cancel, stop, pause and resume** beyond what (b) forces — W181 ((g), fact 5). *What (b) forces*: the
  replay REGENERATES `asked` (it is not fed), and a stored resolution of an ask is fed through the widened `RS-R1`.
- **The L6 row** — W182; the L6 kind clause keeps its `ask` exemption until then.
- **`spec/task-id.md`** (an ask's id under `ID-R1`/`ID-R4`) — W179's file, not in this row; what the code does is stated
  in ADR 0109 and the readings.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w180/m`, each graded on the named suites' lines; then the readers; then `npm run gate:item` once.
Routing coverage: a branch routed away from its join (Q4) — an ask's decline routing to an `end` inside a region (L2);
`user_action` (Q17) — the ask's park is the same node state, a parked task beside it (L1); no matching decision edge
(Q10) — an unmatched `done` answer is FD-V7's, unreachable as on a task; a duplicate task id (Q13) — an ask's id is
minted once per path, `DuplicateTaskId` as a forward guard; a nested fan-out (Q6) — an ask in a map's branch.

## What the declaration step measured

*Measured 2026-10-17 on the real tree (M1-M8) and in the byte copy `C:/tmp-w180/m` (`git archive HEAD` with this item's
changed and new files copied over, `cmp` clean per file, `node_modules` copied, never linked; `find -type l` zero; S-1
and S-2's patches applied there only), node 24.20.0, deno 2.9.6. M1 is the starting tree (`b71fc8e`, W179 committed).*

| # | fact | measured |
|---|---|---|
| M1 | the baseline | `node test/runner.ts` EXIT 0: 70 files / 1898 cases (W179's `gate:item` figures: `check:spec` 7 / 79 / 144, `check:docs` 41 `run` snippets, L6 2711) |
| M2 | **the `src/` change ALONE** (log, routing, run-state, driver; no test touched) | L0: ONE error, in `typecheck:tests` alone — `RUN_FOR` (`test/driver/checkpoint.test.ts:148`) lacks `asked` (P35 fact 4's forced edit). L1-L5: **2 cases red** — W179's expiring L2 case in `test/definition/ask.test.ts` (its designed expiry, S-1) and the `DRIVER_FIELDS` ratchet in `test/driver/retention.test.ts` naming the new field `asked` (reading R3). `schedulerTimestamp: number \| null` broke NOTHING in any of the five typecheck lanes: no reader does arithmetic on it (the four `src/` sites are one writer, `listener.ts:123`, the type, and two comments; `AGENTS.md`'s two are record literals) |
| M3 | **the corpus flows added** (E1: `ask-after-a-task`, `ask-in-a-fanout`) | four more red, each a census reading the corpus: section 7's table (`l4-corpus`, in `Owns`, E1's rows), `test/driver/needs.test.ts`'s region census and its *FIVE fanout-only* literal (in `Owns`), `test/driver/checkpoint.test.ts`'s RN-R17 kind count 14 (in `Owns`, from `RUN_FOR`), and **`test/definition/wiring.test.ts`'s L4 arc total 70 -> 74 — OUT of `Owns`** (S-2). `test/fold/result-value.test.ts`'s OR-R11 census did not go red: it derives from the sentence, which moved with the flows (19 of 213 -> 20 of 219, 199, 91%, hand-derived: six task nodes, `summarise` named by `revise`) |
| M4 | **P35 prediction 3**, by `C:/tmp-w180/pred3.ts`: every corpus flow WITHOUT an ask (`spec/examples/valid/` and `examples/flows/`) driven on `b71fc8e` and on this tree under two policies and three stimulus modes (all `done`; the first task `user_action` then resolved — RS-R1's widened road; the first task `failed`), a fixed clock; digest of every `onFoldInput` element with its position, `foldInputs()` and `snapshot()` | **324 runs, 324 identical** — 294 driven, 30 refused at construction identically on both trees (five L6 flows naming a registry's code types or `jsonata`, which this probe does not load); 2626 elements compared |
| M5 | **B′ / D′ — census sites**, each by its lane | `RUN_FOR` +`asked` (L0); RN-R17's kind count 14 -> 15; `DRIVER_FIELDS` +`asked` in `test/driver/retention.test.ts` AND `examples/l6.ts` (reading R3); `NOT_RUN_STATE` unmoved; `LATE_SUITES` +3; `RUN_FLOOR` 41 -> 42 (section 7's snippet); `check:spec` 7 / 79 / 144 -> 7 / 81 / 146 (two valid flows; `RN-R36`, `RN-R37`); L1-L5 70 / 1898 -> 73 / 1931 (19 + 9 + 3 cases in three suites, and the two corpus flows' per-file cases); the region census +1 row, fanout-only 5 -> 6; OR-R11 19/213 -> 20/219; the wiring L4 arc total 70 -> 74 (S-2); spec versions run-state v0.22, outcome-record v0.18, flow-definition v0.43, join-policy v0.23 and their four `spec/README.md` rows; `check:budget` concept headroom 799 -> 636 (+163 bytes: the clause with an ADR link — reading R12). **Unmoved**: `X10` (no L6 row, W182's), the L6 kind exemption |
| M6 | **the five `isSuspended` readers** (P35 fact 2) | all five now read `parked()` / `hasParked()`: the replay's fed resolution, `resolve()`, and the three `ended` refusals (departure D1). `effectiveOutcome`'s readers: `advance`, `outputs`, `effectiveOutcomeOf` — each takes the ask's derived record unchanged |
| M7 | **a real scheduler, through `createRuntime`** — `C:/tmp-w180/probe/probe.ts`, inline pools, task -> ask -> task | node 24.20.0 EXIT 0 and deno 2.9.6 EXIT 0, the same JSON: parked `awaiting_action` with ONLY `r1:draft:-:0` handed to the scheduler and in `scheduler.tasks` (the ask's id never); the kept input the draft's result; a `{ approved: 'yes' }` answer `BoundaryRefused(resolve, approve)`, 0 elements appended; `{ approved: true }` accepted, `publish` dispatched receiving the answer; `done` `completed`, `fold(inputs)` deep-equal to what `done` resolved with; kinds `dispatched outcome asked resolution dispatched outcome pathEnded` |
| M8 | **now-false statements**, `git grep` over the tree but `dev-dist/` and `node_modules/` (history under `doc/plans`, `doc/work-items`, `doc/questions` excluded) for *until W180*, *P35's next item*, *refuses a run where a branch*, *cannot use one yet*, the fold-input count | rewritten in `Owns`: `AGENTS.md` sections 3 (twice), 7, 9, 11 and 18; `spec/flow-definition.md` section 2's two sentences and section 7's `ask.flow.json` row (E1); the driver's `freezeInput` count (*five* -> *nine*, stale since W173); `BoundaryRefused`'s field docs; ADR 0108 rule 8 (a dated pointer, record step). **Outside `Owns`, NOT edited**: `test/definition/ask.test.ts` (S-1), `spec/task-id.md:125` (S-3), `src/fold/policies.ts`'s `arrivalCount` comment (S-5), `examples/l6.ts:6916` (W182's), `src/definition/types.ts:830` (*is W180's* — still true), `examples/workers/shard.ts:5` (W182's) |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **`asked` BEFORE `branch.suspended`**, the hold checked between them | a parked task's settlement precedes its `branch.suspended` (`settle`'s `user_action` arm); the park mirrors it, so the element a consumer's callback sees first is the fact, and the region event follows | `RN-R37` (4), `ask()`'s docblock |
| **R2** | **the kept input is the driver's own DEEP COPY, taken at the park** (`cloneValue(received)`) | at the ENTRY with no `needs` `received` is the caller's own `start()` object — `start` hands `enter` the payload it was called with (W172's reading) — so without the copy the kept input moves when the caller's object does; a mid-run value is already an exclusive edge-hop clone, so the copy is redundant there and kept for one rule over every road (`OR-R2`'s *including where it is redundant*). One clone per ask reached | `RN-R37` (3); L2 case 1's no-`needs` half |
| **R3** | **a new `Driver` field, `asked`** (a `Set` of ask task ids) rather than scanning the input sequence | `RS-R1`'s widened *suspended* is read at every `resolve()` and in the three `ended` refusals; a scan of `inputs` per call is O(n) at 1000s-10000s of asks (a map of asks), a set is O(1) and `dispatched`'s twin. **Ids only** — the kept input lives on the element in `inputs`, which `RN-R13`'s walk already covers — so `DRIVER_FIELDS` moves (both copies, the ratchet firing by name) and `NOT_RUN_STATE` does not | the field's comment, `retention.test.ts` |
| **R4** | **an answer given MID-STEP — from a callback on the driver's own step, the `asked` element's own included — is ACCEPTED at the call and TAKEN AT REST**: every refusal asked at the call (not suspended, halted, stopped, `FD-R4` THROWN, an uncloneable value), `resolve()` returns `true` (*accepted*, its resolution pending), and the resolution is appended when the step ends, in call order in the queue the pauses use (`pausePending`, now a `PendingCall` union); a second answer while one is pending returns `false`; a pending answer whose step HALTED or CANCELLED the run is DROPPED, as a pending pause is. **And since the maintainer's answer to S-4, EVERY mid-step resolution, a parked task's too** — the one deferral clause dropped | *round 2, the conformity reader's DEFECT R4*: the first cut appended the answer on the `asked` element's own stack and suppressed the park's `branch.suspended`; in a region that checkpoint was UNRESUMABLE — `ResumeRefused(diverged)` at index 6, the replay re-parking where the stored log had the resolution. P35's brief sentence (*an owner element a resume's replay feeds is TAKEN AT REST*) decides it; `RN-R33`'s and `RN-R35`'s take is the precedent (W174 R1, W175 R1) | `RN-R37`, ADR 0109 rule 5 and consequences, `resolve()` / `takeAnswer()`; L2 cases 11 and 12 |
| **R5** | **the effective outcome of an ask is derived from *a resolution and no settlement*** (`log.ts`), not by reading the `asked` element | `effectiveOutcome` sees the LOG, which section 1 fixes at two kinds; `RS-R1` admits a resolution with no settlement only for an asked task, so the two conditions are one. A forged log holding a bare resolution for a task would derive an ask's record — unreachable through the driver | `spec/outcome-record.md` section 7 |
| **R6** | **`isSuspended(log, taskId, asked = false)`** — the caller says whether the id was asked | the function cannot see fold inputs; the default keeps its four test callers and the parked-task road byte-identical | `log.ts` |
| **R7** | **`ID-R1` and `ID-R4` for an ask's id, in code only**: a second `asked` at one id is `DuplicateTaskId` (a forward guard no valid definition reaches — probe A2), and a SETTLEMENT carrying an ask's id is `ID-R4` tier 2's `UndispatchedTask`, unchanged code (an ask is never dispatched) | W179's R10 left both to W180; `spec/task-id.md` is not in W180's row, so its text is S-3 | ADR 0109, L2 case 15 |
| **R8** | **a decline's `result` is discarded and its `error` defaults to *resolved as failed*** | `resolve()`'s existing `failed` road; the decline is held to nothing (P35 (d)), so a value the `answerSchema` would refuse does not refuse it | L2 case 5 |
| **R9** | **`spec/flow-definition.md (FD-R4)` read as the file, its ask prose included** | the row scopes the file by its rule, and two sentences of section 2 (*until it lands a `Driver` refuses*; *what a run records … is P35's next item*) are made false by this item's own subject; section 7's rows are E1's | the v0.43 note |
| **R10** | **the matrix harness's `verdictOf` learns a parked ask** (`test/matrix/run.ts`, in `Owns`) | it read the verdict from DISPATCHED ids alone, so a run waiting only on an ask read `stuck` — a false verdict in exactly the cell the row is for | probe M1 |
| **R11** | **the L5 row is its own suite** (`test/matrix/ask.test.ts`, `run.ts`'s `runCell` and `driveScenario` unchanged) rather than a row of `SCENARIOS` | a `SCENARIOS` row moves `matrix.test.ts`'s hand-written whole-matrix cells and censuses, every column of every row; the ask's cells are written by hand in the new suite from section 3's definitions, four rows x three policies | the suite's docblock |
| **R12** | **`doc/concept.md`'s clause carries the ADR link** — +163 bytes, not the plan's ~80 | the exception's other clause cites Q28 by link; 636 bytes of headroom remain | `check:budget`, `check:budget:selftest` EXIT 0 |
| **R13** | **`sameData` compares STRUCTURED-CLONE data**: the class must agree; an array by length and element (a hole is not a missing tail); a `Map` and a `Set` by entries in order; a `Date` by time; a `RegExp` by source and flags; an `Error` by name and message; binary data by its bytes; a plain object as before (key order free, an `undefined` key absent) | *round 2, both readers*: by own keys alone every `Map` equalled every other and `[1, undefined]` equalled `[1]`, so `RN-R37`'s and ADR 0109 rule 2's *a different input is refused `diverged`* was false for exactly the `RICH()` input `RUN_FOR` uses. Taught rather than qualified: contained in one function, and no other regenerated kind moves (P35 prediction 3 re-run: 324 of 324 identical) | `sameData`, `RN-R37`, ADR 0109 rule 2; L2 case 13 |

## Departures from the plan, declared

| | departure | why |
|---|---|---|
| **D1** | **The three `ended` refusals count an unanswered ask as PARKED here, not in W181** (P35 fact 5 (iv), (g)) | the coordinator's brief: W180 makes them observable — a run waiting only on an ask was refused `ended` by `cancel`, `stop` and `pause` the moment asks could run — and the brief says not to leave them wrongly refusing. **W181's scope is touched**: its gate's *each beside today's red* now has no red on W180's tree; its prediction 4 (*W181 changes only the three `ended` refusals*) moves to *W181 changes none of them*. L2 case 14 holds the three, beside the finished control refused `ended` |
| **D2** | **A `Driver` field** (`asked`, R3) | the plan's D′ said *only if an item adds a `Driver` instance field — W180's B′ copy says*; it does |
| **D3** | **E1's corpus additions carry their section 7 rows and the `ask.flow.json` row's last sentence** in `spec/flow-definition.md` | `l4-corpus` compares the table to the directory both ways, so a flow is not addable without its row |
| **D4** | **`README.md`'s feature table gains the ask's row now** (a record-step file) | W179's note: *W180 or W182 adds the row when a run can use one* — a run can |
| **D5** | **ADR 0004 rule 4 and ADR 0108 rule 8 carry dated pointers to ADR 0109** (record step, pointers only) | `amends: ADR 0004 in part`; ADR 0108 rule 8's interim ended |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-17 (*"As recommended"*), each applied after its YES: S-1..S-3 and S-5 as exceptions E2-E5, S-4 (revised form) a ratified design change

| | the question | recommended | the alternative |
|---|---|---|---|
| **S-1** | **`test/definition/ask.test.ts`'s L2 case *the driver refuses a run where a branch ENTERS an ask, by name, until W180* is RED on this tree** — its DESIGNED expiry (ADR 0108 rule 8, W179's Notes), and the file is outside W180's row | **Widen W180's `Owns` by that one case** (its title in `DECLARED_CASES`, its body, the file's header line and one stale comment), rewritten to assert the PARK on the same four roads it asserted the refusal on — entry, after a task, branch 0 and branch 1 of a fan-out — beside the same task control: patch `C:/tmp-w180/s-patches/s1_ask_test.py`, applied in the byte copy, green there | **Delete the case** (W180's `test/driver/ask.test.ts` covers the four roads) — the W179 suite then loses its record that the interim existed; or leave it red for W181 |
| **S-2** | **`test/definition/wiring.test.ts`'s L4 arc total 70 is RED (74)**, moved by E1's two flows (W179's Notes named it: *`wiring.test.ts`'s L4 arc total*) — outside W180's row | **Widen W180's `Owns` by that literal and its comment**: approve -> publish, the `needs` arc into `revise`, ingest -> score through the fan-out, and the join's record into `publish`, each unchecked — patch `C:/tmp-w180/s-patches/s2_wiring_test.py`, green in the copy | **Shape the corpus flows to add no arc** (a task -> ask -> `end` flow and an entry fan-out) — W179's R8 trade again, which S-2's ruling asked to end |
| **S-3** | **`spec/task-id.md` (v0.13) says what an ask's id IS and leaves `ID-R1`/`ID-R4` *to P35's next item*** (`:122-125`); W180 settled both in code (R7), and the file is W179's, in no later row | **Widen W180's `Owns` by that paragraph** (v0.14, `spec/README.md`'s row with it): *`ID-R1` — an ask's id is minted once per path; a second `asked` at one id is `DuplicateTaskId`, a forward guard. `ID-R4` — a settlement carrying an ask's id is tier 2's `UndispatchedTask`: the driver dispatched nothing for it* | **Leave the paragraph** — it is not false, only open, and ADR 0109 and `RN-R37` carry the code's behaviour; raise nothing |
| **S-4** *(REVISED at round 2)* | **A pre-existing twin of R4, measured on `b71fc8e` and on this tree** (`C:/tmp-w180/twin.ts`): a PARKED TASK in a region resolved by a consumer's `onFoldInput` on its own `user_action` outcome emits `branch.resumed(0) branch.arrived(0) branch.suspended(0)` — a `branch.suspended` AFTER the branch's terminal event, the fold listing `suspended: ["0"]` beside `settled: {"0": "arrived"}` (`JP-R5`, `RN-R6`). `settle`'s `user_action` arm emits without asking whether the task is still parked | **Take EVERY mid-step resolution at rest, not only an ask's** — drop `&& kind === 'ask'` from `resolve()`'s deferral (one clause). Measured in the copy: it fixes BOTH halves — the stream (`branch.suspended(0)` before `resolution`, the fold `suspended: []`) AND the resume (`twin.ts`: `ResumeRefused diverged 6` -> `resume: OK`) — and moves **0 of 1934** L1-L5 cases (W175's two mid-step task resolutions in `test/driver/pause.test.ts` included; L6 not run). The round-1 recommendation — a one-clause `isSuspended` guard in `settle`'s arm — fixes the stream and NOT the resume (the conformity reader), so it is withdrawn in favour of this | **The round-1 guard alone** (stream fixed, resume still `diverged`); or **raise a question** (from Q667-Q670) and leave both |
| **S-5** | **`src/fold/policies.ts`'s `arrivalCount` docblock** says the ordering clause *remains unfalsifiable through a conformant driver — `FD-V25` makes a map's branch a `task` and entering a task dispatches without emitting* — false since an ask may be a branch and emits; out of W180's row (W179's G1 named it) | **Widen `Owns` by the one sentence**: *since v0.23 the guarantor is the driver's two-pass emission (`spec/join-policy.md`), an ask entry emitting on entry* | **Leave it to the next item that edits `src/fold/policies.ts`** — a comment, no behaviour |

## Notes for W181 and W182

- **W181 — D1 took the three `ended` refusals**: `hasParked()` counts an unanswered ask, L2 case 14 holds cancel, stop
  and pause accepted on a run waiting only on an ask (cancel: nothing sent, the run `cancelled`; stop: `interrupted`),
  beside the finished control refused `ended`. W181's gate clause *each beside today's red* has no red on this tree.
- **W181 — what is ALREADY held at L2** (`test/driver/ask.test.ts`): a resume re-parking an ask with nothing re-dispatched
  and answered on the resumed driver; a forged stored input refused `diverged` at the `asked` element's position; a
  stored answer FED (S3's probe killed there); a cancel raised on the `asked` element (`RN-R29` at the park). **Not
  held**: a stop and resume of a run PAUSED while parked on an ask; an answer while paused with its successor held; a
  resume whose stored `asked` input holds a `Map`/`Set`/`Date` (R13 — `sameData` compares those by own keys only).
- **W181/W182 — the cancel road from `onFoldInput`**: a `void driver.cancel(...)` raised on the `asked` element is
  accepted mid-step (`stepping > 0`, no `ended`), sends nothing and the run reads `cancelled`.
- **W182** — `examples/l6.ts:6916`'s exemption comment says *every `Driver` refuses a run where a branch enters an ask
  until W180* — history now; the exemption (`NOT_YET_AT_L6`) is still right until W182's row runs an ask, and its
  removal is W182's. `examples/workers/shard.ts:5`'s *a branch entry is a task* premise (W179's note). `X10` moves with
  the block. W180's real-scheduler probe (`C:/tmp-w180/probe/probe.ts`) is the exit artifact's clauses (1) and (2) in
  miniature, green in both runtimes.
- **A throw on the RESOLUTION's own element on `resolve()`'s step** (measured at round 1, the adequacy reader's note): it
  leaves `appendResolution`, so neither `branch.resumed`, the routing nor a halt follows and the run is not reported —
  the answer is in the log and its node reads `done`, routed nowhere. The same for a TASK's resolution, pre-existing
  (W178's `OR-R10` boundary covers a scheduler event's step, not this driver call). For the retro or W181; not raised.
- **The record step** — `doc/questions/q118.md`'s deferral note (*waits on FD-V9 being lifted*): FD-V9 admits an ask
  since v0.42, and the ask arm, like the task arm, derives its path from the graph and discards `fromBranch` and
  `fromRegion`, so the two arguments are STILL unobservable — the deferral's condition is unmet; a one-line note at the
  Record.

## The author's provocations (before the readers)

`C:/tmp-w180/mutate2.mjs` in the byte copy `C:/tmp-w180/m` (synced with the real tree, `cmp` per changed file; S-1 and
S-2's patches applied there so the CONTROL is clean; `find -type l` zero). Each probe's anchor checked against the CURRENT
text (exactly one match), replaced by a FUNCTION (so no `$` pattern in the replacement is interpreted — round 1's B2 was
malformed by exactly that and graded CRASH, re-cut), the file restored from its FIRST snapshot and its SHA-256 compared
after every probe and at the end; graded on the runner's `suite › case` failure lines over the whole L1-L5 suite (node);
a module that cannot be imported graded CRASH; a 180 s time-out NO VERDICT (none occurred). **Grader controls**: CONTROL
(no edit) clean; GRADER-CRASH (a syntax error) CRASH, not KILLED — round 1's grader called it KILLED, and the grader was
fixed before the final run.

**Round 1** (44 probes): 39 killed; **four SURVIVED** — A1 and A2 (declared before the run as expected survivors:
forward guards) and A4 and Z2 (not declared); B3 survived too; B2 malformed. **Each survivor was answered by a case
that makes it reachable, not by an argument**: A1 — a payload getter halting the run inside `compose`, before the park
(W172's road, L2 case 17); A2 — a settlement delivered TWICE re-entering the ask (ADR 0022's road, L2 case 18); A4 — an
entry ask with NO `needs`, where the caller's own payload reaches the park; Z2 — a consumer writing below the frozen top
level of a handed-out input; B3 — a schema admitting every object but `null`. **Final run, on the tree this item ships:
41 one-clause probes, 41 KILLED, 0 survivors**; plus the two STRUCTURAL probes below, both KILLED.

| id | the ONE clause broken | final verdict |
|---|---|---|
| CONTROL | no edit — must come back clean | clean |
| GRADER-CRASH | a syntax error — must grade CRASH | CRASH |
| A1 | the park's first hold check removed | KILLED — *RN-R29 BEFORE the park* |
| A2 | the `DuplicateTaskId` guard never fires | KILLED — *ID-R1 for an ask's id: a settlement delivered TWICE* |
| A3 | the asked id not recorded | KILLED — 17 cases |
| A4 | the kept input the received value, not a copy | KILLED — *an ENTRY ask parks* (the no-`needs` half) |
| A5 | `branch.suspended` after a mid-step answer (the parked check dropped) | KILLED — *an answer given from inside onFoldInput* |
| A6 | `branch.suspended` after a halt (the hold check dropped) | KILLED — *RN-R29 at the park: a CANCEL raised on the `asked` element* |
| A7 | no `branch.suspended` at the park | KILLED — 5 cases, the fan-out's first |
| A8 | the `enter` arm parks nothing | KILLED — 22 cases |
| A9 | the park's id at attempt 1 | KILLED — 18 cases |
| S1 | `parked()` ignores the asked set | KILLED — 16 cases |
| S2 | `resolve()` reads the unwidened predicate | KILLED — 15 cases |
| S3 | the replay's fed resolution reads the unwidened predicate | KILLED — *a resume RE-CREATES the `asked` element* (the stored answer fed) |
| S4 | `hasParked` ignores asks | KILLED — *the three `ended` refusals* |
| S5 | `hasParked` ignores parked tasks | KILLED — 7 cases (W173-W175's) |
| S6 | `cancel`'s `ended` refusal unwidened | KILLED — *the three `ended` refusals* |
| L1 | `isSuspended`: an asked id with no record not suspended | KILLED — 17 cases |
| B1 | an ask's answer never held | KILLED — *FD-R4 at the answer* |
| B2 | an ask with no `answerSchema` refuses every answer | KILLED — 4 cases (round 1 CRASH: a malformed mutant, re-cut) |
| B3 | an absent result held as `{}` rather than `null` | KILLED — *FD-R4 at the answer* (round 1 SURVIVED) |
| B4 | the refusal names the `start` boundary | KILLED — *FD-R4 at the answer* |
| B5 | the message does not name the `answerSchema` | KILLED — *FD-R4 at the answer* |
| B6 | a DECLINE held to the `answerSchema` too | KILLED — 5 cases |
| Z1 | `freezeInput`'s asked arm removed | KILLED — 2 cases, RN-R17's every-kind copy case among them |
| Z2 | `freezeInput` freezes the driver's own input | KILLED — *an ENTRY ask parks* (round 1 SURVIVED) |
| E1 | an ask's answer has no effective outcome | KILLED — 14 cases |
| E2-E9 | `attempts` 1; `schedulerTimestamp` 0; `startTime` the answer's stamp; `terminalState` always `done`; the answer not the result; the decline's error dropped; `observedAt` 0; `executionTime` 0 — eight probes, one field each | each KILLED — *a predicate sees the DERIVED outcome*, *a decline*, *a done answer IS the node's result*, *RS-R1 and section 7 at the log* |
| R1 | an ask has no eligible edge | KILLED — 12 cases |
| F1-F6 | the asked node folds `running`; the fold shares the element's input; a second `asked` re-parks; the answer drops the kept input; the asked arm recomputes no outcome; the input not kept — six probes | each KILLED — 1 to 13 cases |
| M1 | the matrix verdict does not see a parked ask | KILLED — *L5 — every cell, by hand* |
| JP5-FANOUT | **STRUCTURAL, outside sentence E's count** — the `fanout` arm's two passes interleaved (open, enter, open, enter) | KILLED — *an ask as a fan-out's branch entry … every branch.opened precedes its branch.suspended* (and 14 more) |
| JP5-MAP | **STRUCTURAL** — the `map` arm's two passes interleaved | KILLED — *an ask as a MAP's branch … every branch.opened first* (and 9 more) |

*The JP5 probes restructure a loop and are not one clause; they are run for the one claim W179's G1 asked for — an L2
case that fails if the driver interleaves its `branch.opened` emission — and are counted as killing nothing under E.*

## Gate before the readers (sentence C)

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` on the REAL tree, held still (digest of every changed file equal at both ends) | RAN — **EXIT 1**, at `npm run test` | lint, the five typechecks and the ten checks all passed (`check:spec` 7 / 81 / 146, `check:docs` 42 `run` snippets, `check:budget`, `check:register`); L1-L5 node 73 files / 1931 cases, **2 failing — exactly S-1's expiring case and S-2's arc total, both outside `Owns`**; deno, chromium and L6 NOT RUN (the chain stopped) |
| `npm run gate` in the byte copy `C:/tmp-w180/g` (the real tree's files, `cmp` clean, with S-1 and S-2's patches applied; no `.git`, so `check:register`'s R4 skips by its own guard) | RAN — **EXIT 0** | lint 157 files; `check:spec` 7 / 81 / 146; `check:docs` 42 `run` snippets; L1-L5 73 files / 1931 cases in node, deno and chromium; L6 2711 assertions, 0 failed, 190 runs, in node and deno |
| B′ — `check:budget:selftest` | RAN — EXIT 0 | 18/18 bounded, digest unmoved |
| B′ — `check:docs:selftest` (an executed snippet added) | RAN — EXIT 0 | 24/24 noticed |
| L1 — the `asked` arm | RAN — green | `test/fold/asked.test.ts`, 9 cases |
| L2 | RAN — green | `test/driver/ask.test.ts`, 19 cases (22 after round 1) |
| L3 — folded twice | RAN — green | hand-written (`asked.test.ts`) and driven (`test/matrix/ask.test.ts`) |
| L5 — an ask in a fan-out holds its join | RAN — green | `test/matrix/ask.test.ts`: 4 rows x 3 policies, every cell by hand |
| `RUN_FOR`'s `asked` run | RAN — green | RN-R17's three every-kind cases visit it |
| P35 prediction 3 | RAN | **clause 1 SUPPORTED FOR THE ROADS IT DRIVES** (M4: 324 runs identical, re-run identical after round 2) — the adequacy reader's limit, taken: 288 of the runs drive anything, only 4 park a TASK in a region, every predicate is false, and no run resumes, cancels, stops or pauses, so two of the five widened `RS-R1` readers (the replay's and the `ended` refusals) are out of its reach — those are held by L2 instead; **clause 2 REFUTED in part** — the forced edits were `RUN_FOR` (L0) and RN-R17's kind count beside it, NOT `schedulerTimestamp`'s readers (none broke, M2), plus `DRIVER_FIELDS` twice (R3's field) and W179's expiring case (its design); E1's corpus moved four censuses besides |
| a real scheduler through `createRuntime` | RAN — green, node 24 and deno | M7 |
| `gate:item` | NOT RUN | after the readers (sentence C) |

## Readers — round 1 (2026-10-17), and what was acted on

*Both readers read the tree with S-1 and S-2's patches applied, spec first, with fresh contexts; each reported and fixed
nothing. The in-`Owns` findings were applied by the author at the coordinator's direction; the out-of-`Owns` ones (S-1
to S-5) wait on the maintainer — both readers agree with all five recommendations.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | code conforms to (b)-(f) and (i) | — | — |
| conformity | **DEFECT R4** — an answer given on the `asked` element in a region made an UNRESUMABLE checkpoint (`diverged` at 6) | defect (in `Owns`) | **FIXED** — the mid-step answer is accepted and taken at rest (R4 rewritten); L2 cases 11 (fan-out: taken at rest, checkpoint resumed on a fresh driver, same fold; the at-rest road unchanged) and 12 (map: two instances answered mid-step, a second answer refused while pending, an `FD-R4` refusal thrown at the call, a cancel on the step dropping the pending answer, a pause behind a pending answer refused `paused`, the checkpoint resumed) |
| conformity | **S-4 note** — the guard fixes the stream, not the resume | note on S-4 | **S-4 REVISED** (measured: every mid-step resolution at rest fixes both, 0 cases moved); not applied |
| conformity | **GAP R13** — *a different input is refused `diverged`* false for `Map`/`Date`/array holes | gap (in `Owns`) | **FIXED** — `sameData` compares structured-clone data (R13 rewritten); L2 case 13: a changed `Map`, `Set`, `Date`, array hole, `RegExp`, `Error`, byte and a `Date` replaced by an object each `diverged` at the element, the untouched clone resuming |
| conformity | **GAP** — `test/driver/driver.test.ts:272-281` (*the mutation is equivalent today*) | stale comment (in `Owns`) | **FIXED** |
| conformity | notes — `spec/join-policy.md`'s v0.12 block points at consequences *below* (now above, rewritten); `AGENTS.md`'s section 11 row (*the rest is P35's next item's*) stale after D1; `needs.test.ts`'s message lost its *and* | text (in `Owns`) | **FIXED** each; `flow-definition.md:482-485` left (history) |
| adequacy | 47 probes, 43 killed, T06 equivalent; verdict ADEQUATE | — | — |
| adequacy | **T09** — `createTask` called for an ask survived (the double records only `addTask`) | gap | **FIXED** — L2 case 1 asserts a recording `createTask` is never called |
| adequacy | **T10** — the park's `branch.suspended` fields unchecked | gap | **FIXED** — L2 case 8 asserts the element field for field |
| adequacy | **R13** (the conformity reader's gap, from the other end) | gap | as above |
| adequacy | note — `RN-R37` names `start`, `resolve` and `resume` as driver-call roads for a throwing callback; only `start` tested | gap | **FIXED** — L2 case 14: on `resolve()`'s step (a throw on the resolution's element reaches the caller after it) and on `resume()`'s (`asked` regenerated in the lost tail: reported once, `ResumeRefused('halted')`); `RN-R37` now states each road. **Measured, not W180's**: a throw on the resolution's own element on `resolve()` leaves `appendResolution`, so neither `branch.resumed`, routing nor a halt follows — the same for a TASK's resolution (Notes) |
| adequacy | note — prediction 3's coverage is narrower than *324 runs* | wording | **FIXED** — clause 1 stated as *supported for the roads it drives* |

**The readers' overlap: ONE shared subject** — R13, `sameData`'s comparison of a non-plain `asked` input (the
conformity reader's GAP, the adequacy reader's R13). Every other finding was one reader's.

**The probe set, re-run after round 1** (`C:/tmp-w180/mutate3.mjs`, the same harness and rules, the byte copy re-synced
with the real tree, `cmp` clean): the 40 one-clause probes of the first set whose anchors survive (A5 dropped with the
clause it broke — the park no longer asks whether it was answered on its own stack; A6 re-anchored on the park's second
hold check) and **sixteen new ones on what round 1 changed** — T1-T9 (the mid-step answer: deferred at all, `midStep`,
the pending-duplicate refusal, the cancel drop, the parked re-ask at the take, the take's routing, the queue's dispatch,
the pause read past an answer, the take's own step) and Q1-Q7 (`sameData`: the class, an array's length, `Map`/`Set`,
`Date`, `RegExp`, `Error`, binary data). CONTROL clean, GRADER-CRASH CRASH, no NO VERDICT, every file restored, digests
equal. **55 KILLED, 3 survived**: **T2** and **T5**, both declared EQUIVALENT before the run — T2 (`midStep` read as always
true): at rest the call's own step ends the moment it returns, so a deferred answer is taken in the same call, in the
same order; T5 (the take not re-asking *parked*): the only roads to answer an ask are `resolve()` calls, and a second
one while the first is pending is refused at the call (T3 kills its removal), so the re-ask cannot fire — kept as a
forward guard; and **Q7** (binary data by its bytes), not declared: a TYPED array's indices are own enumerable keys, so
the plain-object rule already compared it — a BARE `ArrayBuffer`, with no own keys, is the case the clause is for, and
the case added for it KILLS Q7 (re-run alone, CONTROL clean). **Final: 56 of 58 killed, the two survivors equivalent and
argued.**

| `npm run gate` in the byte copy `C:/tmp-w180/g` after round 1 (S-1, S-2 patched) | RAN — **EXIT 0** — `check:spec` 7 / 81 / 146; `check:docs` 42 `run`; L1-L5 73 files / 1934 cases in node, deno and chromium; L6 2711, 0 failed, node and deno |
|---|---|
| the real tree after round 1, `node test/runner.ts` | 73 files / 1934 cases, the same 2 failing — S-1's and S-2's, outside `Owns` |

## The rulings (maintainer, 2026-10-17, *"As recommended"*), and what each did

| | ruling | applied |
|---|---|---|
| S-1 | YES | E2 — `test/definition/ask.test.ts`: the expired case rewritten to assert the PARK on its four roads beside the task control; the unused import dropped |
| S-2 | YES | E3 — `test/definition/wiring.test.ts`: 70 -> 74 with its comment |
| S-3 | YES | E4 — `spec/task-id.md` v0.14: `ID-R1` (a second park at one id `DuplicateTaskId`, reached by one settlement delivered twice) and `ID-R4` (a settlement carrying an ask's id `UndispatchedTask`) settled; `spec/README.md`'s row |
| S-4 | YES, the REVISED form | a design change, ratified: `resolve()`'s deferral clause `&& kind === 'ask'` dropped — EVERY mid-step resolution taken at rest. L2 case 22 (a parked TASK resolved on its own `user_action` element in a region: `branch.suspended` then the resolution at rest, the fold consistent, the checkpoint resumed); `RN-R37`, `RS-R1`, ADR 0109 rule 5 and its consequence, `AGENTS.md` section 7 and the driver's comments widened to any resolution. **What it moved among W172-W175**, measured by instrumenting the deferral in the copy over the whole L1-L5 suite: FIVE existing cases resolve a TASK mid-step — `checkpoint.test.ts`'s *RN-R18 — a re-entrant append inside onFoldInput*, three of `pause.test.ts`'s (*a pause and an unpause raised in ONE step*, *a dispatch made on the unpause's own stack*, *a paused run RESUMED*) and `stop.test.ts`'s *a stop raised MID-STEP on a settlement's element*. **Each still passes unchanged**: in each the resolution and its routing now follow the step's remaining elements rather than interleaving with them — the ratified change — and no assertion in them reads the moved order. W172's `hold.test.ts` reaches none of it. L6 2711 / 0 failed in node after the change, before the gate |
| S-5 | YES | E5 — `src/fold/policies.ts`: `arrivalCount`'s docblock sentence (*remains unfalsifiable through a conformant driver*) corrected, dated |

## Record

*Filled 2026-10-17, after the readers' round, the fixes and the maintainer's rulings. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 1 on the real tree at the two then out-of-`Owns` cases (S-1, S-2); EXIT 0 in the byte copy with their patches | the section above |
| L1 — the `asked` arm: node `suspended`, run `awaiting_action`, `NodeRun.input` the composed value; an answered ask indistinguishable in `nodes` from a resolved task but for `input` | RAN — green | `test/fold/asked.test.ts`, 9 cases |
| L2 — an ask parks with nothing handed to the scheduler; a refused answer appends nothing and the corrected one routes by `when`; a decline routes `on: ["failed"]`; an ask in a fan-out holds its join | RAN — green | `test/driver/ask.test.ts`, 23 cases — the probe tables above say which case kills what |
| L3 — folded twice | RAN — green | hand-written and driven |
| L5 — an ask in a fan-out holds its join | RAN — green | `test/matrix/ask.test.ts`, 4 rows x 3 policies by hand |
| `RUN_FOR`'s `asked` run | RAN — green | RN-R17's every-kind cases |
| B′ — `check:budget:selftest` (and `check:docs:selftest`, a snippet added) | RAN — EXIT 0 each | 18/18; 24/24 |
| conformity reader | RAN | conforms to (b)-(f), (i); DEFECT R4, GAP R13, the `driver.test.ts` GAP and three notes FIXED; the S-4 note acted on (S-4 revised, ratified) |
| adequacy reader | RAN | 47 probes, 43 killed, T06 equivalent, ADEQUATE; T09, T10, R13 and the driver-call roads FIXED; prediction 3's wording taken |
| the author's probes, final | RAN | round 1: 44 + 2 controls; after the readers: 58 (56 KILLED, T2 and T5 EQUIVALENT, declared and argued; Q7 killed once its bare-`ArrayBuffer` case existed); after S-4: the resolve family re-run — CONTROL clean, GRADER-CRASH CRASH, A3, S1-S6, L1, T1, T3, T4, T6-T9 and the new T10 (*only an ask's mid-step resolution taken at rest* — S-4 undone) all KILLED, T2 and T5 equivalent as before; every file restored, digests equal, no NO VERDICT |
| a real scheduler through `createRuntime` | RAN — green, node 24 and deno | M7 |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w180/gateitem.log`), the changed and new files' digest equal at both ends | the ladder: lint 157 files; `check:spec` 7 / 81 / 146; `check:docs` 42 `run` snippets; L1-L5 73 files / 1935 cases in node, deno and chromium; L6 2711 assertions, 0 failed, in node and deno; selftests 10/10 ok (955.1 s wall, 9 lanes), `check:register:selftest` left out by `--without`. *This row is the only edit after the gate, to this file alone* |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `asked` kind, the fold's arm, `NodeRun.input` | yes | F1-F6, `RUN_FOR` at L0 |
| (1) the park — nothing handed to the scheduler | yes | A1-A9, T09's `createTask` case |
| (1) `RS-R1` widened at every reader; the `ended` refusals | yes | S1-S6, L1 |
| (1) `FD-R4` at the answer | yes | B1-B6 |
| (1) the derived effective outcome; `schedulerTimestamp: number \| null` | yes | E1-E9; M2's typecheck |
| (1) routing an ask; `freezeInput`'s arm | yes | R1; Z1, Z2 |
| (1) a mid-step resolution taken at rest (R4, S-4) | yes | T1-T10 |
| (1) `sameData` over structured-clone data (R13) | yes | Q1-Q7 |
| (2) the specs, the corpus flows | yes | `check:spec` C8 (the versions), `l4-corpus` (section 7 both ways), the censuses |
| (3) the three suites and the census moves | yes | `LATE_SUITES`, the probe tables |
| (4) `AGENTS.md`, `doc/concept.md`, ADR 0109 | yes | `check:docs` X4 (42 `run` snippets, the ask snippet asserting the park, the refusal and the derived outcome); `check:budget`; `check:register` R7 (ADR 0109's `amends`) |

**P35 prediction 3 — clause 1 SUPPORTED FOR THE ROADS IT DRIVES, clause 2 REFUTED.** *"Every flow WITHOUT an ask
byte-identical in its fold inputs"*: 324 runs identical on `b71fc8e` and on this tree, re-run identical after round 1
(M4) — supported for the roads it drives, which are not every road (no resume, cancel, stop or pause; every predicate
false; four runs park a task in a region). **And after S-4 it is no longer true of every road, by a ratified design**: a
TASK resolved mid-step now has its resolution after the step — five existing cases take that road, each still green.
*"The one forced edit … is `RUN_FOR`'s entry and, if (e) is answered as recommended, the readers of
`schedulerTimestamp`'s type"*: REFUTED — `RUN_FOR` and RN-R17's kind count beside it were forced; NO `schedulerTimestamp`
reader broke (M2); and `DRIVER_FIELDS` twice (R3), W179's designed expiry (E2) and E1's corpus censuses moved besides.

**The readers' overlap: ONE shared subject** — R13 (`sameData`'s comparison of a non-plain `asked` input: the conformity
reader's GAP, the adequacy reader's R13).

**Exceptions**: E1 (`spec/examples/valid/**`, W179's S-2 ruling), E2-E5 (S-1, S-2, S-3, S-5), each a YES before its
edit; `git diff --name-only` against the `Owns` block and the record-step list leaves nothing else. **Ratified design
change**: S-4.

**Census moves.** `RUN_FOR` +`asked`, RN-R17's count 14 -> 15; `DRIVER_FIELDS` +`asked` (both copies), `NOT_RUN_STATE`
unmoved; `LATE_SUITES` +3; `RUN_FLOOR` 41 -> 42; `check:spec` 7 / 79 / 144 -> 7 / 81 / 146; L1-L5 70 / 1898 -> 73 / 1935;
the region census +1 row and its fanout-only literal 5 -> 6; OR-R11 19 of 213 -> 20 of 219; the wiring L4 arc total 70
-> 74; spec versions run-state v0.22, outcome-record v0.18, flow-definition v0.43, join-policy v0.23, task-id v0.14;
`doc/concept.md` headroom 799 -> 636. Unmoved: `X10`, L6 2711, the L6 kind exemption. **New public surface**: the
`asked` kind, `NodeRun.input`; **BREAKING**: `FoldInput`, `OutcomeRecord.schedulerTimestamp`; a mid-step `resolve()`
returns `true` for a resolution then appended at the step's end.

**Hand-ons — W181**: the `ended` refusals are taken (D1); held at L2 already: a resume re-parking, a forged input
`diverged` (now over structured-clone data), a stored answer fed, a cancel on the `asked` element, a mid-step answer's
checkpoint resuming; not held: stop and resume of a run paused while parked on an ask, an answer while paused with its
successor held. **W182**: `examples/l6.ts:6916`'s comment and the `NOT_YET_AT_L6` exemption; `examples/workers/shard.ts:5`;
`X10`; the probe `C:/tmp-w180/probe/probe.ts` is clauses (1) and (2) in miniature. **The record step**: `q118.md`'s
deferral note (Notes).

**What broke.** Round 1's first cut appended an ask's mid-step answer on the stack it was given on, which made the
run's checkpoint unresumable in a region (the conformity reader's R4) — a rule the plan's brief stated in a sentence
(*an owner element a resume's replay feeds is taken at rest*) and the item followed for the park and not for the
answer; and `sameData` compared a `Map` by own keys (R13), so a sentence of two documents was false on the item's own
`RUN_FOR` input.

**What this taught.** *For the retro*: the brief's *taken at rest* sentence was read as being about W181's run control,
and it bound W180's `resolve()` too — a sentence copied into every brief binds every door it names, and the author
checked it only at the doors the plan's row listed. And a comparison written for flat data (`sameData`, *those kinds
are flat plain data*) was handed a kind that is not, with its docstring updated and its body not.

**Questions raised.** None (Q667-Q670 SPENT, unissued). **Closed.** None. *The throw on a resolution's own element
during `resolve()` (Notes) is left for P35's retro, as the maintainer directed.*
