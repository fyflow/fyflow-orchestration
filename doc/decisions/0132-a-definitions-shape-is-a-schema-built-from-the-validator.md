---
id: ADR 0132
title: "A definition's shape is a schema built from the validator, and a test-only validator is not ADR 0053's runtime dependency"
status: accepted
date: "2026-10-23"
item: W210
raised-by: P43
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0132 — A definition's shape is a schema built from the validator, and a test-only validator is not ADR 0053's runtime dependency

**Status:** accepted — [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) stop-and-asks (a)
and (b), answered (a1) and (b1) by the maintainer 2026-10-23 as recommended, decisions 1-4, facts 1-3; written by
[W210](../work-items/w210-the-static-shape-schema.md). It defines `spec/flow-definition.md` v0.50's *The definition's
shape as a schema* (section 1). It amends no ADR:
[ADR 0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) governs the schemas
the library EVALUATES and the dependencies a consumer installs, and this decision is about neither.

## Context

fyflow-app's *pass 4* #1 (pass 1 #15, deferred at P37 *"revisit before the app's M4"*): the app hands its Host to AI
agents over MCP, and an agent writing a whole `FlowDefinition` in one call learns its shape from a guide and from the
findings after each attempt. The shape lives in `validateDefinition`'s code and in `spec/flow-definition.md`'s prose; no
schema of it existed, and no key of a definition carried a description (P43 fact 1). The validator already EXPORTED most
of its key sets, for tests binding them to the spec's tables. A schema written by hand would be a second copy of those
sets, drifting in silence; and only a real JSON Schema validator can tell a schema that SAYS the right keys from one
that ACCEPTS the right documents ((b1)). ADR 0053 priced `@cfworker/json-schema` 4.1.1 at 42,516 browser-bundle bytes
and refused it as a RUNTIME dependency.

## Decision

**`definitionSchema()` returns a definition's static shape as a JSON Schema draft 2020-12 object, built from the
validator's own key sets; a 2020-12 validator holds it true in the tests alone.**

1. **Built, never written down.** Every key list and enumeration is read from the validator's exported
   constants — `DOC_KEYS_DECLARED`, `NODE_KEYS_DECLARED` and `NODE_KEYS_REQUIRED`, `EDGE_KEYS_DECLARED` and
   `EDGE_KEYS_REQUIRED`, `RETRY_POLICY_KEYS`, `TRANSFORM_KEYS`, the three predicate key sets, `ROUTABLE_STATES`, `KINDS`,
   `ID_RE`, `KEY_PATH_RE`, `PREDICATE_OPS`, `PREDICATE_ROOTS`, `SCHEMA_KEYWORDS`, `SCHEMA_TYPES`. Six are exported for it
   at v0.50 — `ID_RE`, `KINDS`, `ROUTABLE_STATES`, `DOC_KEYS_DECLARED`, `NODE_KEYS_REQUIRED`, `EDGE_KEYS_REQUIRED` — each
   a COPY, so editing one moves no verdict. *(`ID_RE` and `KINDS` were first exported as the validator's live objects,
   and W210's conformity reader measured `KINDS.splice` and `ID_RE.compile` moving verdicts; both are copies now, a
   frozen array and a fresh `RegExp`.)* **Three things are WRITTEN in the schema's module, because the validator keeps
   them private**: the reference grammar's tokens, `FD-V44`'s operator partition and each kind's edge keys — and W210's
   suite holds each to the validator (every spelling against `referenceTarget`, every operator against
   `validateDefinition`), so a token the validator gains is a red test rather than a silent refusal. **They are PUBLIC, and that was
   weighed rather than defaulted** (W210's stop-and-ask (b), whose answer preferred them module-internal): `index.ts`
   re-exports `validate.ts` WHOLE (`export *`, since W3), so any export of it is a root export. Keeping six names off
   the root would need either `index.ts` rewritten as an explicit list of every name it re-exports, or the validator's
   key tables moved out of `validate.ts` into a second, unexported module — each a larger change to two files than the
   names are worth, and the second splits the tables from the rules that read them. And they are the same kind of value
   the validator already publishes for the same reason — `NODE_KEYS_DECLARED`, `EDGE_KEYS_DECLARED`,
   `RETRY_POLICY_KEYS`, exported so a reader binds a list to the spec's table — so a consumer building on the schema
   (W211's registry form, a host's own checks) reads the SAME sets rather than a third copy. **Each key carries a hand-written
   `description`, and a key with none — or with no schema of its own — makes `definitionSchema()` throw, naming it.**
2. **What it refuses, `validateDefinition` refuses under EVERY registry; the converse does not hold.** It carries every
   rule a node, an edge or a value decides by its OWN shape, and none that needs another node or the registry. Its root
   `description` names `validateDefinition` — and `runtime.check` — as the authority for the rest and for the whole.
   **Where the validator is looser than `FD-V21`'s sentence, the schema follows the validator**: a join's `of` and a
   fanout's branch entries are held to the id charset only where they are strings, because the validator holds both
   through the graph alone and accepts `of: null` on a join of no region and `["b", "c", 5]` (W210's conformity reader;
   [Q774](../questions/q774.md)).
3. **A plain object, a new one per call**, JSON-serialisable, `$schema`
   `https://json-schema.org/draft/2020-12/schema`. The library never evaluates it.
4. **Not held to ADR 0053's subset** (P43 decision 2). That subset is for schemas the library evaluates; this one it emits,
   so `$defs`, `$ref`, `oneOf`, `if`/`then` and `pattern` are used freely. An `answerSchema` it describes is in the
   subset, and the schema's `subsetSchema` is that subset's own meta-schema, built from `SCHEMA_KEYWORDS`.
5. **A test-only validator is not ADR 0053's refused dependency.** `@cfworker/json-schema` is a `devDependency`, pinned
   EXACT: nothing under `src/` or `index.ts` imports it, it is in no published file list, and neither the npm tarball
   (`dist/**`) nor the JSR package (`deno.json`'s `publish` list) carries or names it — so a consumer installs and
   bundles nothing more. It is imported by the L1 suite alone, in all three runtimes: chromium bundles it with the suite,
   and Deno resolves it from `package.json` and `node_modules` as it resolves `esbuild`, with no `deno.json` `imports`
   entry — `deno.lock` records it as one line of its `packageJson` list, written by `deno` itself. **ADR 0053's refusal stands unmoved**: a validator a RUN uses is still the built-in subset.
6. **The 2020-12 meta-schema is vendored as test data**, because the validator ships none; the suite checks the schema
   against it, with one documented change — `$dynamicRef: "#meta"` read as a `$ref` to the dialect's own schema, which
   it names when nothing extends the meta-schema — because cfworker 4.1.1 does not follow a `$dynamicRef` into a nested
   schema (measured at W210).

## Consequences

1. **An agent, a host and the app's guide read the shape as data** — every node kind and its keys, edges, the three
   `when` shapes, `needs`' grammar with `"n!error"`, a retry policy, a transform — and check a document before the
   findings. W210's suite holds it to the corpus: every valid flow accepted, every invalid file whose rule is shape-only
   refused beside its one-clause repair, and a mutation sweep over the valid corpus in which no refusal of the schema is
   an acceptance of the validator.
2. **A key the validator gains is a key the schema gains** — or a throw at the first build, in every lane's L1, naming
   the key with no description. *The key sets are typed `readonly string[]`, so this is an L1 failure, not an L0 one.*
3. **Additive**, in 0.11.0: the root export `definitionSchema`, the type `DefinitionSchema`, and the six constants. No
   rule, verdict or behaviour moves.
4. **What this forbids**: a hand-maintained `.schema.json` beside the code (P43 (a3)); importing the test validator from
   `src/`; and reading the schema's acceptance as a definition's validity — `validateDefinition` remains the one check a
   run applies.
5. **What it does not decide**: the registry-specialised form, `definitionSchema(registry)` — P43's next item.

## Alternatives rejected

| | why not |
|---|---|
| **A published `.schema.json` file** (P43 (a3)) | a second copy of the key sets, drifting in silence, and nothing to specialise to a registry |
| **Structural key-set binding only, no validator** (P43 (b2)) | proves the key names and nothing a validator would do with them: a wrong `type`, `pattern` or `required` passes |
| **`@cfworker/json-schema` as a runtime dependency** | ADR 0053's refusal, unmoved — the library evaluates no schema outside its subset |
| **Holding the emitted schema to ADR 0053's subset** | the subset has no `pattern`, `$ref` or `oneOf`, so it could not say an id's charset, a `when`'s three shapes or a recursive `answerSchema` |
| **Adding the validator to `deno.json`'s `imports`** | unnecessary — measured, Deno resolves it from `package.json` — and it would put a test's dependency in the file whose `publish` list governs what JSR ships |
