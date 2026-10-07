# CLAUDE.md — fyflow-orchestration

Guidance for Claude Code working in this repository.

## What this project is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**:
flows with sequence, **decision** routing, **fan-out** and **join**, instantiated per workload at
**thousands at a time**. *(That is `doc/concept.md`'s figure and the one you can check. The
`1000s-10000s` figure cited elsewhere under `doc/` is `FLOW_PLANNING.md`'s, in the scheduler
repository, **which is not on this machine** —
[P15](doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) fact 8 measured a run at both
ends of the range and corrected the provenance.)*

Full context: [doc/concept.md](doc/concept.md). Do not re-derive it — read it.

**[AGENTS.md](AGENTS.md) is the consumer reference** — what the library looks like from outside, and
the only document that does. **Every snippet in it is extracted and executed by `npm run gate`**
(`scripts/check-docs.mjs`), so it cannot rot the way a hand-maintained reference does. If you change
the public surface, that check is what tells you the reference is now wrong.

## Where the work is

```bash
npm run state
```

**Nothing about the state of the work is written down here.** That command derives it from the tree:
the next free `P`, `W`, `Q` and `ADR` id — both from the tree and from the last retro's ledger, with
a disagreement reported rather than resolved — each recent plan's and item's state read from **its
own file**, and the counts that a file declares. It cannot go stale, because there is no copy to go
stale.

*This section was a `## Current state` block of **532,021 bytes — 93.2% of this file** — whose own
opening sentence read *derived by grep off the tree, never from this sentence* and which said on
fifty separate lines *read every status from the item's own file, never from this line*. **104 of its
105 status blocks** were a summary of an item or plan file that still exists and still carries its
own Record or Retro; the 105th was this heading's own id ledger, which is what the command above
derives.* [P27](doc/plans/p27-what-a-register-row-is.md) *decisions 2, 4 and 5 and*
[W114](doc/work-items/w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md) *replaced it with
the command. The history is `git`.*

**An item does NOT write its status into this file** —
[ADR 0077](doc/decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) — **nor into
[doc/README.md](doc/README.md)**, which left the record step at
[W115](doc/work-items/w115-the-exit-artifact-and-the-budget-met.md) by the maintainer's answer to
[Q466](doc/questions/q466.md), the question ADR 0077 consequence 4 raised. **The record step is
FOUR files and neither of these is one of them**: the plan's Record, `README.md`,
`doc/questions/**` and `doc/decisions/**`. `npm run state` is where the state of the work is.

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

Backed by [ADR 0001](doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
rules 1 and 4, [ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 4, and **[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md),
which is what finally made it executable**: the driver produces the ordered `FoldInput` sequence and
`fold(driver.foldInputs())` is the whole of turning a run into run state. Until W5 **nothing produced
that sequence**, so the invariant was true of hand-written fixtures and of nothing else. A decision
predicate that calls `addTask`, a fold that reads `scheduler.tasks`, or **a fold that subscribes to
the driver** has broken it — the last is the ergonomic next step ADR 0014 spends a paragraph
forbidding. This is what makes routing testable with no scheduler (ladder L2), makes determinism a
real check rather than an aspiration, and keeps durable runs additive. `doc/concept.md` section 5.

Task completion **order** is genuinely non-deterministic. The fold must be deterministic *given an
ordered log*; the driver is what turns unordered reality into that ordered log. Never write a test
that depends on fan-out completion order.

## How work is done

**[doc/workflow.md](doc/workflow.md) — read it before starting any work item.** It carries the
procedure in sections 1-8, and BELOW them a version index and a REFUSAL LEDGER — one line per
repeatedly-refused proposal, with the ordinal that document states for it. **The 159,779 bytes of
per-version argument that used to sit above those sections are in each plan's Record and in
`git`**, by [P27](doc/plans/p27-what-a-register-row-is.md) stop-and-ask (b): the arguments were
kept to stop a rule being re-litigated and the same proposals came back with them present, a
`doc/` check twenty-five times. **Nothing about it is summarised here**: it is in the same required-reading set as this file,
so a summary would be a second copy of a document you are about to open — and the summary this
section carried was measurably stale, reading *ten* overlap measurements and a *1-4* band where
section 6's band is **0-4** over fifty-nine measurements.

```
concept -> plan -> work items -> verify (ladder, spec conformity, retro) -> record
```

- A **plan** (`doc/plans/`) answers one question and ends in something a human can look at.
- A **work item** (`doc/work-items/`) is the smallest thing with its own gate. It is **declared
  before it starts** — owns-files, tests, gate, reserved ids — using `doc/work-items/TEMPLATE.md`.
- **Verification is a ladder.** Climb from L0, stop at the first failure, and report which levels
  did not run. `workflow.md` section 4. **L2 (routing from a fixture outcome log) is where this
  repo's value is proved**, **L5 is the join/failure matrix** — the hard part — and **L6 is
  `examples/`**, the only rung that touches a real scheduler:

  ```bash
  npm run gate            # the LADDER: lint, typecheck, the checks, L1-L5, both L6 runtimes
  npm run gate:item       # the ladder plus the self-tests less the register lane - an ITEM'S CONFIRMING GATE
  npm run gate:full       # the ladder plus every self-test - the plan's LAST item
  npm run test:l6         # ladder L6, node 24
  npm run test:l6:deno    # ladder L6, deno
  ```

  **`npm run gate` is NOT an item's confirming gate** — `doc/workflow.md` v0.26. The local gate is
  the ladder and `gate:full` adds the self-tests that prove the checks can fail
  ([ADR 0070](doc/decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)),
  and the reason the distinction is in this file is that `gate:full` was RED for two items while
  `npm run gate` was green. **An item's is `gate:item`**, which leaves out `check:register:selftest`
  and nothing else (v0.29; `check:wiring` `G7` binds it). **The plan's last item runs `gate:full`**,
  as does an item editing `scripts/check-register*.mjs`, `scripts/state.mjs` or
  `doc/questions/README.md`.

  **L6 lives in `examples/**` and not in `test/**`, deliberately**: the browser bundle globs
  `test/**/*.test.ts`, so anything that imports a scheduler placed there would be bundled for a
  runtime L6 does not run in (`RT-R10`).
- **`npm run gate` runs `test:browser`, which is CHROMIUM ONLY**
  (`scripts/run-browser-tests.mjs`); firefox and webkit need `test:browser:all`.
- **A count a Record calls "assertions" is a count of `test()` CASES**, except at L6, where it is a
  real count of individual assertions. Do not add the two ([Q98](doc/questions/q98.md)).
- Ids (`P`, `W`, `Q`, `ADR`, `S`) are reserved in blocks before fan-out, and are **never reused or
  renumbered**. `npm run state` derives the next free one.

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
is.** All four of `doc/concept.md` section 6's have landed — two as ADRs, one as P1's spike, and
run-state-as-a-fold as Q14's answer — **and all four went to the leaning**, which section 6 now says
in place rather than leaving to a reader to notice. The live example is elsewhere:
**[Q33](doc/questions/q33.md)'s leaning said *L6 in Node only*, on the stated ground that L6 *"needs
a real worker file per runtime"*, and that ground is false at Node 24.** W5 measured it in one
command and the answer flipped. Citing a leaning as settled is the most likely way to get this wrong;
inheriting the *reasoning* behind one without checking it is the second.

**A written claim nobody ran is this repository's most common defect.** `spec/run-state.md` section 5
tabulates **five** — its own heading says *three things v0.1 claimed that its own inputs could not
supply, and two found since*. Three were a spec asserting what its own inputs could not supply; the
fourth is [Q43](doc/questions/q43.md), a register entry written by a reader saying the data was
already there when it was not; the fifth is a v0.1 claim that stayed true by accident for nine plans.
`spec/` has a conformity pass; **the register has nothing.** *(This paragraph said FOUR until
2026-10-04 — stale since that document reached v0.4, and carried forward verbatim by the cut that
shortened everything around it.)*

**The register is `doc/questions/`, one file per question (Q17 is `q17.md`), and it is a REFERENCE,
NOT read before every work item.** Look one up: `npm run q -- Q17`, and **`--fields id,status`
prints only the fields named — ask for no more than you need.** `--where status=open`, `--search`
and `npm run refs -- Q17` (the files citing it) do the rest. **`icebox` is left out of every list
and search unless asked for** (`--include-icebox`), and the output says how many it hid. Link one as
`[Q17](doc/questions/q17.md)` at the citing file's depth; [its README](doc/questions/README.md) says
how to raise one. **A process word** — *probe*, *vacuity floor* — is in
[doc/glossary.md](doc/glossary.md): `npm run term -- probe`. *(No document names the always-read set
`check:budget` holds: [Q465](doc/questions/q465.md).)*

**A wish for `fyflow-scheduler` goes in [doc/scheduler-upstream.md](doc/scheduler-upstream.md), not
into a workaround comment.** Every item states what we do without it — an item with no workaround is
a blocker and belongs in a plan instead. **[S9](doc/scheduler-upstream.md) was the one live item and
is RAISED AND FIXED** in 0.5.2 ([W37](doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)),
leaving that register with nothing waiting — **the only item it has ever raised.**

**`src/` and `index.ts` reach the scheduler by its BARE SPECIFIER and by no other form.** The
published packages DEPEND on it since
[ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
(W57), which superseded
[ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 1, 2 and 6 — and `SchedulerLike` is still a two-method structural interface, so a caller passes
its own scheduler in. `S7` in `scripts/check-source.mjs` refuses every other **literal** form of the
reach — the JSR name, a `jsr:` or `npm:` prefix, `file:` or `../` — across `from`, bare `import`,
dynamic `import()` and `require()`, in single, double and backtick quotes. **Its own comment states
what it cannot close**: a specifier built at run time, `import('fyflow' + '-scheduler')` or a `const`
holding the name, survives. It raises the cost of the mistake; it does not make it impossible.

**Writing documents:** dense and decided. Tables and numbered rules over narrative. Distinguish
decided from open — open items get a Q id and a file in `doc/questions/`, not an inline TODO. Reference
paths from the repo root in prose; only markdown links are relative. **And a count a check or a
script can derive is not written down** ([P27](doc/plans/p27-what-a-register-row-is.md) decision 4):
this file carried hundreds of copies of five such figures, each a snapshot that was true once, and
the exact number depends on the predicate you count with — which is itself the argument. Run the
check, or `npm run state`.

## Facts about fyflow-scheduler that catch people out

Grounded in its `AGENTS.md` at **0.5.2**, which **ships inside the npm package** — read it at
`node_modules/fyflow-scheduler/AGENTS.md`, not next door. There is **no changelog**, so a version
bump means re-reading `AGENTS.md` §6 rather than reading a diff. Re-check there rather than trusting
this list if it matters.

- **No dependencies, no ordering** — see above. This is the big one.
- **Node reads npm's `dist/` and Deno reads JSR's source, and the reason is not that Node cannot read
  the source.** It can, since 0.5.2. `dist/` is what an npm consumer gets, so L6 tests the published
  artifact rather than a source tree no consumer resolves
  ([ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
  whose stated reason [W37](doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md) corrects). **A
  typed `.ts` worker runs fine under Node 24**, `inline` and threaded.
- **The version is written down twice, and that is the live hazard.** `package.json` pins the npm
  package and `examples/deno-import-map.json` pins the JSR one; ladder L6 runs in both. `npm run
  check:scheduler` **D3** is what stops L6 reporting two runtimes green against two different
  schedulers.
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
  `task.failed` *and* `task.user_action` with the same object — in **two** places,
  `core/FyflowScheduler.ts:896-910` and `1128-1142` (the orphaned-task path), **read at 0.3.0 and
  still right because that file is byte-identical through 0.5.2** (W36, W37). Key outcomes on
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
- **A group's `onFinish` is marked OPTIONAL and omitting it hangs every task naming that group**, for
  ever, with `stats` reporting idle; omitting `onStart` throws; omitting `getMetrics` works. So the
  interface's own optionality is wrong in the direction that fails in silence —
  [ADR 0055](doc/decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md) holds
  a group to what the scheduler CALLS, and [S10](doc/scheduler-upstream.md) raises it.

`AGENTS.md` inside the installed package is the single-file API reference and every snippet in it is
executed by that project's own test suite. **Nothing here reaches a checkout next door**, and
`check-scheduler.mjs` D1-D3 refuse the three ways that could come back — a `file:` dependency, a path
in the import map, and a symlink in `node_modules`. The last one is not hypothetical: it is how a
`git worktree remove --force` deleted most of the sibling repository on 2026-08-31
([ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).

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

**`npm install` is just `npm install`.** The scheduler is a pinned registry dependency
(`fyflow-scheduler@0.5.2` from npm; Deno reaches `jsr:@fyflow/scheduler@0.5.2`), so nothing needs to
be checked out beside this repository and **this repo writes nothing outside itself** —
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md).

**Never put a link into `node_modules`.** Not a `file:` dependency, not `npm link`, not a junction —
`check-scheduler.mjs` D1 refuses one and this is why: on 2026-08-31 a junction placed there so `tsc`
would ignore the sibling's source was **followed by `git worktree remove --force`**, which deleted
through the real repository — `.git/`, `core/`, `index.ts`, `dist/` — until it hit a lock. It was
recoverable only because 0.3.0 had been pushed publicly. Every recursive tool that touches
`node_modules` is one link away from another repository.

**Do not rewrite files with `Get-Content | Set-Content`** — PS 5.1 reads UTF-8 without a BOM as
CP1252 and silently double-encodes every non-ASCII character. Use the Edit or Write tool.

**And do not rewrite files with Python's TEXT mode either — `pathlib.Path.write_text` and
`open(p, "w")` translate a newline to a carriage-return-newline pair on Windows**, so a
read-modify-write converts the whole file to CRLF where the index is LF throughout, and the script
cannot see it. **[Q123](doc/questions/q123.md), three occurrences**, each turning a small edit into a
whole-file diff and each caught only by `check-wiring`'s `G2` going red with a message about a
*dispatch block*. **Use `read_bytes()` and `write_bytes()`**, or the Edit and Write tools.
`git ls-files --eol` is the check by hand: every tracked file here is `i/lf`.

**And a `\n` written through a heredoc into a JavaScript string literal becomes a REAL NEWLINE**,
which is a syntax error at best and a silently different string at worst — seven occurrences across
three items. Write the script with the Write tool and run it by path.

**`dev-dist/` is gitignored scratch and it is a SHARED namespace.** A path under it carries the
process that made it, and `check-wiring`'s `G6` refuses a statement naming it that does not
([ADR 0072](doc/decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)).
It also holds whole-tree COPIES left by self-test runs, so **a grep over the tree that does not
exclude `dev-dist/` reads a second, weeks-old copy of every document here.**

## Git

Local identity is `tsukeero <tsukee.kage@gmail.com>`. **Commit only when asked, and push only when
asked separately** — the two are different questions and an approval to commit is not an approval to
publish. Commit subjects are scoped: `doc:`, `spec:`, `adr:`, `feat:`, `fix:`, `chore:`.

**There IS a remote and it is public.** `origin` is
`https://github.com/fyflow/fyflow-orchestration.git`, `main` tracks `origin/main`, and history has
been pushed to it since **2026-09-01**.

**A pushed commit is public and is not revisable in the way a local one is.** **Prefer a new commit
to amending or rebasing anything at or below `origin/main`**, which is `doc/workflow.md` section 3's
*"a commit message cannot be rewritten"* applied one level out: ids leak into commit messages, and
those messages leave the machine.
