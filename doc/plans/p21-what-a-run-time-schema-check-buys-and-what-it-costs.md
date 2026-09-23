# P21 — What a run-time schema check buys, and what it costs against what a settlement already pays

**Status:** **COMPLETE and RETRO'D** — `doc/workflow.md` is [v0.22](../workflow.md), ONE change adopted and FIVE refused. All three items done: [W80](../work-items/w80-what-a-run-time-result-check-is.md)
(ADR 0060, `OR-R13`, `spec/outcome-record.md` v0.10),
[W81](../work-items/w81-what-a-settlement-costs.md) (the price, no ADR, **Q320 RESOLVED**) and
**[W82](../work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md)**, the exit artifact —
two L6 rows on real workers in both runtimes where two workers return values their own
`outputSchema` refuses and the run reports each BY NAME, with the check-OFF pair beside them and
**L6 at 1724 / 58** from 1639 / 55. No ADR: **0061 reserved and UNUSED**. Declared 2026-09-19 on `eb1dbe5` (P1-P20 complete and
retro'd, `doc/workflow.md` [v0.21](../workflow.md)), its facts measured the same day into
`dev-dist/p21/`.
**Question this plan answers:** *What does holding a worker's RESULT to the schema it declares buy a
consumer, and what does it cost against the clone the driver already pays on every settlement?*
**Exit artifact:** an L6 row on a real `FyflowScheduler` in **both** runtimes where a worker returns
a value its own `outputSchema` refuses and the run reports it by name **while carrying it downstream
unaltered** — plus **the measured cost of having the check ON for the whole rung**, against the same
rung with it off.
*(This line read *"reports it by name rather than carrying it downstream"* — the FOURTH standing copy
of the claim this plan's own commit `c869a4b` WITHDREW when the maintainer answered stop-and-ask (b),
after the three W80's conformity reader found. ADR 0060 decision 3 states the cost rather than hiding
it: a value that fails its schema still flows downstream, and `examples/l6.ts`'s check-OFF pair
asserts that every settled RESULT is the same value either way. **W82's conformity reader, finding 3,
and that item's own finding 3 had checked only the Status line three lines above this one.**)*
**Reserves:** W80-W83 (W83 expected unused), Q330-Q344, ADR 0060-0061 (0061 expected unused).
*Derived by grep off the tree, never from a sentence — see [A note on ids](#a-note-on-ids).*

---

## Why this plan, and why now

**This is [P19](p19-what-a-schema-buys-an-author.md)'s slice 1, deferred twice, and the reason both
deferrals gave is measured FALSE at this declaration.**

[P16](p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) called it *strict mode* and
put it last. P19 departed from that name on the maintainer's argument that the schemas were for the
**author** — *a runtime failure is a different problem, and per-settlement validation is the
expensive way to learn it*. [P20](p20-what-the-runtime-owes-a-consumer.md) deferred it again on
*a gap outranks a price*, and said plainly that slice 1 was next in that order.

**Fact 4 is what makes it declarable: the price is not what either plan assumed.** Timed on the
corpus's own results against the values a real run produced, a per-settlement `outputSchema` check
costs **92.9%, 14.7% and 5.9%** of the `structuredClone` the driver **already pays unconditionally**
on the same settlement — and the share **FALLS as the workload grows**, because the clone is linear
in the whole value while the check short-circuits on the schema's shape. On the largest result
measured the ratio is **0.00x**: `publish`'s value takes 0.3647 ms to clone and 0.0006 ms to check.

*Two plans deferred this as the expensive road. It is a shrinking fraction of a cost nobody chose
and nobody can decline.*

### What this plan is NOT allowed to assume, because fact 3 measured it

**The two defects this feature would have been argued from are both CLOSED, by two different
mechanisms, and both are W73's.** [Q302](../open-questions.md) named them from the workers' code:
`split`'s per-item `confidence` of `word.length / 10` exceeding its declared `maximum: 1`, and
`weigh`'s `score` of `confidence * run.confidence * 100` exceeding `maximum: 100`. Run through a real
`createRuntime` at this declaration:

- the first is **clamped in the code** — `Math.min(1, word.length / 10)` in
  `examples/workers/shared.ts`, in a comment that names Q302 and W73's stop-and-ask 4;
- the second is **refused at the entry boundary** — `FD-R4` throws `BoundaryRefused` at `start()`
  naming `$.confidence above maximum 1`, so the payload that would produce it never dispatches.

**So the feature has NO live defect on the shipped corpus, and the plan says so at the top.** That is
[P8](p8-what-can-be-deleted-with-the-gate-green.md)'s *a check written for a defect you have just
fixed has no live case*, arriving before the item rather than in its Record — and it means the case
must be made on **capability** rather than on a bug. Q302's own closing sentence is where that case
lives: *a bound a producer does not keep is invisible to its own check and visible at every
consumer's.* The question this plan owes an answer to is what remains once the wiring check and the
two boundaries have had their say.

---

## What the design settled, and how

*Decided before fan-out (`doc/workflow.md` section 7 rule 3). Each is recorded with the alternative
it was chosen over, so an item argues from the decision rather than re-deriving it.*

1. **It is OPT-IN and it is OFF by default — ANSWERED by the maintainer at this declaration, stop-and-ask (a), as recommended.** *Over*: on by default, with an opt-out. P19's
   departure argument survives fact 4 — the schemas are the author's tool, and a library that
   refuses a run for a bound an author wrote loosely is a library that makes its own corpus
   unrunnable. **Fact 4 changes the price and not the default**, and an item that reads it as
   licence to turn the check on has misread it.

   *And the honest reason is COST rather than semantics, which matters once decision 3 is read:* with the check reporting and never routing, leaving it on is **safe** anywhere — so what keeps it off is fact 4's ratio and the callback a consumer must supply, not a risk to the run.
2. **What it checks is the RESULT against the worker's own `outputSchema`, and nothing else.** *Over*:
   also re-checking a node's input. The entry payload and a person's resolution are already held
   ONCE each by `FD-R4` (W73), and a node's input is what the wiring check decides statically; the
   result is the one value no existing mechanism sees at run time.
3. **A finding is REPORTED and never ROUTED — no record is written, no terminal state changes,
   and the run proceeds exactly as it would with the check off. ANSWERED by the maintainer at this
   declaration, stop-and-ask (b).** *Over*: a task failure, and over stopping the run.

   ***This decision REPLACES the one this plan was drafted with, and the draft cited a precedent that
   does not transfer.*** The draft said *a TASK's failure, on [W61](../work-items/w61-what-a-transform-is.md)'s
   `TransformFailed` precedent*. **`TransformFailed` is thrown inside the ENVELOPE WORKER**, before the
   scheduler settles anything — so the scheduler marks the task `failed` or `user_action` itself and
   the driver records what it was told. A result check runs in the **driver**, after the scheduler has
   already reported `done`, and `OR-R3`'s own source column says `terminalState` comes from `d.state`
   and is **never** the driver's. *W61's mechanism is unavailable here, and the draft's decision rested
   on it.*

   **Three things decide it:**

   - **The mechanism for a guard EXISTS and is not free.** `resolution` is a second record kind whose
     `resolvedAs` is *the terminal state the node is treated as having from here*, `OR-R9` composes it
     with the settlement, and `RS-R3` routes `failed` exactly as an optional node's failure. So the
     driver COULD override without rewriting — this is not refused for want of a road.
   - **A routing change composes badly with decision 1.** *If the check is off by default and changes
     routing when on, then turning it on changes what the flow DOES* — a run that completes in
     production takes a failure edge, or parks for a person, in validation mode. **You cannot audit a
     behaviour with an instrument that alters it.** A guard wants to be ON by default; a diagnostic
     can be off.
   - **Fact 3 says the observed fault is the SCHEMA, not the worker.** Both of Q302's instances were an
     author's bound, and W73 fixed one in the declaration and one in the code. *Failing a task for that
     punishes a run for a documentation defect.*

   **`OR-R12` is the precedent taken**: a resolution whose value is uncloneable is refused and *the run
   is not failed: nothing is appended*. **An item that writes a record, changes a terminal state, or
   routes differently has broken this decision, and that is the sentence its adequacy reader should
   try to falsify first.** The cost is stated rather than hidden: **a value that fails its schema still
   flows downstream**, and this plan buys the consumer knowledge rather than protection.
4. **The twelve-keyword subset is the contract language and nothing is added to it.**
   [ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
   stands; `oneOf` is [P19](p19-what-a-schema-buys-an-author.md)'s slice 2 and its condition has not
   fired ([Q311](../open-questions.md)).
5. **The cost is quoted as a RATIO to the clone, never as a millisecond.**
   [Q179](../open-questions.md) says wall time here is not reproducible, and fact 4 is already
   expressed that way. An item quoting a millisecond has quoted a machine.
6. **Q320 is a FACT this plan carries, not a second headline.** The always-on completion handle costs
   **+1 `structuredClone` per settled task** (fact 2) — measured on the one road no harness here can
   take — and whether a consumer can decline it is W81's, priced beside the check's own cost. *The
   two are the same question asked twice: what does a settlement cost that nobody chose?*
7. **Nothing changes what a worker receives, and no `spec/` rule about routing moves.** The exit
   artifact adds an L6 row, so L6's numbers move and W82's row says by how much.
8. **`examples/**` MAY hold a hand-built `Driver`, in the ONE file whose subject is what building
   one costs — and the exemption is granted in two places, not one.** *Over*: leaving
   [W67](../work-items/w67-a-flow-from-documents-on-real-workers.md)'s claim at `[]` and measuring
   [Q320](../open-questions.md)'s opt-out only at L2. **Added after W81 shipped, because the
   decision was made inside an item and belongs here** — `doc/workflow.md` section 1 rule 3, *a
   decision that is not in `spec/`, an ADR, or a plan did not happen*, and an assertion's own
   comment is none of the three.

   `examples/l6.ts` asserts P18's exit artifact as a cross-row claim: the library does every
   instantiation, so nothing under `examples/` constructs a pool, a scheduler, a `Driver` or a
   built-in group. **The only road that declines the always-on completion handle is
   `new Driver(flow, { ...runtime.registry, … })`** — [P18](p18-a-flow-and-its-runtime-from-documents-alone.md)
   decision 14's own sentence — so the file that PRICES the two roads has to hold both, and the
   claim as written forbade it.

   **Three things decide it, and the middle one is a measurement rather than a preference:**

   - **What the claim was bought for survives.** W67's adequacy reader found the exit-artifact
     sentence held by nothing — `new ConcurrentLimitGroup(99)` added to `run-flow.ts` cost ZERO at
     every rung. Re-run against the new form on the shipped tree: **still RED, with a named
     failure** (`dev-dist/w81/a8-check.txt`).
   - **A MARKER ALONE IS PERMISSION A FILE GRANTS ITSELF.** The same mutation with one comment line
     typed above it is **GREEN**, and `lint` is indifferent. *So the claim caught the careless and
     stopped catching the deliberate* — which is why the equality is THREE-way: the constructors,
     the files that declare it, and a literal list in `examples/l6.ts`. **An exemption now costs an
     edit in the file that wants it and an edit in the file that makes the claim.**
   - **It is strictly stronger than the `[]` it replaces in one direction**: a file that declares
     the exemption and constructs nothing is red, and a literal that names a file which stopped
     constructing one is red. `[]` could catch neither.

   *The cost is stated rather than hidden*: `examples/**` is no longer a directory in which the
   sentence *nothing here builds a scheduler object* is true without qualification, and a reader of
   P18's exit artifact has to read one more list to know what the exception is. It is ONE file, it
   names itself, and W82 inherits the list unchanged unless it adds to it.

---

## What was measured before this plan is declared

*Four facts, on `eb1dbe5`, Node 24.20.0 asserted in every shell, every rung RUN and redirected to
`dev-dist/p21/` and read by `$?`. The tree was held still — digest **`da708d4823281e08` over 365
files**, identical before the first probe and after the last, `git status` clean at both ends.*

| # | fact | where |
|---|---|---|
| **1** | **The only instrument this repository has for retention CANNOT SEE what P20 added, and the road is closed.** `retainedBytes` takes its key list from `walkOf`, whose `NOT_RUN_STATE` skips **`opts` by name** — and `opts.onFoldInput`'s closure is the only thing holding the `RunState` ADR 0058 keeps. Measured: the walk reports **15.0 / 486.0 / 2426.3 KiB** at three shapes while a `RunState` of the same run is **13.0 / 481.9 / 2408.1 KiB**, and **`v8.serialize` REFUSES `driver.opts`** outright. *W77 measured by identity that the kept state's results are SHARED with `inputs`, so it is not a second copy — but no byte observer here can say so, and the field it would have to walk cannot be serialised.* [Q320](../open-questions.md) | `fact1-blind.ts`, `fact1.txt` |
| **2** | **The always-on handle costs +1 clone per SETTLED TASK and no measurable time at the shapes reachable.** On the road no harness here can take — a consumer who passes **nothing** — clones go **46 → 52**, **94 → 106**, **414 → 466** against the pre-W77 conditional spread: exactly one per settlement, as Q320 says. Time in clone is **0.4 → 0.4**, **2.5 → 2.2**, **14 → 15.2 ms** — inside the noise, one reading falling. *The cost is P15's own quantity, (tasks settled) x bytes each RETURNED, and this corpus's workers return small values while the large payload sits at the entry.* **So Q320 is true in COUNT and unshown in COST**, and W81 is what has to reach a shape where it bites | `fact2-clones.mjs`, `fact2.txt` |
| **3** | **The feature has NO live defect on the shipped corpus.** Q302's two violations, run through a real `createRuntime`: the first is **clamped in the code** by W73, the second **refused at `start()` by `FD-R4`** — `BoundaryRefused` naming `$.confidence above maximum 1`, nothing dispatched. The control run and the eleven-letter run both report **0 violating results of 5 checked**. *Q302's row records both corrections; what nobody had done is exercise them through a run.* | `fact3-violations.ts`, `fact3.txt` |
| **4** | **A per-settlement check costs a SMALL and SHRINKING fraction of the clone the driver already pays.** Timed on the corpus's own results, median of 51 repetitions, both sides on the same values: validation is **92.9% / 14.7% / 5.9%** of `structuredClone` at 6 / 12 / 52 settlements, and the worst single settlement falls **1.52x → 0.22x → 0.14x**. `publish`'s big `joinPayload` is **0.00x** — 0.3647 ms to clone, 0.0006 ms to check. **12 of the 14 corpus workers declare an `outputSchema`**; the two that do not are the worker that throws and the one that returns a function. *The ratio falls because the clone is linear in the whole value and the check short-circuits on the schema's shape* | `fact4-cost.ts`, `fact4.txt` |

### FOUR probes measured the apparatus before one measured the thing, and the sequence is recorded

*`doc/workflow.md` section 4's reading clause, four times in one declaration step:*

1. a hand-made `{ items: [...] }` payload — every run came back **`stuck` with ONE task at every
   arity**, so the numbers were identical across three shapes and were the probe's;
2. the same question through `runFlow` — **0.0% three times**, because `runFlow` installs its OWN
   `onFoldInput`, so the clone was already being made and reverting the composition removed nothing;
3. bytes on the no-callback road — **byte-identical again**, because `v8.serialize` gives a clone and
   an alias the same length. **Bytes cannot see cloning at all**, which is why W77 used identity;
4. an identity read of the fold-input sequence against the log — **0 same / N different in BOTH
   arms**, confounded because `foldInputs()` is itself `Object.freeze(this.inputs.map(freezeInput))`
   and clones on every call.

*Only the fifth shape — COUNTING the calls — answered it.* Recorded because P20's retro named the
instruments as five of its eighteen rung-less defects, and this is the same class one plan on, caught
before anything was declared rather than after.

---

## Scope

**In**

1. **A run-time result check**, opt-in and off by default, over the worker's declared `outputSchema`,
   **REPORTED and never routed** — ADR 0060. *(This read *refusing as a TASK's failure*, which is the
   claim commit `c869a4b` WITHDREW when the maintainer answered stop-and-ask (b): decision 3 forty
   lines above says the opposite, and ADR 0060 cites that decision as its authority. The third
   standing copy of it, and the one that mattered most — [W80](../work-items/w80-what-a-run-time-result-check-is.md)'s
   conformity reader, finding 3, and `doc/workflow.md` section 1 rule 5's WITHDRAWN-claim clause.)*
2. **Its price, measured the way fact 4 measures it**: a ratio to the clone, re-taken at L6's scale
   with the check on.
3. **Q320's unconditional clone**, priced at a shape where it bites, and whether a consumer can
   decline it.
4. **One L6 row** where a worker returns a value its own schema refuses and the run says so by name.

**Out** — named rather than left implicit, with where each goes instead

- **`oneOf` and any widening of the subset.** P19's slice 2; [Q311](../open-questions.md) is the live
  subject and its condition has not fired.
- **Node-type versioning** — [Q249](../open-questions.md), P18's leftover, P19 slice 3.
- **Re-checking a node's INPUT at run time.** Decision 2: the wiring check decides it statically and
  `FD-R4` holds the two boundaries once each.
- **Anything that moves `FD-R4`.** W73 settled the entry payload and a person's resolution; this plan
  adds a third site and reopens neither.
- **The `X7`-shaped L6-count clause** P20's retro named ([Q171](../open-questions.md)). It is an
  item's work and it is not this plan's subject; if an item here takes it, it is a declared exception.
- **[Q219](../open-questions.md)** — a region's collection reachable by no reference. The untouched
  capability gap, and the likeliest subject after this.

---

## Work items

*Serial. Each owns its files; the `Owns` block is written from the row here, never from the item's
title (`doc/workflow.md` section 7 rule 2).*

| | what it does | Owns | Depends on | Gate |
|---|---|---|---|---|
| **W80** | **What a run-time result check IS** — **ADR 0060**: the `DriverOptions` knob, OFF by default (stop-and-ask (a)); the site (one, named, and it is where `OR-R2`'s clone already happens); the finding **REPORTED and never routed** (stop-and-ask (b)) — no record, no terminal state, `OR-R12`'s precedent; the `spec/` rule and its id; the subset unchanged. **Fact 3 says there is no live defect, so the item must CONSTRUCT the case that makes it fire** and say what the wiring check and `FD-R4` cannot reach | `src/driver/**`, `src/definition/**`, `spec/**`, `test/driver/**`, `doc/decisions/0060-*` | nothing | L0 under all five typecheckers; L1-L2; `check:spec`; L6 UNMOVED |
| **W81** | **The price, both halves** — fact 4's ratio re-taken with the check ON at L6's scale, and **[Q320](../open-questions.md) reached at a shape where it BITES**: fact 2 measured +1 clone per settlement and no time, so this item needs workers that RETURN large results, which the corpus does not have. Whether a consumer can decline the always-on handle is decided here or declared unreachable | `examples/**`, `test/**` as the measurement needs | W80 | L1-L5; a measurement, not a rung; both figures as RATIOS (decision 5) |
| **W82** | **The exit artifact** — one L6 row where a worker returns a value its own `outputSchema` refuses and the run reports it BY NAME, in both runtimes, with the check's cost for the whole rung measured on and off; the reference teaching the knob. **L6 MOVES and this row says so** | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md` | W81 | L6 in **both** runtimes; `check:docs`; `check:markdown`; the full `npm run gate` |

**W83 is reserved and expected unused**, on P19's W75 and P20's W79 precedent.

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED. P19's and P20's retros both found that a scope
column is correct and still does not prevent the defect, because it cannot state what nobody thought
of — so these say what was measured and make no claim beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **The check is cheap enough that the DEFAULT is the only real argument** — every cost this plan measures stays under the clone the driver already pays | fact 4, over 70 settlements on ONE flow's twelve declared schemas, timed in one process; **it does not cover a schema with deep nesting, a large `enum`, or an array of thousands**, and the corpus has none | a schema shape whose check is superlinear where the clone is linear — the likeliest is a large `enum` or a deeply nested `items`, neither of which this corpus can express |
| 2 | **The finding needs NO new record kind, NO new terminal state and NO new run outcome** — it is a callback and nothing else, which is what decision 3 makes it | decision 3 as ANSWERED, plus `OR-R12`'s shipped precedent (refuse, append nothing, do not fail the run) read on paper; **no item has yet tried to write the rule** | a consumer who cannot act on a report without the run pausing for them, which would make the guard necessary and reopen both (a) and (b). *(This row's FIRST version predicted a TASK failure on W61's precedent and was corrected before any item ran: `TransformFailed` is thrown inside the envelope worker, so the scheduler authors that terminal state and the driver never does — `OR-R3`'s source column. A prediction whose premise the declaration step falsified, which is the sixteenth plan to find one of its own inputs wrong by trying to act on it.)* |
| 3 | **REACH: the check finds something the wiring check and `FD-R4` cannot** — a bound a producer does not keep past its declared domain, which is Q302's own closing sentence | **none — this is a reach, and fact 3 measured that the corpus has no live instance left.** Both of Q302's are closed | W80 failing to CONSTRUCT a case that is not also caught statically or at a boundary, which would make the feature's whole case the cost measurement and nothing else |
| 4 | **Q320 does not bite at this library's own corpus and needs a shape built for it** | fact 2, three shapes on `map-alias` where the workers return small values and the large payload sits at the entry; **it does not cover a worker that RETURNS megabytes**, which is P15's own quantity | a corpus shape where the +1 clone per settlement is measurable, which W81 is required to try to build |

---

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q302](../open-questions.md) | *a bound a producer does not keep past its declared domain* — the row this plan's capability half rests on. **Both its named instances are CLOSED** (fact 3), so W80 owes a constructed one | W80 |
| [Q320](../open-questions.md) | *the always-on handle's unconditional clone and retention* — fact 2 measures the count and finds no cost; W81 must reach a shape where it bites or declare it unreachable | W81 |
| [Q186](../open-questions.md) | *how large is too large* — P19 named the per-settlement cost as this plan's measurement and fact 4 takes it; the row's *nothing warns* half is untouched | W81 |
| [Q179](../open-questions.md) | *wall time here is not reproducible* — decision 5 is this plan's answer, and every figure it states is a ratio | all three |
| [Q171](../open-questions.md) | *the L6 counts nothing compares* — P20's retro NAMED an `X7`-shaped clause for the next plan. **Declared OUT** above; it is an item's work and not this plan's subject | out, no owner |
| Q330-Q344 | *reserved for the items* | |

---

## Stop and ask a human

- **(a) OFF by default — ANSWERED: yes, off.** Decision 1, as recommended.
- **(b) What the finding IS — ANSWERED: REPORT ONLY, no routing change.** Decision 3, as
  recommended, and the answer to (a) is what decided it: *a diagnostic that changes routing when you
  enable it alters the behaviour you enabled it to audit.* **The draft's own answer — a task failure
  on W61's precedent — was withdrawn at this declaration** because `TransformFailed` is thrown inside
  the envelope worker and the driver never authors a terminal state (`OR-R3`). The guard road remains
  available through a driver-authored `resolution`-shaped record if a later plan wants it, and taking
  it means reopening (a) in the same breath.
- **(c) Whether W81 may add a worker that returns megabytes — ANSWERED: yes.** Q320 cannot be
  reached with the corpus as it stands (fact 2), and building a shape for a measurement is what
  [P15](p15-what-a-run-retains-and-what-a-result-may-be.md) did. It is seeded as W81's exception
  below. **Two constraints go with it**, so the item argues from them rather than re-deriving them:
  it moves **no existing row** (decision 7), and it is a worker whose RESULT is large rather than a
  payload that is — fact 2 measured that this corpus's large values sit at the ENTRY, which is why
  the +1 clone per settlement costs nothing measurable here.
- **(d) Whether the check reads EVERY declared example or only the first — ANSWERED: the FIRST
  only.** `check:workers` is unchanged, and **that REFUSES the cheap half of
  [Q302](../open-questions.md)'s own *what would close it***, leaving that row the
  bounds-generating road, which is W74's territory and is out of this plan.

  *The answer is coherent because of what this plan IS.* Q302 is *a bound a producer does not keep
  past its declared domain*, and more declared examples is the synthetic answer to it: pick a second
  value that reaches the bound and hope an author picks well. **A run-time check is the other answer
  — the bound is tested on every real value the worker ever returns**, which no number of examples
  can match. So P21 does not make the example loop cheaper; it makes it unnecessary for this shape,
  and Q302's row gains that reading rather than a second example.

---

## The exceptions each item will take, seeded

*Seeded from W76's, W77's and W78's LATE tables read forward — P16's refused-as-a-rule,
adopted-as-a-table procedure, used by P19 and P20. **All three of P20's items found their seeded
table wrong in at least one direction**, so this is seeded and **will be re-measured at each item's
declaration step**, which is where the corrections belong. It was missing from this declaration's
first commit and is added with stop-and-ask (c)'s answer.*

| path | who | why it is seeded |
|---|---|---|
| `examples/**` | **W81**, by stop-and-ask (c) | a worker whose RESULT is large, because fact 2 measured that this corpus's large values sit at the ENTRY and the +1 clone per settlement therefore costs nothing measurable. It moves **no existing row** |
| `AGENTS.md`, `README.md` | W82 | the knob has to be taught where a consumer reads. **`X8` holds THREE README fences byte-equal** to the AGENTS sections they name, so a section edited in one moves in the other or the check goes red — and `README_SNIPPETS` / `README_SNIPPET_FLOOR` are two more literals beside it |
| `examples/README.md` | W82 | its L6 row table gains a line and its counts move — **W71's, W72's, W74's and W78's late exception on the same two paragraphs, four items running**, and [Q171](../open-questions.md)'s row |
| `scripts/check-docs.mjs` and its self-test | W82 | `RUN_FLOOR` is a ratchet an item that ADDS a `run` snippet must raise ([Q102](../open-questions.md), live for six plans) — **and W78 found the second half the hard way**: `check:docs:selftest`'s `X4` probe anchors on a literal inside `AGENTS.md` §7, so an item that edits the text a probe anchors on takes this file whether or not it moves the floor |
| `test/definition/l4-corpus.test.ts` | **W80 or W81, whichever adds a suite** | the suite CENSUS is a standing obligation on any item adding one — W76 took it LATE, W77 declared it UP FRONT and needed it, W78 predicted it UNNEEDED and was right. Declare it, do not discover it |
| `scripts/build-browser-tests.mjs` | **W80, conditionally** | the browser bundle carries only what this script inlines, so a suite reading any file outside `spec/examples/` needs an entry. **W76 and W77 both took it LATE and W77's row says *PREDICTED ZERO EDITS AND THE PREDICTION WAS WRONG*** |
| `src/scheduler/index.ts` | **W80, conditionally** | the sub-path's type export is an explicit ALLOWLIST and a `export type` is erased, so a new exported type is invisible to all five typecheckers. **W77 shipped `RunHandle` declared and unexported for a whole author pass, and binding the list then found two more** |
| `scripts/check-markdown.mjs` | **PREDICTED NEEDED, and it is the tight one** | [Q142](../open-questions.md)'s `M4` margin is **26** after this declaration's record step and `M3`'s is **2**. *An ordinary record step spends more than 26 links* — P20's spent 31 — so the retune is likelier than not, and it is a scratch-copy retune as every one since W28 |
| `package.json`, `deno.json` | **PREDICTED UNNEEDED** | a new `DriverOptions` member is ADDITIVE, so no version moves. [Q322](../open-questions.md) records that nothing binds the version to the API's shape either way |
| `src/driver/driver.ts`, `spec/**` | **W80's `Owns`, not an exception** | named here because P20 made the driver a scope TRIPWIRE and this plan does not: W80's whole subject is a driver option and a `spec/` rule, and the tripwire does not transfer |

## A note on ids

**Reserves W80-W83, Q330-Q344, ADR 0060-0061.** **Derived by grep off the tree at this declaration**,
never from a sentence:

| | on disk | so |
|---|---|---|
| highest work item | **W78** | W79 was reserved by P20 and **closed unissued**, so it is skipped; P21 starts at **W80** |
| highest register row | **Q327** | Q328-Q329 were P20's, reserved and unused, so they are **spent**; P21 starts at **Q330** |
| highest decision | **ADR 0058** | 0059 was reserved by P20 and **SKIPPED**; P21 starts at **ADR 0060** |

Fifteen questions, sized as every plan since P15 has done; **none spent by this declaration**. Two
ADRs, one expected taken (0060, the run-time check) and 0061 expected unused.

---

## [Q142](../open-questions.md)'s window, measured BEFORE the record step — and it is the TIGHTEST a declaration has faced

`dev-dist/w74/decl-q142.mjs` on this tree:

```
whole tree           {"files":137,"links":6006,"anchored":296}
doc/decisions out    {"files":104,"links":5519,"anchored":296}
both out             {"files": 83,"links":4419,"anchored":292}

M3 = 107 : window is (104, 137] — margin below 3
M4 = 4450: window is (4419, 6006] — margin below 31
```

**This declaration adds ONE markdown file in `doc/plans`, which probe 1 does NOT cut**, so the `M3`
fixture goes 104 → 105 and the margin falls to **2**. `M4`'s lower bound is cut by probe 2, which
removes `doc/plans`, so this file's own links do not reach it — **but the record step's index
paragraphs do, against a margin of 31.**

***That is the exact margin [P18](p18-a-flow-and-its-runtime-from-documents-alone.md)'s retro FIRED
on***, and P20's own record step wrote **31 links** into those four files. **So Q142 was predicted to
be a COIN FLIP rather than not to fire**, `scripts/check-markdown.mjs` was a seeded exception for
this declaration's record step, and the retune was declared in advance rather than taken as a
surprise.

**MEASURED after the record step: it does NOT fire — `M3` = 107 against 106, margin 2; `M4` = 4450
against 4424, margin 26 — and the prediction was ROUTED AROUND rather than tested.** Knowing the
margin was 31, this declaration's index paragraphs were written deliberately link-light and cost
**five** links to that fixture where P20's cost thirty-one. *So the coin was never flipped*, which is
[P19](p19-what-a-schema-buys-an-author.md) prediction 1's shape — a reversal condition measured real
and then avoided — and it is recorded that way rather than as a prediction confirmed. **The margin
that matters for the next item is 26, and one ordinary record step spends more than that.**

---

## The baseline this plan is declared on

**P20's retro's confirming gate on `eb1dbe5`'s tree, 2026-09-19** — every rung RUN and never PIPED,
redirected to `dev-dist/p20-retro/gate.log` and read by its exit code:

```
GATE EXIT=0, zero lines beginning FAIL at any indent
selftests 8/8 completed, 8 ok, 889.9 s wall over 6 lanes
44 file(s), 1269 assertions in node 24.20.0, deno 2.9.6 and chromium
1639 assertions at L6, 0 failed, 55 real runs on fyflow-scheduler 0.5.2, in node and deno
spec      7 documents, 61 examples, 107 rules
docs      33 snippets: 27 run, 6 check
source    23 published files, 16 gate entries
markdown  137 documents, 6006 relative links, 296 anchored
register  252 / 195 / 2 / 55, 252 of 252 in one cluster cell, 0 aborts
package   0.3.0 in both manifests
digest    62bf299672903144 at that gate; da708d4823281e08 at HEAD, after the one Record edit it
          allows, over which `check:markdown` was re-run green
```

**Census CONFIRMED for the TWENTY-SECOND plan running — 252 / 195 / 2 / 55, 252 of 252 in exactly
one cluster cell, 0 aborts**, by `dev-dist/p15/census.mjs` unchanged. **This declaration raises no
question and resolves none.**

**The declaration commit's own confirming gate**, over this file, the register's reservation note and
three index paragraphs — the tree held STILL while it ran, every rung RUN and never PIPED,
`dev-dist/p21/gate.log`:

```
GATE EXIT=0, zero lines beginning FAIL at any indent
selftests 8/8 completed, 8 ok, 985.0 s wall over 6 lanes
44 file(s), 1269 assertions in node 24.20.0, deno 2.9.6 and chromium — UNMOVED
1639 assertions at L6, 0 failed, 55 real runs in both runtimes — UNMOVED
spec      7 / 61 / 107 — UNMOVED
docs      33 snippets: 27 run, 6 check — UNMOVED
workers   14 / 12 confirmed / 2 NOT CHECKED — UNMOVED
source    23 published files, 16 gate entries — UNMOVED
markdown  138 documents, 6038 relative links, 299 anchored
digest    00797b31a263a279 over 366 files, IDENTICAL before and after
```

**Every figure this declaration could move, moved by exactly what it added — one document and the
index paragraphs — and nothing else did.** `git status` names five files at both ends: this one and
the four the record step allows. *The seven UNMOVED rows are what checks the claim that no rung below
`check:markdown` reads anything this declaration touches.* **`M1` caught a dead link in this file on
its first run** — it named `p15-what-a-run-and-what-a-result-may-be.md`, which does not exist —
which is the check P8 built doing its work on the declaration that cites it.

---

## Retro

*Pass 3, run 2026-09-23 on `aad2c2b`'s tree. **ONE change adopted, FIVE refused**, and
`doc/workflow.md` is [v0.22](../workflow.md), where the full reasoning lives. What follows is this
plan's own evidence.*

### The central finding: v0.21's controls clause was followed by all three items and defeated all three

**Rule 8 obligation (d)'s controls clause keeps its REQUIREMENT and loses its PRESCRIPTION: a
control is one only if you can name the tree on which IT fails and its CLAIM passes.**

v0.21 was adopted three days before this plan started and says a control *must fail where its
claim is VACUOUS, not only where its subject is ABSENT*, and it names the answer: **IDENTITY —
the two sides are different values.** **All three of P21's items instantiated that clause, and
all three produced a control the clause's own question defeats.** Section 6 pass 3 rule 3's
sharpest kind, three times, on a clause with no item between it and them.

| item | the control it wrote | why identity cannot see it |
|---|---|---|
| [W80](../work-items/w80-what-a-run-time-result-check-is.md) | an IDENTITY control over the check-ON/check-OFF pair | **every operand is freshly built**, so the two sides are ALWAYS different values and always equal. The author asked *what tree makes this fail while its claim passes* and answered: **none** |
| [W81](../work-items/w81-what-a-settlement-costs.md) | *the run reported what these same schemas say about these same values* | **`0 === 0`** on a corpus where nothing fails its schema — two operands that are different values and are both empty |
| [W82](../work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md) | *and that derivation found SOMETHING* | the derivation and the report are **different objects** with one source, so identity passes while a one-token re-source makes the claim a projection of the report compared with itself |

**The mechanism is why this generalises rather than a fourth item.** Identity answers *are these
two sides ONE VALUE*. It does not answer *can these two sides EVER DIFFER*, and that is the
property a control needs. P20's shape — *OBSERVED equals DECLARED* over two lists — is the one
shape where the two questions coincide, because re-sourcing there really does make one value out
of two. **Freshly-built operands, two empty operands and one-source derivations are all outside
it**, and each of P21's items met a different one of the three.

**W80 wrote the replacement down and did not generalise it**: *asked of the author's own IDENTITY
control what tree makes this fail while its claim passes, there is none — following the clause and
asking its question are different acts.* That question is what all three defective controls fail
and all three repairs pass, and the repairs are not identity:

- W80 asserted each clause against a **LITERAL, for each arm**;
- W81 added a **CONTROL RUN** whose `tally` schema refuses, so the two numbers are non-zero and
  can disagree;
- W82 asserted a **RELATION over the DERIVATION** — the walk reaches the CONFORMING settlements,
  which the report never names, so a walk built from the report reaches two where four are
  required.

*Three items, three shapes, one question.* **What this replaces** is v0.21's naming of identity
as *the* answer; the requirement is unchanged and identity stays as one instance of it, correct
for the shape P20 measured. **The cost is that a control is now a thing you have to be able to
argue about rather than a thing you can write by pattern** — which is the point, because all
three of the controls above were written by pattern from a clause that named one.

### Name the rung

**FORTY-ONE defects across the three items' own *What broke* lists — 14 / 18 / 9. THIRTEEN name a
rung that FIRED, and those thirteen name FIFTEEN firings.**

| the rung | what it caught |
|---|---|
| L1-L2, an item's own new suite on its FIRST run | two of W80's tests found real behaviour the author had not predicted — a hostile getter measured `OR-R2`'s clone rather than the check, and a throwing callback stops the run |
| L1 **deno** | W80's pair let `observedAt` float, and two runs at two instants legitimately differ in it: green in Node, red in Deno on a one-millisecond straddle. *Caught by the second runtime rather than the first, which is what the three-runtime requirement is for* |
| L1 **chromium** | W80's `scripts/build-browser-tests.mjs` exception, reported as ONE named test rather than taking forty-five suites down — W33's better failure mode |
| L1, twice, and a **GATE ENTRY** once | W82's three corpus censuses: `test/definition/wiring.test.ts`, `test/fold/result-value.test.ts` — which DERIVES both sides and named itself — and `check:workers:selftest`, which went red **while `check:workers` itself stayed green** |
| rule 8's author pass | W81's artifact CRASHING on its own truncated declaration; W82's binding that did not bind |
| rule 8's RE-RUN | W81's first fix being worse than the defect, and its decorative check-ON; W82's compound that exercised nothing |
| rule 8, AGAINST DECLARATION | W82's `X4` ceiling, which understated the check |
| rule 7 (b) | W80's five aborts, every one an anchor its own fixes had moved |
| the dated-ceiling clause | W80's `z1`, a CATCH at W81 and again at this retro |

**TWELVE of the thirteen were read correctly at the first opportunity. The thirteenth is W82's
`b6b`, and the way it was misread is new.** The probe made the reference's guards tautologies and
broke the subject; `check:docs` returned `exit 1` with **two NAMED failures**, so rule 8's crash
discriminator — *non-zero exit with ZERO named failures* — did not fire, and the author read CAUGHT.
The snippet had thrown a `TypeError` on `found[0]!` of an empty array, and **`X4` had converted that
crash into its own named failure**, *the snippet does not run*. *A check that EXECUTES the thing it
grades launders its subject's crash into a detection*, and the discriminator is structurally blind
there. Found by the adequacy reader; refused as a rule above, because the text was in the harness's
own printed line and rule 8 already requires reading it.

**TWENTY-EIGHT have no rung, and FOUR are in the INSTRUMENTS**: W81's clone counter, which counted
`driver.snapshot()`'s own clones and put **17%** of a printed column into the harness; W82's patch
script, which reported `ok` from a `str.replace` that matched nothing; W82's spike, which hung on a
`done` that never settled because the corpus workers' relative urls resolved against the wrong base;
and **W82's census parser, which DROPPED [Q87](../open-questions.md)'s five-line row and read 260 against
261 with ZERO aborts.** That last is the one to carry: this register already records two readings of
that row and **both are MISREADINGS**, which a classifier can refuse. *A parser that aborts on what it
cannot classify does not abort on what it never SEES* ([Q343](../open-questions.md)).

The remaining twenty-four are what two readers are for: **nineteen of them are claims that were
false or bounds that were not there**, and every one was found by a reader or by an author asking
rule 8's own question of something it had just written.

### The predictions

| # | verdict |
|---|---|
| 1 | **REVERSED at the FIRST item, and its own reversal column is what directed the measurement.** The plan wrote *a schema shape whose check is superlinear where the clone is linear — the likeliest is a large `enum`*, and W80 built exactly that: one `enum` of a hundred allowed values is **1.65x** of the clone on a 4 KiB result and **3.08x** on a 0.5 KiB one, because its membership test canonicalises every entry on every check. W81 reproduced the direction and not the magnitude (**4.35x** where W80 read 3.08x) and W82 measured the shipped rung at **0.18x-0.37x**. *A reversal clause DIRECTS an item* — [P15](p15-what-a-run-retains-and-what-a-result-may-be.md)'s finding a second time — and this is the first plan where the reversal was taken deliberately BECAUSE the plan said the item could otherwise reverse it by accident. **The conclusion it was written to protect survives with its scope named**: the share falls as the VALUE grows and rises as the SCHEMA does, and the default is unmoved and better argued |
| 2 | **CONFIRMED.** No record kind, no terminal state, no run outcome; `OR-R13` is a `DriverOptions` member and a rule in the document where `result` is defined. It is a DERIVED prediction — from decision 3 as answered plus `OR-R12`'s shipped precedent — so confirming it tested the inference rather than the world, which is [P10](p10-is-fan-out-one-feature-or-two.md)'s reading holding for the tenth plan |
| 3 | **CONFIRMED, and it is the only one of the four about something nobody had measured** — its scope column says *none; this is a reach*. W80 confirmed it and found a SECOND leg the plan does not name (the check reads what the RECORD carries, so it and `check:workers` can lawfully disagree about one schema), and W82 gave both legs observers on real workers and measured the reach **from both sides**: `check:workers` is green on both workers with each defect PRESENT and green with each REMOVED. **Its SCOPE is narrower than three documents stated it**, which W82's conformity reader found: the two legs are unreachable for DIFFERENT reasons, and only the record half is structurally unreachable — the bound half is reachable by a bounds-generating tool, which is [Q302](../open-questions.md)'s own open road and which P21 stop-and-ask (d) declines deliberately |
| 4 | **NEITHER, and it is the SECOND occurrence of [Q326](../open-questions.md)'s class.** In COUNT Q320 bites at every shape W81 could reach, so *does not bite* is false; in TIME it does not bite even at 24.0 MiB of settled results, so *bites* is false too; and *needs a shape built for it* is false twice over, because `map-alias` reaches megabyte results through its own DATA. **Stop-and-ask (c)'s permission to add a worker returning megabytes was granted and UNUSED** |

**So: one REVERSED, two CONFIRMED, one NEITHER** — and the reversal is the one the plan told an item
to go and take. *Three of the four rest on measurements the declaration already had; only prediction
3 was about a mechanism's reach, and it is the one that could have gone either way.* P10's reading is
unmoved for the tenth plan running.

### v0.21's one change, and the clauses this plan exercised

**v0.21's CONTROLS clause: FOLLOWED by all three items, and DEFECTIVE in all three.** That is this
retro's one change and the table is above. It is the fourth amendment to obligation (d) in eight
plans — v0.14's *a count is not a membership*, v0.18's *a membership names the CONTROLS*, v0.21's
*what a control must be able to do*, and now its TEST — and the sequence's own shape is unchanged:
**each was the previous one FOLLOWED and short.** [Q217](../open-questions.md) gains its fourth
instance, and this is the first amendment in the sequence that names a TEST rather than a thing to
ADD (v0.14, v0.18) or a property to HAVE (v0.21).

**v0.20's TAUTOLOGY clause: CONFIRMED on its second plan, and NARROWED by a measurement.** W81 and
W82 both instantiated it; W82 declared `X4` a bare presence test for `throw` and was **CAUGHT AGAINST
DECLARATION**, because `X4` refuses `if (false)` **by name** — W16's adequacy reader's own clause,
which [Q310](../open-questions.md)'s row does not mention. *The check is stronger than the row that
records its ceiling says it is*, and the tautology that reaches it is `x !== x`. The ceiling itself is
real: with all eight of `AGENTS.md` section 16's guards made `x !== x` and the worker made to keep its
bound, `check:docs` is **exit 0** and **L6 is what fires** — so the section now names L6 as its second
route rather than claiming one inside `check:docs`.

**v0.17's dated-ceiling clause: it paid, and the payment was a CATCH.** W80 dated `z1` to a rung that
did not yet exist — *W81 owns the rung that can see it* — and W81 ran it and found it a **CATCH at
both rungs**, then re-ran W80's other ten and found all ten holding. **This retro re-ran all three
sets on the shipped tree** and `z1` is a catch again, at `l1` — **the same rung W81 named**, so the
retro REPRODUCES that catch rather than finding a new one, which is what *zero NEW catches* above
means. *(This paragraph read *at a THIRD rung W81 did not name*, which the retro's own log refutes on
the line it was written from.)* **A ceiling whose reason names a FUTURE item is the shape that has
yielded here twice from one declaration**; P16's two catches were a different shape — literals a
later item's edits made unequal — so the clause has two productive forms and not one.

**v0.16's *a rung is RUN, never PIPED*: FOLLOWED twice and the READING failed twice, in the same
place.** W80's gate command ended in `grep -c`, which exits 1 on no match, and reported a green gate
as failed — W81's Record wrote that down. **W82 then did it again at its own final gate**, three
items and one Record later, and the harness reported the whole command as FAILED with `GATE EXIT=0`
two lines above. *Both times it cost nothing, and for the same reason: `$?` was captured into a
variable in the SAME command before anything read the log.* The clause is right, the counter-measure
inside it works, and the trailing `grep` is a habit the clause does not name. **Recorded at two
occurrences and not ruled**, because the thing that saved it both times is the clause itself.

**v0.14's WITHDRAWN-claim direction: fired FOUR times and was short twice.** W80's conformity reader
found three standing copies of the claim commit `c869a4b` withdrew; W81's found a fourth site in
`examples/l6.ts`'s own assertion accounting, *forty lines of diff from the equality that replaced it*;
and W82's found the FOURTH standing copy of the original, in the plan's Exit-artifact line — which
W80's search passed over and which W82's own finding 3 declared correct after reading the line above
it. **The reason is in refusal (i)**: the copies are paraphrases.

**v0.12's WHEN clause — a measured number is re-taken on the tree the item SHIPS — fired twice in
W82 alone**, both times in a row that says the number was re-taken: `examples/README.md` carried
**1710** for the hour between the first green run and the readers' fourteen assertions, and the
item's own `check:markdown` row carried a count taken before the record step moved six documents.
*The clause names the moment and the moment keeps arriving twice.*

**v0.19's environment clause: no occurrence.** Every shell in all three items asserted `fnm use 24`
and no probe came back CRASH for want of it.

### Refused, five, each with a measurement

**(i) A `doc/` check, for the TWENTIETH time — and P21 supplies the sharpest instance yet of why
the one class that LOOKS checkable is not.** The plan's four stale-claim defects are W80's *a claim
quoted with its worst row dropped in four places*, W80's and W81's and W82's standing copies of a
claim commit `c869a4b` WITHDREW, and the register's headline stale at W80's figure through the whole
of W81. **The withdrawn claim is the instance to read.** `doc/workflow.md` v0.14 change 3 already
requires that *a WITHDRAWN claim is searched for*, W80's conformity reader followed it and found
**three** standing copies, and W82's found a **FOURTH** — in the plan's own Exit-artifact line, which
had been there since the declaration and which W80's search passed over.

**The reason it passed over it is the finding, and it kills the check.** The three W80 found all say
*a TASK's failure*; the fourth says *reports it by name rather than carrying it downstream*. **A
withdrawn claim's standing copies are PARAPHRASES**, so a grep for the phrase finds the ones that
share wording and is blind to the ones that do not — and telling the fourth from the other 109
deliberate historical quotations this corpus carries (P20's retro measured that number) is reading
English. *The clause is right, the procedure is a grep, and the class it must catch is the one a grep
is defined not to see.* The standing refusal is unchanged and its criterion is unmet again.

**(ii) A rule for a corpus census pinned as a LITERAL outside the corpus** —
[Q342](../open-questions.md), **one item, three sites, and the three behave differently**, which is the
argument against a single rule. `scripts/check-workers-selftest.mjs`'s `CONTROL_LINES` regex took a
**GATE ENTRY red while `check:workers` itself stayed green**, because the count lives in the GRADING;
`test/definition/wiring.test.ts`'s is a literal a human retypes; and `spec/outcome-record.md`'s split
is **DERIVED on every run** by `test/fold/result-value.test.ts` and announced itself by name. *Only
the third needs no rule, and it is the one that behaved.* W82 is the first item to add a corpus flow
since W73 created two of the three sites, so this is one occurrence with no second, and the three
sites are enumerable by grep today. **Recorded, not ruled.**

**(iii) A rule about a CRASH laundered into a named failure** — one occurrence, and it is a rule
BROKEN rather than a rule followed. W82's `b6b` made the reference's guards tautologies and broke the
subject, and `check:docs` came back `exit 1, 2 — X4 …`: rule 8's crash discriminator keys on *non-zero
exit with ZERO named failures*, and `X4` had converted the snippet's `TypeError` into `X4`'s own named
failure, *the snippet does not run*. **So the discriminator is structurally blind wherever a rung
EXECUTES the thing it grades** — `X4` runs snippets, `check:workers` runs workers, every `:selftest`
runs a check — which is an argument for generalising from one occurrence (pass 3 rule 2). **What
refuses it is that rule 8 already says a provocation is evidence only when it fires FOR THE REASON IT
NAMES, and the reason was in the harness's own printed line.** The author read the id and not the
text. *A rule that was broken means someone was careless*, and the counter-measure is the clause that
already exists.

**(iv) An `Owns` pre-declaration rule, for the NINTH plan running** — and P21 is the third plan to
run P16's seeded-exceptions TABLE, which is the procedure that replaced it. **All three of P21's
items found their seeded row wrong in at least one direction**, exactly as P20's three did, and W82
found the table wrong in FOUR ways at once: one row predicted NEEDED that did not fire, one predicted
UNNEEDED that did, and two files named nowhere. *That is the table working — it is seeded and
re-measured at each declaration step, and the re-measurement is where the corrections land.* Seven
declared exceptions across the plan's third item and **zero undeclared in any of the three**.

**(v) A rule about ad-hoc tooling that reports success having changed nothing** — W82's patch script
printed `ok` from a `str.replace` with no assert on the match, and a cost measurement was silently
re-taken on the old flow set. **Rule 8's harness clause already requires every edit's anchor to be
checked against the CURRENT text**, and the rule-8 harness did exactly that throughout; the defect was
in a script beside it. One occurrence, and the clause that covers the harness is the one a second
occurrence would have to be argued against. **Recorded.**

### The numbers

**Rule 8 across the plan, all 156 probes RE-RUN at this retro on the shipped tree** (W80's
49, W81's 55, W82's 52), tree held still at digest `e5df6f3da8f73515` over 377 files,
identical at both ends of every set:

| set | at this retro |
|---|---|
| W80's 49 | **37 caught, 10 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 1 AGAINST DECLARATION** — and the one is `z1`, the dated ceiling W81 already found to be a catch, catching again at `l1`, the same rung |
| W81's 55 | **40 caught, 14 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration** |
| W82's 52 | **39 caught, 12 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration** |

**Across the plan: 156 probes, 116 caught, 36 declared ceilings RUN, ZERO undeclared survivors, ZERO crashes, ZERO timeouts, ZERO aborts, and ONE against declaration.** That one is `z1` again — the catch W81 already recorded INSIDE the plan, reproducing at a third rung — so the retro's yield of NEW catches over thirty-six ceilings is **ZERO, for the third plan running**. *The reason is the same one P20 gave: W81 re-ran W80's eleven inside W81, so every ceiling that could have moved had already been re-run by the item that moved the values.*

**Readers: six passes, none empty. Overlaps 2, 3, 1 — the FIFTIETH, FIFTY-FIRST and FIFTY-SECOND
measurements, all inside the 0-4 band, which has not moved in fifty-two.** Forty blocking findings,
split **17 conformity / 23 adequacy** — the conformity readers finding claims that were false and
the adequacy readers finding bounds that were not there, which is the split the two roles predict.

**And P21 records something no plan has: the conformity reader's CENTRAL OBLIGATION came back with
ZERO disagreements on the VALUES in all THREE items.** W80 re-derived every finding list, path, walk
order and task id on paper; W81 derived `findings`' three reads of `schema.type`, all four count
columns and every rung's figure from the documents and `src/`; W82 derived both rows' findings and
their exact text, all eight dispatched ids, every `nodeResults` value, the `settledOwnKeys` pair and
the whole `+15 / 1720 / 58` arithmetic — the count as it stood when the reader derived it, four
assertions before its own findings moved it — **and every one matched.** P18 had one such pass and P19 had
two; this is three of three. *What all three found instead were CLAIMS* — a number quoted with its
worst row dropped, a decision attributed to the wrong ADR in four sites, a corpus split stale by four
task nodes, and three more standing copies of one withdrawn sentence.

**Late exceptions: zero undeclared in any of the three.** W82 declared seven and found three of its
five needed ones unpredicted, which is refusal (iv)'s datum.

**And this retro corrected ITSELF four times before it shipped, all four by re-reading the sections
against the logs they rest on.** The conformity reader's derivation was quoted at the count its own
findings later moved; a *held for six plans* nothing here supports; v0.22 described as naming a
PROPERTY, which is what v0.21 did; and — the sharpest — **`z1` claimed to be catching at *a THIRD
rung W81 did not name*, where the retro's own log says `l1`, the rung W81 named.** *A claim about a
measurement, written from the measurement, wrong about the measurement, and refuted by the line it
was written from.* **No rung reads any of the four**, which is refusal (1)'s whole subject arriving
inside the document that refuses it for the twentieth time.

**Census CONFIRMED for the TWENTY-THIRD plan running — 265 / 206 / 2 / 57, 265 of 265 in exactly one cluster cell, 0 aborts** (265 / 207 / 2 / 56 on arrival; this retro resolves one) — by a parser written from
scratch that was wrong four times first and whose fourth wrong reading is
[Q343](../open-questions.md). **[Q332](../open-questions.md) is RESOLVED by this retro's one change**: it
asked whether the clause could be made to see a control entailed by its own claim, and the answer is
that the clause stops prescribing an answer and starts requiring a TEST. *The residue is named rather
than hidden — the test is an obligation on whoever writes the control, and nothing mechanical sees
it, which is true of every clause in rule 8.*

**[Q142](../open-questions.md) did not fire in any of the three items**, and the plan's seeded
prediction that it was a coin flip was stale when it was written: `M4`'s margin was quoted as 31,
W80's midpoint retune had already moved both floors, and the tree this plan ships leaves `M3` at **14
files** and `M4` at **951 links**. *It also names the wrong rung — `M3` is the tight one by three
orders of magnitude.*

**W83 CLOSED unissued, Q344 SPENT, ADR 0061 SKIPPED. The next plan starts at W84, Q345 and
ADR 0062** — derived by grep off the tree, never from this sentence.

## Record

*Filled in as the plan runs.*

| item | status | |
|---|---|---|
| W80 | **DONE** | **[ADR 0060](../decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)** and **`OR-R13`** in `spec/outcome-record.md` **v0.10** — a run-time result check is a READING and never a refusal, and the callback that receives it IS the switch. **L1-L2 45 files / 1290 cases in three runtimes** (from 44 / 1269), `check:spec` **7 / 61 / 108**, **L6 UNMOVED at 1639 / 55**. **Prediction 1 REVERSES, measured deliberately**: the clone is linear in the VALUE and the check in the SCHEMA, so the ratio is unbounded both ways and one `enum` of a hundred on a 4 KiB result is **1.65x** — fact 4's conclusion survives with its scope named. **Prediction 3 CONFIRMED with a second leg the plan does not name**: the check reads what the RECORD carries, after `OR-R2`'s clone, so it and `check:workers` can disagree about the same schema (seven shapes, three disagreeing). **Prediction 2 CONFIRMED.** Readers **20 / 4 blocking** and **34 mutations / 21 survivors / 12 blocking**, overlap **2** — the FIFTIETH measurement. Its conformity reader found the check could **STOP the run** on two values `OR-R11` calls INTACT, and its adequacy reader found that of decision 3's three consequences *writes a record* was **not bound**. Rule 8 final **49 probes, 37 caught, 11 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**. Raises **Q330-Q333**; **Q334 spent** |
| W81 | **DONE** | **`examples/settlement-cost.ts`, and [Q320](../open-questions.md) RESOLVED** — the always-on handle costs **exactly +1 `structuredClone` per settled task**, one more copy of everything `OR-R2` already copies, and **the opt-out EXISTS**: `new Driver(flow, { ...runtime.registry, … })`, at the price of having no `done`. **NO ADR — 0061 reserved and UNUSED.** L1-L5 **46 / 1295 in three runtimes**; **L6 UNMOVED at 1639 / 55**; `check:spec` unmoved. **Prediction 4 is NEITHER** — in COUNT it bites at every shape, in TIME at none, and *needs a shape built for it* is false twice, because `map-alias` reaches **24.0 MiB of settled results** through its own DATA: **stop-and-ask (c)'s permission granted and UNUSED**. **`z1` is a CATCH** at both rungs, and W80's other ten ceilings hold. **Decision 5 is necessary and not sufficient** ([Q335](../open-questions.md)): the same values on one tree read 58-95%, so the check's price is stated as a DIRECTION and the handle's as a COUNT. Readers **18 / 7 blocking** and **61 mutations / 39 survivors / 16 findings / 6 blocking**, overlap **3** — the FIFTY-FIRST measurement; the conformity reader's central obligation came back with **zero disagreements on the values** and found the clone counter counting `snapshot()`'s own clones, and the adequacy reader found the check ON decorative and each block deletable alone. Rule 8 final **51 probes, 36 caught, 14 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**. **It also forced decision 8**: the opt-out is a hand-built `Driver`, which `examples/l6.ts` forbade, and a MARKER alone was measured as permission a file grants itself — so that claim is a THREE-way equality and the decision is here rather than in an assertion's comment. Raises **Q335-Q339**; census **261 / 203 / 2 / 56** |
| W82 | **DONE** | **P21's EXIT ARTIFACT, and it had to CONSTRUCT its own case** — fact 3 re-taken at this item's declaration step is **0 violating results over 93 settled `done` across 19 corpus flows**, stronger than the plan's 0 of 5. `examples/workers/gauge.ts` declares a bound its own code does not keep past its declared example (Q302's arithmetic rebuilt) and `examples/workers/stamp.ts` has **no bug at all** — it returns a non-enumerable own property, so what `run()` returns CONFORMS and what `OR-R2`'s clone writes does not. **Both are GREEN at `check:workers` and every arc of the flow is `fits` at `checkWiring`**, which is ADR 0060 consequence 8 with an observer: *the reach is measured from both sides, because the corpus check cannot see either defect arriving OR leaving.* **L6 is 1724 assertions over 58 real runs in BOTH runtimes** (from 1639 / 55), L1-L5 **UNMOVED at 46 / 1295** in three runtimes, `check:spec` unmoved at **7 / 61 / 108**, `check:docs` **34 snippets: 28 run, 6 check** with `RUN_FLOOR` 27 → 28 and `X8` pairing **four** README fences. **The row carries THREE observers of one fact and the middle one is the RECORD** — the scheduler's live `detail.result` at the harness's own listener still has the key, the record does not, the finding says so — which is why `StampWorker` is INLINE and must be: *a thread hides the ATTRIBUTION and not the finding*, measured at both pool modes. **The two-word control is what makes `gauge`'s finding a function of the DATA**, and the **check-OFF pair** is decision 3 on real workers: the same run with the one option removed, identical dispatched ids, log record for record and every settled result, with the reports the one thing they differ in. **The cost ON and OFF is asserted as a COUNT and printed as a ratio** — 0.25x / 0.37x in node and 0.18x / 0.19x in deno over the rung's 204 settled results, a spread across runtimes that is decision 5's own argument. Readers **16 / 6 blocking** and **17 configurations / 13 green / 9 findings / 5 blocking**, overlap **1** — the **FIFTY-SECOND** measurement; the conformity reader's central obligation came back with **ZERO disagreements on the VALUES**, and the adequacy reader's central finding is that **every observer of the report was downstream of the report** — all three declared roads collapsed to it with every control green, after which a driver could report `$.NOTHING garbled` for every settlement and L6 stayed at 1720. **What refuses it is a property the LOG has and the report does not**: the walk reaches the CONFORMING settlements. Rule 8 final **52 probes, 39 caught, 12 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, digest identical at both ends, with all ten of the readers' exact edits checked in. **It corrects this plan in three places**: the seeded exceptions table is wrong in four ways, the `check-markdown.mjs` row is stale for the SECOND item running and names the wrong rung, and the **Exit artifact** line above carried a FOURTH standing copy of the claim commit `c869a4b` withdrew. Raises **Q340-Q343**; **Q344 spent**; census **265 / 207 / 2 / 56** |
| W83 | **CLOSED unissued** | reserved at the declaration and never issued, on P19's W75 and P20's W79 precedent. **It is SKIPPED, never reused**, so the next plan starts at W84 |
