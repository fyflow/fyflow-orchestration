---
id: ADR 0118
title: "A map instance keeps its item while a node of it may still be entered"
status: accepted
date: "2026-10-19"
item: W191
raised-by: P38
supersedes: ""
amends: ADR 0040 rule 2 in part; ADR 0046 in part; ADR 0117 rule 7
resolves: ""
---

# ADR 0118 — A map instance keeps its item while a node of it may still be entered

**Status:** accepted — [P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md)
stop-and-asks (a), (c)-(e), (g)-(i), answered *"as recommended"* by the maintainer 2026-10-18 ((a) explicitly); written by
[W191](../work-items/w191-the-map-instances-item-as-a-reference.md). It defines `spec/flow-definition.md` v0.45 (section
3's `"$item"` row, `FD-C1`, `FD-C3`, `FD-V26`'s interim clause retired, `FD-V49`, `FD-R4`'s composition, the wiring
table's `needs` row) and `spec/run-state.md` v0.28 (`RN-R13`'s sixth term). **It amends
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2** — *computed rather than maintained* — for ONE structure, **[ADR 0046](0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)**
with a retained term released per INSTANCE rather than per region, and **[ADR 0117](0117-a-reference-may-name-what-reached-the-run.md)
rule 7**'s interim refusal of `"$item"`, which it retires. It resolves no question; it also fixes W190's S-1 (the
maintainer's answer, 2026-10-19).

## Context

fyflow-app's case 2: an ASK as a `map`'s branch entry, and the node after it in the same instance, which receives the
person's answer (P35 (e): the answer IS the ask's result) and has no road to the item the instance was opened with. Measured
at P38's declaration (fact 5): the map arm hands each instance `cloneValue(items[i])` and KEEPS nothing; a settled node's
item indices are read back out of its branch path, which carries no item; and the item is held, if anywhere, in the
PRODUCER's log record (`log.0.result.items.1`) — never as the instance's. So a `"$item"` reference needs either new driver
state or a re-derivation of what the map received, and the second re-implements `compose`, `JP-R11` and `JP-R12` at a
second site, which ADR 0040 rule 2 refuses by name (`spec/flow-definition.md`'s `FD-C3` row). The road that exists is a
pass-through task as the branch entry, before the ask: +1 dispatch, +4 clones and +2 log records per instance, N of them
(P38 fact 3). Every tree before W190 refuses `"$item"`, and W190 parsed it and refused it (`FD-V26`) until this decision.

## Decision

1. **`"$item"` names the item that opened the reader's MAP INSTANCE** — the element of `over`'s array the INNERMOST map
   region CONTAINING the reader as a member was opened with ((c)). An opener is never a member of the region it opens,
   so a `map` node's own `"$item"` is its ENCLOSING instance's item, and a node in a `fanout` inside a map instance names
   the map's. An outer map's item from inside an inner one is not named: a node of the outer instance that declares it
   passes it down. One function answers *which instance* — `innermostMapOf`, by the region chain's own walk — and the
   validator, the driver and the wiring check all read it.
2. **Legal everywhere the grammar is, inside a map instance** ((d)): a node's `needs` on a `task`, a `map` or an `ask`, and
   an edge's `needs` (the reader being the node it hangs on), the branch entry included, where it equals `"."`. Always
   there: no `?`, no array form (`FD-V26`), nothing for `FD-V27`-`FD-V29` to aim.
3. **Where NO map instance contains the reader it is `FD-V49`** ((g)), at a node or an edge, the message naming both fixes —
   *name the item where a map's branch receives it (`"."`), or move this node inside the map*. Its own id, on `FD-V28`'s
   precedent: `FD-V27`'s fix is to re-point the reference, this one's is to move the reader. ADR 0117 rule 7's interim
   `FD-V26` clause is retired.
4. **What an instance KEEPS** ((e)) — the one structure ADR 0040 rule 2's *computed rather than maintained* gives way for:
   **each instance's item, BY REFERENCE to the element the map received** — the driver's own value (an edge-hop clone, or a
   `needs` composition's per-key copy), so no extra copy — **except where that element may be the CALLER's**: a map the
   entry reaches through gates alone, declaring no `needs`, receives `start()`'s own payload object, and there the instance
   keeps its own copy, as an ask's `asked.input` does (P35 (f)). **Kept only where the map's region holds a `"$item"`
   reader**, decided from the document at construction: a flow that names no `"$item"` keeps nothing.
5. **Released when NOTHING of that instance may still be entered** — its own branch terminal (`branch.arrived`,
   `branch.exited` or `branch.lost`, `JP-R5`: one per opened branch) AND no branch of a region NESTED in the instance still
   live; released on whichever of those events comes last, before it is delivered. **Per instance, not with the region's
   collection** (ADR 0046 rule 3's window), **and at both levels**: a policy that fires a join before every branch is
   terminal ([Q583](../questions/q583.md)'s shape) would leave a late branch reading nothing, and *always there* would
   stop being true — whether that join is the map's own or a `fanout`'s nested in an instance, where the instance's branch
   can ARRIVE while a nested branch still runs. A suspended node — an ask, a parked task — keeps its branch live, and the
   item. *(This rule first read "released when that INSTANCE's branch goes terminal … after which no node of the instance
   is entered"; W191's conformity reader built the nested early-join run on which that was false, C1. The driver counts the
   live branches of nested regions per instance — O(nesting depth) per region event, nothing where no map keeps.)* **And released whole** at the run-level moments the region collections are — a halt, a cancel, a stop, a
   `cancelled` settlement — because no node of the run is entered after.
6. **Nothing new in the log, the header or the fold** (decision 5): the store is written where the MAP ARM runs, so a
   resume's replay — which re-enters the map arm in log order (`RN-R19`) — REBUILDS it from the header and the stored
   stimuli. `CHECKPOINT_FORMAT` stays 1; `RUN_FOR`, `isFed` and `snapshot()` do not move. The invariant holds: composition
   and what it reads are the driver's (ADR 0001 rule 1), and `fold(driver.foldInputs())` reads nothing new.
7. **A copy per key, per read** ((l), ADR 0040 rule 6, `JP-R11`): each `"$item"` key is its own deep copy of the kept item,
   so two keys on one node or one edge are two objects and no worker or predicate reaches the kept one. An ask's `asked`
   element keeps its composed input, `"$item"` keys included ((m)).
8. **At `FD-R4`, the walk's own element** ((i), W190's S-1): a walk target inside a map instance IS that map's branch entry,
   so its walked value is the instance's item; and `compose` derives a branch path ONLY for a NODE reference, which no entry
   names (`FD-V27`). *Until this decision it derived one for any `needs`, the walk had no item index to give, and an entry
   map's branch task declaring `"."` made `start()` throw a raw `UnresolvedBranchPath` instead of `BoundaryRefused`.*
9. **The wiring check composes a `"$item"` key over the enclosing map's ITEM arrival** ((i)): the `item` arc's schema and
   its per-element sample, the key taking each element in turn as a `"."` key does over an `item` arc, and `unchecked` where
   the map has no single arrival — an ENTRY map, whose arrival is the run's payload, or a map entered from two producers.
10. **`givenVerdict` and `tryTransform(…, { input })` compose nothing** ((j)), as for `"$payload"`: the given value IS what
    the node receives.

## Consequences

1. **ADR 0040 rule 2 reads, from here**: *what a node can reach is the run's own outputs — a projection of the log, computed
   rather than maintained — the value the run was handed, which the header keeps (ADR 0117), and the item of its own map
   instance, which the instance keeps while a node of it may still be entered.*
2. **ADR 0046 gains a retained term with its own window**: from an instance's opening until nothing of it may still be entered — not
   the region's — and empty for every region with no `"$item"` reader. `Driver.items` is on the retention ratchet's field
   list (`DRIVER_FIELDS`), walked.
3. **The app's case 2 needs no pass-through task**: a map whose branch is an ask has its successor declare
   `needs: { invoice: '$item', answer: 'review' }`.
4. **One function joins the public surface, additively**: `innermostMapOf`, from `src/definition/regions.ts`, which
   `index.ts` re-exports whole. Not BREAKING.
5. **[Q166](../questions/q166.md)'s *"Nothing it cannot ask for"*** was true of the branch entry and false one hop later
   (P38 fact 10); it is true one hop later from here — a dated note there at the record step.
6. **ADR 0119 is not needed.**
