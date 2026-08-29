# ADR 0001 — Routing executes in the driver, outside the scheduler

**Date:** 2026-08-30
**Status:** accepted
**Raised by:** Q1

## Context

`fyflow-scheduler` has no dependency graph and no ordering (`AGENTS.md` section 1), so every
ordering primitive this repo promises is ours to build. That leaves a real choice about *where the
building happens*, and only three places exist:

**(a) A driver outside the scheduler** — subscribe to task outcomes, evaluate the edge, dispatch the
next node. **(b) In-worker spawn** — a worker calls `context.spawnTask()` for its own next step.
**(c) Hybrid** — spawn the straight-line hops, use a driver at decisions and joins.

Two facts about the library decide it. First, **spawn cannot join**: it is lineage rather than
dependency (`AGENTS.md` section 7), and the closest thing to a barrier,
`onCompleteDescendants()`, does not reject when a descendant fails — so it can express no join
policy we would want. Second, **a worker that routes owns part of the flow definition**, which puts
the graph inside worker code where nothing can validate, render or version it.

## Decision

1. **The driver is the only component that touches the scheduler.** It is the only thing that calls
   `addTask`/`addTasks`, and the only thing that subscribes to scheduler or pool events.
2. **A worker computes; it does not route.** A node's worker returns a value and nothing more.
   `context.spawnTask()` is **not** used for flow control.
3. **Routing is a pure function** of `(definition, run state, outcome)`, evaluated in the driver. It
   returns the nodes to dispatch; it does not dispatch them.
4. **The driver is the only component with side effects.** Everything else — the definition, the
   fold, the predicates — is pure, which is what makes rule 3 checkable rather than aspirational.

## Consequences

**Easy.** Routing becomes testable with no scheduler, no workers and no timers: feed a fixture log
of outcomes to the pure function and assert the node sequence. That is ladder L2, and it is where
this repo's value is proved. Joins become possible at all. The flow definition stays in one place,
so it can be validated, rendered and versioned.

**Hard, and honestly so.** Every step transition is a round-trip through the driver, making it a
serialization point on a hot path — its `task.completed` listener must stay cheap, and at the
1000s-10000s scale in `FLOW_PLANNING.md` that is a measurement waiting to happen (Q19). The driver
also holds the only copy of run truth, so its failure is the run's failure until Q15 is answered.

**What a future reader will try.** Reaching for `context.spawnTask()` to skip a round-trip on a
"simple" A→B hop. It will look like a free optimization and it is not: it creates a second source of
truth for what runs next, and the moment that hop is later placed inside a fan-out region it cannot
be joined. Rule 2 exists to make that a review finding rather than a discovery.

## Alternatives rejected

| | why not |
|---|---|
| **(b) In-worker spawn** | Cannot join — spawn is lineage, and `onCompleteDescendants()` does not reject on a descendant failure. Also scatters the flow definition across worker code, where it cannot be validated, rendered or versioned |
| **(c) Hybrid** | Two sources of truth for "what runs next". The performance argument is real but unmeasured, and it buys back a round-trip at the cost of the one property (rule 1) that makes L2 and the join possible |
