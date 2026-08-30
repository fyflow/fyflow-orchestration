# P1 — What satisfies a join

**Status:** in progress - W1 done and merged (`a6edc92`); **W3 declared and running next**; W2, W4, W5 not declared
**Question this plan answers:** *When a decision inside a fan-out branch routes that branch away
from its join, does expected-arrival counting actually break — and does live-token accounting
actually survive it?*
**Exit artifact:** the branch-routed-away case as an executable test, run against **both** join
policies, plus one real fan-out flow completing on a real scheduler.
**Reserves:** W1-W5, Q22-Q30, ADR 0003-0006
**Both reserve blocks are spent.** W3 used Q36-Q39 and no ADR; **W2 reserves Q41-Q45 and ADR 0008-0009**, past the block. W1 allocated Q22-Q30 in full (five of them raised by its own
spec-conformity pass) **and then Q33-Q35**, from the three-runtime requirement; **W3 takes Q36-Q40
and ADR 0005-0006**, the last of the ADR block. ADR 0003 is still held for Q4 and is W4's; W1 took
0004; 0007 came from outside the block. **W2, W4 and W5 reserve Q ids from Q41 and ADRs from 0008.**

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
- **Proving portability.** `spec/runtime-targets.md` binds every work item from now on — L0-L5 run in
  all three runtimes — but **P1 exists to answer Q4, not to demonstrate that the layer runs in a
  browser.** Whether W5's real run happens once or three times is [Q33](../open-questions.md),
  answered at W5 rather than assumed here. The plan gate is budgeted at 90 s
  (`doc/workflow.md` section 8) and a three-runtime L6 does not fit in it.

## Decisions taken before fan-out

Per `doc/workflow.md` section 7 rule 3 — decide, then fan out.

| | Settled by |
|---|---|
| Routing executes in the driver, outside the scheduler | [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) |
| The graph is data; predicates are registered by name; an unknown name fails at instantiation | [ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) |
| The driver copies declared fields at the listener boundary; the outcome record is keyed on terminal state, not event name | [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) — **binds W1 (the record shape), W2 (the fold) and W3 (the listener)** |
| Run state is a fold of an ordered outcome log | `doc/concept.md` section 5. Still a leaning as far as Q14 is concerned — **W2 is what tests it** |
| A non-success outcome routes only through an edge that opts in; `user_action` **suspends** and is resumed by a resolution record | [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) — raised by **W1's spec-conformity pass**, not by design. It is the only decision here taken *after* fan-out was cleared, and it was taken before W2 or W3 wrote a line |
| Both join policies are built | This plan. They meet at one interface, which is W1's job to define |

**Q4 itself is deliberately still open.** Building both is the method, and a work item that picks a
winner before W4 has run has skipped the plan.

## The threat to this plan's validity — **retired 2026-08-30**

**It was:** a silently dropped task is indistinguishable from a stuck join. At 0.2.1
`core/FyflowScheduler.ts:848` shifted a task out of a blocked queue and dropped it when its pool was
missing — no event, no rejection, no `stats` entry. The run then waited forever with nothing queued,
nothing running and no error: **exactly** the signature this plan is trying to attribute to a join
policy, and an experiment whose null result has a second possible cause has not run.

**It is gone.** `fyflow-scheduler` 0.3.0 (`634e23a`) fails such a waiter terminally via
`_failOrphanedTask` — `task.failed`, then `task.user_action` unless optional, a rejected promise, a
`stats.failed` increment, and one `orphaned` unblocked exit per queue it sat in.
[Q32](../open-questions.md) is resolved; [S7](../scheduler-upstream.md) is closed.

What survives, deliberately:

1. **W5 still asserts that every dispatched node eventually produces an outcome record** — now
   *cheap insurance* rather than a validity gate. It checks a property the library asserts instead
   of one it violated, which is a much weaker reason to keep a test and still a sufficient one.
2. **W4's matrix still distinguishes *"the policy did not fire"* from *"the outcome never
   arrived"*.** They remain different cells. The second is now expected to be empty, and an empty
   cell that could fill is worth more than a cell that was never there.

**Detecting a stuck join is still entirely ours.** 0.3.0's `resource.blocked` and
`getAdmissionQueue()` make a *scheduler-level* stall visible and legible. A stuck join has **nothing
blocked and nothing queued** — no resource is short of anything — so neither fires.
[Q7](../open-questions.md) is untouched by that work, and W4 needs its own detection or it can only
report a hang as a timeout.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W1 | The definition spec + task id scheme + **the outcome-record shape** (ADR 0007) + the join-policy interface + **the runtime targets** | `spec/**`, `scripts/check-spec.mjs`, `.node-version` | nothing | L0, spec review — **L0 run three times, spec review run twice**. The first review produced [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md); the second found the same defect class the first had, under a new id |
| W2 | The fold: outcome log → run state, both policies behind W1's interface, **and `spec/run-state.md`** | `spec/run-state.md`, `src/fold/**`, `test/fold/**` | W1 (and W3 by sequencing) | L0-L3 in **all five runtimes** |
| ~~W3~~ | The driver, the validator, the join seam, the toolchain | `src/driver/**`, `src/definition/**`, `test/{driver,definition}/**`, the toolchain | W1 | **done** — L0-L2 and L4 in **five runtimes**, 142 assertions, plus **three** spec-conformity passes |
| W4 | The join/failure matrix — every Q5 outcome × both policies | `test/matrix/**` | W2 | L0-L5 |
| W5 | One real fan-out flow on a real scheduler, **plus the every-node-settles assertion** (Q32) | `examples/**` | W2, W3 | L0-L6 — **L0-L5 in all three runtimes** (`RT-R1`); whether **L6** runs in all three is [Q33](../open-questions.md), and W5 is where it is answered |

**W1 grew, twice.** ADR 0007 made the outcome record a normative shape rather than an internal type:
it is what rule 1's "declared fields" means, and it is what lets a reviewer tell a compliant copy
from a `{...e.detail}` spread that still aliases `payload`, `result` and `error`. Then its own
spec-conformity pass produced **[ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)** —
routing is opt-in per terminal state and `user_action` suspends — which added a **resolution record**
to the log and two non-terminal region events to the join vocabulary.

**W3 grew too, and the argument is ADR 0002's.** The definition validator had no owner: W2's gate is
L0-L3 over `src/fold/**` and ladder **L4 was in nobody's**, leaving W1's twenty refusals and the
whole example corpus ungated (`doc/workflow.md` section 1 rule 1). ADR 0002 rule 3 validates a
definition *at instantiation*, and instantiation is a driver action — so W3 owns it. W3 also owns
the inbound resolution API that ADR 0004 rule 5 creates, which is the only place anything outside
this process can change a run.

W2 and W3 run in parallel **because W1's spec separates them** — they meet at the definition and the
outcome-log shape, never at each other's code (`doc/workflow.md` section 7 rule 1). W1 is serial and
everything waits on it.

Each has its own file under `doc/work-items/`. This table is an index, not the declaration.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q4](../open-questions.md) | What satisfies a join — arrivals or live tokens. **The plan's whole question** | W4 |
| [Q5](../open-questions.md) | What a join does when a branch fails / is `user_action` / is optional-null / is routed away. The matrix's rows. **Narrowed by ADR 0004: the four cases are three region events, and two of the four are the same scheduler outcome** — `optional`-null *is* `terminalState: 'failed'`. `user_action` is not a loss at all; the branch suspends and the join keeps waiting | W4 |
| [Q7](../open-questions.md) | Whether a join can time out. P1 must at least **detect** a stuck join, or W4 cannot report a failure as anything but a hang | W4 |
| [Q10](../open-questions.md) | What happens when no decision edge matches. Reachable in P1's own flow, so it needs an answer here. **Answered** — `FD-V7` at instantiation, `FD-R1` as the assertion | ~~W1~~ **done** |
| [Q13](../open-questions.md) | The task id scheme. Fan-out forces it; a collision silently overwrites. **Answered** — and the source says worse than "overwrites": both tasks run and two records land under one key | ~~W1~~ **done** |
| [Q14](../open-questions.md) | Is run state a fold, and of whose log | W2 |
| [Q17](../open-questions.md) | How `user_action` surfaces at flow level. **Detection** was answered by [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 2 and the **mechanism** by ADR 0004 rules 3-6 — it suspends, and an external resolution record resumes it. What is left for W4 is what a join does while a branch is suspended, and for W2 what the run-level outcome is called (Q25) | W4 |
| [Q32](../open-questions.md) | Telling a stuck join apart from a silently dropped task. **A threat to this plan's validity**, not a side question — see the section above | W5 |

Q6, Q12, Q15, Q16, Q18-Q21 are **not** carried — see Scope/Out.

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** *Where it is, and how to re-produce it.*

**What the plan answered.** *Q4, answered — including "arrival-counting was fine", which is a
legitimate outcome and would make the simpler mechanism the right one.*

**Retro.** *`doc/workflow.md` section 6 pass 3. "No change" is an expected verdict. This retro also
judges the workflow adaptations tabled at the end of `doc/workflow.md`, since P1 is their first
run.*
