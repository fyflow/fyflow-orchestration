---
id: ADR 0098
title: "Four annotations join the schema subset — `title`, `description`, `readOnly` and `writeOnly` — each shape-checked and constraining nothing"
status: accepted
date: "2026-10-15"
item: W164
raised-by: P37
supersedes: ADR 0053 in part; ADR 0056 in part
amends: ADR 0053 rule 2
resolves: ""
---

# ADR 0098 — Four annotations join the schema subset — `title`, `description`, `readOnly` and `writeOnly` — each shape-checked and constraining nothing

**Status:** accepted — [P37](../plans/p37-a-runtime-is-its-registry.md) decision 4, the maintainer's (2026-10-14/15),
written by [W164](../work-items/w164-four-annotations-in-the-schema-subset.md). It **supersedes
[ADR 0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) rule 3's annotation
sentence, its consequence 2 and its rejected *whitelist* row**, and **[ADR 0056](0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)
consequence 4** — for these FOUR keywords only; every other keyword those records refuse stays refused, by the same
rule, naming it. It **amends ADR 0053 rule 2** the way ADR 0056 did: the subset's count moves, from thirteen to
seventeen. It does not reopen [Q278](../questions/q278.md): a keyword outside the subset is still refused and never
ignored — what moves is which keywords are inside it.

## Context

**A consumer asked for it, by a workaround that grows with every plugin.** fyflow-app strips `writeOnly` from every
schema before this library sees it (`withoutWriteOnly`, request **#20**), walking `properties`, `items` and
`additionalProperties` (P37 fact 3) — because ADR 0053 rule 3 refuses every keyword outside the subset. P37
decision 4 answers it with the four annotations named there: `title`, `description`, `readOnly`, `writeOnly`.

**What the two earlier records refused, and on what ground.**

| record | what it said | its ground |
|---|---|---|
| ADR 0053 rule 3 | *annotation keywords are outside the subset and refused with the rest* — `title`, `description`, `$schema`, `$comment` | *a consequence of the rule and not a judgement about annotations* |
| ADR 0053 consequence 2 | `description` and `title` are refused, *which will surprise an author* | the alternative is *a second enumeration*, and every unbound list here went stale ([Q102](../questions/q102.md)'s shape) |
| ADR 0053's rejected *whitelist* row | `title` and `description` ignored, the rest refused | *a second list, bound to nothing, and the first request for `$comment` reopens it* |
| ADR 0056 consequence 4 | `title` and `description` still refused | *`examples` is admitted because the validator can HOLD it to something; an annotation it cannot check is the ignored kind* |

**Fact 3 of the plan measured what admitting the four touches**: one list (`SCHEMA_KEYWORDS`), one spec table, four
assertion sites, and **no value check** — `findings` has a clause per keyword it knows and none else, and the wiring
relation `fits` reads named keywords only. W164 re-measured it in a byte copy: the code changed alone, exactly those
four sites went red and no L2-L6 assertion moved (the item's M2, which records one L6 flake in a row no schema
keyword reaches).

## Decision

1. **The subset admits four ANNOTATION keywords beside `examples`: `title`, `description`, `readOnly` and
   `writeOnly`.** They join `SCHEMA_KEYWORDS` itself — the ONE list, compared both ways with
   `spec/flow-definition.md`'s *The schema subset* table — which makes seventeen: twelve that constrain and five that
   annotate. There is no second list: ADR 0053's objection to a whitelist was a list *bound to nothing*, and these
   are bound by the same test that binds the other thirteen.
2. **Each one's VALUE SHAPE is checked at construction, at any depth**: `title` and `description` a string, `readOnly`
   and `writeOnly` a boolean. A wrong shape is the keyword's misuse — refused where every malformed keyword is
   (`SchemaRefused` in a registry document, and wherever else a schema is held to the subset), naming the path inside
   the schema and the keyword — and, within that schema, before its own `items` are walked and its `examples` are
   held to it, so no value is checked against a schema whose annotation is malformed. Across a tree the walk
   reports the FIRST problem it meets: a problem under an earlier keyword's sub-schema (`properties`) is reported
   before a malformed annotation of the schema holding it. A string may be empty; `readOnly` and
   `writeOnly` may both be `true`, which JSON Schema does not forbid. Each may sit on any schema the subset validates —
   a worker's four, a group type's, a class's, and every sub-schema under `properties` and `items` — and nowhere else,
   exactly as ADR 0056 rule 6 places `examples`.
3. **The four CONSTRAIN NOTHING.** `findings` reads none of them, `fits` reads none of them, and no check at
   construction or at run reads them for a value: a value is accepted or refused exactly as it would be by the same
   schema without them. **`writeOnly: true` hides nothing and `readOnly: true` refuses nothing.**
4. **There is NO REDACTION PROMISE.** A value under `writeOnly: true` is carried, cloned, kept in the run's event log, checkpointed, folded
   into run state, quoted in a refusal's message where that message quotes values (`FD-V33` prints the settings it
   refused) and handed to the next node exactly as any other value is. The
   library reads the annotation nowhere, so it cannot be the reason a secret stays secret: a consumer that redacts
   does it in its own code, before the value reaches a run or after it leaves one. This sentence is in the spec's
   table and in `AGENTS.md` section 13, because the keyword's name says the opposite.
5. **The bar, stated for the next request**: *an annotation is admitted if it constrains nothing in JSON Schema itself
   and its value shape is checked.* It is NECESSARY and not sufficient — a keyword that meets it is admitted by an
   amendment of this record when a consumer asks for it, one keyword at a time, the way ADR 0053's *What it does not
   decide* takes an extension. That is the answer to the whitelist row's *the first request for `$comment` reopens
   it*: a request is an amendment against a stated bar, not a reopening.
6. **Still REFUSED by name, as before**: `deprecated`, `$comment`, `default`, `format`, `$schema`, `$id`.
   - **`default`** — authors expect it APPLIED, and nothing here applies one; a default that is not applied is a
     value the author believes is there and is not, which is the silent kind.
   - **`format`** — it READS as a constraint, and JSON Schema leaves it an annotation by default: a `format: "email"`
     that checks nothing is Q278's hazard exactly, one keyword over from `pattern`.
   - **`$schema` and `$id`** — they name a dialect and a base URI for `$ref`. The subset is no dialect a URI names,
     and `$ref` is outside it.
   - **`deprecated` and `$comment`** — each meets the bar and **no consumer has asked for either**; rule 5 admits one
     the day one does.

## Consequences

**What this makes easy.** A plugin's schema, annotated as JSON Schema tools annotate, resolves unchanged — fyflow-app
can delete `withoutWriteOnly`, and an editor that reads `title` and `description` reads them off the same document the
runtime validates. A schema that misuses one (`"readOnly": "yes"`) is refused where it is written, naming it.

**What it costs, each stated.**

1. **An author may read `writeOnly` as a promise.** Rule 4 is the whole answer, and it is stated in the spec's table
   and in `AGENTS.md` beside the snippet that admits it. A redaction feature — the library reading `writeOnly` and
   masking a value in what it retains or reports — is not decided here and would be its own plan: every record that
   carries a value (the event log, the checkpoint, `RunState`, a refusal's detail) would move.
2. **`readOnly` does not refuse a value a caller supplies** — at `start()`'s `FD-R4` boundary, at `resolve()`, or
   anywhere. JSON Schema allows an owning authority to reject such a value and does not require it; this library
   does not.
3. **The subset's keyword count is no longer the count of what constrains.** Seventeen keywords, twelve constraining:
   a reader counting `SCHEMA_KEYWORDS` to learn what is checked is wrong by five, and the spec's table says which.

**What a future reader is likely to try that this forbids.** Reading `writeOnly` to mask a value *"since the schema
already says so"* — rule 4: that is a feature with its own plan, and half of it would be the silent kind. Admitting
`format` *"as an annotation, the way JSON Schema does"* — rule 6, Q278. Admitting `default` and applying it — a
constraint-shaped behaviour no rule here states. Accepting any value for `title` *"because it is only
documentation"* — rule 2: an unchecked annotation is the ignored kind ADR 0056 consequence 4 named, and the shape
check is what keeps it out.

**What it does not decide.** A redaction feature (cost 1). Whether `deprecated` or `$comment` joins (rule 5). Whether
a `FlowDefinition` shape schema is published (P37's #15, deferred) — the reason `description` matters to an agent
reading one.

## Alternatives rejected

| | why not |
|---|---|
| **Keep refusing the four** (ADR 0053 rule 3 as written) | the consumer's workaround grows with every plugin and walks three of the subset's own keywords to strip one it does not know; the objections to admitting them — an unbound list, an unchecked annotation — are both met by rules 1 and 2 |
| **Admit them UNCHECKED** — any value | ADR 0056 consequence 4's *ignored kind*: a `"title": 5` would pass in silence. The shape check is what the bar requires |
| **A separate list of ignorable annotations** beside `SCHEMA_KEYWORDS` | ADR 0053's whitelist row, for its own reason: a second list. One list, bound to the spec both ways, is the shape that row did not consider |
| **Admit every annotation JSON Schema's meta-data vocabulary names** — `default` and `deprecated` too | `default` reads as applied (rule 6); and admitting what nobody asked for is the whitelist row's *bound to nothing* by another road |
| **Admit `writeOnly` and redact** | a promise every retaining record must keep — the event log, the checkpoint, the run state, every refusal's detail — none of which P37 measured. Cost 1 |
