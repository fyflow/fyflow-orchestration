# P29 — Which open questions still matter, and what does each one that does owe a reader?

**Status:** planning — declared 2026-10-05; no item started, and no question's status, owner or
note has changed
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

*Filled in at the join.*

**Exit artifact.**

**What the plan answered.**

**Retro.**
