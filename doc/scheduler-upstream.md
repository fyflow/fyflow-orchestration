# Wants from fyflow-scheduler

The register of changes we would like in `fyflow-scheduler`, kept here rather than in a workaround
comment. One row per item, `S1`, `S2`, ... - never reused, never renumbered.

**Every item must state what we do without it.** An item with no workaround is not a want, it is a
blocker, and it belongs in a plan instead.

**Nothing here has been raised by us.** Pinned to `fyflow-scheduler` **0.3.0** (landed 2026-08-30).
Line references are against 0.3.0 unless a row says otherwise.

**On "not yet published": measured by W5 on 2026-08-30, and it is narrower than this repository has
been saying.** Both registries carry the package and **both top out at 0.2.1** — npm
`fyflow-scheduler` (`dist-tags.latest`) and JSR `@fyflow/scheduler` (four versions, 0.1.0 to 0.2.1).
So `@fyflow/scheduler` **is** on JSR, which `spec/runtime-targets.md` section 1 assumes and nobody
had checked; it is only **0.3.0** that is unpublished, on either. That is what forces
[ADR 0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md).

**Eight of nine items are closed, deferred, or declined; [S9](#s9--the-published-typescript-source-does-not-load-under-node-and-agentsmd-3-says-a-ts-worker-cannot-either)
is live and is the first thing here worth raising.** 0.3.0 settled four without us asking - S4
implemented, S7 fixed, S8 declined and documented - and S1 was answered directly by the maintainer on
2026-08-30. S5 stays deferred with a costless workaround; S2 and S6 wait for a real need. **S9 was
found by W5**, the first work item to load the library rather than a structural stand-in for it,
which is the argument for ladder L6 in one sentence.

`fyflow-react-components` keeps [its own register](https://github.com/fyflow/fyflow-react-components)
with an independent `S` sequence. **Two items overlap and must be raised jointly, not twice** - see
the last section.

---

## Index

| S | Want | Blocks us? | Status |
|---|---|---|---|
| [S1](#s1--spawntaskconfigparents-is-declared-and-never-read) | Remove or implement `SpawnTaskConfig.parents` | no | ✅ **answered - dead, will be removed** |
| [S2](#s2--cancel-a-queued-task) | Cancel a queued task | no - it caps what "cancel" can mean | not raised |
| [S3](#s3--a-join-or-barrier-primitive) | A join/barrier primitive | **declined by us** | will not raise |
| [S4](#s4--scheduler-side-timestamps-on-every-event) | Timestamps on every event | no | ✅ **done in 0.3.0** |
| [S5](#s5--an-event-when-maxcompletedtasks-evicts-a-task) | An event when eviction happens | no | **still deferred at 0.3.0** |
| [S6](#s6--pause-and-resume) | Pause and resume | no - not in the first set | not raised |
| [S7](#s7--exit-c-drops-a-blocked-task-silently) | Fix the blocked-queue task drop | no longer - **the confounder is gone** | ✅ **fixed in 0.3.0** |
| [S8](#s8--freeze-or-copy-event-details) | Freeze or copy event details | no | **declined, and now documented** |
| [S9](#s9--the-published-typescript-source-does-not-load-under-node-and-agentsmd-3-says-a-ts-worker-cannot-either) | `import type` in `core/threadWrapper.ts`, and correct `AGENTS.md` §3 on `.ts` workers | no - it costs us a build step and a freshness check | **not raised - the only live item** |

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
   `resource.blocked` fires for it — [Q7](open-questions.md) stays entirely ours.
6. **Two patterns there are worth stealing if [Q21](open-questions.md) lands.** §6.2 — *one
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
  one pair per attempt. Relevant to [Q16](open-questions.md), where flow-level and task-level retry
  counts compose into a product nobody intended.
- **[S1](#s1--spawntaskconfigparents-is-declared-and-never-read) is still there in the code**, and
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

**What this retires.** [Q32](open-questions.md) — a dropped task no longer produces silence, so a
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

**Two findings, one root, both measured at Node 24.20.0 and Deno 2.9.6 on 2026-08-30 by
[W5](work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md).** They pull in opposite
directions: the first is a real defect, the second is the reference being *more* pessimistic than
the runtime.

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

## Raise order, and the joint items

Revised **2026-08-30 against the landed 0.3.0 code**. **Four of the eight are settled and we raised
none of them** — S4 implemented, S7 fixed better than asked, S8 declined-and-documented, S5
deferred with our workaround intact. What is left:

**[S9](#s9--the-published-typescript-source-does-not-load-under-node-and-agentsmd-3-says-a-ts-worker-cannot-either)
is the one to raise, and it is ready.** Both halves are one-line changes with a measurement behind
them, and half (b) makes the reference *less* restrictive rather than more. Raise (a) and (b)
together: they are the same fact about Node's type stripping seen from two sides.

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
