---
id: ADR 0091
title: "A runtime releases a run when its `done` settles, and keeps only its run id"
status: accepted
date: "2026-10-09"
item: W151
raised-by: Q513
supersedes: ""
amends: ADR 0088 rule 5
resolves: ""
---

# ADR 0091 — A runtime releases a run when its `done` settles, and keeps only its run id

**Status:** accepted — the maintainer's decision on 2026-10-09 (*release on done*), written and measured by
[W151](../work-items/w151-a-runtime-releases-a-run-when-its-done-settles.md), an item outside any plan. It
amends [ADR 0088](0088-a-runtime-routes-each-settlement-to-the-driver-holding-its-run-id.md) rule 5, *a
driver stays in the routing for the runtime's life*.

## Context

**One long-lived runtime keeps every run it ever finished.** Measured on `bb612da` by the main session and
re-taken by W151 with the same script (`dev-dist/w151-27362/q513-measure.ts`, a copy of
`dev-dist/w133-59497/`'s): `map-alias` run sequentially on one runtime, arity 4, ~4 KiB results, **no handle
kept**, heap after two forced collections, node 24:

| finished runs | 100 | 250 | 500 | 1000 | 1500 | 2000 |
|---|---|---|---|---|---|---|
| heap above base, MiB | 17.51 | 41.53 | 81.34 | 160.91 | 240.57 | 319.81 |

**About 160 KiB per finished run, linear and unbounded, and two holders share it.** About **123 KiB** of it is
the runtime's router (`settlementRouter` in `src/scheduler/runtime.ts`), which ADR 0088 rule 5 keeps for the
runtime's life — the table below. The other **~37 KiB** is the SCHEDULER's: a `FyflowScheduler` keeps every
completed task in `scheduler.tasks` unless `maxCompletedTasks` caps it, and `createRuntime` builds it uncapped.
*(The split is W151's measurement on the tree this decision ships: the same script reads 72.54 MiB at 2000 runs
after the release, and `examples/retention.ts release 1000 4 4 keep-tasks` reads 37 497 B per finished run with the
tasks kept against ~430 B with them evicted. This paragraph credited the router with all of it until W151's
conformity reader, finding 1.)* This decision is about the router's share:

| structure | holds | reaches |
|---|---|---|
| `byRun` | run id → event name → the listeners the driver filed | each listener is the driver's closure, so the whole `Driver`: its `inputs`, every result (ADR 0046 rule 1), its definition copy, and the runtime's `onFoldInput` wrapper with the `RunState` it stepped |
| `every` | event name → every listener ever filed, in order | the same closures again, for ADR 0088 rule 4's third row |
| `inUse` | the run id | a string |

**And nothing can read it.** A `Runtime` has `start`, `resume`, `shutdown` and read-only registries — no member
reaches a past run. So the memory is unreachable through the surface, and it buys no postmortem: whatever a
consumer can read about a finished run, it reads from what IT kept — the `RunHandle` (`driver.foldInputs()`,
`snapshot()`, `checkpoint()`, `done`'s `RunState`) or a durable record (`onFoldInput`, a checkpoint).

[Q513](../questions/q513.md) asked which answer to *"is per-run retained state bounded?"* holds for both
repositories. [Q19](../questions/q19.md)'s answer here was *bounded by the RUN*; the measurement above says
that is true of a run and false of a runtime holding many.

## Decision

1. **When a run's `done` settles, the runtime RELEASES the run.** Its driver's listeners leave the router —
   its `byRun` entry is deleted and its listeners are filtered out of every `every` list, copy-on-write as
   ADR 0088 files them — and nothing the runtime holds reaches the driver any more. **The moment is `done`'s
   own**: the microtask at which `settleIfTerminal` finds the stepped state terminal, which is a quiescent
   point (`RN-R12`), and never an input that merely LOOKS terminal mid-turn.
2. **The run id is KEPT, for the runtime's life.** `inUse` keeps it, so `start` and `resume` naming it throw
   `RunIdInUse` and the minted counter skips it, exactly as before (`RN-R25`). What the RUNTIME holds is then
   bounded by its **live** runs plus one string per run it ever opened; the scheduler's `scheduler.tasks` is the
   scheduler's, and is bounded only where `maxCompletedTasks` caps it (through `RuntimeOptions.createScheduler`).
3. **A run that has not settled is not released.** `running` and `awaiting_action` are the two outcomes
   `isTerminal` calls not terminal, so a run parked on a person keeps its routing: `resolve()` on its driver
   and every later settlement under its id work as before.
4. **A driver whose opening THREW is released as the throw leaves `start` or `resume`.** A resume refused
   during its replay (`RN-R23`) leaves a driver that is SPENT and hears nothing, and whose `done` never
   settles — rule 1 would never reach it. Releasing it changes nothing it does; keeping it would be rule 1's
   leak, one driver per refused resume. Its id stays in use (rule 2). A start `FD-R4` refused is released
   here too, and rule 1 then finds nothing to release.
5. **Where a settlement for a released run's id goes is ADR 0088 rule 4, unchanged**: it parses and no driver
   of this runtime holds its run id, so it is handed to **no driver**. An id that does not parse goes to every
   driver the runtime still holds — every LIVE run's, in subscription order.
6. **Nothing on the surface moves.** `start` and `resume` return the same `RunHandle`
   ([ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)), no member is added to
   `Runtime`, nothing new is exported. The handle a caller kept holds the driver, so everything it read before
   the release it reads after.

## Consequences

**For `RN-R25` (`spec/run-state.md` v0.14).** What it REFUSES is unchanged — an id held by any driver the
runtime has built, from the moment that driver exists, a finished run's and a refused start's included — and
the counter still skips them. **Its stated reason is withdrawn**: *a finished run's driver still hears every
settlement under its id — measured, its sequence grows after it completed* is false from this decision on.
**The reason that replaces it**: a run can end with tasks still in flight (a `stopped` run, below), and their
settlements carry its id; a second run under that id would be handed them — refused by `ID-R4` tier 2 if it
had not dispatched that task, **accepted as its own** if it had minted the same task id — and the scheduler
keys its tasks by id and overwrites on reuse ([Q13](../questions/q13.md)). The id is cheap to keep and costly
to free.

**For ADR 0088.** Rule 5 reads, from this ADR: *a driver stays in the routing until its run's `done` settles,
or its opening throws*. Rule 4's third row reaches every driver the runtime still holds. Its rejected
alternative *drop the routing entry when a run reaches a terminal outcome* is taken in the narrower form of
rule 1 — `done`'s quiescent point, not an outcome read mid-turn — and both of its objections are met: the
`RN-R25` text moves with a version bump rather than silently, and `awaiting_action` is not terminal (rule 3).
Rules 1-4, 6 and 7 are unchanged.

**For [ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) and `ID-R4`.**
Unchanged in meaning: both are about a driver that is HANDED a settlement, and a released driver is handed
none. Rule 3's silence holds a fortiori. Rule 4 / tier 2 still refuses our run id on an undispatched task for
every LIVE run. **What no longer happens**: a finished run's driver turned `stopped` after the fact by a
settlement under its id — for a task it never dispatched (tier 2's `UndispatchedTask`), or, in W89's measured
collision, for a task it HAD dispatched, whose second settlement routed it again into `DuplicateTaskId` (`ID-R1`)
and changed the stored run's checkpoint after it completed. That run's `RunState` is now fixed once `done` has it.
*(This named W89's collision as the tier-2 case; it was the `ID-R1` one — W151's conformity reader, finding 2.)*
**Before `done` has it, the run is still routed**: a settlement arriving in the same synchronous turn as the run's
terminal input, before `done`'s microtask, is handed to the driver and can still move the outcome — to `stopped`, for
one — and `done` resolves with the state at its microtask (rule 1's moment; W151's adequacy reader, C6).

**For [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) and `ID-R5`.**
Unchanged in every rule: an id that does not parse is still decided at a driver's tier 0 and reported by every
driver it is handed to, each under its own run id. After `done`, a finished run's `onUnmintedTask` is no longer
called — the work nobody minted is still reported by every live run, and a runtime with no live run reports it
to nobody, as a runtime that never started one always did.

**For [ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md).** The handle is unchanged,
and the runtime, not the driver, still produces `done` — which is what that ADR's *the runtime keeps* is about; this
decision adds only how long the runtime holds the run afterwards. Its own cost paragraph —
*bounded per RETAINED HANDLE rather than per live run* — is TRUE from this decision on; before it, the router
retained every handle's driver whatever the caller kept.

**For [ADR 0065](0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md)
rule 9.** *A run id is in use from the moment a driver holds it, for the runtime's life* stays true of the id.
Its measured fact 5 (*a finished run's driver still hears its run id*) is the reason this decision withdraws,
and its rejected alternative *freeing a run id when its run finishes* stays rejected, for rule 2's reason.

**A `stopped` run's tasks still in flight settle into nobody.** A refusal stops ROUTING (`OR-R10`) and not
appending: before this decision, a stopped run's driver went on appending the settlements of the tasks it had
dispatched before the stop, and handing them to `onFoldInput`, after `done` had resolved. From this decision
those settlements reach no driver. **The outcome does not move** — `stopped` outranks everything (`RN-R8`) and
`done`'s `RunState` is the one it settled with — and no rule in `spec/` states the late append. What a caller
loses is the late results in a stopped run's own sequence; a consumer that wants them listens on
`runtime.scheduler` keyed by `detail.id`, which is what `AGENTS.md` section 12 already says a listener of one's
own is for. The case is any run whose `done` settles with a task still in flight; `stopped` is the one a
refusal produces by construction, and `isTerminal`'s own comment says every other terminal outcome is reached
only when nothing is live.

**For [Q19](../questions/q19.md) and [Q513](../questions/q513.md).** Per-run state is bounded by the run, and a
runtime's own by its live runs plus one id each (the scheduler's `scheduler.tasks` beside it is the scheduler's, rule 2). Q513 closes here, by the maintainer, departing from P29 decision 7
for this question as [ADR 0090](0090-a-run-is-driven-on-one-scheduler-and-a-run-id-is-unique-per-runtime.md)
did for Q20. **The collector's own history stays fyflow-react-components' Q14**, answered there by that
repository; nothing is written in the sibling from here. If it answers differently, Q513 is reopened with that
reason.

**Cost.** One `Map.delete` and one filtered copy of each of the run's event lists in `every`, once per run —
O(live runs) per release, against an unbounded heap. One `string` per run ever opened stays in `inUse`.

## Alternatives rejected

| | why not |
|---|---|
| **Keep every driver for the runtime's life, and document it** (ADR 0088 rule 5 as written) | ~160 KiB per finished run, linear and unbounded, and unreachable: no member of `Runtime` reads a past run, so it is memory with no postmortem value. A consumer's only remedy would be a runtime per batch of runs, which gives up the shared pools P18 decision 10 put on the runtime |
| **Keep them, with a lookup and a clear-up action** (`runtime.runs`, `runtime.release(runId)`) | two new `Runtime` members, and the default is still the leak: a consumer that never calls the clear-up grows without bound. Everything a lookup would return is already on the `RunHandle` the caller chose to keep or drop |
| **Free the run id with the driver** | `RunIdInUse` lost for a finished run: a second run under the id is handed the first run's late settlements and, where it mints the same task id, accepts them as its own; the scheduler overwrites a reused task id (Q13). Rule 2's reason |
| **Release at the first input that folds to a terminal outcome** | mid-turn prefixes read terminal while the run is live — 7 of 14 prefixes of a real `fanout-join` run (`RN-R12`'s quiescence block) — so a live run would lose its routing between a settlement and the dispatch it causes |
| **Hold drivers weakly** (`WeakRef`, `FinalizationRegistry`) | the router must hold a LIVE run's listeners strongly or a run whose caller dropped the handle stops hearing its own settlements; and a release that waits on a collector is a timing no test can pin and no two runtimes share |
