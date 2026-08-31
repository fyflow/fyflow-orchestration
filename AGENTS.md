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
import { Driver, fold, liveToken, type FlowDefinition, type Predicate } from 'fyflow-orchestration';

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
  workerTypes: ['IngestWorker', 'PublishWorker'],
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

## 3. The flow definition

Four node kinds. A definition is JSON: no functions, so it can be stored, versioned and sent over a
wire.

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

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

// Not merely well-typed — VALID, and checked here rather than asserted. Note the
// `on: ['failed']` edge is declared FIRST: "the default comes last" is scoped per
// terminal state, not to the array. See section 4.
const bad = validateDefinition(shapes, {
  predicates: ['isLowConfidence'],
  workerTypes: ['ScoreWorker', 'ReviewWorker', 'PublishWorker'],
});
if (bad.length) throw new Error(`section 3's own example is invalid: ${bad.map((f) => f.rule).join()}`);
```

| kind | | refused if |
|---|---|---|
| `task` | runs a worker of `workerType`. Has `edges` | it has no `edges`, or **no edge of it is eligible for `done`** (`FD-V7`) |
| `fanout` | `branches: string[]` — the node each branch starts at. Dispatches nothing itself | fewer than two branches, a repeated entry, any `edges` at all, or a branch entry that is not a `task` (`FD-V9`) |
| `join` | `of: '<fanout id>'`. Fires when its policy says so | it does not have **exactly one** edge, or that edge carries `when` or `on` (`FD-V7`) |
| `end` | terminal. `outcome` is **your label**, never interpreted | — |

**A `task` node must have an edge that can be taken when it succeeds.** A node whose only edge is
`{ when: 'p', to: 'x' }` is refused at construction — it is the mistake the format most invites, and
`FD-V7` is what catches it.

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

There are **23 refusals** over the id range `FD-V1` … `FD-V24`, each with a failing example in
`spec/examples/invalid/`. The ids are never renumbered, so it is safe to assert on them. The full
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
`when` is the default and matches immediately, so **it must come last among the edges eligible for
that terminal state** — not last in the array. `FD-V7` is scoped per terminal state, which is why
section 3's example can declare its `on: ['failed']` edge first: for `done` the eligible edges are
`review` then `publish`, and the default is last of those.

A predicate receives the node's **effective outcome** — the same shape whether the task settled or a
human resolved it. It should be pure: it is called during routing, and the library does not enforce
that.

---

## 5. Fan-out, join, and which policy to pass

```ts run
import { validateDefinition, type FlowDefinition } from 'fyflow-orchestration';

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

const bad = validateDefinition(fanout, {
  predicates: [],
  workerTypes: ['IngestWorker', 'ScoreWorker', 'PublishWorker'],
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
branch reached** and carries `null` onward; this one instead reports the join as unfireable — through
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
`liveTokenRequiringArrival` stops the run instead of running the join's successor on nothing. The
recommendation is still `liveToken`, because a run that stops is the more expensive mistake to make
by accident.

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
import { Driver, fold, liveToken, type FlowDefinition, type Predicate } from 'fyflow-orchestration';

const definition: FlowDefinition = {
  flowId: 'review', version: 1, entry: 'score',
  nodes: [
    { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
      { on: ['failed'], to: 'quarantine' },
      { to: 'done' },
    ] },
    { id: 'quarantine', kind: 'end', outcome: 'quarantined' },
    { id: 'done',       kind: 'end', outcome: 'completed' },
  ],
};

const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const driver = new Driver(definition, {
  runId: 'run-1',
  scheduler: {
    addTask() {},
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
      listeners.set(type, [...(listeners.get(type) ?? []), fn]);
    },
  },
  createTask: (c) => c,
  predicates: new Map<string, Predicate>(),
  workerTypes: ['ScoreWorker'],
  joinPolicy: liveToken,
});
driver.start({});

// Out of retries: BOTH events, same object, `state: 'user_action'`.
const detail = { id: 'run-1:score:-:0', state: 'user_action', result: null, error: 'out of retries' };
for (const type of ['task.failed', 'task.user_action']) {
  for (const fn of listeners.get(type) ?? []) fn({ detail });
}

// One pair of events, ONE record. The driver drops the `task.failed` whose detail
// already reads `user_action` and records on the `task.user_action` that follows —
// so the discriminator is the pair, and reading the event name alone is what
// double-counts.
const records = driver.snapshot();
console.log(records.length, fold(driver.foldInputs()).outcome);   // 1 'awaiting_action'
if (records.length !== 1) throw new Error(`the event pair produced ${records.length} records`);
if (fold(driver.foldInputs()).outcome !== 'awaiting_action') throw new Error('expected awaiting_action');

// The only way anything outside this process changes a run. `actor` is opaque:
// never interpreted, never authenticated (Q29).
const accepted = driver.resolve('run-1:score:-:0', 'failed', { actor: 'a-person' });
const again    = driver.resolve('run-1:score:-:0', 'failed', { actor: 'a-person' });
console.log(accepted, again);                                     // true false
if (!accepted || again) throw new Error('a second resolution must be refused, not applied twice');

// `resolvedAs: 'failed'` took the `on: ['failed']` edge — the only road there for a
// non-optional node.
console.log(fold(driver.foldInputs()).outcome);                   // 'completed'
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
  new Driver(noPolicy, {
    runId: 'run-1', scheduler, createTask: (c) => c, predicates: new Map(), workerTypes: ['W'],
  });
} catch (e) {
  refused = (e as Error).constructor.name;
}
console.log(refused);                          // MissingJoinPolicy
if (refused !== 'MissingJoinPolicy') throw new Error('a fan-out with no policy must be refused');
void InvalidDefinition;
```

`InvalidDefinition` carries the violated rule ids on `.rules`, so you can act on them rather than
parse a string. `InvalidRunId` is thrown by the **constructor** for a `runId` outside `[A-Za-z0-9_-]{1,64}`
(`ID-R2`) — `:` is excluded because it is the task-id delimiter, and excluding it is what makes the
task-id parse total.

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
message tells you to build — **under two conditions.** Give each driver a **different** run id: two
sharing one id mint the same task ids, and neither can see the collision. And put only flow tasks on
that scheduler: a task id no driver minted does not parse, and that stops **every** driver on it.
 A settlement reaches only the driver that **dispatched** that task id:
one for another run is ignored, and one carrying **this** driver's run id for a task it never
dispatched stops the run with `UndispatchedTask` (`ID-R4`). The second half is a refusal rather than
a filter for `ID-R1`'s reason — within one run the driver mints every id it dispatches, so a
settlement it did not mint means its bookkeeping is wrong.

**Reported, not thrown**, when there is nobody on the stack: `DuplicateTaskId`, `UncloneableResult`
and `NoMatchingEdge` raised *inside a scheduler event listener*. Give the driver `onRunFailure` or you
will not hear about them — the run stops and folds to `stopped`, silently.

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
quoted in prose, so renaming one in `src/` fails this gate instead of silently falsifying the two
paragraphs above:

```ts run
import {
  DuplicateTaskId, InvalidDefinition, InvalidRunId, MissingJoinPolicy,
  MultipleRuns, NoMatchingEdge, UncloneableResult, UndispatchedTask,
} from 'fyflow-orchestration';

const named = [
  DuplicateTaskId, UncloneableResult, NoMatchingEdge, UndispatchedTask,  // reported inside a listener
  MultipleRuns, InvalidRunId, InvalidDefinition, MissingJoinPolicy,      // thrown at you
].map((c) => c.name).join(' ');
console.log(named);
if (named !== 'DuplicateTaskId UncloneableResult NoMatchingEdge UndispatchedTask MultipleRuns ' +
             'InvalidRunId InvalidDefinition MissingJoinPolicy') {
  throw new Error(`section 9 names classes that no longer exist under those names: ${named}`);
}
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
- **Assuming `joinStatusOf().describe` is yours.** It is whatever **your** policy's `describe()`
  returned. The two shipped policies return a fresh object; a policy that returns its own state hands
  you that state, and writing to it changes what the join decides. Return a copy from `describe()`
  — [Q82](doc/open-questions.md).

The first half of that is executed rather than asserted:

```ts run
import { Driver, type FlowDefinition } from 'fyflow-orchestration';

const listeners: ((e: { detail: unknown }) => void)[] = [];
const scheduler = {
  addTask() {},
  addEventListener(_t: string, f: (e: { detail: unknown }) => void) { listeners.push(f); },
};
const flow = {
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

const frozen: Record<string, boolean> = {};
const driver = new Driver(flow, {
  runId: 'run-1',
  scheduler, createTask: (c) => c, predicates: new Map(), workerTypes: ['W'],
  joinPolicy: { id: 'p', open: () => 0, step: (s: number) => s, status: () => 'waiting', describe: () => ({}) },
  onRegionEvent: (e) => { frozen.onRegionEvent = Object.isFrozen(e); },
  onFoldInput: (i) => { frozen.onFoldInput = Object.isFrozen(i); },
});
driver.start({});
// One settlement, delivered the way the scheduler delivers it, so the fan-out opens.
const task = { id: 'run-1:a:-:0', state: 'done', result: null, attempts: 0,
  timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
for (const f of listeners) f({ detail: task });

frozen.snapshot = Object.isFrozen(driver.snapshot()) && driver.snapshot().every(Object.isFrozen);
frozen.foldInputs = Object.isFrozen(driver.foldInputs()) && driver.foldInputs().every(Object.isFrozen);
console.log(frozen);   // all four true
for (const [name, isFrozen] of Object.entries(frozen)) {
  if (!isFrozen) throw new Error(`${name} handed out something you can write to`);
}
if (Object.keys(frozen).length !== 4) {
  throw new Error(`expected all four paths to be exercised, saw ${Object.keys(frozen).join()}`);
}
```
- **Subscribing to the scheduler yourself and counting `task.failed`.** A `user_action` task fires
  it *and* `task.user_action`. Key on the terminal state — section 7.
- **Sharing one `Driver` between runs.** `start()` is called at most once and a second throws
  `MultipleRuns` — section 9. *Sharing one **scheduler** between `Driver`s is fine*, and used to be
  the other half of this bullet: a settlement now reaches only the driver that dispatched it.

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
  runId: 'run-1',
  scheduler,
  createTask: (config) => new FyflowTask(config),
  predicates,
  workerTypes: ['IngestWorker'],
  joinPolicy: liveToken,
  onRunFailure: (f) => console.error(f.kind, f.message),
});

driver.start({ some: 'payload' });
```

`createTask` exists so this library never constructs a scheduler object, which is what keeps it free
of a dependency on the scheduler. `workerTypes` is the set the validator checks a definition
against — pass the keys of your `workerPools`.

> **You will probably need a cast here, and it is our fault.** Write
> `scheduler: scheduler as unknown as SchedulerLike` and import `SchedulerLike` alongside `Driver`.
>
> `FyflowScheduler extends EventTarget`, so **with the DOM lib in scope** it picks up
> `addEventListener(type, EventListenerOrEventListenerObject | null, options?)`, which
> `SchedulerLike`'s narrower `(type, (e: { detail: unknown }) => void)` is not compatible with.
>
> **The DOM lib is TypeScript's default when you do not set `lib` yourself**, so the failing
> configuration is the common one and the working one is the exception. The snippet above compiles
> here only because `tsconfig.docs.json` sets `lib: ["ES2022"]` explicitly. Measured: of this
> document's snippets, this is the **only** one that fails under a DOM configuration.
>
> **This is a defect in our type, not in yours**, and a documented cast is a defect with an apology
> attached. It is [Q71](doc/open-questions.md), found while writing the snippet above.

**A worker file can be TypeScript.** Node 24 runs it by stripping types, and Deno natively, so **one
`.ts` worker serves Node and Deno** — the scheduler's own reference says a Node worker must be
JavaScript, and that is stale at Node 24. **Not the browser**: nothing there executes TypeScript, so
a browser build needs the worker emitted as a bundled `.js` asset. `RT-R10` — ladder L6 runs in Node
and Deno and not in the browser, and the browser rung is [Q52](doc/open-questions.md).

**Pin the scheduler at 0.3.0.** This library's listener boundary is written against 0.3.0 semantics:
`task.progress`'s detail changed shape at that version (the id is `id`, not `taskId`), the second
`task.user_action` dispatch site is new, and `task.timestamp` did not exist before it. At the time of
writing **npm and JSR both stop at 0.2.1**, so 0.3.0 is reached from a working tree — see
[ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md).

Thirteen worked flows, on a real scheduler, are in [`examples/`](examples/README.md) — including a
routed-away branch, a lost branch, a human resolving a suspension, and a refusal that stops a run.
