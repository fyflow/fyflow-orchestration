# W215 — Q774: `FD-V21` refuses a non-string join `of` and fanout branch entry, and the schema with it

**Status:** done 2026-10-25 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; Q774 resolved; no stop-and-ask, no exception beyond the record step, no ADR, no question raised. Earlier: declared 2026-10-25 on `1270502`, P44's SECOND item: (d1); decision 2; fact 8; this file written from the plan's row BEFORE any other edit
**Plan:** [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md) — *what does a join hand on, and
how does a key path reach into it?* — and this is its SECOND item: P43's retro (a), [Q774](../questions/q774.md), routed
here by the maintainer's (d1).

```
Spec:       spec/flow-definition.md v0.51 -> v0.52 — the FD-V21 row (two clauses), section 1's *The definition's shape
            as a schema* `carries` row (the Q774 sentence withdrawn), the status block's v0.52 entry stating a CHANGE
            IN WHAT IS ACCEPTED (BREAKING, 0.12.0); section 7's invalid paragraph only if a sentence moves;
            spec/README.md's row.
Owns:       from P44's W215 row, exactly: src/definition/validate.ts, src/definition/definition-schema.ts,
            test/definition/**, test/definition/l4-corpus.test.ts (counted), spec/examples/invalid/** (new files
            only), spec/flow-definition.md (v0.52: FD-V21, section 7's table), spec/README.md, AGENTS.md (the WHOLE
            file, sentence D'); the record step's doc/questions/q774.md (resolved); this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files (P44's plan
            file is not touched — its Record is W218's). No `run` snippet is planned, so scripts/check-docs.mjs's
            RUN_FLOOR is not touched; if one is added, RUN_FLOOR is owned by sentence B' and stated here first.
            Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P44 decision 2, fact 8, (d1); Q774; W210's Record (conformity B1, adequacy BLOCKER 1); ADR 0132 rule 2
            (what the schema refuses, the validator refuses); spec/flow-definition.md section 5's FD-V21 row.
Outputs:    (1) src/definition/validate.ts — two FD-V21 clauses: a join's `of` that is present and not a string; a
                fanout's `branches` entry that is not a string (each entry, by index), each naming the key and quoting
                the value. The graph's own handling (a non-string dropped) is unmoved.
            (2) src/definition/definition-schema.ts — `of` and every `branches` entry held to the id charset
                UNCONDITIONALLY (`idOrNonString` retired), in the static form and so in the registry form, which
                builds on it; `of`'s description names FD-V21.
            (3) tests: L1 in test/definition/clauses.test.ts (the validator: `of` in {null, 5, [], {}, true} and
                `["b", "c", 5]` — `of` with and without a region, a branch entry inside its fanout — each naming the key, each beside the string form's
                verdict unmoved); test/definition/definition-schema.test.ts (W210's two ACCEPTS pins flipped to
                CLAUSES rows refused by both forms; each refusal beside its repair accepted by both forms; the two new
                corpus files' REPAIRS).
            (4) spec/examples/invalid/ — two new files, `FD-V21--join-of-is-not-a-string.flow.json` and
                `FD-V21--fanout-branch-entry-is-not-a-string.flow.json`, each verdict re-taken at HEAD before the change.
            (5) spec/flow-definition.md v0.52, spec/README.md; AGENTS.md's Q774 sentence; Q774 resolved.
Depends on: W214 (1270502)
Blocks:     W216
Tests:      Outputs (3) and (4). Expected verdicts from spec/flow-definition.md section 5's FD-V21 row as v0.52 words
            it and Q774's table, written before the first run: each non-string `of` / branch entry REFUSED FD-V21
            naming `of` / `branches[i]`; each string form's verdict as it was at HEAD (a region-less join of a string
            naming nothing: FD-V2 and FD-V6, no FD-V21; a well-formed fanout: nothing).
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs
            or doc/questions/README.md); `npm run gate` on the B' draft (spec and AGENTS.md edits included) before
            the Owns are fixed and before the readers (sentence C); L1: each clause refuses `of` in {null, 5, [], {},
            true} and `["b", "c", 5]` naming the key, each beside the string form's verdict unmoved; the schema
            refusing both, each beside its repair accepted; W210's two pins flipped; every existing corpus verdict
            unmoved; then the conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q782-Q783, ADR 0136 (expected unused, decision 2)
```

## Scope

**In**

1. **The two `FD-V21` clauses** — Output (1).
2. **The schema tightened** — Output (2), static and registry forms.
3. **The tests and two corpus files** — Outputs (3), (4).
4. **The spec, `AGENTS.md`, Q774** — Output (5). A CHANGE IN WHAT IS ACCEPTED, stated in the v0.52 entry: a document
   0.11.0 accepts is refused (BREAKING, 0.12.0, (e1)).

**Out** — named rather than left implicit, with where it goes instead

- **`FD-V9`'s counting of a non-string entry** (its floor and distinctness count whatever the array holds) — unmoved;
  `FD-V21` now names the cause, as it does for a map's `branch` beside `FD-V11`/`FD-V20` (W32's precedent).
- **The graph builder's dropping of a non-string** — unmoved (the refusal is the diagnosis, as at `edge.to`).
- **The version bump, push and publish** — the maintainer's ((e1)).
- **W216-W218** — the plan's later rows.

## Re-takes (P44's *W215 — Re-takes*), at `1270502`, before any `src/` edit

1. **Whether a valid corpus or example flow holds a non-string `of` or branch entry**: read by a script over
   `spec/examples/{valid,invalid,wiring}` and `examples/flows` — **119 files, 0 hits** (expected none: holds). A grep over
   `test/`, `examples/` and `scripts/` for a constructed non-string `of` or entry: **one** hit, the region-less `of: null` (`definition-schema.test.ts:305`) — the regex missed `["b", "c", 5]` at `:301`, which a number-in-array pattern did not reach; W210 HAS TWO pins (`:301-307`, P44 fact 8), both flipped here (the conformity reader, NIT 2).
2. **Every corpus verdict** — re-taken by the gate on the B' draft (L4: every valid file accepted, every invalid file
   naming its rule; the schema suite's partition).

## Predictions, written before the change

1. **P44 prediction 2**: no existing corpus verdict moves; only W210's two pins flip.
2. The two new corpus files: at HEAD the `of` file earns `FD-V6` (and no `FD-V21`), the branch file NOTHING — the latter
   is Q774's own *zero findings*; after, each earns `FD-V21`.

## Verification

`npm run gate` on the B' draft before the `Owns` are fixed; the two readers in their own worktrees under `C:/tmp-w215/`
(`node_modules` COPIED, scanned for links and reparse points, never removed with `--force`); then `npm run gate:item`
once, on the final tree, held still. **Routing coverage**: not applicable — the item moves two refusals at definition
validation and no routing; no `user_action` (Q17), map semantics (Q6), routed-away branch (Q4), unmatched decision (Q10)
or task id (Q13) moves.

## Record

*Filled 2026-10-25, after both readers. Harnesses and logs in the session scratchpad's `w215/` (`retake.mjs`,
`verdicts.ts`, `verdicts-head.txt`, `spec-edit.mjs`, `gate-draft.log`, `rule8.mjs`, `rule8.log`, `gateitem.log`); the
readers' in `C:/tmp-w215/rc-scratch` and `C:/tmp-w215/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| the HEAD verdicts of the two new corpus files and Q774's constructions, before any `src/` edit (`verdicts.ts`) | RAN | the `of` file `FD-V6` alone, the branch file NOTHING, every region-less non-string `of` and `["b","c",5]` NOTHING, `of: "nowhere"` `FD-V2` + `FD-V6` — prediction 2 HOLDS |
| B′ — `npm run gate` on the draft (validator, schema, tests, corpus, spec v0.52, `spec/README.md`, `AGENTS.md`), before the `Owns` were fixed and before the readers | RAN — **EXIT 0**, 00:19:59 → 00:26:37 (`gate-draft.log`) | L1-L5 **100 files / 2,272 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; L6 **2,861 / 0** over 246 real runs in node and deno. Every edited file inside `Owns` |
| conformity reader (`C:/tmp-w215/rc`) | RAN | 0 BLOCKER, 1 SHOULD, 5 NIT, below; re-derived every verdict from the spec and observed it (static and registry forms, the validator, at HEAD and on the change); no schema refusal of a document the validator accepts found |
| adequacy reader (`C:/tmp-w215/ra`) | RAN | 36 probes: **30 KILLED**, 6 SURVIVED (V16, V17, S3, S4, R1, R2 — 2 SHOULD, the rest NIT), 0 CRASH; positive control KILLED, no-op control SURVIVED; restore verified by diff hash and `cmp` |
| rule 8 — the six survivors re-run against the fixes, full L1-L5 runner each, plus a no-op control (`rule8.mjs`) | RAN — **EXIT 0** | V16, V17, S3, S4, R1, R2 each **KILLED** by the case added for it; the no-op control SURVIVED; the tree's diff hash equal before and after |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 2026-10-25 00:50:08 → 01:14:04 (`gateitem.log`) | lint; typecheck; every check; L1-L5 **100 files / 2,274 cases** in node 24.20.0, deno 2.9.6 and chromium (parity) — 2,267 + 7: two L4 corpus files, three `clauses.test.ts` cases, two schema cases; L6 **2,861 / 0 failed** over 246 real runs in node and deno; selftests **10/10 ok** (1,137.3 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this row alone — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the two `FD-V21` clauses | yes — `validate.ts`, the fanout arm (per entry, by index) and a join arm (`of` present, not a string) | the clause cases in `clauses.test.ts`, CLAUSES, REPAIRS, the W215 case (adequacy V2-V18, CTRL_POS) |
| (2) the schema tightened, both forms | yes — `of` and `branches.items` are `ref('id')`; `idOrNonString` retired; both descriptions name `FD-V21` (`of`'s also `FD-V2`, conformity NIT 4) | the corpus PARTITION, CLAUSES, the W215 case and its charset rows (S1-S4, S9) |
| (3) tests | yes — `clauses.test.ts` +2 cases in an existing suite; `definition-schema.test.ts` +6 CLAUSES rows (105 → 111), −2 ACCEPTS rows (37 → 35), +2 REPAIRS, +2 cases (25 → 27) | the census lines in the suite itself |
| (4) two invalid corpus files | yes — `FD-V21--join-of-is-not-a-string.flow.json` (`of: ["split"]`), `FD-V21--fanout-branch-entry-is-not-a-string.flow.json` (`null` at index 2) | L4's per-file case; REPAIRS' key equality (C1, C2) |
| (5) spec v0.52, `spec/README.md`, `AGENTS.md`, Q774 resolved | yes — the v0.52 entry states the change in what is accepted, BREAKING, 0.12.0; `FD-V21`'s row (its two clauses and its three cases); section 1's `carries` row; `AGENTS.md`'s *The definition's SHAPE, as data* paragraph; Q774 `resolved` | `check:spec` C8 (the README's version) |
| *section 7's table* (the row's `Owns`) | **not moved** — `spec/examples/invalid/` has no table, only *one per `FD-V*` rule*, which the corpus already exceeds (FD-V26 has eight); the cases are named in `FD-V21`'s row instead | — |
| ADR 0136 | **not written** — decision 2 needs none. SPENT, unissued | — |
| `test/definition/l4-corpus.test.ts` | not touched — no suite added; the invalid suite's cases are generated per file | — |

**Predictions.** 1 (**P44 prediction 2**) **HOLDS**: every existing corpus verdict unmoved (the B′ gate, L4 and the schema
suite's partition), and only W210's two pins flipped. 2 **HOLDS** (the first row above).

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | `q774.md` still `open` and ADR 0132 rule 2's example still the old behaviour | **FIXED** at the record step — Q774 resolved; ADR 0132 rule 2 carries an amendment note (the rule unmoved, its example withdrawn) |
| conformity NIT 2 | Re-take 1 said ONE pin; W210 has two (`:301`, `:302-307`) | **FIXED** above — the grep's miss stated |
| conformity NIT 3 | Outputs (3) said a branch entry *with and without a region* | **FIXED** above |
| conformity NIT 4 | `of`'s description omits `FD-V2` (pre-existing) | **FIXED** — it names `FD-V2` and `FD-V6` |
| conformity NIT 5 | `["b", 5]` draws no `FD-V9` floor finding | **DECLARED** — Out of scope (the Scope's first Out bullet); the document is refused by `FD-V21` |
| conformity NIT 6 | section 7 says *one per `FD-V*` rule*; `FD-V21` now has three | **DECLARED** — the precedent stands (FD-V26 eight; FD-V40, FD-V41, FD-V49 two each) |
| adequacy SHOULD 1 (V16) | no two-entry list, so a `length > 2` guard survived — Q774's silence back at `FD-V9`'s floor | **FIXED** — `["b1", 5]` case; V16 KILLED (rule 8) |
| adequacy SHOULD 2 (S3, S4) | *held to the id charset* had no test: `{ type: 'string' }` survived | **FIXED** — six charset rows (three strings at `of` and at an entry), refused by both forms, the validator `FD-V2` not `FD-V21`; S3, S4 KILLED |
| adequacy NIT (V17) | the `of` clause asked on any kind survived | **FIXED** — a task carrying `of: 5` is `FD-V17` alone; V17 KILLED |
| adequacy NIT (R1, R2) | a repair naming the WRONG node passed the generic REPAIRS case | **FIXED** for the two new files — repaired, `validateDefinition` reports NOTHING; R1, R2 KILLED. The generic case is unmoved (W210's) |
| adequacy NIT (S8) | no test binds a description to its rule ids (pre-existing) | **DECLARED** — documentation only |

**Decisions taken by this item** (within decision 2): the corpus files as an author's plausible mistakes (`of: ["split"]`,
a `null` entry) rather than Q774's bare constructions, which the L1 cases hold; one finding per non-string entry, by
index; the `of` clause asked only on a `join` and only where `of` is present (absent stays `FD-V23`'s); no ADR.

**What broke.** At no rung. Two of this item's own sentences were false on the first green tree (Re-take 1's *one* pin,
Outputs (3)'s *with and without a region*), found by the conformity reader; and the item's tests held the charset claim
it restated not at all — found by the adequacy reader, and pre-existing since W210.

**What this taught.** Nothing for `doc/workflow.md`. *For the retro*: **a claim RESTATED is a claim re-owned** — W215
rewrote *held to the id charset* in four places and inherited W210's untested half of it; the adequacy reader's
`{ type: 'string' }` probe is the one that found it.

**Questions raised.** None — Q782-Q783 SPENT, unissued. **Closed.** [Q774](../questions/q774.md), resolved. **ADR
0136** SPENT, unissued. **Exceptions used**: none beyond the record step (Q774, ADR 0132's amendment note).

**The readers' overlap.** **ZERO** — no subject is in both reports.

**Leftover worktrees.** `C:/tmp-w215/rc` and `C:/tmp-w215/ra` (git worktrees at `1270502` with the pre-reader change
applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with `C:/tmp-w215/rc-scratch` and `ra-scratch` —
left for the maintainer; not removed with `--force`.
