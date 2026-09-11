# P15 — What does a run retain, and what may a result be?

**Status:** DECLARED — declared 2026-09-11 after
[P14](p14-what-a-reference-means-when-two-regions-arities-are-independent.md) closed and
`doc/workflow.md` reached [v0.15](../workflow.md). **No item has started.**
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
it aliases nothing**: measured on a map of A items each returning 64 KiB, `bytes([inputs, arrivals])`
exceeds `bytes(inputs)` by **49.8%** at A = 4, 16 **and** 64, and an identity check says the stored
value is neither the log record's `result` object nor the worker's own object.

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
| **W54** | **DONE** — [Q22](../open-questions.md) is RESOLVED by **`OR-R11`** in `spec/outcome-record.md` **v0.9**, open since P1. **NO ADR: 0047 is SKIPPED and not reused.** `spec/` is 7 / 44 / **92** (`OR-R11` and `OR-R12`); L1-L5 is **27 / 703** in five runtimes; **L6 unmoved at 942 / 42**. | **A result is a VALUE, not an OBJECT** — its fields cross `OR-R2`'s clone and its BEHAVIOUR does not, silently. **Q22's fork is the wrong shape**: it IS the driver's constraint, and the question an author hits is *what arrives*. **The document said `structuredClone` THROWS on a class instance and it clones it LOSSILY** — so the boundary has three answers where it named two, and the table is 27 rows now, 5 refused / 11 intact / 11 lossy, asserted in **all five runtimes**. **Prediction 3's CONCLUSION is confirmed and its stated REASON reverses**: a driver CAN tell, at 0.02-0.65% of a clone — it is blind to the NESTED case instead, and the walk that sees it is 23-60% ([Q238](../open-questions.md)). **`OR-R12` is new and is the sharpest finding**: `OR-R6` was stated of the whole boundary and holds only at the LISTENER ([Q241](../open-questions.md)). Readers **15 / 6 blocking** and **41 mutations / 17 survivors / 6 blocking, overlap 4** — the 30th measurement, at the top of the band. Rule 8 **30 probes / 21 caught / 9 ceilings / 0 aborts**, the readers' own edits in the set from the start. **FIVE late exceptions, zero undeclared; Q238-Q242 raised, Q243-Q247 unused; census 186 / 134 / 2 / 50.** |
| **W55** | not started | |
| **W56** | reserved, expected unused | |

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

**Prediction 4 is CONFIRMED and prediction 1 is CONFIRMED with its scope corrected.** The release
costs **0** at L1-L5 and **0** at L6, so no rung made of runs can see a whole structure leave —
[Q214](../open-questions.md)'s third instance, from the REMOVAL side. **Prediction 2 is not yet
verdicted**: no eviction shipped and decision 2's constraint was not met, which is what it predicts,
but its stated reversal — *a marker that costs one field rather than a kind* — was looked for and not
found rather than shown impossible.

## Retro

*Run once the items are merged. `doc/workflow.md` section 6 pass 3.*
