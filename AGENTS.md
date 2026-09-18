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
them. `createRuntime` builds every pool, group and scheduler the registry names and hands back a
`Driver` per run. **The only code you write is the worker**:
`examples/getting-started/worker.ts`, a class with a `run` method and nothing else — no base class,
no import. Everything below is executed by the gate on every `npm run gate`, and the same snippet is
in `README.md`, held byte-equal to this one by `check-docs`'s `X8`
([W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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

// A run is over when its own fold says so AT A QUIESCENT POINT — which is what the `queueMicrotask`
// below buys, and it is load-bearing rather than decoration. The driver dispatches the next node
// synchronously inside the same listener turn, so folding the instant an input arrives can report a
// terminal state with the run still going; `RN-R12` claims its predicate at rest. `start` hands back
// a `Driver`, already running; every fold input it reports is appended, and the run state is a pure
// fold over that sequence.
const inputs: FoldInput[] = [];
const state = await new Promise<RunState>((resolve, reject) => {
  runtime.start(flow, { text: 'hello' }, {
    onFoldInput: (input) => {
      inputs.push(input);
      queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); });
    },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
});
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

**Five** node kinds. A definition is JSON: no functions, so it can be stored, versioned and sent over
a wire.

> **`map` is the fifth, and since [W33](doc/work-items/w33-a-map-at-run-time-arity.md) a `Driver`
> RUNS one.** It is a valid definition since `spec/flow-definition.md` v0.8 —
> [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md),
> answering [Q12](doc/open-questions.md): a `fanout` declares N branches known at authoring time, a
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
> [Q11](doc/open-questions.md) and [Q36](doc/open-questions.md) were deliberately held so the rule
> would be written from cases rather than from a mechanism.)*
>
> **This paragraph is the minimum that is not false and is not the feature write-up.** It read
> *"NOTHING DISPATCHES ONE YET"* until W33, which is [Q157](doc/open-questions.md)'s second
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
      { when: 'isLowConfidence', to: 'review' }, // guarded by a registered predicate
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

**A `task` node must have an edge that can be taken when it succeeds.** A node whose only edge is
`{ when: 'p', to: 'x' }` is refused at construction — it is the mistake the format most invites, and
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
answering [Q11](doc/open-questions.md). It is an optional object on a `task` or a `map`, mapping the
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
      { when: 'isLowConfidence', to: 'review' },
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

There are **34 refusals** over the id range `FD-V1` … `FD-V38` *(35 over `FD-V1` … `FD-V37` until W65 retired `workerType` and with it `FD-V5` and `FD-V34`, adding `FD-V38`; 32 over `FD-V1` … `FD-V34` until W61 added the three transform rules; 29 over `FD-V1` … `FD-V31` until W59 added the three node-type rules — and this sentence stood at 29 twelve lines below the table W59 rewrote, until its conformity reader read the two together)*, each with a failing example in
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

**An edge names a predicate; it does not carry one.** The definition stays data, and an unknown name
fails at construction rather than mid-run.

```ts run
import { eligibleEdges, selectEdge, type FlowNode, type Predicate } from 'fyflow-orchestration';

const node: FlowNode = {
  id: 'score', kind: 'task', type: 'ScoreWorker',
  edges: [{ when: 'isLowConfidence', to: 'review' }, { to: 'publish' }],
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
answering [Q8](doc/open-questions.md).

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
      { when: 'flaggedEarlier', to: 'review', needs: { earlier: 'ingest' } },
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
      ? { ...n, edges: [{ when: 'flaggedEarlier', to: 'review', needs: { x: '.' } }, { to: 'publish' }] }
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
`regions[…].joined === false` whether or not you registered that callback.

```ts run
import {
  liveToken, liveTokenRequiringArrival,
  type JoinPolicy, type Region, type RegionEvent,
} from 'fyflow-orchestration';

const region: Region = { fanoutId: 'split', joinId: 'collect', branches: ['a', 'b'], members: [] };
const everyBranchExits: RegionEvent[] = [
  { type: 'branch.opened', regionId: 'split', branchPath: '0' },
  { type: 'branch.opened', regionId: 'split', branchPath: '1' },
  { type: 'branch.exited', regionId: 'split', branchPath: '0', at: 'stop' },
  { type: 'branch.exited', regionId: 'split', branchPath: '1', at: 'stop' },
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
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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
const inputs: FoldInput[] = [];
const state = await new Promise<RunState>((resolve, reject) => {
  runtime.start(flow, {}, {
    onFoldInput: (input) => { inputs.push(input); queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); }); },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
});
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

*(This section read **"`null`, currently … this is [Q36](doc/open-questions.md) and it is open"**
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
import { fold, isTerminal, type FlowDefinition, type FoldInput, type Predicate, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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
      edges: [{ when: 'isLowConfidence', to: 'review' }, { to: 'split' }] },
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
const run = (payload: unknown) => new Promise<RunState>((resolve, reject) => {
  const inputs: FoldInput[] = [];
  runtime.start(flow, payload, {
    onFoldInput: (input) => { inputs.push(input); queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); }); },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
});
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
> rule 2; the scheduler's own reference does not document it for the ordinary path.

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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
const driver = runtime.start(flow, {}, { onFoldInput: (input) => { inputs.push(input); } });

const state = await new Promise<RunState>((resolve, reject) => {
  // A DEADLINE, because this is the one snippet whose subject is a run that does not end by
  // itself: without it a wrong guess about the vocabulary below hangs for ever and the failure
  // names nothing. W71's adequacy reader broke `suspended` and got a 30-second timeout.
  const deadline = setTimeout(() => reject(new Error('the run never reached a terminal state')), 10_000);
  const poll = () => {
    const s = fold(inputs);
    if (s.outcome === 'awaiting_action' && parked === null) {
      parked = Object.keys(s.nodes).find((id) => s.nodes[id].state === 'suspended') ?? null;
      if (parked === null) { clearTimeout(deadline); reject(new Error('awaiting_action with no suspended node')); return; }

      // ONE pair of events, ONE record. The scheduler dispatches `task.failed` AND
      // `task.user_action` carrying the same object; the driver drops the first, whose detail
      // already reads `user_action`, and records on the second. Read off a REAL pair, not a
      // hand-delivered one.
      const records = driver.snapshot().filter((r) => r.taskId === parked);
      if (records.length !== 1) throw new Error(`the event pair produced ${records.length} records`);

      // The only way anything outside this process changes a run — and it takes THREE arguments.
      // `actor` is opaque: never interpreted, never authenticated (Q29).
      const accepted = driver.resolve(parked, 'failed', { actor: 'a-person' });
      const again    = driver.resolve(parked, 'failed', { actor: 'a-person' });
      if (!accepted || again) throw new Error('a second resolution must be refused, not applied twice');
    }
    if (isTerminal(s)) { clearTimeout(deadline); resolve(s); return; }
    setTimeout(poll, 5);
  };
  poll();
});
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

const settled = (taskId: string, state: 'done' | 'failed' | 'user_action'): FoldInput => ({
  kind: 'outcome',
  record: { kind: 'outcome', taskId, terminalState: state, result: null, error: null,
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1 },
});

const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const ended = (reason: 'end' | 'no-eligible-edge'): FoldInput =>
  ({ kind: 'pathEnded', reason, at: 'x' });
const openJoin: FoldInput =
  { kind: 'joinSettled', regionId: 'split', joinId: 'collect', fired: false };

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
  ['stopped',         [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       { kind: 'stopped', reason: 'DuplicateTaskId: x' }]],
];
for (const [expected, inputs] of rows) {
  const got = fold(inputs).outcome;
  console.log(expected, '->', got);
  if (got !== expected) throw new Error(`precedence: expected ${expected}, got ${got}`);
}

// `isTerminal` is false for exactly `running` and `awaiting_action`.
const terminal = Object.fromEntries(rows.map(([o, i]) => [o, isTerminal(fold(i))]));
console.log(terminal);   // completed/failed/stuck/stopped true, running/awaiting_action false
if (!terminal.stuck) throw new Error('`stuck` is terminal — that is the point of it existing');
if (terminal.running || terminal.awaiting_action) throw new Error('a live run is not terminal');
if (!terminal.completed || !terminal.failed || !terminal.stopped) {
  throw new Error('completed, failed and stopped are all terminal');
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

### The six outcomes, highest first

| | means |
|---|---|
| `stopped` | a refusal terminated the run — section 9 |
| `awaiting_action` | a node is suspended and nobody has resolved it |
| `running` | a dispatched node has not settled |
| **`stuck`** | nothing is live and **nothing ever will be**: a join has not fired and cannot |
| `failed` | a path ended with no eligible edge |
| `completed` | every live path reached an `end` node |

**Read the outcome at a quiescent point** — after the driver's turn, not part-way through it. The
fold is defined over any prefix, and a prefix taken mid-turn is not a resting state: a settlement is
recorded before the routing it causes, so there are instants where nothing is running and the run is
not over. If you fold `driver.foldInputs()` after the fact you are always at a quiescent point; if
you fold incrementally from `onFoldInput`, read on a `queueMicrotask`.

**`isTerminal(state)` is how you wait for a run without a clock.** It is false for `running` and
`awaiting_action` and true for everything else — including `stuck`, which is the point: before
`stuck` existed, a permanently hung run folded to `completed` and a waiter reported success.

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
calls that resolver first — section 12), and by the bootstrap helper before it builds a pool. None is
`InvalidDefinition`, on purpose: a registry defect is fixed in the registry and a flow defect in the
flow, and the class says which document to open.

**And three the RUNTIME adds, all `RuntimeError` subclasses from `fyflow-orchestration/scheduler`**
(W66): `GroupUnusable` — a group factory returned something the scheduler cannot use, naming the
member and the group's key; `GroupNotBuildable` — a group type with no `create`; `LanguageNotBuilt` —
`start` was given a flow that transforms on a type no pool was built for. A bare `RuntimeError` is
the fourth road: a relative worker url with no `base`, and a predicate or adapter supplied that the
document names nowhere. **They are not exported from the package ROOT**, so the enumeration below —
which walks the root's own exports — does not see them, and `BootstrapError` has never been there
either.

**Two more that throw, because you called them.** They are the same classes the next paragraph calls
reported, which is why the rule is about the stack:

| | |
|---|---|
| `driver.start()` a **second time** | throws `MultipleRuns` — a driver serves one run and its id was fixed at construction (`ID-R3`) |
| `driver.resolve()` with a `result` that is not structured-cloneable | throws the platform's own `DataCloneError`, **not** `UncloneableResult`, and the run is not stopped |

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
[Q104](doc/open-questions.md); here the snippet simply does not give `X4a` a `throw` that is not
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
on `DriverOptions` or `RuntimeOptions` turns both off. Never per settlement: what a worker returns is
checked at authoring time by `npm run check:workers` and by the wiring check (section 13), not by the run.

*(This paragraph read *"`UnresolvedBranchPath` is the tenth class, and it belongs to a feature nothing
dispatches yet … no `Driver` opens one"* until W33, which is the item that made it run.
[Q157](doc/open-questions.md) is the gap behind both edits: no
[P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) item owns this file, and W35 is the natural
owner of describing the feature rather than merely not lying about it.)*

**And the list is checked against the PACKAGE, not against itself** — [Q101](doc/open-questions.md).
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
  ConfigRefused, DerivationRefused, DuplicateTaskId, GroupConfigRefused, GroupTypeMissing, InvalidDefinition,
  InvalidRunId, InvalidTaskId, MissingJoinPolicy, MultipleRuns, NameCollision, NameMissing, NoMatchingEdge,
  PoolTypeMissing, RegistryError, SchemaRefused, TypeDefaultRefused, UncloneableResult, UndeclaredKey,
  UndispatchedTask, UnresolvedBranchPath, UnresolvedMapArity, UnresolvedReference, WorkerMissing,
} from 'fyflow-orchestration';

const documented = [
  DuplicateTaskId, UncloneableResult, NoMatchingEdge, UndispatchedTask,  // reported inside a listener
  MultipleRuns, InvalidRunId, InvalidDefinition, MissingJoinPolicy,      // thrown at you
  RegistryError, WorkerMissing, PoolTypeMissing, ConfigRefused, TypeDefaultRefused, GroupTypeMissing,   // thrown at you — a REGISTRY defect,
  GroupConfigRefused, NameCollision, SchemaRefused, UndeclaredKey, NameMissing, DerivationRefused,       // the base class and its eleven (section 13)
  UnresolvedMapArity, UnresolvedReference,   // reported in a listener; reported AND thrown from start()/resolve()
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
  flow is between every step. It is not "the run finished". Use `isTerminal(fold(...))`.
- **Reading run state mid-turn.** Section 8.
- **Retaining a scheduler event's `detail`.** It is the live task object and it mutates — including
  its `timestamp`, so a retained detail reports the *most recent* event's time. `{...e.detail}` is
  **not** compliance: it still aliases `result` and `error`. The driver copies at the listener
  boundary, so the four values that carry the run — records from `snapshot()`, inputs from
  `foldInputs()` and `onFoldInput`, and events from `onRegionEvent` — are **frozen copies**, safe to
  hold. **The other accessors return copies that are not frozen** (`dispatchedIds()`,
  `regionsForPolicies()`, `effectiveOutcomeOf()`, `terminalStateOf()`): writing to one changes
  nothing in the driver, but it is not a document to edit and hand back.
- **Returning a CLASS INSTANCE from a worker.** It does not throw and it does not arrive intact.
  `structuredClone` copies the fields and drops the prototype, so the next node receives a plain
  object: `instanceof` is false, the methods are gone, and **nothing is reported** — `OR-R11` in
  `spec/outcome-record.md` section 4. **Return data, read data.** The loud half is a result that
  cannot be cloned at all (a function, a `Promise`, a `WeakMap`), which stops the run with
  `UncloneableResult`; this is the quiet half, and it is the one people hit.
- **Assuming `joinStatusOf().describe` is yours.** It is whatever **your** policy's `describe()`
  returned. The two shipped policies return a fresh object; a policy that returns its own state hands
  you that state, and writing to it changes what the join decides. Return a copy from `describe()`
  — [Q82](doc/open-questions.md).

The first half of that is executed rather than asserted:

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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
const HANDLES = ['onFoldInput', 'snapshot', 'foldInputs'];

// **`onRegionEvent` is a `Driver` option the RUNTIME DOES NOT FORWARD**, so a consumer on this road
// cannot watch a region open and close at all. That is asserted here rather than stated, because a
// sentence listing what `StartOptions` carries is a claim about a list in the source that nothing
// compares it to — and the first version of this comment got that list wrong ([Q297](doc/open-questions.md)).
// The cast is what a consumer would have to write to try, and the count below is what they would get.
let regionEvents = 0;
const options = {
  onFoldInput: (i: FoldInput) => { frozen.onFoldInput = Object.isFrozen(i); inputs.push(i); },
  onRegionEvent: () => { regionEvents += 1; },
};
const driver = runtime.start(flow, {}, options as Parameters<typeof runtime.start>[2]);

await new Promise<RunState>((resolve, reject) => {
  // A poll needs a DEADLINE, and this one is a consumer's to copy: without it a run that never
  // becomes terminal hangs for ever and the failure names nothing at all.
  const deadline = setTimeout(() => reject(new Error('the run never reached a terminal state')), 10_000);
  const poll = () => {
    const s = fold(inputs);
    if (isTerminal(s)) { clearTimeout(deadline); resolve(s); return; }
    setTimeout(poll, 5);
  };
  poll();
});
await runtime.shutdown();

// The two PULL handles, read after the run — and each must have handed back something, because
// `Object.isFrozen([])` is true for free and an empty answer would pass while asserting nothing.
const snapshot = driver.snapshot();
const foldInputs = driver.foldInputs();
if (snapshot.length === 0 || foldInputs.length === 0) throw new Error('a pull handle returned nothing, so freezing it says nothing');
frozen.snapshot = Object.isFrozen(snapshot) && snapshot.every(Object.isFrozen);
frozen.foldInputs = Object.isFrozen(foldInputs) && foldInputs.every(Object.isFrozen);

console.log(frozen, regionEvents);   // all three true, and 0
for (const [name, isFrozen] of Object.entries(frozen)) {
  if (!isFrozen) throw new Error(`${name} handed out something you can write to`);
}
if (Object.keys(frozen).sort().join() !== HANDLES.slice().sort().join()) {
  throw new Error(`expected exactly ${HANDLES.join()}, saw ${Object.keys(frozen).sort().join()}`);
}
if (regionEvents !== 0) throw new Error(`onRegionEvent fired ${regionEvents} times, so the runtime forwards it now and this comment is stale`);
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
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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
const run = (flow: FlowDefinition) => new Promise<RunState>((resolve, reject) => {
  const inputs: FoldInput[] = [];
  const deadline = setTimeout(() => reject(new Error(`${flow.flowId} never reached a terminal state`)), 10_000);
  runtime.start(flow, {}, {
    onFoldInput: (input) => {
      inputs.push(input);
      queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) { clearTimeout(deadline); resolve(s); } });
    },
    onRunFailure: (f) => { failures.push(f.kind); },
  });
});

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
await run(loud).catch(() => undefined);
await runtime.shutdown();
console.log(failures.join());                            // 'UncloneableResult'
if (failures.join() !== 'UncloneableResult') throw new Error(`the loud half reported ${failures.join() || 'nothing'}`);
```

## 11. What does NOT exist — do not write code using it

| not available | instead |
|---|---|
| flow-level **retry** — re-dispatching a NODE under a new attempt, possibly routing elsewhere | **task-level retry IS built** since [W58](doc/work-items/w58-what-a-node-says-about-its-own-task.md): declare `retryPolicy` on the node (section 3) and the scheduler retries inside the same task id, reported on the record's `attempts`. Re-dispatching the node is [Q16](doc/open-questions.md)'s other half and the task id's fourth segment, and nothing mints one |
| **cancellation** | nothing. The scheduler cannot cancel a queued task either |
| **durability** — resuming a run after a restart | nothing. The fold is designed to make it additive; it is not built |
| **nested fan-out** — a branch that fans out again | **built, and the join over it is settled.** `FD-V15` is retired; a task inside a nested region is dispatched at its whole dotted `branchPath` (`r1:scoreC:1.0:0`); and every policy in section 5 is **transitive** — each region answers exactly as it would if it were not nested ([ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)). One thing to know: if an inner join is reported through `onUnsatisfiableJoin`, the outer branch containing it **ends** rather than waiting, so the outer join may still fire and its successor may run — and once that work settles the run folds to `stuck`, because a region that never fired is what `stuck` reads. **Fold too early and you will see `running`.** The four matrix rows and the join seam are tested at **depth 2**; the dead-join cascade is asserted at depth 3, and nothing else about depth 3 is a tested claim |
| ~~**map-style fan-out**~~ — **BUILT** since [W33](doc/work-items/w33-a-map-at-run-time-arity.md); see section 3 |
| a **join timeout** | nothing. A stuck join is detected by the `stuck` outcome, with no clock |
| **per-join policy choice** | one policy per driver |
| a **declared event family** for `fyflow-react-components` | `onRegionEvent`, `onFoldInput` and `joinStatusOf()` — see below |

**On that last row.** Flow structure is invisible to the *scheduler*, so a UI wired only to a
scheduler cannot show which node a run is at, which branch it took, or what a join is waiting on.
That is [Q21](doc/open-questions.md), and it is about the scheduler's stream, not about this
library — **this library does expose all three.** `onFoldInput` is the push half of `foldInputs()`,
so you can fold incrementally and see a run finish without polling; `onRegionEvent` reports branches
opening, arriving, exiting, suspending and resuming; `joinStatusOf()` answers what a join is waiting
on. What is missing is an agreed envelope shape between the two repositories, not the data.

---

## 12. Wiring it to a real scheduler

**The short way is a registry DOCUMENT and one call** — `createRuntime` in
`fyflow-orchestration/scheduler`, [W66](doc/work-items/w66-the-runtime-entry.md). It resolves every
name the document uses against the code you supply, refuses every defect at construction by a named
error, builds one pool per type instance and one object per group, holds a `FyflowScheduler` over
them, and hands you a `Driver` per run. **What stays yours is exactly what is code**: predicates,
language adapters, custom group types and custom node-type classes, in one `code` argument.

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';

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
// scheduler drains (section 8). `start` returns a `Driver`, already started.
const inputs: FoldInput[] = [];
const state = await new Promise<RunState>((resolve, reject) => {
  const driver = runtime.start(flow, { confidence: 0.9 }, {
    onFoldInput: (input) => {
      inputs.push(input);
      queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); });
    },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
  // **`driver.runId` is readable** (W66): the runtime minted this run's id, and every task id of the
  // run begins with it. Pass your own as `start`'s `runId` when you need to choose it.
  if (!/^r\d+$/.test(driver.runId)) throw new Error(`expected a minted run id, got ${driver.runId}`);
});
const pools = Object.keys(runtime.pools).sort();
await runtime.shutdown();

if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
// One pool per type instance, keyed by the name the document uses — that is what a node's `type` names.
if (pools.join() !== 'Ingest,Publish') throw new Error(`pools: ${pools.join()}`);
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
import { fold, isTerminal, type FlowDefinition, type FoldInput, type RegistryDocument, type RunState } from 'fyflow-orchestration';
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

const inputs: FoldInput[] = [];
const state = await new Promise<RunState>((resolve, reject) => {
  runtime.start(flow, { text: 'hello' }, {
    onFoldInput: (input) => { inputs.push(input); queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); }); },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
});
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

**If a flow transforms, tell the runtime about it.** A language adapter's worker half is written
into a pool's config at construction, and only for the types whose nodes transform (section 13), so
pass every flow the runtime will run: `createRuntime(registry, code, { base, flows: [flow] })`. A
flow handed to `start` that transforms on a type no pool was built for is refused there, naming the
type and the language, rather than failing every task of that node one run in.

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
was [Q71](doc/open-questions.md), a defect in our type and not in yours, and it is closed:
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
and Deno and not in the browser, and the browser rung is [Q52](doc/open-questions.md).

**Pin the scheduler at 0.5.2.** This library's listener boundary is written against **0.3.0
semantics, which neither 0.5.1 nor 0.5.2 changes**: `task.progress`'s detail changed shape at 0.3.0 (the id is
`id`, not `taskId`), the second `task.user_action` dispatch site arrived there, and `task.timestamp`
did not exist before it. **`core/FyflowScheduler.ts` is byte-identical between 0.3.0, 0.5.1 and 0.5.2**, so
every one of those still holds; what 0.5.1 added is a `worker.setup.*` / `worker.teardown.*` event
family this library subscribes to not at all. Install it from a registry — npm and JSR both carry it —
and **never from a working tree**, which is
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
superseding [ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 3 and 5. **The manifests say the same thing**, since
[ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md):
`package.json` names it in `peerDependencies` at exactly that version and `deno.json` maps it to
`jsr:@fyflow/scheduler` at exactly that version, and `npm run check:scheduler`'s `D8` holds both to
the pin the same way `D7` holds this sentence. *(This read **"pin at 0.3.0 … npm and JSR both stop at 0.2.1, so 0.3.0 is reached from
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
// **Key the listeners by event type.** The driver subscribes to three of them and
// normalizes on the task's terminal STATE rather than the event name (`OR-R3`), so a
// double that fans one settlement to every listener writes THREE records for it and
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
once — **and a second driver on the same scheduler is fine**, because a settlement only reaches the
driver that dispatched it. See section 9.

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
| `type` | **required** | the name of an entry in `nodeTypes` whose `worker` the registry's `workers` declares (`FD-V32`, both clauses). A task with no `type` is `FD-V23` |
| `pool` | optional | the name of an instance in the registry's `pools` whose `type` is this node's (`FD-V38`); absent, the type's DEFAULT instance. The type's own name is that default, stated explicitly |
| `settings` | optional | a plain JSON object which — with the type's `settings` defaults merged UNDER it — the worker's **`settingsSchema`** accepts (`FD-V33`); **absent means the defaults alone**, `{}` when the type declares none, and the schema sees that. A schema is JSON Schema in the built-in subset (ADR 0053): a keyword outside it is refused at construction, never ignored |
| `transform` | optional | `{ lang, expr }`: an expression, in a language the registry's **`languages`** set names, applied to the node's input BEFORE its worker sees it — below. `lang` unregistered is `FD-V35`, `expr` the language refuses is `FD-V36`, not `{ lang, expr }` is `FD-V37` |

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
// The languages and the flows are what tells the helper WHICH typed pools need which adapter's
// worker module — written into a pool's config only where a node of that type transforms (W61).
const registry = { workers: { ingest, scorer }, nodeTypes: { IngestWorker, Scorer } };
const built = bootstrap(registry, { scorer: new ConcurrentLimitGroup(4, 'scorer') }, { languages, flows: [typed] });
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
import { validateDefinition, type FlowDefinition, type LanguageAdapter, type NodeTypeDeclaration, type Registry, type WorkerEntry } from 'fyflow-orchestration';
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
// driven here directly. The helper writes `languages` into a typed pool's config for you when you
// pass it the flows and the languages: `bootstrap(registry, groups, { languages: { path }, flows: [flow] })`.
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
`new Driver` is dispatched as mutated, for every key ([Q259](doc/open-questions.md)). Every one of
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
the engine only where the sub-path is imported (237 KiB). Import it, put it in the registry's
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
const built = bootstrap(registry, { scorer: new ConcurrentLimitGroup(4, 'scorer') }, { languages, flows: [flow] });
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
([Q265](doc/open-questions.md)). Each throws naming itself and the task fails with
`TransformFailed [UNBOUND]`; a computed key is read with `$lookup`, which recompiles nothing. **And the worker receives plain JSON values**: JSONata marks the
arrays it builds with an own `sequence` property that survives `structuredClone` across a thread and
that a deep-equal sees; the adapter strips it at every depth.

**Two things about JSONata itself that decide how you write a reduction.** A path over a join's
record changes TYPE with the region's arity — `*.score` is an array at two matching branches, the
scalar at one, absent at zero ([Q263](doc/open-questions.md)) — so a reduction is written over the
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
URL ([Q261](doc/open-questions.md)), so `jsonata.worker` — like the envelope worker itself — has to be
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
import { checkWiring, describePaths, pathsOf, signatureOf, tryTransform, fold, isTerminal, type FlowDefinition, type FoldInput, type RunState } from 'fyflow-orchestration';
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

// STEP 6 — and only now the runtime. Pools are built ONCE, so a flow whose transform was decided
// during the session has to reach `createRuntime` as `flows`, or `start` throws `LanguageNotBuilt`
// naming the type. Check, then build.
const wired: FlowDefinition = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: good } : n)) };
const runtime = createRuntime(SESSION_REGISTRY, { languages: { jsonata } }, { base: SESSION_BASE, flows: [wired] });
const inputs: FoldInput[] = [];
const state = await new Promise<RunState>((resolve, reject) => {
  runtime.start(wired, { source: 'inbox' }, {
    onFoldInput: (i) => { inputs.push(i); queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) resolve(s); }); },
    onRunFailure: (f) => reject(new Error(`${f.kind}: ${f.message}`)),
  });
});
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
a transform's result changes type with the arity ([Q263](doc/open-questions.md)). **A witness is not
a proof**, and the reference says *the sample passed* rather than *fits* for exactly that reason.
Two more the check knows and a document cannot say: an OPEN producer is read as never emitting a key
it does not name, which is a stated leniency ([Q305](doc/open-questions.md)); and a join successor's
record is the check's own knowledge, because the subset cannot spell *any key, each of shape S*
([Q306](doc/open-questions.md)).

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
and visible at every consumer the wiring check reads ([Q302](doc/open-questions.md)).
