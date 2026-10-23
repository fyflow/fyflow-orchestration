# W210 — `definitionSchema()`: a definition's static shape as a JSON Schema, a test-only validator, ADR 0132

**Status:** done 2026-10-24 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record), after THREE asked stop-and-asks ((a) `deno.lock`'s one line, (b) `validate.ts`' four further constants, (c) a missing description an L1 throw), each answered as recommended by the coordinator under P43 (h); both readers RAN, every finding acted on or declared; Q774 raised. Earlier: declared 2026-10-23 on `ceecb90`, P43's THIRD item: (a1), (b1) as answered; decisions 1-4, 9; facts 1-3; this file written from the plan's row BEFORE any other edit
**Plan:** [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) — *what do a flow and a run say
as data rather than as prose?* — and this is its THIRD item: pass 4 #1, the static half — a definition's shape as a
JSON Schema an agent, a host and the app's guide can read.

```
Spec:       spec/flow-definition.md v0.49 -> v0.50 — section 1's new subsection *The definition's shape as a schema*
            (what it carries, what it does not, the authority sentence), the status block's v0.50 entry;
            spec/README.md's row.
Owns:       from P43's W210 row, exactly: a new module src/definition/definition-schema.ts,
            src/definition/validate.ts (exporting or sharing ID_RE, KINDS only), index.ts, deno.json (publish list;
            imports only as decision 3 takes it), package.json (devDependencies only), package-lock.json, a new suite
            test/definition/definition-schema.test.ts, test/definition/l4-corpus.test.ts (counted),
            spec/flow-definition.md, spec/README.md, AGENTS.md (the WHOLE file, sentence D′), scripts/check-docs.mjs
            (RUN_FLOOR only), doc/decisions/0132-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files carry ADR
            0132; P43's plan file is not touched (its Record is W212's). Anything else found to need an edit is a
            STOP-AND-ASK.
            Exception ASKED and answered YES (2026-10-23, before the edit — workflow section 1 rule 6; the coordinator
            taking option (a1) under P43 (h)): deno.lock, ONLY the one line "npm:@cfworker/json-schema@4.1.1" in its
            packageJson.dependencies, written by deno itself (stop-and-ask (a)).
            Exception ASKED and answered YES (2026-10-23, before the edit — option (b1), the coordinator under P43 (h)):
            src/definition/validate.ts beyond "ID_RE, KINDS only" — four COPIES, NODE_KEYS_REQUIRED, EDGE_KEYS_REQUIRED,
            DOC_KEYS_DECLARED, ROUTABLE_STATES; constants only, no logic moves. The coordinator's refinement — shared
            with the schema module but NOT on index.ts's root surface — cannot be met as written: index.ts re-exports
            validate.ts WHOLE (`export *`), so every export of it is public. Judged public, and ADR 0132 rule 1 says why.
            Answered (c1), the coordinator under P43 (h): a missing description or schema is an L1 failure (a throw at
            build), not L0; the Record says so.
Inputs:     P43 decisions 1-4, 9, facts 1-3, stop-and-asks (a1), (b1) ANSWERED 2026-10-23; ADR 0053, ADR 0056,
            ADR 0098, ADR 0131; spec/flow-definition.md sections 1-3 and 5's rule table; W209's Record.
Outputs:    (1) src/definition/definition-schema.ts — `definitionSchema(): DefinitionSchema`, a plain JSON Schema draft
                2020-12 object, a new one per call, BUILT from the validator's exported key sets with a hand-written
                description per key; a key with none (or with no schema) makes it THROW naming the key; its root
                description names validateDefinition and runtime.check as the authority for every rule it does not
                carry. The type `DefinitionSchema`.
            (2) src/definition/validate.ts — `ID_RE` and `KINDS` exported (the row's two), and — see stop-and-ask (b)
                — four COPIES the schema's `required` lists and `on` enum read: `NODE_KEYS_REQUIRED`,
                `EDGE_KEYS_REQUIRED`, `DOC_KEYS_DECLARED`, `ROUTABLE_STATES`. No logic moves.
            (3) index.ts — one export line; deno.json — the module in the publish list, NO `imports` entry
                (decision 3's measurement, re-take 3).
            (4) package.json — `@cfworker/json-schema` 4.1.1 in devDependencies, pinned EXACT; package-lock.json.
            (5) tests: L1 in test/definition/definition-schema.test.ts (counted in l4-corpus.test.ts), the vendored
                2020-12 meta-schema inside it (re-take 5).
            (6) ADR 0132; spec/flow-definition.md v0.50, spec/README.md; AGENTS.md section 3's *The definition's
                SHAPE, as data* with a `run` snippet, RUN_FLOOR 53 -> 54.
Depends on: W209 (ceecb90)
Blocks:     W211
Tests:      Outputs (5). Expected verdicts from spec/flow-definition.md section 5's rule table and P43 fact 2 (re-taken
            file by file, re-take 4), written before the first run; every refusal beside its one-clause repair,
            accepted; the oracle a real 2020-12 validator over the hand-written corpus, never the key constants.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs
            or doc/questions/README.md); `npm run gate` before the readers (sentence C); then the conformity reader and
            the adequacy reader, workflow section 6.
Reserves:   Q774-Q775, ADR 0132
```

## Scope

**In**

1. **The schema and its module** — Outputs (1)-(3).
2. **The test-only validator and the suite** — Outputs (4), (5).
3. **The record** — Output (6).

**Out** — named rather than left implicit, with where it goes instead

- **`definitionSchema(registry)`**, the registry-specialised form — W211.
- **A published `.schema.json` file** ((a3)) and **a runtime JSON Schema validator** (ADR 0053, unmoved) — refused by the plan.
- **The cross-node `FD-V` rules in a schema** — P43 Scope's *Out*; they stay `validateDefinition`'s, and the schema says so.
- **The L6 block and the reply** (W212); the version bump, the push, the publish ((h1)).

## Predictions, written before the change

1. **P43 prediction 4**: the static schema refuses every shape-only invalid file and accepts every valid flow on its
   first green run; a file that does not move as fact 2 says moves class, at most two such files.
2. **P43 prediction 5**: `@cfworker/json-schema` bundles for chromium, adds under 50 KB to the test bundle, and the
   suite costs under 1 s of the 60 s budget.
3. No existing verdict, composed value or count moves; L6 2,847 / 0 unmoved.

## What the declaration step re-took, before the `Owns` were fixed

*Taken 2026-10-23; logs in the session scratchpad's `w210/`. Byte copies: `C:/tmp-w210/base` (clean at `ceecb90`) and
`C:/tmp-w210/m3` (the draft), git worktrees with `node_modules` COPIED; 0 links, 0 reparse points.*

| # | re-take | measured |
|---|---|---|
| 1 | the ladder counts — `npm run gate` on `ceecb90` in `C:/tmp-w210/base`, EXIT 0, 22:17:17 → 22:25:21 (`w210/gate-base.log`) | L1-L5 **99 files / 2,242 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; `check:docs` **59 snippets, 53 `run`**, 6 `check`; C4 45 |
| 2 | fact 3's bundle figure at the pin — `@cfworker/json-schema` 4.1.1 (the latest, 2025-01-31; no dependencies), installed `-D -E` in `m3`, a one-case probe suite importing it | the chromium bundle **4,911,312 → 4,954,114 bytes, +42,802** (ADR 0053 priced 42,516 for the library alone); it bundles with no change to `scripts/build-browser-tests.mjs` |
| 3 | deno's route (decision 3) | **Deno resolves the bare specifier from `package.json` and `node_modules` with NO `deno.json` `imports` entry** — the probe ran green on deno 2.9.6. `deno publish --dry-run --allow-dirty`: EXIT 0, the 29 files the `publish` list names and no other, no mention of the package — **nothing JSR publishes reaches it**. No lane it cannot run in. **But every `deno` command then WRITES `deno.lock`**: its `packageJson.dependencies` list gains `"npm:@cfworker/json-schema@4.1.1"` — a file outside the row (stop-and-ask (a)) |
| 4 | fact 2's classification, file by file (55 invalid files, 27 valid) | as fact 2 says, with ONE file moving class: `FD-V40--gate-key-path-with-an-index` is REFUSED by the static schema — the library resolves `key` on every gate, so its grammar needs no registry; fact 2 left `FD-V40` unclassified. `FD-V8`'s and `FD-V9`'s files are refused by their rules' shape clauses (fact 2's *partly shape*). 25 refused: the 22 files of the fifteen shape-only rules and those three |
| 5 | the 2020-12 meta-schema check the row names | **cfworker 4.1.1 ships NO meta-schema.** The eight published documents (10,183 bytes) are vendored as test data; and with them as published cfworker does not follow `$dynamicRef: "#meta"` into a nested schema — `{ properties: { a: { type: "strin" } } }` and `{ $defs: { d: { enum: 3 } } }` ACCEPTED, a top-level `{ type: 5 }` refused. Read as a `$ref` to the dialect's own schema (what it names when nothing extends the meta-schema), both are refused |
| 6 | every check reading `package.json`'s dependency lists (`check:scheduler`, `check:source`, `pack-smoke`'s `P5`) | re-read: `check:scheduler` D1-D3 refuse a `file:` dependency, an import-map path and a link — none here; `S7` reads `src/` and `index.ts` only; `P5` compares the installed package's exports with the entry's both ways and so moves no literal |
| 7 | B′ — the change built in `m3` (code, suite, spec v0.50, ADR 0132, `AGENTS.md` with a `run` snippet, `RUN_FLOOR` 54, this file) and every lane run | first `gate` **EXIT 2** at `typecheck:tests` (two casts in the suite, fixed); second **EXIT 1 at chromium**: `the suite never reported: Timeout 60000ms` — re-take 8; after it, `npm run gate` **EXIT 0**, 22:49:30 → 22:57:17 (`w210/gate-m3-3.log`): L1-L5 **100 files / 2,254 cases** in node, deno and chromium (parity); every check EXIT 0; `check:docs` **60 snippets, 54 `run`**; C4 45; L6 **2,847 / 0** in node and deno. Then the self-tests less the register lane, **EXIT 0, 10/10 ok**, 22:57:30 → 23:16:00 (`w210/self-m3.log`). **Outside the row**: `deno.lock` (re-take 3) and four `validate.ts` exports beyond the row's two — stop-and-ask (a), (b) |
| 8 | the chromium lane's wall — the WHOLE bundle has 60 s (`scripts/run-browser-tests.mjs`'s wait), measured in the page per suite (`w210/chromium-wall.mjs`, `w210/wall-*.txt`) | **the lane was ALREADY at 53.6-54.1 s on `ceecb90`** (three runs), the P39/P40 map-cost suite alone 33.6 s. The first draft's suite took **2.8 s** and pushed later suites **~5 s** slower (GC), **61.6 s — over the budget**. Short-circuiting the validator, three wrong values in place of six, the validator asked only where the schema refused, and the sweep asking the schema of the mutated NODE alone: the suite **0.46 s**, the lane **55.2 s** — held, with **4.8 s** left for W211 and every later item |

### Stop-and-ask — before the edit (re-takes 3, 7 and the row's Gate)

| | the question | options | recommended |
|---|---|---|---|
| **(a)** | **`deno.lock` is outside the row and must change.** With the devDependency in `package.json`, EVERY `deno` command (`lint`, `typecheck:deno`, `test:deno`) writes one line into its `packageJson.dependencies`, `"npm:@cfworker/json-schema@4.1.1"`; left out, the gate dirties the tree. `check:scheduler` D9 reads only the `jsr` block, and stayed green | **(a1)** YES — one exception: `deno.lock`, ONLY that one line, written by `deno` itself. **(a2)** NO — then the devDependency cannot be declared, and decision 3 and (b1) cannot be met | **(a1)** |
| **(b)** | **`validate.ts` beyond the row's *"`ID_RE`, `KINDS` only"*.** Decision 1 builds the schema from the validator's key sets; the REQUIRED halves are not exported — `NODE_KEYS`' `req`, `EDGE_KEYS`' `req`, `DOC_KEYS` — and nor is `on`'s list (`ROUTABLE`) | **(b1)** export four COPIES beside the two — `NODE_KEYS_REQUIRED`, `EDGE_KEYS_REQUIRED`, `DOC_KEYS_DECLARED`, `ROUTABLE_STATES` — constants only, no logic moves, new public names (additive, 0.11.0), stated in the spec's v0.50 entry and ADR 0132. **(b2)** NO — write those four lists by hand in the schema's module: a second copy of `FD-V23`'s and `FD-V18`'s lists, which decision 1 exists to prevent | **(b1)** |
| **(c)** | **The row's Gate says *a missing description an L0 failure*; it can be L1 only.** The key sets are typed `readonly string[]` (`EDGE_KEYS_DECLARED`, `NODE_KEYS_DECLARED`, …), so no type can see a key without an entry; narrowing them to literal tuples would make `EDGE_KEYS_DECLARED.includes(someString)` a type error in a consumer's code — BREAKING | **(c1)** `definitionSchema()` THROWS naming a key with no description or no schema, every lane's L1 builds it, and a case provokes it (pushes an undescribed key, restores) — the Record says L1. **(c2)** narrow the exported sets' types — BREAKING, and outside the row | **(c1)** |

*Not asked, decided within the row*: the vendored 2020-12 meta-schema (re-take 5) goes INSIDE the suite file rather than
in a helper beside it, so the item adds the ONE suite the row names and W211, which owns "W210's module and suite", owns
it too.

## Verification

`npm run gate` before the readers; the two readers in their own worktrees under `C:/tmp-w210/`; the readers'
survivors re-cut by the author; then `npm run gate:item` once, on the final tree, held still. **Routing coverage**: not
applicable — the item adds a reading of a definition's shape and no routing; no `user_action` (Q17), map (Q6), routed-
away branch (Q4), unmatched decision (Q10) or task id (Q13) moves.

## Record

*Filled 2026-10-23, after both readers and the confirming gate. Harnesses and logs in the session scratchpad's `w210/`;
the readers' in `C:/tmp-w210/rc-scratch` and `C:/tmp-w210/ra-scratch` (the author's re-cut is `ra-scratch/mutations3.mjs`).*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — every lane on the draft before the `Owns` were fixed (re-takes 7, 8), and the self-tests | RAN — `gate` EXIT 2, then EXIT 1 (chromium over its 60 s), then **EXIT 0**; self-tests less the register lane **EXIT 0, 10/10** | three stop-and-asks, answered (a1), (b1), (c1) before the edit (Exceptions) |
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0**, 23:18:45 → 23:26:38 (`w210/gate-1.log`) | L1-L5 **100 files / 2,254 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; `check:docs` **60 snippets, 54 `run`**; C4 45; L6 **2,847 / 0** in node and deno |
| conformity reader (`C:/tmp-w210/rc`) | RAN | 1 BLOCKER, 2 SHOULD, 4 NIT, below |
| adequacy reader (`C:/tmp-w210/ra`) | RAN | ~110 mutations KILLED, a control SURVIVED (its right verdict); 1 BLOCKER, 3 SHOULD, NITs, below; no finding against the code by construction (157 values) |
| the author's re-cut, after acting (`ra-scratch/mutations3.mjs`, `w210/recut-3.log`, `recut-4.log`) | RAN, on the acted-on module and suite | 42 probes and a control (`mutations3.mjs`, `mutations4.mjs`): **40 KILLED**, the control SURVIVED; SURVIVED `B1-of-any` (declared: `of`'s charset is `FD-V2`/`FD-V6`'s, not carried) and `T18` (declared: the partition's claim has a second observer, which holds it); every reader survivor below re-cut KILLED or declared |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 23:56:22 → 00:23:01 (`w210/gateitem.log`) | lint; typecheck; every check, `check:docs` 60 snippets, **54 `run`**, 6 `check`, C4 45; L1-L5 **100 files / 2,256 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; selftests **10/10 ok** (1,129.8 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and the Status line — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**The chromium lane's wall** (the whole bundle has 60 s): **53.6-54.1 s on `ceecb90`**, the P39/P40 map-cost suite alone
33.6 s; **55.0 s on the final tree**, this suite **0.57 s** (`w210/chromium-wall.mjs`). **Headroom left for W211 and every
later item: ~5.0 s.** The first draft's suite, 2.8 s, made later suites ~5 s slower in GC and took the lane to 61.6 s —
over; the cut is a short-circuiting validator, three wrong values, the validator asked only where the schema refused, and
the sweep asking the schema of the mutated node alone.

**Decision 3's measurements.** `@cfworker/json-schema` **4.1.1**, pinned exact, no dependencies: **+42,802** bytes to the
chromium bundle; Deno resolves it from `package.json` with **no** `deno.json` `imports` entry, writing one `deno.lock` line
(Exception (a1)); `deno publish --dry-run` names only the `publish` list's files; no lane it cannot run in. **It ships no
2020-12 meta-schema**: the eight documents are vendored as data inside the suite, `$dynamicRef: "#meta"` read as a `$ref`
(re-take 5).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `definitionSchema()`, `DefinitionSchema`, a description per key, the throws, the root authority sentence | yes | every case of `definition-schema.test.ts`; `AGENTS.md`'s snippet (`check:docs` X4) |
| (2) `ID_RE`, `KINDS` and four more, each a COPY | yes | `typecheck` (the module imports them); the suite's key-set case |
| (3) `index.ts`'s line; `deno.json`'s `publish` entry | yes | the suite and `AGENTS.md`'s snippet import from the root; `pack-smoke` P5 / the JSR smoke compare exports |
| (4) the devDependency, pinned exact; `package-lock.json`; `deno.lock`'s line | yes | the suite's import in all three runtimes |
| (5) the suite (14 cases), counted in `l4-corpus.test.ts` | yes | `LATE_SUITES` (the census case) |
| (6) ADR 0132; spec v0.50; `spec/README.md`; `AGENTS.md`; `RUN_FLOOR` 54 | yes | `check:register`, `check:spec`, `check:docs` |

**Predictions.** 1 **HOLDS**: every valid flow accepted and every shape-only file refused on the first green run; ONE file
moved class (`FD-V40--gate-key-path-with-an-index`, refused), within *at most two*. 2 **HOLDS in part**: it bundles and adds
42,802 bytes (under 50 KB); the suite costs 0.57 s of the lane (under 1 s) — but only after the cut, and the LANE had ~6 s
of its 60 left before this item. 3 **HOLDS**: no verdict moved; L6 2,847 / 0.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity BLOCKER B1; adequacy BLOCKER 1 | the soundness claim (*what the schema refuses, the validator refuses*) was FALSE — `of: null` on a join of no region and `["b", 5]` accepted by the validator, refused by the schema (conformity, by construction) — and the suite COULD NOT HAVE SEEN a nested over-strictness: the sweep writes whole keys, 13 tightenings survived, and its detector had no positive control (adequacy) | **FIXED** — `of` and a branch entry admit a non-string (`idOrNonString`), the gap raised as **Q774**; an ACCEPTS table (37 rows: each subset type and keyword, retryPolicy, version, `on`, length defaults, every operator, both of B1's documents), each accepted by both; the sweep's positive control (an over-strict copy reported unsound). Re-cut: all 13 tightenings and both B1 strictenings **KILLED** |
| adequacy SHOULD 2 | ~60 carried clauses deletable at 0 cost | **FIXED** — CLAUSES grows 19 → 105 rows over 21 rules, a count and a set; re-cut sample **KILLED** |
| conformity SHOULD S1 | *every pattern is read from the validator* was false: the reference tokens, the operator partition and the edge sites are written in the module | **FIXED** — the claim narrowed in the module, the spec, ADR 0132 and `AGENTS.md`; an operator-partition case holds every operator against the validator (L31-L33 re-cut **KILLED**) |
| conformity SHOULD S2 | `ID_RE` and `KINDS` exported LIVE — `KINDS.splice` moved verdicts | **FIXED** — exported as copies (a fresh `RegExp`, a frozen array); ADR 0132 says so |
| adequacy SHOULD 3 | the throw case a compound probe | **FIXED** — one probe per throw site (`pool` on a fanout, `predicate` in a comparison); D1, D5 re-cut **KILLED** |
| adequacy SHOULD 4 | *a new object per call* checked one level deep | **FIXED** — a deep reachability walk; `scalar` made per-use; O2 re-cut **KILLED**; O1 **EQUIVALENT** (the subset keywords are spread into new objects) |
| conformity NIT N1, N2 | the array form's and a gate edge's descriptions | **FIXED** |
| conformity NIT N3 | one schema object shared inside a result | **FIXED** (with SHOULD 4) |
| conformity NIT N4 | `package-lock.json`'s stale `version` 0.8.0 → 0.10.0, an `npm install` side effect | **DECLARED** — in `Owns`; the lock now names the package's own version |
| adequacy NIT T4, T5c, T16; T17 (author) | a filtered loop, a dropped row, an emptied ACCEPTS | **FIXED** — counts of rows RUN; re-cut **KILLED** |
| adequacy NIT T2, T9, T13, T14 | a repair touching two clauses; a redundant equality; an assertion deleted | **DECLARED** — T9 redundant by construction; T13/T14 delete the claim's own observer |
| adequacy NIT R8, R10, N11-N13b, N16, E16 | conveniences under rules not carried (`FD-V2`, `FD-V3`, `FD-V20`, `FD-V31`'s registry half) | **DECLARED** — `workerGroups`' three shape clauses are now CLAUSES rows (`FD-V31`), so N11-N13b are KILLED |
| adequacy, equivalents | L24, L28, L35, W1, N26, N27, D2-D4, D6; harness no-ops T3, T5, T8 (`[] && [...]` is the second array) | **EQUIVALENT**, by the reader's argument and the author's |

**Decisions taken by this item** (within P43's delegated shape and the coordinator's answers): the module's name
`definition-schema.ts`; the six constants PUBLIC, each a copy (ADR 0132 rule 1 says why: `index.ts` re-exports
`validate.ts` whole); a missing description an L1 throw ((c1)); the vendored meta-schema inside the suite; the static
schema carrying `FD-V40`'s key path and `FD-V41`'s per-edge half beyond fact 2's list; `of` and a branch entry held to the
charset only as strings (Q774); the sweep at node granularity, every tenth mutation checked whole.

**What broke.** At no rung of the product. The chromium lane, over its 60 s at the first B′ gate (re-take 8); and the
soundness claim, false on the first green tree and shown false by a READER rather than by the suite.

**What this taught.** *For the retro*: **a claim of ABSENCE over a space is only as wide as the values the probe can
write** — the sweep (*never refuses what the validator accepts*) wrote whole keys and could not reach a nested value, and
had no positive control: W208's and W209's *census by name* lesson in a third shape. Second, **the chromium lane is a
shared budget at ~92%**: a suite's cost is not only its own wall but the GC it leaves for the suites after it.

**Questions raised.** **Q774** — `FD-V21` does not refuse a non-string `of` or branch entry; raised rather than asked
because the fix REFUSES documents 0.10.0 accepts (P43 prediction 3; the row moved no verdict). Q775 SPENT, unissued.
**Closed.** None. ADR 0132 written. **Declared exceptions**: `deno.lock` (one line) and `validate.ts`' four further
constants — both USED.

**The readers' overlap.** **ONE** — the soundness claim (conformity B1, by construction; adequacy BLOCKER 1, by mutation):
one subject, two findings, as section 6 says an overlap may be. Every other finding was one reader's alone.

**Leftover worktrees.** `C:/tmp-w210/base` (clean at `ceecb90`), `m3` (the B′ draft), `rc` and `ra` (git worktrees at
`ceecb90` with the change applied — `rc` before the reader fixes, `ra` with the final module and suite copied in for the
re-cut; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with `C:/tmp-w210/rc-scratch` and `ra-scratch` — left
for the maintainer; not removed with `--force`.
