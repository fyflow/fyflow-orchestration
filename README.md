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

The scheduler runs tasks. This library decides **which task runs next, and why** — because
`fyflow-scheduler` has no dependency graph of its own, so sequence, decision, fan-out and join are
built here rather than wrapped from below. See [doc/concept.md](doc/concept.md) for the reasoning.

**0.7.0 was the first release**, on npm as `fyflow-orchestration` and on JSR as `@fyflow/orchestration`.
The manifests read `0.8.0`.

## Install

```bash
npm install fyflow-orchestration fyflow-scheduler    # Node, and a browser bundler
deno add jsr:@fyflow/orchestration                  # Deno
```

npm carries an esbuild bundle per platform (`dist/node`, `dist/browser`) and the type declarations;
JSR carries the TypeScript source. Both carry this README, [AGENTS.md](AGENTS.md) — the complete
reference — and the `LICENSE` file.

The scheduler is a **peer dependency**, so your installer resolves it rather than this library
bundling it: `fyflow-scheduler` is pinned EXACTLY — at the version this package's `peerDependencies` names, which
`npm ls fyflow-scheduler` shows once installed — and installed from npm, and under Deno it comes from JSR at the same
version. **Node 24 or a current Deno.** The library's own suites also run in the
browser, but a flow does not: a worker there has to be a bundled `.js` asset, because nothing in a
browser executes TypeScript.

## Getting started

**Two JSON documents, and one file of your own.** A **registry** says what exists — a worker module,
and a node type that runs on it. A **flow** says what happens — nodes naming those types, and the
edges between them. `createRuntime` builds everything the registry names, and each run hands back
`{ driver, done, header }` — the driver, a promise for the run's end, and the run's checkpoint header
(the example below needs only `done`, so that is all it names). The one thing you write as code is the
worker — [examples/getting-started/worker.ts](examples/getting-started/worker.ts), a class with a
`run` method, and nothing else.

```ts
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
// and `halted` are terminal OUTCOMES, so a run that goes wrong arrives as `state.outcome` and not
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


## A flow that decides

**The same call, with the node kinds that make it a flow.** A **decision** is an edge with a `when`
naming a predicate — code you supply, under a name the registry declares. A **fan-out** opens
branches that run concurrently; a **join** waits for them and hands the next node every branch's
result keyed by branch path. Two runs on one runtime, at high and low confidence, take different
roads — and which nodes ran is read off each run's state, not asserted from a diagram. The worker is
[examples/getting-started/tag.ts](examples/getting-started/tag.ts), five lines that tag what they see.

```ts
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

## Checking a flow before it runs

**A schema is for the AUTHOR, and this is what it buys.** Every worker declares what it expects and
what it returns; `checkWiring` gives every arc of a flow one of five verdicts from those declarations
BEFORE anything runs, `pathsOf` says what there is to reach for, and `tryTransform` runs a candidate
JSONata expression on the producer's own declared example and holds the result to the consumer's
schema. Below: a flow with a real miswire, the transform that repairs it found in two tries, a
TypeScript signature generated from the same schemas, and then the run. The two workers are
[examples/getting-started/reader.ts](examples/getting-started/reader.ts) and
[summarise.ts](examples/getting-started/summarise.ts), whose schemas oppose on purpose.

```ts
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

## More examples

The three above are the shape of it. [AGENTS.md](AGENTS.md) is the full reference — every section's
snippet is extracted and executed on every `npm run gate`, so none of it can drift from the code:

| | |
|---|---|
| A task **cancelled** by its id — the run ends `cancelled` and refuses a resume | [AGENTS.md](AGENTS.md) section 6 |
| **Checking** a flow against a running runtime before starting it — `runtime.check` | section 12 |
| **Trying** a transform on a value you give, the entry node included | section 15 |
| Holding a **result** to the schema its worker declares | section 16 |
| Fanning out **per item** — a region inside a `map` region | section 17 |
| **Saving** a run and **resuming** it from the stored events | section 18 |
| What a node may **remember** across branches — a `gate` | section 19 |
| Routing with **no code** — the built-in `if` and `switch` gates | section 19 |
| Wiring a gate **before it runs** | section 20 |

Runnable programs live in [examples/](examples/) — including
[examples/flows/triage.flow.json](examples/flows/triage.flow.json) with
[examples/run-flow.ts](examples/run-flow.ts), which puts a custom resource group, a node-type class,
a named pool instance, a decision, a fan-out, a join and a declared transform on real workers.

## Running the tests

```bash
npm install
npm test          # the unit and routing suites
npm run test:l6   # real runs on a real scheduler
npm run gate      # everything above, in order
```

`npm run gate` is the full ladder — lint, typecheck, the static checks, the suites in three runtimes,
and the real-scheduler runs in Node and Deno.

## Documentation

| | |
|---|---|
| [AGENTS.md](AGENTS.md) | the complete reference: every snippet in it is typechecked by the gate, each one tagged `run` is executed, and a snippet tagged `check` is typechecked only |
| [doc/concept.md](doc/concept.md) | what this is and why it is shaped this way |
| [spec/](spec/) | the normative rules — the flow grammar, run state, join policies, task ids |
| [doc/README.md](doc/README.md) | the development index: plans, work items, decisions, open questions |
| [CLAUDE.md](CLAUDE.md) | guidance for an agent working ON this library |

## Licence

MIT — the `LICENSE` file at the repository root, which both registries carry beside the code.
