---
id: ADR 0104
title: "A run its owner cancels is held, recorded, and `cancelling` until its last task has stopped"
status: accepted
date: "2026-10-16"
item: W173
raised-by: P34
supersedes: ""
amends: ADR 0058 rule 3; ADR 0094; ADR 0103
resolves: Q18, Q606
---

# ADR 0104 — A run its owner cancels is held, recorded, and `cancelling` until its last task has stopped

**Status:** accepted — [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) decisions 1, 4 and 5 (the
maintainer's, 2026-10-14/15) and stop-and-asks (b), (c), (h), (i) and (j), answered *"as recommended"* 2026-10-16; written
by [W173](../work-items/w173-cancelling-a-run.md). It defines `spec/run-state.md` v0.18's `RN-R30` and `RN-R31` and
resolves [Q18](../questions/q18.md) and [Q606](../questions/q606.md)'s runtime row. It amends
[ADR 0094](0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md) consequences 4 and
7, [ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md) rule 3's reading of `done`, and acts on
[ADR 0103](0103-every-halt-shares-one-dispatch-hold.md)'s inherited hazard (the front matter's `amends` names the ADRs;
its grammar has no form for a consequence).

## Context

**A run could END cancelled, and nothing could cancel one** ([Q18](../questions/q18.md), deferred since P29 until the
scheduler could cancel a task — it can since 0.6.0). [ADR 0094](0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)
makes a `task.cancelled` the driver HEARS halt the run (`RN-R28`), and the first one settles a runtime's `done` while the
run's other tasks still run (P34 fact 6) — fyflow-app's #1 workaround. The app asked for `driver.cancel({ actor,
reason, graceMs? })`: hold, cancel every task, record it, and `done` once the tasks have stopped, visibly *cancelling* in
between, with a second cancel escalating as the scheduler's does.

Four facts bind the shape. `SchedulerLike` was two methods and some 38 hand-written doubles implement it (P34 fact 5).
The scheduler's `cancel()` settles a WAITING or BACKING-OFF task inside the call, a task not yet picked up by its thread
after it, a running one when its worker stops, and does nothing for a parked one or an id it does not hold (fact 8).
`done` settles on terminality alone (ADR 0058 rule 3, ADR 0091 rule 1). And a halt raised on a task's own `dispatched`
element runs BEFORE that task is handed to the scheduler (ADR 0103's inherited hazard, `RN-R29` (i)).

## Decision

1. **`SchedulerLike` gains an OPTIONAL `cancel?(taskId, options?): Promise<boolean>`** — the scheduler's own signature
   (P34 (b)). A `FyflowScheduler` satisfies the seam unchanged; no double breaks; the runtime's per-run view forwards it,
   so the cancel is the DRIVER's side effect on a runtime exactly as on a hand-built driver (ADR 0001).
2. **`driver.cancel({ actor, reason?, graceMs? }): Promise<void>`, in order** (P34 (c), decision 4): refuse by name
   BEFORE anything is recorded or sent; HOLD (`RN-R29` — the request joins `shut()`, and every region's collection is
   released); append ONE `{ kind: 'cancelRequested', actor, reason }`; then `scheduler.cancel(id, { reason, graceMs })`
   — each key only when given — for each task in flight the scheduler holds. Its promise resolves once every task it
   cancelled has stopped.
3. **Refusals, one class with a `reason`** — `RunControlRefused`: `unsupported` (no `cancel` on the scheduler),
   `not-started`, `halted` (`OR-R10`), `cancelled` (`RN-R28` already ended it) and `ended` (nothing in flight, nothing
   parked — **at rest only**: mid-step, on the stack of the driver's own step, that prefix is the instant before the step
   dispatches more, so the call is accepted and the hold stops that dispatch — W173's conformity reader, D-1; the driver
   counts its own step depth for it). A bad `graceMs` is refused as the scheduler would refuse it — `TypeError`, `RangeError` — before step 2, so
   it cannot be raised half-way through the cancels with the element already in the log.
4. **The fold reads a new, NON-terminal outcome `cancelling`** from the element while any dispatched task is unsettled,
   and `cancelled` once none is (`RN-R30`). So `done` settles after the LAST `task.cancelled`, from the fold alone, and
   the runtime keeps routing the run until then — ADR 0091 rule 1 unchanged. A `cancelled` settlement after a request is
   the request's, not `RN-R28`'s.
5. **The precedence is P34 (h)'s**: `halted` > `cancelled` > `cancelling` > `awaiting_action` > `running` > `stuck` >
   `failed` > `completed` (`interrupted`, W174's, is to sit between `cancelling` and `awaiting_action`). A request folded
   after the run is already `cancelled` moves nothing and is not recorded — so the outcome is monotone across it.
6. **A PARKED task gets nothing** (P34 (i)): it is not in flight, the scheduler cannot end it, and no synthetic record is
   written for it. It stays `suspended`; the run does not wait on it; `resolve()` is refused.
7. **Every task's end is the scheduler's own settlement** (ADR 0007). So a task not yet handed on when the cancel
   arrives is handed on and THEN cancelled: the one whose `dispatched` element carried the call (`RN-R29` (i) — ADR 0103's
   hazard, closed) and a resumed run's in-flight set not yet handed back (`RN-R29` (4) does not hold those under a
   request: held, they would never settle and the run would read `cancelling` for ever). *(Since [ADR 0106](0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md) (W175)
   a third: each task a PAUSE held is handed on and then cancelled, in dispatch order — P34 (c).)*
8. **A second call appends nothing** and forwards its `graceMs` to each task still stopping — the scheduler's escalation.
   It is never refused for the halt its own first call made, nor for a refusal after it. **It resolves as the first does**
   — a microtask on, on every task still stopping — so a task not yet handed on when it was made is waited on too
   (W173's adequacy reader, D-2).
9. **Tasks a worker SPAWNED are not cancelled** (P34 (j)): the driver knows only what it dispatched.
10. **`graceMs: 0` is documented as a request, not a guarantee** (P34 (g), fact 9, S12 written and not raised): nothing in
    `src/` passes a `graceMs` but the caller's own.
11. **A stored `cancelRequested` element is refused by a resume as `cancelled`**, at the first element of either kind
    (`RN-R23`), so a run cancelled while parked — with no cancelled settlement at all — is refused too.

## Consequences

- **BREAKING in 0.8.0** (P34 decision 10): `RunOutcome` gains `cancelling`, `FoldInput` gains `cancelRequested`,
  `RunState` gains `cancelRequest`; `SchedulerLike`'s optional `cancel` breaks only a double declaring a `cancel` of
  another shape.
- **ADR 0094 consequence 4** (*no call that cancels a run, no `cancelling` run state*) is withdrawn by rules 2 and 4.
  **Consequence 7** (*on a runtime, "appended" stops at `done`*) holds for `RN-R28`'s cancel and not for a requested
  one: its `done` waits for every settlement. **ADR 0058 rule 3** — `done` settles on terminality — is unchanged as a
  rule; what moves is that `cancelling` is the third outcome it waits through.
- **ADR 0103's inherited hazard is acted on** (rule 7): the task in progress is cancelled after `addTask` returns, and
  the hold's check before each of `resume()`'s re-dispatches (ADR 0103 rule 7) now holds for `failed` and `RN-R28`'s
  `cancelled` and NOT for a request, which hands on and cancels.
- **Three `Driver` fields** — the request (its options, and one promise per task still stopping, dropped as each
  settles), the set of ids dispatched and not yet handed on, and the depth of the driver's own step (rule 3's *at
  rest*). None holds a result; `DRIVER_FIELDS` moves by name.
- **P34 prediction 5 is a claim about W160's L6 rows**: they cancel through `runtime.scheduler.cancel(id)` and request
  nothing, so `RN-R28`'s road and `done` at the first cancel are unchanged for them.

## Alternatives rejected

| | why not |
|---|---|
| **A REQUIRED `cancel` on `SchedulerLike`** | one shape, and ~38 doubles and four snippets break for a member most never call (P34 (b)) |
| **Reach through the runtime only** (`RunHandle.cancel()`) | a hand-built driver could not cancel its run, and the side effect leaves the driver (P34 (b)) |
| **`done` settles at the request** (P33's road) | no `cancelling`, and the app's #1 workaround stays (P34 (c)) |
| **`done` waits on the `cancel()` promises in the RUNTIME** | `done` and `fold(foldInputs())` disagree while tasks stop (P34 (c)) |
| **Record a second cancel as its own element** | every escalation is in the log and the fold gains nothing (P34 (c)) |
| **A `resolution` per parked task** | a resolution routes (`RS-R2`), which the hold must then suppress — a resolution that is not one (P34 (i)) |
| **Hold a resumed run's in-flight set under a request, as a halt does** | the tasks are `dispatched` and would never settle: the run reads `cancelling` for ever and `done` never comes |
| **Cancel the in-progress task before its hand-off** | the scheduler's `cancel()` of an id it does not hold resolves `false` and does nothing, and the task then runs (ADR 0103) |
