---
id: ADR 0062
title: "A region INSTANCE is its opener and the opener's own branch path"
status: accepted
date: "2026-09-23"
item: W84
raised-by: P22
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0062 — A region INSTANCE is its opener and the opener's own branch path

**Plan:** [P22](../plans/p22-what-a-regions-identity-is.md) — *what is a region's identity, and may a
region open inside a `map` region?*
**Supersedes:** nothing. It **removes a refusal**
[W33](../work-items/w33-a-map-at-run-time-arity.md) put in the `Driver` constructor, which carried no
rule id in `spec/` and so supersedes no rule.
**Answers:** [Q160](../questions/q160.md) (the mechanism) and [Q156](../questions/q156.md) (the
narrower case of it).

---

## Context

**A region's identity was its opener's NODE ID, and that is total only while no opener is entered
twice in a run.** Five structures were keyed that way — three in the driver, one in the fold, one on
the wire:

| | what it holds | where |
|---|---|---|
| `joinState` | the policy's opaque state for the region | `src/driver/driver.ts` |
| `firedJoins` | the at-most-once latch on the join | `src/driver/driver.ts` |
| `arrivals` | what each branch carried into the join — `JP-R11`/`JP-R12` | `src/driver/driver.ts` |
| `RunState.regions` | `opened`, `settled`, `suspended`, `joined` | `src/fold/run-state.ts` |
| `RegionEvent.regionId` | which region an event is about | `src/driver/events.ts` |

**W33's conformity reader enumerated FOUR of those five and this item's declaration step re-took the
list and found the fifth.** `arrivals` is [W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s
and postdates that reader, so `arrivals`' own doc comment said *"like every other per-region structure
here"* while listing four that excluded its own subject. It is also the one whose mis-keying is
invisible: `JP-R12`'s collection is a `Record<string, unknown>` whichever instance filled it.

**A `map` is the first construct that enters one opener more than once**
([ADR 0036](0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md):
a branch path inside a map is a property of the DISPATCH). So an opener inside a `map` region is
entered once per item, and W33 measured what that did on a definition `validateDefinition` accepts
with **zero findings**: seven tasks all settling `done`, and the run reported **`stuck`** — the second
`open()` discarded the first's state, `firedJoins` made the second join unreachable, one branch got no
terminal event, and two regions merged into one fold entry. W33 **refused the shape at `Driver`
construction** rather than running it wrong.

**That refusal is why *score each item, then fan out per item* could not be written**, and the
workaround is the one [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
exists to remove: a reshaping node and a second flow.

**And P12's retro had already given the verdict**: *keying a per-region structure by node id ALONE is
a DEFECT and not a convention.* What was missing was evidence for what replaces it.

---

## Decision

1. **A region INSTANCE is the pair `(opener node id, the opener's own `branchPath`)`.** The path is
   `'-'` for an opener in no region, and inside a map region it is that map's item index — the same
   `branchPathOf` walk every other path in this library comes from.
2. **`RunState.regions` is TWO-LEVEL — `regions[openerId][openerPath]` — and no composite string
   exists anywhere.** The three driver structures nest the same way. The pair is carried as a pair,
   at every level and in both fold inputs; nothing is concatenated and nothing is parsed.
3. **`regionId` keeps ONE meaning — the opener's node id — and never changes VALUE for any existing
   flow.** `RegionEvent` gains **`regionPath`** on all six variants, and `UnsatisfiableJoin` gains it
   too, so the two places a region is named to a consumer agree.
4. **W33's construction refusal is LIFTED WHOLE, not narrowed.** `map`-in-`map` and `fanout`-in-`map`
   are the same case.
5. **`joinStatusOf(fanoutId, regionPath?)` takes the path OPTIONALLY, and its absence means the SOLE
   instance.** With N instances and no path it returns `null` rather than one of the N.

```
{"type":"branch.arrived","regionId":"inner","regionPath":"1","branchPath":"1.0"}
```

---

## Why, and what each was chosen over

**Every alternative was BUILT and RUN before one was chosen** (`dev-dist/spike-nested-map/`,
re-taken at this item's declaration step).

### The KEY: `(opener, the opener's own path)` over `(opener, the enclosing MAP indices)`

Call them **(b)** and **(c)**. (c) is the minimal SUFFICIENT qualifier: an opener is entered more than
once only inside a MAP region, so map indices alone separate every instance. **(b) is strictly finer**
and also separates regions in different `fanout` branches — whose openers `FD-V19` already makes
distinct nodes, so that extra discrimination buys nothing.

**(b) is taken anyway, and the reason is a COST rather than a discrimination.** It is derived by the
existing `pathOf`/`branchPathOf` in one line with no second region-chain walk; (c) needs its own walk
and, because it is not a `branchPath`, a composite string to carry it.

**The corpus cannot arbitrate between them, and that is the measurement rather than a gap.** Over both
corpora — **45 documents, 33 region-bearing, 50 regions** — (b) qualifies **6 of 50** and (c) **0 of
50**, and **openers inside a map region are 0 of 50**. *That zero IS the refusal*: the one shape both
keys exist for is the shape W33 forbade, so no document CONTAINED one when this was measured —
**[W86](../work-items/w86-score-each-item-then-fan-out-per-item.md) is the first, and on the tree
that item ships the same measurement reads 1 of 52 over 46 documents, 34 region-bearing** — and
(b)'s six are all
`fanout`-nested at `path=1` where the opener was already a distinct node. **Neither key is needed by
anything that exists today**, which is what makes this a cost argument.

### The CARRIER: two levels over a composite string

Three designs built and run on one tree:

**These are the SPIKE's figures**, transcribed from `dev-dist/spike-nested-map/report.md` by way of
[P22](../plans/p22-what-a-regions-identity-is.md) decision 2 and **not independently re-measured
here**: W84's re-take table asks for five facts and these are not among them, because re-deriving
them means rebuilding the two roads NOT taken, which is re-arguing decision 1 (`doc/workflow.md`
section 6 pass 3 rule 1). The row that IS re-taken is the third, and it moved — see below.

| | L1-L5 churn | typecheck churn | silent failure modes |
|---|---|---|---|
| composite string + key (c) | 2 | 0 | **`joinStatusOf` returns `null` for any nested region** |
| composite string + key (b) | 29 diffs | 0 | **12 measured** — 9 `joinStatusOf`, 3 lookups returning `[]` |
| **two-level + key (b)** — TAKEN | 32 | **60, every one NAMED** | **none** |

**What W84 actually paid is larger than the third row, and the difference is rule 3's second half.**
Re-taken on the tree this item ships: **63 typecheck sites in 8 files** (54 in six test files, 9 in
two example files) and **34 L1-L5 failures**, plus **5 more in `AGENTS.md` that no typecheck lane
reads** and `check:docs`'s `X3`/`X5` do. The +3 / +2 is entirely `UnsatisfiableJoin.regionPath`,
which the spike's design C did not have — so `examples/run-flow.ts` is a ninth named file the
spike's number could not cover. *A cost table for a road not taken is evidence for the CHOICE and
not a prediction of the bill.* W84's conformity reader, finding 4.

***Qualifying the OBSERVABLE id is what breaks things, and it breaks them where no type can see it.***
**The cheapest row is the one that fails in silence and the dearest is the one whose whole cost a
typechecker prints.**

### The REFUSAL: lifted whole over narrowed to `map`-in-`map`

Conditioning it on which KIND of region encloses which would make the grammar's one refusal turn on a
distinction ADR 0036 spent a plan removing — and it is the same key either way, because
`branchPathOf` walks map and fanout segments with one loop.

### `joinStatusOf`: the sole instance over a default of `'-'`

`'-'` would be wrong for every nested region: `joinStatusOf('inner')` on `nested.flow.json`, where
`inner` sits at path `1`, would start returning `null`. That is nine of the composite road's twelve
silent modes, reintroduced on purpose. **The sole instance is what keeps every pre-W84 caller working
AND getting the same answer** — rule 3 reaching the read side — and with N instances answering would
make the reply depend on Map insertion order, which is dispatch order, which is the order-dependence
`settleJoin`'s bare signature exists to refuse.

---

## Consequences

1. **`RunState.regions` is a BREAKING change for a reader**, and `RunState` reaches the package root
   through `index.ts`'s `export *`, so `regions` is public surface by re-export. **And it is not the
   only break**: rule 3's `UnsatisfiableJoin.regionPath` is a REQUIRED member on an interface a
   consumer may construct — a test double reporting a dead join no longer compiles — so *additive
   for a reader* is true and *additive* is not. That addition goes beyond
   [P22](../plans/p22-what-a-regions-identity-is.md) decision 3 and beyond
   [W84](../work-items/w84-what-a-regions-identity-is.md)'s declared Outputs (2), which name
   `RegionEvent` and its six variants alone; it is taken because under nesting one `fanoutId` names N
   joins and `onUnsatisfiableJoin` is the one OTHER consumer-facing place a region is named, so
   leaving it unqualified reintroduces exactly the silent class this decision argues against — and
   [W33](../work-items/w33-a-map-at-run-time-arity.md)'s own comment names `onUnsatisfiableJoin`
   beside `joinStatusOf` as a thing this decision reaches. *The departure is recorded rather than
   folded in, and it is the whole of the churn delta above.* W84's conformity reader, finding 8.
   **The manifest does NOT move here** — [P22](../plans/p22-what-a-regions-identity-is.md) stop-and-ask (b) answers
   `0.4.0` at W86's close, on [W77](../work-items/w77-what-start-returns.md)'s precedent, so the
   version moves once in the item that makes the capability demonstrable.
2. **The break is LOUD where a type constrains the result and SILENT where it does not.**
   `Record<string, RegionRun>` has an **open index signature**, so on the new type
   `regions['split'].joined` still types as `RegionRun` and evaluates to `undefined`. It goes red at
   L0 only where the value is used at a constrained type; into an assertion helper taking `unknown` it
   compiles. **Measured: eight of the thirty-four L1-L5 failures this item paid were in four files no
   typechecker names** — which is P22 prediction 1 reversed by its own stated condition, with its
   conclusion (*nothing lands silently*) surviving on a different rung.
3. **A cast that RESTATES the shape it reaches into is the sharpest case of consequence 2.** Both
   retention observers declare `Map<fanoutId, Map<branchPath, payload>>` themselves and so compiled
   against their own stale restatement; each surfaced as a wrong COUNT rather than an error.
4. **`RN-R10` and the nothing-yet guard quantify over region INSTANCES**, so both walks flatten the
   two levels. Written once, in `allRegionRuns`, so they cannot drift. **Only ONE of the two is
   reachably instance-quantified, and that is stated rather than implied** — W84's adequacy reader,
   finding 10: narrowing the flatten to each opener's first instance is caught by `RN-R10` and is
   invisible to the nothing-yet guard, which runs only when `nodes` and `pathEnds` are both empty.
   The only construct that mints N instances is a `map`, whose arity needs a settled node or the
   start payload, and `FD-V25` refuses a map whose branch is a map — so an entry map cannot produce
   two instances of a nested opener before anything settles. *The shared flatten is right and one of
   its two callers cannot observe the sharing.*
5. **No rule about what a region CARRIES moves.** `JP-R12` already keys by `branchPath`, and a branch
   inside an instance carries that instance's path as its own prefix — so two instances of one opener
   hold **disjoint** branch-path key sets and their collections cannot collide. `ADR 0044`'s
   visibility and `checkWiring` need no change.
6. **What is still refused, and by what.** `FD-V19` keeps one node out of two branch entries of one
   fanout; `ID-R6` refuses a `branchPath` across a map region with no item index supplied; `ID-R1`
   refuses a duplicate dispatch. **Those three are what make the derived key TOTAL**, and they are why
   lifting this costs no new refusal and no new error class.
7. **A region's collection is released per INSTANCE** (`RN-R13`, ADR 0046 rule 3), and the opener's
   own entry goes when its last instance's does — so a run that released everything holds no key at
   all rather than N empty maps.
8. **What this does NOT do, and where each goes.** What a nested region CARRIES and how it ENDS — the
   three branch-exit paths under nesting, `JP-R12` at two levels, N = 0 inside a map, retention per
   instance, ADR 0044 visibility — is **W85**'s. *This item edits the three exit sites and drives none
   of them*, which is P22 fact 5's measured gap and the reason W85 is its own item. The exit artifact
   and the reference are **W86**'s, and L6 is **UNMOVED** here: an item that changes an identity and
   moves a rung of real runs has not kept `regionId`'s value.
