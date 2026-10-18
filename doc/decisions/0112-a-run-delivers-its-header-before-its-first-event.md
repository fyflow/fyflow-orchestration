---
id: ADR 0112
title: "A run delivers its checkpoint header before its first event, through a driver option start() calls once"
status: accepted
date: "2026-10-18"
item: W185
raised-by: P36
supersedes: ""
amends: ADR 0064 in part
resolves: ""
---

# ADR 0112 — A run delivers its checkpoint header before its first event, through a driver option start() calls once

**Status:** accepted — [P36](../plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) decision 1 (the
maintainer, 2026-10-14/15) and stop-and-asks (d) and (e), answered *"as recommended"* 2026-10-18; written by
[W185](../work-items/w185-the-header-before-the-first-event.md). It defines `spec/run-state.md` v0.25 (`RN-R39`; `RN-R15`,
`RN-R18` and `RN-R25` move). **It reverses [ADR 0064](0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)'s
last rejected-alternative row** and qualifies its consequence 1; nothing else in ADR 0064 moves.

## Context

ADR 0064 made a checkpoint `{ header, events }` and handed the header out on `runtime.start`'s handle — which exists
only once `start` has returned, and `start` dispatches the entry node synchronously, so a consumer's `onFoldInput` is
handed 1 to 5 elements (2N + 1 for an entry fan-out of N) BEFORE the header (its fact 5; P36 fact 5 re-took it unchanged).
It rejected a callback that would deliver the header first — *"a second channel for one fact; the position already makes
write order irrelevant"*. That is true of ORDERING — a store keyed by position holds the same prefix whatever it wrote
first — and silent on a CRASH between the first element's write and the header's: the store then holds events with no
header, which no resume can read (`RN-R14`: a checkpoint is a header AND the events). fyflow-app hit exactly that (its
#9) and asked for the header before the first event.

Where it can be delivered is fixed by the code, not chosen: `StartOptions` is a `Pick` of `DriverOptions`, and the
runtime's `start` is `driver.start(payload)` — which appends and dispatches before it returns. **Only the driver stands
between the header and the first dispatch.**

## Decision

1. **`onHeader?: (header: CheckpointHeader) => void` is a `DriverOptions` member** — so a hand-built `Driver` has it too —
   **in `StartOptions`' `Pick`, and OMITTED from `ResumeOptions`** (`Omit<StartOptions, 'runId' | 'onHeader'>`).
2. **`start()` calls it ONCE, synchronously, after its refusals — `MultipleRuns`, `FD-R4` — and the entry payload's
   clone (`RN-R15`), and BEFORE anything is appended or handed to the scheduler** — so before the first `onFoldInput` and
   the first `addTask`. It is handed a FROZEN copy of its own, equal to `checkpoint().header` and to `handle.header`.
3. **A throw from it leaves the driver UNSTARTED**: no header kept, nothing appended, nothing handed on, `onRunFailure`
   not called — no run exists yet, as after an `FD-R4` refusal — and the throw reaches `start()`'s caller. A later
   `start()` on the same driver is accepted. **On a runtime the run id is spent** (ADR 0091 rule 4: the driver was built).
4. **It is never called** when `start()` is refused, and **never by `resume()`**: its caller already holds the header —
   the checkpoint's.
5. **While it runs no run exists**: a call the callback makes back into the driver is refused as on an unstarted driver,
   and a `start()` or `resume()` from it is `MultipleRuns` — the driver's one door (`ID-R3`) is being taken — so a run is
   entered once.
6. **A run that passes none is unmoved** — every fold-input sequence, every hand-off.

## Consequences

**What this makes easy.** A store writes the header, then each element at its position, and a crash at any point leaves
a readable prefix — or nothing, when the header write itself failed and `start()` threw. #9 is closed with no change to
the checkpoint's shape, `CHECKPOINT_FORMAT` or any log.

**What this makes hard, and the cost is real.**

1. **Two channels carry the header** — `onHeader` and `handle.header` — ADR 0064's objection, now accepted: they are
   one value read twice from the driver (`checkpoint().header`), never assembled twice, and the tests hold them equal.
2. **A throw is a REFUSAL, not a halt**, unlike every other consumer callback since W184 (`OR-R10` v0.19): reporting a
   failure would describe a run whose header the store never wrote, which is the case #9 exists to remove. The cost is
   one more shape a consumer learns — *before acceptance, nothing; after, a halt* — which `OR-R10`'s *a call refused
   before it is accepted halts nothing* already draws.
3. **On a runtime the id is spent by a throw**, so a store that fails transiently is retried under another id (or a
   minted one) — the price ADR 0091 rule 4 already sets for a start refused after its driver exists.
4. **For the callback's duration the driver counts as started with no header** — the state a refused resume leaves —
   which is what refuses a re-entrant `start()`. It is not observable after the call returns or throws.

**What a future reader is likely to try that this forbids.** Calling it from the RUNTIME around `driver.start` — too
late, the run has dispatched. Making the header fold-input element 0 — every log moves by one and `CHECKPOINT_FORMAT`
becomes 2, a reinterpreted shape (P34 (f)). Accepting it on `ResumeOptions` and ignoring it — a typed option that does
nothing, P20 fact 2's defect. Halting the run on its throw — a run whose header was never written, reported as one that
exists. Discarding its throw — the store's failure unheard, the run started headless: #9 made silent.

## Alternatives rejected

| | why not |
|---|---|
| on `StartOptions` alone, the runtime calling it | impossible without a driver hook: `start` dispatches synchronously inside `driver.start` (P36 (d)) |
| the header as fold-input element 0 | every log moves by one and `CHECKPOINT_FORMAT` becomes 2 (P36 (d)) |
| accepted on `ResumeOptions` and ignored | a member that does nothing (P36 (d)) |
| a throw that starts the run and halts it | a run whose header the store never wrote — the case #9 exists to remove (P36 (e)) |
| a throw discarded | the store's failure goes unnoticed and the run starts headless (P36 (e)) |
| a pure `checkpointHeaderOf(flow, runId, payload)` helper | considered and dropped by the maintainer (P36 decision 1): the consumer would assemble the header itself — ADR 0064's *what a future reader is likely to try* |
