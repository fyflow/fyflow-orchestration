---
id: ADR 0101
title: "A task that declares a transform is not held to its worker's inputSchema at start, and tryTransform on the payload is the check before a run"
status: accepted
date: "2026-10-16"
item: W170
raised-by: Q633, P34
supersedes: ""
amends: ""
resolves: Q633
---

# ADR 0101 — A task that declares a transform is not held to its worker's inputSchema at start, and tryTransform on the payload is the check before a run

**Status:** accepted — [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) stop-and-ask (a), the
maintainer's (2026-10-16, *"as recommended"*: road 2 of [Q633](../questions/q633.md)), written by
[W170](../work-items/w170-a-transforming-task-is-not-held-at-start.md). It narrows `FD-R4`'s start boundary
(`spec/flow-definition.md` v0.40) and amends no ADR. **It does not resolve Q633 alone**: that question's `closes-when`
asks for an L6 run on real workers too, which is P34's exit artifact clause (6), W176. *(Run there, in node and deno,
and Q633 closed by [W176](../work-items/w176-the-exit-artifact-run-control-on-real-workers.md), 2026-10-17 — so `resolves`
names it from then: this decision is the answer, the L6 run its last evidence.)*

## Context

**`FD-R4` held a TRANSFORMING entry's payload before the transform** (P34 fact 10, Q633). The start boundary walks
`boundaryTargets`, composes each target's value through its `needs`, and holds that value to the worker's `inputSchema`.
A node's `transform` sits between the two and was never applied. Every other place in the spec reads `inputSchema` as
what the worker receives AFTER the transform: `FD-C5` (*`input` is the value this node receives*), `FD-C6` (the transform
is evaluated in the type's worker wrapper), the wiring table's `transform-passes`, and v0.38's `given` row. **So one
value got opposite verdicts.** Under `{ "label": word }`, `{ word: "x" }` was refused by `start()` and passed by
`tryTransform(…, { input })`. `{ label: "y" }` was admitted by `start()`, and its worker received `{}`.

**The constraint is that `start()` is synchronous and a transform's evaluation is not.** It runs in the language's
worker half, by `import()`. Holding the right value at `start` therefore means an async `start`. That is about 557 call
sites (P34 fact 10), and `FD-R4`'s *thrown at the caller* would become a rejection.

## Decision

1. **A boundary target that declares a `transform` is UNCHECKED at `start()`**, exactly as a target whose worker
   declares no `inputSchema` always was. This holds for every target of the walk: the entry task, a branch task of an
   entry fan-out, a map's branch task, and an entry gate's chosen route target. The walk goes on to the other targets,
   so a transforming branch never excuses an untransformed one beside it.
2. **The value `FD-R4` holds is what the node RECEIVES.** For an untransformed task that is the composed payload, as
   before. For a transforming task it is the transform's result, which exists only in the worker, so `start()` holds
   nothing there.
3. **The check before a run is the caller's, and it already exists.** It is `givenVerdict(registry, flow, task,
   received)`, which is `tryTransform(registry, flow, task, node.transform, { input: received })` on the node as declared
   (W166). It is called on each transforming TARGET, never on a fan-out, map or gate entry, which is no task and returns
   `[]`. `received` is the value that task RECEIVES, because a given value is `$` with no `needs` composed: the payload
   composed through the task's `needs` (at an entry only `"."`, so `needs: { own: "." }` receives `{ own: payload }`),
   and for a map's branch each element under `over`. `boundaryTargets(flow, payload)` lists the targets and the value
   reaching each. It is asynchronous, it is named, and on `transform-passes` it gives the verdict the worker's schema
   would give. An `unchecked` verdict checked nothing. *Check, then start.*
4. **At run time, what is left is the transform's own failure and the worker.** A transform that throws is a
   `TransformFailed` task failure (P17 decision 5). A result the worker's schema would refuse reaches the worker
   UNCHECKED, which may fail on it or complete on it, as Q633's `{ label: "y" }` completed with the worker receiving
   `{}`. That is the road a worker with no `inputSchema` takes.
5. **The `resolve` boundary is unmoved.** A transform changes what a worker receives and never what it returns, so a
   parked transforming node's `done` value is held to its worker's `outputSchema` as any other node's is.

## Consequences

- **Not breaking, and no type changes.** A payload `start()` refused on this road at 0.7.0 is admitted now, and no
  payload it admitted is refused. A consumer who relied on `BoundaryRefused` for a transforming entry loses that check
  and must call rule 3's function. `AGENTS.md` sections 9, 10, 11 and 15 say so.
- **`start()` and `tryTransform` no longer disagree, because `start()` no longer answers.** That is the price. A wrong
  payload on a transforming entry is no longer refused at the caller. It may fail in the run, or reach the worker
  unchecked and complete. The opposite verdict is gone, and so is the start-time refusal on this road.
- **What a future reader will try: making `start` async "just for transforming entries".** That is road 1, priced
  above. The shape of `start` would then depend on the flow. This ADR's rule 3 is the road that leaves `start` alone.
- **The static report is unchanged.** `checkWiring`'s `entry` still lists every target, transforming or not. It names
  where a payload lands and says nothing about holding a value there.

## Alternatives rejected

| | why not |
|---|---|
| **(1) An async `start`** that evaluates the transform in the main realm before holding the boundary | the one road that HOLDS the value, at about 557 call sites (`Driver.start`, `Runtime.start`), BREAKING; `FD-R4`'s *thrown at the caller* becomes a rejection and the `RunHandle`'s timing changes with it |
| **(3) A separate schema for what the transform receives** — on the node or on the type | a new keyword, a new spec row, and a second schema an author must keep in step with `inputSchema` |
| **Keep holding the payload before the transform** (today's behaviour) | a correct payload is refused and a wrong one admitted on one value, the defect Q633 measured |
