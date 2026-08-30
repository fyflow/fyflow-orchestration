# CLAUDE.md — fyflow-orchestration

Guidance for Claude Code working in this repository.

## What this project is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**:
flows with sequence, **decision** routing, **fan-out** and **join**, instantiated per workload at
1000s-10000s scale.

Full context: [doc/concept.md](doc/concept.md). Do not re-derive it — read it.

## Current state: **P1 is complete and retro'd; [P2](doc/plans/p2-the-non-success-half-on-a-real-scheduler.md) is open with W6 declared**

[ADR 0001, 0002 and 0007](doc/decisions/) settle the architecture so far: **routing executes in the
driver, outside the scheduler** — a worker computes and does not route, and `context.spawnTask()` is
not used for flow control; **a flow definition is data with predicates registered by name**, where
an unknown name fails at instantiation rather than at routing time; and **the driver normalizes
every scheduler event into an immutable outcome record at the listener boundary**, because event
details are live mutable objects and `task.failed` also fires for `user_action` tasks. Pinned to
`fyflow-scheduler` **0.3.0** (landed 2026-08-30, and **on no registry** — see below).

**[P1](doc/plans/p1-what-satisfies-a-join.md)'s five work items are all built.** `spec/` holds **six
normative documents and 71 numbered rules**; `src/` holds the definition validator, the driver and
the fold with **both** join policies; `test/matrix/` holds the join/failure matrix; `examples/` holds
ladder **L6**. **288 assertions in five runtimes** — Node 24, Deno, chromium, firefox, webkit —
identical in all of them, **plus 118 at L6 in Node and Deno**. **P1's retro is run and `doc/workflow.md`
is v0.3** — four changes adopted, several findings deliberately left as findings.

**[P2](doc/plans/p2-the-non-success-half-on-a-real-scheduler.md) is the active plan, it adds no
features, and [W6](doc/work-items/w6-the-non-success-rows-at-l6.md) is built with both readers
outstanding.** Ladder L6 is **twelve rows, 186 assertions**, in Node and Deno, and **all six run
outcomes and all six region events now occur there** — `awaiting_action`, `stopped`,
`branch.suspended` and `branch.resumed` for the first time. **Nothing in `src/` broke**, which is the
weaker result P2 predicted when it measured `user_action` before the plan was written. What happens
next, in order: [doc/README.md](doc/README.md).

**Eleven reader-passes have run and not one came back empty** — W1 ×3, W3 ×3, W2 ×1, W4 ×2, W5 ×2,
with blocking findings of 4, 5, 1 · 1, 1, 4 · 4 · 2, 2 · 3, 10. Most found the same shape: *the code
was correct and the tests were pointed at the wrong half.* **Budget for the pass; it is not a
formality here, and section 6 now asks for two readers** — measured at 1 overlapping finding in 13
and 3 in ~35.

**W5 ran P1's case on a real scheduler and it behaves exactly as the matrix said.** `p1-routed-away`
completes under `live-token` and is **`stuck`** under `arrival-count`, with the join's successor
never dispatched. Three ADRs came out of it, and **each came from a different kind of gap**:

| | |
|---|---|
| [**0013**](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) | `fyflow-scheduler` is a **development** dependency and the published library depends on it **not at all** — `SchedulerLike` is structural and a caller passes its own scheduler in. **`S7` in `scripts/check-source.mjs` refuses any published file that imports it.** Node reaches 0.3.0 through `file:../fyflow-scheduler` → `dist/`; Deno through `examples/deno-import-map.json` → the source; the browser not at all |
| [**0014**](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) | **The driver produces the fold's ordered input sequence** — `Driver.foldInputs()`, and `onFoldInput` for the push half. `snapshot()` is now *defined* as its record-kind subsequence. Before this, `FoldInput.pathEnded` had **no producer anywhere** |
| [**0015**](doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) | **A run whose join can no longer fire is `stuck`** — the sixth run outcome. Run state used to call such a run `completed` |

**Three things this repository believed turned out to be wrong, and each was one command away.** npm and
JSR **both carry the scheduler**, at 0.2.1 — so it is only *0.3.0* that is unpublished, and
`@fyflow/scheduler` on JSR was an assumption nobody had checked. `../fyflow-scheduler/dist/`
**existed and was stale** — a pre-0.3.0 build behind a `package.json` reading `0.3.0`, which is a
directory layout that invites the assumption and asserts nothing (`npm run check:scheduler` now
guards it).
And `AGENTS.md` §3's *"a worker must be JavaScript"* is **false at Node 24**, which is why ladder L6
runs in Deno as well as Node ([Q33](doc/open-questions.md), `RT-R10`) — the leaning that said *Node
only* rested on that claim. Both scheduler findings are [S9](doc/scheduler-upstream.md), **the only
live item in an upstream register that had nothing left to raise.**

**And one of our own register entries was wrong, which is the newest failure mode here.**
[Q43](doc/open-questions.md) said *"`regions` already records `{0: arrived, 1: exited}`, so the
information is present"*. It does not: **both policies produce that identical value**, which is
exactly what `RN-R6` guarantees. Found by trying to act on it. `doc/open-questions.md` is read before
every work item and **checked by nothing**.

**W5's two review passes — run as two readers, per W4's proposal — found ~35 things between them,
and every one is acted on.** Three are worth carrying:

1. **The L6 gate did not depend on the mechanism W5 exists to build.** Replacing its termination
   predicate with `setTimeout(1)` left every assertion passing, because `scheduler.shutdown()` drains
   the run while the fold keeps advancing. **This is W4's shape one level deeper:** the author's
   sweep found a hole, and the author's fix for it still could not fail.
2. **A `Driver` serving two runs merged them and reported `completed` for a hung run**, through its
   own declared surface. `ID-R3` refuses it; the surface still says otherwise, which is
   [Q53](doc/open-questions.md).
3. **A mutation sweep run by its author measures what its author fears.** Mine: 19 mutations, 2
   survivors. The reader's, chosen by walking the rule ids rather than by intuition: **148 mutations
   and 38 survivors**, 10 of them blocking.

**Two readers, three overlaps, and each overlap arrived from a different direction.** W4 proposed
the split after 1 overlap in 13; this is the second occurrence in a different work item, which is
what `doc/workflow.md` section 6 rule 2 asks of a proposed rule. **For the retro.**

**Q4 is answered: [ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
— a join is satisfied when its region has no live branches, having had at least one.** `live-token`
is the policy an application passes; `arrival-count` stays shipped, because the matrix is only
meaningful while both columns can be run.

**The result is bigger than the question, and this is the part to carry forward.** P1 predicted that
arrival-counting breaks on one exotic case — a decision routing a branch away from its join. W4's
matrix says it hangs on **six of nine rows**, and only one of them is that case: an ordinary
`optional` task failing is enough. Fixed-`N` is wrong whenever *"how many will arrive"* differs from
*"how many opened"*, and **every non-success outcome makes it differ.**

**What is now live is [Q24](doc/open-questions.md)** — the two one-line refinements `JP-R7` and
`JP-R8` pin. They were traps during the spike and are the open question after it; neither belongs in
`src/fold/policies.ts` without its own decision. ADR 0003 names the motivating case: on the
all-branches-exited row, `live-token` fires a join **no branch reached**.

## The fact that reframes the whole repo

> **`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no ordering. Its own
> `AGENTS.md` section 1 lists them under *"Things that do NOT exist"*, along with `DagScheduler`.

Two consequences, and both catch people:

1. **`../fyflow-scheduler/FLOW_PLANNING.md` is written against an API that does not exist.** It
   calls the library "the existing FyFlow DAG scheduler" and passes `parents: ['extract']` to a
   constructor with no such field. Its *goals* are still ours; its premise is not. Do not use it as
   a design input without reading `doc/concept.md` section 2 first.
2. **`SpawnTaskConfig.parents` is declared and dead.** `../fyflow-scheduler/core/workerInterface.ts:50`
   declares it; nothing reads it; the spawn path (`core/FyflowScheduler.ts:1468-1473`) drops it
   silently. It typechecks and does nothing. **Confirmed by the maintainer (2026-08-30): it stays
   dead and will eventually be removed — never pass it.** [S1](doc/scheduler-upstream.md) is closed;
   do not re-raise it.

**So sequence, decision, fan-out and join are built here, not wrapped from below.**

## The invariant everything hangs off

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

Now backed by [ADR 0001](doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
rules 1 and 4, [ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 4, and **[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md),
which is what finally made it executable**: the driver produces the ordered `FoldInput` sequence and
`fold(driver.foldInputs())` is the whole of turning a run into run state. Until W5 **nothing produced
that sequence**, so the invariant was true of hand-written fixtures and of nothing else. A decision
predicate that calls `addTask`, a fold that reads `scheduler.tasks`, or **a fold that subscribes to
the driver** has broken it — the last is the ergonomic next step ADR 0014 spends a paragraph
forbidding.
This is what makes routing testable with no scheduler (ladder L2), makes determinism a real check
rather than an aspiration, and keeps durable runs additive. `doc/concept.md` section 5.

Task completion **order** is genuinely non-deterministic. The fold must be deterministic *given an
ordered log*; the driver is what turns unordered reality into that ordered log. Never write a test
that depends on fan-out completion order.

## How work is done

**[doc/workflow.md](doc/workflow.md) — read it before starting any work item. It is v0.3, and P1's
retro is the reason: it has now been run to completion once.** The short form:

```
concept -> plan -> work items -> verify (ladder, spec conformity, retro) -> record
```

- A **plan** (`doc/plans/`) answers one question and ends in something a human can look at.
- A **work item** (`doc/work-items/`) is the smallest thing with its own gate. It is **declared
  before it starts** — owns-files, tests, gate, reserved ids — using the template.
- **Verification is a ladder.** Climb from L0, stop at the first failure, and report which levels
  did not run. `workflow.md` section 4. **L2 (routing from a fixture outcome log) is where this
  repo's value is proved**, **L5 is the join/failure matrix** — the hard part — and **L6 is
  `examples/`**, the only rung that touches a real scheduler:

  ```bash
  npm run gate            # everything, both L6 runtimes included
  npm run test:l6         # ladder L6, node 24 - twelve real runs
  npm run test:l6:deno    # ladder L6, deno
  ```

  **L6 lives in `examples/**` and not in `test/**`, deliberately**: the browser bundle globs
  `test/**/*.test.ts`, so anything that imports a scheduler placed there would be bundled for a
  runtime L6 does not run in (`RT-R10`).
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

**A leaning is not a decision, and a leaning's *argument* is worth checking before its conclusion
is.** All four of `doc/concept.md` section 6's have now landed — two as ADRs, one as P1's spike, and
run-state-as-a-fold as Q14's answer. The live example is elsewhere: **[Q33](doc/open-questions.md)'s
leaning said *L6 in Node only*, on the stated ground that L6 *"needs a real worker file per
runtime"*, and that ground is false at Node 24.** W5 measured it in one command and the answer
flipped. Citing a leaning as settled is the most likely way to get this wrong; inheriting the
*reasoning* behind one without checking it is the second.

**A written claim nobody ran is this repository's most common defect, and `doc/open-questions.md` is
now one of its homes.** `spec/run-state.md` section 5 tabulates **four**: three were a spec asserting
what its own inputs could not supply, and the fourth is [Q43](doc/open-questions.md) — a register
entry, written by a reader, saying the data was already there when it was not. `spec/` has a
conformity pass; **the register has nothing.**

**A wish for `fyflow-scheduler` goes in [doc/scheduler-upstream.md](doc/scheduler-upstream.md), not
into a workaround comment.** Every item states what we do without it — an item with no workaround is
a blocker and belongs in a plan instead. **[S9](doc/scheduler-upstream.md) is the one live item**,
and it is ready to raise.

**`src/` and `index.ts` may never import `fyflow-scheduler`.** The published npm and JSR packages
depend on it **not at all** — `SchedulerLike` is a two-method structural interface and the caller
passes its own scheduler in. It is now a devDependency with the library on disk, so this is one
autocomplete away from being broken; `S7` in `scripts/check-source.mjs` is the refusal
([ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 1-2).

**Writing documents:** dense and decided. Tables and numbered rules over narrative. Distinguish
decided from open — open items get a Q id in `doc/open-questions.md`, not an inline TODO. Reference
paths from the repo root in prose; only markdown links are relative.

## Facts about fyflow-scheduler that catch people out

Grounded in its `AGENTS.md` at **0.3.0** (landed 2026-08-30. **npm `fyflow-scheduler` and JSR
`@fyflow/scheduler` both stop at 0.2.1**, so 0.3.0 is on no registry - measured by W5, and
there is **no changelog** - a bump means re-reading `AGENTS.md` §6, not reading a diff). Re-check
there rather than trusting this list if it matters.

- **No dependencies, no ordering** — see above. This is the big one.
- **Its published TypeScript source does not load under Node**, and its `AGENTS.md` §3 is wrong in
  the other direction about workers. `core/threadWrapper.ts:5` value-imports an `interface`, which
  Node's type stripping cannot erase — so `import('../fyflow-scheduler/index.ts')` throws under Node
  24 and works under Deno. Meanwhile a **typed `.ts` worker runs fine** under Node 24, `inline` and
  threaded, contrary to §3's *"the file must be JavaScript"*. Both are [S9](doc/scheduler-upstream.md),
  and together they are why Node reads `dist/` while Deno reads the source
  ([ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)).
- **`dist/` goes stale silently.** It is gitignored there and rebuilt by `npm run build`; `npm run
  check:scheduler` is what stops L6 running 0.2.x under Node and 0.3.0 under Deno and reporting both
  green.
- **An event's `detail` is the live object, not a snapshot.** `detail` **is** the `FyflowTask` for
  `task.running`/`completed`/`failed`/`user_action` — **including the `timestamp` field**, so a
  retained detail reports the *most recent* event's time, not the one you received. **Never retain
  `e.detail`** — copy declared fields synchronously in the listener. `{...e.detail}` is *not*
  compliance: it still aliases `payload`, `result` and `error`.
  [ADR 0007](doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md);
  upstream declined to fix it in code and documented it instead
  ([S8](doc/scheduler-upstream.md), `AGENTS.md` §6). *Not* affected: `task.progress`,
  `scheduler.completed` and `resource.*`, all copies.
- **A `user_action` task fires TWO events, and the first is called `task.failed`.** For a
  non-optional task out of retries the scheduler sets `state = 'user_action'` and then dispatches
  `task.failed` *and* `task.user_action` with the same object — at 0.3.0 in **two** places,
  `core/FyflowScheduler.ts:896-910` and `1128-1142` (the orphaned-task path). Key outcomes on
  **terminal state, not event name**, or you double-count and route a human-intervention case down
  an error edge. An *optional* task takes the other branch: `state = 'failed'`, `resolve(null)`, and
  only `task.failed` fires. **`AGENTS.md` still does not document this for the ordinary path** — it
  says *"`task.failed` fires once per failed task"*, and only the `orphaned` row records the
  pairing. Trust ADR 0007 rule 2 over that sentence.
- **`task.progress`'s detail changed shape in 0.3.0.** It is now the task **spread flat** — the id
  is `id`, *not* `taskId` — and the wrapper's `workerType` (`'inline'`/`'thread'`) overwrites the
  task's own pool key. A 0.2.1 consumer reading `detail.taskId` silently gets `undefined`.
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

**Node 24 is required and is not on the PATH by default** — `.node-version` pins it and **fnm** is
what selects it. In a non-login shell, activate it before running anything:

```bash
eval "$(fnm env --shell bash)" && fnm use 24
```

Node 16 is what a bare `node` resolves to here, and it fails at `??=`-era syntax long before it
reaches a test.

**`npm install` requires `../fyflow-scheduler` to be checked out beside this repository**, and it
rebuilds that repository's gitignored `dist/`. That is the one write this repo makes outside itself
and it is [ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)'s
stated cost, not an accident.

**Do not rewrite files with `Get-Content | Set-Content`** — PS 5.1 reads UTF-8 without a BOM as
CP1252 and silently double-encodes every non-ASCII character. Use the Edit or Write tool.

## Git

Local identity is `tsukeero <tsukee.kage@gmail.com>`. There is no remote yet. **Commit only when
asked.** Commit subjects are scoped: `doc:`, `spec:`, `adr:`, `feat:`, `fix:`, `chore:`.
