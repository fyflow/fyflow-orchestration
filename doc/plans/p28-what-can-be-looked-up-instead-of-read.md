# P28 — What can an agent look up instead of reading, and what checks that the answer is right?

**Status:** planning
**Question this plan answers:** *what can an agent look up instead of reading, and what checks that
the answer is right?*
**Exit artifact:** *`npm run q -- Q17`, `npm run adr -- 0007` and `npm run term -- gate` each print
one record and every file citing it, on the final tree, with `doc/open-questions.md` a pointer and
the ADR index in `doc/decisions/README.md` gone — and `npm run q -- --table` reproducing every row
the register carried at `aa43cb3`.*
**Reserves:** W116-W120, Q493-Q512, ADR 0079-0081

```
Question: what can an agent look up instead of reading, and what checks that the answer is right?
Items:    W116 (a question is a file, and check:register),
          W117 (an ADR's header is data),
          W120 (the glossary points and never defines),
          W119 (the lookup, and the hand-kept ADR index leaves),
          W118 (every question link points at its question, and the live instructions follow)
Reserves: W116-W120, Q493-Q512, ADR 0079-0081
Baseline: plans to p27, work items to w115, ADRs to 0078, register to Q492 — `npm run state`
          on `aa43cb3`. Its ledger reading (W112 / Q459 / ADR 0076) is P27's declaration
          sentence; P27 issued W112-W115, Q459-Q492 and ADR 0076-0078 after it, so the tree's
          reading is the one this plan takes
Declared: 2026-10-04 on `aa43cb3`
```

## Why this plan, and why now

P27 made the register a reference and `npm run state` the index of the work. **Two hand-kept
copies remain, and one of them is not a copy at all.**

| | what it is | derivable? |
|---|---|---|
| the ADR index, `doc/decisions/README.md` `## Index` | 21,710 bytes; id, title, raised-by and date for 46 ADRs, typed by hand | **fully** — every column is in the ADR's own file |
| `doc/open-questions.md` | 81,498 bytes, 383 rows in six tables | **no** — the rows ARE the source. What is derivable is the citing files and the ADR that answered a row |

**The register's two clauses exist to police its FORMAT.** `check-markdown`'s `M7` holds the tables'
structure because `18eee73` deleted a header and a delimiter row and the `## Resolved` half rendered
as literal pipes for 31 days and 100 commits. `M8`'s floor says of itself that *a deletion of one to
seven rows is a declared ceiling: no expression here can see it, because the ids ARE the source and
there is no second list to compare against.* **One file per question removes both subjects**: there
is no table to break, and a deleted question is a deleted file, which `git` sees exactly.

**And the register is the one id type stored as rows.** Plans, items and ADRs are files; a question
raised by two concurrent items is two appends to one 81 KB file.

**The glossary is the third part**, and it has a measured subject: *gate* is a flow node kind
(`spec/flow-definition.md`, ADR 0066), two `npm` commands, and an item's `Gate:` line — 229
occurrences under `spec/` and 2,588 under `doc/`. The process vocabulary (*floor*, *probe*,
*provocation*, *conformity reader*) is defined nowhere a fresh reader would look.

## Decisions taken before fan-out

**1. A question is `doc/questions/q<N>.md`, unpadded and without a slug, with YAML front matter.**
Unpadded matches `p27-` and `w115-`; no slug, because a link is written from the id alone and a
retitled question never breaks one.

```yaml
---
id: Q17
title: <the row's question or finding, VERBATIM>
status: open            # open | deferred | icebox | resolved, and nothing else
cluster: The join       # one of the list doc/questions/README.md declares
owner: no owner         # a P or W id, or `no owner`
closes-when: ""         # verbatim, empty where the row states none
resolved-by: ""         # required when resolved: an ADR, plan or spec reference, or free text
note: ""                # what a status cell carried after its first word ("refused in P1")
raised-by: ""           # left EMPTY by the migration rather than guessed
shared: ""              # another repo's id, with its repo name attached
---
```

**`icebox` is a fourth status, decided by the maintainer on 2026-10-04**: a what-if judged unlikely
to matter to most work items. It differs from `deferred`, which is *real, not now, with a reason*:
an iceboxed question is not expected to come back on its own. **It requires a `note` saying why, and
every lookup leaves it out unless it is asked for** (decision 5). **The migration iceboxes nothing**
— moving a row there is a judgement about that row, and a migration that makes one writes a claim
nobody ran.

The body is optional. **The migration writes none**: the bodies P27 cut stay in `git`. A body costs
nothing until someone looks the question up, so new questions may carry one.

**2. An ADR's header becomes the same kind of front matter**: `id`, `title`, `status` (`proposed |
accepted`), `date`, `item`, `raised-by`, `supersedes`, `amends`, `resolves`. **Supersession is
declared ONLY on the newer ADR, and *superseded by* is derived.** An older ADR's prose notice (ADR
0066's *rule 7 SUPERSEDED by ADR 0067*) moves into its body untouched — `doc/decisions/README.md`'s
*deleting the correction notice would be the violation* — and is never re-stated in a field.

**3. `check:register` is a new check, and the seventeenth gate entry** (stop-and-ask (c), answered). It holds
both registers' front matter, the cross-references between them both ways, and the refusal of a
deleted file. `M7` and `M8` leave `check-markdown`, amending ADR 0078.

**4. The glossary is `doc/glossary.md`, one table per sense domain, one row per term-sense:**
`| term | sense, in one line | defined at |`. The third cell is **exactly one** link, to a `spec/`
section or an ADR. **A row that needs a second sentence has found a term `spec/` does not define,
and that is a question, not a longer row.** It is not in the always-read set.

**5. The lookup is `scripts/lookup.mjs`**: `q`, `adr`, `refs` and `term`. Its job is to print the
fewest bytes that answer the question, so **the caller chooses the records AND the fields**
(maintainer, 2026-10-04):

| | form | meaning |
|---|---|---|
| by id | `q Q17`, `adr 0007`, `term gate` | that record — **an iceboxed question included**, because naming it is seeking it |
| filter | `--where status=open`, `--where cluster~join` | `=` exact, `~` case-insensitive substring; repeatable, ANDed; any front matter field |
| search | `--search "user_action"` | case-insensitive substring over every text field |
| project | `--fields id,status,title` | only these fields, in this order. Derived fields are named the same way: `refs` (citing paths), `refs-count`, `superseded-by`, `body` |
| shape | `--format line` (default) or `json`; `--count`; `--limit N` | one tab-separated line per record by default |

**Defaults are the cheap ones**: a list prints `id`, `status` and `title`; a single record prints its
front matter and nothing derived. `refs` and `body` are never printed unless named.

**`icebox` is left out of every list and every search unless `--where status=icebox` or
`--include-icebox` is given** — and when it hides a match, the output says how many it hid, so
an absent answer is never silent.

**Exit codes are grep's**: 0 a match, 1 no match (and the line says which filter found nothing, and
what `icebox` hid), **2 the reading is broken** — an unknown field in `--where` or `--fields`, an
unparseable record, a folder that parses to zero records. *An unknown field is a 2, not an empty
result, because a misspelt field that silently matches nothing reports an empty index as
confidently as a full one — `state.mjs`'s founding defect.* `refs` excludes `dev-dist/`, whose
whole-tree copies are a second, weeks-old answer.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W116](../work-items/w116-a-question-is-a-file.md) | the register becomes 383 files; `check:register` R1-R5; `M7`/`M8` leave; `state.mjs` reads the folder; ADR 0079 | `doc/questions/**`, `doc/open-questions.md`, `scripts/check-register*.mjs`, `scripts/check-markdown*.mjs`, `scripts/state.mjs`, `package.json`, `scripts/run-selftests.mjs` | nothing | round-trip exact; `gate:full` |
| [W117](../work-items/w117-an-adr-header-is-data.md) | 46 ADR headers to front matter; R6-R8 | `doc/decisions/0*.md`, `doc/decisions/TEMPLATE.md`, `scripts/check-register*.mjs` | W116 | header round-trip; `gate:full` |
| [W120](../work-items/w120-the-glossary-points-and-never-defines.md) | `doc/glossary.md`; the *gate* collision raised as a question | `doc/glossary.md`, its question files | W116 | `M1`/`M2` over it; `gate:full` |
| [W119](../work-items/w119-the-lookup.md) | `q`, `adr`, `refs`, `term` with filters, search and field projection; `icebox` hidden by default; the hand-kept ADR index leaves | `scripts/lookup*.mjs`, `test/lookup/**`, `package.json`, `doc/decisions/README.md` | W117, W120 | fixtures; empty-reading refusal; `gate:full` |
| [W118](../work-items/w118-every-question-link-points-at-its-question.md) | 3,616 `[Q<n>](…open-questions.md)` links in 260 files; the live instructions name `doc/questions/**` | every file carrying such a link, `CLAUDE.md`, `doc/workflow.md`, both `TEMPLATE.md` | W116, W117, W119, W120 | no Q-texted link into the stub remains; `gate:full` |

**W117 and W120 run concurrently** — no shared file. Every other edge is serial, and section 7 rule 2
is why: W116 and W117 share `check-register`, W116 and W119 share `package.json`, and W118 touches
every file the others wrote a Q link into. **W118 is last because it is the one that cannot be
re-run cheaply.**

## Predictions

| | prediction | what would reverse it |
|---|---|---|
| **1** | the split is **lossless**: 383 rows to 383 files, every cell of every row recoverable by `--table` | a cell that maps to no field — the likeliest is a live row whose status cell carries prose after its first word, which is what `note` is for |
| **2** | **no rung of L0-L6 moves** | a check that reads `doc/open-questions.md` other than `M7`/`M8` and `state.mjs` — grepped at declaration: those two are the only code that opens it |
| **3** | `check:markdown` stays green through every item | a rewritten link whose relative depth is wrong; `M1` is exactly the clause that sees it |
| **4** | the always-read set **does not grow** | `doc/workflow.md` has **60 bytes** of headroom and rule 5 names the register; `doc/questions/**` is shorter than `doc/open-questions.md`, and every rewritten link is no longer than the one it replaces for ids below 1000 |
| **5** | `scripts/**` **grows**, and this is stated rather than discovered: `M7`/`M8` leave and a new check with its self-test arrives | nothing — this is the price of decision 3 |
| **6** | looking a question up costs **under 2% of reading the register**: bytes printed by `npm run q -- Q17` against 81,498, and `--fields id,status` on a filter costs under a tenth of the default line | a question with very many citing files; `refs` is never printed unless named, and prints paths, not lines |

## Stop-and-asks

| | the question | answer |
|---|---|---|
| **(a)** | ~~Rewrite every question link, or leave them pointing at a stub?~~ | **ANSWERED by the maintainer, 2026-10-04: rewrite.** Scoped by this plan to links whose TEXT is a Q id; any other link into the register lands on the stub, which is why the stub stays |
| **(b)** | ~~Do the ADRs move to front matter in this plan?~~ | **ANSWERED by the maintainer, 2026-10-04: yes**, so the lookup has one parser |
| **(c)** | ~~Is `check:register` a gate entry?~~ | **ANSWERED YES by the maintainer, 2026-10-04** — P27 (c)'s precedent for `check:budget`, and a register check outside the gate is a sentence. It is the seventeenth entry |
| **(d)** | ~~Field search, field projection, and an `icebox` status hidden from normal lookups?~~ | **ANSWERED by the maintainer, 2026-10-04: all three** — decisions 1 and 5 |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| — | *none raised at declaration; the* gate *collision is W120's to raise, from its reserved block* | |

## Out

- **No `spec/` change, and no ADR's DECISION changes.** W117 moves headers; a body is not edited
  beyond receiving its old Status prose.
- **No question is iceboxed by this plan.** Triage of the 301 open rows is the maintainer's, after
  W119 makes it cheap: `npm run q -- --where status=open --where "owner=no owner"`.
- **No row body is restored and no question is retitled.** Titles are the row's cell, verbatim.
- **Historical prose that NAMES `doc/open-questions.md` is not rewritten.** *W113 cut
  `doc/open-questions.md`* stays true of its day. Only links whose text is a Q id are rewritten, and
  only the live instructions (`CLAUDE.md`, `doc/workflow.md`, the two templates) change their prose.
- **Plans and work items do not get front matter.** `npm run state` already reads their Status
  lines; a third format is a follow-on, not this plan.
- **No sibling repository links into this register** — grepped at declaration over
  `../fyflow-react-components` and `../fyflow-scheduler`. Shared Q ids keep their numbers.

## Record

*Filled in at the join, after the work items are merged.*
