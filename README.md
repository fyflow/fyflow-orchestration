# fyflow-orchestration

Flow orchestration over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler). Define a
flow once; run thousands of workloads through it.

> **Status: scaffolding.** There is no code yet. This repository currently holds the concept, the
> open-question register, the workflow, and the tracking system the work will run through.

## The idea

A task enters a flow and passes through workers. **Decision blocks** route it onward based on what a
worker returned. Routing can **fan out** into parallel branches and later **collect** them at a
join.

```
                       +--> [enrich] --+
  [ingest] --> <score?> |               +--> (join) --> [publish]
                       +--> [classify]-+
                        \
                         +--> [review]        (low confidence routes away entirely)
```

The scheduler runs tasks. This repository decides **which task runs next, and why**.

## The thing to know before reading the code that does not exist yet

**`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no topological order -
its own reference lists them under *"Things that do NOT exist"*. Tasks are independent and run as
soon as a worker slot and their resource limits allow.

So every ordering primitive above - sequence, decision, fan-out, join - **is built here**, not
wrapped from below. The scheduler contributes execution, pooling, resource limits and retry. It
contributes no control flow at all.

This matters because the planning document that seeded this repo
(`../fyflow-scheduler/FLOW_PLANNING.md`) assumes the opposite throughout. See
[doc/concept.md](doc/concept.md) section 2 for the evidence.

## The one structural idea

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

The same invariant the sibling
[fyflow-react-components](https://github.com/fyflow/fyflow-react-components) is built on, adopted
deliberately. It is what makes a flow testable with no scheduler, no workers and no timers - feed a
fixture log of task outcomes, assert where the run went - and what keeps durable runs an additive
change rather than a rewrite.

## What it will ship

| | |
|---|---|
| **Flow definition** | nodes bound to worker types, decision edges, fan-out and join - one template, many runs |
| **Driver** | the only component that touches the scheduler: subscribes, routes, dispatches |
| **Run state** | a fold: where a run is, what each node returned, what a join is waiting on |
| **Examples** | a real flow against a real scheduler, decisions and a join included |

## Where it actually is

Three questions gated everything. Two are decided:

| | |
|---|---|
| **[ADR 0001](doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)** | Routing executes in the **driver**, outside the scheduler. A worker computes; it does not route |
| **[ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)** | A definition is **data**; a decision edge names a predicate, resolved against a registry, failing at instantiation |

The third is **deliberately still open**, and it is the hard one.

**Q4 — what satisfies a join?** "Wait for all the fan-out to return" breaks the moment a decision
inside a branch routes it away from the join: the branch legitimately never arrives, an arrival
counter never completes, and the run hangs with no error — while the scheduler reports itself idle.

Live-token accounting answers that, and the argument was **refused as sufficient**.
[P1](doc/plans/p1-what-satisfies-a-join.md) builds both policies behind one interface and lets the
branch-routed-away case decide, as a test. If arrival-counting survives, the simpler mechanism wins.

## Documentation

Start at **[doc/README.md](doc/README.md)** — current state, reading order, and what happens next.

- [doc/concept.md](doc/concept.md) — what we are building and why
- [doc/decisions/](doc/decisions/) — ADR 0001, 0002, 0007 — the contract until `spec/` exists
- [doc/plans/p1-...](doc/plans/p1-what-satisfies-a-join.md) — the active plan
- [doc/open-questions.md](doc/open-questions.md) — the register (18 open, 5 resolved)
- [doc/workflow.md](doc/workflow.md) — how work is planned, split and verified
- [doc/scheduler-upstream.md](doc/scheduler-upstream.md) — what we want from the scheduler
- [spec/](spec/) — the normative layer (empty; the first plan fills it)

## Licence

Not yet decided.
