# ADR 0027 — An inbound task id that does not parse was minted by no driver: report it, do not stop the run

**Date:** 2026-09-02
**Status:** accepted — **supersedes [ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
rule 2 and retires the first of that ADR's two preconditions**
**Raised by:** [Q86](../open-questions.md), decided by
[W18](../work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md) under
[P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md)

## Context

**[ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) blessed a
topology and left it carrying a precondition nobody can audit.** Rule 2 kept an unparseable inbound
task id a run-terminating refusal, on the ground that *"does not parse" is not "not ours", it is a
defect*. Its own *Correction* then had to state the consequence: **a plain non-flow task settling on
a shared scheduler stops every driver on it.** `AGENTS.md` section 9 recommends that topology.

**Everything below was measured at `783c1bb` against a green gate, and three of P6's own stated facts
did not survive it.** They are recorded in W18's declaration and the plan carries the correction in
place; the corrected version is what this decision is taken from.

### `InvalidTaskId` is raised at seven sites and this decision is about exactly one

*Line numbers in this table are as measured at `783c1bb`, the commit this decision was taken
against; the change itself moves them. The claims are about which call sites exist and what guards
them, and those are checked in `test/driver/` rather than here.*

| where | raised | reachable with an unparseable id? |
|---|---|---|
| `buildTaskId` — `src/driver/ids.ts:52,53` | **outbound**, on ids we mint | n/a. `FD-V16` validates every node id at instantiation and `attempt` is a literal `0` |
| `parseTaskId` — `:62,65,66,67,68` | the grammar itself, five refusals | — |
| `Driver.resolve()` — `driver.ts:380` | at the **caller's** id | **No.** `isSuspended` is line **379**, one line above, and requires the log to already hold that exact id in `user_action`. The log holds only ids the driver appended. **Measured: `resolve('not-a-task-id', …)` returns `false`** — a rejected command under `RS-R1`, nothing appended, run unaffected |
| `src/fold/run-state.ts:154` and `:179` | inside `fold()`, **a pure function** | Not today: [ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) makes the driver the producer of the fold's sequence and the driver appends only ids it minted |
| **`onEventOrThrow` — `driver.ts:476`** | where the **scheduler** supplies the id, **before** `ID-R4`'s tier-1 run-id comparison | **Yes. This one, and only this one.** |

**Two things this table changes about how the question reads.** The register and P6's prose both
described `resolve()` as a second inbound producer that *"must keep stopping the run"* — it does not
stop the run at all, so the *against* case's *"but a corrupted id for a task that IS ours"* has **no
second site to be true at**; it is true at the listener or nowhere. And the fold has **two call sites
this decision must rule on**, which no document named before W18 tried to act on the plan.

### What today's behaviour is, measured on both edges

| | |
|---|---|
| `driver.resolve('not-a-task-id', 'done', {actor:'x'})` | **returns `false`.** Nothing appended, nothing reported, run unaffected |
| the same id delivered at the listener | **`onRunFailure({kind:'InvalidTaskId', runId:'r1'})`**, `hasFailed()` true, `stopped` appended, and every later settlement — including legitimate ones — routes nothing |
| two drivers on one scheduler, one foreign task | **both stop**, each correctly under its own run id |

**Three assertions pinned it**, and reversing it moved exactly those three and no others:
`test/driver/lifetime.test.ts:120-121`, `lifetime.test.ts:360`, `test/driver/fold-inputs.test.ts:215-216`.
That is what made this a decision to take rather than a bug to find.

### Who actually produces an unparseable id at that listener

**The against-case's central clause is *"a corrupted id for a task that IS ours becomes a silent
drop"*, and the producers are what decide whether it has a referent.**

| producer | could it be ours? | would any driver report it? | today |
|---|---|---|---|
| a plain non-flow task on a shared scheduler (`nightly-cleanup`) | **never** — no driver minted it | **no.** It is nobody's run | **every driver on that scheduler stops** |
| a worker calling `context.spawnTask()` | **never.** `spawnConfig.id` is caller-supplied, and the scheduler's own reference spells it `` `${payload.id}-child` `` | no | **the run stops** — ADR 0023's *Correction* 3, which found this listed among that ADR's *benefits* |
| a `detail` with no `id`, or an `id` that is not a string — a scheduler version skew | **possibly ours** | no | the run stops |
| **an id in our own four-segment shape whose segments no longer parse** (`r1:ingest:x:0`) — the same skew, one layer in | **possibly ours** | no | the run stops |

**Row 4 was added by [W19](../work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) and it
changes no rule.** This table originally held three rows, and its third named only a **missing or
non-string** `id`. That is one instance of the class the argument below actually turns on — *"a
library that assumes `detail.id` is forever what it dispatched"* — and it is not the instance
`test/driver/lifetime.test.ts`'s `SHAPES` suite calls *"a corrupted id for a task that IS ours"*,
which is the sentence the whole against-case is about. **W19 built that shape on real workers**, at
ladder L6, and its conformity reader found that the table could not name what the row demonstrates.
Corrected here rather than left for a reader to reconcile, under `doc/workflow.md` v0.7 change 3 —
which put `doc/decisions/**` in the record step precisely so a demonstration could correct the
decision it demonstrates, after that gap blocked W17 from correcting ADR 0015. **The decision, its
seven rules and every alternative below are unchanged.**

**The first two are the common case on the blessed topology, and stopping is wrong for them**: a
correct run is killed by something that has nothing to do with it, and the damage scales with the
number of drivers sharing the scheduler — the more the topology is used, the worse it is. **The
third and fourth are rare and stopping is right for them.** The string carries no information that separates them, so no
answer can be right for both by discriminating. **What an answer can do is be wrong in neither
direction**, and that is the whole of the decision below.

Those two rows are not hypothetical, which is why they are not dismissed: `task.progress`'s detail changed
shape at 0.3.0 — the id became `id` rather than `taskId` — and a 0.2.1 consumer reading the old field
silently got `undefined`. There is **no changelog** (`CLAUDE.md`). A library that assumes `detail.id`
is forever what it dispatched is assuming something this scheduler has already broken once, on a
neighbouring event.

## Decision

1. **A settlement whose task id does not parse was minted by no driver, is not this run's, and does
   not stop the run.** `buildTaskId` emits only four-segment ids in the `ID-R2`/`FD-V16` charsets, so
   an id `parseTaskId` refuses cannot have come from any driver. This is
   **[`ID-R5`](../../spec/task-id.md)**, and it supersedes ADR 0023 rule 2.
2. **It is decided at tier 0 — before `ID-R4`'s two tiers**, and it must be: both of those compare a
   run id, and an unparseable id has none to compare. Nothing is appended, nothing is dispatched,
   and the run keeps routing.
3. **It is REPORTED, on its own channel: `DriverOptions.onUnmintedTask`, carrying `UnmintedTask`.**
   The report is this driver's `runId` (never parsed — there is nothing to parse it out of), the
   scheduler event's name, `detail.id` **uncoerced and typed `unknown`**, and a `reason` that
   describes **what arrived**: `parseTaskId`'s own message when there was a string to describe, and an
   explicit *"the event detail carried no string `id`"* when there was not. *(The obvious form —
   always `parseTaskId`'s message — reports a sentence about the `''` we substituted, in exactly the
   case a consumer is debugging a version skew. W18's conformity reader.)* Optional; a driver that
   registers nothing still routes correctly.
4. **`ID-R4` tier 1's silence is unchanged, and the asymmetry is deliberate.** Another run's
   settlement is dropped without a word because **the driver that owns that run will report it**
   (ADR 0023 rule 3, untouched — with two drivers on one scheduler it is the normal case and a
   refusal on the normal case is noise). An unparseable id is owned by **no** run, so silence there
   means nobody reports it, ever. **A parseable foreign id does not reach `onUnmintedTask`**, and
   there is an assertion for that rather than a sentence.
5. **The report is a callback and explicitly NOT a new `FoldInput` kind.** `fold()` — the pure
   function this repository's whole invariant hangs off — would throw `InvalidTaskId` on an input
   carrying the offending string. **The mechanism is worth naming precisely, because the obvious
   statement of it is the weaker half** (W18's conformity reader): `run-state.ts:154` and `:179` sit
   inside `if (input.kind === 'dispatched')` and the record branch, so a *new* kind reaches neither.
   What a new kind would actually hit is `step()`'s **unguarded fallthrough** — five `if`s and then
   `const r = input.record; parseTaskId(r.taskId)` with no default. Either way the answer is the same
   and this is the one way the third option could have been implemented badly, ruled out in writing.
6. **This changes nothing at the four sites it does not name**, and each for its own reason:
   - **`buildTaskId`'s two refusals** stay refusals. They fire on ids **we** are about to mint, which
     is a defect in our own scheme and attributable to us; nothing about a foreign scheduler task
     bears on them.
   - **`Driver.resolve()`'s site** stays exactly as it is, and the reason is that it is
     **unreachable**, not that it was weighed and kept: `isSuspended` refuses one line above it. Had
     it been reachable this ADR would still have kept it — there the *caller* invented the id, so
     `RS-R1`'s rejected-command answer is right for the same reason tier 0's report is right here.
   - **`src/fold/run-state.ts`'s two calls** are unchanged and **stay throwing**. The fold is a pure
     function over a sequence a driver produced (ADR 0014); if an unparseable id ever reaches it,
     that is a broken invariant and not a foreign task, and it should be loud. Rule 5 is what keeps
     that true.
7. **`InvalidTaskId` can no longer reach `onRunFailure`**, so `RunFailure.kind` stops listing it and
   `spec/outcome-record.md` section 6 says which classes reach `OR-R10` rather than leaving a fourth
   to arrive by accident. **`OR-R10` itself is unchanged.**

## Consequences

**Easier, and it is the reason this plan exists.** A scheduler may now carry work this library did
not mint — a nightly cleanup, another library, a worker's own `spawnTask` children — with drivers
subscribed to it, and a settlement from any of them is a line in a log rather than the end of every
run on that scheduler. `AGENTS.md` section 9 can recommend the shared-scheduler topology without an
unstated precondition attached, and `spec/task-id.md` `ID-R4` drops the first of its two.

**Harder: a hang is now possible that was not, and rule 3 is the whole mitigation.** If a future
scheduler stops reporting `detail.id` as we dispatched it, every settlement becomes unparseable, every
run silently stops advancing, and **only a registered `onUnmintedTask` says why.** Under ADR 0023
rule 2 that failure was instant and loud. This is a real trade and the honest form of it is: the
common case was catastrophic and silent-ish (a run stopped for a reason its author could not act on),
the rare case is now silent unless observed. **A consumer running on a scheduler they do not fully
control should register the callback**, and the reference says so.

**A cost that is not a cost.** Tier 0 sits **above** `normalizeEvent`, so a `user_action` task's
event pair (ADR 0007 rule 2) reaches it twice and reports twice for one task. That is the same shape
ADR 0023's *Correction* 2 already recorded for `ID-R4`, for the same reason, and the run is unaffected
either way — the report is per **event**, and the tests say so rather than leaving a reader to
discover it.

**A callback that throws stops the run, which is the one way a consumer can undo this decision.**
`onUnmintedTask` is invoked inside `onEventOrThrow`, so a throw from it is caught at the listener
boundary and reaches `failRun` — a foreign task then stops the run after all, under the consumer's own
error class. It is **documented rather than guarded**, for two reasons: every other callback on this
surface behaves the same way, and swallowing a consumer's throw is a defect in its own right. Worth
stating because this is the one callback whose entire purpose is to fire on events that are **not**
this run's, so it will fire on a busy shared scheduler far more often than the others.

**The public surface grows by exactly one optional callback and one interface**, and there is no new
exported function. Tier 0 is a `try`/`catch` around the existing `parseTaskId` with a narrow
`instanceof InvalidTaskId` rethrow, rather than a total `tryParseTaskId`: a second entry point would
put the id grammar in two places, which is the drift `spec/task-id.md` section 2 exists to prevent,
and the `catch` hands the consumer `parseTaskId`'s own message for free.

**One sentence of that reasoning was wrong and W18's own provocation caught it**, so it is stated
corrected rather than left standing. The narrow `instanceof InvalidTaskId` rethrow was justified as
*"what stops this swallowing an unrelated defect"*. **It cannot fire, and no test can kill it**: the
`try` wraps exactly one call and that call raises exactly one class, so widening it to a bare `catch`
changes nothing reachable. Removing it is caught only by an unused-import typecheck error, which is
an accident. It is kept as a **forward** guard — the block is one edit away from containing something
else, and `normalizeEvent` (which raises `OR-R6`) sits deliberately below it and outside — and the
code says so in place. *A defensive clause that cannot fail is not a defect; describing it as though
it could is, and that is `doc/workflow.md` section 5 rule 3 applied to code rather than to an
assertion.*

**A consumer can now audit the precondition this ADR retired**, which they previously could not:
`InvalidTaskId` and `parseTaskId` are both exported from the package root, so *"is this task one a
driver minted"* is a `try`/`catch` a caller can write. That is what makes `AGENTS.md`'s new
`InvalidTaskId` row load-bearing rather than a completeness entry.

**A test lost its discriminating vehicle and it is recorded rather than quietly swapped.**
`lifetime.test.ts`'s *"a `RunFailure` names THIS driver's run, never the inbound id's"* used
`'not-a-task-id'` — **the only inbound id with no run id in it**, which is what made *"from the
constructor"* and *"parsed from the event"* distinguishable. Every refusal that can still reach
`failRun` from the listener sits *below* `ID-R4` tier 1, so its id's run segment is now necessarily
this driver's. **The discrimination moved with the vehicle**, to `ID-R5`'s own test; the old case
keeps the weaker property and says in place that it is now the weaker half. This is `spec/task-id.md`
section 3's *"a rule may take another rule's test away; it may not take it away silently"*, one rule
out, and it is the second time that passage has been needed.

**What a future reader will try.** Widening `onUnmintedTask` to cover `ID-R4` tier 1 as well, so
*"every settlement I dropped"* is one channel. **Resist it**: rule 4's asymmetry is an argument about
who else will report the thing, not a gap in coverage, and merging the two would make a driver noisy
on precisely the case ADR 0023 chose silence for. If it ever lands, [Q20](../open-questions.md) —
whether a run id is global at all — is the question that decides it, exactly as ADR 0023 said.

## Alternatives rejected

| | why not |
|---|---|
| **Stop the run, and the precondition stands** (no change) — *the option this item was explicitly entitled to reach, and the cheapest* | The precondition is **not auditable by the person who would have to honour it**. Two of the three producers are outside the flow author's control: another team's task on a shared scheduler, and a **worker's own `context.spawnTask()`**, whose id the scheduler lets the caller invent. And it fails in proportion to how much the blessed topology is used — one foreign settlement, every driver on that scheduler. It keeps `AGENTS.md` §9 recommending a topology whose precondition it cannot state as anything better than *"nothing else may use this scheduler"*, which is a recommendation to not share the thing the recommendation is about |
| **Ignore it, silently** — treat it as `ID-R4` tier 0 and drop it | Right about the common case and **wrong about the one that can be ours.** A scheduler that stopped reporting `detail.id` as we dispatched it would make every run hang with nothing said and no way to learn why — and the version-skew premise is not invented for this table: `task.progress`'s detail changed shape at 0.3.0 with no changelog. Silence is affordable at tier 1 because another driver is watching; at tier 0 nobody is |
| **Report it through `onRunFailure` with a new `kind`** | **The run has not failed.** `RunFailure`'s whole contract is *"the driver has stopped routing it"* and a caller keys on that; a `kind` that arrives without the stop makes the type lie to every existing consumer |
| **Report it as a new `FoldInput` kind**, so it lands in the sequence and `RunState` can carry it | Puts an unparseable string into the one place that parses every id it is given — `fold()` would throw `InvalidTaskId` at `run-state.ts:154`. **Decision rule 5.** It is also wrong in principle: the fold's sequence is *this run's* record, and this event is definitionally not this run's |
| **A total `tryParseTaskId`, exported, instead of `try`/`catch`** | A second entry point into the id grammar, which `spec/task-id.md` section 2 is about, and it throws away `parseTaskId`'s message — the report's most useful field. The `catch` costs one exception per foreign settlement, which is the right side of that trade |
| **Keep stopping, but only for ids that "look like" ours** — a prefix check before the full parse | There is nothing to check against. A run id is caller-supplied (`ID-R2`, [Q34](../open-questions.md)) and the driver knows only its own, so *"looks like a flow id"* and *"parses"* are the same predicate with a worse spelling |
