---
id: ADR 0004
title: "A non-success outcome routes only where an edge opts in, and `user_action` suspends"
status: accepted
date: "2026-08-30"
item: W1
raised-by: W1
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0004 — A non-success outcome routes only where an edge opts in, and `user_action` suspends

**Raised by:** W1, via the spec-conformity pass finding **B1** — `spec/` did not say whether a
non-`done` settlement routes at all, and two of its documents assumed opposite answers

## Context

W1 wrote the first version of `spec/` and left a hole in the joint between W2 and W3.
`spec/flow-definition.md` made a default edge mandatory on every node and handed the decision
predicate the outcome record — which carries `terminalState` — so every settlement routed.
`spec/join-policy.md` defined `branch.lost` as *"settled without success **and no edge was
taken"***, which requires that a failure does **not** route. Both readings conform. Two
implementers produce different run states from the same log, and neither breaks a written rule.

That is the failure `doc/workflow.md` section 7 rule 1 exists to prevent, and it is worse than an
ordinary ambiguity: **if failures route down an ordinary default edge, both join policies behave
identically on most of [Q5](../questions/q5.md)'s rows and P1's comparison collapses.**

Two facts about the substrate shape the answer. Both are read from `fyflow-scheduler` 0.3.0 source
rather than from `AGENTS.md`:

1. **A task that fails without being `optional` never reaches `failed`.** `task.state = 'failed'` is
   assigned at exactly two sites, `core/FyflowScheduler.ts:896` and `:1131`, and **both are inside
   `if (task.optional)`**. A non-optional task out of retries ends in `user_action`.
2. **`user_action` means something outside the scheduler has to intervene** — that is the library's
   own wording (`core/FyflowScheduler.ts:899-900`). It is not a failure that a flow can route away
   from; it is work that has stopped and is waiting for a person.

So the library already distinguishes *"the flow deals with this"* from *"a human deals with this"*,
and it does it through `optional`. This decision adopts that distinction rather than inventing one.

## Decision

1. **An edge declares the terminal states it is eligible for**, as `on: ["done"]` or
   `on: ["done", "failed"]`. The default is `["done"]`. An edge with no `on` key routes successes
   and nothing else.
2. **A settlement routes only through edges eligible for its terminal state.** Eligibility is
   checked first; the ordered `when` evaluation of
   [ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 2 then
   runs over the eligible edges alone.
3. **A `user_action` settlement does not route. It suspends its path.** The node is not done, not
   failed, and not lost — it is parked, and the run is waiting on something outside this library.
   `on` may not name `user_action` ([Q30](../questions/q30.md)).
4. **A suspended path resumes only when a resolution record is appended to the log.** A resolution
   states the terminal state the node is to be treated as having — `done` or `failed` — plus the
   result or error that goes with it. Routing then proceeds under rules 1 and 2 as though the node
   had settled that way.
5. **This library does not resolve anything.** It makes a suspended path *visible* and accepts a
   resolution as an input. Obtaining the human decision — a queue, a UI, an approval workflow — is
   the consuming application's, and nothing here assumes how it happens.
6. **A resolution is a log record, never a mutation of run state.** It is appended to the same
   ordered log the outcome records go into, so run state remains a pure fold
   (`doc/concept.md` section 5) and a resumed run replays identically.
7. **`optional: true` on a node means the flow handles its failure; the default means a human
   does.** It is the authoring-level statement of the library's own branch at
   `core/FyflowScheduler.ts:894`. It decides **who decides** — not whether an `on: ["failed"]` edge
   is reachable. An `optional` node reaches `failed` by settling; a default node reaches it by
   suspending and then being resolved with `resolvedAs: "failed"` under rule 4. Both roads route
   through the same edges, and a predicate cannot tell them apart by design
   ([spec/outcome-record.md](../../spec/outcome-record.md) section 6).

> **Correction, 2026-08-30.** Rule 7 originally ended *"and it is the only way a node can produce
> `terminalState: 'failed'` for rule 1's `on: ["failed"]` to catch"*. That was **exactly inverted
> for the resolution road**: suspension is reachable only for *non*-optional tasks, so the resolution
> route to `failed` is available only to the nodes the clause excluded — and rule 4 above already
> said so. The decision is unchanged; a false clause inside it is corrected in place rather than
> superseded, and the correction is left visible because the error contradicted a rule three lines
> above it and no reader spotted it for two versions. Found by the second spec-conformity pass.

## Consequences

**Easy.** `branch.lost` becomes a real, narrow event instead of a contradiction. Q5's four cases
stop being four indistinguishable words: a failing branch, a suspended branch and a routed-away
branch are three different region events, and the fourth — *optional-null* — is revealed to be the
same scheduler outcome as *failed* rather than a separate case. **`user_action` gets a flow-level
answer that is neither success nor failure**, which is the hole
[Q17](../questions/q17.md) names and which `fyflow-react-components` left open as their Q16.

**Rule 6 is what keeps the architecture intact.** A resolution is external input, and the obvious
implementation is a method that reaches into run state and edits it. That would end the fold: run
state would no longer be derivable from the log, ladder L3 would compare two different things, and
[Q15](../questions/q15.md) would be foreclosed. Making the resolution a log entry costs one record
type and preserves all of it.

**Hard.** The driver now has an inbound edge it did not have —
[ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 4 said the driver is
the only component with side effects, and it is now also the only component that accepts a command.
That is a wider surface to get wrong and the only place in the design where something outside the
process can change a run.

**A path can now end without an `end` node**, when a node settles `failed` and no edge opts in.
That is uncomfortably close to the answer [Q10](../questions/q10.md) refused — *"the node is
terminal for that branch"* — and the difference is that this one is **declared and observable**: the
author chose not to write an `on: ["failed"]` edge, an outcome record exists in the log saying what
happened, and the path's end is attributable to a node. Q10's rejected answer was a *silent* stop
with nothing to point at. The distinction is thin enough to be worth stating, which is why it is
stated.

**A suspended run waits forever by default.** Nothing times out, nothing escalates, and a join
waiting on a suspended branch is indistinguishable from a slow one unless the driver says so. That
is why `branch.suspended` exists in `spec/join-policy.md` rather than suspension being invisible:
[Q7](../questions/q7.md) needs a stuck join to be *reportable*, and *"waiting on a human"* must
not be reported as *"stuck"*.

**What a future reader will try.** Adding `on: ["user_action"]` so a node can route straight to a
manual-review sub-flow and skip suspension. It is a reasonable feature and it is refused for now
([Q30](../questions/q30.md)) because it gives one concept two mechanisms — a node in
`user_action` would then be *sometimes* parked and *sometimes* routed, and no reader of the
definition could tell which without evaluating the edges.

## Alternatives rejected

| | why not |
|---|---|
| **Every settlement routes through ordinary edges** | Simplest, and it dissolves the question. But it makes `branch.lost` unreachable, collapses three of Q5's rows into ordinary routing, and — the deciding argument — makes both join policies behave identically on those rows, which removes most of what [P1](../plans/p1-what-satisfies-a-join.md) was built to measure |
| **Only `done` routes; every non-success ends the path** | Coherent and cheap, and it keeps Q5's rows distinct. But it gives an author no way to express *"if extraction fails, quarantine it"*, which is an ordinary flow, and it treats a failed node and a node waiting for a person as the same thing — the fifth state disappearing into the fourth, which is exactly the mistake `doc/concept.md` section 3 constraint 1 warns about |
| **`user_action` routes down an error edge** | What a driver keying on `task.failed` does by accident, and [ADR 0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 2 already refuses it at the record level. Routing a human-intervention case down an error edge discards the distinction the library went to the trouble of making |
| **Resolution as a method that mutates run state** | The natural API and the one a consumer would ask for. It ends the fold invariant, and with it ladder L3, hand-written fixtures, and any cheap path to Q15. Rule 6 costs one record type instead |
