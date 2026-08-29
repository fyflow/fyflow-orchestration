# CLAUDE.md — fyflow-orchestration

Guidance for Claude Code working in this repository.

## What this project is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**:
flows with sequence, **decision** routing, **fan-out** and **join**, instantiated per workload at
1000s-10000s scale.

Full context: [doc/concept.md](doc/concept.md). Do not re-derive it — read it.

## Current state: **the gating questions are cleared, P1 is planned, no code exists**

[ADR 0001, 0002 and 0007](doc/decisions/) settle the architecture so far: **routing executes in the
driver, outside the scheduler** — a worker computes and does not route, and `context.spawnTask()` is
not used for flow control; **a flow definition is data with predicates registered by name**, where
an unknown name fails at instantiation rather than at routing time; and **the driver normalizes
every scheduler event into an immutable outcome record at the listener boundary**, because event
details are live mutable objects and `task.failed` also fires for `user_action` tasks. Pinned to
`fyflow-scheduler` 0.2.1.

**[P1](doc/plans/p1-what-satisfies-a-join.md) is planned** with five work items. `spec/` is still
empty — **W1 is what fills it**, and it is serial: everything waits on it. What happens next, in
order: [doc/README.md](doc/README.md).

**Q4 — what satisfies a join — is deliberately undecided**, and this is the thing most likely to be
got wrong by a well-meaning reader. The argument for live-token accounting is strong and was
**refused as sufficient**. P1 builds **both** policies behind one interface and settles it with the
branch-routed-away case as an executable test. **Do not pick a winner before W4 has run** — and do
not treat arrival-counting as the straw man, because it winning is a real outcome that would make
the simpler mechanism correct. ADR **0003** is reserved for the result.

## The fact that reframes the whole repo

> **`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no ordering. Its own
> `AGENTS.md` section 1 lists them under *"Things that do NOT exist"*, along with `DagScheduler`.

Two consequences, and both catch people:

1. **`../fyflow-scheduler/FLOW_PLANNING.md` is written against an API that does not exist.** It
   calls the library "the existing FyFlow DAG scheduler" and passes `parents: ['extract']` to a
   constructor with no such field. Its *goals* are still ours; its premise is not. Do not use it as
   a design input without reading `doc/concept.md` section 2 first.
2. **`SpawnTaskConfig.parents` is declared and dead.** `../fyflow-scheduler/core/workerInterface.ts:50`
   declares it; nothing reads it; the spawn path (`core/FyflowScheduler.ts:1015-1020`) drops it
   silently. It typechecks and does nothing. This is [S1](doc/scheduler-upstream.md).

**So sequence, decision, fan-out and join are built here, not wrapped from below.**

## The invariant everything hangs off

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

Now backed by [ADR 0001](doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
rules 1 and 4, and [ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 4. A decision predicate that calls `addTask`, or a fold that reads `scheduler.tasks`, has
broken it.
This is what makes routing testable with no scheduler (ladder L2), makes determinism a real check
rather than an aspiration, and keeps durable runs additive. `doc/concept.md` section 5.

Task completion **order** is genuinely non-deterministic. The fold must be deterministic *given an
ordered log*; the driver is what turns unordered reality into that ordered log. Never write a test
that depends on fan-out completion order.

## How work is done

**[doc/workflow.md](doc/workflow.md) — read it before starting any work item.** The short form:

```
concept -> plan -> work items -> verify (ladder, spec conformity, retro) -> record
```

- A **plan** (`doc/plans/`) answers one question and ends in something a human can look at.
- A **work item** (`doc/work-items/`) is the smallest thing with its own gate. It is **declared
  before it starts** — owns-files, tests, gate, reserved ids — using the template.
- **Verification is a ladder.** Climb from L0, stop at the first failure, and report which levels
  did not run. `workflow.md` section 4. **L2 (routing from a fixture outcome log) is where this
  repo's value is proved**, and **L5 is the join/failure matrix** — the hard part.
- Ids (`P`, `W`, `Q`, `ADR`, `S`) are reserved in blocks before fan-out, and are **never reused or
  renumbered**.

## Working rules

**`spec/` is the source of truth.** A spec change is its own change with its rationale stated, never
a side effect. If a spec looks wrong or unimplementable, **stop and report the specific conflict**
rather than patching it to make a test pass.

**Tests are part of the work item, never follow-up.** Expected values come from the spec, not from
output. A snapshot generated by running the implementation is not a test. Assertions must be able to
fail. Full rules: `workflow.md` section 5.

**"Tests pass", reported by whoever wrote the code, is a claim rather than evidence.** The
spec-conformity pass (`workflow.md` section 6) converts it into a statement about the code — run it
with a fresh context, spec first and code second, and it reports rather than fixes.

**A decision not in `spec/`, an ADR, or a plan did not happen.**

**A leaning is not a decision.** `doc/concept.md` section 6 carries four; **two are now ADRs, one is
P1's spike, and the fourth (run state as a fold) is still only a leaning** — Q14, which W2 tests.
Citing a leaning as settled is the most likely way to get this wrong.

**A wish for `fyflow-scheduler` goes in [doc/scheduler-upstream.md](doc/scheduler-upstream.md), not
into a workaround comment.** Every item states what we do without it — an item with no workaround is
a blocker and belongs in a plan instead.

**Writing documents:** dense and decided. Tables and numbered rules over narrative. Distinguish
decided from open — open items get a Q id in `doc/open-questions.md`, not an inline TODO. Reference
paths from the repo root in prose; only markdown links are relative.

## Facts about fyflow-scheduler that catch people out

Grounded in its `AGENTS.md` at 0.2.1; re-check there rather than trusting this list if it matters.

- **No dependencies, no ordering** — see above. This is the big one.
- **An event's `detail` is the live object, not a snapshot.** `detail` **is** the `FyflowTask` for
  `task.running`/`completed`/`failed`/`user_action`, and `scheduler.completed`'s detail is `stats`,
  mutated in place. **Never retain `e.detail`** — copy declared fields synchronously in the
  listener. `{...e.detail}` is *not* compliance: it still aliases `payload`, `result` and `error`.
  [ADR 0007](doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md);
  upstream declined to fix it in code ([S8](doc/scheduler-upstream.md)).
- **A `user_action` task fires TWO events, and the first is called `task.failed`.** For a
  non-optional task out of retries the scheduler sets `state = 'user_action'` and then dispatches
  `task.failed` *and* `task.user_action` with the same object
  (`core/FyflowScheduler.ts:764-778`). Key outcomes on **terminal state, not event name**, or you
  double-count and route a human-intervention case down an error edge. An *optional* task takes the
  other branch: `state = 'failed'`, `resolve(null)`, and only `task.failed` fires.
- Task states are `pending -> running -> done | failed`, **plus `user_action`** for a non-optional
  task out of retries. Five states, not four, and it is the one every design drops (Q17).
- **Reusing a task id overwrites, silently.** Our id scheme is a correctness rule with a refusal
  test, not a convention (Q13).
- **A queued task cannot be cancelled.** Not implemented — so "cancel a run" is partial by
  construction (Q18, [S2](doc/scheduler-upstream.md)).
- `scheduler.completed` fires **every time the scheduler drains** — with a flow it will fire between
  steps routinely. It is not "the run finished".
- `onCompleteDescendants()` is **not a join**: transitive over lineage, but a failing descendant does
  not reject.
- `maxCompletedTasks` evicts terminal tasks from `scheduler.tasks` with no event to say so.
- Resource groups are **optimistic** — a limit can be briefly exceeded. Nothing is a hard cap.
- `addTask` returns `undefined` without `{ createPromise: true }`, and a scheduler that is never
  shut down keeps the process alive.

The library is local at `../fyflow-scheduler`; `AGENTS.md` there is the single-file API reference and
every snippet in it is executed by its test suite.

## Sibling repositories

`../fyflow-react-components` visualizes a scheduler. **Three of its open questions are the same as
three of ours** — `user_action` (their Q16 / our Q17), unbounded retention (their Q14 / our Q19),
one-collector-one-scheduler (their Q15 / our Q20) — and **two upstream wants are shared** (their
S1/S2 are our S5/S4). Answering a shared question differently in two repos is a bug with two homes.

**Cite another repo's ids with its name attached.** Two Q sequences, same questions.

## Environment

Windows 11. PowerShell 5.1 is the primary shell — `&&` and `||` are parser errors there, use `;` or
`if ($?)`. A Bash tool with POSIX syntax is also available and is usually the easier one.

**Do not rewrite files with `Get-Content | Set-Content`** — PS 5.1 reads UTF-8 without a BOM as
CP1252 and silently double-encodes every non-ASCII character. Use the Edit or Write tool.

## Git

Local identity is `tsukeero <tsukee.kage@gmail.com>`. There is no remote yet. **Commit only when
asked.** Commit subjects are scoped: `doc:`, `spec:`, `adr:`, `feat:`, `fix:`, `chore:`.
