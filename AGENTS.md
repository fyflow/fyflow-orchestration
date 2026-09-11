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
| `task` | runs a worker of `workerType`. Has `edges`, and optionally **`needs`** | it has no `edges`, or **no edge of it is eligible for `done`** (`FD-V7`) |
| `fanout` | `branches: string[]` — the node each branch starts at. Dispatches nothing itself | fewer than two branches, a repeated entry, any `edges` at all, or a branch entry that is not a `task` (`FD-V9`) |
| `map` | `over: '<key>'` and `branch: '<node id>'` — **one** branch, opened once per item at run time. Dispatches nothing itself; the RUN opens N instances of its one branch. Optionally **`needs`**, which is what `over` is then a key on | any `edges` at all, a `branch` that is not a `task`, or an `over` outside `^[A-Za-z0-9_-]{1,64}$` (`FD-V25`); a missing `over` or `branch` (`FD-V23`) |
| `join` | `of: '<fanout id>'`. Fires when its policy says so | it does not have **exactly one** edge, or that edge carries `when` or `on` (`FD-V7`) |
| `end` | terminal. `outcome` is **your label**, never interpreted | — |

**A `task` node must have an edge that can be taken when it succeeds.** A node whose only edge is
`{ when: 'p', to: 'x' }` is refused at construction — it is the mistake the format most invites, and
`FD-V7` is what catches it.

**`end.outcome` is a string you choose.** The library never reads it. What the *run* is called is a
separate, closed vocabulary — section 8.

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
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', workerType: 'ScoreWorker',
      needs: { item: '.', run: 'ingest' },          // its own item, and ingest's whole result
      edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

// *Score, then fan out over the scores* — a map whose `over` names a key composed from a
// whole region's output. No branch numbers appear anywhere, so inserting a branch cannot
// silently re-point it.
const overRegion: FlowDefinition = {
  flowId: 'fan-out-over-the-scores', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'rank' }] },
    { id: 'rank', kind: 'map', over: 'scores', branch: 'publish',
      needs: { scores: ['score'] } },             // every score, in item order
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'gather' }] },
    { id: 'gather', kind: 'join', of: 'rank', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

const registry = {
  predicates: [],
  workerTypes: ['IngestWorker', 'ScoreWorker', 'PublishWorker'],
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
    { id: 'decide', kind: 'task', workerType: 'ScoreWorker', edges: [
      { when: 'isLowConfidence', to: 'review' },
      { to: 'publish' },
    ] },
    { id: 'review', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker',
      needs: { own: '.', verdict: ref },
      edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
});
const guarded = { predicates: ['isLowConfidence'], workerTypes: registry.workerTypes };
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

There are **27 refusals** over the id range `FD-V1` … `FD-V29`, each with a failing example in
`spec/examples/invalid/`. Two ids in that range are **deliberately absent** and have no rule behind
them: `FD-V14`, which never existed, and **`FD-V15`, retired when nested fan-out became
expressible**. The ids are never renumbered, so it is safe to assert on them. The full
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
  workerTypes: ['IngestWorker', 'ScoreWorker', 'ReviewWorker', 'PublishWorker'],
};

const flow: FlowDefinition = {
  flowId: 'route-on-an-earlier-step', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
    { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
      // this edge's predicate can see `ingest`; the default edge below sees `{}`
      { when: 'flaggedEarlier', to: 'review', needs: { earlier: 'ingest' } },
      { to: 'publish' },
    ] },
    { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
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
import { Driver, liveToken, type FlowDefinition, type Predicate } from 'fyflow-orchestration';

const definition: FlowDefinition = {
  flowId: 'collect', version: 1, entry: 'split',
  nodes: [
    { id: 'split',   kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    { id: 'scoreA',  kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'scoreB',  kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done',    kind: 'end', outcome: 'completed' },
  ],
};

const dispatched: { id: string; payload: unknown }[] = [];
const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
const driver = new Driver(definition, {
  runId: 'r', scheduler: {
    addTask() {},
    addEventListener(t: string, fn: (e: { detail: unknown }) => void) {
      listeners.set(t, [...(listeners.get(t) ?? []), fn]);
    },
  },
  createTask: (c) => { dispatched.push({ id: c.id, payload: c.payload }); return c; },
  predicates: new Map<string, Predicate>(),
  workerTypes: ['ScoreWorker', 'PublishWorker'],
  joinPolicy: liveToken,
});
const settle = (id: string, result: unknown) => {
  for (const fn of listeners.get('task.completed') ?? []) fn({ detail: { id, state: 'done', result } });
};

driver.start({});
// `split` declares ["scoreA", "scoreB"], so their branch paths are "0" and "1".
settle('r:scoreB:1:0', { score: 0.4 });        // note the order: B settles FIRST
settle('r:scoreA:0:0', { score: 0.9 });

const publish = dispatched.find((t) => t.id === 'r:publish:-:0');
console.log(JSON.stringify(publish?.payload));  // {"0":{"score":0.9},"1":{"score":0.4}}
if (JSON.stringify(publish?.payload) !== '{"0":{"score":0.9},"1":{"score":0.4}}') {
  throw new Error(`the join carried ${JSON.stringify(publish?.payload)}`);
}
// B settled first and is still under key "1". The collection is keyed by BRANCH,
// not by arrival order, which is the whole point.
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

**Two of the twelve belong to `map`, and they fail for different people.**

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
  DuplicateTaskId, InvalidDefinition, InvalidRunId, InvalidTaskId, MissingJoinPolicy,
  MultipleRuns, NoMatchingEdge, UncloneableResult, UndispatchedTask, UnresolvedBranchPath,
  UnresolvedMapArity, UnresolvedReference,
} from 'fyflow-orchestration';

const documented = [
  DuplicateTaskId, UncloneableResult, NoMatchingEdge, UndispatchedTask,  // reported inside a listener
  MultipleRuns, InvalidRunId, InvalidDefinition, MissingJoinPolicy,      // thrown at you
  UnresolvedMapArity, UnresolvedReference,   // reported in a listener; reported AND thrown from start()/resolve()
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

**`OR-R11`, executed rather than asserted** — a worker returns a class with a method, and what
the driver logs is a plain object with the field and no method:

```ts run
import { Driver, type FlowDefinition } from 'fyflow-orchestration';

class Score {
  readonly value: number;
  constructor(value: number) { this.value = value; }
  isHigh(): boolean { return this.value > 0.5; }
}

const listeners: ((e: { detail: unknown }) => void)[] = [];
const scheduler = {
  addTask() {},
  addEventListener(_t: string, fn: (e: { detail: unknown }) => void) { listeners.push(fn); },
};
const flow: FlowDefinition = {
  flowId: 'or-r11', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', workerType: 'W', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
const failures: string[] = [];
const driver = new Driver(flow, {
  runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), workerTypes: ['W'],
  onRunFailure: (f) => failures.push(f.kind),
});
driver.start({});
for (const fn of listeners) {
  fn({ detail: { id: 'r1:a:-:0', state: 'done', attempts: 0, timestamp: 1, result: new Score(0.9) } });
}

const logged = driver.snapshot()[0]!.result as { value?: number; isHigh?: unknown };
console.log(logged.value, typeof logged.isHigh, logged instanceof Score, failures.length);
// 0.9 undefined false 0
if (logged.value !== 0.9) throw new Error('the FIELDS cross the boundary');
if (typeof logged.isHigh !== 'undefined') throw new Error('the BEHAVIOUR does not');
if (logged instanceof Score) throw new Error('the prototype is lost, so instanceof is false');
if (failures.length !== 0) throw new Error('and nothing is reported: OR-R11 is silent by design');
```

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
rules 3 and 5. *(This read **"pin at 0.3.0 … npm and JSR both stop at 0.2.1, so 0.3.0 is reached from
a working tree"** — a live instruction to a consumer, wrong in the version AND in the mechanism, the
second having been superseded on 2026-08-31. W36's conformity reader.)*

Thirteen worked flows, on a real scheduler, are in [`examples/`](examples/README.md) — including a
routed-away branch, a lost branch, a human resolving a suspension, and a refusal that stops a run.
