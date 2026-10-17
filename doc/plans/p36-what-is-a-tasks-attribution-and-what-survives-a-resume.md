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
3. **This plan runs LAST of P34-P37** (maintainer, 2026-10-15;
   [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 7), so orchestration 0.8.0 is
   published after it.

## Handed on, and copied here as the retros direct

*From [P35](p35-may-a-node-wait-for-a-person-by-design.md)'s retro, by the maintainer's answer to its stop-and-asks
(k), (l) and (m), 2026-10-18 — each re-taken as a fact at the declaration:*

- **ONE ROW, fixed before 0.8.0 is published, no question raised** ((k)): **a consumer callback that THROWS, on every
  road.** One rule — *a consumer throw on any element the driver appends is reported ONCE and HALTS the run, and on a
  driver call it also reaches the caller* — `start()`'s rule extended to `resolve()`, `resume()` and the pause, unpause
  and stop TAKEN at the end of a driver call's step. Today a take there rethrows without halting (W178's conformity
  reader, R3 note), and a throw on the resolution's own element during `resolve()` leaves the answered node routed
  nowhere, unreported (W180's Notes). Built with an **L2 SWEEP: every driver call × a callback throwing on each element
  it appends**, each asserting the halt, the one report and the throw at the caller. *P35 retro section 4 (a): six roads
  found one at a time over four items.*
- **One phrase, in this plan's EXIT-ARTIFACT item** ((l)), which owns `examples/l6.ts`: `DRIVER_FIELDS`' `gateMemory`
  comment, *empty on every run here since no L6 row runs a gate* — false since W94.
- **B′, C and E UNCHANGED; D′ with three clauses added; the two brief sentences** ((m)) — for this declaration's
  *Work items*, copied as P35 copied P34's:
  - **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
    snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the
    change adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads
    that floor (`check:docs:selftest`, `check:budget:selftest`) as well.*
  - **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
    gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
  - **D′ — the census sites AND the readers in the plan's row**: *the plan's index row names, for each item, the census
    sites its kind of change moves — a new suite → `test/definition/l4-corpus.test.ts`; a spec version →
    `spec/README.md`'s row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed snippet →
    `scripts/check-docs.mjs`'s `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and `test/driver/retention.test.ts`'s
    `DRIVER_FIELDS`; a fact `AGENTS.md` states → the whole of `AGENTS.md` — and every file that READS the surface the
    item changes, found by a grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`: the module's
    export list, the caller that hands the value on, the publish smokes (which no lane typechecks), and the comments and
    messages that state the rule being changed.* **Every row touching `AGENTS.md` owns the WHOLE of it.** **And, added
    by P35's retro, each met twice**: *a new case in a COUNTED suite → `l4-corpus`'s per-suite count and its message*;
    *a flow added under `spec/examples/` → the corpus censuses (`spec/flow-definition.md` section 7's table,
    `spec/outcome-record.md` section 4's OR-R11 sentence and its suite, `test/definition/wiring.test.ts`'s L4 arc
    total, `test/driver/needs.test.ts`'s region census)*; *and a grep for each PREMISE the change falsifies, not only
    each changed name* (P35 W179: *a branch entry is a task*).
  - **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two,
    the probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed.*
  - **Two sentences for every item's brief**: ***each item's Record states its readers' overlap***; and ***an owner
    element a resume's replay feeds is TAKEN AT REST, between two steps*** (`RN-R19`) — which any owner element this
    plan adds will meet.

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
