# ADR 0023 — An inbound settlement is this run's only if this driver dispatched its task id

**Date:** 2026-08-31
**Status:** accepted
**Raised by:** W13 / [P4](../plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) / [Q72](../open-questions.md)

## Context

**Every `Driver` subscribes to the same three scheduler events and the listener path admits any task
id.** `ID-R3` refuses a second *run* on one *driver*; nothing refuses a second *driver* on one
*scheduler* — and `MultipleRuns`' own error message says *"construct a second Driver"*, so **a
consumer following the library's own advice produces the defect.**

Measured against the code before this was written, on `spec/examples/valid/linear.flow.json`:

| | |
|---|---|
| two drivers, one scheduler, one run each | driver A's settlement dispatches `run-a:publish:-:0` **twice** — once by A, once by B — which is the two-outcomes-under-one-key corruption `spec/task-id.md` section 2 exists to describe |
| what is reported | **nothing.** `ID-R1` cannot fire: each driver keeps its own dispatched-id set, so neither sees a duplicate |
| driver B's log | holds driver A's outcome record |
| a `run-9:` settlement delivered to a `run-1` driver | dispatches `run-9:publish:-:0` |

**[Q72](../open-questions.md)'s own text proposed filtering `Driver.onEvent` by run id, and the
measurement rejected it.** Six inbound task ids were probed against the shipped driver:

| inbound id | today | a run-id filter | **this ADR** |
|---|---|---|---|
| ours, dispatched | routes | routes | routes |
| **ours, a node we never dispatched** | **appended and routed** | **appended and routed** | **run stopped** |
| **ours, a node not in the definition at all** | **appended** | **appended** | **run stopped** |
| **ours, a branch path never opened** | **appended and routed** | **appended and routed** | **run stopped** |
| another run entirely | routed | ignored | ignored |
| malformed, does not parse | run stopped (`OR-R10`) | run stopped | run stopped |

**A run-id filter closes one of the four holes.** The driver already keeps a `dispatched` set for
`ID-R1`, and asking *"did I dispatch this?"* closes all four with no new state and subsumes the
run-id case — an id belonging to another run was, by construction, never dispatched by us.

**And the two halves are not the same failure**, which is the whole of this decision. Another run's
settlement arriving is **routine** the moment two drivers legitimately share a scheduler. Our own run
id on a task we never dispatched is **impossible** if the driver's bookkeeping is right — it is the
inbound counterpart of `ID-R1`, which `spec/task-id.md` section 3 already calls *"the assertion that
the argument held"*.

## Decision

1. **A settlement is this run's if and only if this driver dispatched its task id.** The check is
   `dispatched.has(taskId)` — the same set `ID-R1` is asserted against — and it happens **after**
   `parseTaskId` and **before** the record is appended.
2. **A task id that does not parse still stops the run, unchanged.** `OR-R10`. The guard sits after
   the parse precisely so that this keeps working: a malformed id is not "not ours", it is a
   scheduler or driver defect and it is attributable.
3. **A settlement whose run id is not this driver's run is ignored, silently, and nothing is
   appended.** It is another driver's business and this driver has no standing to judge it. It is not
   a failure, it is not counted, and it does not reach `onRunFailure` — with two drivers on one
   scheduler this is the normal case and every foreign settlement reaches it.
4. **A settlement carrying THIS driver's run id for a task it never dispatched stops the run**, with
   the new refusal **`ID-R4`** and the new error class **`UndispatchedTask`**, reported through
   `onRunFailure` rather than thrown — the listener boundary, `OR-R10`, exactly as `ID-R1` is.
5. **`ID-R4` is a refusal rather than a guard, for `ID-R1`'s reason.** Within one run the driver
   mints every task id it dispatches; a settlement under our own run id that we did not mint means
   either our path bookkeeping is wrong or something else is writing into our id space. Continuing
   past it corrupts the run in the way `spec/task-id.md` section 2 describes.
6. **This is independent of [ADR 0022](0022-a-driver-takes-its-run-at-construction.md) in mechanism
   and inseparable from it in advice.** Rules 1-5 were measured working with **no** surface change —
   301 assertions and 219 at L6, unchanged. What 0022 supplies is that `MultipleRuns`' advice to
   construct a second `Driver` is now safe to follow.

## Consequences

**Easier.** Two `Driver`s on one scheduler is a supported topology rather than a documented hazard,
which is what lets `AGENTS.md` delete the warning it carries in three places. A worker that calls
`context.spawnTask()` — which ADR 0001 says is never used for flow control — can no longer have its
task's settlement mistaken for a flow step. And `ID-R1` gains an inbound counterpart, so the
dispatched-id set is now load-bearing in both directions rather than only outbound.

**Harder, and it is the honest cost of rule 3.** **A driver is now silent about events it drops.** If
a consumer starts run `run-l` when it meant `run-1`, the `run-1` driver ignores every one of its
settlements and reports nothing; what the consumer sees is a run that never progresses. That is a
worse diagnostic than today's behaviour, which at least does *something*. It is accepted because the
alternative is worse in the common case — a driver that complains about another driver's run would
make the supported topology noisy — and because rule 4 keeps the one variant that is genuinely our
problem loud.

**A cost that is not a cost.** Rule 4 looks like it could fire on a scheduler retry. It cannot: the
scheduler retries a task under **the same id**, and our id's fourth segment is the *dispatch* attempt,
not the scheduler's. A `user_action` task fires two events for one dispatched id and both pass rule 1.

**What a future reader will try.** Adding an `onForeignSettlement` callback so rule 3 is observable.
Resist it until something needs it: it is a surface addition for a diagnostic, and
[Q20](../open-questions.md) — whether a run id is global at all — is the question that decides
whether a driver should have an opinion about other runs. If it lands, that is where this belongs.

## Alternatives rejected

| | why not |
|---|---|
| **Filter by run id in `onEvent`**, which is what [Q72](../open-questions.md) proposed | **Measured: closes one of four holes.** Three of the four have nothing to do with run ids, and the run-id case is already covered by the dispatched-set check |
| **Refuse a second `Driver` on one scheduler** — the "one driver per scheduler" rule `AGENTS.md` documents today | Unenforceable without the driver interrogating the scheduler, which `SchedulerLike`'s two methods deliberately do not allow ([ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1). It also forbids a topology there is no reason to forbid |
| **Make rule 3 loud too** — report or throw on any settlement that is not ours | With two drivers on one scheduler every foreign settlement hits it. A refusal that fires on the normal case is noise, and noise gets suppressed |
| **Make rule 4 silent too**, so the guard is one line | It would silently drop the three cases that are genuinely defects, which is the objection [Q72](../open-questions.md) raised against filtering — *"a driver that silently ignores an unknown run id drops a real defect"*. That objection is right about half the cases, and this rule is where it lands |
| **Check `nodeId` against the definition instead of the dispatched set** | Catches the *not in the definition* case and misses the other two. The dispatched set is stricter and already exists |
