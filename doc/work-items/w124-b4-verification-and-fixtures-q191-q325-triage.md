# W124 — B4: a verdict for each of the second 50 open questions in the verification-and-fixtures cluster, Q191-Q325

**Status:** done — the 50 approved verdicts applied on 2026-10-06 after the keeps round (*"Keep all three"*), no ADR edited, no question raised, and every gate clause EXIT 0; see the Record
**Plan:** P29, `doc/plans/p29-which-open-questions-still-matter.md`

*This file carries NO relative link, deliberately* (calibration 16). W123 was the 120th linking
document in `check-markdown`'s second `removes` probe tree (`doc/decisions` and `doc/plans` cut),
which is `M4`'s floor of 120, so a linking document here crosses it again: the probe would report
`wanted [M1,M3,M4,M5], got [M1,M3,M5]` and `check:markdown:selftest` would exit 1 while
`check:markdown` stays green. That is Q142's mechanism (kept at W123), and retuning
`scripts/check-markdown.mjs` is outside this item. Ids and paths are written as bare text.

```
Spec:       none — P29 decisions 1-5, and doc/questions/README.md's format
Owns:       the 50 question files listed below; this item's own question files, q524.md-q526.md;
            and the `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit; the calibration of W121, W122 and W123 (below)
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the keeps round: one stop-and-ask per row still `keep` after (3), each with a
                recommendation and a plain-language briefing, and the maintainer's answer
            (5) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (6) the calibration this batch adds, recorded in this item's Record for the
                coordinator to hand to W125's declaration
Depends on: W123
Blocks:     W125
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; the keeps round answered; `git diff --name-status
            -- doc/questions/` M/A only; check:register, check:markdown, check:markdown:selftest
            EXIT 0; the stamp count, `npm run q -- --include-icebox --where "note~P29 W124"
            --count`, equals 50 plus every re-stamp declared under Exceptions (none at declaration)
Reserves:   Q524-Q526 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W124
```

Q524-Q526 are spare at declaration; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W124 never edits W121's, W122's,
W123's or W125's file. **A re-stamp of an earlier batch's question** (calibration 10) is added here,
with the maintainer's answer that causes it, before it is applied, and the gate's stamp count gains
one for each.

## The item's ids, from the lookup at `988ef5f`

**50 questions**: the open questions in *Verification and fixtures*, sorted by id, positions 51-100
of the 199 (P29: the bands are cut at the 50th, 100th and 150th). The cluster holds no deferred
question at `988ef5f`.

**P29's index row labels this band "Q190-Q325"; Q190 is a range BOUND, not the band's first id** —
Q190 is open at `988ef5f` but in *Decisions and data* (W122's), and filtering the open cluster to ids
in Q190..Q325 selects exactly these 50, the first Q191 and the last Q325. The plan is not edited; the
join records the label, as at W123.

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`
(`scripts/lookup.mjs` imports only `node:` modules):

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w124d-42603
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --count       # 199, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Verification and fixtures" --fields id   # 199 ids, EXIT 0
# sorted numerically: the 50th is Q189, the 51st Q191; the 100th Q325, the 101st Q326
node scripts/lookup.mjs q Q190 --fields id,status,cluster                                # open, Decisions and data, EXIT 0
# positions 51-100: 50 ids, all within Q190-Q325, none in W123's list; ids in 190..325: 50
cd .. && find base -type l | wc -l                                                       # 0
# and gci -Recurse -Force -Attributes ReparsePoint over base: 0; then the copy was removed
```

| cluster | ids | n |
|---|---|---|
| Verification and fixtures, positions 51-100 | Q191, Q193, Q195, Q196, Q197, Q198, Q202, Q203, Q204, Q207, Q208, Q209, Q210, Q212, Q213, Q214, Q216, Q217, Q220, Q221, Q222, Q233, Q234, Q235, Q240, Q242, Q243, Q246, Q252, Q253, Q256, Q257, Q267, Q272, Q274, Q276, Q283, Q288, Q289, Q290, Q292, Q302, Q310, Q312, Q315, Q317, Q321, Q323, Q324, Q325 | 50 |

**The 50 owned files**, under `doc/questions/`: `q191.md`, `q193.md`, `q195.md`, `q196.md`,
`q197.md`, `q198.md`, `q202.md`, `q203.md`, `q204.md`, `q207.md`, `q208.md`, `q209.md`, `q210.md`,
`q212.md`, `q213.md`, `q214.md`, `q216.md`, `q217.md`, `q220.md`, `q221.md`, `q222.md`, `q233.md`,
`q234.md`, `q235.md`, `q240.md`, `q242.md`, `q243.md`, `q246.md`, `q252.md`, `q253.md`, `q256.md`,
`q257.md`, `q267.md`, `q272.md`, `q274.md`, `q276.md`, `q283.md`, `q288.md`, `q289.md`, `q290.md`,
`q292.md`, `q302.md`, `q310.md`, `q312.md`, `q315.md`, `q317.md`, `q321.md`, `q323.md`, `q324.md`,
`q325.md`.

## Dependencies

- **A duplicate's target** stays in this batch or an earlier one (calibration 4). W125-W126 hold the
  other 99 *Verification and fixtures* questions (Q326 onward), so a duplicate of any of them is not
  available here; such a row is a defer or a keep naming the later question in `note`. A target in
  W121-W123's bands is available only if it stayed `open`, `deferred` or `icebox` there — not one that
  batch resolved.
- **A question of an earlier batch whose stamp names a question in this band** is not in `Owns`. If
  an approved verdict here fires or empties its trigger, the Record says so and the coordinator
  decides; a re-stamp is declared under Exceptions first (calibration 10).

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W124: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. A question raised from Q524-Q526, as `doc/questions/README.md` says to raise one, only if the
   batch finds one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/`,
  `test/` or `scripts/` changes; a question whose answer is *decide now* is a keep with a
  `closes-when` naming the decision (decision 3). **A process question asking for a check that does
  not exist is not answered by building it here.**
- **Every question outside the 50**, including W123's band (done) and Q326-Q511's verification
  questions (W125-W126).
- **Q494** (W127) and **Q499** (stays deferred).
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **P29's index-row label** "Q190-Q325": recorded at the join, not edited here.
- **The sibling repository.** Nothing is written there.

## Calibration

**From W121's pilot, W122's run and W123's run** (P29 decision 5: written into this declaration, not
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
   at W121.** *W121: 13 rows went to the round and 4 stayed keep; W122: 3 and 3; W123: 2 and 1, with
   a third decided by the maintainer at the approval.*
4. **A duplicate points at a question that stays** (not resolved) **in its own batch or an earlier
   one, never at a later batch's question** (here: never at W125-W126's). *W121: Q386 → Q9 crossed
   into W122 and became a defer.*
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
   ADR is cited in `note`, not in `resolved-by`. *W122: Q87 names P5 and W89, with ADR 0023 in
   `note`; W123: Q176's ADR 0070 edit was dropped and the ADR went in `note`.*
9. **Every row states `closes-when` explicitly**: the new value, *unchanged*, or *cleared*. **A
   resolved, deferred or iceboxed question carries no reopening trigger in `closes-when`; the trigger
   goes in `note`.** *W122: Q190 and Q201 were applied `resolved` with their old triggers still in
   `closes-when`, and were cleared after the gate.*
10. **A re-stamp of an earlier batch's question adds to the stamp count**, because it carries the
    same `P29 W124` prefix. It is declared in the gate and the Exceptions before it is applied.
    *W122: Q386, 70 + 1 = 71.*
11. **The approval's figures are counted from the table by script**, the question put to the
    maintainer included. *W122: a coordinator's hand count (defer 26, duplicate 1) reached the
    maintainer; the rows approved were right and the figures were not.*
12. **A resolve citing a general rule needs the files the question NAMES to actually be under that
    rule.** A rule in `doc/workflow.md` that would answer the question is not a resolution if the
    script or self-test the question names was never brought under it. *W123: Q151 and Q153 had the
    rule and not the named self-tests, and both went icebox.*
13. **A duplicate needs the same QUESTION, not the same mechanism.** Two questions about one
    variable or one check can ask different things. *W123: Q145 (does a non-inert corpus mutant
    verify what its entry claims) is not Q150 (does a broken harness read as coverage).*
14. **Count definitions, not mentions.** A subject grep counts where the thing is DEFINED or
    assigned, with the pattern stated so (for example `MAX_CORPUS\s*=`), never every line that names
    it. *W123: `MAX_CORPUS` had 27 hits but only 4 caps (Q150).*
15. **The decision-text test also reads the authoring item's own test comments.** A spec sentence
    that describes what the code does is not a decision when the item that wrote it says, in its own
    test, that the question is open. *W123: Q45, W20's spec sentence against W20's own
    `test/definition/nesting.test.ts` comment.*
16. **The item file stays link-free until Q142 is decided** — this file and every worksheet,
    reader and approval table in it (see the head of this file).

**A resolve is where a proposal overreaches.** W123's reader overturned **5 of its 10 proposed
resolves** (Q45, Q151, Q152, Q153, Q176, all to icebox), and the one duplicate. **So the proposer
re-derives each resolve's cited mechanism before proposing it**: it opens the cited clause, script
line or Record row at `988ef5f`, confirms it decides THIS question for the files the question names
(clauses 5, 7, 12 and 15), and states that check in the row's evidence. A resolve that fails it is
proposed as icebox or defer.

**This band (B4)** — W123's process-band note, carried. These are **PROCESS questions** — about checks, probes, floors, self-tests,
harnesses and the method — not about the library. For each row the evidence states:

- **whether the check, clause, probe or script the question names still exists at `988ef5f`**, as a
  path (`scripts/<name>.mjs`) or a grep with its pattern and hit count (`git grep -c -F "fail('M1'"
  988ef5f -- scripts/check-markdown.mjs`, 1 at W123's declaration); a clause id is grepped where it
  is DEFINED, not where it is cited (clause 14);
- **whether a later item built it**, by W id, read from that item's file or Record.

**A question asking for a check that now exists is a resolve candidate**, and its `resolved-by`
cites the clause id and its script — after the decision-text test and clause 12, since a check may
exist and still leave the question's other half, or the files it names, open. **A question whose
subject was removed** (a check, script or harness deleted, a rule cut by W115) is an **obsolete**
candidate, and `resolved-by` names what removed it. **A process wish nobody has picked up across
several plans is an icebox candidate**; the evidence says which plans passed it by. **Refusal-ledger
proposals** (`doc/workflow.md`'s ledger: a check over `doc/`, `check-owns.mjs`, and the rest) are not
re-argued: a question that is one of them is resolved or iceboxed citing the ledger row, never kept.
Nothing is read from the working tree: every subject is taken at `988ef5f`.

## The phases

P29 decision 4, with the keeps round the calibration adds. A phase does not start before the one
above it is complete.

1. **Propose.** Fill the worksheet: one row per question, 50 rows. The evidence is (a) the
   `npm run refs` count at `988ef5f`; (b) whether the check, clause, file or rule the question names
   still exists at `988ef5f`, as a path, or as a grep with its hit count and the exact pattern; (c)
   any later ADR, plan or item that answered or built it, by id. Every resolve carries the
   re-derivation the calibration's closing line requires. Every row states `closes-when`
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

*How the evidence was taken (phase 1, the propose unit).* **refs** is `node scripts/lookup.mjs refs Q<n>`
run in a `git archive` of `988ef5f` (`dev-dist/w124p-42669/base`, 0 links, EXIT 0 for all 50), given as
*files / mentions*. **subject** is `git grep -c -F '<pattern>' 988ef5f -- <paths>` (or `-E` where the
pattern says so), summed over files, or a `git show 988ef5f:<path>` line; a pattern with 0 hits is said
to be absent. Each question's long body was read from `git show b665981:doc/open-questions.md`, the last
commit that carried the bodies (427 rows there; 0 at `988ef5f`). Nothing was read from the working tree.
The last text that speaks to each question was found by reading every plan, item and ADR among its
citing files, highest-numbered first (calibration 7). Every resolve and obsolete row states the
re-derivation the calibration's closing line requires. Every row states `closes-when` (calibration 9):
nine had a value (Q207, Q220, Q221, Q222, Q233, Q234, Q235, Q242, Q246), each a reopening trigger, so
each is cleared and its trigger moved to `note`. `owner` is unchanged in every row.

*(Phase 1's figures, superseded by the Approval's four changed rows — Q198, Q235, Q252, Q272; the
applied set is the Final approved verdicts table.)* **Proposal summary: 50 rows — keep 1, defer 1,
icebox 40, resolve 5, duplicate 0, obsolete 3**,
counted from the table below by script, which also confirmed 50 rows over exactly the 50 ids, none
missing, none extra, none twice. Keep: Q283. Defer: Q233. Resolves: Q195, Q198, Q240, Q243, Q246.
Obsolete: Q196, Q204, Q216. **No `resolved-by` names an ADR, so no ADR's `resolves` is edited (R8)**;
ADR 0046 (Q243), ADR 0058 (Q289, Q321), ADR 0060 (Q302) and ADR 0044 (Q222) are cited in `note` only
(calibration 8). No duplicate is proposed: the nearest later-band neighbour, Q486 (a rule-8 harness is
never kept, W126's band), is named in the `note` of Q253, Q317 and Q323 rather than targeted
(calibration 4). No earlier batch's stamp is fired or emptied by a row here, so there is no re-stamp and
the gate's stamp count stays 50.

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q191 | icebox | **refs** 1 / 2 (W42 only). **subject** `score#edge0` in `test/`: 4; the `FD-V26` row is prose in `spec/flow-definition.md` (15 mentions), so no out-of-file source for the case list exists. **answered by** none: the body's own *for a rule* (state the ceiling beside the bound) is practice, and `doc/workflow.md` section 5 rule 8 now reports a declared ceiling BY ID (v0.26); Q112, the general form, was resolved at W123; P12's retro, its named owner, passed it | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a rewrite-shaped survivor with its ceiling stated; no source outside the test exists for FD-V26's prose case list, and P12's retro and every plan since passed it` |
| Q193 | icebox | **refs** 4 / 10 (P12, P15, W42, W46). **subject** `re-deriving the item's expected values independently` in `doc/workflow.md`: 1 (section 6 pass 2's conformity reader). **answered by** none: P12's Retro records it; P15's Record cites it as *a prediction right about the conclusion and wrong about the mechanism*; the body's own *against* is that the proposed rule restates section 6 | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the proposed rule (a reversal's evidence re-derived by a reader before its ADR ships) is section 6 pass 2's conformity reader, as the row's own case against says; P12 and P15 recorded it and adopted nothing` |
| Q195 | resolve | **refs** 2 / 3 (P13, W43). **subject** `a sensor cannot corroborate itself` in `doc/workflow.md`: 1 — section 5 rule 8 obligation (c), *its LIMIT: when the compound probe is green, count the observers*, v0.13, P12; `independent excludes the first's apparatus` in the next row, v0.16, P15. **answered by** P12's Retro (v0.13): *at one, the fix is a second independent expression, not a better probe*; P13 records that *v0.13 has just acted on* the P12 evidence questions with two occurrences. **Re-derived**: the question's open half is *no rule for how many independent expressions a claim needs*; obligation (c)'s LIMIT is that rule, stated in the question's own title words, and it binds every rule 8 set, which is the scope the question names | `closes-when` unchanged (empty); `resolved-by`: doc/workflow.md section 5 rule 8 obligation (c), its LIMIT (v0.13, P12's Retro: when the compound probe is green, count the observers, and at one the fix is a second independent expression) and its *independent* amendment (v0.16, P15). No ADR, so no R8 edit; note stamp `P29 W124: resolve` |
| Q196 | obsolete | **refs** 9 / 13. **subject** `const ROLES` in `examples/` and `src/`: 0; `examples/workers/` holds 22 modules and no `flow-worker.ts`; `What went with the switch` in `examples/README.md` and `examples/workers/shared.ts`: 2 — *`ROLES`, the `Role` union and the three lists `l6.ts` compared both ways since W47*. `examples/l6.ts` (W67's docblock): *both directions of Q196's asymmetry are GONE*. **answered by** W67. **Re-derived**: the list, the switch and both directions the question names are absent at `988ef5f`; the later citations (ADR 0060, `types.ts`, `driver.ts`, `checkpoint.test.ts`) cite only the general lesson *a type closes one direction* | `closes-when` unchanged (empty); `resolved-by`: obsolete: W67 removed `ROLES`, the `Role` union and the twelve-arm switch when one worker file became one module per registry worker entry, bound to the document's worker keys both ways (examples/README.md, examples/workers/shared.ts); note stamp `P29 W124: obsolete — W67 removed the list and the switch` |
| Q197 | icebox | **refs** 1 / 2 (W43 only). **subject** `whatever makes a **discriminating PAIR differ** is itself a claim` in `doc/workflow.md`: 1 (rule 8, on the SET, v0.13, P12), and obligation (a)'s *where it SELECTS, a fixture where every WRONG selection differs* (v0.23, P22). **answered by** none for the open half: both rows absorb the instance's lessons, and nothing says *when a pair is required rather than a compound probe*, which is the question | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the pair-is-a-claim lesson is rule 8's v0.13 SET row and the fixture-coincidence lesson its v0.23 (a) row; when a pair is required rather than a compound probe was asked by no item since W43` |
| Q198 | resolve | **refs** 3 / 9 (P12, P13, W43). **subject** `A **ladder level for L6's own self-test**` in P12: 1 — the Retro's *Refused, each with a measurement* paragraph; `a control must fail where its claim is **VACUOUS**` in `doc/workflow.md`: 1 (obligation (d), v0.21, with *NAME THE TREE*, v0.22). **answered by** P12's Retro (refused by name, on cost: ~20 s a run against a check's ~1 s, a self-test over W43's 43 mutations being the whole of what ADR 0039 bought back) and rule 8 (d)'s vacuity controls. **Re-derived**: the question's two halves are (1) L6 has no self-test, refused by name at P12 and not reopened by any later plan (P13 puts Q195-Q198 Out); (2) a cross-row bound cannot detect its own vacuity, which (d) answers by requiring a control that fails where the claim is vacuous | `closes-when` unchanged (empty); `resolved-by`: refused by name — P12's Retro refuses a ladder level for L6's own self-test (Q198) on its measured cost; the vacuity half is doc/workflow.md section 5 rule 8 obligation (d)'s control clauses (v0.21, v0.22). No ADR, so no R8 edit; note stamp `P29 W124: resolve` |
| Q202 | icebox | **refs** 2 / 2 (W45, `examples/l6.ts`). **subject** `const CROSS_ROW\s*=` (`-E`) in `examples/l6.ts`: 1 — still a literal. **answered by** none: the row's *against* is Q102's declared floor, iceboxed at W123 | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — CROSS_ROW stays a declared floor (Q102, iceboxed at W123); deriving its per-row half was proposed once, at W45, and taken by no item since` |
| Q203 | icebox | **refs** 2 / 3 (P13, W45). **subject** `**An `Owns` pre-declaration rule / `check-owns.mjs`**` in `doc/workflow.md`: 1 — the refusal ledger's second row, refused 13 times, P2-P26; section 7 rule 2's exceptions table is the procedure W45 followed. **answered by** the ledger row: the body's own *against* is P12's retro's ground for refusing the pre-declaration rule | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a plan-level Owns rule is the refusal ledger's Owns pre-declaration row (13 refusals, P2-P26); W45's five exceptions were declared, which is section 7 rule 2's exceptions table working` |
| Q204 | obsolete | **refs** 6 / 8 (P13, P23, W108, W113, W45, W47). **subject** `^[\|] Q[0-9]+ [\|]` (`-E`) in `doc/open-questions.md`: 427 at `b665981`, **0 at `988ef5f`** — the file is a 786-byte pointer to `doc/questions/`; the census note and the cluster table the parser read are gone. **answered by** W116 (one file per question, P28 decision 1). **Re-derived**: the parser, the note's clauses and the cluster cell the question is about have no subject at `988ef5f`; the later citations (P23, W108, W113) are pipe-escaping and census lists, not a live parser | `closes-when` unchanged (empty); `resolved-by`: obsolete: W116 replaced the single-file register, with its census note and cluster table, by one file per question, whose counts `npm run q` derives (P28 decision 1); note stamp `P29 W124: obsolete — the census note and its parser went with the single-file register at W116` |
| Q207 | icebox | **refs** 3 / 5 (P13, W45, `regions.ts`). **subject** `certainlySettled` in `src/definition/`: 6 — the arm is still there. **answered by** W45, which kept it on two stated arguments | `closes-when` **cleared** (was a trigger, *FD-V25 gaining a multi-branch map, or a third region-opening kind*); note stamp `P29 W124: icebox — the map arm is kept by W45's stated argument (FD-V29 is one rule over whichever kind opened the region); reopen if FD-V25 admits a multi-branch map or a third region-opening kind appears` |
| Q208 | icebox | **refs** 4 / 8 (ADR 0040, P13, W46, `spec/flow-definition.md`). **subject** `**A check over `doc/`**` in `doc/workflow.md`: 1 — the ledger's first row, refused 27 times. **answered by** the ledger row: the body says the discipline *would be a doc/ rule, refused ten times*; wall time is not an assertion (Q179, iceboxed at W123) | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — stating a timing table's method has no enforcer but a check over doc/, the refusal ledger's first row; Q179 (iceboxed) holds the wall-time half` |
| Q209 | icebox | **refs** 3 / 5 (P13, W46, `check-docs-selftest.mjs`). **subject** at `988ef5f`: `const ALL_CHECKS\s*=\s*\(` (`-E`) in `scripts/`: 1 (`check-docs-selftest.mjs`, derived); `function gradedIds` in `check-spec-selftest.mjs`: 1 (derived); `check-source-selftest.mjs` reads the ids out of the run's own output and has no allowlist (its docblock at line 759); `const ALL_CHECKS\s*=\s*\[` (`-E`): 4 hits, three literals (`check-policies` P1-P3, `check-scheduler` D1-D8, `check-wiring` G1-G6) and one probe's replacement text in `check-wiring-selftest.mjs`. **answered by** none for the remaining literal: `check-scheduler-selftest.mjs`'s own comment records the `agree` check catching the D6 omission | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — of the three named self-tests, check-source and check-spec now derive their id universe; check-scheduler keeps a literal, where its own comment records the agree check catching the omission; no item has asked for more` |
| Q210 | icebox | **refs** 1 / 3 (W46 only). **subject** `join(ROOT, 'AGENTS.md')` in `scripts/check-docs.mjs`: 0; `CHECK_DOCS_DOC` in it: 4 (line 59, `process.env.CHECK_DOCS_DOC \|\| 'AGENTS.md'`). The named instance is closed. **answered by** none for the general enumeration; rule 8 obligation (e) asks *is what it ran what SHIPS* (v0.12), and the body's own *against* is that the harness catches it once a probe exists | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the X6 instance is closed through CHECK_DOCS_DOC; enumerating every path-opening clause was proposed once and the row itself says the mechanism is write the probe` |
| Q212 | icebox | **refs** 4 / 10 (P13, W46, W47, `l6.ts`). **subject** `cloneValue(cloneValue` in `test/`: 1 (the probe's record). **answered by** W46, which replaced the Set with the serialised-length proxy; the row says *nothing generalises from one instance* | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the instance was replaced at W46 by a proxy bounded in the direction the cost grows; one occurrence, and the copies a driver makes are observable to no test, as the row says` |
| Q213 | icebox | **refs** 4 / 10 (P13, W47, `l6.ts`). **subject** `reaches past index.ts into src/` in `examples/l6.ts`: 2 (the clause still lives there); `examples/.*\.\./src` (`-E`) in `scripts/check-source.mjs`: 0. **answered by** none: no item moved the clause into `check-source` | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the examples-to-src boundary is still asserted only inside examples/l6.ts; a check-source clause was proposed at W47 and taken by no plan since` |
| Q214 | icebox | **refs** 12 / 31. **subject** `What Q214 keeps is that nothing a run REPORTS moves` in P15: 1 (its Record). **answered by** W55 for the instance (a reach past the reported surface, 0 to 29 L6 failures); the rule *when a rung's unit is the wrong unit* is unwritten through P28 | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — W55 answered the instance and P15 recorded what the row keeps; a general rule about a rung's unit has been proposed by no plan since` |
| Q216 | obsolete | **refs** 9 / 13. **subject** the three lists the question names — the pool registry built by hand in `examples/run-flow.ts`, `ROLES`, `run()`'s switch arms: `const ROLES` 0; `What went with the switch` 2 (`examples/README.md`, `examples/workers/shared.ts`: *the three lists `l6.ts` compared both ways since W47*); `both ways* is a DIRECTION, not an observer count` in `doc/workflow.md`: 1 (obligation (e), v0.13, citing Q216). **answered by** W67 (the lists) and v0.13 (the lesson). **Re-derived**: the block is gone, and W67's replacement binds the document's worker keys to modules ON DISK, which is the not-source-text derivation the row's *what would close it* asks for | `closes-when` unchanged (empty); `resolved-by`: obsolete: W67 removed the three lists and the block comparing them, binding the registry document's worker keys to the modules on disk both ways; the general lesson is doc/workflow.md section 5 rule 8 obligation (e), v0.13; note stamp `P29 W124: obsolete — W67 removed the three lists` |
| Q217 | icebox | **refs** 34 / 62. **subject** `**A fourth list below `CROSS_ROW_SUBJECTS`**` in `doc/workflow.md`: 1 — the ledger row, refused twice, P13-P14, citing Q217; `const CROSS_ROW_SUBJECTS\s*=` (`-E`) in `examples/l6.ts`: 1. Obligation (d)'s amendments (v0.14, v0.18, v0.21, v0.22) absorb its controls half. **answered by** the ledger row for its proposal; P15's Record: *the answer is a handle, not a list … recorded rather than ruled* | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the fourth list is a refusal-ledger row (twice, P13-P14) and the controls half is rule 8 (d)'s v0.14-v0.22 amendments; the regress is recorded, not open to a decision` |
| Q220 | icebox | **refs** 4 / 4 (ADR 0044, W49, W50, W51). **subject** `outputIsVisible(this.regions` in `src/driver/driver.ts`: 1 — one call site; the trigger has not fired. **answered by** none | `closes-when` **cleared** (was a trigger, *a third caller, or a resolution site without the region sets*); note stamp `P29 W124: icebox — a reader cost, no defect; reopen at a third caller of outputIsVisible or a resolution site (the edge site first) where the region sets are not available` |
| Q221 | icebox | **refs** 6 / 7. **subject** `export * from "./src/definition/regions.ts"` in `index.ts`: 1 (line 2); no test or check enumerates the root's exported names (the `import('../../index.ts')` reads in `test/` look names up, they do not census them). **answered by** none; Q101, the same shape, was iceboxed at W123 | `closes-when` **cleared** (was a trigger, *a fourth occurrence, or a consumer depending on one*); note stamp `P29 W124: icebox — the surface grows through export *; reopen at a fourth occurrence or a consumer pinning one of the three; Q101 (iceboxed at W123) is the same shape` |
| Q222 | icebox | **refs** 4 / 9 (P14, P15, W50, W51). **subject** `FD-V28` in `spec/flow-definition.md`: 20; no binding of its region predicate to `outputIsVisible`'s chain predicate. **answered by** none; ADR 0044 asserts the biconditional and is cited in `note` only; Q199 (the admitted-set measure) was iceboxed at W122 | `closes-when` **cleared** (was a trigger, *a rule that moves either predicate*); note stamp `P29 W124: icebox — ADR 0044's biconditional is hand-derived and unbound; reopen if a rule moves FD-V28's predicate or outputIsVisible's; the binding would be Q199's admitted-set loop (iceboxed at W122)` |
| Q233 | defer | **refs** 10 / 16. **subject** `v8.serialize` in `test/driver/retention.test.ts`: 3; the test still reaches a private field through one named helper. **answered by** none; the named consumer is Q21 (an event family for a UI), deferred at W122 | `closes-when` **cleared** (was *a consumer that needs to know what a run holds*); note stamp `P29 W124: defer — waits on a consumer that needs to observe what a run holds: Q21's event family (deferred at W122) or a stuck-run diagnostic; until then every fix is a surface for a test's convenience` |
| Q234 | icebox | **refs** 3 / 3 (P15, W53, `retention.test.ts`). **subject** `if (1) return;` in `test/`: 0 (the probe is not checked in); the runner still counts `test()` cases (Q98, iceboxed at W123). **answered by** the ledger row *A fourth list below `CROSS_ROW_SUBJECTS`*: the body says every answer is a fourth list, which P13's retro declined | `closes-when` **cleared** (was a trigger, *a test found empty by a reader, or an item shipping green with an unwritten body*); note stamp `P29 W124: icebox — every answer is a fourth list (refusal-ledger row, P13-P14); reopen if a reader finds a test body that asserts nothing on a shipped tree` |
| Q235 | icebox | **refs** 2 / 3 (P15, W53). **subject** `.claude` in `.gitignore`: 0 — still unignored. **answered by** none: one occurrence, loud, unstaged by hand; no item since W53 | `closes-when` **cleared** (was a trigger, *a commit that actually lands one*); note stamp `P29 W124: icebox — one loud occurrence at W53, and .gitignore is in no item's Owns; reopen if a commit lands an embedded repository from .claude/worktrees/` |
| Q240 | resolve | **refs** 4 / 4 (W54, W55, `examples/retention.ts`, a run file). **subject** `to a floor of **284 B** whatever the payload` in `spec/outcome-record.md`: 1 — section 4 gives the factor as 1.0 / 4.7 / 15.5 / 58.7 / 231.8 and adds *P15 quotes 8.7x from one fixture*. **answered by** W54 (the corrected statement). **Re-derived**: the question is a quoted constant; the normative text now states the factor as a function of the payload and names P15's figure as one fixture's, and the row's own *against acting* says the correction is in place and no check could have caught it | `closes-when` unchanged (empty); `resolved-by`: corrected in place — spec/outcome-record.md section 4 (W54) states the blanking factor per payload size over a 284 B floor and marks P15's 8.7 as one fixture's. No ADR, so no R8 edit; note stamp `P29 W124: resolve` |
| Q242 | icebox | **refs** 3 / 7 (P15, W54, `retention.ts`). **subject** `outcome-record` in `scripts/check-docs.mjs`: 1 — a comment (line 670) saying P15's row named that file, not a clause; `X6` still compares `spec/flow-definition.md` with `AGENTS.md` only; the harness was under `dev-dist/p15/` and is in no commit. **answered by** none | `closes-when` **cleared** (was a trigger, *a third document quoting the numbers, or one going stale unnoticed*, the second already fired once); note stamp `P29 W124: icebox — X6 was not extended to spec/outcome-record.md section 4 and its harness was never checked in; no plan since P15 picked it up; Q486 (W126's band) holds the harness half` |
| Q243 | resolve | **refs** 4 / 10 (ADR 0046, P15, W54, W55). **subject** `exceeds `bytes(inputs)` by 49.8%` in `CLAUDE.md` and `doc/README.md`: 0; every remaining occurrence in the tree quotes the old sentence as wrong (ADR 0046 line 86, P15 lines 108 and 491, W55 line 251); `which is a different ratio` in P15: 1 (fact 3 corrected in place). **answered by** W55 and P15's Record (*what W55 found wrong*, item 1). **Re-derived**: all four documents the question names now carry the of-the-pair reading or none | `closes-when` unchanged (empty); `resolved-by`: corrected in place — P15's Record (what W55 found wrong, item 1) and P15 fact 3 now read 49.8% as the share of the pair and +99.2 to +99.4% as the excess; CLAUDE.md and doc/README.md no longer carry the sentence; note stamp `P29 W124: resolve — ADR 0046 carries the same correction (cited here, not in resolved-by, as it decides nothing about the figure)` |
| Q246 | resolve | **refs** 3 / 9 (P15, P16, W55). **subject** `**Decision 3's *~101 ms per real run* is a per-ROW figure.**` in P15: 1 — the Record re-labels it (4286 / 42 = 102 ms per `EXPECTED` row) and states *the decision stands*; the Retro: *the refusal survives on its other grounds*. **answered by** W55 and P15's Record. **Re-derived**: the question is a mislabelled unit; the plan that quoted it re-labelled it and kept its decision by name; what is left is a trigger | `closes-when` **cleared** (was a trigger, *a plan that wants the scale as a rung*); `resolved-by`: corrected in place — P15's Record (what W55 found wrong, item 2) re-labels the figure as the L6 harness's per-row cost and keeps decision 3's refusal on its other grounds; note stamp `P29 W124: resolve — reopen if a plan wants the scale as a rung, which would need the per-run cost priced apart from the per-row one` |
| Q252 | icebox | **refs** 10 / 23. **subject** `deno publish` in `package.json` and `scripts/run-gate.mjs`: 0 — the gate does not run the dry run; `fail('D8'` (`-E`) in `check-scheduler.mjs`: 7 and `fail('S15'` in `check-source.mjs`: 6 bind the two known dependencies' declarations; `RT-R12` states what the dry run proves. **answered by** W57 (D8) and W62 (S15, RT-R12) for both named instances | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — both named instances are bound by declaration checks (D8 for the scheduler, S15 for jsonata); a dry run in the gate for an unknown third bare import was priced at W57 and taken by no plan since` |
| Q253 | icebox | **refs** 14 / 33. **subject** `dev-dist/p16/facts.mjs` in `scripts/` and `test/`: 0 — never checked in; no L1 assertion reads the driver's call site. **answered by** none: P16's and P17's retros recorded and refused a patch; the census-parser extension is obsolete with the single-file register (W116); Q151 (same shape) was iceboxed at W123 | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — facts harnesses stay untracked by every plan's practice since P16; Q486 (W126's band) is the live general form, a harness that is never kept; Q151 (iceboxed at W123) is the self-test shape` |
| Q256 | icebox | **refs** 2 / 3 (P16, W58). **subject** `the node wins` in `spec/`: 3 — the sentence is held and marked unobservable. **answered by** none: its named owner, P16's retro, passed it; the row's *against* is that it costs nothing | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a held, unobservable rule sentence; reopen at a second clause of the kind or a reader building a probe for it` |
| Q257 | icebox | **refs** 1 / 1 (W58 only). **subject** `idleTimeout` in `examples/l6.ts`: 0 — no L6 row tears a worker down between attempts. **answered by** none | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a retry across a worker teardown needs a memo that outlives the worker and is unmeasured; one mention, no consumer has asked` |
| Q267 | icebox | **refs** 2 / 5 (P17, W61). **subject** `x00-\\x08` (`-E`) in `scripts/`: 0 — no check refuses a control byte. **answered by** none: one occurrence, caused by the author's instrument | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — one occurrence (W61), from the author's tool; a control-byte clause was priced and taken by no plan since P17` |
| Q272 | icebox | **refs** 13 / 25. **subject** `for (const f of files) await import(pathToUrl(f));` in `test/runner.ts`: 1 — still outside any `try`. **answered by** none for the runner; rule 8's grader controls (v0.24, P23) grade a CRASH as a CRASH, which is how every occurrence was read correctly | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — an unimportable suite is still a crash, not a red test, and every occurrence was read correctly by rule 8's v0.24 grader controls; the runner change was priced at W62 and taken by no plan since` |
| Q274 | icebox | **refs** 2 / 4 (P17, W63). **subject** `runId: `r${i + 1}`` in `examples/l6.ts`: 1 — still index-minted. **answered by** none; the owner cell is *a fact to state beside any L6 deletion cost*, which is a practice, not a decision | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a recorded fact about measuring L6 deletions (delete the last row); no decision is asked for` |
| Q276 | icebox | **refs** 6 / 11 (P17, P18, P25, W100, W113, W63). **subject** `console.log(`    FAIL` in `test/runner.ts`: 1 (four spaces, unchanged). **answered by** none: P25's Retro records the W101 recurrence and adopts nothing for it; the exit code was read every time | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the FAIL indentations differ by runner and harnesses carry the literal; no claim has rested on the pattern since v0.15 made the exit code the predicate, and P25 recorded the recurrence without a rule` |
| Q283 | keep | **refs** 1 / 1 (W65 only). **subject** `^export function (checkRegistry\|resolveRegistry)\(` (`-E`) in `src/definition/registry.ts`: 2 — still two functions sharing key lists; `` `resolveRegistry` refused both `` in it: 1 — a SECOND divergence repaired at W109 (its readers' shared subject). **answered by** none: W66, the named owner, calls both and did not merge them | `closes-when` **set**: `a decision that checkRegistry and resolveRegistry share one shape function called from both, or that the shared key lists alone are declared the binding`; note stamp `P29 W124: keep — the two halves diverged twice (W65, W109), so whether they become one is a library decision` |
| Q288 | icebox | **refs** 1 / 2 (P18, W66). **subject** `function code\(` (`-E`) in `scripts/check-source.mjs`: 1 (the left-to-right scan); `tokeniz` in `scripts/`: 0. **answered by** none: *a real tokenizer is the answer nobody has priced* | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — three constructs are modelled and RT-R13 has no live offender; reopen if a fourth construct blinds or falsely fires a check-source clause` |
| Q289 | icebox | **refs** 5 / 9 (ADR 0058, P18, P20, W67, W77). **subject** `**declared OUT and NOT closed.**` in P20: 1 (its open-questions table, Q289's row). **answered by** none: P20 fact 4C shows the `done` promise is immune to the window; a closure needing the driver is not; ADR 0058 is cited in `note` only | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — P20 declared it out and not closed; the harness counts the one-input window and asserts it, and ADR 0058's done is immune to it` |
| Q290 | icebox | **refs** 1 / 1 (W67 only). **subject** `inline: !threaded` in `examples/run-flow.ts`: 3 — the derivation stands. **answered by** none | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — whether a document may leave a type's inline to the caller has one mention and no consumer` |
| Q292 | icebox | **refs** 3 / 18 (P18, W67, W72). **subject** fences matching ` ```ts ` in P18: 3; `check-docs` executes `AGENTS.md`'s snippets and nothing executes a plan's. **answered by** the ledger's first row: executing a plan's sample is a check over `doc/`, refused 27 times | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — executing a plan's sample is a check over doc/, the refusal ledger's first row; items build from the sample and correct it, as W67 did` |
| Q302 | icebox | **refs** 19 / 50. **subject** `**that REFUSES the cheap half of` in P21: 1 — stop-and-ask (d): `check:workers` reads the FIRST example only; `` `OR-R13` `` in `spec/outcome-record.md`: 3 (the run-time result check, W80). **answered by** P21 (d) refuses the cheap half; W80/W82 give the run-time answer *for this shape*; W82's Out leaves the bounds-generating road, *W74's territory*. ADR 0060 is cited in `note` only | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — both named violations closed at W73, the run-time check (OR-R13, W80, ADR 0060) is the answer P21 chose, and the remaining bounds-generating road was declined by P21 stop-and-ask (d) and W82` |
| Q310 | icebox | **refs** 13 / 22. **subject** `make each claim a **TAUTOLOGY**` in `doc/workflow.md`: 1 (obligation (b), v0.20, P19). **answered by** the v0.20 obligation for probing; P21's Retro confirms and narrows the ceiling (`X4` refuses `if (false)` by name); W101 added a second observer in `test/`; neither general road (stdout comparison, a throw-site floor) was taken | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the ceiling is real and stated, the probing is rule 8 (b)'s v0.20 tautology clause, and each claim's second observer lives in test/ (W74, W101); the general roads were priced and taken by nobody` |
| Q312 | icebox | **refs** 3 / 4 (P19, P20, W74). **subject** `Spec:       NONE` in W74: 1 (line 17). **answered by** none | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — what makes a pure function's behaviour normative; reopen at a second implementation of the library or a consumer asking what pathsOf guarantees` |
| Q315 | icebox | **refs** 4 / 13 (P19, P20, W76, a README). **subject** `rather than a `check-source` clause` in P20: 1 — decision 5, and the maintainer chose road (a) at the declaration. **answered by** P20 decision 5 for the road; nothing outside a test reads the two lists, as the row says | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — P20 decision 5 and the maintainer chose the test-plus-inline road; the cost is stated and no plan has asked to move the binding into check-source` |
| Q317 | icebox | **refs** 4 / 10 (P20, W76, W77, W78). **subject** `**The dated-ceiling HAND-OFF**` in `doc/workflow.md`: 1 — refused 4 times, P18-P20, P27, on its yield (0 of 28 ceilings re-runnable at P27). **answered by** none for the semantic-no-op edit; P20's Retro lists it among five instrument defects with no rung | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a ceiling edit asserted to change a named observable needs a kept harness; the dated-ceiling hand-off is a refusal-ledger row and Q486 (W126's band) is the kept-harness question` |
| Q321 | icebox | **refs** 3 / 3 (W77, W78, `l6.ts`). **subject** `w77Settlement` in `test/scheduler/runtime.test.ts`: 9 — the helper bounds the handles its own cases hold. **answered by** ADR 0058 rule 3 (`done` resolves rather than rejects), cited in `note` only, so the hazard exists only under mutation | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — ADR 0058 rule 3 makes done resolve, so an unattached rejection exists only under a probe; both closing roads hide a real rejection, as the row says` |
| Q323 | icebox | **refs** 14 / 28. **subject** `(Q323)` in `examples/l6.ts`: 1 (line 8031, *ten is a verdict rather than a wait*), and every `done` there bounded with the runtime shut down in a `finally` (line 8506); `examples/settlement-cost.ts` bounded likewise. **answered by** the bounded-`done` practice for the first half; the second half (a restore that survives a killed harness) concerns rule 8 harnesses, which are never kept | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the hang half is closed in examples/l6.ts and settlement-cost.ts by bounded done; the killed-harness half lives in rule 8 harnesses that are never kept, which is Q486 (W126's band)` |
| Q324 | icebox | **refs** 3 / 7 (P20, W77, W78). **subject** `dev-dist/p20/fact3b-shapes.mjs` in `scripts/`, `test/`, `examples/`: 0 — untracked. **answered by** none: the ceiling clause was priced at W78 against an exemption list, and taken by no plan since | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — a documentation reduction has no rung and its measurement is untracked; the downward-ratchet clause needs an exemption list and was taken by no plan since P20` |
| Q325 | icebox | **refs** 1 / 2 (W78 only). **subject** `Promise.race` in `AGENTS.md`: 5 (the restructured race, bound by `X4`). **answered by** W78 for the instance; the row says *nothing at this rung* closes the residue | `closes-when` unchanged (empty); note stamp `P29 W124: icebox — the misplaced race was restructured at W78; a timeout on a correct tree cannot be observed, and the row names no road at this rung` |

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 50.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| Q191 | AGREE | icebox; the case list is prose, Q112 resolved, P12's retro passed it |
| Q193 | AGREE | icebox. A resolve was also available: P12's Retro (*Refused, each with a measurement*) refuses *an obligation for the evidence behind a DECISION's stated reason* by name. Either verdict takes it out of `open`, so no dispute |
| Q195 | AGREE | resolve re-derived: P12's Retro, v0.13 change 2, reads *at one, the fix is a second independent expression*. That is the general rule the question says is missing, and it binds every rule 8 set |
| Q196 | AGREE | obsolete re-derived: `const ROLES` 0 hits; examples/l6.ts:6070 reads *both directions of Q196's asymmetry are GONE* (W67) |
| Q197 | AGREE | icebox; nothing says when a pair is required rather than a compound probe |
| Q198 | DISPUTE | resolve → icebox. The P12 refusal is on COST (~20 s a run, *the whole of what ADR 0039 bought back*), and ADR 0070 has since moved self-tests off the local gate into gate:full, so that ground is not permanent (calibration 5). The ledger row on a ladder LEVEL refuses a rung, not a self-test. The vacuity half cites rule 8 (d)'s controls, which bind each item's set, not examples/l6.ts's `check(computed, expected)` sites (calibration 12) |
| Q202 | AGREE | icebox; `CROSS_ROW = 246` is still a declared literal (l6.ts:9121) |
| Q203 | AGREE | icebox; refusal-ledger Owns row |
| Q204 | AGREE | obsolete re-derived: doc/open-questions.md at 988ef5f is a 786-byte pointer and carries no table or census note; W116 |
| Q207 | AGREE | icebox with the trigger in `note`. Calibration 1 would also permit defer, and both take it out of `open` |
| Q208 | AGREE | icebox; ledger row 1 |
| Q209 | AGREE | icebox; check-scheduler-selftest.mjs:590 is still a literal, and its own comment records the agree check catching D6, so the defect is not silent |
| Q210 | AGREE | icebox; the named instance is closed through CHECK_DOCS_DOC |
| Q212 | AGREE | icebox; the row states an honest limit |
| Q213 | AGREE | icebox; check-source S1-S16 has no examples-to-src clause, and the clause is still l6.ts:5729 |
| Q214 | AGREE | icebox; W55 answered the instance and no plan has written the rule |
| Q216 | AGREE | obsolete holds: W67's workerListsAsync reads the document's BYTES and the DIRECTORY, which is the not-source-text second derivation the row asks for. **Noted, not a verdict change**: the docblock at l6.ts:9484-9505 still calls Q216 *a declared limit* and names `poolRoles`/`declaredRoles`, which no longer exist. That stale comment is for a later item |
| Q217 | AGREE | icebox; the ledger row names it, and check-budget.mjs:177 and l6.ts still cite the limit as live |
| Q220 | AGREE | icebox with the trigger in `note` (defer would also do) |
| Q221 | AGREE | icebox; index.ts:2 still has `export *`, no check counts the exported names, and Q101 is iceboxed |
| Q222 | AGREE | icebox; no test binds the two predicates |
| Q233 | AGREE | defer; Q21 is `deferred` |
| Q234 | AGREE | icebox; the runner counts cases (test/runner.ts:46-49) |
| Q235 | DISPUTE | icebox → keep. At 988ef5f, .gitignore has no `.claude` entry. The hazard (an embedded repository staged by `git add -A`) is ADR 0029's class one directory in, and this repository has already lost a sibling checkout to that class. *.gitignore is in no item's Owns* is a reason triage cannot fix it (decision 3). It is not a reason the question has no consumer. It is a cheap, nameable decision: closes-when `the maintainer decides whether .gitignore gains .claude/worktrees/, as a one-line commit outside P29` |
| Q240 | AGREE | resolve re-derived: spec/outcome-record.md section 4 states the 284 B floor, gives the factor per payload size and marks 8.7x as one fixture's figure |
| Q242 | AGREE | icebox; X6 (check-docs.mjs:1276) compares only flow-definition with AGENTS |
| Q243 | AGREE | resolve re-derived: the old sentence has 0 hits in CLAUDE.md and doc/README.md, and P15 line 108 and ADR 0046 line 86 carry the correction. Keeping the ADR in `note` is right (calibration 8) |
| Q246 | AGREE | resolve re-derived: P15:501 (*a per-ROW figure*) and P15:642 re-label the figure, and the refusal is kept by name. The trigger goes to `note` |
| Q252 | DISPUTE | icebox → defer. ADR 0052 consequence 4, the last decision text, says *`deno publish --dry-run` still has no rung … Q252 stays open* (calibration 5 and 7). D8 and S15 bind the two KNOWN dependencies. A third bare npm import would still reach the JSR package as an `npm:` dependency with every check green, and only a consumer would notice: a live, consumer-facing hazard rather than a process what-if. Note: `waits on the plan that first publishes to JSR, which decides whether a release step runs the dry run in a node_modules-less copy (ADR 0052 fact 3)` |
| Q253 | AGREE | icebox; P16:592 *stays open with that choice named*, the harnesses are of finished plans, and the census half went with W116 |
| Q256 | AGREE | icebox |
| Q257 | AGREE | icebox; no idleTimeout row in l6.ts, and no consumer has asked |
| Q267 | AGREE | icebox; S1-S16 has no control-byte clause, one occurrence |
| Q272 | DISPUTE | icebox → keep. At 988ef5f, test/runner.ts:38 is still a bare `await import` outside any `try`. It has recurred at W62, W72 (twice), W73 (three times) and in P19's Record, the most recurrent defect in this band (13 files cite it). The fix is priced at a few lines in one file. The v0.24 grader reads each crash correctly, but that is a cost paid on every occurrence, not a closure. Closes-when: `a decision that test/runner.ts reports an unimportable suite as one named failure, or that the crash stays by choice` |
| Q274 | AGREE | icebox; runId is still `r${i + 1}` (l6.ts:4420) |
| Q276 | AGREE | icebox; the FAIL indentations still differ between runner.ts:53 and run-browser-tests.mjs:102 |
| Q283 | AGREE | keep; still two functions (registry.ts:384, :458), diverged twice (W65 P1/P2, W109). The closes-when is a closing decision |
| Q288 | AGREE | icebox |
| Q289 | AGREE | icebox; P20 *declared OUT and NOT closed* |
| Q290 | AGREE | icebox |
| Q292 | AGREE | icebox; ledger row 1 |
| Q302 | AGREE | icebox, not resolve: W82:260 calls the bounds-generating road *Q302's own open road, which P21 stop-and-ask (d) declines deliberately* |
| Q310 | AGREE | icebox |
| Q312 | AGREE | icebox |
| Q315 | AGREE | icebox; P20 decision 5 and the maintainer's road |
| Q317 | AGREE | icebox; ledger dated-ceiling row; Q486 is open in W126's band |
| Q321 | AGREE | icebox |
| Q323 | AGREE | icebox; scripts/*-selftest.mjs all carry timeouts, and the rule 8 harnesses are per item |
| Q324 | AGREE | icebox |
| Q325 | AGREE | icebox |

**Reader count: 50 rows over the 50 ids. AGREE 46, DISPUTE 4 (Q198, Q235, Q252, Q272), CHANGE 0**,
counted from this table by script. The worksheet's 50 rows and its tally (keep 1, defer 1, icebox
40, resolve 5, obsolete 3) were confirmed by the same script. If all four disputes are taken, the
tally becomes keep 3, defer 2, icebox 38, resolve 4, obsolete 3. The reader's own independent
verdicts, written before the worksheet was opened, differed on more rows than these four. Every
other difference was icebox against defer (Q207, Q220, Q221, Q222) or icebox against resolve
(Q193). Both verdicts in each pair take the question out of `open`, so none is disputed.

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row, with the figures counted
from the table by script.*

**The maintainer, 2026-10-06:** *"Approve, taking reader's".* The approved set is **the worksheet
above with the Reader section's four DISPUTE rows taken, with the Reader's stated replacements**,
and nothing else. The worksheet's rows are not rewritten; the table below is the approved verdict for
every row that differs from them. Where the Reader gave no exact field value, it is derived from the
Reader's reason under the calibration: a keep's `closes-when` is the closing condition the Reader
wrote (clause 1), a defer's waited-on thing goes in `note` and `closes-when` stays empty (clause 9),
and an ADR that does not decide the question is cited in `note`, never in `resolved-by` (clause 8).
**No `resolved-by` names an ADR, so no ADR's `resolves` is edited by this item.** No earlier batch's
stamp is fired or emptied by the four changes, so there is no re-stamp and the gate's stamp count
stays 50.

| id | worksheet | approved | taken from | approved fields |
|---|---|---|---|---|
| Q198 | resolve | **icebox** | Reader DISPUTE | `icebox`, not `resolved`; `resolved-by` stays empty; `closes-when` unchanged (empty). P12's refusal rests on cost, a ground ADR 0070 moved; rule 8 (d)'s controls bind each item's set, not the cross-row bound in examples/l6.ts (calibration 5 and 12) |
| Q252 | icebox | **defer** | Reader DISPUTE | `deferred`; `closes-when` unchanged (empty); `resolved-by` stays empty; the waited-on plan (the first JSR publish, ADR 0052 fact 3) in `note`. ADR 0052 consequence 4 says Q252 stays open (calibration 5 and 7); ADR 0052 is cited in `note` only |
| Q272 | icebox | **keep** | Reader DISPUTE | stays `open`; `closes-when` **set**: `a decision that test/runner.ts reports an unimportable suite as one named failure, or that the crash stays by choice`. test/runner.ts:38 imports every suite outside any `try` at 988ef5f |
| Q235 | icebox | **keep** | Reader DISPUTE | stays `open`; `closes-when` **set**: `the maintainer decides whether .gitignore gains .claude/worktrees/, as a one-line commit outside P29`. `.gitignore` has no `.claude` entry at 988ef5f; the fix itself is a separate commit outside P29 |

**The counts, measured from the tables by script** (`dev-dist/w124k-44394/tally.mjs`, EXIT 0): the
worksheet has **50 rows over the 50 ids**, none missing, none extra, none twice, and its tally is the
summary line's (keep 1, defer 1, icebox 40, resolve 5, duplicate 0, obsolete 3); the Final approved
verdicts table below has **50 rows over the same 50 ids** and counts **keep 3 (Q235, Q272, Q283),
defer 2 (Q233, Q252), icebox 38, resolve 4 (Q195, Q240, Q243, Q246), duplicate 0, obsolete 3 (Q196,
Q204, Q216) — 50**. That is the Reader's predicted tally with all four disputes taken.

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, and the maintainer's answer.*

**Stop-and-asks**, one per row still `keep` after the approval. The briefing is the one put to the
maintainer (`dev-dist/w124k-44394/briefing.md`). **Nothing in these rows is applied before each is
answered** (phase 4).

| | the question, the briefing and the recommendation | answer |
|---|---|---|
| Q235 | **Rec: keep.** *Should `.gitignore` list `.claude/worktrees/`?* It is one line and the decision is the maintainer's now. Example: an agent leaves a worktree at `.claude/worktrees/x/`, someone types `git add -A`, and git stages it as an embedded repository inside this one. W53 (an item of P15, what a run retains) hit exactly that and unstaged it by hand. At 988ef5f, `.gitignore` has no `.claude` entry. ADR 0029 (nothing reaches outside the working tree) exists because a recursive git command once followed a link and deleted the sibling repository. **Keep**: the maintainer decides; the line lands as its own commit outside P29. **Defer**: wait until a commit lands one. **Icebox**: rely on git's loud warning. **Resolve**: refuse the line by name | **keep** — 2026-10-06, maintainer: *"Keep all three"*, with the approved row's `closes-when`: the maintainer decides whether `.gitignore` gains `.claude/worktrees/`, as a one-line commit outside P29 |
| Q272 | **Rec: keep.** *Should a test file that cannot load show up as a red test?* Cheap and recurring. Example: a suite with a syntax error, or a module-scope assertion that throws, makes `npm test` exit 1 with zero `FAIL` lines, naming no test. At 988ef5f, `test/runner.ts` line 38 imports every suite outside any `try`. It recurred at W62 (the jsonata adapter), W72 (examples beside schemas), W73 (the wiring check, three times) and P19 (what a schema buys an author). The workflow's grader controls (rule 8, v0.24: grade a crash as a crash) read each correctly, at a cost each time. **Keep**: decide between wrapping the import to report one named failure and keeping the crash. **Defer**: until the runner is next edited. **Icebox**: the crash stays. **Resolve**: refuse the change by name | **keep** — 2026-10-06, maintainer: *"Keep all three"*, with the approved row's `closes-when`: a decision that `test/runner.ts` reports an unimportable suite as one named failure, or that the crash stays by choice |
| Q283 | **Rec: defer.** *Should `checkRegistry` and `resolveRegistry` become one shape check?* Both validate the registry (workers, node types, pools). `checkRegistry` serves a hand-built `Driver`; `resolveRegistry` serves a registry document. At 988ef5f they are still two functions (src/definition/registry.ts lines 384 and 458), sharing key lists. They diverged twice: W65 (the registry document item) found the driver side accepting a typo, `settingSchema`, so no schema applied; W109 (a node that only transforms) found it accepting a node type named like the built-in `Transform`. W66 (the runtime entry), its owner, calls both and did not merge them. **Keep**: decide now, merge or not. **Defer**: the next item touching the registry's shape decides. **Icebox**: fix divergences as found. **Resolve**: declare the shared key lists the binding | **keep** — 2026-10-06, maintainer: *"Keep all three"*, **overriding the briefer's defer recommendation**, with the worksheet row's `closes-when`: a decision that `checkRegistry` and `resolveRegistry` share one shape function called from both, or that the shared key lists alone are declared the binding |

#### Final approved verdicts

*Filled in after phase 4, counted from this table by script.*

**50 rows: keep 3, defer 2, icebox 38, resolve 4, duplicate 0, obsolete 3** — counted from this
table by script — before the keeps round by `dev-dist/w124k-44394/tally.mjs`, and **after it** by
`dev-dist/w124a-44515/apply.mjs`, which re-tallies this table before writing. **This table is final.**
**The keeps round was answered 2026-10-06** (*"Keep all three"*): Q235, Q272 and Q283 all stay keep
with their rows' `closes-when`, Q283 by the maintainer **over the briefer's defer recommendation**, so
the figures are unchanged by it. *From*: **W** the worksheet, **R** the Reader's DISPUTE as approved,
**K** the keeps round. Every
row's `note` gains the stamp `P29 W124: <verdict>`, with the reason, after `; ` where the note was not
empty; a field not named is unchanged. An *obsolete* is `status: resolved` with `resolved-by` opening
`obsolete:` (P29 decision 1).

| id | final | from | fields applied |
|---|---|---|---|
| Q235 | keep | R, K | stays `open`; `closes-when` **set** (was a trigger, *a commit that actually lands one*): `the maintainer decides whether .gitignore gains .claude/worktrees/, as a one-line commit outside P29`; stamp `P29 W124: keep — the keeps round, 2026-10-06; .gitignore still has no .claude entry at 988ef5f, the ADR 0029 hazard class one directory in; the fix itself is a separate commit outside P29` |
| Q272 | keep | R, K | stays `open`; `closes-when` **set**: `a decision that test/runner.ts reports an unimportable suite as one named failure, or that the crash stays by choice`; stamp `P29 W124: keep — the keeps round, 2026-10-06; test/runner.ts:38 still imports every suite outside any try, recurring at W62, W72, W73 and P19; the fix is a few lines in one file outside P29` |
| Q283 | keep | W, K | stays `open`; `closes-when` as the worksheet's row; stamp `P29 W124: keep — the keeps round, 2026-10-06, the maintainer over the briefer's defer recommendation; the two halves diverged twice (W65, W109), so whether they become one is a library decision` |
| Q233 | defer | W | `deferred`; `closes-when` **cleared**; the worksheet's stamp |
| Q252 | defer | R | `deferred`; `closes-when` unchanged (empty); `resolved-by` stays empty; ADR 0052 cited in `note`, so no R8 edit; stamp `P29 W124: defer — waits on the plan that first publishes to JSR, which decides whether a release step runs deno publish --dry-run in a node_modules-less copy (ADR 0052 fact 3); ADR 0052 consequence 4 says Q252 stays open, and D8 and S15 bind only the two known dependencies` |
| Q191 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q193 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q197 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q198 | icebox | R | `icebox`, not `resolved`; `resolved-by` stays empty; `closes-when` unchanged (empty); stamp `P29 W124: icebox — P12's Retro refused a ladder level for L6's own self-test on its cost, a ground ADR 0070 moved by taking the self-tests off the local gate, so the refusal is not permanent; rule 8 (d)'s vacuity controls bind each item's set, not examples/l6.ts's cross-row bound; no plan has taken either half since P13` |
| Q202 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q203 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q207 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q208 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q209 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q210 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q212 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q213 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q214 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q217 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q220 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q221 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q222 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q234 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q242 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q253 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q256 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q257 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q267 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q274 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q276 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q288 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q289 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q290 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q292 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q302 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q310 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q312 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q315 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q317 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q321 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q323 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q324 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q325 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q195 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |
| Q240 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |
| Q243 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |
| Q246 | resolve | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR; `closes-when` **cleared** |
| Q196 | obsolete | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |
| Q204 | obsolete | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |
| Q216 | obsolete | W | `resolved`; `resolved-by` as the worksheet's row; names no ADR |

## Verification

The gate's clauses, each run redirected with its exit code read in the same command:

| clause | how |
|---|---|
| reader report | the Reader's findings table, one row per worksheet row, 50 |
| maintainer approval | the Approval section |
| keeps round | the Keeps round section, one answered row per keep |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for a question raised from `q524.md`-`q526.md` (made visible with `git add -N`); no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W124" --count > n.log 2>&1; echo EXIT=$?` — **50**, plus one for each re-stamp declared under Exceptions. `--include-icebox` is required: without it the lookup hides every icebox verdict |
| `git diff --name-only` against Owns | by hand, before the Record (`doc/workflow.md` section 7 rule 2) |
| own-id and withdrawn-claim grep | `W124` and any withdrawn figure, excluding `dev-dist/` (section 1 rule 5) |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in 2026-10-06, by the apply unit, with the tree still.* Scratch: `dev-dist/w124a-44515/`
(`tally.mjs`, `apply.mjs` and every log below). Node v24.20.0 by `fnm use 24` in every shell.
Nothing committed.

**Final verdicts: 50 — keep 3 (Q235, Q272, Q283), defer 2 (Q233, Q252), icebox 38, resolve 4 (Q195,
Q240, Q243, Q246), duplicate 0, obsolete 3 (Q196, Q204, Q216).** 47 of the 50 leave `open` (94%).
`tally.mjs` re-counted the worksheet and the *Final approved verdicts* table after the keeps round
(EXIT 0, `tally.log`), and `apply.mjs` re-tallied the Final table again before writing and refuses
any other figure; both matched. **The keeps round**: the maintainer, 2026-10-06, *"Keep all three"* —
Q235, Q272 and Q283 stay keep with their rows' `closes-when`. **Q283 was kept over the briefer's defer
recommendation**; Q235 and Q272 followed theirs. The two whose `closes-when` is a fix outside P29
(Q235's `.gitignore` line, Q272's `test/runner.ts` change) keep it as written. **R8**: no ADR's
`resolves` was edited — no `resolved-by` of the seven resolutions names an ADR (`apply.mjs` refuses
one), and ADR 0046, 0052, 0044, 0058 and 0060 are cited in `note` only. **No re-stamp**, so the stamp
count is the row count. The three obsoletes are `status: resolved` with `resolved-by` opening
`obsolete:`.

**How it ran.** The reader returned **AGREE 46, DISPUTE 4 (Q198, Q235, Q252, Q272), CHANGE 0**; the
maintainer approved taking all four. **1 of the 5 proposed resolves was overturned** (Q198, to
icebox), against W123's 5 of 10. **P29 prediction 3 held.** **The propose phase was interrupted by an
API outage mid-worksheet and resumed**; the resumed worksheet was counted by script against the 50
ids — 50 rows, none missing, none extra, **none twice** — so the outage left no duplicate row.

**Gate — what ran.** Each run redirected, with `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| reader report | done | 50 rows: AGREE 46, DISPUTE 4, CHANGE 0 |
| maintainer approval | done | 2026-10-06, *"Approve, taking reader's"* |
| keeps round | done | 3 rows (Q235, Q272, Q283), all kept: *"Keep all three"*, Q283 against its defer recommendation |
| `tally.mjs` | EXIT 0 | `tally.log`: worksheet 1/1/40/5/0/3, final 3/2/38/4/0/3, each 50 rows over the 50 ids |
| `apply.mjs` | EXIT 0 | `apply.log`: 50 questions, 0 ADRs; a dry run first (`dry.log`, EXIT 0), every field read before writing |
| name-status M/A only | EXIT 0 | `ns.log`: 50 `M`, no `A`, `D` or `R` |
| `check:register` | EXIT 0 | `reg.log`: R8 compared 24 pairings, unchanged from W123's, and excused 1 (Q466 → ADR 0077) |
| `check:markdown` | EXIT 0 | `md.log` |
| `check:markdown:selftest` | EXIT 0 | `mds.log`: 42/42 probes caught, 41/41 noticed, 7/7 bounded |
| stamp count | EXIT 0, **50** | `n.log`: 50 declared, no re-stamp |
| `git diff --name-only` against Owns | in Owns | `names.log`, 51: the 50 owned question files and this file. No ADR, no `q524.md`-`q526.md` |
| own-id and withdrawn-claim grep, excluding `dev-dist/` | clean | `W124` outside this file and `doc/questions/` is in P29's index row and W123's file (forward references). The worksheet's phase-1 summary (*keep 1, defer 1, icebox 40, resolve 5*) is marked superseded where it stands; the Final table's *pending the keeps round* markers are gone |

*Re-run after this Record was written, on the final tree:* `tally`, name-status, `check:register`,
`check:markdown`, `check:markdown:selftest` (42/42) and the stamp count (50), each EXIT 0 (`*2.log`);
`names2.log` 51.

**Questions raised: none.** Q524, Q525 and Q526 were not issued: they are skipped, never reissued.

**For a later item, outside P29.** The reader noted (Q216's row) that the docblock at
`examples/l6.ts:9484-9505` still calls Q216 *a declared limit* and names `poolRoles` and
`declaredRoles`, which no longer exist. Q216 is now obsolete, so that comment is stale. `examples/`
is outside this item and outside P29's scope; it is recorded here, not fixed.

**The band label.** P29's index row says *"Q190-Q325"*; the band's first id is **Q191** (Q190 is a
range bound, in *Decisions and data*, W122's band). The plan is not edited here; the join records it.

**What this taught** — the calibration for W125:

1. **Process bands resolve less than they appear to**: 4 of 50 here, and 1 of 5 proposed resolves fell, so propose icebox when a rule's ground could move (Q198: a cost refusal ADR 0070 moved).
2. **Re-read the last decision text for every icebox too, not just resolves**: Q252's ADR 0052 consequence 4 says *stays open*, so it was a defer.
3. **A cheap, nameable fix outside the plan is a keep, not an icebox** — *in no item's Owns* is not *no consumer* (Q235, Q272); the maintainer also kept Q283 over a defer recommendation.
4. **A resumed propose phase is re-counted by script for duplicates** before the reader starts.
5. **Stale comments naming a question the batch closes are reported, not fixed** — collect them in the Record for one later item (here `examples/l6.ts:9484-9505`, Q216).
