# W153 — a gate type's routes may come from its NODE

**Status:** todo — declared 2026-10-13 on `06a45ca`; declaration step RUN the same day, its findings below, written before any `src/` edit
**Plan:** [P32](../plans/p32-what-a-gate-may-decide-without-memory.md) — *may a gate decide by a
declared condition or a declared value table, without memory?* — and this is its FIRST item: the
interface, not the built-ins.

```
Spec:       spec/flow-definition.md — section 2's gate subsection, section 3's "Gate types" table,
            FD-V39/FD-V40/FD-V41/FD-R5's rows; spec/README.md's row for the new version.
Owns:       src/definition/types.ts, src/definition/validate.ts, src/definition/wiring.ts,
            src/driver/driver.ts, src/driver/routing.ts, spec/flow-definition.md, spec/README.md,
            AGENTS.md (its GateType sections only), test/definition/gate.test.ts,
            test/definition/wiring.test.ts,
            test/driver/gate.test.ts, doc/decisions/0092-*
Inputs:     P32 decisions 1-3 and 7, stop-and-asks (a) and (d) ANSWERED 2026-10-13 as recommended;
            P32 facts 1-3, RE-RUN at this item's declaration step, never transcribed (P15 decision 5);
            ADR 0066 rules 1, 2 and 4 (what is amended); ADR 0067 (a gate runs in the driver and its
            decision is recorded); ADR 0068 (keyResolvedRoutes); ADR 0053 (why the subset cannot
            check a grammar).
Outputs:    (1) ADR 0092 — a gate type's routes are declared STATICALLY or DERIVED from its node's
                settings, exactly one of the two; a gate is a node that routes by a registered
                type, and memory is something a type MAY use. Amends ADR 0066 rules 1 and 2.
            (2) `GateType` becomes `StaticGateType | DerivedGateType` — the second carries
                `routesFor(settings) => { routes, defaultRoute, keyResolvedRoutes? }` IN PLACE of the
                three static members — and both may carry `settingsProblem(settings) => string | null`;
                `distinct` is declared `StaticGateType` (the declaration step, re-take 1)
            (3) `gateTypeProblem` refuses a type carrying both static routes and `routesFor`, and one
                carrying neither — FD-V39
            (4) ONE function, `routesOf(gate, type)`, resolving a gate's route set once at
                instantiation (after FD-V40 passed), held to gateTypeProblem's existing route clauses;
                a `routesFor` that throws or returns a malformed set is refused at the GATE, FD-V39
            (5) every reader of P32 fact 2 — FD-V41's count, FD-R5's undeclared-route stop, `gateEdge`'s
                default, the wiring check's default and keyResolvedRoutes — reads the RESOLVED set
            (6) `settingsProblem` run by FD-V40 after the settingsSchema, its message reported under it
            (7) spec/flow-definition.md's version, its rows, and AGENTS.md's GateType text and snippets
Depends on: nothing
Blocks:     W154
Tests:      L1 `test/definition/gate.test.ts` — each new gateTypeProblem clause with its accepted
            neighbour; a derived-route type whose routes differ per NODE, FD-V41 counting each
            gate against its own set (a route wired on gate A and missing on gate B refused at B
            alone); `routesFor` throwing and returning a malformed set; `settingsProblem` refusing
            and passing. Expected values from the spec text, never from the validator's output.
            L2 `test/driver/gate.test.ts` — one run routing on a derived route, its default by an edge
            with no `route`, and FD-R5 on a route outside the NODE's set that IS inside another node's.
            `test/definition/wiring.test.ts` — the two sites the compiler cannot see (re-take 1):
            a derived-route type's default edge and keyResolvedRoutes read off the NODE's set.
            `distinct`'s suites UNMOVED: no existing assertion edited.
Gate:       `npm run gate:item` (doc/workflow.md v0.26 / v0.29); then the conformity reader and the
            adequacy reader, workflow section 6.
Reserves:   Q584-Q588, ADR 0092
```

*Reserves derived by `npm run state` at P32's declaration: the tree's next free question is **Q584**,
P32 having raised Q582 and Q583; P32 reserved ADR 0092-0093 and this item takes **0092**.*

## Scope

**In**

1. **The interface** — Outputs (2)-(3): the two optional members and the exactly-one rule.
2. **The resolution** — Outputs (4)-(5): one function between every reader and the type.
3. **The settings hook** — Outputs (6).
4. **The record** — ADR 0092, the spec rows, `AGENTS.md`'s `GateType` text.

**Out** — named rather than left implicit, with where it goes instead

- **The built-in `if` and `switch`** — **W154**. This item ships the road; a test type derived per
  node stands in for them, registered through the public interface as a consumer's would be.
- **Any change to `distinct`** — it keeps its static routes, byte-identical.
- **An `input` root for a declared comparison** (P32 fact 4) — **W154**, which is the only reader.
- **The exit artifact** — **W155**.

## What the declaration step must re-take before anything is edited

*P15 decision 5: every fact is re-run by the item that acts on it.*

| # | re-take | against |
|---|---|---|
| 1 | P32 fact 2: every read of `routes`, `defaultRoute` and `keyResolvedRoutes` in `src/`, by grep and by making `routes` optional and counting the typecheck errors across the five lanes, each run separately | the ten sites P32 names (it said nine, and counted ten) — an eleventh is this item's |
| 2 | where a gate's type is resolved at instantiation and whether the driver re-resolves it, or reads the validator's | whether `routesOf` is computed once or twice per gate, and if twice, whether both can disagree |
| 3 | `checkRegistry`'s `GateTypeRefused` road: is a type held to `gateTypeProblem` before any node names it | whether a `routesFor` defect can be refused at the REGISTRY (no settings yet) or only at the gate |
| 4 | the ladder counts — L1-L5 cases in three runtimes, L6 assertions and runs | the baseline P32 did not take |

## What the re-takes found — RUN 2026-10-13 on `06a45ca`, before any `src/` edit

*The tree carried P32, Q582, Q583 and this file uncommitted, all under `doc/`; nothing under `src/`,
`test/`, `spec/` or `examples/` differed from `06a45ca`.*

**Re-take 1 — the TEN sites CONFIRMED by grep, and the compiler names EIGHT of them.** P32 fact 2
said *nine* and listed ten; the plan is corrected in place. Making `routes` and `defaultRoute` optional
in `src/definition/types.ts` and running each lane SEPARATELY gave **9 errors in every lane** (two on
one line) at `validate.ts` 1025, 1031, 1032, 1035 and `driver.ts` 2563, 2569, 2698, 2713 — then the file
was restored from `git` and `git diff` was empty. **Two consequences, and both change Outputs:**

| finding | consequence |
|---|---|
| **`wiring.ts:384` and `:567` raise NOTHING** — both already read through `?.`, so `undefined` is a type they accept | the compiler will not find a wiring site left reading the TYPE. **Each is bound by a TEST**: a derived-route type through `checkWiring`, its default edge resolved to the NODE's default (`:384`) and its `keyResolvedRoutes` read off the node's set (`:567`) — with the route NAMES chosen so a type-level read gives a different verdict |
| **three reads outside `src/`** — `test/definition/gate.test.ts` 252 and 520, and **`examples/l6.ts` 8915**, which reads `distinct.routes` and is OUTSIDE this item's `Owns` | Outputs (2) is a UNION, not two optional members: `GateType = StaticGateType \| DerivedGateType`, and `distinct` is declared `StaticGateType`, so `distinct.routes` stays a `readonly string[]` and `examples/l6.ts` is not edited. *Predicted, confirmed by the gate:* `AGENTS.md`'s two snippets (`sloppy: GateType = { routes, defaultRoute, fn }` and `noGuarantee as GateType`) typecheck unchanged under `check:docs` |

**Re-take 2 — the type is resolved in THREE places, independently, and the driver re-resolves on
EVERY decision.** `validateDefinition` per gate (`FD-V39`-`FD-V41`); `Driver` via `gateTypesOf` at
construction (`driver.ts:1315`) and then `this.gateTypes.get(node.type)` inside `decideGate`
(`driver.ts:2681`) at every arrival and once more for an entry gate's `FD-R4` road; and `checkWiring`
via its own `gateTypesOf` (`wiring.ts:762`), **which does not run the validator first**. So:

- `routesOf(type, settings)` is ONE exported function, PURE and TOTAL — it returns a route set or a
  problem, catches a throwing `routesFor`, and hands `routesFor` a COPY of the settings.
- The **validator** reports its problem as `FD-V39` at the gate. The **driver** calls it once per gate
  at construction, after `validateDefinition` passed, and `decideGate` reads that cache — so within one
  run the route set has ONE answer, and a resume (a new driver) recomputes it from the same settings by
  the same function. The **wiring check** treats a problem as it treats an unknown type today: no
  default, no guarantee, the arcs reported as they are.
- **Can the two computations disagree?** Only for a `routesFor` that is not a pure function of its
  settings, which the interface requires it to be (Q9's demand of every decision). The driver's cache
  removes the disagreement WITHIN a run; one between validation and the run is the impure type's, and
  is stated in ADR 0092 rather than checked.

**Re-take 3 — every registered type is held BEFORE any node names it.** `checkRegistry` →
`checkGateTypes` runs `gateTypeProblem` over every entry, the built-ins included (`registry.ts:510`),
in every `new Driver` (`driver.ts:1305`) and in the runtime (`runtime.ts:415`). So **the exactly-one
rule — static routes or `routesFor`, never both, never neither — is refused at the REGISTRY** as
`GateTypeRefused`, and at the gate as `FD-V39` for a definition validated without one. **What
`routesFor` RETURNS can only be held at the gate**, because only a node has settings: `FD-V39`, through
`gateTypeProblem`'s existing route clauses applied to the returned set.

**Re-take 4 — the baseline.** `npm run gate` **EXIT 0** in 2m40s, node 24.20.0, deno 2.9.6:

| rung | count |
|---|---|
| L1-L5 | **56 files / 1593 cases**, identical in node, deno and chromium |
| L6 | **2487 assertions / 164 real runs**, in node and in deno |
| `check:spec` | 7 documents / 72 examples / 132 rules |

## Verification

`npm run gate:item`, then the two readers. **Routing coverage**: a branch routed away from its join
(Q4) — not applicable, a gate's out-arcs are unchanged in kind; `user_action` (Q17) — not applicable,
a gate never settles; no matching decision edge (Q10) — FD-R5's road is in Tests; a duplicate task id
(Q13) — not applicable, a gate has no task id; a nested fan-out (Q6) — not applicable.

## Record

*Filled in when the item is done.*
