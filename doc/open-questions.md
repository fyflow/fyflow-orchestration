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

Thirty-five questions in five clusters - 28 open, 7 resolved. They are **not** equally hard, and treating them as a flat
list is the first way to get this wrong:

| Cluster | Q | Why it is grouped |
|---|---|---|
| **Control flow** | ~~Q1, Q2~~ | **Resolved 2026-08-30** - ADR 0001 and ADR 0002. Everything else was downstream of these two |
| **The join** | Q4-Q7, Q23, Q24, Q27 | The genuinely hard part. Q4 is load-bearing for the other three, and is **deferred to a spike** rather than argued. Q23, Q24 and Q27 are W1's, and **Q24 is the pair of one-line changes that would have deleted the spike** - one of which W1 wrote before its own conformity pass caught it |
| **Decisions and data** | Q8-Q12, Q22 | Ordinary design, but Q12 hides two different features under one word |
| **Identity, state, failure** | ~~Q13~~, Q14-Q18, Q25, Q26, Q28-Q30 | Where the library's sharp edges land on us. **Q13 resolved by W1**, and Q17's *mechanism* by ADR 0004 - Q28-Q30 are what that ADR left open |
| **Scale and interop** | Q19-Q21, Q33-Q35 | Answerable late, but Q19 changes the run representation if it lands badly. Q33-Q35 are the three runtimes: what a gate must run in, and what a published floor commits to |
| **Raised late** | Q31, Q32 | Both from upstream documents rather than from our own design. Q31 became ADR 0007; **Q32 dissolved when 0.3.0 fixed the bug behind it** |

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
| Q5 | **What does a join do when a branch does not succeed?** **Narrowed by [ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md), which answered the prior half nobody had asked: whether a non-success outcome routes at all.** It does, but only through an edge that opts in (`on: ["failed"]`); `user_action` routes nowhere and **suspends**. That makes the four cases three region events (`spec/join-policy.md` section 2), and **two of the four turn out to be one**: an optional branch resolving `null` *is* `terminalState: 'failed'` - the same two lines of the same branch at `core/FyflowScheduler.ts:894-897`, and `resolve(null)` is invisible to a listener. What is still open is the join's *policy* on each: fail the join, proceed with partial results, wait forever - each right for some flow, so this may be per-join configuration rather than one global rule. Depends on Q4 | open - **narrowed** | W4 |
| Q6 | **Is a join transitive over nested fan-out?** If a branch itself fans out, does the outer join wait for the grandchildren? `onCompleteDescendants()` is transitive over *lineage*, which is suggestive but not applicable - it is not a join (concept section 3, constraint 7). Under Q4's token reading this is nearly free; under arrival-counting it needs a separate mechanism | open | P1 |
| Q23 | **May an edge leave a fan-out region for a node that is neither the join nor an `end`?** `FD-V13` currently refuses it, which keeps a routed-away branch from continuing to live outside the region and bounds P1's matrix to one live path per branch. **Against the refusal:** *"score, and if it is junk hand it to the quarantine pipeline"* is an ordinary flow, and it is refused today. Lifting it means a token can be outside a region while the join still waits, which multiplies Q5's rows rather than adding to them | open - refused in P1 | no owner |
| Q24 | **Are the two one-line refinements of the join policies a third and fourth policy, rather than repairs of the first two?** Decrementing `arrival-count`'s `N` on `branch.exited` makes it survive P1's case. Requiring `live-token` to have seen at least one arrival before reporting `satisfied` gives it a graceful answer on the all-branches-exited row. `JP-R7` and `JP-R8` pin both policies to Q4's own wording so W4 compares the two the plan named — **and `JP-R8` exists because W1's first version failed it**, refining live-token while denying arrival-count the symmetric move. Either refinement may well be the right answer; both are built after W4, under their own ids | open | after W4 |
| Q27 | **May two branches of one fan-out converge on a shared node?** `FD-V19` refuses it. Without the refusal a shared node's `branchPath` is a property of the traversal rather than of the node (`spec/task-id.md` section 1), and two conformant implementations disagree on whether it dispatches once or once per branch - which the join then sees as one arrival or two. **Against the refusal:** *"score both ways, then merge, then join"* is an ordinary flow. Answering it is close to [Q12](#live)'s map-style fan-out, since both turn one node into many dispatches | open - refused in P1 | no owner |
| Q7 | **Can a join time out, and what is the run's state if it does?** Without a timeout, any bug in Q4/Q5 becomes a permanently stuck run - and the scheduler will look **idle** while it happens, because a blocked task is removed from `queued` (`AGENTS.md`, the `idleTimeout: 0` deadlock note). With a timeout, we need a flow-level outcome that is neither `done` nor `failed`. Note the shape of the answer is close to `user_action` (Q17) | open | P1 |

### Decisions and data

| Q | Question | Status | Owner |
|---|---|---|---|
| Q8 | **Does a decision see only its node's output, or accumulated run state?** Node-output-only keeps predicates trivially pure and cheap to test. Accumulated state is what real flows want (*"route to review if any earlier step flagged low confidence"*) and is what makes Q19 urgent, because it means the run retains every node's output rather than just the last | open | P1 |
| Q9 | **Are decision predicates required to be pure, and how is that enforced rather than requested?** A predicate that calls the network or mutates run state breaks the fold and turns determinism (ladder L3) from a check into a coin flip. "Please write pure functions" is not a mechanism. Depends on Q2 | open | no owner |
| Q10 | *Resolved - see the Resolved table.* | **resolved** | W1 |
| Q22 | **Must a node result be structured-cloneable, and is that a constraint on workers or on the driver?** `OR-R2` deep-copies `result` with `structuredClone` because it is the one outcome-record field whose *value* is a reference the producer may still hold - an inline pool returns the worker's own object. `OR-R6` makes a non-cloneable result a run failure. **Against:** it is a hot-path deep copy that [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) explicitly did not want, and it constrains what a worker may return in order to protect a log. The cheaper alternative - *a worker must not retain what it returns* - is the shape of answer Q9 already rejected as unenforceable. Q19 is what would price it | open | no owner - needs a measured run |
| Q11 | **What does a node receive as its payload?** The previous node's output, a run-scoped accumulator, or a declared per-edge mapping. This is the API surface users touch most, so it is the one most expensive to change later. Interacts with Q8 (same retention cost) and with ADR-to-be on redaction if Q21 lands | open | P1 |
| Q12 | **Is fan-out one feature or two?** *"Route to A and B in parallel"* (a static parallel split, arity known at authoring time) and *"run this node once per item in the previous output"* (a map, arity known only at run time) are different features wearing one word. The second is what makes the 1000s-10000s workload in `FLOW_PLANNING.md` real, and it is the one that makes Q4's counter dynamic. Deciding they are the same primitive is a choice, not an observation | open | P1 |

### Identity, state, failure

| Q | Question | Status | Owner |
|---|---|---|---|
| Q13 | *Resolved - see the Resolved table.* | **resolved** | W1 |
| Q14 | **Is run state a fold of an event log, and whose log?** *Leaning: yes* (concept section 5). The open half is **whose**: our own flow-level log, the scheduler's task events, or ours wrapping theirs. Only a flow-level log carries "branch taken" and "join satisfied", which the scheduler cannot see. **Against:** a second log is a second thing to keep ordered and bounded, and Q19 lands on it | open | P1 |
| Q15 | **Is a run resumable across a process restart, and is that in the first set?** Non-goal for now (concept section 7). The question stays live because the *cost of the door closing* is what Q14 is buying, and if Q2 lands on closures the door is already shut. `../fyflow-scheduler/PERSISTENCE_ANALYSIS.md` rates scheduler-side persistence *medium to high*; ours is cheaper only if the fold holds | deferred - first set is in-memory | no owner |
| Q16 | **Flow-level retry and task-level `retryPolicy` - who owns what, and do they compose?** The scheduler retries an *attempt* of a task. Retrying a *node* - possibly routing elsewhere on the second try - is a different thing, and if both exist the effective retry count is a product nobody intended. Also decides whether an attempt is in the task id (Q13) | open | P1 |
| Q17 | **How does `user_action` surface at flow level?** **The mechanism is now decided; the outcome is not.** [ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) rules 3-6: the path **suspends**, the library makes it visible and does not resolve it, and a consuming application appends a **resolution record** stating the state the node is to be treated as having - so the run resumes without run state ever being mutated. Still open: what the **run-level** outcome of a run with a suspended path is called (Q25), and what a join waiting on one does (Q5, W4). `fyflow-react-components` raised the identical question as **their Q16** and it is still open there - **this answer is now theirs to reconcile with**, and answering it differently in two repos is a bug with two homes | open - **mechanism decided, outcome open** | W4 |
| Q25 | **Does the flow-level outcome vocabulary belong in the definition or in run state?** `end.outcome` is an author-defined string the driver does not interpret (`spec/flow-definition.md` section 2), so today a flow can *say* `"branch-abandoned"` and nothing consumes it. The run-level outcome - which is more than `done`/`failed` because of Q17, and more again if Q7 lands on a timeout - is a closed vocabulary someone owns. If it is the definition's, an author can invent outcomes a UI cannot render; if it is run state's, `end.outcome` is a label rather than a value | open | W2 |
| Q26 | **Does the driver log non-settlement events at all, and in what shape?** `OR-R4` says `task.running` and `task.progress` produce no outcome and no resolution record, and defers the rest. [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 5 nonetheless requires `task.progress` to get the same listener-boundary treatment, so if it is ever logged the copy rules already apply. **Against logging them:** the log is what run state folds from, and progress is not a state transition - it would grow the log by an unbounded factor for a value only a UI wants (Q19, Q21) | open | W3 |
| Q28 | **What may a resolution do?** `RS-R2` allows exactly one thing: supply an outcome for a dispatch that already happened. The two obvious wants are refused - *"run that node again"* is flow-level retry (Q16) and would have to mint a new task id, and *"send it to node X instead"* is a second routing mechanism competing with the definition, which is the thing [ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 3 exists to prevent. Both are real requests a consuming application will make | open | no owner |
| Q29 | **Is a resolution's `actor` interpreted, and who is allowed to resolve?** Today it is an opaque string the library never reads and never authenticates - which is honest for a library and useless for an audit trail. Authorization belongs to the consuming application; **attribution** arguably belongs in the log, since the log is the only record of why a run resumed. **Against doing more:** any answer richer than a string starts specifying an identity model this library has no business owning | open | no owner |
| Q30 | **May an edge opt in to `user_action`, bypassing suspension?** `FD-V18` refuses it. *"If this node needs a human, route it to the manual-review sub-flow"* is a reasonable thing to want and would be one value in an array. **Against:** it gives one concept two mechanisms - a node in `user_action` would be sometimes parked and sometimes routed, and no reader of the definition could tell which without evaluating the edges | open - refused in P1 | no owner |
| Q18 | **What does cancelling a run actually do?** The scheduler **cannot cancel a queued task** (`AGENTS.md` section 1, not implemented), so cancellation can stop *routing* but not stop already-dispatched work from running. That makes "cancelled" a claim we cannot fully honour, and pretending otherwise is worse than saying so. Recorded upstream as [S2](scheduler-upstream.md) | open | no owner |

### Scale and interop

| Q | Question | Status | Owner |
|---|---|---|---|
| Q33 | **Must ladder L6 - a real scheduler with real workers - run in all three runtimes, and does P1's W5 do it?** `RT-R1` puts L0-L5 in all three because they are pure logic over fixtures and cost three cheap passes. L6 is different: it needs a real worker file per runtime (`.ts` for Deno, `.js` for Node and the browser, `AGENTS.md` section 3) and a browser harness, which is where the sibling spends Playwright. **Leaning: L6 runs in all three before release, and P1's W5 runs it in Node only** - P1 exists to answer Q4, not to prove portability, and its plan gate is budgeted at 90 s (`doc/workflow.md` section 8). **Against:** a portability defect found after W5 is found with the whole layer built on top of it | open | P1, at W5 |
| Q34 | **How is a `runId` generated portably?** `RT-R6` refuses `crypto.randomUUID()` as a required path because it is **secure-context-only in browsers** - a driver depending on it works on `localhost` and fails on a plain-HTTP page, which is a failure of the environment rather than of the logic and so survives every fixture test. `crypto.getRandomValues` has no such restriction. Open: whether the driver generates one at all or always takes one from the caller, which is also how [Q20](#live) - is a run id global - gets its answer | open | W3 |
| Q35 | **Is the *published* Node floor 24, or is 24 only the development pin?** `fyflow-scheduler` publishes `engines.node: ">=22"`. We develop on **>= 24** via fnm and `.node-version`, which is a statement about the machine that runs the gate. Publishing `>=24` locks out a consumer who can run the scheduler but not the layer above it, **for no reason this repo can currently name** - no API we have committed to needs 24 over 22. **Leaning: publish `>=22` to match the sibling and keep the dev pin at 24**, and revisit the moment something actually requires it | open | W3, when `package.json` is written |
| Q19 | **Is per-run retained state bounded?** `FLOW_PLANNING.md` targets 1000s-10000s of concurrent workloads. If Q8 or Q11 retains every node output, a run's footprint is proportional to its node count and the total is that times the run count. The scheduler already has this problem and answers it with `maxCompletedTasks` and eviction; we would inherit the answer *and* its sharp edge (eviction is silent). Cross-references `fyflow-react-components` **Q14**, which is the same question one layer up | open | no owner - needs a measured run |
| Q20 | **Does one orchestrator ever drive more than one scheduler, and is a run id global?** Expected topology is one-to-one. This row exists so the assumption is written down rather than assumed, which is the same reason `fyflow-react-components` carries its **Q15** | open | no owner |
| Q21 | **Do we emit an event family for `fyflow-react-components`?** Flow structure is invisible to the scheduler, so today no UI can show which node a run is at, which branch it took, or what a join is waiting on. That repo has already decided the envelope shape - per-source families ([ADR 0002](https://github.com/fyflow/fyflow-react-components) there), sequence numbers, collector-stamped time, payloads redacted by default - so this is *"do we become a second source family"*, not *"design a wire format"*. **The redaction default is inherited, not optional**, if we do | open | no owner - not before P1 |

## Resolved

| Q | Question | Resolution |
|---|---|---|
| Q10 | What happens when no decision edge matches? | **A mandatory default edge, refused at instantiation; and a named run failure if routing ever reaches a node with no matching edge** - `spec/flow-definition.md` section 3, `FD-V7` and `FD-R1`. Two rules at two times: `FD-V7` is the mechanism, `FD-R1` is the assertion that it held. **The third candidate - "the node is terminal for that branch" - was rejected on P1's validity rather than on taste**: a flow that silently stops halfway inside a fan-out produces a join that never fires with nothing queued and nothing running, which is character-for-character the signature [P1](plans/p1-what-satisfies-a-join.md) exists to attribute to a join policy. No ADR: a spec rule with its rationale stated in place, per `doc/decisions/README.md` |
| Q13 | What is the scheduler task id scheme, and what stops a collision corrupting a run? | **`<runId>:<nodeId>:<branchPath>:<attempt>`, four segments always, with the driver refusing a duplicate before `addTask` sees it** - `spec/task-id.md`, `ID-R1`. Reading 0.3.0's source made the case stronger than `AGENTS.md`'s one line: `addTask` sets the map entry *and* pushes to the ready queue (`core/FyflowScheduler.ts:444-445`), so **both tasks run**, and the success path settles each object on its own outcome (`:723-727`) - so a collision writes **two outcome records under one key**, one of them carrying the other execution's `executionTime`, plus a `task.running` for a task that never started. **W1's first version claimed the opposite** (one record, second execution vanished); the spec-conformity pass caught it. `branchPath` being a property of the node rests on `FD-V19`, which refuses convergent branches ([Q27](#live)) |
| Q1 | Where does routing execute? | **The driver, outside the scheduler** - [ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md). The driver is the only thing that touches the scheduler; a worker computes and does not route; routing is a pure function of `(definition, run state, outcome)`. Decided by two library facts rather than by preference: spawn is lineage and cannot join, and a worker that routes owns part of the definition. **The cost is accepted, not dodged** - a serialization point on a hot path, and the driver holding the only copy of run truth until Q15 |
| Q2 | Is a flow definition data, code, or data with registered predicates? | **Data, with predicates registered by name** - [ADR 0002](decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md). The graph is JSON-serializable with no functions in it; an edge names a predicate; an unknown name fails **at instantiation**, mirroring `addTask` throwing on an unknown `workerType`. Keeps Q15 and Q21 open, which is most of what it was protecting. Rule 5 carries the honest half-truth: the *definition* is portable, the *deployment* is not |
| Q31 | Can the driver retain a scheduler event's `detail`? | **No, and one event lies about its own name** - [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md). Verified in the source: `detail` **is** the live `FyflowTask`. *(This row was written at 0.2.1 and cited `core/FyflowScheduler.ts:727, 775, 777, 974`; at **0.3.0** those are `:857, 907, 909, 1427` plus a second failure path at `:1139, 1141`, and **`scheduler.completed` now emits a copy** - `{...this.stats, timestamp}` at `:401` - so the half of this row about `stats` being mutated in place is no longer true. ADR 0007's version table carries both readings; trust it over this cell.)* Separately, a non-optional task out of retries sets `state = 'user_action'` and then dispatches **both** `task.failed` and `task.user_action` for the same object, so a driver reading event names double-counts and routes a human-intervention case down an error edge. The driver copies declared fields at the listener boundary and keys the outcome record on terminal state. Upstream declined to fix the first half in code ([S8](scheduler-upstream.md)), which is what made it ours |
| Q3 | Which `fyflow-scheduler` version do we pin? | **0.3.0** (landed 2026-08-30, not yet on npm). Was 0.2.1; bumped the day the resource-events work landed, which is the coordinated-rather-than-discovered bump the original answer predicted. `fyflow-react-components` pins 0.2.1 and will need the same move. No ADR - this is a note, not an architecture. **There is no changelog**, so a version bump here means re-reading `AGENTS.md` §6 rather than a diff |
| Q32 | How does P1 tell a stuck join apart from a silently dropped task? | **The question dissolved - 0.3.0 fixed the drop** ([S7](scheduler-upstream.md)). `_failOrphanedTask` now fails an orphaned waiter terminally with `task.failed`, `task.user_action`, a rejected promise and a `stats.failed` increment, and sweeps it out of every blocked queue with an `orphaned` exit each. A dropped task no longer produces silence, so a P1 hang can no longer be a lost task masquerading as a stuck join. W5's every-node-settles assertion stays as **cheap insurance** rather than a validity gate - it now checks a property the library asserts rather than one it violated |

## Notes

**2026-08-30, later still again (3) - the three-runtime requirement was surfaced by the maintainer,
not by the documents.** `spec/runtime-targets.md` records it: Deno via JSR, Node and the browser via
npm, one source tree, mirroring `fyflow-scheduler` exactly - **because a consumer who can run the
scheduler in the browser and not the layer above it has been handed a library that does not compose
with the one it wraps.** Three things fell out of writing it down:

- **The ladder gained a second axis.** A rung is not green until it is green where it is required to
  run, and `doc/workflow.md` section 4 now says which rungs those are. **A rung reported green
  without naming its runtimes ran in one.**
- **`OR-R2` was portable by luck until it was checked.** `structuredClone` is global in all three,
  which is the single load-bearing entry in `RT-R3`'s API table - had it not been, the outcome
  record's copy rule would have needed a per-runtime implementation.
- **The obvious way to make a run id is refused.** `crypto.randomUUID()` is secure-context-only in
  browsers, so it works on `localhost` and fails on a plain-HTTP page - an environmental failure that
  no fixture test can reach (Q34).

**2026-08-30, later still again (2) - W1's spec-conformity pass found four blocking ambiguities and
one of them became [ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md).**
The pass was run by a reader that had not written the spec, spec first and W1's own declaration
last. What it found is the argument for the pass existing:

- **The largest finding was a question nobody had asked.** `spec/` said in one document that every
  settlement routes and in another that a failure does not, and **both readings conformed**. Not an
  error in either document - a hole in the joint between them, which is exactly what
  `doc/workflow.md` section 7 rule 1 says the spec exists to close. It is now ADR 0004: routing is
  opt-in per terminal state, and `user_action` **suspends** rather than routes.
- **Q5's four cases were three, and two of them were one.** Reading the source rather than the
  register: `state = 'failed'` is assigned only inside `if (task.optional)`, so an optional branch
  resolving `null` and a branch failing are the same event, and a non-optional failure is
  `user_action`.
- **The most uncomfortable finding was symmetric to a guard W1 wrote itself.** `JP-R7` forbids
  repairing `arrival-count` with one line because it would answer Q4 by accident - and W1's own
  `live-token` carried exactly such a refinement, unremarked. Both are now pinned to Q4's wording
  and both refinements are Q24. **A rule that catches everyone except its author is worth noticing.**
- **One factual claim was wrong**, and it had already propagated into Q13's resolution above. See
  the Q13 row: the corruption is real, the observable is not what W1 wrote down.

**2026-08-30, later still again - W1 wrote `spec/` and the two questions it was sent to answer both
came back with the argument drawn from P1's own validity rather than from taste.** Q10's losing
candidate - *"the node is terminal for that branch"* - fails because a flow that stops halfway
inside a fan-out is indistinguishable from a join that never fires, which is the observation P1 is
built to make. Q13's answer got sharper by being read in the source rather than in `AGENTS.md`: a
reused id does not lose a task, it runs two and attributes one's outcome to the other.

**The finding worth carrying forward is what W1 nearly wrote.** *"Every fan-out branch must reach
its join"* is the first well-formedness rule anyone writes for a fan-out region, it reads as
obviously correct, and **it makes P1's branch-routed-away flow invalid input** - the plan would have
discovered its own case was unauthorable somewhere around W4. It is recorded as `FD-V14`, a held id
with no rule behind it, because the useful artifact is the argument for its absence.
**Q24 is the same hazard one layer down**: decrementing the arrival counter on `branch.exited` is
one line, makes arrival-counting survive P1's case, and would have returned *"the two policies are
equivalent"* as a passing test.

**2026-08-30, later still - `fyflow-scheduler` 0.3.0 landed and the register was re-verified against
the code, not the plan.** That distinction paid twice. **Q32 dissolved**: the plan proposed making
the orphaned-task drop *observable* and deferred the fix, but `634e23a` fixed it properly - so the
confounder that threatened P1's validity is gone, and W5's assertion drops from a gate to cheap
insurance. **[S1](scheduler-upstream.md) did not** - the dead `parents` field survived the whole
pass - **and was then answered directly the same day**: it stays dead and will eventually be
removed. The upstream register now has nothing left to raise, which is a fine place for it to sit
while P1 runs.

**ADR 0007 needed no rule changed, which is the outcome to be slightly suspicious of.** Every line
reference moved and one new dispatch site appeared, but all four rules held. The one substantive
shift went *against* comfort: timestamps arrived as `task.timestamp`, **a mutable field on the live
task**, so rule 1 protects more than it did at 0.2.1 rather than less. A retained detail now
misreports its own timestamp.

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
**Confirmed vestigial by the maintainer on 2026-08-30** - it stays dead and will eventually be
removed - so the finding is now a statement rather than an inference. [S1](scheduler-upstream.md).

**Three questions are shared with `fyflow-react-components` rather than merely similar** - Q17 with
their Q16 (`user_action` is missing from every design), Q19 with their Q14 (unbounded retention),
Q20 with their Q15 (one collector, one scheduler). Answers should be coordinated; two repos
answering `user_action` differently is a bug with two homes.
