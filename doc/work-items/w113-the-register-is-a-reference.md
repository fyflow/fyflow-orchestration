# W113 — `doc/open-questions.md` is a one-line register, and a reference rather than required reading

**Status:** done
**Plan:** [P27](../plans/p27-what-a-register-row-is.md)

```
Spec:       NONE — this item writes no spec rule. It cuts one document, re-points one
            check-markdown floor, moves one probe, and adds two clauses. **ADR 0078**, which
            extends P27's exhausted block on W86's precedent — the maintainer was asked and chose
            that over no ADR and over amending ADR 0076 in place. *(This line read "No ADR: P27
            reserves 0076-0077 and both are taken, which is itself the signal", and W113's
            conformity reader refused it: an exhausted reservation is not an argument that no
            decision was made. The decision is reversing a refusal another ADR NAMED.)*
Owns:       doc/open-questions.md, scripts/check-markdown.mjs, scripts/check-markdown-selftest.mjs,
            scripts/check-budget.mjs, scripts/check-budget-selftest.mjs,
            doc/decisions/0078-*.md, doc/work-items/w113-the-register-is-a-reference.md
            (the two `check-budget` files were MISSING at the declaration and are not late
            exceptions: obligation (d) is to lower that check's ceiling, so Output (6), Scope In 5
            and the `Gate:` line all name it. BOTH readers found it, and it is the first `Owns`
            audit failure since the run of five that retired `check-owns.mjs` as a proposal —
            P2's retro's stated condition for bringing it back is a SECOND occurrence with the
            list correct, and this is one. ADR 0078 is in `doc/decisions/**`, which is a
            record-step file, and is named here because this item OWNS it rather than inherits it)
Inputs:     W112's Record, four obligations by measurement; ADR 0076 decision 3's window for `M5`;
            the register's own structure; check-markdown's M1-M6 and its two `removes` fixtures.
            EVERY figure re-taken at this declaration step (P15 decision 5), and SIX of the ones
            handed over were wrong — the table below
Outputs:    (1) `doc/open-questions.md` as a one-line register: 357 rows, one per question, each
            stating the question or the finding in a sentence, its status, its owner and a closing
            condition where the source gives one. The 357 row bodies go to git
            (2) the register declared a REFERENCE in its own preamble, and the *read before every
            work item* instruction WITHDRAWN at every site that asserts it — P27 decision 1,
            W112's obligation (c), half of Q465. **FIVE sites, not the "one live site" this row
            first claimed**: the register's own preamble, two in `CLAUDE.md`, `doc/README.md`'s
            register row, and the two ADR consequences that named the instruction and named this
            item as its withdrawer (ADR 0076 c.14, ADR 0077 c.5). Both readers found the count
            (3) Q131 fixed BY CONSTRUCTION **and ASSERTED by `M7` and `M8`** — no row renders
            with a cell discarded or a declared column empty, no table is interrupted, no inline
            run is left open, there is one row per question and both headings exist.
            **This item narrowed "asserted" to a measurement and its adequacy reader reversed the
            narrowing**: the corpus-wide clause is unaffordable at 20 content-dropping rows in 10
            documents, and the REGISTER-SCOPED clause — which the item never priced — is ZERO on
            the shipped tree and fires on a broken row. *An item that narrows a clause owes the
            narrower clause a price too* (Q467)
            (4) `M5` re-pointed — floor and probe — to the post-cut tree's largest anchor holder,
            under ADR 0076 decision 3, with the window re-derived rather than inherited
            (5) the probes this cut touches, enumerated BEFORE the cut: **TWO rewrite the
            register and the cut kills ONE**, which is re-pointed; the other survives unchanged.
            The "30 probes" figure W112 handed over is corrected to two, with the mechanism.
            *(This row said "the TWO probes this cut kills … both re-pointed", which §5's own table
            contradicts. Both readers found it.)*
            (6) `check:budget`'s ceiling lowered to this item's own post-cut measurement — W112's
            obligation (d), and the LAST act
Depends on: W112 — `M4` must already count documents rather than link instances, or a prose cut of
            this size turns `check:markdown` red on correct work
Blocks:     nothing. W114 and W115 cut different documents
Tests:      `check:markdown` + `:selftest` on the tree this item ships, which IS the post-cut tree;
            `check:budget` + `:selftest`; a structural assertion over the register itself for (3).
            Expected values come from the measurements below, never from a check's output
Gate:       L0, check:markdown, check:markdown:selftest, check:budget, check:budget:selftest,
            check:docs (+selftest, for X11 and the snippet floors), check:spec (+selftest, for C5),
            check:source (+selftest), check:wiring (+selftest),
            then `npm run gate:full` as the CONFIRMING gate
            (v0.26 — `npm run gate` is NOT an item's confirming gate)
Reserves:   Q467-Q471, **ADR 0078** (P27's block extended by grep — see `Spec:`)
```

## What this item is

It cuts the largest single document in the always-read set's orbit and takes it out of that orbit.
`doc/open-questions.md` is **721,528 bytes**, of which **86.9% is 427 table rows** whose mean length
is **1,469 bytes**. [P27](../plans/p27-what-a-register-row-is.md) decision 1 says what replaces it:
one line per question, and the instruction that it is read before every work item **withdrawn rather
than shrunk**, because 357 rows at one line each is the whole of a 77 KB budget on its own.

**Its hard part is not the size.** Every anchor into the file resolves to a HEADING and no citation
anywhere points at a ROW, so the rows can go — and that had to be verified rather than inherited.
What is genuinely at risk is the two self-test probes whose SUBJECT this cut deletes, and the figure
W112 handed over for them was wrong in the direction that matters.

## The declaration step's measurements

**SEVEN figures are re-taken below and FIVE of the handed-over ones were wrong** — one row is a
figure that was RIGHT and that this item got wrong, and one was right at the commit it was taken on.
W112's own Record says three of ITS inputs were wrong, which is why `doc/workflow.md` section 1
rule 5's re-take clause is in the `Inputs` line rather than assumed. *(This paragraph and the
`Inputs` line both said SIX over a seven-row table, and the register really was 710,445 bytes —
693.8 KiB — at `d287dc1`, which is P27's "693 KB" exactly. W113's conformity reader.)*

| figure | handed over | measured | where the handed figure came from |
|---|---|---|---|
| the register's size | **720,122** (brief) / **693 KB** (P27) | **721,528 bytes** | two readings taken before W112's record step, which added rows |
| the rows | **418** | **427 row lines over 357 distinct ids** | 70 ids carry a row in BOTH tables; 418 is neither count |
| rows whose Status and Owner render wrong | **eleven**, named | **SEVEN** | **FIVE** of the eleven ESCAPE their pipes — Q123, Q135, Q204, Q215 and Q301, 23 `\|` across those five and Q131 — so they render correctly. The measurement counted rows containing a pipe and did not ask whether it was escaped. *(This row said FOUR while §3's body said five; the conformity reader found both.)* |
| probes killed by the cut | **1 + "30 probes anchored on link text inside documents P27 cuts"** | **TWO rewrite the register and the cut kills ONE** | a probe's anchor must occur in the document it REWRITES. 26 of the 30 rewrite `doc/README.md`, which is W115's; their anchors merely also appear in a cut document |
| post-cut anchored links | **28 over 7 documents** | **35 over 9, and 24 DISTINCT** | measured at `9906c35`, before W112's own document edits. 24 distinct is ADR 0076's figure and is right both before and after |
| `M5`'s window | **`(13, 15]`** | **`(20, 35]`, and `(13, 15]` is EMPTY** — BOTH edges invalid | 13 was the strip-upstream figure at `9906c35` and 15 the `−decisions−plans` one there; this tree gives 20 and 17. *(This row said "the lower edge is right"; the conformity reader measured 20.)* |
| open rows stating a closing condition | **17%** (P27 prediction 3's scope) | **14.2% — so P27 was approximately RIGHT and this item's "4%" was the artifact** | 47 rows carry a `What would force it:` clause and **40 land in a live row's `Closes when` cell**; P27's first declaration measured 45 of 268 over ELEVEN phrasings and this item's instrument ran SIX, none of them the phrase the rows use. **The only figure here that corrects something already right**, and §7 diagnoses that exact instrument error one section earlier |

### 1. The register, in bytes

| region | bytes | share |
|---|---|---|
| preamble (L1-299, mostly one accretion log) | 78,018 | 10.8% |
| **427 table rows** | **627,279** | **86.9%** |
| `## Notes` (L766-end, dated 2026-08-29/30) | 13,171 | 1.8% |
| the cluster headings, their intros, and the tables' headers and separators | 3,060 | 0.4% |
| **total** | **721,528** | |

Row lengths: mean **1,469**, median **1,287**, max **8,429**, min **66**.

### 2. The taxonomy, and why 418 is neither count

| | |
|---|---|
| rows in the Live tables | **351** |
| rows in the Resolved table | **76** |
| ids appearing in BOTH | **70** — 34 of them a `*Resolved - see the Resolved table.*` stub, 36 a full essay whose status cell already says resolved |
| ids in Resolved ONLY | **6** — Q445, Q1, Q2, Q3, Q31, Q32 |
| **distinct questions** | **357** |

**Census CONFIRMED by derivation, 357 / 280 / 1 / 76**, which is what the file's own headline says
and what W112 recorded as 356 / 279 / 1 / 76 before Q466 was raised. **So the one-line register has
357 rows, not 418 or 427** — the 70 duplicates collapse, which is the cut removing a copy rather than
shortening one.

### 3. Q131 is SEVEN rows, not eleven, and the four that are fine are fine for a reason

GFM splits a table row on every unescaped `|` — including inside a code span, because the row is cut
before inline code is parsed — and **discards** cells beyond the header width. Measured one row at a
time, against the header width of the table each row sits in (4 for Live, 3 for Resolved):

| row | cells | renders Status as | renders Owner as |
|---|---|---|---|
| Q119 | 8 of 4 | `regions` | `^2) with the inner call doubled**. Found` |
| Q71 (live) | 5 of 4 | the tail of a type signature | the real Status |
| Q87 | **2, and the row never closes** | *(missing)* | *(missing)* |
| Q131 | 10 of 4 | a code-span fragment | `number` |
| Q343 | 5 of 4 | the question's own tail | `open` — and `no owner` is the DROPPED fifth |
| Q411 | 9 of 4 | `array` | `number` |
| Q415 | 6 of 4 | `'sample'` | a type fragment |

**Q123, Q135, Q204, Q215 and Q301 render CORRECTLY**, because they escape their pipes — 23 `\|`
across those five rows and Q131. Q131's own row escapes some of its pipes and not others, which is
how a row *about* unescaped pipes became an instance of them.

**And Q87 is a different mechanism that the count hides**: its row carries no closing pipe and is
followed by two blank-line-separated paragraphs, which **ends the GFM table**. The file carries a
paragraph saying so and a fresh header three rows later. So of the seven, six are a pipe and one is a
table termination.

### 4. Nothing cites a row, verified two ways

| | |
|---|---|
| anchored links targeting the register | **444**, by `check-markdown`'s own `resolveLinks` |
| of those, SAME-FILE | **444** — all of them |
| **cross-file anchored links into the register, from anywhere** | **ZERO**, by an independent grep for `](…open-questions.md#` across every tracked `.md`: no matches in no files |
| distinct anchors they resolve to | **2** — `#live` and `#resolved` |

So 444 anchored links resolve to two headings, and **no link anywhere targets a row.** Keeping
`## Live` and `## Resolved` as headings is the whole of what the cut must preserve.

*(The check's walk and a raw grep disagree by 11 — 444 against 455 — and the difference is
`blankCode`: eleven `](#live)` sit inside code spans. The check's figure is the one that matters,
because the check is what would go red.)*

### 5. The TWO probes this cut kills, and why the handed-over figure was 30

`doc/open-questions.md` appears in **code** in exactly one script — `check-markdown-selftest.mjs` —
at four sites, two of which are probes that REWRITE it:

| site | clause | what it does | verdict |
|---|---|---|---|
| L139 | `M2` | `](#live)` → `](#the-live-table)`, and its comment calls it the only probe for the same-file-anchor form — *the form `C5`'s pattern could not match* | **survives**, because the one-line register keeps two nav links |
| L430 | `M5` | strips every `](#…)` from the register | **dies** — post-cut the register holds 2 anchors, so stripping them cannot cross any floor |
| L128 | `M1` | rewrites `doc/README.md` | unaffected |
| L288 | `M1` | rewrites `AGENTS.md` | unaffected |

**The 30 is a category error and it is worth stating, because the same error would mis-scope W114 and
W115.** A probe mutates ONE document — its `file` — and its anchor must occur in THAT document.
W112's conformity reader counted probes whose anchor literal *also appears somewhere in* a document
P27 cuts; measured, 26 of those 30 rewrite `doc/README.md` and four rewrite `AGENTS.md`, `README.md`
or the register. `](workflow.md)` occurring six times inside the register is irrelevant to a probe
that rewrites `doc/README.md`. **The right predicate is *does this probe's anchor still occur in the
document it rewrites*, and for W113 the answer is two probes.**

*(W115 inherits the real version of that figure: **22 of the 26** `doc/README.md` probes anchor on
`# Documentation index`, its first heading, which a cut would keep. The four that anchor on prose —
`](workflow.md)` ×29, `](open-questions.md)` ×420, `](work-items/w24-…)` ×1 — are the ones at risk,
and the third is at risk TODAY at a single occurrence.)*

### 6. `M5`'s window, re-derived

`M5`'s floor is **60** against **477** anchored links today. The register holds **444** of them, so
the cut takes the corpus to **35** — the probe's subject is gone and no value satisfies both
`strip < floor` and `whole >= floor` with the register as the subject.

ADR 0076 decision 3 hands over `(13, 15]` with the probe re-pointed at `doc/scheduler-upstream.md`.
**The lower edge is the right quantity and the upper edge is a constraint the ADR does not state:**
the floor must also sit at or below what the two `removes` fixtures leave, or probe 1 (`[M1,M3]`) or
probe 2 (`[M1,M3,M4]`) starts firing `M5` and rule 7 (c) reports a set it did not declare. That is
the two-sided window `check-markdown.mjs`'s own struck paragraph is about, on a third floor.

The four constraints, to be measured on the tree this item ships rather than simulated:

1. the check passes — `anchored(whole) >= floor`
2. `M5`'s own probe fires — `anchored(whole − its subject) < floor`
3. probe 1 does not fire `M5` — `anchored(− doc/decisions) >= floor`
4. ~~probe 2 does not fire `M5` — `anchored(− doc/decisions − doc/plans) >= floor`~~ —
   **INVERTED, and this list is what proves no floor exists.** Under constraints 1-4 the window is
   `floor > 20` and `floor <= 17`: EMPTY. What ships is the opposite — **probe 2 DECLARES `M5` and
   must fire it at 17** — so constraint 4 drops and the window is `(20, 35]`, floor 28. A reader of
   this section alone could not reach the shipped floor; the arithmetic is in `check-markdown.mjs`
   beside it and in [ADR 0078](../decisions/0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md).
   W113's conformity reader, finding 12

Today's holders, by `resolveLinks` (sum 477, 9 documents):

| document | anchored | same-file | distinct |
|---|---|---|---|
| `doc/open-questions.md` | 444 | 444 | **2** |
| `doc/scheduler-upstream.md` | 15 | 15 | 10 |
| `doc/workflow.md` | 5 | 0 | 5 — all `](plans/p2N-….md#retro)` |
| five `doc/plans/*` files | 12 | 12 | 10 |
| `doc/work-items/w96-…` | 1 | 0 | 1 |

**So 477 is 24 distinct anchors wearing a large number's clothes — ADR 0076's figure exactly, and it
is not stale.** *(This paragraph said 28 and called the ADR's 24 pre-W112. 28 is the SUM of the
per-document distinct counts, which double-counts a target two documents cite, and this item's own
first verification script read it a THIRD way as 38 by not resolving the path. Settled with a
control: **24 before the cut and 24 after**, so the cut removed 442 anchored links and ZERO distinct
anchors — which is the sharpest form of this paragraph's own claim. W113's conformity reader.)*

### 7. `## Notes` has a home, and four paragraphs of it do not

[ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)'s method is
that what goes must be shown to have a home FIRST. The Notes section is 13,171 bytes dated
2026-08-29 and 2026-08-30 — the repository's first two days.

**And the first instrument built for this was wrong, which is worth more than the result.** A
case-sensitive phrase search reported **15 of 20 claims homeless**; the through-line *a suite cannot
answer a question nothing in it asks* is in `w3`'s own file capitalised, so the instrument measured
**string identity** and not whether the fact has a home. Re-run case-insensitively it reported 18 of
31 homeless, with a control phrase correctly homeless — **and reading the owning documents then
showed most of those 18 were false negatives too.** `w3-the-driver-and-the-validator.md` carries all
fifteen of the findings the three Notes paragraphs summarise, in fuller form: items 5, 6, 8, 9, 12
and 14 of its own *What broke* list, plus the mutation arc as `37 → 42 → 20 survivors while the suite
grew 68 → 142`. *A phrase search answers whether the WORDS have a home. W107's method is about the
FACT, and only reading the owning document answers that.*

| Notes paragraph | home |
|---|---|
| W3's three conformity passes, the through-line, `OR-R10` | `doc/work-items/w3-the-driver-and-the-validator.md`, *What broke* 5/6/8/9/12/14 and *What this taught* |
| the three-runtime requirement | `spec/runtime-targets.md` §*Inherited, not chosen*, which the paragraph itself names |
| W1's four ambiguities, `FD-V14` held with no rule, the symmetric guard | `doc/work-items/w1-the-normative-layer.md`, `spec/flow-definition.md`, ADR 0004 |
| `RESOURCE_EVENTS_PLAN` §11 → ADR 0007 | ADR 0007, and three more documents |
| Q4 refused as *sufficient* | ADR 0003 |
| `FLOW_PLANNING.md`, `SpawnTaskConfig.parents`, the sibling's three shared questions | `doc/concept.md`, `CLAUDE.md`, `doc/scheduler-upstream.md` — 8, 6 and 14 homes |
| **the register opened with nothing resolved / the sibling resolved eleven of thirteen** | **none, and nothing depends on it** — archaeology about the register's own first day |
| **the three gating questions cleared, both to the leaning** | `CLAUDE.md`'s *a leaning is not a decision* paragraph says the same thing of all four |
| **the useful part of an upstream document written for a different consumer was not the part addressed to a consumer at all** | **NONE** — a method lesson that says *worth a rule if it recurs* and never recurred. **KEPT**, three lines, because it has no home and a reader cannot derive it |

So `## Notes` goes to git with one retained paragraph and a one-line pointer, which is P27 decision
2: *a cut thing keeps a one-line index entry and its commit.*

*(**The table above groups about nineteen Notes blocks into nine rows and is not an enumeration**,
which W113's conformity reader asked to be said plainly. Two blocks it does not name — *0.3.0 landed
and the register was re-verified* and *ADR 0007 needed no rule changed* — are homed in Q32's resolved
row, `doc/scheduler-upstream.md`, ADR 0007 and `CLAUDE.md`'s timestamp hazard. That reader
spot-checked six of the nine claimed homes and found all six present, so *checked paragraph by
paragraph* is credible as a claim about the work and not as a claim about the table.)*

### 10. The largest render defect in this file's history, which neither W112 nor this item's own instrument could see

**`doc/open-questions.md`'s `## Resolved` section had NO header row and NO delimiter row, so it was
never a GFM table at all.** Every delimiter row in the register at `HEAD` sits at line 286, 309, 328,
340, 383 or 403 — the preamble's cluster table and the five Live cluster tables — and `## Resolved`
is at line 685. Without a delimiter GFM renders the block as a paragraph, so **all 76 resolved rows
rendered as literal pipe-delimited text.**

**Dated exactly:** `18eee73`, 2026-09-02, *"doc: the pointer convention applied to every resolved
question — the register loses a quarter"*, deleted `| Q | Question | Resolution |` and `|---|---|---|`
while reformatting every row beneath them. From that commit to `HEAD` is **31 days and 100 commits
touching this file**, with the section growing from 28 rows to 76 and `check:markdown` EXIT 0
throughout.

**BOTH readers found it independently, and §3 of this item could not.** That section measured cell
counts *"against the header width of the table each row sits in (4 for Live, 3 for Resolved)"* — and
an instrument that assumes a header width for a section with no header cannot see that there is no
table. **So SEVEN undercounts the defect at `HEAD` by the whole Resolved half**: it is
[Q135](../open-questions.md)'s mechanism, table TERMINATION, which that row names at ONE row,
applying to half the file. *Same shape as the case-sensitive home search in §7 — an instrument
answering a narrower question than the sentence around it, and under-reporting.*

**The shipped register fixes it** — `| Q | Cluster | Question | What resolved it |` with a delimiter
beneath — **and `M7` is what would have caught it**: restoring `HEAD`'s register fires `M7` eight
times and `M8` once.

### 8. What a row can and cannot say in one line — P27 prediction 3, measured before building

The question cell's first bold or italic span is already a one-sentence summary written by the item
that raised the row: mean **118 bytes**, median **115**, max **269**, and **23 of 357 over 200**.
That is the sentence, and taking it verbatim is more faithful than paraphrasing it.

**With two exceptions, both measured rather than assumed.** FOUR rows were PREPENDED with a later
update and carry their own first sentence behind a **`The original:`** marker — Q102, Q266, Q276 and
Q310 — so for those the leading span is an annotation and not the subject; the marker wins where it
exists, and Q102 is the row cited in 67 files. And a **Resolved** row's question cell is already a
question rather than an essay, so it is kept WHOLE: running the first-sentence rule over it dropped
half of Q6, which is two questions. *The method as stated is what produced both, and the second was
found by a reader rather than by the rule.*

**Two things the plan's row shape assumes are measured false:**

1. **296 of 357 headlines are not interrogative.** Only **61** end in `?`; the rest state a FINDING
   — *`OR-R6` is reachable from an inline pool and not from a thread pool, and no document says so.*
   Rewriting 296 findings into questions would replace measured sentences with mine, so the column is
   **the question or the finding** and the departure is recorded rather than smoothed. *Prediction 3
   holds on its substance — every row fits one sentence — with its wording narrowed: the sentence
   exists and is not always a question.*
2. **The closing-condition column is filled for 40 of 281 rows — 14.2% — and P27's 17% was
   approximately right.** The rows state it behind a **`What would force it:`** marker: 47 carry one,
   40 of them on a live row. P27's first declaration measured 45 of 268 over ELEVEN phrasings.

   *(**This item first measured 4% and called P27's figure wrong, and that was the only correction
   here that corrected something already right.** A union of six phrasings — *closing condition*,
   *forcing condition*, *closes when*, *reopens when*, *fires when*, *would reverse* — matched 11
   rows of which nine were false positives, and **none of the six is the phrase the rows use**. §7
   of this item diagnoses that exact error one section earlier: *a phrase search answers whether the
   WORDS have a home, and only reading the owning document answers whether the FACT does.* Written
   one section apart, in the same item, about the same instrument. Q469, and the conformity reader
   found it.)*

And the status and owner cells are nearly constant: on the SHIPPED file **255 of 281** live rows
have the literal status `open` and **225 of 281** have exactly `no owner`; on the OLD file, over its
**351** live rows, 250 and 219. *(This paragraph paired the old file's numerators with the new
file's denominator, which is section 1 rule 5's writing clause — a claim states the scope it was
MEASURED at. W113's conformity reader.)*

### 9. What the preamble loses, and the one thing that changes a ritual

The 78,018-byte preamble is an intro (16 lines), a seven-row cluster table, and an accretion log.
The cluster table's cells **name every one of the 357 ids a second time** and carry the *why it is
grouped* prose. **It goes, and the cluster headings under `## Live` become SEVEN — the table's own
seven, not the five that happened to be there** — so a question's cluster is where its row sits
rather than a second copy of the membership. **The `## Resolved` table gains a `Cluster` column**
for the same reason, so no id loses its cluster. That is P27 decision 4 applied to the register's
own largest copy.

*(**Scope In 1 and this paragraph both said FIVE headings and a THREE-column Resolved table**, which
is what shipped at neither: seven and four. The two extra headings — `Verification and fixtures`,
193 ids and the biggest cluster, and `Raised late` — and the extra column are ADDITIONS the item made
after discovering the cluster table was the authority, and this paragraph's argument was written
before that. The old file's own headline said *"in the seven clusters below"* above five headings,
which is probably where the five came from. **Both readers found the count.**)*

**Its one consequence is a ritual, and it is stated rather than discovered**: the per-item census has
been *the parser's sum agrees with the headline, and every id is in exactly one cluster cell*. With
one copy there is nothing to disagree with — the membership is structural and the totals are a
`grep -c`. **The headline count goes too, for the same reason.** *The answer to a fact that goes
stale is not a check that compares two copies, it is one copy* — P27 decision 4's own sentence, and
this is the clause of it that costs something.

## Scope

**In**

1. `doc/open-questions.md` rewritten: a ~16-line preamble declaring it a REFERENCE, `## Live` with
   **SEVEN** cluster headings and a five-column table, `## Resolved` with a **FOUR**-column table
   carrying each id's cluster, 357 rows, and `## Notes` reduced to its one homeless paragraph plus a
   pointer. *(This read five and three; see §9.)*
2. The *read before every work item* instruction withdrawn — in the register's own preamble, and at
   the one live site in `CLAUDE.md` that asserts it (a declared exception, below).
3. Q131 fixed by construction, and ASSERTED by **`M7`** (the register is a table) and **`M8`**
   (one row per question, both headings present) — register-scoped, with the corpus-wide figures as
   the reason for the scope. ADR 0078 decision 4.
4. `M5`'s floor **60 -> 28** and its probe moved to `doc/scheduler-upstream.md`, **and the second
   `removes` probe DECLARES `M5`**, which is the only configuration with a non-empty window
   (ADR 0078 decisions 1-3). The `M2` probe at L139 is **unchanged**.
5. `check:budget`'s ceiling lowered to this item's own post-cut measurement, as the last act.

**Out** — named, with where it goes instead

- **Any other document.** `CLAUDE.md` is W114's, `doc/README.md` and `doc/workflow.md` are W115's.
  The one `CLAUDE.md` sentence in scope is obligation (c) and nothing else.
- **`doc/README.md`'s own register-shaped status block.** [Q466](../open-questions.md), W115's.
- **`M3`, `M4` and every other floor.** `M3` counts documents and this cut deletes none; `M4` counts
  documents carrying a link and the register keeps two. Measured, not reasoned about.
- ~~**An ADR.**~~ **ADR 0078 IS TAKEN**, extending P27's exhausted block on W86's precedent, by the
  maintainer's answer to this item's one stop-and-ask. What it records is not the floor's value — a
  retune inside a measured window has never needed one — but **reversing a refusal ADR 0076 NAMED**,
  and the two clauses. P27 decisions 1, 2 and 4 remain the authority for the cut itself.
- **Re-wording any row's sentence.** The leading span ships verbatim where it fits, which is the only
  thing that keeps 357 rows faithful.

## Verification

Every rung RUN and redirected, `$?` read on its own line, never piped (section 4, v0.16).

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| the floors | `npm run check:markdown`, `npm run check:markdown:selftest` |
| the budget | `npm run check:budget`, `npm run check:budget:selftest` |
| C5's lift | `npm run check:spec` + `:selftest` |
| the rest of the chain | `check:docs`, `check:source`, `check:wiring`, each with its self-test |
| confirming gate | **`npm run gate:full`** |

*Routing: not applicable. `src/`, `examples/` and `test/` are untouched; no rung of L1-L6 reads a
document this item edits, which is P27 prediction 4 and is asserted by those rungs' counts not
moving.*

**The claim most easily made falsely here** is that no reference broke, because `check:markdown`
proves every link that EXISTS resolves and says nothing about a link that stopped existing. What
discriminates them is §4's measurement — zero cross-file anchors into the file — plus the row ids
themselves, which are the thing citations use and which the cut keeps all 357 of.

**The second** is that the two dying probes are the only casualty. §5 gives the predicate that
decides it, and the predicate is *the document the probe REWRITES*, not *a document the anchor also
appears in*.

## Declared exceptions

Paths outside `Owns` and outside the record step's **five** (section 1 rule 5, as
[ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) left it):

| path | why | predicted? |
|---|---|---|
| `CLAUDE.md` | **obligation (c), and it needs an exception that the brief said it would not.** The brief states *"it is in `CLAUDE.md` and that is a record-step file, so no exception is needed"* — **and `CLAUDE.md` LEFT that list at W112**, by ADR 0077 decision 1. The record step is five files and `CLAUDE.md` is not one of them, so withdrawing the instruction there is an ordinary exception. **THREE edits, not the "one sentence" this table first claimed**: the live working-rules paragraph, the Q43 sentence inside the `Current state` block, and a P8-era paragraph at line 1670 that an agent reading top-to-bottom reads as current. Both readers found the count | **yes** for the file — found by reading rule 5 rather than the brief; **no** for the count |

**Within the record step's five**: `doc/open-questions.md` (which is also this item's `Owns`
subject, and which `M7` and `M8` now read), the plan's Record, `doc/README.md`, `README.md`,
`doc/decisions/**` — the last covering ADR 0078 and the two consequence corrections in ADR 0076 and
ADR 0077, both of which named this item as the withdrawer of the instruction they asserted.

**`doc/README.md` is edited beyond the record step's usual one line and that is stated rather than
assumed**: its register row carried `230 questions - 176 open, 2 deferred, 52 resolved` — stale by
four plans — on the exact line this item touched, which section 1 rule 5's re-take clause reaches.
The cell now states no counts at all, which is P27 decision 4. **The rest of that file is W115's**
and is untouched ([Q466](../open-questions.md)).

## Record

**Status: DONE.** `doc/open-questions.md` is **70,254 bytes from 721,528 — a 10.3x cut** — one line
per question, and it is a REFERENCE rather than required reading. **ADR 0078** records the one
decision that was not already taken, and **`M7` and `M8`** are the observer this item had narrowed
away and its adequacy reader priced back in.

**Gate — what ran.** Every rung RUN and redirected, `$?` read on its own line, never piped.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, EXIT 0** | `lint`, `typecheck` |
| `check:markdown` | **RAN, EXIT 0** | **186 documents, 6830 relative links in 181 of them, 35 anchored** from 184 / 8127 / 179 / 477. `M1`-`M8`. *(The link count moved three times inside the record step — 6808, 6816, 6829, 6830 — because this Record, `doc/README.md`'s paragraph and P27's row all carry links. The figure is the one on the tree the SECOND `gate:full` measured, which is ADR 0076 consequence 1's problem met rather than avoided: a number that changes when you write about it can only be stated with the moment it was taken.)* |
| `check:markdown:selftest` | **RAN, EXIT 0** | 37/37 probes caught, 37/37 noticed, 7/7 bounded — after one ABORT, below |
| `check:budget` | **RAN, EXIT 0** | 893,682 bytes against a **lowered** 897,741 ceiling; per-file 575,022 / 309,690 / 20,000 |
| `check:budget:selftest` | **RAN, EXIT 0** | 13 probes (12 caught, 1 control clean), 11/11 META, 14/14 SELF, **9/9 SOURCE** from 7, 4/4 grader controls, digest unmoved |
| `check:spec` | **RAN, EXIT 0** | **7 / 72 / 132 UNMOVED**, `C4` at 42 — which is what `Spec: NONE` asserts |
| `check:docs` (+ selftest) | **RAN, EXIT 0** | `X11` over ADR 0078's new index row, 46 rows against 46 ADRs both ways |
| `check:source`, `check:wiring`, `check:scheduler`, `check:policies`, `check:workers` | **RAN, EXIT 0** | and each one's self-test, read by the adequacy reader |
| conformity reader | **RAN** | **86 values derived independently, 65 AGREED, 21 DISAGREED** — 7 blocking, 18 non-blocking |
| adequacy reader | **RAN** | **39 mutations, 16 survived, 13 real holes** — 4 blocking |
| rule 8, both readers' exact edits checked in | **RAN** | **34 probes: 26 CAUGHT, 7 declared ceilings, 1 control clean, 4/4 grader controls, ZERO undeclared survivors, ZERO crashes, ZERO aborts, ZERO against declaration.** Digest `fb9d07663d2837ec` identical at both ends over 462 files, no scratch residue |
| **`npm run gate:full`** | **RAN THREE TIMES. EXIT 0, ZERO `FAIL` lines, and the THIRD is the verdict: digest `e68b25ff7daa5e5d` IDENTICAL before and after, `selftests` 9/9 completed, 9 ok, 793.7 s wall against 2930.9 s serial-equivalent over 8 lanes** | the confirming gate (v0.26). **The first ran before this Record existed**, so its verdict was about a tree that no longer did — the defect P14's retro recorded, and `doc/workflow.md` section 6's *a measurement over a moving tree is a claim about no tree*. **The second was STOPPED deliberately and unfinished**, because `M7`'s own predicate — run over the files this item touches — then found defect 30, and letting a gate measure a tree you are about to change is the same error with the cost paid. **The third ran on the final tree with the digest asserted at both ends.** The only change since is this cell, which adds no link and which no rung reads; `check:markdown` and `check:budget` were re-run after it and are EXIT 0. W112's wall was 2063 s because that item's run included the lane its own ninth check had just multiplied |

### The figures

| | before | after |
|---|---|---|
| `doc/open-questions.md` | 721,528 bytes / 940 lines | **70,254 / 481** |
| rows | 427 row lines over 357 distinct ids | **362 rows, one per id** |
| census | 357 / 280 / 1 / 76 | **362 / 282 / 1 / 79** — three RESOLVED, five RAISED |
| `check:markdown` | 184 docs / 8127 links in 179 / 477 anchored | **186 / 6830 in 181 / 35** |
| distinct anchor targets | **24** | **24** — the cut removed 442 anchored links and ZERO distinct anchors |
| `M5`'s floor | 60 | **28**, window `(20, 35]` |
| `check:budget` ceilings | 586,000 / 310,000 / 20,000 — total 907,590 | **575,022 / 309,690 / 20,000 — total 897,741** |
| `check-markdown` clauses | `M1`-`M6` | **`M1`-`M8`** |

### What broke

**Twenty-nine defects. The two largest were found by the two readers from opposite ends of one question,
the sharpest single finding is one that BOTH found and that neither W112 nor this item's own
instrument could see, and the LAST one this item found in its own new text.**

*Found by a RUNG, and all five read correctly:*

1. **`M5`'s floor at 60 against 35** — the first `check:markdown` after the cut, exactly as ADR 0076
   decision 3 predicted and handed over.
2. **The `M4`-floor META entry ABORTED** on the probe name this item changed — `no probe is named
   "…with the anchors left alone"` — in the confirming lane. **Third firing of rule 7 (b) on that one
   entry, in a third delimiter**: a magic NUMBER at W33, a magic FIELD at W112, a magic NAME now.
3. **`check:budget:selftest`'s own SOURCE clause refused `570_926 + ALLOWANCE`**, correctly: widening
   it to admit `<number> + <identifier>` would admit `statSync(…).size + 4_096`, which is the
   expression ADR 0076 consequence 10 records getting past its predecessor. Then it refused a
   TRAILING COMMENT, because that clause spans to the end of the line on purpose. *A clause that
   cannot read an expression's meaning is right to refuse every expression.*
4. **Two `SELF` entries in `check-budget-selftest.mjs` reported *the mutation costs nothing***, both
   pinned to ceiling literals this item moved. Rule 7 (b) again, in the file whose own SOURCE clause
   is about a ceiling that must stay a literal.
5. **The structural check inside the generator** refused two of its own transformations before
   anything shipped — see defect 26. And **`M7`'s own predicate, pointed at the files this item
   touches, found THREE rows of the ADR index rendering with their `Date` column EMPTY** — 0076 and
   0077 from W112 and **0078 from this item**, each three cells against a four-column header. It is
   the UNDER direction of `M7`'s own subject, in the index `X11` checks — and `X11` compares the
   ids, not the cells, so it was green over all three. *An item whose whole subject is table
   well-formedness shipped a malformed table row into the ADR index and found it by running its own
   clause over its own output.* Fixed in all three; the general case is [Q471](../open-questions.md).

*Found by a READER:*

6. **Output (3)'s declared assertion did not exist, and the clause this item refused was FREE**
   (both readers, blocking). The item measured a CORPUS-WIDE table check at 20 content-dropping rows
   in 10 documents and narrowed its own Output to a measurement. **Its adequacy reader measured the
   one thing it never priced: scoped to the register the count is ZERO**, so the clause is clean on
   the shipped tree and fires on a broken row — v0.22's test for a control exactly. `M7` and `M8`
   are the repair, and **10 of that reader's 12 register edits are now caught**, including the
   RE-BALLOON. *An item that narrows a clause owes the narrower clause a price too* (Q467).
7. **The register's row count, membership and SIZE were held by nothing** (adequacy, blocking):
   one row, 100 rows and all 357 deletable; the file reducible to 39 bytes; a duplicate row for one
   id saying the opposite; and **HEAD's 721,528 bytes restorable**, which is P27 decision 2's own
   named worry. `M8` catches the re-balloon *structurally* — HEAD carried 427 row lines over 357 ids,
   so it reads as 70 duplicates — and no size bound is added, because P27 decision 1 puts this file
   in the *no budget* set (ADR 0078 decision 5).
8. **ONE `check:budget` ceiling derived at RUN TIME survived everything** (adequacy, blocking).
   `SET[0].ceiling = statSync(join(ROOT, 'CLAUDE.md')).size + 4_096;` gives `check:budget` EXIT 0 and
   the self-test EXIT 0 at **`source: 7/7 bound(s) held`** — and with `CLAUDE.md` 200 KB over its
   declared ceiling the report prints **`ok B2`**. Re-measured here, both halves. **W113 is what made
   it byte-equivalent**, by setting that ceiling to exactly `measured + ALLOWANCE`. The SOURCE clause
   reads the DECLARATION and is blind to an ASSIGNMENT; `SET` is frozen member by member now, so the
   assignment THROWS, with a ninth SOURCE clause as the second observer because a throw is a crash.
9. **The `note:` distance line can be PRESENT and never REACHED** (adequacy). `if (0 > 1)` left the
   check EXIT 0 with zero note lines and `source: 7/7` — defeating the one mitigation ADR 0076
   decision 5 names. The control probe's captured stdout is the observer now.
10. **`scripts/check-budget.mjs` and its self-test were edited outside `Owns`** (both readers,
    blocking) — and predictable, since obligation (d) is to lower that check's ceiling. **The first
    `Owns` audit failure since the run of five that retired `check-owns.mjs` as a proposal**, which
    is P2's retro's stated condition for bringing it back.
11. **A WITHDRAWN claim survived ten lines below the paragraph withdrawing it** (conformity,
    blocking) — *the anchors are untouched, because all 78 live in `doc/`'s top level*, in a file this
    item edited, with the author having located and quoted it. Section 1 rule 5's third clause exactly.
12. **Five sites asserted the withdrawn instruction, not "the one live site"** (both readers,
    blocking): the register's preamble, two in `CLAUDE.md`, `doc/README.md`, and the two ADR
    consequences that named this item as the withdrawer of the instruction they asserted.
13. **Scope In 1 and §9 said FIVE cluster headings and a THREE-column Resolved table** (both
    readers, blocking); seven and four shipped. The two extra headings and the extra column are
    ADDITIONS made after the cluster table turned out to be the authority, and §9's argument predates
    that discovery.
14. **§8's 4% corrected a figure that was already right** (conformity, blocking). P27 prediction 3's
    *17% of open rows state a closing condition* measured 45 of 268 over ELEVEN phrasings; this item
    ran SIX, none of them `What would force it:`, and reported 4%. **40 of 281 live rows — 14.2% —
    carry one.** *§7 of this item diagnoses that exact instrument error one section before §8 repeats
    it.* Q469.
15. **The new Q131 row shipped a sentence false about the file it sits in** (conformity, blocking) —
    *Two rows of THIS FILE render their Status and Owner columns wrong*, present tense, where the
    answer is seven and the shipped answer is zero. The row's own body had corrected its count twice
    already; the verbatim method is what re-surfaced the oldest version.
16. **`(13, 15]`'s LOWER edge is wrong too** (conformity) — this item's summary table said it was
    right; it is 20.
17. **§6's constraint 4 is INVERTED** (both readers): its own four constraints yield an empty window,
    and what ships is probe 2 DECLARING `M5`.
18. **"477 is 28 distinct anchors" is 24** (conformity) — 28 is the SUM of the per-document distinct
    counts, which double-counts a target two documents cite, and ADR 0076's 24 is right and not
    stale. **This item's own verification script then read it a THIRD way as 38**, by not resolving
    the path. Settled with a control: 24 before the cut and 24 after.
19. **"SIX figures were wrong" over a SEVEN-row table** (conformity), and two of the seven were
    correct where they were measured — 710,445 bytes at `d287dc1` is P27's "693 KB" exactly.
20. **Nine more claim corrections**: four vs five rows escaping their pipes (two occurrences, and the
    item's own body said five); Q343's rendered columns shifted one; §1's byte-row label; "TWO probes
    killed" where §5's own table says one; 250/219 paired with the wrong denominator (255/225 on the
    shipped file over 281 rows, against 250/219 over the old file's 351); the preamble writing two
    derivable counts four paragraphs after §9 said the headline count goes; `doc/README.md`'s register
    row stale by four plans on the line this item edited; §7's home table being nine rows over ~19
    blocks rather than an enumeration; and the `(13, 15]` window restated in the self-test.
21. **Three fidelity defects in 357 rows** (conformity): `**W30 — partially**` shipped as **`W30`**,
    which OVERSTATES ownership; **Q6 lost half its question**, because a Resolved cell is two
    questions and the first-sentence rule took one; and 17 curly apostrophes plus **one
    non-breaking hyphen inside an id range** — `Q33-Q35` — which any range-expanding parser would
    fail to match. All three fixed; the first two changed the generator.
22. **Single-probe mode CRASHED on a rule 7 (b) abort** (adequacy) — `TypeError: Cannot read
    properties of undefined (reading 'filter')`, in the item that made 7 (b) load-bearing for the
    probe it re-pointed. It reports `outcome: matched-nothing` now.
23. **The two nav links were the SOLE observer of the two headings the whole cut had to preserve**
    (adequacy) — heading ← nav link ← one probe's 7 (b) guard, one observer deep. `M8` asserts both
    headings now, which is obligation (c)'s LIMIT discharged.

*And six of the author's own, found by neither rung nor reader:*

24. **The home-check instrument was CASE-SENSITIVE** and reported 15 of 20 Notes paragraphs
    homeless; W3's through-line is in W3's own file capitalised. Re-run case-insensitively it said 18
    of 31, and **reading the owning documents showed most of those were false negatives too**. Q468.
25. **`resolveLinks` was handed RELATIVE paths**, so it read the real tree whatever root it was
    given — every content-modifying scenario reported the whole tree's figures **and the measurement
    PASSED ITS OWN CONTROL**, because the control compares against the whole tree. Q470.
26. **`apos()` turned `` `Driver`s `` — a legitimate code span — into an apostrophe**, and `clip()`
    truncated mid-bold, leaving a `**` open that would have swallowed the rest of the row. Both
    refused by the generator's own structural check before anything shipped.
27. **FIVE of the harness's own declared sets were wrong on their first outing** — `a4`, `a5`, `c3`,
    `r1`, `d5` — and the product caught everything. `r1` created a DEAD LINK as well as removing an
    anchor, so it tripped a second clause; `c3` taught that a META or SELF failure prints under the
    ENTRY'S NAME and not under a clause id. *A declared set is a claim about what the lane PRINTS,
    and two of three failure shapes print no id at all.*
28. **The grader's `did-not-run` control graded `crash`** on its first outing — the mirror image of
    ADR 0076 consequence 7, where W112's CRASH control graded `did-not-run`. The discriminator is not
    the exit code and not the failure count: it is whether the lane STARTED.
29. **A `\n` through a Python heredoc became a real newline in a JS string literal, FOUR times** —
    the hazard the brief named three times, and W112 recorded three times. Plus one probe declaring
    363 occurrences and replacing ONE, because `String.replace` with a string anchor replaces the
    first: *a declared occurrence count is not a declared replacement count*, and that probe's
    survival is what found the header-line gap `M7` now closes.

### The finding to carry

**`18eee73`, 2026-09-02, deleted the register's `## Resolved` table header and delimiter row, and
for 31 days and 100 commits the whole Resolved half — 28 rows growing to 76 — rendered as a
paragraph of literal pipes with `check:markdown` EXIT 0.** §10 has the dating. **Both readers found
it independently and this item's own §3 could not**, because that section measured cell counts
*against the header width of the table each row sits in (4 for Live, 3 for Resolved)* — and an
instrument that assumes a header width for a section with no header cannot see that there is no
table. So **SEVEN undercounts the defect at HEAD by the whole Resolved half**, and it is Q135's
mechanism — table TERMINATION, which that row names at ONE row — applying to half the file. *Same
shape as defect 24: an instrument answering a narrower question than the sentence around it.* `M7`
catches it by its own predicate now: restoring HEAD fires `M7` eight times and `M8` once, and
reproducing `18eee73` exactly fires `M7` by name.

### The predictions

| | verdict |
|---|---|
| **1** (the REACH — 80 KB with nothing lost) | **UNTOUCHED, and moved the WRONG WAY by 2,357 bytes.** The always-read set GREW, because the register is not in it and `CLAUDE.md` gained the withdrawal paragraph. W114 and W115 own it |
| **2** (`check:markdown` green through every cut) | **CONFIRMED on its substance, MECHANISM narrowed.** W112's re-pointing was NOT sufficient: the cut additionally required probe 2's declared SET to gain `M5`, which is prediction 2's own reversal clause — *a fourth counting ratchet nobody enumerated* — arriving at W113 rather than at W112. ADR 0078 |
| **3** (357 rows fit one line each) | **CONFIRMED, wording narrowed twice.** Every row fits, and **296 of 357 sentences are not interrogative** — the column is *the question or the finding*. And its SCOPE figure was right: 17% state a closing condition, which this item measured wrongly at 4% and then at 14.2% |
| **4** (no rung of L0-L6 moves) | **CONFIRMED by construction** — `src/`, `test/` and `examples/` are untouched, `check:spec` is 7 / 72 / 132 unmoved, and no rung reads a document this item edits |
| **5** (removing a copy lets a CHECK go too) | **REVERSED here, and the reversal is this item's largest addition.** It removed the register's second cluster-membership copy — and `scripts/**` GREW by two clauses, because the cut created a document whose shape nothing checked. *A copy removed is a check removed only when the copy was the check's SUBJECT; here the copy was the second ASSERTION, and what the cut removed was the first* |

### Readers

**Conformity 86 values derived / 65 agreed / 21 disagreed / 7 blocking; adequacy 39 mutations / 16
survived / 13 real holes / 4 blocking. OVERLAP 7 — the SEVENTY-SECOND measurement**, and the highest
ever recorded. The shared subjects are findings 6, 10, 12, 13, 17, 20's *"TWO probes"* and the §10
finding. **The caveat is W104's and W31's, verbatim**: both prompts named the same four obligations
and the same specifics to re-derive, which is priming, and the measurements in the settled 0-4 band
were not primed that way. *Seven is a number about the briefs as much as about the readers.*

**Seven of the conformity reader's disagreements were verified directly before any were acted on**
and all seven held; its §10 finding is **larger** than it stated. **Three of its figures were its own
error in one direction** and are not adopted: it read 24 distinct anchors correctly where this item
had 28, while its `461` and `(13, 16]` in the same area repeat W112's reader's error.

### Questions

**[Q131](../open-questions.md), [Q135](../open-questions.md) and [Q215](../open-questions.md)
RESOLVED** — the three distinct cell-splitting mechanisms, all fixed by construction and now asserted
by `M7`. **[Q407](../open-questions.md) and [Q442](../open-questions.md) NARROWED** with this item's
figures. **[Q465](../open-questions.md) half closed** — the instruction is withdrawn, the membership
binding stands. **[Q467](../open-questions.md)-[Q471](../open-questions.md) raised**, all five in
`Verification and fixtures`. **ADR 0078 TAKEN**, extending P27's exhausted block.
**Census 362 / 282 / 1 / 79**, derived two ways and held by `M8`.
