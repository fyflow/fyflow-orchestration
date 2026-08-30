# Documentation index

## Current state

**Three of P1's five work items are done — W1, W3 and W2 — and `src/` now holds the validator, the
driver and the fold. Every gate ran in five runtimes; four spec-conformity passes have run and every
finding is acted on.** Blocking findings ran 4, then 5, then 1, then 4 — and no pass has yet come
back empty, which is the strongest thing this repo knows about its own process.

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
ADR).

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
silently. It typechecks and does nothing — **confirmed vestigial by the maintainer**, so this no
longer rests on our own reading. [S1](scheduler-upstream.md).

**What happens next:**

1. **[W4](plans/p1-what-satisfies-a-join.md) — the join/failure matrix, and the thing that actually
   answers [Q4](open-questions.md).** Everything it needs now exists: both policies are built and
   behaviourally distinguished ([`src/fold/policies.ts`](../src/fold/policies.ts)), the driver opens
   and steps a policy with all six region events, and the fold turns a log into run state. W4 writes
   **ADR 0003**. It reserves Q ids from **Q42** and ADRs from **0010**.
2. **Then W5** — one real fan-out flow on a real scheduler, which is also what wires
   [Q41](open-questions.md): nothing yet composes the fold's input sequence.
3. **Four traps are live for whoever writes W4.**
   - **`FD-V14`** — the well-formedness rule whose *absence* keeps P1's case authorable, stated in
     the **all-paths** form because the *can-reach* form forbids nothing.
   - **`JP-R7` and `JP-R8`** ([Q24](open-questions.md)) — the two one-line policy refinements that
     would make the spike return *"the two policies are equivalent"* as a passing test. **W1 wrote
     one of them itself** before a conformity pass caught it.
   - **`OR-R1`** — where a `{...e.detail}` spread looks like compliance and is not.
   - **The seam's non-arrival paths.** W3's pass 3 found that deleting `status`'s call after
     `branch.exited` makes `live-token` give `arrival-count`'s answer on P1's own flow. **A stub
     that counts arrivals only asks the question `arrival-count` can answer**, which is how that
     survived a green suite in five runtimes.
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
| [open-questions.md](open-questions.md) | The register. 30 open, 10 resolved |
| [scheduler-upstream.md](scheduler-upstream.md) | S1-S8, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us, and nothing is left to raise** |
| [../spec/README.md](../spec/README.md) | **The normative layer.** Six documents, an example corpus, and the rules for changing it. Five written by W1, [run-state.md](../spec/run-state.md) by W2 |
| [work-items/](work-items/) | One file per work item. [W1](work-items/w1-the-normative-layer.md), [W3](work-items/w3-the-driver-and-the-validator.md) and [W2](work-items/w2-the-fold-and-both-join-policies.md) **done**, each with a conformity pass acted on; W4, W5 not yet - [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.2** | Section 7's *"controlling a run from a UI"* non-goal now carries one narrow, cited exception (ADR 0004). Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. Section 3 was re-verified line by line at 0.3.0 and gained three constraints. Section 6's leanings are now two ADRs and one spike; the routing and definition rows there are **superseded by ADR 0001-0002** and should be read as history |
| `open-questions.md` | live | **30 open, 10 resolved.** Q4 is `deferred` in the specific sense that a spike decides it. Q14 and Q25 closed with W2, and **Q14 was the last of `concept.md` section 6's four leanings still only a leaning** |
| `workflow.md` | **v0.2**, still unproven | **The ladder gained a runtime axis** (section 4) and section 8 now splits the budget: one runtime in the edit loop, all three at the plan gate. Never run here, and never run in the repo it came from either. P1's retro is its first real test, and the adaptation table at the end is what that retro should judge |
| `decisions/` | **4 ADRs**, all accepted | None superseded. **0003 is still reserved for Q4's answer** and is written when W4 has run. 0001 and 0002 went to the stated leaning; 0007 and **0004** are the two no leaning predicted - and 0004 was raised by a *reader*, in W1's spec-conformity pass, rather than by an author |
| `plans/p1` | **in progress** | **W1, W3 and W2 done; W4 is next and it is the one that answers the question.** The suite runs in five runtimes - Node 24, Deno, chromium, firefox, webkit - and is identical in all of them. **Both reserve blocks are spent** - W4/W5 take Q ids from **Q42** and ADRs from **0010**; W2 used Q41 and skipped 0008-0009 |
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
