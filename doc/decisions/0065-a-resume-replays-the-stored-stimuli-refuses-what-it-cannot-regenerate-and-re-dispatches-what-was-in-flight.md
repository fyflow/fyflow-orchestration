---
id: ADR 0065
title: "A resume replays the stored stimuli through the routing that produced them, refuses what it cannot regenerate, and re-dispatches what was in flight"
status: accepted
date: "2026-09-24"
item: W89
raised-by: P23, Q15, Q364
supersedes: ""
amends: ""
resolves: Q38
---

# ADR 0065 — A resume replays the stored stimuli through the routing that produced them, refuses what it cannot regenerate, and re-dispatches what was in flight

**Raised by:** [P23](../plans/p23-what-a-run-needs-to-outlive-its-process.md) decisions 6, 7, 9 and 10 and
stop-and-asks (a)-(c), taken by [W89](../work-items/w89-what-resuming-is.md); [Q15](../questions/q15.md)'s
second half, [Q364](../questions/q364.md)

***Noted 2026-10-09, W151:** fact 5 below (a finished run's driver still hears its run id, its sequence growing) is
true of the tree it was measured on and false since
[ADR 0091](0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md), which releases a run's
driver when its `done` settles. Rule 9 stands as written — the id is still in use for the runtime's life — and so does
the rejected alternative "freeing a run id when its run finishes", now for ADR 0091 rule 2's reason (a run can end with
tasks in flight whose settlements carry its id) rather than fact 5's.*

## Context

[ADR 0064](0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md) says what a
checkpoint IS: the run's whole fold-input sequence and a header of the five facts it cannot regenerate,
every element with a position. This decides what RESUMING one is, after the process that ran it is gone.
The maintainer answered P23's three stop-and-asks before this item started: **a resume is RECORDED**, as
an event naming what it runs again; **a runtime REFUSES a run id live on it** and its counter skips ids in
use; **a re-dispatched task keeps its task id**.

What W89's declaration step re-took before deciding anything:

| | measured | so |
|---|---|---|
| 1 | **The replay reproduces L6's own drivers** — 62 starts, 61 captured over 30 flows, **57 exactly**, at 324 prefix cuts, 261 / 261 dispatched payloads; the other four are two `FD-R4` refusals and two `OR-R6` stops | the settlements regenerate the rest, exactly — a replay needs no state beyond the log and the header |
| 2 | **Kill and resume on real schedulers** — two flows, every kill point (`dev-dist/p23/kill-resume.ts`, read first for [Q366](../questions/q366.md)'s shape: it wraps no prototype) | **14 of 14 complete identically** to a run nobody killed, re-dispatching 1-4 tasks at the same ids |
| 3 | **Which tasks a resume runs again**, read independently of the harness's own `held − settled` | **29 re-dispatched, 0 settled in the stored events — and 14 of the 29 dispatched only in the REGENERATED tail**, at 8 of 14 kill points | the in-flight set is the REPLAY's at its end, not the stored prefix's — P23 prediction 2's wording was wrong and its substance held |
| 4 | **What lives outside the log at a kill** — a spike on real schedulers | **a task with a budget of two attempts ran THREE times**; a `ConcurrentLimitGroup(1)` slot held at the kill is not carried, the re-dispatch acquiring the fresh runtime's; a parked task stays parked and `resolve()` on the resumed driver completes the run; a JSONata transform re-dispatched completes identically | the retry budget is real state outside the log ([Q365](../questions/q365.md), measured); group slots and compiled transforms are a process's and are rebuilt |
| 5 | **A finished run's driver still hears its run id** — two drivers on one scheduler under one id | the finished run's sequence GROWS after it completed | a run id stays in use for as long as a driver holds it, which is the runtime's life |

## Decision

1. **`resume()` is the other door into ONE run.** A driver constructed for the checkpoint's run and
   definition is handed `driver.resume(checkpoint)` instead of `driver.start(payload)`; a driver takes one
   door once (`ID-R3`, widened). `runtime.resume(flow, checkpoint, options)` builds that driver exactly as
   `start` builds one — through ONE function, so every `StartOptions` member but `runId` reaches it by the
   same road — and returns the same `{ driver, done, header }` (`RN-R25`).
   *(2026-10-18, [W185](../work-items/w185-the-header-before-the-first-event.md), P36 (d), its conformity reader C1: every
   `StartOptions` member but `runId` AND `onHeader` — [ADR 0112](0112-a-run-delivers-its-header-before-its-first-event.md) omits it from `ResumeOptions`, since
   the resume's caller already holds the header and `resume()` never calls it.)*
2. **Refuse the header before anything else** (`RN-R23`): `format` (not `{ header, events[] }`,
   `header.format` not `CHECKPOINT_FORMAT`, or the identifying fields not format 1's types), `run` (`header.runId` not the driver's), `flow` (flow id or
   version not the definition's — **no migration**, P23 decision 7) and `stopped` (a stored `stopped`
   element — P23 decision 10). One pure function, `resumeRefusal`, called by the driver and by the runtime
   before it builds one. `ResumeRefused` is ONE class carrying `reason` and `index`, on `BoundaryRefused`'s
   precedent of one class for two boundaries. ***Amended 2026-10-15 by [ADR 0094](0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)
   (W158): a fifth header-time reason, `cancelled` — a stored cancelled settlement, after `stopped`.***
3. **REPLAY, with every dispatch HELD** (`RN-R19`): enter the entry node with a copy of `header.entryPayload`
   as `start()` does, then FEED every stored `outcome`, `resolution` and `resumed` element at its own
   position — a settlement through the path the listener takes once `ID-R4` and `OR-R2` have passed it, a
   resolution through `resolve()`'s. Everything else is REGENERATED. A fed element is appended as stored.
4. **The stored events must be a PREFIX of the replay** (`RN-R20`): the first position where they are not —
   a regenerated element that is not the same data, a fed element the replay cannot accept (a task it never
   dispatched, a resolution for a task it has not parked), a replay that ends short — is refused as
   `diverged` with that position. A replay that runs PAST the stored events is the lost tail, and nothing
   past the stored length is compared.
5. **Every callback fires for exactly the positions ≥ the stored length** (`RN-R24`), with the driver's
   positions: the consumer holds, and was told in the other process, everything before it.
6. **A stop the replay regenerates past the stored events is refused** as `stopped` — after the tail,
   `stopped` included, has been delivered.
7. **What is in flight is re-dispatched at the same ids** (`RN-R21`): dispatched and never settled in the
   replayed sequence, at the END of the replay, in dispatch order; a `user_action` settlement is a
   settlement, so a parked task stays parked. **At-least-once**, with a fresh retry budget.
8. **`resumed` is appended after the replay and before the first re-dispatch, always** (`RN-R22`), naming
   the in-flight ids — `[]` when none — and the fold records it in `RunState.resumes`. A stored `resumed` is
   fed and checked against what is in flight in the replay there.
9. **A run id is in use on a runtime from the moment a driver of it holds the id, for the runtime's life**
   (`RN-R25`, [Q364](../questions/q364.md)): `start` and `resume` naming one throw `RunIdInUse`, and the
   minted counter skips it.

## Consequences

**What this makes easy.** A consumer that appended `onFoldInput`'s elements after the header resumes
with `runtime.resume(flow, { header, events })` and keeps appending: it is handed the lost tail and then
the rest of the run at the positions it did not hold. A changed predicate, a changed definition under an
unchanged version, or an entry payload that did not survive its clone is a named refusal at a position a
consumer can inspect — [Q9](../questions/q9.md)'s unenforced predicate purity becomes a refusal at the
one moment it would matter (P23 decision 9).

**What this makes hard, and the cost is real.**

1. **At-least-once** (P23 decision 6): a task in flight at the kill may have finished in the process that
   is gone and runs again, and the log cannot say which. Workers must tolerate running twice.
2. **A fresh retry budget** ([Q365](../questions/q365.md), measured): a task that had spent its retries
   in the process that is gone runs them all again.
3. **The prefix check sees only what was stored.** A predicate that changed where the stored run's road
   lies past its stored events is not seen, and the resumed run takes the new road. Asserted as the
   limit, not hidden.
4. **A NEW `FoldInput` kind** — BREAKING for a consumer switching on `kind` exhaustively (stop-and-ask
   (a)); the package moves at W90's close. **And a new cell of run state**, `resumes`.
5. **A run id is spent on a runtime by any driver that ever held it** — including a finished run's, a
   `start` `FD-R4` refused, and a resume refused mid-replay. A resume refused by its header costs nothing,
   because the runtime refuses it before building a driver. The remedy for the rest is a fresh runtime,
   which is what a resume after a restart is anyway.
6. **A refused resume leaves the driver SPENT and DEAF**: `start()` and `resume()` refuse, there is no run to
   checkpoint — except after a stop regenerated in the tail, which leaves the stopped run — and it hears nothing from
   its scheduler. *(The first version left a replay-refused driver listening: a settlement under its id was appended
   to its partial replay, delivered, reported as `UndispatchedTask`, and with `failed` unset would have been ROUTED —
   found by both of W89's readers, from opposite ends.)*
7. **An entry payload's prototype does not survive** ([ADR 0064](0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)
   consequence 4): where routing read it — a map over a getter — the resume refuses at position 0.

**What a future reader is likely to try that this forbids.** Replaying by emitting scheduler events into
a fresh driver's listener, as P23's spike did — it re-stamps every record's `observedAt` and re-runs
`OR-R13`'s reports, so the replayed log is not the stored one. Computing what is in flight from the stored
events alone — it loses every task the lost tail dispatched. Counting a parked task as in flight — it hands
a worker what a person was asked to decide. Counting positions in the runtime's wrapper — it is wrong the
first time a sequence does not start at the wrapper's first call, which is every resume. Freeing a run id
when its run finishes — the finished run's driver still listens.

## Alternatives rejected

| | why not |
|---|---|
| the settlements alone, handed to a fresh driver through its listener (P23's spike) | the listener re-normalises every record with this process's clock and re-reports `OR-R13` findings, so the replay's log differs from the stored one in fields routing never reads — and the prefix check would have to ignore them, which is the check excusing itself |
| equality instead of a prefix | a checkpoint taken inside `onFoldInput` ends mid-step, 1-7 elements short (P23 fact 4), and every such store would be refused |
| re-dispatching at a bumped attempt segment | stop-and-ask (c), answered: every resumed task would be a new node instance to the fold, and the replay's dispatched set and the stored events would disagree |
| a per-reason error class | five classes for one refusal a consumer catches in one place; `BoundaryRefused` already carries its boundary as a field |
| freeing a run id when its run finishes | measured: a finished run's driver still hears every settlement under its id, and its sequence grows — the first run's checkpoint would change after it completed |
| a runtime-side counter of positions, seeded from the checkpoint's length | agrees with the driver's index while delivery is contiguous, and is a second source for a number the driver already chooses (ADR 0064 rule 5) |
| delivering every replayed element and letting a store deduplicate by position | a consumer that appends in arrival order would store the run twice, and every callback would re-report what the other process already reported |
