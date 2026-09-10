# W42 — What a decision sees

**Status:** done
**Plan:** [P12](../plans/p12-what-a-node-receives-and-what-a-decision-sees.md)

```
Spec:       spec/flow-definition.md section 3 - routing rule 4, which has named
            Q8 by id since v0.1 and says "adding a field later is additive
            rather than a signature change". This item is that sentence
            being acted on or being corrected.
Owns:       src/driver/routing.ts, src/driver/driver.ts,
            spec/flow-definition.md section 3, test/driver/**,
            doc/decisions/0041-*.md
            (written from P12's index row, not from this item's title -
            doc/workflow.md section 7 rule 2. NOTE what the row does NOT
            give it: src/definition/**, and therefore no validator rule of
            its own. If Q8 needs one, that is the item's first finding
            rather than a late exception.)
Inputs:     ADR 0040 and spec/flow-definition.md v0.11 section 3's `needs`,
            read from the shipped files rather than from W41's Record;
            P12 fact 2 (Q8 is one field and one call site) and P12
            decision 1 (Q11 is decided FIRST, so that "what is cheap to
            hand a predicate" does not decide what a worker receives);
            src/driver/routing.ts's DecisionContext, which has carried
            exactly one member and a comment naming Q8 since P1.
Outputs:    (1) Q8 ANSWERED - what a decision sees, in spec/, with an id.
            (2) Whatever DecisionContext becomes, and its one construction
                site.
            (3) A corpus flow or an L2 fixture for P12's third blocked
                flow - *route to review if any earlier step flagged low
                confidence* - which is the case Q8's row has carried since
                P1 and which this library cannot express today.
            (4) ADR 0041, or a recorded verdict that it was not needed and
                WHY - P12 prediction 3 says it will not be, and a
                prediction confirmed without a stated reason is hindsight.
Depends on: W41 (done at 69429b2) - the mechanism, the key, and FD-C1/FD-C2
Blocks:     W43
Tests:      Expected values from spec/, never from output (doc/workflow.md
            section 5 rule 1). L2 in test/driver/ for what a predicate
            receives, over a fixture log with no scheduler - a predicate is
            a pure function of a DecisionContext, so the whole of this item
            is reachable at L2. The routing cases spec/ names are a
            coverage checklist with addresses: FD-R1, FD-V7's default edge,
            and a `user_action` settlement, which routes NOWHERE.
Gate:       L0-L5 in three runtimes, then the two spec-conformity readers,
            then rule 8's whole set re-run with the readers' edits checked
            back in. `npm run gate` at GATE EXIT=0 with zero FAIL lines.
Reserves:   Q190-Q193, ADR 0041
```

## Scope

**In**

1. **[Q8](../open-questions.md) — does a decision see only its node's output, or accumulated run
   state?** Answered, with the answer in `spec/`, from the same mechanism ADR 0040 built rather than
   beside it (P12 decision 1's whole argument).
2. **The third blocked flow.** *Route to review if any earlier step flagged low confidence* is the
   case Q8's row has carried since P1. It is expressible or this item says why not.
3. **`DecisionContext`'s shape**, and the one site that constructs it.

**Out** — named rather than left implicit, with where it goes instead

- **[Q9](../open-questions.md) — predicate purity.** [P10](../plans/p10-is-fan-out-one-feature-or-two.md)
  declined it with a measurement and P12 declares it out: *nothing that widens `DecisionContext` makes
  a predicate more or less enforceable.* This item may not reach for it, and if widening the context
  turns out to change that, **that is a finding and a Q rather than a mechanism**.
- **Anything about what a WORKER receives.** ADR 0040 decided it and P12 decision 1 ordered the two so
  that this item cannot re-open it. `needs`, `FD-C1`, `FD-C2` and `FD-V26`-`FD-V28` are W41's and are
  settled.
- **`spec/join-policy.md` section 4.** P12 decision 3, unchanged: `JP-R11` and `JP-R12` are
  ADR 0037's.
- **A sixth node kind.** P12 decision 4.
- **The gate.** [Q181](../open-questions.md)-[Q183](../open-questions.md) are live and unowned.
- **[Q19](../open-questions.md)'s actual question** — whether retained state is bounded.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, node | `npm test` |
| L1-L5, deno | `npm run test:deno` |
| L1-L5, chromium | `npm run test:browser` (`npm run test:browser:all` if L1 moves) |
| static checks | `npm run check:spec` … `check:docs`, each by name |
| whole gate | `npm run gate` — `GATE EXIT=0` **and** zero lines beginning `FAIL` |

*An item that touches routing states which cases it covers.* **This item is entirely about routing**,
so every row is answered rather than deferred:

| case | |
|---|---|
| no matching decision edge ([Q10](../open-questions.md)) | **covered, and it is the closest neighbour.** `FD-R1` is asserted against the routing function directly, and whatever `DecisionContext` becomes has to reach that assertion unchanged |
| a branch routed away from its join ([Q4](../open-questions.md)) | **covered as a regression** — `p1-routed-away.flow.json`'s decision is the one this item's mechanism runs through, and its L5 cells must not move |
| `user_action` ([Q17](../open-questions.md)) | **covered, and it is the sharp one.** A `user_action` settlement routes NOWHERE, and a resumed node's predicate sees the **effective** outcome (section 3 rule 4). Whatever the context gains must have one answer at both moments or say which |
| a duplicate task id ([Q13](../open-questions.md)) | **not applicable** — no id is minted differently |
| a nested fan-out ([Q6](../open-questions.md)) | **covered, and this row was FALSE when it was written.** It said *covered* on the strength of the mechanism rather than of a fixture: every fixture in `test/driver/decision-context.test.ts` routed at `-`, so `resolveNeeds`'s `pathOf(node.id, itemIndices)` was never reached with a real path and forcing `here = '-'` cost **0**. **Both readers found it, from opposite ends** — conformity from this row, adequacy from that mutation. It is covered now by a decision INSIDE a **map** region at three item paths, each predicate seeing its own instance's output; a decision inside a nested **`fanout`** region is still not exercised, and saying *a map region* is the scope this was measured at |

## Record

**Status: done.** Author pass, both readers, and rule 8's set re-run with the readers' own edits
checked back in.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint`, `typecheck` | **RAN**, green | `deno lint` 48 files; five `tsc` projects. **It was RED TWICE, each time `exit 1` with ZERO `FAIL` lines** — an unused import at the author pass (W42's conformity reader, finding 1), and then a dead `const where = n.id` in `src/definition/validate.ts`, the aiming loop's own variable from before `aimedReferences` returned an `at`, left behind by the fix for that same reader's `FD-V28` finding. `lint` is the gate's first entry since ADR 0039, so **both times nothing after it ran at all** |
| L1-L5, node 24 | **RAN**, green | **24 files, 633 `test()` cases**, from 612 |
| L1-L5, deno 2.9.6 | **RAN**, green | 633, parity |
| L1-L5, chromium / firefox / webkit | **RAN**, green | 633 in each, `PARITY` in all three; `test:browser:all` because L1 moved |
| L4 — the corpus | **RAN**, green | **40 examples**, from 38: `decision-on-an-earlier-step.flow.json` and `FD-V26--edge-needs-uses-the-self-token.flow.json` |
| L6 | **RAN, and UNMOVED at 638 / 31** — the declared result. W42 owns no `examples/**`; W43 is the item that moves it |
| the seven static checks | **RAN**, green | `spec` (7 documents, 40 examples, **87 rules**), `source`, `wiring`, `markdown` (**85 documents, 3335 relative links, 167 anchored**), `scheduler`, `policies`, `docs`. **Re-taken on the tree this item ships** (v0.12 change 2): the link count read 3274 at the author pass and the `M3`/`M4` floors are **74** and **2700**, both moved here |
| conformity reader | **RAN** | **16 findings, 10 blocking.** Its finding 3 withdrew this item's ADR's own forcing measurement |
| adequacy reader | **RAN** | **45 mutations, 14 survivors (9 blocking), ~500 ms per suite run** |
| **overlap** | **2 of 61** | see below |
| rule 8, author pass | **RAN** | 26 probes: 25 caught, 0 survivors, 0 aborted after three re-anchors |
| rule 8, re-run after the readers | **RAN** | **40 probes: 38 caught, 1 classified REWRITE, 0 survived, 0 aborted, 0 crash** |
| `npm run gate` | **RAN THREE TIMES — RED, RED, then GREEN** | run 1 `GATE EXIT=1` at entry **1** (`deno lint`, 23 lines of log); run 2 `GATE EXIT=1` at entry **15** (`selftests — 7/7 completed, 6 ok`, `check:markdown:selftest` EXIT 1, [Q142](../open-questions.md)); run 3 **`GATE EXIT=0`, zero `FAIL` lines, 15 chain entries, `selftests — 7/7 completed, 7 ok`, 382.5 s wall / 715.9 s serial-equivalent over 5 lanes.** **Both red runs had zero `FAIL` lines**, which is what makes the exit code the predicate; and they are this gate's own CONTROL — `npm run gate` is shown able to fail, twice, at two different entries, before its green run is quoted |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) **Q8 answered, in `spec/`, with an id** | yes — `FD-C3`, `spec/flow-definition.md` v0.12 | `C2` (the rule is cited and must be declared), `C6` (its owner cell). Probe 40 deletes the row: `check-spec` red |
| (2) **whatever `DecisionContext` becomes, and its one construction site** | yes — one field, `needs`, and `selectEdge` takes a **builder** | 13 L2 cases; probe 22 (`resolveNeeds` never called) costs 5, probe 1 (`ctx.needs` always `{}`) costs 5 |
| (3) **a fixture for the third blocked flow** | yes — `spec/examples/valid/decision-on-an-earlier-step.flow.json`, Q8's own sentence since P1, running | `l4-corpus`'s both-ways equality against section 7; probe 13 strips the declaration and it goes red |
| (4) **ADR 0041, or a recorded verdict that it was not needed and why** | yes — **taken**, and P12 prediction 3 **REVERSED** | `M1` — the ADR is linked from `spec/`, the driver, `AGENTS.md` and the plan |

**What broke.**

**The gate was RED at L0 TWICE and every other rung was green both times, and the second one is the
sharper because this Record had already CLAIMED the gate was green.** First an unused import, found by
the conformity reader; then, after the readers' fixes, a dead `const where = n.id` in
`src/definition/validate.ts` — the aiming loop's own variable from before `aimedReferences` returned
an `at`, stranded by the fix for that reader's `FD-V28` finding, which is W36's
neighbour-of-a-corrected-line leak in a binding rather than in prose. Both are `deno lint` at
**exit 1 with zero `FAIL` lines**. That is W34's recorded shape, and since ADR 0039 `lint` is the
chain's *first* entry, so a red L0 means nothing else in the gate ran at all: **the second run's whole
log is 23 lines**, and the `npm run gate` row of this table read *`GATE EXIT=0`, zero `FAIL` lines*
while that log sat on disk. *An exit code is the predicate and a FAIL count is a secondary signal* —
recorded in `CLAUDE.md` for two plans, caught for the first time here, and then caught a **second**
time in the same item by **re-reading the log's tail rather than by any check**. The line that gave it
away is `Found 1 problem`, which is `deno lint`'s own summary and appears in no green gate.
**Section 1 rule 5's provenance clause — *any copy including your own* — applied to a GATE VERDICT**:
a green-looking tail is not a green gate when the tail is twenty-three lines from the top, and the two
conditions the maintainer stated (`GATE EXIT=0` **and** zero `FAIL` lines) are both satisfied by a
chain that stopped at entry one, because `FAIL` is a word the seven checks print and `lint` does not.

**And the ADR's own forcing measurement was WRONG.** It said a *diamond* — a node reachable from two
predecessors that both settled — made a node's payload underivable, *because choosing between them
needs append order.* W42's conformity reader derived it in one expression with **no** append order:
take the settled predecessors, drop any that another settled predecessor is reachable **from**, and
the survivor is unique — because a node takes exactly one edge, and two *incomparable* settled
predecessors need two live paths, which `FD-V19` refuses. **Reproduced independently before acting on
it**, both roads, agreeing both times. The conclusion survived on two facts nobody had written down
and which are now the ADR's: **the entry node's payload is in no record at any moment** (measured:
`start(payload)` reaches `createTask` and nothing appends it; no record in a completed run contains
it), and re-deriving any other node's means re-implementing `compose`, `JP-R11` and `JP-R12` at a
second site, which ADR 0040 rule 2 refuses by name. **The wrong sentence was in five files** and all
five are corrected.

**What this taught.**

1. **A reach prediction can reverse on the right conclusion and the wrong evidence, and only a reader
   re-deriving the evidence finds that** — [Q193](../open-questions.md).
   [P10](../plans/p10-is-fan-out-one-feature-or-two.md)'s retro settled that only a reach prediction
   can reverse; P11 found two that were right about the conclusion and wrong about the mechanism.
   **This is the third, and its mechanism was wrong in the DECISION rather than in the retro** — so it
   shipped as the ADR's *finding that settles it* and would have stood as the repository's account of
   why Q8 needed an ADR at all.
2. **`FD-V17` is only as good as the table it reads, and that table is a list bound to nothing —
   the THIRD instance in one plan.** `FD-V17` refuses *a key its kind does not declare*, and section
   3's Edge key table is the document's only statement of what an edge declares. `EDGE_KEYS` is a
   literal in the validator, and **nothing compared them**: for one item the code accepted `needs` on
   an edge while the table did not list it — `spec/README.md` rule 4's inverse, in the *accepting*
   direction. W41 found `RULE_PREFIXES` and its own `accepted` list; this is the same shape, and it is
   closed the same way: **set equality against the document, both ways**.
3. **`ctx.needs`'s mutability differed by branch, and nothing said which was right.** The shared
   `EMPTY_NEEDS` was frozen and the composed object was not, so a predicate writing to `ctx.needs`
   **threw** when its edge declared nothing and succeeded silently when it declared something — and
   with the freeze deleted (which cost **0**), one predicate's write would be the next one's input, in
   the same process. Both are frozen now: one rule, and it does not enforce purity
   ([Q9](../open-questions.md) stays declined) — it makes the one observable consequence uniform.
4. **The edge caller contributes ONE independent bound to the expression it shares with the node
   caller** — [Q192](../open-questions.md). Every clause of `resolveReference` is caught only by
   W41's node-site fixtures; the edge site's own coverage was one flat path, one key, one form, and
   the three that mattered (a multi-key loop, the `["n"]` form, the array's per-entry copy) were all
   live. *Extracting an expression to stop two callers drifting apart does not give the second caller
   coverage of it.*

**Obligation (e)'s second question — a THIRD shape, and it is the one W41 named.**

W41's Record recorded *a LIST bound to nothing* as a third shape beside P11's two, with the argument
that the first two are instances of it. **W42 produced another, in a different file, by a different
route**: `EDGE_KEYS`. And the shape now has three instances in one plan — `RULE_PREFIXES`, an
`accepted` list, and this — which is section 6 pass 3 rule 2's bar met twice over. **The question that
finds it is (e)'s second one asked of a DECLARATION rather than a command**: *what does this list have
to agree with, and what would say so?* **For P12's retro**, with the scope stated: two of the three
are `scripts/**` and one is `src/`, so it is not a property of the gate's own wiring.

**Overlap: 2 of 61** — the nineteenth measurement, inside the settled 0-4 band, both readers unprimed.
Their shared subjects: **the untested region path** (conformity from the item's own Verification table
claiming *covered*, adequacy from forcing `here = '-'` for **0** — two routes, one hole), and **the
inert `needs`** (conformity that it is accepted and recorded nowhere, adequacy that *building a
context for it stops a valid run*, which is the sharper claim and is a different defect on the same
shape). **The split is again what the two roles predict**: the conformity reader found **claims that
were false** — a rule refusing a valid document at W41's site, an ADR's own forcing fact, a table the
code had outgrown, three stale counts — and the adequacy reader found **bounds that were not there**,
seven of its nine blocking findings on obligations (c) and (d).

**Rule 8 — 40 provocations, 38 caught, 1 classified, 0 aborted, 0 crash.** The one that survives is
**classified as a REWRITE rather than a survivor**, on the register's own reasoning: the reader's edit
fabricated one projection in two lines and now has to fabricate **two in four**, because the loop
records each finding's `at` and the table does not carry it. `doc/workflow.md` section 5 rule 8 — *the
moment it also edits the projection, the expected literal, or a second line, it is a rewrite and its
survival says nothing* — and [Q112](../open-questions.md) settles the general form. **What the fix
bought is measurable and is the only claim made**: the reader's edit as written now ABORTS, and there
is no source outside this file to bind a CLAUSE list to, because `FD-V26`'s row is prose.
[Q191](../open-questions.md).

**Four probes went stale during the item and all four were re-anchored AGNOSTICALLY** — rule 7 (b)
firing rather than passing, three times on the author's own fixes and once on a reader's.

**`Owns` audit — 24 paths, ZERO undeclared, TEN late exceptions.** *(Re-taken with `git diff --name-only HEAD` on the tree this item ships — v0.12 change 2. It read **20 paths / SEVEN** when it was first written, before the gate went red twice.)* This item's own `Owns` block
predicted one of them **by name** and got the prediction wrong:

| late exception | why |
|---|---|
| `src/definition/types.ts` | `Edge.needs`. **The `Owns` block says *"NOTE what the row does NOT give it: `src/definition/**` … If Q8 needs one, that is the item's first finding rather than a late exception."*** Q8 did need one, and calling that *a finding rather than an exception* was wrong: it is both, and the exception is declared here |
| `src/definition/validate.ts` | `FD-V26`'s edge clause, `EDGE_KEYS`, and the aiming loop over both sites. Same reason |
| `spec/flow-definition.md` sections 2, 5, 6, 7 and the status block | the block gives **section 3** only, and a rule cannot be added to section 3 without its `FD-V` row in section 5, its example row in section 7 and the Edge key table in section 2 |
| `spec/README.md` | `C8`'s version row, a consequence of any `spec/**` bump — W16's finding |
| `spec/examples/**` | the two corpus files. The plan row gives `spec/examples/**` to **W41** |
| `AGENTS.md` | **`selectEdge`'s signature changed** and it is exported from the package root, so the consumer reference was wrong until it was edited. [Q157](../open-questions.md) again |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 16 → 17. **[Q102](../open-questions.md)'s obligation for the FIFTH recorded time**, and the second in this plan |
| `test/definition/**` | the suite census and the `EDGE_KEYS` binding; the block gives `test/driver/**` |
| `scripts/check-markdown.mjs` | **[Q142](../open-questions.md)'s obligation, the FIFTH retune** — and the first in which `M3` moved as well as `M4`. See below |
| `scripts/check-markdown-selftest.mjs` | `M3`'s `META` entry was pinned to the literal `< 64` and reported *"the mutation matched nothing"* the moment that number was right to change. Made agnostic, as `M4`'s has been since W33 |

**TEN, not seven and not eight** — the count above was written before the last three were taken, and
each rewrite of it was made before the next one arrived. **The WHEN clause firing three times inside
the table that records it**, which is the sharpest case for that clause this plan has: an item is
finished when its gate is green, and this item's gate went red twice after its `Owns` audit was
written.

**[Q142](../open-questions.md) fired, and BOTH floors moved for the first time.** `check-markdown`'s
`M3`/`M4` floors are two-sided — the `removes` probes cut directories out of a copy of the tree, so a
floor must sit **above the probe's fixture and below the whole tree** — and P12 added two work items,
a plan file and **two ADRs**, which is the first plan in four to add documents to `doc/decisions`,
the directory probe 1 REMOVES. The one-directory fixture rose **56 -> 64** against a floor of `< 64`,
so `64 < 64` is false and probe 1 went silent; the two-directory fixture rose **2061 -> 2406** past
2400 and probe 2 lost `M4`. The gate said `wanted [M1,M3], got [M1]` and `wanted [M1,M3,M4], got
[M1,M3]` — the fifth retune and the fourth consecutive plan to pay it. Retuned from **a scratch copy
outside the repository**, unmutated: whole tree **85 / 3328 / 167**, `doc/decisions` removed
**64 / 3014 / 167**, both removed **51 / 2406 / 167**, so `M3`'s window is `(64, 85]` and `M4`'s is
`(2406, 3014]`; the floors are **74** and **2700**, near the middle of each. `M5` is untouched at 60
against 167 for the sixth plan running. **`M3` had never moved before** — three plans of `M4`-only
retunes had made the file half look like a ratchet nobody has to pay — and that is why its `META`
entry was still pinned to the literal `< 64` while `M4`'s has been anchor-agnostic since W33: it
reported *"the mutation matched nothing"*, rule 7 (b) firing rather than passing, and it is now
agnostic too. *A reason given for one entry was general and was instantiated in one place for three
plans, because the other place had no live case.*

**Questions raised.** [Q190](../open-questions.md) an inert `needs` is accepted, and refusing it puts
a kind rule inside a grammar rule. [Q191](../open-questions.md) a provocation that must invent two
projections is a rewrite, and a clause list has no source outside its own file.
[Q192](../open-questions.md) the edge caller contributes one independent bound to a shared expression.
[Q193](../open-questions.md) a reach prediction can reverse on the wrong evidence.

**Resolved:** [Q8](../open-questions.md), open since P1, its own row's fork being the wrong shape.

**Census re-derived: 150 questions — 102 open, 2 deferred, 46 resolved**, both halves at 150 of 150 in
exactly one cluster cell, **CONFIRMED for the tenth plan running**. W41's parser, unchanged, aborting
once — on this item's own four ids in no cluster cell.
