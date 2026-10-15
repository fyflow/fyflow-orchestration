# P35 — May a node wait for a person by design?

**Status:** planning — a DRAFT carrying the maintainer's decisions of 2026-10-14/15; NOT declared: no ids reserved, no facts taken, stop-and-asks not yet put
**Question this plan answers:** *may a flow declare a node that waits for a person, keeps what reached
it, and holds the person's answer to a schema — without a task failing to get there?*
**Exit artifact:** *(draft) an L6 run in node 24 and deno whose ask node parks with no task run,
is answered through `resolve` with an answer its schema refuses and then one it accepts, and routes
on the answer; and `npm run gate:full` EXIT 0.*
**Reserves:** none yet — taken at its declaration, from `npm run state`

## Why this plan, and why now

fyflow-app's only way to wait for a person is a task that fails on purpose and parks `user_action`
(its ADR-0013): an `Ask` worker throws its question, the app stores the task's input itself, and checks
an answer schema with our `findings()`. Its pass 1 asks for the real thing — **#2 a node that waits by
design**, **#3 keep a task's input so a Resolve can use it**, **#4 a schema for what a person may
answer** — all P1.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **#3 and #4 are scoped to the waiting node**, not to every task: the node's own record carries
   what reached it, and its answer schema is a key on it.
2. **#12 and #13 are answered here, not built** — see below.
3. **This plan runs THIRD, after P34 and P37** (maintainer, 2026-10-15;
   [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 7).

## Constraints found by the 2026-10-14 evaluation, re-taken at declaration

- **Only task nodes can suspend** today (`spec/flow-definition.md`), and a DRIVER-written
  `user_action` would break [ADR 0060](../decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)'s
  rule that the driver never authors a terminal state. The clean route measured so far is a
  **gate-like node kind evaluated in the driver, plus a new fold input** — the shape is this plan's.
- **#3 in general conflicts with [ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)**
  (retention, [Q19](../questions/q19.md)); the post-transform input is never seen by the driver, since
  a transform runs in the worker. Scoped to the ask node it is natural.
- **`resolve` already carries a result** — `resolve(taskId, 'done', { result, actor })`
  (`src/driver/driver.ts`) — and **FD-R4 already refuses** a `done` value against the worker's
  `outputSchema` (`BoundaryRefused`, nothing appended). #4's new part is the per-node schema.
- `RoutableState`, P33's `cancelled` and P34's cancel all reach a parked node: a cancelled run ends
  its parked asks without a Resolve (P33 decision 3).

## Answered here, not built

| # | ask | answer |
|---|---|---|
| **#12** | a failed task's error visible to the nodes after it | **Deferred.** The message string is small to expose; a structured error code is a scheduler ask, because the scheduler reduces an error to `error.message`. Revisit when the app's Ask-after-a-failure-edge use is designed here — it is the natural first consumer |
| **#13** | a deadline or escalation for a parked task | **Declined.** The driver is clock-free by design; a consumer calls `resolve` on its own timer, which is the deadline it wants. A clock in the driver would make the fold depend on time |

## Scope (draft)

**In** — the waiting node kind (#2), its kept input (#3), its answer schema (#4); the specs and
`AGENTS.md`.

**Out** — #12, #13 (answered above); keeping every task's input (ADR 0046).

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q19](../questions/q19.md) | what a run retains — #3 scoped so as not to reopen it | — |

## Record

*Filled in at the join, after the work items are merged.*
