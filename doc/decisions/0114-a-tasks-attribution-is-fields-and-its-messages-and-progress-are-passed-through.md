---
id: ADR 0114
title: "A task's attribution is fields on its nodes entry, and its messages and progress are passed through with it"
status: accepted
date: "2026-10-18"
item: W187
raised-by: P36
supersedes: ""
amends: ADR 0088 in part
resolves: ""
---

# ADR 0114 — A task's attribution is fields on its nodes entry, and its messages and progress are passed through with it

**Status:** accepted — [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) stop-and-asks (j),
(k) and (l), answered *"as recommended"* by the maintainer 2026-10-18; written by
[W187](../work-items/w187-attribution-on-the-fold-and-messages-passed-through.md). It defines `spec/run-state.md` v0.27
(section 18, `RN-R41` and `RN-R42`; `RN-R40`'s fold sentence moves) and `spec/task-id.md` v0.16 (section 1's `attempt`
bullet). **It amends [ADR 0088](0088-a-runtime-routes-each-settlement-to-the-driver-holding-its-run-id.md) rule 3**: the
router reads `detail.id`, else `detail.taskId`; nothing else in ADR 0088 moves. It resolves no question.

## Context

fyflow-app parses our task id to learn which run and which attempt a task's activity belongs to, shows only `task.progress`
for logs, and subscribes the scheduler itself to get it (its #8, P1). The scheduler at the pin ships `context.emit` →
`task.message` and numbers each attempt (`attemptNumber`); since W186 the driver records each attempt as an `attempted`
fold input. Three constraints (P36's evaluation, re-taken at its declaration): a field derived from the task id on a RECORD
or a fold input is *two sources of truth for one string* (`spec/outcome-record.md` section 2) — fold OUTPUT is fine; a
pass-through callback is not a fold input and does not touch the invariant; and the id's attempt segment is minted `0`
everywhere. Measured at P36's declaration (fact 2): `task.message`'s detail has NO `id` — its task is `taskId` — so the
runtime's router, which reads `detail.id` alone (ADR 0088 rule 3), would BROADCAST every message to every run's driver
(fact 9). Measured at W187's declaration, at the pin in node and deno: an inline pool runs its worker AFTER `addTask`
returns, so a progress report or a message never arrives on a driver call's own step.

## Decision

1. **Every `RunState.nodes` entry carries three REQUIRED fields** ((j)): `runId` and `flowAttempt` — the task id's first and
   fourth segments — and `attemptNumber`, the SCHEDULER's, the number the latest `attempted` element for the task carried;
   `null` before the first attempt, on an ask, and on a log written before 0.8.0. Never derived from a record's `attempts`;
   a settlement and a resolution keep the entry's number. Fold OUTPUT only.
2. **`flowAttempt` and `attemptNumber` are named apart** — the app's *"under names that cannot be confused"*; `attempt` is the
   word both would have claimed.
3. **Two `DriverOptions` members, `onTaskMessage(m)` and `onTaskProgress(p)`** ((k)), in a runtime's `StartOptions` `Pick`
   and kept by `ResumeOptions` (a resumed run's tasks emit as a started run's do). Each is handed a FROZEN copy, taken in the
   listener (ADR 0007 rule 1, `OR-R7`): the attribution — `runId`, `nodeId`, `branchPath`, `taskId`, `flowAttempt`,
   `attemptNumber` (the event's own) — beside the scheduler's fields; for a progress report the report's fields and none of
   the task's, which the scheduler spreads flat into that detail (its `workerType` there is `'inline'`/`'thread'`, not the
   pool key).
4. **Subscribed ONLY when the callback is given** — the scheduler sends nothing while nobody listens (its §6), so a run that
   asks for neither costs its workers nothing to emit.
5. **Delivered only for a task THIS run dispatched**; everything else dropped in SILENCE — never `onUnmintedTask`, never
   `UndispatchedTask`: a message never stops a run by existing. **Nothing once the driver is deaf** (stopped, `RN-R33`; spent,
   `RN-R23`) **or released by its runtime** (ADR 0091). A halted run's tasks still run, and their events still arrive.
6. **Never a fold input, never a record, never in a checkpoint** (P36 decision 5): a run's fold-input sequence is the same
   with and without them.
7. **A THROW from either takes `onUnmintedTask`'s road** — caught at the listener boundary, reported ONCE through
   `onRunFailure`, the run HALTED (`OR-R10` on a scheduler event's step). Neither event arrives on a driver call's step, so
   neither throw is the caller's.
8. **ADR 0088 rule 3, amended** ((l)): the router reads `detail.id` when it is a string, else `detail.taskId`, and routes
   on the run id it parses — so a message reaches only its own run's driver, one delivery per message, as a settlement does. Rule 4's rows are
   unchanged: a `taskId` that does not parse is broadcast, as an `id` that does not parse is.
9. **A value `structuredClone` refuses is handed on `undefined`** — a function in an inline worker's progress `details`,
   which no thread boundary cloned first — the scheduler's own treatment of an `emit` it cannot clone (its §6). **No marker
   is carried**, so a consumer cannot tell it from a value the worker never gave; a marker would change the shape (k) fixed.

## Consequences

**What this makes easy.** A consumer holding one `nodes` entry, one message or one progress report knows its run, its node,
its branch, its flow-level attempt and its scheduler attempt without parsing an id — the app's stopgap goes. A log channel
from a worker reaches the run's caller through the library, attributed, on a shared runtime, at one delivery per message.

**What this makes hard, and the cost is real.**

1. **BREAKING for code that builds a `NodeRun` literal** — three required fields (P36 (p)). A reader is unaffected.
2. **A worker's progress `details` that cannot be cloned arrives `undefined`**, where the scheduler's own listener would have
   seen the live value — the copy is the price of a frozen, driver-owned value.
3. **Once one run on a runtime passes a callback, the scheduler is subscribed for the runtime's life** (ADR 0088 rule 2:
   subscriptions are never removed), so every run's workers on it pay to emit — routed to their own drivers and dropped
   there when they did not ask.
4. **A consumer's logging bug halts the run** — the one rule every consumer callback follows (P35 (k)); a run on a halted
   driver still delivers.

**What a future reader is likely to try that this forbids.** Putting `runId` or `flowAttempt` on an `OutcomeRecord` or a
fold input — two sources of truth for one string. Reading `attemptNumber` off a settlement's `attempts` — a log written
before 0.8.0 would then report a number nothing recorded. Subscribing `task.message` unconditionally — every worker of every
run would pay to emit.

## Alternatives rejected

| | why not |
|---|---|
| optional `NodeRun` fields | additive, but every reader handles `undefined` for a field always derivable ((j)) |
| `attempt` and `schedulerAttempt` | `attempt` is the confusable word the app asked us to avoid ((j)) |
| no `runId` on the entry | `RunState.runId` says it, but the app reads `nodes` entries on their own ((j)) |
| one `onTaskEvent(e)` union | one member, a discriminant every consumer switches on ((k)) |
| always subscribe | every worker of every run emits whether anyone listens ((k)) |
| a throw discarded | a logging bug never stops a run — and is never heard of ((k)) |
| the router unchanged | every message broadcast to every run's driver, N² per message on one runtime ((l)) |
