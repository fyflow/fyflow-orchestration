# W63 — A transformed join on real workers

**Status:** done — 2026-09-13, on real workers in both L6 runtimes; P17 is complete pending its retro
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

```
Spec:       none — this item writes no rule; it demonstrates FD-C6 and Q263 on a
            real FyflowScheduler in both L6 runtimes
Owns:       examples/**
Inputs:     P17's exit artifact paragraph and decisions 5, 7 and 8, read from the
            PLAN's own file; fact 5 (the singleton rule and the empty join)
            re-run from dev-dist/p17/facts.mjs; W61's FD-C6 and W62's adapter;
            JP-R12 (a join carries the arrived results keyed by branch path,
            `{}` when nothing arrived); ADR 0046 rule 3 (the successor is the
            last thing that sees the collection whole); examples/l6.ts's
            ROW_KEYS, CROSS_ROW_SUBJECTS and DECLARED_TOTAL discipline
            (W35, W47, W55).
Outputs:    (1) examples/flows/transformed.flow.json: a fanout of two typed
                scorers into a join whose typed successor declares
                `transform: { lang: "jsonata", expr: "$sum([*.score])" }` and
                NO reshaping node, and a typed map branch whose transform
                reshapes its own item — with the map's settings read through
                `$settings`
            (2) L6 rows at arity TWO, ONE (a branch routed away, P1's own case
                under liveToken) and ZERO (a join nothing reached, so the
                successor's input is the transform over `{}`), each asserting
                what the successor's worker RECEIVED from the run and not from
                a literal — Q263 as three rows, and the discriminating pair
                between arity one and two asserted (v0.13 change 3)
            (3) an L6 row where the transform FAILS at run time (a type error,
                `1 + "a"`'s shape) on a non-optional node, the run parked as
                `user_action`, resolved by the harness with the value the
                transform did not supply, and the run completing — decision 5
                measured end to end
            (4) what reverting W61, W62 and W63 EACH costs, in L6 failures, on
                the tree this item ships, with every existing row unmoved
            (5) examples/README.md and the flow-worker's role table updated
Depends on: W62
Blocks:     nothing
Tests:      expected values from spec/ (JP-R12 for the record's shape, FD-C6 for
            what the worker receives) and from jsonata's documented semantics,
            never from output. The arity-two and arity-one rows' expected
            values SWAPPED must fail; the transform deleted from the flow must
            fail the arity-two row by the worker receiving the raw record;
            the reshaping node re-added must leave the row green (it is the
            road this plan removes, not forbids).
Gate:       L6 in both runtimes, redirected and read by exit code, at the
            pre-item numbers plus this item's rows; three revert runs; rule 8
            over ROW_KEYS/CROSS_ROW_SUBJECTS/DECLARED_TOTAL; then
            spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q274-Q277
```

## Scope

**In**

1. **The exit artifact**, at three arities, on real workers, in both runtimes.
2. **The run-time failure road** end to end — the only place decision 5's `user_action` consequence
   can be observed with a person (the harness) in the loop.
3. **The three revert costs**, the plan's headline numbers, taken last on the tree that ships.

**Out**

- **Any rule or refusal** — an exit artifact writes no rule (W43, W47, W51, W55, W59).
- **A second flow shape for the EXIT ARTIFACT** — `transformed.flow.json` carries the reduction, the
  reshaped map item and the `needs`-composed kind; if a reader's finding needs a second, it is added
  here, not in a new item. *(This read *"one flow carries the four `input` kinds `FD-C5`
  enumerates"*, and it cannot: its entry must return an array for the map, so it is an untyped
  `SplitWorker`, and `FD-C5`'s FIRST kind with a SUCCESSFUL transform is carried by the fourth
  branch of the failure-road document — the adequacy reader. And Output (3)'s failure road is a
  second document by NECESSITY, not a scope change: a transform is declared text and fails on every
  run of its document, so a failing node cannot share the exit artifact's document without parking
  its three arity rows — both readers reached the same reading. Corrected under section 6 pass 3
  rule 6.)*

## Exceptions

| path | why |
|---|---|
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted from W58's and W59's tables: the corpus split moves with every L6 flow — **and it did, twice**: 15 / 155 / 140 → 16 / 165 / 149 for the two flows, → 16 / 166 / 150 for the readers' fourth branch, each move told to the sentence by `test/fold/result-value.test.ts` going red (the `split` probe is that catch, checked in) |
| `AGENTS.md` | **PREDICTED in the brief, late on this file**: section 13's last paragraph said *two* worked typed flows run in `examples/` and there are four; and the sentence near line 1453 said *thirteen* worked flows over a directory that had held twenty-two for two plans — a count in prose no check reads, now carried as none. The conformity reader found the row absent from this table |
| `scripts/check-markdown.mjs` | predicted NOT to fire; checked against `M4`'s fixture before the first document is written — **and it did not**: `M3` 88 against 90 and `M4` 3742 against 3960 before, 3766 against 3960 on the tree that ships; not edited |
| `scripts/build-browser-tests.mjs`, `deno.lock`, `package-lock.json`, `scripts/check-scheduler-selftest.mjs` | predicted NOT to fire in the brief; none was edited (the browser bundle's `examples/flows/*.json` walk picked the two documents up itself, which probe `e6` binds) |

## Verification

| clause | command |
|---|---|
| L6 | `npm run test:l6`, `npm run test:l6:deno`, redirected, read by `$?`; baseline W62's shipped numbers, from **1281 assertions over 46 real runs** at `4c269d4` |
| revert costs | three L6 runs with W61, W62 and W63 reverted in turn, each read by exit code and failure count |
| readers | conformity: `JP-R12` and `FD-C6` first, every expected value re-derived on paper before a row is read; adequacy: isolated copy, the rows' literals and bounds mutated |

*Routing cases: a branch routed away from its join (Q4) — **covered**, the arity-one row;
`user_action` (Q17) — **covered**, output 3; no matching decision edge (Q10), duplicate task id
(Q13) — not applicable; nested fan-out (Q6) — not applicable unless a reader asks for the typed map
inside a fanout branch, which W59's `typed-regions` already runs.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w63/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); rule 8's harness (`dev-dist/w63/rule8.mjs`, W62's with a
`browser` and an `l6deno` rung) carries a control, asserts every restore byte for byte, checks each
edit's anchor against the CURRENT text, undoes what an aborting probe applied, RUNS every declared
ceiling against the rung its reason names, re-runs W62's ceilings whose values this item touches or
predicts unmoved, and holds the tree still by a content digest. **Every expected value of the four
rows was written from the flow text, `JP-R12`, `FD-C6`, ADR 0051 rule 3 and JSONata's documented
semantics before the file was run, and every row passed on its first run; the only red lines on that
run were the two count gates** (below).

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | Started on `9dacecd` (W62 committed), digest `a35eddac8751eee6` over 294 files re-taken and equal to the brief's; the one `node.exe` the desktop app's, the last `dev-dist/` write twenty minutes before. P17 fact 5 re-run by `dev-dist/p17/facts.mjs` under Node 24.20.0 and Deno 2.9.6 against the REPOSITORY's `jsonata` (a file URL into `node_modules`, no scratch install): `*.score` `[40, 20]` at two matches, the SCALAR 7 at one, `$sum(*.score)` `undefined` over `{}` and `$sum([*.score])` 0 — identical in both, digest unmoved; fact 0 prints `envelope: 0, sameLine: false` ([Q253](../open-questions.md), not patched). Baseline RE-TAKEN, every exit 0: **38 / 979 in five runtimes, L6 1281 / 46 in both, spec 7 / 55 / 104 with 35 refusals, check-spec self-test 29, check-source self-test 60, docs 28 / 22, markdown 116 / 5089 / 257, census 212 / 159 / 2 / 51**, digest identical before and after. `M3` **88 against 90** and `M4` **3742 against 3960** on a scratch copy outside the repository before any document (W62 recorded 3741). **Two facts of this item's own before a row was written**: which JSONata expressions MARK the arrays they return — `$keys($)`, `$.*`, `*.score`, `$map`, `$each` marked; `[*.score]`, `[a, b]`, `$split` plain — so the map branch's reshape carries `$keys($)` and a worker can observe ADR 0052 rule 6 on a real marked array; and `$.confidence + " points"` throws `T2002` exactly as `1 + "a"` does, an author who meant `&` |
| stop-and-ask | none needed | Nothing on the list fired: no spec rule and no ADR; `src/**` and `test/**` untouched; a typed node with no transform receives `FD-C5`'s two keys (`a15`); every existing row's numbers unmoved but for the ONE clause every row gained (pool languages, asserting *no pool carries one* on forty-two rows); the join at arity zero FIRED under `live-token`; W62's revert observed at 19, not 0. **The second flow document is a NECESSITY of Output (3) rather than a scope change**: a transform is declared text and fails on every run of its document, so a failing node cannot share the exit-artifact document without parking its three arity rows — both readers reached the same reading; the Scope sentence is corrected below under pass 3 rule 6 |
| L0 | GREEN | `lint` 0; `typecheck` 0 across all five sub-typechecks — once red on the reshaping-road fixture's `flatMap` over the node union, cast |
| L1-L5 | GREEN | **38 / 979 in node, deno, chromium, firefox and webkit, unmoved** — the declared result for an exit artifact. `test/fold/result-value.test.ts` moved the corpus split it derives from both corpora, as predicted from W61's table: **16 of 166 task nodes named by a `needs`, 150 (90%)** from 15 / 155 / 140, stated in two spec documents (declared exceptions) |
| L4 | GREEN | `check:spec` 7 / 55 / 104, 35 refusals, unmoved |
| L6 | GREEN | **1501 assertions over 50 real runs in node AND deno**, from 1281 / 46 — four rows (three `transformed` at 38, `transform-fails` at 51), one clause on every existing row (+42), ten cross-row assertions in block (2d) and three from W43's per-row node-`needs` clause the `transformed` rows reach. The rows' first run reported 1497 against a `DECLARED_TOTAL` of 1494 written from the arithmetic — the three were W43's clause, which no extras count; 1499 once the reshaping-road pair joined (2d); 1501 once the readers' fourth branch landed. **What reverting each item costs at L6, on the tree that ships, every existing row unmoved: W61 52, W62 19 (from W62's 0 — the `stamp` row observes the shadows, every reshaped item's `markedKeys` the markers), W63 52 (every transform deleted from both documents) and 17 (the flows not handed to the helper, so no pool loads the engine)** |
| checks | GREEN | `check:source`, `check:docs` (28 / 22, unmoved), `check:markdown` (**116 documents, 5115 relative links, 260 anchored** — after the record step), `check:wiring`, `check:policies`, `check:scheduler` all 0. `M3` 88 / 90 and `M4` **3766 against 3960** on a scratch copy of the tree that ships; `scripts/check-markdown.mjs` not edited |
| rule 8, author pass | **68 probes: 1 control green, 50 caught, 11 declared ceilings each RUN against its rung, 6 measured, 0 undeclared on its final pass** | The first pass read **2 UNDECLARED SURVIVORS, 2 CRASHES, 1 ABORT and 1 against declaration**. The two survivors were REAL and both closed: `a12` — the `Echo` type's `retryPolicy: { maxRetries: 0 }` deleted cost 0, because **the scheduler's own default is zero retries** (measured here; stated nowhere), so the declaration was inert and the type declares ONE retry now, which a failing transform spends before parking (`attempts: 1` on both observers, both runtimes); `d4` — the marker walk with its object recursion removed and the markers kept cost 0, because the one marked array sits one level down and an empty list is what a blind walk reports too — closed by `arrays`, the walk's REACH stated beside its finding (obligation (c)'s LIMIT, a second expression over the same walk). The two crashes and the abort were the INSTRUMENT: `b11`'s anchor matched a prefix of a comment line; `e6` on the browser rung was a CATCH read as a crash because that runner prints `FAIL` at two spaces where the Node runner prints four; `rev61` carried W61's anchor for an envelope line that is one expression on this tree. `e9` was declared a ceiling and CAUGHT against it — the reach clause's exemption requires the closing quote right after `index.ts`, so a query-string spelling of the entry is an offender, stricter than its author believed; kept as the catch it is. `b4z` measured 17 for deleting a MIDDLE row with its key and counts, **15 of them the run-id shift of the row after it** (`runId: r${i + 1}`), so `b4` was re-aimed at the LAST row: **2 clauses stand** — the failure-road set non-empty and the same-type pair's `transform-fails` half (Q217's shape, two clauses deep) |
| readers | **7 / 1 blocking and 18 mutations / 8 survivors / 2 blocking, OVERLAP 1** | The **thirty-seventh** measurement, inside the 0-4 band, neither primed; the one shared subject — the arity-zero row's stated reason *"because JSON text cannot tell 0 from undefined"* — reached from both ends (the conformity reader by derivation, the adequacy reader by deleting `inputType` and watching the value alone catch the non-array form: an absent `input` drops its key from the JSON text). **Conformity, blocking 1**: `examples/README.md` read **1497** assertions in the two sentences its own cell says nothing checks, while `l6.ts` declared 1499 — this page's recorded class, W59's 1277 one item over. Non-blocking, all taken: a missing quote in the header table; the false reason above; *"a real THREAD in both runtimes"* stated as observed where it was a configuration (the author's `e10` ceiling); *"one more `needs`"* where the number that moved is task nodes NAMED (two declarations, one target); the Scope-Out sentence binding out the document Output (3) needs; `AGENTS.md` absent from the Exceptions table on disk. **Adequacy, blocking 2, every survivor a direction the author's 68 never took**: (G3b) **the two CONTROLS of block (2d) — the `FD-V37` positive fixture and *that set is not empty* — were not in `CROSS_ROW_SUBJECTS`**, so with both counts lowered a validator accepting everything was green in BOTH runtimes at 1498: v0.14's *a count is not a membership* one layer inside the membership list, which named the claims and not their controls — two subject strings close it; (M5) the thread claim had no observer at L6 and the author's ceiling reason was about the OBSERVER — closed by the echo role reporting its realm against a mark the harness sets (W62's mechanism one rung up), so `e10` is a catch now. Non-blocking, measured and recorded: `JP-R12`'s `{}` handed as `null` (M2) and the collection keyed off `branchPath` (M6) leave all three `transformed` rows green — **the reduction is key-blind and sums `null` as `{}`, so those rows observe the VALUE the successor received and not the record's shape**, whose observers are W17's `all-exit` row and `transform-fails`' untyped `publish`; `$settings` frozen at first evaluate (M4), the message without the expression (M3), `undefined` made a failure (M27) and four of five names re-bound (M9) are green at L6 and caught at L1, each by the suite that owns the clause; the one retry moved to the nodes (M14) is caught by W59's *under a policy the NODE does not declare*; the reshaping node put back at RUN time (M26) changes what `total` receives, so that `Tests:` sentence is a validator-level one and reads so now; and **`transformed.flow.json` carries a successful transform on three of `FD-C5`'s four kinds** — its entry is an untyped `SplitWorker` — so the Scope's *one flow carries the four kinds* was false: `transform-fails` gained a fourth branch, `note`, whose transform succeeds over an ordinary edge's value (v0.17's enumeration clause, the shape the author's set did not instantiate). All closed; the readers' fifteen exact edits are probes |
| re-run, tree held still | **82 probes: 1 control green, 62 caught, 13 declared ceilings each RUN against its rung, 6 measured, 0 undeclared survivors, 0 crashes, 0 aborts, 0 against declaration** | the author's 68 plus the readers' fourteen (`r1`-`r4`, `r6`-`r13`, `r15`, two declared — prose no check compares), `e11` (the realm mark's one direction, declared), and `e10` now a catch. Every blocking edit CAUGHT by the clause it forced: G3b by the two new subjects, M5 by `realm`, the fourth kind by `r15`. Digest `e5c6fe39c613b3c4` over 296 files before and after every chunk |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries — on the FIRST run over the final tree** (`dev-dist/w63/gate.log`; selftests 7/7 completed, 7 ok, 557.6 s wall) | digest `f61a83a91297a356` over 296 files before and after — the tree the readers' fixes shipped; this row's re-taken numbers and the Record's prose are the edits after it; firefox and webkit at 979 by `test:browser:all` on the same tree, exit 0; L6 1501 / 0 in both runtimes; census **215 / 162 / 2 / 51** (215 of 215 in exactly one cluster cell, 0 aborts) after this item's three rows; `W63` outside `doc/`: **61 hits in 11 files** after the record step, every one this item's own annotation or P17's and W61's forward references (`CLAUDE.md`, `README.md`, `spec/flow-definition.md` name W63 as the exit artifact's owner) |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `examples/flows/transformed.flow.json` | a `SplitWorker` entry, a `map` whose typed branch `reshape` (`Echo`, `scale: 100`) reshapes its own item through `{ word, score: $round(confidence * $settings.scale), fields: $keys($) }`, a fanout of two `Scorer`s (factors 100 / 1000, `needs: { run: "ingest" }`, transform `run`, a decision on `isLowScore`), a join, and `total` (`Echo`, `$sum([*.score])`) with NO task node between the join and it | `b1` (the corpus split at L1, a crash at L6), `p5`, `p6`, `rev63` 52 |
| (2) three L6 rows at arities two, one, zero | 990 / 400 / 0 as the value `total`'s worker RECEIVED, every one a NUMBER, read off the outcome record; the arity pair asserted as a difference in arrivals and totals; Q263 as three rows in block (2d) | `a1`-`a4`, `c8`, `p1`-`p3`; the pair clause |
| (3) an L6 row where the transform FAILS at run time on a non-optional node | `transform-fails.flow.json`: `review` (`T2002`) and `stamp` (`UNBOUND`, ADR 0052 rule 7) retried once under the type's policy, parked `user_action` with `TransformFailed`'s message on two observers, resolved by the harness, the join firing over four branches and the run completing; `scoreA` untransformed and byte-identical; `note` transforming an ordinary edge's value successfully | `a12`-`a16`, `e5`, `r12`, `r15`, `rev62` 19 |
| (4) what reverting each item costs at L6 | **W61 52, W62 19, W63 52 / 17**, on the tree that ships, every existing row unmoved | the rows above |
| (5) `examples/README.md` and the flow-worker's role table | the `echo` role in `ROLES`, its arm, and the `Echo` type's pool — three lists bound both ways since W43, and a new type in `NODE_TYPES` with `LANGUAGES` beside it; the README's counts and a cell for the four rows | `b6`, `b7`, `b8`; `b5` and `r1` declared (a markdown page no check reads) |

**What broke.**

1. **The scheduler's default retry budget is zero and nothing here says so**: a type declaring `maxRetries: 0` was inert at L6 (`a12`); the type declares one now and a failing transform is re-evaluated before it parks.
2. **A deleted MIDDLE row renumbers every run after it** — `b4z`'s 17 was 15 parts id shift — so the cost of deleting a row depends on its position and only the last row measures the membership layer (`b4`: 2 stand).
3. **The marker observer's depth had one observer** (`d4`): a walk that stopped at the top level reported the same empty list as one that reached the marked array — closed by reporting the walk's reach.
4. **The browser runner prints `FAIL` at two spaces and the Node runner at four**, so a harness reading one reads the other's catch as a crash (`e6`) — Q272's shape from the harness side.
5. **The two CONTROLS of a cross-row block were not subjects** (G3b): the membership list named claims and not what makes them non-vacuous.
6. **The thread claim had no observer** (M5) and the author had declared it a ceiling with a reason about the observer — obligation (c)'s LIMIT's own closing sentence, missed by its author.
7. **A key-blind reduction cannot see the record's shape** (M2, M6): the arity-zero row's `{}` is observed by a row two plans older.
8. **The exit-artifact flow cannot carry `FD-C5`'s first kind with a successful transform**, because its entry must return an array for the map — the fourth branch of the failing flow carries it.
9. **A count in prose went stale within the hour** (`examples/README.md` at 1497 while `l6.ts` declared 1499), on the page whose cell records the class five times.
10. **W61's revert anchor did not survive one item** (`rev61` aborted): the driver's envelope became one expression, and a probe copied from a previous item is a claim about that item's tree.
11. **The register's headline was stale by W62's own three rows** (209 / 156 where the parser and W62's Record both say 212 / 159), found by this record step reading the count against the line above it — P17's declaration defect a second time, in the other direction.

**What this taught.**

- **A declaration that agrees with the default is not a declaration**: the zero-retry policy was measured inert by the first probe to delete it, and only a value the default cannot supply made the row's `attempts` a statement about the TYPE.
- **A membership list needs its CONTROLS as members**: `CROSS_ROW_SUBJECTS` bound eight claims and not the two assertions that stop them being vacuous — the count clause caught one deleted, and two counts lowered together caught none.
- **A row that observes a projection observes the projection**: the exit artifact says what the successor RECEIVED, and every clause about the record's shape is carried elsewhere; the rows now say so.
- **The readers' split held for the thirty-seventh time**: the conformity reader found claims that were false (a count, a reason, a scope word, a table row missing); the adequacy reader found bounds that were not there (two controls, one realm, one kind, four L1-owned clauses green at L6).

**Questions raised.** [Q274](../open-questions.md) (a deleted middle row renumbers every run after it, so a deletion's cost at L6 depends on its position), [Q275](../open-questions.md) (the scheduler's default retry budget is zero and is stated nowhere, so a zero-retry declaration is inert at every rung), [Q276](../open-questions.md) (three runners, two `FAIL` indentations, every harness carries the difference as a literal). [Q263](../open-questions.md) shown at three arities and NOT resolved (P18 owns the check). **Q277 spent and not reused. No ADR.** `W63` outside `doc/`: **55 hits in 10 files** before the record step.
