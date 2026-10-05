---
id: ADR 0054
title: "Every task node names a TYPE, and a type is a derivation to pool options"
status: accepted
date: "2026-09-15"
item: W65
raised-by: P18
supersedes: ""
amends: ADR 0049; ADR 0051
resolves: ""
---

# ADR 0054 — Every task node names a TYPE, and a type is a derivation to pool options

**Status:** accepted — answers the second of [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s
two decisions, *what a task node says about the thing that runs it, and what a node type IS*, on that
plan's decisions 1, 2, 4, 5, 9, 12 and 14. **Amends [ADR 0049](0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)**:
its rule 1's *a `task` may name a `type` INSTEAD of a `workerType`* becomes *a `task` names a `type`*,
its settings VALIDATOR becomes the worker's `settingsSchema` ([ADR 0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)),
and its rule that *a bare `workerType` node is unchanged to the byte* expires with the bare node;
its envelope, its key-by-type-name pool and its *definition stays data* are unchanged and now
universal. **Retires `FD-V5` and `FD-V34`** (ids held, deliberately absent) and the untyped clause of
[ADR 0051](0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)'s
`FD-V37`. [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 6 is untouched — it is what the envelope's `input` IS.
**Raised by:** P18, taken by [W65](../work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)

## Context

**A task node had two roads and every rule about a task had two shapes.** Since v0.17 a `task` named
either a `workerType` — a key in the scheduler's `workerPools`, its worker handed the raw payload —
or a `type` — a registry entry, its worker handed the envelope `{ settings, input }`. So `FD-V23`
carried a *neither of two keys* clause, `FD-V32` a *registered type with no pool of its name* clause,
`FD-V34` existed to refuse the halves *mixed* three ways, `FD-V37` refused a transform on the bare
road, and `Registry.workerTypes` was a list a consumer wrote from `Object.keys(scheduler.workerPools)`
— the list-bound-to-nothing shape W35's obligation (c) finding named, standing beside `nodeTypes`,
which named the same pools a second time.

**P18 fact 4 measured the corpus before the plan was declared, and W65 re-ran it on `88b061b`**
(`dev-dist/w65/fact4.log`): 42 flow documents under `spec/examples/` and `examples/flows/`, **166
task nodes, 146 carrying `workerType` and 20 typed**, and **every one of the eleven worker roles
`examples/workers/flow-worker.ts` runs read its payload whole** — so retiring the bare road changes
what 146 nodes' workers receive (the envelope where the payload was) and costs one unwrap per worker.
**P18 fact 5 captured the exact `WorkerManagerOptions` `bootstrap` handed the scheduler for the two
existing types**, identical under Node 24.20.0 and Deno 2.9.6: `Echo` as
`{ maxThreads: 2, inline: false, idleTimeout: 0, config: { worker, config: { role: 'echo' } } }` and
`Scorer` the same with `inline: true`, `groups: ['scorer']` and `role: 'typed'` — **a `groups` key
ABSENT when none is declared, not present and empty** — which is the target the document form has to
reproduce for P16's and P17's typed rows to keep their numbers (prediction 2).

**What a node type had been was a registry entry with a pool spec beside it — configuration, which
cannot compute one option from another.** The plan's sample wants `model: "large"` to become a
resident VRAM cost, a thread count and a worker config, and a document type cannot say that; a class
could, and then a class could compute AROUND every check a document type passes through — W50's
*two sources that can disagree*.

**And the item's declaration step found the plan's own ordering impossible before anything was
built.** W65's Scope Out kept ladder L6 on `workerType` until W67; measured, **24 of 24 L6 flows and
both spec flows it imports carried `workerType`** (48 row definitions of 50 runs), and the harness's
`NODE_TYPES` and `bootstrap` read the OLD type shape, so any change to the shape broke L0 and L6
either way. Put to the maintainer with three roads priced, who chose to migrate `examples/**` in this
item (`src/scheduler/bootstrap.ts` and its test as declared exceptions) — recorded in W65's file.

## Decision

1. **`type` is REQUIRED on every `task` node and `workerType` is RETIRED.** `spec/flow-definition.md`
   is **v0.19**; `workerType` is `FD-V17`'s undeclared key like any other, a task without `type` is
   `FD-V23`, and a non-string `type` or `pool` is `FD-V21`. **`FD-V5` and `FD-V34` are retired and
   their ids held, deliberately absent** — with one road there is no *unknown worker pool* and no
   *halves mixed* — so the document has **34 refusals over `FD-V1` … `FD-V38`** where v0.18 had 35
   over `FD-V1` … `FD-V37`. `FD-V37` keeps its shape clause and loses its untyped one.
2. **A node type is a DERIVATION from an instance's config to pool options, and the document form
   is the IDENTITY derivation.** In the registry document a type is `{ worker, inline?, config?,
   pool?, groups?, retryPolicy?, settings? }`; in code it is `{ worker, inline?, configSchema?,
   config?, retryPolicy?, settings?, pool(config, key): PoolSpec }`. `nodeTypeFromDeclaration` turns
   the first into the second by returning the declared `pool` fields with the instance's config
   merged shallowly over the declared one and `groups` copied across, **and nothing else** — so for
   every type that existed before this version its output is fact 5's capture (`test/definition/registry.test.ts`
   compares `poolOptionsOf(...)` to the two captured strings as CANONICAL JSON, because key order is
   what today's literal happens to be and not what any rule fixes; the `groups` key is absent when
   none is declared). **Both forms' outputs pass through ONE check** (`derivePool`): the instance's
   config against the type's `configSchema`, the derivation run, the `PoolSpec` shape, the derived
   `config` against the worker's `configSchema`, every named group present, and no resident group
   beside `idleTimeout: 0` (decision 9, fact 6). A class decides how a pool is BUILT and nothing
   about which node runs on it.
3. **Every type has a DEFAULT pool instance keyed by its own name, built from its own `config`; a
   node may name another instance of its type in `pool`.** The registry's `pools` declares named
   instances as `{ type, config? }`; `FD-V38` refuses a `pool` that is not registered or is an
   instance of another type; the type's own name is the default stated explicitly and is accepted;
   `FD-V32` is asked first. **A type whose own config fails its own schema, or whose derived config
   fails the worker's, has no valid default and THE TYPE is refused at construction**
   (`TypeDefaultRefused`) — the maintainer's rule that the default *must be present in the
   registry*; the draft that refused the NODE instead was struck on 2026-09-15.
4. **Every task node receives the envelope `{ settings, input }` — `FD-C5` holds universally, and the
   envelope worker fronts every pool.** `settings` is the type's `settings` DEFAULTS merged under the
   node's (decision 12; `{}` when neither declares any), as the node's own copy per dispatch;
   `input` is the value this node receives — ADR 0040 rule 6's object, its own item, the collection
   after a join. `FD-V33` reads the type's worker `settingsSchema` (ADR 0053) over the merged object;
   an absent schema accepts any plain object; a schema outside the subset is reported and never
   applied. A worker written for a bare node reads under `input` what it read as its whole payload.
5. **The WORKER owns the four schemas.** A worker entry is `{ url, configSchema?, settingsSchema?,
   inputSchema?, outputSchema? }`; the first two are enforced — `configSchema` at construction on
   every instance's derived config, `settingsSchema` at `new Driver` — and **`inputSchema` and
   `outputSchema` are declared, carried and checked for being IN the subset, and enforced nowhere**:
   run-time enforcement is P19's, and this decision says so rather than leaving it to be inferred
   from an absence.
6. **Resource groups are FACTORIES.** A group type is `{ configSchema?, create(config, key) }`; the
   scheduler's three — `ConcurrentLimitGroup`, `RateLimitGroup`, `KeyedRateLimitGroup`, with their
   three different constructors adapted behind one signature — are built in with schemas, a custom
   one is registered in code the same way, and a custom one named as a built-in is a collision. The
   document's `groups` is `{ key: { type, config? } }`, resolved through those factories; a type's or
   a derivation's group must be a declared key (`NameMissing`).
7. **`Registry.workerTypes` and `DriverOptions.workerTypes` retire.** The driver's registry is
   `predicates`, `groups`, `workers`, `nodeTypes`, `pools`, `languages` — each empty when absent — and
   is the shape the runtime will expose as `runtime.registry` (decision 14), so a consumer building a
   `Driver` by hand passes what the runtime does. **The validator and the driver BUILD NOTHING**:
   `checkRegistry` runs the registry's SHAPE refusals at `new Driver` — every worker's `url` and
   schemas, every type's shape and worker, every named pool's type, no pool named as a type — and
   never a derivation, a config check or a group check, which are the resolver's and the helper's
   (six of the eleven classes can be thrown at `new Driver`; the conformity reader); `resolveRegistry(document, code)` resolves names to definitions and returns
   them; construction is W66's, and `bootstrap` (the sub-path) is what builds pools today.
8. **Every construction-time refusal is a NAMED class extending `RegistryError`, carrying `at`.**
   Eleven — `WorkerMissing`, `PoolTypeMissing`, `ConfigRefused`, `TypeDefaultRefused`,
   `GroupTypeMissing`, `GroupConfigRefused`, `NameCollision`, `SchemaRefused`, `UndeclaredKey`,
   `NameMissing`, `DerivationRefused` — enumerated in `spec/flow-definition.md` section 3's
   registry subsection, each with a fixture that trips it and one that does not, and checked for
   every entry of a kind before the next kind is read, so a refusal names the first defect and
   nothing is half-resolved.

## Consequences

**What this makes easy.** One road: a task node says what it does (`type`) and, when it matters, where
it runs (`pool`); a worker is written once against the envelope; a flow references registry KEYS only,
so a flow document is portable across runtimes that agree on keys (decision 10); a registry is a JSON
document a consumer can read, diff and validate, with every defect in it refused at construction
naming the entry. A type that needs to compute its pool from its config registers a class and passes
through the same checks a document type does.

**What it costs, measured.** **Every flow document written before v0.19 breaks** at `FD-V17` and
`FD-V23`, and nothing in the document signals which grammar it was written for
([Q279](../questions/q279.md)); the corpus paid it here — **74 flow documents, 199 `workerType` sites,
every one now `type`**, three invalid examples removed (`FD-V5`, `FD-V34`, the untyped `FD-V37`), two
invalid and one valid added. **Every worker that read its
payload whole reads `input`** — in `examples/workers/flow-worker.ts` that is one expression for
eleven roles. **The L6 harness has no `pool()` line**: thirteen document types over one worker entry,
every pool built by `bootstrap`, and the driver handed the registry's sections rather than a list of
pool names. **A task that is not a flow's — W19's foreign tasks on the shared scheduler — must carry
the envelope too**, because the pool it addresses is a type's: this item's first L6 run had five
failures, and two were the six foreign tasks settling `user_action` under `NotAnEnvelope` where the
row expects `task.completed`; `runPair` wraps their payload as `{ settings: {}, input }`. The other
three were two cross-row clauses that discriminated on *typed* — the typed pair's settings and the
type's retry budget — which every task now is, re-cut to *carries `settings`* and *declares no policy
of its own*, plus the membership list naming them. **Ladder L6 is 1502 assertions over 50 runs**
(from 1501; the retry clause became a pair, both halves asserted), **the typed rows' numbers
unmoved**, in both runtimes; L1-L5 **40 files / 1041 cases**; `spec/` **7 / 55 / 105 / 34**.

**What this does NOT decide.** No `inputSchema` or `outputSchema` is applied at run time (P19). No
pool, group or driver is built from a document by the library — `createRuntime` is W66's. Locking a
type's config keys, and node-type versioning ([Q249](../questions/q249.md)), wait for a registry
document to exist in a consumer's hands.

## Alternatives rejected

| alternative | why not |
|---|---|
| **Keep both roads** — `workerType` beside `type` | Two shapes of every task rule and a registry list bound to nothing; the bare road's only remaining reason was *unchanged to the byte*, and fact 4 priced the change at one unwrap per worker |
| **A registry-wide default pool** rather than one per type (decision 1's *over*) | Only makes sense under a generic-worker model; in this corpus every node's behaviour is its worker, so a default that is not the type's is a wrong worker |
| **A type as pure configuration** (decision 2's *over*) | Cannot compute one option from another — the sample's `model: "large"` into a resident cost, a thread count and a worker config — and a class beside it would compute around the checks; a derivation with one check over both outputs is what closes that |
| **Refuse the NODE when a type's own config fails its schema** (the plan's first draft) | Contradicts the rule it was written under — the default *must be present in the registry* — and reports a registry defect at the node; struck by the maintainer on 2026-09-15 |
| **One pool per distinct settings value, settings as pool `config`** | ADR 0049's road not taken, with its cost ([Q250](../questions/q250.md)); a map of N instances at N settings would be N pools |
| **Keep ladder L6 on `workerType` until W67** (the item's own Scope Out) | Impossible on the tree: 24 of 24 L6 flows carried it and the harness read the old type shape, so the choice was which item pays, not whether — the maintainer's, recorded in W65 |
| **Enforce `inputSchema`/`outputSchema` at dispatch here** | A run-time check on every settlement is a cost P19 is declared to measure first; declaring and carrying them costs nothing and lets a document say what it will mean |
