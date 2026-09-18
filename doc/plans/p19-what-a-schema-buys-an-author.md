# P19 — What a schema buys an author

**Status:** **COMPLETE — all three items DONE** (W72, W73 and W74, every one 2026-09-18); the retro is not yet run. Declared 2026-09-18 on `bc32642` (P1-P18 complete and retro'd, W69-W71 done outside any
plan, `doc/workflow.md` [v0.19](../workflow.md)), from a design conversation with the maintainer the
same day, its six facts measured the same day. **All three items are DONE** (W72, W73 and W74, every one 2026-09-18 — ADR 0056 for W72, no ADR for W73 or W74; their Records below). *(This line read "No item has started" until W72 closed, "W73 and W74 have not started" until W73 did, and "W74 has not started" until W74 did — three items, three corrections, each by the item that expired it.)*

**Reserves:** W72-W75 (W75 expected unused), Q300-Q314, ADR 0056-0057 (0057 expected unused).
*Derived by grep, not inherited — three consecutive items outside any plan each falsified the
sentence naming this plan's first id, so the ids here are read off the tree: the highest work item
on disk is [W71](../work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md), the register's
highest row is Q297 with Q298-Q299 reserved by W71 and unused, the highest decision is ADR 0055.*

## Why this plan, and why now

**P16 named this plan *strict mode*** — `inputSchema` and `outputSchema` enforced at run time, a
transform's declared output checked against what it produced, a mismatch as a runtime refusal in
`FD-R2`'s family, a driver option whose cost is measured the way [Q186](../open-questions.md)'s was.
[ADR 0054](../decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)
deferred enforcement here with the reason: *a run-time check on every settlement is a cost P19 is
declared to measure first*. So the schemas exist in the grammar, are declared and carried by
P18's registry document, and are applied by nothing.

**This plan departs from that name, and the departure is the maintainer's argument of 2026-09-18,
recorded here as the reason.** The schemas were never for the run. They were for the AUTHOR — a
person or an agent wiring a flow — so that a tool could say whether an edge fits, help write the
JSONata transform where it does not, and give a worker's author a typed signature to write against.
A runtime failure is a different kind of problem: the worker did something wrong, and per-settlement
validation is the expensive way to learn it. What that argument leaves is a plan about **authoring
assists that rest on declarations**, and one small runtime slice for the values no declaration can
reach.

**And the measurement that justifies the plan arrived at its own declaration step.** Writing honest
output schemas for the fourteen corpus workers, the author got one wrong — a field named `arrays` is
a COUNT, typed as a list from its name — and the example written beside that schema CONFORMED to it.
Only running the worker found the mismatch. **A schema and its example agreeing proves the schema is
self-consistent and says nothing about the worker.** That is fact 6, it is prediction 4 confirmed
before any item ran, and it decides the shape of decision 3.

**Why now**: [W69](../work-items/w69-a-getting-started-example-a-consumer-can-copy.md),
[W70](../work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) and W71 closed the
consumer-facing gaps the reference had — a getting-started example, a routing flow, and a reference
that stops teaching a fake scheduler for a use case. What a consumer reads first is now executed by
the gate and runs on a real scheduler. What they cannot yet do is find out, before a run, whether the
flow they wrote fits the workers they named.

## What the design settled, and how

1. **The question is *what does a schema buy an author?*, and the exit artifact is an AUTHORING
   SESSION a human can watch.** An agent handed the registry writes a flow; the wiring check catches
   a miswire; the transform is written through a sample-and-diff loop; the worker typechecks against
   a signature generated from its schemas. That is a product plan with something to look at, where
   *strict mode* was a driver option whose cost would force it off in production.

2. **`examples` joins the built-in subset as an ANNOTATION, validated against its own schema at
   construction — ADR 0056.** Three rules, not a thirteenth entry in a list: it constrains nothing
   when a value is validated; an example that does not conform to its schema is refused at
   construction, naming the entry — the same argument the subset itself was adopted on, *a defect the
   day it is written*; and a worker's declared example is the SAMPLE every downstream check uses.
   **It belongs on the INPUT schema as much as the output schema** — fact 6 is why: an output example
   alone cannot catch a wrong output schema, and an input example is what a worker can be RUN on.
   This is the first deliberate extension of the subset, the moment [Q278](../open-questions.md)'s
   *refused, not ignored* was adopted to make legible, and it arrives from this side rather than a
   consumer's. Today `examples` is refused by name — measured.

3. **A worker CONFORMANCE check RUNS the worker on its input example and validates what came back
   against its output schema.** Not because declarations are untrustworthy in principle, but because
   fact 6 measured the failure that reading declarations cannot see. It executes — as `check-docs`
   executes every snippet — and it is an authoring-time tool, never a driver behaviour. A worker with
   no input example is checked against the sample generator's witness (fact 5), with the verdict
   saying which it used.

4. **The wiring check is STATIC over the subset and gives every edge a verdict.** *Fits*; *does not
   fit and no transform*; *transform present and the sample passes*; *transform present and the
   sample fails*. The relation is fact 3's — 45 lines, total, twelve negative and positive controls
   right — and the transformed edge is checked by RUNNING the transform on the producer's example and
   validating the result against the consumer's input schema, which is the sample-based preflight
   P16 named for exactly the edge a static check cannot reach.

5. **Two runtime boundaries are validated ONCE each, on by default, because no static check can ever
   reach them**: the entry payload against the entry node's type's input schema at `start`, and a
   person's resolution against the node's output schema at `resolve` — measured at this declaration:
   `resolve` clones the value and validates nothing, and it is the one value in the system a human
   supplies. Both are per-run or per-human-action, never per-settlement. **Per-settlement validation
   of a worker's result is OUT as a default** and is named in *slices beyond* as an opt-in, with the
   cost it would have to be measured at.

6. **No runtime dependency, and the subset is the CONTRACT LANGUAGE.** Fact 1: twelve honest output
   schemas reach for ten of the twelve keywords and nothing outside them; nullable is a type array
   the validator already accepts. The subset is not a limitation but the enabling constraint — it is
   what keeps decision 4's relation total and decidable, maps cleanly onto generated types (fact 4),
   and gives the transform assist a finite path set. It extends only on a measured need, one keyword
   at a time, each refused by name until then. `json-schema-to-typescript` is a CONSUMER tool: it
   prices as a consumer install, it touches no manifest of this package, and fact 4 ran it outside
   the repository with zero links.

7. **A type-level JSONata interpreter stays refused** — P16's reason, unchanged: two implementations
   of one language's semantics are two sources that can disagree. The transform assist is therefore
   SAMPLE-BASED throughout: enumerate the paths the producer's schema admits (a walk over
   `properties`), run the expression on the example, diff the result against the consumer's schema.
   That loop is what an agent iterates in.

8. **A join successor's input is a DIFFERENT compatibility question, named here and scoped to W73.**
   Fact 3's fifteen edges are task-to-task. The node after a join receives `JP-R12`'s record keyed by
   branch path, whose SHAPE depends on run-time arity for a `map`, so its schema is `{ additionalProperties: <branch output> }`
   at best — and whether the subset can even say that is W73's first measurement.

9. **Generated worker signatures are a recipe, not a build step of this package.** The envelope's
   `settings` and `input` types and the return type derive from the three schemas; a consumer runs
   the generator once and writes against the result. Types catch the SHAPE and not the constraints —
   a worker typed to return a number can still return one below the declared minimum — and the
   reference says so rather than calling it enforcement.

## What was measured before this plan is declared

Six facts, in `dev-dist/p19/` (`facts-1-2-4.mjs`, `fact-3-fits.mjs`, `fact-3-controls.log`,
`fact-5-sample.mjs`, `schemas.mjs`, and `fact-4.mjs` in the scratchpad's own `node_modules`, outside
the repository), on `bc32642`, Node 24.20.0.

| # | fact | measured |
|---|---|---|
| 1 | **Honest output schemas for the fourteen corpus workers stay inside the subset.** | 12 of 14 describable — one always throws, one returns a function, and neither is a JSON value; **0 outside the subset**; ten of twelve keywords reached for, `maxLength` and `minItems` unused; **nullable is a type array in four schemas** and `schema.ts:81` already accepts one. Before this, one worker declared an input schema and two an output schema, so the plan was being reasoned about on three subjects |
| 2 | **The validator's existing VALUE check takes a declared example unchanged.** | `findings(schema, example)` over all twelve: every example conforms. ADR 0056's construction-time check is one more call to a function that already checks config and settings values |
| 3 | **A compatibility relation over the subset is TOTAL and small.** | **45 non-blank lines**, twelve of twelve keywords handled, no *cannot tell* arm. Over the corpus: 15 task-to-task edges, 14 with both schemas, **14 fit** — and against **12 controls, 8 of them negative** (a required key the producer does not guarantee, a nullable into a non-null, number into integer, an open producer into a closed consumer, a looser bound, a wider enum, mismatched items, `{}` into a typed consumer), **every verdict as expected**. The corpus's 14-of-14 is partly the workers' tolerance — their input schemas require nothing — so the corpus holds NO miswire for the check to catch, and the exit artifact must construct one |
| 4 | **`json-schema-to-typescript` 15.0.4 handles the subset without surprises.** | 12 of 12 compile; nullable survives as `string \| null`, `additionalProperties: false` adds no index signature, `const: true` is the literal type, the empty schema is `unknown` and nothing is `any`. Installed in the scratchpad, outside the repository, **zero links** |
| 5 | **A sample generator over the subset is 28 lines and self-conforming.** | 12 of 12 generated values pass their own schema. Its limits stated: a required property with no schema is `null`, an unbounded string is empty, a bounded-below number sits ON its minimum — a WITNESS that the schema is satisfiable, not a representative value. Which is why a declared example is primary and this is the fallback |
| 6 | **A schema written from a worker's code was WRONG on the first attempt, and its example conformed to the wrong schema.** | `echo.arrays` is a count (`markedKeysOf` returns `{ marked, arrays: number }`), typed as `string[]` from the field's name; the example written beside it was `[]` and passed. **Running the worker** on its input and validating the output is what found it — 1 of 12 real outputs failed the schema its author wrote. Prediction 4, confirmed in the direction that matters: the AUTHOR's declaration is the likelier lie, and only execution sees it |

**One more, measured while reading rather than by a harness**: `Driver.resolve` clones `value.result`
and validates it against nothing (`src/driver/driver.ts:996`), and `Driver.start`'s payload is
validated against nothing. Those are decision 5's two boundaries.

## Scope

**In**

1. `examples` on every schema kind a worker declares, validated at construction (ADR 0056).
2. A worker conformance check that runs a worker on its input example (decision 3).
3. A wiring check with a verdict per edge, static over the subset, sample-verified over transforms
   (decision 4), including its answer for the join successor (decision 8).
4. The two runtime boundary checks (decision 5).
5. The transform assist — path enumeration, the sample-and-diff loop (decision 7).
6. The generated-signature recipe, in the reference, as a consumer tool (decision 9).
7. Every corpus worker declaring input and output schemas and examples — fact 1's twelve, honestly,
   with the two undescribable ones saying why.
8. The exit artifact: the authoring session, with a constructed miswire and a transform written
   through the loop.

**Out** — named, with where each goes

- **Per-settlement validation of a worker's result as a default.** *Slices beyond*, as an opt-in,
  and it does not ship until its cost is measured at the scale this library targets.
- **A type-level JSONata interpreter.** Refused (decision 7).
- **Any keyword outside the twelve plus `examples`.** `oneOf` is the one prediction 3 expects a
  consumer to ask for first, and it is the one that breaks decision 4's relation; it arrives as a
  measured need or not at all.
- **A runtime dependency of any kind**, and a build step in this package for generated types.
- **Node-type versioning** ([Q249](../open-questions.md)) and locking a type's config keys — wait, as
  P18 left them, for a registry document in a consumer's hands.
- **[Q293](../open-questions.md), a completion promise.** Decision 5 touches `start` and this plan
  will not widen its return type in passing.
- **[Q297](../open-questions.md), `onRegionEvent` unforwarded.** W71's finding, one line to fix,
  not this plan's subject.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W72 | **The contract — ADR 0056.** `examples` joins the subset as an annotation validated at construction; every corpus worker declares `inputSchema`, `outputSchema` and an example of each (fact 1's twelve, and the two that cannot say why); the worker conformance check that RUNS a worker on its input example and validates the output (decision 3), reachable from `check-docs`'s shape or its own script; fact 6's wrong schema as the check's first fixture | `src/definition/schema.ts`, `src/definition/registry.ts`, `spec/flow-definition.md`, `spec/README.md`, `spec/examples/**`, `examples/registry.json`, `examples/workers/**` (schemas and examples only), `test/definition/**`, `doc/decisions/0056-*`, `scripts/check-workers.mjs` (new) and its self-test | nothing | L0-L5 in five runtimes with `examples` fixtured both ways; the conformance check RED on fact 6's schema and green on the corrected one; rule 8 obligation (a) over the annotation's three rules and (e) over the new check's wiring *(and L6, which this row left out: `examples/l6.ts` compares each corpus worker's declared schema kinds to a literal, so the item moved it by one rewritten clause and one added — W72's declaration step)* |
| W73 | **The wiring check.** `checkWiring(registry, flow)` giving every edge a verdict (decision 4) — fact 3's relation promoted from a harness, the transformed edge verified by running the transform on the producer's example, the join successor answered (decision 8); the two runtime boundary checks at `start` and `resolve` (decision 5); a constructed miswire in the corpus so the check has a positive case | `src/definition/wiring.ts` (new), `src/driver/driver.ts` (the two boundaries only), `src/scheduler/runtime.ts`, `spec/flow-definition.md` (one rule for the boundaries, `FD-R` family), `test/definition/**`, `test/driver/**`, `spec/examples/**` (the miswire) | W72 | L1-L5 with fact 3's twelve controls as fixtures plus the corpus; the boundary checks at L6 on a real run — an entry payload the schema refuses, a resolution the schema refuses; rule 8 obligation (c) over the verdict's provenance and (d) over the edge loop's bounds |
| W74 | **The assists, and the exit artifact.** Path enumeration from a schema; the sample-and-diff loop for a transform; the generated-signature recipe in `AGENTS.md` (decision 9); the authoring session — an agent handed the registry writes a flow with a miswire and a transform, the checks catch the first and the loop writes the second, the worker typechecks — as an executed reference section and the reference's front-door claim | `src/definition/assist.ts` (new), `AGENTS.md` (a new section, and §13's schema paragraphs), `README.md` (the third snippet, held by `X8`), `examples/getting-started/**`, `test/definition/**` | W73 | `check:docs` executing the session end to end with `X8` holding README's copy; L6 UNMOVED; rule 8 over the loop's discriminating pair (a transform that fits against one that does not, from one expression edit) |
| W75 | *reserved and UNUSED — the plan closed at three items, as declared* | | | |

**Why serial and in this order.** W73 checks edges against schemas W72 declares and examples W72
validates; W74 assists over a relation W73 ships. W72 ships something observable on its own — a
worker refused at construction for an example that does not conform, and a wrong schema caught by
running the worker — so the plan's first item is not P11's shape.

**Exceptions the items seed their tables from**, on P16's refused-as-a-rule, adopted-as-a-table
procedure, from W69's, W70's and W71's late tables read forward:

| item | predicted exception | why |
|---|---|---|
| W72 | `scripts/check-spec.mjs` and its self-test | `C4`'s refusal count moves if ADR 0056 adds an `FD-V`; `C7` reads `registry.json`'s worker entries |
| W72 | `scripts/check-docs.mjs` and its self-test | `X7` binds the refusal count sentence in `AGENTS.md` §3 |
| W72 | `AGENTS.md` §3 and §13 | the subset's keyword list is stated in prose there (W65's table), and it gains a thirteenth |
| W72 | `examples/README.md` | W71's late exception, the same sentence: what the getting-started directory holds |
| W73 | `spec/README.md` | `C8`'s version row, a consequence of the `spec/flow-definition.md` bump — **fired** |
| W73 | `scripts/build-browser-tests.mjs` | the miswire fixture is one more inlined document (W54's, W65's shape) — **did NOT fire**: the walk is recursive over `spec/examples/`, measured at the declaration. *W73 took ten more this row did not seed — `examples/registry.json`, `examples/workers/shared.ts`, `examples/l6.ts`, `examples/run-flow.ts`, `examples/README.md`, `AGENTS.md` §9 and §13, `index.ts`, `scripts/check-workers.mjs`, `deno.json` — eight measured at its declaration and two late (`S6`'s allowlist, the L6 harness)* |
| W74 | `scripts/check-docs.mjs` and its self-test | `RUN_FLOOR` and `README_SNIPPETS` both move for a third README snippet (W69's, W70's tables) |
| W74 | `scripts/check-markdown.mjs` | a new `AGENTS.md` section and a plan file: [Q142](../open-questions.md)'s window, measured before the record step rather than found by the gate |

## Predictions, to be written down BEFORE the items that test them

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **The subset holds for every schema this plan writes**, including the input schemas, the join successor's, and the miswire's — no item extends it past `examples` | fact 1, over the twelve OUTPUT schemas of the corpus; the input schemas and the join successor's are NOT in that measurement, which is what makes this a reach over W72 and W73 rather than a restatement | a schema W72 or W73 needs that the twelve cannot say — decision 8's join record is the likeliest, and if the subset cannot express *any key, each of shape S*, the extension is `additionalProperties: <schema>`, which is already in the twelve as a boolean and not yet as a schema |
| 2 | **Decision 4's relation stays TOTAL when promoted from a harness to a shipped function** — every edge gets one of four verdicts and none is *cannot tell* | fact 3, over fifteen corpus edges and twelve controls, with no transform present in any of them; the transformed edge's verdict is sample-based and not the relation's | a transformed edge whose sample passes while a second, equally valid sample fails — which is the sample-based preflight's own known limit (a witness is not a proof), and it would mean the verdict must say *the sample passed* rather than *fits* |
| 3 | **REACH: `oneOf` is the first thing a consumer asks for beyond the subset, and no corpus schema needs it** | fact 1, over the corpus only — what a consumer will write is exactly what this cannot measure, which is why it is written down as a reach | any corpus worker in W72 whose honest schema needs a union of SHAPES rather than of types — `publish.joinPayload` is the candidate, and fact 1 wrote it as `{}` |
| 4 | ~~**At least one corpus worker's real output does not match the schema its author writes for it.**~~ **CONFIRMED AT THE DECLARATION** — fact 6, in the sharper direction: the author's schema was the lie, and the example conformed to it. Kept in the table because confirming it here tested the corpus and not the mechanism: what W72 tests is whether the conformance check catches the NEXT one | fact 6, over the fourteen workers and the author's own first attempt | W72's check finding zero mismatches over schemas written by someone other than the person who wrote fact 6's — which would mean the wrong schema was one author's habit rather than the shape of the task |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q278](../open-questions.md) | *a keyword outside the subset is refused, not ignored* — ADR 0056 is that stance applied to the first extension, and `examples` being an ANNOTATION is what lets it join without an ignored-keyword road opening | W72 |
| [Q282](../open-questions.md) | *a `settingsSchema` belongs to a worker and every type over it shares it* — the generated-signature recipe inherits that, and W74 says so or narrows it | W74 |
| [Q263](../open-questions.md) | *a transform's result changes TYPE with the region's arity* — decision 8's join successor and the transformed edge meet exactly here; W73 measures whether one schema can cover the three arities | W73 |
| [Q186](../open-questions.md) | *how large is too large* — decision 5's two boundary checks are priced the way that row's measurement was, once per run rather than per settlement; the per-settlement cost is the *slices beyond* measurement | W73 |
| Q300-Q314 | *reserved for the items* | |
| [Q293](../open-questions.md), [Q297](../open-questions.md) | declared OUT above, untouched | unchanged |

## Slices beyond this plan, in order

1. **Per-settlement result validation as an OPT-IN driver option**, priced at the scale this
   library targets before it ships — P16's *strict mode*, narrowed to what decision 5 leaves.
2. **`oneOf`**, if prediction 3 confirms — with decision 4's relation losing totality for exactly
   the edges that use it, and *needs a transform or a sample* as their verdict.
3. **Node-type versioning** ([Q249](../open-questions.md)), as P18 left it.

## Stop and ask a human

- **Whether a worker's `examples` is REQUIRED or optional.** Required makes decision 3's check total
  over the registry; optional keeps a registry document writable without one, with fact 5's witness
  as the fallback and the verdict saying so. The plan leans optional-with-a-named-fallback; W72 asks
  before the rule is written.
- **Whether decision 5's boundary checks are ON by default.** The plan says yes — once per run, once
  per human action — and the maintainer's argument that runtime is a different problem could read
  either way on these two.
- **Where the transform loop lives**: a function in the library (`assist.ts`) that a tool calls, or
  a script beside the checks. The first is what an agent imports; the second is what a human runs.
  W74 prices both before choosing.
- **The miswire's home.** A corpus flow that is wrong ON PURPOSE has no precedent here — every
  `spec/examples/invalid/**` document is refused at construction, and a miswire validates. W73 asks
  whether it lives beside the valid corpus with its verdict recorded, or in `test/**` only.
- **Anything that changes what a worker RECEIVES today, or moves an L6 row's claims** — every item
  here adds a check and none changes a dispatch, and that is a constraint rather than a hope.

## A note on ids

**Reserves W72-W75, Q300-Q314, ADR 0056-0057.** Read off the tree at the declaration, because the
sentence that used to name this plan's first ids was falsified three days running by W69, W70 and
W71, each taking the next id as an item outside a plan on W36/W37's precedent. Fifteen questions,
sized by the worse case as every plan since P15 has done; none spent by this declaration. Two ADRs,
one expected taken (0056, the annotation) and 0057 expected unused.

## The baseline this plan was declared on

**W71's confirming gate on `bc32642`'s tree, 2026-09-18**, which is the tree this declaration adds
one plan file and three index paragraphs to — every rung RUN and never PIPED, redirected to
`dev-dist/w71/gate-final.log` and read by its exit code:

```
GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries
41 file(s), 1112 assertions, in node 24.20.0, deno 2.9.6 and chromium (the gate's three)
1610 assertions at L6, 0 failed, 53 real runs on fyflow-scheduler 0.5.2, in node and deno
spec        - 7 documents, 55 examples, 106 rules, C4 at 34
docs        - 32 snippets: 26 run, 6 check; check:docs:selftest 33 probes / 20 gradings
markdown    - 127 documents, 5478 relative links, 272 anchored
register    - 232 questions, 178 open, 2 deferred, 52 resolved
digest      - 25b0377089c2232b over 337 files at that gate's end
```

*Firefox and webkit were not run for this baseline; the last five-runtime figure is W67's
41 / 1112, and W69-W71 changed no test file. This declaration re-takes nothing else, because it
changes nothing a rung reads: the record step's own confirming gate is the declaration commit's.*

**The declaration commit's own confirming gate, 2026-09-18**, over this file, the three index
paragraphs, the plan-history row, the register's reservation note and the spec's two annotated
forward references — the tree held still, every rung RUN, `dev-dist/p19/decl-gate.log`:

```
GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries
41 / 1112 in node, deno and chromium; 1610 / 53 at L6 in both runtimes — UNMOVED
spec 7 / 55 / 106; docs 32 / 26; markdown 128 / 5503 / 272; selftests 7/7 in 897.1 s over 5 lanes
digest 60c512a420deb2ea over 338 files, IDENTICAL before and after
```

*Every figure the declaration could move, moved by exactly what it added: one document and
twenty-five links. Nothing else did.*

## Record

*(Items are recorded here as they close.)*

**[W72](../work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md) is DONE — the contract, [ADR 0056](../decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md).** `examples` is the subset's thirteenth keyword and an ANNOTATION: held to the schema it sits on at construction (`SchemaRefused`, naming the entry, the field, the index and the finding; at every depth; an empty list refused), read by no value check, and the first example is what an authoring-time tool runs a worker on. **Stop-and-ask 1 answered OPTIONAL by the maintainer** — priced on the shipped document: the witness is `{}` for thirteen of fourteen corpus input schemas and reaches fewer output paths in five of twelve described workers; required would have cost six edits and no executed snippet. Every corpus worker declares `inputSchema` and `outputSchema` with examples (fact 1's twelve, `echo` corrected; the two undescribable ones say why in their headers and are NOT CHECKED by name), and `scripts/check-workers.mjs` is the eighth gate entry: fourteen workers run in 0.2 s, twelve confirmed, red on fact 6's schema as its self-test's first probe (24 probes / 9 gradings). `spec/flow-definition.md` **v0.20**, no `FD-V` added, `spec/` 7 / 55 / 106 with C4 at 34; L1-L5 **41 / 1119** in five runtimes; L6 **1611 / 53** in both, moved by the one clause the item predicted and one it added. **Predictions 1 and 4 have a verdict here**: 1 HOLDS (no schema this item wrote needed anything past `examples`); 4 is CONFIRMED again in the sharper direction — the check found zero mismatches over the twelve schemas its own author wrote, and the conformity reader then found TWO by deriving from the workers' code: bounds right at the example and wrong past it (`split`'s `word.length / 10`, `weigh`'s unbounded `run.confidence`), which one run cannot see ([Q302](../open-questions.md)). **The seeded exception table predicted two exceptions that did not fire (`check-spec`, `check-docs`) and missed three every new CHECK reaches** — `package.json`, `check-source.mjs`'s `GATE_CHAIN`, and `examples/l6.ts`'s carried-schemas literal, so **L6 moved where this table's W72 row put it outside the gate**; ten exceptions, one undeclared until the conformity reader's audit (`check-wiring-selftest.mjs`'s `CHECKS`). Readers 11 / 3 blocking and 71 / 40 / 28 / 3 blocking, overlap 1 — the forty-fourth measurement; rule 8 final 79 probes, 67 caught, 9 declared, 2 measured crashes (a refused corpus registry takes the L1 runner down at module scope, Q272's shape), 0 undeclared. Q300-Q302 raised; census 235 / 181 / 2 / 52.

**[W73](../work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md) is DONE — the wiring check, and NO ADR.** `checkWiring(registry, flow)` in `src/definition/wiring.ts`, exported from the root, gives EVERY ARC one of five verdicts over five shapes of *what a node receives* — an edge, a fan-out branch (`JP-R11`), a map item, a join's record (`JP-R12`), a `needs` composition (`FD-C1`) — `fits`, `no`, `transform-passes`, `transform-fails`, `unchecked`; fact 3's relation promoted verbatim in shape with its ONE leniency named ([Q305](../open-questions.md)), a transformed arc verified by RUNNING the adapter's worker half on the producer's declared example or its witness with the verdict saying which and the arity ([Q301](../open-questions.md), [Q263](../open-questions.md)), and decision 8 answered from what the check KNOWS because the subset cannot say `additionalProperties: <schema>` — measured first ([Q306](../open-questions.md)). **All four stop-and-asks answered by the maintainer the same day, each as recommended**: road B for [Q300](../open-questions.md) (the L4 corpus stays unchecked, totality asserted over its 56 arcs); decision 5's boundaries ON by default as REJECTED COMMANDS — `FD-R4`, `BoundaryRefused` thrown at `start()` before the driver counts itself started and at `resolve()` with the task still suspended, once per run and once per human action, `validateBoundaries: false` forwarded by the runtime, ADR 0057 unused; the miswire's home a FIXTURE CORPUS, `spec/examples/wiring/`, one document per verdict named by the verdict it earns, held to section 7 both ways; and the L6 corpus's own miswire — **fact 3 re-taken over every shape found NINE arcs that did not fit, seven on the one bound W72's reader dropped** — closed by clamping the producer and restoring the bound (road ii, [Q302](../open-questions.md)'s other resolution). `spec/flow-definition.md` **v0.21** (a subsection stating the relation's two tables, `FD-R4`, the fixture table), `spec/` 7 / 61 / 107 with C4 at 34; L1-L5 **43 / 1197** in five runtimes; L6 **1627 / 53** in both. **Prediction 1 HOLDS, prediction 2 CONFIRMED on the shipped tree and NOT on the first cut**: the conformity reader found the check THROWING `ID-R6` on a fan-out in a map branch and a map in a map — documents the validator accepts and the driver refuses (Q160) — so *total* was true of the corpus and false of the validator's language until a reader re-derived it on paper. **Its adequacy reader found `fits` lenient for ZERO five ways under fact 3's twelve controls** (an unbounded producer into an enum; three bound keywords removable; `maximum`'s direction, because the corpus's one pair is 1 into 1; a producer with no `items`; the leak between closed objects) and, by construction with no mutation, a map's branch task composing `"."` and transforming it sampled on the WHOLE array — a correct wiring read `transform-fails`. Readers 20 / 5 blocking and 24 / 23 / 18 real / 11 blocking plus one constructed, overlap 1 — the forty-fifth measurement; rule 8 final 90 / 82 / 7 declared / 0 undeclared. Q305-Q307 raised, Q300 and Q301 resolved, Q302 / Q263 / Q186 / Q272 / Q217 extended; census 238 / 182 / 2 / 54.

**[W74](../work-items/w74-the-assists-and-the-exit-artifact.md) is DONE and it is P19's EXIT ARTIFACT: an AUTHORING SESSION a human can watch, executed by `npm run gate`.** `src/definition/assist.ts` is a ROOT export beside `checkWiring` — `pathsOf` (every path a value may carry, with what the schema says of it and whether it is GUARANTEED), `tryTransform` (the sample-and-diff loop, a SUBSTITUTION over `checkWiring` rather than a second evaluator, so the per-item road W73's reader found is inherited unchanged), and `signatureOf` (the TypeScript a worker's author writes against, as TEXT, with no dependency). `AGENTS.md` **section 15** is the session: a flow, a miswire the check names before anything runs (*consumer requires "text", producer does not guarantee it*), the paths the producer admits, a first transform that FAILS on the producer's declared example, **ONE expression edit** that passes, the generated signature, and then the run — `completed`, `{ words: 3 }`, on a real `createRuntime`. `README.md` carries it byte-equal as its THIRD snippet under `X8`. **All three stop-and-asks answered by the maintainer the same day, each as recommended**, and **ADR 0057 is NOT taken**: decision 9's substance — no build step, no dependency, *types catch the SHAPE and not the constraints* — is intact, and the departure is in its wording. **Three declaration facts decided the shape, and two of them were about what the plan's own corpus CANNOT do**: the enumerator must accept a schema `schemaProblem` REFUSES, because the map record the check derives is the one shape a join successor's author most needs ([Q306](../open-questions.md)); and **`echo`, the consumer of BOTH transformed arcs in the L6 corpus, refuses 0 of 9 probe values** — its `inputSchema` is `{"examples":[{"a":1}]}` — so a TYPO in that flow's shipped transform still reads `transform-passes`, and the session had to bring its own two workers with OPPOSED schemas. *A loop's discriminating power belongs to the consumer.* L1-L5 **44 / 1234 in five runtimes** (from 43 / 1197); **L6 UNMOVED at 1627 / 53** in both runtimes, which is what an item that adds a reading rather than a dispatch must show; `spec/` **UNMOVED at 7 / 61 / 107 with C4 at 34**, and the `Spec: NONE` CRITERION was wrong while its conclusion held — it would have kept W73's own check out of the spec too ([Q312](../open-questions.md)). **Readers 15 / 4 blocking and 39 mutations + 5 by construction / 14 real / 5 blocking, overlap 1 — the FORTY-SIXTH measurement** — and the conformity reader's central obligation came back with ZERO disagreements on the values, having derived every path, every verdict, both signatures and the run on paper first. **What it found instead was a RED GATE ENTRY** — `check:docs:selftest`'s *unclosed fence* probe deletes the LAST fence in the reference, now section 15's, which `X8` pairs, so it tripped `[X1,X8]` against `[X1]` — **and a measurement stated BACKWARDS in four places, one of them a priced reason in a stop-and-ask**: the harness was run twice, once configuring `json-schema-to-typescript` to CLOSE what a schema leaves open, and the later run's line count was kept beside the earlier run's conclusion. The two tools AGREE on the open object and differ where a schema says LESS. **Both readers found `pathsOf`'s bare `in` independently** — from `schema.ts`'s own `own()` helper and by construction — which is the overlap. Rule 8 final **74 probes, 65 caught, 8 declared ceilings each RUN, 0 undeclared survivors, 0 crashes, 0 against declaration**, 6 aborts on the run every one rule 7 (b) on an anchor this item's own fixes moved. Q310-Q312 raised, Q102 / Q217 / Q272 / Q302 extended, Q308-Q309 and Q313-Q314 unused; census **241 / 185 / 2 / 54**.
