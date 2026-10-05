# W82 — a result its own schema refuses, on real workers

**Status:** done
**Plan:** [P21](../plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) — *what does a
run-time schema check buy, and what does it cost against what a settlement already pays?*

```
Spec:       none — this item writes no rule. `OR-R13` is W80's and `spec/outcome-record.md`
            stays at v0.10; ADR 0061 is reserved and expected unused.
Owns:       examples/**, AGENTS.md, README.md, examples/README.md
Inputs:     P21 facts 3 and 4 and W80's prediction-3 finding, all re-taken on this tree
            (below); ADR 0060; `OR-R2`, `OR-R11`, `OR-R12` and `OR-R13`; Q302; Q179.
Outputs:    (1) one L6 ROW on a real `FyflowScheduler` in BOTH runtimes where two workers
                return values their own `outputSchema` refuses and the run reports each BY
                NAME — one per leg of W80's prediction 3, with two CONFORMING nodes beside
                them as the control
            (2) the PAIR — the same flow and payload with the check ON and OFF, holding the
                dispatched ids, the log record for record and the folded state IDENTICAL,
                with the reports the one thing the two runs differ in (ADR 0060 decision 3,
                the sentence P21 tells an adequacy reader to falsify first)
            (3) the check's cost for the whole rung, ON and OFF, as a RATIO to the clone
                `OR-R2` already pays (plan decision 5) — ASSERTED as a COUNT, which is the
                only observable a check whose answer is discarded has, and PRINTED as a
                ratio, which is a property of a machine
            (4) `AGENTS.md` section 16 and its `README.md` twin — the knob taught where a
                consumer reads, executed by `npm run gate`, held byte-equal by `X8`
Depends on: W81
Blocks:     nothing — P21's retro is next
Tests:      ladder L6 in both runtimes. Every expected value is derived BEFORE the run: the
            findings from the two workers' declared schemas and the payload's word count,
            the dispatched ids from `spec/task-id.md`'s four-segment scheme, the conforming
            nodes from their workers' own output examples. The row's THREE observers of one
            fact reach it by three roads — the scheduler's live `detail.result` at the
            harness's own listener, the RECORD the driver appended, and the finding the
            callback received.
Gate:       L6 in BOTH runtimes; `check:docs`; `check:markdown`; the full `npm run gate`
Reserves:   Q340-Q344, ADR 0061 (expected UNUSED — the decision is ADR 0060's and is W80's)
```

## Scope

**In**

1. **A flow whose workers return values their own `outputSchema` refuses**, CONSTRUCTED, because
   P21 fact 3 measured that the corpus has no live defect left — re-taken here at nineteen flows
   and ninety-three settlements rather than five (below).
2. **BOTH legs of W80's prediction 3, in one flow** — a bound a producer's own code does not keep
   past its declared domain, and a value that conforms as `run()` returned it and does not survive
   `OR-R2`'s clone. The second is the half ADR 0060 says no authoring-time tool can reach *for a
   structural reason rather than an omission: none of them holds a record.*
3. **Two CONFORMING nodes in the same run**, so *reported on exactly these two* is an assertion
   with something to exclude — and both are EXISTING corpus workers, so the check is silent on the
   corpus's own in the very run where it fires twice.
4. **The value carried downstream unaltered**, observed rather than stated: `attest` reports the
   key set it received, and the key the record lost is missing from it. *ADR 0060's declared COST,
   as an assertion.*

**Out** — with where each goes instead

- **Any change to `src/**` or `spec/**`.** The check is W80's and is unmoved; this item runs it.
- **Turning the check on by default, anywhere.** ADR 0060 decision 1.
- **A second off-gate measurement file.** `examples/settlement-cost.ts` is W81's and prices ONE
  settlement; the rung's ratio is this item's Record and a line L6 PRINTS, never a rung (Q179).
- **[Q171](../questions/q171.md)'s `X7`-shaped clause over the L6 counts.** P21 declares it out.
- **[Q302](../questions/q302.md)'s bounds-generating road.** W74's territory, and P21 stop-and-ask
  (d) refused the cheap half deliberately.

## The declaration step — six numbers re-taken, and two of them move the plan

*Node 24.20.0 asserted in every shell, every rung RUN and redirected and read by `$?`, tree held
still at digest `8e4b0bf79fa8da9a` over 372 files, identical before the first probe and after the
last.*

| | | |
|---|---|---|
| **baseline** | **CONFIRMED**: L6 **1639 / 55** in node, L1-L5 **46 / 1295**, `check:spec` **7 / 61 / 108**, `check:docs` **33 snippets: 27 run, 6 check**, `RUN_FLOOR` 27, `check:markdown` 141 / 6150 / 311 | `base-*.log` |
| **fact 3** | **REPRODUCES, and it is STRONGER than the plan states it.** P21 measured *0 violating results of 5 checked*; with the check ON over **nineteen** corpus flows it is **0 of 93 settled `done`**. The corpus has no live defect and the case must be constructed | `decl-fact3.txt` |
| **fact 4 at a SWEEP's scale** | **0.38x** — over the 93 settlements a one-run-per-flow sweep of `examples/flows/` makes, 91 of which have a declared `outputSchema`, `findings` costs 0.0887 ms against `structuredClone`'s 0.2306 ms, and the worst SINGLE settlement is **0.69x**. Taken in both orders (0.38x / 0.38x), which is W46's order-against-accumulation caveat checked rather than assumed. *(This row said **the rung's** 93 settlements. The probe iterates `examples/flows/` ONCE PER DOCUMENT and is a sweep; **the RUNG settles 204 results with a declared schema**, which `examples/l6.ts` prints on every run. The conclusion survives — the rung reads 0.25x / 0.37x in node — and the scope was wrong by 2.2x, which is section 1 rule 5's writing clause on the number this item reports as its cost. W82's conformity reader, finding 11.)* | `decl-cost.txt` |
| **W80 prediction 3, leg 2** | **REPRODUCES on the shipped `tally` schema**: a non-enumerable own property is `findings`-clean as `run()` returned it (`required` is `hasOwnProperty`) and **`$.word required` as the record carries it**, because `structuredClone` drops it. ADR 0060's own table row, on this tree | `decl-fact3.txt` |
| **the constructed case** | **SPIKED END TO END on a real `FyflowScheduler` before a line of it entered the tree.** Four task nodes: `checkWiring` **3 fits, 0 no**; both new workers green on their declared examples the way `check:workers` runs them; the run **completed**; **reported 2** — `$.load above maximum 1` and `$.label required` | `spike2.txt` |
| **Q142** | **PREDICTED NOT TO FIRE, and the plan's seeded row is stale for the SECOND item running.** Measured: `M3`'s fixture margin is **15 files** and `M4`'s **969 links**. P21's seeded table says *`M4`'s margin is 26 and `M3`'s is 2* and calls `check-markdown.mjs` *the tight one*; W80's midpoint retune moved both, W81 measured 17 / 821 and said so, and the seeded row was not corrected. **It also names the wrong rung** — `M3` is the tight one and `M4` has three orders of magnitude of room | `decl-q142.txt` |

### Finding 1 — the second leg fires on BOTH pool modes, and only an INLINE pool attributes it to `OR-R2`

Measured at `inline: true` and `inline: false`: the run reports **the same two findings either
way**. What differs is WHERE the key was lost — a threaded pool serialises the result at the thread
boundary, so `detail.result` already lacks it and `OR-R2` clones a value that never had it.

**So the pool must be INLINE, and for `tally.ts`'s reason one rule across.** That file's header says
its pool *is INLINE and must be: two map instances handed one object would see each other's write,
and a thread would hide it.* Here a thread would not hide the finding — it would hide the
ATTRIBUTION, which is the whole of what makes this leg a claim about `OR-R2` rather than about a
transport. The row's three observers are what make the attribution observable:

| observer | road | what it says |
|---|---|---|
| the scheduler's live `detail.result`, at the harness's own listener | `OR-R1`, read synchronously and never retained | the value the scheduler settled with **has** the key |
| the RECORD the driver appended | `OR-R2`'s clone | it **does not** |
| the finding the callback received | `OR-R13` | `$.label required` |

*Three roads to one fact, and the middle one is the record — which is ADR 0060 decision 5 with an
observer for the first time.*

### Finding 2 — the ON/OFF pair holds, and it is decision 3's headline with nothing left to argue

The same flow, the same payload, the same run id, twice — once with `onNonconformingResult` and once
without: **dispatched ids identical, the log identical record for record with the clocks zeroed,
the folded outcome identical, `state.nodes` identical, and 2 reports against 0.** P21 decision 3's
*an item that writes a record, changes a terminal state, or routes differently has broken this
decision* has an observer on real workers.

### Finding 3 — the plan's Status line did NOT need the correction this item was told to make

W82's brief named `doc/plans/p21-*.md` line 1 as carrying *IN PROGRESS — W80 is DONE* with W81
missing, under `doc/workflow.md` section 1 rule 5's third direction. **It is already correct**:
W81's own record step names both items and the sentence reads *W80 … is DONE … and W81 … is DONE …;
W82 is not started.* The only half that will go stale is the last clause, and this item's record
step is what owns it. *A correction instructed from outside the tree, checked against the tree, and
found already made* — which is the same procedure the clause prescribes, applied to the instruction
rather than to the file.

## Verification

| clause | command |
|---|---|
| L0, five typecheckers | `npm run lint`; `npm run typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **run SEPARATELY**, because `npm run typecheck` is five lanes chained by `&&` and a chained rung reports its first failure and is silent about everything downstream |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser` — every rung REDIRECTED and read by `$?`, never piped |
| L6 in BOTH runtimes | `npm run test:l6` and `npm run test:l6:deno`. **L6 MOVES and the Record says by how much**, which is this item's declared result |
| `check:docs` | `npm run check:docs` AND `npm run check:docs:selftest` — the second because `RUN_FLOOR` moves and `X4`'s probe anchors on `AGENTS.md`'s text (the plan's seeded row, W78's finding) |
| `check:markdown` | `npm run check:markdown` AND `npm run check:markdown:selftest`, which is the only rung `M3`/`M4` can fire in — [Q142](../questions/q142.md), re-taken on the tree this item SHIPS |
| `check:workers` | `npm run check:workers` — the two new workers run on their declared examples and must be GREEN, which is half of what makes the reach a reach |
| the full gate | `npm run gate`, read by capturing `$?` into a variable in the SAME command before any reading tool runs |
| rule 8 | `dev-dist/w82/rule8.mjs`, twice: the author pass, and again with the readers' exact edits checked in |
| both readers | conformity and adequacy, adequacy in an isolated copy OFF the shared tree, both reporting rather than fixing |

*Routing cases (template):* **a branch routed away from its join (Q4)** — not applicable; the flow
is linear by construction, because a region would make the row about arity rather than about the
check. **`user_action` (Q17)** — not applicable, and deliberately: `OR-R2` writes `result: null` for
a non-`done` settlement, so ADR 0060 consequence 3 says nothing is checked there, and the row that
demonstrates it is L2's. **No matching decision edge (Q10), a duplicate task id (Q13), a nested
fan-out (Q6)** — not applicable; this item dispatches four tasks on one path.

## Exceptions — files this item edits outside its `Owns` and outside the record step

*Seeded from P21's table and MEASURED at this declaration step.*

| path | verdict | why |
|---|---|---|
| `scripts/check-docs.mjs` | **NEEDED** | `RUN_FLOOR` is a ratchet an item that ADDS a `run` snippet must raise — [Q102](../questions/q102.md), live for six plans. 27 → 28 |
| `scripts/check-docs-selftest.mjs` | **PREDICTED NEEDED, and measured UNNEEDED** | W78's reason was that `X4`'s probe anchors on a literal inside `AGENTS.md`. This item APPENDS section 16 and edits no earlier fence, so no anchor moved: `check:docs:selftest` is green at **33 / 33, 20 / 20** and the file is unmodified. *A prediction resolved in the other direction, recorded rather than quietly dropped* |
| `scripts/check-workers-selftest.mjs` | **NEEDED, and UNPREDICTED — by this item and by the plan's seeded table** | its `CONTROL_LINES` pins the shipped document's header tally as a LITERAL REGEX — `14 worker(s) … 14 ran on a declared example` — so two new worker entries turn a GATE ENTRY red while `check:workers` itself stays green. **The count lives in the GRADING and not in the check**, which is why neither table reached it |
| `test/definition/wiring.test.ts` | **NEEDED, and UNPREDICTED** | it pins the L6 corpus wiring census as a literal — `62 fit … over 25 flows` — and a new corpus FLOW moves it. The seeded table named `test/definition/l4-corpus.test.ts` (correctly unneeded, since this item adds no suite) and not this one. W82's conformity reader, finding 6 |
| `spec/outcome-record.md` | **NEEDED, against this item's own PREDICTED UNNEEDED** | section 4 states the corpus task-node split as `16 of 175`, and four new task nodes make it `16 of 179`. **Nothing in the item had to find this**: `test/fold/result-value.test.ts` DERIVES both sides from the two corpora on every run and went red naming it — the sentence being held by a test is what a `doc/` claim usually is not |
| `spec/flow-definition.md`, `scripts/check-source.mjs` | **LATE, and the same shape** | three sentences saying *fourteen* corpus workers, made stale by the two this item adds. Found by the conformity reader's grep rather than by any check |
| `doc/plans/p21-*.md`, outside its Record | **LATE** | its **Exit artifact** line carried a FOURTH standing copy of the claim commit `c869a4b` WITHDREW — *reports it by name rather than carrying it downstream* — which is the opposite of ADR 0060 decision 3 and of what this item's own row asserts. **This file's finding 3 had checked the Status line three lines above it and concluded the file needed no correction**; the conformity reader read the next sentence |
| `AGENTS.md`, `README.md`, `examples/README.md` | **inside `Owns`, not exceptions** | named here because the plan's seeded table lists them: `X8` holds THREE README fences byte-equal and `README_SNIPPETS` / `README_SNIPPET_FLOOR` are two more literals beside them, so a fourth pair is FOUR edits in one diff |
| `scripts/build-browser-tests.mjs` | **PREDICTED UNNEEDED** | this item adds no test suite; its whole artifact is L6, which the browser bundle does not carry (`RT-R10`). **Four items running have predicted this row wrong in one direction or the other**, so it is declared rather than assumed |
| `scripts/check-markdown.mjs` | **PREDICTED UNNEEDED** | Q142, measured above: `M3`'s fixture margin is 15 files and this item adds ONE markdown document; `M4`'s is 969 links |
| `test/definition/l4-corpus.test.ts` | **PREDICTED UNNEEDED** | the suite census is a standing obligation on any item ADDING a suite and this item adds none. Declared because the plan's seeded table names it for whichever item does |
| `src/**`, `spec/**`, `doc/decisions/**` | **PREDICTED UNNEEDED** | this item runs the check and does not move it. ADR 0061 reserved and expected unused |
| `package.json`, `deno.json` | **PREDICTED UNNEEDED** | nothing is exported and no version moves |
| `doc/plans/p21-*.md` | **the record step's** | its Status line and Record are `doc/workflow.md` section 1 rule 5's record-step list, not an exception. Finding 3 above says the correction this item was briefed to make was already made |

`README.md`'s non-snippet prose, `CLAUDE.md`, `doc/README.md`, `doc/open-questions.md` and the
plan's Record are the **record step's** and are not exceptions.

## Record

**Status: DONE.** Two `nonconforming` rows and a check-OFF pair run on a real `FyflowScheduler` in
BOTH runtimes, **L6 is 1724 assertions over 58 real runs** from 1639 / 55, and **P21 is complete
pending its retro**. **NO ADR — 0061 reserved and UNUSED.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0, five typecheckers | **RAN, green** | `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples`, each RUN SEPARATELY and read by `$?`, never through the five-lane `&&` chain |
| L1-L5 | **RAN, green** | **46 file(s) / 1295 assertions** in node 24.20.0, deno 2.9.6 and chromium — **UNMOVED**, which is the declared result for an item adding no suite |
| L6 in BOTH runtimes | **RAN, green** | **1724 assertions, 0 failed, 58 real runs**, identical in node AND deno. From 1639 / 55; 50 `EXPECTED` rows from 48, **52 row labels** from 50 |
| `check:docs` | **RAN, green** | **34 snippet(s): 28 run, 6 check** from 33 / 27 / 6. `RUN_FLOOR` 27 → 28; `X8` compares **4** README snippets from 3. `check:docs:selftest` **33 / 33, 20 / 20** and the file is UNMODIFIED — a seeded prediction resolved the other way |
| `check:markdown` | **RAN, green** | **142 documents, 6205 relative links, 317 anchored**, and `check:markdown:selftest` **7 / 7 bounded**. **[Q142](../questions/q142.md) did NOT fire**, re-taken on the tree this item SHIPS AFTER the record step — `M3`'s fixture margin 14 files and `M4`'s 951 links. *(This row read 143 / 6182 / 311 for the hour between the record step and the final gate: a number taken before the last six documents moved, in the row that says it was re-taken after them. Section 1 rule 5's WHEN clause, caught by reading the gate's own line.)* |
| `check:workers` | **RAN, green** | **16 workers, 16 ran on a declared example, 2 not checked**, from 14 / 14 / 2 — **and both new workers are GREEN**, which is half the reach. `check:workers:selftest` 24 probes / 9 gradings |
| the other checks | **RAN, green** | `check:spec` **7 / 61 / 108 UNMOVED**, `check:source`, `check:wiring`, `check:scheduler`, `check:policies` |
| conformity reader | **RAN** | **16 findings, 6 blocking** — and **its central obligation came back with ZERO disagreements on the VALUES**: both rows' findings and their exact text, all eight dispatched ids, every `nodeResults` value, the `settledOwnKeys` pair, the check-OFF counts and the whole assertion arithmetic (`+15 / 1720 / 58`) derived on paper from the schemas and the payloads before any output was read, and every one matched. It also rebuilt finding 1 independently at both pool modes |
| adequacy reader | **RAN** | **17 mutation configurations, 13 green at the rung they targeted, 9 findings, 6 blocking**, in a plain COPY verified green on three rungs before the first mutation, scanned for links out and deleted |
| overlap | **1** — the **FIFTY-SECOND** measurement | inside the 0-4 band, neither reader primed. The one shared subject is `CROSS_ROW_SUBJECTS`' omissions, reached from opposite ends: the adequacy reader by DELETING the blocks for two integer edits, the conformity reader by COUNTING the list against what the file emits |
| rule 8, author pass | **RAN** | 41 probes, 31 caught, 9 declared ceilings, 0 undeclared survivors — after **four** corrections it made itself, three of them real |
| rule 8, final pass | **RAN** | **52 probes, 39 caught, 12 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, control green, digest `ff3fc9bdf829ce51` over 377 files identical at both ends, with **all ten of the readers' exact edits checked in** as `r1`-`r10` |
| `npm run gate` | **RAN, `GATE EXIT=0`, zero lines beginning `FAIL`** | **31 chain entries**; `selftests` **8/8 completed, 8 ok**, 915.8 s wall over 6 lanes against 1855.2 s serial-equivalent. `spec` **7 / 61 / 108** and `source` 23 published files / 16 gate entries; `workers` **16 ran on a declared example, 2 not checked**; `docs` **34 snippets: 28 run, 6 check**; `markdown` 142 / 6205 / 317; L1-L5 **46 / 1295** in node 24.20.0, deno 2.9.6 AND chromium; **L6 1724 / 0 failed / 58 real runs in BOTH runtimes**. Digest **`1db40d27f0f23c89` over 377 files, identical before and after** — the tree HELD STILL for it. *(How it was read: `npm run gate > log 2>&1; GATE=$?; echo "GATE EXIT=$GATE"; grep -cE …` — the exit code captured into a variable in the SAME command BEFORE any reading tool runs. **The trailing `grep -c` then exited 1 on zero matches and the harness reported the whole command as FAILED**, which is W80's own finding reproduced one item on by the author who had just written it down. It cost nothing only because the gate's verdict had already been taken.)* |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) one L6 ROW — two, in the end, because the bound needs a control | **yes** | `a1` (W80's check deleted from `src/`) costs **14 L6 failures**, where it cost **ZERO** before this item; `a5` (`gauge` clamped, which is W73's own fix) costs 5 and `a6` (`stamp`'s label made enumerable) costs 17, **both with `check:workers` green before and after** — the reach measured from both sides; `f2` (the control row given the same word count) and `f3` (its declared finding text changed) each fire |
| (2) the PAIR — ADR 0060 decision 3 on real workers | **yes** | `a4` (a finding sets `this.failed`, so the check ROUTES) costs **20**; `b2` (the OFF arm's log array re-sourced to the ON arm's) and `b3` (the control's own projection re-sourced) both fire, which is what ONE array per arm bought; `c3` (the OFF arm run on a different payload) fires |
| (3) the cost ON and OFF, asserted as a COUNT and printed as a ratio | **yes** | `e1` (the row's `checkResults` not forwarded) and `e2` (the callback installed unconditionally) both fire — and `e2` is caught by the **PAIR** and NOT by the partition clause, because fact 3 means the corpus reports nothing either way. `d4` is the declared ceiling: the printed ratio's bounds are asserted by nothing, deliberately |
| (4) `AGENTS.md` §16 and its `README.md` twin | **yes** | `e3` (the fence re-tagged `check`), `e5` (the `README_SNIPPETS` entry removed) and `e6` (ONE byte of the README twin changed) each fire. **`b6` is the declared ceiling and `r3` is what makes it honest**: every guard tautologises at `check:docs` exit 0, and **L6** is the second route |

### What broke

1. **Every observer of the report was DOWNSTREAM OF THE REPORT, and the item called them three
   roads.** The adequacy reader's findings 1 and 2: the row's declared literal, the per-id finding
   text and the log-derived walk all read `report.nonconforming` on the actual side, so pointing each
   at the report in one commit left all three vacuous **with every declared control green** — the
   walk's control was *the derivation found SOMETHING*, which became *the report is non-empty*,
   exactly as true as before. After that **a driver reporting `$.NOTHING garbled by the adequacy
   reader` for every settlement left L6 at 1720, 0 failed.** *That is obligation (c)'s LIMIT one layer
   out: the clause says at ONE observer add a second independent expression, and here there were three
   expressions over ONE value.* **What refuses it is a relation the LOG has and the report does not**
   — the walk reaches the CONFORMING settlements, which no report names — so the control is over the
   walk's REACH rather than over an operand. [Q340](../questions/q340.md).
2. **A BINDING THAT DID NOT BIND, found by the author's own pass.** The check-OFF pair kept FOUR
   strings — two zeroed logs and two raw ones — so re-sourcing the OFF arm's ZEROED log left the RAW
   control reading the real off-run, and the control passed. *A control over a SECOND projection of an
   arm cannot see the FIRST projection being re-sourced.* Closed by keeping ONE array per arm and
   computing both projections where they are asserted, after which both `b2` and `b3` fire.
3. **A CEILING BOUGHT BY A CRASH.** `b6b`, the compound written to prove §16's tautology ceiling
   harmless, fired on `found[0]!` of an empty array — a `TypeError`, not a guard. **A crash is not a
   detection**, and the reader's better break (`gauge` made to keep its bound, which leaves the report
   non-empty) is `check:docs` exit 0. So there is **no second route inside `check:docs`**, §16 says so
   now, and the route that exists is L6. Its guards no longer crash on an empty report.
   [Q341](../questions/q341.md).
4. **A corpus census pinned as a literal in three files that are not the corpus, and no seeded table
   has ever named one.** `scripts/check-workers-selftest.mjs`'s `CONTROL_LINES` regex took a GATE
   ENTRY red while `check:workers` itself stayed green — *the count lives in the GRADING and not in
   the check*; `test/definition/wiring.test.ts` pins the wiring census; and
   `spec/outcome-record.md`'s task-node split is **DERIVED on every run** by
   `test/fold/result-value.test.ts`, which is the only one of the three that announced itself.
   [Q342](../questions/q342.md).
5. **`X4` is stronger than this item declared and the declaration was CAUGHT AGAINST DECLARATION.**
   It refuses `if (false)` BY NAME (W16's adequacy reader's clause) and counts `throw` textually, so
   [Q310](../questions/q310.md)'s ceiling needs `x !== x` rather than `if (false)`.
6. **A compound that exercised nothing and survived.** `b1b`'s first version paired a vacuous clause
   with an ABSENT-SCHEMA mutation, and all four nodes of this flow declare one, so no extra report was
   ever produced. *A compound is evidence only when its second edit reaches the clause.*
7. **My own patch script reported `ok` having changed nothing** — a `str.replace` with no assert on
   the match, so the rung's cost was re-taken on the OLD flow set and read identical. Every patch
   since asserts its match count.
8. **A spike hung on a `done` that never settled**, because the corpus workers' relative URLs resolved
   against the wrong `base`; Node reported *unsettled top-level await*, exit 13. [Q323](../questions/q323.md)'s
   shape, and every await in a probe is bounded since.
9. **The register's headline was stale at `256 / 199 / 2 / 55`** — W80's figure, through the whole of
   W81, whose own note beside it reads 261 / 203. [Q253](../questions/q253.md) for the fifth plan
   running. Census re-derived from scratch: **265 / 207 / 2 / 56, 265 of 265 in exactly one cluster
   cell, 0 aborts** — and the parser was wrong in a **fourth** direction this register does not
   record: [Q87](../questions/q87.md)'s row spans five lines, so a filter requiring one line to open
   AND close **dropped** it and the census read 260 with **zero aborts**. *A parser that aborts on
   what it cannot classify does not abort on what it never SEES.* [Q343](../questions/q343.md).

### What this taught

**The corpus check cannot see either defect arriving OR leaving, and that is the reach measured
rather than argued.** `check:workers` is GREEN on `gauge` and `stamp`; it is green with `gauge`
clamped (`a5`) and green with `stamp`'s label made enumerable (`a6`); and both mutations cost 5 and
17 at L6. *A claim that a tool cannot see something is usually one measurement; this is four.*

**And the two legs are unreachable for DIFFERENT reasons**, which three documents conflated until the
conformity reader separated them: `gauge`'s bound is reachable by a bounds-generating tool — that is
[Q302](../questions/q302.md)'s own open road, which P21 stop-and-ask (d) declines deliberately —
while `stamp`'s missing key is reachable by **none**, because none of them holds a record.

**Nothing for `doc/workflow.md`.** The two candidate rules are [Q340](../questions/q340.md)'s (whether
anything general can be said about corroborating a callback's own report) and
[Q342](../questions/q342.md)'s (a corpus census pinned outside the corpus), and both are at one
occurrence with a plan's retro next.

### Questions raised

| | |
|---|---|
| [Q340](../questions/q340.md) | every observer of a REPORT is downstream of the report, and a membership over the observers cannot see it |
| [Q341](../questions/q341.md) | `X4` refuses `if (false)` by name and nothing else, and the ceiling written to make that safe was bought by a CRASH |
| [Q342](../questions/q342.md) | a corpus census pinned as a LITERAL in three files that are not the corpus, none of them ever seeded |
| [Q343](../questions/q343.md) | a table row that spans several LINES is invisible to a parser that aborts, because it is never presented to the classifier |

**Q344 reserved and UNUSED, so it is SPENT. ADR 0061 SKIPPED.** Census **265 / 207 / 2 / 56**.

### Exceptions taken — the measured column

**Five were needed and THREE of the five were unpredicted; one that WAS predicted did not fire.**

| path | seeded | measured |
|---|---|---|
| `scripts/check-docs.mjs` | NEEDED | **NEEDED** — `RUN_FLOOR` 27 → 28, `README_SNIPPETS` + 1, `README_SNIPPET_FLOOR` 3 → 4 |
| `scripts/check-docs-selftest.mjs` | NEEDED | **UNNEEDED** — this item APPENDS §16 and moves no anchor |
| `scripts/check-workers-selftest.mjs` | — | **NEEDED**, unpredicted by the item and by the plan |
| `test/definition/wiring.test.ts` | — | **NEEDED**, unpredicted |
| `spec/outcome-record.md` | PREDICTED UNNEEDED | **NEEDED** — the corpus split, which a test derives |
| `spec/flow-definition.md`, `scripts/check-source.mjs` | — | **LATE** — three *fourteen corpus workers* sentences |
| `doc/plans/p21-*.md` outside its Record | — | **LATE** — the Exit artifact line's withdrawn claim |
| `scripts/build-browser-tests.mjs`, `scripts/check-markdown.mjs`, `test/definition/l4-corpus.test.ts`, `src/**`, `doc/decisions/**`, `package.json`, `deno.json` | PREDICTED UNNEEDED | **all UNNEEDED, as predicted** |

*Seven declared exceptions, **zero undeclared**.*
