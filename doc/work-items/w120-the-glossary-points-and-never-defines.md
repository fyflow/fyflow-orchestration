# W120 — The glossary points at a definition and never makes one

**Status:** in review — built to its gate and the conformity reader RAN: nothing blocking, four defects not yet acted on. See the Record
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — P28 decision 4. ADR 0080: the glossary points and never defines, so it cannot
            become a third place a term is decided
Owns:       doc/glossary.md, doc/questions/q508.md-q512.md, doc/decisions/0080-*.md, this file
Inputs:     spec/** headings, the ADRs, doc/workflow.md; the term counts P28 measured (gate: 229
            under spec/, 2,588 under doc/)
Outputs:    (1) doc/glossary.md, two tables — PRODUCT (run, region, join, live branch, stuck,
                outcome record, fold input, gate as a node kind, ...) and PROCESS (ladder, rung,
                gate as a command, an item's Gate line, floor, probe, provocation, conformity
                reader, adequacy reader, always-read set, ...)
            (2) one question per term-sense with no defining heading, raised from Q508-Q512 —
                at least the gate collision
            (3) ADR 0080
Depends on: W116 (questions are files, so its questions are written in the new shape)
Blocks:     W119 (`term` reads this format), W118
Tests:      every row's third cell is exactly one relative link with an anchor, and M1/M2 resolve
            it; a term-sense whose only definition is in a work item or plan is NOT a row — it is
            a question
Gate:       L0-L6 via gate:full; one reader, conformity only, spec first: does each row's one line
            say what its target says, and nothing more
Reserves:   Q508-Q512, ADR 0080
```

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2):

| file | why |
|---|---|
| `scripts/check-markdown.mjs` | `M5`'s anchored-link floor, 28. Every glossary row carries an anchored link in `doc/`'s top level, which no `removes` probe cuts, so the glossary raises the whole tree, probe 1, probe 2 and `M5`'s own probe by the same count, and 28 leaves the window `M5`'s probe and probe 2 need. Measured before the first edit, in staged copies: whole tree 584 / 5,269 links / 191 sources / **35** anchored, probe 1 146 / 144 / **35**, probe 2 117 / 116 / **15**, `M5`'s probe **20**. `M3` (362) and `M4` (120) do not move: one document and one source arrive in every fixture, and probe 2's 116 sources become 117, still below 120. ADR 0079 consequence 7 is the precedent; ADR 0080 amends ADR 0078 decision 1, whose number this is |
| `doc/decisions/README.md` | a row for ADR 0080 in the hand-kept index, or `check-docs`' `X11` goes red. Inside rule 5's `doc/decisions/**`, so not strictly an exception — named because the index leaves at W119 |
| `scripts/check-markdown-selftest.mjs` | **LATE — not named before the first edit.** One comment beside `M5`'s probe said, in the present tense, that stripping `doc/scheduler-upstream.md` *"takes the corpus to 20 against a floor of 28"* and empties *"the document that holds most of them"*; this item's floor made both false. Found by the withdrawn-claim grep (section 1 rule 5), corrected in place with a dated note. No probe, META entry or code line changed |

## Scope

**In**

1. Rows for terms with a heading that defines them in `spec/`, an ADR, or `doc/workflow.md`.
   **The row's one line is shorter than its target and claims nothing the target does not.**
2. The *gate* collision as a question: does one of the three senses get renamed? **This item does
   not rename anything.**
3. Its question links written as `[Q<N>](questions/q<N>.md)` from the start, so W118 has nothing
   to rewrite here.

**Out**

- Adding the glossary to the always-read set — P28 decision 4.
- A check clause of its own. `M1` and `M2` already resolve every link and anchor in it, and W119's
  `term` refuses a row it cannot parse.

## Verification

- `npm run check:markdown` by exit code.
- The conformity reader's row-by-row verdict, in the Record.
- `npm run gate:full` once, on the final tree.
- *Routing cases: not applicable.*

## Record

**Status: built to its gate; the conformity reader RAN and its four defects are NOT YET ACTED ON**
— they wait for the maintainer, and the commit carrying this Record carries them. Everything here ran on the uncommitted tree over
`839d83a` — no sha yet.

**Files changed.** Owns: `doc/glossary.md`, `doc/questions/q508.md`-`q511.md`,
`doc/decisions/0080-the-glossary-points-and-never-defines.md`, this file. Exceptions, declared above
before the first edit: `scripts/check-markdown.mjs` (`M5`'s floor) and `doc/decisions/README.md` (the
ADR index row; inside rule 5's record step). **One LATE exception**:
`scripts/check-markdown-selftest.mjs`, one comment, found by the withdrawn-claim grep after the floor
moved — the exceptions table says what and why. Nothing else: `git diff --name-only` and
`git status` list exactly these ten paths.

**Gate — what ran.** Every command RUN and redirected, `$?` read in the same command, Node 24 by
`fnm use 24` in every shell.

| Clause | Verdict | Notes |
|---|---|---|
| the floor measurement, BEFORE the first edit | **RAN** | staged copies under `dev-dist/w120-<pid>/`, removed afterwards; a control adding one dead link turned `M1` red in its copy and nowhere else. Whole tree 584 documents / 5,269 links / 191 sources / **35** anchored; probe 1 146 / 144 / **35**; probe 2 117 / 116 / **15**; `M5`'s probe **20** |
| the floor measurement, AFTER the glossary | **RAN** | the same harness: whole 590 / 5,328 / 193 / **83**; probe 1 147 / 145 / **76**; probe 2 118 / 117 / **56**; `M5`'s probe **68**. So `M5`'s window is `(68, 76]` and the floor is **72**, its midpoint. `M3` (362) and `M4` (120) unmoved — probe 2's 117 sources are still under 120, a margin of three |
| `npm run check:markdown` | **RAN, EXIT 0** | 590 documents, 5,328 relative links in 193, 83 anchored; M1-M6 ok |
| `M1` and `M2` provoked on the glossary, by hand | **RAN, both CAUGHT for the reason they name** | a broken ANCHOR in a row (`#3-the-run-level-outcome-vocabularyX`): EXIT 1, failing set exactly `{M2}`, the line naming `doc/glossary.md`. A broken PATH (`workflow-x.md#the-refusal-ledger`): EXIT 1, exactly `{M1}`. Each edit asserted to change the file; the restore compared by bytes and digest, identical; `check:markdown` EXIT 0 after. **Not checked in** — no check clause is declared, so there is no self-test entry, and this row is the whole of the evidence |
| every row's shape, read once by a script that is not a check | **RAN** | 25 PRODUCT and 23 PROCESS rows; each exactly three cells, a plain-text `term`, no link in the `sense`, and a `defined at` cell that is exactly one relative link with an anchor into `../spec/`, `decisions/0…` or `workflow.md` — 0 malformed |
| `npm run check:register` | **RAN, EXIT 0** | 392 question files; R1-R8 ok; R6 read 48 ADRs; R7 checked 135 ids; R8 compared 12 pairings and excused Q466 -> ADR 0077 |
| `npm run check:docs` | **RAN, EXIT 0** | `X11` compared the README's 48 rows against the 48 ADRs on disk, both ways |
| `npm run check:markdown:selftest` | **RAN, EXIT 0** | 274 s alone, before the gate. 42/42 probes caught; **META 41/41 noticed — 30 by the named probe, 11 by the corpus**, against W117's 32 and 9; 7/7 bounded. The next row is why |
| the same self-test on `HEAD`, in a scratch copy | **RAN, EXIT 0** | `git archive HEAD` into `dev-dist/w120-22162-head/` (0 links, removed after): 42/42, **META 32 / 9**, 7/7 — W117's figures. Its verdict lines diffed against this tree's: **exactly two differ, both now *by the corpus***: `slug()`'s link-rendering clause, and the whitespace-run collapse. Both are consistent with the glossary's links into `spec/run-state.md` sections 8 and 9, whose headings carry a link and a dash between spaces — the first anchored links into such headings; that cause is inferred, not isolated. Every META entry is still noticed. *The first attempt ran `check-markdown-selftest.mjs` directly, printed NOTHING and exited 0 — it is not an entry point; the npm script is `check-markdown.mjs --self-test`. Not counted* |
| CR bytes | **0** in every file this item wrote or edited | `tr -cd '\r'` counted per file over `git diff --name-only` and the untracked files |
| **`npm run gate:full`, the CONFIRMING gate** | **RAN ONCE, EXIT 0** | in this checkout, Node v24.20.0, on the final tree with only this row unwritten and the tree held still: **1,222 s**; selftests **1,083.9 s wall** over 9 lanes, 4,044.8 s serial-equivalent, 10/10 ok. `check:register:selftest` 1,070.0 s, the slowest lane; `check:markdown:selftest` 567.2 s, 42/42 caught, META 41/41 (30 / 11, as above). `check:markdown` in the ladder: 590 documents, 5,332 links in 193, 83 anchored. The word `FAIL` occurs 12 times in the log, each inside a passing test's name; 0 failing lines |
| conformity reader | **RAN** (a fresh-context agent, spec first — P28 decision 4, the declaration, ADR 0080 — then each target section read BEFORE its row's line; it edited nothing) | **no BLOCKING row; 48 rows read, the format contract held on all 48, coverage of Outputs (1) complete, Q509-Q511 confirmed undefined in all three homes, Q508's counts re-measured and matching.** **Four DEFECTs, NOT YET ACTED ON**: **D1** the `fold input` row lists ADR 0014 rule 1's six kinds as though exhaustive, and the current spec adds `regionEntered`, `resumed` and `gated` (`src/fold/run-state.ts`) — faithful to its target, false of the product; **D2** decision 6 below says the 7 ADR-pointing rows raise *every fixture but probe 1* — probe 2 cuts `doc/decisions` too (+41, not +48; the window arithmetic is unaffected); **D3** the exceptions table's *by the same count* and ADR 0080 consequence 4's *rise together* — the pre-edit prediction, never corrected: measured 48 / 41 / 41 / 48; **D4** ADR 0080 decision 2's *the only home the process vocabulary has* — 5 of 23 PROCESS rows point at ADRs. **NOTEs**: N1 `quiescent point`'s sentence sits under a `> ###` heading that `M2` does not see, and whether GitHub anchors it is unverified; N2 P28 decision 4 still names only `spec/` and ADRs and carries no amendment notice; N3 Q508 attributes a `Gate:` line to `doc/workflow.md` section 1 rule 1, which says only *verification gate*; N4 `confirming gate` is a fourth gate-bearing row Q508 does not mention; N5 the `check:markdown` row's 5,328 links was not re-taken (5,332 on the final tree). Weaker lines, still OK: `effective outcome`'s condition, `run state`'s *driver's own*, the item-gate sense (borderline *not a definition*), `Owns`, `probe`'s *one provocation*. **Its overlap is not measurable**: one reader |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `doc/glossary.md`, a PRODUCT and a PROCESS table | yes — every term the declaration lists has a row: run, region, join, live branch, stuck, outcome record, fold input and *gate* as a node kind; ladder, rung, *gate* as a command, an item's verification gate, floor (as *vacuity floor*), probe, provocation, both readers and the always-read set | `M1`/`M2` hold each link; `M5` now counts them; W119's `term` parses the tables. **Nothing holds a sense line** — ADR 0080 consequence 1 |
| (2) a question per term-sense with no defining heading | yes — Q508 (the *gate* collision), Q509 (*declared ceiling*), Q510 (*survivor*), Q511 (*META entry*) | `check:register` R1-R3 hold their shape |
| (3) ADR 0080 | yes | `R6`-`R7` hold its front matter; `X11` its index row |

### Decisions the plan did not make, each taken here

1. **The format W119 parses**, stated in the glossary's own `## Format` section and in ADR 0080
   decision 4: the tables sit under exactly `## PRODUCT` and `## PROCESS`; the header row is exactly
   `| term | sense, in one line | defined at |` then `|---|---|---|`; the `term` cell is plain text,
   repeated unchanged in each row of a term with several senses; the `sense` cell is one line with no
   link; the `defined at` cell is exactly one relative link with an anchor and nothing else. **Question
   links live in a `## Not rows` LIST after both tables**, never in a row, so `term` has nothing to
   skip.
2. **What counts as a heading that defines a term: the nearest heading enclosing the defining
   sentence**, wherever that sentence sits — a list item, a table cell or a block quote, none of which
   carries an anchor `M2` resolves (a heading inside a block quote, `> ###`, is not one: measured with
   `check-markdown`'s own `anchorsOf`). Applied to every row. The alternative, every such term a
   question, would have left most of `doc/workflow.md`'s vocabulary unindexed. *quiescent point* is
   the sharpest case: its definition is in a block quote under `spec/run-state.md` section 3.
3. **A definition must SAY what the term is; using it is not defining it.** That is what separates
   the four questions from the rows. *window* was drafted as Q512 and became a row on reading ADR
   0078's Context — *a floor is a two-sided window for the PROBES*, with both edges and an empty
   case — so **Q512 is unused**. *declared ceiling* stayed a question: ADR 0078 consequence 2 names
   two instances and defines neither, and Q509's note records that the always-read set's byte
   *ceiling* is a second sense of the word.
4. **The homes are `spec/`, the ADRs and `doc/workflow.md`** — W120's declaration, wider than P28
   decision 4's *a `spec/` section or an ADR*, and 18 of the 23 process rows point there.
   `doc/concept.md` and `CLAUDE.md` are not homes, which ADR 0080 decision 2 states.
5. **The `term` cell is spelled as the defining text spells it**: `fanout`, the node kind, not
   *fan-out*; `vacuity floor`, not *floor*; `Owns` and `Reserves`, the declaration fields.
6. **`M5`'s floor 28 -> 72, recorded as an amendment of ADR 0078 decision 1** (ADR 0080 consequence
   4) rather than a silent retune, since that decision states the number. **The window narrowed from
   15 wide to 8**: probe 1 cuts `doc/decisions`, a link into a cut directory is dead and not counted,
   so the 7 rows pointing at ADRs raise every fixture but probe 1. Each future ADR-pointing row
   narrows it by one more; the arithmetic is beside the floor.

**The term counts, measured before citing them.** `git grep -oiw gate` — case-insensitive, whole
word, tracked files only, so `dev-dist/` is excluded twice over. At `aa43cb3`: **229** under
`spec/**/*.md` and **2,588** under `doc/`, which are P28's figures and the predicate that reproduces
them (`spec/` with its JSON examples reads 233). On `839d83a`: 229 and **2,666**. ADR 0080 and Q508
cite the `839d83a` figures with their predicate and commit.

**Questions raised**: [Q508](../questions/q508.md), [Q509](../questions/q509.md),
[Q510](../questions/q510.md), [Q511](../questions/q511.md), all open with no owner. **Q512 is
unused.** ADR 0080 is used.
