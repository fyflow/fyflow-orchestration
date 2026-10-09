---
id: ADR 0090
title: "A run is driven on exactly one scheduler, a process may hold many runtimes, and a run id is unique per runtime, not globally"
status: accepted
date: "2026-10-09"
item: ""
raised-by: Q20
supersedes: ""
amends: ""
resolves: Q20
---

# ADR 0090 — A run is driven on exactly one scheduler, a process may hold many runtimes, and a run id is unique per runtime, not globally

**Status:** accepted — the maintainer's decision on 2026-10-09, taken in conversation and written here
because a decision not in `spec/`, an ADR or a plan did not happen. No work item: it records what the
tree already does and moves no code.

## Context

[Q20](../questions/q20.md) asked *"does one orchestrator ever drive more than one scheduler, and is a run
id global?"* It bundles three questions, and the tree answered two of them without saying so:

| | the question | the tree, measured on `30d2d65` |
|---|---|---|
| **a** | can ONE RUN span several schedulers? | no, by construction: a `Driver` takes exactly one `scheduler` (`src/driver/driver.ts`, `DriverOptions.scheduler`) and its run at construction ([ADR 0022](0022-a-driver-takes-its-run-at-construction.md)) |
| **b** | can ONE PROCESS hold several runtimes, each with its own scheduler? | yes: `createRuntime` builds its own `FyflowScheduler`, and [W142](../work-items/w142-a-settlement-reaches-only-its-own-runs-driver.md) measured "one runtime per run" as a supported topology beside a shared one ([ADR 0088](0088-a-runtime-routes-each-settlement-to-the-driver-holding-its-run-id.md)) |
| **c** | is a run id GLOBAL? | no: a runtime mints `r<n>` from its own counter, unique per runtime (P18 decision 10, `src/scheduler/runtime.ts`); two runtimes in one process both mint `r1`. A caller may pass its own `runId` to `start()`, refused with `RunIdInUse` only if this runtime already holds it (`RN-R25`) |

Q20's `closes-when` ties it to `fyflow-react-components` Q15, which asks whether one **collector**
serves more than one scheduler and whether its sequence is per-stream or global. The two overlap on (b)
and (c) and not on (a). P29 decision 7 held shared questions rather than triage them here alone.

## Decision

1. **A run is driven on exactly one scheduler.** One run never dispatches to, or hears settlements from,
   two schedulers. Nothing asks for it, and a driver cannot express it.
2. **A process may hold any number of runtimes**, each with its own scheduler and its own runs. That is a
   supported topology, not a defect.
3. **A run id is unique per runtime, not globally.** The library mints no globally unique id. A consumer
   whose run ids must be unique across runtimes or processes — a shared checkpoint store, a collector or
   UI watching several runtimes — supplies its own `runId` to `start()`, inside `ID-R2`'s charset.
4. **Q20 is resolved here, by the maintainer**, departing from P29 decision 7 for this one question. The
   answer for `fyflow-react-components` Q15 is the same and is recorded there, by that repository; nothing
   is written in the sibling from here.

## Consequences

1. **No code moves.** Every rule above is what the tree already does; the decision makes it a rule rather
   than an accident, so a change that let one run span two schedulers, or minted a global id, is a change
   to this ADR first.
2. **A consumer that aggregates runtimes owns run-id uniqueness.** The library's `r<n>` collides across
   runtimes by design; `RunIdInUse` guards only one runtime.
3. **The sibling must agree.** If `fyflow-react-components` answers its Q15 differently — a collector that
   needs a globally unique run id from the producer — Q20 is reopened with that reason, as
   [Q513](../questions/q513.md) states for its own twin.

## Alternatives rejected

- **Globally unique run ids minted by the library** (random or prefixed): a change to `ID-R2` and the
  minting that nothing in this repository needs, when `start()`'s `runId` already serves the case.
- **Hold Q20 until the sibling answers** (P29 decision 7 as written): the maintainer judged the answer
  clear on this side and the sibling's question a different one (a collector's sequence, not a run).
