# P27 — What is a question, and what is a finding?

```
Question: what IS a row of doc/open-questions.md, and what closes one?
Items:    W112 (what a row IS — ADR 0076, the taxonomy and `check:questions`),
          W113 (the mechanical buckets applied, with evidence per row),
          W114 (the exit artifact: the residue owned or demoted, and the count MEASURED)
Reserves: W112-W115 (W115 expected unused), Q459-Q473, ADR 0076-0077 (0077 expected skipped)
Baseline: derived by grep off the tree at this declaration — plans to p26, work items to w110,
          ADRs to 0075, register to Q458. L1-L5 56 / 1516 in three runtimes, L6 2435 / 161 in
          both, check:spec 7 / 72 / 132, check:markdown 180 documents / 8014 links / 472
          anchored, census 349 / 273 / 1 / 75
Declared: 2026-10-03 on `2eab1c4` — W110's commit, which is the tree every figure above was
          measured on. *(This read `5a6664c` with W110's 26 paths uncommitted until W110 was
          committed, which is the claim's own expiry date arriving within the hour.)*
```

## The question, and why it is not the one asked

The ask was *how do we efficiently go through 273 open questions and remove the irrelevant ones*.
**Measured, that operation is not available and relevance is not the discriminator.** What the
register has is not a backlog of stale rows; it is **three different kinds of thing wearing one
status**, and the reason it only grows is that four fifths of its rows never said what would end
them.

So the plan's question is the one underneath: **what is a row?** Answer that and the count falls out
of it, rather than being argued down row by row.

## The facts, measured before declaring

Taken on the tree above, by a census parser reused from W110 and a citation sweep over every tracked
file. **Every number here is a count this plan's items must re-take** (P15 decision 5: re-run, never
transcribe).

| | |
|---|---|
| open rows | **273** |
| by cluster | `Verification and fixtures` **167 (61%)**, `Decisions and data` 42, `Scale and interop` 28, `Identity, state, failure` 23, `The join` 13, and `Control flow` / `Raised late` **zero** |
| cited **nowhere** outside the register | **0** |
| cited from `src/`, `scripts/` or `spec/` | **88** |
| cited by exactly one file, and that file is the item that raised it | **27** |
| naming a path that no longer exists | **6** |
| stating a closing condition, over eleven phrasings | **45 of 268 — 17%** |
| owner cell reading `no owner` | **~206 — 75%** |
| open rows per 50 ids raised | 19 / 16 / 28 / 39 / 36 / 37 / 34 / 26 — **flat** |
| lifetime closure | **75 resolved of 349 raised — 21%** |

**Fact 1 — removal is unavailable, and it is the citation graph that says so, not taste.** Not one
open row is orphaned. **88 are cited from code, a check or a normative document**, where the row is
serving as the stated *reason* something is the way it is. And **five of the ten most-cited `Q` ids in
the whole tree are open**: [Q102](../open-questions.md) in 67 files,
[Q142](../open-questions.md) in 59, [Q19](../open-questions.md) in 45,
[Q179](../open-questions.md) in 40, [Q9](../open-questions.md) in 35. Those have stopped being
questions and become **the repository's vocabulary** — *Q102's shape*, *Q142 fired*, *Q179 is why*.
An id is never reused or renumbered (`doc/workflow.md` section 3), so a deleted row leaves a citation
that resolves to nothing for ever.

**Fact 2 — the stale-row theory is FALSE, and that is what makes this a taxonomy plan rather than a
sweep.** Of 273 open rows, **6** name a subject that is gone. There is no large obsolete bucket to
delete. The reflex answer to *the register is too big* is *most of it must be out of date*, and the
measurement refuses it.

**Fact 3 — the disease is that a row has no end condition.** **17%** state one, across eleven
phrasings; **75%** have no owner; and the per-band histogram is **flat**, so this is structural rather
than a spike. *A finding with no closing condition can only accumulate*, and the register has been
accumulating at a steady ~35 open rows per 50 raised for twenty-seven plans.

**Fact 4 — NO script parses the register, so the taxonomy cannot break a check.** Every occurrence of
`open-questions` under `scripts/` is a comment citation or a self-test probe that mutates a *link* to
it. The only checks that read the file as a document are `check-markdown`'s `M1`, `M2` and `M5`, which
resolve links and anchors.

**Fact 5 — and this is the fact that makes the chosen disposal affordable: every anchor into the
register targets a HEADING, and no citation anywhere points at a ROW.** Measured both ways:
**417 `](#live)` and 34 `](#resolved)`** inside the file, against its four headings, and **ZERO
anchored citations from outside it** — every external reference is `doc/open-questions.md` with no
`#` at all, so an external citation is file-level and cannot notice a row moving. Rows may therefore
be moved between tables inside the file and all **451** internal anchors keep resolving, provided
`## Live` and `## Resolved` both survive. *Reclassification in place is anchor-safe by construction,
and splitting the file would not be* — that road would have to rewrite 88 rows' citations across
`src/`, `scripts/` and `spec/` comments and re-point `M5`'s anchors with them.

**And this fact was WRONG TWICE when first written, which is why it is stated as two counts now.** The
draft said *254 internal cross-references*, from a `grep -c`, which counts **lines that contain a
match** and not matches — the true figure is 417, low by a third. It also named `](#live)` as the
only form and missed `](#resolved)` entirely. *A line count read as an occurrence count is the
cheapest wrong number in this repository and it was in the one fact the plan's cost rests on.*

**Fact 6 — two `check-markdown-selftest.mjs` probes are pointed at the register BY NAME, and one of
them carries a stale premise.** One mutates `](#live)` to `](#the-live-table)` to exercise `M2`; the
other empties **every** `#` target in the register, on the stated ground that *the register is where
the anchors are: 62 of 76*. The corpus now carries **472 anchored links over 180 documents**, so that
comment is stale by a factor of six and the probe's premise needs re-taking. **Predicted late
exception**, named here so the item does not discover it: `scripts/check-markdown-selftest.mjs`.

## What a row is — the three kinds, and the mechanical test for each

`open` is doing three jobs. Separating them is cheap because each kind has a test a script can apply,
which is what keeps W113 from being 273 acts of judgement.

| kind | what it is | the test | measured size |
|---|---|---|---|
| **open** | undecided, and it shapes work that has not happened | states a closing condition **and** names an owner | the residue, ~100 |
| **decided** | answered, and the answer is written down somewhere; the row is kept for provenance | its own status text already says *decided / refused / declined / narrowed / half answered* | **24** |
| **observation** | a measured limitation, cited from a comment as the *reason* something is the way it is | cited from `src/`, `scripts/` or `spec/` | **88** |
| **archive** | raised once, referenced never since | exactly one citing file, and it is the raising item | **27** |
| **expired** | the premise is gone | names a path that does not exist | **6** |

**57 rows fall out on a test alone.** The 88 need a judgement each, but *the citation is the evidence*
— a row quoted in a source comment to explain a design is documentation, not an open question. Only
the residue has to be read.

## The items

| | |
|---|---|
| **W112** | **what a row IS — ADR 0076.** The status taxonomy, the tables it implies inside the existing file, and **`npm run check:questions`** with its own self-test: a closed status set; the headline counts DERIVED from the rows; every `Q` id cited anywhere in the tree has a row; every `resolved` row has a Resolved-table row; and the clause that does the work — **an `open` row states its closing condition and names an owner**. `Owns` includes `doc/open-questions.md`, `scripts/check-questions.mjs`, `scripts/check-questions-selftest.mjs`, `package.json`, `doc/workflow.md` |
| **W113** | **the buckets applied, with evidence per row.** The 24, the 27, the 6 and the 88, each row moved with the measurement or the citation that licenses the move recorded beside it. **No row is deleted and no id is reused.** Its own declaration step re-takes all four counts, because W110 measured the headline stale by four and the census has now found that twice |
| **W114** | **the exit artifact, and it is a MEASURED NUMBER rather than a document** — W55's precedent. Every remaining `open` row has an owner and a closing condition, or it is an observation; `check:questions` is green; and the register reports what it then is, derived two ways |
| **W115** | reserved, expected unused |

## Predictions

| | prediction | the scope it rests on | what would reverse it |
|---|---|---|---|
| **1** | reclassifying in place costs **zero** dead links and zero dead anchors | fact 5, measured over all 451 internal anchors and the zero external ones, against `check-markdown`'s current green run at 180 documents / 8014 links / 472 anchored | an internal citation that points at a ROW rather than at a heading. **Already looked for and not found**, which makes this the weakest of the four predictions: it is a restatement of a measurement rather than a test of a mechanism, and P10's retro says only a REACH prediction can reverse |
| **2** | `check:questions`'s closing-condition clause is **red on its first run** against the register as it stands | fact 3: 83% of open rows state none, so the clause cannot be green until W113 and W114 have run | the clause being written loosely enough to accept a row that says nothing, which is the tautology shape v0.20 exists to catch — W112's adequacy reader should try it first |
| **3** | **the REACH** — the three kinds are exhaustive, and no open row needs a fourth | nothing: the taxonomy is derived from 273 rows by four tests and has never been applied | a row that is none of the three, which W113's job is to try to find. The likeliest candidate is already named in stop-and-ask (c): a row that has become VOCABULARY is cited 40-67 times as the name of a defect class, which is neither undecided, nor decided, nor a limitation of one mechanism |
| **4** | the count falls below **120 open** | the four buckets summing to 145 of 273, with the residue unmeasured | the 88 observations not surviving their judgement pass — if a majority are genuinely undecided rather than documentation, the taxonomy is right and the saving is not there |

## Stop-and-asks — to be answered before W112 writes ADR 0076

| | the question, priced | recommendation |
|---|---|---|
| **(a)** | **Does the headline count observations at all?** Today it is *349 questions — 273 open, 1 deferred, 75 resolved*. If an observation is documentation, counting it as a question is what produced the number that prompted this plan | **No.** The headline reports open, decided, observation and resolved as four figures, and the word *questions* means the first two. A count that conflates documentation with uncertainty is the defect, not the symptom |
| **(b)** | **Does an `observation` row need an owner?** The clause that does the work is *an open row names an owner*; applying it to 88 observations would manufacture 88 owners for things nobody is going to do | **No** — the owner and closing-condition clauses bind `open` alone. An observation needs the opposite: the citation that makes it load-bearing, which it already has |
| **(c)** | **What is a row that has become VOCABULARY?** Q102, Q142, Q19, Q179 and Q9 are cited 35-67 files each as the NAME of a recurring class. They are not undecided, not decided, and not a limitation of one mechanism. A fourth kind, or observations with many citations? | **Observations**, with no fourth kind — until W113 finds one that does not fit, which is prediction 3's whole job. Adding a kind before a row needs it is the shape this plan exists to remove |

## Out

**No row is deleted and no id is reused or renumbered.** `doc/workflow.md` section 3, and fact 1 is
the measurement that makes it a constraint rather than a convention.

**The file is not split.** That was priced and declined at the declaration: it would rewrite 88 rows'
citations across `src/`, `scripts/` and `spec/` and re-point `M5`'s anchors, where fact 5 makes
in-place reclassification cost nothing in links.

**No row's SUBSTANCE is re-litigated.** W113 moves rows and records why; it does not answer them. A
plan that tried to answer a hundred open questions would be a plan about everything.

**`check-markdown`'s ten unread markdown shapes ([Q136](../open-questions.md)) stay open**, and the
stale *62 of 76* comment fact 6 found is corrected where it sits rather than being made this plan's
subject.
