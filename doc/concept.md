# Concept

**Status:** v0.1 - written 2026-08-29, before any code exists
**Read this before any plan.** It states what we are building, the one fact about the substrate
that shapes everything, and the one structural idea the rest of the repo hangs off.

---

## 1. What this repo is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**.

A user defines a **flow**: a task enters, passes through workers, and **decision blocks** route it
onward based on what a worker returned. Routing can **fan out** into parallel branches and later
**collect** them at a join. Flows are instantiated per workload, thousands at a time.

The scheduler runs tasks. This repo decides *which task runs next, and why*.

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

Verified rather than assumed, at `fyflow-scheduler` 0.2.1:

| Claim | Evidence |
|---|---|
| No dependency field on `FyflowTask` | No `dependsOn`/`parents` in `core/FyflowScheduler.ts`; the only hits are `spawnedChildren`, which is lineage |
| `SpawnTaskConfig.parents` exists but is **dead** | Declared at `core/workerInterface.ts:50`, read **nowhere** in the repo. The spawn path (`core/FyflowScheduler.ts:1015-1020`) constructs the task from `id`, `workerType`, `payload`, `optional`, `retryPolicy`, `workerGroups` and **silently drops `parents`** |
| Spawning is not sequencing | `AGENTS.md` section 7: *"This is lineage, not a dependency: spawning never changes dispatch order."* |

That dead field is the worst kind: it typechecks, it reads like the feature exists, and it does
nothing. Recorded as [S1](scheduler-upstream.md).

**So every ordering primitive this repo promises - sequence, decision, fan-out, join - is ours to
build.** The scheduler contributes execution, pooling, resource limits and retry. It contributes no
control flow at all.

## 3. What the scheduler does give us

| Surface | What we get |
|---|---|
| `addTask` / `addTasks` | dispatch, with `{ createPromise: true }` for a settled result. Throws on unknown `workerType` |
| Events | `task.running`, `task.completed`, `task.failed`, `task.progress`, `task.user_action`, `task.spawn_request`, `scheduler.completed` |
| `FyflowTask` after the run | `state`, `result`, `error`, `attempts`, `startTime`, `endTime`, `executionTime` |
| Resource groups | `ConcurrentLimitGroup`, `RateLimitGroup`, `KeyedRateLimitGroup` - per-task and per-worker (`residentGroups`) |
| Retry | `retryPolicy: { maxRetries, backoffMs }`, per task |
| Spawn | `context.spawnTask()` from inside a worker, plus `onCompleteDescendants()` |

And these constraints, which are design inputs rather than annoyances:

1. **Task states are `pending -> running -> done | failed`, plus `user_action`** for a non-optional
   task out of retries. Five, not four. A flow that models four is wrong.
2. **`scheduler.completed` fires every time the scheduler drains.** It is not "the run finished" -
   with a flow, the scheduler will drain between steps routinely.
3. **Reusing a task id overwrites.** Silently. Our id scheme is a correctness concern (Q13).
4. **A queued task cannot be cancelled.** Not implemented. So cancelling a run cannot un-queue what
   is already dispatched ([S2](scheduler-upstream.md)).
5. **`maxCompletedTasks` evicts terminal tasks** from `scheduler.tasks` with no event to say so.
6. **Groups are optimistic** - a limit can be briefly exceeded. Nothing here is a hard cap.
7. **`onCompleteDescendants()` does not reject when a descendant fails**, only when the tracked task
   does. It is not a join.

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

**The join is the hard one.** "Wait for all the fan-out to return" has more than one meaning, and
the interesting case is a **decision inside a fan-out branch that routes away from the join** - a
static "wait for N arrivals" then waits forever. Live-token accounting answers it; expected-arrival
counting does not. Q4-Q7.

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
| Join | live-token accounting | it is the only form that survives a branch being routed away | **not decided.** The argument was refused as sufficient; [P1](plans/p1-what-satisfies-a-join.md) builds both policies and lets a test decide |
| Run state | a fold of an event log | keeps persistence additive | **still a leaning** — Q14, tested by P1's W2 |

The join row is the one to notice. Two leanings won on arguments drawn from the library's own
behaviour; the third rests on a hypothetical case nobody has run, which is a different quality of
evidence wearing the same confident prose.

## 7. Explicit non-goals for the first set

- **Durable runs.** In-memory first, matching the scheduler. The fold invariant is what keeps this
  cheap to add later; building it now is premature (Q15).
- **Distribution.** One orchestrator, one scheduler, one process.
- **An expression language** for decisions. Registered predicates instead, if Q2 lands that way.
- **A visual flow editor.** Definitions are authored in code or a document.
- **Controlling a run from a UI** (pause, cancel, retry a node). Read-only observation first - and
  [S2](scheduler-upstream.md) is missing anyway.
- **Ingestion transports.** Kafka and friends from `FLOW_PLANNING.md` are a consumer of this
  library, not part of it.
- **Supporting more than one `fyflow-scheduler` version.** We pin **0.2.1** (Q3), the same version
  `fyflow-react-components` pins.

Things we want *from* `fyflow-scheduler` go in [scheduler-upstream.md](scheduler-upstream.md), never
into a workaround comment.
