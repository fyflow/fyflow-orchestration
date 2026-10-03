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
holds **ZERO** occurrences of `async`/`await` in code. *(This read **2** occurrences *in ~2000 lines*
until W108's declaration step re-took it: the file holds **ONE** occurrence and it is inside a COMMENT —
the sentence at `driver.ts:3033` about a language's evaluator being async — so the count in code is zero,
and the file is **3730** lines of which **1159** are code, this repository's `src/` being majority comment
by house style. **The conclusion is unchanged and STRONGER**: there is nothing to make async around.)*
So a declared expression cannot be evaluated
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

> **RE-TAKEN A THIRD TIME at [W108](../work-items/w108-a-predicate-is-data.md)'s declaration step, and
> this fact is wrong in three places while its conclusion survives twice over.** The table above counts
> **eight** instances; the tree holds **TEN predicate bodies over ELEVEN sites**, and the two it misses
> are an equality on the `outcome.result` root (`scenarios.ts:221`, `result.bail === true`, where the
> table's only equality example is on `needs`) and **a NEGATION — `resume.test.ts:84`, `(ctx) => !isHigh(ctx)`,
> a shape the table does not list.** The ROOT counts are text occurrences across whole FILES and are
> dominated by assertion sites in one test file; by predicate BODY they are **`ctx.needs` 5,
> `ctx.outcome.result` 4, `ctx.outcome.taskId` 1** — so *the roots are not only `result`* holds and its
> ordering is the other way round. And *path, compare, literal* is a REDUCTION of the three `typeof x ===
> 'number' && x < t` bodies rather than a reading of them: measured over 1800 contexts the reduction is
> exact at **1800 / 1800**, and it is exact **because the comparison is TYPE-STRICT**, which nothing in
> this plan says. W108's declaration step has the measurements and the two consequences — the negation is
> expressible only when a comparison may carry a `default`, and a type-strict form **disagrees with
> `isHigh` on `{score: "9"}`**, where the JS body coerces.

**Fact 3 — the built-in-set precedent exists TWICE and the node-type one does not.** `src/definition/`
declares exactly `BUILT_IN_GROUP_TYPES` (the scheduler's three) and `BUILT_IN_GATE_TYPES` (`distinct`).
There is **no `BUILT_IN_NODE_TYPES`**, so W109 adds the set as well as its first member.

> **RE-TAKEN at [W109](../work-items/w109-a-node-that-only-transforms.md)'s declaration step: CONFIRMED,
> and it misses a THIRD set whose existence changes the shape of the member W109 adds.**
> `src/scheduler/runtime.ts:119` declares **`BUILT_IN_GROUP_FACTORIES`**, so the group-type precedent is
> **TWO-PART** — the NAME and the SCHEMA in `src/definition/registry.ts`, whose own comment says *what
> this module needs of them is the NAME … and the SCHEMA, and both are data*, while the thing that
> CONSTRUCTS lives in the scheduler sub-path. A built-in NODE type has the same split, and its scheduler
> half already exists: `ENVELOPE_WORKER_URL` at `src/scheduler/bootstrap.ts:57`, the script **every**
> typed pool loads. *The fact's one-set reading is right about what is missing and understates what the
> precedent looks like.*

**Fact 4 — the envelope worker is already most of W109.** `src/scheduler/envelope-worker.ts` ships, it
evaluates the node's `transform` in `run()`, and its field is **already** `private inner: InnerWorker | null = null`.
`setup()` imports `this.cfg.worker` and throws if the default export is not a class. So *no inner worker*
is an arm in a file that exists, not a new worker.

> **RE-TAKEN at W109's declaration step, and this fact's CONCLUSION is FALSE in the direction that
> matters.** The field is nullable exactly as stated. But *no inner worker* is **not an arm**: measured one
> refusal at a time, `setup()` with no `worker` in the pool config THROWS *the pool config names no worker
> URL*, `setup()` with `worker: ""` throws the same clause, and `run()` with `inner === null` THROWS *run()
> before setup() — the inner worker is not loaded*. **The null is a LIFECYCLE state — before `setup()`,
> after `teardown()` — and two shipped refusals forbid it as a configuration.** The arm has to be BUILT;
> the field's type merely does not stand in the way. *And three further layers refuse a worker-less type
> before the envelope is ever reached — `FD-V32`, `resolveRegistry`'s `WorkerMissing` (two clauses) and
> `checkWiring`'s `schemaOf` reason — with `derivePool`, `poolOptionsOf` and `bootstrap` all taking the
> worker as required.* W109's declaration step has the table and the stop-and-ask the maintainer answered
> on it.

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

> **Facts 6 and 7 RE-TAKEN at W109's declaration step: 6 CONFIRMED to the word, and 7 is STRONGER than
> it is written.** Run on a node whose worker declares neither schema, with a transform, the arc LEAVING
> reads `unchecked` with *"b" (type "B", worker "bare") declares no outputSchema* — fact 6 exactly. And
> the arc INTO it reads *declares no inputSchema — **the transform ran and nothing holds its result***
> with **`sample.result` POPULATED**. So the feedback does not merely exist unwired: **`checkWiring`
> already runs the transform on this exact case, already computes the produced value, and already says
> in words that nothing holds it.** `tryTransform` returns the verdicts whose `consumer` is the node
> asked about, so asking it about the transform node hands back the produced shape and asking it about
> the node downstream hands back fact 6's bare `unchecked`. *W109's output (4) is a PRESENTATION of a
> value the check computes today — smaller than declared, and its claim correspondingly narrower, which
> is why prediction 4 stands.*

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

   > **MEASURED at W109's declaration step, and the COUNT in this sentence is wrong while its argument
   > gets stronger.** Two arms over one `map` computing the same N values, on a real `FyflowScheduler`,
   > warmed up, median of three, counts asserted steady: per item a tier-three node costs **+1 dispatch,
   > +4 CLONES and +2 log records**, identical at N = 4, 32 and 128. The four clones are named —
   > `OR-R2`'s at the listener, the one `runtime.start` installs on every run ([Q320](../open-questions.md)'s,
   > paid again), the edge hop's, and the extra dispatch's envelope `settings`. **And the two pool modes
   > answer differently**: inline the ratio RISES with N — 1.26x / 1.73x / 1.93x — toward the 2x doubling
   > the task count predicts, because there the driver's own work IS the cost; threaded it is **FLAT at
   > 1.50x / 1.46x / 1.47x**, because a thread pool's per-task cost is dominated by what it amortises.
   > *W34's 2207 ms is a clone per BRANCH over a 117 KiB payload and is a different quantity, which is why
   > W109 was told to measure rather than cite it.*

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

## Record

**W108 is DONE (ADR 0074), W109 is DONE (ADR 0075) and [W110](../work-items/w110-a-flow-a-ui-could-have-emitted.md) is DONE, and **P26 is COMPLETE and RETRO'D** — the retro is below, and `doc/workflow.md` is v0.26.** *(This read *COMPLETE pending its retro* for the hour between W110's record step and the retro that followed it, and the retro did not correct the sentence it was invalidating — found by a script trying to DERIVE this plan's status from its own file, which is the one road section 1 rule 5 permits.)* *(This read *W110 is next, and it is the exit artifact* until W110's record step — a claim with an expiry date, corrected by the item that expired it.)* The artifact is `examples/flows/ui-emitted.flow.json` and `examples/ui-registry.json` on a real `FyflowScheduler` in BOTH L6 runtimes, **L6 2176 / 154 → 2435 / 161**, the package **`0.7.0`**, and **prediction 3 CONFIRMED with two narrowings measured**.
Read every status from the item's own file, never from this one.

| | |
|---|---|
| **W108** | a predicate is DATA — [ADR 0074](../decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md), `spec/flow-definition.md` **v0.27**, `FD-V42`-`FD-V45`, **41 refusals**. BREAKING: the bare-string `when` is retired, 102 sites in 38 files |
| **W109** | a node that only transforms — [ADR 0075](../decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md), `spec/flow-definition.md` **v0.28**, **`FD-V46`**, **42 refusals**. `BUILT_IN_NODE_TYPES` with one member, `Transform`, merged at every READ and stored in no registry |
| **W110** | the exit artifact: a flow a UI could have emitted, on real workers in both L6 runtimes. **L6 MOVES** |

**What the two items did to this plan's own facts.** Every one of the seven was re-taken and **FIVE
were corrected in place** — facts 1 and 2 by W108, facts 3, 4 and 7 by W109, with fact 6 confirmed to
the word. The two that matter most:

- **Fact 4's CONCLUSION was false in the direction that mattered.** *No inner worker is an arm in a
  file that exists* — measured, `setup()` with no `worker` THROWS and `run()` with `inner === null`
  THROWS, both by name since v0.17, so the null is a LIFECYCLE state and the arm had to be built. Three
  further layers refused a worker-less type before the envelope was reached.
- **Fact 3 was right about what was missing and understated the PRECEDENT.** `BUILT_IN_GROUP_FACTORIES`
  is a third built-in set the fact does not name, so the group-type precedent is TWO-PART — and
  `ResolvedRegistry` has no `gateTypes` field at all, which is the half of the gate-type precedent
  W109's first cut did not follow and which cost 80 of this repository's own tests to see.

**Decision 4's cited cost was wrong and the direction helps.** It priced a tier-three node at *a
dispatch, an `OR-R2` clone and a log record* against W34's 2207 ms; measured on a real
`FyflowScheduler` at three arities, it is **+1 dispatch, +4 CLONES and +2 log records** per node — one
of the four being [Q320](../open-questions.md)'s, paid again — rising to **1.93x** of a tier-two run
inside a `map` at N = 128 inline and flat at **1.47x** threaded. *The two pool modes answer
differently, and W34's figure is a clone per BRANCH over a 117 KiB payload, a different quantity.*

**Predictions: 1 CONFIRMED VACUOUSLY, 2 REVERSED, 3 CONFIRMED with its SCOPE narrowed twice, 4
CONFIRMED — all four have a verdict.** Prediction 1 —
the subset needs no composition beyond flat `all`/`any` — is confirmed by a tree that needs no
composition at all, so W110 is what tests it. **Prediction 2 was reversed by a DECISION rather than by
its named mechanism** (W108: the condition it names did not fire and the prediction is false anyway,
because the maintainer's answer to stop-and-ask (b) retired the string form). **Prediction 4 is
CONFIRMED and W109 built the function that makes it legible**: `sampledOutput` returns the departing
verdicts — still `unchecked` — beside the sampled shape, so [Q446](../open-questions.md)'s residue
cannot be read as removed by the item that was most likely to be read that way.

**Prediction 3, the plan's one REACH prediction, is CONFIRMED — and its reversal column told W110 to
go and try, which is what [P15](p15-what-a-run-retains-and-what-a-result-may-be.md)'s retro settled a
reversal clause is for.** The column said *W110 finding a shape it cannot express without a function,
which is the artifact's job to try*. It found **two**, and neither is a function:

1. **A `transform` always names a `lang` and no language ships with the library.** `Registry.languages`
   is EMPTY when absent, and `S14` with
   [ADR 0052](../decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md)
   rule 4 keep every engine out of `src/`, so the adapter is a consumer's IMPORT even though the
   library publishes it as `fyflow-orchestration/jsonata`. **The prediction's own words — *zero code
   but domain workers* — are therefore false as written**, and W110's `Outputs` row (1) is corrected
   in place to *the domain workers AND the adapter the library itself ships*. One line of a consumer's
   registry, and it is the whole of the gap.
2. **A comparison reads ONE path and compares it to ONE literal.** So *is the mean below the threshold
   the run carries* is not a comparison and neither is any arithmetic — and a `value` MEANT as a path
   is accepted as a literal string and is false for ever ([Q456](../open-questions.md)). **The route
   around it is DATA**: W110's `rollup` is a tier-three `Transform` node computing `weak`, and the
   `when` reads `outcome.result.weak`. So the reach holds at the cost of a NODE rather than of a
   function, which is ADR 0075's three-tier rule doing precisely what it was written for.

*A reach prediction confirmed with its scope narrowed twice is worth more than one confirmed flat*,
because both narrowings were measured by the item whose job was to look for them, and each one names a
road the library already has.

**Reserved and spent: W108, W109 and W110 of W108-W111; Q444-Q458 of Q444-Q458, ALL FIFTEEN used
except Q455; ADR 0074 and 0075, both TAKEN and NO ADR at W110 — none was expected and none was
needed.** Q455 is reserved and unused and is NOT reused. **W111 is still a row and the retro closes
it** — derived by grep off the tree, never from this sentence. The next plan starts at **W112,
Q459** and **ADR 0076**.


## Retro

**Run 2026-10-03 on `2eab1c4`. THREE changes adopted, FIVE refused, and `doc/workflow.md` is
[v0.26](../workflow.md).** The central finding is that **`npm run gate:full` had been RED for TWO
ITEMS and nothing in the loop could see it** — which is
[ADR 0070](../decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)
consequence 2 measured rather than predicted, and section 6 pass 3 rule 3's sharpest kind: *a rule
FOLLOWED that did not work*.

That ADR took the self-tests off the ladder on a saving nobody disputes (245 s against 1326 s) and
**priced this exact case in its own consequence 2** — *a commit can be pushed with the proof unrun,
and `S11` and `G4` cannot see it, because they read the MANIFEST* — after which W103's own correction
made the CI workflow a `workflow_dispatch` trigger. The consequence arrived two items later and in
both directions at once:

| lane | what was red | since | why `npm run gate` could not see it |
|---|---|---|---|
| `check:docs:selftest` | two `X6` META probes ABORTED — *the mutation matched MORE THAN ONCE* | **W109**, which gave `X6` a second comparison and duplicated both anchors: `git show` puts `if (missing.length) {` and `if (extra.length) {` at ONE occurrence each on `HEAD~1` and TWO on `HEAD` | the lane is not in the chain |
| `check:wiring:selftest` | the CONTROL died at **3.1 s**, against a lane [ADR 0072](../decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md) measures at 228 s | **W108**, which left six harness modules in `dev-dist/`; three name that directory with no `process.pid`, which `G6` refuses once the control points `CHECK_WIRING_SCRIPTS` there | same, and `stray()` globs `check-*.mjs` so it could not NAME the residue |

**Both were found at W110, and only because its brief asked for `gate:full` by name** — which is a
person, not a mechanism. So an item's confirming gate is `gate:full` now: **761.7 s wall against
2650.3 s serial-equivalent over seven lanes, once per item.**

### Name the rung

**FIFTY-TWO defects across the three items' own numbered lists (14 / 27 / 11), and SEVEN name a rung
that FIRED.** Classified by reading each entry's own attribution rather than by grepping it — two
attempts at a classifier gave 9 and then 5 for the same text, which is why the number below is read:

| what found it | count |
|---|---|
| a **READER** | **22** |
| the author, or a re-read | 17 |
| **rule 8's own set** (a grader control, a crash, a mis-declared probe) | 6 |
| **a RUNG that fired** | **7** |

**All seven rung firings were read correctly at the first opportunity.** The ratio is P24's and P25's
again: *the readers are the mechanism that finds defects, and the ladder is what stops the product
regressing.* W109's list is numbered to 28 with **26 missing**, a slip in its own Record; the count
above takes its 27 entries.

### The ceiling re-run

**23 declared, 20 HELD, 1 CRASH, 2 ABORTS, ZERO catches, ZERO against declaration** — in an isolated
copy at `2eab1c4`, **one item at a time from a clean tree, each with its own control**, three controls
all clean.

| item | declared | held | the rest |
|---|---|---|---|
| [W108](../work-items/w108-a-predicate-is-data.md) | **11** | 8 | `e9` CRASH (as in its own item — it has never been a demonstrated ceiling); `d4` and `d5` ABORT |
| [W109](../work-items/w109-a-node-that-only-transforms.md) | 6 | **6** | — |
| [W110](../work-items/w110-a-flow-a-ui-could-have-emitted.md) | 6 | **6** | — |

**The two aborts are the finding**: `d4` and `d5` anchor in `test/definition/wiring.test.ts` and
`scripts/check-docs.mjs`, two files **W110 edited**. Rule 7 (b) refused them rather than passing them,
which is the guard working; v0.17's dated-ceiling clause reaches a moved VALUE and not a moved ANCHOR,
and a rule for that is refused in v0.26 because an abort is loud.

**And the 11 is why change 2 exists.** W108's own report NAMES eleven and its tally line reads
*declared ceilings 10*, because `e9` is counted under crashes — so the figure W108's Record,
`CLAUDE.md`, `doc/README.md` and this plan's Record all carry omits a declared ceiling whose verdict
is *it never ran*. **This re-run worked only because it read the ids out of each harness's source
rather than trusting the number**, and doing so found 23 where the three Records sum to 22.

### Predictions, and the ledger

**All four predictions have a verdict and they are in this plan's Record above**: 1 CONFIRMED
VACUOUSLY, 2 REVERSED by a DECISION rather than by its named mechanism, **3 (the REACH) CONFIRMED
with its scope narrowed TWICE by the item that met it**, 4 CONFIRMED. Prediction 3's reversal column
told W110 to go and look, and it found two narrowings — no language ships with the library, and a
comparison reads one path against one literal — neither of which is a function.

**W111 CLOSED unissued** (no `w111-*` file exists), **Q455 reserved and UNUSED and therefore SPENT**
and not reused, **ADR 0074 and 0075 both TAKEN**. Q444-Q458 are all used except Q455. **The next plan
starts at W112, Q459 and ADR 0076** — derived by grep off the tree, never from this sentence, and it
is [P27](p27-what-a-register-row-is.md), already declared.

**Reader passes: six, none empty, overlaps 2, 2, 4** — W108, W109, W110 — and this retro **appends
six entries** to `doc/workflow.md` section 6's list, which had stood at `W101 4` for four plans' worth
of items. **W107's overlap is recorded NOWHERE** and is carried as unrecorded; W108's published
ordinal is short by three, which W109 measured. Three of the six belong to no plan, which is change 3.

**Census CONFIRMED at 349 / 273 / 1 / 75**, measured at W110 two ways with 349 of 349 in exactly one
cluster cell. **The retro raises no question** and hands three findings to P27's declaration instead:
the widened `stray()` glob, the stale *62 of 76* premise in `check-markdown-selftest.mjs` (the corpus
carries **473 anchored links over 181 documents**), and the `check:questions` clause that would have
caught the register's own stale headline.

**[Q142](../open-questions.md) measured BEFORE this retro's edits and it does NOT fire**: `M3`'s floor
is `< 142`, probe 1's fixture (the tree minus `doc/decisions`) is **137** and the whole tree **182**,
so the margin is **five files** and a retro adds no document. **It is PREDICTED to fire at P27's
FOURTH item document**, every one of which lands outside `doc/decisions`.

### The confirming gate

**`npm run gate:full` — RAN, EXIT 0, ZERO lines beginning `FAIL`, 8/8 self-test lanes ok**, against digest **`efe1c50f4f5e51b4`** over 455 files, IDENTICAL at both ends. 778.2 s wall against 2721.2 s serial-equivalent over seven lanes; `check:docs:selftest` 762.0 s and `check:source:selftest` 730.0 s are the binding pair. **This retro runs the gate its own change ADOPTS**, on the argument that v0.19 was earned by a clause followed in the writing and not in the running — adopting a confirming-gate rule and then not paying for it would be that defect at its first opportunity. *The only edit after this run is this paragraph.*

### What this retro got wrong about itself

**It contaminated its own first measurement and the record says so.** It redirected each harness's log
into the tree that harness DIGESTS, so all three runs report *THE TREE MOVED* while `git status` shows
**zero** dirty tracked paths — the digest is reading the retro's own output. Its first pass also ran
the three sets back-to-back without restoring between them, and W108's abort left
`test/definition/l4-corpus.test.ts` modified; **it was restored before the hunk was captured, so that
one is reported as unattributed rather than explained.** *P15's* downstream of the first's apparatus*,
in the retro that cites it.*


## Out

**Gate TYPES stay code.** A gate is memory plus routes plus a key path
([ADR 0066](../decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)),
which is richer than a predicate; `distinct` is already configurable as data, so a UI can configure a
gate it cannot write, and that is the boundary. **Language adapters, custom group types and custom
node-type classes stay code** — P18 decision 7's list, minus the predicate this plan takes off it.
**Making routing async is OUT** (fact 1): it reaches ADR 0014 and would be its own plan.
