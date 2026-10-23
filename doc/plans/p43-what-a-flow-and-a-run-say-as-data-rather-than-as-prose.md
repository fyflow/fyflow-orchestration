# P43 — What do a flow and a run say as DATA rather than as prose?

**Status:** declared 2026-10-23 — on `26c55ed` (the tree clean, `main` at 0.10.0, published, `origin/main` equal), answering fyflow-app's *pass 4* #1-#6; facts 1-9 read at this declaration; stop-and-asks (a)-(h) ANSWERED by the maintainer 2026-10-23, all as recommended; W209-W212 each wait on the item before them.
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
