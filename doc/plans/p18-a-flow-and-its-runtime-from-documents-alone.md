# P18 — A flow and its runtime from documents alone

**Status:** DECLARED — drafted 2026-09-15 on `e6ea29a` (tagged `basic-functionality-ready`, P1-P17
complete and retro'd, `doc/workflow.md` [v0.18](../workflow.md)) from a design conversation with the
maintainer, its nine facts measured the same day in both runtimes, its three stop-and-ask decisions
taken by the maintainer at the draft, and **declared 2026-09-15** with
[W65](../work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md),
[W66](../work-items/w66-the-runtime-entry.md) and
[W67](../work-items/w67-a-flow-from-documents-on-real-workers.md) declared and not started, W68
reserved. *Read every status from the item's own file, never from this line.*

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
   `import.meta.url` is the bundle ([Q261](../open-questions.md)) and the runtime cannot guess.
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
    which answers [Q20](../open-questions.md) and [Q85](../open-questions.md) in passing. Pools belong
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
The file is untracked ([Q253](../open-questions.md)'s shape, stated). Two of the nine changed this
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
is not a mystery: inside a bundle `import.meta.url` is the bundle ([Q261](../open-questions.md)),
which is why decision 7 takes a `base` from the consumer.

**9. `M3`'s one-directory fixture reads 89 against a floor of 90 with this draft in** (88
without it). The declaration adds four work-item files to the same fixture, so **it WILL trip `M3`
and must retune `scripts/check-markdown.mjs` as a declared exception** — [Q142](../open-questions.md)'s
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
- **Node-type versioning** ([Q249](../open-questions.md)), **`limitKey`** ([Q248](../open-questions.md)),
  **a region's collection as a reference** ([Q219](../open-questions.md)), **a reducer on a join**
  ([Q165](../open-questions.md)) — unmoved.
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

**The shim** — the only code the consumer writes, and every line of it is theirs:

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
class DailyBudgetGroup extends EventTarget implements ResourceGroup {
  readonly type = 'DailyBudgetGroup';
  private spent = 0;
  constructor(readonly id: string, private readonly tokensPerDay: number) { super(); }
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
| Q279 | **A grammar change is BREAKING for every flow document and nothing signals it.** 146 of 166 corpus task nodes carry `workerType`; the package reads `0.1.0` in both manifests and a document's `version: 1` has no written meaning ([Q249](../open-questions.md) is the type half). The smallest honest move is `0.2.0` at W67's close with the change named | no owner — this plan's record step |
| Q280-Q292 | *reserved for the items* | |
| [Q64](../open-questions.md) | *Nothing tells a consumer how to use the library* — the runtime entry and `AGENTS.md` section 12 as a call are this plan's answer to it; the row is re-read at the declaration and closed or narrowed by W66 | W66 |
| [Q20](../open-questions.md), [Q85](../open-questions.md) | *Is a run id global* — the runtime mints it; answered in passing, recorded by W66 | W66 |
| [Q263](../open-questions.md) | the three arities as P19's sample shapes — carried, untouched | P19 |
| [Q261](../open-questions.md) | a bundle's `import.meta.url` — decision 7's `base` is its consequence, not its closure | unchanged |

## Slices beyond this plan, in order

1. **P19 — strict mode**: `inputSchema` and `outputSchema` enforced at run time, a transform's
   declared output against what it produced, and the sample-based pre-flight over a transformed
   edge — with this plan's declarations and Q263's three arities as its inputs.
2. **Locking type config keys**, if a type ever needs it (decision 12).
3. **Node-type versioning** ([Q249](../open-questions.md)), once a registry document exists to
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

*Filled in at the join, after the work items are merged. Empty while this is a draft.*
