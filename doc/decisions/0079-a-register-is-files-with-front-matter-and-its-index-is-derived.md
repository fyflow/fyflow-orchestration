# ADR 0079 — A register is a folder of files with front matter, and its index is derived

**Status:** accepted
**Date:** 2026-10-04
**Item:** [W116](../work-items/w116-a-question-is-a-file.md)
**Raised by:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md) decisions 1 and 3
**Supersedes:** nothing. **Amends:**
[ADR 0078](0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md) — the `M7` and `M8`
it added to `check-markdown` leave that check with their subject.

## Context

`doc/open-questions.md` was the one id type stored as ROWS: 383 of them at `aa43cb3`, in six tables
of two shapes — 302 live rows of five cells under seven cluster headings, and 81 resolved rows of
four, each carrying its own cluster. Plans, items and ADRs are files. Two consequences followed
from the storage and neither from the content:

1. **Its format needed a check of its own.** `M7` held the tables — header, delimiter, cell counts,
   balanced inline markup — because `18eee73` deleted a header and the `## Resolved` half rendered
   as literal pipes for 31 days and 100 commits. `M8` held one row per question and a row floor,
   and said of itself that *a deletion of one to seven rows is a declared ceiling: no expression
   here can see it, because the ids ARE the source and there is no second list to compare against.*
2. **Nothing could be looked up without reading the file**, and two items raising a question each
   was two appends to one 81 KB file.

## Decision

1. **A question is `doc/questions/q<N>.md`**, unpadded and without a slug, opening with front
   matter of exactly the ten fields P28 decision 1 declares — `id`, `title`, `status`, `cluster`,
   `owner`, `closes-when`, `resolved-by`, `note`, `raised-by`, `shared` — every one present, empty
   as `""` where there is nothing to say. A value is a plain word run or a JSON-escaped
   double-quoted string, and nothing else; `doc/questions/README.md` states the subset.
2. **`status` is one of four words**: `open`, `deferred`, `icebox`, `resolved`. `icebox` requires a
   non-empty `note`. `cluster` is one of the clusters `doc/questions/README.md` declares in its
   `## Clusters` table.
3. **The folder is held by `npm run check:register`, the seventeenth gate entry**, clauses `R1`-`R5`:
   names and ids (`R1`), fields, vocabulary and clusters (`R2`), *resolved iff `resolved-by`* and
   every `ADR`, `P` and `W` id it names existing (`R3`), **every question file at `HEAD` present in
   the working tree** (`R4` — an UNCOMMITTED deletion only; consequence 5 is its ceiling), and a
   floor of 383 files that only moves up (`R5`).
4. **`R4` runs only where the measured tree IS a repository's top level**, and reports `NOT RUN`
   otherwise — never `ok`. A copy staged under this repository's `dev-dist/` has no `.git` of its
   own, and `git` run there answers for the OUTER repository, whose `HEAD` holds nothing at that
   path: the comparison would pass over a deletion it never made. The self-test provokes `R4` in a
   real repository it initialises in its staged copy.
5. **`M7`, `M8` and `REGISTER_ROW_FLOOR` leave `check-markdown`.** One file per question removes both
   subjects: there is no table to break, and a question deleted and NOT YET COMMITTED is a file
   missing against `HEAD`, which `R4` sees. A committed deletion is not — consequence 5.
6. **`check-markdown` does not read YAML front matter as markdown.** The migration copied every cell
   verbatim, and four carry a link written relative to the old register — `](#live)` three times and
   `](decisions/0077-…)` once — which from `doc/questions/` resolve to nothing. A front-matter value
   is data, printed by a lookup as text and never rendered as a link; rewriting the four would break
   the round-trip that proves the migration lossless. Only a block that OPENS a file counts.
7. **The index is derived, never kept.** `npm run state` counts the folder; the lookup (W119) reads
   it. `doc/open-questions.md` is a pointer, kept because links to it exist.

## Consequences

1. **The migration is checked against the OLD register, never against itself**: an independent
   parser of `git show aa43cb3:doc/open-questions.md` compared cell by cell with the files, plus a
   control edit that must come back as exactly one difference. W116's Record carries the figures.
2. **A live row's status cell is split at its first word, and three cells opened with `**`** (Q92,
   Q407, Q442). The status is the word inside the bold, and the note keeps the opening `**`, so the
   bold span closes inside the note. **The encoding is reversible on the corpus at `aa43cb3` ONLY**
   (W116's conformity reader): `open **x**` and `**open x**` both become `status: open` with
   `note: "**x**"`-shaped notes, and only the absence of the first shape in that corpus — no other
   migrated note begins with `**` — lets a note beginning `**` be read back as a cell beginning
   `**<status> `. A question written after the migration has no status CELL, so nothing reads it back.
3. **`raised-by` and `shared` are empty in all 383 files**, because the register carried neither and
   a migration that guesses writes a claim nobody ran. Resolved rows carried no owner and no closing
   condition, so those are empty too.
4. **No duplicate-id clause exists, by construction**: a directory cannot hold two files of one
   name, and `R1` refuses a padded or upper-case name and an id that disagrees with its file's.
5. **`R4` is vacuous on the tree that introduces it** — `HEAD` carries no question file until W116
   is committed — and from the next commit on it compares every question file at `HEAD` against the
   working tree. **That is its whole reach**: a deletion that is COMMITTED is green for ever after,
   because `HEAD` no longer carries the file; a fresh checkout, which is what CI runs, has no
   uncommitted change and can never fire it; `R5` sees a deletion only while the count is under its
   floor; and a question gutted and re-used IN PLACE under its own id is seen by nothing.
   [Q493](../questions/q493.md) prices the options. It also cannot run where `git`
   cannot: a copy with no repository, or a machine with no `git`, prints `NOT RUN` and exits 0 if
   nothing else failed. The self-test is what proves the clause can fire; the gate's own run proves
   only that it ran. **Its `git` runs with `core.longpaths`**: without it, a copy of the tree under a
   deep Windows path could not read its own object store, `ls-tree HEAD` failed, and `R4` went
   `NOT RUN` on a tree that WAS a repository — measured by W116's first `gate:full`.
6. **The front-matter narrowing (decision 6) costs reach.** A document that one day OPENS with a
   thematic break `---` would have its links up to the next `---` line skipped. None did when this
   was written; the self-test provokes the narrowing in both directions.
7. **384 files arrived in `check-markdown`'s walk**, in a directory neither `removes` probe cut, so
   `M3`'s floor and both fixtures moved together: the fixtures now cut `doc/questions` as well, and
   the floor is the midpoint of the window that leaves. *The lane was already red before this item
   — P28's declaration had taken probe 1 to 146 files against a floor of 142* — which is
   [Q142](../open-questions.md)'s window, met again.
8. **What it makes hard**: a question can no longer be edited by appending a row; it is a file, with
   ten fields, and `R2` refuses a missing or misspelt one. That is the cost of decision 3, and the
   point of it.

## Alternatives rejected

| | why not |
|---|---|
| keep the register as a table and widen `M8` with a second list | the ids ARE the source: there is no second list that is not a copy of the first, which is `M8`'s own declared ceiling |
| a slug in the file name (`q17-what-routes.md`) | a link would carry the title, and a retitled question would break every link to it — P28 decision 1 |
| rewrite the four relative links in migrated fields | the fields are copied verbatim and the round-trip compares them; a link in a field is not rendered as one, so the edit buys nothing a reader sees and costs the proof |
| `R4` passing where it cannot compare | a clause that reports `ok` over a comparison it never made is the shape `NOT RUN` exists to refuse (W5) |
| `check:register` outside the gate | P27 stop-and-ask (c)'s precedent for `check:budget`: a register check outside the gate is a sentence — P28 stop-and-ask (c), answered by the maintainer |
