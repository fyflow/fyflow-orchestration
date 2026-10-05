---
id: ADR 0078
title: "A vacuity floor's window is a property of the probe SUITE, and an alternative refused before a cut is not refused after it"
status: accepted
date: "2026-10-03"
item: W113
raised-by: ""
supersedes: ""
amends: ADR 0076 decision 3
resolves: ""
---

# ADR 0078 — A vacuity floor's window is a property of the probe SUITE, and an alternative refused before a cut is not refused after it

**Supersedes:** nothing. **Amends:**
[ADR 0076](0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md) decision 3 — its window
`(13, 15]` and the fourth of the four alternatives it priced and refused. Adds `M7` and `M8` to
`check-markdown`.

**Id note:** [P27](../plans/p27-what-a-register-row-is.md) reserved ADR **0076-0077** and
[W112](../work-items/w112-the-budget-the-check-and-the-floors.md) took both, so this id extends that
plan's block. [W86](../work-items/w86-score-each-item-then-fan-out-per-item.md)'s precedent: an item
derives the next free id by grep and says so. **The maintainer was asked and chose this over the two
alternatives** — no ADR at all, and amending ADR 0076 in place — because *the reservation being
exhausted is not an argument that no decision was made*, which is the reason W113's own first
`Spec:` line gave and which its conformity reader refused.

## Context

ADR 0076 decision 3 handed W113 a measured obligation rather than a surprise: `M5`'s floor must move
when the register's cut deletes its probe's subject, *"post-cut the corpus carries **28 anchored
links over 7 documents**, the largest holder is `doc/scheduler-upstream.md` at **15 anchored / 10
distinct**, and `M5`'s floor lands in **`(13, 15]`** with its probe re-pointed there."* It also
priced four alternatives and refused all four, the fourth being **probe 2 given `M5` in its declared
set**, which it measured as needing `floor > 455` today and `floor <= 28` after.

**On the tree the cut actually produces, that window is EMPTY — and so is every alternative's.**
Re-measured by W113 in a staged copy, with a control that adds one dead link and must see it:

| quantity | whole tree | − `doc/decisions` | − `decisions` + `plans` | strip upstream | strip register |
|---|---|---|---|---|---|
| anchored links | 35 | 35 | **17** | 20 | 33 |
| documents carrying an anchored link | 9 | 9 | 2 | 8 | 8 |
| distinct anchors resolved | 24 | 24 | 12 | 14 | 22 |

A floor is a two-sided window for the PROBES, which `check-markdown.mjs` says in its own struck
paragraph. While probe 2 must stay quiet the upper edge is `min(whole, p1, p2)`, and
`− decisions + plans` is **17** because `doc/plans` holds 12 of the 35 anchored links and
`doc/workflow.md`'s five all point INTO it. Stripping the largest remaining holder leaves 20, and
20 ≥ 17, so the window is **`(20, 17]`** — empty. The same arithmetic empties it for all three
quantities and both candidate subjects.

**The figures ADR 0076 handed over were right about the shape and wrong in both edges**: its 13 was
the strip-upstream figure at `9906c35`, its 15 the `−decisions−plans` figure there, and its 28 the
whole tree's. W112's own measurement predated that item's document edits; W113 measured 20 / 17 / 35.
*(W113's own summary table then said of `(13, 15]` that "the lower edge is right", which is wrong
too — both edges are invalid. Its conformity reader found it.)*

## Decision

1. **`M5`'s floor is 28, its probe strips `doc/scheduler-upstream.md`, and the second `removes`
   probe DECLARES `M5`.** The window with that declaration is `(20, 35]` and 28 is its midpoint,
   which is [W80](../work-items/w80-what-a-run-time-result-check-is.md)'s rule for a two-sided one.
   All four constraints hold and each is a measurement rather than a reading: the check passes at
   35, probe 1 stays quiet at 35, **probe 2 fires at 17 and says so**, and `M5`'s own probe fires
   at 20.

   The fixture's NAME and comment change with it. It read *"the LINK floor, with the anchors left
   alone"*, which was true while the register held 440 of the corpus's 473 anchors and is false now:
   that fixture leaves 17 of 35. *A fixture's declared set is a claim about what the fixture DOES,
   and a prose cut three directories away changed it.*

2. **A vacuity floor's FEASIBILITY is a property of the probe SUITE, not of the check.** This is
   decision 1 of ADR 0076 read one level out. That decision answered *what should the floor COUNT*
   and its criterion was the churn the floor guards against; W113 measured that **the quantity was
   never the constraint here** — all three candidate quantities give an empty window, and
   re-pointing `M5` the way `M4` was re-pointed would not have helped. What decided it was another
   probe's declared set. **So when a floor has no valid value, the next question is not *what else
   could it count* but *which probe's declared set is holding the upper edge down*.**

3. **An alternative refused before a cut is not refused after it.** ADR 0076 priced alternative 4 on
   the PRE-cut tree, where the register's 444 self-links put the whole-tree count at 477 and no
   value satisfied both halves. The cut is what makes it available. **The refusal was sound and its
   scope was the tree it was taken on**, which is `doc/workflow.md` section 1 rule 5's writing
   clause — *a claim states the scope it was MEASURED at* — applied to a REFUSAL rather than to a
   figure. A refused alternative in an accepted ADR is re-priced by the item that changes the tree
   it was priced on, not inherited.

4. **`M7` and `M8`: the register is a TABLE, and it is one row per question — scoped to
   `doc/open-questions.md` by name.** W113's declared Output said Q131 was *"fixed BY CONSTRUCTION
   and asserted"* and narrowed the second half to a measurement, because a CORPUS-WIDE table clause
   fires on **20 content-dropping rows in 10 documents**, eight of them outside that item's reach.
   **Its adequacy reader measured the one thing the item never priced: scoped to the register the
   count is ZERO**, so the clause is non-vacuous on a tree where a row is broken and clean on the
   shipped one — which is v0.22's test for a control, *you can name the tree on which it fails while
   its claim passes*. *An item that narrows a clause owes the narrower clause a price too.*

   | | refuses | whose case it is |
   |---|---|---|
   | `M7` | a row whose cell count differs from its header's; a row that does not open AND close with a pipe; a row being read as a HEADER because the table above it ended; an unclosed code, bold or italic run | [Q131](../questions/q131.md) (three mechanisms, seven rows), [Q135](../questions/q135.md) (table termination), [Q215](../questions/q215.md) (pipes inside a code span), [Q442](../questions/q442.md) (a blank line), and the inline-markup class nobody had named |
   | `M8` | two rows for one id; fewer rows than `REGISTER_ROW_FLOOR`; either heading missing | that a register IS one line per question; the RE-BALLOON; and the two headings every anchored link into the file resolves to |

   **The single subject is a REDUCTION in scope and is recorded as one**, on `X10`'s precedent after
   [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 5. Widening
   it to the corpus is [Q407](../questions/q407.md), which now carries the 49-in-22 figure; what
   stops it is twenty rows nobody has fixed, not the clause.

5. **The register gets no SIZE bound, and `M8`'s duplicate clause is what sees a re-balloon
   instead.** P27 decision 1 puts the register in the *read when needed, with no budget* set, so a
   ceiling on it would contradict the decision that made it a reference. The reader measured the
   restore of HEAD's 721,528 bytes as nine-checks-green and P27 decision 2 names the worry — *a
   habit this register has re-ballooned from once already*. **What catches it is structural**:
   HEAD's register carried **427 row lines over 357 ids**, so `M8` reads a re-balloon as 70
   duplicates. Measured: restoring HEAD fires `M7` eight times and `M8` once. *A size bound would
   have been a second budget; a duplicate-id bound is the register's own definition.*

## Consequences

1. **`REGISTER_ROW_FLOOR` is a ratchet that never needs lowering, which is the opposite of
   [Q102](../questions/q102.md)'s hazard.** A register row is never deleted, because an id is never
   reused (`doc/workflow.md` section 3), so the count is monotonically non-decreasing and a floor
   below today's is valid for ever. It moves UP by choice, never down by obligation. **The first cut
   was 200 and the reader's edit deleting ONE HUNDRED rows survived it** — 257 is still above 200 —
   so it ships at 350 against 357.

2. **Two declared ceilings, each with the tree that fails it named.** A deletion of one to seven
   rows is invisible: the ids ARE the source and there is no second list, and an equality would be a
   ratchet every item that raises a question must bump, which is the shape this repository refuses.
   And removing the preamble's two navigation links alone is invisible to `check:markdown`: it
   breaks no reference, and the full self-test catches it as a rule 7 (b) abort on the `M2` probe
   whose anchor it was. **Both headings now have an observer that is not that probe**, which is
   obligation (c)'s LIMIT discharged — the reader found the chain *heading ← nav link ← one probe's
   7 (b) guard* was one observer deep.

3. **The `M4`-floor META entry ABORTED on the probe name this decision changes**, and it is the
   THIRD time that one entry has fired rule 7 (b) — pinned to a magic NUMBER at W33, to a magic
   FIELD at W112, and now to a magic NAME. Re-anchored. *An entry can be agnostic about a floor's
   value and its field and still be pinned to the prose of the probe it names.*

4. **W113's cut found the largest render defect in this repository's history, and neither W112 nor
   W113's own instrument could see it.** `18eee73` on 2026-09-02 — *"the pointer convention applied
   to every resolved question"* — deleted `| Q | Question | Resolution |` and `|---|---|---|` from
   the register's `## Resolved` section. For **31 days and 100 commits** touching that file the
   whole Resolved half, 28 rows growing to 76, rendered as a paragraph of literal pipes, with
   `check:markdown` EXIT 0 throughout. **Both of W113's readers found it independently**, and W113's
   own §3 could not: that section measured cell counts *"against the header width of the table each
   row sits in (4 for Live, 3 for Resolved)"*, and an instrument that assumes a header width for a
   section with no header cannot see that there is no table. *It is Q135's mechanism — table
   termination, which that row names at ONE row — applying to half the file.* `M7` catches it:
   restoring HEAD fires it eight times.

5. **What is NOT fixed.** The twenty content-dropping rows in ten documents stay broken, and
   `M7`'s single subject is why the gate is green over them ([Q407](../questions/q407.md)). The
   twenty-eight rows that render with a column EMPTY rather than discarded stay too, for the same
   reason. Nothing bounds the register's SIZE, by decision 5. And `check:budget`'s own membership is
   still three paths bound to three more paths in a self-test
   ([Q465](../questions/q465.md)'s surviving half) — what W113 closed is the other half, the
   instruction that made a fourth document always-read.
