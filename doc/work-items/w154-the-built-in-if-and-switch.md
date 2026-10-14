# W154 — the built-in `if` and `switch`: a gate that decides by a declared condition or a declared value table

**Status:** done 2026-10-13 — both reader passes RUN (Record) and their items R1-R4 acted on, `gate:item` EXIT 0 after them; implemented on `afd91e6`; stop-and-asks (j)-(o) ANSWERED and (p) approved 2026-10-13, acted on (Exceptions); (q) ANSWERED YES and acted on; **`npm run gate:item` EXIT 0** on the final tree, one command (Record); declared 2026-10-13 on `afd91e6`; declaration step RUN the same day, written before any `src/` edit
**Plan:** [P32](../plans/p32-what-a-gate-may-decide-without-memory.md) — *may a gate decide by a
declared condition or a declared value table, without memory?* — and this is its SECOND item: the two
built-ins, on the interface W153 shipped.

```
Spec:       spec/flow-definition.md — section 2's gate subsection (the built-in table), section 3's `when`
            subsection (the `input` root, a contract row `FD-C8` beside `FD-C7`) and *Gate types*
            subsection, FD-V40's and FD-V43's rows, section 7's valid table; spec/README.md's row and
            version column for the new version, v0.31.
Owns:       src/definition/validate.ts, spec/flow-definition.md, spec/README.md (the flow-definition
            row and its version column), spec/examples/valid/** and spec/examples/invalid/** (new files
            only), AGENTS.md (section 3's gate blockquote and table row, section 9's GateTypeRefused
            sentence, section 19 — P32's row names the whole file; section 9's sentence was found by
            grep after this block was first written, and added before its edit),
            test/definition/gate-builtins.test.ts (new), test/driver/gate-builtins.test.ts (new),
            test/definition/l4-corpus.test.ts (the two new suite names in LATE_SUITES, and nothing else);
            and by the Exceptions below (2026-10-13): test/definition/gate.test.ts (:384, :385, :389),
            src/definition/types.ts:643 and src/driver/driver.ts:950 (comments), scripts/check-docs.mjs
            (RUN_FLOOR), src/driver/routing.ts and src/definition/condition.ts (new) — the cycle;
            deno.json (the publish allowlist's one line, (q))
Inputs:     P32 decisions 1, 4, 5 and 6 and the `if`/`switch` halves of stop-and-asks (b) and (c), ANSWERED
            2026-10-13 as recommended; P32 facts 1, 3 and 4, RE-RUN at this item's declaration step
            (P15 decision 5); ADR 0092 (`routesFor`, `settingsProblem`, `routesOf`); ADR 0066 rules 4-6
            (wiring, the key path); ADR 0074 (the declared comparison and its evaluator); ADR 0068 (what a
            route guarantees); ADR 0002 rules 3 and 4.
Outputs:    (1) `BUILT_IN_GATE_TYPES` is `{ distinct, if, switch }`, the two new values written against
                the public interface exactly as `distinct` is — nothing in the validator, the wiring check
                or the driver names either (P32 decision 1). Neither reads `memory`.
            (2) `if` — a StaticGateType: routes `then`, `else`, default `else`; settings `{ when }`, held
                by a closed `settingsSchema` and a `settingsProblem` stating FD-V42-FD-V45's grammar MINUS
                the NAME shape, with ONE root, `input`; `fn` answers by the evaluator a task edge's `when`
                uses (`evaluateWhen`, `src/driver/routing.ts`), over `{ input }`. *(Since exception (p),
                2026-10-13: `evaluateDeclared` in `src/definition/condition.ts`, which `evaluateWhen` delegates to
                — reader item R4, conformity C2.)*
            (3) `switch` — a DerivedGateType: settings `{ key, cases }`; `routesFor` gives the case names
                plus `default`, default `default`, `keyResolvedRoutes` every case; `settingsProblem` holds
                each case name to FD-V16's charset with `default` reserved, each value to a scalar or a
                non-empty array of scalars, and refuses a value named by two cases; `fn` matches `===`.
            (4) the task edge's grammar is UNMOVED: `PREDICATE_ROOTS` stays `['outcome', 'needs']`, and
                `input.x` on a task edge is still FD-V43, with every task-edge message byte-identical.
            (5) spec v0.31: the built-in table, the `input` root rider on FD-V43, FD-V40's rider, `FD-C8`,
                section 7's row; spec/README.md's row.
            (6) the example corpus: one valid document using both, and invalid cases for an `if` and a
                `switch` (FD-V40, FD-V41).
            (7) AGENTS.md: section 3's blockquote and gate row, section 19's table and a `run` snippet.
Depends on: W153
Blocks:     W155
Tests:      L1 `test/definition/gate-builtins.test.ts` — both held by `gateTypeProblem` and registered
            through the interface; a consumer type named `if` or `switch` refused as a collision; `if`'s
            grammar clause by clause with its accepted neighbour, and a task edge's grammar unmoved
            beside it; `if`'s `fn` and `switch`'s `fn` over a table of values — absent, `null`, wrong
            type, boundary, `"1"` against `1`, a value named in an array case — with expected values from
            section 3's `when` text and P32 decision 5, never from the output; `switch`'s grammar, a
            value named by two cases refused; `routesOf` over `switch`; FD-V41 refusing an unwired case
            by name; the wiring check refining a `switch` case route along its key and NOT an `if`'s
            `then` (Scope/Out). L2 `test/driver/gate-builtins.test.ts` — every route of both taken, with no
            predicate and no gate type registered; an ENTRY `if` held by FD-R4 to the target it chooses;
            a missing `switch` case refused at construction naming it; two branches with one key routed
            the SAME way (no memory, where `distinct` would say `duplicate`). Each suite carries its
            membership case. Every new assertion shown able to fail by a provocation, recorded.
Gate:       `npm run gate:item` (doc/workflow.md v0.26 / v0.29); then the conformity reader and the
            adequacy reader, workflow section 6 — NOT run by this item's author.
Reserves:   Q589-Q593, ADR 0093
```

*Reserves: `npm run state` on `afd91e6` reads the tree's next free question as **Q584**; W153 reserved
Q584-Q588 and issued none, so they are skipped, never reissued (`doc/workflow.md` section 3), and this item
takes **Q589-Q593**. P32 reserved ADR 0092-0093; 0092 is W153's and this item reserves **0093** (see (k)).*

## Scope

**In**

1. **The two built-ins** — Outputs (1)-(3): values of the public interface, registered beside `distinct`.
2. **The `input` root**, for an `if`'s condition alone — Output (4) is what stays unmoved.
3. **The record** — spec v0.31, the corpus, `AGENTS.md`.

**Out** — named rather than left implicit, with where it goes instead

- **A registered predicate NAME inside an `if`** — P32 Scope/Out: a name receives a `DecisionContext`,
  which a gate has not got. Refused by `if`'s `settingsProblem`, with that reason.
- **A `when` on a gate's EDGE** — `FD-V41`, unchanged.
- **The wiring refinement along an `if`'s path** — PRICED below (re-take 6), not built.
- **A named export for either type.** `if` and `switch` are reserved words, so a `const` cannot carry
  the name; a new public name is a decision nobody took. Both are reached as `BUILT_IN_GATE_TYPES.if` and
  `BUILT_IN_GATE_TYPES.switch`, exactly as a flow reaches them, by name.
- **The exit artifact** — **W155**.

## What the declaration step must re-take before anything is edited

*P15 decision 5: every fact is re-run by the item that acts on it.*

| # | re-take | against |
|---|---|---|
| 1 | P32 fact 1: `evaluateWhen` and `predicateProblem` public; a switch writable by nobody | `src/driver/routing.ts`, `src/definition/validate.ts`, `index.ts` |
| 2 | P32 fact 3: the schema subset cannot state the grammar | `SCHEMA_KEYWORDS` |
| 3 | P32 fact 4: the roots, and whether `input` can be ADDED to them without moving a task edge | `PREDICATE_ROOTS`, `leafProblem`, every assertion over either |
| 4 | the evaluator: can a gate reach it with no change to `routing.ts` and no new public name | `evalLeaf`, `evaluateWhen` |
| 5 | every census the new built-ins and the new corpus files move, before an edit | `test/**`, `examples/l6.ts`, `spec/**` |
| 6 | the price of the wiring refinement along an `if`'s path | `src/definition/wiring.ts` |
| 7 | what `check:spec` and `check:docs` demand of new corpus files, a new `FD-C` row and new snippets | `scripts/check-spec.mjs`, `scripts/check-docs.mjs` |
| 8 | the baseline | the ladder at `afd91e6` |

## What the re-takes found — RUN 2026-10-13 on `afd91e6`, before any `src/` edit

*The tree was clean at `afd91e6` but for this file.*

**Re-take 1 — fact 1's first half holds and its second half is FALSE, by W153's design.** `evaluateWhen`
(`routing.ts:120`) and `predicateProblem` (`validate.ts:434`) are exported, and `index.ts` re-exports both
files whole. **A switch IS writable since W153**: `AGENTS.md` section 19's `byCase` snippet is one, a
consumer `DerivedGateType` whose routes are its gate's cases — which is what ADR 0092 was for. Nothing in
this item depends on the false half.

**Re-take 2 — fact 3 CONFIRMED.** `SCHEMA_KEYWORDS` (`schema.ts:65`) is the thirteen: no `pattern`, no
`oneOf`, no `anyOf`. So the grammar is each type's `settingsProblem` (P32 decision 3) and the schema holds
only the closed key set, `distinct`'s precedent.

**Re-take 3 — fact 4 CONFIRMED, and `input` CANNOT be added to `PREDICATE_ROOTS`.** The list is
`['outcome', 'needs']` (`types.ts:78`), `leafProblem` refuses every other first segment (`validate.ts:374`),
and **`test/definition/predicate.test.ts:192` pins it to exactly those two** — `'and they are the two members
of a DecisionContext'`. Adding `input` there would edit an existing assertion outside `Owns` AND admit
`input.x` on a TASK edge, where `DecisionContext` has no `input`, so it would resolve to nothing in
silence — the exact class `FD-V43` refuses. **So the `if`'s one root is a SEPARATE list, private to
`validate.ts`**, and the grammar function is parameterised by its roots and its label, with the task edge's
call passing today's values: every task-edge message byte-identical (Output (4)). **`src/definition/types.ts`
is therefore NOT in `Owns`**: the only edit P32 fact 4 suggested there is the one this measurement refuses,
and a new exported constant would be a new public name.

**Re-take 4 — the evaluator needs NO edit to `routing.ts`.** `evalLeaf` (`routing.ts:65`) reads its context
through exactly one call, `readKeyPath(ctx, p.path)`, and `evaluateWhen` reaches it for a leaf and for both
groups; a `{ predicate }` cannot reach it, because `if`'s grammar refuses the name at load. So `if`'s `fn`
calls the PUBLIC `evaluateWhen(when, { input }, EMPTY)` *(superseded 2026-10-13 by exception (p): it calls `evaluateDeclared` in `src/definition/condition.ts`, the evaluator `evaluateWhen` now delegates to, and there is no cycle — reader item R4)* — *the same evaluator a task edge's `when` is*, P32
decision 4's words — and `readKeyPath({ input: v }, 'input.a.b')` is `readKeyPath(v, 'a.b')` because the
wrapper is a plain object. **The cost is an import from `src/definition/validate.ts` to
`src/driver/routing.ts`, which imports `readKeyPath` back: a module cycle**, benign because neither module
calls the other while it is evaluated (`routing.ts`' top level defines a class and two arrow functions;
`validate.ts`' builds frozen objects whose `fn` calls `evaluateWhen` only when a gate decides). It is the
first import from `src/definition/**` into `src/driver/**`; `scripts/check-source.mjs` has no layering rule
over it (grep). The two alternatives each mint a public name — `evalLeaf` exported from `routing.ts`, or
the evaluator moved into `validate.ts` and exported for `routing.ts` to import — since `index.ts` re-exports
both modules whole. *The gate, which loads the package in node, deno and a chromium bundle, is what confirms
the cycle is benign in all three.* **So `src/driver/routing.ts` is NOT in `Owns` either.**

**Re-take 5 — what the change moves, found by grep before any edit:**

| census | moved by | in `Owns`? | consequence |
|---|---|---|---|
| `test/definition/gate.test.ts:384`, `:385`, `:389` — `[...gateTypesOf(undefined).keys()]`, `Object.keys(BUILT_IN_GATE_TYPES)` and `[...gateTypesOf({ threshold }).keys()]` pinned to `distinct` alone | Output (1), necessarily | **no** | **stop-and-ask (j)** |
| `test/definition/l4-corpus.test.ts` `LATE_SUITES` | the two new suites | yes | two names |
| `test/definition/wiring.test.ts:449` — `equal(total, 70)`, the L4 corpus's arc count | a valid corpus document with a TASK in it | no | the valid document is written with **gate and `end` nodes only**: zero arcs |
| `test/fold/result-value.test.ts:605` — `spec/outcome-record.md` section 4's *N of M corpus task nodes* | a valid corpus document with a TASK in it (and **any** `examples/flows/**` task, which is W155's) | no | the same: zero task nodes. *Said here for W155, whose `examples/flows/**` that census walks too* |
| `test/driver/needs.test.ts:371` — every region-bearing valid document RUN | a valid document carrying a `fanout` or `map` | no | the valid document has no region |
| `examples/l6.ts:6612` — every node KIND in the valid corpus runs at L6 | a new kind | — | none: `gate` is already there |
| `test/definition/l4-corpus.test.ts` section 7 table, both ways | a new valid file | spec yes | one row in section 7 |

**Re-take 6 — the wiring refinement along an `if`'s path, PRICED (P32 Scope/Out: priced, not promised).**
The wiring check refines an arc leaving a gate in exactly one way: on a route the gate's set names in
`keyResolvedRoutes`, `required` along **`settings.key`** (`wiring.ts:516-519`, `:573-588`). An `if` has no
`settings.key` — its path is inside `when` — so declaring `keyResolvedRoutes: ['then']` would be INERT, and
the refinement needs:

| piece | where | size |
|---|---|---|
| a member saying *on route R these paths resolved*, for paths that are not `settings.key` — e.g. `routesFor` returning `resolvedPaths: { then: [...] }` | `types.ts`, `GATE_TYPE_KEYS`, `routeSetProblem` — a PUBLIC interface change, and W99's assertion binds the shape message to `GATE_TYPE_KEYS` (`test/definition/gate.test.ts`) | one member, ~10 lines, an ADR amending ADR 0068 rules 1-2 |
| `if` derives it: a leaf with no `default` on `then` (absent is no match for every operator, `ne` included); an `all` group's every member; nothing for `any`, for `else`, or for a leaf declaring `default` | `validate.ts` | ~15 lines; `if` becomes derived |
| the arrival loop refines per path, and asks `keyPathRefusal` per path for the refusing direction | `wiring.ts` | ~15 lines |
| spec rows, `AGENTS.md` section 20, and a wiring suite | spec, docs, tests | one item's worth |

**What not having it costs: Q391's shape, for `if`.** A task after `then` that REQUIRES the key the
condition compared reads `no` against a producer that declares the key without requiring it — on a flow
that is correct, because the run cannot take `then` without the key. **What `switch` gets for free**:
its `keyResolvedRoutes` is every case, over its own `settings.key`, so ADR 0068's refinement and W100's
refusing direction apply to it with no change — and this item's L1 asserts both, with `if`'s `then`
unrefined beside it.

**Re-take 7 — the checks' demands.** `check:spec` `C4` asks for ≥ 1 invalid case per `FD-V` — no rule
id is added, so no case is REQUIRED, and a second case per rule is legal (`FD-V26` has two). A new
`FD-C8` row needs a *Test owed by* cell (`C6`) and is declared once (`C2`); the rule count moves 132 →
133 and the refusal count stays 42 (`C4` compares README's and the spec's). Every valid file needs a
section 7 row (`l4-corpus`, both ways). `check:docs`: a `run` snippet must `throw` (`X4`), and every
snippet typechecks against `index.ts` with and without the DOM lib (`X3`, `X5`).

**Re-take 8 — the baseline.** `node test/runner.ts` on `afd91e6`: **EXIT 0, 56 files / 1617 cases**, node
24.20.0. The other lanes are W153's final `gate:item` on the same source tree (`afd91e6` committed it):
L1-L5 56 / 1617 in deno 2.9.6 and chromium, L6 2487 / 164 in node and deno, `check:spec` 7 / 72 / 132.
**Those were not re-run here** — read from W153's Record, not measured by this item.

## Stop-and-asks — raised at the declaration step

| | the question | measured | options, and their cost | recommended |
|---|---|---|---|---|
| **(j)** | may W154 widen `Owns` to `test/definition/gate.test.ts:384`, `:385` and `:389`? | three existing assertions pin the built-in set to `distinct` alone (re-take 5). P32 decision 1 grows it by two, so all three turn red on a correct change | YES: three literals become `['distinct', 'if', 'switch']` and `['distinct', 'if', 'switch', 'threshold']`, each message saying *since W154*. NO: P32 decision 1 cannot ship | **YES** |
| **(k)** | does P32's `if`/`switch` need ADR 0093? | P32 decisions 4-6 are decided and ANSWERED in a plan; ADR 0074 rule 4 says a comparison's roots are `outcome` and `needs` — of a `DecisionContext`, which is a task edge's and is unmoved (re-take 3). The `if`'s `input` is a second context, not a change to the first | NO ADR: P32 + spec v0.31 are the record, and ADR 0074's header gains a pointer at the record step (`doc/decisions/**`). YES: an ADR restating P32 decisions 4-6 — `doc/decisions/README.md`'s *a spec rule with a rationale paragraph is better than a spec rule plus an ADR restating it* argues against | **NO** — nothing waits on it |
| **(l)** | two points of `switch`'s grammar P32 does not settle: an EMPTY `cases` (`{}` — routes `default` alone), and a value REPEATED inside one case (`["a", "a"]`) | P32 decision 5 refuses a value named by TWO cases and an empty ARRAY; it says nothing of either. Precedents: `FD-V45` refuses an empty group as *"always true" written as a question*; `routes repeats a route`, `keyResolvedRoutes repeats a route` and `FD-V31`'s *workerGroups repeats an entry* refuse a repeat | **Built as P32's LITERAL text — both ACCEPTED, neither asserted** — because tightening is the undecided part. Refusing both costs two clauses in `switch`'s `settingsProblem` and two assertions | **refuse both**, on those precedents |
| **(m)** | P32 decision 4 gives `if` FD-V42-FD-V45's grammar, whose `FD-V43` refuses a ROOT ALONE — but `FD-V43`'s reason (*a root is a container*) is false for `input`, which may be a scalar payload | the literal grammar refuses `{ "path": "input", ... }`. A `switch`'s and `distinct`'s key path cannot name the whole value either (`KEY_PATH_RE` needs one segment, and `readKeyPath` walks INTO an object) | **Built as the literal grammar — refused**, with a message giving the `input` reason: a value the gate must compare WHOLE is wrapped by the task before it. Admitting it costs one clause and makes `if` the one gate setting that can read a scalar payload | **keep the refusal**, for one rule over every gate's paths |

| **(n)** | may W154 widen `Owns` to two doc comments that name `distinct` as THE built-in: `src/definition/types.ts:643` (`GateNode.type`: *a built-in (`distinct`) or …*) and `src/driver/driver.ts:950` (*the built-ins … (`distinct`)*)? | found by grep during the lane run, after the declaration; both are comments, no code, and both files are outside `Owns` by re-takes 3 and 4 | YES: one parenthesis each becomes (`distinct`, `if`, `switch`). NO: two comments incomplete, nothing reads them | **YES**, comment only — nothing waits on it |

| **(o)** | may W154 widen `Owns` to `scripts/check-docs.mjs:725`, `RUN_FLOOR` 34 → 35, with its comment line? | found by the self-test lane, after the declaration: `check:docs:selftest` EXIT 1 on ONE probe — *a whole `run` snippet deleted* — `wanted [X4,X8], got [X8]`. AGENTS.md now carries 35 `run` snippets, so deleting one leaves 34 and the floor of 34 cannot fire. `RUN_FLOOR` is [Q102](../questions/q102.md)'s ratchet and its comment names the precedent: *the item that adds a snippet raises it*, declared in that item's exceptions (W69, W70, W86, W90, W94, W101, W108, W110) | YES: `35`, and one comment line naming W154. NO: drop section 19's new snippet, and P32 Scope In 4's *`AGENTS.md`'s gate section, which `check:docs` executes* goes unmet | **YES** |

*(l) and (m) are built as P32's text reads, so neither blocks the item; a NO on (m) or a YES on (l) is a
small follow-up. (k) needs no edit. **(j) and (o) block the confirming gate**: `gate:item` cannot be green
until the three literals and the floor move. (n) is cosmetic.*

## Exceptions — the maintainer's answers, 2026-10-13, ALL as recommended, recorded BEFORE the edits

*`doc/workflow.md` section 1 rule 6. (p) is the coordinator's, approved the same day.*

| | file | the edit, and nothing else |
|---|---|---|
| **(j)** YES | `test/definition/gate.test.ts:384`, `:385`, `:389` | the built-in-set literals become `['distinct', 'if', 'switch']` and `['distinct', 'if', 'switch', 'threshold']` |
| **(k)** NO | — | no ADR 0093: P32 decisions 4-6 and spec v0.31 are the record; ADR 0093 goes unused |
| **(l)** REFUSE | `src/definition/validate.ts` (in `Owns`), `spec/flow-definition.md` | two clauses in `switch`'s `settingsProblem` — an empty `cases`, and a value repeated inside one case — each `FD-V40`, each with an assertion shown able to fail, and the spec text saying so |
| **(m)** KEEP | — | `input` alone stays refused; no edit |
| **(n)** YES | `src/definition/types.ts:643`, `src/driver/driver.ts:950` | comment only: the built-ins named as `distinct`, `if` and `switch` |
| **(o)** YES | `scripts/check-docs.mjs:725` | `RUN_FLOOR` 34 → 35, and one comment line naming W154 |
| **(p)** YES | `src/driver/routing.ts`, and a NEW `src/definition/condition.ts` | **the module cycle removed**: the pure declared-comparison evaluator moves into `src/definition/condition.ts`; `validate.ts` (the `if`) and `routing.ts` both import it from there; `evaluateWhen`'s public export and behaviour unchanged, the registered-name lookup staying in `routing.ts`; no import from `src/definition/**` into `src/driver/**`; `index.ts`' exported names unchanged (the new module is NOT re-exported) |

| **(q)** YES | `deno.json` | `"!src/definition/condition.ts"` in `publish.exclude`, beside `"!src/definition/validate.ts"` — answered by the maintainer 2026-10-13, recorded here before the edit |

**The reader passes' items — acting on them APPROVED by the maintainer 2026-10-13**, recorded here before the
edits. Constraint: **no change may add per-decision work**. All within `Owns`.

| | finding | the fix |
|---|---|---|
| R1 | conformity C1 (should-fix): `switch`'s routes are not in the document's order for INTEGER-LIKE case names — `Object.keys` lists them first, ascending, and `JSON.parse` has already lost the order | the spec sentence and Choice 4 say what the order IS; an L1 case over `{ b, "200", "404" }` asserting it. Routing is unaffected |
| R2 | adequacy: four real gaps — C02 (`ne` strict), S12 (`0` and `-0` in two cases), S13 (`Infinity`, `NaN` as case values), S26 (key `-0` against case `0`) | one row each, each re-run against its mutant |
| R3 | conformity C3: the two-cases message prints `-0` as `0` | the message names `-0`; error path only |
| R4 | conformity C2 and the Record's *every operator* | dated notes where the text says `if` calls `evaluateWhen`, and the overstated claim corrected |
| — | conformity C4-C6 | no change |

## Choices made inside the declaration and not named by P32

*Listed so the conformity reader can check them, W153's practice.*

1. `if`'s and `switch`'s settings are CLOSED (`additionalProperties: false`) and their keys REQUIRED —
   P32 writes `{ when }` and `{ key, cases }` with no `?`, and `distinct`'s schema is the precedent.
2. `if`'s schema says nothing of `when`'s TYPE, so a bare string reaches `settingsProblem` and gets the
   grammar's own message (*a bare string was the form until v0.27*) rather than the schema's.
3. A grammar defect inside `if`'s `when` is reported as `FD-V40` (P32 decision 7) with the message the
   task-edge grammar gives under `FD-V42`-`FD-V45`, prefixed `settings.when` and naming the rule whose
   grammar it is.
4. `switch`'s routes are `Object.keys(cases)`, then `default` — the order the PARSED object enumerates them: integer-like names first, in ascending numeric order, then the rest in document order. *(This read *in the document's order* until the conformity reader's C1 measured `{ b, "200", "404" }` listing as `"200", "404", "b"`; corrected 2026-10-13, reader item R1.)*
5. `switch`'s `fn` sends a key that is not a scalar to `default` before scanning, which is P32's *matches
   no case* — a case's values are scalars, so no object or array key can equal one.
6. Neither type is exported by its own name (Scope/Out).

## Verification

`npm run gate:item`, then the two readers. **Routing coverage**: a branch routed away from its join (Q4) —
not applicable, a gate's out-arcs are unchanged in kind; `user_action` (Q17) — not applicable, a gate never
settles; no matching decision edge (Q10) — not applicable, an `if` always answers `then` or `else` and a
`switch` always a case or `default`, which `FD-V41` wires; a duplicate task id (Q13) — not applicable, a gate
has no task id; a nested fan-out (Q6) — not applicable.

## Record

*Written 2026-10-13 on `afd91e6` with the item's changes UNCOMMITTED, after the Exceptions' edits. The reader
passes have NOT run.* *(P32's retro, 2026-10-14, pass 3 rule 6: both readers RAN later the same day — the
gate table's rows and items R1-R4. This line and* What this taught *are as first written.)*

**The stop-and-asks.** (j)-(o) were answered by the maintainer on 2026-10-13, all as recommended, and (p) is the
coordinator's, approved — the Exceptions table above, written before the edits. **(k): no ADR 0093** — P32
decisions 4-6 and spec v0.31 are the record, and ADR 0093 goes unused. **One NEW, raised by the confirming gate — ANSWERED YES by the maintainer 2026-10-13 and recorded in the Exceptions before its edit:**

| | the question | measured | options, and their cost | recommended |
|---|---|---|---|---|
| **(q)** | may W154 widen `Owns` to `deno.json`'s `publish.exclude` allowlist, adding `"!src/definition/condition.ts"` beside `validate.ts`? | `npm run gate:item` **EXIT 1 at `check:source`**: `S6: src/definition/condition.ts is published source but is not in deno.json's publish allowlist — JSR ships TypeScript source, so an unlisted module referenced by an export fails at publish`. The same `S6` cascades into every probe of `check:source:selftest` (EXIT 1, `wanted [S12], got [S12,S6]` and the like). (p)'s new module is imported by `validate.ts` and `routing.ts`, both published | YES: one line, the allowlist describing the tree. NO: put the evaluator in an existing `src/definition` module — **every one is re-exported by `index.ts`** (`ls src/definition`, `deno.json:14-40`), so `evalLeaf`/`evaluateDeclared` would become public names, which (p) forbids | **YES** — a mechanical consequence of (p), which named a new file and not the allowlist |

**Gate — what ran.** Baseline: L1-L5 56 / 1617 (node re-taken; deno and chromium from W153's Record), L6
2487 / 164, `check:spec` 7 / 72 / 132.

| Clause | Verdict | Notes |
|---|---|---|
| **`npm run gate:item`, ONE command, still tree, after the reader items R1-R4** | **RAN, EXIT 0**, 1311 s | **L1-L5 58 files / 1635 cases in node 24.20.0, deno 2.9.6 and chromium** (58 / 1634 before the reader items; +1, the R1 order case — R2's rows are inside existing cases). **L6 2487 / 164, 0 failed, node and deno**, unmoved. **`check:spec` 7 / 75 / 133**, unmoved. `check:docs` 41 snippets, 35 run. Self-tests **10 of 10 ok**, 1106.3 s wall, `check:register:selftest` left out by design. *The row below is superseded by this one* |
| `npm run gate:item`, ONE command, still tree, after (q) | RAN, EXIT 0, 1730 s | **L1-L5 58 files / 1634 cases in node 24.20.0, deno 2.9.6 and chromium** (56 / 1617; +2 / +17). **L6 2487 / 164, 0 failed, node and deno**, unmoved. **`check:spec` 7 / 75 / 133** (7 / 72 / 132). `check:docs` 41 snippets, 35 run. Self-tests **10 of 10 ok**, 1574.5 s wall, `check:register:selftest` left out by design. *The rows below are the run BEFORE (q) and are superseded by this one* |
| `npm run gate:item`, ONE command, before (q) | RAN, EXIT 1, 15 s | stopped at `check:source` `S6` — (q). Nothing after it in the `&&` chain ran |
| every lane of `gate:item` SEPARATELY, the same still tree | RAN | to measure what the chain could not reach — the table below |
| `lint`, `typecheck` (five lanes), `check:scheduler`, `check:policies`, `check:markdown`, `check:wiring`, `check:workers`, `check:budget`, `check:register` | EXIT 0 each | — |
| `check:spec` | EXIT 0 | **7 documents / 75 examples / 133 rules** (+3 corpus files; +1 rule, `FD-C8`); C4 42 refusals, unmoved |
| `check:docs` | EXIT 0 | 41 snippets, **35 run** (+1), 6 check |
| `check:source` | **EXIT 1** | `S6` alone — (q) |
| `test` (node 24.20.0), `test:deno` (2.9.6), `test:browser` (chromium) | EXIT 0 each | **58 files / 1634 cases in all three** (+2 files, +17 cases: 8 L1, 6 L2, 3 L4 corpus) |
| `test:l6`, `test:l6:deno` | EXIT 0 each | **2487 assertions / 164 runs, 0 failed**, unmoved |
| self-tests `--without check:register:selftest` | **EXIT 1**, 1221 s | 8 of 9 lanes ok — `check:docs:selftest` green since (o); **`check:source:selftest` EXIT 1, every failing probe naming `S6` beside its own rule** — (q) |
| the cycle | RAN | `grep -rn "from '../driver" src/definition/` — **no match** (exit 1): nothing in `src/definition/**` imports `src/driver/**`. `src/definition/condition.ts` imports types only |
| the public surface | RAN | `index.ts`' runtime export names at `HEAD` (a `git archive` under `dev-dist/w154-surface-<pid>/`, removed after) against the tree: **148 and 148, none only on either side**. `condition.ts` is not re-exported; `readKeyPath` stays public through `validate.ts`' re-export |
| W154's provocations | RAN, **31 of 31 as declared** | below |
| corpus and snippet provocations | RAN on the pre-(p) tree, 4 of 4 RED for the reason named | not re-run after (p): the corpus and snippet did not change |
| conformity reader | RAN 2026-10-13, fresh context, worktree `C:/tmp-w154/rc` on `afd91e6` plus this item's diff and new files, spec first and a route table written before the code was opened; constructed probes, nothing edited | **No blocking finding; 1 should-fix, 5 notes.** 31 `if` and 11 `switch` cases in real `Driver` runs, plus an entry `switch`, all as its spec-derived table said; 21 `if` and 26 `switch` refusals, each the rule the spec names. **The evaluator's move measured byte-identical for a TASK edge** against HEAD's code: `predicateProblem` over 9,617 generated `when` values and `evaluateWhen` over 15,176 evaluations, **0 differ**; `index.ts`'s names unchanged; no `src/definition/**` import of `src/driver/**`; the driver's per-decision path unchanged (one comment in `driver.ts`). C1 (should-fix): `switch`'s routes were NOT in the document's order for integer-like case names (`Object.keys` lists them first, ascending, and `JSON.parse` has already lost the order) — the spec sentence and Choice 4 were false for an HTTP-status `switch`, routing unaffected. C2 the declaration's Output (2) stale after (p); C3 the `0`/`-0` message; C4-C6 no change (a double FD-V40 as `distinct` gives; W153's NaN-as-null prefix; unreachable error paths). C1-C3 acted on as R1, R3, R4 |
| adequacy reader | RAN 2026-10-13, fresh context, worktree `C:/tmp-w154/ra`, spec first then tests, mutations walked by clause, every file restored by sha256 | **83 mutations, 71 killed, 12 survived: 4 real gaps, 7 equivalent, 1 unspecified** (S30, a `switch`'s `routesFor` over invalid settings reached only by the wiring check). The four gaps sat at JavaScript's number edges and nowhere the author probed: `ne` as loose `!=` (C02 — a gap since W108 that `if` inherited, so the if-table's *every operator* was overstated), `-0` against `0` both in matching (S26) and in the two-cases refusal (S12), and non-finite case values (S13). **The evaluator's move is pinned from both sides** (C22-C24, R01, R03 killed). `FD-C8`'s test clause satisfied. Its results agree with all 31 provocations. The four gaps acted on as R2, each row red on its mutant |
| reader overlap | **1** shared subject | `-0` against `0` (conformity C3, adequacy S12/S26) — inside section 6's 0-4 band, with the briefs differed (only the conformity reader was handed the stop-and-asks and the undeclared choices, and asked for the move's byte-identity; only the adequacy reader was asked whether the move is PINNED) |

**W154's provocations** (scratch harnesses outside the tree, not checked in — they test this item's tests, not a
new check). Each narrows one clause of the RULE; each edit matched its anchor exactly once; every file was
restored and its sha256 compared to its first snapshot; node 24 asserted; the SET of red cases compared to a
declared set, both ways. *The second run after (p) found the harness printing nothing for a probe whose anchor no
longer matched (NOT RUN was recorded and not printed); fixed, and the stale anchors P2, P7, P16 rewritten.*

| probe | the clause it narrows | red in (declared = actual) |
|---|---|---|
| CONTROL | a comment | green |
| CRASH | a syntax error in `validate.ts` | the grader read CRASH |
| P1 | `if`'s default `then` | L1 registration, L1 grammar, L2 entry `if`, L2 FD-R4 |
| P2 | `if`'s answer inverted | L1 `if` table, L2 entry `if`, L2 FD-R4 |
| P3 | `if`'s roots widened to `outcome` | L1 grammar |
| P4 | a TASK edge's roots widened to `input` | L1 grammar (the unmoved-edge clause) |
| P5 | a NAME admitted in `if` | L1 grammar |
| P6 | no grammar for `if` | L1 grammar |
| P7 | `if` reads its settings, not what reached it | L1 `if` table, L2 entry `if`, L2 FD-R4 |
| P8 | `switch` declares no `keyResolvedRoutes` | L1 routes, L1 wiring |
| P9 | `switch`'s default its FIRST case | L1 registration, grammar, routes, wiring; L2 switch, unwired case, no memory |
| P10 | `==` for `===` | L1 `switch` table, L2 switch |
| P11-P13, P24, P25 | a value in two cases / a case named `default` / an empty array case / a name outside the charset / a non-scalar value, each admitted | L1 `switch` grammar |
| P14 | an array case read as a scalar | L1 `switch` table, L2 switch |
| P15 | `switch` re-reads the input, not the resolved key | L1 `switch` table. *(After (p) its first replacement called `readKeyPath`, no longer imported into `validate.ts`, and also crashed two L2 cases — the reason had changed; rewritten to read the input directly)* |
| P16 | `if` writes memory | L1 `if` table |
| P17 | `switch` REMEMBERS | L1 `switch` table, L2 no memory |
| P18 | `switch` not built in | L1 registration, grammar, routes, table, wiring; L2 switch, unwired case, no memory *(first declared a CRASH; a `!` is erased at run time)* |
| P19 | a group's members held to the EDGE's roots | L1 grammar |
| P20 | `input` alone admitted | L1 grammar |
| P21 | `switch`'s settings open | L1 `switch` grammar |
| P22 | `when` not required | L1 grammar |
| P23 | `switch`'s cases not routes | as P9 |
| **P26** | **(l)**: an EMPTY `cases` admitted | L1 `switch` grammar |
| **P27** | **(l)**: a value repeated INSIDE one case admitted | L1 `switch` grammar |
| **P28** | **(p)**: the SHARED evaluator in `condition.ts`, `lt` read as `lte` | L1 `if` table (both its own row and the task edge's re-rooted cross-check) |
| D1 | `driver.ts`' entry walk holds EVERY route's target | L2 FD-R4 |
| L1, L2, L3 | the corpus: `if`'s default `then`; no `if` grammar; an array case no route | the L4 cases of `if-and-switch`, `FD-V40--an-if-condition-outside-input`, `FD-V41--a-switch-case-with-no-edge` |
| X1 | the new snippet's first assertion made false | `check:docs` `X4`, naming the snippet |

**The reader items R1-R4 — acted on 2026-10-13** (approved above). Each new row passes on the code and was re-run
against the mutant the reader named, through the same harness (anchor matched once, file restored, digest
compared, red set compared to the declared set):

| item | what changed | its mutant | red in (declared = actual) |
|---|---|---|---|
| R1 (C1) | spec section 2's table and Choice 4 state the parsed object's order; a new L1 case over `{ b, "404", "200" }` → `"200", "404", "b", "default"`, and `FD-V41` listing them so | `Object.keys(cases).reverse()` | L1 routes, L1 order |
| R2 (C02) | two `if` rows: `ne 1` over `"1"` and `ne 0` over `false` → `then` | `v !== w` → `v != w` in `condition.ts` | L1 `if` table |
| R2 (S12) | `cases: {"approved":0,"rework":-0}` refused, `FD-V40` | the two-cases test by `Object.is` | L1 `switch` grammar |
| R2 (S13) | `{ approved: Infinity }` and `{ approved: [1, NaN] }` refused, `FD-V40` | any number a scalar | L1 `switch` grammar |
| R2 (S26) | key `-0` against case `zero: 0` → `zero` | matching by `Object.is` | L1 `switch` table |
| R3 (C3) | the messages name `-0` as `-0` (`caseValue`); a `0`/`-0` pair reads *the values 0 in case "approved" and -0 in case "rework" are one value by ===* — error path only | `caseValue` → `JSON.stringify` | L1 `switch` grammar |
| R4 (C2) | dated notes at Output (2), re-take 4 and Outputs row (2); the *every operator* claim corrected there | — | — |

**No per-decision work added**: R1 and R4 are text, R2 is tests, R3 is a message built only when a refusal is.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `BUILT_IN_GATE_TYPES` = `{ distinct, if, switch }` | yes, `src/definition/validate.ts` | P18; the L1 registration case; `gate.test.ts`' census (j) |
| (2) `if` | yes — its `fn` asks `evaluateDeclared` in `src/definition/condition.ts` since exception (p), the evaluator `routing.ts`' `evaluateWhen` delegates to *(a dated note, 2026-10-13, reader item R4: Output (2) above names `evaluateWhen` in `routing.ts`, true until (p))*. **The L1 table's name says *every operator*, and for `ne` it was OVERSTATED until reader item R2 (C02)**: no row compared `ne` across kinds, so a coercing `!=` passed it | P1-P7, P16, P19, P20, P22, P28; C02 since R2 |
| (3) `switch`, with (l)'s two refusals | yes | P8-P15, P17, P21, P23-P27 |
| (4) a task edge's grammar unmoved | yes: `predicateProblem`'s messages byte-identical, `PREDICATE_ROOTS` untouched, `predicate.test.ts` green, `evaluateWhen` delegating to the same evaluator | P4; P28 through the re-rooted cross-check |
| (5) spec v0.31 | yes — and (l)'s refusals in section 2's table and `FD-V40`'s row | `check:spec` `C6`, `C8`; `l4-corpus`' section 7 both ways |
| (6) corpus | yes | L1-L3 |
| (7) AGENTS.md | yes: sections 3, 9 and 19 | X1 |
| (p) no cycle, surface unchanged | yes: `src/definition/condition.ts` | the grep and the surface comparison above |

**Per decision — the maintainer's constraint.** Nothing W154 adds runs at a decision except each type's own `fn`;
`routesFor` and `settingsProblem` run at construction only. **`if`**: one `{ input }` wrapper, then the shared
evaluator — per comparison one `readKeyPath` (a `split('.')` and an own-key test per segment) and one strict
compare, a group short-circuiting. **`switch`**: `default` at once for an unresolved or non-scalar key, otherwise
one `Object.keys(cases)` and at most V strict compares (V = its case values), stopping at the first match.
Neither touches memory. **(p) added no per-decision work**: `evaluateWhen` makes the same calls through one more
function boundary, passing a module-level error constructor made once. *What every gate already pays, unchanged
since W153*: a clone of what reached it and of its settings — **which grows with a `switch`'s table** — a key
resolution, one `Map.get` and one `includes`.

**For W155.** Any TASK node in `examples/flows/**` moves `test/fold/result-value.test.ts`'s census of
`spec/outcome-record.md` section 4's task-node figure (*N of M corpus task nodes*), which walks both corpora; a task
in `spec/examples/valid/**` would also move `test/definition/wiring.test.ts:449`'s arc literal (70). Neither
file is on W155's row.

**What broke.** (1) `gate.test.ts:384` — (j), fixed. (2) `lint` twice, on an unused helper in this item's suite and
an unused import after (p), each fixed before its gate. (3) `check:docs:selftest` — (o), fixed. (4) **`check:source`
`S6`** — (q), fixed: (p)'s new module was not in `deno.json`'s publish allowlist. Re-take 7 read what `check:spec`
and `check:docs` demand of new files and not what `check:source` demands of a new MODULE.

**What this taught.** Nothing about the method yet; the readers have not run. *(FALSE since the readers ran,
2026-10-13 — P32's retro, pass 3 rule 6. What they taught is in P32's Retro: the four gaps sat at JavaScript's number
edges, one of them (`ne` as loose `!=`) a gap since W108 that `if` inherited.)*

**Questions raised.** **[Q589](../questions/q589.md)** — the wiring refinement along an `if`'s `then` path,
deferred (re-take 6's pricing). **Q590-Q593 unused, skipped.** ADR 0093 unused. (j)-(q) were ASKED rather than
raised (`doc/workflow.md` section 1 rule 6).

