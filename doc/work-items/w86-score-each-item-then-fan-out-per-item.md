# W86 — score each item, then fan out per item, on real workers

**Status:** done
**Plan:** [P22](../plans/p22-what-a-regions-identity-is.md) — *what is a region's identity, and may a
region open inside a `map` region?*

```
Spec:       NONE — this item writes no rule and moves no rule id. `check:spec` stays
            **7 / 61 / 108**. An exit artifact demonstrates what the plan's first two items
            decided; a rule it needed would mean ADR 0062 or W85 shipped short.
            *(One `spec/` SENTENCE moves and it is a COUNT rather than a rule — see the
            exceptions table: `spec/outcome-record.md` section 4 states the corpus's
            task-node split and `test/fold/result-value.test.ts` DERIVES it from both
            corpora on every run, so a new flow document obliges the sentence. That is
            W54's adequacy reader's mechanism working, and it is declared rather than
            discovered.)*
Owns:       examples/**, AGENTS.md, README.md, examples/README.md, package.json, deno.json
Inputs:     P22 decisions 1-7, its facts 1 and 4 and its prediction 3, RE-TAKEN on this tree
            before anything is edited (the six-row table below); W85's Record — Q349, Q353 and
            the measurement that a per-instance key is observable only where two instances are
            alive at once; W84's Record; **`examples/l6.ts`'s own `soleRegion` comment**, which
            W84 shipped and which dates two SILENT sites to this item BY NAME (see the note under
            Outputs); ADR 0062 rules 1-5 and
            consequences 1, 5, 6 and 7; ADR 0046 rule 3 / `RN-R13`; ADR 0058 (`start` returns
            a handle); ADR 0054 (a type is a derivation); ADR 0056 (`examples`);
            ADR 0055 (a group factory).
Outputs:    (1) `examples/flows/fan-out-per-item.flow.json` — *score each item, then fan out
                per item*: a `map` whose branch opens a second `map`, so one opener has N
                INSTANCES and BOTH arities come from run-time data
            (2) `examples/workers/shard.ts` — the ONE new worker stop-and-ask (c) grants,
                returning a per-item LIST directly, so no transform is in the artifact's road.
                **Whether the grant was used is reported either way**
            (3) TWO L6 rows in BOTH runtimes, and L6 MOVES — the artifact and its CONTROL,
                which is the same document at ONE item
            (4) the OVERLAP, DERIVED from the run's own fold-input sequence and asserted: two
                instances of one opener holding collections at one instant, and which of them
                closed first
            (5) the two SILENT sites `examples/l6.ts`'s own `soleRegion` comment dates to this
                item, both decided — `Expectation.regionInstances`, a `joined` clause that carries
                the instance COUNT, a rendered table that prints one line per INSTANCE, and
                `soleRegion`'s REFUSAL asserted against its ANSWER as a pair
                *(**the attribution that comment carries has no referent and is corrected rather
                than repeated**: it credits *W84's conformity reader, finding 10*, and W84's file
                enumerates no such numbered finding — it does not contain the string `soleRegion`
                at all. The measurement is real and re-take row 5 reproduces it; the provenance is
                unverifiable from the tree. **That is W85's own finding one item later** — *a
                citation with no referent, in four places including shipped test prose* — with the
                citation this time INHERITED from the predecessor's shipped code rather than
                invented. W86's conformity reader, finding 5)*
            (6) `AGENTS.md` section 17 and `README.md`'s fifth paired fence, held byte-equal
                by `X8` and EXECUTED by `npm run gate`
            (7) the package at **`0.4.0`**, with `README.md` naming BOTH halves of the break
Depends on: W85
Blocks:     nothing — P22's retro follows
Tests:      `examples/l6.ts` at ladder L6, in node 24.20.0 and deno 2.9.6. **Every expected
            value is derived from the DOCUMENT and from `spec/` before any run is read**: each
            dispatched id from `spec/task-id.md`'s four-segment scheme and `branchPathOf`'s
            walk; each region instance's key from the opener's own position; each collection's
            key set from `JP-R12`'s *one entry per branch that emitted `branch.arrived`*; each
            inner branch's ROAD from `isLowScore`'s own threshold over `shardConfidence`'s
            scale. The two rows' every number is a function of their two payload strings.
Gate:       L6 in BOTH runtimes (it MOVES — this item says by how much); `check:docs`;
            `check:markdown`; the full `npm run gate`. **And L0 and L1-L5**, which the plan's
            row does not name and which this item needs: it edits `examples/**`, which
            `typecheck:examples` and `lint` read, and **L1-L5 must be UNMOVED at 47 / 1322** or
            it has reached past its `Owns` ([Q348](../open-questions.md), W85's precedent).
Reserves:   Q358-Q363, ADR 0063 (expected unused)
            **The block is EXTENDED from the two P22 left.** P22 reserved Q345-Q359; W84 took
            Q346-Q351 and W85 took Q352-Q357, leaving two for an exit artifact where the last
            four items raised four to six each. Extended to Q363 by grep off the tree — the
            highest id anywhere is **Q357**, and Q358-Q359 are this item's — on P11's (twice),
            P12's and P17's precedent.
```

## Scope

**In**

1. **The FLOW, and it is the one this library could not express.** A `map` over a list whose
   branch task opens a second `map` over a list THAT BRANCH computed. The inner region is a `map`
   (stop-and-ask (c)), so its arity comes from run-time data at both levels — the hard case, and the
   one [W33](w33-a-map-at-run-time-arity.md)'s refusal existed for.
2. **The OVERLAP, derived and asserted.** W85's whole finding is aimed here: *a per-instance key is
   observable ONLY where two instances are alive at once* ([Q349](../open-questions.md),
   [Q353](../open-questions.md)), and ADR 0046's eager release is what takes that window away. A real
   pool does not arrange it, so this item ARRANGES it, DERIVES it from the run and asserts it — with
   the arrangement's own effect asserted beside it, which is
   [W17](w17-the-all-exit-row-at-l6.md)'s lesson.
3. **The two sites W84 dated to this item.** `examples/l6.ts`'s own `soleRegion` comment names two
   callers at which a multi-instance region is SILENT, and names W86 as where they have to be
   decided. Both are — and a third, which that enumeration does not name: `regionsOf`'s filter hid
   an ABSENT region by the same expression that hid a multi-instance one.
4. **The REFERENCE** — `AGENTS.md` section 17, `README.md`'s paired fence, `examples/README.md`'s
   counts.
5. **The VERSION** — `0.4.0`, with `README.md` naming BOTH halves of the break.

**Out** — named rather than left implicit, with where each goes instead

- **`src/**`, `spec/**` as a RULE, `test/**` as a subject.** W84's and W85's. An edit to `src/` here
  would mean ADR 0062 shipped wrong and would be recorded as a correction to the plan; none is taken.
  *(**One** `test/**` file and one `spec/` sentence carry corpus CENSUSES and are edited as declared
  exceptions — see the table. Neither is a rule and neither is a subject of this item.
  `test/fold/result-value.test.ts` is UNTOUCHED and correctly so: it PARSES the census sentence out
  of `spec/outcome-record.md` and compares it to a count derived from both corpora, which is why the
  sentence moves and the test does not. W86's conformity reader, finding 3.)*
- **Reopening ADR 0062's key, the lift, or what N = 0 means.** Decisions 1, 4 and 6, taken on
  measurements. This item may find any of them WRONG and say so; it may not re-argue them
  (`doc/workflow.md` section 6 pass 3 rule 1).
- **[Q206](../open-questions.md)** — sibling regions nested inside ONE map region, and a region's
  collection reachable by no reference. Declared OUT by the plan.
- **[Q350](../open-questions.md)** — widening `RN-R6`'s cross-policy walk under nesting. W84 built
  the repair, it is RED, and the red is right.

## What the declaration step re-took before anything was edited

*P22 stop-and-ask (a) was answered **nothing is checked in**, so `dev-dist/` is ignored and there is
no artefact to read: re-running is the only road any fact has to this item (P15 decision 5). Six
rows, every rung RUN and redirected to `dev-dist/p22-w86/` and read by `$?`, with
`node --version` asserted `v24.x` in every shell.*

| | what was re-taken | verdict |
|---|---|---|
| 1 | **The baseline**, every rung run separately | **HOLDS EXACTLY, with no drift in any figure.** L6 **1724 / 58** in node 24.20.0 AND deno 2.9.6; L1-L5 **47 files / 1322 assertions** in node, deno and chromium (parity asserted); `check:spec` **7 / 61 / 108**; `check:docs` **34 — 28 run, 6 check**; `check:workers` **16 / 16 / 0 / 2 / 0**; `check:markdown` **146 documents, 6554 relative links, 342 anchored**; `lint` EXIT 0; package `0.3.0` |
| 2 | **P22 fact 1** — the key measurement | **REPRODUCES to the document**, with its SCOPE stated: over `spec/examples/valid` and `examples/flows` — the *both corpora* the plan means — **45 documents, 33 region-bearing, 50 regions**, key (b) qualifying on **6 of 50**, key (c) on **0 of 50**, openers inside a map region **0 of 50**. *(A probe that also walks `spec/examples/wiring` reads 51 documents and the same 50 regions, because those six carry none — which is why the plan's 45 and a 51 are the same measurement under two scopes.)* |
| 3 | **P22 fact 4** — depth three | **NO LONGER A FACT TO RE-TAKE; it is a shipped test.** W85's `THREE_MAPS` runs `map -> map -> map` at 2x2x2 at L1-L5 in three runtimes, and its `C` opener has four instances. The baseline run of `npm test` IS the re-take, and it is green |
| 4 | **Prediction 3, the REACH** — *a consumer needs no reshaping node and no second flow* | **CONFIRMED, and its stated reversal condition was measured rather than assumed.** The flow declares **zero** `needs` and **zero** `transform`, and the road from the outer map's branch entry to the inner map is **ONE node**. Its reversal clause names three ways it could fail — arity, `needs`, or *because a real pool interleaves two instances in a way the fake does not* — and none fired. **The third is the one that could only be answered here and it went the other way**: a real pool interleaves the two instances LESS than a fake does, because a fake settles what you tell it to and a real pool's dispatch order is FIFO. *The reach held; what needed arranging was the OVERLAP, not the flow* |
| 5 | **Q352's lesson applied to this item** — the gap W84 dated here, SITE BY SITE | **The `soleRegion` comment names TWO sites and both reproduce, in the two different directions it records.** The `joined` caller reads `soleRegion(...)?.joined ?? null`, so a region with two instances becomes `null`, which **eight** `EXPECTED` rows declare; `regionsOf` FILTERS such a region out of the rendered table. **And a THIRD site the enumeration does not name was found the same way**: `regionsOf`'s filter also hides a region that is simply ABSENT, so the two failure modes were one expression. All three decided |
| 6 | **Whether a new WORKER is needed, and whether the grant is USED** | **USED, and the plan's own measurement is why.** `split` reads `payload.text` through `wordsOf` and a map item is `{ word, confidence }`, so the draft's *reuse `split` twice* returns an EMPTY list and decision 6 makes the inner region `stuck` — re-derived here from `shared.ts` rather than inherited. One worker, `examples/workers/shard.ts`, returning a per-item list directly. **This is the SECOND consecutive plan to grant the permission and the FIRST to use it**; P21's was measured UNUSED by [W81](w81-what-a-settlement-costs.md) |

**And the re-take found two things the six rows do not cover.** **P22 fact 1's headline ZERO is what
this item REMOVES**, and that is worth stating as a number rather than as a sentence: the plan says
*openers inside a map region: 0 of 50 — that zero IS the refusal*, and on the tree this item ships it
is **1 of 52**, over **46 documents and 34 region-bearing**. `branchPathOf(regions, 'perShard')`
**THROWS `ID-R6`** on that opener, because a static walk cannot supply the item index — which is ADR
0062 consequence 6's *those three are what make the derived key TOTAL*, reached from the outside.

And **the declaration's own arithmetic for the row costs was derived on paper and matched the run
exactly**: 22 base + 30 extras for the artifact and 22 + 16 for the control, plus 13 cross-row, is
`1724 + 90 + 13 = 1827`, which is what the FIRST green run printed. **The tree it ships is
`1724 + 90 + 19 = 1833`** — the six between them are the clauses the two readers forced, every
one of them cross-row: a SECOND ROAD to the overlap, a second road to the detector,
`soleRegion`'s refusal against its answer as a pair, the printed table naming both instances,
and the two guards that make this block REPORT rather than crash when a key or a field stops
matching. *The arithmetic held at every step and the number it lands on is not the one the
declaration derived, which is what a reader pass is for* (W86's conformity reader, finding 4).

## Exceptions — every file this item edits outside its `Owns`

*`doc/workflow.md` section 7 rule 2. Section 1's record step (`CLAUDE.md`, `doc/README.md`,
`doc/open-questions.md`, `doc/plans/**`, `doc/work-items/**`, `doc/decisions/**`) is not listed here.
**This table did not exist until the item's conformity reader asked for it** — the file cited *the
exceptions table* twice and had none, which is W6's own case and the reason section 7 says a
declaration is checked rather than believed (finding 2). Three of the five were PREDICTED at the
declaration step and two were not, and which two is the datum.*

| file | why | predicted? |
|---|---|---|
| `scripts/check-workers-selftest.mjs` | its `CONTROL_LINES` pin the whole `check:workers` tally as a REGEX LITERAL, so a seventeenth worker takes that gate entry RED while `check:workers` itself stays green. [Q342](../open-questions.md), at its second recorded firing | **yes** |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 28 → 29 and `README_SNIPPET_FLOOR` 4 → 5 (Q102's ratchet, the item that adds a snippet raises the floor); the `X8` pair list gains section 17; and **`X9` is a new check** — the version `README.md` states against both manifests, which this item's own probe `h1` measured at ZERO | the floors **yes**; `X9` **no** — it is a survivor the rule 8 pass found |
| `scripts/check-docs-selftest.mjs` | `X9` needs a probe and a grading, because `ALL_CHECKS` is DERIVED from `check-docs.mjs`'s own `checks` array and the coverage bound refuses a check id with no grading; `MIN_PROBES` 33 → 34 and `MIN_META` 20 → 21 | **no** — it follows from `X9` |
| `test/definition/wiring.test.ts` | its L6 corpus census is pinned as literals — 26 flows, 65 fits — and a new flow document moves both. [Q342](../open-questions.md)'s class outside the corpus | **yes** |
| `spec/outcome-record.md` section 4 | its task-node split is pinned in PROSE and `test/fold/result-value.test.ts` DERIVES the same four figures from both corpora on every run, so a new flow document obliges the SENTENCE. **A `spec/` edit in an item whose `Spec:` line reads NONE** — and it moves no rule id, so `check:spec` is unmoved | **no** — the third census, and the only one in a normative document |

## Verification

How each clause of `Gate:` is run. Commands named, each RUN and redirected, never piped
(`doc/workflow.md` section 4).

| Clause | How |
|---|---|
| **L0** | `npm run lint`, then each typecheck lane SEPARATELY — `tsconfig.node.json`, `.browser`, `.tests`, `.examples`, and `deno check index.ts src/`. Separately, because `npm run typecheck` is five lanes chained by `&&` and a RED report names its FIRST failure and is silent downstream |
| **L1-L5, three runtimes** | `npm test`, `npm run test:deno`, `npm run test:browser`. Expected **UNMOVED at 47 / 1322** — an item that adds no `test/**` case and no `src/` behaviour moves no rung below L6, and a moved count means it reached past its `Owns` |
| **L6 in BOTH runtimes** | `npm run test:l6` and `npm run test:l6:deno`. **It MOVES and this item says by how much**, which is the plan's own wording for the exit artifact |
| **`check:docs`** | `npm run check:docs` and `npm run check:docs:selftest`. **In the `Gate:` line from the START**, which is [Q348](../open-questions.md): W84 shipped with this rung unnamed and could have taken a gate entry red with its own gate green, because `AGENTS.md`'s executed snippets carry literals no typecheck lane reads. This item OWNS `AGENTS.md`, so the rung is load-bearing |
| **`check:markdown`** | `npm run check:markdown` and its self-test. **[Q142](../open-questions.md) is measured BEFORE the record step**, on the CUT TREES themselves rather than on the whole one |
| **the full `npm run gate`** | run whole, twice: once before the record step and once as the confirming gate over the final tree, with the tree held still by a content digest at both ends |
| **conformity reader** | fresh context, `spec/` first and code second. Its central obligation: derive **every region instance's key, every collection's key set, every dispatched id, each inner branch's ROAD and the whole overlap sequence ON PAPER** — from `JP-R12`, `branchPathOf`, `isLowScore`'s threshold and `shardConfidence`'s scale — for both rows, before reading any output |
| **adequacy reader** | isolated copy, TWO named targets. **(a)** Could the L6 row be green on a run in which the two region instances never overlapped — i.e. is the interleaving DERIVED from the run or hoped for? **(b)** Is the reference's snippet asserting the CAPABILITY, or only that a run completed? |
| **re-run at `<sha>`** | rule 8's set re-run with both readers' exact edits checked in |

**Routing cases this item covers** (`doc/workflow.md` section 7): **a nested fan-out**
([Q6](../open-questions.md)) — two `map` regions, one inside the other's branch, on real workers, at
widths two and three that no document carries; **a duplicate task id** ([Q13](../open-questions.md))
— `ID-R1` asserted per row, and the dotted ids `0.0`, `0.1`, `1.0`, `1.1`, `1.2` are minted at an
arity the run chose. **Not applicable**: a branch routed away from its join
([Q4](../open-questions.md)), `user_action` ([Q17](../open-questions.md)) and no matching decision
edge ([Q10](../open-questions.md)) — every branch of this flow arrives and its one decision always
has an eligible edge, which is deliberate: the row's subject is the KEY, and a failure road would
make a red row ambiguous between the nesting and the road. W85 drives all three at L2 under nesting.

## Record

**Gate — what ran.** Each verdict starts with `RAN` or `NOT RUN`; a clause with no row reads as
*did not run*.

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint` and five typecheck lanes | **RAN, EXIT 0, each lane SEPARATELY** | `tsconfig.node.json`, `.browser`, `.tests`, `.examples`, `deno check index.ts src/`, plus `npm run lint`. Separately, because `npm run typecheck` is five lanes chained by `&&` and a RED report names its FIRST failure and is silent downstream |
| L1-L5, three runtimes | **RAN, EXIT 0 — 47 files / 1322 assertions, UNMOVED** in node 24.20.0, deno 2.9.6 and chromium, parity asserted | the declared result: an item that adds no `test/**` case and no `src/` behaviour moves no rung below L6. *(Its `Gate:` line offers this as the detector for having reached past `Owns`, and the conformity reader's finding 1 is that it is not one: L1-L5 is unmoved and the item reached past `Owns` in **five** files. The audit is the exceptions table, which that reader is why this item has.)* |
| **L6 in BOTH runtimes — it MOVES** | **RAN, EXIT 0 — 1833 assertions over 60 real runs** in node 24.20.0 AND deno 2.9.6 | from **1724 / 58**. `1724 + 90 + 19`: 52 assertions for the artifact row (22 base + 30 extras), 38 for its control (22 + 16), and 19 cross-row — 17 before the derived-count check and 2 after it. **The first green run printed 1827**; the six between are the clauses the two readers forced |
| `check:docs` | **RAN, EXIT 0 — 35 snippets: 29 run, 6 check**; self-test **34 probes / 21 gradings** | `X8` pairs FIVE README snippets now; **`X9` is new** — the version `README.md` states against both manifests, which this item's own probe `h1` measured at ZERO. `RUN_FLOOR` 28 → 29 and `README_SNIPPET_FLOOR` 4 → 5, both Q102's ratchet and the second found by both readers independently |
| `check:workers` | **RAN, EXIT 0 — 17 workers: 17 ran on a declared example, 0 on the witness, 2 not checked, 0 refused** | from 16 / 16 / 0 / 2 / 0. The seventeenth is `shard.ts`, and it took `check:workers:selftest` RED on a tally pinned as a regex LITERAL — [Q342](../open-questions.md) at its second recorded firing, predicted and declared |
| `check:markdown` | **RAN, EXIT 0 — 147 documents, 6638 relative links, 348 anchored** | **[Q142](../open-questions.md) measured BEFORE the record step and does NOT fire**, on the CUT TREES themselves rather than on the whole one: probe 1's tree (`doc/decisions` removed) is **112 files against `M3`'s floor of 123 — margin 11**, and probe 2's (`doc/decisions` and `doc/plans` removed) is **4927 links against `M4`'s 5270 — margin 343**. This item adds documents to `doc/work-items/`, which NEITHER probe cuts, so both margins narrow by them and neither floor is retuned |
| `check:spec` | **RAN, EXIT 0 — 7 / 61 / 108, UNMOVED** | no rule id is added or retired. One `spec/` SENTENCE moves and it is a COUNT — see the exceptions table |
| the full `npm run gate` | **RAN, EXIT 0, ZERO `FAIL` lines, 31 chain entries** | `selftests` **8 / 8 completed, 8 ok, 978.1 s wall, 1996.8 s serial-equivalent, 6 lanes**. Run FOUR times: green before the readers at digest `3d192ccb6748fee1` over 387 files; **`GATE EXIT=2` with ZERO `FAIL` lines** on the first run over the post-reader tree — see *What broke*; green again whole after the type import; and a FINAL confirming gate over the tree this item ships at digest **`313f4befdfb4dafa` over 387 tracked-and-untracked-unignored files, IDENTICAL at both ends**, `selftests` 972.1 s wall over 6 lanes. The counts it printed: `check:spec` **7 / 61 / 108**, `check:docs` **35 — 29 run, 6 check**, `check:workers` **17**, `check:markdown` **147 / 6635 / 348**, L1-L5 **47 / 1322** in node, deno and chromium, L6 **1833** in BOTH runtimes. *The exit code is the predicate and the FAIL count is the secondary signal* (section 4, v0.15) — both are recorded, and the rung was RUN and redirected rather than piped |
| conformity reader | **RAN** | **its central obligation came back with ZERO disagreements on the VALUES** — every dispatched id in order, every region instance's key, every collection's key set, each inner branch's ROAD, the full close order with `perShard@0` still holding at `perShard@1`'s close, what `publish` receives at two levels, and both run outcomes, all derived on paper from `spec/` before any output was read, for BOTH rows, and all agreeing. **Its headline is a finding about the AUTHOR** — see *What broke* |
| adequacy reader | **RAN — 34 mutations, 14 survivors, 6 BLOCKING** | both named targets answered, and (a) SURVIVED IN PART |
| re-run at `<sha>` | **RAN — 43 probes over THREE passes, 33 caught, 10 classified, 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration on the final pass** | pass 1 **22 / 15 caught**, pass 2 **40 / 28** with both readers' exact edits checked in, pass 3 **5 / 5** after the two defects pass 2 found in the author's own fixes. Controls green at every rung at both ends of every pass; digest `978011651686b61a` over 387 files at both ends of pass 2 and `0825f616b1faf854` at both ends of pass 3 |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the flow | **yes** | `e1` (one shard per word rather than per character) **31** at L6; `e2` (every shard high-confidence, so the second pass is never reached) **18**; `validateDefinition` returns zero findings and `checkWiring` four `fits` |
| (2) the worker, and whether the GRANT was used | **yes, and it WAS** | `h2` (a shard outside its own declared bound) **1** at `check:workers` and **20** at L6. *This is the SECOND consecutive plan to grant one new worker and the FIRST to use it; P21's was measured UNUSED by W81* |
| (3) two L6 rows, L6 MOVES | **yes — 1724 / 58 → 1833 / 60** | `d1` (a row key renamed) — and it was a CRASH with zero failure lines until this item's own probe found it |
| (4) the OVERLAP, derived and asserted | **yes, and by TWO roads** | `x2` (the second pass's road flattened, so the windows never overlap) **4** at L6, all four the overlap clauses *(this read 3, taken before the second road the adequacy reader forced existed — P22's retro, and W86's own pass-2 log already reads 4)*; `a2` (Q353's mutation) **2**; `r1` (the adequacy reader's tautology, which cost ZERO with all four controls green) — caught by the index relation that reader forced |
| (5) the SILENT sites decided | **yes, and THREE rather than two** | `f3` (`regionsOf` back to filtering) **1**; `soleRegion`'s refusal against its answer as a pair — the first LIVE case that helper's refusal has ever had. The `{instances}` pair is a declared CEILING with the tree that fails it NAMED (`f1a`/`f1b`) |
| (6) the reference, executed | **yes** | `g2` (README's fence edited alone) **1** at `check:docs` via `X8`; `g3` (the snippet's own SUBJECT broken) **1** — so the snippet asserts the CAPABILITY and not only that a run completed, which is named target (b) |
| (7) `0.4.0`, with the break NAMED | **yes** | `h1` (the manifest reverted) cost **ZERO** until `X9`; `deno.json` alone reverted costs **1** |

**What broke.**

**THE TREE WAS NOT HELD STILL UNDER A READER, SIX TIMES, AND THE AUTHOR DID IT BY DOING THE RIGHT
THING.** `doc/workflow.md` v0.15 change 2 — *a whole-tree measurement is taken with the tree HELD
STILL* — was earned by [W51](w51-the-sibling-region-flow-on-real-workers.md)'s conformity reader
catching `examples/l6.ts` at six digests with one snapshot RED on correct code. This item ran its two
readers **concurrently**; the adequacy reader reported first with six blocking findings; acting on
them was obligatory and was also six edits under the other pass. The conformity reader observed every
one, opened AND closed its report on it, and stated the consequence exactly: its `npm run gate`
verdict is about a tree that no longer exists, and **three of its findings were fixed while it was
writing them up**. *The clause is written for ONE reader and section 6 asks for two*
([Q363](../open-questions.md)) — and what it costs to obey is the wall clock of a whole reader pass,
which is what this item should have paid.

**The adequacy reader's named target (a) SURVIVED IN PART and it is the item's sharpest finding: the
headline clause could be made a TAUTOLOGY with all four declared controls green.** `maxTogether`,
`closedOrder` and `othersAtClose` are three PROJECTIONS of one walk, and every control read a
different one — so emptying `othersAtClose` and keying one entry off how many regions the run closed
cost **ZERO**. v0.22's clause is satisfied and short: each control does name a tree on which it fails
and its claim passes, and *that tree fails the claim too*, so the control never had to discriminate
([Q362](../open-questions.md)). Closed by a second EXPRESSION over the same sequence — its own
INDICES — which no projection of the walk can reach.

**Its finding 2 is the same shape one clause over**: the detector's `map` arm could be hard-coded to
`perShard` with the `fanout` arm left real, and the declared control — which asks that the fanout arm
find something ELSE — passed unchanged, because it had been written against a detector that hard-codes
BOTH arms. Closed by `ID-R6`'s REFUSAL as a second road, which is ADR 0062 consequence 6 turned from a
sentence into a set.

**And its finding 3 is this item's own repair shipped at one site while the identical defect went out
one block over.** Probe `d1` found that a renamed row key made block (2f) die in a `TypeError` at exit
1 with ZERO failure lines; the fix was made there, and the `regionInstances` block one screen down had
the same shape — renaming that field masked **six** named detections behind a crash. *An author who
has just written* a crash is not a detection *is not thereby immune to the next instance of it.*

**The author's own probe was CAUGHT for the wrong reason.** `x1` was declared as *`arrivals` keyed by
the opener alone* and collapsed only the WRITE, leaving `releaseArrivals` naming the real instance —
so nothing was ever released and **60** failures came from every row of the rung rather than from the
keying. Rule 8's requirement that a provocation *fires for the reason it names*, read on the author's
own set. Corrected as `x1b`, which collapses the write, the read and the release.

**A `catch` that treats ANY throw as the answer.** The `ID-R6` clause written to close the adequacy
reader's finding 2 shipped without `branchPathOf` in this file's import list, so every call threw a
`ReferenceError`, the bare `catch` read all 37 of them as the refusal, and the clause reported the
entire corpus as nested-in-a-map. Caught by its own first run. *Section 4's* a crash is not a
detection*, on the EXPECTED side of a comparison.*

**The instrument was un-dropped by the fix for its own arithmetic.** W55's conformity reader's
BLOCKING finding was that the peak sampler's snapshot is reachable from `driver.opts.onFoldInput`,
which `retainedBytes` skips BY NAME, so a kept driver retains a second copy of the collection ADR 0046
releases — answered by dropping the instrument once it has been read. This item re-keyed the sampler
per INSTANCE and made `peakSnapshot` a local the fold builds, so `peakSnapshot.clear()` went on
clearing a fresh Map nobody holds while `samplePeak` closed over `peakByInstance`, which is the thing
that retains. Found by the author re-reading that line **during the reader window** and HELD until
both readers had reported, which is the one thing this item did right about v0.15 change 2.

**The retention observer's PEAK was keyed by the OPENER and its peak is a max over TIME**, so under
nesting it read **6** where the branches that arrived are **7** — the row's own first run is what said
so. `arrivalsOf`'s flatten is lossless in the KEYS and was never lossless in TIME
([Q359](../open-questions.md)).

**THREE corpus censuses pinned OUTSIDE their corpus fired and only TWO were predicted**
([Q360](../open-questions.md)): `check-workers-selftest.mjs`'s tally, `test/definition/wiring.test.ts`'s
L6 census, and `spec/outcome-record.md` section 4 — the unpredicted one being the only one in a
NORMATIVE document, in an item whose `Spec:` line reads NONE.

**A citation with no referent, inherited rather than invented.** *W84's conformity reader's finding
10* is cited in `examples/l6.ts`'s own `soleRegion` comment, which W84 shipped — and W84's file
enumerates no such numbered finding and does not contain the string `soleRegion` at all. W86 inherited
it and repeated it in ten places. **That is [W85](w85-what-a-nested-region-carries-and-how-it-ends.md)'s
own finding one item later** — *a citation with no referent, in four places including shipped test
prose* — with W85's Record among this item's declared inputs. The measurement reproduces; the
attribution is corrected everywhere rather than repeated.

**Rule 8 — 43 probes over THREE passes, 33 caught, 10 classified, ZERO UNDECLARED survivors, ZERO
crashes, ZERO aborts, ZERO against declaration on the final pass.** *(**The final pass is pass 3's FIVE
probes** — P22's retro. Re-run whole on the shipped tree, this set's own harness prints SIX against
declaration, every one a probe this Record reclassified in PROSE and not in the set: `b1`, `b2`, `r1`
and `r2` still declared to go RED, `h1` and `a2b` still declared to SURVIVE. The classification below
is right and the set disagrees with it, exactly as it did at pass 2.)* Controls green at every rung at
both ends of every pass; the tree held still by a content digest over TRACKED and
UNTRACKED-UNIGNORED files — `978011651686b61a` over 387 files at both ends of pass 2 and
`0825f616b1faf854` at both ends of pass 3. The ten classified are **SEVEN declared CEILINGS each with
the tree that fails it NAMED** (`b1`, `b2`, `f1`, `r6`, `g1`, `r9`, `r13`) *(this read *six* beside
the seven it lists and the ten it totals, until P22's retro corrected it under `doc/workflow.md`
section 6 pass 3 rule 6)*, **two VACUOUS by rule 8's
own definition** — a literal set-EQUAL to the value it replaces, which is
[W47](w47-the-blocked-flow-on-real-workers.md)'s `c3` verbatim (`r2`, and `r1`'s tautology, which is
a TRUE statement on this tree) — and **one semantically equivalent** (`r11`, the driver's own
recorded alternative derivation of `regionPath`).

**THE MEASUREMENT, and it is the item's central number: what the OVERLAP buys, from both sides.**

| | overlap PRESENT | overlap REMOVED | what the difference is |
|---|---|---|---|
| `arrivals` keyed by the OPENER ALONE, at all three sites (`x1b` / `x3b`) | **3** | **1** | the two that go are *what `publish` received* and `JP-R12` at two levels — **the wrong key gives the RIGHT answer** once the windows do not overlap, because ADR 0046 rule 3 releases eagerly. The one that remains is the per-INSTANCE retention peak |
| every collection filed under the opener's FIRST OPENED instance — Q353 (`a2` / `a2b`) | **2** | **0** | the same two clauses, and nothing at all is left |

*That is [Q349](../open-questions.md) and [Q353](../open-questions.md) turned from a sentence into a
pair of numbers, on real workers.* The overlap-removing edit is one field of one node type
(`SecondPass`'s `delayMs`), so the two arms differ in the ROUTE and in nothing else. *(**The
overlap-REMOVED column is the cost ABOVE `x2`'s own**, which every probe in that column pays for
removing the overlap: on the tree this item ships `x2` is **4**, `x3b` **5** and `a2b` **4**, so the
keying costs 1 and 0 as the table says — as increments. The table stated them as costs; P22's retro
re-ran all three and found the pass-2 logs agreeing with it.)*

**And the second road is measured the same way.** The adequacy reader's tautology (`r1`) is TRUE on
the shipped tree and nothing can fire on it; on the tree where the claim is FALSE it costs **3 of 4**
(`r1b` against `r1c`), and **the index relation is among the three**. `r2`'s hard-coded arm is
set-equal here; hard-coded to a DIFFERENT opener (`r2b`) the two roads disagree and both fire, at 2.

**The re-run found TWO defects in the AUTHOR'S FIXES and neither in the product**, which is v0.8's
founding observation and what a second pass is for: the reach counters written for the adequacy
reader's findings 4 and 5 read `reports.length` and `walksHere.length`, **neither of which the
mutation they were written against touches** — so both of that reader's exact edits survived the fix
for them. Corrected by incrementing inside the walk and inside the predicate; both now caught at 1.

**THE CONFIRMING GATE CAME BACK `GATE EXIT=2` WITH ZERO `FAIL` LINES, AND THAT IS THE CRASH
DISCRIMINATOR FIRING ON THE AUTHOR'S OWN LAST EDIT.** `doc/workflow.md` section 4: *a non-zero exit
with ZERO named failures is a CRASH, not a detection* — and the crash was
`examples/l6.ts(6920,27): error TS2304: Cannot find name 'FoldInput'`, in the SECOND ROAD written to
close the adequacy reader's finding 1. **`lint` and both L6 rungs STRIP types**, so the three rungs
this item had re-run after acting on its readers could not see it; the only rung that reads it is
`typecheck:examples`, which this item's own `Gate:` line names and requires to be run SEPARATELY, and
which was last run before the reader fixes existed. *Section 1 rule 5's WHEN clause — a measured
number is RE-TAKEN on the tree the item ships — applied to a RUNG rather than to a number*: an L0 lane
re-run at the declaration step and not after the readers is an L0 lane that was run on a different
tree. Fixed by importing the type; all five lanes and `lint` then EXIT 0 separately, and the gate was
re-run whole.

**What this taught.**

**An overlap is not a property a real pool gives you; it is one you ARRANGE.** A `map` dispatches
every instance of its branch at once, so with one FIFO pool each instance's tasks are contiguous in
the queue and each window closes before the next opens — *a real scheduler interleaves two region
instances LESS than a fake does*, which is the opposite direction from the one P22 prediction 3's
reversal clause imagined ([Q358](../open-questions.md)). What produced the overlap here is a ROAD that
differs per instance and a stagger in the node between the two maps, and W17's lesson is why the
arrangement's own EFFECT is asserted beside it.

**And a CONTROL over a projection is not a control over the derivation.** Four controls, each naming
a tree, none of them able to see the claim beside them go vacuous — because all four read the walk
the claim reads. *Counting observers means counting DERIVATIONS, not expressions.*
