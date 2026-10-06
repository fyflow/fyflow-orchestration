# W123 — B3: a verdict for each of the first 50 open questions in the verification-and-fixtures cluster, Q44-Q189

**Status:** todo — declared 2026-10-06; no row proposed, and no question's status, owner or note has changed
**Plan:** P29, `doc/plans/p29-which-open-questions-still-matter.md`

*This file carries NO relative link, deliberately.* At declaration it was the 120th document to carry
one in `check-markdown`'s second `removes` probe tree (`doc/decisions` and `doc/plans` cut), which
lifted that tree to `M4`'s floor of 120: the probe reported `wanted [M1,M3,M4,M5], got [M1,M3,M5]`
and `check:markdown:selftest` exited 1 at 41/42, while `check:markdown` stayed green. With the file
link-free the self-test is 42/42. *The next linking document outside those two directories crosses
the floor again; that is a retune of `scripts/check-markdown.mjs`, outside this item
(`doc/work-items/TEMPLATE.md` names the same mechanism for `M6`).*

```
Spec:       none — P29 decisions 1-5, and doc/questions/README.md's format
Owns:       the 50 question files listed below; this item's own question files, q521.md-q523.md;
            and the `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit; the calibration of W121 and W122 (below)
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the keeps round: one stop-and-ask per row still `keep` after (3), each with a
                recommendation and a plain-language briefing, and the maintainer's answer
            (5) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (6) the calibration this batch adds, recorded in this item's Record for the
                coordinator to hand to W124's declaration
Depends on: W122
Blocks:     W124
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; the keeps round answered; `git diff --name-status
            -- doc/questions/` M/A only; check:register, check:markdown, check:markdown:selftest
            EXIT 0; the stamp count, `npm run q -- --include-icebox --where "note~P29 W123"
            --count`, equals 50 plus every re-stamp declared under Exceptions (none at declaration)
Reserves:   Q521-Q523 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W123
```

Q521-Q523 are spare at declaration; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W123 never edits W121's, W122's
or W124's file. **A re-stamp of an earlier batch's question** (calibration 10) is added here, with
the maintainer's answer that causes it, before it is applied, and the gate's stamp count gains one
for each.

## The item's ids, from the lookup at `988ef5f`

**50 questions**: the open questions in *Verification and fixtures*, sorted by id, the first 50 of
the 199 (P29: the bands are cut at the 50th, 100th and 150th). The cluster holds no deferred question
at `988ef5f` (the two deferred are Q92, W121's, and Q499, Out).

**P29's index row labels this band "Q5-Q189". Q5 is a range BOUND, not the band's first id**: Q5 is
open at `988ef5f` but in *The join* (W121's), no *Verification and fixtures* question of any status
has an id below Q44, and filtering the open cluster to ids in Q5..Q189 selects exactly these 50. The
plan is not edited; the join records the label (the coordinator's ruling, 2026-10-06).

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`:
`scripts/lookup.mjs` imports only `node:` modules, so the copy needs none.

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w123d-38612
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --count       # 199, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --fields id   # 199 ids, EXIT 0
# sorted numerically: the 50th is Q189, the 51st Q191; the 100th Q325, the 150th Q438, the 199th Q511
node scripts/lookup.mjs q Q5 --fields id,status,cluster,title                            # open, The join, EXIT 0
cd .. && find base -type l | wc -l                                                       # 0
# and gci -Recurse -Force -Attributes ReparsePoint over base: 0; then the copy was removed
```

| cluster | ids | n |
|---|---|---|
| Verification and fixtures, first 50 | Q44, Q45, Q98, Q99, Q100, Q101, Q102, Q104, Q111, Q112, Q121, Q122, Q123, Q124, Q127, Q132, Q134, Q136, Q137, Q138, Q142, Q143, Q144, Q145, Q146, Q147, Q150, Q151, Q152, Q153, Q155, Q157, Q162, Q170, Q172, Q173, Q174, Q175, Q176, Q177, Q178, Q179, Q180, Q181, Q182, Q183, Q184, Q185, Q188, Q189 | 50 |

**The 50 owned files**, under `doc/questions/`: `q44.md`, `q45.md`, `q98.md`, `q99.md`, `q100.md`,
`q101.md`, `q102.md`, `q104.md`, `q111.md`, `q112.md`, `q121.md`, `q122.md`, `q123.md`, `q124.md`,
`q127.md`, `q132.md`, `q134.md`, `q136.md`, `q137.md`, `q138.md`, `q142.md`, `q143.md`, `q144.md`,
`q145.md`, `q146.md`, `q147.md`, `q150.md`, `q151.md`, `q152.md`, `q153.md`, `q155.md`, `q157.md`,
`q162.md`, `q170.md`, `q172.md`, `q173.md`, `q174.md`, `q175.md`, `q176.md`, `q177.md`, `q178.md`,
`q179.md`, `q180.md`, `q181.md`, `q182.md`, `q183.md`, `q184.md`, `q185.md`, `q188.md`, `q189.md`.

## Dependencies

- **A duplicate's target** stays in this batch or an earlier one (calibration 4). W124-W126 hold the
  other 149 *Verification and fixtures* questions, so a duplicate of any of them is not available
  here; such a row is a defer or a keep naming the later question in `note`.
- **A question of an earlier batch whose stamp names a question in this band** is not in `Owns`. If
  an approved verdict here fires or empties its trigger, the Record says so and the coordinator
  decides; a re-stamp is declared under Exceptions first (calibration 10).

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W123: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. A question raised from Q521-Q523, as `doc/questions/README.md` says to raise one, only if the
   batch finds one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/`,
  `test/` or `scripts/` changes; a question whose answer is *decide now* is a keep with a
  `closes-when` naming the decision (decision 3). **A process question asking for a check that does
  not exist is not answered by building it here.**
- **Every question outside the 50**, including Q190-Q511's verification questions (W124-W126).
- **Q494** (W127) and **Q499** (stays deferred).
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **P29's index-row label** "Q5-Q189" (and B4's "Q190-Q325"): recorded at the join, not edited here.
- **The sibling repository.** Nothing is written there.

## Calibration

**From W121's pilot and W122's run** (P29 decision 5: written into this declaration, not
retrofitted). Each clause binds the proposer, the reader and the apply unit.

1. **A keep's `closes-when` is a CLOSING condition**: an event or decision that would ANSWER the
   question. A *"reopen if X"* trigger is not one. A row whose only condition is such a trigger is a
   **defer**, with X in `note` and `closes-when` cleared. *W121: Q241, Q354, Q357 and Q249.*
2. **Be aggressive** — the maintainer's words: *"more aggressive in iceboxing and deferring"*. Prefer
   **icebox** (a what-if with no consumer) or **defer** (waiting on a named thing) over keep. **Keep
   only when the decision is nameable and someone will plausibly make it soon.**
3. **The keeps round.** After the approval, every row still `keep` goes to the maintainer in a
   per-question stop-and-ask (keep / defer / icebox / resolve), **with a recommendation first**. It
   comes with a **PLAIN-LANGUAGE BRIEFING**: every rule or clause id expanded into what it says, a
   concrete example, and what each verdict would mean in practice. **Terse one-liners were rejected
   at W121.** *W121: 13 rows went to the round and 4 stayed keep; W122: 3 and 3.*
4. **A duplicate points at a question that stays** (not resolved) **in its own batch or an earlier
   one, never at a later batch's question** (here: never at W124-W126's). *W121: Q386 → Q9 crossed
   into W122 and became a defer.*
5. **The decision-text test.** If the deciding ADR, spec or plan text still calls the matter pending
   (*"for now"*, *"is Q<n>"*, *"stays open"*), the row is keep or defer. If the text decides or refuses
   by name with a permanent reason, it is resolve. *W121: Q30 and Q28 pend and were deferred; Q38's
   P23 decision 10 refuses by name and was resolved.*
6. **The row-count check.** The proposer and the reader each confirm that **worksheet rows == the
   id count (50)**, with no missing and no extra id, and that **their tallies are counted from their
   tables**, not carried. *W121's proposer omitted Q103's row and the reader did not notice.*
7. **Check the LAST text that speaks to the question.** The decision-text test produced all four of
   W122's reader changes, in both directions: a later plan's Record may say *"stays open"* after an
   ADR that looks decisive (Q387, resolve → icebox), or may decide by name what a worksheet deferred
   (Q87, defer → resolve). Search the plans, items and ADRs after the one first found.
8. **A `resolved-by` that names an ADR requires that ADR's `resolves` to list the question (R8,
   which reads `resolved-by` whatever the verdict).** If the ADR does not decide the question, the
   ADR is cited in `note`, not in `resolved-by`. *W122: Q87 names P5 and W89, with ADR 0023 in
   `note`.*
9. **Every row states `closes-when` explicitly**: the new value, *unchanged*, or *cleared*. **A
   resolved, deferred or iceboxed question carries no reopening trigger in `closes-when`; the trigger
   goes in `note`.** *W122: Q190 and Q201 were applied `resolved` with their old triggers still in
   `closes-when`, and were cleared after the gate.*
10. **A re-stamp of an earlier batch's question adds to the stamp count**, because it carries the
    same `P29 W123` prefix. It is declared in the gate and the Exceptions before it is applied.
    *W122: Q386, 70 + 1 = 71.*
11. **The approval's figures are counted from the table by script**, the question put to the
    maintainer included. *W122: a coordinator's hand count (defer 26, duplicate 1) reached the
    maintainer; the rows approved were right and the figures were not.*

**This band (B3).** These are **PROCESS questions** — about checks, probes, floors, self-tests,
harnesses and the method — not about the library. For each row the evidence states:

- **whether the check, clause, probe or script the question names still exists at `988ef5f`**, as a
  path (`scripts/<name>.mjs`) or a grep with its pattern and hit count (`git grep -c -F "fail('M1'"
  988ef5f -- scripts/check-markdown.mjs`, 1 at declaration); a clause id is grepped where it is DEFINED, not where it is cited;
- **whether a later item built it**, by W id, read from that item's file or Record.

**A question asking for a check that now exists is a resolve candidate**, and its `resolved-by`
cites the clause id and its script (for example *`M1` in `scripts/check-markdown.mjs`* for
Q121 (`doc/questions/q121.md`), which P29's own *Why* names) — after the decision-text test, since a
check may exist and still leave the question's other half open. **A question whose subject was
removed** (a check, script or harness deleted, a rule cut by W115) is an **obsolete** candidate, and
`resolved-by` names what removed it. **A process wish nobody has picked up across several plans is
an icebox candidate**; the evidence says which plans passed it by. **Refusal-ledger proposals**
(`doc/workflow.md`'s ledger: a check over `doc/`, `check-owns.mjs`, and the rest) are not re-argued:
a question that is one of them is resolved or iceboxed citing the ledger row, never kept.

## The phases

P29 decision 4, with the keeps round the calibration adds. A phase does not start before the one
above it is complete.

1. **Propose.** Fill the worksheet: one row per question, 50 rows. The evidence is (a) the
   `npm run refs` count at `988ef5f`; (b) whether the check, clause, file or rule the question names
   still exists at `988ef5f`, as a path, or as a grep with its hit count and the exact pattern; (c)
   any later ADR, plan or item that answered or built it, by id. Every row states `closes-when`
   (calibration 9). Rows count against the id list (calibration 6).
2. **Check.** A fresh-context conformity reader reads each QUESTION first and the worksheet second,
   re-derives each row from the question and the tree, and reports AGREE, DISPUTE or CHANGE per row
   with its reason. It confirms the row count and counts its own tally from its table. It does not fix.
3. **Approve.** The maintainer approves, striking or changing rows; the figures in the question are
   counted by script (calibration 11). **Only approved rows are applied.** A struck row becomes a
   keep with a `closes-when` the maintainer states.
4. **Keeps round.** Every row still `keep` goes to the maintainer one by one, with a recommendation
   first and the plain-language briefing calibration 3 requires. **Nothing is applied before each is
   answered.**
5. **Apply.** The approved rows' fields and the ADRs' `resolves`, by a script that re-tallies the
   final table before writing and refuses any other figure.
6. **Record.** After the gate below, with the tree still.

### Worksheet

*Filled in at phase 1.* The evidence cell holds three parts: **refs** (the count), **subject** (path,
or grep pattern and hit count, at `988ef5f`), **answered by** (ADR, P or W id, or none). The last
cell states `closes-when` in every row. **50 rows.**

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 50.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row, with the figures counted
from the table by script.*

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, and the maintainer's answer.*

| | the question, the briefing and the recommendation | answer |
|---|---|---|

#### Final approved verdicts

*Filled in after phase 4, counted from this table by script.*

| id | final | from | fields applied |
|---|---|---|---|

## Verification

The gate's clauses, each run redirected with its exit code read in the same command:

| clause | how |
|---|---|
| reader report | the Reader's findings table, one row per worksheet row, 50 |
| maintainer approval | the Approval section |
| keeps round | the Keeps round section, one answered row per keep |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for a question raised from `q521.md`-`q523.md` (made visible with `git add -N`); no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W123" --count > n.log 2>&1; echo EXIT=$?` — **50**, plus one for each re-stamp declared under Exceptions. `--include-icebox` is required: without it the lookup hides every icebox verdict |
| `git diff --name-only` against Owns | by hand, before the Record (`doc/workflow.md` section 7 rule 2) |
| own-id and withdrawn-claim grep | `W123` and any withdrawn figure, excluding `dev-dist/` (section 1 rule 5) |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in when the item is done.*
