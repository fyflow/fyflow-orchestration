# W126 — B6: a verdict for each of the last 49 open questions in the verification-and-fixtures cluster, Q439-Q511

**Status:** done — the 49 approved verdicts applied on 2026-10-06 after the keeps round (*"Accept all recs"*: four keeps, Q460 to icebox) and the Q488 fixture answer (*"Apply now, W127 fixes"*), no ADR edited, no question raised, and every gate clause EXIT 0; `check:register:selftest` and `npm run state` are red for known reasons W127 owns; see the Record
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

*How the evidence was taken (phase 1, the propose unit).* **refs** is `node scripts/lookup.mjs refs Q<n>`
run in a `git archive` of `988ef5f` (`dev-dist/w126p-51822/base`, 0 links, EXIT 0 for 46 and EXIT 1 for
Q475, Q476 and Q477, which print `no citing file matches`), given as *files / mentions*. **subject** is
`git grep -c -F '<pattern>' 988ef5f -- <paths>` (or `-E` where the pattern says so), or a `git show
988ef5f:<path>` line; a pattern with 0 hits is said to be absent. The bodies of Q439-Q465 were read from
`git show b665981:doc/open-questions.md`'s table rows; Q467-Q492 carry their substance in their
front matter at `988ef5f` and in the raising items' Records (W113, W114, W115) and P27's Retro, which
were read; Q493 and Q509-Q511 were read from their own files at `988ef5f`. Nothing was read from the
working tree. The last text that speaks to each question was found by reading every plan, item and
ADR among its citing files, highest-numbered first (calibration 7) — P28's Retro, W116-W120 and P27's
Retro are the latest for this band. Every resolve states its re-derivation. Every row states
`closes-when` (calibration 9); each reopening trigger (*a second occurrence*, *a third*, *a reader
misled*) is cleared and moved to `note`. `owner` is unchanged in every row.

**Proposal summary: 49 rows — keep 6, defer 5, icebox 32, resolve 2, duplicate 4, obsolete 0**,
counted from the table below by script (`dev-dist/w126p-51822/tally.mjs`), which also confirmed 49 rows
over exactly the 49 ids, none missing, none extra, none twice. Keep: Q439, Q454, Q460, Q470, Q484,
Q490, each a cheap concrete fix for a defect still live whose fix exists in a sibling (calibrations 19
and 23). Defer: Q446, Q479, Q487, Q492, Q493. Resolve: Q461, Q476, **neither naming an ADR, so no R8
edit and R8's pairing count stays W125's 26.** Duplicates: Q442 and Q471 of Q407 (deferred at W125),
Q448 of Q272 (kept at W124), Q488 of Q484 (kept here). **Q493 gets defer, per the coordinator's ruling:**
P29 decision 8 replaces its answer for P29's own edits only, and P29 is not in the tree at `988ef5f`,
so it is cited in `note` and never in `resolved-by`. Two resolve candidates were re-derived and
proposed otherwise: Q486 (the refusal ledger refuses the hand-off on its YIELD, a measurement —
calibration 17 — so icebox) and Q482 (P27's Retro *No rule* rests on the failure being loud, a current
arrangement — icebox). **No earlier batch's stamp is fired or emptied**: Q486 goes to `icebox`, not
`resolved`, so Q242's, Q253's, Q317's and Q323's notes still name a question that exists and stays;
Q471 and Q492 are judged as waiting on Q407, which W125's note says they depend on. No re-stamp, so the
gate's stamp count stays 49. **Two fixture hazards, for the coordinator before the apply**: see the
note after the table.

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q439 | keep | **refs** 3 / 3 (ADR 0073, W107, `scripts/check-docs.mjs`). **subject** `README_SNIPPET_FLOOR\s*=` (`-E`) in `scripts/check-docs.mjs`: 1 (`const README_SNIPPET_FLOOR = 3;`, line 953); `README_SNIPPET_FLOOR` in `scripts/check-docs-selftest.mjs`: 2, both COMMENTS — no regex reads it. The sibling bound is in the same self-test: `/^const X4_WIDTH = (\d+);$/m` and `X4_WIDTH_FLOOR` read out of the check's source (lines 981-982, W104). **answered by** none: ADR 0073 consequence 10 says *NOT fixed* and names this cheaper road (a source-text bound of the kind the self-test already runs on `X4_WIDTH`). Calibration 23 over 22: the gap is measured live (F12, lowered to 7 at EXIT 0), not a first failure of a wish | `closes-when` **set**: `the maintainer decides whether check-docs-selftest.mjs holds README_SNIPPET_FLOOR by a source-text bound beside X4_WIDTH's (a few lines, one commit outside P29), or that a lowering stays caught by review alone`; note stamp `P29 W126: keep — a cheap concrete fix (calibrations 19, 23); the floor is still read by no self-test at 988ef5f, and X4_WIDTH's bound in the same file is the device` |
| Q440 | icebox | **refs** 1 / 1 (W107). **subject** `no probe is named` in `scripts/*-selftest.mjs`: 10 hits in 9 self-tests — the loud ABORT the row itself says is *why this is a row rather than a fix*. **answered by** none for the general case (a check's subject list related to its probes); W107 re-observed the one clause, and no plan since (P26, P27, P28) has met a second | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — the META ABORT already makes a removed sole observer loud in 9 self-tests; the general subject-to-probe relation is a what-if with one occurrence (W107); reopen on a narrowed subject that silently drops coverage` |
| Q441 | icebox | **refs** 1 / 1 (W107). **subject** a written rule *a probe's anchor is the clause's own subject* in `doc/workflow.md`: 0. **answered by** none: both instances were re-anchored at W107; P27's Retro took **No rule** for Q482, the same class one item later (*the failure is loud and named, and gate:full caught every one*). Q178's family, iceboxed at W123 | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — the anchor-on-the-subject rule is the class Q482 holds; P27's retro took no rule because each such probe dies loudly in gate:full; both W107 instances were re-anchored` |
| Q442 | duplicate | **refs** 5 / 5 (ADRs 0078, 0079, W107, W113, W116). **subject** the register TABLE: gone — `doc/open-questions.md` is a 786-byte pointer since W116; a table clause in `scripts/check-markdown.mjs`: `M7 / M8 LEFT at W116` 1, `checks` lists `M1`-`M6`. **answered by** none for the general case, which the row itself calls *Q407's row*; Q407 asks the same question (*nothing checks that a markdown table is well formed*) and stayed `deferred` at W125 (calibration 4). The register half is obsolete by W116 | `closes-when` **cleared** (was *a table check, which W113 measured UNAFFORDABLE*); `resolved-by`: duplicate of Q407; note stamp `P29 W126: duplicate — the register table it found broken went at W116, and the general case, a table check, is Q407's, deferred at W125` |
| Q443 | icebox | **refs** 3 / 4 (ADR 0073, P26, W107). **subject** `**A check over `doc/`**` in `doc/workflow.md`: 1 — the refusal ledger's first row, refused 27 times, P2-P28; the row's own *against* names it. **answered by** the ledger row (calibration: a ledger proposal is never kept); ADR 0073 decision 5 took README out of `X10`'s subject on purpose | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — a README-status check is the refusal ledger's doc/-check row; reopen on a status sentence in README.md that a consumer acts on and gets wrong` |
| Q446 | defer | **refs** 10 / 16 (AGENTS.md, ADR 0075, P26, W109, W117, `spec/flow-definition.md`, `assist.ts`, `wiring.ts`, two tests). **subject** `sampledOutput` in `src/definition/assist.ts`: 4 — the shipped mitigation; `unchecked: ` in `src/definition/wiring.ts`: 10. **answered by** none: ADR 0075 consequence 2 says *Q446 is NOT closed* and P26's Record says *prediction 4 is CONFIRMED*; the decision text pends (calibration 5), and AGENTS.md cites it as a stated limit, which stays true | `closes-when` unchanged (empty); note stamp `P29 W126: defer — waits on a consumer needing a checked verdict past a Transform node, or an outputSchema becoming expressible for the expression language; ADR 0075 consequence 2 (cited in note only) keeps it open, and sampledOutput ships the sample` |
| Q448 | duplicate | **refs** 2 / 2 (W108, W109). **subject** `const REF = reference();` in `test/driver/resume.test.ts`: 1 — fixtures still built at module scope; `for (const f of files) await import(pathToUrl(f));` in `test/runner.ts`: 1, outside any `try`. **answered by** none. A module-scope throw rejects the suite's `import`, which is exactly Q272's subject (*one suite's import failure ends npm test with ZERO FAIL lines*), kept at W124 with `closes-when` *test/runner.ts reports an unimportable suite as one named failure* — the fix that answers this one too. W109 met it a second time and declared CRASH | `closes-when` unchanged (empty); `resolved-by`: duplicate of Q272; note stamp `P29 W126: duplicate — a module-scope throw is an import failure, so Q272's runner fix (kept at W124) is this question's answer` |
| Q449 | icebox | **refs** 2 / 4 (W108, `spec/flow-definition.md`). **subject** `fail('C<n>'` clauses in `scripts/check-spec.mjs`: `C1`-`C8`, none reading a `spec/**` fence (`fence` 0); `"workerType"` in `spec/flow-definition.md`: 1, a historical note. **answered by** none: W108 fixed the three snippets; the claim half is a check over prose, the ledger's doc/-check row; no plan since (P26-P28) took the snippet half | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — W108 fixed the three snippets; validating spec fences has had no taker since, and the claim half is the refusal ledger's doc/-check row; reopen on a second stale spec snippet` |
| Q450 | icebox | **refs** 2 / 6 (ADR 0074, W108). **subject** a clock, random or registry clause over the evaluator in `scripts/check-source.mjs`: `routing` 0 (`S1`-`S16`); `Date\.now\|Math\.random` (`-E`) in `src/driver/routing.ts`: 0 — the source is still pure. **answered by** none; Q9 was deferred at W122 | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — the declared evaluator is pure by construction at 988ef5f and only an adequacy reader's constructed mutation showed no rung reads it; a check-source clause has had no taker; reopen on an impure evaluator shipped` |
| Q451 | icebox | **refs** 1 / 4 (W109). **subject** `transformOnly` in `src/`: 5 (written in `registry.ts:243` under `as WorkerManagerOptions`, read in `envelope-worker.ts:229`) — no shared `const`; in `test/`: 16 — W109's suite in `test/scheduler/bootstrap.test.ts` (producing side) and `transform.test.ts` (consuming side) now assert the literal key on both sides. **answered by** W109 for the instance; the shared-const construct is not built | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — W109's two suites bind the marker's name from both sides, so a one-sided rename now fails at L1; the shared const that makes it an L0 failure is a what-if with no second marker` |
| Q452 | icebox | **refs** 4 / 7 (W109, W110, W112, `scripts/check-budget-selftest.mjs`). **subject** `CAUGHT-BY-MESSAGE` in `doc/workflow.md` and `scripts/`: 0. **answered by** none: rule 8's v0.24 controlled-grader row stands; W110 and `check-budget-selftest.mjs` cite it as a known limit; rule-8 graders live in per-item harnesses that are not kept (Q486) | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — a grader control per runner output shape has had no taker since W109; graders live in per-item harnesses that are not kept (Q486), so there is no standing grader to hold it` |
| Q453 | icebox | **refs** 3 / 5 (W109, W110, `examples/l6.ts`). **subject** `BUILT_IN_NODE_TYPES` in `test/definition/node-type.test.ts`: 6 — the W109 instance now references the list outside a comment. **answered by** none for the general case: the row itself says *nothing cheap, because a citation is prose*, and the narrow form is a check over prose, the ledger's doc/-check row | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — both instances were fixed in place; the only proposed observer is a check over a prose phrase, the refusal ledger's doc/-check row; reopen on a third shipped binding cited and absent` |
| Q454 | keep | **refs** 1 / 3 (W109). **subject** `scripts/check-docs-selftest.mjs` line 60: its header states the site count as **64** across eleven ids with `X11 6`; `fail('X` in `scripts/check-docs.mjs`: **58** at `988ef5f` (`X11` 0, retired at W119) — stale again, a third time. The sibling device exists: `scripts/check-spec-selftest.mjs:862` and `scripts/check-policies-selftest.mjs:921` compute their `fail()` sites from source. **answered by** none | `closes-when` **set**: `the maintainer decides whether check-docs-selftest.mjs computes the fail() site census it prints (one readFileSync and a regex, as check-spec-selftest.mjs does), as one commit outside P29, or deletes the count per P27 decision 4`; note stamp `P29 W126: keep — a cheap concrete fix (calibrations 19, 23); the header reads 64 where the check has 58 at 988ef5f, the third time it went stale` |
| Q458 | icebox | **refs** 5 / 10 (AGENTS.md, `doc/README.md`, P26, P27, W110). **subject** `fail('X<n>'` in `scripts/check-docs.mjs`: `X1`-`X10`, none comparing a snippet to a JSON document on disk; `ui-emitted` in AGENTS.md: 2. **answered by** none: W110 declares the two as copies; no drift has occurred | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — AGENTS.md declares its copy of the shipped flow as a copy and no drift has been seen; a subset-equality clause has had no taker since W110; reopen on the snippet drifting from the shipped document` |
| Q460 | keep | **refs** 2 / 3 (ADR 0076, W112). **subject** `scripts/check-markdown.mjs` lines 338-340: `...markdownIn(join(SCAN_ROOT, 'doc'))` and `'spec'` unguarded, while the root documents on line 340 carry `.filter(existsSync)` — the fix is the sibling on the next line. **answered by** none; unreached by any probe, still live in the code | `closes-when` **set**: `the maintainer decides whether check-markdown.mjs guards its two directories as line 340 guards the root documents (or fails M3 naming the absent one), as one commit outside P29, or leaves the crash unreached by choice`; note stamp `P29 W126: keep — a cheap concrete fix (calibration 23); bundle with Q470, both are guards in check-markdown.mjs` |
| Q461 | resolve | **refs** 2 / 2 (ADR 0076, W112). **subject** `fail('B5'` in `scripts/check-budget.mjs`: 1 — *a met target is a ratchet: lower the ceiling to the target*; every member is met at `988ef5f` with ceiling = target (`25_600` / `25 * 1024`, `35_840` / `35 * 1024`, `17_408` / `17 * 1024`). **answered by** W114 and W115 (`B5`, and the budget MET). **Re-derived**: the row's own last sentence names *the W115 condition, after which ceiling and target coincide and the question closes by construction*; at `988ef5f` a ceiling cannot sit above its met target without `B5` firing, so it cannot go stale toward weakness; raising a target is a decision, not drift. ADR 0076 decision 4 is cited in `note` only (calibration 8). No ADR in `resolved-by`, so no R8 edit | `closes-when` unchanged (empty); `resolved-by`: check-budget.mjs B5 with the budget met at W115: every member's ceiling equals its target, and a met member's ceiling above its target is refused, so a ceiling cannot drift toward weakness; note stamp `P29 W126: resolve — the row's own W115 condition holds at 988ef5f; a fourth member joining un-met would reopen the gap for that member (Q479)` |
| Q462 | icebox | **refs** 2 / 3 (ADR 0076, W112). **subject** a guard-removing / case-planting classification of `SELF` entries: none in the 7 self-tests that declare a `SELF` list (`const SELF\b` 7 files). **answered by** none since W112; P27 and P28 passed it | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — classifying the other SELF lists by the predicate is a reading nobody has asked for since W112; one occurrence` |
| Q463 | icebox | **refs** 1 / 2 (W112). **subject** a `G6` sibling over mutant depth in `scripts/check-wiring.mjs`: `G1`-`G6`, none; an explicit root override, the row's second road: `CHECK_BUDGET_ROOT`, `CHECK_REGISTER_ROOT`, `LOOKUP_ROOT`, `STATE_ROOT`, `CHECK_WORKERS_ROOT` (1 each) — the newer checks take one, the older self-tests write flat. **answered by** none | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — the newer checks already take a root override (the row's second road) and the older self-tests follow the flat convention with no failure since W112; reopen on a mutant measuring the wrong tree again` |
| Q464 | icebox | **refs** 2 / 3 (ADR 0076, W112). **subject** `stray\(` (`-E`) in `scripts/check-wiring-selftest.mjs`: 5, one definition; still consulted only on the control's failure path. **answered by** none: the probe costs a deliberate control failure in a 228 s lane | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — a diagnostic on a failure path, held by a reading; the probe was priced and taken by no plan since W112` |
| Q465 | icebox | **refs** 7 / 10 (CLAUDE.md, ADRs 0076-0078, W112-W114). **subject** `fail('B1'` in `scripts/check-budget.mjs`: 3 — the membership still a literal compared with a second literal. **answered by** W113 for the half about `doc/open-questions.md` (ADR 0077 consequence 5); the surviving half — *no document names the set* — is the same question as Q489 (the set derived from what documents declare); both are iceboxed rather than one made a duplicate, because CLAUDE.md cites this one and the refusal ledger cites Q489 (calibration 21) | `closes-when` unchanged (empty); note stamp `P29 W126: icebox — the instruction half closed at W113; the membership half is Q489's closure question, and a relocation into a fourth required-reading document has been constructed, never seen; reopen on one` |
| Q467 | icebox | **refs** 2 / 5 (P27, W113). **subject** a narrowing-owes-a-price rule in `doc/workflow.md`: 0. **answered by** none; one occurrence (W113) | `closes-when` **cleared** (was *a second occurrence, or a rule once another item narrows an Output row*); note stamp `P29 W126: icebox — one occurrence, W113; reopen on a second item narrowing a declared clause without pricing the narrower one` |
| Q468 | icebox | **refs** 3 / 4 (W113, W114, W115). **subject** a written rule in `doc/workflow.md`: 0. **answered by** W114 and W115 applied it (*reading found something the screen could not*) as method, not as a rule | `closes-when` **cleared** (was *a third occurrence, or an item claiming a home from a grep alone*); note stamp `P29 W126: icebox — W114 and W115 applied the read-the-owner method by hand; reopen on an item claiming a home from a grep alone` |
| Q469 | icebox | **refs** 4 / 17 (P27, W113, W114, W115). **subject** `states the scope it was MEASURED at` in `doc/workflow.md`: 1 — section 1 rule 5's *write* direction, the nearest rule. **answered by** none: the hazard recurred in W114, W115 and twice in P27's own Retro, which recorded it and adopted nothing; Q178's shape, a recurring pitfall with no mechanism (iceboxed at W123) | `closes-when` **cleared** (was *a second occurrence*, met several times since); note stamp `P29 W126: icebox — a recurring instrument pitfall with no proposed mechanism; P27's retro recorded two instances and adopted no rule` |
| Q470 | keep | **refs** 3 / 6 (W113, W114, W115). **subject** `export function resolveLinks(files, root)` in `scripts/check-markdown.mjs`: 1, no guard on a relative entry; callers `check-markdown.mjs:343` and `check-spec.mjs:424` pass absolute paths (no live offender). **answered by** none; it misled W113's instrument and W114's twice, so it is not a first occurrence (calibration 22 does not bind) | `closes-when` **set**: `the maintainer decides whether resolveLinks refuses a relative entry (three lines in check-markdown.mjs), as one commit outside P29, or stays unguarded by choice`; note stamp `P29 W126: keep — a cheap concrete fix (calibration 19), three occurrences across W113 and W114; bundle with Q460` |
| Q471 | duplicate | **refs** 4 / 8 (P27, W113, W114, W115). **subject** `M7 / M8 LEFT at W116` in `scripts/check-markdown.mjs`: 1 — the one-file `M7` it describes is gone; the twenty content-dropping rows are the waited-on event in Q407's own note. **answered by** none. Q407 asks the same question (a table check over the corpus, blocked by these rows) and stayed `deferred` at W125, whose note names Q471 as depending on it | `closes-when` **cleared** (was *the twenty rows fixed, after which M7's universe can be the corpus*); `resolved-by`: duplicate of Q407; note stamp `P29 W126: duplicate — the corpus table check and its twenty blocking rows are Q407's subject and its deferral; M7 left at W116` |
| Q472 | icebox | **refs** 3 / 6 (P27, W114, W115). **subject** `scripts/state.mjs` lines 31-32 record the first-match error and the fix (`DECLARED_TOTAL` read off a comment). **answered by** W114 for the instance | `closes-when` **cleared** (was *a second occurrence*); note stamp `P29 W126: icebox — one occurrence, fixed in state.mjs at W114; reopen on a second derivation reading a stale first match` |
| Q473 | icebox | **refs** 1 / 2 (W114). **subject** `disagrees` in `scripts/state.mjs`: the plan side's agreement clause (line 148) exists; an item side has nothing to compare. **answered by** W114 (`npm run state`) for plans | `closes-when` **cleared** (was *a tenth occurrence, or a rung for an ITEM*); note stamp `P29 W126: icebox — npm run state compares a plan's Status with its Record; an item has no word to compare; reopen on a tenth contradicting file` |
| Q474 | icebox | **refs** 4 / 9 (P27, W114, W115, `scripts/check-budget-selftest.mjs`). **subject** a convention that a probe declares every clause its staging can reach, in `doc/workflow.md`: 0. **answered by** P27's Retro: *No rule, and the ROW's predicate is the defect* — each firing fails loudly as a declared-set mismatch in `gate:full` | `closes-when` **cleared** (was *a third occurrence across items, or a convention*); note stamp `P29 W126: icebox — P27's retro took no rule because each firing is a loud declared-set mismatch; two occurrences across items (W114, W115); reopen on a third` |
| Q475 | icebox | **refs** 0 / 0 (`no citing file matches`, EXIT 1). **subject** `itemSpent:` in `scripts/state.mjs`: 1 — the ledger still read by regex over retro prose. **answered by** none; one occurrence | `closes-when` **cleared** (was *a second occurrence, or a convention*); note stamp `P29 W126: icebox — one occurrence, cited nowhere; reopen on a second ledger id misread around emphasis` |
| Q476 | resolve | **refs** 0 / 0 (`no citing file matches`, EXIT 1). **subject** `STATE CONTROL` in `scripts/check-register-selftest.mjs`: 3 — W116's pass 2b copies `doc/plans`, `doc/work-items`, `doc/decisions`, `doc/questions`, `examples/l6.ts`, `package.json` and `deno.json`, runs `scripts/state.mjs` with `STATE_ROOT`, and requires EXIT 0 with its register figures equal to a third reading; `check:register:selftest` is a `:selftest` entry, so `run-selftests.mjs` runs it in `gate:full`. **answered by** W116. **Re-derived**: the question is *nothing proves the derivation still runs*; at `988ef5f` a state.mjs that crashes or exits non-zero turns the STATE CONTROL red in `gate:full`, in an existing lane, which is neither alternative W114 stop-and-ask (b) refused. Residue: the non-register figures are run but not graded (Q491's neighbourhood) | `closes-when` **cleared** (was *a derivation shipping broken, or a cheap observer*); `resolved-by`: W116, check-register-selftest.mjs's STATE pass: state.mjs runs in gate:full's self-tests over a staged tree and must exit 0 with its register figures equal to a third reading; note stamp `P29 W126: resolve — the observer landed inside an existing lane at W116; the plan and item figures are run, not graded` |
| Q477 | icebox | **refs** 0 / 0 (`no citing file matches`, EXIT 1). **subject** `^\*\*Status:\*\*` (`-E`) in `doc/plans/`: 26 of 28 plan files plus `TEMPLATE.md` carry one; `state.mjs` reads only a leading `complete`. **answered by** none | `closes-when` **cleared** (was *an item that owns the plan headers*); note stamp `P29 W126: icebox — nothing reads a plan Status word beyond complete, and no item owns the plan headers; reopen on a reader or script misled by one` |
| Q478 | icebox | **refs** 3 / 9 (P27, W114, W115). **subject** `whole-tree COPIES` in `CLAUDE.md`: 1 — the Environment section warns every reader to exclude `dev-dist/`. **answered by** none as a mechanism; the warning is in the always-read set | `closes-when` **cleared** (was *a reader or an instrument misled by one*); note stamp `P29 W126: icebox — CLAUDE.md's Environment section warns that dev-dist/ holds whole-tree copies; reopen on a reader or instrument misled by one` |
| Q479 | defer | **refs** 6 / 16 (ADR 0076, P27, Q490, W115, `check-budget.mjs`, `check-budget-selftest.mjs`). **subject** `fail('B3'` in `scripts/check-budget.mjs`: 1; `every ceiling is an integer LITERAL` in `scripts/check-budget-selftest.mjs`: 1 — both still case-less while all three members are met. **answered by** none: P27's Retro *confirmed live and extended*. The only condition is an event that gives the cases back (calibration 1) | `closes-when` **cleared** (was *a fourth member joining the always-read set UN-met*); note stamp `P29 W126: defer — waits on a member of the always-read set being un-met (a fourth joining, or a target lowered), which gives B3 and the literal clause their cases back` |
| Q480 | icebox | **refs** 3 / 3 (P27, Q481, W115). **subject** a reader-provisioning rule in `doc/workflow.md`: 0 (section 6's copy rules cover links, not a deferred `rm -rf`). **answered by** none; one occurrence | `closes-when` **cleared** (was *a rule ... or a second occurrence*); note stamp `P29 W126: icebox — one occurrence, W115; reopen on a second reader tree destroyed by a backgrounded command` |
| Q482 | icebox | **refs** 3 / 8 (P27, W115, `scripts/check-markdown-selftest.mjs`). **subject** the 30-probe census of ADR 0076 decision 3: not acted on. **answered by** P27's Retro: **No rule** — *the failure is loud and named, and gate:full caught every one of the four firings*. That ground is a current arrangement, so not a resolve (calibration 17) | `closes-when` **cleared** (was *the census acted on, or a convention*); note stamp `P29 W126: icebox — P27's retro took no rule because every prose-anchored probe that dies does so loudly in gate:full; Q441 is the same class` |
| Q483 | icebox | **refs** 2 / 6 (P27, W115). **subject** `**A check over `doc/`**` in `doc/workflow.md`: 1. **answered by** P27's Retro: *REFUSED, 26th time, ground extended*; the instrument half has had no taker | `closes-when` **cleared** (was *an instrument ... or an observer that is not its size*); note stamp `P29 W126: icebox — the observer half is the refusal ledger's doc/-check row, refused at P27; the closure is Q489's` |
| Q484 | keep | **refs** 6 / 11 (`doc/README.md`, P27, P28, Q488, W115, W118). **subject** `doc/README.md` at `988ef5f`: line 33-34 *179 questions where npm run state derives 369*, *29 ADRs against 46*; line 43 *v0.26, run to completion TWENTY-SIX times* where `doc/workflow.md` is v0.27, 28 times — still stale. **answered by** none: P28's Retro *left with an id*. `doc/README.md` is not in the always-read set or the record step | `closes-when` **set**: `the maintainer decides whether doc/README.md's derived counts are deleted per P27 decision 4 (one commit outside P29), or kept and re-taken`; note stamp `P29 W126: keep — a cheap concrete fix (calibration 19); the counts are still stale at 988ef5f; Q488 is a duplicate of this` |
| Q485 | icebox | **refs** 2 / 9 (P27, W115). **subject** `**A check over `doc/`**` in `doc/workflow.md`: 1. **answered by** P27's Retro: *the observer is still refused; the instances are now three* | `closes-when` **cleared** (was *a second occurrence, or the doc/-check class being reopened*); note stamp `P29 W126: icebox — an observer of two always-read documents contradicting is the refusal ledger's doc/-check row, refused again at P27` |
| Q486 | icebox | **refs** 2 / 3 (P27, `doc/workflow.md`). **subject** `**The dated-ceiling HAND-OFF**` in `doc/workflow.md`: 1 — the ledger row, refused 4 times, P18-P20 and P27, *on the YIELD, 5 catches in 72 and falling ... with the in-item re-run doing the work (Q486)*. **answered by** the ledger, on a measurement (calibration 17), so icebox rather than resolve. Q242, Q253, Q317 and Q323 (W124) name this question as the kept-harness half's home; it stays, so their notes stay true | `closes-when` **cleared** (was *a harness kept ..., or the obligation scoped in writing*); note stamp `P29 W126: icebox — the refusal ledger refuses the hand-off on its falling yield and the in-item re-run does the work; reopen if a retro needs a declared ceiling re-run` |
| Q487 | defer | **refs** 2 / 2 (P27, P28). **subject** a printed margin in `scripts/check-markdown.mjs`: none; the floors are still literals (`fail('M3'` 1). **answered by** none: P28's Retro *Q487 ... is still open* (calibration 5). Whether floors stay hand-tuned literals or are derived from the probe trees is Q142's decision, kept at W123; a derived floor makes the printed margin moot | `closes-when` **cleared** (was *the check PRINTING each floor's margin*); note stamp `P29 W126: defer — waits on Q142's decision (kept at W123) whether check-markdown's floors stay hand-tuned or are derived from the probe trees` |
| Q488 | duplicate | **refs** 2 / 2 (P27, `scripts/check-register-selftest.mjs` as a fixture). **subject** as Q484: `doc/README.md` still carries the enumerated counts. **answered by** none. Its closing condition, *the counts deleted rather than enumerated*, is the same event that closes Q484, kept here; P27's Retro raised it as Q484's enumeration going stale | `closes-when` **cleared** (was *the counts deleted rather than enumerated*); `resolved-by`: duplicate of Q484; note stamp `P29 W126: duplicate — deleting doc/README.md's counts, Q484's keep, is this question's answer` |
| Q489 | icebox | **refs** 2 / 3 (P27, `doc/workflow.md`). **subject** `fail('B1'` in `scripts/check-budget.mjs`: 3, a literal membership; no clause reads what documents declare. **answered by** none: the ledger's first row calls it *the sharp version ... structural* and does not refuse it; a constructed relocation only (P27's adequacy reader) | `closes-when` **cleared** (was *a clause deriving the set from what the documents DECLARE*); note stamp `P29 W126: icebox — the closure attack was constructed, never seen, and needs a declaration format nothing has; Q465 is the same membership question; reopen on a document declaring itself required reading outside the three` |
| Q490 | keep | **refs** 3 / 15 (P27, `scripts/check-register-selftest.mjs` as a fixture, `scripts/state.mjs`). **subject** `DECLARED_TARGETS_UNDECLARED` in `scripts/check-budget.mjs`: 2; in `scripts/check-budget-selftest.mjs`: **0** — the META entry is still missing at `988ef5f`; the self-test's `META` list carries the sibling entries (`MIN_META\|const META\b` 10). **answered by** none | `closes-when` **set**: `the maintainer decides whether check-budget-selftest.mjs gains the META entry for DECLARED_TARGETS_UNDECLARED (one entry, one commit outside P29), or B6's second direction stays unpinned by choice`; note stamp `P29 W126: keep — a cheap concrete fix (calibration 23); the helper extracted to be pinned is still pinned by nothing at 988ef5f` |
| Q491 | icebox | **refs** 1 / 3 (`scripts/check-register-selftest.mjs`, a fixture id only). **subject** `itemSpent:` in `scripts/state.mjs`: 1 — the spent list is still a regex over retro prose; disk gaps are not read. **answered by** none; the next-free id is printed both ways with a disagreement, so a wrong spent list has not produced a wrong next id | `closes-when` **cleared** (was *the list derived from disk gaps and cross-checked*); note stamp `P29 W126: icebox — one finding (P27's retro), and the next-free id is still derived two ways with the disagreement printed; reopen on a wrong next-free id` |
| Q492 | defer | **refs** 3 / 4 (P27, P28, `scripts/check-register-selftest.mjs`). **subject** `M7 / M8 LEFT at W116` in `scripts/check-markdown.mjs`: 1 — no structural clause over a Record. **answered by** none: its own text names *Q407's widening* as what it waits on, and W125's Q407 note says Q492 depends on it (calibration 18) | `closes-when` **cleared** (was *Q407's widening*); note stamp `P29 W126: defer — waits on Q407 (deferred at W125), the table check whose widening would carry a Record's structure` |
| Q493 | defer | **refs** 6 / 20 (ADR 0079, P28, W116, W119, `check-markdown.mjs`, `check-register.mjs`). **subject** `scripts/check-register.mjs`: R4 still compares to HEAD only, with the ceiling stated (option (e), W116's interim). **answered by** none: P28's Retro *left with an id*. **Coordinator's ruling**: P29 decision 8 puts its answer Out and replaces it, for P29's own edits only, with the name-status procedure; P29 is not in the tree at `988ef5f`, so this is not a resolve, and a plan-local procedure is not a permanent reason (calibration 17). A deletion guard and Q499's question, whether resolved questions are kept at all, have to be decided together | `closes-when` **cleared** (was *a decision among priced options (a)-(e)*, which moves to note); note stamp `P29 W126: defer — waits on Q499's decision whether resolved questions are kept, since a deletion guard must allow or refuse those deletions; options (a)-(e) as W116 priced them; P29 decision 8's name-status procedure covers P29's own edits only` |
| Q509 | icebox | **refs** 2 / 5 (`doc/glossary.md`, W120). **subject** `*declared ceiling* —` in `doc/glossary.md`: 1, pointing at this question; a defining heading in `doc/workflow.md` or `doc/decisions/`: 0. **answered by** none: W120 raised it. The cheap home, `doc/workflow.md`, had 66 bytes of headroom (35,774 of 35,840) | `closes-when` **cleared** (was *a definition under a heading ..., and a glossary row*); note stamp `P29 W126: icebox — the glossary points here by ADR 0080's design; no reader has been misled, and workflow.md has 66 bytes of headroom; reopen on a misreading or an item that defines it, with Q510 and Q511` |
| Q510 | icebox | **refs** 2 / 3 (`doc/glossary.md`, W120). **subject** `*survivor* —` in `doc/glossary.md`: 1, pointing here; a defining heading: 0. **answered by** none | `closes-when` **cleared** (was *a definition under a heading ..., and a glossary row*); note stamp `P29 W126: icebox — as Q509: the term is used in context and undefined by heading; reopen on a misreading or an item that defines it` |
| Q511 | icebox | **refs** 4 / 8 (`doc/glossary.md`, P28, W119, W120). **subject** `*META entry* —` in `doc/glossary.md`: 1, pointing here; a defining heading: 0. **answered by** none | `closes-when` **cleared** (was *a definition under a heading ..., and a glossary row*); note stamp `P29 W126: icebox — as Q509: the term is used in context and undefined by heading; reopen on a misreading or an item that defines it` |

**Two fixture hazards, measured at `988ef5f`, for the coordinator before the apply** (they are outside
this item's gate, which does not run `check:register:selftest`, and inside W127's `gate:full`):

1. **Q488** is a fixture of `scripts/check-register-selftest.mjs`, chosen as *open with an empty note*
   (line 128). Five probes anchor on its text — `edit(t, 488, 'status: open\n', …)` at lines 241, 311,
   314, 356 and 1065, and `'note: ""\n'` at 242, 314, 357 and 1066. **Any verdict applied to Q488,
   including a keep, writes the P29 stamp into `note`**, so the anchors match nothing and those probes
   ABORT under rule 7 (b). W127 owns that file and is the item that can re-point the fixture.
2. **Q490** is the other fixture (*open with a note*): four probes anchor on `'status: open\n'` (lines
   634-644). Its proposed verdict is keep, which leaves `status: open` and only appends to `note`, so
   it is safe as proposed; a reader or approval that changes it away from keep breaks those four.
   `scripts/check-markdown-selftest.mjs`'s probes on `q488.md` and `q490.md` anchor on the closing
   `---` and `title: "`, which no verdict here changes.

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 49.

*Phase 2, 2026-10-06.* The reader read each question at `988ef5f` first (front matter, the raising
items' text, and the `b665981` register row where the front matter is a title only). It wrote its own
verdict for all 49 to scratch (`dev-dist/w126r-54056/my-verdicts.txt`) before opening this worksheet.
Everything was read from a `git archive` of `988ef5f` (`dev-dist/w126r-54056/base`, 0 links) with
`git show` and `lookup.mjs refs`. Nothing was read from the working tree except the current state of
the fixture ids and of W121-W125's targets (Q407, Q272, Q142, Q9).

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| Q439 | AGREE | keep. `README_SNIPPET_FLOOR` is still read by no regex in `check-docs-selftest.mjs`, and `X4_WIDTH` and `COPIES_FLOOR` are bound in the same file (lines 981-1015), so calibration 23 applies. ADR 0073 consequence 10 says *NOT fixed* |
| Q440 | AGREE | icebox. The META abort caught the W107 instance loudly, and there is one occurrence |
| Q441 | AGREE | icebox. Same class as Q482. Both W107 instances were re-anchored |
| Q442 | AGREE | duplicate of Q407 is the same question: no check holds a markdown table well formed. The register table went at W116. Q407 is `deferred` in the working tree, so it stays |
| Q443 | AGREE | icebox. This is the doc/-check row of the refusal ledger, and ADR 0073 consequence 11 says so itself |
| Q446 | AGREE | defer, not icebox. ADR 0075 consequence 2 says *NOT closed* (calibration 18). It is a library limit, and `sampledOutput` ships the residue |
| Q448 | DISPUTE | duplicate → icebox. This is not Q272's question (calibration 13). Q272's fix turns an import crash into ONE named suite failure. A rule-8 grader reads that as WRONG-REASON, because it is not the clause's own failure line, so the fix does not make the probe gradeable. Q448's own fix is in the test files (fixtures moved into the test bodies). W109 called both crashes *not a defect* and covered each clause with another probe |
| Q449 | AGREE | icebox. One occurrence (calibration 22), and the claim half is the doc/-check row |
| Q450 | AGREE | icebox. No source-reading rung has been proposed. Q9 is deferred, and ADR 0074 consequence 4 names no event it waits on |
| Q451 | AGREE | icebox. `test/scheduler/bootstrap.test.ts:398-431` binds the marker from the producing side, and the cast at `src/definition/registry.ts:244` remains. This is a lesson |
| Q452 | AGREE | icebox. It is a harness-grader lesson, and harnesses are not kept |
| Q453 | AGREE | icebox. W110 adopted the practice *checked rather than cited*, and the observer is the doc/-check class |
| Q454 | AGREE | keep. The header at line 60 says 64 sites and `grep -c "fail('X"` gives 58 (X11 retired at W119). The sibling device exists at `check-spec-selftest.mjs:862`. P27 decision 4 was not applied here (calibration 12) |
| Q458 | AGREE | icebox. AGENTS.md declares the copy and says why there is no check |
| Q460 | AGREE | keep. Line 340's `.filter(existsSync)` is the sibling fix (calibration 23). The `b665981` row says *unreached rather than latent-and-live*, so this is a borderline keep. Unbundle it from Q470 (see that row) |
| Q461 | DISPUTE | resolve → defer, beside Q479 and with the same trigger. The row's own text does name *the W115 condition* as what settles it, and `B5` with the met budget does pin all three ceilings at `988ef5f`. But this rests on a current arrangement (calibration 17). `B5` is conditional on purpose: its comment in `check-budget.mjs` keeps it so that a FOURTH member can join UN-met with its ceiling above target. That member's ceiling can then go stale toward weakness, which is this question exactly. The worksheet's own note concedes the event, and the worksheet defers Q479 on that same event. One trigger should not give one question a resolve and the other a defer |
| Q462 | AGREE | icebox. The counter-measure (plant the case) is in the harnesses, and there is one occurrence |
| Q463 | AGREE | icebox. The convention is now explained at `check-budget-selftest.mjs:862`, and it fails loudly (B1) |
| Q464 | AGREE | icebox. ADR 0076 consequence 14 *recorded rather than guarded* |
| Q465 | AGREE | icebox. Note for the approval: its `b665981` settle-condition (*the set derived from the instruction*) is Q489's closes-when, so the two are one question. Both are iceboxed, which keeps CLAUDE.md's and the ledger's citations pointing at questions that still exist. P27 decision 1's table does name the three files, and CLAUDE.md at `988ef5f` still says no document does. That tension is for calibration 21's Record line |
| Q467 | AGREE | icebox. One occurrence, and the closes-when was a trigger only |
| Q468 | AGREE | icebox. W114 and W115 applied the method by hand |
| Q469 | AGREE | icebox. Its trigger (*a second occurrence*) has fired at least five times (W114, W115, P27's retro), and no retro took a rule. Icebox is the aggressive reading and fits Q178's W123 precedent. A keep naming a retro decision would also be honest |
| Q470 | DISPUTE | keep → icebox. The evidence overstates the count. W114's two occurrences were its OWN home instrument (v1 blank-line split, v2 missing `doc/` prefix, W114 lines 141-152 and 518-527), not `resolveLinks`. The three-line guard would have caught neither. On `resolveLinks` itself there is one occurrence (W113) and, by the row's own closes-when, *no live offender*. Calibration 22 applies |
| Q471 | AGREE | duplicate of Q407. M7 left at W116, Q407's note carries the twenty dropping rows, and W125's Q407 note names Q471 |
| Q472 | AGREE | icebox. One occurrence, fixed in state.mjs |
| Q473 | AGREE | icebox. The plan side is compared by `npm run state`, and the item side has nothing to compare |
| Q474 | AGREE | icebox. P27's retro said *No rule*, and each firing fails loudly |
| Q475 | AGREE | icebox. One occurrence, cited nowhere |
| Q476 | AGREE | resolve, re-derived. `check-register-selftest.mjs:1048-1110` and pass 2b (`:1563`) run `state.mjs` against staged trees, require EXIT 0, and grade the register figures. `check:register:selftest` runs under `selftests` in `gate:full`, and S11 sees it. This is neither alternative W114's stop-and-ask (b) refused. No ADR is named. **Caveat**: the STATE pass's iceboxed-question probe (`:1065-1066`) anchors on Q488, so this resolve's own evidence ABORTs in `gate:full` once Q488 is applied, until W127 re-points the fixture |
| Q477 | AGREE | icebox. No item owns the plan headers |
| Q478 | AGREE | icebox. CLAUDE.md's Environment section carries the warning |
| Q479 | AGREE | defer. The maintainer chose to DECLARE it (the `TOTAL_CEILING` comment in `check-budget.mjs`), and it waits on a member being un-met. Q461 should share this verdict |
| Q480 | AGREE | icebox. One occurrence |
| Q482 | DISPUTE | icebox → defer (calibration 18). The LAST text is P27's Retro: *No rule ... left as the open row*. That is *stays open* in other words, and it names what is waited on: ADR 0076 decision 3's 30-probe census, still unacted at `988ef5f` |
| Q483 | AGREE | icebox. P27's retro refused it the 26th time, and the closure half is Q489 |
| Q484 | AGREE | keep. `doc/README.md:31-35` still names stale counts (179 against 369, 29 ADRs against 46). The fix is one deletion commit (calibration 19) |
| Q485 | AGREE | icebox. P27's retro: *the observer is still refused* |
| Q486 | AGREE | icebox. It is the refusal-ledger row on YIELD, a measurement (calibration 17). It stays live, so the W124 notes (Q242, Q253, Q317, Q323) stay true |
| Q487 | AGREE | defer on Q142 (kept at W123). If Q142 derives the floors, the printed margin is moot |
| Q488 | AGREE | duplicate of Q484 is the same subject with the same close (delete the counts), and Q484 is kept. **Apply-time hazard**: see the fixture paragraph below. Every verdict breaks the self-test, and this one also breaks `resolved-by` (`:358`) |
| Q489 | AGREE | icebox. It is constructed, not seen, and needs a declaration format. The ledger cites it as *the sharp version*, so the Record notes that the citation now points at an iceboxed question (calibration 21) |
| Q490 | AGREE | keep. `DECLARED_TARGETS_UNDECLARED`: 2 hits, both in `check-budget.mjs`, 0 in its self-test. The sibling META entries exist. Keep is also the only verdict that leaves Q490's eight `status: open` fixture anchors intact |
| Q491 | AGREE | icebox. The next-free id is derived two ways and the disagreement is printed. A wrong spent list prints but does not mis-allocate |
| Q492 | AGREE | defer on Q407, consistent with W125's note |
| Q493 | AGREE | defer is the right one of the three. Keep would need a decision someone can make now. But options (a) and (b) refuse any committed deletion, and Q499 (deferred, P29 Out) asks whether resolved questions are deleted at all. The guard cannot be chosen before Q499, so the coupling is a real waited-on thing. Option (e), W116's interim, is in force meanwhile. Icebox would hide a ceiling that P29 decision 8 itself works around |
| Q509 | AGREE | icebox. The cheap home costs budget: `doc/workflow.md` is 35,774 of 35,840 bytes at `988ef5f`. So this is not iceboxed only for *no taker*, which the band note forbids one plan after W120 |
| Q510 | AGREE | icebox, as Q509 |
| Q511 | AGREE | icebox, as Q509 |

**Count, by script from this table** (`dev-dist/w126r-54056/tally.mjs`): 49 rows over the 49 ids, none
missing, extra or twice. **AGREE 45, DISPUTE 4, CHANGE 0.** If all four disputes are taken, the
worksheet's tally moves from keep 6, defer 5, icebox 32, resolve 2, duplicate 4 to **keep 5, defer 7,
icebox 33, resolve 1, duplicate 3**. Q448 (duplicate → icebox) and Q470 (keep → icebox) each add one
icebox, and Q482 (icebox → defer) removes one. Q461 (resolve → defer) and Q482 add two defers. The
Q460 and Q470 bundle falls apart, and Q460 stays a lone keep.

**Fixture anchors**, read from `scripts/` at `988ef5f`. `git diff 988ef5f HEAD -- scripts/` is empty,
so the line numbers hold today. Two scripts anchor on real question files: `check-register-selftest.mjs`
(its `edit`, `setLine`, `raise` and `Q` helpers, lines 58-73 and 133) and `check-markdown-selftest.mjs`.
`check-lookup-selftest.mjs` builds a synthetic fixture tree (its own Q1, Q2, Q3, Q17 and Q170, lines
43-56) and touches no real file. No other self-test names a question file. `check-register.mjs:397`
names Q466 in `NOT_A_RESOLUTION`.

- **Q488** (open, `note: ""`) breaks under every W126 verdict, a keep included, because the stamp fills `note`.
  - `status: open\n` anchors at register-selftest lines 241, 311, 314, 356 and 1065.
  - `note: ""\n` anchors at 242, 314, 357 and 1066.
  - `resolved-by: ""\n` anchors at 358, which the worksheet's note omits. The duplicate verdict also breaks this one.
  - `check-markdown-selftest.mjs` lines 192, 197 and 202 anchor on the closing `\n---\n$` and survive.
- **Q490** (open, with a note) is safe while it is `open`.
  - `status: open\n` at 297, 300, 634, 638, 641, 644 and 1069. Line 1150 is a SELF mutation string over the harness text.
  - `shared: ""\n` at 286 and 289, and `resolved-by: ""\n` at 351.
  - `id: Q490\n` at 258, 262, 292 and 1076, plus `raise()` at 71-72, which clones Q490 for 382-410.
  - The closing fence at 317, and key-only `setLine` anchors (title, cluster, owner, shared) at 293-335 and 586-601.
  - ADR 0079 `resolves: Q490` at 537, a probe that needs Q490 unresolved by that ADR.
  - `check-markdown-selftest.mjs` lines 207 and 212 anchor on the closing fence and on `\ntitle: "`.
- **The rest of this batch**: none of the other 47 W126 ids is a fixture anchor.
- **Q1** (resolved, not judged): `Q1_BY` at line 231, used at 346-377, 543-559 and 620-623. File presence at 534 and 1486-1487.
- **Q4** (resolved, not judged): `Live tokens - ADR 0003, decided` at 541 and 583.
- **Q12** (resolved, not judged): `resolved-by: "Two features over ONE region"` at 553.
- **Q17** (W121): `id: Q17\n` at 250-252, 266 and 269. W121's `shared` edit leaves the anchor intact.
- **Q92** (W121, deferred): `resolved-by: ""\n` at 354. Still empty, so intact.
- **Q300** (resolved, not judged): the file must exist, for deletion at 382-398.
- **Q466** (resolved, not judged): `left to a person`, `Q466_LINK` and the ADR 0077 link text at 561-625, and `check-register.mjs:397`.
- **W121-W125**: none of their applied edits breaks an anchor.

**The consequence is W127's**, because it owns `check-register-selftest.mjs`. Once Q488 is applied,
`check:register:selftest` and therefore `gate:full` go RED. The R2 icebox probes, the R3 probe at 358
and the STATE iceboxed-question probe (Q476's evidence) all ABORT under rule 7 (b). W126's gate does
not run that lane, so it stays green.

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row, with the figures counted
from the table by script.*

**The maintainer, 2026-10-06:** *"Approve, taking reader's".* The approved set is **the worksheet
above with the Reader section's four DISPUTE rows taken, each with the Reader's stated replacement**,
and nothing else. Where the Reader gave no exact field value, the value below is derived from its
reason and the calibration (clauses 1, 9 and 22). The worksheet's rows are not rewritten; the table
below is the approved verdict for every row that differs from them. **No `resolved-by` names an
ADR**: Q461's resolve, the worksheet's only other candidate, is now a defer, so the one resolve left
is Q476, which names W116, and R8's pairing count stays W125's 26 (calibration 26). **No earlier
batch's stamp is fired or emptied**: Q486 stays `icebox`, and Q471 and Q492 are judged as waiting on
Q407, so there is no re-stamp and the gate's stamp count stays 49.

| id | worksheet | approved | taken from | approved fields |
|---|---|---|---|---|
| Q448 | duplicate | **icebox** | Reader DISPUTE | `icebox`; `closes-when` unchanged (empty); `resolved-by` unchanged (empty): the worksheet's *duplicate of Q272* is NOT applied; stamp `P29 W126: icebox — the reader's DISPUTE, approved 2026-10-06; not Q272's question (calibration 13): Q272's runner fix turns an import crash into one named suite failure, which a rule-8 grader still reads as WRONG-REASON; the fix here would be in the test files, and W109 called both crashes not a defect and covered each clause with another probe; reopen on a clause left ungraded because its suite threw at module scope` |
| Q461 | resolve | **defer** | Reader DISPUTE | `deferred`; `closes-when` unchanged (empty); `resolved-by` unchanged (empty): the worksheet's value is NOT applied; stamp `P29 W126: defer — the reader's DISPUTE, approved 2026-10-06; waits, beside Q479, on a fourth member joining the always-read set UN-met, whose ceiling can then sit above its target and go stale toward weakness; at 988ef5f check-budget.mjs B5 pins all three met ceilings to their targets; ADR 0076 decision 4 cited in note only` |
| Q470 | keep | **icebox** | Reader DISPUTE | `icebox`; `closes-when` **cleared** (was *a guard in check-markdown.mjs refusing a relative entry, which is three lines and has no live offender*): the worksheet's set value is NOT applied; stamp `P29 W126: icebox — the reader's DISPUTE, approved 2026-10-06; one occurrence on resolveLinks itself (W113) and no live offender: both callers pass absolute paths at 988ef5f, and W114's two misreadings were its own instrument, which the guard would not have caught (calibration 22); reopen on a second caller passing relative entries; the fix is a three-line guard in check-markdown.mjs` |
| Q482 | icebox | **defer** | Reader DISPUTE | `deferred`; `closes-when` **cleared** (was *ADR 0076 decision 3's 30-probe census acted on, or a convention that a probe anchors on text its own subject owns*); stamp `P29 W126: defer — the reader's DISPUTE, approved 2026-10-06; P27's retro took no rule and left this "as the open row" (calibration 18); waits on ADR 0076 decision 3's 30-probe census being acted on, still unacted at 988ef5f; Q441 is the same class, iceboxed` |

**The counts at the approval, before the keeps round**, measured from the tables by script
(`dev-dist/w126k-55226/tally.mjs`, EXIT 0; the keeps round moved Q460 to icebox, so the final figures
are the Final table's): the Final approved verdicts table below had **49 rows over the 49 ids**, none missing, none extra, none
twice, and counts **keep 5 (Q439, Q454, Q460, Q484, Q490), defer 7 (Q446, Q461, Q479, Q482, Q487,
Q492, Q493), icebox 33, resolve 1 (Q476), duplicate 3 (Q442 → Q407, Q471 → Q407, Q488 → Q484),
obsolete 0 — 49**. That is the worksheet's tally with the four disputes taken: keep 6 to 5 (Q470
out), defer 5 to 7 (Q461 and Q482 in), icebox 32 to 33 (Q448 and Q470 in, Q482 out), resolve 2 to 1
(Q461 out), duplicate 4 to 3 (Q448 out).

**The Q488 fixture — answered 2026-10-06, the maintainer: *"Apply now, W127 fixes".*** All 49
approved rows are applied, Q488's included. **W127 re-points the self-test fixtures that anchor on
live questions** — Q488 and Q490 in `scripts/check-register-selftest.mjs` and
`scripts/check-markdown-selftest.mjs`, and any other fixture a P29 verdict moved — so a red
`check:register:selftest` or `gate:full` caused by this item's edits to those fixtures is a known,
owned failure until W127, not a reason to hold the apply. *The question as it was put, kept for the
record:* Q488 is an anchor of
`scripts/check-register-selftest.mjs` (the Reader's fixture paragraph: `status: open\n` at 241, 311,
314, 356 and 1065; `note: ""\n` at 242, 314, 357 and 1066; `resolved-by: ""\n` at 358). Applying its
approved verdict, duplicate of Q484, writes `status`, `resolved-by` and the stamp, so those probes —
including the STATE pass that is Q476's resolve evidence — ABORT under rule 7 (b) and
`check:register:selftest`, and with it `gate:full`, go RED until the fixture is re-pointed; W127 owns
that file. The coordinator put this to the maintainer separately, and the Keeps round carries it as
a stop-and-ask, now answered.

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, its bundle partners, and the maintainer's answer.*

**Stop-and-asks**, one per row still `keep` after the approval, plus one for the Q488 fixture. The
briefing is the one put to the maintainer (`dev-dist/w126k-55226/briefing.md`), at most 100 words a
row; facts are at `988ef5f`, and every fix, if decided, lands as its own commit outside P29.
**Nothing in these rows is applied before each is answered** (phase 4). **Bundles** (calibration
24): Q439, Q454 and W125's Q430 are one commit in `scripts/check-docs-selftest.mjs`; Q484 carries
Q488, its approved duplicate; Q460 could ride W125's Q337 commit, which edits the same lines of
`scripts/check-markdown.mjs`; Q490 stands alone.

**The keeps round was answered 2026-10-06** — the maintainer: *"Accept all recs"*. Four stay keep
(Q439, Q454, Q484, Q490) and **Q460 moves keep → icebox**, each as its recommendation said; no answer
went against a recommendation. Q460's defect is latent and has never occurred, and the crash still
exits non-zero; its reopen trigger and the option of folding the guard into Q337's commit go in
`note`, not `closes-when` (calibration 9). **Bundles recorded**: Q439 and Q454 land with W125's Q430
as one commit to `scripts/check-docs-selftest.mjs`, and Q484's commit closes its duplicate Q488. The
Q488 fixture was answered the same day, *"Apply now, W127 fixes"* (Approval).

| | the question, the briefing and the recommendation | answer |
|---|---|---|
| Q439 | **Rec: keep, one commit with Q454 and Q430.** *Can the README snippet floor be lowered silently?* check-docs.mjs clause X8 fails when README.md has fewer paired code snippets than `README_SNIPPET_FLOOR`. Example: set it from 3 to 0 and every gate stays green; W101's reader lowered it at EXIT 0, and W107 really lowered it, 8 to 3. No self-test reads it, while the same self-test already reads `X4_WIDTH` out of the check's source (ADR 0073 consequence 10 names this road). Cost: a few lines, one file. Keep: land it. Icebox: review alone guards it. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: one commit to scripts/check-docs-selftest.mjs with Q454 and W125's Q430; the row's `closes-when` |
| Q454 | **Rec: keep, decided with Q430.** *Should a self-test's comment counting its check's `fail()` sites be deleted or compared?* check-docs-selftest.mjs line 60 says check-docs.mjs has 64 sites across eleven ids; it has 58 (X11 retired at W119). Stale a third time. Q430, kept at W125, is this same comment; its recommendation was delete, per P27 decision 4 (a number a script can derive is not written down). Cost: two sentences, one file. Keep: one commit closes both. Icebox: the comment stays wrong. Alternative: close it now as a duplicate of Q430. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: decided with W125's Q430, in the same commit as Q439; the row's `closes-when` |
| Q460 | **Rec: icebox.** *Should check-markdown survive a tree missing `doc/` or `spec/`?* Its walk (lines 338-339) reads both directories unguarded; line 340 guards the root files with `.filter(existsSync)`. Example: run it over a copy without `spec/` and it crashes with ENOENT instead of naming the problem. Every tree it runs on has both, no probe reaches it, and a crash still exits non-zero: latent, never happened. Cost: one line, one file. Keep: land the guard. Icebox: reopen on a real missing directory, or fold into Q337's commit, which edits these lines. | **icebox** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: the defect is latent and has never occurred, and the crash still exits non-zero; `closes-when` stays empty and the reopen trigger and the Q337 fold go in `note` |
| Q484 | **Rec: keep.** *Should doc/README.md's derived counts be deleted?* It states counts `npm run state` computes: 179 questions where the tree has 369, 29 ADRs against 46, workflow "v0.26, twenty-six times" where it is v0.27, 28. Example: a reader trusting the index misjudges the register's size. Still stale; P28's retro left it open. P27 decision 4: derivable counts are not written down. Cost: delete sentences, one file. Keep: land it, closing Q488 too. Defer/icebox: the counts keep rotting. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: its commit closes Q488, its duplicate; the row's `closes-when` |
| Q490 | **Rec: keep.** *Does anything prove clause B6's second direction is checked?* check-budget.mjs's B6 compares two declared lists, budgeted files and their targets, both ways. The helper `DECLARED_TARGETS_UNDECLARED` was extracted so a self-test mutation could break it, and that META entry (a mutation the self-test must see caught) was never written: 0 hits in check-budget-selftest.mjs. Example: make the helper always return false; `check:budget` and its self-test both exit 0. Cost: one entry, one file. Keep: land it. Icebox: the direction stays unguarded. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: stands alone; the row's `closes-when` |
| Q488 fixture | **Not a keep; the coordinator puts it to the maintainer separately, and this unit does not decide it.** Q488 is an anchor of `scripts/check-register-selftest.mjs` (`status: open`, `note: ""` and `resolved-by: ""` at the lines the Reader's fixture paragraph lists). Its approved verdict, duplicate of Q484, rewrites all three, so those probes, Q476's STATE-pass evidence among them, ABORT and `gate:full` goes RED until W127, which owns that file, re-points the fixture. Q488's row is approved and NOT applied until this is answered. | **apply now, W127 fixes** — 2026-10-06, the maintainer: *"Apply now, W127 fixes"*: all 49 applied, Q488 included; W127 re-points the fixtures that anchor on live questions (Q488 and Q490 in check-register-selftest.mjs and check-markdown-selftest.mjs, and any other) |

#### Final approved verdicts

*Filled in after phase 4, counted from this table by script.*

**49 rows: keep 4, defer 7, icebox 34, resolve 1, duplicate 3, obsolete 0** — counted from this
table by script: keep 5 / icebox 33 before the keeps round (`dev-dist/w126k-55226/tally.mjs`), and
**after it** by `dev-dist/w126a-55766/tally.mjs` and again by `dev-dist/w126a-55766/apply.mjs`,
which re-tallies this table before writing. **This table is final.** **The keeps round was answered
2026-10-06** (*"Accept all recs"*): Q439, Q454, Q484 and Q490 stay keep, and Q460 moves keep →
icebox; the Q488 fixture was answered *"Apply now, W127 fixes"*. *From*: **W** the worksheet, **R**
the Reader as approved, **K** the keeps round. Every row's `note` gains the stamp `P29 W126:
<verdict>`, with the reason, after `; ` where the note was not empty; a field not named is
unchanged. A *duplicate* is `status: resolved` with `resolved-by` naming its target.

| id | final | from | fields applied |
|---|---|---|---|
| Q439 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q454 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q460 | icebox | W, K | `icebox`, not `open`; `closes-when` unchanged (empty): the worksheet's set value is NOT applied; stamp `P29 W126: icebox — the keeps round, 2026-10-06; the walk's unguarded doc/ and spec/ reads (check-markdown.mjs lines 338-339) are latent and have never failed, and a crash still exits non-zero; reopen on a real tree missing doc/ or spec/, or fold the one-line guard (line 340's .filter(existsSync) is the sibling) into Q337's commit, which edits the same lines` |
| Q484 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q490 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q446 | defer | W | `deferred`; `closes-when` unchanged (empty); the worksheet's stamp; ADR 0075 cited in `note` only |
| Q461 | defer | R | `deferred`; `closes-when` unchanged (empty); `resolved-by` unchanged (empty); the approved stamp above; ADR 0076 cited in `note` only |
| Q479 | defer | W | `deferred`; `closes-when` **cleared**; the worksheet's stamp |
| Q482 | defer | R | `deferred`; `closes-when` **cleared**; the approved stamp above |
| Q487 | defer | W | `deferred`; `closes-when` **cleared**; the worksheet's stamp |
| Q492 | defer | W | `deferred`; `closes-when` **cleared**; the worksheet's stamp |
| Q493 | defer | W | `deferred`; `closes-when` **cleared**; the worksheet's stamp; P29 decision 8 cited in `note` only |
| Q440 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q441 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q443 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q448 | icebox | R | `icebox`; `closes-when` unchanged (empty); `resolved-by` unchanged (empty); the approved stamp above |
| Q449 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q450 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q451 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q452 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q453 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q458 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q462 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q463 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q464 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q465 | icebox | W | `icebox`; `closes-when` unchanged (empty); the worksheet's stamp |
| Q467 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q468 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q469 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q470 | icebox | R | `icebox`, not `open`; `closes-when` **cleared**: the worksheet's set value is NOT applied; the approved stamp above |
| Q472 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q473 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q474 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q475 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q477 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q478 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q480 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q483 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q485 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q486 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q489 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q491 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q509 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q510 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q511 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q476 | resolve | W | `resolved`; `closes-when` **cleared**; `resolved-by` as the worksheet's row; names no ADR |
| Q442 | duplicate | W | `resolved`; `closes-when` **cleared**; `resolved-by`: `duplicate of Q407`; the worksheet's stamp |
| Q471 | duplicate | W | `resolved`; `closes-when` **cleared**; `resolved-by`: `duplicate of Q407`; the worksheet's stamp |
| Q488 | duplicate | W | `resolved`; `closes-when` **cleared**; `resolved-by`: `duplicate of Q484`; the worksheet's stamp; applied by the maintainer's fixture answer, *"Apply now, W127 fixes"* (Approval) |

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

*Filled in 2026-10-06, by the apply unit, with the tree still.* Scratch: `dev-dist/w126a-55766/`
(`edit-item.mjs`, `tally.mjs`, `apply.mjs` and every log below). Node v24.20.0 by `fnm use 24` in
every shell. Nothing committed.

**Final verdicts: 49 — keep 4 (Q439, Q454, Q484, Q490), defer 7 (Q446, Q461, Q479, Q482, Q487,
Q492, Q493), icebox 34, resolve 1 (Q476), duplicate 3 (Q442 → Q407, Q471 → Q407, Q488 → Q484),
obsolete 0.** 45 of the 49 leave `open` (92%). `tally.mjs` re-counted the worksheet and the *Final
approved verdicts* table after the keeps round (EXIT 0, `tally.log`), and `apply.mjs` re-tallied the
Final table again before writing and refuses any other figure; both matched. **The keeps round**: the
maintainer, 2026-10-06, *"Accept all recs"* — Q439, Q454, Q484 and Q490 stay keep with their rows'
`closes-when`, and **Q460 moves keep → icebox** (latent, never occurred, and the crash still exits
non-zero), its reopen trigger and the Q337 fold in `note`. **The Q488 fixture**: *"Apply now, W127
fixes"* — all 49 applied, Q488 included. **R8**: no `resolved-by` names an ADR (`apply.mjs` refuses
one), so no `resolves` was edited and the pairing count stays W125's 26. **No re-stamp**, so the stamp
count is the row count, and Q530-Q531 were not issued.

**One applied value differs from its approved description.** Q465's Final row says *`closes-when`
unchanged (empty)*, but at `988ef5f` and on this tree its `closes-when` holds *a document stating the
membership ...* — the only one of the 49 where an *unchanged (empty)* row is not empty. `apply.mjs`
applied **unchanged**, the approved operation, and printed the mismatch (`apply.log`). It is a closing
condition, not a reopening trigger, so calibration 9 does not forbid it; but Q465 is now the one
`icebox` question in the register with a non-empty `closes-when` (148 iceboxed before this item, all
empty). Recorded here for the coordinator, not altered.

**How it ran.** The reader returned **AGREE 45, DISPUTE 4 (Q448, Q461, Q470, Q482), CHANGE 0**; the
maintainer approved taking all four. **1 of the 2 proposed resolves was overturned** (Q461, to defer;
W123: 5 of 10; W124: 1 of 5; W125: 0 of 3). **P29 prediction 3 held**: the reader disputed four
verdicts. **The band label was exact**: Q439 and Q511 are positions 151 and 199.

**Gate — what ran.** Each run redirected, with `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| reader report | done | 49 rows: AGREE 45, DISPUTE 4, CHANGE 0 |
| maintainer approval | done | 2026-10-06, *"Approve, taking reader's"* |
| keeps round | done | 5 rows; 2026-10-06, *"Accept all recs"*: 4 kept, Q460 → icebox, none against its recommendation; and the Q488 fixture, *"Apply now, W127 fixes"* |
| `edit-item.mjs` | EXIT 0 | `edit.log`: the five answers and the fixture answer, Q460's Final row, `K` on the four keeps, Q488's row un-held, the table marked final |
| `tally.mjs` | EXIT 0 | `tally.log`: worksheet 6/5/32/2/4/0, final 4/7/34/1/3/0 (keep/defer/icebox/resolve/duplicate/obsolete), each 49 rows over the 49 ids |
| `apply.mjs` | EXIT 0 | `apply.log`: 49 questions, 0 ADRs; a dry run first (`dry.log`, EXIT 0 on its second run — the first stopped at Q465's mismatch above, before any write) |
| name-status M/A only | EXIT 0 | `ns.log`: 49 `M`, no `A`, `D` or `R` |
| `check:register` | EXIT 0 | `reg.log`: R8 compared 26 pairings (W125's 26, no ADR edited) and excused 1 (Q466 → ADR 0077) |
| `check:markdown` | EXIT 0 | `md.log` |
| `check:markdown:selftest` | EXIT 0 | `mds.log`: 42/42 probes caught, 41/41 noticed, 7/7 bounded. Its `q488.md` and `q490.md` probes anchor on text no verdict here changed |
| stamp count | EXIT 0, **49** | `n.log`: 49 declared, no re-stamp |
| `npm run state` (not a gate clause) | **EXIT 1**, known | `state.log`: *questions reading `open`: 23, and the floor is 200*. Not caused by W126 (below) |
| `git diff --name-only` against Owns | in Owns | `names.log`, 50: the 49 owned question files and this file. No ADR, no `q530.md`-`q531.md` |
| own-id and withdrawn-claim grep, excluding `dev-dist/` | clean | `own.log`: `W126` outside this file and `doc/questions/` is in P29 (its batch list and index row) and W122-W125's files (forward references). The Approval's *keep 5 / icebox 33* is now labelled the approval-time count; no *pending* marker or *NOT applied* hold remains on a row to apply |

*Re-run after this Record was written, on the final tree:* `tally`, name-status (49 `M`),
`check:register`, `check:markdown`, `check:markdown:selftest` (42/42) and the stamp count (49), each
EXIT 0 (`*2.log`); `names2.log` 50. No CR in any edited file, and no relative link in this one.

*Not run*: `npm run gate` and `gate:full` — no rung's input changed (P29 prediction 1), and the gate
declares neither. `check:register:selftest` is not in this item's gate and was not run.

**What broke — red, known, and owned by W127, not by this item.** The coordinator's diagnosis,
2026-10-06: **`check:register:selftest` has been RED since W121**, independently of W126. **META**
since `81ed979` (W121): its mutant *icebox removed from the vocabulary* now fails on the real tree,
because 148 questions were already iceboxed and `MAX_CORPUS = 0`. **STATE** since `9ad2345` (W123):
`scripts/state.mjs:335` sets a floor of `open` >= 200, so `npm run state` itself EXITs 1 — measured
here at 23 open after this item. The maintainer assigned both fixes to W127, adding `state.mjs` to
W127's Owns, so **P29 prediction 6 is reversed**. **This item adds a third cause**: applying Q488's
duplicate moves the fixture `check-register-selftest.mjs` anchors on (`status: open`, `note: ""`,
`resolved-by: ""`; line 128's comment still calls Q488 *open*), so those probes abort under rule 7
(b) until **W127 re-points the fixtures that anchor on live questions** — Q488 and Q490 in
`check-register-selftest.mjs` and `check-markdown-selftest.mjs`, and any other — by the maintainer's
*"Apply now, W127 fixes"*. Q476's resolve rests on that STATE pass; its red is the observer working.

**Dependencies.** Q486 is `icebox`, not closed, so W124's stamps on Q242, Q253, Q317 and Q323 still
name a question that exists. Q407 stays `deferred`: Q471 is now its duplicate and Q492 a defer
waiting on it, consistent with W125's note. `CLAUDE.md`'s *No document names the always-read set ...
Q465* and `doc/workflow.md`'s ledger citations of Q486 and Q489 stay true (all three `icebox`);
recorded here, not edited there (P29 prediction 5).

**For whoever takes the keeps** — bundles (calibration 24): **Q439 and Q454 with W125's Q430, one
commit to `scripts/check-docs-selftest.mjs`**; **Q484's commit closes Q488**, its duplicate; Q490
stands alone. Q460, now iceboxed, can still ride Q337's commit.

**For a later item, outside P29** (calibration 21). `scripts/check-register-selftest.mjs:128` at
`988ef5f` calls Q488 *open with an empty note* — W127's fixture re-point. No other code names Q442,
Q471, Q476 or Q488.

**Questions raised: none.** Q530 and Q531 were not issued: they are skipped, never reissued.

**What this taught** — the calibration for W127 and the retro:

1. **A fixture anchored on a live question is a P29 hazard**: a batch's verdict can move it, and the self-test fails in `gate:full`, not in the batch's gate. Name every such anchor before a batch's apply.
2. **The batches' own edits turned `check:register:selftest` and `npm run state` red from W121 and W123**, and no batch gate ran either: a floor tuned to the register's size breaks when a plan moves that size on purpose.
3. **An approved field description can contradict the tree** (Q465's *unchanged (empty)*): the apply script should apply the operation, report the mismatch, and never make a value fit the description.
4. **The keeps round followed every recommendation for the third batch running**, and a latent, never-occurred defect went to icebox (Q460), as Q420 did at W125.
5. **Resolves overturned: 1 of 2** (Q461, on calibration 17's *current arrangement*).
