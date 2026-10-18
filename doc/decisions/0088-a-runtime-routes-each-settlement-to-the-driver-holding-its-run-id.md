---
id: ADR 0088
title: "A runtime routes each settlement to the driver holding its run id, and broadcasts only an id no driver minted"
status: accepted
date: "2026-10-07"
item: W142
raised-by: Q244, P31
supersedes: ""
amends: ""
resolves: Q244
---

# ADR 0088 — A runtime routes each settlement to the driver holding its run id, and broadcasts only an id no driver minted

**Status:** accepted — P31 decision 2, the maintainer's direction for [Q244](../questions/q244.md)
(2026-10-07), written and measured by W142. **Rule 5 amended 2026-10-09 by
[ADR 0091](0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)**: a run's driver
leaves the routing when its `done` settles, and its run id stays in use. *`resolves` was filled at W142's record step, with Q244's
`resolved-by`: `check:register`'s `R8` compares the two both ways, so the one could not be written before
the other.*

## Context

**Every `Driver` subscribes to its scheduler's three settlement events at construction**, and
`createRuntime` hands every driver it builds the SAME `FyflowScheduler` (P18 decision 10). So on one
runtime with N live runs, each settlement is delivered to all N drivers, and `ID-R4` tier 1 drops
N - 1 of them — [ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
rule 3 working exactly as written, N times per settlement. N runs settle `N x k` times, so the
runtime does `N² x k` deliveries. [W55](../work-items/w55-a-run-at-scale-on-real-workers.md) measured
it and raised Q244; this is the topology `createRuntime` builds and `AGENTS.md` recommends.

**Re-taken by W142 on `ba90b5a`'s library source**, with the measuring mode added and not yet committed
(it landed in `6ed7c7d`, with the routing), `examples/retention.ts topology N 4 1 [own]` under
`node --expose-gc` — N runs of `map-alias` (six tasks each) through `runtime.start` and `await done`,
with nothing of the harness subscribed to the scheduler:

| N | shared: wall | shared: events handed to drivers | shared: heap | own runtime each: wall | own: heap |
|---|---|---|---|---|---|
| 100 | 97 ms | 60 000 (59 400 another run's) | 6.6 MiB | 94 ms | 13.3 MiB |
| 200 | 191 ms | 240 000 | 11.2 MiB | 146 ms | 24.4 MiB |
| 400 | 429 ms | 960 000 | 20.4 MiB | 252 ms | 46.1 MiB |
| 800 | 1313 ms | 3 840 000 | 38.6 MiB | 428 ms | 89.6 MiB |
| 1600 | 7567 ms | 15 360 000 | 76.1 MiB | 963 ms | 182.3 MiB |

**The wall is the broadcast's and the count says so without a clock**: 6N² events handed on the
shared topology against 6N on the other. **The library's HEAP is linear in both**, which corrects
W55's *super-linear in heap*: W55 measured through `runFlow`, which subscribed eight listeners of
the harness's own per run, recorded every settlement each heard and copied `scheduler.tasks` into each
report, so on one scheduler the HARNESS held N² ids (W142 re-took W55's own command on the same tree:
879 MiB at N = 800, against 38.6 here). W142 then routed the harness too — the maintainer's answer (B)
to its prediction-3 stop — and W55's command reads 68.0 MiB and 868 ms at N = 800 shared.

## Decision

1. **The runtime routes; the driver and the scheduler do not change.** Every driver `createRuntime`
   builds — by `start` or by `resume`, through `openRun`, the one place a runtime builds a driver — is
   handed a **per-run view** of the runtime's scheduler as its `scheduler` option: `addTask` is the
   scheduler's own, and `addEventListener` registers the listener with the runtime's router under that
   driver's run id. The view satisfies `SchedulerLike`'s two methods, so the seam stays what
   [ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) and
   [ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md) make it,
   and `Driver` is not edited.
2. **The runtime subscribes to its scheduler ONCE per event name**, when the first driver subscribes
   to that name — never once per run. A runtime that has started nothing has subscribed nothing.
3. **A settlement's run id is read by `ID-R4`'s tier-0 parse — `parseTaskId(detail.id)`, the same
   function — and from `detail.id` ALONE.** The grammar stays in one place (`spec/task-id.md`
   section 2), and the router reads no other field, so `OR-R1` (nothing retained) and `ID-R4`'s
   *ownership from the task id alone, before anything else reads the detail* hold for it as for the
   driver: `OR-R6`'s clone cannot run before a settlement is routed. ***Amended 2026-10-18 by
   [ADR 0114](0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md) rule 8*** (W187, P36
   (l)): the router reads `detail.id` when it is a string, else `detail.taskId` — `task.message` names its task `taskId` and
   carries no `id`, so without it every message reached every run's driver. Rule 4's rows are unchanged.
4. **Where a settlement goes:**

   | `detail.id` | delivered to |
   |---|---|
   | parses, and its run id is held by a driver of this runtime | **that driver's listener for that event, and no other** |
   | parses, and no driver of this runtime holds its run id | **no driver** — silently, which is what every driver's tier 1 did with it before |
   | does not parse, or is not a string | **every driver of this runtime subscribed to that event**, in the order they subscribed — so each still reports it through `onUnmintedTask` under its own run id ([ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) rule 3, `ID-R5`) |

5. ***Amended 2026-10-09 by [ADR 0091](0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)
   (W151, the maintainer's decision on Q513): a driver stays in the routing until its run's `done` settles, or the
   `start` or `resume` that built it throws; then the runtime releases it and keeps only its run id. The rule as
   written below is the text this decision shipped with, kept because the id it states is still in use for the
   runtime's life, and because what it says of a finished run's driver is what that ADR withdraws.***
   **A driver stays in the routing for the runtime's life.** `RN-R25` is unchanged: *in use means
   held by a driver*, and a finished run's driver, or a refused start's, still hears every settlement
   under its id — and stays among *every driver* for rule 4's third row. A refused resume's driver is
   HANDED them too and, spent, does nothing with them (`RN-R23`: it *hears nothing* in the sense that
   nothing is appended, routed, delivered or reported). Detaching any of them would change `RN-R25`'s
   text, and this decision does not. *(This rule said a refused resume's driver "still hears" and
   credited `RN-R25` with it, which names only the finished run and the refused start — W142's
   conformity reader, finding 4.)*
6. **The driver's own tiers still run on every event it is handed, unchanged**: tier 0 reports an
   unminted id, tier 1 drops another run's, tier 2 refuses ours-but-undispatched with
   `UndispatchedTask`. For a routed driver tier 1 can no longer be reached from the scheduler; it
   stays the guard for a driver built by hand.
7. **Nothing on the surface moves.** `start` and `resume` return the same `RunHandle`
   ([ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)), `StartOptions`
   and `RuntimeOptions` are unchanged, nothing new is exported, and `runtime.scheduler` is the
   scheduler itself. **A `Driver` built by hand on `runtime.scheduler`** (P18 decision 14) subscribes
   to the scheduler directly, is not in the routing, and hears every settlement as before; the
   runtime's router does not see it and it does not see the router's drivers' traffic any differently.

## Consequences

**For [ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md).**
Rule 1 is unchanged: a settlement is this run's if and only if this driver dispatched it, and that is
still the driver's `dispatched.has()`. **Rule 3 keeps its meaning and gains a place it is enforced
earlier**: another run's settlement is not a failure, is not counted and does not reach
`onRunFailure` — for a routed driver because it never arrives, and for a hand-built one because tier 1
drops it. Rule 4 is unchanged and still reachable: our run id on a task we never dispatched is routed
to us and refused. The remaining precondition — run ids unique across the drivers sharing a scheduler
([Q87](../questions/q87.md)) — is unchanged; within one runtime `RunIdInUse` already enforces it.

**For [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md).** Unchanged
in every rule. An unparseable id is still decided at the driver's tier 0 and reported by every driver,
each under its own run id, because the router broadcasts exactly that case. Rule 4's asymmetry — a
parseable foreign id reaches no `onUnmintedTask` — holds more strongly: it reaches no driver.

**Who decides ownership.** The runtime now takes tier 1's decision BEFORE its drivers do, from the
same parse of the same field, and takes no other. Tier 0 and tier 2 stay the driver's. No rule assigns
tier 1 to the driver alone — ADR 0023 rule 3 states what a driver does with another run's settlement,
and it still does that with every one it is handed.

**For [ADR 0022](0022-a-driver-takes-its-run-at-construction.md) and `ID-R3`.** The routing key IS the
run id the driver was constructed with, so *one driver, one run* is what makes a single key per
driver enough.

**Cost.** Two parses — the router's and the driver's own tier 0, unchanged — and one map lookup per
settlement, whatever N is, where the broadcast was N listener calls and N parses. An unparseable id
still costs one delivery per driver — it did before, and it is the case nobody minted. *(This read
"one parse": W142's conformity reader, finding 10.)*

**Two orders it fixes, stated because a consumer can see them.** A driver started DURING a broadcast
is not handed the event in flight — the broadcast list is copy-on-write, as `EventTarget` treats a
listener added mid-dispatch (both of W142's readers constructed the case; the first build pushed onto
the list it was iterating). And every routed driver now sits behind ONE scheduler listener, filed
when the first driver subscribed, so a consumer listener filed between run 1 and run 2 runs AFTER
run 2's driver where it used to run before it. Nothing in `spec/` or `AGENTS.md` depends on the second
(W142's conformity reader, finding 7).

**What it does not reach.** A consumer's own listeners on `runtime.scheduler` (a dashboard, a logger)
are the consumer's and still hear every event; N of those is the consumer's N². The L6 harness was one
such consumer, with eight a run, until W142 routed it by this decision's rule (`examples/run-flow.ts`,
`routeHarnessListener`). And `spec/runtime-targets.md`'s *the driver subscribes to an `EventTarget` and calls `addTask`*
stays true of the seam: on a runtime, the `EventTarget` behind the view is the scheduler.

## Alternatives rejected

| | why not |
|---|---|
| **A scheduler per run**, documented in `AGENTS.md` and leaving the cost | the maintainer's *not chosen* (P31 decision 2). It is also a pool set per run, which is what P18 decision 10 put on the runtime to avoid |
| **Filter by run id at the top of `Driver.onEvent`** | still N listener calls per settlement — the cost is the delivery, not the check |
| **Route inside `Driver`, through a registry keyed by scheduler** | module-level state shared by every driver in a process, and the driver would learn about other drivers, which `SchedulerLike`'s two methods deliberately do not let it do |
| **Read the run id with `split(':')[0]`** | cheaper, and wrong: `pc:ingest:x:0` has a run-id-shaped first segment and does not parse, so it would be routed to `pc` alone and `pd` would stop reporting it — ADR 0027 rule 3 lost for every driver but one |
| **Drop the routing entry when a run reaches a terminal outcome** | changes `RN-R25`'s text (*a finished run's driver still hears every settlement under its id*), and a run that is `awaiting_action` is not terminal and must keep hearing. ***Taken 2026-10-09, in a narrower form**, by [ADR 0091](0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md): at `done`'s quiescent point rather than at an outcome read mid-turn, with `RN-R25`'s text moved at v0.14, and `awaiting_action` not released* |
| **Route in the scheduler** | the scheduler has no notion of a run, and the fix is writable here — so it is not an upstream want ([doc/scheduler-upstream.md](../scheduler-upstream.md) takes a want with the workaround stated, and this IS the workaround) |
