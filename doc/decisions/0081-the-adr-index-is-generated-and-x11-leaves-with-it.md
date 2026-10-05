---
id: ADR 0081
title: "The ADR index is generated, and X11 leaves with the hand-kept one"
status: accepted
date: "2026-10-05"
item: W119
raised-by: P28
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0081 — The ADR index is generated, and X11 leaves with the hand-kept one

**Decided by the maintainer at [W119](../work-items/w119-the-lookup.md)'s stop-and-ask 2, on
2026-10-05**, before the item's first edit, under
[P28](../plans/p28-what-can-be-looked-up-instead-of-read.md), whose exit artifact says *the ADR index
in `doc/decisions/README.md` gone*.

## Context

1. **`check-docs`' `X11` compared `doc/decisions/README.md`'s hand-kept `## Index` with the ADRs on
   disk, both ways** — four clauses (unindexed, phantom, duplicated, misnumbered), four probes and
   four META entries, written at W96 because P23's retro measured 29 of the 46 commits that touched
   `doc/decisions/` shipping that index short, eight rows behind at its worst.
2. **P28 decision 2 made every ADR's header front matter, and W119's `npm run adr -- --index` prints
   the index from it.** The hand-kept table is a second list of facts each ADR now carries as data,
   so P28 deletes it — and `X11`'s subject is that table.
3. **Before the table was deleted, the two were compared** (W119's Record lists every difference):
   48 rows each, 55 differing cells, every one a hand-kept row that paraphrased its ADR's title,
   omitted a supersession or amendment the header declares, carried prose no field holds, or predated
   W117's rule that the plan joins `raised-by`. **None was a wrong header.**

## Decision

1. **The ADR index is generated, never typed**: `npm run adr -- --index`. `doc/decisions/README.md`
   carries one line naming the command where the table stood.
2. **`X11` is RETIRED**, with its four probes and four META entries; `check-docs-selftest.mjs`'s
   `MIN_PROBES` drops 47 -> 43 and `MIN_META` 28 -> 24, exactly the entries that left. **The id is
   not reissued.**
3. **Nothing replaces it.** Re-pointing `X11` at the generator would compare the folder with what the
   folder generates — itself — and pass by construction. What still holds an ADR is
   `check:register`'s `R6`-`R8`: the file name, the id, the nine fields, every id they name, and the
   `resolves` pairing.

## Consequences

1. **A deleted ADR is seen only where something names it** — `R7` through another ADR's
   `supersedes`, `amends` or `raised-by`, `R3` through a question's `resolved-by` — and by `git`.
   This is the ceiling Q500 priced, and the maintainer accepted it there at W117: *an ADR deletion
   needs no R4/R5 of its own*. `X11` was the last thing comparing the folder with a second list,
   and it compared it with a list somebody typed.
2. **The index can no longer go stale**, which is the defect `X11` existed to catch: there is no
   copy to fall behind.
3. **The history paragraphs that stood under the table left with it.** Each recorded an episode of
   the table falling behind, or why an ADR number was skipped; they are in `git` before W119, and the
   skipped numbers are visible in the generated index as gaps.
4. **The generated index is not the hand-kept one**: its `Decision` cell is the title plus the
   declared `supersedes`, `amends` and the DERIVED `superseded by`; its `Raised by` is `raised-by`
   then the `item` where `raised-by` does not already name it. Prose a hand row carried beyond that
   — *answers Q444*, *the maintainer* — is in the ADR's body, not in the index.

## Alternatives rejected

| | why not |
|---|---|
| re-point `X11` at `npm run adr -- --index` | the folder compared with itself; it cannot fail, so it is not a check |
| keep a stub index for `X11` to compare | a second hand-kept list is the thing P28 removes, and its exit artifact says the index is gone |
| extend `R4`/`R5` to `doc/decisions` | Q500, answered by the maintainer at W117: no guard |
