# W216 — #2: a bracket array index `[n]` in a key path, its grammar, resolution, wiring refinement and schema; ADR 0137

**Status:** done 2026-10-25 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; ADR 0137 written, ADR 0068 rule 2 amended; no stop-and-ask, no exception beyond the record step, no question raised. Earlier: declared 2026-10-25 on `07bc379`, P44's THIRD item: (c1); decision 3; fact 6; this file written from the plan's row BEFORE any other edit
**Plan:** [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md) — *what does a join hand on, and
how does a key path reach into it?* — and this is its THIRD item: fyflow-app's pass 5 #2, answered by the maintainer's
(c1).

```
Spec:       spec/flow-definition.md v0.52 -> v0.53 — section 2's gate KEY PATH paragraph, section 3's `when` PATH
            paragraph and its table, section 3's wiring paragraphs on a gate's refinement and on a key path the
            producer FORBIDS, the FD-V40 and FD-V43 rows (their case names), the status block's v0.53 entry stating a
            CHANGE IN WHAT IS ACCEPTED (it only accepts more) and KEY_PATH_RE's `source` moving; spec/README.md's row.
Owns:       from P44's W216 row, exactly: src/definition/validate.ts, src/definition/condition.ts,
            src/definition/wiring.ts, src/definition/definition-schema.ts, src/definition/types.ts (comments),
            src/driver/driver.ts (only if the gate's resolution comment moves), test/definition/**, test/driver/**,
            test/definition/l4-corpus.test.ts (counted), spec/examples/valid/** and spec/examples/invalid/** (the
            FD-V40 file re-cut and renamed; new files), spec/flow-definition.md (v0.53: FD-V40, FD-V43, section 3's
            key-path paragraphs, section 7's table), spec/README.md, AGENTS.md (the WHOLE file, sentence D'),
            scripts/check-docs.mjs (RUN_FLOOR only), doc/decisions/0137-*; this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files (P44's plan
            file is not touched — its Record is W218's). No `run` snippet is planned, so RUN_FLOOR is not expected to
            move; if one is added it is stated here first. Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P44 decision 3, fact 6, (c1); fyflow-app pass 5 #2 (read only); ADR 0068 (rules 2, 3; the refinement and
            the refusal), ADR 0066 (the gate, its key), ADR 0053 (the schema subset: `items`, `minItems`; no
            `prefixItems`, no `maxItems`); W99, W100 (requireAlong, keyPathRefusal); W210 (the FD-V40 corpus file's
            class).
Outputs:    (1) the GRAMMAR (ADR 0137, spec v0.53): a key path is dot-separated SEGMENTS; a segment is a key in
                FD-V16's charset followed by ZERO OR MORE bracket indexes `[n]`, `n` = `0` or `[1-9][0-9]{0,8}` (no
                leading zero, at most 999,999,999 — every accepted index a valid JavaScript array index); never
                leading the path; no empty segment; no quoted key, no wildcard, no expression. `KEY_PATH_RE`'s
                `source` moves (a public constant's value); `keyPathProblem`'s message names the bracket form.
            (2) `readKeyPath` (condition.ts): `[n]` resolves on a REAL array (`Array.isArray`, `n < length`) and on
                nothing else — a plain object, an array-like object, a primitive, a typed array: `undefined`. A plain
                segment is unchanged: an own key of a plain object, `undefined` over an array. A segment whose
                brackets the grammar does not accept is read as a literal key, as before (unvalidated callers only).
            (3) FD-V43's ROOT rule: the root is read up to the first `.` or `[`; an index directly ON the root
                (`input[0]`, `outcome[0]`) is refused — a gate key cannot index the value reaching the gate either.
            (4) ADR 0068's refinement along an index (wiring.ts): `requireAlong` raises the array's `minItems` to
                `n + 1` and STOPS there (no keyword in the subset says one position, so nothing past an index is
                required); `keyPathRefusal` refuses an index where the schema's types cannot include `array`, steps
                INTO `items` where declared, and is silent where `items` is absent.
            (5) `definitionSchema()`: the gate key pattern is `KEY_PATH_RE.source` (unchanged mechanism), a
                comparison's `path` pattern gains the bracket suffix on every segment after the root, both
                descriptions say so; the segment string asserted equal to `KEY_PATH_RE`'s at build.
            (6) the corpus: `FD-V40--gate-key-path-with-an-index.flow.json` re-cut to `files[*].series` (a WILDCARD,
                still refused) and renamed `FD-V40--gate-key-path-with-a-wildcard.flow.json`; W210's two lists move
                with it.
            (7) tests: L1 in a new `test/definition/key-path-index.test.ts`; L2 in a new
                `test/driver/key-path-index.test.ts`; both counted in l4-corpus's census; existing cases whose
                wording says *no index* restated.
            (8) ADR 0137; spec v0.53; spec/README.md; AGENTS.md's every *no index* sentence.
Depends on: W215 (07bc379)
Blocks:     W217
Tests:      Outputs (7). Expected values from ADR 0137 and spec v0.53 as written before the first run: the grammar
            accepts `xs[0]`, `xs[1].id`, `m[0][2]`, `a.b[999999999].c`, `0[0]`; refuses `[]`, `[-1]`, `[01]`, `[a]`,
            a leading `[0]`, `xs[0`, `xs]0[`, `xs.[0]`, `xs[0]x`, `xs[1000000000]`, `xs[*]` — on a gate's `key`
            (FD-V40) AND a `when.path` (FD-V43, and FD-V40 on an `if`); `readKeyPath` over hand-written values.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs,
            scripts/state.mjs or doc/questions/README.md); `npm run gate` on the B' draft (spec, corpus and
            AGENTS.md edits included) before the Owns are fixed and before the readers (sentence C); L1: the grammar
            — every well-formed spelling accepted, every malformed one refused naming the fix, on a gate's `key`
            AND a `when.path`, the root read before the first `[`; `readKeyPath`: `[n]` on an array, `undefined`
            past its length, on a plain object, and on an array-like object; a numeric segment over an array still
            `undefined` (the control); L2: a `distinct` gate and an `if` routed by `input.xs[1]` on a run, by hand;
            the wiring check — `fits` along `items`, a refusal where the producer is not an array or its `items`
            refuses every element, a guarantee read from `minItems`; `definitionSchema()` accepting the form; the
            FD-V40 file's move stated; then the conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q784-Q785, ADR 0137
```

## Scope

**In**

1. **The grammar** — Output (1); `KEY_PATH_RE`, `keyPathProblem`.
2. **The resolution** — Output (2); `readKeyPath`.
3. **FD-V43's root** — Output (3).
4. **The wiring refinement** — Output (4).
5. **The schema** — Output (5).
6. **The corpus, the tests** — Outputs (6), (7).
7. **ADR 0137, the spec, `AGENTS.md`** — Output (8). A CHANGE IN WHAT IS ACCEPTED, only ever MORE: every key path
   0.11.0 accepts is accepted and resolves exactly as before, since no accepted path held `[`.

**Out** — named rather than left implicit, with where it goes instead

- **A plain numeric segment indexing an array** (`xs.1`) — (c2), declined by the maintainer: it keeps its meaning.
- **The quoted-key form** `["0.1"]` — (c3), declined.
- **A wildcard, a negative index, an index from the end, a slice** — not asked; refused by the grammar.
- **A per-position guarantee past an index** (`prefixItems`), and refusing an index past a bound (`maxItems`) — both
  outside the subset (ADR 0053); the refinement stops at the index and the refusal is silent past it, stated in ADR 0137.
- **The join's collection keys** — W217.
- **The version bump, push and publish** — the maintainer's ((e1)).

## Re-takes (P44's *W216 — Re-takes*), at `07bc379`, before any `src/` edit

1. **Every reader of `KEY_PATH_RE`, `readKeyPath` and `key.split('.')`** — a grep over `src/` and `index.ts`:
   `KEY_PATH_RE` in `keyPathProblem`, `leafProblem` (FD-V43) and `definition-schema.ts` (the gate key's `pattern`, and
   `body()`'s anchored-flagless assertion); `readKeyPath` in the driver's gate (`driver.ts:4759`) and `evalLeaf` (every
   `when`: a task's or join's edge, an `if` gate); a key path's `split('.')` in `requireAlong` and `keyPathRefusal`
   (`wiring.ts`) and `leafProblem`'s root. **A second pattern was found that P44 fact 6 did not name**: `leafSchema`'s
   comparison `path` (`definition-schema.ts:330`), built from `ID_RE`, not `KEY_PATH_RE` — moved with them. The other
   `split('.')` sites (`driver.ts:960`, `:5641`, `:5714`, `ids.ts:127`, `regions.ts:545`) split BRANCH paths, not key
   paths (the conformity reader re-took this and agrees). Tests holding a bracket key as MALFORMED, re-cut to a form
   still refused: `gate.test.ts` (five sites), `gate-builtins.test.ts`, `predicate.test.ts`.
2. **Whether any valid corpus or example flow holds `[`** — a grep for a `"key"` or `"path"` value holding `[` over
   `spec/examples/**` and `examples/flows`: **one hit, `FD-V40--gate-key-path-with-an-index.flow.json`** (expected: holds;
   the conformity reader re-took it and agrees).

## Predictions, written before the change

1. **P44 prediction 3**: the FD-V40 corpus file flips and no other — no valid file and no other invalid file holds `[`.
2. No existing L1-L6 case moves verdict; only the wording of cases that say *no index*.

## Verification

`npm run gate` on the B' draft before the `Owns` are fixed; the two readers in their own worktrees under `C:/tmp-w216/`
(`node_modules` COPIED, scanned for links and reparse points, never removed with `--force`); then `npm run gate:item`
once, on the final tree, held still. **Routing coverage**: a gate and an `if` route by an index (L2); no `user_action`
(Q17), routed-away branch (Q4), unmatched decision (Q10) or task id (Q13) moves; a map (Q6) is not touched — the L2
run is a top-level gate, and a gate inside a map's branch reads the same `readKeyPath`.

## Record

*Filled 2026-10-25, after both readers. Harnesses and logs in the session scratchpad's `w216/` (`smoke.ts`,
`spec-edit.mjs`, `agents-edit.mjs`, `gate-draft.log`, `w216.patch`, `readers-edit.mjs`, `rule8.mjs`, `rule8.log`,
`gateitem.log`); the readers' in `C:/tmp-w216/rc-scratch` and `C:/tmp-w216/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — `npm run gate` on the draft (code, tests, corpus, spec v0.53, `spec/README.md`, `AGENTS.md`, ADR 0137), before the readers | RAN — **EXIT 0**, 01:31:47 → 01:36:55 (`gate-draft.log`) | L1-L5 **102 files / 2,289 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; L6 **2,861 / 0 failed** over 246 real runs in node and deno. Every edited file inside `Owns` |
| L1: the grammar on a gate's key AND a `when.path` (edge and `if`), every well-formed and malformed spelling, the root before the first `[`, refusals naming the fix | RAN | `test/definition/key-path-index.test.ts`, cases 1-3 |
| L1: `readKeyPath` — `[n]` on an array, past its end, on a plain object, an array-like, a typed array, a string; a numeric segment over an array `undefined` (the control); every v0.52 path resolving as v0.52's `readKeyPath` (an oracle kept in the test) | RAN | cases 4-5 |
| L2: a `distinct`, a `switch`, an `if` and a task edge routed by `xs[1]`, each beside `xs.1`, by hand | RAN | `test/driver/key-path-index.test.ts` |
| the wiring check — `fits` along `items`, a refusal where the producer is not an array or `items` refuses the next step, a guarantee read as `minItems` | RAN | L1 cases 6-7 |
| `definitionSchema()` accepting the form | RAN | L1 case 8: the gate key's pattern IS `KEY_PATH_RE.source`; the comparison path's refuses an index on the root |
| the FD-V40 file's move stated | RAN | spec v0.53 entry, the FD-V40 row, ADR 0137 consequence 2; L4 and W210's schema suite carry the renamed file |
| conformity reader (`C:/tmp-w216/rc`) | RAN | 0 BLOCKER, 2 SHOULD, 4 NIT, below; re-derived every expected value from the spec before the tests, all matched; no validated path resolves differently; no keyword outside the subset needed |
| adequacy reader (`C:/tmp-w216/ra`) | RAN | 57 probes: **47 KILLED**, 3 KILLED by an import-time failure the reader graded KILLED (P0, G2v — `keyPathSegment`'s guard; R4), **9 SURVIVED** (K2, D2 equivalent; K7b SHOULD; K7, D3, D3b, S1, S2, A1 NIT); positive control KILLED, no-op control SURVIVED; restore proved by digests and `git diff HEAD` hash |
| rule 8 — each fix made on the readers broken, the FULL L1-L5 runner each, plus a no-op control (`rule8.mjs`) | RAN — **EXIT 0** | F1 (the key group back to non-brackets), F2 (`INDEX` drifting to eight digits — K7b), F3 (the hole guard removed), F4 (both at ten digits — K7), F5, F6 (the two descriptions — D3, D3b) each **KILLED** by its named case; the no-op control SURVIVED; both files' digests identical after |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 2026-10-25 02:35:25 → 02:59:45 (`gateitem.log`) | lint; typecheck; every check; L1-L5 **102 files / 2,289 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity) — 2,274 + 15, the two new suites; L6 **2,861 / 0 failed** over 246 real runs in node and deno; selftests **10/10 ok** (1,159.4 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this row alone — `check:markdown`, `check:spec`, `check:budget`, `check:wiring`, `check:docs` and `check:register` re-run on it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the grammar, `KEY_PATH_RE`, `keyPathProblem` | yes — `validate.ts`; `KEY_PATH_WORDS` shared by FD-V40's and FD-V43's messages | L1 cases 1-2; adequacy G1-G8, M1-M6 |
| (2) `readKeyPath`'s array arm | yes — `condition.ts`: `keyPathSteps`, the index arm (a real array, below its length, an OWN element) | L1 cases 4-5, L2; adequacy K1-K10; rule 8 F1-F4 |
| (3) FD-V43's root rule | yes — `leafProblem`: the root before the first `.` or `[`; an index on it refused, both scopes | L1 case 3; adequacy R1-R4 |
| (4) the wiring refinement and refusal | yes — `requireAlong` (`minItems` `n + 1`, never lowered, stops) and `keyPathRefusal` (array types, into `items`, silent without) | L1 cases 6-7; adequacy W1-W13 |
| (5) the schema | yes — `keyPathSegment`, `leafSchema`'s pattern, both descriptions | L1 case 8; adequacy D1, D4, D5; rule 8 F5, F6 |
| (6) the corpus file | yes — `FD-V40--gate-key-path-with-a-wildcard.flow.json` (`files[*].series`), by `git mv` | L4's per-file case; W210's partition and REPAIRS (adequacy C1) |
| (7) tests | yes — two new suites (L1 9 cases, L2 6), counted in `l4-corpus.test.ts`'s census; existing cases re-cut or restated | the census itself |
| (8) ADR 0137, spec v0.53, `spec/README.md`, `AGENTS.md` | yes | `check:spec` C8 (the README's version); the prose is held by readers, not checks (adequacy S1, S2, A1) |
| section 7's table (the row's `Owns`) | **not moved** — no table lists the FD-V40 file; the FD-V40 row names it | — |
| `spec/examples/valid/**` (the row's `Owns`) | **not touched** — no valid file added; L1/L2 hold the form | — |
| `RUN_FLOOR`, `src/driver/driver.ts` | **not touched** — no `run` snippet added; the gate's comment did not move | — |

**Predictions.** 1 (**P44 prediction 3**) **HOLDS**: the FD-V40 corpus file flipped and no other — no valid file and no
other invalid file holds `[` (Re-take 2). 2 **HOLDS**: no existing L1-L6 case moved verdict; seven existing test sites
held a bracket key as malformed and were re-cut to a form still refused, and four labels restated.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | `INDEXED_SEGMENT`'s key group was any non-bracket run, so `a b[0]`, a 65-character key, `.xs[0]`, `$[0]` were indexed where v0.52 read a literal key — ADR 0137 rule 2's *no change for an unvalidated caller* false | **FIXED** — the key group is `FD-V16`'s charset, `{1,64}`; ADR 0137 rule 2 narrowed to *every SEGMENT the grammar refuses*, stating that a path refused only for how its segments are joined still indexes its well-formed segments; L1 cases for five such keys; rule 8 F1 KILLED |
| conformity SHOULD 2 | the Re-takes were empty | **FIXED** above |
| conformity NIT 1 / adequacy (comment) | an index read a HOLE through the prototype, and the comment said no run holds one — `structuredClone` keeps a hole | **FIXED** — the index arm asks `hasOwnProperty`; the comment corrected; spec section 2 and the absent-path paragraph say *own element*; an L1 case with a custom prototype answering through a hole; rule 8 F3 KILLED |
| conformity NIT 2 | `AGENTS.md`'s example `files[0].series` was not a comparison path | **FIXED** — both forms given |
| conformity NIT 3 | the absent-path paragraph still said *an array mid-path* | **FIXED** |
| conformity NIT 4 | two stale labels (*the grammar has no index*) | **FIXED** — `predicate.test.ts`, `gate-builtins.test.ts` |
| adequacy SHOULD (K7b) | the index bound was spelled twice in `condition.ts`; `INDEX` drifting dropped a nine-digit step in silence, and no test read one | **FIXED** — one `INDEX_SPELLING` builds both; L1 reads `xs[123456789]` and `xs[999999999]` past a short array; rule 8 F2 KILLED |
| adequacy NIT (K7) | a ten-digit bracket as a literal key had no test | **FIXED** — L1 case; rule 8 F4 KILLED |
| adequacy NIT (D3, D3b) | no test bound the two descriptions | **FIXED** — L1 case 8; rule 8 F5, F6 KILLED |
| adequacy (K2, D2) | the length check (unobservable without prototype pollution) and `keyPathSegment`'s guard (fires only on drift; P0 and G2v show it does) | **DECLARED** — equivalent mutants on this tree |
| adequacy NIT (S1) | `check:spec` does not check that the case file a refusal row cites EXISTS — the old FD-V40 filename restored stayed green | **DECLARED** — pre-existing, `scripts/check-spec.mjs` outside every P44 row's `Owns`; for P44's retro |
| adequacy NIT (S2, A1) | no check compares the spec's prose `SEG` or `AGENTS.md`'s table prose to `KEY_PATH_RE` | **DECLARED** — the refusal ledger's first row (*a check over `doc/`*) |

**Decisions taken by this item** (within decision 3, ADR 0137): the bound 999,999,999 (nine digits); an index on the
ROOT refused in both scopes, so an `if` cannot say what a gate key cannot; the refinement stopping at an index; the
FD-V40 file re-cut to a WILDCARD; a malformed segment read as a literal key; no valid corpus file.

**What broke.** At no rung. The first green tree carried one false claim in an ADR and in a comment (an unvalidated
caller *sees no change*), found by the conformity reader by CONSTRUCTING keys the corpus lacks; and one bound spelled
twice that no test could see drift, found by the adequacy reader.

**What this taught.** Nothing for `doc/workflow.md`. *For the retro*: **a claim about the paths a grammar REFUSES is a
claim about a set no test enumerates** — the suite tested three malformed brackets and the defect was in the KEY half.
And S1: a renamed corpus file leaves its old name in a refusal row with every check green.

**Questions raised.** None — Q784-Q785 SPENT, unissued. **Closed.** None. **ADR 0137** written; **ADR 0068** rule 2
carries an amendment note (the record step). **Exceptions used**: none beyond the record step.

**The readers' overlap.** **ONE** — the index arm's reading of a HOLE and its false comment (conformity NIT 1, and the
adequacy reader's comment finding). The two findings on the literal-key claim are adjacent but on two subjects — the
KEY group (conformity) and the index BOUND (adequacy) — and are not counted as one.

**Leftover worktrees.** `C:/tmp-w216/rc` and `C:/tmp-w216/ra` (git worktrees at `07bc379` with the pre-reader change
applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with `C:/tmp-w216/rc-scratch` and `ra-scratch` —
left for the maintainer; not removed with `--force`.
