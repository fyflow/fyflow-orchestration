# P37 — A runtime is its registry

**Status:** declared — 2026-10-15 on `da18320`, from the draft carrying the maintainer's decisions of 2026-10-14/15; facts 1-8 measured at this declaration; stop-and-asks (a)-(f) ANSWERED by the maintainer 2026-10-15, all as recommended
**Question this plan answers:** *what may a running runtime be asked to accept — a flow published
after it started, a transform tried on given input, pool options per instance, annotated schemas —
when its registry is fixed at `createRuntime`?*
**Exit artifact:** *on the final tree, one cross-row block in `examples/l6.ts`, green in node 24 and in
deno, in which: (1) ONE runtime is built by `createRuntime` with its registry's `languages` given and
NO flow passed to it (stop-and-ask (a)); (2) a run of a flow A declaring no transform reaches `done`
`completed` on it first, so the runtime is RUNNING; (3) a flow B that runtime was never shown, with a
JSONata `transform` on a node of a consumer's node type — a type the document declares, not the
built-in `Transform` — and a second such node on a NAMED pool instance declaring its own pool options
(decision 9), gets `runtime.check(B)` equal to `[]` and then `start(B)`'s `done` `completed`, each
transformed node's worker asserted to have received the transformed value; (4) for a flow C carrying
a definition defect, `runtime.check(C)`'s rule ids equal those of the `InvalidDefinition` `start(C)`
throws; (5) the registry document's worker schemas carry `title`, `description`, `readOnly` and
`writeOnly` and are accepted, while the same schema with `format` is refused naming it; (6)
`tryTransform` given an input on B's ENTRY node returns a verdict whose sample `source` is `'given'`;
(7) a flow whose node reaches a document-declared `KeyedRateLimitGroup` is refused as stop-and-ask
(c)'s answer says, by `check` and by `start`, before any driver is built; and `npm run gate:full` EXIT
0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W162-W168 (W168 expected unused), Q615-Q634, ADR 0096-0100 (ADR 0100 expected unused); S11 (stop-and-ask (f), answered yes)

```
Question: what may a running runtime accept, when its registry is fixed at createRuntime?
Items:    W162 (languages come from the registry, and runtime.check — ADR 0096), W163 (what start refuses
          that is not the flow's: the keyed group, #17 — ADR 0097), W164 (four annotations in the
          schema subset, #20 — ADR 0098), W165 (pool options on a named instance, #19 — ADR 0099),
          W166 (a sample the caller gives, #7), W167 (the exit artifact, on real workers in both runtimes)
Reserves: W162-W168 (W168 expected unused), Q615-Q634, ADR 0096-0100 (ADR 0100 expected unused)
Raises:   none at this declaration
Baseline: ids derived by `npm run state` at this declaration — P38, W162, Q615, ADR 0096 from the tree,
          W162, Q615, ADR 0096 from the ledger (P33's Retro), which AGREE. The ladder counts are NOT
          taken here and are W162's declaration step's
Measured: 2026-10-15 in a byte copy of `da18320` with its `node_modules` copied, never linked; node
          24.20.0 and deno 2.9.6; the copy scanned for links and removed after
```

## Why this plan, and why now

fyflow-app passes one synthetic warm-up flow per node type to `createRuntime({ flows })` so every pool
carries JSONata (`languageWarmupFlows`, **#6**, P1, *worse in M2*); evaluates a transform on typed input
with its own copy of our adapter (**#7**, P1); wraps node types to give a named pool instance its own
options (**#19**); and strips `writeOnly` from every schema before we see it (`withoutWriteOnly`,
**#20**). It also asked to add node types to a running runtime (**#5**, P2, M2). *(Its request document,
`../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass1.md`, items 5-7, 15, 17,
19 and 20, re-read at this declaration; the workarounds are at `packages/runtime/src/runtime.ts:33-44`,
`:107-117` and `:252`, and `packages/runtime/src/transforms.ts`, in that repository.)*

**This plan runs FIRST of P34-P37** — [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md)
decision 7: it needs none of P34's run control, and the two workarounds it removes that grow with every
plugin (#6, #20) get worse at the app's M2.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **A runtime is its registry.** Node types, pools, groups and languages are fixed at
   `createRuntime`. **`runtime.register()` is DECLINED (#5)**: `fyflow-scheduler` cannot add a pool
   after construction at the pin (fact 8), and a plugin change builds a NEW runtime — what the app's
   ADR-0007/0015 already do. Runs on the old runtime stay there or move by stop-and-resume
   ([P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md)). Checked against fyflow-app's
   `runner.ts` and ADR-0015 on 2026-10-14.
2. **A flow may be checked and started on a running runtime at any time** — `runtime.check(flow)`
   returns every finding `start` would refuse on; *register* means *check, then start*. What "every"
   is, measured, is fact 6 and stop-and-ask (b).
3. **#6: a runtime's languages come from its REGISTRY, not from the flows** — every typed pool gets the
   registry's languages built in, which makes a flow published later runnable with nothing extra. This
   **reverses [ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
   rule 4** at the cost fact 2 re-prices, and [Q285](../questions/q285.md)'s reopen trigger is met.
   Whether `createRuntime`'s `flows` option goes or stays for early validation is stop-and-ask (a).
4. **#20: the schema subset admits `title`, `description`, `readOnly` and `writeOnly` as
   annotations** — value shape checked (a string; a boolean), constraining nothing, **with no
   redaction promise**, stated in the ADR and `AGENTS.md`. The bar: *an annotation is admitted if it
   constrains nothing in JSON Schema itself and its value shape is checked.* It supersedes
   [ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
   rule 3, consequence 2 and its rejected *whitelist* row, and
   [ADR 0056](../decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)
   consequence 4, for those four. **Still refused**: `deprecated`, `$comment`, `default` (authors
   expect it applied), `format` (reads as a constraint — Q278's hazard), `$schema`, `$id`.
5. **#5, #15 and #17 are answered here** — the table below; #17's measurement found a defect (fact 1),
   so its fix is this plan's.
6. **This plan runs FIRST of P34-P37** (maintainer, 2026-10-15; reasons in
   [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 7).

*Handed on by [P33](p33-what-a-run-does-when-a-task-ends-cancelled.md)'s Record, by the maintainer's answer to its
retro's stop-and-asks (g) and (h), 2026-10-15* — both measured as fact 7, and both decided below
(decisions 8 and 9): **`residentGroups` handed on AS DECLARED on the document road** (W159's conformity
F3, adequacy F7), and **`messages.flushIntervalMs` above 2^31-1**, which `setTimeout` clamps to 1 ms
(W159's adequacy F9) — **BOUND it in `poolSpecProblem`**; whether a scheduler want remains is (f).

## Answered here, not built

| # | ask | answer |
|---|---|---|
| **#5** | add node types to a running runtime | **Declined** — decision 1; `runtime.check` (decision 2) and #6 (decision 3) are what make a running runtime take any flow its registry can run |
| **#15** | a published JSON Schema for `FlowDefinition` | **Deferred, revisit before the app's M4.** Only a SHAPE schema is expressible — the cross-node `FD-V` rules are not JSON Schema — so `validateDefinition` stays the authority; #20's `description` is what makes a later shape schema useful to an agent |
| **#17** | per-key rate limits from a flow | **The FEATURE is deferred** with [Q248](../questions/q248.md), whose trigger is met. **The suspicion was MEASURED and is a DEFECT** (fact 1): every task on a document-declared `KeyedRateLimitGroup` throws in `addTask`, so the plan fixes the REFUSAL — stop-and-ask (c) — and builds no key derivation |

## Facts measured at this declaration

On `da18320`, the scheduler read at the pin from `node_modules/fyflow-scheduler` and nowhere else.
Each fact's command is a script run in the byte copy under node 24.20.0 and, where stated, deno 2.9.6.

**Fact 1 — #17: a document-declared `KeyedRateLimitGroup` that a node uses makes `addTask` THROW, and
no refusal before it says so.** `BUILT_IN_GROUP_FACTORIES.KeyedRateLimitGroup` builds
`new KeyedRateLimitGroup(windows, { id: key })` with no `keyFrom` (`src/scheduler/runtime.ts:123`);
nothing in `src/` sets `limitKey`; and the scheduler's `_resolveResourceKeys` throws *Missing limit key
for group "api" on task "…". Set task.limitKey, or give the group a keyFrom that derives one* for any
keyed group a task belongs to with no key (`dist/node/index.js:2463-2475`). **Measured, identical in node
and deno**, on a registry with one worker, one node type and a group `api` of type `KeyedRateLimitGroup`:

| road | what happened |
|---|---|
| the TYPE's pool names `api` (`groups: ['api']`), entry node | `createRuntime` ACCEPTED it; `start` THREW the scheduler's bare `Error` above — the run id spent (`runtime.ts:695`), its driver released (`:699-705`) |
| the NODE names `api` in `workerGroups`, entry node | the same throw from `start` |
| the keyed node is the SECOND node | `start` returned; `done` settled **`stopped`**, `stoppedBy` the same message, `onRunFailure` called once — the halt `failRun` makes of a throw inside a settlement (`driver.ts:1658-1663`'s other road) |
| control: a `RateLimitGroup` in its place | `done` `completed` |
| the consumer's `createTask` returns `new FyflowTask({ ...c, limitKey: 'tenant-a' })` | `done` `completed`, the group's active keys `["tenant-a"]` — **the one road that works today**, and the scheduler's own message names the other: a group with a `keyFrom`, which a CODE group type (`code.groupTypes`) can build |

**No rung ever ran a task through one**: the only test that declares a document keyed group,
`test/scheduler/runtime.test.ts:253-264`, builds it behind the pool and scheduler seams and dispatches
nothing.

**Fact 2 — #6: a language reaches a pool only through the flows given at construction, and loading every
registered engine into every pool costs a THREAD, not a bundle.** `bootstrap` writes a language's worker
URL into a type's pool config only for a type some node of which transforms in some flow it is given
(`src/scheduler/bootstrap.ts:174-196`, `transformLanguagesByType` `:106-119`); `createRuntime` passes
`options.flows` to it (`runtime.ts:475-479`) and holds every later `start` to the same reading, refusing
`LanguageNotBuilt` (`:514`, `:569-587`). A code adapter the document does not name is already refused
(`:403-412`). The surface that depends on it: `RuntimeOptions.flows` (`:153-157`), `BootstrapOptions.flows`,
`LanguageNotBuilt` and `transformLanguagesByType`, all exported (`src/scheduler/index.ts:8`, `:10`); nine
`createRuntime(…, { flows })` and two `bootstrap(…, { flows })` snippets in `AGENTS.md`, one in
`README.md` (`:259`); four `createRuntime` sites in `examples/l6.ts` (`:9202`, `:9385`, `:9488`, `:9502`)
and one L6 cross-row clause that reads `transformLanguagesByType` (`:10551`); four in
`examples/settlement-cost.ts`; L1 cases asserting ADR 0051 rule 4 at `test/scheduler/bootstrap.test.ts:338`,
`:351`, `:442` and `test/scheduler/runtime.test.ts:528`, `:540`. **The cost, re-priced**:

| measured | value |
|---|---|
| the adapter with the engine, esbuild, platform browser, unminified | **243 861 bytes** — ADR 0051 consequence 5's *242 KB* is this unminified figure (P17 fact 9) |
| the same, minified / minified and gzipped | **84 264** / **26 893 bytes** |
| the adapter with the engine EXTERNAL, minified | 1 198 bytes |
| one node worker THREAD importing the worker half and evaluating `$`, median of 7 | **40.6 ms and 6 087 KiB of heap**, against 0.0 ms and 93 KiB for a thread importing nothing |

**What the bundle row does NOT mean**: registering a language already loads the engine in the main realm
— `src/jsonata/index.ts:44` imports it beside the registry half (`:162`), which `new Driver` calls — so
decision 3 adds NO bytes to a consumer's bundle. It adds the THREAD row once per worker of every typed
pool that never transforms. An inline pool's cost and a browser Web Worker's were not measured: W162's.

**Fact 3 — #20: the four annotations touch one list, one spec table, four assertions, and no value
check.** `SCHEMA_KEYWORDS` is thirteen (`src/definition/schema.ts:65-69`); `schemaProblem` refuses any
other key by name (`:93-98`); the module comment states the annotations' refusal (`:25-26`). The spec's
table is `spec/flow-definition.md:1751-1780`, opened by *"the thirteen keywords below"* (`:1753`). Bound
to it both ways with a COUNT of 13 at `test/definition/schema.test.ts:60-71`; the refusal assertions that
name two of the four are `:134-140` (`OUTSIDE` carries `description` and `title`) and `:285-290` (the
annotation loop carries `description`, `title`, `default`, `$comment`, `example`); and
`test/definition/assist.test.ts:58-67` binds every keyword to one of three treatments by `pathsOf`,
both ways. **No value check reads an unknown key**: `findings` has a clause per keyword it knows and
none else (`schema.ts:179-219`), and the wiring relation `fits` reads named keywords only
(`src/definition/wiring.ts:161-180`). The app's `withoutWriteOnly` walks `properties`, `items` and
`additionalProperties` (its `runtime.ts:33-44`).

**Fact 4 — #7: `SampleSource` has two values, one producer, and two places that AGGREGATE it as if it
could only have two; and an ENTRY node gets no verdict at all.** `SampleSource = 'example' | 'witness'`
(`src/definition/witness.ts:59`), exported from the root (`index.ts:10`); `sampleOf` is its only
producer (`:66-71`), called once (`wiring.ts:545`); `wiring.ts:664` and `:712-718` compute a region's
source as `'example'` when every branch's is, else `'witness'`. `tryTransform(registry, flow, nodeId,
transform, options)` (`src/definition/assist.ts:155-171`) re-runs `checkWiring` and filters its verdicts
by consumer; its `options` is `WiringOptions`, whose one member is `workerHalf` (`wiring.ts:755-764`).
**Measured**, a two-task flow `a` → `b` with one worker declaring both schemas and an output example:
`tryTransform` on **`b`** returned one verdict, `shape: 'edge'`, `producer: 'a'`, `source: 'example'`,
`transform-passes`; on the entry node **`a`** it returned **`[]`** — no arc arrives there, so there is
nothing to sample, and the app's editor cannot try a transform on the first node of a flow.

**Fact 5 — #19: a named pool instance may say only `type` and `config`, and the document road hands
every instance its type's pool options.** `INSTANCE_KEYS = ['type', 'config']`
(`src/definition/registry.ts:132`) is SHARED by pool instances (`:557`, whose comment records an inert
`maxThreads` on an instance refused as `UndeclaredKey`) and group instances (`:621`); `PoolInstance` is
`{ type, config? }` (`src/definition/types.ts:415-420`). The identity derivation spreads the type's
declared `pool` into every instance's spec (`registry.ts:177-201`), and `bootstrap` derives a named
instance from `inst.config` alone (`bootstrap.ts:150-163`). `DECLARED_POOL_KEYS` is `maxThreads`,
`maxConcurrentTasks`, `idleTimeout`, `residentGroups`, `cancelGraceMs`, `messages` (`registry.ts:126`,
`:130`). **At the pin `WorkerManagerOptions` has three more** — `idleCheckIntervalMs`,
`requeueFailedTasks`, `maxWorkerRestarts` (`dist/types/core/workerManager.d.ts:61`, `:105`, `:107`) —
**read with no validation** (`dist/node/index.js:1581`, `:1586-1587`): the first feeds a `setInterval`
(`:2035-2037`), and the second decides whether a dead worker's tasks are requeued or failed
(`:1889-1900`), which is the road ADR 0051's F1 hang runs on.

**Fact 6 — what `start` refuses today, and where; and one refusal that is not the flow's.** In the
order `start` meets them: **(i)** `LanguageNotBuilt` (`runtime.ts:569-587`) — the flow's, and gone with
decision 3; **(ii)** `RunIdInUse` (`:588-593`) — the run's; **(iii)** in `new Driver`, `ID-R2` on the run
id (`driver.ts:1303`), `FD-V30` on `defaultRetryPolicy` (`:1310-1315`) and on each type's policy
(`:1325-1331`), `FD-V31` on a type's groups (`:1332-1340`), `checkRegistry` (`:1347`), `FD-V36` on a
language with no `compile` (`:1358-1363`), then **`validateDefinition`'s findings** thrown as one
`InvalidDefinition` (`:1364-1386`) and a gate's route set (`:1403` on); **(iv)** in `driver.start`, the
payload's clone and `FD-R4` — the payload's; **(v)** a throw from `addTask`, fact 1's. Of (iii), every
check but `validateDefinition` and the routes reads the REGISTRY, which `resolveRegistry` already held
at `createRuntime` (a language's `compile`: `registry.ts:735`) — **except `defaultRetryPolicy`, a
`RuntimeOptions` member `createRuntime` forwards unread. Measured**: `createRuntime(…, { defaultRetryPolicy:
'nonsense' })` ACCEPTED it, and `start` threw `FD-V30` twice in a row, on every flow.

**Fact 7 — P33's two hand-offs, re-taken.** **`residentGroups`**: on a declaration
`{ pool: { idleTimeout: 1000, residentGroups: ['gpu'], messages: { maxBuffered: 4 } }, groups: ['g'] }`,
`nodeTypeFromDeclaration(…).pool()` returned the DECLARED `residentGroups` array — `===` the
declaration's, and one object shared by two instances — while `messages` and `groups` were copies
(`registry.ts:189-196`). **`flushIntervalMs`**: the scheduler checks it finite and `> 0` only
(`dist/node/index.js:743-744`) and arms `setTimeout(flushIntervalMs - elapsed)` (`:864-867`);
`poolSpecProblem` admits the same (`registry.ts:260-262`). Measured in node and in deno: a delay of
2^31 and of 1e300 fired at once with a `TimeoutOverflowWarning` (*"Timeout duration was set to 1"*),
and 2^31-1 had not fired at 200 ms. **The scheduler already knows the bound**: `MAX_TIMER_MS = 2 ** 31
- 1` (`:1387`), and a cancel's grace timer is not armed above it (`:1684`) — it is applied to grace and
not to the flush interval.

**Fact 8 — decision 1's constraint holds at the pin.** `FyflowScheduler` takes its pools and groups in
its constructor (`dist/types/core/FyflowScheduler.d.ts:276`) and subscribes to them there, once
(`dist/node/index.js:2388-2389`); it has no method that adds a pool or a group. `workerPools` is a public
field (`.d.ts:230`), so a caller could assign into it, and the pool would have no listener — not a road.

## Scope

**In** — `runtime.check`; languages from the registry (#6) and what goes with `flows` (a); the #17
refusal (c) and the one flow-independent `start` refusal (b); the four annotations (#20); `'given'`
samples (#7, (d)); pool options per named instance (#19, (e)); `residentGroups` copied and
`flushIntervalMs` bounded (P33's hand-offs); the specs, the ADRs, `AGENTS.md`; the exit artifact at L6 in
both runtimes.

**Out** — `runtime.register` (#5); a `FlowDefinition` JSON Schema (#15); a key DERIVATION for a keyed
group (#17's feature, [Q248](../questions/q248.md)); shared resource groups across runtimes; the three
unvalidated pool options of fact 5 unless (e) admits them; P34's run control. **While two runtimes
overlap after a rebuild**, their pools and resource groups are separate: a rate limit may briefly be
exceeded and a model loaded in `setup()` is loaded twice — a consequence of decision 1, recorded in
ADR 0096 and `AGENTS.md`, not built.

## Decisions taken at this declaration

*Each follows from a decision above or a precedent named beside it; the ones the facts newly forced are
the stop-and-asks below, ANSWERED 2026-10-15, all as recommended — so each recommended column is now a
decision of this plan, and the items build it.*

7. **#17's fix is a REFUSAL, by name and before a driver exists**, never a key derivation (Q248's) —
   decision 5 and fact 1. Its shape is (c).
8. **`residentGroups` is COPIED on the document road**, as `messages` and `groups` are (W159's
   precedent, `registry.ts:190-196`) — made in W165, which rewrites that derivation for #19.
9. **`messages.flushIntervalMs` is bounded at 2^31-1 in `poolSpecProblem`** — P33 stop-and-ask (g)'s
   answer, and the bound is the scheduler's own `MAX_TIMER_MS` (fact 7). Whether `doc/scheduler-upstream.md`
   gains an entry is (f). **And #19's per-instance options pass through `derivePool`'s one check** — ADR
   0054 decision 2's *both outputs pass through one check*, unchanged.
10. **Each changed public surface is stated BREAKING where it changes** — P33 decision 7's precedent:
    `SampleSource` widened (#7); whatever (a) removes. All ship in orchestration 0.8.0, published once
    after the last of P34-P37.
11. **The decisions go to four ADRs**: **ADR 0096** — a runtime is its registry: decisions 1-3, the
    languages and `runtime.check`, reversing ADR 0051 rule 4 and resolving
    [Q285](../questions/q285.md); **ADR 0097** — what `start` refuses that the flow does not decide, (b)
    and (c); **ADR 0098** — the four annotations, decision 4; **ADR 0099** — pool options on a named
    instance, amending ADR 0054 decisions 2-3. **`spec/flow-definition.md` takes the versions** —
    section 3's registry subsection, *The schema subset*, *What the schemas buy an author* — with
    `spec/README.md`'s row moving each time.

### Stop-and-asks — ANSWERED by the maintainer, 2026-10-15

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | decision 3 leaves `createRuntime`'s `flows`, `bootstrap`'s `flows`, `LanguageNotBuilt` and `transformLanguagesByType` with nothing to do (fact 2) | **yes — answered** — **REMOVE all four in 0.8.0** — a caller passing `flows` fails to COMPILE, which is what tells the app to delete `languageWarmupFlows`; `runtime.check` is the one early validation, called by name | **keep `flows` as early validation**: `createRuntime` runs `check` on each and throws the first finding — two roads to one check, and the app's warm-up flows keep passing silently. **Keep `flows` accepted and ignored**: no compile error, and an option that does nothing is the silent kind |
| **(b)** | what `runtime.check(flow)` returns, and the one refusal no flow causes (fact 6) | **yes — answered** — **`check(flow): Finding[]`, never throwing for a flow's defect: the findings `start(flow, payload, {})` would refuse that depend on the FLOW and the runtime alone** — `validateDefinition`'s against `runtime.registry`, and (c)'s — and **`start` builds its refusal from the SAME call**, so the two cannot disagree. Excluded and named: the payload's (`FD-R4`, the clone) and the run id's (`ID-R2`, `RunIdInUse`). **And `createRuntime` holds `defaultRetryPolicy` to `FD-V30` at construction** — a rule-6 fix, one line | **`check` returns `FD-V30` on every flow** — a runtime defect reported against each flow, as `start` does today. **`check(flow, payload?)`** — adds `FD-R4`; a second parameter for the one check a UI cannot run without a run |
| **(c)** | the shape of #17's refusal (fact 1) | **yes — answered** — **A — refuse at `check` and at `start`, before any driver is built, a flow a node of which reaches a group built by the BUILT-IN `KeyedRateLimitGroup` factory — through its type's pool or its `workerGroups` — when `start` was given no `createTask`**; `check` reads as `start` with none, so it reports it. A named `RuntimeError` naming the node, the group, both working roads (a `createTask` setting `limitKey`; a code group type with a `keyFrom`) and [Q248](../questions/q248.md); no run id spent. A `createTask` that sets no key still meets the scheduler's throw, the consumer's factory's to own | **B — remove `KeyedRateLimitGroup` from the document's built-in group types**: a document naming it is `GroupTypeMissing` at `createRuntime`; simplest, and closes fact 1's working `createTask` road for a DOCUMENT group, which Q248's future key derivation would reopen. **C — document it, change nothing**: the throw stays bare and late, and an entry node still spends a run id |
| **(d)** | what a `'given'` sample is (fact 4) | **yes — answered** — **What the node RECEIVES — `$` — evaluated ONCE: `tryTransform(…, { input })` returns ONE verdict whatever the node's arcs, the ENTRY node included, `sample.source: 'given'`**, findings against the consumer's `inputSchema` and the compile error as today; `WiringShape` gains `'given'` and `producer` is absent on it — both stated BREAKING (decision 10). Never reaches the two-valued aggregations of fact 4 | **The PRODUCER's side**: the given value replaces each arc's sample, one verdict per arc, as today — the entry node still returns `[]`, and the aggregations at `wiring.ts:664` and `:712-718` would report a given value as `'witness'` unless widened |
| **(e)** | #19 on a CLASS type's instance, and the three pool options fact 5 found admitted by nobody | **yes — answered** — **An instance's `pool` options are admitted on an instance of a DOCUMENT type only**, merged shallowly over the type's declared ones and copied (decision 8); **refused** on an instance of a class type, which already receives the instance key (`pool(config, key)`) and owns how its pool is built (ADR 0054 decision 2). **The three are NOT admitted**: the app's need is threads, concurrency and idle time, and `requeueFailedTasks` reaches the worker-death road no rung here exercises | **Merge over the derivation's OUTPUT for both forms**: one rule, and an instance can override what a class computed from its config (a resident cost from a model size). **Admit the three**, held to bounds of our own — `idleCheckIntervalMs` finite in `(0, 2^31-1]`, the other two by type — and an L6 row on a dead worker |
| **(f)** | does fact 7's flush interval become a `doc/scheduler-upstream.md` entry, now that we bound it ourselves? | **yes — answered** — **S11, NOT RAISED, on S10's form, written by W165**: the scheduler bounds a grace timer at its own `MAX_TIMER_MS` and not the flush interval, which any direct consumer meets; what we do without it is decision 9's bound. P34's `graceMs: 0` entry, if it reproduces, takes the next id | **No entry**: the bound is ours alone, and the inconsistency is recorded only in this file — CLAUDE.md's *a wish for `fyflow-scheduler` goes in `doc/scheduler-upstream.md`* unmet |

**The answer, as given**: *"as recommended"*, to all six, 2026-10-15. So, as decisions of this plan:
**(a)** `createRuntime`'s and `bootstrap`'s `flows`, `LanguageNotBuilt` and `transformLanguagesByType` are
REMOVED in 0.8.0 (W162); **(b)** `runtime.check(flow)` returns `Finding[]` from the same call `start`
refuses from, the payload's and the run id's refusals excluded by name, and `createRuntime` holds
`defaultRetryPolicy` to `FD-V30` at construction (W162, W163); **(c)** option A — a named `RuntimeError`
before any driver is built, unless `start` was given a `createTask` (W163); **(d)** `'given'` is what the
node receives, evaluated once — one verdict, `source: 'given'`, `WiringShape` widened and stated BREAKING
(W166); **(e)** instance `pool` options on an instance of a document type only, merged over the type's and
copied, an instance of a class type refused, and the three options of fact 5 not admitted (W165); **(f)**
S11, NOT RAISED, on S10's form, written by W165 — the id reserved by this plan.

## Work items

**The two sentences P33's retro adopted for THIS declaration** (P33 Retro section 8, (f), B′ and C),
copied as that retro directs:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a
  module, a snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its
  `Owns` — and, where the change adds or removes an executed snippet or moves the size of an always-read
  document, the self-test that reads that floor (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and
  its confirming gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items,
  on the final tree.*

**And D, the census sites, applied in the `Owns` column rather than left to exceptions** — P33's sixteen
asks were all of this kind. Each row names the sites its kind of change moves: a new suite →
`test/definition/l4-corpus.test.ts` (`LATE_SUITES`); a spec version → `spec/README.md`'s row; an L6
assertion or run → `examples/README.md`'s `X10` copies; an executed snippet → `scripts/check-docs.mjs`'s
`RUN_FLOOR`; a fact `AGENTS.md` states → **the whole of `AGENTS.md`**. **No item edits `src/driver/**`,
so neither `DRIVER_FIELDS` ratchet (`examples/l6.ts`, `test/driver/retention.test.ts`) is in any row**; an
item that finds it must move one stops and asks. **No item edits an always-read document** (`CLAUDE.md`,
`doc/workflow.md`, `doc/concept.md`, measured by `check:budget`), so B′'s `check:budget:selftest` clause
binds none; its `check:docs:selftest` clause binds every row whose `AGENTS.md` change adds or removes a
`run` snippet.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W162 | **A runtime's languages are its registry's, and `runtime.check`** — ADR 0096; every typed pool carries every registered language; (a)'s removals; `check(flow)` per (b), and `start` refusing from it; `runtime.register` added to `AGENTS.md` section 11; [Q285](../questions/q285.md)'s answer | `src/scheduler/runtime.ts`, `src/scheduler/bootstrap.ts`, `src/scheduler/index.ts`, `spec/flow-definition.md`, `spec/README.md`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (fact 2's four sites and its `:10551` clause), `examples/run-flow.ts`, `examples/settlement-cost.ts`, `examples/README.md`, `scripts/check-docs.mjs`, `AGENTS.md`, `README.md`, `doc/decisions/0096-*` | — | `gate:item`; L1 every pool of every typed type carries exactly the registry's languages, compared both ways with `registry.languages`, and a registry with none builds P18 fact 5's pool options unmoved; `check` equal to `start`'s refusal on every invalid flow of the corpus; L6 the re-cut language clause; the thread and inline cost of fact 2 re-taken and recorded |
| W163 | **What `start` refuses that the flow does not decide** — ADR 0097; (c)'s keyed-group refusal in `check` and `start`; (b)'s `defaultRetryPolicy` at `createRuntime` | `src/scheduler/runtime.ts`, `spec/flow-definition.md`, `spec/README.md`, `test/scheduler/runtime.test.ts`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts`, `examples/README.md`, `scripts/check-docs.mjs`, `AGENTS.md`, `doc/decisions/0097-*` | W162 | `gate:item`; L1 each of fact 1's roads refused by name before a driver exists, no run id spent, and the `createTask` road green; `defaultRetryPolicy` refused at construction; L6 fact 1's `createTask` road on a real keyed group |
| W164 | **Four annotations in the schema subset** — ADR 0098; decision 4 | `src/definition/schema.ts`, `spec/flow-definition.md`, `spec/README.md`, `test/definition/schema.test.ts`, `test/definition/assist.test.ts`, `test/definition/l4-corpus.test.ts`, `scripts/check-docs.mjs`, `AGENTS.md`, `doc/decisions/0098-*` | W163 | `gate:item`; L1 each of the four admitted at the top, under `properties` and under `items`, each refused on a wrong value shape, each read by no value check; the six still refused by name; the spec's table and `SCHEMA_KEYWORDS` both ways |
| W165 | **Pool options on a named pool instance** — ADR 0099; (e)'s answer; decisions 8 and 9; S11 per (f) | `src/definition/registry.ts`, `src/definition/types.ts`, `src/scheduler/bootstrap.ts`, `spec/flow-definition.md`, `spec/README.md`, `test/definition/registry.test.ts`, `test/scheduler/bootstrap.test.ts`, `test/definition/l4-corpus.test.ts`, `scripts/check-docs.mjs`, `AGENTS.md`, `doc/scheduler-upstream.md` (S11 only), `doc/decisions/0099-*` | W164 | `gate:item`; L1 each `DECLARED_POOL_KEYS` member overridden per instance and held to `poolSpecProblem`; a group instance still refusing every pool key; `residentGroups` not `===` the declaration's; `flushIntervalMs` 2^31-1 admitted and 2^31 refused; P18 fact 5's captures unmoved |
| W166 | **A sample the caller gives** — `'given'` per (d) | `src/definition/witness.ts`, `src/definition/wiring.ts`, `src/definition/assist.ts`, `spec/flow-definition.md`, `spec/README.md`, `test/definition/assist.test.ts`, `test/definition/wiring.test.ts`, `test/definition/l4-corpus.test.ts`, `scripts/check-docs.mjs`, `AGENTS.md` | W165 | `gate:item`; L1 a given input on fact 4's entry node and on its inner node — the value, the findings against `inputSchema`, a compile error — and a given value never reported `'example'` or `'witness'` |
| W167 | **The exit artifact** — the header's seven clauses, on real workers | `examples/l6.ts`, `examples/flows/**`, `examples/workers/**`, `examples/README.md` | W166 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W168 | *reserved, expected unused* | | | |

**Every row shares `spec/flow-definition.md`, `spec/README.md`, `AGENTS.md` and `scripts/check-docs.mjs`
with every other, so the six are SERIAL in the order above, never concurrent** (`doc/workflow.md`
section 7 rule 2) — each declares the overlap with its predecessor rather than an exception, because the
files are in its row. **No row starts before (a)-(f) are answered**, and an item whose answer moves its
row rewrites the row's `Owns` at its declaration step, by B′, from this table. Each item's file is
written at its declaration step; this table is an index, not the declaration.

**Questions reserved per item**, so no two take one: W162 Q615-Q618, W163 Q619-Q622, W164 Q623-Q625,
W165 Q626-Q629, W166 Q630-Q632, W167 Q633-Q634.

## Predictions, written before the items that test them

1. **W162 is LOUD at exactly the sites that assert ADR 0051 rule 4, and nowhere else**: fact 2's five
   L1 cases and its one L6 clause (`examples/l6.ts:10551`) go red on the change, and no case whose
   registry gives no languages moves — P18 fact 5's captured pool options among them.
2. **`check` and `start` never disagree on the corpus** — every invalid flow under `spec/examples/`
   yields the same rule ids from both, because both read one `validateDefinition` call; a disagreement
   is a defect in W162, not a finding about the corpus.
3. **#17's refusal moves NO existing assertion** — fact 1: no rung dispatches a task through a document
   keyed group, and `test/scheduler/runtime.test.ts:253-264`'s registry declares one with no flow.
4. **W164 moves exactly fact 3's four assertion sites** — the count of 13, the `OUTSIDE` list, the
   annotation loop and `pathsOf`'s membership — and no L2-L6 assertion: an annotation reaches no value
   check.
5. **W165 moves no pool option a registry without instance options already builds** — P18 fact 5's two
   captures stay byte-identical, and the `residentGroups` copy breaks no assertion, since none compares
   identity.
6. **Widening `SampleSource` is LOUD nowhere in `src/`** — nothing switches on it exhaustively — and,
   under (d)'s recommended answer, never reaches fact 4's two aggregations; under the alternative it
   reaches both, silently.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q285](../questions/q285.md) | which pools carry a language — reopened by decision 3, answered by ADR 0096 | P37 (W162) |
| [Q248](../questions/q248.md) | per-key limits from a flow — #17's FEATURE; fact 1 measured the defect, which (c) fixes without it | deferred |

## Record

*Filled in at the join, after the work items are merged.*
