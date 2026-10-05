# W117 — An ADR's header is data, and supersession is declared once

**Status:** done — both readers ran, the fix round acted on every finding, and `gate:full` exited 0; see the Record
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — P28 decision 2, under ADR 0079 (W116's). No new ADR expected; 0081 is held
            for a decision the work finds
Owns:       doc/decisions/0*.md (header lines and the Status prose they carry, nothing else),
            doc/decisions/TEMPLATE.md, scripts/check-register.mjs,
            scripts/check-register-selftest.mjs, this file
Inputs:     the 46 ADRs at the commit W116 closes on. Their headers are not uniform: 45 carry
            `**Status:** accepted` with prose after it, ADR 0075 carries no Status line, 33 carry
            `**Raised by:**`, 10 carry `**Item:**` instead, and 11 carry `**Supersedes:**`
Outputs:    (1) every ADR opens with front matter per P28 decision 2, followed by its H1
            (2) any Status prose beyond the status word moved VERBATIM into the body, directly
                under the H1 — a correction notice is never deleted (decisions README)
            (3) TEMPLATE.md in the new shape
            (4) check:register R6-R8 and their probes
Depends on: W116 (check-register exists)
Blocks:     W119, W118
Tests:      the header round-trip, against the OLD headers parsed independently; R6-R8 provoked
            in the self-test, each probe declaring its exact set
Gate:       L0-L6 via gate:full; the round-trip; conformity and adequacy readers
Reserves:   Q498-Q501, ADR 0081
```

## Scope

**In**

1. Each ADR's bold-line header becomes front matter. `supersedes` and `amends` list ids and rule
   numbers the ADR's own header states — **never inferred from its body.** Where only the OLDER
   ADR states a supersession (ADR 0066's *rule 7 SUPERSEDED by ADR 0067*), the newer ADR's
   `supersedes` gains it and the item's Record lists each such case by id.
2. `resolves` is filled only where a header's `Raised by:` names a Q **and** that question's file
   says `resolved` naming this ADR. Every other case is listed in the Record, not guessed.
3. Clauses:
   - **R6** every ADR file is `NNNN-<slug>.md`, its `id` is `ADR NNNN`, and its required fields are
     present; `status` is `proposed` or `accepted`
   - **R7** every id in `supersedes`, `amends`, `raised-by` and `resolves` exists
   - **R8** **both directions**: an ADR that `resolves: Q<N>` is named by that question's
     `resolved-by`, and a question whose `resolved-by` names an ADR is listed in that ADR's
     `resolves` (section 5 rule 8 (e))

**Out**

- Any edit to an ADR's decision text — `doc/decisions/README.md`: superseded, never edited.
- Deleting the hand-kept index — W119, once the command that replaces it exists.

## Verification

- `check:register` and its self-test, each by exit code.
- **The round-trip**: an independent parser of every old header against the new front matter —
  *46 compared, 0 fields lost*; a control edit must come back as one difference.
- `npm run gate:full` once, on the final tree.
- *Routing cases: not applicable.*

## Record

**Status: both readers RAN, and the fix round acted on every finding** (the maintainer approved acting
on them, 2026-10-05). The rows above the readers' are the FIRST round's, kept as they were measured;
the fix round's rows follow the readers'. Everything below ran on the uncommitted tree over
`cfe671a` — no sha yet.

**Files changed.** `doc/decisions/0*.md` (all 47), `doc/decisions/TEMPLATE.md`,
`scripts/check-register.mjs`, `scripts/check-register-selftest.mjs`, this file, and — record step,
section 1 rule 5 — `doc/questions/q498.md`-`q500.md`. **Nothing outside `Owns` and the record step**:
no check outside `check-register` reads an ADR header (grepped at the start: `state.mjs` counts ADR
file names, `check-docs`' `X11` compares the README index to the names, `check-markdown` blanks a
front-matter block), so the exceptions table is empty.

**Gate — what ran.** Every command RUN and redirected, `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| the header round-trip | **RAN, EXIT 0** | an independent parser (a scanner of `git show cfe671a:doc/decisions/*`, its own front-matter reader, sharing no code with the migration): **47 ADRs compared** — not 46: ADR 0079 arrived with W116 — **282 derived fields** (`id`, `title`, `status`, `date`, `item`, `raised-by`), **14 supersede/amend pairs** read from verb statements in the OLD headers (active and passive) against the pairs the new fields declare, every rule qualifier's numbers found in one of the two headers, **47 `resolves`** against the question side at `cfe671a`, and **every header segment either held by fields (83) or present verbatim in the new body (75)**, with the body rebuilt byte for byte from the old file minus exactly the segments that left: **0 differences, 0 lost**. **Re-run after Q498's answer**, its `item` and `raised-by` derived word by word under the answered rule (an id whose two preceding words are *decided*/*taken* and *by*/*at*), the five judged ADRs declared by id: **0 differences, 0 lost** |
| round-trip controls | **RAN, each as declared** | `raised-by` of 0003 narrowed in a copy: **exactly one** difference, and after Q498 its `item` W4 edited to W5: **exactly one**. A moved `Raised by:` line deleted from 0003's body: one (`LOST`). 0025's `supersedes` emptied: one (`the old headers state 0025 over 0003`). `raised-by` of 0001 edited: **two** — one edit seen by two comparisons, because 0001's `Raised by:` line LEFT the file and the lossless check then finds `Q1` held by no field; stated rather than counted as one |
| `npm run check:register` | **RAN, EXIT 0** | R1-R8 ok; R6 read 47 ADRs; R7 checked 125 ids after Q498 (121 before it); R8 compared 12 pairings and excused 1 by id (Q466 -> ADR 0077) |
| `npm run check:register:selftest` | **RAN, EXIT 0** | **625 s** alone, before the gate. **197 probes — 185/185 caught, 12/12 clean**, every declared trip set AND NOT RUN set matched; 4/4 grader controls; **META 133/133 noticed by the named probe, 0 by the corpus**; STATE 6/6, STATE_META 10/10; SELF 14/14 bounded; 0 scratch residue; digest unmoved. The same 197 graded as declared on the FIRST pass-1 run (216 s), before any probe was adjusted |
| `npm run check:markdown` | **RAN, EXIT 0** | 581 documents, 5,266 relative links in 191, 35 anchored; M1-M6 ok |
| `npm run check:markdown:selftest` | **RAN, EXIT 0** | 282 s; 42/42 probes, 41/41 META (32 by the named probe, 9 by the corpus), 7/7 SELF — unchanged from W116 |
| CR bytes | **0** in every file this item wrote | `tr -cd '\r'` counted per file over `git diff --name-only` and the three question files |
| **FIRST ROUND — `npm run gate:full`** | **RAN, EXIT 0, zero failing lines** — the first round's tree, not the final one | **in THIS checkout** (npm-only, 0 links), after Q498's answer, with only this row unwritten: **1,095 s**; selftests **957.6 s wall** over 9 lanes, 3,801.8 s serial-equivalent, 10/10 ok. **`check:register:selftest` 944.3 s, still the slowest lane** (`check:docs` 796.8, `source` 708.9) — against **1,983.7 s** for W116 with 81 probes, at 2.4 times the suite, which is decision 8: 185/185 caught, 12/12 clean, 4/4 grader, 133/133 META by the named probe, 0 by the corpus, 14/14 SELF, digest unmoved. R7 checked 125 ids. The word `FAIL` occurs 12 times in the log, each inside a passing test's name. **An earlier `gate:full` on the tree BEFORE Q498's answer also exited 0** (1,209 s); it is not the verdict, because 31 ADRs changed after it |
| conformity reader | **RAN** (fresh context, spec first, 12+ ADRs re-derived from `cfe671a` before reading the front matter) | **nothing blocking; two DEFECTs** — supersession declared on the OLDER ADR, and a cycle, accepted; Q500 closed against its own `closes-when`. **Seven NOTEs**: plan ids in no field; R8 blind to `adr NNNN` and a link alone; the timestamp guard over-refusing `2026-1-4`; R7 permissive (a duplicate id, an ADR naming itself, two items, `rule 3 and 5`, a missing rule number); a correction notice deletable from a body with the gate green; the declaration's *0075 carries no Status line* false; the status word written twice. Every count the Record published reproduced: 47, 282, 14 pairs, 6 `resolves`, 12 pairings, 31 moved items (26 / 5), 125 ids, 83 / 75 |
| adequacy reader | **RAN** (an isolated byte copy outside the repository, `npm ci`, 0 links; 21 mutants, 2 harness mutants, 10 constructed inputs; every survivor PROVED four ways) | **18 survivors**, none named by META: the ADR name (a dot, a doubled hyphen, an end anchor), a question field on an ADR, a leap-day table, a whitespace-only field, `or` in a qualifier, R8's forward and stale-exception tests as substring reads, and NINE clauses of the timestamp's time part. **Constructed inputs the real check got wrong**: `1:30`, `190:20:30.15`, `0b101`, `+0x1F`, `W1:`, a tab-led comment, `? x` accepted; `0026-10-04` refused; an older ADR superseding a newer one. **The harness**: the restore asserted and not proved — the digest blind to empty directories, a path/bytes shift and `.git` below the root; the assertion deletable for a green suite. It reports reading META before its mutation list was complete |
| the readers' overlap | **2 shared subjects**, and a third arguable | the DIRECTION of supersession (both by construction); the TIMESTAMP guard (over-refusing, and under-probed); arguably R8's reading of `resolved-by` (its forms; substring reads) |
| **FIX ROUND** — `npm run check:register` | **RAN, EXIT 0** | R1-R8 ok; R3 checked 36 references (three new: the questions' `W117`); R6 read 47 ADRs; **R7 checked 132 ids** (125 and the seven plan ids); R8 compared 12 pairings and excused Q466 -> ADR 0077 — reading `resolved-by` in either case and through links found no pairing the first reading missed |
| **FIX ROUND** — `npm run check:register:selftest` | **RAN THREE TIMES; the third is the verdict: EXIT 0** | **686 s.** **238 probes — 221/221 caught, 17/17 clean**; RESTORE CONTROL 4/4; 4/4 grader; **META 173/173 by the named probe, 0 by the corpus**; STATE 6/6, 10/10; **SELF 19/19**; digest unmoved. The first run was **EXIT 1 at META 172/173** and the second **EXIT 1 at SELF 16/19** — the two rows the fix-round table opens with |
| **FIX ROUND** — the round-trip | **RAN, EXIT 0** | re-derived with the plan-id rule, independently: 47 ADRs, 282 fields, 14 pairs, 47 `resolves`, 83 / 75 segments, **0 differences, 0 lost** |
| **FIX ROUND** — `npm run check:markdown` + `:selftest` | **RAN, EXIT 0 both** | 584 documents, 5,269 links in 191, 35 anchored; 42/42 probes, 41/41 META (32 / 9), 7/7 SELF, 360 s |
| **FIX ROUND — `npm run gate:full`, the CONFIRMING gate** | **RAN ONCE, EXIT 0, zero failing lines** | **in THIS checkout** (npm-only, 0 links), on the fix round's final tree with only this row unwritten: **1,671 s**; selftests **1,533.1 s wall** over 9 lanes, 4,908.1 s serial-equivalent, 10/10 ok. `check:register:selftest` **1,519.4 s**, the slowest lane (`check:docs` 1,121.8) — its figures there: RESTORE CONTROL 4/4, 221/221 caught, 17/17 clean, META 173/173 by the named probe, 0 by the corpus, SELF 19/19, digest unmoved. R7 checked 132 ids. The word `FAIL` occurs 12 times in the log, each inside a passing test's name; 0 failing lines |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) every ADR opens with P28 decision 2's front matter, then its H1 | yes, 47 | `R6` (fields, id, vocabulary, date, H1); the round-trip |
| (2) Status prose moved VERBATIM under the H1 | yes — every header line carrying anything a field does not hold, label included | the round-trip's LOSSLESS comparison; a correction notice deleted is a segment no field holds |
| (3) `TEMPLATE.md` in the new shape | yes | nothing checks it — `R6` skips it by name, as it skips README.md |
| (4) `check:register` R6-R8 and their probes | yes | the self-test's coverage gate: every id the check can report has a probe and a META entry |

### Decisions the plan did not make, each taken here

1. **A header LINE leaves only when its fields hold every word of it; any other line moves WHOLE,
   label included, directly under the H1, in its original order.** The brief said *prose after the
   status word*; cut out of its line, `— **two false statements corrected in place**` reads as
   nothing, and `decided by under` as less. 83 lines left, 75 moved. 0075's code-block header keeps
   its fence around the four lines that moved.
2. **`item` is the work item that DECIDED or TOOK the ADR, and `raised-by` is what raised it** —
   the maintainer's answer to **Q498** (2026-10-05). The first cut took each field from the header
   line of its own name only, which put the deciding item in `raised-by` for 29 ADRs and left 0029,
   0068 and 0070 with neither. **The rule**: an `Item:` line's W ids; otherwise a W id the old header
   names after `decided by`, `taken by` or `taken at` — on the `Raised by:` line or in the Status
   line — which leaves `raised-by` unless that line names it another way. **26 ADRs by the rule**
   (0055's from its Status, *taken at W66*, its `raised-by` keeping W66 because its line reads
   *raised by W66's declaration step*; 0025 keeps W15, *on W15's evidence*). **5 judged**, each
   confirmed outside the header: 0022 and 0023 (`W13 / P4 / Q<n>`, no verb — W13's own Outputs
   name both ADRs), 0004 (*W1, via the spec-conformity pass*; W1's file: *it used 0004* — W1 stays
   in `raised-by` too, since the line says it raised it), 0068 (*W99 under P25*) and 0070 (*W103,
   an item outside any plan*), both from Status. **Only 0029, raised by the maintainer, has neither
   field.** **And the plan it was taken under joins `raised-by`** — the maintainer's answer at the
   fix round, as *under P1* on a `Raised by:` line already did: 0039 P11, 0062 P22, 0066 and 0067
   P24, 0068 P25, 0074 and 0075 P26. `Plan:`, `Answers:` and `Spec:` have no field in P28 decision 2 and stay in the body.
3. **`supersedes` and `amends` hold `ADR NNNN` entries separated by `; `**, each optionally
   qualified by `rule(s) N`, `decision(s) N` or `in part`, as its header states it. Non-ADR targets
   (`spec/flow-definition.md`, `check-docs`' `X8`/`X10`, `M4`'s subject, `doc/workflow.md`
   rule 5, a `package.json` entry) are not ids, stay in the body, and the field is `""`.
4. **Ids are bare, never links** — `check-markdown` blanks front matter, so a link there is checked
   by nothing. `R7` refuses a link in a list field.
5. **`date` is QUOTED, and the reader now refuses a plain `YYYY-MM-DD`** as YAML 1.1 types it a
   timestamp — W116's conformity reader's finding about `null` and `123`, one type further, because
   the ADRs brought the first date field. No question file carried a plain date (grepped).
6. **`R6` checks the H1 against the `title`**, and `R7` checks `item` as well as the four fields the
   declaration names — the H1 and the title are one fact written twice, and an `item` naming a
   missing item is the defect `R7` exists for.
7. **`R7` and `R8` say NOT RUN where the question folder is unreadable**, since both compare against
   it. The W116 probe that removes the folder now declares them in its NOT RUN set.
8. **The probes stage in ONE reused working tree**, restored from the base and the restore ASSERTED
   by digest before every probe. Measured: the first read of a freshly copied ~850-file tree cost
   2,221 ms and the second 30 ms — on-access scanning — and a fresh copy per probe paid it twice
   per probe. Pass 1 alone, 197 probes, then took 216 s. `git` probes still stage fresh copies.

### Supersession and amendment — every pair, and where its header states it

| newer | field | older, as declared | stated in |
|---|---|---|---|
| 0025 | supersedes | `ADR 0003 rule 5` | **the OLDER ADR only** — 0003's Status line; 0025's header is silent. **The one older-only case** |
| 0027 | supersedes | `ADR 0023 rule 2` | 0027's Status, and 0023's |
| 0029 | supersedes | `ADR 0013 rules 3 and 5` | 0029's Status, and 0013's |
| 0048 | supersedes | `ADR 0013 rules 1, 2 and 6` | 0048's Status, and 0013's |
| 0067 | supersedes | `ADR 0066 rule 7` | **0067's own `Supersedes:` line**, and 0066's Status — so 0066/0067, the brief's example, is NOT an older-only case |
| 0068 | supersedes | `ADR 0066 in part` | 0068's `Supersedes in part` |
| 0070 | supersedes | `ADR 0039 in part` | 0070's `Supersedes in part` |
| 0072 | supersedes | `ADR 0039 rule 3 in part` | 0072's `Supersedes:` (*rule 3's exclusive SET, not its mechanism*), and 0039's |
| 0054 | amends | `ADR 0049; ADR 0051` | 0054's Status (*Amends ADR 0049*; *retires … ADR 0051's `FD-V37`* clause), and 0049's and 0051's (*amended by ADR 0054*) |
| 0056 | amends | `ADR 0053 rule 2` | 0056's Status |
| 0077 | amends | `ADR 0073 decision 1` | 0077's `Amends:` |
| 0078 | amends | `ADR 0076 decision 3` | 0078's `Amends:` |
| 0079 | amends | `ADR 0078` | 0079's `Amends:` |

**Not mapped**: 0048's *ADR 0029 rule 1's second sentence … is corrected in place there* — a
correction, which `doc/decisions/README.md` says is not a change of decision.

### `resolves` — R8's measurement, and the maintainer's answers

Measured before the clause was written, with `R3`'s own `ADR_REF`: **seven** questions' `resolved-by`
name an ADR. **One is not a resolution** — Q466's *ANSWERED YES by the maintainer at W115, which
[ADR 0077] consequence 4 left to a person*: 0077 RAISED it. **Four are resolutions whose ADR header
does not name the question on a `Raised by:` line** — Q426 (0072), Q71 (0048), Q444 (0074's
`Answers:`), Q445 (0075's `Answers:`) — and Scope 2 as written would have left them out. **Stopped
and asked; the maintainer answered** (2026-10-05):

1. **Q466 -> ADR 0077 is excused BY ID** in `NOT_A_RESOLUTION`, with its reason; the exception is
   by pair, and a stale or contradicted exception is itself an `R8` failure.
2. **`resolves` is filled from the question side** — where the question's own `resolved-by` names
   the ADR. Six ADRs: 0003 Q4, 0022 Q53 (both also on their `Raised by:` line), 0048 Q71,
   0072 Q426, 0074 Q444, 0075 Q445.

**Not filled, by Scope 2 — the header names the question, and its `resolved-by` names no ADR**
(29 resolved): 0001 Q1, 0002 Q2, 0007 Q31, 0013 Q51, 0014 Q41, 0015 Q42 and Q43, 0023 Q72,
0025 Q24, 0027 Q86, 0030 Q6, 0036 Q12, 0037 Q11, Q36 and Q154, 0040 Q11, Q164 and Q166, 0041 Q8,
0042 Q187, 0044 Q206, 0046 Q19, 0062 Q156 and Q160, 0064 Q15, 0065 Q15 and Q364, 0068 Q391,
0070 Q133 — raised as **Q499**, which the maintainer **DEFERRED** (2026-10-05): `resolved-by` stays as it is, and whether resolved questions are kept at all is a later phase's — one that meets `doc/workflow.md` section 3, `R4`/`R5`, and W118's rewritten links. **Named but OPEN** (not resolutions yet): 0040 Q165, 0058 Q293,
0064 Q21, 0075 Q446; and in Status prose 0051 Q251, 0053 Q278.

### The probes, written to the rule before the first green run

**197 probes** (W116's 81 and 116 new), every one declaring its exact trip set and NOT RUN set;
**133 META** (50 and 83 new), each disabling or NARROWING one clause and naming the probe that must
stop grading as declared. **The first pass-1 run graded all 197 as declared** — 185 caught, 12 clean.

| clause | probes | what they are |
|---|---|---|
| R6 | 68 (1 clean; the two folder probes trip R3 as well) | a stray file; a name of 3 and of 5 digits, with no slug, an upper-case slug, an underscore, a trailing hyphen, a DIRECTORY — each a renumbered copy valid in its id and H1, so only the name refuses it; two files under 0079; seven id near-misses (`ADR 79`, `ADR-0079`, `"0079"`, `adr 0079`, `ADR  0079`, `ADR 00079`, `ADR 0080` in 0079-*.md); EACH of the nine fields deleted; `plan` and `superseded-by` declared; id, title, status and date empty, and a date of one space; eight status near-misses (`Accepted`, `accept`, `acceptedd`, `Proposed`, `propose`, `superseded`, and the question words `resolved`, `open`), `"accepted "`, `"superseded by ADR 0080"`, and `proposed` CLEAN; seven date near-misses (`2026-10-4`, `04-10-2026`, `2026/10/04`, `2026-02-30`, `2026-13-01`, a time, a leading space); eight H1 shapes (a word differs either side, another number, a hyphen, level two, words after, a trailing space, no and two blank lines); the reader's guards on an ADR (a duplicate key, a BOM alone, CRLF alone, an unclosed fence, an unclosed fence ABOVE a thematic break, a plain date, a padded plain status); every ADR deleted; the folder missing |
| R7 | 34 (2 clean) | ten `supersedes` near-misses (`ADR 78`, `ADR-0078`, `0078`, `adr 0078`, a dangling `rule`, an Oxford comma, `section 2`, a comma separator, a bare semicolon, a LINK) and one `amends`; seven `raised-by` near-misses (`P28,Q4`, `p28`, `P028`, prose, a link, a trailing separator, `Q 4`); a plan in `item`, `w116`, a plan in `resolves`; **a second-id-missing cell for every field and every id kind** — `item`, `raised-by` × P, Q, W, S and ADR, `resolves`, `supersedes`, `amends`; `supersedes` and `amends` naming themselves; and two CLEAN controls — every id kind present, every qualifier form |
| R8 | 14 (1 clean) | FORWARD alone (to a resolved and to an OPEN question), its second id, and broken from the question side; REVERSE alone, broken from the ADR side, the second ADR of a list, the hyphenated form, and a PREFIX (`Q1` in `Q4, Q12`); a pairing stated on both sides CLEAN; the exception BY PAIR in both directions; a STALE exception; a CONTRADICTED one |

**Three of W116's probes were re-staged, not re-declared**: each names a REAL ADR in Q1's
`resolved-by`, which `R8` now holds both ways, so each also writes that ADR's `resolves` and stays
`R3`'s alone. `dropBelowFloor` skips every question an ADR's front matter names.

### The fix round — every finding, and what now catches it

The maintainer approved acting on every finding (2026-10-05) and answered the one decision the
readers left open: **a plan id joins `raised-by`**. Each adequacy survivor is a checked-in META entry
naming the probe written for it, so the rule 8 re-run IS the self-test's META pass. Probes are written
to the rule (section 5 rule 8 (a)), with an over-refusal CONTROL beside every guard that widened.

| finding | by | what changed | now caught by |
|---|---|---|---|
| a supersession or amendment declared on the OLDER ADR, and a cycle, accepted | both readers, by construction | `R7`: `supersedes` and `amends` name only an OLDER ADR — a cycle is then impossible | *an OLDER ADR superseding a newer one*, *a CYCLE*, *an OLDER ADR amending a newer one*; META: the clause disabled, and held for `supersedes` alone |
| **found by the fix round's own self-test, EXIT 1, 172/173 META**: with `R7`'s ruled EXISTENCE clause disabled, *`ADR 0078; ADR 9999`* was still caught — by the new DIRECTION clause, since 9999 is newer than 0079. A sibling covering for the clause, rule 7 (c)'s shape, introduced by the fix | the fix round | the two second-missing ruled probes name a missing OLDER ADR — 0005 and 0006, reserved by P1 and never issued | the META entry graded by hand against the mutant (*against-declaration*) and the real check (*caught*) before the re-run |
| **found by the fix round's re-run, EXIT 1, SELF 16/19**: three of the five new harness SELF entries *exited 0: the mutation costs nothing* — each anchor ALSO appears as its own literal in the SELF list, which sits ABOVE the harness in the same file, so `replace` edited the list and the child ran an unharmed suite | the fix round | the five anchor the LAST occurrence (`lastReplace`), with the reason beside them | each of the five run by hand as a SELF child: **all EXIT 1 in ~11 s, each failing the RESTORE CONTROL line it names** |
| Q500 closed against its own `closes-when` — the accepted ceiling written nowhere | conformity, DEFECT 2 | the ceiling is stated in `check-register.mjs`'s header: after W119, an unnamed ADR can be deleted with every check green | — (a sentence; Q500's `closes-when` is met) |
| plan ids on `Plan:` and `Item:` lines, and *under P<n>* in Status, in no field | conformity, NOTE 1 | **the maintainer: they join `raised-by`** — 0039 P11, 0062 P22, 0066 and 0067 P24, 0068 P25, 0074 and 0075 P26. 0070 is *outside any plan*; 0029 stays empty | the round-trip, which derives them independently: 0 differences |
| R8 blind to `adr 0072` and to a cell naming its ADR only by a link | conformity, NOTE 2 | `R8` reads `ADR_REF` in either case, and any link into `decisions/NNNN-` | *REVERSE in LOWER case*, *REVERSE by a LINK alone*, and a CLEAN *the exception still matches when Q466 names ADR 0077 by its LINK alone*; META for each half |
| the timestamp guard over-refused `2026-1-4`, and every clause of a full timestamp was unprovoked | conformity NOTE 3; adequacy, nine survivors | YAML 1.1's TWO shapes: a bare date `YYYY-MM-DD`, a full timestamp with one or two digits | eight plain TIMESTAMP probes, one per clause, and the CLEAN `2026-1-4`; nine META, the readers' edits, and one widening the bare date |
| `R7` permissive: one id twice, an ADR naming itself in `raised-by`, two items | conformity, NOTE 4 | refused, each its own clause | *`Q4, Q4`*, *`P28, P28`*, *`ADR 0078; ADR 0078 rule 1`*, *`P28, ADR 0079`*, *`W116, W117`*; META for each, and a ruled duplicate compared by its whole entry |
| the ADR name admitted a dot, a doubled hyphen, a suffix after `.md` | adequacy | — the pattern was right; the probes were not there | *0094-a.b.md*, *0093-a--b.md*, *0092-x.md.bak*; the readers' three edits |
| an ADR declaring a QUESTION field | adequacy | — | *a QUESTION register field on an ADR — `note`* |
| a month-length table with no leap rule | adequacy | — | *`2026-02-29`* |
| a whitespace-only id field skipped as empty | adequacy | — | *a raised-by of one SPACE* |
| a qualifier taking `or` | adequacy | — | *`ADR 0078 rules 1 or 2`* |
| R8's forward and stale-exception tests as SUBSTRING reads | adequacy | — | *`commit 0003`*, *`commit 0077`* |
| plain values YAML 1.1 TYPES passed as strings: `1:30`, `190:20:30.15`, `0b101`, `+0x1F`, signed octal | adequacy, constructed | `YAML_TYPED` gains the sexagesimal, binary and SIGNED hex and octal forms | five NUMBER probes; META removing or narrowing each |
| `W1:`, a TAB-led comment, `? x` passed as strings | adequacy, constructed | three new reader guards, each its own line | four probes; META for each, and over-refusal CONTROLS `W1:2a` and `?x` with META widening each guard |
| `0026-10-04` refused — `Date.UTC` reads years 0-99 as 1900-1999 | adequacy, constructed | `setUTCFullYear` | a CLEAN *the year 0026*, and META restoring `Date.UTC` |
| **the restore asserted and not proved**: the digest blind to empty directories, to a path/bytes shift, and to `.git` below the root; the assertion deletable for a green suite (H2); a probe's residue leaking into a later verdict (H1) | adequacy, harness | the digest records every DIRECTORY, delimits every entry, and skips only the root `.git`; `assertRestored` is one function | **a RESTORE CONTROL**: four residues, each of which the assertion must SEE and the restore must REMOVE; **five SELF entries** — the assertion made to pass, the digest blind to directories, undelimited, `.git` at every depth, and the restore EMPTYING a directory (H1) |

**Not acted on, each with its reason**: deleting a correction notice from an ADR's BODY passes the
gate (conformity NOTE 5) — holding it is a check over prose, refused 26 times (`doc/workflow.md`'s
ledger), and the round-trip proved this item deleted none; the status word written twice, field and
moved line (NOTE 7) — the line moved verbatim, by decision 1; a rule number that does not exist
(`ADR 0066 rule 99`) — a rule number is a claim about prose; `ADR_NOT_ADRS` read case-insensitively
(adequacy, unproved) — not stageable on NTFS. The declaration's *ADR 0075 carries no Status line*
(NOTE 6) is false — it carries one inside its fenced header — and is left as written, the Record
being where it is corrected.

**Questions raised, and the maintainer's answers of 2026-10-05**:
[Q498](../questions/q498.md) (`item` against `raised-by`) — **resolved, yes**: decision 2 above;
[Q499](../questions/q499.md) (the 29 resolutions no `resolved-by` names) — **deferred** to a phase
that decides whether resolved questions are kept at all; [Q500](../questions/q500.md) (nothing
guards an ADR's deletion once W119 removes `X11`'s second list) — **resolved, no guard**. Q501 and
ADR 0081 are unused.
