# P10 — Is fan-out one feature or two?

**Status:** RUNNING — declared 2026-09-06. **[W32](../work-items/w32-what-a-map-fanout-is.md) and
[W33](../work-items/w33-a-map-at-run-time-arity.md) are both DONE** — each with its author pass, both
readers, rule 8's re-run with the readers' own edits checked in, and a green gate after acting on
them. **W34 and W35 have not started.** **Read every item's status from its own file, never from this line** (`doc/workflow.md`
section 1 rule 5, including its *any copy, including your own* clause — which W32's own Record
violated and corrected, by writing down a browser count measured before the change it described).
**Runs after [P9](p9-when-a-check-stops-checking-what-notices.md), which is complete and retro'd.**

**Question this plan answers:** [Q12](../open-questions.md) — *is fan-out one feature or two?*

**Exit artifact:** **a map-fanout running end to end on a real scheduler** — its arity taken from
the previous node's output rather than from the definition, its join firing over branches nobody
declared, and the join's successor carrying the collected results — with the join/failure matrix run
at run-time arity beside it.

**Reserves:** W32-W35, **Q154-Q168**, ADR 0036-0037

---

## Why this plan, and why now

**Nine plans have run and none has changed what the library can express.** P1 settled what satisfies
a join; P2 ran the non-success half on real workers; P3 built the reference; P4, P5 and P6 took the
driver's lifetime, the policy set and the scheduler edge; P7 made fan-out nest; **P8 and P9 were both
spent on the gate**, and the gate now costs **347.0 s proving its checks can fail against 4.3 s
running them, a factor of 81** ([Q133](../open-questions.md), still open). Two consecutive
meta-plans is enough.

**[Q12](../open-questions.md) is the only open question that might mean the library is missing a
FEATURE rather than a guarantee**, and it has been open since P1. Its row states the case and this
plan does not improve on it:

> *"Route to A and B in parallel"* (a static parallel split, arity known at authoring time) and
> *"run this node once per item in the previous output"* (a map, arity known only at run time) are
> different features wearing one word. The second is what makes the 1000s-10000s workload in
> `FLOW_PLANNING.md` real, and it is the one that makes Q4's counter dynamic. **Deciding they are
> the same primitive is a choice, not an observation.**

**The library ships the first and not the second**, and section 2 below is where that stops being a
claim read off `src/definition/types.ts` and becomes seven measurements.

## What was measured before this plan was declared

**The practice this section is: measure a load-bearing fact before declaring.** Its running count is
quoted here **with the document it came from, because the two documents disagree and neither is
re-derived here**: `doc/workflow.md` section 4's v0.9 note says *"Nine plans have measured a
load-bearing fact before declaring and in all nine it changed what got written"*, and
[P9](p9-when-a-check-stops-checking-what-notices.md)'s own declaration says **thirteen**, on the wider
predicate that counts items as well as plans. **P10 does not add a number to that**, because the
predicate is not stated anywhere in one expression and this plan has not derived one — which is
section 1 rule 5's writing clause applied to the sentence that introduces its own measurements.

**Seven facts were measured here. Four changed what this plan says**, and two of them made it
substantially smaller than Q12's row reads. Every figure below came from a run; the scripts are
thrown away with `dev-dist/`, and the commands are named so each is re-derivable.

### 1. A map-fanout is refused today, and it is refused in three different ways depending on arity

Against the shipped validator (`src/definition/validate.ts`), with a registry naming one
`workerType`:

| encoding | findings | refused by |
|---|---|---|
| `branches: ["x","x","x"]` — a map over 3 items | **4** | `FD-V9` *"fanout repeats a branch entry"*, and `FD-V19` three times — *"node is in two branches of fanout"* |
| `branches: ["x"]` — a map over 1 item | **1** | `FD-V9` *"fanout has 1 branches, needs at least 2"* |
| `branches: []` — a map over 0 items | **3** | `FD-V9`, and **`FD-V11` twice** — the join and the `end` are *"not reachable from entry"* |
| `branches: ["a","b"]` — the static split that ships | **0** | the control, and it passes |

**The refusal is quoted rather than paraphrased**, and the arity-dependence is the part nobody had
written down: a map is not blocked by one rule but by three, and which one fires depends on how many
items the previous node returned.

### 2. The id scheme splits in two, and the two halves get opposite answers

**This is the fact that makes P10 smaller than Q12's row reads.**

**The GRAMMAR admits run-time arity completely.** `spec/task-id.md` section 1 gives `branchPath` as
`-` or `^(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))*$`, and `buildTaskId`/`parseTaskId` round-trip every
index tried: `0`, `1`, `2`, `7`, `42`, `137`, `9999`, `1000000`, and the nested forms `3.11`,
`137.0`, `0.9999`. **500 ids minted for one node at 500 run-time indices are 500 distinct strings.**
So the shape P1 reserved and W21 produced already carries a map: **no id format change, and
therefore none of the change to *"every fixture, every log line and every test name"* that
`spec/task-id.md` section 1 spends its argument on.**

**The DERIVATION pins it absolutely.** The driver does not carry a path; since
[W21](../work-items/w21-the-branch-path-is-a-path.md) it derives one, and `branchPathOf(regions,
nodeId)` in `src/definition/regions.ts` takes **the region sets and a node id and no run-time input
at all**. Three dispatches of one node therefore produce **one distinct id of three**, and the second
hits `ID-R1` as a `DuplicateTaskId`.

**So the thing a map breaks is precisely the sentence W21 made true one plan ago** —
`spec/task-id.md` section 1's *"`branchPath` is a property of the node"* — and that sentence names
its own load-bearing rule: *"it only is because `FD-V19` refuses convergent branches"*. `FD-V19`'s
own refusal text in `spec/flow-definition.md` section 5 says the same thing from the other side: a
shared node's branch index is *"a property of the traversal rather than of the node, so `branchPath`
stops being derivable"*. **A map is that condition on purpose**, which is why
[Q27](../open-questions.md)'s row already says answering it *"is close to Q12's map-style fan-out,
since both turn one node into many dispatches."*

### 3. The join needs almost nothing, and that is ADR 0030's shape a second time

Measured with a `Proxy` on `Region.branches` that reports when it is read, rather than by reading the
three policies:

| policy | reads `region.branches`? |
|---|---|
| `arrival-count` | **yes** — `open: (region) => ({ need: region.branches.length, … })` |
| `live-token` | **no** |
| `live-token-requiring-arrival` | **no** |

**Two of the three are already arity-independent.** Fed a region whose static `branches` names one
node while the run opens N, every verdict at N=3, N=7 and N=1 is **identical to the static control at
N=3** — `satisfied` on all-arrived, `satisfied` / `unsatisfiable` on all-exited and all-lost as the
two policies respectively already do.

**[ADR 0030](../decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
measured that nesting needed NO mechanism.** Run-time arity is the same shape on two of three
policies, and it is checked here rather than assumed because the plan's scope turns on it: **P10 is a
definition-and-driver plan, not a join plan.**

### 4. But `arrival-count` at run-time arity does not hang — it fires EARLY, and that is a failure direction nothing here has seen

W4's matrix recorded arrival-counting failing on six of nine rows by `need` being **too large**: the
counter never reaches N and the run waits with no error. At a run-time arity the static list does not
name, `need` can be **too small**. Measured event by event, with `branches: ['x']` and three branches
opened:

```
branch.opened 0    waiting
branch.opened 1    waiting
branch.opened 2    waiting
branch.arrived 0   satisfied   <== FIRES, with 2 branches still live
```

The live count is taken from `live-token` over the same stream, so *"2 still live"* is a second
policy's reading rather than this one's own arithmetic. **A join fired while its branches are still
running is not a hang and is not silence; it routes the successor over a region that has not
finished.** `arrival-count` is not what an application passes (ADR 0003 rule 1) and it **is** a
matrix column that must keep answering, which is W33's problem and is named in its file.

### 5. N = 0 hangs in all three policies, and it is a case that cannot exist today

An empty input list opens no branch. Measured:

| policy | verdict at N=0 | `describe` |
|---|---|---|
| `arrival-count` | `waiting` | `{"need":1,"arrived":[]}` |
| `live-token` | `waiting` | `{"live":0,"positive":false}` |
| `live-token-requiring-arrival` | `waiting` | `{"live":0,"positive":false,"arrived":0}` |

**`live-token` hangs because of the clause ADR 0003 put in deliberately** — *satisfied when the count
reaches zero **having been positive*** — and `positive` is false when nothing opened. `FD-V9`'s
*"fewer than two branches"* means **the static feature can never produce N=0**; a map produces it the
first time a filter returns nothing. This is the one place where a map is not the static feature at a
different arity, and it is a decision rather than a mechanism.

### 6. The join's successor receives `null`, so a map has no output — and that is why Q11 and Q12 are one plan

Measured at ladder L2 with no scheduler, over a flow `seed → fanout → {a, b} → join → after → end`:

```
r1:seed:-:0   payload = {"items":["p","q","r"],"note":"the previous node output"}   (the run's own)
r1:a:0:0      payload = {"items":["p","q","r"],"note":"the previous node output"}
r1:b:1:0      payload = {"items":["p","q","r"],"note":"the previous node output"}
r1:after:-:0  payload = null
```

**A node receives the previous node's output unchanged** — no accumulator, no per-edge mapping, which
is [Q11](../open-questions.md)'s three candidates with the first shipped and the other two unbuilt.
**And the join's successor receives `null`**, deliberately and for a good reason
(`src/driver/driver.ts` — *"which one arrives is decided by fan-out completion order"*), with
`spec/` saying nothing about it at all: [Q36](../open-questions.md).

**A map that runs N tasks and hands its successor `null` has computed N results and thrown all of
them away.** That is why this plan takes Q36 and the fan-out half of Q11 inside it rather than
beside it — **not because both touch a payload, but because a map's whole deliverable IS the join's
payload.** Q11's row calls itself *"the API surface users touch most, so it is the one most expensive
to change later"*; Q36's row already names Q11 and Q8 as what it interacts with, and its owner cell
says **W2**, an item from P1 that has been done since.

### 7. The fan-out hands ONE object to every branch, and that is live in shipped code

From the same L2 run: `a.payload === b.payload` is **`true`**. The payload **is** cloned once —
`a.payload === the settled result` is `false`, because `cloneValue(outcome.result)` at the edge hop
protects the log — and **that single clone is then shared across every branch**. Branch A pushing to
its payload's array is visible to branch B:

```
after branch a mutates its payload, branch b sees:
  {"items":["p","q","r","MUTATED-BY-BRANCH-A"],"note":"the previous node output"}
and the seed's own result object still reads:
  {"items":["p","q","r"],"note":"the previous node output"}
```

**The log is protected and the siblings are not**, and `spec/` states no contract on it.
**Measured across all seven documents in `spec/`, not the three this claim was first written from:**
the word `payload` occurs **six times on five lines in three documents** — `outcome-record.md` three
(the outcome record's own `payload` FIELD, and the rule that a record must not be named `payload`),
`join-policy.md` one (*"`settleJoin` takes no payload parameter"*, which is [Q36](../open-questions.md)),
and `task-id.md` one (`start(payload)`'s signature). **Not one of them says what a node receives, and
none says whether two branches may share it.** *(This sentence first read "three times across the six
spec documents", from a grep over **three** of them. Caught inside this declaration, which is the
same generalisation `doc/workflow.md` section 1 rule 5's writing clause was adopted for — and W30's
own instance was a census that omitted a document too.)*

**The scope this was measured at, stated rather than generalised** (`doc/workflow.md` section 1
rule 5's writing clause): **one flow, at ladder L2, with `createTask: (c) => c`.** Whether a
**thread** pool's own structured-clone boundary hides it — as it hides `OR-R6` in
[Q61](../open-questions.md)'s measurement, in the opposite direction — is **not measured**, and an
inline pool is where [Q61](../open-questions.md) says the sharp edge lands. Raised as
[Q154](../open-questions.md), owned by W34, which is the item that has to answer what a branch
receives anyway.

## Scope

**In**

1. **[Q12](../open-questions.md) — is fan-out one feature or two — answered by an ADR** (0036),
   evidenced by a build rather than by an argument, which is P1's method for Q4 and
   [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s.
2. **A map-fanout that runs**: the definition shape, the validator's rules for it, and `branchPath`
   at an arity the definition does not know.
3. **The three shipped policies at run-time arity**, including `arrival-count`'s early fire
   (fact 4) and **N=0** (fact 5), which is the case no shipped flow can currently reach.
4. **[Q36](../open-questions.md) — what a satisfied join carries downstream — answered by an ADR**
   (0037), **after the map runs rather than before**, so the decision has live cases rather than a
   mechanism. See the ordering note under Work items.
5. **[Q11](../open-questions.md), narrowed to the fan-out edge**: what a branch entry receives.
   Including [Q154](../open-questions.md), fact 7's sibling aliasing, which is live today.
6. **The join/failure matrix at run-time arity**, and **ladder L6** on real workers in both runtimes.

**Out** — named rather than left implicit, so this plan is not read as having closed them

- **[Q9](../open-questions.md) — predicate purity — is OUT, and it is out with a measurement rather
  than on scope.** See *"Q9, declined with a measurement"* below. It is left **open**, not resolved.
- **[Q8](../open-questions.md)** — whether a decision sees accumulated run state. Not forced by a
  map: a map decides arity from one node's output, which is what a decision already sees. It shares
  Q11's retention cost and belongs with [Q19](../open-questions.md).
- **[Q19](../open-questions.md) and [Q21](../open-questions.md)** — retention and redaction. Q11 and
  Q36 both *interact* with them and deciding them is a different plan; a plan that answers what a
  join carries has made retention **measurable**, which is what Q19's row says it needs.
- **[Q27](../open-questions.md)** — convergent branches. It is fact 2's neighbour and its row already
  points at Q12, but *"may two branch entries meet at a shared node"* is a question about the
  **static** feature. If ADR 0036 answers *two features*, Q27 is untouched; if it answers *one*, the
  ADR must say what it did to Q27 rather than leaving a reader to infer it. **Named as a thing the
  ADR owes a sentence, not as a thing this plan answers.**
- **[Q23](../open-questions.md), [Q16](../open-questions.md), [Q22](../open-questions.md)** — leaving
  a region, flow-level retry, structured-cloneability. All reachable from a map and none forced by
  one.
- **The whole Verification and fixtures cluster** — **38 ids**, counted from the cluster cell itself
  after this declaration added [Q155](../open-questions.md) to it; it was 37 before, which is the
  figure to quote for the state P10 inherited. **It has resolved TWO** —
  [Q126](../open-questions.md) by [W24](../work-items/w24-the-gates-own-wiring.md) and
  [Q141](../open-questions.md) by [W29](../work-items/w29-the-two-self-tests-that-grade-nothing.md) —
  which is checked here because *"it has never resolved one"* was the claim P10 was handed and it is
  **false**, by the register's own predicate: the status cell. **Two of thirty-eight is still the
  worst ratio of any cluster** and the point the claim was making survives; the number did not.
  *(Checked in passing and NOT fixed, because it is not this plan's to fix and changing it would be
  resolving a question P10 did not resolve: `CLAUDE.md` states **"Q121 is RESOLVED"** in its W25
  paragraph while [Q121](../open-questions.md)'s own status cell reads `open`. The register's cell is
  the predicate, so this plan's census counts it open. Recorded so whoever owns it sees it.)*
  P9 left twelve of its own open. In
  particular [Q133](../open-questions.md) (whether a `verify` chain splits out of `gate`; the
  decision is owed and P9 declined it on scope, with [Q148](../open-questions.md) as the constraint),
  [Q149](../open-questions.md), [Q151](../open-questions.md)-[Q153](../open-questions.md),
  [Q144](../open-questions.md), [Q137](../open-questions.md), [Q102](../open-questions.md).
  **[Q142](../open-questions.md) is the exception and it is not optional — see below.**
- **[Q131](../open-questions.md), [Q135](../open-questions.md), [Q123](../open-questions.md)** — the
  register's three malformed rows, deliberately unfixed for three plans so whoever builds that check
  has live defects to fire on. Any census parser here carries **Q119 and Q71 as declared exemptions**
  and **splits on unescaped pipes with no code-span awareness** — W30's span-aware parser aborted on
  three rows that render perfectly, because GFM cuts a row on `|` before it parses inline code.
- **[Q96](../open-questions.md)** — whether `live-token-requiring-arrival` should be what the library
  recommends. ADR 0026 stays **held** for [Q97](../open-questions.md), for the sixth plan.

### [Q9](../open-questions.md), declined with a measurement

`doc/workflow.md` section 6 pass 3 rule 1 says *"no change" is an expected verdict*, and the same
applies to a question a plan declines: **the finding is that no mechanism worth its cost exists, and
recording it is cheaper than having it rediscovered.** Q9's row asks how purity is *"enforced rather
than requested"* and cites ladder L3. Three candidates, measured:

| candidate | result |
|---|---|
| **freeze the argument** | already effectively done — the driver hands the predicate `cloneRecord(outcome)`, and an assignment to a frozen `ctx` is refused. **Catches mutation of the context and nothing else**: not a clock, not `Math.random()`, not a counter, not IO |
| **evaluate twice and compare** | caught **1 of 4** impurity shapes. The counter differs and is caught; the clock, the network call and `Math.random()` all **agree**. And `Math.random()` agrees about half the time, so the detector is **flaky** — the one property `doc/concept.md` section 5 and `CLAUDE.md` both refuse |
| **ladder L3, the rung the row cites** | **structurally cannot reach a predicate.** L3 folds a hand-written `FoldInput[]` (`test/fold/fold.test.ts`), and a `FoldInput` carries an outcome record and a region event — **routing is already decided** by the time the fold sees anything. `selectEdge` is called from the driver, never from the fold, so L3 folds twice and gets the same answer whatever the predicate did |

**The third is a finding about the ladder rather than about Q9**, and it is raised as
[Q155](../open-questions.md) with no owner: *the rung the register cites for determinism does not
cover the thing that makes routing non-deterministic.* Q9 stays **open** with the measurement on its
row — the shape [W23](../work-items/w23-a-nested-flow-on-real-workers.md) used to decline
[Q90](../open-questions.md) — rather than being resolved by a plan that built nothing for it.

## Decisions taken before fan-out

`doc/workflow.md` section 7 rule 3: **decide, then fan out.** Its own named gate is *"Q1, Q2 and Q4
must be resolved or explicitly scoped out before fan-out"* for any plan that touches routing.
**All three are resolved** — [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md),
[ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) and
[ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) — so the
gate is cleared. Four decisions are taken here, and **two of them are deliberately NOT taken.**

1. **The items are SERIAL.** `doc/workflow.md` section 7 rule 2 makes two *concurrent* items that
   would edit one file into one item, and explicitly does not bind a serial one. W33 and W34 both
   need `src/driver/driver.ts`; they run in order and W34 declares it, exactly as P9's four items
   shared `scripts/**` in sequence.
2. **Q36 is decided AFTER the map runs, not before.** P9's retro names *"a claim written from a
   mechanism instead of from the cases"* as the first thing that bit its four items — W31 reasoned
   about a mechanism, wrote *"it costs nothing"*, and its twelfth entry falsified it on the first
   run. A join-payload rule written before a map exists has one case (the static split) and would be
   generalised to the case that matters. **So W33 ships the map with the join still carrying `null`,
   and W34 decides Q36 with both shapes in front of it.** This is the ordering the plan is most
   likely to be argued out of, and it is written down here so that reversing it is visible.
3. **What ADR 0036 must rule on is NOT "should a map exist".** It is *are these one primitive or
   two*, and section 2's facts are the evidence: a map needs **no id-scheme change** and **no change
   to two of three policies**, which argues *one*; and it breaks `branchPath`-as-a-property-of-the-node,
   makes `FD-V9`'s arity floor meaningless, reaches an N=0 the static feature cannot, and gives
   `arrival-count` a **new** failure direction, which argues *two*. **The ADR states which of those
   it weighed and how, and it says what it did to [Q27](../open-questions.md).**
4. **No refusal is declared in advance.** P7 settled before fan-out that `arrival-count` would REFUSE
   nested fan-out, on a mechanism W22's declaration showed does not exist, and the refusal, a driver
   check, a new error class and the matrix's declared-empty cells were all struck. **This plan
   declares no policy refusal, no construction check and no new error class**, because every
   candidate for one is a measurement W33 has not taken yet.

**Not taken:** whether a map's branch entry may itself be a `fanout` (nesting a map inside a map),
and whether a map's arity has an upper bound. Both are real and both are answerable only once
something runs; they get Q ids from this plan's block if they survive W33.

## Work items

**Four, serial.** Each has its own file under `doc/work-items/`; **this table is an index, not the
declaration**, and `doc/workflow.md` section 7 rule 2 says an item's `Owns` is written **from this
row**, never from its title — the sentence that took P7's late exceptions from five to zero.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W32](../work-items/w32-what-a-map-fanout-is.md) | **What a map-fanout is, and what its `branchPath` is.** The definition shape, the validator, and the derivation fact 2 pins. **ADR 0036** | `src/definition/**`, `src/driver/ids.ts`, `spec/flow-definition.md`, `spec/task-id.md`, `spec/README.md`, `spec/examples/**`, `test/definition/**` | nothing | L0, L1, L4 |
| [W33](../work-items/w33-a-map-at-run-time-arity.md) | **A map at run-time arity**: the driver dispatching N, the region event stream, the three policies, `arrival-count`'s early fire and **N=0**. The join still carries `null` | `src/driver/driver.ts`, `src/driver/events.ts`, `src/driver/policy.ts`, `src/fold/**`, `spec/join-policy.md`, `test/driver/**`, `test/fold/**` | W32 | L0-L3, L5 |
| [W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) | **What a branch receives and what a join carries.** [Q11](../open-questions.md) narrowed to the fan-out edge, [Q154](../open-questions.md)'s aliasing, and [Q36](../open-questions.md). **ADR 0037**. The matrix at run-time arity | `test/matrix/**`, `src/driver/routing.ts`, and `src/driver/driver.ts` **handed over serially from W33** | W33 | L1, L2, L5 |
| [W35](../work-items/w35-a-map-on-real-workers.md) | **A map on real workers** — the plan's exit artifact, in both L6 runtimes | `examples/**` | W34 | L6 |

**`src/driver/driver.ts` is in two rows and that is deliberate.** It is named in both because the
items are serial and section 7 rule 2 permits it; W34's own file declares it rather than taking it as
a late exception, which is the difference between P7's W20 (five late) and its W23 (zero).

**W35 is the exit artifact and is not optional.** A plan must *"touch every layer it claims to touch.
No stub standing in for the interesting part"*, and for this plan the interesting part is that a map
dispatches real tasks whose ids nothing declared. L6 lives in `examples/**` and **not** in `test/**`,
deliberately: the browser bundle globs `test/**/*.test.ts`, so anything importing a scheduler placed
there is bundled for a runtime L6 does not run in (`RT-R10`).

## Predictions, written down before the items that test them

`doc/workflow.md` v0.10's fifth obligation was **earned against a prediction P9 wrote into its
work-items section before W30 started**, and P9's retro says why: *"a prediction written down before
the item is what makes this a measurement rather than hindsight."* Four are written here. **A
prediction this plan's retro reverses is worth more than one it confirms.**

| # | prediction | the item that tests it | what would reverse it |
|---|---|---|---|
| 1 | **`spec/task-id.md`'s GRAMMAR is unchanged and its section 1 PROSE is falsified.** Fact 2 measured the first half; the second follows from *"`branchPath` is a property of the node"* being the claim a map breaks | W32 | the grammar needing a change — a segment shape, a depth bound, or an arity marker — which would mean a map is not the reserved shape at a different arity |
| 2 | **`live-token` needs NO change**, and the whole of this plan's join cost is `arrival-count`'s `need` plus the N=0 case | W33 | `live-token` needing one line. Fact 3 measured that it never reads `region.branches`; **it does not follow that nothing else about it is arity-dependent**, and that gap is exactly where P9's reversal lived |
| 3 | **Rule 8's FIFTH obligation — break the WIRING — FIRES on a `src/` item.** All three of its instances are in `scripts/**`, and P9's retro leaves open whether it generalises past a harness. `src/` has wiring of the same shape: a policy that is never consulted, a clone that is never applied, a region event never emitted | W33, W34 | the obligation producing nothing a value-, bound- or provenance-probe did not already reach — which would make it **a fact about self-tests**, and P10's retro owes that verdict either way |
| 4 | **This plan takes BOTH reserved ADRs.** P9 predicted none and took none, correctly, because it changed harnesses. Q12 and Q36 are architecture | the retro | either being skipped, which would mean the plan decided less than it built — the signal P9's plan named for itself in the opposite direction |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q12](../open-questions.md) | **is fan-out one feature or two** — the plan's question. Open since P1 | **W32**, by ADR 0036 |
| [Q36](../open-questions.md) | what a satisfied join carries downstream. Its owner cell reads **W2**, an item from P1 done since | **W34**, by ADR 0037 |
| [Q11](../open-questions.md) | what a node receives as its payload — **narrowed to the fan-out edge**, not answered in general | **W34** |
| [Q154](../open-questions.md) | **new, raised by this declaration** — a fan-out hands one object to every branch, so a branch mutating its payload is visible to its siblings. Measured at L2 in one flow with `createTask: (c) => c`; the thread-pool half is unmeasured | **W34** |
| [Q155](../open-questions.md) | **new, raised by this declaration** — ladder L3 folds a log whose routing is already decided, so the rung the register cites for determinism cannot reach a predicate | no owner |
| [Q9](../open-questions.md) | predicate purity — **declined with a measurement above, and left open** | no owner |
| [Q27](../open-questions.md) | convergent branches — **not answered**; ADR 0036 owes it a sentence | no owner |
| [Q142](../open-questions.md) | `check-markdown`'s two-sided window — **this declaration trips it**, see below | this plan's declaration |

## What this declaration edits, and the exception it declares in advance

**Six record-step files** (`doc/workflow.md` section 1 rule 5): this plan file, the four work-item
files, `doc/README.md`, `CLAUDE.md`, `README.md` and `doc/open-questions.md`. `doc/decisions/**` is
on that list and no ADR is written yet.

**One declared exception, and it is measured rather than anticipated:
`scripts/check-markdown.mjs`.** [Q142](../open-questions.md)'s window is two-sided — `M3`, `M4` and
`M5`'s floors must sit **above** the `removes` probes' fixtures and **below** the whole tree — so an
item that adds documents is obliged to retune a constant in a file it does not own.
**[Q102](../open-questions.md)'s shape, and worse**, because the failure lands on the probes rather
than on the check. It hit P9's declaration and W30, both of which had to take it late.

**Measured before writing anything**, by copying `scripts/`, `doc/`, `spec/` and the three root
documents to a scratch tree outside the repository and running the copied check three times:

| | files | links | anchored |
|---|---|---|---|
| whole tree | 67 | 2025 | 99 |
| `doc/decisions` removed | **51** | 1827 | 99 |
| `doc/decisions` **and** `doc/plans` removed | 41 | **1455** | 99 |

The floors are `M3` at `< 56`, `M4` at `< 1530`, `M5` at `< 60`. **This declaration adds five
documents that survive both removals** — the plan file lives in `doc/plans` and the two ADRs in
`doc/decisions`, but the **four work-item files** are in neither, and the plan file survives the
`doc/decisions`-only removal. So the one-directory fixture goes **51 → 56**, which is not `< 56`, and
probe 1 stops firing `M3` exactly as it did at P9's declaration.

**So this is the third plan running to hit Q142, and the first to measure it BEFORE the documents
landed rather than after the gate went red.**

**What happened, measured after the five documents existed rather than predicted from the table
above:**

| | files | links | anchored |
|---|---|---|---|
| whole tree | 72 | 2145 | 99 |
| `doc/decisions` removed | **56** | 1947 | 99 |
| `doc/decisions` **and** `doc/plans` removed | 45 | **1507** | 99 |

**The one-directory fixture landed on 56 exactly, as predicted.** `M3`'s floor is retuned **56 → 64**
(the window is `> 56 and <= 72`) and `M4`'s **1530 → 1720** (`> 1507 and <= 1947`). **`M5` is
untouched at 60 against 99, for the third plan running**, because no `removes` probe moves the
anchored count — every anchored link is in `doc/`'s top level.

**Both declared exceptions were used, and the second one is rule 7 (b) firing correctly rather than
passing.** With the floors retuned, `check:markdown:selftest` came back at **exit 1** with two
entries reading *"the mutation matched nothing"* — the two `META` entries are anchored on the
literals `if (r.files < 56)` and `if (r.links < 1530)`, which no longer exist. **A mutation pinned to
a magic number is unmutatable the moment the number is right to change**, which is the sentence P9's
declaration wrote about this same pair. Repointed, and the file is back to **37/37 probes caught,
37/37 noticed — 31 by the named probe, 6 by the corpus, exit 0**, which is the shape P9's retro
recorded.

**The `Owns` audit for this declaration is ELEVEN files and zero undeclared**, by
`git diff --name-only` plus `git status` for the new ones: the plan file and four work-item files
(this declaration), `CLAUDE.md`, `README.md`, `doc/README.md` and `doc/open-questions.md` (four of
section 1 rule 5's six record-step files; no ADR is written yet, and the plan's own Record is this
file), and the two declared exceptions above.

## A note on ids

Verified against the working tree rather than inherited from an index:

- **Plans.** P1-P9 all exist and are complete; **P10 is this file.**
- **Work items.** `doc/work-items/` holds W1-W6, W9, W12-W25 and W28-W31. **W32-W35 are this plan's.**
  **W26 and W27 stay skipped and are never reissued** (P8 declared W26 and dropped it before it
  started). **W10 stays HELD** — `check-owns.mjs`, retired as a proposal for the fifth plan running
  — and **W11 stays SKIPPED**.
> **Correction, at W32's hand-off — the reserved Q blocks in this plan's four work-item files
> COLLIDED with the two ids this declaration had already spent, and it was found by trying to act on
> them.** Recorded here rather than silently rewritten. W32's file read `Reserves: Q154-Q157`, and
> **Q154 was already raised by this declaration and assigned to W34** while **Q155 was already raised
> with no owner** — so W32 would have allocated from a block whose first two ids were spent, and W33's
> and W34's blocks were shifted by the same error behind it. **Corrected to W32 `Q156-Q159`, W33
> `Q160-Q163`, W34 `Q164-Q166` (it already owns Q154), W35 `Q167-Q168`, and this plan's block widened
> to Q154-Q168. Nothing is renumbered** — Q154 and Q155 keep the meanings they were given here.
>
> **This is [W31](../work-items/w31-the-self-list-check-policies-never-had.md)'s exact failure one
> plan later**: its `Reserves: Q146-Q148` collided with W29, which had reserved the same block and
> used all three. **W31's was the first time a row was found wrong by trying to act on it before the
> item had run anything; this is the second, and it is worse in one way** — W31 collided with a
> *different item's* block, and this collided with **ids the same declaration had raised four sections
> further up its own file.** The mechanism is the same both times: the `Reserves:` line is written
> when the item file is drafted, and the ids the declaration itself spends are allocated afterwards.

- **Q ids.** The highest used is **Q153** (W31's). **Q154-Q168 reserved** (widened from Q154-Q163 by
  the correction above); two are used by this
  declaration and the rest are expected to be spent by the items, with unused ones skipped. P9 was
  the first plan to spend its whole block, on four items.
- **ADRs.** `doc/decisions/` holds 0001-0004, 0007, 0013-0015, 0022, 0023, 0025, 0027, 0029 and 0030.
  **0036-0037 reserved and BOTH EXPECTED TAKEN** — prediction 4. **0026 stays held** for
  [Q97](../open-questions.md) for the sixth plan; 0005-0006, 0008-0012, 0016-0021, 0024, 0028 and
  0031-0035 stay skipped.
- **Upstream wants.** No `S` id is reserved. [S9](../scheduler-upstream.md) is the one live item and
  nothing here touches it.

## The baseline this plan starts from

One gate run at `6130fda`, with a clean working tree, **read from the log's own `GATE EXIT` line
rather than from a shell wrapper's code**:

```
GATE EXIT=0     0 FAIL lines     19 chain entries     9m40s wall
474 test() CASES, 19 files, in node 24.20.0, deno 2.9.6 and chromium (parity with node: 474)
489 assertions at L6, 0 failed, in node and deno
spec — 7 documents, 30 examples, 75 rules
markdown — 67 documents, 2025 relative links, 99 anchored
```

**Four things about those numbers.** `npm run gate` runs `test:browser`, which is **chromium only**;
firefox and webkit need `test:browser:all`, which was **not** run for this baseline, so the runtime
claim above is *three*, not five. **474 counts `test()` cases and 489 counts individual assertions
([Q98](../open-questions.md)) — they are never added.** The 9m40 is a **third** reading beside P9's
recorded 366 s and 438 s on identical work; the spread is real and a timing here is quoted with a
control or not at all. And the gate's cost split — **4.3 s of checks against 347.0 s proving they can
fail** — is P9's pair from one pass and is not re-derived here, because nothing in this plan changes
it.

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** *Where it is, and how to re-produce it.*

**What the plan answered.** *Q12, answered — including "they are one feature after all", which is a
real possible outcome and is the one this plan's own facts 2 and 3 argue for.*

**Retro.** *`doc/workflow.md` section 6 pass 3. It owes a verdict on each of v0.10's three changes —
whether the fifth obligation generalises past a harness (prediction 3), whether "fires for the reason
it names" fires on a product item's set, and whether the WRITING clause fires outside the register —
and a verdict on each of the four predictions above.*
