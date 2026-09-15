# P17 — What may a node DO to its input before its worker sees it?

**Status:** COMPLETE and RETRO'D — declared 2026-09-12 on `4c269d4`, the commit that carried P16's
retro and moved `doc/workflow.md` to [v0.17](../workflow.md); its three items done by 2026-09-13; its
retro run 2026-09-15, taking that document to [v0.18](../workflow.md). **[W61](../work-items/w61-what-a-transform-is.md) is
DONE** (2026-09-12, [ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md));
**[W62](../work-items/w62-the-jsonata-adapter.md) is DONE** (2026-09-13,
[ADR 0052](../decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md));
**[W63](../work-items/w63-a-transformed-join-on-real-workers.md) is DONE** (2026-09-13, no ADR) —
**all three items are done and the retro is RUN** (below). *Read every status from the item's own
file, never from this line.*

**Baseline:** `4c269d4` — `doc/workflow.md` [v0.17](../workflow.md), **P1-P16 complete and retro'd,
no plan running**, tree clean — see *The baseline this plan starts from*.

**The question in one sentence.** A typed node's worker receives `{ settings, input }` where
`input` is exactly what arrived — the previous node's result, what `needs` composed, its own item,
a join's collection — and when that is not the shape the worker reads, the only remedy is a
**reshaping `task` node**: a worker whose whole job is to rename keys, which
[ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
exists to remove, and whose absence is a *silent wrong answer* rather than a refusal
([W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)'s zero-score flow). **What may a
node DO to its input, declared in the flow, before its worker sees it?**

**Exit artifact:** one flow on a real `FyflowScheduler` in **both** L6 runtimes where a typed
**successor of a join** consumes the region's collection through a declared **transform** — a
`$sum`-shaped reduction over `JP-R12`'s record, with **no reshaping task node** — its worker
receiving the reduced value as `input`; the same flow's typed `map` branch reshaping its own item
through a transform; and a row where the join is reached by ONE branch and by NONE, because
JSONata's singleton rule makes the transform's result change TYPE with the region's arity (fact
5). With what reverting each of the three items costs, in L6 failures. **It reaches
[Q165](../open-questions.md)'s refused reducer from the successor's side**, by a road ADR 0037 rule 5
did not close.

**Reserves:** W61-W64 (W64 expected unused), Q263-Q277, ADR 0051-0052. *Derived from P16's retro,
which wrote "the next plan starts at W61, Q263 and ADR 0051" into `doc/README.md`, and confirmed
against the tree: the highest work item on disk is W59 with W60 reserved and closed unissued; the
register's highest row is Q262; the highest decision is ADR 0049 with 0050 skipped. All three are
spent and not reused.*

---

## Why this plan, and why now

**Three things point at the same gap, and each was found by trying to do something else.**

1. **The reshaping node is the library's own workaround, and it is where a silent wrong answer
   lives.** [Q165](../open-questions.md)'s *score, then fan out over the scores* was expressible
   only through a reshaping task until W41's `needs`, and a declared reducer on the join was refused
   **narrowly** by ADR 0037 rule 5 — *because a reducer is a function of what the join collects, so
   it cannot be specified before `JP-R12` is*. `JP-R12` has been specified since W34: a satisfied
   join carries the arrived results keyed by branch path, `{}` for a join nothing reached. The
   reason the refusal gave has expired, and the successor of a join is where every consumer of a
   fan-out writes a reshaping node today (`examples/flows/*` carries three `publish` workers whose
   only job is to read the record).
2. **P18 cannot be built without this.** P16's *Slices beyond this plan* orders the transform
   BEFORE the schema plan for a stated reason: a strict compatibility checker with no adapter
   refuses every flow whose only remedy is the reshaping node, so strictness would make the library
   less expressive on the day it lands. P16's item 2 also decided what a transformed edge is
   checked BY — evidence on samples, never proof — and that decision only has a subject once a
   transform exists.
3. **The place for it was left on purpose, one plan ago.** `FD-C5` defines the envelope's `input`
   as *the value this node receives* and names no expression (P16 decision 2, W59's Scope In 3), the
   envelope worker's header says *a third key the driver may one day add is this class's to
   consume*, and W59 measured that `unpackEnvelope` already DROPS a third key rather than forwarding
   it (fact 8). The road is cut; nothing drives on it.

**And the placement was decided before this plan was drafted, with the alternative priced.** The
maintainer decided on 2026-09-11 (P16, *Slices beyond this plan* item 1, [Q251](../open-questions.md))
that a transform is applied **in the type's worker wrapper and never in the driver**, and that the
language is **JSONata, registered by name, as the first and only adapter**, with CEL's statically
typed alternative refused on the maturity of its JavaScript ports. This plan does not reopen either;
it measures what they imply and builds them.

**Why now.** P16 closed on 2026-09-12 with the envelope, the wrapper and the sub-path pattern all
shipped and re-taken; nothing else is running; and every fact below was measured on the tree P16's
retro left, in both L6 runtimes, before a line of this plan was written.

## What was measured before this plan was drafted

**Nine facts, taken on `4c269d4` with the tree held still, by `dev-dist/p17/facts.mjs` — run under
Node 24.20.0 AND Deno 2.9.6, and the two outputs are IDENTICAL outside the timing rows and one
value that is itself fact 3's finding.** The file prints every number below and is what an item
re-runs rather than transcribes; it is untracked ([Q253](../open-questions.md)'s shape, stated),
and it loads `jsonata` from a scratch install OUTSIDE the repository named by `JSONATA_URL`, because
nothing here installs it until W62 decides how.

**1. The driver dispatches synchronously, in one expression, and the envelope worker imports no
scheduler.** `src/driver/driver.ts` contains **zero** `async` or `await` outside comments; the
envelope is built at **line 2030**, `settings` and `input` in one object literal, which is where a
third key would go; `src/scheduler/envelope-worker.ts` imports nothing from `fyflow-scheduler`, so a
thread loading it resolves only itself and whatever it `import()`s. *This is why the wrapper and not
the driver — the maintainer's placement, and the two facts it rests on.*

**2. `jsonata` 2.2.2 compiles synchronously and evaluates asynchronously, and the split is exactly
the one the design needs.** `jsonata('$sum(*.score')` **throws at compile**, synchronously, with
`code: "S0203"`, `position: 12` and a message naming the missing token — so a syntax error is
refusable at `new Driver` under an `FD-V`. `evaluate()` returns a **Promise** (2.0.0's changelog:
*reimplementing the evaluator to use async functions*), which the driver cannot await and a worker's
`run()` can. The package is one file, zero dependencies, MIT, `dist.unpackedSize` 853 605 bytes;
its default export is the compiler function in both runtimes.

**3. The three nondeterministic built-ins exist, they can be shadowed PER COMPILED EXPRESSION, and
detecting them by evaluating twice is FLAKY.** `$now()`, `$millis()` and `$random()` all return a
value; `expr.registerFunction('now', thrower)` on the compiled object makes `$now()` throw, a **fresh
compile of the same text is unaffected**, so the adapter shadows all three on every compile and the
shadow is not global; and the shadow **reaches `$eval("$now()")`** — a run-time re-compile inside the
expression sees the same frame. **On Node, `$millis()` returned the SAME value on two evaluations
of one expression** (the two calls landed in one millisecond) where Deno's differed — so *evaluate
twice and compare* passes a nondeterministic function on a fast machine, which is
[Q9](../open-questions.md)'s own measurement (*evaluating twice caught 1 of 4*) one layer over.
**The plan unbinds by NAME and states detection as necessary, never sufficient.**

**4. A path typo is SILENT and a type error is LOUD.** `input.scroe` evaluates to `undefined` with
no error; `$sum("a")` throws `T0412` naming the function; `1 + "a"` throws `T2002`. So a transform
whose author misspelt a key hands the worker `undefined` at exit 0 — the same shape as W43's
zero-score flow, one layer along — and only P18's samples or P19's strict mode can see it. **The
plan says so rather than pretending an adapter can.**

**5. A transform's result changes TYPE with the region's arity, and the empty join is a THIRD
answer.** Over a `JP-R12` record of three branches, one without a `score`, `*.score` is `[40, 20]`
and `$sum(*.score)` is **60**. Over a record with ONE match, `*.score` is the SCALAR **7** — JSONata's
singleton-sequence rule — and `[*.score]` is `[7]`. Over `{}`, a join nothing reached, `$sum(*.score)`
is **`undefined`** and `$sum([*.score])` is **0**. *An expression that is right at arity two is a
different type at arity one and absent at arity zero*, which is exactly the three shapes P16's
item 2 named for P18's minimal sample, and it is [Q263](../open-questions.md). The exit artifact
carries all three arities so the row is a statement about the rule and not about one arity.

**6. The cost is inside the clone the envelope already pays.** Medians of 21 evaluations in one
process (W46's caveat: accumulation, not order, is what a one-process number carries), over a record
of N branches each holding a 1 KiB string:

| N | identity `$` | `$sum(*.score)` | filter + map | compile | `structuredClone` of the same record |
|---|---|---|---|---|---|
| 10 | 0.002 ms | 0.017-0.021 | 0.046-0.048 | 0.13-0.22 ms | — |
| 100 | 0.001-0.002 | 0.047-0.060 | 0.36-0.42 | | — |
| 1000 | 0.001 | 0.30-0.33 | 4.4-4.7 | | **2.0-2.3 ms** |

Ranges are Deno-Node. A reduction over a thousand branches costs a sixth of the clone; a filter
and reshape over the same thousand costs twice it; and against [Q186](../open-questions.md)'s
560 ms cliff — a clone of a 1000-item payload per map instance — every cell is two orders of
magnitude down. **Quoted as the shape and the ratio, never the millisecond** (W54's rule); W62
re-takes it inside the wrapper, where the thread boundary adds a clone of its own.

**7. A FUNCTION in a pool config cannot reach a thread, and a URL can — so an adapter has TWO
HALVES.** On a real `FyflowScheduler` in both runtimes: an inline pool whose config carries
`{ fn: () => 1 }` runs its task to `done`; a **threaded** pool with the same config fails the task
with **`() => 1 could not be cloned`**, no throw at `addTask`; a threaded pool whose config carries a
URL **string** runs. **So the thing the wrapper evaluates with must reach it as a MODULE URL**, and
the thing the validator compiles with at `new Driver` — synchronous, on the main thread — is a
function. One adapter, two halves: a registry-side `compile` and a worker-side module the bootstrap
helper writes into the pool config beside the worker's own URL. [Q264](../open-questions.md) is what
that split leaves open.

**8. `unpackEnvelope` keeps exactly `settings` and `input` and DROPS a third key.** Measured on the
shipped `src/scheduler/envelope-worker.ts`: `{ settings, input, transform }` in, `["settings",
"input"]` out. So a driver that adds `transform` to the envelope today changes what the inner worker
receives by **nothing** — the key is consumed by the wrapper or by no one, which is the byte-identity
prediction 1 rests on.

**9. `jsonata` bundles for the browser with this repository's own esbuild** — `platform: 'browser'`,
`format: 'esm'`, **242 190 bytes**, zero warnings. So the adapter's L1 suite can run in all five
runtimes, and the number is what a browser consumer of the sub-path pays.

**What was NOT measured, and is an item's declaration step:** what `jsonata` costs at `typecheck`
under the five configurations (its `jsonata.d.ts` is untested here); how the two manifests declare a
second bare dependency reached only from a sub-path (W62's stop-and-ask, priced with `npm pack` and
`deno publish --dry-run` — both green for the wrong reason once, [Q252](../open-questions.md)); and
the cost re-taken across a THREAD boundary, which fact 6 does not include.

## Scope

**In**

1. **What a transform IS, decided as ADR 0051.** A `transform` key on a typed `task` node — and on a
   typed `map` branch, which is a task node — naming a language and an expression:
   `{ "lang": "jsonata", "expr": "$sum([*.score])" }`. The language is a **registry entry**,
   `Registry.languages`, the fifth set beside `predicates`, `workerTypes`, `groups` and `nodeTypes`;
   the definition names it and never a file (P16 decision 4's discipline). An unknown language, an
   expression the language's compiler refuses, and a transform on a node that has no type are each
   an `FD-V`. The envelope gains `transform` **only when declared**; `FD-C6` states what the worker
   receives then. The envelope worker evaluates it inside `run()` through the adapter's worker-side
   module and hands the inner worker `{ settings, input }` with `input` REPLACED — an evaluation
   failure is a **task failure** under a distinct error, never a run refusal.
2. **The JSONata adapter, as the sub-path `fyflow-orchestration/jsonata`** — P16 decision 5's
   pattern, so the pure entry and the scheduler sub-path both stay free of an engine. It shadows
   `$now`, `$millis` and `$random` on every compile (fact 3), passes the **adapter conformance
   suite** W61 writes against a fake language, bundles for the browser (fact 9), and is measured
   inside the wrapper as [Q186](../open-questions.md)'s cost was. How the dependency is DECLARED is
   ADR 0052's, with both shapes priced.
3. **The exit artifact** on real workers in both L6 runtimes, and what reverting (1), (2) and (3)
   each costs — including the arity-one and arity-zero rows fact 5 demands.

**Out** — named rather than left implicit, with where each goes instead

- **Input and output schemas, edge compatibility, and the sample-based pre-flight for a
  transformed edge.** P18's, in P16's *Slices beyond this plan* item 2, whose design is already
  written; this plan builds the thing it checks. **What this plan owes it is two things**: an adapter
  interface with the optional `check(expr, inputShape)` hook reserved by name and implemented by
  nothing, and [Q263](../open-questions.md)'s three arities as the sample shapes it must include.
- **Validating a transform's output at run time.** P19's, priced there.
- **A transform on an UNTYPED node.** Only a typed node has a wrapper (decision 1), and putting one
  on a bare `workerType` node would mean the driver evaluates it — the placement the maintainer
  refused. Refused as an `FD-V`, stated in the spec with this reason.
- **A transform on a `map` NODE's `over`, on an edge, or on a decision.** A decision predicate is
  already a registered function; `doc/concept.md` section 7 names *an expression language for
  decisions* a non-goal, and a transform is not a decision. A consumer who wants an expression
  predicate registers one by name through the same adapter with no library change, and the plan
  says so once.
- **A second language.** CEL was refused by the maintainer with its reason; the adapter interface is
  what keeps that reversible, and a second adapter is a future item's, not a rule here.
- **Making a region's collection referenceable** — [Q219](../open-questions.md), P15's follow-on,
  untouched: a transform on the join's successor reaches the collection by the road that already
  exists, and since ADR 0046 rule 3 it is the LAST thing that sees it whole.
- **`limitKey`, flow-level retry, node-type versioning** — [Q248](../open-questions.md),
  [Q111](../open-questions.md), [Q249](../open-questions.md), unmoved.

## Decisions taken before fan-out

*Section 7 rule 3: decide, then fan out. Decisions 1 and 2 are the maintainer's of 2026-09-11,
recorded in P16 and [Q251](../open-questions.md); **decisions 4 and 7, and ADR 0052 standing
alone, are the maintainer's of 2026-09-12, taken at this declaration from the stop-and-ask list
below with each alternative named**; the rest are derived from the facts above and are
recorded here so an item argues from them rather than re-deriving them. The two that are
architectural become ADRs inside the items that measure them.*

1. **The transform is applied in the TYPE's worker wrapper, never in the driver.** The maintainer's
   placement, and facts 1 and 7 are its ground: the driver dispatches inside a listener in one
   synchronous turn, `AGENTS.md` section 8's quiescent-point contract rests on that, and the
   evaluator is async. The driver's whole part is one key in one object literal.
2. **JSONata is the first and only language, registered by NAME, shipped as a sub-path.** The
   core carries no engine; an unknown name fails at instantiation (ADR 0002 rule 3); the adapter is
   `fyflow-orchestration/jsonata`; a second adapter plugs into the same interface with no change to
   the driver or the definition.
3. **A language adapter has TWO HALVES, because fact 7 says it must.** On the registry side,
   `compile(expr)`: synchronous, returns nothing, THROWS on a syntax error with the language's own
   message — what `FD-V36` reports. On the worker side, a **module URL** whose default export
   compiles the same text and evaluates it: `compile(expr) → { evaluate(input, settings) →
   Promise<unknown> }`. The JSONata adapter's two halves are ONE module — its `worker` field is its
   own `import.meta.url` — so a consumer who imports the sub-path holds both. The bootstrap helper
   writes the worker URL into the typed pool's config beside `worker` and `config`, and the wrapper
   loads it in `setup()`, once per worker instance, and compiles each expression **once per
   instance** rather than per task. **What the split cannot see is [Q264](../open-questions.md).**
4. **The shape is `transform: { lang, expr }`, both strings, on a typed task node only — the
   maintainer's, 2026-09-12**, over a bare string with the language fixed (a second language would
   need a new key) and over another key name. A
   third key in the envelope, present only when declared, carrying exactly that object. Refusals,
   ids confirmed against `spec/flow-definition.md` section 5 at W61's start (`FD-V34` and `FD-C5`
   are the highest at this declaration): **`FD-V35`** a `lang` the registry's `languages` does not
   declare, an ABSENT set meaning EMPTY (W58's rule for `groups`); **`FD-V36`** an `expr` the
   language's `compile` refuses, with its message and position as the detail; **`FD-V37`** a
   `transform` on a node with no `type`, or one that is not an object of two strings — `FD-V34`'s
   family, a key that would be carried nowhere. Every violation reported, section 5's rule.
5. **An evaluation failure is a TASK FAILURE and the consequence is stated.** The wrapper throws a
   distinct error naming the node's expression and the language's own code (`T0412`, `T2002`), so
   the task fails: routed through an `on: ["failed"]` edge on an `optional` node, **parked as
   `user_action`** on a non-optional one — the same two roads any worker failure takes, and a
   person who `resolve()`s the task supplies the value the transform did not. A later plan may teach
   the driver to read that distinct error as a refusal; nothing here does. **A transform that
   evaluates to `undefined` is NOT a failure** — the worker receives `undefined` as its `input`
   (fact 4), because an adapter cannot tell a typo from an intended absence, and saying otherwise
   would be inventing P19 here.
6. **`$now`, `$millis` and `$random` are UNBOUND, by name, on every compile.** Fact 3: a shadow on
   the compiled object throws, a fresh compile is unaffected, and the shadow reaches `$eval`. Stated
   in the spec as a rule about ANY adapter — *a transform is a function of what the run produced* —
   with the conformance suite asserting the three by name and the two-evaluation comparison stated
   as a necessary check that is not sufficient. Whether `$eval` itself is unbound is W62's
   stop-and-ask ([Q265](../open-questions.md)).
7. **The expression sees its input as the context value and its settings as a binding.** `$` is
   `input` — so `*.score` over a join's record and `$.confidence` over a map item read as an author
   expects — and the node's effective `settings` are bound as **`$settings`**, so one expression can
   be parameterised per node without a second key. **The maintainer's, 2026-09-12**, over `$` as
   the input alone (a per-node variation would need a second expression text) and over `$` as the
   whole envelope (every expression typing `$.input`). Both names are spelled once; the first is
   JSONata's own convention and the second is this plan's.
8. **A typed node WITHOUT a transform is dispatched byte-identically, and every existing L6 row
   keeps its numbers.** Fact 8 plus W58's *a key is added only when present*. A hard constraint on
   every item, asserted the way W59 asserted the P12 flows: a byte-identical dispatch comparison
   with and without `languages` registered.
9. **No new node kind and no `FD-R`.** A transform rides on `kind: "task"`; its refusals are all
   `FD-V`; its run-time failure is a task's, reported through the outcome record like any other,
   and `RunState.outcome` never says `stopped` for it. Prediction 2.
10. **The adapter interface reserves P18's hook and implements it nowhere.** An optional
    `check(expr, inputShape) → outputShape` on the registry half, so a statically typed adapter
    plugs into P18's pre-flight where present; the JSONata adapter declares none, and the
    conformance suite asserts the field is optional rather than absent.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W61](../work-items/w61-what-a-transform-is.md) | **What a transform is — ADR 0051.** `Registry.languages` and the `LanguageAdapter` interface with its two halves; `transform` on a typed task node with `FD-V35`-`FD-V37`; `FD-C6` for the transformed envelope; the driver adding the key only when present; the envelope worker loading the adapter's worker module in `setup()` and evaluating in `run()`, `TransformFailed` as a task failure; the **adapter conformance suite** run against a FAKE language shipped as a test fixture, so this item needs no `jsonata` | `src/definition/**`, `src/driver/**`, `src/scheduler/**`, `spec/flow-definition.md` §2 §3 §5 §7, `spec/README.md`, `spec/examples/**`, `test/definition/**`, `test/driver/**`, `test/scheduler/**`, `AGENTS.md` §3 and §13, `doc/decisions/0051-*` | nothing — P16 is merged | L0-L5 in five runtimes with the new refusals fixtured and the wrapper evaluating a fake language inline AND threaded at L1; the byte-identical dispatch comparison; rule 8 obligation (a) with **all** of `FD-C5`'s four `input` kinds carrying a transform, because v0.17's enumeration clause names them |
| [W62](../work-items/w62-the-jsonata-adapter.md) | **The JSONata adapter — ADR 0052 (how a second dependency is declared), unless the maintainer folds it into 0051.** `fyflow-orchestration/jsonata` in both manifests, `jsonata` 2.2.2 declared the way the maintainer chooses with both shapes priced, the three built-ins shadowed on every compile, the conformance suite passed, the browser bundle, the cost re-taken inside the wrapper across a thread, `spec/runtime-targets.md`'s rule for a second bare specifier reached from one sub-path | `src/jsonata/**` (new), `package.json`, `deno.json`, `test/jsonata/**` (new), `spec/runtime-targets.md` §4, `AGENTS.md` one new section, `doc/decisions/0052-*` | W61 | L0 under all five typechecks with `jsonata.d.ts` in; L1-L5 in five runtimes, the adapter suite in the browser bundle; `check:source` `S6` on the new files, whatever `S7`/`S8` say about a second specifier; `check:docs` on the new section's snippets; the cost table of fact 6 re-taken in the wrapper, inline and threaded |
| [W63](../work-items/w63-a-transformed-join-on-real-workers.md) | **A transformed join on real workers — the exit artifact.** A flow whose typed join successor reduces `JP-R12`'s record through `$sum([*.score])` with no reshaping node, whose typed map branch reshapes its item, run at arities two, ONE and ZERO; the revert costs of W61, W62 and W63 | `examples/**` | W62 | L6 in both runtimes at the declared pre-item numbers plus the new rows; every existing row unmoved; three revert runs read by exit code and failure count; rule 8 over the rows' discriminating pairs (v0.13 change 3: the arity-one and arity-two rows must FAIL if their expected values are swapped) |
| [W64](../work-items/w64-reserved.md) | *reserved — expected unused; its three issuance conditions are in its file* | | | |

Each has its own file under `doc/work-items/`, declared with this plan. This table is an index, not
the declaration.

**Why serial and in this order.** W61 defines the interface both halves of the adapter satisfy and
proves it with a fake language, so W62's JSONata adapter is a second implementation of an interface
that already has a suite — W50's *two sources that can disagree* made into a test rather than a
hazard. W63 needs a real language. Every item that touches `src/scheduler/**` or the manifests
would collide with the next, so section 7 rule 2 makes them serial whatever the order; and **W61
ships something observable** — a transformed envelope on a real inline pool at L1, with a fake
language — so the plan's first item is not P11's shape.

## Predictions, written down before the items that test them

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **Declaring the whole of W61 costs 0 failures on every EXISTING test at L1-L6**, and a typed node with no `transform` is dispatched byte-identically | fact 8 (`unpackEnvelope` drops a third key) and decision 8 (the key is added only when present); measured on the shipped wrapper, not on W61's | any existing L6 row moving, or the byte-identical comparison failing — which would mean the driver adds the key unconditionally or the wrapper forwards it |
| 2 | **No `FD-R` and no new node kind** — every refusal is an `FD-V`, the transformed envelope is an `FD-C`, and an evaluation failure reaches the outcome record as a task's `failed` or `user_action`, never `RunState.outcome === 'stopped'` | decision 5 and 9; the scheduler's two roads for a worker throw, measured through P2 and W58 | a failure the wrapper cannot express as a task failure — a throw in `setup()`, which the scheduler reports as a worker error and not a task's, and which W61 must measure |
| 3 | **The transform is INVISIBLE at ladder L2**: reverting the wrapper's evaluation costs 0 at L2-L5 and non-zero only at L1 (the wrapper's own suite) and, after W63, at L6 | fact 1 — L2 asserts on what `createTask` received, which is the untransformed envelope by decision 1 | an L2 fixture that sees a transformed value, which would mean the driver evaluated — decision 1 broken |
| 4 | **The three shadowed functions are the ONLY nondeterminism in JSONata 2.2.2's built-ins**: W62's conformance probe, walking the language's whole function table, finds no fourth built-in whose two evaluations of one expression on one input differ | fact 3, over three names taken from the language's documentation; NOT over the function table, which is what makes this the reach prediction | a fourth function found — in which case decision 6's list grows and the spec rule was right to be stated as a property rather than a list |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| Q263 | **A transform's result changes TYPE with the region's arity, and the empty join is a third answer.** Fact 5: `*.score` over a two-branch record is an array, over a one-branch record the scalar, over `{}` absent — JSONata's singleton-sequence rule — so `$sum(*.score)` is a number, a number, and `undefined`. `[*.score]` fixes the first two and `$sum([*.score])` the third. **W63's exit artifact runs all three arities so the hazard is a row and not a sentence; P18's samples must include arity one and zero** — P16 named zero and not one | W63 shows it; P18 owns the check |
| Q264 | **An adapter's two halves can DISAGREE, and the bootstrap helper cannot see it.** Fact 7 forces a registry-side `compile` and a worker-side module URL; the JSONata adapter makes them one module, but the interface admits a consumer handing `compile` from one module and `worker` from another, or two versions of `jsonata` on two sides of a thread — W50's *two sources that can disagree*, across a thread boundary. The conformance suite asserts the JSONata adapter's `worker` resolves to a module whose `compile` refuses exactly what the registry half refuses; nothing asserts it for an adapter the suite has not seen | W61 records; not closed by this plan |
| Q265 | **`$eval` re-compiles at RUN time, so a syntax error inside it escapes `FD-V36` and lands as a task failure.** Fact 3 measured that the three shadows reach `$eval`, so it is not a nondeterminism escape; it is a construction-time-refusal escape, and `$eval("$sum(")` is `T0412`'s shape at run time rather than `S0203`'s at `new Driver`. Whether the adapter unbinds `$eval` too is W62's stop-and-ask, priced against what a consumer would lose | W62 |
| Q266-Q277 | *reserved for the items* | |

## Slices beyond this plan, in order

*Unchanged from P16's list, less this plan.*

1. **P18 — what a node type SAYS about its input and output.** P16's item 2, verbatim, with two
   inputs this plan hands it: the adapter's reserved `check` hook (decision 10) and
   [Q263](../open-questions.md)'s three arities as sample shapes.
2. **P19 — strict mode.** P16's item 3, and it gains one subject from here: a transform's declared
   output against what the transform produced, which is the only thing that can turn fact 4's silent
   typo into a refusal.
3. **Q16's flow half**, if anything ever asks for it.

## Stop and ask a human

- **How `jsonata` is declared** (ADR 0052). `dependencies` pulls 834 KB into every install of a
  package whose root never loads it; a `peerDependencies` entry with `peerDependenciesMeta` optional
  makes the consumer install it and is the shape W57's adequacy reader found adjacent to the one a
  check reads; `optionalDependencies` is a third. W62 prices all three with `npm pack` and
  `deno publish --dry-run` on scratch copies; the maintainer chooses.
- ~~**Whether ADR 0052 is its own decision or a clause of 0051.**~~ **Answered at the declaration,
  2026-09-12: its own ADR** — a second bare specifier reached from one sub-path is `RT-R11`'s shape a
  second time, and a decision of that weight gets its own record, as ADR 0048 did. W62 still prices
  the three shapes before the maintainer chooses one.
- ~~**The transform's bindings** (decision 7)~~ and ~~**the key's name and shape** (decision 4)~~ —
  **both answered at the declaration, 2026-09-12**: `$` is the input and `$settings` is bound;
  `transform: { lang, expr }`. Recorded in the decisions; W61 argues from them.
- **Whether `$eval` is unbound** ([Q265](../open-questions.md)).
- **Anything that would change what a typed node WITHOUT a transform receives, or what any
  existing L6 row asserts.** Decision 8 forbids it; an item that finds it necessary stops.

## A note on ids

**Reserves W61-W64, Q263-Q277, ADR 0051-0052.** Derived rather than inherited: the highest work item
on disk is **W59** and **W60 was reserved by P16 and never issued**; the highest Q in the register is
**Q262**; the highest decision on disk is **ADR 0049** and **0050 was skipped**. All spent and not
reused, so the next free triple is **W61, Q263, ADR 0051** — which is what P16's retro wrote into
`doc/README.md`, confirmed here independently.

**Fifteen questions**, on P15's and P16's argument that the block is sized by the worse case (P16
used twelve of fifteen). **Two ADRs expected and both TAKEN**: 0051 is W61's; 0052 is W62's, its own decision by the
maintainer's answer at this declaration.

## The baseline this plan starts from

`4c269d4`, clean tree — P16's retro commit, which touched documents only. **Every figure below was
RE-TAKEN at this declaration rather than transcribed**, on the tree with this plan and its four item
files in, held still by a content digest before and after each whole-tree run; the logs are under
`dev-dist/p17/` and every rung was RUN, never PIPED, and read by exit code (section 4, v0.16).

```
GATE EXIT=0, zero lines beginning FAIL, 15 chain entries   (dev-dist/p17/gate-declared.log)
32 file(s), 858 assertions, in node 24.20.0, deno 2.9.6, chromium, firefox and webkit
1281 assertions at L6, 0 failed, 46 real runs on fyflow-scheduler 0.5.2, in node and deno
spec        - 7 documents, 51 examples, 99 rules
markdown    - 114 documents, 4959 relative links, 250 anchored
register    - 207 questions, 154 open, 2 deferred, 51 resolved, AFTER this declaration's three rows
selftests   - 7/7 completed, 7 ok, 446.1 s wall, 5 lanes; check-markdown 37/37 caught, 7/7 bounded
digest      - cde3b60a9d343c8e over 279 files, before the gate and after it, identical
```

**The five-runtime claim is measured, not inherited**: `npm run gate` runs `test:browser`, which is
chromium only, so `npm run test:browser:all` was run for firefox and webkit — exit 0, 32 / 858 in
each, `dev-dist/p17/browser-all-declared.log`. **858 counts `test()` cases and 1281 counts individual
assertions ([Q98](../open-questions.md)) — they are never added.** The numbers are P16's retro's,
which touched documents only, and are RE-TAKEN here rather than inherited from it.

**The census parser is P15's, unchanged** (`dev-dist/p15/census.mjs`): **204 / 151 / 2 / 51** before
this declaration's rows and **207 / 154 / 2 / 51** after, 45 ids in both tables, 207 of 207 in
exactly one cluster cell, 0 aborts. **And it earned its run the same way it did at P13's retro**:
the three rows were first written WITHOUT a Status cell, the parser did not abort — a three-column
row is the Resolved table's shape — and reported **151 / 54**; found by reading the count against
the line above it, not by the parser. [Q157](../open-questions.md)'s retro defect, reproduced at a
declaration.

**[Q142](../open-questions.md) was checked rather than assumed.** This declaration adds four documents
under `doc/work-items/` and one under `doc/plans/`; `M4`'s two-directory fixture, measured on a
scratch copy outside the repository, is **3642 against a floor of 3960** — up from 3610 at P16's
retro, a margin of 318 — so W58's retune holds and no floor moves. `check-markdown` self-test
37/37 caught, 7/7 bounded, inside the gate above.

**No file outside section 1 rule 5's record step was edited** — the declaration's whole diff is this
plan, four work-item files, the register and the three indexes.

## Record

*Filled in at the join, after the work items are merged. Per-item rows as each lands.*

**W61 — done 2026-09-12, ADR 0051 taken.** `spec/flow-definition.md` v0.18 with `FD-V35`-`FD-V37`
and `FD-C6`, `FD-C5` byte-identical; `Registry.languages` and the two-halved `LanguageAdapter`;
the driver adding `transform` only when declared; the envelope worker evaluating in `run()`; the
helper writing a language's worker URL only where a node of the type transforms; the adapter
conformance suite over a FAKE language. **Predictions 1 and 3 CONFIRMED** (0 on every existing
test, byte-identical dispatch; the evaluation reverted costs 14 at L1, 0 at L2-L5, 0 at L6).
**Prediction 2's reversal condition measured REAL** — a `setup()` throw leaves the task `pending`
forever and the run never hears of it — and avoided by the maintainer's stop-and-ask choice (a load
failure remembered in `setup()`, thrown from `run()` as the task's), so no `FD-R` and no node kind;
the inner worker's own `setup()` throw is [Q266](../open-questions.md). L1-L5 **36 / 958** in five
runtimes, L6 **1281 / 46 unmoved**, spec **7 / 55 / 103**, census **209 / 156 / 2 / 51**. Readers
10 / 1 and 66 / 10 / 3, overlap 1. Rule 8 93 probes: 1 control green, 81 caught, 10 declared ceilings each RUN against its rung, 1 revert measurement, 0 undeclared survivors, 0 crashes, 0 against declaration on the final pass — 1 abort re-anchored and then caught (a13, an anchor the adequacy fix moved) and 1 author probe rewritten (r7, first aimed at the wrong branch). Late exceptions **two** (the L6 byte walk's
field lists in `examples/`, one cause). Q266-Q267 raised; Q184, Q253 extended; Q268-Q269 spent.
`W61` outside `doc/` grepped and recorded in the item's file.

**W62 — done 2026-09-13, ADR 0052 taken.** `fyflow-orchestration/jsonata` in both manifests,
`jsonata` 2.2.2 declared in `dependencies` at the exact pin (the maintainer's choice with the
optional peer and `optionalDependencies` priced by consumer installs — the tarball ships no code in
any shape, so `npm pack` prices only the manifest) and `npm:jsonata@2.2.2` in `deno.json`, because
no JSR package carries it; `RT-R12` in `spec/runtime-targets.md` v0.11, `S14` (the reach) and `S15`
(the declaration, both exports, the adjacent fields — `bundledDependencies` included, after the
adequacy reader shipped the engine's files in the tarball through it); the conformance suite passed
on the real adapter with ONE change, an optional `workerHalf` handle, because a browser bundle's
`import.meta.url` is the bundle itself and six clauses were red in three browsers (Q261, the
maintainer's choice). **Prediction 4 REVERSED**: `$shuffle` draws from `Math.random()`, found in the
engine's own bind list and confirmed by the walk over all 63 built-ins (61 observed with a defined
value; only the four differ); **Q265 decided UNBOUND** — five names by name. JSONata throws plain
objects and marks the arrays it builds; both halves re-throw as `Error`s and the worker half hands
out plain values at every depth. Fact 6 re-taken inside the wrapper: threaded, a thousand-branch
reduction adds a third to a half of the thread's own clone, a filter-and-reshape two to three; inline
the transform is the whole cost. L1-L5 **38 / 979** in five runtimes, L6 **1281 / 46 unmoved** (the
revert costs 0 — W63's number to move from), spec **7 / 55 / 104**, census **212 / 159 / 2 / 51**.
Readers 13 / 3 and 21 / 17 / 7, overlap 1. Rule 8 97 probes: 1 control green, 71 caught, 23 declared
ceilings each RUN against its rung, 2 measured, 0 undeclared, 0 crashes, 0 against declaration on
the final pass — 6 aborts across the passes and 2 ceilings that were catches on the shipping tree,
every one the instrument or a value this item moved. Late exceptions **five** (the conformance suite
file, both locks, `AGENTS.md` section 13, and check-scheduler's self-test — its `D8` probe anchored on
a two-line `imports` block the `jsonata` mapping made three, found by the first gate over the final
tree), zero undeclared. Q270-Q272 raised; Q252, Q261 extended;
Q273 spent. `W62` outside `doc/` grepped and recorded in the item's file.

**W63 — done 2026-09-13, no ADR: THE EXIT ARTIFACT EXISTS.** `examples/flows/transformed.flow.json`
runs on a real `FyflowScheduler` in **both** L6 runtimes: a typed `map` branch RESHAPES its own item
through a declared transform reading the map's settings as `$settings`, two typed scorers arrive at a
join, and the join's typed successor declares `transform: { lang: "jsonata", expr: "$sum([*.score])" }`
with **no reshaping node** — its worker receiving **990** as `input` at arity two, **400** when a
decision routes one branch away (P1's own case under `live-token`), and **0** — the NUMBER, not
`undefined` — when both are routed away and `live-token` fires the join over `{}`: **[Q263](../open-questions.md)
as three rows**, every value what the worker RECEIVED, read off the outcome record and never a literal
the row alone carries, with the arity pair asserted as a difference. The `Echo` pool that evaluates
the expression is a real THREAD in both runtimes, loading `fyflow-orchestration/jsonata` by its module
URL, and every result it returns reports the fresh realm it ran in; every reshaped item's engine-built
array arrives PLAIN (`markedKeys: []`, the walk's reach beside it). **Decision 5 end to end** in
`transform-fails.flow.json`: two non-optional typed nodes whose transforms fail at run time (`T2002`,
an author who meant `&`; `$now()`, `UNBOUND`) are retried once under the type's policy, parked
`user_action` with `TransformFailed`'s message on two observers, resolved by a person, and the run
completes — beside a typed node with no transform receiving `FD-C5`'s two keys to the byte and one
transforming an ordinary edge's value successfully, the fourth of `FD-C5`'s kinds. **What reverting
each item costs at L6, on the tree that ships, every existing row unmoved: W61 52, W62 19 (from
W62's 0), W63 52.** L6 **1501 / 50** in both runtimes from 1281 / 46; L1-L5 **38 / 979 in five
runtimes, unmoved**; spec unmoved; the corpus split 16 / 166 / 150 (two declared spec exceptions).
Readers 7 / 1 and 18 / 8 / 2, overlap 1 — the conformity reader a README count stale within the hour;
the adequacy reader the two CONTROLS of a cross-row block absent from its membership list (a validator
accepting everything green in both runtimes), the thread claim with no observer, and `FD-C5`'s first
kind uninstantiated with a successful transform. Rule 8 82 probes: 1 control green, 62 caught, 13
declared ceilings each RUN against its rung, 6 measured, 0 undeclared, 0 crashes, 0 aborts, 0 against
declaration on the final pass — the author pass read two real survivors (a zero-retry declaration
inert against the scheduler's zero default; the marker walk's depth with one observer), two crashes
and an abort that were the instrument, and one ceiling caught against its declaration. Late
exceptions two (`AGENTS.md`; the split's second move), zero undeclared. Q274-Q276 raised, Q263
shown and not resolved, Q277 spent; `W63` outside `doc/` grepped and recorded in the item's file.
**The plan's predictions table is the retro's to judge.**

**Exit artifact.** EXISTS — [W63](../work-items/w63-a-transformed-join-on-real-workers.md)'s four
L6 rows on a real `FyflowScheduler` in both runtimes: a typed join successor declaring
`$sum([*.score])` with no reshaping node, receiving 990, 400 and 0 at arities two, one and zero; a
typed map branch reshaping its own item through `$settings`; and two transforms failing at run time
on non-optional nodes, retried once under the type's policy, parked, resolved, the run completing.
**What reverting each item costs in L6 failures, on the tree the plan ships: W61 52, W62 19, W63 52.**
L6 is **1501 assertions over 50 real runs**, from 1281 / 46 at this declaration.

**What the plan answered.** *(Written at W63's close; the retro's is the reading that counts.)* A
node may declare a TRANSFORM — `{ lang, expr }`, in a language the registry names — applied in the
TYPE's worker wrapper and never in the driver, so the worker receives the expression's result as its
`input` and the driver's whole part is one key; the language is JSONata, as a sub-path, five names
unbound; a transform that fails is the task's failure. Three of four predictions confirmed; the one
reach prediction reversed from the engine's own source before its probe ran. Facts 1-9 held, fact 8
superseded by W61's own design (the wrapper KEEPS the third key and consumes it). Q263-Q276 used,
Q277 spent, W64 unissued, ADR 0051 and 0052 taken.

## Retro

**Run 2026-09-15, after W61, W62 and W63 were done. `doc/workflow.md` section 6 pass 3, and it
takes that document to [v0.18](../workflow.md) — TWO changes adopted, SIX refused.**

P17 asked *what may a node DO to its input before its worker sees it?* Three items, six reader
passes, two ADRs, and an exit artifact on real workers in both L6 runtimes. At declaration:
`spec/` **7 / 51 / 99**, L1-L5 **32 files / 858 cases**, L6 **1281 / 46**, register
**207 / 154 / 2 / 51**. It closes at **7 / 55 / 104**, **38 / 979**, **1501 / 50** and
**215 / 162 / 2 / 51**. What a node may do is declare a transform in a registered language, evaluated
in its type's wrapper (ADR 0051); the first language is JSONata as a sub-path, its engine a declared
dependency at an exact pin (ADR 0052); and what the exit artifact shows is [Q263](../open-questions.md)
as three rows — the same expression a different type at each arity, a number at all three because
the plan chose the array form.

### Name the rung, and it is this retro's shape

| | defect | rung |
|---|---|---|
| W61 | a wrapper whose `setup()` throws leaves the task `pending` forever and the run never hears of it | **none** — measured at the declaration step, before the stop-and-ask; the road W59 built still hangs ([Q266](../open-questions.md)) |
| W61 | the wrapper's memo keyed by expression TEXT alone — one language silently receiving another's compiled expression | **none** — adequacy reader; the author's own probe had keyed it by LANGUAGE and been caught (the hole in the direction the probe did not take) |
| W61 | the real-pool `BACKENDS` narrowed to `inline` with 953 unmoved, because the browser's parity check forced the loop INSIDE a case | **none** — adequacy reader; a case count cannot see a loop inside a case |
| W61 | `FD-V37`'s *reported alone* with no COUNT observer | **none** — adequacy reader |
| W61 | the conformance suite asserted a COUNT of three where the spec and ADR said BY NAME | **none** — conformity reader |
| W61 | a probe's `'$'` mangled by `String.replace` — a harness copied from W59's | **none** — reading the failure lines ([Q184](../open-questions.md)'s shape) |
| W61 | an anchor that could not match because the file carried a NUL byte the author's tool had written, green at every rung | **none** — `grep` calling the file binary ([Q267](../open-questions.md)) |
| W61 | `spec/README.md`'s HEADLINE refusal count reverted to 32 at `check:spec` exit 0, because `C4` read the LAST count in the row | **none** — the author's own set (`e7`), closed by a `C4` clause |
| W61 | the plan's facts harness went vacuous at exit 0 on the item's first edit to the envelope line | **none** — untracked ([Q253](../open-questions.md)) |
| W62 | in a browser bundle `import.meta.url` is the bundle itself, so `import(adapter.worker)` yielded no default export | **L1 in three browsers — it FIRED**, six clauses red, read correctly ([Q261](../open-questions.md), the maintainer's choice) |
| W62 | JSONata throws PLAIN OBJECTS, not `Error`s | **L1 — the conformance suite's `instanceof Error` clause FIRED** on the real adapter |
| W62 | JSONata MARKS the arrays it builds with own keys that survive a thread | **none** — measured at the declaration step; the array-element depth found by the adequacy reader |
| W62 | `$shuffle` draws from `Math.random()` — prediction 4 | **none** — the engine's own bind list, read before the probe ran |
| W62 | `deno publish --dry-run` proves the presence of `node_modules` and nothing about the declaration | **none**, and none can be built ([Q252](../open-questions.md)) |
| W62 | a probe's `deno check` rewrote `deno.lock` outside the probe's restore set | **the harness's DIGEST — it FIRED** (v0.17 change 1), and the lock joined the restore set by a no-op edit |
| W62 | six anchors moved under the item's own edits; two ceilings became catches inside the item | **rule 7 (b) and v0.17's dated-ceiling clause — both FIRED as designed** |
| W62 | `bundledDependencies: ["jsonata"]` shipped the engine's eight files in the tarball with every check green | **none** — adequacy reader; W57's adjacent-field shape one field over |
| W62 | two of four carried error fields with no observer; `S14`'s form clause weakened to a prefix with its self-test green; two `S15` fields unprobed; the threaded half bound by one expression | **none** — adequacy reader, every one a direction the author's 79 never took |
| W62 | section 13's *not yet on this tree*; the pin literal in prose; `package-lock.json` undeclared | **none** — conformity reader |
| W62 | the first gate over the final tree RED on ONE line — `check-scheduler`'s `D8` probe anchored on a two-line `imports` block the `jsonata` mapping made three | **the gate's self-test — it FIRED and was READ correctly**, rule 7 (b) on a file in nobody's `Owns` |
| W62 | `make-copy.sh`'s `git add -A` failed silently on Windows (`core.longpaths`); the Bash tool collapsed `\n` inside a heredoc twice | **none** — instruments |
| W63 | the `Echo` type's `maxRetries: 0` was INERT — the scheduler's default is zero retries, stated nowhere | **none** — the author's own set (`a12`), a survivor read as real ([Q275](../open-questions.md)) |
| W63 | the marker walk's DEPTH had one observer — a walk stopping at the top level reported the same empty list | **none** — the author's own set (`d4`), closed by the walk's reach |
| W63 | a comment-line prefix anchor; the browser runner's `FAIL` at two spaces read with the Node runner's four; W61's revert anchor for an envelope line that is one expression now | **none** — three instrument defects, each read against its log ([Q276](../open-questions.md)) |
| W63 | a ceiling declared with a wrong mechanism — the reach clause refuses a query-string spelling of the entry | **none** — the author's own set, CAUGHT against declaration and kept as the catch |
| W63 | a deleted MIDDLE row renumbers every run after it — 15 of a deletion's 17 failures were the next row's ids | **none** — a measurement read against what it claimed ([Q274](../open-questions.md)) |
| W63 | the two CONTROLS of the new cross-row block absent from `CROSS_ROW_SUBJECTS`: a validator accepting everything green in both runtimes at 1498 | **none** — adequacy reader; **and this retro found the same shape live in W58's block** |
| W63 | the thread claim with no observer, declared a ceiling with a reason about the observer | **none** — adequacy reader; obligation (c)'s LIMIT's closing sentence, again |
| W63 | `FD-C5`'s first kind carried by no SUCCESSFUL transform; the Scope sentence *one flow carries the four kinds* false | **none** — adequacy reader; the enumeration clause's third short instance |
| W63 | `examples/README.md` at 1497 while `l6.ts` declared 1499, within the hour; a stated reason about JSON text that was false | **none** — conformity reader (the reason: both readers) |
| W63 | the corpus split moved in two spec sentences, twice | **L1 — it FIRED as predicted, both times**, read correctly |
| W63 | the register's headline stale by W62's own three rows (209 / 156 against the parser's 212 / 159) | **none** — the record step reading the count against the line above it; the parser prints the sum and compares it to nothing |

**Thirty-two defects; SEVEN had a rung; all seven FIRED and all seven were READ correctly** — three
of them the instruments this document requires (the digest, rule 7 (b), the dated-ceiling clause)
doing exactly what they were adopted for, two a check's self-test, two the L1 suites. **Twenty-five
have no rung, and eleven of those are in the INSTRUMENTS** — harness anchors, runner patterns, an
untracked facts harness, a copy script, a shell tool — which is the largest share of any plan since
P11's seven of seven.

### The two changes

1. **Obligation (d)'s membership clause gains: the CONTROLS beside the claims are members.** v0.14
   wrote *a count is not a membership* and W47's `CROSS_ROW_SUBJECTS` answered it — one subject per
   block, so a deleted block fails naming what it was about. **W63 extended that list with eight
   subjects for its ten assertions and left out exactly the two that make the other eight
   non-vacuous**: the `FD-V37` positive fixture and *that set is not empty*. Its adequacy reader
   deleted the fixture, made the validator accept everything, lowered `CROSS_ROW` and
   `DECLARED_TOTAL` by one, and ladder L6 was green in BOTH runtimes at 1498, the surviving clause
   comparing `[]` to `[]`. **This retro then measured W58's block the same way — its retry control
   deleted with the two counts lowered — and it was green too**: two occurrences in two items, two
   plans apart, and the second was live for a whole plan under the clause that was written to
   prevent it. *A membership over claims binds the vacuity of nothing.* So: where a block pairs a
   claim with the assertion that makes it non-vacuous, the list names both; both are named now.
2. **Obligation (a)'s enumeration clause gains: every member is instantiated under the SAME claim.**
   v0.17 wrote *where a rule enumerates its values, the set is that enumeration*, and W63 followed
   it: `FD-C5`'s four kinds of `input` each carried a transform somewhere in its two flows. **But
   the exit-artifact flow's entry must return an array for the map, so it is an untyped
   `SplitWorker`, and the ordinary-edge kind carried a transform only on the two nodes whose
   transforms FAIL** — the claim the enumeration was cited for (*the worker receives the REPLACED
   input*) was never true of that member, and the item's Scope said *one flow carries the four
   kinds* of a flow that carries three. One occurrence, and the argument for why it generalises is
   in the clause's own words: an enumeration is of the values a CLAIM ranges over, and a member
   instantiated under a different claim is a value of the kind and not an instance of the claim.
   It is the third time in two plans the enumeration clause was followed and short (W58 bound by
   count, W59 one member missing, W63 one member under another claim), and each time the reader
   found the member by asking what the CLAIM said of it. The fourth branch of the failure flow is
   the instance.

### Six refused, each with a measurement

- **A `doc/` check, the SIXTEENTH time.** Six stale counts or expiry-dated claims this plan:
  section 13's *not yet on this tree* and the pin literal (W62), `examples/README.md`'s 1497 within
  the hour and *thirteen worked flows* over a directory of twenty-two (W63), README's *twenty-one*
  real runs from P6, and the register's headline at 209 / 156. **Exactly ONE of the six is a number a
  check could compare without reading English** — the register's headline against the census
  parser's own sum, which that parser prints and compares to nothing — and the parser is untracked
  in `dev-dist/` ([Q253](../open-questions.md)'s shape, recorded there). The other five are the
  standing ground: a sentence, not a number.
- **An `Owns` pre-declaration rule, the SIXTH plan running — with P16's proposed procedure TRIED.**
  Late exceptions ran **2, 5, 2** — nine, zero undeclared. W63's table was SEEDED from W61's and
  W62's late tables (the brief did it, exactly as P16's retro recorded as *worth trying*): the two
  spec split sentences fired as predicted, `AGENTS.md` fired as predicted, and nothing unpredicted
  fired. **One occurrence of the procedure working, and it is again a claim about a plan's later
  items** — a first item has no previous table. Recorded as the second datum, not adopted
  ([Q157](../open-questions.md)).
- **A harness requirement that a CRASH verdict is read against every FAIL pattern the runners
  print.** W63's `e6` was a catch read as a crash because the browser runner indents `FAIL` two
  spaces and the harness read four. One occurrence, closed in the harness; [Q276](../open-questions.md)
  records that the patterns live in every harness as literals and nowhere the runners declare them.
  A rule would restate *read the failure lines*, which the harness did — against the wrong pattern.
- **A rule that a declared value must be one the default cannot supply.** W63's `maxRetries: 0`
  was inert against the scheduler's zero default and the first probe to delete it said so. One
  occurrence; rule 8 obligation (a) already deletes the declaration, which is how it was found.
  [Q275](../open-questions.md) records the fact the scheduler's reference does not state.
- **A check that an item's Scope-Out is consistent with its Outputs.** W63's Out sentence bound
  out the second document its Output (3) could not do without. One occurrence, a sentence corrected
  under pass 3 rule 6; both readers read it the same way.
- **A restore set that covers files a RUNG rewrites.** W62's `deno check` rewrote `deno.lock` outside
  a probe's restore set and the DIGEST caught it — v0.17 change 1 working — and W62 closed it with a
  no-op edit on the lock. One occurrence; the clause's LIMIT is recorded in the judgment table
  below rather than as a fourth requirement.

### The predictions: three of four CONFIRMED, the reach prediction REVERSED

| # | kind | verdict |
|---|---|---|
| 1 | derived | **CONFIRMED** — W61 cost 0 on every existing test at L1-L6 and the two P12 flows and `typed.flow.json` dispatch byte-identically with and without `languages`; W63 then added one clause to every existing row without moving any row's own numbers |
| 2 | derived | **CONFIRMED, and its reversal condition was MEASURED REAL and DESIGNED AROUND** — a wrapper whose `setup()` throws IS a worker error the run never hears of (the row's own reversal clause, verbatim), so the maintainer chose to remember a load failure in `setup()` and throw it from `run()`; no `FD-R`, no node kind, and the road W59 built still hangs ([Q266](../open-questions.md)). A new shape: a prediction held because the item steered around the condition that would have reversed it |
| 3 | derived | **CONFIRMED and measured to the row's own wording** — the evaluation deleted cost 14 at L1, 0 in every L2-L5 suite, 0 at L6 at W61, and **52 at L6 after W63** |
| 4 | **reach** | **REVERSED — from the SOURCE, before the probe ran.** `$shuffle` draws from `Math.random()`, found in the engine's own bind list; the walk over all 63 built-ins confirmed exactly four differ. The rule was stated as a property and the list grew, which is what the row said would happen |

**Three of four, and P10's retro's reading holds again**: three are derived from the declaration's
facts and test the inference, and 4 is the one reach prediction and the only one that could have
reversed. What is new is prediction 2's shape — its reversal condition was measured TRUE and the
prediction held anyway, because the item's stop-and-ask chose the road that avoids it.

### v0.17's three changes, and the ceiling re-run

| v0.17 change | What would show it was wrong | **P17's verdict** |
|---|---|---|
| **Rule 8's harness: per-edit anchors, an abort that undoes, a content DIGEST** | a half-applied probe measures nothing again, or the tree moves unseen | **Right, EXERCISED eight times, and with a LIMIT found.** Eight aborts across the plan (1, 6, 1), every one undone with the digest identical and every one re-anchored; **and the digest caught a tree that MOVED with no probe reporting it** — a rung's `deno check` rewriting `deno.lock` outside the probe's restore set. The limit: the restore set is the probe's EDITS, and a rung may write a file the probe never touched. W62 closed it with a no-op edit on the lock; recorded, not adopted |
| **Obligation (a): where a rule enumerates, the set is the enumeration** | an author is one member short again | **Right, FOLLOWED, and short a THIRD time — extended (change 2).** W61 instantiated all four of `FD-C5`'s kinds and W62 all five unbound names, both under the claim; W63 instantiated Q263's three arities under the claim and `FD-C5`'s first kind under a different one |
| **The dated-ceiling clause: the item that moves the value re-runs it** | a ceiling is found expired at the retro again | **Right, and it fired INSIDE the items, which is what it was written to do.** W62 found two of its own ceilings become catches before it shipped (`p4` once `eval` joined the list; `r18` once *observed* required a defined value); W63 re-ran W62's `rev62` from **0 to 19**, the one number its rows existed to move, and the three `RUN_FLOOR` ceilings unmoved. **This retro re-ran all forty-six ceilings the three items declared** — ten, twenty-three and thirteen, through each item's own harness — and **every one holds**: forty-three as declared, three on re-anchored text (W61's two `RUN_FLOOR` probes, moved by W62 and already re-run by W62 and W63; W59's `c5`, whose key-expression anchor W63's `echo` arm made ambiguous). **Zero catches, against P16's two of twenty-three and P13's two of eleven**, and the reason is the clause: the catches were found in the items |

### The measurements

**Readers: six passes, none empty — 10 / 1, 13 / 3, 7 / 1 blocking, against mutation counts of
66 / 21 / 18 with 10 / 17 / 8 survivors and 3 / 7 / 2 blocking.** Overlaps **1, 1, 1** — the
**thirty-fifth, thirty-sixth and thirty-seventh** measurements, inside the 0-4 band, none primed.
The split held in all three: the conformity reader found claims that were false (a count where the
spec said by name, a sentence with an expiry date, a pin in prose, an undeclared lock, a count stale
within the hour, a reason that was false, a scope word); the adequacy reader found bounds that were
not there (a memo key, a loop inside a case, a count observer, two error fields, a depth, a prefix,
two fields, an array-valued field, one expression carrying a threaded half, two controls, a realm,
a kind, four L1-owned clauses green at L6).

**Rule 8 across the plan: 272 provocations, 214 caught, 46 declared ceilings all RUN in the items
and all RE-RUN here, 9 measurements, 0 undeclared survivors, 0 crashes and 0 against declaration on
every final pass; 8 aborts, every one re-anchored.** The author passes read **four REAL survivors**
between them — `spec/README.md`'s headline count (W61), the by-name loop sliced to one name (W62),
the inert zero-retry declaration and the marker walk's depth (W63) — and every one was closed
before a reader saw the tree; three crashes and three wrong declarations on those passes were the
instruments and were read as such. **Late exceptions 2, 5, 2 — nine, zero undeclared.**
[Q142](../open-questions.md) did not fire: the two-directory fixture was **3694** at W61's end,
**3741** at W62's, **3766** on the tree W63 ships and **3781** after this retro (`doc/workflow.md`'s new links are in both fixtures' universe; the plan file's are cut), against 3960;
`M3`'s one-directory fixture 88 against 90 throughout. **Census CONFIRMED for the SEVENTEENTH plan
running — 215 / 162 / 2 / 51**, 0 aborts, 215 of 215 in one cluster cell; this retro raises no
question and extends [Q253](../open-questions.md). **The confirming `npm run gate` over the tree
this retro ships: EXIT 0, zero lines beginning FAIL, digest `621b4e7c2cb49927` over 296 files before
and after** (`dev-dist/w63/retro-gate.log`; markdown 116 / 5151 / 261, L6 1501 / 50 in both
runtimes) — run after the last document edit, with this sentence the one edit after it.

### What the plan taught, beyond its own question

- **Three facts about the engine nobody had measured decided the adapter's shape**, and none was in
  the declaration's nine: JSONata throws plain objects, marks the arrays it builds, and its
  `$shuffle` draws from the clock's neighbour. The plan's facts were about the DRIVER and the
  engine's API; the adapter's shape came from the engine's VALUES.
- **The scheduler's reference is silent on one more fact this plan needed**: the default retry
  budget is zero, learned by deleting a declaration and watching nothing change
  ([Q275](../open-questions.md)). P16 found five such silences; this is the sixth.
- **A ceiling with a reason about the observer is a hole, in the item's own author's hand** — the
  thread claim (W63 `e10`), obligation (c)'s LIMIT's closing sentence one plan after it was
  written, found by the reader that sentence describes.
- **The instruments were a third of the defects** and every one was legible only by reading a log
  against what the probe claimed: an anchor matching a prefix, a runner's indentation, a previous
  item's anchor, a heredoc, a copy script, a NUL byte, an untracked harness. No rung covers an
  instrument and the plan's own reading did.

### Ids

W61-W63 used, **W64 CLOSED as reserved and never issued** — its three conditions did not fire, and
the third is answered by name: Q263's singleton rule needs no adapter-side normalisation, because the
array form `$sum([*.score])` is a number at every arity and the exit artifact shows it. Q263-Q276
used, **Q277 spent and not reused**; ADR 0051 and 0052 both taken. **The next plan starts at W65,
Q278 and ADR 0053.** Its subject is written down: P18, *what a node type SAYS about its input and
output* — schemas, and a sample-based pre-flight over a transformed edge, with the adapter's `check`
hook and Q263's three arities as its inputs.
