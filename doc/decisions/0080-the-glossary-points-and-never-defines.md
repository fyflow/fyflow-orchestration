---
id: ADR 0080
title: "The glossary points at a definition and never makes one"
status: accepted
date: "2026-10-05"
item: W120
raised-by: P28
supersedes: ""
amends: ADR 0078 decision 1
resolves: ""
---

# ADR 0080 — The glossary points at a definition and never makes one

**Raised by:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md) decision 4. **Amends:**
[ADR 0078](0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md) decision 1 — the
number in `M5`'s floor, and nothing else in it (consequence 4).

## Context

A term in this repository is decided in one of three places: a `spec/` section, an ADR, or
`doc/workflow.md`. Nothing said where. *gate* is a flow node kind, two `npm` commands and a work
item's verification gate — 229 case-insensitive whole-word occurrences under `spec/**/*.md` and
2,666 under `doc/` on `839d83a` — and the process vocabulary (*probe*, *provocation*, the two readers)
is defined inside list items and tables of `doc/workflow.md` that a fresh reader has no index into.

A glossary that DEFINES its terms is a fourth place a term is decided, and the first to disagree
with the other three — this repository's most common defect is a written claim nobody ran, and a
second copy of a definition is a claim about the first that nothing compares.

## Decision

1. **`doc/glossary.md` points at where a term is defined and never defines one.** Each row is one
   sense of one term, a one-line sense, and one link to the heading where that sense is decided.
   **Where a row and its target disagree, the target is right and the row is the defect.**
2. **A row's target is a heading in `spec/`, an ADR or `doc/workflow.md`, and nothing else.** A term
   whose only definition is in a work item, a plan, `CLAUDE.md` or `doc/concept.md` is not a row: it
   is a question. *P28 decision 4 named `spec/` and the ADRs; W120's declaration added
   `doc/workflow.md`, the only home the process vocabulary has.*
3. **Where the defining sentence sits in a list item, a table or a block quote, the link names the
   nearest heading enclosing it**, for every row alike. Those carry no anchor of their own; the
   alternative — every such term a question — would leave most of the process vocabulary unindexed
   while its definitions exist.
4. **The format is a contract**, because W119's `term` parses it, and the glossary's own `## Format`
   section is where it is stated: two tables under `## PRODUCT` and `## PROCESS`, the header
   `| term | sense, in one line | defined at |`, one row per term-sense, a plain-text `term`, a
   one-line `sense` with no link, and a `defined at` cell that is exactly one relative link with an
   anchor.
5. **A term with several senses gets one row per sense, and a rename is a question, never a row.**
   *gate* has three rows and [Q508](../questions/q508.md).
6. **It is not in the always-read set** — P28 decision 4. It is a reference, read the way `spec/` is.

## Consequences

1. **`M1` and `M2` hold the links; nothing holds the sense lines.** A renamed heading turns
   `check:markdown` red on the row that points at it. A target whose text changes under an unchanged
   heading leaves the row's line stale with every check green: comparing a sense line to its target
   is a check over `doc/` prose, refused 26 times (`doc/workflow.md`'s refusal ledger). The
   conformity reader, row by row, is the only comparison.
2. **Coverage is partial by construction.** A row exists only where someone looked; a term nobody
   indexed is absent, not undefined. The *Not rows* list is where a looked-for term with no home is
   recorded, each as a question.
3. **A section anchor is coarser than a definition.** Rule 3 sends a reader to a section and leaves
   them to find the sentence; *quiescent point* points at `spec/run-state.md` section 3, whose
   defining sentence is in a block quote under it.
4. **`M5`'s floor moves, by the glossary's own anchors.** Every row carries an anchored link in
   `doc/`'s top level, which no `removes` probe cuts, so the whole tree, probe 1, probe 2 and `M5`'s
   own probe rise together and ADR 0078 decision 1's 28 leaves the window. The window and the new
   floor are measured on W120's final tree and stated beside the floor in `check-markdown.mjs`; this
   is ADR 0078 decision 1's arithmetic re-run, not a change to what that decision decided.

## Alternatives rejected

| | why not |
|---|---|
| a glossary that defines its terms | a fourth place a term is decided, which drifts from the other three with nothing to compare them |
| a row may point at a work item or a plan | an item's or a plan's text is the record of a decision being made, not the decision; a term defined only there is a question about where it should live |
| every term defined inside a list item or table is a question | most of `doc/workflow.md`'s vocabulary would be unindexed while its definitions exist |
| one table for every sense | *gate* has a product sense and two process senses, and the domain is the first thing a reader needs to tell them apart |
| a check comparing each sense line to its target | a check over `doc/` prose, refused 26 times |
