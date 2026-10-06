# P29 — Which open questions still matter, and what does each one that does owe a reader?

**Status:** joined 2026-10-06 — W121-W127 done and committed (`a93b767`..`2d94607`), the exit
artifact measured on the final tree and the Record filled; the retro is pending
**Question this plan answers:** *which open questions still matter, and what does each one that does
owe a reader?*
**Exit artifact:** *on the final tree, `npm run check:register` EXITs 0 with `R9` live; `npm run q --
--where status=open --where closes-when=` EXITs 1 and prints `no question matches`; and `npm run q
-- --include-icebox --where "note~P29 W"` lists every question that was open or deferred at
`988ef5f`, each with the batch item that judged it — and that item's file holds the worksheet the
maintainer approved.*
**Reserves:** W121-W130, Q513-Q532, ADR 0082-0084

```
Question: which open questions still matter, and what does each one that does owe a reader?
Items:    W121 (B1: the join, identity/state/failure, documents — the pilot),
          W122 (B2: decisions and data, scale and interop),
          W123-W126 (B3-B6: verification and fixtures, four id bands),
          W127 (R9: an open question has a closes-when; ADR 0082; Q494)
Reserves: W121-W130, Q513-Q532, ADR 0082-0084
Baseline: plans to p28, work items to w120, ADRs to 0081, register to Q511 — `npm run state`
          on `988ef5f`, where the tree and the ledger AGREE on W121 / Q513 / ADR 0082
Declared: 2026-10-05 on `988ef5f`
```

## Why this plan, and why now

P28 made the register cheap to look up, and its Out left triage to the maintainer, after W119.
**The register's live half has grown by accretion and has never been judged.** Measured on
`988ef5f` with `npm run q`:

| | open | `owner` opens `no owner` | `closes-when` empty | both |
|---|---|---|---|---|
| Verification and fixtures | 199 | 190 | 148 | 139 |
| Decisions and data | 42 | 35 | 30 | 24 |
| Scale and interop | 28 | 22 | 23 | 18 |
| Identity, state, failure | 23 | 17 | 21 | 16 |
| The join | 13 | 11 | 11 | 9 |
| Documents and indexes | 2 | 2 | 0 | 0 |
| **all** | **307** | **277** | **233** | **206** |

**Two thirds of what is open is about the PROCESS** (checks, probes, floors), not about the
library. **206 open questions tell a reader neither who will answer them nor what would close them.**
Some are already answered: [Q121](../questions/q121.md) says nothing checks dead relative links,
and `check-markdown`'s `M1` checks them, over `doc/`, `spec/` and `AGENTS.md`, on `988ef5f`. That is a
resolution the batch has to evidence, not one this sentence makes. *A question that is answered and still open costs every
reader who looks it up.*

## Decisions taken before fan-out

**1. Every question open or deferred at `988ef5f` gets exactly one verdict** (stop-and-asks (a) and
(k)). That is the 307 open questions plus Q92. Q499 is the exception and stays as it is (e).

| verdict | status after | required |
|---|---|---|
| **keep** | `open` | a non-empty `closes-when`. `owner` is optional prose (decision 6) |
| **defer** | `deferred` | the reason, in `note` |
| **icebox** | `icebox` | why it is a what-if, in `note` (R2 already requires a `note`) |
| **resolve** | `resolved` | `resolved-by` names an answer that EXISTS in the tree at `988ef5f` (decision 3) |
| **duplicate** | `resolved` | `resolved-by` opens **`duplicate of Q<n>`**, and Q<n> is a question that stays |
| **obsolete** | `resolved` | `resolved-by` opens **`obsolete:`** and names what removed the subject (a commit, item or ADR) |

**No fifth status word** (b). *duplicate* and *obsolete* are `resolved` with a fixed prefix, so
`npm run q -- --where "resolved-by~duplicate of"` finds them. The format, `R2`, the lookup and ADR
0079 decision 2 do not change for them. **Price accepted:** the verdict kind is a prose prefix, and
`R3` does not check a `Q<n>` that `resolved-by` names.

**2. The stamp.** Every judged question's `note` gains `P29 W<n>: <verdict>`, appended after `; `
to whatever `note` already carries and never replacing it. For defer, icebox, duplicate and obsolete
the reason follows the verdict word. **A keep whose other fields do not change is still stamped**
(h). That makes the exit artifact's third command a list of every verdict.

**3. Triage cites; it does not answer** (d). A resolve, duplicate or obsolete verdict cites only
what is in the tree at `988ef5f`. A question whose answer is *"decide now"* is kept, with a
`closes-when` that names the decision. **The batches write no ADR and change nothing under `spec/`
or `src/`.** The only exception is Q494, which this declaration itself answers (decision 6).

**4. A batch is proposed by an agent, checked by a reader, and approved by the maintainer** (c).
Each batch item runs in this order:

1. **Propose.** The item's file gets a worksheet with one row per question: the id, the verdict,
   the evidence and the new field values. The evidence is the `npm run refs` count; whether the
   code, clause, file or rule the question names still exists at `988ef5f`, as a path or a grep
   with its hit count; and any later ADR, plan or item that answered it, by id.
2. **Check.** A fresh-context conformity reader reads the QUESTION first and the worksheet second.
   It re-derives each row from the question and the tree, and it reports without fixing.
3. **Approve.** The maintainer approves the batch, striking or changing rows. **Only approved rows
   are applied.** A struck row becomes a keep with a `closes-when` the maintainer states.
4. **Apply**, then the Record. Before the Record, `git diff --name-status -- doc/questions/` has
   only `M` lines, plus `A` for a question the item raises: **no `D` and no `R`** (decision 8).

**5. The batches run SERIALLY, and R9 comes last** (j). `R8` holds `resolves` and `resolved-by`
both ways, so **a resolution that names an ADR also edits that ADR's front matter.** Two batches
applied concurrently could both edit one ADR file, and section 7 rule 2 forbids that. **W121 is the
pilot**: it calibrates the worksheet's columns, and a change it makes to them is written into W122's
declaration, not retrofitted. W127 is last because `R9` can only be green once every batch has
written its `closes-when`.

**6. `owner` stays optional prose, and `closes-when` is what an open question owes** (i), (l).
`check:register` gains **`R9`: every `status: open` question has a non-empty `closes-when`.** It is
a clause over a field, not over prose, which is the shape the refusal ledger's first row does not
refuse (P28's Record, *what this plan taught* 1). It is not a clause on `owner`: Q494 measured that
field as prose, and a check of *"does not open `no owner`"* would be a check over prose. **ADR 0082
records this and amends ADR 0079 decision 2. [Q494](../questions/q494.md) is resolved by it, at
W127.** `deferred` is not bound by R9, because its reason is in `note`.

**7. Shared questions are held, not answered here alone** (f). Measured: **`shared` is empty in all
393 files.** Q17 and Q19 are already resolved, and Q20 is open. W122 gives Q20 a keep verdict whose
`closes-when` names `fyflow-react-components` Q15, so it is never resolved here alone. W121 fills
`shared` on Q17, Q19 and Q20 — a front-matter edit with no status change. **The sibling's Q14 (our
Q19) is still open there while ours is resolved.** That divergence is raised as a new question from
W121's block. **Nothing is written in the sibling repository.**

**8. [Q493](../questions/q493.md) is Out, and decision 4 step 4 replaces it for this plan** (g).
`R4` already sees an uncommitted deletion. The name-status reading sees a deletion or rename before
it is committed. It is a procedure, and no check changes for it.

## Work items

**Owns** is written for section 7 rule 2. A batch owns the question files of its ids, which are the
questions open or deferred at `988ef5f` (`npm run q -- --where status=open` on that commit). The ADR
front matter it edits under `R8` is `doc/decisions/**`, a record-step file (section 1 rule 5). It is
named here anyway, because it is the joint that makes the batches serial.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W121 | **B1, the pilot**: The join (13, plus Q92), Identity/state/failure (23) and Documents (Q508). 38 verdicts. `shared` on Q17, Q19 and Q20, and the Q19 divergence raised | those 38 `q<N>.md`, `q17.md`, `q19.md`, `q20.md` (the `shared` field only), the item's own question files, and the `resolves` of the ADRs its resolutions name | nothing | reader report; maintainer approval; name-status `M`/`A` only; `check:register`, `check:markdown`, `check:markdown:selftest` EXIT 0 |
| W122 | **B2**: Decisions and data (42), Scale and interop (28, Q20 held). 70 verdicts | those 70 `q<N>.md`, its question files, and its ADRs' `resolves` | W121 | as W121 |
| W123 | **B3**: Verification and fixtures, Q5-Q189. 50 verdicts | those 50 `q<N>.md`, as above | W122 | as W121 |
| W124 | **B4**: Verification and fixtures, Q190-Q325. 50 verdicts | those 50, as above | W123 | as W121 |
| W125 | **B5**: Verification and fixtures, Q326-Q438. 50 verdicts | those 50, as above | W124 | as W121 |
| W126 | **B6**: Verification and fixtures, Q439-Q511. 49 verdicts | those 49, as above | W125 | as W121 |
| W127 | **`R9`**, its self-test probes, ADR 0082, `doc/questions/README.md`'s format and *raising* steps, and Q494 resolved | `scripts/check-register.mjs`, `scripts/check-register-selftest.mjs`, `doc/questions/README.md`, `doc/decisions/0082-*.md`, `q494.md` | W126 | `R9` provoked at birth (section 5 rule 7); `gate:full` EXIT 0 |

The bands are cut by id over the 199 open verification questions on `988ef5f`, at the 50th, 100th
and 150th. **Item files are not declared yet.** Each is written from its row here when its
predecessor's Record is done, so that W121's calibration reaches the others.

## Predictions

| | prediction | what would reverse it |
|---|---|---|
| **1** | **no rung of L0-L6 moves.** The batches edit only front matter under `doc/questions/` and `doc/decisions/`, and W127 edits one check | a test or example that reads a question's `status` or an ADR's `resolves` (grepped at declaration: none outside `scripts/`) |
| **2** | **at least 15% of the 308 judged questions leave `open`** (defer, icebox, resolve, duplicate or obsolete), and Verification and fixtures has the highest share | fewer than 47. Then the register was more current than its shape suggested, and the cost was the stamp |
| **3** | **the conformity reader changes or disputes at least one proposed verdict in every batch** | a batch with zero. Two zeros in a row is evidence that decision 4's reader is not paying for itself |
| **4** | **`check:register` stays green at every batch's Record** | an applied resolution that names an ADR whose `resolves` was not updated (`R8`), or a `resolved-by` naming an id that does not exist (`R3`). Both are caught before the Record, which is where the prediction is measured |
| **5** | **the always-read set does not grow.** `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are not edited | W127 finds that a live instruction other than `doc/questions/README.md` has to name the new requirement |
| **6** | **`scripts/**` grows**, and this is stated rather than discovered: `R9` and its probes go into `check-register*.mjs` and nowhere else | `lookup.mjs` or `state.mjs` also having to change, for example if `lookup:selftest`'s AGREE has to learn `R9` |
| **7** | **this declaration does not cross `M3` or `M5`**: it is one document and no item file | `check:markdown:selftest` RED on the declaration tree. P28's six documents crossed `M3`; this is one |

## Stop-and-asks

| | the question | answer |
|---|---|---|
| **(a)** | ~~Which open questions still matter, what an open question owes, or both?~~ | **ANSWERED by the maintainer, 2026-10-05: both, as one judgement.** Every open question gets one verdict, and a keep owes a reader a closing condition (decision 1) |
| **(b)** | ~~*duplicate* and *obsolete*: map onto `resolved`, or a fifth status word?~~ | **ANSWERED, 2026-10-05: map onto `resolved`** with a fixed `resolved-by` prefix. There is no format, `R2`, lookup or ADR 0079 change for them (decision 1) |
| **(c)** | ~~Who decides, and how is a proposal checked?~~ | **ANSWERED, 2026-10-05: an agent proposes with evidence, a fresh-context conformity reader re-derives each row, and the maintainer approves per batch** (decision 4) |
| **(d)** | ~~Is answering a question in scope?~~ | **ANSWERED, 2026-10-05: no.** A resolution cites only what exists at the baseline. *"Decide now"* is a keep with a `closes-when` naming the decision (decision 3) |
| **(e)** | ~~Is Q499 this plan?~~ | **ANSWERED, 2026-10-05: Out, and Q499 stays deferred.** It is about resolved questions, and deleting them meets section 3, `R4`/`R5` and W118's links. New resolutions follow `R8` anyway (decision 5) |
| **(f)** | ~~Shared questions: triaged here alone, or held?~~ | **ANSWERED, 2026-10-05: held.** The twins are named in `shared`, and the Q19/Q14 divergence is raised (decision 7) |
| **(g)** | ~~Does this plan guard its own edits against Q493?~~ | **ANSWERED, 2026-10-05: Out, with a procedure** — name-status `M`/`A` only, before each Record (decision 8) |
| **(h)** | ~~The exit artifact~~ | **ANSWERED, 2026-10-05: the tool output plus a `note` stamp** on every judged question, and the approved worksheet in each item's file (decision 2, and the header) |
| **(i)** | ~~Does a check change?~~ | **ANSWERED, 2026-10-05: yes — `R9`, *an open question has a non-empty `closes-when`*.** `owner` stays optional prose. ADR 0082 at W127 (decision 6) |
| **(j)** | ~~How are the batches cut and run?~~ | **ANSWERED, 2026-10-05: six serial items, W121 the pilot, then `R9` last** (decision 5) |
| **(k)** | ~~Are the two deferred questions in scope?~~ | **ANSWERED, 2026-10-05: yes for Q92**, which joins B1 by its cluster. Q499 stays out by (e) |
| **(l)** | ~~Does (i) resolve Q494?~~ | **ANSWERED, 2026-10-05: yes, at W127, by ADR 0082.** It is the one exception to decision 3, because this declaration is the decision |
| **(m)** | ~~`npm run state` has EXITed 1 since W123 (its `open` floor of 200), and `check:register:selftest` is RED since W121 (META: `MAX_CORPUS = 0` against 148+ iceboxed questions) and on fixtures anchored on live questions (Q488, Q490). Whose are the fixes?~~ | **ANSWERED by the maintainer, 2026-10-06: W127's.** *"W127 owns it"*: `scripts/state.mjs` joins W127's Owns, and **prediction 6 is reversed** by its own condition. *"Apply now, W127 fixes"*: W126 applies Q488's verdict, and W127 re-points every self-test fixture anchored on a live question, so `scripts/check-markdown-selftest.mjs` joins its Owns for those anchors only |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| — | *none raised at declaration. The Q19 divergence is W121's to raise, from its reserved block* | |

## Out

- **Answering questions.** No ADR is written by a batch, and nothing under `spec/`, `src/`,
  `examples/` or `test/` changes (decision 3).
- **[Q499](../questions/q499.md)** and the question of whether resolved questions are kept at all.
  So are the 84 resolved questions, apart from `shared` on Q17 and Q19.
- **[Q493](../questions/q493.md)** (decision 8) and every other check change except `R9`.
- **A fifth status word**, and any change to the lookup.
- **Retitling a question or writing a body.** A title stays the migrated cell, verbatim, as in P28.
- **The sibling repository.** Its twins are named here and never edited.
- **`CLAUDE.md` and `doc/workflow.md`.** P29 edits neither, and prediction 5 says so.

## Record

*Filled in at the join, 2026-10-06, on `2d94607` with the tree still and nothing uncommitted but
this file.* Scratch `dev-dist/p29j-58365/` (the join shell's pid): every log and script named below.
Node v24.20.0 by `fnm use 24` in every shell; every command redirected, its EXIT read in the same
command. Ids in this Record are bare text, deliberately: Q142's `M4` floor (W123's Record).

**Exit artifact** — measured on the final tree.

| command | EXIT | output | reading |
|---|---|---|---|
| `npm run check:register` | **0** | `reg.log`, 1326 B, 21 lines | R1-R9 `ok`; 394 question files; R8 compared 28 pairings and excused 1 by id (Q466 -> ADR 0077) |
| `npm run q -- --where status=open --where closes-when=` | **1** | `r9.log`, 312 B, 6 lines | `# no question matches --where status=open --where closes-when=` |
| `npm run q -- --include-icebox --where "note~P29 W"` | **0** | `stamps.log`, 45517 B, 313 lines | **308 questions** (`--count`: 308) |
| `npm run state` | **0** | `state.log`, 3063 B, 52 lines | open 22, deferred 65, iceboxed 182, resolved 125; *all 24 derivations non-empty*. The id ledger DISAGREES (tree W128 / Q514 / ADR 0083, ledger W121 / Q513 / ADR 0082) because no sentence has spent P29's block yet: the retro's |

**The third command, checked by script** (`cmp.mjs`, EXIT 0, `cmp.log`) against the set open or
deferred at `988ef5f`, taken by the lookup in a `git archive` copy of that commit (`base/`; `find
-type l` empty before and after): **307 open plus 2 deferred (Q92, Q499) = 309.** The 308 stamped
questions are exactly that set **minus Q499** (decision 1(e)), with no stamped question outside it.
Accounted by id:

- **Q499** — not stamped, still `deferred`, by stop-and-ask (e).
- **Q494** — open at `988ef5f` and outside the six batches' 307 (38 + 70 + 50 + 50 + 50 + 49): stamped
  `P29 W127: resolve — ADR 0082`. W127 has no worksheet table; its approved row is its declaration's
  Scope step 8 and this plan's stop-and-ask (l). It is the one stamp with no *Final approved
  verdicts* row.
- **Q386** — stamped twice, `P29 W121: defer` and `P29 W122: re-stamped` (the maintainer's *"Own
  trigger"*). The re-stamp carries no verdict word, so Q386 has one verdict.
- **Q513** — raised by W121, `open`, not stamped: it was not open at `988ef5f`, and R9 binds it.

**Every other stamp has its row**: each of W121-W126's *Final approved verdicts* table was found,
with 38, 70, 50, 50, 50 and 49 rows, none twice, and every one of the 307 stamps names an item whose
table holds that id **with the same verdict** (0 mismatches), and no table row lacks its stamp. Every
question's last verdict agrees with its status (keep `open`, defer `deferred`, icebox `icebox`, the
other three `resolved`): 0 mismatches. **One gap in the artifact as worded**: the third command's
default columns are id, status and title, so the batch item it is said to list is visible only with
`--fields id,status,note` (`stamps-note.log`); the stamp is in `note`.

**What the plan answered.** *Which open questions still matter*: **21 of the 308 judged** — every one
now `open` with a `closes-when` that names what would answer it. The rest left `open`:

| item | keep | defer | icebox | resolve | duplicate | obsolete | judged |
|---|---|---|---|---|---|---|---|
| W121 | 4 | 23 | 5 | 4 | 2 | 0 | 38 |
| W122 | 3 | 25 | 28 | 12 | 2 | 0 | 70 |
| W123 | 2 | 6 | 37 | 5 | 0 | 0 | 50 |
| W124 | 3 | 2 | 38 | 4 | 0 | 3 | 50 |
| W125 | 5 | 1 | 40 | 3 | 0 | 1 | 50 |
| W126 | 4 | 7 | 34 | 1 | 3 | 0 | 49 |
| W127 | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| **all** | **21** | **64** | **182** | **30** | **7** | **4** | **308** |

Counted from the stamps by `cmp.mjs` and equal, row by row, to each item's own Record. The register
on the final tree: open 22 (the 21 and Q513), deferred 65 (the 64 and Q499), icebox 182, resolved 125
(the 84 resolved at `988ef5f` and the 41 resolve, duplicate and obsolete verdicts).

*What an open question now owes a reader*: **a non-empty `closes-when` that is a CLOSING condition**,
an event or decision that answers it, never a trigger that would reopen it. **R9** in
`check:register` holds it, ADR 0082 records it and amends ADR 0079 decision 2, and
`doc/questions/README.md`'s format and *raising* step 2 say it. `owner` stays optional prose and is
not checked (Q494, resolved by ADR 0082). A `deferred` question owes its reason in `note` and is not
bound by R9; an `icebox` owes why it is a what-if, in `note` (R2).

**Predictions.**

| | verdict | measurement |
|---|---|---|
| **1** | **HELD** | `git diff 988ef5f..2d94607` touches nothing under `spec/`, `src/`, `test/`, `examples/`, `index.ts` or `package.json`; W127's `gate:full` EXIT 0 (2580 s) on the tree committed as `2d94607`. The join did not run `gate` |
| **2** | **HELD on its threshold, FAILED on its ranking** | **287 of 308 (93.2%) left `open`** against the 47 (15%) needed: defer 64, icebox 182, resolve 30, duplicate 7, obsolete 4 (`pred2.mjs`, EXIT 0). By cluster at `988ef5f`: The join 14/14 and Decisions and data 42/42 (100%), **Verification and fixtures 185/199 (93.0%)**, Scale and interop 25/28 (89.3%), Identity, state, failure 20/23 (87.0%), Documents and indexes 1/2. Verification and fixtures is **third, and below the other clusters together, 102/109 (93.6%)**. The stated reversal (fewer than 47) did not occur |
| **3** | **HELD** | reader disputes + changes per batch: W121 3 + 2, W122 3 + 1, W123 6 + 1, W124 4 + 0, W125 **1** + 0, W126 4 + 0. No zero; W125's one is the nearest to the reversal |
| **4** | **HELD** | `check:register` EXIT 0 at every Record (W121-W126's apply logs, W127's lanes) and at this join; R8 pairings 16, 24, 24, 24, 26, 26, 28. **It is the CHECK that held — its self-test was red from W121 to W127's BUILD** (below) |
| **5** | **HELD** | `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are not in the plan's diff; `doc/questions/README.md` was the one live instruction R9 needed (W127) |
| **6** | **REVERSED**, by its own condition | stop-and-ask (m): `scripts/state.mjs` changed at W127, and `scripts/check-markdown-selftest.mjs` for its fixture anchors. `lookup.mjs` and `lookup:selftest` did not |
| **7** | **HELD** | `check:markdown:selftest` on a `git archive` of the declaration tree `a93b767`: EXIT 0 in 258 s, 42/42 caught, 41/41 noticed, 7/7 bounded (`decl-mds.log`) |

**Ids.** **Issued**: W121, W122, W123, W124, W125, W126, W127; Q513 (W121); ADR 0082 (W127).
**SPENT, never issued**: W128, W129, W130; Q514-Q516 (W121), Q517-Q520 (W122), Q521-Q523 (W123),
Q524-Q526 (W124), Q527-Q529 (W125), Q530-Q531 (W126), Q532 (W127); ADR 0083, ADR 0084. None exists
in the tree. *The ledger sentence `npm run state` reads is the retro's to write, and it names W131,
Q533 and ADR 0085.*

**Deviations and findings, for the retro.**

1. **The maintainer added a per-keep round after W121's approval** (ledger, 2026-10-06: *"more
   aggressive in iceboxing and deferring ... send round of stop and ask for each question that you
   deem to remain open"*). Every batch ran one, after APPROVE and before apply: W121 13 rows -> 4
   kept, W122 3 -> 3, W123 2 -> 1 (and Q144 kept directly at approval), W124 3 -> 3, W125 6 -> 5
   (Q420 to icebox), W126 5 -> 4 (Q460 to icebox). **W121's terse one-line briefing was rejected**,
   and from W121's round on each was a plain-language briefing (rule ids expanded, a concrete example,
   the question's context; bundles marked from W126), under `dev-dist/w121k-34877/` through
   `dev-dist/w126k-55226/`. Every answer followed its recommendation but one: **Q283 at W124, kept
   against a defer recommendation.** Not in decision 4, which has three steps and no
   round.
2. **The coordinator's 26/1 slip at W122**: the approval question showed *defer 26, duplicate 1*
   against a table of 25 and 2. The rows approved were the reader's four, so nothing wrong was
   applied; calibration 11 has the coordinator count the question from the table.
3. **Two band labels in the index row are range bounds, not first ids**: *Q5-Q189*'s first
   Verification question is **Q44** (Q5 is The join, W121's), and *Q190-Q325*'s is **Q191** (Q190 is
   Decisions and data, W122's). Each bound selects exactly 50, so W123 and W124 declared the true
   first ids and the plan was not edited. B5's and B6's labels were exact.
4. **The `M4` floor and Q142**: W123's file was the 120th linking document in
   `check-markdown-selftest`'s second `removes` probe tree, which reached `M4`'s floor and took the
   self-test to 41/42 with `check:markdown` green. W123-W127 and this Record are link-free. That is
   Q142's mechanism, **kept**, so no question was raised for it (Q521 unissued).
5. **Self-test fixtures anchored on live questions, and the register self-test red from W121 to
   W127 unnoticed by any batch.** `check:register:selftest` was green at `988ef5f` and went red at
   `81ed979` (W121: META, the *icebox removed* mutant fails on a tree with iceboxed questions and
   `MAX_CORPUS = 0` forbade it), again at `9ad2345` (W123: STATE, below), and W126's Q488 duplicate
   moved a fixture its probes anchor on (`status: open`, `note: ""`); Q490 and the resolved Q1, Q4,
   Q466 were anchors too. **No batch gate ran it**: prediction 1 said no rung moves, so the batches
   declared neither `gate` nor `gate:full`, and the self-test is only on `gate:full`. W126's proposer
   found the hazard and the coordinator's run on the post-W125 tree the red (diagnosis
   `dev-dist/p29x-54441/`). W127 fixed it by stop-and-ask (m): a by-id `CORPUS_ALLOWED`, synthetic
   fixtures above Q8000, and a guard that aborts a probe writing a register question. *A followed
   gate, declared to the rule, that could not see what its item broke.*
6. **`state.mjs`'s `open` floor**: `open >= 200` (line ~335 at `1b8b819`), under a comment that
   *these quantities only grow*, true of files and false of a status. `npm run state` EXITed 1 from
   W123 (open 68 then) to W127, which removed the floor and replaced a tautological reverse row with a
   live count read by a second route.
7. **Q103 had no worksheet row at W121, and the reader missed it too**; it reached a verdict
   (icebox) only through the keeps round. Both tallies were also off by one. From W122 the row count
   is checked against the lookup's id list by script, which found no other gap.
8. **W123's reader overturned 5 of its 10 proposed resolves** (Q45, Q151, Q152, Q153, Q176, all to
   icebox), and the one duplicate. Resolves overturned by batch: W122 1 of 11 (Q387), W123 5 of 10,
   W124 1 of 5, W125 0 of 3, W126 1 of 2. *Resolves are where a proposer overreaches* (calibrations
   12-17).
9. **An API outage interrupted W124's propose phase**; it resumed, and the worksheet was counted by
   script against the 50 ids, with none missing, extra or twice.
10. **Keeps that are cheap fixes outside P29**, each with its `closes-when` naming the commit:
    Q235 (`.gitignore` gains `.claude/worktrees/`, one line); Q272 (`test/runner.ts` reports an
    unimportable suite as one named failure); Q382 (`test/definition/gate.test.ts` names its cases at
    the call site); **Q430, Q439 and Q454, one commit to `scripts/check-docs-selftest.mjs`**; **Q434
    and Q437, one commit** (self-test harness controls); Q484 (`doc/README.md`'s derived counts, whose
    commit also closes its duplicate Q488); Q490 (one META entry in `check-budget-selftest.mjs`).
    Q144's one-line fix at `scripts/check-policies.mjs:187` is the same kind. Also outside P29: the
    stale docblock at `examples/l6.ts:9484-9505` naming obsolete Q216 (W124's Record).
11. **Q465 is the one `icebox` with a non-empty `closes-when`** (W126's Record): applied as the
    approved *unchanged*, which the row described as empty. R9 does not bind icebox.
12. **W127's two readers shared 2 subjects** (the live relation, U+200B), inside section 6's 0-4
    band; W127's Record carries it, and the ordinal is the retro's to carry.

**Retro.**
