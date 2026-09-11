# W55 — A run at scale, on real workers

**Status:** done
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

```
Spec:       none - this item asserts what W53 and W54 decided, on real workers
Owns:       examples/**
Inputs:     P15 facts 3 and 5, read from the PLAN's own file and RE-RUN from
            dev-dist/p15/scale.ts rather than transcribed. W53's ADR 0046 and
            W54's Q22 decision. The L6 harness in examples/run-flow.ts, and
            Expectation's knobs (joinSettledBy, unorderedDispatch).
Outputs:    (1) P15's EXIT ARTIFACT - what ONE run holds on a real
                FyflowScheduler, before and after W53, in BOTH L6 runtimes
            (2) the extrapolation to P15 fact 5's table, with its METHOD, its
                SCOPE and BOTH observers named
            (3) what reverting W53 costs, in MiB and in L6 failures
            (4) the harness checked in, so the number can be re-taken
Depends on: W53, W54
Blocks:     nothing
Tests:      expected values from ADR 0046 and from spec/, written BEFORE the
            first run. A footprint is reported; what is ASSERTED is the
            relation - that the cleared structure is empty after the join, and
            that the run's outcome and every task id are unchanged by the
            clear. A number nobody can re-take is not evidence.
Gate:       L0-L6, then spec-conformity pass (two readers)
Reserves:   Q243-Q247, no ADR
```

## Scope

**In**

1. **The exit artifact, and it is a MEASURED NUMBER rather than a flow.** P15 decision 3, on a
   measurement: `npm run test:l6` is **4236 ms for 42 real runs**, ~101 ms each, so the scale this
   plan is about cannot be a rung inside `doc/workflow.md` section 8's 90 s budget by two orders of
   magnitude. **What runs on real workers is one run measured honestly; what is extrapolated is said
   to be extrapolated.**
2. **Both L6 runtimes.** Node and Deno, as every exit artifact since P2. A footprint measured in one
   runtime is a claim about one runtime.
3. **Both observers.** `v8.serialize(...).length` over the driver's own structures in one call, and
   `process.memoryUsage().heapUsed` after a forced `gc()`. P15 fact 5 has them agreeing within 3% at
   the large sizes; **a sensor cannot corroborate itself** (v0.13 obligation (c)'s limit) and this
   item is where that matters most, because the number is the deliverable.
4. **The revert cost, in two units.** What reverting W53 costs in **MiB** (the point of the change)
   and in **L6 failures** (the rung). P15 fact 3 says the second is **0** before this item —
   [Q214](../open-questions.md)'s shape from the removal side, and prediction 4's subject.
   **If this item can move that number above zero, it has written the rung nobody had**; if it cannot,
   it says so, which is what Q214's row asks a second instance to establish.

**Out** — named rather than left implicit, with where each goes instead

- **A rung, or a row in section 8's budget table.** P15 decision 3 refuses both on a measurement, and
  both are on the plan's stop-and-ask list. This item **reports**; it does not add a level.
- **Ten thousand real runs.** Fact 5's top row is an in-process L2 measurement of 10 000 `Driver`s;
  at L6 that would be ~17 minutes of real workers. The extrapolation is stated **as** an extrapolation,
  with the per-run number that real workers produced beside it, and the two are never added.
- **Any decision.** ADR 0046 is W53's and Q22 is W54's. An exit artifact demonstrates decisions other
  items took — which is what [W43](w43-the-two-blocked-flows-on-real-workers.md)'s Record calls *what
  an exit artifact looks like in the register*.
- **Changing what a run retains.** If the real-worker measurement disagrees with W53's, that is a
  finding for the plan's Record and for W53's file under section 6 pass 3 rule 6 — not an edit this
  item makes to `src/`.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck` — `examples/**` is in `lint`'s directory list and in `tsconfig.examples.json`, and `D6` binds that both ways |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, unmoved. **`examples/**` is deliberately not under `test/**`**: the browser bundle globs `test/**/*.test.ts` and anything importing a scheduler there would be bundled for a runtime L6 does not run in (`RT-R10`) |
| L6 | `npm run test:l6` **and** `npm run test:l6:deno`. `D6` binds each rung's runtime, its resolution **and its argument** — [W35](w35-a-map-on-real-workers.md)'s finding, which is why pointing a rung at the wrong file is no longer free |
| conformity reader | spec first, code second. **Its copy is taken with the author's tree HELD STILL** (section 6, v0.15): W51's reader caught `examples/l6.ts` at six digests and one live rule-8 probe, one snapshot RED on correct code |
| adequacy reader | **in an isolated copy**, and its central question here is [W23](w23-a-nested-flow-on-real-workers.md)'s at its fifth iteration — **what does deleting this item's rows cost**. A row whose property is carried by a literal is W51's four survivors; a cross-row clause is **computed from the row definitions and from the folded run**, never declared as a fourth list |

**Routing coverage**: a branch routed away from its join ([Q4](../open-questions.md)) and a nested
fan-out ([Q6](../open-questions.md)) are both covered, because W53's never-fires case is exactly a
region that holds arrivals forever and both shapes produce one. `user_action`
([Q17](../open-questions.md)) is covered by an existing L6 row this item must not break. A duplicate
task id ([Q13](../open-questions.md)) and no matching decision edge ([Q10](../open-questions.md)) are
**not applicable**.

**Before this item is done it greps the tree for `W55`** outside `doc/` — section 1 rule 5's third
direction. *(This said it returns **0** hits at the declaration and it returned **1**, `CLAUDE.md`'s
*"W55 has not started"*; at the commit this item started from it is **4** — `CLAUDE.md` x3 and
`README.md` x1, every one of them that sentence, and every one false the moment this item shipped.
**The claim about the obligation was wrong and the obligation itself was right**, which is the
cheapest possible demonstration of why it is a grep rather than a memory. W55's conformity reader;
re-run at the record step and the four are corrected there, which the record step's own list
permits.)*

## Record

**Gate — what ran.** Every rung's verdict is its command's EXIT CODE (`doc/workflow.md` section 4,
v0.15); the counts beside them are the secondary signal. **Every number here was re-taken on the tree
this item ships**, which is section 1 rule 5's WHEN clause.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN — green** | `npm run lint` exit 0 (52 files), `npm run typecheck` exit 0. `examples/retention.ts` is covered by these two and by nothing else, which is stated in its own header |
| L1-L5 | **RAN — green, unmoved** | **27 files / 703 cases** in node 24.20.0, deno 2.9.6, chromium, firefox and webkit. `npm run test:browser:all` judged by **`BROWSERS EXIT=0`**, never by a grep for its count line — W54's trap, and this item's Verification table quotes the clause |
| L6 | **RAN — green** | **1061 assertions over 42 real runs**, from 942 / 42, in **both** runtimes. The run count does not move: P15's exit artifact is a MEASURED NUMBER and this item adds no row and no flow |
| conformity reader | **RAN** | **13 findings, 3 blocking** |
| adequacy reader | **RAN** | **41 mutations, 19 survivors, 6 blocking**, in an isolated worktree at `../fyflow-w55-adequacy` with copied `node_modules`, zero links and zero reparse points, verified green before it started and left restored to clean |
| rule 8 | **RAN, twice** | author pass **30 probes / 18 caught / 12 declared ceilings / 0 aborts**; re-run with the readers' sixteen exact edits checked in as probes `r1`-`r16` — **46 probes / 34 caught / 12 ceilings / 0 aborts / 0 against declaration**. Every file compared back byte-identical after every probe |
| `npm run gate` | **RAN — `GATE EXIT=0`, zero lines beginning `FAIL`, 15 chain entries** | taken with the tree HELD STILL: the digest before and after is identical |
| re-run at `cbb006a` | **RAN** | the rule-8 set, both L6 rungs, both `retention.ts` modes and the revert probe, all after acting on the readers |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1) what ONE run holds, before and after, in BOTH L6 runtimes** | yes — `examples/retention.ts`, byte-identical output in node and deno | Neutering the end-of-run observer costs **6** at L6; sampling the peak after the join instead of at every input costs **27**; collapsing `endByRegion` to one key costs **3**; walking only the first region costs **3** |
| **(2) the extrapolation, with METHOD, SCOPE and BOTH observers** | yes — `retention.ts`'s header states the walk's universe, the one-call rule and the reconstruction; `scale` reports both observers | Making the serializer unavailable, dropping the `extra` list, emptying the peak snapshot, never handing the driver back, or disabling observer 2 while it is available each cost **exit 1** from the harness. Truncating the sweep to one row costs exit 1 |
| **(3) the revert cost in MiB and in L6 failures** | yes, both columns, in the plan's Record and below | It is a number rather than a clause, and that is stated: what makes it re-takeable is `dev-dist/p15/scale.ts` for the MiB and the rung itself for the failures |
| **(4) the harness checked in** | yes — `examples/retention.ts`, plus `Retention` on every `RunReport` | Renaming its import costs **exit 2** at L0. Its own predicate returning early costs **1** at L6, because `examples/l6.ts` gives the detector a positive case |

### The number this item exists to produce

**What ONE run holds, on a real `FyflowScheduler`, in both L6 runtimes — `map-alias`, arity and
result size both from the data:**

| arity | result KiB | held at end | the collection it released | held BEFORE W53 | excess over after | of the whole |
|---|---|---|---|---|---|---|
| 2 | 1 | 8.1 KiB | 2.1 KiB | 10.1 KiB | 25.7% | 20.4% |
| 4 | 1 | 15.1 KiB | 4.1 KiB | 19.2 KiB | 27.3% | 21.5% |
| 4 | 16 | 195.1 KiB | 64.1 KiB | 259.2 KiB | 32.9% | 24.7% |
| 16 | 16 | 777.5 KiB | 256.4 KiB | 1033.9 KiB | 33.0% | 24.8% |

Every row: collected exactly the arity, holds **0**, and **0** held values alias a log record's own
result. **Node and Deno print the same table to the byte.**

**The extrapolation, stated as one.** P15 fact 5's table, re-taken rather than transcribed — the
*after* column on this tree and the *before* column with the two `releaseArrivals` calls reverted,
restore asserted by digest:

| runs x arity x result | before | after | heapUsed before / after |
|---|---|---|---|
| 1 000 x 4 x 1 KiB | 10.2 MiB | **6.2 MiB** | 16.2 / 11.9 |
| 10 000 x 4 x 1 KiB | 101.8 MiB | **62.1 MiB** | 154.5 / 111.1 |
| 1 000 x 10 x 16 KiB | 317.4 MiB | **161.1 MiB** | 325.3 / 167.8 |
| **10 000 x 10 x 16 KiB** | **3174.8 MiB** | **1610.9 MiB** | 3244.8 / 1670.5 |
| 1 000 x 50 x 16 KiB | 1584.9 MiB | **803.0 MiB** | 1603.4 / 816.9 |

**Every figure reproduces P15 fact 5 to the decimal, in both directions.** Its scope is stated: this
is `dev-dist/p15/scale.ts`, N `Driver`s in one process over a stub scheduler, which is an L2-shaped
run. **The two observers agree within 1.7-4.2% at the large sizes** — P15 said *within 3%*, and 4.2%
at `1000 x 10 x 16` is outside that; the serializer reads low at the small sizes, which is what
per-object overhead predicts.

**And at this rung, on real workers, the same measurement at a larger N**: 100 / 400 real runs hold
**1.5 / 5.9 MiB**, and the per-run figure is flat at **15.0-15.1 KiB over a sixteenfold range of N**
in both topologies. That is the anchor the extrapolation multiplies, and the two are never added.

**(3) What reverting ADR 0046 rule 3 costs.** **In MiB**: the *before* column above, up to
**3174.8 → 1610.9 MiB** at ten thousand concurrent runs. **In L6 failures: 29, in both runtimes** —
and **0 before this item**, measured on the commit it started from against a clean control both
sides. **The 29 decomposes as 23 DISTINCT ROWS, one failure each, plus six cross-row clauses** — not
one stopped run with knock-ons, which is W51's finding checked rather than assumed. L1-L5 is **8**
either way, all in `test/driver/retention.test.ts`. `examples/retention.ts` exits **1** in both modes.

**What broke.**

**THE PREDICTION REVERSED, AND THE REASON IS NARROWER THAN THE PREDICTION.** P15 prediction 4 says
this plan supplies [Q214](../open-questions.md)'s third instance from the removal side: *fact 3's
clear costs 0 at L1-L5 and 0 at L6, so a rung made of runs cannot see a whole structure leave.* Its
stated reversal was *W55's exit artifact finding a rung that DOES see it — most likely by asserting
the footprint itself*. **A rung does see it, 0 → 29, and NOT by asserting the footprint.** The bytes
are reported and never asserted ([Q179](../open-questions.md)); what moved the number is the
RELATION, and what makes the relation observable is a **reach past the reported surface** into the
driver's own `arrivals` — [Q233](../open-questions.md)'s subject. **The half of Q214 that survives is
the half that matters to a consumer**: the outcome, every task id, the log, the fold and every
callback are byte-identical with the release and without it, which is exactly why the release was
safe to make. *A rung made of runs cannot see this through anything a run REPORTS; it can see it by
not being made only of what a run reports.*

**THE OBSERVER MEASURED ITS OWN INSTRUMENT, AND ONLY THE SECOND OBSERVER COULD SEE IT.** The peak
sampler keeps a snapshot of the arrived payload OBJECTS; that snapshot is closed over by
`samplePeak`, `samplePeak` is reachable from `onFoldInput`, and `onFoldInput` is on `driver.opts` —
which the byte walk skips **by name**. So observer 1 could not see it and observer 2 could: under
`keepDriver` every kept driver transitively retained **a second copy of the very collection ADR 0046
releases**. Measured at `scale 50 16 16 own`: **141.9 MiB as shipped against 129.4 MiB with one
`peakSnapshot.clear()`**, which is 256 KiB a run — exactly one collection each, 9% of the figure
being reported — and confirmed at a second scale, `scale 400 4 1` going 61.9 → 60.3 MiB, which is
1.6 MiB for 400 collections of 4 KiB. **Scope In 3 says *a sensor cannot corroborate itself* and
*this item is where that matters most*, and the second sensor was measuring the first one's
instrument.** W55's conformity reader.

**THE BYTE OBSERVER — THIS ITEM'S WHOLE DELIVERABLE — WAS BOUND BY NOTHING, THREE SEPARATE WAYS.**
W55's adequacy reader: making the serializer return `null` (every column `n/a`), adding a second
`continue` inside the walk (777.5 KiB → 0.6, and the ratio the file states → 44811.3%), and emptying
the `extra` list (the collection column → 0.0) each cost **0 failures, 1050 assertions, exit 0** in
both runtimes with lint and typecheck clean. **The cause is that `walkOf` and `retainedBytes` were
two expressions over one literal and only `walkOf`'s output reached an assertion** — adding
`'arrivals'` to `NOT_RUN_STATE` was caught and skipping it one line down was not. `retainedBytes`
takes its key list **from `walkOf`** now, and `violations()` gained three clauses that are RELATIONS
rather than figures: **this rung has a serializer** (both L6 runtimes carry `node:v8`), **the
reconstruction exceeds the end**, and **what a run holds cannot be smaller than what it released**,
because a collection is a SUBSET of what `inputs` holds. The last is what catches a walk that stopped
walking, and it needs no constant.

**AND THE SENSOR COULD BE EMPTIED, TWICE.** `peakAliasingLog` is the size of an INTERSECTION, so `0`
is what a real second copy gives and what an empty observer gives: `loggedResults` returning `[]`
cost **zero**, leaving twenty-six assertions of `JP-R12`'s second-copy claim comparing against an
empty `Set`; and storing an **empty** map at the peak cost zero too, and left the reconstruction
*strictly larger* than the end because an empty map is still a few bytes. Both closed by putting the
OTHER side's size in the assertion — `loggedResults` and `snapshotEntries`, two counts of one thing.

**THE ITEM'S HEADLINE NUMBER RESTED ON ONE `check` CALL THAT THREE INTEGER EDITS REMOVED.** Deleting
it and editing `PER_REGION_ROW`, `PER_PLAIN_ROW` and `DECLARED_TOTAL` left **1012 assertions, 0
failed, exit 0** — after which reverting ADR 0046 rule 3 cost **2 instead of 25**. *Three integer
edits took "the rung Q214 said nobody had written" back to almost nothing, and nothing named what had
left.* **That is [W23](w23-a-nested-flow-on-real-workers.md)'s finding at its FIFTH iteration**:
`ROW_KEYS` names rows, `CROSS_ROW_SUBJECTS` names cross-row blocks, and nothing named a per-row
assertion. `PER_ROW_SUBJECTS` is the analogue — **a literal subject with a DERIVED count** — and it
is bound **both ways**, because every per-row assertion W55 adds begins with the rule it is about, so
a subject deleted with its clause leaves its own labels uncovered. **The cross-row layer's own
version of that hole is a declared ceiling and could not be closed the same way**, because cross-row
labels are prose continuations of each other and share no such handle ([Q217](../open-questions.md)).

**THE CLAUSE RECORDING THE TWO RELEASE MOMENTS THIS RUNG CANNOT REACH WAS RIGHT BY ACCIDENT, AND BOTH
READERS FOUND IT.** `Expectation.regionId` is **optional** and most rows leave it out, so
`e.regionId === fanoutId` was false for `all-exit / live-token-requiring-arrival` — the row the clause
is most about — and the lookup returned `undefined`, reading *no arrivals recorded* for a reason that
was a property of what the row had not written down. Three separate edits then cost zero: emptying
the `unsatisfiable` list, falsifying the `stoppedBy` filter, and making the lookup return `undefined`
outright. The region id falls back to the **flow's own** through the shipped `allRegions` now, the
pairs are COUNTED before they are reported absent, and every one must have resolved.

**AND MY OWN REVERT PROBE FOUND A CRASH WHERE A FAILURE BELONGED.** With rule 3 reverted no run
released anything, so the block that gives the reporter's predicate its positive case dereferenced an
`undefined` and took the whole rung's report down with a `TypeError` **before any of the real
failures could be read**. That is v0.10's *a provocation is evidence only when it fires FOR THE
REASON IT NAMES* firing inside the item that quotes it. Guarded with an assertion rather than a `!`.

**Three more claims of mine were false and are corrected in place.** `examples/retention.ts`'s header
said observer 2 was *noisy*, that the file *measured* a one-run noise floor, and that the artifact
printed `n/a` for one run — **all three false**: nothing called it from `artifact()` at all. Measured,
one run reads **0.7 MiB on 5 of 5 consecutive readings** against the driver's own 15.0 KiB, so it is
not noisy but **dominated by fixed process overhead by a factor of about 47**. `examples/README.md`'s
new parenthetical said the page had read *760 / 36 until W55*; it read **942 / 42**, in a cell two
rows below the sentence that was wrong — so a correction was written up as though the page's other
half had been right, which is the class that cell's own parentheticals record three times.

**What this taught.**

**A RATIO IS A CLAIM ABOUT A DIVISOR, AND THIS REPOSITORY QUOTED THE WRONG ONE IN FOUR DOCUMENTS.**
P15 fact 3's **49.8%** is the collection's share **of the pair** — what `dev-dist/p15/facts.ts` prints
and labels *"of the pair"* — and the derived sentence in ADR 0046, in P15's fact 3, in `CLAUDE.md` and
in `doc/README.md` reads *"exceeds `bytes(inputs)` by 49.8%"*, which is **+99.2 to +99.4%**. Wrong by
a factor of two, and wrong in the direction that **understates** the saving. The headline — *half of
what a region-bearing run holds is a second copy* — is the share-of-the-pair reading and is right, as
are `JP-R12`, W53's own file and [Q19](../open-questions.md)'s resolved row. **It was found by
re-running fact 3's own harness with the release reverted rather than transcribing its number**, which
is the `Inputs:` line doing the job it has now done in every item of this plan.
[Q243](../open-questions.md), which also records the second half: **neither ratio is a constant**,
because the divisor is *one copy per settled result* and is therefore a property of the FLOW as well
as of the payload — **+97.5%** with no node after the join, **+49.3%** with one that echoes the
collection, **+33.0%** on the flow this rung measures. That is [Q240](../open-questions.md)'s lesson
with a second variable in it.

**THE SCALE TARGET RUNS ON REAL WORKERS, AND THE TOPOLOGY THE REFERENCE RECOMMENDS IS THE EXPENSIVE
ONE.** N concurrent runs on ONE shared `FyflowScheduler` is **O(N²)** in wall time — 115 / 277 / 884 /
3304 ms at N = 100 / 200 / 400 / 800 — and super-linear in heap, where N runs on their own schedulers
are **linear**: 108 / 183 / 313 ms. **The driver's own share is linear in both**, 15.0-15.1 KiB a run,
so the super-linearity is the topology's and not `RN-R13`'s. The mechanism is nobody's defect: every
settlement on a shared scheduler reaches **every** driver's listener and `ID-R4` tier 1 drops the ones
that are not that run's — [ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
working exactly as written, N times per settlement. **P15 fact 5's table cannot see it**, because it
gives each of its ten thousand drivers its own stub. [Q244](../open-questions.md).

**AND A RUN'S FOOTPRINT IS NOT ONLY THE DRIVER'S.** `scheduler.tasks` holds **six tasks a run** beside
everything `RN-R13` names, and **`v8.serialize` REFUSES a `FyflowTask`** — so this repository's own
observer cannot price the other holder. That is `OR-R11`'s sentence arriving from the far side, *a
result is a VALUE, not an OBJECT*, applied to the scheduler's own objects rather than to a worker's
return. [Q245](../open-questions.md).

**A PER-UNIT COST IS QUOTING THE UNIT ITS HARNESS USED.** P15 decision 3 refuses a rung on the ground
that L6 is *~101 ms per real run*. Re-measured, 4286 / 42 = 102 ms — and the divisor is a **ROW**:
each `EXPECTED` entry builds a ten-pool scheduler, runs one flow at `delayMs: 5`, and shuts it down.
A hundred real runs at `delayMs: 0` take **115 ms**. **The refusal stands and this item does not
revisit it** — adding a rung is on the plan's stop-and-ask list, and a rung whose cost is a property
of how the harness is written would be a worse argument than one that does not need the number.
[Q246](../open-questions.md).

**Questions raised.** **Q243-Q246 used; Q247 reserved and unused; NO ADR, as declared.**

- **[Q243](../open-questions.md)** — the 49.8% is a share of the pair, four documents state it as an
  excess, and neither ratio is a constant.
- **[Q244](../open-questions.md)** — N runs on one shared scheduler is O(N²); on their own it is
  linear, and the shared topology is the one `AGENTS.md` recommends.
- **[Q245](../open-questions.md)** — the scheduler's own map is retention beside `RN-R13`'s, and the
  serializer refuses to measure it.
- **[Q246](../open-questions.md)** — P15 decision 3's per-run figure is a per-ROW figure; the
  conclusion survives on other grounds.

**Readers 13 / 3 blocking and 41 mutations / 19 survivors / 6 blocking, OVERLAP 2** — the **thirty-first**
measurement, inside the 0-4 band, neither reader primed. The two shared subjects are the byte walk's
binding and `heldWhenOver`'s stopped-run arm, and **each was reached from the opposite end**: the
conformity reader read the two lists and saw that only one was asserted, the adequacy reader inserted
a `continue` and measured zero.

**Late exceptions: ONE, and zero undeclared.** `spec/run-state.md`, whose section 7 closing paragraph
said `RN-R13`'s second term is *"stated over live regions"* — the predicate that rule's own
parenthetical rejects by name, since *live* is what a BRANCH is and *terminal* is what a JOIN becomes.
The rule and ADR 0046 rule 5 both have it right and one sentence of the section citing them did not.
Found by the conformity reader reading `spec/` first, which is the half of that role's method that
only works in that order. **No item owns `AGENTS.md` or `spec/README.md` here and neither was
reached**, which is P15's own `Owns` prediction answered **no / no / no** for the exit artifact — the
pattern P14's retro measured and declined to make a rule.
