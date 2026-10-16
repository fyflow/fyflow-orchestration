# P37 — A runtime is its registry

**Status:** complete and retro'd 2026-10-16 — declared 2026-10-15 on `da18320`, from the draft carrying the maintainer's decisions of 2026-10-14/15; facts 1-8 measured at this declaration; stop-and-asks (a)-(f) ANSWERED by the maintainer 2026-10-15, all as recommended; W162-W167 done 2026-10-15/16; the exit artifact measured on the final tree (Record below); the retro ran 2026-10-16 over `a02087f`, and the maintainer answered its stop-and-asks (g)-(l) the same day, all as recommended (Retro section 8)
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
| [Q285](../questions/q285.md) | which pools carry a language — reopened by decision 3, **resolved by ADR 0096** (W162) | — |
| [Q248](../questions/q248.md) | per-key limits from a flow — #17's FEATURE; fact 1 measured the defect, which (c) fixes without it (ADR 0097's `FD-R6`); its `note` brought up to date at this record step | deferred |
| [Q619](../questions/q619.md) | a built-in keyed group held only as RESIDENT is not `FD-R6`, and counts every worker in one `""` bucket — raised by W163 | open — **P34**, option B, one row of its declaration (Retro (i)) |
| [Q626](../questions/q626.md) | a named instance of `Transform` may now hold a resident group — raised by W165 | **resolved** — accepted as stated, ADR 0099 consequence 5 (Retro (h)) |
| [Q633](../questions/q633.md) | DEFECT: `FD-R4` holds a transforming entry's payload BEFORE its transform, opposite to `tryTransform`'s `given` verdict — raised by W167 | open — **P34**, before 0.8.0 is published (Retro (g)) |

## Record

*Written 2026-10-16 over `a02087f`, the tree clean before it. Every figure is read from the six items' own files; none
is re-measured here. Ids are bare text, as in P33's Record.*

**W162 — done 2026-10-15** (`9769e45`). Its own Record covers the declaration step (M1-M9), both readers and the gate.

- **Built**: ADR 0096 (superseding ADR 0051 rule 4; amending ADR 0022 rule 3 for the runtime road and ADR 0075 in
  part); `bootstrap` writes EVERY registered language into EVERY pool it builds, a copy per pool; `Runtime.check(flow):
  Finding[]` against a registry derived once at `createRuntime`, and `start`/`resume` refusing from that same call
  before a run id is minted; **(a)'s four removals**, each stated BREAKING — `RuntimeOptions.flows`,
  `BootstrapOptions.flows`, `LanguageNotBuilt`, `transformLanguagesByType`. spec/flow-definition **v0.34**; `AGENTS.md`
  sections 9, 11 (`runtime.register` declined), 12, 14, 15, mirrored in `README.md`.
- **Fact 2's cost, re-taken** (M4): **22.5 ms and 6 524 KiB of heap per node worker thread** (P37: 40.6 ms / 6 087 KiB,
  another load of the machine); inline **0.018 ms**; L6 wall unmoved over 173 runs. A browser Web Worker NOT measured.
- **Closed: Q285**, resolved by ADR 0096. **Raised: none.** Q615-Q618 unused.
- **Exceptions E1** (`src/scheduler/envelope-worker.ts`, three passages stating the superseded rule) **and E2** (the two
  publish smokes passing `flows`) YES at the declaration step; **E3** (`examples/retention.ts`'s four calls) YES after
  the readers.
- **The readers**: conformity F1-F7, adequacy F1-F7, no code defect. **Overlap: ONE shared subject** — `start`'s
  refusal order against `ID-R2` and `RunIdInUse`, neither stated nor tested — the ninety-fourth measurement.
- **Counts**: L1-L5 → **62 / 1695** in node, deno and chromium; L6 **2640 / 173** unmoved (three clauses re-cut in place);
  `check:spec` **7 / 75 / 134** unmoved.
- **The confirming gate**: **`gate:item` EXIT 0** on the final tree, the first run, 850.1 s self-test wall.

**W163 — done 2026-10-15** (`60c3df6`). Its own Record covers the declaration step, 23 author provocations and both
readers.

- **Built**: ADR 0097 (amending ADR 0096 rules 4 and 5); **`FD-R6`** — a task node REACHING a group the built-in
  `KeyedRateLimitGroup` factory built, through its `workerGroups` or its pool's derived `groups`, reported by `check` and
  thrown by `start`/`resume` as **`LimitKeyMissing`** when no `createTask` is given, after the `InvalidDefinition`
  findings and before a run id or a driver; `createRuntime` holds `defaultRetryPolicy` to `FD-V30` FIRST, at
  construction. spec/flow-definition **v0.35**; `AGENTS.md` sections 3, 9, 11, 12.
- **Stop-and-ask S1 = A**: `FD-R6` is a spec rule id, not a class name. **And the maintainer CONFIRMED** no upstream
  entry: the scheduler's throw is right for a keyed limit with no key; the gap is ours (Q248).
- **Closed: none. Raised: Q619** (a built-in keyed group held as RESIDENT, measured silent in one `""` bucket), owner P37.
  Q620-Q622 unused.
- **Exceptions E1** (`src/scheduler/index.ts`, the export) **and E2** (`src/definition/types.ts`, a comment), YES at the
  declaration step.
- **The readers**: conformity F1-F7 and observation 8, adequacy F1-F4, no code defect. **Overlap: ONE shared subject** —
  `FD-R6`'s detail text — the ninety-fifth measurement.
- **Counts**: L1-L5 → **62 / 1708** in all three; L6 → **2646 / 174** in node and deno (the keyed block, one run);
  `check:spec` → **7 / 75 / 135** (`FD-R6`).
- **The confirming gate**: **`gate:item` EXIT 0** on the final tree, the first run, 1212.5 s self-test wall.

**W164 — done 2026-10-16** (`eeea984`). Its own Record covers the declaration step, 48 provocations and both readers.

- **Built**: ADR 0098 (superseding ADR 0053 in part and ADR 0056 in part; amending ADR 0053 rule 2); `title`,
  `description` (a string), `readOnly`, `writeOnly` (a boolean) join `SCHEMA_KEYWORDS`, value shape checked at every
  depth, read by NO value check, **no redaction promised**; `deprecated`, `$comment`, `default`, `format`, `$schema`,
  `$id` still refused by name. spec/flow-definition **v0.36**; `AGENTS.md` sections 11 and 13.
- **Stop-and-ask S1 — four stale *thirteen keywords* sentences outside `Owns`** (`src/driver/driver.ts:2140`,
  `test/driver/result-schema.test.ts:62` and `:309`, `spec/outcome-record.md`'s `OR-R13` row) **ANSWERED *leave and
  record***; a fifth incomplete sentence, `src/definition/wiring.ts:155`, recorded beside them. Handed on below.
- **Closed: none. Raised: none.** Q623-Q625 unused.
- **Exceptions: none.**
- **The readers**: conformity F1-F8, adequacy F1-F9, no code defect — **18 of the adequacy reader's 23 independent
  mutations survived** the build's set (*constrains nothing* barely pinned); 19 cases added, **48 of 48** killed on the
  re-run. **Overlap: TWO shared subjects**, the ninety-sixth measurement.
- **Counts**: L1-L5 → **62 / 1718** in all three; L6 **2646 / 174** unmoved; `check:spec` **7 / 75 / 135** unmoved.
- **The confirming gate**: **`gate:item` EXIT 0** on the final tree, the first run, 872.5 s self-test wall.

**W165 — done 2026-10-16** (`da08a1f`). Its own Record covers the declaration step, 32 provocations and both readers.

- **Built**: ADR 0099 (amending ADR 0054 decisions 2 and 3); a named instance of a DOCUMENT type may declare `pool`,
  merged SHALLOWLY over its type's, copied, held to `poolSpecProblem` on both roads; an instance of a CLASS type refused
  (`UndeclaredKey`); **decision 8** — `residentGroups` copied; **decision 9** — `messages.flushIntervalMs` bounded at
  2^31-1. **S11 written, NOT RAISED** (P37 (f)). spec/flow-definition **v0.37**; `AGENTS.md` sections 13 and 21.
- **Closed: none. Raised: Q626** (a `Transform` instance may now hold a RESIDENT group — W165's reading of (e), against
  ADR 0075 rule 3's note), owner P37's join, recommendation *accept as stated*. Q627-Q629 unused.
- **Exception E1** (`src/scheduler/runtime.ts`, ONE line carrying the instance's `pool` to `bootstrap`), YES before the
  edit; **three touches to `doc/scheduler-upstream.md` beyond S11's section** (the index row and two *S10 is not raised*
  sentences) **accepted as within *S11 only***.
- **The readers**: conformity F1-F9 — **ONE code defect, C-F1** (the remembered declaration was the bare one, not the
  merged), fixed; adequacy 42 mutations, 3 survivors, and **the build's K24 found COMPOUND** (its *28 of 28* overstated).
  **Overlap: TWO shared subjects**, the ninety-seventh measurement.
- **Counts**: L1-L5 → **62 / 1747** in all three; L6 **2646 / 174** unmoved; `check:spec` **7 / 75 / 135** unmoved.
- **The confirming gate**: **`gate:item` EXIT 0** on the final tree, the first run, 870.9 s self-test wall.

**W166 — done 2026-10-16** (`0a7aae3`). Its own Record covers the declaration step, 34 provocations and both readers.

- **Built**: per (d) — `tryTransform(…, { input })` evaluates the transform ONCE on what the node receives and returns
  ONE verdict, shape `given`, no producer, `sample.source: 'given'`, the entry node included; `SampleSource`,
  `WiringShape`/`WIRING_SHAPES` widened and `WiringVerdict.producer` optional, each stated BREAKING; `givenVerdict` and
  `TryTransformOptions` stated as new public surface (C-F1); the two aggregations of fact 4 TYPED over the arc sources,
  so a `given` cannot reach them (`typecheck` holds it). spec/flow-definition **v0.38**; `AGENTS.md` section 15's new
  `run` snippet, `RUN_FLOOR` 36 → 37.
- **Closed: none. Raised: none.** Q630-Q632 unused. No ADR.
- **Exceptions: none.**
- **The readers**: conformity F1-F7, no code defect against the spec; adequacy 26 mutations, 5 survivors, and **three of
  the build's set found COMPOUND** (K8, K9, K10) — after W165's lesson was in this item's brief. **Overlap: ONE shared
  subject** — the given verdict's reason where the consumer side is missing — the ninety-eighth measurement.
- **Counts**: L1-L5 → **62 / 1763** in all three; L6 **2646 / 174** unmoved; `check:spec` **7 / 75 / 135** unmoved;
  `check:docs` → **43 snippets, 37 run**.
- **The confirming gate**: **`gate:item` EXIT 0** on the final tree, the first run, 986.5 s self-test wall.

**W167 — done 2026-10-16** (`a02087f`). Its own Record covers the declaration step, the 24 author provocations in both
lanes and both readers.

- **Built**: ONE cross-row block in `examples/l6.ts`, its registry DOCUMENT and `data:` workers written in the block:
  one runtime from `createRuntime(document, { languages })`, given NO flow; flows A, C, D and B in that order; the
  `format` variant beside it. **18 cross-row assertions over two runs** — 18 declared, one removed at the build as unable
  to fail (M3), one added by the readers (R7).
- **F-1, found while building, outside every P37 `Owns`**: `FD-R4` holds a TRANSFORMING entry's payload to the worker's
  `inputSchema` BEFORE the transform. **The maintainer's answer (2026-10-16): raise it, do not fix it in W167.** Asked why
  not fix it there, the reasons given were: **`start()` is synchronous and a transform's evaluation is asynchronous**, so
  any fix is a SPEC decision among three roads — an async `start` (BREAKING), a transforming entry left unchecked, or a
  separate schema for what the transform receives — and **P37's paragraph D puts `src/driver/**` in no item's row**.
- **Closed: none. Raised: Q633** (DEFECT; owner P37's join or retro to route). Q634 unused; ADR 0100 unused; W168
  unused.
- **Exceptions: none.**
- **The readers**: conformity — all seven exit clauses MET, F1-F4; adequacy 22 one-clause mutations, 16 killed, 6
  survivors, no exit clause broken, A1-A3 and minors; R1-R8 acted on. **Overlap: ZERO shared subjects**, the
  ninety-ninth measurement.
- **Counts**: L1-L5 **62 / 1763** unmoved; L6 → **2664 / 176** in node and deno; `check:spec` **7 / 75 / 135** unmoved.
- **The confirming gate**: **`gate:full` EXIT 0** on the final tree, the first run — 11/11 self-test lanes ok,
  `check:register:selftest` included, 1937.8 s self-test wall; no lane flaked, nothing re-run.

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| on the final tree, ONE cross-row block in `examples/l6.ts`, green in node 24 and in deno | W167's block, **2664 / 176, 0 failed in node 24.20.0 and deno 2.9.6**, in `npm run gate` and in `gate:full` | **met** |
| (1) ONE runtime by `createRuntime` with its registry's `languages` given and NO flow | built so; every pool the scheduler holds — `Intake`, `Shape`, the named `shape-wide`, `Transform` — carries exactly the registry's one language; a `flows` option is a `typecheck:examples` error (probe `pf`) | **met** |
| (2) a run of A, declaring no transform, reaches `done` `completed` first | A under `r1`, terminal, its node `done` | **met** |
| (3) B, never shown, a JSONata transform on a consumer type's node and a second on a NAMED instance declaring its own pool options: `check(B)` `[]`, then `done` `completed`, each transformed node's worker receiving the transformed value | `check(B)` `[]`; B under `r2` — neither refusal spent an id — `completed`; t1's and t2's workers each received their own transformed value, the untransformed entry its payload (the control); t1 on `Shape`, t2 on `shape-wide`, the instance's own `maxThreads` with the type's `idleTimeout` merged under it, and each pool's realm off the scheduler (R5) | **met** |
| (4) for C, `check(C)`'s rule ids equal those of the `InvalidDefinition` `start(C)` throws | equal, and both equal to the hand-written set, compared sorted (R8); the claim *nothing reached the scheduler* REMOVED at the build as unable to fail (M3) | **met** |
| (5) worker schemas carrying `title`, `description`, `readOnly`, `writeOnly` accepted; the same with `format` refused naming it | the four kept as resolved — in `rt.resolved` and in `rt.registry.workers`, which drivers read (R6); `format` `SchemaRefused` naming the keyword and its path (R3) | **met** |
| (6) `tryTransform` given an input on B's ENTRY node returns a verdict whose `source` is `'given'` | ONE verdict, shape `given`, no producer, `transform-passes`, the hand-derived result; control: no input, `[]`; and given `{}`, `transform-fails` naming `$.word required` (R7) | **met** |
| (7) a node reaching a document-declared `KeyedRateLimitGroup` refused by `check` and `start`, before any driver is built | `check(D)` `FD-R6` at the keyed node; `start(D)` `LimitKeyMissing` at it, its message naming the group, both roads and Q248 (R2), nothing reaching the scheduler; *no driver built* is held at L1 by W163 (the scheduler never subscribed to) | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W167, ONE command on the final tree after the readers' items — P37 sentence C | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **62 / 1689 → 62 / 1763** in node, deno and
chromium; L6 **2640 / 173 → 2664 / 176** in node and deno; `check:spec` **7 / 75 / 134 → 7 / 75 / 135**; `check:docs`
**42 / 36 run → 43 / 37 run**; spec/flow-definition **v0.33 → v0.38**.

**What the plan answered.** A running runtime **accepts any flow its registry can run, at any time** — a flow published
after it started included — because a runtime's languages are its REGISTRY's, built into every typed pool (ADR 0096),
and `runtime.check(flow)` returns exactly what `start` would refuse on, from the same call. It **refuses, by name and
before a driver exists, the one thing a flow's registry admits and its run cannot do** — a node reaching a built-in keyed
group with no key to give it (ADR 0097, `FD-R6`). It accepts **annotated schemas** (ADR 0098), **pool options per named
instance** of a document type (ADR 0099), and **a transform tried on a value the caller gives**, the entry node included.
**What it did not do**: add a node type, a pool or a group to a running runtime (declined, #5); derive a key for a keyed
group (Q248); and make `start` agree with `tryTransform` on a transforming ENTRY node — **Q633, a defect on exactly the
road this plan opened**.

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W162 is LOUD at fact 2's five L1 cases and its one L6 clause, and nowhere else | **FALSE in its census, TRUE in its second half** — NINE L1 cases and 68 L6 assertions went red, and the named clause (`:10551`) did not; no registry with no language moved | W162 M3, *What broke* 1: fact 2 counted the sites that NAME the removed functions, not the assertions that HOLD the rule |
| 2 | `check` and `start` never disagree on the corpus | **TRUE** | W162's corpus case, every invalid and valid file |
| 3 | #17's refusal moves NO existing assertion | **TRUE** | W163 M2 |
| 4 | W164 moves exactly fact 3's four assertion sites, and no L2-L6 assertion | **TRUE at L1-L5 and at L6 in node**; one deno L6 red on a row no keyword reaches, green on re-run — [Q599](../questions/q599.md)'s first row | W164 M2 |
| 5 | W165 moves no pool option a registry without instance options builds | **TRUE** | W165 M2 |
| 6 | widening `SampleSource` is LOUD nowhere in `src/`, and never reaches fact 4's aggregations | **TRUE** — and the second half is now held by `typecheck` in the tree (R1), not only by the absence of a road | W166 M2 |

**Questions**: raised **Q619** (W163), **Q626** (W165) and **Q633** (W167), each routed by a stop-and-ask below —
Q619 and Q633 open, owner P34; **Q626 resolved**, accepted as stated; **closed Q285** (W162, by ADR 0096). **Q248**'s `note` brought up to date at this record step (W163's conformity
F7 left it here), and **Q599** a dated note (Retro section 4). `npm run q -- --where status=open` lists **Q580, Q581,
Q605, Q606, Q619, Q633**.

**Handed on**, each with its owner — gathered from the six items' Out sections and the readers' notes:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| `FD-R4` holds a transforming entry's payload before its transform | W167 F-1, conformity F4 | **P34**, before 0.8.0 — Retro (g) | [Q633](../questions/q633.md); [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), by (g) |
| a `Transform` instance may hold a resident group | W165 C-F3 | **accepted as stated** — Retro (h) | [Q626](../questions/q626.md), resolved; ADR 0099 consequence 5 |
| a built-in keyed group held only as RESIDENT, one `""` bucket | W163 C-obs 8 | **P34**, option B — Retro (i) | [Q619](../questions/q619.md); [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), by (i) |
| four stale *thirteen keywords* sentences (`src/driver/driver.ts:2140`, `test/driver/result-schema.test.ts:62`, `:309`, `spec/outcome-record.md`'s `OR-R13`) and `src/definition/wiring.ts:155`'s incomplete one | W164 S1, C-F3, C-F4 | **P34** — Retro (j) | [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), *Constraints*, by (j) |
| the `InvalidDefinition` message FORMATTED twice (`new Driver`, `openRun`) and the definition validated twice on `start` — because `src/driver/**` was no P37 item's | W162 Out | **P34** — Retro (j) | [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), *Constraints*, by (j) |
| `runtime.registry` is a plain object a consumer can mutate after `createRuntime` | W162 C-F7 | no owner — recorded, no surface change named | W162 Out |
| a `Map` passing `isPlainObject` as a `pool`, a function reported *got undefined* — pre-existing on a type's `pool` since v0.19 | W165 C-F9 | no owner — recorded | W165 Out |
| a `run` snippet's `// …` output comments are not executed | W166 A-S1 | no owner — a repo-wide convention | W166 Out |
| a browser Web Worker's cost of loading the engine | W162 M4 | no owner — not measured | W162 Out |
| the cancel roads, the stale comments and `graceMs: 0` handed to P34 by P33 | P33's Record | **P34**, unchanged | [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md) |

## Retro

*Pass 3 ran on 2026-10-16 over `a02087f`, the working tree clean before it, in a subagent at the maintainer's request.
Every figure is read from the six items' Records; this retro re-ran no gate, no harness and no measurement. **The
proposals and the routings were put to the maintainer in section 8, and the answers are recorded there; none moves a
rule in `doc/workflow.md`.***

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader findings | raised / closed |
|---|---|---|---|---|
| P37's declaration | — | (a)-(f), all as recommended | — | — |
| W162 | E1 `envelope-worker.ts`, E2 the two publish smokes, E3 `retention.ts` (after the readers) — YES | — | 14 | — / Q285 |
| W163 | E1 `src/scheduler/index.ts`, E2 `src/definition/types.ts` — YES | S1 = A (`FD-R6` a spec id) | 11 + obs 8 | Q619 / — |
| W164 | — | **S1: four stale sentences outside `Owns` — LEAVE AND RECORD** | 17 | — |
| W165 | E1 one line of `src/scheduler/runtime.ts` — YES; three `scheduler-upstream.md` touches accepted within *S11 only* | — | 9 + 3 | Q626 / — |
| W166 | — | — | 7 + 8 | — |
| W167 | — | F-1: raise Q633, do not fix it in W167 | 4 + 3 and minors | Q633 / — |
| **P37** | **6, 6 YES, 0 NO** | **3, and (a)-(f)** | | **3 raised, 1 closed** |

**Six widenings against P33's sixteen**, in six items against four. **Rule 6's NO branch has still not run on a
widening** — the fifth plan running. **W164's S1 is the first stop-and-ask whose recommendation was NOT to widen**, and
the answer *leave and record* did what rule 6 says a NO does not: it raised nothing. The four sentences have no register
home and no owner — they live in W164's Out alone — which is stop-and-ask (j).

### 2. The `Owns` and the census sites — D held, and the six exceptions are one class

**Paragraph D was FOLLOWED and it worked**: every census site a lane reads — `LATE_SUITES`, `spec/README.md`'s row,
`examples/README.md`'s `X10` copies, `RUN_FLOOR` — was in its row before the item started, and **no exception was a
census site** (P33: twelve of sixteen were). **B′ was FOLLOWED and its self-test clause bound ONCE** — W166 added a `run`
snippet and ran `check:docs:selftest` in the copy (M3, 47/47) — **and all six confirming gates were green on their FIRST
run** (P33: two of four RED first, both on a self-test floor B's copy did not run). **C held in all six.**

**The six exceptions are a different class, and one class:**

| exception | the file | what it is to the changed surface |
|---|---|---|
| W162 E1 | `src/scheduler/envelope-worker.ts` | prose and a message STATING the superseded rule |
| W162 E2 | `scripts/jsr-smoke.ts`, `scripts/pack-smoke.mjs` | CALLERS of the removed option — **typechecked by no lane**, so green either way |
| W162 E3 | `examples/retention.ts` | a CALLER of a helper the row changed |
| W163 E1 | `src/scheduler/index.ts` | the EXPORT LIST of the module the row changed |
| W163 E2 | `src/definition/types.ts` | a comment DESCRIBING the field the row widened |
| W165 E1 | `src/scheduler/runtime.ts` | the CALLER that hands the changed value on — without it the option was silently dropped |

**Each is a READER of the surface its item changed, one hop outside the row** — three items, six occurrences (pass 3
rule 2). **Five were found by B′'s byte copy at the declaration step and one (E3) by the readers; every one before its
edit**, so the refusal ledger's *`Owns` pre-declaration* row's standing ground held again. Proposal D′ (section 6) is the
author's note that would have named them; it is not a rule.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W162 | F1-F7, no defect | F1-F7, no defect | **1** | 94th |
| W163 | F1-F7 and obs 8, no defect | F1-F4, no defect | **1** | 95th |
| W164 | F1-F8, no defect | F1-F9; 18 of 23 mutations survived the build | **2** | 96th |
| W165 | F1-F9, **one code defect (C-F1)** | 42 mutations, 3 survivors; K24 compound | **2** | 97th |
| W166 | F1-F7, no defect against the spec | 26 mutations, 5 survivors; K8-K10 compound | **1** | 98th |
| W167 | F1-F4, seven clauses MET | 22 mutations, 6 survivors, no clause broken | **0** | 99th |

**All six inside the 0-4 band. The ordinal is now NINETY-NINE and the next measurement is the HUNDREDTH**; the band's
*fifty-nine* stays, as P28's-P33's retros held it. **The readers are the mechanism for the ninth plan running**: the one
code defect (W165's remembered declaration) was the conformity reader's; W164's *constrains nothing* was the adequacy
reader's, 18 survivors over the shapes the build's set never quantified; both compound-probe findings were the adequacy
readers'; and Q619 and Q633's sharper form were the conformity readers'.

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) a COMPOUND provocation counted as one kill** — W165's K24 (a swap and a dropped field), W166's K8, K9 and K10 (each two arguments of one call moved in one replacement), so *28 of 28* overstated twice | **FOLLOWED and failed at W166**: W165's Record named the lesson, and *one clause per mutation* was in W166's brief and its declared method (M4) | the adequacy readers, both times | **two occurrences, two items, and the second a rule FOLLOWED — the sharpest finding (pass 3 rule 3). Proposal E** |
| **(b) a fact's census counted the wrong thing** — P37 fact 2 counted the sites that NAME the removed functions; the assertions that HOLD the rule named neither (W162 M3: nine L1 cases and 68 L6 assertions, not five and one) | — the plan's author | **B′'s copy at the declaration step**, before any edit | **No change**: one occurrence, and B′ — running the OLD assertions on the NEW code — is exactly what caught it |
| **(c) a rule's SHAPES left unprovoked** — W164's build broke the list, the shapes and one reader each, and not every constraining keyword, both value checks, the generators or the registry and gate roads | BROKEN — section 5 rule 8 (a)'s v0.16 clause, *and the SHAPES they quantify over* | the adequacy reader | **No change**: the clause exists and names this |
| **(d) a declared claim that could not fail** — W167's *start(C) handed the scheduler nothing* | FOLLOWED section 5 rule 3 and it worked | the author, at the build, asking which edit turns it red | **No change**: the rule worked |
| **(e) stale prose a correct change makes false** — five *thirteen keywords* sentences (W164), three `envelope-worker.ts` passages (W162 E1), the spec's *73 / 8* census figures (W166), Q248's `note` (W163 C-F7) | — | the authors, the readers, this record step | **No change**: the ledger's first row, considered and not proposed (section 7) |
| **(f) Q633 — a defect between two items' semantics**: W166 defined a transform's RESULT as what `inputSchema` holds; `FD-R4` holds the payload BEFORE it | — no item's `Owns` reached `src/driver/**` (paragraph D) | **the exit artifact's author**, composing the plan's features on one runtime | **No rung would have** (pass 3 rule 5): no L2 or L6 case has a transforming ENTRY whose value differs against the schema before and after the transform. Q633's `closes-when` names both rungs |

**Pass 3 rule 5 over P37's defects**, by what caught them: **a rung in `gate`** — the L1 censuses W162's and W165's
copies ran (M2-M3), W141's site census on W165's repeated fragment, `check:register` `R7` on two front-matter spellings
(W162 C-F3, W165 M3), `check:spec` `C5` in W164's copy; **the mutation run's CONTROL** — W163's broken apostrophe literal,
W164's filtered runner; **B′'s copy** — prediction 1's census; **the conformity readers** — the one code defect (W165 C-F1),
observation 8 and Q633's sharper form; **the adequacy readers** — every survivor and both compound counts; **the exit
artifact** — Q633.

**The flaky rows ([Q599](../questions/q599.md)).** **Its first row went red ONCE** — `uncloneable / OR-R6, threaded`, in
deno, at W164's declaration step (M2), green on the immediate re-run; W164 recorded it as *one occurrence, not raised*
without naming Q599. **None in any of the six confirming gates.** A dated note is added to Q599; it stays deferred.

### 5. The scheduler

**S11 is written, NOT RAISED** (P37 (f), W165), and **W163's reading that a keyed group's throw needs no upstream fix
was CONFIRMED by the maintainer** (ADR 0097's Context). **No new observation** — none of the six items found a scheduler
behaviour that is not already an S entry or a fact of `AGENTS.md`.

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule.** D and B′ worked (section 2), C held, every confirming gate was
green on its first run, and the one rule FOLLOWED that failed (section 4 (a)) is caught by the adequacy reader, whose
existing job it is — twice, before either Record was written.

**B′ and C. Recommended, carried UNCHANGED into P34's declaration** — they held in all six items (section 2).

**D′. Recommended, for P34's AUTHOR, not the workflow: D, amended** — *the plan's index row names, for each item, the
census sites its kind of change moves (D's list), **and every file that READS the surface the item changes — found by a
grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`: the module's export list, the caller that
hands the value on, the publish smokes (which no lane typechecks), and the comments and messages that state the rule
being changed**.*
- **Replaces**: D in P34's declaration.
- **Saves**: section 2's six asks — each a maintainer's YES the serial plan waited for.
- **Ledger**: kin to the *`Owns` pre-declaration* row, refused 14 times — **and its ground held again: all six were found
  before their edits.** As a rule or a check it would be that row's fifteenth refusal; this retro does not propose it as
  one.

**E. Recommended, for P34's declaration, not the workflow: the counting sentence** — *a provocation's edit changes ONE
clause; where one replacement moves two (two arguments of a call, a swap and a deletion), the probe is COMPOUND, and a
Record counts it as killing neither clause until each is re-cut alone and killed.*
- **Replaces**: nothing — it amends how a Record states its kill count, which W165 and W166 each over-stated once.
- **Why a counting sentence and not a method rule**: the method was IN W166's brief and failed (section 4 (a)), so
  restating it is the mechanism that already failed; what the two overstatements did harm is the COUNT, and the count is
  what a sentence can bind. W167 followed the brief's *one clause per mutation* and declared its own multi-edit probe
  (`h02`, three edits forming ONE clause) — the form E asks for.
- **As a workflow rule**: a row in section 5 rule 8's table, *on the SET* (v0.31) — about 170 bytes, against
  `doc/workflow.md`'s **182 bytes of headroom** (`check:budget`), before section 7's bookkeeping. Offered as (k)'s
  alternative.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it would be the 33rd refusal, P2-P37.** Section 4 (e) is the
  class. The row's standing ground holds. **No other ledger row is re-raised**; D′ is explicitly not the `Owns` row's
  proposal.

| file | why |
|---|---|
| this plan | the Status line; Q285, Q619, Q626 and Q633 into *Open questions this plan carries*; this Record and Retro |
| `doc/questions/q248.md` | its `note`: the feature still deferred, the refusal built (ADR 0097's `FD-R6`), the resident road Q619 — W163's conformity F7, left to this record step |
| `doc/questions/q599.md` | a dated note: its first row red once in P37, at a declaration step; none in a confirming gate |
| `README.md` | two rows in *More examples*: `runtime.check` (`AGENTS.md` section 12) and a transform tried on a value you give (section 15) |
| `doc/questions/q626.md`, `doc/decisions/0099-*`, `0075-*`, `doc/questions/q457.md` | (h): Q626 resolved; ADR 0099 `resolves: Q626` and consequence 5 rewritten; ADR 0075's W165 note and Q457's `note` say it was accepted |
| `doc/questions/q619.md`, `q633.md` | (i), (g): owner P34, a dated note each |
| P34's draft | (g), (i), (j): three *Constraints* bullets and two question rows; (k): B′, C, D′ and E for its declaration |
| `doc/workflow.md` | (l): the bookkeeping below, and nothing else |

**The bookkeeping made in `doc/workflow.md`** (P33's precedent: no new version): the Status line, *THIRTY-FOUR times, by
P1 through P33 and P37*; section 6, *ninety-nine, so the next is the HUNDREDTH*; the refusal ledger's first row, *33
times, P2-P37*. **P37 does NOT join the Status line's *adopted nothing* list** — (l). P35's and P36's drafts take no
hand-off: nothing P37 found is theirs.

**Ids.**

- **Issued**: W162, W163, W164, W165, W166, W167; ADR 0096, ADR 0097, ADR 0098, ADR 0099; Q619, Q626 and Q633; **S11
  written, NOT RAISED**.
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W168 CLOSED unissued, as the declaration expected;
  - Q615-Q618 SPENT (W162's), Q620-Q622 SPENT (W163's), Q623-Q625 SPENT (W164's), Q627-Q629 SPENT (W165's),
    Q630-Q632 SPENT (W166's), Q634 SPENT (W167's). None exists in the tree;
  - ADR 0100 SKIPPED — no item needed a fifth decision.

**The next plan starts at W169, Q635 and ADR 0101.** The next S id is S12; the next plan id is P38.

*`npm run state` before this section printed the tree's W168 / Q634 / ADR 0100 against the ledger's W162 / Q615 /
ADR 0096, the ledger being P33's sentence. The tree's maximum is wrong exactly here, because P37 closed W168, Q634 and
ADR 0100 unissued — P33's precedent for W161, Q607-Q614 and ADR 0095. None of section 8's recommended answers takes an
id.*

### 8. Stop-and-asks for the maintainer

| | the question | recommended | the alternative |
|---|---|---|---|
| **(g)** | **Q633** — `FD-R4` holds a transforming entry's payload BEFORE its transform, so `start` and `tryTransform(…, { input })` give opposite verdicts on one value: which plan owns it, and must it land before 0.8.0 is published? | **P34 owns it, and YES, before 0.8.0.** P34's draft gains a row in *Open questions this plan carries* and a *Constraints* bullet; **P34's declaration measures it and puts the ROAD as its own stop-and-ask** — (1) an async `start`, BREAKING; (2) a transforming entry's payload left unchecked; (3) a separate schema for what the transform receives. **Why P34**: the fix is in `src/driver/**` and `spec/`, which P34 edits for its dispatch hold, and road (1) changes `start`'s signature in the same BREAKING release; **why before 0.8.0**: 0.8.0 is the release that advertises *check, then start* for a flow published to a running runtime, and Q633 is a defect on that road — P34 decision 6 publishes after P36, so P34 owning it meets the bar with no extra plan | **A short plan, P38, before P34** — one question, its own exit artifact, the road decided at its declaration; P34 is untouched and 0.8.0 waits one more plan. **Or publish 0.8.0 with Q633 open**, its *meanwhile* (`validateBoundaries: false`, or an untransformed first node) written into `AGENTS.md` sections 10 and 11 |
| **(h)** | **Q626** — a named instance of the built-in `Transform` may now hold a RESIDENT group: accept it as stated? | **YES, accept as stated** — the author's and W165's recommendation: a consumer wanting a transform-only pool to hold a group (a rate on an expensive engine) has one road, and ADR 0099 rule 1's *a document type* reading stays one rule. **Edits on YES**: Q626 `resolved`, `resolved-by` ADR 0099 consequence 5 and this retro's (h); ADR 0099's front matter `resolves: Q626` (`check:register` `R8` holds the pair both ways) and consequence 5's last two sentences rewritten from *not decided here* to *accepted, P37's retro (h)*; ADR 0075's W165 note's last sentence likewise. Q457's `note` already narrows its title to `inline` and `groups` | **Refuse `residentGroups` on a transform-only type's instance**, or refuse `pool` on it altogether — an item with its own shape-check clause on both roads, and the W165 case that pins the acceptance flips; owner P34 (as a row) or a later plan. ADR 0075 rule 3's note stands |
| **(i)** | **Q619** — a built-in `KeyedRateLimitGroup` held only as RESIDENT is not `FD-R6` and counts every worker in one `""` bucket, silently: which of its options A-D, and who builds it? | **B — refuse it in the RESOLVER at `createRuntime`**, naming the pool and the group: the defect is the REGISTRY's, no flow and no `createTask` changes it, so it is refused where the registry is read. **Owner P34, as one row of its declaration**, so it ships in 0.8.0's BREAKING release; no known document declares it. Q619's `owner` becomes P34 | **C — accept and document** (the spec's group-types table and `AGENTS.md`; the same row, docs only — the silent sharing stays for a reader who does not read them). **D — defer with Q248** (`status: deferred`, no owner): a document `keyFrom` would key a resident acquire. **A — widen `FD-R6`**: one rule, but a `createTask` cannot help a resident group, so its two roads become one |
| **(j)** | the sentences W164's S1 left with **no register home and no owner** — `src/driver/driver.ts:2140`, `test/driver/result-schema.test.ts:62` and `:309`, `spec/outcome-record.md`'s `OR-R13` (*the thirteen keywords*), `src/definition/wiring.ts:155` (names `examples` alone as unread) — and W162's `InvalidDefinition` message FORMATTED twice | **YES, a hand-off to P34**: one *Constraints* bullet in P34's draft naming all six sites, because P34 edits `src/driver/**` and `spec/outcome-record.md`, and a stale sentence that lives only in a finished item's Out has nobody to find it | **Raise a question** (rule 6's NO branch: *a question is raised only on a NO*) — Q635, owner P34, the same content in the register; or **leave them in W164's Out alone** |
| **(k)** | proposals A, B′, C, D′ and E (section 6) | **A, B′, C, D′ and E** — no workflow edit; B′, C, D′ and E written into P34's draft as a hand-off for its author to copy into its declaration, as P33's retro adopted B′, C and D for this plan's | any subset; **E as a workflow rule** (section 5 rule 8's table, *on the SET*, v0.31) needs ~170 of `doc/workflow.md`'s 182 bytes of headroom, and (l)'s bookkeeping first |
| **(l)** | **`doc/workflow.md`'s bookkeeping**, outside this retro's declared files — P33's retro made the same three edits (P32's precedent): the Status line *THIRTY-FOUR times, by P1 through P33 and P37*; section 6 *ninety-nine, so the next is the HUNDREDTH*; the ledger's first row *33 times, P2-P37*. And does P37 join the Status line's *adopted nothing* list? | **YES to the three edits** (net +2 bytes, inside the 182 of headroom), **no version, no index entry**; and **P37 does NOT join the list** if (k) is answered as recommended — D′ and E are adopted sentences, the maintainer's reading at P33 (i) | the next plan's retro makes them, and the ordinal and the ledger row are stale until then; or P37 joins the list (P31 section 10's reading: a declaration sentence moves no rule) |

**The maintainer's answer, 2026-10-16: *"as recommended"*, to all six.**

- **(g) Q633 → P34, and it lands before 0.8.0 is published.** P34's draft carries the *Constraints* bullet and the
  question row; its declaration measures the defect and puts roads (1)-(3) as its own stop-and-ask.
- **(h) Q626 ACCEPTED as stated** — resolved by ADR 0099 consequence 5 and this answer; ADR 0099's front matter
  `resolves: Q626`, its consequence 5 and ADR 0075's W165 note rewritten; Q457's `note` says so.
- **(i) Q619 → option B**: a built-in `KeyedRateLimitGroup` in any pool's `residentGroups` refused by the resolver at
  `createRuntime`, naming the pool and the group — one row of P34's declaration, shipping in 0.8.0. Q619's owner is P34.
- **(j) YES** — the six stale sites are one *Constraints* bullet in P34's draft; no question raised.
- **(k) A, B′, C, D′ and E.** **A**: no change to any rule in `doc/workflow.md`; v0.30 stands and takes no index entry.
  **B′, C, D′ and E are ADOPTED FOR P34's DECLARATION, not as rules** — written into P34's draft for its author to copy.
- **(l) YES** — the three bookkeeping edits, made (section 7); **P37 does not join the *adopted nothing* list**.
