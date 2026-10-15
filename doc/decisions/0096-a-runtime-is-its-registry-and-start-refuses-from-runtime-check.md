---
id: ADR 0096
title: "A runtime is its registry, and `start` refuses from `runtime.check`"
status: accepted
date: "2026-10-15"
item: W162
raised-by: P37
supersedes: ADR 0051 rule 4
amends: ADR 0022 rule 3; ADR 0075 in part
resolves: Q285
---

# ADR 0096 — A runtime is its registry, and `start` refuses from `runtime.check`

**Status:** accepted — [P37](../plans/p37-a-runtime-is-its-registry.md) decisions 1-3, stop-and-asks (a) and
(b) ANSWERED by the maintainer on 2026-10-15 as recommended; written by
[W162](../work-items/w162-a-runtimes-languages-are-its-registrys-and-runtime-check.md). It **supersedes
[ADR 0051](0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
rule 4** — *the bootstrap helper writes a language's worker URL into a typed pool's config ONLY for a type
some node of which declares a transform* — and with it that ADR's consequence 2 (*the helper reads the
FLOWS*) and consequence 5's *only where a transform is declared*; it **amends
[ADR 0075](0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md) consequence 3**,
*a `Transform` node needs `flows` passed to `createRuntime`*, which stops being true; and it **resolves
[Q285](../questions/q285.md)**, which P29 iced on the ground that *a pool gaining an adapter later has no
consumer* — fyflow-app is that consumer (its `languageWarmupFlows`, P37's #6).

## Context

**A runtime builds its pools ONCE, at `createRuntime`, and the scheduler cannot add one later** (P37
fact 8: `FyflowScheduler` takes its pools in its constructor and subscribes to them there; it has no
method that adds a pool or a group). Under ADR 0051 rule 4 a language reached a pool only through the
flows given at construction (P37 fact 2: `bootstrap` wrote a language's worker URL only for a type some
node of which transformed in some flow it was given, and `start` refused `LanguageNotBuilt` for any flow
whose transforming type had not been accounted for). So a flow published after the runtime started —
a UI's, an agent's — could not transform on a type no earlier flow transformed on, and the only consumer
road was to pass synthetic warm-up flows that transform on every type (fyflow-app's
`languageWarmupFlows`), which grows with every plugin.

**What rule 4 bought, re-priced** (P37 fact 2, re-taken by W162 — its declaration step's table): the
engine adds **no bytes** to a consumer's bundle, because registering a language already loads it in the
main realm (`src/jsonata/index.ts` imports it beside the registry half, which `new Driver` calls). What
it adds is a THREAD cost: each worker of a typed pool imports the worker half in `setup()`. Measured at
W162's declaration step (node 24.20.0, median of 7, inside a fresh `worker_threads` thread, from before the
import to after one evaluation of `$`): **22.5 ms and 6 524 KiB of heap**, against 0.0 ms and 171 KiB for
a thread importing nothing — P37's *40.6 ms and 6 087 KiB* on another load of the same machine. On an
**inline** pool the envelope's `setup()` with the language took **0.018 ms** against 0.003 ms without it
(0.466 ms on the first, cold), because the module is already in the realm. A browser Web Worker was not
measured.

## Decision

1. **A runtime is its registry.** Node types, pools, groups and languages are fixed at `createRuntime`.
   **`runtime.register()` is declined**: a plugin change builds a NEW runtime (P37 decision 1), and the
   runs on the old one stay there or move by stop-and-resume (P34).
2. **Every typed pool carries every language the registry names.** The bootstrap helper writes the
   worker half's URL of EVERY adapter it is given into EVERY pool it builds — every type's default
   instance, every named instance, the built-in `Transform` included — under the language's name, sorted.
   A registry naming no language writes no `languages` key, so every pool such a registry builds is
   byte-identical to what it was (P18 fact 5's captures). Each adapter must still name a worker URL,
   refused by name before any pool is built.
3. **The helper reads no flow, and the runtime is given none.** `createRuntime`'s `flows` option,
   `bootstrap`'s `flows` option, the `LanguageNotBuilt` refusal and `transformLanguagesByType` are
   REMOVED (stop-and-ask (a)) — **BREAKING**, in orchestration 0.8.0: a caller passing `flows` fails to
   compile, which is what tells it to delete its warm-up flows. A flow naming a language the registry does
   not name is `FD-V35`, at `check` and at `start`, as it always was at `new Driver`.
4. **`runtime.check(flow)` returns `Finding[]` — every finding `start(flow, payload, {})` would refuse on
   that depends on the FLOW and the runtime alone — and never throws for a flow's defect** (stop-and-ask
   (b)). At this ADR it is `validateDefinition` against the runtime's own registry (`runtime.registry`,
   predicates by name); ADR 0097 (W163) adds the one refusal no validator rule states — a node reaching a document-declared `KeyedRateLimitGroup` (P37 stop-and-ask (c)). **Excluded,
   by name**: the payload's (`FD-R4`, the entry payload's clone) and the run id's (`ID-R2`, `RunIdInUse`),
   because neither is the flow's.
5. **`start` and `resume` refuse from the SAME call.** Each calls `check(flow)` before a run id is minted
   or a driver is built, and a non-empty result is thrown as `InvalidDefinition` carrying the findings'
   rule ids and the message `new Driver` builds from the same findings — so `check` and `start` cannot
   disagree, and a refused flow spends no run id. *Register* means *check, then start*. **This puts the
   flow before the run id on the runtime road, and so AMENDS
   [ADR 0022](0022-a-driver-takes-its-run-at-construction.md) rule 3 there**: `new Driver` refuses a run id
   outside `ID-R2`'s charset before it validates anything, while `start` given an invalid flow AND such an
   id — or an id in use (`RunIdInUse`) — throws `InvalidDefinition`. A driver built by hand keeps rule 3's
   order. `resume` refuses its checkpoint's header (`RN-R23`) and clones its entry payload (`RN-R15`)
   first, and checks the flow after both.

## Consequences

**What this makes easy.** A running runtime takes ANY flow its registry can run, published after it
started, transforming on any type, with nothing passed in advance; an editor validates a flow against
the runtime that will run it with one call and no run; and the warm-up flows go.

**What it costs, each stated because the alternative below priced it.**

1. **Every worker of every typed pool loads every registered engine**, whether any node of its type ever
   transforms: about 22-40 ms and 6 MiB per node thread (the Context), paid at the worker's `setup()`,
   which is when a pool first runs a task and again after every idle-out. A registry naming no language
   pays nothing. ADR 0051 consequence 5's *only where a transform is declared* is withdrawn with rule 4.
2. **`start` validates the flow TWICE** — once in `check`, once in `new Driver`, which keeps its own
   validation for a driver built by hand and is not this ADR's to change. Measured at W162's declaration
   step over the thirty L6 flow files that validate against the shared document: a median of **29.5 µs**
   per `check` and a maximum of **173 µs** (`transformed.flow.json`, whose `FD-V36` compiles three
   expressions), against roughly 100 ms per real run at L6.
3. **While two runtimes overlap after a rebuild**, their pools and resource groups are SEPARATE: a rate
   limit may briefly be exceeded, and a model loaded in a worker's `setup()` is loaded twice (P37 Scope).
   A consequence of rule 1, recorded, not built.
4. **`defaultRetryPolicy` is still held only at `new Driver`** until W163 (P37 stop-and-ask (b)'s other
   half), so until then a malformed one passes `check` and every `start` throws `FD-V30`.
5. **Exactly two shapes THROW rather than report** — `null` or `undefined` in place of the flow, and a
   `nodes` that is present and not iterable — each the validator's own `TypeError`, from `check` as from
   `start` and `new Driver`. Every other value is read and reported: a non-object primitive such as `5`,
   or `{}`, returns `FD-V23` findings (W162's M5). The parameter is a `FlowDefinition`, and a value of
   that type is neither shape.

**What a future reader is likely to try that this forbids.** Bringing `flows` back *"so a runtime that
never transforms loads no engine"* — the registry already says that: name no language. Writing the
languages only into the pools of the types that CAN transform — every typed pool can, since any flow may
declare a transform on any type. A `runtime.register(nodeTypes)` that patches `scheduler.workerPools` —
a pool assigned there has no listener (P37 fact 8). A `check` that throws the first finding — it returns
all of them, as `validateDefinition` does, and `start` throws.

## Alternatives rejected

| | why not |
|---|---|
| **Keep `flows` as early validation** — `createRuntime` runs `check` on each and throws the first finding | two roads to one check, and fyflow-app's warm-up flows keep passing silently. Stop-and-ask (a), refused |
| **Keep `flows` accepted and ignored** | no compile error, and an option that does nothing is the silent kind. Stop-and-ask (a), refused |
| **`check` returns `FD-V30` for a malformed `defaultRetryPolicy` on every flow** | a runtime defect reported against each flow, as `start` does today; W163 refuses it at construction instead. Stop-and-ask (b), refused |
| **`check(flow, payload?)`, adding `FD-R4`** | a second parameter for the one check a UI cannot run without a run. Stop-and-ask (b), refused |
| **`runtime.register()`** | the scheduler cannot add a pool after construction at the pin (P37 fact 8). Decision 1 |
| **Load a language lazily, on a pool's first transform** | ADR 0051's own rejected row: an import on the first task's critical path, and the stop-and-ask there chose `setup()` |
