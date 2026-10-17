---
id: ADR 0108
title: "An ask is a seventh node kind, with a task id and no dispatch"
status: accepted
date: "2026-10-17"
item: W179
raised-by: P35
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0108 — An ask is a seventh node kind, with a task id and no dispatch

**Status:** accepted — [P35](../plans/p35-may-a-node-wait-for-a-person-by-design.md) stop-and-asks (a) and (h), answered
*"as recommended"* by the maintainer 2026-10-17, with decisions 6, 7 and 8; written by
[W179](../work-items/w179-the-ask-node-in-the-definition.md). It defines `spec/flow-definition.md` v0.42 (section 2's
seventh kind, `FD-V47`, `FD-V48` and the widened rules) and `spec/task-id.md` v0.13. **It decides the DEFINITION**; what a
run does when a branch reaches an ask is ADR 0109's (W180).

## Context

A flow could wait for a person only by a task that FAILED on purpose: fyflow-app's `Ask` worker throws its question,
the task parks `user_action`, the app stores the input itself, and the question is told apart from a real failure by
the node's type alone (P35 fact 8). The app asks for a node that waits by design (#2), keeps what reached it (#3) and
holds the answer to a schema (#4). Four facts bind the shape. **Only a `task` had a task id** (P35 fact 1), and a
person's answer needs an address — `resolve(taskId, …)` — that a later node can reference. **A `gate` has no task id
and no output** (`FD-V27`), so an answer given at one could be neither addressed nor referenced. **A `transform` runs
only in a node type's worker wrapper** (`FD-C6`, ADR 0101), and what reaches a node is composed in the driver
(`compose`, P35 fact 6). **A worker's schemas are held to the subset at load** by `schemaProblem` (fact 7), so a schema
on a node can be held by the same code.

## Decision

1. **`ask` is a seventh node KIND**: `{ id, kind: 'ask', edges, settings?, answerSchema?, needs? }`. `FlowNode` gains
   `AskNode` — **BREAKING** for a consumer's exhaustive `switch` over `node.kind` (P35 decision 8).
2. **It is never dispatched and it HAS A TASK ID**, by `spec/task-id.md`'s scheme unchanged — `<run>:<node>:<path>:0`,
   one per map item — because an answer needs an address and an output needs a `(node, branchPath)` name (`FD-C2`).
3. **Its answer is its OUTPUT**: `FD-V27` admits a reference to an ask as to a task (*only a task and an ask produce an
   output*), and `FD-V28`/`FD-V29` ask of it what they ask of a task.
4. **It routes as a task's SETTLEMENT does** ((h)): `on` drawn from `done` and `failed` — `failed` the person declining
   — and a `when` in section 3's grammar over `outcome.result`, the answer; its edges are held to `FD-V7`'s clauses. No
   new route grammar and no `route` key.
5. **It stands wherever a task may**: the entry, a fan-out's branch entry (`FD-V9`), a map's branch (`FD-V25`), inside a
   region before its join. **Every rule whose text enumerates kinds is widened BY NAME** (decision 7): `FD-V7`, `FD-V9`,
   `FD-V17`, `FD-V21`, `FD-V23`, `FD-V24`, `FD-V25`, `FD-V26`'s note, `FD-V27`, `FD-V29`.
6. **`settings` is OPAQUE** — a plain object the library never reads (a non-object is `FD-V21`); **`answerSchema` is
   held to the schema subset at load** by `schemaProblem` (`FD-V48`); **`needs` composes what reaches it** as a task's.
7. **The six keys only a task declares are REFUSED on an ask by ONE rule, `FD-V47`** — `type`, `pool`, `optional`,
   `retryPolicy`, `workerGroups` and `transform` (decision 6) — one finding per key, `FD-V17` silent for them
   (`FD-V41`'s precedent: one rule owns a key wherever it is refused).
8. **Until W180 runs one, a `Driver` refuses a run where a branch ENTERS an ask** — `enter()`'s `ask` arm throws
   `InvalidDefinition` naming the node, reported and rethrown from `start()`, reported and halting from a scheduler
   event's step (`OR-R10`). The plan's W179 row places it at `enter`.
9. **The wiring check reads an ask as a PRODUCER, never a consumer**: an arc it sends carries its `answerSchema`
   (`unchecked`, naming the ask, without one); an arc into it gets no verdict; it is no `FD-R4` start target.

## Consequences

- **A question is no longer an error.** A reader tells an ask from a parked failure by the node's KIND, in the
  definition — never by an error string (the app's stated cost).
- **`answerSchema` is checked twice and only once at run time**: shape at load (this ADR), value at `resolve()`
  (ADR 0109, `FD-R4`'s resolve boundary).
- **The interim refusal costs a worker run.** Refused at `enter`, an ask AFTER a task halts the run only when that task
  settles — W92 measured the same of a gate and refused at construction instead. Accepted because it is one item wide:
  W180 replaces the arm with the one that parks (W179's reading R6). **And in a region it costs a sibling**: a fan-out
  whose branch ENTERED BEFORE the ask is a task hands that task to the scheduler before the refusal, and nothing cancels
  it — the run is `halted` with it sent (W179's conformity reader, G4; asserted at L2).
- **The corpus's ask flow holds asks and ends only until W180**: `test/driver/needs.test.ts` runs every region-bearing
  corpus flow and the driver refuses an ask, and `spec/outcome-record.md` section 4 states a census of the corpus's TASK
  nodes that W180's row owns; the task-bearing and region shapes are L1 fixtures (W179's reading R8).
- **A future reader will try** to let an ask carry `optional` (*"the flow handles a decline"*) — refused: a decline is
  `on: ['failed']`, chosen per edge; or a `transform` (*"reshape before the person sees it"*) — refused: use `needs`, or a
  task before the ask.

## Alternatives rejected

| | why not |
|---|---|
| A built-in node TYPE `Ask` on a `task` (the app's shape) | a `task` never dispatched breaks section 2's *only a task is dispatched* in every reader that trusts it, and every task key needs a type-specific refusal |
| An `ask: { … }` option on any task (park before the worker, run it on the answer) | a dispatch after a resolution — `RS-R2`'s *never re-dispatches* reversed |
| A gate type | a gate has no task id and no output (`FD-V27`): its answer could be neither addressed nor referenced |
| Gate-style named routes on an ask (`{ route: 'approve' }`) | a second route grammar on a non-gate node, and the answer schema and route set must then agree ((h)) |
| The six task keys left to `FD-V17` (*undeclared*) | correct and unhelpful: an author who turned a task into an ask is told the key is unknown rather than why an ask cannot use it; and `FD-V26`'s *one rule FD-V17 could never disagree with* warning is met by making `FD-V17` silent for them, not by a second rule beside it |
| `transform` under its own id | the fix is the same as for the other five — delete the key — and `FD-V28`'s precedent gives a new id to a different FIX |
