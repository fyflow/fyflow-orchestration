# P34 — What do cancelling, stopping and pausing a run do?

**Status:** planning — a DRAFT carrying the maintainer's decisions of 2026-10-14/15; NOT declared: no ids reserved, no facts taken, stop-and-asks not yet put
**Question this plan answers:** *what does a run do when its owner cancels it, stops it to resume it
elsewhere, or pauses it — and what does each leave in the log?*
**Exit artifact:** *(draft) an L6 run in node 24 and deno that is cancelled while two tasks run and
one is queued, folding to `cancelled` with `done` settled; a second that is STOPPED on one runtime and
resumed on a fresh one, re-running its in-flight tasks at the same ids; a third paused and unpaused
mid-fan-out; and `npm run gate:full` EXIT 0.*
**Reserves:** none yet — taken at its declaration, from `npm run state`

## Why this plan, and why now

fyflow-app's pass 1 (P33's *Why* cites the document) asks for three kinds of run control: **#1 a
user's cancel** (P1 — the app fakes it today, its ADR-0013), **#18 stopping one run on a runtime**
(P2, M2 — the app's Upgrade and *Stop them and continue* need it, its ADR-0015), and **#14 pause**
(P3). `fyflow-scheduler` 0.6.0 shipped the means — `scheduler.cancel(id, { reason, graceMs })` —
and [P33](p33-what-a-run-does-when-a-task-ends-cancelled.md) makes a cancel the driver did not
request fold. This plan builds the ones it DOES request.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **Run control is in** — cancel, stop and pause leave `doc/concept.md` section 7's non-goals; that
   amendment is this plan's, and it reopens [Q18](../questions/q18.md) (both deferral triggers met).
2. **Today's `stopped` is RENAMED** — it is the driver's halt on a defect (`failRun`), terminal and
   refused by a resume (RN-R23). *Stop* then names only #18's resumable stop. `halted` is the working
   name. **The rename takes `'stopped'` out of `RunOutcome` and `ResumeRefusalReason` entirely**, so a
   consumer's comparison fails to compile rather than silently changing meaning — fyflow-app's
   ADR-0014 keys on *"a stopped run"*.
3. **A stop goes DEAF before it cancels** (P33 decision 4): the driver's existing `deaf` flag is set,
   then each in-flight task is cancelled, so no `task.cancelled` of a stop is appended, the log ends
   with those tasks dispatched and unsettled, and a resume re-dispatches them at the same ids (RN-R21).
   Building and testing that ORDER is this plan's.
4. **A cancel is recorded by the driver BEFORE it cancels** — its own fold input — and the
   `task.cancelled` settlements fold under it; the run ends `cancelled` (P33 decisions 3-4) and is
   not resumable.
5. **All three share one mechanism**: the dispatch hold, which exists today for replay only.
6. **Everything ships in orchestration 0.8.0**, published once after the last of P34-P37 (P33 *Why*
   decision 1, which says *after P37* because P37 was then the last).
7. **The order is P37, P34, P35, P36** (maintainer, 2026-10-15). P37 runs first because it needs
   nothing of this plan's run control, and the app's workarounds it removes (#6, #20) get worse at
   its M2. P35 and P36 build on this plan's dispatch hold and stop.

## What fyflow-app asked, to be held against at declaration

| ask | item |
|---|---|
| `driver.cancel({ actor, reason, graceMs? })`: hold dispatches, cancel each queued and running task, record a `cancelled` fold input | #1 |
| `done` settles **once the tasks have stopped** — P33 settles it on the first cancel | #1 |
| a run is visibly *cancelling* between request and stop (`task.cancelling` → `task.cancelled`) | #1 |
| a second cancel with a shorter `graceMs` escalates, as the scheduler's does | #1 |
| parked tasks end without a Resolve | #1 (P33 decision 3 already) |
| stop one run without touching the runtime's others; `done` settles as stopped; the log stays a valid checkpoint to resume ELSEWHERE | #18 |
| does a stopped attempt count as spent? (the app would count it) | #18 → [P36](p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) |
| `driver.pause()` / `driver.unpause()`, both recorded; running tasks finish | #14 |

## Constraints found by the 2026-10-14 evaluation, re-taken at declaration

- **`SchedulerLike` is two methods** ([ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md),
  [ADR 0048](../decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md));
  a cancel either widens it to three or is reached through the runtime only.
- **`done` settles only on a terminal state** ([ADR 0058](../decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md),
  [ADR 0091](../decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)
  rule 3), and a stopped run is not terminal in its log — #18 needs an ADR.
- **A run id stays in use on the runtime that held it** (ADR 0091 rule 2,
  [ADR 0090](../decisions/0090-a-run-is-driven-on-one-scheduler-and-a-run-id-is-unique-per-runtime.md)
  rule 3), so a stopped run resumes on a FRESH runtime — the app's Upgrade already does exactly that.
- **A stop must cover a run with NO task running** — parked, or between tasks. The app's ADR-0015
  names that hole: such a run is not stopped and may dispatch on its old runtime during an install.
- **Cancel does not cascade** to tasks a worker spawns through `context.spawnTask()`; the driver
  knows only the tasks it dispatched.
- **A cancelled `FyflowTask` cannot be re-added**; a new one may reuse the id (scheduler 0.6.0
  `AGENTS.md`) — a resume on the SAME runtime after a stop builds new task objects.

*Handed on by [P33](p33-what-a-run-does-when-a-task-ends-cancelled.md)'s Record, by the maintainer's answer to its
retro's stop-and-ask (h), 2026-10-15:*

- **The cancel road BEFORE a thread picks the task up** — `task.cancelling` with no `task.running` (the scheduler's
  reference, section 6) — is exercised by no rung; a row at L2 or L6 here (W160's adequacy F9).
- **A cancel during a retry BACKOFF** is exercised by no rung; a row at L2 or L6 here (W160's adequacy F9).
- **Three stale doc comments**: `src/scheduler/envelope-worker.ts:346` (*"`{ settings, input }` and nothing else"* —
  `FD-C5` says the task context is passed too), `src/scheduler/runtime.ts:285` (`done`'s outcomes) and `:331`
  (`resume`'s refusals, omitting `cancelled`) — W158's Out, W159's conformity F5.
- **`cancel(id, { graceMs: 0 })` on a threaded pool** read `forced: false` with the abort arriving in node and
  `forced: true` in deno, once, in a reader's scratch run (W160's adequacy F8). **MEASURED at this declaration**; if it
  reproduces, this plan writes an S entry in `doc/scheduler-upstream.md`, reserving its id (P33 stop-and-ask (g)).

*Handed on by [P37](p37-a-runtime-is-its-registry.md)'s Record, by the maintainer's answer to its retro's stop-and-asks
(g), (i), (j) and (k), 2026-10-16:*

- **[Q633](../questions/q633.md) — a DEFECT, and it lands before 0.8.0 is published** (g): `FD-R4` holds a TRANSFORMING
  entry node's payload to its worker `inputSchema` BEFORE the transform (`src/driver/driver.ts`'s start boundary), so
  `start()` and `tryTransform(…, { input })` give opposite verdicts on one value. **MEASURED at this declaration**, and
  the ROAD is put as this plan's own stop-and-ask: (1) an async `start`, BREAKING; (2) a transforming entry's payload
  left unchecked; (3) a separate schema for what the transform receives. Its `closes-when` names an L2 case and an L6 run.
- **[Q619](../questions/q619.md) — ONE ROW of this declaration, option B** (i): a built-in `KeyedRateLimitGroup` named in
  any pool's `residentGroups` is refused by the RESOLVER at `createRuntime`, naming the pool and the group — today it is
  not `FD-R6` and counts every worker in one `""` bucket, silently. BREAKING, in 0.8.0; the spec's group-types table,
  ADR 0097 rule 1's pointer and `AGENTS.md` follow.
- **Six stale sites** (j): *the thirteen keywords* at `src/driver/driver.ts:2140`, `test/driver/result-schema.test.ts:62`
  and `:309` and `spec/outcome-record.md`'s `OR-R13` row (W164's S1 — four annotations made the count seventeen; the
  claim about `canonical` still holds); `src/definition/wiring.ts:155`, naming `examples` alone as read by nothing (W164
  C-F4); and the `InvalidDefinition` message FORMATTED twice, in `new Driver` and in the runtime's `openRun`, because
  `src/driver/**` was no P37 item's (W162 Out, ADR 0096 consequence 2).

*Adopted for THIS declaration by P37's retro (k) — copy all four into it, as P37 copied P33's:*

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**, a note for the AUTHOR and not a rule: *the plan's index
  row names, for each item, the census sites its kind of change moves — a new suite → `test/definition/l4-corpus.test.ts`;
  a spec version → `spec/README.md`'s row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed
  snippet → `scripts/check-docs.mjs`'s `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and
  `test/driver/retention.test.ts`'s `DRIVER_FIELDS`; a fact `AGENTS.md` states → the whole of `AGENTS.md` — and every
  file that READS the surface the item changes, found by a grep for each changed name over `src/`, `scripts/`,
  `examples/` and `index.ts`: the module's export list, the caller that hands the value on, the publish smokes (which no
  lane typechecks), and the comments and messages that state the rule being changed.*
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two (two
  arguments of a call, a swap and a deletion), the probe is COMPOUND, and a Record counts it as killing neither clause
  until each is re-cut alone and killed.*

## Scope (draft)

**In** — `driver.cancel`, a per-run stop on the `RunHandle` or runtime, `pause`/`unpause`; their fold
inputs and run outcomes; the rename; concept section 7; Q18; the specs `run-state.md`,
`outcome-record.md`; `AGENTS.md` section 11's cancellation row made true.

**Out** — attempts spent by a stop (P36); a deadline on a parked task (#13, answered in P35);
cancelling tasks a worker spawned itself.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q18](../questions/q18.md) | what cancelling a run does — reopened here | P34 |
| [Q605](../questions/q605.md) | two doors a re-entrant halt does not shut — closed by this plan's dispatch hold | P34 |
| [Q606](../questions/q606.md) | the runtime's release of a cancelled run, and a no-worker `done` case — its L6 half met by P33's W160 | P34 |
| [Q633](../questions/q633.md) | DEFECT: `FD-R4` holds a transforming entry's payload before its transform — before 0.8.0 is published, the road this declaration's stop-and-ask (P37 retro (g)) | P34 |
| [Q619](../questions/q619.md) | a built-in keyed group held only as RESIDENT — refused in the resolver at `createRuntime`, one row (P37 retro (i), option B) | P34 |

## Record

*Filled in at the join, after the work items are merged.*
