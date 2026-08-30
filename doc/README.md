# Documentation index

## Current state

**[Q4](open-questions.md) is answered.** W1, W3 and W2 are done and **W4 is built**: `src/` holds
the validator, the driver and the fold, `test/matrix/` holds the join/failure matrix, and
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) records the
result — **a join is satisfied when its region has no live branches.** 252 assertions, green in five
runtimes. **W5 closes the plan**, and W4's spec-conformity pass is the one gate clause outstanding.

Four spec-conformity passes have run and every finding is acted on; blocking findings ran 4, then 5,
then 1, then 4 — and **no pass has yet come back empty**, which is the strongest thing this repo
knows about its own process.

**The four passes found the same shape four times: the code was correct and the tests were pointed
at the wrong half.** W1's pass found an assertion that could not fail; W3's second found a half of
the system nothing asserted on (the join never fired); its third found a half of the *seam* nothing
asserted on; W2's found five of the fold's own rules untestable, because the spec claimed what its
inputs could not supply and the **code narrowed itself until the claim was unobservable** rather
than reporting the conflict. That last one is what `spec/README.md` rule 2 exists to catch, and it
happened because W2 wrote both the spec and the code — **a spec authored by its implementer needs
the conformity pass more, not less.**

As of 2026-08-30: `doc/concept.md` is v0.2, **Q1 and Q2 are resolved** as
[ADR 0001-0002](decisions/), **Q4 is deferred to a spike**, and
**[P1](plans/p1-what-satisfies-a-join.md)** is planned with five work items. **W1 filled `spec/`
with five normative documents and answered [Q10](open-questions.md) and
[Q13](open-questions.md)**; its spec-conformity pass found **four blocking ambiguities**, one of
which became **[ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)**.
**W3 built the driver and the validator**, and **W2 built the fold, both join policies and the
sixth spec document** — answering [Q14](open-questions.md) and [Q25](open-questions.md).
30 questions remain open.

**What is decided:** routing executes in the driver, outside the scheduler (0001) · the flow
definition is data and predicates are registered by name, failing at instantiation (0002) · **a
non-success outcome routes only where an edge opts in, and `user_action` suspends until an external
resolution record resumes it** (0004) · the driver normalizes every event into an immutable outcome
record at the listener boundary (0007) · pinned to `fyflow-scheduler` **0.3.0** (Q3) · **three
runtimes from one source tree - Deno via JSR, Node >= 24 and the browser via npm** · and the
normative layer itself, [`spec/`](../spec/README.md), six documents · **run state is a fold of our
own log, and a run has five outcomes** (Q14's answer lives in `spec/run-state.md` rather than an
ADR) · **a join is satisfied when its region has no live branches** (0003).

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
- **[S1](scheduler-upstream.md) is answered** — the dead `parents` field stays dead and will
  eventually be removed. **The upstream register now has nothing left to raise.**

**[Q4](open-questions.md) is answered, and the answer is
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md): a join is
satisfied when its region has no live branches.** It was decided by W4's matrix rather than by the
argument P1 refused as *sufficient* — and the matrix found more than the plan asked for.
Arrival-counting does not merely fail the exotic routed-away case: it hangs on **six of nine rows**,
and an ordinary `optional` task failing is enough. Fixed-`N` is wrong whenever *"how many will
arrive"* differs from *"how many opened"*, and every non-success outcome makes it differ. **The
argument was right about the winner and wrong about the size of the effect.**

**What is deliberately *not* decided:** [Q24](open-questions.md) — whether either one-line
refinement of the two policies should be built. It is the live question now, and ADR 0003 names it
as the first thing a reader should look at: on the all-branches-exited row, `live-token` fires a
join **no branch reached**.

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
silently. It typechecks and does nothing — **confirmed vestigial by the maintainer**, so this no
longer rests on our own reading. [S1](scheduler-upstream.md).

**What happens next:**

1. **[W4](work-items/w4-the-join-failure-matrix.md)'s spec-conformity pass.** The matrix is built
   and green in five runtimes and **ADR 0003 is written**; the pass is the one gate clause
   outstanding. Four have run in this repo and **none came back empty** — this is the first to read
   a *test-only* item.
2. **Then [W5](plans/p1-what-satisfies-a-join.md)** — one real fan-out flow on a real scheduler,
   which closes P1. It also owns three of W4's findings: [Q41](open-questions.md) (nothing composes
   the fold's input sequence), [Q42](open-questions.md) (the stuck-join predicate exists only in a
   test), and [Q43](open-questions.md) (**run state calls a permanently stuck run `completed`**).
3. **Four traps are live for whoever writes W5.**
   - **`FD-V14`** — the well-formedness rule whose *absence* keeps P1's case authorable, stated in
     the **all-paths** form because the *can-reach* form forbids nothing.
   - **`JP-R7` and `JP-R8`** ([Q24](open-questions.md)) — the two one-line policy refinements. They
     were traps *during* the spike, and with ADR 0003 written they are now the **live question**;
     `test/matrix/variants.test.ts` runs both under their own ids. **W1 wrote one of them itself**
     before a conformity pass caught it, so the trap half has not expired: neither belongs in
     `src/fold/policies.ts` without its own decision.
   - **`OR-R1`** — where a `{...e.detail}` spread looks like compliance and is not.
   - **A normative claim with no assertion.** W4 found that replacing the join's `null` payload
     with `{}` survived all 251 assertions in five runtimes, though `spec/join-policy.md` section 4
     spends a paragraph on why it must be `null`. **A rule with a rationale and no test is not
     protected by either.**
4. **Nothing upstream needs raising.** Every item in [scheduler-upstream.md](scheduler-upstream.md)
   is closed, deferred with a costless workaround, or declined. S2 is the next candidate and P1 is
   what would produce the number that justifies it.

**The fan-out gate is cleared** (`workflow.md` section 7 rule 3) — not because Q4 is answered, but
because P1 builds both of its candidate answers, so W2 and W3 can be written without knowing which
wins.

## Reading order

| | |
|---|---|
| [concept.md](concept.md) | **Read first.** What we are building, the substrate fact that shapes everything, and the one structural idea - run state is a pure fold of an event log |
| [workflow.md](workflow.md) | **Read before any work item.** The loop, the verification ladder, the test rules, how work is split. Inherited and unproven - its adaptations are listed at the end for the first retro to judge |
| [decisions/](decisions/) | ADR 0001, 0002, 0007. They bind `spec/` rather than being superseded by it - 0007 in particular is what [outcome-record.md](../spec/outcome-record.md) makes checkable |
| [plans/p1-...](plans/p1-what-satisfies-a-join.md) | **The active plan.** Five work items, one exit artifact: does arrival-counting actually break |
| [open-questions.md](open-questions.md) | The register. 31 open, 12 resolved |
| [scheduler-upstream.md](scheduler-upstream.md) | S1-S8, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us, and nothing is left to raise** |
| [../spec/README.md](../spec/README.md) | **The normative layer.** Six documents, an example corpus, and the rules for changing it. Five written by W1, [run-state.md](../spec/run-state.md) by W2 |
| [work-items/](work-items/) | One file per work item. [W1](work-items/w1-the-normative-layer.md), [W3](work-items/w3-the-driver-and-the-validator.md) and [W2](work-items/w2-the-fold-and-both-join-policies.md) **done**; [W4](work-items/w4-the-join-failure-matrix.md) **in review** - built, gated, ADR written, conformity pass outstanding; W5 not yet - [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.2** | Section 7's *"controlling a run from a UI"* non-goal now carries one narrow, cited exception (ADR 0004). Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. Section 3 was re-verified line by line at 0.3.0 and gained three constraints. Section 6's leanings are now two ADRs and one spike; the routing and definition rows there are **superseded by ADR 0001-0002** and should be read as history |
| `open-questions.md` | live | **31 open, 12 resolved.** **Q4 and Q17 closed with W4**, Q14 and Q25 with W2. Q5, Q7 and Q24 all read differently now that Q4 is answered, and Q42-Q44 are what the matrix turned up |
| `workflow.md` | **v0.2**, still unproven | **The ladder gained a runtime axis** (section 4) and section 8 now splits the budget: one runtime in the edit loop, all three at the plan gate. Never run here, and never run in the repo it came from either. P1's retro is its first real test, and the adaptation table at the end is what that retro should judge |
| `decisions/` | **5 ADRs**, all accepted | None superseded. **0003 is still reserved for Q4's answer** and is written when W4 has run. 0001 and 0002 went to the stated leaning; 0007 and **0004** are the two no leaning predicted - and 0004 was raised by a *reader*, in W1's spec-conformity pass, rather than by an author |
| `plans/p1` | **in progress — but its question is answered** | **W1, W3, W2 done and W4 built**, with [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) as the result. 252 assertions in five runtimes - Node 24, Deno, chromium, firefox, webkit - identical in all of them. **W5 closes the plan.** W4 used Q42-Q44 and ADR 0003, skipping 0010-0012; W5 reserves from Q51 and 0013 |
| `scheduler-upstream.md` | live | 8 items, **5 closed** (S1 answered, S3 declined by us, S4 done, S7 fixed, S8 declined by upstream), S5 deferred, S2/S6 waiting on a real need. **Nothing left to raise** |
| `spec/` | **six documents** | `flow-definition` v0.6, `outcome-record` v0.5, `join-policy` v0.7, `runtime-targets` v0.6, `task-id` v0.3, **`run-state` v0.2**, plus 29 hand-written examples, a declared registry, and **66 numbered rules**. **Four conformity passes, all acted on.** `run-state` section 5 is the one thing to read if you read one section: it records three claims v0.1 made that its own inputs could not supply, rather than editing them away. L0 is `node scripts/check-spec.mjs` (eight checks) plus `check-source.mjs` (six) and `deno publish --dry-run` |

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
