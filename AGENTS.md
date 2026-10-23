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
declared example — or on a value you give it — and holds the result to the consumer's schema, and `signatureOf` turns the same
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
`SchedulerLike` is a structural interface — two methods and an optional `cancel` (section 12) — a real `FyflowScheduler` satisfies it as it is,
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
**a handle** per run — `{ driver, done, header, stop, state, outcome, node }`: the driver already running, and `done` a promise that resolves with
the run's terminal state ([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)). **The only code you write is the worker**:
`examples/getting-started/worker.ts`, a class with a `run` method and nothing else — no base class,
no import. Everything below is executed by the gate on every `npm run gate`, and the same snippet is
in `README.md`, held byte-equal to this one by `check-docs`'s `X8`
([W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';

// THE REGISTRY — what exists. One worker module, and one node type that runs on it. This is data:
// in your program it is a JSON file you import. The worker url is relative to `base` below.
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
// names registry keys only (no files, urls or classes), so it is portable between runtimes.
const flow: FlowDefinition = {
  flowId: 'hello', version: 1, entry: 'greet',
  nodes: [
    { id: 'greet', kind: 'task', type: 'Greeter', settings: { say: 'world' }, edges: [{ to: 'shout' }] },
    { id: 'shout', kind: 'task', type: 'Greeter', settings: { say: '!' },     edges: [{ to: 'done' }] },
    { id: 'done',  kind: 'end',  outcome: 'completed' },
  ],
};

// ONE call builds the pools and the scheduler, and refuses a defective registry here, by name. A
// defect in the FLOW is refused by `start`, below.
const runtime = createRuntime(registry, {}, { base: import.meta.url });

// `start` runs the flow. `done` resolves with the run's final state and never rejects: a run that
// goes wrong arrives as `state.outcome` ('failed', 'stuck', 'halted'), not as a `catch`.
const { done } = runtime.start(flow, { text: 'hello' });
const state = await done;
await runtime.shutdown();

// The previous node's result is the next node's input: `greet` made `hello world`, `shout` added `!`.
const shout = Object.values(state.nodes).find((n) => n.nodeId === 'shout');
console.log(state.outcome);          // 'completed'
console.log(shout?.result);          // { text: 'hello world !' }

// Verified by the docs gate:
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

**Seven** node kinds. A definition is JSON: no functions, so it can be stored, versioned and sent over
a wire.

> **`ask` is the seventh, and it is a node that WAITS FOR A PERSON, by design** — `spec/flow-definition.md` v0.42,
> [ADR 0108](doc/decisions/0108-an-ask-is-a-seventh-node-kind-with-a-task-id-and-no-dispatch.md),
> [W179](doc/work-items/w179-the-ask-node-in-the-definition.md). It runs NO worker and nothing is ever handed to the
> scheduler for it, yet it has a TASK ID (`r1:approve:-:0`, one per map item) — the address the person's answer will
> be given to — and the answer is its OUTPUT: a later node references it by `needs`, and its edges route as a task's
> settlement does, `on: ['failed']` being the person DECLINING and a `when` reading `outcome.result`, the answer.
> `settings` is opaque (the question, a form hint — the library never reads it), `answerSchema` is what a `done`
> answer must satisfy, held to the schema subset at construction (`FD-V48`), and `needs` composes what reaches it.
> It stands wherever a task may — the entry, a fan-out's branch entry, a map's branch. **What a task's WORKER reads it
> may not carry**: `type`, `pool`, `optional`, `retryPolicy`, `workerGroups` and `transform` are each refused by
> `FD-V47`, one finding per key. **A run PARKS at one** ([W180](doc/work-items/w180-asking-and-answering-in-a-run.md), [ADR 0109](doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md), section 7): nothing is handed to the
> scheduler, the node reads `suspended` with what reached it KEPT as `input`, the run `awaiting_action`, and the
> person's answer is `driver.resolve(taskId, 'done' | 'failed', …)` — a `done` answer held to `answerSchema`, a
> `failed` one the person declining. *(Until W180 every `Driver` refused a run where a branch entered an ask, by name.)*
> **BREAKING in 0.8.0** (P35 decision 8): `FlowNode` gains `AskNode`, so a `switch` exhaustive over `node.kind` no
> longer compiles until it names `'ask'`.

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const review: FlowDefinition = {
  flowId: 'review', version: 1, entry: 'draft',
  nodes: [
    { id: 'draft', kind: 'task', type: 'Draft', edges: [{ to: 'approve' }] },
    // An ASK: no worker, no dispatch — and a task id, which is where the answer goes.
    { id: 'approve', kind: 'ask',
      settings: { question: 'Publish this draft?' },          // opaque: the library never reads it
      answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
      needs: { draft: 'draft' },                              // what reaches it — what the person is shown
      edges: [
        { on: ['failed'], to: 'declined' },                   // the person DECLINED
        { when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'publish' },
        { to: 'rework' },                                     // the default, as on a task
      ] },
    // The answer is the ask's OUTPUT: `needs` reaches it as it reaches a task's result.
    { id: 'publish', kind: 'task', type: 'Publish', needs: { text: 'draft', answer: 'approve' }, edges: [{ to: 'done' }] },
    { id: 'rework', kind: 'end', outcome: 'rework' },
    { id: 'declined', kind: 'end', outcome: 'declined' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const registry = { predicates: [], workers: { w: { url: 'worker.js' } }, nodeTypes: { Draft: { worker: 'w' }, Publish: { worker: 'w' } } };
const clean = validateDefinition(review, registry);
if (clean.length) throw new Error(`the ask flow should be valid: ${clean.map((f) => f.rule).join()}`);

// A task turned into an ask with its worker keys left on: FD-V47, ONE finding per key — never FD-V17.
const leftOn = { ...review, nodes: review.nodes.map((n) => (n.id === 'approve' ? { ...n, type: 'Draft', optional: true } : n)) } as unknown as FlowDefinition;
const v47 = validateDefinition(leftOn, registry).map((f) => `${f.rule}@${f.at}`);
if (v47.join() !== 'FD-V47@approve,FD-V47@approve') throw new Error(`expected two FD-V47 at approve, got ${v47.join()}`);

// An answerSchema outside the schema subset is FD-V48 — refused, never ignored.
const pattern = { ...review, nodes: review.nodes.map((n) => (n.id === 'approve' ? { ...n, answerSchema: { type: 'string', pattern: '^y' } } : n)) } as unknown as FlowDefinition;
const v48 = validateDefinition(pattern, registry).map((f) => f.rule);
if (v48.join() !== 'FD-V48') throw new Error(`expected FD-V48, got ${v48.join()}`);
```

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
| `fanout` | `branches: string[]` — the node each branch starts at. Dispatches nothing itself | fewer than two branches, a repeated entry, any `edges` at all, or a branch entry that is not a `task` or an `ask` (`FD-V9`) |
| `map` | `over: '<key>'` and `branch: '<node id>'` — **one** branch, opened once per item at run time. Dispatches nothing itself; the RUN opens N instances of its one branch. Optionally **`needs`**, which is what `over` is then a key on | any `edges` at all, a `branch` that is not a `task` or an `ask`, or an `over` outside `^[A-Za-z0-9_-]{1,64}$` (`FD-V25`); a missing `over` or `branch` (`FD-V23`) |
| `join` | `of: '<fanout id>'`. Fires when its policy says so | it does not have **exactly one** edge, or that edge carries `when` or `on` (`FD-V7`) |
| `end` | terminal. `outcome` is **your label**, never interpreted | — |
| `ask` | waits for a PERSON — `edges`, and optionally `settings` (opaque), `answerSchema` (what a `done` answer must satisfy) and `needs` (what reaches it). Never dispatched, and has a task id; its answer is its output. A run PARKS at one and takes the person's answer at `resolve()` (section 7) | it has no `edges`, or **no edge of it is eligible for `done`** (`FD-V7`, as a task); `settings` that is not a plain object (`FD-V21`); a key only a task declares — `type`, `pool`, `optional`, `retryPolicy`, `workerGroups`, `transform` — one finding per key (`FD-V47`); an `answerSchema` outside the schema subset (`FD-V48`) |
| `gate` | `type: '<gate type>'`, optional `settings`, and `edges` of `{ to, route? }` — routes the branch that reaches it and hands on what reached it. `settings.key` is a dotted key path over that value (`series.id`; no index). Built in: `distinct`, `if` and `switch`. Run by the driver where a branch enters it (section 19) | its `type` is not a registered gate type, or its type's `routesFor` throws or returns a malformed route set for this gate, or its `settingsProblem` throws or returns neither a message nor `null` (`FD-V39`); its `settings` are not a plain object its type's schema accepts, its type's `settingsProblem` returns a message, they cannot be copied for the type, or its `key` is not a key path (`FD-V40`); a route is unwired, wired twice, or not its type's, or a gate edge carries `when`, `on` or `needs` (`FD-V41`) — and `route` on any other node's edge is `FD-V41` too |

**A `task` node — and an `ask` — must have an edge that can be taken when it succeeds.** A node whose only edge is
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
| `retryPolicy` | `{ maxRetries, backoffMs }` — **exactly** the scheduler's shape, an integer >= 0 and a finite number >= 0, no other key (`FD-V30`) | the scheduler retries a failed attempt **inside the same task id**, and the outcome record's `attempts` says how many retries were used — since 0.8.0 across a crash or a stop too: a resume hands the attempts already made on, and the budget is not reset (section 18). `{}` and a string count are refused because the scheduler would accept them and mean something else |
| `workerGroups` | a non-empty array of distinct group ids, every one in the registry's **`groups`** set (`FD-V31`) | the task acquires these **in addition to** its pool's `groups`. Pass `groups: Object.keys(scheduler.groups)` to the `Driver`, as you pass `nodeTypes` — **omitting it means the registry declares NO groups**, and any node naming one is refused, because a group id the scheduler does not know is silently ignored at run time |

**A driver may carry a `defaultRetryPolicy`**, applied to every task node that declares none — held
to `FD-V30` at construction like a node's own, and `createRuntime`'s option of the same name at ITS construction
([ADR 0097](doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md) rule 5) — and
**the node wins, whole** — a node with its own policy is dispatched with exactly that object, and the
default is consulted only when the node declares none. There is no `defaultWorkerGroups`: a pool's own `groups` already applies to
every task it runs, and the scheduler unions the two. A node that declares neither key is dispatched
with the exact object it was before, so nothing you have already written changes.

**Flow-level retry — re-dispatching a NODE under a new attempt, possibly routing elsewhere — is
still not built** (section 11). This is the scheduler's retry of one task, and it is the whole of
what `attempts` counts — and, since 0.8.0, what the run RECORDS: each attempt's start is a fold input,
`{ kind: 'attempted', taskId, attemptNumber }`, with the scheduler's 1-based number (section 18).

### `needs` — reaching an output the previous node did not produce

By default **a node receives the previous node's result**, deep-copied. That is still true of every
node that says nothing, and it is what the whole of this section above describes.

**`needs` is how a node asks for something else** —
[ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md),
answering [Q11](doc/questions/q11.md). It is an optional object on a `task`, a `map` or — since 0.8.0 — an `ask`, mapping the
keys of the payload you want to **declared references**. *(Since v0.12 an **edge** may carry one too,
and it says what that edge's PREDICATE sees rather than what a worker receives — section 4.)* A node that declares one receives **exactly**
that object and nothing else — there is no wrapper and no reserved key.

| a reference is | and you get |
|---|---|
| `"."` | what the node would have received anyway — the previous node's result, and for a `map` instance **its own item** |
| `"$payload"` | **what the RUN was handed** — the payload `start()` took, from any node and any edge, however many hops in (since 0.8.0, below). Always there: no `?`, no array form |
| `"$item"` | **what opened your MAP INSTANCE** — its own item, from any node and any edge inside the instance, however many hops in (since 0.8.0, below). Always there inside one; outside every map instance it is `FD-V49` |
| `"someNode"` | that node's result, **on your own branch** |
| `["someNode"]` | that node's results as an **array**, in ascending branch-path order. Legal only when you are OUTSIDE a region that node is in — which is what makes it more than one |
| **a `?` on either of those** — `"someNode?"`, `["someNode?"]` | the same thing, except that **nothing to give leaves the key out** (or gives `[]` for the array form) instead of stopping the run. This is how you say *if it ran* |
| **`!error` after the node id, on any of those** — `"someNode!error"`, `["someNode!error?"]`, … | that node's **ERROR** instead of its result: the string its failure was reduced to, `null` where it succeeded (since 0.11.0, below) |

**What a reference hands you is ONE shared, frozen copy — read it, never write it** — from 0.10.0 ([ADR 0126](doc/decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md),
`spec/flow-definition.md` v0.47). The value under a `"someNode"` or `["someNode"]` key (either with `?`) is ONE deep copy
of that output, made the first time anything reads it and handed to EVERY reader of it — every instance of a `map`, every
node after it, and every edge predicate (`ctx.needs`, section 4) — and a `"$payload"` key is one such copy of the run's
payload for the whole run. The object `needs` composes is still yours, a `["someNode"]` array is a fresh one per read, and
`"."` and `"$item"` are still your own copies. **The copy is FROZEN where JavaScript can freeze**: plain objects and arrays
at every depth, so writing into one throws `TypeError` in strict code — an **inline** worker that does so fails that
attempt (your `retryPolicy` decides what follows), and a **predicate** in strict code that does so stops the run (in
sloppy code the write is silently dropped). A threaded worker
writes into its own clone, as before. **What freezing cannot protect is yours to leave alone**: a `Map`, `Set`, `Date`
or `ArrayBuffer` in a result is frozen only shallowly (`set`, `add`, `setTime` and a write through a view still work, and
a `Map`'s keys and values, a `Set`'s members and an `Error`'s `cause` are not frozen), and a typed array, `DataView` or
`RegExp` is not frozen at all (a frozen `RegExp` could not run its own `test` or `exec`) — an inline worker writing into one changes what every other reader of
that output sees. Copy before you change anything a reference handed you. *(Until 0.10.0 every read was its own deep
copy, so such a write landed on yours alone — and a reference to a large result inside a `map` cost one copy per item.)*

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

**And inside a `map`, what it costs is what you point it at.** From 0.10.0 that is ONE copy of it, whatever the
arity (above). Until 0.10.0 each instance got its OWN COPY of each key, so a reference to a large result was copied
once per item, every copy live at once: fyflow-app's *fetch a list, then map over it* at 4,000 items cost the driver
alone 15.5 s and 1.4 GB in 0.9.1, and 0.09 s and 15 MB from 0.10.0 (node 24). Measured at a map arity of 1000 over a
~126 KiB result, the driver alone, **one case per process**: no `needs` **24.4 ms**, `{item: '.'}` **25.3 ms**, one
more key naming a genuinely small node **28.0 ms**, and the same key naming the large one **30.5 ms** — **1.1x**, where
it was 17x in 0.9.1 on the same machine — and the `?` suffix costs nothing (**28.3 ms**). The mechanism makes one copy
per output read, whoever reads it. A reference still names a whole node and never a path inside it — a path
language would make *the small part of the big thing* a selector's business rather than the document's. *(These five figures are compared to `spec/flow-definition.md` section 3's own table by
`check-docs`' `X6`, both ways — three documents carried them and nothing compared any two, which is
`doc/workflow.md` section 5 rule 8 obligation (e)'s third shape.)*

**Nothing warns about it, and that is a decision rather than a gap.** There is no threshold to warn
at; the static predicate that needs no threshold fires on **every** intended use of the feature,
including the flow it exists for, so it restates the definition rather than diagnosing anything; and
a report channel exists (`onUnmintedTask`'s shape) and is declined because *this reference is resolved
once per item* is a fact about your document rather than about your run. **Measuring is not the
obstacle** — a size measurement is about 0.03% of what it would warn about at arity 1000.
`spec/flow-definition.md` section 3 carries the whole verdict and the measurements. **From 0.10.0 there is nothing
left to warn about**: the per-item copy that decision was about is gone ([Q186](doc/questions/q186.md), resolved by
[ADR 0126](doc/decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md)), and the decision stands as written.

**Finding what a reference names costs its ANSWER** — from 0.9.1
([ADR 0124](doc/decisions/0124-a-reference-read-costs-its-answer.md), `spec/flow-definition.md` v0.46). A branch task
may read any earlier task of its own `map` instance by id — one step back or several, where `"."` reaches only its
predecessor — and the read takes that one output, however many instances the map has: the driver files a node's outputs
by the branch-path prefix its readers share. In 0.9.0 every read searched every output of the node it names, so such a
map cost O(items²) (the driver alone at 8,000 items: 22 s in 0.9.0, 0.22 s from 0.9.1, node 24). **A read never costs
less than its answer**: `["n"]` from a reader outside every region `n` is in — a SIBLING map's reader — is handed every
output of `n`, so two maps of `n` and `m` instances compose `n·m` entries — from 0.10.0 `m` fresh arrays of the same `n`
shared copies, so the price is the arrays, not `n·m` clones. That is the answer's price, and the remedy is the cliff's.

### `"$payload"` — what reached the RUN, from any node

**`"$payload"` names the value the run was STARTED with** — `start(flow, payload)`'s `payload` — on any node that may
declare `needs` (a `task`, a `map`, an `ask`) and on any edge, the entry included (`spec/flow-definition.md` v0.44,
[ADR 0117](doc/decisions/0117-a-reference-may-name-what-reached-the-run.md), since 0.8.0). Until it, a node reached the
run's payload only through `"."` on the node that received it — and an ASK breaks that: its result is the person's
answer (section 7), so the node after an ENTRY ask had no road to what the run started with except a task before the ask
that passed it through.

| | |
|---|---|
| what it is | the copy the run's checkpoint HEADER keeps (`header.entryPayload`, section 18) — so a caller changing its payload object after `start()` changes nothing. From 0.10.0 every `"$payload"` key of the run, at every node and edge, is ONE deep-frozen copy of it, made at the first read — a worker or a predicate writing into it throws `TypeError` and reaches nothing (above). *(Until 0.10.0 each key was its own deep copy, per read.)* |
| where it is legal | every node and every edge — at the entry, on a task, it equals `"."`, and both spellings are accepted. **On an edge it is NOT refused** the way `"."` is: a predicate has no `ctx.payload`, so `needs: { run: '$payload' }` is how a decision routes on `needs.run.amount` with no task before it |
| always there | no `?` and no array form: `["$payload"]` and `"$payload?"` are `FD-V26`, each naming the bare form. The whole `$` prefix is reserved — `$` is outside the node-id charset (`FD-V16`), so the token can never collide with a node — and any other `$` spelling (`"$input"`, a typo) is `FD-V26` naming the two `$` references |
| `"$item"` | the prefix's second reference, the item of the map instance the reader is in — the next subsection |
| on a resume | the same value, from the stored header: nothing new is written to the log, the header or the checkpoint (`CHECKPOINT_FORMAT` stays 1) |
| at `start()` | `FD-R4` holds a task's composed `"$payload"` key to its worker's `inputSchema` like any other key (section 9) — composed from the value you passed, before the run exists |
| in the wiring check | an arc composed through a `"$payload"` key is `unchecked`: the run's payload is a value no schema declares (section 15) |
| what it costs | ONE copy of the whole payload per RUN, from 0.10.0 — however many instances of a `map` read it. *(Until 0.10.0 one copy per key per read: inside a `map`, once per instance — the cliff above at its largest.)* On an ASK the copy is also written into the run's LOG: the `asked` element keeps what reached the ask (section 7) |

**`givenVerdict` and `tryTransform(…, { input })` compose nothing** (section 15): the value you give them IS what the node
receives, so a node declaring `needs: { run: "$payload" }` is given `{ run: <the payload> }` — composing it is yours, as
for every `needs` key, `"$item"` included.

The app's case — an ENTRY ask whose successor needs the invoice the run started with beside the person's answer, and an
edge that routes on the invoice's amount:

```ts run
import { Driver, fold, liveToken, validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

// A scheduler double, section 12's shape: it records what it is handed and fires only what we tell it to.
const added: { id: string; payload: { input: unknown } }[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const scheduler = {
  addTask(task: unknown) { added.push(task as { id: string; payload: { input: unknown } }); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const handedInput = (id: string) => added.find((t) => t.id === id)?.payload.input;

const flow: FlowDefinition = {
  flowId: 'pay-invoice', version: 1, entry: 'approve',
  nodes: [
    // The ENTRY is an ask: what it shows the person is the run's payload, and its result is the ANSWER alone.
    { id: 'approve', kind: 'ask', needs: { invoice: '$payload' },
      answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
      edges: [{ on: ['failed'], to: 'declined' }, { to: 'pay' }] },
    // `pay` reaches BOTH: the invoice the run started with, and the person's answer.
    { id: 'pay', kind: 'task', type: 'Pay', needs: { invoice: '$payload', answer: 'approve' },
      edges: [
        // An EDGE may name it too, so its predicate routes on the run's payload with no task in between.
        { when: { path: 'needs.run.amount', op: 'gt', value: 100 }, to: 'audit', needs: { run: '$payload' } },
        { to: 'done' },
      ] },
    { id: 'audit', kind: 'task', type: 'Pay', edges: [{ to: 'done' }] },
    { id: 'declined', kind: 'end', outcome: 'declined' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const types = { workers: { w: { url: 'worker.js' } }, nodeTypes: { Pay: { worker: 'w' } } };
const registry = { predicates: [], ...types };
if (validateDefinition(flow, registry).length) throw new Error('"$payload" is legal on an entry ask, on a task and on an edge');

const driver = new Driver(flow, { runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken, ...types });
const invoice = { id: 'INV-1', amount: 120 };
driver.start(invoice);
invoice.amount = 1;   // yours to change: the run holds its own copy

driver.resolve('r1:approve:-:0', 'done', { result: { approved: true }, actor: 'ana' });
console.log(handedInput('r1:pay:-:0'));   // { invoice: { id: 'INV-1', amount: 120 }, answer: { approved: true } }
if (JSON.stringify(handedInput('r1:pay:-:0')) !== '{"invoice":{"id":"INV-1","amount":120},"answer":{"approved":true}}') {
  throw new Error(`pay received ${JSON.stringify(handedInput('r1:pay:-:0'))}`);
}

// `pay` settles; its edge reads `needs.run.amount` — 120, the run's — and routes to the audit.
for (const fn of listeners.get('task.completed') ?? []) fn({ detail: { id: 'r1:pay:-:0', state: 'done', result: { paid: true } } });
console.log(added.map((t) => t.id));   // [ 'r1:pay:-:0', 'r1:audit:-:0' ]
if (added.map((t) => t.id).join() !== 'r1:pay:-:0,r1:audit:-:0') throw new Error('120 > 100 routes to the audit');
if (fold(driver.foldInputs()).outcome !== 'running') throw new Error('the audit is in flight');

// The refusals name their fix: one payload, always there, and the `$` prefix is reserved.
const refuse = (ref: unknown) => validateDefinition({ ...flow, nodes: flow.nodes.map((n) =>
  (n.id === 'pay' ? { ...n, needs: { invoice: ref } } : n)) } as FlowDefinition, registry).map((f) => `${f.rule}: ${f.detail}`);
for (const [ref, fix] of [[['$payload'], 'write "$payload"'], ['$payload?', 'without "?"'], ['$input', '"$payload" (the run\'s payload)']] as const) {
  const [finding] = refuse(ref);
  if (!finding?.startsWith('FD-V26') || !finding.includes(fix)) throw new Error(`${JSON.stringify(ref)}: ${finding}`);
}
```

**BREAKING in 0.8.0** (P38 (h)): `referenceTarget`'s return type gains two variants, `{ form: 'payload' }` and
`{ form: 'item' }`, each with `node: null` — so code switching exhaustively on `form` stops compiling, and code reading
`node === null` as *the `"."` form* reads `"$payload"` as `"."` in silence: switch on `form`. The `Reference` TYPE does
not move (every token is a string), and a flow that names neither token is unchanged — every tree before 0.8.0's W190
refuses both.

### `"$item"` — what opened the MAP INSTANCE, from any node in it

**`"$item"` names the item the reader's map instance was opened with** — the element of `over`'s array — on any node that
may declare `needs` (a `task`, a `map`, an `ask`) and on any edge INSIDE a map instance, however many hops into it
(`spec/flow-definition.md` v0.45, [ADR 0118](doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md),
since 0.8.0). Until it, an instance's item reached only its branch ENTRY, as `"."` — and an ASK as a map's branch breaks
that: its result is the person's answer, so the node after it had no road to the item except a task before the ask that
passed it through.

| | |
|---|---|
| which instance | the INNERMOST map region that CONTAINS the reader. A node in a `fanout` inside a map instance names the MAP's item; a `map` node's own `"$item"` is its ENCLOSING instance's (a map never names the region it opens); an OUTER map's item from inside an inner one is not named — a node of the outer instance that declares it passes it down |
| where it is legal | every node and every edge inside a map instance — on the branch entry it equals `"."`, and both are accepted; on an edge it is NOT refused the way `"."` is. **Outside every map instance it is `FD-V49`** — before every map, after a map's join, or on a top-level `map` node — naming both fixes: *name the item where a map's branch receives it (`"."`), or move this node inside the map* |
| always there | no `?` and no array form: `["$item"]` and `"$item?"` are `FD-V26`, each naming the bare form |
| what it is | its OWN deep copy of the item, per key per read — two `"$item"` keys on one node are two objects, and a worker or a predicate writing into one reaches nothing else |
| what an instance KEEPS | its item, by reference to the element the map received — and only where some node of that map's region reads `"$item"`: a map nobody reads it from keeps nothing. **Released when nothing of that instance may still be entered** — its branch has ended (arrived at the map's join, exited the region, or been lost) AND no branch of a region nested inside it is still live — told by those branches' terminal region events, never by a join: an ask parked in the instance keeps it until the person answers, and a nested fan-out whose join a policy fired early keeps it until its last branch ends. Released whole when the run halts, is cancelled or is stopped (`spec/run-state.md` `RN-R13`) |
| on a resume | rebuilt by the replay, which re-enters the map: nothing new is written to the log, the header or the checkpoint (`CHECKPOINT_FORMAT` stays 1) |
| at `start()` | `FD-R4` composes it on an ENTRY map's branch task from the element the walk reached — which IS that instance's item — and holds it to the worker's `inputSchema` like any key (section 9). *Until 0.8.0's W191 ANY `needs` on such a task — `"."` included — made `start()` throw an `UnresolvedBranchPath` instead of `BoundaryRefused`* |
| in the wiring check | an arc composed through a `"$item"` key reads the enclosing map's ITEM schema, one sample per element; `unchecked` for an ENTRY map, whose items come from the run's payload, which no schema declares (section 15) |
| what it costs | one copy of ONE element per key per read — the cheap end of section 3's cliff — and the retention above, at most the `over` array the log already holds |

The app's case — a map whose branch is an ASK, and the node after it reaching its instance's invoice beside the person's
answer, and an edge that routes on that invoice's amount:

```ts run
import { Driver, fold, liveToken, validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

// A scheduler double, section 12's shape: it records what it is handed and fires only what we tell it to.
const added: { id: string; payload: { input: unknown } }[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const scheduler = {
  addTask(task: unknown) { added.push(task as { id: string; payload: { input: unknown } }); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const handedInput = (id: string) => added.find((t) => t.id === id)?.payload.input;

const flow: FlowDefinition = {
  flowId: 'review-each', version: 1, entry: 'each',
  nodes: [
    // One instance per invoice, and each instance's branch is an ASK: its result is the answer alone.
    { id: 'each', kind: 'map', over: 'invoices', branch: 'review' },
    { id: 'review', kind: 'ask',
      answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
      edges: [{ on: ['failed'], to: 'skipped' }, { to: 'pay' }] },
    // `pay` reaches BOTH: its own instance's invoice, and the person's answer.
    { id: 'pay', kind: 'task', type: 'Pay', needs: { invoice: '$item', answer: 'review' },
      edges: [
        // An EDGE may name it too, so a predicate routes on the instance's invoice.
        { when: { path: 'needs.it.amount', op: 'gt', value: 100 }, to: 'audit', needs: { it: '$item' } },
        { to: 'collect' },
      ] },
    { id: 'audit', kind: 'task', type: 'Pay', edges: [{ to: 'collect' }] },
    { id: 'skipped', kind: 'end', outcome: 'skipped' },
    { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const types = { workers: { w: { url: 'worker.js' } }, nodeTypes: { Pay: { worker: 'w' } } };
const registry = { predicates: [], ...types };
if (validateDefinition(flow, registry).length) throw new Error('"$item" is legal on a node and on an edge inside a map instance');

const driver = new Driver(flow, { runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken, ...types });
const payload = { invoices: [{ id: 'INV-1', amount: 120 }, { id: 'INV-2', amount: 40 }] };
driver.start(payload);
payload.invoices[0]!.amount = 1;   // yours to change: the instance keeps its own item

// Two asks parked, one per invoice. Answered out of order, each `pay` gets ITS instance's invoice.
driver.resolve('r1:review:1:0', 'done', { result: { approved: true }, actor: 'bo' });
driver.resolve('r1:review:0:0', 'done', { result: { approved: true }, actor: 'ana' });
console.log(handedInput('r1:pay:0:0'));   // { invoice: { id: 'INV-1', amount: 120 }, answer: { approved: true } }
if (JSON.stringify(handedInput('r1:pay:0:0')) !== '{"invoice":{"id":"INV-1","amount":120},"answer":{"approved":true}}') {
  throw new Error(`pay@0 received ${JSON.stringify(handedInput('r1:pay:0:0'))}`);
}
if (JSON.stringify(handedInput('r1:pay:1:0')) !== '{"invoice":{"id":"INV-2","amount":40},"answer":{"approved":true}}') {
  throw new Error(`pay@1 received ${JSON.stringify(handedInput('r1:pay:1:0'))}`);
}

// Each `pay` settles; its edge reads `needs.it.amount` — 120 audits, 40 does not.
for (const id of ['r1:pay:0:0', 'r1:pay:1:0']) {
  for (const fn of listeners.get('task.completed') ?? []) fn({ detail: { id, state: 'done', result: { paid: true } } });
}
console.log(added.map((t) => t.id));   // [ 'r1:pay:1:0', 'r1:pay:0:0', 'r1:audit:0:0' ]
if (added.map((t) => t.id).join() !== 'r1:pay:1:0,r1:pay:0:0,r1:audit:0:0') throw new Error('120 > 100 audits instance 0 alone');
if (fold(driver.foldInputs()).outcome !== 'running') throw new Error('the audit is in flight');

// Outside every map instance there is no item: a top-level MAP's own "$item" would be an ENCLOSING one — FD-V49.
const outside = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'each' ? { ...n, needs: { invoices: '$item' } } : n)) } as FlowDefinition;
const [finding] = validateDefinition(outside, registry);
if (finding?.rule !== 'FD-V49' || !finding.detail.includes('move this node inside the map')) throw new Error(`expected FD-V49, got ${finding?.rule}`);
```

### `"someNode!error"` — what FAILED, from the nodes after it

**`"lookup!error"` names node `lookup`'s ERROR** — the outcome's `error`, the string the scheduler reduced the failure to
(section 6) — where `"lookup"` names its result (`spec/flow-definition.md` v0.49,
[ADR 0131](doc/decisions/0131-a-reference-may-name-a-nodes-error.md), since 0.11.0). A failed task's result is `null`, so
until it a node after a failure edge — an ask asking a person *what now?* above all — could not say what failed.

| | |
|---|---|
| what it is | the effective outcome's `error`: the record's, or a RESOLUTION's where a person resolved the node (`resolve(id, 'failed', { error })` on a parked task, a declined ask; `'resolved as failed'` where they gave none). **`null` where the output SUCCEEDED** — the key is present, holding `null` |
| its forms | the plain reference's four: `"lookup!error"`, `"lookup!error?"`, `["lookup!error"]`, `["lookup!error?"]` — the `?` goes LAST. It names the same node's same outputs as `"lookup"`, so `FD-V27`-`FD-V29` and the `?` and array rules are the plain form's, and the fixes `FD-V28` and `FD-V29` name keep the `!error` (`FD-V27` names the node, as for `"lookup"`) |
| where it is legal | wherever `"lookup"` is: a `task`'s, a `map`'s or an `ask`'s `needs`, and an edge's (`ctx.needs`, section 4) |
| what it is NOT | a path: the error is a field of the OUTCOME beside `result`, and `error` is the one part a reference may name. `"lookup?!error"`, `"!error"` and `"lookup!err"` are `FD-V26`, each naming its fix |
| what it costs | nothing to copy — a string or `null`, never the shared frozen copy of the result (above) |
| in the wiring check | the key composes as `{ type: ['string', 'null'] }` with the sample `''`, whatever the producer declares (section 15) |
| `referenceTarget` | the error form parses to the plain form's object plus `part: 'error'`, present ONLY there (`AimedReference`), so every other spelling parses as before. A resolver of your own must read `part`; an aiming rule may ignore it |

**The default — a failure edge handing `{ error }` to its successor — was declined** (P43 (c2)): it would change what every
existing failure edge's successor receives. You name the error where you want it.

The app's case — `lookup` fails, an ask after its failure edge shows the person why, and the node both roads reach reads
the error beside the result:

```ts run
import { Driver, fold, liveToken, validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const added: { id: string; payload: { input: unknown } }[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const scheduler = {
  addTask(task: unknown) { added.push(task as { id: string; payload: { input: unknown } }); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const handedInput = (id: string) => added.find((t) => t.id === id)?.payload.input;
const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };

const flow: FlowDefinition = {
  flowId: 'lookup-or-ask', version: 1, entry: 'lookup',
  nodes: [
    // `optional`, so a failure SETTLES failed and routes the failure edge (a non-optional task would park, section 7).
    { id: 'lookup', kind: 'task', type: 'Work', optional: true, edges: [{ on: ['failed'], to: 'resolve' }, { to: 'publish' }] },
    { id: 'resolve', kind: 'ask', needs: { why: 'lookup!error' },
      answerSchema: { type: 'object', required: ['value'], properties: { value: { type: 'string' } } },
      edges: [{ on: ['failed'], to: 'skipped' }, { to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'Work', needs: { found: 'lookup', why: 'lookup!error', given: 'resolve?' }, edges: [{ to: 'done' }] },
    { id: 'skipped', kind: 'end', outcome: 'skipped' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const types = { workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } } };
const registry = { predicates: [], ...types };
if (validateDefinition(flow, registry).length) throw new Error('"lookup!error" is legal on an ask and on a task');

const driver = new Driver(flow, { runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken, ...types });
driver.start({ invoice: 'INV-?' });
fire('task.failed', { id: 'r1:lookup:-:0', state: 'failed', result: null, error: 'lookup timed out after 30 s' });

// The ask parks with the error: what it shows the person.
const asked = driver.foldInputs().find((e) => e.kind === 'asked');
console.log(asked?.kind === 'asked' && asked.input);   // { why: 'lookup timed out after 30 s' }
if (JSON.stringify(asked?.kind === 'asked' && asked.input) !== '{"why":"lookup timed out after 30 s"}') throw new Error('the ask is handed the error');

driver.resolve('r1:resolve:-:0', 'done', { result: { value: 'INV-9' }, actor: 'ana' });
console.log(handedInput('r1:publish:-:0'));   // { found: null, why: 'lookup timed out after 30 s', given: { value: 'INV-9' } }
if (JSON.stringify(handedInput('r1:publish:-:0')) !== '{"found":null,"why":"lookup timed out after 30 s","given":{"value":"INV-9"}}') {
  throw new Error(`publish received ${JSON.stringify(handedInput('r1:publish:-:0'))}`);
}
if (fold(driver.foldInputs()).outcome !== 'running') throw new Error('publish is in flight');

// A part other than `error`, or the `?` in the wrong place, is refused naming the fix.
const refuse = (ref: unknown) => validateDefinition({ ...flow, nodes: flow.nodes.map((n) =>
  (n.id === 'publish' ? { ...n, needs: { why: ref } } : n)) } as FlowDefinition, registry).map((f) => `${f.rule}: ${f.detail}`);
for (const [ref, fix] of [['lookup!err', 'write "lookup!error"'], ['lookup?!error', 'write "lookup!error?"']] as const) {
  const [finding] = refuse(ref);
  if (!finding?.startsWith('FD-V26') || !finding.includes(fix)) throw new Error(`${ref}: ${finding}`);
}
```

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

There are **45 refusals** over the id range `FD-V1` … `FD-V49` *(44 over `FD-V1` … `FD-V48` until W191 added `FD-V49` — `"$item"` where no map instance contains the reader; 42 over `FD-V1` … `FD-V46` until W179 added the ASK's two, `FD-V47` — a key only a task declares, on an ask — and `FD-V48` — an `answerSchema` outside the schema subset; 41 over `FD-V1` … `FD-V45` until W109 shipped the first BUILT-IN node type and added `FD-V46`, which refuses a node of a type that only transforms and declares no `transform`; 37 over `FD-V1` … `FD-V41` until W108 made a predicate DATA and added the four a `when` needs; 34 over `FD-V1` … `FD-V38` until W92 added the gate's three; 35 over `FD-V1` … `FD-V37` until W65 retired `workerType` and with it `FD-V5` and `FD-V34`, adding `FD-V38`; 32 over `FD-V1` … `FD-V34` until W61 added the three transform rules; 29 over `FD-V1` … `FD-V31` until W59 added the three node-type rules — and this sentence stood at 29 twelve lines below the table W59 rewrote, until its conformity reader read the two together)*, each with a failing example in
`spec/examples/invalid/`. Four ids in that range are **deliberately absent** and have no rule behind
them: `FD-V14`, which never existed; **`FD-V15`, retired when nested fan-out became
expressible**; and **`FD-V5` and `FD-V34`, retired with `workerType`** at v0.19 (section 13). The ids are never renumbered, so it is safe to assert on them. The full
list is `spec/flow-definition.md`.

**`FD-V14` is deliberately absent, and its id is held open so the gap is not read as a lost rule.**
It would have said *every path from a branch entry reaches the join* — which would make a decision
that routes a branch away from its join invalid input, and that case is the one this library exists
to get right (`ADR 0003`). Do not add it.

### The definition's SHAPE, as data — `definitionSchema()`

**`definitionSchema()` returns everything above as a JSON Schema, draft 2020-12** (`spec/flow-definition.md` v0.50,
[ADR 0132](doc/decisions/0132-a-definitions-shape-is-a-schema-built-from-the-validator.md), since 0.11.0): every node kind
and its keys, which are required, the edges of each kind, the three `when` shapes, the `needs` grammar (`"lookup!error"`
included), a `retryPolicy`, a `transform` and an `answerSchema` — each key with a `description`. Hand it to any 2020-12
validator, or to an agent writing a flow, BEFORE the findings. It is BUILT from the validator's own key sets, so its
keys cannot drift from them (the reference tokens and the operator partition are written beside them and held to the
validator by its tests); it is a new plain object on every call, yours to change. A join's `of` and a fanout's branch
entries are held to the id charset only where they are strings — the validator does no more today
([Q774](doc/questions/q774.md)).

| | |
|---|---|
| it refuses | what a node, an edge or a value gets wrong in its OWN shape: an undeclared or missing key, a wrong type, an id outside `[A-Za-z0-9_-]{1,64}`, an unknown kind, a malformed reference, `when`, `retryPolicy` or `transform`, a task's key on an ask, an `answerSchema` outside the subset |
| it does not | anything that needs ANOTHER node or the REGISTRY — whether `to` names a node, reachability, regions and joins, where a reference points, every registered name (types, pools, groups, languages, predicates, gate types and their routes) |
| the authority | **`validateDefinition(flow, registry)`**, or `runtime.check(flow)` on a runtime — for all of that and for the whole. What the schema refuses, `validateDefinition` refuses under every registry; a document it accepts may still be refused there. The root `description` says so |
| not | a check the library runs (nothing evaluates it), nor in [ADR 0053](doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)'s subset — it uses `$defs`, `$ref`, `oneOf`, `if`/`then`, `pattern` |

```ts run
import { definitionSchema, validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const schema = definitionSchema();
console.log(schema.$schema);   // https://json-schema.org/draft/2020-12/schema
if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') throw new Error('a 2020-12 document');
if (!String(schema.description).includes('validateDefinition')) throw new Error('it names the authority for the rest');

type Def = { properties: Record<string, { description?: string }>; required: string[]; additionalProperties: boolean };
const defs = schema.$defs as Record<string, Def> & { reference: { anyOf: { pattern?: string }[] } };
console.log(defs.askNode.required);   // [ 'id', 'kind', 'edges' ]
if (defs.askNode.additionalProperties !== false || 'type' in defs.askNode.properties) throw new Error('an ask declares no type');
if (!defs.taskNode.properties.retryPolicy?.description) throw new Error('every key is described');

// The reference grammar, as a pattern any validator can apply — the error form accepted, a misplaced "?" not.
const reference = new RegExp(defs.reference.anyOf[0]!.pattern!);
if (!reference.test('lookup!error?') || reference.test('lookup?!error')) throw new Error('the "!error" grammar');

// A shape the schema accepts can still be refused: an edge to a node that does not exist is the VALIDATOR's.
const dangling = { flowId: 'f', version: 1, entry: 'a', nodes: [{ id: 'a', kind: 'task', type: 'Work', edges: [{ to: 'ghost' }] }] } as FlowDefinition;
const rules = validateDefinition(dangling, { predicates: [], workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } } }).map((f) => f.rule);
if (rules.join() !== 'FD-V2') throw new Error(`the graph is validateDefinition's: ${rules.join()}`);
if (definitionSchema() === schema) throw new Error('a new object per call');
```

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
a node's (section 3) — a node id, or a one-element array holding one, since 0.8.0 `"$payload"` and `"$item"`, and since 0.11.0 a node's error, `"n!error"` —
**minus `"."`**, which an edge has no use for: *what a predicate would have received anyway* is `ctx.outcome`. `"$payload"`
and `"$item"` are not refused there: a predicate has no other road to the run's payload or to its map instance's item
(section 3's two subsections route on them).

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
what the run produced**, which is available either way — **and from what the run was HANDED**, since 0.8.0: the
checkpoint header keeps the run's payload for the life of the run, and `"$payload"` names it — **and, inside a map
instance, from what the instance KEEPS**: its item, while a node of it may still be entered, which `"$item"` names
(section 3).

**`ctx.needs` is `{}` when the edge declares nothing**, never `undefined`; it is **frozen**, so a
predicate that writes to it throws rather than editing what the next predicate reads — and from 0.10.0 so does a
write INTO a value under a reference or `"$payload"` key, the run's one shared frozen copy (section 3), and a predicate
that throws stops the run; and a reference
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

// THE REGISTRY — one worker, one type, and the NAME of a predicate the flow may use. The predicate
// itself is code, passed to `createRuntime` under that name. The worker tags its input with a label.
const registry: RegistryDocument = {
  workers: { tag: { url: '../../examples/getting-started/tag.ts' } },   // in your program: './tag.ts'
  nodeTypes: { Tag: { worker: 'tag', inline: true } },
  predicates: ['isLowConfidence'],
};
// `result` is `null` when an optional task failed, so a predicate guards it.
const isLowConfidence: Predicate = (ctx) => {
  const r = ctx.outcome.result as { confidence?: number } | null;
  return typeof r?.confidence === 'number' && r.confidence < 0.5;
};

// THE FLOW — a DECISION, a FAN-OUT, a JOIN. `ingest` goes to `review` when the predicate holds,
// otherwise to `split`. `split` runs two branches concurrently; `collect` waits for both and hands
// `publish` every branch's result, keyed by branch path.
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

// ONE runtime, TWO runs. Pools belong to the runtime and are shared; each run has its own state.
const runtime = createRuntime(registry, { predicates: { isLowConfidence } }, { base: import.meta.url });
const run = (payload: unknown) => runtime.start(flow, payload).done;
const high = await run({ confidence: 0.9 });
const low = await run({ confidence: 0.2 });
await runtime.shutdown();

// Which nodes ran: the decision took a different edge each time.
const ran = (s: RunState) => Object.values(s.nodes).map((n) => n.nodeId).sort();
const resultOf = (s: RunState, id: string) => Object.values(s.nodes).find((n) => n.nodeId === id)?.result;
console.log(ran(high));                    // [ 'classify', 'enrich', 'ingest', 'publish' ]
console.log(ran(low));                     // [ 'ingest', 'review' ]
console.log(resultOf(high, 'publish'));    // { '0': { confidence: 0.9, ingest: true, enrich: true }, '1': { …, classify: true }, publish: true }

// Verified by the docs gate:
if (high.outcome !== 'completed' || low.outcome !== 'completed') throw new Error(`outcomes ${high.outcome} / ${low.outcome}`);
if (ran(high).join() !== 'classify,enrich,ingest,publish') throw new Error(`high ran ${ran(high).join()}`);
if (ran(low).join() !== 'ingest,review') throw new Error(`low ran ${ran(low).join()}`);
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
| the rest of the run | a task still in flight is **routed nowhere** when it settles — a bare `Driver` still records it; on a runtime, once `done` has settled the run is RELEASED and later settlements reach no driver (section 12, [ADR 0091](doc/decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)); a parked task stays parked and `resolve()` returns `false`; a join it left waiting never fires, and the run is NOT `stuck`. **Also on your own stack**: a cancel raised SYNCHRONOUSLY from your own `onFoldInput` — while a fan-out is dispatching its branches, a resolution is routing, or a resume is handing its tasks back — holds every further dispatch, as a halt does (`RN-R29`, [ADR 0103](doc/decisions/0103-every-halt-shares-one-dispatch-hold.md)); the one task whose own `dispatched` element you were handed is still handed to the scheduler |
| what is reported | nothing: a cancel is not a refusal, so `onRunFailure` is not called and `hasFailed()` stays `false` — read `state.outcome` |
| `done` | settles on the FIRST cancel, with `outcome: 'cancelled'` — the run's other tasks may still be running; cancel those by id, or cancel the RUN with `driver.cancel` instead (below), whose `done` waits for every task to stop |
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

**That is a cancel the run NOTICES** — one you made through the scheduler, by task id, and the run ends the
moment the first is heard. To cancel the RUN, ask the driver.

**`'cancelled'` is a NEW value of four published unions** — `TerminalState`, `NodeState`, `RunOutcome` and
`ResumeRefusalReason`. **A `switch` that is exhaustive over any of them no longer compiles, which is the
loud half; code that compares strings sees a value it never named and does not notice, which is the
silent half.** A `Record<RunOutcome, …>` needs a seventh key — and since 0.8.0 an eighth, `cancelling`, below, and a ninth, `interrupted` (section 18).

### Cancelling a RUN — `driver.cancel`

**`driver.cancel({ actor, reason?, graceMs? })` cancels the whole run and resolves once every task it
cancelled has stopped** (`RN-R31`,
[ADR 0104](doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)). In
order: the run is HELD — nothing is dispatched or routed for it again (`RN-R29`); ONE fold input,
`{ kind: 'cancelRequested', actor, reason }`, is appended; then the scheduler's `cancel(id, { reason, graceMs })`
is called for each task IN FLIGHT. Each task still ends with the scheduler's own `task.cancelled` (or whatever it
reached first), appended and routed nowhere. **The run reads `cancelling` until its LAST task has stopped, and
`cancelled` after** (`RN-R30`) — so a runtime's `done` settles after the last `task.cancelled`, not at the first.

| | what happens |
|---|---|
| a task RUNNING, WAITING behind a group, in a retry BACKOFF, or not yet picked up by a thread | each is cancelled; a waiting or backing-off one settles INSIDE the call, a running one when its worker stops |
| a task PARKED at `user_action` | nothing is sent — it is not in flight, and the scheduler cannot end it. It stays `suspended`, the run does not wait on it, and `resolve()` is refused (P34 (i)) |
| an ASK waiting for a person (section 7) | the same as a parked task: nothing is sent — it was never dispatched, so it is never in flight. It stays `suspended` and its answer is refused; a run waiting ONLY on asks and parked tasks reads `cancelled` at once, and a runtime's `done` settles at once ([W181](doc/work-items/w181-an-ask-under-run-control.md), `RN-R38`) |
| a task HELD by a pause (section 8) | handed on to the scheduler, then cancelled at once — so it too ends with the scheduler's own `task.cancelled` |
| a task a WORKER spawned (`context.spawnTask()`) | **not cancelled** — the driver knows only what it dispatched. Track those ids from `task.spawn_request` and cancel each yourself (the scheduler's own recipe) |
| a SECOND call | appends nothing, and forwards its `graceMs` to each task still stopping — a shorter one shortens the wait, as pressing Cancel twice does on the scheduler |
| `graceMs: 0` | **a request, not a guarantee**: the scheduler arms a 0 ms timer, and a worker that honours its signal promptly can still beat it ([S12](doc/scheduler-upstream.md)). A test needing a FORCED stop uses a worker that ignores its signal |
| refused | **`RunControlRefused`, by `reason`, with nothing recorded or sent**: `unsupported` (the scheduler has no `cancel` — section 12), `not-started`, `halted`, `cancelled` (a task the scheduler cancelled on its own already ended the run), `ended` (nothing in flight, nothing parked, the driver at rest — a cancel from your own callback mid-step is accepted, and stops what the step would have dispatched) and `interrupted` (the run was STOPPED — cancel it where it resumes, section 18) — and a bad `graceMs` throws `TypeError` or `RangeError`, as the scheduler would |
| a resume | refused, `reason: 'cancelled'`, at the `cancelRequested` element (section 18) |
| your `onFoldInput` THROWS on the `cancelRequested` element | every task in flight is still sent its cancel and every task a pause held handed on and cancelled — in a `finally` (`RN-R31`) — and THEN the run is HALTED and reported once, and the throw reaches `cancel()`'s caller (section 9, [W184](doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md)). `halted` outranks `cancelling`, so a runtime's `done` settles `halted` at once; the tasks still stop, routed nowhere. *Until 0.8.0's W178 it sent none, and a paused run read `cancelling` for ever; until W184 the run read `cancelling`, unhalted* |

```ts run
import { Driver, RunControlRefused, fold, liveToken, resumeRefusal, type FlowDefinition } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'cancel-run', version: 1, entry: 'split',
  nodes: [
    { id: 'split',   kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a',       kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b',       kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end', outcome: 'completed' },
  ],
};

// A fake scheduler WITH the scheduler's own `cancel(taskId, options)`: a running task stops when its worker does.
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const added: string[] = [];
const sent: { id: string; graceMs?: number }[] = [];
const stopping = new Map<string, { promise: Promise<boolean>; resolve: (stopped: boolean) => void }>();
const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
const scheduler = {
  addTask(task: unknown) { added.push((task as { id: string }).id); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
    listeners.set(type, [...(listeners.get(type) ?? []), fn]);
  },
  cancel(id: string, options?: { reason?: unknown; graceMs?: number }) {
    sent.push({ id, graceMs: options?.graceMs });
    // A repeat call while the task is still stopping returns the SAME promise, as the scheduler's does.
    let s = stopping.get(id);
    if (!s) {
      let resolve!: (stopped: boolean) => void;
      s = { promise: new Promise<boolean>((r) => { resolve = r; }), resolve };
      stopping.set(id, s);
    }
    return s.promise;
  },
};
// The worker of `id` has stopped: the scheduler fires `task.cancelled`, and its `cancel()` resolves.
const stops = (id: string) => { fire('task.cancelled', { id, state: 'cancelled' }); stopping.get(id)?.resolve(true); };

const options = {
  runId: 'run-1', createTask: (c: unknown) => c, predicates: new Map(),
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } }, joinPolicy: liveToken,
};
const driver = new Driver(flow, { ...options, scheduler });
driver.start({});

const cancelled = driver.cancel({ actor: 'ana', reason: 'no longer needed', graceMs: 2000 });
console.log(sent.map((s) => s.id), fold(driver.foldInputs()).outcome);   // [ 'run-1:a:0:0', 'run-1:b:1:0' ] cancelling
if (fold(driver.foldInputs()).outcome !== 'cancelling') throw new Error('a run whose tasks are stopping is `cancelling`');

stops('run-1:a:0:0');
console.log(fold(driver.foldInputs()).outcome);   // cancelling — b has not stopped yet
if (fold(driver.foldInputs()).outcome !== 'cancelling') throw new Error('`cancelled` waits for the LAST task');

// Press Cancel again: nothing is recorded, and the task still stopping is sent the shorter graceMs.
void driver.cancel({ actor: 'ana', graceMs: 0 });
console.log(sent.at(-1));   // { id: 'run-1:b:1:0', graceMs: 0 }
if (sent.length !== 3 || sent[2]!.id !== 'run-1:b:1:0' || sent[2]!.graceMs !== 0) throw new Error('the second call escalates what is still stopping');

stops('run-1:b:1:0');
await cancelled;
const state = fold(driver.foldInputs());
console.log(state.outcome, state.cancelRequest);   // cancelled { actor: 'ana', reason: 'no longer needed' }
if (state.outcome !== 'cancelled' || state.cancelRequest?.actor !== 'ana') throw new Error('cancelled, by ana');
if (driver.foldInputs().filter((e) => e.kind === 'cancelRequested').length !== 1) throw new Error('ONE element for two calls');
if (added.includes('run-1:publish:-:0')) throw new Error('a cancelled run routes nowhere');
if (resumeRefusal(flow, driver.checkpoint())?.reason !== 'cancelled') throw new Error('a cancelled run is not resumable');

// A scheduler with no `cancel` drives a run, and refuses to cancel it — by name, before recording anything.
const plain = new Driver(flow, { ...options, runId: 'run-2', scheduler: { addTask() {}, addEventListener() {} } });
plain.start({});
let refused: unknown = null;
try { void plain.cancel({ actor: 'ana' }); } catch (e) { refused = e; }
console.log(refused instanceof RunControlRefused && refused.reason);   // 'unsupported'
if (!(refused instanceof RunControlRefused) || refused.reason !== 'unsupported') throw new Error('no cancel, no run cancel');
if (plain.foldInputs().some((e) => e.kind === 'cancelRequested')) throw new Error('and nothing was recorded');
```

**BREAKING in 0.8.0, in four places** (P34 decision 10): `RunOutcome` gains `'cancelling'` — the first NON-terminal
outcome since `awaiting_action`, so `isTerminal` is false for it and an exhaustive `switch` no longer compiles;
`FoldInput` gains the kind `'cancelRequested'`; `RunState` gains the cell `cancelRequest` (`null` until the owner
cancels), which a `RunState` literal must now carry; and `SchedulerLike` gains an OPTIONAL `cancel`, which breaks only
a double that declares a `cancel` of another shape (section 12).

---

## 7. The human in the loop

A non-optional task that runs out of retries ends in `user_action`. The branch **suspends**: the join
keeps waiting, and the run is not stuck.

**A node that waits for a person BY DESIGN is a different thing, and it is the `ask` kind** (section 3, since 0.8.0's
`spec/flow-definition.md` v0.42): no task fails to get there, and a question is not an error. **A run PARKS at it**
([W180](doc/work-items/w180-asking-and-answering-in-a-run.md), [ADR 0109](doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md), `spec/run-state.md` `RN-R36`/`RN-R37`):

- **Nothing is handed to the scheduler** — the scheduler never sees the ask's id. The driver appends ONE fold input,
  `{ kind: 'asked', taskId, input, observedAt? }`; the fold reads the node `suspended` and the run `awaiting_action`, exactly the
  words a parked task gives (so `done` waits, below), and the node's entry in `nodes` carries **`input`** — what reached
  the ask, its `needs` composed — kept after the answer. Tell an ask from a parked failure by the node's KIND, or by the
  `asked` element, never by an error string. In a fan-out the ask's branch is LIVE, so **its join waits for the person**.
- **WHEN it was asked** (since 0.11.0, [ADR 0130](doc/decisions/0130-a-regenerated-asked-element-keeps-the-stored-runs-time.md)):
  the element's `observedAt` is the driver's `now` — the clock an outcome record's `observedAt` reads — and the node's
  entry carries it as **`askedAt`**, kept after the answer as `input` is. **A resume KEEPS the stored time**: the replay
  regenerates the element and takes its stored `observedAt`, so a wait measured across a resume does not restart; past
  the stored tail it is the resumed driver's `now`. An `asked` element written before 0.11.0 has none, and its run
  resumes with none. **A driver older than 0.11.0 refuses a newer checkpoint `diverged` at its first ask** — resume a
  run on a driver at least as new as the one that wrote it.
- **The answer is `driver.resolve(taskId, …)`** — the same call as below. `'done'` with `result` the answer, held to the
  ask's `answerSchema` (refused as `BoundaryRefused` with NOTHING appended and the ask still parked — answer again;
  `validateBoundaries: false` turns it off); `'failed'` with an `error` is the person DECLINING, held to nothing.
- **The answer IS the node's result.** It routes as a task's settlement does — `on: ['failed']` for a decline, a `when`
  over `outcome.result` — the successor RECEIVES it, and a later `needs` naming the ask reads it; the value that reached
  the ask stays reachable by naming whatever produced it — and where NOTHING produced it, an ask at the ENTRY, by
  `"$payload"`, the run's payload (since 0.8.0, section 3: `needs: { invoice: '$payload', answer: 'approve' }`); and where
  the ask is a MAP's branch, by `"$item"`, the instance's own item (`needs: { invoice: '$item', answer: 'review' }`). A
  `"$payload"` key in an ask's OWN `needs` puts a copy of the whole payload into the `asked` element, and so into the
  run's log, once per ask — that element keeps what reached the ask, whatever its size. A predicate's `ctx.outcome` for an ask has `attempts: 0` and
  **`schedulerTimestamp`, `startTime`, `endTime` and `executionTime` all `null`** — no scheduler was involved.
- **BREAKING in 0.8.0** (P35 decision 8): `FoldInput` gains the kind `'asked'`, and `OutcomeRecord.schedulerTimestamp`
  is `number | null` — `null` only on an ask's effective outcome. `NodeRun.input` is optional and additive — as, since 0.11.0, are the element's `observedAt` and `NodeRun.askedAt`.
- **An answer given from a callback on the driver's own step** — `onFoldInput` on the `asked` element included — is
  checked at once (a refusal is thrown or `false` returned right there) and, accepted, `resolve()` returns `true` and the
  resolution is appended when the step ends: so the run's checkpoint resumes. A second answer while it is pending is
  refused. **The same holds for ANY `resolve()` made from such a callback**, a parked task's included (since 0.8.0).
- **On a resume** the replay re-enters the ask and REGENERATES its `asked` element — the same id, the same kept input,
  compared with what you stored as structured-clone data (a different one — a `Map` entry, a `Date` — is refused
  `diverged`) — and hands nothing to the new scheduler for it.
- **Under run control an ask is a parked task** ([W181](doc/work-items/w181-an-ask-under-run-control.md), `RN-R38`, P35 (g)): it was never dispatched, so it
  is never in flight. A **cancel** sends the scheduler nothing for it and the run reads `cancelled` once the tasks it did
  cancel have stopped — at once if nothing runs; a **stop** sends nothing for it and refuses its answer on that runtime,
  and the resume elsewhere re-parks it and takes the answer there; a **pause** holds nothing for it, and its answer is
  accepted while paused, whatever it routes to recorded and HELD until you unpause (section 8). A run waiting only on
  asks is not refused `ended` by any of them.

```ts run
import { BoundaryRefused, Driver, fold, liveToken, type FlowDefinition } from 'fyflow-orchestration';

// A scheduler double, section 12's shape: it RECORDS what it is handed and fires only what we tell it to.
const added: string[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const scheduler = {
  addTask(task: unknown) { added.push((task as { id: string }).id); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const done = (id: string, result: unknown) => {
  const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
  for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
};

const flow: FlowDefinition = {
  flowId: 'publish-review', version: 1, entry: 'draft',
  nodes: [
    { id: 'draft', kind: 'task', type: 'Draft', edges: [{ to: 'approve' }] },
    { id: 'approve', kind: 'ask', settings: { question: 'Publish this draft?' },
      answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
      edges: [
        { on: ['failed'], to: 'declined' },
        { when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'publish' },
        { to: 'declined' },
      ] },
    { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'end' }] },
    { id: 'declined', kind: 'end', outcome: 'declined' },
    { id: 'end', kind: 'end', outcome: 'completed' },
  ],
};
const driver = new Driver(flow, {
  runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken,
  workers: { w: { url: 'worker.js' } }, nodeTypes: { Draft: { worker: 'w' }, Publish: { worker: 'w' } },
});
driver.start({ topic: 'release notes' });
done('r1:draft:-:0', { text: 'a draft' });

// The run PARKED at the ask: nothing handed to the scheduler for it, the draft it was shown KEPT.
const parked = fold(driver.foldInputs());
console.log(added, parked.outcome, parked.nodes['r1:approve:-:0'].input);
// [ 'r1:draft:-:0' ] awaiting_action { text: 'a draft' }
if (added.join() !== 'r1:draft:-:0' || parked.outcome !== 'awaiting_action') throw new Error('the ask should park with nothing dispatched');
if (JSON.stringify(parked.nodes['r1:approve:-:0'].input) !== '{"text":"a draft"}') throw new Error('the ask keeps what reached it');
// And WHEN it was asked: the element's `observedAt` (the driver's clock, `Date.now()` by default) is the entry's `askedAt`.
const askedEl = driver.foldInputs().find((e) => e.kind === 'asked');
if (askedEl?.kind !== 'asked' || typeof askedEl.observedAt !== 'number' || parked.nodes['r1:approve:-:0'].askedAt !== askedEl.observedAt) throw new Error('the ask keeps when it was asked');

// An answer its schema refuses is thrown at you BY NAME — nothing appended, the ask still parked.
let refused: unknown = null;
try { driver.resolve('r1:approve:-:0', 'done', { result: { approved: 'yes' }, actor: 'ana' }); } catch (e) { refused = e; }
if (!(refused instanceof BoundaryRefused)) throw new Error(`a nonconforming answer is BoundaryRefused, got ${String(refused)}`);
if (fold(driver.foldInputs()).nodes['r1:approve:-:0'].state !== 'suspended') throw new Error('and the ask is still parked');

// The corrected answer IS the node's result: the `when` reads it, and `publish` is dispatched.
if (!driver.resolve('r1:approve:-:0', 'done', { result: { approved: true }, actor: 'ana' })) throw new Error('the answer was refused');
const outcome = driver.effectiveOutcomeOf('r1:approve:-:0');
console.log(added, outcome?.attempts, outcome?.schedulerTimestamp);   // [ 'r1:draft:-:0', 'r1:publish:-:0' ] 0 null
if (added.join() !== 'r1:draft:-:0,r1:publish:-:0') throw new Error('approved routes to publish');
if (outcome?.attempts !== 0 || outcome.schedulerTimestamp !== null) throw new Error('an ask`s outcome has no scheduler fields');
```

**Stopped, resumed elsewhere, and answered while paused** — the same flow, its run stopped while it waits on the person:

```ts run
import { Driver, fold, liveToken, type FlowDefinition } from 'fyflow-orchestration';

// A scheduler double per "runtime": it records what it is handed and cancelled, and fires only what we tell it to.
function schedulerDouble() {
  const added: string[] = [];
  const cancelled: string[] = [];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  return {
    added, cancelled,
    addTask(task: unknown) { added.push((task as { id: string }).id); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    cancel(id: string) { cancelled.push(id); return Promise.resolve(true); },
    done(id: string, result: unknown) {
      const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
      for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
    },
  };
}
const flow: FlowDefinition = {
  flowId: 'publish-review', version: 1, entry: 'draft',
  nodes: [
    { id: 'draft', kind: 'task', type: 'Draft', edges: [{ to: 'approve' }] },
    { id: 'approve', kind: 'ask', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'end' }] },
    { id: 'end', kind: 'end', outcome: 'completed' },
  ],
};
const driverOn = (scheduler: ReturnType<typeof schedulerDouble>) => new Driver(flow, {
  runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken,
  workers: { w: { url: 'worker.js' } }, nodeTypes: { Draft: { worker: 'w' }, Publish: { worker: 'w' } },
});

// RUNTIME A: the draft settles, the run parks at the ask — and is STOPPED. Nothing is sent for the ask.
const a = schedulerDouble();
const first = driverOn(a);
first.start({ topic: 'release notes' });
a.done('r1:draft:-:0', { text: 'a draft' });
await first.stop({ actor: 'ops', reason: 'upgrade' });
console.log(a.cancelled, fold(first.foldInputs()).outcome);   // [] interrupted
if (a.cancelled.length !== 0) throw new Error('a stop sends nothing for an ask: it is not in flight');
if (first.resolve('r1:approve:-:0', 'done', { result: { ok: true }, actor: 'ana' })) throw new Error('the answer is refused on the stopped runtime');

// RUNTIME B: the checkpoint resumed — the ask RE-PARKED with what it was shown, nothing handed on for it.
const b = schedulerDouble();
const second = driverOn(b);
second.resume(first.checkpoint());
console.log(b.added, fold(second.foldInputs()).nodes['r1:approve:-:0'].input);   // [] { text: 'a draft' }
if (b.added.length !== 0 || fold(second.foldInputs()).outcome !== 'awaiting_action') throw new Error('re-parked, nothing handed on');

// PAUSED, the answer is accepted — and what it routes to is recorded and HELD until the unpause.
second.pause({ actor: 'ops' });
if (!second.resolve('r1:approve:-:0', 'done', { result: { ok: true }, actor: 'ana' })) throw new Error('answered while paused');
if (b.added.length !== 0) throw new Error('publish is held while paused');
second.unpause({ actor: 'ops' });
console.log(b.added);   // [ 'r1:publish:-:0' ]
if (b.added.join() !== 'r1:publish:-:0') throw new Error('the unpause hands publish on');
b.done('r1:publish:-:0', 'published');
if (fold(second.foldInputs()).outcome !== 'completed') throw new Error('the run completes on runtime B');
```

**A flow that waits for a person because a task FAILED** is the parked task below — the road an ask replaces for a
question asked by design, and still the road for a task out of retries.

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
// `outcome !== 'running' && outcome !== 'awaiting_action' && outcome !== 'cancelling'` — so a run parked on a person is not
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
you may retry. It does **one** thing: supply an outcome for a dispatch that already happened — or, for
an ask, the answer to a node that dispatched nothing (above). It cannot re-run the node and it cannot send it
somewhere else. It also returns `false` once the run has
been **halted** by a refusal (section 9), and there retrying can never succeed: check
`driver.hasFailed()` to tell the two `false`s apart.

A resolved node is **indistinguishable** from one that settled that way: same node state, same
`result`, same routing.

> **A suspended run never finishes on its own, and that is correct.** If you are waiting for a run to
> reach a terminal outcome, `awaiting_action` is not one — see section 8.

---

## 8. Run state

**Run state is a pure fold of an ordered log.** The driver produces the sequence; `fold` turns it
into state and touches nothing else.

**What it costs** — `RN-R43`, from 0.9.0 ([ADR 0120](doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md)):
**`fold(inputs)` is linear in its inputs** — a `map` over 4,000 items folds in milliseconds, where 0.8.0 took half a
minute — and **`step(state, input)` is pure and costs O(the state it is handed)**: it never mutates the state you give
it, so wherever the input moves something it copies what changed into a new state (and hands yours back where nothing
moves) — and stepping every input of a long run yourself costs O(run²) in total. Fold the sequence when you
need the state; step only where you hold a short one. Both return exactly what they did in 0.8.0, on every sequence a driver appends (`RN-R43` states its one limit).
**The driver's own work per settlement does not grow with the run either** — `RN-R13` v0.30, from 0.9.0
([ADR 0121](doc/decisions/0121-the-driver-keeps-a-per-task-view-of-its-log.md)): every question it asks of its log about
ONE task — a settlement's effective outcome, whether a task is parked, what is in flight, what a `needs` can reach — reads
that task's records alone (and from 0.9.1 a `needs` read takes the outputs it is handed rather than searching its node's —
`RN-R13` v0.32, [ADR 0124](doc/decisions/0124-a-reference-read-costs-its-answer.md); and from 0.10.0 it is handed ONE shared copy of each output, made at the first read and kept for the run, rather than a clone per read — `RN-R13` v0.33, [ADR 0126](doc/decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md)), where 0.8.0 scanned the whole log (a 16,000-item `map` driven on a scheduler double: 999 ms in
0.8.0, 229 ms from 0.9.0, node 24). `snapshot()`, `foldInputs()` and `checkpoint()` still hand you a copy of the whole run,
O(run) a call: read them when you need the run, not after every event.

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
  // The run's OWNER stops it to resume it elsewhere (section 18) while `b` is still in flight: `interrupted`.
  ['interrupted',     [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       { kind: 'interrupted', actor: 'ops', reason: null }]],
  // The OWNER cancels it (section 6) while `b` is still running: `cancelling`. (The driver refuses a cancel after a
  // stop, but a fold must answer every sequence.)
  ['cancelling',      [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       { kind: 'interrupted', actor: 'ops', reason: null },
                       { kind: 'cancelRequested', actor: 'ops', reason: null }]],
  // ... and `b`, the last task in flight, has stopped: `cancelled`.
  ['cancelled',       [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       { kind: 'interrupted', actor: 'ops', reason: null },
                       { kind: 'cancelRequested', actor: 'ops', reason: null }, settled('r1:b:-:0', 'cancelled')]],
  ['halted',          [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end'),
                       ended('no-eligible-edge'), openJoin, dispatched('r1:b:-:0'),
                       dispatched('r1:c:-:0'), settled('r1:c:-:0', 'user_action'),
                       { kind: 'interrupted', actor: 'ops', reason: null },
                       { kind: 'cancelRequested', actor: 'ops', reason: null }, settled('r1:b:-:0', 'cancelled'),
                       { kind: 'halted', reason: 'DuplicateTaskId: x' }]],
];
for (const [expected, inputs] of rows) {
  const got = fold(inputs).outcome;
  console.log(expected, '->', got);
  if (got !== expected) throw new Error(`precedence: expected ${expected}, got ${got}`);
}

// `isTerminal` is false for exactly `running`, `awaiting_action` and `cancelling`.
const terminal = Object.fromEntries(rows.map(([o, i]) => [o, isTerminal(fold(i))]));
console.log(terminal);   // completed/failed/stuck/interrupted/cancelled/halted true, running/awaiting_action/cancelling false
if (!terminal.stuck) throw new Error('`stuck` is terminal — that is the point of it existing');
if (terminal.running || terminal.awaiting_action) throw new Error('a live run is not terminal');
if (terminal.cancelling) throw new Error('a run whose tasks are still stopping is not terminal');
if (!terminal.completed || !terminal.failed || !terminal.cancelled || !terminal.halted) {
  throw new Error('completed, failed, cancelled and halted are all terminal');
}
if (!terminal.interrupted) throw new Error('a stopped run is terminal HERE — a resume elsewhere continues it');

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

### The nine outcomes, highest first

| | means |
|---|---|
| `halted` | a refusal terminated the run — section 9. *`stopped` until 0.8.0 (ADR 0102); a stored `stopped` element folds as this* |
| **`cancelled`** | **a task of the run was cancelled by the scheduler on its own, and the driver halted it — or the run's owner cancelled it with `driver.cancel` and every task has stopped** — section 6. It outranks everything below it, a parked task and a waiting join included |
| **`cancelling`** | **the run's owner cancelled it and a task is still stopping** — section 6, since 0.8.0. **NOT terminal**: `done` waits for the last task. It outranks everything below it |
| **`interrupted`** | **the run's owner STOPPED it to resume it elsewhere** — section 18, since 0.8.0. Terminal on this runtime and the ONE terminal outcome a resume accepts; a `resumed` event ends it. It outranks everything below it, a parked task included |
| `awaiting_action` | a node is suspended and nobody has resolved it |
| `running` | a dispatched node has not settled |
| **`stuck`** | nothing is live and **nothing ever will be**: a join has not fired and cannot |
| `failed` | a path ended with no eligible edge |
| `completed` | every live path reached an `end` node |

**Read the outcome at a quiescent point** — after the driver's turn, not part-way through it. The
fold is defined over any prefix, and a prefix taken mid-turn is not a resting state: a settlement is
recorded before the routing it causes, so there are instants where nothing is running and the run is
not over. If you fold `driver.foldInputs()` after the fact you are always at a quiescent point; if
you read a run as it goes — a runtime's `handle.outcome()` from `onFoldInput` (below), or a fold you keep yourself on a
bare `Driver` — read on a `queueMicrotask` — and that microtask is
**load-bearing rather than decoration**, which is why `done` asks its own predicate at one
([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)
rule 6). *(That phrase lived in §2's copied block until [W78](doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md)
reduced it to `await done`; ADR 0058's Context cites it, so it moved here rather than going out with
the block — W78's conformity reader, finding 3.)*

**`isTerminal(state)` is how you wait for a run without a clock.** It is false for `running`,
`awaiting_action` and `cancelling` and true for everything else — `interrupted` included, though a resume ELSEWHERE continues that run — and `stuck`, which is the point: before
`stuck` existed, a permanently hung run folded to `completed` and a waiter reported success.

**And `done` is that rule applied for you.** `runtime.start` returns `{ driver, done, header, stop, state, outcome, node }` —
`header` is the run's CHECKPOINT header since
[ADR 0064](doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md),
and `driver.checkpoint()` hands out the header with every event so far (`spec/run-state.md`
section 8) — and, since 0.8.0, `start`'s `onHeader` option hands you the same header BEFORE the first event (section 18); `runtime.resume(flow, checkpoint)` resumes a run from one, returning the same handle
([ADR 0065](doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md), `spec/run-state.md` section 9 — section 18 teaches it, as an executed snippet) — and `done`
resolves with the first `RunState` this predicate calls terminal
([ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)). It
is the same two functions — the runtime keeps the fold's own accumulator open, applies each input to it (`RN-R44`, from
0.9.0; it stepped one `RunState` per input until then) and asks
`isTerminal` at a quiescent point — so there is one definition of *over* with one more caller, and
nothing above about reading at rest stops being true. **Three things follow, and two of them catch
people:**

- **`done` never rejects.** `failed`, `stuck`, `cancelled` and `halted` are terminal OUTCOMES, not
  errors, so a run that goes wrong arrives as `state.outcome`. A driver refusal resolves it with
  `halted` and `haltedBy` naming the refusal — section 9; a task the scheduler cancelled on its own
  resolves it with `cancelled` on the FIRST cancel, while the run's other tasks may still be running —
  section 6 — and `driver.cancel` resolves it with `cancelled` only once its LAST task has stopped,
  the run reading `cancelling` until then. A run its owner STOPPED (`handle.stop()`, section 18)
  resolves it with `interrupted` once the stop's cancels have resolved — not at the stop. **Either resolves it with
  `halted` AT ONCE if your callback threw on the `cancelRequested` or `interrupted` element** (section 9).
- **`awaiting_action` is NOT terminal, so `done` waits through it.** A run parked on a person stays
  pending until somebody calls `resolve()`, which is correct and is the trap: if you are waiting for
  a run and a human is in it, you are waiting for the human. Section 7 is the worked case.
- **There is no deadline and there is no option for one**, because once `done` is a promise
  `Promise.race([done, timeout])` is your one line — and a library default would be wrong for the
  bullet above.

### Reading a run WHILE it runs — `handle.state()`, `outcome()` and `node()`

**From 0.9.0 the handle `start` and `resume` return reads the run's state live** (`RN-R44`,
[ADR 0122](doc/decisions/0122-a-runtimes-live-state-is-a-frozen-copy-on-its-handle.md)) — so a consumer showing a run as it
goes no longer folds it a second time in its own `onFoldInput`:

| read | what it is | costs |
|---|---|---|
| `handle.outcome()` | the run's outcome now | O(1) — **the read to make after every input** |
| `handle.node(taskId)` | that task's `nodes` entry now — the same frozen object `state()` holds — or `null` for a task the run never dispatched | O(1) in the run — its first read of an entry freezes that entry once |
| `handle.state()` | the whole `RunState` now: a COPY, **frozen at every depth**, and the SAME object on every read until an input moves the run | O(run) for the first read after each input that moved it, nothing after — **so reading it after EVERY input costs O(run²) over a run**: read it when you draw the run |
| `handle.inputOf(target)` | what a node of the run was HANDED — a task's envelope, any other node's input (since 0.10.0, *What a node was HANDED* below) | O(the run so far) per call — a replay, never cached: read it when a person asks |

**At a quiescent point `handle.state()` IS `fold(handle.driver.foldInputs())`** — the same rule as above: read on a
`queueMicrotask` from `onFoldInput`, or outside the driver's turn. **It is not a live view** — a read is the state at that
moment, and the next input makes a new one beside it; writing to it throws in strict code and reaches nothing the runtime
keeps. **`done` resolves with the object `state()` returns then**, so `await done === handle.state()` once it has settled —
until you `unpause` a run that finished while paused, the one run control a finished run still takes: `state()` follows
that element, and `done` keeps the state at settlement. On a RESUMED run the reads hold the stored events too. **What
`Object.freeze` does not stop stays writable** — a typed array's elements, an `ArrayBuffer`'s bytes, a `Date`'s time, a
`Map`'s or `Set`'s membership — and a write there reaches later reads and `done`: return plain data, read plain data. **Nothing is added to `onFoldInput`**:
what it hands you is unchanged, and the runtime keeps its own copy of every result rather than sharing yours.

**BREAKING in 0.9.0** (P39 (d) and (f)): `RunHandle` gains `state`, `outcome` and `node`, which breaks only code that BUILDS
a handle; and `await done` is FROZEN — code that wrote into the state `done` resolved with now throws.

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { fold, type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';

const registry: RegistryDocument = {
  workers: { scorer: { url: '../../examples/getting-started/scorer.ts' } },
  nodeTypes: { Scorer: { worker: 'scorer', inline: true } },
};
const flow: FlowDefinition = {
  flowId: 'live', version: 1, entry: 'a',
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
// The CHEAP read after every input, on a microtask: the driver's turn is over by then (RN-R12). The microtasks of the
// inputs `start` delivers before it returns run after it has, so `handle` is there for every one.
const outcomes: string[] = [];
const handle = runtime.start(flow, {}, {
  onFoldInput: () => queueMicrotask(() => { outcomes.push(handle.outcome()); }),
});
const end = await handle.done;
await runtime.shutdown();
console.log(outcomes.length, outcomes.at(-1), end.outcome);   // one outcome per input, the last 'completed'

const a = `${handle.driver.runId}:a:-:0`;
if (outcomes.length < 10 || outcomes.at(-1) !== 'completed') throw new Error(`one outcome() per input, the last completed: ${outcomes.join()}`);
if (outcomes.some((o) => o !== 'running' && o !== 'completed')) throw new Error(`a run with nobody in it reads running, then completed: ${outcomes.join()}`);
// `done` and `state()` are ONE object, and it is the caller's own fold — key order included.
if (end !== handle.state()) throw new Error('await done is the object state() returns — one copy, not two');
if (JSON.stringify(end) !== JSON.stringify(fold(handle.driver.foldInputs()))) throw new Error('state() is the fold of what the driver appended');
// `node()` is the state's own entry — no copy — and null for a task the run never dispatched.
if (handle.node(a) !== end.nodes[a] || handle.node(`${handle.driver.runId}:nope:-:0`) !== null) throw new Error('node() reads the state`s own entry, or null');
// Frozen at every depth: the run, its nodes, an entry and the result inside it.
if (!Object.isFrozen(end) || !Object.isFrozen(end.nodes) || !Object.isFrozen(end.nodes[a]) || !Object.isFrozen(end.nodes[a]!.result)) throw new Error('state() is frozen at every depth');
let wrote = true;
try { (end.nodes[a]!.result as { score: number }).score = 1; } catch { wrote = false; }
if (wrote) throw new Error('a write into the run`s state must throw — it is a copy to read, not a document to edit');
```

### What a node was HANDED — `inputOf` and `handle.inputOf`, after the fact

**A run keeps what its tasks RETURNED, never what they were handed** — `RunState` holds an ask's input (`NodeRun.input`)
and no task's ([ADR 0046](doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)),
and no function over `RunState` can rebuild it exactly: the entry's payload, the edge each node took, what was visible at
the moment of dispatch and a gate's memory are not in it. **From 0.10.0 you READ it instead** (`RN-R45`,
[ADR 0128](doc/decisions/0128-what-a-node-was-handed-is-read-by-replaying-the-run-to-its-composition.md)):

```
inputOf(flow, options, { header, events }, target)   // the root export — a stored run, its runtime gone or not
handle.inputOf(target)                               // a live run: the same function over its own checkpoint()
```

It builds a driver for the stored run — DEAF: no callback, nothing handed to any scheduler — and REPLAYS the stored
events, exactly as `resume()` does, until the target's composition. **So the answer is the driver's own composition,
not a second one**, and costs the run's prefix up to the target. `options` is what the run's driver was built from:
`runtime.registry`, plus its `joinPolicy` where you did not use `liveToken`.

| target | the node is | `inputs` |
|---|---|---|
| `{ taskId }` or `{ nodeId, branchPath }` | a **task** | one `envelope`: `{ settings, input, transform? }` — what the driver handed `createTask`, BEFORE any transform; a retry and a resolution share it |
| the same | an **ask** | one `received` — equal to its `asked` element's `input` |
| `{ nodeId, branchPath }` | a **gate**, **fanout**, **map** or **end** | one `received` — what reached it on that path; an end's path is the branch that reached it |
| `{ nodeId, branchPath }` | a **join**, at an ARRIVING branch's path | one `arrival` — what that branch carried in, a late arrival after an early firing included |
| `{ nodeId, branchPath }` | a **join**, at its OPENER's path | one `collection` — what it handed on when it fired |
| `{ nodeId }` | anything | EVERY one of the above the run reached, in the order it reached them — the paths an END was reached on included, which nothing else names |

A path target answers the FIRST composition on its path: an end shared by two sibling regions can be reached twice on one
path, and only `{ nodeId }` lists both.

**It never throws for the run or the target** — only for a flow or a registry no driver can be built from, as `new Driver` throws — `{ ok: false, reason, index, message }`: `unknown` (a target this run's
ids cannot name), `not-reached`, `diverged` (the replay produced something other than a stored element BEFORE the
target — a changed predicate or definition), and `format` / `flow` (the header, refused as a resume refuses it). **A
halted, cancelled or stopped run IS read**, up to its halt. **What it cannot see**: a change to the flow or the registry
AFTER the target — or one that moves only an envelope, even at the target: the events carry no payloads, so a reading
answers with the definition you hand it. **It re-runs your predicates and gate types**, as a resume does. The value is
the reading's own — a value a `needs` reference composed is frozen, as every reader's is (section 3), the rest yours —
and nothing of a live run is reachable through it. **The input a task's worker sees AFTER its transform is not answered**
([Q760](doc/questions/q760.md), resolved by P43: the road serves): hand the envelope's `input` to `tryTransform` (section 15). **BREAKING in 0.10.0**:
`RunHandle` gains `inputOf`, which breaks only code that BUILDS a handle.

```ts run
import { Driver, inputOf, liveToken, type FlowDefinition, type InputOfOptions } from 'fyflow-orchestration';

// A scheduler double, section 12's shape: it records what it is handed and fires only what we tell it to.
const added: { id: string; payload: unknown }[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const scheduler = {
  addTask(task: unknown) { added.push(task as { id: string; payload: unknown }); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const settle = (id: string, result: unknown) => {
  const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
  for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
};

// A map over invoices; each check reads its invoice and the run's payload; a rejected one ENDS in the map.
const flow: FlowDefinition = {
  flowId: 'invoices', version: 1, entry: 'fetch',
  nodes: [
    { id: 'fetch', kind: 'task', type: 'Fetch', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'invoices', branch: 'check' },
    { id: 'check', kind: 'task', type: 'Check', needs: { invoice: '.', run: '$payload' }, edges: [
      { when: { path: 'outcome.result.ok', op: 'eq', value: false }, to: 'rejected' },
      { to: 'joined' },
    ] },
    { id: 'rejected', kind: 'end', outcome: 'rejected' },
    { id: 'joined', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
// What the run's driver was built from — and so what a reading builds its own from (joinPolicy: liveToken by default).
const options: InputOfOptions = { predicates: new Map(), workers: { w: { url: 'worker.js' } }, nodeTypes: { Fetch: { worker: 'w' }, Check: { worker: 'w' } } };
const driver = new Driver(flow, { runId: 'r1', scheduler, ...options, joinPolicy: liveToken });
driver.start({ tenant: 't1' });
settle('r1:fetch:-:0', { invoices: [{ id: 'INV-1' }, { id: 'INV-2' }, { id: 'INV-3' }] });
settle('r1:check:2:0', { ok: false });
settle('r1:check:0:0', { ok: true });
settle('r1:check:1:0', { ok: false });

// What a store keeps: the header and the events (section 18). Read them back — the run's process may be long gone.
const stored = driver.checkpoint();
const task = inputOf(flow, options, stored, { taskId: 'r1:check:1:0' });
console.log(task.ok && task.inputs[0]!.value);   // { settings: {}, input: { invoice: { id: 'INV-2' }, run: { tenant: 't1' } } }
const ends = inputOf(flow, options, stored, { nodeId: 'rejected' });
console.log(ends.ok && ends.inputs.map((i) => [i.branchPath, i.value]));   // [['2', { ok: false }], ['1', { ok: false }]]
const nope = inputOf(flow, options, stored, { nodeId: 'audit' });
console.log(nope.ok ? 'answered' : nope.reason);   // 'unknown'

// The answer IS what the driver handed the scheduler — the same envelope, built by the same code.
const handed = added.find((t) => t.id === 'r1:check:1:0')!.payload;
if (!task.ok || JSON.stringify(task.inputs[0]!.value) !== JSON.stringify(handed)) throw new Error('a task`s answer is the envelope it was handed');
if (JSON.stringify(handed) !== '{"settings":{},"input":{"invoice":{"id":"INV-2"},"run":{"tenant":"t1"}}}') throw new Error(`check@1 was handed ${JSON.stringify(handed)}`);
// A node id alone: every path the END was reached on, in the order the run reached them — 2 before 1.
if (!ends.ok || JSON.stringify(ends.inputs.map((i) => i.branchPath)) !== '["2","1"]') throw new Error('rejected was reached at 2, then 1');
if (ends.inputs.some((i) => i.handed !== 'received' || JSON.stringify(i.value) !== '{"ok":false}')) throw new Error('an end is handed what reached it');
if (nope.ok || nope.reason !== 'unknown') throw new Error('a node the flow does not have is unknown');
// A prefix of the events — a store that has not caught up — reads what it holds and no more.
const early = inputOf(flow, options, { header: stored.header, events: stored.events.slice(0, 4) }, { taskId: 'r1:check:1:0' });
if (early.ok || early.reason !== 'not-reached') throw new Error('a task the prefix did not dispatch is not-reached');
```

### Pausing a run — `driver.pause` / `driver.unpause`, and a FLAG that is not an outcome

**`driver.pause({ actor })` holds a run without ending it, and `driver.unpause({ actor })` lets it go on** (`RN-R35`,
[ADR 0106](doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md)). While it
is paused the run still ROUTES — a settlement's successor is chosen, a join settles, `resolve()` is accepted — and every
task it dispatches is RECORDED and HELD: its `dispatched` event is in the log, and nothing new reaches the scheduler.
The tasks the scheduler already has run on and finish. The unpause hands the held tasks on **in the order they were
dispatched**. Each call is ONE fold input, `{ kind: 'paused', actor }` or `{ kind: 'unpaused', actor }`.

**The fold reads `state.paused` — a FLAG, NOT one of the nine outcomes above**: a held task is dispatched, so it reads
`running`, and so does the run. Nothing about `outcome`, `isTerminal` or `done` changes; a paused run whose tasks all
finish and whose paths all end still `completed`s. **And `paused` can read `true` on a run that has ENDED**: only an
unpause clears it, and a cancelled or halted run refuses one — read `outcome` first, and `paused` only on a live run.

| | what happens |
|---|---|
| a task the scheduler already has | runs on and settles, and its settlement routes as ever — what it routes to is held |
| `resolve()` on a parked task | accepted; its successor is held |
| an ASK's answer (section 7) | the same: accepted, and whatever it routes to is recorded and HELD until the unpause. Nothing is held FOR the ask — it was never going to be handed on ([W181](doc/work-items/w181-an-ask-under-run-control.md), `RN-R38`) |
| a call from your own callback, mid-step | accepted, and taken when the driver's step ends — so that step's dispatches are handed on. **Pause before the settlement whose successor you want held** |
| `handle.stop()` / `driver.stop()` of a paused run | cancels only what the scheduler has; a held task is sent nothing and stays in flight — and the checkpoint resumes **PAUSED** elsewhere, EVERY task in flight held until you unpause there, the ones that were running at the stop included (section 18) |
| `driver.cancel()` of a paused run | hands each held task on and cancels it, so the scheduler settles every one — `cancelling`, then `cancelled` (section 6) |
| refused | `RunControlRefused`, `control: 'pause'` or `'unpause'`, by `reason`: `not-started`, `halted`, `cancelled`, `interrupted` (a stopped run — pause it where it resumes), `paused` (a second pause), `not-paused` (an unpause of a run not paused), and for a pause only `ended` — nothing recorded |
| your `onFoldInput` THROWS on the `paused` or `unpaused` element | the element is in the log — an unpause's held tasks still handed on, in a `finally` — and then the run is HALTED and reported once, and the throw reaches the caller of `pause()` or `unpause()`, or of the call whose step took it; on a scheduler event's step nothing is thrown (section 9, `RN-R35`). *Until [W184](doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md) a throw on your own call's step reached you with the run going on, paused or running* |

```ts run
import { Driver, fold, liveToken, type FlowDefinition } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'pause-run', version: 1, entry: 'split',
  nodes: [
    { id: 'split',   kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a',       kind: 'task', type: 'T', edges: [{ to: 'a2' }] },
    { id: 'b',       kind: 'task', type: 'T', edges: [{ to: 'b2' }] },
    { id: 'a2',      kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b2',      kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end', outcome: 'completed' },
  ],
};

// A fake scheduler: it records what it is handed, and a test says when a task completes.
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const added: string[] = [];
const scheduler = {
  addTask(task: unknown) { added.push((task as { id: string }).id); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const completes = (id: string) => {
  for (const fn of listeners.get('task.completed') ?? []) fn({ detail: { id, state: 'done', result: { ok: true } } });
};

const driver = new Driver(flow, {
  runId: 'run-1', scheduler, createTask: (c: unknown) => c, predicates: new Map(),
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } }, joinPolicy: liveToken,
});
driver.start({});
driver.pause({ actor: 'ops' });     // a and b are already with the scheduler: they run on
completes('run-1:b:1:0');           // b2 is routed, RECORDED and HELD
completes('run-1:a:0:0');           // and a2
console.log(added);                 // [ 'run-1:a:0:0', 'run-1:b:1:0' ] — nothing new handed on
const paused = fold(driver.foldInputs());
console.log(paused.outcome, paused.paused);   // running true — a held task is in flight, not finished
if (added.length !== 2 || paused.outcome !== 'running' || !paused.paused) throw new Error('held, recorded, not handed on');

driver.unpause({ actor: 'ops' });
console.log(added.slice(2));        // [ 'run-1:b2:1:0', 'run-1:a2:0:0' ] — in the order they were dispatched
if (added.slice(2).join() !== 'run-1:b2:1:0,run-1:a2:0:0') throw new Error('handed on in dispatch order');
completes('run-1:b2:1:0');
completes('run-1:a2:0:0');
const state = fold(driver.foldInputs());
if (state.outcome !== 'completed' || state.paused) throw new Error('unpaused, and the run completed');
```

**BREAKING in 0.8.0** (P34 decision 10): `FoldInput` gains the kinds `'paused'` and `'unpaused'`, so an exhaustive
`switch` over `kind` no longer compiles; `RunState` gains the cell `paused`, which a `RunState` literal must carry;
`RunControlRefused.control` gains `'pause'` and `'unpause'` and its `reason` `'paused'` and `'not-paused'`.
`RunOutcome` does not move.

### Whose task it is — the attribution on a `nodes` entry, and a task's messages and progress

**Every `nodes` entry says which run and which attempt it is, as FIELDS** (`RN-R41`,
[ADR 0114](doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md)): `runId`
and `flowAttempt` are the task id's first and fourth segments — `flowAttempt` is `0` on every id minted today — and
`attemptNumber` is the SCHEDULER's 1-based number of the attempt the task is on or settled on, from the latest `attempted`
event (section 18). **`attemptNumber` is `null`** before the task's first attempt starts, on an ASK (never handed to a
scheduler), and on every entry of a log written before 0.8.0 — it is never read off a settlement's `attempts`. Two names,
so the two attempts cannot be confused.

**And a task's `context.emit()` and progress reach you through the run, with the same attribution** (`RN-R42`):
`onTaskMessage(m)` and `onTaskProgress(p)` on the `Driver`'s options or `runtime.start`'s (and `runtime.resume`'s). `m`
carries `runId`, `nodeId`, `branchPath`, `taskId`, `flowAttempt`, `attemptNumber` and the scheduler's `name`, `data`,
`seq`, `timestamp` — `dropped` and `error` only when the scheduler set them; `p` the same attribution with `progress`,
`message`, `details` and `timestamp`, and NONE of the task's own fields. Each is a FROZEN copy that is yours.

| | what happens |
|---|---|
| you pass neither | the driver does not subscribe `task.message` or `task.progress` — and the scheduler sends nothing while nobody listens, so your workers' emits cost nothing |
| an event for another run's task, an id no driver minted, or a task this run has not dispatched | dropped in silence — nothing reported, nothing halted. On a runtime ANOTHER run's task never even reaches this run's driver: the router reads `taskId` where the detail has no string `id`. An id that does not parse reaches every driver that asked (each drops it), and an undispatched task of THIS run reaches this run's driver, which drops it |
| after `stop()`, or once a runtime has released the run (its `done` settled) | nothing more is delivered. A HALTED run's tasks still run, and their events still arrive |
| a value that cannot be cloned (a function in an inline worker's `details`) | handed to you as `undefined` — the scheduler does the same with an `emit` it cannot clone. **You cannot tell it from a worker that gave nothing**: no marker says the clone failed (a message's `error` is set only when the SCHEDULER refused the clone) |
| your callback THROWS | reported once through `onRunFailure` and the run HALTED — the treatment `onUnmintedTask` gets (section 9) |
| the fold, the checkpoint, the routing | untouched: neither callback is ever a fold input |

```ts run
import { Driver, fold, type FlowDefinition, type TaskMessage, type TaskProgress } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'attributed', version: 1, entry: 'a',
  nodes: [
    { id: 'a',    kind: 'task', type: 'T', retryPolicy: { maxRetries: 1, backoffMs: 0 }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// A fake scheduler: it records what the driver SUBSCRIBED to, and a test fires the scheduler's events by hand.
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const subscribed: string[] = [];
const scheduler = {
  addTask() {},
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
    subscribed.push(type);
    listeners.set(type, [...(listeners.get(type) ?? []), fn]);
  },
};
const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };

const messages: TaskMessage[] = [];
const progress: TaskProgress[] = [];
const driver = new Driver(flow, {
  runId: 'run-1', scheduler, createTask: (c: unknown) => c, predicates: new Map(),
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } },
  onTaskMessage: (m) => { messages.push(m); },
  onTaskProgress: (p) => { progress.push(p); },
});
if (!subscribed.includes('task.message') || !subscribed.includes('task.progress')) throw new Error('subscribed, because you asked');
driver.start({});

fire('task.running', { id: 'run-1:a:-:0', state: 'running', attemptNumber: 1 });
fire('task.running', { id: 'run-1:a:-:0', state: 'running', attemptNumber: 2 });   // the retry starts
// `task.message` names its task `taskId`; `task.progress` is the task spread flat, so its id is `id`.
fire('task.message', { taskId: 'run-1:a:-:0', workerId: 'w1', attemptNumber: 2, name: 'log', data: { line: 'fetched 3 rows' }, seq: 0, timestamp: 1 });
fire('task.message', { taskId: 'run-2:a:-:0', workerId: 'w1', attemptNumber: 1, name: 'log', data: {}, seq: 0, timestamp: 1 });   // another run's
fire('task.progress', { id: 'run-1:a:-:0', state: 'running', attemptNumber: 2, workerType: 'inline', progress: 0.5, message: 'half', details: null, timestamp: 2 });
// Messages are BATCHED, so attempt 1's last line can arrive after attempt 2 started: it is attributed to attempt 1.
fire('task.message', { taskId: 'run-1:a:-:0', workerId: 'w1', attemptNumber: 1, name: 'log', data: { line: 'retrying' }, seq: 1, timestamp: 1 });

const m = messages[0]!;
console.log(messages.length, m.runId, m.nodeId, m.flowAttempt, m.attemptNumber, m.name, m.data);   // 2 run-1 a 0 2 log { line: 'fetched 3 rows' }
if (messages.length !== 2 || m.attemptNumber !== 2 || !Object.isFrozen(m)) throw new Error('this run`s messages alone, attributed, frozen');
if (messages[1]!.attemptNumber !== 1) throw new Error('a late message carries the attempt that EMITTED it, not the latest');
if (progress.length !== 1 || progress[0]!.progress !== 0.5 || 'workerType' in progress[0]!) throw new Error('the report, not the task');

const entry = fold(driver.foldInputs()).nodes['run-1:a:-:0']!;
console.log(entry.runId, entry.flowAttempt, entry.attemptNumber);   // run-1 0 2
if (entry.runId !== 'run-1' || entry.flowAttempt !== 0 || entry.attemptNumber !== 2) throw new Error('the entry carries its attribution — 2, beside the late message`s 1');
if (driver.foldInputs().length !== 3) throw new Error('dispatched and two attempts — nothing for the message or the progress');
```

**A worker's OWN messages — `worker.message`, outside any run.** A worker's constructor gets the scheduler's worker
context as its second argument, and `workerContext.emit(name, data)` sends a `worker.message` on the worker's POOL —
for what belongs to no task, such as model-loading progress from `setup()`. The library passes these through to
nothing: they have no run, node or attempt to attribute. Listen on the pool yourself. **The pools are reachable
through `createRuntime`'s `createScheduler` option**, which is handed the `WorkerManager`s keyed by pool name before
any task is added — so a listener added there misses nothing. (`runtime.pools` is the DERIVED description of each
pool, not the `WorkerManager`, and has no events.)

```ts run
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { type FlowDefinition, type RegistryDocument } from 'fyflow-orchestration';
import { FyflowScheduler } from 'fyflow-scheduler';

// A worker that keeps its constructor's second argument and emits from `setup()`, where there is no task.
const loader = `data:text/javascript,${encodeURIComponent(`export default class Loader {
  constructor(config, workerContext) { this.ctx = workerContext; }
  async setup() { this.ctx.emit('loading', { pct: 50 }); this.ctx.emit('loading', { pct: 100 }); }
  run(envelope) { return envelope.input; } }`)}`;

const registry: RegistryDocument = { workers: { loader: { url: loader } }, nodeTypes: { Model: { worker: 'loader', inline: true } } };
const flow: FlowDefinition = {
  flowId: 'loads', version: 1, entry: 'm',
  nodes: [{ id: 'm', kind: 'task', type: 'Model', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }],
};

// `createScheduler` is handed every pool by name, and returns the scheduler the runtime will use.
const seen: { pool: string; name: string; data: unknown; seq: number }[] = [];
const runtime = createRuntime(registry, {}, {
  base: import.meta.url,
  createScheduler: (pools, groups) => {
    for (const [pool, manager] of Object.entries(pools)) {
      manager.addEventListener('worker.message', (e) => {
        const d = (e as CustomEvent<{ name: string; data: unknown; seq: number }>).detail;
        seen.push({ pool, name: d.name, data: d.data, seq: d.seq });
      });
    }
    return new FyflowScheduler(pools, groups);
  },
});
const state = await runtime.start(flow, { ok: true }).done;
await runtime.shutdown();
console.log(seen);   // [ { pool: 'Model', name: 'loading', data: { pct: 50 }, seq: 0 }, { …, data: { pct: 100 }, seq: 1 } ]

// Verified by the docs gate:
const want = JSON.stringify([{ pool: 'Model', name: 'loading', data: { pct: 50 }, seq: 0 }, { pool: 'Model', name: 'loading', data: { pct: 100 }, seq: 1 }]);
if (state.outcome !== 'completed') throw new Error(`expected completed, got ${state.outcome}`);
if (JSON.stringify(seen) !== want) throw new Error(`the pool delivered ${JSON.stringify(seen)}`);
```

**BREAKING in 0.8.0** (P36 (j), (p)): `NodeRun` gains three REQUIRED fields — `runId`, `flowAttempt` and `attemptNumber` —
so code that builds a `NodeRun` literal (a test's expected entry, a hand-made `RunState`) no longer compiles until it
carries them. Reading an entry is unaffected. `onTaskMessage`, `onTaskProgress` and the types `TaskMessage`,
`TaskProgress` and `TaskAttribution` are additive.

---

## 9. Refusals

Two kinds, and **the distinction is the stack, not the refusal class** (`OR-R10`). The same class can
do either: whether you are on the stack when it is raised is what decides. A refusal raised while
*your* call is running is thrown; one raised inside a scheduler event listener is reported, because
`EventTarget.dispatchEvent` **never hands a listener throw back** — it resurfaces out of band, and in node
and deno that is an UNCAUGHT exception that ends your process — and there is nobody to catch it.

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
// `EventTarget.dispatchEvent` never hands a listener throw back (node and deno raise it as an uncaught
// exception), so the driver reports it instead and the run stops. This is the half a `try` around your own call can never see.
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
parse a string. Its message is `definition "<flowId>" is invalid: ` then each finding as `<rule> at <at>: <detail>` — `at` a node id,
an edge site (`id#edgeN`), or `<document>` for a finding with none — joined by `; `. It is built by ONE function,
`InvalidDefinition.fromFindings(flowId, findings)`, which `new Driver` and a runtime's `start` and `resume` all call
(W169), so the two roads cannot word one defect two ways; its precondition is at least one finding, and an empty list
is refused with a `RangeError` rather than built into an error that names nothing. `InvalidRunId` is thrown by the **constructor** for a `runId` outside `[A-Za-z0-9_-]{1,64}`
(`ID-R2`) — `:` is excluded because it is the task-id delimiter, and excluding it is what makes the
task-id parse total.

**A defect in the REGISTRY's SHAPE is thrown at `new Driver` too, as a NAMED class extending
`RegistryError`** — `spec/flow-definition.md` v0.19, section 13 here — each carrying `at`, the entry's
key, and a message naming the entry. `new Driver` runs the shape half only, six classes:
`WorkerMissing` (a type naming no worker entry, an entry with no `url`), `PoolTypeMissing`,
`NameCollision` (a pool named as a type), `SchemaRefused` (a keyword outside the subset), and
`UndeclaredKey` and `DerivationRefused` for a type's or a pool's field of the wrong shape (`DerivationRefused`'s
other clauses — a derivation that throws, a resident group beside `idleTimeout: 0`, a built-in keyed group held
resident — need a derivation run, and are `resolveRegistry`'s alone). The other
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

**And four the RUNTIME adds, all `RuntimeError` subclasses from `fyflow-orchestration/scheduler`**
(W66): `GroupUnusable` — a group factory returned something the scheduler cannot use, naming the
member and the group's key; `GroupNotBuildable` — a group type with no `create`; since W89, `RunIdInUse`
— a `start` or `resume` naming a run id that runtime has already built a driver for, a finished run's included (`RN-R25`, ADR 0091);
and, since W163, **`LimitKeyMissing`** — a `start` or `resume` given no `createTask`, of a flow a node of which reaches a
group the built-in `KeyedRateLimitGroup` factory built (`FD-R6`, [ADR 0097](doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md), section 12), its `at` the node.
*(`LanguageNotBuilt` — a flow transforming on a type no pool was built for — was another until W162 removed it
with `createRuntime`'s `flows`: every typed pool carries every registered language since
[ADR 0096](doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md), section 12.)* A bare
`RuntimeError` is one more road: a relative worker url with no `base`, and a predicate or adapter supplied that the
document names nowhere. **They are not exported from the package ROOT**, so the enumeration below —
which walks the root's own exports — does not see them, and `BootstrapError` has never been there
either.

**And more that throw, because you called them.** Some are the same classes the next paragraph calls
reported, which is why the rule is about the stack:

| | |
|---|---|
| `driver.start()` a **second time** | throws `MultipleRuns` — a driver serves one run and its id was fixed at construction (`ID-R3`) |
| `driver.resolve()` with a `result` that is not structured-cloneable | throws the platform's own `DataCloneError`, **not** `UncloneableResult`, and the run is not halted |
| `driver.start()` with a payload that is not structured-cloneable | throws the platform's own `DataCloneError` with the driver UNSTARTED — a run whose entry payload cannot be copied into its checkpoint header cannot be checkpointed, so it is refused before it exists (`RN-R15`, [ADR 0064](doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)). **New in W88, and BREAKING**: such a payload used to start a run on an inline pool |
| `driver.start()` or `runtime.start()` whose `onHeader` THROWS | throws YOUR error with the driver UNSTARTED — nothing recorded, nothing handed to the scheduler, `onRunFailure` not called: the run never existed, so it is not halted (`RN-R39`, [ADR 0112](doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md), section 18). A `Driver` may be started again; on a runtime the run id is SPENT (`RunIdInUse` after), as for any `start` that throws once its driver exists |
| `driver.checkpoint()` before `start()` | throws `NotStarted` — there is no run, and no entry payload to put in a header (`RN-R14`) |
| `driver.resume(checkpoint)` or `runtime.resume(flow, checkpoint)` with an entry payload that is not structured-cloneable | throws the platform's `DataCloneError` before anything is replayed — the driver unstarted, and on a runtime no run id spent (`RN-R15`) |
| `driver.checkpoint()` on a driver whose resume was refused | throws `NotStarted` — a refused resume leaves the driver SPENT and deaf to its scheduler, with no run to checkpoint (`RN-R23`) — **except** a resume refused `halted` because its replay regenerated a stop in the lost tail: that driver keeps the HALTED run, and its checkpoint is one a store may take. *(This row said `NotStarted` without the exception until W90 read it against `RN-R23`.)* |
| `driver.resume(checkpoint)` or `runtime.resume(flow, checkpoint)` on a checkpoint it will not resume | throws `ResumeRefused`, whose `reason` is `format`, `run`, `flow`, `halted`, `cancelled` or `diverged` and whose `index` names the position for the last three — nothing is handed to a scheduler ([ADR 0065](doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md)). `resume()` on a driver that already started or resumed throws `MultipleRuns` (`ID-R3`). **On a runtime, a refusal DURING the replay spends the run id there** — a driver was built for it, so that runtime answers the id with `RunIdInUse` from then on (ADR 0091 keeps the id after it releases the driver); one refused by its header spends nothing ([Q371](doc/questions/q371.md), section 18) |
| `driver.cancel(options)` the driver will not make | throws `RunControlRefused`, whose `reason` is `unsupported` (the scheduler has no `cancel`), `not-started`, `halted`, `cancelled`, `ended` or `interrupted` (the run was stopped) — nothing recorded and nothing sent to the scheduler (`RN-R31`, [ADR 0104](doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md), section 6); a `graceMs` that is not a number, or is negative or `NaN`, throws `TypeError` or `RangeError` the same way |
| `driver.stop(options)` or `handle.stop(options)` the driver will not make | throws `RunControlRefused` with `control: 'stop'`, whose `reason` is `unsupported`, `not-started`, `halted`, `cancelled` (a cancelled run is not resumable) or `ended` — nothing recorded and nothing sent to the scheduler (`RN-R33`, [ADR 0105](doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md), section 18); a bad `graceMs` throws `TypeError` or `RangeError` the same way |
| `driver.pause(options)` or `driver.unpause(options)` the driver will not make | throws `RunControlRefused` with `control: 'pause'` or `'unpause'`, whose `reason` is `not-started`, `halted`, `cancelled`, `interrupted` (a stopped run — pause or unpause it where it resumes), `paused` (a second pause), `not-paused` (an unpause of a run not paused), or — a pause only — `ended`; nothing recorded (`RN-R35`, [ADR 0106](doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md), section 8) |

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
`onRunFailure` or you will not hear about them — the run stops and folds to `halted`, silently. **So is
a throw from your own `onFoldInput` on any element a scheduler event's step appends** — including the
`paused`, `unpaused` or `interrupted` element of a pause, unpause or stop you called from a callback on
that step, which is taken when the step ends (sections 8 and 18): reported under your error's class and
the run HALTED, the element already in the log (`OR-R10`). A stopped run halted so is not resumable.
*Until 0.8.0's W178 that throw left the listener and ended the process.* **On YOUR call's step it is the
SAME — and then it is thrown to you as well** (`OR-R10` v0.19, [W184](doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md)): `start`, `resume`, `resolve`,
`cancel`, `stop`, `pause` and `unpause`, called at rest, or with a pause, an unpause, a stop or an answer you
called from a callback and that is taken when the step ends. Your error is reported ONCE under its class, the run
is HALTED right after the element — the element's own side effects made first: a stop's and a cancel's cancels sent, an
unpause's and a cancel's held tasks handed on — and THEN your error is thrown at you. **The FIRST throw halts**: a
pause, an unpause or an answer you called on the same step and still pending behind it is DROPPED — nothing more is
dispatched or routed — and a stop pending behind it is still taken, silently, its own throw discarded; so the error
thrown at you is the one reported. So is a throw from the SCHEDULER once your call is accepted — its `cancel` failing
inside `driver.cancel` or a stop: reported under its class, the run halted, the error thrown at you. A `cancel()` you call from a
callback appends its element where you call it, so a throw on it halts the run there even if your callback catches
it. A `resume()` whose `resumed` element you throw on hands NOTHING on (section 18); one whose lost tail you throw on
is still refused `ResumeRefused('halted')`. **A call REFUSED before it is accepted halts nothing** —
`RunControlRefused`, `BoundaryRefused`, `ResumeRefused`, `MultipleRuns`, a `DataCloneError`: nothing was appended. **Nor
does a throw from your `onHeader`** (section 18): it runs inside `start` before anything is appended, so it is that
call's refusal — thrown at you, nothing reported, the driver unstarted. **And a throw from your `onTaskMessage` or
`onTaskProgress`** (section 8) is always a scheduler event's: reported once, the run halted, never thrown at you. That is
the driver's guarantee, not only the timing: both reach your callback only through the driver's scheduler-event listener,
which catches whatever it throws — and the scheduler delivers both on its own step anyway, never inside your call.
**Two callbacks must not throw at all: `onFoldInput` on the `halted` element, and `onRunFailure`.** Each runs
after the run is halted and the failure reported, so inside a scheduler event listener their throw is DISCARDED —
lost, with nobody told (`OR-R10`); on your own call's step it reaches you.

**BREAKING in 0.8.0** (P36 (b), (c) and (p), [W184](doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md)): until W184 a throw from your `onFoldInput` on your OWN
call's step reached you and the run went ON. A `resolve()` whose `resolution` element you threw on left the answered
node routed nowhere and the run folding **`completed`** — a run that never reached its end; a stop at rest so thrown
stayed `interrupted` and resumable, a cancel `cancelling`, a pause or an unpause running; a `resume()` threw with its
in-flight set never handed on, `running` for ever. Each is now **`halted`** — so a store that failed on a stop's
`interrupted` element holds a run that is NOT resumable, and a runtime's `done` settles `halted` at once.

```ts run
import { Driver, fold, liveToken, type FlowDefinition, type FoldInput } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'store-fails', version: 1, entry: 'x',
  nodes: [
    { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
    { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
// A scheduler double, section 12's shape: it records what it is handed and fires only what we tell it to.
const added: string[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const scheduler = {
  addTask(task: unknown) { added.push((task as { id: string }).id); },
  addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
};
const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };

// YOUR store, which fails on ONE element: the resolution a person's answer appends.
class StoreDown extends Error {}
const reported: string[] = [];
const driver = new Driver(flow, {
  runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken,
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } },
  onFoldInput: (e: FoldInput) => { if (e.kind === 'resolution') throw new StoreDown('the store is down'); },
  onRunFailure: (f) => { reported.push(f.kind); },
});
driver.start({});
// x runs out of retries and parks for a person: the scheduler's PAIR, `task.failed` then `task.user_action`.
fire('task.failed', { id: 'r1:x:-:0', state: 'user_action', error: 'a person must look' });
fire('task.user_action', { id: 'r1:x:-:0', state: 'user_action' });

// YOUR call: your error is thrown at you — AND the run is HALTED, and reported once.
let thrown: unknown = null;
try { driver.resolve('r1:x:-:0', 'done', { result: { ok: true }, actor: 'ana' }); } catch (e) { thrown = e; }
const state = fold(driver.foldInputs());
console.log(thrown instanceof StoreDown, reported, state.outcome, added);   // true [ 'StoreDown' ] halted [ 'r1:x:-:0' ]
if (!(thrown instanceof StoreDown)) throw new Error('your own error is thrown at you');
if (reported.join() !== 'StoreDown') throw new Error(`reported ONCE, under its class: ${reported.join()}`);
if (state.outcome !== 'halted') throw new Error(`the run is HALTED, got ${state.outcome} — before W184 it folded completed`);
if (added.includes('r1:y:-:0')) throw new Error('nothing is routed from the resolution you threw on');
```

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
  onRunFailure: (f: RunFailure) => console.error(`run ${f.runId} halted: ${f.kind} — ${f.message}`),
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
and a person's `done` resolution at `resolve()`, against the parked node's worker `outputSchema` — or, for an ASK,
against the ask's own `answerSchema` (since [W180](doc/work-items/w180-asking-and-answering-in-a-run.md)). Refused, it is
**thrown at you as a REJECTED COMMAND**: nothing appended, nothing reported, the run unaffected — at `start`
the driver is still UNSTARTED and a corrected payload starts it, at `resolve` the task is still suspended and
a corrected value (the worker's declared example is one) resolves it. It carries `boundary`, `nodeId`,
`taskId` and the schema's `findings`, and its message names the worker and every finding, so you read
the VALUE and not the flow. A worker declaring no schema on that side is unchecked — **and so, at `start()`, is a
task that declares a `transform`** ([ADR 0101](doc/decisions/0101-a-transforming-task-is-not-held-at-start.md), W170):
its worker's `inputSchema` holds the transform's RESULT, which only the worker wrapper makes, so a payload that is
wrong for the transform starts: it MAY fail in the run (`TransformFailed`, or the worker), or reach the worker
unchecked and complete — Q633's `{ label: "y" }` ran to `completed` with the worker receiving `{}`. The check before
a run is yours — `givenVerdict(registry, flow, task, received)` on each transforming target, with the value that task
RECEIVES (section 15); `validateBoundaries: false`
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
  PoolTypeMissing, RegistryError, ResumeRefused, RunControlRefused, SchemaRefused, TypeDefaultRefused, UncloneableResult, UndeclaredKey,
  UndeclaredRoute, UndispatchedTask, UnresolvedBranchPath, UnresolvedMapArity, UnresolvedReference, WorkerMissing,
} from 'fyflow-orchestration';

const documented = [
  DuplicateTaskId, UncloneableResult, NoMatchingEdge, UndispatchedTask,  // reported inside a listener
  MultipleRuns, InvalidRunId, InvalidDefinition, MissingJoinPolicy,      // thrown at you
  NotStarted,                                // thrown at you from checkpoint() before start() — there is no run yet (RN-R14)
  ResumeRefused,                             // thrown at you from resume() — a checkpoint it will not resume, `reason` says why (RN-R23)
  RunControlRefused,                         // thrown at you from driver.cancel(), stop(), pause() and unpause() — nothing recorded or sent, `reason` says why (RN-R31, RN-R33, RN-R35)
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

After a refusal the run is **halted**: nothing routes for it again, and its state folds to
`halted` whatever its nodes say. **BREAKING in 0.8.0** (P34 decision 10, ADR 0102): 0.7.0 called this `stopped`,
and FOUR surfaces are renamed — the `RunOutcome` `stopped` is `halted`, `RunState.stoppedBy` is `haltedBy`, the fold
input `{ kind: 'stopped', reason }` is `{ kind: 'halted', reason }`, and `ResumeRefusalReason`'s `stopped` is
`halted` — so a comparison against an old name, or a `{ kind: 'stopped' }` you construct, no longer compiles. A 0.7.0 checkpoint or log holding a `{ kind: 'stopped' }` element still reads as `halted`:
`fold` folds it so, and a resume refuses it `halted` at its position.

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
  and `halted` are outcomes you read off the state, and `haltedBy` names a refusal. A `.catch` on
  `done` is a `.catch` that never fires.
- **Waiting on `done` for a run with a person in it.** `awaiting_action` is not terminal, so `done`
  is still pending — by design. Poll the fold for the park, resolve the task, then await; section 7
  is that snippet, and `Promise.race([done, timeout])` is the deadline nothing ships for you.
- **Reading run state mid-turn.** Section 8.
- **Counting on `start()` to check the payload of an entry that TRANSFORMS.** It does not — `FD-R4` holds a
  payload to a worker's `inputSchema` only where nothing stands between them, and a `transform` does
  ([ADR 0101](doc/decisions/0101-a-transforming-task-is-not-held-at-start.md)). *Check, then start*:
  `givenVerdict(registry, flow, task, received)` runs a task's declared transform and holds the result to the
  schema — on each transforming TARGET (never a fan-out, map or gate entry, where it returns `[]`) and on the value
  that task RECEIVES, the payload composed through its `needs` and, for a map's branch, each element — section 15.
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
// not, until W76: `StartOptions` is a `Pick` of the driver's options, and of the driver's twenty-three
// (eighteen when W76 wrote this; `onNonconformingResult` is ADR 0060's, W80's; `gateTypes` ADR 0067's, W93's; `onHeader` ADR 0112's, W185's;
// `onTaskMessage` and `onTaskProgress` ADR 0114's, W187's)
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
// terminal OUTCOME, not an error, so there is no `.catch` — the run arrives as `halted` with
// `haltedBy` naming the refusal. One settlement rule for every way a run can end.
const haltedRun = await run(loud);
await runtime.shutdown();
console.log(failures.join(), haltedRun.outcome, haltedRun.haltedBy?.split(':')[0]);
// 'UncloneableResult' 'halted' 'UncloneableResult'
if (failures.join() !== 'UncloneableResult') throw new Error(`the loud half reported ${failures.join() || 'nothing'}`);
if (haltedRun.outcome !== 'halted') throw new Error(`a refused run resolved \`done\` with ${haltedRun.outcome}, not halted`);
if (!haltedRun.haltedBy?.startsWith('UncloneableResult')) throw new Error(`haltedBy: ${haltedRun.haltedBy}`);
```

## 11. What does NOT exist — do not write code using it

| not available | instead |
|---|---|
| flow-level **retry** — re-dispatching a NODE under a new attempt, possibly routing elsewhere | **task-level retry IS built** since [W58](doc/work-items/w58-what-a-node-says-about-its-own-task.md): declare `retryPolicy` on the node (section 3) and the scheduler retries inside the same task id, reported on the record's `attempts`. Re-dispatching the node is [Q16](doc/questions/q16.md)'s other half and the task id's fourth segment, and nothing mints one |
| **`runtime.register()`** — adding node types, pools, groups or languages to a RUNNING runtime | **declined** — [P37](doc/plans/p37-a-runtime-is-its-registry.md) decision 1, [ADR 0096](doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md): `fyflow-scheduler` cannot add a pool after construction. A changed registry is a NEW runtime; a run on the old one finishes there or moves by stop-and-resume ([P34](doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)). **A FLOW is not a registry entry**: `runtime.check(flow)`, then `runtime.start(flow, …)`, takes any flow the registry can run, at any time (section 12) |
| **a `limitKey` from the FLOW** — a node or a document saying which key a task of a keyed group is counted under | **deferred** — [Q248](doc/questions/q248.md). Pass `start` a `createTask` that sets `limitKey` on the task it builds, or register a group type whose `create` builds a `KeyedRateLimitGroup` with a `keyFrom` (section 12). A node reaching a document's built-in keyed group with neither is refused before its run starts — `FD-R6`, `LimitKeyMissing` |
| **a `start()` that checks a TRANSFORMING task's payload** — the transform run first and its result held to the `inputSchema` | **no** — [ADR 0101](doc/decisions/0101-a-transforming-task-is-not-held-at-start.md): `start()` is synchronous and the transform runs only in the worker, so a task declaring one is UNCHECKED at `start` (`FD-R4`), as a worker declaring no `inputSchema` is. Call `givenVerdict(registry, flow, task, received)` — `tryTransform(…, { input: received })` on the declared transform — first, on each transforming target with the value it RECEIVES (section 15), then start |
| **redaction by `writeOnly`** — a schema annotation keeping a value out of what a run retains or reports | **no** — [ADR 0098](doc/decisions/0098-four-annotations-join-the-schema-subset-and-constrain-nothing.md) rule 4: `writeOnly`, like `readOnly`, `title` and `description`, is admitted as an annotation since v0.36, held to its shape and read by nothing after. Redact in your own code, before the value reaches a run (section 13) |
| **pool options on a CLASS type's instance**, and the scheduler's `idleCheckIntervalMs`, `requeueFailedTasks` and `maxWorkerRestarts` anywhere | **no** — [ADR 0099](doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md) rules 4 and 7: a named instance of a DOCUMENT type may declare `pool` (section 13); a class computes its pool from the instance's `config` and key, so give it a `configSchema` knob. The three are refused as undeclared keys |
| ~~**cancelling a RUN**~~ | **BUILT** since [W173](doc/work-items/w173-cancelling-a-run.md): `driver.cancel({ actor, reason?, graceMs? })` — section 6; the run reads `cancelling` and `done` settles `cancelled` after its last task has stopped. **Not cancelled with it: tasks a WORKER spawned** (`context.spawnTask()`) — the driver knows only what it dispatched, so track their ids from `task.spawn_request` and cancel each (P34 (j)). **And `graceMs: 0` is a request, not a guarantee** — a 0 ms timer a prompt worker can beat ([S12](doc/scheduler-upstream.md)) |
| ~~**stopping a run**~~ to resume it elsewhere | **BUILT** since [W174](doc/work-items/w174-stopping-a-run-to-resume-it-elsewhere.md): `handle.stop({ actor, reason?, graceMs? })` or `driver.stop(…)` — section 18; the run reads `interrupted`, its `done` settles once the stop's cancels have resolved, and its checkpoint resumes on a FRESH runtime (this one keeps the run id). **Not stopped with it: tasks a WORKER spawned**, as for a cancel |
| ~~**pausing** a run~~ | **BUILT** since [W175](doc/work-items/w175-pausing-a-run.md): `driver.pause({ actor })` / `driver.unpause({ actor })` — section 8; the run routes on, every dispatch is recorded and HELD, and the unpause hands them on in dispatch order. `state.paused` is a flag, not an outcome. **Nothing is cancelled**: a task the scheduler already has — queued behind a group included — runs on. There is no `handle.pause()`: call `handle.driver.pause()` |
| ~~**durability**~~ — resuming a run after a restart | **BUILT** since [W89](doc/work-items/w89-what-resuming-is.md): append the events, resume from them — section 18. A cancelled or halted run is refused |
| **nested fan-out** — a branch that fans out again | **built, and the join over it is settled.** `FD-V15` is retired; a task inside a nested region is dispatched at its whole dotted `branchPath` (`r1:scoreC:1.0:0`); and every policy in section 5 is **transitive** — each region answers exactly as it would if it were not nested ([ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)). One thing to know: if an inner join is reported through `onUnsatisfiableJoin`, the outer branch containing it **ends** rather than waiting, so the outer join may still fire and its successor may run — and once that work settles the run folds to `stuck`, because a region that never fired is what `stuck` reads. **Fold too early and you will see `running`.** The four matrix rows and the join seam are tested at **depth 2**; the dead-join cascade is asserted at depth 3, and nothing else about depth 3 is a tested claim |
| ~~**map-style fan-out**~~ — **BUILT** since [W33](doc/work-items/w33-a-map-at-run-time-arity.md); see section 3 |
| ~~**RUNNING an `ask`**~~ — a node that waits for a person, its answer at `resolve()` | **BUILT** since [W180](doc/work-items/w180-asking-and-answering-in-a-run.md): a run parks at an ask with nothing handed to the scheduler, and its answer is its result — section 7. Under a cancel, a stop, a pause and a resume an ask is a parked task — never in flight, so nothing is ever sent or handed on for it — since [W181](doc/work-items/w181-an-ask-under-run-control.md) (section 7) |
| a **live, mutable view** of a run's state, or the state handed to `onFoldInput` beside each input | **no** — [P39](doc/plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) (b), [ADR 0122](doc/decisions/0122-a-runtimes-live-state-is-a-frozen-copy-on-its-handle.md): `handle.state()` is a frozen COPY, cached until the run moves, and `handle.outcome()` / `handle.node()` are the O(1) reads — section 8 |
| a task's INPUT kept in the run state — `NodeRun.input` for a task, or `pathEnded` carrying the value that reached an end | **no** — [ADR 0046](doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md): a run keeps what its tasks returned. **READ it instead**, since [W205](doc/work-items/w205-what-a-node-was-handed-read-by-replaying-the-run.md): `inputOf(flow, options, { header, events }, target)` or `handle.inputOf(target)` replays the run to that node — section 8. The input a worker sees AFTER its transform: **no** ([Q760](doc/questions/q760.md), resolved — the envelope's `input` through `tryTransform` serves) |
| a **join timeout** | nothing. A stuck join is detected by the `stuck` outcome, with no clock |
| **per-join policy choice** | one policy per driver |
| a **declared event family** for `fyflow-react-components` | `onRegionEvent`, `onFoldInput` and `joinStatusOf()` — see below |

**On that last row.** Flow structure is invisible to the *scheduler*, so a UI wired only to a
scheduler cannot show which node a run is at, which branch it took, or what a join is waiting on.
That is [Q21](doc/questions/q21.md), and it is about the scheduler's stream, not about this
library — **this library does expose all three.** `onFoldInput` is the push half of `foldInputs()`,
so you can see a run finish without polling — on a runtime, read `handle.outcome()` after each input and
`handle.state()` when you draw the run (section 8, *Reading a run WHILE it runs*); on a bare `Driver`, mind section 8's
*What it costs*: a `step` per input is O(run) each; `onRegionEvent` reports branches
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
them, and hands you **a handle per run** — `{ driver, done, header, stop, state, outcome, node }`: the driver already running, `done` a
promise that resolves with the run's terminal `RunState`, and `header` the run's checkpoint header — handed to
`start`'s `onHeader` option too, before the run's first event, for a store that writes it first (section 18)
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
rules — every one but `FD-R6`, below — before any run id is spent, so the two cannot disagree: *register* a flow by checking it, then
start it. `check` leaves out what depends on a RUN rather than the flow — a payload `FD-R4` refuses,
and a run id in use. **One finding it returns is not a definition defect: `FD-R6`**
([ADR 0097](doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md)) — a node reaching a group of the BUILT-IN `KeyedRateLimitGroup` type, through the
pool it runs on — the named instance its `pool` says, else its type's default — or its `workerGroups`. The runtime builds that group with no `keyFrom`, so the scheduler counts each task
under its `limitKey` — and nothing sets one unless you pass `start` a `createTask` that does, `(c) => new FyflowTask({
...c, limitKey: tenant })`; without one the scheduler's `addTask` throws. So `start` with no `createTask` throws
**`LimitKeyMissing`** for it — after any `InvalidDefinition`, before any run id is spent — and with one, `FD-R6` refuses
nothing (a factory that sets no key meets the scheduler's own throw). `check` cannot know what you will pass, so it
reports `FD-R6` as if you pass none: filter it out by `f.rule` if you start with a keying `createTask`. A group a CODE
group type builds — a `KeyedRateLimitGroup` with a `keyFrom` — is never `FD-R6`. A pool's `residentGroups` is not read
here: a built-in keyed group held RESIDENT is refused earlier, at `createRuntime` (`DerivationRefused`, section 13,
[Q619](doc/questions/q619.md)). A key derived from the flow is
[Q248](doc/questions/q248.md), deferred. **And `createRuntime` refuses a malformed `defaultRetryPolicy`** —
`InvalidDefinition`, `FD-V30`, at construction, where until W163 every `start` threw it. **BREAKING in 0.8.0**: `createRuntime`'s and `bootstrap`'s `flows` option,
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
  every run. Key it on `detail.id` — or `detail.taskId` for `task.message`, which has no `id` — and do O(1) work per
  event, or N such listeners are N² again.

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
an unminted one — so a `halted` run's tasks still in flight settle into no driver; listen on
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
something other than a plain `FyflowTask`. **A `createTask` that builds the task FIELD BY FIELD must copy
`attemptsSpent`** (since 0.8.0): a resume hands a task it runs again the attempts it already made, as that key, only
when there were some — and a factory that drops it starts the task at a fresh retry budget again, silently (section
18). `(c) => new FyflowTask({ ...c, limitKey })` copies it; `new FyflowTask({ id: c.id, workerType: c.workerType, … })`
does not.

**The `scheduler` option takes a `FyflowScheduler` as it is.** Until W57 it did not, under the one
configuration most consumers have: `FyflowScheduler extends EventTarget`, so with the DOM lib in
scope — TypeScript's default when `lib` is unset — its `addEventListener` was not assignable to
`SchedulerLike`'s, and this section told you to write `scheduler as unknown as SchedulerLike`. That
was [Q71](doc/questions/q71.md), a defect in our type and not in yours, and it is closed:
`SchedulerLike`'s listener parameter is `object`, which is what makes the real class satisfy it,
and every snippet in this document is typechecked under the DOM lib by `npm run check:docs`.

**`SchedulerLike` has a THIRD member since 0.8.0, and it is OPTIONAL: `cancel(taskId, options?)`** — the
scheduler's own signature, which a `FyflowScheduler` has and a runtime's per-run view forwards
([ADR 0104](doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)). It is
read by `driver.cancel` and `driver.stop` alone (sections 6 and 18), so a double with only `addTask` and
`addEventListener` still drives every run — and either over it is refused `unsupported`, by name, before anything is
recorded. Give your double a `cancel` that returns a promise if it must cancel or stop a run.

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
workers in ladder L6, a task cancelled while running and while queued — and `driver.cancel` asks for one on
every task of a run in flight (section 6). Install the
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
// **Key the listeners by event type.** The driver subscribes to five of them — the four
// settlements and, since 0.8.0, `task.running` (and `task.message` and `task.progress` when you pass
// `onTaskMessage` or `onTaskProgress`, section 8) — and normalizes a settlement on the task's
// terminal STATE rather than the event name (`OR-R3`), so a
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
// value per run each (the entry payload at start() unless the task transforms, a person's resolution at resolve() — FD-R4, W73)
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
**`flushIntervalMs` is capped at 2^31-1 ms** (v0.37), the longest delay a timer holds: the scheduler arms `setTimeout`
with it, and a longer one fires at once — so a value meaning *batch for a month* would flush every `emit()` after 1 ms.
**And a NAMED instance of a document type may declare its own** — `pools: { "scorer-1": { "type": "Scorer", "pool":
{ "maxThreads": 1 } } }`, `spec/flow-definition.md` v0.37, [ADR 0099](doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md),
[W165](doc/work-items/w165-pool-options-on-a-named-pool-instance.md): the same keys, each held to the same rule and
refused naming the pool, **merged SHALLOWLY over the type's** — the instance's key wins, a key it leaves out (or sets
to `undefined`) is the type's, and a `messages` it declares replaces the type's WHOLE — with every object copied, so
no two pools share one. Two instances of one type need no second type. **An instance of a CLASS type carrying `pool` is
refused** (`UndeclaredKey`): your class gets the instance key in `pool(config, key)`, so the knob belongs in its
`configSchema`. The scheduler's `idleCheckIntervalMs`, `requeueFailedTasks` and `maxWorkerRestarts` are refused on a
type and on an instance alike. **A RESOLVED document type is still a document type here** — what
`runtime.registry.nodeTypes` holds — so a `Driver` or `bootstrap` handed the runtime's registry accepts the instance;
a hand-written `NodeTypeDefinition`, or a copy of a resolved one, is a class to this rule.
**A `residentGroups` naming a group of the built-in `KeyedRateLimitGroup` type is refused at `createRuntime`** (v0.39,
[Q619](doc/questions/q619.md), W169) — `DerivationRefused`, naming the pool and the group, whether a type, a named
instance or your class's `pool()` put it there. The scheduler resolves no key for a RESIDENT group, so every worker
holding it would be counted in ONE `""` bucket, in silence. Name a keyed group in `groups` instead — each task is then
counted under its `limitKey` (`FD-R6`, section 12) — or hold a `ConcurrentLimitGroup` or `RateLimitGroup` resident. A
group your own `code.groupTypes` factory builds is never refused. **BREAKING in 0.8.0**: such a document built a
runtime at 0.7.0. **`bootstrap` called by hand is not covered** — it is handed group OBJECTS and cannot tell the
built-in factory's keyed group from your own — as a `Driver` built by hand is not covered by `FD-R6`.
**Your worker's `run(payload, context)` gets the scheduler's own task context as its second argument** —
the same object the scheduler handed the envelope worker, so `context.signal` (an `AbortSignal`, aborted
when `scheduler.cancel(taskId)` is called for the task) and `context.emit(name, data)` (a `task.message`
on the scheduler) work in a typed worker exactly as in one the scheduler loads itself, and its
constructor gets the worker context. The library reads the signal never, and a `task.message` only when you ask:
pass `onTaskMessage` to `start` (since 0.8.0, section 8) and each message of the run's own tasks reaches you with
its run, node, branch and attempts as fields — or listen for it on `runtime.scheduler` yourself, as before; what
cancelling a task does to its RUN is section 6's.

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
import { DerivationRefused, findings, resolveRegistry, SchemaRefused, UndeclaredKey, validateDefinition, type FlowDefinition, type LanguageAdapter, type NodeTypeDeclaration, type Registry, type WorkerEntry } from 'fyflow-orchestration';
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
let tooLong: unknown;
try { resolveRegistry({ workers: { echo }, nodeTypes: { Scorer: { worker: 'echo', pool: { messages: { flushIntervalMs: 2 ** 31 } } } } }); } catch (e) { tooLong = e; }
if (!(tooLong instanceof DerivationRefused) || !tooLong.message.includes('flushIntervalMs')) throw new Error('a flush interval no timer can hold (above 2^31-1) is refused');

// And a NAMED instance of a document type may set its own (v0.37, ADR 0099): merged over its type's, key by key.
const perInstance = resolveRegistry({
  workers: { echo },
  nodeTypes: { Scorer: { worker: 'echo', pool: { maxThreads: 4, idleTimeout: 30000 } } },
  pools: { 'scorer-1': { type: 'Scorer', pool: { maxThreads: 1 } } },
});
const single = perInstance.pools.get('scorer-1')?.spec;
if (single?.maxThreads !== 1 || single.idleTimeout !== 30000) throw new Error('the instance`s maxThreads over the type`s, its idleTimeout the type`s');
if (perInstance.pools.get('Scorer')?.spec.maxThreads !== 4) throw new Error('and the type`s default pool unmoved');
let classInstance: unknown;
try { resolveRegistry({ workers: { echo }, pools: { big: { type: 'Gpu', pool: { maxThreads: 1 } } } }, { nodeTypes: { Gpu: { worker: 'echo', pool: () => ({}) } } }); } catch (e) { classInstance = e; }
if (!(classInstance instanceof UndeclaredKey)) throw new Error('pool options on a CLASS type`s instance are refused — the class owns its pool');

// And a schema may ANNOTATE (v0.36, ADR 0098): `title` and `description` a string, `readOnly` and
// `writeOnly` a boolean, each held to that shape, at any depth, and read by NO value check.
const inputSchema = {
  type: 'object', title: 'Login', description: 'what the worker reads',
  properties: { user: { type: 'string', readOnly: true }, password: { type: 'string', writeOnly: true } },
};
resolveRegistry({ workers: { echo: { ...echo, inputSchema } }, nodeTypes: { Scorer } });   // accepted
// writeOnly HIDES NOTHING: the value under it is validated, carried and retained like any other — no redaction.
if (findings(inputSchema, { user: 'ada', password: 'hunter2' }).length !== 0) throw new Error('the annotations constrain nothing');
const schemaRefusal = (schema: Record<string, unknown>): unknown => {
  try { resolveRegistry({ workers: { echo: { ...echo, inputSchema: schema } }, nodeTypes: { Scorer } }); } catch (e) { return e; }
  return undefined;
};
const shape = schemaRefusal({ type: 'string', writeOnly: 'yes' });
if (!(shape instanceof SchemaRefused) || !shape.message.includes('writeOnly')) throw new Error('an annotation of the wrong shape is refused, naming it');
const format = schemaRefusal({ type: 'string', format: 'email' });
if (!(format instanceof SchemaRefused) || !format.message.includes('"format"')) throw new Error('format reads as a constraint and checks nothing here, so it is refused by name');
```

**A schema may carry four ANNOTATIONS — `title`, `description`, `readOnly`, `writeOnly` — and they
constrain nothing** (v0.36, [ADR 0098](doc/decisions/0098-four-annotations-join-the-schema-subset-and-constrain-nothing.md)).
Each one's value is held to its shape — a string, a boolean — where the schema is declared, and no
check reads it afterwards: **`writeOnly: true` promises NO REDACTION**. A value under it is cloned,
kept in the run's event log, checkpointed, kept in run state and handed on exactly as any other, so a secret you do not
want retained is redacted by your own code before it reaches a run. `readOnly: true` refuses nothing a
caller supplies. `deprecated`, `$comment`, `default`, `format`, `$schema` and `$id` are still refused
by name — `default` because nothing applies it, `format` because it would check nothing.

**What this is not.** What a type says about what its worker EXPECTS and RETURNS — input and
output schemas, and a sample-based check across a transformed edge — was
[P16](doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s plan after
this one (P18) and is now [P19](doc/plans/p19-what-a-schema-buys-an-author.md)'s, answered in
**section 15**: since v0.19 a worker DECLARES `inputSchema` and `outputSchema`, no RUN enforces
them per settlement (that is OUT of P19 as a default) — since v0.21 the two values no static check
can reach are held to them ONCE each (a transforming task's payload excepted, ADR 0101), `FD-R4` (section 9's `BoundaryRefused`), and `checkWiring(registry, flow)`
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
URL ([Q261](doc/questions/q261.md)), so `jsonata.worker` has to be served beside your bundle as a module of its own
for a pool's thread to load it. **The envelope worker does not**, from npm: the npm dist carries it inside itself, a
`data:` URL on Node and a `Blob` URL in the browser. A bundle you build from the JSR SOURCE has to serve it
too, compiled, at the `./envelope-worker.ts` URL the source names beside the bundle.

---

## 15. What a schema buys an AUTHOR — an authoring session

**The schemas in section 13 were never for the run.** A worker's `inputSchema` and `outputSchema`
are held to the run's PAYLOAD once (not where the task declares a `transform`, ADR 0101) and to a person's
RESOLUTION once each (`FD-R4`, section 9) and never per settlement — and neither of those is *two values per run*, because a fan-out or map entry
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
| `tryTransform(registry, flow, node, transform, { input }?)` | *does THIS expression fit* — one candidate, one verdict, on a real sample — or on a value you GIVE, the entry node included (*A sample you GIVE*, below) |
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

// THE FLOW, as an author first writes it: read a batch, summarise it. Its grammar is valid.
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

// STEP 3 — a first candidate, run on the producer's declared example and checked against the
// consumer's input schema.
const attempt = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{ "text": lines }' });
console.log(`${attempt[0]!.kind}: ${attempt[0]!.why}`);
// transform-fails: the transform's result on the example fails the consumer's inputSchema — $.text expected string, got array
if (attempt[0]!.kind !== 'transform-fails') throw new Error('an array is not a string, and the loop says which');

// STEP 4 — one edit, and the same loop. `transform-passes` is about the sample it names, which is
// the declared example here, or a generated one where a schema declares none.
const good = { lang: 'jsonata', expr: '{ "text": $join(lines, " ") }' };
const passed = await tryTransform(registry, flow, 'sum', good);
console.log(`${passed[0]!.kind} on the ${passed[0]!.sample!.source}: ${JSON.stringify(passed[0]!.sample!.result)}`);
if (passed[0]!.kind !== 'transform-passes') throw new Error(`expected the sample to pass, got ${passed[0]!.kind}`);

// STEP 5 — the signature the worker is written against, generated from the same schemas.
// `examples/getting-started/session-types.ts` is this text, and `summarise.ts` imports it.
const signature = signatureOf('Summarise', SESSION_WORKERS.summarise);
console.log(signature.split('\n').filter((l) => l.startsWith('export')).join('\n'));
if (!signature.includes('"text": string;')) throw new Error('the required key is required in the type too');

// STEP 6 — only now the runtime. Check the wired flow against it, then start it; `start` refuses
// from that same check.
const wired: FlowDefinition = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: good } : n)) };
const runtime = createRuntime(SESSION_REGISTRY, { languages: { jsonata } }, { base: SESSION_BASE });
const refused = runtime.check(wired);
if (refused.length !== 0) throw new Error(`the runtime refuses the wired flow: ${JSON.stringify(refused)}`);
const unknownLang: FlowDefinition = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: { lang: 'nope', expr: '$' } } : n)) };
if (!runtime.check(unknownLang).some((f) => f.rule === 'FD-V35' && f.at === 'sum')) throw new Error('a language the registry does not name is FD-V35, at check');
const state = await runtime.start(wired, { source: 'inbox' }).done;
await runtime.shutdown();
console.log(state.outcome, Object.values(state.nodes).find((n) => n.nodeId === 'sum')?.result);  // completed { words: 3 }

// Verified by the docs gate:
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

### A sample you GIVE — `tryTransform(…, { input })`, the entry node included

**Every verdict above runs on a SCHEMA's value** — the producer's declared example, or its witness — and
the entry node gets none, because no arc reaches it: `tryTransform` on `read` above returns `[]`. An
editor has a value in hand instead: typed, pasted, or taken from a run. **Pass it as `input`** and the
candidate runs ONCE on it as what the node RECEIVES — `$` — and `tryTransform` returns **ONE verdict
whatever arcs reach the node, on the entry node too** (W166, P37 stop-and-ask (d)):

| | a given verdict |
|---|---|
| `shape` | `'given'` — not an arc; `checkWiring` never produces it |
| `producer` | **absent** — the value came from no node (and `through` too) |
| `sample` | `{ source: 'given', value, result }` — the value you gave, and what the transform made of it; no `arity`. **Never `'example'` or `'witness'`** |
| `cause` | **on `transform-fails` only** (since 0.11.0, every road — `checkWiring`'s arcs too): `'threw'` — the worker half did not import, had no default export, or its `compile` or `evaluate` threw — or `'schema'`, a result the node's `inputSchema` refused — the type `TransformFailureCause`, a root export. Absent on every other kind. Read it rather than `why`'s prefix |
| `kind` | `transform-passes`, or `transform-fails` with the finding against the node's worker `inputSchema` — or naming the error, where the expression does not compile or throws on this value; `unchecked` for a language, type, worker or worker schema the registry lacks, as on an arc, naming which — and for a `null` candidate, which takes away any transform the node declares too: there is nothing to run the value through, and holding that value to the `inputSchema` is `findings(schema, value)` |

**The value is `$` as you give it: no `needs` is composed over it**, because a `needs` composes what
arrives and this is what arrived — and on a `map`'s branch task it is ONE instance's value, evaluated
once. **That includes a `"$payload"` or a `"$item"` key** (since 0.8.0): give the node what it RECEIVES, the payload
or the instance's item already under that key — neither function composes one, so a given input and a run agree only when you compose as the run does. `input: undefined` is no input (the arcs answer, as before); `null` is a value. *What it is not*:
a statement about the producer or the flow — it says what this expression does to this value, and a
value that passes is *the sample passed — the given input*, never *fits*. **`givenVerdict(registry, flow,
node, input)`**, exported beside `checkWiring`, is the same road on the node as the flow DECLARES it —
`tryTransform` calls it on the copy that carries your candidate, so the two have ONE contract: `input`
`undefined` is no input there too, and the node's arcs answer. **`givenVerdict` and `TryTransformOptions` are
NEW public surface in 0.8.0.**

**On an entry that TRANSFORMS, this is the only check of a run's payload before the run.** `start()` does not hold
a task that declares a `transform` to its worker's `inputSchema` ([ADR 0101](doc/decisions/0101-a-transforming-task-is-not-held-at-start.md),
`FD-R4`, section 9): the schema is about the transform's RESULT, and that exists only in the worker. So *check, then
start* — but on the value each transforming TASK receives, because a given value is `$` with no `needs` composed:
`boundaryTargets(flow, payload)` lists the tasks the payload reaches and the value reaching each (for a map's branch,
each element under `over`; through an entry gate, every route's target), and where the task declares `needs` (at an
entry `"."` and, since 0.8.0, `"$payload"`) compose it first — `needs: { own: "." }` receives `{ own: value }`, and
`needs: { run: "$payload" }` receives `{ run: payload }`, the PAYLOAD even on a map's branch, where the value is an
element — and there `needs: { it: "$item" }` receives `{ it: element }`. Call
`givenVerdict(registry, flow, task, received)` on each that transforms; a fan-out, map or gate ENTRY is no task and
gives `[]`. Start on `transform-passes`; `unchecked` (no `inputSchema`, or a language, type or worker the registry
lacks) checked nothing. Until W170 `start()`
held the payload BEFORE the transform, and one value drew opposite verdicts from the two
([Q633](doc/questions/q633.md)).

```ts run
import { tryTransform, type FlowDefinition } from 'fyflow-orchestration';
import { jsonata } from 'fyflow-orchestration/jsonata';
import { SESSION_REGISTRY, SESSION_WORKERS } from '../../examples/getting-started/session-registry.ts';  // in your program: './registry.ts', a module or a JSON file of your own

const registry = { workers: SESSION_WORKERS, nodeTypes: SESSION_REGISTRY.nodeTypes, languages: { jsonata } };
const flow: FlowDefinition = {
  flowId: 'session', version: 1, entry: 'read',
  nodes: [
    { id: 'read', kind: 'task', type: 'Reader', edges: [{ to: 'sum' }] },
    { id: 'sum', kind: 'task', type: 'Summarise', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// THE ENTRY NODE. No arc reaches it, so the schemas have nothing to say about what it receives...
const rename = { lang: 'jsonata', expr: '{ "source": folder }' };
if ((await tryTransform(registry, flow, 'read', rename)).length !== 0) throw new Error('no arc reaches the entry');
// ...and given what it receives, ONE verdict. `reader`'s inputSchema wants `source` a string.
const [entry] = await tryTransform(registry, flow, 'read', rename, { input: { folder: 'inbox' } });
console.log(`${entry!.kind} on the ${entry!.sample!.source}: ${JSON.stringify(entry!.sample!.result)}`);  // transform-passes on the given: {"source":"inbox"}
if (entry!.shape !== 'given' || entry!.producer !== undefined || entry!.sample!.source !== 'given') throw new Error('a given verdict: shape given, no producer');
if (entry!.kind !== 'transform-passes') throw new Error(`expected the given value to pass, got ${entry!.kind}: ${entry!.why}`);

// The same expression on a value it does not fit: the finding, against the node's own inputSchema.
const [wrong] = await tryTransform(registry, flow, 'read', rename, { input: { folder: 3 } });
console.log(`${wrong!.kind}: ${wrong!.why}`);  // transform-fails: the transform's result on the given input fails the consumer's inputSchema — $.source expected string, ...
if (wrong!.kind !== 'transform-fails' || !wrong!.why.includes('$.source expected string')) throw new Error(`expected the finding, got ${wrong!.why}`);
if (wrong!.cause !== 'schema') throw new Error(`a result the schema refused is cause 'schema', got ${wrong!.cause}`);

// THE INNER NODE. Without an input its one arc runs on `reader`'s declared EXAMPLE; given a value, it runs on that.
const join = { lang: 'jsonata', expr: '{ "text": $join(lines, " ") }' };
const [arc] = await tryTransform(registry, flow, 'sum', join);
const [mine] = await tryTransform(registry, flow, 'sum', join, { input: { lines: ['typed', 'by', 'hand'] } });
console.log(arc!.sample!.source, mine!.sample!.source, mine!.sample!.result);  // example given { text: 'typed by hand' }
if (arc!.sample!.source !== 'example' || mine!.sample!.source !== 'given') throw new Error('the arc runs on the example, a given value on itself');
if (JSON.stringify(mine!.sample!.result) !== JSON.stringify({ text: 'typed by hand' })) throw new Error('joined, the three given lines');

// An expression the engine refuses: `transform-fails`, naming the throw — the compile error, on the given input.
const [broken] = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{{{' }, { input: { lines: [] } });
if (broken!.kind !== 'transform-fails' || !broken!.why.startsWith('the transform threw on the given input')) throw new Error(`expected the compile error, got ${broken!.why}`);
// The same, as DATA (since 0.11.0): `cause` is 'threw' — no result was produced — where the finding above is 'schema'.
if (broken!.cause !== 'threw' || entry!.cause !== undefined) throw new Error(`a throw is cause 'threw', and a passing verdict has none — got ${broken!.cause}, ${entry!.cause}`);
```

**BREAKING in 0.8.0** (P37 decision 10): **`SampleSource` gains `'given'`**, **`WiringShape` gains
`'given'`** (and `WIRING_SHAPES` with it), and **`WiringVerdict.producer` is optional** — absent on a
given verdict and only there. A `switch` exhaustive over the two sources or the five shapes no longer is,
and code reading `producer` as a `string` fails to compile under `strictNullChecks` — narrow it on
`shape !== 'given'`, or read it as `string | undefined`. `checkWiring`'s own verdicts are unchanged: every
one still carries a producer and an `'example'` or `'witness'` sample.

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
previous node returned, and a `map`'s branch is a TASK — or, since 0.8.0, an `ask`, which runs no worker (`FD-V25`
refuses a map whose branch is a map) — so the outer branch entry is the node whose output carries the item's own list. No `needs`, no
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
checkpoint is an append to it**. **The same header and events answer what any node was HANDED, long after the run** — `inputOf`, section 8 (since 0.10.0). You never have to call `driver.checkpoint()` to keep one:

| | where you get it | what you do with it |
|---|---|---|
| the header | **`onHeader(header)`** on `start`'s options — handed to you inside `start`, BEFORE the first event and before anything reaches the scheduler; and `runtime.start(…)` returns the same one as `header`, beside `driver` and `done` | write it once, FIRST |
| every event | `onFoldInput(event, position)` | write it AT `position` — the driver's index, never a count you start again in each process |
| a resumed run | `runtime.resume(flow, { header, events }, options)` returns the same handle — `{ driver, done, header, stop, state, outcome, node }` — and calls no `onHeader`: you hold the header already | keep writing: it hands you positions from the STORED LENGTH on |

**Write the header FIRST, through `onHeader`** (`RN-R39`, [ADR 0112](doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md),
since 0.8.0). The first events are delivered WHILE `start` runs, so the handle's `header` arrives after them, and a process
that died between your first event write and that header write left events no resume can read. `onHeader` is called ONCE,
before the first `onFoldInput`, with a frozen copy equal to `handle.header` — and **if it throws** (your store could not
write it), `start` throws your error with NOTHING started: nothing recorded, nothing handed to the scheduler, nothing
reported. A `Driver` you built may be started again; on a runtime that run id is spent, so retry under another (or let it
mint one). It is never called on a refused `start` (`BoundaryRefused`, `DataCloneError`, `MultipleRuns`), nor by `resume`.

**And still key the store by POSITION, and the reason is measured.** A resumed run's first position is the length you
stored, not 0, so an arrival counter per process overwrites the run it is resuming. ([W90](doc/work-items/w90-a-run-killed-and-resumed-on-real-workers.md)
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
  // The header FIRST — called once, inside `start`, before the first event below and before any task is handed on.
  onHeader: (header) => { store.header = header; },
  onFoldInput: (event, position) => {
    if (store.header === undefined) throw new Error('an event before the header: the store would hold events no resume can read');
    if (!alive) return;                                   // a dead process writes nothing
    store.events[position] = structuredClone(event);     // your durable append, BY POSITION
    // THE CRASH, simulated: the process dies the instant the first `expand` settles — inside the
    // driver's turn, BEFORE it dispatches what that settlement causes.
    if (event.kind === 'outcome' && event.record.taskId.includes(':expand:')) { alive = false; die(); }
  },
});
// The handle carries the SAME header — it arrives AFTER the first events, which were delivered while `start` ran, and
// that is why the store took it from `onHeader` instead.
if (JSON.stringify(store.header) !== JSON.stringify(run.header)) throw new Error('onHeader and the handle carry one header');
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

**A store that cannot write the header stops the run BEFORE it exists** — `onHeader`'s throw, on a `Driver` you build
(section 12's double, so you can see what reaches the scheduler):

```ts run
import { Driver, NotStarted, liveToken, type CheckpointHeader, type FlowDefinition, type FoldInput } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'header-first', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'join' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'join' }] },
    { id: 'join', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
// ONE log: what your store wrote, and what reached the scheduler, in the order it happened.
const log: string[] = [];
const scheduler = { addTask(task: unknown) { log.push(`handed on ${(task as { id: string }).id}`); }, addEventListener() {} };

// YOUR store, down for the first attempt.
class StoreDown extends Error {}
let storeUp = false;
const store: { header?: CheckpointHeader; events: FoldInput[] } = { events: [] };
const driver = new Driver(flow, {
  runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken,
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } },
  onHeader: (header) => {
    if (!storeUp) throw new StoreDown('the store could not write the header');
    store.header = header;
    log.push('header written');
  },
  onFoldInput: (event, position) => { store.events[position] = event; log.push(`event ${position} written`); },
});

// The store is down: `start` throws YOUR error, and NOTHING started — no event, nothing handed on.
let thrown: unknown = null;
try { driver.start({ batch: 7 }); } catch (e) { thrown = e; }
console.log(thrown instanceof StoreDown, log);   // true []
if (!(thrown instanceof StoreDown) || log.length !== 0) throw new Error(`nothing starts when the header cannot be written: ${log.join()}`);
let unstarted = false;
try { driver.checkpoint(); } catch (e) { unstarted = e instanceof NotStarted; }
if (!unstarted) throw new Error('the driver is UNSTARTED — there is no run to checkpoint');

// The store is back: the SAME driver starts, and the header is written before the first event and the first hand-off.
storeUp = true;
driver.start({ batch: 7 });
console.log(log[0], log.length);   // 'header written' 8 — then the five events of an entry fan-out of two and its two hand-offs
if (log[0] !== 'header written') throw new Error(`the header is written FIRST: ${log.join(' | ')}`);
if (log.filter((l) => l.startsWith('event ')).length !== 5 || log.filter((l) => l.startsWith('handed on ')).length !== 2) {
  throw new Error(`an entry fan-out of two appends five events and hands on two tasks, all after the header: ${log.join(' | ')}`);
}
if (JSON.stringify(store.header) !== JSON.stringify(driver.checkpoint().header)) throw new Error('the header written is the run`s');
```

**What a resume PROMISES, and what it does not** — [ADR 0065](doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md), `spec/run-state.md` section 9:

- **It is AT-LEAST-ONCE, and your workers must tolerate running twice.** The resume REPLAYS the
  stored settlements and resolutions through the routing that produced them — and the stored stops, pauses,
  unpauses, earlier resumes and, since 0.8.0, attempts at their positions — with every dispatch
  held, and then hands every task still in flight to the new scheduler at the SAME task id — or, for a checkpoint of a
  PAUSED run, holds each until you unpause the resumed run (`RN-R21` v0.20, section 8). That set
  is what was in flight at the END of the replay — including a task that finished in the dead process
  whose settlement you had not stored yet, and a task the dying settlement dispatched after your last
  write, which the snippet shows the store never saw. The run records it: a `resumed` event naming
  those ids, and `state.resumes`.
- **A re-run task KEEPS its retry budget** (since 0.8.0 — `RN-R40`,
  [ADR 0113](doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md)). The run RECORDS each
  attempt as it starts — one event, `{ kind: 'attempted', taskId, attemptNumber }`, each time the scheduler's
  `task.running` number for a task of the run RISES (a requeue repeats its number and records nothing) — and the resume
  hands each task it runs again to the new scheduler with **`attemptsSpent`, the highest number your store holds for it**:
  the attempt in flight at the crash COUNTS as spent, and so does one a STOP interrupted. A task whose budget is already
  spent is handed on all the same and runs ONCE more — the scheduler settles it; the library writes no settlement — and a
  task with no attempt stored gets no key. So the record's `attempts` after a resume counts the attempts of EVERY
  process, as the scheduler reports it. Two limits: a task whose attempts only the LOST TAIL saw starts fresh, and a
  `createTask` that builds the task field by field must copy `attemptsSpent` (section 12). *Until 0.8.0 a re-run task got
  a FRESH budget — a budget of two attempts ran THREE times across one kill ([Q365](doc/questions/q365.md)).*
- **A task PARKED for a person is not in flight.** It stays parked, the resumed run is
  `awaiting_action`, and `resolve()` on the RESUMED driver completes it (section 7). **So is an ASK**: the replay
  re-enters it and REGENERATES its `asked` element — the same id and the same kept input, compared with what you stored
  — handing nothing to the new scheduler; answer it on the resumed driver. **An ask parked in a MAP instance whose
  successor reads `"$item"`** (section 3) has its instance's item REBUILT by the same replay — the map is re-entered from
  the stored header and log, and nothing of the item is in your checkpoint — so the answer on the resumed driver reaches a
  `pay` holding the same invoice the uninterrupted run's would have.
- **The check sees only what you STORED.** The stored events must be a prefix of what the replay
  regenerates, and the first position where they are not is refused `diverged` — so a predicate or a
  flow you changed is caught where the stored run's road crosses it, and NOT where that road lies
  past your last event: there the resumed run takes the new road silently
  ([Q372](doc/questions/q372.md)). Change a flow, change its `version`.
- **The store is TRUSTED for what the resume feeds.** A stored settlement's result and a stored
  person's resolution are replayed as stored — nothing can check they are what the process saw
  ([Q374](doc/questions/q374.md)) — and so is a stored `attempted` event's number, which a re-run task is handed as
  the attempts it SPENT (one naming a task the replay never dispatched, carrying no positive integer, or not RISING over
  the last stored for its task, is refused `diverged` at its position). A store you do not trust is a store you should not resume from.
- **`ResumeRefused` names its `reason`**: `format` (not a checkpoint this version writes), `run` (the
  header's run is not the driver's), `flow` (another flow id or `version` — there is no migration),
  `halted`, `cancelled` and `diverged` — the last three with the `index` of the position. **A HALTED
  run is not resumable**: the refusal that halted it would halt it again — and a 0.7.0 checkpoint whose
  halt is stored under the old kind, `stopped`, is refused `halted` at that element's position (ADR 0102). **Nor is a CANCELLED one**
  (section 6): a cancel is its owner's act, and a resume would hand the scheduler again what the owner
  stopped — `index` is the first cancelled settlement or the cancel request, whichever is first. A completed or `stuck` run resumes to itself and
  dispatches nothing. **A STOPPED run is the one terminal run a resume TAKES** (below): its `interrupted` event is replayed, and `resumed` ends it.
- **A refused resume may SPEND its run id.** Refused by its header, nothing exists and the id is still
  free; refused during its replay, the runtime built a driver for it — so that runtime refuses the id
  with `RunIdInUse` from then on, as it refuses any id it ever built a driver for, a finished run's
  included, long after it released the driver (section 12). Resume on a fresh runtime
  ([Q371](doc/questions/q371.md)).
- **A throw from your `onFoldInput` on the `resumed` element HALTS the resumed run** ([W184](doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md), `RN-R22`): it is
  reported once, NOTHING of the in-flight set is handed to the new scheduler, and your own error is thrown at
  `resume()`'s caller — so the stored run, `resumed` and `halted` are a checkpoint refused `halted`, and on a runtime the
  run id is spent there. A throw on an element the replay regenerated in the LOST TAIL is refused
  `ResumeRefused('halted')`, as above. *Until W184 it reached you with nothing handed on: `running` for ever.*
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

### Stopping a run to resume it ELSEWHERE — `handle.stop`

**`handle.stop({ actor, reason?, graceMs? })` — or `driver.stop(…)` on a driver you built — stops ONE run so that a
resume on another runtime continues it** (`RN-R33`,
[ADR 0105](doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md)): an
upgrade, a move, *stop them and continue*. In order: the run is HELD and the driver goes **DEAF**; ONE fold input, `{ kind: 'interrupted', actor,
reason }`, is appended; and only then is each task IN FLIGHT cancelled. Because it hears nothing from the stop on, no `task.cancelled` of the stop is ever written — **the log ends with those tasks dispatched
and unsettled, which is exactly what a resume runs again, at the same ids.** The run reads **`interrupted`** (section 8):
terminal here, and the one terminal outcome a resume accepts.

| | what happens |
|---|---|
| a task RUNNING, WAITING, in a BACKOFF or not yet picked up | each is cancelled, and its `task.cancelled` is NOT recorded — it stays in flight in the log |
| a task PARKED at `user_action` | nothing is sent. **`resolve()` is refused on this runtime from the call on** — the person answers on the runtime that resumes the run |
| an ASK waiting for a person (section 7) | the same: nothing is sent, and its answer is refused here. The runtime that resumes the run REGENERATES the ask — the same id, the same kept input — hands its scheduler nothing for it, and takes the answer. An answer given on the SAME step before the stop was called is taken first — its successor is handed to this runtime and cancelled at once, and the resume runs it again, so the answer is not lost (a same-step CANCEL instead drops a pending answer). Stopped while paused, it resumes paused ([W181](doc/work-items/w181-an-ask-under-run-control.md), `RN-R38`) |
| a task HELD by a pause (section 8) | sent nothing — the scheduler never had it. It stays in flight in the log, and the checkpoint resumes **PAUSED**: every task in flight held until you unpause there |
| `done` | settles with `interrupted` once the stop's CANCELS have resolved — not at the stop, so the old runtime's workers have stopped before you resume elsewhere. The run is released then; a sibling run on the same runtime is untouched |
| the run id | still in use on THIS runtime (`RunIdInUse`) — resume on a FRESH one, which is what an upgrade is |
| a call from your own callback, mid-step | accepted, and taken when the driver's step ends — so everything that step dispatched is in the log and runs again on resume |
| a SECOND call | appends nothing, and forwards its `graceMs` to each task still stopping |
| refused | `RunControlRefused` with `control: 'stop'`, by `reason`: `unsupported` (the scheduler has no `cancel`), `not-started`, `halted`, `cancelled` (a cancelled run is not resumable) and `ended` — nothing recorded or sent. And a `driver.cancel` AFTER a stop is refused `interrupted`: cancel it where it resumes |
| a task that finished before its cancel arrived | runs AGAIN on the resume — its settlement was never heard. At-least-once, as across a crash |
| a task's ATTEMPT that had started | COUNTED as spent, as a crash's is — its `attempted` event is in the log before `interrupted`, so the resume hands the task on with that number as `attemptsSpent`. A stop costs a task one RETRY, never its last run: a task out of retries still runs once (since 0.8.0, `RN-R40`) |
| your `onFoldInput` THROWS on the `interrupted` element | every task in flight is still cancelled and every promise settles, in a `finally` — then the run is HALTED and reported once, and the throw reaches `stop()`'s caller (section 9, `RN-R33`). `halted` outranks `interrupted`: the run is NOT resumable, and `done` settles `halted` at once. *Until [W184](doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md) a stop at rest so thrown stayed `interrupted`, resumable* |

```ts run
import { Driver, fold, liveToken, resumeRefusal, type FlowDefinition } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'stop-run', version: 1, entry: 'split',
  nodes: [
    { id: 'split',   kind: 'fanout', branches: ['a', 'b', 'review'] },
    { id: 'a',       kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b',       kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'review',  kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end', outcome: 'completed' },
  ],
};

// A fake scheduler with the scheduler's own `cancel`: the stopped worker fires `task.cancelled`, then cancel() resolves.
function fakeScheduler() {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const added: string[] = [];
  const stopping = new Map<string, (stopped: boolean) => void>();
  const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const settle = (id: string, state: 'done' | 'user_action') => {
    if (state === 'done') fire('task.completed', { id, state, result: { ok: true } });
    else { fire('task.failed', { id, state, error: 'a person must look' }); fire('task.user_action', { id, state }); }
  };
  return {
    added, settle,
    stops: (id: string) => { fire('task.cancelled', { id, state: 'cancelled' }); stopping.get(id)?.(true); },
    addTask(task: unknown) { added.push((task as { id: string }).id); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    cancel(id: string) { return new Promise<boolean>((resolve) => { stopping.set(id, resolve); }); },
  };
}
const options = {
  runId: 'run-1', createTask: (c: unknown) => c, predicates: new Map(),
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } }, joinPolicy: liveToken,
};

// RUNTIME A: a and b running, review parked on a person.
const oldScheduler = fakeScheduler();
const driver = new Driver(flow, { ...options, scheduler: oldScheduler });
driver.start({});
oldScheduler.settle('run-1:review:2:0', 'user_action');

const stopped = driver.stop({ actor: 'ops', reason: 'upgrade' });
console.log(fold(driver.foldInputs()).outcome);   // interrupted
if (fold(driver.foldInputs()).outcome !== 'interrupted') throw new Error('a stopped run reads `interrupted`');
if (driver.resolve('run-1:review:2:0', 'done', { actor: 'ana', result: null })) throw new Error('resolve() is refused here');

// The workers stop. Their `task.cancelled` reaches a DEAF driver: the element is still the last thing in the log.
oldScheduler.stops('run-1:a:0:0');
oldScheduler.stops('run-1:b:1:0');
await stopped;
if (driver.foldInputs().at(-1)?.kind !== 'interrupted') throw new Error('no task.cancelled of a stop is recorded');

// RUNTIME B: a fresh driver, resumed from the stored checkpoint.
const checkpoint = structuredClone(driver.checkpoint());
if (resumeRefusal(flow, checkpoint) !== null) throw new Error('a stopped run is resumable');
const newScheduler = fakeScheduler();
const resumed = new Driver(flow, { ...options, scheduler: newScheduler });
resumed.resume(checkpoint);
console.log(newScheduler.added);   // [ 'run-1:a:0:0', 'run-1:b:1:0' ] — exactly what was in flight, at the same ids
if (newScheduler.added.join() !== 'run-1:a:0:0,run-1:b:1:0') throw new Error('the in-flight set runs again');
// The person answers HERE, and the run completes.
if (!resumed.resolve('run-1:review:2:0', 'done', { actor: 'ana', result: { ok: true } })) throw new Error('resolved on B');
newScheduler.settle('run-1:a:0:0', 'done');
newScheduler.settle('run-1:b:1:0', 'done');
const state = fold(resumed.foldInputs());
console.log(state.outcome, state.interruption);   // completed null
if (state.outcome !== 'completed' || state.interruption !== null) throw new Error('the resume ended the stop, and the run completed');
```

On a runtime you call `handle.stop(…)` and wait for `handle.done`, which settles `interrupted` once the workers have
stopped; then you resume the checkpoint on a fresh runtime, as the snippet above does after a crash.

**BREAKING in 0.8.0** (P34 decision 10): `RunOutcome` gains `'interrupted'` and `FoldInput` the kind `'interrupted'`,
so an exhaustive `switch` over either no longer compiles; `RunState` gains the cell `interruption` (`null` unless the
run is stopped NOW — a `resumed` event ends it), which a `RunState` literal must carry; `RunControlRefused.control` gains
`'stop'` and its `reason` `'interrupted'`; and `RunHandle` gains `stop`, which breaks only code that builds a handle.

### What a run records of each ATTEMPT — and what a resume hands on

**Each attempt a task STARTS is one event in the run, and a resume hands the count on** (`RN-R40`,
[ADR 0113](doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md), since 0.8.0). The driver
hears the scheduler's `task.running` and appends `{ kind: 'attempted', taskId, attemptNumber }` — the scheduler's
1-based number — for a task of its run, each time that number RISES: a requeue (a worker died under the task, and the
pool ran it again) repeats its number and records nothing. Every task, with a `retryPolicy` or without. It is a FOLD
INPUT, never a log record, and it moves no outcome and no state — only its task's `attemptNumber` on the `nodes` entry
(section 8, since W187). What it changes besides is what a resume does: each task it runs again is handed on with
`attemptsSpent`, the highest number your store holds for it.

| | what happens |
|---|---|
| an inline pool starts the task INSIDE the driver's `addTask` | the event is appended when the driver's step ENDS — after everything that step recorded, before a pause or a stop called on it — so it always sits between two steps, where a resume can feed it |
| an id of another run, an id no driver minted, a task the run never dispatched, a detail with no attempt number | nothing recorded and nothing reported — an attempt never stops a run |
| a stopped driver (section 18's stop) | records nothing more: the attempt running at the stop is in the log, one after it is not |
| your `onFoldInput` THROWS on the event | section 9's rule: the run halted, reported once, and on your own call's step thrown to you |

```ts run
import { Driver, fold, liveToken, type FlowDefinition } from 'fyflow-orchestration';

const flow: FlowDefinition = {
  flowId: 'attempts', version: 1, entry: 'fetch',
  nodes: [
    { id: 'fetch', kind: 'task', type: 'T', retryPolicy: { maxRetries: 2, backoffMs: 1000 }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
// A fake scheduler: it records what it is handed, and a test says when an attempt STARTS — the scheduler's
// `task.running`, with its 1-based `attemptNumber`.
function fakeScheduler() {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const added: Record<string, unknown>[] = [];
  return {
    added,
    starts: (id: string, attemptNumber: number) => {
      for (const fn of listeners.get('task.running') ?? []) fn({ detail: { id, state: 'running', attemptNumber } });
    },
    addTask(task: unknown) { added.push(task as Record<string, unknown>); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
  };
}
const options = {
  runId: 'run-1', createTask: (c: unknown) => c, predicates: new Map(),
  workers: { w: { url: 'worker.js' } }, nodeTypes: { T: { worker: 'w' } }, joinPolicy: liveToken,
};

// PROCESS ONE: `fetch` fails its first attempt and starts its second — and then the process dies.
const first = fakeScheduler();
const driver = new Driver(flow, { ...options, scheduler: first });
driver.start({});
first.starts('run-1:fetch:-:0', 1);
first.starts('run-1:fetch:-:0', 2);
first.starts('run-1:fetch:-:0', 2);   // a worker died under it and the pool REQUEUED it: the same number, nothing recorded
const attempts = driver.foldInputs().filter((e) => e.kind === 'attempted');
console.log(attempts.length);   // 2 — one per attempt STARTED
if (attempts.length !== 2) throw new Error('one event per attempt started, and none for the requeue');
if (driver.snapshot().length !== 0) throw new Error('an attempt is a fold input, never a log record');
if (fold(driver.foldInputs()).outcome !== 'running') throw new Error('and it moves no outcome');
if (fold(driver.foldInputs()).nodes['run-1:fetch:-:0']!.attemptNumber !== 2) throw new Error('only the entry`s attemptNumber (section 8)');

// PROCESS TWO: resumed from the stored events — `fetch` is handed on with the two attempts it SPENT.
const second = fakeScheduler();
new Driver(flow, { ...options, scheduler: second }).resume(structuredClone(driver.checkpoint()));
console.log(second.added[0]?.attemptsSpent);   // 2 — the scheduler runs it as attempt 3, its LAST, not as attempt 1
if (second.added[0]?.attemptsSpent !== 2) throw new Error('the retry budget survives the crash');
```

**BREAKING in 0.8.0** (P36 (p)): `FoldInput` gains the kind `'attempted'`, so an exhaustive `switch` over `kind` no
longer compiles; a run on a real scheduler appends one more event per attempt started, so your store grows by about one
event per task; and a resumed task is handed on with `attemptsSpent`, so its retries are not reset and the record's
`attempts` counts every process's. Additive: `TaskFactory`'s config gains the optional `attemptsSpent` — which a
`createTask` building the task field by field must copy (section 12).

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
const halted = await second.start(filter, { name: 'Dark.S01E01.mkv', sizeMB: 1 }, { onRunFailure: (f) => kinds.push(f.kind) }).done;
await second.shutdown();
console.log(halted.outcome, kinds);                             // halted [ 'UndeclaredRoute' ]
if (halted.outcome !== 'halted' || kinds.join() !== 'UndeclaredRoute' || halted.gated.length !== 0) {
  throw new Error(`an undeclared route halts the run by name, recording nothing: ${halted.outcome} ${kinds.join()}`);
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
> built-in declares no `inline`, no `groups` and no `pool`, and a named pool instance carries `type`,
> `config` and — since v0.37 ([ADR 0099](doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md)) — `pool`; so of the four things ADR 0075 rule 3
> lists, a named instance reaches `config` and `pool` (its options, `residentGroups` included: a transform-only pool
> CAN now hold a resident group, [Q626](doc/questions/q626.md)), a `retryPolicy` goes on the NODE, and `inline` and
> `groups` are reachable by no road a consumer can write ([Q457](doc/questions/q457.md)). Measured at W110 and W165.
