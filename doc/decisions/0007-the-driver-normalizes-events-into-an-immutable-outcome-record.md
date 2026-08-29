# ADR 0007 — The driver normalizes every scheduler event into an immutable outcome record

**Date:** 2026-08-30
**Status:** accepted
**Raised by:** Q31, reading `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` §11

> **Id note.** 0003-0006 are reserved by [P1](../plans/p1-what-satisfies-a-join.md) and 0003 is held
> for Q4's answer. This decision did not come from P1's work items — it arrived from an upstream
> document — so it takes the next number outside P1's block. Gaps are free
> (`doc/workflow.md` section 3).

## Context

Our core invariant is that run state is a pure fold of an ordered outcome log
(`doc/concept.md` section 5). A log implies its entries do not change after they are written. Two
facts about `fyflow-scheduler` 0.2.1 say otherwise, and both were verified in the source rather than
taken from the document that raised them.

**1. Event details are live references, not snapshots.** For `task.running`, `task.completed`,
`task.failed` and `task.user_action` the detail **is** the `FyflowTask` object
(`core/FyflowScheduler.ts:727, 775, 777, 974` — `detail: task`), and for `scheduler.completed` it is
`this.stats`, mutated in place (line 320). `arr.push(e.detail)` is the natural thing to write, and
every entry then reads whatever the object holds later. Nothing throws.

For us this is worse than for a viewer: it would make our "log" a bag of aliases to mutable state,
and **ladder L3 — fold the same log twice, deep-compare — would fail non-deterministically or, far
worse, pass while the log silently tracked live objects.** `task.progress` is unaffected; its detail
is `{...task, ...}`, a shallow copy.

Upstream has **declined to fix this in code**: `RESOURCE_EVENTS_PLAN.md` §10 lists *"freezing event
details"* under Not doing, on the grounds that defensive copying on a hot path is the wrong trade
for a zero-dependency library. That is a defensible call for the library and it makes the obligation
ours. Recorded as [S8](../scheduler-upstream.md).

**2. A non-optional task out of retries dispatches *two* events, and the first one lies about its
name.** At `core/FyflowScheduler.ts:764-778`, in this order:

```
task.state = 'user_action'            // set BEFORE either dispatch
dispatchEvent('task.failed',      { detail: task })   // detail.state is already 'user_action'
dispatchEvent('task.user_action', { detail: task })   // same object, again
```

So `task.failed` fires for a task that did **not** fail, its detail already reads
`state: 'user_action'`, and a second event follows carrying the same object. An optional task takes
the other branch: `state = 'failed'`, `resolve(null)`, and **only** `task.failed` fires.

A driver that treats `task.failed` as "this node failed" therefore double-counts every
`user_action`, and routes a human-intervention case down an error edge.

## Decision

The driver converts the scheduler's event surface into our outcome log at the listener boundary, and
nothing downstream of that boundary ever sees a library object.

1. **Copy synchronously, in the listener.** Every field the log needs is read and copied while the
   listener runs. **No `e.detail`, and no object reachable from it, is ever retained.** Listeners are
   called synchronously, so reading at that moment is correct; storing the reference is not.
2. **The outcome record is keyed on terminal state, not on event name.** `task.failed` with
   `detail.state === 'user_action'` is **not** a failure — it is the precursor to the
   `task.user_action` that follows for the same task. Exactly one outcome record is written per task
   settlement.
3. **`scheduler.completed` is never retained**, and its detail is never treated as a per-run signal.
   It is `stats`, mutated in place, and it fires every time the scheduler drains — routinely,
   between our steps.
4. **A library-supplied `timestamp` lives in its own field**, separate from the driver's arrival
   stamp, from the first version. The two are not interchangeable and the gap between them is the
   listener's own latency.
5. **`task.progress` gets the same treatment** even though its detail is already a copy. A uniform
   boundary is cheaper to review than a documented exception, and the exception is upstream's to
   change.

## Consequences

**Easy.** The log is genuinely a log, so L3 determinism becomes a real check rather than a check
that passes for the wrong reason. Fixtures become hand-writable, because an outcome record is plain
data with no library types in it (`doc/workflow.md` section 5 rule 4). And rule 2 means `user_action`
is handled once, deliberately, rather than arriving as a duplicate failure — which is the
[Q17](../open-questions.md) hole that two repos independently left open.

**Hard, and it is a direct tension with [ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md).**
That ADR puts the driver's listener on a hot path and says it must stay cheap; this one adds an
allocation and a copy to every event on that path. Both are right and the tension is real: it is
resolved by copying *only the fields the log declares*, never by a deep clone of a `FyflowTask`, and
by [Q19](../open-questions.md) measuring it rather than assuming.

**What a future reader will try.** Writing `log.push(e.detail)` — or a "harmless" `{...e.detail}`
shallow spread, which copies the top level and still aliases `payload`, `result` and `error`. The
first is caught by review; the second looks like compliance with rule 1 and is not. The spec's
outcome-record shape is what makes the difference checkable, which is why rule 1 names *fields*
rather than *a copy*.

**Version-sensitive.** All of this is read off 0.2.1. `RESOURCE_EVENTS_PLAN.md` §5 will add
timestamps to the five events that lack them, which rule 4 already anticipates, and §11 will
document the live-reference behaviour in `AGENTS.md`. **Neither changes the behaviour this ADR
guards against**, so the decision survives the bump. Re-check rule 2's line numbers, not its
substance.

## Alternatives rejected

| | why not |
|---|---|
| **Ask upstream to freeze or copy details** | Already declined — `RESOURCE_EVENTS_PLAN.md` §10, defensive copying on a hot path is the wrong trade for a zero-dependency library. Recorded as [S8](../scheduler-upstream.md) so the record shows it was considered and answered rather than missed |
| **Copy lazily, only when a fold actually runs** | There is no safe moment later. The object may have been mutated, evicted by `maxCompletedTasks`, or overwritten by a reused id before anything reads it |
| **Treat `task.failed` as authoritative and ignore `task.user_action`** | Reads the right state today by accident — `detail.state` is already `user_action` at dispatch — but encodes a dispatch-ordering detail as a contract, and silently maps a fifth state onto a fourth |
| **Subscribe to `task.user_action` only, and ignore `task.failed`** | Loses the optional-task failure entirely, which fires `task.failed` alone |
