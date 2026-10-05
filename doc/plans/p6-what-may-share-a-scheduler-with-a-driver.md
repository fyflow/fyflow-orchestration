# P6 — What may share a scheduler with a driver?

**Status:** **COMPLETE and retro'd.**
[W18](../work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md) and
[W19](../work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) are both DONE,
[ADR 0027](../decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) is
accepted, **the exit artifact exists on real workers**, and the retro made
[`doc/workflow.md` v0.8](../workflow.md). Read each item's status from its own file, never from this line
(`doc/workflow.md` section 1 rule 5). **Runs after [P5](p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)**

> **Correction, at declaration — three of the measured facts below are wrong, and the declaration
> step is what found them.** Recorded here rather than silently rewritten, because a plan that edits
> its own evidence to match a later measurement leaves nothing for a reader to check. **The corrected
> table is in [W18](../work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md),
> *What the declaration step changed*, and that is the version an item reasons from.** In short:
> `Driver.resolve()` is **not** a producer of `InvalidTaskId` — `isSuspended` returns `false` one
> line above the parse, so the site is unreachable and does **not** "keep stopping the run" as the
> table below says; `parseTaskId` has **two further call sites outside `src/driver/**`**, in
> `src/fold/run-state.ts`, which the producer table does not name; and the refusal counts are wrong
> (`buildTaskId` raises `InvalidTaskId` **twice**, not six times). **The first correction shrinks
> ADR 0027's blast radius and removes the second site the against-case was assumed to be true at.**
> This is the fifth plan running to find a row wrong by trying to act on it, and the first where the
> wrong rows are the **plan's own prose** rather than the register's.
**Question this plan answers:** [Q86](../questions/q86.md) — *is a task id that does not **parse**
a defect that stops the run, or a task that is not ours?* And with it the two things
[ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
shipped as prose rather than as code: [Q87](../questions/q87.md)'s error message, and
[Q95](../questions/q95.md)'s unexercised latch.
**Exit artifact:** **a scheduler carrying a task this library did not mint, with two drivers running
flows on it, and both runs completing** — which is the topology ADR 0023 blessed and which
~~today~~ **until ADR 0027** stopped **every driver on that scheduler**. **W18 built it over a fake
(`test/driver/lifetime.test.ts`, `ID-R5`); W19 owes it on a real scheduler**, which is where the two
items are separated.
**Reserves:** W18-W19, Q101-Q110, ADR 0027-0028

---

## Why this plan, and why now

**[P4](p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) blessed a topology and shipped two of
its preconditions as prose.** Its own retro calls that *"what P3's retro criticised, done knowingly on
the last day of the plan"* and left the verdict to P5. **P5 ruled and did not fold them in**, on its
own stated criterion — *a precondition is a property of the design; an apology is a property of a
defect* — and named this plan as where they go. That ruling is
[P5's](p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md), it is argued there in full, and
**this plan does not re-litigate it.**

What P5 could not do was own `src/driver/**`. **No P5 item takes that file**, by declaration, so
Q86's decision, Q87's one-line defect and Q95's stub all had nowhere to land. They land here.

**The reason this runs before the topology is recommended to anyone**, which is P5's phrasing and is
the actual urgency: `AGENTS.md` §9 tells a consumer that a second `Driver` on the same scheduler is
the supported answer. On a scheduler that carries anything else — a nightly cleanup task, another
library's work — **one settlement stops every driver subscribed to it.** That is a documented
recommendation with an undocumented precondition attached.

## The facts, measured before this plan was written

*`doc/workflow.md`: seven consecutive plans have measured their load-bearing fact before declaring,
and in all seven it changed what got written. Every register row below was verified against the code
rather than trusted — four plans running have each found one wrong by trying to act on it, and this
is the fifth.*

| | measured |
|---|---|
| ~~**`InvalidTaskId` has three producers and Q86 is about ONE of them.** This is the fact that changes the plan~~ **CORRECTED at declaration — see the header. The conclusion survives; two thirds of the evidence does not** | ~~`buildTaskId` raises it **outbound**, on ids we mint ourselves (`src/driver/ids.ts`, six distinct refusals)~~ — **two refusals, not six** — a defect in our own id scheme, and nothing here touches it. `parseTaskId` raises it at ~~**two**~~ **four** call sites: `Driver.resolve()` (`driver.ts:380`), ~~where the **consumer** supplies the id~~ — **which is UNREACHABLE with an unparseable id, because `isSuspended` returns `false` on line 379** — `onEventOrThrow` (`driver.ts:476`), where the **scheduler** does, and **`src/fold/run-state.ts:154` and `:179`, which this row does not name at all**. **Only the listener is Q86's**, and that half stands. ~~An unparseable id handed to `resolve()` is unambiguously the caller's defect — they invented it — and must keep stopping the run.~~ **It does not stop the run today; it returns `false`.** **The register and P5's ruling both read as though there were one site** — and this row, written to correct them, was wrong in the other direction |
| **three assertions pin the current behaviour, not one** | `test/driver/lifetime.test.ts:120-121` (the one P5's ruling cites), `lifetime.test.ts:360`, and `test/driver/fold-inputs.test.ts:215`. Two files, both W3's and W13's. **A passing test written on purpose is the cost of reversing this**, which is what makes Q86 a decision rather than a bug |
| **`AGENTS.md` does not mention `InvalidTaskId` at all** | zero occurrences, while `MissingJoinPolicy`, `DuplicateTaskId` and `MultipleRuns` are each documented and executed. **The reference documents three refusal classes and not the fourth** — which is [Q84](../questions/q84.md)'s shape exactly, the omission P3's conformity reader called *"a claim by omission it does not defend"*. Whichever way ADR 0027 goes, the reference gains a row |
| **Q87's sentence recommends the violation, verbatim** | `MultipleRuns`' message is `'Construct a second Driver; ADR 0023 makes that safe on the same scheduler.'` It does **not** say *with a different run id*. A caller re-running the same workload constructs a second `Driver` and the obvious id is the one they already have |
| ~~**[Q95](../questions/q95.md) is not dead code — it is one stub away from a `DuplicateTaskId`**~~ **CORRECTED by W18 — the precondition half stands, the `DuplicateTaskId` is the WRONG LATCH.** `settleJoin` has **two** `firedJoins.add` calls: the `unsatisfiable` branch, which is W15's G1 and the actual survivor (deleting it costs **0 of 386**), and the `satisfied` branch, which the quorum policy below exercises and which is **already covered** (deleting it costs 1 assertion, and the `DuplicateTaskId` is what its absence produces). The unsatisfiable exit routes nowhere, so it can produce no such refusal. **What it produces is a second `joinSettled(fired: false)`, or — with a policy that says `unsatisfiable` and later `satisfied` — a join routed out of after being declared dead, taking `RunState.outcome` from `stuck` to `completed` silently.** Expected values come from `spec/join-policy.md` section 4 | The register implies a policy that reports `unsatisfiable` early. **It is any policy that settles a join before every branch is terminal.** Measured with a three-line quorum policy (`satisfied` on the first arrival): on the `resumed` row it settles at input 8 of 15 and `branch.suspended(1) branch.resumed(1) branch.arrived(1)` follow it. **With the latch deleted the trailing arrival re-enters `settleJoin`, the join routes a second time, and the run dies** — `DuplicateTaskId: "r1:publish:-:0" was already dispatched in run "r1"`. Across all forty current cells (ten rows × four policies) **zero** region events follow a join settling, because every policy we have satisfies only when all branches are terminal |
| **so Q95 needs a stub, not a feature** | which is this repository's own rule, already written down for the seam's other exit: *"a seam with two exits and one reachable needs a stub, not a real run"*. `test/driver/` already carries two such policies (`driver.test.ts:389`, `fold-inputs.test.ts:176`) |

**What the measurement changed.** Q86 reads as *"reverse a refusal"* and P5's ruling weighed it that
way, against a real objection: a **corrupted** id for a task that IS ours would become a silent drop.
That objection survives — **but it applies to one of three sites, and the site it applies to is the
one where the caller invented the id, which is not the site Q86 is about.** The plan is written so
ADR 0027 can change the scheduler edge and leave the other two untouched, which was not visibly
available before.

## The decision that is NOT taken before fan-out, and the third option nobody named

**Q86 is genuinely two-sided and the register states both sides fairly.** What it does not state is a
third option, and it is the one this plan expects ADR 0027 to have to argue against:

> **Ignore it, but report it.** Do not stop the run on an unparseable id arriving from the
> **scheduler**; do not route on it either; surface it through a channel a consumer can subscribe to.

**Why it may dissolve the deadlock:** every clause of the *against* case is about **silence**, not
about **stopping**. *"A corrupted id for a task that IS ours would become a silent drop and the run
would hang instead of stopping"* — true of *ignore*, false of *ignore and report*. *"It would make
`OR-R10`'s `InvalidTaskId` path unreachable from the scheduler edge"* — true, and W5 found that path
by reaching it, so the replacement must be reachable in the same way.

**It is written here as a candidate, not as the answer.** W18 takes the decision and is **not
entitled to inherit this paragraph**; ADR 0027 stating *"stop the run, and the precondition stands"*
is a real outcome, and it is the cheapest one. What the plan fixes before fan-out is that all three
options are on the table with their costs measured, not that one of them wins.

## What each answer would cost, stated now so W18 cannot discover it late

| | |
|---|---|
| **stop the run (no change)** | costs nothing in code and keeps a **precondition nobody can audit**: *"the scheduler carries only flow tasks"* is a claim about everything else on that scheduler, including code the flow author does not own. P5's ruling calls that *"a hazard with better manners"*. It also leaves `AGENTS.md` §9 recommending a topology whose precondition it does not state |
| **ignore it** | deletes three passing assertions written on purpose, and makes `OR-R10`'s `InvalidTaskId` unreachable from the scheduler edge — **a W5 finding undone**. A corrupted id for one of our own tasks becomes a silent drop and the run hangs rather than stopping, which is strictly worse than today: `stuck` is at least an outcome |
| **ignore it, but report it** | keeps the corrupted-id case legible and costs a **new outbound channel or a new reason on an existing one**, which is public surface — the thing P4 spent a whole plan narrowing. `onRunFailure` is the obvious home and it is exactly wrong: the run has **not** failed. So this option's real cost is a naming decision on `Driver`'s surface, which is why it is an ADR and not a patch |

## Scope

**In**

1. **ADR 0027 — Q86**, covering the **scheduler edge only**, and stating explicitly what it does
   **not** change (`resolve()`'s site, and every `buildTaskId` refusal).
2. **Whatever ADR 0027 ships**, with `spec/outcome-record.md`'s `OR-R10` amended if the decision
   touches it and its rationale stated.
3. **Q87's one-line message defect** — `MultipleRuns` must not recommend the violation.
4. **[Q95](../questions/q95.md) closed with a stub**: an early-settling policy in `test/driver/**`
   that makes the `at most once` latch load-bearing, with the `DuplicateTaskId` above as the
   assertion.
5. **`AGENTS.md` gains `InvalidTaskId`**, whichever way ADR 0027 goes — the reference documents three
   refusal classes and not the fourth.
6. **The exit artifact**: a scheduler carrying a task this library did not mint, two drivers, both
   runs completing.

**Out** — named rather than left implicit, with where it goes instead

- **Q87's enforcement half.** Run ids being unique across drivers on one scheduler **stays a
  precondition**, on P5's argument, which this plan adopts rather than re-deriving: no driver can
  detect it (`SchedulerLike` is two methods by ADR 0013 rule 1), and the alternative is a
  `WeakMap<SchedulerLike, Set<runId>>` — **the first mutable module-level state in `src/`**. Only the
  *message* is a defect.
- **[Q90](../questions/q90.md)** — `ID-R4` tier 2's missing L6 coverage. Adjacent and not this
  plan's question; it needs an **injected** task, which is a different experiment.
- **[Q93](../questions/q93.md)** — resolved in place by P5 rather than carried here.
- **[Q92](../questions/q92.md)** — deferred by P5, and it is a `test/matrix/**` question.
- **[Q7](../questions/q7.md)** — whether a join may time out. The quorum stub W19 writes is **not**
  a proposal to ship one; a policy that settles early is the *instrument*, and shipping one is a
  feature question this plan does not take.
- **[Q20](../questions/q20.md)/[Q34](../questions/q34.md)** — whether a run id is global, and
  portable id generation. Q87 interacts with both and neither is settled by fixing a sentence.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W18](../work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md) — **done** | The scheduler edge, and what an id we did not mint means (ADR 0027) | `src/driver/**` (W3), `test/driver/**` (W3/W13), `spec/outcome-record.md` (W1), **`spec/task-id.md` (W1)**, **`spec/README.md` (W1)**, `AGENTS.md` (W9) | nothing | L0-L5, ADR 0027, then two readers |
| [W19](../work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) | A task we did not mint, on a real scheduler, with two runs | `examples/**` (from W17) | W18 | L0-L6, **both L6 runtimes**, then two readers |

**Two files were added to W18's `Owns` by the declaration step, and the second is a rule rather than
a judgement.** `spec/task-id.md` because **`ID-R4`'s row states Q86 as its first precondition** —
whichever way ADR 0027 goes, that sentence changes, and it is not in `spec/outcome-record.md`; the
index table above named only `OR-R10`'s document. And `spec/README.md` because `doc/workflow.md` v0.7
puts it with whichever item owns the spec document that moves it (`check-spec`'s `C8` makes its
version row a consequence of any `spec/**` bump), which is an `Owns` question rather than a
record-step one.

**Why two and not one**, which is section 7 rule 1's test — items are separated by a spec, never by
intuition. W18 is `spec/outcome-record.md`'s `OR-R10` **amended** plus an ADR, and everything it
touches is fixtures over a fake. W19 is the same rule **on real workers** and touches no spec. Q95's
stub and Q87's sentence go to W18 because they are the same file and the same edge; **they are not
what the plan is about, and the Record must say so** rather than letting a defect fix launder itself
as a decision.

**This table is an index rather than the declaration, and the declarations now exist** —
[`w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md`](../work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
and [`w19-a-task-we-did-not-mint-on-a-real-scheduler.md`](../work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md),
written as P6's first act. **Read the item's own file, never this row** — `doc/workflow.md` section 1
rule 5's provenance clause, and this table is exactly the kind of index it is about.

**Both items are serial.** Every file above is owned by a **done** item and no two P6 items edit one
file, so `doc/workflow.md` section 7 rule 2 is satisfied by the declaration rather than by ordering.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q86](../questions/q86.md) | is an unparseable id a defect or a foreign task | **W18** — closed by ADR 0027, whichever way it goes |
| [Q87](../questions/q87.md) | run ids unique across drivers on one scheduler | **W18 for the message sentence only.** The enforcement half stays a precondition and this plan says so in Scope/Out rather than leaving it to a reader |
| [Q95](../questions/q95.md) | the `at most once` latch is unexercised | **W18**, closed with a stub |
| [Q84](../questions/q84.md)'s shape, unnumbered here | `AGENTS.md` documents three refusal classes and not `InvalidTaskId` | **W18**, and it is a consequence of ADR 0027 rather than a question |
| [Q90](../questions/q90.md) | `ID-R4` tier 2 has no L6 coverage | still no owner. **W19 is the nearest thing to a home it has had** — it builds a scheduler carrying foreign tasks — and the register should be re-read when W19 is declared in detail |

## A note on ids

**W10 stays held and W11 stays skipped**, for the third plan running and on P2's and P4's reasoning:
P2's retro named `check-owns.mjs` as W10 by name and by link, and although P4's retro **retired that
proposal**, taking W10 here would make that sentence false. So this plan starts at **W18**.

**ADR 0026 is P5's reserve and is not taken here even if P5 leaves it unused** — an unused reserve is
**skipped, never reissued**, which is what P5 did with P4's 0024. P6 starts at **0027**.

**Q ids resume at Q101.** P5 reserved **Q91-Q100** and has used Q91-Q95; Q96-Q100 remain P5's while
W16 and W17 are outstanding, so this plan does not take them.

## Record

**Both items are done and the retro is run.** It is the section at the end of this Record, and it
made `doc/workflow.md` **v0.8** — two changes, both to rule 8, and one refusal.

### The exit artifact exists

**A scheduler carrying tasks this library did not mint, two drivers running flows on it, and both
runs completing** — row 19 of ladder L6, in **node and deno**, and it is what
[W19](../work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) built. Five foreign ids, one
per refusal `parseTaskId` makes, all settling **before either run settles anything** and with both
drivers already attached; both runs `completed` with all four of their own task ids each; each driver
reporting all five through `onUnmintedTask` under **its own** run id. L6 is **19 row labels, 21 real
runs, 373 assertions**, from 18 / 19 / 342.

**Under ADR 0023 rule 2 — the rule this plan's decision supersedes — that row is not reachable**, and
W19 measured it on the row's own flow rather than inheriting the number: both runs `stopped`, each
dispatching **1 of its 4** tasks. **13 L6 failures.**

### W19 — three things about the METHOD, and the third is a category rule 8 does not have

**1. `doc/workflow.md` v0.7 change 3 fired, on the first item that could hit it, in the direction its
own retro predicted.** P5's retro added `doc/decisions/**` to the record step *"so a demonstration
could correct the decision it demonstrates"*, after the gap blocked W17 from correcting ADR 0015.
W19's declaration named itself *"the first item likely to hit it again"*. **It did**: ADR 0027's
producer table listed three producers of an unparseable id and could not name the one W19 built on
real workers — its third row is *"a `detail` with **no** `id`, or an `id` that is not a string"*,
while `pc:ingest:x:0` is a four-segment string in our own shape, which is the class the decision's
whole argument turns on. **Producer row 4 added, no rule changed, no exception declared or needed.**
The rule cost one paragraph. **That is a second occurrence for v0.7 change 3 and the retro should
say so.**

**2. Rule 8's two halves, fifth sample — and both blocking survivors fell OUTSIDE both halves.** The
**rule**-written half found the one code-level survivor: L6 injected a colon-free id only, so
narrowing tier 0 by the shape of the id restored ADR 0023 rule 2 for six of seven shapes with the
gate green. The **`Outputs`**-written half found that output (4) is unachievable in a markdown file
and only partly achieved in `l6.ts` ([Q100](../questions/q100.md), two more occurrences). **Neither
found either of the adequacy reader's two BLOCKING survivors**, and both of those were the same
thing: **the provenance of a harness value.** A latched flag standing in for *"both drivers were
attached"*, whose guard could be deleted with all 370 green; and an assertion whose **source** could
be swapped from the scheduler to a driver, which is exactly what the item's own `Outputs` row (3)
forbids in prose. Neither is a clause of the rule; neither is a row of the table. **The proposal for
the retro: an author's set is written to what the item CLAIMS, and a reader's to where the claim's
VALUE comes from.** Second occurrence needed before it becomes a rule — but note W17's `finishedBy`
and `lateInputs` were the same shape, which makes **three** in `examples/**` alone.

**3. W18's own carried-forward finding held, and it held for the READERS' fixes.** *Rule 8 says break
the fix; it does not say break the fix you wrote for the last provocation.* W19 re-ran its whole set
twice — once after closing its own survivor, once after the readers' — and **checked the readers'
exact edits back in as probes**. That is what turned *"fixed"* into 2, 2, 2 and 6 failures. **W18
proposed this and asked P6's retro to judge it on W19's evidence; W19's evidence is that it fired,
and that the anchors of two probes had moved so far that the harness's rule-7 (b) guard aborted the
run rather than reporting a pass.**

### Reader overlap — the ninth measurement

**Two readers, 18 findings, 4 shared**, inside `doc/workflow.md` section 6's stated 1-4 band for the
ninth time. Each arrived from a different direction, and one of the four — **tier 0's `event` field
taking one value at L6** — was found by both from routes with nothing in common: the conformity
reader from ADR 0027's *Consequences*, the adequacy reader from a mutation. It is
[Q107](../questions/q107.md).

### W18 — what it decided, and the two things about the METHOD worth carrying

**[ADR 0027](../decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
takes the third option**, and this plan's own framing of that option is not what carried it. The plan
argued *"every clause of the against-case is about silence rather than about stopping"*. That is true
and it is an argument about the **shape** of the objection. What actually decided it was a table the
plan does not contain: **who produces an unparseable id at that listener.** Two of the three producers
can never be ours and are the common case on the topology ADR 0023 blessed; the third could be ours
and is rare. Stopping is right for one and catastrophic for the other, no answer can discriminate,
and *report* is the only one wrong in neither direction. **The plan reached the right option from a
weaker argument** — which is P5's own lesson (*"its conclusion survived and its ARGUMENT did not"*)
arriving one plan later, in the plan's own prose this time.

**And the leaning W18 was warned not to inherit did not carry it either.** The declaration's sentence
— that correction 1 *"shrinks ADR 0027's blast radius and removes the second site the against-case was
assumed to be true at"* — is factually true and W18 verified it. But it argues from **sites**, and the
decision turned on **producers**. Recorded because the warning was worth issuing and the answer to
*"did the fresh session inherit it?"* is *no, and for a reason that is checkable rather than a
disposition*: a different argument reached the same place, so the leaning's correctness was never
load-bearing.

### Note 2 — rule 7 (c), asked for the fourth plan and still UNEXERCISED

W18's declaration took **one conditional exception**, `scripts/check-source.mjs`, to be used *if
ADR 0027 created a refusal `src/` must not make*. **It did not**, and the exception is unused. ADR
0027's constraints are all things the driver must **do** (report at tier 0, keep the narrow rethrow,
keep the fold's calls throwing), and each is asserted directly by a test that fails when it is broken
— a `check-source` clause restating them in text would be weaker than what already exists. **So this
plan reports rule 7 (c) unexercised for the fourth time, and it is now the second consecutive plan
whose reason is that no check was worth building** rather than that none was possible.

### Note 3 — TWO exceptions declared late, and the second is v0.7 change 3 in a directory it does not cover

**First, `scripts/check-docs.mjs`.** Its `RUN_FLOOR` is a ratchet whose own comment obliges the item
that adds an `AGENTS.md` snippet to raise it. W18 added one, the floor went stale, and the self-test
probe written to catch a deleted snippet **passed** at 14 - 1 = 13. The file is in nobody's `Owns` and
is not a record-step file. `doc/workflow.md` v0.7 answered the `spec/README.md` case by making it an
`Owns` question; **whether the same answer fits a check script is [Q102](../questions/q102.md)**.
**The occurrence to carry is the direction of the failure**: a ratchet left un-raised does not fail
loudly, it silently stops ratcheting, and the only thing that noticed was a probe the item was not
obliged to run.

**Second, `spec/join-policy.md`, and it is the one that matters for a rule.** W18's Q95 stub asserts
two things about section 4's `unsatisfiable` exit — **once per region**, and **terminal for the
region** even when the policy later answers `satisfied`. Section 4 stated **neither**; the driver has
enforced both with one latch since W3, and Q95 is the measurement that the second was enforced
untested. Found by the spec-conformity reader. **This is v0.7 change 3's argument — *a gap that blocks
a fix is worse than one that hides an edit* — in `spec/**` rather than in `doc/decisions/**`**, and
the reason no declaration could have covered it is sharp: **which spec clause a stub makes
load-bearing is not knowable until the stub exists.** W17 could not correct a false sentence in
ADR 0015; W18 could not write down a true one in `spec/join-policy.md`. **Second occurrence, second
directory** — which is section 6 pass 3 rule 2's bar, and the retro's to judge.

**Both are declared in W18's Exceptions table, marked as late, with why neither could come first.**
*(That sentence was itself wrong for a while: this Record and `CLAUDE.md` both claimed the table said
so before it did. The conformity reader caught it, and it is the `doc/`-is-checked-by-nothing class in
its most embarrassing sub-case — an item's own account of its own compliance.)*

### Note 4 — rule 8's two halves, fourth sample, and a shape none of the first three had

W15 and W16 wrote to the **rule** and were blind to what the item **created**; W17 wrote to the
**deliverable** and was blind to a **clause of the rule**; **W18 wrote to both, and each half found a
different class**. The rule-written half found two clauses that could be *stated but not falsified* —
the `instanceof` rethrow and the `reason`'s two branches. The `Outputs`-written half found both Q95
cases vacuous and the `AGENTS.md` snippet's assertions deletable. **Neither half found the other's**,
which is the amendment's own prediction holding on a fourth sample.

**What is new, and it is the finding for the retro.** Both of the adequacy reader's BLOCKING
survivors were **in guards W18 had just written to close an earlier finding in the same item**: the
`ID-R5` fixtures that only ever delivered one of six refusals, and the `bothArrive` precondition that
admitted a trailing event which never re-enters `settleJoin`. **Rule 8 says break the fix and watch
the gate go red; it does not say break the fix you wrote for the last provocation.** An author's set
is written once, before the readers report, and the fixes that follow are the least-tested code in the
item — which is rule 8's own founding observation (*three consecutive items shipped a repair that
could not fail*) applied to repairs made **inside** the rule's own procedure. W18's response was to
re-run the whole set after acting, and to check the readers' exact edits back in as probes; whether
that becomes a requirement is P6's retro to judge, on W19's evidence as well.

### Carried forward for the retro — the two questions this plan came in with

**Both are answered below, in the Retro.** They are left here in the form they were asked so the
answers can be read against them.

1. **Does rule 8's "write to the rule" form change the numbers?** Note 4 — fourth sample, both halves
   confirmed non-redundant, and one shape none of the first three had. Judged with W19's: **no, and
   the amendments that followed are why.**
2. **Does rule 7 (c) ever fire?** Note 2 — no, fourth time. **Reported, not retired.**

---

*The two items P5 carried in are below, unchanged.*

**Two things carried in from P5's retro**, so they are not lost:

1. **Does rule 8's "write to the rule" form change the numbers?** P5's W15 is the first real sample
   and the answer was *no, and for a reason the amendment does not address*: the author's set was
   complete on the rules and still blind to the **deliverable**, because every probe written to a
   rule mutates something the suite reads. **If W18's and W19's readers find the same shape a third
   time, the amendment needs replacing rather than extending.**
2. **Does rule 7 (c) ever fire?** Unexercised by P4 and by P5's W15. **W18 is the first item in three
   plans with a plausible reason to add a check script** — if ADR 0027 creates a refusal the driver
   must not make, that is a `check-source.mjs` clause. If it does not, this plan reports it a fourth
   time.

---

## Retro — pass 3, and `doc/workflow.md` is now [v0.8](../workflow.md)

**Two items, four reader passes, two changes, one refusal.** Both changes are to rule 8 and neither
replaces anything, which `doc/workflow.md` section 6 pass 3 rule 4 asks to be said explicitly:
v0.7's two amendments to that rule both earned their keep on this plan's evidence, so it grows.

### The central finding: rule 8's two obligations are both about WHAT is asserted

Neither asks **where the value came from**. That is where every blocking survivor of three
consecutive `examples/**` items lived, and not one was found by an author:

| | the value | how it broke, with the gate green |
|---|---|---|
| W14 | the pair row's disjointness | read off `driver.dispatchedIds()` — **the code under test**. 233/0 while the scheduler was handed 55 `addTask` calls for 50 distinct ids |
| W17 | `finishedBy` | read from a **flag the loser also set**, so it proved the predicate fired and never that it ended the wait |
| W17 | `lateInputs` | a **single recording** whose one `push` could be deleted, making *"nothing arrived after"* a tautology on nineteen rows |
| W19 | *"both drivers were attached"* | a **latched field** whose first-settlement guard could be deleted, so every later settlement overwrote it |
| W19 | the foreign settlement's **ordering** | its **source** could be swapped from the scheduler to a driver, and with the benign ordering applied too the row read **0 failures, exit 0** |

**Five instances, three items, all BLOCKING, all found by adequacy readers.** So rule 8 gains a third
obligation: **break the provenance** — substitute a different source, delete the guard that makes a
recorded value the one it claims to be, let a later write overwrite it, delete one of two writers.

**Why it generalises, stated rather than assumed** (section 6 pass 3 rule 2): this is **section 5
rule 4 made provocable**. *"Fixtures must not come from the code under test"* has been in the
document since v0.3 with **no procedure attached** — a thing an author declares and a reader checks —
and the five rows above are what that has cost. **The qualification is stated rather than hidden:
all five are in `examples/**`**, where values are *reported* rather than asserted, so a harness is
where this should be expected to live first. Whether it reaches `src/` or `test/` is P7's to measure.

### The second change: an author's set is written once, and the fixes that follow are not in it

**W18 found it and asked this retro to judge it on W19's evidence.** Both of W18's blocking survivors
were in guards it had written *earlier in the same item* to close the readers' first findings — which
is rule 8's own founding observation (*three consecutive items shipped a repair that could not fail*)
occurring **inside rule 8's own procedure**. **W19 ran the amendment and it fired**: after its first
close moved two probe anchors, its harness's rule 7 (b) guard aborted with *"the mutation matched
NOTHING"* rather than passing for the wrong reason, and the readers' four edits are now checked-in
probes costing 2, 2, 2 and 6 failures. Adopted. It is rule 7 (a)'s *"a probe that ran once is a claim
about the past"*, applied to a fix rather than to a check.

### The two questions this plan came in with, answered

**1. Does rule 8's "write to the rule" form change the numbers?** Carried from P5, and the answer
across five samples is **no, and the amendments that followed are why**. Both halves did work no
other half did — W19's rule-written probes found that L6 injected one **colon-free** foreign id, so
tier 0 could be narrowed by the shape of the id with all 370 assertions green; its `Outputs`-written
probes found an output that is **unachievable** rather than unbuilt. **And neither found the two that
mattered.** P5's retro asked *"if W18's and W19's readers find the same shape a third time, the
amendment needs replacing rather than extending"* — they did **not** find the same shape; they found
a new one, which is why rule 8 is extended and not replaced.

**2. Does rule 7 (c) ever fire?** **No, for the fourth plan** — and for the **second consecutive**
plan the reason is that no check was worth building rather than that none was possible. W18 declared
a conditional `scripts/check-source.mjs` exception in case ADR 0027 created a refusal `src/` must not
make. It did not: every constraint that decision imposes is a thing the driver must **do**, each
asserted directly by a test that fails when it is broken, and a `check-source` clause restating them
in text would be weaker than what exists. **Reported, not retired** — the requirement discriminated
on its one real use (W16), and a requirement on new checks cannot fire in a plan that adds none.

### What did NOT change, and all three were live

- **`check-owns.mjs` stays retired, for the third plan.** W18 and W19 both audited their `Owns`
  correctly; W19 declared an **empty** exceptions table and it was empty. **Seven consecutive items.**
- **The two-reader split is settled and closed to re-litigation.** Ten overlap measurements — 1, 2, 3,
  3, 3, 3, 3, 4, 4, 4 — none outside the band, across items from a one-line fix to the largest surface
  change here. W19's four arrived from four different directions, and one of them (`ID-R5` at L6
  seeing `task.completed` and nothing else, [Q107](../questions/q107.md)) was reached by both readers
  from routes with nothing in common.
- **The ladder is unchanged, and section 4's warning about L6 earned itself twice in one plan.** The
  two items sit on opposite sides of it by declaration: **W18's gate EXCLUDES L6** — its whole surface
  is fixtures over a fake — and **W19's turns on it**, its own file saying that a green L0-L5 proves
  nothing about a foreign task on a real scheduler. Both were right, and splitting the plan on exactly
  that line is what let W18 decide and W19 demonstrate. *"Do not skip L6 because 0-5 are green"* is
  the sentence, and W19's five foreign ids are what it bought: three of the five reach refusals no
  fixture had delivered to a listener.

### The refusal, sixth time, and this one the retro produced itself

**`doc/` is checked by nothing, and P6's occurrence runs in a new direction.** Every previous one was
**stale** — a claim that had been right and stopped being right. This one is the opposite: the
register's census line was **correct**, and the agent re-deriving it during the record step used a
parser that broke on the three longest rows, was told by its own script that those rows had *no
status cell*, believed it, and wrote that explanation into the register, into `doc/workflow.md` and
into a commit message. **All three rows have status cells.** Corrected in place, with the wrong
version quoted rather than deleted.

**The narrow lesson, which is the transferable one.** `CLAUDE.md` records P4 getting this same line
wrong three times *"by chaining a derivation instead of stating a predicate"*, and P5's answer was to
make it state one. **That was right and it is not sufficient**: here the predicate was correct and
the **evaluation** of it was not. A derivation that runs is not a derivation that is checked, and the
guard this one lacked is cheap — **a parser that cannot classify a row must say so loudly rather than
return a value.** No check over `doc/` would have caught it either: the output was prose, and the
script that produced it was written and thrown away in the same step. **Refused again on P2's
unchanged reasoning.**

### Named rungs, per section 6 pass 3 rule 5

| defect this plan produced | which rung should have caught it |
|---|---|
| tier 0 narrowable by the shape of an id, all 370 green | **L6** — and it did, once the row injected an id per refusal. The first version reached one of five |
| `ID-R5` at L6 exercised on one event name | **L6**, and it still does not — [Q107](../questions/q107.md), reported with the reason it was not built |
| the latched `listenersAtFirstSettlement`, and the swappable ordering source | **none.** Both are provenance, both were found by a reader, and that is the whole of change 1 |
| ADR 0027's producer table missing a producer | **none, and correctly** — L0-L6 are commands, and *"does this table enumerate what your code demonstrates"* is not one. Section 4's own list already names *a false claim in `doc/`* as a conformity-pass defect class |
| the census line's broken derivation | **none, and refused for the sixth time** |

### What P6 leaves for P7

Three things, each with its cost now measured rather than estimated:

1. **[Q90](../questions/q90.md) — `ID-R4` tier 2 has no L6 coverage, and the instrument now exists.**
   Its stated ground for having no home was that *"a real scheduler produces one only if something
   **injects** it — which no L6 row does"*. One now does: `ForeignTask.id` reaches the scheduler
   verbatim, and `pc:notanode:-:0` parses, reaches tier 2 and is `UndispatchedTask`. **The marginal
   cost is the string.** W19 re-read the row as the row asked, recorded the re-read and did not take
   it. **The retro's ruling: it is a work item, not a plan**, and the *against* case is untouched and
   is now the whole of the argument — injecting a task the driver did not mint is a scenario no
   consumer produces on purpose, so the row would test the refusal rather than the system. **P7
   decides on that argument, not on the cost.**
2. **[Q107](../questions/q107.md) and [Q108](../questions/q108.md)** — the two halves of ADR 0027 that
   nothing executes. Q107 needs a worker role that fails fast enough to keep W19's ordering
   determinate; Q108 needs a worker that calls `context.spawnTask()`, which runs into ADR 0001 rule 2
   and therefore needs its framing decided before it is written.
3. **[Q100](../questions/q100.md) gained a sub-case that is not fixable where it sits.** *"Counts
   derived rather than typed"* is **unachievable** in a markdown file, so `examples/README.md`'s three
   numbers cannot be made self-checking without a check that reads them. That is the first time this
   register row has had a concrete mechanism attached to it.

**Not carried, and said so:** `test/driver/lifetime.test.ts:324` says `ID-R5` is *"one guard over SIX
refusals"* where `parseTaskId` makes **five**. W19 inherited the six into its own prose before its
conformity reader caught it there. It is W18's file and needs an owner rather than a drive-by fix.
