# P32 — What may a gate decide without memory, and from what the flow declares?

**Status:** complete and retro'd 2026-10-14 — declared 2026-10-13 on `06a45ca`; stop-and-asks (a)-(d) ANSWERED by the
maintainer 2026-10-13, all four as recommended; W153 and W154 done 2026-10-13, W155 done 2026-10-14; the
exit artifact measured and ACCEPTED as measured (Record below, with the two places the built thing differs
from the exit sentence's words); the retro ran 2026-10-14 over `7b99fad` and the maintainer approved every
recommendation the same day — (t)-(w), and A, B and C, **B and C being sentences for the NEXT plan's
declaration** (Retro section 9)
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
| [Q594](../questions/q594.md) | `spec/run-state.md` section 10's stale corpus task-node figure (175 against 213) — W155's conformity reader, C5 | no owner — deferred |
| [Q599](../questions/q599.md) | three L6 rows that predate P32 go red for timing under load — raised by this plan's retro, (t) | no owner — deferred |

## Record

*Written 2026-10-14 over `7b99fad`, the tree clean before it. Every figure is read from the three items'
own files; none is re-measured here. Ids are bare text, as in P31's Record.*

**W153 — done 2026-10-13.** Its own Record covers the re-takes, the gate, the provocations and both
readers; this section names what the PLAN needs from it.

- **Built**: ADR 0092 (amending ADR 0066 rules 1 and 2), `GateType = StaticGateType | DerivedGateType`,
  `routesFor`, `settingsProblem`, and ONE function, `routesOf(type, settings)`, behind every reader of fact 2.
  **Fact 2 said nine and listed ten; the declaration step counted ten** and the plan was corrected in place.
  spec/flow-definition **v0.30**.
- **Closed: none. Raised: none** (Q584-Q588 unused). Decision 7 held: no new FD-V id.
- **Stop-and-asks (e), (e′), (f), (g), (h) asked and answered YES, (i) answered LEFT WALKED** — each
  outside `Owns`, each before its edit (workflow section 1 rule 6). Three are censuses a correct change
  turns red: `RN-R13`'s driver-field list (L1), L6's cross-row field list, and L1's suite census.
- **The readers**: conformity 1 should-fix (C1: `routesOf` was not TOTAL — a BigInt or a cycle threw out
  of `validateDefinition`, against ADR 0092 rule 3) and 7 notes; adequacy 63 mutations, 14 real gaps.
  All eight reader items acted on, under the maintainer's constraint that nothing adds per-decision work.
- **Overlap**: THREE shared subjects, the eighty-seventh measurement.
- **Counts**: L1-L5 56 / 1593 → **56 / 1617** in node, deno and chromium; L6 **2487 / 164** unmoved;
  `check:spec` **7 / 72 / 132** unmoved.
- **The confirming gate**: `npm run gate:item` EXIT 0 on the final tree, after the reader items.

**W154 — done 2026-10-13.** Its own Record covers the re-takes, the gate, 31 provocations and both readers.

- **Built**: `BUILT_IN_GATE_TYPES` = `{ distinct, if, switch }`; the `input` root for an `if`'s condition
  ALONE (`PREDICATE_ROOTS` unmoved, every task-edge message byte-identical); `FD-C8`; three corpus files;
  `AGENTS.md` sections 3, 9 and 19. spec/flow-definition **v0.31**.
- **Fact 1's second half was FALSE by the time W154 read it** — a switch was writable by a consumer since
  W153, which is what ADR 0092 was for. Nothing depended on it.
- **Closed: none. Raised: Q589**, deferred (the wiring refinement along an `if`'s `then`, priced at re-take
  6, kept Out by this plan). Q590-Q593 unused. **No ADR 0093** — stop-and-ask (k), answered NO; this
  record step added the pointer that answer named to ADR 0074's header.
- **Stop-and-asks (j)-(q)**: (j), (n), (o), (q) widenings answered YES; (k) NO; (l) REFUSE both (an empty
  `cases`, a value repeated in one case — built as P32's literal text first); (m) KEEP `input` alone
  refused; (p), the coordinator's, approved — the declared-comparison evaluator moved into a new
  `src/definition/condition.ts`, so no module cycle and no new public name. (q) was (p)'s consequence:
  `check:source` `S6`, the publish allowlist.
- **The readers**: conformity 1 should-fix (C1: `switch`'s routes are NOT in document order for
  integer-like case names — the spec sentence was false for an HTTP-status `switch`; routing unaffected);
  adequacy 83 mutations, 4 real gaps, all at JavaScript's number edges — one, `ne` as loose `!=`, a gap
  since W108 that `if` inherited. R1-R4 acted on.
- **Overlap**: ONE shared subject, the eighty-eighth measurement.
- **Counts**: L1-L5 → **58 / 1635** in all three; L6 **2487 / 164** unmoved; `check:spec` → **7 / 75 / 133**.
- **The confirming gate**: `npm run gate:item` EXIT 0 on the final tree, after R1-R4, one command.

**W155 — done 2026-10-14.** Its own Record covers the re-takes, the L6 arithmetic, three rule-8 passes and
both readers.

- **Built**: examples/flows/if-then-switch.flow.json — an ENTRY `if` (`input.confidence gte 0.5`) whose
  `then` reaches `score` and then a `switch` on `score` with a scalar case (`certain: 100`) and an array
  case (`likely: [80, 90]`); four rows `r64`-`r67`; one cross-row block.
- **Closed: none. Raised: Q594**, deferred (spec/run-state.md section 10's stale task-node figure, 175
  against 213 — the conformity reader's C5, raised rather than patched). Q595-Q598 unused. No ADR.
- **Stop-and-asks (r) and (s)**: (r) YES, option 1 — W110's cross-row block narrowed to W110's own two
  documents, every literal in it unchanged; (s) YES with reader item R4 — `RunReport.gateTypeNames`, so
  `examples/run-flow.ts` joined `Owns`. Readers' items R1-R7 approved and acted on, none touching `src/**`.
- **The census-site correction**: the brief named `test/definition/wiring.test.ts:441` (the L4 arc
  literal), and the census a new `examples/flows/**` document moves is the L6 corpus census above it
  (:225, :273, :275, :311). Re-take 2 measured it; the conformity reader confirmed it.
- **Overlap**: TWO shared subjects, the eighty-ninth measurement, and one DISAGREEMENT recorded rather
  than resolved (the (r) narrowing drops no coverage of today's rows, and drops a forward guard — R1).
- **Counts**: L1-L5 **58 / 1635** unmoved; L6 → **2599 / 168** before the readers and **2602 / 168**
  after (`CROSS_ROW` 266 → 269); `check:spec` **7 / 75 / 133** unmoved.
- **The confirming gates**: `npm run gate:full` **EXIT 0** on the PRE-reader tree, the first run, self-tests
  11 of 11 ok at 2426.6 s; then `npm run gate:item` **EXIT 0** on the FINAL tree, the first run, self-tests
  10 of 10 at 856.4 s.

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| an L6 run in node 24 and in deno of one flow whose ENTRY is an `if` over the payload and which later routes a task's result through a `switch` | `if-then-switch`, rows `r64`-`r67`, **0 failed in node 24.20.0 and in deno 2.9.6** in both W155 gates | **met** |
| *driven by one payload per route* | **FOUR payloads for FIVE routes** — 1 (`then`, `certain`), 0.9 (`then`, `likely`), 0.5 (`then` at the `gte` boundary, `default`), 0.2 (`else`). Every payload that takes `then` also takes a `switch` route, so no payload can take `then` alone; four is the fewest that takes every route (W155 Choice 1; the conformity reader's C4) | **met in substance; the WORDING differs from what was built**, and this Record is where that is said |
| every route of both gates taken by exactly the payloads the spec says | a LITERAL route table, its control from a second source (`routesOf` over each gate's settings, both ways), and since R2 the flow's `if` condition itself pinned | **met** |
| with no predicate registered | each row on the UI registry with an EMPTY predicate map, asserted | **met** |
| with no gate type registered | **since R4 / (s), read off each row's OWN runtime** (`RunReport.gateTypeNames`, asserted empty), beside the sibling-runtime check W155 first shipped. *Before the readers it read a SIBLING runtime built by the same call — the conformity reader's C1, the adequacy reader's S5* | **met, on the final tree only** |
| a flow with a `switch` case left unwired refused at load by `FD-V41` naming the case | the derived document (`grade` less its `likely` edge and the end only it reached) refused by `validateDefinition` and by `runtime.start`, **ANCHORED since R3** to `route "likely" of this gate` — before R3 a substring a message naming the wrong route also passed | **met** |
| `npm run gate:full` EXIT 0 (the LAST item runs it) | **EXIT 0 on the pre-reader tree** (L6 2599 / 168). The final tree, after R1-R7 and (s), ran **`gate:item` EXIT 0** (L6 2602 / 168), which is `gate:full` less `check:register:selftest` alone — and the post-reader diff added one register file, q594.md | **met on the pre-reader tree; on the final tree every lane but one** — stop-and-ask (u), **ACCEPTED as measured by the maintainer 2026-10-14** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **56 / 1593 → 58 / 1635** in node,
deno and chromium; L6 **2487 / 164 → 2602 / 168** in node and deno; `check:spec` **7 / 72 / 132 → 7 / 75 / 133**.

**What the plan answered.** **Yes**: a flow routes the value that reaches a node by a declared condition
(`if`) and by a declared value table (`switch`), with no worker before the decision and no code registered
for it — on real workers, in both runtimes. **What the gate interface gave up** is ADR 0092's: a gate is
*a node that routes by a registered type*, no longer *a decision WITH memory*, and a type's route set may
be its NODE's, so every reader reads one resolved set per gate and `FD-V41` can refuse a forgotten `switch`
case — the one thing the `{ op: "eq" }` edge chain could not. **Nothing about `distinct` moved**: static,
byte-identical, its suites unedited. The per-decision path gained one `Map.get` in place of a property read
(W153 re-take 2), and nothing after it.

**Questions**: raised **Q582, Q583** at the declaration, **Q589** (W154), **Q594** (W155) and **Q599** (this
retro, by the maintainer's answer to (t)), all five deferred; **closed none** — this plan built a feature and
took no question in. `npm run q -- --where status=open --count` stays **2** (Q20, Q513).

## Retro

*Pass 3 ran on 2026-10-14 over `7b99fad`, the working tree clean before it, in a subagent at the maintainer's
request. Every figure is read from the three items' Records; this retro re-ran no gate, no harness and no
measurement. **Sections 1-8 are the proposal as it went up; section 9 is the maintainer's answer and the
bookkeeping it allowed in `doc/workflow.md`**, the only edits made there.*

### 1. The stop-and-asks, (a)-(s)

Twenty lettered asks over the declaration and three items, every one asked before its edit and answered
before the item went on. *A widening* is workflow section 1 rule 6's ask to widen `Owns`; *design* is a
choice the plan or the spec had not made; reader items are counted apart.

| item | widenings, each answered | design, each answered | reader items approved | raised |
|---|---|---|---|---|
| P32's declaration | — | (a) static OR derived, (b) `then`/`else`, (c) `switch` matches values, (d) no new FD-V id — all as recommended | — | Q582, Q583 |
| W153 | (e) `RN-R13`'s driver fields, (e′) L6's cross-row field list, (f) a registry comment, (g) L1's suite census, (h) AGENTS.md's gate row — YES, (h) widened by C7 | (i) `gateRoutes` WALKED, not skipped | 8 | — |
| W154 | (j) the built-in-set literals, (n) two comments, (o) `RUN_FLOOR`, (q) the publish allowlist — YES | (k) NO ADR, (l) REFUSE both, (m) KEEP; (p) the evaluator's own module, the coordinator's | 4 | Q589 |
| W155 | (r) narrow W110's selection, (s) `RunReport.gateTypeNames` — YES | the census-site correction, recorded and not objected to | 7 | Q594 |
| **P32** | **11, 11 YES, 0 NO** | **9** | **19** | **4, all deferred** |

**Rule 6's NO branch has still not run** — eleven widenings, eleven YESes, the third plan running (P31
section 1: ten of ten). **(k) was a NO, and it was a design NO**, not a widening refused.

### 2. The recurring class — a CENSUS outside `Owns`

**Six of the eleven widenings were a census or a ratchet a correct change turns red, and a seventh, (q), an allowlist of modules** — and they stopped
every item:

| item | the census | found by | when |
|---|---|---|---|
| W153 | (e) `RN-R13`'s `DRIVER_FIELDS`; (e′) L6's cross-row field list; (g) L1's `LATE_SUITES` | L1, L6, L1 — the first lane run | AFTER the declaration; re-take 1 grepped the route READS, not the censuses a new field and new suites move |
| W154 | (j) three built-in-set literals | **grep at re-take 5** | AT the declaration, before any edit |
| W154 | (o) `RUN_FLOOR`; and (q), the publish allowlist, a census of modules | `check:docs:selftest`; `check:source` `S6` | AFTER — re-take 7 read what `check:spec` and `check:docs` demand of new FILES and not what `check:source` demands of a new MODULE |
| W155 | (r) W110's two literal per-row lists | **re-take 2: the change BUILT IN A BYTE COPY and every lane run** | AT the declaration |

**And the brief got one site wrong**: W155's named `test/definition/wiring.test.ts:441`, the L4 arc literal,
and the site the new flow moves is the L6 corpus census above it — W154's *For W155* note was right about
:441 and the brief copied the line without its condition. **W155's re-take 2 found that too, by running
rather than reading.**

**Followed, and it worked.** Section 7 rule 2 (`Owns` from the plan's row) was followed in all three; the row
cannot name a census nobody has run. Section 1 rule 6 turned every late site into an ask before its edit.
**Every census a rung could catch, a rung in `gate` caught**, before any commit (pass 3 rule 5: L1, L6, a
self-test, `check:source`). Late census sites ran **three, two, zero** over W153, W154, W155 — and the zero is the
item that built its change in a copy before writing `Owns`. That is ONE occurrence of a method (pass 3 rule
2), so it is proposal B below as a declaration sentence, not a rule.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W153 | 1 should-fix (C1, `routesOf` not total), 7 notes | 63 mutations, 14 real gaps, 5 equivalent | **3** | 87th |
| W154 | 1 should-fix (C1, route order), 5 notes; the evaluator's move byte-identical over 9,617 + 15,176 generated cases | 83 mutations, 4 real gaps, 7 equivalent, 1 unspecified | **1** | 88th |
| W155 | no defect, 5 gaps, 3 nits | 18 mutations, 4 subjects surviving L6 | **2** | 89th |

**All three inside the 0-4 band**, each with the briefs deliberately differed. **The ordinal is now
EIGHTY-NINE and the next measurement is the NINETIETH**; the band's *fifty-nine* stays, as P28's, P29's and
P31's retros held it.

**The readers are the mechanism for the seventh plan running.** Every adequacy reader found gaps the author's
own provocations never reached — 14, 4 and 4 — and in W153 a declared Output was false (*total*) until the
conformity reader constructed a BigInt. W155's two readers DISAGREED on one subject and both were right
(section 6's *an overlap is a shared SUBJECT*).

### 4. Rules followed that failed, and the candidates (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) a Record's preamble outlived its tense** — W153, W154 and W155 each say *the reader passes have NOT run* in a Record whose gate table holds both readers; W153's and W154's *What this taught* say the same | **BROKEN**: section 1 rule 5's *un-write* direction — a withdrawn claim is searched for — was not applied to a sentence the readers withdrew | **this retro** (pass 3 rule 6; section 7) | **No change**: the rule exists. Three occurrences in three items is pass 3 rule 2's bar for a NEW rule, and the only new one is a check over `doc/` — section 6 |
| **(b) the census class** (section 2) | FOLLOWED | a rung, every time | **No change**; proposal B |
| **(c) two confirming gates per item** — each item paid a confirming gate BEFORE its readers and again after: W153 834.6 s then 1229.5 s; W154 1574.5 s (plus 1221 s of lanes run separately) then 1106.3 s; W155 2426.6 s `gate:full` (plus 3554.5 s of lanes run separately while (r) waited) then 856.4 s | FOLLOWED: each declaration's Gate line says *`gate:item`; then the readers*, and section 4 says pay once *on the final tree* | **no rung**; measured here from the Records | **proposal C** |
| **(d) W155's `gate:full` ran on the PRE-reader tree** | FOLLOWED the coordinator's direction | — | stop-and-ask (u) |

**Pass 3 rule 5 over P32's defects**, by what caught them: **a rung in `gate`** — the six censuses, `S6`, two
`lint` failures, `typecheck:examples` on a `LogRecord`, `X10`; **the spec over the run** — W155 re-take 4, a
branch path `-` and not `''`; **the conformity readers** — W153 C1-C7, W154 C1-C3, W155 C1, C2, C5; **the
adequacy readers** — 22 real gaps over three items; **this retro** — (a) above. **A self-test inside a
confirming gate: 0**, the third plan running.

### 5. The flaky L6 rows

**Three rows that predate P32 went red for timing, never in a confirming gate**:

| row | its failure | where seen in P32 |
|---|---|---|
| `uncloneable / OR-R6, threaded` (r63, W133's) | reads `running` at its 400 ms backstop | W155 re-take 5; rule-8 P1, P4 (node) |
| block (2h), kill point K=21 | — | W155 re-take 5; rule-8 P1, M11 (node) |
| `tv-ingest / arranged LAST-first` (W94's) | two adjacent arrivals swapped in a total order | rule-8 P1 |

W155 puts it at **about one L6 run in three** in its byte copy and under the rule-8 harness; **0 of 12 L6 runs
inside P32's six EXIT-0 confirming gates** went red. `tv-ingest / LAST-first` is the one with history —
W112 measured it at *roughly 1 in 4* and P27's retro wrote *reported and not taken*; **no question carries any
of the three** (`npm run q -- --search` for each, icebox included). Q99 (icebox) is the nearest: the timing
arrangement as an unasserted input. **What it cost P32**: P1's and P4's extra re-runs, M11's extra red, one
re-declaration — and the standing risk that a confirming gate goes red for no item's reason, against section 4's
*do not start one over a tree with a known red lane*. **Whether it takes a Q id is stop-and-ask (t)** —
answered YES: [Q599](../questions/q599.md), deferred (section 9).

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE.** Rule 6 did what it was adopted for (section 1); the census
class was caught by rungs every time (section 2); no rule followed in P32 failed in a way a new RULE would fix.

**B. Recommended, for the NEXT plan's declaration, not the workflow: an item that adds a node, a field, a
suite, a module, a snippet or a flow builds the change in a byte copy and runs every lane BEFORE writing
`Owns`** — W155's re-take 2.
- **Replaces**: nothing in `doc/workflow.md`; a declaration's *re-take* row, by name.
- **Saves**: the late asks. W153's five late widenings and W154's three each cost an answer the serial plan
  waited for; W155's zero cost one copy and one lane run (no self-tests — so it would NOT have found W154's
  (o), which only `check:docs:selftest` saw).
- **Would no longer catch**: nothing; the rungs still run.
- **Ledger**: it is kin to *an `Owns` pre-declaration rule*, refused 14 times on the ground that a rung finds
  the late file before its edit — **which is what happened here**. So it is offered as a declaration sentence,
  not a rule or a check; **as a rule it would be that row's fifteenth refusal**, and this retro does not
  propose it.

**C. Recommended, for the NEXT plan's declaration, not the workflow: an item's run BEFORE its readers is
`npm run gate` (the ladder), and its confirming gate — `gate:item`, or the last item's `gate:full` — runs
ONCE, after the reader items, on the final tree.**
- **Replaces**: each P32 item's Gate line, *`gate:item`; then the readers*.
- **Saves**, from the Records: the pre-reader self-test walls (834.6, 1574.5 and 2426.6 s) less the ladder's
  ~140 s each — **about 80 minutes over P32** — plus the separately-run lanes where an ask was pending
  (1221 s, 3554.5 s) whenever the ladder alone would have found the same red.
- **Costs**: the readers read a tree whose self-tests have not run. W154's (o) would have surfaced after the
  readers rather than before; a self-test red is a check's, not the product's.
- **Fixes (d)**: the last item's `gate:full` would land on the final tree, as the exit sentence reads.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it would be the 31st refusal, P2-P32.** Candidate (a) is
  the class: three Records' preambles false a day after their readers ran, found by this retro. The row's
  standing ground holds. **No other ledger row is re-raised**; B is explicitly not the `Owns` row's proposal.

| file | why |
|---|---|
| this plan | the Status line; Q594 into *Open questions this plan carries*; this Record and Retro |
| doc/work-items/w153-…, w154-… | the Record's preamble and *What this taught*, dated notes that the readers ran (pass 3 rule 6) |
| doc/work-items/w155-… | the Record's preamble, the same note; and, after (v), the Exceptions' census-site sentence, a dated note that it is confirmed |
| doc/questions/q599.md | new, after (t) |
| doc/workflow.md | after (w), the three bookkeeping edits section 9 names, and nothing else |
| doc/decisions/0074-… | the dated pointer W154's (k) answer named, *at the record step* |
| README.md | one row in *More examples*: the built-in `if` and `switch`, AGENTS.md section 19 |

### 8. Ids, and the bookkeeping held for the maintainer

- **Issued**: W153, W154, W155; ADR 0092; Q582, Q583, Q589, Q594; and Q599, taken by this retro (section 9, (t)).
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W156 CLOSED unissued, as the declaration expected;
  - Q584-Q588 SPENT (W153's), Q590-Q593 SPENT (W154's), Q595-Q598 SPENT (W155's, Q597 and Q598 beyond P32's own
    block). None exists in the tree;
  - ADR 0093 SKIPPED, by W154's (k).

**The next plan starts at W157, Q600 and ADR 0094.**

*`npm run state` before this section printed the tree's W156 / Q595 / ADR 0093 against the ledger's W152 / Q580 /
ADR 0092, the ledger being W151's sentence. This sentence read Q599 until the maintainer answered (t) and this retro
took Q599 (P24's precedent); both derivations now read W157 / Q600 / ADR 0094.*

**Held for the maintainer's answer, made in `doc/workflow.md` after it** (P31's practice; section 9 records them made):
the Status line's *THIRTY-ONE times, by P1 through P31* → THIRTY-TWO, P1 through P32, and P32 onto the *adopted
nothing* list if A is answered as recommended; section 6's ordinal *eighty-six* → *eighty-nine, so the next is
the NINETIETH*; the refusal ledger's first row *30 times, P2-P31* → 31, P2-P32.

### Stop-and-asks for the maintainer

| | the question | recommended | the alternative |
|---|---|---|---|
| **(t)** | do the three flaky L6 rows (section 5) take a Q id? | **YES, one question, deferred**, taken by this retro as Q599: the three rows, W112's *1 in 4* and W155's *1 in 3*, and the risk to a confirming gate; nothing fixed here | NO: they stay in W155's Record and W112's, as P27 left `tv-ingest` — a known red the next confirming gate may meet with nothing to cite |
| **(u)** | the exit sentence's `gate:full` ran on the PRE-reader tree; the final tree ran `gate:item`, missing only `check:register:selftest`, after a diff that added q594.md. Is the exit artifact accepted as measured? | **ACCEPT as stated in the Record** — `check:register` (the check, not its self-test) ran green on the final tree, and P31 accepted a `gate:full` before its record step's question-file edits | run `npm run check:register:selftest` once on this record step's tree, ~30 minutes, and cite it here |
| **(v)** | W155's Exceptions still say its census-site correction is *NOT yet confirmed by the maintainer*; its Status says *not objected to* | **confirm it**, and this retro adds a dated note to W155's Exceptions | leave the two sentences as they are |
| **(w)** | proposals A, B and C (section 6) | **A, B and C** — B and C as sentences in the next plan's declaration, no workflow edit | any subset; B or C as a workflow rule instead would need pass 3 rule 2's second occurrence (B) or would amend section 4 (C) |

### 9. The maintainer's answer, 2026-10-14: every recommendation APPROVED

- **(t) YES** — [Q599](../questions/q599.md), deferred, raised by P32: the three timing-flaky L6 rows, their observed
  rate and where each was seen. Taken by this retro, so the ledger sentence in section 8 reads Q600.
- **(u) YES** — the exit artifact is accepted as measured: `gate:full` EXIT 0 on the pre-reader tree, `gate:item`
  EXIT 0 on the final tree. `check:register:selftest` was not re-run.
- **(v) CONFIRMED** — W155's census-site correction (the L6 corpus census at :225/:273/:275/:311 moved, the L4 arc
  literal at :441 not). W155's Exceptions carry the dated note.
- **(w) A — no change to any rule in `doc/workflow.md`.** v0.30 stands, and P32 joins the Status line's *adopted
  nothing* list: B and C are declaration sentences and move no rule (P31 section 10's reading of that list).
- **(w) B and C — ADOPTED FOR THE NEXT PLAN'S DECLARATION ONLY, not as rules.** *The author of P33 copies both into
  its declaration:*
  - **B — the census re-take**: *an item that adds a node, a field, a suite, a module, a snippet or a flow builds
    its change in a byte copy and runs every lane BEFORE writing its `Owns`* (W155's re-take 2; section 2).
  - **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its
    confirming gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the
    final tree* (section 4 (c) and (d)).

**The bookkeeping, made in `doc/workflow.md` and nothing else there**: the Status line, *THIRTY-TWO times, by P1
through P32*, and P32 onto its *adopted nothing* list; section 6, *eighty-nine, so the next is the NINETIETH*; the
refusal ledger's first row, *31 times, P2-P32*. **No new version** — P31's precedent: bookkeeping takes no index entry.
