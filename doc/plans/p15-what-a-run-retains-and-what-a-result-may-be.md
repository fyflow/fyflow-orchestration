# P15 — What does a run retain, and what may a result be?

**Status:** COMPLETE and RETRO'D — declared 2026-09-11 after
[P14](p14-what-a-reference-means-when-two-regions-arities-are-independent.md) closed and
`doc/workflow.md` reached [v0.15](../workflow.md); all three items merged and the retro run the same
day, taking that document to [v0.16](../workflow.md).
*Read every status from the item's own file, never from this line.*

**Baseline:** `3b023a6` — tree clean, `npm run gate` `GATE EXIT=0` with zero lines beginning `FAIL`,
15 chain entries.

```
Question:   What does a run retain, and what may a result be?
            Q19 and Q22 as ONE question.
Reserves:   W53-W56 (W56 expected unused), Q233-Q247, ADR 0046-0047
            (FIFTEEN questions, on P13's and P14's precedent: P13 reserved
            fifteen and still extended twice; P14 reserved fifteen and used
            five. The variance is the argument for the larger block, not
            against it.)
Exit:       a MEASURED NUMBER rather than a flow - `doc/workflow.md` section 2
            allows both, and decision 3 says a flow cannot be the artifact
            here: ladder L6 costs ~101 ms per real run, so a thousand of them
            is already over section 8's whole 90 s plan-gate budget.

              what one run holds, on real workers, before and after - with
              the extrapolation to the scale this repository has never run at,
              and the two observers named.
```

## Why this plan, and why now

**[Q19](../open-questions.md) and [Q22](../open-questions.md) are the two oldest rows in the register
whose owner cell says the same thing: *no owner — needs a measured run*.** Both have said it since
P1. Q19 asks whether per-run retained state is bounded; Q22 asks whether a node result must be
structured-cloneable, and its own text says *"Q19 is what would price it"*. **Neither can be answered
without a run at the scale this repository targets, and this repository has never made one** — ladder
L6 is 42 real runs.

**[P14](p14-what-a-reference-means-when-two-regions-arities-are-independent.md) named them as the
next plan's subject** and recorded that three measured inputs were already waiting. They are, and
this declaration **re-ran every one of them** rather than transcribing them — which is the mechanism
that caught P14's own founding error.

**Why the two are one plan.** They are the same variable from two sides. Q19 asks **how much** a run
holds; Q22 asks **what kind of thing** it may hold. Fact 2 measures the answer to the first as
*(tasks settled) x (bytes each returned)*, and `structuredClone` — Q22's subject — is the boundary
that decides what *bytes each returned* may even be. **Deciding either alone would let one case pick
the shape**: a retention bound written without knowing what a result may be would bound the wrong
thing, and a cloneability constraint written without a price is the argument Q22's row has been stuck
in since P1. *That is P13's decision 1 one plan on, and P12's before it.*

**The argument against declaring it** is that nothing is broken: every measurement below is of a run
that completes correctly, and fact 5 says the target scale **runs**. The argument for is fact 3 —
**half of what a region-bearing run holds is a second copy that nothing reads**, and no rung in this
repository can see it removed.

## What was measured before this plan was declared

**EIGHT facts, and FIVE of them correct or sharpen a row this plan is built on** — the seventeenth
time a plan has found one of its own inputs wrong by trying to act on it. The harnesses are
`dev-dist/p15/facts.ts` (an L2 probe over a generated flow family), `dev-dist/p15/scale.ts` (the
concurrency run) and `dev-dist/p15/clone.ts` (**one case per process**, which is
[W46](../work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)'s settled method).
Every number below came from a run. Retained size is `v8.serialize(...).length` over the driver's own
structures in **one** call, so an object reachable twice is counted once; the scale run carries a
**second observer**, `process.memoryUsage().heapUsed` after a forced `gc()`, because a sensor cannot
corroborate itself (v0.13 obligation (c)'s limit).

**1. The driver retains FOUR structures that grow with the run, and [Q19](../open-questions.md)'s row
names TWO of them.** Measured by enumerating the `Driver`'s own properties after a completed run:

| | | grows with | what it holds |
|---|---|---|---|
| `inputs` | `FoldInput[]` | every settlement, region event and dispatch | **everything** — and `log` is its record-kind subsequence **by reference**, measured: `bytes(log)` 98855, `bytes(inputs)` 99527, `bytes([log, inputs])` **99543**, so `log` costs **16 B** on top of `inputs` and is free |
| `arrivals` | `Map<string, Map<string, unknown>>` | every branch that arrives at a join | fact 3 — and it is a **second copy** |
| `dispatched` | `Set<string>` | every dispatch | task id **strings only**: 3 ids, **44 B**. Not a hazard |
| `joinState` / `firedJoins` | per region | the regions the document declares | 41 B and 14 B on a one-region flow |

**Q19's row names `log` and `arrivals`. `inputs` is the one that actually holds every result**, it is
what `Driver.foldInputs()` returns, and it is named in no row of the register.

**2. The footprint is NOT proportional to the node count, and the variable that decides it is in
neither Q19's row nor `spec/run-state.md`.** Four dimensions, varied one at a time:

| dimension | measured | per unit |
|---|---|---|
| **node count** — a chain of N tasks, each returning one key | 599 / 1113 / 2141 / 4215 / 8375 / 16698 / **33490 B** at N = 2 / 4 / 8 / 16 / 32 / 64 / 128 | linear, **~262 B/node** |
| **fan-out width** — one `fanout` of W branches, arity AUTHORED | 1523 / 2419 / 4211 / 7873 / 15251 / **30007 B** at W = 2 / 4 / 8 / 16 / 32 / 64 | linear, **~469 B/branch** |
| **map arity** — one `map` over A items, arity from the DATA | 1546 / 2430 / 4198 / 7770 / 14940 / 29279 / 58318 / **116814 B** at A = 2 … 256 | linear, **~456 B/instance** |
| **payload size** — the SAME 4-task chain, each result K KiB | 1113 B / 5.1 / 17.1 / 65.1 / 257.1 / **1025.1 KiB** at K = 0 / 1 / 4 / 16 / 64 / 256 | linear, and it is **the whole of every result** |

**So the first three are ONE variable — how many tasks settle — and the fourth is the multiplier both
documents omit.** A **4**-node chain returning 256 KiB retains **1025 KiB**; a **128**-node chain
returning one key retains **33 KiB**. Thirty-one times the footprint at a thirty-second of the node
count. `spec/run-state.md` section 5 says *"proportional to its dispatched-node count"* and Q19's row
says *"proportional to its node count"*; **the count is the smaller half of the answer and neither
names the other half.** The product confirms it: a map of A items each returning K KiB is `A x K` —
0.13 / 0.51 / **2.03 MiB** at A = 4 / 16 / 64 over 16 KiB, and 0.51 / 2.01 / **8.01 MiB** at A = 16
over 16 / 64 / 256 KiB.

**3. `arrivals` is a SECOND COPY of every branch result, it is HALF of what a region-bearing run
holds, and dropping it costs ZERO at every rung this repository has.** Q19's row records it as
retention *"proportional to the fan-out width times the payload"*, which is right, and as something
*"nothing reads once `firedJoins` has latched"*, which is also right. **What no document says is that
it aliases nothing**: measured on a map of A items each returning 64 KiB, the collection is **49.8%
of `bytes([inputs, arrivals])`** at A = 4, 16 **and** 64, and an identity check says the stored value
is neither the log record's `result` object nor the worker's own object. *(This read *"`bytes([inputs,
arrivals])` exceeds `bytes(inputs)` by 49.8%"*, **which is a different ratio** — that excess is
**+99.2 / +99.4 / +99.4%**. `dev-dist/p15/facts.ts` computes `(both - inp) / both` and prints *"of
the pair"*, so the harness was right and the sentence derived from it was wrong by a factor of two,
**understating the saving**. Found by [W55](../work-items/w55-a-run-at-scale-on-real-workers.md)
re-running that harness with the release reverted rather than transcribing its number; corrected in
[ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md),
`CLAUDE.md` and `doc/README.md` at that item's record step, and **here by this plan's own retro**,
which is the only pass that may write to a declaration. [Q243](../open-questions.md).)*

| probe | L1-L5 | L6 |
|---|---|---|
| clear the region's arrivals **BEFORE** the join reads them — the negative control | **13 failures** | not run |
| clear them **AFTER** the join reads them | **0 failures**, 25 files / 681 cases | **0 failures**, 942 assertions / 42 real runs |

**A control ran and the restore is asserted** (v0.11's requirement on the harness): the tree's
`src/driver/driver.ts` digest was taken before the first probe and verified byte-identical after the
last. **At the top of the target range the saving is 3174.8 MiB -> 1610.9 MiB, −49.3%** (fact 5), and
**no rung of section 4 can see it** — which is [Q214](../open-questions.md)'s shape a third time, from
the removal side rather than the addition side.

**And it does not apply to the run whose footprint matters most.** A clear at the join exit never runs
for a region whose join never fires: a 3-branch `fanout` with one branch settled reports `firedJoins`
**0** and holds **65571 B** of arrivals indefinitely. *A run that hangs is exactly the run that keeps
everything.*

**4. `maxCompletedTasks` is not inheritable, and applying its SHAPE to our log is worse than Q19's
row says.** The row says *"we would inherit the answer and its sharp edge (eviction is silent)"*.
Measured: `maxCompletedTasks` caps **`scheduler.tasks`**, which is the scheduler's own map, and
reaches nothing the driver holds — so there is no answer to inherit, only a shape. Applying the shape
to our own sequence:

| `fold()` over | outcome | nodes | regions | identical to complete |
|---|---|---|---|---|
| the complete log, 37 inputs | `completed` | 9 | 1 | — |
| the last **36** | `completed` | 9 | 1 | **yes** |
| the last **18** | `completed` | 8 | 1 | no |
| the last **4** | `completed` | 1 | 1 | no |
| the last **1** | `completed` | **0** | **0** | no |

**It does not throw and it does not say it is incomplete.** A run state reporting `completed` while
knowing nothing about the run is not a silent eviction; it is a **plausible wrong answer**, and it is
what a fold defined as a pure function of a complete log does when the log stops being complete.
*That is the half that could make this a spec plan rather than a driver plan.*

**5. THE MEASURED RUN, which is what both rows have been waiting for since P1.** N concurrent
`Driver`s over one flow, each driven to completion, two observers:

| runs | map arity | result | tasks | serialized | `heapUsed` delta | per run |
|---|---|---|---|---|---|---|
| 1 000 | 4 | 1 KiB | 5 000 | **10.2 MiB** | 16.2 MiB | 10.4 KiB |
| 10 000 | 4 | 1 KiB | 50 000 | **101.8 MiB** | 154.6 MiB | 10.4 KiB |
| 1 000 | 10 | 4 KiB | 11 000 | **83.1 MiB** | 91.0 MiB | 85.0 KiB |
| 1 000 | 10 | 16 KiB | 11 000 | **317.4 MiB** | 325.3 MiB | 325.1 KiB |
| 10 000 | 10 | 16 KiB | 110 000 | **3174.8 MiB** | 3244.8 MiB | 325.1 KiB |
| 1 000 | 50 | 16 KiB | 51 000 | **1584.9 MiB** | 1603.4 MiB | 1622.9 KiB |

**The target scale RUNS, and the margin is a factor of one rather than a factor of ten.** The two
observers agree within 3% at the large sizes and the serializer reads low at the small ones, which is
what per-object overhead predicts. **So the answer to *is it bounded* is not *yes* or *no* but
*bounded by what a run does, and by nothing else*** — and with fact 3's clear applied the same three
large rows read **161.1 / 1610.9 / 803.0 MiB**.

**6. Q22's own numbers do not reproduce as its row states them, and the reason is W46's method
finding applied to the row that quotes them.** Q22 quotes
[W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) at N = 1000 over 117 KiB.
Re-taken today, **one case per process**, over 138.6 KiB:

| | Q22's row | re-taken |
|---|---|---|
| the shipped single edge-hop clone | 1.50 ms | **0.64 ms** |
| a clone per map instance at N = 1000 | 2207.94 ms | **516.77 ms** |
| each instance receiving its own item | 2.29 ms | **0.02 ms** |
| a clone of that item | 7.99 ms | **1.54 ms** |
| a `fanout` clone per branch at arity 2 / 3 / 5 / 10 | 9.3 / 14.2 / 23.0 / 44.3 ms (230 KiB) | **4.71 / 6.58 / 10.62 / 21.45 ms** (278.2 KiB) |

**The CONCLUSION is unchanged and the ARGUMENT is stronger**: the ratio is still ~**800x**, still
quadratic for a map and still linear in a document constant for a `fanout`. **Every absolute is 2-5x
lower**, which is what W46 measured accumulation in one process to be worth (up to 4.4x), on numbers
taken before that method finding existed. *A register row quoting an absolute is quoting a method.*

**7. The cloneability boundary is not where Q22's row draws it, and the interesting case is SILENT.**
`OR-R6` makes a non-cloneable result a run failure, which is loud. Measured over ten shapes, the
boundary is not the one an author would guess:

| refused — `DataCloneError` | cloneable |
|---|---|
| a function; an object **holding** a function; a `Symbol`; a `Promise`; a `WeakMap` | a plain object; a `Map`; a `Date`; **a cyclic object**, whose cycle survives; **a class instance** |

**A class instance clones and comes back as a plain `Object`** — prototype gone, methods gone,
`instanceof` false, fields intact, **no error and no report**. `OR-R2` is a rule about whether a value
can cross the boundary; nothing anywhere is a rule about whether it arrives as what it was. *That is
fact 4's silent eviction one layer in, and it is the case a worker author actually writes.*

**And the retention is load-bearing for the library's own public answer.** Over both corpora — **33
flows, 124 task nodes** — **14** are named by some `needs` and **110 are named by none (89%)**, so the
obvious bound (*drop a result no reference can name*) is decidable **from the document**. It is not
free: blanking every `result` in the sequence takes the fold's input from 13984 B to 1612 B, a factor
of **8.7**, and changes `RunState` — `nodes[taskId].result` **is** the retained result. **So the 89%
is not dead weight the way fact 3's 49.8% is; it is what a consumer reads**, and bounding it is a
change to what a run reports rather than a driver optimisation.

**8. The scale target this plan is named for is cited from a document this machine cannot read, and
one of the two citations is to a document that does not say it.** `FLOW_PLANNING.md` lives in the
scheduler repository; `../fyflow-scheduler/` is on disk and **that file is not in it** — the sibling
was destroyed by the `git worktree remove --force` incident
([ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md))
and restored from the published package, which ships no planning documents. **`doc/concept.md`
contains the string `1000s` nowhere**; what it says is *"Flows are instantiated per workload,
**thousands at a time**"*. And
[ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
**read** *"the 1000s-10000s scale `doc/concept.md` targets"* — **attributing the figure to a document
that does not carry it** — and **that sentence is corrected in place by this declaration**, which
`doc/decisions/**` being on section 1 rule 5's record-step list is what permits. The other three
citations ([ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md),
`doc/scheduler-upstream.md` and [P10](p10-is-fan-out-one-feature-or-two.md)) all attribute it to
`FLOW_PLANNING.md` and are **accurate**; the file is simply unreadable from here. **The target is not
withdrawn**: *thousands at a time* is a real statement in a document this repository owns, and fact
5's table brackets it on both sides. **What is corrected is the provenance**, and it matters because
an agent who goes to check the number finds nothing.

## Scope

**In**

1. **[Q19](../open-questions.md)** — is per-run retained state bounded? Decided as **ADR 0046**, with
   fact 3's measured-free half taken and fact 7's not-free half priced rather than guessed. The
   decision must say what a run retains, what it may forget and when, and it must be a statement
   somebody can falsify — `spec/run-state.md` section 5 has carried this as an unanswered bullet since
   v0.1.
2. **[Q22](../open-questions.md)** — must a node result be structured-cloneable, and is that a
   constraint on workers or on the driver? Its row says *"what it now needs is a decision about the
   CONSTRAINT rather than a measurement"*; facts 6 and 7 supply the price and a failure mode the row
   does not name. Possibly **ADR 0047**, and possibly no ADR if the answer is that `OR-R2` and `OR-R6`
   stand as written.
3. **The exit artifact**: what one run holds on real workers, before and after, with the extrapolation
   stated and both observers named.

**Out** — named rather than left implicit, with where each goes instead

- **[Q219](../open-questions.md)** — making a region's COLLECTION referenceable by relaxing `FD-V27`.
  It is **DOWNSTREAM of this plan and is named as the follow-on**: its whole cost is retaining the
  collection or recomputing `JP-R12` at a second site, which
  [ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
  rule 2 refuses by name and which is exactly Q19's subject. **It also RELAXES an existing rule**,
  which this plan's stop-and-ask list makes the maintainer's call. *It becomes answerable once
  retention is priced, and fact 3 is half of that price.*
- **[Q186](../open-questions.md)'s threshold** — *how large is too large*.
  [W46](../work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) decided **nothing
  warns** and left the threshold open deliberately, on the ground that a driver-side guard would have
  to guess. **Not reopened.** Fact 5 is the first number that could ever answer it, and if this plan
  produces a threshold that row becomes answerable — **say so rather than acting on it**, because
  reopening a row whose status reads *decided* is section 6 pass 3 rule 1's *measuring your own
  output*.
- **[Q21](../open-questions.md)** — an event family for a UI. **[Q64](../open-questions.md)** — a
  consumer guide. **[Q20](../open-questions.md)** and **[Q85](../open-questions.md)** — topology, and
  whether a run id is global. All four are *Scale and interop* cluster rows that share a heading with
  Q19 and share nothing else: they are about what a run is SEEN by, not about what it HOLDS.
- **[Q15](../open-questions.md)** — durability. It is the one out-of-scope row this plan's answer
  moves: a persisted run is a log read back from storage, so whatever ADR 0046 says a run may forget
  is what a resumed run cannot be handed. **Named in the ADR, not decided.**
- **[Q26](../open-questions.md)** — whether the driver logs non-settlement events. Its own text cites
  Q19 as the argument against; this plan supplies the number and does not take the decision.
- **[Q119](../open-questions.md)** — `branchPathOf`'s cost, whose owner cell reads *needs
  [Q19](../open-questions.md)'s measurement*. **The measurement now exists and it is about SPACE, not
  TIME**; Q119 is a time question and this plan does not answer it. Its owner cell is corrected to say
  which.
- **A rung, or a row in section 8's budget table.** Decision 3, on a measurement: L6 is **101 ms per
  real run**, so a thousand real runs is 101 s against a whole-ladder budget of 90 s.

## Decisions taken before fan-out

1. **The free half and the priced half are DIFFERENT ANSWERS, and the plan says so before either item
   starts.** Fact 3's 49.8% is measured free at both rungs; fact 7's 89% is measured **not** free,
   because `RunState.nodes[*].result` is a public surface. **An item may not take the second on the
   strength of the first.** A candidate that bounds what a consumer reads is a change to what the
   library reports, and it belongs in an ADR with the surface named.
2. **Nothing this plan decides may make `fold()` return a plausible wrong answer.** Fact 4 is the
   measurement: a fold over an incomplete log reports `completed` with zero nodes and no signal. Any
   eviction candidate must therefore come with **a way for the fold to say it was handed less than the
   whole log** — and if that cannot be built, the candidate is refused rather than shipped quietly.
   *This is the constraint that decides whether P15 is a driver plan or a spec plan.*
3. **The exit artifact is a MEASURED NUMBER and NOT a rung.** `doc/workflow.md` section 2 allows
   either. Measured: `npm run test:l6` is **4236 ms for 42 real runs**, ~101 ms each, so the scale this
   plan is about cannot be a rung inside section 8's 90 s budget by two orders of magnitude — and
   adding a rung or a budget row is on the stop-and-ask list in any case. **W55 reports a number with
   its method, its scope and both observers**, in the item's Record and in the ADR. A number nobody can
   re-take is not evidence, so its harness is checked in under `examples/**`, where L6 already lives.
4. **No new node kind, no new reference form, and no change to what a reference MEANS.** P14 closed
   that question three commits ago. If the evidence points at the resolver, stop and ask.
5. **Every fact above is RE-RUN by the item that acts on it, never transcribed.** It is the mechanism
   that caught P14's founding error — W49's `Inputs:` line — and P14's retro refused to make it a rule
   precisely because `doc/work-items/TEMPLATE.md`'s `Inputs` row already asks for it. **Each item's
   `Inputs:` names the facts it rests on and says they are re-run from `dev-dist/p15/`.**

## Work items

| id | | owns |
|---|---|---|
| **W53** | *What a run retains that nothing reads.* Facts 1-4. Takes the measured-free half — `arrivals`' second copy — and writes down what a run retains and what it may forget, as **ADR 0046**. Must answer fact 3's own exception: a region whose join never fires. Decision 2 binds it. | `src/driver/**`, `test/driver/**`, `spec/run-state.md`, `spec/join-policy.md`, `doc/decisions/0046-*.md` |
| **W54** | *What a result may be, and what bounding it would cost.* Facts 6 and 7. Q22's constraint decision — `OR-R2`'s deep copy, `OR-R6`'s refusal and the silent lossy case nothing names — and the price of bounding `RunState.nodes[*].result`, which fact 7 says is 89% of the corpus and is not free. **May take no ADR**, if the answer is that the rules stand; the plan says so rather than reserving work for it. | `spec/outcome-record.md`, `src/fold/**`, `test/fold/**`, `test/definition/**`, `doc/decisions/0047-*.md` |
| **W55** | *A run at scale, on real workers.* The exit artifact: what one run holds before and after, in **both** L6 runtimes, with the extrapolation to fact 5's table and what reverting W53 costs, measured in MiB and in L6 failures. | `examples/**` |
| **W56** | **reserved and expected unused**, on P9's, P11's, P12's, P13's and P14's precedent. A reserved id that is not spent is still not free. | — |

**Serial, and the reason is section 7 rule 2**: W53 and W54 would both edit `spec/run-state.md`,
W54's price depends on what W53 decides a run keeps, and W55 depends on both.

**No item pre-declares `AGENTS.md`, `spec/README.md` or `scripts/check-docs.mjs`.** P14's retro
refused a pre-declaration rule for the second time with the measurement — over its three items the
three files were taken yes/yes/no, yes/yes/no and no/no/no, and **the exit artifact reached neither of
the first two** — and recorded the narrower reading that *an item that changes what a reference may
say will reach `spec/README.md`*. **This plan is the third data point and it is a different shape**:
no item here changes what a reference may say, and two of the three change a `spec/` document's
version, which is what `C8` compares. **If W53 and W54 reach `spec/README.md` and W55 does not, that
is the same pattern P14 measured**, and the retro should say so rather than adopt a rule.

## Predictions, written down before the items that test them

**Two derived and two reach, each stating the SCOPE of the measurement it rests on — and each also
stating what would make that measurement WRONG rather than merely narrow.** That second half is P14's
retro's correction to v0.14's own counter-measure: prediction 1 there stated its scope **correctly**
and reversed anyway, because the fact underneath was false. *A scope cell says what a measurement
covers; it says nothing about whether it is true.*

| # | kind | prediction | rests on | scope of that measurement | what would reverse it |
|---|---|---|---|---|---|
| 1 | derived | **W53 ships the `arrivals` clear and it is the whole of the free saving** — nothing else the driver holds is a second copy, so there is no second 49.8% to find | W53 | fact 1, measured by enumerating the `Driver`'s **own enumerable properties** after a completed run on **one** generated flow family; it does not see state held in a closure, in a module-level cache, or by anything the driver hands out and a caller keeps | a second aliasing structure outside `Object.keys(driver)` — `outputsCache` is the named candidate and was `null` in every run measured here. **What would make fact 1 WRONG rather than narrow**: `log` and `inputs` NOT sharing, which was measured at 16 B and which would make the row's `log` the thing to drop |
| 2 | **reach** | **The answer to Q19 is that retention is bounded by the RUN and by nothing else, and no eviction ships** — because decision 2's constraint cannot be met: fact 4 says a fold over a short log reports `completed` with zero nodes, and giving it a way to say otherwise means a new `FoldInput` kind, which is a change to the one value this repository's whole invariant hangs off | W53 | fact 4, measured by truncating **one** 37-input sequence from one flow at four lengths; it says nothing about a fold given a log evicted from the MIDDLE, and nothing about whether a completeness marker is cheap | a marker that costs one field rather than a kind — or the static candidate of fact 7 (*a result no `needs` names*) turning out to leave `RunState` unchanged, which would make a bound available without eviction at all |
| 3 | derived | **W54 takes NO ADR: `OR-R2` and `OR-R6` stand as written, and the silent lossy case is recorded rather than refused** — on [W46](../work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)'s own precedent, *nothing warns*, and because a driver cannot tell a class instance from the plain object its author meant to return | W54 | facts 6 and 7, measured over **ten** hand-chosen value shapes and a re-run of W34's four timings on **this** machine on **one** day; the shapes are not a survey of what real workers return, and [Q179](../open-questions.md) says wall time here is not reproducible | the lossy case being reachable by a rule — a `workerType`-level declaration, or a cheap prototype check at the listener boundary. **What would make fact 7 WRONG**: `structuredClone` refusing a class instance in a runtime this library targets, which was measured in Node 24 alone |
| 4 | **reach** | **This plan supplies [Q214](../open-questions.md)'s THIRD instance, from the REMOVAL side** — fact 3's clear costs 0 at L1-L5 and 0 at L6, so a rung made of runs cannot see a whole structure leave. W47's was *a document the validator refuses never starts*; W50's was *a filter no run exercises*; this is *a structure nothing reads* | W53, W55 | fact 3, measured on the shipped tree at **three arities** with a negative control that fires at 13 failures, and at L6 with the probe in place; it is one structure and one clear site | W55's exit artifact finding a rung that DOES see it — most likely by asserting the footprint itself, which would turn Q214 from *a rung cannot see this* into *a rung nobody had written* |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q19](../open-questions.md) | is per-run retained state bounded — **the plan's question**, first half | **W53**, by ADR 0046 |
| [Q22](../open-questions.md) | must a result be structured-cloneable — **the plan's question**, second half | **W54** |
| [Q219](../open-questions.md) | a region's collection is unreachable, and its cost is this plan's subject | read by W53; **declared OUT and named as the follow-on** |
| [Q119](../open-questions.md) | `branchPathOf`'s cost, whose owner cell says it needs Q19's measurement | **corrected, not owned** — the measurement is about space and Q119 is about time |
| [Q186](../open-questions.md) | *how large is too large*, decided as **nothing warns** and deliberately left open | read by W54; **not reopened** |
| [Q214](../open-questions.md) | a change no rung made of runs can see | **W55**, as prediction 4 |
| [Q15](../open-questions.md) | durability — what a resumed run is handed | named in ADR 0046; not decided |

## A note on ids

**Reserves W53-W56, Q233-Q247, ADR 0046-0047.** Derived rather than inherited: the highest work item
on disk is **W51** and **W52 was reserved by P14 and never issued**; the highest Q in the register is
**Q222** and **Q223-Q232 were reserved by P14 and unused**; the highest decision on disk is **ADR
0044** and **0045 was skipped**. All of those are **spent and not reused**, so the next free triple is
**W53, Q233, ADR 0046** — which is what P14's Record says, and what this derivation confirms
independently.

**Fifteen questions**, because P13 reserved fifteen and extended twice while P14 reserved fifteen and
used five: the block size is set by the worse case, and an unused id costs nothing but a line in a
Record. **ADR 0047 is taken or skipped on prediction 3's verdict**, and the plan says which rather
than reserving work for it.

## The baseline this plan starts from

`3b023a6`, clean tree, `GATE EXIT=0`, zero lines beginning `FAIL`, 15 chain entries. **Every figure
below was RE-TAKEN at this declaration rather than transcribed**, which is what P14's retro says
caught its own founding error:

```
25 file(s), 681 assertions, in node 24.20.0, deno 2.9.6, chromium, firefox and webkit
942 assertions at L6, 0 failed, 42 real runs, in node and deno
spec        - 7 documents, 44 examples, 89 rules
markdown    - 96 documents, 4127 relative links, 206 anchored
register    - 179 questions, 129 open, 2 deferred, 48 resolved
```

**The five-runtime claim is measured, not inherited**: `npm run gate` runs `test:browser`, which is
**chromium only**, so `npm run test:browser:all` was run for firefox and webkit. **681 counts `test()`
cases and 942 counts individual assertions ([Q98](../open-questions.md)) — they are never added.** And
wall time here is not reproducible ([Q179](../open-questions.md)); the 4236 ms L6 figure in decision 3
is one reading, and the conclusion it supports needs only its order of magnitude.

**The census parser was written FROM SCRATCH from `doc/open-questions.md`'s own note and from nothing
else, and it aborted ZERO times on its first run** — the fifth time that has happened. It implements
the note's nine clauses plus W49's ORDER correction (clause 8 before the width check) and got all four
counts, the both-tables figure (**42**), every status cell and both halves of the cluster check
(**179 of 179 in exactly one cluster cell**) right first time.

**The parser then ABORTED ONCE, correctly, on this declaration's own edit to [Q123](../open-questions.md)'s row** — the third-occurrence paragraph wrote `` `Get-Content | Set-Content` `` with an **unescaped pipe inside a code span**, which is [Q131](../open-questions.md)'s shape, and the parser read the row as **5 cells** and reported *178 / 128* with totals that still summed. *The four counts were internally consistent and wrong*, and an aborting parser is the only thing here that catches that. Escaped; the re-run exits 0.

**[Q142](../open-questions.md) FIRES, and it was PREDICTED from the pre-edit counts rather than
discovered by the gate going red.** Measured on a scratch copy outside the repository **before any
document was written**: whole tree **96 / 4127 / 206**, `doc/decisions` removed **73 / 3774 / 206**,
both removed **58 / 3030 / 206**, against floors of `M3` **80**, `M4` **3080** and `M5` **60**. So
`M4`'s margin was **50 links** — and this declaration writes four work-item documents into
`doc/work-items`, which **neither `removes` probe cuts**, plus register rows and index prose. **`M4`'s
window is two-sided**: the floor must sit above the two-directory fixture and below the one-directory
one, so adding documents closes it from below.

**Re-measured on a scratch copy after the documents AND this declaration's own prose landed — the
tree that ships, which is section 1 rule 5's WHEN clause: whole tree 101 / 4255 / 211,
`doc/decisions` removed 78 / 3900 / 211, both removed 62 / 3109 / 211.** So the two-directory fixture
went **3030 -> 3109, past the 3080 floor** and the probe declaring `[M1, M3, M4]` would have reported
`got [M1, M3]` — the same line, in the gate, for the **sixth** consecutive plan. **`M4` is retuned
3080 -> 3490**, the middle of its new window `(3109, 3900]`.

**And `M3` is retuned 80 -> 90 with the probe still FIRING, which is a first.** Its one-directory
fixture went **73 -> 78** against a floor of `< 80`, so its margin is **two documents** — the tightest
this floor has ever been recorded at, and the next plan to add five would silence it exactly as P9's
and P10's declarations did. Its window is `(78, 101]` and 90 is near the middle. **`M5` is untouched
at 60 against 211 for the eighth plan running**, because no `removes` probe moves an anchored count.

**`scripts/check-markdown.mjs` is this declaration's ONE declared exception.** It is in nobody's
`Owns` and is not on section 1 rule 5's record-step list, which is
[Q102](../open-questions.md)'s own shape and the reason [Q142](../open-questions.md) exists. Both
floors are **raised**, never lowered, and the counts are recorded beside them in the file.

**And the declaration's own tree gates green, measured with the tree HELD STILL** — `doc/workflow.md`
section 6, v0.15, whose whole point is that a verdict taken over a moving tree is a claim about no
tree. The tree's digest was taken before `npm run gate` started and re-taken after it returned, and
the two are identical:

```
GATE EXIT=0, zero lines beginning FAIL, 15 chain entries
25 file(s), 681 assertions, in node 24.20.0, deno 2.9.6 and chromium
942 assertions at L6, 0 failed, in node and deno
spec        - 7 documents, 44 examples, 89 rules
markdown    - 101 documents, 4255 relative links, 211 anchored
selftests   - 7/7 completed, 7 ok, 5 lanes (396-398 s wall over two gates; Q179)
check-markdown self-test - 37/37 probes caught, 7/7 bounded
```

**The last line is [Q142](../open-questions.md)'s verification**: both `removes` probes report `ok`,
so each still trips exactly the set it declares — `[M1, M3]` and `[M1, M3, M4]` — which is what the
retune was for and is the thing a floor going silent takes away.

**[Q123](../open-questions.md) reproduced for the THIRD time during this declaration, and the row
predicted every detail of it.** `pathlib.Path.write_text` converted **five files entirely to CRLF** —
`CLAUDE.md`, `doc/README.md`, `doc/open-questions.md`, `scripts/check-markdown.mjs` and
[ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md).
**The first `npm run gate` was `GATE EXIT=1`** with one `FAIL` line, and it was `G2` in
`check-wiring` — *"the dispatch block does not close where both a brace match and the layout say it
does (brace 15478, layout none)"* — exactly the route and exactly the misleading message Q123's row
already records from W41. Every other check, all five runtimes and both L6 rungs stayed green.

**What is new is the PROVENANCE of the mistake, and it is the sharper half.** The session guidance in
use says *write multi-line file edits as `.py` scripts and run them with `python3`*, and `CLAUDE.md`'s
own hazard paragraph warns about `Get-Content | Set-Content` and **names no other tool** — so the
document that records the hazard recommends the tool that causes it. **The fix that works is writing
BYTES**, which neither Q123's row nor `CLAUDE.md` stated; both now do. Normalised in binary, and
`git ls-files --eol` is **237 of 237 `i/lf`** afterwards.

**And it is an argument for the clause that caught it.** `G2` derives the dispatch block's end
**twice** — once by brace matching and once from the layout — and its own comment says the second
exists because rule 8 showed the first was deletable. *A clause with two independent derivations
caught a defect neither derivation was written for*, which is obligation (c)'s *count the observers*
paying out in a direction nobody aimed it.

## Stop and ask a human

- **Anything that changes what a run RETAINS before this plan has priced it.** Fact 3's clear is
  measured free at both rungs and is still a change to run lifetime; fact 7's 89% is measured **not**
  free and is a change to what a consumer reads. The second is the maintainer's.
- **Relaxing or weakening any existing `spec/` rule or check clause** rather than adding one —
  `OR-R2`, `OR-R6` and `RN-R3` are the three this plan could reach, and all three are load-bearing for
  the fold's invariant.
- **Adding a rung to section 4's ladder, or a row to section 8's budget table.** Decision 3 refuses
  both on a measurement; overriding it is not an item's call.
- **A measurement that needs a machine or a runtime this repository does not have.** Fact 5's top row
  is 3.2 GiB in one process on this machine; anything above that is a different question.
- **Editing `doc/workflow.md`** — that is the retro's, and the retro is not the plan.
- **Amending the declared scope or an item's `Owns` in a way that changes what the plan costs**, on
  W38's precedent: put it to the maintainer with alternatives and numbers.
- **Pushing.** Commit freely; ask before anything leaves the machine.

## Record

*Filled in at the join, after the work items are merged. One row per item as it lands.*

| item | | |
|---|---|---|
| **W53** | **DONE** — [Q19](../open-questions.md) is RESOLVED by [ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md), open since P1. `spec/run-state.md` is **v0.6** with a new section 7 and **`RN-R13`**; `spec/join-policy.md` is **v0.16** with `JP-R11`/`JP-R12`'s LIFETIME and no new rule id. `spec/` is 7 / 44 / **90**; L1-L5 is **26 / 695** in five runtimes; **L6 unmoved at 942 / 42**. | **A region releases its collection when its join becomes TERMINAL** — at three moments, two per region and one per run. Measured: the `arrivals` share of a completed region-bearing run **49.8% → 0.0%**, and 10 000 concurrent runs **3174.8 → 1610.9 MiB**, which is the figure this plan's fact 3 predicted to the decimal. Releasing after the read costs **0** at both rungs; before it, **14** (13 on the pre-item suite). **Nothing is evicted from `inputs`**, refused on fact 4 rather than on taste — decision 2 holds and prediction 2's reversal did not occur. Readers **16 / 6 blocking** and **9 survivors / 6 blocking, overlap 2** (the 29th measurement, in band). Rule 8 **36 probes / 32 caught / 4 survivors / 0 aborts**, run twice with the readers' eight exact edits checked back in — and the re-run found this item's own re-entrancy test asserting the right thing **by the wrong route**, a throw that unwinds past the guard it was written for. **Q233-Q235 raised, Q236-Q237 unused; census 182 / 131 / 2 / 49, 0 aborts.** |
| **W54** | **DONE** — [Q22](../open-questions.md) is RESOLVED by **`OR-R11`** in `spec/outcome-record.md` **v0.9**, open since P1. **NO ADR: 0047 is SKIPPED and not reused.** `spec/` is 7 / 44 / **92** (`OR-R11` and `OR-R12`); L1-L5 is **27 / 703** in five runtimes; **L6 unmoved at 942 / 42**. | **A result is a VALUE, not an OBJECT** — its fields cross `OR-R2`'s clone and its BEHAVIOUR does not, silently. **Q22's fork is the wrong shape**: it IS the driver's constraint, and the question an author hits is *what arrives*. **The document said `structuredClone` THROWS on a class instance and it clones it LOSSILY** — so the boundary has three answers where it named two, and the table is 27 rows now, 5 refused / 11 intact / 11 lossy, asserted in **all five runtimes**. **Prediction 3's CONCLUSION is confirmed and its stated REASON reverses**: a driver CAN tell, at 0.02-0.65% of a clone — it is blind to the NESTED case instead, and the walk that sees it is 23-60% ([Q238](../open-questions.md)). **`OR-R12` is new and is the sharpest finding**: `OR-R6` was stated of the whole boundary and holds only at the LISTENER ([Q241](../open-questions.md)). Readers **15 / 6 blocking** and **41 mutations / 17 survivors / 6 blocking, overlap 4** — the 30th measurement, at the top of the band. Rule 8 **30 probes / 21 caught / 9 ceilings / 0 aborts**, the readers' own edits in the set from the start. **And the gate was RED once, at `GATE EXIT=1` with ZERO `FAIL` lines**: the browser bundle inlined neither `spec/outcome-record.md` nor the second corpus, so three tests failed in every browser — one of them by running against HALF a corpus and reporting 6 where the document says 14. **I had reported the browsers green twice**, because the command was piped through a `grep` for the count line and that line prints BEFORE the failures. *`doc/workflow.md` section 4 v0.15, quoted in this item's own Verification table and broken while being quoted.* **SIX late exceptions, zero undeclared; Q238-Q242 raised, Q243-Q247 unused; census 187 / 135 / 2 / 50.** |
| **W55** | **DONE** — **P15's EXIT ARTIFACT**, and it takes **NO ADR** and writes **no spec rule**, which is what an exit artifact looks like. `examples/retention.ts` is checked in and reports what ONE run holds on a real `FyflowScheduler`, byte-identically in **both** L6 runtimes; `RunReport` carries `Retention`; L6 is **1061 assertions over 42 real runs**, from 942 / 42, with the **run count unmoved** because the artifact is a measured NUMBER rather than a flow. `spec/` unmoved at 7 / 44 / 92; L1-L5 unmoved at 27 / 703 in five runtimes. | **PREDICTION 4 REVERSES.** Reverting ADR 0046 rule 3 cost **0** L6 failures before this item and costs **29 in both runtimes** after it, across **23 distinct rows** — a count of observations, not knock-ons. **And not by asserting the footprint**: the bytes are reported and never asserted, and what moved the number is the RELATION, observed by a reach past the reported surface. *Q214's surviving half is the one that matters to a consumer* — the outcome, every id, the log and the fold are byte-identical either way. **Fact 5 re-taken in BOTH directions, to the decimal**, and **fact 3's 49.8% is corrected**: it is the share OF THE PAIR, four documents state it as the excess over `bytes(inputs)`, and that is **+99.2 to +99.4%** — wrong by a factor of two and UNDERSTATING the saving ([Q243](../open-questions.md)). Readers **13 / 3 blocking** and **41 mutations / 19 survivors / 6 blocking, overlap 2** — the 31st measurement, in band — and the two shared subjects were reached from opposite ends. The sharpest is the conformity reader's: **the peak snapshot is reachable from `driver.opts`, which the byte walk skips by name, so observer 2 was measuring observer 1's instrument** — 141.9 → 129.4 MiB, one collection a run. The adequacy reader's is that **the byte observer was bound by nothing, three ways**, and that the headline check was removable for three integer edits — W23's finding at its FIFTH iteration, closed by `PER_ROW_SUBJECTS` bound both ways. Rule 8 **46 probes / 34 caught / 12 ceilings / 0 aborts / 0 against declaration**, run twice with the readers' sixteen exact edits in it. **ONE late exception, zero undeclared; Q243-Q246 raised, Q247 unused; census 191 / 139 / 2 / 50, 0 aborts; [Q142](../open-questions.md) measured on a scratch copy and does NOT fire.** |
| **W56** | reserved, expected unused | |

**What W55 found wrong in this plan's own inputs, recorded here because the Record is where an item
may write.** Two, and both are about a number this plan states rather than about what it decided:

1. **Fact 3's *"`bytes([inputs, arrivals])` exceeds `bytes(inputs)` by 49.8%"* is a different ratio
   from the one measured.** `dev-dist/p15/facts.ts` computes `(both - inp) / both` and prints *"of
   the pair"*; re-run with the release reverted it is **49.8% of the pair at A = 4, 16 and 64** and
   **+99.2 / +99.4 / +99.4%** as an excess over `inputs`. **Wrong by a factor of two and wrong in the
   direction that UNDERSTATES the saving.** The headline — *half of what a region-bearing run holds
   is a second copy* — is the share-of-the-pair reading and is right, and so are `JP-R12`, W53's own
   file and Q19's resolved row. Corrected in ADR 0046, `CLAUDE.md` and `doc/README.md`; **fact 3's
   own sentence at line 105 is this PLAN's**, on W53's precedent for the same boundary.
   [Q243](../open-questions.md), which also records that neither ratio is a constant — the divisor is
   one copy per settled result, so it is a property of the FLOW as well as of the payload.
2. **Decision 3's *~101 ms per real run* is a per-ROW figure.** Re-measured at 4286 / 42 = 102 ms,
   and the divisor is an `EXPECTED` entry — a ten-pool scheduler built and shut down per row, at
   `delayMs: 5`. A hundred real runs at `delayMs: 0` take **115 ms**. **The decision stands**: adding
   a rung is on this plan's stop-and-ask list and W55 does not revisit it.
   [Q246](../open-questions.md).

**What W53 found wrong in this plan's own inputs, recorded here because the Record is where an item
may write.** Four, and the first is the one prediction 1 named:

1. **Fact 1 says the driver retains FOUR growing structures; there are seven own properties in five
   groups, and the fifth group is not empty.** `outputsCache` is recorded as *`null` in every run
   measured* — which is a property of the flows fact 1 ran, not of the driver: they declare no
   `needs`, so `outputs()` is never called. On a flow that declares one it is **non-null**, and it
   **ALIASES** — 5/5, 17/17 and 65/65 of its entries are a log record's own `result` object, costing
   ~25 B an entry. **Prediction 1's conclusion HOLDS and its scope cell was narrow in the direction
   that mattered**: there is no second 49.8% to find, and the reason is not that the fifth structure
   is empty. *(And the same fixture gap then reproduced inside the L2 test written to correct it,
   where making that memo clone what it stores cost ZERO at every rung. Both of W53's readers found
   it, from opposite ends.)*
2. **Fact 2, the `Spec:` line and four other places cite `spec/run-state.md` section 5; the
   *Bounded retention* bullet is in section 6.** Section 5 is *Three things v0.1 claimed*. Corrected
   in the item's own file, in the register and in `doc/README.md`; this plan's two copies (lines 94
   and 226) are its own.
3. **The plan's baseline paragraph says `git ls-files --eol` is 237 of 237 `i/lf`; at `82ff3ba` it
   is 242**, and five is exactly the number of documents that declaration added. **Section 1 rule
   5's WHEN clause, on the declaration's own tree** — a number taken before the change it describes.
   It is 244 at W53's own commit and every one is `i/lf`.
4. **`v8.serialize` is in TWO of the five runtimes, not one** — node and deno, through `node:v8`.
   Three documents said one. The conclusion is unaffected: a rung green in two of five is not a rung.

**W54's verdict on prediction 3, and it is the pattern P14's retro named.** The prediction says
*W54 takes NO ADR: `OR-R2` and `OR-R6` stand as written, and the silent lossy case is recorded rather
than refused — … because a driver cannot tell a class instance from the plain object its author meant
to return.* **Every clause of the conclusion holds and the stated reason is measured FALSE.** A
prototype comparison after the clone fires on every top-level lossy shape and on none of the intact
ones, at **0.02-0.65% of one clone**. What is true is narrower and is what `OR-R11` says instead: the
cheap check is **blind to more than half the lossy rows** — a nested instance, a non-enumerable
property, a symbol-keyed one, a lost frozen-ness, an `Error`'s dropped fields — and the walk that
sees them costs **23-60%** of the clone per settlement. *A prediction right about the conclusion and
wrong about the mechanism*, which P12's retro recorded as [Q193](../open-questions.md) and P14's
retro made the sharpest kind. **Its stated way of being WRONG was also checked rather than assumed**:
`structuredClone` accepts a class instance in all five runtimes, not only Node 24.

**And the plan's own fact 7 is corrected twice.** Its two-column table calls the boundary *refused*
and *cloneable*; there are **three** answers, and the third — cloned **lossily** — is the one the
plan is about. Its *"a class instance clones and comes back as a plain `Object`"* is right and
incomplete: a subclass of `Array` or `Error` keeps that prototype and loses its own methods **and its
own fields**, a plain `Error` loses its own fields with no prototype change at all, and a frozen
object arrives unfrozen. **Fact 7's other half — the 89% — reproduces exactly** (14 of 124 named, 110
not), and it is derived from both corpora by W54's suite rather than left as a literal.

**Prediction 1 is CONFIRMED with its scope corrected. Prediction 4 was CONFIRMED at W53 and is
REVERSED at [W55](../work-items/w55-a-run-at-scale-on-real-workers.md), which is the reversal its own
cell describes.** At W53 the release cost **0** at L1-L5 and **0** at L6, so no rung then made could
see a whole structure leave — [Q214](../open-questions.md)'s third instance, from the REMOVAL side.
At W55 it costs **29 at L6 in both runtimes**, across 23 distinct rows. **The reversal is narrower
than the prediction's own reversal clause**, which guessed *most likely by asserting the footprint
itself*: the footprint is reported and never asserted, and what a rung can see is the RELATION —
through a reach past the surface a run reports. *What Q214 keeps is that nothing a run REPORTS moves.* **Prediction 2 is not yet
verdicted**: no eviction shipped and decision 2's constraint was not met, which is what it predicts,
but its stated reversal — *a marker that costs one field rather than a kind* — was looked for and not
found rather than shown impossible.

## Retro

**Run 2026-09-11, after W53, W54 and W55 were merged. `doc/workflow.md` section 6 pass 3, and it
takes that document to [v0.16](../workflow.md) — THREE changes adopted, FIVE refused.**

P15 asked *what does a run retain, and what may a result be?* — [Q19](../open-questions.md) and
[Q22](../open-questions.md), the two oldest rows in the register, whose owner cells had both said
*no owner, needs a measured run* since P1. **Both are resolved, in one plan.** Three items, six
reader passes, one ADR, and an exit artifact that is a **measured number** rather than a flow —
the first time section 2's other option has been taken in fifteen plans.

At declaration: `spec/` 7 documents / 44 examples / **89** rules; L1-L5 **25 files / 681 cases**;
L6 **942 assertions / 42 real runs**; register **179 / 129 / 2 / 48**. It closes at **7 / 44 / 92**,
**27 / 703**, **1061 / 42** — the run count deliberately unmoved — and **191 / 139 / 2 / 50**.

### Name the rung, and it is this retro's shape

| | defect | rung |
|---|---|---|
| W53 | `RN-R13`'s test was a reachability SET, and a set cannot tell an alias from a copy | **none** — making the memo clone what it stores cost **0** at every rung |
| W53 | the second term's predicate: *live* is what a BRANCH is, *terminal* is what a JOIN becomes | **none** — conformity reader, on the rule's own fixture |
| W53 | the code had THREE release moments and three documents enumerated TWO | **none** — `doc/`, the standing class |
| W53 | `OR-R10`'s re-entrant door, made SILENT rather than created | **none** — 0 at L1-L5 and 0 at L6 |
| W54 | the suite's classifier WAS the predicate the document declines, so the two could not disagree | **none** — every row passed |
| W54 | *faithful* never checked that the value crossed; four silent losses inside one label | **none** — adequacy reader, one inserted expression each |
| W54 | two percentage bands false in both directions, from a single run | **none**, and [Q179](../open-questions.md) says why one cannot exist |
| W54 | the browser bundle inlined neither document the new suite reads | **L1-L5, and IT FIRED** — `npm run test:browser:all` exited non-zero |
| W55 | observer 2 was measuring observer 1's instrument | **none** — the contamination is in the control too |
| W55 | the byte observer — the item's whole deliverable — bound by nothing, three ways | **none** — 0 failures, 1050 assertions, exit 0 |
| W55 | the headline number carried by one `check` call three integer edits removed | **none** — 1012 assertions, exit 0, and the revert then cost 2 instead of 25 |

**Eleven defects. ONE had a rung, the rung fired, and it was reported GREEN twice** — because the
command was piped through a `grep` for a count line that prints before the failures. *The ladder was
not what failed; the reading of it was*, and that is the retro's first change.

### The three changes

1. **Section 4's green clause gains a PROCEDURE: a rung is RUN, never PIPED — redirect it and read
   `$?`.** v0.15 wrote *a rung reported GREEN means its command EXITED 0; a line of its output is
   never the predicate*, and W54 broke it **one plan later, while quoting it in its own Verification
   table**. **Four occurrences across three plans** — W42 twice, W50, W54 — and all four are an
   author reading a LINE because the rung's output was too long to read whole. Stating the predicate
   was not enough; *do not pipe* is what an author can act on and is the one thing the four share.
   **The cost of following it is nothing**: W55 ran every rung that way, both L6 runtimes and
   `test:browser:all` included, and the log is still there to grep afterwards.
2. **Rule 8 obligation (a) gains the SHAPES a rule quantifies over, not only its clauses.** W41: all
   37 probes used a `map` region, and the rule was wrong about a `fanout` and refused a valid
   document. W53, one plan later: every release case used one `map` region at depth 1 on a flow with
   no `needs`, hiding **three** defects. And P15's own fact 1 produced it a third time from the
   measurement side — after which **the item written to correct it chose its fixtures the same way**.
   W53's Record argued *enumerate the clauses* already covers it; it does, and that is why it keeps
   failing — *a clause enumeration is finite and visible, and the values a clause ranges over are
   neither.*
3. **Obligation (c)'s LIMIT gains what *independent* excludes: the second observer must not be
   DOWNSTREAM of the first's apparatus.** W55 added one that was independent in every way the word
   suggests and **it was measuring the first one's instrument** — 141.9 MiB against 129.4, one whole
   collection per run. **Every mechanism in rule 8 is blind to this by construction**: a control can
   only see what a probe ADDS, and the clean run is contaminated identically. One occurrence, adopted
   on that argument.

### Five refused, each with a measurement

- **A `doc/` check, the THIRTEENTH time.** P15's instance is the least checkable yet: *49.8%* is
  **right** in `spec/join-policy.md`, W53's file and Q19's resolved row, and **wrong** in four other
  documents — and the difference is which divisor the sentence names. A check would have to do
  arithmetic in English.
- **An `Owns` pre-declaration rule, the FOURTH plan running.** P15 is the first plan to *predict* the
  pattern — *if W53 and W54 reach `spec/README.md` and W55 does not* — and that is exactly what
  happened. It is still refused: the three files were taken no/yes/no, yes/yes/yes and no/no/no, so a
  rule naming them would have been wrong **twice on W53 and twice on W55**
  ([Q157](../open-questions.md)). *A pattern predictable from an item's CONTENT is not a rule about
  its file list.*
- **A fourth membership list**, as the general answer to [Q217](../open-questions.md)'s regress. W55
  closed the per-row layer **both ways** — the first binding of that kind here — and **could not
  close the cross-row layer at all**, because its labels are prose continuations sharing no handle.
  So the answer is a **handle**, not a list, and one occurrence of a handle is not a rule. Recorded
  rather than ruled, and it is news for Q217's row.
- **A rung, or a row in section 8's budget table.** Decision 3 refused both before any item started;
  W55 then found the number that refusal rests on is a per-ROW figure rather than a per-run one
  ([Q246](../open-questions.md)). **The refusal survives on its other grounds** and overturning it is
  not a retro's call either.
- **A rule obliging an item to re-take its own grep COUNT.** v0.15's grep procedure fired in all
  three items and **two of the three recorded the wrong number while the obligation still worked** —
  W53 recorded one where `git grep` gives three, W55 recorded nought where it gives one. The
  procedure is what matters and it worked; the number beside it is the standing count-in-prose class.

### The predictions: three CONFIRMED, one REVERSED, and the reversal was CAUSED by its own clause

| # | kind | verdict |
|---|---|---|
| 1 | derived | **CONFIRMED, scope corrected.** There is no second 49.8% to find — and the reason is not that `outputsCache` is empty. Its scope cell was narrow in the direction that mattered, and W53 measured the correction rather than inheriting the note |
| 2 | **reach** | **CONFIRMED.** No eviction shipped, decision 2's constraint was not met, and the stated reversal — *a marker that costs one field rather than a kind* — was looked for and not found rather than assumed impossible |
| 3 | derived | **CONCLUSION confirmed, stated REASON measured FALSE.** W54 takes no ADR; *a driver cannot tell* is wrong — a prototype comparison fires at 0.02-0.65% of a clone. What is true is narrower: it is blind to the NESTED case, which is what a worker writes |
| 4 | **reach** | **CONFIRMED at W53 and REVERSED at W55.** The release cost 0 L6 failures at W53 and costs **29** after W55, across 23 distinct rows |

**Prediction 4's reversal is a THIRD way a prediction can reverse, and this document had two.** P10's
retro settled that only a reach prediction can reverse; P13's added *a derived one reverses when its
measurement is narrower than its wording*; P14's added *or when the fact underneath is false*.
**P15's reversed because the item whose job was to try, tried** — and the reason it tried is that the
prediction's own reversal clause named a **constructive** test, which became W55's Scope In 4 almost
verbatim: *if this item can move that number above zero, it has written the rung nobody had.*

**So a reversal clause has a second function nobody wrote down: it DIRECTS an item.** P13's retro
added the column to make predictions falsifiable; here it made one *actionable*. **And it was wrong
about the mechanism** — it guessed *most likely by asserting the footprint itself*, and the footprint
is reported and never asserted ([Q179](../open-questions.md)); what moved the number was the
RELATION, seen by reaching past the surface a run reports. *A reversal clause is good at saying what
to attempt and says nothing reliable about how the attempt will succeed.* Recorded, not ruled: one
occurrence.

### v0.15's three changes, and v0.14's ceiling clause

| v0.15 change | What would show it was wrong | **P15's verdict** |
|---|---|---|
| **Section 4: a rung reported GREEN means its command EXITED 0** | a rung is read from its output again | **Right, and BROKEN in this plan — which is the evidence FOR it.** W54 piped `test:browser:all` through a `grep` and reported three red browsers green **twice**, in the item whose Verification table quotes the clause. Fourth occurrence in three plans. **The clause is kept and gains the procedure it was missing** |
| **Section 6: a whole-tree measurement is taken with the tree HELD STILL** | a verdict is reported about a tree that has moved | **Right, FOLLOWED by all three items, zero occurrences.** Every item recorded a digest before its gate and after, and all three matched; W55 took two gates that way and its readers both worked against one commit. **Nothing had to be refused**, which is the outcome the rule exists to make possible rather than evidence about it |
| **Section 1 rule 5: an item greps the tree for its OWN ID** | an expiry-dated claim survives an item again | **Right, and EARNED in its first full plan — it fired in all three.** W53 found *"No item has started"*, W54 thirteen hits including three of that shape, W55 four. **Its limit is the count, not the procedure**: two of three items recorded the wrong number beside it, and the sentences were found anyway |

**And v0.14's ceiling clause — *every declared survivor is RUN, against the rung its own reason
names* — had its first full plan, and the yield is ZERO.** All **twenty-four** ceilings the three
items declared were re-run at this retro on the tree the plan ships: W53's three, W54's nine and
W55's twelve, every one behaving as declared with its stated reason intact. **P13's retro measured
eleven and found one false and one stale**; this one found neither. *A clause adopted because two
claims nobody ran turned out wrong, producing a plan where none did.* The one mismatch is
bookkeeping in a gitignored harness: W53's `b5` still carries `expect: 'caught'` for a probe its own
Record classifies as the pass's one undeclared survivor and raises [Q234](../open-questions.md) for.

### The measurements

**Readers: six passes, none empty — 16 / 6 blocking, 15 / 6 blocking, 13 / 3 blocking, against
mutation counts of 27 / 41 / 41 with 9 / 17 / 19 survivors.** Overlaps **2, 4, 2** — the
**twenty-ninth, thirtieth and thirty-first** measurements, all inside the 0-4 band, none primed. The
band has not moved in thirty-one measurements and stays closed to re-litigation. **The split held in
all three**: the conformity reader found claims that were false — a ratio, a predicate, an
enumeration that did not close, three statements about a file's own behaviour — and the adequacy
reader found bounds that were not there, and in every item its findings were about **the observer's
own bounds** rather than about the product.

**Rule 8 across the plan: 112 provocations, 87 caught, 25 survivors — 24 declared ceilings and ONE
undeclared and recorded — 0 aborts, 0 against declaration.** Every set was run twice, with the
readers' own edits checked back in: eight in W53, W54's in the set from the start, sixteen in W55.
**Two re-runs found a defect in the fix rather than in the product**, which is v0.8's founding
observation: W53's re-entrancy test asserted the right thing by the wrong route, and W55's revert
probe found **a crash where a failure belonged** — an `undefined` dereference that took the whole
rung's report down before any of its twenty-nine real failures could be read.

**And re-running W55's set at this retro found a gap in v0.8's own clause.** Three of its probes
were pinned to `DECLARED_TOTAL` and `CROSS_ROW`, and both constants **moved after that set was last
run** — the crash-guard fix, which W55's own revert probe found *after* the post-reader re-run. So
the harness **aborted** rather than passing (rule 7 (b) working exactly as written: *a mutation
pinned to a magic number is unmutatable the moment the number is right to change*), and re-pointed it
is **46 probes, 34 caught, 12 ceilings, 0 aborts, 0 against declaration** with nothing else moved.
**v0.8's trigger is *after acting on the READERS' findings*, and the last fix an item makes is not
always a reader's** — W55's came from its own measurement, one step past the clause. *A repair that
could not fail is this rule's founding case, and the last repair is the one most likely to be it.*
**One occurrence; recorded rather than ruled**, and a second would earn changing the trigger from
*the readers* to *the last fix*.

**Late exceptions: 4 + 6 + 1 = ELEVEN, zero undeclared.** **Census CONFIRMED for the FIFTEENTH plan
running — 191 / 139 / 2 / 50**, 44 ids in both tables, 191 of 191 in exactly one cluster cell, and
**0 aborts at this retro**. The parser has been P15's declaration parser throughout, unchanged across
five re-derivations, and the only thing it aborted on in the whole plan was an item's own insertion —
twice. **[Q142](../open-questions.md) was measured on a scratch copy at every item and at this retro
and does NOT fire**, the fourth consecutive plan to check it and the first to check it four times.
**But the margin is closing, and the trend is the thing to hand on**: `M4`'s two-directory fixture
went **3194 → 3282 → 3361 → 3393** across W53, W54, W55 and this retro, against a floor of **3490**
— from 296 links of headroom to **97**. Nothing here fires; **the next plan to add four documents
probably does**, which is precisely the two-sided window that row describes and the sixth consecutive
plan to have to think about it.

### What the plan taught, beyond its own question

**A RATIO IS A CLAIM ABOUT A DIVISOR.** The headline of this plan's founding measurement —
*half of what a region-bearing run holds is a second copy* — is **right**, and the derived sentence
four documents carried was wrong by a factor of two in the direction that understates it. What found
it is the `Inputs:` line: **every item of this plan re-ran the facts it was handed, and every one
found something wrong** — W53 that `outputsCache` was recorded `null` for a fixture reason, W54 that
the boundary had three answers where the document named two, W55 that the ratio named the wrong
divisor and that a per-run cost was a per-row one. *Three items, three corrections, from one line in
a template.*

**AND A MEASUREMENT'S OWN APPARATUS IS PART OF WHAT IT MEASURES.** This plan measured retention, so
every observer it built was a thing that holds something — and the two sharpest findings are both
that: a reachability SET that cannot tell an alias from a copy, and a byte observer whose snapshot
became a second copy of the structure under test. **Neither is visible to a control**, because both
are present in the clean run. *When the subject is what a program holds, the instrument is in the
subject.*

### Ids

**W53, W54 and W55 issued; W56 CLOSED as reserved and never issued**, on P9's, P11's, P12's, P13's
and P14's precedent. **Q233-Q246 used; Q236, Q237 and Q247 spent and not reused.** **ADR 0046 taken;
0047 SKIPPED** on `doc/decisions/README.md`'s own *a spec rule with a rationale paragraph is better
than a spec rule plus an ADR restating it*. **The next plan starts at W57, Q248 and ADR 0048.**

