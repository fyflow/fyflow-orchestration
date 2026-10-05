# P4 — The driver's lifetime, and the handles it gives out

**Status:** **complete** — W12-W14 built, six reader-passes, gate re-run, **retro done** (`doc/workflow.md` is v0.6)
**Question this plan answers:** *What is a `Driver`'s lifetime — and what makes an inbound event, or
an outbound handle, **this run's**?*
**Exit artifact:** a **fourteenth ladder-L6 row**: two runs, two `Driver`s, **one** scheduler, both
completing on real workers — the pairing that silently corrupts both runs today.
**Reserves:** W12-W14, Q81-Q90, ADR 0022-0024

---

## Why this plan, and why now

**Three defects in shipped code, all found by readers, none fixed, and they are one subject.**

| | |
|---|---|
| [**Q53**](../questions/q53.md) | `Driver`'s public surface says it serves many runs and `ID-R3` says it serves one. `start(runId, payload)` takes the id per call, `failedRuns` is a `Set`, `hasFailed(runId)` is public. Three shapes that only make sense for many runs. Raised by **W5**'s conformity reader |
| [**Q72**](../questions/q72.md) | **Two `Driver`s on one scheduler cross-route.** `ID-R3` refuses a second run on one driver; **nothing refuses a second driver on one scheduler.** Each receives the other's settlements and a task id is dispatched twice — the two-outcomes-under-one-key corruption `spec/task-id.md` section 2 exists to describe. Measured by **W9**'s adequacy reader |
| [**Q73**](../questions/q73.md) | `onRegionEvent` hands out the driver's **own live object**, while `snapshot()`, `foldInputs()` and `onFoldInput` all return frozen copies. A listener that mutates it corrupts the fold. Measured, same reader |

**Q72 is the sharp one, and the reason is not its severity.** `MultipleRuns`' own error message says
*"construct a second Driver"* — so **a consumer following the library's own advice produces the
corruption.** `AGENTS.md` documents that hazard in **three places** (§2 line 118, §9 lines 591-598,
§10 lines 656 and 659-660), which is [P3](p3-a-consumer-reference-the-gate-keeps-true.md)'s finding
stated in the other direction: *the reference stayed true by describing a defect*, and a reference
apologising for the code is a cost the gate cannot see.

**Why this before [Q24](../questions/q24.md).** Q24 is a deliberate non-decision — two one-line
policy refinements that [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
names and declines. These three are **defects**. Q24 stays the live *feature* question and is
explicitly not this plan.

## The facts, settled before this plan was written

*Five consecutive plans have measured their load-bearing fact before declaring — ADR 0013, P2's two
spikes, P3's extraction spike, and this. In all five it changed what got written, and here it changed
the answer itself.*

**The register was verified against the code first** (`doc/workflow.md`: a register row you are about
to act on is unverified until you have — W5 found [Q43](../questions/q43.md) simply false).

| | measured |
|---|---|
| **Q72 reproduces** | two drivers on one fake scheduler: `run-a:publish:-:0` is **dispatched twice**, driver B's log holds driver A's outcome, and **no failure is reported** — `ID-R1` cannot fire, because each driver has its own dispatched-id set |
| **the register is wrong in one detail** | Q72 says *"both runs report `stopped`"*. On `linear.flow.json` **neither does**: the corruption is entirely silent. That `stopped` came from a flow with a join and does not generalize. **Corrected in `doc/open-questions.md` rather than inherited** |
| **Q72b reproduces** | a `run-9:` settlement delivered to a `run-1` driver dispatches `run-9:publish:-:0`. Exactly as written |
| **Q73 reproduces** | `onRegionEvent`'s argument is **not frozen**; a listener writing `e.branchPath` makes the driver's own `foldInputs()` read `CORRUPTED` |
| **filtering by run id is the WRONG check** | **the finding that changed the plan.** Four inbound ids that are *not* another run's are accepted and appended today: a node of ours we never dispatched, a node **not in the definition at all**, and a branch path never opened. A run-id filter covers **one of four**. `this.dispatched.has(taskId)` covers **all four**, needs no new state, and subsumes the run-id case |
| **a malformed id must keep stopping the run** | it does — `InvalidTaskId` through `onRunFailure`, `OR-R10`. The guard sits *after* `parseTaskId`, so it still does. Verified under the spike |
| **run id at construction works, and L6 does not notice** | spiked in the working tree: `src/` typechecks clean, `ID-R2`'s charset refusal lands in the constructor beside `MissingJoinPolicy`, and **all thirteen L6 rows pass** with a **two-line** change to `examples/run-flow.ts` |
| **the cost is call sites and the reference, not behaviour** | **77 typecheck errors across four test files, 2 in `examples/`, and 4 of 15 `AGENTS.md` snippets stop compiling.** The last is the gate working, not a problem |
| **and one thing `spec/` warned about in advance** | `spec/task-id.md` section 3: widening `ID-R3` to refuse *any* second `start()` **takes `ID-R1`'s only direct test away** — W3 provokes a duplicate dispatch by starting the same run twice. **A replacement was measured before this plan was declared**: settling the same task twice fires `ID-R1` on the successor's redispatch, reported through `onRunFailure` rather than thrown |

**What the measurement changed.** The brief for this plan asked whether filtering by run id in
`Driver.onEvent` is correct. It is not — it is a *narrower* check than the one the driver can already
make for free, and three of the four holes it leaves have nothing to do with run ids.

## Decisions taken before fan-out

*`doc/workflow.md` section 7 rule 3: decide, then fan out.*

1. **A `Driver` takes its run id at construction.** `start(payload)`; `hasFailed()`; `failedRuns`
   becomes a boolean. `ID-R2`'s charset refusal moves to the constructor, where `MissingJoinPolicy`
   already lives, and `ID-R3` becomes *"`start()` once"*. **Breaking change to a public surface —
   ADR 0022.**
2. **An inbound settlement is this run's if and only if this driver dispatched its task id.** Not a
   run-id filter; the dispatched-id set the driver already keeps. A settlement that does not match is
   **not ours** and is not appended. A task id that does not *parse* still stops the run, unchanged.
   **ADR 0023**, which also decides whether "not ours" is silent or observable.
3. **Q73 is a conformity fix and gets no ADR.**
   [ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) and `OR-R7`
   already say every outbound value is a frozen copy; `onRegionEvent` does not do what they say. There
   is nothing to decide, which is why it is the first and smallest item rather than part of the ADR.
4. **[Q24](../questions/q24.md) is not this plan**, and neither is [Q71](../questions/q71.md) —
   `SchedulerLike` under the DOM lib is a separate surface question with its own trade-off recorded.

## Which files this plan takes over, and why

**`src/driver/**` is [W3](../work-items/w3-the-driver-and-the-validator.md)'s `Owns` and W3 is
done.** `doc/workflow.md` section 7 rule 2 binds *concurrent* items; these are serial, so the
takeover is declared rather than merged — and it is declared here, at the plan, because three items
share the file.

| file | owned by | taken by | why |
|---|---|---|---|
| `src/driver/driver.ts` | W3 | **W12**, then **W13** | the defects are in it. W12 touches `emit()` only; W13 rewrites the lifetime. **Serial, never concurrent** — that is the whole reason this is two items and not a merge |
| `test/driver/**` | W3 | **W12**, then **W13** | a fix without its test is not a work item (section 1 rule 2) |
| `spec/task-id.md` | W1 | **W13** | `ID-R2`, `ID-R3` and the new inbound rule are all in it. **A spec change is its own change with its rationale stated** — here, ADR 0022 and 0023 |
| `AGENTS.md` | W9 | **W13**, and **W12 for §10's one sentence** | the three apologies are deleted **by the item that makes each one false**, and the gate proves the snippets still run. Deleting them is part of the fix, not follow-up. W12 takes §10's `onRegionEvent` exception as a **declared exception** rather than as `Owns`, because one sentence is not a takeover |
| `test/matrix/run.ts` | W4 | **W13** | two call sites, from the surface change. Nothing about the matrix changes |
| `examples/**` | W5, then W6 | **W14** | the exit artifact is an L6 row, and `run-flow.ts` needs a two-driver shape it does not have |

**`src/fold/**` and `src/definition/**` are not taken over and are not edited.** If either turns out
to need a change, that is a finding for the Record and its own item.

## Scope

**In**

1. **Q73** — `onRegionEvent` receives a frozen copy, like every other outbound path.
2. **Q53** — the run id moves to construction and the three many-run shapes collapse.
3. **Q72** — an inbound settlement this driver did not dispatch is not this run's.
4. **The three apologies in `AGENTS.md` are deleted**, and `spec/task-id.md` is amended with the
   rationale stated.
5. **The exit artifact**: two runs, two drivers, one scheduler, at L6.

**Out** — named rather than left implicit

- **[Q24](../questions/q24.md)** — `JP-R7`/`JP-R8`. The live *feature* question, and a different
  plan. This one fixes defects.
- **[Q71](../questions/q71.md)** — `SchedulerLike` under the DOM lib. It is a surface question, but
  it is a *widening* with a recorded argument against it, not a defect with an obvious fix. `X5`
  reports it on every gate run and fails if it worsens.
- **[Q20](../questions/q20.md)** (is a run id global) and [Q15](../questions/q15.md) (durability).
  Both are adjacent — a driver's lifetime is where durability would become a persistence boundary —
  and neither is answered by fixing these three.
- **`index.ts`'s 38 exports.** W9 named the omission; whether the other ~26 are public at all is a
  question nobody has asked and it is not this plan's.
- **Any new capability.** Like P2, this plan adds none.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W12](../work-items/w12-the-region-event-a-listener-cannot-corrupt.md) | The region event a listener cannot corrupt (Q73) | `src/driver/driver.ts`, `test/driver/**` — taken from W3 | nothing | L0-L1, then two readers |
| [W13](../work-items/w13-one-driver-one-run-fixed-at-construction.md) | One driver, one run, fixed at construction — and what makes an event ours (Q53, Q72) | as W12, plus `spec/task-id.md`, `AGENTS.md`, `test/matrix/run.ts` | W12 | L0-L5, ADR 0022-0023, then two readers |
| [W14](../work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) | Two runs, two drivers, one scheduler — at L6 | `examples/**` — inherited from W6 | W13 | L0-L6, then two readers |

**Why three and not one.** They are separated by a spec, which is section 7 rule 1's test: W12 is
`OR-R7`/ADR 0014 conformity with nothing to decide, W13 is `spec/task-id.md` and two ADRs, W14 is the
L6 harness. **W12 first, deliberately** — it is one line and a test, it deletes `AGENTS.md` §10's
exception on its own, and running it ahead of the breaking change means the small fix is not
hostage to the large one.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q53](../questions/q53.md) | the many-run surface | **W13** — closed by ADR 0022 |
| [Q72](../questions/q72.md) | two drivers, one scheduler | **W13** — closed by ADR 0023. **Its "both runs report `stopped`" detail is corrected first** |
| [Q73](../questions/q73.md) | the unfrozen region event | **W12** — closed as a conformity fix, no ADR |
| [Q20](../questions/q20.md) | is a run id global | still open, and W13 will have an opinion it is not entitled to record as an answer |

## A note on ids

**This plan reserves W12-W14 rather than W10-W12, and the reason is on the record.**
[P2's retro](p2-the-non-success-half-on-a-real-scheduler.md) proposed `scripts/check-owns.mjs`
**as W10, by name and by link**. Taking W10 here would make that sentence false, which is the defect
class this repository names most often. **W10 stays held for `check-owns.mjs`; W11 is P3's unused
reserve and is skipped, never reissued** — the same disposition P2's retro gave W7-W8.
`ADR 0016-0021` (P2's and P3's unused blocks) are skipped likewise, so this plan starts at **0022**.
## Record

**Status: complete.** Three work items, six reader-passes, retro run. **`doc/workflow.md` is v0.6.**

**Exit artifact.** Ladder L6's fourteenth row: **two runs, two `Driver`s, one scheduler**, both
completing on real workers, with the corruption stated as a thing that cannot happen. L6 is
**240 assertions in Node and Deno**, was 219. The unit suite is **326 in five runtimes**, was 288.

**What the plan answered.** *A `Driver`'s lifetime is a run's lifetime, fixed at construction; a
settlement is this run's if and only if this driver dispatched its task id; and everything a driver
hands out is a frozen copy.* [ADR 0022](../decisions/0022-a-driver-takes-its-run-at-construction.md),
[ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
— **which carries a Correction** — and W12's one-line conformity fix. [Q53](../questions/q53.md),
[Q72](../questions/q72.md), [Q73](../questions/q73.md) and [Q84](../questions/q84.md) are closed.
`AGENTS.md`'s three apologies are down to one: §12's cast for [Q71](../questions/q71.md), which was
out of scope by declaration.

**The load-bearing fact changed the design, for the fifth consecutive plan.** [Q72](../questions/q72.md)
proposed filtering `Driver.onEvent` by run id. Six inbound task ids were measured against the shipped
driver before a line was written: **a run-id filter closes one of four holes.** Three of the four have
nothing to do with run ids, and `dispatched.has(taskId)` closes all four with state the driver already
kept. The rejected design is now a red gate rather than an argument in an ADR.

---

## Retro

*`doc/workflow.md` section 6 pass 3. P4 is the first plan to change a **published surface**, and the
first whose readers found a shipped ADR rule to be false.* **Three changes adopted, one refusal, and
`doc/workflow.md` is v0.6.**

### 1. Rule 8's first three real outings — the rule works and the way authors instantiate it does not

P3's retro left this as its second question. **Rule 8 was applied in all three items, every
provocation it produced was real, and in all three the author's set was incomplete *in the same
direction*.**

| | the author's set | the readers' survivors | after |
|---|---|---|---|
| **W12** | 5 ways to **delete** the freeze | freeze only `branch.opened`; only `opened`+`arrived`; only when the `regionId` matches the fixture's | 12 probes, 11 red |
| **W13** | 7 ways to **delete** the guard | exempt one **terminal state** at a time — three survivors on a guard the fixtures only drove in one state | 18 probes, 18 red |
| **W14** | 3 ways to **delete** the guard | keep the guard and **substitute the source of truth** the assertions read | 8 probes, all red |

**Every author probe removed the fix; every survivor narrowed it.** That is not carelessness — it is
what writing a provocation *from the fix* produces, because the fix's own shape is what comes to mind.
**Adopted:** rule 8 now says to enumerate the **rule's clauses** and break each — every terminal
state, every event variant, every branch of a two-tier test — rather than the ways the fix could be
undone.

**Two things rule 8 did NOT need.** It does not need rule 7 (a)'s checked-in requirement: W13's and
W14's readers reproduced every provocation exactly from the Record, to the failure count, because the
Record stated each as a precise edit. That is the cheaper requirement and it is already met. And it
gained a use nobody named — **W14's own provocation caught a false *claim***, not a weak assertion:
the row's comment said it covered `ID-R4` when it covered tier 1 of it.

### 2. `check-owns.mjs` — not built, and the retro that proposed it had the cause wrong

P2's retro read three consecutive `Owns` miscounts (W5, W6, W9) as a discipline problem and proposed
a script. **Three plans of asking later it is retired instead, because the cause was elsewhere.**

Every work item carries a `Reserves:` line obliging it to write rows to `doc/open-questions.md`.
Section 1 rule 5 listed **four** record-step files and did not name the register — so *every item back
to W4* edited it undeclared, correctly and invisibly. W12 raised that; W13 and W14 declared it as an
exception. **The result: W12 two exceptions, W13 five, W14 one, and all three audited correct — 19 of
19 and 7 of 7 by their conformity readers, after three in a row that were not.**

**Adopted:** the list gains `doc/open-questions.md`. **`check-owns.mjs` is retired as a proposal**, and
the reasoning is worth keeping: *a rule that is followed and fails three times may be a wrong rule
rather than a weak one, and the cheaper fix is to check whether it says the right thing before
building a machine to enforce what it says.*

### 3. The concurrent-reader hazard — three plans of doing it wrong, caught on the third

**Adopted, from one occurrence with an argument that needs no second.** Both readers were spawned
against **one working tree**, and the adequacy reader mutates in place. On W14 the conformity reader
reported that its early measurements had picked up the other's instrumentation — a stray debug line,
and a run reporting `declared: 219` against a file reading 233 — and that it had re-taken every number
from an isolated copy. Its report was sound. The adequacy reader's cleanup then deleted
`node_modules`.

**Both readers had isolated themselves unprompted; the document had never asked.** Section 6's
adequacy row now does. Three reader pairs ran this way before anyone noticed, which is the same shape
as finding 2: *a mechanism that works by luck reads as a mechanism that works.*

### 4. Did deleting `AGENTS.md`'s apologies work? — yes, and it cost no replacement words

P3's retro asked whether removing an absorbed defect would need different words or none. **None.**
§2's *"four things bite everyone"* became three, §9 lost its Q53/Q72 parenthetical, §10's bullet lost
half of itself, and **the reference came out shorter with the gate green**.

**But the honest version is better than "shorter".** §9 *gained* two sentences — the preconditions
W13's readers found: run ids must be unique across the drivers on one scheduler, and that scheduler
must carry only flow tasks. **A precondition is a property of the design; an apology is a property of
a defect.** So absorption's price is roughly *one sentence per defect, removable when the defect is* —
and what replaces it may be longer and is not the same kind of thing.

### 5. Confirmed, no change

- **The verification ladder.** L2 is again where the value was proved: W13's whole mechanism was
  settled against a 15-line fake, and W14's L6 row then confirmed the fake was not lying. The one
  thing L6 adds that L2 could not is that confirmation, which is exactly what section 4 claims for it.
- **Two readers.** Seven measurements now — W4 1/13, W5 3/~35, W6 3/~25, W9 3/~30, W12 3/18, W13 4/24,
  W14 4/~26. Section 6's wording is **corrected, not changed in substance**: the number to carry is
  the **absolute** one — 1-4 shared findings whatever the item's size. The fraction has read 8% to
  17% across items from a one-line fix to the largest surface change here, and W12's hypothesis that
  it rises as items shrink died on W13.
- **The `Outputs` table.** W13's *"a replacement direct test for `ID-R1`"* row is the clearest use yet
  of the load-bearing column: the item was declared **knowing it owed** that output, because
  `spec/task-id.md` had predicted the cost in writing.
- **Rule 7 (b).** Fired in the wild for the first time, on a real API change. Not a change — evidence.
- **Settling the load-bearing fact before declaring.** Sixth consecutive occurrence. P2's condition
  for making it a rule — an item skips it and pays — still has not occurred. No rule.

### 6. Refused, for the fourth time: `doc/` is checked by nothing

**And this is its worst occurrence, by me.** P4 rewrote the register's census line four times and got
it wrong three: stale at first, then **self-contradictory in the same sentence** (stating 55/39 while
the arithmetic beside it proved 54/38), then off by one. Each failure came from the same move —
*chaining a derivation* rather than *stating a predicate*. The line now states one — a question is
resolved when its status cell says so — and is countable in one pass, which is how the fourth version
was verified.

Beyond it: `README.md` said *"eight ADRs"* where there were ten; `CLAUDE.md` said *"thirteen rows, 219
assertions"* two lines below a line the same commit had corrected to 233; `examples/README.md` and
`AGENTS.md:583` each carried a number or a claim the surrounding change had invalidated. **Every one
was found by a reader, none by a check.**

**Still not a rule.** P1, P2 and P3 each refused it and gave the reason: both candidate mechanisms —
a doc-freshness linter, and a rule saying *"update the docs"* — are worse than the problem. What P4
adds is a *technique* rather than a rule: **a count in prose should state the predicate that produces
it**, because a predicate can be re-run and a derivation chain can only be re-read. It is applied to
the register and to nothing else.

### 7. What P4 leaves for P5's retro

1. **Does rule 8's "write to the rule" form change the numbers?** The prediction is fewer reader
   survivors in the provocation family. If a fifth item's readers still find the author's set narrow
   in the same direction, the amendment did not work and the answer is not another sentence.
2. **Does rule 7 (c) ever fire?** Unexercised by P4, which added no new check. Third plan of carrying
   it if P5 adds none either.
3. **Does the `Owns` list stay correct now the register is named?** If an item miscounts again with
   the list right, `check-owns.mjs` comes back and finding 2 was wrong.
4. **[Q86](../questions/q86.md) and [Q87](../questions/q87.md) are the two preconditions this plan
   documented rather than enforced**, and both are real defects of the topology P4 blessed. A plan
   that blesses a topology and ships two of its preconditions as prose is doing what P3's retro
   criticised — **and P4 did it knowingly, on the last day of the plan.** Whether that was right is
   P5's to judge.
