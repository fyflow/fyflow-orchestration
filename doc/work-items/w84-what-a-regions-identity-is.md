# W84 — what a region's IDENTITY is

**Status:** todo
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
            (5) the churn PAID: all sixty typecheck sites and all thirty-two L1-L5 failures
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
5. **The CHURN, PAID.** Sixty typecheck sites in six files and thirty-two L1-L5 failures. *They are
   this item's because the change does not compile without them*, which is also what makes fact 3's
   LOUD claim this item's to keep true.
6. **ADR 0062**, carrying the three alternatives the spike built and the cost of each — including
   the twelve silent failure modes the composite-string road was measured to have.

**Out** — named rather than left implicit, with where each goes instead

- **What a nested region CARRIES and how it ENDS.** W85's, whole: `JP-R12` at two levels and at
  depth 3, the three branch-exit paths under nesting, N = 0 inside a map, retention released per
  instance, ADR 0044 visibility. **This item edits the three exit sites and does not drive them** —
  which is exactly the gap P22 fact 5 measured and the reason W85 exists as its own item.
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

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** One row per clause of the `Gate:` line above. Each verdict starts with `RAN` or
`NOT RUN`; a clause with no row reads as *did not run*. The last row is the gate re-run at the commit
that acts on the review findings, and it names that commit.

| Clause | Verdict | Notes |
|---|---|---|
| L0, five typecheckers | | |
| L1-L5, three runtimes | | |
| check:spec | | |
| L6 UNMOVED | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.** One row per item on the `Outputs:` line, and for each, the
assertion or command that **would fail if it did not exist**. A blank cell is the finding.

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0062 | | |
| `RegionEvent.regionPath`, six variants | | |
| `RunState.regions` two-level | | |
| the refusal lifted | | |
| the churn paid | | |

**What broke.**

**What this taught.**

**Questions raised.** *Q ids from the reserved block, with one line each. They also go in
`doc/open-questions.md`.*
