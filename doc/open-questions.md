# Open questions

The register. One row per question, ids monotonic, **never reused and never renumbered**
(`doc/workflow.md` section 3). A work item reserves a block before it starts and fills rows from it.

**Status values:** `open` · `deferred` (real, not now, with a reason) · `resolved` (with what
resolved it - an ADR, a spec section, or a plan record).

**Owner** is the work item or plan that will answer it, or `no owner` - which is honest and common
before the first plan exists.

**A leaning is not a decision.** Several rows below carry one, because starting a refinement pass
from a blank page wastes it. Every leaning states the argument against itself. Nothing here is
settled until an ADR says so.

---

## The shape of the register

Twenty-one questions in five clusters. They are **not** equally hard, and treating them as a flat
list is the first way to get this wrong:

| Cluster | Q | Why it is grouped |
|---|---|---|
| **Control flow** | ~~Q1, Q2~~ | **Resolved 2026-08-30** - ADR 0001 and ADR 0002. Everything else was downstream of these two |
| **The join** | Q4-Q7 | The genuinely hard part. Q4 is load-bearing for the other three, and is **deferred to a spike** rather than argued |
| **Decisions and data** | Q8-Q12 | Ordinary design, but Q12 hides two different features under one word |
| **Identity, state, failure** | Q13-Q18 | Where the library's sharp edges land on us |
| **Scale and interop** | Q19-Q21 | Answerable late, but Q19 changes the run representation if it lands badly |

**Q1, Q2 and Q4 were the three that gate fan-out.** Two are decided; the third is deliberately
settled by evidence instead, which is what [P1](plans/p1-what-satisfies-a-join.md) exists to do.
**Fan-out on work items may begin** — the gate in `doc/workflow.md` section 7 rule 3 is cleared,
because P1 builds both join policies behind one interface rather than needing the winner first.

## Live

### Control flow

*Q1 and Q2 are resolved - see the Resolved table.*

### The join

| Q | Question | Status | Owner |
|---|---|---|---|
| Q4 | **What satisfies a join - expected arrivals, or live tokens?** A static *"wait for N"* is wrong the moment a **decision inside a fan-out branch routes away from the join**: the branch legitimately never arrives, the counter never reaches N, and the run hangs with no error. Live-token accounting (Petri-net style - the join fires when the region's outstanding-token count reaches zero) survives that, and also survives a branch fanning out further. **Against:** token accounting is harder to explain, harder to display in a UI, and makes "how many are we waiting for" a computed answer rather than a stored one. **This is the hard question in the repo** and Q5-Q7 all read differently depending on it. **2026-08-30: deliberately not decided by argument.** [P1](plans/p1-what-satisfies-a-join.md) builds **both** policies behind one interface and settles it with the branch-routed-away case as an executable test. If arrival-counting survives, the simpler mechanism wins - that is a real possible outcome, not a courtesy | **deferred - P1 decides it with evidence** | W4 |
| Q5 | **What does a join do when a branch does not succeed?** Four distinct cases the word "fail" hides: a branch task **`failed`**; a branch ending in **`user_action`** (non-optional, retries spent); an **`optional`** branch that resolved `null`; and a branch **routed away** by a decision. Candidate policies - fail the join, proceed with partial results, route to an error edge, wait forever - are each right for some flow, so this may be per-join configuration rather than one global rule. Depends on Q4 | open | P1 |
| Q6 | **Is a join transitive over nested fan-out?** If a branch itself fans out, does the outer join wait for the grandchildren? `onCompleteDescendants()` is transitive over *lineage*, which is suggestive but not applicable - it is not a join (concept section 3, constraint 7). Under Q4's token reading this is nearly free; under arrival-counting it needs a separate mechanism | open | P1 |
| Q7 | **Can a join time out, and what is the run's state if it does?** Without a timeout, any bug in Q4/Q5 becomes a permanently stuck run - and the scheduler will look **idle** while it happens, because a blocked task is removed from `queued` (`AGENTS.md`, the `idleTimeout: 0` deadlock note). With a timeout, we need a flow-level outcome that is neither `done` nor `failed`. Note the shape of the answer is close to `user_action` (Q17) | open | P1 |

### Decisions and data

| Q | Question | Status | Owner |
|---|---|---|---|
| Q8 | **Does a decision see only its node's output, or accumulated run state?** Node-output-only keeps predicates trivially pure and cheap to test. Accumulated state is what real flows want (*"route to review if any earlier step flagged low confidence"*) and is what makes Q19 urgent, because it means the run retains every node's output rather than just the last | open | P1 |
| Q9 | **Are decision predicates required to be pure, and how is that enforced rather than requested?** A predicate that calls the network or mutates run state breaks the fold and turns determinism (ladder L3) from a check into a coin flip. "Please write pure functions" is not a mechanism. Depends on Q2 | open | no owner |
| Q10 | **What happens when no decision edge matches?** Three defensible answers - a mandatory default edge, a run-level error, or the node is terminal for that branch - and they are indistinguishable at authoring time, which is how a flow silently stops halfway. Whichever wins, the refusal needs a test (`spec/README.md` rule 4) | open | P1 |
| Q11 | **What does a node receive as its payload?** The previous node's output, a run-scoped accumulator, or a declared per-edge mapping. This is the API surface users touch most, so it is the one most expensive to change later. Interacts with Q8 (same retention cost) and with ADR-to-be on redaction if Q21 lands | open | P1 |
| Q12 | **Is fan-out one feature or two?** *"Route to A and B in parallel"* (a static parallel split, arity known at authoring time) and *"run this node once per item in the previous output"* (a map, arity known only at run time) are different features wearing one word. The second is what makes the 1000s-10000s workload in `FLOW_PLANNING.md` real, and it is the one that makes Q4's counter dynamic. Deciding they are the same primitive is a choice, not an observation | open | P1 |

### Identity, state, failure

| Q | Question | Status | Owner |
|---|---|---|---|
| Q13 | **What is the scheduler task id scheme, and what stops a collision corrupting a run?** An id must encode at least `(runId, nodeId)`, plus a fan-out index (Q12) and possibly an attempt (Q16). **Reusing an id overwrites, silently** (`AGENTS.md` section 5), so a collision is not an error - it is a run quietly losing a task. This is a correctness rule for `spec/` with a refusal test, not a formatting convention | open | P1 |
| Q14 | **Is run state a fold of an event log, and whose log?** *Leaning: yes* (concept section 5). The open half is **whose**: our own flow-level log, the scheduler's task events, or ours wrapping theirs. Only a flow-level log carries "branch taken" and "join satisfied", which the scheduler cannot see. **Against:** a second log is a second thing to keep ordered and bounded, and Q19 lands on it | open | P1 |
| Q15 | **Is a run resumable across a process restart, and is that in the first set?** Non-goal for now (concept section 7). The question stays live because the *cost of the door closing* is what Q14 is buying, and if Q2 lands on closures the door is already shut. `../fyflow-scheduler/PERSISTENCE_ANALYSIS.md` rates scheduler-side persistence *medium to high*; ours is cheaper only if the fold holds | deferred - first set is in-memory | no owner |
| Q16 | **Flow-level retry and task-level `retryPolicy` - who owns what, and do they compose?** The scheduler retries an *attempt* of a task. Retrying a *node* - possibly routing elsewhere on the second try - is a different thing, and if both exist the effective retry count is a product nobody intended. Also decides whether an attempt is in the task id (Q13) | open | P1 |
| Q17 | **How does `user_action` surface at flow level?** The fifth state - non-optional, retries spent, needs a human - is the one every design drops. `fyflow-react-components` raised the identical question as **their Q16** and it is still open there; two repos independently missing the same state is the argument for settling it here rather than deferring. It is neither success nor failure, so it needs a run-level outcome of its own, and it is what Q5 and Q7 will most likely reuse | open | P1 |
| Q18 | **What does cancelling a run actually do?** The scheduler **cannot cancel a queued task** (`AGENTS.md` section 1, not implemented), so cancellation can stop *routing* but not stop already-dispatched work from running. That makes "cancelled" a claim we cannot fully honour, and pretending otherwise is worse than saying so. Recorded upstream as [S2](scheduler-upstream.md) | open | no owner |

### Scale and interop

| Q | Question | Status | Owner |
|---|---|---|---|
| Q19 | **Is per-run retained state bounded?** `FLOW_PLANNING.md` targets 1000s-10000s of concurrent workloads. If Q8 or Q11 retains every node output, a run's footprint is proportional to its node count and the total is that times the run count. The scheduler already has this problem and answers it with `maxCompletedTasks` and eviction; we would inherit the answer *and* its sharp edge (eviction is silent). Cross-references `fyflow-react-components` **Q14**, which is the same question one layer up | open | no owner - needs a measured run |
| Q20 | **Does one orchestrator ever drive more than one scheduler, and is a run id global?** Expected topology is one-to-one. This row exists so the assumption is written down rather than assumed, which is the same reason `fyflow-react-components` carries its **Q15** | open | no owner |
| Q32 | **How does P1 tell a stuck join apart from a silently dropped task?** `core/FyflowScheduler.ts:848` shifts a task out of a blocked queue and **drops it** when its pool is missing - never requeued, no event ([S7](scheduler-upstream.md)). The run then waits forever for an outcome that will never arrive: **nothing queued, nothing running, no error** - byte-for-byte the signature P1 is trying to attribute to a join policy. `addTasks` validates worker types so it should be unreachable, and "should be unreachable" is exactly the standing an experiment cannot rely on. Minimum answer: W5 asserts every dispatched node eventually produces an outcome record, so a hang is attributable | open | W5 |
| Q21 | **Do we emit an event family for `fyflow-react-components`?** Flow structure is invisible to the scheduler, so today no UI can show which node a run is at, which branch it took, or what a join is waiting on. That repo has already decided the envelope shape - per-source families ([ADR 0002](https://github.com/fyflow/fyflow-react-components) there), sequence numbers, collector-stamped time, payloads redacted by default - so this is *"do we become a second source family"*, not *"design a wire format"*. **The redaction default is inherited, not optional**, if we do | open | no owner - not before P1 |

## Resolved

| Q | Question | Resolution |
|---|---|---|
| Q1 | Where does routing execute? | **The driver, outside the scheduler** - [ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md). The driver is the only thing that touches the scheduler; a worker computes and does not route; routing is a pure function of `(definition, run state, outcome)`. Decided by two library facts rather than by preference: spawn is lineage and cannot join, and a worker that routes owns part of the definition. **The cost is accepted, not dodged** - a serialization point on a hot path, and the driver holding the only copy of run truth until Q15 |
| Q2 | Is a flow definition data, code, or data with registered predicates? | **Data, with predicates registered by name** - [ADR 0002](decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md). The graph is JSON-serializable with no functions in it; an edge names a predicate; an unknown name fails **at instantiation**, mirroring `addTask` throwing on an unknown `workerType`. Keeps Q15 and Q21 open, which is most of what it was protecting. Rule 5 carries the honest half-truth: the *definition* is portable, the *deployment* is not |
| Q31 | Can the driver retain a scheduler event's `detail`? | **No, and one event lies about its own name** - [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md). Verified in the source: `detail` **is** the live `FyflowTask` (`core/FyflowScheduler.ts:727, 775, 777, 974`) and `scheduler.completed`'s detail is `this.stats`, mutated in place. Separately, a non-optional task out of retries sets `state = 'user_action'` and then dispatches **both** `task.failed` and `task.user_action` for the same object, so a driver reading event names double-counts and routes a human-intervention case down an error edge. The driver copies declared fields at the listener boundary and keys the outcome record on terminal state. Upstream declined to fix the first half in code ([S8](scheduler-upstream.md)), which is what made it ours |
| Q3 | Which `fyflow-scheduler` version do we pin? | **0.2.1**, matching `fyflow-react-components`. Same maintainer across all three repositories, so a pre-1.0 bump is coordinated rather than discovered. No ADR - this is a note, not an architecture. It becomes one the day the three repos need to disagree |

## Notes

**2026-08-30, later - reading `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` cost us an ADR and
raised two questions.** The plan is a counter-proposal to `fyflow-react-components`' upstream spec,
so most of it is about resource gauges we do not consume. Two paragraphs in it were ours:

- **§11, four lines long, is the one that mattered.** Event details are live references, and
  upstream has declined to fix that in code. Our whole architecture is a fold of a log, and a log of
  aliases is not a log — so this became
  [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
  (Q31). Checking it in the source then turned up the sharper half, which the plan does not mention:
  a non-optional task out of retries dispatches **`task.failed` and `task.user_action` for the same
  object**, in that order, with `state` already set to `user_action` before either. That is
  [Q17](#live) answered by accident, and it would have been found by W3 debugging a double-count
  instead.
- **§4.4's exit (c)** — a blocked task dropped with no event — produces exactly the signature P1 is
  trying to attribute to a join policy. Q32.

**The general lesson, worth a rule if it recurs:** the useful part of an upstream document written
for a *different* consumer was not the part addressed to a consumer at all. Reading only the sections
that name our concerns would have missed both.

**2026-08-30 - the three gating questions are cleared, two of them by deciding.** Q1 and Q2 became
[ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) and
[ADR 0002](decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md).
Both went to the leaning, and in both cases the argument that carried it was **from the library's
own behaviour** rather than from taste - spawn cannot join, and `workerType` already resolves by
name against a registry.

**Q4 went the other way, and that is the more interesting decision.** The argument for live-token
accounting is strong, and it was refused as *sufficient*. [P1](plans/p1-what-satisfies-a-join.md)
builds both policies behind one interface and settles it with the branch-routed-away case as an
executable test. The cost is one round trip before fan-out work starts; what it buys is that the
answer cannot be a plausible-sounding mistake, which is the failure mode a strong argument produces
and nothing else catches. **Arrival-counting winning is a real possible outcome**, and would make
the simpler mechanism the right one.

**2026-08-29 - the register opens with nothing resolved, deliberately.** Q1-Q21 were written
alongside `doc/concept.md`. Only Q3 is answered, and it is a note rather than a decision.

The sibling repo `fyflow-react-components` resolved eleven of thirteen on day one, and that was
right there: its questions were about a **wire format for events that already exist**, so the
library's behaviour decided most of them. Ours are about **control flow the library does not have
at all** (concept section 2), so there is no existing behaviour to read the answer off. Copying the
sibling's cadence would mean deciding Q4 by preference and discovering the branch-routed-away case
during implementation.

**The finding that reframed the repo before it started.** `FLOW_PLANNING.md` - the input document -
is written against `parents`, `dependsOn` and a "DAG scheduler", none of which exist. That is not a
detail: it means this repo builds the ordering primitives rather than wrapping them, which is a
different project of a different size. Found by checking the plan against the library rather than
by starting to build, which is the cheap way to find it.

**`SpawnTaskConfig.parents` is the trap that made it plausible.** The field is declared
(`core/workerInterface.ts:50`) and read nowhere; the spawn path drops it silently. Anyone writing
`spawnTask({ ..., parents: [...] })` gets a clean typecheck and no dependency.
[S1](scheduler-upstream.md).

**Three questions are shared with `fyflow-react-components` rather than merely similar** - Q17 with
their Q16 (`user_action` is missing from every design), Q19 with their Q14 (unbounded retention),
Q20 with their Q15 (one collector, one scheduler). Answers should be coordinated; two repos
answering `user_action` differently is a bug with two homes.
