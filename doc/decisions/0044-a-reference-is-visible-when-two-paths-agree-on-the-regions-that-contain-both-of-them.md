---
id: ADR 0044
title: "A reference is visible when two paths agree on the regions that contain both of them"
status: accepted
date: "2026-09-10"
item: W49
raised-by: Q206, P14
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0044 — A reference is visible when two paths agree on the regions that contain both of them

**Raised by:** [Q206](../open-questions.md), decided by
[W49](../work-items/w49-what-a-reference-across-sibling-regions-means.md) under
[P14](../plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)

## Context

**[Q206](../open-questions.md) is
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 4's resolution predicate disagreeing with the rule that decides which form an author may
write.** `spec/flow-definition.md` section 3 says a node produces more than one output for a reader
**exactly when** the reader is outside a `map` region containing it — `FD-V28` counts by REGION — and
resolution then filtered by *one path is a prefix of the other*, which compares segments **by
position**. The two agree wherever the reader is inside or after the region it names, and for two
**sibling** regions they do not: `FD-V28` demands `["score"]` and says *one output per ITEM*, and the
array that arrived held **at most one** entry.

**Found by [W45](../work-items/w45-what-a-reference-must-be-able-to-say.md)'s conformity reader**,
recorded in `spec/flow-definition.md` section 3 with its measurement, and left unowned for one stated
reason: the fix is either a fourth refusal or a change to the visibility predicate, and P13 decision
1 forbade its own items from reopening that predicate. P14 decision 1 reopens it, **and it may not be
taken silently** — this ADR names what moves.

### What was measured, at the scope it was measured at

`doc/workflow.md` section 1 rule 5's writing clause. Every figure is from a run on the tree this item
ships, at node 24.20.0, over **both** corpora — `spec/examples/valid/**` and `examples/flows/**`, 30
flows. The scripts are thrown away with `dev-dist/`.

| | measured |
|---|---|
| **Q206's own measurement reproduces exactly, at all three arity pairs** | `reference-past-a-map-arity.flow.json`: at `items 3 / slots 1`, `publish@0` receives **one of three** and the other two are reachable from nowhere; at equal arities each instance receives its index-matched one; past the arity the run stops with `UnresolvedReference` naming the node, the path, the key and the target |
| **and P14 fact 3's MECHANISM is wrong, which is what re-took the whole question** | That fact says `map-over-region-output` works *"because `rank`'s `over` is the resolved `["score"]` itself, so the two arities are equal by construction and the index-matched entry is exactly the one that instance wants"*. Measured: that flow declares its reference on **`rank`, the map NODE**, whose branch path is **`-`** and which is a member of **no region** — `branchPathOf` returns `"-"` for it and **throws `UnresolvedBranchPath`** for `reference-past-a-map-arity`'s `publish`. So `rank` receives **all N** of `score`'s outputs *before any instance exists*, and no index-matched entry is involved at any point. **The two flows differ in WHERE the reference is declared, not in their arities** |
| **so the defect is not about a `map` and not about arity at all** | Constructed, since neither corpus contains a sibling `fanout` pair: two sequential `fanout` regions, both branches of the second declaring `needs: {"first": "scoreA1"}` against branch 0 of the first. `validateDefinition` returns **0 findings**; `publishB1` at path `0` **resolves**; `publishB2` at path `1` **stops the run** at `FD-R3`. `FD-V29` correctly calls the target certain. *There is no arity anywhere in that document, and which branch the author wrote the reference in decides whether the run completes* |
| **the cause, exactly** | A `branchPath` carries one segment per containing region, innermost last. `isPathPrefix('0','2')` and `isPathPrefix('2','0')` are **both false**, so for two sibling regions **only the equality case ever fires** — a reader saw a target because the two strings matched, and equality is the prefix relation's reflexive case. *Two unrelated regions mint indices into one namespace* |
| **the scope, both corpora** | **11** aimed references written across 30 flows, of which **1** crosses a sibling pair; **143** (reader, target, form) triples admitted by the shipped rules, of which **3** do. The admitted set is measured by running `validateDefinition` itself, with the registry derived **per flow** — W45's conformity reader's finding by name, since a hard-coded registry drops eight `examples/flows` documents as invalid and silently shrinks the denominator |
| **and there is still no spelling that reaches all of a sibling region's outputs** | All eight the grammar admits, re-run: `"score"`/`"score?"` refused by `FD-V28`; `["score"]`/`["score?"]` give **one** entry; `"."` gives the reader's own item; `"regroup"` gives a reshaping node's output; and **`"collect"`/`["collect"]` are refused by `FD-V27`, because a reference's target must be a TASK** — so a region's collection is unreachable by any reference at all |
| **what each candidate costs, spiked in the working tree and restored with the bytes compared back** | **(a) a fourth refusal: 11 L1-L5 failures**, L6 green at 879 / 40, and `reference-past-a-map-arity.flow.json` becomes an **invalid document**, so a corpus flow leaves. **(b) this decision: 6 L1-L5 failures**, L6 green at 879 / 40, no corpus flow lost. **The 6 are a strict subset of the 11**, and all six are `FD-R3`/`FD-C4` fixtures that reach those rules THROUGH the sibling road |
| **and P14 decision 2 holds under both** | `map-over-region-output`'s three instances are untouched by either, because its reader sits at `-` and shares no region with its target under any of the three predicates |

### The finding that settles it

**`FD-V28` was right and the resolution was wrong.** The rule counts outputs by REGION; the filter
compared indices by POSITION; the two disagree exactly where the region chains do not nest. So the
repair is not a new refusal on top of a predicate that is answering a different question — it is to
make the filter ask the question the rule asks.

**And the prefix rule is this rule's SPECIAL CASE rather than its predecessor**, which is what makes
the change affordable. `containing(n)` is a nesting chain (`FD-V22`, and `innermostRegionOf`'s own
argument), so the regions containing both nodes are always the **outermost k** of each chain. Where
the chains nest, k is the shorter chain entire and *agree on the first k* picks out exactly the
entries *one path is a prefix of the other* does. **Measured: every ancestor/descendant reference in
both corpora behaves identically under either, and ladder L6 is unmoved at 879 assertions over 40
real runs in both runtimes.**

**Candidate (a) was refused on a measurement rather than on taste.** It costs strictly more, it
removes a corpus flow, and it refuses the `fanout` case — where a branch of a later region reading a
branch of an earlier one is an ordinary thing to want and today's `FD-R3` is indefensible. *A refusal
would have made the failure loud; it would not have made the thing expressible, and Q206 is on the
register precisely as the row that says the library cannot express something an author would
ordinarily want.*

**Candidate (c) — relaxing `FD-V27` so a region's COLLECTION is referenceable — is NOT taken here and
is not refused.** It is the spelling an author reaches for (`"collect"`), it is additive to this
decision rather than an alternative to it, and it needs the join's collection **at resolution time**,
which the projection does not hold: `outputs()` is built from settled **task** records, and a join
produces none. That is new retention or a recomputation of `JP-R12` at a second site — which
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2 refuses by name, and whose cost is [Q19](../open-questions.md)'s own subject, declared out of
scope by P14. **P14's stop-and-ask list makes relaxing an existing rule the maintainer's call**, and
it was put to them with these numbers before this decision was written. [Q219](../open-questions.md).

## Decision

**Four rules. One is `spec/flow-definition.md`'s `FD-C1`, amended; the rest are what it rests on.**

1. **An output is visible to a reader when their two branch paths AGREE ON THE REGIONS THEIR TWO
   CHAINS SHARE.** Segment `i` of one path and segment `i` of another are indices into the same
   namespace exactly when entry `i` of their two region chains is the same region; beyond the common
   prefix there is nothing to compare, and comparing anyway is the defect. `regionChainOf`,
   `sharedRegionDepth` and `outputIsVisible` in `src/definition/regions.ts`.

   **The chain is the WALK `branchPathOf` makes, not `containing(n)`, and this rule said otherwise
   until its conformity reader.** The first form derived the depth as the SIZE OF THE INTERSECTION
   of the two membership sets, on the argument that *`containing(n)` is a nesting chain, so the
   regions containing both are the outermost k of each*. **Measured false on a document
   `validateDefinition` accepts with zero findings**: a fanout region's join placed inside a nested
   region makes one node's shared entry the INNERMOST of the other's chain, so a count returns 1
   where the shared region sits at segment 1. The answer survived — `branchPathOf` walks the opener
   chain and both paths inherit the outer segment either way — and *the justification licensing the
   implementation was unsound in the sentence two documents stated it in, on the eve of that
   implementation going into the driver.* Deriving from the same walk the path is built from makes
   *segment `i` corresponds to chain entry `i`* true by construction. **This ADR's title keeps the
   informal wording**, which is right wherever `containing` is a chain; rule 1 is the exact form.

2. **The prefix rule is this rule's special case and is REPLACED rather than kept beside it.**
   Two predicates would be two sources that can disagree, which is
   [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
   rule 2's own refusal. The generalisation is asserted rather than argued: the old rule is written
   out in `test/definition/sibling-regions.test.ts` from the sentence this document carried at
   v0.11-v0.14, and the two are compared over every nesting pair in five corpus flows — **they must
   agree there, and they must disagree on the sibling pairs.**

3. **Segment-wise and never by string, unchanged.** `"1"` and `"10"` are different segments; a
   `startsWith` hands instance 10 the output of instance 1, invisible below eleven instances and live
   at twelve. Inherited, and `test/driver/needs.test.ts`'s two-digit fixture still discriminates it.

4. **SIBLINGS ARE NOT ONLY A TOP-LEVEL SHAPE**, which the evidence had to be corrected to say. Two
   sequential regions inside ONE branch of an outer region are siblings sharing a prefix of length
   **1**, with both paths two segments long — and there the two rules disagree while both remain
   meaningful. **It is the only shape that tells rule 1 apart from *compare every segment***, the
   corpus contains none, and W49's adequacy reader measured that widening the loop bound to compare
   every segment cost **zero**. Constructed, asserted, and the reason the suite's first statement of
   rule 1 — *a sibling pair is always visible* — was false in general and green only because every
   sibling pair in the corpus is top-level.

5. **ADR 0040 rule 3's KEY does not move.** What NAMES an output is still the pair
   `(node id, branchPath)` — `FD-C2` — and a node id alone still does not. What moves is **rule 4's
   resolution predicate**, one sentence, at one expression with two call sites. `FD-V26`, `FD-V27`,
   `FD-V28` and `FD-V29` are read and not edited; no node kind is added (P14 decision 4).

## What this does to [Q206](../open-questions.md) and to P14's predictions

**[Q206](../open-questions.md) is RESOLVED.** Its row's *"there is no form an author can write from
inside `rank` that yields all of `score`'s outputs"* is answered by the form they were already
writing: `["score"]` now means what section 3 says it means. Its stated cause — *the fix is either a
fourth refusal or a change to the visibility predicate* — was a correct fork, and the second side
won on a measurement the row could not have had, because **the row is about a `map` and the defect is
not**.

**Prediction 1 REVERSES.** It says *candidate (a) cannot be written without an arity clause, because
it must refuse `reference-past-a-map-arity` and admit `map-over-region-output`, and the two differ
only in whether `over` names the reference's own key.* Its own stated reversal condition — *a static
predicate that separates them without mentioning arity* — is met, and by a different predicate than
the one the prediction guessed: not *the reader's `over` names this very key* but **the reader's
region chain**. The two flows do not differ in their arities at all; they differ in where the
reference sits, which fact 3 got wrong. *A derived prediction inherits its measurement's error.*

**Prediction 2 REVERSES.** *The answer is (c), making a region's COLLECTION referenceable, and not
(a) or (b).* It is (b). The prediction's premise stands — the author's natural spelling really is
refused by `FD-V27` rather than by the rule they would read — and it does not follow that the fix is
there, because the natural spelling being unavailable is a second, additive gap rather than the cause
of this one. Its stated reversal conditions were about (c)'s cost and did not fire; what reversed it
is that (b) turned out to cost less than either.

**Prediction 3 REVERSES**, and it is the one this decision makes false by winning. *W50 is SMALL: no
driver code moves.* The driver is exactly where this lands — `resolveReference`'s filter, one
expression, plus the fixtures that reached `FD-R3` through the sibling road. Its stated reversal
condition is *candidate (b) winning*, which it names.

**Prediction 4 is **W51**'s** and is
untouched here.

## Consequences

**What it makes easy.**

- **The array form means what the document says it means.** A node inside a region reading a sibling
  region's output receives **all** of it, at every arity pair, with no `FD-R3` and no reshaping node
  — which is the workaround
  [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
  exists to remove, arriving one plan later for the case that plan did not reach.
- **The `fanout` half stops being a coin flip.** A reference from any branch of a later region to a
  branch of an earlier one resolves, rather than resolving in branch 0 and stopping the run in
  branch 1.
- **`FD-V28`'s biconditional becomes true**, so section 3's *which shape arrives is never a run-time
  surprise* is a statement about the run and not only about the document.

**What it costs, stated rather than discovered later.**

- **Two functions join the published package surface.** `index.ts` re-exports
  `src/definition/regions.ts` with `export *`, so `sharedRegionDepth` and `outputIsVisible` — and
  `regionChainOf` — are exported from the package root the moment they are declared, with nothing
  asking whether they should be. That is [Q101](../open-questions.md)'s shape, and W32 hit it the
  same way with `UnresolvedBranchPath`. Recorded here because this decision's cost list omitted it
  until its conformity reader read `index.ts`. [Q221](../open-questions.md).
- **A sibling-crossing array no longer depends on the reader, so all N instances receive the same N
  entries.** That is
  [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
  arity × size cost at its worst, reachable in one line of a document — the cliff `spec/flow-definition.md`
  section 3 measures at ~70x on the showcase flow. **It is the same cost the same reference already
  had from outside the region**; what changes is that the reader can now be inside one. Nothing warns,
  which is [Q186](../open-questions.md)'s decision, unchanged.
- **`FD-R3` loses its last road that needs no custom join policy.** Case (a) of its row — *a reader
  whose branch path is comparable with none of the target's* — was the sibling road, and this removes
  it; what remains is the policy road, which needs a policy `validateDefinition` is not given.
  `FD-V29` removed the decision case at v0.13 and this removes the arity case, each leaving the
  backstop narrower. **`reference-past-a-map-arity.flow.json` no longer keeps that rule reachable**,
  which is the stated purpose W45 added it for. [Q218](../open-questions.md).
- **The predicate now needs the REGION SETS and not only the two strings.** `isPathPrefix` was a pure
  function of two paths and could be read in isolation; `outputIsVisible` takes the regions, so the
  resolver depends on the definition layer where it depended on a string comparison. It is the same
  `RegionSets[]` the driver already holds for `pathOf`, so it is no new state — but a reader asking
  *what decides visibility* now has two files to open. [Q220](../open-questions.md).
- **One item ships the rule without the behaviour.** The derivation and its L1 cases are W49's and the
  resolver is **W50**'s, so between
  the two commits `spec/flow-definition.md` describes a predicate the driver does not yet apply. That
  is v0.8's own split — a `map` node kind nothing dispatched for one item — and it is written into
  the document rather than left to be discovered.

**What could reverse it.** An author who wants the index-matched entry *on purpose* — two map regions
whose arities are equal by construction and whose indices genuinely correspond, where this decision
now hands them N entries and they wanted one. Nothing in either corpus is that flow, and the reason
is fact 3: the one document anybody pointed at as *the index-matched case working* turned out not to
be one. If it arrives, the fix is a reference form that says *my index*, and it is additive.
