# fyflow-orchestration — Reference

Flow orchestration over [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler): sequence,
decision routing, fan-out and join.

> **Every ```ts snippet in this file is extracted, typechecked and executed by `npm run gate`.**
> `scripts/check-docs.mjs` pulls them out, rewrites the `fyflow-orchestration` import to this
> repository's `index.ts`, compiles them together and runs the ones it can. **A stale snippet is a
> failing gate rather than a lie** — which is why they are worth reading.
>
> `run` snippets execute; `check` snippets are typechecked only, because they need a live scheduler
> or exist to show a type.

---

## 1. What this library is, and what it is not

`fyflow-scheduler` runs tasks. **It has no dependency graph** — no `dependsOn`, no `parents`, no
ordering — and its own reference lists them under *"Things that do NOT exist"*.

**This library decides which task runs next, and why.** It owns four things the scheduler does not
have: **sequence**, **decision routing**, **fan-out** and **join**.

| | belongs to |
|---|---|
| worker pools, threads, retry, resource limits, task execution | `fyflow-scheduler` |
| what runs after what, and on what condition | **here** |

**This package does not depend on the scheduler.** Nothing under `src/` imports it; `SchedulerLike`
is a two-method structural interface and **you pass your own scheduler in**. Install whichever
version you like.

```ts check
import type { SchedulerLike } from 'fyflow-orchestration';

// The entire surface this library needs from a scheduler.
const shape: SchedulerLike = {
  addTask(_task: unknown) { return undefined; },
  addEventListener(_type: string, _listener: (e: { detail: unknown }) => void) {},
};
void shape;
```

---

## 2. Minimal working program

A flow is **data**. You supply the predicates and the task factory; the driver does the rest.

```ts run
import { Driver, liveToken, type FlowDefinition, type Predicate } from 'fyflow-orchestration';

const definition: FlowDefinition = {
  flowId: 'greet',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest',  kind: 'task', workerType: 'IngestWorker',  edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end',  outcome: 'completed' },
  ],
};

// A fake scheduler, so this snippet runs with no workers. In your program this is
// `new FyflowScheduler({ ... })` — see section 12.
const listeners: ((e: { detail: unknown }) => void)[] = [];
const added: { id: string }[] = [];
const scheduler = {
  addTask(task: unknown) { added.push(task as { id: string }); },
  addEventListener(_t: string, fn: (e: { detail: unknown }) => void) { listeners.push(fn); },
};

const driver = new Driver(definition, {
  scheduler,
  createTask: (config) => config,          // your `new FyflowTask(config)`
  predicates: new Map<string, Predicate>(),
  workerTypes: ['IngestWorker', 'PublishWorker'],
  joinPolicy: liveToken,
});

driver.start('run-1', { name: 'world' });
console.log(added.map((t) => t.id));       // [ 'run-1:ingest:-:0' ]

// The scheduler reports a settlement; the driver routes.
for (const fn of listeners) {
  fn({ detail: { id: 'run-1:ingest:-:0', state: 'done', result: { greeting: 'hello world' } } });
}
console.log(added.map((t) => t.id));       // ingest, then publish
if (added.length !== 2) throw new Error('expected the settlement to dispatch `publish`');
```

**Three things bite everyone.** `start()` takes the run id, and it must match
`[A-Za-z0-9_-]{1,64}`. A definition with a fan-out and no `joinPolicy` is **refused at
construction**. And a driver serves **exactly one run** — see section 9.

---

## 3. The flow definition

Four node kinds. A definition is JSON: no functions, so it can be stored, versioned and sent over a
wire.

```ts check
import type { FlowDefinition } from 'fyflow-orchestration';

const shapes: FlowDefinition = {
  flowId: 'shapes',
  version: 1,
  entry: 'score',
  nodes: [
    // A task runs a worker. `optional` decides what a failure MEANS — section 6.
    { id: 'score', kind: 'task', workerType: 'ScoreWorker', optional: false, edges: [
      { on: ['failed'], to: 'quarantine' },   // eligible only when the task failed
      { when: 'isLowConfidence', to: 'review' }, // guarded by a registered predicate
      { to: 'publish' },                      // the default: no `on`, no `when`
    ] },
    { id: 'review',  kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'quarantine', kind: 'end', outcome: 'quarantined' },
    { id: 'done',       kind: 'end', outcome: 'completed' },
  ],
};
void shapes;
```

| kind | |
|---|---|
| `task` | runs a worker of `workerType`. Has `edges` |
| `fanout` | `branches: string[]` — the node each branch starts at. Dispatches nothing itself |
| `join` | `of: '<fanout id>'`. Fires when its policy says so; has one edge |
| `end` | terminal. `outcome` is **your label**, never interpreted |

**`end.outcome` is a string you choose.** The library never reads it. What the *run* is called is a
separate, closed vocabulary — section 8.

### Validation happens at construction, not at routing time

`new Driver(...)` validates the whole definition before anything is queued. A typo cannot become a
routing failure discovered months later on the one workload that takes that branch.

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

const broken = {
  flowId: 'broken', version: 1, entry: 'a',
  nodes: [{ id: 'a', kind: 'task', workerType: 'NoSuchWorker', edges: [{ to: 'ghost' }] }],
} as unknown as FlowDefinition;

const findings = validateDefinition(broken, { predicates: [], workerTypes: ['RealWorker'] });
console.log(findings.map((f) => `${f.rule} at ${f.at}`).sort());
// FD-V2 (edge to a missing node) and FD-V5 (unknown workerType)
const rules = findings.map((f) => f.rule).sort();
if (!rules.includes('FD-V2') || !rules.includes('FD-V5')) {
  throw new Error(`expected FD-V2 and FD-V5, got ${rules.join(',')}`);
}
```

There are **24 refusals**, `FD-V1` … `FD-V24`, each with a failing example in
`spec/examples/invalid/`. The ids are never renumbered, so it is safe to assert on them. The full
list is `spec/flow-definition.md`.

---

## 4. Decisions and predicates

**An edge names a predicate; it does not carry one.** The definition stays data, and an unknown name
fails at construction rather than mid-run.

```ts run
import { eligibleEdges, selectEdge, type FlowNode, type Predicate } from 'fyflow-orchestration';

const node: FlowNode = {
  id: 'score', kind: 'task', workerType: 'ScoreWorker',
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

const taken = selectEdge(node, 'r1', 'done', { outcome }, new Map([['isLowConfidence', isLowConfidence]]));
console.log(taken.taken?.to);                                 // 'review'
if (taken.taken?.to !== 'review') throw new Error('the guarded edge should win at 0.2');
```

**Edges are tried in declaration order** and the first whose `when` passes is taken. An edge with no
`when` is the default and matches immediately, so **it must come last**.

A predicate receives the node's **effective outcome** — the same shape whether the task settled or a
human resolved it. It should be pure: it is called during routing, and the library does not enforce
that.

---

## 5. Fan-out, join, and which policy to pass

```ts check
import type { FlowDefinition } from 'fyflow-orchestration';

const fanout: FlowDefinition = {
  flowId: 'score-both', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split',  kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    { id: 'scoreA', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
void fanout;
```

### Pass `liveToken`

Two policies are exported. **Use `liveToken`.**

```ts run
import { POLICIES, liveToken, arrivalCount } from 'fyflow-orchestration';

console.log(Object.keys(POLICIES));            // [ 'arrival-count', 'live-token' ]
console.log(liveToken.id, arrivalCount.id);
if (POLICIES['live-token'] !== liveToken) throw new Error('POLICIES must expose the same objects');
```

`arrivalCount` waits for **N** branches, where N is fixed when the fan-out opens. That is wrong
whenever *"how many will arrive"* differs from *"how many opened"* — and **every non-success outcome
makes it differ**. A branch routed away by a decision never arrives. A branch whose `optional` task
fails never arrives. The counter never completes, the run waits forever with nothing queued and
nothing running, and **no error is raised**.

`liveToken` counts *live branches* instead: opening one increments, and arriving, exiting or being
lost each decrement. The join fires when the count reaches zero having been positive, whichever road
each branch took.

**`arrivalCount` is still exported deliberately** — it is the falsifiable form of the simpler
mechanism, and the comparison that chose between them is only meaningful while both can be run. It
is not a supported choice. See
[ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md).

### What a join carries downstream

**`null`, currently.** A satisfied join can be reached from three different branches and which one
arrives last is genuinely non-deterministic, so forwarding "whichever finished last" would make your
data depend on scheduling. Nothing is invented in its place. This is
[Q36](doc/open-questions.md) and it is open.

---

## 6. When something fails

**A non-success outcome routes only where an edge opts in.** This is the rule most people guess
wrong.

```ts run
import { eligibleEdges, type FlowNode } from 'fyflow-orchestration';

const node: FlowNode = {
  id: 'extract', kind: 'task', workerType: 'ExtractWorker', optional: true,
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
flow to handle failure, set `optional: true` and give it an `on: ['failed']` edge.

---

## 7. The human in the loop

A non-optional task that runs out of retries ends in `user_action`. The branch **suspends**: the join
keeps waiting, and the run is not stuck.

```ts check
import type { Driver } from 'fyflow-orchestration';

declare const driver: Driver;

// The only way anything outside this process changes a run.
const accepted: boolean = driver.resolve('run-1:review:1:0', 'done', {
  result: { approved: true },
  actor: 'a-person',        // opaque; never interpreted, never authenticated
});
void accepted;
```

`resolve()` returns `false` if the task is not suspended — a rejected command, not a run failure, so
you may retry. It does **one** thing: supply an outcome for a dispatch that already happened. It
cannot re-run the node and it cannot send it somewhere else.

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

const running = fold([{ kind: 'dispatched', taskId: 'r1:a:-:0' }]);
console.log(running.outcome, isTerminal(running));            // running false

const done = fold([
  { kind: 'dispatched', taskId: 'r1:a:-:0' },
  settled('r1:a:-:0', 'done'),
  { kind: 'pathEnded', reason: 'end', at: 'done' },
]);
console.log(done.outcome, isTerminal(done));                  // completed true
if (done.outcome !== 'completed') throw new Error('a path ending at an `end` node completes the run');
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

Two kinds, and the difference is not stylistic.

**Thrown**, because you are on the stack and can act:

```ts run
import { Driver, InvalidDefinition, MissingJoinPolicy, type FlowDefinition } from 'fyflow-orchestration';

const scheduler = { addTask() {}, addEventListener() {} };
const noPolicy = {
  flowId: 'f', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', workerType: 'W', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
    { id: 'b', kind: 'task', workerType: 'W', edges: [{ to: 'j' }] },
    { id: 'c', kind: 'task', workerType: 'W', edges: [{ to: 'j' }] },
    { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'e' }] },
    { id: 'e', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

let refused = '';
try {
  new Driver(noPolicy, { scheduler, createTask: (c) => c, predicates: new Map(), workerTypes: ['W'] });
} catch (e) {
  refused = (e as Error).constructor.name;
}
console.log(refused);                          // MissingJoinPolicy
if (refused !== 'MissingJoinPolicy') throw new Error('a fan-out with no policy must be refused');
void InvalidDefinition;
```

`InvalidDefinition` carries the violated rule ids on `.rules`, so you can act on them rather than
parse a string. `MultipleRuns` is thrown if you `start()` a **second, different** run on one driver:
a driver's sequence and join state carry no run id, so a second run would silently merge into the
first. **One driver, one run.** (`Driver` still exposes `hasFailed(runId)` and takes a run id per
call — that inconsistency is [Q53](doc/open-questions.md).)

**Reported, not thrown**, because there is nobody on the stack: `DuplicateTaskId`,
`UncloneableResult` and a routing failure all happen inside a scheduler event listener, and
`EventTarget.dispatchEvent` **discards a listener throw**. Give the driver `onRunFailure` or you will
not hear about them.

```ts check
import { Driver, type RunFailure } from 'fyflow-orchestration';

declare const opts: ConstructorParameters<typeof Driver>[1];
const withReporting = {
  ...opts,
  onRunFailure: (f: RunFailure) => console.error(`run ${f.runId} stopped: ${f.kind} — ${f.message}`),
};
void withReporting;
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
- **Retaining a scheduler event's `detail`.** It is the live task object and it mutates. The driver
  copies at the listener boundary, so anything the driver gives you is safe — but if you subscribe
  to the scheduler yourself, copy the fields you need synchronously.
- **Reusing a task id.** The driver refuses a duplicate before the scheduler sees it, because the
  scheduler would run both and record two outcomes under one key.
- **Sharing one `Driver` between runs.** Section 9.

---

## 11. What does NOT exist — do not write code using it

| not available | instead |
|---|---|
| flow-level **retry** | the scheduler's `retryPolicy`, per task |
| **cancellation** | nothing. The scheduler cannot cancel a queued task either |
| **durability** — resuming a run after a restart | nothing. The fold is designed to make it additive; it is not built |
| **nested fan-out** — a branch that fans out again | refused at construction (`FD-V15`) |
| **map-style fan-out** — one branch per item in a result | not built; branches are static |
| a **join timeout** | nothing. A stuck join is detected by the `stuck` outcome, with no clock |
| **per-join policy choice** | one policy per driver |
| an **event stream** for a UI | nothing. Flow structure is invisible to the scheduler, so no UI can show it |

---

## 12. Wiring it to a real scheduler

The two things you supply are `createTask` and the scheduler itself.

```ts check
import { Driver, liveToken, type FlowDefinition, type Predicate } from 'fyflow-orchestration';
import { FyflowScheduler, FyflowTask, WorkerManager } from 'fyflow-scheduler';

declare const definition: FlowDefinition;
declare const predicates: Map<string, Predicate>;
declare const workerUrl: string;

const scheduler = new FyflowScheduler({
  IngestWorker: new WorkerManager(workerUrl, { maxThreads: 2, inline: true, config: { role: 'ingest' } }),
});

const driver = new Driver(definition, {
  scheduler,
  createTask: (config) => new FyflowTask(config),
  predicates,
  workerTypes: ['IngestWorker'],
  joinPolicy: liveToken,
  onRunFailure: (f) => console.error(f.kind, f.message),
});

driver.start('run-1', { some: 'payload' });
```

`createTask` exists so this library never constructs a scheduler object, which is what keeps it free
of a dependency on the scheduler. `workerTypes` is the set the validator checks a definition
against — pass the keys of your `workerPools`.

> **If your `tsconfig` includes the DOM lib, that assignment does not typecheck**, and you will need
> `scheduler: scheduler as unknown as SchedulerLike`. `FyflowScheduler extends EventTarget`, so with
> the DOM lib in scope it picks up `addEventListener(type, EventListenerOrEventListenerObject | null,
> options?)`, which `SchedulerLike`'s narrower `(type, (e: { detail: unknown }) => void)` is not
> compatible with. Without the DOM lib — the configuration this repository compiles under — it is
> fine.
>
> **This is a defect in our type, not in yours**, and a documented cast is a defect with an apology
> attached. It is [Q71](doc/open-questions.md), found while writing the snippet above.

**A worker file can be TypeScript.** Node 24 runs it by stripping types, so one `.ts` worker serves
Node, Deno and the browser.

Thirteen worked flows, on a real scheduler, are in [`examples/`](examples/README.md) — including a
routed-away branch, a lost branch, a human resolving a suspension, and a refusal that stops a run.
