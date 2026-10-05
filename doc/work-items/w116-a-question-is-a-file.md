# W116 — A question is a file, and `check:register` holds the folder

**Status:** done — both readers ran, the fix round acted on every finding, and `gate:full` exited 0
in this checkout on the final tree; R4's committed-deletion ceiling is stated and carried by Q493
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — this item defines the question file format, P28 decision 1. ADR 0079: a
            register is files with front matter and its index is derived; it amends ADR 0078
            (M7 and M8 leave check-markdown with their subject)
Owns:       doc/questions/**, doc/open-questions.md, scripts/check-register.mjs,
            scripts/check-register-selftest.mjs, scripts/check-markdown.mjs,
            scripts/check-markdown-selftest.mjs, scripts/state.mjs, package.json,
            scripts/run-selftests.mjs, doc/decisions/0079-*.md, this file
            (plus whatever check-wiring requires of a new gate entry — named at the start of the
            work, before the first edit, or the item stops)
Inputs:     doc/open-questions.md at aa43cb3: 383 rows, six tables, two shapes — 302 live rows
            (question, status, owner, closes-when) under seven cluster headings, and 81 resolved
            rows (cluster, question, what resolved it); its `## Notes` paragraph that has no other
            home; P28 decisions 1 and 3
Outputs:    (1) 383 files doc/questions/q<N>.md, front matter per P28 decision 1, no body
            (2) doc/questions/README.md: the status vocabulary — four words, with what separates
                `icebox` from `deferred` (P28 decision 1) — the declared cluster list, the kept
                `## Notes` paragraph, and how to raise or icebox a question
            (3) doc/open-questions.md as a pointer of a few lines: where the rows went, and
                `npm run q` once W119 lands
            (4) check:register R1-R5, its self-test, and its gate entry
            (5) M7 and M8 deleted from check-markdown, with their self-test probes
            (6) state.mjs counting the folder rather than parsing the table
            (7) ADR 0079
Depends on: nothing
Blocks:     W117, W119, W120, W118
Tests:      the split is checked against the OLD register, never against itself: every row of
            `git show aa43cb3:doc/open-questions.md` is parsed independently and compared cell by
            cell with the file's fields. Each R clause is provoked in check-register-selftest
            (section 5 rule 7), each probe declaring the exact set it trips
Gate:       L0-L6 via gate:full; the round-trip; conformity and adequacy readers
Reserves:   Q493-Q497, ADR 0079
```

## Scope

**In**

1. **The split.** A one-shot script, run from `dev-dist/w116-split/` and not checked in — its output
   is the tree, and the round-trip is what checks it. Titles, owners, closes-when and resolved-by
   are copied **verbatim**. A live row's status cell is split at its first word: the word is
   `status`, the rest is `note`. A live row's cluster is the heading it sits under; a resolved row's
   is its own cell. `raised-by` is left empty — **the register does not carry it, and a migration
   that guesses it writes a claim nobody ran.**
2. **`check:register`**, clauses for questions:
   - **R1** every file in `doc/questions/` other than `README.md` is `q<N>.md`, and its `id` is
     `Q<N>`; no id appears twice
   - **R2** every required field is present; `status` is one of `open`, `deferred`, `icebox`,
     `resolved`; `cluster` is in the list `doc/questions/README.md` declares; **`icebox` carries a
     non-empty `note`** saying why it is a what-if. *The migration produces no `icebox` row, so the
     self-test is the only place that clause is exercised until the maintainer ices one.*
   - **R3** `status: resolved` if and only if `resolved-by` is non-empty; every `ADR`, `P` or `W` id
     named in `resolved-by` exists in the tree
   - **R4** **a question file present at `HEAD` is present in the tree** — the deletion `M8` could
     not see. *Self-test trees are copies; if a copy has no `.git`, R4 must say it did not run
     rather than pass — decided at the start of the work, and if it cannot be made to, stop and
     ask.*
   - **R5** a vacuity floor: at least 383 files, a ratchet that only moves up, as `M8`'s did
3. `M7`, `M8`, `REGISTER_ROW_FLOOR` and their probes leave `check-markdown`.
4. `state.mjs` reads `doc/questions/` for the register counts and the next free Q, and counts
   `icebox` as its own line among the live statuses.

**Out**

- Rewriting any link — W118. The links still resolve, to the pointer.
- The lookup — W119. Until it lands the pointer names the folder.
- ADR headers — W117. R3 checks that a named ADR file EXISTS, nothing about its header.

## Verification

- `npm run check:register` and `npm run check:register:selftest`, each read by exit code
  (`> log 2>&1; echo EXIT=$?`).
- **The round-trip**: an independent parser of the old register against the folder; it prints the
  count of rows compared and of cells differing, and the item's claim is *383 compared, 0 differing*.
  A control row edited in the copy must come back as one difference.
- `npm run state` before and after: the register counts (383; 302 / 81; 301 / 1) are unchanged,
  and `icebox` reads 0.
- `npm run gate:full` once, on the final tree.
- *Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — no code under `src/` changes.*

## Declared exceptions

**Named at the start of the work, before the first edit** — the `Owns` line's parenthesis. What
a new gate entry requires was read off the clauses that hold one, and W112's Record is the
precedent: its declaration named four and the fifth was the one that was red.

| path | why | clause |
|---|---|---|
| `scripts/check-source.mjs` | `GATE_CHAIN` declares the seventeenth entry, `check:register`, in the chain's order | `S12` refuses a gate entry `GATE_CHAIN` does not declare, both ways and in order |
| `scripts/check-wiring-selftest.mjs` | `CHECKS` gains `register`; the `SELF` entry anchored on `, 'budget'];` moves to the new last name | the `CHECKS` both-ways comparison against the manifest's `:selftest` entries — W112's fifth clause |
| `doc/decisions/README.md` | ADR 0079's index row | `X11` compares the index to disk both ways. Inside the record step's `doc/decisions/**`, named anyway |
| `.github/workflows/gate.yml` | **added at the fix round, after both readers**: its comment said *a sixteen-entry `&&` chain*, made false by this item's seventeenth entry. The count is removed rather than bumped — P27 decision 4 — which is section 1 rule 5's *un-write* | none — a comment, found by the adequacy reader |

**Inside `Owns`, and decisions rather than mechanics — ADR 0079 carries each:**

- `check-markdown` stops reading **YAML front matter** as markdown. Four rows carry a link verbatim
  (`](#live)` three times, `](decisions/0077-…)` once), written relative to the OLD register, and
  copied verbatim into a front-matter field they resolve to nothing. A field is data, not a link.
- `M3`'s floor is retuned: 384 files arrive in a directory neither `removes` probe cuts, which is
  [Q142](../open-questions.md)'s window from below for the twelfth time.
- The `M2` same-file-anchor probe is re-pointed from the register, whose `](#live)` leaves with it,
  to `doc/scheduler-upstream.md`'s own S-id anchors.
- **`M7` and `M8` have no self-test probes to delete** — `grep -c 'M7\|M8'` over
  `scripts/check-markdown-selftest.mjs` is zero on `4eac349`. Output (5)'s *with their self-test
  probes* is a claim about a set that is empty.
- Three live status cells open with `**` (Q92, Q407, Q442), so *the first word* is `**open` or
  `**deferred`. The status is the word inside the bold, and the note keeps the opening `**` — so the
  bold span the cell opened still closes inside the note, and the cell is recoverable exactly.

## Record

**Status: both readers RAN and the fix round acted on every finding** (the maintainer approved
acting on them). The rows above the fix round are the FIRST round's, kept as they were measured;
the fix round's rows, and its confirming gate, follow the readers' rows. **No sha yet: everything
below ran on the uncommitted tree.**

**Gate — what ran.** Every rung RUN and redirected, `$?` read on its own line.

| Clause | Verdict | Notes |
|---|---|---|
| the round-trip | **RAN, EXIT 0** | an independent parser of `git show aa43cb3:doc/open-questions.md` (a character scanner, its own front-matter reader, nothing shared with the split): **383 rows compared against 383 files, 4,294 cells compared, 0 differing**. Control: one `owner` edited in a copy came back as **exactly one** difference; one file deleted in a copy came back as one (`Q300: no file`) |
| `npm run check:register` | **RAN, EXIT 0** | `R1`-`R5` ok; R3 checked 33 ADR/P/W references; **R4 compared 0 files at HEAD** — vacuous on this tree by construction, ADR 0079 consequence 5 |
| `npm run check:register:selftest` | **RAN, EXIT 0** | 28 probes — **21/21 caught, 7/7 clean**, every probe's declared trip set AND NOT RUN set matched exactly; 4/4 grader controls; **26/26 META noticed by the named probe, 0 by the corpus**; 11/11 SELF bounded; 0 scratch residue; digest unmoved. Green in this checkout AND in an npm-installed copy under a deep path |
| `npm run check:markdown` + `:selftest` | **RAN, EXIT 0** | 39/39 probes, 39/39 META (30 by the named probe, 9 by the corpus), 7/7 SELF. **The self-test was RED on `4eac349` before this item touched it** (below) |
| `npm run state`, before and after | **RAN, EXIT 0 both** | 383; 302 / 81; 301 / 1 — unchanged; `iceboxed 0`; next free Q493 both times |
| every other `gate` entry, alone, in this checkout | **RAN** | all EXIT 0 except **`check:scheduler` (D1)** and **`test:browser`** — both ENVIRONMENT, below |
| **`npm run gate:full`** | **RAN TWICE; the second is the verdict: EXIT 0, zero `FAIL` lines** | in an npm-installed byte copy of this tree (below). **3,675 s** (61 min), selftests **3,416.9 s wall** over 9 lanes, 11,648.6 s serial-equivalent, 10/10 ok. **`check:register:selftest` was the slowest lane at 3,400.1 s** — against `check:docs` 2,520.9, `source` 1,951.5, `markdown` 1,769.6, `wiring` 1,246.9 on the same run, every lane about twice its first-run figure, so the machine was loaded. **The first run (1,408 s) was RED in this item's own lane** — finding 3 below — and is why there is a second |
| conformity reader | **RAN** (fresh context, spec first) | **nothing blocking.** Should-fix: `R4`'s ceiling unstated, and FOUR texts claimed more than `R4` does — ADR 0079 decision 5 and consequence 5, the ADR index row, `check-markdown.mjs`'s M7/M8 note, `check-register.mjs`'s header. Notes: `M3` at 362 is mostly a check that `doc/questions` is walked; the front-matter skip applies to every file; the status-cell encoding round-trips only on this corpus; `owner` is verbatim prose against P28 decision 1's comment; R3 missed `ADRs 0003 and 0004` and `ADR-0003`; the "declared subset" accepted YAML-typed words against the README's own sentence; `check-source.mjs` outside the literal `Owns` (declared) |
| adequacy reader | **RAN** (isolated copy, 122 entries, every survivor PROVED: real check red on the input, mutant green) | **survivors through `check:register`, all 28 probes, 4 grader controls and the corpus**: R1-n1..n3; R2-n1..n9 and R2-r1..r5; R3-n1..n3; R4-n3; `state.mjs` S1, S1b, S2-S5, S7 and an `EISDIR` crash; the front-matter skip K2 and K4; constructed inputs C10, C11 (fixed), C12, C14 (raised as Q493); the stale *sixteen-entry* comment in `.github/workflows/gate.yml` |
| the readers' overlap | **3 shared subjects** | `R4`'s claim, the `owner` prose, R3's ADR spellings |
| **FIX ROUND** — `check:register` | **RAN, EXIT 0** | R3 reads EVERY ADR id: `ADR N`, `ADR-N`, and the list forms `ADRs N and M`, `ADRs N, M and O`, `ADRs N/M`; a plain word YAML would type (`null`, `~`, `true`, `yes`, `on`, numbers) is refused; each plain-subset guard is its own line; `git` with `core.longpaths` |
| **FIX ROUND** — `check:register:selftest` | **RAN** — every grading clean; EXIT 1 on ONE line, `THE TREE MOVED`, because the author edited this Record while it ran — **the verdict is the confirming gate's lane below** | **81 probes: 73/73 caught, 8/8 clean; 4/4 grader; META 50/50 noticed by the named probe, 0 by the corpus; STATE 6/6, STATE_META 10/10; SELF 14/14** |
| **FIX ROUND** — `check:markdown` + `:selftest` | **RAN, EXIT 0 both** | 42/42 probes, 41/41 META (32 by the named probe, 9 by the corpus), 7/7 SELF |
| **FIX ROUND** — the round-trip | **RAN, EXIT 0** | 383 rows compared against 385 files, 4,294 cells, **0 differing**; Q493 and Q494, raised by this round, declared by id as having no row |
| **FIX ROUND — `npm run gate:full`, the CONFIRMING gate** | **RAN ONCE, EXIT 0, zero `FAIL` lines** | **in THIS checkout**, now npm-only (`pnpm-lock.yaml` deleted, `node_modules` reinstalled with `npm ci`, 0 links), on the UNCOMMITTED tree — no sha yet. **2,179 s** (36 min); selftests **2,006.1 s wall** over 9 lanes, 6,659.8 s serial-equivalent, 10/10 ok. `check:register:selftest` **1,983.7 s**, still the slowest lane (`check:docs` 1,423.0) — its figures there: 73/73 caught, 8/8 clean, 4/4 grader, 50/50 META, 6/6 STATE, 10/10 STATE_META, 14/14 SELF, digest unmoved. `check:scheduler` and `test:browser` both green here. R4 compared 0 files at HEAD, as consequence 5 says it must until this item is committed |
| **FIX ROUND** — `npm run state` | **RAN, EXIT 0** | 385; 304 / 81; 303 / 1; iceboxed 0; next free Q495; **25** derivations, four of them the second route |

**The environment, and why the confirming gate ran in a copy.** This checkout's `node_modules` was
installed by **pnpm** (an untracked `pnpm-lock.yaml` predates this item): every package is a
JUNCTION into `node_modules/.pnpm`, which `check:scheduler`'s `D1` refuses by design, and playwright
resolved to 1.63.0, whose chromium build is not in the local cache — so `test:browser` cannot launch.
Neither is W116's. **The item did not reinstall**: replacing someone's install is not this item's
call. All 12 links were scanned and point inside `node_modules`; `npm ci` in this checkout is the
one-command fix. The confirming gate ran in a copy of every tracked and untracked file (`diff -rq`
empty against this tree, excluding `node_modules`, `.git`, `dev-dist`, `dist`), `npm ci` there, no
`.git` — so `R4` reports NOT RUN in that copy, which is its declared behaviour.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) 383 files `doc/questions/q<N>.md` | yes | `R5` below 383; `R1`/`R2` on any malformed one; the round-trip on any changed cell |
| (2) `doc/questions/README.md` | yes | `R2` — the cluster list is read from its `## Clusters` table; the self-test empties it |
| (3) `doc/open-questions.md` as a pointer | yes | `M1` on its two links into the folder |
| (4) `check:register` R1-R5, self-test, gate entry | yes | `S11`, `S12`, `G1`-`G4`, and `check-wiring-selftest`'s `CHECKS` comparison |
| (5) `M7`/`M8` deleted | yes | nothing — a deletion. **They had no self-test probes**: zero occurrences of either id in `check-markdown-selftest.mjs` on `4eac349` |
| (6) `state.mjs` counting the folder | yes | its own `register` assertions, which refuse an empty reading |
| (7) ADR 0079 | yes | `X11` against `doc/decisions/README.md` |

**What broke, found by running it.**

1. **`check:markdown:selftest` was RED on `4eac349`**: P28's declaration wrote six documents, probe 1
   read 146 files against `M3`'s 142 — Q142's window again, unnoticed because no gate ran after the
   declaration. Fixed here by the retune ADR 0079 consequence 7 records.
2. **`G6`** refused the self-test's digest walk naming the scratch directory without a pid — the
   line `check-budget-selftest.mjs` declares as an exception. Re-derived from the run's own `dir`.
3. **The first `gate:full` was RED in `check:register:selftest`, by two defects the repository's
   own path had hidden.** Under a 163-character scratch path `git` could not read its object store
   past Windows' 260: the staged commits failed (*Filename too long*) and — the real defect — the
   CHECK's own `ls-tree HEAD` failed, so `R4` reported NOT RUN on a tree that WAS a repository.
   `core.longpaths` in both. And the top-level guard's META entry was graded `STILL clean`, because
   its probe got its outer repository from the ENVIRONMENT (this checkout) and a copy outside any
   repository has none: a `nested` probe now builds one.
4. `closes_when` as the undeclared-field probe was refused EARLIER, as a line that is not
   `key: value` — `wrong-reason` on the first run; the probe uses `closes-by`.

**The cost, and what the fix round did about it.** The new lane was the slowest in the first round's
`gate:full` (3,400 s): five of its eleven SELF children re-ran the whole probe pass AND the whole
META pass after already being red. **The fix round takes the cut the first round left to the
maintainer**: a SELF child stops at its first red, since its only verdict is *did the suite go red*;
a child whose planted case lives in META or STATE is not red before them and still reaches them.
The suite itself grew to 81 probes, 50 META, 6 STATE and 10 STATE_META.

### The fix round — every survivor, and the checked-in probe that now catches it

Each reader's exact edit is a checked-in META entry naming the probe written for it, so the rule 8
re-run IS `check:register:selftest`'s META pass: **50/50 noticed by the named probe, 0 by the
corpus.** The probes are written to the RULE (section 5 rule 8 (a)) — every value it enumerates —
not to the one bad value each reader used.

| survivor | the mutation | now caught by |
|---|---|---|
| R1-n1 | `NAME` case-insensitive | *an UPPER-CASE name, Q9001.md* |
| R1-n2 | the id compared numerically | *a padded ID inside its own file — `id: Q017`* |
| R1-n3 | the id compared upper-cased | *a lower-case ID — `id: q17`* |
| R2-n1, R2-n2 | the status by prefix; case-folded | a NEAR-MISS of every status word: `opened`, `Open`, `Deferred`, `iceboxed`, `Resolved` |
| R2-n3, R2-n4 | clusters case-folded; by substring | a lower-cased NEAR-MISS of EVERY declared cluster (eight), `"join"`, `"The join "` — and `CLUSTERS` is compared to the README both ways |
| R2-n5, R2-n6 | the icebox-note and non-empty tests without their trim | *icebox with a note of one SPACE*; *a title of one SPACE* |
| R2-n7 | the missing-field test skipping `note` | **each of the ten fields deleted**, one probe each |
| R2-n8 | only hyphenated extras flagged | *an undeclared field with no hyphen — `foo`* |
| R2-n9 | a reader normalising BOM and CRLF | *a file with a BOM and CRLF line ends* |
| R2-r1 | the duplicate-key refusal deleted | *a field declared TWICE* |
| R2-r2 .. R2-r5 | each plain-subset guard deleted | a trailing space; `[a, b]`; `a # comment`; `shared: ` — each guard now its own line and its own probe, plus the mapping case |
| conformity: typed words | — the subset accepted `null`, `true`, `123` as strings | the READER changed to agree with the README: nine typed words, a probe each, and a META for the guard |
| R3-n1 | only the first ADR of a cell read | *two ADRs, the SECOND missing — `ADR 0001 and ADR 9999`* |
| C10, C11 | (passed the REAL check) | R3 FIXED: *the LIST form — `ADRs 0001 and 9999`*, *the HYPHENATED form — `ADR-9999`*, and a clean `ADRs 0001 and 0002`; META for each |
| R3-n2 | the emptiness test without its trim | *resolved with a resolved-by of one SPACE* |
| R3-n3 | the reverse clause narrowed to `open` | *deferred* and *icebox* with a resolved-by filled |
| R4-n3 | the INDEX compared instead of HEAD | *a question removed with `git rm` — staged, not committed* |
| S1, S1b | `state.mjs`'s listing narrowed | a SECOND ROUTE in `state.mjs` (its own `readdirSync`), and the STATE CONTROL graded against a third reading |
| S2 .. S5 | `icebox` dropped from the pattern, the relation, the count, the line | *STATE — one question iceboxed* |
| S7 | live counted as a sum, which makes the relation a tautology | *STATE — a status outside the four words* |
| `EISDIR` | a directory named `q9002.md` crashed `state` | `state` refuses it BY NAME; *STATE — a DIRECTORY named q9002.md* |
| K2 | the front-matter fence moved to the LAST `---` | `check-markdown`: *a dead link ABOVE a thematic break* (and one BELOW) |
| K4 | an unclosed `---` blanking the whole file | decided: **an unclosed opening `---` is NOT front matter and nothing is blanked**; *an opening `---` that never CLOSES* |
| C12, C14 | a COMMITTED deletion; an id gutted and re-used in place | **not fixed — raised as [Q493](../questions/q493.md)**, priced options, no decision; the ceiling is now stated in all four places that over-claimed |
| `gate.yml` | a stale *sixteen-entry* comment | the count removed — the declared exception above |

**Question ids raised**: [Q493](../questions/q493.md) (what guards a committed deletion and an id
re-used in place) and [Q494](../questions/q494.md) (is `owner` an id field or prose — the README
now says what is true: prose, or empty on a migrated resolved question). Q495-Q497 are unused.
