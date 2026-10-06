# W126 — B6: a verdict for each of the last 49 open questions in the verification-and-fixtures cluster, Q439-Q511

**Status:** todo — declared 2026-10-06 on W125's Record; no question's status, owner or note has changed
**Plan:** P29, `doc/plans/p29-which-open-questions-still-matter.md`

*This file carries NO relative link, deliberately* (calibration 16). W123 was the 120th linking
document in `check-markdown`'s second `removes` probe tree (`doc/decisions` and `doc/plans` cut),
which is `M4`'s floor of 120, so a linking document here crosses it: the probe would report
`wanted [M1,M3,M4,M5], got [M1,M3,M5]` and `check:markdown:selftest` would exit 1 while
`check:markdown` stays green. That is Q142's mechanism (kept at W123), and retuning
`scripts/check-markdown.mjs` is outside this item. Ids and paths are written as bare text.

```
Spec:       none — P29 decisions 1-5, and doc/questions/README.md's format
Owns:       the 49 question files listed below; this item's own question files, q530.md-q531.md;
            and the `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit; the calibration of W121-W125 (below)
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the keeps round: one stop-and-ask per row still `keep` after (3), each with a
                recommendation and a plain-language briefing, and the maintainer's answer
            (5) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (6) the calibration this batch adds, recorded in this item's Record for the
                coordinator to hand to W127's declaration
Depends on: W125
Blocks:     W127
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; the keeps round answered; `git diff --name-status
            -- doc/questions/` M/A only; check:register, check:markdown, check:markdown:selftest
            EXIT 0; the stamp count, `npm run q -- --include-icebox --where "note~P29 W126"
            --count`, equals 49 plus every re-stamp declared under Exceptions (none at declaration)
Reserves:   Q530-Q531 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W126
```

Q530-Q531 are spare at declaration; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W126 never edits W121's, W122's,
W123's, W124's, W125's or W127's file. **A re-stamp of an earlier batch's question** (calibration 10)
is added here, with the maintainer's answer that causes it, before it is applied, and the gate's stamp
count gains one for each.

## The item's ids, from the lookup at `988ef5f`

**49 questions**: the open questions in *Verification and fixtures*, sorted by id, positions 151-199
of the 199 (P29: the bands are cut at the 50th, 100th and 150th, and this is the remainder). The
cluster holds no deferred question at `988ef5f`.

**P29's index row labels this band "Q439-Q511", and the label is a range bound that is exact at both
ends**: Q439 is position 151 and Q511 position 199, both open in this cluster. Filtering the open
cluster to ids in Q439..Q511 selects exactly these 49. The band is disjoint from W123's, W124's and
W125's by bound, and a comparison against the worksheet id column of each of W121-W125's files found
0 shared ids.

**Q499 and Q494 stay out of this batch, even where a question here cites them.** Q499 is deferred
and is P29's Out (stop-and-ask (e)): it is not judged, not stamped and not a duplicate target here,
and is cited in `note` at most. Q494 is in *Documents and indexes*, not this cluster, and is W127's,
resolved there by ADR 0082 (decision 6): it is not judged or stamped here, and since it will not stay
open it is not a duplicate target either (calibration 4).

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`
(`scripts/lookup.mjs` imports only `node:` modules):

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w126d-51498
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --count       # 199, EXIT 0
node scripts/lookup.mjs q --where status=deferred --where "cluster=Verification and fixtures" --count   # no question matches, EXIT 1
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --fields id   # 199 ids, EXIT 0
# by $S/band.mjs, EXIT 0: sorted numerically, the 150th is Q438, the 151st Q439, the 199th Q511;
# positions 151-199: 49 ids, all within Q439-Q511; ids in 439..511: 49; Q494 and Q499 absent;
# shared with the worksheet id column of W121's, W122's, W123's, W124's or W125's file: 0
cd .. && find base -type l | wc -l                                                       # 0
# and gci -Recurse -Force -Attributes ReparsePoint over base: 0; then the copy was removed (EXIT 0)
```

| cluster | ids | n |
|---|---|---|
| Verification and fixtures, positions 151-199 | Q439, Q440, Q441, Q442, Q443, Q446, Q448, Q449, Q450, Q451, Q452, Q453, Q454, Q458, Q460, Q461, Q462, Q463, Q464, Q465, Q467, Q468, Q469, Q470, Q471, Q472, Q473, Q474, Q475, Q476, Q477, Q478, Q479, Q480, Q482, Q483, Q484, Q485, Q486, Q487, Q488, Q489, Q490, Q491, Q492, Q493, Q509, Q510, Q511 | 49 |

**The 49 owned files**, under `doc/questions/`: `q439.md`, `q440.md`, `q441.md`, `q442.md`,
`q443.md`, `q446.md`, `q448.md`, `q449.md`, `q450.md`, `q451.md`, `q452.md`, `q453.md`, `q454.md`,
`q458.md`, `q460.md`, `q461.md`, `q462.md`, `q463.md`, `q464.md`, `q465.md`, `q467.md`, `q468.md`,
`q469.md`, `q470.md`, `q471.md`, `q472.md`, `q473.md`, `q474.md`, `q475.md`, `q476.md`, `q477.md`,
`q478.md`, `q479.md`, `q480.md`, `q482.md`, `q483.md`, `q484.md`, `q485.md`, `q486.md`, `q487.md`,
`q488.md`, `q489.md`, `q490.md`, `q491.md`, `q492.md`, `q493.md`, `q509.md`, `q510.md`, `q511.md`.
None of the 49 has changed between `988ef5f` and the declaring tree (`git diff --name-status 988ef5f
HEAD` over them: empty, EXIT 0).

## Dependencies

- **A duplicate's target** stays in this batch or an earlier one (calibration 4). W126 is the last
  batch, so every target is in W121-W126; a target in W121-W125's bands is available only if it
  stayed `open`, `deferred` or `icebox` there — not one that batch resolved. Q494 and Q499 are not
  targets (above).
- **Earlier batches' stamps that name a question in this band**, none of them in `Owns`: Q242, Q253,
  Q317 and Q323 (W124, all `icebox`) each name **Q486** as the live home of the kept-harness half,
  and Q407 (W125, `deferred`) says **Q471 and Q492** depend on it. A verdict here that fires or
  empties one of those triggers — Q486 closed, for example, or Q471 or Q492 judged as though Q407
  were settled — is said in the Record and the coordinator decides; a re-stamp is declared under
  Exceptions first (calibration 10).
- **Q493 is in this band and gets a verdict** (P29 decision 1 excepts only Q499). P29 decision 8 and
  its Out put Q493's *check change* out of the plan and replace it with a name-status procedure for
  P29's own edits. **P29 is not in the tree at `988ef5f`** (`git cat-file -e` EXIT 128), so decision 8
  cannot be its `resolved-by` (decision 3), and a plan-local procedure is not a permanent reason
  (calibration 17).
- **Q465 is cited by `CLAUDE.md`**, and **Q486 and Q489 by `doc/workflow.md`'s refusal ledger**, two
  files P29 does not edit (prediction 5). A verdict on any of them changes only the question file; if
  it makes the citing sentence stale, the Record says so (calibration 21).

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W126: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. A question raised from Q530-Q531, as `doc/questions/README.md` says to raise one, only if the
   batch finds one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/`,
  `test/` or `scripts/` changes; a question whose answer is *decide now* is a keep with a
  `closes-when` naming the decision (decision 3). **A process question asking for a check that does
  not exist is not answered by building it here**, and a cheap fix kept under calibration 19 lands,
  if the maintainer decides it, as its own commit outside P29.
- **Every question outside the 49**, including W121-W125's bands (done).
- **Q494** (W127) and **Q499** (stays deferred), as above.
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **A stale comment in `examples/`, `scripts/`, `src/` or `test/`** naming a question this batch
  closes: recorded, not fixed (calibration 21).
- **The sibling repository.** Nothing is written there.

## Calibration

**From W121's pilot and W122-W125's runs** (P29 decision 5: written into this declaration, not
retrofitted). Each clause binds the proposer, the reader and the apply unit.

1. **A keep's `closes-when` is a CLOSING condition**: an event or decision that would ANSWER the
   question. A *"reopen if X"* trigger is not one. A row whose only condition is such a trigger is a
   **defer**, with X in `note` and `closes-when` cleared. *W121: Q241, Q354, Q357 and Q249.*
2. **Be aggressive** — the maintainer's words: *"more aggressive in iceboxing and deferring"*. Prefer
   **icebox** (a what-if with no consumer) or **defer** (waiting on a named thing) over keep. **Keep
   only when the decision is nameable and someone will plausibly make it soon** — and see clauses 19,
   22 and 23.
3. **The keeps round.** After the approval, every row still `keep` goes to the maintainer in a
   per-question stop-and-ask (keep / defer / icebox / resolve), **with a recommendation first**. It
   comes with a **PLAIN-LANGUAGE BRIEFING**: every rule or clause id expanded into what it says, a
   concrete example, and what each verdict would mean in practice. **Terse one-liners were rejected
   at W121.** *W121: 13 rows went to the round and 4 stayed keep; W122: 3 and 3; W123: 2 and 1, with
   a third decided at the approval; W124: 3 and 3, one over the briefer's defer recommendation; W125:
   6 and 5, every answer following its recommendation (Q420 to icebox).*
4. **A duplicate points at a question that stays** (not resolved) **in its own batch or an earlier
   one, never at a later batch's question.** W126 is the last batch, so no later band exists; Q494
   (W127) is not a target. *W121: Q386 → Q9 crossed into W122 and became a defer.*
5. **The decision-text test.** If the deciding ADR, spec or plan text still calls the matter pending
   (*"for now"*, *"is Q<n>"*, *"stays open"*), the row is keep or defer. If the text decides or refuses
   by name with a permanent reason, it is resolve. *W121: Q30 and Q28 pend and were deferred; Q38's
   P23 decision 10 refuses by name and was resolved.*
6. **The row-count check.** The proposer and the reader each confirm that **worksheet rows == the
   id count (49)**, with no missing and no extra id, and that **their tallies are counted from their
   tables**, not carried. *W121's proposer omitted Q103's row and the reader did not notice.*
7. **Check the LAST text that speaks to the question.** A later plan's Record may say *"stays open"*
   after an ADR that looks decisive (W122: Q387, resolve → icebox), or may decide by name what a
   worksheet deferred (W122: Q87, defer → resolve). Search the plans, items and ADRs after the one
   first found.
8. **A `resolved-by` that names an ADR requires that ADR's `resolves` to list the question (R8,
   which reads `resolved-by` whatever the verdict).** If the ADR does not decide the question, the
   ADR is cited in `note`, not in `resolved-by`. *W122: Q87; W123: Q176; W124: ADRs 0044, 0046, 0052,
   0058 and 0060; W125: ADRs 0062, 0070, 0072 and 0078 — all cited in `note` only.*
9. **Every row states `closes-when` explicitly**: the new value, *unchanged*, or *cleared*. **A
   resolved, deferred or iceboxed question carries no reopening trigger in `closes-when`; the trigger
   goes in `note`.** *W122: Q190 and Q201 were applied `resolved` with their old triggers still in
   `closes-when`, and were cleared after the gate; W125 cleared ten such triggers at the propose.*
10. **A re-stamp of an earlier batch's question adds to the stamp count**, because it carries the
    same `P29 W126` prefix. It is declared in the gate and the Exceptions before it is applied.
    *W122: Q386, 70 + 1 = 71.*
11. **The approval's figures are counted from the table by script**, the question put to the
    maintainer included. *W122: a coordinator's hand count reached the maintainer; the rows approved
    were right and the figures were not.*
12. **A resolve citing a general rule needs the files the question NAMES to actually be under that
    rule.** A rule in `doc/workflow.md` that would answer the question is not a resolution if the
    script or self-test the question names was never brought under it. *W123: Q151 and Q153; W124:
    Q198's vacuity half, where rule 8 (d) binds each item's set and not `examples/l6.ts`'s bound.*
13. **A duplicate needs the same QUESTION, not the same mechanism.** Two questions about one
    variable or one check can ask different things. *W123: Q145 is not Q150; W125: Q436 is not Q178,
    nor Q341 Q310.*
14. **Count definitions, not mentions.** A subject grep counts where the thing is DEFINED or
    assigned, with the pattern stated so (for example `MAX_CORPUS\s*=`), never every line that names
    it. *W123: `MAX_CORPUS` had 27 hits but only 4 caps (Q150).*
15. **The decision-text test also reads the authoring item's own test comments.** A spec sentence
    that describes what the code does is not a decision when the item that wrote it says, in its own
    test, that the question is open. *W123: Q45, W20's spec sentence against W20's own test comment.*
16. **The item file stays link-free until Q142 is decided** — this file and every worksheet,
    reader and approval table in it (see the head of this file).
17. **Propose icebox, not resolve, when the ground for a rule can move.** A refusal whose stated
    reason is a cost, a measurement or a current arrangement is not permanent, and clause 5's
    *permanent reason* is not met. *W124: Q198, a P12 refusal on cost (~20 s a run) that ADR 0070
    undid by taking the self-tests off the local gate; W125: Q352, resting on a plan-local
    stop-and-ask.*
18. **Re-read the latest decision text for icebox rows too**, not only for resolves. An icebox whose
    last text says *"stays open"* or names a waited-on event is a defer. *W124: Q252, where ADR 0052
    consequence 4 says Q252 stays open, turned out to be a defer.*
19. **A cheap, concrete fix outside the plan's scope is a keep, not an icebox** — for a defect that
    is still live in the tree (narrowed by clause 22). Being in no item's `Owns` does not mean the
    question has no consumer, and decision 3 forbids fixing it here, not deciding it. The
    `closes-when` names the decision and the one commit outside P29 that would land it. *W124: Q235
    (`.gitignore`) and Q272 (`test/runner.ts`); W125: Q337, Q382, Q430, Q434 and Q437 kept.* Clause 2
    still governs everything that is not cheap and concrete.
20. **After a resumed or interrupted propose, a script checks the worksheet for duplicate rows**
    (and for missing and extra ids, clause 6) before the reader starts. *W124: an API outage
    interrupted the propose mid-worksheet; the resumed table was counted by script, none twice.*
21. **A stale comment naming a question this batch closes is noted in the Record, not fixed** —
    collected under a *for a later item* heading with its path and line at `988ef5f`, for one later
    item outside P29. *W124: `examples/l6.ts:9484-9505` still calls Q216 a declared limit.* The same
    holds for a sentence in `CLAUDE.md` or `doc/workflow.md` (P29 prediction 5).
22. **A check-wish that has failed only once goes to icebox even when it is cheap.** Clause 19 binds
    a defect that is still live, not a first occurrence; the one occurrence and the reopen trigger
    (a second) go in `note`. *W125: Q420, a declaration-block check after W101 alone; the maintainer
    accepted the briefer's icebox over the worksheet's keep.*
23. **A defect still live in the tree whose fix already exists in a sibling file is a keep.** The
    sibling is named in the evidence as the proof that the fix is cheap and concrete. *W125: Q382,
    `test/definition/gate.test.ts`'s 17 index-named cases beside `test/driver/gate.test.ts`, which
    names its cases at the call — the reader's DISPUTE, icebox → keep, taken.*
24. **The briefing marks keeps that share a fix, so they can be bundled**: each such row names its
    partners and the one commit that would land them together. *W125: Q434 with Q437 (self-test
    harness controls), and Q337 decided with Q142 (the walk's widening re-takes `M3`-`M5`).*
25. **A `resolved-by` cell holds the field value only, with no commentary.** A remark such as *no
    ADR, so no R8 edit* belongs in the evidence cell. *W125: Q362's and Q431's cells carried it, and
    the apply unit had to strip it.*
26. **One `resolves` edit moves R8's pairing count by 2** — the pairing is compared in each
    direction. So the apply unit predicts `check:register`'s R8 figure as the previous Record's plus
    two per ADR edited, and an unchanged figure after an R8 edit is the signal. *W125: 24 → 26 for
    ADR 0073 → Q438.*

**A resolve is where a proposal overreaches.** W123's reader overturned **5 of its 10 proposed
resolves**, W124's **1 of 5** (Q198, to icebox), and W125's **0 of 3**. **So the proposer re-derives
each resolve's cited mechanism before proposing it**: it opens the cited clause, script line or Record
row at `988ef5f`, confirms it decides THIS question for the files the question names (clauses 5, 7,
12, 15 and 17), and states that check in the row's evidence. A resolve that fails it is proposed as
icebox or defer.

**This band (B6)** — W123's, W124's and W125's process-band note, carried. These are **PROCESS
questions** — about checks, probes, floors, self-tests, harnesses and the method — not about the
library. For each row the evidence states:

- **whether the check, clause, probe or script the question names still exists at `988ef5f`**, as a
  path (`scripts/<name>.mjs`) or a grep with its pattern and hit count (`git grep -c -F "fail('M1'"
  988ef5f -- scripts/check-markdown.mjs`); a clause id is grepped where it is DEFINED, not where it
  is cited (clause 14);
- **whether a later item built it**, by W id, read from that item's file or Record.

**A question asking for a check that now exists is a resolve candidate**, and its `resolved-by`
cites the clause id and its script — after the decision-text test and clauses 12 and 17, since a
check may exist and still leave the question's other half, or the files it names, open. **A question
whose subject was removed** (a check, script or harness deleted, a rule cut by W115, a file replaced
by W116) is an **obsolete** candidate, and `resolved-by` names what removed it. **A process wish
nobody has picked up across several plans is an icebox candidate**; the evidence says which plans
passed it by — unless it is cheap, concrete and still live (clauses 19, 22 and 23). **Refusal-ledger
proposals** (`doc/workflow.md`'s ledger: a check over `doc/`, `check-owns.mjs`, the dated-ceiling
hand-off, and the rest) are not re-argued: a question that is one of them is resolved or iceboxed
citing the ledger row, never kept. **This band is the newest in the register** — its questions
name items from W107 to W120 (Q439 names W107; Q493 is `raised-by` W116, Q509-Q511 W120) — so its questions are the most likely to be answered by an item that is still recent,
and the least likely to have been passed by several plans; read those items' Records first, and do
not icebox a question for *no taker* when only one plan has passed since it was raised. Nothing is
read from the working tree: every subject is taken at `988ef5f`.

## The phases

P29 decision 4, with the keeps round the calibration adds. A phase does not start before the one
above it is complete.

1. **Propose.** Fill the worksheet: one row per question, 49 rows. The evidence is (a) the
   `npm run refs` count at `988ef5f`; (b) whether the check, clause, file or rule the question names
   still exists at `988ef5f`, as a path, or as a grep with its hit count and the exact pattern; (c)
   any later ADR, plan or item that answered or built it, by id. Every resolve carries the
   re-derivation the calibration's closing line requires. Every row states `closes-when`
   (calibration 9). Rows count against the id list (calibration 6), by script, and again after any
   resumption (calibration 20).
2. **Check.** A fresh-context conformity reader reads each QUESTION first and the worksheet second,
   re-derives each row from the question and the tree, and reports AGREE, DISPUTE or CHANGE per row
   with its reason. It confirms the row count and counts its own tally from its table. It does not fix.
3. **Approve.** The maintainer approves, striking or changing rows; the figures in the question are
   counted by script (calibration 11). **Only approved rows are applied.** A struck row becomes a
   keep with a `closes-when` the maintainer states.
4. **Keeps round.** Every row still `keep` goes to the maintainer one by one, with a recommendation
   first, the plain-language briefing calibration 3 requires, and its bundle partners marked
   (calibration 24). **Nothing is applied before each is answered.**
5. **Apply.** The approved rows' fields and the ADRs' `resolves`, by a script that re-tallies the
   final table before writing and refuses any other figure; `resolved-by` is written as the field
   value alone (calibration 25).
6. **Record.** After the gate below, with the tree still.

### Worksheet

*Filled in at phase 1.* The evidence cell holds three parts: **refs** (the count), **subject** (path,
or grep pattern and hit count, at `988ef5f`), **answered by** (ADR, P or W id, or none). The last
cell states `closes-when` in every row. **49 rows.**

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 49.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row, with the figures counted
from the table by script.*

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, its bundle partners, and the maintainer's answer.*

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
| reader report | the Reader's findings table, one row per worksheet row, 49 |
| maintainer approval | the Approval section |
| keeps round | the Keeps round section, one answered row per keep |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for a question raised from `q530.md`-`q531.md` (made visible with `git add -N`); no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0, and R8's pairing count is W125's 26 plus 2 per ADR whose `resolves` this item edits (calibration 26) |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W126" --count > n.log 2>&1; echo EXIT=$?` — **49**, plus one for each re-stamp declared under Exceptions. `--include-icebox` is required: without it the lookup hides every icebox verdict |
| `git diff --name-only` against Owns | by hand, before the Record (`doc/workflow.md` section 7 rule 2) |
| own-id and withdrawn-claim grep | `W126` and any withdrawn figure, excluding `dev-dist/` (section 1 rule 5) |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in when the item is done.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|

**What broke.**

**Dependencies** — the earlier stamps naming Q486, Q471 or Q492, and the `CLAUDE.md` and
`doc/workflow.md` sentences citing Q465, Q486 or Q489: still true, or stale and recorded here.

**For whoever takes the keeps** — the bundles (calibration 24).

**What this taught** — the calibration for W127.

**For a later item, outside P29** (calibration 21).

**Questions raised.**
