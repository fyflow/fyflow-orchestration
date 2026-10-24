# P43 — What do a flow and a run say as DATA rather than as prose?

**Status:** complete and retro'd 2026-10-24 — W208-W212 done, `gate:full` EXIT 0 on W212's final tree (the Record); the retro raises TWO stop-and-asks (section 8 (a) and (b)), routings of later work, OPEN for the maintainer and blocking nothing. Earlier: declared 2026-10-23 — on `26c55ed` (the tree clean, `main` at 0.10.0, published, `origin/main` equal), answering fyflow-app's *pass 4* #1-#6; facts 1-9 read at this declaration; stop-and-asks (a)-(h) ANSWERED by the maintainer 2026-10-23, all as recommended; W209-W212 each wait on the item before them.
**Question this plan answers:** *what can an author, an agent and a host read of a flow and of a run as DATA — a
definition's shape as a JSON Schema, plain and specialised to a registry; a failed task's error, from the nodes its
failed edge leads to; whether a tried transform threw or failed its consumer's schema; and when an ask was asked — where
today each is prose, a panel, or nothing?*
**Exit artifact:** *on the final tree: (1) `definitionSchema()` — a plain JSON Schema draft 2020-12 object built from the
validator's own exported key sets — held by a test-only 2020-12 validator to ACCEPT every valid corpus flow and to REFUSE
every invalid corpus file whose rule is shape-only, and `definitionSchema(registry)` held the same way against
`spec/examples/registry.json` and the registry-specialisable invalid files, green in `npm run gate:full` and in all three
L0-L5 runtimes, each refusal claim with a control; (2) an L2 suite holding a `needs` reference to a node's ERROR equal
to the outcome record's `error` after a failure edge, `null` where that output succeeded, in its bare, `?` and array
forms, values derived by hand from the spec; `transform-fails`' `cause` reached on both branches; the `asked` element's
`observedAt` from the driver's clock, KEPT across a resume from every stored prefix, an older checkpoint's `asked`
element without one resuming equal; (3) one block in `examples/l6.ts`, green in node 24 and in deno, on a threaded and
an inline pool, in which an ask after a failure edge is handed the failed task's error, and an ask's `observedAt` is the
same before and after a resume from a store once the first runtime is gone, each claim with its control; and
`npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W208-W213 (W213 expected unused), Q770-Q779, ADR 0130-0134 (ADR 0133 and ADR 0134 expected unused); no S id

```
Question: what do a flow and a run say as data rather than as prose?
Items:    W208 (#3 cause, #4 observedAt, #5 Q760 resolved, #6 withdrawn), W209 (#2 a reference to a node's error),
          W210 (#1 the static shape schema, the test-only validator, its ADR), W211 (#1 the registry-specialised schema),
          W212 (the exit artifact on real workers, the reply to fyflow-app, P43's Record and retro)
Reserves: W208-W213 (W213 expected unused), Q770-Q779, ADR 0130-0134 (ADR 0133, ADR 0134 expected unused)
Raises:   no question at this declaration; no S entry. Q760 is RESOLVED by W208's record step ((f1))
Baseline: ids derived by `npm run state` at this declaration — P43, W208, Q770, ADR 0130 from the tree and W208, Q770,
          ADR 0130 from the ledger, which AGREE. The ladder counts are NOT taken here and are W208's declaration step's
Measured: NOTHING re-run at this declaration. Facts 1-9 are READ, at `26c55ed`, with file:line. ADR 0053's bundle
          figures are cited, not re-taken; W210's declaration step re-takes them at the pin it chooses
```

## Why this plan, and why now

The app's M4 hands its Host to AI agents over MCP: they write a whole `FlowDefinition` in one call, validate it, run it
and answer what waits for a person. **Every one of pass 4's asks is something this library already KNOWS and says only as
prose or not at all**: the shape of a definition lives in `validateDefinition`'s code and `spec/flow-definition.md`, and
an agent learns it from a guide and from findings after each attempt; a failed task's error is in its outcome record and
in `RunState.nodes`, and nothing a flow composes can reach it; whether a tried transform threw is a prefix of `why`'s
English; and an `asked` element carries no time where every outcome record does. Two of the asks were DEFERRED with a
condition the app now meets — pass 1 #15 *"revisit before the app's M4"* (P37) and pass 1 #12 *"revisit when an ask after
a failure edge is designed"* (P35) — and two close what earlier plans left open (#5, #6). **The maintainer answered
(a)-(h) on 2026-10-23, all as recommended** (*"As recommended"*).

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass4.md` (read, not edited).

| the app's clause | where it is answered |
|---|---|
| **#1** — *a published JSON Schema (draft 2020-12) for the shape of `FlowDefinition`: every node kind and its keys, edges, conditions, transforms, `needs` references, with `description`s; cross-node rules stay with `validateDefinition`* | (a1): **accepted** — `definitionSchema()`, built IN CODE from the validator's exported key sets (fact 1), hand-written `description`s per key; the cross-node rules stay `validateDefinition`'s and the schema's own `description` says so (W210) |
| *ideally one specialised to a registry … for example `definitionSchema(registry)`* | (a1): **accepted, as the second item** (W211) — what a registry can carry and what it cannot (fact 2) |
| *keep our guide honest: we could check its examples against the schema too* | (b1): the schema is held to the corpus by a 2020-12 validator in OUR tests, so the app's check of its guide is the same check (W210) |
| **#2** — *the failed task's error, as the string the scheduler reduced it to, reachable by the nodes its failed edge leads to: e.g. `"lookup!error"`, `{ "error": "lookup" }`, or the failed edge handing `{ error }` by default* | (c1): **accepted as a `needs` reference form naming a node's ERROR** (W209), its exact grammar the item's; the default-input form declined ((c2), BREAKING) |
| *a structured code can wait for the scheduler* | unchanged — P35's row: the scheduler reduces an error to `error.message` (fact 5) |
| **#3** — *a field on `transform-fails` saying whether the expression threw or its result failed the schema, e.g. `cause: 'threw' \| 'schema'`, or two kinds* | (d1): **accepted as the optional field** (W208); two kinds declined ((d3)) |
| **#4** — *`observedAt`, the same clock as an outcome record's, on the `asked` input* | (e1): **accepted**, optional, from the driver's `now`, KEPT across a resume (W208, fact 7) |
| **#5** — *Q760 (the input after a transform): the road serves, close it* | (f1): [Q760](../questions/q760.md) **resolved** by W208's record step, citing this plan and pass 4 #5 |
| **#6** — *pass 1 #11 (resume notices a changed definition): withdrawn; keep it for other hosts if you like* | (f1): **recorded WITHDRAWN here**; [Q372](../questions/q372.md) and [Q249](../questions/q249.md) stay `deferred`, for other hosts (fact 9) |
| *Q186 on our Host on 0.10.0* — fetch-then-map 1.3 / 5.7 / 17.3 s at 40 / 67 / 93 MB; `"$payload"` in a map accepted for every node but an ask | acknowledged in the reply (W212) — P41's Record stands, nothing built |
| *an ask inside a map reading `"$payload"` keeps a copy per instance; if you ever want to share that kept value, tell us — we are not asking* | (g1): **not pursued**, and the reply says why (fact 8) |

## Facts read at this declaration

**Fact 1 — the definition's shape is CODE, and its key sets are already exported.** In `src/definition/validate.ts` at
`26c55ed`: `ASK_REFUSED_KEYS` (`:73`), `EDGE_KEYS_DECLARED` (`:83`), `NODE_KEYS_DECLARED` (`:97`), `RETRY_POLICY_KEYS`
(`:106`) and `KEY_PATH_RE` (`:265`) are exported, and `index.ts:3` re-exports the module whole, so all five are package
surface today; `ID_RE` (`:30`) and `KINDS` (`:35`) are module-private. `PREDICATE_OPS` is `src/definition/types.ts:91`.
The node interfaces run `TaskNode` (`types.ts:535`) through `AskNode` (`:822`), `FlowNode` (`:851`), `FlowDefinition`
(`:853`); the prose is `spec/flow-definition.md` section 1 (`:577`) and section 2 (`:595`). **No definition schema
exists anywhere** (`definitionSchema` has no hit in `src/`, `test/`, `examples/` or `AGENTS.md`), and **a definition's
keys carry no `description`**: pass 1 #20's `description` is an ANNOTATION inside a registry's schemas
([ADR 0098](../decisions/0098-four-annotations-join-the-schema-subset-and-constrain-nothing.md)), not on the definition.
Every reference form is parsed by ONE function, `referenceTarget` (`validate.ts:1054`, its helper `aimed` `:1074`),
which the driver (`src/driver/driver.ts:26`) and the wiring check (`src/definition/wiring.ts:94`) import.

**Fact 2 — what a schema can and cannot carry, read against `spec/flow-definition.md` section 5's rule table
(`:2541-2589`) and the invalid corpus (`spec/examples/invalid/`, 52 files named by rule; `spec/examples/valid/`, 26).**

| | the rules | a schema |
|---|---|---|
| **shape-only** | `FD-V16`, `17`, `18`, `21`, `23`, `24`, `26`, `30`, `37`, `42`, `43`, `44`, `45`, `47`, and `48` but for [ADR 0056](../decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)'s example check | expresses each — the static schema refuses every such file |
| **partly shape** | `FD-V7`, `8`, `9`, `25` | a clause each (`edges` present or absent, a `branches` floor, `over`'s pattern); the graph half stays `validateDefinition`'s |
| **registry-specialisable** | a task's `type` enum with an `if`/`then` per type (its `pool` enum, its `settings` schema, `transform.lang`'s enum); `workerGroups` from the registry's groups; a predicate name's enum; a gate's `type` enum, its `settingsSchema`, and a STATIC gate type's `route` enum — `FD-V31`, `32`, `35`, `38`, `39`, `4`, and `46`'s transform-only types | carried by `definitionSchema(registry)` (W211) |
| **not cleanly** | `FD-V33`'s `required` WEAKENED by a type's settings defaults; a DERIVED gate's routes (`routesFor(settings)`); `FD-V41`'s *each route wired exactly once*; a task type's `inputSchema`, which is RUNTIME input and so an annotation only; and every cross-node rule (`FD-V1`-`3`, `6`, `10`-`13`, `19`, `20`, `22`, `27`-`29`, `49`) | stays `validateDefinition`'s — the schema's own `description` names the authority ((a1)) |

**This classification is the declaration's reading, made from the rule table and the files' names.** W210 and W211
re-take it file by file before writing the test's expected lists; a file that moves class is stated in that item's
Record, never absorbed into a test edit.

**Fact 3 — the validator ADR 0053 priced, and where it may live.** `package.json:136-137`: the runtime dependencies are
`jsonata` 2.2.2 and nothing else; `:126-131` the development ones. [ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
priced `ajv` 8.20.0 at 262,431 browser-bundle bytes over five packages (`:45`) and `@cfworker/json-schema` 4.1.1 at
42,516 bytes with no dependencies, loading in every runtime (`:46`), and refused both AS RUNTIME DEPENDENCIES (`:152-153`).
**A test-only devDependency is a different object** — nothing a consumer installs or bundles carries it — and (b1) is
the maintainer's answer that it says so in its own short ADR. **Two lanes reach a test's imports differently**: the
chromium lane bundles `test/**/*.test.ts` with esbuild (`scripts/run-browser-tests.mjs`, its 60 s whole-bundle wait at
`:122`), and deno resolves a bare specifier through `deno.json`'s `imports` (today `fyflow-scheduler` and `jsonata`
alone) — the file whose `publish` list also governs what JSR ships. **Registry schemas use ADR 0053's subset, which is
valid 2020-12**, so a node type's `settingsSchema` embeds in a 2020-12 document as it stands.

**Fact 4 — `transform-fails` has two causes and one kind.** `judgeTransform` (`src/definition/wiring.ts:953`) is called by
BOTH roads — `checkWiring` (`:878`, the call at `:914`) and `givenVerdict` (`:1024`, the call at `:1047`), which
`tryTransform` (`src/definition/assist.ts:180-198`) calls. It sets `kind: 'transform-fails'` in TWO places: the `catch`
at `:984-988` — an adapter's worker half failing to import, no default export, `compile` throwing, or `evaluate`
throwing — where `sample.result` holds the error's message; and `:994-996`, a result the consumer's `inputSchema`
refuses. `VerdictKind` is `:120`, `VERDICT_KINDS` `:1064`, `WiringVerdict` `:132-146`; `checkWiring`'s counts are keyed
by kind (`:918`) and `assist.ts:318` reads `transform-fails`. `AGENTS.md` section 15 states both causes in one cell
(`:4152`), and a `run` snippet asserts the throw's PREFIX (`:4217-4219`) — the wording the app reads today.
`spec/flow-definition.md:2174` is the verdict table's row.

**Fact 5 — a failed task's error is recorded and is not composable.** An edge's `on` is drawn from `"done"` and
`"failed"` (`FD-V18`, `spec/flow-definition.md:2558`); a failed task's `result` is `null` (`spec/outcome-record.md:144`),
so a successor and a `needs` naming it receive `null`. The error is the record's `error`, `d.error ?? null`, already a
string — the scheduler reduces an `Error` to its `message` (`:145`) — and it is `RunState.nodes[id].error`
(`src/fold/run-state.ts:102`'s `NodeRun`). The driver's output index holds `OutputEntry = { path; result; shared? }`
(`driver.ts:721`) and `resolveReference` (`:5101`) hands `sharedOf` (`:5169`) of the result alone. A predicate already
reads `ctx.outcome.error`. **The whole-node rule** is `spec/flow-definition.md:1658-1661`: *a reference names a whole
node and never a path inside its value*, because a path language would move a read's cost out of the document. An error
is a FIELD OF THE OUTCOME, not a path inside `result`, so (c1) keeps that rule; and `!` is outside `FD-V16`'s id charset
(`validate.ts:30`), so no node id can be read as the new form.

**Fact 6 — the `asked` element carries no time, and the replay compares it whole.** `ask()` appends
`{ kind: 'asked', taskId, input: cloneValue(received) }` (`driver.ts:5454`); its type is `run-state.ts:355`; the fold
keeps `input` on the ask's `NodeRun` (`src/fold/accumulator.ts:408`, `RN-R36`). An `asked` element is REGENERATED by a
replay, never fed (`isFed`, `driver.ts:668`; `RN-R19`, `RN-R37`), and `append` (`:5802`) compares it with the stored
element by `sameData` (`:629`) at `:5816-5818` — every own key, an `undefined` key as absent. **So a fresh `now()` on a
regenerated element would make every resume — and every `inputOf` reading (`RN-R45`), which replays through the same
`append` — refuse `diverged` at the first ask.** `DriverOptions.now` (`:1602`, default `Date.now`, `:2392`) stamps an
outcome record's `observedAt` (`:3111`); `NodeRun` has no time field; `CHECKPOINT_FORMAT` is `1` (`:357`).

**Fact 7 — what (e1)'s copy-from-stored does, in both directions.** Within the stored prefix the regenerated `asked`
element TAKES the stored element's `observedAt`, or has none where the stored one has none (`sameData` reads an
`undefined` key as absent), so every checkpoint written before 0.11.0 resumes and reads equal; past the stored tail
(`RN-R24`'s lost tail) it is `now()`. **The other direction is a consequence, not a refusal this plan adds**: a driver
OLDER than the change regenerates no `observedAt`, so it refuses a NEW checkpoint `diverged` at its first ask — as every
element kind added since the format was set at 1 (`interrupted`, `paused`, `asked`, `attempted`) is refused by a driver that predates it,
`CHECKPOINT_FORMAT` unmoved each time (`RN-R16`: *it moves only when what a checkpoint CARRIES moves*, read as a format
change, not an added optional field). W208's ADR states it.

**Fact 8 — an ask inside a map is copied per instance three times, and the Host persists each.** What reaches an ask is
deep-copied by `ask()` (`cloneValue`, `driver.ts:5454`), again where `freezeInput` (`:1152`) hands an element out, and
once more where the fold keeps `NodeRun.input` (`RN-R2`, `RN-R36`). The app's Host PERSISTS every `asked` element, so a
value shared in memory across instances would not shrink their 413 MB log, and sharing it would amend `RN-R2` (a state
shares no value with its input) and `RN-R17` (a checkpoint is a copy). (g1) declines it.

**Fact 9 — the earlier answers and the register.** Pass 1 #15 was deferred at
[P37](p37-a-runtime-is-its-registry.md) `:95`, pass 1 #12 at [P35](p35-may-a-node-wait-for-a-person-by-design.md) `:69`,
pass 1 #11 at [P36](p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) `:132` — with
[Q372](../questions/q372.md) and [Q249](../questions/q249.md), both `deferred` and broader than the ask. **No register
question tracks #1, #2, #3 or #4**: `npm run q -- --search` with `shape schema`, `definitionSchema`, `error string`,
`failed task's error`, `asked at` and `transform threw`, each `--include-icebox`, matches none; `JSON Schema` matches
[Q278](../questions/q278.md) alone (resolved — a keyword outside the subset). [Q760](../questions/q760.md) is `deferred`.
Spec versions: `flow-definition.md` v0.47, `run-state.md` v0.34, `outcome-record.md` v0.21, `join-policy.md` v0.24,
`runtime-targets.md` v0.13, `task-id.md` v0.16. Package 0.10.0 / 0.10.0, scheduler pin 0.6.0, `RUN_FLOOR` 52
(`scripts/check-docs.mjs:742`), L6 2847 / 238, 78 decisions (`npm run state`).

## Scope

**In** — `cause` on a `transform-fails` verdict and `observedAt` on the `asked` element, surfaced on a suspended ask's
`NodeRun` (W208); Q760 resolved and pass 1 #11 recorded withdrawn (W208, this plan); a `needs` reference form naming a
node's error (W209); `definitionSchema()` with a test-only 2020-12 validator and its ADR (W210); `definitionSchema(registry)`
(W211); the spec, `AGENTS.md` and an ADR where each item needs one; an L6 block, the reply and P43's close (W212).

**Out** — a structured error code (a scheduler ask, P35); a failed edge handing `{ error }` by default ((c2)); a
node-less `"$error"` token ((c3)); finer transform causes or new verdict kinds ((d2), (d3)); excluding `observedAt` from
the replay's comparison ((e2)); a published `.schema.json` file ((a3)); a runtime JSON Schema validator (ADR 0053,
unmoved); the cross-node `FD-V` rules in a schema; sharing an ask's kept input ((g1)); Q372 and Q249 closed; any
`CHECKPOINT_FORMAT` move; the version bump, the push and the publish ((h1), the maintainer's).

## Decisions taken at this declaration

*Each follows from a fact or an answer named beside it; they leave nothing open.*

1. **The schema is BUILT, never written down** ((a1); fact 1). `definitionSchema(registry?)` lives in `src/definition/`
   and reads `NODE_KEYS_DECLARED`, `EDGE_KEYS_DECLARED`, `RETRY_POLICY_KEYS`, `ASK_REFUSED_KEYS`, `KEY_PATH_RE`,
   `PREDICATE_OPS` and the id and kind sets, so a key the validator gains is a key the schema gains or a typecheck that
   fails. `ID_RE` and `KINDS` are exported or shared by W210 as it judges; a description keyed by those sets, so a key
   without one fails at L0. It returns a plain object — `$schema` `https://json-schema.org/draft/2020-12/schema` — a
   new value per call, JSON-serialisable, and its root `description` names `validateDefinition` (and `runtime.check`)
   as the authority for every rule it does not carry.
2. **The emitted schema is not held to ADR 0053's subset.** That subset governs schemas the library EVALUATES; this one
   it emits for others' validators and never evaluates, so it may use any 2020-12 keyword (`$defs`, `oneOf`,
   `if`/`then`, `additionalProperties`, `pattern`). The schemas it EMBEDS from a registry are already in the subset (fact 3).
   W210's ADR states it.
3. **The test-only validator is held where it runs** ((b1); fact 3). W210 pins `@cfworker/json-schema` EXACT as a
   devDependency, and its declaration step MEASURES, before any edit, that it bundles for the chromium lane and what it
   adds to that bundle, and how deno resolves it — a `deno.json` `imports` entry, which W210 shows reaches nothing JSR
   publishes (`deno publish --dry-run`), or a test-local route. **A lane it cannot run in is named in W210's file
   before the edit, with where the suite runs instead** — never discovered at the gate.
4. **The schema's test is the corpus** ((b1)): every valid corpus flow ACCEPTED; every invalid file whose rule is
   shape-only (fact 2) REFUSED, each with a control — the file with its one offending clause repaired, accepted — so a
   refusal for the wrong reason is seen; the registry form the same, against `spec/examples/registry.json`. **The
   expected lists are derived from the rule table, never from the validator's verdicts** (section 5 rule 1).
5. **The error reference aims at the node `"lookup"` aims at** ((c1); fact 5). Its `?` and array forms follow the plain
   reference's, so `FD-V27`, `FD-V28`, `FD-V29`,
   [ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)'s visibility,
   [ADR 0124](../decisions/0124-a-reference-read-costs-its-answer.md)'s index and
   [ADR 0126](../decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md)'s sharing apply
   UNCHANGED — the error being a string, there is nothing to copy or freeze. It resolves to the outcome's `error`, or
   `null` where that output succeeded. It is parsed by `referenceTarget` alone (fact 1), so the validator, the driver and
   the wiring check cannot read it differently. Wherever `FD-V26` accepts a node reference (a node's `needs` and an
   edge's) it is accepted, unless W209 finds a site where it cannot be — then a stop-and-ask, before the edit.
6. **`cause` is set on EVERY `transform-fails`** ((d1); fact 4): `judgeTransform` is shared, so `checkWiring`'s verdicts
   carry it too. `'threw'` at the `catch` (import, export, compile, evaluate alike), `'schema'` at the consumer's
   finding; absent on every other kind. `VerdictKind`, `VERDICT_KINDS` and every count are unmoved, and `why`'s wording
   is unmoved.
7. **`observedAt` is the driver's clock, kept across a replay** ((e1); facts 6, 7): the injected `now`, as an outcome
   record's; a regenerated element within the stored prefix takes the stored element's (or none); `RN-R45`'s reading
   inherits the rule through `append`. The fold surfaces it on a suspended ask's `NodeRun` — an optional field, its name
   W208's, present only on an ask's entry as `input` is. `CHECKPOINT_FORMAT` does not move.
8. **One ADR per item that moves a rule**: W208 ADR 0130 (*a regenerated `asked` element keeps the stored run's time*),
   W209 ADR 0131 (*a reference may name a node's error*), W210 ADR 0132 (*a definition's shape is a schema built from the
   validator, and a test-only validator is not ADR 0053's runtime dependency*); ADR 0133 is W211's if the registry form
   moves a rule, expected unused; ADR 0134 reserved, expected unused. **An item that finds it needs none says so.**
9. **Each changed public surface is stated where it changes** (P33 decision 7 … P42 decision 9): `WiringVerdict` gains
   an optional `cause`; the `asked` `FoldInput` an optional `observedAt`; `NodeRun` an optional field; the `needs`
   grammar a form; the package a root export `definitionSchema` and its types. **All additive** — no existing signature,
   value, element or behaviour moves, so the release is 0.11.0 ((h1)).

### Stop-and-asks — (a)-(h) ANSWERED by the maintainer, 2026-10-23

**All eight are the maintainer's, each answered as recommended** (*"As recommended"*). Nothing waits on the maintainer:
W208 may start.

| | the question | answered / recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **#1 — what the schema is, and where it comes from** | **ANSWERED (a1)**: `definitionSchema(registry?)` in `src/definition/`, built IN CODE from the validator's exported key constants so the key sets cannot drift, with hand-written `description`s per key, returning a plain JSON Schema draft 2020-12 object. The static shape first; the registry-specialised form a second item. Cross-node rules stay `validateDefinition`'s, and the schema's own `description` says so. *Rationale*: a schema written by hand is a second copy of the validator's key sets that drifts in silence; built from them it cannot, and the app asked for the registry form explicitly | **(a2)** the static shape only — leaves the registry's types, pools, gate types and routes, which an agent most often gets wrong, to the findings after each attempt. **(a3)** a published `.schema.json` file, no function — a second copy of the key sets, and nothing to specialise to a registry |
| **(b)** | **#1 — what holds the schema true** | **ANSWERED (b1)**: `@cfworker/json-schema` as a TEST-ONLY devDependency, with a short ADR saying a test-only validator is not ADR 0053's refused runtime dependency. The test: every valid corpus flow accepted, every invalid corpus file whose rule is shape-only refused; the registry form the same against `spec/examples/registry.json`. The plan checks the dependency bundles for the chromium lane, or states where it runs (decision 3). *Rationale*: only a real 2020-12 validator can tell a schema that SAYS the right keys from one that ACCEPTS the right documents | **(b2)** structural key-set binding only — proves the key names and nothing a validator would do with them: a wrong `type`, `pattern` or `required` passes |
| **(c)** | **#2 — how a node after a failure edge reaches the error** | **ANSWERED (c1)**: a `needs` reference form naming a node's ERROR, e.g. `"lookup!error"`, its exact grammar the item's, taking the `?` and array forms too. It aims at the same node as `"lookup"`, so `FD-V27`/`28`/`29`, ADR 0044, ADR 0124 and ADR 0126 apply unchanged (the error a string, so no copy); it resolves to the error string, or `null` where that output succeeded. It KEEPS the whole-node rule: the error is a field of the outcome, not a path inside `result`. *Rationale*: additive, explicit at the reader, and every existing rule on references applies to it as written | **(c2)** the failed edge hands `{ error }` by default — BREAKING: every successor of a failed edge receives `{ error }` where it received `null`. **(c3)** a node-less `"$error"` token — ambiguous where a node has several predecessors on mixed `on` |
| **(d)** | **#3 — how a verdict says it threw** | **ANSWERED (d1)**: an optional `cause: 'threw' \| 'schema'` on `WiringVerdict`, set only on `transform-fails`. *Rationale*: additive; every switch, count and `VERDICT_KINDS` reader is unmoved | **(d2)** finer causes (import, compile, evaluate) — nothing the app shows differently, and each a promise about an adapter's internals. **(d3)** two new kinds — breaks every exhaustive switch over `VerdictKind` and every count keyed by it |
| **(e)** | **#4 — when an ask was asked** | **ANSWERED (e1)**: an optional `observedAt` on the `asked` fold input, from the driver's `now`. On replay, within the stored prefix, the regenerated element takes the stored element's `observedAt` (or omits it if the stored one has none), so old checkpoints compare equal; past the stored tail it uses `now()`. No `CHECKPOINT_FORMAT` bump. The fold surfaces it on a suspended ask's `NodeRun`. *Rationale*: the time is the stored run's, so a resume and a reading show WHEN THE PERSON WAS ASKED, not when the replay ran (fact 7) | **(e2)** exclude `observedAt` from the replay's comparison — a resumed run would carry the REPLAY's time, so a wait measured across a resume restarts at every resume |
| **(f)** | **#5 and #6 — the two closures** | **ANSWERED (f1)**: Q760 → `resolved`, citing P43 and pass 4 #5 (the envelope plus `tryTransform` serves; the reading is not built). Pass 1 #11 recorded WITHDRAWN by the asker, in this plan; Q372 and Q249 stay `deferred`, for other hosts — optionally a dated note on Q372 | **(f2)** Q760 left `deferred` — a question its only asker has closed. **(f3)** Q372 closed with #11 — it is broader than the ask and stands for other hosts |
| **(g)** | **The aside — an ask's kept input shared across a map's instances** | **ANSWERED (g1)**: NOT pursued. The Host persists every `asked` element, so in-memory sharing would not shrink their log, and it would amend `RN-R2` and `RN-R17` (fact 8). Stated in the reply | **(g2)** share it as ADR 0126 shares reads — amends two rules for a memory the app's own log does not recover |
| **(h)** | **How the items run, and which release** | **ANSWERED (h1)**: one plan, five items run one after another as subagents, each committed, nothing pushed — (1) #3 + #4 + #5 + #6; (2) #2; (3) the static schema with the test-only validator and its ADR; (4) the registry-specialised schema; (5) the exit artifact: an L6 block on real workers (at least #2's error read by an ask after a failure edge, and #4's `observedAt` across a resume), the reply, P43's Record and retro, the `doc/workflow.md` bookkeeping and `gate:full`. Everything is additive, so it ships as **0.11.0** — bumped, pushed and published by the maintainer ONLY when the maintainer says so, not part of any item. The reply also acknowledges the app's Q186 numbers on 0.10.0 and its acceptance of `"$payload"` in a map | **(h2)** a release per item — five releases for one pass |

## Work items

**P39 retro's proposal B, as P40 adopted it and P40's, P41's and P42's retros carried it UNCHANGED** — B′, C, D′ (with
P38's sixth clause) and E, E per CALL SITE:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.* **P42's one short fall was this clause's second half
  skipped** (W205's `RUN_FLOOR`), so here it is named per row: **every row that may add a `run` snippet to `AGENTS.md`
  OWNS `scripts/check-docs.mjs`'s `RUN_FLOOR` (`:742`, 52 at this declaration) and nothing else in that file**, and runs
  `check:docs:selftest` in its byte copy before writing its `Owns`.
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**: every file that READS the surface the item changes, found
  by a grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`; a grep for each PREMISE the change
  falsifies; a grep for a SIBLING of each member the change adds. **Every row touching `AGENTS.md` owns the WHOLE of it**,
  and a parenthetical in an `Owns` cell is a forecast of where in the file, not a limit.
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two, the
  probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed* — **per CALL
  SITE**: `cause`'s two sites are two probes; `observedAt`'s take-the-stored and its `now()` past the tail are two; the
  error reference's parse, its resolution and each form are one each; each schema clause is one.

**The brief sentences, every item's**: ***each item's Record states its readers' overlap***; ***a claim of ABSENCE is
shown able to fail by a control on the same observer, taken AFTER the event it denies — and each CLAIM carries its own
verdict, never another claim's***; ***a schema's REFUSAL is a claim with a control*** — the refused file repaired in its
one clause and accepted, so a schema refusing for a reason other than the rule's is seen; ***an oracle reached through
the package names which `src/` functions it shares with its subject*** — here the schema and the validator share the key
constants BY DESIGN (decision 1), so the corpus, not the constants, is the oracle; and ***a new suite's wall is a share
of the chromium lane's 60 s***. From P42's retro section 4 (a), carried as an observation: ***a claim's OBSERVER is a
shape too*** — its target form, its index; here, a resume's `observedAt` claim read from a stored element is blind to a
driver that never stamped one, so it is read beside a fresh element's. From P41's retro: ***where a plan enumerates what
a change protects, enumerate what it BREAKS*** — here, fact 7's older driver.

**D′ applied — the sites each row moves.**

- **W208**: `judgeTransform`'s two sites (`wiring.ts:984-988`, `:994-996`), `WiringVerdict` (`:132`), every reader of
  `transform-fails` (`assist.ts:318`, `checkWiring`'s counts `:918`, `AGENTS.md` `:4152`, `:4217-4219`, `:4063-4064`,
  `spec/flow-definition.md:2174`); `ask()` (`driver.ts:5454`), `append`'s prefix check (`:5816-5818`), `sameData`
  (`:629`), the `asked` type (`run-state.ts:355`), `NodeRun` (`:102`), the accumulator's arm (`accumulator.ts:408`),
  `freezeInput` (`driver.ts:1152`), `RN-R45`'s reading (which replays through `append`), `handle.state()`'s frozen copy;
  every test or snippet building an `asked` element or an ask's `NodeRun` literal. The PREMISES: *an `asked` element
  is `{ kind, taskId, input }`* (`RN-R36`, `RN-R37`, `AGENTS.md`), and *everything else it REGENERATES* (`RN-R19`).
- **W209**: `referenceTarget` and `aimed` (`validate.ts:1054`, `:1074`), `dollarProblem`, `FD-V26`-`FD-V29`'s messages;
  `resolveReference` (`driver.ts:5101`), `OutputEntry` (`:721`), `sharedOf` (`:5169`), the index (ADR 0124); the wiring
  check's `needs` arc sample (`wiring.ts`, `WiringShape` `'needs'`); a predicate's `ctx.needs`; `spec/flow-definition.md`
  `FD-C1`'s table and `:1658-1661`'s whole-node paragraph (a dated clause); `AGENTS.md`'s `needs` rows. The PREMISE:
  *a reference names a node's output* (`FD-V27`'s *only a task and an ask produce an output*).
- **W210**: a new module under `src/definition/`, `index.ts` (one line), `deno.json`'s `publish` list (the new file) and,
  if decision 3 takes it, its `imports`; `package.json`'s `devDependencies` and `package-lock.json`; `pack-smoke`'s `P5`
  (compares exports both ways, so moves no literal — re-read); every check that reads `package.json`'s dependency lists
  (`check:scheduler`, `check:source`, `pack-smoke`) — re-read, and an Exception named before the edit if one moves;
  `LATE_SUITES` and the counted suites (`test/definition/l4-corpus.test.ts`).
- **W211**: W210's module and suite; `effectiveSettings`, `routesOf`, `gateTypesOf`, `nodeTypesOf`, `poolsOf`,
  `languagesOf` (`validate.ts`) — READ, never written twice: a registry-derived set is taken from the function the
  validator uses.
- **W212**: `X10` (`examples/README.md`); `CONSTRUCTION_PRICED` (`examples/l6.ts`) if a construction is added.
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`, except W212's plan-close
  bookkeeping in `doc/workflow.md` (P40's W200, P41's W203 and P42's W206 precedent, declared before the edit).

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W208 | **#3, #4, #5, #6 — `cause` on `transform-fails`; `observedAt` on `asked`, kept across a replay and surfaced on the ask's `NodeRun`; Q760 resolved; pass 1 #11 withdrawn** — (d1), (e1), (f1); decisions 6, 7, 9; facts 4, 6, 7 | `src/definition/wiring.ts`, `src/definition/assist.ts` (only if a reader there moves), `src/driver/driver.ts`, `src/fold/run-state.ts`, `src/fold/accumulator.ts`, `test/definition/**`, `test/driver/**`, `test/fold/**`, `test/scheduler/**` (if a handle's `state()` case moves), `test/definition/l4-corpus.test.ts` (counted), `spec/run-state.md` (v0.35: `RN-R36`, `RN-R37`, `RN-R19`'s regenerated clause, `RN-R45` if its prose moves), `spec/flow-definition.md` (v0.48: the verdict table's row), `spec/README.md`, `AGENTS.md`, `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0130-*`; the record step's `doc/questions/q760.md` (resolved) and, optionally, a dated note in `doc/questions/q372.md` | nothing — (a)-(h) answered | `gate:item`; L1-L2: `cause` `'threw'` on each of the `catch`'s four roads (no default export, a compile throw, an evaluate throw, and an import failure where the harness can reach one) and `'schema'` on a finding, through `tryTransform` AND `checkWiring`, absent on `fits`, `no`, `transform-passes`, `unchecked`; `why` unmoved; `observedAt` the injected clock on a fresh `asked`; on a resume from EVERY stored prefix of a run with an ask, the regenerated element's `observedAt` the STORED one under a DIFFERENT clock — its control a fresh element past the tail carrying the new clock; an `asked` stored WITHOUT one (a 0.10.0 checkpoint, hand-built) resuming equal with none; `inputOf` (`RN-R45`) over the same stores, never `diverged`; the fold's field on a suspended ask, absent on every other entry, kept through the answer as `input` is; L3 folded twice; fact 7's older-driver direction MEASURED and stated in ADR 0130 |
| W209 | **#2 — a `needs` reference naming a node's error** — (c1); decision 5; fact 5 | `src/definition/validate.ts`, `src/definition/types.ts` (the `needs` comments), `src/definition/wiring.ts` (the `needs` arc's sample), `src/definition/condition.ts` (only if a predicate's `ctx.needs` reader moves), `src/driver/driver.ts`, `test/definition/**`, `test/driver/**`, `test/fold/**` (an L5 case if a join's arrival reads one), `test/definition/l4-corpus.test.ts` (counted), `spec/examples/valid/**` and `spec/examples/invalid/**` (new files only), `spec/flow-definition.md` (v0.49: `FD-C1`, `FD-V26`-`FD-V29`, the whole-node paragraph's dated clause, section 7's corpus table), `spec/README.md`, `AGENTS.md`, `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0131-*` | W208 | `gate:item`; L1: the grammar parsed by `referenceTarget` alone, every malformed spelling refused naming the fix, a valid id never read as the form; L2: after a failure edge the reference resolves EQUAL to the outcome record's `error` (by hand), `null` where the output succeeded, its `?` form absent where the node did not run, its array form one per instance inside a map in item order; a `user_action` task resolved `failed` and a declined ask each read; on a node's and an edge's `needs`; `FD-V27`-`FD-V29` refusing it exactly as they refuse `"lookup"`, each beside the plain form's same verdict; the wiring check's sample a string; nothing copied (an `Object.is`-free claim: a string); every existing corpus verdict unmoved |
| W210 | **#1 — `definitionSchema()`, the static shape; the test-only validator; ADR 0132** — (a1), (b1); decisions 1-4, 9; facts 1-3 | a new module under `src/definition/` (its name W210's), `src/definition/validate.ts` (exporting or sharing `ID_RE`, `KINDS` only), `index.ts`, `deno.json` (`publish` list; `imports` only as decision 3 takes it), `package.json` (`devDependencies` only), `package-lock.json`, a new suite under `test/definition/`, `test/definition/l4-corpus.test.ts` (counted), `spec/flow-definition.md` (v0.50: the schema's place, its authority sentence), `spec/README.md`, `AGENTS.md`, `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0132-*` | W209 | `gate:item`; L1 in node, deno and chromium (or decision 3's named lane): the schema a valid 2020-12 document (the validator's own meta-schema check); every valid corpus flow ACCEPTED; every shape-only invalid file REFUSED, each beside its one-clause repair ACCEPTED; the partly-shape files' clauses each refused by the clause fact 2 names; every key of every exported set present with a `description` (a missing one an L0 failure); the root `description` naming the authority; the error reference form (W209) accepted and a malformed one refused; a new object per call; the suite's wall in chromium stated |
| W211 | **#1 — `definitionSchema(registry)`, specialised** — (a1), (b1); decisions 1-4; fact 2 | W210's module and suite, `test/definition/l4-corpus.test.ts` (counted), `spec/flow-definition.md` (v0.51, if a sentence moves), `spec/README.md`, `AGENTS.md`, `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0133-*` (expected unused) | W210 | `gate:item`; L1: against `spec/examples/registry.json`, every valid corpus flow ACCEPTED and every registry-specialisable invalid file (fact 2) REFUSED, each beside its repair; the static form NOT refusing those files (the specialisation is what refuses); fact 2's *not cleanly* rows stated in the schema's `description` and each pinned as NOT refused (a claim of absence, with the validator's refusal of the same file as its control); every registry-derived set taken from the validator's own function (a registry the validator refuses is not specialised — a test) |
| W212 | **The exit artifact on real workers, the reply, P43's close** — exit (3); `gate:full` | `examples/l6.ts`, `examples/README.md`, `examples/flows/**`, `examples/workers/**`, `test/definition/l4-corpus.test.ts` (if a census moves); `doc/workflow.md` (the plan-close bookkeeping only, declared); outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass4.reply.md` | W211 | **`gate:full`** (the plan's last item); L6 in node 24 and deno, threaded and inline; `X10` moved by its block alone |
| W213 | *reserved, expected unused* | | | |

**The rows are SERIAL, never concurrent** — W208 and W209 share `driver.ts`, `wiring.ts` and the spec; every row
`AGENTS.md` and `RUN_FLOOR`; W210 and W211 one module (`doc/workflow.md` section 7 rule 2) — which (h1) answers anyway.
**No item edits `scripts/check-register*.mjs`, `scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is
W208-W211's and `gate:full` W212's. **Questions reserved per item**, so no two take one: W208 Q770-Q771, W209
Q772-Q773, W210 Q774-Q775, W211 Q776-Q777, W212 Q778-Q779. **ADRs reserved per item**: decision 8. **No item raises a
question by plan**; one a NO to an asked widening produces is raised as section 1 rule 6 says.

**The reply to fyflow-app goes where P42's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass4.reply.md`. **W212 writes it**, from this plan and the five Records, once its own gate is
green: #1 accepted — `definitionSchema()` and `definitionSchema(registry)`, what each carries and what stays
`validateDefinition`'s (fact 2), the test-only validator and why it is not a runtime dependency; #2 accepted in the
reference form — its final grammar, forms and resolution, and why not the default `{ error }` ((c2)); #3 `cause`, set
on `checkWiring`'s verdicts too; #4 `observedAt`, kept across a resume, absent on an ask asked before 0.11.0, and fact
7's older-driver direction; #5 Q760 resolved; #6 recorded withdrawn, Q372 and Q249 kept for other hosts; their Q186
figures on 0.10.0 and their acceptance of `"$payload"` in a map acknowledged; (g1)'s answer to the ask-in-a-map aside,
with fact 8's reasons; 0.11.0, **its release state MEASURED at the time of writing** (npm, JSR, tags, `origin/main`), and
the bump, push and publish the maintainer's ((h1)).

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`), as W205 and W206 did — no
item file is written at this declaration, so `npm run state`'s two derivations agree. **Its `**Status:**` line's FIRST
WORD is one of the template's five** (`todo`, `in progress`, `in review`, `done`, `reserved`), which is what
`scripts/state.mjs` reads. What the row cannot carry is below: each item's OUTPUTS, and what its declaration step
RE-TAKES before any `src/` edit (P15 decision 5). Every item's last re-take is the ladder counts, the baseline this plan
did not take.

**W208 — outputs**: `cause` at `judgeTransform`'s two sites; `observedAt` on the `asked` element and its type; the
take-the-stored rule where a replay regenerates it; the fold's optional field on an ask's `NodeRun` (its name W208's);
ADR 0130; `spec/run-state.md` v0.35, `spec/flow-definition.md` v0.48, `spec/README.md`; `AGENTS.md` section 15's cell and
snippet (the prefix assertion kept, `cause` asserted beside it) and every place it states an `asked` element's shape; the
L1-L2 cases of its row; Q760 resolved and the optional Q372 note at its record step. **Re-takes**: every reader of
`transform-fails` and of an `asked` element (D′); whether `freezeInput` and `handle.state()` carry the new field
unchanged; fact 7's older-driver direction, measured on a byte copy at `26c55ed`; that no corpus run's fold moves but
for the new field; `RUN_FLOOR`.

**W209 — outputs**: the grammar (its spelling W209's within (c1), stated in ADR 0131); `referenceTarget`'s new form
and its refusals' messages; the driver's resolution through the existing index; the wiring check's sample; at least one
valid corpus flow — an ask after a failure edge reading the error — and the invalid files the grammar's refusals earn;
`spec/flow-definition.md` v0.49; ADR 0131; `AGENTS.md`. **Re-takes**: every site `referenceTarget`'s result is
switched on (`form`); whether the index's `OutputEntry` already reaches the error or must carry it; the corpus census
(`check:spec`, `LATE_SUITES`); what a failed `user_action` resolution and a declined ask put in `error`.

**W210 — outputs**: the module and `definitionSchema()`; the exported or shared `ID_RE` / `KINDS`; the devDependency,
pinned exact; decision 3's measurement (bundle bytes, the chromium suite's wall, deno's route, `deno publish --dry-run`);
the suite; ADR 0132; `spec/flow-definition.md` v0.50; `AGENTS.md`. **Re-takes**: fact 2's classification, file by file;
fact 3's bundle figures at the chosen pin; every check reading `package.json`'s dependency lists; `pack-smoke`'s `P5`.

**W211 — outputs**: `definitionSchema(registry)`; its cases; the schema's `description` naming fact 2's *not cleanly*
rows; ADR 0133 or the statement that none is needed. **Re-takes**: which invalid files `spec/examples/registry.json`
makes registry-specialisable; whether a derived gate type's routes can be enumerated for any `settings` at all.

**W212 — outputs**: the L6 block (exit (3)) — a flow in which a task fails (a worker that throws a known message) and
its failure edge leads to an ask whose `needs` reads the error, threaded and inline: the ask's `asked` input carries the
thrown message (by hand), its control the same ask after a SUCCEEDING task carrying `null`; the ask's `observedAt` read
live, the runtime then shut down and the run resumed from a store on a fresh runtime under a different clock, the
resumed ask's `observedAt` the original, its control a later ask past the tail stamped by the new clock; each claim its
own verdict; `X10` moved by the block alone; the reply; P43's Record and retro. **It places no logic**: a counter or
`src/` site it cannot read is an Exception named before the edit. **Re-takes**: W208-W211's counts and walls in node,
deno and chromium; the release state, measured.

## Predictions, written before the items that test them

1. **W208 moves no existing value but by adding the two fields**: every composed payload, every fold sequence's elements
   but `asked`'s new key, every `resume()` of an existing checkpoint, every `why` string byte-identical;
   `CHECKPOINT_FORMAT`, `VerdictKind` and every count unmoved. An item that finds another must move is a stop-and-ask.
2. **`cause` appears on `checkWiring`'s verdicts too**, and the one `transform-fails` file in `spec/examples/wiring/` reads
   `'schema'` (its name says a path picks a number for a string consumer), not `'threw'`.
3. **`!` collides with nothing** — no valid or invalid corpus file changes verdict at W209, and no existing reference
   spelling parses as the new form.
4. **The static schema refuses every shape-only invalid file and accepts every valid flow on its first green run**; a
   file that does not move as fact 2 says moves class, and its count of such files is at most two.
5. **`@cfworker/json-schema` bundles for chromium** and adds under 50 KB to the test bundle, and the schema suite costs
   under 1 s of the 60 s budget.
6. **The registry form refuses `FD-V31`, `FD-V32`, `FD-V35`, `FD-V38` and `FD-V39`'s files** and not `FD-V33`'s,
   `FD-V36`'s or `FD-V41`'s.
7. **W212 moves `X10` by its block alone, and no existing L6 row.**

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q760](../questions/q760.md) | the input a task's worker sees after its transform — `deferred`; (f1) resolves it | W208's record step |
| [Q372](../questions/q372.md) | the prefix check sees only what was stored — `deferred`, kept for other hosts; an optional dated note ((f1)) | W208's record step |
| [Q249](../questions/q249.md) | a node type's version against a definition's — `deferred`, kept | — |
| [Q278](../questions/q278.md) | a keyword outside the subset is refused — `resolved`; decision 2 is why the EMITTED schema is outside its reach | — |
| *(Q770-Q779)* | none planned | each item's block, on a NO |

## Record

*Written 2026-10-24 over W212's final tree, the tree held still before it. Every figure is read from the five items' own
files, or re-taken by W212's declaration step and named so. Ids are bare text, as in P33's-P42's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and its readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W208** `0c42377` | `WiringVerdict.cause` (`'threw'` / `'schema'`, `TransformFailureCause`) at `judgeTransform`'s two sites, every road; the `asked` element's `observedAt` (the driver's `now`, the STORED time where a replay regenerates it within the prefix), `NodeRun.askedAt`; ADR 0130 | run-state v0.35 (`RN-R36`, `RN-R37`, `RN-R19`); flow-definition v0.48 | **Q760 resolved** / — ; Q372's dated note | ONE asked exception — `examples/l6.ts`'s six W182 whole-element comparisons — answered YES | conformity 1 SHOULD, 3 NIT; adequacy 31 mutations, 1 SHOULD, 4 NIT. **Overlap 1** | 97 / 2216; 2847 / 238 | `gate:item` EXIT 0, 10/10, 1,131.5 s |
| **W209** `ceecb90` | the `"n!error"` reference — four spellings, `part: 'error'`, `AimedReference`; `FD-V26`'s three `!` clauses; the driver's error arm over the existing index; the wiring key; `ask-after-a-failure.flow.json` and three invalid files; ADR 0131 | flow-definition v0.49 | — / — | TWO asked exceptions — `spec/outcome-record.md`'s figure sentence; `examples/l6.ts`'s `NOT_YET_AT_L6 = ['error']` — each answered YES | conformity 1 BLOCKER (L6 red, fixed by the second exception), 1 SHOULD, 6 NIT; adequacy 48 mutations, 1 SHOULD, NITs. **Overlap 1** | 99 / 2242; 2847 / 238 | `gate:item` EXIT 0, 10/10, 1,136.5 s |
| **W210** `d155bed` | `definitionSchema()` — the static shape as 2020-12, built from the validator's key sets, a description per key; `ID_RE`, `KINDS` and four more exported as copies; `@cfworker/json-schema` 4.1.1 a test-only devDependency (+42,802 bundle bytes); the suite; ADR 0132 | flow-definition v0.50 | — / **Q774** | THREE stop-and-asks answered as recommended under (h): `deno.lock`'s line, `validate.ts`' four further constants, a missing description an L1 throw | conformity 1 BLOCKER, 2 SHOULD, 4 NIT; adequacy ~110 mutations, 1 BLOCKER, 3 SHOULD, NITs — the soundness claim false on the first green tree. **Overlap 1** | 100 / 2256; 2847 / 238 | `gate:item` EXIT 0, 10/10, 1,129.8 s |
| **W211** `7055c12` | `definitionSchema(registry)` — `checkRegistry` first; per-type and per-gate-type branches, the four enums, the not-cleanly rows in the root description; `minLength` emitted ⌈n/2⌉ | flow-definition v0.51 | — / — ; ADR 0133 SKIPPED (no rule moves) | none | conformity 0 BLOCKER, 2 SHOULD, 3 NIT; adequacy 88 probes, 4 SHOULD, 4 NIT. **Overlap 2** | 100 / 2267; 2847 / 238 | `gate:item` EXIT 0, 10/10, 1,142.3 s |
| **W212** `fd4680b` | the `W212 exit` L6 block — a task's thrown message handed to the ask after its failure edge by all four `!error` spellings, `null` after a success, a map's failures in item order; the ask's `observedAt` live, kept across a resume from a store on a fresh runtime under another clock, a live ask past the tail and a lost tail's regenerated ask each stamped by the new clock — fourteen claims, eight runs; `NOT_YET_AT_L6` removed; the README's copies; the reply | none | — / — | one, declared before the edit: `doc/workflow.md`'s plan-close bookkeeping | conformity 3 NIT; adequacy 32 mutants, 1 SHOULD, 4 NIT — every one acted on or declared; 16 probes. **Overlap 0** | 100 / 2267; **2861 / 246** | **`gate:full`** EXIT 0, 11/11 self-tests, 3,637 s |

**One question raised (Q774), one closed (Q760). Three asked exceptions (W208's one, W209's two), each answered YES; three
stop-and-asks inside W210, answered as recommended. The readers' overlap, every Record stating its own: 1, 1, 1, 2, 0.**

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| (1) `definitionSchema()` held by a test-only 2020-12 validator to ACCEPT every valid corpus flow and REFUSE every shape-only invalid file, `definitionSchema(registry)` the same against `spec/examples/registry.json`, each refusal with a control, in `gate:full` and all three L0-L5 runtimes | W210 and W211: `test/definition/definition-schema.test.ts` (25 cases) — every valid flow accepted; every shape-only file refused beside its one-clause repair accepted (one file moved class, `FD-V40--gate-key-path-with-an-index`, refused); eight registry-specialisable files refused by the registry form and accepted by the static one; never refusing what `validateDefinition` accepts, with a positive control; node, deno and chromium (parity 2,267) | **met** |
| (2) an L2 suite holding `"n!error"` equal to the outcome's `error` after a failure edge, `null` where it succeeded, in the bare, `?` and array forms; `transform-fails`' `cause` on both branches; `observedAt` from the driver's clock, KEPT across a resume from every stored prefix, an older checkpoint resuming equal | W209: `test/driver/error-reference.test.ts`, `test/definition/error-reference.test.ts`; W208: `transform-cause.test.ts`, `test/driver/asked-at.test.ts` (every prefix, a later clock, hand-edited stored times), `test/fold/asked-at.test.ts`; a 0.10.0 checkpoint resumed with no time; 1,372 corpus runs byte-identical but for the two keys | **met** |
| (3) one L6 block, node 24 and deno, threaded and inline: an ask after a failure edge handed the failed task's error; an ask's `observedAt` the same before and after a resume from a store once the first runtime is gone; each claim with its control | the `W212 exit` block, fourteen claims over eight runs, **2861 / 246, 0 failed** in both runtimes | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W212, one command on the final tree after the readers' fixes: the ladder, then 11/11 self-test lanes ok, `check:register:selftest` included (3,168.0 s wall, 10 lanes), 3,637 s in all | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **94 / 2197 → 100 / 2267** in node, deno and
chromium; L6 **2847 / 238 → 2861 / 246** in node and deno; `check:docs` `RUN_FLOOR` 52 → **54** `run` snippets; `check:spec`
C4 45; spec/flow-definition **v0.47 → v0.51**, run-state **v0.34 → v0.35**, outcome-record a figure sentence (W209's
exception, no version); `CHECKPOINT_FORMAT` 1, `VerdictKind`, `VERDICT_KINDS` and every count unmoved; the package surface
gains `definitionSchema`, `DefinitionSchema`, `TransformFailureCause`, `AimedReference`, six key-set constants (copies) and
the optional fields `WiringVerdict.cause`, `asked.observedAt`, `NodeRun.askedAt` — **all additive** (decision 9); one
test-only devDependency; `doc/concept.md` untouched. **The chromium lane**: 53.6-54.1 s before W210, 55.0 s after it, 56.7-57.5 s
after W211, **57.0 s** re-taken by W212 (unmoved by it) — of 60.

**What the plan answered.** *What can an author, an agent and a host read of a flow and of a run as DATA?* — **a
definition's static shape and its shape against one registry, as JSON Schema 2020-12 BUILT from the validator** (ADR 0132),
with `validateDefinition` the authority for what neither carries and the promise one-directional (what the schema refuses,
the validator refuses); **a failed task's error, as a `needs` reference** (`"n!error"`, ADR 0131), reachable by every node
the plain reference reaches; **whether a tried transform threw, as `cause`**; and **when an ask was asked, as `observedAt`**,
kept across a resume because the replay takes the stored time (ADR 0130). **The price**: one consequence the other way —
a 0.10.0 driver refuses a 0.11.0 checkpoint `diverged` at its first `asked` element (ADR 0130 consequence 2, measured).
**fyflow-app's pass 4**: #1-#4 accepted in the shapes above, the default `{ error }` declined ((c2)), #5 closed (Q760),
#6 recorded withdrawn; the reply is written
(`../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass4.reply.md`).

**Pass 1 #11, WITHDRAWN** by its asker (pass 4 #6): fyflow-app resumes only against immutable flow versions and the
`diverged` prefix check stands. Q372 and Q249 stay `deferred` for other hosts ((f1)); Q372 carries W208's dated note.

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W208 moves no existing value but by the two fields | **HOLDS** — 1,372 runs byte-identical once the two keys are removed; but a CONSUMER comparing whole elements moved (`examples/l6.ts`' W182 block, six comparisons — W208's exception) | W208 Record |
| 2 | `cause` on `checkWiring`'s verdicts; the corpus's `transform-fails` file reads `'schema'` | **HOLDS** | W208 Record |
| 3 | `!` collides with nothing | **HOLDS on the final tree** — false at W209's first gate until L6's census exemption | W209 Record |
| 4 | the static schema refuses every shape-only file and accepts every valid flow on its first green run; at most two files move class | **HOLDS** — one file moved | W210 Record |
| 5 | `@cfworker/json-schema` bundles for chromium under 50 KB; the suite under 1 s | **HOLDS in part** — 42,802 bytes, 0.57 s, but only after a cut: the first draft took the lane to 61.6 s | W210 Record |
| 6 | the registry form refuses `FD-V31`, `32`, `35`, `38`, `39`'s files and not `33`'s, `36`'s or `41`'s | **FAILS as written** — `FD-V33`'s IS refused (a type's `settings` schema is registry-specialisable) | W211 Record |
| 7 | W212 moves `X10` by its block alone, and no existing L6 row | **HOLDS** — 2847 / 238 → 2861 / 246 | W212 Record |

**The D′ paragraph's census predictions**: short at TWO consumers that read a WHOLE value rather than a NAME — W208's six
whole-element comparisons in `examples/l6.ts` and W209's L6 census over `spec/flow-definition.md`'s table — each found by
running the lane (B′) or by a reader, never by the grep D′ names. And fact 3's *a node type's `settingsSchema` embeds as it
stands* was corrected by W211 for one keyword (`minLength`).

**Questions**: **raised [Q774](../questions/q774.md)** (W210, `open` — `FD-V21` accepts a non-string `of` or branch
entry); **closed [Q760](../questions/q760.md)** (W208). `npm run q -- --where status=open` lists **Q774** alone.

**Handed on**, each with its owner:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| **0.11.0** — the version bump, the push and the publish to npm and JSR | (h1) | **the maintainer** — *only when the maintainer says so* | this Record |
| [Q774](../questions/q774.md) — refusing a non-string `of` / branch entry moves `validateDefinition`'s verdicts | W210 | **the maintainer** — retro section 8 (a) | the question |
| the reply to fyflow-app | the plan's *reply* paragraph | **done** — W212 | W212's Record |
| the chromium lane at ~57 of 60 s | W210, W211, W212 | **the next item adding to the browser bundle** — retro section 8 (b) | below |
| W212's declared NITs — the pool a block ran on observed by no claim; a retry clearing `task.error` pinned by no L6 claim | W212's adequacy reader | the next item touching the block — test gaps, not defects; no question raised | W212's Record |
| the byte copies `C:/tmp-w208` … `C:/tmp-w212` and the session scratchpad's probes | every item | **the maintainer** — left in place, outside the repository | each item's Record |

## Retro

*Pass 3 ran on 2026-10-24 over W212's final tree, by W212's author as the plan's last item. Every figure is read from the
five items' Records; this retro re-ran no harness but the chromium wall (W212's re-take 5). **Two routings here need the
maintainer** (section 8); nothing is acted on outside the record step's four files and W212's one declared exception.*

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader defects | raised / closed |
|---|---|---|---|---|
| P43's declaration | — | (a)-(h), all as recommended | — | — |
| W208 | **1** — `examples/l6.ts`' W182 comparisons, YES | — | 2 SHOULD, 7 NIT | **Q760 closed** |
| W209 | **2** — `spec/outcome-record.md`, `examples/l6.ts`' census exemption, YES | — | 1 BLOCKER, 2 SHOULD, NITs | — |
| W210 | **2** — `deno.lock`, `validate.ts`' constants | **1** — a missing description an L1 throw — all three answered as recommended under (h) | 2 BLOCKER (one subject), 5 SHOULD, NITs | **Q774 raised** |
| W211 | — | — | 6 SHOULD, 7 NIT | — |
| W212 | — (one exception declared before the edit) | — | 1 SHOULD, 7 NIT | — |
| **P43** | **5, each answered YES** | **9 answers, all as recommended** | **every one acted on or declared** | **1 raised, 1 closed** |

### 2. The `Owns` and the census sites — B′, C, D′ and E

**B′ held and found what D′ missed, twice.** W208's L6 run on the change found six whole-element comparisons no name grep
could; W209's found the L6 census binding section 3's rows to runs — but only at the first `gate`, because B′ ran L6 BEFORE
the spec's table row existed: **L6 reads `spec/`, so a lane run on code without its spec edit is a census of half the
change** (W209's lesson). W210's B′ found the chromium lane over 60 s before any `Owns` was fixed. **C held** (one confirming
gate per item, on the final tree). **D′ held at every NAME it grepped and was blind to a WHOLE-VALUE reader** — section 4 (a).
**E held**: every item's probes cut one clause per call site; W212's P5 is the one WIDER-set kill, every resume of a run
with an ask diverging.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W208 | 1 SHOULD, 3 NIT | 31 mutations; 1 SHOULD, 4 NIT | **1** — the no-consumer-schema road | 125th |
| W209 | 1 BLOCKER, 1 SHOULD, 6 NIT | 48 mutations; 1 SHOULD, NITs | **1** — the `FD-V27` row's wording | 126th |
| W210 | 1 BLOCKER, 2 SHOULD, 4 NIT | ~110 mutations; 1 BLOCKER, 3 SHOULD, NITs | **1** — the soundness claim | 127th |
| W211 | 2 SHOULD, 3 NIT | 88 probes; 4 SHOULD, 4 NIT | **2** — the groups and predicates; the top-level-keyword clause | 128th |
| W212 | 3 NIT | 32 mutants; 1 SHOULD, 4 NIT | **0** | 129th |

**Every Record states its overlap**, the eighth plan running. **Five measurements, all inside section 6's 0-4 band. The
ordinal is a hundred and twenty-nine, so the next is the HUNDRED-AND-THIRTIETH** — carried into `doc/workflow.md` by
W212's declared exception.

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) a census by NAME is blind to a reader that compares a WHOLE value** — W208: `examples/l6.ts`' six W182 comparisons through a canonicaliser, naming no changed member; W209: an L6 census over a whole spec table's rows; W210: the soundness sweep writing whole keys, blind to a nested over-strictness; W211: one registry written, five over-refusals in shapes the corpus never takes | **FOLLOWED** — D′'s grep per changed name ran in each; B′ ran the lanes | B′'s lane runs (W208, W209), W209's conformity reader, W210's two readers, W211's adequacy reader | **FOUR occurrences in four items** — pass 3 rule 2's bar, and rule 3's sharpest class: a followed rule (D′) that cannot see the class. **Not proposed as a new rule**: B′ — *run every lane on the change before fixing `Owns`* — is the mechanism that caught the two that a lane could, and section 5 rule 8 (a)'s *the SHAPES the clause quantifies over* already covers the probes'. Recorded for the next plan's brief: **a census by name is a census of NAMES; a reader of the whole value is found by running it** |
| **(b) B′'s lanes run on code without its spec edit** — W209's L6 census reads `spec/flow-definition.md`; B′ ran before the table row existed | **FOLLOWED as worded** (*builds its change … and runs every lane*); the change was built in two halves | W209's first `gate` and its conformity reader (BLOCKER) | One occurrence, with an argument for generality — `examples/l6.ts` reads `spec/` and the corpus, so any item editing the spec has it. **Recommended as a ONE-CLAUSE amendment to B′ carried in the next brief, not a workflow rule** (section 6 B): *the change includes its `spec/` and corpus edits; the lanes run on all of it* |
| **(c) `export *` made shared constants public** — W210 exported `ID_RE` and `KINDS` from `validate.ts`, and `index.ts` re-exports that module whole, so a module-private constant became package surface — first LIVE (a consumer's `KINDS.splice` moved verdicts, W210's conformity SHOULD), then copies | the plan's decision 1 said *exported or shared as W210 judges*; nothing asked which surface an `export` reaches | W210's conformity reader | One occurrence. `index.ts:3`'s `export *` is a standing hazard: every `export` added to `validate.ts` is public. Recorded; no rule — the conformity pass caught it |
| **(d) a claim's OBSERVER is a shape too** — P42's observation, carried in P43's brief, recurred in W212: `PAST THE TAIL`'s `confirm` is past the RUN's stored tail and asked after `resume()` drops its replay, so ADR 0130's in-replay branch was unexercised | **FOLLOWED** — the brief named it; the claim had a control | W212's own P6, and its adequacy reader (S12, S13) | **THIRD plan running** (P42's two, P43's one). Section 5 rule 8 (a) covers it and the provocation written to the clause caught it before the Record — the mechanism worked as designed |
| **(e) the chromium lane is a shared budget at ~95%** | — | W210's B′ (61.6 s at the first draft); W211 and W212 re-took it | Section 8 (b) |

**Pass 3 rule 5 over P43's defects**, by what caught them: **a rung in `gate`** — L6 (W208's six comparisons, W209's census),
the chromium lane's 60 s wait (W210's first draft), `check:register` `R8` (W208's Q760 wording); **the authors** — W208's M05,
W210's re-cut, W211's first-pass gaps, W212's palindrome fixture and P6; **the conformity readers** — W210's soundness
BLOCKER by construction, W211's prototype-name validator caveat, wording elsewhere; **the adequacy readers** — W210's nested
over-strictness, W211's five registry shapes, W212's in-replay branch. **No rung would have caught** a claim of absence over
a space wider than its probe writes (W210, W211) — that is section 6's reader.

**The flaky rows ([Q599](../questions/q599.md))**: **NO in P43** — every item's `gate` and confirming gate ran L6 green in
both runtimes; W212's L6 green in every run, including under its readers' load.

### 5. The scheduler

**No S entry raised. No contract found broken.** A thrown `Error` reached the outcome record as its `message` on both pools,
as `spec/outcome-record.md` says, and the scheduler cleared `task.error` across a retry on 0.6.0 (W212's adequacy reader's
probe — not pinned by a claim).

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule.** B′ caught what D′ could not, C and E held, every Record stated its
overlap, every BLOCKER reached no Record unacted.

**B. Carried for the next plan's author** — P39's proposal B as P40 adopted it and P40's-P42's retros carried it (B′, C, D′,
E and the brief sentences), **with ONE clause added to B′** (section 4 (b)): *the change B′ builds includes its `spec/` and
corpus edits — `examples/l6.ts` reads both*. And section 4 (a) beside D′ as an observation: *a census by name is a census of
names; a reader of the WHOLE value is found by running the lanes*.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it is the 42nd refusal, P2-P43.** P43's text defects were a spec row's
  wording (W209), a claim *every pattern is read from the validator* (W210), an ADR-governance sentence contradicting ADR
  0132 (W211), a stale plan list in `examples/l6.ts`' header and a present-tense sentence a version made false (W212) — each
  found by a reader or an author reading the text beside the code. **No other ledger row is re-raised.**

| file | why |
|---|---|
| this plan | the Status line; this Record and Retro |
| `doc/workflow.md` | W212's declared exception: the Status line's count (FORTY-THREE, P1-P43), section 6's ordinal (a hundred and twenty-nine; the HUNDRED-AND-THIRTIETH next), the ledger's first row (42 times, P2-P43) |

`README.md`, `doc/questions/**` and `doc/decisions/**` carry nothing more: Q760, Q774 and ADRs 0130-0132 are the items'.

**Ids.**

- **Issued**: W208, W209, W210, W211, W212; ADR 0130, ADR 0131, ADR 0132; Q774; no S entry.
- **Reserved and unissued, SKIPPED and never reissued** (section 3): W213 CLOSED unissued, as expected; Q770-Q771 SPENT
  (W208's), Q772-Q773 SPENT (W209's), Q775 SPENT (W210's), Q776-Q777 SPENT (W211's), Q778-Q779 SPENT (W212's); ADR 0133
  SKIPPED (W211's, no rule moved); ADR 0134 SKIPPED.

**The next plan starts at W214, Q780 and ADR 0135.** The next S id is S13; the next plan id is P44.

### 8. Stop-and-asks for the maintainer

*Neither blocks P43's close: both are routings of work that is NOT this plan's, listed for the maintainer's answer.*

| | the question | recommended | the alternatives |
|---|---|---|---|
| **(a)** | **[Q774](../questions/q774.md) — `FD-V21` says a join's `of` and a fanout's branch entries are ids, and `validateDefinition` accepts a non-string there** (`of: null` on a join of no region, `["b", 5]`), so `definitionSchema()` accepts them too, to keep its one-directional promise. Refusing them moves `validateDefinition`'s VERDICTS — documents 0.10.0 accepts would be refused — which P43 prediction 3 excluded | **(a1)** YES, in its own small item of the next plan: `FD-V21` refuses a non-string `of` and branch entry (stated as a change in what is accepted, in 0.11.0's or 0.12.0's notes), the schema tightened to the charset with it; fyflow-app told in the next reply | **(a2)** leave Q774 open until a consumer meets it; **(a3)** document the leniency in `FD-V21` instead |
| **(b)** | **The chromium lane is at ~57 of its 60 s** (W211 56.7-57.5, W212 57.0) — the P39/P40 map-cost suite alone 34 s. The next suite of ~3 s takes the lane over, and W210's first draft showed a suite's cost includes the GC it leaves for later suites | **(b1)** before the next item that adds to the browser bundle, the plan that declares it decides: raise `scripts/run-browser-tests.mjs`' 60 s wait to 120 s (a one-line edit with its own `chore:` and a stated reason), or move the map-cost suite's 8,000-item counts to node and deno only | **(b2)** leave it, and let the next item meet the 60 s red at its B′ run (it will — B′ runs the lane) |
