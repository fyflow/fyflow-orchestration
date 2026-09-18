# W72 — The contract: an example beside every schema, and a worker RUN on its own

**Status:** DONE — declared, built and gated 2026-09-18 on `2fe4bdb`'s tree (digest `8b0f3b35993cb03b` over 338 files at the declaration, Node 24.20.0); **both reader passes RUN the same day** (11 / 3 blocking and 71 mutations / 40 survivors / 28 real / 3 blocking, overlap 1, the forty-fourth measurement), every finding acted on, and **rule 8 re-run with thirty of their exact edits as probes** — 79 probes, 67 caught, 9 declared ceilings each run against its rung, 2 measured crashes, 0 undeclared survivors, 0 against declaration. **Stop-and-ask 1 ANSWERED the same day: OPTIONAL**, with fact 5's witness as the fallback and the verdict naming the value it ran on (below).
**Plan:** [P19](../plans/p19-what-a-schema-buys-an-author.md) — decisions 2, 3 and 6, fact 6,
predictions 1 and 4; the plan's first item, serial before W73 and W74.

```
Spec:       spec/flow-definition.md section 3, the registry-document subsection — the schema
            subset table gains `examples` (v0.20); the worker-entry table's two CARRIED rows say
            an example beside them is validated at construction; ADR 0056 (new). No FD-V: an
            example that refutes its schema is a REGISTRY defect, refused by name at construction
            where every other schema defect is, and never a rule about a flow document.
Owns:       src/definition/schema.ts, src/definition/registry.ts, spec/flow-definition.md,
            spec/README.md, spec/examples/**, examples/registry.json, examples/workers/**
            (schemas and examples only — no worker's behaviour changes), test/definition/**,
            doc/decisions/0056-*, scripts/check-workers.mjs (new) and scripts/check-workers-selftest.mjs
            (new) — the plan's W72 row, verbatim
Inputs:     P19 facts 1, 2, 5 and 6 — read from the plan's own file and RE-RUN from
            dev-dist/p19/facts-1-2-4.mjs and fact-5-sample.mjs on this tree rather than
            transcribed (section 1 rule 5): identical to the plan's logs, `echo` still the one
            mismatch (dev-dist/w72/facts-1-2-rerun.log); the twelve honest output schemas and
            input schemas in dev-dist/p19/schemas.mjs; ADR 0053 (the subset and Q278's *refused,
            never ignored*); ADR 0054 rule 5 (a worker owns the four schemas, two enforced); the
            maintainer's answer to stop-and-ask 1
Outputs:    (1) `examples` as the subset's thirteenth keyword and an ANNOTATION: refused with a
                malformed or non-conforming value at construction, read by nothing when a value is
                validated — ADR 0056's three rules, each fixtured both ways at L1
            (2) every one of the fourteen corpus workers in examples/registry.json declaring
                `inputSchema` and `outputSchema` with an example on each — twelve honestly from
                fact 1, and `fail` and `uncloneable` with NO outputSchema and the reason where the
                check reports it
            (3) scripts/check-workers.mjs, a gate entry: RUNS each worker of a registry document
                on its declared input example (constructed from its config example, handed its
                settings example) and validates what came back against its outputSchema —
                decision 3, an authoring-time tool and never a driver behaviour
            (4) its self-test, with fact 6's wrong schema (`echo.arrays` typed `string[]`) as the
                FIRST probe — red on the wrong schema, green on the corrected one
            (5) `spec/examples/registry.json`'s one declared schema carrying an example, so ladder
                L4's corpus holds the annotation too
Depends on: nothing
Blocks:     W73 (checks edges against the schemas this item declares and the examples it
            validates), W74 (the sample-and-diff loop runs on the same examples)
Tests:      expected values from the DOCUMENTS — ADR 0056's three rules, the spec's table, fact
            6's log — never from output. Fact 6 is the whole reason this item executes a worker
            rather than reading its declaration: a schema and its example AGREEING proves the
            schema is self-consistent and says nothing about the worker.
Gate:       L0; L1-L5 in five runtimes (`examples` fixtured both ways: an example that conforms
            accepts, one that refutes its schema is refused naming the entry, the field and the
            index; `findings` ignores it); check:workers RED on fact 6's schema and GREEN on the
            corrected one, both as checked-in probes; check:workers:selftest; check:source
            (S11/S12 over the new entries), check:wiring (G1-G5 over the new dispatch),
            check:spec (C4 UNMOVED at 34, C8 over the v0.20 row), check:docs (X7 unmoved);
            L6 in both runtimes, MOVED by exactly one clause (see exceptions); rule 8 obligation
            (a) over the annotation's three rules and every shape the keyword sits on (a top-level
            schema, a property's, an item's; on each of the four worker schema kinds), (e) over
            the new check's wiring (the manifest, the dispatch, the harness, the default the gate
            runs); then both reader passes and rule 8's re-run with their exact edits as probes
Reserves:   Q300-Q304, ADR 0056
```

## Exceptions

Seeded from the plan's table (P16's refused-as-a-rule, adopted-as-a-table procedure) and then
MEASURED at this declaration, which changed the table in both directions:

| path | seeded? | why |
|---|---|---|
| `package.json` | **no — measured here** | a new check is two manifest entries (`check:workers`, `check:workers:selftest`) and one link in the `gate` chain. `S11` refuses a check script the gate does not reach, `S12` compares the chain to a declared list both ways and in order, `G3` derives the manifest's two entries per check FROM DISK both ways — so the script cannot exist without the entries, and the plan's row said "reachable from `check-docs`'s shape or its own script" without naming what its own script costs |
| `scripts/check-source.mjs` | **no — measured here** | `GATE_CHAIN`, the declared list `S12` compares to the chain, gains `check:workers` in ladder position (the checks run cheapest-first; measured at build). Its self-test's `S12` probes are anchored agnostically since ADR 0039 and are predicted unmoved |
| `examples/l6.ts` | **no — measured here** | `l6.ts:6382`'s cross-row clause compares four workers' declared schema lists to a LITERAL — `fetch: ['outputSchema']`, `typed: ['settingsSchema']`, `ingest: []` — and this item gives all fourteen an `inputSchema` and an `outputSchema`, so the literal is rewritten to the rule's own enumeration (v0.17's clause: every worker carries the two P19 schemas beside whatever it declared). Predicted at the declaration: *L6 moves by this one clause and by nothing else, the runs staying at 53*. **Measured at the build: the rewrite is net ZERO, and a SECOND clause was ADDED** — every schema the corpus declares carries an `examples`, the corpus's own obligation where the library leaves it optional, with its subject in `CROSS_ROW_SUBJECTS` — so `CROSS_ROW` 133 → 134 and `DECLARED_TOTAL` 1610 → 1611, runs at 53 (the conformity reader corrected the prediction against `git diff`) |
| `scripts/check-wiring-selftest.mjs` | **no — UNDECLARED until the conformity reader found it** | its `CHECKS` literal names the checks whose dispatch `G1`/`G2` probe and two `SELF` entries anchor on that literal; an eighth check has to join both or the self-test's coverage is one check short. Edited at the build and listed in no table — the item's one undeclared edit, found by the reader's `git status` audit |
| `scripts/run-selftests.mjs`, `scripts/check-wiring.mjs`, `scripts/check-source.mjs` (comments) | LATE | present-tense *"the seven `:selftest` entries"* / *"the seven checks"* in header comments and one failure message, false with an eighth — the conformity reader's finding 6; each corrected to name the moment it counted |
| `src/definition/types.ts` (one comment) | LATE | *"enforced by nothing here — P19's strict mode"*: P19's name is *what a schema buys an author* and v0.20 confirms the two schemas on a run — the reader's finding 7, the same sentence corrected in `schema.ts` (owned) and `spec/flow-definition.md` §2 |
| `README.md` | **no — measured here** | its command table carries one row per gate entry, and P11's retro found four of seven rows disagreeing with the screen; the new entry gets a row. Also a record-step file |
| `examples/README.md` | seeded — **true** | the `workers/` row says `fetch.ts` *"has no schema at all and is the registry's instance of an absent schema means UNCHECKED"* — false the moment `fetch` declares two; W71's own late exception, one row down |
| `AGENTS.md` §13 (and not §3) | seeded — **narrower than seeded** | the seed said the subset's keyword list *"is stated in prose there"*; measured, `AGENTS.md` names `minItems`, `maxLength` and *twelve keywords* NOWHERE (grep, 0 hits). What moves is §13's *"nothing enforces them yet (P19)"* sentence and its worker-entry table's schema row; §3's refusal count does not move because no `FD-V` is added, so `X7` does not fire |
| `scripts/check-spec.mjs` and its self-test | seeded — **predicted UNNEEDED, and the SELF-TEST half FIRED in the confirming gate for a reason the seed did not give** | `C4` counts `FD-V` rows and this item adds none, and `C7` never reads a worker's schemas — both held, and `check-spec.mjs` is untouched. **But `C4`'s own-paragraph clause reads the LAST `**N refusals**` in the spec's header as the current claim, and the self-test's probe for it was anchored on v0.19's sentence**: this item's v0.20 paragraph added a later occurrence, so the probe edited history while the clause read the claim, and the first confirming gate was `GATE EXIT=1` on that ONE line with every other rung green. The probe is now anchored on the last occurrence, whatever sentence carries it — rule 7 (b)'s shape (W32: *a mutation pinned to a literal is unmutatable the moment the literal is right to change*), one version later than it was written |
| `scripts/check-docs.mjs` and its self-test | seeded — **predicted UNNEEDED** | `X7` binds a refusal count that does not move; `RUN_FLOOR` moves for a new `run` snippet and this item adds none — the L1 fixture is the evidence, not a reference snippet (that is W74's) |
| `src/` (rule 8 only) | — | probes mutate `schema.ts`, `registry.ts` and the check to measure what the fixtures observe; the product edits are inside `Owns` |

## Scope

**In**

1. `examples` on any schema in the subset, at any depth, on any of the four worker schema kinds,
   a group type's and a class's — one keyword, three rules (ADR 0056).
2. The corpus: fourteen worker entries with `inputSchema`, `outputSchema` and examples — fact 1's
   twelve output schemas VERBATIM from `dev-dist/p19/schemas.mjs` (with `echo`'s correction), the
   twelve input schemas written there from what each worker READS, and an example on each; on
   `prompt`'s `configSchema` and on the three `settingsSchema`s too, because the check constructs and
   settles a worker from those examples.
3. The conformance check and its self-test — a gate entry between `check:docs` and the ladder.
4. The spec's subset table, worker-entry rows, version bump to v0.20; `spec/README.md`'s row;
   `spec/examples/registry.json`'s one schema gaining an example.

**Out** — named, with where each goes

- **Applying `inputSchema` or `outputSchema` to any RUN** — the entry payload and a resolution are
  W73's (decision 5); per-settlement validation is *slices beyond* and OUT of the plan.
- **The wiring check and the relation** (W73), **the assists and the recipe** (W74).
- **Any keyword beyond `examples`** — prediction 3's `oneOf` arrives as a measured need or not at
  all; `publish.joinPayload` stays `{}` (fact 1 wrote it so and prediction 3 names it).
- **`spec/examples/registry.json`'s seven `corpus://` workers gaining input and output schemas** —
  none of them is a module (measured: seven URLs, zero loadable), so the conformance check cannot
  reach them and a schema there would be a declaration nothing runs. W73's wiring check may need
  them and W73 owns `spec/examples/**` for its miswire; it decides.
- **Changing what any worker RECEIVES or returns** — `examples/workers/**` is owned for schemas and
  examples only, and this item edits no `compute` (the plan's last stop-and-ask item, as a
  constraint).
- **A generated-sample function in `src/`** — fact 5's 28 lines live in the check script under
  the optional road; W74's `assist.ts` lifts them if the sample-and-diff loop wants them
  (stated assumption 3).

## The declaration step

Six facts, every one from a run on this tree under Node 24.20.0, redirected to `dev-dist/w72/`
and read by its exit code; nothing transcribed from the plan.

| fact | measured |
|---|---|
| **1. Facts 1 and 2 re-run, and prediction 4 still holds** | `facts-1-2-4.mjs` on `2fe4bdb`: 12 of 14 described, 0 outside the subset, ten keywords reached for with `maxLength` and `minItems` unused, 4 nullable type arrays, every example conforms to its own schema, and **`echo` is the one mismatch — `$.arrays expected array, got number`**, byte-identical to the plan's log (`facts-1-2-rerun.log`) |
| **2. `examples` is refused by name today, at every depth, and `findings` never reads it** | `schemaProblem` refuses `examples` at the top level, inside `properties` and inside `items`, each naming the keyword and the path; `findings({ type: 'string' }, 'ok')` is `[]` under a schema that would carry a contradicting example — the ignored-keyword road, seen from this item's side (`decl-examples-refused.log`). So the plan's "measured" is re-taken rather than inherited, and it is the control for this item's first rule-8 probe |
| **3. The price of the OPTIONAL road: fact 5's witness is `{}` for thirteen of the fourteen input schemas** | the corpus workers read a field if it is there and default if not, so thirteen input schemas require nothing and their witness is `{}`; `prompt`'s requires `text` and its witness is `{"text":""}`. Run on it, **every described worker's output conforms, exactly as on the declared example**, so a check on the witness catches fact 6's shape. **What it does not exercise: 5 of 12 described workers reach FEWER output paths on the witness** — `publish`'s `joinPayload` collection, `split`'s `items[]` and both keys inside it, `weigh`'s and `attest`'s `keys[]`, `echo`'s echoed `input.a` — so an output schema's `items` sub-schema is never applied on the witness for the three workers that have one (`split`, `weigh`, `attest`). *A witness proves the schema is satisfiable; a declared example is what exercises it* — fact 5's own sentence, with a number. *(This row read "twelve of twelve", "11 of 12", "5 of 11" and "the two workers": the declaration measured `dev-dist/p19/schemas.mjs`, whose `prompt` schema requires nothing, on a harness with no retry — and did not re-take the number on the document the item then WROTE, which carries `required: ["text"]` from P18's sample. Section 1 rule 5's WHEN clause, caught by the conformity reader; re-taken in `coverage-shipped.log`.)* |
| **4. The price of the REQUIRED road: six declaration sites today, zero in any executed snippet** | `inputSchema`/`outputSchema` are declared at **6** sites outside `doc/`: three in `examples/registry.json` (`prompt` two, `fetch` one), three in `test/definition/registry.test.ts`'s `SAMPLE` — which is *"P18's minimum sample, verbatim from the plan"*, so requiring an example there makes a plan's sample and its copy disagree (Q292's shape). **No `AGENTS.md` or `README.md` snippet declares either schema** (grep: the four doc sites carry `settingsSchema` only), so `check:docs`'s X4 is unmoved under either road. Required on ALL FOUR kinds would reach **41** sites — the counting rule, which this row omitted until the conformity reader asked for it: lines outside `doc/`, `dev-dist/`, `dist/` and `node_modules/` matching `(configSchema\|settingsSchema\|inputSchema\|outputSchema)\s*:` in `.json`, `.ts`, `.md` and `.mjs` files, summed per file — including three built-in group-type schemas in `src/definition/registry.ts`, `spec/examples/registry.json`, four executed doc snippets and ~20 test fixtures; priced and not proposed |
| **5. A worker whose FIRST attempt throws by design has no return value to validate** | `retry.ts` throws on the first call for any task id (`thrownOnce`), so one call yields nothing to check — on the declared example and on the witness alike; `fail.ts` throws on every call and `uncloneable.ts` returns a function, so those two have no output schema (fact 1). Stated assumption 1 says what the check does with a throw |
| **6. A corpus worker MUTATES the value it is handed, so the check must hand a COPY** | `tally.ts` writes `seen` back into its input (`examples/README.md`'s *one MUTATES what it was handed*); in `decl-fallback.mjs` the witness printed `{"seen":1}` for a generator that returned `{}` — the log line was read off the object AFTER the run. A check that hands a registry document's own parsed example to a worker would ship a document mutated in memory; the check clones every example before it runs a worker, and a probe deletes the clone |

**And one thing the plan's seeded exceptions did not know**: ladder L6 carries a clause comparing
four workers' declared schema kinds to a literal (`examples/l6.ts:6382`, W67's `ra6`), so this
item MOVES L6 where the plan's W72 row put L6 outside its gate. Declared above; the plan's row is
corrected at the record step, not here.

## Stop and ask 1 — REQUIRED, or optional with the generator's witness as fallback

**Put to the maintainer 2026-09-18 with both roads priced from facts 3 and 4. Answer, the same day: OPTIONAL** — *"Agree with optional"*. Recorded here before ADR 0056 was drafted; the rule is written from it: an absent `examples` refuses nothing, a present one is held to its schema, `examples: []` is refused, and the check runs a worker with no input example on the generator's witness and says so in its verdict. *(This sentence shipped with its two code spans stripped — an inline `node -e` edit whose backticks the shell consumed, CLAUDE.md's own warning; the conformity reader.)*

| | REQUIRED — every declared `inputSchema` and `outputSchema` carries a non-empty `examples` | OPTIONAL — absent means the check runs the worker on fact 5's witness and the verdict says so |
|---|---|---|
| what it refuses | a worker entry declaring either schema with no example: `SchemaRefused` at construction, naming the entry and the field | nothing for absence; only `examples` present and malformed, or an example that refutes its schema |
| the corpus today | 6 sites gain examples — 3 this item writes anyway, 3 in P18's verbatim `SAMPLE` in `registry.test.ts`, which then no longer matches the plan's text | the same 24 examples this item writes; the `SAMPLE` untouched |
| a consumer | a registry with a schema and no example is refused the day it is written — fact 6's lesson made a rule: the schema without its example was the lie | a registry with a schema and no example resolves; its author gets `conforms on the generator's witness {}` and, in 5 of 12 corpus shapes, an output schema whose inner `items` was never applied *(5 of 11 when this row was written from the declaration harness; re-taken on the shipped document — fact 3)* |
| the check | total over the registry with ONE verdict kind, no generator, 28 lines fewer, every run on an author's value | total with TWO verdict kinds (`declared example` / `witness`), the generator shipping inside the check, and the witness printed beside every verdict it produced |
| W73 and W74 | run transforms and the diff loop on a declared example, always | must carry the same fallback — a witness `{}` through `$.items[0]` is `undefined`, so the transformed-edge verdict and the loop both inherit a weaker road |
| the plan's lean | — | **this one** (decision 3, stop-and-ask 1) |

**The author's reading, offered and not decided**: the measured difference is fact 3's five
workers, and it compounds through two more items; REQUIRED on the two schemas the plan's checks
RUN costs six edits today and no executed snippet. Optional keeps a document writable without an
example, which is the plan's stated reason and is a real one. Either way `examples: []` is refused
(a declared-and-empty list is the silent kind, `enum`'s reason), and the verdict names the value
it ran on.

## Stated assumptions, each overridable by the answer above

1. **A worker that THROWS on its example is a `threw` verdict, red, with the message — after one
   retry on the same task id.** The check runs a worker the way a scheduler with a one-retry
   budget would: a second attempt on the same `taskId`, and a verdict of `conforms on attempt 2 —
   the first threw: <message>` when the retry returns a value. `retry.ts` is the live case; without
   the retry the corpus is red at birth on a worker whose contract is to fail once. A worker that
   throws twice is red.
2. **The two undescribable workers declare an `inputSchema` and NO `outputSchema`, and the check
   reports `outputSchema absent — not checked` naming them.** A worker entry has five keys
   (`WORKER_KEYS`, refused otherwise) and ADR 0053 refuses annotation keywords, so the reason lives
   in each module's header comment and in this file, not in the document. The alternative — a
   note key on the entry — is a sixth key nothing else reads.
3. **The witness generator, if the optional road is chosen, lives in the check script** and not in
   `src/` — the plan scopes the assists to W74; W74's `assist.ts` lifts it. Under the required
   road it ships nowhere in this item.
4. **An example that refutes its schema is `SchemaRefused`** — the existing class, with the path
   `$.examples[i]` and the finding — and not a twelfth `RegistryError`. The spec's class table and
   `registry.test.ts`'s both-ways comparison of it stay as they are; the message says which kind
   of schema defect it was.
5. **The check constructs a worker from `configSchema.examples[0]` (or `{}`), hands it
   `{ settings: settingsSchema.examples[0] ?? {}, input: inputSchema.examples[0] }`, one context
   with a minted task id, and validates the return value against `outputSchema`** — the worker's
   own declarations and nothing from `nodeTypes`, so the contract is the worker's alone.

## Verification

- `eval "$(fnm env --shell bash)" && fnm use 24` first, every shell; `node -v` asserted 24.
- Every rung RUN and redirected to `dev-dist/w72/<rung>.log; echo EXIT=$?` — never piped.
- L0: `npm run lint`, `npm run typecheck`. L1-L5: `npm test`, `npm run test:deno`,
  `npm run test:browser:all` (five runtimes). L6: `npm run test:l6`, `npm run test:l6:deno`.
- The checks: `npm run check:workers` twice — once against fact 6's schema (red, the checked-in
  probe), once against the corrected registry (green) — then `check:workers:selftest`,
  `check:source`, `check:wiring`, `check:spec`, `check:docs`, `check:markdown`.
- Rule 8: `dev-dist/w72/rule8.mjs` on W71's harness shape — a control, byte-asserted restores,
  per-edit anchors on text read from the source, an abort that undoes what it applied, a content
  digest over every tracked and untracked-unignored file at both ends, Node 24 asserted, every
  declared ceiling RUN against the rung its reason names.
- Then the two reader passes (conformity re-derives on paper first; adequacy in an isolated copy
  with `node_modules` COPIED and links scanned before removal, a control run green first), rule 8
  re-run with their exact edits as probes, the confirming gate with the tree held still, the
  Record — and the grep of the tree for `W72` before recording.
- Routing coverage: not applicable — this item touches no routing.

## Record

**Built and gated 2026-09-18 on `2fe4bdb`'s tree.** Every rung RUN and redirected to `dev-dist/w72/`, read by `$?`; Node 24.20.0 asserted in every shell. Expected values from the documents — the twelve output schemas verbatim from `dev-dist/p19/schemas.mjs`, the input examples from the declaration harness's inputs, written before any worker ran.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured, six facts, **and the plan's seeded exceptions were wrong in both directions** | three seams the plan did not seed (`package.json`, `check-source.mjs`'s `GATE_CHAIN`, `examples/l6.ts`'s carried-schemas clause — L6 MOVES where the plan's row put it outside this item's gate) and two seeded that do not fire (`check-spec`, `check-docs`); `AGENTS.md`'s seed named a keyword list stated nowhere. Stop-and-ask 1 answered OPTIONAL |
| stop-and-ask 1 | RAN — answered *optional* the same day, recorded before the ADR was drafted | priced from facts 3 and 4: the witness reaches fewer output paths than the declared example in five of twelve described workers; required costs six edits and no executed snippet |
| L0 | **GREEN** | `lint` 0 over 99 files, `typecheck` 0 in all five configurations |
| L1-L5 | **GREEN — 41 files / 1119 cases in five runtimes** (from 1112) | the ADR 0056 suite (five tests, six after the adequacy reader's rule-2-over-every-keyword case), the registry test's example refusals through BOTH callers (`resolveRegistry` and `checkRegistry`); the keyword list bound both ways at thirteen. *(The browser rung was run at 1118 before the last test landed and is re-taken in the confirming gate.)* |
| `check:workers` | **GREEN — 14 workers in 0.2 s: 14 on their declared example, 12 confirmed on a run, 2 NOT CHECKED by name, 0 refused** | `retry` conforms on attempt 2 with the first throw quoted; `fail` NOT CHECKED, threw on both attempts; `uncloneable` NOT CHECKED, returned an object holding a function. **K1 is the driver's own `checkRegistry` over one entry**, since the adequacy reader found the first cut let through an undeclared key `createRuntime` refuses |
| `check:workers` RED on fact 6 | **RED, the checked-in probe `o1`** — `K2: worker "echo": … $.arrays expected array, got number` | the plan's gate line, verbatim: red on the wrong schema, green on the corrected one |
| `check:workers:selftest` | **GREEN — 24 probes / 9 gradings in ~38 s**, the first probe P19 fact 6 verbatim, two gradings declared `corpus`, five scratch worker modules for the cases the corpus cannot supply | it found a defect in the check on its first run: with the retry removed the loop fell through and validated `undefined` under K2 — the right verdict for the wrong reason (Q138's shape) — closed by throwing the last error. After the readers: the control holds the shipped document to the NOT CHECKED lines, the retry attempt and the header tally, and runs the check ONCE with every override stripped (W39's `G5` one check over) |
| the seven other checks | **GREEN** | `check:source` (S11/S12 over the two new entries and the chain), `check:wiring` (G1-G5 over the eighth dispatch), `check:spec` (C4 UNMOVED at 34, C8 over v0.20), `check:docs` 32 / 26 unmoved, `check:markdown`, `check:policies`, `check:scheduler`; `check:source:selftest` 65 / 65 with the chain moved; `check:wiring:selftest` red by name when the eighth check leaves its `CHECKS` (`c3`) |
| L6 | **GREEN — 1611 assertions over 53 runs in BOTH runtimes**, from 1610 / 53 | the carried-schemas clause rewritten from four entries to the rule's enumeration over fourteen (net zero), and one clause ADDED — every schema the corpus declares carries an `examples`, the corpus's own obligation where the library leaves it optional — both named in `CROSS_ROW_SUBJECTS`; `CROSS_ROW` 133 → 134, `DECLARED_TOTAL` 1610 → 1611 |
| rule 8, author pass | **49 probes: 1 control green, 40 caught, 7 declared ceilings each RUN against the rung its reason names, 1 measured, 0 undeclared standing, 0 crashes standing, 0 aborts, 0 against declaration** (`rule8-run1.log`, `-run1b.log`, `-run1c.log`), digest `d5585dab19e8760c` over 342 files at both ends of every pass | the first pass read ONE undeclared survivor and ONE crash, both the harness's own: `d7` claimed to delete a clause and deleted its subject alone (re-cut as `d7a` caught, `d7b`/`d7c` declared — Q217's limit); `r2f` at L1 is a CRASH because `l4-corpus.test.ts` resolves the corpus registry at MODULE SCOPE, so a refused registry takes the runner down with zero FAIL lines (Q272's shape, recorded as `r2f-l1` MEASURED; L6 catches the same edit by name). *A crash is not a detection*, and the harness now says MEASURED of one it was asked to record |
| readers | **BOTH RAN 2026-09-18 — 11 / 3 blocking and 71 mutations / 40 survivors / 28 real / 3 blocking, OVERLAP 1, the FORTY-FOURTH measurement** | **The conformity reader's central obligation came back EMPTY on the mechanism, for the fourth pass running**: it re-derived on paper what ADR 0056's three rules require of `schemaProblem` and `findings` at every depth and shape, and what all fourteen workers RETURN field by field from their code and declared examples, before reading a line of the check's output — zero disagreements on either. **What it found was in the DECLARATIONS**: two of the twelve "honest" output schemas carry bounds the worker's code does not keep over the input domain its input schema admits (`split`'s per-item `confidence` is `word.length / 10`, so an eleven-letter word exceeds `maximum: 1`; `weigh`'s `score` is a product over a `run.confidence` its input schema left unbounded) — and `check-workers` on ONE example cannot see either, fact 6 in a second direction, [Q302](../open-questions.md), both corrected in the corpus; the item's fact 3 read *"`{}` for twelve of twelve"* off the DECLARATION harness where the shipped `prompt` schema requires `text` (re-taken on the shipped document: thirteen of fourteen, five of twelve); an UNDECLARED edit, `scripts/check-wiring-selftest.mjs`, found by its `git status` audit; and eight stale sentences (*seven checks*, *P19's strict mode*, *the two workers that have one*, this file's own exceptions table saying L6 moved by one clause where a second was added). **The adequacy reader found the check's VERDICT was decoration** — both NOT CHECKED arms rewritten to `conforms`, the header tally zeroed and the retry wording flattened cost 0 (B1); a check exiting 0 having run NOTHING whenever `CHECK_WORKERS_REGISTRY` was unset was green at every rung, W39's `G5` one check over (B2); *constructed from its config example, handed its settings example* was bound by nothing, four of the twenty-four examples reaching no verdict (B3) — and rule 2 was fixtured against five of the twelve constraining keywords (R1), `checkRegistry`'s shape half accepted a refuting example (R2 — and a refuting example in the L4 corpus CRASHES the L1 runner at load, Q272's shape, `q-j1`), K1 over the config and settings schemas had no probe (R3), the deadline's own message was unbound (R4), and an undeclared entry key passed the check that `createRuntime` refuses (R7). **Every blocking finding is closed and every real one acted on**: K1 is the DRIVER's `checkRegistry` over one entry rather than a copy of half of it; a scratch `configEcho` worker returns its config, settings and input and then MUTATES all three, so the copies and the examples are a `const`-pinned verdict; the self-test's control holds the shipped document to the NOT CHECKED lines, the retry attempt and the header tally, and runs the check once with every override stripped; rule 2 is fixtured over all twelve keywords, both nesting shapes, a third example and the order against a malformed bound; `checkRegistry` gains its own refusal test. Self-test 16 / 9 → **24 / 9**; L1-L5 1118 → **1119**. **The one overlap** is the check's `setup()`/`teardown()` handling, reached from opposite ends: the conformity reader read a throw there reported as *"threw on both attempts … first: null"*, the adequacy reader deleted the deadline over it for zero — one subject, two defects, closed with a scratch module each |
| rule 8, RE-RUN with the readers' thirty edits | **79 probes: 1 control green, 67 caught, 9 declared ceilings each RUN against the rung its reason names, 2 measured (both the L1 runner's crash at load on a refused corpus registry — Q272), 0 UNDECLARED survivors, 0 crashes standing, 0 against declaration; 4 aborts on the run, every one rule 7 (b) on an anchor this item's own later edits had moved, re-anchored and then 3 caught, 1 declared** (`rule8-run2.log`, `-run2b.log`); digest `2037acdd17ed4d81` over 342 files identical at both ends of both passes | **Every blocking finding both readers made now FIRES**: the NOT CHECKED arms (`q-e10`, `q-e10b`), the header tally (`q-e20`), the check running nothing with no override set (`q-g4`), the config and settings examples ignored (`q-e22`, `q-e21b`), un-copied config and settings (`q-e1`, `q-e2b`), the deadline off `setup()` (`q-e5`), `undefined` reported conforming (`q-e7b`), the no-schema road (`q-e25`), the absolute-URL branch (`q-e9`), K1 re-implemented as the schema half (`q-i8`), `checkRegistry` stripping examples (`q-c1`), and rule 2 over `type` lists, `const`, a third example, `additionalProperties`, `maxLength`/`minItems`, a parent's `items`, `maximum` and the order against a malformed bound (`q-b*`). The conformity reader's two bounds (`c1`, `c2`) are caught with the example that reaches them and DECLARED without it (`c1b`, `c2b` — Q302); the undeclared edit reverted is caught by the wiring self-test's own manifest comparison (`c3`) |
| `npm run gate`, CONFIRMING (after the readers, the re-run and the record step) | **GATE EXIT=0, zero lines beginning FAIL at any indent, 16 chain entries, `selftests` 8/8 completed and 8 ok in 959.2 s over 6 lanes** (`dev-dist/w72/gate-final.log`): L0 green; `check:workers` 14 workers, 12 confirmed, 2 NOT CHECKED; `check:workers:selftest` **24 / 9**; `check:docs` 32 / 26 unmoved; `check:spec` C4 at 34; `check:markdown` **130 / 5549 / 272**; L1-L5 **41 / 1119** in node, deno and chromium (firefox and webkit at 1118 before the last test, in `browser-all.log`); L6 **1611 / 53 in both runtimes**; census **235 / 181 / 2 / 52**, 235 of 235 in one cluster cell, 0 aborts | digest **`0219149a3127bff7` over 342 files, IDENTICAL before and after**, no edit made while it ran. **Two prose edits follow it and are named**: this row, and `README.md`'s command-table row for this check, whose self-test figures the readers had moved from 16 probes to 24 — a count re-taken on the tree that ships, one row this gate's `X8` does not read. **And this is the SECOND confirming gate**: the first (`gate.log`) was `GATE EXIT=1` on ONE line with every other rung green — `check:spec:selftest`'s probe for `C4`'s own-paragraph clause, anchored on v0.19's sentence and made vacuous by this item's v0.20 one (exceptions, *What broke* 10) — re-anchored agnostically and the gate re-run whole |

**Outputs.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `examples`, the thirteenth keyword, an annotation with three rules | `src/definition/schema.ts` | L1 (`r1a`, `r2a`-`r2g`, `r3a`, `q-b*`): the spec's table both ways, every keyword, every depth, the empty list, the order, the index |
| (2) fourteen corpus workers with `inputSchema`, `outputSchema` and examples | `examples/registry.json` | `check:workers` on fact 6's schema (`o1`); L6's two clauses (`o2b`, `d5`, `d6`, `d7a`) |
| (3) `scripts/check-workers.mjs`, a gate entry | the file, `package.json`, `GATE_CHAIN` | `check:source` S11/S12 and `check:wiring` G1-G3 (`o3`, `e1`-`e4`, `e7`), and its self-test's no-override control (`q-g4`) |
| (4) its self-test with fact 6 first | `scripts/check-workers-selftest.mjs` | itself, and rule 8's `k1`, `k4`, `k5`, `k8`, `k9`, `p1`-`p4`, `d1`, `d3`, `d4`, `e5`, `e6`, `c4`, `q-*` |
| (5) the L4 corpus registry's example | `spec/examples/registry.json` | L1 (`o5`, the node-type test's literal) — and a REFUTING one crashes the L1 runner at load (`q-j1`, measured) |

**What broke.** (1) A backtick inside a template literal in the new test suite — `ERR_INVALID_TYPESCRIPT_SYNTAX` at L1 before any test ran; the repository's own convention (a backtick-quoted apostrophe in single-quoted strings) copied into the one string kind it breaks. (2) The check counted `fail` under K3 for throwing, where assumption 2 says a worker with no output schema is NOT CHECKED whatever it does — corrected before the first green run. (3) The self-test's retry-removal mutant reported K2 where K3 was declared, because the loop fell through with `out` undefined: a defect in the check, found by its own self-test on the first run. (4) L6's two new clauses compared an alphabetical literal to a document-ordered object and `check` compares serialisations. (5) A typecheck cast on `REGISTRY_DOCUMENT.workers`. (6) `check-wiring-selftest.mjs`'s `CHECKS` literal occurs twice — once as the declaration and once inside a SELF entry's anchor — and one edit hit both. (7) Two inline `node -e` scripts carrying backticks were mangled by the shell; one wrote nothing and one stripped two code spans out of this file's own stop-and-ask paragraph — CLAUDE.md's warning, reproduced twice, and the second found by the conformity reader. (8) `checkRegistry` on the whole sample sees a pool naming a CLASS type the document does not declare, so the new test hands it the workers section alone. (9) The scratch `configEcho` worker returned its input by reference and then mutated it, and its own `const` pin caught it. (10) **The first confirming gate was RED on one line with every rung green** — `check:spec:selftest`'s probe for `C4`'s own-paragraph clause, anchored on v0.19's *"So this document now holds **34 refusals**"*, edited that sentence while the clause read this item's v0.20 sentence as the last occurrence: the probe went vacuous on the next version's edit, which is the seeded `check-spec` exception firing for a reason the seed did not give, and the gate was re-run whole after the anchor was made agnostic.

**What this taught.** **A schema and its example agreeing proves the schema is self-consistent — and a worker RUN on that example confirms the schema at ONE value.** P19 fact 6 was the first half; W72's conformity reader supplied the second by deriving from the workers' code: two bounds right at the example and wrong past it, invisible to the check by construction, which is Q302 and W74's sample loop's subject. **A verdict nobody reads is decoration**: the adequacy reader rewrote both NOT CHECKED lines to `conforms` and zeroed the tally for zero, and the check's `setup()` arm, its no-override configuration and four of its twenty-four examples were each bound by nothing until a scratch module or a control line made them a verdict — W39's `G5` shape on the first check written after that retro. **The plan's seeded exception table missed three seams a new CHECK always reaches** (the manifest, `GATE_CHAIN`, and L6's carried-schemas literal) and named two that do not fire — a table seeded from three reference items predicts a reference item. **Two of P19's predictions have a verdict from this item**: prediction 1 (the subset holds for every schema this plan writes) HOLDS over the fourteen input schemas, twelve output schemas and their examples, no extension past `examples` needed; prediction 4 (the conformance check catches the NEXT wrong schema) was tested on schemas written by the same author as fact 6's and found none — and then the reader found two by a road the check cannot take, which is the prediction's own reversal condition read narrowly and confirms it in the direction that matters. `doc/workflow.md` changes: none proposed.

**Questions raised.** [Q300](../open-questions.md) (the L4 corpus's `corpus://` workers can be run by nothing, so the two corpora disagree about what a schema can be checked against — W73's), [Q301](../open-questions.md) (a witness-based verdict downstream must carry the word or be a distinct kind — W73's), [Q302](../open-questions.md) (one example confirms a schema at one value; a bound the code does not keep past it is invisible — W74's). Q303-Q304 reserved and unused.
