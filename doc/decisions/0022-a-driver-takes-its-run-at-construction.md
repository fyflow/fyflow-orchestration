---
id: ADR 0022
title: "A `Driver` takes its run at construction, and `start()` takes only the payload"
status: accepted
date: "2026-08-31"
item: W13
raised-by: P4, Q53
supersedes: ""
amends: ""
resolves: Q53
---

# ADR 0022 — A `Driver` takes its run at construction, and `start()` takes only the payload

## Context

**`ID-R3` says a `Driver` serves exactly one run. Its public surface says otherwise, in three
places**, and W5's conformity pass raised that as [Q53](../questions/q53.md) rather than fixing it:

| shape | what it implies |
|---|---|
| `start(runId, payload)` | the run id is a per-call argument, so there could be more than one |
| `failedRuns: Set<string>` | more than one run can fail |
| `hasFailed(runId): boolean` | the caller must say *which* run |

None of the three is *wrong* — they are redundant. But a surface that says "many" while a rule says
"one" is read by the next person as "many", and W5's own reviewer did exactly that: it started two
runs, and `fold(driver.foldInputs())` merged them into one `RunState` carrying the first run's id and
reporting **`completed`** for a state containing a permanently hung run. That is character-for-
character the false statement [ADR 0015](0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists
to remove, reachable through the class's own declared surface.

**`ID-R3` was the narrow patch.** It refuses a second `start` with a *different* id. It leaves the
surface saying what it said.

**The alternative was measured before this was written**, which is P4's habit and the fifth
consecutive item to follow it. Applied to `src/driver/driver.ts` in the working tree:

| | measured |
|---|---|
| `src/` typechecks clean | yes, six configs |
| `ID-R2`'s charset refusal moves to the constructor | yes, beside `MissingJoinPolicy` — where the other configuration refusal already lives |
| ladder L6 | **all thirteen rows pass**, with a **two-line** change to `examples/run-flow.ts` |
| the cost | **77 typecheck errors across four test files, 2 in `examples/`, and 4 of 15 `AGENTS.md` snippets stop compiling** |

**The cost is entirely call sites.** No behaviour changed, which is why this is a decision about a
surface rather than about a mechanism.

## Decision

1. **`DriverOptions` gains a required `runId`.** A `Driver` is constructed *for* a run, and the run
   id is available to it from the first line of the constructor.
2. **`start(payload)` takes only the payload.** There is no run id to pass because there is no
   choice to make.
3. **`ID-R2`'s charset refusal moves to the constructor**, throwing `InvalidRunId` before anything is
   validated or queued. It joins `MissingJoinPolicy` there: a definition and a run id are both
   configuration, and ADR 0002 rule 3's argument — *validate in full before anything is queued* —
   applies one level out.
4. **`ID-R3` becomes "`start()` at most once".** With the id fixed at construction there is no
   second id to name, so `MultipleRuns` is thrown for a second `start()` of any kind.
5. **`failedRuns` becomes a boolean and `hasFailed()` takes no argument.** A driver has one run, so
   it has one answer.
6. **A second run means a second `Driver`, and — with
   [ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) — that is
   now safe on the same scheduler.** The two ADRs are separable in mechanism and are not separable in
   advice: `MultipleRuns`' message tells a caller to construct a second `Driver`, and until 0023 that
   advice produced [Q72](../questions/q72.md)'s corruption.

## Consequences

**Easier.** The surface now says what `ID-R3` says. A `Driver`'s lifetime is a run's lifetime, which
is the boundary durability would need if [Q15](../questions/q15.md) is ever answered — a driver
constructed for a run is a thing that can be rehydrated for one. `hasFailed()` stops inviting the
question *"whose run?"*.

**Harder, and this is the real cost.** **It takes `ID-R1`'s only direct test away.**
`spec/task-id.md` section 3 predicted this in writing — *"widening `ID-R3` to cover a second `start`
with the same id would take away `ID-R1`'s only direct test, which trades a tested rule for an
untested one"* — because W3 provokes a duplicate dispatch by starting the same run twice, and rule 4
now refuses that at `start` before `ID-R1` sees it. **A replacement was measured before this ADR was
written**: delivering the same settlement twice routes twice and refuses the successor's redispatch,
reported through `onRunFailure` rather than thrown. `ID-R1` keeps a direct test; it is a different
one, and `spec/task-id.md` records the substitution rather than quietly dropping it.

**Breaking, and cheap because nothing is published.** `README.md` records that no version has been
released. An overload keeping `start(runId, payload)` alongside `start(payload)` would cost forever
what a breaking change costs once.

**What a future reader will try.** Reusing one `Driver` for a second run of the same flow, because
constructing a `Driver` validates the definition and that looks like the expensive part. It is not
expensive, and rule 4 refuses it. If definition validation ever *does* become the expensive part, the
answer is to hoist validation out of the constructor — **not** to loosen the lifetime.

## Alternatives rejected

| | why not |
|---|---|
| **Leave it, as Q53 did.** The shapes are redundant rather than wrong | The next reader does what W5's reviewer did. A surface is read more often than a rule is |
| **Keep `start(runId, …)` and refuse a mismatch against a constructor `runId`** | Two places to say the same thing, and a refusal that only exists because the argument does. It is the overload with extra steps |
| **Keep `hasFailed(runId)` as a real affordance a consumer may hold** — [Q53](../questions/q53.md)'s own argument for leaving it | Measured: the only caller that could pass a *different* id is one serving two runs, which rule 4 refuses. The argument survives only if the surface it defends does |
| **Make `runId` optional, defaulting to a generated id** | [Q34](../questions/q34.md) — the driver generates no run id, deliberately, and portable id generation is unanswered. A default would answer it by accident |
| **Do this and [ADR 0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) as one decision** | They are independent: the inbound guard was measured to work with **no** surface change, and the surface change fixes nothing about [Q72](../questions/q72.md) on its own. One ADR would hide that |
