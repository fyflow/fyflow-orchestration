# W121 — B1, the pilot: a verdict for each open question in the join, identity/state/failure and documents clusters

**Status:** todo — declared 2026-10-05 on `a93b767`, not started; no question's field has changed
**Plan:** [P29](../plans/p29-which-open-questions-still-matter.md)

```
Spec:       none — P29 decisions 1-5 and 7, and doc/questions/README.md's format
Owns:       the 38 question files listed below; doc/questions/q17.md, q19.md, q20.md (the
            `shared` field only); this item's own question files, q513.md-q516.md; and the
            `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (5) `shared` filled on Q17, Q19 and Q20 (decision 7)
            (6) Q513: the divergence between our resolved Q19 and fyflow-react-components' open Q14
            (7) the calibration, recorded in this item's Record for the coordinator to hand to
                W122's declaration
Depends on: nothing
Blocks:     W122
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; `git diff --name-status -- doc/questions/` M/A
            only; check:register, check:markdown, check:markdown:selftest EXIT 0; the stamp count
            equals the approved row count
Reserves:   Q513-Q516 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W121
```

**Q513 is earmarked** for the divergence P29 decision 7 names: our [Q19](../questions/q19.md) is
resolved and `fyflow-react-components` Q14, the same question, is still open there. Q514-Q516 are
spare; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W121 never edits W122's file.

## The item's ids, from the lookup at `988ef5f`

**38 questions**: the 13 open in *The join*, the 23 open in *Identity, state, failure*, Q508 from
*Documents and indexes*, and Q92, deferred in *The join* (P29 stop-and-ask (k)). *Documents and
indexes* holds two open questions; the other, [Q494](../questions/q494.md), is W127's, resolved by
ADR 0082 (P29 decision 6). Q499 is the other deferred question and is Out (stop-and-ask (e)).

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`:
`scripts/lookup.mjs` imports only `node:fs`, `node:path` and `node:url`, so the copy needs none.

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w121d-33160
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=The join" --fields id                   # 13, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Identity, state, failure" --fields id   # 23, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Documents and indexes" --fields id      # Q494 Q508, EXIT 0
node scripts/lookup.mjs q --where status=deferred --fields id,cluster                   # Q92 The join; Q499 Documents and indexes, EXIT 0
cd .. && find . -type l | wc -l                                                          # 0, then the copy was removed
```

| cluster | ids | n |
|---|---|---|
| The join, open | Q5, Q7, Q23, Q27, Q81, Q82, Q96, Q97, Q161, Q163, Q354, Q357, Q358 | 13 |
| The join, deferred | Q92 | 1 |
| Identity, state, failure | Q16, Q18, Q26, Q28, Q29, Q30, Q37, Q38, Q39, Q61, Q62, Q63, Q103, Q241, Q249, Q307, Q330, Q331, Q365, Q371, Q372, Q374, Q386 | 23 |
| Documents and indexes | Q508 | 1 |
| **all** | | **38** |

**The 38 owned files**, under `doc/questions/`: `q5.md`, `q7.md`, `q16.md`, `q18.md`, `q23.md`,
`q26.md`, `q27.md`, `q28.md`, `q29.md`, `q30.md`, `q37.md`, `q38.md`, `q39.md`, `q61.md`, `q62.md`,
`q63.md`, `q81.md`, `q82.md`, `q92.md`, `q96.md`, `q97.md`, `q103.md`, `q161.md`, `q163.md`,
`q241.md`, `q249.md`, `q307.md`, `q330.md`, `q331.md`, `q354.md`, `q357.md`, `q358.md`, `q365.md`,
`q371.md`, `q372.md`, `q374.md`, `q386.md`, `q508.md`.

At `988ef5f`, Q17 and Q19 are `resolved` and Q20 is `open`, and all three have `shared: ""`.

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W121: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. `shared` on Q17 (`fyflow-react-components` Q16), Q19 (its Q14) and Q20 (its Q15), with the
   repository's name attached as `doc/questions/README.md` requires. No status changes on the three.
5. Q513 raised, as `doc/questions/README.md` says to raise one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/` or
  `test/` changes; a question whose answer is *decide now* is a keep with a `closes-when` naming the
  decision (decision 3).
- **Q20's verdict** — W122's, with a `closes-when` naming `fyflow-react-components` Q15. This item
  fills Q20's `shared` only.
- **Q494** (W127) and **Q499** (stays deferred).
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **The sibling repository.** Nothing is written there.

## Calibration

**W121 is the pilot and receives no calibration. What its reader and the maintainer change is
recorded in this item's Record and handed to W122's declaration by the coordinator** (P29 decision
5).

## The phases

P29 decision 4, in this order. A phase does not start before the one above it is complete.

1. **Propose.** Fill the worksheet: one row per question. The evidence is (a) the `npm run refs`
   count at `988ef5f`; (b) whether the code, clause, file or rule the question names still exists
   at `988ef5f`, as a path, or as a grep with its hit count and the exact pattern; (c) any later
   ADR, plan or item that answered it, by id.
2. **Check.** A fresh-context conformity reader reads each QUESTION first and the worksheet second,
   re-derives each row from the question and the tree, and reports AGREE, DISPUTE or CHANGE per row
   with its reason. It does not fix.
3. **Approve.** The maintainer approves, striking or changing rows. **Only approved rows are
   applied.** A struck row becomes a keep with a `closes-when` the maintainer states.
4. **Apply.** The approved rows' fields, the ADRs' `resolves`, `shared` on Q17/Q19/Q20, and Q513.
5. **Record.** After the gate below, with the tree still.

### Worksheet

*Filled in at phase 1.* The evidence cell holds three parts: **refs** (the count), **subject** (path,
or grep pattern and hit count, at `988ef5f`), **answered by** (ADR, P or W id, or none).

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q5 | | | |
| Q7 | | | |
| Q16 | | | |
| Q18 | | | |
| Q23 | | | |
| Q26 | | | |
| Q27 | | | |
| Q28 | | | |
| Q29 | | | |
| Q30 | | | |
| Q37 | | | |
| Q38 | | | |
| Q39 | | | |
| Q61 | | | |
| Q62 | | | |
| Q63 | | | |
| Q81 | | | |
| Q82 | | | |
| Q92 | | | |
| Q96 | | | |
| Q97 | | | |
| Q103 | | | |
| Q161 | | | |
| Q163 | | | |
| Q241 | | | |
| Q249 | | | |
| Q307 | | | |
| Q330 | | | |
| Q331 | | | |
| Q354 | | | |
| Q357 | | | |
| Q358 | | | |
| Q365 | | | |
| Q371 | | | |
| Q372 | | | |
| Q374 | | | |
| Q386 | | | |
| Q508 | | | |

### Reader's findings

*Filled in at phase 2.*

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| | | |

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row.*

### Stop-and-asks

| | the question | answer |
|---|---|---|
| | | |

## Verification

The gate's clauses, each run redirected with its exit code read in the same command:

| clause | how |
|---|---|
| reader report | the Reader's findings table, one row per worksheet row |
| maintainer approval | the Approval section |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for `q513.md`-`q516.md`; no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W121" --count > n.log 2>&1; echo EXIT=$?` — equals the approved row count. **`--include-icebox` is required**: without it the lookup hides every icebox verdict and the count falls short by exactly those rows |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in when the item is done.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| reader report | | |
| maintainer approval | | |
| name-status M/A only | | |
| `check:register` | | |
| `check:markdown` | | |
| `check:markdown:selftest` | | |
| stamp count | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

**What broke.**

**What this taught.**

**Questions raised.**
