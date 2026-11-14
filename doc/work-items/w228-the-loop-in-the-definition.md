# W228 — the `loop` node kind in the definition: its keys, its refusals, the schema and the wiring check's arcs

**Status:** todo — declared 2026-11-14 on `df60b9e`
**Plan:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md) — its first item.

```
Spec:       spec/flow-definition.md: section 2 gains `loop` (its keys, what it receives, what its entry may be);
            section 3's `needs` table gains "$iteration" and the fifth arc of "."; section 4 states a loop region
            with the four sets and what does NOT change (P47 fact 12, re-taken as a real loop); section 5 gains the
            refusals below. spec/task-id.md section 1: a round's index is a DISPATCH-side segment, as a map
            instance's is (ID-R6 widened to a loop). Changed FIRST, as its own edit with its rationale.
Owns:       spec/flow-definition.md, spec/task-id.md, src/definition/** (types, validate, regions, wiring,
            definition-schema, witness as needed), test/definition/**, spec/examples/valid/ and
            spec/examples/invalid/ loop fixtures, doc/decisions/0145-*.md
Inputs:     P47 decisions 1, 4, 5 (the `until` comparison), 6; facts 12-16
Outputs:    (1) `kind: "loop"` with `branch` (required; a `task` or an `ask`), `until` (required; a comparison from
                the declared subset over the ONE root `input`, GATE_SCOPE's), `maxIterations` (required; integer
                >= 1), `maxIterationsFrom` (optional; FD-V16-charset key path), `needs` (optional; the seed); no
                `edges`. Its join is an ordinary `join` with `of`.
            (2) a reference from OUTSIDE a loop to a node of its body, at both sites fact 14 names (node `needs`,
                edge `needs`), read as after a map (decision 1 (b′)): the fact 13 document GREEN for a loop as for a
                map, its singular twin RED by FD-V28 for both. ADR 0044's reading of an instance that did not reach
                the node is CONFIRMED against the code before the spec is written — a stop-and-ask if it does not
                leave that instance out.
            (2a) refusals, each its own FD-V with a failing fixture: `maxIterations` absent or not an integer >= 1;
                "$iteration" where no loop contains the reader (FD-V49's pattern); `until` outside the subset or
                off the `input` root (the existing comparison rules, at a new site).
            (3) regions.ts: a loop is a region opener whose branch index is a property of the dispatch;
                branchPathOf refuses without a round index (ID-R6 widened).
            (4) wiring.ts: E's inputSchema held against the loop's value (its `needs`, or what reached it) AND
                against the output of EVERY body node with an edge to the loop's join — one arc each, naming its
                producer.
            (5) definitionSchema and definitionSchema(registry) carry the kind and its keys.
            (6) Q810 decided: a constant in `needs` accepted with its grammar, or declined with the transforming
                node as the stated form.
            (7) ADR 0145: a loop is a region that runs its one branch sequentially, read from outside as a map is,
                its join value its state — P47 decisions 1-5.
Depends on: nothing
Blocks:     W229
Tests:      L1/L3/L4 suites: each refusal by rule id and subject; the fact 13 document and its singular twin, each
            for a loop and a map; every acceptance
            (a training-shaped and a polling-shaped loop; a map inside a loop; a loop inside a map instance; a loop
            inside a loop); branchPathOf with and without a round index; each wiring arc, matching and mismatching,
            naming its producer; the schema accepting and refusing the same corpus as validateDefinition on the
            shape it can carry. Expected values from the spec text written FIRST, not from output.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:item` once on the
            final tree.
Reserves:   Q811-Q813, ADR 0145-0146
```

## Scope

**In**

1. Everything on the `Outputs:` line.
2. The two spike documents of P47 facts 12-13, rewritten as real `loop` fixtures in `spec/examples/`.

**Out** — named rather than left implicit, with where it goes instead

- What a run DOES with a loop — opening, carrying, deciding, the join value, the rounds a reader outside receives,
  `maxIterationsFrom`'s run-time refusal: W229.
- A `map` or `fanout` as a loop's entry; `onLost`; `delayMs`: P47 *Out*.
- `AGENTS.md`: W230, once the run-time behaviour exists to document.

## Verification

Routing cases this item covers, by the template's list: a branch routed away from its join — an `end` inside the body
is VALID (the break), which is a definition fact here and a run fact in W229; `user_action` — not applicable (no run);
no matching decision edge — not applicable; a duplicate task id — `branchPathOf`'s refusal without a round index; a
nested fan-out — a map inside a loop and a loop inside a map instance, both validated.

## Record

*Filled in when the item is done.*
