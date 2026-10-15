---
id: ADR 0051
title: "A transform is a declared expression in a registered language, applied in the type's worker wrapper"
status: accepted
date: "2026-09-12"
item: W61
raised-by: P17
supersedes: ""
amends: ""
resolves: Q251
---

# ADR 0051 — A transform is a declared expression in a registered language, applied in the type's worker wrapper

**Status:** accepted — amended by [ADR 0054](0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) at v0.19 (W65): `FD-V37`'s clause about a node with no `type` retired with the bare road, the rest standing; **rule 4 superseded by [ADR 0096](0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md) at v0.34 (W162)** — every typed pool carries every registered language and the helper reads no flow, which withdraws consequence 2 and consequence 5's *only where a transform is declared*; answers [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)'s
question, *what may a node DO to its input before its worker sees it?*, on that plan's decisions
1-10. Amends nothing: [ADR 0049](0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
rule 3's `input` — *the value this node receives* — is what leaves the transform a place to sit, and
its rule 6's *a third key is the wrapper's to consume* is what this decision fills;
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 6 stands for every untyped node. **The placement — the type's worker wrapper, never the
driver — and the language — JSONata, registered by name, the first and only adapter — are the
maintainer's decisions of 2026-09-11 (P16, [Q251](../questions/q251.md)) and are not reopened here.**
**Raised by:** P17, taken by [W61](../work-items/w61-what-a-transform-is.md)

## Context

**A typed node's worker receives `{ settings, input }` where `input` is exactly what arrived, and
when that is not the shape the worker reads the only remedy was a RESHAPING task node.** A worker
whose whole job is to rename keys — which ADR 0040 exists to remove, and whose absence is a silent
wrong answer rather than a refusal: [W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)'s
three map instances each scored zero because every worker read `payload.confidence` and the payload
was the object `needs` described. The successor of a join is where every consumer of a fan-out writes
a reshaping node today, and [Q165](../questions/q165.md)'s reducer on the join was refused by
[ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 5 for a reason that has since expired — `JP-R12` has been specified since W34.

**P17 measured nine facts before declaring and this item re-ran the three it rests on**, under Node
24.20.0 and Deno 2.9.6, identical outside timings (`dev-dist/p17/facts.mjs` with `jsonata` 2.2.2
installed OUTSIDE the repository), **and measured four more of its own** (`dev-dist/w61/facts.mjs`,
both runtimes) before anything was built:

| fact | measured |
|---|---|
| **1. The driver dispatches in one synchronous turn.** | `src/driver/driver.ts` contains **zero** `async`/`await` outside comments; the envelope is built in one object literal at line 2030; `src/scheduler/envelope-worker.ts` imports nothing from the scheduler. So the driver cannot await an evaluator, and the wrapper's async `run()` can |
| **7. A FUNCTION in a pool config cannot reach a thread; a URL can.** | An inline pool whose config carries `{ fn: () => 1 }` runs its task to `done`; a THREADED pool with the same config fails the task with **`() => 1 could not be cloned`**; a threaded pool whose config carries a URL string runs. So an adapter has two halves |
| **8. `unpackEnvelope` dropped a third key.** | `{ settings, input, transform }` in, `["settings", "input"]` out, on the shipped v0.17 wrapper — the byte-identity of an untransformed envelope rests on the key being added only when declared, and on the wrapper consuming it |
| **F1. A wrapper whose `setup()` THROWS is a WORKER error, and the task never settles.** | On a real `FyflowScheduler`, inline and threaded, both runtimes: the task stays **`pending` with `attempts: 0`**, the POOL emits `worker.setup.started`, `worker.setup.failed`, teardown, `task.requeue_required` and restarts its worker; the scheduler emits **no task event** after `task.running`, so nothing reaches a driver, the outcome record or `RunState`. P17 prediction 2's stated reversal condition, measured real |
| **F2. A `data:` URL module `import()`ed from INSIDE a real thread works**, and so does a module that itself imports a second `data:` URL. | Both runtimes: a wrapper loading a language module by `data:` URL in `setup()` and evaluating in `run()` settled `done` with the transformed result, threaded and inline. This is the shape the test fixture and the conformance suite use in all five runtimes |
| **F3. An evaluation failure thrown from `run()` takes a task's two roads.** | Optional task: `task.failed`, state `failed`; non-optional: `task.failed` then `task.user_action`, state `user_action`, the error's message and `code` carried on the detail — inline and threaded, both runtimes. ADR 0007 rule 2's pair, on a throw the wrapper makes |
| **F4. `unpackEnvelope` on the shipped wrapper**, re-taken: `["settings", "input"]`. | Fact 8 confirmed on the tree the item started from |

*(**F1, re-measured by W141 on 0.5.2, 2026-10-07**, through `createRuntime` — `dev-dist/w141-12912/measure-before.log`, `measure2-before.log`, `measure3-before.log`: a SINGLE task on a worker whose `setup()` throws did NOT hang there — with no retry it settled `user_action` (`failed` when optional), `attempts: 0`, in both pool modes. The hang F1 records is real and needs more than the task the worker failed on: THREE tasks on one worker stayed `pending` for ever six times of six, inline and threaded, the pool requeueing them until its restart limit, and a single task with a retry hung threaded. Rule 5's road now covers the type's own worker too — W141, Q266 — so no `setup()` of the envelope throws.)*

**One stop-and-ask decision was put to the maintainer with the three roads priced, on 2026-09-12,
after F1 was measured and before the wrapper's final form was written:**

| decision | priced | chosen |
|---|---|---|
| a language module that FAILS TO LOAD in the wrapper's `setup()` | *(a)* load in `setup()` and let it throw — the plan's literal text; F1's shape: every task of the type pending forever, the pool restarting, nothing reported to the run, prediction 2 REVERSED and a consumer told to watch the pool. Cost 0 lines. *(b)* load in `setup()`, REMEMBER the failure, and throw `TransformFailed` from `run()` on exactly the tasks whose transform names that language — a task with no transform, or in a language that did load, still runs; decision 3's placement kept; prediction 2 holds. Cost ~8 lines, one L1 case, one spec sentence. *(c)* load lazily on first use in `run()` — the same visibility as (b), decision 3 amended, an import on the first task's critical path | **(b) — load in `setup()`, fail the TASK from `run()`** |

## Decision

1. **A transform is a DECLARED key on a typed `task` node: `transform: { lang, expr }`, both
   strings, and the definition stays data.** `lang` names an entry in `Registry.languages`, the
   fifth set beside `predicates`, `workerTypes` *(retired at v0.19, ADR 0054)*, `groups` and `nodeTypes`, **EMPTY when absent**;
   `expr` is text in that language. The definition names the language and never a file, a URL or a
   function — ADR 0002 rule 3, P16 decision 4's discipline one set over. Typed nodes only, on `map`
   branch tasks included, because only a typed node has a wrapper (rule 3).
2. **A language adapter has TWO HALVES, because fact 7 says it must.** `{ compile, worker, check? }`:
   **`compile(expr)`**, the registry half, is synchronous, returns nothing and THROWS on an
   expression the language refuses with the language's own message — what `FD-V36` reports at
   `new Driver`, with the error's `position` and `code` as detail; **`worker`**, the worker half, is
   the URL of a module whose default export is `compile(expr) → { evaluate(input, settings) →
   Promise<unknown> }`; **`check(expr, inputShape)`** is RESERVED for P18's pre-flight, optional and
   implemented by nothing. The JSONata adapter's two halves are ONE module (W62); the interface
   admits two, and the two can DISAGREE ([Q264](../questions/q264.md)) — so the worker half refusing
   what the registry half accepted is a TASK failure naming the disagreement, and the **adapter
   conformance suite** (`test/scheduler/adapter-conformance.ts`) asserts, for the adapter it is
   handed, that both halves refuse the same expressions, that every case evaluates to its expected
   value twice, that `$settings` is bound, and that `$now`, `$millis` and `$random` never yield a
   value. W61 runs it against a FAKE language shipped as a test fixture, so W62's JSONata adapter
   is a second implementation of an interface that already has a suite.
3. **The transform is evaluated in the TYPE's worker wrapper and never in the driver — the
   maintainer's placement, facts 1 and 7 its ground — and the driver's whole part is one key.** The
   envelope becomes `{ settings, input, transform }` exactly when the node declares one, `transform`
   the declared object as its own copy, and **`input` STILL the value received, untransformed**:
   `FD-C6`, with `FD-C5`'s wording untouched. The envelope worker loads each language's worker half
   in `setup()`, once per worker instance; evaluates in `run()` with `$` bound to `input` and
   `$settings` to the node's effective settings (decision 7, the maintainer's); compiles each distinct
   `(lang, expr)` ONCE per instance rather than per task; and hands the inner worker `{ settings,
   input }` with `input` REPLACED by the result — `undefined` included — and no third key. **So
   ladder L2 cannot see a transformed value** (P17 prediction 3, asserted).
4. **The bootstrap helper writes a language's worker URL into a typed pool's config ONLY for a type
   some node of which declares a transform, and only for the languages those nodes name** —
   `bootstrap(nodeTypes, groups, { languages, flows })`, reading the flows for which types transform
   in which languages. A type whose nodes never transform gets the two-key pool config it had at
   v0.17, so no pool loads an engine it does not use and every existing pool config is
   byte-identical. Direction one is a refusal — a node naming a language with no adapter given
   would meet its transform in the wrapper with nothing to evaluate it; **direction two is NOT**: an
   adapter given that no node names is a registry entry nobody reached for, inert, where a group
   registered and used by nothing is a scheduler object holding silence (ADR 0049 rule 5's
   asymmetry, stated rather than mirrored).
5. **A transform that cannot be evaluated is the TASK's failure, never a run refusal, and so is a
   language module that did not load** — P17 decision 5, and the stop-and-ask above. `TransformFailed`
   is thrown from `run()` naming the language, the expression and the language's own error code
   (`T0412`, `T2002`; the fixture's `P0002`), so the task takes the two roads any worker throw
   takes (F3): an `on: ["failed"]` edge on an optional node, `user_action` on a non-optional one,
   where a person's `resolve()` supplies what the transform did not. A load failure is REMEMBERED in
   `setup()` and thrown from `run()` on exactly the tasks whose transform names that language,
   because a throw in `setup()` is a worker error the run never hears of (F1). A transform that
   evaluates to `undefined` is NOT a failure (P17 fact 4). **No `FD-R` and no new node kind** —
   prediction 2 holds — and `RunState.outcome` never says `stopped` for a transform.
6. **`$now`, `$millis` and `$random` are UNBOUND, by name, in every adapter** — P17 decision 6, a
   rule about ANY language: a transform is a function of what the run produced, because run state
   is a fold of the log and a transform that read the clock would make two folds of one log
   disagree. Detection by evaluating twice is stated as necessary and never sufficient (fact 3:
   `$millis()` returned the same value twice on one machine).
7. **Three refusals, all `FD-V`, decided at instantiation.** `FD-V35`: `lang` unregistered, the set
   EMPTY when absent — because the alternative carries the name to a wrapper that fails every task
   of the node. `FD-V36`: `expr` refused by the named language's synchronous `compile`, with its
   message, position and code — ADR 0002 rule 3's whole argument, and the reason `compile` must be
   synchronous; a `compile` that is not a function is the registry's mistake, refused at construction
   naming the language. `FD-V37`: a transform on a node with no `type`, or not exactly `{ lang, expr }`
   — `FD-V34`'s family, a key carried nowhere. A transform on a `map` node, a `join`, an `end` or an
   edge is `FD-V17`'s undeclared key, refused once by the key tables.

## Consequences

**What this makes easy.** A typed successor of a join reduces `JP-R12`'s record in one line of
JSONata with no reshaping node — P17's exit artifact, W63's; a typed map branch reshapes its own
item; one expression is parameterised per node through `$settings`. A consumer registers a language
once and hands it to the helper and to the driver, as they do a node type.

**What it costs, each stated because the alternative below priced it.**

1. **An adapter is two halves, and only one module can make them one.** A consumer handing `compile`
   from one module and `worker` from another, or two versions of an engine on the two sides of a
   thread, has two languages under one name; the wrapper reports the disagreement as a task failure
   and nothing catches it before a run ([Q264](../questions/q264.md)).
2. **The helper reads the FLOWS.** It is the one reading of a definition the helper makes, and it is
   what keeps a pool from loading an engine its nodes never use; a consumer who runs a flow the
   helper was not shown gets a `TransformFailed` naming the language the pool does not carry.
3. **A path typo is silent** (P17 fact 4): `input.scroe` is `undefined` with no error, and the
   worker receives `undefined` — W43's zero-score shape one layer along. Only P18's samples or P19's
   strict mode can turn it into a refusal, and this decision says so rather than pretending an
   adapter can.
4. **A transform's result changes TYPE with the region's arity** — `*.score` is an array at two
   matches, a scalar at one, absent at zero ([Q263](../questions/q263.md)); W63 runs all three.
5. **The engine is a browser cost only where a transform is declared**: `jsonata` bundles at 242 KB
   (P17 fact 9), and the pure entry, the scheduler sub-path and every typed pool without a
   transforming node load none of it.
6. **`$eval` re-compiles at run time**, so a syntax error inside it escapes `FD-V36` and lands as a
   task failure ([Q265](../questions/q265.md), W62's stop-and-ask).

**What a future reader is likely to try that this forbids.** Evaluating the transform in the DRIVER
*"so ladder L2 can see it"* — rule 3: the driver has no `await` and the evaluator is async, and the
maintainer refused the placement. Putting a transform on a bare `workerType` node *(a road v0.19 retired — ADR 0054)* *"for symmetry"* —
rule 7's `FD-V37`: there is no wrapper there to evaluate it. Handing the wrapper a FUNCTION *"so the
registry is one object"* — fact 7: it cannot cross to a thread. Throwing from `setup()` when a
language does not load *"so the pool reports it"* — rule 5 and F1: the pool reports it and the run
never does. Treating `undefined` as a failure *"so a typo is caught"* — rule 5: that is P19's
strict mode, and an adapter cannot tell a typo from an intended absence.

**What it does not decide.** How `jsonata` is DECLARED as a dependency and whether `$eval` is
unbound — ADR 0052's (W62's, its own record by the maintainer's answer at P17's declaration), with the three manifest shapes priced there;
input and output schemas and the pre-flight (P18); run-time validation of a transform's output (P19);
whether a second language ever ships.

## Alternatives rejected

| | why not |
|---|---|
| **Evaluate in the driver** | The driver dispatches inside a scheduler listener with no `await` (fact 1) and JSONata's `evaluate()` returns a Promise; `AGENTS.md` section 8's quiescent-point contract rests on the one synchronous turn. The maintainer refused it on 2026-09-11 with this reason |
| **A transform on an UNTYPED node** | Only a typed node has a wrapper; a bare node's transform would have to be evaluated by the driver, which is the row above. Refused as `FD-V37` with the reason in the spec |
| **A transform as a REGISTRY entry named by the node, rather than a flow key** | The flow could not say what it does to its input — the expression would live beside the code and the definition would name a slot, which is the reshaping node's opacity under another name. The definition carries the expression and the registry carries only the LANGUAGE |
| **A bare string, the language fixed** | A second language would need a new key; `{ lang, expr }` costs one object and makes the language a registry entry from the first day. The maintainer's, 2026-09-12 |
| **`$` as the whole envelope, or `$` as the input with no `$settings`** | The first makes every expression type `$.input`; the second needs a second expression text to vary an expression per node. The maintainer's, 2026-09-12 |
| **A transform on a `map`'s `over`, on an edge, or on a decision** | A decision predicate is already a registered function and `doc/concept.md` section 7 names an expression language for decisions a non-goal; a consumer wanting one registers a predicate by name through the same adapter with no library change |
| **Detecting nondeterminism by evaluating twice** | `$millis()` returned the same value twice on one machine (fact 3): flaky, so it is stated as a necessary check and the rule is a list of names |
| **A throw in `setup()` for a language that does not load** | F1: a worker error the scheduler never reports to the task — every task of the type pending forever. Priced at the stop-and-ask and refused by the maintainer |
| **Loading the language lazily in `run()`** | The same visibility as the chosen road, at the cost of amending decision 3 and an import on the first task's critical path. Priced and not chosen |
| **A new node kind, or an `FD-R`** | P17 decision 9: a transform rides on `kind: "task"`; its refusals are `FD-V`s and its run-time failure is a task's, reported through the outcome record like any other |
