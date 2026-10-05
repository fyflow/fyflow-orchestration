# P28 — What can an agent look up instead of reading, and what checks that the answer is right?

**Status:** complete and retro'd 2026-10-05 — five items, all done; `doc/workflow.md` stays v0.27,
no change adopted. See the Record and the Retro below
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

**COMPLETE on its fifth item, and the question is answered.** A question, an ADR and a term are
LOOKED UP with `npm run q`, `adr`, `term` and `refs`, which print only the records and fields asked
for. **What checks the answer**: `check:register` holds both registers' front matter and the links
between them, as the seventeenth gate entry. `M1` and `M2` hold the glossary's links. And
`lookup:selftest`'s AGREE holds the lookup's own reader to the check's. Every figure below was taken
at the join on `4a1b2d9`, with Node v24.20.0, unless it names another tree. Logs are under
`dev-dist/p28j-31820/`.

### The exit artifact, run

| command | EXIT | what it printed |
|---|---|---|
| `npm run q -- Q17` | 0 | one record, its front matter: **248 bytes** (`--silent`) |
| `npm run adr -- 0007` | 0 | one record: 198 bytes |
| `npm run term -- gate` | 0 | **three** records, one per sense (the node kind, the commands, an item's gate): 798 bytes |
| the same three with `--fields id,refs-count,refs` (`term,…` for the term) | 0 each | the citing files: Q17 **84**, ADR 0007 **44**, *gate* **275** on each of its three rows |
| `npm run q -- --table` | 0 | 83,623 bytes, 393 rows |
| `npm run adr -- --index` | 0 | 49 rows for the 49 ADR files |
| `doc/open-questions.md` | — | a pointer of 13 lines, with no table row |
| `doc/decisions/README.md` | — | the hand-kept index is gone. `grep -c '^\|'` gives 0, and one line names `npm run adr -- --index` |

**The artifact's sentence and the tool disagree twice, and decision 5 is followed both times:**

1. *"Prints … every file citing it"*. Decision 5 says `refs` is never printed unless named, so the
   default prints the record alone, and the citing files need `--fields refs`. W119's conformity
   reader found this, and its decision 12 records it.
2. *"One record"*. `term gate` prints three, as decision 4 (one row per term-sense) and W119's
   *a term with two senses prints both* require. The plan chose *gate* BECAUSE it has three senses.

**`--table` against the register at `aa43cb3`, compared as BYTES** by
`dev-dist/p28j-31820/observe-table.mjs`, which shares no code with `lookup.mjs`.

- **Predicate**: a row is a line that opens with `|` and is neither a delimiter row nor a header
  row (first cell `Q` or `Cluster`). Each old row must occur as a byte-identical line, counted as
  a multiset. A live row must also sit under the same `###` heading.
- **Result**: **383 old rows (302 live, 81 resolved), 383 byte-identical, 0 missing, 0 under a
  different heading.** The 10 new rows with no old twin are exactly P28's own questions: Q493,
  Q494, Q498-Q500, Q505 and Q508-Q511.
- **Control**: one byte added inside Q5's row comes back as exactly one missing row, Q5, at EXIT 1.
- **Not compared**: row order within a cluster. The files carry none (W119).
- *W119 claimed per-cell equality (1,834 cells), and its conformity reader found the rows
  byte-identical. This re-takes the byte form on the final tree.*

### The five items, each read from its own file

| item | outcome |
|---|---|
| [W116](../work-items/w116-a-question-is-a-file.md) | **done.** 383 question files. `check:register` R1-R5 and its gate entry. `M7`/`M8` left `check-markdown`. `state.mjs` reads the folder. [ADR 0079](../decisions/0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md). Both readers, a fix round, and `gate:full` EXIT 0. [Q493](../questions/q493.md) and [Q494](../questions/q494.md) raised |
| [W117](../work-items/w117-an-adr-header-is-data.md) | **done.** **47** ADR headers moved to front matter (not 46: ADR 0079 arrived with W116). R6-R8. Supersession is declared on the newer ADR. Both readers, a fix round, and `gate:full` EXIT 0. No ADR. [Q498](../questions/q498.md) resolved, [Q499](../questions/q499.md) deferred, [Q500](../questions/q500.md) resolved with no guard |
| [W120](../work-items/w120-the-glossary-points-and-never-defines.md) | **done.** `doc/glossary.md`, with 25 PRODUCT and 23 PROCESS rows. `M5`'s floor 28 -> 72. [ADR 0080](../decisions/0080-the-glossary-points-and-never-defines.md). One conformity reader, as declared; a fix round for D1-D4; `gate:full` EXIT 0. [Q508](../questions/q508.md)-[Q511](../questions/q511.md) raised |
| [W119](../work-items/w119-the-lookup.md) | **done.** `scripts/lookup.mjs`. The hand-kept ADR index replaced by one line, and `X11` retired with it ([ADR 0081](../decisions/0081-the-adr-index-is-generated-and-x11-leaves-with-it.md)). Both readers, a fix round, and `gate:full` EXIT 0. [Q505](../questions/q505.md) raised and resolved |
| [W118](../work-items/w118-every-question-link-points-at-its-question.md) | **done.** 3,594 links rewritten in 260 files, and 8 more (Q168, Q169) unlinked by hand. The live instructions now name `doc/questions/**`. Both readers, a fix round, and `gate:full` EXIT 0. No question |

### The predictions

| | verdict |
|---|---|
| **1** lossless | **HELD.** W116's round-trip: 383 rows, 4,294 fields, 0 differing. W119's `--table`: 383 rows, 1,834 cells, 0 differing. The join: 383 rows byte-identical (above). The reversal named a status cell with prose after its first word, and `note` held every one, including the three cells that open with `**` (W116). *Bounded by ADR 0079 consequence 2: the encoding is reversible on this corpus only* |
| **2** no rung of L0-L6 moves | **HELD. No item measured it; measured at the join.** `npm test` EXIT 0 gave **56 files, 1516 cases** on node 24, which is P27's baseline. L6 is declared at 2435 / 161 (`npm run state`), also unchanged. Across `aa43cb3..4a1b2d9`, **every changed line under `src/`, `test/` and `examples/` is a register-link line**, except `test/lookup/adequacy-mutants.json`, which is data no runner reads (W119). Deno and the browser were not re-run at the join; every item's `gate:full` ran both L6 runtimes and `test:browser`. *The declaration's grep ("those two are the only code that opens it") missed one: `check-markdown-selftest`'s `AGENTS.md` probe was anchored on `](doc/open-questions.md)` (W118). That is a self-test, not a rung* |
| **3** `check:markdown` green through every item | **HELD for `check:markdown`**: every item's Record has it at EXIT 0 at every step. **But `check:markdown:selftest` was RED on `4eac349`, the declaration commit** (W116 *what broke* 1). The declaration's six documents crossed the one-document `M3` margin that P27's retro measured. This is P27 prediction 2's shape for a second plan: the self-test lane is red while the check is green |
| **4** the always-read set does not grow | **HELD.** W118 measured its own −97. For the whole plan (`git cat-file -s`, `aa43cb3` against `4a1b2d9`): `CLAUDE.md` 23,754 -> 23,667, `doc/workflow.md` 35,780 -> 35,771, `doc/concept.md` 17,125 -> 17,124, so **76,659 -> 76,562**. This join adds 3 bytes to `doc/workflow.md` (Retro §8) |
| **5** `scripts/**` grows | **HELD, and now measured** (`git ls-tree -l`). It went from **22 files and 1,120,581 bytes** to **26 files and 1,371,567 bytes**, +250,986 or +22.4%. Four files are new: `check-register.mjs`, its self-test, `lookup.mjs` and `check-lookup-selftest.mjs`. 18 were modified, many of them only by W118's link rewrite |
| **6** a lookup costs under 2% of the register | **HELD.** W119 measured it, and the join re-took it. `q -- Q17` is 248 bytes, **0.30%** of 81,498. `--where status=open` prints 44,363 bytes for 307 records by default and 3,033 with `--fields id,status`, which is **6.8%**. *With the citing files, `--fields id,refs` prints 4,451 bytes for Q17 (5.5%). The prediction measured `q -- Q17`, and decision 5 keeps `refs` out of it* |

### Every reserved id

**W116-W120: all issued. ADR 0079 (W116), 0080 (W120) and 0081 (W119): all issued.** W117 held
0081 and did not use it, and the maintainer granted it to W119. **Q493-Q512: 11 issued.** W116
issued Q493 and Q494, W117 Q498-Q500, W119 Q505, and W120 Q508-Q511. **9 were unused:
Q495-Q497 SPENT (W116), Q501 SPENT (W117), Q502-Q504 SPENT (W118), Q506-Q507 SPENT (W119) and
Q512 SPENT (W120).** This was derived from the folder, since there is no file for any of the nine,
and `npm run q -- Q512` prints `# not found`. **The next plan starts at W121, Q513 and ADR 0082.**

### Corrections this Record carries rather than repeats

1. **The index row's *3,616 links in 260 files at `aa43cb3`* does not reproduce under one
   predicate on one tree.** W118's predicate is link text that is a Q id and a target that is the
   register. Under it, `aa43cb3` and `4eac349` each have **3,609 links in 258 files**. 3,616 is
   every link into the register at `aa43cb3`, WHATEVER its text. 260 is the file count at
   `4eac349` under that wider predicate. W118 re-counted **3,602 in 260** on `880221b` with its
   stated predicate, and rewrote 3,594 of them (the other 8 were unlinked by hand).
2. The index row's Owns says *both `TEMPLATE.md`*. Only `doc/work-items/TEMPLATE.md` changed:
   `doc/plans/TEMPLATE.md` names no register path (W118 stop-and-ask 6).
3. W118's declared gate named one reader. **Both ran**, at the maintainer's request, with overlap 1.
4. W117's *46 ADRs* was 47 by the time it ran. Its *ADR 0075 carries no Status line* is false, and
   W117's Record corrects it.
5. W119's Owns names `test/lookup/**`. That folder holds no test (W119 stop-and-ask 1), only one
   data file of the adequacy reader's mutants.

### What this plan taught

1. **What became checkable became DATA first.** `check:register` holds fields, never prose. ADR
   0080 consequence 1 deliberately holds no glossary sense line. This answers the ledger's most
   refused proposal from the other side, as P27 decision 4 did: the prose did not get a check;
   the facts stopped being prose.
2. **A register of files has the deletion a table hid**, so `git` sees it. **R4 sees it at `HEAD`
   only**, and a committed deletion is green for ever after. That is [Q493](../questions/q493.md),
   and the readers found four texts that claimed more.
3. **A plan's exit artifact can contradict the plan's own decision, and nothing reads a plan
   against itself.** W119's conformity reader found it, and decision 5 won.

## Retro

*Pass 3 ran on 2026-10-05 over `4a1b2d9`, and the working tree was clean before the join.
**NO CHANGE ADOPTED. One refusal is appended to the ledger**, and the returning condition of one
more was checked and not met. `doc/workflow.md` stays v0.27, following P8's and P25's precedent.
It changes only its Status count, the overlap ordinal and that ledger row's ordinal. No reader ran
on the join, because none was declared for it.*

### 1. Name the rung (rule 5): every rung firing the five Records name

| item | what fired | where it runs |
|---|---|---|
| W116 | `check:markdown:selftest`, RED on the declaration commit `4eac349` | `gate:full` only |
| W116 | `G6` refused the self-test's scratch path, which named no pid | `check:wiring`, in `gate` |
| W116 | the first `gate:full`, RED in `check:register:selftest`: long paths, and `R4` reporting NOT RUN on a real repository | `gate:full` only |
| W116 | the `closes_when` probe, graded WRONG-REASON | its own self-test |
| W117 | the fix round's self-test, EXIT 1 twice: META 172/173 (a sibling covering for a clause the fix introduced) and SELF 16/19 (anchors that cost nothing) | its own self-test, `gate:full` only |
| W119 | the first `lookup:selftest` at META 16/18; the first `gate:full`, RED at `check:wiring:selftest` (the LATE exception); the fix round's first run at READER 75/76 | its own self-test, and `gate:full` only |
| W120, W118 | **none.** W120's late exception was found by the withdrawn-claim grep, and W118's D1, N1 and N2 by its readers | — |

**Of nine firings, eight were in a lane that `npm run gate` does not run.** v0.26's clause, that the
confirming gate is `gate:full`, did its work in three items. **The readers remain the mechanism**,
as P26 and P27 found. W116's adequacy reader listed 36 survivors and constructed inputs. W117's found 18, beside
its conformity reader's two DEFECTs. W119's adequacy reader saw **52 of 78 mutants survive** and 10
of 16 harness mutants go undetected. W120's one reader found four DEFECTs, and W118's two found one
DEFECT and six survivor classes.

### 2. A Record figure moved by its author's own later edits: the *when* row, broken and caught three times

There are three occurrences in three items. In W118, 5,255 and 3,614 were moved by its own
`CLAUDE.md` example and Record links. In W119, `--table` went 83,035 -> 83,623 and `refs S9` 29 -> 30,
because Q505's resolution and the Record itself landed after the figures were taken. In W120 (N5),
5,328 became 5,332. **Each figure was right on the tree it was measured on.** Each item then changed
that tree without re-taking it, and that breaks section 1 rule 5's *when* row: re-take on the tree
the item SHIPS. The rule was not followed and failed. **The row's own mechanism, a conformity
reader, caught all three**, and each fix round re-took the figure. The one structural case is a
count that includes the Record's own text, which cannot be final until the Record is. W118 handled
it with the *write* row: *"before the Record's own links"*. **No rung reads a Record**, and the row
says so. **No change.**

### 3. A declared claim about a check's reach, wider than the check

- **W118**: its Tests said *M1 resolves every rewritten link*. M1 walks 3,060 of 3,594. The other
  534, in `.ts` and `.mjs` comments and `examples/README.md`, were resolved once by hand.
- **W116**: ADR 0079's decision 5 and consequence 5, its index row and two script headers each
  claimed more than `R4` does. The ceiling is now stated, and the gap is [Q493](../questions/q493.md).
- **W117** is arguable: R8 was declared to hold both directions while reading one spelling of
  `resolved-by` (its conformity reader's NOTE 2), and the fix round widened it.
- **W119 is adjacent, not the same.** Its declared refusals were provoked. The adequacy reader found
  refusals that the CODE has and the declaration never named.

That is two clean occurrences in different items, which meets rule 2's bar. **But the rule exists.**
The *write* row says *never the scope you believe*, and rule 8 (a) says break the SHAPES a claim
quantifies over. W118's control (e) was one shape, a markdown link in `spec/`, while its claim
quantified over four. The remedy the maintainer chose for W118, to correct the claim and add no
check, is the *write* row's own remedy. **Broken, caught by a reader each time: no change.**
**RUNG: none.** *"Did you build what you said"* is not a command (section 4).

### 4. A false pointer excused in a Record: one occurrence, and a refusal

W118 first excused `doc/README.md`'s register rows with an argument that contradicted its own
`Owns` (D1). **No other P28 item has this shape.** W117 left a false declaration sentence standing
and corrected it in its Record, which is a correction. W119 left a true conditional unedited outside
its `Owns`. One occurrence with no argument for generality does not meet rule 2. **The only observer
for it is a check over `doc/`, so that proposal is REFUSED a 27th time on the same ground.** Two more
instances of the class came up in this plan, and each item declined them by citing the row:
deleting a correction notice from an ADR's body passes the gate (W117, NOTE 5), and the prose of
W118's Outputs (2)-(4) has no observer (W118, survivor 6).

### 5. The `Owns` row's returning condition, checked and NOT met

The ledger says the row returns *"on a miscount with the list correct"*. P28 had four LATE
exceptions:

- W116's `.github/workflows/gate.yml`, added at its fix round on a reader's finding;
- W119's second `check-wiring.mjs` entry and its `check-wiring-selftest.mjs`;
- W120's `check-markdown-selftest.mjs` comment.

**None is a miscount.** Each was declared LATE in the item's own table before its Record. Every
Record's final `git diff --name-only` or `git status` matched its declarations: W117's table is
empty, W118 found *"the two sets are equal"*, W119 lists twelve paths and W120 ten. A
`check-owns.mjs` would have seen the same declared paths. **Not proposed, so nothing is appended.**

*It is still worth a line.* W119 missed `check-wiring-selftest.mjs`, which is exactly the file W116's
exceptions table named one item earlier, for the same reason: a new `:selftest` entry. That is
W112's precedent, *the fifth exception was the red one*, recurring. The rung caught it in 0.8 s, but
inside `gate:full`, at the cost of one 1,103 s gate. Running that lane alone first is what W119 then
did.

### 6. The overlap

| item | overlap |
|---|---|
| W116 | **3** |
| W117 | **2**, as its Record states it ("and a third arguable") |
| W119 | **4**, from two briefs that were written to differ |
| W118 | **1** |
| W120 | not measurable: one reader, as declared |

**That is four measurements, the seventy-eighth to the eighty-first, and all four fall inside
0-4.** The ordinal is now **eighty-one**, so the next measurement is the **EIGHTY-SECOND**.
Section 6 is updated, and the band's *fifty-nine* stays: it is the band's denominator, not the
ordinal (P27's retro).

### 7. `M3` crossed at the declaration, as forecast

P27's retro left `M3` at 142 with a one-document margin and wrote *"P28's declaration document is
safe and its FIRST ITEM FILE crosses it."* The declaration commit wrote six documents (the plan and
five item files) and crossed it. **No gate runs on a declaration.** W116's first
`check:markdown:selftest` found it, and ADR 0079 consequence 7 retuned the floor. P27 had chosen
that mechanism: *"the failure, when it comes, is loud, named and in `gate:full`"*. It happened that
way. **No change.** [Q487](../questions/q487.md), *a check prints its own margin*, is still open. P28
touched two of the three floors: `M3` at W116, and `M5` at W120 (28 -> 72, ADR 0080 consequence 4).

### 8. What the join changed, and what it ran

| file | why |
|---|---|
| this plan | the Status line, the Record and this Retro: the record step |
| `doc/questions/README.md` | *"Until the lookup lands (W119), the file name is the lookup"*, false since W119: the record step |
| `doc/open-questions.md` | the same claim (*"Once W119 lands … until then"*). **It is no longer a record-step file**, because rule 5 has named `doc/questions/**` since W118. It is W116's Output (3), so it is corrected under **pass 3 rule 6** and named here |
| `doc/workflow.md` | the retro's own: the Status count, the overlap ordinal, and the ledger's *27 times, P2-P28*. **35,771 -> 35,774 bytes** (`wc -c`), under the 35,840 ceiling |

**No item's file is edited, and no file under `spec/`, `scripts/` or `CLAUDE.md` is touched.** Only
`doc/` changed, so `gate:full` was not run. The checks a `doc/` edit can reach were each run and
redirected, with `$?` read in the same command: `check:markdown`, `check:markdown:selftest`,
`check:budget`, `check:register`, `check:wiring`, `check:docs` and `npm run state`.

**Left with an id, not taken by the join:**

- `doc/README.md`'s stale counts are [Q484](../questions/q484.md).
- A committed deletion is [Q493](../questions/q493.md).
- The 29 unpaired resolutions are [Q499](../questions/q499.md), deferred.
- **Triage of the 307 open questions is the maintainer's**, and none is iceboxed:
  `npm run q -- --where status=open --where "owner=no owner"`.
