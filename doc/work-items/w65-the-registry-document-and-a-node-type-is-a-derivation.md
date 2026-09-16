# W65 — The registry document, and a node type is a derivation

**Status:** done — started 2026-09-15 on `88b061b`, done 2026-09-15: both readers run, rule 8 re-run with their edits, `npm run gate` green over the final tree (Record)
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

```
Spec:       spec/flow-definition.md §2 (a task node's keys: `type` required, `pool?`
            added, `workerType` retired), §3 (the registry: workers with four
            schemas, node types as derivations, pool instances, group types), §5
            (FD-V23/FD-V32/FD-V34 folded into one rule; FD-V33 reading a schema; one
            new FD-V for a `pool` that is not an instance of the node's `type`; a
            fold of the refusal count), §7 (the corpus rows); a registry-document
            section stating every construction-time refusal by name
Owns:       src/definition/**, spec/flow-definition.md, spec/README.md,
            spec/examples/**, test/**, AGENTS.md (the grammar migration of every
            snippet naming `workerType` — the gate executes them), doc/decisions/0053-*,
            doc/decisions/0054-*
Inputs:     P18 decisions 1-6 and 12-14, read from the PLAN's own file; facts 1, 2,
            4 and 5 re-run from dev-dist/p18/facts.mjs and the subset prototype
            dev-dist/p18/subset-validator.mjs (a seed to rewrite, never to copy);
            today's NodeType, Registry and bootstrap (src/definition/types.ts,
            src/scheduler/bootstrap.ts); W59's FD-C5 and W61's FD-C6
Outputs:    (1) `NodeTypeDefinition` and `PoolSpec` in src/definition/types.ts, a
                worker entry type carrying `url` and four optional schemas, a group
                type as `{ configSchema?, create }`, and the registry DOCUMENT type
                — with the document form of a node type implemented as the identity
                derivation (merge), reproducing fact 5's captured options byte for
                byte for every existing type
            (2) the built-in JSON Schema SUBSET validator in src/definition — ADR
                0053 — with its keywords enumerated in the spec, a keyword outside
                the subset REFUSED at construction naming it (Q278 decided), and
                the sample's fourteen cases as fixtures
            (3) the grammar: `type` required on a task node, `pool?`, `workerType`
                retired — ADR 0054 — FD-V23, FD-V32 and FD-V34 folded into one rule,
                FD-V33 reading the worker's `settingsSchema` with the type's
                `settings` defaults merged under, one new FD-V for a `pool` not of
                the node's `type`; `Registry.workerTypes` and
                `DriverOptions.workerTypes` retired (decision 14)
            (4) the corpus migrated: spec/examples/registry.json becomes a registry
                document, every `workerType: X` in both corpora becomes `type: X`
                with a document-declared type per former pool, the invalid examples
                for the folded rules removed, spec/README.md's rows moved
            (5) every construction-time refusal of the registry document — type's
                worker missing, pool's type missing, config against schema, group
                config against its factory's schema, a type whose own `config` fails
                its own schema, a document/code name collision — as a named error
                class with a fixture each
Depends on: nothing — P17 is merged
Blocks:     W66
Tests:      expected values from spec/ and from P18's facts, never from output.
            Every refusal fixtured with a document that trips it and one that does
            not; the identity derivation compared to fact 5's captured options as
            JSON text; the subset validator over the sample's schemas with the
            negative cases; prediction 2's byte-for-byte comparison of every existing
            type's pool options before and after
Gate:       L0-L5 in five runtimes; check:spec (C7 reads the registry document);
            rule 8 obligation (a) over every field of both interfaces and BOTH shapes
            of a node type (document, class), (d) over the corpus census and the
            subset's keyword list, (e) the registry document renamed out; then
            spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q280-Q284, ADR 0053-0054
```

## Scope

**In**

1. **What a registry document IS**, as types and as spec prose, with the document form of a node
   type being the identity derivation and a class form being any other — decision 2.
2. **The subset validator** — ADR 0053, the maintainer's choice at the draft — and the one decision
   it forces: an unknown keyword is refused, never ignored (Q278).
3. **The grammar change** — ADR 0054 — and the corpus that shows it: 146 task nodes, eleven pool
   keys, every worker that read its payload whole (fact 4).

**Out** — named, with where each goes

- **Building anything.** No pool, no group, no driver is constructed here; the document is validated
  and typed. Construction is W66's.
- **Run-time enforcement of `inputSchema` and `outputSchema`.** Declared and carried; P19's.
- **Rewriting `examples/**`.** W67's, the corpus under `examples/flows/` included — this item
  migrates `spec/examples/**` and the `test/**` fixtures only, and the L6 rows keep running on
  `workerType` until W67 because ADR 0054's refusal lands in the validator and L6 is not migrated
  here. *(If that ordering fails — the validator refusing `workerType` breaks every L6 row the
  moment W65 ships — the migration of `examples/flows/` moves into this item as a declared
  exception, and the plan's Record says so.)*

## Exceptions

*Seeded from the plan's own table, on P16's and P17's finding that the previous item's late table
predicts the next's.*

| path | why |
|---|---|
| `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | predicted: `C7` reads typed tasks against `registry.json`'s `nodeTypes` and `languages` (W61's table) and the registry document's shape moves under it; `C4`'s refusal count moves when `FD-V23` and `FD-V34` fold; a probe and a `META` entry per new clause |
| `scripts/build-browser-tests.mjs` | predicted: it inlines `spec/examples/**` JSON; the registry document is one more fixture (W54's shape) |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted: `RUN_FLOOR` moves if a snippet is deleted rather than migrated; declared before the first `AGENTS.md` edit |
| `scripts/check-markdown.mjs` | predicted NOT to fire: the declaration retuned `M3` for this plan's four documents; this item adds two under `doc/decisions/`, which the one-directory probe cuts. Checked against the fixture before the first document |
| `examples/flows/**`, `examples/run-flow.ts`, `examples/l6.ts` | **predicted as the one late exception this item may have to take**: if the validator's refusal of `workerType` cannot be staged behind W67 (Scope Out, last bullet), the L6 corpus migrates here. Declared so that taking it is not undeclared. **Measured at the declaration step (below): it cannot be staged, and the reason is wider than the validator — put to the maintainer before any file under it is edited** |
| `src/driver/driver.ts` | **declared at the declaration step, before any edit to it**: the plan's own row for this item retires `DriverOptions.workerTypes` and `Registry.workerTypes` (decision 14, Output (3)), the dispatch site reads `node.workerType` (`driver.ts:2063`), the construction loop reads a type's `settings` as a FUNCTION, and `effectiveSettings` must merge a type's defaults under a node's (decision 12) — and `src/driver/**` is in no P18 item's `Owns`. *(This row said the edits were "confined to those four sites"; the diff also adds `checkRegistry` at construction, the `workers` and `pools` options, and an `isDerivation` guard in the groups loop — the conformity reader, finding 23.)* |
| `deno.json` | **late**: the two new modules under `src/definition/` must be in the JSR publish allowlist (`check:source` `S6` said so on the first run) |
| `index.ts` | **late**: the root re-exports `schema.ts` and `registry.ts` — the driver applies the subset and the eleven refusal classes are the consumer's to catch |
| `spec/outcome-record.md`, `spec/run-state.md` | **late**: the corpus split those documents state (16 of 169 task nodes; 153, 91%) moved when `pooled.flow.json` joined the corpus — W58's and W63's exception, a third time |
| `examples/README.md`, `examples/workers/flow-worker.ts` | **late**: the conditional exception named three `examples/` paths and the migration reached the worker (one unwrap expression) and the README's counts and prose |
| `src/scheduler/envelope-worker.ts` | **late**: two doc comments named `NodeType.worker` and `NodeType.config`, a type this item removed — comments only |
| `doc/decisions/0049-*.md`, `doc/decisions/0051-*.md` | **late**: the amended records carry a pointer to ADR 0054 on their status lines and beside each clause it retires — the repository's precedent (ADR 0013, ADR 0023); the conformity reader, finding 12 |
| `doc/concept.md` | **late**: one clause — *nodes bind to a `workerType`* — in the front-door document, in nobody's `Owns`; the conformity reader, finding 14 |
| `src/scheduler/bootstrap.ts`, `test/scheduler/bootstrap.test.ts` | **declared at the declaration step, conditional on the maintainer's answer to stop-and-ask 1**: the helper reads a node type's OLD shape (a worker URL, a function validator, `inline` inside `pool`), so any change to that shape — which Outputs (1) and (3) make — breaks it at L0 whatever happens to the grammar. If the L6 corpus migrates here, the helper reads the new shape here; W66 still reduces it to the identity derivation's factory |

## Declaration step — what was re-run, and what was found wrong before anything was built

*Section 1 rule 5: the facts this item was handed were re-run rather than transcribed. Taken
2026-09-15 on `88b061b` with the tree clean; the HEAD digest re-derived from git objects by
`dev-dist/w65/digest.mjs --head` reads **`fb44d585eb1c4386` over 301 files**, the brief's figure
(the plan's baseline paragraph records `a9b3a97ac4425633`, the digest of the declaration's
UNCOMMITTED tree — a different tree, and both are right about their own).*

| fact | re-taken | held? |
|---|---|---|
| 1 — the subset covers the sample | `dev-dist/p18/subset-validator-check.mjs` under Node 24.20.0 and Deno 2.9.6: **14/14 as expected**, both (`dev-dist/w65/fact1-*.log`) | yes — and rewriting the prototype found two things it did not state: it IGNORES an unknown keyword (Q278's whole subject, measured: `{ type: 'string', pattern: '^s' }` accepts `'x'`) and `type: 'number'` admits `NaN` and both infinities by `typeof`. Both are ADR 0053 facts now |
| 2 — `ResourceGroup` requires `canRun` and `getMetrics` | read off `node_modules/fyflow-scheduler/dist/types/groups/resourceGroup.d.ts` at 0.5.2: `id`, `type`, `keyed?`, `keyFor?`, **`canRun(key?, cost?)`**, `onStart?(key?, cost?)`, `onFinish?(key?, cost?)`, **`getMetrics()`**, `getStats?`, `describe?`, `read?`; the three constructors `(limit, id?)`, `(windows: RateWindow[], id?)`, `(windows, options?: { id? })`, `RateWindow = { limit, windowMs }` | yes |
| 4 — the migration is 146 nodes in 42 flows | `dev-dist/w65/fact4.mjs` over both corpora: **42 flows, 146 `workerType` nodes, 20 typed, 0 both, 166 task nodes**; per key IngestWorker 26, ScoreWorker 45, ReviewWorker 11, PublishWorker 41, ExtractWorker 2, MergeWorker 4, TallyWorker 3, SplitWorker 11, WeighWorker 1, AttestWorker 1, RetryWorker 1; the eleven roles read `payload` whole (`confidenceOf(payload)`, `payload.text`, `payload.item`) and only `typed` and `echo` read an envelope | yes, to the node |
| 5 — what `bootstrap` hands `WorkerManager` | `dev-dist/w65/fact5.mjs` through `createPool`, Node and Deno **byte-identical**: `Echo` `{maxThreads:2, inline:false, idleTimeout:0, config:{worker,config:{role:'echo'}}}`, `Scorer` `{maxThreads:2, inline:true, idleTimeout:0, groups:['scorer'], config:{worker,config:{role:'typed'}}}`; a `groups` key ABSENT on `Echo`; key ORDER `maxThreads, inline, idleTimeout, (groups,) config` | yes — **and the order is today's object literal's, not a rule's**: `WorkerManagerOptions`' own declaration order is `maxThreads, maxConcurrentTasks, idleTimeout, idleCheckIntervalMs, inline, config, groups, residentGroups`, and an options bag has no order the scheduler reads. So prediction 2's *byte for byte* is met as CANONICAL JSON (keys sorted at every level), stated in `registry.ts`'s header and asserted in `test/definition/registry.test.ts`; *reordered* in the prediction's reversal column is not an observable |
| 9 — `M3` | the one-directory fixture counted before the first document: **93** against the floor of 107 (whole tree 121, both directories removed 74); this item's two decisions land under `doc/decisions/`, which probe 1 cuts | predicted not to fire, and the count says so; re-checked on the tree that ships (Record) |

**What was found wrong or missing, before anything was built.**

1. **The ordering the item's Scope Out relies on does not exist, and the reason is wider than the
   validator.** Measured: **24 of 24** flow documents under `examples/flows/` carry `workerType`,
   and so do both `spec/examples/valid/` flows `l6.ts` imports (`fanout-join`, `p1-routed-away`);
   `l6.ts` has **48 row definitions over 50 real runs** and every one is one of those documents. So
   the validator refusing `workerType` fails every L6 row at `new Driver`. **And it is not only the
   grammar**: `examples/run-flow.ts`'s `NODE_TYPES` and `src/scheduler/bootstrap.ts` both read
   the OLD node-type shape — a worker URL, a function validator, `inline` inside `pool` — so
   Outputs (1) and (3) break L0 (`typecheck:examples`) and L6 even with the grammar untouched.
   Staging behind W67 is impossible. Put to the maintainer (stop-and-ask 1) with three roads priced.
2. **`src/driver/**` is in no P18 item's `Owns`, and this item's own Outputs row edits it four
   ways** (decision 14; the dispatch site; the construction loop; the settings merge). Declared above.
3. **The plan's sketch types `inline` as required on `NodeTypeDefinition`**; fact 5's rule — omit,
   never default — applied to `inline` makes it OPTIONAL on both forms, absent meaning the
   scheduler's default and the options bag omitting the key. Recorded here and in the spec table.
4. **`spec/examples/registry.json` carries a `note` key**, which a registry DOCUMENT refuses as
   undeclared; its content moves into section 7's paragraph when the file becomes a document.
5. **The test-side size, for stop-and-ask 2**: `workerType` occurs **402 times in 28 files under
   `test/`** (327 node literals, 131 registries naming `workerTypes`), and **50 lines in 11 files**
   read a dispatched task's `.payload` — the assertions prediction 1 says move (what a bare node's
   worker RECEIVES), none of them a routing or fold assertion. `spec/examples/**` is 36 files
   validated and never run, so nothing there reads a payload; `test/**` has no worker roles at all
   (its fakes settle fixture results), so *rewrite the workers* has no instance below L6.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck`, read by `$?` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected, read by exit code; baseline P18's declaration numbers, re-taken |
| L4 | `npm run check:spec` — the refusal count and the example index both ways |
| identity | a test comparing, for every entry of the L6 harness's `NODE_TYPES` and for the sample's types, the derivation's `PoolSpec` to fact 5's captured `WorkerManagerOptions` as JSON text |
| readers | conformity: the spec's registry section and ADR 0054 first, every refusal re-derived on paper before a fixture is read; adequacy: isolated copy, the subset's keyword list, the folded rules and the derivation's merge mutated |

*Routing cases: not applicable — this item dispatches nothing. A branch routed away (Q4),
`user_action` (Q17), no matching edge (Q10), a duplicate task id (Q13), a nested fan-out (Q6) are
all W67's on the migrated corpus.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w65/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); rule 8's harness (`dev-dist/w65/rule8.mjs`, W63's with a `spec`
rung) carries a control, asserts every restore byte for byte, checks each edit's anchor against the
CURRENT text, undoes what an aborting probe applied, RUNS every declared ceiling against the rung its
reason names, re-runs W63's three ceilings whose anchors this item moved, and holds the tree still by
a content digest. **Every expected value was written from `spec/` and from P18's facts before the code
ran** — fact 1's fourteen cases, fact 5's two captured option objects, the key tables, the refusal
table — and the fixtures that trip each refusal were written before the resolver was.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | Started on `88b061b`, tree clean, HEAD digest `fb44d585eb1c4386` over 301 files re-derived from git objects and equal to the brief's; facts 1, 2, 4, 5 and 9 re-run (the table above), six things found wrong before anything was built — the first of them the item's own ORDERING, put to the maintainer with three roads priced |
| stop-and-ask | four, all answered before the edit they gated | 1 migrate `examples/**` here (with `src/scheduler/bootstrap.ts` and its test as exceptions); 2 move the test expectations to the envelope; 3 the dispatch diff shown and approved as shown; 4 two ADRs, 0053 and 0054 |
| L0 | GREEN | `lint` 0 (red twice on the way: an unused import the examples patch left, and a `no-prototype-builtins` on the first closure of `d6`); `typecheck` 0 across all five sub-typechecks (red three times on the way — a range edit that cut two fields of the L6 list-reader's return type, an identifier the driver test could not see, three backtick apostrophes inside template literals) |
| L1-L5 | GREEN | **40 files / 1065 assertions in node 24.20.0, deno 2.9.6, chromium, firefox and webkit** — from 38 / 979 at the declaration: 1041 at code-complete, 1046 after the author pass, 1065 after the readers (the two readers' fixtures) |
| L4 | GREEN | `check:spec` **7 / 55 / 105 rules, 34 definition refusals** (from 7 / 55 / 104 / 35 — `FD-V38` added, `FD-V5` and `FD-V34` retired and held), `C7` reading the registry DOCUMENT and the pool clauses, `C4` binding the spec's own count paragraph (`d1`); `check:spec:selftest` **31 probes / 29 graded**, one by the failure COUNT |
| L6 | GREEN | **1502 assertions over 50 real runs in node AND deno** (from 1501 / 50 — the retry clause of block (2b) became a pair), **the typed rows' numbers unmoved** (prediction 2); thirteen document types over ONE worker entry, no `pool()` line, every pool through `bootstrap`; the first run had FIVE failures, all this item's (below) |
| checks | GREEN | `check:source` (red twice on the first run: `S3` read the identifier `document` as the DOM global, `S6` wanted the two new modules in the JSR allowlist), `check:docs` **28 snippets, 22 run** with the new `X7` (`d4`) and its self-test **22 / 12**, `check:markdown` **123 documents, 5273 relative links, 263 anchored** (after the record step), `check:wiring`, `check:policies`, `check:scheduler` all 0 |
| `M3` | predicted not to fire, and did not | the one-directory fixture stays at **93** against the floor of 107: both of this item's documents land under `doc/decisions/`, which probe 1 cuts (30 files there now); `check:markdown:selftest` green in the gate |
| rule 8, author pass | **80 probes: 1 control green, 65 caught, 6 declared ceilings each RUN against its rung, 6 measured, 1 UNDECLARED survivor, 1 abort, 0 crashes, 0 against declaration** | `d1` survived — the spec's own count paragraph was bound by nothing — closed by a `C4` clause; `d6` aborted on a moved anchor and reading the test it aimed at found the class list HAND-WRITTEN and bound by a literal `11` (obligation (e)'s third shape), closed by discovering the list from the module; `d4` measured 0 twice — AGENTS.md's refusal count was compared to nothing — closed by `X7`; `d3` measured 0 (a source comment's count, left); `b13` measured 0 (Q217's shape, below); `b11`'s first cut was VACUOUS — the count assertion weakened with no row deleted measured nothing, an instrument defect, re-cut; **reverting the envelope on the bare road costs 114 at L6** (`rev65`) |
| own id | measured | `W65` outside `doc/` and `dev-dist/`: **101 hits in 32 files**, every one this item`s own annotation — section 1 rule 5`s third direction (W59 recorded 108 in 23) |
| readers | **26 / 12 blocking and 21 mutations (4 controls, all caught) / 16 survivors / 12 blocking, OVERLAP 2** | The **thirty-eighth** measurement, inside the 0-4 band, neither primed; the two shared subjects — `GroupTypeMissing`'s second clause with no fixture, and what `checkRegistry` runs at `new Driver` (which ADR 0054, the spec and `AGENTS.md` §9 all overclaimed as "every refusal") — reached from opposite ends. The conformity reader found claims that were false: the reach of `checkRegistry` in three documents, `FD-C5`'s row not moved to v0.19, the subset's size stated as the PROTOTYPE's (1.5 KB where the shipped module is **4 259 bytes**), ``in`` walking `Object.prototype` at three sites (a constraint dropped in silence — Q278's own reason), four refusal clauses without a fixture, two amended ADRs with no pointer, `spec/` **104** where `check:spec` says 105. The adequacy reader found bounds that were not there, every one a direction the author's 80 probes never took: the schema walk observed at depth 1 only (three levels down, `integer` inside a type list, a closed object inside `items`), **the driver's shape half** — one schema of four, one type-shape clause, and NO undeclared-key check on a worker or a pool, so a hand-built driver with `settingSchema` (a typo) applied no schema at all (P1, a real hole, closed in code) — the transforming road dropping a type's defaults, another type's DEFAULT named as a pool, a resident-only group read as "used by nothing", and **no class-form type reaching `new Driver` in any suite**, which is this item's own Gate line (*both shapes of a node type*) instantiated in the resolver's suite and not the driver's. Every finding acted on; their exact edits are probes (`rc*`, `ra*`) |
| re-run, tree held still | **103 probes: 1 control green, 91 caught, 6 declared ceilings each RUN against its rung, 5 measured, 0 UNDECLARED survivors, 0 crashes, 0 against declaration** — and one abort, `a3`, re-anchored and CAUGHT on its own run (`dev-dist/w65/rule8-run-2.log`, `rule8-run-3.log`), digest `ac9135f68a373f43` over 311 files before and after every probe | the author's 80 plus `d1b`, `d7`, the re-cut `b11` and `d6`, the conformity reader's six code edits and the adequacy reader's fifteen; `a3` aborted on the anchor the conformity fix moved (`in` to an own-key check — rule 7 (b) firing correctly) and was re-anchored and re-run |
| ceilings, re-run at P18's RETRO | **all six RE-RUN on the tree the plan ships; all six ABORTED on their original anchors (rule 7 (b) firing correctly), and re-anchored: three HOLD, one is a CATCH, one was re-run by W67 and holds, one's SITE no longer exists** | *Added by [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s retro under `doc/workflow.md` section 6 pass 3 rule 6, because a ceiling is a claim and this one had expired.* **`e7` is a CATCH**: it said *the driver handed `pools: {}` — set-equal to POOLS until W67 brings a named instance*, and its own reason names the item that would expire it (*a ceiling with a date*). W67 brought `prompt-big`, and re-anchored onto the same value where it lives now (`registry.pools` in `src/scheduler/runtime.ts`, the site W67's rewrite moved it to) the probe is **exit 1, 1 fail line — the `triage LOW` row** (`dev-dist/p18-retro/ceil-w65-reanchored.log`). **`b15` was re-run by W67** as its own `a11`, which its `why` says in as many words, and HOLDS — the 4x is still inert at L6. **`c5`'s site was DELETED**: `registryFor`, `NODE_TYPES`, `POOLS` and `WORKERS` are gone from `examples/**` as code (two prose mentions remain), so the two readings of one literal it named have collapsed into the document and the claim has no instance — neither confirmed nor falsified. The three `RUN_FLOOR` rows re-anchor 23 -> 22 (W66 raised the floor) and HOLD |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries — on the FIRST run over the final tree** (`dev-dist/w65/gate.log`; selftests 7/7 completed, 7 ok, 571.9 s wall; L1-L5 40 / 1065 in node, deno and chromium, L6 1502 / 50 in both, `M3`'s fixture green in `check:markdown:selftest`) | digest `fac808027713cc4d` over 311 files before and after — the tree the gate ran over, to which this row and the two index lines were then added |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `NodeTypeDefinition`, `PoolSpec`, the worker entry, the group type, the registry document; the document form as the identity derivation | `src/definition/types.ts` (`WorkerEntry`, `PoolSpec`, `NodeTypeDefinition`, `NodeTypeDeclaration`, `GroupType`, `RegistryDocument`, `RegistryCode`, `ResolvedRegistry`), `src/definition/registry.ts` (`nodeTypeFromDeclaration`, `poolOptionsOf`, `derivePool`, `resolveRegistry`, `checkRegistry`); fact 5's two captured option objects reproduced as CANONICAL JSON with `groups` absent where none is declared, and again through the helper | `a11`-`a14`, `c1`, `c2`, the bootstrap fact-5 test |
| (2) the built-in subset validator, ADR 0053, Q278 decided, fact 1's fourteen cases | `src/definition/schema.ts`: twelve keywords compared to the spec's table both ways, a keyword outside REFUSED naming it, every keyword's value shape checked at construction, fact 1's table asserted row by row, 4 259 bytes bundled | `a1`-`a10`, `b1`, `b2`, `p3`, `p4`, `rc7`, `ra1`-`ra3` |
| (3) the grammar — ADR 0054: `type` required, `pool?`, `workerType` retired; `FD-V23`/`FD-V32`/`FD-V34` folded; `FD-V33` a schema over the merged settings; `FD-V38`; `Registry.workerTypes` and `DriverOptions.workerTypes` retired | `spec/flow-definition.md` v0.19 (§2's typed subsection, §3's registry subsection with eight tables, §5's rows, §7); `src/definition/validate.ts`; `src/driver/driver.ts` (the envelope on every dispatch, the pool key, `checkRegistry` at construction); 34 refusals | `a21`-`a31`, `d1`, `d1b`, `d2`, `e1`, `e2`, `ra21`, `ra45`, `ra46` |
| (4) the corpus migrated | `spec/examples/registry.json` a registry document (seven workers, two groups, seven types, one named pool); **74 flow documents, 199 `workerType` sites, every one `type`**; three invalid examples removed, two invalid and one valid (`pooled`) added; `spec/README.md`'s rows; `examples/**` too (stop-and-ask 1) | `b7`-`b10`, `e1`, `e4`, `p1`, `p2`, the corpus census |
| (5) every construction-time refusal as a named class with a trip and a no-trip fixture | eleven `RegistryError` subclasses, enumerated in the spec's table and discovered from the module in the test; the ordering across kinds fixtured; the driver's shape half fixtured at `new Driver` | `a15`-`a20`, `b5`, `d6`, `d7`, `rc6`, `rc21`, `rc22`, `ra6`, `ra7`, `rap1`, `rap2` |

**What broke.**

1. **The item's own ordering did not exist**: 24 of 24 L6 flows carried `workerType` and the harness read the old type shape, so staging the grammar behind W67 was impossible whatever the validator did — the maintainer chose to migrate `examples/**` here.
2. **W19's foreign tasks landed on envelope-fronted pools with a raw payload** and six settled `user_action` under `NotAnEnvelope` where the row expects `task.completed` (two of the first L6 run's five failures): since every pool is a type's, a task that is not a flow's must carry the envelope too (`runPair` wraps it; Q280).
3. **Two cross-row clauses discriminated on *typed*, which every node now is** (the typed pair's settings, the type's retry budget), and their subjects list named the old strings — three of the five; re-cut on *carries `settings`* and *declares no policy of its own*, the second as a PAIR with both halves asserted.
4. **A count in prose was bound by nothing three times over**: the spec's own version paragraph (`d1`), AGENTS.md's refusal sentence (`d4`), the validator's header (`d3`) — two are checks now, the third is a comment.
5. **`in` walked `Object.prototype`** at the three object-keyword sites: `required: ['constructor']` was satisfied by `{}` and `{ toString: 1 }` passed a closed object — a constraint dropped in silence, the very thing Q278 refuses, found by the conformity reader re-deriving the keywords on paper.
6. **`checkRegistry` skipped the undeclared-key check on a worker and a pool** (P1, P2): a hand-built `Driver` handed `settingSchema` applied no schema at all and every settings value passed — closed in code, fixtured at the driver; and three documents said `new Driver` runs "every" refusal where it runs six of eleven.
7. **A hand-written list of eleven classes bound by a literal `11`** survived a twelfth (`d6`'s reading) while AGENTS.md section 9's DISCOVERED list caught the twelve new classes on its first run — Q101's mechanism working and its absence one file over.
8. **The self-test refused two META entries with one mutation** — the co-firing entry and W59's typed-flow entry both disabled the type clause once the `workerType` clause was gone; `C4`'s headline probe was pinned to 35 (rule 7 (b), re-anchored).
9. **`S3` read the identifier `document` as the DOM global** — a parameter named after the concept collides with a check's word list; renamed.
10. **A worker's `settingsSchema` is the WORKER's**, so two types over one module share it: §13's snippet needed two entries over one URL so the type whose nodes carry no settings has a schema-less entry (found by `check:docs` `X4` on the rewritten snippet; Q282).
11. **The migration harness read the ORIGINAL bytes for two edits on one file** and the second overwrote the first — W37's and W58's defect verbatim, in a one-off script this time — and a range edit cut two fields of a return type, caught at L0.
12. **Q186's cost ratio fell below 8x** because the envelope adds constant bytes to every payload — measured over `input` now, ~9.2x.
13. **Four backtick apostrophes inside template literals**, two caught by the typecheck and two by the runner — the repository's own house style for test names, in the one string form that reads it as syntax.
14. **The Gate line named L0-L5 and `check:spec` and not L6**, and L6 is the only rung that sees the cross-row layer — the adequacy reader's M11 was caught by `DECLARED_TOTAL` alone (Q217's shape, `b13` and M11b: a clause deleted with its subject and both counts is green while the scheduler holds a fourteenth pool).

**What this taught.**

- **Retiring a distinction moves every clause that discriminated on it**: *typed* against *bare* was the discriminator of three L6 clauses and a membership list, and all four went wrong at once on the first run — a migration is not done when the corpus validates.
- **A list DISCOVERED beats a list DECLARED, twice in one item**: the section-9 snippet enumerating the package's own error classes caught twelve new ones for free; the registry test's literal eleven would have passed a twelfth. The class list, the keyword list and the checked-schema list are all read from a source now.
- **The readers' split held for the thirty-eighth time**: the conformity reader found claims that were false (a function's reach stated in three documents, a size that was the prototype's, a row not moved); the adequacy reader found bounds that were not there (depth, lists, the driver's half of the shape checks, the class shape at the driver) — and its sharpest finding, P1, was a probe and not a mutation: the code as it stood accepted a typo that silenced a schema.
- **Both shapes of a type must reach every rung the claim names**: the Gate line promised obligation (a) over both shapes and the driver's suite had only the document form, so a driver blind to a class's policy and defaults was green everywhere.
- **A rule 7 (b) abort is a reading**: `d6`'s moved anchor was the instrument, and reading the test it aimed at found the defect the probe was written to find.
- **A check's word list is a namespace**: `S3`'s DOM globals and a parameter called `document` are one string, and the refusal was right to be dumb.

**Questions raised.** [Q280](../open-questions.md) (a task that is not a flow's, on a shared scheduler, must carry the envelope now that every pool is a type's — is that stated to a consumer, or does a bare pool need an escape hatch?), [Q281](../open-questions.md) (the driver's registry and the registry DOCUMENT are two shapes of one thing — `groups` a list of keys against an object of factories, `predicates` a map against names — and `corpusRegistry` converts; W66's `runtime.registry` decides which shape a consumer holds), [Q282](../open-questions.md) (a `settingsSchema` belongs to a worker, so a type whose nodes carry no settings needs a schema-less ENTRY over the same module — should a type be able to narrow or declare its own?), [Q283](../open-questions.md) (`checkRegistry` and `resolveRegistry` are two functions that must agree on the SHAPE checks, and two were missing from one — nothing binds the two halves but fixtures), [Q284](../open-questions.md) (prediction 2's *byte for byte* is met as canonical JSON because the options' key order is today's literal's — should the spec fix an order, or say order is not an observable?); [Q217](../open-questions.md) extended with block (2b)'s one-observer clauses.

