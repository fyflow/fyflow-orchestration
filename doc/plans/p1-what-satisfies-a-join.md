# P1 — What satisfies a join

**Status:** planning
**Question this plan answers:** *When a decision inside a fan-out branch routes that branch away
from its join, does expected-arrival counting actually break — and does live-token accounting
actually survive it?*
**Exit artifact:** the branch-routed-away case as an executable test, run against **both** join
policies, plus one real fan-out flow completing on a real scheduler.
**Reserves:** W1-W5, Q22-Q30, ADR 0003-0006

---

## Why this plan, and why now

[Q4](../open-questions.md) is the hard question in the repo and it was **deliberately not decided by
argument**. Both candidate answers are defensible on paper:

- **Expected-arrival counting** — wait for N branches. Obvious to implement, obvious to display,
  obvious to explain.
- **Live-token accounting** — the join fires when the region's outstanding-token count reaches zero.
  Survives a branch being routed away, failing, or fanning out further.

The case that separates them is **a decision inside a fan-out branch that routes away from the
join**. The branch legitimately never arrives; an arrival counter never completes; the run hangs
with **no error**. Worse, the scheduler looks *idle* while it happens — a blocked task is removed
from `queued`, so `stats` reads `queued=0 running=0` (`AGENTS.md`, the `idleTimeout: 0` deadlock
note).

That is a strong argument, and a strong argument is exactly what this plan refuses to accept as
sufficient. **We build the case and let it decide.** If arrival-counting survives it — because some
constraint makes the routed-away branch impossible or cheap to forbid — that is a real result and
the simpler mechanism wins.

Afterwards we will know: which policy is correct, what a join costs at fan-out width, and whether
Q5-Q7 are one question or several.

## Scope

**In**

1. The **minimum flow definition** that can express the case: sequence, a decision, a fan-out, a
   join. Data-shaped, predicates by name (ADR 0002).
2. The **task id scheme** — fan-out forces it, and a collision silently overwrites (Q13).
3. The **fold**: run state from an ordered outcome log, with the join policy behind one interface so
   both implementations are swappable.
4. The **driver**: the only thing that touches the scheduler (ADR 0001).
5. The **join/failure matrix** — every Q5 outcome against both policies.
6. One **real run**: real scheduler, real workers, a fan-out that completes.

**Out** — named rather than left implicit

- **Nested fan-out (Q6).** The matrix records what each policy *would* do; nothing implements it.
  It lands in P2 once Q4 is settled, because its answer is nearly free under one policy and a
  separate mechanism under the other.
- **Map-style fan-out (Q12)** — "one branch per item in the previous output". P1 uses static
  parallel split only. Q12 is what makes the counter dynamic, and mixing it in here would confound
  the very comparison this plan exists to make.
- **Flow-level retry (Q16), cancellation (Q18), durability (Q15).** All downstream of Q4.
- **An event family for `fyflow-react-components` (Q21).** Not before the shape of run state is
  settled by this plan.
- **Performance at scale (Q19).** P1 measures a join at modest width to get a number, not to tune.

## Decisions taken before fan-out

Per `doc/workflow.md` section 7 rule 3 — decide, then fan out.

| | Settled by |
|---|---|
| Routing executes in the driver, outside the scheduler | [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) |
| The graph is data; predicates are registered by name; an unknown name fails at instantiation | [ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) |
| Run state is a fold of an ordered outcome log | `doc/concept.md` section 5. Still a leaning as far as Q14 is concerned — **W2 is what tests it** |
| Both join policies are built | This plan. They meet at one interface, which is W1's job to define |

**Q4 itself is deliberately still open.** Building both is the method, and a work item that picks a
winner before W4 has run has skipped the plan.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W1 | The definition spec + task id scheme — **and the join-policy interface** | `spec/**` | nothing | L0, spec review |
| W2 | The fold: outcome log → run state, both policies behind W1's interface | `src/fold/**` | W1 | L0-L3 |
| W3 | The driver: subscribe, route, dispatch | `src/driver/**` | W1 | L0-L2 |
| W4 | The join/failure matrix — every Q5 outcome × both policies | `test/matrix/**` | W2 | L0-L5 |
| W5 | One real fan-out flow on a real scheduler | `examples/**` | W2, W3 | L0-L6 |

W2 and W3 run in parallel **because W1's spec separates them** — they meet at the definition and the
outcome-log shape, never at each other's code (`doc/workflow.md` section 7 rule 1). W1 is serial and
everything waits on it.

Each has its own file under `doc/work-items/`. This table is an index, not the declaration.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q4](../open-questions.md) | What satisfies a join — arrivals or live tokens. **The plan's whole question** | W4 |
| [Q5](../open-questions.md) | What a join does when a branch fails / is `user_action` / is optional-null / is routed away. The matrix's rows | W4 |
| [Q7](../open-questions.md) | Whether a join can time out. P1 must at least **detect** a stuck join, or W4 cannot report a failure as anything but a hang | W4 |
| [Q10](../open-questions.md) | What happens when no decision edge matches. Reachable in P1's own flow, so it needs an answer here | W1 |
| [Q13](../open-questions.md) | The task id scheme. Fan-out forces it; a collision silently overwrites | W1 |
| [Q14](../open-questions.md) | Is run state a fold, and of whose log | W2 |
| [Q17](../open-questions.md) | How `user_action` surfaces at flow level. It is a row in the matrix, so P1 cannot avoid it | W4 |

Q6, Q12, Q15, Q16, Q18-Q21 are **not** carried — see Scope/Out.

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** *Where it is, and how to re-produce it.*

**What the plan answered.** *Q4, answered — including "arrival-counting was fine", which is a
legitimate outcome and would make the simpler mechanism the right one.*

**Retro.** *`doc/workflow.md` section 6 pass 3. "No change" is an expected verdict. This retro also
judges the workflow adaptations tabled at the end of `doc/workflow.md`, since P1 is their first
run.*
