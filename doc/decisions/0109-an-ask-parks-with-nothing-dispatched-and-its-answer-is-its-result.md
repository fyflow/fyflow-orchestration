---
id: ADR 0109
title: "An ask parks with nothing dispatched, and its answer is its result"
status: accepted
date: "2026-10-17"
item: W180
raised-by: P35
supersedes: ""
amends: ADR 0004 in part
resolves: ""
---

# ADR 0109 — An ask parks with nothing dispatched, and its answer is its result

**Status:** accepted — [P35](../plans/p35-may-a-node-wait-for-a-person-by-design.md) stop-and-asks (b)-(f) and (i),
answered *"as recommended"* by the maintainer 2026-10-17, with decisions 5, 8 and 9; written by
[W180](../work-items/w180-asking-and-answering-in-a-run.md). It defines `spec/run-state.md` v0.22 (`RN-R36`, `RN-R37`),
`spec/outcome-record.md` v0.18 (`RS-R1`, section 7), `spec/flow-definition.md` v0.43 (`FD-R4`'s resolve boundary) and
`spec/join-policy.md` v0.23 (`JP-R5`'s guarantor). **It decides what a RUN does with an ask**; the node itself is
[ADR 0108](0108-an-ask-is-a-seventh-node-kind-with-a-task-id-and-no-dispatch.md)'s, and an ask under cancel, stop,
pause and resume beyond what rule 2 forces is W181's (P35 (g)). *(2026-10-17: settled by
[W181](../work-items/w181-an-ask-under-run-control.md) as `spec/run-state.md` v0.23 `RN-R38` — a parked ask is a parked task to
run control — with no driver line changed; nothing in this ADR moves.)*

## Context

ADR 0108 made an ask a valid node — a task id, no dispatch, its answer its output — and refused every run that reached
one (its rule 8). Five facts bind what a run does instead (P35 facts 2-6, 13). **Parking rested on a SETTLEMENT**:
`RS-R1`'s *suspended* was a `user_action` outcome record, and `effectiveOutcome` returned `null` for a task with none,
so a resolution alone routed nothing. **The driver may not author a terminal state** (`OR-R3`, ADR 0060 rule 3, ADR
0007): a driver-written `user_action` outcome would be one. **A `dispatched` element is the precedent that does not**: a
structural fact the fold reads a node state from. **`awaiting_action` follows from any `suspended` node** (`RN-R7`) with
nothing in the outcome vocabulary moved. **What reaches a node is composed in the driver** (`compose`), and keeping it
was refused for every task by ADR 0046 as Q19's retention — scoped to an ask it is one value per ask reached.

## Decision

1. **Reached, an ask PARKS with NOTHING handed to the scheduler**: ONE new fold input, `{ kind: 'asked', taskId, input }`
   — `taskId` the ask's own, `input` the driver's DEEP COPY of what reached it (its `needs` composed, else the edge's
   value). No `dispatched` element, no `createTask`, no `addTask`; in a region, `branch.suspended`, so the branch stays
   live and its join waits (Q7). **A structural fact, never a terminal state and never an outcome record** (P35
   decision 5): the person's answer is the only terminal fact. `FoldInput` gains its fifteenth kind — **BREAKING** for
   an exhaustive switch (P35 decision 8).
2. **On resume the `asked` element is REGENERATED, never fed** (`RN-R19`): the replay re-enters the ask and compares
   the element, input and all, with the stored one AS STRUCTURED-CLONE DATA — a `Map`, `Set`, `Date`, `RegExp`, `Error`,
   binary data and an array's length each compared, not only a plain object's keys (W180's readers, R13); a different
   input is refused `diverged` there (`RN-R20`).
3. **The fold reads the node `suspended` and the run `awaiting_action` — REUSED**: no new `NodeState`, no new
   `RunOutcome`, no precedence moved (P35 (c)). A reader tells an ask from a parked failure by the node's KIND or by the
   `asked` element, never by an error string.
4. **What reached it is KEPT, always**: on the element, and in the fold as the OPTIONAL `NodeRun.input`, set only on an
   ask's node and kept after the answer — additive, not BREAKING; no size cap (P35 (f)).
5. **The answer is `resolve(taskId, 'done' | 'failed', { result?, error?, actor })` — the existing call and the existing
   `resolution` record** (P35 (b), (d)). `RS-R1`'s *suspended* is widened: also *an `asked` element for the task and no
   record after it*. A `done` answer is held to the ask's `answerSchema` at `FD-R4`'s resolve boundary — refused as
   `BoundaryRefused` by name, NOTHING appended, the ask still parked, a corrected answer accepted on the same driver;
   `validateBoundaries: false` turns it off; an ask with no `answerSchema` holds nothing. A `failed` answer is the person
   DECLINING, held to nothing. **An answer given MID-STEP is accepted at the call and TAKEN AT REST** — every refusal
   asked at the call, `resolve()` returning `true`, the resolution appended when the step ends — so it lands between two
   steps, where a resume's replay feeds it (P35's brief sentence; W180's conformity reader, R4). **And so is every
   resolution given mid-step, a parked task's too** — a design change the maintainer ratified on W180's S-4: the
   parked-task road read `branch.suspended` after its branch had arrived and its checkpoint was unresumable.
6. **The answer IS the node's result** (P35 (e)). The effective outcome of an ask is DERIVED from its resolution
   (`spec/outcome-record.md` section 7): the answer's state, the answer as `result`, the decline's `error`, `attempts` `0`
   and `startTime`, `endTime` and `executionTime` `null` — and **`OutcomeRecord.schedulerTimestamp` widens to
   `number | null`**, `null` for an ask, **BREAKING** for a consumer typed on `number`. It routes as a task's settlement
   does (`on`, a `when` over `outcome.result`; ADR 0108 rule 4); the successor RECEIVES the answer; a later node's `needs`
   naming the ask reads the answer, and the value that reached the ask stays reachable by naming its producer.
7. **ADR 0004 rules 4-6 are AMENDED, not superseded**: a resolution still is a log record and still supplies an outcome
   — for a parked task, the outcome of a dispatch that already happened; **for an ask, the outcome of NO dispatch**, the
   node waiting by design. `doc/concept.md` section 7's resolve exception says so in one clause (P35 (i)).
8. **The three `ended` refusals count an unanswered ask as PARKED** (P35 fact 5 (iv)): a run waiting only on a person
   is not finished. *(P35 placed this in W181; W180 made it observable, so it is taken here — W180's departure D1.)*

## Consequences

- **A question is not an error.** The app's workaround — a worker that throws its question, an input stored on the
  side, an answer schema checked by hand (P35 fact 8) — is one node with no worker, its input in the run's own sequence,
  its answer held by the library.
- **The checkpoint grows by one input per ask reached** — the same order as the result its predecessor already stored.
- **`JP-R5`'s ordering clause is LOAD-BEARING from here** (`spec/join-policy.md` v0.23): entering a branch-entry ask
  emits, and the driver's two-pass `branch.opened` loops are the clause's only guarantor; an L2 case fails if either
  interleaves.
- **An answer given inside `onFoldInput` on the `asked` element is accepted and PENDING** (the ask is parked from its
  element on): the park completes in its step and the resolution follows at rest, so the run's checkpoint resumes. A
  parked TASK resolved the same way is now taken at rest too (rule 5, S-4).
- **A future reader will try** to write the park as a driver-authored `user_action` outcome (*no new kind, every reader
  unchanged*) — refused by `OR-R3`, ADR 0060 and ADR 0007: the driver would author a terminal state; or to hand the
  successor `{ input, answer }` (the app's `keepInput`) — refused: an ask's result would then differ in SHAPE by how it
  was answered, and `needs` already reaches the input's producer.

## Alternatives rejected

| | why not |
|---|---|
| A driver-written `outcome` with `user_action` at the park | a terminal state the driver authored — `OR-R3`, ADR 0060 rule 3, ADR 0007 |
| A second new kind for the answer (`answered`) | the fold, `isFed`, the replay, `RS-R1`'s refusals and every reader of resolutions gain a twin |
| A new `NodeState` `'asking'` / `RunOutcome` `'awaiting_answer'` | `isTerminal`, `RN-R7`'s precedence, `RN-R12`'s titles and every UI keyed on `awaiting_action` move — what the app's #2 asks not to happen |
| A new `driver.answer(taskId, answer, { actor })` | two calls doing one thing; `RunHandle`, the runtime and every UI's resolve path gain a second road |
| A refusal RETURNED (`false` or findings) | `resolve`'s `false` already means *not suspended*, and `FD-R4`'s rule is a thrown refusal by name |
| `schedulerTimestamp` `0` for an ask | no type change, but a number that says a scheduler stamped it |
| The input opt-in (`keepInput`), dropped at the answer, or behind an accessor | decision 1 of P35 says the node's record carries what reached it; a UI reading a finished run loses what the person was shown; an accessor is not a fold of the log |
| The park re-fed on resume, like a resolution | only an outside act is fed (`RN-R19`); a park the replay can regenerate is compared, which is what refuses a changed input |
