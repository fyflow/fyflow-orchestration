---
id: ADR 0060
title: "A run-time result check is a READING and never a refusal, and the callback that receives it IS the switch"
status: accepted
date: "2026-09-22"
item: W80
raised-by: P21
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0060 — A run-time result check is a READING and never a refusal, and the callback that receives it IS the switch

**Raised by:** [P21](../plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md), taken by
[W80](../work-items/w80-what-a-run-time-result-check-is.md)

## Context

A worker declares four JSON schemas and until now a run enforced **two values** against them:
`FD-R4` holds the run's payload at `start()` and a person's `done` resolution at `resolve()`, once
each, as rejected commands ([W73](../work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md)).
**Every other value a worker ever returns is unchecked**, and that is P21's subject.

Two plans deferred it as the expensive road, and P21's fact 4 measured the price against the
`structuredClone` `OR-R2` already pays unconditionally on the same settlement: **from ~90% at six
settlements down to 6% at fifty-two, and 0.00x on its largest result — falling as the workload
grows.** *(This said *6-14%*, which is the two cheap readings with the ~90% one dropped, in the
direction that flatters the feature — W80's conformity reader, finding 2, on the number this
plan's declarability rests on.)* *The road that
was deferred for cost is a shrinking fraction of a cost nobody chose and nobody can decline.*

**And the feature has no live defect to point at.** [Q302](../open-questions.md)'s two violations are
both closed — one clamped in the worker's code, one refused at `start()` by `FD-R4` — so the case has
to be made on CAPABILITY, and W80 had to construct the instance rather than find one. That is
[P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)'s *a check written for a defect you have
just fixed has no live case* arriving before the item rather than in its Record.

## Decision

1. **The check is OPT-IN and OFF by default**, the maintainer's answer to P21's stop-and-ask (a).
2. **What it checks is the RESULT against the `outputSchema` of its node's worker, and nothing
   else.** Not a node's input, which the wiring check decides statically; not the two boundaries,
   which `FD-R4` holds once each. *Three sites over the two schemas that describe a worker's
   run-time VALUES, and they do not overlap* — `configSchema` and `settingsSchema` are held at
   CONSTRUCTION (`FD-V33`) and are a different question (W80's conformity reader, finding 12).
3. **A finding is REPORTED and NEVER ROUTED.** No record is written, no terminal state is authored,
   no dispatch moves, and the run proceeds exactly as it would with the check off — `OR-R12`'s
   precedent: *refuse, append nothing, do not fail the run.* The maintainer's answer to
   stop-and-ask (b).
4. **The callback IS the switch.** One `DriverOptions` member, `onNonconformingResult`; supply it
   and every `done` settlement is checked, omit it and nothing is.
5. **What it reads is the value the RECORD carries**, after `OR-R2`'s clone — which `OR-R11` says is
   not the value the worker returned.
6. **The rule is `OR-R13` in `spec/outcome-record.md`** (v0.10), and not an `FD-R`.
7. **The subset is unchanged.** [ADR 0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
   stands; nothing is added to the thirteen keywords.

### Why a READING rather than a guard, and the guard is not refused for want of a road

**The mechanism exists and it is not free.** `resolution` is a second record kind whose `resolvedAs`
is *the terminal state the node is treated as having from here*; `OR-R9` composes it with the
settlement and `RS-R3` routes `failed` exactly as an optional node's failure. **A driver could
override without anything being rewritten.**

**What refuses it is decision 1.** If the check is off by default and changes routing when on, then
turning it on changes what the flow DOES — a run that completes in production takes a failure edge,
or parks for a person, in validation mode. ***You cannot audit a behaviour with an instrument that
alters it.*** A guard wants to be ON by default; a diagnostic can be off. Taking the guard road means
reopening (a) in the same breath.

**And the observed fault is the SCHEMA, not the worker.** Both of Q302's instances were an author's
bound, and W73 fixed one in the declaration and one in the code. *Failing a task for that punishes a
run for a documentation defect.*

**The cost is stated rather than hidden: a value that fails its schema still flows downstream.** What
this buys a consumer is **knowledge rather than protection**, and the plan says so at the top.

*(The draft of this decision said **a TASK's failure, on [W61](../work-items/w61-what-a-transform-is.md)'s
`TransformFailed` precedent**, and P21's declaration step falsified its premise before any item ran.
`TransformFailed` is thrown inside the **envelope worker**, before the scheduler settles anything, so
the SCHEDULER authors that terminal state and the driver records what it was told. A result check
runs in the **driver**, after the scheduler has already reported `done`, and `OR-R3`'s own source
column says `terminalState` comes from `d.state` and is **never** the driver's. W61's mechanism is
unavailable here and the draft rested on it.)*

### Why the callback is the switch, with no boolean beside it

Two members would be **two sources that can disagree**, and both disagreements are defects this
repository has a name for:

| the pair says | what it is |
|---|---|
| `true`, and no callback | the cost of the check paid for a report nobody receives |
| `false`, and a callback | **a typed option silently dropped** — P20 fact 2's measurement, and the thing `StartOptions`' both-ways binding exists to refuse |

*A diagnostic whose channel is its own switch cannot be enabled and unheard.* It also makes the
switch an **L0 assertion**: the callback is read once and handed to the reporting method as a
non-optional parameter, so deleting the guard does not compile. That closes ONE direction (W43,
[Q196](../open-questions.md)); the other — that a consumer who supplies nothing pays no `findings`
walk — is a COST, and W81 owns the rung that can see it.

### Why `OR-R13` and not an `FD-R`

`spec/flow-definition.md` names its three prefixes: `FD-V` is what a DOCUMENT may say, `FD-R` what a
RUN **refuses**, `FD-C` what a run **carries**. **This refuses nothing**, so `FD-R` would be the one
row of that table whose heading clause does not hold — a thing `FD-R4` already has to say about
itself, and a second one would stop being an exception and start being the rule.

`spec/outcome-record.md` section 4's whole subject is `result`: `OR-R2`'s clone, `OR-R11`'s losses,
and `OR-R12`, which is the report-only precedent this decision takes. **The rule belongs where the
value it reads is defined.**

### Why the value the RECORD carries, and not the value the worker returned

This is the decision's sharpest half and it is a measurement rather than a preference. `OR-R11`: what
crosses `OR-R2`'s clone is a value's own **enumerable** string-keyed data plus the built-ins' internal
state, and *what does not cross does not cross silently.* So the same schema, applied to what `run()`
returned and to what the log holds, can **disagree** — measured over seven shapes at W80's
declaration step:

| shape | what `run()` returned | what the record carries |
|---|---|---|
| a **non-enumerable own** property | accepts | **REFUSES** |
| the same, **nested** one level | accepts | **REFUSES** |
| an own accessor that **throws** | accepts | the clone throws — `OR-R6` |
| a **prototype getter** | REFUSES | REFUSES — *they agree* |

**The control row is what says this is a property of the shape rather than of the apparatus**: a
prototype getter is invisible to both, because the value check reads OWN keys and never `in` —
W65's conformity reader's fix, closing this gap from the other side before anyone looked for it.

**Reading the record is the only choice that makes the check a statement about the RUN.** A consumer
asking *does this flow carry what it says it carries* is asking about the value the next node
receives, and that is the record's. *And it is the half no authoring-time tool can reach, for a
structural reason rather than an omission: none of them holds a record.*

## Consequences

1. **`DriverOptions` gains a nineteenth member**, `onNonconformingResult`, and the orphan count that
   W76 drove to zero stays zero: it is a per-RUN diagnostic, as every other `on*` member is, so it
   joins `StartOptions`' `Pick` and `start`'s conditional spread. Both of W76's bindings **fired by
   name** when it arrived, which is that item's Outputs (2) doing what it was built for. It is not in
   `RuntimeOptions` beside `validateBoundaries`, because that one is a POLICY every driver a runtime
   starts inherits and this one names a `runId`.
2. **One site, in the settlement path, AFTER the record is appended.** Before it, a callback that
   threw would stop the record being written, which is a behaviour change relative to the check being
   off — the sentence P21 decision 3 tells an adequacy reader to falsify first, broken by the
   reporting machinery itself.
3. **`done` settlements only**, because `OR-R2`'s guard writes `result: null` for the other two and
   an output schema no worker ever reached refuses `null` — so every failure would report.
4. **Settlements only, never a resolution.** `FD-R4` already holds a person's `done` value to the
   same `outputSchema`, as a REJECTED COMMAND, which is a different answer; one value refused twice
   by two mechanisms that disagree is worse than either alone.
5. **A worker declaring no `outputSchema` is UNCHECKED**, which is P18 decision 3 read the same way
   `FD-R4` reads it.
6. **The check itself cannot stop the run, and unguarded it COULD.** `enum` and `const` are the
   only two of ADR 0053's thirteen keywords that call `canonical`, and `canonical` is the only
   expression in the value check that walks the WHOLE VALUE rather than the schema's shape — so a
   **cyclic** result or a **BigInt**, both of which `OR-R11` calls **intact**, raise there. From a
   listener that throw reaches `onEvent` and stops the run: *decision 3's headline invariant
   broken by the reporting machinery itself*, one expression along from consequence 2, and found
   by W80's conformity reader rather than by its author. It is caught at the call and reported as
   a finding saying the value could not be read — **a value that cannot be read is a reading and
   not a failure.** `FD-R4` runs the same expression and needs no guard, because there the throw
   reaches a caller on the stack, which is `OR-R12`'s asymmetry.
7. **The one way this changes a run is a consumer's own callback throwing.** `onEvent` catches it,
   reports it through `onRunFailure` and stops the run — the treatment every callback here gets, and
   documented rather than swallowed, because a driver that ate a consumer's throw would hide a defect
   in the code that asked to be told.
8. **The reach is real and the plan named half of it.** A wiring check reads two SCHEMAS and
   `scripts/check-workers.mjs` runs a worker on ONE example, so a producer whose declared bound its
   own code does not keep is a `fits` at every arc and green at every example; and the record half
   above is unreachable by any of them. *Both were CONSTRUCTED, because fact 3 measured that the
   corpus no longer has one.*
9. **The cost is a RATIO and the ratio is not a constant, which is a correction to how P21 states
   fact 4.** The clone is linear in the VALUE and the check is linear in the SCHEMA, so the share
   falls as the value grows — ~90% at six settlements, 6% at fifty-two, 0.00x on its largest
   result — **and rises as the schema does**. `enum` is where a schema's size is unbounded: one
   `enum` of a hundred allowed values is **1.65x** of the clone on a 4 KiB result and **3.08x** on
   a 0.5 KiB one, so the figure needs its VALUE SIZE beside it or it is a third incomplete ratio. *It is P21 prediction 1's reversal, measured deliberately; the
   default is unmoved and better argued.*

## Alternatives rejected

| | why |
|---|---|
| **ON by default, with an opt-out** | a library that refuses a run — or merely reports on every settlement of one — for a bound an author wrote loosely makes its own corpus noisy. P19's departure argument survives fact 4: the schemas are the author's tool. The maintainer's answer to stop-and-ask (a) |
| **A task FAILURE, on `TransformFailed`'s precedent** | the draft's own answer, withdrawn at P21's declaration: `TransformFailed` is thrown inside the envelope worker, so the scheduler authors that terminal state. The driver never does (`OR-R3`) |
| **A driver-authored `resolution`-shaped record that routes `failed`** | the road EXISTS (`OR-R9` composes it, `RS-R3` routes it) and is refused on composition with decision 1, not on mechanism. *A guard wants to be on by default; an instrument you enable must not alter what it measures* |
| **A boolean switch beside the callback** | two sources that can disagree, and both disagreements are defects with names (table above). It also loses the L0 assertion |
| **Checking the value `detail.result` holds, before `OR-R2`'s clone** | it would report on a value the run does not carry, and `OR-R11` measures that those are different values. It also duplicates what `check:workers` already does over the returned value, at run time |
| **Also re-checking a node's INPUT per settlement** | the wiring check decides that statically and `FD-R4` holds the one value it cannot reach. P21 decision 2 |
| **Adding a keyword to the subset so more results are describable** | ADR 0053 stands; `oneOf` is P19 slice 2 and its condition has not fired ([Q311](../open-questions.md)) |
