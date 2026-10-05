# P18 — A flow and its runtime from documents alone

**Status:** COMPLETE AND RETRO'D — the retro is at the foot of this file, run 2026-09-16 on `b44b1d2`,
and it takes `doc/workflow.md` to [v0.19](../workflow.md) with ONE change adopted and SIX refused.
Drafted 2026-09-15 on `e6ea29a` (tagged
`basic-functionality-ready`, P1-P17 complete and retro'd, `doc/workflow.md` [v0.18](../workflow.md))
from a design conversation with the maintainer, its nine facts measured the same day in both
runtimes, and declared 2026-09-15.
[W65](../work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) done 2026-09-15,
[W66](../work-items/w66-the-runtime-entry.md) done 2026-09-16 and
[W67](../work-items/w67-a-flow-from-documents-on-real-workers.md) done 2026-09-16; W68 reserved and
never issued. **The exit artifact exists**: P18's sample runs from two JSON documents and a shim on a
real `FyflowScheduler` in both L6 runtimes. *Read every status from the item's own file, never from
this line.*

**The question in one sentence.** Today a consumer who wants a flow to RUN writes code around the
library: a `WorkerManager` per worker with a role in its config, resource groups constructed by
hand, `bootstrap` called with the right registry, a `Driver` built with six options read off the
scheduler — `examples/run-flow.ts` is 1500 lines of exactly that, and `AGENTS.md` section 12 is the
consumer's copy of it. **Can a flow and the runtime it needs be defined as two DOCUMENTS and a
registry of names, with the library doing every instantiation, so that the only code a consumer
writes is the code that is genuinely theirs — a worker, a predicate, a custom group, a custom
derivation?**

**Exit artifact:** the flow in *The minimum sample* below — two JSON documents and a shim of under
ten lines — running end to end on a real `FyflowScheduler` in **both** L6 runtimes, with a
document-declared node type and a class-declared one, a built-in resource group and a custom one,
a node on its type's default pool and a node on a named instance; `examples/**` holding **no role
switch and no `pool()` call**; every existing L6 row still passing after the corpus loses
`workerType`; and what reverting each item costs, in L6 failures.

**Reserves:** W65-W68 (W68 expected unused), Q278-Q292, ADR 0053-0055. *Derived from P17's retro,
which wrote "the next plan starts at W65, Q278 and ADR 0053"; confirmed against the tree on
2026-09-15: W64 closed unissued, Q277 spent, ADR 0052 the highest on disk. Q278 and Q279 are
raised by this declaration; Q280-Q292 are the items'.*

---

## Why this plan, and why now

**The gears are built and the wiring is not.** Sixteen plans built what a run IS: routing in the
driver, a definition that is data, a fold over an event log, join policies, regions, maps,
references, node types with an envelope, transforms in a registered language. What none of them
built is the thing that turns a registry of names into a running scheduler: every plan's exit
artifact wired it by hand in `examples/run-flow.ts`, and every consumer must copy that file's
`buildScheduler` to run anything. P16 decision 5 put the ONE constructing call behind a sub-path
(`bootstrap`); this plan finishes the thought — the sub-path takes a document and returns a
runtime.

**It absorbs the slice P16 and P17 both named as P18** — *what a node type SAYS about its input and
output* — for the DECLARATIONS only: a worker entry carries `configSchema`, `settingsSchema`,
`inputSchema` and `outputSchema`, the first two are enforced where today's settings validator runs,
and the last two are carried and enforced by nothing here. Enforcement at run time is P19's strict
mode, unchanged.

**It is the first plan to take a NAME off the definition grammar.** `workerType` retires, because
with every task node bound to a type there is no bare road left, and `FD-V23`, `FD-V32` and
`FD-V34` become one rule. That is why this is one plan and not a feature: it touches the grammar,
the registry, the scheduler sub-path and the whole L6 corpus at once, and section 7 rule 2 makes
that serial.

## What the design settled, and how

*A conversation on 2026-09-15, one unclear bit at a time. Each is recorded with the alternative it
was chosen over, so an item argues from the decision rather than re-deriving it.*

1. **A node names its TYPE, and a type has a DEFAULT pool.** *Over*: a registry-wide default pool,
   which only makes sense under a generic-worker model and would have reversed a corpus in which
   every node's behaviour is its worker. A task node's `type` is required — what it does; `pool` is
   optional — where it runs, and must be an instance of that type. The default instance is implicit,
   keyed by the type's name, built from the type's own declaration, which is what `bootstrap` does
   today; `FD-V32` stays as written. **Every type has a default instance, and its `config` field is
   that instance's config** — for a document type the declared `config`, for a class type its
   `config` member, `{}` when neither declares one. A type whose own `config` fails its own
   `configSchema` has no valid default and is REFUSED at `createRuntime` naming the type, because
   the maintainer's rule is that the default *must be present in the registry* and a registry
   defect is reported where the registry is built. *(The first draft let such a type exist with no
   default and refused the NODE instead; that contradicted the rule it was written under and was
   struck on 2026-09-15.)* The sample's `GpuModel` declares `config = { model: 'small' }`, so its
   default instance is the small model and `prompt-big` is the large one.
2. **A node type is a DERIVATION from an instance's config to pool options.** *Over*: pure
   configuration, which cannot compute one option from another. The document form is the built-in
   derivation (merge the instance's overrides over the declared fields); a class registered in code
   supplies any other (`model: "large"` into a resident VRAM cost, a thread count and a worker
   config). **Both outputs pass through the same validation**, so a class cannot compute around a
   check — W50's *two sources that can disagree* answered by making the second source's output
   pass through the first's rules. A class decides how a pool is BUILT and nothing about which
   node runs on it; the latter is routing, and ADR 0001 keeps routing in the driver. **One
   namespace**: a name declared in the document's `nodeTypes` and also registered as a class in
   the `code` argument is refused at construction, as a group type colliding with a built-in is —
   a name that resolves to two definitions is the silent kind.
3. **The WORKER owns both schemas.** *Over*: a config schema on the worker AND one on the type,
   which conflated three levels. The worker's constructor argument is `configSchema`; the per-node
   envelope `settings` is `settingsSchema`; the factory's own options are the scheduler's fixed
   shape and need no schema. A type's `configSchema` is the knobs an INSTANCE may set — the input
   to its derivation — and a document-declared type's knobs are simply the fields an instance may
   override. **An absent schema means UNCHECKED**, stated rather than left to guess: a worker entry
   with no `settingsSchema` accepts any `settings`, with no `configSchema` any `config` — which is
   what today's absent settings validator means — and `url` is the only required field of a worker
   entry. The sample's `fetch` worker is that case.
4. **Resource groups are FACTORIES, and the three built-ins are pre-registered ones.** A group type
   is `{ configSchema?, create(config, key) }`; the runtime ships `ConcurrentLimitGroup`,
   `RateLimitGroup` and `KeyedRateLimitGroup` in that shape because their constructors differ
   (`(limit, id)`, `(windows, id)`, `(windows, options)`), a consumer registers a custom class the
   same way, a name colliding with a built-in is refused, and a created object lacking `canRun` or
   `getMetrics` — the interface's two required members; `onStart` and `onFinish` are optional and
   receive `(key?, cost?)` (fact 2) — is refused at construction naming the key. The key is the
   group's identity and the object's own name is inert (ADR 0049 fact 2).
5. **Every task node receives the envelope.** With `workerType` gone there is no bare road: ADR 0040
   rule 6 and `FD-C5` hold universally, and the envelope worker fronts every pool. The cost is the
   corpus: every `workerType: X` becomes `type: X`, and every worker that read its payload whole
   reads `input` instead.
6. **Validation has three moments and this plan enforces two.** At `createRuntime`: every type's
   worker exists, every pool's type exists, type and instance config against the worker's
   `configSchema`, every group named exists, group config against its factory's schema, the
   resident-group refusal (below). At `new Driver`: the type exists, the pool belongs to the type,
   `settings` against the worker's `settingsSchema` (today's `FD-V33` site, a schema in place of a
   function), transforms compile, predicates and languages exist — all `FD-V`. At run time:
   `inputSchema` and `outputSchema`, declared, carried, enforced by nothing here — P19.
7. **What stays code, exactly.** Custom predicates, custom language adapters, custom group types,
   custom node type classes — supplied in one `code` argument. Worker URLs are strings. Relative
   worker URLs resolve against a `base` the consumer passes, because inside a bundle
   `import.meta.url` is the bundle ([Q261](../questions/q261.md)) and the runtime cannot guess.
8. **The schema validator is the RUNTIME sub-path's dependency, never the root's.** ADR 0052's
   question a third time, and the same answer's shape: the pure root loads no engine; the sub-path
   that constructs scheduler objects carries the validator. Whether it is a full-draft dependency or
   a built-in subset is **ADR 0053** — **decided at the draft, 2026-09-15, by the maintainer once
   fact 1 had priced all three: the built-in SUBSET**, at 1.5 KB with its limits enumerated in that
   fact; a dependency (`@cfworker/json-schema`, 42 KB) is prediction 4's reversal condition and
   nothing else. W65 writes the ADR from the decision rather than re-taking it.
9. **A resident group with `idleTimeout: 0` is refused at construction**, with the scheduler
   reference's own sentence (*`idleTimeout: 0` deadlocks a contended resident group*), because every
   pool in today's harness uses 0 and the first contended resident group would hang.
10. **Runs.** `runtime.start(flow, payload, { runId?, joinPolicy? })` returns a `Driver`; the join
    policy defaults to `live-token` (ADR 0003 rule 1); the runtime mints a run id when none is given,
    which answers [Q20](../questions/q20.md) and [Q85](../questions/q85.md) in passing. Pools belong
    to the runtime and are shared across runs. **A flow references registry keys only, so a flow
    document is portable across runtimes that agree on keys** — one sentence in
    `spec/flow-definition.md`. A minted run id is `r<n>` from a counter the runtime holds — inside
    `ID-R2`'s charset, unique per RUNTIME and not globally, which is the answer Q20 gets: two
    runtimes on one scheduler must be given their ids by the caller, exactly as two drivers must
    today.
11. **Map branches** name a type like any task node and their N instances share its pool, as today.
12. **A type may carry `settings` defaults**, merged under a node's `settings` before the worker's
    `settingsSchema` is applied — the only new field on a type, **KEPT by the maintainer's decision
    of 2026-09-15**. Locking a key against instance overrides is OUT of the first cut.
13. **The runtime imports NO engine; a language adapter is code the consumer passes.** ADR 0052
    rule 4 says the engine is reached from `src/jsonata/**` alone and the root and the scheduler
    sub-path load none of it, so a runtime that resolved the document's `"jsonata"` from a
    built-in table would load the engine into every consumer's runtime, transforming or not. The
    document's `languages` names what the flows may use; the `code` argument supplies each adapter
    (`import { jsonata } from 'fyflow-orchestration/jsonata'`), compared both ways; a language named
    and not supplied is refused at construction. The sample's shim shows the import — the first
    draft's did not, and that shim would have broken ADR 0052 on its first line.
14. **`Registry.workerTypes` and `DriverOptions.workerTypes` retire with `workerType`, and the
    `Driver` stays constructible by hand.** The driver's registry becomes predicates, languages,
    groups and node types with their pools; `runtime.registry` exposes exactly the object the
    runtime hands its drivers, so a consumer who builds a `Driver` themselves — `AGENTS.md`
    section 12's reader today — passes the same shape the runtime does, and the pure root gains no
    dependency for it.

## What was measured before this plan is declared

*Section 4's discipline: a load-bearing fact is measured before the plan rests on it. Nine facts,
taken 2026-09-15 on `e6ea29a` with the draft file the one untracked addition, by
`dev-dist/p18/facts.mjs` under Node 24.20.0 AND Deno 2.9.6 — the two outputs are IDENTICAL outside
the timing-free rows — and by scratch installs OUTSIDE the repository for the validator candidates.
The file is untracked ([Q253](../questions/q253.md)'s shape, stated). Two of the nine changed this
draft: fact 2 corrected decision 4 and the sample's custom group, and fact 1 confirmed prediction 4
on the sample before the plan was declared.*

**1. A JSON Schema validator costs 1.5 KB, 42 KB or 262 KB in the browser, and the subset covers
the sample.** Three candidates, each loaded under Node and Deno (`npm:` specifier) and bundled with
this repository's own esbuild:

| candidate | version | installed | dependencies | browser bundle | loads in Node / Deno |
|---|---|---|---|---|---|
| `ajv` | 8.20.0 | 1 292 990 bytes over 5 packages | 4 | **262 431 bytes** — more than `jsonata`'s 242 190 | yes / yes |
| `@cfworker/json-schema` | 4.1.1 | 173 840 bytes | 0 | **42 516 bytes** | yes / yes |
| a built-in SUBSET (`dev-dist/p18/subset-validator.mjs`) | — | 32 lines, 2 476 bytes | 0 | **1 460 bytes** minified | yes / yes |

The subset — `type` (with `integer`), `required`, `properties`, `additionalProperties: false`,
`enum`, `const`, `minimum`/`maximum`, `minLength`/`maxLength`, `items`, `minItems` — validates
every schema the sample and the corpus's registry need: **14 of 14** cases as expected, negatives
included (`dev-dist/p18/subset-validator-check.mjs`). **Prediction 4's reach is confirmed on the
sample**; what it cannot say is what a consumer's worker will write, which is why ADR 0053 is still
a decision and not a foregone one.

**2. The `ResourceGroup` interface requires `canRun` and `getMetrics`, and nothing else.** Read off
the `.d.ts` at the pin: `id`, `type`, `keyed?`, `keyFor?(task)`, **`canRun(key?, cost?)`**,
`onStart?(key?, cost?)`, `onFinish?(key?, cost?)`, **`getMetrics()`**, `getStats?`, `describe?`,
`read?`. So `onStart` and `onFinish` are OPTIONAL and receive a cost, and the required method the
sketch had missed is `getMetrics` — decision 4's construction check names the two required members
now, and the sample's custom group implements both. The three constructors:
`ConcurrentLimitGroup(limit, id?)`, `RateLimitGroup(windows: RateWindow[], id?)` with
`RateWindow = { limit, windowMs }`, `KeyedRateLimitGroup(windows, options?)` with `options.id` —
three shapes, three adapters, and the sample's `{ "windows": [{ "limit": 60, "windowMs": 60000 }] }`
is `RateWindow` verbatim.

**3. Two `WorkerManager`s over ONE worker URL are two pools**, in both runtimes: the same
`scriptUrl`, two keys in `workerPools`, each running its own `config` (the `ingest` role's result on
one and the `score` role's on the other), and **1 and 2 threads mid-burst** under `maxThreads: 1`
and `2`. Decision 1 rests on this and it holds.

**4. The migration is 146 task nodes in 42 flows.** Over both corpora: **146 `workerType` nodes and
20 typed ones**, across eleven pool keys (`ScoreWorker` 45, `PublishWorker` 41, `IngestWorker` 26,
`ReviewWorker` and `SplitWorker` 11 each, `MergeWorker` 4, `TallyWorker` 3, `ExtractWorker` 2,
`WeighWorker`, `AttestWorker`, `RetryWorker` 1 each). **Every one of the eleven roles reads its
payload whole** (`confidenceOf(payload)`, `payload.text`, `payload.item`); only `typed` and `echo`
read an envelope. So prediction 1's second half is not a risk but a certainty with a count: all 146
change what their worker receives, and the stop-and-ask on the migration's shape is what decides
whether the workers or the expectations move.

**5. What `bootstrap` passes to `WorkerManager` today, captured through its own `createPool` hook
— the byte-for-byte target the identity derivation must reproduce.** `Echo`:
`{ maxThreads: 2, inline: false, idleTimeout: 0, config: { worker: <url>, config: { role: 'echo' } } }`;
`Scorer`: `{ maxThreads: 2, inline: true, idleTimeout: 0, groups: ['scorer'], config: { worker: <url>, config: { role: 'typed' } } }`.
Two things the target shows: a `groups` key is ABSENT when the type declares none rather than
present and empty, and `languages` is absent when no flow is given — so the derivation must omit,
not default, or the typed rows move (prediction 2).

**6. `idleTimeout: 0` with a contended resident group DEADLOCKS on 0.5.2**, both runtimes: two
pools each declaring `residentGroups: { vram: 1 }` over a `ConcurrentLimitGroup(1)`, the holder's
task `done`, the waiter's task **`pending` after 3 s** with no settlement, `scheduler.completed`
fired ONCE (for the holder) and `stats` reading `queued: 0, running: 0` — the reference's own
description reproduced to the field. Decision 9's refusal is a refusal of something real.

**7. A built pool exposes everything an observer needs**: `inline`, `maxThreads`,
`maxConcurrentTasks`, `idleTimeout`, `groups`, `residentGroups` and `config` are own enumerable
fields readable off the `WorkerManager`, in both runtimes. The exit artifact can assert a pool was
built as declared without reaching into anything private.

**8. A worker URL built from a base loads in a real thread** in Node and Deno
(`new URL('./workers/…', base)`, a task settling `done`). The browser half is not measured here and
is not a mystery: inside a bundle `import.meta.url` is the bundle ([Q261](../questions/q261.md)),
which is why decision 7 takes a `base` from the consumer.

**9. `M3`'s one-directory fixture reads 89 against a floor of 90 with this draft in** (88
without it). The declaration adds four work-item files to the same fixture, so **it WILL trip `M3`
and must retune `scripts/check-markdown.mjs` as a declared exception** — [Q142](../questions/q142.md)'s
shape predicted from a count before any document is written.
**CONFIRMED at the declaration**: with the four item files in, the fixture read **93** (whole tree
121 / 5199 / 263, both directories removed 74 / 3808 / 263) and probe 1 reported `wanted [M1,M3],
got [M1]`; the floor is **107**, near the middle of `(93, 121]`, `M4` at 3960 inside `(3808, 4758]`
untouched, and `check:markdown:selftest` reads 37 / 37 caught, 7 / 7 bounded at exit 0.

**Also learned, for the harness**: `FyflowScheduler.stats` is a property, not a method.

## Scope

**In**

1. **The registry document and its types** — `NodeTypeDefinition`, `PoolSpec`, the worker entry
   with four schemas, group types as factories — with every construction-time refusal, and the
   grammar change: `type` required on a task node, `pool?` added, `workerType` retired. The corpus
   migrated. **ADR 0053** (the validator) and **ADR 0054** (every task node is typed and receives
   the envelope; `workerType` retires).
2. **The runtime entry**, `fyflow-orchestration/runtime`: `createRuntime(document, code, options)`
   building groups, pools (default instances and named ones) and the driver's registry from the
   document; `start()`; run ids minted. `bootstrap` becomes the identity derivation's factory.
   `AGENTS.md` section 12 rewritten from a copy of the harness to a call. **ADR 0055** if the
   sub-path's placement or the run-id minting needs its own record; expected folded into 0054.
3. **The exit artifact**: `examples/**` rewritten with one worker module per worker, no roles, the
   registry document beside the flows, every L6 row running from documents, the sample flow at L6
   in both runtimes, and the revert costs.

**Out** — named, with where each goes

- **Enforcing `inputSchema` and `outputSchema` at run time, and any pre-flight over a transformed
  edge.** P19's strict mode; this plan declares and carries them.
- **Locking type config keys against instance overrides.** Decision 12; a later item if a type ever
  needs it.
- **A per-node or per-run choice of pool.** Routing, ADR 0001; a type builds pools and a node names
  one, at instantiation.
- **Node-type versioning** ([Q249](../questions/q249.md)), **`limitKey`** ([Q248](../questions/q248.md)),
  **a region's collection as a reference** ([Q219](../questions/q219.md)), **a reducer on a join**
  ([Q165](../questions/q165.md)) — unmoved.
- **Cancel, pause, durable runs** — `doc/concept.md` section 7, unmoved.

## The minimum sample

*The exit artifact, as documents. Everything the runtime builds is in the registry; the flow
references registry keys only; the shim is the whole of the consumer's code.*

**The registry document**, `registry.json`:

```json
{
  "workers": {
    "prompt": {
      "url": "./workers/prompt.ts",
      "configSchema":   { "type": "object", "required": ["model"], "properties": { "model": { "type": "string" } } },
      "settingsSchema": { "type": "object", "required": ["prompt"], "properties": { "prompt": { "type": "string" }, "temperature": { "type": "number" } } },
      "inputSchema":    { "type": "object", "required": ["text"] },
      "outputSchema":   { "type": "object", "required": ["answer", "confidence"] }
    },
    "fetch": { "url": "./workers/fetch.ts", "outputSchema": { "type": "object", "required": ["text"] } }
  },
  "groups": {
    "vendor": { "type": "RateLimitGroup",       "config": { "windows": [{ "limit": 60, "windowMs": 60000 }] } },
    "gpu":    { "type": "ConcurrentLimitGroup", "config": { "limit": 2 } },
    "budget": { "type": "DailyBudgetGroup",     "config": { "tokensPerDay": 2000000 } }
  },
  "nodeTypes": {
    "Prompt": {
      "worker": "prompt", "inline": false,
      "config": { "model": "small" },
      "pool": { "maxThreads": 4, "idleTimeout": 30000 },
      "groups": ["vendor", "budget"],
      "retryPolicy": { "maxRetries": 1, "backoffMs": 500 },
      "settings": { "temperature": 0 }
    },
    "Fetch": { "worker": "fetch", "inline": true }
  },
  "pools": {
    "prompt-big": { "type": "GpuModel", "config": { "model": "large" } }
  },
  "predicates": ["isLowConfidence"],
  "languages": ["jsonata"]
}
```

`Prompt` and `Fetch` are document-declared types; their default instances `Prompt` and `Fetch` are
implicit. `GpuModel` is a class registered in code (below), and `prompt-big` is a named instance of
it.

**The flow document**, `flows/triage.flow.json` — the grammar of `spec/flow-definition.md` v0.18
with `type` required and `pool?` added, nothing else changed:

```json
{
  "flowId": "triage", "version": 1, "entry": "fetch",
  "nodes": [
    { "id": "fetch",     "kind": "task", "type": "Fetch", "edges": [{ "to": "split" }] },
    { "id": "split",     "kind": "fanout", "branches": ["summarise", "classify"] },
    { "id": "summarise", "kind": "task", "type": "Prompt", "settings": { "prompt": "Summarise the text." },
      "edges": [{ "to": "collect" }] },
    { "id": "classify",  "kind": "task", "type": "Prompt", "settings": { "prompt": "Classify the text; report confidence." },
      "edges": [{ "when": "isLowConfidence", "to": "review" }, { "to": "collect" }] },
    { "id": "review",    "kind": "task", "type": "GpuModel", "pool": "prompt-big", "settings": { "prompt": "Classify carefully." },
      "edges": [{ "to": "collect" }] },
    { "id": "collect",   "kind": "join", "of": "split", "edges": [{ "to": "report" }] },
    { "id": "report",    "kind": "task", "type": "Prompt",
      "transform": { "lang": "jsonata", "expr": "{ \"text\": $join([*.answer], \"\\n\") }" },
      "settings": { "prompt": "Write the report." },
      "edges": [{ "to": "done" }] },
    { "id": "done",      "kind": "end", "outcome": "completed" }
  ]
}
```

**The shim** — the only code the consumer writes, and every line of it is theirs.

> **This sample was wrong in FOUR ways and three of them are in the block below** — [Q292](../questions/q292.md),
> and the retro corrected only the fourth (the class above), because correcting the rest would rewrite
> what the plan DECIDED rather than what it mis-spelled. **What the items measured**: the sub-path is
> `fyflow-orchestration/scheduler` and there is no `/runtime` (W66 decision 3); `createRuntime` takes
> **three** arguments, `(document, code, options)`, where the call below folds `base` into `code`
> (W66's finding 7); and a runtime needs `flows` beside `base`, because pools are built ONCE and a
> language's worker url reaches a pool through its config (W66's finding 8). `examples/run-flow.ts`
> is the shim that actually runs.

```ts
import { createRuntime, type NodeTypeDefinition, type PoolSpec } from 'fyflow-orchestration/runtime';
import { jsonata } from 'fyflow-orchestration/jsonata';   // the engine is loaded by this import and nowhere else (ADR 0052 rule 4)
import type { ResourceGroup } from 'fyflow-scheduler';
import registry from './registry.json' with { type: 'json' };
import triage from './flows/triage.flow.json' with { type: 'json' };

// A predicate is code, registered by name (ADR 0002 rule 3), as today.
const isLowConfidence = (ctx) => (ctx.outcome.result as { confidence?: number })?.confidence < 0.5;

// A custom resource group is the scheduler's own interface on an EventTarget: `canRun` and `getMetrics`
// are required, `onStart`/`onFinish` optional and given `(key?, cost?)` — fact 2, read off the .d.ts.
// The constructor is written LONG-HAND on purpose: a TypeScript *parameter property*
// (`constructor(readonly id: string, …)`) is what this sample carried until P18's retro, and
// Node 24 refuses it at load in strip-only mode — `RT-R9`, `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.
// `tsc` accepts it, so nothing here caught it; W67 did, by trying to LOAD it ([Q292](../questions/q292.md)).
class DailyBudgetGroup extends EventTarget implements ResourceGroup {
  readonly type = 'DailyBudgetGroup';
  private spent = 0;
  readonly id: string;
  private readonly tokensPerDay: number;
  constructor(id: string, tokensPerDay: number) { super(); this.id = id; this.tokensPerDay = tokensPerDay; }
  canRun(_key?: string, cost = 0) { return this.spent + cost <= this.tokensPerDay; }
  onStart(_key?: string, cost = 0) { this.spent += cost; }
  onFinish() {}
  getMetrics() {
    return { limit: this.tokensPerDay, running: this.spent, available: this.tokensPerDay - this.spent, utilization: this.spent / this.tokensPerDay };
  }
}

// A node type CLASS: a derivation from an instance's config to pool options. Its output is validated
// exactly as a document-declared type's is, so it cannot compute around a check.
class GpuModel implements NodeTypeDefinition {
  readonly worker = 'prompt';
  readonly inline = false;
  readonly configSchema = { type: 'object', required: ['model'], properties: { model: { enum: ['small', 'large'] } } };
  readonly config = { model: 'small' as const };   // the DEFAULT instance's config, validated against the schema above at createRuntime
  readonly retryPolicy = { maxRetries: 1, backoffMs: 500 };
  pool(config: { model: 'small' | 'large' }, _key: string): PoolSpec {
    const large = config.model === 'large';
    return {
      config: { model: config.model },
      maxThreads: large ? 1 : 4,
      idleTimeout: 30000,                         // never 0 beside a resident group: the runtime refuses it
      groups: ['vendor'],
      residentGroups: { gpu: large ? 2 : 1 },     // held per worker lifetime, at a cost
    };
  }
}

const runtime = createRuntime(registry, {
  base: import.meta.url,
  predicates: { isLowConfidence },
  groupTypes: {
    DailyBudgetGroup: {
      configSchema: { type: 'object', required: ['tokensPerDay'], properties: { tokensPerDay: { type: 'number', minimum: 0 } } },
      create: (config, key) => new DailyBudgetGroup(key, config.tokensPerDay),
    },
  },
  nodeTypes: { GpuModel: new GpuModel() },
  languages: { jsonata },                    // the document names it; the code supplies it (decision 13)
});

const driver = runtime.start(triage, { url: 'https://…' });   // a Driver: onFoldInput, resolve(), foldInputs(), as today
```

**A worker module**, `workers/prompt.ts` — the scheduler's contract, unchanged: a default-exported
class, its constructor receiving the type's `config`, `run` receiving exactly `{ settings, input }`
because the envelope worker fronts every pool:

```ts
import { BaseWorker } from 'fyflow-scheduler';
import type { BaseWorkerContext, TaskWorkerContext, WorkerConfig } from 'fyflow-scheduler';

export default class PromptWorker extends BaseWorker {
  private readonly model: string;
  constructor(config: WorkerConfig & { model: string }, ctx?: BaseWorkerContext) { super(config, ctx); this.model = config.model; }
  async setup(): Promise<void> { /* open the client once per worker instance */ }
  async teardown(): Promise<void> {}
  async run(envelope: { settings: { prompt: string; temperature?: number }; input: { text: string } }, _ctx?: TaskWorkerContext): Promise<unknown> {
    const { settings, input } = envelope;
    return callModel(this.model, settings.prompt, input.text, settings.temperature ?? 0);
  }
}
```

**The two interfaces**, for `src/definition/types.ts`:

```ts
export interface NodeTypeDefinition {
  readonly worker: string;                       // a key into `workers`; fixed per type
  readonly inline: boolean;                      // fixed per type; an instance may not override it
  readonly configSchema?: JsonSchema;            // the knobs an instance may set; validated before pool() is called
  readonly config?: unknown;                     // the DEFAULT instance's config ({} if absent); refused at createRuntime if it fails configSchema
  readonly retryPolicy?: RetryPolicy;            // the type's default for its nodes (W59)
  readonly settings?: Readonly<Record<string, unknown>>;   // defaults merged under a node's settings (decision 12)
  /** The derivation: a validated instance config and the instance's key, to what ONE WorkerManager needs. */
  pool(config: unknown, key: string): PoolSpec;
}

export interface PoolSpec {
  config?: unknown;                              // the worker's constructor argument; validated against workers[worker].configSchema
  maxThreads?: number;
  maxConcurrentTasks?: number;
  idleTimeout?: number;
  groups?: readonly string[];
  residentGroups?: readonly string[] | Readonly<Record<string, number>>;
}
```

A document-declared type is the runtime's built-in implementation of `NodeTypeDefinition` whose
`pool()` merges the instance's overrides over the declared fields; `bootstrap`'s work today is
exactly that derivation with an empty override.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W65 | **The registry document, and a node type is a derivation — ADR 0053 and ADR 0054.** `NodeTypeDefinition`, `PoolSpec`, the worker entry with its four schemas, group types as factories; the validator (ADR 0053, priced at the declaration); `type` required and `pool?` on a task node, `workerType` retired (ADR 0054), `FD-V23`/`FD-V32`/`FD-V34` folded into one rule and the settings check reading a schema; every construction-time refusal as a named error; the corpus migrated (`spec/examples/registry.json` becomes a registry document; every `workerType` a `type`) | `src/definition/**`, `spec/flow-definition.md`, `spec/README.md`, `spec/examples/**`, `test/definition/**`, `test/driver/**`, `doc/decisions/0053-*`, `doc/decisions/0054-*` | nothing | L0-L5 in five runtimes with every refusal fixtured; the identity derivation equal to `bootstrap`'s options for every existing type; rule 8 obligation (a) over every field of both interfaces and both shapes of a type |
| W66 | **The runtime entry — `fyflow-orchestration/runtime`.** `createRuntime(document, code, { base })`: groups from factories (three built-ins, custom ones, collisions and interface refused), pools from types (default instances implicit, named instances, decision 9's refusal), languages from the `code` argument against the document's names (decision 13), the driver's registry derived from the document and exposed as `runtime.registry` (decision 14), `start()` minting run ids, `live-token` by default; `bootstrap` reduced to the identity derivation's factory; both manifests export the sub-path; `AGENTS.md` sections 12-14 rewritten from a copy of the harness to calls; ADR 0055 if needed | `src/scheduler/**`, `src/runtime/**` (new), `package.json`, `deno.json`, `test/scheduler/**`, `test/runtime/**` (new), `AGENTS.md` §12-§14, `doc/decisions/0055-*` | W65 | L0 under all five typechecks; L1 on real inline and threaded pools built from a document in both runtimes; `check:source` on the new sub-path (the root loads no validator — `S14`'s shape a third time); `check:docs` on the rewritten section |
| W67 | **The exit artifact.** `examples/**` rewritten — one module per worker, no roles, the registry document beside the flows, `run-flow.ts` reduced to observers over a runtime; the sample flow at L6 in both runtimes with the custom type and custom group; every existing row re-derived on `type`; the revert costs of W65, W66 and W67 | `examples/**` | W66 | L6 in both runtimes at a RE-TAKEN count, every existing row's claims intact under the migration; rule 8 over the rows' discriminating pairs (a node on the default instance against one on a named instance of the same type; a document type against a class type deriving the same options) |
| W68 | *reserved — expected unused* | | | |

**Why serial and in this order.** W66 builds pools from types W65 defines; W67 runs flows on a
runtime W66 builds; and all three touch the corpus or the manifests, which section 7 rule 2 makes
serial whatever the order. W65 ships something observable — a document validated and refused at
L1 — so the plan's first item is not P11's shape.

**Exceptions the items seed their tables from** — P16's retro recorded that a table seeded from the
previous item's late exceptions predicted W59's; P17's retro measured it working once (W63); this
plan writes the seed at the declaration rather than leaving each item to discover it:

| item | predicted exception | why |
|---|---|---|
| W65 | `scripts/check-spec.mjs` and its self-test | `C7` reads typed tasks and `registry.json`'s `nodeTypes` and `languages` (W61's table); the registry document's shape moves under it, and `C4`'s refusal count moves when `FD-V23` and `FD-V34` fold |
| W65 | `scripts/build-browser-tests.mjs` | it inlines `spec/examples/**` JSON; a registry document beside `registry.json` is one more fixture (W54's shape) |
| W65 | `AGENTS.md` §3 | the refusal count and the *four node kinds* sentence twelve lines below any table (W59's reader, W61's table) |
| W65 | `spec/README.md` | `C8`'s version row, a consequence of the `spec/flow-definition.md` bump |
| W66 | `scripts/check-source.mjs` and its self-test | a clause that the root and the scheduler sub-path load no validator, `S14`'s shape a third time (W62's table) |
| W66 | `scripts/check-docs.mjs` and its self-test | a fourth sub-path rewrite for `fyflow-orchestration/runtime`, and `RUN_FLOOR` moving with §12-§14's snippets (W59's, W62's tables) |
| W67 | `spec/outcome-record.md` §4, `spec/run-state.md` §7 | the corpus split moves if the sample flow's task nodes change the count (W61, W63) |
| the declaration | `scripts/check-markdown.mjs` | fact 9: `M3` trips on the four item files |

## Predictions, to be written down BEFORE the items that test them

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **Retiring `workerType` costs 0 at L1-L5 on every routing and fold assertion, and changes what a bare node's worker RECEIVES on every corpus flow** — the envelope where the payload was | fact 4 (the count) and ADR 0040 rule 6; measured on the corpus before migration | a routing or fold assertion that reads a worker's payload shape — which would mean the driver's dispatch and the fold were not as separate as ADR 0014 says |
| 2 | **The identity derivation reproduces `bootstrap`'s `WorkerManagerOptions` byte for byte for every existing type**, so the typed rows of P16 and P17 keep their numbers unmoved | fact 5, measured on `NODE_TYPES` before W65 | any typed L6 row moving — a derivation that added, dropped or reordered an option |
| 3 | **No `FD-R` and no new node kind**: every refusal this plan adds is an `FD-V` or a construction error naming a registry key | decisions 6 and 9 | a document defect that is only visible at run time — which would mean a check belongs at construction and was not put there |
| 4 | **REACH: the JSON Schema subset the corpus and the sample need is small enough that a built-in validator covers it with no second dependency** — **and fact 1 already confirms it on the sample**: a 32-line subset validates 14 of 14 of the sample's cases at 1.5 KB bundled | fact 1 — over the sample's and the corpus's schemas, NOT over what a consumer might write, which is what makes it the reach prediction and why it is still written down | a schema feature a real worker needs outside the subset — in which case ADR 0053 declares the dependency the way ADR 0052 did (`@cfworker/json-schema` at 42 KB is the priced one), and the prediction was right to be stated as a reach |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| Q278 | **A keyword outside the built-in subset is IGNORED or REFUSED, and ignoring is the silent kind.** Fact 1 chose the subset; JSON Schema's own semantics ignore an unknown keyword, so a worker's `pattern` would silently constrain nothing. **Decided at the declaration: REFUSED at construction naming the keyword**, which is also what makes prediction 4's reversal legible | W65 |
| Q279 | **A grammar change is BREAKING for every flow document and nothing signals it.** 146 of 166 corpus task nodes carry `workerType`; the package reads `0.1.0` in both manifests and a document's `version: 1` has no written meaning ([Q249](../questions/q249.md) is the type half). The smallest honest move is `0.2.0` at W67's close with the change named | no owner — this plan's record step |
| Q280-Q292 | *reserved for the items* | |
| [Q64](../questions/q64.md) | *Nothing tells a consumer how to use the library* — the runtime entry and `AGENTS.md` section 12 as a call are this plan's answer to it; the row is re-read at the declaration and closed or narrowed by W66 | W66 |
| [Q20](../questions/q20.md), [Q85](../questions/q85.md) | *Is a run id global* — the runtime mints it; answered in passing, recorded by W66 | W66 |
| [Q263](../questions/q263.md) | the three arities as P19's sample shapes — carried, untouched | P19 |
| [Q261](../questions/q261.md) | a bundle's `import.meta.url` — decision 7's `base` is its consequence, not its closure | unchanged |

## Slices beyond this plan, in order

1. **P19 — strict mode**: `inputSchema` and `outputSchema` enforced at run time, a transform's
   declared output against what it produced, and the sample-based pre-flight over a transformed
   edge — with this plan's declarations and Q263's three arities as its inputs.
2. **Locking type config keys**, if a type ever needs it (decision 12).
3. **Node-type versioning** ([Q249](../questions/q249.md)), once a registry document exists to
   version.

## Stop and ask a human

- ~~**The validator** (ADR 0053), PRICED by fact 1: a built-in subset at **1.5 KB** with its
  limits enumerated in the fact, `@cfworker/json-schema` at **42 KB** with no dependencies, or
  `ajv` at **262 KB** over five packages.~~ **Answered at the draft, 2026-09-15: the SUBSET**, with
  the 42 KB dependency as prediction 4's reversal condition. Recorded in decision 8.
- ~~**`settings` defaults on a type** (decision 12): keep the one new field, or strike it.~~
  **Answered at the draft, 2026-09-15: KEPT.** Recorded in decision 12.
- ~~**A type whose config admits no default**: refuse the type, or refuse the node.~~ **Answered at
  the draft, 2026-09-15: every type has a default instance built from its `config`, and a type
  whose own `config` fails its own schema is refused at `createRuntime`** — the maintainer's *must
  be present in the registry*, which the first draft's node-level refusal contradicted. Recorded in
  decision 1.
- **The corpus migration's shape**: rewrite the corpus's workers to read `input` from the envelope,
  or rewrite the rows' expectations — the first keeps every expected value derived from the same
  worker text, the second is smaller; fact 4 sizes both.
- **The sub-path's name**: `fyflow-orchestration/runtime` beside `/scheduler`, or `/scheduler`
  growing `createRuntime` — P16 decision 5's *one sub-path that constructs scheduler objects* argues
  for the second; a runtime that also mints run ids and holds a driver factory argues for the first.
- **Whether a `map` branch node may name a named pool instance**, or only its type's default —
  decision 11 says the type; nothing yet says the instance.
- **Anything that would change what a typed node receives today, or move an existing L6 row's
  claims** beyond the migration's own change (`workerType` to `type`) — prediction 2 forbids it.

## A note on ids

**Reserves W65-W68, Q278-Q292, ADR 0053-0055.** Derived from P17's retro's own sentence and
confirmed against the tree: the highest work item on disk is W63 with W64 reserved and closed
unissued; the register's highest row is Q276 with Q277 spent; the highest decision is ADR 0052.
Fifteen questions, on the argument every plan since P15 has made — the block is sized by the worse
case; two are spent by this declaration. Three ADRs, two expected taken (0053 the validator, 0054
the grammar), 0055 expected folded into 0054.

## The baseline this plan was declared on

**Re-taken at the declaration, 2026-09-15, on `e6ea29a` plus this declaration's uncommitted
edits** — the four item files, this file, the register, the three indexes and the `M3` retune —
with the tree held still by a content digest over every tracked and untracked-unignored file,
every rung RUN and never PIPED, each redirected to `dev-dist/p18/` and read by its exit code:

```
GATE EXIT=0, zero lines beginning FAIL, 15 chain entries      (dev-dist/p18/decl-gate.log)
BROWSER-ALL EXIT=0                                            (dev-dist/p18/decl-browser-all.log)
38 file(s), 979 assertions, in node 24.20.0, deno 2.9.6, chromium, firefox and webkit
1501 assertions at L6, 0 failed, 50 real runs on fyflow-scheduler 0.5.2, in node and deno
spec        - 7 documents, 55 examples, 104 rules, 35 refusals
docs        - 28 snippets: 22 run, 6 check
markdown    - 121 documents, 5199 relative links, 263 anchored
register    - 217 questions, 164 open, 2 deferred, 51 resolved  (census parser, 0 aborts)
M3 / M4     - 93 against 107 / 3808 against 3960 — fact 9 confirmed and the floor retuned
check:markdown:selftest - 37 / 37 probes caught, 7 / 7 bounded, exit 0
digest      - a9b3a97ac4425633 over 301 files, before the gate, after it, and after the browser rung
```

*The draft's own baseline was P17's retro's on the clean commit — GATE EXIT=0, 38 / 979, 1501 / 50,
7 / 55 / 104, markdown 116 / 5151 / 261, register 215 / 162 / 2 / 51, digest `621b4e7c2cb49927`
over 296 files. Every figure the declaration could move, moved by exactly what it added: five
documents, forty-eight links, two anchors, two questions.*

## Record

*Filled in at the join, after the work items are merged. Empty while this is a draft. Each item's
paragraph is written when the item closes; the join reads them together.*

### W67 — done 2026-09-16

**The exit artifact: a flow and the runtime it needs, from TWO JSON DOCUMENTS and a shim, on a real
`FyflowScheduler` in both L6 runtimes.** `examples/registry.json` says what exists — fourteen worker
modules, five groups, fifteen node types, one NAMED pool instance, three predicate names, one
language — `examples/flows/triage.flow.json` names registry keys and nothing else, and
`examples/run-flow.ts` is a SHIM: `createRuntime` once, the four things decision 7 keeps as code, and
observers. **No `pool()` call, no group built by hand, no `Driver` built by hand, and no role switch**
— one worker file with a twelve-arm `switch` became **fourteen modules, one per worker entry**, and
the binding that replaced `ROLES` is the document's worker keys against the modules ON DISK, both
ways. L6 is **1610 assertions over 53 real runs** in both runtimes, from 1502 / 50; L1-L5 **41 / 1112
in five runtimes**; `spec/` unmoved at **7 / 55 / 106 with `C4` at 34**, which is what an exit
artifact's must be.

**Its declaration step found four things wrong with this plan's own SAMPLE and one blocker the plan
did not have.** W66 recorded three; the fourth was measured here and is new — the sample's
`DailyBudgetGroup` uses a constructor PARAMETER PROPERTY, which Node 24 refuses at load, so **the
sample does not run** (`RT-R9`, the rule `S4` enforces over `src/` and which reaches no plan
document; [Q292](../questions/q292.md)). **The blocker**: a registry document could not declare a
group that only NODES name, because `createRuntime` handed every declared group to `bootstrap`, whose
direction-two refusal is right for a helper taking OBJECTS and wrong for a document declaring the SET
`FD-V31` reads — measured, put to the maintainer, and fixed in `createRuntime` with direction one
untouched ([Q291](../questions/q291.md)). **[Q279](../questions/q279.md) is RESOLVED** here by the
maintainer's answer: both manifests read `0.2.0` and `README.md` names the breaking change.

**The two `triage` rows carry every shape the exit artifact names, each read from the run**: a
DOCUMENT type and a CLASS type over ONE worker, so the pools differ in their DERIVATION alone; a node
on its type's DEFAULT instance and one on a NAMED instance of that type, told apart by the pool the
scheduler says each ran on AND by what the worker returned; a built-in group and a custom one; the
type's `settings` default reaching one and not the other; and a declared transform reducing `JP-R12`'s
record with no reshaping node. **Reverting each item at L6 on the tree that ships: W65 309, W66 1,
W67 1** — and W66's group-member check removed costs **0**, a refusal with no live case, recorded.

**Readers 14 / 7 blocking and 16 mutations / 9 survivors / 7 blocking, overlap 1 — the fortieth
measurement**, and their split held. The conformity reader re-derived every expected value of both
rows on paper and found **zero disagreements**; what it found were claims — a count stale by two in
the two documents a reader opens first, *thirteen node types* where the document declares fifteen,
and **`run-flow.ts` claiming every non-threaded row runs the document AS IT IS ON DISK when it does
not**, the assertion being right and the three sentences citing it wrong. The adequacy reader found
bounds that were not there, every one in a direction the author's 45 probes never took: the custom
group's name/key pair carried by a string in a factory (W59's own finding inside the fixture built to
correct it); `poolOfTask`'s *read off the scheduler* falsifiable at zero by the expression its own
note names; clause (iii)'s stated reason false of every field it read; **Outputs (1) held by nothing
anywhere**, since `S16`'s scope is the published set; the whole per-row layer out for three edits and
an integer; and **decision 10's two defaults reached by nothing** — this plan's own shim is
`runtime.start(flow, payload)` with NO options, the one call this rung never made. It makes it now,
on `p1-routed-away` at LOW, where *the run completed* IS *the default is `live-token`*.

**Rule 8: author pass 45 probes / 30 caught / TEN undeclared survivors; final pass with the readers'
sixteen edits in, 64 probes, 51 caught, 7 declared ceilings each RUN, 0 undeclared, 0 crashes,
0 aborts, 0 against declaration, 6 measured**, the tree held still by a content digest. Two aborts on
the way were rule 7 (b) on anchors this item's own edits had moved; one probe came back CAUGHT
AGAINST ITS DECLARATION, the declaration having been written before the membership that now catches
it. **And a crash is not a detection, in the two blocks added AFTER the guard that says so** — the
shim run sits outside the row loop and block (2e) dereferenced `reports[-1]`; both now fail naming
themselves. **Late exceptions ONE, zero undeclared** (`spec/flow-definition.md` §3, one sentence this
item made false). Census **230 / 176 / 2 / 52**, 0 aborts on a parser written from scratch — which was wrong ONCE, adding its three exempt rows to the three counts and not to the total, and said so rather than reporting a plausible sum. `npm run gate` **EXIT 0, zero FAIL lines**, digest `37a8669ded4dcdb8` over 328 files before and after. Q289-Q292 raised, Q99 extended, Q279 resolved.

### W66 — done 2026-09-16

**The runtime entry — `createRuntime` in `fyflow-orchestration/scheduler`, and there is no
`/runtime` sub-path** ([ADR 0055](../decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md),
`RT-R13`, `S16`). Its declaration step re-ran facts 2, 3, 6, 7 and 8 — byte-identical in both
runtimes — and **found decision 4 wrong in BOTH directions**: measured one omission at a time on a
real scheduler, a group with no `getMetrics` (which this plan says to refuse) runs to `done`, and one
with no `onStart` THROWS while one with no `onFinish` leaves every task naming it running for ever
with the scheduler reporting idle — both of which this plan calls optional. The maintainer took the
UNION of the two lists; the mismatch is raised upstream as [S10](../scheduler-upstream.md), the first
item that register has raised since W37. **Three more of this item's own lines rested on premises that
had expired**: the third `RT-R` rule it was declared to write (ADR 0053 had already put the validator
in the root, and said so), the sub-path's name (P18's own open stop-and-ask, answered here), and the
signature and `flows` argument the plan's sample shim implies. **Decision 14 was false as first
built** — `runtime.registry` carried the document's predicate NAMES where a driver wants the
functions, so a `Driver` built by hand from it refused a VALID flow — found by the conformity reader
with a probe. **And the item's own instrument had the defect it was fixing**: `check-source`'s
source scan blinded `S2`, `S3` and `S4` over 16 137 characters of `driver.ts` through an apostrophe in
a template literal, and the replacement had the same hole one construct over, found by the adequacy
reader. L1-L5 **41 / 1111 in five runtimes**, L6 **1502 / 50 unmoved** (this item adds no row),
`spec/` **7 / 55 / 106**, readers 22 / 10 and 46 mutations / 22 / 13 at overlap 2, rule 8 52 probes /
50 caught / 0 undeclared, census **226 / 173 / 2 / 51**. Q285-Q288 raised.

### W65 — done 2026-09-15

**The registry document and its types, the subset validator, the grammar, the corpus migrated —
[ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
and [ADR 0054](../decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
`spec/flow-definition.md` v0.19.** Its declaration step found this plan's own ordering impossible —
24 of 24 L6 flows carried `workerType` and the harness read the old type shape — and the maintainer
chose to migrate `examples/**` in W65 rather than W67, so `examples/` already has no `pool()` call
(the role switch is W67's). **Predictions**: 1 CONFIRMED at L1-L5 — no routing or fold assertion moved,
only payload reads, and reverting the envelope on the bare road costs **114** at L6; 2 CONFIRMED as
CANONICAL JSON — the typed rows of P16 and P17 unmoved at 1502 / 50, key order being today's literal's
and not a rule's (Q284); 3 CONFIRMED — `FD-V38` and eleven `RegistryError` classes, no `FD-R`, no node
kind; 4 held on the sample and the corpus (fact 1's 14 of 14 as fixtures, the corpus registry resolving
with nothing refused) and stays a reach over what a consumer writes. **What the item found that this plan
did not say**: a task that is not a flow's on a shared scheduler must carry the envelope now that every
pool is a type's (Q280); a worker's `settingsSchema` is shared by every type over that worker (Q282);
`new Driver` runs the registry's SHAPE half and never a derivation, which three documents overclaimed
until the readers read them; and `in` walked `Object.prototype` in the subset's object keywords. L1-L5
**40 / 1065 in five runtimes**, L6 **1502 / 50**, spec **7 / 55 / 105 / 34**, readers 26 / 12 and
21 / 16 / 12 at overlap 2, rule 8 103 probes, 91 caught, 6 declared ceilings each RUN, 5 measured, 0 undeclared, 0 crashes, 0 against declaration on the final pass, 1 abort re-anchored and caught, ten late exceptions and zero undeclared, census
**222 / 169 / 2 / 51**, 0 aborts.

## Retro

**Run 2026-09-16, after W65, W66 and W67 were done. `doc/workflow.md` section 6 pass 3, and it takes
that document to [v0.19](../workflow.md) — ONE change adopted, SIX refused.**

P18 asked *can a flow and the runtime it needs be defined as two DOCUMENTS and a registry of names,
with the library doing every instantiation?* Three items, six reader passes, three ADRs, and an exit
artifact that is two JSON files and a shim on a real `FyflowScheduler` in both L6 runtimes. At the
declaration: `spec/` **7 / 55 / 104**, L1-L5 **38 / 979**, L6 **1501 / 50**, register
**217 / 164 / 2 / 51**, both manifests `0.1.0`. It closes at **7 / 55 / 106 with `C4` at 34**,
**41 / 1112**, **1610 / 53**, **230 / 176 / 2 / 52**, and **`0.2.0` with the change named as
BREAKING** — the first version bump this repository has made for a reason rather than for a pin.
Every figure re-taken here on `b44b1d2` with the tree held still by a content digest, each rung RUN
and never PIPED, redirected to `dev-dist/p18-retro/` and read by `$?`.

**Its central finding is that v0.17's dated-ceiling clause was followed in the WRITING and not in the
RUNNING, and that the retro is still the thing that catches it.** [W65](../work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)
declared two ceilings that name the item which would expire them. W67 re-ran one of them — `b15`, as
its own `a11`, saying so in the probe's `why` — and it holds. It did not re-run the other, `e7`,
**whose stated reason is the words *a ceiling with a date* and whose sentence names W67**; W67 shipped
the named pool instance that expires it, and re-anchored onto the tree that ships the probe is
**exit 1 on the `triage LOW` row**. One hit and one miss, in one plan, on the same clause, by the same
item. *A clause that tells an author to re-run something tells the author who WROTE the ceiling, not
the author who EXPIRES it.*

### Name the rung, and it is this retro's shape

| | defect | rung |
|---|---|---|
| W65 | the item's own ORDERING did not exist — 24 of 24 L6 flows carried `workerType` and the harness read the old type shape, so staging the grammar behind W67 was impossible | **none** — the declaration step, measured before anything was built |
| W65 | W19's foreign tasks landed on envelope-fronted pools with a raw payload, six settling `user_action` under `NotAnEnvelope` | **L6 — it FIRED**, two of the first run's five failures, read correctly |
| W65 | two cross-row clauses discriminated on *typed*, which every node now is, and their subjects named the old strings | **L6 — it FIRED**, three of the five |
| W65 | the spec's own refusal-count paragraph bound by nothing (`d1`) | **none** — the author's own set, its one UNDECLARED survivor; closed by a `C4` clause |
| W65 | `AGENTS.md`'s refusal sentence compared to nothing (`d4`); the validator's header count (`d3`) | **none** — the author's own set, both measured 0; the first closed by **`X7`**, a new `check:docs` clause |
| W65 | `in` walked `Object.prototype` at three object-keyword sites: `required: ['constructor']` satisfied by `{}` | **none** — conformity reader, re-deriving the keywords on paper |
| W65 | `checkRegistry` had no undeclared-key check on a worker or a pool, so a typo'd `settingSchema` silenced the schema and every settings value passed | **none** — adequacy reader, and it was a PROBE rather than a mutation: the code as it stood accepted it |
| W65 | a hand-written list of eleven error classes bound by a literal `11` — a twelfth would have passed | **none** — the author's own set, via a rule 7 (b) ABORT (`d6`) whose reading found it |
| W65 | `C4`'s headline probe pinned to 35; two META entries refused by one mutation | **`check:spec`'s self-test — it FIRED**, rule 7 (b), re-anchored |
| W65 | `S3` read a parameter named `document` as the DOM global; `S6` wanted the two new modules in the JSR allowlist | **`check:source` — it FIRED twice**, read correctly |
| W65 | a worker's `settingsSchema` is the WORKER's, so §13's snippet needed two entries over one url | **`check:docs` `X4` — it FIRED** on the rewritten snippet |
| W65 | a one-off migration script read the ORIGINAL bytes for two edits on one file — W37's and W58's defect verbatim, outside the rule-8 harness whose clause forbids it | **none** — an instrument |
| W65 | a range edit cut two fields of a return type; four backtick apostrophes inside template literals | **L0 and L1 — they FIRED**, two each |
| W65 | the Gate line named L0-L5 and `check:spec` and not L6, and L6 is the only rung that sees the cross-row layer | **none** — adequacy reader (`M11`, caught by `DECLARED_TOTAL` alone — [Q217](../questions/q217.md)'s shape) |
| W65 | **no class-form node type reached `new Driver` in any suite**, so a driver blind to a class's policy and defaults was green everywhere — the Gate line's own *both shapes* | **none** — adequacy reader |
| W65 | the subset's size stated as the PROTOTYPE's (1.5 KB where the shipped module is 4 259); `FD-C5`'s row not moved to v0.19; `checkRegistry`'s reach overclaimed in three documents; `spec/` **104** where `check:spec` says 105 | **none** — conformity reader, four claims that were false |
| W66 | **P18 decision 4's refusal list wrong in BOTH directions** — it refuses a group that works (no `getMetrics`) and accepts one that leaves every task naming it running for ever in silence (no `onFinish`) | **none** — the declaration step, one omission at a time on a real scheduler; [ADR 0055](../decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md) and [S10](../scheduler-upstream.md) |
| W66 | the item's own `Spec`, `Gate` and `Out` lines rested on a premise ADR 0053 had struck — *the root loads no validator* — so the `RT-R` rule it was declared to write had no subject | **none** — the declaration step, reading its own file against a decision three commits old |
| W66 | `runtime.registry` was not what the runtime hands its drivers: `predicates` held the document's NAMES, so **a `Driver` built by hand from it refused a VALID flow under `FD-V4`** | **none** — conformity reader, with a probe; the test asserting the claim had the claim in its TITLE and no driver in its body |
| W66 | *both ways* was ONE way for predicates and languages — an adapter supplied and named by no document dropped in silence | **none** — conformity reader |
| W66 | the Gate line promised *L1 on real pools* and every call went through a seam | **none** — the readers; the runtime was never built with a real `WorkerManager` in any suite |
| W66 | `check-source`'s `scan()` — the fix for an apostrophe in a template literal — had the same blind spot one construct over, in a REGEX literal, and could make `S16` FALSELY fire | **none** — adequacy reader, in the instrument this item had just fixed |
| W66 | a constructor PARAMETER PROPERTY took ladder L1 down with **zero FAIL lines** ([Q272](../questions/q272.md)'s shape) | **`check:source` `S4` — it FIRED and named it in one line**, which is why the crash was legible |
| W66 | the first `npm run gate` over the final tree RED on one line: `check:docs`' self-test *wanted [X3,X5], got [X3,X4,X5]*, because §12's snippet now EXECUTES | **the gate's own self-test — it FIRED and was READ correctly**, rule 7 (c) working |
| W66 | `d3` declared a catch by the author and re-declared a ceiling; `a5`'s member list declared a KIND with no fixture of the wrong kind; `a12`'s `live-token` default inert because every flow was LINEAR | **none** — the author's own set, three undeclared survivors it read itself |
| W66 | the house style's backtick apostrophe broke a patch script four times; the tree moved under the conformity reader | **none** — instruments, and section 6's hold-still rule, which that reader paid for by pinning every measurement to a digest |
| W67 | **the plan's own SAMPLE does not LOAD** — `DailyBudgetGroup`'s constructor is a parameter property, `RT-R9`, which `tsc` accepts and Node 24 refuses | **none** — the declaration step, by trying to load it; `S4`'s rule reaches no plan document ([Q292](../questions/q292.md)) |
| W67 | a registry DOCUMENT could not declare a group only NODES name, because `createRuntime` handed every declared group to `bootstrap`, whose direction-two refusal is right for a helper and wrong for a document | **none** — the declaration step, measured and put to the maintainer ([Q291](../questions/q291.md)) |
| W67 | this item's own `Verification` row carried **1501**, W63's number, where L6 has been 1502 since W65 | **none** — the declaration step re-taking a handed number, section 1 rule 5's provenance clause |
| W67 | the L6 count stale by two in the two documents a reader opens first; *thirteen node types* where the document declares fifteen; a `heldGroups` comment arguing to exclude the two tasks the literal below it declares | **none** — conformity reader |
| W67 | `spec/flow-definition.md` §3 still said the runtime FOLDS the helper's both-ways refusal in — true when W66 wrote it, false the moment stop-and-ask 1 shipped | **none** — conformity reader, section 1 rule 5's third direction |
| W67 | **`run-flow.ts` said every non-threaded row runs the document AS IT IS ON DISK, and it does not** — the ASSERTION was right and the three sentences citing it were not | **none** — conformity reader; the one subject both readers shared |
| W67 | the custom group's *name differs from its key* rested on a string inside the factory — making the two equal cost ZERO | **none** — adequacy reader; **W59's own finding inside the fixture built to correct it**, and v0.13's discriminating-pair requirement |
| W67 | `poolOfTask`'s *read off the scheduler* falsifiable at ZERO by the expression its own note NAMES; clause (iii)'s stated reason false of every field it read | **none** — adequacy reader, obligation (c) |
| W67 | **Outputs (1) held by nothing anywhere** — a hand-built `ConcurrentLimitGroup(99)` in the shim cost 0, because `S16`'s scope is the published set and `examples/**` is outside it | **none** — adequacy reader, obligation (b) |
| W67 | the whole per-row `poolOfTask` layer out for three edits and an integer | **none** — adequacy reader; v0.14's *a count is not a membership*, in the file that records the clause |
| W67 | **P18 decision 10's two defaults reached by nothing** — the plan's own shim is `runtime.start(flow, payload)` with NO options, the one call this rung never made | **none** — adequacy reader; both defaults replaceable by a `throw` for zero, on the item that was the last chance to observe them |
| W67 | **a crash is not a detection, in the two blocks added AFTER the guard that says so** — the shim run sits outside the row loop, and block (2e) dereferenced `reports[-1]` | **none** — the item's own rule 8 re-run, reading the failure lines; W59's shape twice over |
| W67 | **a harness that does not pin the runtime it MEASURES reports the environment as the product** — four probes CRASH on a correct tree and a correct edit, because the shell had no `fnm use 24` and `node` resolved to 16 | **none, and none can**: v0.11's control sees what a probe ADDS and is blind by construction to what every probe shares |
| W67 | one probe came back CAUGHT AGAINST ITS DECLARATION — declared a ceiling on reasoning written before the membership that now catches it | **none** — the author's own set, read correctly and kept as the catch |
| W67 | two aborts on anchors this item's own edits had moved | **rule 7 (b) — it FIRED**, both re-anchored agnostically |
| W67 | the census parser wrong once — its three exempt rows added to the three counts and not to the TOTAL | **none, and it is the parser working**: it said so and exited 1 rather than printing a plausible sum |
| the retro | **W65's `e7` ceiling is a CATCH on the tree the plan ships**, dated to W67 by name and not re-run there | **v0.17's dated-ceiling clause — it did NOT fire in the item; this retro's re-run found it** |
| the retro | **Q289-Q292 in NO cluster cell** — W65's five and W66's four all reached one, W67's four reached none — and **Q206 resolved with no Resolved-table row**, alone among 47, since W49 in P14 | **none** — this retro's own census; P18's three item parsers carry no cluster check |
| the retro | the register's headline stale by THIRTEEN through the whole plan — 217 / 164 / 2 / 51 while the items recorded 222, 226 and 230 in their own files | **none** — P17's retro's finding one plan later, on the one count here a machine can compare ([Q253](../questions/q253.md)) |
| the retro | **W65's `c5` ceiling's SITE was DELETED** by W67's migration — `registryFor`, `NODE_TYPES`, `POOLS` and `WORKERS` are gone as code, so the two readings of one literal it named collapsed into the document | **none, and no clause says what to do**: a ceiling whose subject is deleted is neither confirmed nor falsified |

**Forty-six defects. NINE rows name a rung that FIRED and those nine name ELEVEN firings** — two
the L6 rung on the migration's own first run, four the source and docs checks (`S3`, `S6`, `S4`, `X4`),
two a check's self-test, two L0 and L1, one rule 7 (b) — **and every one of the eleven was READ
correctly.** **A TENTH row names a rung that did NOT fire where it should have**, and it is this retro's
central finding: v0.17's dated-ceiling clause, on W65's `e7`. **Thirty-six have no rung, and SEVEN of
those are in the INSTRUMENTS** — a migration script's two edits on one file, a patch script's backtick
apostrophes, `scan()`'s missing regex branch, an l6 block with no catch of its own, a census parser's
first sum, a probe declared against a membership that did not yet exist, and a shell without
`fnm use 24`. **And SIX were
found at a DECLARATION STEP, which is the highest of any plan**: an item re-running the facts it was
handed found its own ordering impossible, the plan's refusal list wrong in both directions, the plan's
sample unable to load, its own `Spec` line's premise struck, a blocker the plan did not have, and a
number in its own file stale by one item.

### The one change

**Rule 8's requirement on the HARNESS gains: it asserts the ENVIRONMENT its rungs need.** A control
answers *does a probe that changes nothing come back clean*, and it is blind **by construction** to
anything the clean run and every probe share. [W67](../work-items/w67-a-flow-from-documents-on-real-workers.md)'s
re-run produced four CRASH verdicts on a correct tree and correct edits, because the shell it ran in
had no `fnm use 24`: `npm run test:l6` resolved `node` to 16, every `.ts` entry point failed at
`ERR_UNKNOWN_FILE_EXTENSION`, and a rung that cannot START is indistinguishable in the report from a
rung a probe took DOWN. The harness refuses to start below Node 24 now, in four lines, naming the
command to run.

**One occurrence, and the argument for why it generalises is the mechanism rather than a second
instance** — which is how obligation (c)'s LIMIT and P15's *independent* clause were both taken. Every
existing requirement on the harness is about a probe that RAN: the control sees what a probe ADDS, the
byte-asserted restore sees what it LEFT, the per-edit anchor sees what it MATCHED, the digest sees what
MOVED. **None of them can see a constant.** It composes with P15's clause — *the second observer must
not be downstream of the first's apparatus* — as its outer case: there the instrument was inside the
measured graph, here it is underneath every measurement at once. And this repository has the hazard
written down in `CLAUDE.md` in as many words — *Node 16 is what a bare `node` resolves to here*, there
since W5, measured by `git log -S` over that file — and it still cost four probes in a harness written
115 commits later, which is v0.15's own finding about a sentence sitting in the wrong document.

### Six refused, each with a measurement

- **A `doc/` check, the SEVENTEENTH time — and this plan is the first to SATISFY the standing
  refusal's own criterion.** The refusal has always been *a number in prose is checkable and a sentence
  is not*. Of the eight stale counts and expiry-dated claims this plan produced, exactly **one** was a
  number a check could derive from another file — `AGENTS.md`'s refusal count against
  `spec/flow-definition.md` section 5's rows — and **W65 BUILT that check**, as `X7`, with a probe and a
  grading, in the item that produced the staleness. Three more are machine-comparable and all three are
  the REGISTER's: its headline against the census parser's own sum (stale by thirteen through the whole
  plan), a question in no cluster cell, and a resolved row with no Resolved-table row. **The one thing
  that can compare all three is the census parser, and it is untracked in `dev-dist/`** —
  [Q253](../questions/q253.md)'s shape for the third plan running, and the third plan to write a parser
  from scratch rather than keep one. The rest are sentences — *the runtime FOLDS this in*, *the root
  loads no validator*, *every non-threaded row runs the document as it is on disk* — and a check would
  have to read English.
- **A check over a plan's SAMPLE — [Q292](../questions/q292.md), four defects across three items.** The
  sharpest single instance in the plan, and the check does not exist. **A sample cannot be EXECUTED**:
  P18's calls `callModel`, which is not a thing this repository has and could not be, since L6 runs
  offline and deterministically in two runtimes. **And a typecheck would not have caught the one that
  mattered** — a constructor parameter property is valid TypeScript that `tsc` accepts and Node 24
  refuses at load, which is exactly why `RT-R9` is a SOURCE rule (`S4`) and not a type. What DID find
  three of the four is an item trying to BUILD from the sample, and the fourth an item trying to LOAD
  it, which costs nothing and already happens three times a plan. Recorded; this retro corrected the one
  defect that made the sample unloadable and named the other three beside it, rather than building a
  check.
- **A per-case catch in a looping rung, and it is the SECOND refusal of this proposal.** Three instances
  now: W59 closed it for `examples/l6.ts`'s ROW loop, and W67 found it TWICE in blocks it added AFTER
  that guard — the shim run sits outside the loop, so replacing a default with a `throw` took the file
  down with zero failure lines, and block (2e) dereferenced `reports[-1]` when a row was repointed at
  another document. W67's own lesson names the mechanism: *the guard is per-block, and a new block
  starts without it.* **P16's retro refused it at one occurrence; put to the maintainer here at three,
  and not taken** — the fix is one `try` per block, both were made inside the item that found them, and
  section 4's *a rung reported GREEN means its command EXITED 0* already tells a reader what a red with
  zero FAIL lines means. Recorded so a fourth occurrence has the count.
- **A rule that a Gate line's claims are INSTANTIATED.** Three instances, two items, every one
  reader-found and blocking, and **nothing in rule 8 reaches a Gate line** — obligation (b) names the
  `Outputs` table and nothing names the gate. W65's Gate promised obligation (a) over BOTH shapes of a
  node type and no class-form type reached any driver suite; W65's Gate named L0-L5 and `check:spec` and
  **not L6**, the only rung that sees the cross-row layer; W66's Gate promised *L1 on real pools* and
  every call went through a seam. Each is a claim about WHERE something is proved that was false.
  **Put to the maintainer and not taken**: all three were found by the pass that exists to find them,
  which is the two readers, and each was closed in its own item. Recorded with the count.
- **A dated ceiling naming the item that expires it as a HAND-OFF.** The clause's yield is the best it
  has been — **one catch in fourteen**, against P16's two of twenty-three and P13's two of eleven — and
  the one miss is precisely the case where the ceiling's own sentence names its expiring item and that
  item did not read it, while the SIBLING ceiling naming the same item WAS re-run there. The
  counter-measure would be section 1 rule 5's grep-your-own-id one mechanism over: an item greps the
  previous items' declared ceilings for its own id, which is the one case where the string is exact.
  **Put to the maintainer at one miss against one hit, and not taken** — the retro caught it in one
  command, and the clause is doing its work inside the items.
- **An `Owns` pre-declaration rule, the SEVENTH plan running — and the seeded table is now measured
  three times.** P18 is the first plan to write the seed **at the DECLARATION** rather than leaving each
  item to seed from the previous one's late table. **The plan seeded EIGHT rows and all eight behaved
  as predicted**; each item then extended its own table from the same reading, and **five of those
  additions were declared *predicted NOT to fire* and none of them fired** — `scripts/check-markdown.mjs`
  at W65 and again at W67, `scripts/build-browser-tests.mjs` at W67, and `scripts/check-scheduler.mjs`
  and L6 block (2c) at W66, the last of which W66's own decision 3 made unreachable. **A prediction that
  something will NOT fire is the half a file set cannot make**, and thirteen of thirteen held.
  **And the seed missed twenty-one**:
  late exceptions ran **10, 10, 1**, zero undeclared, and **not one of the twenty-one was predictable
  from a file SET** — each was created by the CONTENT of the change (a comment naming a type that no
  longer exists, an amended ADR's pointer, a suite census that is an equality, a `private readonly` a
  minting runtime leaves unreadable, one clause in `doc/concept.md`). That is P10's retro's finding for
  the fourth plan running. **Kept as a PROCEDURE, refused as a rule** ([Q157](../questions/q157.md)); the
  declaration-time seed is its third datum and its first taken at a plan's own declaration.

### The predictions: FOUR of FOUR CONFIRMED

| # | kind | verdict |
|---|---|---|
| 1 | derived | **CONFIRMED, and measured in both halves.** No routing or fold assertion moved at L1-L5 — only payload reads did, 50 lines in 11 files — and what a bare node's worker receives changed on every corpus flow: **reverting W65 at L6 cost 114 when W65 measured it and 309 on the tree that ships** — two different edits on two different corpora, W65 putting the bare road back and W67 deleting the unwrap every worker now depends on |
| 2 | derived | **CONFIRMED, and NARROWED by its own item rather than claimed.** The identity derivation reproduces fact 5's captured `WorkerManagerOptions` with `groups` ABSENT where none is declared, and the typed rows of P16 and P17 are unmoved at 1502 / 50. *Byte for byte* is met as **CANONICAL JSON**, because the key order fact 5 captured is today's object literal's and not a rule's — an options bag has no order the scheduler reads, so *reordered* in the prediction's own reversal column is **not an observable** ([Q284](../questions/q284.md)). A prediction whose wording was stronger than anything that could be measured, narrowed in the item instead of being reported as met |
| 3 | derived | **CONFIRMED.** Every refusal this plan adds is an `FD-V` or a construction error naming a registry key: `FD-V38`, eleven `RegistryError` classes, three `RuntimeError` classes and `RT-R13` — **no `FD-R`, no new node kind** — and `FD-V5` and `FD-V34` retire with their ids held |
| 4 | **reach** | **CONFIRMED WITHIN ITS STATED SCOPE, which is the whole of what it claims.** The subset validates fact 1's fourteen cases as fixtures and the corpus registry resolves with nothing refused; `@cfworker/json-schema` at 42 KB was never reached for. **And the row is honest about what that does not say**: its scope column reads *over the sample's and the corpus's schemas, NOT over what a consumer might write*, and fact 1 had already confirmed it on the sample **before the plan was declared** |

**Four of four — the second plan to record it, after P16, with P17 at three of four in between — and P10's reading needs a qualification this plan
supplies.** That reading is *three derived predictions test the inference and the one reach prediction
tests the mechanism*. Prediction 4's measurement was **taken at the declaration**, on the very corpus
its own scope names — so there was nothing left for an item to find, and confirming it tested the
corpus rather than the reach. **That is v0.14's scope column working exactly as adopted**: it made a
pre-confirmed reach prediction legible as one instead of letting it be counted as a test, and the reach
itself — what a consumer's worker will write — stays open with its reversal condition written down.
What is genuinely new is prediction 2: **a derived prediction whose WORDING was stronger than any
observable**, narrowed by the item that met it rather than by a reader.

### v0.18's two changes, and the ceiling re-run

| v0.18 change | What would show it was wrong | **P18's verdict** |
|---|---|---|
| **Obligation (d): a membership names the CONTROLS beside its claims** | a new cross-row block ships with its claims named and its controls not, and a validator accepting everything is green with the counts lowered | **CONFIRMED, FOLLOWED at the first opportunity, and MEASURED — the cleanest confirmation of any change this document has adopted.** W67's block in `examples/l6.ts` names FIVE controls beside its claims, citing the clause in the code twice, and its `d3` probe is the measurement of what that buys: deleting a control now takes **four edits, one of them a NAME a reader sees in the diff**, where before the clause it took two integers and left nothing behind. **The limit is the one the clause already states**: `CROSS_ROW_SUBJECTS` is a literal, so a member and its name are two edits in one diff ([Q217](../questions/q217.md)), and a layer with NO membership is invisible — W67's adequacy reader took the whole per-row `poolOfTask` layer out for three edits and an integer, which is v0.14's *a count is not a membership* at a THIRD layer, closed by adding to W55's `PER_ROW_SUBJECTS` |
| **Obligation (a): every member is instantiated under the SAME claim** | an author enumerates a rule's values and one of them is a value of the kind rather than an instance of the claim | **CONFIRMED, and FOLLOWED-AND-SHORT a FOURTH time, in the direction the clause predicts.** W65's Gate line enumerated **both shapes of a node type**, document and class, which is the enumeration — and the class shape was instantiated in the RESOLVER's suite and in NO driver suite, so *the driver handles both shapes* was never an instance of the claim, and a driver blind to a class's policy and defaults was green everywhere. Its adequacy reader found the member by asking what the CLAIM said of it, which is how W58's, W59's and W63's were found. **No extension taken**: the clause as written says exactly what would have caught it, and this is v0.13's recorded asymmetry — an obligation run as a step in a set passes, and the same obligation asked as a question of one artefact fires |

**The ceiling re-run: all FOURTEEN declared ceilings re-run on the tree the plan ships, through each
item's own harness, each against the rung its own reason names.** W67's seven and W66's one hold as
declared. **Every one of W65's six ABORTED on its original anchor** — rule 7 (b) firing correctly,
because W66 raised `RUN_FLOOR` 22 to 23 and W67 rewrote `examples/run-flow.ts` whole — and they were
re-anchored here with a control of their own (`dev-dist/p18-retro/ceilings-w65.mjs`, control green).
**ELEVEN distinct claims HOLD**, four of them on re-anchored text; **ONE is a CATCH** (W65's `e7`,
above, corrected in that item's file under pass 3 rule 6); **and one's SITE no longer exists** — W65's
`c5` named two readings of one literal, and `registryFor`, `NODE_TYPES`, `POOLS` and `WORKERS` are gone
from `examples/**` as code, so the two readings have collapsed into the document and the claim is
neither confirmed nor falsified. *Nothing in the clause says what to do with that*, and it is recorded
rather than ruled on. The tree digest was identical at the start and end of every run.

### The measurements

**Readers: six passes, none empty — 26 / 12, 22 / 10 and 14 / 7 blocking, against mutation counts of
21 / 46 / 16 with 16 / 22 / 9 survivors and 12 / 13 / 7 blocking.** Overlaps **2, 2, 1** — the
**thirty-eighth, thirty-ninth and fortieth** measurements, inside the 0-4 band, none primed.
**Sixty-one blocking findings, twenty-nine conformity and thirty-two adequacy**, and the split held in
all three: the conformity reader found claims that were false (a size that was the prototype's, a reach
stated in three documents, a count stale within the hour, a sub-path that does not exist, a sentence
with an expiry date, a reason false of every field it read); the adequacy reader found bounds that were
not there (a schema walk observed at depth 1, a class shape at no driver, every option `start`
forwards, the run's own payload, a name/key pair carried by a string, a per-row layer, two defaults
reached by nothing). **Its sharpest single pass is W67's conformity reader, whose central obligation
came back EMPTY**: it re-derived every expected value of both `triage` rows on paper — the dispatched
ids, what each of six workers receives and returns field by field, the join's record, the transform's
reduction, the pool each task ran on, the groups each acquired — and found **zero disagreements**.
Everything it found was a sentence.

**Rule 8 across the plan: 219 provocations on the final passes, 192 caught, 14 declared ceilings all
RUN in the items and all RE-RUN here, 12 measurements, 0 undeclared survivors, 0 crashes, 0 against
declaration, 1 abort re-anchored and then caught.** The author passes ran **159 probes and read
FOURTEEN undeclared survivors themselves** — one at W65, three at W66, ten at W67 — every one closed
before a reader saw the tree, and seven of W67's closed in the product rather than declared.
**Late exceptions 10, 10, 1 — twenty-one, zero undeclared** — and **TWENTY-TWO**, because
[Q142](../questions/q142.md) **FIRED, in this retro's own confirming gate, on a tree to which the retro
had added NO DOCUMENT AT ALL.** That is the window from its other side, and it is the ninth retune of
`scripts/check-markdown.mjs` and the second consecutive one found by the GATE rather than predicted.
**The plan paid the FILE half and left the LINK half alone**: fact 9 predicted `M3` from a count taken
before a document was written and retuned it 90 -> 107, and all three items then checked `M3` against
their own fixtures and reported no trip — correctly, since their documents land under
`doc/decisions/` and `doc/work-items/` and the one-directory probe cuts the first. **`M4` had a
margin of 31 links at W67's close** — the two-directory fixture measured **3929** against a floor of
3960 — and this retro's record step wrote **35** more into `doc/README.md`, `CLAUDE.md`, `README.md`,
`doc/workflow.md`, `doc/open-questions.md` and `doc/work-items/w65`, **none of which either
`removes` probe cuts**. The fixture read **3964**, four past the floor, `M4` did not fire, and the
probe declaring `[M1,M3,M4]` reported `got [M1,M3]` — **`GATE EXIT=1` with ZERO lines beginning
FAIL, in the LAST of twenty-nine chain entries, after every other rung was green**, which is section
4's own two directions in one log. Measured on a scratch copy outside the repository, on the tree this
retro ships: whole tree **124 / 5414 / 271**, one directory removed **93 / 4948 / 271**, both removed
**74 / 3966 / 271**; `M4` retuned to **4450**, near the middle of `(3966, 4948]`, `M3` untouched at
107 inside `(93, 124]`, `M5` untouched at 60 against 271 for the eleventh plan running. *An index
paragraph is the densest link source this repository has and the record step writes six of them, so a
retro moves this floor without adding a file* — which is why the declaration's prediction was right
about `M3` and silent about `M4`. **Census CONFIRMED for the EIGHTEENTH plan
running — 230 / 176 / 2 / 52, 230 of 230 in exactly one cluster cell, 52 ids in the Resolved table** —
by a parser written from scratch that was wrong in three directions before it was right and whose two
clean findings are corrected above. This retro raises **no question** and extends
[Q253](../questions/q253.md).

**The retro's one declared exception is `scripts/check-markdown.mjs`**, for the `M4` retune above —
the record step's six files are section 1 rule 5's and are not exceptions, and nothing else outside
them was touched.

**And v0.15's *a whole-tree measurement is taken with the tree HELD STILL* fired against this retro
TWICE, which is its fourth and fifth occurrences and both are recorded rather than tidied away.** The
confirming `npm run gate` was started three times: the first two were **STOPPED UNFINISHED** because a
final read-through of this retro's own prose found a claim to correct while they ran — a duplicated
clause and a sentence dated *for the whole of this repository's history* that `git log -S` puts at W5,
115 commits back — and a gate that finishes over a tree an edit has since moved is *a claim about no
tree*. P14's retro broke this rule within the hour of adopting it and said so; **this one broke it
twice and stopped both times rather than reporting the verdict**, which is the behaviour the clause
asks for and the cost it names. *The pull is exactly what section 6 says it is: a gate costs ten
minutes and there is always one more sentence to check.*

**Every figure above was re-taken here rather than inherited, with the tree held still by a content
digest and each rung RUN and never PIPED** (`dev-dist/p18-retro/`, read by `$?`): L6 **1610 / 53 in
node AND deno**, L1-L5 **41 / 1112 in all FIVE runtimes** — node 24.20.0, deno 2.9.6, chromium,
firefox and webkit, the last two outside `npm run gate`, which runs three — `check:spec`
**7 / 55 / 106 with `C4` at 34**, `check:docs` **29 snippets / 23 run**, `check:markdown`
**124 documents**, and all seven checks at exit 0. **The confirming `npm run gate` over the tree this
retro ships: EXIT 0, zero lines beginning FAIL at any indent, 29 chain entries, `selftests` 7/7
completed and 7 ok** (`dev-dist/p18-retro/gate.log`; L6 **1610 / 53** in node 24.20.0 AND deno 2.9.6,
markdown **124 / 5414 / 271**), with the digest **`e7e76f2ad14abed6` over 327 files identical before
and after it** — and this sentence is the ONE edit made after it, which is P17's retro's own
precedent for the only claim a gate cannot be run before.

*It took THREE gates, and the first two are in the paragraph above: one stopped for a duplicated
clause, one stopped for a date `git log -S` refuted. **The third went RED** — `GATE EXIT=1` with zero
FAIL lines, at `Q142`, which is the paragraph two above this one. So the confirming gate confirmed
something: that this retro's own record step moves a floor nobody predicted, and that the rung which
says so is the last of twenty-nine.*

### What the plan taught, beyond its own question

- **A plan's SAMPLE is code, is read as a specification, and is executed by nothing.** Three items were
  built against P18's and it was wrong in four ways — a sub-path that does not exist, a signature short
  by an argument, a missing `flows`, and a constructor Node refuses to load. `check-docs` executes every
  snippet in `AGENTS.md` and nothing executes a plan's; what found three of the four is an item trying
  to build from it, and the fourth an item trying to load it. [Q292](../questions/q292.md).
- **An interface's REQUIRED set is not the set its implementation CALLS**, and only one omission at a
  time on a real scheduler tells you which. The plan read the `.d.ts` faithfully and its refusal list
  was wrong in both directions — refusing a group that works and accepting one that hangs every task
  naming it in silence, which is W33's *N too small completes and is silent* one interface over. That is
  the **seventh** fact the scheduler's reference is silent on and the FIRST that CONTRADICTS it rather
  than omitting it; [S10](../scheduler-upstream.md) is the first item that register has raised since W37.
- **A refusal that is right for one caller is wrong for another, and the argument for it reads the
  same.** `bootstrap`'s *a group registered and used by nothing is the silent kind* is correct when a
  consumer passes group OBJECTS in and wrong when a DOCUMENT declares the SET a node's `workerGroups`
  may name — and its message told a runtime consumer to do a thing only a helper consumer can do.
  [Q291](../questions/q291.md).
- **Retiring a distinction moves every clause that discriminated on it.** *Typed* against *bare* was the
  discriminator of three L6 clauses and a membership list, and all four went wrong at once on the
  migration's first run. *A migration is not done when the corpus validates.*
- **A list DISCOVERED beats a list DECLARED**, three times in one item: the section-9 snippet that
  enumerates the package's own error classes caught twelve new ones for free, while the registry test's
  literal `11` would have passed a twelfth. The class list, the keyword list and the checked-schema list
  are all read from a source now.
- **A fix for a blind spot is a new instrument and needs its own probes.** `check-source`'s `scan()`
  closed an apostrophe in a template literal that had blinded `S2`, `S3` and `S4` over 16 137 characters
  of `driver.ts`, and left the same hole open one construct over in a regex literal — with its own
  header claiming the class ([Q288](../questions/q288.md)).

### Ids

W65, W66 and W67 used; **W68 CLOSED as reserved and never issued** — the plan's three items answered its
question and the fourth was never needed. **Q278-Q292 all USED, none spent** — two at the declaration,
five at W65, four at W66 and four at W67 — which is the first block since P13's to be used to its last
id, four plans having spent between one and ten each; [Q279](../questions/q279.md) RESOLVED by the
version bump, and it is the only one of the fifteen that closed.
**ADR 0053, 0054 and 0055 all taken** — every ADR this plan reserved, as P12's two and P17's two were,
and it is the first plan to reserve THREE and take three. **0055 was taken for neither of the two
things the plan predicted it might be needed for** (the sub-path's placement and the run-id minting are
decisions recorded in W66's own file); it exists because a measurement corrected P18 decision 4 in both
directions. Ids are never reused
(`doc/workflow.md` section 3), so **the next plan starts at **W72, Q300** and ADR 0056. *(This read **W71, Q297** until W71 took the id on 2026-09-17 — the third consecutive falsification of this sentence by the item that expired it.)*** *(This read **W69, Q293** until 2026-09-17, when [W69](../work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — an item belonging to no plan — took both ids: a claim with an expiry date, falsified by the item that expired it and corrected by that item, found by grepping the tree for its own id.)* *(And **W70, Q294** until 2026-09-17 too, when [W70](../work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) took W70 and reserved Q294-Q296 without using them — the same sentence falsified on two consecutive days by two items outside any plan, corrected both times by the grep section 1 rule 5 prescribes.)* Its subject is
written down: **P19, strict mode** — `inputSchema` and `outputSchema` enforced at run time, a
transform's declared output against what it produced, and the sample-based pre-flight over a
transformed edge, with this plan's declarations and [Q263](../questions/q263.md)'s three arities as its
inputs.
