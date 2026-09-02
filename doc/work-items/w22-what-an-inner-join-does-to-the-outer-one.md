# W22 — What an inner join's verdict does to the outer one

**Status:** DONE - 2026-09-02. Both readers ran; all nineteen findings acted on
**Plan:** [P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md) — the third of its four
items, and the one that takes the plan's question. [W20](w20-what-a-nested-region-is.md) defined the
shape and [W21](w21-the-branch-path-is-a-path.md) made the ids right; **this item decides whether the
join is transitive** and ships [ADR 0030](../decisions/). Real workers are
W23's.

```
Spec:       spec/join-policy.md sections 3, 4 and 5. Section 5's transitivity
            bullet reads "no policy in section 3 has been ruled transitive over
            one, and that is P7's question, owned by W22" — this item IS that
            ruling, so it WRITES the rule and inherits none. Section 4's
            "what the driver owes a policy" table is where the `unsatisfiable`
            exit's obligations live and is where the one behavioural change
            lands. Expected values come from section 2's event vocabulary and
            section 3's three definitions, derived per row BEFORE running
            (doc/workflow.md section 5 rule 1).
Owns:       spec/join-policy.md          (W1)
            spec/README.md               (W1) — check-spec's C8 makes its
                                         version row a consequence of any
                                         spec/** bump (workflow v0.7)
            test/matrix/**               (W4) — scenarios.ts, flows.ts,
                                         matrix.test.ts, variants.ts, run.ts,
                                         table.ts, render.ts, chain.test.ts,
                                         region-shapes.test.ts. Nine files, and
                                         the block is a glob because a depth-2
                                         row touches the scenario list, the
                                         expectation table, the Cell shape and
                                         the render together
            src/driver/driver.ts         (W3) — `settleJoin`'s `unsatisfiable`
                                         exit. **P7's index row put this file in
                                         W22's block and it stays there**, for
                                         the propagation fix rather than for the
                                         refusal that is struck. Taken from the
                                         plan row rather than from the title,
                                         which is W21's finding
            test/driver/surface.test.ts  (W3, via W20/W21) — the L2 seam suite
                                         where every nested driver assertion in
                                         this repository already lives
            AGENTS.md                    — **declared UP FRONT, and it is the
                                         third consecutive item to touch it**;
                                         W20 and W21 both found it LATE. Section
                                         11's "not available" table says the
                                         join over nesting is undecided, and
                                         this item decides it
            doc/decisions/0030-*.md      — a record-step file (workflow v0.7
                                         change 3), named here so the `Owns`
                                         audit is not surprised by it
Inputs:     W20's `innermostRegionOf`, and [Q113](../open-questions.md)'s
            measurement of what it is load-bearing FOR: `branch.exited` and
            `branch.lost` are the only two `regionOf`-sourced events any shipped
            policy acts on, so the transitivity claim rests on that resolver
            being right and the ADR says so rather than inheriting it.
            W21's derived `branchPath`, and specifically `settleJoin`'s exit
            carrying `pathOf(region.fanoutId)` and `regionOf(region.fanoutId)` —
            which is the whole mechanism of transitivity and was built for
            [Q114](../open-questions.md) rather than for this.
            `spec/join-policy.md` section 3's three definitions, byte-unchanged
            by this item, and `test/matrix/variants.ts`' fourth column.
            The nine existing depth-1 rows and their hand-written `EXPECTED`
            table, which is what the depth-2 rows are compared AGAINST.
Outputs:    (1) **ADR 0030** — a join IS transitive over nested fan-out, for all
                three shipped policies and the refused variant, with the
                sixteen-cell correspondence as its evidence; and a ruling on
                what an inner join's `unsatisfiable` does to the outer branch;
            (2) **four depth-2 matrix rows**, run against all four columns, with
                every expected value hand-derived from section 2 and section 3
                before running;
            (3) **a `Cell` that reports every region of its row, not one** —
                today `runCell` reports the row's declared `fanoutId` only, and
                a depth-2 row is about two joins;
            (4) **the `unsatisfiable` exit emits a terminal event for the
                ENCLOSING region**, whichever way the fork below is settled, or
                a stated reason it must not;
            (5) `spec/join-policy.md` section 5's transitivity bullet replaced
                by the ruling, and section 4's owner table updated for (4);
            (6) `AGENTS.md` section 11's nested-fan-out row: the join half moves
                from "undecided" to what ADR 0030 says.
Depends on: W21, and hard: without a derived `branchPath` an inner join's exit
            carries no path and the outer region records its arrival as `-`,
            which is the mechanism this item is measuring.
Blocks:     W23 (a nested flow on real workers).
Tests:      L1, L2 and L5, values derived from the spec before running:
              - `test/matrix/matrix.test.ts` — four new rows in `EXPECTED`,
                each with its full event stream and its four cells written by
                hand from `spec/join-policy.md` sections 2 and 3, and each
                compared to the depth-1 row it corresponds to;
              - the correspondence itself asserted as a claim, not left for a
                reader to spot: for every depth-2 row, each column's
                `{status, describe}` equals the depth-1 row's — NOT the verdict,
                which a region that is not the row's `fanoutId` does not have;
                modulo the branch paths, renamed by an explicit map;
              - `test/driver/surface.test.ts` — the `unsatisfiable` exit's
                enclosing-region event at L2, on a nested flow, in BOTH
                declaration orders (W20's property, one layer out);
              - the depth-1 corpus produces exactly what it produced before,
                which is the clause a `settleJoin` change can quietly break.
Gate:       L0-L5, climbed from L0. This item's own new coverage is L1, L2 and
            **L5**, which is where it lands — the matrix IS the deliverable.
            **L6 is NOT this item's**: a nested flow on real workers is W23's,
            and it is reported as `NOT RUN` rather than as "stayed green",
            which is how W20's first Record contradicted itself. Then ADR 0030,
            then the two readers of `doc/workflow.md` section 6, the adequacy
            one in an isolated copy.
Reserves:   Q121-Q125, ADR 0030
```

**Q ids start at Q121 and that is outside P7's block, deliberately.** P7 reserved Q112-Q120 and **all
nine are spent** — W20 used Q112-Q114 and skipped Q115/Q116, W21 used Q117-Q119 and skipped Q120.
Q121 is taken on [ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
precedent for taking an id outside a plan's block, and skipped ids are **never reissued**
(`doc/workflow.md` section 3). **ADR 0030 is P7's and is this item's**; 0031 was W20's reserve and is
skipped; **0026 stays held for [Q97](../open-questions.md)**.

## The load-bearing fact, measured before this was declared — and it falsifies P7's own decision

*`doc/workflow.md`: ten consecutive plans measured their load-bearing fact before declaring and in
all ten it changed what got written. **This is the eleventh, and it is the first time the fact
falsified the plan's DECISION rather than its table** — W20 corrected P7's work-item row, and this
corrects the paragraph P7 titled "what is settled before fan-out".*

| | measured |
|---|---|
| **`arrival-count` is transitive, and P7's stated mechanism is not a mechanism** | P7: *"`N` is fixed at the outer branch list and an inner branch has no way to be counted."* An inner branch **does not need to be counted by the outer join**. `N` is per-region; an outer region's `branches` is `[scoreA, scoreB]` whatever nests inside it; and when the inner join fires, `settleJoin` enters the outer join carrying `pathOf('inner')` = `'1'` — **which is outer branch 1's arrival**. W21 built that for [Q114](../open-questions.md) and it is the whole of transitivity |
| **Sixteen cells, and every one equals its depth-1 counterpart** | Four depth-2 rows × the four `MATRIX_COLUMNS`, against the checked-in `EXPECTED` at `test/matrix/matrix.test.ts:72`. `nested-all-arrive` ≡ `all-arrive` (all four **joined**); `nested-inner-exit` ≡ `routed-away`; `nested-inner-lost` ≡ `lost-settled`; `nested-inner-all-exit` ≡ `all-exit`. Statuses, `describe`s and verdicts all correspond. **So every depth-2 divergence is the matching depth-1 divergence one level down**, and there is no nesting-specific failure in any of the four |
| **The refusal would forbid a shape the policy handles** | `arrival-count` reports `satisfied` at BOTH depths on `nested-all-arrive` and the run reaches `publish`. A construction refusal would reject that definition while leaving the same policy shipped for `lost-settled` at depth 1, where it hangs. [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) already made that trade the other way — *"`arrival-count` stays shipped, because the matrix is only meaningful while both columns can be run"* |
| **The `unsatisfiable` exit emits NO event for the enclosing region, and depth 1 could not see it** | `settleJoin`'s `unsatisfiable` arm appends `joinSettled fired:false`, calls `onUnsatisfiableJoin`, and **returns** — it does not enter the join's successor, so nothing reaches the outer region. At depth 1 the region's `fanout` is in no region and there is nothing to emit; **at depth 2 there is.** Measured: on `nested-inner-all-exit` under `live-token-requiring-arrival`, `inner` is `unsatisfiable`, `onUnsatisfiableJoin` names `inner` **only**, and `outer` sits at `waiting {live:1, positive:true, arrived:1}` **with nothing reported about it**. This is [Q114](../open-questions.md)'s exact shape — a `settleJoin` exit that was right at depth 1 because its wrong value was unobservable |
| **The refused variant's known defect LAUNDERS itself upward** | [Q91](../open-questions.md) / [ADR 0025](../decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md): `arrival-count-decrementing` fires a join **zero branches reached**. At depth 2 that bogus firing produces a **real** `arrived(outer:1)`, the outer join fires legitimately, and the run reports **`completed`**. At depth 1 the defect is confined to one join; nesting turns it into a run-level verdict. **The refusal ADR 0025 already made is strengthened by a fact it did not have** |
| **`runCell` runs a nested row today and reports only one of its two joins** | It needed no change to produce all sixteen cells — but `Cell.status`/`describe` are the row's declared `fanoutId`'s, and the **inner** join, which is what every depth-2 row is actually about, is reachable only by calling `driveScenario` and `joinStatusOf` by hand. **A depth-2 row asserted through a `Cell` alone asserts the outer join and calls it the row** |
| **`AGENTS.md` section 11 states the join over nesting is UNDECIDED**, and this item decides it | Line 857: *"no policy has been ruled transitive over nesting … do not rely on an outer join's behaviour until this row says otherwise."* In nobody's `Owns`, and **found late by both W20 and W21**. Declared up front here. *(Its executed error-class snippet is **not** touched, because no error class is added — that snippet fails the gate on an undocumented export, so a construction refusal would have made `AGENTS.md` a hard dependency rather than a prose one.)* |

### The fork, stated and NOT taken

**What does an inner join's `unsatisfiable` do to the outer branch?** All three arms agree that the
run is detectable — `RunState.outcome` is already `stuck` — and differ in whether the **outer join**
is left silently waiting.

| | **A — leave it** | **B — emit `branch.lost` for the enclosing region** | **C — declare the outer join unsatisfiable too** |
|---|---|---|---|
| what changes | nothing | `settleJoin`'s `unsatisfiable` arm emits one terminal event into `regionOf(fanoutId)` at `pathOf(fanoutId)`, exactly as its `satisfied` arm already enters the successor | the driver walks outward marking every enclosing join dead |
| the outer join then | `waiting` forever, `live` never reaching zero | decrements: `live-token` fires the outer join, `live-token-requiring-arrival` reports it `unsatisfiable` only if nothing else arrived | `unsatisfiable`, reported |
| for | no code change; the run is already `stuck` | **section 2's own definition of `branch.lost` already covers it** — *"a node in that branch reached a terminal state and no edge was eligible, so the path ended inside the region without reaching an `end` node"*, which is what a dead join is; and `JP-R5` says a branch neither suspended nor in flight has exactly one terminal event, which this branch currently has **none** | the strongest report |
| against | **it breaks `JP-R5`**, on the reading above, and it is the arm the code takes today by omission rather than by decision | it makes `live-token` **fire** an outer join over a region containing a dead join — arguably right, arguably a hang laundered into a completion | the driver would be deciding satisfaction, which [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 1 and section 4's owner table both give to a policy |

**This item measures all three before choosing and records the measurement**, which is what its
readers will check. It is the same discipline W21 applied to threading-versus-deriving, and the
`JP-R5` argument is the one to test first because it makes A a **defect** rather than a choice.

## Scope

**In**

1. **[ADR 0030](../decisions/)** — is a join transitive over nested fan-out? With the sixteen-cell
   correspondence as evidence, and the fork above settled.
2. **Four depth-2 matrix rows** against all four columns, expected values hand-derived.
3. **A `Cell` that reports every region of its row**, so a depth-2 row's inner join is asserted
   rather than reachable-by-hand.
4. **The `unsatisfiable` exit's enclosing-region event**, per the fork.
5. **`spec/join-policy.md`** section 5's transitivity bullet replaced by the ruling; section 4's owner
   table updated for (4); a `JP-R*` rule if the fork's answer needs one, with a `Test owed by` cell
   because `check-spec`'s C6 requires it.
6. **`AGENTS.md`** section 11's nested-fan-out row.

**Out** — named rather than left implicit, with where it goes instead

- **`arrival-count` refusing nesting.** **Struck**, and the plan's correction block records why. There
  is no `JP-R*` refusal, no construction refusal, no new error class, and therefore **no
  declared-empty matrix cell** — so [Q100](../open-questions.md) does not reach a third file. If a
  reader wants the refusal reopened it needs a new argument, because the one P7 gave is measured
  false.
- **Real workers.** `examples/**` is W23's, and [Q117](../open-questions.md)'s wrong id in the L6
  harness is W23's with it.
- **Depth 3.** The matrix runs at **depth 2**, which is P7's scope. [Q113](../open-questions.md)
  records that `Driver.regionOf`'s fifth site — `driver.ts:1022`, the `fromRegion` a join's successor
  is entered with — **cannot discriminate at depth 2 and does at depth 3**, and that nothing tests it.
  An item claiming depth 3 works owes that row; this one does not claim it.
- **Per-join policies** ([Q5](../open-questions.md)). Nesting makes *"one policy per run"* louder and
  this item does not lift it.
- **Changing any of the three shipped policies.** Section 3's definitions are byte-unchanged. If the
  fork's answer would need a policy clause, that is `JP-R7`/`JP-R8`'s *"a refinement is a new policy
  under its own id"* and it is a different item.

## Verification

| Clause | Command |
|---|---|
| L0 | `npm run check:spec` (**C8** moves with `spec/join-policy.md`; **C6** if a rule id is added), `check:source`, `check:scheduler`, `check:policies` (**`JP-R9`** reads section 3, which this item must not break), `check:docs` — **`AGENTS.md` is edited, so X3/X4 are live**; `npm run lint`, `npm run typecheck` |
| L1-L5 | `npm run test`, `test:deno`, `test:browser` — **chromium only** by default; firefox and webkit need `test:browser:all`, which the gate does **not** run, so any claim about five runtimes says which command produced it. **This item's own coverage is L1, L2 and L5** |
| L6 | **NOT RUN — by declaration.** W23's. Reported as *did not run*, and `npm run gate` ends with `test:l6 && test:l6:deno`, so a Record claiming both exit 0 and "L6 not run" contradicts itself |
| ADR 0030 | the decision exists, its rules are numbered, and every claim in it is executed by a named assertion — the standard ADR 0025 set when W16 verified its pasted table against `runCell` mechanically |
| conformity reader | fresh context, spec first, **re-deriving all four depth-2 rows' sixteen cells from `spec/join-policy.md` sections 2 and 3 before opening the expectation table** |
| adequacy reader | tests second, mutating **in an isolated copy** — links measured first (`find -type l` plus `Get-ChildItem -Recurse -Force -Attributes ReparsePoint`), green in the copy before it starts, scanned again before removal |

**Rule 8 — all THREE v0.8 obligations.** The rule's clauses; the `Outputs` rows; **and the provenance
of every value an assertion reads** — and the third one has a named target here: the depth-2 rows'
correspondence to the depth-1 rows is a claim about **two sources**, so a probe must check that the
depth-1 side is read from `EXPECTED` and not re-derived from the same run that produced the depth-2
side. [Q112](../open-questions.md) is the shape to instantiate it by — *a provenance probe changes the
source expression and nothing else* — which W21's adequacy reader established and which P7's retro
rules on. **Re-run the whole set after acting on the readers**, and check their exact edits back in as
probes.

*Per the template:* a branch routed away from its join (Q4) — **applicable and covered**, it is the
`nested-inner-exit` row; `user_action` (Q17) — **applicable and NOT covered**, deliberately: the
depth-1 `suspended`/`resumed`/`lost-resolved` rows already exercise it and all three shipped policies
ignore both events ([Q113](../open-questions.md)), so a nested suspension row would add a run and no
discrimination — stated rather than left silent; no matching decision edge (Q10) — not applicable; a
duplicate task id (Q13) — not applicable, W21 settled minting; a nested fan-out (Q6) — **this item is
the join half of it, and the plan's question**.

## Record

**Both readers ran. Conformity: 12 findings, 1 BLOCKING. Adequacy: 41 mutations, 2 BLOCKING. All
nineteen acted on, and the set was re-run after — 38 probes, 8 survivors, all classified.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, green** | `check-spec` 8 checks — **C8 moved with `spec/join-policy.md` v0.10**, C5 caught ADR 0030's link before the file existed; `check-source` 11 checks / 13 published files; `check-scheduler` 5 + **12/12**; `check-policies` 3 + **13/13** — `JP-R9` reads section 3, which this item left byte-unchanged; `check-docs` 5 + **14/14**; `deno lint` **43 files**; `typecheck` 5 projects |
| L1-L5 | **RAN, green** | **474 `test()` cases over 19 files** (+48 over 426) in **all five runtimes** — node 24.20.0, deno 2.9.6, chromium, firefox, webkit, parity asserted at 474. `npm run gate` runs three; **`npm run test:browser:all` is what produced firefox and webkit** and the gate does not run it. **This item's own coverage is L1, L2 and L5** |
| L6 | **RAN as regression; added NO coverage**, and the coverage is W23's | **373 assertions / 21 real runs** in both runtimes, unmoved — the right result, since nothing here changes a depth-1 run and there is no nested flow at L6 yet. **Not reported as `NOT RUN`**: `npm run gate` exited 0 and it ends with `test:l6 && test:l6:deno`, so a Record claiming both would contradict itself, which is how W20's first Record did |
| ADR 0030 | **WRITTEN**, seven rules | Rules 1-5 are each executed by a named assertion; **rule 7 was executed by nothing until its conformity reader said so** and now is; rule 6 is a refusal and its evidence is the plan's correction block |
| conformity reader | **RAN — 12 findings, 1 BLOCKING; all acted on** | It re-derived **all sixteen depth-2 cells, both regions, all four streams and all four verdicts** from `spec/join-policy.md` sections 2 and 3 before opening `NESTED_EXPECTED`, and reported **zero disagreements**. Its blocking one is below |
| adequacy reader | **RAN** in an isolated copy — **41 mutations, 2 BLOCKING**; all acted on | Zero symlinks and zero reparse points measured before the copy; **green at 467 in the copy before it started**; scanned again and left in place rather than forced |
| re-run after the findings | **RAN, green** | `npm run gate` **exit 0**, read directly. Whole set re-run: **38 probes, 8 survivors, 0 void**. No commit exists — this item was not asked to commit, so there is no sha to name |

**Gate read from its exit code, not through a grep** (`npm run gate; echo $?` → 0).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1)** ADR 0030 | yes — seven rules, and **rule 6 is a refusal of the plan's own decision** | **Nothing.** Deleting rule 4 leaves the gate green — no check reads ADR prose, the class six retros have refused to mechanise |
| **(2)** four depth-2 rows against four columns | yes — sixteen cells, every value hand-derived first | Renaming a row: **THREW**. Deleting one: **THREW** *(it cost **0** until the readers; see below)*. Dropping a column from the depth-2 loop: **2** *(it cost **0**)*. Rendering the depth-1 rows instead: **4** |
| **(3)** a `Cell` that reports every region | yes — `Cell.regions`, additive; depth 1 unchanged | Reporting only the row's fanout: **THREW**. Reading every region's status from the row's: **8**. Emptying the depth-1 default: **1** *(it cost **0**)* |
| **(4)** the `unsatisfiable` exit emits for the enclosing region | yes — `JP-R10` | Deleting the emission: **12**. Wrong region: **14**. No path: **8**. `branch.exited` instead: **8**. Cascade dropped: **4**. Emitting at depth 1 too: **THREW** |
| **(5)** `spec/join-policy.md` sections 4 and 5 | yes — **v0.10, and section 2 as well**, which the item did not predict | **Nothing.** Deleting `JP-R10`'s row leaves the gate green |
| **(6)** `AGENTS.md` section 11's row | yes — **and section 5's, which the reader found false at depth 2** | **Nothing.** Reverting it to *"undecided"* leaves the gate green |

**`Owns` audit**, by hand, after the record step.

| | |
|---|---|
| **`Owns`** | `spec/join-policy.md`, `spec/README.md`, `test/matrix/**` (run.ts, flows.ts, scenarios.ts, matrix.test.ts, chain.test.ts, table.ts, render.ts), `src/driver/driver.ts`, `test/driver/surface.test.ts`, `AGENTS.md`, `doc/decisions/0030-*.md` — **all inside** |
| **Exceptions** | **`spec/run-state.md`** (W2's) — its `failed` row said *"`branch.lost`'s condition"*, which `JP-R10` falsified; **declared LATE**, found by the conformity reader, and corrected in place rather than left standing. **`doc/plans/p7-*.md` beyond its Record** — the correction block and the W22 index row; section 1 rule 5's list names *"the plan's Record"*, not the plan's body. Also found by the conformity reader |
| **Record step** | this file, `doc/plans/p7-*.md`'s Record, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md`, `doc/decisions/**` |

## Rule 8 — the set, re-run after acting

**38 probes, 8 survivors, 0 void**, all three v0.8 obligations. The readers' own edits are checked in
as `R1`-`R10`, which is W18's finding and P6's retro's adopted rule.

| | probe | cost |
|---|---|---|
| A1-A7, A11 | `JP-R10`'s clauses: emission deleted, wrong region, no path, wrong event, cascade dropped, depth-1 leakage, report reordered | **12 / 14 / 8 / 8 / 4 / THREW / 12** |
| A8 | section 3: `live-token-requiring-arrival` can no longer say `unsatisfiable` | **36** |
| A9 / A10 | W20's and W21's own defects restored | **27 / 1** |
| A4 | emitted at the JOIN's path rather than the fanout's | **SURVIVED — VACUOUS**, and measured: `pathOf(fanoutId) === pathOf(joinId)` at every depth, because a region's join sits in exactly the enclosing regions its fanout does |
| B1-B5, B9 | the `Outputs` rows | **THREW / THREW / 8 / 6 / 4 / 1** |
| B6-B8 | spec, `AGENTS.md` and ADR **prose** | **SURVIVED** ×3 — the known refused class |
| C1 | the correspondence's depth-1 side re-derived from a run | **SURVIVED — REAL, and worth exactly one assertion.** Second route: with it applied, breaking `ltArr` costs **35** instead of **36**; the nine rows catch the policy either way, and what goes is the one place depth 1 and depth 2 are compared to each other |
| C2 / C3 | the render's shared prefix taken from column zero / column one | **SURVIVED (VACUOUS) / 1.** `arrival-count` is the strictest policy, so any join it satisfies every other satisfies too — its stream **is** the common prefix on all four rows. The pair discriminates in the direction that matters |
| C4 / C5 / C8 | one of two writers deleted; the nested cells run a depth-1 scenario | **22 / 1 / 24** |
| C6 | the both-orders loop runs one order twice | **SURVIVED — insurance, reachable.** Second route: A9 alone **27**, A9+C6 **29**; the orders answer differently under a broken resolver and cannot differ under a correct one, which is what the loop asserts. Same status `spec/join-policy.md` already records for `JP-R5`'s ordering clause |
| C7 | the outer cross-check made a tautology | **SURVIVED — REDUNDANT-WITH-B3**, which costs 8 |
| R1-R9 | **the readers' nine edits, every one of which cost 0 when they ran it** | **THREW / 2 / 2 / 1 / 1 / 1 / 6 / 1 / 1** |
| R10 | an inner expectation carries a wrong verdict | **SURVIVED — REDUNDANT-WITH-TYPECHECK.** The fix was type-level (`Pick<Answer, 'status' \| 'describe'>`), so writing the field is **1 `tsc` error** and no runtime probe can reach it |

**And the re-run fired, for the third item running.** After the fixes, `C8`'s anchor had moved and
the harness's rule 7 (b) guard aborted with *"ANCHOR MATCHED 0 TIMES — probe is VOID"* rather than
reporting a pass. Re-pinned, it costs **24**. That is W19's experience exactly, one plan on.

## What broke

**1. The BLOCKING conformity finding is the one I asked for, and my ADR was quoting selectively.**
`spec/join-policy.md` section 2 defines `branch.lost` as fired when *"a node in that branch reached a
terminal state — **by settling, or by being resolved** — and **no edge was eligible** for it"*. A dead
join satisfies **neither** clause: a `join` node never settles and is never resolved, and its edge
stays eligible while the join simply does not fire. ADR 0030, `JP-R10` and the driver comment all
quoted only the trailing *"so the path ended inside the region"* and read it as the definition.
**Two more sentences in the same section were false with it**: the *"mutually exclusive and
exhaustive"* paragraph (`FD-V7`/`FD-V8`/`FD-V10` are about **nodes**, so they make the node road
exhaustive and say nothing about a region nested in a branch), and `reason`'s *"either … or"* two
roads, now three. **The behaviour was right and the document that defines the emission was not** —
section 2 now has an (a) and a (b), and `JP-R6`'s *"adding an event is a spec change with its own
rationale"* is discharged as *widening the condition of an existing one is the same obligation*.

**2. Both of the adequacy reader's BLOCKING survivors are LOOP BOUNDS, and my 28 probes could not
see one of them.** A whole depth-2 **row** could be deleted from `NESTED_SCENARIOS` for **0 failures**
and six silent test cases — the only guard read `NESTED_EXPECTED`, so a row that left took its own
assertions with it and left the count of expectations intact. And a whole **column** could be dropped
from `COLS` for **0 failures with the assertion count unmoved**, because the columns are looped
*inside* test cases — while the render kept printing four from `MATRIX_POLICY_IDS`, so the artifact
advertised coverage the assertions no longer had. ADR 0030's evidence is *"sixteen cells"* and
**nothing counted to sixteen.** Both are W15's *"a whole column deleted from ADR 0025's pasted
table"* reproduced in the depth-2 half.

**3. Three of my own provenance probes were REWRITES, not source swaps — Q112's correction, made by
the previous item's reader, did not survive one item.** [Q112](../open-questions.md) says *a
provenance probe changes the source expression and nothing else; once it edits the projection it is a
rewrite, and its survival says nothing.* I edited the projection alongside the source three times and
read three passes as findings. Rewritten as *"delete one of two writers"*, the same three cost 22, 1
and 24.

**4. `python`'s text-mode write converted seven files entirely to CRLF**, where `HEAD` is LF
throughout — turning small edits into whole-file rewrites in the diff. Every check stayed green:
`deno lint`, `tsc`, all five `check-*.mjs`, 467 assertions. **Caught only because rule 7 (b) fired**
on four `\n` anchors that no longer matched. Normalised; [Q123](../open-questions.md).

**5. My first `stuck` assertion was wrong, and the failure was the finding.** With the outer join now
firing, `publish` is dispatched and the run reads `running` until it settles. That is a real cost of
the arm this item took — downstream work runs in a doomed run — and it is ADR 0030 rule 5 rather than
a slip.

**6. Five dead relative links, in two files, found by hand.** Two in this register (both pointing at
renamed work items) and three in `AGENTS.md` (`](../doc/…)` from the repo root). All pre-existing;
all fixed. `check-spec`'s **C5 does exactly this check for `spec/**`** and has since W1.
[Q121](../open-questions.md).

## What this taught

**1. The plan's own DECISION was falsified by the declaration step's measurement, and that is a first.**
Nine plans have measured a load-bearing fact before declaring and all nine changed what got written;
W20 corrected P7's work-item **table**. This corrected the paragraph P7 titled *"what is settled
before fan-out"*: *"`N` is fixed at the outer branch list and an inner branch has no way to be
counted"* is **not a mechanism**, and the refusal built on it would have rejected a definition on
which the policy is measured to work. **The whole of the plan's stated size problem — an ADR, a spec
rule, a driver refusal and a matrix dimension — dissolved into three when one sentence was checked.**

**2. An author's probes break VALUES; a reader's break BOUNDS, and the two do not overlap.** All 28
of my probes changed what a thing *is* — a region id, a path, a source expression, an expected
literal. Both of the adequacy reader's blocking findings changed **how many things are iterated**, and
neither is reachable by any probe of the first kind. This is not the same as v0.7's *"the rule's
clauses AND the `Outputs` rows"*, nor v0.8's *"and the provenance"* — a loop bound is not a value with
a source, it is the shape of the set the values live in. **Two occurrences would make it a rule; this
is one, and W15's column-deletion finding is arguably the other.** For P7's retro.

**3. A guard's absence is invisible exactly where its subject is correct.** `C6` (both declaration
orders) and `C2` (the shared prefix) both survive because the thing they guard is right: order
independence and the strictness ordering of the policies. Rule 8's *"a survivor is only a survivor
once a second route confirms the clause was reachable"* is what separated those from `C1`, which
survived and **was** worth an assertion. Without the second route all three would have read the same.

**4. Declaring `AGENTS.md` up front worked, and it was still not enough.** W20 and W21 both took it as
a late exception; W22 declared it and still shipped a **false sentence in a different section** —
§5's *"stops the run"*, true at depth 1 and false at depth 2. The `Owns` question and the *which
section* question are different questions.

## Questions raised

- **[Q121](../open-questions.md)** — dead relative links in `doc/**` and `AGENTS.md` are mechanically
  checkable and nothing checks them, while `check-spec`'s C5 does exactly this for `spec/**`. Five
  found by hand. **The one sub-case of *`doc/` is checked by nothing* whose mechanism is already
  written.**
- **[Q122](../open-questions.md)** — four of the matrix's *whole-matrix* claims still iterate the nine
  depth-1 rows only. W22 extended `JP-R2` and `JP-R3` to depth 2 and left `JP-R1`, `JP-R4`, the `null`
  payload and Q7's verdict list, because widening them would put the depth-2 rows into ADR 0003's and
  ADR 0025's arithmetic.
- **[Q123](../open-questions.md)** — nothing fixes line endings and a whole-file CRLF conversion is
  invisible to every check. No `.gitattributes`.
- **[Q124](../open-questions.md)** — the correspondence's explicit rename map is discriminably better
  than a prefix strip (**12 failures vs 9**, measured by the adequacy reader) and no shipped row
  exercises the difference. A depth-3 row would.

*(Q125 unused and **skipped, never reissued**. ADR 0030 was taken; no second ADR was needed, because
the propagation fork was settled by a rule this document already had rather than by a new decision.)*

**Reader overlap: 2 of 19.** Both readers found the dead `verdict` field on the inner expectations,
and both found `Scenario.regions` unguarded — from opposite directions, one asking *"is it checked
against the flow?"* and the other *"can it be reordered or emptied?"*. **The eleventh measurement,
and inside the 1-4 band** `doc/workflow.md` section 6 declares settled.
