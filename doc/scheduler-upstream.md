# Wants from fyflow-scheduler

The register of changes we would like in `fyflow-scheduler`, kept here rather than in a workaround
comment. One row per item, `S1`, `S2`, ... - never reused, never renumbered.

**Every item must state what we do without it.** An item with no workaround is not a want, it is a
blocker, and it belongs in a plan instead.

**One item here has been raised by us — S9, and it was fixed the same day.** Pinned to one exact
`fyflow-scheduler` version — `package.json` names it and `npm run state` prints it. **This register
never says which version is pinned NOW**; every version number in it is a RELEASE — what upstream
shipped, and when this repository adopted it — and stays as written when the pin moves (W157). The pin
history: 0.3.0 from 2026-08-30, 0.5.1 from 2026-09-07, 0.5.2 from
2026-09-08, and 0.6.0 from 2026-10-15
([W157](work-items/w157-the-pin-moves-to-0-6-0-behaviour-unmoved.md)), which shipped [S2](#s2---cancel-a-queued-task).
Line references are against **0.5.2** unless a row says otherwise — and `core/FyflowScheduler.ts` is
**byte-identical to 0.3.0**. *(This said `core/threadWrapper.ts` was byte-identical too. **It is not,
at either version**: `sha256` differs at 0.3.0, 0.5.1 and 0.5.2, and the 0.5.1 file is a 99-line diff
from 0.3.0. The sentence was already wrong when W36 wrote it, and W37 re-dated the version two words
earlier while leaving it — making it false about **its own subject**, the file whose line 5 this
register exists to record. W37's conformity reader, and it is the neighbour-of-a-corrected-line leak
W36 recorded twelve times.)*, so every reference taken at that
version is unmoved.

**On "not yet published": measured by W5 on 2026-08-30, and it is narrower than this repository has
been saying.** Both registries carry the package and **both top out at 0.2.1** — npm
`fyflow-scheduler` (`dist-tags.latest`) and JSR `@fyflow/scheduler` (four versions, 0.1.0 to 0.2.1).
So `@fyflow/scheduler` **is** on JSR, which `spec/runtime-targets.md` section 1 assumes and nobody
had checked; it is only **0.3.0** that is unpublished, on either. That is what forces
[ADR 0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md).

**Every item but [S10](#s10---resourcegroup-declares-onstart-and-onfinish-optional-and-the-scheduler-calls-them-unguarded) and [S11](#s11---messagesflushintervalms-is-not-bounded-at-the-schedulers-own-max_timer_ms) is closed, deferred, or declined — neither is raised — and [S9](#s9---the-published-typescript-source-does-not-load-under-node-and-agentsmd-3-says-a-ts-worker-cannot-either)
is the ONLY ONE THIS REGISTER HAS EVER RAISED - and it was fixed the same day.** 0.3.0 settled four
without us asking - S4 implemented, S7 fixed, S8 declined and documented - and S1 was answered
directly by the maintainer on 2026-08-30. S5 stays deferred with a costless workaround; **S2 shipped
in 0.6.0** without us asking — fyflow-app asked — and S6 is not needed (P34's pause, W175). S10 is unchanged at 0.6.0
(W157). **S9 was found by W5**, the first work item to load the library rather than a
structural stand-in for it, which is the argument for ladder L6 in one sentence.

**S9 was raised on 2026-09-07 and fixed in 0.5.2 the same day** ([W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)).
Both halves, plus a second instance of (a) we had not found. **Nothing here was ever raised before
it**, so the register's whole record is: eight settled without asking, one raised and fixed. That is
a fact about how much of this list was worth raising rather than about how responsive upstream is -
seven of the eight settled themselves, and the one that did not is the one we asked about.

`fyflow-react-components` keeps [its own register](https://github.com/fyflow/fyflow-react-components)
with an independent `S` sequence. **Two items overlap and must be raised jointly, not twice** - see
the last section.

---

## Index

| S | Want | Blocks us? | Status |
|---|---|---|---|
| [S1](#s1---spawntaskconfigparents-is-declared-and-never-read) | Remove or implement `SpawnTaskConfig.parents` | no | ✅ **answered - dead, will be removed** |
| [S2](#s2---cancel-a-queued-task) | Cancel a queued task | no longer | ✅ **shipped in 0.6.0** — `scheduler.cancel(id)`, queued AND running, asked for by fyflow-app's scheduler pass 1; never raised by us. Adopted by [W157](work-items/w157-the-pin-moves-to-0-6-0-behaviour-unmoved.md); folded by P33, used by P34 |
| [S3](#s3---a-join-or-barrier-primitive) | A join/barrier primitive | **declined by us** | will not raise |
| [S4](#s4---scheduler-side-timestamps-on-every-event) | Timestamps on every event | no | ✅ **done in 0.3.0** |
| [S5](#s5---an-event-when-maxcompletedtasks-evicts-a-task) | An event when eviction happens | no | **still deferred at 0.3.0** |
| [S6](#s6---pause-and-resume) | Pause and resume | **no — not needed**: pause is BUILT at our layer ([W175](work-items/w175-pausing-a-run.md), [ADR 0106](decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md)) and leaves the scheduler's queue untouched | not raised, and will not be (P34 (e)); **not in 0.6.0** (W157) |
| [S7](#s7---exit-c-drops-a-blocked-task-silently) | Fix the blocked-queue task drop | no longer - **the confounder is gone** | ✅ **fixed in 0.3.0** |
| [S8](#s8---freeze-or-copy-event-details) | Freeze or copy event details | no | **declined, and now documented** |
| [S9](#s9---the-published-typescript-source-does-not-load-under-node-and-agentsmd-3-says-a-ts-worker-cannot-either) | `import type` in `core/threadWrapper.ts`, and correct `AGENTS.md` §3 on `.ts` workers | no - and the reason CHANGED: Node reads npm's `dist/` because that is what an npm consumer gets, no longer because it *cannot* read the source | **RAISED 2026-09-07 and FIXED in 0.5.2 the same day** - the only item this register has ever raised, closed by [W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md). *(The rest of this cell is the record as it stood when it was raised.)* Its *publication* half is closed: 0.3.0 is on npm and JSR since 2026-08-31 ([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)), so the cost is no longer a build step in a sibling checkout - it is that **neither one-line fix can be tried locally without unpinning**, which is that ADR's stated cost |
| [S10](#s10---resourcegroup-declares-onstart-and-onfinish-optional-and-the-scheduler-calls-them-unguarded) | Mark `ResourceGroup.onStart`/`onFinish` required, or guard the calls | no — we refuse such a group at construction | **not raised yet** |
| [S11](#s11---messagesflushintervalms-is-not-bounded-at-the-schedulers-own-max_timer_ms) | Bound `messages.flushIntervalMs` at the scheduler's own `MAX_TIMER_MS`, as a grace timer is | no — we refuse a longer one at construction | **not raised** — P37 (f), written by [W165](work-items/w165-pool-options-on-a-named-pool-instance.md) |
| [S12](#s12---cancel-gracems-0-does-not-force-at-once-it-arms-a-0-ms-timer-that-races-the-worker) | Make `cancel(id, { graceMs: 0 })` force synchronously, or say in §5 that it is a 0 ms timer | no — nothing of ours depends on `forced`, and our reference says `0` is a race | **not raised** — written at [P34](plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s declaration (fact 9, P33 stop-and-ask (g)); P34 (g) answered 2026-10-16: an entry, not a report |

---

## Reading `RESOURCE_EVENTS_PLAN.md` — the S-id map

`../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` **shipped as 0.3.0** (commits `48111fe`, `d86c225`,
`373a29f`, `bccbeea`, `634e23a`). It is a counter-proposal to **`fyflow-react-components`' upstream
spec, and it uses that repo's S numbering throughout.** Ours is a different sequence. Reading one as
the other is an easy and expensive mistake, so:

| Their id | What | Our id |
|---|---|---|
| **S1** eviction event | out of scope in that plan | **our S5** |
| **S2** timestamps | §5, five call sites - **shipped** | **our S4** |
| **S5** snapshot accessor | declined by both sides | *not ours* |
| **S6** resource acquire/release/blocked events | the bulk of the plan | *not in our register* |
| **S7** admission queue accessor | §6 | *not ours* |
| **S8** details are live references | §11 - **documented, not fixed**, as planned | **our S8** |

**What landed, checked against the code rather than the plan:**

1. **Our S4 is done** — every event carries `timestamp`. On the four `task.*` events it is
   `task.timestamp`, **a mutable field on the live task**, which is a sharper trap than a
   detail-level field would have been. ADR 0007 rule 4 covers it.
2. **Our S5 did not land** — `_recordTerminalTask` still evicts silently, no event. Our workaround
   costs nothing, so this stays parked.
3. **Their S8 landed on us as a constraint, not a gift**, exactly as expected: documented rather
   than fixed, which is what forced
   [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md).
   `AGENTS.md` §6 now carries a worked example and calls it *"a documented contract, not an
   oversight"*.
4. **Our S7 was fixed, and better than the plan proposed.** §4.4 offered `orphaned` as observability
   with the fix deferred; `634e23a` fails the task terminally instead. See S7 below — **this
   retires a threat to P1's validity**.
5. **The resource events are still mostly not ours.** They make a *scheduler-level* stall visible. A
   stuck **join** is a flow-level condition with nothing queued and nothing blocked, so no
   `resource.blocked` fires for it — [Q7](questions/q7.md) stays entirely ours.
6. **Two patterns there are worth stealing if [Q21](questions/q21.md) lands.** §6.2 — *one
   emitter only*, because a consumer listening to two `EventTarget`s double-counts — and §3.5 —
   *an unrecognised gauge kind renders as `level`*, so a vocabulary can grow without breaking
   deployed viewers. Both shipped and are now documented in `AGENTS.md` §6.

**Two things changed that the plan did not flag, and one thing it implied would happen did not:**

- **`task.progress`'s detail shape changed.** At 0.2.1 it was `{ taskId, workerId, progress,
  message, details }`; at 0.3.0 it is **the task spread flat**, so the id is `id` rather than
  `taskId`, and the wrapper's `workerType` (`'inline'`/`'thread'`) **overwrites the task's own**.
  `AGENTS.md` documents both. There is no changelog, so a 0.2.1 consumer reading `detail.taskId`
  gets `undefined` silently. We do not consume it yet; W3 must not assume the 0.2.1 shape.
- **`released.reason: 'settled'` is per *attempt*, not per task.** A retried or requeued task emits
  one pair per attempt. Relevant to [Q16](questions/q16.md), where flow-level and task-level retry
  counts compose into a product nobody intended.
- **[S1](#s1---spawntaskconfigparents-is-declared-and-never-read) is still there in the code**, and
  has since been **answered directly**: it stays dead and will eventually be removed.

---

## S1 - `SpawnTaskConfig.parents` is declared and never read

**What.** `core/workerInterface.ts:50` declares `parents?: string[]` on `SpawnTaskConfig`. Nothing
in the repository reads it. The spawn path — `core/FyflowScheduler.ts:1468-1473` at 0.3.0, was
1015-1020 at 0.2.1 — builds the task from `id`, `workerType`, `payload`, `optional`, `retryPolicy`
and `workerGroups`, and **drops `parents` silently**.

**✅ Answered 2026-08-30 by the maintainer** — *"will remain dead and eventually removed, don't rely
on it."* Closed; do not re-raise.

**This is a better answer than the deletion we asked for**, for our purposes. The ask was really
*"stop this field claiming a dependency graph exists"*, and an explicit statement that it is
vestigial and going does that immediately, while a deletion would have been a breaking type change
for anyone currently passing it.

**What it changes for us: nothing, which is the point.**
[ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 2 means we
never call `spawnTask` for flow control at all, so we could not have relied on it. What it *does*
settle is the reading in `doc/concept.md` section 2: the field is now **confirmed vestigial by the
maintainer**, not merely observed-to-be-unread by us. The concept's argument no longer rests on our
own grep.

**One forward note.** When the field goes, that is a breaking change to `SpawnTaskConfig` for anyone
who passed it — not us, and worth nothing more than this sentence.

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

> **SHIPPED IN 0.6.0, and more than was asked** — measured by
> [W157](work-items/w157-the-pin-moves-to-0-6-0-behaviour-unmoved.md) in 0.6.0's own `AGENTS.md` §5
> and source. `scheduler.cancel(taskId, { reason, graceMs })`: a task still WAITING — queued, blocked
> on a group, or in a retry backoff — is removed and never runs; a RUNNING one fires
> `task.cancelling`, has its `context.signal` aborted, and is forced after the pool's
> `cancelGraceMs` on a threaded pool (an inline run cannot be interrupted). Either way it ends in a
> sixth state, `cancelled`, with `task.cancelled` alone — no `task.failed`, no retry, no requeue — and
> its promise rejects with `CancelledError`, an optional task's too. **The running half is the ask
> above called *a much larger ask* and left out.** It came from fyflow-app's scheduler pass 1, not
> from this register, so S9 is still the only item we have raised. **What it costs us before P33
> lands**: the listener does not subscribe `task.cancelled` and its `TERMINAL` set has no
> `cancelled`, so a cancelled task is DROPPED and its run never ends (P33 fact 1). The *What we do
> without it* paragraph above is the record of 0.5.2; what a run does with a cancel is P34's.

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
[S2](#s2---cancel-a-queued-task) supports - a small, general primitive rather than a large,
opinionated one.

## S4 - Scheduler-side timestamps on every event

**What.** Event payloads mostly carry no timestamp; the worker lifecycle events do
(`{ workerId, workerType, timestamp }`) but the `task.*` events do not.

**Why we want it.** Our fold stamps arrival time, which is when the driver's listener ran, not when
the thing happened. Under load those diverge, and every duration we report inherits the error.

**What we do without it.** Stamp on arrival in the driver, and keep any library-supplied timestamp
in **its own field** from the first version so this landing later is additive rather than breaking.

**✅ Done in 0.3.0.** All five events carry a timestamp, plus the new `resource.*` family.

**With one wrinkle worth knowing.** On the four `task.*` events the value is **`task.timestamp`, a
field set on the live task object** immediately before dispatch — not a field on the event detail.
So a retained `detail` reports the timestamp of the *most recent* event about that task, not the one
you received. `AGENTS.md` makes the same point from the other direction: *"this is why `timestamp`
is not derivable from `startTime` or `endTime`"*. Covered by
[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 4,
whose wording anticipated a detail-level field and applies unchanged to a task-level one.

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

**What we do without it.** Pause at our layer: routing goes on, and each new dispatch is recorded and held
back from the scheduler until the unpause ([W175](work-items/w175-pausing-a-run.md)). In-flight tasks and anything
already queued still run — which a pause at our layer cannot change without cancelling them, the road P34 (e) declined.

> **Not in 0.6.0** — measured by [W157](work-items/w157-the-pin-moves-to-0-6-0-behaviour-unmoved.md):
> neither its `AGENTS.md` nor its source has a pause. **What 0.6.0 changes for the workaround**: the
> second half of the sentence above no longer holds, because [S2](#s2---cancel-a-queued-task) shipped
> — a pause at our layer could cancel what it queued and re-dispatch it on resume, at the price of a
> cancelled task's lost progress. Whether it does is P34's (#14), which also decides whether a pause
> needs this want at all.

> **Not needed — P34 (e), built by [W175](work-items/w175-pausing-a-run.md)
> ([ADR 0106](decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md)).** A pause is
> ours: `driver.pause()` holds every dispatch AFTER its `dispatched` element — nothing new reaches the scheduler — while
> what was already handed on runs and settles, and `driver.unpause()` hands the held tasks on in dispatch order. Nothing
> already queued is cancelled, so the road above (cancel and re-dispatch) is not taken and no progress is lost; what a
> pause leaves is that a task the scheduler already QUEUED behind a group still runs, which is the owner's to cancel.

## S7 - exit (c) drops a blocked task silently

**What.** `core/FyflowScheduler.ts:848` — `if (!pool) continue;` — shifts a task out of a blocked
queue and drops it when its pool no longer exists. It is never requeued and no event fires.
`RESOURCE_EVENTS_PLAN.md` §4.4 calls it *"a pre-existing bug"*; §8 asks whether to fix it or leave
it.

**Why we care more than a viewer does.** A dropped task produces **no outcome event ever**, so a run
waiting on that node waits forever. **That is the same observable signature as a stuck join** —
nothing queued, nothing running, no error — which is precisely the condition
[P1](plans/p1-what-satisfies-a-join.md) exists to study. A confounder that mimics the experiment's
result is worth more to us than to anyone else reading that plan ([Q32](questions/q32.md)).

**Ask.** Fix it — requeue, or fail the task loudly.

**✅ Fixed in 0.3.0 (`634e23a`), and the fix went further than we asked.** `_failOrphanedTask` now
fails the task terminally: `task.failed`, then `task.user_action` unless optional, the promise
rejects, and `stats.failed` increments. Two deliberate departures from the ordinary failure path,
both of which are the right call and neither of which we would have thought to specify:

1. **Retries are skipped** — the pool is gone, so a retry would requeue into a queue no dispatch can
   drain and hold `stats.queued` above zero forever, *wedging* `scheduler.completed` rather than
   unwedging it.
2. **It does not route through `_settleTask`**, which decrements `stats.running` — a blocked task
   was never running, so that would decrement a count belonging to a different task.

It is also swept out of **every** blocked queue with one `orphaned` exit each, so a consumer's
membership fold drains.

**What this retires.** [Q32](questions/q32.md) — a dropped task no longer produces silence, so a
P1 hang can no longer be a silently-lost task masquerading as a stuck join. W5's
every-node-settles assertion stays, demoted from *a gate on the experiment's validity* to *cheap
insurance*, because it is now checking a property the library asserts rather than one it violates.

## S8 - freeze or copy event details

**Declined upstream, before we asked.** Recorded so the register shows this was considered and
answered rather than missed.

**What.** For `task.running`, `task.completed`, `task.failed` and `task.user_action` the event detail
**is** the live `FyflowTask` (`core/FyflowScheduler.ts:727, 775, 777, 974`); for
`scheduler.completed` it is `this.stats`, mutated in place (line 320). Retaining `e.detail` yields a
reference that reads as whatever the object holds later.

**Why upstream is right to decline.** `RESOURCE_EVENTS_PLAN.md` §10 — defensive copying on a hot
path is the wrong trade for a zero-dependency library. Listeners run synchronously, so *reading* at
that moment is always correct; only *storing* is not.

**Shipped as documentation, and done well.** `AGENTS.md` §6 now carries a warning box with a worked
example — `seen.push(e.detail)` where *"every entry reads `state:'done'`. Nothing threw. The log is
just wrong."* — the projection idiom as the fix, and an explicit not-affected list
(`task.progress`, `scheduler.completed`, `resource.*`). It closes with *"a documented contract, not
an oversight"*.

**One gap remains, and it is small.** The not-affected list does not mention `task.spawn_request` /
`task.spawn_failed`, whose detail carries `parentTask: task` — a live reference
(`core/FyflowScheduler.ts:1455`). Not ours to hit:
[ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 2 means we
never consume spawn events. Worth passing on as a courtesy, not as a want.

**What we do without it.**
[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md): the
driver copies the declared fields at the listener boundary and nothing downstream ever holds a
library object. **This is the one item in this register that changed our own architecture** instead
of being worked around.

---

## S9 - the published TypeScript source does not load under Node, and `AGENTS.md` §3 says a `.ts` worker cannot either

> **CLOSED - RAISED 2026-09-07, FIXED IN 0.5.2 THE SAME DAY.** Both halves, and the pin moved by
> [W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md). **This is the only item this register has
> ever raised.** What follows is the report as it stood, kept whole because it is the evidence the
> fix was asked for on; below it is what 0.5.2 actually changed.
>
> **(a) is fixed and the CONSEQUENCE is gone, not just the line.** `core/threadWrapper.ts:5` is now
> `import type { WorkerInstanceExtensions, WorkerInstanceState, BaseWorkerContext }` with the value
> import of `WorkerTerminationError` on its own line. Measured against the JSR 0.5.2 source:
> `node --input-type=module -e "import('./index.ts')"` prints **`LOADED under node 24.20.0 -
> exports: 10`**. It had never loaded before.
>
> **And upstream found a second instance we had not reported**: `core/workerManager.ts:3`,
> `import type { WorkerStatus }`. Our report named `threadWrapper` only. **The whole source diff
> between 0.5.1 and 0.5.2 is SIX FILES** — and this sentence said **two**, measured over the four
> files this item downloaded rather than over JSR's manifest (W37's conformity reader). The four
> `import type` splits are `core/threadWrapper.ts`, `core/workerManager.ts`,
> `core/inlineWrapper.ts` and `core/workerWrapper.ts`; **`deno.json` gains
> `"verbatimModuleSyntax": true`**, which is the fix our own report called the better form —
> it makes this class a COMPILE error rather than leaving the next instance to a consumer's loader —
> and `README.md`'s worker section moves with `AGENTS.md` §3. `core/FyflowScheduler.ts` is
> byte-identical, and so are npm's `dist/node/index.js` and `dist/browser/index.js`: **Node's actual
> artifact did not change at all.** `AGENTS.md` section 6 is byte-identical too.
>
> **(b) is fixed BETTER than it was asked for.** The report suggested saying a `.js` worker is
> supported rather than required. §3 instead **version-qualifies**: a `.ts` worker works on
> **Node >= 22.18** (and 23.6), with `Node < 22.18` named as the range that must still ship `.js`,
> the "ship a `.js` worker" heading dropped, the cross-runtime `typeof Deno` branch demoted to *only
> if you target the browser or Node < 22.18*, and the troubleshooting row corrected from *"Node
> cannot import TypeScript"* to *"Node < 22.18 has no type stripping"*. It also adds an
> **erasable-syntax** caveat naming `enum`, `namespace`, parameter properties, decorators - and the
> `import type` trap that caused (a), described as *"green everywhere and throws only at load"*.
> **The question the report flagged as the one it could not answer from outside - what is the
> supported Node floor - is the one the fix turns on.**
>
> **What this does NOT change: the two-road split stays.** Node still reads npm's `dist/` and Deno
> still reads JSR's source. What expired is the *reason*: it was *because Node cannot read the
> source*, and it is now *because `dist/` is what an npm consumer actually gets*, so L6 tests the
> published artifact rather than a tree no consumer resolves. `D4` and `D5` exist for that.
> Corrected in place in [ADR 0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
> and [ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md).


**Two findings, one root, both measured at Node 24.20.0 and Deno 2.9.6 on 2026-08-30 by
[W5](work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md), and BOTH RE-MEASURED UNCHANGED AT
0.5.1 on 2026-09-07 by [W36](work-items/w36-the-scheduler-pin-moves-to-0-5-1.md).**

> **The citation moves and the defect does not.** At 0.5.1 `core/threadWrapper.ts:5` still
> value-imports `BaseWorkerContext` — an interface — alongside real values, on the **same line**;
> and `AGENTS.md` §3 still tells a consumer to ship a `.js` worker, on the **same lines** (50, 75,
> 78). **Two versions of evidence rather than one**, which is a stronger case for raising this than
> a single version's was, and it is still unraised.

They pull in opposite directions: the first is a real defect, the second is the reference being
*more* pessimistic than the runtime.

**What (a) - `index.ts` cannot be imported by Node.** `import('../fyflow-scheduler/index.ts')` under
Node 24 throws:

```
SyntaxError: The requested module './workerInterface.ts' does not provide an
export named 'BaseWorkerContext'          at core/threadWrapper.ts:5
```

`BaseWorkerContext` is an `interface` (`core/workerInterface.ts:62`) imported as a **value**
(`core/threadWrapper.ts:5`, alongside `WorkerInstanceExtensions` and `WorkerInstanceState`, which are
also interfaces). Node runs TypeScript by **erasing types, not compiling them**, so the named import
survives erasure and resolves to nothing. `deno check`, `tsc -p tsconfig.node.json` and
`tsc -p tsconfig.browser.json` all accept it. The fix is one word per name: `import type`, or
`verbatimModuleSyntax` in `tsconfig.json` to make the whole class a compile error.

**This is our own `RT-R9`** (`spec/runtime-targets.md` section 4), which exists because W3 hit the
identical shape — *a construct every typechecker accepts and Node's loader refuses* — inside this
repository. It is a want rather than a blocker only because the npm package ships a bundle.

**What (b) - `AGENTS.md` §3 is stale about `.ts` workers.** It says *"The file must be JavaScript.
Node cannot import TypeScript, so a `.ts` worker fails with `Unknown file extension \".ts\"`. Compile
your worker as part of your own build."* Measured: a worker with parameter types, a return type, an
`interface` and `import type` runs under Node 24 in **both** `inline: true` and `inline: false`
pools, and the same file runs under Deno. The §3 *"Cross-runtime code"* `typeof Deno !== 'undefined'`
branch is unnecessary at Node >= 22.6.

**Why it matters to a consumer**, and not only to us: §3's advice makes every Node consumer add a
worker build step that Node has not needed for two major versions.

**What we do without it.**
[ADR 0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 3 and 5 — **Node reads `dist/`, Deno reads the source**, and the gate checks the two are the
same version. Cost: one build step next door and a freshness check we would not otherwise write.
(b) costs nothing at all; W5 ships one `.ts` worker for both runtimes on the measurement rather than
on the documentation.

**This is the first item in this register that we have a reason to raise.** The paragraph above
saying there was nothing left to raise was true when it was written and is no longer.

---

## S10 - `ResourceGroup` declares `onStart` and `onFinish` OPTIONAL and the scheduler calls them unguarded

> **NOT RAISED YET.** Found by [W66](work-items/w66-the-runtime-entry.md)'s declaration step on
> 2026-09-16, building the runtime's group factories. It does not block us: `createRuntime` refuses
> such a group at construction ([ADR 0055](decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md)),
> which is the workaround this register requires an item to state.

**The interface says one thing and the implementation does another**, at 0.5.2.
`dist/types/groups/resourceGroup.d.ts` declares:

| member | declared |
|---|---|
| `canRun(key?, cost?)` | **required** |
| `getMetrics()` | **required** |
| `onStart?(key?, cost?)` | optional |
| `onFinish?(key?, cost?)` | optional |

**Measured, one omission at a time, each group holding a real task on a real `FyflowScheduler` —
identical under Node 24.20.0 and Deno 2.9.6** (`dev-dist/w66/facts-{node,deno}.log`):

| omitted | the task |
|---|---|
| `onStart` | **throws** `group.onStart is not a function` |
| `onFinish` | **never finishes** — `running` at 2.5 s, and `shutdown()` warns *"1 task(s) still marked running … dispatched to a pool that could not complete them"* |
| `getMetrics` | runs to `done` |
| `canRun` | throws |
| `type` | runs to `done` |

So a consumer who writes the interface's required half and omits its optional half gets a scheduler
that throws on the first task, or one that hangs every task naming the group **in silence, with
`stats` reporting idle** — which is the worse of the two and the reason to raise this.

**What we do without it.** `createRuntime` holds a group factory's output to the UNION of the two
lists — `canRun`, `onStart`, `onFinish`, `getMetrics`, `id`, `type` — and refuses by name at
construction (ADR 0055). A consumer who builds their own groups and passes them to `bootstrap` is
not protected, and nothing can protect them but this fix or a documented note.

**The ask, either way round.** Mark `onStart` and `onFinish` required in the interface, **or** guard
the two call sites (`group.onStart?.(…)`) so the optionality the type declares is real. The first is
a breaking type change and the second is not; we have no preference, and either makes the type tell
the truth. **A note in `AGENTS.md` §6 would also close it for us**, on S8's precedent, since our own
refusal already covers our consumers.

**One more thing measured beside it, not part of the ask.** `ResourceGroup extends EventTarget`, and
a PLAIN object carrying the six members holds a real task and completes it — so `EventTarget` is not
a run-time requirement, and our refusal does not test for it.

## S11 - `messages.flushIntervalMs` is not bounded at the scheduler's own `MAX_TIMER_MS`

> **NOT RAISED.** Found by [P33](plans/p33-what-a-run-does-when-a-task-ends-cancelled.md)'s W159 (its adequacy reader's
> F9), re-measured as [P37](plans/p37-a-runtime-is-its-registry.md) fact 7 on 2026-10-15, and written here by
> [W165](work-items/w165-pool-options-on-a-named-pool-instance.md) on the maintainer's answer to P37 stop-and-ask (f),
> *"as recommended"* — an entry, not a report. It does not block us: `poolSpecProblem` bounds the value at construction
> ([ADR 0099](decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md) rule 6), which is the
> workaround this register requires an item to state.

**The scheduler knows the bound and applies it to one timer of two**, at 0.6.0. `dist/node/index.js`:

| | where | what it does |
|---|---|---|
| the bound | `:1387` | `var MAX_TIMER_MS = 2 ** 31 - 1;` |
| a cancel's grace timer | `:1684` | `if (graceMs > MAX_TIMER_MS) return;` — not armed above it, so `Infinity` means *never force* |
| `messages.flushIntervalMs`, validated | `:743-744` (`resolveMessageOptions`) | a number, finite, `> 0` — **no upper bound** |
| `messages.flushIntervalMs`, used | `:864-867` | `setTimeout(…, this.options.flushIntervalMs - (now - this.lastFlush))` |

**Measured, node 24.20.0 and deno 2.9.6** (P37 fact 7): a `setTimeout` of 2^31 and of 1e300 fired at ONCE, with a
`TimeoutOverflowWarning` (*"Timeout duration was set to 1"*), and one of 2^31-1 had not fired at 200 ms. So a pool
configured with `messages: { flushIntervalMs: 2 ** 31 }` — meaning *batch for about 25 days* — flushes every worker
`emit()` after 1 ms, the opposite of what was asked, and constructs without a word.

**Who meets it.** Any consumer constructing a `WorkerManager` directly. Ours do not: a registry's `messages` reaches the
scheduler only through a type's `pool`, an instance's `pool` or a CLASS derivation's output, all three held by
`poolSpecProblem`.

**What we do without it.** `poolSpecProblem` refuses `flushIntervalMs` above 2^31-1, naming the key and the bound, as
`DerivationRefused` — on a type's `pool`, an instance's and a class's output alike.

**The ask, either way round.** Validate `flushIntervalMs <= MAX_TIMER_MS` in `resolveMessageOptions`, throwing as it does
for `<= 0`; **or** clamp it there, as the grace timer's guard effectively does. The first is what we do; either makes a
value the scheduler accepts mean what it says. **A sentence in `AGENTS.md` §5's `messages` row would also close it for
us**, on S8's precedent, since our own bound already covers our consumers.

## S12 - `cancel` `graceMs: 0` does not force at once, it arms a 0 ms timer that races the worker

> **NOT RAISED.** First seen once by [P33](plans/p33-what-a-run-does-when-a-task-ends-cancelled.md)'s W160 (its adequacy
> reader's F8: node `forced: false`, deno `forced: true`), and MEASURED at
> [P34](plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s declaration on 2026-10-16 (its fact 9), which
> writes it here by P33's stop-and-ask (g): *if it reproduces, an S entry*. P34's stop-and-ask (g), answered by the maintainer 2026-10-16 *"as recommended"*: written, NOT
> raised.

**What the reference says.** `AGENTS.md` §5, `CancelOptions.graceMs`: *"`0` forces at once, `Infinity` never"*; and the
pool option `cancelGraceMs` says the same.

**What the code does, at 0.6.0, in both builds.** `_cancelTask` arms `_armGraceTimer`, a plain
`setTimeout(() => retire the worker, graceMs)` — `dist/node/index.js:1642-1647` and `:1683-1692`; the JSR source's
`workerManager.ts:504` and `:547-557`. So `graceMs: 0` is a 0 ms timer racing the worker's own reply to the abort.

**Measured, node 24.20.0 and deno 2.9.6**: one running task on a threaded pool, cancelled one macrotask after the worker
reported it had started, `{ graceMs: 0 }`. `forced: true` runs:

| the worker | node | deno |
|---|---|---|
| honours its signal | 1/20 | 18/20 |
| returns at once on abort | 0/10 | 6/20 |
| ignores its signal | 20/20 | 20/20 |

Deno, honouring worker, 10 runs each: `graceMs: 1` 7/10 forced, `graceMs: 5` 0/10. A forced run drops whatever the worker
sends after the abort (the task is detached); an unforced one delivers it. **So the same call forces or does not by the
timer resolution of the runtime**: node clamps a 0 ms timer to 1 ms and the worker usually wins, deno's usually fires
first.

**Who meets it.** Anyone pressing Cancel with `graceMs: 0` to stop a worker NOW — the reference's own reading — who then
reads `forced`, or relies on the worker's teardown NOT running, or on a message the worker posts while stopping.

**What we do without it.** Nothing in `src/` passes a `graceMs` of its own; a run-level cancel forwards the caller's
(P34 (c)). Our reference says `0` is a race and not a guarantee, and our L6 rows assert that `cancel()` resolved and the
run settled — never `forced` — at `graceMs: 0`; a row that needs a forced stop uses a worker that ignores its signal.

**The ask, either way round.** Retire the worker SYNCHRONOUSLY in `_cancelTask` when `graceMs` is `0`; **or** change the
two sentences to *"`0` forces on the next timer turn, which a worker that stops promptly may beat"*. The first makes the
documented meaning true; the second makes the documentation true, which is all we need.

## Raise order, and the joint items

Revised **2026-08-30 against the landed 0.3.0 code**. **Four of the eight are settled and we raised
none of them** — S4 implemented, S7 fixed better than asked, S8 declined-and-documented, S5
deferred with our workaround intact. What is left:

**[S9](#s9---the-published-typescript-source-does-not-load-under-node-and-agentsmd-3-says-a-ts-worker-cannot-either)
was the one to raise, it was raised on 2026-09-07, and it was FIXED in 0.5.2 the same day.**
*(The paragraph this replaces read *"is the one to raise, and it is ready"*, and the plan it
described is what was sent: both halves in one report, on the ground that they are the same fact
about Node's type stripping seen from two sides. It worked, so it is recorded rather than deleted.)*
**S10 is not raised, and neither is S11** (P37 stop-and-ask (f): an entry, not a report), **nor S12** (written at P34's
declaration; NOT RAISED by the maintainer's answer to P34's stop-and-ask (g), 2026-10-16).

1. **S2 when a fan-out is real.** Much stronger with a measured number for wasted branch execution.
   Do not raise it on principle — and P1 is what would produce the number.
2. **S6 last.** Nothing in the first set needs it.
3. **S1, S3, S7 and S8 are closed.** S1 answered (dead, will be removed), S3 declined by us, S7
   fixed in 0.3.0, S8 declined by upstream and absorbed into ADR 0007.
4. **S5 stays parked**, deferred upstream with a workaround that costs us nothing.

**The joint-raise machinery is spent.** S4 and S5 were both carried by
`fyflow-react-components` and both came back answered. What remains shared is the *pattern*: raise
once, from whichever repo has the stronger case.

**Worth passing on, but not as register items** — two documentation gaps found while verifying
0.3.0: the `task.failed`+`task.user_action` pair is still undocumented for the *ordinary* path
(`AGENTS.md` §5 still reads *"`task.failed` fires once per failed task"*, and only the `orphaned`
row records the pairing), and the live-reference not-affected list omits the spawn events.
