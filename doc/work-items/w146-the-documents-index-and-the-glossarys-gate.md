# W146 — The documents: every stale claim Q542 lists in `doc/README.md` deleted or corrected, and Q508 closed by P31 decision 2 with the glossary's three *gate* rows carrying the distinction

**Status:** done — declared 2026-10-09 on `c9f0918`, the seventh and LAST item of P31; built, the reader and the maintainer's three answers taken, `gate:full` EXIT 0 on `c99e930`, the record step done, 2026-10-09
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, as W140-W145's files do* — Q142's M4 mechanism, which W144 derived
away, is no longer the reason; the convention is kept so a link here moves no probe tree. Ids and paths are
bare text.

```
Spec:       none changes. The rules are P27 decision 4 (a fact the tree COMPUTES is not written
            down) and decision 2 (nothing is archived; a cut thing keeps a one-line entry and its
            commit), P31's W146 index row and decisions 2-7, predictions 5 and 6, ADR 0077 and Q466
            (an item does not write its status into doc/README.md), ADR 0080 (the glossary points
            and never defines), and workflow section 1 rules 5 and 6
Owns:       doc/README.md; doc/glossary.md (P31's W146 row: touched only if its three gate rows do
            not already carry the distinction, or where a line states Q508 as undecided); this file
Inputs:     the tree at c9f0918 (W140, W142, W141, W145, W144 and W143 done); Q542's and Q508's own
            files, Q542's list including W134's conformity reader's additions; `npm run state`,
            `npm run adr`, `npm run check:markdown`, `npm run check:register`, check-docs' FENCE as
            the derivations a deletion points at; doc/scheduler-upstream.md (S10's status), each
            plan file's own Status line, AGENTS.md's fence tags
Outputs:    (1) the measurement, BEFORE any edit: for each claim Q542 lists, whether it is still
                present and still false on c9f0918, with the command or fact showing it; the three
                glossary gate rows as they stand; check:markdown's derived floors and measures
            (2) doc/README.md: each claim of (1) that is still false deleted (where the tree
                derives it, P27 decision 4, or where it is a status copy, ADR 0077 / Q466) or
                corrected (a fact no command derives); a claim that later work made true again is
                named and left. The Plan history is judged by P27 decisions 2 and 4
            (3) doc/glossary.md: the three gate rows checked against their targets; the commands
                row names gate:item (W139); the Not-rows line stating Q508 as open corrected to its
                decision
            (4) Q542 and Q508 resolved, each resolved-by starting "P31 W146 —"
            (5) P31's Record, with the exit artifact measured on the final tree: gate:full's EXIT,
                the resolved-by~P31 listing, the open count, each difference accounted by id
Depends on: W143 (P31 decision 5: serial on one tree, the documents last)
Blocks:     nothing — the last item of P31
Tests:      no behaviour changes, so the tests are the CHECKS that hold these files:
            check:markdown and check:markdown:selftest EXIT 0 with no derived floor crossed
            (prediction 5), check:register EXIT 0 on the resolved questions, and `npm run term --
            gate` reading three rows. Expected values come from Q542's list, P27 decision 4 and
            P31 decision 2, never from a run
Gate:       check:markdown and check:markdown:selftest EXIT 0 on the final tree; rule 8 over every
            output in dev-dist/w146-23759/; one conformity reader (P31 decision 6); `npm run
            gate:full` EXIT 0 ONCE, on a still tree — the plan's last item (decision 4, workflow
            v0.29)
Reserves:   Q571-Q573 (P31's block Q553-Q567 is wholly reserved by W140-W145 and Q568-Q570 by
            W143, every unused id skipped and never reissued); no ADR. No W beyond W146
```

**Exceptions**: none at declaration. **Three, asked under workflow section 1 rule 6 after the conformity
reader and answered by the maintainer on 2026-10-09, each written here before its edit:**

| file | the edit | answer |
|---|---|---|
| `doc/scheduler-upstream.md` | two sentences only: "ALL NINE items are now closed, deferred, or declined" (about line 27) and "Nothing on this list is now waiting to be raised" (about line 481), each corrected to say S10 is not raised, writing no count | **A: YES** |
| `CLAUDE.md` | one sentence, line 18: "Every snippet in it is extracted and executed by `npm run gate`" corrected to every snippet typechecked, those tagged `run` executed, those tagged `check` typechecked only — roughly byte-neutral, `check:budget` kept green. **This reverses P31 prediction 6 by the maintainer's decision** | **B (ii): YES** |
| `README.md` | line 309's "every example executed by the gate", corrected at the record step (a record-step file) with doc/README.md's wording | **B (i): YES** |

B (iii), doc/decisions/README.md:29, is left by the answer. C: **(b)** — the glossary commands row drops its
`gate:item` clause and says exactly what ADR 0070 says; the `confirming gate` row carries `gate:item`.

Any other file edited outside `Owns` and outside the record step is
asked first under workflow section 1 rule 6, and its YES written here before the edit. `CLAUDE.md`,
`doc/workflow.md` and `doc/concept.md` are not edited (prediction 6). **The drag files, checked up front:**

| file | why it should not move |
|---|---|
| `scripts/check-markdown-selftest.mjs` | its M1/M2 probes anchor on four texts in doc/README.md — `](workflow.md)` (first occurrence: the Reading-order row), `](open-questions.md)`, `](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)` (the scheduler-upstream status row) and `# Documentation index`. Every one is kept, so no probe matches nothing (Q482's class) |
| `scripts/check-markdown.mjs` | the floors are DERIVED from probe trees that contain doc/README.md (W144), so a deletion moves a floor with its measure (prediction 5) |
| `scripts/lookup.mjs` | reads the glossary's two tables by its Format contract; `## Not rows` is a list and nothing reads it. No table row changes shape |
| `scripts/check-lookup-selftest.mjs` | builds its own glossary fixture; reads none of doc/glossary.md |
| `scripts/check-budget.mjs` | doc/README.md and doc/glossary.md are outside the always-read set |
| `scripts/check-register.mjs` | holds q542.md and q508.md at the record step; `resolved-by` may name P31 and W146, both of which exist |

## Scope

**In**

1. **Measure first**, output (1), on `c9f0918`, logs under dev-dist/w146-23759/.
2. **Q542**, output (2): each still-false claim deleted or corrected in doc/README.md.
3. **Q508**, output (3): the glossary's three gate rows checked; the Not-rows line corrected.
4. Rule 8 over the checks that hold these files, in a harness under dev-dist/w146-23759/, and prediction 5
   re-tested on the final tree.
5. One conformity reader; then rule 8 re-run with its exact edits as probes.
6. `npm run gate:full`, once, on a still tree.
7. The record step, and P31's Record with the exit artifact. Grep for `W146`, `Q542`, `Q508` and every
   withdrawn sentence, excluding dev-dist/.

**Out**

- **Any claim outside doc/README.md and doc/glossary.md**, even the same claim in another file — asked
  under rule 6, never edited without a YES.
- **Renaming a sense of gate** — P31 decision 2 keeps all three.
- **Any change to a check or to what `gate:item` or `gate:full` runs** — P31 Out.
- **Q20 and Q513** — P31 Out.

## Verification

- **check:markdown and its self-test**: `npm run check:markdown` and `npm run check:markdown:selftest`, each
  RUN and redirected, EXIT read in the same command, before and after.
- **Rule 8**: break the edits and watch the checks that hold these files notice — a link this item keeps
  broken, an anchor removed, a resolved question with an empty `resolved-by`, a `resolved-by` naming an id
  that does not exist; a no-op control, a CRASH grader and a WRONG-REASON grader; anchors checked against
  the current text, aborting on more than one match; every edit asserted to change its input; the tree
  restored to its first snapshot byte for byte; a digest before and after. Prediction 5: ordinary linking
  documents added on the final tree leave `check:markdown:selftest` green.
- **Reader**: one conformity reader, fresh context, Q542, Q508, P27 decision 4 and P31 first, then the
  edits; it reports and does not fix, and the tree holds still while it reads.
- **Confirming gate**: `npm run gate:full > dev-dist/w146-23759/full.log 2>&1; echo "EXIT=$?"`, once, on the
  final tree.
- **Routing cases** (template): not applicable. This item changes two documents, not routing.

## Record

*Filled in 2026-10-09 on `c99e930`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w146-23759/` (this item's shell pid): every log, harness and edit script named below. Node v24.20.0
by `fnm use 24` in every shell; every rung redirected and its EXIT read in the same command, never piped.
Ids and paths here are bare text, as the header says.

### Gate

| clause | verdict | notes |
|---|---|---|
| `check:markdown` | **RAN, EXIT 0** | before (`4f284ff`) and after each edit commit: `cm-before.log`, `cm-after.log`, `cm-after2.log`, `after4-markdown.log`, `after5-markdown.log` |
| `check:markdown:selftest` | **RAN, EXIT 0** | twice: on `f08a499` plus sixty ordinary linking documents (prediction 5, below), 44/44 probes caught, 7/7 bounded; and inside `gate:full` on `c99e930`, 1385.4 s |
| `check:budget`, `check:register`, `check:docs`, `check:scheduler` | RAN, EXIT 0 | after the maintainer's answers touched CLAUDE.md, doc/scheduler-upstream.md and README.md (`after4-*.log`, `after5-*.log`) |
| rule 8 | RAN, 18/18, then **28/28** | below |
| conformity reader | RAN | 0 blocking, 3 should-fix, 6 notes (below) |
| adequacy reader | NOT RUN | P31 decision 6: one conformity reader for W146 |
| `npm run gate:full > dev-dist/w146-23759/full.log 2>&1; echo "EXIT=$?"` | **RAN, EXIT 0** | ONCE, on `c99e930`, `git status --short` empty before and after; 07:19:37Z to 07:59:50Z, 2413 s |
| — L0-L5 | RAN, 0 | **1580** cases in node 24.20.0, deno 2.9.6 and chromium (`all passed (parity with node: 1580)`): unchanged |
| — L6 | RAN, 0 | **164** real runs, 2487 assertions, in node and deno: unchanged |
| — self-tests | RAN, 0 | **11/11 ok** including `check:register:selftest` (2257.3 s); **2272.1 s wall**, 7184.4 s serial-equivalent, 10 lanes |
| re-run after the record step | RAN | `check:register`, `check:markdown` and `npm run gate`, because the record step changes files both checks read (P31's Record) |

L7 did not run. firefox and webkit did not run.

### Q542: each claim, measured on `c9f0918` and after

Every claim Q542 lists was still present and still false on the tree W146 started from.

| claim in doc/README.md | the fact that falsified it | after |
|---|---|---|
| `S1-S9` and `9 items` | doc/scheduler-upstream.md has ten `## S` sections, S10 among them | deleted; the rows write no count and point at that file's Index |
| register *checked by nothing* | `check:register` is a `gate` entry (ADR 0079) | corrected: it holds each file's FORMAT, and nothing checks that what a question says is true (Q43) |
| P15 *DECLARED, no item started* | P15's own Status line reads COMPLETE and RETRO'D | the status phrase deleted (ADR 0077, Q466) |
| W12-W14 *declared*, beside *done* in the same cell | each item's Status line reads done | every per-item status in the row deleted; the row says each item file carries its own Status line, which `npm run state` reads |
| a Plan history stopping at P26, with P26 dated *pending* | P27-P31 exist; this file left the record step at W115 | the per-plan table deleted to `git` (below) |
| an unclosed italic parenthetical in the scheduler-upstream status cell | the cell opened `*(` and never closed it | gone with the cell's rewrite; the W37 link a self-test probe anchors on is kept |
| *None superseded.* | `npm run adr -- --fields id,superseded-by` names ADR 0003, 0013, 0023, 0039 and 0066 | replaced by that command |
| *nothing is left to raise* | S10's own section reads NOT RAISED YET | deleted |
| *Every snippet is executed by the gate* | AGENTS.md carries 34 `ts run` and 6 `ts check` fences; check-docs typechecks both and executes only `run` | corrected to what check-docs does |
| P17 and P19-P21 dated *—*, P20 reading as in progress, its W78 link pointing at a directory | each plan's own Status line | deleted with the table |
| the workflow.md status row: a v0.3-v0.12 changelog under *live* | workflow.md is v0.30 and carries its own version index | replaced by a pointer to its header and its version index |

**Nothing Q542 lists had become true again.** The header's *and the plan history* now reads *and where the
plan history is* (the reader's finding 8).

**The Plan history was DELETED, not brought to P31.** I judged this by the rules rather than asking:
- the list of plans is the directory, and each plan's state is in its own file (P27 decision 4);
- every row summarised a plan file that still exists, so the history gets a one-line entry and its commit (decision 2);
- once this file left the record step (Q466), nothing was obliged to append a row, which is why the table stopped three times.

The paragraph cites the table's last form at `2b48046`, which is public. The reader judged the deletion
conformant (finding 7).

### The glossary's three gate rows

| row | before (`c9f0918`) | after |
|---|---|---|
| PRODUCT `gate` (the node kind) | carries its sense, spec/flow-definition.md's gate section | unchanged |
| PROCESS `gate` (the commands) | named `gate:item` against ADR 0070's Decision, which never mentions it: a row claiming what its target does not say (ADR 0080, Format rule 4) | **the maintainer's C (b)**: the `gate:item` clause dropped, so the row says exactly what ADR 0070 says; the `confirming gate` row (workflow section 4) carries `gate:item` |
| PROCESS `gate` (a work item's verification gate) | carries its sense, workflow section 1 rule 1 | unchanged |
| `## Not rows`: *whether one is renamed is Q508* | undecided | *gate is not a missing term: three senses, all three stay — P31 decision 2, which resolved Q508* |

`npm run term -- gate` prints three rows before and after.

### check:markdown's derived floors

| tree | documents / linking / anchored | floors M3 / M4 / M5 |
|---|---|---|
| `4f284ff` (before) | 622 / 202 / 85 | 170 / 121 / 71 |
| `f08a499` (after Q542) | 623 / 202 / 85 | 171 / 121 / 71 |
| `f08a499` plus sixty ordinary linking documents | 683 / 262 / 145 | 231 / 181 / 131 |

**Prediction 5 held on W146's own tree.** Every floor moved with its measure. With the sixty documents present,
`check:markdown` and `check:markdown:selftest` both EXITed 0; the documents were then removed. Deleting the Plan
history took 114 links out of the walk (5434 to 5320) and crossed no floor.

### Outputs

| declared output | exists | what would fail without it |
|---|---|---|
| (1) the measurement before any edit | the tables above | nothing mechanical; it is the subject of rule 8's probes |
| (2) doc/README.md's claims | `f08a499`, `01ee67f` | rule 8 p1-p3 and p7b, p8 (M1; the self-test's vacuity guard). The prose itself is s3, s5 and s6, declared survivors |
| (3) the glossary | `f08a499`, `b58a294` | p4 and p5 (M1, M2); p6 (`term` exits 2) |
| (4) Q542 and Q508 resolved | the record step | p9-p11 (R3, R8) hold the form of a resolution |
| (5) P31's Record and the exit artifact | the record step | the exit artifact's own commands |

### Exceptions, reconciled

`git diff --name-only 4f284ff~1..c99e930` names six files:
- doc/README.md and doc/glossary.md: Owns;
- this file;
- doc/scheduler-upstream.md and CLAUDE.md: the maintainer's A and B (ii), written into Exceptions in `c5ed9a0` before their edit in `b58a294`;
- README.md: B (i), a record-step file, edited in `c99e930`.

The record step adds P31's file (its Status line and its Record) and `doc/questions/**`. `git status --short` is empty.

### Rule 8

The harness is `dev-dist/w146-23759/rule8.mjs`, run in place. It:
- checks each anchor against the CURRENT text, aborting on any count but one;
- asserts that every edit changed its input;
- restores every touched file to its FIRST snapshot and compares it back byte for byte;
- takes a content digest of every tracked and unignored file before and after;
- asserts the environment (node v24).

Each failure line it grades on was seen first: `FAIL  M1`, `FAIL  M2`, `FAIL  R3`, `FAIL  R8`, `FAIL  B2`,
lookup's *not a three-cell row*, and the self-test's single-probe *the mutation matched nothing*.

| pass | tree | result |
|---|---|---|
| 1 | `f08a499` | **18/18** as expected, digest unmoved (908 files `7e329f1d3770f74f`) |
| guards | `f08a499` | an anchor matching twice ABORTS (`rule8-guard-two.log`); an edit that changes nothing ABORTS (`rule8-guard-noop.log`); both restored, digest unmoved |
| 2 | `c99e930`, the reader's and the answers' edits as probes | **28/28** as expected, digest unmoved (908 files `9f78fb18e6e1c86d`) |

- **Controls**: one no-op per runner (markdown, register, term, the W37 self-test probe, budget, docs).
- **CRASH grader**: the check given a module that does not exist, graded CRASH, not CAUGHT.
- **WRONG-REASON grader**: p1's M1 break declared as M2, graded WRONG-REASON.
- **Caught**:
  - p1-p4, M1: the new ADR 0079, ADR 0077, Q466 and Q508 links.
  - p5, M2: the commands row's anchor.
  - p6: lookup exits 2 when that row loses a cell.
  - p7b and p8: the markdown self-test's vacuity guard, when the kept W37 and open-questions links are removed.
  - p9, R3: Q542 resolved with an empty `resolved-by`.
  - p10, R3: Q508 resolved by W999.
  - p11, R8: Q508 naming an ADR whose `resolves` does not list it.
  - r1, M2: answer A's S10 anchor.
  - r2, B2: CLAUDE.md past its ceiling.
- **p7a is CLEAN by design**: removing the W37 link is invisible to `check:markdown`; only the self-test sees it.
- **Declared survivors, each RUN and surviving, by id**:
  - **s1**: CLAUDE.md's sentence put back to its false form, `check:docs` green;
  - **s2**: README.md's row put back, `check:docs` green;
  - **s3**: doc/README.md's snippet sentence put back;
  - **s4**: scheduler-upstream's *Nothing on this list is now waiting to be raised* put back;
  - **s5**: the Plan history citing a commit that does not exist;
  - **s6**: the reader's finding 2 undone.

  They all survive for one reason: **no check reads whether prose is true**. That is the refusal ledger's first row,
  refused twenty-nine times, and nothing here proposes a thirtieth.

### The conformity reader

The reader had a fresh context. It read Q542, Q508, P27 decisions 2 and 4, P31, ADR 0077, Q466 and ADR 0080 first,
then the diff `4f284ff..f08a499`, on a still tree. **0 blocking, 3 should-fix, 6 notes.**

| | finding | done |
|---|---|---|
| 1 | SHOULD-FIX: the Plan-history paragraph said each plan carries a Status line, a Record and a Retro; P26 and P27 have no Status line, and P23 has no Record | fixed, `01ee67f` |
| 2 | SHOULD-FIX: *each want's state is in its own section* is false for S2 and S6, whose state is only in the Index | fixed: both rows point at the Index, `01ee67f` |
| 3 | SHOULD-FIX: the commands row still names `gate:item` against ADR 0070 | asked (C); the maintainer chose (b), `b58a294` |
| 4 | NOTE: the Not-rows line says Q508 is resolved before the record step | true from the record step |
| 5 | NOTE: *the last five plans* copies `RECENT_PLANS` | fixed: now *the most recent*, `01ee67f` |
| 6 | NOTE: `4f284ff` is not public | fixed: the paragraph cites `2b48046`, which is public and whose table is byte-identical |
| 7 | NOTE: the deletion conforms, and the paragraph is otherwise true | — |
| 8 | NOTE: the header still promised a plan history; P1-P4's *Complete* rows are true status copies outside Q542 | header fixed, `01ee67f`; the rows left, being true and unlisted |
| 9 | NOTE: the withdrawn claims live on in CLAUDE.md:18, README.md:309, doc/scheduler-upstream.md:27 and :481, and doc/decisions/README.md:29 | asked (A, B); four fixed by the answers; doc/decisions/README.md:29 left by B (iii) |

Rule 8 was re-run (pass 2) with every edit the reader caused checked in.

### What broke

- **Rule 8 pass 2's first run was 23/28, and the new runners' no-op controls are what said so.** The patch that added
  the budget and docs runners was written through a heredoc, and their regexes lost every backslash, so every
  grading on them was CRASH. The controls graded CRASH before any probe could be misread as a catch.
- **The same patch wrote a `\n` in a probe anchor as a REAL newline.** This is CLAUDE.md's heredoc warning, an eighth
  occurrence; `node --check` caught it before anything ran. *(P31's retro, pass 3 rule 6: W143's Record reports
  the same class twice before this, so on CLAUDE.md's seven this patch is the TENTH, not the eighth.)*
- **W146's first wording copied a fact the tree computes** (*the last five plans*) while deleting such copies. The
  reader found it.

### What this taught

- **A glossary row written to add a name can claim what its target does not say.** W139 added `gate:item` to the
  commands row, which links ADR 0070, an ADR that predates `gate:item`. Neither W139's brief nor W146's noticed
  until the reader read Format rule 4 against the row. *The target is right* (ADR 0080) is the check by hand, and the
  answer kept the row to its target.
- **Prediction 6 was reversed by a decision, not by its named mechanism.** The maintainer chose to correct CLAUDE.md's
  false snippet sentence (B (ii)), so the always-read set changed by one sentence: +55 bytes, `check:budget` green
  with 1489 bytes of headroom.

### Questions closed and raised

- **Closed: Q542 and Q508**, each `resolved-by` starting "P31 W146 —".
- **Raised: none.** Q571-Q573 are unused; no ADR.
- Workflow section 1 rule 6 fired three times (A, B and C). Each was answered by the maintainer on 2026-10-09 and
  written into Exceptions before its edit, so nothing went to the register.
