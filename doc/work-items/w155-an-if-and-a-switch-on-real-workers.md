# W155 — an `if` and a `switch` on real workers: P32's exit artifact

**Status:** done 2026-10-14 — **`npm run gate:item` EXIT 0** on the final tree after both readers' items, one command, its first
run; `npm run gate:full` EXIT 0 on the pre-reader tree (Record); stop-and-asks (r) and (s) ANSWERED YES by the maintainer
2026-10-14 and acted on, with the readers' items R1-R7 (Exceptions); Q594 raised deferred; the census-site correction
(re-take 2) confirmed by the conformity reader and not objected to by the maintainer; both reader passes RUN (gate table); declared 2026-10-13 on `334851d`, declaration step RUN the same day
in a byte copy of `334851d`, written before any edit outside this file
**Plan:** [P32](../plans/p32-what-a-gate-may-decide-without-memory.md) — *may a gate decide by a declared condition
or a declared value table, without memory?* — and this is its LAST item and its EXIT ARTIFACT.

```
Spec:       NONE moves a rule — an exit artifact writes no rule (W94's precedent). spec/flow-definition.md v0.31's
            gate subsection (the built-in table, FD-C8, FD-V40, FD-V41) and section 3's `when` grammar are what the
            expected values are written from. ONE spec edit, a corpus CENSUS sentence with no version move:
            spec/outcome-record.md section 4's task-node figure (W94's and W110's precedent).
Owns:       examples/flows/if-then-switch.flow.json (new); examples/l6.ts; examples/README.md (the two L6 count
            copies X10 reads, :38 and :70, the `flows/` row's count at :81 and the `ui-registry.json` row);
            test/definition/wiring.test.ts — the L6 CORPUS census at :225 (comment), :273 (the case name), :275
            (the flow count) and :311 (the verdict counts), NOT the L4 arc literal at :441 (re-take 2);
            spec/outcome-record.md section 4 :371 (the task-node census sentence). Every other site was
            measured unmoved (re-take 2). And whatever stop-and-ask (r) is answered with. **Every line number
            here is `334851d`'s, the tree the declaration measured** (the edited tree puts the verdict counts at
            :314 and the L4 literal at :444 — the readers' nit, R6). And by the Exceptions below (2026-10-14):
            examples/run-flow.ts ((s): `RunReport.gateTypeNames`) and doc/questions/q594.md (new, R5).
Inputs:     P32's exit-artifact sentence, decisions 1, 4-6, stop-and-asks (b) and (c); W154's Record note *For
            W155*; spec/flow-definition.md v0.31 section 2 (`if`, `switch`, *What RUNNING a gate does*, FD-R4
            through an entry gate) and section 3 (*The `input` root*, FD-C8); spec/run-state.md RN-R26;
            spec/task-id.md section 1 (a branch path outside every region is `-`); ADR 0066 rule 1, ADR 0067,
            ADR 0092; W94's rows and W110's registry road (examples/ui-registry.json, `buildUiRuntime`).
Outputs:    (1) examples/flows/if-then-switch.flow.json — `triage`, an ENTRY `if` (`input.confidence gte 0.5`):
                `then` → `score` (ScoreWorker) → `grade`, a `switch` keyed on `score` with `certain: 100` (a
                scalar case) and `likely: [80, 90]` (an array case): `certain` → `publish` (PublishWorker) →
                `published`, `likely` → `accepted`, `default` → `review`; `else` (the default) → `shelve`
                (PublishWorker) → `shelved`. Existing workers and node types only — no new worker, no registry
                edit; every type it names is in BOTH registries.
            (2) four EXPECTED rows, both runtimes, one payload per route the `switch` can take plus the `if`'s
                `else` — confidence 1 (then, certain), 0.9 (then, likely), 0.5 (then at the BOUNDARY, default),
                0.2 (else) — each on the UI registry with an EMPTY predicate map; each asserting, beside the
                harness's per-row base, its dispatches, results, path end and a new `steps` clause: the run's
                `gated`, `dispatched`, `outcome` and `pathEnded` fold inputs IN ORDER (each decision in place,
                with its key where the gate resolves one), and `RunState.gated` equal to the `gated` inputs.
            (3) one cross-row block: every route of both gates taken by exactly the payloads the spec says (a
                LITERAL), with its control from a second source (the routes `routesOf` gives each gate, both
                ways); each row's predicate registry EMPTY; the runtime registering NO gate type; and the unwired
                document — `IFS` less `grade`'s `likely` edge and the end only it reached — refused at LOAD by
                FD-V41 naming `likely`, by `validateDefinition` and by `runtime.start` (InvalidDefinition, the
                scheduler holding nothing), beside the control that the shipped document validates clean.
            (4) every census the new flow and rows move, moved in the same diff (re-take 2).
Depends on: W154
Blocks:     nothing — P32's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24.20.0 and deno 2.9.6. Every expected value is written from
            section 2's built-in table, the `score` worker's declared behaviour (round(c * 100)) and the task-id
            scheme BEFORE the file is run; nothing depends on a completion order (each run is one path). Each new
            clause shown able to fail by a provocation (rule 8), recorded.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) on a still tree, ONE command; then the
            conformity reader and the adequacy reader, workflow section 6 — NOT run by this item's author.
Reserves:   Q594-Q598, and NO ADR
```

*Reserves: `npm run state` on `334851d` reads the tree's next free question as **Q590**; W154 reserved Q590-Q593 and
issued none, so they are skipped, never reissued (`doc/workflow.md` section 3), and this item takes **Q594-Q598**.
P32's ADR 0093 went unused at W154 and an exit artifact writes no rule, so this item reserves no ADR. **W156 stays
reserved and expected unused** (P32's block).*

## Scope

**In**

1. **The flow** — Output (1).
2. **The rows and the block** — Outputs (2), (3).
3. **The censuses** — Output (4).

**Out** — named rather than left implicit, with where it goes instead

- **`src/**`, `spec/**` rules, any test beyond the two census files** — a defect found there is a stop-and-ask; L1-L5's
  case count is UNMOVED (two literals move inside existing cases).
- **A threaded row, a kill-and-resume block** — W94 needed both because `distinct` REMEMBERS and its winner is a
  property of arrival order; `if` and `switch` read no memory (FD-C8), so a route is a function of the payload alone
  and neither order nor replay can move it. Not in P32's exit sentence.
- **FD-R4 through the entry `if` on real workers** — W154's L2 holds it; not in P32's exit sentence.
- **The wiring refinement along an `if`'s path** — [Q589](../questions/q589.md), deferred.
- **P32's Record and retro** — the coordinator's and the maintainer's.

## What the declaration step re-took before anything was edited

*P15 decision 5: every fact is re-run by the item that acts on it. Measured 2026-10-13 in a BYTE COPY of `334851d`
(`git archive` into `C:/tmp-w155/m`, `node_modules` copied, zero links by `find -type l` and by PowerShell's
`ReparsePoint` scan), node 24.20.0 and deno 2.9.6, so the author's tree was not touched until this file existed.*

**Re-take 1 — the baseline, re-run in the copy, not transcribed.** `node test/runner.ts` **EXIT 0, 58 files / 1635
cases**; `node examples/l6.ts` **EXIT 0, 2487 assertions / 164 real runs**. deno and chromium L1-L5 (58 / 1635), deno
L6 (2487 / 164) and `check:spec` 7 / 75 / 133 are W154's final `gate:item` on the same source tree (`334851d`
committed it) — read from its Record, not re-measured here.

**Re-take 2 — what a new flow, three new task nodes, four new rows and a new block MOVE.** Found by building them in the
copy and running every lane, not by guessing: L6 in both runtimes, L1-L5 in node, `lint`, the five `typecheck`
lanes and the twelve checks of `npm run gate`.

| census | moved by | moved? | in `Owns` |
|---|---|---|---|
| `test/definition/wiring.test.ts:273-:311` — **the L6 CORPUS census** (W73's, a walk of `examples/flows/**`): *30 flows*, `fits: 75` | the new FLOW (31) and its one arc `score → publish` through the gate (`fits`) | **yes** — 4 cases red, the first on the count and three cascading off its empty `reports` | yes |
| `test/definition/wiring.test.ts:225` — a comment quoting that census (*`unchecked: 14` over 30 flows*) | the same | text only | yes |
| `test/definition/wiring.test.ts:441` — **the L4 arc literal (70)**, a walk of `spec/examples/valid/**` | a task in the L4 corpus — **which this item adds none of** | **NO** — measured green. *The brief named this line; the census a new `examples/flows/**` document moves is the one above it in the same file, which W94 moved the same way. W154's note says :441 moves for a task in `spec/examples/valid/**`, which is right and is not this item's case* | not needed |
| `test/fold/result-value.test.ts:575` ← `spec/outcome-record.md:371` — *19 of 210 corpus task nodes, 191 (91%)* | THREE task nodes (`score`, `publish`, `shelve`), no `needs` | **yes** — `expected 213, actual 210` | the spec sentence, yes; the test derives and is NOT edited |
| `spec/run-state.md:453` — *153 of 175 task nodes (91%)* | the same count | **no assertion reads it** — a copy stale since W67 (210 at `334851d`), which W82, W86, W94 and W110 left as it was | **no** — not this item's to fix; noted |
| `examples/l6.ts` `DECLARED_TOTAL`, `DECLARED_RUNS`, `CROSS_ROW`, `ROW_KEYS`, `PER_ROW_SUBJECTS`, `CROSS_ROW_SUBJECTS`, the per-row extras | the rows and the block | yes | yes |
| `examples/l6.ts` W98's dispatch-order census `{ byCausality: 824, turn: 183, free: 264 }` | the one chained pair `score → publish` on the `certain` row | **yes, 824 → 825** | yes |
| `examples/l6.ts` W110's block, clause (1) and the `namedByDocument` clause — LITERAL per-row lists over `EXPECTED.filter((e) => e.uiRegistry === true)` | four new rows on the UI registry | **yes, 2 assertions red** | **NO — stop-and-ask (r)** |
| `examples/README.md:38`, `:70` — `check-docs` `X10`'s two copies | `DECLARED_TOTAL` / `DECLARED_RUNS` | yes, `X10` red | yes |
| `examples/README.md:81` — *the twenty-eight flows* | the new flow | text; **stale since W110** (30 at `334851d`) | yes — corrected to thirty-one |
| `scripts/check-workers*.mjs`, `examples/registry.json`, `examples/ui-registry.json`, `THREADABLE_TYPES`, the worker-list clause | a new worker or type | **no** — none is added | — |
| `examples/l6.ts:6612`'s kind clause — every node KIND in the valid corpus runs at L6 | a new kind | no — `gate` and `task` are there | — |
| `scripts/check-docs.mjs` `RUN_FLOOR`, `AGENTS.md` | a snippet | no — none is added | — |
| `check:spec` | a rule or a corpus file | no — `spec/examples/**` untouched | — |

**Re-take 3 — the two built-ins on this flow, against the registries.** `validateDefinition` gives **zero findings**
against `examples/ui-registry.json` with `predicates: []` and against `examples/registry.json` with its three; the
unwired document (`grade` less `likely`) gives **exactly `FD-V41` at `grade`, naming `"likely"`** — and with the
`accepted` end kept, `FD-V41` **and `FD-V11`** (the orphan), which is why the derived document drops both.
`checkWiring` over the shared registry: one arc, `score → publish` through the gate, `fits`; entry targets `score` and
`shelve`.

**Re-take 4 — a branch path outside every region is `-`, not `''`.** The first draft of the `steps` literals omitted
it; the run read `gate triage@- → then`. `spec/run-state.md` RN-R26 says a `gated` element's `branchPath` is *derived
as a task's is*, and `spec/task-id.md` section 1 says that is `-` — so the literal was wrong and the spec, not the
run, corrected it.

**Re-take 5 — the rows in the copy.** With every census in `Owns` moved and (r)'s recommended line applied in the copy
ONLY, L6 read **2599 assertions / 168 runs, 0 failed** in node and in deno — the arithmetic below, exactly — and L1-L5
58 / 1635, EXIT 0. **Two unrelated L6 failures in three node runs**, each once and neither in this item's rows:
`uncloneable / OR-R6, threaded` (r63) reading `running` at its 400 ms backstop, and block (2h)'s kill point K=21. Both
are timing on rows that existed before this item; recorded here so the confirming gate's reader is not surprised.

## The L6 arithmetic, written before the real tree was edited

| row | base | `nodeResults` | `pathEnds` | `steps` | total |
|---|---|---|---|---|---|
| `if-then-switch / 1` (r64) | 22 (plain) | 2 | 1 | 2 | **27** |
| `if-then-switch / 0.9` (r65) | 22 | 1 | 1 | 2 | **26** |
| `if-then-switch / 0.5` (r66) | 22 | 1 | 1 | 2 | **26** |
| `if-then-switch / 0.2` (r67) | 22 | 1 | 1 | 2 | **26** |

**+105 per-row, +7 cross-row (`CROSS_ROW` 259 → 266), W98's census moving inside an existing clause: 2487 → 2599
assertions, 164 → 168 runs** (the block's runtime starts nothing — the refused `start` is not a run).

## What this item SELECTS, and the fixture where each wrong selection DIFFERS (rule 8 obligation (a), v0.23)

| selection | the right one | the well-formed wrong ones, each shown to DIFFER |
|---|---|---|
| `if`'s operator | `gte` | `gt` — the 0.5 row is the BOUNDARY, `then` against `else` |
| `if`'s default | `else` (the edge with no `route`) | `then` — `FD-V41` refuses the document at load (two edges for `then`) |
| `switch`'s match | the case one of whose values `===` the key | the FIRST case, a scalar-only match (the 0.9 row is an ARRAY case), `default` always |
| `switch`'s default | `default` where no case holds | the first case — the 0.5 row's 50 is in none |
| the value handed on | what reached the gate | the key, the settings — `publish` echoes `score`'s WHOLE result and `shelve` the PAYLOAD |
| the routes the gate has | the `switch`'s CASES, from its settings (ADR 0092) | a fixed list — the control reads `routesOf` over the gate's settings |

## Stop-and-asks — raised at the declaration step

| | the question | measured | options, and their cost | recommended |
|---|---|---|---|---|
| **(r)** | may W155 narrow W110's cross-row block to W110's own two documents — `uiRows` from `EXPECTED.filter((e) => e.uiRegistry === true)` to `… && (e.definition === UI \|\| e.definition === UIN)` (`examples/l6.ts:10972` at `334851d`), every literal in that block unmoved? | P32's exit sentence says *with no predicate … registered*. The only road a row has to an EMPTY predicate map is `uiRegistry: true` — `createRuntime` compares the document's predicate names with the code's functions BOTH WAYS, so an empty map against `registry.json`'s three is refused (W110's stop-and-ask (c), and `run-flow.ts:84`). W110's block selects its rows by that FLAG and asserts two LITERAL per-row lists of seven (`l6.ts:10985` and the `namedByDocument` clause): with this item's four rows on the flag, **both go red** (`actual` lists eleven, the four extra `["l6-if-then-switch", []]` and `[]`), measured in the copy | **1 — narrow the selection (one expression)**: W110's clauses say again exactly what their messages say (*all four `ui-emitted` rows … both `ui-emitted-named` rows*), and this item's block asserts its own rows' empty registries. **2 — extend W110's two literals** by four entries each: two existing expected values and their messages change, and P26's claim absorbs P32's rows. **3 — run on `registry.json`**: no existing assertion moves, but three predicates are registered for every run, which P32's exit sentence refuses. **4 — a block outside the row loop** (W141's road): no assertion moves, but the rows lose the per-row base (24 clauses each — Q32, the dispatch comparison, the retention pair, the wiring verdicts) | **1** |

*(r) blocks the confirming gate: until it is answered L6 is red on exactly those two W110 assertions, in both
runtimes, and `npm run gate:full` is not started over a tree with a known red lane (`doc/workflow.md` section 4). Every
other part of the item is independent of it and is done.*

## Exceptions — the maintainer's answer, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6.*

| | file | the edit, and nothing else |
|---|---|---|
| **(r)** YES, option 1 — answered by the maintainer 2026-10-14, citing the per-decision path as unaffected (this is test code) | `examples/l6.ts` (W110's cross-row block, :10972 at `334851d`) | `uiRows` narrowed to `EXPECTED.filter((e) => e.uiRegistry === true && (e.definition === UI \|\| e.definition === UIN))`; every literal in W110's block unchanged |

*The census-site correction (`test/definition/wiring.test.ts` :225/:273/:275/:311 moved, :441 unmoved — re-take 2) is
recorded as measured and is NOT yet confirmed by the maintainer.*

**The readers' items — each APPROVED by the maintainer 2026-10-14, recorded here before its edit.** Constraint: none
touches `src/**` or the per-decision path.

| | finding | file | the edit, and nothing else |
|---|---|---|---|
| **R1** | adequacy S1: the (r) narrowing dropped the only guard on WHICH rows run the UI registry (M12: the `map` row moved onto it, L6 green) | `examples/l6.ts` (W155's block) | one LITERAL assertion: the flowIds of every row with `uiRegistry: true`, in row order — W110's seven, then W155's four |
| **R2** | adequacy S2: nothing pins the flow's `if` condition (M1/M2: `value` 0.4, `gt 0.45`, L6 green) | `examples/l6.ts` (W155's block) | assert `triage`'s `settings.when` is `{ path: 'input.confidence', op: 'gte', value: 0.5 }` and the boundary row's payload equals `when.value` |
| **R3** | conformity C2 / adequacy S4: both "names the case" observers use `.includes('"likely"')`, and FD-V41's message names every route (M8 green) | `examples/l6.ts` (W155's block) | both anchored: the finding's `at` plus `/^route "likely" of this gate/` on its detail; the thrown message `/^definition "l6-if-then-switch" is invalid: FD-V41 at grade: route "likely" of this gate/` — the shapes read at `src/definition/validate.ts:1373` and `src/driver/driver.ts:1345-1349` |
| **(s)** / R4 | conformity C1 / adequacy S5: *no gate type registered* read off a SIBLING runtime (M11: `gateTypes` in `run-flow.ts:1727`, L6 green) | `examples/run-flow.ts` (now in `Owns`), `examples/l6.ts` | `RunReport.gateTypeNames` — the runtime's registered gate-type names beside `predicateNames` — and W155's rows assert it EMPTY on each row's own runtime, beside the sibling check. Harness only |
| **R5** | conformity C5: `spec/run-state.md:453`'s stale *175 task nodes* | `doc/questions/q594.md` (new) | raised DEFERRED, not patched in passing |
| **R6** | nits: `Owns`' line numbers; P10's gap in the provocation table | this file | say which tree the numbers are from; explain P10 |
| **R7** | S3, C3, C4 | this file | recorded as left alone, with the reasons |

## Choices made inside the declaration and not named by P32

*Listed so the conformity reader can check them, W153's and W154's practice.*

1. **Four payloads, not five.** P32 says *one payload per route*; the two gates have five routes, but every payload
   that takes `then` also takes one of the `switch`'s three, so no payload can take `then` alone. Four is the fewest
   that takes every route, and each route has a payload that is its own.
2. **The unwired document is DERIVED in `l6.ts`, not a file under `examples/flows/`**: that directory is the L6
   corpus, walked as RUNNABLE documents by the wiring census and the task-node census, and an invalid one would be
   the first there. It is `IFS` less `grade`'s `likely` edge and the `accepted` end only that edge reached (re-take 3).
3. **The flow uses the UI registry's existing types** (`ScoreWorker`, `PublishWorker`), which are byte-equal to the
   shared document's (W110's clause (5)), so no worker, type or registry entry is added and no worker census moves.
4. **The `if` reads `input.confidence`**, the field `ScoreWorker` scores, so the boundary row (0.5) is also the
   `switch`'s `default` row: one payload discriminates `gte` from `gt` and a case from no case.
5. **"No gate type registered" is read off a runtime built by the same call `runFlow` makes for a `uiRegistry` row**
   (`buildUiRuntime([IFS], NO_PREDICATES)`), not off the rows' own runtimes: `RunReport` carries the predicate names
   (W110) and no gate-type names, and adding one would edit `examples/run-flow.ts`, outside `Owns`. Its limit is that
   it reads a sibling of the runtime the rows ran, built by the same function from the same arguments.

## Verification

`npm run gate:full`, then the two readers. **Routing coverage**: a branch routed away from its join (Q4) — not
applicable, the flow has no region; `user_action` (Q17) — not applicable, no task parks; no matching decision edge
(Q10) — not reachable, an `if` always answers `then` or `else` and a `switch` a case or `default`, all wired
(`FD-V41`, asserted at load); a duplicate task id (Q13) — not applicable, each node dispatches once per run; a nested
fan-out (Q6) — not applicable.

## Record

*Written 2026-10-14 with the item's changes UNCOMMITTED on `334851d`. Stop-and-ask (r) was first unanswered, and every lane
of `gate:full` was run SEPARATELY (W154's precedent); the maintainer then answered YES, the line went in (Exceptions), and
`npm run gate:full` ran ONCE on the still tree. The reader passes have NOT run.*

**Gate — what ran.** Baseline (re-take 1): L1-L5 58 / 1635, L6 2487 / 164, `check:spec` 7 / 75 / 133.

| Clause | Verdict | Notes |
|---|---|---|
| **`npm run gate:full`, ONE command, still tree, after (r)** | **RAN, EXIT 0 — the confirming run, the FIRST; no re-run was needed** | **L1-L5 58 files / 1635 cases in node 24.20.0, deno 2.9.6 and chromium** (unmoved); **L6 2599 assertions / 168 real runs, 0 failed, in node and in deno** (2487 / 164 before); **`check:spec` 7 / 75 / 133** (unmoved); self-tests **11 of 11 ok**, 2426.6 s wall. None of the timing failures in What broke (5) occurred. Log `C:/tmp-w155/gatefull-1.log`. *The rows below are the lanes run separately BEFORE (r) was answered, and are superseded by this one* |
| **`npm run gate:item`, ONE command, still tree, after the readers' items R1-R7 and (s)** | **RAN, EXIT 0 — the FIRST run; no re-run was needed** | **L1-L5 58 / 1635 in node, deno and chromium** (unmoved); **L6 2602 assertions / 168 real runs, 0 failed, in node and in deno** — PREDICTED 2602 / 168 before the run: `CROSS_ROW` 266 → 269 (three clauses: the UI-rows literal, the `if`'s condition, the rows' own gate types; the anchored load observers move no count), no row and no run; `check:spec` 7 / 75 / 133; self-tests **10 of 10 ok**, 856.4 s, `check:register:selftest` left out by design. Log `C:/tmp-w155/gateitem-1.log`. *The `gate:full` row below ran on the pre-reader tree* |
| every lane of `gate:full` SEPARATELY, before (r) | RAN | the rows below |
| `lint`, `typecheck` (five lanes) | EXIT 0 each | re-run after the last edit to `examples/l6.ts` |
| `check:scheduler`, `check:policies`, `check:spec`, `check:source`, `check:markdown`, `check:wiring`, `check:workers`, `check:docs`, `check:budget`, `check:register` | EXIT 0 each | `check:spec` **7 / 75 / 133, unmoved**; `check:docs` `X10` compares the two `examples/README.md` copies against **2599 / 168** |
| `test` (node 24.20.0), `test:deno` (2.9.6), `test:browser` (chromium) | EXIT 0 each | **58 files / 1635 cases in all three, UNMOVED** — the two census literals moved inside existing cases |
| `test:l6`, `test:l6:deno` | **EXIT 1 each** | **2599 assertions / 168 real runs, 2 failed in each — exactly W110's two literal clauses, (r)**. Every W155 row and clause passes in both runtimes |
| `selftests` (all eleven lanes, `check:register:selftest` included) | **EXIT 0** | 11 / 11 ok, 3554.5 s wall |
| the same rows with (r)'s recommended line, in the byte copy | RAN | L6 **2599 / 168, 0 failed** in node and in deno (re-take 5) — the tree the provocations ran on |
| conformity reader | RAN 2026-10-14, fresh context, worktree `C:/tmp-w155r/rc` on `334851d` plus this item's diff and new files (before the readers' items), spec first and a route table written from section 2 and RN-R26 before the code was opened; nothing edited | **No defect; 5 gaps, 3 nits.** L6 re-run **2599 / 168, 0 failed, node and deno**; every asserted value derived from the spec and the `score` worker's declared `round(c*100)`, none read as copied from output. Confirmed: the four routes (0.5 at the `gte` boundary, 90 one member of an array case, 50 `default` carrying `(key 50)`, 0.2 `else`); no `key` on an `if` element; the decision before its target's dispatch; FD-V41 as the single finding with the orphaned end removed; **the census-site correction (re-take 2)** — the L6 census moves, `:441`'s 70 arcs do not; **the (r) narrowing selects exactly the rows it selected before**. C1 the gate-type check read a sibling runtime; C2 `start()`'s naming observer a substring; C3 strictness, an unresolved key and an absent input below L6 only; C4 four payloads for five routes; C5 `spec/run-state.md:453`'s stale count unraised; nits: Owns line numbers' tree, the missing P10, the log's bytes. Acted on as R4, R3, R7, R7, R5, R6 |
| adequacy reader | RAN 2026-10-14, fresh context, worktree `C:/tmp-w155r/ra`, spec first then tests, mutations by exact-anchor replace, every file restored and checked by sha256 and `cmp` | **18 mutations: 12 killed at L6, 2 killed only at L1/L2, 4 subjects survived everything below or at L6 as the item stood.** S1 the (r) narrowing dropped the only guard on WHICH rows run the UI registry (the `map` row moved onto it stayed green in node and deno, red under the old filter); S2 nothing pinned the flow's `if` condition (`0.5`→`0.4`, `gte 0.5`→`gt 0.45` green); S4 the naming observers passed a message naming the wrong route; S5 a gate type in the rows' own runtime green. S3 (an array case matching its LAST value) survives L6 and is killed at L1/L2. None killed for the wrong reason. S1, S2, S4, S5 acted on as R1, R2, R3, R4 — each re-run as a provocation in pass 3 and red on its declared clause |
| reader overlap | **2** shared subjects | the gate-type check on a sibling runtime (C1, S5) and the unanchored *names the case* (C2, S4) — inside section 6's 0-4 band. **One disagreement**, recorded above in the Record: the (r) narrowing drops no coverage of today's rows (conformity) but drops a forward guard (adequacy, S1); acted on as R1 |

**W155's provocations** — `C:/tmp-w155/rule8.mjs` (outside the tree, not checked in: it tests this item's assertions, not
a new check), run in the byte copy with (r)'s recommended line applied, node 24 asserted. Each edit's anchor matched
exactly once in the current bytes, every touched file was restored and its sha256 compared to its FIRST snapshot, and the
red SET of tags was compared to a declared set both ways. Grader controls: `gX` (a throw at load — right verdict CRASH)
and `gW` (row 0.5's `score` result made 51, graded against the `steps` clause — right verdict WRONG-REASON).

| probe | the clause it narrows | declared red set | result |
|---|---|---|---|
| CONTROL | a comment | none | CLEAN, as declared |
| gX | — | CRASH | CRASH, as declared |
| gW | — | `r66:steps` | WRONG-REASON (red `r66:base` only), as declared |
| P1 | a `switch` case value flipped (`likely` 90 → 95) | `r65` base and steps, routes, CONTROL | **declared set red on BOTH runs**; first run also red in block (2h), second in `tv-ingest / LAST-first`'s arrangement and `uncloneable / OR-R6, threaded` — the timing failures of re-take 5, not this probe's |
| P2 | two routes rewired (`certain` ↔ `likely` targets) | `r64`, `r65` base and steps | declared set red; **also W98's census and the two load clauses** — the derived unwired document is built from the MUTATED flow, so dropping `accepted` orphans `publish` (FD-V2, FD-V11), and W98 reads the pair through the gate as `free` — **the declaration was short by three explained clauses** |
| P3 | the `else` payload dropped (0.2 → 0.7) | `r67` base and steps, routes, CONTROL | as declared |
| P4 | the `if`'s `gte` → `gt` | `r66` base and steps, routes, CONTROL | as declared |
| P5 | the `steps` clause drops the key | `r64`-`r66` steps | as declared |
| P6 | the unwired document keeps its edge | validator, `start` | as declared |
| P7 | a predicate registered on the first row | the empty-registry clause | as declared |
| P8 | **product**: the driver records a decision AFTER entering its route | `r64`-`r67` steps | as declared |
| P9 | **product**: the fold drops a decision's key | `r64`-`r66` fold copy, the TV rows' RN-R26 clause | as declared |
| P11 | P1 with the CONTROL made a tautology | `r65`, routes | as declared — the literal is a second observer |
| P12 | P1 with the ROUTES literal made a tautology | `r65`, CONTROL | as declared — the control is a second observer |
| P13 | the runtime registers a gate type | the gate-type clause | as declared |

**13 of 15 as declared on the first pass; P1's declared set red on both of its runs, the extras being timing failures
in rows that predate this item; P2's declaration short by three clauses, each explained above.**

**Pass 2, on the FINAL tree** (the copy re-synced byte for byte with the shipped files: (r)'s line, the block's crash guard),
P13's anchor moved to the guarded `rt = buildUiRuntime(...)` and P2's set RE-DECLARED to include its three explained
clauses before the run: **15 of 15 as declared in node 24.20.0 AND 15 of 15 in deno 2.9.6**, no timing failure in either,
every touched file restored to its first digest. Logs `C:/tmp-w155/rule8-node2.out`, `rule8-deno.out`.

**There is no P10, and nothing was deleted to make the gap** (the readers' nit, R6): the ids were assigned while the set
was being written, P10 was the place held for a product probe on `switch`'s matching, and that probe was dropped
before any pass ran because W154's own provocations P9-P15 already narrow `switch`'s matching at L1 and L2 (S3 below is
the same judgement). The two compounds kept the numbers they had been given, P11 and P12.

**Pass 3, after the readers' items** (the copy re-synced byte for byte with the shipped files), with FIVE probes added
that reproduce the readers' surviving mutations, each declared before the run:

| probe | the reader's mutation | declared red set | node | deno |
|---|---|---|---|---|
| M1 | the `if`'s `value` 0.5 → 0.4 | the condition clause (R2) | as declared | as declared |
| M2 | `gte 0.5` → `gt 0.45` | the condition clause (R2) | as declared | as declared |
| M8 | FD-V41's finding names the WRONG route (the first) while still listing `likely` — `src/definition/validate.ts:1373`, in the copy | the validator and `start` observers (R3) | as declared | as declared |
| M11 | a gate type registered in the rows' OWN runtime — `examples/run-flow.ts`' `buildUiRuntime`, in the copy | the own-runtime clause ((s)) and the sibling clause | **declared set red**, plus block (2h)'s two clauses — the timing failure of What broke (5) | as declared |
| M12 | the `map / live-token` row moved onto the UI registry | the UI-rows literal (R1) | as declared | as declared |

The fifteen earlier probes, re-run: as declared in both runtimes **except P4** (`gte` → `gt`), which ALSO went red on the
new condition clause — R2 pins the operator, and P4's set was declared before R2 existed; in node it also caught
`uncloneable / OR-R6, threaded`'s timing failure. **P4 re-declared to include the condition clause and re-run alone:
as declared in node and in deno.** So, on the final tree: **20 of 20 as declared in deno after P4's re-declaration, and in
node 20 of 20 on their declared sets, M11's extra being a pre-existing timing failure.** Every touched file restored to
its first digest. Logs `C:/tmp-w155/rule8-node3.out`, `rule8-deno3.out`, `rule8-p4-node.out`, `rule8-p4-deno.out`.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the flow | `examples/flows/if-then-switch.flow.json` | all four rows; the L6 census (31 flows); the task-node census (213) |
| (2) four rows | `r64`-`r67`, `steps` on each | P1-P5, P8, P9; `ROW_KEYS`; `PER_ROW_SUBJECTS` |
| (3) the cross-row block | routes, CONTROL, empty registries, no gate type, the unwired document at load | P1, P3, P4, P6, P7, P11-P13; `CROSS_ROW_SUBJECTS` |
| (4) the censuses | `test/definition/wiring.test.ts` (31 flows, `fits: 76`), `spec/outcome-record.md` (19 of 213, 194), W98's census (825), `examples/README.md` (2602 / 168 since the readers, 69 labels, thirty-one flows) | the L6 census, `OR-R11`'s derivation, W98's clause, `X10` — each red in the copy before it moved |

**What broke.** (1) The first draft's `steps` literals wrote the top-level branch path as `''`; the spec says `-`
(re-take 4). (2) `typecheck:examples` refused `x.record.terminalState` on a `LogRecord` (a resolution record has none) —
found in the copy. (3) The spec census sentence first said TWO task nodes; the flow has three (`score`, `publish`,
`shelve`) — caught by re-reading against the derived 210 → 213. (4) The cross-row block first had no `catch`, so a throw
building its runtime would have been a crash with zero FAIL lines; given W141's guard before the readers. (5) **Timing
failures in rows that predate this item**, in about one L6 run in three here: `uncloneable / OR-R6, threaded` at its
400 ms backstop, block (2h)'s kill point K=21, and `tv-ingest / LAST-first`'s arrangement. None is in this item's rows;
each can turn the confirming gate red for a reason that is not this item's.

**The readers** — both RAN 2026-10-14 (their rows are in the gate table). **What was acted on**
is the Exceptions' R1-R7, each approved by the maintainer and recorded before its edit; none touches `src/**` or the
per-decision path. **Overlap: 2 shared subjects** — C1/S5 (*no gate type registered* read off a sibling runtime) and
C2/S4 (the unanchored *names the case*). **One DISAGREEMENT, recorded rather than resolved**: the conformity reader
judged the (r) narrowing to drop no coverage, which is true of the rows the tree has; the adequacy reader showed it drops
a FORWARD guard (S1, M12: the `map` row moved onto the UI registry, green in node and deno with the narrowed filter, red
with the old one). Both are right about different things; R1's literal is the guard put back.

**Left alone, with the reasons (R7).**

| finding | why it stays |
|---|---|
| S3 — an array case matching only its LAST value survives L6 | L1 and L2 kill it (W154's `switch` table and its L2 suite), and `FD-C8` places what the built-ins READ and how they match below L6; an exit artifact asserts the routes the spec's payloads take, not the matcher's every edge |
| C3 — strict matching, an unresolved key and an absent input are tested only below L6 | the same: `FD-C8`'s test clause names L1 and L2 for exactly these, and W154 owns them |
| C4 — four payloads for five routes | Choice 1 above: every payload that takes `then` also takes a `switch` route, so five cannot each be a route's own. **It belongs in P32's Record too**, which this item does not write |

**What this taught.** A substring observer over a message that LISTS its own alternatives proves nothing about which
one it named (C2/S4) — the anchored form is what a *names the case* claim has to be. And narrowing a selection to fix
one assertion can remove the only guard on the selection itself (S1): a narrowed filter needs a literal of what it now
excludes.

**Questions raised.** **[Q594](../questions/q594.md)**, DEFERRED — `spec/run-state.md:453`'s stale task-node figure (175
against the derived 213), the conformity reader's C5, raised rather than patched in passing. **Q595-Q598 unused, skipped.**
(r) and (s) were ASKED rather than raised (`doc/workflow.md` section 1 rule 6). *Editing `doc/questions/**` does not by
itself move an item to `gate:full` — CLAUDE.md names `doc/questions/README.md`, `scripts/check-register*.mjs` and
`scripts/state.mjs`, none of which this item edits — so the post-reader confirming run is `gate:item`, as the
coordinator asked; `gate:full` ran EXIT 0 on the pre-reader tree.*
