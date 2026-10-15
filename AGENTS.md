# fyflow-orchestration — Reference

Flow orchestration over [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler): sequence,
decision routing, fan-out and join.

> **Every ```ts snippet in this file is extracted and typechecked against the real `index.ts` by
> `npm run gate`, and most of them are executed.** `scripts/check-docs.mjs` pulls them out, rewrites
> the `fyflow-orchestration` import to this repository's own, and compiles them together. **A stale
> snippet is a failing gate rather than a lie** — which is why they are worth reading.
>
> `run` snippets execute and must assert something; `check` snippets are typechecked only, because
> they need a live scheduler or exist to show a type. **The prose between them is not checked**, so
> where a claim matters it is pushed into a snippet's assertion rather than left in a sentence.

---

## 1. What this library is, and what it is not

`fyflow-scheduler` runs tasks. **It has no dependency graph** — no `dependsOn`, no `parents`, no
ordering — and its own reference lists them under *"Things that do NOT exist"*.

**This library decides which task runs next, and why.** It owns four things the scheduler does not
have: **sequence**, **decision routing**, **fan-out** and **join**.

**And it tells you whether the flow you wrote FITS the workers you named, before you run it.** Where
a worker declares what it expects and what it returns — it need not, and `unchecked` is the verdict
when it does not — `checkWiring` gives every arc of a flow one of five verdicts from those
declarations, `tryTransform` runs a candidate expression on a producer's own
declared example and holds the result to the consumer's schema, and `signatureOf` turns the same
schemas into the TypeScript a worker's author writes against. **Section 15 is a session that does all
three on a real miswire and then runs the flow it repaired** — it is executed by `npm run gate` like
everything else here.

| | belongs to |
|---|---|
| worker pools, threads, retry, resource limits, task execution | `fyflow-scheduler` |
| what runs after what, and on what condition | **here** |

**This package depends on the scheduler, and says so where your installer reads it.** Since
[ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
`fyflow-scheduler` is a `peerDependencies` entry at **exactly** the version section 12 pins — npm 7
and later install it for you — and the JSR package maps it to `@fyflow/scheduler` at the same
version. The driver is written against that version's event shapes, and the range is exact because
there is no upstream changelog to read a wider one from. **You still pass your own scheduler in**:
`SchedulerLike` is a two-method structural interface, a real `FyflowScheduler` satisfies it as it is,
and the one thing the library builds itself is a `FyflowTask` when you omit `createTask`. *(This
paragraph read "does not depend on the scheduler … install whichever version you like" from W9 to
W57, while section 12 said to pin it — two sentences a consumer reads first, contradicting each
other twenty-one sections apart.)*

```ts check
import type { SchedulerLike } from 'fyflow-orchestration';

// The entire surface this library needs from a scheduler. The listener takes `object` — what an
// `EventTarget` hands a listener — and the driver reads `detail` off it (section 12, Q71).
const shape: SchedulerLike = {
  addTask(_task: unknown) { return undefined; },
  addEventListener(_type: string, _listener: (e: object) => void) {},
};
void shape;
```

---

## 2. Getting started — a flow and its runtime from two documents

**Two documents, and one file of your own.** A REGISTRY says what exists — a worker module, and a
node type that runs on it. A FLOW says what happens — nodes naming those types, and the edges between
them. `createRuntime` builds every pool, group and scheduler the registry names and hands back
**`{ driver, done, header }`** per run — the driver already running, and `done` a promise that resolves with
the run's terminal state ([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)). **The only code you write is the worker**:
`examples/getting-started/worker.ts`, a class with a `run` method and nothing else — no base class,
no import. Everything below is executed by the gate on every `npm run gate`, and the same snippet is
in `README.md`, held byte-equal to this one by `check-docs`'s `X8`
([W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';

// THE REGISTRY — what exists. One worker module, and one node type that runs on it. This is data:
// in your program it is a JSON file you import. The worker url is relative, and `base` below says
// to what; the file itself is `examples/getting-started/worker.ts` — a class with a `run` method.
const registry: RegistryDocument = {
  workers: {
    greeter: {
      url: '../../examples/getting-started/worker.ts',            // in your program: './worker.ts'
      settingsSchema: { type: 'object', required: ['say'], properties: { say: { type: 'string' } } },
    },
  },
  nodeTypes: { Greeter: { worker: 'greeter', inline: true } },
};

// THE FLOW — what happens. Two nodes of that type, each with its own `settings`, then an end. A flow
// names registry KEYS and nothing else — no file, no url, no class — so it is portable across
// runtimes that agree on the keys. The end node's `outcome` is a LABEL of yours that the driver does
// not interpret; the run's own outcome is the fold's — `state.outcome` below.
const flow: FlowDefinition = {
  flowId: 'hello', version: 1, entry: 'greet',
  nodes: [
    { id: 'greet', kind: 'task', type: 'Greeter', settings: { say: 'world' }, edges: [{ to: 'shout' }] },
    { id: 'shout', kind: 'task', type: 'Greeter', settings: { say: '!' },     edges: [{ to: 'done' }] },
    { id: 'done',  kind: 'end',  outcome: 'completed' },
  ],
};

// ONE call builds the pool, the scheduler and everything between, and refuses every defect in the
// REGISTRY at construction, by name. It never sees the flow: a defect THERE is refused where the
// flow arrives, at `start`, which is what builds the `Driver` — so a `settings` value the worker's
// schema rejects names its node from the call three lines below, not from this one. `base` is what
// relative worker urls resolve against — `import.meta.url` when the registry sits beside this file.
const runtime = createRuntime(registry, {}, { base: import.meta.url });

// `start` hands back `{ driver, done }` — the driver already running, and `done` a promise that
// resolves with the run's terminal `RunState` (ADR 0058). **It never rejects**: `failed`, `stuck`
// and `stopped` are terminal OUTCOMES, so a run that goes wrong arrives as `state.outcome` and not
// as a `catch`. This snippet wants only the end, so it names only `done`. *A run with a person in
// it does not end by itself — section 7 is where that is taught, and section 8 is what `done` waits
// for.*
const { done } = runtime.start(flow, { text: 'hello' });
const state = await done;
await runtime.shutdown();

// What the run did, read off its state: `greet` turned `hello` into `hello world`, and `shout` was
// handed THAT as its input — the previous node's result is the next node's `input`.
const shout = Object.values(state.nodes).find((n) => n.nodeId === 'shout');
console.log(state.outcome);          // 'completed'
console.log(shout?.result);          // { text: 'hello world !' }

if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
if (JSON.stringify(shout?.result) !== '{"text":"hello world !"}') throw new Error(`shout returned ${JSON.stringify(shout?.result)}`);
```

**What to read next.** Everything this snippet leaves out is `examples/flows/triage.flow.json` with
`examples/run-flow.ts` — a custom resource group, a node-type CLASS with its own derivation, a node
on a NAMED pool instance, a decision edge, a fan-out and its join, and a declared transform — which is
[P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s exit artifact and runs on real
workers in both L6 runtimes. Section 3 is the definition grammar; section 12 is the runtime in full,
including the driver with **no scheduler at all**; section 13 is node types; **section 15 is what
their schemas buy you before a run**.

---

## 3. The flow definition

**Six** node kinds. A definition is JSON: no functions, so it can be stored, versioned and sent over
a wire.

> **`gate` is the sixth, and since [W93](doc/work-items/w93-what-a-gate-does-in-a-run.md) a `Driver` RUNS
> one** — `spec/flow-definition.md` v0.23-v0.24,
> [ADR 0066](doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)
> and [ADR 0067](doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md),
> [W92](doc/work-items/w92-what-a-gate-is.md). A gate routes the branch that reaches it by a registered TYPE
> and hands on exactly what reached it. Three types are built in: `distinct` decides WITH MEMORY — by what the
> run's other branches have already shown it, the FIRST branch per key down its default route `first` and every
> later one down `duplicate` — and since v0.31 `if` and `switch` decide WITHOUT any, by a declared condition and a
> declared table of values (section 19). The driver evaluates it where a branch reaches it — the gate's memory is
> ONE per gate per RUN, the driver's, rebuilt by replay on a resume — records each decision as a `gated` fold
> input (`RunState.gated`), and stops the run with an `UndeclaredRoute` if a type returns a route it does not
> declare (`FD-R5`). *(Until W93 `new Driver` refused a flow holding one, at construction.)* Every route its
> type declares must be wired by exactly one edge — a drop is an edge to an `end` — and an edge with no
> `route` carries the type's DEFAULT route, never every route.

> **`map` is the fifth, and since [W33](doc/work-items/w33-a-map-at-run-time-arity.md) a `Driver`
> RUNS one.** It is a valid definition since `spec/flow-definition.md` v0.8 —
> [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md),
> answering [Q12](doc/questions/q12.md): a `fanout` declares N branches known at authoring time, a
> `map` declares **one** and a run opens N instances of it, N coming from the value the map node
> receives. `over` is a **key name** on that value and must resolve to an array, or the run stops
> with an `UnresolvedMapArity` naming the node and the key; an empty array is a lawful map of zero
> items and makes the run `stuck`, because the join can never fire.
>
> **What each instance receives, and what the join hands on.** Each instance is dispatched with
> **its own item** — `over`'s array at that instance's index, as its own copy, so no two instances
> share an object — and the join carries **every item's result keyed by that item's branch path**. A
> map of three items at the top level dispatches three tasks and its successor receives
> `{ "0": …, "1": …, "2": … }`; **a map nested in a fan-out branch keys its collection with the whole
> path**, so a map inside branch 1 gives `{ "1.0": …, "1.1": … }`. *(This said "keyed by its item
> index", which is the depth-1 case stated as if it were general — W34's conformity reader.)*
> [ADR 0037](doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md),
> and see *What a join carries downstream* in section 5 for what happens when an item's branch does
> not arrive.
>
> *(This paragraph read **"every instance receives the whole value the map node received rather than
> its own item, and a satisfied join still carries `null`"** until W34, which is where
> [Q11](doc/questions/q11.md) and [Q36](doc/questions/q36.md) were deliberately held so the rule
> would be written from cases rather than from a mechanism.)*
>
> **This paragraph is the minimum that is not false and is not the feature write-up.** It read
> *"NOTHING DISPATCHES ONE YET"* until W33, which is [Q157](doc/questions/q157.md)'s second
> occurrence: no [P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) item owns this file, W35 is
> the natural owner, and W33 took it as a declared late exception to keep the reference true.

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const shapes: FlowDefinition = {
  flowId: 'shapes',
  version: 1,
  entry: 'score',
  nodes: [
    // A task runs a worker. `optional` decides what a failure MEANS — section 6.
    // `retryPolicy` and `workerGroups` say what the node wants of its OWN task — below.
    { id: 'score', kind: 'task', type: 'ScoreWorker', optional: false,
      retryPolicy: { maxRetries: 1, backoffMs: 250 },   // exactly the scheduler's shape
      workerGroups: ['gpu'],                             // must be a group the registry declares
      edges: [
      { on: ['failed'], to: 'quarantine' },   // eligible only when the task failed
      { when: { predicate: 'isLowConfidence' }, to: 'review' }, // guarded by a registered predicate
      { to: 'publish' },                      // the default: no `on`, no `when`
    ] },
    { id: 'review',  kind: 'task', type: 'ReviewWorker', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'quarantine', kind: 'end', outcome: 'quarantined' },
    { id: 'done',       kind: 'end', outcome: 'completed' },
  ],
};

// Not merely well-typed — VALID, and checked here rather than asserted. Note the
// `on: ['failed']` edge is declared FIRST: "the default comes last" is scoped per
// terminal state, not to the array. See section 4.
const bad = validateDefinition(shapes, {
  predicates: ['isLowConfidence'],
  workers: { flow: { url: 'worker.js' } }, nodeTypes: { ScoreWorker: { worker: 'flow' }, ReviewWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
  groups: ['gpu'],                                   // the third set — pass Object.keys(scheduler.groups)
});
if (bad.length) throw new Error(`section 3's own example is invalid: ${bad.map((f) => f.rule).join()}`);

// And `groups` is what makes `workerGroups` checkable at all: leave it out and the SAME
// definition is refused, because a registry that lists no groups declares none. The scheduler
// would have run the task with the unknown group silently ignored — no throw, no
// `resource.blocked` — so construction is the only place a typo in a group id is caught.
const noGroups = validateDefinition(shapes, {
  predicates: ['isLowConfidence'], workers: { flow: { url: 'worker.js' } }, nodeTypes: { ScoreWorker: { worker: 'flow' }, ReviewWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
});
if (!noGroups.some((f) => f.rule === 'FD-V31' && f.at === 'score')) {
  throw new Error(`expected FD-V31 at score, got ${noGroups.map((f) => `${f.rule}@${f.at}`).join() || 'nothing'}`);
}
```

| kind | | refused if |
|---|---|---|
| `task` | runs a worker — of its node **`type`**, REQUIRED since v0.19, on the type's default pool or a named **`pool`** instance of it, with per-node **`settings`** and optionally a **`transform`** applied to its input before the worker sees it (section 13). Has `edges`, and optionally **`needs`**, **`retryPolicy`** and **`workerGroups`** — what it says about its own task, below | it has no `edges`, or **no edge of it is eligible for `done`** (`FD-V7`); it has no `type` (`FD-V23`) — `workerType` is retired and is an undeclared key like any other (`FD-V17`); its `retryPolicy` is not exactly `{ maxRetries, backoffMs }` — an integer >= 0 and a finite number >= 0, no other key (`FD-V30`); its `workerGroups` is not a non-empty array of distinct ids the registry's `groups` declares (`FD-V31`); its `type` is not a registered node type whose worker the registry declares (`FD-V32`); its `settings` is not a plain object the type's worker `settingsSchema` accepts (`FD-V33`); its `transform` names a language the registry does not (`FD-V35`), an expression that language's compiler refuses (`FD-V36`), or is not `{ lang, expr }` (`FD-V37`); its `pool` is not a registered instance of its type (`FD-V38`) |
| `fanout` | `branches: string[]` — the node each branch starts at. Dispatches nothing itself | fewer than two branches, a repeated entry, any `edges` at all, or a branch entry that is not a `task` (`FD-V9`) |
| `map` | `over: '<key>'` and `branch: '<node id>'` — **one** branch, opened once per item at run time. Dispatches nothing itself; the RUN opens N instances of its one branch. Optionally **`needs`**, which is what `over` is then a key on | any `edges` at all, a `branch` that is not a `task`, or an `over` outside `^[A-Za-z0-9_-]{1,64}$` (`FD-V25`); a missing `over` or `branch` (`FD-V23`) |
| `join` | `of: '<fanout id>'`. Fires when its policy says so | it does not have **exactly one** edge, or that edge carries `when` or `on` (`FD-V7`) |
| `end` | terminal. `outcome` is **your label**, never interpreted | — |
| `gate` | `type: '<gate type>'`, optional `settings`, and `edges` of `{ to, route? }` — routes the branch that reaches it and hands on what reached it. `settings.key` is a dotted key path over that value (`series.id`; no index). Built in: `distinct`, `if` and `switch`. Run by the driver where a branch enters it (section 19) | its `type` is not a registered gate type, or its type's `routesFor` throws or returns a malformed route set for this gate, or its `settingsProblem` throws or returns neither a message nor `null` (`FD-V39`); its `settings` are not a plain object its type's schema accepts, its type's `settingsProblem` returns a message, they cannot be copied for the type, or its `key` is not a key path (`FD-V40`); a route is unwired, wired twice, or not its type's, or a gate edge carries `when`, `on` or `needs` (`FD-V41`) — and `route` on any other node's edge is `FD-V41` too |

**A `task` node must have an edge that can be taken when it succeeds.** A node whose only edge is
`{ when: { predicate: 'p' }, to: 'x' }` is refused at construction — it is the mistake the format most invites, and
`FD-V7` is what catches it.

**`end.outcome` is a string you choose.** The library never reads it. What the *run* is called is a
separate, closed vocabulary — section 8.

### `retryPolicy` and `workerGroups` — what a node says about its own task

`optional` was the one scheduler task field a node could set; since
`spec/flow-definition.md` v0.16 ([W58](doc/work-items/w58-what-a-node-says-about-its-own-task.md))
there are two more, and both are **passed through to the scheduler task exactly as `optional` is**.
They are declared keys rather than an opaque bag, so a typo is refused at construction instead of
reaching the scheduler, which would drop it in silence.

| key | | |
|---|---|---|
| `retryPolicy` | `{ maxRetries, backoffMs }` — **exactly** the scheduler's shape, an integer >= 0 and a finite number >= 0, no other key (`FD-V30`) | the scheduler retries a failed attempt **inside the same task id**, and the outcome record's `attempts` says how many retries were used. `{}` and a string count are refused because the scheduler would accept them and mean something else |
| `workerGroups` | a non-empty array of distinct group ids, every one in the registry's **`groups`** set (`FD-V31`) | the task acquires these **in addition to** its pool's `groups`. Pass `groups: Object.keys(scheduler.groups)` to the `Driver`, as you pass `nodeTypes` — **omitting it means the registry declares NO groups**, and any node naming one is refused, because a group id the scheduler does not know is silently ignored at run time |

**A driver may carry a `defaultRetryPolicy`**, applied to every task node that declares none — held
to `FD-V30` at construction like a node's own — and
**the node wins, whole** — a node with its own policy is dispatched with exactly that object, and the
default is consulted only when the node declares none. There is no `defaultWorkerGroups`: a pool's own `groups` already applies to
every task it runs, and the scheduler unions the two. A node that declares neither key is dispatched
with the exact object it was before, so nothing you have already written changes.

**Flow-level retry — re-dispatching a NODE under a new attempt, possibly routing elsewhere — is
still not built** (section 11). This is the scheduler's retry of one task, and it is the whole of
what `attempts` counts.

### `needs` — reaching an output the previous node did not produce

By default **a node receives the previous node's result**, deep-copied. That is still true of every
node that says nothing, and it is what the whole of this section above describes.

**`needs` is how a node asks for something else** —
[ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md),
answering [Q11](doc/questions/q11.md). It is an optional object on a `task` or a `map`, mapping the
keys of the payload you want to **declared references**. *(Since v0.12 an **edge** may carry one too,
and it says what that edge's PREDICATE sees rather than what a worker receives — section 4.)* A node that declares one receives **exactly**
that object and nothing else — there is no wrapper and no reserved key.

| a reference is | and you get |
|---|---|
| `"."` | what the node would have received anyway — the previous node's result, and for a `map` instance **its own item** |
| `"someNode"` | that node's result, **on your own branch** |
| `["someNode"]` | that node's results as an **array**, in ascending branch-path order. Legal only when you are OUTSIDE a region that node is in — which is what makes it more than one |
| **a `?` on either of those** — `"someNode?"`, `["someNode?"]` | the same thing, except that **nothing to give leaves the key out** (or gives `[]` for the array form) instead of stopping the run. This is how you say *if it ran* |

**Which of the two aimed forms is legal is decided by the graph and refused at construction**
(`FD-V28`), so you are told which to write rather than discovering the shape at run time. The message
names the form to use instead.

**And the bare form is a CLAIM that the node ran.** If a run can reach you without it having run — a
decision routes around it, or it sits in a region whose branch may be lost — that is `FD-V29` at
construction, and the fix is the `?`. **It is not dominance**: a `fanout`'s branches are all entered,
so a branch entry is certain from after the join even though it is not on EVERY path there. See
[ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md).

```ts run
import { Driver, validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

// *Score each item against the run's config* — a map instance seeing its own item AND
// the context around it. Before ADR 0040 `config` was reachable from a `score` worker
// by no route at all.
const withContext: FlowDefinition = {
  flowId: 'score-against-config', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', type: 'ScoreWorker',
      needs: { item: '.', run: 'ingest' },          // its own item, and ingest's whole result
      edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// *Score, then fan out over the scores* — a map whose `over` names a key composed from a
// whole region's output. No branch numbers appear anywhere, so inserting a branch cannot
// silently re-point it.
const overRegion: FlowDefinition = {
  flowId: 'fan-out-over-the-scores', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'rank' }] },
    { id: 'rank', kind: 'map', over: 'scores', branch: 'publish',
      needs: { scores: ['score'] } },             // every score, in item order
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'gather' }] },
    { id: 'gather', kind: 'join', of: 'rank', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

const registry = {
  predicates: [],
  workers: { flow: { url: 'worker.js' } }, nodeTypes: { IngestWorker: { worker: 'flow' }, ScoreWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
};
for (const def of [withContext, overRegion]) {
  const bad = validateDefinition(def, registry);
  if (bad.length) throw new Error(`${def.flowId} is invalid: ${bad.map((f) => f.rule).join()}`);
}

// And the wrong FORM is refused at construction, naming the one to write instead.
const wrongForm: FlowDefinition = {
  ...overRegion,
  nodes: overRegion.nodes.map((n) =>
    n.id === 'rank' ? { ...n, needs: { scores: 'score' } } as typeof n : n),
};
const findings = validateDefinition(wrongForm, registry);
if (!findings.some((f) => f.rule === 'FD-V28' && f.detail.includes('write ["score"]'))) {
  throw new Error('FD-V28 did not name the form to write instead');
}

// *Route to review if an earlier step flagged it, and publish either way* — a reference
// to a value only SOME paths produce. Written bare it is FD-V29 at construction; the `?`
// is how you say *if it ran*, and then `verdict` is simply missing on the other road.
const ifItRan = (ref: string): FlowDefinition => ({
  flowId: 'publish-either-way', version: 1, entry: 'decide',
  nodes: [
    { id: 'decide', kind: 'task', type: 'ScoreWorker', edges: [
      { when: { predicate: 'isLowConfidence' }, to: 'review' },
      { to: 'publish' },
    ] },
    { id: 'review', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker',
      needs: { own: '.', verdict: ref },
      edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
});
const guarded = { predicates: ['isLowConfidence'], workers: registry.workers, nodeTypes: registry.nodeTypes };
const bare = validateDefinition(ifItRan('review'), guarded);
if (!bare.some((f) => f.rule === 'FD-V29' && f.detail.includes('"review?"'))) {
  throw new Error('FD-V29 did not refuse the bare form, or did not name the fix');
}
if (validateDefinition(ifItRan('review?'), guarded).length) {
  throw new Error('the conditional form should be accepted');
}
void Driver;
```

**What it costs.** An **unconditional** reference that names a node with nothing to give you stops the
run with an `UnresolvedReference` (`FD-R3`, section 9). Since v0.13 most of that is caught at
construction — `FD-V27` checks the node is *upstream of you* and `FD-V29` that it must have RUN — so
what is left at run time is **whether the join a policy fired had actually waited for it**. *(This
read *"the TWO things the graph cannot know"* and named the arity case first — two `map` regions of
different arity, where a reader inside one could see neither output of the other. **`spec/`
v0.15 removes that road**: [ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
makes a reader see all of a sibling region's outputs, so the case is a defect that was fixed rather
than a limit of what a validator can see, and one road is left. `doc/workflow.md` section 1 rule 5's
third direction, and this sentence is the copy a consumer reads first — it said *the resolver follows
in W50* for exactly as long as that was true.)*
And a reference names a **node**, never a path inside its value: `needs: { run: 'ingest' }` gives you
the whole of `ingest`'s result and your worker reads `.config` off it.

**And inside a `map`, what it costs is what you point it at.** Each instance gets its OWN COPY of
each key, so a reference to a large result is copied once per item. Measured at a map arity of 1000
over a ~126 KiB payload, **one case per process**: no `needs` **5.5 ms**, `{item: '.'}` **7.7 ms**,
one more key naming a genuinely small node **8.7 ms**, and the same key naming the large one
**613.6 ms** — **71x**, and the `?` suffix costs nothing (**617.4 ms**). The mechanism makes one copy
per instance and the cost is linear in the size of each, so the product is what you pay. That is also
why a reference names a whole node and never a path inside it — a path language would hide this
choice. *(These five figures are compared to `spec/flow-definition.md` section 3's own table by
`check-docs`' `X6`, both ways — three documents carried them and nothing compared any two, which is
`doc/workflow.md` section 5 rule 8 obligation (e)'s third shape.)*

**Nothing warns about it, and that is a decision rather than a gap.** There is no threshold to warn
at; the static predicate that needs no threshold fires on **every** intended use of the feature,
including the flow it exists for, so it restates the definition rather than diagnosing anything; and
a report channel exists (`onUnmintedTask`'s shape) and is declined because *this reference is resolved
once per item* is a fact about your document rather than about your run. **Measuring is not the
obstacle** — a size measurement is about 0.03% of what it would warn about at arity 1000.
`spec/flow-definition.md` section 3 carries the whole verdict and the measurements.

### Validation happens at construction, not at routing time

`new Driver(...)` validates the whole definition before anything is queued. A typo cannot become a
routing failure discovered months later on the one workload that takes that branch.

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const broken = {
  flowId: 'broken', version: 1, entry: 'a',
  nodes: [{ id: 'a', kind: 'task', type: 'NoSuchType', edges: [{ to: 'ghost' }] }],
} as unknown as FlowDefinition;

const findings = validateDefinition(broken, { predicates: [], workers: { flow: { url: 'worker.js' } }, nodeTypes: { RealType: { worker: 'flow' } } });
console.log(findings.map((f) => `${f.rule} at ${f.at}`).sort());
// FD-V2 (edge to a missing node) and FD-V32 (a node type the registry does not hold)
const rules = findings.map((f) => f.rule).sort();
if (!rules.includes('FD-V2') || !rules.includes('FD-V32')) {
  throw new Error(`expected FD-V2 and FD-V32, got ${rules.join(',')}`);
}
```

There are **42 refusals** over the id range `FD-V1` … `FD-V46` *(41 over `FD-V1` … `FD-V45` until W109 shipped the first BUILT-IN node type and added `FD-V46`, which refuses a node of a type that only transforms and declares no `transform`; 37 over `FD-V1` … `FD-V41` until W108 made a predicate DATA and added the four a `when` needs; 34 over `FD-V1` … `FD-V38` until W92 added the gate's three; 35 over `FD-V1` … `FD-V37` until W65 retired `workerType` and with it `FD-V5` and `FD-V34`, adding `FD-V38`; 32 over `FD-V1` … `FD-V34` until W61 added the three transform rules; 29 over `FD-V1` … `FD-V31` until W59 added the three node-type rules — and this sentence stood at 29 twelve lines below the table W59 rewrote, until its conformity reader read the two together)*, each with a failing example in
`spec/examples/invalid/`. Four ids in that range are **deliberately absent** and have no rule behind
them: `FD-V14`, which never existed; **`FD-V15`, retired when nested fan-out became
expressible**; and **`FD-V5` and `FD-V34`, retired with `workerType`** at v0.19 (section 13). The ids are never renumbered, so it is safe to assert on them. The full
list is `spec/flow-definition.md`.

**`FD-V14` is deliberately absent, and its id is held open so the gap is not read as a lost rule.**
It would have said *every path from a branch entry reaches the join* — which would make a decision
that routes a branch away from its join invalid input, and that case is the one this library exists
to get right (`ADR 0003`). Do not add it.

---

## 4. Decisions and predicates

**A `when` is an object, and it is either a registered NAME or a DECLARED comparison.** Since v0.27
([ADR 0074](doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md))
a flow document can say what a branch depends on without any code at all, which is what lets a UI or
an agent emit a complete flow. A name still works and is what a predicate that COMPUTES uses.

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

// A `when` is EXACTLY ONE of three shapes, told apart by which keys it carries.
const flow: FlowDefinition = {
  flowId: 'declared', version: 1, entry: 'score',
  nodes: [
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
      // 1. a COMPARISON — a key path over the context, an operator, a literal.
      { when: { path: 'outcome.result.confidence', op: 'lt', value: 0.5 }, to: 'review' },
      // 2. a flat GROUP — `all` or `any`, whose members are comparisons.
      { when: { any: [
        { path: 'outcome.result.score', op: 'gte', value: 90 },
        // `default` stands in where the path does not resolve. It is what `?? 0` is, and it
        // is what makes `lte` the negation of `gt` — without it BOTH are false when absent.
        { path: 'outcome.result.retries', op: 'gt', value: 2, default: 0 },
      ] }, to: 'review' },
      // 3. a registered NAME — for anything the subset cannot say.
      { when: { predicate: 'needsAHuman' }, to: 'review' },
      { to: 'publish' },
    ] },
    { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const registry = {
  predicates: ['needsAHuman'],
  workers: { flow: { url: 'worker.js' } },
  nodeTypes: { ScoreWorker: { worker: 'flow' }, ReviewWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
};
if (validateDefinition(flow, registry).length !== 0) throw new Error('the three shapes are all valid');

// **Every refusal is at CONSTRUCTION, with the key it is about.** Four rules:
const refuse = (when: unknown) => validateDefinition(
  { ...flow, nodes: flow.nodes.map((n) => n.id === 'score' ? { ...n, edges: [{ when, to: 'review' }, { to: 'publish' }] } : n) } as FlowDefinition,
  registry).map((f) => f.rule);

// FD-V42 — the bare STRING that was the form until v0.27, and the message names the migration.
if (refuse('needsAHuman')[0] !== 'FD-V42') throw new Error('a bare string is FD-V42');
// FD-V43 — a path whose first segment is neither `outcome` nor `needs` would resolve to
// nothing in SILENCE, so it is refused rather than answered.
if (refuse({ path: 'result.confidence', op: 'lt', value: 0.5 })[0] !== 'FD-V43') throw new Error('a rootless path is FD-V43');
// FD-V44 — the seven operators are a CLOSED set and one outside it is named.
if (refuse({ path: 'outcome.result.name', op: 'matches', value: '^a' })[0] !== 'FD-V44') throw new Error('an unknown operator is FD-V44');
// FD-V45 — a group is FLAT, and a member naming a registered predicate could be IMPURE.
if (refuse({ all: [{ any: [{ path: 'outcome.result.a', op: 'eq', value: 1 }] }] })[0] !== 'FD-V45') throw new Error('nesting is FD-V45');
```

| | |
|---|---|
| `path` | a key path over the context, **rooted at `outcome` or `needs`** — `outcome.result.x`, `outcome.taskId`, `needs.earlier.flag`. No array index, no wildcard, no expression |
| `op` | one of `eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `startsWith`, and **nothing else** |
| `value` | a scalar: `null`, a boolean, a finite number or a string |
| `default` | optional — what is compared when the path does not resolve **or resolves to `null`**, which is exactly `??`. Without it an absent path is **no match**, and a resolved `null` is compared as the scalar it is |
| `length` | optional `true` — compare the LENGTH of an array or a string, after `default` |

**Three things to know before you write one.**
**A comparison between kinds is no match, never a coercion** — `{ op: 'lt', value: 50 }` is false
against the string `"9"` where JavaScript's `<` would say true.
**An absent path is no match for every operator, including `ne`** — so `ne` does not mean *the key
is missing or different*; add a `default` if that is what you want, and a `default` covers a key
holding `null` as well as a missing one.
**Write a negation as the complementary operator** — `gte` for *not* `lt` — and know its scope:
that holds over NUMBERS, and over an absent path where you declared a `default`. Over a value an
ordering operator cannot compare, a string or a boolean, **both it and its complement are false**.
`startsWith` has no complement here at all.
**A declared predicate CANNOT be impure.** There is no clock, no random source and no way to name
anything but the context, so re-evaluating it over the same log gives the same answer. A registered
name has no such guarantee — which is the trade, and why a regular expression, a date window or a
lookup stays a name.

### A registered NAME, which is what the subset cannot say

**An edge names a predicate; it does not carry one.** The definition stays data, and an unknown name
fails at construction rather than mid-run.

```ts run
import { eligibleEdges, selectEdge, type FlowNode, type Predicate } from 'fyflow-orchestration';

const node: FlowNode = {
  id: 'score', kind: 'task', type: 'ScoreWorker',
  edges: [{ when: { predicate: 'isLowConfidence' }, to: 'review' }, { to: 'publish' }],
};

const isLowConfidence: Predicate = (ctx) => {
  const r = ctx.outcome.result as { confidence?: number } | null;
  return typeof r?.confidence === 'number' && r.confidence < 0.5;
};

const outcome = {
  kind: 'outcome' as const, taskId: 'r1:score:-:0', terminalState: 'done' as const,
  result: { confidence: 0.2 }, error: null, attempts: 0,
  schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
};

// Eligibility is decided FIRST, by terminal state; `when` is evaluated only over
// the edges that are already eligible.
console.log(eligibleEdges(node, 'done').map((e) => e.to));   // [ 'review', 'publish' ]

// **A context BUILDER, not a context** - each edge declares its own `needs`, so each
// predicate sees a different `ctx.needs`. `selectEdge` calls this only for an edge
// that carries a `when`, so a default edge costs nothing.
const taken = selectEdge(node, 'r1', 'done', () => ({ outcome, needs: {} }),
  new Map([['isLowConfidence', isLowConfidence]]));
console.log(taken.taken?.to);                                 // 'review'
if (taken.taken?.to !== 'review') throw new Error('the guarded edge should win at 0.2');
```

**Edges are tried in declaration order** and the first whose `when` passes is taken. An edge with no
`when` is the default and matches immediately, so **it must come last among the edges eligible for
that terminal state** — not last in the array. `FD-V7` is scoped per terminal state, which is why
section 3's example can declare its `on: ['failed']` edge first: for `done` the eligible edges are
`review` then `publish`, and the default is last of those.

A predicate receives the node's **effective outcome** — the same shape whether the task settled or a
human resolved it. It should be pure: it is called during routing, and the library does not enforce
that.

### An edge can let its predicate see an EARLIER node

By default a predicate sees **only its own node's outcome**. *Route to review if an earlier step
flagged low confidence* was not expressible until v0.12 —
[ADR 0041](doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
answering [Q8](doc/questions/q8.md).

**An edge may carry `needs`, and its predicate sees the result under `ctx.needs`.** Same grammar as
a node's (section 3) — a node id, or a one-element array holding one — **minus `"."`**, which an edge
has no use for: *what a predicate would have received anyway* is `ctx.outcome`.

```ts run
import { validateDefinition, type FlowDefinition, type Predicate } from 'fyflow-orchestration';

const registry = {
  predicates: ['flaggedEarlier'],
  workers: { flow: { url: 'worker.js' } }, nodeTypes: { IngestWorker: { worker: 'flow' }, ScoreWorker: { worker: 'flow' }, ReviewWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
};

const flow: FlowDefinition = {
  flowId: 'route-on-an-earlier-step', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
      // this edge's predicate can see `ingest`; the default edge below sees `{}`
      { when: { predicate: 'flaggedEarlier' }, to: 'review', needs: { earlier: 'ingest' } },
      { to: 'publish' },
    ] },
    { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

const flaggedEarlier: Predicate = (ctx) =>
  (ctx.needs as { earlier?: { flagged?: boolean } }).earlier?.flagged === true;

const bad = validateDefinition(flow, registry);
if (bad.length) throw new Error(`invalid: ${bad.map((f) => f.rule).join()}`);

// And the predicate is CALLED, so the one thing this section exists to show is
// executed rather than only typechecked.
const asDriverWouldBuildIt = {
  outcome: { result: { score: 0.9 } } as never,
  needs: { earlier: { flagged: true } },
};
if (!flaggedEarlier(asDriverWouldBuildIt)) throw new Error('ctx.needs.earlier was not what the edge declared');
if (flaggedEarlier({ ...asDriverWouldBuildIt, needs: {} })) {
  throw new Error('an edge that declares nothing must give {} and the predicate must say no');
}

// `"."` is refused ON AN EDGE, and the message names what you already have.
const withSelf = {
  ...flow,
  nodes: flow.nodes.map((n) =>
    n.id === 'score'
      ? { ...n, edges: [{ when: { predicate: 'flaggedEarlier' }, to: 'review', needs: { x: '.' } }, { to: 'publish' }] }
      : n),
} as FlowDefinition;
const findings = validateDefinition(withSelf, registry);
if (!findings.some((f) => f.rule === 'FD-V26' && f.detail.includes('ctx.outcome'))) {
  throw new Error('FD-V26 did not refuse `"."` on an edge');
}
```

**It is on the EDGE and not on the node, for two reasons worth knowing.** A `needs` on the node
changes what its **worker** receives, so you could not give a predicate reach without editing a
worker; and *what the node received* is not something the driver can reconstruct when the decision is
made — the **entry** node's payload is never written to the log at all, and reconstructing any other
node's would mean re-deriving the whole payload contract a second time. **A reference resolves from
what the run produced**, which is available either way.

**`ctx.needs` is `{}` when the edge declares nothing**, never `undefined`; it is **frozen**, so a
predicate that writes to it throws rather than editing what the next predicate reads; and a reference
the run did not produce stops the run with an `UnresolvedReference` (`FD-R3`, section 9) exactly as a
node's does. **An edge with no `when` may carry a `needs` and nothing will ever read it** — accepted
and inert, which `spec/flow-definition.md` section 3 records rather than refuses.

---

## 5. Fan-out, join, and which policy to pass

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const fanout: FlowDefinition = {
  flowId: 'score-both', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split',  kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

const bad = validateDefinition(fanout, {
  predicates: [],
  workers: { flow: { url: 'worker.js' } }, nodeTypes: { IngestWorker: { worker: 'flow' }, ScoreWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
});
if (bad.length) throw new Error(`section 5's own example is invalid: ${bad.map((f) => f.rule).join()}`);
```

### Pass `liveToken`

Three policies are exported. **Use `liveToken`.**

```ts run
import { POLICIES, liveToken, arrivalCount, liveTokenRequiringArrival } from 'fyflow-orchestration';

const ids = Object.keys(POLICIES).sort();
console.log(ids);
if (ids.join() !== 'arrival-count,live-token,live-token-requiring-arrival') {
  throw new Error(`this reference lists three policies and the library exports ${ids.join(', ')}`);
}
console.log(liveToken.id, arrivalCount.id, liveTokenRequiringArrival.id);
if (POLICIES['live-token'] !== liveToken) throw new Error('POLICIES must expose the same objects');
```

**That `throw` used to be a trailing comment**, and it is the one line of this
section a reader could rely on being current: `check-docs` executes the snippet
and asserts nothing about a comment, so a fourth policy would have left it
silently wrong with the whole gate green. `JP-R9` and `npm run check:policies`
are the other half — they compare `POLICIES` against `spec/join-policy.md`
section 3, which is where the names are actually fixed.

`arrivalCount` waits for **N** branches, where N is fixed when the fan-out opens. That is wrong
whenever *"how many will arrive"* differs from *"how many opened"* — and **every non-success outcome
makes it differ**. A branch routed away by a decision never arrives. A branch whose `optional` task
fails never arrives. The counter never completes, and the run waits forever with nothing queued and
nothing running. **Nothing throws** — but run state does report it: such a run folds to **`stuck`**,
the sixth outcome, and `driver.joinStatusOf()` names the join that can no longer fire
([ADR 0015](doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)). A hang you have to
notice yourself is still a hang.

`liveToken` counts *live branches* instead: opening one increments, and arriving, exiting or being
lost each decrement. The join fires when the count reaches zero **having been positive**, whichever
road each branch took.

`liveTokenRequiringArrival` is `liveToken` **with one clause added**: it fires only if at least one
branch actually arrived. On a flow where every branch is routed away, `liveToken` fires a join **no
branch reached** and carries **`{}`** onward — an empty collection, which is what a join with no
arrivals has to say; this one instead reports the join as unfireable — through
`onUnsatisfiableJoin`, with the policy's own state, and the run folds to **`stuck`** with
`regions[…][…].joined === false` whether or not you registered that callback — **two subscripts**,
because `RunState.regions` is keyed by a region's opener and then by that opener's own `branchPath`
([ADR 0062](doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)).
A region whose opener is at top level has one entry, at `'-'`.

```ts run
import {
  liveToken, liveTokenRequiringArrival,
  type JoinPolicy, type Region, type RegionEvent,
} from 'fyflow-orchestration';

const region: Region = { fanoutId: 'split', joinId: 'collect', branches: ['a', 'b'], members: [] };
// `regionPath` is the OPENER'S own branchPath, so the pair (regionId, regionPath)
// names ONE region instance — `'-'` here because `split` opens at top level. A map
// enters one opener once per item, so its node id alone stopped naming one region.
const everyBranchExits: RegionEvent[] = [
  { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '0' },
  { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '1' },
  { type: 'branch.exited', regionId: 'split', regionPath: '-', branchPath: '0', at: 'stop' },
  { type: 'branch.exited', regionId: 'split', regionPath: '-', branchPath: '1', at: 'stop' },
];

function verdict<S>(policy: JoinPolicy<S>, events: RegionEvent[]) {
  let state = policy.open(region);
  for (const event of events) state = policy.step(state, event);
  return policy.status(state);
}

console.log(verdict(liveToken, everyBranchExits), verdict(liveTokenRequiringArrival, everyBranchExits));
if (verdict(liveToken, everyBranchExits) !== 'satisfied') {
  throw new Error('liveToken fires with zero arrivals');
}
if (verdict(liveTokenRequiringArrival, everyBranchExits) !== 'unsatisfiable') {
  throw new Error('liveTokenRequiringArrival declines a join no branch reached');
}
```

**Which to pass is a judgement about your flow, and neither answer is safe by default.** If every
branch of a fan-out ending somewhere else is a legitimate way for your flow to finish, `liveToken`
is right and the run completes. If it means the work the join was going to combine never happened,
`liveTokenRequiringArrival` reports that join dead and does not run its successor on nothing. The
recommendation is still `liveToken`, because a run that stops is the more expensive mistake to make
by accident.

**"Stops the run" is exact at depth 1 and not at depth 2**, which is worth knowing before you nest a
fan-out. A dead join stops **its own** region; if that region sits inside a branch of another one,
the branch **ends** and the outer join gets to decide for itself — so the outer join may fire and its
successor may run, doing real work in a run that will still fold to `stuck` (`joined: false` on the
dead region is what `stuck` reads, and it reads every region). Section 11's nested-fan-out row, and
[ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md).

**One refinement is deliberately still unbuilt.** `arrivalCount`'s **N is fixed when the fan-out
opens** and is *not* decremented when a branch is routed away. Decrementing it is
[`JP-R7`](spec/join-policy.md), and
[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
refused it: measured over the join matrix, every row where it differs from `liveToken` is a row where
it **waits forever** and `liveToken` proceeds, and it can never say why. It is `liveToken` weakened.

**`arrivalCount` is still exported deliberately** — it is the falsifiable form of the simpler
mechanism, and the comparison that chose between them is only meaningful while both can be run. It
is not a supported choice. See
[ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) and
[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md).

### What a join carries downstream

**The arrived branches' results, keyed by branch path.** A satisfied join dispatches its successor
with an object whose keys are the `branchPath`s of the branches that **reached** it, and whose values
are what each of those branches carried in — so a fan-out's results are not thrown away, and the
value is the same whatever order the branches finished in.

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type FoldInput, type RegistryDocument } from 'fyflow-orchestration';

// Two workers of your own: one returns a score after a stated delay, the other tags whatever it was
// handed so the collection is legible in what it returns.
const registry: RegistryDocument = {
  workers: {
    scorer: { url: '../../examples/getting-started/scorer.ts' },
    tag: { url: '../../examples/getting-started/tag.ts' },
  },
  nodeTypes: {
    Scorer: { worker: 'scorer', inline: true },
    Tag: { worker: 'tag', inline: true },
  },
};
const flow: FlowDefinition = {
  flowId: 'collect', version: 1, entry: 'split',
  nodes: [
    { id: 'split',   kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    // `scoreA` is branch path "0" and is made SLOW on purpose, so "1" settles first.
    { id: 'scoreA',  kind: 'task', type: 'Scorer', settings: { score: 0.9, ms: 40 }, edges: [{ to: 'collect' }] },
    { id: 'scoreB',  kind: 'task', type: 'Scorer', settings: { score: 0.4 },         edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'Tag', settings: { label: 'publish' }, edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end', outcome: 'completed' },
  ],
};

const runtime = createRuntime(registry, {}, { base: import.meta.url });
// **`onFoldInput` is still here and what it is for is the ORDER, not the END.** `await done` is the
// end (ADR 0058). `RunState.nodes` keys everything by task id and carries no settlement order — *which
// branch settled first* is a fact only the input SEQUENCE carries, and it is what the
// claim below is measured against. **This is the residue**: `done` takes the termination out of a
// snippet and leaves whatever else the callback was doing.
const inputs: FoldInput[] = [];
const state = await runtime.start(flow, {}, { onFoldInput: (input) => { inputs.push(input); } }).done;
await runtime.shutdown();

// **The order is READ, not assumed.** The delay above ASKS for branch "1" to settle first; this is
// what the run actually did, and the claim below is about the collection being independent of it.
const settledOrder = inputs.flatMap((i) =>
  (i.kind === 'outcome' && /:score[AB]:/.test(i.record.taskId) ? [i.record.taskId.split(':')[1]] : []));
console.log(settledOrder.join(' then '));    // 'scoreB then scoreA'

// `publish` is the join's successor, so what it received IS the collection — and `tag` returns what
// it was handed with its own label added, so the collection is readable in the result.
const published = Object.values(state.nodes).find((n) => n.nodeId === 'publish')?.result;
console.log(JSON.stringify(published));      // {"0":{"score":0.9},"1":{"score":0.4},"publish":true}

const want = '{"0":{"score":0.9},"1":{"score":0.4},"publish":true}';
if (JSON.stringify(published) !== want) throw new Error(`the join carried ${JSON.stringify(published)}`);
// **B settled FIRST and is still under key "1".** The collection is keyed by BRANCH PATH, not by
// arrival order, which is the whole point — and the two assertions are a pair: the first says which
// order the run took, the second says the record did not follow it.
if (settledOrder.join() !== 'scoreB,scoreA') throw new Error(`settled ${settledOrder.join()} — the arrangement did not hold, so the claim below is untested`);
```

**Three things to know before you write code against it.**

1. **A branch that did not arrive has no key.** Routed away to an `end`, lost with no eligible edge,
   or still suspended on a person — all three are absent rather than `null`. So `Object.keys(payload)`
   is *which branches arrived*, and it is **not** the width of the fan-out. Code that assumes N
   entries is wrong on every non-success outcome.
2. **`{}` is a real answer, not an error.** Under `liveToken` a join fires once its region has no live
   branches, and every branch reaching an `end` satisfies that with nothing arrived. If that should be
   a failure instead, pass `liveTokenRequiringArrival` — see above.
3. **The keys are strings, in ascending branch-path order**, compared segment by segment as numbers —
   so `"0"`, `"1"`, `"2"`, `"10"` at the top level, and `"1.0"`, `"1.1"`, `"1.10"` inside branch 1.
   A nested region's inner join carries its own object, which becomes the value of the outer branch it
   sits in. **Every key of one collection has the same number of segments**, because they are the
   branch paths of one region. *(An earlier version of this bullet illustrated the order as `"1"`,
   `"1.0"`, `"2"`, `"10"` — a mix of depths that no single collection can hold, and one that
   `Object.keys` would not even return in that order, because JavaScript re-orders integer-like keys
   ahead of string ones. W34's conformity reader.)*

*(This section read **"`null`, currently … this is [Q36](doc/questions/q36.md) and it is open"**
until [ADR 0037](doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md).
The argument for the `null` was real and is unchanged — which branch finishes last is genuinely
non-deterministic — and what answered it is that carrying **all** the arrivals keyed by branch is not
picking one. `spec/join-policy.md` section 4, `JP-R12`.)*

### The same on the RUNTIME — a decision, a fan-out and a join on real workers

*Everything in this section runs on a REAL `FyflowScheduler`. The three snippets above this line
touch no scheduler at all — they validate a document, list the policies, and call a policy
directly — and the one that did build a fake, *What a join carries downstream*, now builds a
runtime like everything else ([W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md)).
*(This sentence has been wrong twice in two days and in opposite directions. It read *everything
above this line runs on a fake scheduler* while section 2 above it built a real one — W70's
conformity reader — and then, scoped to this section, it read the same thing while ZERO snippets
here did, because W71 converted the only one that had. Both times an item rewrote the code inside
the fences and left every sentence around them untouched.)* This is the same three node kinds on
`createRuntime`, two runs on one runtime, every value read off the run — [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md).
It is also `README.md`'s second snippet, held byte-equal to this one by `check-docs`'s `X8`.*

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type Predicate, type RegistryDocument, type RunState } from 'fyflow-orchestration';

// THE REGISTRY — one worker, one type, and the NAME of a predicate the flow may use. A predicate is
// code (ADR 0002), supplied beside the document under that name; a flow using a name nobody supplied
// is refused at construction, not at the decision. The worker tags its input with the node's label.
const registry: RegistryDocument = {
  workers: { tag: { url: '../../examples/getting-started/tag.ts' } },   // in your program: './tag.ts'
  nodeTypes: { Tag: { worker: 'tag', inline: true } },
  predicates: ['isLowConfidence'],
};
// A predicate reads the EFFECTIVE outcome, and `result` is `null` for an optional task that
// failed (`OR-R9`) — so it is guarded, as section 4's is. Unreachable here, because `ingest` is
// not optional; guarded anyway, because this is the form a consumer copies.
const isLowConfidence: Predicate = (ctx) => {
  const r = ctx.outcome.result as { confidence?: number } | null;
  return typeof r?.confidence === 'number' && r.confidence < 0.5;
};

// THE FLOW — a DECISION, a FAN-OUT, a JOIN. `ingest`'s first edge is taken when its predicate says so,
// otherwise the last, unconditional one. `split` opens two branches that run concurrently; `collect`
// waits for both and hands `publish` every branch's result keyed by branch path (JP-R12). `review` is
// the road the run takes when confidence is low — it never reaches the join, and the run completes.
const flow: FlowDefinition = {
  flowId: 'decide', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest',   kind: 'task', type: 'Tag', settings: { label: 'ingest' },
      edges: [{ when: { predicate: 'isLowConfidence' }, to: 'review' }, { to: 'split' }] },
    { id: 'review',   kind: 'task', type: 'Tag', settings: { label: 'review' },   edges: [{ to: 'done' }] },
    { id: 'split',    kind: 'fanout', branches: ['enrich', 'classify'] },
    { id: 'enrich',   kind: 'task', type: 'Tag', settings: { label: 'enrich' },   edges: [{ to: 'collect' }] },
    { id: 'classify', kind: 'task', type: 'Tag', settings: { label: 'classify' }, edges: [{ to: 'collect' }] },
    { id: 'collect',  kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish',  kind: 'task', type: 'Tag', settings: { label: 'publish' },  edges: [{ to: 'done' }] },
    { id: 'done',     kind: 'end',  outcome: 'completed' },
  ],
};

// ONE runtime, TWO runs. Pools belong to the runtime and are shared across runs; each run is its own
// `Driver` with its own fold, and the join policy defaults to `live-token` (ADR 0003).
const runtime = createRuntime(registry, { predicates: { isLowConfidence } }, { base: import.meta.url });
// Each run has its OWN `done`, so two runs are two promises — `start` is called twice and the whole
// of the wait is `await`. Nothing here folds anything: the runtime keeps the fold (ADR 0058).
const run = (payload: unknown) => runtime.start(flow, payload).done;
const high = await run({ confidence: 0.9 });
const low = await run({ confidence: 0.2 });
await runtime.shutdown();

// WHICH nodes ran, read off each run's own state — the decision took a different edge each time.
const ran = (s: RunState) => Object.values(s.nodes).map((n) => n.nodeId).sort();
const resultOf = (s: RunState, id: string) => Object.values(s.nodes).find((n) => n.nodeId === id)?.result;
console.log(ran(high));                    // [ 'classify', 'enrich', 'ingest', 'publish' ]
console.log(ran(low));                     // [ 'ingest', 'review' ]
console.log(resultOf(high, 'publish'));    // { '0': { confidence: 0.9, ingest: true, enrich: true }, '1': { …, classify: true }, publish: true }

if (high.outcome !== 'completed' || low.outcome !== 'completed') throw new Error(`outcomes ${high.outcome} / ${low.outcome}`);
if (ran(high).join() !== 'classify,enrich,ingest,publish') throw new Error(`high ran ${ran(high).join()}`);
if (ran(low).join() !== 'ingest,review') throw new Error(`low ran ${ran(low).join()}`);
// `publish` received BOTH branches' results, keyed by branch path (JP-R12), and each branch's value
// carries the whole road it came by. What this string pins is the branch-to-KEY MAPPING: the ASCENDING
// order that rule also fixes is not observable at depth 1, because "0" and "1" are integer-like keys
// and the language orders those ascending whatever the driver did. A nested region would show it.
const want = '{"0":{"confidence":0.9,"ingest":true,"enrich":true},"1":{"confidence":0.9,"ingest":true,"classify":true},"publish":true}';
if (JSON.stringify(resultOf(high, 'publish')) !== want) throw new Error(`publish received ${JSON.stringify(resultOf(high, 'publish'))}`);
```

---

## 6. When something fails

**A non-success outcome routes only where an edge opts in.** This is the rule most people guess
wrong.

```ts run
import { eligibleEdges, type FlowNode } from 'fyflow-orchestration';

const node: FlowNode = {
  id: 'extract', kind: 'task', type: 'ExtractWorker', optional: true,
  edges: [{ on: ['failed'], to: 'quarantine' }, { to: 'publish' }],
};

console.log(eligibleEdges(node, 'done').map((e) => e.to));    // [ 'publish' ]
console.log(eligibleEdges(node, 'failed').map((e) => e.to));  // [ 'quarantine' ]
if (eligibleEdges(node, 'failed').map((e) => e.to).join() !== 'quarantine') {
  throw new Error('an edge with no `on` must not be eligible for a failure');
}
```

An edge with no `on` defaults to `['done']`. **If nothing opts into a failure, the path ends there** —
that is a legitimate way to write a flow, not an error, and it is declared by omission.

### `optional` decides what a failure *means*

| the task | the scheduler ends it | the branch |
|---|---|---|
| `optional: true` | `failed` | routes if an edge opts in; otherwise **lost** |
| `optional: false` (default) | **`user_action`** | **suspends** — section 7 |

**`optional: false` does not mean "must not fail".** It means *"a human decides"*. If you want the
flow to handle failure without a person, set `optional: true` and give it an `on: ['failed']` edge.

**An `on: ['failed']` edge on a non-optional node is not dead code**, which is the natural reading of
the table above and is wrong. `resolve(taskId, 'failed', …)` routes exactly as an `optional` node's
failure would, and `RS-R3` notes it is **the only road by which a non-`optional` node reaches an
`on: ['failed']` edge**. That is the half of the human-in-the-loop story section 7 completes.

### A task that ends `cancelled` ends its RUN

The scheduler can end a task a third way: **`scheduler.cancel(id)`** stops it — waiting or running,
`optional` or not, whatever its attempt produced — and it ends in state `cancelled` with one event,
`task.cancelled`. The driver hears it, records it (`OR-R3`), and **halts the run**: nothing is dispatched
or routed for it again, and the run folds to **`cancelled`** (`RN-R28`,
[ADR 0094](doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)).

| | what happens |
|---|---|
| the cancelled task | one record, `terminalState: 'cancelled'`, `result: null`. `task.cancelling` — the request, while a running task stops — writes nothing (`OR-R4`) |
| an edge | **none can opt in**: `on: ['cancelled']` is refused at construction (`FD-V18`). A cancel is the owner's act, not an outcome a flow branches on |
| the rest of the run | a task still in flight is **routed nowhere** when it settles — a bare `Driver` still records it; on a runtime, once `done` has settled the run is RELEASED and later settlements reach no driver (section 12, [ADR 0091](doc/decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)); a parked task stays parked and `resolve()` returns `false`; a join it left waiting never fires, and the run is NOT `stuck`. **One limit, shared with a stop**: a cancel raised SYNCHRONOUSLY from your own `onFoldInput` while a fan-out is dispatching its branches, or while a resolution is routing, can let one more dispatch through ([Q605](doc/questions/q605.md)) |
| what is reported | nothing: a cancel is not a refusal, so `onRunFailure` is not called and `hasFailed()` stays `false` — read `state.outcome` |
| `done` | settles on the FIRST cancel, with `outcome: 'cancelled'` — the run's other tasks may still be running; cancel those by id |
| a resume | refused, `reason: 'cancelled'` (section 18) |

```ts run
import { Driver, fold, liveToken, resumeRefusal, type FlowDefinition } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'cancel-one', version: 1, entry: 'split',
  nodes: [
    { id: 'split',   kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a',       kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b',       kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end', outcome: 'completed' },
  ],
};

// The fake scheduler of section 12's no-scheduler snippet: listeners keyed by event type.
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const added: string[] = [];
const failures: string[] = [];
const scheduler = {
  addTask(task: unknown) { added.push((task as { id: string }).id); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
    listeners.set(type, [...(listeners.get(type) ?? []), fn]);
  },
};
const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };

const driver = new Driver(flow, {
  runId: 'run-1', scheduler, createTask: (c) => c, predicates: new Map(),
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } },
  joinPolicy: liveToken, onRunFailure: (f) => { failures.push(f.kind); },
});
driver.start({});
console.log(added);                        // [ 'run-1:a:0:0', 'run-1:b:1:0' ]

// Somebody cancels branch `a` — the scheduler fires `task.cancelled`, and nothing else, for it.
fire('task.cancelled', { id: 'run-1:a:0:0', state: 'cancelled' });
// Branch `b` was already running; it finishes. It is recorded, and routed nowhere.
fire('task.completed', { id: 'run-1:b:1:0', state: 'done', result: { b: 1 } });

const state = fold(driver.foldInputs());
console.log(state.outcome, added.length, failures);   // cancelled 2 []
if (state.outcome !== 'cancelled') throw new Error(`expected cancelled, got ${state.outcome}`);
if (added.includes('run-1:publish:-:0')) throw new Error('a cancelled run must not route on to the join`s successor');
if (failures.length !== 0) throw new Error('a cancel is not a run failure');
if (state.nodes['run-1:b:1:0']?.state !== 'done') throw new Error('the in-flight task is still recorded');

// And the run cannot be resumed.
console.log(resumeRefusal(flow, driver.checkpoint())?.reason);   // 'cancelled'
if (resumeRefusal(flow, driver.checkpoint())?.reason !== 'cancelled') throw new Error('a cancelled run is not resumable');
```

**This makes a cancel NOTICED; it adds no call that cancels a run.** Cancelling, stopping and pausing a
whole run are [P34](doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s. Until then a cancel
is what you do to a task id through the scheduler, and its run ends the moment the first one is heard.

**`'cancelled'` is a NEW value of four published unions** — `TerminalState`, `NodeState`, `RunOutcome` and
`ResumeRefusalReason`. **A `switch` that is exhaustive over any of them no longer compiles, which is the
loud half; code that compares strings sees a value it never named and does not notice, which is the
silent half.** A `Record<RunOutcome, …>` needs a seventh key.

---

## 7. The human in the loop

A non-optional task that runs out of retries ends in `user_action`. The branch **suspends**: the join
keeps waiting, and the run is not stuck.

> **A `user_action` task fires TWO events, and the first one is called `task.failed`.** The scheduler
> sets `state = 'user_action'` and then dispatches `task.failed` *and* `task.user_action` carrying
> the same object. **Never key on the event name alone**: that first `task.failed` is for a task
> that did not fail, and treating it as one both double-counts the settlement and routes a
> human-intervention case down an error edge. The driver drops it and records on the second — it
> matters if you subscribe to the scheduler yourself.
> [ADR 0007](doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
> rule 2. The scheduler's own reference records the pair in its per-task event order —
> *"`task.failed` (plus `task.user_action`)"* — while its task-states paragraph still says *"`task.failed`
> fires once per failed task"*; trust the pair (re-read at the pin by W157 and W158).

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { fold, type FlowDefinition, type FoldInput, type RegistryDocument } from 'fyflow-orchestration';

// A worker that FAILS — `examples/getting-started/flaky.ts`, a class with a `run` that throws. The
// node is not `optional`, so when its retries are spent the scheduler parks it for a person.
const registry: RegistryDocument = {
  workers: { flaky: { url: '../../examples/getting-started/flaky.ts' } },
  nodeTypes: { Flaky: { worker: 'flaky', inline: true } },
};
const flow: FlowDefinition = {
  flowId: 'review', version: 1, entry: 'score',
  nodes: [
    { id: 'score', kind: 'task', type: 'Flaky', settings: {}, edges: [
      { on: ['failed'], to: 'quarantine' },
      { to: 'done' },
    ] },
    { id: 'quarantine', kind: 'end', outcome: 'quarantined' },
    { id: 'done',       kind: 'end', outcome: 'completed' },
  ],
};

const runtime = createRuntime(registry, {}, { base: import.meta.url });
const inputs: FoldInput[] = [];
let parked: string | null = null;

// **The run does not end; it STOPS AND WAITS.** `awaiting_action` is the run's outcome and
// `suspended` is the node's — and those are the words the FOLD uses. The scheduler's own event is
// called `task.user_action`, which is not what you poll on, and is the mistake this snippet used to
// invite by delivering that event to a hand-built stub.
const { driver, done } = runtime.start(flow, {}, { onFoldInput: (input) => { inputs.push(input); } });

// **`done` IS STILL PENDING HERE, and that is the trap this section exists to teach.** Its
// settlement rule is terminality and nothing else (ADR 0058 rule 3), and `isTerminal` is
// `outcome !== 'running' && outcome !== 'awaiting_action'` — so a run parked on a person is not
// terminal and `done` waits for the resolution. **A promise cannot tell you a run has PARKED**,
// because parking is not the end; the poll below is for the state `done` is waiting THROUGH, and it
// is the one thing here a completion handle does not give you.
// **THE DEADLINE, ARMED FIRST — one line, because `done` IS a promise.** There is no library
// default and no `StartOptions` entry for one (ADR 0058 rule 8): a default would be wrong for
// exactly this run, where the honest wait is *as long as it takes a person*. What a hand-rolled
// `new Promise` could not give whoever held it is a way to RACE it. **It is armed before the wait
// and not after**, because what `done` is
// waiting for is the decision below — a race started once the person has already decided is a race
// whose other side has already lost, and it would demonstrate the shape while being unable to fire.
let timer: ReturnType<typeof setTimeout> | undefined;
const nobodyCame = new Promise<never>((_, reject) => {
  timer = setTimeout(() => reject(new Error('nobody resolved the suspended task in time')), 10_000);
});

// THE PERSON, deciding while `done` is pending. Started, not awaited: it polls the fold for the
// park — the state `done` waits THROUGH — and resolves the task, which is what settles `done`.
const person = new Promise<void>((resolve, reject) => {
  const poll = () => {
    const s = fold(inputs);
    if (s.outcome !== 'awaiting_action') { setTimeout(poll, 5); return; }
    parked = Object.keys(s.nodes).find((id) => s.nodes[id].state === 'suspended') ?? null;
    if (parked === null) { reject(new Error('awaiting_action with no suspended node')); return; }

    // ONE pair of events, ONE record. The scheduler dispatches `task.failed` AND
    // `task.user_action` carrying the same object; the driver drops the first, whose detail
    // already reads `user_action`, and records on the second. Read off a REAL pair, not a
    // hand-delivered one.
    const records = driver.snapshot().filter((r) => r.taskId === parked);
    if (records.length !== 1) { reject(new Error(`the event pair produced ${records.length} records`)); return; }

    // The only way anything outside this process changes a run — and it takes THREE arguments.
    // `actor` is opaque: never interpreted, never authenticated (Q29).
    const accepted = driver.resolve(parked, 'failed', { actor: 'a-person' });
    const again    = driver.resolve(parked, 'failed', { actor: 'a-person' });
    if (!accepted || again) { reject(new Error('a second resolution must be refused, not applied twice')); return; }
    resolve();
  };
  poll();
});

// **`done` AND the person, against the clock.** Neither the poll nor the deadline folds anything or
// decides what "over" means: the first is the state the run PARKS in and the second is your patience.
//
// **`person` is inside the race and not awaited after it**, which is two defects in one line and
// both were real. Awaited afterwards it is UNBOUNDED — a run that reaches a terminal outcome without
// ever parking leaves the poll looping for ever, which is the very shape this section teaches the
// counter-measure for; and its three `reject`s reached a promise nothing had attached to yet, so
// Node killed the process with `ERR_UNHANDLED_REJECTION` and the snippet failed as a CRASH rather
// than as a throw. *Both found by W78's conformity reader, one line past the deadline written to
// prevent the first.*
const state = await Promise.race([Promise.all([done, person]).then(([s]) => s), nobodyCame]);
clearTimeout(timer);
await runtime.shutdown();

// `resolvedAs: 'failed'` took the `on: ['failed']` edge — the only road there for a non-optional
// node — so the run ends at `quarantine`. The END node's `outcome` is a label of yours; the RUN's
// outcome is the fold's, and it is `completed` because a path reached an end.
const ended = Object.values(state.nodes).find((n) => n.nodeId === 'score');
console.log(state.outcome, ended?.state, state.pathEnds.map((p) => p.at).join());
// 'completed' 'failed' 'quarantine'
// The node's own state is `failed`, not `resolved`: `resolvedAs` is what a person DECIDED,
// and the node records the terminal state that decision gave it.
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
if (parked !== 'r1:score:-:0') throw new Error(`parked at ${parked}`);
if (ended?.state !== 'failed') throw new Error(`the node settled ${ended?.state}`);
// **WHICH END the run reached is what `resolvedAs` decided**, and until W71's adequacy reader
// read this snippet nothing observed it: both roads fold to `completed`, so resolving 'done'
// instead of 'failed' changed the road and no assertion moved. `pathEnds` carries the end each
// path reached, which is the whole of the paragraph below.
if (state.pathEnds.map((p) => p.at).join() !== 'quarantine') {
  throw new Error(`the run ended at ${state.pathEnds.map((p) => p.at).join()}, not at quarantine`);
}
```

`resolve()` returns `false` if the task is not suspended — a rejected command, not a run failure, so
you may retry. It does **one** thing: supply an outcome for a dispatch that already happened. It
cannot re-run the node and it cannot send it somewhere else. It also returns `false` once the run has
been **stopped** by a refusal (section 9), and there retrying can never succeed: check
`driver.hasFailed()` to tell the two `false`s apart.

A resolved node is **indistinguishable** from one that settled that way: same node state, same
`result`, same routing.

> **A suspended run never finishes on its own, and that is correct.** If you are waiting for a run to
> reach a terminal outcome, `awaiting_action` is not one — see section 8.

---

## 8. Run state

**Run state is a pure fold of an ordered log.** The driver produces the sequence; `fold` turns it
into state and touches nothing else.

```ts run
import { fold, isTerminal, type FoldInput } from 'fyflow-orchestration';

const settled = (taskId: string, state: 'done' | 'failed' | 'user_action' | 'cancelled'): FoldInput => ({
  kind: 'outcome',
  record: { kind: 'outcome', taskId, terminalState: state, result: null, error: null,
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1 },
});

const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const ended = (reason: 'end' | 'no-eligible-edge'): FoldInput =>
  ({ kind: 'pathEnded', reason, at: 'x' });
const openJoin: FoldInput =
  { kind: 'joinSettled', regionId: 'split', regionPath: '-', joinId: 'collect', fired: false };

// Each row adds ONE input to the row below it and must outrank it. Read downwards:
// this is the precedence table, executed.
const rows: [string, FoldInput[]][] = [
  ['completed',       [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end')]],
  ['failed',          [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge')]],
  ['stuck',           [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin]],
  ['running',         [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0')]],
  ['awaiting_action', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action')]],
  ['cancelled',       [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       dispatched('r1:d:-:0'), settled('r1:d:-:0', 'cancelled')]],
  ['stopped',         [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       dispatched('r1:d:-:0'), settled('r1:d:-:0', 'cancelled'),
                       { kind: 'stopped', reason: 'DuplicateTaskId: x' }]],
];
for (const [expected, inputs] of rows) {
  const got = fold(inputs).outcome;
  console.log(expected, '->', got);
  if (got !== expected) throw new Error(`precedence: expected ${expected}, got ${got}`);
}

// `isTerminal` is false for exactly `running` and `awaiting_action`.
const terminal = Object.fromEntries(rows.map(([o, i]) => [o, isTerminal(fold(i))]));
console.log(terminal);   // completed/failed/stuck/cancelled/stopped true, running/awaiting_action false
if (!terminal.stuck) throw new Error('`stuck` is terminal — that is the point of it existing');
if (terminal.running || terminal.awaiting_action) throw new Error('a live run is not terminal');
if (!terminal.completed || !terminal.failed || !terminal.cancelled || !terminal.stopped) {
  throw new Error('completed, failed, cancelled and stopped are all terminal');
}

// `completed` means every live path reached an `end` — NOT "no node settled failed".
// A failed node that routed on through an `on: ["failed"]` edge completes the run.
const routedOn = fold([dispatched('r1:a:-:0'), settled('r1:a:-:0', 'failed'), ended('end')]);
console.log(routedOn.outcome);                                // 'completed'
if (routedOn.outcome !== 'completed') throw new Error('a failed node that routed on still completes');
```

In your own program you fold what the driver gives you:

```ts check
import { fold, isTerminal, type Driver } from 'fyflow-orchestration';

declare const driver: Driver;
const state = fold(driver.foldInputs());
if (isTerminal(state)) console.log('finished as', state.outcome);
```

### The seven outcomes, highest first

| | means |
|---|---|
| `stopped` | a refusal terminated the run — section 9 |
| **`cancelled`** | **a task of the run was cancelled, and the driver halted it** — section 6. It outranks everything below it, a parked task and a waiting join included |
| `awaiting_action` | a node is suspended and nobody has resolved it |
| `running` | a dispatched node has not settled |
| **`stuck`** | nothing is live and **nothing ever will be**: a join has not fired and cannot |
| `failed` | a path ended with no eligible edge |
| `completed` | every live path reached an `end` node |

**Read the outcome at a quiescent point** — after the driver's turn, not part-way through it. The
fold is defined over any prefix, and a prefix taken mid-turn is not a resting state: a settlement is
recorded before the routing it causes, so there are instants where nothing is running and the run is
not over. If you fold `driver.foldInputs()` after the fact you are always at a quiescent point; if
you fold incrementally from `onFoldInput`, read on a `queueMicrotask` — and that microtask is
**load-bearing rather than decoration**, which is why `done` asks its own predicate at one
([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)
rule 6). *(That phrase lived in §2's copied block until [W78](doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md)
reduced it to `await done`; ADR 0058's Context cites it, so it moved here rather than going out with
the block — W78's conformity reader, finding 3.)*

**`isTerminal(state)` is how you wait for a run without a clock.** It is false for `running` and
`awaiting_action` and true for everything else — including `stuck`, which is the point: before
`stuck` existed, a permanently hung run folded to `completed` and a waiter reported success.

**And `done` is that rule applied for you.** `runtime.start` returns `{ driver, done, header }` —
`header` is the run's CHECKPOINT header since
[ADR 0064](doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md),
and `driver.checkpoint()` hands out the header with every event so far (`spec/run-state.md`
section 8); `runtime.resume(flow, checkpoint)` resumes a run from one, returning the same handle
([ADR 0065](doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md), `spec/run-state.md` section 9 — section 18 teaches it, as an executed snippet) — and `done`
resolves with the first `RunState` this predicate calls terminal
([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)). It
is the same two functions — the runtime keeps one `RunState`, steps it per input and asks
`isTerminal` at a quiescent point — so there is one definition of *over* with one more caller, and
nothing above about reading at rest stops being true. **Three things follow, and two of them catch
people:**

- **`done` never rejects.** `failed`, `stuck`, `cancelled` and `stopped` are terminal OUTCOMES, not
  errors, so a run that goes wrong arrives as `state.outcome`. A driver refusal resolves it with
  `stopped` and `stoppedBy` naming the refusal — section 9; a cancelled task resolves it with
  `cancelled` on the FIRST cancel, while the run's other tasks may still be running — section 6.
- **`awaiting_action` is NOT terminal, so `done` waits through it.** A run parked on a person stays
  pending until somebody calls `resolve()`, which is correct and is the trap: if you are waiting for
  a run and a human is in it, you are waiting for the human. Section 7 is the worked case.
- **There is no deadline and there is no option for one**, because once `done` is a promise
  `Promise.race([done, timeout])` is your one line — and a library default would be wrong for the
  bullet above.

---

## 9. Refusals

Two kinds, and **the distinction is the stack, not the refusal class** (`OR-R10`). The same class can
do either: whether you are on the stack when it is raised is what decides. A refusal raised while
*your* call is running is thrown; one raised inside a scheduler event listener is reported, because
`EventTarget.dispatchEvent` **discards a listener throw** and there is nobody to catch it.

**Thrown**, because you are on the stack and can act:

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';

// **THROWN — raised while YOUR call is running.** A registry defect is refused by `createRuntime`,
// on your stack, so a `try` catches it and names the entry.
let thrown = '';
try {
  createRuntime({
    workers: { scorer: { url: '../../examples/getting-started/scorer.ts' } },
    nodeTypes: { Scorer: { worker: 'typo' } },        // no such worker key
  } as RegistryDocument, {}, { base: import.meta.url });
} catch (e) {
  thrown = (e as Error).constructor.name;
}
console.log(thrown);                                   // 'WorkerMissing'
if (thrown !== 'WorkerMissing') throw new Error(`construction refused with ${thrown}`);

// **REPORTED — raised inside a scheduler event listener.** Nobody is on the stack to catch it:
// `EventTarget.dispatchEvent` DISCARDS a listener throw, so the driver reports it instead and the
// run stops. This is the half a `try` around your own call can never see.
const registry: RegistryDocument = {
  workers: { scorer: { url: '../../examples/getting-started/scorer.ts' } },
  nodeTypes: { Scorer: { worker: 'scorer', inline: true } },
};
const flow: FlowDefinition = {
  flowId: 'bad-arity', version: 1, entry: 'first',
  nodes: [
    { id: 'first', kind: 'task', type: 'Scorer', settings: { score: 0.9 }, edges: [{ to: 'each' }] },
    // `over` names a key of what `first` returned — and `score` is a NUMBER, not a list.
    { id: 'each',  kind: 'map', over: 'score', branch: 'one' },
    { id: 'one',   kind: 'task', type: 'Scorer', settings: { score: 1 }, edges: [{ to: 'join' }] },
    { id: 'join',  kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done',  kind: 'end', outcome: 'completed' },
  ],
};

const runtime = createRuntime(registry, {}, { base: import.meta.url });
const reported = await new Promise<{ kind: string; message: string }>((resolve) => {
  // A DEADLINE resolving to a SENTINEL, so that *nothing was reported* is this snippet's own
  // failure rather than a hang. W71's adequacy reader made the driver swallow the refusal and
  // the snippet died as `Detected unsettled top-level await` — a crash is not a detection.
  const deadline = setTimeout(() => resolve({ kind: 'NOTHING WAS REPORTED', message: '' }), 10_000);
  runtime.start(flow, {}, { onRunFailure: (f) => { clearTimeout(deadline); resolve({ kind: f.kind, message: f.message }); } });
});
await runtime.shutdown();

console.log(reported.kind);                            // 'UnresolvedMapArity'
if (reported.kind !== 'UnresolvedMapArity') throw new Error(`the run reported ${reported.kind}`);
// Same library, same kind of mistake, two different roads out — and which road it takes is decided
// by whether you were on the stack, not by the class (`OR-R10`).
// *(The OTHER way this leg can go wrong — the refusal ESCAPING the listener instead of being
// reported — takes the whole process down through `EventTarget`'s own rethrow, so it cannot be
// this snippet's assertion whatever the snippet does. The deadline above closes the half that
// can be closed: a refusal SWALLOWED in silence.)*
// **`MissingJoinPolicy` is NOT reachable on this road**, and it is in the error-class enumeration below: a fan-out
// with no policy is refused when YOU build a `Driver`, and `createRuntime` always supplies one
// (`live-token` by default), so the runtime cannot raise it. A refusal a road cannot reach is
// still a refusal — it belongs to the road in section 12, which is where a caller passes its own
// scheduler and its own policy.
```

`InvalidDefinition` carries the violated rule ids on `.rules`, so you can act on them rather than
parse a string. `InvalidRunId` is thrown by the **constructor** for a `runId` outside `[A-Za-z0-9_-]{1,64}`
(`ID-R2`) — `:` is excluded because it is the task-id delimiter, and excluding it is what makes the
task-id parse total.

**A defect in the REGISTRY's SHAPE is thrown at `new Driver` too, as a NAMED class extending
`RegistryError`** — `spec/flow-definition.md` v0.19, section 13 here — each carrying `at`, the entry's
key, and a message naming the entry. `new Driver` runs the shape half only, six classes:
`WorkerMissing` (a type naming no worker entry, an entry with no `url`), `PoolTypeMissing`,
`NameCollision` (a pool named as a type), `SchemaRefused` (a keyword outside the subset), and
`UndeclaredKey` and `DerivationRefused` for a type's or a pool's field of the wrong shape. The other
five — `ConfigRefused`, `TypeDefaultRefused`, `GroupTypeMissing`, `GroupConfigRefused`,
`NameMissing` — need a derivation run or a group built, and are thrown by
`resolveRegistry(document, code)` when a registry DOCUMENT is resolved against the code that
supplies its predicates, languages, group types and node-type classes, by `createRuntime` (which
calls that resolver first — section 12), and by the bootstrap helper before it builds a pool. The
twelfth, **`GateTypeRefused`** (v0.23), is thrown by `checkRegistry` when a gate type it holds is not
a `GateType` — the built-ins `distinct`, `if` and `switch` on every call, and any the registry adds in `gateTypes` — and a gate
type named as a built-in is `NameCollision` — at `new Driver`, which since W93 takes yours as `gateTypes`, and
at `createRuntime`, which takes them as `code.gateTypes` and hands them to every run (section 3). None is `InvalidDefinition`, on purpose: a registry defect is fixed in the registry and a flow defect in the
flow, and the class says which document to open.

**And three the RUNTIME adds, all `RuntimeError` subclasses from `fyflow-orchestration/scheduler`**
(W66): `GroupUnusable` — a group factory returned something the scheduler cannot use, naming the
member and the group's key; `GroupNotBuildable` — a group type with no `create`; and, since W89, `RunIdInUse`
— a `start` or `resume` naming a run id that runtime has already built a driver for, a finished run's included (`RN-R25`, ADR 0091).
*(`LanguageNotBuilt` — a flow transforming on a type no pool was built for — was a fourth until W162 removed it
with `createRuntime`'s `flows`: every typed pool carries every registered language since
[ADR 0096](doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md), section 12.)* A bare
`RuntimeError` is the fourth road: a relative worker url with no `base`, and a predicate or adapter supplied that the
document names nowhere. **They are not exported from the package ROOT**, so the enumeration below —
which walks the root's own exports — does not see them, and `BootstrapError` has never been there
either.

**And more that throw, because you called them.** Some are the same classes the next paragraph calls
reported, which is why the rule is about the stack:

| | |
|---|---|
| `driver.start()` a **second time** | throws `MultipleRuns` — a driver serves one run and its id was fixed at construction (`ID-R3`) |
| `driver.resolve()` with a `result` that is not structured-cloneable | throws the platform's own `DataCloneError`, **not** `UncloneableResult`, and the run is not stopped |
| `driver.start()` with a payload that is not structured-cloneable | throws the platform's own `DataCloneError` with the driver UNSTARTED — a run whose entry payload cannot be copied into its checkpoint header cannot be checkpointed, so it is refused before it exists (`RN-R15`, [ADR 0064](doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)). **New in W88, and BREAKING**: such a payload used to start a run on an inline pool |
| `driver.checkpoint()` before `start()` | throws `NotStarted` — there is no run, and no entry payload to put in a header (`RN-R14`) |
| `driver.resume(checkpoint)` or `runtime.resume(flow, checkpoint)` with an entry payload that is not structured-cloneable | throws the platform's `DataCloneError` before anything is replayed — the driver unstarted, and on a runtime no run id spent (`RN-R15`) |
| `driver.checkpoint()` on a driver whose resume was refused | throws `NotStarted` — a refused resume leaves the driver SPENT and deaf to its scheduler, with no run to checkpoint (`RN-R23`) — **except** a resume refused `stopped` because its replay regenerated a stop in the lost tail: that driver keeps the STOPPED run, and its checkpoint is one a store may take. *(This row said `NotStarted` without the exception until W90 read it against `RN-R23`.)* |
| `driver.resume(checkpoint)` or `runtime.resume(flow, checkpoint)` on a checkpoint it will not resume | throws `ResumeRefused`, whose `reason` is `format`, `run`, `flow`, `stopped`, `cancelled` or `diverged` and whose `index` names the position for the last three — nothing is handed to a scheduler ([ADR 0065](doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md)). `resume()` on a driver that already started or resumed throws `MultipleRuns` (`ID-R3`). **On a runtime, a refusal DURING the replay spends the run id there** — a driver was built for it, so that runtime answers the id with `RunIdInUse` from then on (ADR 0091 keeps the id after it releases the driver); one refused by its header spends nothing ([Q371](doc/questions/q371.md), section 18) |

`MultipleRuns` is thrown by a second `start()`: a driver's sequence and join state carry no run id,
so a second run would silently merge into the first. **One driver, one run** — and the run id is a
constructor option, so there is no second id to pass.

**A second driver on the same scheduler is the supported answer**, which is what `MultipleRuns`'
message tells you to build — **under one condition.** Give each driver a **different** run id: two
sharing one id mint the same task ids, so `dispatched.has()` is true in both, neither can see the
collision, and one settlement dispatches the successor twice. Nothing enforces this and nothing can:
a driver is handed two scheduler methods and neither asks who else is subscribed.

**The scheduler may carry work this library did not mint** — a nightly cleanup, another library, a
worker's own `context.spawnTask()` children. A task id that does not parse was minted by no driver,
so it is **not** any run's: the driver reports it through `onUnmintedTask` and drops it, and no run
stops (`ID-R5`). *This used to be the second condition, and it stopped **every** driver on the
scheduler; ADR 0027 is where it changed.*

```ts check
import { Driver, type UnmintedTask } from 'fyflow-orchestration';

declare const opts: ConstructorParameters<typeof Driver>[1];
const watched = {
  ...opts,
  // Optional: without it the run still routes correctly, because a settlement that
  // parses as nothing was never yours. Register it if you do not control everything
  // on the scheduler — it is the only thing that would tell you the ids stopped
  // being the ones you dispatched.
  onUnmintedTask: (t: UnmintedTask) =>
    console.warn(`run ${t.runId}: ${t.event} for ${String(t.taskId)} — ${t.reason}`),
};
void watched;
```

**Do not let this callback throw.** It runs inside the driver's scheduler listener, so a throw from it
is caught at that boundary and **stops your run** — under your own error class, for a task that was
never yours, which is the exact damage the rule exists to remove. Log and return.
**A settlement reaches only the driver that dispatched that task id.** One
for another run is ignored, and one carrying **this** driver's run id for a task it never
dispatched stops the run with `UndispatchedTask` (`ID-R4`). The second half is a refusal rather than
a filter for `ID-R1`'s reason — within one run the driver mints every id it dispatches, so a
settlement it did not mint means its bookkeeping is wrong.

**Reported, not thrown**, when there is nobody on the stack: `DuplicateTaskId`, `UncloneableResult`,
`NoMatchingEdge` and `UndispatchedTask` raised *inside a scheduler event listener*. Give the driver
`onRunFailure` or you will not hear about them — the run stops and folds to `stopped`, silently.

**`InvalidTaskId` is the ninth class and it is the one that does NOT stop a run.** It is thrown by
`buildTaskId` and `parseTaskId`, both exported, and it is how you check an id yourself — *did some
driver mint this?* is a `try`/`catch` around `parseTaskId`. Inside the driver's listener it is caught
rather than reported: the settlement goes to `onUnmintedTask` and the run carries on (`ID-R5`), so
**it never reaches `onRunFailure` and is never a `RunFailure.kind`.**

```ts run
import { InvalidTaskId, parseTaskId } from 'fyflow-orchestration';

let mine = false;
let foreignFailedAsInvalidTaskId = false;
try { parseTaskId('run-1:ingest:-:0'); mine = true; } catch { /* not ours */ }
try { parseTaskId('nightly-cleanup'); } catch (e) { foreignFailedAsInvalidTaskId = e instanceof InvalidTaskId; }
console.log(mine, foreignFailedAsInvalidTaskId);
if (!mine) throw new Error('a four-segment id in the charset must parse');
if (!foreignFailedAsInvalidTaskId) throw new Error('a foreign task id must fail, and as InvalidTaskId');
```

*Written without a rethrow on purpose.* The obvious form of this — a `mintedByADriver(id)` helper
whose `catch` rethrows anything that is not an `InvalidTaskId` — is the shape the driver itself uses,
and **W18 shipped it and then measured that its assertions could all be deleted with the gate
green**: `check-docs`' `X4a` asks whether a `run` snippet contains a `throw`, and the helper's own
rethrow answered yes on the assertions' behalf. The general weakness is
[Q104](doc/questions/q104.md); here the snippet simply does not give `X4a` a `throw` that is not
an assertion.

```ts check
import { Driver, type RunFailure } from 'fyflow-orchestration';

declare const opts: ConstructorParameters<typeof Driver>[1];
const withReporting = {
  ...opts,
  onRunFailure: (f: RunFailure) => console.error(`run ${f.runId} stopped: ${f.kind} — ${f.message}`),
};
void withReporting;
```

`f.kind` is the **class name**, so these are the strings you switch on. Imported here rather than
quoted in prose, so renaming one in `src/` fails this gate instead of silently falsifying the
paragraphs above.

**Two of the classes belong to `map`, and they fail for different people.**

`UnresolvedBranchPath` is `ID-R6` — `branchPathOf` was asked for the path of a node inside a **`map`**
region without the item index that region's branch is indexed by, and refused rather than guessing,
because guessing mints one task id for every dispatch and the run then dies at `ID-R1` naming a
duplicate. **A `Driver` supplies that index and never sees this**; it is what a caller composing
`branchPathOf` or `branchIndexOf` themselves gets, and it names the map rather than the symptom.

`UnresolvedMapArity` is **W33's, and it is a data error rather than a definition error** — which is
why it is not an `InvalidDefinition`. A `map` node's `over` is a key NAME (`FD-V25` checks the
charset and can check nothing else, because no validator can see a value that does not exist yet),
and at run time the value it names must be an **array**. An absent key, an object, a number, a `null`
payload or a string payload each stop the run with this class naming the node and the key. **The
definition is valid and the previous node did not produce what the flow says it does**, which is a
different person's bug — a flow author reading `InvalidDefinition` would go and read their flow,
where there is nothing to find. **An empty array is not this**: zero items is a lawful arity.

`UnresolvedReference` is **W41's**, and it is [ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
`FD-R3`. **A node OR AN EDGE** declared a `needs` naming another node — the edge site is
[ADR 0041](doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)'s
and means **a predicate can now stop a run**, with the message saying `edge needs[…]` so you are sent
to the edge — and **no output of that node is on this
node's branch path** — a decision routed around it, or it settled `user_action` and nobody has
resolved it. `FD-V27` has already checked at instantiation that the declaring node is *reachable
from* the named one, which is everything the graph can say; whether it actually ran is a fact about
this run. **It is a different class from `UnresolvedMapArity` deliberately**: that one says *the
previous node did not return an array*, which is a **worker's** bug, and this says *the node you
named did not run on your path*, which is the **flow's** shape.

`BoundaryRefused` is **W73's, and it is the one class here that STOPS NOTHING** — [P19](doc/plans/p19-what-a-schema-buys-an-author.md) decision 5's `FD-R4`. The two values no static check can reach are held to the workers' declared
schemas ONCE each: the run's payload at `start()`, against the `inputSchema` of every task it reaches with no
worker in between (the entry, or every branch task of an entry fan-out, or a map's branch once per item),
and a person's `done` resolution at `resolve()`, against the parked node's worker `outputSchema`. Refused, it is
**thrown at you as a REJECTED COMMAND**: nothing appended, nothing reported, the run unaffected — at `start`
the driver is still UNSTARTED and a corrected payload starts it, at `resolve` the task is still suspended and
a corrected value (the worker's declared example is one) resolves it. It carries `boundary`, `nodeId`,
`taskId` and the schema's `findings`, and its message names the worker and every finding, so you read
the VALUE and not the flow. A worker declaring no schema on that side is unchecked; `validateBoundaries: false`
on `DriverOptions` or `RuntimeOptions` turns both off. **`FD-R4` is never per settlement**: it holds the run's PAYLOAD once and a person's RESOLUTION
once, as rejected commands. What a WORKER returns is checked at authoring time by
`npm run check:workers` and by the wiring check (section 13) — **and, since
[ADR 0060](doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md), by the
RUN as well if you ask it to**: `OR-R13`, section 16, opt-in and a READING rather than a refusal.
*(This read *"not by the run"*, which W80 falsified and which stood four sections above the section
that teaches the opposite — W82's conformity reader, finding 2.)*

*(This paragraph read *"`UnresolvedBranchPath` is the tenth class, and it belongs to a feature nothing
dispatches yet … no `Driver` opens one"* until W33, which is the item that made it run.
[Q157](doc/questions/q157.md) is the gap behind both edits: no
[P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) item owns this file, and W35 is the natural
owner of describing the feature rather than merely not lying about it.)*

**And the list is checked against the PACKAGE, not against itself** — [Q101](doc/questions/q101.md).
Until W18 this snippet imported eight classes, mapped them to `.name`, and compared the result to a
literal it also contained. That is a closed list agreeing with a copy of itself: it was executed by
`npm run gate`, it **omitted `InvalidTaskId`** — exported from the package root the whole time — and
it passed. *Rot is what the gate prevents; a list that never looks outside itself is a third thing the
gate cannot see.* The second half below is what makes adding a refusal class in `src/` and not
mentioning it here a **failure** rather than an omission nobody can observe:

```ts run
import * as lib from 'fyflow-orchestration';
import {
  BoundaryRefused,
  ConfigRefused, DerivationRefused, DuplicateTaskId, GateTypeRefused, GroupConfigRefused, GroupTypeMissing, InvalidDefinition,
  InvalidRunId, InvalidTaskId, MissingJoinPolicy, MultipleRuns, NameCollision, NameMissing, NoMatchingEdge, NotStarted,
  PoolTypeMissing, RegistryError, ResumeRefused, SchemaRefused, TypeDefaultRefused, UncloneableResult, UndeclaredKey,
  UndeclaredRoute, UndispatchedTask, UnresolvedBranchPath, UnresolvedMapArity, UnresolvedReference, WorkerMissing,
} from 'fyflow-orchestration';

const documented = [
  DuplicateTaskId, UncloneableResult, NoMatchingEdge, UndispatchedTask,  // reported inside a listener
  MultipleRuns, InvalidRunId, InvalidDefinition, MissingJoinPolicy,      // thrown at you
  NotStarted,                                // thrown at you from checkpoint() before start() — there is no run yet (RN-R14)
  ResumeRefused,                             // thrown at you from resume() — a checkpoint it will not resume, `reason` says why (RN-R23)
  RegistryError, WorkerMissing, PoolTypeMissing, ConfigRefused, TypeDefaultRefused, GroupTypeMissing,   // thrown at you — a REGISTRY defect,
  GroupConfigRefused, NameCollision, SchemaRefused, UndeclaredKey, NameMissing, DerivationRefused,       // the base class and its twelve (section 13)
  GateTypeRefused,                           // a registered GATE type that is not a GateType — checkRegistry (v0.23)
  UnresolvedMapArity, UnresolvedReference,   // reported in a listener; reported AND thrown from start()/resolve()
  UndeclaredRoute,                           // the same two roads — a GATE's type returned a route it does not declare (FD-R5, W93)
  BoundaryRefused,                           // thrown at you from start()/resolve() with the run UNTOUCHED — a rejected command (FD-R4)
  InvalidTaskId, UnresolvedBranchPath,                                   // neither — see above
].map((c) => c.name);

// Every Error subclass the package root exports, discovered rather than restated.
const exported = Object.entries(lib)
  .filter(([, v]) => typeof v === 'function' && Error.isPrototypeOf(v as object))
  .map(([name]) => name);

const missing = exported.filter((n) => !documented.includes(n));
const stale = documented.filter((n) => !exported.includes(n));
console.log(documented.length, exported.length);
if (missing.length) throw new Error(`section 9 does not mention: ${missing.join(' ')}`);
if (stale.length) throw new Error(`section 9 names classes the package no longer exports: ${stale.join(' ')}`);
```

After a refusal the run is **stopped**: nothing routes for it again, and its state folds to
`stopped` whatever its nodes say.

---

## 10. Common mistakes

- **Expecting a failure to route by default.** It does not. Add `on: ['failed']`, or accept that the
  path ends — section 6.
- **Using `optional: false` to mean "important".** It means *"a human decides"*, and it produces a
  suspended run rather than a failed one.
- **Passing `arrivalCount`.** It hangs on an ordinary `optional` failure. Section 5.
- **Waiting on `scheduler.completed`.** It fires **every time the scheduler drains**, which with a
  flow is between every step. It is not "the run finished". `await done` — the second half of what
  `runtime.start` returns (section 8).
- **Expecting `await done` to reject when a run goes wrong.** It resolves, always: `failed`, `stuck`
  and `stopped` are outcomes you read off the state, and `stoppedBy` names a refusal. A `.catch` on
  `done` is a `.catch` that never fires.
- **Waiting on `done` for a run with a person in it.** `awaiting_action` is not terminal, so `done`
  is still pending — by design. Poll the fold for the park, resolve the task, then await; section 7
  is that snippet, and `Promise.race([done, timeout])` is the deadline nothing ships for you.
- **Reading run state mid-turn.** Section 8.
- **Retaining a scheduler event's `detail`.** It is the live task object and it mutates — including
  its `timestamp`, so a retained detail reports the *most recent* event's time. `{...e.detail}` is
  **not** compliance: it still aliases `result` and `error`. The driver copies at the listener
  boundary, so the four values that carry the run — records from `snapshot()`, inputs from
  `foldInputs()` and `onFoldInput`, and events from `onRegionEvent` — are **frozen copies**, safe to
  hold. *Until [W76](doc/work-items/w76-what-start-accepts.md) the fourth of those was reachable
  only by building a `Driver` by hand, so this bullet named four values and the snippet below could
  assert three; `createRuntime` forwards `onRegionEvent` now, and all four are on one road.*
  **The other accessors return copies that are not frozen** (`dispatchedIds()`,
  `regionsForPolicies()`, `effectiveOutcomeOf()`, `terminalStateOf()`): writing to one changes
  nothing in the driver, but it is not a document to edit and hand back.
- **Returning a CLASS INSTANCE from a worker.** It does not throw and it does not arrive intact.
  `structuredClone` copies the fields and drops the prototype, so the next node receives a plain
  object: `instanceof` is false, the methods are gone, and **nothing is reported** — `OR-R11` in
  `spec/outcome-record.md` section 4. **Return data, read data.** The loud half is a result that
  cannot be cloned at all (a function, a `Promise`, a `WeakMap`), which on an **inline** pool stops
  the run with `UncloneableResult`, and on a **thread** pool is refused first by the scheduler's
  own clone, so the value never reaches the driver, `UncloneableResult` never fires and
  `onRunFailure` is not called — the task ends as any failure does: a non-optional task out of
  retries ends `user_action` and parks the run `awaiting_action`, and an `optional` one ends
  `failed` and routes as a failure (`OR-R6`; the node type's `inline` decides which pool); the class
  instance is the quiet half, and it is the one people hit.
- **Assuming `joinStatusOf().describe` is yours.** It is whatever **your** policy's `describe()`
  returned. The two shipped policies return a fresh object; a policy that returns its own state hands
  you that state, and writing to it changes what the join decides. Return a copy from `describe()`
  — [Q82](doc/questions/q82.md).

The first half of that is executed rather than asserted:

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type FoldInput, type RegistryDocument } from 'fyflow-orchestration';

const registry: RegistryDocument = {
  workers: { scorer: { url: '../../examples/getting-started/scorer.ts' } },
  nodeTypes: { Scorer: { worker: 'scorer', inline: true } },
};
const flow: FlowDefinition = {
  flowId: 'frozen', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'Scorer', settings: { score: 0.1 }, edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
    { id: 'b', kind: 'task', type: 'Scorer', settings: { score: 0.2 }, edges: [{ to: 'j' }] },
    { id: 'c', kind: 'task', type: 'Scorer', settings: { score: 0.3 }, edges: [{ to: 'j' }] },
    { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'e' }] },
    { id: 'e', kind: 'end', outcome: 'completed' },
  ],
};

const runtime = createRuntime(registry, {}, { base: import.meta.url });
const inputs: FoldInput[] = [];
const frozen: Record<string, boolean> = {};
// **The handles this road HAS, named rather than counted** — a count is not a membership, and
// re-sourcing one of these onto another left a count of three unmoved (W71's adequacy reader).
const HANDLES = ['onFoldInput', 'onRegionEvent', 'snapshot', 'foldInputs'];

// **`onRegionEvent` is FORWARDED, so this road can watch a fan-out open and close** — W76. It was
// not, until W76: `StartOptions` is a `Pick` of the driver's options, and of the driver's twenty
// (eighteen when W76 wrote this; `onNonconformingResult` is ADR 0060's, W80's; `gateTypes` ADR 0067's, W93's)
// this was the one no `createRuntime` consumer could reach at all, which is
// [Q297](doc/questions/q297.md). **The previous version of this snippet asserted the opposite and
// passed a CAST**, because that was the only way to try; there is no cast now, and the two counts
// below are what changed. *The reason it went unnoticed for so long is that the snippet which
// asserted it built its own `Driver`, and a reference that constructs its own driver can
// demonstrate options its readers have no way to pass.*
//
// **What a consumer gets is the driver's own event, already frozen** (`OR-R7`,
// [Q73](doc/questions/q73.md)) — nothing is copied or re-frozen at the runtime seam, which is why
// the freeze is asserted here on the road a consumer actually uses rather than inferred from the
// driver's own test.
let regionEvents = 0;
const regionKinds: string[] = [];
const { driver, done } = runtime.start(flow, {}, {
  onFoldInput: (i: FoldInput) => { frozen.onFoldInput = Object.isFrozen(i); inputs.push(i); },
  onRegionEvent: (e) => {
    regionEvents += 1;
    regionKinds.push(e.type);
    frozen.onRegionEvent = (frozen.onRegionEvent ?? true) && Object.isFrozen(e);
  },
});

// **The end, and its deadline, in two lines** — `await done` is the wait (ADR 0058) and
// `Promise.race` is the deadline (rule 8). `onFoldInput` above is still here because THIS snippet
// is about what the four handles hand out, and one of the four IS that callback.
let timer: ReturnType<typeof setTimeout> | undefined;
const tooLong = new Promise<never>((_, reject) => {
  timer = setTimeout(() => reject(new Error('the run never reached a terminal state')), 10_000);
});
await Promise.race([done, tooLong]);
clearTimeout(timer);
await runtime.shutdown();

// The two PULL handles, read after the run — and each must have handed back something, because
// `Object.isFrozen([])` is true for free and an empty answer would pass while asserting nothing.
const snapshot = driver.snapshot();
const foldInputs = driver.foldInputs();
if (snapshot.length === 0 || foldInputs.length === 0) throw new Error('a pull handle returned nothing, so freezing it says nothing');
frozen.snapshot = Object.isFrozen(snapshot) && snapshot.every(Object.isFrozen);
frozen.foldInputs = Object.isFrozen(foldInputs) && foldInputs.every(Object.isFrozen);

console.log(frozen, regionEvents, [...new Set(regionKinds)].sort());
// all four handles true, then 4, then [ 'branch.arrived', 'branch.opened' ]

// **Where each claim below is observed a SECOND time**, because every guard in an executed snippet
// is bound by its own PRESENCE and by nothing else ([Q310](doc/questions/q310.md)) — W76's adequacy
// reader made all six guards and all four `isFrozen` readings vacuous at once with `check:docs` at
// exit 0. The four freeze claims are re-asserted per element in `test/driver/outbound.test.ts` and
// `test/driver/fold-inputs.test.ts`; the region-event count, kinds and freeze ACROSS THE RUNTIME
// SEAM — which is the part those files cannot see, because they build a `Driver` by hand — are in
// `test/scheduler/runtime.test.ts`, where the forwarded stream is held equal to the driver's own
// region stream element for element. *Nothing here is the only observer of anything.*
for (const [name, isFrozen] of Object.entries(frozen)) {
  if (!isFrozen) throw new Error(`${name} handed out something you can write to`);
}
// **The guard that fires if the answer changes BACK, and it is FIRST on purpose.** Q297 was a
// member of `StartOptions` going missing, which nothing noticed for two plans; this is what would
// notice now, from a consumer's side of the seam rather than from the type. *It sat BELOW the
// membership check in the first version and was unreachable: `frozen.onRegionEvent` is written in
// the same callback as `regionEvents`, so a regression removes the key too and the membership
// throws first — a regression caught, by a message about `HANDLES` that says nothing about Q297.
// W76's conformity reader; the tree's own "right verdict by the wrong route".*
if (regionEvents === 0) {
  throw new Error('onRegionEvent fired 0 times: the runtime has stopped forwarding it, and a consumer on this road cannot watch a fan-out again — Q297 has regressed');
}
if (Object.keys(frozen).sort().join() !== HANDLES.slice().sort().join()) {
  throw new Error(`expected exactly ${HANDLES.join()}, saw ${Object.keys(frozen).sort().join()}`);
}
// The KINDS are the membership and the count stands beside them: a two-branch fan-out opens twice
// and arrives twice, and a snippet asserting only `> 0` would pass on one branch of one kind.
if ([...new Set(regionKinds)].sort().join() !== 'branch.arrived,branch.opened') {
  throw new Error(`expected a fan-out's opens and arrivals, saw ${[...new Set(regionKinds)].sort().join() || '(nothing)'}`);
}
if (regionEvents !== 4) throw new Error(`expected 4 region events on a two-branch fan-out — two opened, two arrived — and saw ${regionEvents}`);
```
- **Subscribing to the scheduler yourself and counting `task.failed`.** A `user_action` task fires
  it *and* `task.user_action`. Key on the terminal state — section 7.
- **Sharing one `Driver` between runs.** `start()` is called at most once and a second throws
  `MultipleRuns` — section 9. *Sharing one **scheduler** between `Driver`s is fine*, and used to be
  the other half of this bullet: a settlement now reaches only the driver that dispatched it.

---

**`OR-R11`, executed rather than asserted** — a worker returns a class with a method, and what
the driver logs is a plain object with the field and no method:

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';

// `classy` returns `new Score(0.9)` — a class with a method, and it CHECKS that it does before
// handing it over, so the thing being lost below is known to have existed. `inspect` is the NEXT
// NODE, and reports what arrived. `uncloneable` returns a function, which is the loud half.
const registry: RegistryDocument = {
  workers: {
    classy: { url: '../../examples/getting-started/classy.ts' },
    inspect: { url: '../../examples/getting-started/inspect.ts' },
    uncloneable: { url: '../../examples/getting-started/uncloneable.ts' },
  },
  nodeTypes: {
    Classy: { worker: 'classy', inline: true },
    Inspect: { worker: 'inspect', inline: true },
    Uncloneable: { worker: 'uncloneable', inline: true },
  },
};
const lossy: FlowDefinition = {
  flowId: 'or-r11', version: 1, entry: 'a',
  nodes: [
    { id: 'a',    kind: 'task', type: 'Classy',  settings: { value: 0.9 }, edges: [{ to: 'next' }] },
    { id: 'next', kind: 'task', type: 'Inspect', settings: {},            edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const loud: FlowDefinition = {
  flowId: 'uncloneable', version: 1, entry: 'a',
  nodes: [
    { id: 'a',    kind: 'task', type: 'Uncloneable', settings: {}, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

const runtime = createRuntime(registry, {}, { base: import.meta.url });
const failures: string[] = [];
// `onRunFailure` is what the LOUD half below is read from; `done` is the end. They are two
// different facts about the same run, which is why both are here.
const run = (flow: FlowDefinition) =>
  runtime.start(flow, {}, { onRunFailure: (f) => { failures.push(f.kind); } }).done;

// **THE QUIET HALF.** The fields cross; the behaviour does not; nothing is reported.
const quiet = await run(lossy);
const arrived = Object.values(quiet.nodes).find((n) => n.nodeId === 'next')?.result as
  { sawMethod?: string; prototypeIs?: string; keys?: string[] };
console.log(arrived.sawMethod, arrived.prototypeIs, JSON.stringify(arrived.keys));
// 'undefined' 'Object.prototype' ["value"]
if (arrived.keys?.join() !== 'value') throw new Error(`the next node received ${JSON.stringify(arrived.keys)}`);
if (arrived.sawMethod !== 'undefined') throw new Error('the BEHAVIOUR reached the next node, which OR-R11 says it cannot');
if (arrived.prototypeIs !== 'Object.prototype') throw new Error('the PROTOTYPE survived the boundary');
if (quiet.outcome !== 'completed') throw new Error(`the lossy run ${quiet.outcome}`);
if (failures.length !== 0) throw new Error(`the quiet half reported ${failures.join()} — OR-R11 is silent by design`);

// **THE LOUD HALF, and it is what makes the line above mean anything.** A result that cannot be
// cloned at ALL stops the run and IS reported — so `failures` has a case that fills it, and
// `failures.length === 0` above is a measurement rather than a sentence about an empty array.
//
// **And `done` RESOLVES here rather than rejecting** (ADR 0058 rules 3 and 4): a refusal is a
// terminal OUTCOME, not an error, so there is no `.catch` — the run arrives as `stopped` with
// `stoppedBy` naming the refusal. One settlement rule for every way a run can end.
const stoppedRun = await run(loud);
await runtime.shutdown();
console.log(failures.join(), stoppedRun.outcome, stoppedRun.stoppedBy?.split(':')[0]);
// 'UncloneableResult' 'stopped' 'UncloneableResult'
if (failures.join() !== 'UncloneableResult') throw new Error(`the loud half reported ${failures.join() || 'nothing'}`);
if (stoppedRun.outcome !== 'stopped') throw new Error(`a refused run resolved \`done\` with ${stoppedRun.outcome}, not stopped`);
if (!stoppedRun.stoppedBy?.startsWith('UncloneableResult')) throw new Error(`stoppedBy: ${stoppedRun.stoppedBy}`);
```

## 11. What does NOT exist — do not write code using it

| not available | instead |
|---|---|
| flow-level **retry** — re-dispatching a NODE under a new attempt, possibly routing elsewhere | **task-level retry IS built** since [W58](doc/work-items/w58-what-a-node-says-about-its-own-task.md): declare `retryPolicy` on the node (section 3) and the scheduler retries inside the same task id, reported on the record's `attempts`. Re-dispatching the node is [Q16](doc/questions/q16.md)'s other half and the task id's fourth segment, and nothing mints one |
| **`runtime.register()`** — adding node types, pools, groups or languages to a RUNNING runtime | **declined** — [P37](doc/plans/p37-a-runtime-is-its-registry.md) decision 1, [ADR 0096](doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md): `fyflow-scheduler` cannot add a pool after construction. A changed registry is a NEW runtime; a run on the old one finishes there or moves by stop-and-resume ([P34](doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)). **A FLOW is not a registry entry**: `runtime.check(flow)`, then `runtime.start(flow, …)`, takes any flow the registry can run, at any time (section 12) |
| **cancelling a RUN** — and stopping one, and pausing one | nothing yet: [P34](doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s. **A cancelled TASK is heard since W158**: `scheduler.cancel(id)` on any task of a run ends that run `cancelled` (section 6), so cancelling a run today is cancelling its tasks by id — and `done` settles on the first, before the others have stopped |
| ~~**durability**~~ — resuming a run after a restart | **BUILT** since [W89](doc/work-items/w89-what-resuming-is.md): append the events, resume from them — section 18. A cancelled or stopped run is refused |
| **nested fan-out** — a branch that fans out again | **built, and the join over it is settled.** `FD-V15` is retired; a task inside a nested region is dispatched at its whole dotted `branchPath` (`r1:scoreC:1.0:0`); and every policy in section 5 is **transitive** — each region answers exactly as it would if it were not nested ([ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)). One thing to know: if an inner join is reported through `onUnsatisfiableJoin`, the outer branch containing it **ends** rather than waiting, so the outer join may still fire and its successor may run — and once that work settles the run folds to `stuck`, because a region that never fired is what `stuck` reads. **Fold too early and you will see `running`.** The four matrix rows and the join seam are tested at **depth 2**; the dead-join cascade is asserted at depth 3, and nothing else about depth 3 is a tested claim |
| ~~**map-style fan-out**~~ — **BUILT** since [W33](doc/work-items/w33-a-map-at-run-time-arity.md); see section 3 |
| a **join timeout** | nothing. A stuck join is detected by the `stuck` outcome, with no clock |
| **per-join policy choice** | one policy per driver |
| a **declared event family** for `fyflow-react-components` | `onRegionEvent`, `onFoldInput` and `joinStatusOf()` — see below |

**On that last row.** Flow structure is invisible to the *scheduler*, so a UI wired only to a
scheduler cannot show which node a run is at, which branch it took, or what a join is waiting on.
That is [Q21](doc/questions/q21.md), and it is about the scheduler's stream, not about this
library — **this library does expose all three.** `onFoldInput` is the push half of `foldInputs()`,
so you can fold incrementally and see a run finish without polling; `onRegionEvent` reports branches
opening, arriving, exiting, suspending and resuming; `joinStatusOf()` answers what a join is waiting
on. What is missing is an agreed envelope shape between the two repositories, not the data.

**Runtime compatibility, as this package intends it: Deno, Node, and the browser for the library but
not for a flow** — the browser rung is [Q52](doc/questions/q52.md), and a worker there must be a
bundled `.js` asset. **It is a jsr.io package SETTING, not a manifest field**: measured at W157, Deno's
`deno.json` schema has no `runtimeCompat` key, `deno publish --dry-run` accepts one and nothing reads
it, and JSR's API carries it per package. Every lane of the gate runs Node 24; **one L6 run on Node
26.11.1** — the version fyflow-app's host targets — exited 0 with every assertion passing at W157, and
is recorded rather than added to the gate.

---

## 12. Wiring it to a real scheduler

**The short way is a registry DOCUMENT and one call** — `createRuntime` in
`fyflow-orchestration/scheduler`, [W66](doc/work-items/w66-the-runtime-entry.md). It resolves every
name the document uses against the code you supply, refuses every defect at construction by a named
error, builds one pool per type instance and one object per group, holds a `FyflowScheduler` over
them, and hands you **`{ driver, done, header }` per run** — the driver already running, `done` a
promise that resolves with the run's terminal `RunState`, and `header` the run's checkpoint header
([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md);
section 8 is what it waits for). **What stays yours is exactly what is code**: predicates,
language adapters, custom group types and custom node-type classes, in one `code` argument.

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';

// The registry, as data. In your program this is a JSON file you import; here it is a literal so the
// snippet is self-contained. A worker url may be RELATIVE, and then `base` is what it resolves
// against — pass `import.meta.url`, because inside a bundle the library cannot guess it.
const registry: RegistryDocument = {
  workers: {
    ingest:  { url: '../../examples/workers/ingest.ts' },
    publish: { url: '../../examples/workers/publish.ts' },
  },
  groups: { gate: { type: 'ConcurrentLimitGroup', config: { limit: 1 } } },
  nodeTypes: {
    Ingest:  { worker: 'ingest',  inline: true },
    Publish: { worker: 'publish', inline: true, groups: ['gate'] },
  },
};

// The flow, as data. It names registry KEYS and nothing else — no file, no URL, no class.
const flow: FlowDefinition = {
  flowId: 'wired', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest',  kind: 'task', type: 'Ingest',  edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end',  outcome: 'completed' },
  ],
};

const runtime = createRuntime(registry, {}, { base: import.meta.url });

// A run is over when its OWN fold says so — never `scheduler.completed`, which fires every time the
// scheduler drains (section 8). `await done` IS that, in one line: the runtime keeps the fold and
// resolves with the terminal state (ADR 0058). This is the one snippet here that wants BOTH halves
// of what `start` returns, and the reason is the line under it.
const { driver, done } = runtime.start(flow, { confidence: 0.9 });
// **`driver.runId` is readable** (W66): the runtime minted this run's id, and every task id of the
// run begins with it. Pass your own as `start`'s `runId` when you need to choose it. It is readable
// the instant `start` returns and does not wait for `done`, which is what holding the PAIR buys
// over holding the promise alone.
if (!/^r\d+$/.test(driver.runId)) throw new Error(`expected a minted run id, got ${driver.runId}`);
const state = await done;
const pools = Object.keys(runtime.pools).sort();
await runtime.shutdown();

if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
// One pool per type instance, keyed by the name the document uses — that is what a node's `type` names
// — **and one more for every BUILT-IN node type**, which is `Transform` and nothing else today
// (section 13). The built-ins come LAST, so adding one never renumbers yours; a `WorkerManager` that
// never receives a task spawns no thread, measured at W109.
if (pools.join() !== 'Ingest,Publish,Transform') throw new Error(`pools: ${pools.join()}`);
// And the group the document declared was built and is the scheduler's, keyed as declared.
if (Object.keys(runtime.groups).join() !== 'gate') throw new Error(`groups: ${Object.keys(runtime.groups).join()}`);
```

**A custom group type is a FACTORY, and the runtime holds its output to what the scheduler CALLS.**
The document names a group by KEY with a `type`; the code supplies `{ configSchema?, create(config,
key) }` under that type name; the three built-ins are pre-registered in the same shape. What comes
back is checked for ADR 0055's six members and refused by name otherwise. Read the counts off the
object the runtime built — [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md):

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';
import type { ResourceGroup } from 'fyflow-scheduler';

// A CUSTOM GROUP is the scheduler's own `ResourceGroup`, and the runtime holds a factory's output to
// the six members the scheduler CALLS or a viewer READS — `canRun`, `onStart`, `onFinish`,
// `getMetrics`, `id`, `type` — refusing a missing one at construction, by name (ADR 0055: the
// interface marks two of those optional and the scheduler calls them unguarded, which is S10
// upstream). This one counts what it sees. The constructor is written long-hand on purpose: a
// parameter property is TypeScript Node 24 refuses to LOAD (RT-R9).
class CountingGroup extends EventTarget implements ResourceGroup {
  readonly type = 'Counting';
  readonly id: string;
  private readonly limit: number;
  private active = 0;
  started = 0;
  finished = 0;
  constructor(id: string, limit: number) { super(); this.id = id; this.limit = limit; }
  canRun(): boolean { return this.active < this.limit; }
  onStart(): void { this.active += 1; this.started += 1; }
  onFinish(): void { this.active -= 1; this.finished += 1; }
  getMetrics(): { limit: number; running: number; available: number; utilization: number } {
    return { limit: this.limit, running: this.active, available: this.limit - this.active, utilization: this.active / this.limit };
  }
}

// THE REGISTRY declares the group by KEY, with its TYPE by name and its config; the CODE supplies the
// factory for that type name — `{ configSchema?, create(config, key) }`. The three built-ins,
// `ConcurrentLimitGroup`, `RateLimitGroup` and `KeyedRateLimitGroup`, are pre-registered in the same
// shape, so `"type": "ConcurrentLimitGroup"` needs no code at all. A node type names the groups its
// pool's tasks acquire.
const registry: RegistryDocument = {
  workers: { greeter: { url: '../../examples/getting-started/worker.ts' } },
  groups: { budget: { type: 'Counting', config: { limit: 1 } } },
  nodeTypes: { Metered: { worker: 'greeter', inline: true, groups: ['budget'] } },
};
const flow: FlowDefinition = {
  flowId: 'metered', version: 1, entry: 'greet',
  nodes: [
    { id: 'greet', kind: 'task', type: 'Metered', settings: { say: 'world' }, edges: [{ to: 'shout' }] },
    { id: 'shout', kind: 'task', type: 'Metered', settings: { say: '!' },     edges: [{ to: 'done' }] },
    { id: 'done',  kind: 'end',  outcome: 'completed' },
  ],
};
const runtime = createRuntime(registry, {
  groupTypes: {
    Counting: {
      configSchema: { type: 'object', required: ['limit'], properties: { limit: { type: 'integer', minimum: 1 } } },
      create: (config, key) => new CountingGroup(key, (config as { limit: number }).limit),
    },
  },
}, { base: import.meta.url });

const state = await runtime.start(flow, { text: 'hello' }).done;
await runtime.shutdown();

// The group the runtime built is the scheduler's, keyed as the document declared it — and it was
// acquired and released once per ADMISSION of a task of the type that names it. Twice here, because
// these two tasks are admitted once each; a retry, or a threaded pool that finds no free worker,
// re-admits, so a budget is spent per admission and NOT per task (section 13).
const budget = runtime.groups['budget'] as CountingGroup;
// THREE observers, because `runtime.groups['budget']` is the KEY the document filed it under and
// says nothing about the object: the counters the group kept, the metrics IT reports — `running`
// back at zero is `onFinish` having run, which is the member ADR 0055 exists for — and its own
// `id` and `type`, which a factory ignoring the key it is handed would get wrong in silence.
const metrics = budget.getMetrics();
console.log(state.outcome, budget.started, budget.finished, metrics.running, budget.id);   // 'completed' 2 2 0 'budget'
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
if (budget.started !== 2 || budget.finished !== 2) throw new Error(`the group saw ${budget.started} starts and ${budget.finished} finishes`);
if (metrics.running !== 0 || metrics.available !== 1) throw new Error(`the group reports ${metrics.running} running, ${metrics.available} available`);
if (budget.id !== 'budget' || budget.type !== 'Counting') throw new Error(`the group calls itself ${budget.id} / ${budget.type}`);
```

**Every refusal is at construction and named.** A worker a type names and the document does not
declare, a pool whose type does not exist, a config that fails its schema, a schema keyword outside
the built-in subset, a name declared twice — each is a `RegistryError` subclass naming the entry
(section 9, section 13). Three more are the runtime's own: a **relative worker url with no `base`**,
a group type with no factory, and a group factory returning an object the scheduler cannot use —
`canRun`, `onStart`, `onFinish`, `getMetrics`, `id` and `type`, each refused by name. *(That list is
wider than the scheduler's own interface marks required, and deliberately: measured at 0.5.2, a group
with no `onStart` throws on its first task and one with no `onFinish` leaves every task naming it
running for ever, while one with no `getMetrics` runs fine —
[ADR 0055](doc/decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md).)*

**A runtime is its registry, and a flow needs nothing passed in advance** —
[ADR 0096](doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md). Node
types, pools, groups and languages are fixed at `createRuntime`, and **every typed pool carries every
language the registry document names** — the built-in `Transform` and every named instance included —
so a flow published after the runtime started runs on it, transforming on any type, with nothing extra.
**`runtime.check(flow)` returns every finding `start` would refuse that flow on** — an array of
`{ rule, at, detail }`, empty when there is none, and it never throws for a flow's defect — and
**`start` and `resume` refuse from that same call**, throwing `InvalidDefinition` with exactly those
rules before any run id is spent, so the two cannot disagree: *register* a flow by checking it, then
start it. `check` leaves out what depends on a RUN rather than the flow — a payload `FD-R4` refuses,
and a run id in use. **BREAKING in 0.8.0**: `createRuntime`'s and `bootstrap`'s `flows` option,
`LanguageNotBuilt` and `transformLanguagesByType` are gone. A caller passing `flows` in an object
LITERAL fails to compile; one passing an options object held in a variable still compiles, and `flows`
is then an unread key at run time — so delete it either way, and any warm-up flows written to feed it. **The cost** is a thread's, not a
bundle's: each worker of a typed pool loads every registered engine in its `setup()` — measured at
W162, about 22 ms and 6.4 MiB of heap per node thread for JSONata, and nothing measurable inline,
where registering the language already loaded it. A registry naming no language pays nothing. **A
changed registry is a NEW runtime** (`runtime.register` is declined, section 11): while two overlap,
their pools and resource groups are SEPARATE, so a rate limit may briefly be exceeded and a model a
worker loads in `setup()` is loaded twice.

**Thousands of runs at once: start them all on ONE runtime.** Every run `start` (or `resume`) opens
shares the runtime's pools and its one scheduler, and the runtime ROUTES each settlement to the driver
holding its run id — [ADR 0088](doc/decisions/0088-a-runtime-routes-each-settlement-to-the-driver-holding-its-run-id.md).
A driver is handed its own run's settlements and nothing of any other run's, so N concurrent runs cost
one delivery per settlement and the topology is **linear in N**; before it, every settlement reached
every driver and one runtime cost N² (`examples/retention.ts topology N` measures either topology, one runtime or
`own` per run, and ADR 0088 carries both figures). Two things are
not routed, and both are yours to size:

- **A `Driver` you build by hand** on `runtime.scheduler` or on your own `FyflowScheduler` (the long
  way, below) subscribes to the scheduler itself and hears every settlement on it, dropping the ones
  that are not its run's (`ID-R4`). That is correct, and N of them on one scheduler is N² deliveries.
  For a handful of runs it does not matter; for thousands, go through `start`.
- **A listener of your own** on `runtime.scheduler` — a dashboard, a logger — hears every event of
  every run. Key it on `detail.id` and do O(1) work per event, or N such listeners are N² again.

A task id that does not parse — work this library did not mint — still reaches EVERY live run's
driver, which each report it through `onUnmintedTask` (section 9): nobody owns it, so everybody says so.

**A runtime keeps a run until its `done` settles, and then only its run id** —
[ADR 0091](doc/decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md).
At that moment the runtime drops the run's driver from its routing, so one long-lived runtime's memory
is bounded by its LIVE runs plus one id string per run it ever opened. A run that is `running` or
parked `awaiting_action` is kept — `resolve()` works as before. **The runtime has no way to reach a
past run, so a postmortem is what YOU keep**: the `RunHandle` (`driver.foldInputs()`, `snapshot()`,
`checkpoint()`, the `RunState` `done` resolved with), or what your `onFoldInput` stored. Drop the
handle and the run is gone. After `done`, a released run is handed nothing — not its own run id, not
an unminted one — so a `stopped` run's tasks still in flight settle into no driver; listen on
`runtime.scheduler` yourself if you want their results. **The id stays in use**: `start` or `resume`
naming it on the same runtime throws `RunIdInUse`, because those late settlements carry it. And the
SCHEDULER keeps every completed task in `scheduler.tasks` unless `maxCompletedTasks` caps it (its own
`AGENTS.md`); `createRuntime` builds it uncapped, so pass `createScheduler` to cap it.

**The long way, and it is the same objects.** You can build the scheduler yourself and hand the
`Driver` the registry sets — which is what the runtime does, and what ladder L2-L5 here do with a
double. You supply the scheduler, and that is all you have to supply. Since
[ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
this library **depends on `fyflow-scheduler`** and says so where your installer reads it — a
`peerDependencies` entry, at the pin stated at the end of this section — and `createTask` is
**optional**: the driver's default is `(config) => new FyflowTask(config)`, the object a
`FyflowScheduler` consumes.

```ts run
import { Driver, fold, isTerminal, liveToken, type FlowDefinition, type FoldInput, type RunState } from 'fyflow-orchestration';
import { FyflowScheduler, FyflowTask, WorkerManager } from 'fyflow-scheduler';

// Your worker modules — here two this repository's own L6 rung runs, so this snippet is a real run
// on a real scheduler rather than a sketch. **One module per worker**: a module's default export is
// the class a `WorkerManager` instantiates, which is the scheduler's own contract.
const ingestUrl = new URL('../../examples/workers/ingest.ts', import.meta.url).href;
const publishUrl = new URL('../../examples/workers/publish.ts', import.meta.url).href;

const definition: FlowDefinition = {
  flowId: 'wired', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest',  kind: 'task', type: 'IngestWorker',  edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end',  outcome: 'completed' },
  ],
};

// The registry: one worker entry, and one node type per pool — the pools are built BY HAND here,
// keyed by the type's name, which is what `addTask` routes on. The bootstrap helper builds pools
// FROM entries like these (section 13) — envelope-fronted, the worker loaded by URL with its config
// under `config.config` — where these two load the worker directly with `{ role }`; the helper's
// call is the one a consumer copies, and this snippet keeps the raw scheduler in view.
const registry = {
  workers: { ingest: { url: ingestUrl }, publish: { url: publishUrl } },
  nodeTypes: { IngestWorker: { worker: 'ingest' }, PublishWorker: { worker: 'publish' } },
};
const scheduler = new FyflowScheduler({
  IngestWorker:  new WorkerManager(ingestUrl, { maxThreads: 1, inline: true }),
  PublishWorker: new WorkerManager(publishUrl, { maxThreads: 1, inline: true }),
});

// A run is over when its OWN fold says so — never `scheduler.completed`, which fires every
// time the scheduler drains (section 8). `onFoldInput` is the push half of `foldInputs()`, and
// the outcome is read on a `queueMicrotask`, AFTER the driver's turn: a prefix cut mid-turn is
// not a resting state, and section 8 says so.
const inputs: FoldInput[] = [];
const state = await new Promise<RunState>((resolve, reject) => {
  const driver = new Driver(definition, {
    runId: 'run-1',
    scheduler,                                    // the real class, as it is — no cast (Q71)
    predicates: new Map(),
    ...registry,                                  // the types the flow names, and their workers (section 13)
    groups: Object.keys(scheduler.groups),        // the resource groups a node may name (section 3)
    joinPolicy: liveToken,
    onFoldInput: (input) => {
      inputs.push(input);
      queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); });
    },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
  driver.start({ confidence: 0.9 });
});
const tasks = [...scheduler.tasks.values()];   // read BEFORE shutdown, which clears the map
await scheduler.shutdown();

if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
// `nodes` is keyed by TASK id (`run-1:publish:-:0`), so look the node up by its id.
const publish = Object.values(state.nodes).find((n) => n.nodeId === 'publish');
if (publish?.state !== 'done') throw new Error(`publish never settled: ${publish?.state}`);
// And the tasks the scheduler ran were the class's own — the driver built them, you did not.
// The scheduler would have run a plain object too (it duck-types its task, with `attempts` left
// undefined), which is why this is asserted rather than assumed.
if (tasks.length !== 2 || !tasks.every((t) => t instanceof FyflowTask)) throw new Error('the default createTask did not build FyflowTasks');
```

`nodeTypes` and `workers` are the sets the validator checks a definition against, and **a type's
pool is keyed by the type's name** — so the object you hand the driver is the object you build the
pools from, as above, rather than a second list; every task the driver dispatches carries the
envelope `{ settings, input }` (section 13), which is what this repository's worker reads `input`
from. Pass `createTask` only to run against a
double — ladder L2-L5 here hand the driver `(c) => c` and read the plain object back — or to build
something other than a plain `FyflowTask`.

**The `scheduler` option takes a `FyflowScheduler` as it is.** Until W57 it did not, under the one
configuration most consumers have: `FyflowScheduler extends EventTarget`, so with the DOM lib in
scope — TypeScript's default when `lib` is unset — its `addEventListener` was not assignable to
`SchedulerLike`'s, and this section told you to write `scheduler as unknown as SchedulerLike`. That
was [Q71](doc/questions/q71.md), a defect in our type and not in yours, and it is closed:
`SchedulerLike`'s listener parameter is `object`, which is what makes the real class satisfy it,
and every snippet in this document is typechecked under the DOM lib by `npm run check:docs`.

**A worker file can be TypeScript.** Node 24 runs it by stripping types, and Deno natively, so **one
`.ts` worker serves Node and Deno**. *(The scheduler's own reference **used to say** a Node worker
must be JavaScript, which was stale at Node 24 — [S9](doc/scheduler-upstream.md), raised 2026-09-07
and **fixed in 0.5.2**. Its §3 now version-qualifies: a `.ts` worker works on **Node >= 22.18**, and
below that it does not, so the old advice is right for that range and wrong for ours. This paragraph
called the reference stale for nine days and then for one more, in the document above the sentence
`D7` was built around.)* **Not the browser**: nothing there executes TypeScript, so
a browser build needs the worker emitted as a bundled `.js` asset. `RT-R10` — ladder L6 runs in Node
and Deno and not in the browser, and the browser rung is [Q52](doc/questions/q52.md).

**Pin the scheduler at exactly the version this package's `peerDependencies` names** — read it in
this package's `package.json`, or run `npm ls fyflow-scheduler` once it is installed. *(Until W157 this sentence carried the
number, and so did four other documents; each bump was five edits that agreed only by care. The
number now lives in the manifests and the lock files, and `npm run check:scheduler`'s `D7` refuses it
anywhere else.)* This library's listener boundary is written against **0.3.0 semantics**:
`task.progress`'s detail changed shape at 0.3.0 (the id is `id`, not `taskId`), the second
`task.user_action` dispatch site arrived there, and `task.timestamp` did not exist before it.
**`core/FyflowScheduler.ts` was byte-identical between 0.3.0, 0.5.1 and 0.5.2**; it is not at the
current pin, and W157 re-read what this library rests on there rather than inferring it: the
`user_action` pair is unchanged on both of its paths, and `task.progress` is built from the same
fields. What 0.5.1 added is a `worker.setup.*` / `worker.teardown.*` event family this library
subscribes to not at all. **The current pin adds a sixth task state, `cancelled`, reached only through
`scheduler.cancel(id)`**, and a run hears it: a cancelled task ends its run `cancelled` and settles
its `done` (section 6, [P33](doc/plans/p33-what-a-run-does-when-a-task-ends-cancelled.md)) — on real
workers in ladder L6, a task cancelled while running and while queued. Install the
scheduler from a registry — npm and JSR both carry it — and **never from a working tree**, which is
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
superseding [ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 3 and 5. **The manifests say the same thing**, since
[ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md):
`package.json` names it in `peerDependencies` at exactly that version and `deno.json` maps it to
`jsr:@fyflow/scheduler` at exactly that version, and `npm run check:scheduler`'s `D8` holds both to
the pin. *(This read **"pin at 0.3.0 … npm and JSR both stop at 0.2.1, so 0.3.0 is reached from
a working tree"** — a live instruction to a consumer, wrong in the version AND in the mechanism, the
second having been superseded on 2026-08-31. W36's conformity reader.)*

The worked flows on a real scheduler are in [`examples/`](examples/README.md), which counts them —
including a routed-away branch, a lost branch, a human resolving a suspension, a refusal that stops
a run, and a join's successor reducing the region's record through a declared transform. *(This
sentence read **"Thirteen worked flows"** from the day it was written until W63, over a directory
that had held twenty-two for two plans — a count in prose that no check reads, so it carries none
now.)*

### The driver with no scheduler at all — the shape ladder L2 uses

*This was section 2, "Minimal working program", until
[W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — and since P18 it is the
HARDER road, so it moved here byte for byte. It is still the one demonstration of a `Driver` with
nothing underneath it: a fake scheduler in twelve lines, which is what ladder L2 runs against and
what a unit test of your own routing wants.*

A flow is **data**. You supply the predicates and the task factory; the driver does the rest.

```ts run
import { Driver, fold, liveToken, type FlowDefinition, type Predicate } from 'fyflow-orchestration';

const definition: FlowDefinition = {
  flowId: 'greet',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest',  kind: 'task', type: 'IngestWorker',  edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end',  outcome: 'completed' },
  ],
};

// A fake scheduler, so this snippet runs with no workers. In your program this is
// `new FyflowScheduler({ ... })` — see section 12.
//
// **Key the listeners by event type.** The driver subscribes to four of them and
// normalizes on the task's terminal STATE rather than the event name (`OR-R3`), so a
// double that fans one settlement to every listener writes FOUR records for it and
// the run stops on a `DuplicateTaskId`. A real `EventTarget` does not do this; a
// hand-written double is where it happens.
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const added: { id: string }[] = [];
const failures: string[] = [];
const scheduler = {
  addTask(task: unknown) { added.push(task as { id: string }); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
    listeners.set(type, [...(listeners.get(type) ?? []), fn]);
  },
};
const settle = (detail: unknown, type = 'task.completed') => {
  for (const fn of listeners.get(type) ?? []) fn({ detail });
};

const driver = new Driver(definition, {
  runId: 'run-1',
  scheduler,
  createTask: (config) => config,          // your `new FyflowTask(config)`
  predicates: new Map<string, Predicate>(),
  // Since v0.19 a task names a node TYPE and a type names a WORKER entry — section 13. The
  // validator and the driver require the entries to be DECLARED and load nothing; the URL is what
  // the bootstrap helper hands a real pool, so a fake scheduler's registry can carry any string.
  workers: { flow: { url: 'worker.js' } },
  nodeTypes: { IngestWorker: { worker: 'flow' }, PublishWorker: { worker: 'flow' } },
  joinPolicy: liveToken,
  // Section 9: a refusal raised inside a listener is REPORTED, never thrown.
  // Without this the run stops silently.
  onRunFailure: (f) => { failures.push(f.kind); },
});

driver.start({ name: 'world' });
console.log(added.map((t) => t.id));       // [ 'run-1:ingest:-:0' ]

// The scheduler reports a settlement; the driver routes.
settle({ id: 'run-1:ingest:-:0',  state: 'done', result: { greeting: 'hello world' } });
settle({ id: 'run-1:publish:-:0', state: 'done', result: null });
console.log(added.map((t) => t.id));       // [ 'run-1:ingest:-:0', 'run-1:publish:-:0' ]

const state = fold(driver.foldInputs());
console.log(state.outcome);                // 'completed'

if (added.map((t) => t.id).join() !== 'run-1:ingest:-:0,run-1:publish:-:0') {
  throw new Error(`wrong dispatches: ${added.map((t) => t.id).join()}`);
}
if (failures.length) throw new Error(`the run reported ${failures.join(', ')}`);
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
```

**Three things bite everyone.** The **run id is a constructor option**, not a `start()` argument,
and it must match `[A-Za-z0-9_-]{1,64}`. A definition with a fan-out and no `joinPolicy` is
**refused at construction**. A driver serves **exactly one run**, so `start()` is called at most
once — **and a second driver on the same scheduler is fine**, because a settlement only affects the
driver that dispatched it. Built by hand, each driver still HEARS every settlement and drops the
others; through `runtime.start` it is only handed its own (ADR 0088, above). See section 9.

---

## 13. Node types — a registry DOCUMENT entry, a derivation to a pool, and the envelope

**Every `task` names a node type**, and may carry per-node **`settings`** and a **`pool`** —
`spec/flow-definition.md` v0.19, [ADR 0049](doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
[ADR 0054](doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
[W59](doc/work-items/w59-what-a-node-type-is.md), [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
**A node type is a REGISTRY entry and the definition stays data**: the registry is a DOCUMENT —
`workers` (a module URL and the four JSON schemas that worker owns), `nodeTypes` (each naming a
worker, with its pool's options, its groups, a config, a retry default and `settings` DEFAULTS),
`pools` (named instances of a type), `groups` (built through group-type factories), plus the
`predicates` and `languages` it names and your code supplies. **A type is a DERIVATION from an
instance's config to pool options**; the document form is the identity derivation — what it
declares is what its default pool is built from — and a class registered in code is any other, both
passing the same checks. **Every type has a default pool, keyed by its name**; the flow names the
type and nothing else — never a file, never a URL. *(Until v0.19 a task could name a `workerType`
instead — a pool key, its worker handed the raw payload. That road is retired: `workerType` is an
undeclared key, and a worker written for it reads under `input` what it read as its whole payload.)*

| | | |
|---|---|---|
| `type` | **required** | the name of an entry in `nodeTypes` whose `worker` the registry's `workers` declares (`FD-V32`, both clauses) — **or a BUILT-IN type, which no document declares and which names no worker** (`Transform`, below). A task with no `type` is `FD-V23` |
| `pool` | optional | the name of an instance in the registry's `pools` whose `type` is this node's (`FD-V38`); absent, the type's DEFAULT instance. The type's own name is that default, stated explicitly |
| `settings` | optional | a plain JSON object which — with the type's `settings` defaults merged UNDER it — the worker's **`settingsSchema`** accepts (`FD-V33`); **absent means the defaults alone**, `{}` when the type declares none, and the schema sees that. A schema is JSON Schema in the built-in subset (ADR 0053): a keyword outside it is refused at construction, never ignored |
| `transform` | optional | `{ lang, expr }`: an expression, in a language the registry's **`languages`** set names, applied to the node's input BEFORE its worker sees it — below. `lang` unregistered is `FD-V35`, `expr` the language refuses is `FD-V36`, not `{ lang, expr }` is `FD-V37` |

### The one node type the library ships: a node that only TRANSFORMS

**`Transform` is a built-in node type, it names NO worker, and its task is its own `transform`** —
`spec/flow-definition.md` v0.28,
[ADR 0075](doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md),
[W109](doc/work-items/w109-a-node-that-only-transforms.md). Write `{ "kind": "task", "type":
"Transform", "transform": { "lang": …, "expr": … } }` and the node reshapes its input with no worker
module, no worker entry and no node type of yours. **It is merged at every READ and stored in no
registry**, so a flow may name it against a registry that declares no `nodeTypes` at all — which is what
lets a document a tool EMITS carry a reshaping step without carrying code for it. Name your own type
`Transform` and the registry refuses it by name, on every road: a built-in is never replaced. **It names no LANGUAGE**: `lang` is the
node's, exactly as it is on any `transform`, so the adapter stays yours and no engine ships with the
library.

**Use it last, and the reason is a cost.** A computation belongs at the cheapest tier that can hold it:

| tier | where it goes | what it costs |
|---|---|---|
| **selection** — *I need a value from another node* | **`needs`** on the consuming node (section 3) | **no task at all** |
| **computation feeding a worker** — *reshape what THIS worker reads* | **`transform`** on that worker's own node | **no extra task** |
| **computation with no consuming node** — *reshape for a join, a decision, an `end`* | **a `Transform` node** | **a real task**: measured at **+1 dispatch, +4 clones and +2 log records** per node, and inside a `map`, N of them |

Measured on a real `FyflowScheduler` at W109: a `map` whose branch is a `Transform` node feeding a
worker runs **1.93x** the same `map` with the transform on the worker's own node, inline at N = 128,
and a flat **~1.47x** threaded. *A reshaping task node is what
[ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
and [ADR 0051](doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
exist to remove, so this is an escape hatch rather than a default — the ADR says so in those words.*

**Three things to know before you use one.** A node of this type with **no `transform` is refused at
construction** by `FD-V46`, because the alternative is a task that returns what it was given. It
**takes `settings`**, bound as `$settings` in the expression exactly as on any transform, so one type is
reusable across flows. And **every arc LEAVING it is `unchecked`**: it declares no `outputSchema`
because it has no worker, so section 15's authoring feedback cannot judge what comes next. What you get
instead is a SAMPLE — `sampledOutput(registry, flow, nodeId)` returns the shape the node emitted on the
producer's own example, the sample it came from, and the departing verdicts, which it returns rather
than hides because a sample is evidence about one input and `fits` is a claim about every input
([Q446](doc/questions/q446.md)).

**What EVERY task's worker receives is the ENVELOPE `{ settings, input }`** — `FD-C5`. `settings`
is the node's effective settings — the merged object — as its own copy; **`input` is the value this
node receives** — the previous node's result, the object `needs` describes, its own item as a map
instance, the collection after a join. Write a worker to read `payload.settings` and
`payload.input`, and nothing else changes about it.

```ts run
import { validateDefinition, type FlowDefinition, type NodeTypeDeclaration, type Registry, type WorkerEntry } from 'fyflow-orchestration';

// The WORKER entries: a module URL, and the schemas the worker owns. `settingsSchema` is what
// FD-V33 applies to every node of EVERY type running that entry — over the node's settings with
// the type's defaults merged under, `{}` when neither says anything — so a schema that REQUIRES a
// key refuses absence by name, and a type whose nodes carry no settings is written over an entry
// that declares none (two entries here, one module each — since W67 a worker is a module). `configSchema` is held against every pool's
// derived config at construction; `inputSchema` and `outputSchema` are declared and carried, enforced on ONE
// value per run each (the entry payload at start(), a person's resolution at resolve() — FD-R4, W73)
// and never per settlement — since v0.20 (ADR 0056) any schema may carry `examples`, held to it at
// construction, `npm run check:workers` runs a worker on its input example (P19, W72), and since v0.21
// `checkWiring(registry, flow)` gives every arc of a flow a verdict from the two (W73).
const ingestUrl = new URL('../../examples/workers/ingest.ts', import.meta.url).href;
const typedUrl = new URL('../../examples/workers/typed.ts', import.meta.url).href;
const ingest: WorkerEntry = { url: ingestUrl };
const scorer: WorkerEntry = {
  url: typedUrl,
  settingsSchema: { type: 'object', required: ['factor'], properties: { factor: { type: 'number', minimum: 0 } }, additionalProperties: false },
};
// Two node types, in the DOCUMENT form — the identity derivation: what each declares is what its
// default pool is built from. `config` is every worker instance's constructor argument, `pool` the
// WorkerManager options minus what the type states beside it, `groups` the POOL's groups (every
// task of the type holds them), `retryPolicy` for every node of the type that declares none.
const IngestWorker: NodeTypeDeclaration = { worker: 'ingest', inline: true };
const Scorer: NodeTypeDeclaration = {
  worker: 'scorer',
  inline: true,
  pool: { maxThreads: 2 },
  groups: ['scorer'],
  retryPolicy: { maxRetries: 1, backoffMs: 0 },
};

// Two nodes of ONE type with DIFFERENT settings — the whole point.
const typed: FlowDefinition = {
  flowId: 'typed', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'low' }] },
    { id: 'low',    kind: 'task', type: 'Scorer', settings: { factor: 10 },  edges: [{ to: 'high' }] },
    { id: 'high',   kind: 'task', type: 'Scorer', settings: { factor: 100 }, edges: [{ to: 'done' }] },
    { id: 'done',   kind: 'end',  outcome: 'completed' },
  ],
};

// The registry the driver reads — the same sections the bootstrap helper builds pools from (below),
// so a type the flow names, the pool the scheduler holds and the schema the driver applies are one
// object and not three copies. `groups` is the set of group KEYS a node or a type may name.
const registry: Registry = { predicates: [], workers: { ingest, scorer }, nodeTypes: { IngestWorker, Scorer }, groups: ['scorer'] };
const bad = validateDefinition(typed, registry);
if (bad.length) throw new Error(`the typed flow is invalid: ${bad.map((f) => `${f.rule}@${f.at}`).join()}`);

// The refusals, each at construction and never on the one workload that hits it.
const rules = (def: FlowDefinition, reg = registry) => validateDefinition(def, reg).map((f) => f.rule);
const low = (node: object): FlowDefinition => ({ ...typed, nodes: [typed.nodes[0]!, node as never, typed.nodes[3]!] });
// FD-V32 — a type the registry does not hold; `nodeTypes` OMITTED means NONE registered; and a
// registered type whose WORKER the registry's `workers` does not declare.
if (!rules(low({ id: 'low', kind: 'task', type: 'Nope', edges: [{ to: 'done' }] })).includes('FD-V32')) throw new Error('FD-V32');
if (!rules(typed, { ...registry, nodeTypes: undefined }).includes('FD-V32')) throw new Error('FD-V32 with nodeTypes omitted');
if (!rules(typed, { ...registry, workers: {} }).includes('FD-V32')) throw new Error('FD-V32: the type names a worker the registry lacks');
// FD-V33 — settings the worker's schema refuses; and absent settings are the type's defaults — none
// here, so `{}` — which this schema refuses because it requires `factor`.
if (!rules(low({ id: 'low', kind: 'task', type: 'Scorer', settings: { factor: 'ten' }, edges: [{ to: 'done' }] })).includes('FD-V33')) throw new Error('FD-V33');
if (!rules(low({ id: 'low', kind: 'task', type: 'Scorer', edges: [{ to: 'done' }] })).includes('FD-V33')) throw new Error('FD-V33 on absent settings');
// FD-V38 — a `pool` that is not a registered instance of the node's type; the type's own name is
// its default instance and is accepted.
if (!rules(low({ id: 'low', kind: 'task', type: 'Scorer', settings: { factor: 1 }, pool: 'nope', edges: [{ to: 'done' }] })).includes('FD-V38')) throw new Error('FD-V38');
if (rules(low({ id: 'low', kind: 'task', type: 'Scorer', settings: { factor: 1 }, pool: 'Scorer', edges: [{ to: 'done' }] })).length) throw new Error('the type`s own name is its default instance');
// FD-V23 — there is no untyped road: a task without `type` is a task missing a required key.
if (!rules(low({ id: 'low', kind: 'task', edges: [{ to: 'done' }] })).includes('FD-V23')) throw new Error('FD-V23: a task with no type');
```

**Wiring it: `createRuntime`, or the bootstrap helper underneath it.** `fyflow-orchestration/scheduler`
is a sub-path — the one module of this package that constructs scheduler objects, kept out of the
root so the validator, the driver and the fold load no `WorkerManager` (`RT-R13`). **`createRuntime`
is the call a consumer copies** (section 12): it does everything below from a registry DOCUMENT,
including creating the group objects. `bootstrap` is what it uses for the pools, and it is exported
for a consumer who builds their groups and their scheduler themselves. `bootstrap(registry, groups, options)` builds
**one pool per type, keyed by the type's name, and one per named instance in `pools`**, each
through the type's derivation and each running the package's envelope worker around your worker,
and refuses **both ways** a type naming a group you gave no object for and an object no type names
(the scheduler ignores an unknown group id in silence, at the pool level too — measured). Hand the
scheduler its result, and the driver the SAME registry sections:

```ts check
import { type FlowDefinition, type Languages, type NodeTypeDeclaration, type WorkerEntry } from 'fyflow-orchestration';
import { bootstrap } from 'fyflow-orchestration/scheduler';
import { ConcurrentLimitGroup, FyflowScheduler } from 'fyflow-scheduler';
import { Driver, liveToken } from 'fyflow-orchestration';

declare const ingest: WorkerEntry;
declare const scorer: WorkerEntry;
declare const IngestWorker: NodeTypeDeclaration;
declare const Scorer: NodeTypeDeclaration;
declare const typed: FlowDefinition;
declare const languages: Languages;

// The types' groups are given as OBJECTS here and only here; the helper returns them keyed as given.
// The languages' worker modules are written into EVERY pool's config, whatever a flow transforms on
// (ADR 0096) — the helper reads no flow.
const registry = { workers: { ingest, scorer }, nodeTypes: { IngestWorker, Scorer } };
const built = bootstrap(registry, { scorer: new ConcurrentLimitGroup(4, 'scorer') }, { languages });
const scheduler = new FyflowScheduler(built.workerPools, built.resourceGroups);
const driver = new Driver(typed, {
  runId: 'run-1', scheduler, predicates: new Map(), joinPolicy: liveToken,
  ...registry,                                       // the SAME object the helper built every pool from
  groups: Object.keys(scheduler.groups),             // and its groups, read back off the scheduler
  languages,                                         // and the same languages
});
driver.start({ confidence: 0.9 });
```

**What a type declares for its nodes, and how it merges.** A node's own `retryPolicy` wins, whole;
then the type's; then the driver's `defaultRetryPolicy`. A type's `groups` are the pool's and the
scheduler unions them with a node's own `workerGroups`, so nothing merges — and a task acquires its
pool's group **once per ADMISSION**: a retry is admitted again, and so is a task that was admitted
to a threaded pool and found no free worker (both measured at ladder L6), so a group's budget is
spent per admission and not per task. Both are held at
construction: a type's policy to `FD-V30` and a type's groups to the registry's `groups` under
`FD-V31`, naming the type.

**What a type's `pool` may declare, and what its worker is handed beside the envelope** —
`spec/flow-definition.md` v0.33, [W159](doc/work-items/w159-what-the-pin-adds-that-a-type-reaches.md).
`pool` takes the scheduler's `maxThreads`, `maxConcurrentTasks`, `idleTimeout` and `residentGroups`, and
since v0.33 **`cancelGraceMs`** — on a THREADED pool, the ms a cancelled task's worker gets to stop by
itself before the scheduler forces it (`Infinity` never forces; an inline pool ignores it) — and
**`messages: { flushIntervalMs?, maxBuffered? }`**, the bounds on a worker's `emit()`. Each is held to the
scheduler's own rule at construction, `DerivationRefused` naming the type and the key, so a value the
scheduler would throw on at `new WorkerManager` is refused where the registry is built. Three more are
refused here where the scheduler says nothing: a `messages` that is not a PLAIN object (a Map, a Date, an
array or a class instance — the scheduler spreads it into its defaults and reads nothing), a
`cancelGraceMs` of `null` (the scheduler takes it for absent and uses 2000), and a stray key inside
`messages` — which the scheduler does not merely ignore: it carries the object to every worker, so on a
threaded pool a stray value that cannot be cloned fails the task at run time with *could not be cloned*.
**Your worker's `run(payload, context)` gets the scheduler's own task context as its second argument** —
the same object the scheduler handed the envelope worker, so `context.signal` (an `AbortSignal`, aborted
when `scheduler.cancel(taskId)` is called for the task) and `context.emit(name, data)` (a `task.message`
on the scheduler) work in a typed worker exactly as in one the scheduler loads itself, and its
constructor gets the worker context. The library reads neither: a `task.message` is yours to listen
for on `runtime.scheduler`, and what cancelling a task does to its RUN is section 6's.

**A transform — what a node may DO to its input before its worker sees it** — `spec/flow-definition.md`
v0.18, [ADR 0051](doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md),
[W61](doc/work-items/w61-what-a-transform-is.md). When the value a typed node receives is not the
shape its worker reads — a join's collection where the worker wants a total, an item where it wants
one field — the node declares `transform: { lang, expr }` instead of a reshaping task. **The language
is a registry entry**, `Registry.languages`, the fifth set: `{ compile, worker }`, where `compile`
runs on the main thread at construction and THROWS on an expression it refuses (so a SYNTAX error in
the expression is `FD-V36` at `new Driver`, never a failure on the one workload that reaches the
node — a misspelt KEY is not: it compiles and evaluates to `undefined`, which is P18's and P19's
to catch),
and `worker` is the URL of a module the envelope worker loads in `setup()` and evaluates with in
`run()` — two halves, because a function cannot cross to a thread and a URL can. The expression sees
the node's input as `$` and its settings as `$settings`; the worker receives `{ settings, input }`
with `input` REPLACED by the result. **Evaluation happens in the type's worker wrapper, never in the
driver**, so a transform is invisible to anything that reads what the driver dispatched. **A transform
that cannot be evaluated FAILS THE TASK** — `TransformFailed`, naming the language, the expression and
the language's own error code — and takes the two roads any worker throw takes: an `on: ["failed"]`
edge on an `optional` node, `user_action` on a non-optional one. A result of `undefined` is not a
failure. And a language module that failed to LOAD is not a worker error either: the wrapper
remembers the failure and fails, at `run()`, exactly the tasks that name that language. `$now`,
`$millis` and `$random` are unbound in every adapter: a transform is a function of what the run
produced. The language this package ships is JSONata, as the sub-path `fyflow-orchestration/jsonata`
— section 14; the snippet below uses a toy one so it loads no engine, and it is the same interface.

```ts run
import { DerivationRefused, resolveRegistry, validateDefinition, type FlowDefinition, type LanguageAdapter, type NodeTypeDeclaration, type Registry, type WorkerEntry } from 'fyflow-orchestration';
import { EnvelopeWorker, TransformFailed } from 'fyflow-orchestration/scheduler';

// A toy language: an expression is a dotted key path into the input, or `$settings.<path>`.
// The REGISTRY half compiles synchronously and throws on anything else — what FD-V36 reports.
// The WORKER half is a module URL (here a data: URL) whose default export compiles the same text
// and evaluates it; `evaluate` may return a Promise, as JSONata's does.
const GRAMMAR = /^(\$settings\.)?[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;
const workerSrc = `export default function compile(expr) {
  const segs = expr.split('.'); const fromSettings = segs[0] === '$settings'; const walk = fromSettings ? segs.slice(1) : segs;
  return { evaluate(input, settings) {
    let v = fromSettings ? settings : input;
    for (const k of walk) { if (v == null) return undefined; if (typeof v !== 'object') { const e = new Error('cannot read "' + k + '" of ' + typeof v); e.code = 'P0002'; throw e; } v = v[k]; }
    return v;
  } };
}`;
const path: LanguageAdapter = {
  compile: (expr) => { if (!GRAMMAR.test(expr)) throw new SyntaxError(`not a dotted key path: ${expr}`); },
  worker: `data:text/javascript,${encodeURIComponent(workerSrc)}`,
};

// A worker that echoes its input, as a data: URL, and two types over it.
const echo: WorkerEntry = { url: 'data:text/javascript,export default class W { run(p) { return p.input; } }' };
const Scorer: NodeTypeDeclaration = { worker: 'echo' };
const flow: FlowDefinition = {
  flowId: 'transformed', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
    // The worker wants the confidence alone; the transform picks it out of the previous result.
    { id: 'score', kind: 'task', type: 'Scorer', settings: { factor: 10 }, transform: { lang: 'path', expr: 'confidence' }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const registry: Registry = { predicates: [], workers: { echo }, nodeTypes: { IngestWorker: { worker: 'echo' }, Scorer }, languages: { path } };
const bad = validateDefinition(flow, registry);
if (bad.length) throw new Error(`the transformed flow is invalid: ${bad.map((f) => `${f.rule}@${f.at}`).join()}`);

// The three refusals, each at construction.
const rules = (node: object, reg = registry) => validateDefinition({ ...flow, nodes: [flow.nodes[0]!, node as never, flow.nodes[2]!] }, reg).map((f) => f.rule);
const score = (transform: unknown, rest: object = { type: 'Scorer' }) => ({ id: 'score', kind: 'task', transform, edges: [{ to: 'done' }], ...rest });
if (!rules(score({ lang: 'jsonata', expr: 'confidence' })).includes('FD-V35')) throw new Error('FD-V35: a language the registry does not name');
if (!rules(score({ lang: 'path', expr: 'confidence' }), { ...registry, languages: undefined }).includes('FD-V35')) throw new Error('FD-V35 with languages omitted — absent means EMPTY');
if (!rules(score({ lang: 'path', expr: '$sum(*.score' })).includes('FD-V36')) throw new Error('FD-V36: an expression the language`s compile refuses');
if (!rules(score({ lang: 'path' })).includes('FD-V37')) throw new Error('FD-V37: not { lang, expr }');
// And there is no untyped road for a transform to sit on: a node with no `type` is FD-V23, with the transform's own clauses applied beside it.
if (!rules(score({ lang: 'path', expr: 'confidence' }, {})).includes('FD-V23')) throw new Error('FD-V23: a transform on a node with no type is a node with no type');

// And what the wrapper does with it — the class the bootstrap helper puts around your worker,
// driven here directly. The helper writes `languages` into EVERY pool's config for you when you
// pass it the languages: `bootstrap(registry, groups, { languages: { path } })`.
const w = new EnvelopeWorker({ worker: echo.url, languages: { path: path.worker } });
await w.setup();
const seen = await w.run({ settings: { factor: 10 }, input: { confidence: 0.9, text: 'a bb ccc' }, transform: { lang: 'path', expr: 'confidence' } });
if (seen !== 0.9) throw new Error(`the worker received ${JSON.stringify(seen)} — not the transformed input`);
const bound = await w.run({ settings: { factor: 10 }, input: { confidence: 0.9 }, transform: { lang: 'path', expr: '$settings.factor' } });
if (bound !== 10) throw new Error('the node`s settings are bound as $settings');
const plain = await w.run({ settings: { factor: 10 }, input: { confidence: 0.9 } });
if (JSON.stringify(plain) !== JSON.stringify({ confidence: 0.9 })) throw new Error('no transform, the value received, untouched');
let failed: unknown;
try { await w.run({ settings: {}, input: { a: 5 }, transform: { lang: 'path', expr: 'a.b' } }); } catch (e) { failed = e; }
if (!(failed instanceof TransformFailed) || failed.code !== 'P0002') throw new Error('a loud evaluation failure is a TransformFailed carrying the language`s own code — the TASK fails');
await w.teardown();

// The CONTEXT, passed through (v0.33): a worker that reads its signal and emits. On a real pool the
// scheduler builds the context; here it is built by hand, which the wrapper cannot tell apart.
const reads = `data:text/javascript,${encodeURIComponent(`export default class W {
  run(p, context) { context.emit('seen', { aborted: context.signal.aborted }); return context.signal.reason; } }`)}`;
const cw = new EnvelopeWorker({ worker: reads });
await cw.setup();
const ctl = new AbortController();
ctl.abort('stopped by its owner');
const emitted: unknown[] = [];
const why = await cw.run({ settings: {}, input: null }, { signal: ctl.signal, emit: (name: string, data: unknown) => emitted.push([name, data]) });
if (why !== 'stopped by its owner' || JSON.stringify(emitted) !== JSON.stringify([['seen', { aborted: true }]])) throw new Error('a typed worker reaches the signal and the emit its task was handed');
await cw.teardown();

// And the two v0.33 pool options are held to the scheduler's rules where the registry is built.
let refused: unknown;
try { resolveRegistry({ workers: { echo }, nodeTypes: { Scorer: { worker: 'echo', pool: { cancelGraceMs: -1 } } } }); } catch (e) { refused = e; }
if (!(refused instanceof DerivationRefused) || !refused.message.includes('cancelGraceMs')) throw new Error('a negative cancelGraceMs is refused, naming the key');
if (resolveRegistry({ workers: { echo }, nodeTypes: { Scorer: { worker: 'echo', pool: { cancelGraceMs: 500, messages: { maxBuffered: 500 } } } } }).pools.get('Scorer')?.spec.cancelGraceMs !== 500) throw new Error('a well-formed one is carried to the pool');
```

**What this is not.** What a type says about what its worker EXPECTS and RETURNS — input and
output schemas, and a sample-based check across a transformed edge — was
[P16](doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s plan after
this one (P18) and is now [P19](doc/plans/p19-what-a-schema-buys-an-author.md)'s, answered in
**section 15**: since v0.19 a worker DECLARES `inputSchema` and `outputSchema`, no RUN enforces
them per settlement (that is OUT of P19 as a default) — since v0.21 the two values no static check
can reach are held to them ONCE each, `FD-R4` (section 9's `BoundaryRefused`), and `checkWiring(registry, flow)`
gives every arc of a flow one of five verdicts from them before any run (W73), with `pathsOf`,
`tryTransform` and `signatureOf` beside it as the authoring assists (W74) — and since v0.20 any schema may carry
`examples` — an annotation held to its schema at construction ([ADR 0056](doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md),
[W72](doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)) —
so that `npm run check:workers` can RUN a worker on its input example and validate what it returned
against its output schema, which is an authoring-time check and never a driver behaviour; the
adapter's optional `check` hook is the door left for the rest. A transform on a
`map`'s `over`, on an edge or on a decision is refused, with the reasons in ADR 0051. The validator runs at construction and
nowhere else: the driver holds your definition by reference, so a document you mutate after
`new Driver` is dispatched as mutated, for every key ([Q259](doc/questions/q259.md)). Every one of
the twenty-five worked flows in [`examples/`](examples/README.md) runs typed on a real scheduler
since v0.19 — three of them with a declared `transform` (section 14), one at three arities, one
whose transforms fail, and P18's own sample reducing a join's record for the node after it.
*(Twenty-four until [W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md) added
`triage.flow.json`, which is that plan's exit artifact: a flow and the runtime it needs from two
JSON documents and a shim.)*

## 14. The JSONata adapter — `fyflow-orchestration/jsonata`

The language this package ships for a `transform` is **JSONata**, at the one exact version
`package.json` names, as the sub-path
`fyflow-orchestration/jsonata` — [ADR 0052](doc/decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md),
[W62](doc/work-items/w62-the-jsonata-adapter.md). **The engine is a dependency of this package and
is loaded by that sub-path alone**: the root and `fyflow-orchestration/scheduler` import none of it,
so a consumer who never transforms pays the install and never the load, and a browser bundle carries
the engine only where the sub-path is imported (237 KiB). **A runtime whose registry names it loads it
in every worker of every typed pool** (ADR 0096 — section 12 has the measured cost). Import it, put it in the registry's
`languages` under the name a flow's `transform.lang` uses, and hand the same object to the
bootstrap helper:

```ts check
import { Driver, liveToken, type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';
import { bootstrap } from 'fyflow-orchestration/scheduler';
import { jsonata } from 'fyflow-orchestration/jsonata';
import { ConcurrentLimitGroup, FyflowScheduler } from 'fyflow-scheduler';

declare const registry: Pick<RegistryDocument, 'workers' | 'nodeTypes'>;
declare const flow: FlowDefinition;

// The adapter is `{ compile, worker }`: `compile` runs on the main thread at `new Driver` and
// `worker` is the URL of the SAME module, which the envelope worker imports inside the pool.
const languages = { jsonata };
const built = bootstrap(registry, { scorer: new ConcurrentLimitGroup(4, 'scorer') }, { languages });
const scheduler = new FyflowScheduler(built.workerPools, built.resourceGroups);
const driver = new Driver(flow, {
  runId: 'run-1', scheduler, predicates: new Map(), joinPolicy: liveToken,
  ...registry, groups: Object.keys(scheduler.groups), languages,
});
driver.start({ items: [1, 2, 3] });
```

**What an expression sees, and what it may not.** `$` is the node's input — the previous node's
result, the object `needs` described, a map instance's own item, or a join's collection keyed by
branch path — and the node's effective `settings` are bound as `$settings`, so one expression is
parameterised per node. **Five names are unbound, by name, on every compiled expression**: `$now`,
`$millis`, `$random` — the three every adapter must refuse, because a transform is a function of what
the run produced and run state is a fold of the log — **`$shuffle`**, JSONata's own fourth, which
draws from `Math.random()` (found by walking the engine's function table: of the 61 of its 63
built-ins the walk can observe, nothing else differs between two evaluations of one input) — **and
`$eval`**, for a different reason: it re-compiles its
argument at RUN time, so a syntax error inside it would be a task failure carrying the engine's
`D3120` that `FD-V36` never saw, and a transform is declared text refused at construction
([Q265](doc/questions/q265.md)). Each throws naming itself and the task fails with
`TransformFailed [UNBOUND]`; a computed key is read with `$lookup`, which recompiles nothing. **And the worker receives plain JSON values**: JSONata marks the
arrays it builds with an own `sequence` property that survives `structuredClone` across a thread and
that a deep-equal sees; the adapter strips it at every depth.

**Two things about JSONata itself that decide how you write a reduction.** A path over a join's
record changes TYPE with the region's arity — `*.score` is an array at two matching branches, the
scalar at one, absent at zero ([Q263](doc/questions/q263.md)) — so a reduction is written over the
array form, `$sum([*.score])`, which is `0` for a join nothing reached. And a misspelt key is silent:
`input.scroe` evaluates to `undefined` with no error, and the worker receives `undefined`, where
`$sum("a")` is loud (`T0412`). Only a syntax error is refused at construction.

```ts run
import { validateDefinition, type FlowDefinition, type NodeTypeDeclaration, type Registry, type WorkerEntry } from 'fyflow-orchestration';
import { EnvelopeWorker, TransformFailed } from 'fyflow-orchestration/scheduler';
import { jsonata } from 'fyflow-orchestration/jsonata';

const echo: WorkerEntry = { url: 'data:text/javascript,export default class W { run(p) { return p.input; } }' };
const Scorer: NodeTypeDeclaration = { worker: 'echo' };
const flow: FlowDefinition = {
  flowId: 'reduced', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    { id: 'scoreA', kind: 'task', type: 'IngestWorker', edges: [{ to: 'collect' }] },
    { id: 'scoreB', kind: 'task', type: 'IngestWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    // The join's successor wants the total, not the record: the transform reduces it, no reshaping node.
    { id: 'publish', kind: 'task', type: 'Scorer', settings: { factor: 2 }, transform: { lang: 'jsonata', expr: '$sum([*.score]) * $settings.factor' }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const registry: Registry = { predicates: [], workers: { echo }, nodeTypes: { IngestWorker: { worker: 'echo' }, Scorer }, languages: { jsonata } };
const bad = validateDefinition(flow, registry);
if (bad.length) throw new Error(`the reduced flow is invalid: ${bad.map((f) => `${f.rule}@${f.at}`).join()}`);

// FD-V36 carries JSONata's own refusal — its code and the position of the missing token — at `new Driver`, never on a workload.
const publish = (expr: string, reg = registry) => validateDefinition({ ...flow, nodes: flow.nodes.map((n) => (n.id === 'publish' ? { ...n, transform: { lang: 'jsonata', expr } } : n)) }, reg);
const syntax = publish('$sum(*.score');
if (syntax.map((f) => f.rule).join() !== 'FD-V36' || !syntax[0]!.detail.includes('S0203') || !syntax[0]!.detail.includes('position 12')) throw new Error(`FD-V36 with the engine's code and position: ${JSON.stringify(syntax)}`);
// FD-V35 — the language is a registry entry: a registry without it refuses the flow, and an absent set means none.
if (!publish('$sum([*.score])', { ...registry, languages: {} }).some((f) => f.rule === 'FD-V35')) throw new Error('FD-V35: jsonata not registered');

// The envelope worker — the class the bootstrap helper puts around your worker — with the adapter's worker half by URL.
const w = new EnvelopeWorker({ worker: echo.url, languages: { jsonata: jsonata.worker } });
await w.setup();
const record = { '0': { score: 40 }, '1': { score: 20 } };                                    // JP-R12's collection, two branches
const total = await w.run({ settings: { factor: 2 }, input: record, transform: { lang: 'jsonata', expr: '$sum([*.score]) * $settings.factor' } });
if (total !== 120) throw new Error(`the worker received ${JSON.stringify(total)} — expected the reduction, 120`);
const one = await w.run({ settings: {}, input: { '0': { score: 7 } }, transform: { lang: 'jsonata', expr: '$sum([*.score])' } });
if (one !== 7) throw new Error('arity one, the same expression: 7');
const none = await w.run({ settings: {}, input: {}, transform: { lang: 'jsonata', expr: '$sum([*.score])' } });
if (none !== 0) throw new Error('a join nothing reached: 0, because the reduction is over the ARRAY form');
let unbound: unknown;
try { await w.run({ settings: {}, input: record, transform: { lang: 'jsonata', expr: '$now()' } }); } catch (e) { unbound = e; }
if (!(unbound instanceof TransformFailed) || unbound.code !== 'UNBOUND') throw new Error('$now() is unbound: the TASK fails, naming it');
await w.teardown();
```

**How it is declared, and what that costs a consumer.** `package.json` names `jsonata` in
`dependencies` at one EXACT version and `deno.json` maps it to `npm:jsonata@` that same version
(there is no JSR package for it) — one pin, written twice, and `check:source` `S15` holds the two
together and refuses a second field naming the engine;
`S14` refuses any published file but `src/jsonata/**` importing the engine, and any form of the
specifier there but the bare `jsonata`. An npm consumer installs one 834 KiB package with no
dependencies of its own, whether or not they ever import the sub-path; a Deno consumer's
`deno.json` resolves the mapping; a bundler includes the engine only in a bundle that imports the
sub-path. **A bundled worker is your asset**: inside a bundle `import.meta.url` is the bundle's own
URL ([Q261](doc/questions/q261.md)), so `jsonata.worker` — like the envelope worker itself — has to be
served beside your bundle as a module of its own for a pool's thread to load it.

---

## 15. What a schema buys an AUTHOR — an authoring session

**The schemas in section 13 were never for the run.** A worker's `inputSchema` and `outputSchema`
are held to the run's PAYLOAD once and to a person's RESOLUTION once each (`FD-R4`, section 9) and
never per settlement — and neither of those is *two values per run*, because a fan-out or map entry
validates one value per branch task it reaches and a run nobody parks validates no resolution at
all. So what are they for? **They are for whoever is wiring the flow**, a person or an agent, and this section is
the session that shows it: a flow written, a MISWIRE caught before anything runs, a transform
written by a loop rather than guessed, and a worker typed against a signature generated from the
declarations. Three functions do it, all exported from the package root, and none of them refuses
anything or is reachable from a run. Two are pure over data; `tryTransform` is not, and the
difference matters to a caller — it is `checkWiring`'s one dynamic `import()` of the language
adapter's worker half, so it loads a module by URL and returns a promise:

| | answers |
|---|---|
| `pathsOf(schema)` | *what is there to reach for* — every path a value may carry, and which are guaranteed |
| `tryTransform(registry, flow, node, transform)` | *does THIS expression fit* — one candidate, one verdict, on a real sample |
| `signatureOf(name, worker)` | *what do I write my worker against* — TypeScript, as text |

The registry below is
[`examples/getting-started/session-registry.ts`](examples/getting-started/session-registry.ts) — two
workers whose schemas OPPOSE on purpose. `reader` returns `{ lines: string[], source }` and closes
the object; `summarise` REQUIRES a `text` string and closes its own. Everything here runs on every
`npm run gate`, and the same snippet is in `README.md`, held byte-equal by `check-docs`'s `X8`.

```ts run
import { checkWiring, describePaths, pathsOf, signatureOf, tryTransform, type FlowDefinition } from 'fyflow-orchestration';
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { jsonata } from 'fyflow-orchestration/jsonata';
import { SESSION_BASE, SESSION_REGISTRY, SESSION_WORKERS } from '../../examples/getting-started/session-registry.ts';  // in your program: './registry.ts', a module or a JSON file of your own

// The three things the check needs from a registry: the workers' schemas, the types that name them,
// and the languages a transform may be written in. `createRuntime` takes the whole document below.
const registry = { workers: SESSION_WORKERS, nodeTypes: SESSION_REGISTRY.nodeTypes, languages: { jsonata } };

// THE FLOW, as an author first writes it: read a batch, summarise it. It is a VALID document —
// `validateDefinition` has nothing to say about it, because nothing here is about the grammar.
const flow: FlowDefinition = {
  flowId: 'session', version: 1, entry: 'read',
  nodes: [
    { id: 'read', kind: 'task', type: 'Reader', edges: [{ to: 'sum' }] },
    { id: 'sum', kind: 'task', type: 'Summarise', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// STEP 1 — the wiring check, before a worker has run once. Every arc gets one of five verdicts.
const first = await checkWiring(registry, flow);
console.log(first.counts);                         // { fits: 0, no: 1, ... }
const arc = first.verdicts.find((v) => v.consumer === 'sum')!;
console.log(`${arc.kind}: ${arc.why}`);            // no: $: consumer requires "text", producer does not guarantee it
if (arc.kind !== 'no') throw new Error(`the miswire is the point of this section: got ${arc.kind}`);

// STEP 2 — so what IS there? The producer's own output schema, enumerated. A leading `?` marks a
// path a value may not carry at all; the rest are guaranteed by `required`.
console.log(describePaths(pathsOf(SESSION_WORKERS.reader.outputSchema)));
//   $                            object
//   $.lines                      array
// ? $.lines[]                    string
//   $.source                     string

// STEP 3 — a first candidate. It is run on the producer's declared EXAMPLE, and the result is held
// to the consumer's input schema, so the answer is about a value rather than about two declarations.
const attempt = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{ "text": lines }' });
console.log(`${attempt[0]!.kind}: ${attempt[0]!.why}`);
// transform-fails: the transform's result on the example fails the consumer's inputSchema — $.text expected string, got array
if (attempt[0]!.kind !== 'transform-fails') throw new Error('an array is not a string, and the loop says which');

// STEP 4 — ONE expression edit, and the same loop. `transform-passes` is never `fits`: it is a fact
// about the sample the verdict names, which is why `sample.source` is on it (a declared example
// here; where a schema declares none, a generated WITNESS, and the verdict says so).
const good = { lang: 'jsonata', expr: '{ "text": $join(lines, " ") }' };
const passed = await tryTransform(registry, flow, 'sum', good);
console.log(`${passed[0]!.kind} on the ${passed[0]!.sample!.source}: ${JSON.stringify(passed[0]!.sample!.result)}`);
if (passed[0]!.kind !== 'transform-passes') throw new Error(`expected the sample to pass, got ${passed[0]!.kind}`);

// STEP 5 — the signature the worker is written against, generated from the same three schemas.
// `examples/getting-started/session-types.ts` is this text, checked in, and `summarise.ts` imports
// it. A type holds the SHAPE: `words` is `number` here and its schema says `minimum: 0`.
const signature = signatureOf('Summarise', SESSION_WORKERS.summarise);
console.log(signature.split('\n').filter((l) => l.startsWith('export')).join('\n'));
if (!signature.includes('"text": string;')) throw new Error('the required key is required in the type too');

// STEP 6 — and only now the runtime. A runtime IS its registry: every typed pool carries every
// language the registry names, so a flow whose transform was decided during the session needs
// nothing passed in advance (ADR 0096). Check it against the runtime that will run it, then start
// it — `start` refuses from that same check.
const wired: FlowDefinition = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: good } : n)) };
const runtime = createRuntime(SESSION_REGISTRY, { languages: { jsonata } }, { base: SESSION_BASE });
const refused = runtime.check(wired);
if (refused.length !== 0) throw new Error(`the runtime refuses the wired flow: ${JSON.stringify(refused)}`);
const unknownLang: FlowDefinition = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: { lang: 'nope', expr: '$' } } : n)) };
if (!runtime.check(unknownLang).some((f) => f.rule === 'FD-V35' && f.at === 'sum')) throw new Error('a language the registry does not name is FD-V35, at check');
const state = await runtime.start(wired, { source: 'inbox' }).done;
await runtime.shutdown();
console.log(state.outcome, Object.values(state.nodes).find((n) => n.nodeId === 'sum')?.result);  // completed { words: 3 }

// The expected values are the DOCUMENT's, not literals beside the run: the consumer's own declared
// output example, and the producer's declared line count. A registry whose examples stop describing
// its workers is red here and in `test/definition/assist.test.ts`, which runs the same chain.
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
const got = Object.values(state.nodes).find((n) => n.nodeId === 'sum')?.result;
if (JSON.stringify(got) !== JSON.stringify(SESSION_WORKERS.summarise.outputSchema.examples[0])) {
  throw new Error(`the run returned ${JSON.stringify(got)}, not the consumer's declared output example`);
}
if ((got as { words: number }).words !== SESSION_WORKERS.reader.outputSchema.examples[0].lines.length) {
  throw new Error(`the producer declares ${SESSION_WORKERS.reader.outputSchema.examples[0].lines.length} lines, joined into one text`);
}
const after = await checkWiring(registry, wired);
if (after.counts.no !== 0) throw new Error('and the flow that ran has no unwired arc left');
```

**What a verdict is and is not.** `fits` is a statement about two DECLARATIONS and is checked
statically over the twelve constraining keywords of the subset. `transform-passes` is a statement
about ONE VALUE — the producer's first declared example, or a generated witness where it declares
none — and the verdict carries which it ran on and, over a region, the ARITY the sample had, because
a transform's result changes type with the arity ([Q263](doc/questions/q263.md)). **A witness is not
a proof**, and the reference says *the sample passed* rather than *fits* for exactly that reason.
Two more the check knows and a document cannot say: an OPEN producer is read as never emitting a key
it does not name **unless it REQUIRES that key**, which is a stated leniency and its one scope
([Q305](doc/questions/q305.md); the scope is W100's, and `required` is what refutes the leniency's own
premise); and a join successor's
record is the check's own knowledge, because the subset cannot spell *any key, each of shape S*
([Q306](doc/questions/q306.md)).

**One document per verdict** lives in [`spec/examples/wiring/`](spec/examples/wiring/), each named
by the verdict it earns — `fits`, `no`, `transform-passes`, `transform-fails` and `unchecked`, the
fifth being what the check says when a side declares no schema at all. `spec/flow-definition.md`
section 7 records their verdicts and the suite compares the directory and the table both ways.

**And the generated signature is a RECIPE rather than enforcement.** `signatureOf` emits text from
the subset with no dependency; `json-schema-to-typescript` is the richer consumer tool and reads the
same schemas. **The two AGREE wherever a schema says something** — an open object with a property
gets `[k: string]: unknown` from both — and they differ wherever it says LESS: an empty or
annotation-only schema is `unknown` here and an OBJECT type there, and a closed object with no
properties is `Record<string, never>` here and `{}` there, which in TypeScript means *any non-nullish
value*. Both shapes are in the corpus. *A schema that names no `type` admits every type, and this
emits the type that says so* — the same reading `pathsOf` gives it as `*`. *(This paragraph said the
opposite — that the two differ on the OPEN object — in the reference, in the module header and in the
item's own fact: two runs of one harness, one of which CONFIGURED the generator to close what the
schema leaves open, and the later run's line count was kept beside the earlier run's conclusion.
W74's conformity reader, from the author's own scratchpad output.)* Neither holds a
`minimum`, a `maxLength` or a `minItems`: **a type catches the shape, and `npm run check:workers` —
which RUNS each worker on its declared example and validates what came back — is what catches the
rest.** Even that sees one value: a bound the code does not keep past the example is invisible to it
and visible at every consumer the wiring check reads ([Q302](doc/questions/q302.md)).
---

## 16. What a schema buys a RUN — holding a result to the schema its worker declares

**Section 15's last sentence is where this one starts.** A bound a worker's code does not keep past
its declared example is invisible to every authoring-time tool here, and there is a second kind of
gap beside it that no such tool could ever reach: **what the run CARRIES is not what the worker
returned.** `OR-R2` clones every settled result into the log, and `structuredClone` copies a value's
own **enumerable** string-keyed data and nothing else (`OR-R11`, section 9) — so a worker can return
a value that satisfies its own `outputSchema` and the record can fail it.

**So a result may be held to that schema at run time, per settlement, and the answer is a READING.**
Supply `onNonconformingResult` and every `done` settlement whose worker declares an `outputSchema`
is checked; omit it and nothing is. **There is no boolean beside it — the callback's presence IS the
switch**, because two members would be two sources that can disagree, and both disagreements are
defects: a switch with no channel is a cost paid for a report nobody receives, and a channel with the
switch off is a typed option silently dropped
([ADR 0060](doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md),
`OR-R13`).

**A finding changes NOTHING about the run.** No record is written differently, no terminal state is
authored, no dispatch moves, and the value reaches its successor unaltered — so the run completes
exactly as it would with the check off. *You cannot audit a behaviour with an instrument that alters
it*, and that is the whole reason this is not a refusal: what it buys you is **knowledge rather than
protection**, and a value that fails its schema still flows downstream. The one way it can change a
run is **your own callback throwing**, which is caught at the listener, reported through
`onRunFailure` and stops the run — the treatment every callback here gets (section 9).

Three more things worth knowing before you switch it on:

| | |
|---|---|
| **`done` settlements only** | a failed or parked task has `result: null` (`OR-R2`), and an output schema no worker reached would refuse every one of them |
| **settlements only, never a resolution** | a person's `done` value is held to the same schema at `resolve()`, once, as a REJECTED command (`FD-R4`, section 9). One value refused twice by two mechanisms with different answers is worse than either |
| **a worker with no `outputSchema` is UNCHECKED** | *absent means unchecked*, exactly as `FD-R4` reads it |

*What it costs is a RATIO to the `structuredClone` the driver already pays on the same settlement,
and on this repository's own corpus it stays UNDER it at every shape measured. The share FALLS as the
value grows and RISES as the schema does — the clone is linear in the value and the check is linear in
the schema, and `enum` is where a schema's size is unbounded, so one large `enum` puts the check OVER
the clone. `spec/outcome-record.md` section 4 carries the figures with the method that took them. It
is a ratio rather than a millisecond, deliberately, and the reason is visible in the one number
`examples/l6.ts` PRINTS: over every settlement that rung makes, the same two values read about twice
as dear in Node as in Deno. **A single figure would be a property of a machine**
([Q179](doc/questions/q179.md), [Q335](doc/questions/q335.md)). (This paragraph said "about a third",
which is the Node reading — W82's conformity reader, finding 12.)*

The worker below is
[`examples/getting-started/drift.ts`](examples/getting-started/drift.ts) and it has **both** shapes
in one return value, neither of which is a mistake anybody would call out in review. Everything here
runs on every `npm run gate`. *(This sentence also said **and the same snippet is in `README.md`,
held byte-equal by `check-docs`'s `X8`** until
[W107](doc/work-items/w107-the-readme-is-for-a-person-who-will-use-the-library.md), which gave the
three root documents one audience each
([ADR 0073](doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)) and took
this section's pairing out with the README section it mirrored. `X8` pairs three sections now — 2, 5
and 15 — and each of those three still carries this claim and still earns it. Found by W107's
conformity reader: the item edited every other document the change reaches and not this one, which is
the document ADR 0073 designates as the agent's reference, about the mechanism the item changed.)*

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { checkWiring, type FlowDefinition, type NonconformingResult, type RegistryDocument } from 'fyflow-orchestration';

// THE REGISTRY — one worker with both of its VALUE schemas declared, and one with none. The schemas
// are the same objects the wiring check reads; what changes below is that a RUN reads them too.
const registry: RegistryDocument = {
  workers: {
    drift: {
      url: '../../examples/getting-started/drift.ts',   // in your program: './drift.ts'
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, examples: [{ text: 'alpha bb' }] },
      outputSchema: {
        type: 'object', required: ['words', 'load', 'label'], additionalProperties: false,
        properties: {
          words: { type: 'integer', minimum: 0 },
          load: { type: 'number', minimum: 0, maximum: 1 },
          label: { type: 'string' },
        },
        examples: [{ words: 2, load: 0.2, label: 'w2' }],
      },
    },
    inspect: { url: '../../examples/getting-started/inspect.ts' },   // no outputSchema: UNCHECKED
  },
  nodeTypes: { Drift: { worker: 'drift', inline: true }, Inspect: { worker: 'inspect', inline: true } },
};

const flow: FlowDefinition = {
  flowId: 'drift', version: 1, entry: 'measure',
  nodes: [
    { id: 'measure', kind: 'task', type: 'Drift', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'Inspect', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// EVERY authoring-time tool says this flow is fine, and both are right: one reads two SCHEMAS and
// the other runs a worker on ONE declared example. Neither holds a record. The wiring check takes
// the document's two relevant PARTS rather than the document (section 15).
const wiring = await checkWiring({ workers: registry.workers, nodeTypes: registry.nodeTypes }, flow);
console.log(wiring.counts.no);                       // 0
if (wiring.counts.no !== 0) throw new Error('the static check has nothing to say about either defect');

// SUPPLY THE CALLBACK AND THE CHECK IS ON. There is no boolean beside it: its presence IS the
// switch (ADR 0060). A finding is a READING — nothing is appended differently, no terminal state is
// authored, no dispatch moves, and the value reaches the next node exactly as it would with the
// check off.
const found: NonconformingResult[] = [];
const runtime = createRuntime(registry, {}, { base: import.meta.url });
const state = await runtime.start(flow, { text: 'one two three four five six seven eight nine ten eleven' }, {
  onNonconformingResult: (f) => { found.push(f); },
}).done;
await runtime.shutdown();

console.log(state.outcome);                          // completed — a finding changes nothing
// ONE report per settlement, carrying EVERY way that result failed, in document order.
console.log(found.map((f) => `${f.nodeId} (${f.worker}): ${f.findings.map((x) => `${x.path} ${x.says}`).join('; ')}`));
//   [ 'measure (drift): $.label required; $.load above maximum 1' ]

if (state.outcome !== 'completed') throw new Error(`a finding is a reading: expected completed, got ${state.outcome}`);
if (found.length !== 1) throw new Error(`one report per settlement, not one per finding: got ${found.length}`);
if (found[0]?.worker !== 'drift' || found[0]?.type !== 'Drift') throw new Error(`a finding names the node, its type and the worker whose schema refused it: ${JSON.stringify(found[0])}`);

// `found` rather than `found[0]!`: a guard that raises a TypeError on an empty report is a CRASH and
// not a detection, and every `includes` below would inherit it.
const says = found.flatMap((f) => f.findings).map((x) => `${x.path} ${x.says}`).join('; ');
// The BOUND is one the worker's own code does not keep past its declared domain: at the two words
// its declared example carries, `load` is 0.2 and nothing is reported. `check-workers` runs that
// example and is green; one example confirms a schema at ONE value.
if (!says.includes('$.load above maximum 1')) throw new Error(`expected the bound to be reported, got ${says}`);
// The MISSING KEY is not a defect in the worker at all. It returned `label`; `structuredClone`
// copies own ENUMERABLE keys and nothing else (OR-R11), so the RECORD the run carries does not have
// it — and what this check reads is the record. No authoring-time tool holds one.
if (!says.includes('$.label required')) throw new Error(`expected the clone's loss to be reported, got ${says}`);

// AND THE VALUE FLOWED ON ANYWAY. `after` declares no `outputSchema`, so it is UNCHECKED; what it
// reports is the key set it RECEIVED, which is the record's and not the worker's.
const after = Object.values(state.nodes).find((n) => n.nodeId === 'after')?.result as { keys: string[] };
console.log(after.keys);                             // [ 'load', 'words' ]
if (after.keys.join() !== 'load,words') throw new Error(`the successor received ${after.keys.join()}`);

// OMIT THE CALLBACK AND NOTHING IS CHECKED — and the run is the same run. This is the property to
// rely on: you can turn the reading on in one environment and off in another without changing what
// the flow DOES, because an instrument that altered what it measures would be useless for auditing.
const quiet = createRuntime(registry, {}, { base: import.meta.url });
const same = await quiet.start(flow, { text: 'one two three four five six seven eight nine ten eleven' }).done;
await quiet.shutdown();
const shape = (s: typeof state) => JSON.stringify(Object.values(s.nodes).map((n) => [n.nodeId, n.result]));
if (same.outcome !== state.outcome || shape(same) !== shape(state)) {
  throw new Error('a finding is a reading: the same run with the check off must reach the same nodes with the same results');
}
```

**Where the two halves of this are proved, and it is not here.** Every guard in the snippet above
can be made a tautology with `npm run check:docs` at exit 0 — `X4` counts a `throw` textually and
refuses `if (false)` by name, and neither reaches `found.length !== found.length`
([Q310](doc/questions/q310.md), measured on this section by W82's adequacy reader). **What holds the
two claims is `examples/l6.ts`**, which runs the same two shapes as two separate workers on a real
`FyflowScheduler` in both runtimes — `nonconforming — eleven words` and its control at two words,
where the bound is kept and the clone's loss is reported anyway — and holds the check-ON run against
the identical run with the check OFF, record for record. *A worker here made to keep its bound is
green at this rung and red at that one.*
## 17. Fanning out PER ITEM — a region inside a `map` region

**The shape this section teaches was refused at `Driver` construction until `0.4.0`.** *Score each item, then fan
out per item* — a `map` over a list, and inside each of its branches a SECOND `map` over a list that
branch computed — was refused at `Driver` construction, because a region's identity was its opener's
node id and a `map` makes one opener reachable once per item. The workaround was the one this library
exists to remove: a reshaping node and a second flow.

**A region INSTANCE is now the pair `(opener node id, the opener's own branch path)`**
([ADR 0062](doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)).
Three things follow, and they are the whole of what you need:

| | |
|---|---|
| **`RunState.regions` is TWO-LEVEL** | `regions[openerId][openerPath]`. The opener's id is unchanged in meaning and in value; the second key is `-` for a region in no region, and inside a `map` region it is that map's item index |
| **every `RegionEvent` carries `regionPath` beside `regionId`** | so an event says WHICH instance it is about. The same for `UnsatisfiableJoin` |
| **a join's collection is per INSTANCE** | `JP-R12` keys it by branch path, and a branch inside an instance carries that instance's path as its own prefix — so two instances of one opener hold DISJOINT key sets and cannot collide |

**Both arities come from data, at both levels, and neither is in the document.** That is what
separates a `map` from a `fanout`: `FD-V9` requires a fan-out's branch entries to be written down, so
a fan-out's width is an authoring-time fact. Here the outer width is *how many orders the entry
returned* and each inner width is *how many lines THAT order has* — different per instance.

**Writing it needs exactly one node between the two maps.** A `map`'s `over` names a key of what the
previous node returned, and a `map`'s branch is a TASK (`FD-V25` refuses a map whose branch is a
map) — so the outer branch entry is the node whose output carries the item's own list. No `needs`, no
`transform`, no reshaping node and no second flow.

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import type { FlowDefinition, RegionEvent, RegistryDocument } from 'fyflow-orchestration';

const registry: RegistryDocument = {
  workers: {
    orders: { url: '../../examples/getting-started/orders.ts' },   // in your program: './orders.ts'
    lines: { url: '../../examples/getting-started/lines.ts' },
    tag: { url: '../../examples/getting-started/tag.ts' },
  },
  nodeTypes: {
    Orders: { worker: 'orders', inline: true },
    Lines: { worker: 'lines', inline: true },
    Tag: { worker: 'tag', inline: true },
  },
};

// TWO MAPS, one inside the other's branch. `expand` is the single node between them: a map's `over`
// names a key of what the PREVIOUS node returned, so the outer branch entry is what produces the
// item's own list. `FD-V25` refuses a map whose branch is a map, which is why that node is required
// and why it is the only one.
const flow: FlowDefinition = {
  flowId: 'per-item', version: 1, entry: 'intake',
  nodes: [
    { id: 'intake', kind: 'task', type: 'Orders', edges: [{ to: 'perOrder' }] },
    { id: 'perOrder', kind: 'map', over: 'orders', branch: 'expand' },
    { id: 'expand', kind: 'task', type: 'Lines', edges: [{ to: 'perLine' }] },
    { id: 'perLine', kind: 'map', over: 'lines', branch: 'price' },
    { id: 'price', kind: 'task', type: 'Tag', settings: { label: 'priced' }, edges: [{ to: 'lineJoin' }] },
    { id: 'lineJoin', kind: 'join', of: 'perLine', edges: [{ to: 'orderJoin' }] },
    { id: 'orderJoin', kind: 'join', of: 'perOrder', edges: [{ to: 'report' }] },
    { id: 'report', kind: 'task', type: 'Tag', settings: { label: 'reported' }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// A region event now says WHICH INSTANCE it is about. Before 0.4.0 it carried `regionId` alone,
// which is the same string for every instance of one opener.
const arrivals: string[] = [];
const runtime = createRuntime(registry, {}, { base: import.meta.url });
const state = await runtime.start(flow, { region: 'ab c' }, {
  onRegionEvent: (e: RegionEvent) => {
    if (e.type === 'branch.arrived') arrivals.push(`${e.regionId}@${e.regionPath} <- ${e.branchPath}`);
  },
}).done;
await runtime.shutdown();

console.log(state.outcome);                                  // completed
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);

// ONE OPENER, TWO INSTANCES — keyed by the opener's own branch path, which inside `perOrder` is the
// item index. `'ab c'` is two orders, so `perOrder` opened two branches and `perLine` was entered
// twice; `ab` has two lines and `c` has one, and neither number is in the flow above.
console.log(Object.keys(state.regions['perLine'] ?? {}).sort());   // [ '0', '1' ]
console.log(Object.keys(state.regions['perOrder'] ?? {}).sort());  // [ '-' ]
const instances = Object.keys(state.regions['perLine'] ?? {}).sort();
if (instances.join() !== '0,1') throw new Error(`one opener, two instances: got ${instances.join()}`);
if (Object.keys(state.regions['perOrder'] ?? {}).join() !== '-') throw new Error('perOrder is in no region, so its instance key is `-`');

// EACH INSTANCE HAS ITS OWN WIDTH AND ITS OWN ANSWER, and their branch keys are disjoint because a
// branch inside an instance begins with that instance's path.
const widths = instances.map((p) => Object.keys(state.regions['perLine']![p]!.settled).sort().join(' '));
console.log(widths);                                         // [ '0.0 0.1', '1.0' ]
if (widths.join(' | ') !== '0.0 0.1 | 1.0') throw new Error(`each instance has its own width: got ${widths.join(' | ')}`);
if (!instances.every((p) => state.regions['perLine']![p]!.joined === true)) throw new Error('both inner joins fired');

// AND THE EVENTS NAMED THE INSTANCE, not just the region.
console.log(arrivals.sort());
//   [ 'perLine@0 <- 0.0', 'perLine@0 <- 0.1', 'perLine@1 <- 1.0', 'perOrder@- <- 0', 'perOrder@- <- 1' ]
if (!arrivals.includes('perLine@0 <- 0.0') || !arrivals.includes('perLine@1 <- 1.0')) {
  throw new Error(`a region event names the instance: ${arrivals.sort().join(', ')}`);
}

// WHAT THE OUTER JOIN CARRIES IS TWO LEVELS DEEP. `JP-R12`: one entry per branch that arrived, keyed
// by branch path — and each of the outer entries IS that instance's own collection.
const report = Object.values(state.nodes).find((n) => n.nodeId === 'report')?.result as Record<string, Record<string, { sku: string }>>;
console.log(Object.keys(report).filter((k) => k !== 'reported').sort());   // [ '0', '1' ]
console.log(report['0']!['0.1']!.sku);                       // ab-1
if (report['0']!['0.1']!.sku !== 'ab-1' || report['1']!['1.0']!.sku !== 'c-0') {
  throw new Error(`the outer collection's values are the inner collections: ${JSON.stringify(report)}`);
}
```

**What is still refused, and by what.** `FD-V19` keeps one node out of two branch entries of one
fan-out; `FD-V25` keeps a map's branch from being a map; `ID-R6` refuses a branch path across a map
region with no item index; `ID-R1` refuses a duplicate dispatch. **Those four are what make the
derived key total**, and they are why this cost no new refusal and no new error class.

**An empty inner list still stops the run.** A `map` over zero items opens no branch, so its join can
never fire and the run is `stuck` (section 8) — one empty list anywhere makes the whole run stuck,
and that ruling is unchanged by nesting.

**`0.4.0` is BREAKING in two ways and neither is `regionId`.** `RunState.regions` gaining its second
level is a break for anyone reading it, and `UnsatisfiableJoin.regionPath` is a REQUIRED member on an
interface a consumer may construct — so a test double reporting a dead join no longer compiles.
`regionId` keeps its meaning AND its value, which is why no flow, no policy and no region name moves.

---

## 18. Saving a run and RESUMING it — append the events, resume from them

**A run can outlive the process that ran it, and what it needs is the events you were already
handed.** The library defines the value and never where it goes
([P23](doc/plans/p23-what-a-run-needs-to-outlive-its-process.md) decision 1): no file, no database,
no serializer. A CHECKPOINT is `{ header, events }`
([ADR 0064](doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)) —
the header is five facts the events cannot regenerate (`format`, `runId`, `flowId`, `version` and a
copy of the entry payload), and `events` is every fold input so far, so **every event after a
checkpoint is an append to it**. You never have to call `driver.checkpoint()` to keep one:

| | where you get it | what you do with it |
|---|---|---|
| the header | `runtime.start(…)` returns it as `header`, beside `driver` and `done` | write it once |
| every event | `onFoldInput(event, position)` | write it AT `position` — the driver's index, never a count you start again in each process |
| a resumed run | `runtime.resume(flow, { header, events }, options)` returns the same `{ driver, done, header }` | keep writing: it hands you positions from the STORED LENGTH on |

**Key the store by POSITION, and the reason is measured.** The first events are delivered WHILE
`start` runs, so the header arrives after them — a store that must write its header first cannot —
and a resumed run's first position is the length you stored, not 0, so an arrival counter per process
overwrites the run it is resuming. ([W90](doc/work-items/w90-a-run-killed-and-resumed-on-real-workers.md)
runs exactly that wrong store at L6 and it is refused `diverged` at position 0.) **The contract is
`structuredClone`, not JSON**: a result is whatever survived `OR-R2`'s clone, which includes `Map`,
`Set`, `Date`, `BigInt` and `-0` — pick a serializer that keeps them, or revive them.

```ts run
import { createRuntime, RunIdInUse } from 'fyflow-orchestration/scheduler';
import { fold, ResumeRefused } from 'fyflow-orchestration';
import type { CheckpointHeader, FlowDefinition, FoldInput, RegistryDocument } from 'fyflow-orchestration';

// Section 17's flow and workers — ONE map inside another — so there is something in flight to lose.
const registry: RegistryDocument = {
  workers: {
    orders: { url: '../../examples/getting-started/orders.ts' },   // in your program: './orders.ts'
    lines: { url: '../../examples/getting-started/lines.ts' },
    tag: { url: '../../examples/getting-started/tag.ts' },
  },
  nodeTypes: {
    Orders: { worker: 'orders', inline: true },
    Lines: { worker: 'lines', inline: true },
    Tag: { worker: 'tag', inline: true },
  },
};
const flow: FlowDefinition = {
  flowId: 'per-item', version: 1, entry: 'intake',
  nodes: [
    { id: 'intake', kind: 'task', type: 'Orders', edges: [{ to: 'perOrder' }] },
    { id: 'perOrder', kind: 'map', over: 'orders', branch: 'expand' },
    { id: 'expand', kind: 'task', type: 'Lines', edges: [{ to: 'perLine' }] },
    { id: 'perLine', kind: 'map', over: 'lines', branch: 'price' },
    { id: 'price', kind: 'task', type: 'Tag', settings: { label: 'priced' }, edges: [{ to: 'lineJoin' }] },
    { id: 'lineJoin', kind: 'join', of: 'perLine', edges: [{ to: 'orderJoin' }] },
    { id: 'orderJoin', kind: 'join', of: 'perOrder', edges: [{ to: 'report' }] },
    { id: 'report', kind: 'task', type: 'Tag', settings: { label: 'reported' }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// YOUR STORE. The library never writes one: here it is an object in memory, in your program a
// file, a table or a queue. It holds the HEADER once and every event AT ITS POSITION — the second
// argument `onFoldInput` is handed — so a later process can go on appending to it.
const store: { header?: CheckpointHeader; events: FoldInput[] } = { events: [] };

// ---- PROCESS ONE, which dies mid-run.
let alive = true;
let die!: () => void;
const died = new Promise<void>((resolve) => { die = resolve; });
const first = createRuntime(registry, {}, { base: import.meta.url });
const run = first.start(flow, { region: 'ab c' }, {
  onFoldInput: (event, position) => {
    if (!alive) return;                                   // a dead process writes nothing
    store.events[position] = structuredClone(event);     // your durable append, BY POSITION
    // THE CRASH, simulated: the process dies the instant the first `expand` settles — inside the
    // driver's turn, BEFORE it dispatches what that settlement causes.
    if (event.kind === 'outcome' && event.record.taskId.includes(':expand:')) { alive = false; die(); }
  },
});
// The header arrives on the handle, AFTER the first events: they were delivered while `start` ran.
// A store that had to write its header first could not; one keyed by position does not care.
store.header = run.header;
await died;
// `shutdown()` is cleanup, NOT the kill: it lets running work finish, and here that finishes the
// whole run. What makes this a crash is the store — nothing after `alive = false` reached it.
await first.shutdown();

const storedSettled = new Set(store.events.flatMap((e) => (e.kind === 'outcome' ? [e.record.taskId] : [])));
const storedDispatched = new Set(store.events.flatMap((e) => (e.kind === 'dispatched' ? [e.taskId] : [])));
console.log(`stored ${store.events.length} events, the last one the settlement the process died in`);

// ---- PROCESS TWO: a FRESH runtime, which is all a restarted process has. Resume from the store and
// keep appending BY POSITION: a resumed run hands you positions from the stored length on, so the
// same store holds the whole run again.
const header = store.header!;                            // written once, by process one
const second = createRuntime(registry, {}, { base: import.meta.url });
const resumed = second.resume(flow, { header, events: store.events.slice() }, {
  onFoldInput: (event, position) => { store.events[position] = structuredClone(event); },
});
const state = await resumed.done;

console.log(state.outcome);                                  // completed
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
// The same answer a run nobody killed gives (section 17's):
const report = Object.values(state.nodes).find((n) => n.nodeId === 'report')?.result as Record<string, Record<string, { sku: string }>>;
if (report['0']!['0.1']!.sku !== 'ab-1' || report['1']!['1.0']!.sku !== 'c-0') {
  throw new Error(`the resumed run reaches the same report: ${JSON.stringify(report)}`);
}

// WHAT RAN AGAIN — named by the `resumed` event, and recorded by the fold in `state.resumes`.
const resumes = store.events.flatMap((e) => (e.kind === 'resumed' ? [e.taskIds] : []));
if (resumes.length !== 1) throw new Error(`one resume is recorded as one \`resumed\` event: ${resumes.length}`);
const again = resumes[0]!;
console.log(again);                  // e.g. [ 'r1:expand:1:0', 'r1:price:0.0:0', 'r1:price:0.1:0' ]
if (JSON.stringify(state.resumes) !== JSON.stringify(resumes)) throw new Error('RunState.resumes records it');
// Nothing that SETTLED in the store runs again...
if (again.some((id) => storedSettled.has(id))) throw new Error('a stored settlement is never re-run');
// ...but work the store NEVER SAW does: the prices the dying settlement dispatched after the last
// thing that was written. The re-run set is what was in flight at the END of the replay.
const neverStored = again.filter((id) => !storedDispatched.has(id));
console.log(neverStored);            // the `price` tasks of the order whose `expand` the process died in
if (neverStored.length === 0 || !neverStored.every((id) => id.includes(':price:'))) {
  throw new Error(`the lost tail's dispatches run again: ${JSON.stringify(neverStored)}`);
}

// THE STORE HOLDS THE WHOLE RUN AGAIN: no gap at any position, and its fold IS the run.
if (Object.keys(store.events).length !== store.events.length) throw new Error('a store keyed by position has no holes');
if (JSON.stringify(fold(store.events)) !== JSON.stringify(state)) throw new Error('the store folds to the run');

// A run id belongs to the runtime that holds it: resuming the same run on `second` again is refused.
try {
  second.resume(flow, { header, events: store.events.slice() });
  throw new Error('expected RunIdInUse');
} catch (err) {
  if (!(err instanceof RunIdInUse)) throw err;
}
// And a checkpoint is resumed against the definition it was stored under, or not at all.
const third = createRuntime(registry, {}, { base: import.meta.url });
try {
  third.resume({ ...flow, version: 2 }, { header, events: store.events.slice() });
  throw new Error('expected ResumeRefused');
} catch (err) {
  if (!(err instanceof ResumeRefused) || err.reason !== 'flow') throw err;
}
await second.shutdown();
await third.shutdown();
```

**What a resume PROMISES, and what it does not** — [ADR 0065](doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md), `spec/run-state.md` section 9:

- **It is AT-LEAST-ONCE, and your workers must tolerate running twice.** The resume REPLAYS the
  stored settlements and resolutions through the routing that produced them, with every dispatch
  held, and then hands every task still in flight to the new scheduler at the SAME task id. That set
  is what was in flight at the END of the replay — including a task that finished in the dead process
  whose settlement you had not stored yet, and a task the dying settlement dispatched after your last
  write, which the snippet shows the store never saw. The run records it: a `resumed` event naming
  those ids, and `state.resumes`.
- **A re-run task gets a FRESH retry budget.** The log records a task's `attempts` only when it
  SETTLES, so the attempts a task spent before the crash are recorded nowhere — measured: a task with
  a budget of two attempts ran THREE times across one kill ([Q365](doc/questions/q365.md)).
- **A task PARKED for a person is not in flight.** It stays parked, the resumed run is
  `awaiting_action`, and `resolve()` on the RESUMED driver completes it (section 7).
- **The check sees only what you STORED.** The stored events must be a prefix of what the replay
  regenerates, and the first position where they are not is refused `diverged` — so a predicate or a
  flow you changed is caught where the stored run's road crosses it, and NOT where that road lies
  past your last event: there the resumed run takes the new road silently
  ([Q372](doc/questions/q372.md)). Change a flow, change its `version`.
- **The store is TRUSTED for what the resume feeds.** A stored settlement's result and a stored
  person's resolution are replayed as stored — nothing can check they are what the process saw
  ([Q374](doc/questions/q374.md)). A store you do not trust is a store you should not resume from.
- **`ResumeRefused` names its `reason`**: `format` (not a checkpoint this version writes), `run` (the
  header's run is not the driver's), `flow` (another flow id or `version` — there is no migration),
  `stopped`, `cancelled` and `diverged` — the last three with the `index` of the position. **A STOPPED
  run is not resumable**: the refusal that stopped it would stop it again. **Nor is a CANCELLED one**
  (section 6): a cancel is its owner's act, and a resume would hand the scheduler again what the owner
  stopped — `index` is the first cancelled settlement. A completed or `stuck` run resumes to itself and
  dispatches nothing.
- **A refused resume may SPEND its run id.** Refused by its header, nothing exists and the id is still
  free; refused during its replay, the runtime built a driver for it — so that runtime refuses the id
  with `RunIdInUse` from then on, as it refuses any id it ever built a driver for, a finished run's
  included, long after it released the driver (section 12). Resume on a fresh runtime
  ([Q371](doc/questions/q371.md)).
- **`shutdown()` is not a kill.** It DRAINS: measured in node and deno, a run one settlement in
  completes inside it, while a retry waiting on its backoff runs only if the backoff ends inside the
  drain — the drain dispatches like any other moment, and a backoff still pending when it ends is
  discarded (the current pin's `shutdown()` says so in its source; measured on the scheduler alone by
  W157 and its conformity reader, in node: a 100 ms backoff beside a 500 ms running task ran its retry
  in the drain, a 300 ms one with nothing else running did not; at 0.5.2 a retry could also start
  before its backoff ended). It waits while tasks are RUNNING
  and for at most five seconds, so a run with longer work in flight, or only queued or blocked tasks, is
  left where the wait ended. A crash is what the snippet's
  `alive` flag stands for — the store stops, whatever the process was doing.

**`0.5.0` is BREAKING for a consumer of the fold, in two ways.** `FoldInput` has a new kind,
`resumed`, so a `switch` that is exhaustive over `kind` no longer compiles, and `RunState` has a new
cell, `resumes`, so a `RunState` you construct needs it. A run nobody resumes carries no `resumed`
event and `resumes: []`.

---

## 19. What a node may REMEMBER across branches — a gate

**A branch cannot see its siblings, and that is usually what you want.** Two instances of one `map` are
invisible to each other (section 3's reference rule), a join waits for all of them, and a worker's own
memory is lost when its pool tears down or runs it on another thread. So a flow that must route each branch
by what the run's OTHER branches have already seen — *keep the first file of each TV series and drop the
rest, while every file gets a thumbnail* — had nowhere to keep that memory.
([P24](doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md) is that ingest.)

**A `gate` is a decision WITH MEMORY, and the memory is the DRIVER's**
([ADR 0066](doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md),
[ADR 0067](doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md)):

| | |
|---|---|
| **it names a gate TYPE** | `distinct` is built in: routes `first` (its DEFAULT), `duplicate` and `nokey`, keyed by `settings.key` — a DOTTED path of object keys over the value that reached the gate, no index, no wildcard, no expression. A key a flow needs COMPUTED is computed by the task before the gate. `if` and `switch` are built in too, and remember nothing (the end of this section) |
| **every route is wired, exactly once** | an edge with no `route` carries the type's DEFAULT route, never every route; a DROP is an edge to an `end`, and each is refused at load if it is missing (`FD-V41`) |
| **it computes nothing** | the branch leaves on the chosen route with EXACTLY the value that reached the gate |
| **its memory is ONE per gate per RUN** | shared by every branch that reaches it, whatever map item or region instance it comes from — and it starts empty with the run and ends with it |
| ***first* means first to ARRIVE in this run** | which varies between runs — so a test asserts that exactly ONE branch per key went `first`, never WHICH |
| **every decision is recorded** | a `gated` fold input — the gate, the branch path, the route and the key — and `RunState.gated`, in the order the branches arrived |
| **a resume REBUILDS the memory** | the replay asks the gate again for every stored settlement that reached it — the recorded decisions are REGENERATED and compared, never fed — so a run killed at any point resumes routing exactly as the run that was killed would have (section 18) |

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import type { FlowDefinition, GateType, RegistryDocument } from 'fyflow-orchestration';
import { validateDefinition } from 'fyflow-orchestration';

const registry: RegistryDocument = {
  workers: {
    download: { url: '../../examples/workers/download.ts' },     // in your program: './download.ts'
    identify: { url: '../../examples/workers/identify.ts' },     // parses `Show.S01E02.mkv` into series `show`
    thumbnail: { url: '../../examples/workers/thumbnail.ts' },
    series: { url: '../../examples/workers/series.ts' },         // the per-series work; returns the file that opened it
    publish: { url: '../../examples/workers/publish.ts' },
  },
  nodeTypes: {
    Download: { worker: 'download', inline: true, pool: { maxThreads: 8 } },
    Identify: { worker: 'identify', inline: true, pool: { maxThreads: 8 } },
    Thumbnail: { worker: 'thumbnail', inline: true, pool: { maxThreads: 8 } },
    SeriesSetup: { worker: 'series', inline: true },
    Publish: { worker: 'publish', inline: true },
  },
};

// A map over files. Each branch fetches its file and fans out BESIDE: a thumbnail for EVERY file, and `identify`,
// which assigns the SERIES, then the gate. No task could know whether another file of its series came first — the
// gate can, because its memory is the run's.
const flow: FlowDefinition = {
  flowId: 'tv-ingest', version: 1, entry: 'episodes',
  nodes: [
    { id: 'episodes', kind: 'map', over: 'files', branch: 'download' },
    { id: 'download', kind: 'task', type: 'Download', edges: [{ to: 'beside' }] },
    { id: 'beside', kind: 'fanout', branches: ['thumbnail', 'identify'] },
    { id: 'thumbnail', kind: 'task', type: 'Thumbnail', edges: [{ to: 'perFile' }] },
    { id: 'identify', kind: 'task', type: 'Identify', edges: [{ to: 'dedupe' }] },
    // ALL THREE of `distinct`'s routes wired, once each. The edge with no `route` carries its DEFAULT, `first`.
    { id: 'dedupe', kind: 'gate', type: 'distinct', settings: { key: 'series.id' }, edges: [
      { to: 'setupSeries' },
      { route: 'duplicate', to: 'dropDuplicate' },   // a DROP is an edge to an `end`
      { route: 'nokey', to: 'dropUnidentified' },    // `series.id` resolved to nothing: a name with no series in it
    ] },
    { id: 'setupSeries', kind: 'task', type: 'SeriesSetup', edges: [{ to: 'seriesReady' }] },
    { id: 'seriesReady', kind: 'end', outcome: 'series-ready' },
    { id: 'dropDuplicate', kind: 'end', outcome: 'duplicate' },
    { id: 'dropUnidentified', kind: 'end', outcome: 'unidentified' },
    { id: 'perFile', kind: 'join', of: 'beside', edges: [{ to: 'all' }] },
    { id: 'all', kind: 'join', of: 'episodes', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

const files = ['Dark.S01E01.mkv', 'Lost.S01E01.mkv', 'Dark.S01E02.mkv', 'trailer.mkv', 'Lost.S01E02.mkv']
  .map((name) => ({ name, sizeMB: 1 }));
const runtime = createRuntime(registry, {}, { base: import.meta.url });
const state = await runtime.start(flow, { files }).done;
await runtime.shutdown();

console.log(state.outcome);                                     // completed
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);

// EVERY DECISION, in the order the branches reached the gate. WHICH file of a series went `first` is whichever
// ARRIVED first in this run — so assert the count per key, never the file.
console.log(state.gated.map((d) => `${d.branchPath} ${d.route} ${d.key ?? '-'}`));
//   e.g. [ '0.1 first dark', '1.1 first lost', '2.1 duplicate dark', '3.1 nokey -', '4.1 duplicate lost' ]
const opened = state.gated.filter((d) => d.route === 'first').map((d) => String(d.key)).sort();
if (opened.join() !== 'dark,lost') throw new Error(`exactly ONE first per series: ${opened.join()}`);
if (state.gated.filter((d) => d.route === 'duplicate').length !== 2) throw new Error('the other two identified files are duplicates');
if (state.gated.filter((d) => d.route === 'nokey').length !== 1) throw new Error('the trailer carries no series');

// The per-series task ran for EXACTLY the branches the gate routed `first` — and received exactly what reached the
// gate: `identify`'s whole result, the file name included, which neither the key nor the settings carries.
const setups = Object.values(state.nodes).filter((n) => n.nodeId === 'setupSeries');
const firsts = state.gated.filter((d) => d.route === 'first');
if (setups.map((n) => n.branchPath).sort().join() !== firsts.map((d) => d.branchPath).sort().join()) {
  throw new Error('setupSeries ran for exactly the branches routed first');
}
for (const d of firsts) {
  const r = setups.find((n) => n.branchPath === d.branchPath)!.result as { series: string; openedBy: string };
  if (r.series !== d.key || r.openedBy !== files[Number(d.branchPath.split('.')[0])]!.name) {
    throw new Error(`what left the gate is what reached it: ${JSON.stringify(r)}`);
  }
}

// A DROP IS AN `end`, so it is a path end like any other — and the thumbnail ran for EVERY file: each file's
// `perFile` record holds its thumbnail, and nothing from the gate road, which ended at an `end` in every branch.
console.log(state.pathEnds.map((p) => p.at).sort());
//   [ 'done', 'dropDuplicate', 'dropDuplicate', 'dropUnidentified', 'seriesReady', 'seriesReady' ]
const published = Object.values(state.nodes).find((n) => n.nodeId === 'publish')!.result as
  { joinPayload: Record<string, Record<string, { thumbnail?: string }>> };
const thumbs = Object.entries(published.joinPayload).map(([i, perFile]) => perFile[`${i}.0`]?.thumbnail);
if (thumbs.length !== files.length || thumbs.some((t) => t === undefined)) throw new Error(`a thumbnail per file: ${thumbs.join()}`);

// A GATE TYPE OF YOUR OWN is CODE, registered by name the way `distinct` is written. A route its `fn` returns that
// it did not declare STOPS the run by name — `UndeclaredRoute` (`FD-R5`): no validator can see it, because only
// running `fn` reveals it.
const sloppy: GateType = { routes: ['keep', 'drop'], defaultRoute: 'keep', fn: () => 'maybe' };
const filter: FlowDefinition = {
  flowId: 'sloppy-filter', version: 1, entry: 'download',
  nodes: [
    { id: 'download', kind: 'task', type: 'Download', edges: [{ to: 'filter' }] },
    { id: 'filter', kind: 'gate', type: 'sloppy', edges: [{ to: 'thumbnail' }, { route: 'drop', to: 'dropped' }] },
    { id: 'thumbnail', kind: 'task', type: 'Thumbnail', edges: [{ to: 'done' }] },
    { id: 'dropped', kind: 'end', outcome: 'dropped' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const second = createRuntime(registry, { gateTypes: { sloppy } }, { base: import.meta.url });
const kinds: string[] = [];
const stopped = await second.start(filter, { name: 'Dark.S01E01.mkv', sizeMB: 1 }, { onRunFailure: (f) => kinds.push(f.kind) }).done;
await second.shutdown();
console.log(stopped.outcome, kinds);                            // stopped [ 'UndeclaredRoute' ]
if (stopped.outcome !== 'stopped' || kinds.join() !== 'UndeclaredRoute' || stopped.gated.length !== 0) {
  throw new Error(`an undeclared route stops the run by name, recording nothing: ${stopped.outcome} ${kinds.join()}`);
}

// A type whose routes are its GATE's — v0.30, ADR 0092. `routesFor` IN PLACE of `routes` and `defaultRoute`: each
// gate's routes come from its OWN settings, so FD-V41 counts each gate against its own — a case left unwired is
// refused at load naming the case. `settingsProblem` says what a settingsSchema cannot (FD-V40).
const byCase: GateType = {
  settingsProblem: (s) => (Array.isArray(s.cases) && s.cases.every((c) => typeof c === 'string') ? null : 'cases is a list of route names'),
  routesFor: (s) => ({ routes: [...(s.cases as string[]), 'other'], defaultRoute: 'other' }),
  fn: (ctx) => (typeof ctx.key === 'string' && (ctx.settings.cases as string[]).includes(ctx.key) ? ctx.key : 'other'),
};
const sorter = (edges: { to: string; route?: string }[]): FlowDefinition => ({
  flowId: 'sorter', version: 1, entry: 'sort',
  nodes: [
    { id: 'sort', kind: 'gate', type: 'byCase', settings: { key: 'kind', cases: ['video', 'audio'] }, edges },
    { id: 'kept', kind: 'end', outcome: 'kept' },
    { id: 'rest', kind: 'end', outcome: 'rest' },
  ],
});
const withByCase = { predicates: [], gateTypes: { byCase } };
const wired = validateDefinition(sorter([{ route: 'video', to: 'kept' }, { route: 'audio', to: 'kept' }, { to: 'rest' }]), withByCase);
if (wired.length !== 0) throw new Error(`every case wired, and the default by an edge with no route: ${JSON.stringify(wired)}`);
const forgot = validateDefinition(sorter([{ route: 'video', to: 'kept' }, { to: 'rest' }]), withByCase);
console.log(forgot.map((f) => `${f.rule} ${f.at}`));        // [ 'FD-V41 sort' ]
if (forgot.length !== 1 || forgot[0]!.rule !== 'FD-V41' || !forgot[0]!.detail.includes('"audio"')) {
  throw new Error(`the unwired case is refused at load, by name: ${JSON.stringify(forgot)}`);
}
const malformed = validateDefinition({ ...sorter([{ to: 'rest' }]), nodes: [{ id: 'sort', kind: 'gate', type: 'byCase', settings: { cases: [1] }, edges: [{ to: 'rest' }] }, { id: 'rest', kind: 'end', outcome: 'rest' }] }, withByCase);
if (malformed.map((f) => f.rule).join() !== 'FD-V40') throw new Error(`settingsProblem's message is FD-V40: ${JSON.stringify(malformed)}`);
```

**What the snippet cannot show, and you need:**

- **Test the COUNT, never the winner.** On an inline pool the first file to reach a gate is almost always the
  first file in the list, so a test that names it passes for the wrong reason and fails the day a pool is threaded
  ([Q379](doc/questions/q379.md)). If a test must show that *first to arrive* is not *first in the list*, ARRANGE
  the arrival order — `examples/l6.ts` does it with the files' sizes, on a pool as wide as the map — and assert
  what the arrangement did beside the claim.
- **The memory is per RUN, not per region instance.** A gate inside a nested `map` remembers across every outer
  item; there is no per-season scope. It forgets at the run's end — deduplicating across RUNS is your store's job.
- **A gate's type must be the PURE function of its context** a decision predicate is asked to be
  ([Q9](doc/questions/q9.md)): a resume replays every stored decision through `fn` to rebuild the memory, and a
  type that answered differently the second time is refused `diverged`. An ENTRY gate's type is also asked once more
  at `start()`, against an empty throwaway memory, to hold the payload to the target it chooses (`FD-R4`,
  [Q387](doc/questions/q387.md)).
- **Keep your gate's memory in the gate.** A decision predicate that remembers in a closure looks like a gate and is
  not one: its memory lives in your process, a resume cannot rebuild it, and a run killed before its first decision
  resumes WRONG in silence ([Q386](doc/questions/q386.md)).
- **`checkWiring` reads a route's GUARANTEE, where its type declares one.** A gate type may name the routes on
  which its key path resolved — `distinct` names `first` and `duplicate` — and what leaves the gate on such a
  route is what arrived with `required` added along the gate's key path, at every step. So a worker after `first`
  that REQUIRES the key `fits`. *It read `no` there until v0.25, which is [Q391](doc/questions/q391.md) and is
  [ADR 0068](doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md).*
- **A type's routes may come from its GATE — v0.30.** A gate type declares `routes` and `defaultRoute`
  (`keyResolvedRoutes` beside them) as `distinct` does, OR `routesFor(settings)` returning
  `{ routes, defaultRoute, keyResolvedRoutes? }` for one gate — exactly one of the two; both or neither is
  `GateTypeRefused`. `GateType` is `StaticGateType | DerivedGateType`, so code that READS `type.routes` off a
  `GateType` gets `readonly string[] | undefined`: ask `routesOf(type, settings)`, which returns the gate's set or
  a `{ problem }` and never throws. `routesFor` is asked once per gate at load, after its settings passed, and
  once per gate by each driver — keep it the pure function of its settings `fn` is of its context. A throw or a
  malformed set is `FD-V39` at that gate; a message from `settingsProblem` is `FD-V40`
  ([ADR 0092](doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md)).
- **A route that guarantees something else guarantees nothing a check can use.** A type declaring no
  `keyResolvedRoutes`, a gate naming no `key`, and a route the type does not name each pass the value through
  exactly as before — and the guarantee is PRESENCE along the path, never the leaf's TYPE, which is the type's own
  judgement (`distinct` wants a string or a finite number, and no static tool derives that).

### Routing with NO code — the built-in `if` and `switch`

**A gate need not remember anything.** Since `spec/flow-definition.md` v0.31
([P32](doc/plans/p32-what-a-gate-may-decide-without-memory.md), [W154](doc/work-items/w154-the-built-in-if-and-switch.md))
two more types are built in, and they route the value that reached the gate by its SETTINGS alone — so a flow can
route its ENTRY payload, or the value straight after a gate, with no worker before the decision and nothing
registered:

| | `if` | `switch` |
|---|---|---|
| **settings** | `{ when }` — a comparison or a flat `all`/`any` group, section 4's grammar, whose paths start at **`input`**: the value that reached the gate | `{ key, cases }` — `key` a key path as `distinct`'s, `cases` a map from a CASE NAME to a scalar or a non-empty array of scalars |
| **routes** | `then`, and `else` — the DEFAULT, so an edge with no `route` is the fallback | every case name, then `default` — the DEFAULT. So a case left unwired is refused at load, NAMING the case (`FD-V41`) |
| **matches** | `when` holds over `{ input }`, by the evaluator a task edge's `when` uses — the same operators, absent rule, `default` and `length` | the case one of whose values is `===` the resolved key: `"1"` and `1` are two values, and a value in two cases is refused at load |
| **refused at load (`FD-V40`)** | a registered predicate NAME (a gate has no outcome to hand it), a root other than `input` — or `input` alone — and every `when` defect section 4 refuses, named | a case named `default` or outside the route charset, a value that is not a scalar, an empty array, a value in two cases or twice in one, an empty `cases` |

- **Neither reads the gate's memory**: two branches with one key take the same route at a `switch`, where
  `distinct` sends the second to `duplicate`.
- **`input` is an `if`'s root and nobody else's.** A task's edge still roots at `outcome` and `needs`; `input.x`
  there is `FD-V43`.
- **`switch`'s cases are key-resolved routes** (ADR 0068), so `checkWiring` refines what leaves on a case along
  the key, as it does for `distinct`'s `first`. **An `if` guarantees nothing**: a task after `then` that requires
  the key the condition compared reads `no` against a producer that does not REQUIRE it.
- **Neither has a named export** — `if` and `switch` are words a `const` cannot carry. Reach them as a flow does,
  by name: `BUILT_IN_GATE_TYPES.if`, `BUILT_IN_GATE_TYPES.switch`. A type of your own may not take either name
  (`NameCollision`).

```ts run
import { Driver, fold, liveToken, validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

// The ENTRY is an `if` over the payload; `classify` runs only on the escalated road, and a `switch` routes its
// result. No predicate and no gate type is registered anywhere below.
const flow: FlowDefinition = {
  flowId: 'triage', version: 1, entry: 'triage',
  nodes: [
    { id: 'triage', kind: 'gate', type: 'if', settings: { when: { path: 'input.priority', op: 'gte', value: 5 } },
      edges: [{ route: 'then', to: 'classify' }, { to: 'queue' }] },                       // no route: else, the default
    { id: 'classify', kind: 'task', type: 'Work', edges: [{ to: 'byStatus' }] },
    { id: 'byStatus', kind: 'gate', type: 'switch',
      settings: { key: 'status', cases: { approved: 'approved', rework: ['rejected', 'needs-changes'] } },
      edges: [{ route: 'approved', to: 'publish' }, { route: 'rework', to: 'revise' }, { to: 'review' }] },
    { id: 'queue', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'publish', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'revise', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'review', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// One run per payload, on the twelve-line fake scheduler section 12 explains.
function run(payload: unknown, classified?: unknown): string[] {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const added: string[] = [];
  const failures: string[] = [];
  const scheduler = {
    addTask(task: unknown) { added.push((task as { id: string }).id); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
  };
  const driver = new Driver(flow, {
    runId: 'r', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken,
    workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } },
    onRunFailure: (f) => { failures.push(f.kind); },
  });
  driver.start(payload);
  if (classified !== undefined) for (const fn of listeners.get('task.completed') ?? []) fn({ detail: { id: 'r:classify:-:0', state: 'done', result: classified } });
  if (failures.length) throw new Error(`the run reported ${failures.join(', ')}`);
  const gated = fold(driver.foldInputs()).gated.map((d) => `${d.gateId}:${d.route}`);
  return [...gated, ...added.map((id) => id.split(':')[1]!)];
}

console.log(run({ priority: 2 }));                                       // [ 'triage:else', 'queue' ]
console.log(run({ priority: 7 }, { status: 'needs-changes' }));          // [ 'triage:then', 'byStatus:rework', 'classify', 'revise' ]
if (run({ priority: 2 }).join() !== 'triage:else,queue') throw new Error('priority 2 is below 5: else');
if (run({ priority: '9' }).join() !== 'triage:else,queue') throw new Error('"9" is not a number: no coercion, so else');
if (run({ priority: 7 }, { status: 'approved' }).join() !== 'triage:then,byStatus:approved,classify,publish') throw new Error('approved');
if (run({ priority: 7 }, { status: 'needs-changes' }).join() !== 'triage:then,byStatus:rework,classify,revise') throw new Error('a value in an array case');
if (run({ priority: 7 }, { status: 'pending' }).join() !== 'triage:then,byStatus:default,classify,review') throw new Error('no case: default');

// A case left unwired is refused at LOAD, naming it — the forgotten case an edge chain of comparisons cannot catch.
// (`revise` goes too, or it is unreachable and FD-V11 says so beside it.)
const forgot = { ...flow, nodes: flow.nodes.filter((n) => n.id !== 'revise')
  .map((n) => (n.id === 'byStatus' ? { ...n, edges: [{ route: 'approved', to: 'publish' }, { to: 'review' }] } : n)) } as FlowDefinition;
const found = validateDefinition(forgot, { predicates: [], workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } } });
console.log(found.map((f) => `${f.rule} ${f.at}`));                     // [ 'FD-V41 byStatus' ]
if (found.length !== 1 || found[0]!.rule !== 'FD-V41' || !found[0]!.detail.includes('"rework"')) throw new Error(`the unwired case, by name: ${JSON.stringify(found)}`);
```

**`0.6.0` is BREAKING in four ways, all of them for code that enumerates or matches.** `FlowNode` has a SIXTH kind,
`GateNode` ([Q381](doc/questions/q381.md)), so a `switch` exhaustive over `node.kind` no longer compiles;
`FoldInput` has a new kind, `gated`, so one exhaustive over `input.kind` no longer compiles either; `RunState` has a
new cell, `gated`, so a `RunState` you construct needs it; and a `route` key on the edge of a node that is not a gate
was refused as `FD-V17` and is refused as `FD-V41` — the same document refused under another rule id, so code
matching a finding's `rule` moves. A flow with no gate records no `gated` input and has `gated: []`.

## 20. What a ROUTE buys an AUTHOR — wiring a gate before it runs

**Section 15 showed what a schema buys whoever is wiring a flow. A gate adds something a schema alone
cannot say.** A gate routes by a KEY PATH into the value reaching it — `owner.id`, `series.id` — and two
things follow that an author has to get right before anything runs:

1. **The path has to be one the producer can actually carry.** Misspell it and the key resolves for no
   branch, so every branch takes whichever route the gate's TYPE gives an unresolved key: the run
   completes, having done none of the work the gate guards. Nothing about the document is wrong —
   `owner.ident` is a perfectly good string — so the grammar accepts it, and step 5 below RUNS that
   case rather than describing it. *(Which route an unresolved key takes is the type's judgement, not
   the library's: `FD-V41` requires only that every route a type declares is wired exactly once, and a
   type need not declare a no-key route at all. `distinct` and the `quota` below both do.)*
2. **On the routes where the path DID resolve, the value carries more than its producer promised.** A
   producer may declare `owner` optional; a branch leaving by a key-resolved route has an `owner`, or it
   would not have left that way. A consumer requiring it is correctly wired, and only the route says so.

**`checkWiring` answers both, and it answers them from the gate TYPE's own declaration**
([ADR 0068](doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)):
a type lists the routes on which its key path resolved — `keyResolvedRoutes` — and the library derives
the guarantee from the path. `distinct` declares `first` and `duplicate`; the type below declares two of
its three routes, so the third is the control sitting in the same report.

| the author writes | the check says |
|---|---|
| a key path the producer FORBIDS at any step | **`no`** on every arc leaving by a key-resolved route, naming the gate, the key, the STEP it stopped on, the word the schema itself uses, and the route |
| a key path the producer describes | those arcs carry `required` along the path, so a consumer requiring it **`fits`** |
| the same arc, with the type declaring no guarantee | **`no`** again — *consumer requires "owner", producer does not guarantee it* |
| an arc leaving by a route the type does NOT call key-resolved | its own verdict, unchanged — the refusal is the ROUTE's and not the gate's |

**The type never walks the key path.** The library resolves it and hands the value over as `ctx.key`,
which is why the library can derive what a route guarantees while the type decides what to do with it —
including deciding that a path which resolved to the empty string is not a key, which is one of the two
roads to `nokey` the run below takes.

**The registry, the gate type and the flow are
[`examples/getting-started/quota-registry.ts`](examples/getting-started/quota-registry.ts)**, imported
rather than written out here, for the reason that file's header gives: the session needs a second
observer and a snippet cannot be one, so `test/definition/gate-session.test.ts` asserts the same
verdicts from the same declarations.

```ts run
import { checkWiring, distinct } from 'fyflow-orchestration';
import type { GateType } from 'fyflow-orchestration';
import { createRuntime } from 'fyflow-orchestration/scheduler';
// Everything the session claims lives in ONE module, so a TEST asserts the same verdicts from the same
// declarations — `test/definition/gate-session.test.ts`. A snippet cannot be its own second observer.
import { QUOTA, QUOTA_BASE, QUOTA_FILES, QUOTA_REGISTRY, QUOTA_WIRING, quotaFlow } from '../../examples/getting-started/quota-registry.ts';

// `report` has exactly ONE arc — the one leaving by `within`, the route the quota guards.
const arc = async (key: string) => {
  const verdicts = (await checkWiring(QUOTA_WIRING, quotaFlow(key))).verdicts;
  const mine = verdicts.filter((v) => v.consumer === 'report');
  if (mine.length !== 1) throw new Error(`one arc into report, not ${mine.length}`);
  return mine[0]!;
};

// ---- 1. the author misspells the key. Nothing is wrong with the DOCUMENT. ----
const typo = await arc('ownr.id');
console.log(typo.kind, '—', typo.why);
// no — gate "quota" is keyed on "ownr.id", which the producer's schema FORBIDS at $: the schema forbids
// every key it does not name (additionalProperties: false) and it names file, owner — so route "within"
// can never be taken, and a run may route every branch by another route, doing none of the work this gate guards
if (typo.kind !== 'no') throw new Error(`a forbidden key path is a wiring failure, got ${typo.kind}`);
const NAMED = ['is keyed on "ownr.id"', 'FORBIDS at $:', 'it names file, owner', 'route "within"'];
if (NAMED.length !== 4) throw new Error('the reason names FOUR things and each is asserted');
for (const part of NAMED) {
  if (part === '' || !typo.why.includes(part)) throw new Error(`the reason names the gate, the key, the step, the schema's own words and the route: ${part}`);
}

// ---- 2. one step in, the reason moves with it ----
const deeper = await arc('owner.ident');
if (!deeper.why.includes('FORBIDS at $.owner:') || !deeper.why.includes('it names id, name')) {
  throw new Error(`the STEP it stopped on is where to look: ${deeper.why}`);
}

// ---- 3. the refusal belongs to the ROUTE. `skip` has two arcs and two verdicts at once. ----
const both = (await checkWiring(QUOTA_WIRING, quotaFlow('ownr.id'))).verdicts.filter((v) => v.consumer === 'skip');
console.log(both.map((v) => v.kind));                           // [ 'no', 'fits' ]
// A verdict carries no `route` field (Q410), so the ROUTE is read from the reason the refusal itself
// gives: the `no` arc names `over`, and swapping which routes are key-resolved is caught here.
const refused = both.filter((v) => v.kind === 'no');
if (refused.length !== 1 || !refused[0]!.why.includes('route "over"')) {
  throw new Error('exactly the over arc is refused and its reason says so: ' + both.map((v) => v.kind + ' ' + v.why).join(' | '));
}
if (both.filter((v) => v.kind === 'fits').length !== 1) throw new Error('and the nokey arc, which the type does not call key-resolved, keeps its own verdict');

// ---- 4. spelled right, it fits — and the GUARANTEE is what makes it fit ----
const right = await arc('owner.id');
if (right.kind !== 'fits') throw new Error(`the path the producer describes: ${right.why}`);
const { keyResolvedRoutes: _none, ...noGuarantee } = QUOTA;
const blind = (await checkWiring({ ...QUOTA_WIRING, gateTypes: { quota: noGuarantee as GateType } }, quotaFlow('owner.id'))).verdicts;
const unguaranteed = blind.find((v) => v.consumer === 'report')!;
console.log(unguaranteed.kind, '—', unguaranteed.why);          // no — $: consumer requires "owner", producer does not guarantee it
if (unguaranteed.kind !== 'no' || !unguaranteed.why.includes('does not guarantee it')) {
  throw new Error('with no declared guarantee the same arc is `no`, which is what the declaration buys');
}
// The built-in type declares its own two, which is where this member came from.
if ([...(distinct.keyResolvedRoutes ?? [])].join() !== 'first,duplicate') throw new Error('`distinct` declares first and duplicate');

// ---- 5. and it runs. ONE run, so the quota is shared by every branch. ----
// `base` is the REGISTRY's own url, never the caller's: its worker urls are relative to the module that
// declares them. Point it at the wrong base and the workers cannot load: every task of each such type fails
// naming the worker URL and the load error — on a non-optional node it is parked user_action, so `done` waits
// on a person (W141, Q266) — so this is a line to get right rather than to debug.
const runtime = createRuntime(QUOTA_REGISTRY, { gateTypes: { quota: QUOTA } }, { base: QUOTA_BASE });
const { done } = runtime.start(quotaFlow('owner.id'), { files: QUOTA_FILES });
const state = await done;

console.log(state.outcome, state.gated.map((d) => `${d.key ?? '-'} ${d.route}`));
// completed [ 'ada within', 'ada within', 'ada over', 'grace within', ' nokey', '- nokey' ]
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
const routes = state.gated.map((d) => d.route).sort();
if (routes.join() !== 'nokey,nokey,over,within,within,within') throw new Error(`two within the quota per owner, ada's third over, and two roads to nokey: ${routes.join()}`);
const over = state.gated.filter((d) => d.route === 'over');
if (over.length !== 1 || over[0]!.key !== 'ada') throw new Error('the owner with three files is the one who goes over');
// BOTH roads to `nokey`: a path that RESOLVES to the empty string, which the TYPE refuses, and a path
// that does not resolve at all, which the library never resolved.
const nokeys = state.gated.filter((d) => d.route === 'nokey').map((d) => (d.key === '' ? 'empty' : d.key === undefined ? 'unresolved' : `?${String(d.key)}`)).sort();
if (nokeys.join() !== 'empty,unresolved') throw new Error(`the two roads to nokey are both taken: ${nokeys.join()}`);
// And the work the guarantee licensed actually HAPPENED: the run completing is not evidence on its own.
const did = Object.values(state.nodes).filter((n) => n.nodeId === 'report').map((n) => (n.result as { owner: string }).owner).sort();
if (did.join() !== 'ada,ada,grace') throw new Error(`three reports ran, and each read the owner the route guaranteed: ${did.join()}`);

// ---- and the run the MISSPELLED key gives, which is what being wrong costs ----
const wrong = await (runtime.start(quotaFlow('ownr.id'), { files: QUOTA_FILES })).done;
await runtime.shutdown();
console.log(wrong.outcome, wrong.gated.map((d) => d.route));    // completed [ 'nokey', 'nokey', ... ]
if (wrong.outcome !== 'completed') throw new Error(`the run COMPLETES, which is what makes this worth checking: ${wrong.outcome}`);
if (wrong.gated.some((d) => d.route !== 'nokey')) throw new Error('every branch takes the unresolved route');
if (Object.values(wrong.nodes).some((n) => n.nodeId === 'report')) throw new Error('and NONE of the work the gate guards runs');
```

**What the check does NOT say, each measured rather than assumed.** An **entry gate** takes no verdict at
all — it has no arc, so a key path misspelled there is caught by nothing this report carries
([Q416](doc/questions/q416.md)). A gate wired into a **join** is neither refined nor refused, because a
join's record is built from what arrived AT the gate ([Q415](doc/questions/q415.md)). A container declared
by `enum` or `const` rather than by `properties` can forbid a step in silence ([Q417](doc/questions/q417.md)).
A verdict carries **no `route` field** ([Q410](doc/questions/q410.md)), so which route an arc left by is
read from the reason a refusal gives rather than from the report's shape — which is why step 3 asserts
the reason and not the order. And a type that declares **no** `keyResolvedRoutes` is asked no question
about its key path at all — which is step 4's control, and the reason the declaration is worth writing.

## 21. A flow a UI could have emitted — what a document can say without code

**Sections 4 and 13 gave you the two halves: a `when` that may be DATA and a built-in type that only
transforms. This is what they add up to.** A flow document plus a registry document, and the only
TypeScript is the domain workers and one import of the language adapter the library itself ships.

**What that covers**, which is [P26](doc/plans/p26-what-a-flow-can-say-without-code.md) prediction 3
and [W110](doc/work-items/w110-a-flow-a-ui-could-have-emitted.md)'s to answer:

| what a flow has to say | how, in data | what it costs in code |
|---|---|---|
| **sequence** | `edges: [{ to }]` | nothing |
| **fan-out** at run-time arity | a `map` over a key | nothing |
| **join** | a `join` naming its opener | nothing |
| **selection** — give this node that node's output | `needs` on the consuming node (tier 1) | nothing |
| **decision** | a `when`: a comparison or a flat `all`/`any` group | nothing |
| the same decision, when the question is **outside the subset** | a `when` naming a **registered predicate** | **a function** — this is the half that is not data, which is P26's own framing |
| **the join policy** a run is started with | nothing in the document: it is an argument to `runtime.start`, defaulted to `live-token` | the library's own, or a consumer's |
| **computation feeding a worker** | `transform` on that worker's own node (tier 2) | the **language adapter** |
| **computation feeding a DECISION or a join** | a `Transform` node (tier 3) | the **language adapter** |

**Two narrowings, both measured, because the table above is the interesting part and the honest part
is underneath it.**

1. **Every `transform` names a `lang`, and no language ships registered.** `Registry.languages` is
   EMPTY when absent, so a transform against a registry naming none is `FD-V35`. The adapter is the
   library's own sub-path — `import { jsonata } from 'fyflow-orchestration/jsonata'` — so it is one
   import and one object entry with no logic in it, but it is not nothing and it is not a domain
   worker. **A flow that only SELECTS needs no adapter; a flow that COMPUTES does.**
2. **A comparison reads ONE path and compares it to ONE literal.** It cannot name a second path and
   it cannot do arithmetic, so *is the mean below the threshold this run carries* is not a comparison.
   **The route around it is data**: a tier-three `Transform` node computes the answer and the `when`
   reads `outcome.result.<field>`. That is what the flow below does, and it is the one place the
   three-tier rule's *reshape for … a decision* is load-bearing rather than advisory — a `transform`
   transforms its node's INPUT and a decision reads its node's OUTPUT, so moving the computation onto
   the consuming node would leave the decision unable to see it.

> **A comparison whose `value` is meant to be a path is NOT refused** — `{ "op": "eq", "value":
> "needs.cfg.threshold" }` is a perfectly good string comparison against the literal text, and it is
> false for ever. The grammar catches a wrong ROOT (`FD-V43`) and nothing catches this
> ([Q456](doc/questions/q456.md)). Write the literal, or compute the comparison in a `Transform` node.

> **This flow is `examples/flows/ui-emitted.flow.json` and this registry is
> `examples/ui-registry.json`, with the SCHEMAS reduced to what these three verdicts turn on.** The
> nodes, the edges, the `needs`, both transforms and both groups are the shipped document's; the
> worker entries carry two schemas each instead of the corpus's full set, because the point here is
> which arcs are checked and not what the corpus declares. **Nothing compares the two copies** — a
> check would have to hold a TypeScript literal against a JSON document, where `X8` has byte-equality
> to work with and this has none — so they are two copies and this sentence is what says so
> ([Q458](doc/questions/q458.md)). The shipped pair is what ladder L6 RUNS, on real workers, in both
> runtimes; this is what a reader can read.

```ts run
import { checkWiring, validateDefinition, type FlowDefinition, type Registry } from 'fyflow-orchestration';
// **The ONE import that is code**, and it is the library's own sub-path rather than anything you write.
import { jsonata } from 'fyflow-orchestration/jsonata';

// ---- the flow a UI emits. No predicate names it, and nothing here is a function. ----
const flow: FlowDefinition = {
  flowId: 'ui-emitted', version: 1, entry: 'intake',
  nodes: [
    { id: 'intake', kind: 'task', type: 'SplitWorker', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'items', branch: 'rate' },
    { id: 'rate', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'gather' }] },
    { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'rollup' }] },
    // TIER THREE — the computation a comparison cannot express, as a node with NO worker.
    {
      id: 'rollup', kind: 'task', type: 'Transform',
      needs: { joined: '.', cfg: 'intake' },
      transform: {
        lang: 'jsonata',
        expr: '( $s := [joined.*.score]; { "n": $count($s), "total": $sum($s), "mean": $sum($s) / $count($s), '
          + '"weak": ($sum($s) / $count($s)) < (cfg.confidence * 100) } )',
      },
      edges: [
        // A flat GROUP, and both members decide: `weak` on one payload, `n` at one item.
        { when: { all: [{ path: 'outcome.result.weak', op: 'eq', value: true }, { path: 'outcome.result.n', op: 'gte', value: 2 }] }, to: 'remediate' },
        { when: { any: [{ path: 'outcome.result.n', op: 'eq', value: 1 }, { path: 'outcome.result.weak', op: 'eq', value: false }] }, to: 'publish' },
        // The third edge is a TRIPWIRE: a wrong group lands at a named `end` rather than falling through.
        { to: 'stalled' },
      ],
    },
    // TIER TWO — a transform on the node whose worker consumes it, so no extra task.
    {
      id: 'remediate', kind: 'task', type: 'WeighWorker',
      transform: { lang: 'jsonata', expr: '{ "item": { "word": "mean", "confidence": mean / 100 }, "run": { "confidence": 1 } }' },
      edges: [{ when: { path: 'outcome.result.score', op: 'lt', value: 20 }, to: 'escalated' }, { to: 'done' }],
    },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'escalated', kind: 'end', outcome: 'escalated-to-a-person' },
    { id: 'stalled', kind: 'end', outcome: 'no-branch-matched' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// ---- the registry it names. `Transform` is NOT in it: a built-in is merged at every read. ----
const registry: Registry = {
  // **EMPTY, and that is the claim.** A declared `when` resolves nothing against this.
  predicates: [],
  workers: {
    split: {
      url: './split.ts',
      outputSchema: {
        type: 'object', required: ['confidence', 'items'],
        properties: {
          confidence: { type: 'number' },
          // The ITEM's own shape, so the arc into the map is checked — without it that arc is
          // `unchecked` for a reason that has nothing to do with the transform node.
          items: { type: 'array', items: { type: 'object', required: ['word', 'confidence'], properties: { word: { type: 'string' }, confidence: { type: 'number' } } } },
        },
      },
    },
    score: {
      url: './score.ts',
      inputSchema: { type: 'object', properties: { word: { type: 'string' }, confidence: { type: 'number' } } },
      outputSchema: { type: 'object', required: ['score'], properties: { score: { type: 'number' } } },
    },
    weigh: { url: './weigh.ts', inputSchema: { type: 'object', properties: { item: { type: 'object' }, run: { type: 'object' } } } },
    publish: { url: './publish.ts' },
  },
  nodeTypes: {
    SplitWorker: { worker: 'split' }, ScoreWorker: { worker: 'score' },
    WeighWorker: { worker: 'weigh' }, PublishWorker: { worker: 'publish' },
  },
  // The one thing that is code: the adapter for the language the transforms name.
  languages: { jsonata },
};

const findings = validateDefinition(flow, registry);
console.log(findings.length);                               // 0
if (findings.length !== 0) throw new Error(`a UI-emitted flow validates with NO predicate registered: ${JSON.stringify(findings)}`);

// **The registry really is empty** — an unused empty map would prove nothing (W110's careful-point 1).
if ((registry.predicates as readonly string[]).length !== 0) throw new Error('no predicate is registered anywhere');

// ---- and what the author gets told about the wiring, which is where the residue is ----
const report = await checkWiring(registry, flow);
console.log(report.counts);                                 // { fits: 1, no: 0, ..., unchecked: 3 }
// `intake -> rate` is the one arc neither end of which is the transform node, and it FITS.
const leaving = report.verdicts.filter((v) => v.producer === 'rollup').map((v) => v.kind);
console.log(leaving);                                        // [ 'unchecked', 'unchecked' ]
if (leaving.length !== 2 || leaving.some((v) => v !== 'unchecked')) {
  throw new Error(`both arcs LEAVING the transform-only node are unchecked — it declares no outputSchema, which is Q446: ${JSON.stringify(leaving)}`);
}
// The arc INTO it is unchecked for the mirror reason — no inputSchema — so the residue is THREE arcs.
if (report.counts.unchecked !== 3) throw new Error(`three arcs touch the node and all three are unchecked: ${report.counts.unchecked}`);
// And the arcs that do not touch it are checked as any other arc is, so the residue is LOCAL to the node.
if (report.counts.fits !== 1 || report.counts.no !== 0) throw new Error(`the rest of the flow is checked as usual: ${JSON.stringify(report.counts)}`);
```

**What the check cannot tell you here, said rather than left to be discovered.** Every arc LEAVING a
transform-only node is `unchecked`, because the node declares no `outputSchema` and a sample is
evidence about one input where `fits` is a claim about every input
([Q446](doc/questions/q446.md), and [ADR 0075](doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)
rule 6 is why it is not inferred). `sampledOutput` in the assists gives you the shape the node
actually emitted on the producer's own example, with those verdicts beside it — so the residue is
reported rather than hidden. And a declared predicate's PATH is checked against no schema at all, so
a path naming a key the producer cannot emit answers *no match* for ever (ADR 0074 consequence 6).

> **A `Transform` node's realm and its groups are the scheduler's default and nothing else.** The
> built-in declares no `inline`, no `groups` and no `pool`, and a named pool instance carries only
> `type` and `config` — so of the four things ADR 0075 rule 3 lists, a named instance reaches
> `config`, a `retryPolicy` goes on the NODE, and `inline` and `groups` are reachable by no road a
> consumer can write ([Q457](doc/questions/q457.md)). Measured at W110.
