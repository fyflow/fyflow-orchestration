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
3. **This plan runs THIRD, after P37 and P34** (maintainer, 2026-10-15;
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

*Handed on by [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s retro, by the maintainer's answer to its
stop-and-asks (m), (o), (p) and (q), 2026-10-17 — each re-taken at this declaration:*

- **ONE ROW, fixed before 0.8.0 is published, no question raised** ((o), (p)): **(1)** `driver.cancel` with a consumer
  `onFoldInput` THROWING on its `cancelRequested` element — the element is appended and the run held, no cancel is sent,
  and a paused run's held tasks are never handed on, so it reads `cancelling` for ever (read from the code at P34's
  retro, not measured); fixed in `takeStop`'s shape — the in-flight set and the release read BEFORE the element, the
  cancels and hand-offs in a `finally`, the throw reaching the caller — with an L2 case at rest, mid-step and on a paused
  run. **(2)** the `OR-R10` escape (W175 N5 / R14, W174's `takeStop` the same): a throw on a `paused`, `unpaused` or
  `interrupted` element TAKEN at `leaveStep()` inside a scheduler event's step leaves into the scheduler's
  `dispatchEvent`; caught at the listener boundary as `OR-R10` catches a refusal — reported, the run halted — the reading
  stated at this declaration.
- **Three test titles, in the first item that edits `test/**`** ((m)): `test/fold/stuck.test.ts:162` and
  `test/definition/l4-corpus.test.ts:611` (*neither running nor awaiting_action* — `cancelling` too, `RN-R12` since
  run-state v0.18), which move TOGETHER because `l4-corpus` counts the suite by name; and
  `test/scheduler/runtime.test.ts:1989` (*the six outcomes* — nine).

*Adopted for THIS declaration by P34's retro (q) — copy them into it, as P34 copied P37's:*

- **B′, C and E — UNCHANGED from [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s *Work items***: the census
  re-take in a byte copy with the self-test floors; one confirming gate per item, once, after the readers; a compound
  probe kills nothing.
- **D′ — with its own clause FOLLOWED AS WRITTEN**: *a fact `AGENTS.md` states → the WHOLE of `AGENTS.md`*, never a list
  of its sections in the row (twelve of P34's eighteen exceptions were that narrowing), beside D′'s census sites and the
  grep for every file that reads the changed surface.
- **Two sentences for every item's brief**: *each item's Record states its readers' overlap* (`doc/workflow.md` section 6;
  six of P34's eight Records dropped it); and *an owner element a resume's replay feeds is TAKEN AT REST, between two
  steps* (`RN-R19`; P34's W174 R1 and W175 R1).

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
