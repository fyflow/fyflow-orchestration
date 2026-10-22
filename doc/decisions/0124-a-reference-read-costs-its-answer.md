---
id: ADR 0124
title: "A reference read costs its answer: the driver indexes a node's outputs by the prefix its readers share"
status: accepted
date: "2026-10-22"
item: W199
raised-by: P40, Q735
supersedes: ""
amends: ADR 0040 rule 2 in part
resolves: Q735
---

# ADR 0124 — A reference read costs its answer: the driver indexes a node's outputs by the prefix its readers share

**Status:** accepted — [P40](../plans/p40-what-a-reference-read-costs-inside-a-map.md) decisions 1-6 and stop-and-asks
(a)-(e), answered *"as recommended"* by the maintainer 2026-10-22 ((e) as (e1)); written by
[W199](../work-items/w199-the-reference-index-a-read-costs-its-answer.md). It defines `spec/flow-definition.md` v0.46
(section 3: what FINDING a reference costs) and `spec/run-state.md` v0.32 (`RN-R13`'s index term).
**It amends [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2** — *computed rather than maintained* — again, after [ADR 0117](0117-a-reference-may-name-what-reached-the-run.md),
[ADR 0118](0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md) and
[ADR 0121](0121-the-driver-keeps-a-per-task-view-of-its-log.md) (P40 decision 6's list), under ADR 0121's condition carried one level.
**[ADR 0044](0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) is NOT
amended**: its predicate stays the definition of visibility. It resolves [Q735](../questions/q735.md) and answers
[Q43](../questions/q43.md)'s concern for this structure by rule 3's condition.

## Context

[Q735](../questions/q735.md), raised by W197's wall: `resolveReference` took EVERY output the named node had produced —
inside a `map`, one per instance — asked ADR 0044's predicate of each, and sorted the survivors. A branch task reading an
earlier task of its OWN instance found one entry at the cost of the node's whole list, so the map cost O(items²).
fyflow-app's flows read their own branch's nodes (its `needs` editor offers every upstream task), and `"."` reaches only
the predecessor. Re-taken at W199's declaration on `6006caa`, the driver alone, `post` reading its own instance's `work`,
`task.running` before each settlement, each size a fresh process: **701 / 22,033 / 99,029 ms** at 2,000 / 8,000 / 16,000
items in node 24.20.0 and **474 / 12,006 / 64,208** in deno 2.9.6; two steps back (`work` → `mid` → `post`) 1,310 /
41,622 / 176,628 in node; a reader in a NESTED map 18,251 / 290,697 ms at 2,000 / 8,000. A CPU profile at 8,000 items:
`outputIsVisible` 37.9% self, the filter's callback 24.1%, `regionChainOf` 12.0%, `resolveReference` 10.4%.

The predicate is a lookup in disguise (P40 fact 2): it depends on the reader and the target only through the DEPTH their
region chains share — a graph fact — and then on equality of the first `depth` segments of the two branch paths.

## Decision

1. **ONE key function, and the predicate restated through it** — `visibilityKey(path, depth)` in
   `src/definition/regions.ts`: the first `depth` SEGMENTS of a branch path, joined, `''` at depth 0, `null` for a path
   with fewer. `outputIsVisible` is `key(reader) !== null && key(reader) === key(target)` at the shared depth — no change
   of behaviour (an L1 case compares it to its pre-W199 body over every (reader, target) pair of every valid corpus flow
   at 169 path pairs each; `test/definition/sibling-regions.test.ts` unmoved). **Segment-wise, never by string** (ADR 0044
   rule 3): a segment holds no `.`, so two keys are equal exactly when their segments are, and `1` and `10` stay distinct.
2. **The index** — inside `outputsCache`: per named node, per shared depth a reader asks at, the node's entries grouped by
   `visibilityKey`, each group in `compareBranchPaths` order and never kept empty. Built for a `(node, depth)` on its
   first read from the node's current entries, each group sorted ONCE; from then on grown in `place` at each of its five
   cases — a first entry, an append, an insertion at a first-record position, a replacement in place, a removal — by
   `reindex`, so it is caught up exactly when `byNode` is. The shared depth is memoised per `(reader, target)`.
   **A read takes the group filed under the reader's key** (`visibleOutputs`): one entry for a `"n"` reference, the group
   for `["n"]`. Both call sites — a node's `needs` (`compose`) and an edge's (`resolveNeeds`) — read it.
3. **It is not a second source, and that is the condition this amendment rests on** (ADR 0121 rule 2, one level out): it
   holds `byNode`'s OWN entry objects, grouped by a key computed from each entry's own path, and nothing else — no
   conclusion, no merge. The test holds the index's answer `===` the pre-W199 filter-and-sort (kept in the test as its
   ORACLE) at every read of every valid corpus flow under six drains, and a resume from every rest point of two of them, and the whole
   index equal to a regroup of `byNode` at every fold input.
4. **The count is `outputsCache.examined`** — the ENTRIES the index touches: each entry a build reads, one per index a
   `place` change lands in, each entry a read takes. A field of the private cache, never public (ADR 0121 rule 7's two
   constraints). **NOT counted**: the comparisons that find a sorted position, a splice's moves, the depth's graph walk,
   and the clone of each answer ([Q186](../questions/q186.md)). Pinned EXACTLY in `test/fold/map-cost.test.ts` at
   2,000 / 8,000 items: `2n` one step back, `2n` two steps back, `7n` in a nested map, `4n` from a sibling map whose
   READING map has three slots (P40 (e1)).
5. **What does NOT move** (P40 decision 5): what any reference resolves to — every composed payload and `ctx.needs`
   byte-identical to `6006caa`'s over every valid corpus flow under seven drains — `log-view.test.ts`'s six and *an uncloneable result first* — each with
   a resume from every rest point (182 runs, the session scratchpad's `w199/payloads.ts`; a measurement, not a gate entry) — the order of an `all` answer, `FD-R3`, `FD-C4`, ADR 0014's append order, `FoldInput`, `RunState`,
   `snapshot()`, a checkpoint, `CHECKPOINT_FORMAT` 1, `DRIVER_FIELDS`, the holder sets. **The invariant holds**: the index
   is the driver's read-side structure over its own projection.

## Consequences

1. **The driver at 2,000 / 8,000 / 16,000 items, `post` reading its own instance's `work`: 68 / 223 / 442 ms in node, 79
   / 258 / 560 in deno** — the same flow reading a one-output node takes 66 / 216 / 438. Two steps back 85 / 279 / 546
   (node); a nested map 178 / 661 / 1,246; a sibling map of three slots 51 / 145 / 266. The profile at 8,000 items is
   flat: `structuredClone` of each result (OR-R2) leads it.
2. **ADR 0040 rule 2 reads, from here**: *what a node can reach is the run's own outputs — a projection of the log, its
   entries the merge `effectiveOutcome` makes of each task's own records, caught up as the log grows, and found by the
   prefix its readers share — the value the run was handed (ADR 0117), and the item of its own map instance (ADR 0118).*
3. **`RN-R13` gains a term, never a copy**: the index is one more reference per entry per depth read and a key per group,
   for the life of the run. By `v8.serialize`, `outputsCache` costs **95.8 / 93.9 / 97.1 B an entry** at 10 / 100 / 1,000
   instances of a depth-1 read, against 87.5 / 87.6 / 90.7 — ~13 B per indexed entry.
4. **A read never costs LESS than its answer.** `FD-V28` forces `["n"]` on a reader in a SIBLING map and hands it every
   output of `n`, so two maps of `n` and `m` instances compose `n·m` entries whatever the resolver does — the answer's
   price, stated in `spec/flow-definition.md` section 3 beside Q186's clone. The cost check holds that shape with its
   reading map at a fixed arity (P40 (e1)), where the EXACT pin — not the ratio — is what turns red when the per-read
   filter or sort is restored COUNTED. **The stated limit**: a per-read sort that ticks nothing is seen by neither observer
   (the iteration observer counts no `sort` and no spread) — asserted green as a control, W199's conformity reader's
   finding 1.
5. **One function joins the published package surface, ADDITIVELY**: `visibilityKey`, from `src/definition/regions.ts`,
   which `index.ts` re-exports whole — the shape of W191's `innermostMapOf` and of [Q221](../questions/q221.md).
6. **Measured, not argued** (P40 fact 7's last sentence): a `"n"` reference with SEVERAL survivors at depth > 0 was not
   reached — a node in a `fanout` inside an instance has one output per instance (`FD-V19`), and every bare-form read in
   the constructed case found one. The `one` form's *first by path* is kept and is the oracle's.
