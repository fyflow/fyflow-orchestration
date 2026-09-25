# W92 — what a GATE is

**Status:** todo
**Plan:** [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md) — *what may a node
remember across a run's branches?* — and this is its FIRST item: the definition, not the run.

```
Spec:       spec/flow-definition.md — a sixth node kind, the edge key `route`, and the load-time
            refusals of P24 decision 4; the registry's gate types. spec/README.md's rows.
Owns:       src/definition/**, src/driver/**, spec/**, test/**, doc/decisions/0066-*
Inputs:     P24 decisions 1-8 and stop-and-asks (a)-(d), all ANSWERED 2026-09-25 as recommended;
            P24 facts 1, 5 and 6, RE-RUN at this item's declaration step, never transcribed
            (P15 decision 5); ADR 0002 (a definition is data, code registered by name); ADR 0054
            (a task node names a type); ADR 0053 (the schema subset that checks `settings`);
            ADR 0044 (why a branch cannot see its siblings); Q380.
Outputs:    (1) ADR 0066 — a gate is a decision with memory, names a registered TYPE, and every
                route its type declares is wired exactly once
            (2) the grammar: `kind: "gate"`, `type`, `settings`, `edges` whose members carry
                `route` and `to` and nothing else; an edge with no `route` means the type's
                DEFAULT route
            (3) the refusals, each an `FD-V` with a fixture both ways: an unknown gate type;
                `settings` its type's schema refuses; an edge naming a route the type does not
                declare; a declared route with no edge; two edges for one route; `when` or `on`
                on a gate edge; a key path outside stop-and-ask (d)'s grammar
            (4) gate TYPES in the registry, on ONE public interface — `{ routes, defaultRoute,
                settingsSchema, fn }` — with `distinct` (routes `first`, `duplicate`, `nokey`;
                default `first`; settings `{ key }`) built in THROUGH that interface, so a
                consumer's type is registered the way `distinct` is
            (5) the validator, `checkWiring` and the region walks taught the kind: a gate is a
                region member like a task, and what leaves it is exactly what reached it
            (6) a flow holding a gate REFUSED by `new Driver` by name until W93 runs one — W32's
                precedent for a kind valid before any driver executes it, taken at construction
                rather than at run time (the declaration step decides, with a measurement)
            (7) `AGENTS.md` section 3's node kinds, and every executed snippet that enumerates
                them or the refusal classes
Depends on: nothing
Blocks:     W93
Tests:      L1 `test/definition/gate.test.ts` — every refusal of (3) with its accepted
            neighbour, derived from the spec's rule text and never from the validator's output;
            the default-route rule against its unsafe reading (one edge with no `route` must NOT
            carry `duplicate`); `distinct` registered through the public interface, asserted by
            registering a SECOND type the same way in the test. L4: a valid gate document in
            `spec/examples/valid/`, held to section 7 both ways.
Gate:       L0 under all five typecheck lanes and `lint`, EACH RUN SEPARATELY and re-run after the
            last test file is written; L1-L5 in node, deno and chromium; `check:spec`;
            `check:docs`; `check:markdown`; L6 UNMOVED at 1853 / 100; then the full
            `npm run gate` with a content digest identical at both ends.
Reserves:   Q381-Q385, ADR 0066
```

*Reserves derived by grep off the tree at P24's declaration: the highest question raised on disk is
**Q380**, which P24 raised, so this item starts at **Q381**; P24 reserved ADR 0066-0067 and this item
takes **0066**.*

## Scope

**In**

1. **The kind and its grammar** — Outputs (2), and `spec/flow-definition.md`'s key tables.
2. **The refusals** — Outputs (3). **Every one is at LOAD**, against the registry: a document alone
   cannot know a type's routes, so shape is checked without a registry and exhaustiveness with one.
3. **Gate types** — the interface, the registry slot, and `distinct` built through it.
4. **Every site that must learn the kind** — Q380's fifty-one in `src/`, found by a failing test or by
   reading, since the typechecker names one.

**Out** — named rather than left implicit, with where it goes instead

- **Running a gate**: memory, the `gated` fold input, the undeclared-route stop, replay — **W93**.
- **Memory per region instance** — declared out by P24 stop-and-ask (a).
- **A second built-in gate type** — the interface ships and `distinct` is its only built-in.
- **The exit artifact and `README.md`** — **W94**.

## What the declaration step must re-take before anything is edited

*P15 decision 5: every fact is re-run by the item that acts on it.*

| # | re-take | against |
|---|---|---|
| 1 | P24 fact 5: `GateNode` in the union, the five lanes run separately — the number of typecheck errors and their sites | the churn this item must pay; Q380 |
| 2 | every one of the 51 `src/` sites and the 45 outside it, each classified: must learn the kind / falls through correctly / falls through WRONG | Outputs (5); the seeded exceptions |
| 3 | what `new Driver` does today with a gate document: `FD-V24` from the validator, and what reaches the driver's `default` arm | Outputs (6) |
| 4 | which corpus censuses pinned outside the corpus a new valid example moves ([Q342](../open-questions.md), [Q360](../open-questions.md)) | the seeded exceptions |
| 5 | Q142's margins on the tree this item starts from | `M3` 5, `M4` 22 after P24's declaration |

## Exceptions — files outside `Owns`

*Seeded from P24's table; marked at the build.*

| file | why | predicted? |
|---|---|---|
| `scripts/check-markdown.mjs` | `M4`'s margin is 22 links at P24's declaration; this item's record step is predicted to cross it ([Q142](../open-questions.md)) | P24 seed |
| `examples/l6.ts` | node-kind dispatch sites; a registry or type member its walks list | P24 seed |
| `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | six node-kind sites; `C7` reads every task's type | P24 seed |
| `AGENTS.md` | section 3's *five node kinds*; section 9's executed error-class enumeration | P24 seed |

## Verification

**Routing:** this item adds no routing — a gate is refused by the driver until W93. Of the states the
template names: a branch routed away from its join, `user_action`, a missing decision edge, a duplicate id
and a nested fan-out are **not applicable** here; a gate inside a nested region is a VALIDATION fixture
(region membership), not a run.

**What this item SELECTS, and the fixture where each wrong selection DIFFERS** (rule 8 obligation (a),
v0.23):

| selection | the right one | the well-formed wrong ones, each to be shown to DIFFER |
|---|---|---|
| the route an edge with no `route` carries | the type's DEFAULT route | *every* route; the FIRST declared route (for `distinct` they coincide — so the fixture registers a type whose default is NOT its first route) |
| the edge a declared route is wired by | exactly one, by name | the first edge; any edge (a gate with two routes and one edge must be refused) |
| the value a gate hands on | what reached it | the gate's settings; the predecessor's whole record |

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each separately | the union, the driver's `default` arm, the interface | see Record |
| L1-L5 node / deno / chromium | `gate.test.ts`, the corpus census | see Record |
| `check:spec` | the new rules and the valid example | see Record |
| `check:docs`, `check:markdown` | `AGENTS.md` section 3; ADR 0066 | see Record |
| L6 node and deno | UNMOVED | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

*Filled in when the item is done.*
