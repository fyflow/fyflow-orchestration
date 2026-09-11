# ADR 0023 — An inbound settlement is this run's only if this driver dispatched its task id

**Date:** 2026-08-31
**Status:** accepted — **rule 1 corrected and two preconditions added in place, 2026-08-31**, see *Correction*.
**Rule 2 SUPERSEDED 2026-09-02 by [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)**, which retires the first of those two preconditions with it. Rules 1 and 3-6 stand
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
| malformed, does not parse | run stopped (`OR-R10`) | run stopped | ~~run stopped~~ — **rule 2, superseded 2026-09-02: [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) reports it and drops it** |

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
   `dispatched.has(taskId)` — the same set `ID-R1` is asserted against — and **ownership is decided
   from the task id alone, before anything else reads the detail** (*Correction* 1; this clause first
   read *"after `parseTaskId` and before the record is appended"*, which was not far enough forward
   and made rule 3 false).
2. ~~**A task id that does not parse still stops the run, unchanged.** `OR-R10`. The guard sits after
   the parse precisely so that this keeps working: a malformed id is not "not ours", it is a
   scheduler or driver defect and it is attributable.~~ **SUPERSEDED 2026-09-02 by
   [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md).** The rule was
   right that a malformed id is attributable and wrong about who to attribute it to: `buildTaskId`
   emits only parseable ids, so an unparseable one was minted by **no** driver and stopping *this*
   run for it is collateral damage. It is now **`ID-R5`** — decided at tier 0, ahead of rule 1's
   comparison, **reported** through `onUnmintedTask` and dropped. The guard's ORDER is unchanged and
   still matters: ownership is still decided from the task id alone before anything reads the detail.
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

> **This paragraph was tested on 2026-09-02 and it held.**
> [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) adds
> `onUnmintedTask`, which is the same *shape* of addition — a callback for a settlement the driver
> drops — and it deliberately does **not** cover rule 3. The distinction that let one through and
> not the other is **who else will report the thing**: another run's settlement is reported by the
> driver that owns that run, and an unparseable id is reported by nobody. So this paragraph stands
> unamended, and ADR 0027 rule 4 says in its own words why it is not the exception.

## Alternatives rejected

| | why not |
|---|---|
| **Filter by run id in `onEvent`**, which is what [Q72](../open-questions.md) proposed | **Measured: closes one of four holes.** Three of the four have nothing to do with run ids, and the run-id case is already covered by the dispatched-set check |
| **Refuse a second `Driver` on one scheduler** — the "one driver per scheduler" rule `AGENTS.md` documents today | Unenforceable without the driver interrogating the scheduler, which `SchedulerLike`'s two methods deliberately do not allow ([ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1). It also forbids a topology there is no reason to forbid |
| **Make rule 3 loud too** — report or throw on any settlement that is not ours | With two drivers on one scheduler every foreign settlement hits it. A refusal that fires on the normal case is noise, and noise gets suppressed |
| **Make rule 4 silent too**, so the guard is one line | It would silently drop the three cases that are genuinely defects, which is the objection [Q72](../open-questions.md) raised against filtering — *"a driver that silently ignores an unknown run id drops a real defect"*. That objection is right about half the cases, and this rule is where it lands |
| **Check `nodeId` against the definition instead of the dispatched set** | Catches the *not in the definition* case and misses the other two. The dispatched set is stricter and already exists |

---

## Correction — 2026-08-31

**Found by W13's spec-conformity pass and, in part, independently by its test-adequacy pass**, both
run against the commit that first carried this ADR. **Rule 1's ordering was wrong, and two
preconditions of the topology this ADR blesses were unstated.** Nothing in the Decision is withdrawn;
one clause is corrected and two are added.

### 1. Rule 1's *"after `parseTaskId`"* was not far enough forward, and rule 3 was false because of it

Rule 1 placed the ownership test after `parseTaskId` on the assumption that nothing earlier could
throw. **`normalizeEvent` can.** It deep-copies `result` and raises `UncloneableResult` (`OR-R6`)
when the copy fails — and it ran *before* the ownership test. Measured:

```
a run-a driver receives { id: 'run-9:ingest:-:0', state: 'done', result: () => 1 }
  -> onRunFailure({ kind: 'UncloneableResult', runId: 'run-9' }),  hasFailed() === true
```

Rule 3 says a foreign settlement *"is not a failure, is not counted, and does not reach
`onRunFailure`"*. **All three were false**, on precisely the `OR-R6` path ladder L6's `uncloneable`
row exercises, on the very topology this ADR exists to make safe. One driver's worker bug stopped
another driver's run and named that other run in the report.

**Rule 1 is corrected to:** *ownership is decided from the **task id alone**, before anything else
reads the detail.* `parseTaskId` still runs first, so rule 2 is unchanged. This is also cheaper — a
driver no longer deep-copies the result of every settlement it is about to discard, which at the
scale this repository targets is `O(drivers)` wasted clones per settlement.
*(This read "the 1000s-10000s scale `doc/concept.md` targets" until
[P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s declaration went to check the
number. **`doc/concept.md` does not carry it** — what it says is *"Flows are instantiated per
workload, thousands at a time"*, and the `1000s-10000s` figure is `FLOW_PLANNING.md`'s, in the
scheduler repository, **which is not on this machine**: that file was lost when
[ADR 0029](0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
`git worktree remove --force` went through the sibling, and the restore came from the published
package, which ships no planning documents. **The scale claim is not withdrawn and the argument is
unaffected** — P15 fact 5 brackets *thousands at a time* on both sides with a measured run — but an
agent who goes to check the citation finds nothing, which is `doc/workflow.md` section 1 rule 5's
provenance clause on a citation rather than on a count.)*

**A second consequence, recorded because it is a behaviour change:** a `user_action` task fires two
events for one task (ADR 0007 rule 2), and the first of them — `task.failed` carrying
`state: 'user_action'` — used to be dropped by `normalizeEvent` before reaching the guard. It now
reaches it. For a **dispatched** task nothing changes. For an **undispatched** one, both events are
refused, so `onRunFailure` fires twice for one settlement. The run still stops exactly once, which is
what `RN-R8` and the fold turn on, and `test/driver/lifetime.test.ts` asserts that invariant rather
than a per-state count.

### 2. The blessed topology has two preconditions, and neither was stated

| precondition | what happens without it |
|---|---|
| ~~**Every task on a driver's scheduler carries a task id some driver minted.**~~ **RETIRED 2026-09-02** | ~~A plain non-flow task settling on a shared scheduler does not parse, so rule 2 stops **every driver on that scheduler**. Measured.~~ That was the precondition and it is now **the defect [ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) removes.** Q86 is **answered**, in the direction this row raised: an unparseable id is treated as *not ours*, and reported so that the one case where it might be ours is not a silent hang. **The topology needs no such precondition any more** |
| **Run ids are unique across the drivers sharing one scheduler.** | Two drivers constructed with the **same** run id mint the same task ids, so `dispatched.has()` is true in both and `ID-R4` is not violated. Measured: one settlement produces **two** dispatches of the successor, with nothing reported — [Q72](../open-questions.md)'s corruption verbatim, for the one case this ADR does not close. No driver can detect it: `SchedulerLike` has two methods and neither asks who else is subscribed. [Q87](../open-questions.md) |

**Rule 6's *"a second `Driver` on the same scheduler is now safe"* is therefore true of drivers with
distinct run ids, ~~on a scheduler carrying only flow tasks~~ — **on any scheduler, since
[ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)**. `AGENTS.md`
section 9 and `spec/task-id.md` `ID-R4` state the one **remaining** precondition rather than leaving
it to a reader: run ids unique across the drivers sharing one scheduler, which no driver can detect
([Q87](../open-questions.md)) and which `MultipleRuns`' own message now names.

### 3. The *Consequences* claim about `context.spawnTask()` was misleading

It read: *"a worker that calls `context.spawnTask()` … can no longer have its task's settlement
mistaken for a flow step."* `spawnConfig.id` is caller-supplied
(`../fyflow-scheduler/core/FyflowScheduler.ts:1466`), so a spawned id will not parse — and the actual
outcome is that the settlement **stops the run** under rule 2, not that it is harmlessly ignored.
That is unchanged behaviour with a bad outcome, listed as a benefit. It is the same fact as
precondition 1 and it is [Q86](../open-questions.md). **Since
[ADR 0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) the *Consequences*
claim is true as written**: a spawned task's settlement no longer stops the run, it is reported and
dropped. The sentence was not wrong about what should happen — it was wrong about what did.
