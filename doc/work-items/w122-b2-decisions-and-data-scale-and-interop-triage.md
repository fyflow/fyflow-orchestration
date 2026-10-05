# W122 — B2: a verdict for each open question in the decisions-and-data and scale-and-interop clusters

**Status:** todo — declared 2026-10-06 on `81ed979`, not started; no question's field has changed
**Plan:** [P29](../plans/p29-which-open-questions-still-matter.md)

```
Spec:       none — P29 decisions 1-5 and 7, and doc/questions/README.md's format
Owns:       the 70 question files listed below; this item's own question files, q517.md-q520.md;
            and the `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit; W121's calibration (below)
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the keeps round: one stop-and-ask per row still `keep` after (3), each with a
                recommendation and a plain-language briefing, and the maintainer's answer
            (5) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (6) the calibration this batch adds, recorded in this item's Record for the
                coordinator to hand to W123's declaration
Depends on: W121
Blocks:     W123
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; the keeps round answered; `git diff --name-status
            -- doc/questions/` M/A only; check:register, check:markdown, check:markdown:selftest
            EXIT 0; the stamp count, `npm run q -- --include-icebox --where "note~P29 W122"
            --count`, equals 70
Reserves:   Q517-Q520 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W122
```

Q517-Q520 are spare at declaration; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W122 never edits W121's or
W123's file, and never edits [Q386](../questions/q386.md) (see *Dependencies* below).

## The item's ids, from the lookup at `988ef5f`

**70 questions**: the 42 open in *Decisions and data* and the 28 open in *Scale and interop*,
[Q20](../questions/q20.md) included. Neither cluster holds a deferred question at `988ef5f` (the two
deferred are Q92, W121's, and Q499, Out).

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`, as W121
did: `scripts/lookup.mjs` imports only `node:` modules, so the copy needs none.

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w122d-35418
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Decisions and data" --count      # 42, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Scale and interop" --count       # 28, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Decisions and data" --fields id  # the 42 below, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Scale and interop" --fields id   # the 28 below, EXIT 0
cd .. && find . -type l | wc -l                                                          # 0
# and gci -Recurse -Force -Attributes ReparsePoint over base: 0; then the copy was removed
```

| cluster | ids | n |
|---|---|---|
| Decisions and data | Q9, Q165, Q186, Q190, Q192, Q199, Q200, Q201, Q205, Q211, Q218, Q219, Q238, Q239, Q248, Q251, Q259, Q260, Q263, Q264, Q265, Q270, Q278, Q281, Q282, Q284, Q291, Q293, Q305, Q306, Q311, Q316, Q322, Q336, Q355, Q387, Q415, Q416, Q417, Q447, Q456, Q457 | 42 |
| Scale and interop | Q20, Q21, Q34, Q52, Q64, Q83, Q85, Q87, Q90, Q108, Q118, Q119, Q167, Q194, Q244, Q245, Q250, Q258, Q261, Q262, Q266, Q271, Q275, Q280, Q285, Q286, Q287, Q376 | 28 |
| **all** | | **70** |

**The 70 owned files**, under `doc/questions/`: `q9.md`, `q20.md`, `q21.md`, `q34.md`, `q52.md`,
`q64.md`, `q83.md`, `q85.md`, `q87.md`, `q90.md`, `q108.md`, `q118.md`, `q119.md`, `q165.md`,
`q167.md`, `q186.md`, `q190.md`, `q192.md`, `q194.md`, `q199.md`, `q200.md`, `q201.md`, `q205.md`,
`q211.md`, `q218.md`, `q219.md`, `q238.md`, `q239.md`, `q244.md`, `q245.md`, `q248.md`, `q250.md`,
`q251.md`, `q258.md`, `q259.md`, `q260.md`, `q261.md`, `q262.md`, `q263.md`, `q264.md`, `q265.md`,
`q266.md`, `q270.md`, `q271.md`, `q275.md`, `q278.md`, `q280.md`, `q281.md`, `q282.md`, `q284.md`,
`q285.md`, `q286.md`, `q287.md`, `q291.md`, `q293.md`, `q305.md`, `q306.md`, `q311.md`, `q316.md`,
`q322.md`, `q336.md`, `q355.md`, `q376.md`, `q387.md`, `q415.md`, `q416.md`, `q417.md`, `q447.md`,
`q456.md`, `q457.md`.

## Dependencies

- **Q20 — P29 decision 7.** Q20 gets a **keep** whose `closes-when` names `fyflow-react-components`
  Q15, its twin, so it is **never resolved here alone**. W121 already filled its `shared` field;
  W122 changes its `closes-when` and `note` (the stamp), not `shared`. Q20 still goes through the
  keeps round (calibration 3), where its row says the verdict is fixed by decision 7 and changing it
  is a plan change, not a triage verdict.
- **Q9 — W121's [Q386](../questions/q386.md) waits on it.** Q386 was deferred at W121 with the stamp
  *waits on Q9's verdict in W122*. Q9's row in the worksheet therefore states what its verdict means
  for Q386. **Q386 is not in this item's `Owns` and is not edited here**; if Q9's approved verdict
  fires Q386's trigger, the Record says so and the coordinator decides where Q386 is revisited.

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W122: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. A question raised from Q517-Q520, as `doc/questions/README.md` says to raise one, only if the
   batch finds one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/` or
  `test/` changes; a question whose answer is *decide now* is a keep with a `closes-when` naming the
  decision (decision 3).
- **Q386**, W121's, and every other question outside the 70.
- **Q494** (W127) and **Q499** (stays deferred).
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **The sibling repository.** Nothing is written there, including for Q20.

## Calibration

**From W121's pilot: its reader's findings and the maintainer's answers of 2026-10-06** (P29
decision 5: written into this declaration, not retrofitted into W121). Each clause binds the
proposer, the reader and the apply unit.

1. **A keep's `closes-when` is a CLOSING condition**: an event or decision that would ANSWER the
   question. A *"reopen if X"* trigger is not one. A row whose only condition is such a trigger is a
   **defer**, with X in `note` and `closes-when` cleared. *W121: Q241, Q354, Q357 and Q249.*
2. **Be aggressive** — the maintainer's words: *"more aggressive in iceboxing and deferring"*. Prefer
   **icebox** (a what-if with no consumer) or **defer** (waiting on a named thing) over keep. **Keep
   only when the decision is nameable and someone will plausibly make it soon.**
3. **The keeps round.** After the approval, every row still `keep` goes to the maintainer in a
   per-question stop-and-ask (keep / defer / icebox / resolve), **with a recommendation first**. It
   comes with a **PLAIN-LANGUAGE BRIEFING**: every rule id expanded into what it says, a concrete
   example, and what each verdict would mean in practice. **The terse one-liners W121 used were
   rejected.** *W121: 13 rows went to the round and 4 stayed keep.*
4. **A duplicate points at a question that stays** (not resolved) **in its own batch or an earlier
   one, never at a later batch's question.** W122's later batches are W123-W126, so a duplicate of a
   *Verification and fixtures* question is not available here. *W121: Q386 → Q9 crossed into W122
   and became a defer.*
5. **The decision-text test.** If the deciding ADR or spec text still calls the matter pending
   (*"for now"*, *"is Q<n>"*), the row is keep or defer. If the text decides or refuses by name with a
   permanent reason, it is resolve. *W121: Q30 and Q28 pend and were deferred; Q38's P23 decision 10
   refuses by name with a permanent reason and was resolved.*
6. **The row-count check.** The proposer and the reader each confirm that **worksheet rows == the
   id count (70)**, and that **their tallies are counted from their tables**, not carried. *W121's
   proposer omitted Q103's row, both summaries were off by one, and the reader did not notice.*

## The phases

P29 decision 4, with the keeps round the calibration adds. A phase does not start before the one
above it is complete.

1. **Propose.** Fill the worksheet: one row per question, 70 rows. The evidence is (a) the
   `npm run refs` count at `988ef5f`; (b) whether the code, clause, file or rule the question names
   still exists at `988ef5f`, as a path, or as a grep with its hit count and the exact pattern; (c)
   any later ADR, plan or item that answered it, by id. Rows count against the id list (calibration 6).
2. **Check.** A fresh-context conformity reader reads each QUESTION first and the worksheet second,
   re-derives each row from the question and the tree, and reports AGREE, DISPUTE or CHANGE per row
   with its reason. It confirms the row count and counts its own tally from its table. It does not fix.
3. **Approve.** The maintainer approves, striking or changing rows. **Only approved rows are
   applied.** A struck row becomes a keep with a `closes-when` the maintainer states.
4. **Keeps round.** Every row still `keep` goes to the maintainer one by one, with a recommendation
   and the briefing calibration 3 requires. **Nothing is applied before each is answered.**
5. **Apply.** The approved rows' fields and the ADRs' `resolves`.
6. **Record.** After the gate below, with the tree still.

### Worksheet

*Filled in at phase 1.* The evidence cell holds three parts: **refs** (the count), **subject** (path,
or grep pattern and hit count, at `988ef5f`), **answered by** (ADR, P or W id, or none). **70 rows.**

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 70.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row.*

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, and the maintainer's answer.*

| | the question, the briefing and the recommendation | answer |
|---|---|---|

#### Final approved verdicts

*Filled in after phase 4: 70 rows, the tally counted from this table.*

## Verification

The gate's clauses, each run redirected with its exit code read in the same command:

| clause | how |
|---|---|
| reader report | the Reader's findings table, one row per worksheet row, 70 |
| maintainer approval | the Approval section |
| keeps round | the Keeps round section, one answered row per keep |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for a question raised from `q517.md`-`q520.md` (made visible with `git add -N`); no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W122" --count > n.log 2>&1; echo EXIT=$?` — **70**. `--include-icebox` is required: without it the lookup hides every icebox verdict |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in when the item is done.*
