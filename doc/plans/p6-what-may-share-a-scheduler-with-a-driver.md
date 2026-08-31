# P6 — What may share a scheduler with a driver?

**Status:** declared — **the plan, its scope and its id block. W18 and W19 are named in the table
below and are NOT yet declared in their own files**, which is the first step of this plan and is what
`doc/workflow.md` section 1 rule 1 asks for before either starts. **Runs after
[P5](p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)**
**Question this plan answers:** [Q86](../open-questions.md) — *is a task id that does not **parse**
a defect that stops the run, or a task that is not ours?* And with it the two things
[ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
shipped as prose rather than as code: [Q87](../open-questions.md)'s error message, and
[Q95](../open-questions.md)'s unexercised latch.
**Exit artifact:** **a scheduler carrying a task this library did not mint, with two drivers running
flows on it, and both runs completing** — which is the topology ADR 0023 blessed and which today
stops **every driver on that scheduler**.
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
| **`InvalidTaskId` has three producers and Q86 is about ONE of them.** This is the fact that changes the plan | `buildTaskId` raises it **outbound**, on ids we mint ourselves (`src/driver/ids.ts`, six distinct refusals) — a defect in our own id scheme, and nothing here touches it. `parseTaskId` raises it at **two** inbound sites: `Driver.resolve()` (`driver.ts:380`), where the **consumer** supplies the id, and `onEventOrThrow` (`driver.ts:476`), where the **scheduler** does. **Only the third is Q86's.** An unparseable id handed to `resolve()` is unambiguously the caller's defect — they invented it — and must keep stopping the run. **The register and P5's ruling both read as though there were one site** |
| **three assertions pin the current behaviour, not one** | `test/driver/lifetime.test.ts:120-121` (the one P5's ruling cites), `lifetime.test.ts:360`, and `test/driver/fold-inputs.test.ts:215`. Two files, both W3's and W13's. **A passing test written on purpose is the cost of reversing this**, which is what makes Q86 a decision rather than a bug |
| **`AGENTS.md` does not mention `InvalidTaskId` at all** | zero occurrences, while `MissingJoinPolicy`, `DuplicateTaskId` and `MultipleRuns` are each documented and executed. **The reference documents three refusal classes and not the fourth** — which is [Q84](../open-questions.md)'s shape exactly, the omission P3's conformity reader called *"a claim by omission it does not defend"*. Whichever way ADR 0027 goes, the reference gains a row |
| **Q87's sentence recommends the violation, verbatim** | `MultipleRuns`' message is `'Construct a second Driver; ADR 0023 makes that safe on the same scheduler.'` It does **not** say *with a different run id*. A caller re-running the same workload constructs a second `Driver` and the obvious id is the one they already have |
| **[Q95](../open-questions.md) is not dead code — it is one stub away from a `DuplicateTaskId`**, and its precondition is not what the register said | The register implies a policy that reports `unsatisfiable` early. **It is any policy that settles a join before every branch is terminal.** Measured with a three-line quorum policy (`satisfied` on the first arrival): on the `resumed` row it settles at input 8 of 15 and `branch.suspended(1) branch.resumed(1) branch.arrived(1)` follow it. **With the latch deleted the trailing arrival re-enters `settleJoin`, the join routes a second time, and the run dies** — `DuplicateTaskId: "r1:publish:-:0" was already dispatched in run "r1"`. Across all forty current cells (ten rows × four policies) **zero** region events follow a join settling, because every policy we have satisfies only when all branches are terminal |
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
4. **[Q95](../open-questions.md) closed with a stub**: an early-settling policy in `test/driver/**`
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
- **[Q90](../open-questions.md)** — `ID-R4` tier 2's missing L6 coverage. Adjacent and not this
  plan's question; it needs an **injected** task, which is a different experiment.
- **[Q93](../open-questions.md)** — resolved in place by P5 rather than carried here.
- **[Q92](../open-questions.md)** — deferred by P5, and it is a `test/matrix/**` question.
- **[Q7](../open-questions.md)** — whether a join may time out. The quorum stub W19 writes is **not**
  a proposal to ship one; a policy that settles early is the *instrument*, and shipping one is a
  feature question this plan does not take.
- **[Q20](../open-questions.md)/[Q34](../open-questions.md)** — whether a run id is global, and
  portable id generation. Q87 interacts with both and neither is settled by fixing a sentence.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W18 | The scheduler edge, and what an id we did not mint means (ADR 0027) | `src/driver/**` (W3), `test/driver/**` (W3/W13), `spec/outcome-record.md` (W1), `AGENTS.md` (W9) | nothing | L0-L5, ADR 0027, then two readers |
| W19 | A task we did not mint, on a real scheduler, with two runs | `examples/**` (from W17) | W18 | L0-L6, then two readers |

**Why two and not one**, which is section 7 rule 1's test — items are separated by a spec, never by
intuition. W18 is `spec/outcome-record.md`'s `OR-R10` **amended** plus an ADR, and everything it
touches is fixtures over a fake. W19 is the same rule **on real workers** and touches no spec. Q95's
stub and Q87's sentence go to W18 because they are the same file and the same edge; **they are not
what the plan is about, and the Record must say so** rather than letting a defect fix launder itself
as a decision.

**Neither has its file yet, and this table is an index rather than the declaration** — writing
`doc/work-items/w18-*.md` and `w19-*.md` is P6's first act.

**Both items are serial.** Every file above is owned by a **done** item and no two P6 items edit one
file, so `doc/workflow.md` section 7 rule 2 is satisfied by the declaration rather than by ordering.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q86](../open-questions.md) | is an unparseable id a defect or a foreign task | **W18** — closed by ADR 0027, whichever way it goes |
| [Q87](../open-questions.md) | run ids unique across drivers on one scheduler | **W18 for the message sentence only.** The enforcement half stays a precondition and this plan says so in Scope/Out rather than leaving it to a reader |
| [Q95](../open-questions.md) | the `at most once` latch is unexercised | **W18**, closed with a stub |
| [Q84](../open-questions.md)'s shape, unnumbered here | `AGENTS.md` documents three refusal classes and not `InvalidTaskId` | **W18**, and it is a consequence of ADR 0027 rather than a question |
| [Q90](../open-questions.md) | `ID-R4` tier 2 has no L6 coverage | still no owner. **W19 is the nearest thing to a home it has had** — it builds a scheduler carrying foreign tasks — and the register should be re-read when W19 is declared in detail |

## A note on ids

**W10 stays held and W11 stays skipped**, for the third plan running and on P2's and P4's reasoning:
P2's retro named `check-owns.mjs` as W10 by name and by link, and although P4's retro **retired that
proposal**, taking W10 here would make that sentence false. So this plan starts at **W18**.

**ADR 0026 is P5's reserve and is not taken here even if P5 leaves it unused** — an unused reserve is
**skipped, never reissued**, which is what P5 did with P4's 0024. P6 starts at **0027**.

**Q ids resume at Q101.** P5 reserved **Q91-Q100** and has used Q91-Q95; Q96-Q100 remain P5's while
W16 and W17 are outstanding, so this plan does not take them.

## Record

*Filled in when the plan's items are merged and its retro is run.*

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
