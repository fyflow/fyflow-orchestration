# P33 — What does a run do on `fyflow-scheduler` 0.6.0, where a task can end CANCELLED?

**Status:** complete and retro'd 2026-10-15 — drafted 2026-10-14 on `581d0e5`, declared in `3ae2738`; stop-and-asks
(a)-(e) ANSWERED by the maintainer 2026-10-15, all as recommended, (d) with decision 4's stop clause; refined 2026-10-15
against fyflow-app's ADRs (fact 9, decisions 1 and 3, scope 4) and P34-P37 drafted beside it; W157, W158, W159 and W160
done 2026-10-15; the exit artifact measured on the final tree (Record below); the retro ran 2026-10-15 over `0fcccca`,
and the maintainer answered its stop-and-asks (f)-(i) the same day, all as recommended but (i) (Retro section 8)
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
| [Q174](../questions/q174.md) | the lock files bound to the pin — **resolved by W157** (`check-scheduler` `D9`) | — |
| [Q605](../questions/q605.md) | two doors a re-entrant halt does not shut — raised by W158 | P34 |
| [Q606](../questions/q606.md) | the runtime's `done` and release on `cancelled` — raised by W158; its L6 half met by W160 | P34 |

## Record

*Written 2026-10-15 over `0fcccca`, the tree clean before it. Every figure is read from the four items' own files;
none is re-measured here. Ids are bare text, as in P32's Record.*

**W157 — done 2026-10-15** (`f73ed3c`). Its own Record covers the census, the re-takes, both readers and the gate.

- **Built**: both pins at the new version, exact, in both registries; `deno.lock` written ONCE by `deno check
  --min-dep-age=0 index.ts src/`, and `test:l6:deno` shown to resolve the pin THROUGH THE LOCK with no flag, its control
  (`--no-lock`) refused by Deno's minimum age. **`D7` rewritten** by the maintainer's direction (stop-and-ask (4)): the
  pin's number is written only where something resolves or binds it, every undated statement of it reworded without
  it, and the five retired pin sentences refused at any version; **`D9`** (after the adequacy reader's A3) binds both
  lock files to `PIN`. Every undated line citation into the scheduler's source re-taken; `doc/concept.md` sections 2-3
  re-verified and cut 17,124 → 16,242 bytes to stay inside its ceiling; S2 and S6 brought to what upstream shipped.
- **Scope 4**: **no `deno.json` key** — there is no `runtimeCompat` field in Deno's config (M8; stop-and-ask (1)); the
  intended compatibility and the one **Node 26 L6 run** (node 26.11.1, 2602 / 168, EXIT 0, recorded and not gated) are
  in `AGENTS.md` section 11; jsr.io's setting is the maintainer's own action.
- **Closed: Q174 resolved** (by `D9`, stop-and-ask (7)); Q3's answer moved. **Raised: none.** Q600-Q604 unused.
- **Stop-and-asks (1)-(7)**, every one answered before its edit: exceptions E1, E2, E3, E3+, E5, E6, E7 YES (E4 unused);
  (1) and (4) design.
- **The readers**: conformity F1-F9, adequacy A1-A7, all acted on. **Overlap: ONE shared subject**, the ninetieth
  measurement.
- **Counts**: L1-L5 **58 / 1635 unmoved** in node, deno and chromium; L6 **2602 / 168 unmoved** in node and deno;
  `check:spec` **7 / 75 / 133** unmoved.
- **The confirming gate**: `gate:item` RED once on `check:budget:selftest` (the `B7` probe read concept.md's REAL size —
  E7), then **`gate:item` EXIT 0** on the final tree, 868.7 s.

**W158 — done 2026-10-15** (`c0816d0`). Its own Record covers the declaration step, 14 author provocations and both readers.

- **Built**: ADR 0094; `task.cancelled` subscribed and recorded verbatim (`OR-R3`), `task.cancelling` recorded nowhere
  (`OR-R4`); `TerminalState`, `NodeState`, `RunOutcome` and `ResumeRefusalReason` widened, each stated BREAKING where it
  is widened, `RoutableState` not (`FD-V18` unmoved); `withOutcome` ranks `cancelled` below `stopped` and above
  `awaiting_action` (`RN-R28`, new); the driver's halt a SEPARATE flag from `failRun`; `resumeRefusal`'s sixth reason at
  the FIRST stored cancel. spec/outcome-record **v0.13**, spec/run-state **v0.15**, spec/join-policy **v0.20**; `AGENTS.md`
  sections 6-9, 11, 12, 18; amendment notes in ADRs 0007, 0058 and 0065.
- **Closed: none. Raised: Q605 and Q606**, both open, owner P34. Q607-Q609 unused.
- **Exceptions E1-E5**, YES: E1-E4 at the declaration step, E5 (`RUN_FLOOR` 35 → 36) after the first `gate:item` went RED.
  **The maintainer's decision** on the readers' shared finding: the re-entrant halt's two open doors go to P34's dispatch
  hold (Q605), not patched for the cancel alone.
- **The readers**: conformity F1-F7, adequacy F1-F7, all acted on or handed on. **Overlap: TWO shared subjects**, the
  ninety-first measurement.
- **Counts**: L1-L5 → **61 / 1682** in all three; L6 **2602 / 168** unmoved; `check:spec` → **7 / 75 / 134** (`RN-R28`).
- **The confirming gate**: `gate:item` RED once on `check:docs:selftest` (X4 — section 6's new `run` snippet made
  `RUN_FLOOR` stale), then **`gate:item` EXIT 0** on the final tree, 787.5 s.

**W159 — done 2026-10-15** (`db2f4b0`). Its own Record covers the declaration step, 28 provocations and both readers.

- **Built**: `POOL_SPEC_KEYS` gains `cancelGraceMs` and `messages`, held by `poolSpecProblem` to the scheduler's own
  rules and stricter in two silent places (a non-PLAIN `messages`, `cancelGraceMs: null`), a stray `messages` key refused
  because a threaded pool fails it at run time; `MESSAGE_OPTION_KEYS`; a declared `messages` copied, not aliased; `FD-C5`
  amended — the scheduler's task context reaches the inner worker unchanged; spec/flow-definition **v0.33**;
  `AGENTS.md` section 13.
- **The plan row's "L6, a typed worker that sees both members" was met at the L1-L5 lanes**, on real pools inline and
  threaded in node and deno (`test/scheduler/envelope-worker.test.ts`), because L6 is `examples/**` and `examples/l6.ts`
  was W160's; W160 then took it at L6 too.
- **Closed: none. Raised: none.** Q610-Q612 unused; no ADR.
- **Exceptions E1** (`spec/README.md`'s row, `C8`) **and E2** (`LATE_SUITES`), YES, both at the declaration step.
- **The readers**: conformity F1-F5, adequacy F1-F9. **Overlap: TWO shared subjects**, the ninety-second measurement.
- **Counts**: L1-L5 → **62 / 1689** in all three; L6 **2602 / 168** unmoved; `check:spec` **7 / 75 / 134** unmoved.
- **The confirming gate**: **`gate:item` EXIT 0** on the final tree, the first run, 824.0 s self-test wall.

**W160 — done 2026-10-15** (`0fcccca`). Its own Record covers the declaration step, 15 provocations in both lanes and both
readers.

- **Built**: ONE cross-row block in `examples/l6.ts`, W141's shape, on a registry written in the block: a linear flow
  `work` → `after`, `work`'s worker emitting `started` through `context.emit` and waiting on `context.signal`. Three
  cancelled runs — RUNNING inline, RUNNING threaded, QUEUED behind a `ConcurrentLimitGroup(1)` the harness holds — each
  through `runtime.scheduler.cancel(id, { reason })`, and after the readers a FOURTH run, parked `user_action`, as the
  resume refusal's control. **38 cross-row assertions**, five runs counted. `examples/l6.ts:6947`'s citation re-taken.
- **Closed: none. Raised: none.** Q613-Q614 unused; ADR 0095 unused; W161 unused.
- **Exceptions E1** (`examples/README.md`'s `X10` copies and run count) **and E2** (`AGENTS.md` section 12's sentence,
  false since W158), YES, both at the declaration step. Readers' items R1-R7 directed by the coordinator.
- **The readers**: no defect from either; conformity F1-F4, adequacy F1-F9. **Overlap: TWO shared subjects**, the
  ninety-third measurement.
- **Counts**: L1-L5 **62 / 1689** unmoved; L6 → **2640 / 173** in node and deno; `check:spec` **7 / 75 / 134** unmoved.
- **The confirming gate**: **`gate:full` EXIT 0** on the final tree, the first run — 11/11 self-test lanes ok,
  `check:register:selftest` included, 2362.9 s self-test wall, 41 m 41 s in all.

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| on the final tree, with both pins at the new version | W157; `D2`, `D3`, `D8` and `D9` bind it, and `test:l6:deno` resolves it through `deno.lock` | **met** |
| an L6 run in node 24 and in deno in which a task is cancelled through `runtime.scheduler.cancel(id)` | W160's block, **2640 / 173, 0 failed in node 24.20.0 and deno 2.9.6**, in `npm run gate` and in `gate:full` | **met** |
| once while RUNNING | two runs, inline and threaded: the cancel sent on the worker's `started`, its `context.signal` aborting with the reason, `forced: false` | **met, on both pool modes** |
| and once while QUEUED behind a resource group | the cancel sent on `resource.blocked`; `task.cancelled` alone and `resource.unblocked` reason `cancelled`; the task never ran | **met** |
| each run folds to the outcome decision 3 names | the fold sequence ends at the cancelled settlement, `after` never dispatched — read at `done`, 25 ms later and after shutdown (R2) — outcome `cancelled` | **met** |
| its `done` settles | `done` WON the race with `cancelled`, terminal, equal to `fold(driver.foldInputs())`, with the scheduler's `task.cancelled` already heard at that callback (R1). **The runtime's RELEASE of the run is NOT asserted** — Q606's other half, P34's | **met**; the release is Q606 |
| a resume of its checkpoint is refused by the reason decision 4 names | refused `cancelled` at position 1 on ONE fresh runtime, so `RunIdInUse` cannot be the refusal, beside a CONTROL run parked `user_action` that the same instrument resumes to `awaiting_action` (R3) | **met** |
| every L6 row green at the old pin green at the new | W157: **2602 / 168 unmoved** in both lanes, and in 4 node and 3 deno runs at its declaration step | **met** |
| `npm run gate:full` EXIT 0 (the LAST item runs it) | W160, ONE command on the final tree after the readers' items — P32-retro sentence C | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **58 / 1635 → 62 / 1689** in node, deno and
chromium; L6 **2602 / 168 → 2640 / 173** in node and deno; `check:spec` **7 / 75 / 133 → 7 / 75 / 134**.

**What the plan answered.** A run on the new pin **folds every task state that scheduler can report**: `cancelled` is
the library's sixth task state and fourth terminal one, recorded verbatim and routing no edge; **a run whose task was
cancelled folds to `cancelled`** — a seventh outcome, below `stopped` and above `awaiting_action` — dispatches nothing
further, settles its `done` on the first cancel, and refuses a resume. **What had to change** was the listener (one
event), four unions, the fold's precedence, one driver flag and one refusal reason (ADR 0094), and two pool options a
type may now declare. **What it did not do** is cancel anything: the library still has no call that cancels, and a
cancel's `done` settles before the run's other tasks stop — both P34's.

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W157 moves no L1-L5 assertion | **CONFIRMED** | 58 / 1635 unmoved in all three runtimes (W157 M6 and its Record) |
| 2 | at least one L6 row moves, and it is a TIMING row | **FALSIFIED** | no row moved — 2602 / 168 in 4 node and 3 deno runs at W157's declaration step and in its gates; **Q599's three rows did not flake in any P33 run**, W160's author and readers included (below) |
| 3 | `resource.unblocked`'s new `'cancelled'` reason reaches no assertion | **TRUE through W159, OVERTAKEN at W160** — W160's queued run asserts `resource.unblocked:cancelled` (W160's conformity F2). The half *`src/` switches on no reason* stays true | W160 Out; `examples/l6.ts`'s queued run |
| 4 | W158's break is LOUD where a type constrains the result, silent where a consumer compares a string | **CONFIRMED in shape, wrong about what the silent half is** — LOUD at one site (a test fake's `settle(state)`, `typecheck`); SILENT at three assertions COUNTING the driver's subscriptions, a suite census, two driver-field ratchets, two comments and a snippet floor. No silent site compared a string | W158 M2-M5 and *What broke* 1 |

**Questions**: raised **Q605** and **Q606** (W158), both open, owner P34; **closed Q174** (W157, resolved by `D9`); Q3's
answer moved to the new pin. Q18 stays P34's. `npm run q -- --where status=open` lists **Q580, Q581, Q605, Q606**.

**Handed on**, each with its owner — gathered from the four items' Out sections and the readers' notes:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| a re-entrant halt does not shut a fan-out's dispatch loop or `resolve()`'s routing | W158 C-F1 / A-F2 | **P34** | [Q605](../questions/q605.md) |
| the runtime's RELEASE of a cancelled run (ADR 0091), and a no-worker `done` case | W158 C-F7b / A-F3 | **P34** | [Q606](../questions/q606.md); its L6 `done` half met by W160 (dated note in the file) |
| the cancel road BEFORE a thread picks the task up (`task.cancelling` with no `task.running`) | W160 A-F9 | **P34** | [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), *Constraints*, by (h) |
| a cancel during a retry BACKOFF | W160 A-F9 | **P34** | [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), *Constraints*, by (h) |
| stale doc comments: `src/scheduler/envelope-worker.ts:346` (*"`{ settings, input }` and nothing else"*), `src/scheduler/runtime.ts:285` (`done`'s outcomes) and `:331` (`resume`'s refusals, omitting `cancelled`) | W158 Out, W159 C-F5, W160 Out | **P34**, whose cancel lives on the runtime | [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), *Constraints*, by (h) |
| `residentGroups` handed on AS DECLARED on the document road — a pre-existing alias | W159 C-F3 / A-F7 | **P37**, which amends the pool options (#19) — W159 named no owner | [P37's draft](p37-a-runtime-is-its-registry.md), *Constraints*, by (h) |
| `graceMs: 0` on a threaded pool: node reads `forced: false` with the abort arriving, deno `forced: true` | W160 A-F8 | **P34**, to MEASURE at its declaration, writing an S entry if it reproduces | (g) NO S entry now; [P34's draft](p34-what-cancelling-stopping-and-pausing-a-run-do.md), *Constraints*, by (h) |
| `messages.flushIntervalMs: 1e300` admitted by the scheduler and by us, and `setTimeout` clamps it to 1 ms | W159 A-F9 | **P37**, to BOUND in `poolSpecProblem` | (g) NO S entry now; [P37's draft](p37-a-runtime-is-its-registry.md), *Constraints*, by (h) |
| `CLAUDE.md`'s *"Until P33's W158 the listener DROPS a cancelled task … so nothing here calls it"* | W160 Out | **this retro** | corrected at the record step (section 7) |

## Retro

*Pass 3 ran on 2026-10-15 over `0fcccca`, the working tree clean before it, in a subagent at the maintainer's request.
Every figure is read from the four items' Records; this retro re-ran no gate, no harness and no measurement. **The
proposals were put to the maintainer in section 8, and the answers are recorded there; none moves a rule in
`doc/workflow.md`.***

### 1. The asks — every one answered YES

| item | widenings (rule 6), each answered | design, each answered | reader items | raised / closed |
|---|---|---|---|---|
| P33's declaration | — | (a)-(e), all as recommended, (d) with the stop clause | — | — |
| W157 | E1 `AGENTS.md` §11, E2 `run-flow.ts` citation, E3 `CLAUDE.md`, E3+ two `CLAUDE.md` bullets, E5 `AGENTS.md` §18, E6 a `check-docs.mjs` comment, E7 a `check-budget` self-test probe — YES | (1) no `deno.json` key; (4) the pin's number only where it resolves; (7)'s Q174 half | 16 | — / Q174 |
| W158 | E1 `LATE_SUITES`, E2 `runtime.test.ts`'s subscription counts, E3 L6's `DRIVER_FIELDS`, E4 a `run-flow.ts` comment, E5 `RUN_FLOOR` — YES | the re-entrant doors to P34 | 14 | Q605, Q606 / — |
| W159 | E1 `spec/README.md`'s row, E2 `LATE_SUITES` — YES | — | 14 | — |
| W160 | E1 `examples/README.md`'s `X10` copies, E2 `AGENTS.md` §12 — YES | — | R1-R7 | — |
| **P33** | **16, 16 YES, 0 NO** | **9** | | **2 raised, 1 closed** |

**Rule 6's NO branch has still not run** — the fourth plan running (P31 ten of ten, P32 eleven of eleven, P33 sixteen of
sixteen). **Sixteen is the most widenings any plan has recorded**, in four items.

### 2. The recurring class — the plan's `Owns` missed the same sites

| class | the exceptions | found |
|---|---|---|
| a suite census, `test/definition/l4-corpus.test.ts` `LATE_SUITES` | W158 E1, W159 E2 | declaration step |
| `spec/README.md`'s version row (`C8`) — owned by W157's and W158's rows, not W159's | W159 E1 | declaration step |
| `examples/README.md`'s L6 counts (`X10`) | W160 E1 | declaration step |
| `AGENTS.md` sections outside the item's own | W157 E1, E5; W160 E2 | declaration step |
| a ratchet or a count in a test or L6 | W158 E2, E3 | declaration step |
| **a floor or a fixture only a SELF-TEST reads** | **W157 E7** (`check:budget:selftest`'s `B7` probe), **W158 E5** (`RUN_FLOOR`, `check:docs:selftest`) | **the first `gate:item`, RED** |
| stale prose or a comment | W157 E2, E3, W158 E4 (declaration); **W157 E3+, E6** (the readers) | mixed |

**P32-retro sentence B was FOLLOWED and it worked for every lane** — twelve of sixteen sites found in the byte copy before
`Owns` was written (P32: late sites three, two, zero). **It did not work for the two floors only a self-test reads**,
because B's copy runs `npm run gate` and `gate` runs no self-test — W158's *What this taught* says exactly that. **Two
occurrences, two items** (pass 3 rule 2): proposal B′ below. *The two prose sites the readers found are the class the
refusal ledger's first row covers.*

**Sentence C was FOLLOWED and held**: each item ran `npm run gate` before its readers and one confirming gate after them.
**Two of the four confirming gates went RED first**, both on B's gap above, and were paid twice — W157 868.7 s and W158
787.5 s on the green run. *A self-test red inside a confirming gate: 2*, after three plans at 0. C's own pricing named this
cost (*"a self-test red is a check's, not the product's"*).

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W157 | F1-F9 | A1-A7 | **1** | 90th |
| W158 | F1-F7 | F1-F7 | **2** | 91st |
| W159 | F1-F5 | F1-F9 | **2** | 92nd |
| W160 | F1-F4, no defect | F1-F9, no defect | **2** | 93rd |

**All four inside the 0-4 band. The ordinal is now NINETY-THREE and the next measurement is the NINETY-FOURTH**; the
band's *fifty-nine* stays, as P28's-P32's retros held it. **The readers are the mechanism for the eighth plan running**:
W158's re-entrant doors (Q605) were a CONSTRUCTION no mutation of the item's code could reach; W159's *"a non-object is
refused"* was false in prose and found by both; W160's declared control could not fail where its claim was vacuous,
found by both, after the author's eleven provocations passed it.

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) B's census misses a self-test floor** (W157 E7, W158 E5) | FOLLOWED | the first `gate:item` | **two occurrences — proposal B′** |
| **(b) a control cut from the claim's own input** (W160: the checkpoint cut before any settlement) | FOLLOWED section 5 rule 8 (d)'s v0.21 and v0.22 clauses — and missed | both readers | **No change**: one occurrence, and the clause already says it (*a control must fail where its claim is VACUOUS*); W160's *What this taught* is the reading |
| **(c) a claim read too late to see its own failure** (W160 R1, R2) | — no rule speaks to it | the adequacy reader, by mutation | **No change**: one occurrence; rule 8 (c) PROVENANCE is the nearest clause |
| **(d) a measurement generalised from one arrangement** (W157 M14, `shutdown()` and a backoff) | BROKEN — section 1 rule 5's *write* direction | the conformity reader | **No change**: the rule exists |
| **(e) stale prose a correct change makes false** (`CLAUDE.md`'s fact; `runtime.ts`, `envelope-worker.ts` comments; W157 F3, F6) | — | readers, the next item, this retro | **No change**: the class is the ledger's first row, considered and not proposed (section 6) |

**Pass 3 rule 5 over P33's defects**, by what caught them: **a rung in `gate`** — the censuses (L1, L6, `C8`, `X10`),
`G6` on `D7`'s first form, `B2`/`B3` on concept.md, `typecheck` on W158's fake, `lint` on W160's unused import, chromium's
page error in W159; **a self-test inside a confirming gate** — W157's `B7`, W158's `X4`; **the conformity readers** — 25
findings over four items; **the adequacy readers** — 32; **this retro** — `CLAUDE.md`'s scheduler fact, already named by
W160's Out.

**The flaky rows ([Q599](../questions/q599.md)).** **None went red in any P33 run**: W157's seven declaration runs and its
gates; W160's ten node and nine deno author runs before the readers, the gates and probe controls after, and the
adequacy reader's ~28 node and ~13 deno runs. That is a SAMPLE on a quieter machine — Q599's own caveat — and it falsifies
prediction 2. A dated note is added to Q599; it stays deferred.

### 5. The scheduler observations — not written to `doc/scheduler-upstream.md`

| observation | what we do without it | why not an S entry now |
|---|---|---|
| (a) `cancel(id, { graceMs: 0 })` on a threaded pool: node reads `forced: false` with the abort arriving, deno `forced: true` (W160 A-F8) | nothing in `src/` or L6 passes `graceMs`; W160 asserts `forced: false` only under the default 2000 ms grace | **measured once, by a reader, in scratch, and asserted nowhere** — a written claim nobody re-ran. P34's cancel may pass a grace; it measures this at its declaration step |
| (b) `messages.flushIntervalMs: 1e300` admitted by the scheduler, and `setTimeout` clamps a delay above 2^31-1 to 1 ms — the largest interval flushes fastest (W159 A-F9) | W159's `poolSpecProblem` admits it too; nothing in this repository declares one | **we can refuse it ourselves**, as `poolSpecProblem` already does where the scheduler is silent (W159 choice 3) — P37's pool-option work (#19) |

**An S entry needs an S id, and P33 reserved none.** Both observations satisfy the register's rule — each states what we
do without it — so writing them is a question, put as stop-and-ask (g).

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE.** Rule 6 did what it was adopted for (section 1); every census a lane reads
was found before its edit (section 2); no rule followed in P33 failed in a way a new WORKFLOW rule would fix.

**B′. Recommended, for the NEXT plan's declaration, not the workflow: sentence B, amended** — *an item that adds a node, a
field, a suite, a module, a snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its
`Owns` — and, where the change adds or removes an executed snippet or moves the size of an always-read document, the
self-test that reads that floor (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **Replaces**: P32-retro sentence B in P34's declaration.
- **Saves**: the two RED confirming gates of section 2 — each a full `gate:item` repaid — for one self-test lane in the
  copy, run only when the change is of that kind.
- **Would no longer catch**: nothing; the confirming gate still runs every self-test.

**C. Recommended, carried UNCHANGED into the next plan's declaration**: *an item runs `npm run gate` (the ladder) before
its readers, and its confirming gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items,
on the final tree.* It held in all four items (section 2).

**D. Recommended, for the NEXT plan's AUTHOR, not the workflow: the plan's index row names, for each item, the census
sites its kind of change moves** — from section 2's table: a new suite → `test/definition/l4-corpus.test.ts`; a spec
version → `spec/README.md`'s row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed snippet →
`scripts/check-docs.mjs`'s `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and `test/driver/retention.test.ts`'s
`DRIVER_FIELDS`; a fact `AGENTS.md` states → **the whole of `AGENTS.md`**, not the item's own sections.
- **Saves**: about half of P33's sixteen asks, each a maintainer's YES the serial plan waited for.
- **Ledger**: kin to *an `Owns` pre-declaration rule*, refused 14 times on the ground that a rung finds the late file
  before its edit — **which held again: every one of the sixteen was found before its edit.** So D is a list in the
  author's hands, enforced by nothing; **as a rule or a check it would be that row's fifteenth refusal**, and this retro
  does not propose it as one.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it would be the 32nd refusal, P2-P33.** Section 4 (e) is the class:
  `CLAUDE.md`'s fact, three source comments and W157's two reader-found prose sites, each made false by a correct change.
  The row's standing ground holds. **No other ledger row is re-raised**; D is explicitly not the `Owns` row's proposal.

| file | why |
|---|---|
| this plan | the Status line; Q174, Q605 and Q606 into *Open questions this plan carries*; this Record and Retro |
| `CLAUDE.md` | the one scheduler fact W160's Out named — *"Until P33's W158 the listener DROPS a cancelled task and its run never ends, so nothing here calls it"* — corrected to what is true: a cancelled task ends its run, `src/` calls no `cancel`, ladder L6 does. A false fact fixed; no status (ADR 0077) |
| `doc/questions/q606.md` | a dated note: its L6 clause (*W160's L6 cancel rows await `done`*) is met; the runtime half stays P34's |
| `doc/questions/q599.md` | a dated note: P33's runs, none red |
| `README.md` | one row in *More examples*: a task cancelled by its id, `AGENTS.md` section 6 |
| `doc/workflow.md` | the bookkeeping below, and nothing else |

**The bookkeeping made in `doc/workflow.md`** (P32's precedent: no new version): the Status line, *THIRTY-THREE times, by
P1 through P33*; section 6, *ninety-three, so the next is the NINETY-FOURTH*; the refusal ledger's first row, *32 times,
P2-P33*. **P33 does NOT join the Status line's *adopted nothing* list** — the maintainer's answer to (i), section 8.

**Ids.**

- **Issued**: W157, W158, W159, W160; ADR 0094; Q605 and Q606.
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W161 CLOSED unissued, as the declaration expected;
  - Q600-Q604 SPENT (W157's), Q607-Q609 SPENT (W158's), Q610-Q612 SPENT (W159's), Q613-Q614 SPENT (W160's). None exists
    in the tree;
  - ADR 0095 SKIPPED — no item needed a second decision.

**The next plan starts at W162, Q615 and ADR 0096.**

*`npm run state` before this section printed the tree's W161 / Q607 / ADR 0095 against the ledger's W157 / Q600 /
ADR 0094, the ledger being P32's sentence. The tree's maximum is wrong exactly here, because P33 closed W161, Q607-Q614
and ADR 0095 unissued (P32's precedent for W156 and ADR 0093). If the maintainer's answer to (g) takes an id, it is an
S id, which this sentence does not carry.*

### 8. Stop-and-asks for the maintainer

| | the question | recommended | the alternative |
|---|---|---|---|
| **(f)** | proposals A, B′, C and D (section 6) | **A, B′, C and D** — B′, C and D as sentences in P34's declaration, no workflow edit | any subset; B′ as a workflow rule would amend section 4's *pay once* paragraph |
| **(g)** | do the two scheduler observations (section 5) become S entries now? | **NO S entry for either now**: (a) goes to P34 to MEASURE at its declaration step — it writes S11 then, reserving the id, if it reproduces; (b) goes to P37, which bounds `flushIntervalMs` in `poolSpecProblem` and decides whether a want remains | write S11 and S12 now, NOT RAISED, on S10's form — this retro would take two S ids no plan reserved, and (a) would rest on one reader's scratch run |
| **(h)** | the hand-offs of the Record's table that no register file carries. **Exact edits**: P34's draft, *Constraints found by the 2026-10-14 evaluation*, gains four bullets — **the cancel road before a thread picks the task up** (`task.cancelling` with no `task.running`, the scheduler's reference section 6) and **a cancel during a retry backoff**, each a row P34's L2 or L6 exercises (W160 A-F9); **the stale comments** `src/scheduler/envelope-worker.ts:346`, `src/scheduler/runtime.ts:285` and `:331` (W158 Out, W159 C-F5); **`graceMs: 0`'s runtime difference**, measured at declaration (W160 A-F8) — and its *Open questions* table gains Q605 and Q606, owner P34. P37's draft, *Constraints*, gains two — **`residentGroups` aliased on the document road** (W159 C-F3 / A-F7) and **`flushIntervalMs` above 2^31-1** (W159 A-F9) | **YES, those edits and nothing else** — `doc/plans/p34-*` and `p37-*` are outside this retro's files, so it does not make them | leave them in this Record alone, where P34's and P37's authors must find them |
| **(i)** | P33 onto `doc/workflow.md`'s *adopted nothing* list | **YES, if (f) is answered as recommended** — B′, C and D move no rule (P31 section 10's reading of that list) | no — if any proposal becomes a rule, the version index takes v0.31 instead |

**The maintainer's answer, 2026-10-15: *"as recommended"* — and (i) answered NO.**

- **(f) YES — A, B′, C and D.** **A**: no change to any rule in `doc/workflow.md`; v0.30 stands and takes no index
  entry. **B′, C and D are ADOPTED FOR THE NEXT PLAN'S DECLARATION, not as rules** — *the author of P34 copies all three
  into its declaration*, as P33 copied P32's B and C:
  - **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
    snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the
    change adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads
    that floor (`check:docs:selftest`, `check:budget:selftest`) as well* (section 2; it replaces P32's B).
  - **C — one confirming gate per item**, unchanged: *an item runs `npm run gate` (the ladder) before its readers, and
    its confirming gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final
    tree.*
  - **D — the census sites in the plan's row**, a note for the plan's AUTHOR and not a rule: *the plan's index row
    names, for each item, the census sites its kind of change moves — a new suite → `test/definition/l4-corpus.test.ts`;
    a spec version → `spec/README.md`'s row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed
    snippet → `scripts/check-docs.mjs`'s `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and
    `test/driver/retention.test.ts`'s `DRIVER_FIELDS`; a fact `AGENTS.md` states → the whole of `AGENTS.md`.* Enforced
    by nothing; not the `Owns` row's proposal.
- **(g) NO S entries now.** The `graceMs: 0` difference goes to **P34**, to MEASURE at its declaration and to write an
  S entry if it reproduces; the `flushIntervalMs` clamp goes to **P37**, to BOUND in `poolSpecProblem`. Both are in the
  Record's hand-off table with those owners. `doc/scheduler-upstream.md` is unedited.
- **(h) YES** — the four rows in P34's draft (*Constraints*) and its two question rows (Q605, Q606), and the two rows in
  P37's draft (*Constraints*), the second being (g)'s `flushIntervalMs` bound. Made at this record step.
- **(i) NO** — P33 adopted B′ and D, so it does not go on the Status line's *adopted nothing* list. **The maintainer's
  reading differs from P31 section 10's**, under which declaration sentences moved no rule and P32 joined the list; it
  is recorded as given, and `doc/workflow.md`'s Status line keeps its six names.
