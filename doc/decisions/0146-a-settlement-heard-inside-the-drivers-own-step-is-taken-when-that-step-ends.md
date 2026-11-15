---
id: ADR 0146
title: "A settlement heard inside the driver's own step is copied there and taken when that step ends"
status: accepted
date: "2026-11-15"
item: W232
raised-by: W232
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0146 — A settlement heard inside the driver's own step is copied there and taken when that step ends

**Raised by:** [W232](../work-items/w232-a-settlement-inside-the-drivers-own-step-is-taken-when-that-step-ends.md), from
the review of the pull request carrying [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md)
(finding 3). The maintainer's decision, 2026-11-15: *(b) the general fix now*, after W232's first attempt was measured
wrong.

## Context

`SchedulerLike` is two methods, and nothing in it says WHEN a task settles. `fyflow-scheduler` at the pin settles
asynchronously; a consumer's test double, or a scheduler of its own, may settle a task inside the `addTask` that hands it
over. The driver then heard that settlement on the stack of the step that dispatched the task, and appended and routed
it there.

| measured on the tree before W232, by its readers — and red in its suites with the queue switched off | |
|---|---|
| a loop of 5000 rounds on such a scheduler | does not complete — a round's frames per round. How it shows depends on the double's own frames: a reported `RangeError` on W232's, a run left `stuck` or `running` after 292-515 tasks with nothing reported on its conformity reader's |
| a plain fan-out on such a scheduler, the shipped policy, resumed from each element of its completed log | **refused as diverged at 7 of 14 cuts**: branch `a`'s settlement was appended before branch `b` was dispatched, an order no replay regenerates, because a replay feeds each stored settlement AT REST (`RN-R19`) |
| a `pause()` or a `stop()` called from a callback on such a scheduler | taken after the whole run: the run was one step |

W232's first attempt fixed the first row alone, for a loop alone — the loop opening its next round from the frame that
opened the first — and its conformity reader measured that it MOVED the appended order in two shapes and made a resume
refuse 16 of 30 cuts in one of them. The loop was never the defect. The defect is the second sentence of this section.

The driver already holds the pattern. A `task.running` an inline pool fires inside `addTask` is queued and appended when
the step ends — *each BETWEEN two of the driver's steps, where a replay feeds it* (`RN-R40`, ADR 0113).

## Decision

1. **A settlement heard while the driver is on the stack of its own step is COPIED where it is heard and TAKEN — appended
   and routed — when that step has ended.** *Heard inside a step* is: the listener runs while a driver step is already
   open below it. Everything a listener does before the append happens where the event is heard: `ID-R4`'s tiers, and the
   normalisation that copies every field (`OR-R1`, `OR-R2`) and refuses an uncloneable result (`OR-R6`). `OR-R1` is not
   relaxed: nothing of the event is retained past the listener's return.
2. **Taken LAST at the step's end, one settlement a step, in the order heard**: after the attempts heard on the step
   (`RN-R40`), a pending pause, unpause or resolution (`RN-R35`, `RN-R37`) and a pending stop (`RN-R33`). That is the
   order a scheduler that settles LATER gives — the order HEARD, which is dispatch order only for a scheduler that
   settles each task inside its own `addTask`: the step that dispatched ends, and then the settlement arrives. A driver
   gone deaf by a stop taken there hears none of them.
3. **Each is a LISTENER's step** (`OR-R10`): a throw from one is reported and the run halted, and is not thrown to whoever
   called the driver — the caller of `start()` did not dispatch round 3.
4. **What HALTS the run does NOT wait.** A `cancelled` settlement routes nothing and halts the run (`RN-R28`), and a
   halt is taken where it is raised, so the step it lands in dispatches, routes and emits nothing further (`RN-R29`).
   Queueing it would let that step run on — nine existing cases across `RN-R28`, `RN-R29`, `RN-R33` and `RN-R35` pin
   exactly that and none was changed. The same holds, by decision 1, for a settlement REFUSED where it is heard
   (`OR-R6`, `ID-R4` tier 2). **The cost, stated**: settlements heard BEFORE such a halt and still waiting are
   appended AFTER it, in the order heard, routed nowhere — the treatment of any settlement on a halted run — so around
   a halt heard inside a step the appended order is not the order heard. Such a run is halted or cancelled, which a
   resume refuses anyway.
5. **A settlement heard at rest is taken at once**, as before. Nothing moves for a scheduler that settles later, which
   is every run on `fyflow-scheduler`.

## Consequences

- **`spec/run-state.md` v0.39, `RN-R46`; `spec/outcome-record.md` v0.22, one clause in `OR-R10`.** No fold input, no event, no format: the queue holds what the log is about to
  be handed, for the length of one step.
- **A scheduler that settles inside `addTask` now produces the log a later-settling one does**, in the order heard,
  wherever no halt is heard inside a step (decision 4) — measured for a sequence, a fan-out, a map, nested regions,
  a loop, and both shapes W232's first attempt moved; and by its readers for gates, asks, attempts, resolutions, a
  mixed scheduler and two drivers on one scheduler. So such
  a run resumes from every cut, and a pause, a stop or a cancel from a callback is taken at the step it was called on.
- **The stack no longer grows with what a run does**: each settlement is its own step. 5000 rounds of a loop complete.
- **BREAKING for a consumer whose test double settles inside `addTask`, and for nobody else**: the order of its log
  changes wherever more than one task is in flight — a fan-out's branches are all dispatched before the first settles,
  where they interleaved — and a throw while a later task is dispatched is reported, not thrown from `start()`,
  `resume()`, `resolve()` or `unpause()` (`spec/outcome-record.md` `OR-R10` v0.22).
- **A checkpoint taken while a settlement waits holds that task in flight**, as it would had the scheduler not settled
  it yet; a resume re-dispatches it.
- **Not fixed here**: the stack growing per round for a loop whose body is an ask answered from a callback
  (`leaveStep -> takePending -> takeAnswer`), which is not a scheduler's settlement.

## Alternatives rejected

| alternative | why not |
|---|---|
| the loop opens its next round from a flat frame (W232's first attempt) | fixes the stack for a loop only; measured to move the appended order in two shapes and to break resume in one; leaves the fan-out resume failure and the late pause |
| queue EVERY settlement, `cancelled` included | a cancelled settlement heard mid-step would no longer shut that step's doors: nine existing cases across four rules pin the opposite, and `RN-R29` exists for it |
| state the limit and change nothing — a scheduler must not settle inside `addTask` | leaves a public seam that accepts a scheduler whose runs cannot be resumed, with nothing refusing it |
| refuse such a scheduler by name | the driver cannot know until the first nested settlement, by which time it has dispatched |
