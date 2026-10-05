---
id: ADR 0036
title: "Fan-out is two features over one region: a `map` is a second node kind, and a `branchPath` inside one is a property of the dispatch"
status: accepted
date: "2026-09-06"
item: W32
raised-by: Q12, P10
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0036 — Fan-out is two features over one region: a `map` is a second node kind, and a `branchPath` inside one is a property of the dispatch

**Raised by:** [Q12](../open-questions.md), decided by
[W32](../work-items/w32-what-a-map-fanout-is.md) under
[P10](../plans/p10-is-fan-out-one-feature-or-two.md)

## Context

**[Q12](../open-questions.md) has been open since P1** and is the only open question that might mean
the library is missing a **feature** rather than a guarantee. Its row states the case and this
decision does not improve on it:

> *"Route to A and B in parallel"* (a static parallel split, arity known at authoring time) and
> *"run this node once per item in the previous output"* (a map, arity known only at run time) are
> different features wearing one word. **Deciding they are the same primitive is a choice, not an
> observation.**

**The question this ADR rules on is not *should a map exist*.** P10 declared that it should and
made building it the plan's exit artifact. The question is **are these one primitive or two**, and
P10's declaration measured evidence pointing both ways. W32 re-derived that evidence and added four
measurements P10 had not taken; the new ones are what decided it.

### What argues ONE, re-derived rather than inherited

| | measured |
|---|---|
| **The id GRAMMAR already admits run-time arity** | `buildTaskId` needs **no widening**. Scalar indices `0 … 1_000_000` round-trip with **0** failures through the current `number \| readonly number[] \| null` signature; the nested forms `1.0`, `3.11`, `137.0`, `0.9999` round-trip; **500 indices for one node mint 500 distinct strings.** `spec/task-id.md`'s grammar is untouched by this decision |
| **Two of three shipped policies never read `region.branches`** | P10 fact 3, measured with a `Proxy`. Not re-derived here — it is W33's — and it is why P10 is a definition-and-driver plan rather than a join plan |
| **The region maths carries over whole** | With `FD-V9`'s floor set aside, a **one-subgraph region** produces **no other finding**: `FD-V12`, `FD-V13`, `FD-V20` and `FD-V22` all accept it, and `reaches`, `branchOf`, `region(F)` and `after(F)` all compute. This is [ADR 0030](0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)'s *"it needed no mechanism"* a second time |
| **The outer prefix is still derivable** | A map region nested inside a static one: `branchPathOf` gives `inner` → `"1"` and the mapped node → `"1.0"`. The **walk structure survives**; exactly one segment of it stops being derivable |

### What argues TWO — and the first row is the one nobody had measured

| | measured |
|---|---|
| **`branchOf` is keyed by branch NODE ID, so the two features do not agree on what a *branch* IS** | `branchOf` is a `Map<string, Set<string>>`. For `branches: ["x","x","x"]` it has **one** entry and `region(F)` is `{x}` — the region maths **collapses a repeated entry to one branch**, and `branchIndexOf` answers `0`. A static fan-out's index selects **which subgraph**; a map's index selects **which item through the one subgraph**. One word, two referents |
| **`FD-V19` is quadratic on one encoding and vacuous on the other** | Against the repeated-entry encoding: **1, 3, 6, 10, 15, 45** findings at N = 2, 3, 4, 5, 6, 10 — exactly `n(n-1)/2` pairs × the non-`end` nodes of the shared set, so a map of 500 items would produce **124 750** findings from one node. Against a one-branch region: **0 pairs, vacuous.** The same rule, two opposite behaviours |
| **`branchPath` is not a property of the node** | `branchPathOf` takes the region sets and a node id and **no run-time input at all**. For a mapped node it returns `"0"` — and it returns `"0"` for **every node of the branch subgraph**, not only the entry. Three dispatches mint **one distinct id of three**, and the second is a `DuplicateTaskId` at `ID-R1` |
| **`FD-V9`'s arity floor, and N=0** | The floor is a statement about the **document**. A map's arity is not in the document, so the floor cannot bind it — and a map reaches an N=0 the static feature can never produce (P10 fact 5) |
| **`arrival-count` gains a new failure direction** | P10 fact 4: at a run-time arity it fires on the **first** arrival with branches still live, where W4's matrix only ever recorded `need` being too **large**. W33's |

### The finding that settles it

**What the two share is the REGION. What differs is the whole of the fan-out.**

Every piece of machinery measured as carrying over — `reaches`, `branchOf`, `region(F)`, `after(F)`,
`FD-V13`, `FD-V20`, `FD-V22`, the join, the policies, the id grammar — is machinery about **a region
opened somewhere and closed at a join**. Every piece measured as breaking — how many branches there
are, what a branch index means, whether `FD-V19` has anything to say, whether the arity is in the
document — is machinery about **fan-out itself**. The shared half is shared *because it is region
machinery*, not because the two features are one.

**So Q12's answer is: two features over one region.**

### The correction this forced to P10's own framing

P10's declaration says *"`FD-V19`'s own refusal text says the same thing from the other side …
**a map is that condition on purpose**"*, and [Q27](../open-questions.md)'s row is written from the
same reading. **Measured, that is true of the repeated-entry ENCODING of a map and false of a map.**
A `map` node declares **one** branch, so *"two distinct branch entries of the same fanout"* has no
instance and `FD-V19` is not reached at all — 0 pairs, measured. **This decision therefore weakens
`FD-V19` by nothing**, which is what the [Q27](../open-questions.md) paragraph below turns on.

## Decision

**Fan-out is two features over one region.**

1. **`map` is a fifth node kind**, beside `task`, `fanout`, `join` and `end`. It opens a region and
   dispatches nothing itself, exactly as `fanout` does, and the region is closed by a `join` whose
   `of` names it.

   ```json
   { "id": "split", "kind": "map", "over": "items", "branch": "score" }
   ```

2. **A `map` declares ONE branch and a run opens N instances of it.** `branch` is a single node id,
   not a list. `over` is a **declared reference** to where the arity comes from — a key on the value
   the map node receives — and never a callback, which is
   [ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 1
   binding: a definition survives `JSON.parse(JSON.stringify(x))` or it is not a definition.

3. **`FD-V9` is unchanged and is a rule about `fanout` alone.** Its arity floor, its repeated-entry
   clause, its `edges` clause and its branch-entry-kind clause all keep their present meaning and
   present scope. **`FD-V25` is the map's own rule**, and the two are separate ids rather than one
   rule with clauses that apply to one kind each — because a rule about two kinds is the confusion
   this ADR exists to remove.

4. **Inside a `fanout` region a `branchPath` segment is a property of the NODE. Inside a `map`
   region it is a property of the DISPATCH.** `spec/task-id.md` section 1's heading is corrected
   rather than deleted: it remains true of the static feature, which is what it was written about,
   and it is stated as conditional rather than universal.

5. **A derivation that cannot answer REFUSES rather than guessing.** `branchPathOf` takes an
   optional per-region item index; asked for the path of a node inside a `map` region with no index
   for that region, it throws `UnresolvedBranchPath` naming the node and the map. This is `ID-R6`,
   and it exists because the alternative is measured: returning the declared index mints one id for
   N dispatches and the run dies at `ID-R1` on the second, naming a duplicate rather than the
   missing index.

6. **The grammar of `spec/task-id.md` section 1 is not changed by this decision**, and neither is
   `parseTaskId` or `buildTaskId`'s signature. A map's ids are the shape P1 reserved, at an arity P1
   did not have.

## What this does to [Q27](../open-questions.md)

**Nothing, and that is the answer rather than an omission.** [Q27](../open-questions.md) asks
whether two branches of one fan-out may converge on a shared node, which `FD-V19` refuses.

- `FD-V19` is **unchanged**: same text, same scope, same `fanout`.
- A `map` declares **one** branch, so `FD-V19`'s condition — *a non-`end` node in the `branchOf` sets
  of two distinct branch entries of the same fanout* — has **no instance** inside a map region.
  Measured: `0` pairs iterated, against `n(n-1)/2` for the repeated-entry encoding.
- So a map does **not** lift the refusal, does not weaken it, and does not create the ambiguity
  Q27 is about. **Q27 stays open exactly where it was**, with no owner, as a question about the
  static feature.

This is the sentence P10 said ADR 0036 owed that row, and it is the *two features* branch of P10's
conditional: *"If ADR 0036 answers two features, Q27 is untouched."* It does, and it is.

## Consequences

**What it makes easy.**

- **A map costs no id-scheme change.** The reserved shape carries it, so none of the *"every fixture,
  every log line and every test name"* cost `spec/task-id.md` section 1 spends its argument on.
- **Every region rule keeps one meaning.** `FD-V13`, `FD-V20` and `FD-V22` are about a region and
  are now about two kinds of region without a word changing, because they never mentioned branches.
- **A reader of the JSON can see where the arity comes from** without knowing the worker, because
  `over` is required.
- **[Q27](../open-questions.md) is not entangled with [Q12](../open-questions.md) after all**, which
  is the opposite of what both rows predicted.

**What it makes hard, stated rather than minimised.**

- **A fifth node kind is a fifth arm on every switch.** `FD-V24`'s kind list, `NODE_KEYS`, the graph
  builder's `succ`, `FD-V6`'s pairing and `FD-V12` all grow an arm. Four rules had their text
  widened to name `map` — `FD-V2`, `FD-V6`, `FD-V12`, `FD-V24` — and each is a spec change with its
  rationale in place rather than a side effect.
- **`branchPathOf` is no longer total, and its partiality is at run time rather than in the type.**
  The optional parameter is optional because `src/driver/driver.ts:839` calls it with two arguments
  and W32 does not own that file. A caller that forgets the index gets a throw rather than a
  compile error. `ID-R6` is that throw, and it is the honest cost of an additive signature.
- **The refusal ships with no driver able to reach it.** Nothing in `src/driver/` opens a map region
  until W33, so `ID-R6` is a rule that is correct and unreached — which is exactly `doc/workflow.md`
  section 5 rule 8 obligation **(e)**'s shape, and it is provoked at ladder L1 rather than argued.
- **A new exported `Error` subclass is a change to the consumer reference.** `index.ts` re-exports
  `src/definition/regions.ts` with `export *`, and `AGENTS.md` section 9's executed snippet
  enumerates every `Error` subclass the package root exports and throws on one it does not name. So
  adding the class edits a file W32 does not own; **W32 declares that as a late exception rather
  than discovering it in the gate.**

**What a future reader is likely to try that this forbids.**

- **Encoding a map by repeating a branch entry.** It is refused, it is refused *quadratically*, and
  the region maths would collapse it to one branch anyway. It is not a map.
- **Widening `fanout` with an optional `over` instead.** That is the *one primitive* answer, and it
  is what this decision rejects: it would make `FD-V9`'s floor conditional on a key's presence,
  make `FD-V19` fire or not depending on a sibling key, and give `branchPathOf` a return value that
  is derivable or not with nothing in the shape to say which.
- **Reading `FD-V9`'s floor as a rule about fan-out in general.** It is a rule about `fanout`. A map
  of one item is ordinary and a map of zero items is a run-time condition, not a document defect.

**What this does NOT decide**, named so the ADR is not read as having closed it:

- **What a branch receives, and what a join carries.** [Q11](../open-questions.md),
  [Q36](../open-questions.md) and [Q154](../open-questions.md) are **W34**'s, deliberately after the
  map runs — P10 decision 2. `over` names a key on the map node's input; the *contract* on what a
  node receives is that item's.
- **What happens when `over`'s value is absent or is not an array at run time.** A run-time refusal,
  and **no rule id is reserved for it here**: P10 decision 4 says this plan *"declares no policy
  refusal, no construction check and no new error class, because every candidate for one is a
  measurement W33 has not taken yet."* `ID-R6` is not that class — its case is measured and live at
  the derivation layer, with no driver involved.
- **Whether a map's branch may itself open a region** — a map inside a map, or a map inside a
  `fanout`'s branch. `FD-V25` requires a map's `branch` to be a `task`, exactly as `FD-V9` requires
  it of a `fanout`'s entries, so nesting goes through that task's edges and stays expressible and
  undecided, which is where P10's *"not taken"* left it. `branchPathOf`'s index parameter is keyed
  **per region** rather than taking a single index, so neither answer needs a signature change:
  [Q156](../open-questions.md).
- **An upper bound on arity.** Same. Not taken.

## Alternatives rejected

| | why not |
|---|---|
| **One primitive: widen `fanout` with an optional `over`** | It makes `FD-V9`'s arity floor conditional on a sibling key's presence, makes `FD-V19` fire or not depending on the same key, and gives `branchPathOf` a value that is derivable or not with nothing in the shape saying which. The measured facts split cleanly along the kind boundary — vacuous vs quadratic, in-the-document vs at-run-time — and a single kind puts that split inside every rule instead of between two |
| **One primitive: a map IS a `fanout` with a repeated branch entry** | Measured and refused three ways. `FD-V9` fires, `FD-V19` fires `n(n-1)/2` times, and the region maths **collapses the repeats to one branch** before either — `branchOf.size` is `1` for `["x","x","x"]`, so the encoding does not express N branches even to the layer that would have to honour it |
| **Keep `branchPathOf` total and let it return the declared index** | Measured: three dispatches mint `r1:x:0:0` three times, one distinct id of three. The run then dies at `ID-R1` naming a **duplicate**, which describes the symptom and not the cause. A refusal that names the node and the map is the same failure with the right diagnosis |
| **Make `branchPathOf`'s new parameter required** | `src/driver/driver.ts:839` calls it with two arguments and W32 does not own `driver.ts`. A required parameter is a change to a file this item may not edit, and it would put a compile error in W33's path for code W33 has not written yet |
| **Give `map` its own region vocabulary** | Nothing measured needs one. `regionSets`, `reaches`, `branchOf`, `region(F)` and `after(F)` all compute for a one-subgraph region and every region rule except `FD-V9` accepts it. Inventing a parallel vocabulary would be the *two features* answer taken one level too far |
| **A dotted path or expression for `over`** | A mini-language nobody has asked for. `over` is one key matching `^[A-Za-z0-9_-]{1,64}$`, which is `FD-V16`'s charset; widening it later is additive, narrowing it would not be |
