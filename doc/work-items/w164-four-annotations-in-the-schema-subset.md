# W164 — four annotations in the schema subset

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-15 on `60c3df6`,
declaration step RUN the same day in a byte copy (M1-M5 below); both reader passes RAN, neither found a code defect, their items
acted on; no exception; stop-and-ask S1 (four stale *thirteen* sentences outside `Owns`) ANSWERED by the maintainer 2026-10-16,
*"as recommended"* — leave and record (Out); nothing raised, nothing closed
**Plan:** [P37](../plans/p37-a-runtime-is-its-registry.md) — *what may a running runtime be asked to accept, when its
registry is fixed at `createRuntime`?* — its THIRD item.

```
Spec:       spec/flow-definition.md v0.35 -> v0.36: section 3's "The schema subset" admits four ANNOTATIONS — title and
            description (a string), readOnly and writeOnly (a boolean) — each value shape checked at construction at any
            depth, none read by any value check, writeOnly promising no redaction; seventeen keywords, twelve constraining;
            the bar beside the table; deprecated, $comment, default, format, $schema and $id still refused by name, with
            the reason for each. Section 2's settingsSchema sentence (thirteen -> seventeen) and section 3's `fits` row (the
            four read by nothing) follow. No rule id moves and none is added — the FD-V count stays 42, the rule count 135.
Owns:       from P37's W164 row: src/definition/schema.ts, spec/flow-definition.md, spec/README.md,
            test/definition/schema.test.ts, test/definition/assist.test.ts, test/definition/l4-corpus.test.ts,
            scripts/check-docs.mjs, AGENTS.md, doc/decisions/0098-*.
            scripts/check-docs.mjs is in the row and is NOT edited: no `run` snippet is added or removed (AGENTS.md's
            snippet change is inside an existing `run` snippet), so RUN_FLOOR does not move.
            No exceptions. Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/0053-* and 0056-* (status
            lines and inline notes, as W162 noted ADR 0051), this file.
Inputs:     P37 decision 4, fact 3, prediction 4, sentences B' and C and paragraph D; ADR 0053 (rules 2-3, consequence 2,
            the rejected whitelist row), ADR 0056 (rule 6, consequence 4); Q278; fyflow-app request #20 as P37 states it.
Outputs:    (1) schema.ts: SCHEMA_KEYWORDS gains title, description, readOnly, writeOnly (17); schemaProblem refuses a
                non-string title/description and a non-boolean readOnly/writeOnly, naming the path and the keyword and
                ADR 0098, at every depth, before examples are held; findings unchanged (reads none of them).
            (2) spec/flow-definition.md v0.36 (above); spec/README.md's row.
            (3) ADR 0098 — supersedes ADR 0053 rule 3 in part (its annotation sentence), consequence 2 and the rejected
                whitelist row, and ADR 0056 consequence 4, for the four only; amends ADR 0053 rule 2 (the count), as
                ADR 0056 did.
            (4) AGENTS.md: section 13's transform snippet gains an executed block — an annotated inputSchema resolves,
                findings accepts a value under writeOnly, a writeOnly of the wrong shape and a `format` are SchemaRefused
                naming each — and a paragraph after it stating the four constrain nothing and writeOnly promises no
                redaction; section 11 gains a row, *redaction by writeOnly* — no.
            (5) L1 tests (below) and their one suite in l4-corpus's LATE_SUITES.
Depends on: W163 (done, 60c3df6)
Blocks:     W165
Tests:      L1 test/definition/schema.test.ts — the W164 suite: each of the four ADMITTED at the top, under properties and
            under items (and false, the empty string, both booleans true, all four at three depths beside examples);
            each REFUSED on every other JSON kind (5-6 values each) at each of the three places, naming `<path>.<key>`
            and ADR 0098, and a malformed annotation reported before an example under it; each read by NO value check —
            findings identical with and without it over conforming and refused values at each place (control: 28
            refusals met), and fits identical with the annotated schema as producer and as consumer, against itself and a
            rival that is `no` both ways (control: 12 `no` pairs); writeOnly accepts a value, readOnly accepts a supplied
            one; the six still refused BY NAME at each place and beside all four. The keyword-list case: SCHEMA_KEYWORDS
            equal to the spec's table both ways, 17, and the table's rows marked "**an ANNOTATION" exactly the five.
            test/definition/assist.test.ts — the pathsOf membership both ways with the four as `ignored`, each in the
            subset and adding no path; and a case: paths, types, guarantees and tsTypeOf identical with and without the
            four at three places (control: the bare schema's four paths written out).
            Expected values from the spec's table (the shape column, "constrains NOTHING") and P37 decision 4's lists —
            never from the validator's output.
Gate:       `npm run gate` before the readers (P37 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 each of the four
            admitted at the top, under properties and under items, each refused on a wrong value shape, each read by no
            value check; the six still refused by name; the spec's table and SCHEMA_KEYWORDS both ways.
Reserves:   Q623-Q625, ADR 0098
```

*Reserves: `npm run state` on `60c3df6` reads the next free ids as **W164, Q620, ADR 0098** from the tree, and W162, Q615,
ADR 0096 from the ledger (P33's Retro) — they DISAGREE because P37 was declared and W162-W163 spent ids since that
sentence; P37's own reservation governs. Its W164 row gives this item Q623-Q625 and ADR 0098.*

## Scope

**In** — Outputs (1)-(5).

**Out** — named rather than left implicit, with where it goes instead

- **A redaction feature** — the library reading `writeOnly` to mask a value in what a run retains or reports. Not decided
  by P37; ADR 0098 consequence 1 says every retaining record would move. Stated as *does not exist* in `AGENTS.md`
  section 11.
- **`deprecated` and `$comment`** — they meet ADR 0098's bar and no consumer asked; rule 5 admits one by amendment.
- **`signatureOf` emitting a JSDoc comment from `description`** — `json-schema-to-typescript` does; this generator emits
  no comments today and P37 does not ask for it. The assist test pins that the four change no generated signature.
- **`readOnly` refusing a supplied value** at `FD-R4`'s boundary — JSON Schema permits and does not require it; ADR 0098
  consequence 2.
- **Stop-and-ask S1 — FOUR sentences outside `Owns` that say *the thirteen* keywords** — `src/driver/driver.ts:2140` (a
  comment), `test/driver/result-schema.test.ts:309` (a comment), `test/driver/result-schema.test.ts:62` (a comment, the
  conformity reader's F3) and `spec/outcome-record.md`'s `OR-R13` row — each claiming that `enum` and `const` are the only
  keywords of the subset that call `canonical`. **The claim still holds of every keyword** (none of the four annotations
  is read by `findings`); **the count is now stale**. Not edited: all four are outside the row, and P37 paragraph D puts
  `src/driver/**` in no row. **ASKED** at READY-FOR-READERS; **ANSWERED by the maintainer 2026-10-16, *"as
  recommended"* — LEAVE AND RECORD**: none of the four is edited, and they stay here, with the `wiring.ts` comment below.
- **`src/definition/wiring.ts:155`'s comment** (the conformity reader's F4) — `fits` *"over the twelve constraining
  keywords (`examples` is read by nothing, ADR 0056 rule 1)"* names `examples` alone as unread and not the four of ADR
  0098. True of the code (the four ARE read by nothing, asserted at L1); incomplete as a sentence. Outside `Owns`;
  recorded here beside S1's four, not edited.
- **Q278** — unchanged and not edited: its resolution (*refused at construction, never ignored*) still holds of every
  keyword outside the subset; ADR 0098 moves which keywords are inside it.

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-15 in a BYTE COPY of `60c3df6` (`git archive` into `C:/tmp-w164/m`,
`node_modules` copied, **zero links** by `find -type l`), node 24.20.0 and deno 2.9.6. The change was built there whole and
every lane run before `Owns` was written.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 documents / 75 examples / 135 rules; `check:docs` 42 snippets (36 run, 6 check); L1-L5 **62 files / 1708 cases** in node, deno and chromium; L6 **2646 assertions / 174 runs** in node and deno |
| M2 | **P37 prediction 4, measured** — `src/definition/schema.ts` changed ALONE (the four in `SCHEMA_KEYWORDS`, the two shape checks), every test and example as shipped, each lane run on its own | `lint`, `typecheck`, `check:spec`, `check:wiring`, `check:workers`, `check:docs` **EXIT 0**; `test` and `test:deno` **EXIT 1 with exactly FOUR failures, the four sites fact 3 names**: the keyword list bound to the spec (`schema.test.ts`, the count of 13 behind it), the `OUTSIDE` list (`description`, `title`), the annotation loop (`description: refused … — null`), and `pathsOf`'s membership (`assist.test.ts`). `test:l6` **EXIT 0**, 2646 / 174. `test:l6:deno` **EXIT 1 on its first run — 5 failed, all in ONE row, *uncloneable / OR-R6, threaded*, whose run read `running` where `awaiting_action` was expected** — and **EXIT 0, 2646 / 174, on an immediate re-run of the same tree**. A schema keyword reaches nothing in that row (an uncloneable RESULT on a thread pool); recorded as a flake below, not as this change's |
| M3 | the change whole, in the copy | `npm run gate` **EXIT 0** (the first attempt failed `check:spec` `C5` only — the two links to this file, which did not yet exist in the copy): `check:spec` 7 / 75 / **135 rules** (unmoved); `check:docs` 42 snippets, 36 run, 6 check — unmoved; L1-L5 **62 files / 1713 cases** in node, deno and chromium (+5: the W164 suite's four cases and one in `assist.test.ts`); L6 **2646 / 174** in node and deno, unmoved |
| M4 | the author's provocations (rule 8, written to the RULE; in the copy, each edit asserted to match once and to change its file, each restore digest-checked; harness `C:/tmp-w164/mutate.py`, NOT in the tree) | **The first CONTROL came back RED**: the harness filtered the runner to `test/definition/`, which breaks `l4-corpus`'s suite census — so the run was discarded and the harness re-run UNFILTERED. Then: CONTROL **EXIT 0** at 1713; **29 of 29 KILLED** — K1-K4 each of the four out of the list; K5-K10 each of the six admitted; S1-S2 a shape check removed, S3-S4 one keyword of each pair unchecked, S5 a string admitting a number, S6 a boolean admitting `"true"`, S7 a boolean admitting `null`, S8 shapes checked at the top only, S9 an example held before the shapes; V1 `findings` refusing a value under `writeOnly`, V2 under `readOnly`, V3-V4 a `title` / `description` ending the walk; F1 `fits` reading a consumer's `writeOnly`, F2 a producer's `readOnly`; P1 `pathsOf` reading `title`; T1 the spec table losing the `writeOnly` row, T2 `readOnly` unmarked as an annotation, T3 `minimum` marked one |
| M5 | the census sites the row names | `spec/README.md`'s row: moved (`C8`). `l4-corpus.test.ts`: one suite added to `LATE_SUITES`. `scripts/check-docs.mjs` `RUN_FLOOR`: unmoved — the snippet change is inside an existing `run` snippet, so `check:docs:selftest` is NOT bound by B′ and was NOT run; no always-read document moves (`check:budget` measured CLAUDE.md, `doc/workflow.md`, `doc/concept.md` unchanged), so `check:budget:selftest` is NOT bound either. **Nothing else reads `SCHEMA_KEYWORDS` or an annotation**: grepped over `src/`, `scripts/`, `examples/`, `test/` and `index.ts` (excluding `dev-dist/` and `dist/`) — `schemaProblem` alone iterates a schema's keys (`schema.ts`); `findings`, `fits`, `pathsOf`, `tsTypeOf` and the witness read named keywords only; `examples/registry.json`'s `"title"` is a PROPERTY name, not a keyword; no selftest probe or L6 clause names one of the four |

## Choices made inside the declaration and not named by P37

1. **Any string, the empty one included**, for `title` and `description` — the spec's shape column says *a string*; an
   emptiness rule would be a constraint P37 did not state (unlike `examples`, whose empty list is refused because it
   annotates nothing by ADR 0056's own reason).
2. **`readOnly` and `writeOnly` may both be `true`** — JSON Schema does not forbid it, and refusing it would be a
   constraint, which the bar excludes.
3. **The shape checks run after the bounds and before `items` and `examples`** — so a malformed annotation is reported as
   itself before an example under it (ADR 0053 rule 5's order) and before an outside keyword under its `items`; both
   asserted (the second since the adequacy reader's F7). They run AFTER `properties` is walked, so a problem in a
   property's sub-schema is reported first — ADR 0098 rule 2 says so since the conformity reader's F6.
4. **The four join `SCHEMA_KEYWORDS` itself**, with no second list — the reading of decision 4 that answers ADR 0053's
   whitelist objection; the spec's table carries which rows annotate, and the test binds those five too.
5. **ADR 0098's front matter**: `supersedes: ADR 0053 in part; ADR 0056 in part` — the register's `RULED` form has no word
   for a consequence or a table row, and what is superseded of ADR 0053 is NOT all inside rule 3 (consequence 2 and the
   rejected row are outside it), so the whole-record *in part* is the honest form; the precedents for *supersedes … in
   part* are ADR 0068, 0070 and 0072 (the conformity reader's F5 — the declaration first wrote `ADR 0053 rule 3 in part`
   and cited W162's *ADR 0075 in part*, which is an `amends`). The ADR's Status paragraph names the parts. **`amends: ADR
   0053 rule 2`** — the count, which ADR 0056 amended the same way. P37 names the superseded parts and not the count.
6. **The reasons ADR 0098 rule 6 gives for the six** are P37's for `default` and `format`, and this item's for `$schema`,
   `$id` (they name a dialect and a base URI for `$ref`) and for `deprecated` and `$comment` (they meet the bar; nobody
   asked).

## Predictions checked

| P37 prediction | verdict |
|---|---|
| **4** — W164 moves exactly fact 3's four assertion sites, and no L2-L6 assertion | **TRUE at L1-L5 (M2)**: exactly the four, in node and deno, and nothing else. **At L6, TRUE in node**; in deno the first run failed one row that no schema keyword reaches and an immediate re-run of the same tree was green — counted as a flake, not as a move |

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: none of a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10), a
duplicate task id (Q13) or a nested fan-out (Q6) is this item's — it routes nothing; the schema subset is checked at
construction and by the value checks, and no L6 assertion moves.

## Record

*Filled in when the item is done.*

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree, 2026-10-16: `check:spec` 7 / 75 / 135 rules; `check:docs` 42 snippets, 36 run, 6 check; L1-L5 **62 files / 1713 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2646 assertions / 174 runs**, 0 failed, in node and deno. firefox and webkit NOT RUN |
| conformity reader | **RAN** | F1-F8, no code defect; acted on below |
| adequacy reader | **RAN** | F1-F9, no code defect; **18 of 23 independent mutations survived** — *constrains nothing* was barely pinned; acted on below |
| overlap | | **2 shared subjects**: (i) the witness and sample generator never fed an annotated schema — conformity F8, adequacy F4; (ii) the no-redaction / *carried* claim not executed — conformity F7, adequacy F5 |
| after the readers' items, `npm run gate` | **RAN, `GATE EXIT=0`** | on the real tree, 2026-10-16: `check:spec` 7 / 75 / 135 rules; `check:docs` 42 snippets, 36 run, 6 check; L1-L5 **62 files / 1718 cases** in node, deno and chromium (+5 since the first gate: the readers' five W164 cases); L6 **2646 / 174**, 0 failed, in node and deno |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after S1's answer was recorded (this Record written before it, but for this row and the Status line): the ladder — `check:spec` 7 / 75 / 135 rules, `check:docs` 42 snippets (36 run, 6 check), L1-L5 **62 files / 1718 cases** in node 24.20.0, deno 2.9.6 and chromium, L6 **2646 / 174**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 lanes completed, 10 ok**, 872.5 s self-test wall. `gate:full` NOT RUN and not owed (W167 is P37's last item) |

**What was done for each finding** (the coordinator's items 1-14). Tests in `test/definition/schema.test.ts`'s W164 suite
unless named; every expected value from the spec's table or a keyword's own row, never from the code's output.

| | finding | done |
|---|---|---|
| A-F1 | *constrains nothing* asserted beside `type` and `properties` only | a case per CONSTRAINING keyword — the list bound to `SCHEMA_KEYWORDS` less the five annotations, both ways — each with an accepted and a refused value, at FIVE places (beside it at the top, under `properties`, under `items`; on the PARENT of `properties` and of `items`), under each of the four, all four, and both booleans `false`: `findings` identical, and a per-keyword control that the refused value was met at every place under every set. And a `fits` case per bound and per constraint `fits` reads (`minimum`, `maximum`, `minLength`, `maxLength`, `minItems`, `enum`, `const`, `required`, `type`, `properties`, `items`): a bare pair that FITS and a bare rival that is NO (both asserted), the four on the consumer beside its bound, on the producer, on both, and one level down — the same verdict, with a per-keyword control that both verdicts were met |
| A-F2 | no refusal at depth >= 2; a sub-schema under an annotated one not shown walked | every wrong shape also at `$.items.properties.a.items.properties.b` (depth four); and under each annotation on TWO ancestors, an outside keyword (`properties` road) and a malformed bound (`items` road) below are still refused; the four admitted at depth four |
| A-F3 | the wrong-shape lists differed between the two keywords of a shape | ONE list per shape — `NOT_A_STRING` (nine values) and `NOT_A_BOOLEAN` (ten, `'true'`, `'false'` and `''` among them) — each kind spelled both ways |
| A-F4 / C-F8 | `witness` and `sampleOf` never fed an annotated schema; `tsTypeOf` not shown to emit no `readonly` and no comment | nine schemas over every constraint the generator reads, the four put on every sub-schema: `witness` and `sampleOf` identical, with and without a declared example, two values spelled out (`"xxx"`, the nested object) and a control that eight of nine witnesses are non-trivial. In `assist.test.ts`: a property under `readOnly`, `title`, `description` and `writeOnly`, at two depths — `tsTypeOf` the bare schema's byte for byte, no `readonly`, no comment, no annotation text, the properties emitted (control) |
| A-F5 / C-F7 | the no-redaction / *carried* claim executed nowhere | a DRIVER run on a two-method fake scheduler, `OR-R13` and `FD-R4` on: a payload and a result carrying a `writeOnly` value — the task handed to the scheduler, the outcome fold input (the run's event log) and `fold`'s run state each hold it verbatim, no `OR-R13` report, the run `completed`. And *logged* reworded to *kept in the run's event log* in `AGENTS.md` section 13 and ADR 0098 rule 4 |
| A-F6 | a wrong shape not shown refused through the registry or a gate type | `resolveRegistry` on each of a worker's four schemas with each of the four of a wrong shape under `properties`: `SchemaRefused` naming the field and the path, and the right shapes resolving (control); a gate type's `settingsSchema` with each of the four of a wrong shape: `validateDefinition`'s `FD-V39` at the gate naming `$.<key>` and ADR 0098, and the right shapes clean (control) |
| A-F7 | choice 3's *before items* unasserted | asserted: `{ type: 'array', title: 5, items: { format: 'x' } }` reports `$.title`; choice 3 now also says the shapes run AFTER `properties` |
| A-F8 | the spec table's shape column unbound | the table test reads each of the four's second column: `a string` for `title` and `description`, `` `true` or `false` `` for `readOnly` and `writeOnly` |
| A-F9 | — | nothing to do, as the coordinator directed |
| C-F1 | `schema.ts`'s comments wrote counts (*twelve*, *the thirteenth*, *the same thirteen*, *the other thirteen*, *Five*) | every count dropped — the comments name the constraining keywords and the annotations and derive nothing (CLAUDE.md, P27 decision 4) |
| C-F2 | `assist.test.ts`'s header said *thirteen* | dropped (*every keyword of the subset*); the membership case's title too |
| C-F3 | a FOURTH stale *thirteen*: `test/driver/result-schema.test.ts:62` | outside `Owns`; added to **S1**; ANSWERED 2026-10-16 *leave and record* — not touched |
| C-F4 | `src/definition/wiring.ts:155`'s comment names `examples` alone as unread | outside `Owns`; recorded in Out beside S1, not touched |
| C-F5 | choice 5 cited W162's *ADR 0075 in part*, which is an `amends` | corrected: the *supersedes … in part* precedents are ADR 0068, 0070 and 0072; and the front matter is now **`supersedes: ADR 0053 in part; ADR 0056 in part`** — consequence 2 and the rejected row are outside rule 3, so *rule 3 in part* understated it. `check:register` EXIT 0 on it |
| C-F6 | ADR 0098 rule 2's *before any value is checked* true within one schema, not across the tree | qualified: within that schema, before its own `items` are walked and its `examples` held to it; across a tree the walk names the FIRST problem it meets, and a problem under an earlier `properties` sub-schema comes first |

**The provocations, re-run after the readers' items** (the set re-run, workflow section 5 rule 8; in the byte copy synced from
the real tree, each edit asserted to change its file, each restore digest-checked; harness `C:/tmp-w164/mutate2.py`, NOT in
the tree): the no-edit CONTROL **EXIT 0** at 1718; **48 of 48 KILLED** — the build's 29 again, and **19 from the readers'
findings**, the adequacy reader's survivors reconstructed from its descriptions: R1 `writeOnly` drops the numeric bounds,
R2 `readOnly` disables `additionalProperties`, R3 a `title` drops `required`, R4 `fits` ignores a `writeOnly` consumer's
bounds (each KILLED by the F1 cases); R5 the shapes skipped at depth >= 2, R6 `findings` not walking a `writeOnly`
sub-schema, R7 `schemaProblem` not walking one (F2); R8 the witness of a `writeOnly` string empty, R9 a `readOnly`
property's witness `null`, R10 `tsTypeOf` emitting `readonly`, R11 a JSDoc from `description` (F4); R12 the DRIVER
redacting a `writeOnly` result key (F5 — KILLED by the run case alone, not by a crash); R13 the registry, R14 a gate type,
each stripping the four before the check (F6); R15 `readOnly` admitting `"false"`, R16 `writeOnly` admitting `{}` (F3);
R17 the shapes checked after `items` (F7); R18-R19 the spec's shape column changed (F8). Each was killed by the case
written for it.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `schema.ts`: the four in `SCHEMA_KEYWORDS`, the two shape checks | `src/definition/schema.ts` | the W164 suite (K1-K4, S1-S9, R5, R15-R17) and `assist.test.ts`'s membership case |
| (2) spec v0.36 and its README row | | the keyword-list case (the table both ways, the annotation marks, the shape column — T1-T3, R18-R19); `check:spec` `C8` |
| (3) ADR 0098 | | `check:register` `R6`-`R7` (front matter, `supersedes`, `amends`) |
| (4) `AGENTS.md`: the executed block, the paragraph, section 11's row | | `check:docs` `X3`/`X4` on the block (the four admitted, `writeOnly: 'yes'` and `format` refused); the prose NOTHING mechanical — the readers |
| (5) L1 tests and the census | | `l4-corpus`'s suite census |

**`git diff --name-only` against `Owns`**, on the final tree: 9 modified and 2 new files — `AGENTS.md`, `spec/README.md`,
`spec/flow-definition.md`, `src/definition/schema.ts`, `test/definition/assist.test.ts`, `test/definition/l4-corpus.test.ts`,
`test/definition/schema.test.ts` (Owns); `doc/decisions/0053-*` and `doc/decisions/0056-*` (the record step); new
`doc/decisions/0098-*` (Owns) and this file. `scripts/check-docs.mjs` is in the row and is not edited. Nothing is undeclared.

**Predictions, as measured.** P37 prediction 4 **TRUE** at L1-L5 — exactly fact 3's four sites moved (M2) — and at L6 in
node; in deno one flaking row no schema keyword reaches (below).

**What broke.**

1. **The first provocation CONTROL came back RED** — the runner filtered to `test/definition/` breaks `l4-corpus`'s census; the
   control is what showed the harness invalid before any verdict was read.
2. **"Constrains nothing" was barely pinned at the build**: 18 of the adequacy reader's 23 independent mutations survived,
   because the build's provocations broke the rule's CLAUSES (the list, the shapes, one reader each) and not the SHAPES it
   quantifies over — every constraining keyword, both value checks, the generators, the registry and gate roads, a run
   (workflow section 5 rule 8 obligation (a), *and the SHAPES they quantify over*). Each now has a case; 48 of 48 killed.
3. **Four counts were written into comments** (C-F1, C-F2) — the rule CLAUDE.md states, broken by its author.

**What this taught.** Nothing proposed here; the retro decides.

**Questions.** Raised: none. Closed: none. **Q623-Q625 released unused.** ADR 0098 issued. **Exceptions**: none.
**Stop-and-ask S1** ASKED at READY-FOR-READERS, ANSWERED 2026-10-16 *leave and record*.

**The flake (M2), for the readers and the retro.** `test:l6:deno`, row *uncloneable / OR-R6, threaded*: five assertions
failed on one run (the run `running` at the read, no `user_action` record, the live task carrying `()=>1 could not be
cloned.`), and the same tree passed on the next run and in M3's gate. One occurrence; not raised (workflow section 6 pass
3 rule 2's bar is two).
