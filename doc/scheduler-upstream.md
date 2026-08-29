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
| [S4](#s4--scheduler-side-timestamps-on-every-event) | Timestamps on every event | no | shared with react-components |
| [S5](#s5--an-event-when-maxcompletedtasks-evicts-a-task) | An event when eviction happens | no | shared with react-components |
| [S6](#s6--pause-and-resume) | Pause and resume | no - not in the first set | not raised |

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

**Shared.** This is the same want as `fyflow-react-components`' **S2**. Raise once, jointly.

## S5 - An event when `maxCompletedTasks` evicts a task

**What.** Terminal tasks are evicted from `scheduler.tasks` with no event.

**Why we want it.** Q19 - if we ever read task state from the scheduler rather than from our own
log, eviction makes a task vanish with no signal.

**What we do without it.** Do not depend on `scheduler.tasks` as history. Our fold retains what it
needs from events, which is the same answer `fyflow-react-components` reached
(their ADR 0004: *the collector keeps what the scheduler drops*). This is mostly a want on behalf of
consumers who are not us.

**Shared.** Same want as `fyflow-react-components`' **S1**. Raise once, jointly.

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

---

## Raise order, and the joint items

1. **S1 first, on its own.** It is a one-line change, it is unambiguous, and it removes the trap
   that produced a whole misdirected planning document.
2. **S4 and S5 jointly with `fyflow-react-components`.** Both repos want both. Two separate
   requests for the same change is how a maintainer gets two half-arguments instead of one whole
   one - and the same person maintains all three repositories, so a duplicate is pure noise.
3. **S2 when a fan-out is real.** The argument is much stronger with a measured number for wasted
   branch execution than without one. Do not raise it on principle.
4. **S6 last.** Nothing in the first set needs it.
5. **S3 is never raised.** It is here to stay declined.
