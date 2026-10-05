# W15 — The fourth column, and the chain nothing runs

**Status:** done — gate green, **both readers run and every finding acted on**
**Plan:** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) — the first of
its three items, and **the only one that can be built without knowing the answer**. That is why it is
first: building the evidence before the decision is what stops ADR 0025 being written from the
argument in the plan.

```
Spec:       spec/join-policy.md section 3 (what each policy NAME means, and
            JP-R7/JP-R8's claims about what a refinement DOES) and section 4
            (the seam contract: on `unsatisfiable` the driver reports with the
            policy's own describe and routes nowhere). spec/run-state.md
            section 3's precedence and RN-R10/RN-R11 for what the fold must
            then say. This item writes NO spec and changes none — if a rule
            turns out to be unstatable or false, that is a finding for the
            Record and it is W16 that acts on it
Owns:       test/matrix/**  — taken over from W4, which is done. P5's "Which
            files this plan takes over" table is the declaration; W16 takes the
            same directory AFTER this item, never concurrently
            plus one declared exception (doc/workflow.md section 7 rule 2):
              - none. doc/open-questions.md is section 1 rule 5's record-step
                file as of workflow.md v0.6, so the rows this item's Reserves
                block allocates need no exception. THIS LINE IS THE AUDIT: run
                `git diff --name-only` against this block before filling in the
                Record — check-owns.mjs was retired by P4's retro and nothing
                checks it
Inputs:     the two variant policies as they already exist, verbatim, in
            test/matrix/variants.test.ts — `arrival-count-decrementing` and
            `live-token-requiring-arrival`. They are W4's and this item does not
            change them, only what is run against them. The nine SCENARIOS and
            runCell() (W4). The driver's join seam as shipped: onUnsatisfiableJoin,
            joinStatusOf(), foldInputs() (W3, W5, W13). fold() and RunState (W2).
            P5's measurement table is the thing being made permanent, not a
            starting hypothesis to re-derive
Outputs:    (1) the matrix rendered at FOUR columns, every cell carrying status,
            describe and verdict, as a by-product of the same values the
            assertions use — renderTable() already takes a policyIds list;
            (2) an exact-list assertion of which rows each refinement changes,
            replacing the counts P5 measured;
            (3) the chain assertion: a policy returning `unsatisfiable`, through
            a real Driver, through foldInputs(), to RunState.outcome === 'stuck'
            with regions[*].joined === false and the describe reaching the
            caller — the four links exist and NOTHING runs them as one;
            (4) a recorded measurement of what a consumer who omits
            onUnsatisfiableJoin can learn (Q37), reported and not fixed
Depends on: nothing. It changes no shipped code and no spec
Blocks:     W16, which takes the same directory and needs (1)-(3) as its evidence
Tests:      L2 and L5, in test/matrix/**. Expected values come from
            spec/join-policy.md section 3 — which says what each policy NAME
            means — and from section 4's seam contract and spec/run-state.md
            section 3's precedence, NOT from running the variants. The three
            rows JP-R7 changes are derivable before the run: they are exactly
            the rows whose only non-arrival terminals are `branch.exited`,
            because that is the event it decrements on. Derive the list from
            the region-event streams, then run it
Gate:       L0 (typecheck, lint — no reference edit, so check:docs is unchanged
            but still runs) through L5. All five runtimes: the matrix is
            fixtures over a fake, so it carries no scheduler. Then pass 2 as
            doc/workflow.md section 6 defines it — TWO readers, the adequacy
            one in an ISOLATED COPY (v0.6)
Reserves:   Q91-Q94, ADR — none. This item takes no decision, by declaration
```

**Every line is fillable, and the one that had to be settled first was `Outputs:` (3)** — whether the
`unsatisfiable` chain works at all. P5 measured it before this item was declared: it does, and each
of its four links has a stub test while nothing runs them together. Had it *not* worked, this would
be a different item with a `src/driver/**` takeover, and P5 would be a different plan.

---

## Scope

**In**

1. **The fourth column.** `renderTable()` already accepts a `policyIds` list and `matrix.test.ts`
   passes two. The variants move from `variants.test.ts`'s local scope into the matrix's own policy
   list, so every row is run against four policies and the rendered table has four columns.
   `variants.test.ts` keeps its `JP-R7`/`JP-R8` claim assertions — they are what the rules ask for —
   and stops being the only place the variants are executed.
2. **Exact lists, not counts.** `JP-R7` changes `routed-away`, `optional-null` and `all-exit`;
   `JP-R8` changes `all-exit`. Asserted as sorted lists so that a policy edit that changes a
   *different* row fails rather than passing on arithmetic. **The rule this closes is a false claim
   rather than a missing test**: ADR 0003 and the register both said `JP-R7` repairs *"only the row
   P1 named"*, and the register is corrected. The ADR is W16's.
3. **The chain.** One test that starts from a policy returning `unsatisfiable` and ends at
   `RunState.outcome`, asserting at every link: `onUnsatisfiableJoin` fired once carrying the
   policy's own `describe`; `foldInputs()` contains `joinSettled(fired: false)`; the join's successor
   was **not** dispatched; `fold(driver.foldInputs()).regions[*].joined === false`; and the outcome
   is `stuck`. **The existing three stub tests stay** — this does not replace them, it connects them.
4. **What a consumer without the callback learns.** Measured and written into the Record:
   `onUnsatisfiableJoin` is optional, so the only remaining channel is `joinStatusOf()`, which is a
   poll nobody is obliged to call. That is [Q37](../questions/q37.md), **reported and not fixed**.

**Out** — named rather than left implicit, with where it goes instead

- **Any change to `src/**` or `spec/**`.** By declaration. If the chain assertion cannot be written
  without one, that is the finding and it goes to W16 rather than being patched here — which is
  `spec/README.md` rule 2's shape applied to code.
- **Shipping either variant, or removing `variants.test.ts`'s *"neither has an entry in `POLICIES`"*
  assertion.** That assertion is currently **true** and must stay green through this item. It is
  W16's to falsify, and only if ADR 0025 says so.
- **Whether `stuck` should distinguish a reported join from a silent one.** P5 measured that it does
  not — `joined: false` and `joined: null` both fold to `stuck`. Asserted here as the *shape*;
  whether it should be two outcomes is a `spec/run-state.md` question and this item does not own that
  file. If W16 does not take it, it is a Q from this item's block.
- **A new check script.** None is needed and none is added, which is the third plan running without
  exercising `doc/workflow.md` rule 7 (c). Said out loud rather than left to the retro to discover.

## Verification

How each clause of `Gate:` is actually run:

```bash
npm run typecheck && npm run lint
```

```bash
npm test && npm run test:deno && npm run test:browser:all
```

L2 and L5 are inside `npm test` — `test/matrix/**` is the L5 rung and the chain assertion is L2 (a
fake scheduler, no workers). L6 is **not run by this item and is not claimed**: nothing it touches
reaches `examples/**`. `npm run gate` is what W16 and W17 run.

**Which of the spec's named cases this item covers.** A branch routed away from its join (Q4):
**yes**, `routed-away` is one of the nine and is one of the three `JP-R7` changes. `user_action`
(Q17): **yes**, through `lost-resolved`, `suspended`, `resumed` and `all-exit`, unchanged from W4.
No matching decision edge (Q10): **yes**, the `branch.lost` rows. A duplicate task id (Q13):
**not applicable** — one driver, one run, and `ID-R4` is W13's. A nested fan-out (Q6): **not
applicable**, `FD-V15` still refuses it.

**Rule 8 does not apply to this item** — it acts on no review finding. **Rule 7 does not apply
either** — it adds no check script. What it owes instead is `doc/workflow.md` section 5 rule 3: every
assertion added here must be shown able to fail, and the way to show it is to enumerate **the
clauses of the rules being asserted** rather than the ways the new test could be deleted — which is
rule 8's v0.6 amendment applied to a rule that does not formally bind. Concretely, the provocation
set must break each of: every one of the four links in the chain independently; each of the six
region-event variants inside `emit`; `joined: false` versus `joined: null`; and each of the three
rows on `JP-R7`'s list, one at a time. **A set that only deletes the new assertions is the incomplete
shape P4's retro measured three times.**

## Record

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **green** | `npm run typecheck` — five projects (node, browser, deno, tests, examples) — and `deno lint src/ test/ examples/ index.ts`, **41 files** (39 before; the two new files are `test/matrix/variants.ts` and `test/matrix/chain.test.ts`). No reference edit, so `check:docs` is unchanged and still ran: **12/12** self-test probes, and `X5` still reports **"1 of 16"** under the DOM lib ([Q71](../questions/q71.md)), which is the value that fails the gate if it ever exceeds one |
| L1-L2 | **green** | **370 assertions in 18 files, in all five runtimes** — node 24.20.0, deno 2.9.6, chromium, firefox, webkit, with browser parity asserted against node at 370. Baseline at `6ac8401` was 326 in 17 files, so this item adds **44 assertions** (361 before the readers, +9 from acting on them). The chain is **L2**: `test/matrix/chain.test.ts` drives a real `Driver` over W4's fake, with no workers, no threads and no timers |
| L5 | **green** | `test/matrix/**` is **91 assertions in 4 files** (was 47 in 3), over **7 files** including the two new non-test modules. The matrix is **36 cells** — nine rows × four policies — every one carrying a status, a `describe` and a verdict, and the table renders at four columns |
| L6 | **ran, green, and NOT claimed** | `npm run gate` was run whole rather than stopping at L5, and L6 passed unchanged: **240 assertions, 15 runs each in node and deno**. It is not this item's rung — nothing here reaches `examples/**` — and it is reported only because running it and not saying so is what `doc/workflow.md` section 1 rule 4 forbids in the other direction |
| conformity reader | **run — 4 defects, 9 observations, all four acted on** | **It re-derived all 18 new cells, both changed-row lists, the 22 join-fires and the 10-cell `stuck` list independently before opening the artifact, and agreed on every one.** So the spec-conformity half is clean; **all four defects are claims rather than cell values**, and one of them is a real coverage gap in the plan's exit artifact. Detail below |
| adequacy reader | **run — 89 mutations, 73 valid, 26 survivors, 5 blocking. All five blocking families closed** | **In an isolated `git worktree`** (v0.6, first outing), carrying W15's full working state and verified green at 361 in node and deno before it started; it reported the worktree restored and the main checkout untouched, which `git status` confirms. Its verdict is the finding: **the two things W15 CREATED — the four-column render and the two promoted variant policies — were the least-guarded things in the item.** Detail below. The author's own sweep (**22 provocations, 1 survivor**) substitutes for neither reader, exactly as `doc/workflow.md` section 6 says: W5's author ran 19 and found 2 while its adequacy reader ran 148 and found 38 |
| re-run at `06d56a0` | **green** | the whole gate re-run against the committed tree, not against the working copy it was written in: 12/12 `check-docs` probes, **370** in node, deno, chromium, firefox and webkit with parity asserted, **240** at L6 in node and deno. Two commits — `a1c71ed` the `test/matrix/**` build, `06d56a0` the record step |

| Declared output | Exists | What would fail without it |
|---|---|---|
| four-column render | **yes** — `renderMatrix()` in `test/matrix/table.ts`, printed by a two-line `render.ts` and **asserted field by field** in `matrix.test.ts`. *(Both readers found this row's first version overclaiming: the renderer was a script the gate never executed, holding a column list nobody compared. Seven mutations survived it.)* | Provocation **F1** — the fourth column silently made a copy of the second — fails **26** assertions; with two columns it would fail none, because nothing would be running `liveTokenRequiringArrival` on the seven rows neither `JP-R7`'s nor `JP-R8`'s claim test names. **The refinements were previously ASSERTED on three cells of a possible thirty-six** — `acd`/`routed-away`, `acd`/`lost-settled` and `ltra`/`all-exit` — plus one aggregate divergence list. *(Corrected after the conformity reader: `divergingRows` already **executed** `arrivalCountDecrementing` over all nine rows; what it did not do was assert any cell of the other eight. The claim about coverage survives; the sentence as first written did not.)* |
| exact-list assertions | **yes** — `L5 — the fourth column: what each refinement changes` | Provocation **E1** (the variant also decrements on `branch.lost`) fails **9**, and **D1**/**D2** (a row leaves `JP-R7`'s list) fail **10** and **9** — each of the three trips the list assertion itself. **A count could not**: E1 leaves `JP-R7`'s three at three, so *"changes three rows"* stays true while the rows change |
| the chain assertion | **yes** — `test/matrix/chain.test.ts`, **fifteen** assertions across four suites (8 + 2 + 2 + 3; the runner's unit is the `test()` block). The fourth suite is the adequacy reader's blocking findings 2 and 3: all nine rows × four columns folded for `RN-R6`, and the three dispatch channels asserted to agree on every cell | Provocation **D3** — the `all-exit` row altered so a branch arrives — fails **20**, of which **10 are the chain's**. It is the only thing that notices that *the one row in the repository where a policy can say `unsatisfiable` has stopped being that row*; without it the remaining failures read as the row's expected values changing, not as the seam going unreachable. **On the four links individually it is a second reader rather than the only one** — A1-A7 each also trip a pre-existing stub test, which is the honest result and is discussed below |
| the Q37 measurement | **yes** — recorded in [Q37](../questions/q37.md)'s row, and made executable as `Q37 — what a consumer WITHOUT the callback can learn` | Nothing in the gate; it is a measurement, not a guard. What it buys is that the two claims in the register row — *"neither shipped policy ever calls it"* and *"the poll answers `waiting` forever"* — are now assertions rather than sentences, and the register is the document `CLAUDE.md` says is checked by nothing |

**`Owns` audit, by hand** (`doc/workflow.md` section 7 rule 2 — `check-owns.mjs` was retired by P4's
retro, so `git diff --name-only` plus `git ls-files --others` is the whole check):

| file | | |
|---|---|---|
| `test/matrix/matrix.test.ts` | modified | `Owns` |
| `test/matrix/run.ts` | modified | `Owns` |
| `test/matrix/render.ts` | modified | `Owns` |
| `test/matrix/variants.test.ts` | modified | `Owns` |
| `test/matrix/variants.ts` | **new** | `Owns` |
| `test/matrix/chain.test.ts` | **new** | `Owns` |
| `test/matrix/table.ts` | **new** — the adequacy reader's blocking finding 1 | `Owns` |
| `doc/open-questions.md` | modified | **record step**, section 1 rule 5 |
| `doc/plans/p5-*.md` | modified | **record step** — the plan's Record |
| `doc/README.md` | modified | **record step** |
| `CLAUDE.md` | modified | **record step** |
| `README.md` | modified | **record step** |
| this file | modified | the item's own Record |

**Seven `Owns` files, the five record-step files, and this one. Zero declared exceptions used, and the
declaration said none.** `src/**` and `spec/**` are untouched, which was the fan-out gate: nothing
here needed to know Q24's answer.

**The record step found two stale claims and corrected them in place**, which is the `doc/`-checked-
by-nothing class four retros have refused to make a rule about. `CLAUDE.md` said *"`doc/workflow.md`
is v0.5, run to completion by three plans"* in **two** places and `doc/README.md` in one — it is
**v0.6, run four times**, and P4's retro is what made it so. Corrected minimally (the version, the
count, and a one-paragraph summary of v0.6's three changes); **rewriting P4's own summary is not this
item's**. The assertion counts in all three front-door documents were also stale at 326 and are now
361.

### The provocations — 22 run, 1 survivor

`doc/workflow.md` section 5 rule 3, in rule 8's v0.6 form: **written to the RULES' clauses, not to
the fix.** The set the item declared is the set that was run. Each edit is one string replacement,
recorded precisely enough to re-run, and the harness **asserts the edit matched exactly once** before
running (rule 7 (b): a probe that matches nothing passes for the wrong reason — which this harness
then demonstrated on itself; see *What broke*).

**A. the four links of the chain, independently** — `spec/join-policy.md` section 4's `unsatisfiable`
row, and [ADR 0015](../decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md).

| | edit, in `src/driver/driver.ts` unless stated | failed |
|---|---|---|
| A1 | delete the `this.opts.onUnsatisfiableJoin?.({...})` call | 5 |
| A2 | `describe,` -> `describe: null,` in that call | 3 |
| A3 | delete the `append({kind:'joinSettled', ..., fired: false})` | 5 |
| A4 | that append's `fired: false` -> `fired: true` | 6 |
| A5 | route out of the join's edge before the `return` in the `unsatisfiable` branch | 10 |
| A6 | `src/fold/run-state.ts`: `joined: input.fired` -> `joined: input.fired ? true : null` | 4 |
| A7 | `src/fold/run-state.ts`: `r.joined !== true` -> `r.joined === null` in `withOutcome` | 4 |

**B. every one of the six region events reaches the policy** — section 4's `step` row, *"**Every**
region event is forwarded, all six"*, and `JP-R4`. Each edit adds `&& e.type !== 'branch.<x>'` to
`emit`'s policy-step guard.

| `opened` | `arrived` | `exited` | `lost` | `suspended` | `resumed` |
|---|---|---|---|---|---|
| 45 | 53 | 33 | 12 | **1** | **1** |

**C. `joined: null` is not `joined: false`, in both directions.** A6 is one way; **C2** is the other —
the fold's region default `joined: null` -> `joined: false` — **3 failed**.

**D. the three rows on `JP-R7`'s list, one at a time**, each edit changing the *row* so it leaves the
list: **D1** `routed-away`'s predicate to `() => false` so branch 1 arrives — **10**; **D2**
`optional-null`'s `scoreA` settles `done` — **9**; **D3** `all-exit`'s `reviewB` resolves `done` —
**20**. D1 and D2 both trip the list assertion. **D3 does not, and that is correct**: the row still
has an exit, no loss and no live branch, so it stays on `JP-R7`'s list — what it leaves is `JP-R8`'s,
and *that* list assertion is one of the twenty.

**E. a different row joins the list.** **E1** the variant also decrements on `branch.lost` — **9**;
**E2** `JP-R8`'s variant always answers `satisfied` — **16**.

**F. the fourth column is not a copy of the second.** **F1** `COLUMNS` lists `liveToken` twice —
**26**.

**G. two more, added because the declared set could not answer the Outputs table.** **G2** the driver
treats `unsatisfiable` as `waiting` — **11**. **G1** — *and this is the one that survived* — below.


### The conformity pass — 4 defects, 9 observations

**The spec half came back clean, and that is the load-bearing result.** The reader derived all 18 new
cells, both changed-row lists, the 22 join-fires and the 10-cell `stuck` list from
`spec/join-policy.md` section 3 *before* opening `matrix.test.ts`, and **agreed on every one**. It
also re-derived the `unsatisfiable` narrowing and judged it necessary rather than a weakening
(net information is strictly greater: the narrowed claim can still fail, and a new assertion pins the
one cell that says `unsatisfiable` to a literal). All four `POLICIES` pins are green; the register's
census counts correctly; Q91-Q95 were each verified from the code rather than from this Record.

**All four defects are CLAIMS, not cell values** — three in this Record and one in a test message.
That split is worth carrying: the artifact was right and the prose about it was not, three times.

| | finding | acted on |
|---|---|---|
| **1** | `chain.test.ts`'s `link 4` message said *"`joined` is the only field a policy's behaviour reaches"* — **the unqualified form ADR 0015's *Correction* explicitly retracted from `RN-R11`**, and false on that very row (under `live-token` the join fires, so `publish` is in `nodes` and `pathEnds` differs). **A fourth occurrence of a failure mode this repository has now named three times**, in the file written to connect ADR 0015's links | **fixed** — the message carries the qualifier *decidable without the definition* and names the two fields that also differ, with `RN-R4` as the reason |
| **2** | **`test/matrix/render.ts`'s column list was asserted by nothing, and this Record cited a probe that could not measure it.** The renderer built its own `columns` array; `matrix.test.ts` built a separate `COLUMNS`; **nothing imports `render.ts` and it is not a `*.test.ts`**, so duplicating a policy there left `npm run gate` fully green while **P5's exit artifact printed wrong**. Provocation F1 mutates the *test's* list and was cited in the Outputs table as protecting the render. **This is W5's *"the L6 gate did not depend on the mechanism W5 exists to build"*, one level down — and the item's own comment named the hazard while fixing it only inside the test file** | **fixed** — one list. `MATRIX_COLUMNS` in `variants.ts` is imported by both; there is no second place to disagree. Provoked below |
| **3** | Outputs table said `chain.test.ts` carries **ten** assertions; the runner's unit is the `test()` block and it carries **twelve** (8 + 2 + 2). The 82/4-file, 361 and +35 figures were all correct | **fixed** |
| **4** | *"The refinements were previously executed on four cells of a possible thirty-six"* is **wrong**: `divergingRows` already *executed* `arrivalCountDecrementing` over all nine rows. What was missing is **assertion** — three individual cells plus one aggregate list | **fixed**, and the corrected sentence says which three |

**Two observations kept rather than acted on**, both self-labelled in the code already: `link 2a`'s
second `ok` states in its own message that link 3 is what covers the case it cannot; and the
verdict/fold agreement test drives the scenario twice rather than reading one run, which is sound
only because `JP-R1` determinism is separately asserted in the same directory. The reader also found
`variants.ts`'s *"every line below is W4's, character for character"* off by the two `export`
keywords the move needs — corrected in place.

**Rule 8 on defect 2's fix — three provocations, written to the RULE** (four columns, four
**distinct** policies, in a **fixed** order) rather than to the fix. Each edits `MATRIX_COLUMNS` in
`test/matrix/variants.ts`, and each is measured against **both** the suite and the exit artifact,
because the whole defect was that the second was unmeasured:

| | edit | suite | `node test/matrix/render.ts` |
|---|---|---|---|
| **H1** | the fourth entry becomes `liveToken` — a copy of the second | **26 failed** | **crashes** (`renderTable` finds no cell for the missing id) |
| **H2** | entries 3 and 4 swapped | **1 failed** — the id-agreement assertion, which is the only thing that can see it | prints 4 columns, in the wrong order |
| **H3** | the fourth entry deleted | **26 failed** | **crashes** |

Before the fix, the corresponding edit to `render.ts`'s private list failed **nothing** and printed a
wrong table. **H2 is the one that matters**: it is the narrow mutation — order, not count — and one
assertion catches it, which is what a shared list buys that a duplicated one cannot.


### The adequacy pass — 89 mutations, 26 survivors, 5 blocking, all five families closed

**Whole families were caught, and saying so is a real result**: the fold's precedence (`RN-R10`,
`RN-R12`) **8 of 8**; the fourth column being a genuine third and fourth policy **4 of 4**; the
variants' behavioural *arithmetic* — which event decrements, off-by-one `need`, the `arrived` counter
— **6 of 6**, 9 to 21 assertions each, so the exact-list assertions do the job they were built for;
the driver seam's section 4 obligations **13 of 13**. The exact-list trio was probed for redundancy
and none of the three is: the literal catches what the predicate cannot (D1/D2) and the predicate
catches what the literal cannot (E1).

**The verdict, in the reader's words and it is the one to carry: *the two artifacts W15 created are
the least-tested things in the item, and both are what W16 will decide ADR 0025 from.*** Seven of
twenty-six survivors were in the renderer and five in the variants.

| # | blocking family | what survived | closed by |
|---|---|---|---|
| **1** | **The rendered table — Output (1) and P5's exit artifact — was checked by almost nothing.** `test/matrix/render.ts` **is executed by no script in `package.json`**, not by `test` and not by `gate`. **Seven survivors**, including one that printed a **two-column table** with all 361 assertions and `deno lint` green | `renderTable`'s column order reversed; all four cells collapsed into one; the separator row broken; the event stream dropped; the title dropped; the id list sliced to two | **`test/matrix/table.ts`** — the render is now a function the suite imports and asserts, and `render.ts` is a two-line shim with no list, no slice and no logic. The table's shape is asserted **field by field after splitting the row**, not by `includes` over the whole line, which is what let the reader transpose the columns against their own asserted header |
| **2** | **`fold()` ran on 2 of 36 cells, both on one row, and never on either new column.** The driver could stop appending region events to `foldInputs()` **for one policy id** and all 361 assertions passed — `Cell.events` comes from `onRegionEvent`, a *different channel*, and nothing compared them. `RN-R6` was asserted across four columns only on the raw event strings | `if (policy?.id !== 'arrival-count-decrementing') this.append({kind:'region', event})` — **0 failures** | a new suite in `chain.test.ts`: **all nine rows × all four columns folded**, asserting `RN-R6`'s `opened`/`settled`/`suspended` identical and `joined` differing — `all-exit` carries all three values of `joined` (`null`, `true`, `false`) from four policies over one event stream. **It lives beside the matrix rather than inside `Cell`**, so [Q92](../questions/q92.md) stays open and W4's driver-surface-only `Cell` is intact |
| **3** | **The harness W15 owns could substitute the source of truth the chain reads.** `link 1a` exists to prove *whose* account the report is and read the **same channel** as `link 1`; a driver-invented summary that happened to match failed 3 assertions, **all pre-existing stubs and none of them the chain's** | the harness fabricating `describe`; `joinFired` re-sourced from the driver instead of the scheduler | `link 1a` now **recomputes the policy's state by stepping the policy over `driver.foldInputs()`** — a different channel at both ends — and cross-checks `joinStatusOf`, a third channel the harness never touches. Plus a whole-matrix assertion that `dispatchedIds()`, `scheduler.added` and `foldInputs()`' dispatches **all three agree, on every one of the 36 cells** |
| **4** | **The two variants became columns and ADR 0025's evidence without inheriting one clause-level test.** `test/fold/policies.test.ts` holds the shipped pair to `JP-R1` purity, non-mutation, `JP-R3` totality, `JP-R2` `JsonValue` and *"describe does not hand out the policy's own array"*. **None of it came with them** | `step` mutating `S` in place; `describe` handing out its own array; the distinct-arrival guard deleted; `positive` set unconditionally — **four survivors, every one with a named test for `arrival-count` or `live-token`** | a new suite in `variants.test.ts` holding both variants to the same clauses. **`test/fold/policies.test.ts` is W2's file**, so the loop is written against the two policies this directory owns rather than by widening W2's — and if ADR 0025 ships either, W16 moves it into that loop and deletes the suite |
| **5** | Non-blocking, and mostly **not W15's**: `emit` returning early once a join has settled (**0 failures** — the same shape as [Q95](../questions/q95.md), one level out); `settleJoin` asked one event *early*; `seam-paths.test.ts:212`'s *"a throwing describe does not latch the region"* passing under both orders; `Verdict`'s `in-flight` and `run.ts`'s `'<no report>'` fallback both **dead**; the fake scheduler's `optional` refusal never provoked | | **recorded, not fixed** — they are W3's and W4's files. The `emit`-after-settle one is folded into [Q95](../questions/q95.md)'s row, which already names the class |

**Re-run of the reader's survivor list against the repaired tree: 14 of 16 caught**, and the two that
still survive are **equivalence, not holes**. `joinFired` re-sourced from `dispatchedIds()` and
`link 3`'s scheduler read duplicated are both no-ops *given* the new agreement assertion — so the
real defects they were proxies for were probed directly: a dispatch **recorded but never sent** fails
**38**, and a dispatch **sent but never recorded** fails **3**. That is the honest form of the answer;
reporting them as "fixed" would be the claim, not the evidence.

**Rule 8 on the repairs**, written to the rules' clauses. The renderer: R2-R7 re-run, **all six now
caught**, and each is measured against *both* the suite and `node test/matrix/render.ts`. The fold
cross-check: the same `policy?.id` filter keyed on **each** of the two new columns — the third fails 1
(the `RN-R6` suite, precisely), the fourth fails 4. The variants' clauses: M3, M8, W3, W4 re-run,
**each caught by exactly the one new assertion written for it**, which is what rule 7 (c)'s set-equality
form would ask for if it applied to fixes.

### What broke

**1. The one survivor: `firedJoins` on the `unsatisfiable` path is dead, and nothing can reach it.**
Deleting `this.firedJoins.add(region.fanoutId)` from `settleJoin`'s `unsatisfiable` branch fails
**zero of 361 assertions**. It is unreachable rather than untested, and by construction: the only
policy here that can say `unsatisfiable` says it at `live === 0`, which **is** the last terminal
event, so nothing follows to re-enter `settleJoin`. A policy that reported a join dead *early* — what
[Q7](../questions/q7.md) wants and what [Q37](../questions/q37.md) would need — makes the latch
load-bearing on its first run. **[Q95](../questions/q95.md)**, and it is `src/driver/**`, which no
P5 item owns. **This is the P2 shape again** — the join had never once been fired from the `lost` or
`exited` path across twelve rows — and it was found the same way: by breaking the code rather than by
reading it.

**2. `branch.suspended` and `branch.resumed` reach no policy in this repository, so L5 cannot see the
driver dropping them.** B5 and B6 fail **one** assertion each, and it is in `test/driver/`, not in
`test/matrix/**`; the other four events fail between 9 and 53. **The cause is a missing policy, not a
missing test**: `arrival-count` ignores both by definition, `live-token` counts neither, and both of
Q24's variants inherit that — so `JP-R4`'s *"the vocabulary is sized for the richer policy"* is true
of a policy that does not exist. **[Q93](../questions/q93.md)**.

**3. `JP-R7`'s variant fires a join with zero arrivals, which is the exact defect `JP-R8` removes.**
Visible in the fourth column the moment it rendered: on `all-exit`, `arrival-count-decrementing`
reaches `need: 0` with `arrived: []`, so `0 >= 0` is satisfied and the join fires **having been
reached by nothing**. That is what [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
records as `live-token`'s cost. **The two refinements point in opposite directions** — `JP-R8`
removes the zero-arrival join, `JP-R7` adds a second road to it — which the counts *three* and *one*
did not show. **[Q91](../questions/q91.md)**, and it is evidence W16 is entitled to and did not
have.

**4. The provocation harness's first run left an edit in the tree.** It reverted with
`git checkout -- <path>`, and `test/matrix/variants.ts` is a **new** file, so the revert failed and
`E1`'s edit stayed. Caught by the harness's own `check=True` rather than by a green suite, and fixed
by restoring from the bytes read before the edit. Worth recording because rule 8 asks for
provocations *precise enough to re-run* and this is a way a re-run silently poisons the next one.

**5. The exit artifact was the one thing the gate did not cover, and the item's own comment said so
while not doing it.** `render.ts` kept a private column list; `matrix.test.ts` kept another; the
comment on `MATRIX_POLICY_IDS` warned that *"two lists that must line up and are never compared is how
a column silently becomes a duplicate of its neighbour"* — and there were two lists. **Found by the
conformity reader, not by twenty-two provocations**, because every one of them mutated something the
suite reads. *For P5's retro: this is the third item in a row where a reader found the author's
provocation set aimed at the code and blind to the deliverable, which is the shape P4's retro
predicted would change and did not.*

**6. Both artifacts W15 created were the two least-guarded things in it, and the author's twenty-two
provocations could not have found either.** Every one of them mutated something the suite reads; the
renderer is not read by the suite at all, and the variants' clause-level rules had no assertions to
break. **The two readers found 5 blocking families between them and the overlap was 1** — the
renderer's unasserted column list, which the conformity reader reached from *"this Record cites a
probe that cannot measure the thing it claims"* and the adequacy reader from *"here are seven
mutations that survive"*. One shared finding, from two directions, which is
`doc/workflow.md` section 6's number holding at the bottom of its 1-4 range.

**7. Nothing else broke.** `src/**` and `spec/**` were not edited; the four assertions pinning
`POLICIES` to exactly two are all still green, including `variants.test.ts`'s *"neither has an entry
in `POLICIES`"*, which is W16's to falsify and only if ADR 0025 says so.

### What this taught

1. **The declared provocation set could not answer its own Outputs table.** Written to the rules'
   clauses as v0.6 asks, it produced twenty red probes and told me nothing about *what the chain test
   adds that the three stub tests did not* — because A1-A7 each trip a pre-existing stub as well.
   G1 and G2 were added to answer that, and **G1 is where the survivor was.** The v0.6 amendment is
   right and it is not sufficient: writing to the rule finds holes in the code, and the `Outputs`
   table asks a question about the **tests**, which needs its own probes. *For P5's retro, against
   P4's prediction 1: the author's set was not narrow in the old direction — it was complete on the
   rules and blind to the deliverable.*
2. **A count is not a list, and the third check is the predicate.** The exact lists are asserted three
   ways — the declared literal, a predicate over the row's own event stream, and what the columns did
   — and D1/D2 show why the literal is load-bearing: change a row and the *predicted* and *measured*
   lists move together, so only the literal notices. Equally, E1 shows why the predicate is: it keeps
   the count at three while swapping which three.
3. **Two computations of `stuck` had never met.** `Cell.verdict` reads the driver's public surface and
   never calls `fold()`; `RunState.outcome` reads the fold and never sees the driver. The matrix has
   printed `stuck` in a column since P1 with the fold uninvolved. They agree on `all-exit` and that is
   now asserted; whether every cell should carry both is **[Q92](../questions/q92.md)**.
4. **`doc/workflow.md` rule 7 (c) goes unexercised for the third plan running.** Said here rather than
   left to the retro, as the item's `Out` list required: **this item adds no check script**, so a
   probe declaring the *set* of checks it trips still has no outing beyond `check-docs`' twelve.
   W16 or W17 would have to add one.
5. **The register was verified before it was built on, and this time it was right.** P5's measurement
   table matched on every row — the seam works end to end, `JP-R7` changes three and `JP-R8` one, and
   the corrected Q24 row is accurate. Four plans running have each found a register row wrong by
   trying to act on it; this is the first that did not, and the difference is that **P5 measured
   before declaring** rather than after.

### Questions raised

| Q | | Owner |
|---|---|---|
| [Q91](../questions/q91.md) | `JP-R7`'s variant fires a join with **zero arrivals** — the exact cost `JP-R8` removes, reached by the other road. The two refinements point in opposite directions | **W16** — evidence for ADR 0025 |
| [Q92](../questions/q92.md) | `Cell.verdict` and `RunState.outcome` are two independent computations of `stuck`. **Narrowed by acting on the adequacy reader**: `RN-R6` is now folded across all nine rows × four columns and the three dispatch channels agree on all 36 cells, so what remains open is only the original question — should a `Cell` itself carry `RunState.outcome`? | no owner |
| [Q93](../questions/q93.md) | Two of the six region events reach no policy here, so L5 cannot see the driver dropping them. A missing policy, not a missing test | no owner |
| [Q94](../questions/q94.md) | ADR 0003 carries a hand-copied **two**-column matrix and `render.ts` now emits four. Divergence arriving because the artifact was extended | **W16** |
| [Q95](../questions/q95.md) | The `at most once` latch on the driver's `unsatisfiable` path is **unreachable**, and deleting it fails nothing. The author sweep's only survivor — **and the adequacy reader generalised it**: nothing here exercises a region *at all* after its join has settled, because on every row under every policy the join settles on the last region event | no owner |

**On the id block.** The declaration reserved **Q91-Q94** and five were needed; **Q95** is taken from
[P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)'s own **Q91-Q100** reserve,
which is free — W16 and W17 have not started and `doc/workflow.md` section 3's hazard is two
*concurrent* items taking the same next number. Recorded rather than done quietly, because the rule
it bends is one the register exists to enforce.
