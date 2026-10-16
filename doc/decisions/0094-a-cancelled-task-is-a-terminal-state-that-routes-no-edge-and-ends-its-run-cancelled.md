---
id: ADR 0094
title: "A cancelled task is a terminal state that routes no edge, and it ends its run `cancelled`"
status: accepted
date: "2026-10-15"
item: W158
raised-by: P33
supersedes: ""
amends: ADR 0007 rule 2; ADR 0058 rule 3; ADR 0065 rule 2
resolves: ""
---

# ADR 0094 — A cancelled task is a terminal state that routes no edge, and it ends its run `cancelled`

**Status:** accepted — [P33](../plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) decisions 2-5 and 7,
stop-and-asks (a)-(e) ANSWERED by the maintainer on 2026-10-15 as recommended, (d) with decision 4's clause that
a stop goes deaf before it cancels; written by
[W158](../work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md). It amends
[ADR 0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 2 — *key on terminal
state* — by one state, and
[ADR 0065](0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md)
rule 2 — what a resume refuses before replaying — by one reason, and
[ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md) rule 3 — the outcomes that settle a
runtime's `done` — by one outcome.

## Context

**`fyflow-scheduler` 0.6.0, the pin [W157](../work-items/w157-the-pin-moves-to-0-6-0-behaviour-unmoved.md)
moved to, can end a task CANCELLED.** `scheduler.cancel(id)` stops a task waiting (queued, blocked on a group,
in a retry backoff) at once and a running one once its attempt stops; either way it ends in state
`'cancelled'`, whatever its attempt produced, is not retried or requeued, and fires **`task.cancelled` and no
other settlement event** — after `task.cancelling` if it was running, alone if it was waiting
(`core/FyflowScheduler.ts`: `task.cancelled` at `:1198` in `_finishCancelled`, reached from `_settleCancelled` at
`:1181` and from `_cancelUndispatched` at `:1268`, whose own call is at `:1312`; its `AGENTS.md` sections 5 and 6). Its promise rejects
with `CancelledError`, an `optional` task's too.

**Until this decision a cancelled task under a run was DROPPED and the run never ended** (P33 fact 1): the
listener's terminal set was `done`, `failed`, `user_action`, the driver subscribed only the three events that
carry them, and so the task stayed `running` in the fold for ever, the run never reached a terminal outcome,
and a runtime's `done` never settled. Nothing in the gate cancels, so no lane saw it.

**And the scheduler never cancels a task by itself** (P33 fact 9): `task.cancelled` is dispatched only from
`cancel()` and from a dispatched task's settlement after one; `shutdown()` removes every listener before it
stops the pools. So a cancel this library hears is one SOMEBODY ASKED FOR — the consumer, through
`runtime.scheduler.cancel(id)`. Fact 3 adds the last constraint: the driver passes no `createPromise`, so no
cancel rejects a promise of ours.

## Decision

1. **`cancelled` is a TERMINAL state, recorded verbatim, that routes NO edge.** The listener subscribes
   `task.cancelled`; its terminal set and `TerminalState` gain `cancelled`; one record is written for it,
   keyed on `d.state` as every other (`OR-R3`), with `result: null` by `OR-R2`'s own guard. `RoutableState`
   does **not** gain it, so `FD-V18` still admits only `done` and `failed` and `on: ["cancelled"]` is refused at
   construction. A cancel is the consumer's act on its run, not an outcome a flow branches on.
2. **`NodeState` gains `cancelled`**, copied from the record as `done` and `failed` are. Nothing resolves it:
   `RS-R1` reads a parked task as one whose last record is `user_action`.
3. **The first cancelled settlement HALTS the run, and the run is `cancelled`** — a seventh `RunOutcome`,
   terminal, ranked below `stopped` and above every other (`RN-R28`). The driver dispatches nothing further and
   routes no later settlement — exactly the doors `OR-R10` shuts for a refusal, a join firing on the same stack
   included, and NOT the two that `OR-R10` does not shut either (consequence 6) — *both shut since
   [ADR 0103](0103-every-halt-shares-one-dispatch-hold.md), which amends this rule: one dispatch hold every halt shares
   (`RN-R29`, W172)*; each later settlement of the run is still appended and routed nowhere, with no region event; a
   parked task stays parked and `resolve()` is refused; every region's collection is released (`JP-R12`'s
   run-level moment). **It is not a refusal**: no `stopped` element, no `onRunFailure`, `hasFailed()` false —
   the fold reads the outcome from the settlement. **A join the cancel left waiting is not `stuck`.** A runtime's
   `done` settles on this first cancel, while the run's other tasks may still be running unheard.
4. **`task.cancelling` writes nothing** (`OR-R4`, beside `task.running` and `task.progress`), and the driver
   does not subscribe it: it is a REQUEST, not a settlement. A run whose cancel the DRIVER requested is
   [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s, and is to be recorded as its own
   fold input there.
5. **A cancelled run is NOT resumable**: `ResumeRefusalReason` gains `cancelled`, for a stored `outcome`
   element whose record is `terminalState: 'cancelled'`, checked after `stopped` and naming the FIRST such
   element's position (`RN-R23`). Only a stored one can exist — a settlement is fed to the replay and never
   regenerated. **Its scope is any APPENDED cancel**, and the driver appends every `task.cancelled` it hears for
   its run; P34's STOP of a run is to make the driver deaf (the existing `deaf` flag) BEFORE it cancels, so a
   stop's cancels are never appended, its tasks stay in flight, and a resume re-dispatches them (`RN-R21`). That
   ordering is P34's to build and to test.

## Consequences

1. **Four published unions widen — `TerminalState`, `NodeState`, `RunOutcome` and `ResumeRefusalReason` —
   and each is BREAKING for a consumer switching on it exhaustively**, stated where it is widened, on `resumed`'s
   and `gated`'s precedent. **P33 prediction 4, measured by W158**: LOUD wherever a type constrains the value —
   on this tree one site, a test fake's `settle(state: 'done' | 'failed' | 'user_action')` handed a stored
   record's `TerminalState`, stopped compiling — and SILENT where a value is compared or counted: three runtime
   assertions counting the driver's subscriptions, a suite census, two driver-field ratchets and a comment, each
   of which compiled and then failed, or stayed green and false. They ship in 0.8.0 (P33, *Why*, decision 1).
2. **`stopped` keeps its meaning — today's HALT on a defect — and outranks `cancelled`**, in the fold and in a
   resume's refusal. A run refused AND cancelled reads as the defect. P34 renames `stopped`; this ADR's
   `stopped` is today's.
3. **A cancel nobody heard is not refused**: a run whose driver was released by its runtime when `done`
   settled (ADR 0091) hears no later cancel, and a resume of a checkpoint without the cancel resumes. The
   decision is about what was appended.
4. **What a run does NOT get**: no call that cancels a run (P34), no `cancelling` run state (P34), the cancel's
   `reason` not carried on the record (the record stays eleven fields, `OR-R3`), and no edge to compensate on
   (rule 1). A consumer that wants the reason reads the task on `runtime.scheduler`, keyed by `detail.id`.
   **WITHDRAWN in its first two clauses by [ADR 0104](0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)
   (W173, 2026-10-16)**: `driver.cancel` cancels a run, and the run reads `cancelling` until its last task has stopped.
5. **Cost**: one boolean on a driver, one `some` over a run's nodes per fold step, and one scan of a
   checkpoint's events per resume.
6. **Two doors are not shut on the stack of a RE-ENTRANT halt, a cancel's or a stop's** — found by both of W158's
   readers, and handed to P34 by the maintainer rather than patched for the cancel alone
   ([Q605](../questions/q605.md)): a fan-out's remaining branch dispatches (`src/driver/driver.ts`, the
   `region.branches.forEach` that enters each branch) and a resolution's routing after its append (`resolve()`).
   A consumer callback that cancels synchronously on either stack lets one more dispatch or routing through. A
   halt at rest — from a settlement or a resolution — dispatches nothing further. P34's dispatch hold is to close
   both for every halt. **WITHDRAWN by [ADR 0103](0103-every-halt-shares-one-dispatch-hold.md) (W172, 2026-10-16)**:
   both doors are shut for every halt by one hold, `RN-R29`; [Q605](../questions/q605.md) is resolved.
7. **On a runtime, "appended" stops at `done`**: [ADR 0091](0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)
   releases the run when `done` settles, which a cancel makes happen at once, so the in-flight settlements a bare
   `Driver` would append reach no driver. That `done` settles on a cancel and the release follows is asserted
   by nothing on the runtime yet ([Q606](../questions/q606.md)). **Amended by [ADR 0104](0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)
   (W173, 2026-10-16)**: true of a cancel the scheduler made on its own; a run its OWNER cancels keeps `done` pending
   until every task has stopped, so every settlement is appended — and both are asserted on the runtime, resolving Q606.
8. **The outcome is not monotone**: a `cancelled` settlement for a task already settled `done` would turn a
   `completed` run `cancelled`. Unreachable at the pin — `cancel()` of a finished task resolves `false` and fires
   nothing.

## Alternatives rejected

| | why not |
|---|---|
| **An opt-in edge, `on: ["cancelled"]`** (P33 stop-and-ask (a)) | a cancelled task becomes a third routable outcome: a flow that branches on it is a flow that keeps running after its owner said stop, and P34's *cancel a run* would have to cancel the compensating branch it just started |
| **The cancelled BRANCH ends and the run continues** (stop-and-ask (b)) | the run routes on past a hole it cannot fill: a `map` loses an item silently, and the run can complete having skipped work its owner never saw skipped. Nobody cancels one task of a run by accident |
| **`cancelled` above `stopped`** (stop-and-ask (c)) | a run refused for a defect AND cancelled would read as an owner's choice — a defect hidden. **And `awaiting_action` above `cancelled`**: a parked task would make a cancelled run read as waiting for a person, whom the driver then refuses |
| **An unrequested cancel treated as IN FLIGHT, resumable** (stop-and-ask (d)) | a cancel nobody recorded is silently re-run on the next resume, which is the opposite of what fyflow-app asks of a cancelled run (*"not resumable"*) |
| **Record `task.cancelling` now** (stop-and-ask (e)) | a fold input for a state P34 may model differently, written before P34 decides what a run that is being cancelled is |
| **Map `cancelled` to `failed`** | a cancelled `optional` task would route down its `on: ["failed"]` edge — the owner's stop read as a failure the flow handles — and a non-optional one would read `failed` where the scheduler said otherwise; ADR 0007 rule 2 keys on the scheduler's state, not on a translation of it |
| **Halt by `failRun`, appending `stopped`** | `stopped` names a defect, `onRunFailure` reports one, and `hasFailed()` says one — three readers that would each call an owner's cancel a refusal, and RN-R8 would rank it with the defects it exists to keep visible |
