---
id: ADR 0053
title: "The schema validator is a built-in subset, and a keyword outside it is refused"
status: accepted
date: "2026-09-15"
item: W65
raised-by: P18
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0053 — The schema validator is a built-in subset, and a keyword outside it is refused

**Status:** accepted — answers the first of [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s
two decisions, *what validates the schemas a registry document declares*, on that plan's decisions 3
and 8 and its fact 1. **The choice — a built-in SUBSET over a dependency — is the maintainer's, taken
at the draft on 2026-09-15 once fact 1 had priced all three candidates, and this record is written
from the decision rather than re-taking it.** The second half, *what happens to a keyword the subset
does not have*, is [Q278](../questions/q278.md), decided at the declaration for W65. **One departure from
the plan's decision 8, named here**: that decision put the validator on the RUNTIME sub-path, and it lives
in `src/definition/**` and is exported from the root, because the DRIVER applies it (`FD-V33` at
`new Driver`) and it imports nothing (decision 1 below). Amends nothing:
[ADR 0049](0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) rule 2 left the
schema LANGUAGE to P18 by name, and this is that language; [ADR 0052](0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md)'s
question — where a dependency is declared when one sub-path reaches it — is asked a third time here
and answered by taking none.
**Raised by:** P18, taken by [W65](../work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)

## Context

**A registry document declares schemas, and something has to read them.** P18 makes a worker entry
carry four JSON schemas (`configSchema`, `settingsSchema`, `inputSchema`, `outputSchema`), a group
type one, and a node-type class one; two of a worker's are enforced at construction and at
`new Driver`, where W59's per-type settings VALIDATOR ran, and a validator that is a function cannot
live in a JSON document. So the plan's decision 3 puts schemas on the WORKER and its decision 8 says
the validator is the runtime sub-path's dependency, never the root's — ADR 0052's shape — and leaves
open whether that dependency is a package or a built-in.

**P18 fact 1 priced three candidates on 2026-09-15, each loaded under Node 24.20.0 and Deno 2.9.6
from scratch installs OUTSIDE the repository and bundled with this repository's own esbuild:**

| candidate | version | installed | dependencies | browser bundle | loads in Node / Deno |
|---|---|---|---|---|---|
| `ajv` | 8.20.0 | 1 292 990 bytes over 5 packages | 4 | **262 431 bytes** — more than `jsonata`'s 242 190 | yes / yes |
| `@cfworker/json-schema` | 4.1.1 | 173 840 bytes | 0 | **42 516 bytes** | yes / yes |
| a built-in SUBSET | — | 32 lines, 2 476 bytes | 0 | **1 460 bytes** minified | yes / yes |

**And measured what the subset covers**: `type` (with `integer`), `required`, `properties`,
`additionalProperties: false`, `enum`, `const`, `minimum`/`maximum`, `minLength`/`maxLength`,
`items`, `minItems` validate every schema the plan's sample and the corpus's registry need — **14 of
14 cases**, negatives included — re-taken at W65's declaration in both runtimes
(`dev-dist/w65/fact1-{node,deno}.log`, `14/14 as expected`). What fact 1 cannot say is what a
consumer's worker will write, which is why the plan's prediction 4 is a REACH prediction and its
reversal condition is a dependency this record names.

**Two facts under the decision that the prototype did not state and W65 measured while rewriting
it** (`test/definition/schema.test.ts`):

| fact | measured |
|---|---|
| **1. JSON Schema's own semantics IGNORE an unknown keyword.** | The prototype walked the keywords it knew and no others, so `{ type: 'string', pattern: '^s' }` accepted `'x'` with zero findings — a schema saying one thing and a validator checking another, at exit 0. That is [W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)'s zero-score shape one layer up, and the reason Q278 exists |
| **2. `typeof NaN === 'number'`, so a subset written from `typeof` admits what JSON cannot carry.** | The prototype's `type: 'number'` accepted `NaN` and both infinities. JSON text has no spelling for any of them, so a schema over JSON data has one honest reading — *not a number* — and a hand-built document carrying one is refused rather than admitted |

## Decision

1. **The validator is a BUILT-IN subset of JSON Schema, shipped in `src/definition/schema.ts`, and
   the package takes NO dependency for it.** The maintainer's choice at the draft, on fact 1's
   pricing: 1.5 KB against 42 KB against 262 KB — the prototype's size; the shipped module, with its
   diagnostics and its construction-time check, bundles to **4.2 KB** (re-taken at W65, the argument
   unmoved) — for a language the sample and the corpus need
   twelve keywords of. It lives in `src/definition/**` rather than in a sub-path because the DRIVER
   applies it (`FD-V33` reads a worker's `settingsSchema` at `new Driver`) and the pure root may
   load it — it imports nothing, reaches no engine, and is pure functions over data (`RT-R3`, `RT-R4`).
2. **The subset is EXACTLY twelve keywords, enumerated once in code and once in the spec, and the
   two lists are compared both ways**: `type`, `required`, `properties`, `additionalProperties`,
   `enum`, `const`, `minimum`, `maximum`, `minLength`, `maxLength`, `items`, `minItems` —
   `SCHEMA_KEYWORDS` and `spec/flow-definition.md` section 3's *The schema subset* table. Each
   keyword means what JSON Schema says it means, with two readings stated where JSON Schema leaves a
   choice: `additionalProperties` admits `true` or `false` and not a schema; `items` admits one
   schema and not a tuple. **`number` and `integer` admit FINITE numbers only** (fact 2). An empty
   schema `{}` is in the subset and accepts every value.
3. **A keyword outside the subset is REFUSED at construction naming the keyword and its path, never
   ignored** — [Q278](../questions/q278.md), decided at P18's declaration. `schemaProblem` walks
   every declared schema, `properties` and `items` included, before any value is checked, and the
   first keyword it does not know is a `SchemaRefused` naming the worker, the field, the path inside
   the schema and the keyword. A keyword's VALUE has a shape too, and a wrong one is refused the same
   way. **Annotation keywords are outside the subset and refused with the rest** — `title`,
   `description`, `$schema`, `$comment` — a consequence of the rule and not a judgement about
   annotations; a whitelist of ignorable keywords would be a second list nothing measured.
4. **All four of a worker's schemas are held to the subset at construction, and two are APPLIED.**
   `configSchema` over a type's default config and every instance's derived config at construction
   (`TypeDefaultRefused`, `ConfigRefused`); `settingsSchema` over a node's effective settings — the
   type's defaults merged under the node's — at `new Driver` under `FD-V33`. `inputSchema` and
   `outputSchema` are declared and carried and enforced by nothing in this plan: P19's strict mode,
   named as P16 and P17 named it. A malformed `inputSchema` is refused today because it is a registry
   defect the day it is written, not the day P19 reads it.
5. **Two functions, in that order, and the order is the contract.** `schemaProblem(schema)` says
   whether a schema is in the subset; `findings(schema, value)` says whether a value satisfies a
   schema already known to be. The second does not re-check the first — a caller that skipped the
   check would be back to ignoring a keyword in silence — and every caller in `registry.ts` and
   `validate.ts` runs the first at construction and the second afterwards.
6. **`enum` and `const` compare by VALUE, canonically**: keys sorted at every level before the
   comparison, so an object member matches whatever key order the document wrote it in.
7. **The reversal condition is written here rather than left to a retro.** If a real worker needs a
   keyword outside the subset — prediction 4's reversal — this record's successor declares
   `@cfworker/json-schema` at an exact pin, in the runtime sub-path's dependencies and by the bare
   specifier alone, exactly as ADR 0052 declared `jsonata`; and rule 3 is what makes that day
   legible, because the consumer meets a refusal naming the keyword rather than a pass.

## Consequences

**What this makes easy.** A registry document's schemas are JSON Schema a consumer already knows how
to write, checked in every runtime the library targets with no install, no bundle cost worth a
number, and no version to pin. A typo in a keyword is refused at construction naming it, which is
the same thing `FD-V17` does for a flow document's keys.

**What it costs, each stated because the table above priced it.**

1. **A consumer whose worker wants `pattern`, `format`, `oneOf` or `$ref` cannot have it** until
   rule 7 fires — and meets a refusal that says so, naming the keyword. The 42 KB dependency would
   have admitted every draft keyword on day one; the maintainer paid the refusal.
2. **`description` and `title` are refused** (rule 3), which will surprise an author who annotates
   schemas out of habit. The alternative — a list of ignorable keywords — is a second enumeration,
   and every list in this repository that was not bound to something went stale
   ([Q102](../questions/q102.md)'s shape); the refusal is the smaller thing to be wrong about.
3. **The subset has no way to say *exclusive*** (`exclusiveMinimum` is outside it), so *a positive
   number* is written `minimum: 0` and accepts zero, or the consumer refuses zero in the worker. The
   corpus's `Scorer` type had a function that refused zero; its schema does not, and the corpus's
   `FD-V33` case is a non-number rather than a non-positive one for that reason.
4. **Twelve keywords are a claim the corpus and the sample make, not a claim about consumers** —
   prediction 4's scope, stated where it was measured.

**What a future reader is likely to try that this forbids.** Ignoring an unknown keyword *"the way
JSON Schema does"* — rule 3 and fact 1: that is the silent kind, and Q278 decided against it.
Adding `ajv` *"for one keyword"* — rule 7 names the smaller dependency and the shape of the
declaration; 262 KB in every browser bundle for a registry document is the shape ADR 0052 refused
for an engine that is at least used. Reading `NaN` as a number *"because `typeof` says so"* — fact 2.
Skipping `schemaProblem` on a schema *"that is obviously fine"* — rule 5.

**What it does not decide.** Whether `inputSchema` and `outputSchema` are ever enforced, and how
(P19). Whether a second keyword joins the subset without a dependency — a keyword the corpus comes
to need is an amendment here with its measurement, on the pattern of the four rule widenings
`spec/flow-definition.md` v0.8 records.

## Alternatives rejected

| | why not |
|---|---|
| **`ajv`** | 262 KB in the browser bundle — more than the JSONata engine — over five packages with four dependencies of their own, for a language of which the sample needs twelve keywords. Priced at fact 1 and not chosen |
| **`@cfworker/json-schema`** | 42 KB, no dependencies, loads everywhere — the right dependency if the subset ever falls short, which is why rule 7 names it rather than leaving the reversal to a retro. Not taken on day one because nothing measured needs it |
| **The subset, IGNORING unknown keywords** | JSON Schema's own semantics and the prototype's behaviour; refused as Q278 because a `pattern` that constrains nothing at exit 0 is W43's shape, and because it would make prediction 4's reversal invisible |
| **A whitelist of annotation keywords** (`title`, `description` ignored; the rest refused) | A second list, bound to nothing, and the first request for `$comment` reopens it. The refusal is uniform and the cost is stated as consequence 2 |
| **A schema on the TYPE rather than on the WORKER** | P18 decision 3's alternative, refused there: it conflates three levels, and the worker is what its constructor argument and its `run()` input are contracts OF |
| **Keeping W59's function validator beside the schema** | Two ways to say one thing, and a JSON document cannot carry the first. The function is retired with `workerType` (ADR 0054) |
