# W46 — What a reference costs, and whether anything says so

**Status:** done
**Plan:** [P13](../plans/p13-when-is-a-declared-reference-refused.md)

```
Spec:       spec/flow-definition.md section 3 - the `needs` block's cost
            paragraph, which is the only thing in the normative layer that
            states this. Section 5 is NOT reopened: W45 took FD-V29 and FD-C4
            and this item is about a COST rather than a refusal.
Owns:       src/driver/driver.ts, spec/flow-definition.md section 3,
            test/driver/**, doc/decisions/0043-*.md
            (written from P13's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     Q186 and Q22, read from doc/open-questions.md; P13 facts 3 and 4
            and prediction 3, read from the PLAN's own file; ADR 0037's clone
            measurements and ADR 0040's *what it costs* table, read from
            doc/decisions/; spec/flow-definition.md v0.13 section 3's cost
            blockquote; W45's Record, for what FD-V29 and FD-C4 moved.
Outputs:    (1) EITHER a mechanism, with ADR 0043 - or a RECORDED VERDICT that
                nothing should warn, with the reason, which P13 prediction 3
                says is the expected outcome and a legitimate result.
            (2) Q186's cliff re-measured on the tree this item ships, and
                whatever fact 4 turns out to mean now that a reference may
                carry a `?`.
            (3) Whatever reaches src/driver/driver.ts, or a measurement
                saying why nothing does.
            (4) The cost stated in spec/ at the scope it was measured at.
Depends on: W45 - which shipped FD-V29, FD-C4 and a fifth spelling, all of
            which change what a reference can be before its cost is priced
Blocks:     W47 (the exit artifact)
Tests:      Expected values from spec/flow-definition.md and from ADR 0037's
            own measured table, never from output. L2 in test/driver/ for
            anything built. A TIMING assertion is refused in advance: wall
            time here is not reproducible (Q179), so what stands in for one
            is a pair of numbers in the Record, which is ADR 0040's own
            precedent for its memo.
Gate:       L0-L5 in three runtimes, then the two spec-conformity readers,
            then rule 8's whole set re-run with the readers' edits checked in.
Reserves:   Q208-Q212, ADR 0043 (expected SKIPPED - prediction 3)
```

## Scope

**In**

1. **[Q186](../questions/q186.md)** — whether anything warns about a reference to a large value, or
   whether the answer is that nothing should and the reason is written down.
2. **P13 prediction 3's reversal condition, checked rather than assumed**: *a warning that needs no
   size judgement — most likely a static one about a reference into a map region, which the document
   already knows about.* If that is buildable and wanted, the prediction reverses and ADR 0043 is
   taken.
3. **Fact 4 re-examined at v0.13.** *An author cannot point at less than a NODE'S WHOLE RESULT* was
   measured before `?` existed. The suffix changes what a reference may SAY; whether it changes what
   one COSTS is this item's to measure.

**Out** — named rather than left implicit, with where it goes instead

- **[Q22](../questions/q22.md)'s constraint decision** — *how large is too large*. P13's `Out` list
  makes this a **stop and ask the maintainer** rather than a scope call. **This item's first job is
  to establish whether it needs that answer**, and to say so either way.
- **A refusal.** `FD-V29` and `FD-C4` are W45's and section 5 is not reopened. A cost is not a
  refusal, and `FD-R2`'s precedent — *a run-time fact gets a run-time refusal* — is about a run that
  cannot proceed, which an expensive one can.
- **[Q19](../questions/q19.md)** — bounded retention. P13's `Out` list.
- **A path language.** ADR 0040 rule 5's *what it costs* names it as the most likely thing to be
  asked for next and refuses it: it would move this cost out of the document and into a selector.
  Nothing here reopens that.
- **[Q206](../questions/q206.md)** — W45's sibling-region finding. It is a correctness question about
  `FD-C1`'s visibility predicate and P13 decision 1 forbids reopening the KEY.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, three runtimes | `npm run test`, `npm run test:deno`, `npm run test:browser` — and `test:browser:all` if L1 moves |
| L6 | `npm run test:l6`, `npm run test:l6:deno` — **as a regression this item must not break** |
| static checks | `npm run check:spec` (`C8` moves if section 3 does), `check:source`, `check:markdown`, `check:docs` |
| conformity reader | fresh context, spec first and artifact second |
| adequacy reader | fresh context, in an isolated copy |
| rule 8 | the whole set at v0.13, then re-run with the readers' edits checked back in |
| gate | `npm run gate`, `GATE EXIT=0` **and** zero lines beginning `FAIL` |

**Routing cases this item touches** (`doc/workflow.md` section 5's checklist): none of Q4, Q10, Q13
or Q17 is applicable — this item prices an existing mechanism and adds no routing. A **nested
fan-out** (**Q6**) and a **map region** are both load-bearing for the measurement, because the
quadratic only exists where the arity is the run's.

## Record

**Gate — what ran.** Every number re-taken on the tree this item ships, after the readers'
findings were acted on (`doc/workflow.md` section 1 rule 5's WHEN clause).

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN** | `deno lint` 48 files, `npm run typecheck` all five projects, 0 errors |
| L1-L5, three runtimes | **RAN** | **24 files / 656 `test()` cases** in node 24.20.0, deno 2.9.6 and chromium, from 654. `test:browser:all` was run because L1 moved: **656 in firefox and webkit too** |
| L6, both runtimes | **RAN** | **806 assertions over 38 real runs**, unmoved — the declared result, this item adding no row |
| static checks | **RAN** | all seven green. `spec` **7 documents / 43 examples / 89 rules**, unmoved; `check-docs` gains **`X6`** and is 6 clauses; `check:docs:selftest` is **18 probes / 10 gradings** from 14 / 8 |
| conformity reader | **RAN** | **16 findings, 8 blocking**, and its first finding is that this item's headline method claim **did not reproduce** |
| adequacy reader | **RAN** | **22 graded mutations, 10 real survivors, 8 blocking**, and its first finding falsified the verdict's second reason. Isolated copy at `../w46-adequacy`, green before it started, restored after, scanned for links and reparse points before removal |
| rule 8, author pass | **RAN** | 20 probes: control OK, 16 caught, 3 declared ceilings, **0 survivors standing, 0 aborts**. It found the pair's size clause comparing two constants nothing read |
| rule 8, re-run | **RAN** | **22 probes: control OK, 16 caught, 5 declared ceilings, 0 survivors standing, 0 aborts** — the whole set rebuilt, because the suite the first set aimed at was replaced. It found one more real hole: see *what broke*. *(**The five ceilings were NOT RUN, and P13's retro measured them** — `doc/workflow.md` section 6 pass 3 rule 6, and the defect is the harness lineage this file shares with W45's and W47's: a row declared `red: []` executed no command and the verdict restated the declaration. Re-run, **all five come back clean at `l1=0/exit0` and every stated reason holds** — `a3-double-clone` ([Q212](../questions/q212.md)), `b1-verdict-gone`, `b5-decision-unasserted`, `e2-x6-not-in-all-checks` ([Q209](../questions/q209.md)) and `e3-x6-reads-a-path` ([Q210](../questions/q210.md)). So this item's ceilings were right; **the practice of not running them was not**, and it hid a false one in W47.)* |
| gate | **RAN**, and it went RED first | `npm run gate` — `GATE EXIT=0`, **zero lines beginning `FAIL`**, 15 chain entries. **The run before it was `GATE EXIT=1` with zero `FAIL` lines** — the exit code being the predicate for the third time in two plans, and the failing entry visible only as `selftests — 7/7 completed, **6 ok**`. **[Q142](../questions/q142.md) fired**, exactly as P13's declaration predicted and on the floor it predicted: `M4`'s two-directory fixture had risen to **2738** against a floor of 2700, so probe 2 reported `wanted [M1,M3,M4], got [M1,M3]`. Retuned from a scratch copy OUTSIDE the repository — whole tree **91 / 3770 / 187**, `doc/decisions` removed **69 / 3437 / 187**, both removed **55 / 2738 / 187** — to **`M3` 74 → 80** and **`M4` 2700 → 3080**, near the middle of `(69, 91]` and `(2738, 3437]`. **`M3` did not fire and was retuned anyway**: at 74 it had five files of headroom and this plan's two remaining Records would have spent them, so re-centring both is what stops Q142 being paid twice in one plan, which P12 did. **Both META entries were already anchor-agnostic**, so nothing needed repointing — rule 7 (b)'s lesson having been learned at W33 and W42. `check:markdown:selftest` is **37/37 caught, 7/7 bounded** |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) EITHER a mechanism with ADR 0043, or a **recorded verdict with the reason** | the verdict. **ADR 0043 is SKIPPED** — P13 prediction 3's expected outcome, and its reversal condition was checked rather than assumed | 9 L1 failures if `map-with-context` stops validating with zero findings — the decision's own assertion, which is [Q190](../questions/q190.md)'s bar. The prose is a declared ceiling |
| (2) Q186's cliff re-measured, and what fact 4 means at v0.13 | yes — **5.5 / 7.7 / 8.7 / 613.6 / 617.4 ms** at arity 1000, one case per process; the `?` costs nothing | `check-docs`' **`X6`** (2 failures) if the spec's table and `AGENTS.md`'s disagree, both ways; `C8` if the version row does not follow |
| (3) whatever reaches the driver, or a measurement saying why nothing does | **nothing reaches the driver**, and the measurement is why: the guard is affordable and there is no threshold to set it at | 8 L1 failures if the mechanism stops copying, 2 if N instances share one copy, 11 if the reference resolves once for all N |
| (4) the cost stated in `spec/` at the scope it was measured at | yes — section 3 v0.14, with the METHOD beside it | 1 `spec` failure (`C8`), 2 `check-docs` failures (`X6`) |

**What broke.**

**The item's headline method claim DID NOT REPRODUCE, and its conformity reader is what found that.**
This Record's first draft said the v0.11 numbers were taken by a method *"worth 2.5x in run
POSITION"*, and that reversing the list made the two large cases *"swap their numbers exactly"*.
Neither survives. **The comparison had been reversed-in-one-process against
one-case-per-process — two variables at once** — and the isolating comparison was never taken. Taken
now, five passes each way:

| | |
|---|---|
| forward, median per row | 9.4 / 9.2 / 10.0 / 1060 / 1390 ms |
| reversed, median per row | 9.5 / 15.7 / 24.3 / 1312 / 1048 ms |
| **so ORDER costs nothing**, and | **ACCUMULATION costs up to 4.4x**: a cheap row goes 6.8 → 30.1 ms first pass to last, the large row 622 → 1632 |

**Nothing swaps.** What is true, and is what the note now says, is that *later in the process is
dearer whatever the order*, so **the last row of a one-process table carries the whole accumulation**
— which is why the cliff was robust throughout and the spread among the three cheap rows never was a
measurement. Two further statements of the wrong version were internally false and both were caught
by arithmetic rather than by measurement: *"swap their numbers exactly"* of two numbers that become
1533.5 and 620.9, and ADR 0040's *"the three cheap rows move by 3-4x"* of ratios that are
**2.76 / 1.95 / 1.85**. [Q208](../questions/q208.md).

**And the verdict's SECOND REASON was the opposite of the truth.** It said the size-free static
predicate *warns about the feature*, on the ground that `map-with-context`'s reference is a false
positive. **Its adequacy reader measured the shipped document, unedited: 604.9-643.6 ms as the corpus
writes it against 7.9-9.1 ms with the `run` key removed — ~70x, on the showcase.** The predicate is
**right**, and it is right because `ingest`'s result *holds the array `over` names*, which is P13
fact 4 exactly. **The conclusion held and its reason was inverted**: the predicate is declined
because it fires on **3 of 3 intended uses and nothing else**, so it restates the feature's
definition rather than diagnosing anything — and the only remedy for the expensive one is the
reshaping node ADR 0040 exists to remove. **And it is not the only such predicate**: *a reference
naming the node the `over` array was read from* fires on the same 3, found independently by **both**
readers. *A verdict can be right for a reason that is the negation of its own evidence, and only a
reader re-deriving the evidence finds that* — which is [Q193](../questions/q193.md)'s shape on a
decision with no ADR.

**The THIRD reason stated an absence where what exists is an unweighed choice.** It said *there is no
CHANNEL* — and [ADR 0027](../decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
is the decision that faced *stop / ignore / report* and **chose report**, through `onUnmintedTask`.
That is the fifth option between a refusal and silence, it is in this codebase, and the cell cited it
only for the price of the option. It is now weighed: `onUnmintedTask` reports a fact about a **run**
that a caller could not otherwise know; *this reference is resolved once per item* is a fact about
the **document**, decidable by reading it. And `validateDefinition` and `Finding` are both exported
from the package root, so a `severity` field would be a **type** change rather than a new option —
cheaper than the cell claimed and still a change to a published type for a diagnostic with no action
behind it. Conformity reader.

**The FOURTH reason's number was unreproducible and the replacement is two orders of magnitude
stronger.** It claimed **~1%** from a budgeted node walk at 0.0053 ms; its conformity reader could
find no budget below 0.02-0.03 ms, because the first pop expands a 1000-element array. **Withdrawn.**
What reproduces is `JSON.stringify().length` at **0.140 ms** against a **0.482 ms** clone — mine, and
0.125 against 0.418 independently — so a measurement is **~29% of ONE clone**, taken **once per
(node, key)** against **N** clones, which at N = 1000 is **~0.03%** of what it would warn about. *A
number that cannot be reproduced was replaced by one that can, and the argument got stronger.*

**And the deferral named the wrong row.** The verdict deferred *how large is too large* to
[Q22](../questions/q22.md); that phrase occurs in **exactly one place in the register — Q186's own
row** — and Q22 asks whether a result must be structured-**cloneable**. So **Q186 is DECIDED and stays
OPEN**, on [Q190](../questions/q190.md)'s precedent: resolving it would delete the only place the
threshold question is asked. Its status cell reads *decided as NOTHING WARNS, and the decision is
written down*, with a forcing condition, which is the shape Q190's row already has and which this
item's first draft did not give it. Conformity reader.

**The L2 suite was REPLACED, and both readers reached that from different ends.** The first one
asserted *N instances, N distinct copies*:

| | |
|---|---|
| it could not go ABOVE N | doubling the clones (`cloneValue(cloneValue(x))`) cost **0**, because a `Set` over what N receivers RECEIVED is bounded by N however many copies were discarded — **and that is still true and is now a declared ceiling** ([Q212](../questions/q212.md)) |
| it was a FOURTH restatement | every mutation it caught was already caught by 2-7 assertions in W41's `JP-R11` suites and W42's edge-site suite. Deleting it changed 8 → 7 and 3 → 2 |
| and it asserted the half that cannot go wrong for a SIZE reason | the document's claim is *and the cost is linear in the size of each, so the PRODUCT is what an author pays* |
| its bounds were unbound | arity 1 for 0 (`N === N`), `Set` → `.length` for 0, the case loop short-circuitable after the first case for 0, and the 10x pair clause clearing only via an **aliased** array |

**Replaced by the two things nothing else asserts**, one of them the adequacy reader's own proposal:
the **product** — the summed serialised length of the N composed payloads, which *is* arity × size,
measured at **two arities** so *quadratic* is distinguishable from *linear in the arity* — and the
**decision**, `map-with-context` validating with zero findings, which is Q190's bar and which goes
red if a warning channel is ever added.

**Three documents stated the same five figures and nothing compared any two.** Editing the spec's
`613.6 ms` to `6.1`, or `AGENTS.md`'s to `61.3`, cost **zero** across all four static checks while
destroying the `71x` claim in its own table. That is v0.13's obligation (e) third shape at three
copies. **`check-docs` gains `X6`**, comparing them **both ways** and **by column position** — a
first version filtered by magnitude and the check's own first run caught it, because the arity-100
large figure is 8.1 ms and passes any threshold. ADR 0040's copy is marked **historical** and
deliberately not compared. Four clauses, four provocations at birth, all four fire.

**And `X6` produced three findings of its own, each one a rule this repository already had.**
`ALL_CHECKS` in `check-docs-selftest.mjs` was the literal `['X1'…'X5']`, so **`X6` shipped with four
clauses and no probe and no grading at 14/14, 8/8, exit 0** — [Q43](../questions/q43.md)'s class,
which W36 closed in a different self-test and this file had not been. Derived from
`check-docs.mjs`'s own report array, with a refusal if that array names no id
([Q209](../questions/q209.md)). `X6` then read **`AGENTS.md` by name** instead of the document the
check is pointed at, so all three of its probes exited 0 — obligation (e)'s **second question** in a
third shape, after W36's flags and W35's file, and **the first of the three caught by the author's
own set** rather than by a reader ([Q210](../questions/q210.md)). And its one META entry came back
**STILL CAUGHT**, because changing a figure trips both directions of the comparison at once — W29's
**co-firing**, closed by a probe per direction rather than by a better grading.

**The cliff has three denominators and no document said which.** 613.6/8.7 is **71x**, 613.6/7.7 is
**80x**, 613.6/5.5 is **112x** — and Q186's row says 85x, `CLAUDE.md` 64x and `spec/` 71x, on the
third, second and first bases. All three are right and they answer three questions. All three bases
are now in section 3. [Q211](../questions/q211.md).

**And rule 8's re-run earned its place on a guard written to close a reader's finding.** The
replacement suite asserts *the ratio RISES with the arity*, and `paid / baseline > lowPaid / lowBase`
is satisfied by making the LOW baseline bigger — which is exactly what collapsing the low pair does.
**Collapsing it cost 0.** A guard on a difference needs both terms bounded, and both are now.

**`Owns` audit — 9 tracked files changed and 1 added, against a block of 4 paths plus section 1
rule 5's six record-step files. FOUR late exceptions, ZERO undeclared.**

| exception | why | forced? |
|---|---|---|
| `AGENTS.md` | it states the cost figures and the verdict, and both moved. **The second of the two files P13 line 181 named as its test** | **yes** |
| `spec/README.md` | `C8` makes the version row a consequence of any `spec/**` bump | **yes** |
| `test/definition/l4-corpus.test.ts` | its suite census is set equality **both ways**, so adding an L2 suite in `test/driver/` *forces* an edit in a file this item does not own. **W45's block, given to nobody by P13** — and Q102's ratchet working exactly as intended | **yes** |
| `scripts/check-docs.mjs` and `scripts/check-docs-selftest.mjs` | `X6` and its probes. **The THIRD of the three files P13 line 181 named** — and W45 did not need it, so P13's test is answered *yes / yes / yes* over the plan and *no* for W45 alone | no — taken on the adequacy reader's finding 7, at three copies of one number |

**And `spec/flow-definition.md`'s STATUS HEADER is outside the declared `section 3`**, which the
conformity reader noted: `Owns` says *`spec/flow-definition.md` section 3* and `C8` makes the header
a consequence of editing it. Recorded as a fifth exception in substance and a scoping defect in the
declaration — *an `Owns` line that names a SECTION cannot bound a document whose header is checked
against it.*

**So the answer to the test P13 set at its `Owns` note is `AGENTS.md` YES, `spec/README.md` YES,
`scripts/check-docs.mjs` YES** — all three, across the two items, exactly as P12's retro predicted
and refused to act on. **W45 took the first two and W46 took all three.** That is
[Q157](../questions/q157.md)'s row with two data points, and it is the retro's to judge.

**Census re-derived, CONFIRMED for the TWELFTH plan running.** 164 / 115 / 2 / 47 before this item's
rows and **169 / 120 / 2 / 47** after; 42 ids in both tables, unmoved; **169 of 169 in exactly one
cluster cell**. The parser was W45's, unchanged, and **aborted zero times** — the clause that was
wrong on its first run is in the register's own note now.

**What this taught.**

**A verdict can be right for a reason that is the negation of its own evidence.** Three of the four
reasons for *nothing warns* held; the second was inverted, and the measurement that inverted it was
two screens above it in the same document. *The showcase is expensive because a reference names a
NODE* — which is P13 fact 4, stated at the declaration, and the reason the item wrote was that the
showcase was cheap. **Only a reader re-deriving the evidence finds that**, and it is
[Q193](../questions/q193.md)'s finding for a decision that took no ADR.

**And a clock-free proxy for a cost has to be bounded in the direction the cost grows.** *N distinct
values received* is bounded above by N receivers, so it could not see a mechanism that copies twice —
the direction the whole item is about. The replacement is bounded by the fixture rather than by the
receivers, and the honest limit is written down: **the number of copies a driver MAKES is observable
to no test this repository can write.** [Q212](../questions/q212.md).

**Questions raised.** [Q208](../questions/q208.md)-[Q212](../questions/q212.md), five of the five
reserved. **[Q186](../questions/q186.md) is DECIDED and deliberately NOT closed**; **ADR 0043 is
SKIPPED and not reused**, on the P9/P11/P12 precedent for a reserved id.

| Q | |
|---|---|
| [Q208](../questions/q208.md) | a cost table taken in ONE process measures accumulation, not its own rows — and ordering costs nothing |
| [Q209](../questions/q209.md) | `ALL_CHECKS` was a closed allowlist, and a whole check id shipped ungraded behind it |
| [Q210](../questions/q210.md) | a check that reads a PATH instead of its subject — obligation (e)'s second question, caught by the author's own set for the first time |
| [Q211](../questions/q211.md) | the cliff has three denominators and no document said which |
| [Q212](../questions/q212.md) | a `Set` over what N receivers received cannot count the copies a mechanism made |

**Reader overlap: 2, and it is the TWENTY-FOURTH measurement** — derived by counting
`doc/workflow.md` section 6's own list (W4 … W43 = 22) and adding W45. Inside the settled 0-4 band,
**neither reader primed**. Their shared subjects were **the verdict's second reason** — the adequacy
reader from a measurement of the shipped showcase, the conformity reader from the *"only size-free
predicate"* being a universal claim tested on one candidate, and **both constructed the same second
predicate independently** — and **the *one copy outside a region* claim being true by construction**.
**Their split is again the one the two roles predict**: the conformity reader found **claims that were
false**, including the item's own headline method finding and four numbers; the adequacy reader found
**bounds that were not there**, and its ten survivors are loop bounds, list bounds and a proxy
bounded in the wrong direction.
