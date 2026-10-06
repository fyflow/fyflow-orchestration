# W122 — B2: a verdict for each open question in the decisions-and-data and scale-and-interop clusters

**Status:** done — the 70 approved verdicts applied on 2026-10-06, Q386 re-stamped by the maintainer's answer, R8 on four ADRs, and every gate clause EXIT 0; see the Record
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
W123's file. **[`doc/questions/q386.md`](../questions/q386.md) is edited under the maintainer's
answer of 2026-10-06 (*"Own trigger"*)** — its `note` gains a re-stamp and nothing else; it is
outside the 70 owned files and is a record-step file (`doc/workflow.md` section 1 rule 5,
`doc/questions/**`), so it is named here rather than added to `Owns` (see *Dependencies* below).

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
  for Q386. **Q386 is not in this item's `Owns`.** *Declared:* if Q9's approved verdict fires
  Q386's trigger, the Record says so and the coordinator decides where Q386 is revisited.
  *Amended 2026-10-06:* Q9 was approved as a defer, which fires nothing, and the maintainer answered
  *"Own trigger"*, so the apply step re-stamps q386.md's `note` — still `deferred` — with its own
  trigger (see *Exceptions* above and the Keeps round).

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
- **Q386's verdict**, W121's (it stays `deferred`; only its `note` is re-stamped, by the
  maintainer's answer), and every other question outside the 70.
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

*How the evidence was taken (phase 1, the propose unit).* **refs** is `node scripts/lookup.mjs refs Q<n>`
run in a `git archive` of `988ef5f` (`dev-dist/w122p-35501/base`, no links, EXIT 0 for all 70), given as
*files / mentions*. **subject** is `git grep -c -F '<pattern>' 988ef5f -- <paths>`, summed, or a
`git show 988ef5f:<path>` line. Nothing was read from the working tree. Where a keep or trigger
`closes-when` is only a reopening trigger, the row is a defer and the trigger moves into `note`, with
`closes-when` cleared (calibration 1).

**Proposal summary: 70 rows — keep 2, defer 27, icebox 27, resolve 11, duplicate 3, obsolete 0**,
counted from the table below by script. *Decisions and data* (42): defer 16, icebox 17, resolve 9.
*Scale and interop* (28): keep 2, defer 11, icebox 10, resolve 2, duplicate 3. Resolutions that name an
ADR, so that apply also adds the id to that ADR's `resolves` (R8): Q201 → ADR 0042, Q251 → ADR 0051,
Q278 → ADR 0053, Q293 → ADR 0058, Q387 → ADR 0067. *(Phase 1's proposal, superseded at Approval:
Q387 became an icebox, so ADR 0067 gained nothing; the applied tally is the Final table's.)*

**Q9 and Q386.** Q9's proposed verdict is **defer**, not a decision, so Q386's trigger (*Q9 decided*)
has not fired: Q386 stays deferred and is not edited here. Its stamp *waits on Q9's verdict in W122*
becomes stale wording once this batch applies; that is for the coordinator (*Dependencies*).
*(Superseded 2026-10-06: the maintainer answered "Own trigger", and the apply step re-stamped
q386.md's `note`, still `deferred` — see Exceptions.)*

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q9 | defer | **refs** 35 / 58. **subject** `nothing enforces` in `src/driver/driver.ts`: 2 (lines 2071, 2974, both citing Q9); `RN-R20` in `spec/run-state.md`: 4, refusing a gate whose replayed answer changed as `diverged`. **answered by** none as a whole: P10 declined enforcement *with a measurement, and left open*; ADR 0074 makes a DECLARED predicate unable to be impure; RN-R20 detects an impure gate at resume. A registered function is still only asked | `status: deferred`; note stamp `P29 W122: defer — P10 declined enforcing purity with a measurement; ADR 0074 makes a declared predicate pure by construction and RN-R20 refuses a diverging gate at resume; enforcing a registered function waits on a mechanism nobody has proposed`. **For Q386:** not a decision, so Q386's trigger does not fire |
| Q20 | keep | **refs** 16 / 20. **subject** `Q20` in `spec` + `src`: 12. **answered by** none; P29 decision 7 fixes the verdict: its twin is `fyflow-react-components` Q15 (one collector, one scheduler), and W121 filled `shared` | `closes-when`: fyflow-react-components Q15 answered there, and the same answer recorded here — whether one orchestrator may drive more than one scheduler and whether a run id is global. Never resolved here alone (P29 decision 7) |
| Q21 | defer | **refs** 24 / 30. **subject** `Q21` in ADR 0064: 2 (*Q21's stream half*); P23's table says *the STREAM half is W88's; REDACTION is declared out*, the maintainer's *not needed yet, maybe never*. **answered by** ADR 0064 / W88 for the stream half; the UI event family by none | `status: deferred`; note stamp `P29 W122: defer — the stream half landed as ADR 0064's positioned event sequence (W88); an event family and redaction for a UI wait on fyflow-react-components asking for one` |
| Q34 | duplicate | **refs** 6 / 6. **subject** `crypto.getRandomValues` in `spec/runtime-targets.md`: 2 (the portable default); ADR 0022 *the driver generates no run id, deliberately*; `createRuntime`'s `start()` mints run ids from a counter (P18 decision 10, `RunIdInUse` since W89). P23 sends *minting globally unique ids* to Q34 and Q85 together. **answered by** the portable half by the runtime's counter; the rest is Q20's | `resolved-by`: duplicate of Q20 — the portable half is answered (the runtime mints run ids from a counter and the driver mints none, ADR 0022); what remains is whether a run id is global, which is Q20's question |
| Q52 | defer | **refs** 11 / 17. **subject** `Q52` in `spec/runtime-targets.md` + `examples/README.md`: 2; L6 runs in Node and Deno only (Q33, resolved). **answered by** none; owner *before release* | `status: deferred`; note stamp `P29 W122: defer — waits on a release decision; L6 runs in Node and Deno, and the browser runs L0-L5 (Q33)` |
| Q64 | resolve | **refs** 4 / 4. **subject** `git show 988ef5f:AGENTS.md`: 3717 lines, the consumer reference; `Every snippet` in `CLAUDE.md`: 1 (*every snippet in it is extracted and executed by npm run gate*, `scripts/check-docs.mjs`). **answered by** P3 and W9 (the consumer reference and its extractor) | `resolved-by`: AGENTS.md is the consumer reference, and every snippet in it is executed by `npm run gate` through `scripts/check-docs.mjs` (P3, W9). Names no ADR |
| Q83 | icebox | **refs** 1 / 5. **subject** `Q83` in `test` + `scripts`: 0. W12 ran `node test/runner.ts` 15 consecutive times green after the one unreproduced red. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — one unreproduced failure, 15 green re-runs at W12, and nothing since` |
| Q85 | duplicate | **refs** 4 / 5. **subject** its title reads *Q20 is now a design question rather than a note: is a run id global?*; P23 names Q34 and Q85 together for global ids. **answered by** none | `resolved-by`: duplicate of Q20 — the same question, *is a run id global*, raised again as a design question; Q20 stays (keep) |
| Q87 | defer | **refs** 27 / 60. **subject** `RunIdInUse` in `src/scheduler/runtime.ts`: 4 — since W89 a runtime refuses a `start` or `resume` naming a run id a driver of it holds (RN-R25); W18 fixed the message. Drivers built by hand around one shared scheduler are still unchecked. **answered by** W18 (message) and W89 (one runtime); the hand-built pair by none | `status: deferred`; note stamp `P29 W122: defer — RunIdInUse (W89) enforces it for every run one runtime starts; drivers built by hand on one shared scheduler wait on Q20` |
| Q90 | icebox | **refs** 10 / 24. **subject** `Q90` in `examples/l6.ts`: 4, each saying tier 2 is not reachable from the two-driver row. W23 *declined Q90 with a measurement*; P7: *injecting a task the driver did not mint is a scenario no consumer produces on purpose*. **answered by** W23's ruling (declined) | `status: icebox`; note stamp `P29 W122: icebox — W23 declined it with a measurement; reaching ID-R4 tier 2 needs a task no consumer injects on purpose` |
| Q108 | icebox | **refs** 4 / 6. **subject** `Q108` in `src` + `examples` + `spec`: 0. ADR 0027's second producer of an unparseable id is demonstrated nowhere. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a second producer of an unparseable id is a what-if; W19 demonstrates the first` |
| Q118 | defer | **refs** 1 / 1. **subject** `FD-V9` in `spec/flow-definition.md`: 13; W21: *dead code that becomes live if FD-V9 is lifted. Said in place rather than removed*. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — the two arguments are unobservable while FD-V9 makes every branch entry a task; waits on FD-V9 being lifted` |
| Q119 | icebox | **refs** 19 / 26. **subject** `branchPathOf` in `src`: 23. P15 corrected its owner: *the measurement is about space and Q119 is about time*, and nobody has taken a time measurement since. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a time cost at depth nobody has reported; P15 says the cited measurement was about space` |
| Q165 | icebox | **refs** 21 / 58. **subject** `its reducer stays refused` in `doc/decisions`: 1 (ADR 0040: *Q165's FLOW is expressible*); `for a reason that has since expired` in `doc/decisions`: 1 (ADR 0051: the reshaping node is the join's successor). **answered by** ADR 0040 (the flow) and ADR 0051 / ADR 0075 (a transform on the successor) | `status: icebox`; note stamp `P29 W122: icebox — the flow runs without a reducer (ADR 0040) and a transform on the join's successor reshapes the record (ADR 0051, ADR 0075); a reducer key on the join itself has no consumer` |
| Q167 | defer | **refs** 5 / 14. **subject** `Q167` in `src` + `spec` + `AGENTS.md`: 0. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on a consumer who cannot tell a failing worker POOL from a flow of failing tasks` |
| Q186 | defer | **refs** 22 / 51. **subject** `nothing WARNS` in `spec/flow-definition.md`: 1, *which is a decision* (W46); but `the question is THIS ROW` in the same file: 1 — the spec says the threshold, *how large is too large*, is still Q186's own. **answered by** W46 for *nothing warns*; the threshold by none. Calibration 5: the text calls the threshold pending | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — W46 decided that nothing warns (spec/flow-definition.md section 3); the threshold waits on an author whose reference cost surprised them, or a threshold from anywhere` |
| Q190 | resolve | **refs** 12 / 26. **subject** `ACCEPTED and INERT` in `spec/flow-definition.md`: 1 — *a decision rather than an oversight … refusing them would put a rule about a KIND inside a rule about a GRAMMAR*, both shapes asserted by `test/driver/decision-context.test.ts`. **answered by** W42, recorded in `spec/flow-definition.md` section 3; P13 fact 5 confirmed both shapes | `resolved-by`: Accepted and inert, by decision — spec/flow-definition.md section 3 (W42): refusing it would put a rule about a kind inside a rule about a grammar, and both shapes are asserted at L2. Names no ADR |
| Q192 | icebox | **refs** 3 / 6. **subject** `resolveReference` in `src`: 4. W45 *amended rather than closed* it. A note about one caller's share of a shared expression's test bounds. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a test-adequacy observation about one caller of resolveReference, with no defect and no consumer` |
| Q194 | icebox | **refs** 2 / 5. **subject** `Q194` in `src` + `examples`: 0. W43: *closed in one direction by a type* (the example worker's role list). The rest is the scheduler's thread handler. **answered by** W43, in one direction | `status: icebox`; note stamp `P29 W122: icebox — closed for this repository's workers by a type at W43; the scheduler's thread handler is upstream's and nobody has reported it` |
| Q199 | icebox | **refs** 4 / 12. **subject** ADR 0042's *Prediction 1 FAILS* paragraph cites it; a method lesson from W45 (*measure against the admitted set*), not a library question. **answered by** W45's *What this taught* | `status: icebox`; note stamp `P29 W122: icebox — a method lesson W45 already wrote down; no library decision waits on it` |
| Q200 | defer | **refs** 2 / 2. **subject** `FD-V29` in `spec/flow-definition.md`: 16; ADR 0042's consequences state the cost (*it rests on JP-R5 … FD-R3 is the backstop*). **answered by** ADR 0042, as a stated cost | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — ADR 0042 states the cost and FD-R3 is the backstop; waits on a join policy that fires over an unsettled branch` |
| Q201 | resolve | **refs** 2 / 2. **subject** `An author can write` in `doc/decisions`: 1 (ADR 0042: *an author can write ? where nothing needed it*) — ADR 0042's consequences: *accepted, on Q190's own precedent … refusing it would put a rule about utility inside a rule about a grammar*. **answered by** ADR 0042 | `resolved-by`: Accepted and inert, by decision — ADR 0042's consequences, on Q190's precedent. **Apply also adds Q201 to ADR 0042's `resolves` (R8)** |
| Q205 | icebox | **refs** 1 / 2. **subject** `Q205` in `spec` + `src` + `AGENTS.md`: 0. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — no flow has needed to tell "did not run" from "returned null" through a conditional reference` |
| Q211 | resolve | **refs** 1 / 2. **subject** `71x`, `80x` and `112x` in `spec/flow-definition.md`: 3 lines, all three bases in section 3's cost blockquote. W46: *All three bases are now in section 3*. **answered by** W46 | `resolved-by`: spec/flow-definition.md section 3 states all three denominators of the cliff and which question each answers (W46). Names no ADR |
| Q218 | icebox | **refs** 8 / 19. **subject** `FD-R3` in `spec/flow-definition.md`: 15; its one road is the policy one, and FD-R3 refuses it at run time. **answered by** none | `status: icebox`; `closes-when` cleared; note stamp `P29 W122: icebox — FD-R3 still catches the road at run time; a third narrowing is a what-if` |
| Q219 | defer | **refs** 13 / 18. **subject** `FD-V27` in `spec/flow-definition.md`: 15. P15 declared it OUT and *the follow-on*; no plan took it. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — making a collection referenceable relaxes FD-V27; waits on an author reaching for it` |
| Q238 | defer | **refs** 2 / 4. **subject** `OR-R2` in `spec/outcome-record.md`: 17; `outputSchema` in `src/definition`: 10 — the worker-level declaration its `closes-when` names now exists as a JSON Schema subset, which says nothing about class behaviour. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — OR-R11 says a result is a value; a nested behaviour loss waits on a consumer whose result lost behaviour across OR-R2` |
| Q239 | defer | **refs** 6 / 7. **subject** `Q239` in `spec`: 1 (`spec/outcome-record.md`). **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on a run at a scale where retaining results is the constraint (W55's number)` |
| Q244 | keep | **refs** 2 / 3. **subject** `Q244` in `AGENTS.md` + `spec` + `src`: 0. W55 measured N runs on one shared scheduler at 115 / 277 / 884 / 3304 ms for N = 100-800 against linear on their own; every settlement reaches every driver and ID-R4 tier 1 drops it. `createRuntime` runs every run on one scheduler. **answered by** none | `closes-when`: a decision, as an ADR or an AGENTS.md section 12 rule, on the topology for N concurrent runs — one shared scheduler as `createRuntime` builds, a scheduler per run, or settlements routed to their own driver rather than broadcast to all N |
| Q245 | defer | **refs** 2 / 3. **subject** `Q245` in `AGENTS.md` + `spec` + `src`: 0; W55: `v8.serialize` refuses a `FyflowTask`. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — the scheduler's own retention waits on Q244's topology and on a run where heap is the constraint` |
| Q248 | defer | **refs** 6 / 13. **subject** `limitKey` in `spec` + `src`: 1. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on an author with a keyed group and a flow that cannot say which key` |
| Q250 | defer | **refs** 6 / 9. **subject** `Q250` in `spec`: 1. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on a type whose worker holds a resource that a settings value selects (a model per variant)` |
| Q251 | resolve | **refs** 11 / 15. **subject** `transform` in `src/definition/types.ts`: 14; ADR 0051 rules 1 and 3: a declared `transform: { lang, expr }` on a typed task, evaluated in the type's worker wrapper; W117 lists ADR 0051 Q251 in its status prose. **answered by** ADR 0051 (P17) | `resolved-by`: ADR 0051 rules 1 and 3 — a transform is a declared expression in a registered language, applied in the type's worker wrapper. **Apply also adds Q251 to ADR 0051's `resolves` (R8)** |
| Q258 | icebox | **refs** 2 / 4. **subject** `Q258` in `AGENTS.md` + `spec` + `src`: 0; nothing in this repository listens for `resource.*`. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a gap in the scheduler's reference; nothing here reads resource.* events, and it becomes an S row if something does` |
| Q259 | defer | **refs** 6 / 10. **subject** `recorded rather than closed` in `spec/flow-definition.md`: 1; ADR 0049 fact 4 priced a deep copy and the maintainer chose *record it*. **answered by** ADR 0049, as recorded | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — ADR 0049 recorded the by-reference road and declined a deep copy; waits on a consumer sharing one definition object with something that edits it` |
| Q260 | defer | **refs** 3 / 5. **subject** `Q260 stays open` in `spec/flow-definition.md`: 1 — a named instance's collision is `NameCollision`; a pool built by hand and spread beside the helper's is still unchecked, and the wrapper refuses the raw payload at run time. **answered by** v0.19, in part | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — NameCollision covers a named instance; a hand-built pool spread beside the helper's waits on a consumer who does that` |
| Q261 | defer | **refs** 18 / 36. **subject** `Q261` in `AGENTS.md` + `spec` + `src`: 5. **answered by** none; its `closes-when` is Q52's browser rung, and Q52 is proposed defer | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on Q52's browser rung` |
| Q262 | defer | **refs** 4 / 19. **subject** `Q262` in `examples/l6.ts`: 2. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on a consumer rate-limiting by group with retries on; then an S row` |
| Q263 | defer | **refs** 17 / 58. **subject** `Q263` in `spec` + `src` + `AGENTS.md`: 6. AGENTS.md section 14 teaches `$sum([*.score])`; W73's verdict names the sample's arity (`src/definition/wiring.ts`), on one sample. **answered by** W63 (shown), W73 (named in the verdict) | `status: deferred`; note stamp `P29 W122: defer — a JSONata property, documented in AGENTS.md section 14 and named by the wiring verdict's arity; checking every arity waits on an author it bites` |
| Q264 | icebox | **refs** 11 / 16. **subject** `Q264` in `src` + `test`: 8; ADR 0051 consequence 1. The conformance suite binds the one shipped adapter. **answered by** ADR 0051 consequence 1, as a cost | `status: icebox`; note stamp `P29 W122: icebox — one adapter ships and the suite binds its halves; a second adapter is a what-if` |
| Q265 | resolve | **refs** 9 / 17. **subject** `'eval'` in `src/jsonata/index.ts`: 1 (`UNBOUND_FUNCTIONS`, *the maintainer's answer to Q265 at W62*); `AGENTS.md:2544` says the same. **answered by** W62 | `resolved-by`: Unbound — the JSONata adapter unbinds `$eval` by name, so expression text is refused at construction only (the maintainer's answer at W62; src/jsonata/index.ts UNBOUND_FUNCTIONS; AGENTS.md section 14). Names no ADR |
| Q266 | defer | **refs** 6 / 14. **subject** `Q266` in `AGENTS.md`: 1. **answered by** none | `status: deferred`; `closes-when` cleared; note stamp `P29 W122: defer — waits on a consumer whose typed worker's setup() can fail and who reads RunState for the run's fate` |
| Q270 | icebox | **refs** 2 / 3. **subject** `plain` or `sequence` in `test/scheduler/adapter-conformance.ts`: 0; the JSONata adapter strips the marker at every depth (`AGENTS.md:2548`). **answered by** W62, for the one adapter | `status: icebox`; note stamp `P29 W122: icebox — the shipped adapter strips its marker; a conformance clause matters only for a second adapter` |
| Q271 | icebox | **refs** 3 / 3. **subject** `Q271` in `spec`: 1 (`spec/runtime-targets.md`). A property of Deno's lockfile format. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a property of deno.lock's format, not this repository's; nothing here relies on its integrity` |
| Q275 | resolve | **refs** 2 / 4. **subject** `spec/flow-definition.md:502-509`, `FD-V30`'s measurement paragraph: `{}` and `{ "backoffMs": 5 }` *silently mean no retries*, and *`maxRetries: 0` is accepted: it means what an omitted policy means and says so explicitly*. **answered by** `spec/flow-definition.md` section 2 (`FD-V30`) | `resolved-by`: spec/flow-definition.md section 2, FD-V30's paragraph — an omitted policy means no retries, and `maxRetries: 0` is accepted as saying so explicitly. Names no ADR |
| Q278 | resolve | **refs** 20 / 44. **subject** `REFUSED at construction naming the keyword` in `doc/decisions`: 1 (ADR 0053 rule 3); W117 lists ADR 0053 Q278 in its status prose. **answered by** ADR 0053 | `resolved-by`: ADR 0053 rule 3 — a keyword outside the built-in subset is refused at construction, naming the keyword and its path, never ignored. **Apply also adds Q278 to ADR 0053's `resolves` (R8)** |
| Q280 | defer | **refs** 2 / 6. **subject** `Q280` in `AGENTS.md` + `spec` + `src`: 0; no AGENTS.md sentence tells a consumer that its own task on a shared scheduler needs the envelope. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — waits on a consumer adding its own tasks to a runtime's scheduler` |
| Q281 | resolve | **refs** 1 / 1. **subject** `runtime.registry` in `src/scheduler/runtime.ts`: 4 — *the driver's registry is derived once and exposed as runtime.registry (decision 14)*; W65 said W66's `runtime.registry` decides which shape a consumer holds. **answered by** P18 decision 14, built at W66 | `resolved-by`: P18 decision 14 (W66) — a consumer holds the registry DOCUMENT, and `createRuntime` derives the driver's registry from it once and exposes it as `runtime.registry`. Names no ADR |
| Q282 | icebox | **refs** 4 / 5. **subject** `settingsSchema` in `src/definition/registry.ts`: 4; two entries over one URL is the shipped workaround (W65 item 10). **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — two worker entries over one module is the workaround; a type narrowing its worker's schema has no consumer` |
| Q284 | icebox | **refs** 2 / 4. **subject** `Q284` in `spec` + `src`: 0. P18's record: *an options bag has no order the scheduler reads*, so key order is not an observable. **answered by** P18's record | `status: icebox`; note stamp `P29 W122: icebox — P18 found key order is not an observable; fixing one has no reader` |
| Q285 | icebox | **refs** 2 / 3. **subject** `flows` in `src/scheduler/runtime.ts`: 10; W66 asks whether a pool should gain an adapter later. **answered by** W66, as shipped | `status: icebox`; note stamp `P29 W122: icebox — createRuntime takes its flows by design; a pool gaining an adapter later has no consumer` |
| Q286 | icebox | **refs** 1 / 1. **subject** `Q286` in `src`: 0. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a derivation run twice has no consumer-visible effect while derivations are pure` |
| Q287 | icebox | **refs** 1 / 1. **subject** `not exported from the package ROOT` in `AGENTS.md`: 1 — section 9 names all four runtime refusals by hand; `index.ts` keeps the root scheduler-free by design. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — AGENTS.md section 9 names the four runtime refusals; an executable enumeration over the scheduler sub-path has no consumer` |
| Q291 | icebox | **refs** 2 / 6. **subject** `Q291` in `src`: 0; W67 fixed the blocker in `createRuntime`. **answered by** W67, the behaviour | `status: icebox`; note stamp `P29 W122: icebox — W67 fixed the behaviour in createRuntime; the remaining one-place statement has no reader who was misled` |
| Q293 | resolve | **refs** 12 / 33. **subject** `done` in `src/scheduler/runtime.ts`: 19; ADR 0058 is *raised by Q293*, and rules 1-3: `runtime.start` returns `{ driver, done }`, the runtime keeps the fold, `done` resolves with the terminal RunState. **answered by** ADR 0058 (W77) | `resolved-by`: ADR 0058 rules 1-3 — `runtime.start` returns `{ driver, done }`, the runtime keeps the fold, and `done` resolves with the terminal RunState. **Apply also adds Q293 to ADR 0058's `resolves` (R8)** |
| Q305 | icebox | **refs** 4 / 8. **subject** `OPEN producer` in `AGENTS.md`: 1 — the leniency is stated to a reader in section 15. **answered by** W73, as a stated leniency | `status: icebox`; note stamp `P29 W122: icebox — stated in AGENTS.md section 15; tightening it waits on nothing anyone has asked for` |
| Q306 | defer | **refs** 6 / 15. **subject** `Q306` in `src` + `AGENTS.md`: 3; ADR 0053 rule 7 writes the subset's reversal condition. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — the wiring check carries the record's shape; widening the subset waits on ADR 0053 rule 7's reversal condition` |
| Q311 | icebox | **refs** 6 / 9. **subject** `pathsOf` in `src`: 13; W80: *P19 slice 2, Q311, condition not fired*. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — an object-valued const or enum in a schema is a what-if; W80 says its condition has not fired` |
| Q316 | icebox | **refs** 2 / 6. **subject** `Q316` in `spec` + `src` + `AGENTS.md`: 0. A claim in P20's fact table about the harness that produced it. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a defect in a finished plan's fact table; no library decision waits on it` |
| Q322 | defer | **refs** 3 / 4. **subject** `fail('X9'` in `scripts/check-docs.mjs`: 4 — X9 refuses `package.json` and `deno.json` disagreeing on the version. Binding the version to the API's shape is still nothing's. **answered by** X9 for the manifests half | `status: deferred`; note stamp `P29 W122: defer — check-docs X9 refuses two manifests disagreeing; binding the version to the API's shape waits on a published release a consumer pins` |
| Q336 | icebox | **refs** 1 / 1. **subject** `resolveWorkerUrl` in `src/scheduler/runtime.ts`: 2. Only an ACCESSOR on `outputSchema` shows the difference. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — only an accessor on a schema object shows it, and a document is JSON` |
| Q355 | icebox | **refs** 2 / 3. **subject** `Q355` in `spec` + `src`: 0. One occurrence. **answered by** none | `status: icebox`; `closes-when` cleared; note stamp `P29 W122: icebox — one occurrence; a second rule whose message and condition disagree would reopen it` |
| Q376 | duplicate | **refs** 5 / 18. **subject** `Q376` in `examples/l6.ts`: 3; *a consumer has no call that STOPS a run* is what cancelling a run would provide. **answered by** none; Q18 (W121, deferred) is *what does cancelling a run actually do* | `resolved-by`: duplicate of Q18 — a call that stops a run is cancelling it; Q18 stays (deferred, waiting on S2 or a consumer asking to cancel). The drain finding stays in W90's Record |
| Q387 | resolve | **refs** 4 / 11. **subject** `one more call of` in `doc/decisions`: 1 — ADR 0067: the throwaway memory keeps the `FD-R4` check from writing the run's memory, and *its cost is one more call of fn for an entry gate*; `spec/flow-definition.md`'s gate row says the same. **answered by** ADR 0067 | `resolved-by`: ADR 0067's FD-R4 paragraph — an entry gate is asked once more at start() against a throwaway memory, so the check never writes the run's memory, and that cost is why a gate type must be pure. **Apply also adds Q387 to ADR 0067's `resolves` (R8)** |
| Q415 | defer | **refs** 8 / 11. **subject** `Q415` in `AGENTS.md`: 1 — section 20 names it as one of three silences; W100: *each in the safe direction*. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — named in AGENTS.md section 20 and silent in the safe direction; waits on an author wiring a gate into a join` |
| Q416 | defer | **refs** 2 / 3. **subject** `Q416` in `AGENTS.md`: 1 — section 20. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — named in AGENTS.md section 20; waits on an author misspelling a key path on an entry gate` |
| Q417 | icebox | **refs** 4 / 7. **subject** `Q417` in `AGENTS.md`: 1 — section 20. A container declared by `enum` or `const` is a schema nobody in the corpus writes. **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — named in AGENTS.md section 20; an enum or const container is a what-if` |
| Q447 | icebox | **refs** 3 / 5. **subject** `Q447` in `examples/l6.ts`: 1. A probe-harness limit (an equality with no identity control on strings). **answered by** none | `status: icebox`; note stamp `P29 W122: icebox — a limit of one probe's control; no library decision waits on it` |
| Q456 | defer | **refs** 5 / 10. **subject** `Q456` in `AGENTS.md`: 1 — section 21: *Write the literal, or compute the comparison in a Transform node*. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — AGENTS.md section 21 names the workaround; refusing a path-shaped value waits on a UI emitting one` |
| Q457 | defer | **refs** 3 / 4. **subject** `reachable by NO road` in `doc/decisions`: 1 — ADR 0075: *Second, and NOT fixed*. **answered by** none | `status: deferred`; note stamp `P29 W122: defer — ADR 0075 records it as not fixed; waits on a consumer needing a transform-only node in a thread or a group` |

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader: one row per worksheet row, AGREE,
DISPUTE or CHANGE, with the reason, and the row count confirmed against 70.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| Q9 | AGREE | re-derived keep-or-defer: P10 declined enforcement with a measurement and left it open (pending, calibration 5); ADR 0074 and RN-R20 narrow it. Defer is honest under calibration 2. Consequence for the coordinator: Q386's stamp *waits on Q9's verdict* is now answered by a defer, so Q386 needs its own trigger restated |
| Q20 | AGREE | fixed by P29 decision 7; `closes-when` names the sibling's Q15 and is a closing condition |
| Q21 | AGREE | ADR 0064 took the stream half; P23 Out: redaction *not needed yet, maybe never*; the envelope waits on the sibling |
| Q34 | CHANGE | duplicate → **resolve**. Q34 asks only how a run id is generated PORTABLY, and that is answered: P18 decision 10 (the runtime mints `r<n>` from a counter) and `RT-R6` (a caller-supplied id, no `crypto.randomUUID()`). *Is a run id global* is Q20's and Q85's question, not Q34's, so the duplicate target is not the same question. Status is `resolved` either way; only `resolved-by` changes, and it names no ADR |
| Q52 | AGREE | no release decision exists; L6 is Node and Deno (`RT-R10`) |
| Q64 | AGREE | resolve checked: AGENTS.md exists at 988ef5f as the consumer reference and `scripts/check-docs.mjs` executes its snippets (P3, W9). The answer exists and answers the title |
| Q83 | AGREE | one unreproduced red at W12, 15 green re-runs; the runner still imports every suite in one process (`test/runner.ts:38`) but nothing has recurred |
| Q85 | AGREE | its title is Q20's question restated; Q20 stays open (keep, decision 7) |
| Q87 | DISPUTE | defer → **resolve**. P5's ruling decides it BY NAME with a permanent reason: *a genuine precondition*, two runs sharing an id *are the same run*, and in-library enforcement is refused as disproportionate (the first mutable module-level state in `src/`); ADR 0023 section 2 states it as the one remaining precondition, and W89's `RunIdInUse` covers one runtime. Calibration 5 makes that a resolve. Tying it to Q20 parks a decided precondition on a question held for the sibling repo |
| Q90 | AGREE | W23 declined it with a measurement; no consumer injects an unminted task |
| Q108 | AGREE | the producer needs a spawning worker against ADR 0001 rule 2; no consumer |
| Q118 | AGREE | defer on `FD-V9` being lifted is a named trigger; icebox would be equally honest |
| Q119 | AGREE | P15 corrected it to a time question; nobody has a flow at depth |
| Q165 | AGREE | ADR 0040 makes the flow expressible; ADR 0051 and ADR 0075 reshape on the successor; the reducer has no consumer |
| Q167 | AGREE | its old `closes-when` was a trigger (calibration 1), moved to `note` |
| Q186 | AGREE | spec section 3 decides *nothing warns* and still calls the threshold Q186's own (pending), so defer, not resolve |
| Q190 | AGREE | resolve checked: spec/flow-definition.md section 3 records ACCEPTED as a decision with a permanent reason (kind vs grammar), asserted at L2; nothing calls it pending |
| Q192 | AGREE | a test-coverage note on `resolveReference` (still in `src/driver/driver.ts`), no defect |
| Q194 | AGREE | closed in this repository's direction by a type at W43; the rest is the scheduler's thread handler |
| Q199 | AGREE | a method lesson already written into ADR 0042 and W45 |
| Q200 | AGREE | ADR 0042 states the cost; the old `closes-when` (a fourth policy) is a trigger |
| Q201 | AGREE | resolve checked: ADR 0042's consequences accept it by name on Q190's precedent, with the reason; R8 adds Q201 to ADR 0042 |
| Q205 | AGREE | no flow or consumer has needed the distinction |
| Q211 | AGREE | resolve checked: spec/flow-definition.md lines 1292-1296 at 988ef5f carry 71x, 80x and 112x with their bases (W46) |
| Q218 | AGREE | `FD-R3` is the run-time backstop; *a third narrowing* is a trigger |
| Q219 | AGREE | P15's named follow-on, never taken; trigger moved to `note` |
| Q238 | AGREE | defer with a consumer trigger; icebox equally honest |
| Q239 | AGREE | waits on W55's scale where retention binds |
| Q244 | AGREE | keep is right and is the batch's most consequential row: `createRuntime` shares one scheduler across runs (P18 decision 10) and each driver adds its own listener (`src/driver/driver.ts:1363`), so W55's O(N^2) applies at the repo's own *thousands at a time*. The `closes-when` names a decision, a closing condition |
| Q245 | AGREE | tied to Q244's topology; unmeasurable by `v8.serialize` |
| Q248 | AGREE | trigger moved to `note` |
| Q250 | AGREE | ADR 0049's road not taken; trigger moved to `note` |
| Q251 | AGREE | resolve checked: ADR 0051 is this question built (a declared expression in a registered language, applied in the type's worker wrapper) and names Q251 as the maintainer's decision; R8 adds Q251 to ADR 0051 |
| Q258 | AGREE | nothing here listens to `resource.*`; an S row is the home if that changes |
| Q259 | AGREE | ADR 0049 chose *record it* over a deep copy; trigger moved to `note` |
| Q260 | AGREE | v0.19's `NameCollision` narrows it; the hand-built pool remainder waits on a consumer |
| Q261 | AGREE | ADR 0052 rule 8 and P18 decision 7 decide the asset rule; P18 says *not its closure*; waits on Q52 |
| Q262 | AGREE | trigger moved to `note` |
| Q263 | AGREE | defer is honest; a resolve was also available (P17's Ids: *needs no adapter-side normalisation*, the array form; W73 measured every arity; AGENTS.md documents it) |
| Q264 | AGREE | one adapter ships and the conformance suite binds its halves; a disagreement is a task failure, not a silence |
| Q265 | AGREE | resolve checked: `$eval` unbound by name, the maintainer's answer at W62, in `src/jsonata/index.ts` and asserted in `test/jsonata/jsonata.test.ts` |
| Q266 | DISPUTE | defer → **keep**. A live consumer hazard, not a what-if: a type's worker whose `setup()` throws leaves every task `pending` for ever, and AGENTS.md's own section-20 snippet warns that a wrong `base` does exactly this (*the tasks stay pending for ever (Q266)*). The fix is nameable and has a precedent: W61 made a transform's load failure throw from `run()`. `closes-when`: a decision whether the envelope worker remembers an inner `setup()` failure and fails each task from `run()` (W61's road), or the hang stays documented |
| Q270 | AGREE | the shipped adapter strips its marker; the clause matters only for a second adapter |
| Q271 | AGREE | a property of Deno's lockfile format |
| Q275 | AGREE | resolve checked, with a note: the cited FD-V30 paragraph exists at 988ef5f and states that an omitted policy means no retries and that `maxRetries: 0` says so explicitly. It **pre-dates the question** (W58, 2026-09-12, against Q275 raised at W63, 2026-09-15), so the title's *stated nowhere in spec/* was false when raised; the scheduler-reference half is upstream's |
| Q278 | AGREE | resolve checked: ADR 0053 rule 3 refuses an unknown keyword at construction, naming it; R8 adds Q278 to ADR 0053 |
| Q280 | AGREE | no AGENTS.md sentence states it; defer on a consumer adding its own tasks is honest |
| Q281 | AGREE | resolve checked: W65 itself said W66's `runtime.registry` decides which shape a consumer holds, and P18 decision 14 plus W66 settle it (the document in, the driver's registry derived and exposed) |
| Q282 | AGREE | the two-entry workaround is shipped; no consumer |
| Q284 | AGREE | key order is not an observable the scheduler reads |
| Q285 | AGREE | `flows` at construction is by design; no consumer for a later adapter |
| Q286 | AGREE | no visible effect while derivations are pure |
| Q287 | AGREE | the runtime sub-path is kept off the root by design; no consumer |
| Q291 | AGREE | W67 fixed the behaviour; the remainder is documentation |
| Q293 | AGREE | resolve checked: ADR 0058 is raised by Q293 and returns a completion handle from `runtime.start`; R8 adds Q293 to ADR 0058 |
| Q305 | AGREE | a stated leniency, documented in AGENTS.md |
| Q306 | AGREE | waits on ADR 0053's reversal condition |
| Q311 | AGREE | P19 slice 2's condition has not fired (P20, P21); icebox and defer are both honest |
| Q316 | AGREE | a finished plan's fact table |
| Q322 | AGREE | X9 holds the two manifests together; the API-shape binding waits on a release |
| Q336 | AGREE | only an accessor on a schema object shows it |
| Q355 | AGREE | one occurrence; trigger moved to `note` |
| Q376 | AGREE | *a call that stops a run* is cancelling a run, Q18's question; Q18 was deferred at W121, an earlier batch, so the target stays (calibration 4) |
| Q387 | DISPUTE | resolve → **icebox**. ADR 0067 states the double ask as a deliberate cost but never names Q387, and P24's Record, written after it in the same commit, says *Q387 stays open (observed on real workers)*. The last deciding text calls it open (calibration 5), and the resolve would write Q387 into ADR 0067's `resolves` on an inference. It is a documented, deliberate cost (AGENTS.md section 19) with no consumer, which is an icebox |
| Q415 | AGREE | silent in the safe direction and documented; consumer trigger |
| Q416 | AGREE | documented; consumer trigger |
| Q417 | AGREE | documented; no corpus schema writes such a container |
| Q447 | AGREE | a probe-harness limit |
| Q456 | AGREE | documented with its workaround; waits on a UI emitting one |
| Q457 | AGREE | ADR 0075 records it as not fixed; consumer trigger |

**Reader count, from this table by script: 70 rows covering the 70 ids — AGREE 66, DISPUTE 3 (Q87,
Q266, Q387), CHANGE 1 (Q34).** The worksheet was confirmed the same way: **70 rows, the 70 ids of
the id list exactly** (no missing and no extra id), and its tally recounted from its own table
matches its summary — keep 2, defer 27, icebox 27, resolve 11, duplicate 3, obsolete 0; *Decisions
and data* defer 16, icebox 17, resolve 9; *Scale and interop* keep 2, defer 11, icebox 10, resolve
2, duplicate 3. Every verdict was formed from the question and `988ef5f` (an archive, no links)
before the worksheet was opened. If all four rows are taken: resolve 12 (Q87 and Q34 in, Q387 out),
duplicate 2, keep 3, defer 25, icebox 28.

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row.*

**The maintainer, 2026-10-06, two answers:**

1. **W122:** *"Approve, taking the reader's".* The approved set is **the worksheet above with the
   Reader section's one CHANGE and three DISPUTE rows taken**, and nothing else. The worksheet's rows
   are not rewritten; the table below is the resolved verdict for every row that differs from them.
2. **Q386** (W121's, not in this item's `Owns`): *"Own trigger".* Q9 is approved as a defer, so the
   stamp *waits on Q9's verdict in W122* no longer names anything that will happen; Q386 gets its
   own trigger instead — deferred until a predicate with closure memory is reported. Recorded in the
   Keeps round table below; **q386.md is not edited at this phase.**

| id | worksheet | approved | taken from | approved fields |
|---|---|---|---|---|
| Q34 | duplicate | **resolve** | Reader CHANGE | `resolved-by` as the Reader's Q34 row: P18 decision 10 and `RT-R6`. Names no ADR |
| Q87 | defer | **resolve** | Reader DISPUTE | `resolved-by` as the Reader's Q87 row: P5's ruling, stated by ADR 0023 section 2, enforced for one runtime by W89's `RunIdInUse`. Names P5, not an ADR |
| Q266 | defer | **keep** | Reader DISPUTE | `closes-when` as the Reader's Q266 row; goes to the keeps round |
| Q387 | resolve | **icebox** | Reader DISPUTE | `icebox`; **ADR 0067's `resolves` does not gain Q387**, so the R8 list is Q201 → ADR 0042, Q251 → ADR 0051, Q278 → ADR 0053, Q293 → ADR 0058 |

**The counts, measured from the tables by script** (`dev-dist/w122k-38044/tally.mjs` and
`final.mjs`, EXIT 0): the worksheet has **70 rows over the 70 ids**, none missing and none extra,
and with the four rows taken the approved set is **keep 3 (Q20, Q244, Q266), defer 25, icebox 28,
resolve 12, duplicate 2 (Q85, Q376), obsolete 0 — 70**, the figure the Reader's own closing
paragraph predicts. *The counts shown in the approval question (defer 26, duplicate 1) were a
coordinator arithmetic slip; the rows approved are exactly the Reader's four.*

### Keeps round

*Filled in at phase 4: one row per question still `keep` after the approval, each with its
recommendation first, its plain-language briefing, and the maintainer's answer.*

| | the question, the briefing and the recommendation | answer |
|---|---|---|
| Q20 | **Rec: keep** — fixed by P29 decision 7. *Can one orchestrator drive several schedulers, and is a run id unique everywhere?* Example: two runtimes, each on its own scheduler, both start a run called `r1`. Is that one run or two? At `988ef5f` each runtime counts its own ids (`r1`, `r2`, ...) and refuses a second live run with an id already in use on *that* runtime (`RunIdInUse`, W89); nothing checks across runtimes, and the driver never makes up an id itself (ADR 0022). The sibling repo asks the same as fyflow-react-components Q15 (one collector, one scheduler). P29 decision 7: Q20 closes only when Q15 is answered there and the answer is recorded here. **Keep**: wait for that. **Defer, icebox or resolve**: each overrules decision 7, which is a plan change, not a triage verdict | **keep** — 2026-10-06, maintainer: *"Accept all recs"* |
| Q244 | **Rec: keep** — bites at the project's own stated scale. *Runs sharing one scheduler slow down quadratically.* Example: 100 runs on one shared scheduler took 115 ms; 800 took 3304 ms (W55's measurement). On separate schedulers, time grows in step with the run count. Why: every task completion reaches every run's driver, and each throws away the ones that are not its own (`ID-R4` tier 1, the rule ignoring task ids this driver did not send). At `988ef5f` `createRuntime` puts every run on one scheduler, the setup AGENTS.md teaches, and the project's goal is thousands of runs at once. **Keep**: decide the setup (shared, one scheduler per run, or each completion sent only to its own driver). **Defer**: wait for a consumer who hits it. **Icebox or resolve**: no grounds | **keep** — 2026-10-06, maintainer: *"Accept all recs"* |
| Q266 | **Rec: keep** — small, and can be decided now. *A worker that fails to start hangs the run silently.* Example: a node type's worker cannot start (a wrong `base` URL, or a database down during `setup()`); every task of that type stays `pending` for ever and the run never finishes. AGENTS.md section 20 warns about exactly this. At `988ef5f` the envelope worker already handles it for a JSONata language module that fails to load: it remembers the failure and throws it from `run()`, so each task fails the normal way (W61's road). A failed inner worker is not remembered. **Keep**: decide whether that road covers the inner worker. **Defer**: wait for a consumer who hits it. **Icebox or resolve**: no grounds, because the hang is real | **keep** — 2026-10-06, maintainer: *"Accept all recs"* |
| Q386 | *Not a keep, and not in this item's `Owns`* — W121's question, deferred there with the stamp *waits on Q9's verdict in W122*. Q9 is approved here as a **defer**, so that trigger names nothing that will happen | **own trigger** — 2026-10-06, maintainer: *"Own trigger"*. W122's apply step re-stamps Q386 as deferred until a predicate with closure memory is reported; q386.md is not edited before then |

#### Final approved verdicts

**70 rows: keep 3, defer 25, icebox 28, resolve 12, duplicate 2, obsolete 0** — counted from this table by script. *From*: **W** the worksheet, **R** the
Reader's CHANGE or DISPUTE as approved. Every row's `note` gains the stamp `P29 W122: <verdict>`, with the
reason, after `; ` where the note was not empty; a field not named is unchanged. **The three keeps were
answered in the keeps round above (2026-10-06, *"Accept all recs"*) before anything was applied** (phase 4).

| id | final | from | fields applied |
|---|---|---|---|
| Q20 | keep | W | `closes-when` as the worksheet's row (P29 decision 7); **kept in the keeps round, 2026-10-06** |
| Q244 | keep | W | `closes-when` as the worksheet's row; **kept in the keeps round, 2026-10-06** |
| Q266 | keep | R | `closes-when` as the Reader's Q266 row (a decision on W61's road, or the hang stays documented); the old `closes-when`, a consumer trigger, moves into `note`; **kept in the keeps round, 2026-10-06** |
| Q9 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q21 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q52 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q118 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q167 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q186 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q200 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q219 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q238 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q239 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q245 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q248 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q250 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q259 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q260 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q261 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q262 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q263 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q280 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q306 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q322 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q415 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q416 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q456 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q457 | defer | W | `deferred`; the worksheet's fields and stamp |
| Q83 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q90 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q108 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q119 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q165 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q192 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q194 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q199 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q205 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q218 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q258 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q264 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q270 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q271 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q282 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q284 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q285 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q286 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q287 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q291 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q305 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q311 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q316 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q336 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q355 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q387 | icebox | R | `icebox`; stamp *a documented, deliberate cost (ADR 0067; AGENTS.md section 19) with no consumer*. **ADR 0067's `resolves` does NOT gain Q387** |
| Q417 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q447 | icebox | W | `icebox`; the worksheet's fields and stamp |
| Q34 | resolve | R | `resolved-by` as the Reader's Q34 row: P18 decision 10 (the runtime mints `r<n>` from a counter) and `RT-R6` (a caller-supplied id, no `crypto.randomUUID()`). Names no ADR |
| Q64 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q87 | resolve | R | `resolved-by` as the Reader's Q87 row: P5's ruling, a genuine precondition (two runs sharing an id are the same run; in-library enforcement refused as disproportionate), stated by ADR 0023 section 2 and enforced for one runtime by W89's `RunIdInUse`. Names P5, not an ADR, so no `resolves` changes |
| Q190 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q201 | resolve | W | `resolved-by` as the worksheet's row; **ADR 0042 `resolves` gains Q201 (R8)** |
| Q211 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q251 | resolve | W | `resolved-by` as the worksheet's row; **ADR 0051 `resolves` gains Q251 (R8)** |
| Q265 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q275 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q278 | resolve | W | `resolved-by` as the worksheet's row; **ADR 0053 `resolves` gains Q278 (R8)** |
| Q281 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q293 | resolve | W | `resolved-by` as the worksheet's row; **ADR 0058 `resolves` gains Q293 (R8)** |
| Q85 | duplicate | W | `resolved-by` as the worksheet's row; its target stays |
| Q376 | duplicate | W | `resolved-by` as the worksheet's row; its target stays |

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
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W122" --count > n.log 2>&1; echo EXIT=$?` — **70** as declared, **71** once Q386's re-stamp (the maintainer's answer, Exceptions) carries the same `P29 W122` prefix. `--include-icebox` is required: without it the lookup hides every icebox verdict |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in 2026-10-06, by the apply unit, with the tree still.* Scratch: `dev-dist/w122a-38411/`
(`keeps.mjs`, `apply.mjs` and every log below). Node v24.20.0 by `fnm use 24` in every shell.
Nothing committed.

**Final verdicts: 70 — keep 3 (Q20, Q244, Q266), defer 25, icebox 28, resolve 12, duplicate 2 (Q85,
Q376), obsolete 0.** 67 of the 70 leave `open` (96%). `apply.mjs` re-tallied the *Final approved
verdicts* table before writing and refuses any other figure; it matched. **The keeps round**: all
three recommendations accepted, *"Accept all recs"*. **Q386**: re-stamped, still `deferred`, its W121
stamp left in place (*"Own trigger"*). **R8**: Q201 → ADR 0042, Q251 → ADR 0051, Q278 → ADR 0053,
Q293 → ADR 0058; ADR 0023 gained nothing (the coordinator's ruling), so Q87's `resolved-by` names P5
and W89 and the ADR 0023 reference sits in its `note`, where R8 does not read it.

**Gate — what ran.** Each run redirected, with `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| reader report | done | 70 rows: AGREE 66, DISPUTE 3 (Q87, Q266, Q387), CHANGE 1 (Q34). **P29 prediction 3 held** |
| maintainer approval | done | 2026-10-06, *"Approve, taking the reader's"*; the approval question showed *defer 26, duplicate 1*, a coordinator arithmetic slip — the rows approved are the Reader's four, and the counts above are from the table |
| keeps round | done | 3 rows, 3 kept |
| name-status M/A only | EXIT 0 | `ns.log`: 71 `M` (the 70 and Q386), no `A`, `D` or `R` |
| `check:register` | EXIT 0 | `reg.log`: R8 compared 24 pairings (W121's 16 plus the four new, both ways). **P29 prediction 4 held** |
| `check:markdown` | EXIT 0 | `md.log` |
| `check:markdown:selftest` | EXIT 0 | `mds.log`, 7/7 bounded |
| stamp count | EXIT 0, **71** | `n.log`: **70** declared, plus Q386's re-stamp, which carries the same `P29 W122` prefix |
| `git diff --name-only` against Owns | in Owns | `names.log`, 76: the 70 owned question files, `q386.md` (named in Exceptions), four ADRs (`resolves` only) and this file |
| own-id and withdrawn-claim grep, excluding `dev-dist/` | clean | `W122` outside `doc/questions/` is in P29's declaration, W121's file and this one. The phase-1 *Q387 → ADR 0067* and *Q386 is not edited here* are marked superseded where they stand; *defer 26, duplicate 1* appears only where it is named as the slip |

**Questions raised: none.** Q517, Q518, Q519 and Q520 were not issued: they are skipped, never
reissued.

**What this taught** — the calibration for W123:

1. **The reader's disputes were all on the decision-text test (calibration 5), in both directions**:
   Q87 decided by name (defer → resolve), Q387 still called open by a later Record (resolve → icebox),
   Q266 a live hang with a precedent fix (defer → keep). Check the LAST text that speaks.
2. **A `resolved-by` naming an ADR binds that ADR's `resolves` (R8 reads `resolved-by` in any case).**
   Where the ADR is not to gain the id, the ADR goes in `note`, as Q87's did.
3. **A resolve does not clear `closes-when` unless its row says so**: Q190 and Q201 were applied
   `resolved` with their old reopening triggers still in `closes-when`. W123's rows should say which.

*Amended after the gate, 2026-10-06, by the coordinator's ruling:* Q190's and Q201's `closes-when` cleared (calibration 1: a reopening trigger is not a closing condition); the four checks re-run, EXIT 0 (`*3.log`).
4. **A re-stamp of an earlier batch's question shares the prefix**, so the stamp count is the row
   count plus each re-stamp: declare it in the gate.
5. **Count the approval question from the table too**: the coordinator's 26/1 slip reached the
   maintainer.
