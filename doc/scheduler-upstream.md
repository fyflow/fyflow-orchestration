# Wants from fyflow-scheduler

The register of changes we would like in `fyflow-scheduler`, kept here rather than in a workaround
comment. One row per item, `S1`, `S2`, ... - never reused, never renumbered.

**Every item must state what we do without it.** An item with no workaround is not a want, it is a
blocker, and it belongs in a plan instead.

**Nothing here is raised yet.** Pinned to `fyflow-scheduler` 0.2.1; line references are against
that version and should be re-checked before implementing.

`fyflow-react-components` keeps [its own register](https://github.com/fyflow/fyflow-react-components)
with an independent `S` sequence. **Two items overlap and must be raised jointly, not twice** - see
the last section.

---

## Index

| S | Want | Blocks us? | Status |
|---|---|---|---|
| [S1](#s1--spawntaskconfigparents-is-declared-and-never-read) | Remove or implement `SpawnTaskConfig.parents` | no - but it is actively misleading | not raised |
| [S2](#s2--cancel-a-queued-task) | Cancel a queued task | no - it caps what "cancel" can mean | not raised |
| [S3](#s3--a-join-or-barrier-primitive) | A join/barrier primitive | **declined by us** | will not raise |
| [S4](#s4--scheduler-side-timestamps-on-every-event) | Timestamps on every event | no | ✅ **being implemented** |
| [S5](#s5--an-event-when-maxcompletedtasks-evicts-a-task) | An event when eviction happens | no | **deferred upstream** |
| [S6](#s6--pause-and-resume) | Pause and resume | no - not in the first set | not raised |
| [S7](#s7--exit-c-drops-a-blocked-task-silently) | Fix the blocked-queue task drop | no - but it **confounds P1** | observability half is planned |
| [S8](#s8--freeze-or-copy-event-details) | Freeze or copy event details | no | **declined upstream** |

---

## Reading `RESOURCE_EVENTS_PLAN.md` — the S-id map

`../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` (2026-08-30, draft) is a counter-proposal to
**`fyflow-react-components`' upstream spec, and it uses that repo's S numbering throughout.** Ours is
a different sequence. Reading one as the other is an easy and expensive mistake, so:

| Their id | What | Our id |
|---|---|---|
| **S1** eviction event | out of scope in that plan | **our S5** |
| **S2** timestamps | §5, five call sites, **shipping in stage 1** | **our S4** |
| **S5** snapshot accessor | declined by both sides | *not ours* |
| **S6** resource acquire/release/blocked events | the bulk of the plan | *not in our register* |
| **S7** admission queue accessor | §6 | *not ours* |
| **S8** details are live references | §11, **fixed as documentation only** | **our S8** |

**What the plan means for us, in one line each:**

1. **Our S4 is being satisfied** in stage 1 — timestamps on `scheduler.completed`, `task.completed`,
   `task.failed`, `task.user_action`, `task.running`.
2. **Our S5 is not** — §10 puts it out of scope, *"cheap, and worth revisiting"*.
3. **Their S8 landed on us as a constraint, not a gift.** It is documented rather than fixed, which
   is what forced
   [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md).
4. **The resource events are mostly not ours.** They make a *scheduler-level* stall visible. A
   stuck **join** is a flow-level condition with nothing queued and nothing blocked, so no
   `resource.blocked` fires for it — [Q7](open-questions.md) stays entirely ours. Do not let
   acceptance criterion 3 in that plan read as covering it.
5. **Two patterns there are worth stealing if [Q21](open-questions.md) lands.** §6.2 — *one
   emitter only*, because a consumer listening to two `EventTarget`s double-counts — and §3.5 —
   *an unrecognised gauge kind renders as `level`*, so a vocabulary can grow without breaking
   deployed viewers.

---

## S1 - `SpawnTaskConfig.parents` is declared and never read

**What.** `core/workerInterface.ts:50` declares `parents?: string[]` on `SpawnTaskConfig`. Nothing
in the repository reads it. The spawn path at `core/FyflowScheduler.ts:1015-1020` builds the task
from `id`, `workerType`, `payload`, `optional`, `retryPolicy` and `workerGroups`, and **drops
`parents` silently**.

**Why it matters more than a dead field usually would.** The library's headline refusal is that it
has no dependency graph (`AGENTS.md` section 1). This field contradicts that refusal *in the type
system*, where people look first. `spawnTask({ ..., parents: ['a'] })` typechecks cleanly, runs, and
produces no dependency. It is very likely part of why
`../fyflow-scheduler/FLOW_PLANNING.md` was written against `parents:` throughout.

**Ask.** Delete the field. If it is a placeholder for intended work, a doc comment saying so costs
one line and removes the trap.

**What we do without it.** Nothing - we never pass it. The cost is borne by the next reader, not by
us. Cheapest item in this register and the one with the best ratio.

## S2 - Cancel a queued task

**What.** `AGENTS.md` section 1 lists *"Cancelling a queued task"* under things that do not exist.

**Why we want it.** Two places, and the second is the real one:

1. **Run cancellation.** We can stop routing, but tasks already handed to `addTask` will run.
2. **Pruning a fan-out.** When a decision routes a branch away from its join (Q4), or a join is
   satisfied early under a partial-results policy (Q5), the abandoned branch's queued tasks are
   pure waste. At the 1000s-10000s scale in `FLOW_PLANNING.md` that waste is the difference between
   a fan-out being cheap and being unaffordable.

**Ask.** `scheduler.cancelTask(id)` that removes a task from the ready queue and any blocked queue,
settling it in a distinct terminal state. Cancelling a *running* task is a much larger ask (no
worker interrupt exists) and is **not** part of this - queued-only is the useful 80%.

**What we do without it.** Cancellation is honest but partial: we stop dispatching new nodes, mark
the run cancelled, and **let in-flight and queued work finish while ignoring its results**. Q18
exists to make sure we document that rather than claim more.

## S3 - A join or barrier primitive

**Declined - by us, before asking.** Recorded so it is not re-proposed.

The obvious ask is "let the scheduler wait for N tasks". We should not make it:

1. **A join needs flow context the scheduler cannot have.** Which branch was routed away (Q4), what
   an `optional` null means at this join, whether a nested fan-out counts (Q6) - all of it lives in
   the flow definition, which is ours.
2. **It would duplicate our own logic in a worse place.** Our join is a fold over an outcome log,
   testable with no scheduler at all (ladder L2). A scheduler-side join would need its own state,
   its own persistence story, and its own tests.
3. **It contradicts the library's stated shape.** *"Tasks are independent"* is the first thing
   `AGENTS.md` says. A barrier makes them not independent, and every downstream consumer inherits
   that.

`onCompleteDescendants()` is the closest existing thing and demonstrates the problem: it is
transitive over lineage, but a failing descendant does not reject, so it cannot express any join
policy we would want.

**The right split:** the scheduler runs independent tasks; we own ordering. That is exactly what
[S2](#s2--cancel-a-queued-task) supports - a small, general primitive rather than a large,
opinionated one.

## S4 - Scheduler-side timestamps on every event

**What.** Event payloads mostly carry no timestamp; the worker lifecycle events do
(`{ workerId, workerType, timestamp }`) but the `task.*` events do not.

**Why we want it.** Our fold stamps arrival time, which is when the driver's listener ran, not when
the thing happened. Under load those diverge, and every duration we report inherits the error.

**What we do without it.** Stamp on arrival in the driver, and keep any library-supplied timestamp
in **its own field** from the first version so this landing later is additive rather than breaking.

**Status: being implemented.** `RESOURCE_EVENTS_PLAN.md` §5 names the five call sites —
`scheduler.completed` (320), `task.completed` (727), `task.failed` (775), `task.user_action` (777),
`task.running` (974) — uses `Date.now()`, and ships in stage 1 alongside the resource events. **No
action needed from us**; the "own field" rule is already
[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 4,
which anticipated exactly this.

That plan also warns, correctly, that **`startTime` must not stand in for it** — for the four
`task.*` events the detail *is* the task, so those fields read as whatever the object holds when the
consumer looks. That is their S8, and it is our S8 below.

**Shared.** Same want as `fyflow-react-components`' **S2**. Raised there; nothing further from us.

## S5 - An event when `maxCompletedTasks` evicts a task

**What.** Terminal tasks are evicted from `scheduler.tasks` with no event.

**Why we want it.** Q19 - if we ever read task state from the scheduler rather than from our own
log, eviction makes a task vanish with no signal.

**What we do without it.** Do not depend on `scheduler.tasks` as history. Our fold retains what it
needs from events, which is the same answer `fyflow-react-components` reached
(their ADR 0004: *the collector keeps what the scheduler drops*). This is mostly a want on behalf of
consumers who are not us.

**Status: deferred upstream.** `RESOURCE_EVENTS_PLAN.md` §10 puts it out of scope for this change —
*"cheap, and worth revisiting"*. Our workaround costs us nothing, so there is no reason to push.

**Shared.** Same want as `fyflow-react-components`' **S1**.

## S6 - Pause and resume

**What.** Suspend dispatch, let running tasks finish, resume later.

**Why we want it.** A paused flow is a natural operator action, and it is the honest response to a
run stuck at `user_action` (Q17) - stop feeding the pool while a human decides.

**Groundwork already exists upstream.** `../fyflow-scheduler/PAUSE_RESUME_ANALYSIS.md` rates it *low
to medium* and sketches the state machine, so this is a "finish the analysis" ask rather than a new
design.

**What we do without it.** Pause at our layer: stop dispatching new nodes and hold routing
decisions. In-flight tasks and anything already queued still run, which is the same partial honesty
as [S2](#s2--cancel-a-queued-task) and has the same fix.

## S7 - exit (c) drops a blocked task silently

**What.** `core/FyflowScheduler.ts:848` — `if (!pool) continue;` — shifts a task out of a blocked
queue and drops it when its pool no longer exists. It is never requeued and no event fires.
`RESOURCE_EVENTS_PLAN.md` §4.4 calls it *"a pre-existing bug"*; §8 asks whether to fix it or leave
it.

**Why we care more than a viewer does.** A dropped task produces **no outcome event ever**, so a run
waiting on that node waits forever. **That is the same observable signature as a stuck join** —
nothing queued, nothing running, no error — which is precisely the condition
[P1](plans/p1-what-satisfies-a-join.md) exists to study. A confounder that mimics the experiment's
result is worth more to us than to anyone else reading that plan ([Q32](open-questions.md)).

**Ask.** Fix it — requeue, or fail the task loudly. The planned `resource.unblocked` with
`reason: 'orphaned'` is the **observability half** and is genuinely useful, but §4.4 says plainly
that emitting *"makes it observable rather than fixing it"*.

**What we do without it.** Two things, and both are worth doing regardless: consume the `orphaned`
reason once it exists, and have W5 assert that **every dispatched node eventually produces an outcome
record** — so a P1 hang is attributable rather than ambiguous.

## S8 - freeze or copy event details

**Declined upstream, before we asked.** Recorded so the register shows this was considered and
answered rather than missed.

**What.** For `task.running`, `task.completed`, `task.failed` and `task.user_action` the event detail
**is** the live `FyflowTask` (`core/FyflowScheduler.ts:727, 775, 777, 974`); for
`scheduler.completed` it is `this.stats`, mutated in place (line 320). Retaining `e.detail` yields a
reference that reads as whatever the object holds later.

**Why upstream is right to decline.** `RESOURCE_EVENTS_PLAN.md` §10 — defensive copying on a hot
path is the wrong trade for a zero-dependency library — and §11 fixes it as a sentence in
`AGENTS.md` instead. Listeners run synchronously, so *reading* at that moment is always correct;
only *storing* is not.

**What we do without it.**
[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md): the
driver copies the declared fields at the listener boundary and nothing downstream ever holds a
library object. **This is the one item in this register that changed our own architecture** instead
of being worked around.

---

## Raise order, and the joint items

Revised 2026-08-30 after `RESOURCE_EVENTS_PLAN.md`. **Three of the six original items are now
settled without us raising anything** — S4 is being implemented, S5 is deferred with our workaround
intact, and S8 is declined with the consequence absorbed into ADR 0007.

1. **S1 first, on its own.** Still the best ratio in the register: a one-line deletion that removes
   the trap which produced a whole misdirected planning document. It is explicitly *not* in the
   resource-events change, so it will not ride along.
2. **S7 next, and now rather than later.** It is the one item with a live cost to us — it confounds
   P1 — and the moment to raise it is **while §8 is still asking the question**, not after that plan
   ships with `orphaned` and the fix is considered handled.
3. **S2 when a fan-out is real.** Much stronger with a measured number for wasted branch execution.
   Do not raise it on principle.
4. **S6 last.** Nothing in the first set needs it.
5. **S3 and S8 are never raised.** Both are here to stay declined — S3 by us, S8 by upstream.

**S4 and S5 no longer need joint handling**; `fyflow-react-components` already carried them and the
answers came back. What remains genuinely shared is the *pattern*: raise once, from whichever repo
has the stronger case.
