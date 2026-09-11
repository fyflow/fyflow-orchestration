# P16 — What is a node type, and what does the library owe the scheduler to have one?

**Status:** DRAFT — written 2026-09-11 from a maintainer conversation on the tree at `82ff3ba`
(P15 declared, nothing started) and **re-verified the same day on `b317486`, after
[P15](p15-what-a-run-retains-and-what-a-result-may-be.md) completed and its retro moved
`doc/workflow.md` to [v0.16](../workflow.md)**. **Not declared.** Declaring it means the record-step
files below are updated and the baseline gate is re-taken on the tree it starts from. *Read every
status from the item's own file, never from this line.*

**Baseline:** `b317486` — `doc/workflow.md` [v0.16](../workflow.md), **P1-P15 complete and retro'd,
no plan running.** P15's last commit records `GATE EXIT=0` with zero lines beginning `FAIL`; *this
draft did not re-run the gate*, and the declaration does. *(This paragraph read *"SERIAL AFTER P15 —
W53 measures the driver"* while P15 was in flight; P15 closed the same day, so the serial constraint
is discharged and every fact below was re-taken against the tree it left.)*

**The question in one sentence.** A flow names a worker pool by a string and hands it a payload,
and that is the whole of what a node can say about the thing that runs it: no retry policy, no
resource group, no per-node settings, no statement of what the worker expects or returns. **A node
type** is the layer that would carry all of that — and it cannot be built while `src/` is forbidden
to import the scheduler it would configure.

**Exit artifact:** one flow on a real `FyflowScheduler` in **both** L6 runtimes, where two nodes of
**one** node type run with **different settings**, one of them **retries once** under a policy the
node declares, both hold a **resource group** the type declares, and the worker receives its settings
and its input as **one envelope** — with what reverting each of the three decisions costs, measured
in L6 failures.

**Reserves:** W57-W60 (W60 expected unused), Q248-Q262, ADR 0048-0050 (0050 expected skipped).
*Derived from P15's line — `W53-W56, Q233-Q247, ADR 0046-0047` — and confirmed against what P15's
retro wrote into `doc/README.md` on closing: "The next plan starts at W57, Q248 and ADR 0048." The
register's highest row is Q246, Q247 is spent and not reused, and ADR 0047 was skipped, so the three
blocks are free.*

---

## Why this plan, and why now

**Three things a flow author wants are unsayable today, and each was found by trying to say it.**

1. **A node cannot declare how it fails.** `retryPolicy` is a per-task field the scheduler has
   carried since 0.2.1 and the driver never sets it: `dispatch` hands `createTask` exactly four
   fields — `id`, `workerType`, `payload`, `optional` (`src/driver/driver.ts:1839`). `optional` is
   the one scheduler task field a node *can* set, and it is the precedent this plan generalises.
   [Q16](../open-questions.md) has asked who owns retry since P1 and has no owner.
2. **A node cannot carry configuration.** A `task` node has six keys and `FD-V17` refuses a seventh.
   The only per-task channel to a worker is `payload`, so today "one worker, two configurations" is
   spelled as two `workerType`s with two pool `config`s — which is exactly how `examples/` runs nine
   roles through one worker file. That works for a harness and does not scale to a library whose
   consumers write flows.
3. **Nothing says what a worker expects.** The scheduler's contract is `run(payload: any)`, and the
   library's `workerTypes` registry checks a *name*. [W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)'s
   first flows ran on real workers and every map instance scored **zero**, because every shipped
   worker read `payload.confidence` and under a `needs` the payload is exactly the composed object —
   green at every rung. That is the defect a declared input shape refuses at construction, and it
   is **out of this plan** (see *Slices beyond this plan*), because it needs the layer this plan
   builds first.

**And the wall in front of all three is a decision whose forcing fact expired.**
[ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rule 1 says the published library depends on the scheduler *not at all*, and `S7`, `S8` and `S9` in
`scripts/check-source.mjs` refuse the import, the manifest entry and the bundle. Read its context
section: the fact that forced it was **context fact 1, the pinned version was on no registry** —
0.3.0 existed only in a sibling working tree, so a runtime dependency was undeclarable and a
`peerDependency` was rejected as *"a false statement in a manifest"*. That fact expired on
2026-08-31, and [ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
superseded rules 3 and 5 on exactly that ground while leaving rule 1 standing as if it had been
independent. Context fact 2, that Node could not load the source, expired at 0.5.2
([S9](../scheduler-upstream.md)). **Rule 1 is the last clause of that ADR resting on nothing it was
decided on**, and a node type that defines its worker, its pool and its resource groups is
scheduler-specific code by construction. Deciding this is the plan's first item, not a side effect
of its third.

**Why now.** P15 answered what a run *retains*
([ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md))
and what a result *may be* (`OR-R11`, `OR-R12`); this plan answers what a node *is*. Nothing here
depends on P15's answer, and two of its results are inputs: a result crosses the listener boundary
as a **value** (`OR-R11`), which is what a typed node's declared shapes will range over, and a
region's collection is **released when its join becomes terminal** (ADR 0046 rule 3), which is why
a transform on a join's successor is the last thing that sees the collection whole. One thing P15
names as its own follow-on — [Q219](../open-questions.md), making a region's collection referenceable
— is untouched by this plan.

## What was measured before this plan was drafted

**Five facts, taken read-only on `82ff3ba` with the tree held still, none of them a gate, and
every citation below re-checked on `b317486` after P15 landed.** The harness is two files in this
session's scratchpad, outside the repository; a declaration would move them to `dev-dist/p16/` and
re-take them. *(Section 6's held-still rule is why nothing here ran `npm run gate` or rule 8's set:
P15's W53 was taking its own baseline in the same tree at 09:44. P15's three items moved
`src/driver/driver.ts` by 166 lines and none of the four fields `dispatch` hands `createTask`; the
line numbers below are the post-P15 ones.)*

**1. The driver hands the scheduler four fields and the scheduler accepts eight.** `TaskFactory`'s
parameter type is `{ id, workerType, payload, optional }` (`src/driver/driver.ts:430`, and the one
call site at `:1839`). `new
FyflowTask(config)` at 0.5.2 destructures `{ id, workerType, payload, optional, retryPolicy,
workerGroups, handleRejection, limitKey }` (`dist/types/core/FyflowScheduler.d.ts:98`). **Four of
the eight are unreachable from a definition**, and they split three ways: `retryPolicy` and
`workerGroups` are **static per node**; `limitKey` is **per workload** — a bucket for a keyed rate
limit, a tenant id — so it cannot be a literal in a document and belongs to the `needs` grammar if
it belongs anywhere; `handleRejection` is **irrelevant**, because the driver routes on events and
never awaits the task promise.

**2. An unknown resource-group id on a task is SILENTLY IGNORED by the scheduler.** Measured: a
`FyflowScheduler` with one `ConcurrentLimitGroup` named `g`, one inline pool, and a task carrying
`workerGroups: ["nope"]` — `addTask` does not throw, no `resource.blocked` fires, the task runs and
settles `done` with `task.running, task.completed`. **So a typo in a group id is caught by nothing
downstream**, and the only place it can be caught is a registry the validator checks at
instantiation — the third set beside `predicates` and `workerTypes`, which
[ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 3 already prescribes for exactly this shape of error. *(The scheduler's own reference says
`workerGroups` is "added to the pool's groups"; it does not say what an unknown id does. Now it is
measured.)*

**3. [Q71](../open-questions.md) reproduces at 0.5.2, and it is the DOM lib alone.** `const x:
SchedulerLike = s` with `s: FyflowScheduler` typechecks under `lib: ["ES2022"]` and fails under
`["ES2022", "DOM"]` with `TS2322` on `addEventListener`: the DOM `EventListenerOrEventListenerObject
| null` parameter is not compatible with `(e: { detail: unknown }) => void`. `AGENTS.md` section 12
documents the cast and calls it *"a defect in our type, not in yours"*. **An `import type {
FyflowScheduler }` in `src/` closes it by construction, and `S7` forbids that import today.**

**4. The reference already contradicts itself about the version, twenty-one sections apart.**
`AGENTS.md` section 1: *"Install whichever version you like."* Section 12: *"Pin the scheduler at
0.5.2. This library's listener boundary is written against 0.3.0 semantics."* Both sentences are in
the copy a consumer reads first; the second is bound by `check-scheduler`'s `D7` and the first by
nothing. The driver **is** version-sensitive — `task.progress`'s detail shape, the `user_action`
event pair, `task.timestamp` — and the honest statement of that sensitivity is a peer range in the
manifest a consumer's installer reads, which rule 1 forbids.

**5. The scheduler's browser export condition exists and `S9`'s own correction note says so.**
`node_modules/fyflow-scheduler/package.json` exports `.` with `node` and `browser` conditions at
0.5.2, and ADR 0013's correction of 2026-08-30 records that esbuild resolved the browser build into
the test bundle at 55 KB *"happily"*. **So the bundle argument for rule 1 was never about
feasibility** — a scheduler import in `src/` bundles for the browser today — only about the package
being dependency-free, which fact 4 says it already is not in substance.

**What was NOT measured, and is the first item's declaration step:** what a `peerDependency`
costs at L1-L6 (predicted zero, prediction 1); whether `import type` alone satisfies `deno check`
and the browser typecheck; and how many of the 66 `createTask` call sites outside `dev-dist/` (8 in
`AGENTS.md`, 44 across `test/**`, 1 in `examples/run-flow.ts`, the rest prose) change when the
factory gains a default — counted by `grep -c` this session, and the number is a claim about
occurrences, not sites.

## Scope

**In**

1. **Whether the scheduler is a dependency, decided as ADR 0048 superseding ADR 0013 rule 1.** A
   `peerDependency` on `fyflow-scheduler` with a range, `import type` in `src/` first and a runtime
   import for a default `createTask` second, `SchedulerLike` **kept** as the L2-L5 test seam, and
   `S7`/`S8`/`S9` narrowed to what still holds — the browser bundle must still not carry a *working
   tree*, and `deno.json` must still not map a path. Q71 closes; `AGENTS.md` section 12's cast
   paragraph is deleted rather than apologised for.
2. **A node's task configuration**, as declared keys on a `task` node mirroring `optional`:
   `retryPolicy` and `workerGroups`, passed through `createTask`, each with an `FD-V` refusal and a
   fixture, and a `groups` set added to `Registry` so fact 2's silent typo fails at instantiation.
   A driver-level `defaultRetryPolicy` a node overrides, with the merge rule in `spec/`. **This is
   Q16's task half**; the flow half — re-dispatching a node under a new attempt — stays open.
3. **A node type, decided as ADR 0049.** A registry entry that names a worker, pool defaults,
   resource groups, a global config, a per-node **settings** schema and a **payload envelope**; a
   `task` node that names a type instead of a `workerType` and carries `settings`; and a bootstrap
   helper — permitted by (1) — that turns a registry into `workerPools` and `resourceGroups`.
   `Registry` gains `nodeTypes`. A bare `workerType` node is a degenerate type and is **unchanged**.
4. **The exit artifact** on real workers in both L6 runtimes, and what reverting (1), (2) and (3)
   each costs.

**Out** — named rather than left implicit, with where each goes instead

- **Input and output schemas, and edge compatibility.** The most valuable piece and the one that
  turns W43's zero-score flow into a refusal. It needs a schema language, a decidable subtyping
  relation, a rule per `needs` form, and its own ADR — **P17**, in *Slices beyond this plan*, with
  the reason it is not here: this plan's exit artifact must run on real workers inside the plan-gate
  budget, and a type checker over the definition doubles the item count.
- **A per-node INPUT TRANSFORM** — an expression on the receiving node, declared in the flow
  rather than in the type, mapping what `needs` composed into what the worker receives. Its own
  plan, ordered **before** the schema plan in *Slices beyond this plan*, because it is the adapter
  that makes strict compatibility livable without a reshaping task node. **What this plan owes it
  is one wording**: W59's `FD-C5` defines the envelope's `input` as *the value this node receives*
  and names no expression, so a transform slots in between composition and the envelope without
  rewording the rule. [Q251](../open-questions.md).
- **Run-time validation of a result against a declared schema.** The strict-mode plan's, priced there.
- **`limitKey`.** Per workload, so a `needs`-shaped reference and not configuration — fact 1. A row
  in the register, no owner.
- **Flow-level retry** — Q16's other half, and the task id's fourth segment
  ([Q111](../open-questions.md)). Untouched: scheduler retries happen inside one task id and are
  reported on the outcome record's `attempts`, which is the field this plan's exit artifact makes
  non-zero at L6 for the first time.
- **[Q19](../open-questions.md) and [Q22](../open-questions.md)** — RESOLVED by P15 (ADR 0046 and
  W54's `OR-R11`); this plan cites them and reopens neither. **[Q219](../open-questions.md)** — named
  by P15 as its own follow-on.
- **Per-join policy choice, cancellation, durability** — `AGENTS.md` section 11's list, unmoved.
- **`fyflow-react-components`' event envelope** ([Q21](../open-questions.md)). A node type registry
  with schemas is what a visual editor would consume, and `doc/concept.md` section 7 names a visual
  editor a non-goal. This plan builds the registry and says nothing about a UI.

## Decisions taken before fan-out

*Section 7 rule 3: decide, then fan out. Q1, Q2 and Q4 are resolved. Each decision below was taken
by the maintainer in conversation on 2026-09-11 and is recorded here so an item argues from it
rather than re-deriving it; the two that are architectural become ADRs inside the items that
measure them.*

1. **The scheduler is a hard dependency, and the refusal is counterproductive.** The maintainer's
   words. ADR 0048 records the decision with the measurement, on the shape of ADR 0029 and the S9
   note: the forcing fact expired, here is what changing it costs. **The structural seam survives**:
   `SchedulerLike` is what makes L2-L5 run against fakes, and that is a testing decision the manifest
   never touched. **Stop-and-ask:** the peer *range*. `^0.5.2` says "any 0.x above 0.5.2", which is
   false the day upstream changes an event shape again with no changelog; an exact pin in a
   `peerDependency` is unusual and honest. W57 prices both and asks.
2. **Per-node settings reach the worker as an ENVELOPE, and it is the TYPE's contract.** A typed
   node's worker receives `{ settings, input }`, where `input` is exactly what `needs` describes or
   the ordinary edge carries. **ADR 0040 rule 6 is untouched for an untyped node**: no wrapper and
   no reserved key on a payload whose shape the author owns. The envelope is a rule about what a
   *type* receives, stated in `spec/` as an `FD-C` rule beside `FD-C1`, and the alternative — one
   pool per distinct settings variant, settings delivered as pool `config` — is recorded in ADR 0049
   as the road not taken, with its cost: pool capacity per variant rather than per type. **That
   `FD-C` rule defines `input` as *the value this node receives* and not as *what `needs`
   composed*** — so a later transform ([Q251](../open-questions.md)) sits between the two without
   rewording the rule, and W59 is refused a wording that would close that door.
3. **Task configuration is DECLARED KEYS, not an opaque bag.** A `task: {...}` object forwarded to
   `createTask` untouched would be a hole where a typo lives until run time, which is ADR 0002
   rule 3's defect and `FD-V17`'s whole job. The coupling to the scheduler's field names exists
   either way; declaring them makes it visible. One `FD-V` per key.
4. **The node type is a REGISTRY entry and the definition stays data.** `type: "score"` and
   `settings: {...}` on a task node; the worker, the pool and the groups live in the registry the
   consumer passes to the driver, exactly as predicates and worker types do today. **The definition
   never names a file or a URL.** A bare `workerType` node keeps working with no change to any
   corpus flow, and that is a hard constraint on W59: every existing L6 row keeps its numbers.
5. **The bootstrap helper is a separate module of the same package**, not a separate package.
   Decision 1 makes it legal; a sub-path export (`fyflow-orchestration/scheduler`) keeps the pure
   half importable without it. **Stop-and-ask:** whether the JSR publish allowlist in `deno.json`
   should carry it — `S6` compares that list to the tree.
6. **No new node kind.** A typed node is `kind: "task"` with `type` in place of `workerType`; a
   `map`'s branch may be a typed task. `FD-V17`'s key table gains the keys and nothing else moves.
   Prediction 3.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W57 | **The scheduler is a dependency — ADR 0048.** `peerDependencies`, `import type` in `src/driver/driver.ts`, a default `createTask` of `new FyflowTask(config)`, `S7`/`S8`/`S9` narrowed with their probes and `META` entries repointed, Q71 closed, `AGENTS.md` section 12 rewritten and the `check` snippet that needed the cast made a `run` one | `package.json`, `deno.json`, `src/driver/**`, `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs`, `scripts/check-scheduler.mjs`, `spec/runtime-targets.md`, `AGENTS.md` §1 and §12, `doc/decisions/0048-*` | P15's driver items merged | L0-L6 in five runtimes at the declared pre-item numbers; `check:source:selftest` at its new probe count; the section 12 snippet **executed** under `tsconfig.docs.json` with `lib: ["ES2022", "DOM"]`, which is the configuration fact 3 fails in today; rule 8 over every narrowed clause |
| W58 | **What a node says about its own task.** `retryPolicy` and `workerGroups` on a `task` node, `FD-V30`-`FD-V31` (ids to be confirmed against `spec/flow-definition.md` section 5 at declaration), `Registry.groups`, `defaultRetryPolicy`, `TaskFactory` widened, the driver passing both through, corpus fixtures valid and invalid | `src/definition/**`, `src/driver/driver.ts` (the `dispatch` site only), `spec/flow-definition.md` §2 §5 §7, `spec/examples/**`, `test/definition/**`, `test/driver/**`, `AGENTS.md` §3 | W57 | L1-L5 with the new refusals fixtured; **an L6 row where a worker role fails once and succeeds on retry, `attempts === 1` on the outcome record, the first non-zero `attempts` a SCHEDULER has ever set at any rung** (L1's `log.test.ts` feeds 2 and 3 from fixtures); an L6 row where a task carrying a group is `resource.blocked` behind a `ConcurrentLimitGroup(1)` the row holds; rule 8 obligation (e) on `Registry.groups` both ways |
| W59 | **What a node type is — ADR 0049.** `NodeType` and `Registry.nodeTypes`; `type` and `settings` on a task node with `FD-V` refusals for an unknown type, a settings object the type's schema refuses, and `type` beside `workerType`; the envelope as `FD-C5` (id to be confirmed); the bootstrap helper as a sub-path export; the exit artifact | `src/definition/**`, `src/driver/**`, `src/scheduler/**` (new), `index.ts`, `deno.json` allowlist, `spec/flow-definition.md` §2 §3 §5 §7, `spec/examples/**`, `test/**`, `examples/**`, `AGENTS.md` §3 and a new section, `doc/decisions/0049-*` | W58 | L1-L5 in five runtimes; **L6: two typed nodes of one type with different settings on real workers in both runtimes, each worker receiving `{ settings, input }` and computing a different answer from `settings`**, with the two pools built by the helper and a group the type declared; reverting W57, W58 and W59 each measured in L6 failures; `map-with-context` and `map-over-region-output` at the numbers P15 left them (L6 closed P15 at **1061 assertions over 42 real runs**, and those two rows are unmoved by it); **and, per v0.16's obligation (a), the typed-node fixtures include a shape the feature was not built for** — a typed task inside a `fanout` branch and a typed `map` branch — not only the top-level task |
| W60 | *reserved — expected unused* | | | |

Each has its own file under `doc/work-items/` **once the plan is declared**; none exists for this
draft. This table is an index, not the declaration.

**Why serial and in this order.** W57 changes what `createTask` is and what `src/` may import, and
both W58 and W59 build on that; W58's passthrough of `workerGroups` is what W59's type-declared
groups ride on. Every item edits `src/driver/driver.ts`, so section 7 rule 2 makes them serial
whatever the order. **W58 before W59 rather than folded into it** because W58's exit row — a real
retry observed on the outcome record — is the smallest thing on real workers this plan can show,
and a plan whose first two items ship nothing observable is P11's shape.

## Predictions, written down before the items that test them

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **Declaring the peer dependency costs 0 failures at L1-L6** and `import type` costs 0 at L0 in all three typechecks | fact 5, plus that `src/` reaches no scheduler *value* today; not measured under `deno check` | `deno check` refusing a bare specifier `deno.json` does not map — W57 measures it first, and if it fires the fix is an `imports` entry `S8` currently refuses |
| 2 | **W58's retry row is the first non-zero `attempts` produced by a REAL retry, at L6** | `grep -rn 'attempts' test/ examples/` on `82ff3ba`: `test/driver/log.test.ts` asserts `attempts` of **2** and **3** at L1, from **fixture** records fed to the listener, and `examples/**` carries none above 0 — so L1 already proves the field is carried through and nothing proves a scheduler ever set it. *(This row first read "the first non-zero `attempts` at any rung", written before the grep was run; the grep reversed it within the hour, which is section 1 rule 5's WHEN clause on a draft.)* | an L6 row already asserting `attempts > 0`, which the grep says there is not |
| 3 | **No new node kind and no `FD-R`** — every refusal this plan adds is an `FD-V`, and the envelope is an `FD-C` | decision 6, and fact 1's split: everything a node declares here is static | a settings value that must be resolved per workload, which would be `limitKey`'s shape and is out of scope |
| 4 | **`S7` survives narrowed rather than deleted**, refusing a *working-tree* reach and nothing else | ADR 0029's D1-D3, which refuse the same thing at the manifest and the symlink | W57 finding that D1-D3 already cover every case `S7` would keep, in which case `S7` is retired and `check:source:selftest` loses probes rather than gaining them |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| Q248 | **`limitKey` is a per-workload task field with no home.** It is not configuration and not a reference to a node; the nearest grammar is `needs`, which names a node and never a value inside one. Raised here so it is not folded into W58 by analogy with `workerGroups` | no owner |
| Q249 | **Does a node type have a VERSION, and what does a definition's `version` field mean against it?** `FlowDefinition.version` is *"author-managed; the driver does not interpret it"*. A definition valid against registry v1 may be invalid against v2, and a persisted run ([Q15](../open-questions.md)) would need the registry version in the log | W59 raises; not decided by this plan |
| Q250 | **Per-variant pools versus the envelope: does pool capacity per settings-variant ever matter?** The road ADR 0049 does not take, recorded with its cost so the next plan that wants per-variant concurrency can price it | W59 |
| Q251 | **A per-node INPUT TRANSFORM, declared in the flow and applied in the TYPE's worker wrapper.** Not in the driver: `driver.ts` dispatches inside a listener with no `await` and `jsonata` 2.x returns a Promise, and a worker's `run()` is async by contract. The language registered by name, the core carrying no engine; a syntax error refused at construction because compilation is sync; an evaluation failure a **task failure**, with the `user_action` consequence on a non-optional node stated; **no clock, no random**, because `$now`, `$millis` and `$random` exist. Compatibility across a transform is checked by an async **pre-flight** on schema-derived samples, evidence and not proof. Not this plan's, and it reaches Q165's reducer from the successor's side | no owner — *Slices beyond this plan* item 1 |
| Q252-Q262 | *reserved for the items* | |

## Slices beyond this plan, in order

*Not declared, not reserved, and written down so the order is a decision rather than a drift.*

1. **P17 — what a node may DO to its input before its worker sees it.** A `transform` key on a
   typed `task` or `map` node, declared in the flow and **applied in the TYPE's WORKER WRAPPER, not
   in the driver** — decided by the maintainer 2026-09-11 after both placements were priced. The
   driver dispatches the envelope as `{ settings, input, transform }` exactly as W59 leaves it —
   composed at `compose` (`driver.ts:1652`) and handed over at `dispatch` (`:1818`); the
   wrapper the bootstrap helper puts around the type's worker evaluates the transform inside `run()`
   and hands the worker `{ settings, input }`. **The driver is untouched** — `src/driver/driver.ts`
   contains no `async` and no `await`, dispatch runs inside a scheduler listener in one turn, and
   `AGENTS.md` section 8's quiescent-point contract rests on that; a worker's `run()` is async by
   contract, so **`jsonata` 2.x's Promise-returning `evaluate()`** (its 2.0.0 changelog:
   *"reimplementing the evaluator to use async functions instead of generators"*; current 2.2.2,
   zero dependencies, ~834 KB unpacked) is fine there, and the per-instance cost runs in parallel
   workers rather than serially in one listener call. **The language is registered by NAME** —
   `{ lang: "jsonata", expr: "…" }`, the evaluator supplied to the bootstrap helper — so the core
   carries no engine, an unknown language fails at instantiation (ADR 0002 rule 3), and the JSONata
   adapter ships as a sub-path export on decision 5's pattern. **A parse failure is still refused at
   construction**, as an `FD-V`: `jsonata(expr)` compiles synchronously and throws on a syntax
   error, and only `evaluate()` is async. **An evaluation failure is a TASK FAILURE, not a run
   refusal** — decided with its consequence stated: it routes through `on: ["failed"]` on an
   `optional` node and **suspends as `user_action`** on a non-optional one, so the wrapper reports it
   under its own distinct error so a later plan can teach the driver to treat it as a refusal if
   that message proves wrong for the person who receives it. **Only a typed node has a wrapper, so
   only a typed node may carry a transform**, and ladder L2 cannot see it — L2 asserts on what
   `createTask` received, which is the untransformed envelope; the transform is proved in a unit
   test of the wrapper and at L6. **Exit artifact: a node consuming a join's collection through a
   transform with no reshaping task node**, which reaches [Q165](../open-questions.md)'s refused
   reducer by a route ADR 0037 rule 5 did not close — the transform sits on the join's SUCCESSOR and
   receives `JP-R12`'s collection, so nothing about the collection's shape is decided by it. **And
   since ADR 0046 rule 3 the successor is the LAST thing that sees that collection whole**: the
   region releases it the moment the join is routed out of, after `collectArrivals` has built the
   successor's payload, so a transform there costs no retention and a later `needs` cannot reach
   what it reshaped — which is [Q219](../open-questions.md)'s subject and stays P15's follow-on.
   **One constraint survives the placement: `$now()`, `$millis()` and `$random()` are unbound**,
   or a worker's input stops being a function of what the run produced. `doc/concept.md` section 7
   names *an expression language for decisions* a non-goal; a transform is not a decision and the
   plan says so, and a consumer who wants an expression predicate registers one by name through the
   same adapter with no library change. Cost per instance measured as
   [Q186](../open-questions.md)'s was, in the wrapper. **JSONata is the first and only adapter, decided
   by the maintainer 2026-09-11 with the alternative priced**: CEL is the one mature expression
   language with a static type checker, but the battle-tested checker is cel-go, reachable from
   JavaScript only through a Go-to-WASM build, and every JavaScript port that carries a checker
   (`@marcbachmann/cel-js`, GRESB's `cel-javascript`, `@celjs/parser`) is young, single-maintainer or
   self-described not-for-production, while Buf's `@bufbuild/cel` is an evaluator with no checker.
   Nothing statically types a JSONata expression, so compatibility across a transform is checked by
   **samples** (item 2). **One hook is reserved so that choice stays reversible**: a language adapter
   may expose an optional `check(expr, inputShape) → outputShape`, which the pre-flight uses where
   present and falls back to samples where not — a CEL adapter that passes the conformance suite
   plugs in there with no change to the driver or the definition format.
2. **P18 — what a node type SAYS about its input and output.** Input and output schemas on a node
   type; a restricted structural schema language with a decidable compatibility relation (object
   keys with types, arrays, unions, `unknown` as the always-compatible escape); one `FD-V` per
   `needs` form — `"x"` takes x's output schema, `["x"]` an array of it, `"x?"` makes the key
   optional, a `map` instance the element type of `over`'s array, a `join` a record of branch outputs
   with **absent** keys; and `over` typed, which closes the static half of `FD-R2`. **Exit artifact:
   W43's zero-score flow refused at construction by name.** Its own ADR. Two places are forced loose
   by run-time semantics and the plan must say so: a join's record and a conditional reference.
   **And a transformed edge is checked by EVIDENCE, not by proof — a "check before run".** An
   expression's output type is not inferable, so the plan does not try: for an edge with no
   transform the checker proves `out ⊆ in` symbolically, and for an edge with one it **evaluates
   the transform on values derived from the producer's output schema** and validates each result
   against the consumer's input schema. The sample set is written from this repository's own
   run-time hazards rather than invented: the **minimal** instance (every optional key absent,
   every array empty, a join's record `{}`, which `liveToken` makes a real answer), the **maximal**
   one, and a **seeded** random set, so the check is reproducible run to run. A path typo yields
   `undefined` in JSONata rather than a throw, so it surfaces as a missing required key; a type
   error throws and surfaces as such. **It is a separate ASYNC entry point** — `await
   checkFlow(definition, registry)` — and not part of `new Driver`, because `evaluate()` is async
   and construction is not; it is the consumer's own gate, run in CI, and the reference says so.
   **What it cannot do is stated on the tin**: a conditional branch the samples never take is not
   exercised, so the verdict is *no counter-example found*, never *compatible*, and an author may
   pin a declared post-transform shape to make the edge checked by declaration instead — which is
   what the strict-mode plan then verifies at run time. The sound alternative, a type-level
   interpreter for a JSONata subset, is refused in advance with its reason: it is a second
   implementation of the language's semantics, and two implementations are two sources that can
   disagree, which is W50's finding one layer up. That is also why P17 comes first — a strict
   checker with no adapter refuses flows whose only remedy is the reshaping node ADR 0040 exists to
   remove.
3. **P19 — strict mode.** Validating a result against its declared output schema at the listener
   boundary, where `OR-R2` already clones it, and a transform's declared output against what the
   transform produced; a mismatch as a runtime refusal in `FD-R2`'s family (*the definition is valid
   and the worker is wrong*); a driver option, its cost measured the way
   [Q186](../open-questions.md)'s was. Only after P18, because it validates against something P18
   declares.
4. **Q16's flow half**, if anything ever asks for it: re-dispatching a node under a new attempt,
   which is the task id's fourth segment and the composition Q16 warns about.

## Stop and ask a human

- **The peer range** (decision 1). Exact pin or caret. W57 prices both; the maintainer chooses.
- **Retiring versus narrowing `S7`** (prediction 4). If D1-D3 cover it, retiring loses probes and
  a clause id cited in seven documents; narrowing keeps an id whose reason has changed. Either is
  defensible and the ADR must say which and why.
- **The envelope's key names.** `settings` and `input` are this draft's; the type's worker reads
  them by name forever after, so they are spelled once.
- **Anything that would change what a `map-with-context` or `map-over-region-output` instance
  receives.** Decision 4 forbids it; an item that finds it necessary stops.

## The record step this draft does not take

Declaring this plan touches, beyond this file: `doc/README.md` (the current-state paragraph and the
plan history table), `CLAUDE.md`'s current-state line, `README.md`, `doc/open-questions.md` (Q248-Q250
rows and the *Reserved* note), and four work-item files under `doc/work-items/` (W57, W58, W59, and
`w60-reserved.md` on P15's precedent). **None of that is done here**, because this tree is a
worktree branched for the draft and a declaration is the maintainer's call. It also re-takes the
five facts in `dev-dist/p16/` and the baseline gate on the tree it starts from, per section 1
rule 5's WHEN clause. *The worktree branch was fast-forwarded to `b317486` on 2026-09-11 with the
draft as its only untracked file, so a declaration commit applies on top of P15's last commit with
nothing to merge.*

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** —

**What the plan answered.** —

**Retro.** —
