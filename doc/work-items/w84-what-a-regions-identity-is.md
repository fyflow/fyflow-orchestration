# W84 — what a region's IDENTITY is

**Status:** done
**Plan:** [P22](../plans/p22-what-a-regions-identity-is.md) — *what is a region's identity, and may a
region open inside a `map` region?*

```
Spec:       spec/run-state.md — `RN-R6`'s SHAPE (the two-level `regions`) and whatever that
            document says about a region being keyed by its opener; spec/join-policy.md if
            `JP-R11`/`JP-R12` name the key. **NOT an `FD-V` and NOT an `FD-R`**: this REMOVES a
            refusal, and the refusal it removes carries NO RULE ID anywhere in `spec/` — `Q160`
            occurs in spec/flow-definition.md twice and both are prose (declaration step, below).
Owns:       src/driver/**, src/fold/**, src/definition/**, spec/**, test/**,
            doc/decisions/0062-*
            **Declared exceptions, all three found at the declaration step**:
            `examples/l6.ts`, `examples/run-flow.ts` and `AGENTS.md`. **The `Owns`
            block cannot hold the work Outputs (5) declares** - the plan assigns
            *all sixty typecheck sites* here and SEVEN of them are in `examples/**`,
            which the plan's own table gives to W86; and `AGENTS.md`'s executed
            snippets carry `RegionEvent`/`FoldInput` LITERALS that no typecheck lane
            reads, which `check:docs` does and which the `Gate:` line below does not
            name. The edits are the CHURN: no L6 row, snippet or reference is added
            and L6 is UNMOVED ([Q348](../open-questions.md))
Inputs:     P22 decisions 1-6 and facts 1, 2 and 3, EACH RE-TAKEN on this tree before anything is
            edited; `dev-dist/spike-nested-map/` as the fact base and `dev-dist/p22/` as the
            re-take; ADR 0036 (a branch path inside a map is a property of the DISPATCH), `ID-R6`,
            `JP-R11`/`JP-R12`, `RN-R6`/`RN-R11`, and W33's construction check as shipped.
Outputs:    (1) ADR 0062 — a region INSTANCE is `(opener node id, the opener's own branchPath)`,
                the carrier is two-level, and `regionId` keeps its meaning AND its value
            (2) `RegionEvent.regionPath` on all SIX variants (`branch.opened`, `.arrived`,
                `.exited`, `.lost`, `.suspended`, `.resumed`)
            (3) `RunState.regions` two-level — `regions[openerId][openerPath]` — and the `spec/`
                rules that carry it
            (4) W33's construction refusal LIFTED, with the two prose sites that name Q160
            (5) the churn PAID: **63 typecheck sites in 8 files and 34 L1-L5 failures**,
                plus **5 more in `AGENTS.md` that no typecheck lane reads** - the plan's
                *sixty / thirty-two* is the SPIKE's figure for the design as measured,
                and this item ships `UnsatisfiableJoin.regionPath` beyond it
Depends on: nothing
Blocks:     W85
Tests:      test/driver/** and test/fold/** at L1-L2 on a fake scheduler, plus the corpus suites
            that already fold region events. Every expected value comes from the DOCUMENT and from
            `branchPathOf`'s own output, never from the driver: the key of a region instance is
            derived on paper from the opener's position in the document before any run is read.
            The discriminating fixture is a map whose branch opens a region — the shape that does
            not exist today, because the refusal is what makes the corpus unable to hold one.
Gate:       L0 under all five typecheckers; L1-L5 in three runtimes; check:spec; L6 UNMOVED
Reserves:   Q346-Q351, ADR 0062
```

## Scope

**In**

1. **The KEY** — decision 1: a region instance is `(opener node id, the opener's own branchPath)`.
   Derived by the existing `pathOf`/`branchPathOf` in one expression, with **no second region-chain
   walk and no composite string anywhere** (decision 2).
2. **The CARRIER** — decision 2: `RunState.regions` becomes two-level, and every per-region
   run-time structure in the driver follows it. W33's conformity reader enumerated them —
   `joinState`, `firedJoins`, the fold's `regions` — and this item's declaration step re-takes that
   list rather than inheriting it.
3. **The OBSERVABLE** — decision 3: `regionId` keeps one meaning, the opener's node id, and **never
   changes value for any existing flow**; `RegionEvent` gains `regionPath`, on all six variants.
4. **The REFUSAL LIFTED** — decision 4, whole rather than narrowed, so `map`-in-`map` and
   `fanout`-in-`map` both run and Q160's own document runs.
5. **The CHURN, PAID.** **63 typecheck sites in EIGHT files and 34 L1-L5 failures**, plus **5 more
   in `AGENTS.md` reached by `check:docs` and by no typecheck lane**. *They are
   this item's because the change does not compile without them*, which is also what makes fact 3's
   LOUD claim this item's to keep true.
6. **ADR 0062**, carrying the three alternatives the spike built and the cost of each — including
   the twelve silent failure modes the composite-string road was measured to have.

*(**The plan says *sixty ... in six files* and *thirty-two*, and both are re-taken above.** The
spike's figure is 60 in SEVEN files — 54 in six test files plus 6 in `examples/l6.ts` — and this
item ships `UnsatisfiableJoin.regionPath` beyond P22 decision 3, which is the whole of the +3 / +2
and adds `examples/run-flow.ts` as an eighth file. W84's conformity reader, findings 4 and 5.)*

*(**Seven of those sites are in `examples/**`, which this item does NOT own.** See the `Owns`
block's declared exceptions. **Out** below says *any L6 row, and the reference* is W86's and that
half STANDS — L6 is UNMOVED at 1724 / 58 and no row, snippet or reference is added. What the
exceptions buy is the SHAPE errors, which are the churn: the `Owns` block and Scope In 5
contradicted each other as declared, and nobody could have satisfied both.
[Q348](../open-questions.md).)*

**Out** — named rather than left implicit, with where each goes instead

- **What a nested region CARRIES and how it ENDS.** W85's, whole: `JP-R12` at two levels and at
  depth 3, the three branch-exit paths under nesting, N = 0 inside a map, retention released per
  instance, ADR 0044 visibility. **This item edits the three exit sites and does not drive them** —
  which is exactly the gap P22 fact 5 measured and the reason W85 exists as its own item.

  **And the gap now has a NUMBER rather than a sentence** — W84's adequacy reader, finding 7.
  Forced to `'-'` for any nested instance, all three cost **0 at L1-L5 and 0 at L6**: `firedAdd` and
  `releaseArrivals` at the `unsatisfiable` exit, and `firedAdd` at the `satisfied` one. **The
  asymmetry is the finding**: the latch's TOO-STRONG direction *is* bound — `firedHas` returning
  true when ANY instance has fired costs **3** at L1 — and its too-weak direction is bound by
  nothing, because no shipped policy settles a join before every branch is terminal. That is
  [Q95](../open-questions.md)'s precondition one key deeper. **W85 is where it is driven.**
- **Any L6 row, and the reference.** W86's. **L6 UNMOVED here**, and that is the declared result:
  an item that changes an identity and moves a rung of real runs has not kept `regionId`'s value.
- **The package version.** P22 stop-and-ask (b) is **ANSWERED `0.4.0` at W86's close**, on W77's
  precedent. **This item ships the breaking shape with the manifest UNMOVED** — `package.json` and
  `deno.json` are W86's, and an edit to either here is an undeclared exception.
- **Reopening N = 0.** Decision 6: `spec/join-policy.md` section 5 already decides it on the
  SHIPPED tree, measured by the spike with no patch. W85 asserts it under nesting.
- **Any change to what a join CARRIES.** Decision 5. The spike went looking and found none; if this
  item finds one, that is a correction to the plan and is recorded as one.
- **[Q206](../open-questions.md)** — sibling regions nested inside ONE map region, and a region's
  collection reachable by no reference. Declared OUT by the plan and not reached here.

## What the declaration step must re-take before anything is edited

*Not inherited. P22's facts were measured on `1da565f`; this item runs on whatever tree it starts
on, and three of the five are the kind that move.*

| | what to re-take | why it is the kind that moves |
|---|---|---|
| 1 | **The key measurement** — 45 documents, 33 region-bearing, 50 regions; (b) qualifies on 6, (c) on 0, **openers inside a map region 0 of 50** | it is a count over the corpus, and any item that adds a flow moves it. The spike read 44 documents and W82 made it 45 |
| 2 | **The churn** — 46 edits across three files, the five typecheck lanes, L1-L5 at 32 | it is a count over `src/` and `test/`, and P21 closed three items into those trees after the spike ran |
| 3 | **The LOUD claim's line number** — `examples/l6.ts:4190`, named by `typecheck:examples` | **it has already moved once**: the spike recorded 3891 and W82 took it to 4190. *A claim that rests on one line number is re-taken or it is not a claim.* |
| 4 | **The enumeration of per-region run-time structures in the driver** | W33's conformity reader wrote that list; five plans have edited `driver.ts` since, and decision 2's whole cost is that list being complete |
| 5 | **That the refusal carries no rule id** — `Q160` occurs twice in `spec/flow-definition.md` and both are prose | if a rule id exists, `check:spec`'s `C4`/`C8` are in this item's gate and the `Owns` block is one document wider |

**P22 stop-and-ask (a) is what makes this table load-bearing rather than good practice.** It was
answered *nothing is checked in* — `dev-dist/` stays ignored, on the twenty-one-plan precedent and
against the plan's own lean — so **there is no artefact for this item to read and re-running is the
only road any of the five facts has to reach it.** P15 decision 5 in its strongest form: *every fact
is RE-RUN by the item that acts on it, never transcribed.* A row above transcribed instead of re-run
is this item's first defect, not a shortcut.

**And one thing this item must NOT re-derive**: which key is right. Decision 1 is the plan's, taken
on a measurement, and an item that re-argues it is measuring its own output
(`doc/workflow.md` section 6 pass 3 rule 1). What it may do is find the decision WRONG and say so.

## Verification

How each clause of `Gate:` is run. Commands named, each RUN and redirected, never piped
(`doc/workflow.md` section 4).

| Clause | How |
|---|---|
| **L0, five typecheckers** | `npm run typecheck` is five lanes chained by `&&`, so a RED report names its FIRST failure and is silent downstream (P20's declaration, recorded at one occurrence). **Each lane is run separately here** — `tsc -p tsconfig.json`, `.node`, `.browser`, `.deno`, `.tests`, `.examples` — because the churn is sixty sites across six files and a chained rung cannot show that they are all paid. Plus `npm run lint` |
| **L1-L5, three runtimes** | `npm test`, then `npm run test:deno`, then `npm run test:browser`. The 32 failures are the work; the rung is green or the item is not done |
| **`check:spec`** | `npm run check:spec` and `npm run check:spec:selftest`. Expected UNMOVED at 7 / 61 / 108 **unless** the declaration step finds a rule id, in which case `C4`'s count paragraph and `C8`'s row move and the item says by how much |
| **L6 UNMOVED** | `npm run test:l6` and `npm run test:l6:deno`, both at **1724 / 58**. This is an ASSERTION about decision 3, not a formality: if `regionId`'s value moved for any existing flow, an L6 literal moves with it |
| **conformity reader** | fresh context, `spec/` first and code second. Its central obligation: re-derive **every region instance's key on paper** from the documents — for the corpus's six nested regions and for the new map-nested fixture — before reading any output |
| **adequacy reader** | isolated copy. Its first target is ADR 0062's own sentence: *`regionId` never changes value for any existing flow.* Second: whether the two-level carrier is bound at ONE depth, which is W76's shape and the direction an author picks by default |
| **re-run at `<sha>`** | rule 8's set re-run with both readers' exact edits checked in |

**Routing cases this item covers** (`doc/workflow.md` section 7): a **nested fan-out** ([Q6](../open-questions.md))
is the shape the corpus already holds and this item must not move — `nested`, `nested-fanout` and
`nested-map` all keep their event streams byte-identical, which is decision 3's own test. A
**duplicate task id** ([Q13](../open-questions.md)) is the failure mode the refusal exists to
prevent and the one the key must now prevent instead: two instances of one opener at one key is
`ID-R1` naming a duplicate, which is the symptom, and the declaration step's fixture must make the
CAUSE observable. **Not applicable here**: a branch routed away from its join (Q4), `user_action`
(Q17), no matching decision edge (Q10) — all three are W85's, which is where the three branch-exit
paths are driven.

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0, five typecheckers | **RAN, EXIT 0, each lane SEPARATELY** | `tsc -p tsconfig.node.json`, `.browser`, `deno check index.ts src/`, `tsconfig.json`, `tsconfig.examples.json`, plus `npm run lint`. Run separately and not through the `&&` chain, because the churn is 63 sites across 8 files and a chained rung names its FIRST failure and is silent downstream. **`src/` compiles clean on all three SOURCE lanes**, which the declaration step's re-take predicted |
| L1-L5, three runtimes | **RAN, EXIT 0 — 46 files / 1302 assertions** in node 24.20.0, deno 2.9.6 and chromium, parity asserted | from 46 / 1295. **34 failures paid**, not the plan's thirty-two |
| check:spec | **RAN, EXIT 0 — 7 / 61 / 108, UNMOVED** | the declaration step's re-take row 5 said it would not move, because the refusal carried no rule id; `check:spec:selftest` EXIT 0. `C8` green on three bumped version rows |
| L6 UNMOVED | **RAN, EXIT 0 — 1724 assertions over 58 real runs in BOTH runtimes, UNMOVED** | the assertion about ADR 0062 rule 3, not a formality. The adequacy reader's p1a — moving `regionId`'s value at the one emit funnel — costs **139 at L6 and 58 at L1-L5**, and the L6 catches include `fanout-join` under two policies, which are PRE-W84 flows |
| check:docs | **RAN, EXIT 0 — 34 snippets: 28 run, 6 check, UNMOVED** | **not in the declared `Gate:` line, and it had to be**: `AGENTS.md`'s executed snippets carry `RegionEvent`/`FoldInput` literals that no typecheck lane reads, measured at 5 sites in 2 snippets ([Q348](../open-questions.md)) |
| check:markdown | **RAN, EXIT 0**; self-test EXIT 0, 7 / 7 bounded, 37 / 37 probes | **[Q142](../open-questions.md) measured BEFORE the record step and does NOT fire**: `M3`'s cut tree is 110 files against a floor of 123 — margin **13**, and the one document this item adds lands in `doc/decisions/`, which probe 1 CUTS — and `M4`'s is 4677 links against 5270, margin **593**. P18's retro fired at a margin of 31 |
| conformity reader | **RAN — 16 findings, 6 blocking** | **its central obligation came back with ZERO disagreements on the VALUES**: it implemented the region sets and `branchPath` from `spec/` alone, derived every instance key on paper for the corpus's six nested regions, the three `examples/flows` nested documents, the two `spec/examples/valid` ones and the new fixture, and not one differed from what the tree produces. Every disagreement it found was in a SENTENCE — three surviving statements of the WITHDRAWN refusal (plus two it did not name), the churn figure stale by 3 sites and 2 files, and an `Owns` block that could not hold its own `Outputs` row. It also caught that L1-L5 was 1299 and not the 1296 the author had recorded |
| adequacy reader | **RAN — 47 mutations, 17 survivors, 12 findings, 5 blocking** | **its second named target SURVIVED**: the two-level carrier was bound at ONE SEGMENT. Also: ADR 0062 rule 4's `map`-in-`map` half had no driver fixture; `regionEntered`'s per-instance dedup had none; the interleaving test's ORDER was load-bearing and unasserted; two guards were emptiable for zero. Its FIRST named target did not survive. All five closed, and its **exact edits are checked in as probes** — all six fire |
| re-run at `<sha>` | **RAN — 38 probes, 32 caught, 6 declared ceilings each RUN, 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration** | control green at every rung, tree held still by a content DIGEST identical at both ends. The AUTHOR pass first read SIX undeclared survivors: four real (closed) and **two that were the PROBES** — one whose mutation was semantically equivalent by construction, one that moved both sides of an equality |

**`npm run gate` — `GATE EXIT=0`, ZERO `FAIL` lines, 31 chain entries**, on the first run over the
final tree. Content digest **`375e78c30c36242d` over 380 files**, identical before and after.
`selftests` 8 / 8 completed, 8 ok. The counts it printed: `check:spec` **7 / 61 / 108**,
`check:docs` **34 — 28 run, 6 check**, `check:workers` **16**, `check:markdown` **145 documents /
6464 relative links / 336 anchored**, L1-L5 **46 / 1302** in node, deno and chromium, and L6
**1724 assertions over 58 real runs** in BOTH runtimes. *The exit code is the predicate and the FAIL
count is the secondary signal* (`doc/workflow.md` section 4, v0.15) — both are recorded, and the
rung was RUN and redirected rather than piped.

**`package.json` and `deno.json` are UNTOUCHED** and the manifest still reads `0.3.0`, which P22
stop-and-ask (b) requires: `0.4.0` lands at W86's close, so W84 and W85 ship the breaking shape with
the version unmoved. **Three declared exceptions, all found at the declaration step**:
`examples/l6.ts`, `examples/run-flow.ts` and `AGENTS.md` — see the `Owns` block and
[Q348](../open-questions.md). **Zero undeclared.**

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0062 | **yes** | `check:spec`'s `C5` — three `spec/` documents and eight source sites link it, and a dead link is a named failure. Its five rules are each bound: rule 1 by `test/matrix/chain.test.ts`'s document-derived key, rule 2 by 32 typecheck sites, rule 3 by L6 at 139, rule 4 by the two driver fixtures, rule 5 by `joinStatusOf`'s three cases |
| `RegionEvent.regionPath`, six variants | **yes** | `typecheck:node` — dropping the field from ANY ONE of the six is a named error, run as six separate probes rather than one (a count of six is not a membership of six). All six are observed at some rung: `opened` 9/21, `arrived` 9/16, `exited` 1/5, `lost` 1/0, `suspended` and `resumed` 0/3 — **the last three rest on rungs this item declares UNMOVED or hands to W85**, and that is stated rather than implied |
| `RunState.regions` two-level | **yes** | L1-L5 at 6 failures with the shape collapsed onto one key; at 1 with the `RN-R10` flatten narrowed to the first instance; at 1 with `regionEntered`'s dedup narrowed to the opener — the last turning a `stuck` run into `completed` |
| the refusal lifted | **yes** | L1-L5 at 5 with a refusal put back, and at 2 with the lift NARROWED to refuse `map`-in-`map` alone — which is ADR 0062 rule 4's other half and which cost zero until the adequacy reader asked |
| the churn paid | **yes** | all five typecheck lanes, `lint`, L1-L5 in three runtimes, L6 in both, and `check:docs` — **63 typecheck sites in 8 files, 34 L1-L5 failures, and 5 more in `AGENTS.md` that no typecheck lane reads** |

**What broke.**

**Six undeclared survivors on the author's own first rule-8 pass, and two of them were the PROBES.**
`c2` re-sourced a key to the region's JOIN id — and a region's join is never a member of that region,
so the two expressions agree by CONSTRUCTION; `d3` moved both sides of an equality. The four real
ones: the collection's read and its RELEASE were both unobservable because every test settled
instances SEQUENTIALLY ([Q349](../open-questions.md)); `RN-R10`'s quantification over instances had
no fold with one instance joined and another not; and the `RN-R6` cross-policy walk could be narrowed
back to openers, whose obvious repair is RED for a reason of its own ([Q350](../open-questions.md)).

**The churn is LOUD, and not at L0 — P22 prediction 1 REVERSES by its own stated condition.**
Measured one for one: **8 of the 34 L1-L5 failures are in FOUR files no typechecker names**.
`Record<string, T>` has an OPEN index signature, so `regions['split'].joined` on the two-level type
still TYPES as `RegionRun` and evaluates to `undefined`. It goes red at L0 only where the result is
constrained ([Q346](../open-questions.md)). Its sharpest form is a CAST that restates the shape it
reaches into: both retention observers declared `Map<fanoutId, Map<branchPath, payload>>` themselves
and compiled clean against their own stale restatement ([Q347](../open-questions.md)).

**A gate line drawn from the same list as an `Owns` block.** `AGENTS.md` is W86's and carries five
sites no typecheck lane reads; `check:docs` is the rung that sees them and is not in this item's
`Gate:` line — so **W84 as declared could have shipped a gate entry red with its own gate green**
([Q348](../open-questions.md)).

**What this taught.**

**A key is only observable where two things it distinguishes are ALIVE AT ONCE, and a correctness
feature can be what takes that away.** [ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
rule 3 releases a region's collection the moment its join becomes terminal — so with instances
settling in dispatch order there was never a second collection to confuse the first with, and *read
the instance being settled* and *read the opener's FIRST instance* were the same expression. The
repair is an interleaving, and the ORDER inside it is itself a claim: closing the first instance
first leaves the probe green, because instance 0 is also `values()[0]`. **Which the adequacy reader
then found stated in a comment and asserted by nothing**, so the order is DERIVED from the run now
rather than arranged.

**And the same shape one depth out is what its second named target found.** The carrier was bound at
depths 0 and 1 and at nothing beyond: truncating the instance path to its first segment cost ZERO at
every rung, because every region instance in the tree sat at a single segment. On a depth-3 document
that truncation is **W33's exact defect one depth out** — two instances of the innermost opener merge
into one key, one join becomes unreachable, and a run in which every task settles reports `stuck`.
*The spike measured depth three and the item shipped no observer for it, which is the difference
between a fact being MEASURED and a claim being BOUND.*

**Questions raised.** [Q346](../open-questions.md) (a `Record<string, T>`'s open index signature
makes a new LEVEL invisible to a typechecker), [Q347](../open-questions.md) (a cast that restates the
shape it reaches into compiles against its own restatement), [Q348](../open-questions.md) (an `Owns`
block that cannot hold its own `Outputs` row, and a `Gate` line drawn from the same list),
[Q349](../open-questions.md) (an eager release hides the key it is keyed by),
[Q350](../open-questions.md) (`RN-R6`'s premise fails under nesting and only a red rung says so),
[Q351](../open-questions.md) (a prose enumeration written by a reader goes stale and nothing binds
it). **[Q160](../open-questions.md) and [Q156](../open-questions.md) are RESOLVED.** Census
**272 / 211 / 2 / 59**.
