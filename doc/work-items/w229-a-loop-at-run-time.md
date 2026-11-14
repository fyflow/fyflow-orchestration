# W229 — a loop at run time: a round opened, carried, decided, broken and lost, and what its join hands on

**Status:** todo — declared 2026-11-14 on `df60b9e`
**Plan:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md) — its second item.

```
Spec:       spec/join-policy.md: section 2 states the loop's rounds in the region vocabulary (one region instance,
            one `branch.opened` per round, one terminal event per round); section 3 or 4 states that a loop's join
            takes no policy and when the driver fires it; section 4's "what a branch receives and what a join
            carries" gains the carried value and the join value. spec/flow-definition.md section 6 gains
            `maxIterationsFrom`'s run-time refusal (FD-R2's pattern). Changed FIRST, as its own edit.
Owns:       spec/join-policy.md, spec/flow-definition.md section 6 only (W228's otherwise, a declared late
            exception), src/driver/**, src/fold/** only if a measurement shows the fold must change (P47 expects
            not), test/driver/**, test/fold/** as needed, test/matrix/** (L5), doc/decisions/0147-*.md if one is
            needed
Inputs:     W228's outputs; P47 decisions 1-6; fact 16
Outputs:    (1) a round opens at its own branch-path segment with `branch.opened` before its first dispatch (JP-R5);
                round 0's entry receives the loop's value, round i > 0 the previous arrival.
            (2) on each arrival the driver reads `until` over it and the bound — maxIterations, lowered by
                maxIterationsFrom read ONCE as round 0 opens — and continues, completes or exhausts IN THE SAME
                synchronous routing step as the arrival (fact 16).
            (3) an `end` in the body is a break: the join fires. `branch.lost` in a round makes the join
                unsatisfiable (decision 2). A park holds the loop; cancel, stop and pause act as on any branch.
            (4) the join value { last, iterations, exhausted, broke?: { at, value } }, `last` per decision 5;
                "$iteration" resolved; a reader after the loop naming a body node in the array form receives every
                round's output in ROUND order, a round that routed around the node contributing nothing (decision 1
                (b′), ADR 0044's reading).
            (5) `maxIterationsFrom` absent, not an integer or < 1 at run time: a refusal naming the loop and the
                key, reported through OR-R10 from a listener, reported and rethrown from start() and resolve().
Depends on: W228
Blocks:     W230
Tests:      L2 from fixture outcome logs, one suite per way out — continue, done, exhausted, break, lost — each
            asserting the task ids minted, the region events in order, the join value field by field, and the
            fold's outcome; a reader after the loop over rounds one of which routed around the node (no entry, round
            order held whatever the settlement order); `maxIterationsFrom`
            lowering, not raising, and each of its refusals; "$iteration" in rounds 0..n. L5: the matrix gains a
            loop × lost / break / park-then-done / park-then-failed / cancel / stop / pause. Expected values from
            P47's decisions and the spec text, never from output. No test depends on completion order inside a
            map in the body.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:item` once on the
            final tree.
Reserves:   Q814-Q816, ADR 0147
```

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- Resume of a loop and the measured footprint: W230.
- Releasing finished rounds: [Q809](../questions/q809.md), deferred.
- `onLost: "exit"`: P47 *Out*.

## Verification

Routing cases this item covers: a branch routed away from its join — the break, L2 and L5; `user_action` — a round's
park, resolved `done` and `failed`, L5; no matching decision edge — `branch.lost` in a round, L2; a duplicate task id —
a round's id unique by its segment, asserted over every id a multi-round run mints; a nested fan-out — a `map` inside
the body, its join firing once per round.

## Record

*Filled in when the item is done.*
