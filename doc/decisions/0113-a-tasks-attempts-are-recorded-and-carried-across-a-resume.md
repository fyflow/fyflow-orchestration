---
id: ADR 0113
title: "A task's attempts are recorded as a fold input and carried across a resume as attemptsSpent"
status: accepted
date: "2026-10-18"
item: W186
raised-by: P36
supersedes: ""
amends: ADR 0065 in part
resolves: Q365, Q26
---

# ADR 0113 — A task's attempts are recorded as a fold input and carried across a resume as attemptsSpent

**Status:** accepted — [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) stop-and-asks (f),
(g), (h) and (i), answered *"as recommended"* by the maintainer 2026-10-18; written by
[W186](../work-items/w186-attempts-recorded-and-carried-across-a-resume.md). It defines `spec/run-state.md` v0.26
(`RN-R40`; `RN-R19`, `RN-R21` and `RN-R26` move) and `spec/outcome-record.md` v0.20 (`OR-R4` and section 2's `attempts`).
**It amends [ADR 0065](0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md)**
where that decision hands an in-flight task on *"with a fresh retry budget"* and names the budget a cost; nothing else in
ADR 0065 moves. It answers [Q365](../questions/q365.md) and [Q26](../questions/q26.md) — *`resolves` names them since
W186's record step, with each question's `resolved-by`, which `check:register` `R8` binds both ways.*

## Context

A resume hands every task in flight at the kill to a fresh scheduler at the same id (ADR 0065). The log records a task's
`attempts` only when it SETTLES, so the attempts a task spent before the kill were recorded nowhere, and it ran again at a
fresh budget — measured at P23: two attempts' budget ran THREE times across one kill (Q365). Q365 was deferred on Q26:
nothing recorded `task.running`. fyflow-app asked for both (its #10, P3) and asked whether a STOPPED attempt counts (#18).

The scheduler at the pin (P36 fact 1) supplies the two halves: `task.running` carries a 1-based `attemptNumber`,
once per attempt and again with the same number after a requeue; and `new FyflowTask({ attemptsSpent })` starts a task's
`attempts` there — a task whose budget is spent still runs ONCE (P36 fact 3). Its own `AGENTS.md` recipe is exactly this:
record `max(stored, attemptNumber)` on `task.running`, pass it back as `attemptsSpent`.

**Measured at W186's declaration step, and it shaped rule 3**: on an INLINE pool the scheduler fires `task.running`
synchronously INSIDE `addTask` — on the driver's own step — and on a threaded pool on a later turn (node 24.20.0 and deno
2.9.6, the same output). An element appended where it was heard would sit between two elements of one step, where a
replay — which regenerates a step whole — refuses the checkpoint `diverged`.

## Decision

1. **Each attempt of a task the run dispatched is a FOLD INPUT, `{ kind: 'attempted', taskId, attemptNumber }`, and never
   a log record** — `cancelRequested`'s precedent (`OR-R4`): the log keeps its two kinds and `snapshot()` does not move.
   The driver subscribes `task.running` (its fifth event name) and copies `id` and `attemptNumber` in the listener (`OR-R1`).
2. **Appended only for a task THIS run dispatched, and only when the number EXCEEDS the last recorded for it** — so a
   requeue, which repeats its number, appends nothing — for EVERY task, whatever its `retryPolicy` ((f)). Another run's id,
   an unminted id, an undispatched task of this run and a detail with no positive integer number are dropped in SILENCE:
   an attempt start is never a refusal and never stops a run.
3. **Appended AT REST**: every attempt heard on a step is appended when that step ends, in the order heard, as one step of
   its own and BEFORE any pause, unpause, answer or stop pending on that step is taken. So the element always lies between
   two steps — the brief's *an owner element a resume's replay feeds is TAKEN AT REST*, applied to a scheduler element that
   an inline pool delivers mid-step — and the attempt in flight at a stop is in the log before `interrupted`.
4. **FED to a replay** at its position (`RN-R19`'s seventh kind) — only the scheduler produces it — and refused `diverged`
   there when it names a task the replay never dispatched, a number that is not a positive integer, or one that does not
   RISE over the last stored for its task — the driver appends only a rise, so that store is not one the run wrote.
5. **A resume re-hands each in-flight task with `attemptsSpent` = the highest number recorded for it**, a `TaskFactory`
   config key present only when above 0, for a task with no `retryPolicy` too ((g)). **A spent budget is handed on all
   the same**: the scheduler runs it once and settles it — at most one attempt over budget per resume — and the driver
   writes NO settlement (P36 decision 7; `OR-R3`, ADR 0060 rule 3, ADR 0007).
6. **A stopped attempt counts as spent, as a killed one does — no special case** ((h)): `stop()` goes deaf at its take,
   after the step's attempts were appended, so an attempt that started before the stop is in the log and one after it is
   not.
7. **`OutcomeRecord.attempts` stays the scheduler's own count** ((i)) — which starts at `attemptsSpent`, so a settlement
   after a resume counts every process's attempts; the listener subtracts nothing.
8. **The fold moves nothing for it at v0.26.** What an attempt changes is what a resume re-hands, which the driver reads off
   its own sequence; `NodeRun`'s attempt fields are W187's (P36 (j)).

## Consequences

**What this makes easy.** Q365 closes with one recorded element per attempt and one optional key on a re-dispatch: a
task's retry budget survives a crash and a stop, and the scheduler does the counting. Measured on a real scheduler in both
runtimes at W186's declaration: a task of `maxRetries: 2` whose store froze in its SECOND attempt ran ONCE more on the
resume — three worker calls across both processes — where the same checkpoint without its `attempted` elements ran three
more: five. *(A probe, not checked in — its executable home is W188's L6 exit clauses (4)-(6), P36's exit artifact.)*

**What this makes hard, and the cost is real.**

1. **BREAKING for a consumer switching on `FoldInput['kind']` exhaustively** — a sixteenth kind (P36 decision 8, (p)).
2. **Every run on a real scheduler grows by one element per attempt started**: a store holds about one more element per
   task. A run on a double that fires no `task.running` is byte-identical.
3. **The attempt is recorded LATER than it was heard** when an inline pool starts the task inside the driver's own step:
   at the step's end. A consumer reading the sequence sees the step's elements, then its attempts.
4. **A `createTask` that builds the task FIELD BY FIELD must copy `attemptsSpent`**, or the resumed task starts at a fresh
   budget again — silently. The default factory spreads the config into `new FyflowTask(config)` and needs nothing.
5. **A mid-step checkpoint loses the attempts its step had not yet appended** — they are fed, never regenerated — so a task
   dispatched in a lost tail is re-handed with no `attemptsSpent`. At-least-once already re-runs that work; the budget
   it undercounts is at most the attempt the lost tail started.
6. **The driver now hears `task.running` for every task on its scheduler** — on a runtime, routed by id (ADR 0088); an id
   that does not parse is broadcast to every driver and dropped by each, one more broadcast per plain task's attempt.

**What a future reader is likely to try that this forbids.** Writing the count into the LOG as a record — the log is
settlements and resolutions (`OR-R3`, `OR-R4`). Folding a task whose budget is spent as `failed` — a settlement the driver
authored. Subtracting `attemptsSpent` from a record's `attempts` — a number no scheduler reported. Appending an attempt
where it was heard — a checkpoint the replay refuses `diverged` on every inline pool.

## Alternatives rejected

| | why not |
|---|---|
| record only tasks whose `retryPolicy` has `maxRetries > 0` | a rule depending on a policy the fold cannot see, and no attempt number for the rest ((f)) |
| record `task.retrying` only | the attempt in flight at a kill is not counted — one attempt more per kill than asked ((f)) |
| a pass-through callback only | nothing durable, so #10 is not met ((f)) |
| fold a spent budget as `failed` | the driver authors a terminal state — `OR-R3`, ADR 0060 rule 3 and ADR 0007 refuse it ((g), fact 7) |
| do not re-hand a spent task | in flight for ever, the run `running`, `done` pending ((g)) |
| subtract the stopped attempt on a resume | a kill and a stop counted differently, and a task that finished before its cancel ambiguous either way ((h)) |
| subtract `attemptsSpent` in the listener | driver arithmetic on a scheduler field ((i)) |
| append `attempted` where it is heard | on an inline pool that is mid-step, and the replay refuses the checkpoint `diverged` (W186's measurement) |
