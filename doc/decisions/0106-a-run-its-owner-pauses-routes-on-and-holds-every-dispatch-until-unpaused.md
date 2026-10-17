---
id: ADR 0106
title: "A run its owner pauses routes on and holds every dispatch until it is unpaused"
status: accepted
date: "2026-10-16"
item: W175
raised-by: P34
supersedes: ""
amends: ADR 0103; ADR 0104 rule 7; ADR 0105
resolves: ""
---

# ADR 0106 — A run its owner pauses routes on and holds every dispatch until it is unpaused

**Status:** accepted — [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 5 (the maintainer's,
2026-10-14/15) and stop-and-ask (e), answered *"as recommended"* 2026-10-16; written by
[W175](../work-items/w175-pausing-a-run.md). It defines `spec/run-state.md` v0.20's `RN-R34` and `RN-R35`. It builds the
DEFERRED form [ADR 0103](0103-every-halt-shares-one-dispatch-hold.md) reserved for a pause (its rule 6 and its
consequence *what ADR 0104-0106 inherit*), widens [ADR 0104](0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)
rule 7 by the held tasks P34 (c) names, and acts on [ADR 0105](0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md)'s
last consequence, *for W175's pause* (the front matter's `amends` names the ADRs; its grammar has no form for a
consequence). **Decision 3 — a pause taken AT REST, and a pending call DROPPED when its step halted or cancelled the run — is a
reading the plan did not settle**, taken here on ADR 0105 decision 4's ground, for the replay rather than for the routing;
**the maintainer RATIFIED both on 2026-10-17** (*"As recommended"*, on W175's reader round), so they are the answer
and not an override of it.

## Context

fyflow-app's #14 (P3): `driver.pause()` / `driver.unpause()`, both recorded, the running tasks finishing. The scheduler
has no pause (S6, not in 0.6.0), and the one road it offers — cancel what is queued and re-dispatch it — loses a queued
task's progress and reuses an id the scheduler has cancelled (P34 (e)'s rejected alternative). So the pause is ours,
at the one place this library decides to hand work on: `dispatch`.

Three facts bind the shape. **A dispatch held BEFORE its element reads to the fold as routing that never happened**:
`x` → `y` with `y` held unappended folds `completed` once `x` settles, and a stop would lose `y` (P34 fact 3). **A replay
feeds an owner's element only at a position BETWEEN two of the driver's steps** (`RN-R19`): it regenerates a step whole,
so an element appended mid-step is refused `diverged` at its own position — measured, a `paused` element moved between a
fan-out's `dispatched a` and `dispatched b` is refused at 5 (W175's L2). And the hold already has a deferred form, the
replay's — append, defer `addTask` — which ADR 0103 rule 6 keeps beside the shut one.

## Decision

1. **`driver.pause({ actor })` and `driver.unpause({ actor })`, each appending ONE fold input** — `{ kind: 'paused',
   actor }`, `{ kind: 'unpaused', actor }` (P34 (e)). Each returns nothing: a pause cancels nothing and has nothing to wait
   for.
2. **Refused by name, before anything is recorded** — `RunControlRefused`, `control: 'pause'` or `'unpause'`:
   `not-started`, `halted`, `cancelled` (`RN-R28`'s or a requested cancel), `interrupted` (a stop, taken or pending —
   a stopped run is paused or unpaused where it resumes), then **`paused`** for a second pause and **`not-paused`** for an
   unpause of a run that is not paused, each against the pause the owner has ASKED for — the last call still pending,
   else the pause taken — and, for a pause only, `ended` at rest. **An unpause is never `ended`**: it rewrites no outcome.
3. **Both are TAKEN AT REST** — at once for a call at rest, and when the driver's step ends for a call made from a
   callback on it (`leaveStep()`, in call order, before a stop pending on the same step). *A reading the plan did not
   settle*: a pause taken mid-step would put its element between two elements of one step, where the replay — which
   regenerates a step whole — refuses the checkpoint `diverged`. So the step a pause is called on finishes unpaused, its
   dispatches handed on — ADR 0105 decision 4's rule, for the replay's sake rather than the routing's. **A take is a step
   of its own**, so a call made from a callback on the element is taken after it, as on any step. **A call whose step then
   HALTED or CANCELLED the run is DROPPED at the take, recording nothing** (W175's conformity reader, G1): it would be
   refused now, and a `paused` landing after a `cancelRequested` would read paused on a run that can never be unpaused.
   Unlike a stop's (ADR 0105 decision 4's R9), whose element the resume needs. **Ratified by the maintainer, 2026-10-17.**
4. **A pause is NOT a halt and does not join `shut()`** (ADR 0103's consequence): the run ROUTES on, settlements of tasks
   already handed on are appended and routed, and `resolve()` is accepted. **Every dispatch from the `paused` element on
   is APPENDED and HELD** — its `dispatched` element in the log, its `createTask` and `addTask` deferred — ADR 0103 rule
   6's deferred form at rule 2's door. *Hold AFTER the append*, never before it (fact 3, above). **Not once a halt or a
   cancel request is on the run** — one raised on the task's own `dispatched` element: that task is handed on, ADR 0103
   rule 5's dispatch in progress, and a requested cancel then cancels it (W175's conformity reader, D1).
5. **The unpause appends ONE `unpaused` element and THEN hands each held task on, in DISPATCH ORDER** — `createTask`,
   then `addTask`, first held first. A dispatch made on that hand-off's own stack joins the END of the queue, so the
   scheduler receives every task in the order the log dispatched it. A halt raised inside the hand-off holds the rest
   (ADR 0103 rule 7's check, `holdsResume()`): what is left is never handed on. The hand-off runs in a `finally` after the
   element: a consumer callback that THROWS on it leaves the run unpaused AND its held tasks handed on (W174's C5
   lesson), and the throw reaches whoever is on the stack.
6. **The fold reads a FLAG, `RunState.paused`, and NO outcome** (P34 (e)): `true` from `paused` until `unpaused`; a held
   task is `dispatched`, so `running`, and the outcome of any sequence is the outcome without its pause elements — no
   precedence moves, `isTerminal` does not widen. **CURRENT**, and lifted by nothing but `unpaused` — not a stop, a
   resume, a cancel or a halt.
7. **A stop of a paused run** cancels only what the scheduler was handed (`handedOn`, ADR 0105's last consequence): a
   held task is sent nothing and stays in flight, dispatched and unsettled.
8. **A resume FEEDS `paused` and `unpaused`** (`RN-R19`'s fifth and sixth fed kinds), so a run stopped while paused
   resumes PAUSED: `resumed` names the whole in-flight set and EACH task is HELD again rather than handed on, until an
   unpause there — **a task the stopped run had handed on as much as one it held**, since the log cannot tell them apart
   and the resumed driver has handed on neither (W175's conformity reader, G2) — and **held BEFORE `resumed` is
   appended**, so a dispatch a callback on it causes joins the end of the queue (D2).
9. **A cancel of a paused run** hands each held task on, in dispatch order, and cancels it right after — P34 (c)'s
   *added then cancelled*, ADR 0104 rule 7 widened from a resume's not-yet-handed tasks to a pause's — so every held task
   ends in a settlement the scheduler writes (ADR 0007), and the run reads `cancelling` until the last.

## Consequences

- **BREAKING in 0.8.0** (P34 decision 10): `FoldInput` gains `paused` and `unpaused`, `RunState` gains `paused`,
  `RunControlRefused.control` gains `'pause'` and `'unpause'`, `RunControlRefusalReason` gains `'paused'` and
  `'not-paused'`. **`RunOutcome` does not move.**
- **Three `Driver` fields**, `paused`, `pauseHeld` (each held task's configuration, in dispatch order) and
  `pausePending` (calls accepted mid-step, empty at rest); `DRIVER_FIELDS` moves by name. **`RN-R13` gains a term while a
  run is paused**: each held dispatch's configuration — its composed payload — until it is handed on.
- **P34 prediction 7 holds**: with the item built and no case added, no L2-L5 assertion of a case that never pauses
  moved; the ladder went red only at the census sites a new field and a new cell move (`DRIVER_FIELDS`, four `RunState`
  literals).
- **A pause called from a callback does not hold that step's dispatches** — the cost of decision 3, stated in `RN-R35`
  and `AGENTS.md` section 8: a consumer that wants a branch held must pause before the settlement that routes to it.
- **No `RunHandle.pause()`**: (e) names the call on the driver, and `handle.driver.pause()` reaches it, as W173's
  cancel is reached — **the maintainer DECLINED a forwarding method, 2026-10-17** (W175's stop-and-ask S-5).
- **S6 is not needed** — the scheduler's queue is untouched; its index row says so.

## Alternatives rejected

| | why not |
|---|---|
| **Hold BEFORE the append** | a held routing decision not yet in the log: the fold calls a paused run `completed` once its running tasks settle, and a stop loses the held work (P34 (e), fact 3) |
| **A `'paused'` `RunOutcome`** | precedence against `awaiting_action` and `cancelling` must be decided, and `isTerminal`'s test widens (P34 (e)) |
| **Pause by cancelling what is queued** | a queued task's progress is lost, and its re-dispatch reuses an id the scheduler cancelled (P34 (e)) |
| **Take a pause at once, mid-step** | its element lands between two elements of one step and the resume refuses the checkpoint `diverged` (decision 3, measured) |
| **Hold the unpause's hand-off in a fixed snapshot of the held set** | a dispatch made on the hand-off's stack would reach the scheduler ahead of tasks dispatched before it |
| **Lift the pause on a stop, a cancel or a resume** | a run stopped while paused would resume unpaused and hand on work its owner held (P34 (e)) |
