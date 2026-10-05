# W66 — The runtime entry: `createRuntime` in `fyflow-orchestration/scheduler`

*(Declared as `fyflow-orchestration/runtime`; the sub-path was P18's own open stop-and-ask and the
maintainer answered it at this item's declaration step — decision 3 below.)*

**Status:** done — started 2026-09-16 on `ba0137a`, done 2026-09-16: declaration step and its four
decisions, both readers run, rule 8 re-run with their edits, `npm run gate` green over the final tree
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

```
Spec:       spec/flow-definition.md §3's registry section (W65's) for what a document
            may say; spec/runtime-targets.md §4 for the sub-path's reach (the root
            loads no validator, a third RT-R rule in RT-R11/RT-R12's shape); the
            construction-time refusals as a table in AGENTS.md §12, each a named
            error, on ADR 0049 rule 5's precedent (a helper's refusal is not an FD-V)
Owns:       src/scheduler/**, src/runtime/** (new), package.json, deno.json,
            test/scheduler/**, test/runtime/** (new), AGENTS.md §12-§14 (the runtime
            rewrite; W65 migrates the grammar in every section first),
            doc/decisions/0055-*
Inputs:     P18 decisions 4, 7-11, 13 and 14; facts 2, 3, 6, 7 and 8 re-run from
            dev-dist/p18/facts.mjs; W65's types and validator; today's bootstrap as
            the identity derivation's factory
Outputs:    (1) `createRuntime(document, code, { base })`: groups from factories —
                the three built-ins in `{ configSchema?, create }` shape, custom ones
                from `code.groupTypes`, a name colliding with a built-in refused, an
                object lacking `canRun` or `getMetrics` refused naming the key —
                pools from types (every type's default instance from its own
                `config`, named instances from `pools`, decision 9's resident-group
                refusal), languages from `code.languages` against the document's
                names both ways (the runtime imports NO engine — decision 13), and
                the driver's registry exposed as `runtime.registry` (decision 14)
            (2) `runtime.start(flow, payload, { runId?, joinPolicy? })` returning a
                `Driver`, run ids minted as `r<n>` per runtime, `live-token` by default
            (3) `bootstrap` reduced to the identity derivation's factory and kept
                exported; the sub-path exported by both manifests and allowlisted for
                publish; the spec's runtime-targets rule for it
            (4) AGENTS.md §12-§14 rewritten from a copy of the harness to calls, with
                a `run` snippet driving the sample's registry on real pools
            (5) ADR 0055 if the sub-path's placement or the run-id minting needs its
                own record; expected folded into ADR 0054
Depends on: W65
Blocks:     W67
Tests:      expected values from the plan's decisions and P18's facts, never from
            output. Every construction refusal fixtured; two pools over one worker
            URL asserted as two (fact 3's shape on the runtime's own pools); the
            resident-group refusal against fact 6's exact configuration; a default
            instance's options equal to bootstrap's for every existing type; a
            minted id inside ID-R2's charset and distinct across two runs
Gate:       L0 under all five typechecks; L1 on real inline AND threaded pools built
            from a document, in both runtimes; check:source — the root and the
            scheduler sub-path load no validator and no engine (S14's shape a third
            time), the runtime sub-path allowed; check:docs on the rewritten
            sections; check:scheduler; then spec-conformity pass (two readers),
            rule 8 re-run with their edits
Reserves:   Q285-Q288, ADR 0055
```

## Scope

**In**

1. **Construction from a document** — every object the harness builds by hand today, built by the
   runtime from names, with every refusal at construction and named.
2. **The runtime's own surface**: `createRuntime`, `start`, `registry`, and nothing a consumer
   could not otherwise reach through the pure root.
3. **The consumer reference**: §12 becomes a call, §13 and §14 read `type` and the runtime.

**Out** — named, with where each goes

- **The exit artifact and `examples/**`.** W67's.
- **Loading an engine or a validator into the root.** Refused by `check:source`; the runtime sub-path
  is the one place a validator lives, and no engine lives anywhere but `src/jsonata/**` (ADR 0052
  rule 4).
- **A per-node or per-run choice of pool.** Routing; ADR 0001.

## Exceptions

*Seeded from the plan's table.*

| path | why |
|---|---|
| `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs` | predicted: a clause that the root and the scheduler sub-path import no validator and that the validator is reached from `src/runtime/**` alone — `S14`'s shape a third time (W62's table); a probe and a `META` entry per clause |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted: a fourth sub-path rewrite for `fyflow-orchestration/runtime` with its probe, and `RUN_FLOOR` moving with §12-§14's snippets (W59's and W62's tables) |
| `scripts/check-scheduler.mjs`, `scripts/check-scheduler-selftest.mjs` | predicted: `D8` binds `deno.json`'s `imports`; a new sub-path export is not an import, so predicted NOT to fire — checked |
| `spec/README.md` | the `Owns` consequence: `C8` makes its version row a consequence of the `spec/runtime-targets.md` bump |
| `examples/l6.ts` block (2c) | predicted: it asserts the two manifests' `./scheduler` export by literal; a `./runtime` export beside it is a second literal or a widened clause, and `examples/**` is W67's — declared here so the first L6 run after this item's manifest edit is read for it. **Did NOT fire**: decision 3 took no new export, and L6 is unmoved at 1502 / 50 |

**Late, and every one of them declared here rather than found in the diff** — the first three by the
conformity reader (finding 7), the rest created by acting on its other findings.

| path | why |
|---|---|
| `src/driver/driver.ts` | **late**: `runId` was `private readonly` and a runtime that MINTS one (decision 10) leaves the caller no way to read it. One word, `private` to public `readonly`, and a doc comment; it widens the root package's surface by one string, which `AGENTS.md` section 12 now states |
| `test/definition/l4-corpus.test.ts` | **late**: the suite census is an equality, so the eight suites this item adds must be named there in the same commit — W59's and W65's exception, a third time. `Owns` names `test/scheduler/**` only |
| `doc/scheduler-upstream.md` | **late**: the declaration step's finding 2 called this a *candidate* and ADR 0055 rule 5 then RAISED it, so `S10` is written here — the register's own rule is that an item states its workaround, and this item is the workaround |
| `spec/flow-definition.md` | **late**: its registry subsection said the runtime checks a factory's output for `canRun` and `getMetrics` — the reading ADR 0055 supersedes, and a normative sentence this item makes false. Corrected in place; ADR 0055's status line names the amendment |
| `src/definition/types.ts`, `src/definition/registry.ts` | **late**: the same sentence in `GroupType`'s JSDoc (what a consumer's editor shows), and two comments naming `fyflow-orchestration/runtime`, the sub-path decision 3 struck |
| `src/scheduler/bootstrap.ts` | **late**: its header said it is *the one place the published package constructs a scheduler object*, true of the MODULE until `createRuntime` joined it in the same sub-path; `RT-R13` states it at directory granularity |
| `doc/decisions/0049-*.md` | **late**: rule 5's same module-level claim, annotated rather than rewritten |

## Declaration step — what was re-run, and what was found wrong before anything was built

*Section 1 rule 5: the facts this item was handed were re-run rather than transcribed. Taken
2026-09-16 on `ba0137a` with the tree clean, digest **`77bbd42054b069ba` over 308 files**
(`dev-dist/w65/digest.mjs`). Facts 2, 3, 6, 7 and 8 by `dev-dist/w66/facts.mjs` under Node 24.20.0
and Deno 2.9.6 — **byte-identical in both**, `facts-node.log` and `facts-deno.log` differing only in
their first line.*

| fact | re-taken | held? |
|---|---|---|
| 2 — the `ResourceGroup` interface | `node_modules/fyflow-scheduler/dist/types/groups/resourceGroup.d.ts` at 0.5.2: **`interface ResourceGroup extends EventTarget`**, required `id`, `type`, `canRun(key?, cost?)`, `getMetrics()`; optional `keyed?`, `keyFor?`, `onStart?(key?, cost?)`, `onFinish?(key?, cost?)`, `getStats?`, `describe?`, `read?`. The three constructors differ as recorded — `(limit, id)`, `(windows, id)`, `(windows, { id })`, the third `keyed` | the READING holds and **what it implies does not** — finding 2 |
| 3 — two pools over ONE worker URL | a scheduler with `A` (`maxThreads: 1`) and `B` (`maxThreads: 2`) over one `flow-worker.ts`: A returns the ingest role's echo, B's three tasks each `score: 90`, threads mid-burst **1 / 2**, `workerPools` keys `["A","B"]`, `scriptUrl` **equal** | yes — and the payloads are ENVELOPES now (finding 1) |
| 6 — `idleTimeout: 0` with a contended resident group | two pools, each `residentGroups: { vram: 1 }` against a `ConcurrentLimitGroup(1)`: the holder settles `done`, **the waiter is `pending` at 3 s**, `scheduler.completed` has fired once and `stats` reads `{queued:0, running:0, done:1, failed:0}` — the deadlock, with the scheduler reporting idle | yes, to the field |
| 7 — what a built pool exposes | `inline`, `maxThreads`, `idleTimeout`, `groups`, `residentGroups` and `config` are own readable fields of a `WorkerManager` (21 own keys in all) | yes |
| 8 — a worker URL built from a BASE | `new URL('./workers/flow-worker.ts', base)` loads in a real thread and the task settles `done`; and **a relative URL with NO base THROWS** (`new URL('./workers/…')` on its own), while an `https:` and a `data:` URL resolve either way | yes — and the throw is decision 7's whole reason, measured rather than argued |

**What was found wrong or missing, before anything was built.**

1. **P18's own facts harness does not run on this tree, and its payloads are the wrong shape.**
   `dev-dist/p18/facts.mjs` calls `bootstrap(NODE_TYPES, …)` — W65 changed both the helper's
   signature and `NODE_TYPES`'s shape — and every payload it hands the flow worker is a RAW object
   where W65's worker reads `input`, so facts 3, 6 and 8 would have printed `undefined` results and
   been read as holding. Re-anchored as `dev-dist/w66/facts.mjs` with envelope payloads; fact 5 is
   W65's and was re-run there. *(The new harness was itself wrong at birth: its fact-2 extraction
   matched `interface ResourceGroupMetrics` first and read that interface's four members as
   `ResourceGroup`'s — the probe fixed and the reading re-taken.)*

2. **BLOCKING FOR DECISION 4 — the members the interface REQUIRES are not the members the scheduler
   CALLS, and the plan's refusal list is wrong in both directions.** Measured one omission at a
   time, each group holding a real task on a real scheduler, identical in both runtimes:

   | omitted | the interface says | what the task does |
   |---|---|---|
   | nothing | — | `done` |
   | `onStart` | **optional** | THROWS `group.onStart is not a function` |
   | `onFinish` | **optional** | **never finishes** — `running` at 2.5 s, and shutdown warns *"1 task(s) still marked running … dispatched to a pool that could not complete them"* |
   | `getMetrics` | **required** | `done` |
   | `canRun` | required | THROWS `group.canRun is not a function` |
   | `type` | required | `done` |

   And **a PLAIN OBJECT with no `EventTarget` holds a task and the task completes**, so neither
   `instanceof` nor the interface's base class is a run-time requirement. P18 decision 4 refuses *a
   created object lacking `canRun` or `getMetrics` … `onStart` and `onFinish` are optional*: that
   **refuses a group that works** and **accepts one that hangs every task naming it, in silence** —
   [W33](w33-a-map-at-run-time-arity.md)'s *N too small completes and is silent* one interface over,
   and the worst of the failure modes the plan's own decision 9 exists to refuse. The list a
   `createRuntime` must hold a factory's output to is what the SCHEDULER calls —
   `canRun`, `onStart`, `onFinish` — with `id`, `type` and `getMetrics` refused beside them for a
   different reason (a consumer's viewer reads them; `AGENTS.md` §6 and the sibling repository's
   collector). **Put to the maintainer before the factory is written.** It is also the SEVENTH fact
   the scheduler's reference is silent on, and the first that CONTRADICTS it rather than omitting it:
   candidate for `doc/scheduler-upstream.md`.

3. **BLOCKING — this item's `Spec`, `Gate` and `Out` lines rest on a premise [ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
   struck.** They say *the root loads no validator*, plan a third `RT-R` rule in `RT-R11`/`RT-R12`'s
   shape, and predict a `check:source` clause refusing a validator outside `src/runtime/**`. W65
   shipped the subset at `src/definition/schema.ts`, **exported from the root** (`index.ts`) and
   **applied by the DRIVER** (`FD-V33` at `new Driver`), and ADR 0053's status line names that
   departure from P18 decision 8 in as many words. So the rule as worded cannot be written and the
   predicted clause has no subject: `RT-R12`'s shape is about a DEPENDENCY reached by one sub-path,
   and the subset is a dependency on nothing. What is still true and may be worth a rule is narrower
   — *the runtime sub-path is the one place that CONSTRUCTS scheduler objects* — and that is
   `RT-R10`'s and P16 decision 5's ground rather than `RT-R12`'s. **Put to the maintainer.**

4. **`spec/runtime-targets.md` is named in the `Spec` line and is in neither `Owns` nor the
   exceptions table**, while `spec/README.md` IS declared as a consequence of bumping it. Finding 3
   decides whether either fires; declared here so that taking them is not undeclared.

5. **The baseline digest is 308 files where W65's Record says 311.** Both are right about their own
   tree: when W65 took its digest the three invalid examples it had deleted were still in the index
   and the script counted them as `<missing>`; the commit removed them. Recorded so the difference is
   not read as drift.

6. **Ladder L6's block (2c) asserts the manifests' exports by the literal `'./scheduler'`, three
   times**, so a `./runtime` entry added to both manifests is invisible to it — exactly as this
   item's exception row predicted. `examples/**` is W67's, so the row stands as declared.

## Decisions taken at the declaration step, before anything was built

*Four put to the maintainer on 2026-09-16 — two of them [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s
own open stop-and-ask rows, two raised by the findings above — and answered before the first edit.*

1. **A group factory's output is held to the UNION of both lists**: `canRun`, `onStart`, `onFinish`
   (what the scheduler CALLS — finding 2) and `getMetrics`, `id`, `type` (what the interface
   requires and a consumer's viewer reads), each refused by name against the group's key. Decision
   4's list is superseded by measurement, and this is wider than either half.
2. **No `RT-R` rule about the validator; a CONSTRUCTION rule instead.** `RT-R13`: the sub-path that
   constructs scheduler objects is the only place that may construct them — no `WorkerManager` and
   no group constructor in the root, the driver or the fold. True today (`src/definition/**` imports
   the scheduler `import type` only and `BUILT_IN_GROUP_TYPES` carries schemas and no factory), so
   it ships with no live offender, stated. `spec/runtime-targets.md` and `spec/README.md` are
   exceptions this item takes; `check:source` gains a clause with a probe and a `META` entry.
3. **`fyflow-orchestration/scheduler` GROWS `createRuntime`; there is no `/runtime` sub-path** —
   P16 decision 5's *one sub-path that constructs scheduler objects*, taken as written. `Owns`'s
   `src/runtime/**` and `test/runtime/**` fold into `src/scheduler/**` and `test/scheduler/**`;
   neither manifest gains an export, so **L6 block (2c) is predicted NOT to fire** and that
   exception row is declared and unused.
4. **A `map` branch node names a pool like any task node.** W65 already ships `pool` validated and
   dispatched on all four shapes, the map branch among them, so this is the absence of a refusal
   rather than a feature: nothing to build.

**And two more things the plan's own sample contradicts, found writing this.**

7. **The signature is `createRuntime(document, code, { base })`** — this item's `Outputs` line — and
   the plan's sample shim calls `createRuntime(registry, { base, predicates, groupTypes, nodeTypes,
   languages })`, TWO arguments with `base` folded into `code`. Three is taken, because `code` is
   exactly `resolveRegistry`'s second argument and W65 shipped that; the sample's shim is W67's to
   write and gains the split there, along with its import line (finding/decision 3 above moves it
   from `fyflow-orchestration/runtime` to `fyflow-orchestration/scheduler`).
8. **The sample builds a runtime without naming the flows it will run, and a pool's languages cannot
   be decided without them.** W61's measured property is that a language's worker URL is written
   into a typed pool's config ONLY where a node of that type transforms — so `Scorer`'s pool carries
   the engine on a run of `transformed.flow.json` and not on a run of `typed.flow.json` — and pools
   are built once, at `createRuntime`. So `createRuntime` takes `flows` beside `base`, as
   `bootstrap` does, and **`start` REFUSES a flow whose transforming types no pool was built for**,
   naming the type, the language and the fix. The alternative — every registered language written
   into every typed pool — loses the property W61 measured and P17 decision 8 rests on.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — the runtime suite's real-pool half skipped in the browser as W61's is, stated |
| checks | `npm run check:source`, `npm run check:docs`, `npm run check:scheduler`, `npm run check:spec` |
| readers | conformity: the decisions first, every refusal re-derived; adequacy: isolated copy, every factory, every default instance and every refusal mutated, with obligation (c) over what the runtime READS from the document against what it BUILDS |

*Routing cases: not applicable — a runtime constructs and starts; what a run does is W67's.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w66/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); rule 8's harness (`dev-dist/w66/rule8.mjs`, W65's with a
`sourceself` rung) carries a control, asserts every restore byte for byte, checks each edit's anchor
against the CURRENT text, undoes what an aborting probe applied, RUNS its one declared ceiling against
the rung its reason names, and holds the tree still by a content digest. **Every expected value came
from the plan's decisions and from P18's facts re-run here, never from this module's output** — the
group-member list is the one the maintainer decided FROM the measurement, and the pool options are
compared to fact 5's capture.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | Started on `ba0137a`, tree clean, digest `77bbd42054b069ba` over 308 files; facts 2, 3, 6, 7 and 8 re-run (the table above) **byte-identical in both runtimes**, and six things found wrong before anything was built — the first of them P18 decision 4's refusal list, wrong in BOTH directions |
| stop-and-ask | four, answered before the first edit | the group list (the union), the `RT-R` rule (a CONSTRUCTION rule instead), the sub-path (`/scheduler` grows `createRuntime`), a map branch naming a pool (uniform — nothing to build) |
| L0 | GREEN | `lint` 0 and `typecheck` 0 across all five sub-typechecks. Red five times on the way, and one was `RT-R9`: `RuntimeError`'s constructor was written as a PARAMETER PROPERTY, which `tsc` accepts and Node cannot strip — `npm test` **exit 1 with ZERO FAIL lines** ([Q272](../questions/q272.md)'s shape), caught by `S4` the moment `check:source` ran |
| L1-L5 | GREEN | **41 files / 1111 assertions in node 24.20.0, deno 2.9.6 and chromium** — from 40 / 1096: 1093 at code-complete, 1096 after the author pass, 1100 after the conformity reader, 1111 after the adequacy reader |
| L4 | GREEN | `check:spec` **7 / 55 / 106 rules** (from 105 — `RT-R13`), `check:docs` **29 snippets, 23 run** (from 28 / 22; `RUN_FLOOR` 22 → 23, Q102's ratchet, the tenth recorded raise), `check:markdown` 124 / 5293 / 264 |
| L6 | GREEN and **UNMOVED at 1502 / 50 in both runtimes**, which is the declared result | this item adds no row: `examples/**` is W67's, and block (2c) did not fire because decision 3 took no new manifest export |
| checks | GREEN | `check:source` with the new `S16`, self-test **65 / 65 probes, 44 / 44 noticed, 10 / 10 bounded** (from 63 / 43 / 10); `check:wiring`, `check:scheduler`, `check:policies` 0 |
| rule 8, author pass | **34 probes: 1 control green, 30 caught, 3 UNDECLARED survivors, 1 measured, 0 crashes, 0 aborts** | `a5` — the member list declares a KIND and no fixture supplied a member of the wrong kind, so a presence test passed; `a12` — every flow the suite started was LINEAR, so `live-token`'s default was inert; `d3` — Q102's ceiling, mis-declared by me as a catch and re-declared with W62's and W63's reason. `c2` measured 0 and is W34's finding restated: a provenance probe changes nothing observable on a correct implementation, and **the COMPOUND** — the comparison re-sourced AND the runtime adding an option — **is CAUGHT**, by the real-pool suite |
| readers | **22 findings / 10 blocking and 46 mutations / 22 findings / 13 blocking, OVERLAP 2** | The **thirty-ninth** measurement, inside the 0-4 band, neither primed; the two shared subjects are the *one refusal names every missing member* claim and the *every construction refusal fixtured* line. **The conformity reader found claims that were false**: `runtime.registry` described as *exactly the object this runtime hands its own drivers* while its `predicates` held the document's NAMES — a `Driver` built by hand from it **refused a VALID flow under `FD-V4`**, with a probe; *both ways* for languages and predicates, checked one way; the Gate line's *L1 on real pools* with every call through a seam; `spec/flow-definition.md` and `src/definition/types.ts` still stating the refusal list ADR 0055 supersedes; `src/definition/registry.ts` naming a sub-path decision 3 struck; three undeclared paths; and the Status line's own count stale within the hour. **The adequacy reader found bounds that were not there**, thirteen blocking, and its sharpest is in the instrument this item had just fixed: `scan()` models no REGEX LITERAL, so `/['x]/` opens a string and `/[\`]/` a template — **the same class the rewrite's own header claims to close** — blinding `S2`, `S3` and `S16` over the rest of a line or file, and a stray backtick can make `S16` FALSELY fire on a `${…}` inside a plain string. Every finding acted on; their exact edits are probes (`rc*`, `ra*`) |
| re-run, tree held still | **52 probes: 1 control green, 50 caught, 1 declared ceiling RUN against its rung, 1 measured, 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration** | the author's 34 plus the two readers' eighteen exact edits, digest `c103f83eef6dca6c` over 311 files before and after every probe |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries** (`dev-dist/w66/gate-2.log`; selftests 7/7 completed, 7 ok, 632.8 s wall). **The FIRST run was RED on one line and it was a true catch**: `check:docs`'s self-test reported *wanted [X3,X5], got [X3,X4,X5]* — this item's section 12 `run` snippet imports the sub-path, so a probe that mangles that specifier now breaks a snippet that EXECUTES as well as the ones that only typecheck. Rule 7 (c) working: the set is declared, the set moved, and the item that moved it says so | digest `7853dccf53418d37` over 311 files before and after — the tree the gate ran over, to which this row and the two index lines were then added |
| own id | measured | `W66` outside `doc/` and `dev-dist/`: **64 hits in 18 files**, every one this item's own annotation — section 1 rule 5's third direction |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `createRuntime(document, code, { base })` — groups from factories, pools from types, languages both ways, `runtime.registry` | `src/scheduler/runtime.ts`: `resolveRegistry` first, then the three built-in FACTORIES, every created group held to six members, every worker url resolved against `base`, `bootstrap` for the pools, one `FyflowScheduler`, and the driver's registry derived once | `a1`-`a8`, `a15`, `a16`, `rc4`, `rc5`, `ra1`, `ra8`, `ra9` |
| (2) `runtime.start(flow, payload, { runId?, joinPolicy? })` returning a started `Driver`, ids minted `r<n>`, `live-token` by default | `start`: the language check, the mint, the policy default, the registry spread, `driver.start(payload)` | `a9`-`a14`, `ra2`-`ra4`, `ra10`-`ra13` |
| (3) `bootstrap` kept as the pool builder and exported; the sub-path exported by both manifests | unchanged and used BY `createRuntime`; no new export, by decision 3; `deno.json`'s allowlist gains the new module | `e1`, `e2`, `ra14` |
| (4) `AGENTS.md` §12-§14 rewritten from a copy of the harness to calls, with a `run` snippet on real pools | §12 leads with `createRuntime` over a document and runs it on a real `FyflowScheduler`; §13's wiring snippet points at the runtime; §9 names the three `RuntimeError` classes | `d3`, `ra12`, `rc6r` |
| (5) ADR 0055 *if the sub-path's placement or the run-id minting needs its own record* | **TAKEN, and for neither of those**: the group refusal list, on a measurement that corrects decision 4 in both directions. The sub-path and the minting are decisions 3 and 10, recorded in this file | `a1`-`a6`, `ra17`, `ra18`, `ra22` |
| — | **`RT-R13`** (`spec/runtime-targets.md` v0.12) and **`S16`** with three probes and three META entries; and **`scan()`**, one left-to-right pass replacing two regexes that blinded `S2`/`S3`/`S4` over 16 137 characters of `driver.ts` | `b2`, `b3`, `d1`, `d2`, `e3`, `e4`, `ra15` |

**What broke.**

1. **P18 decision 4's refusal list was wrong in BOTH directions**, and only a measurement said so: it refuses a group that works (no `getMetrics`) and accepts one that HANGS every task naming it in silence (no `onFinish`). The interface's required set is not the set the scheduler calls — ADR 0055, and [S10](../scheduler-upstream.md) upstream.
2. **The item's own `Spec`, `Gate` and `Out` lines rested on a premise ADR 0053 struck** — *the root loads no validator* — so the third `RT-R` rule it was declared to write had no subject. Replaced by a CONSTRUCTION rule, the maintainer's call.
3. **`runtime.registry` was not what the runtime hands its drivers.** Decision 14's whole point, and a `Driver` built by hand from it refused a valid flow under `FD-V4`, because `predicates` carried the document's names where the driver wants the functions. The test that asserted the claim had the claim in its TITLE and no driver in its body.
4. **`both ways` was one way** for predicates and languages: an adapter supplied and named by no document was dropped in silence, and the flow that used it died at `FD-V35` one run in.
5. **The Gate line promised L1 on real pools and every call went through a seam** — the runtime was never built with a real `WorkerManager` in any suite until the reader said so.
6. **The scan that fixed a blind spot had the same blind spot one construct over.** A regex literal containing a quote or a backtick blinds the source checks exactly as an apostrophe in a template did, and can make one FALSELY fire. Fixed with a regex branch and two probes; the class is now three constructs deep (strings, templates, regexes) and the header says what a fourth would look like.
7. **A parameter property took ladder L1 down with zero FAIL lines** — `RT-R9`, and `Q272`'s shape: the typecheck passed, the runner crashed at import naming no file, and `S4` named it in one line.
8. **The house style's backtick apostrophe broke a patch script four times** — third item running; it is a hazard of writing TypeScript through nested template literals, not of the style.
9. **The tree moved under the conformity reader** (three fixtures landed mid-read), which is section 6's *hold the tree still*. It cost nothing — the reader pinned every measurement to a digest and re-read the file whole — and it is recorded because its finding 8 (a count stale within the hour) is the direct consequence.

**What this taught.**

- **An interface's required set is not the set its implementation calls**, and only one omission at a time on a real scheduler tells you which. The plan read the `.d.ts` faithfully and was wrong in both directions.
- **A claim with the word EXACTLY in it wants a fixture that exercises the identity, not the shape**: `runtime.registry` was asserted key by key and refused a valid flow.
- **A seam is a blind spot with a good reason**, and the reason has to be paid for once: every runtime fixture used one, so *L1 on real pools* was a sentence with no artifact until a suite built a real `WorkerManager`.
- **A fix for a blind spot is a new instrument and needs its own probes.** The scan closed apostrophes and left regexes open, and its own header claimed the class.
- **The readers' split held for the thirty-ninth time**: the conformity reader found claims that were false (a reach, a shape, a count, a sub-path that does not exist); the adequacy reader found bounds that were not there (every forwarded option, every exposed member, the payload itself).

**Questions raised.** [Q285](../questions/q285.md) (a runtime's pools are built once and a flow's languages are known at `start`, so `flows` is an argument at construction — is that the right seam, or should a pool be able to gain an adapter later?), [Q286](../questions/q286.md) (a consumer's derivation runs TWICE per instance — once in `resolveRegistry` and once in `bootstrap` — and the second output is the one that becomes the pool), [Q287](../questions/q287.md) (the runtime's own refusals are not exported from the package ROOT, so `AGENTS.md` section 9's enumeration cannot see them and a consumer has no executable list to catch), [Q288](../questions/q288.md) (`RT-R13` ships with no live offender and the class of blind spot `scan()` closes is open-ended — a fourth construct would reopen it).
