# W211 — `definitionSchema(registry)`: a definition's shape specialised to one registry

**Status:** done 2026-10-24 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; no stop-and-ask, no exception used, no ADR, no question raised. Earlier: declared 2026-10-24 on `d155bed`, P43's FOURTH item: (a1), (b1) as answered; decisions 1-4; fact 2; this file written from the plan's row BEFORE any other edit
**Plan:** [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) — *what do a flow and a run say
as data rather than as prose?* — and this is its FOURTH item: pass 4 #1's second bullet, *"ideally, one specialised to a
registry (Node Types with their settings and input schemas, gate types and their routes), for example
`definitionSchema(registry)`"*.

```
Spec:       spec/flow-definition.md v0.50 -> v0.51 — section 1's *The definition's shape as a schema* gains the registry
            form (what it carries, what it cannot cleanly carry, its soundness claim against ITS registry), the status
            block's v0.51 entry; spec/README.md's row.
Owns:       from P43's W211 row, exactly: src/definition/definition-schema.ts and
            test/definition/definition-schema.test.ts (W210's module and suite), test/definition/l4-corpus.test.ts
            (counted), spec/flow-definition.md (v0.51), spec/README.md, AGENTS.md (the WHOLE file, sentence D′),
            scripts/check-docs.mjs (RUN_FLOOR only), doc/decisions/0133-* (expected unused); this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files; P43's plan
            file is not touched (its Record is W212's). src/definition/validate.ts and src/definition/registry.ts are
            READ, never written (D′: "a registry-derived set is taken from the function the validator uses"). Anything
            else found to need an edit is a STOP-AND-ASK.
Inputs:     P43 decisions 1-4, fact 2 (its registry-specialisable and not-cleanly rows), (a1), (b1); ADR 0053, ADR 0092,
            ADR 0132; spec/flow-definition.md sections 1-3 and 5's rule table; W210's Record (the chromium lane at ~55 s
            of its 60).
Outputs:    (1) src/definition/definition-schema.ts — `definitionSchema(registry?: Registry): DefinitionSchema`. With
                no argument, byte-identical in behaviour to W210's. With a registry: the registry is first held to
                `checkRegistry` (the check `new Driver` runs) and one it refuses THROWS that refusal — never
                specialised; then the static schema plus a task's `type` enum with one `if`/`then` per node type (its
                `pool` enum, its worker's `settingsSchema`, a transform-only type's required `transform`, its
                worker's `inputSchema` as an ANNOTATION), `workerGroups` from the registry's groups, `transform.lang`
                from its languages, a predicate name from its predicates, a gate's `type` enum with one `if`/`then`
                per gate type (its `settingsSchema`, and a STATIC type's `route` enum). Every keyed registry set is
                read through the validator's own function (`nodeTypesOf`, `workersOf`, `poolsOf`, `languagesOf`,
                `gateTypesOf`, `routesOf`, `onlyTransforms`, the subset's `findings`); the groups and predicates by
                `new Set(...)` (the validator's `asSet` is private) and a type's defaults by their own keys. Its root `description` names
                what it carries and what it cannot cleanly carry (fact 2's not-cleanly row), and the authority.
            (2) tests: L1 cases added to test/definition/definition-schema.test.ts (no new suite).
            (3) spec/flow-definition.md v0.51, spec/README.md; AGENTS.md section 3's *The definition's SHAPE, as data*.
            ADR 0133 or the statement that none is needed.
Depends on: W210 (d155bed)
Blocks:     W212
Tests:      Outputs (2). Against spec/examples/registry.json: every valid corpus flow ACCEPTED; every registry-
            specialisable invalid file REFUSED beside its one-clause repair ACCEPTED, and the STATIC form not refusing
            it (the specialisation is what refuses); every other invalid file accepted; each not-cleanly row pinned
            NOT refused with the validator's refusal of the same document as its control; a registry checkRegistry
            refuses throws; the schema the same for a registry's Map and object forms; never refusing what
            validateDefinition accepts against the same registry, with a positive control. Expected lists from
            section 5's rule table and fact 2, written before the first run.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs or
            doc/questions/README.md); `npm run gate` before the readers (sentence C); then the conformity reader and
            the adequacy reader, workflow section 6. **The chromium lane's wall stated** — the whole bundle has 60 s.
Reserves:   Q776-Q777, ADR 0133
```

## Scope

**In**

1. **The registry form and its module change** — Output (1).
2. **The cases** — Output (2).
3. **The record** — Output (3).

**Out** — named rather than left implicit, with where it goes instead

- **Any change to `validateDefinition`'s verdicts** — the schema follows the validator, never the reverse; a gap is
  [Q774](../questions/q774.md)'s territory and is not resolved here.
- **A published `.schema.json`** ((a3)) and **a runtime JSON Schema validator** (ADR 0053) — refused by the plan.
- **The cross-node `FD-V` rules in a schema** — P43 Scope's *Out*.
- **The L6 block, the reply, P43's close** (W212); the version bump, the push, the publish ((h1)).

## Predictions, written before the change

1. **P43 prediction 6**: the registry form refuses `FD-V31`, `FD-V32`, `FD-V35`, `FD-V38` and `FD-V39`'s files and not
   `FD-V33`'s, `FD-V36`'s or `FD-V41`'s. *(Written down as the plan wrote it; this item's reading of fact 2 is that
   `FD-V33`'s file — `factor: "ten"` against a schema saying a number — IS refused, because a type's `settings` schema
   is in fact 2's registry-specialisable row and only the defaults' weakening is in its not-cleanly row.)*
2. The registry form refuses `FD-V4`'s and `FD-V46`'s files too (fact 2's row names both), and not `FD-V40`'s
   `if`-condition file (a gate type's `settingsProblem` is code).
3. No existing verdict, composed value or count moves; the static schema is unchanged; L6 2,847 / 0 unmoved.
4. The chromium lane stays under 60 s with the cases added.

## Verification

`npm run gate` on the draft before the `Owns` are fixed (B′); `npm run gate` before the readers; the two readers in
their own worktrees under `C:/tmp-w211/`; then `npm run gate:item` once, on the final tree, held still. **Routing
coverage**: not applicable — the item adds a reading of a definition's shape and no routing; no `user_action` (Q17),
map (Q6), routed-away branch (Q4), unmatched decision (Q10) or task id (Q13) moves.

## Record

*Filled 2026-10-24, after both readers and the confirming gate. Harnesses and logs in the session scratchpad's `w211/`
(`mutate.mjs`, `mut-1.log`-`mut-3.log`, `gate-m1.log`, `gateitem.log`, `wall-*.txt`); the readers' in
`C:/tmp-w211/rc-scratch` and `C:/tmp-w211/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — the change built in the byte copy `C:/tmp-w211/m` (code, cases, spec v0.51, `AGENTS.md`, this file) and every lane run before the `Owns` were fixed | RAN — `npm run gate` **EXIT 0**, 00:44:38 → 00:52:57 (`w211/gate-m1.log`) | L1-L5 **100 files / 2,266 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; `check:docs` 54 `run` (the existing snippet extended, none added — `RUN_FLOOR` unmoved, the self-tests that read it not re-run here); L6 **2,847 / 0** over 238 real runs in node and deno. The `Owns` held as declared: nothing outside them changed |
| the author's mutation sweep (`w211/mutate.mjs`, rule 8) | RAN, three passes | 50 probes, a CONTROL (survives) and a CRASH grader probe (crashes), each graded on its failure line: **45 KILLED**, 2 CRASH (`M23` relax without a copy, `M34` an enum on a derived type — both fail the import, `M23` because cfworker writes into the frozen built-in schema it would alias), 1 SURVIVED: `M30` (`if` without `required: [type]`), **EQUIVALENT** — `type` is required on a task and on a gate, so a node lacking it is refused before any branch matters. The first pass's two test gaps (`M15` the walk into nested properties, `M22` an aliased `inputSchema`) were closed before the readers |
| conformity reader (`C:/tmp-w211/rc`) | RAN | 0 BLOCKER, 2 SHOULD, 3 NIT, below; 35 constructed probes and a random sweep (6 seeds, ~3,400 validator-accepted documents each, random subset settingsSchemas and gate types): 0 unsound but for SHOULD 1 |
| adequacy reader (`C:/tmp-w211/ra`) | RAN | 88 probes: 65 KILLED, 3 CRASH, 20 SURVIVED (two positive controls survived, the grader control crashed); 0 BLOCKER, 4 SHOULD, 4 NIT, below |
| the readers' survivors re-cut on the acted-on tree (`mutate.mjs`'s `R-` probes, `w211/mut-3.log`) | RAN | **14 of 14 KILLED** — V33c, ML7, ML8, V40c, V39c, V31c, V4c, IN3c, D3, D4, Z2, T9, T5, T6 |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 01:09:07 → 01:36:04 (`w211/gateitem.log`) | lint; typecheck; every check, `check:docs` 54 `run` snippets, C4 45; L1-L5 **100 files / 2,267 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; selftests **10/10 ok** (1,142.3 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and the Status line — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**The chromium lane's wall** (the whole bundle has 60 s; `w210/chromium-wall.mjs`, in the page): **56.1 s on `d155bed`**
this session (W210 recorded 55.0 s on the same tree — the lane moves ~1 s between runs), the suite 0.59 s; **56.7 s and
57.5 s on the final tree** (two runs), the suite **0.79-0.89 s**. **Headroom left for W212 and every later item: ~2.5-3.3 s.**
The P39/P40 map-cost suite alone is 34.0 s of it.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `definitionSchema(registry?)` — `checkRegistry` first, the per-type and per-gate-type branches, the four enums, the root description | yes | the eleven `W211 —` cases; `AGENTS.md`'s snippet (`check:docs` X4) |
| (2) the cases, in the W210 suite (25 cases; no new suite, so `l4-corpus.test.ts`'s census line did not move) | yes | the suite's own count case |
| (3) spec v0.51, `spec/README.md`, `AGENTS.md` | yes | `check:spec`, `check:docs` |
| ADR 0133 | **not written** — no rule moves; the registry form's choices are spec v0.51's (ADR 0132 consequence 5 left the form to this item). ADR 0133 SPENT, unissued | — |

**Predictions.** 1 **FAILS as the plan wrote it, HOLDS as this item read it**: `FD-V33`'s file IS refused (a type's
`settings` schema is fact 2's registry-specialisable row); `FD-V36`'s and both `FD-V41` files are not. 2 **HOLDS**: `FD-V4`'s
and `FD-V46`'s files refused, `FD-V40`'s `if`-condition file not. 3 **HOLDS**: no verdict moved; `definitionSchema()`
byte-identical to `d155bed`'s (22,082 bytes, the conformity reader); L6 2,847 / 0. 4 **HOLDS**, with ~3 s left.

**Fact 2, re-taken file by file.** As the plan says, with no file moving class: eight files refused by the registry
form and accepted by the static one (`FD-V4`, `31`, `32`, `33`, `35`, `38`, `39`, `46`); every other invalid file as the
static form has it. **One row ADDED to *not cleanly***: a `minLength` above 1 in an embedded registry schema, emitted as
⌈n/2⌉ — the subset counts UTF-16 units, 2020-12 code points. **It corrects P43 fact 3**'s *a node type's `settingsSchema`
embeds in a 2020-12 document as it stands*: it does but for that keyword. **Re-take: a derived gate type's routes cannot
be enumerated** for any settings — they are a function of each gate's settings, and no 2020-12 keyword reads one
instance value as another's enum. *(`FD-V41`'s exactly-once wiring for a STATIC type is expressible with
`contains`/`minContains`/`maxContains`; fact 2's classification was kept, and the schema names it as not carried.)*

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | under cfworker 4.1.1 the registry form refuses, or throws on, settings the validator accepts where a registry schema names a property after an `Object.prototype` member (`__proto__`, `constructor`, `toString`, nested `valueOf`, a gate type's `hasOwnProperty`) — cfworker tests `key in instance`; the schema is correct 2020-12 | **NAMED** — the soundness sentence in spec v0.51 is now stated under 2020-12's semantics, with the `in`-testing validator and the prototype names; `AGENTS.md` gains a *mind* row. Not handled in code: dropping such a property is unsound beside `additionalProperties: false`, and the defect is the validator's |
| conformity SHOULD 2 | the v0.51 entry's *ADR 0132 governs both forms* contradicts ADR 0132 consequence 5; fact 3's premise falsified unsaid | **FIXED** — the entry reworded (no ADR: no rule moves, the choices are the spec's); fact 3's correction stated there and above |
| conformity NIT 3 | *every registry-derived set through the validator's function* overstated: groups and predicates by `new Set`, the defaults by own keys | **FIXED** — the claim narrowed in the module, the spec and this file's Outputs |
| conformity NIT 4; adequacy NIT 1 (D4) | the top-level-keyword clause missing from `AGENTS.md`'s row and from the description's checked phrases | **FIXED** — the row; the phrase list grows to 14, counted |
| conformity NIT 5 | `FD-V39`'s settings-revealed clauses not named | **FIXED** — the spec's not-cleanly row names them |
| adequacy SHOULD 1 | the soundness claim's constructed half rests on one closed settingsSchema and three built-in gate types (V33c, ML7, ML8, V40c, IN3c survived) | **FIXED** — a new case over five registry shapes (an open settingsSchema, a consumer gate type accepting `{}` with no settings in object and Map form, settings beside an `inputSchema`, lists), with a same-observer control; `maxLength` and depth-2 rows; re-cut **KILLED** |
| adequacy SHOULD 2 | gateTypes as a Map, groups and predicates as lists untested (V39c, V31c, V4c) | **FIXED** — both forms held to the same schema; re-cut **KILLED** |
| adequacy SHOULD 3 | *definitionSchema() unmoved* compared the function with itself | **FIXED** — the static form held to carry none of the additions and W210's own description; Z2 re-cut **KILLED**. Z1 (a `$comment` added, no verdict moved) is DECLARED: the conformity reader measured the result byte-identical to `d155bed`'s, and the suite does not pin bytes |
| adequacy SHOULD 4 | three uncounted loops (T9, T5, T6) | **FIXED** — each counts its iterations; re-cut **KILLED** |
| adequacy NIT 2 | the corpus registry's control was identity between two calls | **FIXED** — equal to the first result, with a type enum |
| adequacy NIT 3 | the uncopied gate settings caught by an import CRASH | **DECLARED** — the shallow-copy re-cut is KILLED by the sharing case |
| adequacy V33f, V33j | `in` for `own`; a redundant `type` | **DECLARED** — lenient direction only; equivalent |
| adequacy observation | NOT_CLEANLY's controls are the validator, not the schema's own observer | **DECLARED** — the same observer is shown refusing on each sibling path (the route enums, the strict `minLength` copy, the open schema's `factor: "x"`) |

**Decisions taken by this item** (within P43's delegated shape): the registry form as `definitionSchema`'s optional
argument, not a second function; `checkRegistry` first, its refusal rethrown; `required` weakened by the defaults'
keys, and `settings` required where any is left; `minLength` halved, rounded up; the `inputSchema` at `$defs.inputSchema` in
its type's branch (a `$defs` member constrains nothing and every 2020-12 validator accepts it, where an unknown keyword
would fail a strict one); the cases in W210's suite under W211's name prefix, so no census moves; no ADR.

**What broke.** At no rung of the product. The soundness claim's constructed half, too narrow on the first green tree,
shown by the ADEQUACY reader; and the claim's dependence on a validator reading `properties` as 2020-12 says, shown by
the CONFORMITY reader by construction.

**What this taught.** *For the retro*: W210's lesson — **a claim of absence over a space is only as wide as the values
the probe can write** — recurred one level out: the sweep wrote every registered NAME but only one REGISTRY, and five
over-refusals lived in registry shapes the corpus never takes. And **an emitted schema's soundness is relative to the
reader's semantics**: the oracle the suite trusts (cfworker) diverges from 2020-12 on `properties` over prototype names.

**Questions raised.** None — Q776-Q777 SPENT, unissued. **Closed.** None. **ADR 0133** SPENT, unissued. **Declared
exceptions**: none used.

**The readers' overlap.** **TWO** — how the groups and the predicates are read (conformity NIT 3, a wording; adequacy
SHOULD 2, an untested list form), and the top-level-keyword clause (conformity NIT 4 in `AGENTS.md`; adequacy NIT 1 in the
description's checked phrases): two subjects, each with two different findings.

**Leftover worktrees.** `C:/tmp-w211/m` (the B′ draft, with the acted-on change), `rc` and `ra` (git worktrees at `d155bed`
with the pre-reader change applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with
`C:/tmp-w211/rc-scratch` and `ra-scratch` — left for the maintainer; not removed with `--force`.
