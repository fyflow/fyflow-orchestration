# Glossary

**Where a term is defined — never a definition.** Each row names one sense of one term, says it in
one line, and links the heading where that sense is decided: a `spec/` section, an ADR, or
`doc/workflow.md`. **Where a row and its target disagree, the target is right and the row is the
defect** — [ADR 0080](decisions/0080-the-glossary-points-and-never-defines.md). A REFERENCE, not
required reading: look a term up the way you read `spec/`.

## Format

The tables below are parsed (W119's `term`), so this section is the contract:

1. **Two tables, one per sense domain**, each directly under its own heading: `## PRODUCT` (what
   the library is and does) and `## PROCESS` (how work on it is done). No other table follows
   either heading.
2. **The header row is exactly** `| term | sense, in one line | defined at |`, followed by
   `|---|---|---|`.
3. **One row per term-sense.** A term with three senses has three rows, in whichever tables they
   belong to; the `term` cell is the same in each. The `term` cell is plain text — no markup, no
   link.
4. **The `sense` cell is one line and carries no link.** It is shorter than its target and claims
   nothing its target does not say. *A sense that needs a second sentence has found a term the target
   does not define, and that is a question, not a longer row.*
5. **The `defined at` cell is exactly one relative link with an anchor**, and nothing else: to a
   heading in `spec/`, an ADR or `doc/workflow.md`. Where the defining sentence sits in a list item,
   a table or a block quote, which carry no anchor, the link names **the nearest heading enclosing
   that sentence** — the same rule for every row. `check:markdown`'s `M1` and `M2` resolve the path
   and the anchor.
6. **A term whose only definition is in a work item, a plan, `CLAUDE.md` or `doc/concept.md` is not
   a row.** It is a question, listed under *Not rows* below.

## PRODUCT

| term | sense, in one line | defined at |
|---|---|---|
| awaiting_action | the run outcome while a node is suspended and nothing has resolved it; it outranks `running` | [spec/run-state.md section 3](../spec/run-state.md#3-the-run-level-outcome-vocabulary) |
| branch path | the third task-id segment: `-` for a node with no unique enclosing region, otherwise the branch indices of its enclosing regions, outermost first | [spec/task-id.md section 1](../spec/task-id.md#1-the-scheme) |
| checkpoint | a run's input sequence so far, handed out as plain data with a header carrying what the sequence cannot regenerate; not a `RunState` | [spec/run-state.md section 8](../spec/run-state.md#8-what-a-checkpoint-carries--v09-p23) |
| decision | a property of an edge, its `when` — there is no `decision` node kind; a decision with memory is the `gate` node | [spec/flow-definition.md section 2](../spec/flow-definition.md#2-node-kinds) |
| driver | the only component that touches the scheduler and the only one with side effects; routing, a pure function, is evaluated in it | [ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md#decision) |
| effective outcome | a `task` node's settlement record, with `terminalState`, `result` and `error` replaced by a later resolution record's for the same `taskId`; what routing reads | [spec/outcome-record.md section 7](../spec/outcome-record.md#7-the-effective-outcome) |
| fanout | the node kind that opens a region with N branches declared in the document; it dispatches nothing itself | [spec/flow-definition.md section 2](../spec/flow-definition.md#2-node-kinds) |
| fold input | one element of the driver's one ordered sequence, appended in the order it happened — a log record or a routing fact no record carries; folding them is the whole of turning a run into run state | [ADR 0014](decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md#decision) |
| gate | the node kind that is a decision with memory: it routes by a registered gate type's decision, hands on exactly what reached it, and is dispatched to no scheduler | [spec/flow-definition.md, `gate`](../spec/flow-definition.md#gate--a-decision-with-memory--v023) |
| join | the node kind that closes the region opened by the `fanout` or `map` its `of` names; it dispatches nothing itself | [spec/flow-definition.md section 2](../spec/flow-definition.md#2-node-kinds) |
| join policy | a pure state machine over one fan-out region, whose status is `waiting`, `satisfied` or `unsatisfiable` | [spec/join-policy.md section 1](../spec/join-policy.md#1-the-interface) |
| live branch | a branch its region has opened that has had no terminal event — not `branch.arrived`, `branch.exited` or `branch.lost` | [spec/join-policy.md section 2](../spec/join-policy.md#2-the-region-event-vocabulary) |
| map | the node kind that opens a region whose arity is not in the document: one `branch`, entered for the items the driver resolves through its `over` key | [spec/flow-definition.md, `map`](../spec/flow-definition.md#map--a-region-whose-arity-is-not-in-the-document--v08) |
| outcome record | the log record of kind `outcome` the driver's listener writes when a scheduler task settles; it carries the `taskId` and nothing derived from it | [spec/outcome-record.md section 1](../spec/outcome-record.md#1-the-log) |
| quiescent point | the end of the driver's synchronous turn, when every element the current event produced has been appended; the outcome precedence is defined there | [spec/run-state.md section 3](../spec/run-state.md#3-the-run-level-outcome-vocabulary) |
| region | for an opener F: the union, over F's branch entries, of each entry and everything reachable from it cut at F's join, which is not a member | [spec/flow-definition.md, the four sets](../spec/flow-definition.md#the-four-sets-stated-so-a-validator-can-compute-them) |
| region instance | a region named by its opener's node id and that opener's own branch path — the pair every region event carries | [spec/join-policy.md section 2](../spec/join-policy.md#2-the-region-event-vocabulary) |
| resolution record | the log record of kind `resolution` written when an external actor resolves a node that settled `user_action` and suspended | [spec/outcome-record.md section 5](../spec/outcome-record.md#5-the-resolution-record) |
| resume | a replay of the stored stimuli through the routing that produced them, every dispatch held, refusing what it cannot regenerate and handing in-flight tasks to a scheduler again | [spec/run-state.md section 9](../spec/run-state.md#9-what-a-resume-does--v010-p23) |
| run | one workload's journey, named by the `runId` the driver allocates at run creation — a task id's first segment | [spec/task-id.md section 1](../spec/task-id.md#1-the-scheme) |
| run state | what a pure fold of the driver's own log produces — not of the scheduler's events — and nothing else produces it | [spec/run-state.md section 1](../spec/run-state.md#1-q14-answered-run-state-is-a-fold-of-our-log-and-of-nothing-else) |
| stuck | the run outcome for nothing live and nothing ever will be: nothing running or suspended, and an entered region's `joined` is not `true`; it outranks `failed` and `completed` | [spec/run-state.md section 3](../spec/run-state.md#3-the-run-level-outcome-vocabulary) |
| suspended | the per-node state of a task that settled `user_action`; not terminal at flow level, because a resolution resumes it | [spec/run-state.md section 4](../spec/run-state.md#4-per-node-state) |
| task id | `runId:nodeId:branchPath:attempt` — always four segments, and the parse is total | [spec/task-id.md section 1](../spec/task-id.md#1-the-scheme) |
| unsatisfiable | the third `status` a join policy can report, there so that a stuck join is reportable rather than observable only as a hang | [spec/join-policy.md section 4](../spec/join-policy.md#4-unsatisfiable-and-what-it-is-not) |

## PROCESS

| term | sense, in one line | defined at |
|---|---|---|
| adequacy reader | the reader that reads the spec first and the tests second, and asks whether they would have noticed if the code did not do it — by mutation, in an isolated copy | [doc/workflow.md section 6](workflow.md#6-verify-the-three-passes) |
| always-read set | a declared list of documents with a byte ceiling that only moves down, held by `check:budget` | [ADR 0076](decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md#decision) |
| confirming gate | an item's confirming run: `npm run gate:item` (`gate:full` less the register self-test), not `npm run gate`, paid once on the final tree; the plan's last item runs `npm run gate:full` | [doc/workflow.md section 4](workflow.md#4-the-verification-ladder) |
| conformity reader | the reader that reads the spec first and the code second, and asks whether it does what the spec says; it reports and does not fix | [doc/workflow.md section 6](workflow.md#6-verify-the-three-passes) |
| exceptions table | what a serial item declares before it starts: every file it edits outside its `Owns` and the record step, with the reason | [doc/workflow.md section 7](workflow.md#7-parallel-work) |
| exit artifact | what a plan ends in, something a human can look at: a run that routed correctly, a measured number, a rendered trace | [doc/workflow.md section 2](workflow.md#2-the-unit-of-work) |
| gate | the commands: `npm run gate` is the ladder, `npm run gate:full` is `npm run gate` followed by the self-tests, and `npm run gate:item` leaves out the register self-test | [ADR 0070](decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md#decision) |
| gate | a work item's verification gate: stated before the item starts, and an item that cannot state one is not ready to start | [doc/workflow.md section 1](workflow.md#1-the-loop) |
| ladder | the verification levels L0-L7, climbed from L0 and stopped at the first failure | [doc/workflow.md section 4](workflow.md#4-the-verification-ladder) |
| overlap | the findings an item's two readers share — a shared subject, on which the two findings need not be the same finding | [doc/workflow.md section 6](workflow.md#6-verify-the-three-passes) |
| Owns | the set of files a work item owns; the item is declared in its plan before anyone starts | [doc/workflow.md section 2](workflow.md#2-the-unit-of-work) |
| plan | a vertical slice: one question, stated in a sentence, ending in an exit artifact | [doc/workflow.md section 2](workflow.md#2-the-unit-of-work) |
| probe | one provocation, required to be checked in; it asserts that it changed its input and declares the exact set of checks it must trip | [doc/workflow.md section 5](workflow.md#5-tests-are-a-deliverable-and-tests-can-be-wrong) |
| provocation | breaking the thing a check checks to watch the check fail, then putting it back — and committing the breaking | [doc/workflow.md section 5](workflow.md#5-tests-are-a-deliverable-and-tests-can-be-wrong) |
| record step | finishing an item: fill in its Record, mark it done, then the four files section 1 rule 5 names | [doc/workflow.md section 1](workflow.md#1-the-loop) |
| refusal ledger | one line per refused proposal, with the ordinal the document states where it has one; a retro appends to a row rather than restating it | [doc/workflow.md, the refusal ledger](workflow.md#the-refusal-ledger) |
| Reserves | the line in a work item's declaration that reserves its question and ADR ids before work starts | [doc/workflow.md section 3](workflow.md#3-ids-and-files) |
| retro | pass 3: once a plan's work items are merged, a review of the method, not the product | [doc/workflow.md section 6](workflow.md#6-verify-the-three-passes) |
| rung | one level of the ladder; reported green only when its command exited 0 | [doc/workflow.md section 4](workflow.md#4-the-verification-ladder) |
| self-test | what proves the checks can fail: `npm run selftests`, which `npm run gate:full` runs and `npm run gate` does not | [ADR 0070](decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md#decision) |
| vacuity floor | a minimum below which a check is vacuous; it counts a quantity that the churn it guards against cannot move | [ADR 0076](decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md#decision) |
| window | the interval a vacuity floor must sit in for its probes; its edges are what the tree and the probes measure, and it can be empty | [ADR 0078](decisions/0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md#context) |
| work item | the smallest thing with its own gate: it owns files, states what proves it correct, and is declared in its plan before anyone starts | [doc/workflow.md section 2](workflow.md#2-the-unit-of-work) |

## Not rows

Terms in use whose only definition is outside the three homes, or nowhere. Each is a question until
a heading defines it:

- *gate* is three senses, each a row above; whether one is renamed is [Q508](questions/q508.md).
- *declared ceiling* — [Q509](questions/q509.md).
- *survivor* — [Q510](questions/q510.md).
- *META entry* — [Q511](questions/q511.md).
