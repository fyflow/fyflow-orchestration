---
id: ADR 0056
title: "An example is an ANNOTATION, validated against the schema it sits on"
status: accepted
date: "2026-09-18"
item: W72
raised-by: P19
supersedes: ""
amends: ADR 0053 rule 2
resolves: ""
---

# ADR 0056 — An example is an ANNOTATION, validated against the schema it sits on

**Status:** accepted — answers [P19](../plans/p19-what-a-schema-buys-an-author.md) decision 2 and
the first half of decision 3, on that plan's facts 2, 5 and 6 and on the maintainer's answer to
[W72](../work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)'s
stop-and-ask 1 (*optional*, 2026-09-18). **Amends
[ADR 0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
rule 2**: the subset is thirteen keywords, twelve that constrain and one annotation — the FIRST
deliberate extension of the subset, taken the way that record's *what it does not decide* says an
extension is taken: with a measurement, one keyword at a time. ADR 0053 rule 3 (a keyword outside
the subset is refused, never ignored) is unchanged and is what makes this extension legible: today
a document carrying `examples` meets a refusal naming it, and tomorrow it meets a check.
[ADR 0054](0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) rule 5's
*`inputSchema` and `outputSchema` are declared, carried, and enforced nowhere* stands for every RUN;
what changes is that an authoring-time tool now has something to run a worker on.
**Raised by:** P19, taken by W72

## Context

**A schema and its example agreeing proves the schema is self-consistent and says nothing about the
worker.** P19's declaration wrote honest output schemas for the fourteen corpus workers from their
code; one was wrong — `echo.arrays` typed as a list from the field's NAME, where the worker returns
a COUNT — and the example written beside that schema conformed to the wrong schema. Only running the
worker found it: one real output of twelve failed the schema its author wrote (fact 6, re-run at W72's
declaration and byte-identical). **So the AUTHOR's declaration is the likelier lie**, and the check
that catches it has to execute rather than read.

**What that check needs is a VALUE to run a worker on, and the registry document had no place for
one.** ADR 0053 refuses every keyword outside its twelve, annotation keywords included — measured at
W72's declaration: `examples` is refused by name at the top level, under `properties` and under
`items`, and `findings` never reads it. The plan's decision 2 put the value INSIDE the schema, as JSON
Schema's own `examples` keyword, so that a worker's input example, output example, config example
and settings example each sit beside the schema they claim to satisfy — and decision 3 made the
conformance check run on the input one.

**Two more facts decided the shape** (W72's declaration, `dev-dist/w72/`):

| fact | measured |
|---|---|
| **The validator's existing value check takes a declared example unchanged** (P19 fact 2, re-run) | `findings(schema, example)` over all twelve: every example conforms. The construction-time check is one more call to a function that already checks config and settings values |
| **The price of making the example OPTIONAL is a witness that exercises less, by a number** | P19 fact 5's 28-line generator produces a value conforming to any schema in the subset, and it is the LEAST such value: the witness is `{}` for thirteen of the fourteen corpus input schemas and `{"text":""}` for `prompt`'s, the one that requires a key. Run on it, every described worker's output conforms exactly as on the declared example — so a witness does catch fact 6's shape — but in **5 of 12** described workers the witness run reaches FEWER output paths: `split`'s `items[]` and both keys inside it, `publish`'s collection, `weigh`'s and `attest`'s `keys[]`, `echo`'s echoed input. An output schema's `items` sub-schema is never applied on the witness for the three workers that have one (`split`, `weigh`, `attest`). *(Re-taken on the SHIPPED document by W72's conformity reader — the declaration measured a harness whose `prompt` schema required nothing and whose `retry` threw, and read "twelve of twelve" and "5 of 11" off it; `dev-dist/w72/coverage-shipped.log`.)* |
| **The price of making it REQUIRED is six edits and no executed snippet** | `inputSchema`/`outputSchema` are declared at six sites outside `doc/`, three of them P18's *verbatim* sample in a test, and no `AGENTS.md` or `README.md` snippet declares either. Required on all four schema kinds would reach 41 sites, four executed snippets and the three built-in group types' schemas in `src/` |
| **A corpus worker MUTATES what it is handed** | `tally.ts` writes into its input; a check that hands a document's parsed example to a worker ships the document mutated in memory. Every example a tool runs a worker on is a copy, and the check asserts the document survived the run |

## Decision

1. **`examples` joins the subset as its thirteenth keyword and it CONSTRAINS NOTHING.** Its value is
   a non-empty list; a value that is in no example is not refused; `findings` reads no clause named
   `examples`, by construction. An annotation, in JSON Schema's own sense of the word.
2. **Every example is held to the schema it sits on AT CONSTRUCTION, at any depth, and one that
   refutes it is refused naming the entry, the field, the example's index and the finding** —
   `SchemaRefused`, the registry's existing class, because an example that contradicts its own
   schema is a defect of the DECLARATION on exactly the argument ADR 0053 adopted the subset on: *a
   defect the day it is written, not the day a tool reads it*. `schemaProblem` runs `findings` over
   each example LAST, after every keyword of the schema and of its sub-schemas has been checked,
   because `findings` may only walk a schema already known to be in the subset (ADR 0053 rule 5).
   **An empty list is refused** as `enum`'s is: a declared-and-empty list annotates nothing, which is
   the silent kind.
3. **The first declared example is the SAMPLE every authoring-time check runs on, and a declared
   example is OPTIONAL.** `scripts/check-workers.mjs` runs each worker of a registry document on
   `inputSchema.examples[0]`, constructed from `configSchema.examples[0]` and handed
   `settingsSchema.examples[0]`, and validates what `run()` returned against `outputSchema`; where a
   schema declares no example the tool generates fact 5's WITNESS and the verdict SAYS so, printing
   the witness — the maintainer's choice at W72's stop-and-ask 1, with the fallback's price in the
   table above. W73's wiring check runs a transform on the producer's example the same way.
4. **The check EXECUTES and is never a driver behaviour.** A worker is run once per check, on an
   author's value, with one retry on the same task id — because a worker whose contract is to fail
   its first attempt (`retry.ts`) has no return value to check until its second — and every value it
   sees is a copy. A worker declaring no `outputSchema` is reported NOT CHECKED by name whatever it
   does, since it has declared nothing about what it returns; the corpus's two are `fail`, which
   never returns, and `uncloneable`, which returns a function no JSON Schema describes, and each
   module's header says so. Per-settlement validation of a worker's result stays OUT (P19 decision 5).
5. **Every corpus worker declares `inputSchema` and `outputSchema` with an example on each** —
   P19 fact 1's twelve output schemas verbatim, `echo` corrected, the input schemas written from what
   each worker reads, and examples on `prompt`'s `configSchema` and on the three `settingsSchema`s
   the corpus already declared — and `check:workers` is a gate entry between `check:wiring` and
   `check:docs`, red on fact 6's schema as its self-test's first probe.
6. **Where the keyword may sit, and where it may not.** On any schema the subset validates — a
   worker's four, a group type's, a class's, and every sub-schema under `properties` and `items` —
   and nowhere else: it is a schema keyword and not a worker-entry key, so `WORKER_KEYS` and the
   spec's worker-entry table are unchanged.

## Consequences

**What this makes easy.** A registry document says, beside each schema, one value that satisfies it,
and the day the two disagree the document is refused where it is written. A tool that needs a value
to run a worker on, run a transform over, or diff a result against has one without asking, and can
say whether it was an author's or a generator's. `json-schema-to-typescript` and every JSON Schema
editor already read `examples`, so the annotation costs a consumer nothing to learn.

**What it costs, each stated because it was priced.**

1. **A document with a schema and no example resolves, and a tool run on it gets a witness that
   exercises less** — 5 of 12 corpus workers, above. The verdict names the witness so the weakness is
   visible rather than green; the alternative (required) was priced at six edits today and refused
   by the maintainer for keeping a document writable without one.
   **And one example — declared or witness — confirms a schema at ONE value.** W72's conformity
   reader derived from the workers' CODE that two declared bounds were not guaranteed over the
   input domain the input schema admits: `split`'s per-item `confidence` is `word.length / 10`, so an
   eleven-letter word exceeds a `maximum: 1` the example never reached, and `weigh`'s `score` is a
   product with `run.confidence` unbounded by its input schema. Both corrected in the corpus (the
   bound dropped where the code does not keep it, the input bounded where the code assumes it), and
   the shape recorded as [Q302](../questions/q302.md): the check sees the example and not the domain.
2. **The witness generator ships inside the check script and not in `src/`** — W74's assist lifts it
   if the sample-and-diff loop wants it; until then it is fact 5's harness, in one file.
   *(Both halves of that sentence are now false and are kept as the record of where the generator was
   when this was decided. **W73 lifted it one item early** — `src/definition/witness.ts`, because the
   wiring check's transformed arc needs it in the library, and the check imports the one copy. **And
   W74's assist does NOT lift it**: `assist.ts` reaches the witness TRANSITIVELY, through
   `checkWiring`, which is what keeps ONE sampling rule rather than two — W74's conformity reader,
   finding 6, found by that item's grep of the tree for its own id.)*
3. **A worker that throws twice under a declared `outputSchema` is red** (K3), and a worker that
   throws under none is a line of output. The retry is the one policy the check carries, stated in
   its header rather than inferred from a scheduler.
4. **`title` and `description` are still refused** (ADR 0053 consequence 2). `examples` is admitted
   because the validator can HOLD it to something; an annotation it cannot check is the ignored kind.

**What a future reader is likely to try that this forbids.** Reading `examples` as an `enum`
*"because the values are right there"* — rule 1; the two keywords exist for the two meanings.
Skipping the construction-time check on an example *"because it is only documentation"* — rule 2 and
fact 6: the example that conformed to the wrong schema IS the case. Handing a worker the document's
own example object — the `tally` measurement; copy it. Requiring an example *"to make the check
total"* — priced and refused at the stop-and-ask; the check is total already, with a weaker floor.

**What it does not decide.** What a wiring check says of an edge between two schemas (W73). Where
the transform loop lives and what a generated signature looks like (W74). Whether a second annotation
keyword ever joins — one that can be checked would be taken this way, one that cannot stays refused.

## Alternatives rejected

| | why not |
|---|---|
| **`examples` REQUIRED on every declared `inputSchema` and `outputSchema`** | Priced at W72's stop-and-ask: six edits today, no executed snippet, the check total with one verdict kind and W73/W74 always on an author's value — and refused by the maintainer, because a registry document should stay writable without one. The witness's weaker floor is stated in the verdict instead |
| **A worker-entry key (`example`, `note`) beside the schemas** | A sixth key nothing else reads, outside the schema it describes, and a second place a value's shape is stated; JSON Schema already has the keyword, and every schema tool reads it |
| **A twelfth `RegistryError` for a refuting example** | Two classes for one kind of defect — a schema whose declaration contradicts itself — and a spec table, a both-ways test and a reference snippet all moving for a distinction the message already makes |
| **Ignoring `examples` the way JSON Schema does, and checking it only in the tool** | ADR 0053 rule 3 refuses the ignored keyword for the reason fact 6 restates: an unchecked example is a claim nobody ran, and it would sit in the document exactly as long as the wrong schema did |
| **A whitelist of annotations** (`title`, `description`, `examples`) | ADR 0053's own refusal: a second list, and two of the three cannot be held to anything |
