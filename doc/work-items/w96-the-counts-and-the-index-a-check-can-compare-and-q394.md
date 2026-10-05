# W96 — the L6 counts and the ADR index held by a check, and Q394's arrangement asserted

**Status:** **DONE** 2026-09-26 — see the Record. Declared on `1e56942` (P24's retro), before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on [W69](w69-a-getting-started-example-a-consumer-can-copy.md)-[W71](w71-the-reference-stops-teaching-a-fake-scheduler.md)'s
precedent, asked for by the maintainer on 2026-09-26 after [P24's retro](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md#retro)
handed it to them: *"commit, then 3 and 4 as one item"*. It takes the next id, so **the next plan starts at W97** and not W96
(`doc/workflow.md` section 3: ids are never renumbered) — a claim with an expiry date, corrected by this item in the files that
carry it.

```
Spec:       none — this item writes no rule. What it adds are two clauses of `check-docs` that
            compare a number or a set to the file it is about (X7's and X9's shape), and one L6
            assertion's expected value.
Owns:       scripts/check-docs.mjs, scripts/check-docs-selftest.mjs, examples/l6.ts,
            examples/README.md, README.md (the two copies X10 reads; also a record-step file)
Inputs:     P24's retro, refusal (2), and Q171's row (the L6 count copies — P20's retro named the
            clause, P23's retro measured it and handed it on, W94 shipped it stale again); P23's
            retro refusal (5) (doc/decisions/README.md against its directory, short in 29 of 46
            commits); Q394's row (the overlap CONTROL held by a thumbnail settling before
            `identify`, called *construction*); `check-docs.mjs`' X7 and X9 (the shape);
            `check-docs-selftest.mjs`' PROBES, META and the coverage bound `idAt`.
Outputs:    (1) X10 — each CURRENT L6 count copy (two in README.md, two in examples/README.md),
                found by its own anchored sentence, equals examples/l6.ts' DECLARED_TOTAL and a
                new DECLARED_RUNS; a sentence X10 cannot find is a failure naming it
            (2) examples/l6.ts' DECLARED_RUNS, guarded the way DECLARED_TOTAL is (a mismatch is a
                named failure and not a counted assertion, so DECLARED_TOTAL does not move)
            (3) X11 — doc/decisions/README.md's rows equal the `NNNN-*.md` files in doc/decisions,
                BOTH ways, each direction its own clause
            (4) the three subjects read through overrides (CHECK_DOCS_EXAMPLES, CHECK_DOCS_L6,
                CHECK_DOCS_ADR_INDEX), so a probe reaches them (obligation (e)'s second question);
                a probe per clause and a META entry per clause, the floors raised
            (5) Q394: the overlap CONTROL's per-instance ARRANGEMENT asserted beside it — in every
                gated row, every `beside` instance's thumbnail arrives before its gate road ends —
                and the comment's *by construction* corrected; Q394 resolved
Depends on: nothing — P24 is retro'd
Blocks:     nothing
Tests:      the self-test's probes, one per new clause and per direction, each declaring the
            exact set it trips (rule 7 (c)); META entries grading each clause's guard; the L6
            rung in both runtimes, and Q394's arrangement provoked by the delay that found it
            (rule 8 obligation (f), its first use inside an item).
Gate:       L0 (`lint`, the five typecheck lanes, each RUN separately); `check:docs` and its
            self-test; `check:markdown`; L6 in node and deno; then the full `npm run gate` with a
            content digest identical at both ends.
Reserves:   Q395-Q399, and NO ADR
```

*Reserves derived by grep off the tree at this declaration: the highest question on disk is **Q394**, raised by P24's retro,
so this item starts at **Q395**; the highest ADR is **0067** and this item takes none; the highest work item is **W94** and
W95 was closed unissued, so this is **W96**.*

## Scope

**In**

1. **X10** and `DECLARED_RUNS` — Outputs (1), (2).
2. **X11** — Outputs (3).
3. **Their probes, gradings and overrides** — Outputs (4).
4. **Q394** — Outputs (5).

**Out** — named rather than left implicit, with where it goes instead

- **Copies of the L6 counts in `CLAUDE.md`, `doc/README.md` and the plan and item files** — history-heavy index prose, under
  the standing `doc/`-check refusal's English class; X10 reads the two documents Q171 names, neither under `doc/`.
- **A copy of the counts X10 does not know about** — a NEW sentence stating the counts is invisible to a check that finds
  copies by anchor. Stated as the clause's limit rather than argued away ([Q217](../questions/q217.md)'s regress).
- **Obligation (f) across the rest of L6** — the next piece of work, not this one.

## What the declaration step re-took before anything was edited

*On `1e56942`, node 24.20.0, `dev-dist/w96/facts.py`, logs beside it; the tree asserted clean after.*

| # | re-take | result |
|---|---|---|
| 1 | Q171's hole: README.md's current L6 sentence moved to 2070 / 155 while `l6.ts` declares 2069, `check:docs` read through `CHECK_DOCS_README` | **`check:docs` EXIT 0** — nothing compares the copy to the file it is about |
| 2 | Q394: `Thumbnail` 5 → 300 ms, L6 in node once, the registry restored byte-for-byte | **EXIT 1, ONE `FAIL` line**, the overlap CONTROL — reproduces P24's retro |
| 3 | the ADR index against `doc/decisions` | **37 files, 37 rows, nothing either way** — X11 ships with no live case, so its probes are the whole of its evidence |

**And one thing found by reading, before a line was written**: the self-test's coverage bound `idAt` reads the id after a
mutation with `fail\('(X\d)'` — ONE digit. `X10` and `X11` would be read as `X1`, so a META entry aimed at either would
credit `X1` and the bound's *every id has a grading* would be satisfied by X1's own entries: [Q43](../questions/q43.md)'s
class — a bound over ids that cannot see an id. Widened to `X\d+` in this item, and the widening is itself provoked.

**Q142**: this item adds one document outside `doc/decisions` (this file), so `M3`'s margin goes 3 → 2 — predicted NOT to
fire.

## Exceptions — files outside `Owns`

| file | why | predicted? |
|---|---|---|
| `CLAUDE.md`, `doc/README.md` | *the next plan starts at W96* becomes false — record-step files | yes — **used** |
| `doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md` | the same sentence in P24's Retro — a finished plan's file, on nobody's `Owns`, found by the own-id grep | **no — found at the record step** |

## Verification

**Routing:** not applicable — no flow, no worker, no routing changes; the L6 edit is one assertion's expected value.

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, five typecheck lanes, each separately | `l6.ts` | see Record |
| `check:docs` / its self-test | X10, X11, the probes and gradings | see Record |
| L6 node and deno | Q394's arrangement, `DECLARED_RUNS` | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

**DONE 2026-09-26.** `check-docs` holds what four plans handed on. **`X10`**: every CURRENT copy of ladder L6's counts —
`README.md`'s status paragraph and ladder table, `examples/README.md`'s paragraph and `l6.ts` row — each found by its own
anchored sentence, against `examples/l6.ts`' `DECLARED_TOTAL` and a new **`DECLARED_RUNS`** (guarded like its sibling, not a
counted assertion). **`X11`**: `doc/decisions/README.md` against its directory, both ways, each ADR once and under its own
number. **Q394**: the overlap control asserts its thumbnail-before-`identify` ARRANGEMENT beside it. [Q171](../questions/q171.md)
and [Q394](../questions/q394.md) RESOLVED, [Q395](../questions/q395.md) raised; Q396-Q399 unused and not reused. No ADR.

### Gate — what ran

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint` and the five typecheck lanes, each separately | RAN, exit 0 all six | before the readers; `l6.ts` changed after only in a comment, and the confirming gate re-ran all six |
| `check:docs` | RAN, exit 0 | 37 snippets; *X10 compared 4 copies against 2069 / 154*; *X11 compared 37 rows against 37 ADRs* |
| `check:docs:selftest` | RAN, exit 0 | **43 / 43, 26 / 26** before the readers; **50 / 50, 28 / 28** after acting on them |
| L6 node / deno | RAN, exit 0 | **2069 assertions over 154 real runs in both, UNMOVED** |
| conformity reader | RAN, isolated copy, tree still at `6893c29f19a3dc38` | 9 findings, 1 BLOCKING; ZERO disagreements on the VALUES |
| adequacy reader | RAN, isolated copy | 16 mutations graded plus measurements; 13 survivors, 6 BLOCKING |
| rule 8 | RAN, two passes | pass 1 **21 / 17 caught / 1 ceiling**; pass 2 with the readers' edits **31 / 26 / 2** — both grader controls right, 0 aborts, 0 against declaration, digest identical at both ends of each |
| `npm run gate` | RAN, **`GATE EXIT=0`, ZERO `FAIL` lines** | content digest `a86265afa9721267` over 415 files IDENTICAL at both ends; spec 7 / 65 / 125, markdown 160 / 7393 / 413, docs 37 / 31 / 6, L1-L5 53 / 1423 in node, deno and chromium, L6 2069 / 154 in both. **`selftests` 1441.5 s wall against 1002.0 s at P24's retro** — the cost of this item's sixteen probes and seven gradings, almost all of it `check:docs:selftest` (~19 minutes alone, measured by its conformity reader), which is now the gate's longest entry: [Q133](../questions/q133.md)'s trade, stated rather than spent unremarked. This row is the one edit made after the gate; `check:markdown` re-run over it |

### Outputs — what was actually built

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) X10 | yes | its twelve probes — per copy, per direction, per half, and a decoy per anchor; rule 8 `a1`-`a4`, `c1`, `e1`, `e2`, `r1`-`r6` |
| (2) `DECLARED_RUNS` | yes | L6's own guard (`b1`) and `X10` beside it (`b2`, the guard made a tautology) |
| (3) X11 | yes | its four probes — unindexed, phantom, duplicated, misnumbered; `c2`, `e3`, `r7`, `r8` |
| (4) the overrides, probes and gradings | yes | `e4` (idAt one digit), `e5` (the report row by two characters), `e6` (the staging dropped) |
| (5) Q394's arrangement | yes | `b3` on the shipped tree; `f3` at 70 ms; **`b4` and `f4` are its declared CEILING — ONE observer** |

### What broke, and which rung caught it

| # | what | caught by |
|---|---|---|
| 1 | a moved README count passed `check:docs` at EXIT 0 — Q171's hole, live | a RUN at the declaration step |
| 2 | two single-digit id assumptions: the self-test's `idAt` (`X\d`) and `check-docs`' report row (`c.slice(0, 2)`) | READING at the declaration step and the build — **and the first one's stated mechanism was FALSE**: the declaration said X10 would read as X1 and the bound pass in silence; the conformity reader measured that `fail('X10'` does not match at all, so the bound would have failed LOUDLY. Corrected here and in the code comment |
| 3 | X10's copy names printed *README.md's the status paragraph* | the author, reading rule 8's `a4` failure line |
| 4 | **two more present-tense copies of the L6 counts, both stale at 154, neither anchored** — `README.md`'s Examples cell (*fifty-three*) and the tail of `examples/README.md`'s `l6.ts` row (*54 row labels and 100 runs*) — Q171's class inside the item that closes it | the CONFORMITY reader — **no rung; BLOCKING**; both corrected, the first by no longer stating a number ([Q395](../questions/q395.md)) |
| 5 | **three of X10's four anchors loosenable for ZERO** — each current copy was also the first match of its shape, the default position (v0.23); the runs-first copies' assertion half and `DECLARED_TOTAL` compared by nothing | the ADEQUACY reader — **no rung; five BLOCKING**; closed by a DECOY probe per copy and a `DECLARED_TOTAL` probe |
| 6 | **Q394's whole `arranged` field deletable with rule 8 green** — `f1` at 300 ms fires on `only` either way; at 70 ms `only` is unmoved and the field is the only observer, so `b4`'s stated reason (*only f1 can tell*) was false | the ADEQUACY reader — **no rung; BLOCKING as a harness finding**; `f3` and `f4` added, `b4`'s reason corrected, the ceiling declared |
| 7 | X11 blind to a duplicated row (its note printed 38 against 37 and passed) and to a row under another ADR's number | the ADEQUACY reader — closed with two clauses, two probes, two gradings |
| 8 | three clauses unreachable by any probe and unnamed in the self-test's header | the CONFORMITY reader — named there |
| 9 | a Python heredoc with backslash escapes, again | the author — its anchors asserted, the bytes right |

**Readers — overlap 1**, the sixtieth measurement: one shared SUBJECT, X10's reach over the copies, reached from opposite
ends — the conformity reader by the copies X10 does not anchor, the adequacy reader by the anchors that do not discriminate.
**Owns audit** (the conformity reader's): zero undeclared; one exception found at the record step by the own-id grep, above.

### Questions

**Resolved: [Q171](../questions/q171.md)** and **[Q394](../questions/q394.md)**. **Raised: [Q395](../questions/q395.md)** —
X10 holds the copies it anchors, and two unanchored ones existed the day it shipped. Census **305 / 235 / 1 / 69**, every id in
exactly one cluster cell. [Q142](../questions/q142.md): `M3` margin **2** before the record step, as the declaration predicted —
**the next plan's declaration, a plan and its first item, FIRES it**. The next plan starts at **W97, Q400 and ADR 0068**.
