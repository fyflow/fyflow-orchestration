# fyflow-orchestration

Flow orchestration over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler). Define a
flow once; run thousands of workloads through it.

> **Status: the layer is built and gated.** Sequence, decision routing, fan-out and join, with
> **three** join policies, a definition validator, and run state as a pure fold. **A `map` is a fifth node kind: one branch declared, N instances opened by the run at an arity no definition states.** **One driver serves one run, fixed at construction, and two drivers may share a scheduler — with anything else on it.** **A node may declare `needs` and reach an output the previous node did not produce — the run's own outputs, keyed by `(node id, branchPath)` — and an EDGE may declare one for its predicate.** **Both of the flows this made possible run on real workers**: *score each item against the run's config*, and *score, then fan out over the scores*. **And a reference may say *if it ran*** — a `?` suffix, `FD-V29` refusing the bare form where a run can reach you without the target having run ([ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)). **And a reference across SIBLING regions means what the document says it means** — an output is visible when the two branch paths agree on the regions their two region CHAINS share, where the prefix rule they replaced handed a reader the one output whose index happened to match its own ([ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)). **And a flow and the runtime it needs are two JSON DOCUMENTS and a call** — a registry document
> names workers, groups, node types and their pool instances, `createRuntime` in
> `fyflow-orchestration/scheduler` builds every one of them, and the only code left is the code that
> is genuinely yours: a predicate, a worker module, a custom group type, a custom node-type class
> ([P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md)). **1299 `test()` cases in five
> runtimes** — Node 24, Deno, chromium, firefox, webkit — **plus 1724 assertions across 58 runs against a real
> scheduler** in Node and Deno *(1627 / 53 until [W78](doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md), whose consumer-road block is P20's exit artifact; 1502 / 50 until W67; 1203 / 44 until W59; 681 and 942 / 42 until W58 re-took this line; the two numbers count different things, [Q98](doc/open-questions.md))* — where the scheduler also carries five tasks this library did not mint, and both
> runs still complete. Not published; no version has been released.
>
> **The manifests read `0.3.0` and the change is BREAKING** — [W77](doc/work-items/w77-what-start-returns.md),
> [ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md).
> `runtime.start` returns `{ driver, done }` where it returned a `Driver`: `done` is a promise that
> resolves with the run's terminal `RunState`, so *the run is over* is one line rather than a block
> you copy. A `0.2.0` caller writing `const driver = runtime.start(…)` gets a typecheck failure
> naming the property it reached for.
>
> **`0.2.0` was BREAKING too** — [W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md),
> [Q279](doc/open-questions.md). A task node's `workerType` is RETIRED: every task node names a
> `type` the registry declares, and its worker receives the envelope `{ settings, input }` rather
> than the payload whole ([ADR 0054](doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)).
> Every flow document written against `0.1.0` is refused at construction, by name, with the key it
> carries — and nothing but this sentence and the version signals it, which is why the version moved.
>
> *(`npm run gate` runs the browser rung in **chromium only**; firefox and webkit are
> `npm run test:browser:all`.)*

## Getting started

**Two JSON documents, and one file of your own.** A **registry** says what exists — a worker module,
and a node type that runs on it. A **flow** says what happens — nodes naming those types, and the
edges between them. `createRuntime` builds everything the registry names, and each run hands back
`{ driver, done }` — the driver, and a promise for the run's end. The one thing you write as code is the worker —
[examples/getting-started/worker.ts](examples/getting-started/worker.ts), a class with a `run`
method, and nothing else.

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

**This snippet is executed by the gate.** It is [AGENTS.md](AGENTS.md) section 2, extracted and run
on every `npm run gate`, and the copy here is held byte-equal to that one by `check-docs`'s `X8` —
so it cannot rot the way a README example does
([W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)). **What it leaves out
is the next example**: [examples/flows/triage.flow.json](examples/flows/triage.flow.json) with
[examples/run-flow.ts](examples/run-flow.ts) — a custom resource group, a node-type class with its
own derivation, a node on a named pool instance, a decision edge, a fan-out and its join, and a
declared transform — running on real workers in both L6 runtimes.

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

**Executed too**: this is [AGENTS.md](AGENTS.md) section 5's last snippet, and `X8` holds every
snippet in this file byte-equal to an executed one. **Custom resource groups** — a factory the
document names by type — are section 12's second snippet, and the whole of it, with a node-type
CLASS and a named pool instance, is [examples/flows/triage.flow.json](examples/flows/triage.flow.json).

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

// STEP 6 — and only now the runtime. Pools are built ONCE, so a flow whose transform was decided
// during the session has to reach `createRuntime` as `flows`, or `start` throws `LanguageNotBuilt`
// naming the type. Check, then build.
const wired: FlowDefinition = { ...flow, nodes: flow.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: good } : n)) };
const runtime = createRuntime(SESSION_REGISTRY, { languages: { jsonata } }, { base: SESSION_BASE, flows: [wired] });
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

**Executed too**: this is [AGENTS.md](AGENTS.md) section 15, and `X8` holds it byte-equal to the
snippet the gate RAN. A verdict of `transform-passes` is a statement about the ONE value it names and
never about every value — *the sample passed*, with its source and its arity on it — which is why the
reference says so rather than calling it `fits`.

## Checking a result after it ran

**A schema is for the author, and a RUN can read it too.** The section above catches what two
declarations say about each other; this catches what a worker actually returned — per settlement,
against its own `outputSchema`, opt-in and off by default. **Supply `onNonconformingResult` and the
check is on; there is no boolean beside it.** A finding is a READING and never a refusal: no record
is written differently, no terminal state is authored, no dispatch moves, and the value reaches the
next node unaltered, so you can switch the reading on without changing what the flow does. What it
catches is two things, unreachable for DIFFERENT reasons: a bound the producer's code does not keep
past its declared example — which a check that runs a worker on ONE example cannot see, and which a
bounds-generating tool could — and a key `structuredClone` did not carry, which **no** authoring-time
tool can see at all, because none of them holds a record. The worker is
[examples/getting-started/drift.ts](examples/getting-started/drift.ts), and both of its defects are
what an ordinary author writes.

```ts
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
const runtime = createRuntime(registry, {}, { base: import.meta.url, flows: [flow] });
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
const quiet = createRuntime(registry, {}, { base: import.meta.url, flows: [flow] });
const same = await quiet.start(flow, { text: 'one two three four five six seven eight nine ten eleven' }).done;
await quiet.shutdown();
const shape = (s: typeof state) => JSON.stringify(Object.values(s.nodes).map((n) => [n.nodeId, n.result]));
if (same.outcome !== state.outcome || shape(same) !== shape(state)) {
  throw new Error('a finding is a reading: the same run with the check off must reach the same nodes with the same results');
}
```

**Executed too**: this is [AGENTS.md](AGENTS.md) section 16, and `X8` holds it byte-equal to the
snippet the gate RAN. What it costs is a RATIO rather than a millisecond — about a third of the
`structuredClone` the driver already pays on the same settlement, falling as the value grows and
rising as the schema does — and `spec/outcome-record.md` section 4 carries the measurement with its
method.

## The idea

A task enters a flow and passes through workers. **Decision blocks** route it onward based on what a
worker returned. Routing can **fan out** into parallel branches and later **collect** them at a
join.

```
                       +--> [enrich] --+
  [ingest] --> <score?> |               +--> (join) --> [publish]
                       +--> [classify]-+
                        \
                         +--> [review]        (low confidence routes away entirely)
```

The scheduler runs tasks. This repository decides **which task runs next, and why**.

## The thing to know before reading the code

**`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no topological order —
its own reference lists them under *"Things that do NOT exist"*. Tasks are independent and run as
soon as a worker slot and their resource limits allow.

So every ordering primitive above — sequence, decision, fan-out, join — **is built here**, not
wrapped from below. The scheduler contributes execution, pooling, resource limits and retry. It
contributes no control flow at all.

This matters because the planning document that seeded this repo
(`../fyflow-scheduler/FLOW_PLANNING.md`) assumes the opposite throughout. See
[doc/concept.md](doc/concept.md) section 2 for the evidence.

## The one structural idea

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

The same invariant the sibling
[fyflow-react-components](https://github.com/fyflow/fyflow-react-components) is built on, adopted
deliberately. It is what makes a flow testable with no scheduler, no workers and no timers — feed a
fixture log of task outcomes, assert where the run went — and what keeps durable runs an additive
change rather than a rewrite.

It became executable in
[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md): the driver
produces one ordered input sequence, and `fold(driver.foldInputs())` is the whole of turning a run
into run state.

## What is here

| | |
|---|---|
| **Flow definition** | nodes naming node TYPES, decision edges, fan-out and join — one template, many runs. **34 validation refusals** over the id range `FD-V1` … `FD-V38`, every one with a failing example — `FD-V5`, `FD-V14`, `FD-V15` and `FD-V34` are deliberately absent, their ids held. *(This cell read **23** over `FD-V1` … `FD-V25` with two absent, and *worker types*, from W32 until [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — nine plans, in the front-door document, while `check-spec`'s `C4` printed all four numbers on every gate run; `workerType` itself retired at W65.)* **Nested fan-out is expressible since `FD-V15` was retired**, and a task inside a nested region is dispatched at its whole dotted `branchPath`. **`map` is a FIFTH node kind since v0.8** — it declares ONE branch and a RUN opens N instances of it, and since [W33](doc/work-items/w33-a-map-at-run-time-arity.md) a `Driver` executes one. *(This read **22** and `FD-V1 … FD-V24`, which W32 corrected in `AGENTS.md` and `spec/README.md` and did not correct here — the divergence P3's retro names, in the front-door document. Both numbers are derived: `check-spec` reports the count and the rules table the range.)* |
| **Driver** | the only component that touches the scheduler: subscribes, routes, dispatches. **The library DEPENDS on the scheduler** and says so where your installer reads it — a `peerDependencies` entry at an exact pin, reached by one bare specifier and by no other form ([ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md), [W57](doc/work-items/w57-the-scheduler-is-a-dependency.md)). You may still pass your own scheduler in — `SchedulerLike` is two methods and the `Driver` takes it — but `createRuntime` builds one for you, which is what the snippet at the top of this page does. *(This cell said the library imports the scheduler **nowhere**, which was true until W57 and false for four plans afterwards — while the getting-started snippet two screens above, added by W69, imports `fyflow-orchestration/scheduler` and lets the library construct a `FyflowScheduler`. The contradiction became visible on one page and is what found it.)* |
| **Run state** | a fold: where a run is, what each node returned, what a join is waiting on. **Six outcomes**, including `stuck` |
| **Join policies** | `live-token`, `arrival-count` and `live-token-requiring-arrival`, behind one interface, all three shipped. **Pass `live-token`** |
| **Examples** | [ladder L6](examples/) — **fifty-three** real runs on a real scheduler, in Node and Deno *(this cell read **twenty-one** from P6 until W63 while the count went to fifty, and **fifty** until W69's conformity reader read it beside the *Running it* row two screens below, which W69 had just moved to fifty-three — a number in prose no check reads, wrong in one cell and right in the other on the same page)*: a typed join successor reducing the region's record through a declared `$sum([*.score])` at arities two, one and zero; a run in which **every branch is abandoned** under all three policies; two runs sharing one scheduler; and the same pair on a scheduler that also carries **tasks this library did not mint**, which used to stop every driver subscribed to it |

## The hard question, and its answer

**Q4 — what satisfies a join?** *"Wait for all the fan-out to return"* breaks the moment a decision
inside a branch routes it away from the join: the branch legitimately never arrives, an arrival
counter never completes, and the run hangs with no error — while the scheduler reports itself idle.

Live-token accounting answers that, and **the argument was refused as sufficient.**
[P1](doc/plans/p1-what-satisfies-a-join.md) built both policies behind one interface and let the case
decide, as a test.

**[ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md): a join
is satisfied when its region has no live branches, having had at least one.** The result was larger
than the question — arrival-counting fails on **six of nine** matrix rows, not on the one exotic
case, and **an ordinary `optional` task failing is enough**. Fixed-`N` is wrong whenever *"how many
will arrive"* differs from *"how many opened"*, and every non-success outcome makes it differ.

**The follow-up question, and its answer.** That decision recorded one cost: on a flow where *every*
branch is routed away, `live-token` fires a join **no branch reached** and carries an **empty
collection** into whatever comes after it — `{}` since
[ADR 0037](doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md);
it carried `null` when ADR 0025 was written, and the cost that sentence records is unchanged either
way. Two one-line refinements of the two policies had been written into `spec/`
before either existed, precisely so nobody could quietly apply one and call it a repair.
**[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
answers both, differently.** The refinement that declines a join with zero arrivals is **built, as a
third policy under its own name** — `live-token-requiring-arrival`, which reports the join as
unfireable and folds the run to `stuck` instead of `completed`. The refinement that would make
arrival-counting survive P1's case is **refused**: measured over the whole matrix, it is `live-token`
weakened, and every row on which they differ is a row where it waits forever.
**`live-token` and `arrival-count` are unchanged**, so this adds a name and breaks nothing.

**A driver's scheduler may carry work this library did not mint.**
[ADR 0027](doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md): a
settlement whose task id does not parse was minted by **no** driver, so it is reported through
`onUnmintedTask` and dropped rather than stopping the run. Until it, one plain non-flow task settling
— a nightly cleanup, another library's work, a worker's own `spawnTask` child — stopped **every**
driver subscribed to that scheduler, on the very topology the line above recommends. The one
remaining condition is that drivers sharing a scheduler have **different run ids**, which nothing can
enforce and which the library's own error message now says.

## Running it

Node **24** (`.node-version`, selected with fnm) and a current Deno.

```bash
npm install
npm run gate
```

**`npm install` is all the setup there is.** [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler)
is pinned to **0.5.2** and installed from **npm**; Deno reaches the same version on JSR as
`@fyflow/scheduler`, which is why `examples/deno-import-map.json` exists. **And since
[ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
the published library DEPENDS on the scheduler** — a `peerDependencies` entry at exactly that
version, a `jsr:` import in `deno.json` at the same, and one `import { FyflowTask }` in
`src/driver/driver.ts` for the default `createTask`. `SchedulerLike` is still a two-method structural
interface and a consumer still passes its own scheduler in; what changed is that the manifest now
says which version the driver was written against, and `check:scheduler`'s `D8` holds it to the pin.
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
is how the GATE reaches it, unchanged. *(This paragraph read "depends on the scheduler not at all —
ADR 0013 rule 1" until W57 superseded that rule.)*

| | |
|---|---|
| `npm run gate` | everything below, **in ladder order** — `lint` and `typecheck`, then the eight checks cheapest-first *(seven until W72's `check:workers`)*, then L1-L5 and L6, and only then `selftests`. **393.1 s**, of which **365.0 is `selftests`** ([ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md); it was 516.1 s and it ran 488.9 s of self-test ahead of `lint`). *A sum of per-entry medians; end-to-end runs have read 401, 414 and 463 s* |
| `npm run selftests` | **the eight `:selftest` entries, CONCURRENTLY** *(seven until W72)*, derived from `package.json` rather than from any list — with the two that mutate state outside their own scratch space (`check-scheduler:selftest` deletes `node_modules/fyflow-scheduler`; `check-wiring:selftest` stages every check flat into `dev-dist/` and runs it) declaring themselves with a `SELFTEST-EXCLUSIVE:` marker in their own file and running alone. **`G4` in `check-wiring.mjs` asks it for its plan and compares it to the manifest both ways** — the entries, their COMMANDS, and the exclusive set — then runs it against a stub and requires every planned entry completed |
| `npm test` · `npm run test:deno` · `npm run test:browser:all` | **1174** `test()` cases, five runtimes *(1112 until [W73](doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md); 979 until [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — 1065 at W65, 1111 at W66, 1112 at W67, and this cell moved for none of them; 958 until W62; 858 until W61 — 953 at its author pass, 958 after its readers; 746 until W59 — 835 at its author pass, 858 after its adequacy reader's fourth shape; 705 until W58; 656 until W57 re-took it; the count had gone stale in this row over three plans)* — `npm run gate` runs three of them, and `test:browser:all` is what adds firefox and webkit |
| `npm run test:l6` · `npm run test:l6:deno` | a real scheduler, **58 runs, 1724 assertions** *(55 / 1639 until [W82](doc/work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md), P21`s exit artifact; 53 / 1627 until W78; 1611 / 53 until W73; 50 / 1502 until W69 — W67 moved both and this cell neither; 50 / 1501 until W65; 46 / 1281 until W63; 44 / 1203 until W59; 42 / 1138 until W58; 40 / 879 until W57 re-took it)* |
| `npm run check:markdown` | **every relative link and every anchor** across **128** documents, **5503** links, **272** anchored *(91 / 3822 / 197 until W69, then **125 / 5426 / 271** until W69's and W70's conformity readers BOTH re-took it: that triple matched neither item's Record nor either item's own gate log, so it had never been measured anywhere. Every number in this cell is one `npm run check:markdown` prints, and it had not been re-read since W25 — section 1 rule 5's WHEN clause, which asks for the tree the item SHIPS and not the tree it was working on)* — `check-spec`s `C5` lifted here and still reported as `C5` |
| `npm run check:spec:selftest` | **the first negative test `check-spec` has ever had** — `check-spec.mjs` shipped with W1 and its probes were run by hand once. **29 probes and 28 gradings** *(26 / 25 until W61 added `C7`'s two language clauses and `C4`'s headline clause; 22 / 23 until W59 added `C7`'s two node-type clauses; this row read 18, then 20; the file prints its own count on every gate run — P11's retro)*: one probe and one grading per `fail()` site for `C1`-`C4`, `C6`-`C8` (**19** of them, `C2` having gained **two** at W41 for the `RULE_PREFIXES` binding), two for the report block, two for the exit path, plus one probe that trips **two `C7` clauses at once** so the failure-COUNT discriminator is reachable at all. `C5` is not here — W25 lifted it to `check-markdown` and it is probed and graded from there |
| `npm run check:source:selftest` | **the gate's own wiring, negative-tested** — **41** probes, **27** gradings of those probes, **10** of the probe list itself *(35 / 24 / 10 until W57, which narrowed `S7` and `S8`, retired `S9`, and added a `clean` CONTROL probe)*. W30 added ten: `S4` and `S7`, the two clauses no second mechanism guards, each reachable only through a copied published tree (`CHECK_SOURCE_SRC`) — and **one probe per entry of both pattern lists**, after its adequacy reader measured that three of five entries in each could leave for **0**. `S12` compares `gate`'s **15** entries to a declared list both ways and in order — and **seven of this file's probes went vacuous when ADR 0039 reordered that chain**, rule 7 (b) firing correctly, so all seven are now anchored AGNOSTICALLY (*the last entry whatever it is called*, *the first two whatever they are called*) rather than re-pinned to names; `S13` takes the three chains it composes. *(This row read **3** until W29 corrected it: W28 added four `SELF` entries and did not raise it. `doc/` is checked by nothing, and this is that class in the front-door document.)* |
| `npm run check:wiring:selftest` | **the gate's own wiring one layer in — the check that proves a `:selftest` entry actually runs a self-test**, [W38](doc/work-items/w38-the-dispatch-nothing-binds.md). **34 probes, 14 gradings, 6 `SELF` entries.** `G1` RUNS each of the seven `:selftest` scripts with the flag and an override pointing its self-test at a stub, and requires the stub's sentinel — a text test would be satisfied by the word `--self-test` in a comment. `G2` reads the DEFAULT that dispatch loads when nothing sets the override, **which is every run the gate makes and the one configuration `G1` cannot observe**. `G3` derives the manifest's two entries per check from the `scripts/` listing, both ways, because both of this check's own gate entries were otherwise repointable and deletable for **0**. **`G4` is [ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)'s**: with the seven `:selftest` entries out of the `&&` chain, `S11`, `S12` and `G3` all stop seeing them, so `G4` asks `scripts/run-selftests.mjs` for its plan and compares it to the manifest both ways — names, COMMANDS and the exclusive set — and then runs it against a stub and requires every planned entry completed. **`G5` is the half `G4` structurally cannot reach**: all three of `G4`'s runs set an override, so the branch `npm run gate` takes is the one branch no `G4` clause observes — W39's adequacy reader made the runner report `7/7 completed, 7 ok` in **0.1 s** with four checks green, four different ways. `G5` reads the nine declarations that decide the runner's DEFAULT behaviour and compares each to the one form it may take, which is `G2`'s answer to `G2`'s question. Its self-test is **96.7 s**, of which `G4` bought **31**, which is [Q176](doc/open-questions.md)'s subject in one row |
| `npm run check:scheduler:selftest` | **41 probes and 36 gradings since W57 (`D8`, the published manifests at the pin)**; when this row was written: **20 `PROBES` entries and 22 gradings — one per `fail()` site (18), one per way the report can lie (3), and one for the exit path**. *(The file prints **32**, which is `PROBES` plus the `.d.ts` and install probe sets; 20 is a correct number for a narrower set than this sentence claimed — P11's retro.)* Of the 22: **20** are noticed by the probe the entry names, **1** only by the failure COUNT, which the id set cannot see, and **1** is a declared **masking** — a sibling clause reporting the same id *in its place*, so that one clause is deletable for 0 and the entry says so ([Q146](doc/open-questions.md)) |
| `npm run check:policies:selftest` | **13 probes, 6 gradings, and 14 bounds on those two lists** — the `SELF` list this file went three items without. Every entry is one edit to a list that sits ABOVE it, so nothing self-matches, and each makes the run go red **with the guard in place** rather than removing the guard. **Eight of the fourteen entries bound a mutation that cost 0 before W31** — `MIN_META` lowered, a duplicate entry, a global anchor, an ambiguous anchor, a grading passing as `corpus`, a second `wide` exemption, the `ran:` guard, the probe-pass verdict — and its readers added three more. **It is 2.2 s to 14.7 s for that**, which is the honest number and is recorded rather than a ratio ([Q133](doc/open-questions.md)) |
| `npm run check:workers` · `npm run check:workers:selftest` | **the worker CONFORMANCE check — every worker in `examples/registry.json` is RUN on its declared input example and what it returned is validated against its output schema** ([P19](doc/plans/p19-what-a-schema-buys-an-author.md) decision 3, [ADR 0056](doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md), [W72](doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)): sixteen workers in **0.2 s**, fourteen confirmed on a run, two NOT CHECKED by name because no JSON Schema describes what they return. Its self-test is **24 probes, 9 gradings** *(16 before its two readers; five of the twenty-four run scratch worker modules the corpus cannot supply)*, the first probe being P19 fact 6 verbatim — `echo.arrays` typed as a list with an example that conforms to the wrong schema, which only running the worker catches — and two of the nine gradings declared `corpus` because the defect they reintroduce (an un-copied example, no retry) is one the corpus itself exhibits |
| `npm run check:docs:selftest` | **19 probes, 10 gradings** *(18 until W59's sub-path probe)* — one per check id, two for the report block, one for the exit path, and two more per direction of `X6`s comparison ([W46](doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)). **Capped deliberately and the cap is stated**: `check-docs.mjs` has **17** clauses, an entry here is two `check-docs` runs at ~7.1 s against `check-scheduler`'s ~0.5 s, and the **nine** left ungraded are named in that file's own header — one of them reachable by no probe at all ([Q148](doc/open-questions.md)) |

## Documentation

**Using the library: [AGENTS.md](AGENTS.md)** — the reference. Twelve sections, from a minimal
working program to what does not exist. **Every snippet in it is extracted, typechecked and executed
by `npm run gate`**, so a stale snippet is a failing gate rather than a lie. That covers **about 16%
of the document**; what the other 84% is allowed to be, and why, is
[P3's Record](doc/plans/p3-a-consumer-reference-the-gate-keeps-true.md).

**Working on the library: [doc/README.md](doc/README.md)** — current state, reading order, and what
happens next.

- [doc/concept.md](doc/concept.md) — what we are building and why
- [spec/](spec/README.md) — **the normative layer**: **six normative documents, 92 numbered rules, 44 hand-written examples**. *(89 until [W53](doc/work-items/w53-what-a-run-retains-that-nothing-reads.md) added `RN-R13`, what a run RETAINS, and [W54](doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) added `OR-R11`, a result is a VALUE not an OBJECT, and `OR-R12`.)* *(`check-spec` prints **7 documents** and `doc/README.md` says 7: it counts `spec/README.md`, which is the index and normative in its own eight rules. Two counts counting different things — [Q98](doc/open-questions.md)'s shape — and both are stated rather than reconciled.)* Since **v0.8** the definition has a **fifth node kind, `map`** — [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) answering [Q12](doc/open-questions.md): fan-out is **two features over one region**, and since W33 a `Driver` RUNS one. **Since v0.11 a node may declare `needs`** — [ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) answering [Q11](doc/open-questions.md) in general — and `spec/flow-definition.md` gains a THIRD id prefix, `FD-C`, for a rule about what a run **carries**. **v0.12 answers [Q8](doc/open-questions.md)** — [ADR 0041](doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md), and an **edge** may declare a `needs` for its own predicate. **v0.13 answers [Q187](doc/open-questions.md)** — [ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md): a reference says whether it is **conditional**, and the bare form is a CLAIM that the target ran, refused by the new `FD-V29`. **It is not dominance, and that is a measurement** — of the 127 references the two corpora ADMIT, dominance refuses 30 and `FD-V29` refuses 8. *(`npm run check:spec` reports **7 documents** because it counts `spec/README.md` itself; the six are the normative ones. Re-derived from the check's own output at P10's declaration, where this line read 72 and 29.)*
- [doc/decisions/](doc/decisions/) — **twenty-two ADRs**, **five** carrying an in-place `## Correction` section — 0003, 0013, 0014, 0015 and 0023. *(Re-derived from the directory at P14's retro by counting the files, which is one expression. **It read twenty-two, and it read that at P13's retro too — where the directory held TWENTY**, so the number that claimed to have been re-derived was wrong by two at the moment it was written, and by one today. **`doc/README.md`'s own status row said 21 at the same moment, over a directory holding 19** — two indexes disagreeing about a number both claimed to have derived from the same directory, and neither agreeing with it. Before that it read **eighteen**, re-derived at P11's retro from *fifteen*, and ten at P10's declaration. **The first number has now been stale at FOUR consecutive re-derivations and the second at none**, which is what a count nobody derives in one expression looks like beside one nobody edits. v0.14's third direction on section 1 rule 5 is the clause it lands under.)*
- [doc/plans/](doc/plans/) — **P1-P21 are ALL complete and retro'd, `doc/workflow.md` is [v0.22](doc/workflow.md), [P22](doc/plans/p22-what-a-regions-identity-is.md) is DECLARED and its FIRST item [W84](doc/work-items/w84-what-a-regions-identity-is.md) is DONE** — **[ADR 0062](doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md): a region INSTANCE is `(opener node id, the opener's OWN branchPath)`**, `RunState.regions` is two-level with no composite string anywhere, `RegionEvent` gains `regionPath` on all six variants, `regionId` keeps its meaning AND its value, and W33's construction refusal is **LIFTED WHOLE** — so `map`-in-`map` and `fanout`-in-`map` both run and [Q160](doc/open-questions.md) and [Q156](doc/open-questions.md) are RESOLVED together. **This is BREAKING for a reader of `RunState.regions`, and the manifest does NOT move here**: P22 stop-and-ask (b) puts `0.4.0` at W86's close, so W84 and W85 ship the breaking shape with `package.json` unmoved. L1-L5 is **46 files / 1302 assertions** in three runtimes and **L6 is UNMOVED at 1724 / 58**, which is the assertion that `regionId` kept its value. **P22 prediction 1 REVERSES**: 8 of the 34 L1-L5 failures are in four files no typechecker names, because `Record<string, T>` has an open index signature. **P1-P21 are ALL complete and retro'd, `doc/workflow.md` is [v0.22](doc/workflow.md), and [P22](doc/plans/p22-what-a-regions-identity-is.md) is DECLARED** — *what is a region's identity, and may a region open inside a `map` region?* A region's identity is its opener's NODE ID and a `map` makes one opener reachable N times, so a region inside a map is REFUSED at `Driver` construction today; P22 makes it `(opener node id, the opener's own branchPath)`, takes `RunState.regions` two-level, gives `RegionEvent` a `regionPath`, and LIFTS the refusal. **The scope is narrower than *nested regions***: `map`-in-`fanout` and `fanout`-in-`fanout` already run, and what moves is a region inside a MAP. Five facts re-taken from a concluded spike, including **depth 3** and **the three branch-exit paths**, neither of which the spike measured; three items, **W84 DECLARED and no item started**; the package moves to `0.4.0` at the last of them. **[P21](doc/plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md)'s retro adopts ONE change and refuses FIVE**, and its central finding is that v0.21's CONTROLS clause was followed by all three of its items and defeated all three: identity answers *are these two sides one value* and not *can these two sides ever differ*, so the clause keeps its requirement and loses its prescription — **a control is one only if you can name the tree on which it fails and its claim passes** ([Q332](doc/open-questions.md) RESOLVED). All 156 probes re-run at the retro: **116 caught, 36 declared ceilings, zero undeclared survivors, zero crashes, zero aborts**. **[W82](doc/work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md) is P21's EXIT ARTIFACT**: two workers return values their own `outputSchema` refuses and the run reports each BY NAME while carrying them downstream unaltered — one whose code does not keep its declared bound, and one with **no bug at all**, whose non-enumerable own property conforms as `run()` returned it and does not survive `OR-R2`'s clone. **Both are GREEN at `check:workers` and every arc is `fits` at `checkWiring`, with each defect present AND removed**, which is the reach measured from both sides; L6 is **1724 assertions over 58 real runs** in both runtimes. **[W81](doc/work-items/w81-what-a-settlement-costs.md) is the PRICE and it RESOLVES [Q320](doc/open-questions.md)**: the completion handle `runtime.start` installs on every run costs **exactly one more `structuredClone` per settled task**, and a consumer CAN decline it by building the `Driver` from `runtime.registry` — at the price of having no `done`. `examples/settlement-cost.ts` is that measurement, in both runtimes and deliberately not in the gate; L1-L5 is **46 files / 1295 cases** and L6 is UNMOVED. **[W80](doc/work-items/w80-what-a-run-time-result-check-is.md) is the CHECK** — **[W80](doc/work-items/w80-what-a-run-time-result-check-is.md) and [ADR 0060](doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md): a run-time result check is a READING and never a refusal, and the callback that receives it IS the switch.** `spec/outcome-record.md` v0.10 gains **`OR-R13`** — opt-in, off by default, and a finding is reported with **no record written, no terminal state authored and no dispatch moved**, so the value that failed its schema still reaches the next node: *what it buys is knowledge rather than protection, and the plan says so.* It reads what the RECORD carries, after `OR-R2`'s clone, which `OR-R11` says is a different value from the one the worker returned — so it and `check:workers` can disagree about the same schema, and that half is unreachable by any authoring-time tool because none of them holds a record. **P21 prediction 1 REVERSES**: the clone is linear in the VALUE and the check in the SCHEMA, so one `enum` of a hundred on a 4 KiB result is 1.65x of a cost already paid. L1-L2 **45 files / 1290 cases in three runtimes** at that item and **46 / 1295** since W81, **L6 UNMOVED at 1639 / 55**. P21 asks — *what does a run-time schema check buy, and what does it cost against what a settlement already pays?*, which is P19's slice 1 with **the reason two plans deferred it measured FALSE**: the check costs 92.9% / 14.7% / 5.9% of the clone the driver already pays, and the share falls as the workload grows — P20's retro adopts ONE change (a CONTROL must fail where its claim is VACUOUS, not only where its subject is ABSENT) and refuses five, and its 92 declared probes re-run at the retro give **zero catches**. **The next plan starts at W80, Q330 and ADR 0060.** **[W78](doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md) is its EXIT ARTIFACT and L6 MOVES: 1639 assertions over 55 real runs in both runtimes**, one block in which the consumer holds only what `start` returned — a fan-out watched through `StartOptions.onRegionEvent`, the end awaited in one line, and beside it a run whose driver REFUSES where `done` RESOLVES `stopped` rather than rejecting. **The reference's thirteen hand-rolled termination blocks are ONE**, 135 lines become 16, and the survivor builds a `Driver` by hand so there is no runtime to keep a fold. Reverting W76 costs 2 at L6, W77 costs 8 and both cost 10 — each was ZERO before it. **P20 asks *what does the runtime owe a consumer that the driver does not?*** — [Q293](doc/open-questions.md) and [Q297](doc/open-questions.md) together: a consumer on the recommended road could not subscribe to region events at all, and learns a run has ended by copying a block. **The first half is CLOSED by [W76](doc/work-items/w76-what-start-accepts.md)** — `onRegionEvent` is forwarded, the two hand-written lists that let it go missing are bound both ways, and the partition's orphan count is zero. **They are one question because of a measurement rather than a framing**: of `DriverOptions`' eighteen members a `createRuntime` consumer reaches every one by four roads except **ONE**, so the first is the unique residue of a total partition — a pass-through the seam dropped — while the second is a composition only the seam can do, because [ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) forbids the driver subscribing to itself. Six facts measured first, and the sharpest kills the register's own objection to the second: a `.then` attached fifty macrotask turns after the run ended still receives `completed`. **[P19](doc/plans/p19-what-a-schema-buys-an-author.md) closed 2026-09-19 with ONE workflow change and five refusals, and its central finding is that its OWN exit artifact — an authoring session `npm run gate` executes — can have every one of its eight claims made a TAUTOLOGY at `check:docs` exit 0**, so rule 8 obligation (b) now asks for that direction rather than for deleting the row ([Q310](doc/open-questions.md)); all 24 declared ceilings were re-run with ZERO catches, and the census is confirmed at 241 / 185 / 2 / 54 for the nineteenth plan running (**252 / 195 / 2 / 55** since W78). **The next plan starts at W76, Q315 and ADR 0058.** *The items:* **[W72](doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)** (2026-09-18: `examples` as the schema subset's annotation keyword, [ADR 0056](doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md), and `npm run check:workers` running every corpus worker on its declared example) **and [W73](doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md)** (the same day: `checkWiring` giving every arc of a flow a verdict from the schemas its workers declare, `FD-R4` holding the entry payload and a person's resolution to those schemas ONCE each as rejected commands, and a wiring fixture corpus — no ADR) — P18 answered *can a flow and the runtime it needs be defined as two DOCUMENTS and a registry of names?* **YES**, in three items, and its retro made `doc/workflow.md` v0.19 (one change adopted, six refused; it is [v0.20](doc/workflow.md) since P19's). **The next plan WAS to start at W72, Q300 and ADR 0056 as *P19, strict mode* — **and it has: [P19](doc/plans/p19-what-a-schema-buys-an-author.md) is DECLARED under a different name, below.** *(This read **W71, Q297** until 2026-09-17, when [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) took the id and spent Q297 — the THIRD consecutive day this sentence has been falsified by the item that expired it, after W69 and W70 did the same. Three items outside any plan, three corrections, and the item that made this one wrote the claim that it had corrected it BEFORE doing so: its conformity reader found all five copies standing, one of them in a file the item had edited in the same commit.)*** *(This read **W69, Q293** until 2026-09-17, when [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — an item belonging to no plan — took both ids: a claim with an expiry date, falsified by the item that expired it and corrected by that item, found by grepping the tree for its own id.)* *(And **W70, Q294** until 2026-09-17 too, when [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) took W70 and reserved Q294-Q296 without using them — the same sentence falsified on two consecutive days by two items outside any plan, corrected both times by the grep section 1 rule 5 prescribes.)* **And [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) and [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) are DONE** — the getting-started example above and the routing flow below it, both executed by the gate and both held byte-equal here by `X8`, which their four readers rebuilt from a MEMBERSHIP into a PAIRING: each README section is now held to the executed snippet it NAMES, every fence in it is compared rather than the first, and each of the clause's halves has a probe that trips it alone. **And [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) is DONE** *(this read IN REVIEW after that item's own file said DONE — section 1 rule 5's provenance clause, corrected at P19's retro)*: the reference stops teaching a FAKE scheduler for a use case — **fake-scheduler snippets 7 -> 2, real ones 7 -> 12** — and the conversion found that `MissingJoinPolicy` cannot be raised through `createRuntime` and that `onRegionEvent` was never forwarded to a runtime's driver, so a snippet could demonstrate it only by building the driver itself ([Q297](doc/open-questions.md), **resolved by [W76](doc/work-items/w76-what-start-accepts.md)**). *The items:* **[W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) done 2026-09-15: ADR 0053 (the built-in JSON Schema subset) and ADR 0054 (`type` req [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) done 2026-09-15: ADR 0053 (the built-in JSON Schema subset) and ADR 0054 (`type` required on every task node, `workerType` retired, `spec/flow-definition.md` v0.19), the registry a DOCUMENT, the corpus and `examples/` migrated; [W66](doc/work-items/w66-the-runtime-entry.md) done 2026-09-16: `createRuntime` builds a runtime from that document and `start` returns a `Driver` (ADR 0055, `RT-R13`); W67 done 2026-09-16 (P18`s exit artifact: a flow and the runtime it needs from two JSON documents)** — *can a flow and its runtime be defined as two documents and a registry of names, with the library doing every instantiation?* — three items [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)-[W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md) reserving W65-W68, Q278-Q292 and ADR 0053-0055, `doc/workflow.md` at [v0.18](doc/workflow.md); the most recent complete plan is **[P17](doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)** — [W61](doc/work-items/w61-what-a-transform-is.md) (ADR 0051: a transform is a declared expression in a registered language, applied in the type's worker wrapper; `spec/flow-definition.md` v0.18, `FD-V35`-`FD-V37`, `FD-C6`), [W62](doc/work-items/w62-the-jsonata-adapter.md) (ADR 0052: `jsonata` 2.2.2 as `fyflow-orchestration/jsonata`, declared in `dependencies` at the exact pin, `RT-R12`; five names unbound including `$shuffle`, which reversed P17 prediction 4) and [W63](doc/work-items/w63-a-transformed-join-on-real-workers.md) (the exit artifact: a typed join successor reducing the region's record through `$sum([*.score])` with no reshaping node, receiving 990 / 400 / 0 at arities two, one and zero on real workers in both L6 runtimes) — *what may a node DO to its input before its worker sees it?*; retro'd 2026-09-15 with two workflow changes. **The next plan starts at W65, Q278 and ADR 0053.** *(This line read P1-P9 with P10 running, and before that P1-P4 while five more plans closed behind it — `doc/` is checked by nothing, and this is the front-door document.)* **[P19](doc/plans/p19-what-a-schema-buys-an-author.md) is DECLARED — *what does a schema buy an author?* — and it DEPARTS from the name P16 gave it.** P16 called it *strict mode*: input and output schemas enforced at run time, a mismatch as a runtime refusal, a driver option priced first. **The maintainer's argument of 2026-09-18 is the reason for the departure and is recorded in the plan**: the schemas were for the AUTHOR — a person or an agent wiring a flow — so a tool can say whether an edge fits, help write the JSONata transform where it does not, and hand a worker's author a typed signature; a runtime failure is a different problem, and per-settlement validation is the expensive way to learn it. Three items, serial: **W72** (the contract — `examples` joins the built-in subset as an ANNOTATION validated at construction, ADR 0056, on input AND output schemas; every corpus worker declares both with an example; a conformance check that RUNS a worker on its input example), **W73** (the wiring check — a verdict per edge, static over the subset, transformed edges verified by running the transform on the producer's example; the two runtime boundaries no static check can reach, the entry payload and a person's resolution, validated ONCE each), **W74** (the assists and the exit artifact — path enumeration, the sample-and-diff loop, a generated-signature recipe, and an AUTHORING SESSION a human can watch). **Reserves W72-W75, Q300-Q314, ADR 0056-0057.** **Six facts measured before declaring**, in `dev-dist/p19/`: twelve honest output schemas for the fourteen corpus workers stay INSIDE the twelve-keyword subset (two workers are undescribable by construction — one throws, one returns a function); the validator's existing value check takes a declared example unchanged; a compatibility relation over the subset is **45 lines and TOTAL**, fourteen corpus edges fitting and **twelve controls, eight negative, every verdict as expected**; `json-schema-to-typescript` compiles all twelve with zero surprises, installed outside the repository with zero links; a sample generator is 28 lines and self-conforming, with its limits stated; **and the author's own schema for one worker was WRONG on the first attempt — a field named `arrays` is a COUNT — while the example written beside it CONFORMED to the wrong schema.** Only running the worker found it. *A schema and its example agreeing proves the schema is self-consistent and says nothing about the worker* — prediction 4 confirmed at the declaration, in the sharper direction, and it is why W72's check executes rather than reads. **Per-settlement result validation is OUT as a default**, a type-level JSONata interpreter stays refused, no runtime dependency, and the subset is the contract language — the enabling constraint that keeps the wiring relation decidable rather than a limitation. Census **232 / 178 / 2 / 52**, none spent by the declaration. *Read every status from the plan's own file, never from this line.*
- [doc/open-questions.md](doc/open-questions.md) — the register
- [doc/workflow.md](doc/workflow.md) — how work is planned, split and verified
- [doc/scheduler-upstream.md](doc/scheduler-upstream.md) — what we want from the scheduler

**How the work is done is itself documented and is unusual**: every change is a declared work item
with its own gate, and every one is read afterwards by two reviewers who did not write it — one
against the spec, one by mutation. **Ninety-three such passes have run and not one has come back empty.** *(This line read **twenty-one**
while thirty more ran, **fifty-one** while twelve more did, and **sixty-nine** while its own arithmetic summed to
seventy-three — *four in P13 so far* having been written mid-plan and never re-taken when that plan's
fifth and sixth passes ran. The predicate is one pass per reader per work item, counted from each item's
own Record — `doc/workflow.md` section 1 rule 5 — and the figure here is **summed from the per-plan
totals**: 31 through W19 as `CLAUDE.md` enumerates them, plus eight in P7, four in P8, eight in P9, eight in P10, four in P11, six in P12, six in P13, six in P14, six in P15,
six in P16, six in P17 and six in P18, each read from that plan's own retro. **Stated that way rather than as a fresh count of the item
files**, because a `grep` over their Record tables does not agree with itself across the two Record
formats those files use, and a number that cannot be derived in one expression should say where it
came from.)*

## Licence

MIT, as declared in `package.json` and `deno.json`. **There is no `LICENSE` file yet.**
