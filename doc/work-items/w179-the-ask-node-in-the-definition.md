# W179 — the ask node in the definition

**Status:** done 2026-10-17 — `npm run gate:item` EXIT 0 on the final tree, one command; both readers RAN, their in-`Owns` findings FIXED; S-1 and S-2 answered *"As recommended"*; no question raised; not committed — declared 2026-10-17 on `e375849` (W178 committed); P35's SECOND item: stop-and-asks (a) and (h) as answered, decisions 6 and 7; ADR 0108; the definition only — asking and answering in a run is W180's
**Plan:** [P35](../plans/p35-may-a-node-wait-for-a-person-by-design.md) — *may a flow declare a node that waits for a
person, keeps what reached it, and holds the person's answer to a schema?* — its second item. A seventh node KIND, `ask`:
`{ id, kind: 'ask', edges, settings?, answerSchema?, needs? }` — valid in a document, refused by every `Driver` at
`enter` until W180 runs one.

```
Spec:       spec/flow-definition.md v0.41 -> v0.42: section 2 gains the seventh kind and its subsection; the rules that
            ENUMERATE kinds are widened by name (decision 7) — FD-V7, FD-V9, FD-V17, FD-V21, FD-V23, FD-V24, FD-V25,
            FD-V26's note, FD-V27, FD-V29; FD-V47 (an ask carries a key only a task's worker reads) and FD-V48 (an ask's
            answerSchema is not in the schema subset) are new — 42 -> 44 refusals; section 3's wiring subsection says
            what an ask is on an arc; section 7 gains the new valid rows. spec/task-id.md v0.12 -> v0.13: an ask has a
            task id by the same scheme, though nothing is ever dispatched for it. spec/README.md: both rows.
Owns:       from P35's W179 row, exactly: src/definition/types.ts, src/definition/validate.ts,
            src/definition/regions.ts, src/definition/wiring.ts, src/definition/schema.ts, src/driver/driver.ts (the
            kind's refusal at `enter` until W180), spec/flow-definition.md, spec/task-id.md, spec/README.md,
            spec/examples/**, test/definition/**, scripts/check-spec.mjs, scripts/check-spec-selftest.mjs,
            examples/l6.ts (kind-literal sites the build finds), examples/settlement-cost.ts, index.ts, AGENTS.md (the
            WHOLE file, D′), scripts/check-docs.mjs, doc/decisions/0108-*.
            Exceptions: none declared. Anything else outside the row is a stop-and-ask, never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q663-Q666 only if raised),
            doc/decisions/** (ADR 0108 and its index line, pointers only otherwise), the plan's Record, README.md, this
            file.
Inputs:     P35 stop-and-asks (a) and (h) as answered, decisions 6, 7 and 8, facts 1, 6, 7 and 13, prediction 2,
            sentences B′, C, D′, E and the two brief sentences; the `map` precedent (v0.8, FIVE enumerating rules
            widened, the fifth found by a reader); W92's `gate` precedent (a valid kind a driver refuses until the
            next item; the L6 kind clause's dated exemption).
Outputs:    (1) src: `AskNode` in `FlowNode` (BREAKING — a consumer's exhaustive `switch` over `node.kind` stops
                compiling, P34 decision 10's form); the validator's seventh kind, FD-V47 and FD-V48, and every widened
                rule; the wiring check's ask (a PRODUCER of its `answerSchema`, never a consumer); the driver's `ask`
                arm in `enter()`, refusing the run by name until W180.
            (2) spec flow-definition v0.42, task-id v0.13, spec/README.md's two rows; spec/examples: the new valid
                flows and the FD-V47 and FD-V48 cases.
            (3) tests: test/definition/ask.test.ts (L1 and the driver's L2 refusal), and the census sites the change
                moves in test/definition/**.
            (4) AGENTS.md: section 3's kind table and every sentence the kind makes false, found by grep over the
                whole file (D′). ADR 0108.
Depends on: W178 (done, `e375849`)
Blocks:     W180
Tests:      L1 — expected values hand-written from the spec's rows, never from output: an ask accepted with each key
            alone and all together, at the entry, as a fan-out's branch entry, as a map's branch, inside a branch
            before a join, referenced by a later node's `needs` (FD-V27 admitted) and by an edge's; with and without
            `answerSchema`; a decline edge `on: ['failed']`; a `when` over `outcome.result`. Refused: each of the six
            task keys by FD-V47 ALONE (one finding per key, FD-V17 silent), `answerSchema` outside the subset by FD-V48
            alone, `settings` not a plain object by FD-V21, no `edges` by FD-V23, no done edge by FD-V7, `route` by
            FD-V41; each beside a control that differs by that one key. L2 — `new Driver` over an ask flow: `start()`
            on an entry ask rethrows `InvalidDefinition` naming the node, nothing handed to the scheduler; an ask
            after a task halts the run when that task settles, reported once, nothing handed on. L4 — the corpus:
            every existing document's verdict unchanged (prediction 2), the new valid flows clean, FD-V47's and
            FD-V48's cases each naming its rule; the wiring check over an ask's edges. One-clause mutations (sentence
            E) in the byte copy C:/tmp-w179/m.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 an `ask` accepted with each key and
            refused with each forbidden key by its own `FD-V`, its `answerSchema` held to the subset, a reference to it
            admitted by `FD-V27` and a `transform` on it refused; L4 the corpus — every existing document unchanged, the
            new valid and invalid documents each with its rule ids; the wiring check over an ask's edges.
Reserves:   Q663-Q666 (P35's per-item line); ADR 0108
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **Running an ask** — parking, the `asked` element, the kept input, the answer at `resolve()` and its schema, what a
  predicate sees, `OR-R8`: W180. Until then every `Driver` refuses one at `enter`.
- **An ask under run control** — W181. **The L6 row** — W182; the L6 kind clause exempts `ask` until then.
- **`doc/concept.md`** — W180 ((i)).

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations in
the byte copy `C:/tmp-w179/m`, each graded on the named suites' `FAIL` lines; then the readers; then `npm run gate:item`
once. Routing coverage: a branch routed away from its join (Q4) — an ask's decline edge routing out of a region to an
`end` is a VALID document (L1); `user_action` (Q17) — not applicable (no run); no matching decision edge (Q10) — FD-V7's
default edge required of an ask, L1; a duplicate task id (Q13) — not applicable (no dispatch; the scheme is task-id's
v0.13 prose); a nested fan-out (Q6) — an ask inside a map inside a fan-out branch, L1.

## What the declaration step measured

*Measured 2026-10-17. M1 is W178's confirming gate on the tree this item starts from (`e375849` is W178 committed,
`git status` clean); M2-M8 as the item was built, on the real tree, and M9 in the byte copy `C:/tmp-w179/m`
(`git archive HEAD` with this item's 23 changed and new files copied over, `cmp` clean per file, `node_modules`
copied, never linked; `find -type l` zero), node 24.20.0, deno 2.9.6, chromium.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline | W178's `gate:item` EXIT 0 on this tree: `check:spec` 7 / 75 / 142; `check:docs` 40 `run` snippets; L1-L5 69 files / 1882 cases in three runtimes; L6 2711 assertions in node and deno |
| M2 | **the `src/` change ALONE** (types, validate, wiring, driver; no test, no spec touched), `node test/runner.ts` | **2 cases RED**: `test/definition/needs.test.ts` *a reference to a node whose kind is not a task* (it quotes `FD-V27`'s message, *only a task produces an output*) and `test/definition/task-config.test.ts` *EVERY kind row agrees with FD-V17's key set* (the code declares an `ask` row the spec did not yet have). **Nothing quotes `FD-V24`'s kind list in an assertion** — only a COMMENT does, `test/driver/driver.test.ts:958` (S-1) |
| M3 | **the corpus document added** (a task-bearing `ask.flow.json` and an entry-ask flow, as first written) | two MORE red, both kind-or-corpus readers: `test/definition/needs.test.ts`'s FD-V29 oracle (*certainty is a STRICT subset of dominance*) — its `succOf` named the kinds whose `edges` are arcs and dropped the ask's, reading the two references past it as refused (4 against 0) — and **`test/fold/result-value.test.ts`'s OR-R11 census**, OUT of `Owns`, which derives *N of M corpus task nodes named by a `needs`* from the valid corpus and compares it to `spec/outcome-record.md` section 4's sentence (expected 20, the sentence says 19). The first is an oracle in `Owns`, widened by name; the second is S-2 and reading R8 |
| M4 | **P35 prediction 2**, by `C:/tmp-w179/pred2.ts`: every document under `spec/examples/` at `e375849`, validated by `e375849`'s `validateDefinition` and by this tree's, full findings compared; every wiring-corpus report and every L4 flow's `checkWiring` report compared | **96 compared: 93 byte-identical, 3 differ in a DETAIL only** — `invalid/FD-V12--branch-entry-is-the-join` (its `FD-V9` finding: *not a task or an ask*), `invalid/FD-V24--unknown-node-kind` (*…\|gate\|ask*), `invalid/FD-V25--map-branch-is-a-join` (*not a task or an ask*). *(This first named an `FD-V9--…` file, which is not the one: the conformity reader, G2.)* **No rule id and no `at` moved anywhere** |
| M5 | **B′ / D′ — census sites**, each by its lane | `LATE_SUITES` +1 (the W179 suite); `l4-corpus`'s kind list +`ask`; `task-config`'s kind-row regex and count (6 -> 7); `map.test.ts`'s copy of `KINDS`; `needs.test.ts`'s FD-V29 oracle (arcs, targets, readers); `FD-V27`'s message in `needs.test.ts` and in `gate.test.ts`'s label; `RUN_FLOOR` 40 -> 41 (one `run` snippet, `AGENTS.md` section 3); the refusal count 42 -> 44 in `spec/flow-definition.md`'s header, `spec/README.md` (headline, last count, *C4 covered*), `AGENTS.md`'s X7 sentence (range end `FD-V48`) and `validate.ts`'s header comment (which read 37, stale since v0.27 — corrected); `check:spec` 75 -> 79 examples (one valid, two invalid, and — after the readers, G3 — one WIRING document, `fits--an-ask-answer-into-a-bounded-consumer.flow.json`, with its section 7 row: a task -> ask -> task arc in the corpus, `fits: approve -> weigh`, and the arc into the ask given none), 142 -> 144 rules; the L1-L5 case count +1 for that document's per-file wiring case; the L6 kind clause one constructed input more, its COUNT unmoved. **Unmoved**: `DRIVER_FIELDS` / `NOT_RUN_STATE` (no `Driver` field), `RUN_FOR` (no fold input), `X10` (no L6 row), `wiring.test.ts`'s L4 arc census (70 — the corpus ask flow has no task consumer, R8) |
| M6 | **the kind-literal readers fact 1 names, classified** | `validate.ts` 12 — five WIDENED (`FD-V7`, `FD-V9`, `FD-V25`, `FD-V27`, `KINDS`), the rest about other kinds; `wiring.ts` 17 — three widened (inbound edges, `arrivingAt`, `produced`) and one arm added (`entryWalk`), the rest unmoved (a consumer is a task: `checkWiring`, `givenVerdict`, `schemaOf`); `regions.ts` 9 — **none forced**: `succ` reads any node's `edges`, `certainlySettled` treats them as disjunctive; one comment row widened; `driver.ts` 9 — **one forced** (`enter()`'s exhaustive `switch`, a compile error in all five lanes without an arm), the rest about `task`/`gate`/`map`/`join`; `check-spec.mjs` 6 and its self-test 1 — **none forced** (`C7` reads `task` nodes; `C4`'s count is derived; the self-test's count probes are count-agnostic), unchanged; `examples/l6.ts` 13 — **one forced**, the kind clause (R9); `examples/settlement-cost.ts` 1 — **not forced** (`if (n.kind === 'task')` filters), unchanged; `index.ts` — `export *` carries `AskNode` and `ASK_REFUSED_KEYS`, unchanged |
| M7 | **now-false statements**, `git grep` over the tree but `dev-dist/` and `node_modules/` for *six kinds*, *sixth kind*, the kind list, *only a task … task id / output*, *other three* | in `Owns` — rewritten: `spec/flow-definition.md` section 2 (*Six.*, *Only a `task` node … has a task id*), `FD-V26`'s note (*the other three kinds*), `src/definition/types.ts` `Needs` (*the other three*, stale since v0.23), `validate.ts`'s `FD-V26` comment, `AGENTS.md` sections 3, 7 and 11. Outside `Owns` — NOT edited: `test/driver/driver.test.ts:958` (S-1). History left: `AGENTS.md`'s 0.6.0 paragraph, `doc/plans/p12`/`p14`, `spec/run-state.md:398` (fold-input kinds), `driver.ts`'s W33 comments (*a sixth kind*) |
| M8 | **the type is BREAKING where P35 decision 8 says**: `AskNode` removed from `FlowNode` in the copy, `tsc -p tsconfig.json` | 15 `error TS` (every `'ask'` comparison and the driver's arm) — so a consumer's exhaustive `switch` over `node.kind` written against 0.7.0 meets the converse: a `never` check fails until it names `'ask'` |
| M9 | the browser lane on the first full run | RED once: `RunFailure.kind` is the error class's NAME and the bundle mangles it (`_InvalidDefinition`); the case now expects `InvalidDefinition.name`, as other suites compare `.name` |

## The author's provocations (before the readers)

`C:/tmp-w179/mutate.mjs` in the byte copy `C:/tmp-w179/m`, synced with the real tree (`cmp` per changed file, `find -type l`
zero); each probe's anchor checked against the CURRENT text (exactly one match), the file restored from its FIRST snapshot
and its SHA-256 compared after every probe; graded on the runner summary's `suite › case` lines over `node test/runner.ts
definition/` (the suite census, which a partial run always trips, excluded), and L1 on `examples/l6.ts`'s named check; a
module that cannot be imported graded CRASH; a time-out NO VERDICT (none occurred). **Grader controls**: CONTROL (no edit)
clean; GRADER-CRASH (a syntax error) graded CRASH, not KILLED. M8's type probe was run by hand beside the set.

**45 one-clause probes beside the two grader controls: 44 KILLED, 1 SURVIVED (W6, equivalent, declared before the run)** — the set of 43 run before the readers (*44* in the first report, a miscount: 42 killed and W6), RE-RUN in full on the post-reader tree with the readers' fixes checked in, plus **L2** (the adequacy reader's survivor, killed by the fifth L6 input) and **W8** (the G3 wiring document). Plus M8's type probe (KILLED at L0, 15 errors).

| id | the ONE clause broken | verdict |
|---|---|---|
| CONTROL | no edit — must come back clean | clean (the control) |
| GRADER-CRASH | a syntax error — must grade CRASH, not KILLED | CRASH (the grader control) |
| K1 | KINDS without ask | KILLED — 14 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| K2 | answerSchema not declared on an ask | KILLED — 8 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| K3 | needs not declared on an ask | KILLED — 7 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| K4 | settings not declared on an ask | KILLED — 8 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| K5 | edges optional on an ask (FD-V23 silent) — one clause, its requiredness, over the one row | KILLED — 1 case(s): *edges: required (FD-V23) and held as a task`s (FD-V7, FD-V18, FD-V…* |
| R1 | FD-V47 never fires — FD-V17 instead | KILLED — 3 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2a | type not refused by FD-V47 | KILLED — 3 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2b | pool not refused by FD-V47 | KILLED — 2 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2c | optional not refused by FD-V47 | KILLED — 2 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2d | retryPolicy not refused by FD-V47 | KILLED — 2 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2e | workerGroups not refused by FD-V47 | KILLED — 2 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2f | transform not refused by FD-V47 (decision 6) | KILLED — 3 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R2g | a seventh refused key (needs) — refuses a declared key | KILLED — 1 case(s): *the code`s lists are the spec`s: the ask`s declared keys and its s…* |
| R3 | the transform message is the generic one | KILLED — 1 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| R4 | FD-V47 findings filed under FD-V17 | KILLED — 3 case(s): *FD-V47 — each of the six task keys refused on an ask by FD-V47 ALO…* |
| S1 | ask settings shape never refused | KILLED — 1 case(s): *settings is opaque: any plain object accepted unread, anything els…* |
| S2 | an array settings accepted | KILLED — 1 case(s): *settings is opaque: any plain object accepted unread, anything els…* |
| S3 | null settings accepted | KILLED — 1 case(s): *settings is opaque: any plain object accepted unread, anything els…* |
| S4 | settings filed under FD-V33 | KILLED — 1 case(s): *settings is opaque: any plain object accepted unread, anything els…* |
| A1 | FD-V48 never fires | KILLED — 3 case(s): *FD-V48 — answerSchema held to the schema subset: in it accepted, o…* |
| A2 | FD-V48 detail drops where | KILLED — 1 case(s): *FD-V48 — answerSchema held to the schema subset: in it accepted, o…* |
| A3 | a non-object answerSchema escapes FD-V48 | KILLED — 1 case(s): *FD-V48 — answerSchema held to the schema subset: in it accepted, o…* |
| E1 | FD-V7 not asked of an ask | KILLED — 1 case(s): *edges: required (FD-V23) and held as a task`s (FD-V7, FD-V18, FD-V…* |
| E2 | FD-V7 names the wrong kind | KILLED — 1 case(s): *edges: required (FD-V23) and held as a task`s (FD-V7, FD-V18, FD-V…* |
| B1 | FD-V25 refuses an ask as a map branch | KILLED — 6 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| B2 | FD-V9 refuses an ask as a branch entry | KILLED — 5 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| B3 | FD-V9 message unwidened | KILLED — 1 case(s): *where an ask stands: wherever a task may — entry, branch entry, ma…* |
| F1 | FD-V27 refuses a reference to an ask | KILLED — 4 case(s): *FD-V27 admits a reference to an ask — on a node and on an edge — a…* |
| F2 | FD-V27 message unwidened | KILLED — 2 case(s): *FD-V27 admits a reference to an ask — on a node and on an edge — a…* |
| F3 | FD-V24 message unwidened | KILLED — 1 case(s): *the kind: FD-V24 accepts `ask` on every shape, with each declared…* |
| W1 | an ask sends no arc | KILLED — 2 case(s): *the wiring check: an ask is a PRODUCER of its answerSchema and nev…* |
| W2 | an ask produces as a non-task (schemaOf) | KILLED — 2 case(s): *the wiring check: an ask is a PRODUCER of its answerSchema and nev…* |
| W3 | the unchecked reason does not name the ask | KILLED — 1 case(s): *the wiring check: an ask is a PRODUCER of its answerSchema and nev…* |
| W4 | a malformed answerSchema handed to the witness | KILLED — 1 case(s): *the wiring check: an ask is a PRODUCER of its answerSchema and nev…* |
| W5 | an ask branch does not arrive at its join`s record | KILLED — 1 case(s): *the wiring check: an ask is a PRODUCER of its answerSchema and nev…* |
| W6 | the entry walk`s ask arm removed (expected EQUIVALENT: falls through to no arm) | **SURVIVED — EQUIVALENT, declared before the run** |
| W7 | the arc carries an empty schema, not the answerSchema | KILLED — 2 case(s): *the wiring check: an ask is a PRODUCER of its answerSchema and nev…* |
| D1 | the ask arm returns silently | KILLED — 1 case(s): *the driver refuses a run where a branch ENTERS an ask, by name, un…* |
| D2 | the refusal does not name the node | KILLED — 1 case(s): *the driver refuses a run where a branch ENTERS an ask, by name, un…* |
| D3 | the refusal carries a rule id | KILLED — 1 case(s): *the driver refuses a run where a branch ENTERS an ask, by name, un…* |
| P1 | section 2`s ask row drops answerSchema | KILLED — 1 case(s): *and EVERY kind row agrees with FD-V17`s key set, both ways — the adequ…* |
| P2 | FD-V47`s row drops transform | KILLED — 1 case(s): *the code`s lists are the spec`s: the ask`s declared keys and its s…* |
| L1 | the L6 kind clause exempts nothing | KILLED — L6 node: exit 1, 1 failed, the named check *L6 runs a flow containing every node kind the spec corpus expresses* |
| L2 | the exemption`s third disjunct — exempt and in NO corpus flow — removed (the adequacy reader`s survivor) | KILLED — L6 node: exit 1, 1 failed, the named check *L6 runs a flow containing every node kind the spec corpus expresses* |
| W8 | the wiring ask document`s answerSchema widened past the consumer`s bound — its row says fits | KILLED — 1 case(s): *fits--an-ask-answer-into-a-bounded-consumer.flow.json: its ver…* |

**Every survivor, argued.** **W6** — the explicit `if (n.kind === 'ask') return;` in `entryWalk` removed: an ask then falls
through `seen.add` to no arm and returns nothing, which is the same walk, so the line is EQUIVALENT and kept as the
statement of why (declared before the run). **K5's first cut** CRASHED as a malformed mutant (two edits that nested an
array) and was re-cut as ONE clause — the requiredness of `edges` over the one row — and KILLED.

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **`FD-V47` owns all six keys, `transform` among them, ONE finding per key, and `FD-V17` is silent for them** | the plan says *refused (`FD-V47` on)* and the brief *each by its own `FD-V` finding*: one finding per key, under the one rule that owns the key on an ask — `FD-V41`'s precedent for `route`. `transform` is not its own id: `FD-V28`'s precedent gives a new id to a different FIX, and the fix is the other five's (delete the key). A wrong-shaped value of one of the six on an ask is `FD-V47` alone — no task rule (`FD-V30`, `FD-V31`, `FD-V37`) is asked of a key the ask may not carry | `FD-V47`'s row, ADR 0108 rule 7 |
| **R2** | **`FD-V48` is `schemaProblem`'s verdict, under its own id** | fact 7: the same code as a worker's schemas. Its own id rather than `FD-V21`'s, on `FD-V33`'s precedent — the fix is in the schema | `FD-V48`'s row |
| **R3** | **an ask's `settings` not a plain object is `FD-V21`** | opaque settings have no type and no schema, so neither `FD-V33` (a node TYPE's worker) nor `FD-V40` (a gate TYPE's) is the rule; the shape is the whole check, and that is `FD-V21`'s *a declared key of the wrong type* | `FD-V21`'s row |
| **R4** | **`FD-V9` and `FD-V25` widened: an ask may be a fan-out's branch entry and a map's branch** | (a): *allowed anywhere a task is* and *one per map item*. Both rules' reasons (a branch entry is non-`end`, so `FD-V19`'s derived clause holds; map-inside-map only through the entry's edges) hold of an ask | both rows |
| **R5** | **`FD-V7` holds an ask's edges in full** — a `done` edge required, the default per state | (h): an ask routes as a task's settlement does; a `done` answer must have somewhere to go, and a decline with no `on: ['failed']` edge is what it is on a task (W180's to run) | `FD-V7`'s row |
| **R6** | **the driver's refusal is at `enter`, the plan's letter — not at construction, W92's measured precedent** | the row says *the kind's refusal at `enter` until W180*. W92 refused its gate at CONSTRUCTION because a refusal at `enter` lets a task BEFORE the node run first — and that is so here: an ask after a task halts the run when the task settles (the L2 case asserts it). It throws, as the gate arm does, so `start()` reports and rethrows (an entry ask: nothing dispatched) and a scheduler event's step reports and halts (`OR-R10`). The alternative — construction, with the arm unreachable — is one item wide either way: W180 replaces the arm | `enter()`'s comment, ADR 0108 rule 8 and consequences |
| **R7** | **the wiring check reads an ask as a PRODUCER and never a CONSUMER**; an arc into it gets no verdict; it ends the `FD-R4` entry walk | its output is the answer (`answerSchema`, else `unchecked` naming the ask; a schema outside the subset `unchecked` naming `FD-V48`, never handed to the witness); it has no worker and so no `inputSchema` to hold what reaches it, as a gate or a join has none; what leaves it is never the payload | `spec/flow-definition.md` section 3, `wiring.ts`'s header |
| **R8** | **the corpus's valid ask flow is ASKS AND ENDS ONLY — no task, no region** | M3: a task-bearing ask flow moves `spec/outcome-record.md` section 4's census sentence (OUT of `Owns`, S-2), and a region-bearing one is RUN by `test/driver/needs.test.ts`'s census (OUT of `Owns`) where the driver refuses an ask until W180. The task-bearing, region-bearing and nested shapes are `test/definition/ask.test.ts`'s fixtures. **A departure from the plan's spirit** (a realistic corpus flow), so S-2 asks it | section 7's row, ADR 0108's consequences |
| **R9** | **the L6 kind clause exempts `ask` until W182**, with a FOURTH constructed input (`ask` present at L6 while exempt must be named) | W92's dated-exemption form: no L6 row can run an ask before W180 and the row is W182's | `examples/l6.ts` |
| **R10** | **an ask's task id: attempt always `0`**; what `ID-R1` and `ID-R4` say of an id nothing dispatched is left to W180 | (a) gives the address; nothing re-dispatches an ask (`RS-R2`) | `spec/task-id.md` v0.13 |
| **R11** | **`AGENTS.md` says a run cannot use an ask yet** (sections 3, 7, 11) and gains ONE `run` snippet (validation only) | D′: the whole file; the kind is consumer-visible in the table, and a reader must not build on running it before W180 | — |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-17 (*"As recommended"*): S-1 left to W180, S-2 corpus task-free and the realistic flows W180's

| | the question | recommended | the alternative |
|---|---|---|---|
| **S-1** | **`test/driver/driver.test.ts:958`** — a COMMENT quoting `FD-V24`'s message as *`task\|fanout\|map\|join\|end\|gate` (the list gained `gate` at v0.23, W92)*, now short by `ask`. Out of `Owns`; no assertion reads it | **Leave it to W180**, whose row owns `test/driver/**`: one phrase, in the item that next edits that suite | **Widen W179's `Owns`** by the one phrase now |
| **S-2** | **The corpus's ask flow is task-free (R8)** because a task-bearing one moves `spec/outcome-record.md` section 4's derived census (*"**19 of N** corpus task nodes … named by none"*, held by `test/fold/result-value.test.ts`'s OR-R11 suite), both out of `Owns`; a region-bearing one would be RUN by `test/driver/needs.test.ts` and refused | **Keep W179's corpus task-free and hand the realistic shapes to W180**, whose row owns `spec/outcome-record.md`, `test/fold/**` and `test/driver/**`: W180 adds a task-bearing, region-bearing ask flow to `spec/examples/valid/` and moves the sentence with it, once the driver runs an ask | **Widen W179's `Owns`** by that one sentence (`spec/outcome-record.md` v0.17 -> v0.18 and its `spec/README.md` row) and restore a task-bearing `ask.flow.json` (task -> ask -> task) now; the region-bearing shape waits for W180 either way |

**The `gate:full` question, confirmed**: `doc/workflow.md` v0.29 and `CLAUDE.md` name `scripts/check-register*.mjs`,
`scripts/state.mjs` and `doc/questions/README.md` as the edits that make an item run `gate:full`; `scripts/check-spec*.mjs`
is not among them — and this item did not edit either (M6). `gate:item` is the confirming gate.

## Notes for W180 and W181

- **The driver's `ask` arm in `enter()` is W180's to replace** with the park; ADR 0108 rule 8 and the arm's comment say
  so. W180's B′ copy will find the refusal's L2 case in `test/definition/ask.test.ts` (*the driver refuses a run …*) —
  its designed expiry, as W92's construction refusal was W93's (rewrite it to assert the park).
- **S-2's realistic corpus flow** (task -> ask -> task, an ask in a fan-out branch before its join) is W180's if the
  maintainer takes the recommendation; it moves `spec/outcome-record.md` section 4's census, `test/driver/needs.test.ts`'s
  region census (by RUNNING), `wiring.test.ts`'s L4 arc total, and the L6 kind exemption stays until W182.
- **`boundaryTargets` / `entryTasks` stop at an ask** (R7) — `FD-R4`'s start boundary holds nothing at an entry ask;
  the resolve boundary reading `answerSchema` is W180's (`driver.ts:2166` reads a task's type only).
- **`ID-R1`/`ID-R4` and an id nothing dispatched** (R10), **`isSuspended`'s five readers** and **`schedulerTimestamp`'s**
  readers are W180-W181's (P35 facts 2 and 5).
- **The L6 kind clause's exemption** (R9) expires LOUDLY the day W182's row runs an ask: remove `NOT_YET_AT_L6`'s entry
  and the fourth input's meaning changes, as W94 did for `gate`.
- `README.md`'s feature table names no ask yet — W180 or W182 adds the row when a run can use one.
- **S-1 (ruled: W180's)** — `test/driver/driver.test.ts:958`'s comment quoting `FD-V24`'s old list.
- **S-2 (ruled: W180's)** — the task-bearing and region-bearing ask flows in `spec/examples/valid/`, moving
  `spec/outcome-record.md` section 4's OR-R11 census sentence with them (`test/fold/result-value.test.ts`).
- **G1 — JP-R5's ordering clause becomes LOAD-BEARING at W180** (the conformity reader). `spec/join-policy.md`'s
  *JP-R5's ordering clause is currently unfalsifiable, and that is `FD-V9` doing it* (and its v0.12 note) rests on
  *every branch entry is a `task`, and entering a task dispatches without emitting*. W179 relaxed `FD-V9` and `FD-V25` to
  admit an ask; it is harmless today only because the ask arm THROWS without emitting. W180's park emits
  `branch.suspended` on entering a branch-entry ask ((b)), so the order becomes observable: the two-pass `branch.opened`
  loops at `driver.ts` (the fan-out arm and the map arm) are then its only guarantor, and **no test distinguishes an
  interleaved loop**. `src/fold/policies.ts`'s `arrivalCount` comment rests on the same premise. W180 owns
  `spec/join-policy.md`: rewrite that section (consequence 1 fires) and add an L2 case over a fan-out whose branch
  entry is an ask that fails under an interleaved emission. W179 edited neither file (out of `Owns`).
- **The same premise in comments W179 does not own**, each still true of its conclusion and false of its premise
  (*a branch entry is a task*): `test/driver/hold.test.ts:345`, `test/driver/surface.test.ts:388` (W180's
  `test/driver/**`), `test/scheduler/runtime.test.ts:1700` (W180's `test/scheduler/**`), `examples/workers/shard.ts:5`
  (W182's `examples/workers/**`), and `doc/questions/q118.md`'s deferral note (*waits on FD-V9 being lifted* — it was
  widened by W179; the two arguments stay unobservable while the ask arm throws, so the deferral's condition is
  W180's). Handed on under S-1's ruling — comments in the owner's files — not raised as new stop-and-asks.
  `examples/l6.ts:253` (in `Owns` at kind-literal sites only) says the same of a fan-out's entries and its conclusion,
  *a map cannot BE a branch*, still holds; left.


## Readers — round 1 (2026-10-17), and what was acted on

*Both readers ran with fresh contexts, spec first; each reported and fixed nothing. The in-`Owns` findings were applied by
the author at the coordinator's direction; S-1 and S-2 were answered by the maintainer (*"As recommended"*).*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | code conforms to (a) and (h) | — | — |
| conformity | **D1-D7** — the missed widening, `map` v0.8's family again: `spec/flow-definition.md`'s map key table (*`branch` … whose kind is a `task`*), the `map` subsection (*`FD-V25` makes a map's `branch` a `task` and `FD-V9` a fanout's entries tasks*), the gate subsection (*`FD-V9` and `FD-V25` keep those a `task`*), the route row (*the routing rules below are a `task`'s and a `join`'s*), section 4's derivation (*must name a `task`*), `FD-V19`'s derived clause (*`FD-V9` requires every branch entry to be a `task`*), `MapNode.branch`'s public JSDoc; minor — `validate.ts`'s `FD-V25` comment, two `driver.ts` comments, `gate.test.ts`'s label, `sibling-regions.test.ts`'s docblock | DEFECT in the text (in `Owns`) | **FIXED**, each by name. The author's re-grep for the family (*is a task*, *a task (FD-V*, *entries tasks*, *branch entry is*, *not a task*) found two more in `Owns` — `FD-V27`'s *not a `task`* in the gate subsection and `AGENTS.md` section 17's *a `map`'s branch is a TASK* — FIXED; and five out of `Owns`, handed on under S-1's ruling (Notes) |
| conformity | **G1** — JP-R5's ordering clause becomes load-bearing once `FD-V9`/`FD-V25` admit an ask | hand-on | **Written into the Notes for W180** (W180 owns `spec/join-policy.md`); not edited |
| conformity | **G2** — prediction 2's verdict not stated; M4 named the wrong file | text | **FIXED** — M4 corrected; the verdict is the Record's |
| conformity | **G3** — the gate's *wiring check over an ask's edges* met only at L1, not L4 | gap (in `Owns`) | **FIXED** — `spec/examples/wiring/fits--an-ask-answer-into-a-bounded-consumer.flow.json` (task -> ask -> task, a decline edge to an `end`) with its section 7 row; its verdict is `fits: approve -> weigh` and nothing for the arc INTO the ask. The OR-R11 census reads `valid/` and `examples/flows/` only, so it does not move |
| conformity | **G4** — the region L2 case did not assert `added`; with the ask as a fan-out's SECOND branch at the entry, `start()` throws AFTER handing the first branch's task to the scheduler, and nothing cancels it | gap (in `Owns`) | **FIXED** — the case asserts `added` on the ask-first shape and a new ask-second shape (`r1:other:0:0` sent, no cancel, `halted`); stated in ADR 0108's consequences and `AGENTS.md` section 3 |
| adequacy | 46 probes, 45 killed; verdict ADEQUATE | — | — |
| adequacy | **survivor**: the L6 exemption's *exempt and in no corpus flow* disjunct untested | gap (in `Owns`) | **FIXED** — the fifth constructed input; the author's L2 now KILLED |
| adequacy | note: *every existing document unchanged* is held durably only by l4's *the named rule among the findings*; the full-findings comparison is the one-shot `pred2.ts` | note | **Decided: the evidence is the script, recorded (M4), and no durable pin is added** — a test pinning each invalid document's full finding set would be a snapshot of today's output (`doc/workflow.md` section 5 rule 2), and the item that next widens a message would update it rather than read it |
| adequacy | note: FD-V48's *where* substrings are `schemaProblem`'s path format — output-shaped | note | **Accepted and stated**: the paths (`$.properties.code`, `$.examples[0]`) are the format section 3's subset rules name and the ones a registry refusal already prints; A2 kills a detail that drops them |

**The readers' overlap: ONE shared subject** — the L4 corpus's weakness for this item: the conformity reader's G3
(*the wiring check over an ask's edges is met only at L1*) and the adequacy reader's *every existing document unchanged
is held durably only by l4's rule-among-findings*. Two different findings on one subject — what the L4 corpus does and
does not hold of the ask — which section 6 counts as one. Every other finding was one reader's.

**The rulings (maintainer, 2026-10-17, *"As recommended"*).** S-1 — `test/driver/driver.test.ts:958`'s comment is left
to W180. S-2 — `spec/examples/valid/`'s ask flow stays task-free; W180 adds the task-bearing and region-bearing ask flows
and moves the OR-R11 census sentence; the G3 wiring document is this item's and is in.

## Record

*Filled 2026-10-17, after the readers' round, the fixes and the maintainer's rulings. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | tree held still, digest equal at both ends: lint 154 files; `check:spec` 7 / 78 / 144; `check:docs` 41 `run` snippets; L1-L5 70 files / 1897 cases in node, deno and chromium; L6 2711 assertions, 0 failed, node and deno (`C:/tmp-w179/gate.log`) |
| L1 — an `ask` accepted with each key, refused with each forbidden key by its own `FD-V` | RAN — green | `test/definition/ask.test.ts` on four shapes (after a task, the entry, a fan-out's branch entry before its join, a map's branch): every declared key alone and together; each of the six task keys `FD-V47` alone, one finding, beside the same key accepted on a task, and wrong-shaped values still `FD-V47` alone; a key no kind declares `FD-V17` |
| L1 — `answerSchema` held to the subset | RAN — green | `FD-V48` alone on seven out-of-subset schemas, naming where; four in-subset accepted |
| L1 — a reference admitted by `FD-V27`, a `transform` refused | RAN — green | a node's and an edge's `needs` naming an ask accepted; a fanout beside it still `FD-V27` with the widened sentence; `FD-V28` and `FD-V29` asked of an ask; `transform` `FD-V47` naming `FD-C6` |
| L2 — the driver's refusal until W180 | RAN — green | entry ask: `start()` throws `InvalidDefinition` naming the ask, nothing sent, `halted`; an ask after a task: halted on the settlement, reported once; an ask as a fan-out's first branch: its sibling never sent; as the SECOND: the sibling sent, no cancel, `halted` (G4) |
| L4 — every existing document unchanged | RAN | the l4 suites (each invalid document names its rule, each valid one clean) and M4's one-shot full-findings comparison: 96 compared, no rule id or `at` moved, 3 details widened |
| L4 — the new valid and invalid documents, each with its rule ids | RAN — green | `valid/ask.flow.json` clean; `FD-V47`'s case exactly `[FD-V47, FD-V47]` at `approve`, `FD-V48`'s exactly `[FD-V48]` |
| L4 — the wiring check over an ask's edges | RAN — green | `spec/examples/wiring/fits--an-ask-answer-into-a-bounded-consumer.flow.json` (G3): `fits: approve -> weigh`, the arc into the ask given none; and at L1 the producer, `no`, `unchecked`, `needs`, record and entry cases |
| conformity reader | RAN | D1-D7 FIXED (and two more the re-grep found); G1 handed to W180; G2-G4 FIXED |
| adequacy reader | RAN | 46 probes, 45 killed; the survivor FIXED (fifth L6 input); two notes decided |
| the author's probes, re-run after the readers | RAN | 45 one-clause probes + 2 grader controls (CONTROL clean, GRADER-CRASH CRASH): **44 KILLED, W6 SURVIVED (equivalent, declared)**; no NO VERDICT; every file restored, digest equal (`C:/tmp-w179/mut-full.json`, `C:/tmp-w179/mut.json`) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w179/gateitem.log`), digest equal at both ends | the ladder: lint 154 files, `check:spec` 7 / 79 / 144, `check:docs` 41 `run` snippets, L1-L5 70 files / 1898 cases in node, deno and chromium, L6 2711 assertions 0 failed in node and deno; selftests 10/10 ok (971 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `AskNode` in `FlowNode` | yes | M8: 15 TS errors with it removed |
| (1) the validator's seventh kind, `FD-V47`, `FD-V48`, the widened rules | yes | K1-K5, R1-R4, S1-S4, A1-A3, E1-E2, B1-B3, F1-F3 |
| (1) the wiring check's ask | yes | W1-W5, W7, W8 (W6 equivalent) |
| (1) the driver's `ask` arm | yes | D1-D3 |
| (2) spec flow-definition v0.42, task-id v0.13, `spec/README.md`, the corpus | yes | `check:spec` (C4 at 44, C8), P1, P2, the l4 suites, W8 |
| (3) the tests | yes | the probe table |
| (4) `AGENTS.md`, ADR 0108 | yes | `check:docs` X4 (41 snippets, the ask snippet asserting `FD-V47`/`FD-V48`), X7 (44 over `FD-V1` … `FD-V48`); `check:markdown`/`check:register` for the ADR |
| the L6 kind clause's exemption | yes | L1, L2 |

**P35 prediction 2 — clause 1 HELD, clause 2 REFUTED.** *"Every document under `spec/examples/` validates as before"*:
HELD — 96 documents and reports compared (M4), no rule id or location moved; three findings' DETAILS widened (`FD-V9`,
`FD-V24`, `FD-V25`). *"The only assertions that flip are those quoting `FD-V24`'s kind list"*: REFUTED — **no assertion
quotes `FD-V24`'s list** (a comment does, S-1), and what flipped was `FD-V27`'s message (`needs.test.ts`), the
`task-config` kind-row census (the spec's table), the FD-V29 oracle (`needs.test.ts`, a kind-listing walk), and the
out-of-`Owns` OR-R11 census (`test/fold/result-value.test.ts`), which the first, task-bearing corpus flow moved — R8
and S-2.

**The readers' overlap: ONE shared subject** — the L4 corpus's hold on the ask (conformity G3; adequacy's *every
existing document unchanged is held durably only by l4*).

**The rulings (maintainer, 2026-10-17, *"As recommended"*).** S-1 — left to W180. S-2 — `valid/` stays task-free; W180
adds the task-bearing and region-bearing ask flows and moves the OR-R11 census.

**Census moves.** `LATE_SUITES` +1; l4's kind list, `map.test.ts`'s `KINDS` copy, `task-config`'s kind rows (6 -> 7),
`needs.test.ts`'s FD-V29 oracle; `RUN_FLOOR` 40 -> 41; refusals 42 -> 44 (spec header, `spec/README.md` three times,
`AGENTS.md` X7, `validate.ts`'s header); `check:spec` 75 -> 79 examples, 142 -> 144 rules; L1-L5 69 / 1882 -> 70 /
1898; L6 unmoved at 2711 (one check, five inputs); `wiring.test.ts`'s L4 arc total unmoved at 70; `DRIVER_FIELDS`,
`NOT_RUN_STATE`, `RUN_FOR`, `X10` unmoved. **New public surface**: `AskNode`, `ASK_REFUSED_KEYS` (by `index.ts`'s
`export *`); **BREAKING**: `FlowNode`.

**What broke.** Nothing shipped broke. The item's own first cut missed seven statements of the `map` v0.8 family
(*a branch entry is a task*), found by the conformity reader — decision 7 was followed for the RULES and not for the
prose that restates them.

**What this taught.** *For the retro*: decision 7's *every `FD-V` whose text enumerates kinds* is the wrong grain —
the enumerations a widening falsifies live as much in DERIVATIONS and subsection prose (`FD-V19`'s derived clause,
section 4's map derivation, the gate's *where it may stand*, JP-R5's guarantor paragraph in another spec) as in rule
rows; `map` v0.8 lost its fifth widening the same way.

**Questions raised.** None (Q663-Q666 SPENT, unissued). **Closed.** None.
