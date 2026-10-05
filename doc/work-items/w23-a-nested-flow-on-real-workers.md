# W23 — A nested flow on real workers

**Status:** DONE - 2026-09-03. Both readers ran; all sixteen findings acted on
**Plan:** [P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md) — the fourth and last of its
items, and **the plan's exit artifact**: *a nested fan-out running end to end on a real scheduler,
with the outer join firing over branches it never directly opened.*
[W20](w20-what-a-nested-region-is.md) defined the shape, [W21](w21-the-branch-path-is-a-path.md) made
the ids right, [W22](w22-what-an-inner-join-does-to-the-outer-one.md) decided the join
([ADR 0030](../decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)).
**This item takes no decision.** It demonstrates one, and demonstrations here have twice corrected
the decision they demonstrate.

```
Spec:       none written here. Every expected value comes from documents this
            item does not touch: `spec/task-id.md` section 1 for the dotted ids,
            `spec/join-policy.md` sections 2-4 and `JP-R10` for the events,
            `spec/run-state.md` section 3 for the outcome, and ADR 0030 rules
            1-5 for what the two joins do. **If a value cannot be derived from
            those before the run, that is the finding** (doc/workflow.md
            section 5 rule 1).
Owns:       examples/**                   (from W19) — l6.ts, run-flow.ts,
                                          flows/**, workers/flow-worker.ts,
                                          README.md. **Taken as the whole block
                                          P7's index row gives it**, which is
                                          W21's finding: an item's `Owns` is
                                          written from its plan row, never from
                                          its title.
Inputs:     W21's derived `branchPath` and the widened `buildTaskId`
            (`number | readonly number[] | null`), plus `branchIndices`, which
            is its inverse and is already exported from the package root.
            W22's `JP-R10` and the four depth-2 matrix rows — this item's row
            is the L6 counterpart of `nested-inner-all-exit`, and its expected
            values are DERIVED from the spec rather than copied from L5.
            The existing L6 harness: 19 row labels, 21 real runs, 373
            assertions, in Node and Deno.
Outputs:    (1) **a nested flow on real workers**, both runtimes, with the
                outer join firing over branches it never opened — P7's exit
                artifact;
            (2) **[Q117](../questions/q117.md) fixed**: the harness's inbound
                `resolve()` step mints a silently wrong id on a nested flow;
            (3) **the L6 harness reports every region of a run, not one** —
                today it hard-codes the literal `'split'`;
            (4) **the first dotted task id L6 has ever asserted**;
            (5) a ruling, with evidence, on whether [Q90](../questions/q90.md)
                and [Q107](../questions/q107.md) are taken here;
            (6) `examples/README.md` describing the new row.
Depends on: W22, and hard: without `JP-R10` a nested run whose inner join dies
            leaves an outer branch with no terminal event, and the row that
            demonstrates the exit artifact could not be written.
Blocks:     nothing. It is P7's last item.
Tests:      L6 is the deliverable, and the harness IS the test. Expected values
            derived before running:
              - the dotted ids `r*:scoreC:1.0:0` and `r*:scoreD:1.1:0`, from
                `spec/task-id.md` section 1 and W21's `branchPathOf`;
              - both regions' `opened`/`settled`/`joined`, from
                `spec/join-policy.md` section 2 and ADR 0030 rules 1-2;
              - the run outcome from `spec/run-state.md` section 3;
              - **and the depth-1 rows unchanged**, which is the clause a
                harness widening can quietly break — 19 labels, 21 runs, 373
                assertions before, and every one of them still asserting the
                same thing after.
Gate:       **L0-L6, and L6 in BOTH runtimes** — this is the one item of P7
                whose gate includes L6, and `npm run gate` ends with
                `test:l6 && test:l6:deno`. Then the two readers of
                `doc/workflow.md` section 6, the adequacy one in an isolated
                copy.
Reserves:   Q126-Q130, ADR — none. P7's block is exhausted and this item takes
            no decision; if one turns out to be needed it takes 0032 on
            ADR 0029's precedent and says so. (0026 stays held for
            [Q97](../questions/q97.md); 0028 and 0031 are skipped.)
```

**Q ids start at Q126.** P7 reserved Q112-Q120 and all nine are spent; W22 took Q121-Q124 outside that
block on [ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
precedent and **skipped Q125**. Skipped ids are never reissued (`doc/workflow.md` section 3).

## The load-bearing fact, measured before this was declared

*`doc/workflow.md`: ten consecutive plans measured before declaring, and W22 was the first to falsify
its plan's **decision**. This item's measurements do not touch the decision; **two of the five change
what it has to build**, and one of them corrects a register row for the second time.*

| | measured |
|---|---|
| **[Q117](../questions/q117.md) is real, and its description has been wrong twice** | `examples/run-flow.ts:619`: `buildTaskId(runId, at, Number(branchPath), 0)`. **W21's declaration said this yields `NaN`; it does not** — `Number('1.0')` is **1**, so at depth 2 it mints `r*:node:1:0`, a **well-formed id for a different task**, and `resolve()` refuses it as not-suspended (`RS-R1`) — a *reported* failure that names the wrong cause. At depth 3 `Number('1.1.0')` **is** `NaN`, and since W21's `INDEX` test `buildTaskId` **throws** — from a call site **outside** the surrounding `try`, inside a `queueMicrotask`, so it surfaces as an **unhandled rejection** rather than as a harness failure. The fix is `branchIndices(branchPath)`, already the exact inverse of the widened `buildTaskId` and already exported from the package root; the call also moves **inside** the `try` |
| **The L6 harness assumes ONE region per run, and the assumption is a string literal in 18 places** | `report.state.regions['split']` — `examples/l6.ts`, eighteen occurrences across the per-row checks and the cross-row blocks. **Every existing L6 flow names its fanout `split`**, so nothing has ever distinguished *"the region"* from *"the region called split"*. `Expectation`'s `regionId`, `joined`, `settled`, `regionSuspended` and `branchEvents` are all singular with it. **This is W22's `Cell` finding one rung up**, and it is the bulk of this item's work |
| **L6 has never asserted a dotted task id** | Zero matches for `r<n>:<node>:<i>.<j>:` anywhere in `examples/l6.ts`. The grammar has reserved the shape since P1, W21 made the driver mint it, and **no rung above L2 has ever seen one**. A nested row's `dispatched` list is the first |
| **`branchIndices` needs no new export** | `index.ts` is twelve `export *` lines and `src/driver/ids.ts` is one of them, so the Q117 fix adds nothing to the public surface — which is what makes it a harness fix rather than a library change |
| **The exit artifact needs no new worker** | `examples/workers/flow-worker.ts` is one class with three roles selected by the pool's `config`, and a `delayMs` that is how W6 **arranges** causal order rather than hoping for it. A nested flow needs more `ScoreWorker`s, not a new role — and the arrangement machinery is what will make the inner join settle before the outer one deterministically |

## Scope

**In**

1. **[Q117](../questions/q117.md)**, fixed and asserted — the resolve step mints the id the driver
   minted.
2. **The harness reports every region**, so a row can declare two.
3. **A nested flow in `examples/flows/`**, and the row that runs it — P7's exit artifact.
4. **The depth-1 rows unchanged**, asserted rather than assumed.
5. **A ruling on [Q90](../questions/q90.md) and [Q107](../questions/q107.md)** — P7 names both as
   candidates for this item, and a candidate declined needs a reason.
6. **`examples/README.md`**.

**Out** — named rather than left implicit, with where it goes instead

- **Any decision.** ADR 0030 is W22's and this item demonstrates it. **If the demonstration falsifies
  it, the decision is corrected in place** — `doc/workflow.md` v0.7 change 3 exists for exactly that,
  and [W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is the occurrence that earned it.
- **[Q108](../questions/q108.md)** — ADR 0027's `context.spawnTask()` producer. It needs a worker that
  spawns, which runs into [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
  rule 2 and needs its framing decided first. **Not this item's**, on P7's own reading.
- **Depth 3 at L6.** The matrix and the driver seam run at depth 2 and ADR 0030's cascade is asserted
  at depth 3 in `test/driver/**`. A third level on real workers is a fourth region, more roles and a
  longer arrangement, and it would be the only depth-3 claim in the repository that costs a minute of
  wall clock. [Q113](../questions/q113.md)'s untested `fromRegion` site and
  [Q124](../questions/q124.md)'s rename map both want a depth-3 row; **both want it at L2**, which is
  cheaper and is where their subjects live.
- **[Q121](../questions/q121.md)-[Q124](../questions/q124.md)**, W22's four. None is `examples/**`'s.

## Verification

| Clause | Command |
|---|---|
| L0 | `npm run check:spec`, `check:source` (**`S7` refuses a published file importing the scheduler; `examples/**` is not published and this item must not change that**), `check:scheduler`, `check:policies`, `check:docs`; `npm run lint`, `npm run typecheck` — **five projects, and `tsconfig.examples.json` is the one this item moves** |
| L1-L5 | `npm run test`, `test:deno`, `test:browser` — **chromium only** by default; firefox and webkit need `test:browser:all`, which the gate does not run, so any claim about five runtimes names the command. **This item should not move these numbers at all**, and if it does that is a finding |
| **L6** | `npm run test:l6` **and** `npm run test:l6:deno`. **This is the item's own coverage and P7's exit artifact.** Report the row count, the run count and the assertion count, and derive all three rather than typing them — a pair row is one label producing two runs |
| readers | conformity: spec first, re-deriving the nested row's ids, both regions' events and the outcome before opening the row. adequacy: **in an isolated copy**, links measured first, green in the copy before it starts, scanned again before removal |

**Rule 8 — all THREE v0.8 obligations, and a fourth thing W22 learned.** The rule's clauses; the
`Outputs` rows; the **provenance** of every value an assertion reads — and **the LOOP BOUNDS**, which
is where both of W22's adequacy-reader blocking findings lived and which none of its 28 author probes
could reach. A row that can be deleted for nothing, a region that can be dropped from an iteration, a
run that can vanish from a count: **break the size of every set this item iterates**, not only the
values in it. `examples/**` is where the provenance obligation has already produced five blocking
findings across W14, W17 and W19, so both axes are live here.

*Per the template:* a branch routed away from its join (Q4) — **applicable and the point**, the exit
artifact's inner branches route away; `user_action` (Q17) — **applicable**, and it is where Q117
lives, so a nested row that suspends is what makes that fix falsifiable; no matching decision edge
(Q10) — not applicable; a duplicate task id (Q13) — **applicable**, `ID-R1` is what would catch a
nested run minting two branches at the same id, which is what a truncated path causes; a nested
fan-out (Q6) — **this item is the real-workers half of it, and the plan's exit artifact**.

## Record

**Both readers ran. Conformity: 13 findings, 5 BLOCKING. Adequacy: 21 mutations, 3 BLOCKING. All
sixteen acted on, and the set was re-run after — 26 probes, 5 survivors, 0 void, every survivor
classified by a second route.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, green** | `check-spec` 8, `check-source` 11 / 13 published files, `check-scheduler` 5 + 12/12, `check-policies` 3 + 13/13, `check-docs` 5 + 14/14, `deno lint` 43 files, `typecheck` 5 projects — `tsconfig.examples.json` is the one this item moves |
| L1-L5 | **RAN, green, and UNMOVED at 474** in all five runtimes — node 24.20.0, deno 2.9.6, chromium, firefox, webkit. **`npm run test:browser:all` is what produced the last two**; the gate runs three. Unmoved is the declared result: this item touches `examples/**` and one field on a harness type, and if these had moved that would have been the finding |
| **L6** | **RAN — this item's own coverage and P7's exit artifact.** **489 assertions, 23 row labels, 25 real runs**, in **both** runtimes. From 373 / 19 / 21. **All three counts derived** — `EXPECTED.length + PAIR_ROWS.length` labels, `+ 2 × PAIR_ROWS.length` runs — because typing them is this file's own recorded failure mode and it recurred inside this item |
| conformity reader | **RAN — 13 findings, 5 BLOCKING; all acted on** | It re-derived **every dispatched id including the dotted ones, both regions of all four rows, every branch's event sequence, the `pathEnds` and the outcomes** from `spec/` before opening the rows, and reported **zero disagreements on the values**. All five blocking findings are about what surrounds them |
| adequacy reader | **RAN** in an isolated copy — **21 mutations, 3 BLOCKING**; all acted on | Zero symlinks and zero reparse points before the copy; green at 474 / 477 in the copy before it started; restored and left in place |
| re-run after the findings | **RAN, green** | `npm run gate` **exit 0**, read directly. Whole set re-run: **26 probes, 5 survivors, 0 void** |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1)** a nested flow on real workers, both runtimes | yes — **four** rows on two flows | Routing the inner join elsewhere: **THREW**. Deleting a row: **3**. **Deleting all four and editing the total: 0 until this item's last day** — the reader's finding, now **2** |
| **(2)** [Q117](../questions/q117.md) fixed | yes — `branchIndices`, and the call moved inside the `try` | Reverting it: **4** — and **0** until the fourth row existed. Rule 8's founding case in this item's own output |
| **(3)** the harness reports every region | yes — `otherRegions`, and 3 of the 18 `'split'` literals were the ones that mattered | Reading `'split'` again: **12**. Ignoring `otherRegions`: **6**. A region leaving a row: **2** |
| **(4)** the first dotted ids above L2 | yes — **9 of them**, across four rows | Declaring one without its inner segment: **1**. Truncating the path in the driver: **36** |
| **(5)** a ruling on [Q90](../questions/q90.md) and [Q107](../questions/q107.md) | yes — **Q107 taken** (one boolean), **Q90 declined with a measurement that corrects P7's stated cost** | Reverting `ForeignTask.optional`: **2** |
| **(6)** `examples/README.md` | yes — **and it carried three false claims, two written by this item** | **Nothing.** No check reads it, which is the class six retros have refused to mechanise |

**`Owns` audit**, by hand, after the record step.

| | |
|---|---|
| **`Owns`** | `examples/l6.ts`, `examples/run-flow.ts`, `examples/flows/**` (two new), `examples/README.md` — **all inside `examples/**`**, the whole block P7's index row gives it |
| **Exceptions** | **none.** The first item of P7 to take none |
| **Record step** | this file, `doc/plans/p7-*.md`'s Record, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` |

## Rule 8 — the set, re-run after acting

**26 probes, 5 survivors, 0 void.** Four axes: the rule's clauses, the `Outputs` rows, **provenance**,
and **loop bounds** — the fourth is W22's finding and it is not yet a rule in `doc/workflow.md`.

| | probe | cost |
|---|---|---|
| A1, A3, A4, A5 | Q117 reverted / `JP-R10` deleted / W21's truncation restored / Q107 reverted | **4 / 5 / 36 / 2** |
| B1-B4 | the `Outputs` rows | **12 / 6 / 1 / THREW** |
| C1, C3 | the resolved id from the first fanout again; settlement order vs declaration order again | **1 / 1** |
| D1-D5 | **a row / a region / a foreign task / the cost model / a branch leaves** | **3 / 2 / 2 / 21 / 1** |
| R1, R1b, R3, R5, R6, R7 | the readers' own edits, **every one of which cost 0 when they ran it** | **2 / 2 / 5 / 3 / 1 / 1** |
| A2 | the mint moved back outside the `try` | **SURVIVED — VACUOUS given the fix.** The placement matters only when `buildTaskId` throws, which needs a path `branchIndices` rejects. Its composite went **VOID** under A1, which is rule 7 (b) refusing a probe whose anchor the composite removed |
| C2 | the resolved expected side sourced from the recording | **SURVIVED — REDUNDANT.** A genuine source swap, but A1 still costs 4 with it applied |
| C4 | the region-set check made self-comparing | **SURVIVED — REAL, worth exactly 1.** D2 costs 2 alone, 1 with C4 |
| R2 | the resolve step's `at` sourced from the row | **SURVIVED — VACUOUS alone**, because both sources agree while the driver is right. **Its masking is what mattered**: the reader measured R3 at **0** with it applied; it is now **2** |
| R4 | `test:l6:deno` dropped from the gate chain | **SURVIVED — REAL**, and it is `scripts/check-source.mjs`'s, outside `Owns`. [Q126](../questions/q126.md) |

## What broke

**1. The rendered table — the one artifact L7 exists for — printed P7's exit artifact as a
region-free run.** The per-row *assertions* were moved off the hard-coded `'split'`; the renderer was
not, so all four nested rows showed `-` for join and branches, which is that renderer's spelling for
*"entered no region"*. **[Q100](../questions/q100.md)'s open question — whether a formatting bug can
make the table say something FALSE rather than merely ugly — is answered `yes`, by the item that
introduced it.** And the first fix hard-coded a width and **truncated `inner 1.0:exited 1.1:e`**,
which is the same file's own recorded `KEY_W` defect, in the same file, on the same day. Both widths
are derived now. **Then it was still asserted by nothing**: pointing the renderer back at `'split'`
cost 0 until an assertion read the helper — Q100 in a fifth file.

**2. Every nested row was asserting a fan-out completion order, and the depth-1 rows had been
protected by an accident.** `check` compares `JSON.stringify`, and the fold writes `settled` in
terminal-event order. `'0'`/`'1'` are canonical array indices, which V8 emits in ascending numeric
order however they were inserted — so no depth-1 row has ever depended on completion order.
**`'1.0'`/`'1.1'` are not array indices.** Three of the four rows run `scoreC` and `scoreD` as the
same role at the same delay in the same pool — the configuration `joinSettledBy`'s own comment calls
*"genuinely non-deterministic"*. Fixed by comparing sorted, not by picking an order.

**3. The suspend row's stated reason for its declared order was false, and it made an inert knob
load-bearing.** It claimed the causal chain ordered the two branches; the chain constrains `reviewC`
and says nothing about `scoreD`. What ordered them was `SETTLES_LAST`'s `delayMs * 4` — **which
[Q99](../questions/q99.md) records W17's adequacy reader measuring as INERT.** This item would have
made it load-bearing for the first time, silently, with the effect attributed to something else.

**4. Two BLOCKING loop bounds, both of which delete an exit artifact for the cost of one number.**
The four nested rows could be removed, `DECLARED_TOTAL` edited, and two now-unused imports dropped —
**green at 388 with lint, typecheck and all five `check:*` passing**, and no dotted id dispatched
anywhere above L2. And `UNMINTED` had no bound at all: entries could be deleted **up to and including
all six**, for 0 failures and an unmoved total, which deletes **P6's** exit artifact and this item's
own Q107 closure. Both are bounded now.

**5. My own fix for the third blocking finding did not work, and only the re-run showed it.** The
adequacy reader found the resolve step's `at` swappable from the driver's event to the row's
declaration for 0 failures. I recorded `suspendedAt` — **from the same local the probe swaps**, so the
new assertion compared a declaration with itself and the probe still cost 0. Reading `input.event.at`
directly is the fix. **Rule 8's founding observation inside rule 8's own procedure, for the third
consecutive plan.**

**6. Six false claims in prose, four of them written by this item.** `examples/README.md` carried two
mutually contradictory assertion counts on one page; its nested-rows entry described **three** rows
when there were four, omitting the one that makes Q117's fix falsifiable; the flow count said six for
seven. `l6.ts`'s own header said *"Twenty-one real runs … nineteen row labels"* throughout — in the
comment whose own text says *"this line read six for two rows longer than it was true"*. And two
comments still said all foreign tasks run one pool, which Q107 falsified in this same item.

## What this taught

**1. A count I reported to a human was wrong because I read it from a document I had written.** I
reported *22 row labels, 24 runs* — taken from `examples/README.md`, which I had written for a
three-row version of this item and not updated when the fourth row landed. The true figures are **23
and 25**, and both are derivable in one expression. This is `doc/workflow.md` section 1 rule 5's
*"a claim about another item's status is read from that item's own file, never from an index"*,
one step further out: **a claim about my own work, read from my own summary of it.** The rule names
indexes; the failure is any copy.

**2. The LOOP BOUNDS axis is now two items old and both times it found BLOCKING survivors an author's
value-probes could not.** W22's reader found a row and a column deletable; W23's found four rows and a
whole foreign-task list deletable. **In W23 the author ran five bounds probes deliberately** — a row,
a region, a foreign task, a branch, the cost model — **and all five were caught, and the reader still
found two more**, because the author bounded the lists a row iterates and not the lists the *file*
iterates. Two occurrences, two items, both blocking. **For P7's retro: this is a fourth obligation for
rule 8, and it has the evidence.**

**3. Taking a small question found a defect the question was not about.** Q107 cost one boolean — and
its sixth foreign task runs a different pool, which broke an assertion that had been comparing
settlement order against declaration order and passing only because all five previous foreign tasks
shared one. **A dependency on an order `spec/` does not fix, invisible for as long as the inputs were
uniform.** The claim was always about the set; it is written as one now.

**4. `examples/**` is where the provenance obligation keeps landing, and this is the sixth, seventh
and eighth instances.** W14, W17 and W19 supplied five; W23 adds the resolve step's `at`, the
expected id built by the code under test, and my own failed fix for the first of those. **All eight
are in this directory**, which v0.8 predicted when it said a harness is where this should be expected
to live first.

## Questions raised

- **[Q126](../questions/q126.md)** — `npm run gate`'s wiring is checked for `check:*` and nothing
  else, so **a whole runtime can be dropped from the chain for 0 failures**. Measured. `S11`'s loop
  needs a named list of `test:*` entries; `scripts/**` is in nobody's `Owns`.
- **[Q127](../questions/q127.md)** — four coverage gaps the depth-2 rows expose and cannot close:
  `opened` is asserted on no nested row; there is no cross-row block for them where every other exit
  artifact has one; `regionSuspended` cannot reach a nested region; and no nested row runs
  `arrival-count`, so ADR 0030 rule 1's claim for that policy has L5 coverage and no L6.

*(Q128-Q130 unused and **skipped, never reissued**. No ADR was needed: this item demonstrates
ADR 0030 and the demonstration did not falsify it.)*

**Reader overlap: 3 of 16.** Both readers found the suspend row's stated ordering mechanism false,
both found the `resolveOnSuspend` node's provenance, and both found stale foreign-task prose — each
from a different direction. **The twelfth measurement, inside the 1-4 band.**
