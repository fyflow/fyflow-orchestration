# P32 — What may a gate decide without memory, and from what the flow declares?

**Status:** in progress — declared 2026-10-13 on `06a45ca`; stop-and-asks (a)-(d) ANSWERED by the
maintainer 2026-10-13, all four as recommended; W153 and W154 done 2026-10-13
**Question this plan answers:** *can a flow route the value that reaches a node by a declared
condition (`if`) and by a declared table of values (`switch`), with no worker before the decision and
no code registered for it — and what must the gate interface give up to let a type's routes come from
its node?*
**Exit artifact:** *on the final tree, an L6 run in node 24 and in deno of one flow whose ENTRY is an
`if` gate over the payload and which later routes a task's result through a `switch` gate, driven by
one payload per route — every route of both gates taken by exactly the payloads the spec says, with no
predicate and no gate type registered; a flow with a `switch` case left unwired refused at load by
`FD-V41` naming the case; and `npm run gate:full` EXIT 0 (the LAST item runs it, workflow v0.29).*
**Reserves:** W153-W156 (W156 expected unused), Q582-Q596, ADR 0092-0093

```
Question: may a gate decide by a declared condition or a declared value table, without memory?
Items:    W153 (a type's routes may come from its node — ADR 0092), W154 (the built-in `if` and
          `switch`), W155 (the exit artifact, on real workers in both runtimes)
Reserves: W153-W156 (W156 expected unused), Q582-Q596, ADR 0092-0093
Raises:   Q582 (a loop), Q583 (a join that fires before every branch settles) — both deferred, at
          this declaration
Baseline: ids derived by `npm run state` at this declaration — P32, W153, Q582, ADR 0092 from the
          tree (the ledger reads W152, Q580; the disagreement is printed, not resolved). The ladder
          counts are NOT taken here and are W153's declaration step's
Declared: 2026-10-13 on `06a45ca`, once the maintainer answered (a)-(d) as recommended
```

## Why this plan, and why now

**The maintainer asked for an `if` gate and a `switch` gate on 2026-10-13**, and for an evaluation of
whether any other crucial flow node is missing. Today the library routes in two places, and neither is
either of those:

| construct | routes on | from the document alone? |
|---|---|---|
| `when` on a **task's or join's** edges (section 3, ADR 0074) | that node's EFFECTIVE OUTCOME — `outcome.*` and the edge's `needs.*` | yes, since P26 |
| a `gate` (ADR 0066, ADR 0067) | whatever its TYPE decides over the value that reached it | **only through `distinct`** — every other decision is a type written in code |

So a flow **cannot route the value that reaches a node without a worker before it**, unless someone
writes code. The places that bites: the **entry** (route the payload), **directly after a gate**, and
anywhere an author wants the decision to be a node a UI draws rather than a property of the previous
task's edges. And a **switch** is writable today only as N edges carrying `{ op: "eq" }` plus a
default, where nothing says a case was forgotten.

## Four facts measured before drafting, and TWO changed what is written here

Measured on `06a45ca`.

**Fact 1 — an `if` is ALREADY writable by a consumer, and a `switch` is NOT writable by anyone.**
`evaluateWhen` (`src/driver/routing.ts:120`) and `predicateProblem` (`src/definition/validate.ts:528`)
are public exports through `index.ts`, so a consumer gate type with `routes: ['then', 'else']` can call
the declared-comparison evaluator from its `fn` in a few lines. **A switch cannot be a gate type at all**:
`GateType.routes` (`src/definition/types.ts:688`) is ONE fixed list per TYPE, read before any node's
settings are, and a switch's routes are its NODE's cases. *This is the fact that makes the plan an
interface change rather than two new built-ins.*

**Fact 2 — the route set is read in TEN places, and every one reads it off the TYPE.** *(This read NINE while naming the ten below; W153's declaration step counted them.)* `routes` at
`validate.ts:1025` and `:1032` (`FD-V41`), `driver.ts:2563` and `:2698` (`FD-R5`); `defaultRoute` at
`validate.ts:1030`/`:1038`, `wiring.ts:384`, `driver.ts:2569`/`:2713` (via `gateEdge`); and
`keyResolvedRoutes` at `wiring.ts:567`. A per-node route set has to reach all ten, which is what
decision 2 keeps to one function.

**Fact 3 — a declared `when` cannot be checked by a `settingsSchema`, and that decides decision 3.**
`FD-V42`-`FD-V45`'s grammar — exactly one of three shapes, a closed operator list, roots, scalar values —
is not expressible in ADR 0053's subset, which has no `pattern` and no `oneOf`. The only gate setting the
library checks beyond a schema is `key` (`FD-V40`, `validate.ts:1010`), and it does so by name. So an
`if` whose condition is malformed would load and stop the run on the first workload to reach it — **ADR 0002
rule 3's case exactly**: what can be refused at instantiation is.

**Fact 4 — a declared comparison may not read the value a gate receives.** `PREDICATE_ROOTS` is
`['outcome', 'needs']` (`src/definition/types.ts:78`) and `FD-V43` refuses every other first segment by
name. A gate has no outcome and no edge `needs` (`FD-V41` refuses `needs` on a gate edge), so an `if`
needs a root naming **what reached the gate**.

## Scope

**In**

1. **ADR 0092**: a gate type's routes may be derived from its NODE's settings, resolved once per gate
   at instantiation, and every reader in fact 2 reads the RESOLVED set. `distinct` and every consumer type
   written against ADR 0066 keep working unchanged.
2. A gate type may declare a **settings check beyond its schema**, run by `FD-V40` at instantiation.
3. Two built-in gate types beside `distinct`: **`if`** and **`switch`**, written against the public
   interface exactly as `distinct` is (P24 decision 2).
4. `spec/flow-definition.md` — section 2's gate subsection, the gate-types table, `FD-V40`/`FD-V41`'s
   rows, `FD-V43`'s root rider and a contract row for what the two read; spec example corpus valid and
   invalid cases; `AGENTS.md`'s gate section, which `check:docs` executes.
5. The exit artifact at L6 in both runtimes.

**Out** — named rather than left implicit

- **A new node KIND.** `FD-V24` refuses `kind: "decision"` on purpose and stays; a seventh kind is a
  seventh arm on every consumer's exhaustive switch ([Q381](../questions/q381.md)). Both are gate TYPES.
- **A registered predicate NAME inside an `if`.** A name receives a `DecisionContext` — `outcome` and
  `needs` — and a gate has neither; a decision that needs code is a consumer gate type, as today.
- **A `when` on a gate's EDGE.** `FD-V41` refuses it and ADR 0066 gives the reason; an `if` is a TYPE
  whose routes are wired the way every gate's are.
- **Refining the wiring check along an `if`'s path**, the way `keyResolvedRoutes` refines along a key
  (ADR 0068). An `if`'s `then` could guarantee its compared path present; priced at W154's declaration,
  not promised here.
- **A loop** — [Q582](../questions/q582.md), deferred. `FD-V10` refuses every cycle, and task ids, the
  fold and resume assume none.
- **A join that fires before every branch settles** (race, first-N, quorum) —
  [Q583](../questions/q583.md), deferred. A queued task cannot be cancelled
  ([S2](../scheduler-upstream.md)), so the losers would run on.
- **A sub-flow node and a timer node.** Evaluated on 2026-10-13 and not raised: a worker can start a
  second run, and a timer puts a clock beside a fold that is pure by construction. Raised when a case
  needs one.

## Decisions taken before fan-out

*Decisions 2, 4, 5 and 7 carried a stop-and-ask, and **the maintainer answered all four as
recommended on 2026-10-13** — the table below records what was asked. The rest follow from a
precedent named beside them.*

1. **`if` and `switch` are GATE TYPES, built in beside `distinct`, and nothing in the validator, the
   wiring check or the driver names either.** P24 decision 2's precedent: a built-in registered through
   the interface proves the extension road the day it ships. **Neither reads `memory`** — ADR 0092
   states that a gate is *a node that routes by a registered type*, memory being something a type MAY
   use, which ADR 0066's title (*a decision WITH MEMORY*) does not say.

2. **A type declares its routes STATICALLY or DERIVES them from its node — exactly one of the two.**
   `GateType` gains an optional `routesFor(settings)` returning `{ routes, defaultRoute,
   keyResolvedRoutes? }`; a type carries either the three static members or `routesFor`, and
   `gateTypeProblem` refuses both and neither (`FD-V39`). The library calls `routesFor` **once per gate,
   at instantiation, after `FD-V40` passed**, holds the result to `gateTypeProblem`'s existing route
   clauses, and every reader in fact 2 reads that resolved set — **one function, `routesOf(type, settings)`,
   between them and the type** *(this read `routesOf(gate)` until W153's declaration step fixed the signature)*. A `routesFor` that throws or returns a malformed set is the GATE's
   refusal, by rule id, at load. **Stop-and-ask (a).**

3. **A type may declare `settingsProblem(settings): string | null`**, run by `FD-V40` after the schema
   and reported under it. Fact 3: the subset cannot state a predicate's grammar, and the alternative —
   a rule id per built-in — is the library naming a type, which decision 1 refuses.

4. **`if`** — settings `{ when }`, routes **`then`** and **`else`**, **default `else`**:

   ```json
   { "id": "triage", "kind": "gate", "type": "if",
     "settings": { "when": { "path": "input.priority", "op": "gte", "value": 5 } },
     "edges": [ { "route": "then", "to": "escalate" }, { "to": "queue" } ] }
   ```

   `when` is a declared COMPARISON or flat GROUP — `FD-V42`-`FD-V45`'s grammar, **minus the NAME
   shape** (Out, above) — evaluated by the same evaluator a task edge's `when` is. Its one root is
   **`input`**: the value that reached the gate, as the `structuredClone` carries it (ADR 0067's reading,
   so a run and its replay agree). *Default `else`*, so an edge with no `route` is the fallback, as a
   task's edge with no `when` is. **Stop-and-ask (b).**

5. **`switch`** — settings `{ key, cases }`, routes the case names plus **`default`**, **default
   `default`**:

   ```json
   { "id": "byStatus", "kind": "gate", "type": "switch",
     "settings": { "key": "status", "cases": { "approved": "approved",
                                                "rework": ["rejected", "needs-changes"] } },
     "edges": [ { "route": "approved", "to": "publish" },
                { "route": "rework", "to": "revise" },
                { "to": "review" } ] }
   ```

   `key` is the library's key path (`FD-V40`, unchanged) resolved over what reached the gate; `cases`
   maps a ROUTE NAME (`FD-V16`'s charset, `default` reserved) to a SCALAR or a non-empty array of
   scalars. Matching is **type-strict `===`** — `FD-C7`'s *a comparison between kinds is no match and
   never a coercion*, so `"1"` and `1` are two cases, as they are two keys to `distinct`. A value named by
   two cases is refused (`settingsProblem`); a key that does not resolve, or matches no case, is
   `default`. `keyResolvedRoutes` is every case route. **Because the routes are the node's own, `FD-V41`
   refuses a case with no edge** — the forgotten case the edge-chain form cannot catch. **Stop-and-ask
   (c).**

6. **Both are pure by construction** — a contract row beside `FD-C7`: each reads exactly its settings
   and what reached the gate, through a key path, with no clock, no I/O and no registry lookup, so
   replaying a run re-asks them to the same answers (`RN-R26`, unchanged).

7. **`spec/flow-definition.md` takes the version, and section 5 gains no FD-V id unless W153's
   declaration step measures one is needed** — `routesFor` and `settingsProblem` defects report under
   `FD-V39` (the type) and `FD-V40` (the settings), split by what an author fixes, `FD-V28`'s precedent.
   **Stop-and-ask (d).**

### Stop-and-asks — the maintainer's, ANSWERED 2026-10-13: all four as recommended

| | the question | recommended — and TAKEN | the alternative, and its cost |
|---|---|---|---|
| **(a)** | static routes OR `routesFor`, exactly one | **yes** — every type written against ADR 0066 is untouched and `distinct` stays byte-identical | always `routesFor`: one shape, and a breaking change to every consumer gate type |
| **(b)** | `if`'s routes `then`/`else`, default `else` | **yes** — reads as a sentence, and the unlabelled edge is the fallback as on a task | `true`/`false`: shorter, but a route named `false` reads as *not routed* in a diagram |
| **(c)** | `switch` matches VALUES; ordered conditions stay a cascade of `if`s or a task's edges | **yes** — a value table is what *switch* means and the one shape `FD-V41` can make exhaustive | a `choose` whose cases are each a `when`: more general, but first-match-wins is a task's edges already, and its cases cannot be checked for overlap |
| **(d)** | no new FD-V id; defects under `FD-V39`/`FD-V40` | **yes** | a rule per built-in: the library naming a type, which decision 1 refuses |

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W153 | **A gate type's routes may come from its node** — `routesFor`, `settingsProblem`, `routesOf(type, settings)` behind every reader in fact 2; ADR 0092 amending ADR 0066 rules 1 and 2 | `src/definition/types.ts`, `src/definition/validate.ts`, `src/definition/wiring.ts`, `src/driver/driver.ts`, `src/driver/routing.ts`, `spec/flow-definition.md`, `spec/README.md`, `AGENTS.md` (its `GateType` sections), `test/definition/gate.test.ts`, `test/definition/wiring.test.ts`, `test/driver/gate.test.ts`, `doc/decisions/0092-*` | — | `gate:item`; L1 a derived-route type refused by each `gateTypeProblem` clause, L2 one run routing on a derived route, and `distinct`'s suites UNMOVED |
| W154 | **The built-in `if` and `switch`** — `BUILT_IN_GATE_TYPES` grows two; the spec rows; the example corpus; `AGENTS.md`'s gate section | `src/definition/validate.ts`, `spec/flow-definition.md`, `spec/examples/**`, `AGENTS.md`, `test/definition/gate-builtins.test.ts`, `test/driver/gate-builtins.test.ts` | W153 | `gate:item`; L1 each over a table of values — absent, `null`, wrong type, boundary, a two-case value — L2 every route of both taken, and an entry `if` held by `FD-R4` to the target it chooses |
| W155 | **The exit artifact** — one flow through both, on real workers | `examples/flows/**`, `examples/l6.ts` | W154 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W156 | *reserved, expected unused* | | | |

Each has its own file under `doc/work-items/`, written at its declaration step. This table is an index,
not the declaration.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q582](../questions/q582.md) | a loop: may a flow revisit a node? | no owner — deferred |
| [Q583](../questions/q583.md) | a join that fires before every branch settles | no owner — deferred |
| [Q589](../questions/q589.md) | the wiring check's refinement along an `if`'s `then` route — priced at W154's declaration | no owner — deferred |

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.**

**What the plan answered.**

**Retro.**
