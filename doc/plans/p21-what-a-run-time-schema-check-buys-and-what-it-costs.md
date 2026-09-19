# P21 — What a run-time schema check buys, and what it costs against what a settlement already pays

**Status:** **DECLARED** — no item started. Declared 2026-09-19 on `eb1dbe5` (P1-P20 complete and
retro'd, `doc/workflow.md` [v0.21](../workflow.md)), its facts measured the same day into
`dev-dist/p21/`.
**Question this plan answers:** *What does holding a worker's RESULT to the schema it declares buy a
consumer, and what does it cost against the clone the driver already pays on every settlement?*
**Exit artifact:** an L6 row on a real `FyflowScheduler` in **both** runtimes where a worker returns
a value its own `outputSchema` refuses, the run reports it by name rather than carrying it
downstream — plus **the measured cost of having the check ON for the whole rung**, against the same
rung with it off.
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

1. **It is OPT-IN and it is OFF by default.** *Over*: on by default, with an opt-out. P19's
   departure argument survives fact 4 — the schemas are the author's tool, and a library that
   refuses a run for a bound an author wrote loosely is a library that makes its own corpus
   unrunnable. **Fact 4 changes the price and not the default**, and an item that reads it as
   licence to turn the check on has misread it.
2. **What it checks is the RESULT against the worker's own `outputSchema`, and nothing else.** *Over*:
   also re-checking a node's input. The entry payload and a person's resolution are already held
   ONCE each by `FD-R4` (W73), and a node's input is what the wiring check decides statically; the
   result is the one value no existing mechanism sees at run time.
3. **A refusal is a TASK's failure, not a run's.** *Over*: stopping the run. [W61](../work-items/w61-what-a-transform-is.md)
   settled exactly this shape for `TransformFailed` — `failed` on an optional node, `user_action` on
   a non-optional one — and a result that does not match its schema is the same kind of event as a
   transform that would not evaluate. **An item that stops the run has broken this decision, and
   that is the sentence its adequacy reader should try to falsify first.**
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
   refusing as a TASK's failure — ADR 0060.
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
| **W80** | **What a run-time result check IS** — **ADR 0060**: the `DriverOptions` knob, OFF by default; the site (one, named); the refusal as a TASK failure on W61's precedent; the `spec/` rule and its id; the subset unchanged. **Fact 3 says there is no live defect, so the item must CONSTRUCT the case that makes it fire** and say what the wiring check and `FD-R4` cannot reach | `src/driver/**`, `src/definition/**`, `spec/**`, `test/driver/**`, `doc/decisions/0060-*` | nothing | L0 under all five typecheckers; L1-L2; `check:spec`; L6 UNMOVED |
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
| 2 | **The refusal is a TASK failure and needs no new run outcome** — W61's `TransformFailed` shape carries it, and `FD-R4`'s `BoundaryRefused` is the wrong precedent because that one is a REJECTED COMMAND with the driver unstarted | decision 3, from W61's and W73's shipped rules read on paper; **no item has yet tried to write the rule** | a result refusal that must reach a caller synchronously, which would make it `FD-R4`'s shape after all and reopen decision 3 |
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

- **(a) OFF by default — confirm.** Decision 1. Fact 4 makes the check cheap and P19's departure
  argument is about WHOSE tool a schema is, not about price. The plan recommends OFF; ON by default
  would make the corpus's own looser schemas into run-time refusals, which is the thing P19 refused.
- **(b) What the refusal IS.** Decision 3 says a TASK failure on W61's precedent. The alternative is
  `FD-R4`'s rejected-command shape, which is wrong here because the driver is running and no caller
  is on the stack — but it is the shape a consumer who wants a synchronous answer would ask for.
- **(c) Whether W81 may add a worker that returns megabytes.** Q320 cannot be reached with the corpus
  as it stands (fact 2), and building for a measurement is the thing
  [P15](p15-what-a-run-retains-and-what-a-result-may-be.md) did. It touches `examples/**` and moves no row.
- **(d) Whether the check reads EVERY declared example or only the first** — Q302's own *cheap half*,
  which is `check:workers`' rather than the driver's, and which would sit in W80's blast radius.

---

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

## Record

*Filled in as the plan runs.*

| item | status | |
|---|---|---|
| W80 | **not started** | |
| W81 | **not started** | |
| W82 | **not started** | |
| W83 | *reserved, expected unused* | |
