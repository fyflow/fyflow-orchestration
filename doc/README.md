# Documentation index

## Current state

**The three gating questions are cleared, P1 is planned, and no code exists.**

As of 2026-08-30: `doc/concept.md` is v0.1, **Q1 and Q2 are resolved** as
[ADR 0001-0002](decisions/), **Q4 is deferred to a spike**, and
**[P1](plans/p1-what-satisfies-a-join.md)** is planned with five work items. `spec/` is still empty
— W1 is what fills it. 18 questions remain open.

**What is decided:** routing executes in the driver, outside the scheduler (0001) · the flow
definition is data and predicates are registered by name, failing at instantiation (0002) · **the
driver normalizes every event into an immutable outcome record at the listener boundary** (0007) ·
pinned to `fyflow-scheduler` **0.3.0** (Q3).

**Upstream shipped: `fyflow-scheduler` 0.3.0 landed 2026-08-30** (not yet on npm) and this repo has
been re-verified against **the code, not the plan** — details and the S-id map in
[scheduler-upstream.md](scheduler-upstream.md). Short version:

- **Four of our eight upstream items settled and we raised none of them** — S4 (timestamps) done,
  **S7 fixed better than we asked**, S8 declined-and-documented, S5 still deferred.
- **[Q32](open-questions.md) dissolved.** The orphaned-task drop that would have masqueraded as a
  stuck join is now a terminal failure, so **P1's validity threat is retired**.
- **[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
  needed no rule changed** — but every line reference moved, a second dispatch site appeared, and
  timestamps arrived as a **mutable field on the live task**, which makes rule 1 protect *more* than
  it did at 0.2.1.
- **[S1](scheduler-upstream.md) survived the whole pass** and is now the only item worth raising.

**What is deliberately *not* decided:** [Q4](open-questions.md), what satisfies a join. The argument
for live-token accounting is strong and was refused as *sufficient* — P1 builds **both** policies
behind one interface and settles it with the branch-routed-away case as an executable test.
Arrival-counting winning is a real possible outcome. ADR **0003** is reserved for whichever wins and
is written when W4 has run.

**The one thing to know before reading anything else:**

> `fyflow-scheduler` **has no dependency graph** - no `dependsOn`, no `parents`, no ordering. Its
> own reference lists them under *"Things that do NOT exist"*.

So the input document, [`../fyflow-scheduler/FLOW_PLANNING.md`](../../fyflow-scheduler/FLOW_PLANNING.md),
**is written against an API that is not there.** It calls the library "the existing FyFlow DAG
scheduler" and passes `parents: ['extract']` to a constructor with no such field. Its goals survive;
its premise does not. This repo **builds** sequence, decision, fan-out and join rather than wrapping
them, which is a different project of a different size. Details and evidence:
[concept.md](concept.md) section 2.

The trap that made it plausible: `SpawnTaskConfig.parents` is **declared** at
`../fyflow-scheduler/core/workerInterface.ts:50` and **read nowhere** - the spawn path drops it
silently. It typechecks and does nothing. Recorded as [S1](scheduler-upstream.md).

**What happens next:**

1. **W1 — the definition spec, the task id scheme, and the join-policy interface.** Serial, and
   everything else waits on it. It must settle [Q10](open-questions.md) (no decision edge matches)
   and [Q13](open-questions.md) (a task id collision silently overwrites, so the scheme is a
   correctness rule with a refusal test).
2. **W2 and W3 fan out off W1** — the fold and the driver, separated by the spec rather than by
   intuition. Then W4, the join/failure matrix, which is what actually answers Q4.
3. **[S1](scheduler-upstream.md) can be raised at any time** - it is a one-line deletion upstream,
   independent of everything above, and it removes the trap that produced the misdirected plan.

**The fan-out gate is cleared** (`workflow.md` section 7 rule 3) — not because Q4 is answered, but
because P1 builds both of its candidate answers, so W2 and W3 can be written without knowing which
wins.

## Reading order

| | |
|---|---|
| [concept.md](concept.md) | **Read first.** What we are building, the substrate fact that shapes everything, and the one structural idea - run state is a pure fold of an event log |
| [workflow.md](workflow.md) | **Read before any work item.** The loop, the verification ladder, the test rules, how work is split. Inherited and unproven - its adaptations are listed at the end for the first retro to judge |
| [decisions/](decisions/) | ADR 0001, 0002, 0007. These are the contract until `spec/` exists |
| [plans/p1-...](plans/p1-what-satisfies-a-join.md) | **The active plan.** Five work items, one exit artifact: does arrival-counting actually break |
| [open-questions.md](open-questions.md) | The register. 18 open, 5 resolved |
| [scheduler-upstream.md](scheduler-upstream.md) | S1-S8, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us**; S3 is declined by us and S8 by upstream |
| [../spec/README.md](../spec/README.md) | The normative layer and the rules for changing it. **Empty until W1** |
| [work-items/](work-items/) | One file per work item. None written yet - [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.2** | Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. Section 3 was re-verified line by line at 0.3.0 and gained three constraints. Section 6's leanings are now two ADRs and one spike; the routing and definition rows there are **superseded by ADR 0001-0002** and should be read as history |
| `open-questions.md` | live | **18 open, 5 resolved.** Q4 is `deferred` in the specific sense that a spike decides it |
| `workflow.md` | v0.1, **unproven** | Never run here, and never run in the repo it came from either. P1's retro is its first real test, and the adaptation table at the end is what that retro should judge |
| `decisions/` | 3 ADRs, all accepted | None superseded. **0003 is reserved for Q4's answer** and is written when W4 has run. 0001 and 0002 went to the stated leaning; **0007 is the first that no leaning predicted** - a constraint forced it |
| `plans/p1` | planning | Work-item files not yet written |
| `scheduler-upstream.md` | live | 8 items, **4 closed at 0.3.0** (S4 done, S7 fixed, S8 declined, S3 declined by us) and S5 deferred. **S1 is the only thing left worth raising** |
| `spec/README.md` | v0.1 | Rules only. W1 writes the first document |

## Sibling repositories

Three repos, one stack, one maintainer. What each owns:

| Repo | Owns | Pinned to |
|---|---|---|
| [`fyflow-scheduler`](../../fyflow-scheduler) | executing independent tasks: pools, resource groups, retry, spawn | — |
| **`fyflow-orchestration`** (here) | **control flow**: sequence, decision, fan-out, join | scheduler **0.3.0** |
| [`fyflow-react-components`](../../fyflow-react-components) | visualizing a scheduler: collector, wire envelopes, React components | scheduler 0.2.1 — **needs the same bump**; 0.3.0 is what unblocks its `3a`/`3b` views |

Deliberate overlaps, which are coordination points rather than duplication:

1. **The same structural invariant.** Their view model is a pure fold of the scheduler's event
   stream; our run state is a pure fold of an outcome log. Adopted knowingly ([concept.md](concept.md)
   section 5), because it is what makes both testable without a live scheduler.
2. **Three questions are literally shared** - `user_action` at the top level (our Q17, their Q16),
   unbounded retention (our Q19, their Q14), one-driver-one-scheduler (our Q20, their Q15).
   **Answering these differently in two repos is a bug with two homes.**
3. **Two upstream wants were shared** - our S4/S5 are their S2/S1. Both are now answered via that repo (S4 implemented, S5 deferred), so the joint-raise is done. What remains shared is the *pattern*: raise once, from whichever repo has the stronger case. **Their S8 is our S8** and is the one that changed our architecture.
4. **They cannot see flow structure.** Which node, which branch, what a join is waiting on - none of
   it reaches the scheduler, so no UI can show it today. Whether we become a second envelope source
   family for them is [Q21](open-questions.md).

**Cite another repo's ids with its name attached, always.** Two Q sequences, same questions
(`workflow.md` section 3).

## Plan history

*One row per plan, oldest first.*

| P | Question it answered | Exit artifact | Date |
|---|---|---|---|
| [P1](plans/p1-what-satisfies-a-join.md) | *in progress* — does arrival-counting actually break when a branch is routed away from its join? | the branch-routed-away case run against both policies, plus one real fan-out flow | — |
