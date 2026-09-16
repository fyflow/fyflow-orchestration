# ADR 0049 — A node type is a registry entry, and its worker receives an envelope

**Date:** 2026-09-12
**Status:** accepted — answers [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s
question, *what is a node type?*, on that plan's decisions 2, 4, 5 and 6. **Amended by [ADR 0054](0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) at v0.19 (W65)**: rule 1's *instead of a `workerType`* is *names a `type`*, the settings VALIDATOR is the worker's `settingsSchema` (ADR 0053), and the *bare node unchanged to the byte* clause expired with the bare node; the envelope, the pool keyed by the type's name and *the definition stays data* stand and are universal. Amends nothing itself:
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 6 stands for every untyped node, [ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
is what makes rule 5 legal, and W58's two keys are what rule 6 rides on.
**Raised by:** P16, taken by [W59](../work-items/w59-what-a-node-type-is.md)

## Context

**A flow names a worker pool by a string and hands it a payload, and until this decision that
was everything a node could say about the thing that runs it.** W58 let a node say two more things
about its own TASK — how it retries and which groups it holds — and both are per node, written in
the document, and passed through. What a node still could not say is what it IS: which worker
runs it, with what pool, holding what groups, configured how, and taking which per-node settings.
"One worker, two configurations" was spelled as two `workerType`s with two pool `config`s, which is
how `examples/` runs ten roles through one file and does not scale to consumers who write flows.

**Four facts were measured before the shape was chosen, all on a real inline `FyflowScheduler`
at 0.5.2 under Node 24.20.0 AND Deno 2.9.6, re-taken by `dev-dist/w59/facts.mjs`:**

| fact | measured |
|---|---|
| **1. A POOL naming an unknown group is ignored in silence, exactly as a task is.** | `new WorkerManager(url, { groups: ["nope"] })` on a scheduler declaring `g`: the task runs, settles `done`, and with a resource listener attached emits `task.running` and nothing else. P16 fact 2 one level up, and the scheduler's bundle says why — `_groupsForTask` unions the task's and the pool's ids and `.filter((entry) => entry.group)` drops the unknown ones (lines 250-251 of `dist/node/index.js`). So a type's groups must be checked by this library, at construction and in the helper, because nothing downstream will |
| **2. A group is resolved by the scheduler's MAP KEY; a group object's own name is inert.** | `{ keyA: new ConcurrentLimitGroup(1, "nameB") }`: a task with `workerGroups: ["keyA"]` reports `resource.acquired@keyA, task.running, resource.released@keyA`; one with `["nameB"]` reports `task.running` alone. `Object.keys(scheduler.groups)` is therefore the registry set, which is what W58 already prescribes |
| **3. A pool-declared group is held per task, in a fixed order, and a WRAPPER worker works inline and threaded.** | A pool loading a wrapper script that `import()`s the type's real worker in `setup()` and hands it `{ settings, input }` in `run()` settled `done` with the inner worker reading `settings.factor` and `input.confidence`, inline and on a real thread, in both runtimes; every task reported `resource.acquired@typed, task.running, resource.released@typed`. And a payload that is NOT an envelope handed to that pool is a **task failure** naming the pool — `state: failed` on an optional task — never a run refusal |
| **4. The driver holds the definition BY REFERENCE, so a document mutated after `new Driver` is dispatched as mutated.** | `def.nodes[0].optional = true; def.nodes[0].workerType = 'ZZZ'` after construction reached `addTask` as `{ optional: true, workerType: 'ZZZ' }`. This road pre-dates this decision and is the same for every key; it is where a settings value the type's validator would refuse can reach a worker, and it is recorded ([Q259](../open-questions.md)) rather than closed — the maintainer's call, with the alternative (a deep copy at construction, closing the road for every key at the cost of one clone per driver) priced and declined as outside this item's scope |

**Three stop-and-ask decisions were put to the maintainer with both options priced, on
2026-09-12, before anything was built**, and a fourth about the JSR manifest:

| decision | priced | chosen |
|---|---|---|
| the envelope's key names | `settings`/`input` collide with nothing in the scheduler's vocabulary; `config`/`payload` each already name something — the pool's global config (a worker's constructor argument) and the whole value a task carries — so a worker would hold two homonyms | **`settings` / `input`** |
| a node's own `retryPolicy` beside its type's | *node wins whole, then type, then driver default* costs one sentence and one L2 case per shape; *refuse the node policy when the type declares one* costs a rule clause and removes per-node override. `workerGroups` has no merge either way: a type's groups are the POOL's and the scheduler unions them with the task's (W58's measurement) | **node > type > default, whole** |
| a settings value the validator would refuse reaching a worker later | *record it*: `FD-V33` at construction only, the mutation road (fact 4) written into the spec and the register, P16 prediction 3 holds; *deep-copy the definition at construction*: closes every key's road at one `structuredClone` per driver, outside W59's scope | **record it — [Q259](../open-questions.md)** |
| `deno.json`'s `exports` | measured with `deno publish --dry-run`: an `exports` MAP carrying `./scheduler` passes, and errors if an exported module is outside the allowlist (a real check); a string `exports` leaves the JSR package with no sub-path, so a Deno consumer cannot reach the helper at all. Either way `S6` forces the allowlist entries | **an `exports` map with `./scheduler`** |

## Decision

1. **A node type is a REGISTRY entry, and the definition stays data.** `Registry.nodeTypes` is a
   fourth set beside `predicates`, `workerTypes` and `groups` *(\`workerTypes\` retired at v0.19, ADR 0054)*, keyed by the name a `task`'s `type`
   gives, each entry `{ worker, pool?, groups?, config?, settings?, retryPolicy? }`: the module URL
   of the worker class, the pool's `WorkerManager` options, the resource groups the pool declares,
   the pool's global config, a per-node settings validator, and a retry default. **The definition
   names the type and nothing else** — never a file, never a URL (P16 decision 4). **Absent means
   EMPTY**, as `groups` does.
2. **A type's `settings` entry is a VALIDATOR, a registered function, not a schema.** `null`
   accepts; a string is why and is `FD-V33`'s detail; a validator that throws refuses with its
   message; a verdict that is neither `null` nor a string refuses too, because a boolean has two
   readings and this contract has one. It receives the node's effective settings — `{}` when the
   node declares none. The schema LANGUAGE is deliberately not decided here: it is P18's subject,
   and a function is what keeps `FD-V33` decidable at instantiation without inventing one.
3. **A typed node's worker receives the ENVELOPE `{ settings, input }`, and that is `FD-C5`.**
   `settings` is the node's effective settings as its OWN copy per dispatch (`JP-R11`'s invariant
   one field over — a map's N instances get N copies); **`input` is THE VALUE THIS NODE RECEIVES**,
   exactly what an untyped node in the same position would have been handed as its whole payload.
   Defined as the value RECEIVED and never as *what `needs` composed*, so a per-node transform
   ([Q251](../open-questions.md), P17) sits between composition and the envelope without rewording
   the rule. **An untyped node receives no envelope and no reserved key** — ADR 0040 rule 6 is
   untouched, and every untyped dispatch is the object it was, to the byte.
4. **A `task` names its pool ONE way.** `type` names a registry entry whose POOL IS KEYED BY THE
   TYPE'S NAME; `workerType` names a pool as it always has *(until v0.19 retired it — ADR 0054)*. Neither is `FD-V23`; both is `FD-V34`;
   a `workerType` that names a node type is `FD-V34` (a bare node would hand the type's worker the
   raw payload where it reads the envelope — fact 3's task failure, caught at instantiation
   instead); `settings` on a node with no `type` is `FD-V34`. `FD-V32` refuses a `type` the registry
   does not hold, or one the scheduler has no pool of that name for. No new node kind (P16
   decision 6): a typed node is `kind: "task"`, and a `map`'s branch may be one.
5. **The bootstrap helper is a sub-path of this package — `fyflow-orchestration/scheduler` — and it
   is the one place the published package constructs scheduler objects.** *(At MODULE granularity until W66, which put `createRuntime` beside it in the same sub-path and stated the rule at DIRECTORY granularity as `RT-R13`.)* `bootstrap(nodeTypes,
   groups)` returns `{ workerPools, resourceGroups }`: one `WorkerManager` per type keyed by the
   type's name, loading the package's ENVELOPE WORKER with the type's `worker` and `config` in its
   pool config, spreading the type's `pool` options and `groups`; and it refuses, BOTH WAYS, a type
   naming a group with no object and an object no type names, because fact 1 says the scheduler
   will not. The consumer spreads their own bare pools and groups beside the result and passes the
   driver `Object.keys(scheduler.workerPools)`, `Object.keys(scheduler.groups)` and the same
   `nodeTypes`. `src/driver/**` still constructs nothing. The pure entry (`index.ts`) does not
   export the helper, so the validator, the driver and the fold load no `WorkerManager`; both
   manifests export the sub-path.
6. **The envelope worker is the wrapper, because a `WorkerManager` loads a SCRIPT.** A pool
   instantiates its module's default class, so a wrapper cannot be a function around the type's
   class — it is the script the pool loads, which `import()`s the type's real worker in `setup()`,
   hands it exactly `{ settings, input }` in `run()` (a third key is the wrapper's to consume,
   never the inner worker's to see — P17's transform lands here, inside an async `run()`, because
   the driver dispatches inside a listener with no `await`), and tears it down with itself. A
   payload that is not an envelope is a task failure naming the pool: the run-time backstop for
   the one road no check sees (rule 4's spread collision, [Q260](../open-questions.md)).
7. **What a type declares FOR its nodes, and how it merges.** `retryPolicy`: the node's own, whole;
   else the type's; else the driver's `defaultRetryPolicy` — a type's policy is held to `FD-V30` at
   construction naming the type, as the default is. `groups`: the pool's, unioned by the scheduler
   with the node's own `workerGroups`, so nothing merges; each held to `Registry.groups` at
   construction under `FD-V31`, naming the type, because of fact 1.

## Consequences

**What this makes easy.** Two nodes of one type with different settings, on one pool, with one
worker file — the exit artifact, on real workers in both runtimes. A consumer writes a registry
once and hands it to the helper and to the driver; nothing is written twice, and the sets the
validator checks are read off the scheduler the helper built.

**What it costs, each stated because the alternative below priced it.**

1. **A type's pool is keyed by its name, so the name lives in two registry sets.** `Registry.nodeTypes`
   and `Registry.workerTypes` both carry it — by construction when the consumer reads the second
   off the scheduler, by hand in a JSON registry such as the corpus's, where ladder L4 compares the
   two. `FD-V32`'s second clause is what says so when they disagree.
2. **A validator is a function, so a JSON registry cannot carry one.** `spec/examples/registry.json`
   names the types and `test/definition/corpus-types.ts` resolves them — the split the corpus's
   predicates have always had, and `check-spec`'s `C7` reads names alone.
3. **The envelope is one more object per typed dispatch** — a two-key wrapper and a clone of the
   settings — and a typed worker reads two keys by name where a bare one reads its payload whole.
   Measured at L6 as no change to any untyped row's numbers.
4. **The helper's `resourceGroups` are the TYPES' groups only.** A group for a bare node's
   `workerGroups` is registered beside the helper's result, not through it — direction two of the
   both-ways check is a refusal, and the message says where the group goes instead.
5. **A type name colliding with a consumer's own bare pool key is seen by nothing before the
   wrapper refuses the raw payload at run time.** A constructor-argument spread overwrites one
   pool with the other in silence; the driver cannot tell the two apart because a type's pool IS
   a `workerTypes` entry *(a set retired at v0.19, ADR 0054)*. [Q260](../open-questions.md).

**What a future reader is likely to try that this forbids.** Putting `worker: "./my-worker.ts"`
in the DEFINITION *"so the flow is self-contained"* — rule 1, and `FD-V17` refuses the key.
Making `settings` a schema object *"so the registry is data too"* — rule 2, and P18 is where that
language is decided. Wrapping `input` inside a further object *"for symmetry with settings"* —
rule 3: `input` is the value received, and a worker written for an untyped node reads the same
shape under `input` that it read as its whole payload. Reaching the helper from `index.ts` *"so one
import does everything"* — rule 5: the pure entry stays free of scheduler values.

**What it does not decide.** The envelope's third key and what evaluates it (P17); what a type
says about its input and output (P18); whether a node type has a version ([Q249](../open-questions.md));
per-variant pools ([Q250](../open-questions.md), the road below).

## Alternatives rejected

| | why not |
|---|---|
| **Per-variant pools: one pool per distinct settings value, settings delivered as pool `config`** | Needs no envelope and no wrapper, and every existing worker reads its payload unchanged. But `maxThreads` becomes a per-variant number, a type-level cap is expressible only through a shared `ConcurrentLimitGroup`, and every settings value an author writes becomes a pool the consumer must have built — the registry would have to enumerate the values a definition may use, which is the schema P18 owns. Recorded with that cost as [Q250](../open-questions.md); its forcing condition is a worker that holds a resource by existing (`residentGroups`) that a settings value selects |
| **A schema object on the type instead of a validator** | Decides P18's language from the convenience of one rule. A function is decidable today, portable across the three runtimes, and is what a predicate already is |
| **`settings` merged INTO the payload as a reserved key** | Breaks ADR 0040 rule 6 for a typed node — *exactly the object `needs` describes* — and collides with any payload that already has the key. The envelope keeps the two halves apart by construction |
| **A type's `retryPolicy` refusing a node's own** | Priced at the stop-and-ask: simpler precedence, no per-node override, one more invalid fixture. The maintainer chose the merge |
| **Deep-copying the definition at construction to close fact 4's road** | One clone per driver and a behaviour change for every node, outside this item's scope. Recorded as [Q259](../open-questions.md) with the price |
| **Exporting the helper from `index.ts`** | Pulls `WorkerManager` into the pure entry, which the browser bundle and every L2-L5 fake would then load. P16 decision 5 |
| **A `dependencies` entry or a new node kind** | The first is ADR 0048's refused alternative; the second is P16 decision 6 and prediction 3 — every refusal here is an `FD-V`, the envelope an `FD-C`, no `FD-R` |
