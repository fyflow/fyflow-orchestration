# W125 — B5: a verdict for each of the third 50 open questions in the verification-and-fixtures cluster, Q326-Q438

**Status:** done — the 50 approved verdicts applied on 2026-10-06 after the keeps round (*"Accept all recs"*: five keeps, Q420 to icebox), ADR 0073's `resolves` gained Q438, no question raised, and every gate clause EXIT 0; see the Record
**Plan:** P29, `doc/plans/p29-which-open-questions-still-matter.md`

*This file carries NO relative link, deliberately* (calibration 16). W123 was the 120th linking
document in `check-markdown`'s second `removes` probe tree (`doc/decisions` and `doc/plans` cut),
which is `M4`'s floor of 120, so a linking document here crosses it: the probe would report
`wanted [M1,M3,M4,M5], got [M1,M3,M5]` and `check:markdown:selftest` would exit 1 while
`check:markdown` stays green. That is Q142's mechanism (kept at W123), and retuning
`scripts/check-markdown.mjs` is outside this item. Ids and paths are written as bare text.

```
Spec:       none — P29 decisions 1-5, and doc/questions/README.md's format
Owns:       the 50 question files listed below; this item's own question files, q527.md-q529.md;
            and the `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit; the calibration of W121-W124 (below)
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the keeps round: one stop-and-ask per row still `keep` after (3), each with a
                recommendation and a plain-language briefing, and the maintainer's answer
            (5) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (6) the calibration this batch adds, recorded in this item's Record for the
                coordinator to hand to W126's declaration
Depends on: W124
Blocks:     W126
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; the keeps round answered; `git diff --name-status
            -- doc/questions/` M/A only; check:register, check:markdown, check:markdown:selftest
            EXIT 0; the stamp count, `npm run q -- --include-icebox --where "note~P29 W125"
            --count`, equals 50 plus every re-stamp declared under Exceptions (none at declaration)
Reserves:   Q527-Q529 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W125
```

Q527-Q529 are spare at declaration; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W125 never edits W121's, W122's,
W123's, W124's or W126's file. **A re-stamp of an earlier batch's question** (calibration 10) is added
here, with the maintainer's answer that causes it, before it is applied, and the gate's stamp count
gains one for each.

## The item's ids, from the lookup at `988ef5f`

**50 questions**: the open questions in *Verification and fixtures*, sorted by id, positions 101-150
of the 199 (P29: the bands are cut at the 50th, 100th and 150th). The cluster holds no deferred
question at `988ef5f`.

**P29's index row labels this band "Q326-Q438", and here the label is exact**: Q326 is position 101
and Q438 position 150, both open in this cluster. Filtering the open cluster to ids in Q326..Q438
selects exactly these 50. The band is disjoint from W123's (Q44-Q189) and W124's (Q191-Q325) by
bound, and a comparison against both files' id columns found 0 shared ids.

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`
(`scripts/lookup.mjs` imports only `node:` modules):

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w125d-44671
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --count       # 199, EXIT 0
node scripts/lookup.mjs q --where status=deferred --where "cluster=Verification and fixtures" --count   # no question matches, EXIT 1
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --fields id   # 199 ids, EXIT 0
# sorted numerically: the 100th is Q325, the 101st Q326; the 150th Q438, the 151st Q439
node scripts/lookup.mjs q Q326 --fields id,status,cluster                                # open, Verification and fixtures
node scripts/lookup.mjs q Q438 --fields id,status,cluster                                # open, Verification and fixtures
# positions 101-150: 50 ids, all within Q326-Q438; ids in 326..438: 50; shared with W123's or W124's list: 0
cd .. && find base -type l | wc -l                                                       # 0
# and gci -Recurse -Force -Attributes ReparsePoint over base: 0; then the copy was removed (EXIT 0)
```

| cluster | ids | n |
|---|---|---|
| Verification and fixtures, positions 101-150 | Q326, Q327, Q333, Q335, Q337, Q338, Q339, Q340, Q341, Q342, Q343, Q345, Q346, Q347, Q348, Q349, Q350, Q351, Q352, Q356, Q359, Q360, Q361, Q362, Q367, Q373, Q377, Q378, Q382, Q392, Q395, Q401, Q405, Q406, Q407, Q410, Q411, Q420, Q425, Q427, Q428, Q429, Q430, Q431, Q433, Q434, Q435, Q436, Q437, Q438 | 50 |

**The 50 owned files**, under `doc/questions/`: `q326.md`, `q327.md`, `q333.md`, `q335.md`,
`q337.md`, `q338.md`, `q339.md`, `q340.md`, `q341.md`, `q342.md`, `q343.md`, `q345.md`, `q346.md`,
`q347.md`, `q348.md`, `q349.md`, `q350.md`, `q351.md`, `q352.md`, `q356.md`, `q359.md`, `q360.md`,
`q361.md`, `q362.md`, `q367.md`, `q373.md`, `q377.md`, `q378.md`, `q382.md`, `q392.md`, `q395.md`,
`q401.md`, `q405.md`, `q406.md`, `q407.md`, `q410.md`, `q411.md`, `q420.md`, `q425.md`, `q427.md`,
`q428.md`, `q429.md`, `q430.md`, `q431.md`, `q433.md`, `q434.md`, `q435.md`, `q436.md`, `q437.md`,
`q438.md`.

## Dependencies

- **A duplicate's target** stays in this batch or an earlier one (calibration 4). W126 holds the
  other 49 *Verification and fixtures* questions (Q439 onward, Q486 among them), so a duplicate of
  any of them is not available here; such a row is a defer or a keep naming the later question in
  `note`. A target in W121-W124's bands is available only if it stayed `open`, `deferred` or `icebox`
  there — not one that batch resolved.
- **A question of an earlier batch whose stamp names a question in this band** is not in `Owns`. If
  an approved verdict here fires or empties its trigger, the Record says so and the coordinator
  decides; a re-stamp is declared under Exceptions first (calibration 10).
- **Q427 and Q433 are cited by `doc/workflow.md` section 8**, a file P29 does not edit (prediction 5).
  A verdict on either changes only the question file; if it makes section 8's sentence stale, the
  Record says so (calibration 21).

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W125: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. A question raised from Q527-Q529, as `doc/questions/README.md` says to raise one, only if the
   batch finds one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/`,
  `test/` or `scripts/` changes; a question whose answer is *decide now* is a keep with a
  `closes-when` naming the decision (decision 3). **A process question asking for a check that does
  not exist is not answered by building it here**, and a cheap fix kept under calibration 19 lands,
  if the maintainer decides it, as its own commit outside P29.
- **Every question outside the 50**, including W123's and W124's bands (done) and Q439-Q511's
  verification questions (W126).
- **Q494** (W127) and **Q499** (stays deferred).
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **A stale comment in `examples/`, `scripts/`, `src/` or `test/`** naming a question this batch
  closes: recorded, not fixed (calibration 21).
- **The sibling repository.** Nothing is written there.

## Calibration

**From W121's pilot and W122-W124's runs** (P29 decision 5: written into this declaration, not
retrofitted). Each clause binds the proposer, the reader and the apply unit.

1. **A keep's `closes-when` is a CLOSING condition**: an event or decision that would ANSWER the
   question. A *"reopen if X"* trigger is not one. A row whose only condition is such a trigger is a
   **defer**, with X in `note` and `closes-when` cleared. *W121: Q241, Q354, Q357 and Q249.*
2. **Be aggressive** — the maintainer's words: *"more aggressive in iceboxing and deferring"*. Prefer
   **icebox** (a what-if with no consumer) or **defer** (waiting on a named thing) over keep. **Keep
   only when the decision is nameable and someone will plausibly make it soon** — and see clause 19.
3. **The keeps round.** After the approval, every row still `keep` goes to the maintainer in a
   per-question stop-and-ask (keep / defer / icebox / resolve), **with a recommendation first**. It
   comes with a **PLAIN-LANGUAGE BRIEFING**: every rule or clause id expanded into what it says, a
   concrete example, and what each verdict would mean in practice. **Terse one-liners were rejected
   at W121.** *W121: 13 rows went to the round and 4 stayed keep; W122: 3 and 3; W123: 2 and 1, with
   a third decided at the approval; W124: 3 and 3, one over the briefer's defer recommendation.*
4. **A duplicate points at a question that stays** (not resolved) **in its own batch or an earlier
   one, never at a later batch's question** (here: never at W126's). *W121: Q386 → Q9 crossed into
   W122 and became a defer.*
5. **The decision-text test.** If the deciding ADR, spec or plan text still calls the matter pending
   (*"for now"*, *"is Q<n>"*, *"stays open"*), the row is keep or defer. If the text decides or refuses
   by name with a permanent reason, it is resolve. *W121: Q30 and Q28 pend and were deferred; Q38's
   P23 decision 10 refuses by name and was resolved.*
6. **The row-count check.** The proposer and the reader each confirm that **worksheet rows == the
   id count (50)**, with no missing and no extra id, and that **their tallies are counted from their
   tables**, not carried. *W121's proposer omitted Q103's row and the reader did not notice.*
7. **Check the LAST text that speaks to the question.** A later plan's Record may say *"stays open"*
   after an ADR that looks decisive (W122: Q387, resolve → icebox), or may decide by name what a
   worksheet deferred (W122: Q87, defer → resolve). Search the plans, items and ADRs after the one
   first found.
8. **A `resolved-by` that names an ADR requires that ADR's `resolves` to list the question (R8,
   which reads `resolved-by` whatever the verdict).** If the ADR does not decide the question, the
   ADR is cited in `note`, not in `resolved-by`. *W122: Q87; W123: Q176; W124: ADRs 0044, 0046, 0052,
   0058 and 0060 all cited in `note` only.*
9. **Every row states `closes-when` explicitly**: the new value, *unchanged*, or *cleared*. **A
   resolved, deferred or iceboxed question carries no reopening trigger in `closes-when`; the trigger
   goes in `note`.** *W122: Q190 and Q201 were applied `resolved` with their old triggers still in
   `closes-when`, and were cleared after the gate.*
10. **A re-stamp of an earlier batch's question adds to the stamp count**, because it carries the
    same `P29 W125` prefix. It is declared in the gate and the Exceptions before it is applied.
    *W122: Q386, 70 + 1 = 71.*
11. **The approval's figures are counted from the table by script**, the question put to the
    maintainer included. *W122: a coordinator's hand count reached the maintainer; the rows approved
    were right and the figures were not.*
12. **A resolve citing a general rule needs the files the question NAMES to actually be under that
    rule.** A rule in `doc/workflow.md` that would answer the question is not a resolution if the
    script or self-test the question names was never brought under it. *W123: Q151 and Q153; W124:
    Q198's vacuity half, where rule 8 (d) binds each item's set and not `examples/l6.ts`'s bound.*
13. **A duplicate needs the same QUESTION, not the same mechanism.** Two questions about one
    variable or one check can ask different things. *W123: Q145 is not Q150.*
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
    undid by taking the self-tests off the local gate.*
18. **Re-read the latest decision text for icebox rows too**, not only for resolves. An icebox whose
    last text says *"stays open"* or names a waited-on event is a defer. *W124: Q252, where ADR 0052
    consequence 4 says Q252 stays open, turned out to be a defer.*
19. **A cheap, concrete fix outside the plan's scope is a keep, not an icebox.** Being in no item's
    `Owns` does not mean the question has no consumer, and decision 3 forbids fixing it here, not
    deciding it. The `closes-when` names the decision and the one commit outside P29 that would land
    it. *W124: Q235 (`.gitignore`) and Q272 (`test/runner.ts`); the maintainer kept all three of
    W124's keeps, Q283 over the briefer's defer recommendation, so a cheap concrete fix is valued as
    a keep.* Clause 2 still governs everything that is not cheap and concrete.
20. **After a resumed or interrupted propose, a script checks the worksheet for duplicate rows**
    (and for missing and extra ids, clause 6) before the reader starts. *W124: an API outage
    interrupted the propose mid-worksheet; the resumed table was counted by script, none twice.*
21. **A stale comment naming a question this batch closes is noted in the Record, not fixed** —
    collected under a *for a later item* heading with its path and line at `988ef5f`, for one later
    item outside P29. *W124: `examples/l6.ts:9484-9505` still calls Q216 a declared limit.*

**A resolve is where a proposal overreaches.** W123's reader overturned **5 of its 10 proposed
resolves**, and W124's **1 of 5** (Q198, to icebox). **So the proposer re-derives each resolve's
cited mechanism before proposing it**: it opens the cited clause, script line or Record row at
`988ef5f`, confirms it decides THIS question for the files the question names (clauses 5, 7, 12, 15
and 17), and states that check in the row's evidence. A resolve that fails it is proposed as icebox
or defer.

**This band (B5)** — W123's and W124's process-band note, carried. These are **PROCESS questions** —
about checks, probes, floors, self-tests, harnesses and the method — not about the library. For each
row the evidence states:

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
passed it by — unless it is cheap and concrete (clause 19). **Refusal-ledger proposals**
(`doc/workflow.md`'s ledger: a check over `doc/`, `check-owns.mjs`, the dated-ceiling hand-off, and
the rest) are not re-argued: a question that is one of them is resolved or iceboxed citing the ledger
row, never kept. **This band sits closest to P27 and P28** (W112-W120), so its questions are the most
likely to be answered by an item that is still recent; read those items' Records first. Nothing is
read from the working tree: every subject is taken at `988ef5f`.

## The phases

P29 decision 4, with the keeps round the calibration adds. A phase does not start before the one
above it is complete.

1. **Propose.** Fill the worksheet: one row per question, 50 rows. The evidence is (a) the
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
   first and the plain-language briefing calibration 3 requires. **Nothing is applied before each is
   answered.**
5. **Apply.** The approved rows' fields and the ADRs' `resolves`, by a script that re-tallies the
   final table before writing and refuses any other figure.
6. **Record.** After the gate below, with the tree still.

### Worksheet

*Filled in at phase 1.* The evidence cell holds three parts: **refs** (the count), **subject** (path,
or grep pattern and hit count, at `988ef5f`), **answered by** (ADR, P or W id, or none). The last
cell states `closes-when` in every row. **50 rows.**

*How the evidence was taken (phase 1, the propose unit).* **refs** is `node scripts/lookup.mjs refs Q<n>`
run in a `git archive` of `988ef5f` (`dev-dist/w125p-44767/base`, 0 links, EXIT 0 for 49 and EXIT 1 for
Q361, which prints `no citing file matches`), given as *files / mentions*. **subject** is
`git grep -c -F '<pattern>' 988ef5f -- <paths>` (or `-E` where the pattern says so), summed over files,
or a `git show 988ef5f:<path>` line; a pattern with 0 hits is said to be absent. Each question's long
body was read from `git show b665981:doc/open-questions.md`, whose table row carries it for all 50; at
`988ef5f` that file is 786 bytes with 0 rows. Nothing was read from the working tree, and
`doc/workflow.md` is byte-identical between `988ef5f` and this tree. The last text that speaks to each
question was found by reading every plan, item and ADR among its citing files, highest-numbered first
(calibration 7). Every resolve and obsolete row states the re-derivation the calibration's closing line
requires. Every row states `closes-when` (calibration 9): nine carried a reopening trigger (Q346-Q352,
Q356, Q359) and Q407 a condition, and each of the ten is cleared with its text moved to `note`. `owner`
is unchanged in every row.

**Proposal summary: 50 rows — keep 5, defer 1, icebox 40, resolve 3, duplicate 0, obsolete 1**,
counted from the table below by script (`dev-dist/w125p-44767/tally.mjs`), which also confirmed 50 rows
over exactly the 50 ids, none missing, none extra, none twice. Keep: Q337, Q420, Q430, Q434, Q437, each
a cheap concrete fix (calibration 19). Defer: Q407. Resolves: Q362, Q431, Q438. Obsolete: Q343. **One `resolved-by` names an ADR: Q438's names ADR 0073, whose `resolves` is
empty at `988ef5f` and gains Q438 (R8).** ADR 0070 (Q373, Q431, Q435), ADR 0062 (Q406), ADR 0078 (Q407)
and ADR 0072 (Q437) are cited in `note` only (calibration 8). No duplicate is proposed: Q436 names Q178
and Q341 names Q310 as their earlier forms, and both ask something the earlier question does not
(calibration 13); W126's Q486 and Q492 are named in notes, never targeted (calibration 4). No earlier
batch's stamp is fired or emptied by a row here, so there is no re-stamp and the gate's stamp count
stays 50. **Two resolve candidates were re-derived and proposed as icebox instead**: Q340 (P22's Retro
(vi) calls it the same shape as Q362, but its own open half asks for a rule over a RELATION, which no
clause names) and Q352 (P22's Retro (iv) rests on P15 decision 5 and on P22's own stop-and-ask (a), a
plan-local arrangement whose ground can move — calibration 17).

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q326 | icebox | **refs** 4 / 6 (P20, P21, W78, W81). **subject** a size-prediction unit in `doc/workflow.md`: `lines added` 0, `code lines` 0. **answered by** none: P20's Retro (prediction 4, *NEITHER, a fourth shape*) and P21's Retro (prediction 4, *the SECOND occurrence of Q326's class*) each recorded it and adopted nothing; the row's own owner is P20's retro | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — a size prediction naming its count (code or raw lines); P20's and P21's retros each recorded an instance and adopted no wording, and no plan since has predicted a line count` |
| Q327 | icebox | **refs** 4 / 8 (P20, P21, P25, W78). **subject** `doc/workflow.md` section 5 rule 8's harness rows (v0.11, v0.14, v0.17, v0.19, v0.24) still read *on the HARNESS* of a provocation set: `any harness whose output is a measurement` 0. **answered by** none: P25's Retro cites it twice (Q425 as *its class by a THIRD mechanism*) and widens nothing; P20's retro, its named judge, passed it | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the harness requirements stay written for provocation sets; P20's retro and P25's, which cited it twice, widened nothing, and a process-tree kill has had no taker` |
| Q333 | icebox | **refs** 2 / 2 (P21, W80). **subject** `a control must fail where its claim is **VACUOUS**` in `doc/workflow.md`: 1 (obligation (d), v0.21) — no second shape (*assert each arm against a LITERAL*) is written beside it. **answered by** none since W80 | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the literal-per-arm shape W80 used for freshly built operands is not written beside rule 8 (d)'s v0.21 clause, and no item since W80 has met the case` |
| Q335 | icebox | **refs** 5 / 8 (AGENTS.md, P21, W81, examples/README.md, examples/l6.ts). **subject** `examples/settlement-cost.ts` exists; its magnitude is asserted nowhere, only two directions and two counts (W81). **answered by** none: the row's own *against* (ADR 0060 decision 1 unmoved, every figure carries its value size); AGENTS.md and examples/ cite it as a stated limit, which stays true | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — no product cost is asserted as a magnitude, so a ratio's runtime spread decides nothing; the citations in AGENTS.md and examples/ stay accurate` |
| Q337 | keep | **refs** 1 / 2 (W81). **subject** `scripts/check-markdown.mjs` lines 337-341: the walk is `doc/`, `spec/` and `README.md`, `AGENTS.md`, `CLAUDE.md`; `join(SCAN_ROOT, 'examples'` 0 — `examples/README.md` is still read by no check. **answered by** none. A one-line widening, with `M3`-`M5`'s floors re-tuned, which is Q142's shape (kept at W123) | `closes-when` **set**: `the maintainer decides whether check-markdown.mjs's walk gains examples/ (one line, with the M3-M5 floors re-taken), as one commit outside P29, or that examples/README.md stays unchecked by choice`; note stamp `P29 W125: keep — a cheap concrete fix (calibration 19); examples/README.md is still outside the walk at 988ef5f, and Q142 holds the floor half` |
| Q338 | icebox | **refs** 1 / 2 (W81). **subject** `examples/retention.ts` and `examples/settlement-cost.ts` both exist, neither a gate entry. **answered by** none: the row's own force-condition (*a THIRD such file, or one rotting*) has not occurred in the citing record, and its *against* (both are L0-covered and print a FAIL banner) stands | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — two checked-in measurements bound differently, recorded at W81; reopen on a third such file or on one rotting between the item that wrote it and the item that reads it` |
| Q339 | icebox | **refs** 2 / 4 (P21, W81). **subject** `***independent*** excludes the first's apparatus` in `doc/workflow.md`: 1 (rule 8 (c), v0.16, P15), which states the general half; `test/driver/result-schema-cost.test.ts` and `examples/settlement-cost.ts` both exist and still share the `get type()` instrument. **answered by** none for the instance: its fix needs a seam `src/` does not have, and its *against* (a shared instrument cancels out of a difference) stands | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the general half is rule 8 (c)'s v0.16 amendment (independent excludes the first's apparatus); the instance's second expression needs a src/ seam nobody has asked for` |
| Q340 | icebox | **refs** 4 / 7 (P21, P22, W81, W82). **subject** `count the observers` in `doc/workflow.md`: 1 (rule 8 (c) LIMIT). **answered by** P22's Retro (vi) calls Q362 *Q340's shape at W82* and says *both times the existing clause is what the repair quoted*. **Re-derived, and NOT proposed as resolve**: the row's open half asks whether a rule can be written for corroboration by a RELATION the source has and the report does not (the walk's REACH); (vi) answers the counting half and names no such rule | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — P22's Retro (vi) files the counting half under rule 8 (c)'s LIMIT; a rule for corroborating a callback by a relation of its source was asked once, at W82, and taken by no item` |
| Q341 | icebox | **refs** 1 / 2 (W82). **subject** `if (false)` in `scripts/check-docs.mjs`: 3 — `X4`'s named shape is still the only one. **answered by** none: Q310, the general form (an executed snippet's guards tautologise at `check:docs` EXIT 0), was iceboxed at W124; this row adds the crash-bought ceiling, which rule 8's v0.24 grader control (a CRASH probe on every pass) now names for item sets | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — Q310's class at its second plan (Q310 iceboxed at W124); the crash-as-ceiling half is what rule 8's v0.24 grader control covers for an item's set` |
| Q342 | icebox | **refs** 10 / 19. **subject** `CONTROL_LINES = [` in `scripts/check-workers-selftest.mjs`: 1, now pinning *21 worker(s)*; `14 unchecked over 30 flows` in `test/definition/wiring.test.ts`: 1 — both still literals. **answered by** the refusal ledger row `**A corpus census pinned as a LITERAL outside its corpus**` in `doc/workflow.md`: 1 (twice, P21-P22). P22's Retro (vii): *the rungs already buy the detection* — a ground that is an arrangement, so icebox, not resolve (calibration 17) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the refusal ledger's corpus-census row (refused twice, P21-P22, because every site was named by a rung that fired); P23 and P24 seeded the sites in their exceptions tables instead` |
| Q343 | obsolete | **refs** 8 / 12 (P21, P22, P23, W82, W104, W108, W110, W113). **subject** `^[\|] Q[0-9]+ [\|]` (`-E`) in `doc/open-questions.md`: **0 at `988ef5f`** — the file is a 786-byte pointer; the multi-line register row and the census parser that met it are gone. `M7 / M8 LEFT at W116` in `scripts/check-markdown.mjs`: 1. **answered by** W116. **Re-derived**: the later citations (P23, W104, W108, W110, W113) are census lists naming Q343's own malformed row, not a live parser; counts are derived by `npm run q` from front matter | `closes-when` unchanged (empty); `resolved-by`: obsolete: W116 replaced the single-file register, whose multi-line rows a census parser had to absorb, by one file per question with front matter that npm run q reads (P28 decision 1); note stamp `P29 W125: obsolete — the register's table rows and their census parsers went at W116` |
| Q345 | icebox | **refs** 4 / 9 (P22 6, P23, W86). **subject** `NTFS` or `colon` as a path guard in `scripts/`, `doc/decisions/`, `CLAUDE.md`: 0 (the only `colon` hits are YAML values in `check-register*.mjs`). **answered by** none: P22's declaration raised it with no owner, and no plan since cites it as live | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — a harness filename built from a rung name containing a colon; raised by P22's declaration with no owner, met once, and guarded by nothing since` |
| Q346 | icebox | **refs** 3 / 8 (P22, W84, W86). **subject** `Record<string, Record<string, RegionRun>>` in `src/`: 3 — still the one two-level record. **answered by** none: P22's Retro records prediction 1 as reversed and adopts nothing; its trigger has not fired | `closes-when` **cleared** (was a trigger, *a second nesting, or a change whose L1-L5 half a run does not reach*); note stamp `P29 W125: icebox — one type constructor, one two-level record; reopen on a second nesting or a change whose L1-L5 half a run does not reach` |
| Q347 | icebox | **refs** 2 / 3 (P22, W84). **subject** `arrivals: Map<string, Map<string` in `test/` and `examples/`: 3 — the restating casts remain, by W53's deliberate choice. **answered by** none | `closes-when` **cleared** (was a trigger, *a third, or one where the wrong count is not asserted*); note stamp `P29 W125: icebox — the restating cast is W53's deliberate reach; reopen on a third occurrence, or one where the wrong count is not asserted` |
| Q348 | icebox | **refs** 6 / 15. **subject** the refusal ledger's row *An Owns pre-declaration rule / check-owns.mjs* in `doc/workflow.md`: 1 (13 refusals, P2-P26). **answered by** P22's Retro (iii): every item corrected its own `Gate` column at its declaration step, zero shipped red; W86's Gate line named `check:docs` from the start *which is Q348*; P23 seeded the AGENTS.md site for W88 | `closes-when` **cleared** (was a trigger, *an item whose Gate line omits the rung that would have caught a real defect*); note stamp `P29 W125: icebox — the Owns half is the refusal ledger's row; the Gate-line half is corrected at each declaration step (P22's Retro (iii)); reopen on an item whose Gate line omits the rung that would have caught a real defect` |
| Q349 | icebox | **refs** 8 / 20 (P22, W84, W85, W86, W97, examples/l6.ts, two tests). **subject** the interleaving is checked in: Q349 is cited by `test/driver/nested-regions.test.ts`, `test/driver/retention.test.ts` and an `examples/l6.ts` cross-row clause (*perShard@0 was STILL HOLDING*). **answered by** W85 and W86 (the instance), none for the rule | `closes-when` **cleared** (was a trigger, *a second structure whose lifetime hides its own key*); note stamp `P29 W125: icebox — the instance is bound by a checked-in interleaving at L1-L5 and L6; reopen on a second structure whose lifetime hides its own key` |
| Q350 | icebox | **refs** 3 / 4 (W84, W85, W86). **subject** `RN-R6` in `spec/`: 8; the row's own *against*: `spec/join-policy.md` v0.17 carries the scope note. **answered by** none for a rule | `closes-when` **cleared** (was a trigger, *a second rule widened into a red rung for a reason its own text already implies*); note stamp `P29 W125: icebox — RN-R6's scope is noted in spec/join-policy.md since v0.17; reopen on a second rule widened into a red rung for a reason its own text implies` |
| Q351 | icebox | **refs** 3 / 4 (P22, W84, W86). **subject** a prose membership binding: none exists, and the row's own *against* is the refusal ledger's first row, *A check over doc/*, in `doc/workflow.md`: 1 (27 refusals, P2-P28). **answered by** none | `closes-when` **cleared** (was a trigger, *a prose enumeration going stale in a direction a measurement depends on*); note stamp `P29 W125: icebox — binding a prose list both ways is the refusal ledger's doc/-check row; reopen on a prose enumeration going stale in a direction a measurement depends on` |
| Q352 | icebox | **refs** 3 / 8 (P22, W85, W86). **subject** the proposed rule (a declaration re-takes an inherited gap site by site) is not in `doc/workflow.md`. **answered by** P22's Retro (iv), refused because P15 decision 5 and P22's own stop-and-ask (a) made a re-take the only road. **Re-derived, and NOT proposed as resolve**: (iv)'s ground is a plan-local arrangement, which can move (calibration 17) | `closes-when` **cleared** (was a trigger, *a second plan whose fact names a class an item then measures with a different membership*); note stamp `P29 W125: icebox — P22's Retro (iv) refused a rule because the re-take already found it; reopen on a second plan whose fact names a class an item measures with a different membership` |
| Q356 | icebox | **refs** 2 / 4 (P22, W85). **subject** `DECLARED_CASES = ` in `test/`: 6 — case-level memberships exist in the files that needed them. **answered by** P22's Retro (v): one occurrence, Q217's regress one layer in (Q217 iceboxed at W124) | `closes-when` **cleared** (was a trigger, *a third file shipping a whole item's output with no case-level membership*); note stamp `P29 W125: icebox — P22's Retro (v) recorded one occurrence; reopen on a third file shipping a whole item's output with no case-level membership` |
| Q359 | icebox | **refs** 2 / 7 (P22, W86). **subject** the instance is fixed in `examples/run-flow.ts` (per-INSTANCE sampling, W86). **answered by** none for a rule: *nothing at one occurrence* is the row's own verdict | `closes-when` **cleared** (was a trigger, *a second flatten whose justification and whose use are about different dimensions*); note stamp `P29 W125: icebox — one occurrence, fixed in place at W86; reopen on a second flatten whose justification and whose use are about different dimensions` |
| Q360 | icebox | **refs** 7 / 13 (P22, P23, P24, W86, W92, W94, W110). **subject** the refusal ledger's rows *An Owns pre-declaration rule / check-owns.mjs* (1) and *A corpus census pinned as a LITERAL outside its corpus* (1) in `doc/workflow.md`. **answered by** both rows: the row's own *against* names its rule an `Owns` pre-declaration rule; P23 and P24 seeded both censuses in their exceptions tables, and both fired as seeded at W94 | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — declaring the censuses in advance is the refusal ledger's Owns pre-declaration row; P23 and P24 seeded them as table rows instead, and they fired as seeded` |
| Q361 | icebox | **refs** 0 / 0 (lookup EXIT 1). **subject** `fail('X9'` in `scripts/check-docs.mjs`: 4 — the README-to-manifest half is closed by `X9`. The open half (the version in `AGENTS.md`, `spec/runtime-targets.md` and README paragraphs about earlier releases) is prose. **answered by** `X9` (W86) for its half; nothing for the rest | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — X9 holds README's sentence and both manifests; the other occurrences are sentences about versions, and no item since W86 has asked for them to be compared` |
| Q362 | resolve | **refs** 2 / 3 (P22, W86). **subject** `count the observers` (1) and `***independent*** excludes the first's apparatus` (1) in `doc/workflow.md` — rule 8 (c)'s LIMIT (v0.13) and its v0.16 amendment. **answered by** P22's Retro (vi), *A rule for Q362*: refused because *obligation (c)'s LIMIT already says count the observers, and v0.16 says the second must not be downstream of the first's apparatus; three projections of one walk are one apparatus read three times*, recorded as *counting observers means counting DERIVATIONS*. **Re-derived**: the row's proposed rule (the membership names the derivation) is the one (vi) refuses by name, because the clause exists; the row's own *against* says the same; the clause binds every rule 8 set, the scope the question names; no later text reopens it | `closes-when` unchanged (empty); `resolved-by`: doc/workflow.md section 5 rule 8 obligation (c), its LIMIT (v0.13: count the observers) and its independent amendment (v0.16: excludes the first's apparatus), as P22's Retro (vi) reads them for this row: counting observers means counting derivations. No ADR, so no R8 edit; note stamp `P29 W125: resolve` |
| Q367 | icebox | **refs** 2 / 5 (W88, W89). **subject** `function deepEqual` in `test/harness.ts`: 1; `getPrototypeOf` in `test/harness.ts`: 0 — still blind to prototypes. **answered by** none: the row's own *against* (a stricter `equal` re-judges every clone-to-literal assertion, measured nowhere); W88 and W54 use local comparators where it bites | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — test/harness.ts's deepEqual still ignores prototypes; the suites that need it carry local comparators, and the cost of a stricter equal was never measured` |
| Q373 | icebox | **refs** 4 / 6 (W89, W90, W97, W98). **subject** `npm run gate` carries no `selftests` entry since ADR 0070 (`doc/workflow.md` section 8: `gate:full` adds them). **answered by** none for the cause; Q433 (this band, icebox) measures the runner over-committing the machine, the likeliest one; ADR 0070 cited in `note` only | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — ADR 0070 took the self-tests off the local gate; the unexplained wall is Q433's over-commit at its likeliest, and nobody has re-taken it` |
| Q377 | icebox | **refs** 1 / 3 (W90). **subject** `fail('X9'` in `scripts/check-docs.mjs`: 4 (a relation); `fail('D7'` in `scripts/check-scheduler.mjs`: 3 (the scheduler pin). **answered by** none: the row's own *against* (a version is decided by a person at a plan's close; a literal moves the forgetting one file along) is Q102's shape, iceboxed at W123 | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — X9 binds the manifests to each other, not to a value; an absolute anchor is Q102's ratchet (iceboxed at W123), which every release would move` |
| Q378 | icebox | **refs** 3 / 10 (P23 6, P24, W90). **subject** `thrownOnce` in `examples/workers/shared.ts`: 1 — module state still process-wide in an inline worker. **answered by** none: the row's own *against* (the store is the whole contract; nothing the library keeps is process-wide) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — a process-kill harness for L6; the store is the contract and nothing the library keeps is process-wide, and no plan since P24 has asked for one` |
| Q382 | icebox | **refs** 4 / 8 (P24, W92, W93, test/definition/gate.test.ts). **subject** `test\(DECLARED_CASES\[` (`-E`) in `test/`: 17, all in `test/definition/gate.test.ts` — the index form remains. **answered by** none: one occurrence, caught by v0.24's grader, the mechanism the row says is already required | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — one occurrence in one file, caught by rule 8's v0.24 grader; gate.test.ts still names its cases by index` |
| Q392 | icebox | **refs** 3 / 5 (P24, P25, W94). **subject** `examples/l6.ts` imports through the root, deliberately. **answered by** none: the row's own *against* (the revert is a measurement taken once, by hand, and the crash is loud) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — a revert measurement crashing at module link; taken by hand, loud, and asked for by no item since W94` |
| Q395 | icebox | **refs** 3 / 7 (P24, W96, W97). **subject** `fail('X10'` in `scripts/check-docs.mjs`: 6 (`X11` 0, retired at W119 by ADR 0081). **answered by** the refusal ledger's `doc/` row (1, 27 refusals): the row's own *against* — *present tense is English* | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — a clause over present-tense sentences is the refusal ledger's doc/-check row (27 refusals), which the row's own against names` |
| Q401 | icebox | **refs** 5 / 14 (P25, W97, W98, examples/l6.ts, spec/run-state.md). **subject** `doc/workflow.md` rule 8 (f) still reads *delay each worker ... past its peers, and run the other pool mode* (v0.25): no speed-up arm, no *twice*. **answered by** W98 (the first half measured: 47 arrangements both ways, 0 dispatch-order clauses fired); P25 declared the wording half its retro's, and its Retro's (f) entry is *CONFIRMED with a new shape* and does not touch it | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — W98 measured the speed-up half at zero; P25's retro owned the wording and passed it, and the single-green-sample half has had no taker since W98` |
| Q405 | icebox | **refs** 5 / 8 (P25, W97, W98, W99, W100). **subject** `RN-R27` in `spec/`: 3. **answered by** none: the rung asserts the sum and turn count, the labels are bound by constructed sequences; the row's own *against* (a second reachability walk beside `checkWiring`'s) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the over-reach-equals-under-reach case is a declared ceiling; deriving the relation from the definition's graph is a second reachability walk nobody has asked for` |
| Q406 | icebox | **refs** 4 / 6 (P25, W98, W99, W100). **subject** `joinSettled` in `src/`: 8; `RN-R27` in `spec/`: 3. **answered by** none: measured INERT both ways at W98 and declared a ceiling; P25 lists it as not about a route; ADR 0062 (the instance pair) cited in `note` only | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — RN-R27's barrier keyed by regionId alone was measured inert at W98 (ADR 0062 defines the instance pair); reopen on a flow with two instances of one opener whose joins settle in one run with a dispatch between them` |
| Q407 | defer | **refs** 12 / 18 (ADRs 0078, 0079, P25, P27, Q131, Q471, Q492, W98-W100, W113, W116). **subject** `M7 / M8 LEFT at W116` in `scripts/check-markdown.mjs`: 1 — no table clause exists at all at `988ef5f`; `checks` lists `M1`-`M6`. **answered by** none. ADR 0078 decision 4: *widening it to the corpus is Q407 ... what stops it is twenty rows nobody has fixed, not the clause*; P27: *Q407's widening and not the doc/ check's class*. The last text names a waited-on event (calibration 18). W126's Q471 and Q492 name it in `closes-when` | `closes-when` **cleared** (was *a clause over table cell counts, which W113 measured UNAFFORDABLE while 10 documents fire*); note stamp `P29 W125: defer — waits on the twenty content-dropping table rows being fixed (ADR 0078 decision 4, cited in note only); M7 left with the register table at W116, so no table clause exists; Q471 and Q492 (W126) depend on it` |
| Q410 | icebox | **refs** 7 / 17 (AGENTS.md 2, P25, W98-W101, test/definition/gate-session.test.ts). **subject** `export interface WiringVerdict` in `src/definition/wiring.ts`: fields `consumer`, `shape`, `producer`, `through`, `kind`, `why`, `sample` — no `route`. **answered by** W101, which answered it in PROSE (*a verdict carries no route field*, AGENTS.md twice); no consumer has asked for the field | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the missing route field is documented in AGENTS.md and worked around by the refusal's reason (W101); no consumer has asked for the field` |
| Q411 | icebox | **refs** 9 / 11 (P25, W99, W100, W104, W108, W110, W113, src/definition/wiring.ts, test/definition/wiring.test.ts). **subject** `const own = ` in `src/definition/`: 2 local copies (`schema.ts:221`, `wiring.ts:142`); no lint rule (`deno lint` with no `in` restriction); the fifth site is GUARDED by a case in `test/definition/wiring.test.ts`. **answered by** none for a shared mechanism; the row's own *against* (a shared import couples modules that have none) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the known sites are closed and the fifth is guarded by a test; a shared own or a lint rule against in has had no taker since W99` |
| Q420 | keep | **refs** 2 / 7 (P25, W101). **subject** a declaration-label check over `doc/work-items/w*.md`: 0 (`TEMPLATE.md` in `scripts/`: only path lists and placeholders). **answered by** none: P25's Retro refusal 3 sends it *to the MAINTAINER rather than into this refusal*, as the one `doc/` instance that needs no English (a fixed list of eight labels in a fixed file), on W96's precedent | `closes-when` **set**: `the maintainer decides whether a check compares each doc/work-items/w*.md's declaration labels with doc/work-items/TEMPLATE.md's eight, both ways, as one commit outside P29 (P25's Retro refusal 3 sent it to the maintainer)`; note stamp `P29 W125: keep — a cheap concrete check outside the doc/ refusal's class, handed to the maintainer by P25's retro (calibration 19)` |
| Q425 | icebox | **refs** 5 / 18 (P25, W104, W105, scripts/check-docs.mjs, scripts/check-docs-selftest.mjs). **subject** `X4_DEADLINE_MS = ` in `scripts/check-docs.mjs`: 1, `30_000`. **answered by** W104 for the message half (a timeout now names the clock); the cap half declined with ~88x headroom measured | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — W104 made a timeout name the clock; the fixed 30 s cap stands at ~88x the worst snippet, and a scaled cap was refused on this row's own argument` |
| Q427 | icebox | **refs** 7 / 10 (P25, W103, W104, W105, W114, doc/workflow.md, scripts/check-docs.mjs). **subject** `doc/workflow.md` section 8 still says *The plan gate row is UNMEASURED rather than met (Q427)*. **answered by** none: four readings, no per-rung re-take on CI | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the plan-gate budget is unmeasured, which doc/workflow.md section 8 already says; a per-rung re-take on CI has had no taker since W104` |
| Q428 | icebox | **refs** 1 / 2 (W104). **subject** Q180 (its subject) is iceboxed at W123: ADR 0070 moved the self-tests and their boots to CI. **answered by** none | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — a re-take of Q180's process-start count, and Q180 is iceboxed at W123 because ADR 0070 moved the self-tests to CI` |
| Q429 | icebox | **refs** 1 / 2 (W104). **subject** `spawnSync(` in `scripts/check-docs.mjs`: 3; its header: *the two tsc invocations stay synchronous*. **answered by** none: W104 declined it on its one-variable argument; the gain is ~1.2 s of a ladder measured at 136-245 s | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — overlapping X3's and X5's tsc would save about 1.2 s of a 136-245 s ladder; W104 declined it and nothing waits on it` |
| Q430 | keep | **refs** 1 / 2 (W104). **subject** `has 58 clauses: 55` in `scripts/check-docs-selftest.mjs`: 1, beside its own *the SITE count is 64*, while `fail('X` in `scripts/check-docs.mjs` counts **58** at `988ef5f` (`X11`'s 6 retired at W119) — the census is stale a THIRD time. **answered by** none; P27 decision 4 (*a count a script can derive is not written down*) is the cheaper answer than the row's clause | `closes-when` **set**: `the maintainer decides whether the stated site counts in scripts/check-docs-selftest.mjs's header are deleted (P27 decision 4) or compared to check-docs.mjs by a clause, as one commit outside P29`; note stamp `P29 W125: keep — the header is stale again at 988ef5f (55 and 64 stated, 58 counted), and deleting the counts is one commit (calibration 19)` |
| Q431 | resolve | **refs** 3 / 4 (W104, scripts/check-docs.mjs, scripts/check-docs-selftest.mjs). **subject** `AN ITEM'S CONFIRMING GATE IS` (1) and `it says nothing about whether anything could have noticed` (1) in `doc/workflow.md` section 4 (v0.26, P26); section 8: *npm run gate is the LADDER; npm run gate:full adds the selftests*. **answered by** v0.26 (P26's retro, after W104). **Re-derived**: the row's first fix is *say it beside the split, so an author knows which half of the proof they just skipped*; section 4 now says a green `gate` *says nothing about whether anything could have noticed*, and makes `gate:full` every item's confirming gate, so the author-side gap (*learns otherwise on push*) is closed per item; the row's own *against* (`gate:full` is one command) is what v0.26 made the rule. ADR 0070 cited in `note` only | `closes-when` unchanged (empty); `resolved-by`: doc/workflow.md section 4 (v0.26, P26): an item's confirming gate is npm run gate:full, not npm run gate, and a green gate says nothing about whether anything could have noticed; section 8 states the split. No ADR, so no R8 edit; note stamp `P29 W125: resolve — ADR 0070 cited in note only` |
| Q433 | icebox | **refs** 4 / 5 (P27, W105, W118, doc/workflow.md). **subject** `availableParallelism` in `scripts/run-selftests.mjs`: 2 — the pool is still sized in lanes. `doc/workflow.md` section 8 cites it: *Neither is reproducible ... (Q433)*. **answered by** none: the row's own *against* (a lane weight is Q102's shape, governing a wall nothing asserts) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — the self-test pool is still sized in lanes; a work-weighted pool governs a wall clock nothing asserts, and section 8's citation stays accurate` |
| Q434 | keep | **refs** 1 / 1 (W105). **subject** `String.prototype.replace` in `scripts/`: 4, all in `scripts/check-wiring-selftest.mjs` — the instrumented apply exists in ONE self-test; chained `.replace(...).replace(` occurs in the markdown, scheduler, workers and register self-tests (1, 1, 1, 3). **answered by** none: the fix is written and checked in one file | `closes-when` **set**: `the maintainer decides whether the other self-tests adopt check-wiring-selftest.mjs's instrumented replace (or a shared helper), as one commit outside P29, or that whole-file vacuity stays their guard by choice`; note stamp `P29 W125: keep — a silent narrowing in the self-tests with its fix already in one file (calibration 19)` |
| Q435 | icebox | **refs** 1 / 1 (W105). **subject** `X4_WIDTH = 8` in `scripts/check-docs.mjs`: 1; no probe-level pool in any self-test. **answered by** none: *not shipped* at W105, since the win exists only where nobody waits (CI, four cores); ADR 0070 cited in `note` only | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — probe-level concurrency is a local-only win and ADR 0070 moved the self-tests to CI, where four cores make P = 1 the limit` |
| Q436 | icebox | **refs** 1 / 1 (W105). **subject** the split-token idiom `SELFTEST-${'EXCLUSIVE'}` is the written counter-measure; no check over probe literals. **answered by** none: the row is Q178 at its third and fourth occurrence (Q178 iceboxed at W123) plus a vacuity half, so not a duplicate (calibration 13) | `closes-when` unchanged (empty); note stamp `P29 W125: icebox — Q178's self-match at its third and fourth occurrence, with the vacuity half; the split-token idiom is the counter-measure and a check over probe literals has had no taker` |
| Q437 | keep | **refs** 1 / 1 (W105). **subject** `META CONTROL` in `scripts/`: 2, both in `scripts/check-lookup-selftest.mjs`; `check-wiring-selftest.mjs` carries its META control (W105). The six META passes the row names (source, docs, spec, policies, scheduler, markdown) carry none. **answered by** none; the pattern (an unmutated copy through the same expression) is in two files; ADR 0072 decision 3 cited in `note` only | `closes-when` **set**: `the maintainer decides whether each META pass gains an unmutated-copy control (one extra child per pass), as one commit outside P29, or stays bounded by distinctness alone`; note stamp `P29 W125: keep — the control is one child per pass and already exists in two self-tests (calibration 19); ADR 0072 decision 3 cited in note only` |
| Q438 | resolve | **refs** 1 / 1 (W107). **subject** `Each of the three documents has ONE audience` in `doc/decisions/`: 1 — ADR 0073 decision 1's table (README.md a person using the library, AGENTS.md an agent using it, CLAUDE.md an agent developing it). **answered by** ADR 0073 (W107), which the row itself says ANSWERED it; the residue (*a stated audience and no rung*) is a check over English, the refusal ledger's `doc/` row (1, 27 refusals). **Re-derived**: the question is *which of the three root documents a claim belongs in*; decision 1 decides it by name for those three files, permanently; ADR 0077 later struck one cell's third term and left the division standing. ADR 0073's `resolves` is `""` at `988ef5f` | `closes-when` unchanged (empty); `resolved-by`: ADR 0073 decision 1, each root document has one audience and the audience decides what belongs in it; the residue, a rung over that, is the refusal ledger's doc/-check row; note stamp `P29 W125: resolve — R8: ADR 0073's resolves gains Q438` |

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 50.

*How the reader worked (phase 2).* Fresh context; `doc/workflow.md` and P29 decisions 1-3 read, then
this file's ids, dependencies and calibration only. Each question was read FIRST — front matter at
`988ef5f` and its long body from `git show b665981:doc/open-questions.md` — and a verdict for all 50
was written to `dev-dist/w125r-46188/myverdicts.txt` (keep 6, defer 1, icebox 40, resolve 2, obsolete
1) BEFORE the worksheet was opened. Subjects were taken in a `git archive` of `988ef5f`
(`dev-dist/w125r-46188/base`, 0 links). The blind verdict matched the proposal on 48 rows; the two
that differed are Q362 (blind icebox, AGREE after re-reading P22's Retro (vi)) and Q382 (DISPUTE).
**Reader tally: 50 rows — AGREE 49, DISPUTE 1, CHANGE 0**, counted from the table below by script.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| Q326 | AGREE | icebox. No size-prediction wording in `doc/workflow.md`; P20's and P21's retros recorded the class and adopted nothing |
| Q327 | AGREE | icebox. Rule 8's harness rows still bind provocation sets only; Q323 (iceboxed at W124) and W126's Q486 carry the killed-harness half |
| Q333 | AGREE | icebox. A recorded second shape with no later occurrence; nothing decides or pends it |
| Q335 | AGREE | icebox. Q179 is iceboxed (W123) and no product cost is asserted as a magnitude, so nothing rests on the spread |
| Q337 | AGREE | keep (calibration 19). Confirmed: `markdownIn` walks only `doc/` and `spec/` plus three root files. Two facts for the keeps round: `X10` (W96) now reads `examples/README.md`'s two L6 count copies, so the title's *read by NO check* is true only of its LINKS; and `resolveLinks` run over that file at `988ef5f` finds 105 links, 0 dead, 0 dead anchors, so the hole is latent, not live. Entangled with Q142's floors, as the row says |
| Q338 | AGREE | icebox. The force-condition (a third such file, or one rotting) has not occurred; the trigger sits in `note`, `closes-when` stays empty |
| Q339 | AGREE | icebox. The general half is rule 8 (c)'s v0.16 amendment; the instance needs a `src/` seam |
| Q340 | AGREE | icebox. P22's Retro (vi) files the counting half under obligation (c)'s LIMIT; the RELATION half is unanswered, so icebox rather than resolve is right |
| Q341 | AGREE | icebox. `X4` still names only `if (false)` (3 hits); Q310 is iceboxed; not a duplicate, because the crash-bought ceiling is a separate question (calibration 13) |
| Q342 | AGREE | icebox. Confirmed: the refusal-ledger row (twice, P21-P22), and P22's Retro (vii) refuses on an arrangement (*every site was named by a rung that fired*), so icebox, not resolve (calibration 17). `CONTROL_LINES` still pins 21 workers |
| Q343 | AGREE | obsolete. Confirmed: `doc/open-questions.md` is 786 bytes at `988ef5f` with no table rows; P28 decision 1 and W116 made the register one file per question, so the multi-line row a census parser had to absorb no longer exists |
| Q345 | AGREE | icebox. A dev-dist harness filename met once; Q253 is iceboxed |
| Q346 | AGREE | icebox. Calibration 1: the old `closes-when` was a reopen trigger, rightly cleared into `note` |
| Q347 | AGREE | icebox. As Q346: trigger moved to `note`; W53's reach is deliberate |
| Q348 | AGREE | icebox. The Owns half is the ledger's `check-owns` row (13 refusals); trigger moved to `note` |
| Q349 | AGREE | icebox. The interleaving is checked in at L1-L5 and L6; trigger moved to `note` |
| Q350 | AGREE | icebox. The row's own *against* (the scope note in `spec/join-policy.md` v0.17) stands; trigger moved to `note` |
| Q351 | AGREE | icebox. Binding prose both ways is the ledger's `doc/` row, which the row itself names; trigger moved to `note` |
| Q352 | AGREE | icebox. P22's Retro (iv) rests on P15 decision 5 and P22's own stop-and-ask (a), an arrangement; not resolve (calibration 17) |
| Q356 | AGREE | icebox. P22's Retro (v) recorded one occurrence; Q217 is iceboxed; trigger moved to `note` |
| Q359 | AGREE | icebox. Fixed in place at W86; *nothing at one occurrence* is the row's own verdict |
| Q360 | AGREE | icebox. Its own *against* names the ledger's Owns pre-declaration row; P23 and P24 seeded the censuses as table rows |
| Q361 | AGREE | icebox. `X9` holds README and both manifests (both `0.7.0`). One fact for the note if wanted: ADR 0073 decision 2 removed README's earlier-release paragraphs, so the residue is only the historical `0.4.0`-`0.6.0` sentences in `AGENTS.md` and `spec/runtime-targets.md`, which are sentences, not current-version claims |
| Q362 | AGREE | resolve. The reader's blind verdict was icebox; P22's Retro (vi) re-read at `988ef5f` refuses a rule for Q362 BY NAME on the ground that obligation (c)'s LIMIT and v0.16 already say it, which is a clause that exists rather than a cost (calibration 17 met). It binds every rule 8 set, the scope the question names (calibration 12), and it is Q195's resolution at W124, cited the same way. No ADR, so no R8 edit |
| Q367 | AGREE | icebox. `deepEqual` at `test/harness.ts:57` still ignores prototypes; the cost of a stricter `equal` was never measured, and the suites that need it carry local comparators |
| Q373 | AGREE | icebox. ADR 0070 took the self-tests off `gate`; Q433 is the live explanation |
| Q377 | AGREE | icebox. Q102's ratchet shape, iceboxed at W123 |
| Q378 | AGREE | icebox. The row's own *against* (the store is the whole contract) stands |
| Q382 | DISPUTE | **keep, not icebox** (calibration 19). The defect class is LIVE, not one closed occurrence: `test/definition/gate.test.ts` still registers 17 cases as `test(DECLARED_CASES[i]!, ...)`, the exact form that ran two cases under each other's names at W92, while `test/driver/gate.test.ts` already names each case at its call site and cites Q382 for it. The fix is one file, mechanical and concrete, with the pattern in the sibling file. Proposed `closes-when`: the maintainer decides whether `test/definition/gate.test.ts` names its cases at the call site, as `test/driver/gate.test.ts` does, as one commit outside P29, or keeps the index form by choice |
| Q392 | AGREE | icebox. A one-off hand measurement; the crash is loud |
| Q395 | AGREE | icebox. Present tense is English, the ledger's `doc/` row; ADR 0073 decisions 2 and 5 also took README out of `X10` and out of counts |
| Q401 | AGREE | icebox. P25 declared the wording half its retro's and the Retro's (f) entry does not touch it; obligation (f)'s text is unchanged at v0.25 |
| Q405 | AGREE | icebox. A declared ceiling; the fix is a second reachability walk nobody asked for |
| Q406 | AGREE | icebox. Confirmed the barrier lives in `examples/l6.ts`'s L6 census, not in `src/` (`RN-R27` occurs in `examples/l6.ts` and `spec/` only), and it was measured inert, so no product defect is hidden |
| Q407 | AGREE | defer. Confirmed: no table clause exists at `988ef5f` (`M7`/`M8` left at W116), and ADR 0078 decision 4 (W113) names the waited-on thing, twenty unfixed rows. The old `closes-when` is rightly cleared |
| Q410 | AGREE | icebox. `WiringVerdict` has no `route`, and AGENTS.md documents the absence twice |
| Q411 | AGREE | icebox. `own` is local in `schema.ts` and `wiring.ts`; the known sites are bound by tests |
| Q420 | AGREE | keep (calibration 19). Confirmed: no script compares the work items' declaration labels (`state.mjs` reads only the Status vocabulary); P25's Retro refusal 3 sends it to the maintainer as the one `doc/` instance needing no English. The `closes-when` names the decision and the commit |
| Q425 | AGREE | icebox. W104 took the message half; the 30 s cap was refused with ~88x headroom measured |
| Q427 | AGREE | icebox. `doc/workflow.md` section 8 already calls the row unmeasured, and an icebox leaves that sentence true (calibration 21 has nothing to record) |
| Q428 | AGREE | icebox. Q180 is iceboxed at W123 |
| Q429 | AGREE | icebox. Both `tsc` calls are still `spawnSync` in sequence; a gain of about 1.2 s that nothing waits on |
| Q430 | AGREE | keep (calibration 19). Re-derived independently: the header says *58 clauses: 55 fail() sites* and, eleven lines below, *64 across eleven ids*, while `grep -o "fail('X[0-9]*'"` counts **58 across ten ids** at `988ef5f`. Two stated counts disagree with each other and with the file, so this is a live defect, the strongest keep in the band |
| Q431 | AGREE | resolve. Confirmed at `988ef5f`: `doc/workflow.md` section 4 (v0.26, P26, after W104) makes `gate:full` an item's confirming gate and says a green `gate` says nothing about whether anything could have noticed; section 8 states the split. That is the row's first fix, *say it*, written down and binding every item. No ADR is in `resolved-by` |
| Q433 | AGREE | icebox. The pool is still `availableParallelism` lanes; section 8's citation stays accurate |
| Q434 | AGREE | keep (calibration 19). Confirmed: `String.prototype.replace` instrumentation exists only in `check-wiring-selftest.mjs`, and the other self-tests guard with whole-file `broken === source` comparisons (for example `check-markdown-selftest.mjs` lines 1201, 1225, 1261) |
| Q435 | AGREE | icebox. Not shipped at W105 for a local-only win |
| Q436 | AGREE | icebox. Q178's class with a vacuity half, so not a duplicate (calibration 13) |
| Q437 | AGREE | keep (calibration 19). One correction to the evidence, not to the verdict: `check-scheduler-selftest.mjs` does re-run a `caught` entry against the UNMUTATED check, but as a failure-count baseline for masking, not as the *unmutated copy must come back NOT noticed* control the row asks for; and `check-policies-selftest.mjs`'s unmutated control is for its `SELF` pass. So the six named META passes still lack the control |
| Q438 | AGREE | resolve. ADR 0073 decision 1 decides by name which root document a claim belongs in, by audience; ADR 0077 struck one cell term and left the division standing; consequence 11 places enforcement with a person, and the rung would be the ledger's `doc/` row. ADR 0073's `resolves` is empty at `988ef5f` and must gain Q438 (R8) |

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row, with the figures counted
from the table by script.*

**The maintainer, 2026-10-06:** *"Approve, taking reader's".* The approved set is **the worksheet
above with the Reader section's one DISPUTE row taken, with the Reader's stated replacement, and the
Reader's correction of Q437's evidence carried into that row's note**, and nothing else. Q437's
verdict does not change. The worksheet's rows are not rewritten; the table below is the approved
verdict for every row that differs from them. **One `resolved-by` names an ADR: Q438's, ADR 0073,
whose `resolves` gains Q438 (R8).** No earlier batch's stamp is fired or emptied by the change, so
there is no re-stamp and the gate's stamp count stays 50.

| id | worksheet | approved | taken from | approved fields |
|---|---|---|---|---|
| Q382 | icebox | **keep** | Reader DISPUTE | stays `open`; `closes-when` **set**: `the maintainer decides whether test/definition/gate.test.ts names its cases at the call site, as test/driver/gate.test.ts does, as one commit outside P29, or keeps the index form by choice`. The 17 index-named cases are still in that file at 988ef5f; the fix itself is a separate commit outside P29 |
| Q437 | keep | keep, **note corrected** | Reader AGREE, with its correction | verdict and `closes-when` as the worksheet's row; the stamp carries the Reader's correction: check-scheduler-selftest.mjs re-runs a caught entry against the UNMUTATED check only as a failure-count baseline for masking, and check-policies-selftest.mjs's unmutated control is for its SELF pass, so the six META passes the row names still lack the control |

**The counts, measured from the tables by script** (`dev-dist/w125k-50686/tally.mjs`, EXIT 0): the
Final approved verdicts table below has **50 rows over the 50 ids**, none missing, none extra, none
twice, and counts **keep 6 (Q337, Q382, Q420, Q430, Q434, Q437), defer 1 (Q407), icebox 39, resolve 3
(Q362, Q431, Q438), duplicate 0, obsolete 1 (Q343) — 50**. That is the worksheet's tally with the one
dispute taken (icebox 40 to 39, keep 5 to 6).

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, and the maintainer's answer.*

**Stop-and-asks**, one per row still `keep` after the approval. The briefing is the one put to the
maintainer (`dev-dist/w125k-50686/briefing.md`), at most 100 words a row; facts are at `988ef5f`,
and every fix, if decided, lands as its own commit outside P29. **Nothing in these rows is applied
before each is answered** (phase 4).

**The keeps round was answered 2026-10-06** — the maintainer: *"Accept all recs"*. Five stay keep
(Q337, Q382, Q430, Q434, Q437) and **Q420 moves keep → icebox**, each as its recommendation said; no
answer went against a recommendation. Q420's reopen trigger (a second item shipped without its
declaration block) goes in `note`, not `closes-when` (calibration 9).

| | the question, the briefing and the recommendation | answer |
|---|---|---|
| Q337 | **Rec: keep, decided with Q142.** *Should the link checker read examples/README.md?* check-markdown (every relative link and anchor must resolve) walks doc/, spec/ and three root files only. Example: rename a doc and that file's link to it dies with the gate green; W81 (what a settlement costs) proved it with a planted dead link. Today its 105 links all resolve: latent. Cost: one line in scripts/check-markdown.mjs, plus re-taking floors M3-M5 (minimum corpus sizes), which is Q142 (kept at W123: hand-tuned floors). Keep: decide with Q142. Defer: wait for Q142's commit. Icebox: the file stays unchecked. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: decided with Q142, with the worksheet row's `closes-when` |
| Q382 | **Rec: keep.** *Should test/definition/gate.test.ts name each test where it registers it?* Its 17 cases are `test(DECLARED_CASES[i]!, ...)`: the name is read by position from a list. Example: add a name in one place and its body in another, and two tests run under each other's names while every set comparison passes. W92 (what a gate is) hit exactly that; only rule 8's v0.24 grader (a failure must name the clause it broke) saw it. test/driver/gate.test.ts already names cases at the call. Cost: one file, 17 edits. Keep: land it. Defer or icebox: rely on the grader. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation, with the approved row's `closes-when` |
| Q420 | **Rec: icebox.** *Should a check require each work item to carry the template's eight declaration lines* (Spec, Owns, Inputs, Outputs, Depends on, Blocks, Tests, Gate)? W101 (wiring a gate before it runs) shipped with none, so section 7 rule 2's audit (git diff against Owns) had nothing. P25's retro handed it to the maintainer as a doc/ check needing no English. Today 97 of 101 item files carry all eight; 4 reserved stubs need exempting. Cost: a clause plus checked-in failing probes (rule 7), two or three files. Keep: decide now. Icebox: reopen on a second occurrence. | **icebox** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: it happened once (W101), and 97 of 101 item files carry all eight lines; `closes-when` stays empty and the reopen trigger goes in `note` |
| Q430 | **Rec: keep, deleting the counts.** *Should a comment counting another script's checks be deleted or checked?* scripts/check-docs-selftest.mjs's header says check-docs.mjs has "58 clauses: 55 fail() sites", and twelve lines lower "64 across eleven ids". The file holds 58 sites across ten ids (X11 retired at W119). Stale a third time; W104 (the concurrent snippet loop) corrected it once. P27 decision 4: a count a script can derive is not written down. Cost: delete two comment sentences, one file. Keep: decide delete versus a comparing clause, which adds a third floor (Q217's regress). Icebox: the comment stays wrong. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation (delete the counts), with the worksheet row's `closes-when` |
| Q434 | **Rec: keep, one commit with Q437.** *Should every self-test notice a half-applied mutation?* A self-test breaks a check by text replacement and guards "did my edit change anything" by comparing the whole file. Example: `src.replace(A, B).replace(C, D)` where C no longer exists still changes the file, so the guard passes and the probe grades a narrower break than it names. W105 (namespaced scratch) fixed check-wiring-selftest.mjs by counting replaces that matched nothing. Chained replaces remain in four self-tests: markdown, register, scheduler, workers. Cost: four files, or a shared helper (whether checks may share code). Icebox: accept the silent narrowing. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: one commit with Q437, with the worksheet row's `closes-when` |
| Q437 | **Rec: keep, with Q434.** *Should every META pass run an unbroken copy of its check as a control?* A META pass copies a check, breaks it, and expects a failure. Example: at W105 the copy sat one directory too deep, could not find package.json, and always failed: 14 of 14 "caught", an unbroken copy too. ADR 0072 decision 3 (a mutant run where it is written goes flat) fixed that cause. The wiring and lookup self-tests have the control; six META passes (source, docs, spec, policies, scheduler, markdown) lack it. Cost: six files, CI time. Icebox: trust the depth rule. | **keep** — 2026-10-06, maintainer: *"Accept all recs"*, following the recommendation: one commit with Q434, with the worksheet row's `closes-when` |

#### Final approved verdicts

*Filled in after phase 4, counted from this table by script.*

**50 rows: keep 5, defer 1, icebox 40, resolve 3, duplicate 0, obsolete 1** — counted from this table
by script: keep 6 / icebox 39 before the keeps round (`dev-dist/w125k-50686/tally.mjs`), and **after
it** by `dev-dist/w125a-51193/tally.mjs` and again by `dev-dist/w125a-51193/apply.mjs`, which
re-tallies this table before writing. **This table is final.** **The keeps round was answered
2026-10-06** (*"Accept all recs"*): Q337, Q382, Q430, Q434 and Q437 stay keep, and Q420 moves keep →
icebox. *From*: **W** the worksheet, **R** the Reader as approved, **K** the keeps round. Every row's `note` gains the stamp `P29 W125: <verdict>`, with the reason,
after `; ` where the note was not empty; a field not named is unchanged. An *obsolete* is `status:
resolved` with `resolved-by` opening `obsolete:` (P29 decision 1).

| id | final | from | fields applied |
|---|---|---|---|
| Q337 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q382 | keep | R, K | stays `open`; `closes-when` **set**: `the maintainer decides whether test/definition/gate.test.ts names its cases at the call site, as test/driver/gate.test.ts does, as one commit outside P29, or keeps the index form by choice`; stamp `P29 W125: keep — the reader's DISPUTE, approved 2026-10-06; test/definition/gate.test.ts still registers 17 cases as test(DECLARED_CASES[i]!, ...) at 988ef5f while test/driver/gate.test.ts names each at its call site; the fix itself is a separate commit outside P29` |
| Q430 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q434 | keep | W, K | stays `open`; `closes-when` **set** as the worksheet's row; the worksheet's stamp |
| Q437 | keep | W, R, K | stays `open`; `closes-when` **set** as the worksheet's row; stamp `P29 W125: keep — the control is one extra child per pass and already exists in two self-tests (calibration 19); check-scheduler-selftest.mjs re-runs a caught entry against the unmutated check only as a failure-count baseline for masking, and check-policies-selftest.mjs's unmutated control is for its SELF pass, so the six META passes named still lack it; ADR 0072 decision 3 cited in note only` |
| Q407 | defer | W | `deferred`; `closes-when` **cleared**; the worksheet's stamp; ADR 0078 cited in `note` only |
| Q326 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q327 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q333 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q335 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q338 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q339 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q340 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q341 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q342 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q345 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q346 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q347 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q348 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q349 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q350 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q351 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q352 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q356 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q359 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q360 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q361 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q367 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q373 | icebox | W | `icebox`; the worksheet's fields and stamp; ADR 0070 cited in `note` only |
| Q377 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q378 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q392 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q395 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q401 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q405 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q406 | icebox | W | `icebox`; the worksheet's fields and stamp; ADR 0062 cited in `note` only |
| Q410 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q411 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q420 | icebox | W, K | `icebox`, not `open`; `closes-when` unchanged (empty): the worksheet's set value is NOT applied; stamp `P29 W125: icebox — the keeps round, 2026-10-06; it happened once (W101), and 97 of 101 item files carry all eight declaration lines (the 4 without are reserved stubs); reopen on a second item shipped without its declaration block, which section 7 rule 2's Owns audit then cannot read` |
| Q425 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q427 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q428 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q429 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q433 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q435 | icebox | W | `icebox`; the worksheet's fields and stamp; ADR 0070 cited in `note` only |
| Q436 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q362 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |
| Q431 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR; ADR 0070 cited in `note` only |
| Q438 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; **ADR 0073's `resolves` gains Q438** (R8) |
| Q343 | obsolete | W | `resolved`; `resolved-by` as the worksheet's row (`obsolete: W116 ...`); names no ADR |

## Verification

The gate's clauses, each run redirected with its exit code read in the same command:

| clause | how |
|---|---|
| reader report | the Reader's findings table, one row per worksheet row, 50 |
| maintainer approval | the Approval section |
| keeps round | the Keeps round section, one answered row per keep |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for a question raised from `q527.md`-`q529.md` (made visible with `git add -N`); no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W125" --count > n.log 2>&1; echo EXIT=$?` — **50**, plus one for each re-stamp declared under Exceptions. `--include-icebox` is required: without it the lookup hides every icebox verdict |
| `git diff --name-only` against Owns | by hand, before the Record (`doc/workflow.md` section 7 rule 2) |
| own-id and withdrawn-claim grep | `W125` and any withdrawn figure, excluding `dev-dist/` (section 1 rule 5) |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in 2026-10-06, by the apply unit, with the tree still.* Scratch: `dev-dist/w125a-51193/`
(`edit-item.mjs`, `tally.mjs`, `apply.mjs` and every log below). Node v24.20.0 by `fnm use 24` in
every shell. Nothing committed.

**Final verdicts: 50 — keep 5 (Q337, Q382, Q430, Q434, Q437), defer 1 (Q407), icebox 40, resolve 3
(Q362, Q431, Q438), duplicate 0, obsolete 1 (Q343).** 45 of the 50 leave `open` (90%). `tally.mjs`
re-counted the worksheet and the *Final approved verdicts* table after the keeps round (EXIT 0,
`tally.log`), and `apply.mjs` re-tallied the Final table again before writing and refuses any other
figure; both matched. **The keeps round**: the maintainer, 2026-10-06, *"Accept all recs"* — Q337,
Q382, Q430, Q434 and Q437 stay keep with their rows' `closes-when`, and **Q420 moves keep → icebox**
(it happened once, W101, and 97 of 101 item files carry all eight lines), with its reopen trigger in
`note` and `closes-when` left empty. Every answer followed its recommendation. **R8**: ADR 0073's
`resolves` gains Q438, the only `resolved-by` of the four resolutions that names an ADR (`apply.mjs`
refuses any other); ADR 0062, 0070, 0072 and 0078 are cited in `note` only. **No re-stamp**, so the
stamp count is the row count, and Q527-Q529 were not issued. The obsolete is `status: resolved` with
`resolved-by` opening `obsolete:`. Q362's and Q431's worksheet `resolved-by` cells end in the
commentary *No ADR, so no R8 edit*; that sentence is the row's, not the field's, and was left out of
the applied value.

**How it ran.** The reader returned **AGREE 49, DISPUTE 1 (Q382, icebox → keep), CHANGE 0**, and its
correction of Q437's evidence was carried into that row's note; the maintainer approved taking both.
**0 of the 3 proposed resolves was overturned** (W123: 5 of 10; W124: 1 of 5). **P29 prediction 3
held**: the reader disputed one verdict. **The band label was exact this time**: P29's index row says
*"Q326-Q438"* and Q326 and Q438 are positions 101 and 150.

**Gate — what ran.** Each run redirected, with `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| reader report | done | 50 rows: AGREE 49, DISPUTE 1, CHANGE 0 |
| maintainer approval | done | 2026-10-06, *"Approve, taking reader's"* |
| keeps round | done | 6 rows; 2026-10-06, *"Accept all recs"*: 5 kept, Q420 → icebox, none against its recommendation |
| `edit-item.mjs` | EXIT 0 | `edit.log`: the six answers, Q420's Final row, the table marked final |
| `tally.mjs` | EXIT 0 | `tally.log`: worksheet 5/1/40/3/0/1, final 5/1/40/3/0/1, each 50 rows over the 50 ids (the keep sets differ: Q420 out, Q382 in) |
| `apply.mjs` | EXIT 0 | `apply.log`: 50 questions, 1 ADR; a dry run first (`dry.log`, EXIT 0 on its second run — the first stopped at a wrong ADR file name, before any write) |
| name-status M/A only | EXIT 0 | `ns.log`: 50 `M`, no `A`, `D` or `R` |
| `check:register` | EXIT 0 | `reg.log`: R8 compared 26 pairings (W124: 24; ADR 0073 → Q438 adds one each way) and excused 1 (Q466 → ADR 0077) |
| `check:markdown` | EXIT 0 | `md.log` |
| `check:markdown:selftest` | EXIT 0 | `mds.log`: 42/42 probes caught, 41/41 noticed, 7/7 bounded |
| stamp count | EXIT 0, **50** | `n.log`: 50 declared, no re-stamp |
| `git diff --name-only` against Owns | in Owns | `names.log`, 52: the 50 owned question files, ADR 0073 (its `resolves` only, Owns and the record step) and this file. No `q527.md`-`q529.md` |
| own-id and withdrawn-claim grep, excluding `dev-dist/` | clean | `W125` outside this file and `doc/questions/` is in P29's index row and W123's and W124's files (forward references). The Approval's *keep 6 / icebox 39* is the approval-time count and labelled so; the *pending* markers are gone from the Keeps round and the Final table |

*Re-run after this Record was written, on the final tree:* `tally`, name-status (50 `M`),
`check:register`, `check:markdown`, `check:markdown:selftest` (42/42) and the stamp count (50), each
EXIT 0 (`*2.log`); `names2.log` 52.

*Not run*: `npm run gate` and `gate:full` — no rung's input changed (P29 prediction 1), and the gate
declares neither.

**Dependencies.** `doc/workflow.md` section 8 cites Q427 (*the plan gate row is UNMEASURED rather
than met*) and Q433 (*neither is reproducible ... over-commits the machine*). Both are now `icebox`,
and both sentences stay true; recorded here, not edited there (P29 prediction 5). Q407 is deferred,
not closed, so W126's Q471 and Q492, which name it, keep a live dependency.

**For whoever takes the keeps** — the maintainer's bundling advice, 2026-10-06: **Q434 with Q437 in
one commit** (both are self-test harness controls), and **Q337 decided with Q142** (the walk's
widening re-takes Q142's `M3`-`M5` floors).

**For a later item, outside P29** (calibration 21). Nothing stale: the two comments naming a question
this batch closes (`scripts/check-docs.mjs:459` and `scripts/check-docs-selftest.mjs:999` at
`988ef5f`, both Q431) cite it as a shape and neither calls it open. No code names Q343, Q362 or Q438.

**Questions raised: none.** Q527, Q528 and Q529 were not issued: they are skipped, never reissued.

**What this taught** — the calibration for W126:

1. **A one-occurrence check is an icebox even when it is cheap** — the maintainer took Q420's icebox recommendation over the worksheet's keep; calibration 19 binds a fix whose defect is still live in the tree (Q382, Q430), not a first occurrence.
2. **The reader's dispute ran the other way from calibration 2** (icebox → keep, Q382): a live defect pattern with its fix already in a sibling file is a keep.
3. **Name bundles in the briefing**: the maintainer accepted Q434 + Q437 as one commit and Q337 with Q142; W126 should mark keeps that share a fix.
4. **Write a `resolved-by` cell as the field value alone**: commentary such as *No ADR, so no R8 edit* belongs in the evidence, or the apply unit must strip it.
5. **One ADR `resolves` edit moves `check:register`'s R8 pairing count by 2**, so an unchanged count after an R8 edit is the signal, not the rise.
