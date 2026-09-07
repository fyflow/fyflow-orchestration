# Concept

**Status:** v0.3 - written 2026-08-29, section 3 re-verified against `fyflow-scheduler` 0.3.0 on
2026-08-30. **v0.3 updates section 6 only**: all four of its leanings have now landed, and the table
said two of them were still open. The rest of this document has held up and is unchanged - which is
the more interesting half, since it was written before a line of code existed.
**Read this before any plan.** It states what we are building, the one fact about the substrate
that shapes everything, and the one structural idea the rest of the repo hangs off.

---

## 1. What this repo is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**.

A user defines a **flow**: a task enters, passes through workers, and **decision blocks** route it
onward based on what a worker returned. Routing can **fan out** into parallel branches and later
**collect** them at a join. Flows are instantiated per workload, thousands at a time.

The scheduler runs tasks. This repo decides *which task runs next, and why*.

**It runs wherever the scheduler runs: Deno, Node >= 24 and the browser, from one source tree,
published to JSR and npm** ([spec/runtime-targets.md](../spec/runtime-targets.md)). That is
inherited rather than chosen — a consumer who can run `fyflow-scheduler` in the browser and cannot
run the layer above it has been handed a library that does not compose with the one it wraps. It is
stated *here*, in the concept, because every check in this repo is downstream of these documents:
L0 checks the spec against itself and the conformity pass checks the artifact against the spec, so
**a delivery constraint that is written nowhere is invisible to both**. This one was, until
2026-08-30.

Superseded input: `../fyflow-scheduler/FLOW_PLANNING.md`. Read section 2 before trusting it - it is
written against an API that does not exist.

## 2. The substrate fact that shapes everything

> **fyflow-scheduler has no dependency graph.** No `dependsOn`, no `parents`, no topological order.
> Tasks are independent and run as soon as their pool has a slot and their resource groups have
> capacity.

This is stated as a refusal in the library's own reference (`AGENTS.md` section 1, *"Things that do
NOT exist"*), which also lists `DagScheduler` and `DagTask` as not existing.

**`FLOW_PLANNING.md` in the scheduler repo is therefore not a usable starting point.** It calls the
library "the existing FyFlow DAG scheduler" and its examples pass `parents: ['extract']` to a task
constructor that has no such field. The document's *goals* survive - flow templates, ingestion,
worker plugins - but its premise does not: there is nothing to build "on top of the DAG" because
there is no DAG.

Verified rather than assumed - originally at 0.2.1, re-verified unchanged at 0.3.0, and
**re-verified unchanged again at 0.5.1** by
[W36](work-items/w36-the-scheduler-pin-moves-to-0-5-1.md), line by line rather than by reading:

| Claim | Evidence |
|---|---|
| No dependency field on `FyflowTask` | No `dependsOn`/`parents` in `core/FyflowScheduler.ts`; the only hits are `spawnedChildren`, which is lineage |
| `SpawnTaskConfig.parents` exists but is **dead** | Still declared at `core/workerInterface.ts:50` at 0.5.1 — the same line — read **nowhere** in the repo. The spawn path (`core/FyflowScheduler.ts:1468-1473`, **the same lines at 0.3.0 and 0.5.1**) constructs the task from `id`, `workerType`, `payload`, `optional`, `retryPolicy`, `workerGroups` and **silently drops `parents`**. **Confirmed vestigial by the maintainer** (2026-08-30): it stays dead and will eventually be removed |
| Spawning is not sequencing | `AGENTS.md` section 7: *"This is lineage, not a dependency: spawning never changes dispatch order."* |

That dead field is the worst kind: it typechecks, it reads like the feature exists, and it does
nothing. **This is now confirmed rather than inferred** — the maintainer's answer to
[S1](scheduler-upstream.md) is that it will remain dead and eventually be removed. So section 2's
argument no longer rests on our own reading of the source: the field is vestigial by statement, and
`FLOW_PLANNING.md`'s premise has no support anywhere.

**So every ordering primitive this repo promises - sequence, decision, fan-out, join - is ours to
build.** The scheduler contributes execution, pooling, resource limits and retry. It contributes no
control flow at all.

## 3. What the scheduler does give us

*Verified against **0.3.0** (landed 2026-08-30). Was 0.2.1 when this section was written; every row
below was re-checked rather than carried forward.*

*(**Two corrections, both by [W36](work-items/w36-the-scheduler-pin-moves-to-0-5-1.md).** The
parenthetical read **"on no registry - npm and JSR both stop at 0.2.1, measured by W5"**, which
[ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
superseded on 2026-08-31 — both registries have carried 0.3.0 since, and both carry **0.5.1** now.
**And the pin is 0.5.1, while this table is still dated 0.3.0 deliberately**: W36 re-verified the
rows this repository actually depends on — the five task states and the `user_action` event pair by
running them, `detail`-is-the-live-task by its five line citations, and the dead `parents` field —
and did **not** re-check every row here. The scope is stated rather than the date being moved over
work that was not done, which is `doc/workflow.md` section 1 rule 5's writing clause.)*

| Surface | What we get |
|---|---|
| `addTask` / `addTasks` | dispatch, with `{ createPromise: true }` for a settled result. Throws on unknown `workerType` |
| Events | `task.running`, `task.completed`, `task.failed`, `task.progress`, `task.user_action`, `task.spawn_request`, `scheduler.completed` — **all carrying `timestamp` since 0.3.0** |
| Events (0.3.0, new) | `resource.acquired` / `.released` / `.blocked` / `.unblocked`, and `getAdmissionQueue()`. **Scheduler-level, not flow-level** — useful for diagnosing a stalled pool, useless for a stuck join |
| `FyflowTask` after the run | `state`, `result`, `error`, `attempts`, `startTime`, `endTime`, `executionTime` |
| Resource groups | `ConcurrentLimitGroup`, `RateLimitGroup`, `KeyedRateLimitGroup` - per-task and per-worker (`residentGroups`) |
| Retry | `retryPolicy: { maxRetries, backoffMs }`, per task |
| Spawn | `context.spawnTask()` from inside a worker, plus `onCompleteDescendants()` |

And these constraints, which are design inputs rather than annoyances:

1. **Task states are `pending -> running -> done | failed`, plus `user_action`** for a non-optional
   task out of retries. Five, not four. A flow that models four is wrong. **And such a task
   dispatches *two* events** — `task.failed` then `task.user_action`, same object, `state` already
   `user_action` before either. Key on terminal state, not event name
   ([ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
   rule 2).
2. **`scheduler.completed` fires every time the scheduler drains.** It is not "the run finished" -
   with a flow, the scheduler will drain between steps routinely.
3. **Reusing a task id overwrites.** Silently. Our id scheme is a correctness concern (Q13).
4. **A queued task cannot be cancelled.** Not implemented. So cancelling a run cannot un-queue what
   is already dispatched ([S2](scheduler-upstream.md)).
5. **An event's `detail` is a live object.** For the four `task.*` events it *is* the `FyflowTask`,
   `timestamp` included, so a retained reference misreports every field it carries. Documented
   upstream at 0.3.0 as a contract rather than a bug ([S8](scheduler-upstream.md)); handled by
   ADR 0007.
6. **`maxCompletedTasks` evicts terminal tasks** from `scheduler.tasks` with no event to say so.
7. **Groups are optimistic** - a limit can be briefly exceeded. Nothing here is a hard cap.
8. **`onCompleteDescendants()` does not reject when a descendant fails**, only when the tracked task
   does. It is not a join.
9. **A resource release is per *attempt*, not per task** (0.3.0). A retried or requeued task emits
   one acquire/release pair per attempt, so a task with two retries produces three. Relevant to
   Q16, where flow-level and task-level retries could compose into a product nobody intended.

## 4. The three pieces

```
  flow definition          run state                    execution
  ---------------          ---------                    ---------
  nodes, edges,   --->     one run per workload  --->   FyflowScheduler
  decisions, joins         (which node, which            (pools, groups, retry)
  (a template)              branch, which join)               |
       ^                          ^                           |
       |                          +---- task.completed --------+
       |                          |     task.failed
       +--- instantiated ---------+     task.user_action
            per workload
```

1. **Flow definition** - the template. Nodes bind to a `workerType`; edges carry decisions; fan-out
   and join are node kinds. Written once, instantiated thousands of times.
2. **Run** - one workload's journey through the template. Holds where it is, what each node
   returned, and how many branches a join is still waiting on.
3. **Driver** - subscribes to scheduler events, advances runs, dispatches the next tasks.

The boundary that matters: **the definition is inert data; the run is state; the driver is the only
thing that touches the scheduler.** A decision predicate that calls `addTask` has broken it.

## 5. The one structural idea

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

Deliberately the same invariant as the sibling repo
[fyflow-react-components](https://github.com/fyflow/fyflow-react-components), whose view model is a
pure fold of the scheduler's event stream. Adopting it here is not symmetry for its own sake:

- **A flow is testable without a scheduler.** Feed a fixture log of task outcomes, assert where the
  run went. No workers, no threads, no timers, no flake.
- **Determinism is a cheap real check.** Same outcomes in, same routing out - a rung on the ladder
  rather than an aspiration.
- **Persistence becomes additive, not a rewrite.** If run state is already a fold, durability is
  writing the log down (Q15). Deciding this now is what keeps that door open; the scheduler itself
  has no persistence and `../fyflow-scheduler/PERSISTENCE_ANALYSIS.md` rates adding it *medium to
  high*.
- **The UI gets a real stream.** Flow structure - which node, which branch, which join - is
  invisible to the scheduler, so `fyflow-react-components` cannot show it today. An event family of
  our own is what would let it (Q21).

**Non-determinism is real and must be quarantined, not denied.** Task completion *order* is
genuinely non-deterministic. The fold must be deterministic given an ordered log; the driver is
what turns unordered reality into that ordered log.

## 6. Where the concept is still open

Three clusters, and they are not equally hard.

**The join is the hard one — and it is now answered.** "Wait for all the fan-out to return" has
more than one meaning, and the case this section named is a **decision inside a fan-out branch that
routes away from the join**, where a static "wait for N arrivals" waits forever.
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) settled it by
measurement: **live tokens**. What this paragraph got wrong is not the answer but the size of the
problem — arrival-counting fails on **six of nine** matrix rows, and only one of them is the case
named here. An ordinary `optional` task failing is enough. Q5-Q7 remain, narrowed.

**The definition's nature is the fork with the widest blast radius.** Data, code, or data with
registered predicates - it decides whether runs can be persisted, rendered, and versioned at all.
Q2.

**The rest is ordinary design**: payload flow between nodes (Q11-Q12), identity (Q13), failure and
`user_action` at flow level (Q16-Q18), scale (Q19-Q20).

Leanings, written 2026-08-29 so the refinement pass would start from a position rather than a blank
page. **Updated 2026-08-30 - two became decisions, one became a spike, one is still just a
leaning:**

| | leaning | because | now |
|---|---|---|---|
| Routing locus | the driver, not in-worker spawn | spawn cannot join, and in-worker routing scatters the flow across worker code | **decided** — [ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) |
| Definition | data, predicates by registered name | mirrors how `workerType` already resolves against `workerPools` | **decided** — [ADR 0002](decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) |
| Join | live-token accounting | it is the only form that survives a branch being routed away | **decided** — [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md), by W4's matrix rather than by this argument |
| Run state | a fold of an event log | keeps persistence additive | **decided** — Q14, answered in `spec/run-state.md` section 1 by W2, and made executable by [ADR 0014](decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) |

**All four landed, and all four went to the leaning.** That is worth noticing rather than
celebrating: a leaning that always wins is a leaning that was doing the deciding. Q4 was supposed to
be the check on it — P1 built the losing policy rather than describing it, and put a matrix in front
of both — and it agreed.

**The paragraph this replaces was right about the evidence and wrong about the conclusion.** It said
the join leaning *"rests on a hypothetical case nobody has run, which is a different quality of
evidence wearing the same confident prose."* The case has now been run twice — at ladder L5 against a
fake scheduler and at L6 against a real one — and the leaning survived both. What the running
changed was the **shape** of the answer: the failure is ordinary rather than exotic, which no amount
of leaning produced.

## 7. Explicit non-goals for the first set

- **Durable runs.** In-memory first, matching the scheduler. The fold invariant is what keeps this
  cheap to add later; building it now is premature (Q15).
- **Distribution.** One orchestrator, one scheduler, one process.
- **An expression language** for decisions. Registered predicates instead, if Q2 lands that way.
- **A visual flow editor.** Definitions are authored in code or a document.
- **Controlling a run from a UI** (pause, cancel, retry a node). Read-only observation first - and
  [S2](scheduler-upstream.md) is missing anyway.
  **One exception, added 2026-08-30 and deliberately narrow:
  [ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
  rules 4-6 let an external actor *resolve a suspended `user_action` node*, because a run that stops
  for a human and can never be restarted is not read-only observation - it is a dead run.** It is
  not pause, not cancel and not retry: it supplies the outcome for a dispatch that already happened
  ([Q28](open-questions.md)), and it arrives as an appended log record rather than as a mutation, so
  section 5's invariant is untouched.
- **Ingestion transports.** Kafka and friends from `FLOW_PLANNING.md` are a consumer of this
  library, not part of it.
- **Supporting more than one `fyflow-scheduler` version.** We pin **0.5.1** (Q3), published
  **2026-09-03** and adopted here 2026-09-07, **from both registries**.
  `fyflow-react-components` still pins 0.2.1 and **needs the same bump** - the two repos being on
  different versions is a coordination point, not a steady state. *(This said 0.5.1 "landed
  2026-09-07 and not yet on npm": the date was the day the pin MOVED rather than the day the version
  landed - npm's own `time` field says 2026-09-03 - and "not yet on npm" was carried forward from the
  0.3.0 sentence while 0.5.1 is npm's `latest`. **Both halves of a re-dated claim, wrong in the way
  re-dating is wrong**, and `doc/decisions/README.md` already lists "not yet on npm" among the things
  this repository has got wrong once. W36's conformity reader.)*

Things we want *from* `fyflow-scheduler` go in [scheduler-upstream.md](scheduler-upstream.md), never
into a workaround comment.
