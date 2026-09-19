# examples — ladder L6, the only code here that touches a real scheduler

Owned by [W6](../doc/work-items/w6-the-non-success-rows-at-l6.md) under
[P2](../doc/plans/p2-the-non-success-half-on-a-real-scheduler.md), and built by
[W5](../doc/work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **Not published** — neither `package.json`'s `files`
(which ships `dist/**` only) nor `deno.json`'s publish allowlist includes this directory.

```bash
npm run test:l6         # Node 24
npm run test:l6:deno    # Deno
```

**`getting-started/` is the one thing here that is NOT an L6 row** —
[W69](../doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) and
[W70](../doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) and
[W71](../doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md). It holds the
files a consumer writes as code — **nine workers**: `worker.ts` and `tag.ts`, then W71's
`flaky.ts` (throws, so a task parks for a person), `scorer.ts` (a score after a stated delay, so
an arrival order can be ARRANGED), `classy.ts` (returns a class instance), `inspect.ts` (reports
what it RECEIVED) and `uncloneable.ts` (returns a function, which stops a run), and then W74's
`reader.ts` and `summarise.ts`, whose schemas OPPOSE so that a miswire exists to be caught. **W74
adds two files that are not workers**: `session-registry.ts`, the one declaration of those two
workers' schemas that the reference's snippet and `test/definition/assist.test.ts` both read, and
`session-types.ts`, GENERATED from it by `signatureOf` and compared to the generator's output both
ways — `npm run typecheck:examples` is what then compiles the two workers against it. What executes
them is `npm run check:docs`: `AGENTS.md` sections **2, 5, 7, 9, 10, 12 and 15** carry the
getting-started, routing, human-in-the-loop, refusal, common-mistake, custom-group and
authoring-session snippets, the gate extracts and runs each, and `README.md` carries three of them
byte-equal under `check-docs`'s `X8`, which holds every README fence to an executed one. *(This said **two**
workers and **three** sections until W71's conformity reader read it: W71 added three of the
modules and named itself nowhere, in a file it did not own and took no exception for.)* `l6.ts` lists `workers/` on disk and compares that listing to
the L6 registry both ways, which is why the getting-started worker lives in its own directory rather
than beside the fourteen: a module under `workers/` that no L6 entry names is red in that clause.

Both print the same table and run the same **1639 assertions over 55 real runs** *(1627 / 53 until [W78](../doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md), whose CONSUMER-ROAD block is P20's exit artifact and makes two runs under one label; 1611 / 53 until W73; 1502 / 50 until [W67](../doc/work-items/w67-a-flow-from-documents-on-real-workers.md), whose two rows are P18's exit artifact; 1501 until W65 split one cross-row retry clause into a pair)*. *(**1499** for the hour between the reshaping-road pair joining block (2d) and the readers' fourth branch, and this sentence read **1497** — the count from before that pair — while it did, which W63's conformity reader caught, the class this page records five times below; **1281 / 46** until [W63](../doc/work-items/w63-a-transformed-join-on-real-workers.md) — and this sentence read **1280** for that whole interval, W59's count from the hour before its readers' last assertion landed, so it was wrong by one from W59's record step to W63's; **1203 / 44** until [W59](../doc/work-items/w59-what-a-node-type-is.md); **1061 / 42** until [W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md) — 1138 / 42 when W57 shipped, and this sentence never carried it; **942 / 42**
until [W55](../doc/work-items/w55-a-run-at-scale-on-real-workers.md), which moved the assertion
count and not the run count: it adds no row and no flow, because P15's exit artifact is a MEASURED
NUMBER rather than a flow. The first version of this parenthetical said **760 / 36**, which is the
number the sentence above it had been carrying while the cell two rows down already read 942 / 42 —
so the correction to the cell was written up as though the page's OTHER half had been right. W55's
conformity reader, and it is the class this page's own parentheticals record three times: an item
corrects a count where it is looking and not where it is not.)* *(**This line read
`478 assertions over 25 real runs`, and the first number was WRONG FROM THE COMMIT THAT WROTE IT.**
`git show` says so exactly: at `14f7580` (W17) this page read 342 and `l6.ts` declared 342; at
`ad8f62f` (W19) both read 373; at `ebd8459` — [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md) —
this page said **478** and `l6.ts` declared **489**. It stayed wrong through
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) and
[W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md), whose Records carry 489
correctly — as do W32's and W33's, so on the predicate *an item whose Record states the count* it is
**four items and two plans**. The run count, 25, was right the whole time. And the
sentence that introduced the error is the one that CORRECTS the previous instance of it two clauses
later, in the paragraph whose own parenthetical says nothing checks these numbers. `l6.ts`'s
`DECLARED_TOTAL` is the number, and it is the one to copy.)* *(Two counts, two
predicates: a **run** is one `Driver` on one flow; a **row label** is an `EXPECTED[]` entry or a
`PairRow`, and there are **34** of those, because each pair row is one label producing two runs.
`l6.ts` prints the run count and derives it from the arrays; the row-label count and the assertion
count appear only here, and **nothing checks the three numbers on this page** — a markdown file
cannot derive one. That is [Q100](../doc/open-questions.md)'s class in a second file, and it is why
the parenthetical below exists.)* `RT-R10`: **L6 runs in Node and
Deno and not in the browser** — [Q33](../doc/open-questions.md), and the browser half is
[Q52](../doc/open-questions.md).

## What is here

| | |
|---|---|
| [`l6.ts`](l6.ts) | **the gate.** **Fifty-five real runs, 1639 assertions** *(53 / 1627 until W78, whose consumer-road block is P20's exit artifact; 1611 until W73's FD-R4 clauses on three existing rows and its wiring-check clauses over the runtime's registry; 50 / 1502 until W67; 1501 until W65)* *(this cell and the sentence above it read **1595**, then **1597** — W67's counts from before its readers' fixes landed, which is `doc/workflow.md` section 1 rule 5's *a measured number is RE-TAKEN on the tree the item ships* broken in the cell that records the class five times. W67's conformity reader, finding 1)* *(1497 in this cell for the hour after W63's first run, while `l6.ts` already declared 1499 — W63's conformity reader; 1281 — this cell read 1280 — for the whole of W59 to W62, and 1277 for the hour before block (2c)'s three manifest assertions landed, which is the hour this line was first written in — W59's conformity reader)* — every expected value written by hand from `spec/` before anything ran. **Forty-eight** `EXPECTED[]` entries plus **two** two-driver pair rows, each **one row** producing two runs on ONE scheduler, plus the **SHIM RUN** — P18's sample shim's own call, `runtime.start(flow, payload)` with no options, which no row could make (W67's adequacy reader) — plus the **CONSUMER ROAD**, [W78](../doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md)'s and **P20's exit artifact**: one label, TWO runs, in which the consumer holds only what `start` RETURNED — a fan-out watched through `StartOptions.onRegionEvent` and the end awaited in one line, and beside it a run whose driver REFUSES, where `done` resolves `stopped` rather than rejecting (ADR 0058 rules 3 and 4). **It could not be an `EXPECTED` row**, because `runFlow` IS the machinery it exists not to use — so **50 row labels and 55 runs**. *(46 / 48 / 50 until W67, whose two rows are P18's exit artifact.)* *(46 / 1281 / 42 / 44 until [W63](../doc/work-items/w63-a-transformed-join-on-real-workers.md), whose four rows are P17's exit artifact; 44 / 1203 / 40 / 42 until [W59](../doc/work-items/w59-what-a-node-type-is.md), whose two rows are P16's exit artifact; 42 / 1061 / 38 / 40 until W58 — and 1138 when W57 re-took the assertion count, which this cell never carried.)* *(These four read 36 / 760 / 32 / 34 until W51, which is three items of drift: W45 moved them, W47 moved them and W51 moves them again. The parenthetical below is the diagnosis and it kept being true.)* *(These four numbers were 31 / 638 / 27 / 29 when [W43](../doc/work-items/w43-the-two-blocked-flows-on-real-workers.md) began and it moved all four; its own declaration step found the SAME class in `l6.ts`'s file header — three wrong values over three items, in a comment that told the reader to derive them — and fixed it there while leaving this page standing. **Found by W43's conformity reader, in the sibling file the item also owns.** That is the class this cell has recorded twice already, arriving a third time by the same route: an item corrects a count where it is looking and not where it is not.)* **`l6.ts` derives the RUN count from its own arrays and prints it; the row-label count and the assertion count are typed HERE and checked by nothing**, which is what the parenthetical above says and what this cell used to contradict by calling all of them derived — [Q171](../doc/open-questions.md), corrected by W35's conformity reader in the cell W35 had just rewritten. *(This sentence read 454 / 20 / 22 / 24 and **"the last three"** below — written for a three-row version of this item and not updated when its fourth row was added. Found by W23's conformity reader, in the paragraph whose own parenthetical says nothing checks the numbers on this page.)*. Four of the entries are [W17](../doc/work-items/w17-the-all-exit-row-at-l6.md)'s, and one of those is the row whose join is reported **dead** rather than merely never firing; the second pair row is [W19](../doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md)'s and is **P6's exit artifact**; and **four of them are [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md)'s, which are P7's**; **six of them are [W35](../doc/work-items/w35-a-map-on-real-workers.md)'s, which are P10's** *(they were the LAST six when W35 wrote it; nine rows have been added past them since, by W43, W47, W49 and W51 — corrected by W55's conformity reader in a cell W55 was editing anyway)* — four map runs, the map's one run-time refusal, and the one shape that can falsify ADR 0037 rule 1 |
| **the four nested rows** | **P7's exit artifact, and the first dotted task ids any rung above L2 has asserted.** One flow, one worker set, three answers. `nested HIGH / live-token`: every branch at both depths arrives, and **the outer join fires over branches it never opened** — `inner` is entered from `outer`'s branch 1, `scoreC` and `scoreD` are dispatched at `1.0` and `1.1`, and when `innerJoin` fires it enters `outerJoin` at the path its own **region** sits at, which *is* branch 1 arriving. `nested LOW / live-token`: both inner branches route away, so the inner join fires **having been reached by nothing** — [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s recorded cost, one level down — and the run still completes. `nested LOW / live-token-requiring-arrival`: the same run under the one policy that can say so, where `inner` is **reported dead**, `JP-R10` ends the outer branch it sat in, and `outer` fires anyway because `scoreA` arrived — so `publish` runs real work in a run that folds to `stuck`, which is [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) rule 5's stated cost rather than a surprise |
| **`FD-R4` on three rows** | **W73's two runtime boundaries on real workers, riding on rows that already existed rather than on new runs.** `map / live-token` and `nested-map / live-token` each try a payload FIRST that the entry's worker `inputSchema` refuses (`confidence: 2` against `maximum: 1`) — at a TASK entry naming `ingest`, and at a FAN-OUT entry naming `scoreA`, the first branch task, because every branch is held to its own schema over the same value — and assert a `BoundaryRefused` thrown at the caller with the scheduler holding NOTHING, before the row's run starts on its real payload. W63's `transform-fails` row now tries its two resolutions FIRST with the values the transforms did not supply (`{ points: … }`, `{ confidence, at }`), which `echo`'s `outputSchema` refuses — each a `BoundaryRefused` with the task still suspended — and then resolves each with the worker's DECLARED EXAMPLE, the value ADR 0056 rule 3 says a person reaches for; the join fires and the run completes as before. A cross-row block holds the two refusal sets to the rows that declare them, both ways, with the two controls named as subjects (v0.18) |
| **the four transform rows** | **P17's exit artifact, and [Q263](../doc/open-questions.md) as three rows.** `transformed / arity TWO`: a typed `map` branch RESHAPES its own item through a declared `transform` reading the map's settings as `$settings` — `{ word, score: $round(confidence * $settings.scale), fields: $keys($) }` — then two typed scorers arrive at a join whose typed successor declares `transform: { lang: "jsonata", expr: "$sum([*.score])" }` and NO reshaping node, and its worker receives **990** as its `input` (`FD-C6`), echoed from the run. `arity ONE` routes one scorer away by a decision (P1's own case under `live-token`) and the successor receives **400** — a number, because the plan's expression is the ARRAY form where the path alone would be a scalar. `arity ZERO` routes both away, `live-token` fires the join over `{}` (ADR 0025's column), and the successor receives **0** and not `undefined` — the row asserts the TYPE beside the value, a second expression over the same fact (the value alone already discriminates, because an absent `input` drops its key from the JSON text the row compares; this cell first gave the opposite reason). The pool that evaluates the expression is a real THREAD in both runtimes, loading `fyflow-orchestration/jsonata` by its module URL, and every result it returns reports the fresh realm it ran in (`realm: 'thread'`); every reshaped item's arrays are plain (`markedKeys: []`), which is ADR 0052 rule 6 observed on an array the engine built. **These rows observe the VALUE the successor received, not the record's shape** — `JP-R12`'s keys are observed by `transform-fails`' untyped `publish` and its `{}` by W17's `all-exit` row. `transform-fails`: two non-optional typed nodes whose transforms fail at run time — a type error (`T2002`, an author who meant `&`) and `$now()` (`UNBOUND`) — are retried once under the type's policy, fail again, and are parked `user_action` with `TransformFailed`'s message as the task's error on two observers, a person resolves each with the value the transform did not supply, and the run completes; beside them one typed node declares no transform and receives `FD-C5`'s two keys to the byte, in a run whose `Scorer` pool carries no engine — the same type carries `jsonata` on the `transformed` runs, decided by the flow (ADR 0051 rule 4) — and one (`note`) transforms an ordinary edge's value successfully, the fourth of `FD-C5`'s kinds, which the exit-artifact flow cannot carry |
| **the six map rows** | **P10's exit artifact, and the only place here where the number of tasks a run dispatches is written down nowhere in the run's inputs.** `map / live-token` dispatches `score` at `0`, `1` and `2` because a worker returned an array of three; each instance receives **its own item** and computes a different score ([ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md) rule 3), and the join carries all three back keyed by branch path (`JP-R12`). `map / arrival-count` is the same run under the policy whose `N` had to be **re-sourced** from `branch.opened`: reading it from the region's one declared branch entry gives 1 at every arity, so the join fires on the first arrival and `publish` receives one key instead of three — measured, **1 L6 failure**, and before these rows it was **0**. `map / N = 0` is the arity `FD-V9`'s floor makes unreachable for a `fanout`: nothing is dispatched, nothing can join, and the run is **`stuck`**. `nested-map / live-token` puts a map inside a fan-out branch, so its instances run at the **dotted** paths `1.0` and `1.1` at an arity nobody declared, and the outer join's collection has a **collection** at key `1`. `map / FD-R2` is the one map refusal no validator can make: the flow is valid, `over` names a key the previous node does not produce, and the driver stops the run naming the node and the key |
| [`run-flow.ts`](run-flow.ts) | **the SHIM, and since W67 that is all it is**: import the registry document, supply the four things P18 decision 7 keeps as code — the predicates, a custom group TYPE (`DailyBudgetGroup`), a custom node-type CLASS (`GpuModel`) and the `jsonata` adapter — call `createRuntime` once, and then observe. One run: `runtime.start`, fold the driver's input sequence, return a report. **No `pool()` call, no group constructed by hand, no `Driver` built by hand.** **Since [W55](../doc/work-items/w55-a-run-at-scale-on-real-workers.md) a report also carries `retention`** — what the driver was still holding at the two ends of `JP-R12`'s window, measured through the one named reach into its private `arrivals` ([Q233](../doc/open-questions.md): [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md) rule 1 has no public surface, and both alternatives were measured and refused) |
| [`retention.ts`](retention.ts) | **[P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s exit artifact, and it is a NUMBER rather than a flow.** What ONE run holds on a real `FyflowScheduler`, before and after ADR 0046, with both observers named — and a `scale` mode that runs N real runs at once on one shared scheduler or on N of their own. **It is not in the gate chain**, deliberately: L6 is ~101 ms a real run, so the scale this plan is about cannot be a rung inside `doc/workflow.md` section 8's 90 s budget, and adding one is on P15's stop-and-ask list. What binds its observer is `l6.ts`, which asserts the same `Retention` value on every row. `node examples/retention.ts` for the artifact; the second observer is the `scale` mode's and needs `--expose-gc` |
| [`workers/`](workers/) | **fourteen worker MODULES and one `shared.ts`, one module per worker entry in the registry document** — [W67](../doc/work-items/w67-a-flow-from-documents-on-real-workers.md). Until then this was ONE file with a twelve-arm `switch` over a `role` its pool's config carried, because `run-flow.ts` built thirteen pools by hand; a worker entry is a URL now, so a module's default export is the class a `WorkerManager` instantiates, which is the scheduler's own contract. **Every module receives the ENVELOPE** `{ settings, input }` (`FD-C5`, universal since W65): most read only `input`, which is exactly the object they read whole before, while `typed.ts` and `echo.ts` read both halves by name. One always throws, one returns a value `structuredClone` refuses, **one returns an ARRAY, which is where a map's arity comes from**, **one MUTATES what it was handed** (what makes ADR 0037 rule 1 falsifiable), and two are the sample's — `prompt.ts`, whose answer is a function of the MODEL its type's config gives it, and `fetch.ts`, which declares no `settingsSchema` and is the registry's instance of *an absent schema means UNCHECKED* *(it "had no schema at all" until [W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md), when every worker entry gained an `inputSchema` and, where a JSON Schema can describe the output, an `outputSchema`, each with an `examples` — and `npm run check:workers` RUNS each module on its input example and validates what came back against its output schema, which is how fact 6's wrong `echo` schema was caught)*. **What went with the switch**: `ROLES`, the `Role` union and the three lists `l6.ts` compared both ways since W47 — the binding is now the document's worker keys against the modules ON DISK, compared both ways, and a key with no module is red before a pool is built |
| [`registry.json`](registry.json) | **the registry DOCUMENT this whole rung runs, and half of P18's exit artifact** — W67. Fourteen worker entries, five resource groups, **fifteen** node types with their pools and retry policies, one NAMED pool instance (`prompt-big`), the three predicate names and the one language. `run-flow.ts` imports it as JSON and hands it to `createRuntime`; the only thing this harness does to it is flip `inline` on the two types that declare none, which is the `threaded` knob a ROW sets and a document cannot carry (`inline` is fixed per TYPE — P18 decision 2). `l6.ts` asserts that bound as a DIFF, key by key over every section and every field of every type, so a derivation that rewrote a config or dropped a group is red naming the key. **What the diff bounds is the DERIVATION, not the bytes**: both of its sides read the imported document, and the second observer — `workerListsAsync`, which parses this file's own bytes — extracts KEYS rather than configs. W67's conformity reader, finding 14 |
| [`flows/`](flows/) | the **twenty-five** flows *(twenty-four until [W67](../doc/work-items/w67-a-flow-from-documents-on-real-workers.md), whose `triage.flow.json` is P18's sample — the exit artifact, a flow that names registry keys and nothing else, beside `registry.json`; twenty-two until W63 — `transformed` and `transform-fails` are its two, P17's exit artifact on real workers and its failure road; twenty until W59 — `typed` and `typed-regions` are its two, P16's exit artifact on real workers; eighteen until W58)* this gate needs that `spec/examples/` cannot express — [Q44](../doc/open-questions.md), whose own text said this would not be needed. `all-exit` is the fifth and the reason is the same one a third time: the corpus's all-exit shape reaches its second exit through a human, which would put a resolution race in a row whose point is elsewhere. **`nested` is the sixth and `nested-suspend` the seventh**, and their reason is different: `spec/examples/valid/nested-fanout.flow.json` exists and its outer join routes to an `end`, so **nothing is dispatched when that join fires** and a row has no id to read as *the join fired*. **The last three are W35's**, and their reason is the narrowest yet: `spec/examples/valid/map-fanout.flow.json` is the right SHAPE and its entry node is an `IngestWorker`, whose role must keep returning `{ confidence }` for twenty other rows — so `map.flow.json` is that corpus flow with **two fields changed**, `workerType` and the `flowId` every flow here must own. `nested-map.flow.json` keeps `map-in-fanout`'s SHAPE and not its text — nine node lines differ, because every pool that flow names runs a role that would break the row — and `map-no-array.flow.json` is `FD-R2`'s own case. **`map-alias.flow.json` is the eleventh** and its reason is the sharpest: the `split` role memoises per word, so `a a` returns an items array holding ONE object twice — the only shape that can tell ADR 0037 rule 1 from its negation. **The last three are [W43](../doc/work-items/w43-the-two-blocked-flows-on-real-workers.md)'s, which are P12's**, and their reason is this cell's own from the start: `map-with-context` and `map-over-region-output` point their map-feeding node at `SplitWorker` because the corpus's `IngestWorker` returns no array — run verbatim, the corpus documents stop at `FD-R2` — and `decision-on-an-earlier-step` puts a `TallyWorker` in the middle, whose result carries **no `confidence`**, so a predicate reading `ctx.outcome` cannot route where one reading `ctx.needs` does. All three take the `l6-` prefix on their `flowId`, honouring this cell's own *"the `flowId` every flow here must own"* — which the first drafts did not, and which W43's conformity reader caught |
| [`deno-import-map.json`](deno-import-map.json) | how Deno resolves the bare `fyflow-scheduler` specifier — to `jsr:@fyflow/scheduler@0.5.2`, at the same version `package.json` pins for npm ([ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md) rule 2) |

## Five things a reader should not have to rediscover

*(The heading read **three** over four numbered items for two work items, and the section below it
read **fifteen runs** at nineteen. Both are the count-in-prose failure this repository keeps
producing, in the document whose job is to state the counts; each now says what it counts.)*

**1. The two runtimes reach the scheduler through two registries, and the version is written down
twice.** Node installs `fyflow-scheduler@0.5.2` from **npm** and reads its `dist/` build; Deno
resolves the same bare specifier to **`jsr:@fyflow/scheduler@0.5.2`** and reads its TypeScript
source. *(That read *"because **Node cannot**"* until 0.5.2 fixed
[S9](../doc/scheduler-upstream.md) — Node **can** now, measured. The split stays for the reason that
outlived it: `dist/` is what an npm consumer gets, so this rung tests the published artifact.)* `npm run check:scheduler` **D3** is what
stops the two runtimes silently running different versions — the hazard survived the move from a
working-tree link and only changed address. **`D6` is what stops both rungs from not running this
file**: it binds `test:l6` and `test:l6:deno` to invoking their runtime and to naming
`examples/l6.ts`, because [W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md) measured
that dropping the import map and W35 measured that pointing either rung at `run-flow.ts` — which
exports functions and runs nothing — each cost **zero** failures across four checks, with every exit
artifact in this file silently unrun. All of this is
[ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
and none of it is visible to a consumer beyond what the manifest says: since
[ADR 0048](../doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
the published library **depends on the scheduler** — a `peerDependencies` entry at the pin, and
one `import { FyflowTask }` in `src/driver/driver.ts` for the default `createTask` — so the version
these roads reach is also the version a consumer's installer is told about. *(This read "depends on
the scheduler **not at all**" from W35 until W57 superseded ADR 0013 rule 1.)*

**2. How a run is known to be over, with no clock.** The three obvious answers are wrong:
`scheduler.completed` fires **every time the scheduler drains**, `stats` reads `queued=0 running=0`
for a scheduler that is genuinely stalled, and a `setTimeout` is how a green L6 gets written that
proves nothing. So the harness folds the driver's own input sequence as it arrives
([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)) and stops
when the **run-state outcome** leaves `running` and `awaiting_action` (`RN-R12`). That is decidable,
and it is this repository's central invariant applied to a real run for the first time.

**Read at a quiescent point, never mid-turn**, and the qualification is load-bearing: the driver
appends a settlement *before* the routing it causes, so most prefixes of a run are not resting
states and several of them report a terminal outcome for a run that is not over
(`spec/run-state.md` section 3). `queueMicrotask` is the boundary. `RunReport.finishedBy` records
**which** of the predicate and the backstop ended the wait, and every row asserts it was the
predicate — without that, replacing the whole mechanism with a 1 ms timer passes every other
assertion, because `scheduler.shutdown()` drains the run before the report is read.

The wall-clock backstop in `run-flow.ts` is **not** how a run is detected. Reaching it is a failure.

**`runPair` is the second entry point, and it now serves two rows.**
[ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
makes *two drivers on one scheduler* a supported topology, so P4's exit artifact is that topology on
real workers. `runFlow` gained one option — a scheduler to share — and will not `shutdown()` one it
did not build; everything else about a run is unchanged, so the pair differs from two sequential runs
in exactly the respect under test. **Before W13 that pairing corrupted both runs silently**: each
driver received the other's settlements and dispatched its successors, so one task id was dispatched
twice under two outcomes and `ID-R1` could not fire.

**W19 gave it a third argument: `ForeignTask[]`** — tasks put on the shared scheduler with their ids
passed through **verbatim**, so they are whatever the caller says rather than anything
`spec/task-id.md` would produce. They go in through the **instrumented** `addTask`, so
`PairFacts.addTaskCalls` counts them and the count stays a fact about the scheduler; and they are
queued **before either driver starts**, on a single-slot inline pool, so the foreign settlement is
the first one the scheduler dispatches. Both halves are asserted rather than trusted —
`settlementIds[0]` for the order, `listenersAtFirstSettlement === listenersTotal` for the claim that
both drivers were there to receive it.

**3. Why there is more than one run, and what the first eight are for.** P1's exit artifact is *"the
branch-routed-away case as an executable test, run against both policies, plus one real fan-out flow
completing on a real scheduler"*. The control rows exist so the comparison has a baseline; the high-confidence rows exist
so `isLowConfidence` is a predicate that can return **both** answers, rather than a constant nothing
would notice was stuck at `true`.

Rows five to eight are ADR 0003's **two** mechanisms:

| | `live-token` | `arrival-count` |
|---|---|---|
| `p1-routed-away`, low confidence — *a decision routes a branch away* | `completed` — 4 tasks | **`stuck`** — 3 tasks |
| `optional-loss` — *an `optional` task simply fails* | `failed` — 4 tasks | **`stuck`** — 3 tasks |

The second is the one ADR 0003 calls ordinary: **no decision, no routing away, just a task that
failed**, and arrival-counting hangs anyway. `optional-loss` is defined in
[`flows/`](flows/optional-loss.flow.json) rather than in the corpus because the corpus cannot express
an `optional` branch node with no `on: ["failed"]` edge — [Q44](../doc/open-questions.md), and this
is its second occurrence.

**4. What W6 added, and the pair that matters.** *(Five rows after its review, not four — the fifth
was added because a negative test survived, and so was one of the first four. Both are in W6's
Record.)* P1's rows are all successes or hangs. W6's four are
the non-success half: a failure that **routes** rather than being lost; a suspension a person
resolves; a suspension nobody resolves; and a refusal that stops the run. The pair to read together
is the middle two — **the same flow, distinguished only by whether a human turns up**:

| | outcome | join | tasks | finishes? |
|---|---|---|---|---|
| `suspend / resolve / resume` | `completed` | fired | 4 | yes |
| `suspend / nobody comes` | **`awaiting_action`** | never | 3 | **no, and correctly** |

The second is **not `stuck`**, and that distinction is what `branch.suspended` exists for: a
suspended branch is still live, so the region has not emptied and `RN-R10` sits below
`awaiting_action` on purpose. `RN-R12` makes such a run non-terminal, so it is the one row whose
**expected result is the backstop** — a run parked on a person is not over, and the harness must not
pretend it is.

In both `arrival-count` rows the join's successor is **never dispatched**: `N` is fixed at two and
only one branch ever arrives, so the join waits forever with nothing queued and nothing running.
That is ADR 0003's matrix executed rather than simulated — and until
[ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) run state called
both of those runs **`completed`**.

**5. The two pair rows, and the one variable between them.** Both run the same flow with the same
payloads under `live-token`, two `Driver`s on **one** `FyflowScheduler`. They differ in whether that
scheduler also carries **tasks this library did not mint**:

| | foreign tasks | each driver's `onUnmintedTask` | both runs |
|---|---|---|---|
| `two runs / two drivers / one scheduler` — **P4's** | **none** | **`[]`** — a *parseable* foreign settlement is dropped in silence, which is `ID-R4` tier 1 and [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) rule 4's asymmetry | `completed` |
| `two runs / one scheduler / tasks we did not mint` — **P6's, [W19](../doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md)** | **six** — one per refusal `parseTaskId` makes, plus [Q107](../doc/open-questions.md)'s `weekly-report`, which reaches the same refusal down `task.failed` instead of `task.completed`. All settle **before either run settles anything**, with both drivers already attached. *(This cell read **two** through two items that changed it: W19 took it to five and W23 to six. The list is `UNMINTED` in `l6.ts`; count it there.)* | **one report per foreign task, per run**, each under **its own** `runId` and carrying the event name, the id uncoerced and `parseTaskId`'s own message — ADR 0027 rule 3 | `completed` |

**Two foreign ids, not one, and the second was added by the item's own provocation sweep.**
`nightly-cleanup` is colon-free, so it reaches only `parseTaskId`'s **arity** refusal — one of the
five it makes. With it alone, narrowing tier 0 to `if (taskId.includes(':')) throw e` left all 370
assertions green - 370 being the count at that moment, before the second id was added. `pc:ingest:x:0` is four segments in our own shape with a **branchPath** outside the
grammar: the one producer ADR 0027 says could be **ours**, and the referent of that decision's whole
against-case.

**Neither row is assertable without the other.** An empty `onUnmintedTask` array proves nothing on a
scheduler where nothing unminted ever settles, and a non-empty one proves nothing about the channel's
*boundary* — that another run's settlement, which is parseable, must not arrive on it. `ID-R5` is
decided at **tier 0**, ahead of `ID-R4`'s two tiers, because both of those compare a run id and an
unparseable id has none. `pc:ingest:x:0` is what makes that ordering load-bearing rather than
stated: its first segment is run `pc`'s, so under any tier order that compared a run id first,
driver `pd` would drop it in silence.

**What the second row costs, under the rule it replaced.** Measured by restoring ADR 0023 rule 2 and
running this row, on this flow: both runs `stopped`, each reported `InvalidTaskId` **twice**, and
each dispatched **1 of its 4** tasks — so the scheduler was handed 4 of the 10 tasks it would
otherwise have run, and settled every one of them. The failure was never that the scheduler breaks;
it is that **the drivers go deaf while everything around them proceeds**, which is the shape that
does not get noticed in production.

## What these are not

They are a **gate**, not a copy-paste starting point. A consumer writes
`import { FyflowScheduler } from 'fyflow-scheduler'` exactly as `l6.ts` does — and installs it from
npm or JSR exactly as this repository now does
([ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
which supersedes ADR 0013 rules 3 and 5). *(This paragraph read "when 0.3.0 reaches a registry" and
"rather than from a `file:` link to a sibling checkout" after both had stopped being true — the
`doc/`-is-checked-by-nothing class, in the front matter of the directory it describes.)*
