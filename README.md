# fyflow-orchestration

Flow orchestration over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler). Define a
flow once; run thousands of workloads through it.

> **Status: the layer is built and gated.** Sequence, decision routing, fan-out and join, with
> **three** join policies, a definition validator, and run state as a pure fold. **One driver serves one run, fixed at construction, and two drivers may share a scheduler — with anything else on it.** **410 assertions in five
> runtimes** — Node 24, Deno, chromium, firefox, webkit — **plus 373 against a real scheduler** in
> Node and Deno — where the scheduler also carries five tasks this library did not mint, and both
> runs still complete. Not published; no version has been released.
>
> *(`npm run gate` runs the browser rung in **chromium only**; firefox and webkit are
> `npm run test:browser:all`.)*

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

## The thing to know before reading the code

**`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no topological order —
its own reference lists them under *"Things that do NOT exist"*. Tasks are independent and run as
soon as a worker slot and their resource limits allow.

So every ordering primitive above — sequence, decision, fan-out, join — **is built here**, not
wrapped from below. The scheduler contributes execution, pooling, resource limits and retry. It
contributes no control flow at all.

This matters because the planning document that seeded this repo
(`../fyflow-scheduler/FLOW_PLANNING.md`) assumes the opposite throughout. See
[doc/concept.md](doc/concept.md) section 2 for the evidence.

## The one structural idea

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

The same invariant the sibling
[fyflow-react-components](https://github.com/fyflow/fyflow-react-components) is built on, adopted
deliberately. It is what makes a flow testable with no scheduler, no workers and no timers — feed a
fixture log of task outcomes, assert where the run went — and what keeps durable runs an additive
change rather than a rewrite.

It became executable in
[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md): the driver
produces one ordered input sequence, and `fold(driver.foldInputs())` is the whole of turning a run
into run state.

## What is here

| | |
|---|---|
| **Flow definition** | nodes bound to worker types, decision edges, fan-out and join — one template, many runs. **22 validation refusals** — **nested fan-out is expressible since `FD-V15` was retired, and a task inside a nested region is dispatched at its whole dotted `branchPath`** over the id range `FD-V1` … `FD-V24`, every one with a failing example — `FD-V14` is deliberately absent |
| **Driver** | the only component that touches the scheduler: subscribes, routes, dispatches. The library imports the scheduler **nowhere** — a caller passes its own in |
| **Run state** | a fold: where a run is, what each node returned, what a join is waiting on. **Six outcomes**, including `stuck` |
| **Join policies** | `live-token`, `arrival-count` and `live-token-requiring-arrival`, behind one interface, all three shipped. **Pass `live-token`** |
| **Examples** | [ladder L6](examples/) — **twenty-one** real runs on a real scheduler, in Node and Deno: a run in which **every branch is abandoned** under all three policies; two runs sharing one scheduler; and the same pair on a scheduler that also carries **tasks this library did not mint**, which used to stop every driver subscribed to it |

## The hard question, and its answer

**Q4 — what satisfies a join?** *"Wait for all the fan-out to return"* breaks the moment a decision
inside a branch routes it away from the join: the branch legitimately never arrives, an arrival
counter never completes, and the run hangs with no error — while the scheduler reports itself idle.

Live-token accounting answers that, and **the argument was refused as sufficient.**
[P1](doc/plans/p1-what-satisfies-a-join.md) built both policies behind one interface and let the case
decide, as a test.

**[ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md): a join
is satisfied when its region has no live branches, having had at least one.** The result was larger
than the question — arrival-counting fails on **six of nine** matrix rows, not on the one exotic
case, and **an ordinary `optional` task failing is enough**. Fixed-`N` is wrong whenever *"how many
will arrive"* differs from *"how many opened"*, and every non-success outcome makes it differ.

**The follow-up question, and its answer.** That decision recorded one cost: on a flow where *every*
branch is routed away, `live-token` fires a join **no branch reached** and carries `null` into
whatever comes after it. Two one-line refinements of the two policies had been written into `spec/`
before either existed, precisely so nobody could quietly apply one and call it a repair.
**[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
answers both, differently.** The refinement that declines a join with zero arrivals is **built, as a
third policy under its own name** — `live-token-requiring-arrival`, which reports the join as
unfireable and folds the run to `stuck` instead of `completed`. The refinement that would make
arrival-counting survive P1's case is **refused**: measured over the whole matrix, it is `live-token`
weakened, and every row on which they differ is a row where it waits forever.
**`live-token` and `arrival-count` are unchanged**, so this adds a name and breaks nothing.

**A driver's scheduler may carry work this library did not mint.**
[ADR 0027](doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md): a
settlement whose task id does not parse was minted by **no** driver, so it is reported through
`onUnmintedTask` and dropped rather than stopping the run. Until it, one plain non-flow task settling
— a nightly cleanup, another library's work, a worker's own `spawnTask` child — stopped **every**
driver subscribed to that scheduler, on the very topology the line above recommends. The one
remaining condition is that drivers sharing a scheduler have **different run ids**, which nothing can
enforce and which the library's own error message now says.

## Running it

Node **24** (`.node-version`, selected with fnm) and a current Deno.

```bash
npm install
npm run gate
```

**`npm install` is all the setup there is.** [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler)
is pinned to **0.3.0** and installed from **npm**; Deno reaches the same version on JSR as
`@fyflow/scheduler`, which is why `examples/deno-import-map.json` exists. That is a development
dependency only: **the published library depends on the scheduler not at all** — `SchedulerLike` is a
two-method structural interface and a consumer passes its own scheduler in, at whichever version it
wants. [ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rule 1, and [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
for how it is reached.

| | |
|---|---|
| `npm run gate` | everything below, in order |
| `npm test` · `npm run test:deno` · `npm run test:browser:all` | 410 assertions, five runtimes |
| `npm run test:l6` · `npm run test:l6:deno` | a real scheduler, 19 runs |

## Documentation

**Using the library: [AGENTS.md](AGENTS.md)** — the reference. Twelve sections, from a minimal
working program to what does not exist. **Every snippet in it is extracted, typechecked and executed
by `npm run gate`**, so a stale snippet is a failing gate rather than a lie. That covers **about 16%
of the document**; what the other 84% is allowed to be, and why, is
[P3's Record](doc/plans/p3-a-consumer-reference-the-gate-keeps-true.md).

**Working on the library: [doc/README.md](doc/README.md)** — current state, reading order, and what
happens next.

- [doc/concept.md](doc/concept.md) — what we are building and why
- [spec/](spec/README.md) — **the normative layer**: six documents, 72 numbered rules, 29 hand-written examples
- [doc/decisions/](doc/decisions/) — ten ADRs, one carrying an in-place *Correction*
- [doc/plans/](doc/plans/) — P1-P4 complete
- [doc/open-questions.md](doc/open-questions.md) — the register
- [doc/workflow.md](doc/workflow.md) — how work is planned, split and verified
- [doc/scheduler-upstream.md](doc/scheduler-upstream.md) — what we want from the scheduler

**How the work is done is itself documented and is unusual**: every change is a declared work item
with its own gate, and every one is read afterwards by two reviewers who did not write it — one
against the spec, one by mutation. **Twenty-one such passes have run and not one has come back empty.**

## Licence

MIT, as declared in `package.json` and `deno.json`. **There is no `LICENSE` file yet.**
