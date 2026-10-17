---
id: ADR 0105
title: "A run its owner stops is recorded, goes deaf before it cancels, and resumes on another runtime"
status: accepted
date: "2026-10-16"
item: W174
raised-by: P34
supersedes: ""
amends: ADR 0058 rule 3; ADR 0091 rule 3; ADR 0103
resolves: ""
---

# ADR 0105 — A run its owner stops is recorded, goes deaf before it cancels, and resumes on another runtime

**Status:** accepted — [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) decisions 3 and 9 (the
maintainer's, 2026-10-14/15) and stop-and-asks (d), (h) and (i), answered *"as recommended"* 2026-10-16; written by
[W174](../work-items/w174-stopping-a-run-to-resume-it-elsewhere.md). It defines `spec/run-state.md` v0.19's `RN-R32` and
`RN-R33`. It amends [ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md) rule 3 (what settles
`done`) and [ADR 0091](0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md) rule 3 (which
run is released), and acts on [ADR 0103](0103-every-halt-shares-one-dispatch-hold.md)'s inherited hazard for the stop
(the front matter's `amends` names the ADRs; its grammar has no form for a consequence). **Decision 2's order — DEAF
with the hold, BEFORE the `interrupted` element — reverses the order P34 (d) lists, as answered on 2026-10-16; the
maintainer RATIFIED the reversal on 2026-10-16** (*"Yes from my side"*, on W174's reader round), so it is the answer and
not an override of it. Decision 4 (a mid-step stop taken when the step ends) needed none: the plan left a mid-step stop
open.

## Context

fyflow-app's #18 (P2, M2): stop ONE run on a runtime — its Upgrade, *stop them and continue* — and resume it elsewhere,
`done` settling as stopped and the log a valid checkpoint. Nothing could: a cancel ends a run for good (ADR 0104), and a
run can be live with NOTHING in flight — parked at `user_action` (P34 fact 4) — so a stop that only cancelled tasks
would stop nothing there, while `resolve()` on the old runtime still routed it (the app's ADR-0015 hole).

Four facts bind the shape. A cancel's `task.cancelled` is a SETTLEMENT, and a settled task is not in flight (`RN-R21`),
so a resume would not re-run a task the stop cancelled if the driver heard it (P33 decision 4). The scheduler settles a
waiting or backing-off task INSIDE its `cancel()` call (P34 fact 8), so "do not hear it" must be true before the first
call. `done` settles on terminality (ADR 0058 rule 3), and a deaf driver appends nothing after the stop, so the fold
cannot say when the tasks have stopped. And a run id stays in use on the runtime that built its driver (ADR 0091 rule 2).

## Decision

1. **`driver.stop({ actor, reason?, graceMs? }): Promise<void>`, forwarded by `RunHandle.stop()`** (P34 (d)) — one run, on
   its driver, touching no sibling: the scheduler cancels by task id, and every id the driver sends is its own run's. It
   resolves once every task it cancelled has stopped.
2. **In order** (P34 decision 3): refuse by name before anything is recorded or sent (`RunControlRefused`,
   `control: 'stop'` — `unsupported`, `not-started`, `halted`, `cancelled`, `ended` at rest only; a bad `graceMs`
   `TypeError`/`RangeError`); then HOLD (`RN-R29` — the stop joins `shut()`, every region's collection is released) and set
   **DEAF**; append ONE `{ kind: 'interrupted', actor, reason }`; and only then `scheduler.cancel(id, { reason, graceMs })`
   for each task in flight the scheduler holds. *Deaf BEFORE the element, not after it as (d) lists the steps* — a
   reading of the order the plan did not settle, taken here: a settlement a consumer's callback on the element provokes
   would otherwise be appended after the stop, routed nowhere (the hold), and never routed by the resume either, which
   re-runs only what is in flight — that task's routing lost. Deaf with the hold, the task stays in flight and runs
   again. *Deaf before the first cancel*, decision 3's point, holds either way. **Ratified by the maintainer,
   2026-10-16.** The in-flight set is read before the element (deaf and held, nothing can change it), and the cancels
   are sent in a `finally`: a consumer's `onFoldInput` that THROWS on the element still has the element in the log, so
   the tasks it says were stopped are cancelled and every stop promise settles — the throw then reaches whoever is on
   the stack (W174's conformity reader, finding 5). **No `task.cancelled` a stop causes is appended**, and the log ends with
   those tasks dispatched and unsettled — `RN-R21`'s in-flight set.
3. **`resolve()` is refused from the accepted call on** (P34 decision 9): a stopped run's parked task is resolved on the
   runtime that resumes it, never on the one that stopped it. A cancel after a stop is refused `interrupted` (a new
   reason); a stop after a cancel — `RN-R28`'s or a requested one — is refused `cancelled` (P34 (c)).
4. **Steps 2's hold, element, deafness and cancels are TAKEN AT REST.** A call at rest takes them at once; a call made
   MID-STEP — from a callback on the driver's own step — is accepted, refuses `resolve()` and `cancel()` at once, and is
   taken when that step ends. *A reading the plan did not settle, taken by this ADR*: a hold taken mid-step drops the rest
   of the step's routing — a fan-out's later branches, a settlement's successor — and a resume re-dispatches only what
   is IN FLIGHT, so that work would be lost to the resumed run for good (a `stuck` join, or a successor never
   dispatched). Taken at rest, the step is whole in the log, the `interrupted` element always lands BETWEEN two steps,
   and the replay reaches it there. A cancel needs no such rule — its run never resumes — and keeps ADR 0104's immediate
   hold.
5. **The fold reads a NINTH outcome, `interrupted`, from the element until a `resumed` element ends it** (`RN-R32`), and a
   CURRENT cell `RunState.interruption: { actor, reason } | null` — `regions[*].suspended`'s precedent: that a run was
   ever stopped is in the input sequence. **Terminal** (`isTerminal` unchanged), so `done` settles and the runtime
   releases the run; **NOT refused by a resume** (`RN-R23`). Nothing is written per task (P34 (i)).
6. **The precedence is P34 (h)'s, whole**: `halted` > `cancelled` > `cancelling` > `interrupted` > `awaiting_action` >
   `running` > `stuck` > `failed` > `completed`.
7. **A resume FEEDS the element** (`RN-R19`'s fourth fed kind) at its own position and holds the replay's routing from
   there — as the stopped run was held — until a fed `resumed` ends it; the stop's deafness, cancels and release are the
   stopped driver's and are not replayed. After the replay, `resumed` names the in-flight set and each task is handed on
   at the SAME id. The run id is still in use on the old runtime, so the resume is on a FRESH one — the app's Upgrade.
8. **On a runtime, `done` settles with `interrupted` once the stop's cancels have RESOLVED** — the only road, since a
   deaf driver appends no settlement. The runtime waits on every cancel the run's driver sent through the run's per-run
   view of the scheduler: the same promises `driver.stop`'s own promise waits on, so `handle.stop()` and
   `handle.driver.stop()` settle it alike. *A reading the plan did not settle* (it says *the runtime awaits the promise
   `driver.stop` returns*): observing the cancels at the view the runtime already hands the driver needs no new driver
   surface and covers the road that never passes through the handle. **Only `interrupted` waits**: a stop accepted
   mid-step whose step then HALTED or `RN-R28`-cancelled the run settles `done` `halted` or `cancelled` at once and
   releases the run, its cancels still sent — `done` reports the outcome, and a halted or cancelled run's tasks may run on
   unheard by construction (`RN-R12`).
9. **ADR 0103's inherited hazard, for the stop**: the task whose own `dispatched` element carried the call is handed on
   in its step and cancelled when the stop is taken — after its hand-off — and so is a resumed run's in-flight set when
   the call was made on its `resumed` element or in its replay's lost tail.
10. **`graceMs: 0` is a request, not a guarantee** (P34 (g), S12), as for a cancel; a second stop forwards its `graceMs` to
    each task still stopping and appends nothing.

## Consequences

- **BREAKING in 0.8.0** (P34 decision 10): `RunOutcome` gains `interrupted`, `FoldInput` gains `interrupted`, `RunState`
  gains `interruption`, `RunControlRefusalReason` gains `interrupted` and `RunControlRefused.control` gains `'stop'`, and
  `RunHandle` gains `stop` — breaking only code that BUILDS a `RunHandle`.
- **ADR 0058 rule 3** — `done` settles on terminality — gains its one exception: `interrupted` settles it, and only once
  the stop's cancels have resolved, not at the element.
- **ADR 0091 rule 3** — a run that has not settled is not released — holds; what moves is that a stopped run, terminal
  in its log, is held (and its driver deaf) until its cancels resolve, and released then (rule 1's moment, deferred).
- **ADR 0103 rule 1's `shut()`** gains the TAKEN stop; `holdsResume()` needs no change — a stop is never taken on the
  resume's own stack, and the replay's fed stop is cleared before its re-dispatch.
- **One `Driver` field**, `stopRequest` — the stop's options, one promise per task still stopping, and, only while a
  mid-step stop is pending, its resolver and promise; `DRIVER_FIELDS` moves by name. `deaf` is reused.
- **At-least-once, as `RN-R21` says**: a task whose worker finished on the old runtime before its cancel arrived runs
  again on the new one — its settlement was never heard. Workers must tolerate it, as they must across a crash.
- **For W175's pause** (P34 (e)): a paused run's held tasks are appended and never handed; a stop of a paused run
  cancels only what `handedOn` says the scheduler holds, so the held tasks stay in flight in the log and the resume
  re-dispatches them — and a resume FEEDS `paused`, which W175 adds to the fed kinds as this ADR adds `interrupted`.
  **W175 did** ([ADR 0106](0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md) decisions 7 and 8): the held tasks are sent nothing, and a resume HOLDS them again —
  a run stopped while paused resumes paused.

## Alternatives rejected

| | why not |
|---|---|
| **On the RUNTIME** — `runtime.stop(runId)` | a hand-built driver could not stop its run (P34 (d)) |
| **No element** — the log ends at the last settlement | `done` would settle a non-terminal state or never, and nothing in the log says the run was stopped (P34 (d)) |
| **`done` settles at the element** | the old runtime's tasks may still run while the new one re-runs them (P34 (d)) |
| **Deaf after the element** (the steps as (d) lists them) | a settlement provoked from a callback on the element is appended, routed nowhere, and its routing lost to the resume (decision 2) |
| **Deaf AFTER the cancels** | a waiting or backing-off task's `task.cancelled` fires inside the call and would be appended: that task is then settled, not in flight, and the resume never re-runs it (P34 decision 3) |
| **Hold mid-step, as the cancel does** | the step's remaining routing is dropped, and the resume cannot re-dispatch work that was never dispatched — measured as a branch never entered and a successor never dispatched (decision 4) |
| **Refuse a stop mid-step** | a consumer's own callback is the natural place to decide to stop, and the step's end is a point the driver already counts (`stepping`) |
| **`interrupted` above `cancelled`** | a run stopped and cancelled would read resumable (P34 (h)) |
| **A cumulative `interruptions` list** | the history is in the input sequence, as `branch.suspended`'s is; a current cell is what the outcome needs |
