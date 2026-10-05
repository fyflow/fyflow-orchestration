# W74 — The assists, and the exit artifact: an authoring session a human can watch

**Status:** **DONE** 2026-09-18, committed 2026-09-19 00:17 — built, gated, both reader passes run the same day, rule 8 re-run with their twenty-three exact edits as probes, the confirming gate green with the tree held still (the Record). *(The date read **2026-09-18** alone here, in this file's Record and in three index paragraphs, and the item's work WAS the 18th — but its second confirming gate finished at **00:10 on the 19th** (`dev-dist/w74/gate-final2.log`) and `cf6d821` is dated **00:17**. The only item of nineteen plans to cross midnight; corrected by P19's retro under `doc/workflow.md` section 6 pass 3 rule 6, because *a claim states the scope it was MEASURED at* and the day is one.)* Declared 2026-09-18 on `af7b1db`'s tree (digest `d70ada3c2a0e4d43` over 353 files,
Node 24.20.0), its declaration-step facts measured before anything is built and the tree held still
throughout — the digest is identical at both ends of the declaration step. **The three stop-and-asks
below were put to the maintainer before a line was built and ANSWERED the same day, each as
recommended**: a ROOT export beside `checkWiring`; the 32-line generator with its emitted file
checked in; the session's own two workers under `examples/getting-started/`, executed by
`check:docs`. Each answer is recorded in its own section.
**Plan:** [P19](../plans/p19-what-a-schema-buys-an-author.md) — decisions 1, 7 and 9,
facts 4 and 5, predictions 3 and 4, [Q282](../questions/q282.md) and [Q302](../questions/q302.md);
the plan's THIRD and LAST item, serial after
[W72](w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md) and
[W73](w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md).

```
Spec:       NONE — and that is a claim rather than an omission. `spec/` is UNMOVED at 7 documents /
            61 examples / 107 rules with C4 at 34, measured. **The CRITERION first written here was
            wrong and its conclusion survived** (the conformity reader, finding 11): it read *every
            assist is a READING; none refuses anything, none changes what a node receives, none is
            reachable from a run* — all three clauses measured TRUE of `assist.ts`, and all three
            true of `checkWiring` as well, which IS in the spec, in a subsection named for these
            very functions. So the criterion would have kept W73's check out too. **What separates
            them is whether a second implementation would need the text**: `checkWiring`'s relation
            is a DECISION about what fits what, with clauses a conformity reader must read the
            module against, and W73 put its two tables there for exactly that reason; `pathsOf` is a
            convenience walk over a subset the spec already enumerates, `tryTransform` is a
            substitution over a relation that document already specifies, and `signatureOf` is a
            recipe whose output no run and no other implementation reads. Nothing here is a rule
            somebody else would have to re-derive. ADR 0057 is reserved by the plan and NOT TAKEN;
            stop-and-ask 2 was the one road that could have needed it and the maintainer's answer
            keeps decision 9's substance.
Owns:       src/definition/assist.ts (new), AGENTS.md (a new section, and section 13's schema
            paragraphs), README.md (the third snippet, held by X8), examples/getting-started/**,
            test/definition/** — the plan's W74 row, verbatim
Inputs:     P19 decision 7 (the loop is SAMPLE-BASED; a type-level JSONata interpreter stays
            refused), decision 9 (a generated signature is a RECIPE and types catch the SHAPE and
            not the constraints), fact 4 (json-schema-to-typescript 15.0.4 over the subset — RE-RUN
            here on the SHIPPED document rather than transcribed, because the plan measured twelve
            output schemas and W72 and W73 changed the corpus; fact D below) and fact 5 (the
            witness, now `src/definition/witness.ts`); W73's `checkWiring`, its five shapes and
            five verdicts, its per-item evaluation rule (its adequacy reader's R7 — the case this
            item's loop meets first) and its `WiringSample`; ADR 0056 rule 3 (the first declared
            example is the sample, optional, witness as fallback); ADR 0053 rule 5 (a schema is
            read only after `schemaProblem` has passed it — fact A is where that order BREAKS for
            an assist); Q302 (one example confirms a schema at one value), Q305 (the relation's
            named leniency), Q306 (the record's shape is the check's knowledge and no author can
            declare it)
Outputs:    (1) PATH ENUMERATION from a schema — `pathsOf(schema)` in src/definition/assist.ts:
                every path a value of the schema may carry, with what the schema says of it, so an
                author writing a transform can see what there is to reach for. TOTAL over the
                subset AND over the two shapes the subset REFUSES that `checkWiring` derives
                (fact A)
            (2) the SAMPLE-AND-DIFF LOOP — one candidate expression on one node, the verdict and
                the findings, prototyped at this declaration as a thin substitution over
                `checkWiring` (fact B) rather than as a second evaluator, so it inherits every rule
                W73 measured including the per-item road. Its home is stop-and-ask (a)
            (3) the GENERATED-SIGNATURE recipe (P19 decision 9) — its road is stop-and-ask (b),
                with both priced on this tree in fact D
            (4) the AUTHORING SESSION as an EXECUTED reference section and the reference's
                front-door claim — an agent handed a registry writes a flow with a miswire and a
                transform, the checks catch the first and the loop writes the second, the worker
                typechecks; prototyped end to end at this declaration and it RUNS in 20 ms
                (fact E). Its home is stop-and-ask (c)
            (5) README.md's THIRD snippet, byte-equal to (4)'s under `X8`, both ways
Depends on: W73 (the relation, the shapes, the witness, the sample); W72 (the schemas and the
            examples every assist reads)
Blocks:     nothing — the plan's last item. W75 is reserved and expected unused
Tests:      expected values from the DOCUMENTS — the subset's thirteen keywords from
            `SCHEMA_KEYWORDS` and `spec/flow-definition.md` section 3's table, the five verdicts
            and five shapes from `VERDICT_KINDS` and `WIRING_SHAPES`, the wiring fixture corpus's
            recorded verdicts from section 7 — never from output. **The loop's evidence is a
            DISCRIMINATING PAIR and fact C is why it cannot be taken from the L6 corpus**: `echo`'s
            `inputSchema` is `{"examples":[{"a":1}]}` and refuses 0 of 9 probe values, so a TYPO in
            the shipped `transformed` flow's transform still reads `transform-passes` — measured
            (fact B, case 1)
Gate:       L0; L1-L5 in five runtimes (path enumeration over every schema of the three corpora
            and over the constructed shapes of fact A, including the two the subset REFUSES; the
            loop's discriminating pair from ONE expression edit, in both directions; the recipe's
            output held to something a typechecker reads); `check:docs` executing the session end
            to end with `X8` holding README's copy BOTH WAYS; **L6 UNMOVED at 1627 / 53 in both
            runtimes** — an assist is not a dispatch and this item adds no row; `check:spec`
            UNMOVED (7 / 61 / 107, C4 at 34); `check:markdown` with Q142's window MEASURED before
            the record step (fact F) rather than found by the gate; `check:workers` unmoved;
            `check:source` and `check:wiring` over whatever stop-and-ask (a) adds; rule 8
            obligation (a) over the enumeration's own values (each of the thirteen keywords, each
            shape it walks) and (b) over every Outputs row, (c) over the sample's provenance (which
            schema each path was read FROM, which value the loop RAN on), (d) over the enumeration
            loop's bounds and over the README/AGENTS pairing list, (e) over the session's wiring —
            what happens when the snippet is not RUN, and is what it ran what SHIPS; then both
            reader passes and rule 8's re-run with their exact edits as probes; the confirming gate
            with the tree held still; the grep of the tree for `W74` before recording, the census
            re-derived with `dev-dist/p15/census.mjs` and every new row placed in a cluster cell
Reserves:   Q310-Q314 (Q308-Q309 were W73's, reserved and unused, so they are SKIPPED — W73's own
            precedent for W72's Q303-Q304, and section 3's *ids are never reused*); ADR 0057
            reserved by the plan and expected UNUSED
```

## Exceptions

Seeded from the plan's W74 rows AND from the seams W73 found unseeded, then **MEASURED at this
declaration** — which changed the table in both directions, as W72's and W73's did, and for the same
reason: the plan's table predicts a reference item and this one is a reference item that also ships a
module.

| path | seeded? | why |
|---|---|---|
| `scripts/check-docs.mjs` and its self-test | seeded — **TRUE, and it is THREE literals rather than one** | measured: `RUN_FLOOR` is **26** and the check reports **26 run snippets**, so the session's snippet takes it to 27 (the comment says *raise it when the reference gains a snippet*); `README_SNIPPETS` is a two-entry literal and gains a third; `README_SNIPPET_FLOOR` is **2** and goes to 3 — [Q217](../questions/q217.md)'s shape, *a member and its name are two edits in one diff, and the floor is the third*, stated in `X8`'s own header. The self-test's ten `X8` probes anchor on README text (`## The idea`, `## Getting started`) and on `AGENTS.md` comment lines, all of which survive a third section — **predicted unmoved, to be measured at the build** (rule 7 (b)) |
| `scripts/check-markdown.mjs` | seeded — **PREDICTED UNNEEDED, and MEASURED (fact F)** | Q142's window today is `M3 = 107` in `(99, 131]` and `M4 = 4450` in `(4132, 5617]`. This item adds **ONE** markdown file (this one) outside `doc/decisions` and `doc/plans`, so the M3 fixture goes 99 → 100 against a floor of 107 — **seven files of margin left**. `M4`'s lower bound has **318 links** of margin and W73's whole-tree increment was 68. **Re-measured before the record step, which is where the six index paragraphs land** |
| `README.md` | **Owned** — not an exception | the plan's W74 row names it (the third snippet). Also a record-step file |
| `examples/README.md` | **no — measured here** | its `getting-started/` paragraph says **seven workers** and enumerates them by name, and names the AGENTS sections that execute them (*2, 5, 7, 9, 10 and 12*). This item adds at least two worker modules and one section, so both counts are false the moment it ships — W71's and W72's late exception on the same paragraph, predicted this time |
| `index.ts` | **no — conditional on stop-and-ask (a)** | the root re-exports `src/definition/*` module by module and a new module is exported by nothing until named — W73's row verbatim, and W47's finding: the direction that lets a function exist and be unreachable |
| `deno.json` | **no — conditional on stop-and-ask (a)** | every new published module reaches the JSR allowlist (`!src/definition/assist.ts`). W73 took this LATE and undeclared until `S6` fired; seeded here for that reason |
| `package.json` | **no — conditional on stop-and-ask (a) road B only** | a SUB-PATH is twelve lines of `exports` in this manifest, three in `deno.json`, a third rewrite in `check-docs.mjs`'s extractor and an `S14`-shaped clause. Priced in stop-and-ask (a) and NOT recommended |
| `AGENTS.md` §1, §2 and §9 | **no — measured here** | §1 is *the reference's front-door claim* (the plan's W74 row) and today says nothing about what a schema buys; §2's *What to read next* names sections 3, 12 and 13 and not the new one; **§9's executed error-class snippet compares the root's `Error` subclasses to a literal BOTH WAYS and throws for a new one** — so it fires only if an assist adds a refusal class, and the assists REPORT rather than refuse, so it is predicted unmoved and measured at the build |
| `examples/l6.ts`, `examples/run-flow.ts` | **predicted UNNEEDED, measured** | `l6.ts` lists `examples/workers/` on disk and compares it to the L6 registry both ways; `examples/getting-started/**` is deliberately outside that directory for exactly this reason (`examples/README.md`, W69). **Grep: neither file mentions `getting-started`.** L6 stays at 1627 / 53 |
| `scripts/build-browser-tests.mjs` | **predicted UNNEEDED — and LATE, measured wrong** | the prediction reasoned about FIXTURE DOCUMENTS and this item adds none. What it missed is that the generated-file test READS A FILE, and `examples/getting-started/session-types.ts` is under neither walked tree — so the browser rungs were RED on that one test at 44 / 1220 while node and deno were green, the FOURTH time a suite reading a file outside `spec/examples/` has done that (W32's, W33's, W54's). It is now the list's first `.ts` entry. *The exception was predicted from the SHAPE of what the item adds and the seam is about what a suite READS* |
| `test/definition/l4-corpus.test.ts` | Owned — recorded | the suite census (Q158's closure) fired on the first run naming all three new suites, and a fourth after the readers' fix; `test/definition/**` is in this item's `Owns`, so it is a ratchet rather than an exception |
| `scripts/check-spec.mjs`, `scripts/check-workers.mjs`, `scripts/check-source.mjs` | **predicted UNNEEDED** | no `FD-V` and no rule id is added (the `Spec:` line), no worker's schemas move, and no gate entry is added under the recommended road of stop-and-ask (c). `C4`'s known hazard (it reads the LAST `**N refusals**` sentence) is inert while `spec/flow-definition.md` is untouched |
| `src/definition/witness.ts` | **LATE — undeclared until the conformity reader's finding 6** | W73's file, carrying *"and W74's assist imports it too"* — a prediction written by the item BEFORE the one that expired it, and false: `assist.ts` reaches the witness TRANSITIVELY through `checkWiring`, which is what keeps ONE sampling rule. Found by this item's grep of the tree for its own id (v0.15 change 3). `scripts/check-workers.mjs` carries the same sentence in a form that survives on the transitive reading and is NOT edited; `doc/decisions/0056-*` carries it too and is a record-step file |
| `scripts/check-docs-selftest.mjs` | seeded (*and its self-test*) — **fired for a reason the seed did not give** | the row predicted the ten `X8` probes unmoved and the probe that moved is an `X1` one — `also: ['X8']`, one line, the fix its two neighbours already carry |
| `src/` (rule 8 only) | — | probes mutate `assist.ts`, the session's worker modules and the fixtures to measure what the suites observe |

## Scope

**In**

1. Path enumeration from a schema (Outputs 1), total over the subset and over the two shapes the
   subset refuses that `checkWiring` derives.
2. The sample-and-diff loop (Outputs 2), with a discriminating pair from ONE expression edit.
3. The generated-signature recipe (Outputs 3), on the road stop-and-ask (b) chooses.
4. The authoring session (Outputs 4) and README's third snippet (Outputs 5).

**Out** — named, with where each goes

- **Per-settlement validation of a worker's result** — *slices beyond*, OUT of the plan as a default.
- **A type-level JSONata interpreter** — refused (P19 decision 7). Every verdict the loop reports is
  a fact about a SAMPLE and says so, which is W73's rule and this item does not weaken it.
- **Extending the subset** — prediction 1 has held through two items and this one writes schemas
  only for the session's own workers. `oneOf` arrives as a measured need or not at all.
- **Closing [Q302](../questions/q302.md)** — *a generated input at the schema's BOUNDS rather than
  its floor* is what that row says would close it, and it is a second generator beside `witness.ts`.
  Named here as the obvious next thing and NOT taken: it is a second source for the same fact
  (obligation (c)'s LIMIT) and belongs with the plan's *slices beyond* measurement.
- **Closing [Q305](../questions/q305.md) or [Q306](../questions/q306.md)** — both are the relation's
  and the subset's, and both are named in what the assists report rather than repaired here.
- **Any change to what a worker RECEIVES, and any L6 row** — the plan's standing constraint, and
  this item's gate states L6 UNMOVED as a claim rather than a hope.

## The declaration step

Six facts, every one from a run on this tree under Node 24.20.0, redirected to `dev-dist/w74/` and
read by its exit code; nothing transcribed from the plan. **The tree was held still throughout: the
digest is `d70ada3c2a0e4d43` over 353 files at both ends.**

| fact | measured |
|---|---|
| **A. Path enumeration is TOTAL over the subset — and it must accept a schema `schemaProblem` REFUSES** | `decl-paths.mjs`: over the three corpora (`examples/registry.json`, `spec/examples/registry.json`, `spec/examples/wiring/registry.json`) **35 declared schemas, 127 paths, 81 leaves, 7 paths OPEN, 0 crashes**; and over ten constructed shapes — the empty schema, a type list, a `const`, a mixed `enum`, `required` with no `properties` entry, an array with no `items`, nested `items`, a fan-out record, a MAP record, and `examples` beside a schema — every one enumerates and none throws. **The gap W73's lesson predicted is real and it is the ORDER**: the map record the check builds (`additionalProperties: <schema>` with the `branchKeys` marker) is `[subset: NO]` — `schemaProblem` refuses it by name ([Q306](../questions/q306.md)) — so an enumerator gated on `schemaProblem`, which is ADR 0053 rule 5's order for `findings`, would REFUSE the one shape a join successor's author most needs to see. *An assist reads what the CHECK derives, not only what an author may declare* |
| **B. The sample-and-diff loop is a SUBSTITUTION over `checkWiring`, not a second evaluator** | `decl-loop.mjs`, 14 ms for nine candidate expressions: put the candidate `transform` on a COPY of the flow's node, re-run `checkWiring`, keep that consumer's verdicts. It inherits W73's per-item road unchanged — `transformed`'s `reshape` is a MAP BRANCH task and reports `item`, arity 1, *1 evaluation*; the join successor `total` reports the record at arity 2 with `$sum([*.score])` → `18`, `$sum(*.score)` → `18` and `*.score` → `[9,9]`, which is [Q263](../questions/q263.md)'s three spellings read off the sample. **And it found what fact C names**: a TYPO in `reshape`'s shipped expression (`word` → `wurd`) still reads `transform-passes` |
| **C. The loop's discriminating power is a property of the CONSUMER, and the L6 corpus has almost none** | `decl-tolerance.mjs`, nine probe values against every declared `inputSchema`: the L6 corpus refuses **65 of 126 (52%)**, and **`echo` — the consumer of BOTH transformed arcs in `transformed.flow.json` — refuses 0 of 9**, because its `inputSchema` is literally `{"examples":[{"a":1}]}`. `publish`, `fail` and `uncloneable` also refuse 0. The wiring FIXTURE corpus refuses **23 of 27 (85%)**, and its `transform-passes` / `transform-fails` pair already differs by ONE expression (`label` against `confidence`). *P19 fact 3 said the corpus's 14-of-14 was partly the workers' tolerance; this is that sentence with a number, and it decides that the session's workers CONSTRAIN* |
| **D. The generated signature, both roads priced on the SHIPPED document** | **Road (a), `json-schema-to-typescript` 15.0.4** — installed in the scratchpad, OUTSIDE the repository, **zero symlinks and zero reparse points**, `18 MB` of `node_modules`, 14 top-level packages, 9 direct dependencies: **29 of 29 schemas compile, 0 fail, 153 lines**. P19 fact 4 confirmed on all three schema kinds rather than twelve output schemas. **Road (c), a generator in this package** — `decl-signature.mjs`: **32 non-blank, non-comment lines**, 14 worker entries emitted, and the emitted text **typechecks under `tsc --strict` at exit 0**. **The two roads AGREE wherever a schema SAYS something and differ wherever it says LESS** — an open object with a property gets `[k: string]: unknown` from BOTH; an empty or annotation-only schema is `unknown` in road (c) and an OBJECT type in road (a); a closed object with no properties is `Record<string, never>` in road (c) and `{}` in road (a), which in TypeScript means *any non-nullish value*. Both differing shapes are in the corpus (`publish`, `attest`, `fail`, `uncloneable` and `echo` all declare an empty or annotation-only `inputSchema`), and road (a) emits 18 index signatures to road (c)'s 11. ***This row said the reverse — that the two differ on the OPEN object — and so did the reference, the module header and stop-and-ask 2's fidelity row, which is one of road (c)'s priced reasons.*** The cause, found by W74's conformity reader in the author's own scratchpad output: the harness was run TWICE, once passing `{ additionalProperties: false }` to `compile()` — which CONFIGURES the generator to close what a schema leaves open — and the later run's LINE COUNT was kept beside the earlier run's CONCLUSION. *`doc/workflow.md` v0.12's second question — was what it RAN what it CLAIMS — on a measurement rather than on a check.* Re-measured here over five shapes through both roads, and road (a) re-run: 29 compiled, 0 failed, 153 lines, 18 index signatures. *And road (c)'s first attempt was WRONG*: it emitted `export interface XSettings unknown`, a syntax error, for the eleven workers that declare no `settingsSchema` — found by compiling it and by nothing else, which is P19 fact 6's lesson on this item's own output |
| **E. The authoring session RUNS, end to end, in 20 ms** | `decl-session.ts`, prototyped whole before a line of it reaches the reference: a two-worker registry whose schemas OPPOSE (fact C), a flow wired producer → consumer, and four steps. **Step 1** `no` — *consumer requires "text", producer does not guarantee it*. **Step 2**, a first transform `{ "text": lines }` — `transform-fails`, *$.text expected string, got array*. **Step 3**, ONE expression edit to `{ "text": $join(lines, " ") }` — `transform-passes`. **Step 4**, the same flow on a real `createRuntime` — `completed`, `{"words":2}`. **And step 4 failed on its first run for a reason the session has to teach**: `createRuntime` builds pools ONCE, so a flow whose transform is DISCOVERED during the session must be handed to `createRuntime` as `flows`, or `start` throws `LanguageNotBuilt` naming the type. *The session's own shape is the lesson: you check, then you build* |
| **F. Q142's window, measured before the record step rather than found by the gate** | `decl-q142.mjs`: whole tree **131 / 5617 / 274**, `doc/decisions` removed **99 / 5146**, both removed **79 / 4132**. So `M3 = 107` sits in `(99, 131]` with **8 files of margin below** and `M4 = 4450` in `(4132, 5617]` with **318 links below**. This item adds ONE markdown file outside both removed directories; the record step's six index paragraphs are the link half, and W73's whole increment was 68 links. **Predicted NOT to fire, and re-measured before the record step** — the plan's seeded row asks for exactly that |

**And one thing no table predicted**: the tree that ships at `af7b1db` has digest
`d70ada3c2a0e4d43`, and W73's Record names `aaf85f839c4d7101` for its confirming gate over the same
**353** files. The count matches and the content does not, because W73's record-step prose landed
after its gate — W72's *two prose edits follow it and are named* without the naming. Recorded here as
the baseline this item's *held still* claims are measured against, and **not corrected in W73's file**:
it is that item's Record and this item has no standing to rewrite it (`doc/workflow.md` section 6
pass 3 rule 6 gives that to the RETRO).

---

## Stop and ask 1 — where the assists LIVE: a root export beside `checkWiring`, or their own sub-path

**Put to the maintainer 2026-09-18 with both roads priced on this tree. ANSWERED the same day: ROAD A**, the
author's reading — `src/definition/assist.ts`, re-exported by `index.ts`, on `wiring.ts`'s and
`witness.ts`'s precedent of one item ago. Two lines: the `export *` and the JSR allowlist entry.

| | **(A) a ROOT export — `src/definition/assist.ts`, re-exported by `index.ts`** | (B) a SUB-PATH — `fyflow-orchestration/assist` |
|---|---|---|
| what it costs | **two lines**: one `export *` in `index.ts` (sixteen lines today, module by module) and one `!src/definition/assist.ts` in `deno.json`'s publish allowlist — W73's own cost for `wiring.ts` and `witness.ts`, measured | **twelve lines of `exports` in `package.json`** (node / browser / types, three keys each), three in `deno.json`'s `exports`, one more in its allowlist, a THIRD bare-specifier rewrite in `check-docs.mjs`'s extractor (it has two: `/scheduler` and `/jsonata`), and an `S14`-shaped clause if the sub-path is to mean anything |
| what it buys | nothing a consumer must pay for: the assists are **pure over data** — path enumeration reads a schema, the loop calls `checkWiring`, the recipe emits text — with **no engine, no scheduler value and no `node:` import**, exactly what `wiring.ts` already is | a consumer who never authors pays no bytes for the assists. **Measured: that argument is `jsonata`'s and does not transfer** — `/jsonata` is a sub-path because it loads a 237 KiB ENGINE (ADR 0052); `assist.ts` loads nothing |
| the precedent | `wiring.ts` and `witness.ts` are root exports, decided at W73 one item ago, for the same reason | `/scheduler` constructs scheduler objects (`RT-R13`, `S16`); `/jsonata` loads an engine. **Neither reason applies here** |
| what it risks | a root export is in the browser bundle whether or not it is used — priced: the three assists are **one file** and road (c)'s generator alone is 32 lines | a fourth published entry point, and `S14`/`S15`'s shape says a sub-path is a thing this repository binds hard |
| the author's reading | **THIS ONE** — the assists are what `checkWiring` is for, they are the same kind of code, and W73 set the precedent one item ago | — |

## Stop and ask 2 — what the generated-signature RECIPE actually IS

**Put to the maintainer 2026-09-18 with all three roads priced from fact D. ANSWERED the same day:
ROAD C**, the author's reading — the 32-line generator in `assist.ts`, its output checked in and
compiled by `typecheck:examples`, with road (A) named beside it and its one measured difference
stated. **ADR 0057 is NOT taken and stays unused**, as the plan expected: P19 decision 9's substance
is intact — no build step of this package, no dependency, and the reference still says types catch
the SHAPE and not the constraints — and the departure is in the decision's wording alone, recorded
here and in the Record rather than as a decision of its own.

| | **(A) PROSE — the reference documents the `npx json-schema-to-typescript` command** | (B) GENERATED TEXT checked in under `examples/getting-started/` | **(C) a 32-line generator in `assist.ts`, executed by the gate** |
|---|---|---|---|
| what ships | a section of `AGENTS.md` with a command and an example of its output | a `.ts` file of generated types, and the session's worker written against it | `signatureOf(worker)` returning TypeScript TEXT, plus (B)'s checked-in file emitted BY it |
| what the gate holds | **nothing.** The command is never run here; the output is a transcription | `npm run typecheck:examples` compiles the worker against the types, so a stale type is a red gate — but **nothing regenerates them**, so the file and the schemas can drift exactly as `README.md` and `AGENTS.md` did before `X8` | the session's snippet CALLS it (`check:docs`), the emitted text is compared to the checked-in file BOTH WAYS (`X8`'s shape one directory over), and `typecheck:examples` compiles the worker against it |
| the cost, measured | zero lines of code; **a claim nobody runs**, which is this repository's most common defect and the thing P3 exists to refuse | one generated file; the drift is real and has a name | **32 non-blank, non-comment lines**, emitting text that `tsc --strict` accepts for all fourteen corpus workers (fact D) |
| fidelity, measured *(**this row was WRONG when the maintainer answered, and is corrected rather than quietly deleted** — the conformity reader, finding 2. It read *jstt types an OPEN object as CLOSED*; it does not, and the two roads agree there. The answer stands on the row above and on the one below, neither of which moves)* | `json-schema-to-typescript` types a schema that says LESS as an OBJECT: an empty or annotation-only schema is `{ [k: string]: unknown }` and a closed object with no properties is `{}` — *any non-nullish value*. Five corpus workers declare such a schema | same, since (B)'s text comes from (A) | a schema with no `type` is `unknown`, which is what it admits, and a closed empty object is `Record<string, never>` — the same reading `pathsOf` gives them |
| the consumer install | **18 MB, 14 packages, 9 direct dependencies** — measured in the scratchpad with zero links. A real cost a consumer may already be paying, and one this package does not carry | the same, once | **none** |
| decision 9 | satisfied to the letter (*a consumer runs the generator once*) | satisfied | **a departure in the letter, not in the substance** — still no build step of this package, still no dependency, and the reference still says *types catch the SHAPE and not the constraints*. If the maintainer reads this as a departure worth recording, ADR 0057 is reserved for it |
| the author's reading | — | — | **THIS ONE, with (A) named beside it**: ship (C), emit (B)'s file from it, and say in the reference that `json-schema-to-typescript` is the richer consumer tool with its one measured difference stated. A recipe the gate runs is a recipe that is still true next month |

## Stop and ask 3 — the authoring session's FLOW, its MISWIRE, and where it runs

**Put to the maintainer 2026-09-18, prototyped end to end first (fact E). ANSWERED the same day:
road (b) under `check:docs`**, the author's reading — the session's own two workers with opposed
schemas in `examples/getting-started/`, as an executed `ts run` section with `README.md` carrying a
copy under `X8`, and the wiring fixture corpus cited beside it as *one document per verdict*.

**Where it runs.** Under **`check:docs`**, as an executed `ts run` section of `AGENTS.md` with
`README.md` carrying a copy under `X8` — which is what the plan's W74 row says and what this item
recommends. The alternative, a rung of its own, was priced: a new gate entry is two `package.json`
entries, a `GATE_CHAIN` row, `S11`/`S12`, `G1`-`G5` and a self-test (W72's was 24 probes / 9 gradings
and ~38 s), and it buys nothing `check:docs` does not already buy — the session is **20 ms** and
`check:docs` already extracts, typechecks and RUNS every snippet. **L6 stays UNMOVED at 1627 / 53**
either way, which is the plan's constraint.

**The flow and the miswire**, each priced:

| | (a) reuse the WIRING FIXTURE corpus (`spec/examples/wiring/`) | **(b) the session's OWN two workers under `examples/getting-started/`** | (c) reuse the L6 corpus |
|---|---|---|---|
| the miswire | already there, one document per verdict, named by the verdict it earns | written for the session: a reader that returns `{ lines: string[], source }` into a summariser that REQUIRES `{ text: string }` — `no`, *consumer requires "text", producer does not guarantee it* (fact E, measured) | **impossible as a discriminating one**: the corpus reads 62 fit / 1 no, and the one `no` is `map-no-array`'s `FD-R2` row |
| can the loop DISCRIMINATE | yes — `strict` and `text` refuse 8 and 9 of 9 probe values | yes, by construction | **NO — measured (fact C)**: `echo` refuses 0 of 9, so a typo in the shipped transform reads `transform-passes` |
| can it RUN | **no** — every `corpus://` worker URL is loadable by nothing (W72 measured seven of seven), so the session could check and never run | **yes** — measured, `completed`, `{"words":2}` in 20 ms on a real `createRuntime` | yes |
| what it costs | zero new files; a reference section pointing at `spec/` fixtures, which is where a consumer never looks | **two worker modules** in `examples/getting-started/` (the directory the plan's W74 row owns), plus `examples/README.md`'s *seven workers* count | zero |
| what it teaches | the five verdicts, from documents | the whole plan in one screen: a schema catches a miswire BEFORE a run, a loop writes the transform, the run completes, the worker typechecks against a generated signature | nothing the loop can distinguish |
| the author's reading | — | **THIS ONE**, with the fixture corpus cited beside it as *one document per verdict* for a reader who wants each kind alone | — |

**And one thing the session has to teach because the prototype hit it**: `createRuntime` builds its
pools ONCE, so a transform discovered DURING the session must reach `createRuntime` as `flows`, or
`start` throws `LanguageNotBuilt` naming the type. The session's own order — check, then build — is
the answer, and it is worth saying rather than working around.

## Stated assumptions, each overridable by the answers above

1. **`pathsOf(schema)` returns a list, not a tree**, each entry `{ path, types, required }` with
   `path` addressed the way `findings` addresses a value (`$`, `$.items[]`, `$.*` for a map
   record's minted key). Fact A's ten constructed shapes are its fixtures, both the eight in the
   subset and the two that are not.
2. **The enumerator does NOT gate on `schemaProblem`** (fact A) and says in its header why: it
   reads what `checkWiring` DERIVES as well as what an author may declare, and ADR 0053 rule 5's
   order binds `findings` rather than a reading tool.
3. **The loop is `tryTransform(registry, flow, nodeId, transform)`** returning the verdicts for the
   arcs into that node — the substitution of fact B, so there is ONE evaluator and the per-item
   rule, the sample's source and the arity are W73's, unchanged.
4. **Every verdict the loop reports still says *the sample passed*, never *fits***, and carries the
   sample's source and arity — W73's rule, and [Q301](../questions/q301.md)'s resolution.
5. **The session's workers CONSTRAIN** (fact C): both declare `required` keys and
   `additionalProperties: false`, and both declare examples, so `check:workers` runs them —
   **which is a cost this item pays deliberately**, because `examples/getting-started/**` is not in
   `check:workers`' registry today and the session's registry is a literal in the snippet. Whether
   the session's registry should ALSO be a checked-in document is measured at the build.
6. **No new refusal class**, so `AGENTS.md` §9's executed list does not move. An assist reports.
7. **The new `AGENTS.md` section is numbered 15 and appended**, so section 14 (the JSONata adapter)
   is not renumbered — measured: section numbers are cited in **prose in fifteen places** and by no
   check, so a renumber is a hand edit nothing holds.

## Verification

- `eval "$(fnm env --shell bash)" && fnm use 24` first, every shell; `node -v` asserted 24.
- Every rung RUN and redirected to `dev-dist/w74/<rung>.log; echo EXIT=$?` — never piped.
- L0: `npm run lint`, `npm run typecheck`. L1-L5: `npm test`, `npm run test:deno`,
  `npm run test:browser:all` (five runtimes). L6: `npm run test:l6`, `npm run test:l6:deno` —
  asserted UNMOVED at 1627 / 53.
- The checks: `check:spec`, `check:docs`, `check:source`, `check:wiring`, `check:workers`,
  `check:markdown`, `check:policies`, `check:scheduler`, and the self-tests.
- Rule 8: `dev-dist/w74/rule8.mjs` on W73's harness shape (`dev-dist/w73/rule8.mjs`) — a control,
  byte-asserted restores, per-edit anchors on text read from the SOURCE and re-read after every edit
  of this item's own, an abort that undoes what it applied, a content digest over every tracked and
  untracked-unignored file at both ends (`dev-dist/w73/digest.mjs`), **Node 24 asserted by the
  harness** (v0.19's environment clause), every declared ceiling RUN against the rung its reason
  names, and a crash never counted as a detection.
- Then the two reader passes (conformity re-derives every enumerated path and every verdict on paper
  first; adequacy in an isolated copy with `node_modules` COPIED and links scanned before removal, a
  control run green first), rule 8 re-run with their exact edits as probes, the confirming gate with
  the tree held still, the Record — and the grep of the tree for `W74` before recording, the census
  re-derived with `dev-dist/p15/census.mjs`.
- Routing coverage: not applicable — this item touches no routing and no dispatch. That is the claim
  `L6 UNMOVED` makes falsifiable.

## The baseline this item was declared on

**Re-measured on `af7b1db`'s tree at this declaration, every rung RUN and redirected, never
inherited from the plan or from W73's Record:**

```
digest      d70ada3c2a0e4d43 over 353 files, identical at both ends of the declaration step
L1-L5       43 file(s), 1197 assertions — node 24.20.0 and deno 2.9.6 (browsers not re-run here;
            W73's confirming gate has them at 1197 in chromium, firefox and webkit)
L6          1627 assertions, 0 failed, 53 real runs on fyflow-scheduler 0.5.2, node
spec        7 documents, 61 examples, 107 rules, C4 at 34
docs        32 snippet(s): 26 run, 6 check; X8 compared 2 README snippets
markdown    131 documents, 5617 relative links, 274 anchored
workers     14 workers, 12 confirmed by a run, 2 NOT CHECKED
register    238 questions, 182 open, 2 deferred, 54 resolved — 238 of 238 in one cluster cell,
            0 aborts
```

## Record

**Built and gated 2026-09-18 on `af7b1db`'s tree.** Every rung RUN and redirected to `dev-dist/w74/`, read by `$?`; Node 24.20.0 asserted in every shell and by the harness. Expected values from the documents — the subset's own `SCHEMA_KEYWORDS` and `SCHEMA_TYPES`, the session registry's declared schemas and examples, the wiring fixture corpus's two documents that differ by ONE word — never from output.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured, six facts, and **two of them changed what got built** | fact A found the gap W73's lesson predicted and it is an ORDER: the map record `checkWiring` derives is REFUSED by `schemaProblem`, so an enumerator gated on it — ADR 0053 rule 5's order for `findings` — would refuse the one shape a join successor's author most needs (Q306). Fact C found the L6 corpus cannot host the loop's discriminating pair: **`echo`, the consumer of BOTH transformed arcs in `transformed.flow.json`, has an `inputSchema` of `{"examples":[{"a":1}]}` and refuses 0 of 9 probe values**, so a TYPO in that flow's shipped transform still reads `transform-passes`. Facts B, E and F held; fact D was WRONG and its correction is below |
| the three stop-and-asks | RAN — all three answered the same day, each as recommended | a ROOT export (two lines, on `wiring.ts`'s precedent of one item ago); the 32-line generator with its output checked in; the session's own two workers under `examples/getting-started/`, executed by `check:docs`. **ADR 0057 NOT taken** and the departure from decision 9's wording recorded in stop-and-ask 2 rather than decided |
| L0 | **GREEN** | `lint` 0 over 109 files; `typecheck` 0 in all five configurations (red once on an unused import a reader's fix stranded) |
| L1-L5 | **GREEN — 44 files / 1234 cases in five runtimes** (from 43 / 1197) | `test/definition/assist.test.ts`, four suites: `pathsOf` over every one of the thirteen keywords under the three treatments the suite declares and held to `SCHEMA_KEYWORDS` both ways, all seven types, both nesting roads, the `required` guarantee in both directions, and **the two shapes the SUBSET REFUSES that the check derives**; `tryTransform`'s discriminating pair, its provenance, its forwarded option and the fixture corpus's own one-word pair; the session's two workers RUN on their declared examples; `signatureOf` over every emitted form with the generated file held to the generator BOTH WAYS and nothing declared above its marker. Node 1234, Deno 1234, chromium / firefox / webkit 1234 — `test:browser:all` RUN, not inherited |
| the checks | **GREEN** | `check:spec` **UNMOVED at 7 / 61 / 107 with C4 at 34**, as the `Spec:` line claims; `check:docs` **33 snippets, 27 run**, `X8` comparing **THREE** README pairs both ways; `check:workers` 14 / 12 / 2 unmoved; `check:source`, `check:wiring`, `check:markdown`, `check:policies`, `check:scheduler`; **`check:docs:selftest` was RED and is green** (below) |
| L6 | **GREEN — 1627 assertions over 53 runs in BOTH runtimes, UNMOVED**, as the Gate line claims | an assist is not a dispatch. The claim is falsifiable rather than decorative: `examples/l6.ts` lists `examples/workers/` on disk and compares it to the L6 registry both ways, and `getting-started/` is outside that directory for exactly this reason |
| rule 8, author pass | **51 probes: 1 control green, 49 caught, 1 declared ceiling RUN, 0 crashes, 0 aborts** (`rule8-run1.log`, `-run1b.log`, `-run1c.log`) | the first pass read 3 aborts, **2 against declaration** and **2 undeclared survivors**. Both "against declaration" were my ceilings being wrong in the SAFE direction — `c2`'s reason was about one observer where the suite has two, and `e2` found that **`X8`'s pairing is a SECOND observer of a deleted `run` snippet**, so Q102's ratchet is no longer alone for the snippets X8 pairs. The sharper survivor is `c2b` and it is P19 fact 6 one registry over: shortening the producer's declared example cost ZERO at every rung, because `check:workers` reads `examples/registry.json` and nothing else, so the four examples the REFERENCE declares were a claim about the schemas and about no worker. Closed by running both session workers on their declared examples at L1; the probe now records which rung catches it (L1) and which does not (`docs`) |
| readers | **BOTH RAN 2026-09-18 — 15 findings / 4 blocking, and 39 mutations + 5 by-construction probes / 19 survivors / 14 real / 5 blocking, OVERLAP 1, the FORTY-SIXTH measurement** | **The conformity reader's central obligation came back with ZERO disagreements on the VALUES** — it derived all ten `pathsOf` entries with their types and guarantees, all three verdicts with their exact `why` strings, both signatures character for character and the run's `{ words: 3 }` from the schemas alone, before reading a line of output, and every one matched. **What it found was a RED GATE ENTRY and three false claims.** `npm run check:docs:selftest` exits 1: the `unclosed fence` probe deletes the LAST fence in the reference, which is now section 15's — a snippet `X8` PAIRS — so it trips `[X1, X8]` against its declared `[X1]`, rule 7 (c) discriminating exactly as designed, and this item's exceptions row had predicted the self-test unmoved *"to be measured at the build"* without taking the measurement. **The one measured difference against `json-schema-to-typescript` was stated BACKWARDS** in four places, one of them a priced reason in stop-and-ask 2 (below). Section 15's opening sentence said the schemas are *enforced on exactly two values per run*, which `FD-R4` does not say and which this item's own edit two sections earlier states correctly. And `pathsOf` used bare `in` where `schema.ts` has an `own()` helper and W65's comment thirty lines from the module it imports. **The adequacy reader found five blocking, one of them with NO mutation** — the same `in`, reached from the other end, which is the overlap. Its other four: section 15's seven guards are each tautologisable at `check:docs` exit 0 and two of the seven claims had no other observer ([Q310](../questions/q310.md)); the generated file's *both ways* binding was one-sided IN POSITION, so a declaration ABOVE the marker declaration-merges into the generated envelope and widens what `reader.ts` compiles against, at `npm test` AND `typecheck` exit 0; two of `tsTypeOf`'s three no-`type` roads were deletable for zero and the surviving one DISAGREED with `pathsOf` about the same schema; and `TS_NAMES` was a seven-entry list bound to nothing with two dead entries. Every blocking finding closed and every real one acted on; the readers' twenty-three exact edits are probes (`k1`-`k9`, `q-*`) |
| rule 8, RE-RUN with the readers' edits checked in | **74 probes: 1 control green, 65 caught, 8 declared ceilings each RUN against the rung its reason names, 0 measured, 0 UNDECLARED survivors, 0 crashes, 0 against declaration; 6 aborts on the run, every one rule 7 (b) on an anchor this item's OWN fixes moved, re-anchored and then 6 caught** (`rule8-run2.log`, `-run2b.log`) | digest `630ccc4f8a40a2db` over 360 files, identical at both ends of both passes. One abort is worth naming: `q-a8`'s anchor was MIS-QUOTED when the author wrote it and matched nothing from the start — rule 7 (b) catching a probe that never RAN, which is what that clause is for. Every blocking finding both readers made now fires |
| `npm run gate`, CONFIRMING (after the readers, the re-run and the record step) | **GATE EXIT=0, zero lines beginning FAIL at any indent, zero PAGE ERRORs, 16 chain entries, `selftests` 8/8 completed and 8 ok in 1128.6 s over 6 lanes** (`dev-dist/w74/gate-final2.log`) | digest **`951f08ad041501a9` over 360 files, IDENTICAL before and after**, no edit made while it ran. L0 green; `check:spec` **7 / 61 / 107, C4 at 34 — UNMOVED**; `check:docs` **33 / 27** with `X8` comparing THREE README pairs; `check:docs:selftest` green (the conformity reader's finding 1); `check:workers` **14 / 12 / 2 — unmoved**; `check:markdown` **132 / 5661 / 274**, and **[Q142](../questions/q142.md) measured BEFORE the record step and again after it** — `M3` at 107 with 7 files of margin below, `M4` at 4450 with 275 links — so the plan's seeded row is answered by a measurement rather than by the gate; L1-L5 **44 / 1234** in node, deno, chromium, firefox and webkit; L6 **1627 / 53 in BOTH runtimes, UNMOVED**; census **241 / 185 / 2 / 54**, 241 of 241 in one cluster cell, 0 aborts. **This is the SECOND confirming gate**: the first was `GATE EXIT=1` with zero FAIL lines and zero failing checks, on a `file:///` URL in the fix for a reader's finding (*What broke* 9). **And ONE prose edit follows this gate and is named**: this row itself, plus the two exception rows above it — the item's own Record, which no gate reads (W72's and W73's precedent, and the reason the shipped digest is `de4c932645825c12` rather than the gate's) |

**Outputs.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `pathsOf`, total over the subset AND over the two shapes it refuses | `src/definition/assist.ts`, exported from the root | L1: `p1`-`p17`, `q-a1`, `q-a5`, `q-a6`, `k4`; the root-export test (`o1`) at L1, `X3` and `X4` |
| (2) `tryTransform`, the loop, a substitution over `checkWiring` | `assist.ts` | L1: `o2`, `o3`, `o4`, `q-a10`, and the discriminating pair (`e5`) |
| (3) `signatureOf` / `signaturesOf`, and the file they generated | `assist.ts`, `examples/getting-started/session-types.ts` | L1: `o5`-`o10`, `k2`, `k3`, `q-a7`, `q-a8`, `q-b1b`, `q-b1c`, `q-key`, `d3`; `typecheck:examples` (the workers compile against it) |
| (4) the authoring session, executed | `AGENTS.md` section 15 | `check:docs`: `o11`, `e3`, `d7`, `e2`; L1: `q-c3`, `q-h1`, `q-h2`, `q-ex` (the chain derived where a guard cannot be tautologised) |
| (5) README's third snippet, byte-equal | `README.md` | `check:docs` `X8`: `o12`, `o13`, `d5`, `d6` |

**What broke.** (1) The generator's FIRST attempt emitted `export interface XSettings unknown` — a syntax error — for the eleven corpus workers that declare no `settingsSchema`; found by compiling it and by nothing else, which is P19 fact 6's lesson on this item's own output, at the declaration step. (2) `RegistryDocument.workers` is optional, so the snippet's `SESSION_REGISTRY.workers.reader!` was `TS18048` at `X3` and `X5`; closed by exporting `SESSION_WORKERS` on its own. (3) The session's step 4 threw `LanguageNotBuilt` on its first run — `createRuntime` builds pools ONCE, so a transform decided DURING the session must reach it as `flows`. It is the lesson the section now teaches. (4) **Two browser failures at 44 / 1220 while node and deno were green**, both predicted classes: the jsonata worker half inside a bundle (Q261, closed with W62's `workerHalf` handle) and a file the bundle does not inline — `scripts/build-browser-tests.mjs` is a LATE exception and the FOURTH time a suite reading a file outside `spec/examples/` has reddened the browsers alone. (5) The suite census (Q158's closure) fired by name on the first run, naming all three new suites, and again for a fourth. (6) My own expected value was wrong twice: `!text.includes('undefined')` on a generated text where `typed`'s schema declares the STRING `"undefined"` in an `enum`, and a column assertion that measured the marker rather than the column. (7) **A python heredoc mangled `split('\n')` into a literal newline, THREE times** — `ERR_INVALID_TYPESCRIPT_SYNTAX`, the runner down at exit 1 with **zero FAIL lines** ([Q272](../questions/q272.md)'s shape); CLAUDE.md's own warning, and the fix each time was to write the script as a FILE. (8) `check:docs:selftest`, a gate entry, RED — the conformity reader's finding 1. (9) **The FIRST confirming gate was `GATE EXIT=1` with ZERO lines beginning `FAIL`, in the fix for a reader's finding** — v0.8's founding observation, which is why the set is re-run at all. The test written to close the adequacy reader's A10 (*`tryTransform` forwards its options*) needed a language whose worker URL does NOT import, and used `file:///w74-no-such-module.ts`: node and deno reject that with an ordinary error and a BROWSER refuses it with `Not allowed to load local resource`, which the runner reports as **`PAGE ERROR` and `1 FAILURE(S) in chromium`** — a failure whose line does not begin with `FAIL`, so the grep that reads a gate log cannot see it and only the EXIT CODE can. *Section 4's clause, in a secondary signal nobody had named: a page error is a failure the FAIL-line grep is blind to.* Re-pointed at a `data:` URL that THROWS on evaluation — importable in every runtime, failing in every runtime for the same reason — and the gate re-run WHOLE.

**What this taught.** **A loop's discriminating power belongs to the CONSUMER, and the corpus this plan built could not supply one** — fact C: `echo` refuses 0 of 9 probe values, so the reference's own demonstration had to bring its own workers. *A sample-and-diff loop run against a consumer that refuses nothing demonstrates nothing.* **An assist reads what the CHECK derives, not only what an author may declare** — fact A, and gating `pathsOf` on `schemaProblem` as ADR 0053 rule 5 gates `findings` would have refused exactly the join successor's author (Q306). **The two assists disagreed about one schema in TWO directions and both were found by readers**: `tsTypeOf` emitted an object type for a schema `pathsOf` calls open, and `object()` dropped a required key `pathsOf` emits — one from each reader, and neither from the author's fifty-one probes. **A measurement re-run with an option dropped is a new measurement**: fact D's harness was run twice, once configuring the generator to close what a schema leaves open, and the later run's LINE COUNT was kept beside the earlier run's CONCLUSION — so a claim stated in the reference, the module header, the fact and a PRICED REASON in a stop-and-ask was the reverse of what both tools emit. *`doc/workflow.md` v0.12's second question — was what it RAN what it CLAIMS — on a measurement rather than on a check, which is a shape that section does not name.* **An executed snippet's guards are bound by their PRESENCE**: `X4` refuses a `run` snippet with no `throw` and cannot refuse seven tautologies, so the exit artifact's claims needed a second observer rather than a better guard ([Q310](../questions/q310.md)). **The examples a REFERENCE declares are run by nothing**: `check:workers` reads `examples/registry.json` alone, so W72's whole apparatus reached none of the session's four examples until this item ran its two workers at L1. **And a content digest tells you something moved and not what**: this item's *held still* claim needed a file-by-file diff against the pre-reader copy to establish, because the digest reading it was compared against had been taken one edit too early — the digest's own limit, beside `git status`'s, which cannot see a file modified either way. `doc/workflow.md` changes: **none proposed**; Q310's shape is recorded for P19's retro to judge, at one occurrence.

**Questions raised.** [Q310](../questions/q310.md) (an executed snippet's assertions are bound by presence alone, and the exit artifact's seven guards are all tautologisable at exit 0), [Q311](../questions/q311.md) (`pathsOf` walks four keywords and an object-valued `const` or `enum` is a fifth road), [Q312](../questions/q312.md) (what puts a READING in `spec/`, and this item's stated criterion would have kept W73's own check out). **Extended**: [Q102](../questions/q102.md) (`X8`'s pairing is a second observer of a deleted `run` snippet — measured, the first thing beside `RUN_FLOOR` that notices), [Q217](../questions/q217.md) (three literals for one snippet, and a `Pick` that removes drift rather than detecting it), [Q272](../questions/q272.md) (three more instances, every one a shell heredoc mangling an escape), [Q302](../questions/q302.md) (the bounds generator its row names as the closing move is OUT of this item, named in Scope). **Q313-Q314 reserved and unused. ADR 0057 not taken.** **Predictions**: 1 HOLDS (no schema this item wrote needed anything past the subset); 3 UNTOUCHED (no corpus schema needed `oneOf`, and [Q311](../questions/q311.md) is the nearest thing — an `enum` of object shapes is *one of these shapes* by another name); 4's mechanism confirmed a third time, in the direction P19 fact 6 named — the author's declaration was the lie, twice, and only compiling it and only a reader deriving from the code found them.
