# W114 — `CLAUDE.md` is guidance, and `npm run state` is the index

**Status:** done — 2026-10-04; see the Record. Declared 2026-10-03 on `0950859` ([W113](w113-the-register-is-a-reference.md)),
before any file under `Owns` was edited.

**Plan:** [P27](../plans/p27-what-a-register-row-is.md)

```
Spec:       NONE — this item writes no spec rule and changes no behaviour. It cuts one
            document, ships one derivation, makes two header lines parseable, lowers one
            check's ceiling and re-anchors the self-test entries pinned to it.
            **NO ADR is reserved and this item's stop-and-ask (a) is whether it needs one.**
Owns:       CLAUDE.md (its own Owns rather than an exception — the record step is FIVE
              files since [ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md)
              decision 1 and this is not one of them)
            scripts/state.mjs, package.json (its one new entry)
            scripts/check-budget.mjs, scripts/check-budget-selftest.mjs
              (obligation (d) is to lower that check's ceiling, and NINE literals in its
              self-test are pinned to the value that moves — declared up front, because
              W113's only `Owns` audit failure was these two files for this exact reason)
            doc/work-items/TEMPLATE.md (its status vocabulary)
            the `**Status:**` line of **13 item files** — 7 that had none and 6 whose line
              CONTRADICTED their own Record — and of **3 plan files**, and NOTHING ELSE IN
              THEM. **`doc/plans/TEMPLATE.md` is NOT touched and no plan question line is
              added**, because the H1 title is a third declared source; see section 4.
              *(This line read "16 item files and the question line of 5 plan files",
              prescribing two roads this item measured and ABANDONED. BOTH readers found
              it: the shipped tree is better than the authority W115 would have read.)*
            doc/work-items/w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md
Inputs:     P27 decisions 1, 2, 4 and 5; [W113](w113-the-register-is-a-reference.md)'s Record
            and its four handed-over obligations; ADR 0077 decisions 1-3 and consequence 2;
            ADR 0078 decision 4 and consequence 5. **EVERY figure re-taken at this
            declaration step (P15 decision 5), and FOUR of the handed-over ones are wrong
            — three of them in the direction that makes this item look larger than it is.**
            Section 2's table
Outputs:    (1) `CLAUDE.md` under P27 decision 1's 25 KB budget: the `Current state` block
            DELETED to git, and what remains cut by the share decision 4 asks for
            (2) the home demonstration, W107's method as W113 corrected it — per status
            block rather than per paragraph, with the owning file READ and not merely
            grepped, and with the one genuinely homeless region named
            (3) **`npm run state`** — P27 decision 5, prototyped at the declaration and
            shipped here: the next free ids, each recent plan's and item's state read from
            ITS OWN file, and the live counts from the files that declare them
            (4) the preconditions (3) needs, measured smaller than the brief hands over:
            a parseable `**Status:**` line in every item file — **7 files, not 55+ or 16** —
            and the plan question line **already satisfied in all 27 once the H1 title
            counts as the third declared source, so ZERO plan files are edited**. What the
            measurement found INSTEAD is the finding: **six item files and three plan files
            whose Status line contradicted their own Record**, which is section 1 rule 5's
            one named source for a status
            (5) the live paragraph W113 added to `## Working rules` SURVIVES — W113's
            obligation (c), the closed half of [Q465](../open-questions.md)
            (6) `check:budget`'s `CLAUDE.md` ceiling and total lowered to this item's own
            post-cut measurement — W112's obligation (d), and the LAST act
Depends on: W112 (the budget and the floors) and W113 (the register), both DONE. Neither
            blocks a byte of this, and the dependency is that `check:budget` must already
            exist for (6) to lower anything
Blocks:     W115 — the exit artifact needs this file under its ceiling to claim the budget MET
Tests:      `check:budget` + `:selftest` on the tree this item ships; `check:markdown` +
            `:selftest`, which is what proves no link died; `check:source` + `:selftest`
            for the manifest clauses the new entry reaches. **`npm run state` is asserted by
            its own invocation** — stop-and-ask (b). Expected values come from section 2's
            measurements, never from a check's output
Gate:       L0, check:budget (+selftest), check:markdown (+selftest), check:source
            (+selftest), check:wiring (+selftest), check:spec (+selftest),
            check:docs (+selftest), then **`npm run gate:full`** as the CONFIRMING gate
            (v0.26 — `npm run gate` is NOT an item's confirming gate)
Reserves:   **Q472-Q478 — Q472-Q473 are P27's last two and Q474-Q478 extend that plan's
            exhausted block by grep (the highest register row is Q471), on
            [W86](w86-score-each-item-then-fan-out-per-item.md)'s and W113's precedent —
            and NO ADR.** The maintainer was asked and chose both, 2026-10-03; the three
            answers are at the foot of this file
```

## What this item is

It deletes 93.2% of the document that loads into every session, and it replaces the deleted thing
with a derivation rather than with a smaller copy.

`CLAUDE.md` is **570,963 bytes**. Its `## Current state` block is **532,021 of them**, and that block
says of itself, on fifty separate lines, *read every status from the item's own file, never from this
line.* [P27](../plans/p27-what-a-register-row-is.md) decision 1 gives the file a **25 KB** budget;
decision 4 says a fact the tree computes is not written down; decision 5 says the block becomes
`npm run state`; and
[ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) consequence 2 froze
the block so that **the budget is reachable by deletion alone**.

**Its hard part is not the deletion.** It is W107's demonstration — *what goes must be shown to have
a home FIRST* — applied to 2,549 lines, with W113's correction in force: **a phrase search answers
whether the WORDS have a home, not whether the FACT does** ([Q468](../open-questions.md)). Section 3
is that demonstration, and it names the one region that has no home.

## 1. Section sizes, re-taken

`CLAUDE.md` at `0950859`: **570,963 bytes, 3,052 lines** (3,053 is the split-array length; the file
ends in a newline and carries no CR).

| region | lines | bytes | share |
|---|---|---|---|
| title and lead | 1-4 | 92 | 0.0% |
| `## What this project is` | 5-20 | 1,021 | 0.2% |
| **`## Current state`** | **21-2569** | **532,021** | **93.2%** |
| `## The fact that reframes the whole repo` | 2570-2588 | 1,154 | 0.2% |
| `## The invariant everything hangs off` | 2589-2608 | 1,390 | 0.2% |
| `## How work is done` | 2609-2856 | 20,801 | 3.6% |
| `## Working rules` | 2857-2915 | 4,498 | 0.8% |
| `## Facts about fyflow-scheduler that catch people out` | 2916-2984 | 5,760 | 1.0% |
| `## Sibling repositories` | 2985-2993 | 510 | 0.1% |
| `## Environment` | 2994-3034 | 2,444 | 0.4% |
| `## Git` | 3035-3052 | 1,272 | 0.2% |
| **what stays** | | **38,942** | **6.8%** |

## 2. Four of the handed-over figures are wrong, and three in the direction that matters

**Before calling any of them wrong the predicate is stated and checked against the one the claim
uses** — [Q469](../open-questions.md), where W113 called P27's *17%* wrong at *4%* using six
phrasings, none of them the phrase the rows use, and P27 had been right.

| figure | handed over | measured | the predicate, and why they differ |
|---|---|---|---|
| `CLAUDE.md`'s size | 556 KB (P27) / 570,963 (brief) | **570,963 bytes** | P27's figure is 557.6 KiB read as KB and taken before W112's and W113's edits. The brief's is right |
| the `Current state` block | 519 KB (P27) / 532,020 (brief) | **532,021 bytes**, L21-2569 | the brief is one byte low: it counts the region WITHOUT line 2569's terminator. The accounting that matters is `block + stays = total`, and 532,021 + 38,942 = 570,963 exactly |
| what stays | 37 KB (P27) / 38,943 (brief) | **38,942 bytes** | the same one byte, from the other side |
| **where decision 4's copied figures are** | *"about a third out of the 38,943 that remain, which is where P27 decision 4's copied figures are"* | **ZERO of them are in what stays. All 343 are in the block** | measured one class at a time over both regions, PER LINE: L1-L5 counts 193/0, census quadruples 75/0, `check:spec` triples 33/0, L6 assertion counts 34/0, refusal counts 8/0. Bare numbers are **3,990 in the block against 138 in what stays** — and under ONE predicate the densities are **3.5 per KiB in what stays against 7.4 across the file**, not the 8.6 this row first printed, which was P27's figure under P27's predicate set beside mine. *(The conformity reader found the mixed predicate — [Q469](../open-questions.md)'s hazard, one paragraph after this table cites it. The conclusion is unmoved and the comparison is now apples to apples. That reader's own census-quadruple figure of 74 is neither reading: it is **75** per line, **76** if a figure may span a line break.)* **So the 34% cut from what stays is NOT decision 4's class** — §5 says what it is |
| distinct `**Status:**` value shapes | FORTY | **50 raw / 9 normalised**, and **neither is 40** | predicate A (the raw value verbatim) is 50; predicate B (strip bold, take the text before the first dash) is 9. I could not construct a predicate that gives 40, and say so rather than adopting it |
| what the `**Status:**` precondition COSTS | *"not ADD the line (7 files) but make its VALUE parseable (55+)"* | **7 files** | 55 is `87 − 32 bare `done``, which is predicate C. **A parse does not need a bare `done`; it needs a parseable LEADING TOKEN**, and under that predicate **74 of 87 already parse**. The 13 that do not split into **4** `reserved` — a fifth state the template did not declare, added to it — and **9** `**DONE** 2026-09-26 — see the Record`, whose separator is already THERE with the DATE between it and the word. *(This row said **7 + 9 = 16 files** and prescribed inserting a separator into the nine. They are byte-identical to `HEAD` on that line: matching the vocabulary as a word-boundary PREFIX is one expression in one file against rewriting nine items' prose, and `state.mjs`'s own docstring records the choice. **The conformity reader found the item still prescribing the abandoned road.**)* |
| what the `Question:` precondition COSTS | *"6 of 27 parse"* | **ZERO files** | three predicates, not one: the fenced `Question:` line is **6**, `doc/plans/TEMPLATE.md`'s own `**Question this plan answers:**` is **16**, either is **22 of 27**, and the H1 TITLE carries it for the remaining **5** — so **27 of 27 identify with no plan file edited**. **So P27 decision 5's *"P25's did not parse"* is the prototype reading one of two declared shapes**: P25 uses the template's. *(This row said **5 files**. Writing a question line into P18 would have been the AUTHOR's question and not the plan's — that file states no question sentence anywhere — which is the one thing W107's method forbids, so the title became a third declared source and is MARKED as one in the output.)* |
| `npm run state` | ABSENT | **ABSENT**, and the gate chain is **16 entries** | both right |
| the tree | `gate` and `gate:full` EXIT 0; `check:markdown` 186 / 6830 in 181 / 35; `check:budget` 893,682 against 897,741 with `CLAUDE.md` at 575,022; `check:spec` 7 / 72 / 132; census 362 / 282 / 1 / 79 | **every one re-run and confirmed** | `check:budget` and `check:markdown` RUN and redirected at this declaration step, both EXIT 0, figures identical |

**And the register's [Q465](../open-questions.md) row is stale by W113's own work**, which this item
found by looking up the row obligation (c) names. It reads *"The always-read set is three paths bound
to three more paths, and a FOURTH always-read document is invisible to the budget."* ADR 0077
consequence 5 says the first half stands and **the second does not** — W113 withdrew the instruction
that made the register always-read, so there is no fourth always-read document. A WITHDRAWN claim
surviving in the register is `doc/workflow.md` v0.14's third direction, and the register is a
record-step file, so it is corrected there rather than here.

## 3. The home demonstration — W107's method, as W113 corrected it

**The instrument was wrong twice before it was right, and both are [Q470](../open-questions.md)'s
class**, which is why the procedure is stated before the result.

1. **v1 split the block on BLANK LINES.** The block has runs of five consecutive non-blank owner
   lines (L78-82 is W103, P25, W101, W100 and W99 with no blank between them), so five owners'
   distinctive tokens were scored against one owner's file and the coverage read **27%**.
2. **v2 captured the owning directory WITHOUT its `doc/` prefix**, so every one of the 92 owner paths
   resolved to a file that does not exist — and **the WRONG-OWNER control could not see it, because
   both sides were missing.** *A control that compares two broken readings passes.* W113's own
   `resolveLinks` defect, reproduced in the item that inherited it.
3. **v3 asserts a RESOLUTION FLOOR before it reports anything** — fewer than 80 owner paths resolving
   is a refusal rather than a number — and carries the wrong-owner control.

### The result

| | |
|---|---|
**The predicate, stated exactly, because the conformity reader could not reproduce the figure from
the sentence alone and the instrument is not shipped** (P22 stop-and-ask (a): a declaration's facts
are re-run, never checked in). Over lines 21-2569 of `HEAD`'s `CLAUDE.md`, segment into PARAGRAPHS —
maximal runs of non-blank lines — and a paragraph OPENS a status block when its first line, leading
`*` stripped, matches `^\[(W\d+|P\d+)\]\(doc/(work-items|plans)/[pw]\d+-[a-z0-9-]+\.md\)`; every
other paragraph belongs to the block above it.

| | |
|---|---|
| paragraphs in the block | **350** |
| status blocks under that predicate | **105** |
| blocks whose headline cites an item or plan FILE | **104** |
| those files that exist | **104 of 104** |
| those files carrying a `## Record` or a `## Retro` | **104 of 104** |
| **distinct owners** under the OTHER predicate — any LINE may open a block, which is what the token screen below uses | **92** |
| distinct items cited | **77** · plans **26** · ADRs **39** |
| lines in the block declaring themselves a COPY | **50 lines**, carrying **104 occurrences** |
| **the one region with no owning file** | **L21-22, 3,936 bytes — the `## Current state:` HEADING, which is the id ledger** |

*(The two segmentations are two counts of one thing and both are reproducible: 105 blocks by
paragraph, 92 distinct owners by line. The conformity reader's proxies gave 123-130 and it said so
rather than adopting the figure, which is what a reader should do with a number whose instrument is
not in the tree.)*

**Distinctive-token coverage, as a SCREEN rather than a discharge:** 1,101 tokens (16-hex digests,
3-6 digit numbers, `FD-`/`RN-`/`JP-`/`OR-`/`ID-`/`RT-` rule ids) over 92 owners; **168 are not present
in the owning file — 15.3%.** The control scores the same blocks against the NEXT owner's file and
gets **78.9%**, so the match is about the owner rather than about the corpus.

**The 15.3% was then READ, and it is three things, none of them homeless:**

| what the missing tokens are | the home, by READING |
|---|---|
| **census quadruples and ladder counts** — 320/247, 338/264, 266/207, 297/232, 191/139, 256/199, 410, 373, 426, 1720, 2207 … | decision 4's own class. The live values are in `examples/l6.ts` (`DECLARED_TOTAL` 2435, `DECLARED_RUNS` 161), in the register and in a check's output. The copies in the block are STALE: P1's paragraph states `410 assertions` and `six normative documents and 73 numbered rules` against today's 1516 and 7 / 72 / 132 |
| **ADR and spec rule ids** — 0025, 0013, 0014, 0029, 0042, FD-V19, JP-R8, ID-R4, OR-R10 … | the ADR's own file and the `spec/` document that defines the rule. Verified by reading: the three-ADR table in the W19-attributed region is the **W5** paragraph, and ADR 0013, 0014 and 0015 each carry it in full |
| **tokens my splitter attributed to the wrong owner** | read one by one. All **13** of the figures scored against W53 — 262 B/node, 469, 456, 1025 KiB, 516.77 ms, 2207.94, 110 of 124 — are in **P15's own plan file**, where they are that plan's declaration facts |

**Four things read rather than screened, because a phrase search cannot discharge them:**

1. **`doc/workflow.md`'s v0.9 and v0.8 blocks**, against `CLAUDE.md`'s own v0.9 and v0.8 summaries.
   The owning document carries everything the summary does and more — including the two *"Rule 7 (c)
   is unexercised for the fifth / fourth plan"* paragraphs and *"the two-reader split is settled at
   ten measurements"*, which are the two paragraphs in that section that cite no file.
2. **`doc/workflow.md` section 6**, against `CLAUDE.md`'s reader-pass paragraph. Section 6 carries the
   band, the sequence, the split, the per-plan lists, the overlap ledger and *"the cost is roughly
   double"* — which is the **fact** under `CLAUDE.md`'s *"budget for the pass"*. And the copy is
   **stale**: it says *ten* overlap measurements and a **1-4** band where section 6 says **fifty-nine**
   and **0-4**.
3. **P26's `## Retro`** and **W110's `## Record`**, against their paragraphs: both carry the three
   changes, the defect counts, the ceiling re-run and the confirming gate, in fuller form.
4. **The three live facts the block carries that are not a status**: *`npm run gate` runs
   `test:browser`, which is CHROMIUM ONLY* (in **24** other tracked `.md` files, including
   `doc/README.md`); *the runner counts `test()` cases, not assertions* ([Q98](../open-questions.md)'s
   own row); and *a register entry was wrong* ([Q43](../open-questions.md)'s resolved row,
   `spec/run-state.md` section 5, and `doc/workflow.md`'s v0.8 block).

### So the only thing with no written home is the ledger, and that is what `npm run state` derives

L21-22 is the `## Current state:` heading: *"the next plan starts at W103, Q427 and ADR 0070 — derived
by grep off the tree at W98's record step, never from this sentence"*, plus six parenthetical
corrections of its own earlier versions. **Its own sentence says it should be a derivation**, and
decision 5 makes it one.

## 4. The two preconditions, and they are 21 files rather than 76

### Precondition 1 — the item `**Status:**` line: 16 files

`doc/work-items/TEMPLATE.md` declares the vocabulary: **`todo | in progress | in review | done`**.
Measured over all 94 item files, the LEADING token — bold stripped, text before the first dash — is
one of those four in **74 of 87**.

| | files |
|---|---|
| **no `**Status:**` line at all** — add one | **7**: W103, W104, W105, W107, W108, W109, W110 |
| **`done <date>` with no separator** — insert one | **9**: W73, W74, W92, W93, W94, W96, W97, W98, W99 |
| **`reserved`, a FIFTH state the template does not declare** | **4**: W56, W60, W64, W68 |
| already parseable | 74 |

The four `reserved` files are items reserved and never issued, which `doc/workflow.md` section 3
calls *skipped, never reissued*. **It is a real fifth state**, so the template's line gains it rather
than four files being rewritten into a word that is false of them.

### Precondition 2 — the plan question line: 5 files

| predicate | plans |
|---|---|
| a fenced `Question:` line | **6** of 27 |
| `doc/plans/TEMPLATE.md`'s `**Question this plan answers:**` | **16** of 27 |
| **either** | **22** of 27 |
| **NEITHER** | **5**: P14, P16, P17, P18, P19 |

All five state their question in the H1 title, and **three of the five titles are interrogative and
two are not** (`# P18 — A flow and its runtime from documents alone`, `# P19 — What a schema buys an
author`), so the title is not a reliable source and the five get the template's line.

**Rewriting the 21 that use the other declared shape buys nothing and is not done.** Two spellings of
one fact in two files is one fact spelled twice, not two copies of it; `state.mjs` declares both
patterns in one list and reads whichever exists.

## 5. Where the 34% comes out of what stays, and it is not decision 4's class

What stays is 38,942 bytes against a 25,600-byte budget, so **13,342 bytes (34.3%)** must go — and
§2 measured **zero** of decision 4's copied figures in it. The measurement says where they are
instead:

| | bytes | share of what stays | its home |
|---|---|---|---|
| **the 21 version summaries, v0.26 down to v0.6** (L2618-2831) | **18,943** | **48.6%** | **`doc/workflow.md`'s own v0.N blocks — all 21, verified: that file carries 24, v0.3 to v0.26, at 473 to 18,150 bytes each.** The three it carries that `CLAUDE.md` does not summarise separately are v0.3, v0.4 and v0.5 |
| the workflow pointer's two correction parentheticals | ~360 | 0.9% | archaeology about this file's own staleness |
| four more correction parentheticals in what stays | ~1,100 | 2.8% | same |
| the `0.5.2` source-loading bullet's nine-day history | ~900 | 2.3% | W37's file, ADR 0029, `doc/scheduler-upstream.md` |

**A summary of a document the reader is also told to read is the purest second copy in the file** —
`CLAUDE.md`'s own `## How work is done` opens *"read it before starting any work item"*, and
`doc/workflow.md` is in the always-read set. So the section keeps its pointer, the loop's shape, the
ladder and the commands, and loses the 21 summaries.

**That cut alone takes what stays to 19,999** — 38,942 − 18,943, under budget — which is why the
live guidance can stay generous: every working rule, every scheduler hazard, every environment
hazard and the whole of `## Git`'s live content survive. The shipped file is larger than 19,999
because this item also ADDS: the `## Where the work is` section, the two new hazards (`dev-dist/`'s
tree copies and the heredoc newline), the scheduler group bullet moved out of the block, and the
corrections below. *(This read "~21,000"; the conformity reader derived 19,999 and the difference is
what was added rather than kept.)*

## Scope

**In**

1. `CLAUDE.md`'s `## Current state` block (L21-2569) DELETED. Nothing is archived to a file
   (P27 decision 2); the history is `git`.
2. `## How work is done` loses the 21 version summaries and keeps the pointer, the loop, the ladder
   and the commands.
3. The correction archaeology in what stays goes; every live claim it corrected is restated in the
   present tense.
4. **`scripts/state.mjs` and the `state` entry in `package.json`** — the next free `p`/`w`/`ADR`/`Q`
   ids derived BOTH from the tree's maximum and from the retro ledger, with a disagreement printed
   rather than resolved; each recent plan's and item's state from its OWN file; the live counts from
   `examples/l6.ts`, `package.json` and the register.
5. The two preconditions: 16 item `**Status:**` lines, 5 plan question lines, and both TEMPLATEs.
6. `check:budget`'s `CLAUDE.md` ceiling and `TOTAL_CEILING` lowered to this item's own post-cut
   measurement, and the **nine** literals in `check-budget-selftest.mjs` pinned to the old value
   re-anchored — rule 7 (b)'s THIRD firing on this file's ceilings, predicted here rather than
   discovered.

**Out** — named, with where it goes instead

- **`doc/README.md` and `doc/workflow.md`.** W115's, and `doc/README.md` is
  [Q466](../open-questions.md). **`doc/workflow.md` section 1's loop diagram still says the record
  step updates `CLAUDE.md`**, twenty lines above the rule that says it left the list — found here,
  reported, and NOT fixed, because that file is W115's.
- **The `## Working rules` paragraph W113 added.** Obligation (c): it must survive, and it does.
- **Any `spec/` document, any ADR, any test.** `src/`, `test/` and `examples/` are untouched.
- **Re-wording a live rule.** What stays is cut and restated, never re-decided.
- **Lowering any floor or ceiling but `check:budget`'s**, which is obligation (d).

## Verification

Every rung RUN and redirected, `$?` read on its own line, never piped (section 4, v0.16).

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| the budget | `npm run check:budget`, `npm run check:budget:selftest` |
| no link died | `npm run check:markdown`, `npm run check:markdown:selftest` |
| the manifest clauses the new entry reaches | `npm run check:source` + `:selftest` |
| the dispatch clauses | `npm run check:wiring` + `:selftest` |
| the rest | `check:spec`, `check:docs`, each with its self-test |
| the derivation | `npm run state`, and its own refusal path |
| confirming gate | **`npm run gate:full`** |

*Routing: not applicable. No rung of L1-L6 reads a document this item edits, which is P27 prediction
4 and is asserted by those rungs' counts not moving.*

**The claim most easily made falsely here** is that nothing a reader needs was lost, because
`check:markdown` proves every link that EXISTS resolves and says nothing about a fact that stopped
being written down. §3 is what discriminates them, and its weakest point is stated: a token screen
is a claim about WORDS, so the four reads in §3 are the discharge and the 15.3% is the screen.

**The second** is that `npm run state` cannot go stale. It cannot carry a stale COPY; it can carry a
stale DERIVATION — a parse that silently matches nothing reports an empty index as confidently as a
full one. Stop-and-ask (b) is about exactly that.

## Declared exceptions

Paths outside `Owns` and outside the record step's five:

| path | why | predicted? |
|---|---|---|
| the `**Status:**` line of **six item files** — W5, W6, W12, W100, W101, W112 | **`npm run state`'s fifth run found each one CONTRADICTING its own `## Record`**, in the one place `doc/workflow.md` section 1 rule 5 names as a status's source. Shipping a derivation that reports W112 as `in progress` would be a worse index than the block it replaces, so the correction is part of the deliverable rather than tidying. Each new value comes from that file's own Record. **Both readers found the exception**, and the conformity reader found the FINDING recorded nowhere | **no** — the 7 missing lines were predicted; six files saying the opposite of themselves were not |
| the `**Status:**` line of **three plan files** — P25, P13, P1 | P25 was found by this item's own new agreement clause and by BOTH readers; P13 and P1 by the readers. P1's is the claim THIS ITEM falsified: its header read *pending W5's spec-conformity pass* and W5's own header, corrected above, says the pass ran | **no** |
| `doc/workflow.md`, four lines (L1023, L1765, L2059, L2838) | **this cut made four claims there false** — three say `CLAUDE.md` *has carried* a sentence it no longer does and one says it *records* something it no longer records. v0.14's third direction: a WITHDRAWN claim is SEARCHED FOR. The readers found three; the fourth is this item's. **That file is W115's and is not a record-step file, so the maintainer was ASKED** and chose to correct all four here rather than ship them | **no** |
| `scripts/check-budget.mjs`, `scripts/check-budget-selftest.mjs` | **declared in `Owns` at the declaration**, not late — obligation (d) is to lower that check's ceiling, and W113's only `Owns` audit failure was these two files for this exact reason |  |

**Within the record step's five**: the plan's Record, `doc/README.md` (its *seven files in all, as
`CLAUDE.md` counts them* — the new file counts nothing), `README.md`, `doc/open-questions.md`
(including the stale [Q465](../open-questions.md) row §2 names) and `doc/decisions/**`
(ADR 0073 decision 1's cell, which still gave `CLAUDE.md` *the state of the work*).

## Record

**Status: DONE.** `CLAUDE.md` is **23,160 bytes / 339 lines from 570,963 / 3,052 — a 24.7x cut** —
and `check:budget` reports it **MET**: 22.6 KiB against P27 decision 1's 25.0 KiB target, the first
member of the always-read set to arrive. The set is **345,928 bytes from 893,682, a 2.6x drop**, and
the first time that number has moved DOWN by a cut rather than up by a record step.
**`npm run state`** ships and is the index. **NO ADR** — the maintainer was asked and chose none.

**Gate — what ran.** Every rung RUN and redirected, `$?` read on its own line, never piped.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, EXIT 0** | `lint`, `typecheck` (five lanes) |
| `npm run state` | **RAN, EXIT 0** | **21 derivations, none empty**, over 8 declared SUBJECTS compared both ways |
| `check:budget` | **RAN, EXIT 0** | **345,928 bytes against a lowered 350,024**; `CLAUDE.md` 23,160 / **25,600 MET**, `doc/concept.md` 17,125 / **17,408 MET**, `doc/workflow.md` 305,643 / 309,690. **`B5` is a new clause** |
| `check:budget:selftest` | **RAN, EXIT 0** | **14 probes, 13/13 caught, 1/1 control clean, 4/4 grader controls, 9/9 SOURCE, 13/13 META noticed by the NAMED probe, 14/14 SELF**, digest unmoved — after the five FAIL lines the adequacy reader predicted |
| `check:markdown` | **RAN, EXIT 0** | **187 documents, 6141 relative links in 182 of them, 35 anchored** from 186 / 6830 / 181 / 35. **The cut removed 693 links and NO floor moved**: `M3` 142, `M4` 120, `M5` 28 |
| `check:markdown:selftest` | **RAN, EXIT 0** | **37/37 probes caught, 37/37 noticed, 7/7 bounded** — after being **EXIT 1**, below |
| `check:spec` | **RAN, EXIT 0** | **7 / 72 / 132 UNMOVED**, which is what `Spec: NONE` asserts |
| `check:source` (+ selftest), `check:wiring` (+ selftest), `check:docs`, `check:scheduler`, `check:policies`, `check:workers` | **RAN, EXIT 0** | the new `state` manifest entry trips nothing: `S11` reads `check:*` only, `S12` reads the gate chain, `G3`'s universe is `check-*.mjs` |
| conformity reader | **RAN** | **50 values derived independently, 7 DISAGREED**, plus 4 declared Outputs not delivered, 3 instrument findings and 3 surviving withdrawn claims — 5 blocking |
| adequacy reader | **RAN** | **69 mutations, 54 survived, 22 distinct real holes, 15 blocking**, plus two findings that needed no mutation at all |
| rule 8, both readers' exact edits checked in | **RAN** | **43 probes: 26 CAUGHT, 12 declared ceilings HELD, 4/4 grader controls as declared, 1 control clean, ZERO undeclared survivors, ZERO against declaration, ZERO aborts.** Digest `35ac2117d07dffe0` identical at both ends over 464 files |
| L1-L5 | **RAN, EXIT 0** | **56 files / 1516 assertions UNMOVED** in node, deno and chromium |
| L6 | **RAN, EXIT 0** | **2435 assertions over 161 real runs, 0 failed, UNMOVED in BOTH runtimes** on `fyflow-scheduler` 0.5.2 |
| **`npm run gate:full`** | **RAN, EXIT 0, ZERO lines beginning `FAIL`** | the confirming gate (v0.26). **`selftests` 9/9 completed, 9 ok, 762.3 s wall against 2728.6 s serial-equivalent over 8 lanes.** Digest **`67d2f87c9d20bbf5`** over 464 files immediately after it. **The only change since is this cell and the two rows above it**, which add no link and which no rung reads; `check:markdown`, `check:budget` and `npm run state` were re-run after writing them and are EXIT 0. *(This item's FIRST `gate:full` was never started: `check:markdown:selftest` was already known EXIT 1 from defect 1, and starting a confirming gate over a tree with a known red lane is the error W113 paid for by stopping its second run mid-way. The lane was fixed first, re-run alone to EXIT 0, and only then was the whole gate paid for — once, on the final tree.)* |

### The figures

| | before | after |
|---|---|---|
| `CLAUDE.md` | 570,963 bytes / 3,052 lines | **23,160 / 339** |
| its `## Current state` block | 532,021 bytes, 93.2% | **deleted to git** |
| the always-read set | 893,682 | **345,928** |
| `check:budget` ceilings | 575,022 / 309,690 / 20,000, total 897,741 | **25,600 / 309,690 / 17,408, total 350,024** |
| `check-budget` clauses | `B1`-`B4` | **`B1`-`B5`** |
| `check:markdown` | 186 docs / 6830 links in 181 / 35 anchored | **187 / 6141 in 182 / 35** |
| item files with a parseable `**Status:**` | 87 of 94 | **95 of 95** |
| item files whose header contradicts their Record | **6** | **0** |
| plan files whose header contradicts their own file | **3** | **0** |
| `npm run state` | absent | **21 derivations, 8 subjects** |

### What broke

**Twenty-nine defects. The largest turned this item's own declared CONFIRMING GATE red, and the
sharpest was found by BOTH readers from opposite ends.**

*Found by a RUNG, and all read correctly:*

1. **`check:markdown:selftest` EXIT 1 on the tree this item shipped, caused by ONE LINK this item
   added** — `FAIL M1 doc/decisions AND doc/plans removed — wanted [M1,M3,M4,M5], got
   [M1,M3,M4,M5,M6]`, 36/37. Exactly **four** documents in the tree carry no relative link and **all
   four sit inside the two directories that probe strips**; `doc/work-items/TEMPLATE.md` was the
   fifth, outside them, until Output (4)'s edit put a `[W114](…)` link in it — which closes `M6`'s
   gap in the probe's tree. `M6`'s own durability argument says the gap *"cannot close while the
   templates exist"*; it closes if a template gains a link. **`npm run check:markdown` itself stayed
   green**, so only the lane outside `npm run gate` could see it — **ADR 0070 consequence 2 on the
   first item after v0.26 made `gate:full` an item's confirming gate**, and the item's own `Tests:`
   row nominates that lane by name. Fixed by writing `W114` as bare text, which is what the
   template's own `**Plan:**` placeholder already does *"so a link checker does not chase the
   placeholder"*. **It is also P27 prediction 2's reversal in a form the prediction does not
   enumerate**: `M6` is a RELATION rather than a counting ratchet, and it reversed on a link ADDED
   rather than on a cut.
2. **`npm run state`'s own assertion fired on its first run**, reading `DECLARED_TOTAL` as **2174**
   off a COMMENT at `examples/l6.ts:11082` — *`git show` at W98's commit gives `DECLARED_TOTAL =
   2174`* — where the declaration twenty lines down is 2435. The floor could not see it, because
   2174 is a plausible number; `const` is in the pattern now and the defect is in the header.
3. **`check:budget:selftest`'s coverage bound refused `B5`** the moment that clause existed — *`B5`
   has no probe; `B5` has no META entry naming a probe of it* — which is a bound catching its own
   clause's author.
4. **`B5` fired on its own first run, on a member this item was not looking at.** `doc/concept.md`
   has MET its 17,408-byte target since before P27 was declared and its ceiling sat **2,592 bytes
   above it**, so the budget could be un-met for that file by writing into it. Lowered to the target;
   the honest cost is that its headroom is now **283 bytes**.
5. **Five FAIL lines in `check:budget:selftest` once obligation (d) landed**, which the adequacy
   reader predicted and priced. Four are ONE interaction: **`B5` fires on any probe that stages
   `doc/workflow.md` small**, because that makes it meet its 35,840-byte target while its ceiling is
   still 309,690. *A clause added to a check becomes a site of every probe that stages its subject.*
   Closed by staging that file one byte over its target rather than at 100.
6. **The harness's own v0.11 restore assertion caught a HARNESS defect on its first run** — at `d1`,
   the first probe in the set with two edits to one file. It pushed one snapshot per EDIT and then
   reversed the array IN PLACE, so after writing the original back it compared the file against the
   after-edit-1 bytes and threw `RESTORE FAILED` on a correctly restored tree. W37's and W58's
   defect, in the mechanism written to refuse it.

*Found by BOTH READERS, from opposite ends:*

7. **`npm run state` published two FALSE plan statuses, and the right answer was already computed
   and DISCARDED.** `status: raw ? leading(raw) : structural` prefers a stale Status LINE over the
   structural reading. **P25** printed `declared 2026-09-29` while its own file carries a `## Retro`
   and its Record reads `COMPLETE 2026-09-30`; **P13** printed `in progress` though its retro
   produced workflow v0.14. The conformity reader derived P25's state from its own file; the adequacy
   reader inverted the preference and watched the right answer appear, then provoked it by writing
   `todo` into P26. **P27 decision 5's founding anecdote worked only because P26 had no Status line
   at all.** The fix is the comparison this script already does for the id ledger: the two are
   compared, the disagreement is printed, and an EQUALITY assertion makes it exit 1. *The shipped
   sentence "it cannot go stale, because there is no copy to go stale" is false of a line and true of
   a comparison.*
8. **The two preconditions, as declared, prescribed roads this item measured and ABANDONED.** `Owns`,
   Output (4), Scope In 5 and §4 said 16 item files and 5 plan files; the tree is 7 and 0. The nine
   `done <date>` files are byte-identical to `HEAD` on that line. **The shipped answer is better and
   the authority W115 would read was worse**, which is the direction that matters.
9. **Nothing compared a budget member to its TARGET**, so *under the 25 KB budget* was a report
   string: the adequacy reader lowered `CLAUDE.md`'s ceiling to 40,960 — above the target — with
   every clause green, and the conformity reader measured the same gap from the undelivered-Output
   side. `B5` is the clause, and **a MET target is a RATCHET**: once a member is inside its target its
   ceiling may not sit above it, so the budget cannot be un-met by raising a number.

*Found by the ADEQUACY reader:*

10. **`titleOf`'s body replaced by a constant was ZERO changed lines at EXIT 0**, because the
    equality was a TRUTHINESS test. Closed by asserting the questions are DISTINCT, which a constant
    collapses to 1.
11. **`STATUSES` reduced to `['done']` alone passed EXACTLY** at 90 against a floor of 90 — four of
    five members gone, and the output then printed *TEMPLATE.md declares done*. Dropping `reserved`
    alone, the fifth word this item ADDS, was 91 against 90. Both closed by the equality.
12. **`maxOf` replaced by `Math.min` printed `P2 W2 Q2 ADR 0002` at EXIT 0**, and stop-and-ask (b)
    had promised *every next id > 0*. Closed by a SECOND ROUTE: the listings are sorted, so their
    last element is the maximum by a different expression, and a next id must exceed it.
13. **Four ledger patterns shared ONE summed floor**, so any one could leave; `nextPlan` had **no
    floor at all**, so half of Output (3)'s *derived BOTH ways* deleted while the control printed
    all-non-empty. Four floors now, one per pattern.
14. **`counts` deleted whole**, and **three of the `ASSERTIONS` floors could leave** at 10 against
    20 — including both L6 floors. Closed by a SUBJECT MEMBERSHIP compared both ways rather than by
    raising the count, because raising it to the length is a ratchet every added assertion must bump
    ([Q102](../open-questions.md)'s shape). **That fix then closed `d1`**, a ceiling this item had
    written off as Q217's unclosable regress.
15. **`openRows` could be wrong by 27** under a floor of 200, and `deferredRows` had none. Closed by
    a RELATION: every live row is open or deferred.
16. **Five of the seven added `**Status:**` lines could be removed** under a floor of 90 against 95.
    The equality closes it at one removal.
17. **The spent-id list was short by W26, W27 and W52** — W52's phrase WRAPS across a newline between
    `as` and `reserved`, and two plans write *skipped and never reissued* instead. **The limit is
    stated rather than closed**: the next plan to invent a sixth spelling is invisible, which is the
    defect P27 decision 5 named in its own prototype.
18. **`"state": "node --version"` and `"state": "node scripts/check-spec.mjs"` are both EXIT 0
    everywhere** — obligation (e)'s *was what it RAN what SHIPS*, on the one entry `S11` cannot
    reach. A declared ceiling: stop-and-ask (b) refused road (ii).
19. **`scripts/state.mjs` is read by `npm run state` and nothing else** — no tsconfig includes
    `scripts/`, `lint` covers `src/ test/ examples/ index.ts`. So `ASSERTIONS` is the entire control
    surface, which is stop-and-ask (b)'s answer measured rather than assumed.

*Found by the CONFORMITY reader:*

20. **Six item files edited outside the declared set with the finding recorded nowhere** — the second
    consecutive `Owns` audit failure after W113's, which is P2's retro's stated condition for
    bringing `check-owns.mjs` back. And the finding behind it is the strongest argument for this
    item's deliverable: `npm run state` at `HEAD` would have printed **`W112  in progress`**, this
    plan's own predecessor.
21. **Four more claim corrections in this item's own text**, each verified before adoption: *"every
    one of its 105 status blocks"* where §3 measured **104 of 105**; *"~21,000"* where the arithmetic
    is **19,999**; *"251 copies"* against §2's own **343**, now dropped because a count in a document
    is what decision 4 removes; and *"3.6 per KiB against the file's 8.6"* mixing my predicate with
    P27's — **7.4 under one predicate**, which is [Q469](../open-questions.md)'s hazard one paragraph
    after §2 cites it.
22. **Three withdrawn claims survived elsewhere, and a FOURTH was this item's own to find.**
    `doc/README.md`'s *seven files in all, as `CLAUDE.md` counts them* (the new file counts nothing);
    `doc/workflow.md` L1023, L2059 and L2838's *`CLAUDE.md` has carried…*; and **L1765's `CLAUDE.md`
    records P4 getting this same line wrong**, which neither reader named.
23. **ADR 0073 decision 1's table still gave `CLAUDE.md` *the state of the work***, with no pointer to
    ADR 0077's strike — and this item is what makes the cell unambiguously false.

*And the author's own, found by neither rung nor reader:*

24. **The home instrument was wrong TWICE, and the second time its own control could not see it.**
    v1 split the block on BLANK LINES, where the block has runs of five consecutive owner lines, so
    five owners' tokens were scored against one owner's file and the coverage read **27%**. v2
    captured the owning directory WITHOUT its `doc/` prefix, so all 92 owner paths resolved to files
    that do not exist — **and the WRONG-OWNER control passed, because both sides were missing.** *A
    control that compares two broken readings passes* ([Q470](../open-questions.md)). v3 refuses to
    report below a resolution floor.
25. **Emphasis was stripped only at the ENDS**, so `**in progress** — declared …` yielded `in
    progress**`, and 28 of 95 item statuses were unparseable.
26. **The ledger could not cross P26's mid-phrase `**`** and read **W103/Q427/ADR 0070** — the last
    plan whose bold happened to sit outside its ids — where the answer is W112/Q459/ADR 0076. It also
    took the last match in FILE order rather than the highest id. *A pattern that tolerates one
    author's emphasis is a pattern about that author.*
27. **The register census read 280 open against 282**, closed by parsing on CELL COUNT: the live
    tables are five columns and `## Resolved` is four, so the width tells them apart with nothing else
    to read. It derives **362 / 283 live / 79 resolved / 282 open / 1 deferred**, which is W113's
    census exactly.
28. **Probe `a6` was declared a ceiling and is a CATCH, and `c2` aimed at the report ROW rather than
    the source and SURVIVED** — two reads of one function, obligation (c)'s limit one expression
    apart. The grader caught the first; the second needed re-aiming at what a provenance probe is.
29. **`b1`'s `says` was written from ARITHMETIC and read WRONG-REASON** — 23,160 + 4,000 = 27,160
    against the 27,171 the check prints. W110's lesson: a `says` is read off the output, never
    computed from the declaration.

### The predictions

| | verdict |
|---|---|
| **1** (the REACH — the always-read set reaches 80 KB with nothing lost) | **ADVANCED, not met, and this item is the largest single move in the plan.** The set is **345,928 from 893,682** and `CLAUDE.md` is the first member to MEET its target; `doc/workflow.md`'s 305,643 is now **88% of what remains** and is W115's. *Nothing lost* is discharged by §3's home demonstration — 104 of 105 status blocks owned by a file that still carries its own Record, the 105th being the ledger `npm run state` derives — and by both reader passes, which found claims and bounds and no missing fact |
| **2** (`check:markdown` green through every cut) | **REVERSED, in a form the prediction does not enumerate, and the reversal is defect 1.** `check:markdown` stayed green at every step; **`check:markdown:selftest` went EXIT 1** on `M6`, which is a RELATION rather than a counting ratchet, and it reversed on a link this item ADDED rather than on a cut. Prediction 2's own reversal clause names *a fourth counting ratchet nobody enumerated*; this is not a ratchet at all |
| **4** (no rung of L0-L6 moves) | **CONFIRMED.** `check:spec` 7 / 72 / 132 unmoved, L1-L5 56 / 1516 unmoved (the conformity reader ran it), `src/`, `test/` and `examples/` untouched |
| **5** (removing a copied figure lets a CHECK go too) | **REVERSED, for the SECOND consecutive item, and for the same reason W113 recorded.** 343 copied figures left `CLAUDE.md` and `scripts/**` lost nothing: no check had any of them as its SUBJECT. `X7` compares `spec/flow-definition.md` to `AGENTS.md`, `X10`'s two `COPIES` entries are both `examples/README.md`, `X11` compares `doc/decisions` to its own README. **`scripts/**` GREW** — `state.mjs`, and `B5` in `check-budget.mjs`. *A copy removed is a check removed only when the copy was the check's subject* |

### Readers

**Conformity 50 values derived / 7 disagreed / 5 blocking; adequacy 69 mutations / 54 survived /
22 distinct real holes / 15 blocking. OVERLAP 3 — the SEVENTY-THIRD measurement**, inside the settled
0-4 band. The shared subjects are defect 7 (the stale plan statuses, reached from opposite ends),
defect 9 (the budget's ceiling against its target) and defect 8 (the preconditions smaller than
declared).

**The priming caveat is the OPPOSITE of W113's and that is deliberate.** W113's overlap was **7**, the
highest ever, and its own Record says *seven is a number about the briefs as much as about the
readers* because both prompts named the same four obligations and the same specifics. **These two
briefs were written to differ**: the conformity reader was given the authorities to read and its own
central obligation and no list of specifics; the adequacy reader was given the obligations as
questions rather than as answers. Three is what that produced, and it is comparable with the
measurements in the band.

**Two of the conformity reader's figures were its OWN error and are not adopted**, each with the
measurement beside it: *"fifty separate lines" is 50 occurrences on 46 lines* — it is **50 lines
carrying 104 occurrences**; and *census quadruples are 74* — **75** per line, **76** if a figure may
span a line break, and 74 is neither. **And its N11 saved this item from a correction that corrects
something already right** — [Q469](../open-questions.md)'s exact trap, which W113 recorded and which
this item had already walked into: I had *"three documents cite `1000s-10000s`"* down as wrong at six.
Six documents contain the string and **all six also contain `FLOW_PLANNING`**, so co-occurrence cannot
separate them; no predicate makes either number defensible, so the count is gone rather than picked.

### Questions

**[Q472](../open-questions.md)-[Q478](../open-questions.md) raised**, extending P27's exhausted block
by grep on W86's and W113's precedent, by the maintainer's answer to stop-and-ask (a).
**No ADR** — also the maintainer's answer. Census to be confirmed at the record step.

## Stop-and-asks — ALL THREE ANSWERED 2026-10-03, each as recommended

| | the question, priced | answer |
|---|---|---|
| **(a)** | **P27's id blocks are EXHAUSTED except Q472-Q473, and NO ADR id is reserved. May this item extend them by grep, on [W86](w86-score-each-item-then-fan-out-per-item.md)'s and W113's precedent?** Two things might need an ADR: the item status vocabulary gaining a fifth word `reserved`, and (b)'s answer. Priced: **no ADR** — the cut's authority is P27 decisions 1, 2, 4 and 5 and ADR 0077 decisions 1-3, none of which this reverses, and a template's vocabulary gaining a state the document already describes is smaller than W113's floor retune, which needed none for its own half; **ADR 0079** — only if (b) is answered in a way that decides something about what the gate must prove | **EXTEND to Q472-Q478 by grep; NO ADR.** As recommended |
| **(b)** | **Is `npm run state` a gate entry, and if not, what proves it still works?** It is a derivation with no verdict, so a gate entry would print 25 lines nobody reads and cost an edit to `GATE_CHAIN`. But a derivation that replaces a document section and then breaks leaves no index at all, and `S11` cannot see it — the name does not start with `check:`. Three roads: **(i)** not a gate entry, and the script ASSERTS ITS OWN DERIVATIONS — at least 27 plans, at least 94 items, every next id > 0, every count non-empty — exiting 1 otherwise, so a person's own run is the control; **(ii)** a gate entry, +1 to `GATE_CHAIN` and `S12`'s declared list; **(iii)** a `state:selftest`, which is a third self-test lane on a 790 s wall for a 60-line script | **(i) — NOT a gate entry, and the script asserts its own derivations.** As recommended: the cheapest thing that cannot report an empty index as a full one, and the only one of the three whose cost on the gate is zero |
| **(c)** | **Does `## How work is done` keep ANY version summary?** The 21 are a second copy of a document in the same always-read set, and the copy is measurably stale. Priced: **keep none** (−18,943, and the pointer does the work); **keep v0.26 only** (−18,113, so a reader sees the newest change without opening the file); **keep a one-line ledger of all 21** (−17,700, which is P27 fact 8's own answer, but the ledger it describes is `doc/workflow.md`'s and is W115's to build) | **KEEP NONE.** As recommended |

*(This file carried a SECOND `## Record` heading here, still reading "to be filled at the record
step", below the filled one above — in the item that found NINE files whose header contradicted their
own Record, and present on a tree whose `gate:full` was EXIT 0. Removed by P27's retro under pass 3
rule 6. No rung reads an item file's structure: `M7` and `M8` are scoped to the register by name.)*
