---
id: ADR 0103
title: "Every halt shares one dispatch hold, checked where a node is entered, a task dispatched and a resolution routed"
status: accepted
date: "2026-10-16"
item: W172
raised-by: Q605, P34
supersedes: ""
amends: ADR 0094 rule 3
resolves: Q605
---

# ADR 0103 — Every halt shares one dispatch hold, checked where a node is entered, a task dispatched and a resolution routed

**Status:** accepted — [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) decisions 5 and 8, the
maintainer's (2026-10-14/15, and the plan's declaration answered *"as recommended"* 2026-10-16), written by
[W172](../work-items/w172-the-dispatch-hold-and-q605.md). It defines `spec/run-state.md` v0.17's `RN-R29` and amends
[ADR 0094](0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md) — rule 3, whose
*"NOT the two that `OR-R10` does not shut either"* it makes false, and consequence 6, whose two open doors it shuts (the
front matter's `amends` names the rule; its grammar has no form for a consequence). It is the mechanism ADR 0104 (cancelling a run), ADR 0105 (stopping one) and ADR 0106
(pausing one) are to reuse.

## Context

**A run has two halts today and both shut the same doors** — a refusal (`OR-R10`, the run `halted`, `failed` set) and
the first `cancelled` settlement (`RN-R28`, `cancelled` set). Each door read `this.failed || this.cancelled` on its own:
a settlement after its append, a join after its `joinSettled`, `resolve()` at its entry.

**Two doors read nothing** ([Q605](../questions/q605.md), W158's two readers). The driver calls a consumer's
`onFoldInput` synchronously from inside its own step, and that callback can halt the run — `cancel()` of a WAITING task
fires `task.cancelled` inside the call, and a refusal it reaches calls `failRun`. Measured as P34 fact 1, identically in
node and deno, for a cancel AND a refusal: (a) on a fan-out's first branch's `dispatched` element, the remaining
branches were still entered and handed to the scheduler; (b) on a resolution's element, its `branch.resumed` was still
emitted and its successor still dispatched. W172's declaration re-measured both at L2, on a `map`'s first instance
too: every held case red, each beside a green control (W172 M2).

**P34 needs a hold that every halt SHARES** (decision 5): its cancel and its stop hold the run for good, and its pause
holds every dispatch until unpause. The replay already holds in a third way — it appends a dispatch and defers handing
it on (`RN-R19`) — and a pause must hold that way too, because a dispatch held BEFORE its append reads to the fold as
work that was never routed (P34 fact 3).

## Decision

1. **ONE predicate is the hold for good: `shut()`**, `failed || cancelled` today. *(Since
   [ADR 0104](0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md) (W173) the request joins it,
   and the resume loop reads it through `holdsResume()` — `shut()` less the request — rather than a copy of the flags.
   And since [ADR 0105](0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md) (W174) a TAKEN
   stop joins it — the one halt that is NOT shut on the stack of the driver's own step: a stop called mid-step is taken,
   and so holds, only when that step ends, because a hold there would drop routing a resume cannot re-dispatch.)* Every door that dispatches, routes or
   reports a routing step reads it, and a halt P34 adds joins the disjunction rather than adding a door. It is a
   METHOD over the halt flags, never a field: a second copy of *the run is halted* is a value that can disagree with
   `failed` or `cancelled`, each of which has readers of its own (`hasFailed()`, `onRunFailure`).
2. **It is checked at the HEAD of a dispatch, before the `dispatched` element**, so a halted run appends no dispatch.
   **It is REACHED in its own right**, not only behind rule 3: between the head of `enter` and here the driver composes
   what the node receives (`FD-C1`), and composing a `needs` clones the value — `start()` hands `enter` the caller's
   own payload — which runs that payload's getters, consumer code that can halt the run (W172's adequacy reader; an L2
   case since). It is also the dispatch's own door, where P34's pause adds the deferring form.
3. **It is checked at the HEAD of `enter`**, for every node kind. This shuts door (a): a fan-out's and a `map`'s
   branches are entered one call each, so the second is not entered once the first's element halted the run. One check
   rather than one per loop, so no arm — a region opened, a gate decided, a path ended, a join asked — runs for a halted
   run, whichever caller reached it.
   **A TASK branch is held by rule 2's check as well**, so door (a)'s fan-out and map branches are held twice and
   either check alone shuts them (W172's provocations K1, K2, C2); what only this check holds is a node that
   dispatches nothing — a gate's route ending at an `end`, asserted at L2.
4. **It is checked TWICE on a resolution: after its element, before its `branch.resumed`, and again before its
   routing.** This shuts door (b). A resolution whose own element halted the run stays ACCEPTED — `resolve()` returns
   `true`, its element is in the log — and is routed nowhere.
5. **The hold is checked at these doors and not after every element**, and what that leaves is stated rather than
   hidden (`RN-R29`): a halt raised on a task's own `dispatched` element hands THAT task on — the dispatch in progress,
   whose element `RN-R4` appends first — and holds the next; and, generally, a halt raised on ANY element appended
   mid-step lets the rest of that step's appends land up to its next check. Named and asserted at L2 (W172's
   conformity reader, C1): on `regionEntered`, the region's every `branch.opened` (`JP-R5`) and no branch entered; on
   `branch.arrived`, the join's `joinSettled` (fired) and no routing out; on `branch.lost`, the path's `pathEnded` and
   the join's `joinSettled` — and, where the policy answers unsatisfiable, `onUnsatisfiableJoin` still CALLED for the
   halted run. Every element that lands after a halt moves no outcome (`RN-R8`, `RN-R28`).
6. **The replay's hold keeps its form** (P34 decision 8): append, defer `addTask`. A hold for good appends nothing. The
   two are the hold's two forms, and `dispatch()` holds both.
7. **It is checked before EACH of `resume()`'s re-dispatches of the in-flight set** (`RN-R21`) — the maintainer's answer
   to W172's stop-and-ask S-1, 2026-10-16, which widens P34 decision 8's *three places* by this fourth. `resume()`
   appends `resumed` and then hands each in-flight task on (`addTask`'s second site, P34 fact 1); a consumer's callback
   on `resumed` — or a halt one hand-off reaches — halted the run there and every task was still handed on (W172 M4).
   Per re-dispatch, not once before the loop, so a halt raised inside one hand-off holds the rest.

## Consequences

- **ADR 0094 consequence 6 is withdrawn**: *two doors are not shut on the stack of a re-entrant halt* is false from
  v0.17, for a cancel and for a refusal alike. Q605 closes on its own `closes-when`.
- **No `Driver` field is added**, so `DRIVER_FIELDS` (`test/driver/retention.test.ts`, `examples/l6.ts`) does not move
  and `RN-R13` is not re-measured. P34's D′ sentence expected this item to move it.
- **No existing L2-L6 assertion moves** (P34 prediction 4): the doors leaked only on a re-entrant halt, which no case
  raised before W172's own.
- **What ADR 0104-0106 inherit**: a cancel and a stop each add their flag to `shut()` and every door follows; a pause
  takes rule 6's deferring form at rule 2's door. A pause must NOT join `shut()`, because a paused run still routes and
  still accepts a resolution. **W175 took the deferring form and did NOT join `shut()`** ([ADR 0106](0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md) decision 4): a paused run's dispatch passes `shut()`, is appended
  at rule 2's door, and is held for the unpause.
- **And a hazard ADR 0104 and 0105 inherit from rule 5's first residue** (W172's conformity reader, C2): a cancel or a
  stop raised on a task's own `dispatched` element runs BEFORE that task is handed to the scheduler, so its
  `scheduler.cancel(id)` names an id the scheduler does not hold — which resolves `false` and does nothing — and the task
  is then handed on and runs uncancelled. **W173 and W174 must cancel the in-progress task AFTER its hand-off** — for
  example by re-checking the hold after `addTask` in `dispatch` and cancelling there — and assert it at L2.
  **W173 did, for the cancel** ([ADR 0104](0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)
  rule 7): the task is cancelled after `addTask` returns, and a resumed run's in-flight set is handed on and cancelled
  rather than held — rule 7's check holds a halt and `RN-R28`'s cancel there, not a requested one. ~~W174's stop
  remains.~~ **W174 did, for the stop** ([ADR 0105](0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md)
  decision 9): by WHEN it is taken — at the end of the step — so the in-progress task, and a resumed run's in-flight set,
  are handed on first and then cancelled.
- **`settleJoin`'s own check is SUBSUMED for routing** since rule 3 — the join's successor is entered through `enter` —
  and is kept, stated, as the check before the region's collection is read and released (W172's adequacy reader
  measured its deletion equivalent: `failRun` and a cancel have released the collection already).
- **What a future reader will try: a check after every `append`.** It would make rule 5's residues vanish, and it
  would also stop a settlement of a task still in flight from being APPENDED after a halt — which `RN-R28` and `OR-R10`
  require, because the log is what happened. The doors are where the driver DECIDES to do more, and that is where the
  hold sits.
- **P34 decision 8's *three places* are FOUR** (rule 7): `resume()`'s re-dispatch loop was the second `addTask` site
  fact 1 found and the decision did not list. W172 measured the leak (M4) and asked; the maintainer answered YES. W174
  (a stop raised on the same stack) and W175 (a paused resume) inherit the check — **W175 does**: an unpause's hand-off
  of its held tasks reads it too, before each ([ADR 0106](0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md) decision 5).

## Alternatives rejected

| | why not |
|---|---|
| **Re-check inside each loop** — the fan-out's `forEach` and the map's | two checks for one rule, and a gate's route and a join's successor — entered after an append that can halt the run — would each need its own; `enter`'s head covers every caller |
| **A `held` FIELD set by every halt** | a second source for *halted*, which must be kept equal to `failed` and `cancelled` by every writer — the shape this repository keeps finding disagreeing with itself |
| **Patch the cancel alone** (W158's option) | the refusal leaks the same way (Q605's control), and the maintainer chose one mechanism for every halt (2026-10-15) |
| **Hold a dispatch by deferring it, as the replay does, for a halt too** | a halted run would then append `dispatched` elements for work it will never hand on, and the fold would read them in flight (`RN-R21`) — for a run that is not resumable |
