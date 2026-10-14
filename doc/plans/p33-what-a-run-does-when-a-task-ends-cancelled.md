# P33 — What does a run do on `fyflow-scheduler` 0.6.0, where a task can end CANCELLED?

**Status:** planning — drafted 2026-10-14 on `581d0e5`; stop-and-asks (a)-(e) ANSWERED by the maintainer 2026-10-15, all as recommended, (d) with decision 4's stop clause; refined 2026-10-15 against fyflow-app's ADRs (fact 9, decisions 1 and 3, scope 4) and P34-P37 drafted beside it
**Question this plan answers:** *what must change so a run driven on `fyflow-scheduler` 0.6.0 folds
every task state that scheduler can report — including the new terminal `cancelled` — and what does a
run whose task was cancelled fold to?*
**Exit artifact:** *on the final tree, with both pins at 0.6.0: an L6 run in node 24 and in deno in
which a task is cancelled through `runtime.scheduler.cancel(id)` — once while RUNNING and once while
QUEUED behind a resource group — and each run folds to the outcome decision 3 names, its `done`
settles, and a resume of its checkpoint is refused by the reason decision 4 names; every L6 row that
was green at 0.5.2 green at 0.6.0; and `npm run gate:full` EXIT 0 (the LAST item runs it, workflow
v0.29).*
**Reserves:** W157-W161 (W161 expected unused), Q600-Q614, ADR 0094-0095

```
Question: what does a run fold to when the scheduler under it can end a task cancelled?
Items:    W157 (the pin moves to 0.6.0, behaviour unmoved), W158 (cancelled is a library state and
          a run outcome — ADR 0094), W159 (what 0.6.0 adds that a type's pool and worker reach),
          W160 (the exit artifact, on real workers in both runtimes)
Reserves: W157-W161 (W161 expected unused), Q600-Q614, ADR 0094-0095
Raises:   none at this declaration
Baseline: ids derived by `npm run state` at this declaration — P33, W157, Q600, ADR 0094, from the
          tree and from the ledger, which AGREE. The ladder counts are NOT taken here and are W157's
          declaration step's
Drafted:  2026-10-14 on `581d0e5`
```

## Why this plan, and why now

**fyflow-app sent its first pass of requests on 2026-10-14**
(`../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass1.md`, cited as
*"orchestration pass 1 #N"*), and **`fyflow-scheduler` released 0.6.0 the same day** — npm
2026-10-14T13:21Z, JSR the same — answering that app's scheduler pass 1: `scheduler.cancel()`, a named
message channel, `attemptsSpent`. The maintainer evaluated the twenty items on 2026-10-14 and decided:

1. **The next release is orchestration 0.8.0** — tagged locally, never published; npm carries 0.7.0 —
   **peering on `fyflow-scheduler` 0.6.0**, exact as ADR 0048 has it. Every item below lands in 0.8.0,
   including the ones that widen a published union; nothing here warrants a major. **So 0.8.0 is
   published ONCE, after the last plan of the sequence below** — never between P33 and P34, whose
   rename of `stopped` would otherwise reach fyflow-app as a second break to the unions P33 widens
   (the app's ADR-0014 keys a refused resume on *"a stopped run"*).
2. **Run control is IN** — cancel, stop one run, and pause — which moves them out of `doc/concept.md`
   section 7's non-goals. That amendment is P34's. **And today's `stopped` is RENAMED by P34** — it
   is the driver's HALT on a defect (`failRun`, `driver.ts:1860`), terminal and refused by a resume
   (RN-R23), not a stop — so that *stop* names only #18's resumable stop. The new name is P34's to
   choose (`halted` is the working one); every `stopped` this plan writes means today's halt.
3. **A runtime is its registry**: node types, pools, groups and languages are fixed at
   `createRuntime`; a plugin change builds a new runtime, and in-flight runs move by stop-and-resume
   (P34). `runtime.register()` is DECLINED; a flow may be checked and started on a running runtime at
   any time (`runtime.check(flow)`, P37). Checked against fyflow-app's own ADR-0015, which already
   rebuilds its runtime on a Reload and keeps old runs on old runtimes.
4. **The schema subset admits `title`, `description`, `readOnly` and `writeOnly` as annotations**,
   value shape checked, constraining nothing, with no redaction promise — superseding ADR 0053 rule 3
   for those four (P37).
5. **The checkpoint header is delivered before the run's first event** — an `onHeader` callback,
   reversing ADR 0064's rejected-alternative row (P36).

**The sequence those decisions produce**, recorded here because a sequence written nowhere did not
happen (`doc/workflow.md` section 1 rule 3). Each later plan is declared at its own turn and may move:

| plan | question | pass-1 items |
|---|---|---|
| **P33** (this) | the scheduler moves to 0.6.0 and a cancelled task folds | the bump; the `AGENTS.md` section 11 doc fix; #16 |
| [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) | what do cancelling, stopping and pausing a run do? | #1, #18, #14; today's `stopped` renamed |
| [P35](p35-may-a-node-wait-for-a-person-by-design.md) | may a node wait for a person by design? | #2, with #3 and #4 scoped to it; #12 and #13 answered |
| [P36](p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) | what is a task's attribution, and what survives a resume? | #8, #10, #9; #11 answered |
| [P37](p37-a-runtime-is-its-registry.md) | a runtime is its registry | #6, `runtime.check`, #7, #19, #20; #5, #15 and #17 answered |

**Every pass-1 item has one owning plan**, and an item *answered* rather than built is answered in
that plan's file, so the reply to fyflow-app cites a plan for each. P34-P37 are DRAFTS carrying the
maintainer's decisions to date — no ids reserved, no facts taken — and each is declared at its turn.
The `AGENTS.md` section 3 gate-row doc fix is already done on `main` (W153; fyflow-app read 0.7.0's
reference) and is owned by nobody.

**P33 is first because the bump alone opens a hang**, measured by reading on `581d0e5` — fact 1. Every
later plan builds on 0.6.0, and the bump is not a pin move.

## Facts measured before drafting

On `581d0e5`, and on `fyflow-scheduler@0.6.0` unpacked from npm into scratch (never into
`node_modules`).

**Fact 1 — a task cancelled under a run today is DROPPED, and the run never ends.**
`src/driver/listener.ts:42` keeps `TERMINAL = {done, failed, user_action}`, `normalizeEvent` returns
`null` for any other state (`:72-73`), and the driver subscribes only `SETTLEMENT_EVENTS =
['task.completed','task.failed','task.user_action']` (`src/driver/driver.ts:1064`). 0.6.0's
`_finishCancelled` sets `state = 'cancelled'` and dispatches **`task.cancelled` alone** — no
`task.failed`, no retry (`dist/node/index.js:2928-2942`). So a consumer that calls
`runtime.scheduler.cancel(id)` — public since 0.6.0 — leaves the task `running` in the fold for ever,
the run never reaches a terminal outcome, and **`done` never settles** (`runtime.ts:642-647` settles
only on `isTerminal`).

**Fact 2 — the state set grows by one and nothing else in it moves.** 0.6.0's `FyflowTask.state`
documents `pending -> running -> done | failed`, `user_action` for a non-optional task out of retries,
and **`cancelled`**; a task being cancelled stays `running` with `cancellation` set
(`dist/types/core/FyflowScheduler.d.ts:48-65`). The `user_action` pair is UNCHANGED on both paths —
`task.failed` then `task.user_action`, same object, state set first (`dist/node/index.js:2907-2917`,
the ordinary path, and `:3206-3216`, the orphaned path). `src/definition/types.ts:16,19`
(`RoutableState`, `TerminalState`), `src/fold/run-state.ts:22` (`NodeState`) and `:33-34`
(`RunOutcome`) each enumerate the old set, and `run-state.ts:345` copies a terminal state verbatim
into a `NodeState` that would not contain `cancelled`.

**Fact 3 — no cancel can reject a promise of ours.** A cancelled task's promise rejects with
`CancelledError`, optional or not; the driver passes no `createPromise` to either `addTask` call
(`driver.ts:1622`, `:3140`), so there is no promise to reject. A consumer `createTask` that builds one
is the consumer's.

**Fact 4 — the two new required context members cost `src/` nothing.** `signal` and `emit` are
required on `TaskWorkerContext`, `emit` on `BaseWorkerContext` (`dist/types/core/workerInterface.d.ts:
118, 147-150`). `src/` constructs no context literal: the envelope worker passes the scheduler's
context through as `unknown` (`src/scheduler/envelope-worker.ts:221-223`, `:313-315`, `:350-371`).
Whether an inner worker REACHES both is asserted nowhere — W159's.

**Fact 5 — 0.6.0 adds two pool options, and the type declaration admits neither.** `cancelGraceMs`
and `messages: { flushIntervalMs, maxBuffered }` (`dist/types/core/workerManager.d.ts:123`, `:141`).
`DECLARED_POOL_KEYS` is `maxThreads`, `maxConcurrentTasks`, `idleTimeout`, `residentGroups`
(`src/definition/registry.ts:128`); `checkNodeTypeShape` refuses any other (`:288-293`).
`idleCheckIntervalMs`, `requeueFailedTasks` and `maxWorkerRestarts` were admissible at 0.5.2 and are
not admitted either — P37's (#19), not this plan's.

**Fact 6 — `SpawnTaskConfig.parents` is still declared and still read nowhere.**
`dist/types/core/workerInterface.d.ts:76` declares it; the 0.6.0 bundle reads no `parents` at all.
`doc/concept.md` section 2's table is re-verified, its line citations re-taken against the JSR source
by W157.

**Fact 7 — the pin is written in more places than D7 binds, and some are claims about 0.5.2's
behaviour.** `package.json` (dev and peer), `deno.json:11`, `deno.lock`,
`examples/deno-import-map.json`, `scripts/check-scheduler.mjs` (`PIN`, D2, D3, D7, D8), five D7-bound
sentences, and literal `"0.5.2"` in three self-tests and `scripts/pack-smoke.mjs`. **Beyond the pin,
behaviour measured at 0.5.2** is cited in `src/scheduler/runtime.ts:133-134` (`GROUP_MEMBERS`, S10),
`spec/flow-definition.md`, `spec/outcome-record.md`, `spec/join-policy.md`, `AGENTS.md` section 12
(*"byte-identical between 0.3.0, 0.5.1 and 0.5.2"*, *"a retry waiting on its backoff never runs"* under
`shutdown()`), `doc/concept.md` sections 2, 3 and 7, and `CLAUDE.md`'s scheduler facts. **0.6.0 changes
three behaviours those may rest on**: retry backoff is now enforced under load, `scheduler.completed`
fires on a drain with no success, and `terminateWithError()` never throws.

**Fact 8 — Deno refuses the JSR version until 2026-10-15T13:21Z, and the lock is the way past it.**
`deno run` against `jsr:@fyflow/scheduler@0.6.0` is refused (*newer than the specified minimum
dependency date*); `--min-dep-age=0` (unstable at deno 2.9.6) fetches it and writes `deno.lock`, after
which a plain `deno run` and `deno run --frozen` both resolve it — measured in scratch through a
`deno.json` import, **not** through `--import-map`, which is what `test:l6:deno` uses. W37 met this
cooldown and recorded that `D3` printed `ok` throughout.

**Fact 9 — the scheduler never cancels a task by itself, so a shutdown or a crash leaves a run
RESUMABLE.** In 0.6.0 `task.cancelled` is dispatched only from `_finishCancelled`, reached from
`cancel()` (`dist/node/index.js:2970-3043`) and from a dispatched task's settlement after one
(`_settleCancelled`, `:2928`). `shutdown()` (`:3746`) drains running tasks for 5 s, removes every
listener, and only THEN stops the pools — the one task it ends `cancelled` is one already being
cancelled, and nobody hears it. So decision 4 refuses only a cancel somebody asked for, and fyflow-app's
ADR-0014 (*resume on start, at least once*) loses nothing to it.

## Scope

**In**

1. **The pin moves to 0.6.0 in both registries**, exact, with every surface fact 7 names and the claims
   about 0.5.2's behaviour re-measured at 0.6.0 or re-dated to the version they were measured at —
   **never moved over work not done** (`doc/concept.md` section 3's precedent).
2. **`cancelled` is the library's sixth task state and fourth terminal one** — the outcome record
   carries it, the fold folds it, the run outcome says it, and a resume refuses it (decisions 2-4,
   ADR 0094).
3. **What 0.6.0 adds that a type reaches**: `cancelGraceMs` and `messages` declarable on a node type's
   `pool`, and an inner worker reaching `context.signal` and `context.emit` — asserted, not assumed.
4. **`AGENTS.md` section 11**: the **durability** row, stale since P23 (resume is built — section 18),
   and the **cancellation** row, false at 0.6.0. **`runtimeCompat`** in `deno.json` (#16), the browser
   claim qualified by [Q52](../questions/q52.md). #16's other half — *run the gate under Deno* — is
   already met (`typecheck:deno`, `test:deno`, `test:l6:deno` are in `npm run gate`). **And one L6 run
   on Node 26**, recorded and not added to the gate: fyflow-app's Host targets Node 26 (its ADR-0008),
   `engines` says `>=22`, and every run here is Node 24, so `runtimeCompat`'s `node` is a claim
   until one is measured.
5. The exit artifact at L6 in both runtimes.

**Out** — named rather than left implicit

- **`driver.cancel`, stopping one run, pausing** — P34. This plan makes a cancel NOTICED; it adds no
  call that cancels.
- **`task.cancelling`** — not recorded here (decision 5); whether a run shows *cancelling* is P34's.
- **`task.message`, `task.progress`, `task.retrying`, `attemptNumber`, `attemptsSpent`** — P36. The
  outcome record's `attempts` keeps its meaning (retries used; 0.6.0 does not change it).
- **The other pool options** (`idleCheckIntervalMs`, `requeueFailedTasks`, `maxWorkerRestarts`) and
  pool options on a named instance — P37 (#19).
- **`on: ["cancelled"]` on an edge.** `FD-V18` keeps refusing it (decision 2).
- **`fyflow-react-components`' pin** — still 0.2.1; a coordination point, recorded rather than moved.

## Decisions taken before fan-out

*Decisions 2-5 carry stop-and-asks (a)-(e), below, answered 2026-10-15. The rest follow from a precedent named beside them.*

1. **The pin is one move, W36/W37's shape.** Exact in `devDependencies` and `peerDependencies`
   (ADR 0048), `jsr:@fyflow/scheduler@0.6.0` in `deno.json` and the import map, `deno.lock` written
   once — by `--min-dep-age=0`, or by editing the lock's entry directly, whichever W157 records — and
   never by waiting the cooldown out, and **`test:l6:deno` asserted
   to resolve 0.6.0 through the lock** — fact 8's untested half. `check-scheduler` `D3`'s premise is
   *both runtimes reach that version*, so W157 runs both L6 lanes before it reports the pin moved.

2. **`cancelled` is a TERMINAL state that routes NO edge** — ADR 0094. The listener subscribes
   `task.cancelled`, `TERMINAL` gains it, and the record copies it verbatim (`OR-R3`, ADR 0007 rule 2:
   key on terminal state). `TerminalState` gains `'cancelled'` and `NodeState` gains `'cancelled'`;
   `RoutableState` does not, so `FD-V18` still admits only `done` and `failed`. **A cancel is the
   consumer's own act, not an outcome a flow branches on** — the scheduler's reason for rejecting even
   an optional task's promise. **Stop-and-ask (a).**

3. **A cancelled task makes its RUN `cancelled`** — a seventh `RunOutcome`, terminal, ranked **below
   `stopped` and above `awaiting_action`** in `withOutcome`'s precedence (RN-R8's chain). On the
   first cancelled settlement the driver dispatches nothing further and routes no later settlement,
   exactly as `failRun` does today (`driver.ts:1860-1905`), and the in-flight tasks are left to the
   scheduler — appended as they settle, routed nowhere. A parked task in that run stays parked in
   `nodes` and `resolve()` is refused, as after `stopped`. **A join waiting on a cancelled branch is
   not `stuck`** — the run is already terminal; the L5 matrix gains a `cancelled` row under every
   policy saying so. **`done` settles on that first cancel**, as on a halt today (`runtime.ts:642-647`),
   while the run's other tasks may still be running unheard; fyflow-app's #1 asks that `done` settle
   *once the tasks have stopped*, and **whether a cancel's `done` waits for them is P34's** — it is
   P34's cancel that stops them. **Stop-and-asks (b) and (c).**

4. **A cancelled run is NOT resumable**: `resumeRefusal` gains a sixth reason, `'cancelled'`, beside
   `'stopped'` (RN-R23's shape) — what fyflow-app asks of a cancelled Run (#1, *"a cancelled Run is
   not resumable"*), and the reading under which a replay reaches the same outcome. **This does not
   reach #18's STOP**, which also cancels tasks: P34's stop makes the driver DEAF to its run (the
   existing `deaf` flag, `driver.ts:1223`) BEFORE it cancels, so no `task.cancelled` of a stop is ever
   appended, the stopped tasks stay dispatched-and-unsettled — in flight — and a resume re-dispatches
   them (RN-R21). That ordering is P34's to build and to test; what this plan decides is the cancel
   the driver did NOT request. **Stop-and-ask (d).**

5. **`task.cancelling` is not recorded** — `OR-R4` gains it beside `task.running` and `task.progress`:
   a request is not a settlement. A run's visible *cancelling* is P34's, where the request is the
   DRIVER's and is recorded as its own fold input. **Stop-and-ask (e).**

6. **The two new pool options are declarable on a node type's `pool`, and nothing else is added** —
   `POOL_SPEC_KEYS` gains `cancelGraceMs` and `messages`, held to the scheduler's own rules (a
   non-negative number; a positive interval and a positive-integer cap) by `poolSpecProblem`, with the
   spec's pool table and the both-ways test moving together (`doc/workflow.md` section 5 rule 8 (e)).

7. **Each widened union is BREAKING for a consumer switching on it exhaustively, and that is stated
   where it is widened** — `TerminalState`, `NodeState`, `RunOutcome`, `ResumeRefusalReason` — on
   `resumed`'s and `gated`'s precedent (`run-state.ts:237-238`, `:252-253`). They ship in 0.8.0 by
   decision 1 of *Why*.

8. **`spec/` takes the version in three documents** — `outcome-record.md` (the state, `OR-R3`/`OR-R4`),
   `run-state.md` (`NodeState`, the outcome, RN-R8's chain, RN-R23's refusal) and `join-policy.md` (the
   matrix row) — and `spec/README.md`'s rows. No `FD-V` id moves.

### Stop-and-asks — ANSWERED by the maintainer, 2026-10-15

| | the question | recommended | the alternative, and its cost |
|---|---|---|---|
| **(a)** | `cancelled` routes no edge; `on: ["cancelled"]` stays refused | **yes — answered** — a cancel is the consumer's act, and a flow that branches on it is a flow that keeps running after its owner said stop | an opt-in edge: a cancelled task becomes a third routable outcome, and P34's *cancel a run* has to cancel the compensating branch it just started |
| **(b)** | one cancelled task makes the whole RUN `cancelled` | **yes — answered** — nobody cancels one task of a run by accident, and the alternative routes on past a hole the run cannot fill | the branch ENDS and the run continues: a `map` loses an item silently, and the run can complete having skipped work its owner never saw skipped |
| **(c)** | `stopped` outranks `cancelled`, and `cancelled` outranks `awaiting_action` | **yes — answered** — a refusal is a defect and must not hide; a parked task must not make a cancelled run read as *waiting for a person* (#1: *"parked tasks end without needing a Resolve"*) | `cancelled` first: a run refused for a defect AND cancelled reads as an owner's choice |
| **(d)** | a cancelled run is refused by `resume` as `'cancelled'` — where *cancelled* is any appended cancel, which a stop's never is (decision 4) | **yes — answered** — the app asks it, and it is RN-R23's shape for `stopped` | an unrequested cancel treated as in flight: resumable, but a cancel nobody recorded is silently re-run on the next resume |
| **(e)** | `task.cancelling` is not recorded in P33 | **yes — answered** — the scheduler's request event, and a run whose cancel the DRIVER requested is P34's fold input | record it now: a fold input for a state P34 may model differently |

**The answer, as given**: *"yes, with amendments regarding cancelling and resuming"* — the amendments
are the two this draft carried before the answer: decision 4's clause that **a stop goes DEAF before it
cancels**, so a stop's cancels are never appended and its tasks resume by RN-R21, and (d)'s scope —
**any APPENDED cancel**, which only a cancel the driver did not request can be. P34 builds and tests
the ordering; this plan refuses the resume.

## Work items

**The two sentences P32's retro adopted for THIS declaration** (P32 Retro section 9, B and C), copied
as that retro directs:

- **B — the census re-take**: *an item that adds a node, a field, a suite, a module, a snippet or a flow
  builds its change in a byte copy and runs every lane BEFORE writing its `Owns`.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers,
  and its confirming gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader
  items, on the final tree.*

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W157 | **The pin moves to 0.6.0, behaviour unmoved** — every surface fact 7 names; concept sections 2-3 re-verified and their citations re-taken; each claim about 0.5.2's behaviour re-measured or re-dated; `S2` and `S6` in `doc/scheduler-upstream.md` brought to what 0.6.0 shipped; `runtimeCompat`; Q3's answer | `package.json`, `package-lock.json`, `deno.json`, `deno.lock`, `examples/deno-import-map.json`, `scripts/check-scheduler*.mjs`, `scripts/check-source-selftest.mjs`, `scripts/pack-smoke.mjs`, `doc/concept.md`, `doc/scheduler-upstream.md`, `README.md`, `examples/README.md`, `spec/README.md`, the 0.5.2 claims in `spec/*.md`, `AGENTS.md` section 12, `src/scheduler/runtime.ts` (comments only) | — | `gate:item`; both L6 lanes green against 0.6.0, `test:l6:deno` shown to resolve 0.6.0, `check-scheduler`'s self-test red on a one-registry pin, and one L6 run on Node 26 recorded (scope 4) |
| W158 | **`cancelled` is a library state and a run outcome** — ADR 0094; listener, settlement events, the four unions, `withOutcome`, `resumeRefusal`, the driver's halt; the three specs; `AGENTS.md` sections 6, 8 and 11 | `src/definition/types.ts`, `src/driver/listener.ts`, `src/driver/driver.ts`, `src/fold/run-state.ts`, `spec/outcome-record.md`, `spec/run-state.md`, `spec/join-policy.md`, `spec/README.md`, `AGENTS.md`, `test/driver/**`, `test/fold/**`, `test/matrix/**`, `doc/decisions/0094-*` | W157 | `gate:item`; L1 the record and the fold, L2 a run halted by a cancel mid-fan-out, L3 its log folded twice, L5 the `cancelled` row under every policy, and a resume refused `'cancelled'` |
| W159 | **What 0.6.0 adds that a type reaches** — `cancelGraceMs` and `messages` on a node type's `pool`; an inner worker's `context.signal` and `context.emit`, asserted through the envelope | `src/definition/registry.ts`, `src/definition/types.ts`, `spec/flow-definition.md`, `test/definition/registry.test.ts`, `test/scheduler/envelope-worker.test.ts` (new), `AGENTS.md` section 13 | W157 | `gate:item`; L1 each new key refused on each malformed value; L6 a typed worker that sees both members |
| W160 | **The exit artifact** — cancel while running and while queued, on real workers | `examples/flows/**`, `examples/l6.ts` | W158, W159 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W161 | *reserved, expected unused* | | | |

W158 and W159 both edit `src/definition/types.ts` and `AGENTS.md`, so they are **serial, never
concurrent** (`doc/workflow.md` section 7 rule 2): W159 runs after W158 and declares the overlap in its
exceptions table. Each item's file is written at its declaration step; this table is an index, not the
declaration.

## Predictions, written before the items that test them

1. **W157 moves no L1-L5 assertion.** Nothing in `src/` reads a 0.6.0 surface, and fact 4 says the new
   required members are never constructed here.
2. **At least one L6 row moves at 0.6.0, and it is a TIMING row** — backoff enforced under load (fact 7)
   delays a retry the 0.5.2 run started early. [Q599](../questions/q599.md)'s three rows are the first
   suspects.
3. **`resource.unblocked`'s new `'cancelled'` reason reaches no assertion** — no row cancels, and `src/`
   switches on no reason.
4. **W158's breaking change is LOUD wherever a type constrains the result** and silent where a consumer
   compares a string — the shape W84 measured for `regions`.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q18](../questions/q18.md) | what cancelling a run does — **reopened by P34**, not here; both of its deferral triggers are met (S2 shipped upstream as 0.6.0's `cancel()`, and a consumer asked) | P34 |
| [Q52](../questions/q52.md) | L6 in a browser — what `runtimeCompat`'s browser claim is qualified by | no owner — deferred |
| [Q599](../questions/q599.md) | three timing-flaky L6 rows — prediction 2 may move them | no owner — deferred |

## Record

*Filled in at the join, after the work items are merged.*
