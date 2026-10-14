# P36 — What is a task's attribution, and what survives a resume?

**Status:** planning — a DRAFT carrying the maintainer's decisions of 2026-10-14/15; NOT declared: no ids reserved, no facts taken, stop-and-asks not yet put
**Question this plan answers:** *which run and attempt does a task's activity belong to, without
parsing its id, and what of a run — its header, its attempts — survives a crash and a resume?*
**Exit artifact:** *(draft) an L6 run in node 24 and deno whose worker emits messages a consumer
receives with run id and attempt as fields; a run whose header reaches `onHeader` before its first
fold input; and a run killed mid-retry and resumed that does not get a fresh retry budget; and
`npm run gate:full` EXIT 0.*
**Reserves:** none yet — taken at its declaration, from `npm run state`

## Why this plan, and why now

fyflow-app parses our task id to learn a task's run and attempt (`runtime/src/task-ids.ts`, its
stopgap for **#8**, P1), shows only `task.progress` for logs, gives a resumed task a fresh retry
budget (**#10**, P3, its ADR-0014 at-least-once), and can lose a run whose events were written before
its header (**#9**, P3). `fyflow-scheduler` 0.6.0 shipped what these need: `context.emit` →
`task.message`, `attemptsSpent`, `task.attemptNumber`, `task.retrying`. It declined `meta` on tasks, so
the task-id map stays ours.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **#9: the checkpoint header is delivered BEFORE the run's first event** — an `onHeader(header)`
   callback on `StartOptions`, called synchronously inside `start()` before the first dispatch and the
   first `onFoldInput`. `resume` takes none: its caller already holds the header. **This reverses
   [ADR 0064](../decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)'s
   rejected-alternative row** (*"the position already makes write order irrelevant"* — true of
   ordering, silent on a crash before the header is written); a new ADR says so. The pure
   `checkpointHeaderOf` helper was considered and dropped.
2. **#11 is answered here, not built** — see below.

## Constraints found by the 2026-10-14 evaluation, re-taken at declaration

- **#8**: a pass-through callback (`onTaskMessage`, `onTaskProgress`) is not a fold input and does not
  touch the invariant. Derived fields on an outcome record or fold input conflict with
  `spec/outcome-record.md`'s *two sources of truth for one string*; fields on `NodeRun` — fold OUTPUT
  — are fine. The task id's attempt segment is never minted above 0 today.
- **#10** is [Q365](../questions/q365.md) with [Q26](../questions/q26.md). *Budget already spent,
  so fold as failed* would have the driver synthesise a settlement, against
  [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
  and [ADR 0060](../decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md);
  0.6.0's `attemptsSpent` lets the scheduler do the counting instead.
- **#18's question** — does a stopped attempt count as spent? The app would count it, as a kill does.
  Answered here, after [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) builds the stop.

## Answered here, not built

| # | ask | answer |
|---|---|---|
| **#11** | resume should notice a changed definition, not only a changed `version` | **Deferred**, with [Q372](../questions/q372.md) and [Q249](../questions/q249.md). A hash of the definition is async (`crypto.subtle`) where `start` is sync, and a predicate's code cannot be hashed at all. The app is already safe: it resumes only against immutable Flow Versions (its ADR-0004) |

## Scope (draft)

**In** — #8 (attribution and worker messages), #10 (attempts across a resume, and a stop's), #9
(`onHeader`); the specs and `AGENTS.md` sections 17-18.

**Out** — #11 (answered above); `meta` on tasks (declined by the scheduler).

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q365](../questions/q365.md), [Q26](../questions/q26.md) | attempts across a resume | P36 |
| [Q372](../questions/q372.md), [Q249](../questions/q249.md) | a changed definition under a resume — #11 | deferred |

## Record

*Filled in at the join, after the work items are merged.*
