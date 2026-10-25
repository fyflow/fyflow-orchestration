# fyflow-orchestration

Flow orchestration over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler). **Define a
flow once as data; run thousands of workloads through it.**

A task enters a flow and passes through workers. **Decision** edges route it onward based on what a
worker returned, routing can **fan out** into parallel branches, and a **join** collects them again:

```
                       +--> [enrich] --+
  [ingest] --> <score?> |               +--> (join) --> [publish]
                       +--> [classify]-+
                        \
                         +--> [review]        (low confidence routes away entirely)
```

The scheduler runs tasks; this library decides **which task runs next**. `fyflow-scheduler` has no
dependency graph of its own, so sequence, decision, fan-out and join live here.

Published on npm as `fyflow-orchestration` and on JSR as `@fyflow/orchestration`. The manifests read `0.12.0`.

## Install

```bash
npm install fyflow-orchestration fyflow-scheduler    # Node, and a browser bundler
deno add jsr:@fyflow/orchestration                  # Deno
```

- **Runtimes:** Node 24 or a current Deno. A flow does not run in a browser: a worker there would have
  to be a bundled `.js` asset.
- **The scheduler is a peer dependency**, pinned to the exact version in this package's
  `peerDependencies`. Deno takes it from JSR at the same version.
- **What ships:** npm has bundles for Node and browser bundlers plus type declarations, and JSR has
  the TypeScript source. Both include [AGENTS.md](AGENTS.md), the complete reference.

## Getting started

**Two JSON documents, and one file of your own.** A **registry** says what exists: worker modules,
and the node types that run on them. A **flow** says what happens: nodes naming those types, and the
edges between them. `createRuntime` builds what the registry names, and `start` runs a flow on it.
The only code you write is the worker,
[examples/getting-started/worker.ts](examples/getting-started/worker.ts): a class with a `run` method.

```ts
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


## A flow that decides

A **decision** is an edge with a `when` naming a predicate: code you supply, under a name the
registry declares. A **fan-out** opens branches that run concurrently; a **join** waits for them and
hands the next node every branch's result, each under its own entry id. Below, two runs at high and low
confidence take different roads. The worker is
[examples/getting-started/tag.ts](examples/getting-started/tag.ts).

```ts
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
// `publish` every branch's result, each under its own entry id.
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
console.log(resultOf(high, 'publish'));    // { enrich: { confidence: 0.9, ingest: true, enrich: true }, classify: { …, classify: true }, publish: true }

// Verified by the docs gate:
if (high.outcome !== 'completed' || low.outcome !== 'completed') throw new Error(`outcomes ${high.outcome} / ${low.outcome}`);
if (ran(high).join() !== 'classify,enrich,ingest,publish') throw new Error(`high ran ${ran(high).join()}`);
if (ran(low).join() !== 'ingest,review') throw new Error(`low ran ${ran(low).join()}`);
const want = '{"enrich":{"confidence":0.9,"ingest":true,"enrich":true},"classify":{"confidence":0.9,"ingest":true,"classify":true},"publish":true}';
if (JSON.stringify(resultOf(high, 'publish')) !== want) throw new Error(`publish received ${JSON.stringify(resultOf(high, 'publish'))}`);
```

## Checking a flow before it runs

Every worker declares JSON schemas for what it expects and what it returns, so a flow can be checked
before anything runs:

- `checkWiring` gives every arc of a flow a verdict from those declarations.
- `pathsOf` lists what a producer's output offers.
- `tryTransform` runs a candidate JSONata expression on the producer's declared example and checks
  the result against the consumer's schema.
- `signatureOf` generates the TypeScript signature a worker is written against.

Below, a flow with a miswire is repaired in two tries, then run. The two workers are
[examples/getting-started/reader.ts](examples/getting-started/reader.ts) and
[summarise.ts](examples/getting-started/summarise.ts), whose schemas deliberately do not match.

```ts
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

## More examples

[AGENTS.md](AGENTS.md) is the full reference, and every snippet in it is tested:

| | |
|---|---|
| A task **cancelled** by its id — the run ends `cancelled` and refuses a resume | [AGENTS.md](AGENTS.md) section 6 |
| **Cancelling a run** — `driver.cancel`, the run `cancelling` until its last task has stopped | section 6 |
| **Pausing** a run and unpausing it — every dispatch held, then handed on in order | section 8 |
| Reading a run's state **while it runs** — `handle.outcome()` after every input, `handle.state()`, a frozen copy, when you draw it | section 8 |
| A node that **waits for a person** by design — an `ask`, which keeps what reached it and holds the answer to a schema | section 7 |
| A task's **messages and progress**, each with its run, node and attempt as fields — `onTaskMessage`, `onTaskProgress` | section 8 |
| A **worker's own messages**, outside any task — `worker.message` on its pool, reached through `createScheduler` | section 8 |
| Reaching what reached the **run** from any node or edge — `needs: { invoice: "$payload" }` | section 3 |
| Reaching the item that opened a **map instance** from any node in it — `needs: { invoice: "$item" }` | section 3 |
| **Stopping** a run to resume it on another runtime — `handle.stop` | section 18 |
| Writing a run's **header first**, before its first event — `onHeader` | section 18 |
| A resumed task **keeps its retry budget** — the attempts it already made, handed on as `attemptsSpent` | section 18 |
| **Checking** a flow against a running runtime before starting it — `runtime.check` | section 12 |
| **Trying** a transform on a value you give, the entry node included | section 15 |
| Holding a **result** to the schema its worker declares | section 16 |
| Fanning out **per item** — a region inside a `map` region | section 17 |
| **Saving** a run and **resuming** it from the stored events | section 18 |
| What a node may **remember** across branches — a `gate` | section 19 |
| Routing with **no code** — the built-in `if` and `switch` gates | section 19 |
| Wiring a gate **before it runs** | section 20 |

Runnable programs are in [examples/](examples/). For a larger one, see
[examples/run-flow.ts](examples/run-flow.ts) running
[examples/flows/triage.flow.json](examples/flows/triage.flow.json): a custom resource group, a
node-type class, a named pool, a decision, a fan-out, a join and a transform.

## Running the tests

```bash
npm install
npm test          # the unit and routing suites
npm run test:l6   # real runs on a real scheduler
npm run gate      # lint, typecheck, checks, all suites, Node and Deno runs
```

## Documentation

| | |
|---|---|
| [AGENTS.md](AGENTS.md) | the complete API reference, with tested snippets |
| [doc/concept.md](doc/concept.md) | what this is and why it is shaped this way |
| [spec/](spec/) | the normative rules: flow grammar, run state, join policies, task ids |
| [doc/README.md](doc/README.md) | for contributors: plans, work items, decisions, open questions |
| [CLAUDE.md](CLAUDE.md) | for an agent working on this library |

## Licence

MIT. See `LICENSE`.
