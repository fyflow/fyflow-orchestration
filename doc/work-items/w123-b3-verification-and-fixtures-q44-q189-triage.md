# W123 — B3: a verdict for each of the first 50 open questions in the verification-and-fixtures cluster, Q44-Q189

**Status:** done — the 50 approved verdicts applied on 2026-10-06 after the keeps round, no ADR edited, no question raised, and every gate clause EXIT 0; see the Record
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

*How the evidence was taken (phase 1, the propose unit).* **refs** is `node scripts/lookup.mjs refs Q<n>`
run in a `git archive` of `988ef5f` (`dev-dist/w123p-38771/base`, 0 links, EXIT 0 for all 50), given as
*files / mentions*. **subject** is `git grep -c -F '<pattern>' 988ef5f -- <paths>`, summed over files, or
a `git show 988ef5f:<path>` line; a path that does not exist at `988ef5f` is said to be absent. Nothing was
read from the working tree. The last text that speaks to each question was found by reading the
highest-numbered plan, item and ADR among its citing files (calibration 7). Every row states
`closes-when` (calibration 9): only Q184 had a value, a trigger that has fired, and it is cleared.

**Proposal summary: 50 rows — keep 2, defer 6, icebox 31, resolve 10, duplicate 1, obsolete 0**,
counted from the table below by script, which also confirmed 50 rows over exactly the 50 ids, none
missing, none extra, none twice. Keeps: Q123, Q142. Defers: Q111, Q173, Q174, Q175, Q181, Q182.
Resolves: Q45, Q112, Q121, Q138, Q151, Q152, Q153, Q157, Q172, Q176. Duplicate: Q145 → Q150, which is
iceboxed in this batch and so stays (calibration 4). **One resolution names an ADR, so apply also adds
the id to that ADR's `resolves` (R8): Q176 → ADR 0070.** *(Superseded at the approval: Q176 went
icebox and the ADR 0070 edit was dropped; no ADR is edited by this item.)* Q102 (ADR 0076), Q181 and Q182 (ADR 0072) name
an ADR that narrows and does not decide, so it is cited in `note` (calibration 8). No duplicate points
at W124-W126's band, and no earlier batch's stamp is fired or emptied by a row here, so there is no
re-stamp and the gate's stamp count stays 50.

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q44 | icebox | **refs** 10 / 20. **subject** `Q44` in `examples/l6.ts` + `test/`: 15 — every L6 and test site that runs a flow the corpus cannot carry cites it as its reason for a local copy; `examples/flows/` holds the run-shaped twins. **answered by** none by name: the split (`spec/examples/` normative and validated at L4, `examples/flows/` the run-shaped copies) has held since W5 and was re-applied by W6, W17, W35, W43 and W58 with no decision asked for | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the working split, spec/examples/ normative and validated at L4 and examples/flows/ the run-shaped copies, has held since W5 through W58 without anyone asking for a decision; no consumer wants another answer` |
| Q45 | resolve | **refs** 13 / 21. **subject** `this document accepts it` in `spec/flow-definition.md`: 1 (section 4: *one `end` node may be shared by two SIBLING regions … it is Q45's shape, and this document accepts it*, with `innermost(n)` undefined and `branchIndexOf` `null`); `sibling-fanouts` in `spec/examples/valid/`: 1 (the shape in the normative corpus, W49/W50). **answered by** W20 (the spec text) and W49/W50 (the corpus flow). The comment in `test/definition/nesting.test.ts` calling Q45 *open* is W20's, earlier than the corpus flow | `closes-when` unchanged (empty); `resolved-by`: supported explicitly — `spec/flow-definition.md` section 4 accepts two sibling regions sharing one `end` (W20), and `spec/examples/valid/sibling-fanouts.flow.json` carries the shape (W49, W50). No ADR, so no R8 edit |
| Q98 | icebox | **refs** 21 / 34. **subject** `assertions, on` in `test/runner.ts`: 1 (line 62 still labels the case count *assertions*); ``is a count of `test()` CASES`` in `CLAUDE.md`: 1. **answered by** none: P8 and P9 named it *no owner, the noun stays cases*; every Record since quotes the convention | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the reading is fixed by convention (CLAUDE.md: a count a Record calls assertions is a count of test() cases, never added to L6's); relabelling the runner's line was passed by P8 and P9 and taken by no plan since` |
| Q99 | icebox | **refs** 13 / 29. **subject** `Q99` in `examples/l6.ts`: 4, one of them an assertion of the `threaded` knob's setting (line 9928). **answered by** none whole: W67 measured forcing every type inline at **0** failures and kept the knob deliberately; `doc/workflow.md` section 5 rule 8 obligation (f), *break the ORDER* (v0.25, P24), makes delaying workers and the other pool mode a provocation rather than an assertion | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — W67 measured the inline knob at 0 and kept it on purpose; rule 8 obligation (f) (v0.25) provokes delay and pool mode instead of asserting them; asserting the other knobs has no taker since W17` |
| Q100 | icebox | **refs** 28 / 61. **subject** `Q100` in `examples/l6.ts` + `test/matrix/`: 8. **answered by** none as a class; instances fixed one by one — W24's report-row clause, W34's table asserted field by field, W86's repair asserted (`l6.ts`: *Q100 answered yes by the item that introduced it*). P8 and P9: *no owner* | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — a class, not a decision: each instance is fixed where it is found (W24, W34, W86) and no general mechanism has been proposed since P8` |
| Q101 | icebox | **refs** 17 / 25. **subject** `documented` in `AGENTS.md`: 4 (section 9's snippet compares the list to the PACKAGE's exports). **answered by** W18 for the array-vs-exports half; the array-vs-PROSE half is the note's *measured and open*, and no item took it across P9-P24 (P23 and P24 cite only the working half) | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the exports half is bound since W18; binding the prose half has had no taker from P9 to P28` |
| Q102 | icebox | **refs** 74 / 154. **subject** `RUN_FLOOR` in `scripts/check-docs.mjs`: 13. **answered by** none whole: plans now name the floor files their items take (P20, P21 seed tables), and ADR 0076 decision 1 fixes the only criterion for lowering a ratchet. ADR 0076 decision 1 does not decide ownership, so it is cited in `note`, not `resolved-by` (R8) | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — handled by declaration: each plan seeds the floor files its items take (P20, P21), and ADR 0076 decision 1 fixes when a ratchet may be lowered; an owner for the files, or derived floors, has not been proposed` |
| Q104 | icebox | **refs** 5 / 7. **subject** `X4a` in `scripts/check-docs.mjs`: 1 (line 173, still *any `throw`*). **answered by** none: W18 raised it, P9 named it *no owner*, W29 listed it, nothing since | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — X4a still accepts any throw; one occurrence at W18 and no taker since P9` |
| Q111 | defer | **refs** 7 / 9. **subject** `<attempt>` in `spec/task-id.md`: 1 (the fourth segment, *the flow-level attempt, 0 on first dispatch*). **answered by** none: W58 confirmed it still inert; P16 ties it to Q16's flow-level retry half, which W121 deferred | `status: deferred`; `closes-when` unchanged (empty); note stamp `P29 W123: defer — the segment is live only once a flow-level retry mints a non-zero attempt; waits on Q16 (deferred at W121)` |
| Q112 | resolve | **refs** 12 / 27. **subject** `break the PROVENANCE of every value an assertion reads` in `doc/workflow.md`: 1 (section 5 rule 8 obligation (c), v0.8 P6 and v0.9 P7). **answered by** that obligation; P9's retro: *not corrected once in four items*, and W42 *Q112 settles the general form* | `closes-when` unchanged (empty); `resolved-by`: `doc/workflow.md` section 5 rule 8 obligation (c), *break the provenance — the source expression and nothing else* (v0.8, P6; v0.9, P7), held clean through P9 by its retro. No ADR |
| Q121 | resolve | **refs** 10 / 26. **subject** `fail('M1'` in `scripts/check-markdown.mjs`: 1; its scan reads `doc/`, `spec/`, `README.md`, `AGENTS.md` and `CLAUDE.md`. **answered by** W25 (P8's table: *W25 — RESOLVED*); P29's own *Why* names it | `closes-when` unchanged (empty); `resolved-by`: `M1` in `scripts/check-markdown.mjs` (W25) — every relative link in `doc/`, `spec/` and `AGENTS.md` resolves. No ADR |
| Q122 | icebox | **refs** 1 / 1. **subject** `Q122` in `test/`: 0. **answered by** none: W22 alone, nothing since P7 | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — one mention (W22); widening the depth-1-only whole-matrix claims has had no taker since P7` |
| Q123 | keep | **refs** 15 / 26. **subject** `.gitattributes` at `988ef5f`: absent (0); `CLAUDE.md` carries the hand rule and three occurrences. **answered by** none | `closes-when`: the maintainer decides whether to fix line endings in the tree — a `.gitattributes` with `eol=lf`, or a check that refuses a CRLF tracked file — or declines both and keeps the hand rule in `CLAUDE.md` |
| Q124 | icebox | **refs** 2 / 4. **subject** `Q124` in `test/`: 0. **answered by** none: W22 raised it, W23 deferred it to a depth-3 row nobody built | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — needs a depth-3 row no plan has asked for since P7` |
| Q127 | icebox | **refs** 2 / 2. **subject** `Q127` in `examples/` + `test/`: 0. **answered by** none: W23 alone | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — four depth-2 L6 coverage gaps named by W23 and taken by no plan since P7` |
| Q132 | icebox | **refs** 8 / 17. **subject** `Q132` in `scripts/`: 5. **answered by** W30 in part (9 of the 16 unprobed clauses, P9's table); the other 7 are named *no probe* in P9 decision 3 | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — W30 probed 9 of 16; P9 decision 3 names the other 7 as no probe, and no plan since has taken them` |
| Q134 | icebox | **refs** 3 / 4. **subject** `'S11'` in `scripts/check-source.mjs`: 7 (still live; ADR 0070 decision 3 relies on it). **answered by** none: P9 *no owner* | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — retiring S11's membership half was named at W24 and P9 and taken by no one; S11 is still read by ADR 0070 decision 3` |
| Q136 | icebox | **refs** 5 / 10. **subject** `Q136` in `scripts/check-markdown.mjs`: 1. **answered by** none: the ten shapes were at zero occurrences at W25 and P9 named it *no owner* | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — ten markdown shapes at zero occurrences; what-if until a document uses one` |
| Q137 | icebox | **refs** 9 / 19. **subject** `uses them and` in `scripts/check-markdown.mjs`: 1 (*`M3` uses them and `C5` does not*). **answered by** none: W30 made it buildable and did not build it. `M1` also scans `spec/`, so a dead `spec/` link is caught by `M1` whatever `C5` does | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — M1 scans spec/ too, so C5 alone passing vacuously cannot hide a dead spec/ link; buildable since W30 and taken by no plan` |
| Q138 | resolve | **refs** 19 / 36. **subject** `fires for the reason it NAMES` in `doc/workflow.md`: 1 (section 5 rule 8, v0.10 P9, citing Q138). **answered by** W28 (P9's table: *the contract change is this row's own proposed fix*); the residue halves are Q145 and Q147 | `closes-when` unchanged (empty); `resolved-by`: W28 (P9) — every META grading names the probe it breaks; `doc/workflow.md` section 5 rule 8, *a provocation is evidence only when it fires for the reason it names* (v0.10). Residue: Q145, Q147. No ADR |
| Q142 | keep | **refs** 62 / 154. **subject** `fail('M3'` in `scripts/check-markdown.mjs`: 1 (the floor still a literal). **answered by** none: ADR 0076 and ADR 0078 retune the window by measurement and say it recurs; W116 met it a twelfth time, and W123's own declaration hit the same mechanism at `M4` | `closes-when`: the maintainer decides whether `check-markdown`'s floors stay hand-tuned literals retuned per ADR 0076 and ADR 0078, or are derived from the probe trees so that adding documents cannot close the window |
| Q143 | icebox | **refs** 8 / 17. **subject** `Q143` in `scripts/`: 8. **answered by** none as a rule; `doc/workflow.md` section 5 rule 8's harness rows (anchor checked against the current text, v0.17) narrow it | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — a harness pitfall fixed where met (W28, W31); no rule proposed since P9` |
| Q144 | icebox | **refs** 8 / 20. **subject** `Q144` in `scripts/`: 5. **answered by** W29 (the `ran:` case constructed) and W31 (a `SELF` list) in part | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — W29 constructed the missing case and W31 bounded the file; nothing further asked since P10` |
| Q145 | duplicate | **refs** 5 / 11. **subject** `MAX_CORPUS` in `scripts/`: 27, in five self-tests. **answered by** the same mechanism as Q150: a `corpus` grading passes, and `MAX_CORPUS` is the cap that refuses noise beyond a measured bound | `status: resolved`; `closes-when` unchanged (empty); `resolved-by`: duplicate of Q150 — both ask whether a corpus grading should pass, and Q150 holds the cap |
| Q146 | icebox | **refs** 8 / 23. **subject** `Q146` in `scripts/`: 12 — the failure-COUNT discriminator built in `check-scheduler-selftest.mjs`, `check-spec-selftest.mjs` and `check-wiring-selftest.mjs`. **answered by** W29 and W30 per file; lifting it into the grading contract taken by no plan | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the count discriminator exists in three self-tests (W29, W30); a contract-wide form has had no taker since P9` |
| Q147 | icebox | **refs** 7 / 16. **subject** `WRONG-REASON` in `scripts/`: 2. **answered by** none in the META contract; `doc/workflow.md` section 5 rule 8's grader control (v0.24) covers rule 8 sets, not META entries | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the right verdict by the wrong route recurs (W29, W30, W31); no contract change proposed since P9` |
| Q150 | icebox | **refs** 7 / 24. **subject** `MAX_CORPUS` in `scripts/`: 27, in `check-budget`, `check-policies`, `check-register`, `check-source` and `check-spec` self-tests; none in `check-docs`, `check-markdown`, `check-scheduler` or `check-workers` self-tests, which do grade `corpus`. **answered by** W30 and W31 in part | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — MAX_CORPUS caps it in five self-tests and is absent in four (docs, markdown, scheduler, workers); no plan has taken the four since W31` |
| Q151 | resolve | **refs** 6 / 16. **subject** `a **control** that changes nothing comes back clean` in `doc/workflow.md`: 1 (section 5 rule 8 harness, v0.11 P10). **answered by** W31's control run (P10's Record: *W31 closed Q151 with a control run*) | `closes-when` unchanged (empty); `resolved-by`: W31's control run (P10's Record) and `doc/workflow.md` section 5 rule 8's harness requirement, *a control that changes nothing comes back clean* (v0.11, P10). No ADR |
| Q152 | resolve | **refs** 2 / 8. **subject** `nothing, and nothing can` in P9: 2 (its table row 9: *a message-only clause, which assigns a diagnosis and touches no verdict*). **answered by** P9's Record, by name and permanently | `closes-when` unchanged (empty); `resolved-by`: P9's Record, row 9 — a message-only clause is noticed by nothing and nothing can notice it (W31). No ADR |
| Q153 | resolve | **refs** 4 / 9. **subject** `new Set(selfMutants).size !== SELF.length` in `scripts/check-wiring-selftest.mjs`: 1; a `new Set(…).size` bound is in eight self-tests. **answered by** W31 (*a duplicate entry costs 1, where it cost 0 before*) | `closes-when` unchanged (empty); `resolved-by`: the SELF distinctness bound (W31), in `scripts/check-wiring-selftest.mjs` and its sibling self-tests — a duplicate entry fails the file. No ADR |
| Q155 | icebox | **refs** 4 / 11. **subject** `the rung Q155 names` in `test/driver/map.test.ts`: 1 (W33's case: the driver re-run over one log twice). **answered by** W33 for map arity only; items since state L3's scope (W33, W34) | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the driver-twice case Q155 names exists for map arity (W33); widening L3 itself has had no taker since P10` |
| Q157 | resolve | **refs** 19 / 25. **subject** `Kept as a PROCEDURE, refused as a rule` in P18: 1 (its retro, citing Q157). **answered by** P18's retro; P20-P24 carry the seed table naming the items that take `AGENTS.md` | `closes-when` unchanged (empty); `resolved-by`: P18's retro — the declaration-time seed of files like `AGENTS.md` is kept as a procedure and refused as a rule. No ADR |
| Q162 | icebox | **refs** 5 / 8. **subject** `Q162` in `scripts/`: 2. **answered by** none: W34 declared the prose revert a ceiling | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — binding join-policy section 3's text would be a check over prose, which the refusal ledger's first row refuses; W34 declared it a ceiling` |
| Q170 | icebox | **refs** 8 / 20. **subject** `CROSS_ROW` in `examples/l6.ts`: 27 (the comment at line 5497 states the order and the seven assertions after the check). **answered by** none: held by `DECLARED_TOTAL` | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the assertions after the check are held by DECLARED_TOTAL; one floor and stated in place since W35` |
| Q172 | resolve | **refs** 3 / 8. **subject** `an **asserted restore**, bytes compared back` in `doc/workflow.md`: 1 (section 5 rule 8 harness, v0.11 P10; and the digest and first-snapshot row, v0.17). **answered by** W35's byte-snapshot harness and that rule | `closes-when` unchanged (empty); `resolved-by`: `doc/workflow.md` section 5 rule 8's harness requirements — an asserted restore, bytes compared back (v0.11, P10), and the content digest with the first snapshot as restore target (v0.17, P16). No ADR |
| Q173 | defer | **refs** 1 / 3. **subject** `'D3'` in `scripts/check-scheduler.mjs`: 7. **answered by** none: one occurrence (W37); L6 in Deno went red, so nothing was silent | `status: deferred`; `closes-when` unchanged (empty); note stamp `P29 W123: defer — waits on the next scheduler pin move, the only time a declared version can be unreachable` |
| Q174 | defer | **refs** 1 / 2. **subject** `@fyflow/scheduler` in `deno.lock`: 3, after W37 regenerated it. **answered by** none | `status: deferred`; `closes-when` unchanged (empty); note stamp `P29 W123: defer — waits on the next scheduler pin move, which is when dead anchors accumulate` |
| Q175 | defer | **refs** 2 / 4. **subject** `'D7'` in `scripts/check-scheduler.mjs`: 4; `0.5.2` in `spec/`: 21, true today because the pin is 0.5.2. **answered by** none | `status: deferred`; `closes-when` unchanged (empty); note stamp `P29 W123: defer — the spec prose is true at 0.5.2 and goes stale only at the next scheduler pin move` |
| Q176 | resolve | **refs** 5 / 15. **subject** `is the LADDER and nothing else` in ADR 0070: 1 (decision 1; decision 2 moves the self-tests to CI on the measured split, 245 s against 1571 s). **answered by** ADR 0070, which decides where a class of checks runs by its cost; ADR 0039 priced order and concurrency the same way | `closes-when` unchanged (empty); `resolved-by`: ADR 0070 — where the self-tests run is decided by their measured cost (the ladder local, the self-tests in CI). **Apply also adds Q176 to ADR 0070's `resolves` (R8).** ADR 0039 goes in `note`. *(Superseded at the approval: icebox, no R8 edit)* |
| Q177 | icebox | **refs** 2 / 5. **subject** `"lint": "deno lint src/ test/ examples/ index.ts"` in `package.json`: 1; `scripts` in the four `tsconfig*.json`: 0. **answered by** none: stated in W38's and W39's L0 rows and taken by no plan since P11 | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — L0 still skips scripts/**; every item since W38 says so in its L0 row, and no plan has asked to lint or typecheck it` |
| Q178 | icebox | **refs** 10 / 17. **subject** `Q178` in `scripts/`: 7. **answered by** none: the hazard recurs (W38, W105, W112, ADR 0072, ADR 0076) and each is fixed where it happens | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — a recurring pitfall with no proposed mechanism; each occurrence is fixed by anchoring or splitting the literal` |
| Q179 | icebox | **refs** 42 / 82. **subject** `Q179` in code and spec: 25. **answered by** none whole: P21 decision 5 quotes its own cost as a ratio, and W104, W109 and W110 state the precondition | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — a standing caveat cited as vocabulary; plans quote ratios (P21 decision 5) and no reproducible gate-wall measure has been proposed` |
| Q180 | icebox | **refs** 9 / 20. **subject** `What this does NOT fix is [Q180]` in ADR 0070: 1. **answered by** none: ADR 0070 moved the boot cost to CI and says so | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — ADR 0070 moved the self-tests and their process boots to CI; an in-process runner has had no taker since W39` |
| Q181 | defer | **refs** 14 / 29. **subject** `fail('G6'` in `scripts/check-wiring.mjs`: 4. **answered by** ADR 0072 (W105) in part: consequence 6, *narrowed rather than closed* — `G6` binds the path, and a self-test that mutates outside `dev-dist/` still declares it in prose. ADR 0072 does not close it, so it goes in `note` (R8) | `status: deferred`; `closes-when` unchanged (empty); note stamp `P29 W123: defer — narrowed by ADR 0072 (G6); reopen if a second self-test writes outside dev-dist/ (today only check-scheduler-selftest does)` |
| Q182 | defer | **refs** 19 / 42. **subject** `are narrowed rather than closed` in ADR 0072: 1 (*what remains of Q182 is stage()'s three declared sites*). **answered by** ADR 0072 (W105) in part; W105: relocating `stage()` would not help | `status: deferred`; `closes-when` unchanged (empty); note stamp `P29 W123: defer — narrowed by ADR 0072 to stage()'s three declared sites; reopen if a fourth undeclared site appears` |
| Q183 | icebox | **refs** 9 / 19. **subject** `Q183` in `scripts/`: 0. **answered by** none: P12, P13 and P14 each called it *live, unowned and not this plan's*; ADR 0039 chose the order | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — passed by P12, P13 and P14; ADR 0039 chose the order and no independent authority has been asked for since` |
| Q184 | icebox | **refs** 5 / 16. **subject** `A function replacement is literal` in W61: 1. **answered by** none as a rule: the old `closes-when`, *a second occurrence*, happened at W61 (P17's table), and P17's retro adopted nothing; the fix is known | `closes-when` **cleared** (was: a second occurrence, or a SELF list hitting it); note stamp `P29 W123: icebox — the second occurrence came at W61 and P17's retro adopted no rule; the known fix is a function replacement` |
| Q185 | icebox | **refs** 1 / 2. **subject** `**break the ORDER**` in `doc/workflow.md`: 1 (section 5 rule 8 obligation (f), v0.25 P24). **answered by** none by name: obligation (f) provokes completion order and does not cite Q185 | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — one occurrence (W41); rule 8 obligation (f) now provokes order in every set` |
| Q188 | icebox | **refs** 1 / 1. **subject** `Q188` in `scripts/` + `test/`: 0. **answered by** none: the hole is closed (Q158 resolved) and this is its residue | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — the residue of a closed hole (Q158); one mention, W41` |
| Q189 | icebox | **refs** 2 / 5. **subject** `Q189` in `scripts/`: 0. **answered by** none: P12's fact corrected in place by W41 | `closes-when` unchanged (empty); note stamp `P29 W123: icebox — one occurrence, corrected where found (W41); no mechanism proposed` |

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 50.

*Read 2026-10-06 by a fresh-context conformity reader: each question first (its front matter at
`988ef5f`, and its long-form body from `git show b665981:doc/open-questions.md`, the last commit
carrying the bodies), the tree at `988ef5f` second (an archive, `dev-dist/w123r-41352/base`, 0
links), and the reader's own 50 verdicts written to scratch (`dev-dist/w123r-41352/my-verdicts.tsv`)
BEFORE this worksheet was opened. Rows counted by script on both tables: worksheet 50 rows over the
50 ids, none missing or extra, its tally keep 2 / defer 6 / icebox 31 / resolve 10 / duplicate 1
matching the summary line; this table 50 rows over the same 50 ids.*

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| Q44 | AGREE | icebox. The split has held since W5, and no plan from P5 to P28 asked for a decision |
| Q45 | DISPUTE | resolve → **icebox**. The corpus evidence is wrong. In `spec/examples/valid/sibling-fanouts.flow.json` the `end` node `done` comes after `joinB`, so it is in neither region and is not the Q45 shape (two fan-outs sharing one `end` from inside both). And the spec sentence *"this document accepts it"* was written by W20 (29c179a), whose own `test/definition/nesting.test.ts` comment says *"whether it should is Q45, which is open and is not W20's"* and keeps the shape out of the corpus for exactly that reason. `test/matrix/flows.ts` and `region-shapes.test.ts` say the same. The spec describes what the validator does; it does not settle what it should do (calibration 5). Note: the shape is accepted and handled, and ADR 0015 folds the hang to `stuck` |
| Q98 | AGREE | icebox. The noun is fixed by convention in `CLAUDE.md` and every Record; nobody decided between changing the runner and changing the word |
| Q99 | AGREE | icebox. The `l6.ts` assertion at 9928 is real, W67 measured the knob at 0, and obligation (f) (v0.25) is the provocation |
| Q100 | AGREE | icebox. Instances were closed by W24, W29 and W34; the class has no mechanism |
| Q101 | AGREE | icebox. The array-vs-prose half needs a prose convention nobody proposed |
| Q102 | AGREE | icebox. `RUN_FLOOR` is at `scripts/check-docs.mjs:725` and `README_SNIPPET_FLOOR` at 918. ADR 0076 decision 1 exists and is correctly in `note`, not in `resolved-by` |
| Q104 | AGREE | icebox. `X4a`, `scripts/check-docs.mjs:173-181`, is still a textual `throw` test |
| Q111 | AGREE | defer, on Q16's flow half (deferred at W121). `spec/task-id.md:187` says the segment is flow-level only |
| Q112 | AGREE | resolve. P7's retro, change 2, moved the procedure into rule 8: workflow section 5 rule 8 (c), *the source expression and nothing else*, v0.9 P7, line 258 at `988ef5f`. This is exactly the correction the question records |
| Q121 | AGREE | resolve. `M1` (file links) and `M2` (anchors, where the question's live defects were) are at `scripts/check-markdown.mjs:344-345`, over `doc/`, `spec/` and `README.md`, `AGENTS.md`, `CLAUDE.md` (lines 337-341). Suggest `resolved-by` names `M2` beside `M1` |
| Q122 | AGREE | icebox. `test/matrix/matrix.test.ts:198` still builds `ALL` from `SCENARIOS` |
| Q123 | AGREE | keep. No `.gitattributes` and no CRLF check at `988ef5f`. It is live, it recurs (three occurrences, `CLAUDE.md`), and the decision is cheap and nameable. The `closes-when` names that decision |
| Q124 | AGREE | icebox |
| Q127 | AGREE | icebox |
| Q132 | AGREE | icebox. `check-spec` has a self-test since W30. Probes in `scripts/check-source-selftest.mjs` still declare no `S2`, `S3`, `S5`, `S6` or `S10` |
| Q134 | AGREE | icebox |
| Q136 | AGREE | icebox. The trigger *"first time a shape appears"* is a reopen trigger, not a closing one, so icebox and not keep is right |
| Q137 | AGREE | icebox. `C5` still has no floor (`scripts/check-spec.mjs:425-426`), but `M1` and `M2` scan `spec/` independently (`check-markdown.mjs:339`), so the argument holds |
| Q138 | AGREE | resolve, by W28. The `check-source-selftest.mjs` header says *"A META ENTRY NAMES THE PROBE IT MUST BREAK"*, citing Q138, and P9's table assigns it to W28. Its residues stay as Q145 and Q147 |
| Q142 | AGREE | keep. It is live: this item's own declaration crossed `M4`'s floor of 120. ADR 0076 (lines 132-146) chose *predicted retune* for one churn, and nothing decides between derived and literal floors |
| Q143 | AGREE | icebox |
| Q144 | AGREE | icebox. Note for the maintainer: `scripts/check-policies.mjs:187` still runs `names.join`, so `P3`'s null clause is still unprobeable. The fix is one line and is the one cheap decision here |
| Q145 | DISPUTE | duplicate → **icebox**. This is not the same question as Q150. Q145 asks whether a mutant that is legitimately not inert, graded `corpus`, verifies what its entry CLAIMS (the six slug-rule mutations in `check-markdown`). Q150 asks whether a broken harness making every mutant non-inert reads as coverage, which a count cap answers. A cap answers nothing about Q145, and `check-markdown-selftest.mjs` has no `MAX_CORPUS` at all (0 hits), which is where Q145's six live |
| Q146 | AGREE | icebox |
| Q147 | AGREE | icebox. No META entry declares an expected `outcome:`; the field is printed by the child, not declared |
| Q150 | CHANGE | icebox, but the note is FALSE. `check-source-selftest.mjs` has no `MAX_CORPUS` cap: its one hit is a comment at line 826 (`grep -n "MAX_CORPUS\s*="`: budget 96, policies 405, register 56, spec 598). The figure 27 counts mentions, not caps. Note should read: capped in four (budget, policies, register, spec) and absent in source, docs, markdown, scheduler and workers |
| Q151 | DISPUTE | resolve → **icebox**. The question names `check-source-selftest.mjs` and `check-markdown-selftest.mjs` as live, with *"one control run per SELF list"* as what closes them. Neither has one at `988ef5f`. Their SELF passes (source 1564-1607, markdown 1255-1283) grade `r.status !== 0 && SELF_RAN(out)`. `SELF_RAN` (`/self-test — /`) is true for a child that starts and whose grandchildren cannot run, which is W31's case. v0.11 is a rule for harnesses; the two files it would apply to were never brought under it |
| Q152 | DISPUTE | resolve → **icebox**. P9's Record row 9 CLASSIFIES the shape and calls it *"the one to carry"*. It does not decide the contract question the row asks, which is whether `ok` should be computed from an explicit verdict, as `check-spec` and `check-scheduler` already do. A taxonomy entry is not a decision by name with a permanent reason (calibration 5) |
| Q153 | DISPUTE | resolve → **icebox**. The resolution is false for the files the question names. A SELF distinctness bound exists only in `check-policies-selftest.mjs:1204` and `check-wiring-selftest.mjs:1255`. `check-source-selftest.mjs:1252` bounds META, not SELF, and `check-markdown-selftest.mjs` has neither. The *"eight self-tests"* are META or name checks. The live half Q153 names (source, 10 entries; markdown, 7) is unchanged |
| Q155 | AGREE | icebox. `test/driver/map.test.ts:1616` is the driver-twice case for map arity. Defer on Q9 would also do |
| Q157 | AGREE | resolve. `doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md:878`, *"Kept as a PROCEDURE, refused as a rule (Q157)"*, refuses it by name; refusal ledger row 2 agrees. `AGENTS.md` now documents `map` (lines 167, 319) |
| Q162 | AGREE | icebox |
| Q170 | AGREE | icebox. `examples/l6.ts:5497-5507` |
| Q172 | AGREE | resolve. P10's retro adopted v0.11 with this question as its second row: *a control, and an asserted restore, bytes compared back* (workflow line 275). That is the procedure the question says is missing |
| Q173 | AGREE | defer, on the next pin move. Honest |
| Q174 | AGREE | defer, as Q173 |
| Q175 | AGREE | defer, as Q173 |
| Q176 | DISPUTE | resolve → **icebox**, and **drop the R8 edit to ADR 0070**. The question is that a CLAUSE's price is its run cost times the re-run multiplier of the FILE it is added to, and that the multiplier is written nowhere. It would close when a self-test prints its re-run count. ADR 0070 never cites Q176. It decides which LANE (local or CI) a whole class runs in, not which file a clause goes into, and no self-test prints its multiplier at `988ef5f` (no hit). The last text naming Q176 is ADR 0039:272, which cites it as a LIVE occurrence at a factor of 150. ADR 0070 moved the cost off a person's wait, so icebox, with ADR 0070 in `note` (calibration 8) |
| Q177 | AGREE | icebox. `lint` is still `deno lint src/ test/ examples/ index.ts`, and no tsconfig reaches `scripts/`. Note: the `deno lint scripts/` half is free |
| Q178 | AGREE | icebox. It recurs (W38, W105, W112). A rule would cost the always-read budget |
| Q179 | AGREE | icebox. Workflow section 8 and Q427 and Q433 carry the live form; Q433 is in W125's band, so it cannot be a duplicate target here |
| Q180 | AGREE | icebox. ADR 0070 consequence 7 says it does not fix it |
| Q181 | AGREE | defer. ADR 0072 consequence 6 says *"narrowed rather than closed"*, correctly in `note` |
| Q182 | AGREE | defer, as Q181 |
| Q183 | AGREE | icebox |
| Q184 | AGREE | icebox, `closes-when` cleared. The note states the fired trigger (W61), which keeps it honest |
| Q185 | AGREE | icebox. Obligation (f) is related to this question but is not the same rule |
| Q188 | AGREE | icebox |
| Q189 | AGREE | icebox |

**Reader tally, counted from this table by script: 50 rows; AGREE 43, DISPUTE 6, CHANGE 1.** The
disputes are Q45, Q145, Q151, Q152, Q153 and Q176, and the change is Q150. If all seven are taken,
the batch is **keep 2 / defer 6 / icebox 37 / resolve 5 (Q112, Q121, Q138, Q157, Q172) / duplicate 0**,
and **no ADR's `resolves` is edited**. *Overlap with the proposer's own doubts: one, Q176, which the
brief flagged.*

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row, with the figures counted
from the table by script.*

**The maintainer, 2026-10-06, two answers:**

1. **W123:** *"Approve, taking reader's".* The approved set is **the worksheet above with the Reader
   section's six DISPUTE rows and one CHANGE row taken**, and nothing else. The worksheet's rows are
   not rewritten; the table below is the approved verdict for every row that differs from them.
   Q45, Q151, Q152, Q153 and Q176 go resolve → icebox; Q145 goes duplicate → icebox; Q150 stays
   icebox with its note corrected as the Reader states. **The R8 edit to ADR 0070 is dropped**: its
   `resolves` does not gain Q176, and ADR 0070 is cited in Q176's `note` instead (calibration 8).
   With it, **no ADR's `resolves` is edited by this item**. The Reader's suggestion on Q121 (name `M2`
   beside `M1` in `resolved-by`) was an AGREE, not one of the seven rows, and is not taken.
2. **Q144:** *"Keep".* It goes icebox → **keep**, with `closes-when` *the one-line fix at
   `check-policies.mjs:187` lands, or is refused*. Line 187 at `988ef5f` is the success line,
   ``console.log(`\nAll checks passed — ${names.join(', ')}.`)``, which dereferences `names` and so
   keeps `P3`'s null clause unprobeable (the Reader's Q144 note). **The maintainer decided this row
   directly, so it is not put to the keeps round**; it is recorded there as answered.

| id | worksheet | approved | taken from | approved fields |
|---|---|---|---|---|
| Q45 | resolve | **icebox** | Reader DISPUTE | `icebox`; `resolved-by` stays empty; `closes-when` unchanged (empty); stamp as the Final table's row |
| Q145 | duplicate | **icebox** | Reader DISPUTE | `icebox`, not `resolved`; `resolved-by` stays empty (no duplicate target); `closes-when` unchanged (empty) |
| Q150 | icebox | **icebox, note corrected** | Reader CHANGE | the stamp names the cap in **four** self-tests (budget, policies, register, spec) and its absence in **five** (source, docs, markdown, scheduler, workers); the worksheet's *27* counted mentions, not caps |
| Q151 | resolve | **icebox** | Reader DISPUTE | `icebox`; `resolved-by` stays empty; `closes-when` unchanged (empty) |
| Q152 | resolve | **icebox** | Reader DISPUTE | `icebox`; `resolved-by` stays empty; `closes-when` unchanged (empty) |
| Q153 | resolve | **icebox** | Reader DISPUTE | `icebox`; `resolved-by` stays empty; `closes-when` unchanged (empty) |
| Q176 | resolve | **icebox** | Reader DISPUTE | `icebox`; `resolved-by` stays empty; ADR 0070 cited in `note`; **ADR 0070's `resolves` does NOT gain Q176** |
| Q144 | icebox | **keep** | the maintainer, directly | `closes-when`: the one-line fix at `check-policies.mjs:187` lands, or is refused |

**The counts, measured from the tables by script** (`dev-dist/w123k-42282/tally.mjs`, EXIT 0): the
worksheet has **50 rows over the 50 ids**, none missing, none extra, none twice, and its tally is the
summary line's (keep 2, defer 6, icebox 31, resolve 10, duplicate 1); the Final approved verdicts
table below has **50 rows over the same 50 ids** and counts **keep 3 (Q123, Q142, Q144), defer 6,
icebox 36, resolve 5 (Q112, Q121, Q138, Q157, Q172), duplicate 0, obsolete 0 — 50**. That is the
Reader's predicted *keep 2 / defer 6 / icebox 37 / resolve 5* with Q144 moved from icebox to keep.
*(Superseded by the keeps round: Q123 went keep → icebox, so the final figure is keep 2, icebox 37,
and the Final table now carries it.)*

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, and the maintainer's answer.*

| | the question, the briefing and the recommendation | answer |
|---|---|---|
| Q123 | **Rec: icebox.** *Should the repo stop line-ending conversions mechanically?* Example: a Python text-mode write on Windows turns a three-line edit into a whole-file CRLF rewrite, and no check says so; once `check-wiring`'s `G2` (the check that finds a dispatch block's end by its layout) went red with a message about the wrong thing. At `988ef5f`: no `.gitattributes`, `core.autocrlf` false, and no tracked text file holds a CR. The guard is `CLAUDE.md`'s hand rule (write bytes, or use the Edit tool), and there has been no occurrence since P15's declaration, the third. **Keep**: decide now between `eol=lf` in a `.gitattributes` (normalises on commit, silently) and a check refusing a CRLF tracked file (makes it visible). **Defer**: wait for a fourth occurrence. **Icebox**: the hand rule stands, and a fourth occurrence goes in `note`. **Resolve**: refuse both fixes by name | **icebox** — 2026-10-06, maintainer: *"Accept both recs"*. The hand rule in `CLAUDE.md` stands, nothing has slipped past it since P15, and the note says so; `closes-when` stays empty |
| Q142 | **Rec: keep** — it fires again within P29. *Should `check-markdown`'s vacuity floors stay hand-set numbers, or be derived from the tree?* A vacuity floor is a minimum count below which a link check proves nothing: `M3`, at least 362 markdown files scanned; `M4`, at least 120 documents carrying a relative link; `M5`, at least 72 anchored links. Example: this item's own declaration added one linking document, the self-test's cut-down copy of the tree reached 120, `M4` stopped firing there, and `check:markdown:selftest` went red (41/42) while `check:markdown` stayed green. ADR 0076 chose what a floor counts; ADR 0078 says a floor's window belongs to the probe suite. Neither picks literal or derived, and the floors have been retuned at least twelve times. **Keep**: decide literal or derived. **Defer**: wait for the next retune. **Icebox**: retune whenever it is hit. **Resolve**: name ADR 0076 and ADR 0078 as the answer | **keep** — 2026-10-06, maintainer: *"Accept both recs"*, with the worksheet row's `closes-when`: a decision whether `check-markdown`'s vacuity floors stay literal or are derived |
| Q144 | *Not put to the round* — the maintainer decided it at the approval, icebox → keep | **keep** — 2026-10-06, maintainer: *"Keep"*, `closes-when` *the one-line fix at `check-policies.mjs:187` lands, or is refused* |

#### Final approved verdicts

*Filled in after phase 4, counted from this table by script.*

**50 rows: keep 2, defer 6, icebox 37, resolve 5, duplicate 0, obsolete 0** — counted from this table
by script (`dev-dist/w123a-42436/tally.mjs`, after the keeps round; the pre-round figure, keep 3 and
icebox 36, was `dev-dist/w123k-42282/tally.mjs`'s). *From*: **W** the worksheet, **R** the Reader's
CHANGE or DISPUTE as approved, **M** the maintainer directly, **K** the keeps round. Every row's
`note` gains the stamp `P29 W123: <verdict>`, with the reason, after `; ` where the note was not
empty; a field not named is unchanged. **The keeps round was answered 2026-10-06** (*"Accept both
recs"*): Q123 keep → icebox, Q142 stays keep.

| id | final | from | fields applied |
|---|---|---|---|
| Q123 | icebox | K | `icebox`; `closes-when` unchanged (empty; the worksheet's keep condition is not applied); stamp `P29 W123: icebox — the keeps round, 2026-10-06: the hand rule in CLAUDE.md (write bytes, or use the Edit and Write tools) stands; nothing has slipped past it since P15's declaration, the third occurrence, and a fourth goes in this note` |
| Q142 | keep | K | `closes-when` as the worksheet's row; stamp `P29 W123: keep — the keeps round, 2026-10-06; this item's own declaration crossed M4's floor of 120, so the window recurs within P29` |
| Q144 | keep | M | `closes-when`: the one-line fix at `check-policies.mjs:187` lands, or is refused; stamp `P29 W123: keep — the maintainer, 2026-10-06; the success line's names.join keeps P3's null clause unprobeable` |
| Q111 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q173 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q174 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q175 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q181 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q182 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q44 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q45 | icebox | R | `icebox`; `resolved-by` empty; stamp `P29 W123: icebox — the shape is accepted and handled (spec/flow-definition.md section 4; ADR 0015 folds the hang to stuck), but W20's own test comment leaves whether it should be to this question, and sibling-fanouts is not the shape; no consumer asks` |
| Q98 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q99 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q100 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q101 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q102 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q104 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q122 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q124 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q127 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q132 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q134 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q136 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q137 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q143 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q145 | icebox | R | `icebox`, not `resolved`; `resolved-by` empty; stamp `P29 W123: icebox — not Q150's question: whether a legitimately non-inert corpus mutant verifies what its entry claims; check-markdown-selftest.mjs has no MAX_CORPUS, and no plan has taken it since P9` |
| Q146 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q147 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q150 | icebox | R | `icebox`; stamp `P29 W123: icebox — MAX_CORPUS caps it in four self-tests (budget, policies, register, spec) and is absent in five (source, docs, markdown, scheduler, workers); no plan has taken the five since W31` |
| Q151 | icebox | R | `icebox`; `resolved-by` empty; stamp `P29 W123: icebox — check-source-selftest.mjs and check-markdown-selftest.mjs still have no control run per SELF list; v0.11's harness rule was never applied to them, and no plan has taken it since P10` |
| Q152 | icebox | R | `icebox`; `resolved-by` empty; stamp `P29 W123: icebox — P9's Record row 9 classifies the shape and does not decide whether ok is computed from an explicit verdict, as check-spec and check-scheduler do; no taker since P9` |
| Q153 | icebox | R | `icebox`; `resolved-by` empty; stamp `P29 W123: icebox — a SELF distinctness bound exists in check-policies-selftest.mjs and check-wiring-selftest.mjs only; the two files the question names (source, markdown) are unchanged since W31` |
| Q155 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q162 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q170 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q176 | icebox | R | `icebox`; `resolved-by` empty; stamp `P29 W123: icebox — ADR 0070 moved the self-tests to CI, taking the re-run multiplier off a person's wait, and does not cite this question; no self-test prints its multiplier, and ADR 0039 cites it as a live occurrence`. **ADR 0070's `resolves` does NOT gain Q176** |
| Q177 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q178 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q179 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q180 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q183 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q184 | icebox | W | `icebox`; `closes-when` **cleared**; the worksheet's stamp |
| Q185 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q188 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q189 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q112 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q121 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q138 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q157 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q172 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |

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

*Filled in 2026-10-06, by the apply unit, with the tree still.* Scratch: `dev-dist/w123a-42436/`
(`tally.mjs`, `apply.mjs` and every log below). Node v24.20.0 by `fnm use 24` in every shell.
Nothing committed.

**Final verdicts: 50 — keep 2 (Q142, Q144), defer 6, icebox 37, resolve 5 (Q112, Q121, Q138, Q157,
Q172), duplicate 0, obsolete 0.** 48 of the 50 leave `open` (96%). `tally.mjs` re-counted the *Final
approved verdicts* table after Q123's row changed (EXIT 0, `tally.log`), and `apply.mjs` re-tallied
it again before writing and refuses any other figure; both matched. **The keeps round**: the
maintainer, 2026-10-06, *"Accept both recs"* — Q123 keep → icebox (the `CLAUDE.md` hand rule stands,
nothing has slipped past it since P15, and its note says so), Q142 kept with its row's `closes-when`.
**R8**: no ADR's `resolves` was edited — the ADR 0070 edit was dropped at the approval, and none of
the five resolutions' `resolved-by` names an ADR. **No re-stamp**, so the stamp count is the row
count.

**Gate — what ran.** Each run redirected, with `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| reader report | done | 50 rows: AGREE 43, DISPUTE 6 (Q45, Q145, Q151, Q152, Q153, Q176), CHANGE 1 (Q150). **5 of the 10 proposed resolves were overturned** (Q45, Q151, Q152, Q153, Q176, all to icebox), and the one duplicate. **P29 prediction 3 held** |
| maintainer approval | done | 2026-10-06, *"Approve, taking reader's"*, and Q144 icebox → keep directly |
| keeps round | done | 2 rows (Q123, Q142), both recommendations accepted: 1 kept, 1 iceboxed |
| `apply.mjs` | EXIT 0 | `apply.log`: 50 questions, 0 ADRs; a dry run first (`dry.log`, EXIT 0) |
| name-status M/A only | EXIT 0 | `ns.log`: 50 `M`, no `A`, `D` or `R` |
| `check:register` | EXIT 0 | `reg.log`: R8 compared 24 pairings, unchanged from W122's, and excused 1 (Q466 → ADR 0077). **P29 prediction 4 held** |
| `check:markdown` | EXIT 0 | `md.log` |
| `check:markdown:selftest` | EXIT 0 | `mds.log`: 42/42 probes caught, 41/41 noticed, 7/7 bounded |
| stamp count | EXIT 0, **50** | `n.log`: 50 declared, no re-stamp |
| `git diff --name-only` against Owns | in Owns | `names.log`, 51: the 50 owned question files and this file. No ADR, no `q521.md`-`q523.md` |
| own-id and withdrawn-claim grep, excluding `dev-dist/` | clean | `W123` outside `doc/questions/` is in P29's declaration, W122's file and this one. The phase-1 *Q176 → ADR 0070* (twice) and the approval's pre-round *keep 3, icebox 36* are marked superseded where they stand |

*Re-run after this Record was written, on the final tree:* `tally`, name-status, `check:register`,
`check:markdown`, `check:markdown:selftest` (42/42) and the stamp count (50), each EXIT 0 (`*2.log`);
`names2.log` 51.

**Questions raised: none.** The `M4`-floor finding is Q142 itself, so Q521, Q522 and Q523 were not
issued: they are skipped, never reissued.

**The `M4` floor, at declaration.** This file was the 120th linking document in
`check-markdown-selftest`'s second `removes` probe tree, which reached `M4`'s floor of 120 and took
the self-test to 41/42 while `check:markdown` stayed green. It is kept free of relative markdown
links, and the self-test is 42/42 on the final tree. That is Q142's mechanism, which stays `keep`.

**The band label.** P29's index row says *"Q5-Q189"*; the band's first id is **Q44**. Q5 is a range
bound (it is open, in *The join*, W121's band), and no *Verification and fixtures* question has an id
below Q44. The plan is not edited here; the join records the label.

**What this taught** — the calibration for W124:

1. **A resolve citing a general rule needs the files the question NAMES to be under it**: Q151 and Q153 had the rule and not the named self-tests.
2. **A duplicate needs the same question, not the same mechanism** (Q145 is not Q150).
3. **Count definitions, not mentions**: `MAX_CORPUS`'s 27 hits counted comments, and the caps were 4 (Q150).
4. **The decision-text test reads the authoring item's own comments too**: a spec sentence describing what the code does is not a decision when its author's test says the question is open (Q45).
5. **W124's file stays link-free too**: the next linking document outside `doc/decisions` and `doc/plans` crosses `M4` again, until Q142 is decided.
