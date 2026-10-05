# W47 — The blocked flow on real workers

**Status:** done
**Plan:** [P13](../plans/p13-when-is-a-declared-reference-refused.md)

```
Spec:       none - this item writes no rule. FD-V29 and FD-C4 are W45's and
            section 3's cost verdict is W46's; this DEMONSTRATES them on a
            real scheduler, which is what an exit artifact does.
Owns:       examples/**
            (written from P13's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     P13's Exit: block, read from the PLAN's own file; W45's and W46's
            Records, for what each shipped and what each left; ADR 0042 rules
            1-5; spec/flow-definition.md v0.14 sections 3, 5 and 6 - the
            reference table, FD-V29, FD-C4 and FD-R3; examples/l6.ts's two
            `reference-if-it-ran` rows, which W45 added as a DECLARED LATE
            EXCEPTION on this item's tree and which this item inherits.
Outputs:    (1) The exit artifact: P13's flow end to end on a real
                `FyflowScheduler`, in BOTH L6 runtimes.
            (2) What reverting W45 costs, measured in L6 failures.
            (3) Whatever coverage the reference table's row count still owes
                at L6 - the `["n?"]` spelling, which no row exercises.
            (4) The exit artifact's own claim re-stated as a number: L6's
                assertion count and real-run count, both runtimes.
Depends on: W45 (FD-V29, FD-C4, the corpus flows) and W46 (the cost verdict)
Blocks:     nothing - P13's last item
Tests:      Ladder L6 is the test. Expected values from spec/ and from the
            worker roles' own declarations, never from output
            (doc/workflow.md section 5 rule 1). No new L1-L5 case is
            expected: the rules are asserted where they were written.
Gate:       L0, L1-L5 as a regression, L6 in BOTH runtimes, then the two
            spec-conformity readers, then rule 8's whole set re-run with the
            readers' edits checked in.
Reserves:   Q213-Q217, no ADR (P13 reserved 0042-0043 and both are spent -
            0042 taken by W45, 0043 skipped by W46)
```

## Scope

**In**

1. **P13's exit artifact.** *Route to review if an earlier step flagged it, and publish either way* —
   a reference to a value that only SOME paths produce — running end to end on a real
   `FyflowScheduler` in **both** L6 runtimes.
2. **What reverting W45 costs, in L6 failures.** P13's W47 row asks for the number, and W43's
   precedent is that a revert cost is an item's other declared output.
3. **The `["n?"]` spelling at L6.** W45 made `?` a modifier and left `examples/l6.ts`'s `forms`
   bucketing four-way; the two rows it added exercise the `suffix` bucket through the **`one`**
   spelling only, so the array spelling has never reached a real worker.

**Out** — named rather than left implicit, with where it goes instead

- **Any `spec/` rule.** An exit artifact writes no rule — W43's own stated result, and section 5 and
  section 6 are W45's.
- **[Q206](../questions/q206.md)** — the sibling-region visibility finding. It is a correctness
  question about `FD-C1`'s prefix predicate and P13 decision 1 forbids reopening the KEY.
- **[Q212](../questions/q212.md)** — whether a test can count the copies a driver makes. W46 recorded
  that it cannot, and L6 is further from that than L2 is.
- **[Q186](../questions/q186.md)'s cost at L6.** Wall time here is not reproducible
  ([Q179](../questions/q179.md)) and W46 measured what a one-process table costs; an L6 timing row
  would be the same defect on a slower rung.
- **A self-test for L6.** Proposed and refused twice — P11's for the gate and P12's for L6 itself.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, three runtimes | `npm run test`, `npm run test:deno`, `npm run test:browser` — **as a regression this item must not break** |
| **L6, BOTH runtimes** | `npm run test:l6`, `npm run test:l6:deno` — this is the item |
| static checks | `npm run check:source` (`S10`, and the gate chain), `check:scheduler` (`D6`, which binds both L6 rungs to `examples/l6.ts`), `check:markdown`, `check:docs` |
| conformity reader | fresh context, spec first and artifact second |
| adequacy reader | fresh context, in an isolated copy |
| rule 8 | the whole set at v0.13 — and **obligation (d) is the one that matters here**, because W23's adequacy reader deleted four L6 rows for one edited number |
| gate | `npm run gate`, `GATE EXIT=0` **and** zero lines beginning `FAIL` |

### What ran

| clause | | result |
|---|---|---|
| L0 | **RAN** | `deno lint` `Checked 48 files`; all five typechecks clean |
| L1-L5 | **RAN**, unmoved | **24 files / 656 assertions in ALL FIVE runtimes** — node 24.20.0, deno 2.9.6, chromium, firefox, webkit, each at parity with node. **Measured rather than inherited**: `npm run gate` runs three, so `npm run test:browser:all` was run for the other two, which is [W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md)'s and [W32](w32-what-a-map-fanout-is.md)'s precedent. The declared result — an exit artifact writes no L1 case |
| **L6, node** | **RAN** | **879 assertions over 40 real runs**, from 806 / 38 |
| **L6, deno** | **RAN** | **879 / 40**, identical |
| static checks | **RAN** | `check:source` 13/13, `check:scheduler` 7/7 (`D6` binds both rungs), `check:spec` 8/8, `check:markdown` 5/5, `check:docs`, `check:wiring`, `check:policies` all pass |
| conformity reader | **RAN** | **14 findings, 8 BLOCKING** |
| adequacy reader | **RAN**, in an isolated copy at `../fyflow-w47-adequacy` | **27 mutations, 13 real survivors, 6 BLOCKING** |
| rule 8 | **RAN TWICE** | author pass **31 / 24 caught**; after the readers **43 provocations, 33 CAUGHT, 7 declared survivors (all measured), 2 BOUND, 0 undeclared, 0 aborts, 0 wrong-reason** |
| census | **RAN** | **174 / 125 / 2 / 47**, 42 in both tables, 174 of 174 in one cluster cell, **0 aborts** on the final run |
| gate | **RAN**, green first time | `npm run gate` — **`GATE EXIT=0`, zero lines beginning `FAIL`**, 15 chain entries, `selftests` **521.3 s wall / 1032.1 s serial-equivalent over 5 lanes**. **The control is `W46`'s own clean run on the committed tree**, taken before any of this item's edits |
| [Q142](../questions/q142.md) | **RE-MEASURED and it does NOT fire** | On a scratch copy OUTSIDE the repository: whole tree **91 / 3842 / 197**, `doc/decisions` removed **69 / 3508 / 197**, both removed **55 / 2804 / 197**. So the windows are **`M3` `(69, 91]`** and **`M4` `(2804, 3508]`**, and the floors W46 retuned to **80** and **3080** sit inside both with 11 files and 276 links of headroom below. **W46 re-centred them deliberately so this plan's last item would not pay the same window twice, and that is what happened** — the first time in six retunes that the prediction *it will fire* has been checked and come back no |

## Record

**W47 is DONE and it is P13's EXIT ARTIFACT.** *Route to review if an earlier step flagged it, and
publish either way* runs end to end on a real `FyflowScheduler` in **both** L6 runtimes, and so does
a second flow this item's own reader built: a decision routing around a whole **map region**, where
the conditional ARRAY form resolves on one payload and is **`[]`** on the other. **L6 is 879
assertions over 40 real runs**, from 806 / 38. **`spec/` is unmoved at 7 documents, 43 examples, 89
rules** and **L1-L5 at 24 files / 656 assertions**, which is the declared result — an exit artifact
writes no rule.

**Its headline is that ladder L6 was BLIND to ADR 0042's headline for a whole item, and the reason is
structural.** Measured before this item's clauses existed: **deleting `FD-V29` cost ZERO L6
failures** — `806 assertions, 0 failed, exit 0`, against a clean control before and after — while
`FD-C4` cost 5 and the suffix going unparsed stopped the run from reporting at all. **Every reference
any L6 row runs is either `"."`, certain, or written with a `?`, because a row IS a run and a
document `FD-V29` refuses does not start.** A row for the refused document would be a row with no
run, no dispatch and no worker. *A rule whose whole effect is that a run never happens is invisible
to a rung made of runs* — [W35](w35-a-map-on-real-workers.md)'s *`N` too small completes and is
silent* one rule along, from the other direction. [Q214](../questions/q214.md).

**The scope is stated rather than generalised** (`doc/workflow.md` section 1 rule 5's writing
clause): **L6 was the only blind rung.** With `FD-V29` disabled, L1-L5 reports **7 failures** and
`check-docs` `X4` fails on `AGENTS.md`'s own executed snippet — so the GATE was never blind, and the
claim is about the rung rather than about the evidence as a whole. W47's conformity reader asked for
that clause.

**What reverting W45 costs, on the tree this item ships** — Output (2), and every number moved once
the readers were acted on:

| revert | L6 failures |
|---|---|
| `FD-V29` deleted — the bare form stops being refused | **3** (**0** before this item) |
| `FD-C4` deleted — a conditional reference resolves like an unconditional one | **9** (5 at the author pass) |
| `FD-C4`'s ARRAY arm alone — `t.form === 'all' ? [] : ABSENT` → `ABSENT` | **4** (**0** before this item) |
| the `?` left unparsed — `"n?"` stops being a reference | **the run does not report at all** — `InvalidDefinition`, `FD-V26` at `publish`, thrown at `Driver` construction |
| both of W45's rules at once | **12**, additive |

**Output (3) was answered with a measured ABSENCE and both readers took it apart, from opposite
ends.** The item recorded `["n?"]` as unreachable at L6 because *"a map region inside a branch the
run loses is a flow this repository does not have"*. Its **conformity reader** measured that false on
`nested-map.flow.json`, which this file already runs: `publish.needs.x = ["item"]` gives `FD-V29` and
`["item?"]` is ACCEPTED, and `map-in-fanout` in the normative corpus is a second instance — **both
named in ADR 0042's own seven-shape row.** Its **adequacy reader** measured the consequence:
`resolveReference`'s array arm, which is ADR 0042 rule 4's `[]` half, was **deletable for zero L6
failures** — and then **constructed the flow** that observes it. *Two readers, opposite ends, one
hole.*

**So the coverage is TAKEN rather than recorded as absent, and it took two forms.** `nested-map`'s
`publish` gains `needs: {"own": ".", "scores": ["item?"]}` — the fifth spelling on a flow already
running, with `own` carrying the collection that row has always asserted — and
**`map-past-a-decision.flow.json`** is new: `map-over-region-output` plus one guarded edge, which is
the whole difference. There `rank`'s `["score"]` is certain and `FD-V29` is silent; here a run can
reach `rank` without `score` having run, so **all three of section 3's axes decide one reference** —
without the suffix `FD-V29`, at the one form `FD-V28`, as written accepted. Its two rows are the pair
*the array RESOLVES* against *the array is `[]`*: on the second, `over` names an empty array and the
run folds to **`stuck`** with one task dispatched, which is [W33](w33-a-map-at-run-time-arity.md)'s
N = 0 ruling **reached for the first time by a REFERENCE rather than by a worker returning an empty
list.** *One row where `[]` and absent are two different run outcomes*, which neither of W45's rows
can say. **Every expected value was written from `spec/` and from the worker roles' declarations
before the first run, and all fourteen assertions passed first time.**

**v0.13's three changes were each instantiated DELIBERATELY, and the retro is owed a verdict on all
three.**

| change | what it found here |
|---|---|
| **(e)'s THIRD SHAPE — a LIST is a claim about another list** | Instantiated on four lists: the pool registry in `examples/run-flow.ts`, `ROLES`, `run()`'s switch arms, and the workerTypes the 18 L6 documents name. **Measured first: all three pairs agree in both directions and no defect is live** — a bound with no live case, taken because `examples/workers/flow-worker.ts`'s own header records the `ROLES` → switch comparison as costing **zero**, which is [Q196](../questions/q196.md)'s *a type closes one direction only* in the direction W43's `Role` type cannot reach. `'zzz'` in `ROLES` now costs **2**, an arm nothing declares **1**, a pool no document names **1**. **And its stated defence was FALSE** — see below |
| **(c)'s LIMIT — count the observers** | Two instances, and both were needed. The `FD-V29` refusal has **two** observers, the finding's `rule` and its `detail`: stripping `"review?"` from the message leaves the rule id firing and costs **1** on the second observer alone. And `spellingOf` is shared by both sides of the spelling comparison, so the **count** clause is the second observer over the normaliser — collapsing it costs **2**. **Then the adequacy reader found the limit unmet in three more places**, which is the verdict |
| **the fourth requirement on the SET — a PAIR's difference is a claim** | Three pairs. `(RIR, bare)` differ in one character and the difference is asserted by restoring it and comparing byte for byte (`1` and `2` failures); the LOW/HIGH `reference-if-it-ran` pair is W45's and costs **5**; the new `map-past-a-decision` pair is asserted by its payloads and its two outcomes |

**Its conformity reader found FOURTEEN things, EIGHT blocking, and the two sharpest are about the
harness rather than the artifact.** (1) A declared **ceiling** whose stated reason was false: the
`FD-V29` pair's registry *is* a source both assertions read — a literal missing `AttestWorker` takes
the refusal set to `["FD-V29","FD-V5"]` and the control from 0 to 1 — and the probe survived only
because the literal it substituted was **set-equal to the derived value**, which is W17's vacuous
probe verbatim. (2) **The harness ran NOTHING for its five `SURVIVOR (declared)` rows**: with
`red: []` the command list was empty and the verdict restated the declaration, in 0.26 s against
3.4 s for a real probe — [Q151](../questions/q151.md)'s shape one obligation across, and **it is what
hid (1)**. Ceilings are now MEASURED and the measurement is printed beside them, **and closing that
found five more defects in the same pass** — three stale `says` substrings, one ceiling that was
really a catch, and one whose measurement belonged to a different command.

**Six more of its findings were claims that were false, and five of the six were COUNTS in files this
item owns.** `FD-V16` cited twice for the workerType rule, which is `FD-V5`; *"W43 recorded that two
of the three comparisons cost zero"*, which W43's Record and Q196 record as **one**, with the other
direction explicitly closed by a type; `spec/runtime-targets.md` section 1 cited for *"both publish
`./index.ts` and nothing else"*, which that table says of neither half — the conclusion survives on
the manifests themselves and its stated evidence did not; and **seven stale counts** — *"EIGHT
roles"*, *"nine pools"*, *"nine call sites naming eight roles"*, *"`TS2345` naming all eight"*,
*"the eight `config: { role }` literals"*, *"the THREE reference forms"* and *"18 since W35"* three
lines above a constant reading 53. **W47's own new clauses compute all three of those lists
correctly**, so the prose was wrong beside code that was right — and the counts are now a
**sequence** rather than a latest value, so the next item appends.

**And one was a measurement not re-taken on the tree the item ships**, which is v0.12 change 2 firing
on the paragraph that is a clause's whole evidence: *"left both L6 rungs at 818 assertions, nothing
noticed"* was true of a tree before this item's own last two assertions existed. Re-taken: on the
shipped tree that edit leaves `check-source` at `All checks passed`, `deno lint` and both typechecks
clean, **and the clause red**, naming `./l6.ts`.

**Its adequacy reader ran 27 mutations, found 13 real survivors and SIX blocking, and its central
finding is [W23](w23-a-nested-flow-on-real-workers.md)'s at its THIRD iteration.** Deleting all of
W47's cross-row work took **two integer edits and one import line**, and L6 came back at **806
assertions / 38 real runs, 0 failed** in both runtimes with all five checks at exit 0 — *exactly the
pre-W47 numbers* — and each of the three blocks was separately deletable the same way. **W35 answered
the ROW half with `ROW_KEYS`, set equality and order, so a deleted row fails naming itself; there was
no analogue for the CROSS-ROW layer**, which is where three consecutive items have put their whole
output. **`CROSS_ROW_SUBJECTS` is that analogue** — one substring per cross-row block, required to
have been emitted, so the same deletion now costs 1 and **says which subject left**. The regress
moves rather than closing, and that is stated: the list is a literal, so a block and its subject are
two edits in one diff, which is `ROW_KEYS`' own limit and [Q102](../questions/q102.md)'s shape.
[Q217](../questions/q217.md).

**Two more of its blocking findings are obligation (c)'s LIMIT unmet in the block that names it by
id.** The three-list block's header claimed *"each clause is also the OTHER two's evidence that the
extraction worked"*; sourcing `poolRoles` from `declaredRoles` costs **0**, and the compound — a role
declared with an arm and no pool, the one direction those clauses exist for — comes back **green**
where the real source costs 1. The claim is true only of an extraction returning NOTHING, which the
`nonEmpty` guards throw on. **It is recorded as a limit rather than repaired**, because the second
observer would have to be a second DERIVATION and the only one available is a second regex over the
same text — *a sensor corroborating itself*. [Q216](../questions/q216.md), and it is
[Q212](../questions/q212.md)'s shape one item on.

**Its fourth was a DETECTOR with one observer and no case that made it fire.** Neutralising the
reach-past-`index.ts` regex — `src` to `zzz` — cost **zero**, and the compound came back green in
both runtimes with `check-source`, `lint` and both typechecks at exit 0. **Closed with a positive
case checked in**, three strings that must and must not match — and **the fixture had to be assembled
from parts**, because written as literals it made this file its own offender and the clause failed
naming `./l6.ts`. *A detector's positive fixture cannot be written in a file the detector reads.*
Its companion clause also read the **listing** rather than what was **opened**, so a narrowed read
loop skipped the one file the clause was written against; the sweep now returns both lists and
compares them.

**Rule 8 ran TWICE — 31 / 24 in the author pass, and 43 provocations / 33 CAUGHT / 7 declared
survivors / 2 BOUND / 0 undeclared / 0 aborts / 0 wrong-reason after**, with **seven of the readers'
exact edits checked back in** (v0.8 change 2). **The re-run earned its place three ways.** The
adequacy reader's whole-layer deletion now costs 1 and names its subject; its `FD-C4` array-arm
deletion now costs 4; and **a probe of the author's own was WRONG-REASON for a reason that was a
defect in the artifact**: removing `nested-map`'s reference made L6 **crash** on an unguarded
dereference rather than fail an assertion — a crash reading as a detection, v0.10's own requirement
on the set, fixed in the code and now costing 3. **A second probe was vacuous in exactly the shape
the conformity reader had just found**: it stubbed one line and left the block running.

**The census is CONFIRMED for the THIRTEENTH plan running — 174 questions, 125 open, 2 deferred, 47
resolved**, 42 in both tables, **174 of 174 in exactly one cluster cell, 0 aborts** on the final run.
Five new ids, none resolved, which is what an exit artifact looks like in the register.

**The parser was written FROM SCRATCH from the register's own note, and it was wrong in THREE
directions before it was right — none of them a direction the note carries.** It aborted on all
**42** ids that appear in both tables, reading clause 1's *counted ONCE* as an error where the note
records the overlap as a figure. It flushed a row at the first non-pipe line, so **Q87**'s five-line
row read as **2 columns** — Q87's own recorded abort, reproduced by a new parser. And it read *cell-
bearing line* as *a line that STARTS with a pipe*, where Q87's status and owner sit on a line that
starts with prose; corrected to *contains a pipe*, with the width check restricted to a row whose
first line both opens and closes with one, which is the resolution Q87's row states.

**And it found a real defect in the file: [Q204](../questions/q204.md)'s row rendered wrong.** Its
text carried `` `\| Cluster \| Q \| Why it is grouped \|` `` with four **unescaped pipes inside a
code span**, so GFM cut the row into eight cells. [Q131](../questions/q131.md)'s two rows are
**outside** code spans and [Q135](../questions/q135.md) records Q87's as a different mechanism
entirely, so this is the **fourth** row and the **third distinct cause**. The row is W45's, one item
old, and it is *about a census parser*. **Fixed in place** — and
**[Q215](../questions/q215.md), the row raised to record it, REPRODUCED THE DEFECT ON ITS FIRST
WRITE**, aborting the parser at 9 columns before it was ever rendered. *A row describing a defect
carrying it, for the third time in this repository.*

**`Owns` audit — 11 tracked files changed and 2 added, against a block of ONE path plus section 1
rule 5's six record-step files. ONE late exception, ZERO undeclared, and it is the LOWEST of any
product item in three plans.**

**Four files are `examples/**` and are owned**: `l6.ts`, `run-flow.ts`, `workers/flow-worker.ts`,
`flows/nested-map.flow.json`, plus `flows/map-past-a-decision.flow.json` added. **Six are section 1
rule 5's record step and are not exceptions** — this file, the plan's Record, `doc/README.md`,
`CLAUDE.md`, `README.md`, `doc/open-questions.md` and **`doc/decisions/**`**, which v0.7 change 3
added *"so a demonstration could correct the decision it demonstrates"* and which
[W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is the precedent for. **ADR 0042's
Consequences gain that two of its own seven shapes now run on real workers and that rule 4's ARRAY
half had no observer anywhere before these rows; no rule changed.** *(This table listed that ADR as a
late exception before the list was re-read; it is a record-step file, and the count was TWO for as
long as it took to check. Section 1 rule 5's provenance clause — any copy including your own.)*

| exception | why | forced? |
|---|---|---|
| `spec/README.md` | its flow-definition **v0.14 row carried FOUR claims W46's own two readers had withdrawn** — *there is no channel*, *~1% of the clone*, *2.5x in run position*, and Q22 cited for the threshold — in a cell `C8` does not compare, so **the index contradicted the document it indexes on precisely the four things that had just been corrected.** Found by this item's conformity reader | no — a false claim in a normative index, corrected under v0.7 change 4's own argument, and the same file W45 and W46 both took |

**And the answer to the test P13 set is ONE OF THREE, which is the third data point.** W47
pre-declares none of `AGENTS.md`, `spec/README.md` or `scripts/check-docs.mjs` and took
**`spec/README.md` only** —
so over the plan the tally is `AGENTS.md` **yes / yes / no**, `spec/README.md` **yes / yes / yes**,
`scripts/check-docs.mjs` **no / yes / no**. **Only `spec/README.md` was taken by all three**, and an
`Owns` pre-declaration rule would have predicted the other two wrong twice each.
[Q157](../questions/q157.md), for the retro.

**Questions raised.** [Q213](../questions/q213.md)-[Q217](../questions/q217.md), five of the five
reserved. **No ADR** — 0042 is W45's and 0043 was skipped by W46; both are spent and neither is
reused.

| Q | |
|---|---|
| [Q213](../questions/q213.md) | a check that lives inside the thing it checks, because `scripts/**` is in nobody's `Owns` |
| [Q214](../questions/q214.md) | a rule whose whole effect is that a run never happens is invisible to a rung made of runs |
| [Q215](../questions/q215.md) | a fourth register row rendering wrong — unescaped pipes INSIDE a code span, and the row raised for it carried the defect |
| [Q216](../questions/q216.md) | three lists compared pairwise both ways still have one observer per pair, and a source swap defeats all three |
| [Q217](../questions/q217.md) | `ROW_KEYS` has no analogue in the cross-row layer, and the analogue this item built is a literal |

**Reader overlap: 2, and it is the TWENTY-FIFTH measurement** — derived by counting
`doc/workflow.md` section 6's own list (W4 … W43 = 22) and adding W45 and W46. Inside the settled 0-4
band, **neither reader primed**. Their two shared subjects are **the `["n?"]` absence and its stated
reason** — the conformity reader from the document (`nested-map` is that shape and is a row here) and
the adequacy reader from the consequence (rule 4's array arm deletable for zero), **arriving at the
same fix from a claim and from a mutation** — and **obligation (c)'s LIMIT in the three-list block**,
one reading the docblock's argument and the other measuring the compound. **Their split is again the
one the two roles predict**: the conformity reader found **claims that were false**, five of its
eight blocking findings being counts; the adequacy reader found **bounds that were not there**, and
every one of its six is a loop bound, a list bound or a detector with one observer.

**`npm run gate` is** — see the row below.

**Routing cases this item touches** (`doc/workflow.md` section 5's checklist): **no matching decision
edge (Q10)** is not applicable; a **decision** is the whole of the exit artifact and both of its edges
are exercised by the pair; a **branch routed away from its join (Q4)**, **`user_action` (Q17)**, a
**duplicate task id (Q13)** and a **nested fan-out (Q6)** are all already at L6 from earlier items and
are run here as regressions rather than added to.

