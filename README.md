# fyflow-orchestration

Flow orchestration over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler). Define a
flow once; run thousands of workloads through it.

> **Status: the layer is built and gated.** Sequence, decision routing, fan-out and join, with
> **three** join policies, a definition validator, and run state as a pure fold. **A `map` is a fifth node kind: one branch declared, N instances opened by the run at an arity no definition states.** **One driver serves one run, fixed at construction, and two drivers may share a scheduler — with anything else on it.** **A node may declare `needs` and reach an output the previous node did not produce — the run's own outputs, keyed by `(node id, branchPath)` — and an EDGE may declare one for its predicate.** **Both of the flows this made possible run on real workers**: *score each item against the run's config*, and *score, then fan out over the scores*. **And a reference may say *if it ran*** — a `?` suffix, `FD-V29` refusing the bare form where a run can reach you without the target having run ([ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)). **And a reference across SIBLING regions means what the document says it means** — an output is visible when the two branch paths agree on the regions their two region CHAINS share, where the prefix rule they replaced handed a reader the one output whose index happened to match its own ([ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)). **And a flow and the runtime it needs are two JSON DOCUMENTS and a call** — a registry document
> names workers, groups, node types and their pool instances, `createRuntime` in
> `fyflow-orchestration/scheduler` builds every one of them, and the only code left is the code that
> is genuinely yours: a predicate, a worker module, a custom group type, a custom node-type class
> ([P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md)). **1112 `test()` cases in five
> runtimes** — Node 24, Deno, chromium, firefox, webkit — **plus 1610 assertions across 53 runs against a real
> scheduler** in Node and Deno *(1502 / 50 until W67; 1203 / 44 until W59; 681 and 942 / 42 until W58 re-took this line; the two numbers count different things, [Q98](doc/open-questions.md))* — where the scheduler also carries five tasks this library did not mint, and both
> runs still complete. Not published; no version has been released.
>
> **The manifests read `0.2.0` and the change is BREAKING** — [W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md),
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
edges between them. `createRuntime` builds everything the registry names and hands back a `Driver`
per run. The one thing you write as code is the worker —
[examples/getting-started/worker.ts](examples/getting-started/worker.ts), a class with a `run`
method, and nothing else.

```ts
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

**Executed too**: this is [AGENTS.md](AGENTS.md) section 5's last snippet, and `X8` holds every
snippet in this file byte-equal to an executed one. **Custom resource groups** — a factory the
document names by type — are section 12's second snippet, and the whole of it, with a node-type
CLASS and a named pool instance, is [examples/flows/triage.flow.json](examples/flows/triage.flow.json).

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
| `npm run gate` | everything below, **in ladder order** — `lint` and `typecheck`, then the seven checks cheapest-first, then L1-L5 and L6, and only then `selftests`. **393.1 s**, of which **365.0 is `selftests`** ([ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md); it was 516.1 s and it ran 488.9 s of self-test ahead of `lint`). *A sum of per-entry medians; end-to-end runs have read 401, 414 and 463 s* |
| `npm run selftests` | **the seven `:selftest` entries, CONCURRENTLY**, derived from `package.json` rather than from any list — with the two that mutate state outside their own scratch space (`check-scheduler:selftest` deletes `node_modules/fyflow-scheduler`; `check-wiring:selftest` stages every check flat into `dev-dist/` and runs it) declaring themselves with a `SELFTEST-EXCLUSIVE:` marker in their own file and running alone. **`G4` in `check-wiring.mjs` asks it for its plan and compares it to the manifest both ways** — the entries, their COMMANDS, and the exclusive set — then runs it against a stub and requires every planned entry completed |
| `npm test` · `npm run test:deno` · `npm run test:browser:all` | **1112** `test()` cases, five runtimes *(979 until [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — 1065 at W65, 1111 at W66, 1112 at W67, and this cell moved for none of them; 958 until W62; 858 until W61 — 953 at its author pass, 958 after its readers; 746 until W59 — 835 at its author pass, 858 after its adequacy reader's fourth shape; 705 until W58; 656 until W57 re-took it; the count had gone stale in this row over three plans)* — `npm run gate` runs three of them, and `test:browser:all` is what adds firefox and webkit |
| `npm run test:l6` · `npm run test:l6:deno` | a real scheduler, **53 runs, 1610 assertions** *(50 / 1502 until W69 — W67 moved both and this cell neither; 50 / 1501 until W65; 46 / 1281 until W63; 44 / 1203 until W59; 42 / 1138 until W58; 40 / 879 until W57 re-took it)* |
| `npm run check:markdown` | **every relative link and every anchor** across **127** documents, **5478** links, **272** anchored *(91 / 3822 / 197 until W69, then **125 / 5426 / 271** until W69's and W70's conformity readers BOTH re-took it: that triple matched neither item's Record nor either item's own gate log, so it had never been measured anywhere. Every number in this cell is one `npm run check:markdown` prints, and it had not been re-read since W25 — section 1 rule 5's WHEN clause, which asks for the tree the item SHIPS and not the tree it was working on)* — `check-spec`s `C5` lifted here and still reported as `C5` |
| `npm run check:spec:selftest` | **the first negative test `check-spec` has ever had** — `check-spec.mjs` shipped with W1 and its probes were run by hand once. **29 probes and 28 gradings** *(26 / 25 until W61 added `C7`'s two language clauses and `C4`'s headline clause; 22 / 23 until W59 added `C7`'s two node-type clauses; this row read 18, then 20; the file prints its own count on every gate run — P11's retro)*: one probe and one grading per `fail()` site for `C1`-`C4`, `C6`-`C8` (**19** of them, `C2` having gained **two** at W41 for the `RULE_PREFIXES` binding), two for the report block, two for the exit path, plus one probe that trips **two `C7` clauses at once** so the failure-COUNT discriminator is reachable at all. `C5` is not here — W25 lifted it to `check-markdown` and it is probed and graded from there |
| `npm run check:source:selftest` | **the gate's own wiring, negative-tested** — **41** probes, **27** gradings of those probes, **10** of the probe list itself *(35 / 24 / 10 until W57, which narrowed `S7` and `S8`, retired `S9`, and added a `clean` CONTROL probe)*. W30 added ten: `S4` and `S7`, the two clauses no second mechanism guards, each reachable only through a copied published tree (`CHECK_SOURCE_SRC`) — and **one probe per entry of both pattern lists**, after its adequacy reader measured that three of five entries in each could leave for **0**. `S12` compares `gate`'s **15** entries to a declared list both ways and in order — and **seven of this file's probes went vacuous when ADR 0039 reordered that chain**, rule 7 (b) firing correctly, so all seven are now anchored AGNOSTICALLY (*the last entry whatever it is called*, *the first two whatever they are called*) rather than re-pinned to names; `S13` takes the three chains it composes. *(This row read **3** until W29 corrected it: W28 added four `SELF` entries and did not raise it. `doc/` is checked by nothing, and this is that class in the front-door document.)* |
| `npm run check:wiring:selftest` | **the gate's own wiring one layer in — the check that proves a `:selftest` entry actually runs a self-test**, [W38](doc/work-items/w38-the-dispatch-nothing-binds.md). **34 probes, 14 gradings, 6 `SELF` entries.** `G1` RUNS each of the seven `:selftest` scripts with the flag and an override pointing its self-test at a stub, and requires the stub's sentinel — a text test would be satisfied by the word `--self-test` in a comment. `G2` reads the DEFAULT that dispatch loads when nothing sets the override, **which is every run the gate makes and the one configuration `G1` cannot observe**. `G3` derives the manifest's two entries per check from the `scripts/` listing, both ways, because both of this check's own gate entries were otherwise repointable and deletable for **0**. **`G4` is [ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)'s**: with the seven `:selftest` entries out of the `&&` chain, `S11`, `S12` and `G3` all stop seeing them, so `G4` asks `scripts/run-selftests.mjs` for its plan and compares it to the manifest both ways — names, COMMANDS and the exclusive set — and then runs it against a stub and requires every planned entry completed. **`G5` is the half `G4` structurally cannot reach**: all three of `G4`'s runs set an override, so the branch `npm run gate` takes is the one branch no `G4` clause observes — W39's adequacy reader made the runner report `7/7 completed, 7 ok` in **0.1 s** with four checks green, four different ways. `G5` reads the nine declarations that decide the runner's DEFAULT behaviour and compares each to the one form it may take, which is `G2`'s answer to `G2`'s question. Its self-test is **96.7 s**, of which `G4` bought **31**, which is [Q176](doc/open-questions.md)'s subject in one row |
| `npm run check:scheduler:selftest` | **41 probes and 36 gradings since W57 (`D8`, the published manifests at the pin)**; when this row was written: **20 `PROBES` entries and 22 gradings — one per `fail()` site (18), one per way the report can lie (3), and one for the exit path**. *(The file prints **32**, which is `PROBES` plus the `.d.ts` and install probe sets; 20 is a correct number for a narrower set than this sentence claimed — P11's retro.)* Of the 22: **20** are noticed by the probe the entry names, **1** only by the failure COUNT, which the id set cannot see, and **1** is a declared **masking** — a sibling clause reporting the same id *in its place*, so that one clause is deletable for 0 and the entry says so ([Q146](doc/open-questions.md)) |
| `npm run check:policies:selftest` | **13 probes, 6 gradings, and 14 bounds on those two lists** — the `SELF` list this file went three items without. Every entry is one edit to a list that sits ABOVE it, so nothing self-matches, and each makes the run go red **with the guard in place** rather than removing the guard. **Eight of the fourteen entries bound a mutation that cost 0 before W31** — `MIN_META` lowered, a duplicate entry, a global anchor, an ambiguous anchor, a grading passing as `corpus`, a second `wide` exemption, the `ran:` guard, the probe-pass verdict — and its readers added three more. **It is 2.2 s to 14.7 s for that**, which is the honest number and is recorded rather than a ratio ([Q133](doc/open-questions.md)) |
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
- [doc/plans/](doc/plans/) — **P1-P18 all complete and retro'd** — P18 answered *can a flow and the runtime it needs be defined as two DOCUMENTS and a registry of names?* **YES**, in three items, and `doc/workflow.md` is [v0.19](doc/workflow.md) (one change adopted, six refused). **The next plan starts at **W72, Q300** and ADR 0056 — P19, strict mode. *(This read **W71, Q297** until 2026-09-17, when [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) took the id and spent Q297 — the THIRD consecutive day this sentence has been falsified by the item that expired it, after W69 and W70 did the same. Three items outside any plan, three corrections, and the item that made this one wrote the claim that it had corrected it BEFORE doing so: its conformity reader found all five copies standing, one of them in a file the item had edited in the same commit.)*** *(This read **W69, Q293** until 2026-09-17, when [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — an item belonging to no plan — took both ids: a claim with an expiry date, falsified by the item that expired it and corrected by that item, found by grepping the tree for its own id.)* *(And **W70, Q294** until 2026-09-17 too, when [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) took W70 and reserved Q294-Q296 without using them — the same sentence falsified on two consecutive days by two items outside any plan, corrected both times by the grep section 1 rule 5 prescribes.)* **And [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) and [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) are DONE** — the getting-started example above and the routing flow below it, both executed by the gate and both held byte-equal here by `X8`, which their four readers rebuilt from a MEMBERSHIP into a PAIRING: each README section is now held to the executed snippet it NAMES, every fence in it is compared rather than the first, and each of the clause's halves has a probe that trips it alone. **And [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) is IN REVIEW**: the reference stops teaching a FAKE scheduler for a use case — **fake-scheduler snippets 7 -> 2, real ones 7 -> 12** — and the conversion found that `MissingJoinPolicy` cannot be raised through `createRuntime` and that `onRegionEvent` is never forwarded to a runtime's driver, so a snippet could demonstrate it only by building the driver itself ([Q297](doc/open-questions.md)). *The items:* **[W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) done 2026-09-15: ADR 0053 (the built-in JSON Schema subset) and ADR 0054 (`type` req [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) done 2026-09-15: ADR 0053 (the built-in JSON Schema subset) and ADR 0054 (`type` required on every task node, `workerType` retired, `spec/flow-definition.md` v0.19), the registry a DOCUMENT, the corpus and `examples/` migrated; [W66](doc/work-items/w66-the-runtime-entry.md) done 2026-09-16: `createRuntime` builds a runtime from that document and `start` returns a `Driver` (ADR 0055, `RT-R13`); W67 done 2026-09-16 (P18`s exit artifact: a flow and the runtime it needs from two JSON documents)** — *can a flow and its runtime be defined as two documents and a registry of names, with the library doing every instantiation?* — three items [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)-[W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md) reserving W65-W68, Q278-Q292 and ADR 0053-0055, `doc/workflow.md` at [v0.18](doc/workflow.md); the most recent complete plan is **[P17](doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)** — [W61](doc/work-items/w61-what-a-transform-is.md) (ADR 0051: a transform is a declared expression in a registered language, applied in the type's worker wrapper; `spec/flow-definition.md` v0.18, `FD-V35`-`FD-V37`, `FD-C6`), [W62](doc/work-items/w62-the-jsonata-adapter.md) (ADR 0052: `jsonata` 2.2.2 as `fyflow-orchestration/jsonata`, declared in `dependencies` at the exact pin, `RT-R12`; five names unbound including `$shuffle`, which reversed P17 prediction 4) and [W63](doc/work-items/w63-a-transformed-join-on-real-workers.md) (the exit artifact: a typed join successor reducing the region's record through `$sum([*.score])` with no reshaping node, receiving 990 / 400 / 0 at arities two, one and zero on real workers in both L6 runtimes) — *what may a node DO to its input before its worker sees it?*; retro'd 2026-09-15 with two workflow changes. **The next plan starts at W65, Q278 and ADR 0053.** *(This line read P1-P9 with P10 running, and before that P1-P4 while five more plans closed behind it — `doc/` is checked by nothing, and this is the front-door document.)*
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
