---
id: ADR 0099
title: "A named instance of a DOCUMENT type may declare its own pool options, merged over its type's and copied; a class type's instance may not"
status: accepted
date: "2026-10-16"
item: W165
raised-by: P37
supersedes: ""
amends: ADR 0054 decisions 2 and 3
resolves: Q626
---

# ADR 0099 — A named instance of a DOCUMENT type may declare its own pool options, merged over its type's and copied; a class type's instance may not

**Status:** accepted — [P37](../plans/p37-a-runtime-is-its-registry.md) stop-and-ask (e) and decisions 8 and 9, the
maintainer's (2026-10-15, *"as recommended"*), written by
[W165](../work-items/w165-pool-options-on-a-named-pool-instance.md). It **amends
[ADR 0054](0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) decisions 2 and 3**: decision
3's named instance `{ type, config? }` gains a third key, `pool`, on an instance of a document type; decision 2's
identity derivation merges it and copies every declared pool object. Decision 2's *both outputs pass through ONE check*
is unchanged and is what holds the new input.

## Context

**A consumer asked for it, by a workaround.** fyflow-app gives a named pool instance its own options by WRAPPING the node
type — a second type per instance — because an instance may say only `type` and `config` (request **#19**). P37 fact 5
measured why: `INSTANCE_KEYS` is `['type', 'config']`, SHARED by pool and group instances, `PoolInstance` is
`{ type, config? }`, and the identity derivation spreads the TYPE's declared `pool` into every instance's spec, so two
instances of one document type always run with one set of options.

**Two hand-offs ride on the same derivation** (P33's stop-and-asks (g) and (h), P37 fact 7). The identity derivation
copied `messages` and `groups` and handed `residentGroups` on AS DECLARED — `===` the declaration's, one object shared by
every instance (W159's conformity F3). And `messages.flushIntervalMs` was held to the scheduler's own rule, finite and
`> 0`, which admits a delay `setTimeout` clamps to 1 ms: measured in node and deno, 2^31 and 1e300 fired at once with a
`TimeoutOverflowWarning`, and 2^31-1 had not fired at 200 ms. The scheduler already knows the bound — `MAX_TIMER_MS = 2 **
31 - 1` — and applies it to a cancel's grace timer and not to the flush interval.

**Fact 5 also found three `WorkerManagerOptions` nobody admits** — `idleCheckIntervalMs`, `requeueFailedTasks`,
`maxWorkerRestarts` — each read by the scheduler with no validation, the second deciding whether a dead worker's tasks are
requeued or failed, which is the road ADR 0051's F1 hang runs on.

## Decision

1. **A named pool instance of a DOCUMENT type may carry `pool`: its own pool options**, the keys a type's `pool` may
   declare (`DECLARED_POOL_KEYS`) and no other. A document type is one the registry document declares, the built-in
   `Transform`, or either of those held in its resolved form — the definition `nodeTypeFromDeclaration` returned for it,
   which is what `createRuntime` hands the bootstrap helper and a driver. `POOL_INSTANCE_KEYS` is `type`, `config`,
   `pool`; `INSTANCE_KEYS` is unchanged, a group instance's keys and the two every instance shares.
2. **They merge SHALLOWLY over the type's declared `pool`, the instance's key winning, and a key present with `undefined`
   is ABSENT** — it does not unset the type's. Shallow means a `messages` the instance declares REPLACES the type's whole;
   a key the instance leaves out is the type's. `config` and `groups` are not pool options: `config` merges as before,
   `groups` are the type's, and `inline` is FIXED per type.
3. **Every declared pool OBJECT is copied, never aliased** — `residentGroups` (list or record) as `messages` and `groups`
   already were (decision 8). No two pools' specs share an object, and no spec shares one with the document.
4. **An instance of a CLASS type carrying `pool` is REFUSED** — `UndeclaredKey`, naming the pool, the type and this record.
   A class receives the instance key in `pool(config, key)` and owns how its pool is built (ADR 0054 decision 2); the
   knob it wants belongs in its `configSchema`, where its derivation reads it.
5. **Held twice, through one predicate.** The instance's own `pool` is held where the registry's SHAPE is held — on both
   roads, `checkRegistry` and `resolveRegistry`: a non-object is `DerivationRefused`, a key outside the list
   `UndeclaredKey`, a malformed value `DerivationRefused` by `poolSpecProblem`, each naming the pool. The MERGED spec then
   passes `derivePool`'s one check exactly as every derivation's output does — `poolSpecProblem`, the worker's
   `configSchema`, every group named present, no resident group beside `idleTimeout: 0` — so an instance's
   `residentGroups` beside its type's `idleTimeout: 0` is refused as the type's own would be.
6. **`messages.flushIntervalMs` is bounded at 2^31-1** in `poolSpecProblem` — the scheduler's own `MAX_TIMER_MS`
   (decision 9) — on every road a `PoolSpec` takes: a type's `pool`, an instance's, a class's output.
7. **`idleCheckIntervalMs`, `requeueFailedTasks` and `maxWorkerRestarts` are NOT admitted** — on a type's `pool` or an
   instance's; each is refused as an undeclared key, as before.

## Consequences

**What this makes easy.** Two instances of one document type with different threads, concurrency, idle time, grace or
resident cost — `{ "type": "Prompt", "pool": { "maxThreads": 1 } }` — with no second type and no class. The default
instance is unmoved: a registry with no instance options builds exactly the pool options it built before (P18 fact 5's
captures, unmoved).

**What it costs, each stated.**

1. **Two ways to vary a pool by instance**, one per form: a document type's instance by `pool`, a class's by `config`. A
   reader who writes `pool` on a class instance is refused by name and told the other road.
2. **The shallow merge replaces `messages` whole.** An instance setting `messages.maxBuffered` loses the type's
   `flushIntervalMs` unless it repeats it. Deep merge is refused here as it is for `config` (ADR 0054 decision 2's *a
   class is where any other rule lives*).
3. **A resolved document type is recognised by WHERE it came from**, not by its shape: a definition
   `nodeTypeFromDeclaration` returned is a document type, a hand-written `NodeTypeDefinition` is a class, though both have
   a `pool` function. A consumer copying a resolved definition into a new object makes it a class to this rule.
4. **`ResolvedPool` gains `pool`**, the instance's own options COPIED, a key present with `undefined` dropped (it
   overrides nothing, rule 2) — so `createRuntime` can hand the bootstrap helper the instance it resolved — and
   **`PoolInstance` gains `pool?`**. Both additive.
5. **A named instance of the built-in `Transform` may now hold a RESIDENT group.** `Transform` is a document type
   (rule 1), so its instance takes every pool option, `residentGroups` included — the first road by which a
   transform-only pool holds a resource group. [ADR 0075](0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)
   rule 3's closing note (*holds no resource group, and nothing a consumer writes changes that*) is narrowed by it, and
   [Q457](../questions/q457.md)'s *reachable by NO road* now holds of `inline` and `groups` alone. That road is wanted:
   [Q626](../questions/q626.md), raised by W165 from its conformity reader's F3, was ANSWERED by the maintainer at
   [P37](../plans/p37-a-runtime-is-its-registry.md)'s retro (h), 2026-10-16 — accepted as stated, and resolved by this
   consequence.

**What it does not decide.** Admitting the three options of rule 7 — each would want a bound of its own and, for
`requeueFailedTasks`, a rung on the worker-death road, which no rung here exercises. Whether the scheduler bounds its own
flush interval: [S11](../scheduler-upstream.md#s11---messagesflushintervalms-is-not-bounded-at-the-schedulers-own-max_timer_ms),
NOT RAISED (P37 (f)).

## Alternatives rejected

| | why not |
|---|---|
| **Merge the instance's options over the derivation's OUTPUT, for both forms** | one rule — and an instance could override what a class COMPUTED from its config (a resident cost from a model size), which is the class's to decide. P37 (e)'s answer |
| **Admit the three unvalidated options**, with bounds of our own | the consumer's need is threads, concurrency and idle time; `requeueFailedTasks` reaches the worker-death road no rung exercises. P37 (e)'s answer |
| **Keep wrapping the type** (the consumer's workaround) | a node type per instance, each a copy of the same worker, settings schema and retry policy, which the next edit lets drift |
| **An instance's `pool` replacing the type's whole** | an instance repeating every option to change one; the shallow merge is `config`'s rule, one level over |
| **Leave `residentGroups` aliased** | one object shared by every instance and the document, mutated by anyone holding one — W159's F3, decision 8 |
