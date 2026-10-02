# P26 — What can a flow say without code?

```
Question: what can a flow DOCUMENT say without code, and what must stay code?
Items:    W108 (a predicate is DATA — ADR 0074), W109 (a node that only transforms — ADR 0075),
          W110 (the exit artifact: a flow a UI could have emitted, on real workers)
Reserves: W108-W111 (W111 expected unused), Q444-Q458, ADR 0074-0075
Baseline: derived by grep off the tree at this declaration — plans to p25, work items to w107,
          ADRs to 0073, register to Q443. L1-L5 54 / 1446 in three runtimes, L6 2176 / 154 in
          both, check:spec 7 / 65 / 126, census 335 / 261 / 1 / 73
Declared: 2026-10-02 on `85ee05c`
```

## The question, and why it is not the one the register has

A flow definition is **data** ([ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)),
and a decision is **half** data: the reference is data, the logic is a function registered by name. So
an author who is not writing TypeScript — a person in a UI, or an agent emitting a document — can wire
nodes and **cannot say what a branch depends on**. Everything else this library needs has been made
expressible as data by some plan: node types are a document or a class
([ADR 0054](../decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)),
gate types are `distinct` or a consumer's own
([ADR 0066](../decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)),
a transform is a declared expression in a registered language
([ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)),
schemas are a built-in subset
([ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)).
**A decision's predicate is the one thing left that is code-only.**

**The register does not have this.** [Q21](../open-questions.md) is the UI's READ side — an event
family so a UI can show where a run is, which [P23](p23-what-a-run-needs-to-outlive-its-process.md) took
the stream half of. The AUTHORING side is unwritten, which is why this plan raises
[Q444](../open-questions.md) rather than taking an existing row. *The one plan in twenty-six whose
subject nobody had recorded.*

**The maintainer framed both halves on 2026-10-02 and the plan does not reopen them**: a `when` that may
be DATA, and a built-in node type that only transforms, on the argument that between them a UI covers
most of what a flow needs to say.

## Seven facts measured before declaring, and THREE changed what is written here

Measured on `85ee05c`, node 24.20.0, `jsonata` 2.2.2 as installed.

**Fact 1 — there is NO synchronous evaluation path in `jsonata`, so the existing mechanism cannot be
reused.** `expr.evaluate()` returns a `[object Promise]`, and the expression object's whole surface is
`evaluate, assign, registerFunction, ast, errors` — no sync entry. `selectEdge` is a **synchronous pure
function** whose own comment says *"it is a function and routing stays pure"*, and `src/driver/driver.ts`
holds **2** occurrences of `async`/`await` in ~2000 lines. So a declared expression cannot be evaluated
where a decision is made without making routing async, which reaches
[ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)'s ordered
fold-input sequence. *That is why ADR 0051 put transforms in the worker wrapper, and it is why a
predicate subset is NECESSARY rather than merely cheaper.* [Q251](../open-questions.md) is the row.

**Fact 2 — and it CORRECTS this plan's own premise. A predicate is NOT just a path, an operator and a
literal.** The draft said *every predicate in both corpora is path + compare + literal*, measured on the
three in `examples/run-flow.ts`. Re-taken over every predicate in the tree, **two shapes are not
covered**:

| shape | instance | covered by path+op+literal? |
|---|---|---|
| path, compare, literal | `outcome.result.confidence < t` (×3), `needs.earlier.flagged == true` (×2) | yes |
| an ABSENT path with a default | `(outcome.result.score ?? 0) > 0.5` | no — needs a stated absent-rule |
| array **length** | `(needs.f ?? []).length > 0` | **no** |
| string **prefix** | `outcome.taskId.startsWith('r1:publish:')` | **no** |

And the ROOTS are not only `result`: measured by occurrence, `ctx.outcome.result` 6, **`ctx.outcome.taskId` 5**,
`ctx.needs.*` 8. *A subset written from the three in `examples/` would have been one third of what the
tree already asks for* — which is `doc/workflow.md` rule 8 obligation (a)'s shapes clause, firing on a
plan's facts rather than on an item's probes.

**Fact 3 — the built-in-set precedent exists TWICE and the node-type one does not.** `src/definition/`
declares exactly `BUILT_IN_GROUP_TYPES` (the scheduler's three) and `BUILT_IN_GATE_TYPES` (`distinct`).
There is **no `BUILT_IN_NODE_TYPES`**, so W109 adds the set as well as its first member.

**Fact 4 — the envelope worker is already most of W109.** `src/scheduler/envelope-worker.ts` ships, it
evaluates the node's `transform` in `run()`, and its field is **already** `private inner: InnerWorker | null = null`.
`setup()` imports `this.cfg.worker` and throws if the default export is not a class. So *no inner worker*
is an arm in a file that exists, not a new worker.

**Fact 5 — a language-agnostic built-in type is REQUIRED, not stylistic.** `S14` in
`scripts/check-source.mjs` fails any file outside `src/jsonata/**` that reaches `jsonata`, by the bare
specifier alone — `RT-R12` / ADR 0052, whose rule 4 is *the runtime imports no engine*. A built-in
**JSONata** node would drag a 242 KB engine into every consumer's install and turn `S14` red. A built-in
type that names `lang` by NAME, exactly as `transform` does, imports nothing: built-in type, consumer's
engine, ADR 0052 rule 4 untouched.

**Fact 6 — every arc LEAVING a transform node is `unchecked`, and that is W109's real cost.**
`wiring.ts`'s `produced()` reads `schemaOf(taskId, 'outputSchema')` and returns `{ unchecked: why }` when
it is undefined. A node with no inner worker has no `outputSchema`, so
[P19](p19-what-a-schema-buys-an-author.md)'s authoring feedback goes dark **exactly where a UI needs it
most** — on the node a UI is most likely to emit.

**Fact 7 — the mitigation for fact 6 already ships.** `src/definition/assist.ts` exports `pathsOf`,
`describePaths`, **`tryTransform`** (async, line 155), `tsTypeOf`, `signatureOf` and `signaturesOf`.
W74 built the sample-and-diff loop that runs an adapter's worker half on the producer's example; so a
transform node's output can be SAMPLED even though it cannot be declared. *The feedback exists and is
not wired to this case.*

## Decisions

1. **A `when` may be a registered NAME or a declared PREDICATE, and both are refused at CONSTRUCTION.**
   That is ADR 0002 rule 1's actual property — a predicate fails at instantiation rather than at routing
   time — and `FD-V36` is the precedent: an expression the language refuses is refused at `new Driver`
   with its message and position. The name road is untouched, so every existing flow is byte-unchanged.

2. **The subset is SYNCHRONOUS and has no clock, no randomness and no I/O — by construction rather than
   by unbinding.** W62 had to unbind `$now`, `$millis`, `$random`, `$shuffle` and `$eval` BY NAME; a
   subset simply has none of them. This is strictly stronger than a JS function on
   [Q9](../open-questions.md), where evaluating twice caught 1 impurity shape of 4: a data predicate
   **cannot** be impure.

3. **Fact 2 sizes the subset and the enumeration is CLOSED, refused outside by name** — ADR 0053's own
   shape. In scope: the six comparisons, a stated rule for an absent path, `length`, and a string prefix.
   **Flat `all` / `any` only, nesting REFUSED.** A predicate that computes — a regex, a date window, a
   lookup — stays a registered name, and that boundary is a sentence in ADR 0074 rather than a surprise.

4. **W109's type is LANGUAGE-AGNOSTIC** (fact 5), and it is the ESCAPE HATCH rather than the default.
   P17's own declaration calls a reshaping task node *"the workaround ADR 0040 exists to remove"*, so the
   ADR carries the three-tier rule: **selection** → `needs`, synchronous and no task; **computation
   feeding a worker** → `transform` on that node, no extra task; **computation with no consuming node** →
   this type, which costs a real dispatch, an `OR-R2` clone and a log record — and inside a `map`, N of
   them, against W34's measured 2207 ms for a clone per branch at N = 1000.

5. **The three things the maintainer was asked to decide, answered as recommended (2026-10-02):**
   (a) the sampled output shape is an **explicit deliverable** of W109 and not a happy accident — fact 7's
   `tryTransform` wired to this case, so a UI gets a shape where fact 6 gives it none; (b) a transform
   node with **no `transform` is REFUSED at construction**, because the alternative is an expensive
   identity; (c) it **takes `settings`**, since the wrapper already binds `$settings` in the expression
   and it makes one type reusable across flows.

6. **No new dependency, in either item.** The subset is built (ADR 0053's precedent) and the node type
   names a language rather than importing one (fact 5).

## Items, serial

| | |
|---|---|
| **W108** | a predicate is DATA — **ADR 0074**. The grammar in `spec/flow-definition.md`, an `FD-V` family, the synchronous evaluator in `src/driver/routing.ts`, the key-path read reusing `readKeyPath` and W100's refusal walk. `Owns` includes `src/driver/routing.ts`, `src/definition/validate.ts`, `spec/flow-definition.md` |
| **W109** | a node that only transforms — **ADR 0075**. `BUILT_IN_NODE_TYPES` (fact 3), the envelope's inner-worker-absent arm (fact 4), the refusal from decision 5 (b), `settings` from 5 (c), and the sampled-shape deliverable from 5 (a) against fact 6's `unchecked` |
| **W110** | the exit artifact: **a flow a UI could have emitted** — no predicate functions, no worker beyond the domain ones, a decision whose `when` is data and a reshaping step with no code, on a real `FyflowScheduler` in BOTH L6 runtimes. **L6 MOVES** |

## Predictions

| | prediction | scope it rests on | what would reverse it |
|---|---|---|---|
| 1 | the subset needs no composition beyond flat `all`/`any` | fact 2, which is every predicate in THIS tree and says nothing about what a consumer writes | one of the eight shapes needing a nested group, or a ninth shape appearing in W110's own flow |
| 2 | W108 moves no existing flow and no existing predicate | the name road is untouched (decision 1); `FD-C3`'s edge `needs` is unchanged | a grammar key colliding with `when`'s current string form, which W108's declaration step must re-take |
| 3 | **the REACH** — a UI can emit a complete flow for sequence, decision, fan-out, join, selection and computation with zero code but domain workers | nothing in this repository has ever authored a flow without code, so this is untested | W110 finding a shape it cannot express without a function, which is the artifact's job to try |
| 4 | fact 6's `unchecked` is the plan's largest residue and W109 does not remove it | `produced()`'s one road, measured | a declared `outputSchema` on the type turning out to be expressible, which decision 5 (a) deliberately does not attempt |

## Out

**Gate TYPES stay code.** A gate is memory plus routes plus a key path
([ADR 0066](../decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)),
which is richer than a predicate; `distinct` is already configurable as data, so a UI can configure a
gate it cannot write, and that is the boundary. **Language adapters, custom group types and custom
node-type classes stay code** — P18 decision 7's list, minus the predicate this plan takes off it.
**Making routing async is OUT** (fact 1): it reaches ADR 0014 and would be its own plan.
