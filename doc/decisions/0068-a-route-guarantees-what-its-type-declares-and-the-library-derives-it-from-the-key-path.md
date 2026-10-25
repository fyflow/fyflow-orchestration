---
id: ADR 0068
title: "A route guarantees what its TYPE declares, and the library derives it from the KEY PATH"
status: accepted
date: "2026-09-29"
item: W99
raised-by: P25
supersedes: ADR 0066 in part
amends: ""
resolves: ""
---

# ADR 0068 — A route guarantees what its TYPE declares, and the library derives it from the KEY PATH

**Status:** accepted 2026-09-29 — [W99](../work-items/w99-what-a-route-guarantees.md) under
[P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md).
**Supersedes in part** [ADR 0066](0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md):
its Consequences say `checkWiring` treats a gate as a pass-through, and that is no longer the whole of it.
Nothing else in 0066 moves — a gate is still a decision with memory naming a registered type, and every
route is still wired exactly once.
**Answers** [Q391](../questions/q391.md).

## Context

1. **A tool this repository SHIPS gave a wrong answer about a correct flow.** `checkWiring` read a gate as a
   flat pass-through, so the arc through one was judged as the arc INTO it. On
   [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md)'s own exit artifact the per-series
   worker REQUIRES `series`, `identify` does not guarantee it (a trailer has none), and between them sits a
   `distinct` gate keyed on `series.id` whose `first` route is taken **only where that key resolved** — so
   the run cannot deliver the value the verdict fears, ladder L6 runs the flow to `completed` three times in
   both runtimes, and the check read `$: consumer requires "series", producer does not guarantee it`.
   [W94](../work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md) asserted that false `no`
   rather than hiding it.
2. **The check could not have known better: it could not see a gate's type at all.** `WiringRegistry` was
   `Pick<Registry, 'workers' | 'nodeTypes' | 'languages'>` and `src/definition/wiring.ts` contained **zero**
   occurrences of `gateTypes` — so it knew neither what routes a type declares, nor which is default, nor
   what any of them mean. *The pass-through was not a judgement about routes; it was the only reading
   available to something holding no type.*
3. **The guarantee is EXPRESSIBLE and the producer already describes the path.** `identify`'s `outputSchema`
   describes `$.series` and `$.series.id`; what it does not do is REQUIRE them, and the `first` route is
   exactly the condition under which they are there.
4. **The surface was free.** `Registry.gateTypes` is optional, so widening the `Pick` cost **zero** typecheck
   errors on all five lanes (W99's declaration step, P25 fact 5) — the whole cost is the derivation.
5. **And a key path is the ONE thing the library resolves on a gate's behalf.** The driver reads
   `settings.key` over the value that arrived and hands the result to `fn` as `ctx.key`. Everything else a
   route might mean is the type's own judgement, computed inside `fn`, where nothing static can follow.

## Decision

1. **A route guarantees what its TYPE declares, and nothing is inferred from a type that declares nothing.**
   `GateType` gains an OPTIONAL `keyResolvedRoutes`: the routes on which the gate's key path resolved, a
   subset of `routes` without repeats. **Absent means no guarantee**, which is what every type said before
   v0.25 and what the check assumed of all of them — so the change is additive and a consumer's existing
   type keeps its meaning exactly.
2. **The LIBRARY derives the schema, the type does not write it.** On an arc leaving a gate by a declared
   key-resolved route, `checkWiring` refines what arrived with `required` along that gate's own key path, at
   every step. *A per-route schema LITERAL was considered and is refuted by a fact*: a `GateType` is
   registered ONCE per name and the key path is per NODE (`settings.key`), so a literal on the type cannot
   name `series` — it could only describe something the settings do not parameterise. *(Amended by
   [ADR 0137](0137-a-key-path-indexes-an-array-by-a-bracket-suffix-and-a-plain-segment-keeps-its-meaning.md),
   [W216](../work-items/w216-a-bracket-array-index-in-a-key-path.md), `spec/flow-definition.md` v0.53: a key path may
   carry an array INDEX `[n]`, and at an index step the refinement raises that array's `minItems` to `n + 1`, never
   lowering it, and STOPS — nothing past an index is required, since `items` speaks for every element. The rule — the
   library derives the guarantee from the key path — is unmoved.)*
3. **The guarantee is PRESENCE, not the leaf's TYPE.** `distinct`'s `fn` returns `nokey` unless `ctx.key` is
   a string or a finite number, so its `first` route does promise more than *the path is there* — and
   *which leaf values count as a key* is the type's judgement and differs between types, so the library
   derives the half it can state for every type and no more. A type must not read this member as a promise
   about the leaf.
4. **A malformed declaration is `FD-V39`'s second clause, and this decision adds NO rule id.** One predicate,
   `gateTypeProblem`, reported at the gate that names the type, exactly where every other malformed member
   of this interface is. *A separate `FD-V42` was written first, and `check:spec`'s `C4` refused it by asking
   for a case in `spec/examples/invalid/` that cannot exist* — that corpus is a flow plus a JSON registry
   document, and a gate type is CODE, so no document can carry a malformed one. **An impossible fixture is a
   rule id in the wrong place.**
5. **The ROUTE an arc carries is resolved THROUGH the type.** An edge with no `route` carries the type's
   `defaultRoute`, so the check maps it and then asks, rather than treating *default* as a route of its own.
   Measured reason: `distinct.defaultRoute` is `first`, which IS one of its key-resolved routes, so a set
   holding a placeholder would have been right for the only type that exists and wrong — silently — for a
   type whose default is its unresolved route. *That is `doc/workflow.md` v0.23's selection clause: the
   plausible wrong selection coinciding with the right answer at the DEFAULT position.*

## Consequences

1. **The corpus number moves and one verdict changes**: `checkWiring` over `examples/flows` goes from
   **89 arcs / 2 `no`** to **89 / 1**, the survivor being `map-no-array`'s deliberate `FD-R2` — the static
   prediction of a refusal that row then runs. Every other verdict is unmoved.
2. **Ladder L6's own claim inverts.** The cross-row clause W94 wrote to assert the false `no` is replaced by
   its opposite: the arc `fits`, and the flow still completes. *That clause named this day in its own
   comment.*
3. **A consumer's gate type gets exactly what `distinct` gets**, which is what rules out deriving the
   semantics for the one built-in and calling it done — the road P25 stop-and-ask (a) priced and declined.
4. **What is NOT bought**: a route that guarantees something other than a key path's presence. Nothing in
   this repository needs one, and the shape that would serve it — a function on the type, handed the node's
   settings, returning a refinement — is named in P25 prediction 3's reversal column rather than built.
5. **Three silences, each deliberate**: a type declaring no `keyResolvedRoutes`, a gate naming no `key`, and
   a route the type does not call key-resolved. In all three the arrival passes through as before, and none
   of them is a finding the check reports — *the absence of a guarantee is not a defect in a flow.*
6. **A guarantee is read by the CHECK and by nothing else.** The driver does not consult
   `keyResolvedRoutes`; it asks `fn` and takes the edge wired for the answer, exactly as
   [ADR 0067](0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md)
   says. So a type whose declaration DISAGREES with its own `fn` misleads an author and changes no run —
   which is a cost, stated: nothing cross-checks the two, and nothing can, because `fn` is opaque.
