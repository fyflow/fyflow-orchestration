# P34 — What do cancelling, stopping and pausing a run do?

**Status:** complete and retro'd 2026-10-17 — declared 2026-10-16 on `985efe6`, from the draft carrying the maintainer's decisions 1-7 of 2026-10-14/15 and the hand-offs of P33's Record and P37's retro (g)-(k); facts 1-12 measured at this declaration; stop-and-asks (a)-(j) ANSWERED by the maintainer 2026-10-16, all as recommended; W169-W176 done 2026-10-16/17; the exit artifact met on W176's final tree, `gate:full` EXIT 0 (Record below); the retro ran 2026-10-17 over `d67138f`, and the maintainer answered its stop-and-asks (k)-(r) the same day, all as recommended (Retro section 8)
**Question this plan answers:** *what does a run do when its owner cancels it, stops it to resume it
elsewhere, or pauses it — and what does each leave in the log?*
**Exit artifact:** *on the final tree, one cross-row block in `examples/l6.ts`, green in node 24 and in deno, in which:
(1) a run is CANCELLED through the call (b) and (c) settle while two of its tasks RUN on a threaded pool — one honouring
its signal, one not — and a third is QUEUED behind a held group: its fold reads the cancel (c)'s answer names from the
request on, nothing is dispatched or routed after it, `done` settles `cancelled` only after the LAST `task.cancelled`,
equal to the caller's fold, a second cancel with `graceMs: 0` escalates the one that did not stop, and a resume of its
checkpoint is refused `cancelled`; (2) a run is STOPPED on runtime A while two tasks run and a sibling run on A is left
untouched: A's `done` for it settles as (d) answers after its tasks have stopped, the sibling completes, and the
checkpoint resumes on a FRESH runtime B, re-dispatching exactly the in-flight tasks at the same ids, to `completed`;
(3) a run PARKED at `user_action` is stopped: its `resolve()` is refused on A and its `done` settles; (4) a run is
PAUSED mid-fan-out — the running tasks finish, nothing is handed to the scheduler while it is paused — and UNPAUSED, to
`completed`; (5) a cancel BEFORE a thread picks its task up, and one during a retry BACKOFF, each folding as fact 8
says; (6) a transforming ENTRY node started on Q633's road as (a) answers; (7) a registry naming a built-in
`KeyedRateLimitGroup` in a pool's `residentGroups` refused by `createRuntime`, naming the pool and the group; and
`npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W169-W177 (W177 expected unused), Q635-Q659, ADR 0101-0107 (ADR 0107 expected unused); S12 (fact 9 — see (g))

```
Question: what does a run do when its owner cancels it, stops it to resume it elsewhere, or pauses it?
Items:    W169 (Q619 option B, and P37's six stale sites), W170 (Q633 — the road (a) answers; ADR 0101),
          W171 (today's stopped renamed — ADR 0102), W172 (the dispatch hold, and Q605 — ADR 0103),
          W173 (cancelling a run — ADR 0104; concept section 7; Q18, Q606), W174 (stopping a run to resume it
          elsewhere — ADR 0105), W175 (pausing a run — ADR 0106), W176 (the exit artifact, on real workers in
          both runtimes)
Reserves: W169-W177 (W177 expected unused), Q635-Q659, ADR 0101-0107 (ADR 0107 expected unused), S12
Raises:   no question; S12 WRITTEN, NOT RAISED (fact 9, (g)) in doc/scheduler-upstream.md
Baseline: ids derived by `npm run state` at this declaration — P38, W169, Q635, ADR 0101 from the tree,
          W169, Q635, ADR 0101 from the ledger (P37's Retro), which AGREE. The ladder counts are NOT
          taken here and are W169's declaration step's
Measured: 2026-10-16 in a byte copy of `985efe6` at C:/tmp-p34/tree, its `node_modules` copied, never
          linked, scanned for links (none); node 24.20.0 and deno 2.9.6. The copy is left in place
```

## Why this plan, and why now

fyflow-app's pass 1 (P33's *Why* cites the document) asks for three kinds of run control: **#1 a
user's cancel** (P1 — the app fakes it today, its ADR-0013), **#18 stopping one run on a runtime**
(P2, M2 — the app's Upgrade and *Stop them and continue* need it, its ADR-0015), and **#14 pause**
(P3). `fyflow-scheduler` 0.6.0 shipped the means — `scheduler.cancel(id, { reason, graceMs })` —
and [P33](p33-what-a-run-does-when-a-task-ends-cancelled.md) makes a cancel the driver did not
request fold. This plan builds the ones it DOES request.

**And it carries the two defects that must land before 0.8.0 is published** — [Q633](../questions/q633.md) (P37's retro
(g)) and [Q619](../questions/q619.md) (its (i)) — because both are fixed in files this plan edits anyway, in the same
BREAKING release.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **Run control is in** — cancel, stop and pause leave `doc/concept.md` section 7's non-goals; that
   amendment is this plan's, and it reopens [Q18](../questions/q18.md) (both deferral triggers met).
2. **Today's `stopped` is RENAMED** — it is the driver's halt on a defect (`failRun`), terminal and
   refused by a resume (RN-R23). *Stop* then names only #18's resumable stop. `halted` is the working
   name. **The rename takes `'stopped'` out of `RunOutcome` and `ResumeRefusalReason` entirely**, so a
   consumer's comparison fails to compile rather than silently changing meaning — fyflow-app's
   ADR-0014 keys on *"a stopped run"*.
3. **A stop goes DEAF before it cancels** (P33 decision 4): the driver's existing `deaf` flag is set,
   then each in-flight task is cancelled, so no `task.cancelled` of a stop is appended, the log ends
   with those tasks dispatched and unsettled, and a resume re-dispatches them at the same ids (RN-R21).
   Building and testing that ORDER is this plan's.
4. **A cancel is recorded by the driver BEFORE it cancels** — its own fold input — and the
   `task.cancelled` settlements fold under it; the run ends `cancelled` (P33 decisions 3-4) and is
   not resumable.
5. **All three share one mechanism**: the dispatch hold, which exists today for replay only.
6. **Everything ships in orchestration 0.8.0**, published once after the last of P34-P37 (P33 *Why*
   decision 1, which says *after P37* because P37 was then the last).
7. **The order is P37, P34, P35, P36** (maintainer, 2026-10-15). P37 runs first because it needs
   nothing of this plan's run control, and the app's workarounds it removes (#6, #20) get worse at
   its M2. P35 and P36 build on this plan's dispatch hold and stop.

## What fyflow-app asked, held against this declaration

| ask | item | where it is answered |
|---|---|---|
| `driver.cancel({ actor, reason, graceMs? })`: hold dispatches, cancel each queued and running task, record a `cancelled` fold input | #1 | W173; the call's home is (b), its shape (c) |
| `done` settles **once the tasks have stopped** — P33 settles it on the first cancel | #1 | (c), W173 — fact 6 |
| a run is visibly *cancelling* between request and stop (`task.cancelling` → `task.cancelled`) | #1 | (c), W173 |
| a second cancel with a shorter `graceMs` escalates, as the scheduler's does | #1 | (c), W173 |
| parked tasks end without a Resolve | #1 | P33 decision 3 already; W173 keeps it under the cancel element |
| stop one run without touching the runtime's others; `done` settles as stopped; the log stays a valid checkpoint to resume ELSEWHERE | #18 | (d), W174 — facts 4 and 7 |
| does a stopped attempt count as spent? (the app would count it) | #18 | **Out** → [P36](p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) |
| `driver.pause()` / `driver.unpause()`, both recorded; running tasks finish | #14 | (e), W175 — fact 3 |

## Handed on, and copied here as the retros direct

*From [P33](p33-what-a-run-does-when-a-task-ends-cancelled.md)'s Record, by the maintainer's answer to its retro's
stop-and-ask (h), 2026-10-15* — each re-taken as a fact below:

- **The cancel road BEFORE a thread picks the task up** — `task.cancelling` with no `task.running` — exercised by no
  rung; a row at L2 or L6 here (W160's adequacy F9). **Fact 8; W173 at L2, W176 at L6.**
- **A cancel during a retry BACKOFF** — exercised by no rung (W160's adequacy F9). **Fact 8; W173 at L2, W176 at L6.**
- **Three stale doc comments** (W158's Out, W159's conformity F5). **Fact 12; W171**, which rewrites the sentences they
  sit in.
- **`cancel(id, { graceMs: 0 })` on a threaded pool** (W160's adequacy F8). **Fact 9; (g).**

*From [P37](p37-a-runtime-is-its-registry.md)'s retro, by the maintainer's answer to its stop-and-asks (g), (i), (j)
and (k), 2026-10-16:*

- **[Q633](../questions/q633.md)** — a DEFECT, before 0.8.0 (g). **Fact 10; the road is (a); W170.**
- **[Q619](../questions/q619.md) option B** — ONE ROW (i). **Fact 11; W169.**
- **The six stale sites** (j). **Fact 12; W169.**
- **B′, C, D′ and E** (k) — copied into *Work items* below.

## Facts measured at this declaration

On `985efe6`, the scheduler read at the pin from `node_modules/fyflow-scheduler` (its `AGENTS.md` and `dist/`) and
nowhere else. Each fact's command is a script in `C:/tmp-p34/` run under node 24.20.0 and, where stated, deno 2.9.6.

**Fact 1 — [Q605](../questions/q605.md)'s two doors leak today, for a cancel AND for a halt, exactly as raised.**
`C:/tmp-p34/tree/scratch-me/q605-doors.ts`, identical in node and deno: a fan-out of three branches (`a` → `a2`, `b`,
`c`) over L2's fake scheduler, the halt raised from a consumer's `onFoldInput` — a `task.cancelled` (a cancel of a
WAITING task fires it inside the call, fact 8), or a settlement for an id the run never dispatched (`UndispatchedTask`
→ `failRun`).

| door | halt | after the halt |
|---|---|---|
| (a) on branch `a`'s `dispatched` element | none (control) | `a`, `b`, `c` handed to the scheduler — `running` |
| | cancel | **`b` and `c` still handed to the scheduler** — the fold reads `cancelled` |
| | refusal | **`b` and `c` still handed to the scheduler** — the fold reads `stopped` |
| (b) on `resolve(a)`'s `resolution` element | none (control) | `branch.resumed` emitted, `a2` handed on — `running` |
| | cancel | **`branch.resumed` emitted and `a2` handed on** — `cancelled` |
| | refusal | **`branch.resumed` emitted and `a2` handed on** — `stopped` |

**Where a hold can sit** (`src/driver/driver.ts`): `addTask` is called at exactly two places — `dispatch()`'s last line
(`:3189`, after the replay's hold at `:3185-3188`) and `resume()`'s re-dispatch (`:1658`); `dispatch` has one caller,
`enter` (`:2303`). Door (a) is `enter` called per branch at `:2372-2373` (a `map`'s instances, the same shape, at
`:2473-2474`); door (b) is `appendResolution` (`:1809`, emitting `branch.resumed` at `:1861`) then `advance` (`:1843`).
**A hold checked inside `dispatch()` stops a later branch's `addTask` and nothing else**: the `dispatched` append
(`:3130`) precedes it, and `enter`'s other appends and emits — `regionEntered`, a nested region's `branch.opened`, a
gate's `gated`, `pathEnded`, `settleJoin` — and door (b)'s `branch.resumed` are not behind it. **Q605's `closes-when`
asks that nothing be dispatched, routed OR emitted**, so the hold is re-checked at `enter`'s head and between
`appendResolution` and `advance`, not only at `dispatch`.

**Fact 2 — the halt flags are three, and `failRun`'s doors are `failed`'s.** `failed` (`:1240`), `cancelled`
(`:1251`, W158) and `deaf` (`:1259`, set only by a resume that regenerated a halt, `:1640`); `onEvent` returns early on
`deaf` (`:1874`), `settle` returns after its append on `failed || cancelled` (`:2075`), `resolve` refuses on the same
(`:1788`). **Nothing is held for a pause today, and no method of `Driver`'s prototype names cancel, stop, pause, halt or
hold** (`C:/tmp-p34/tree/scratch-me/stop-parked.ts`).

**Fact 3 — a held dispatch must be APPENDED, or the fold calls the run finished.** `C:/tmp-p34/tree/scratch-me/held-fold.ts`:
for `x` → `y`, the sequence `dispatched x`, `outcome x done` folds **`completed`**; with `dispatched y` appended and the
task not yet handed on, it folds **`running`**. So a pause holds as the replay does — the element appended, the
`createTask` call and `addTask` deferred (`:3182-3188`) — and the held tasks are IN FLIGHT under `RN-R21`, which is
what a stop of a paused run must re-dispatch on the next runtime (e).

**Fact 4 — a run can be live with NOTHING in flight, and only one way: parked.** The driver routes synchronously inside
the settlement's listener (`driver.ts:3163-3166`: *"the driver dispatches inside a listener with no `await`"*), so at
rest a non-terminal run has a task in flight or a task at `user_action` — there is no "between tasks". **The parked
case, measured** (`stop-parked.ts`): `x` → `y`, `x` settled `user_action` — outcome `awaiting_action`, `isTerminal`
`false`, in flight `[]`; `resolve('r1:x:-:0', 'done', …)` on the same driver hands `r1:y:-:0` to the scheduler. **So a
stop that only cancels what is in flight stops nothing here**, and the app's ADR-0015 hole is exactly `resolve()` on
the old runtime: a stop must refuse it, as a halt and a cancel do (`:1788`), and settle a `done` that `awaiting_action`
never would (ADR 0091 rule 3).

**Fact 5 — `SchedulerLike` is two methods, and widening it is a census.** `driver.ts:836-839` (`addTask`,
`addEventListener`), with the L0 assertion that a real `FyflowScheduler` satisfies it at `:849`. **Hand-written fakes**:
27 classes in 26 files (24 under `test/driver/`, `test/definition/schema.test.ts:581`, `test/fold/result-value.test.ts`,
`test/matrix/run.ts:154`), about 14 object literals (`test/driver/gate.test.ts:475`, `:936`; `boundary.test.ts:204`;
`driver.test.ts:676`; `lifetime.test.ts:698`, `:735`; `test/scheduler/checkpoint.test.ts:44`, `resume.test.ts:55`,
`runtime.test.ts:97`, `:514`, `:993`, `:2431`, `:2989`; `bootstrap.test.ts:522`), and 4 `AGENTS.md` snippets (`:57`,
`:1048`, `:2326`, `:3857`). **A REQUIRED `cancel` breaks roughly 38 fakes and the 4 snippets** (all but the two cast
`as never`) — a grep estimate, the copy's typecheck is (b)'s item's; **an OPTIONAL one breaks none.** The runtime's
per-run view (`settlementRouter.forRun`, `src/scheduler/runtime.ts:878-892`) builds `addTask` and `addEventListener`
only, so either road forwards a `cancel` there; `Runtime.scheduler` is the real `FyflowScheduler` (`:337`).

**Fact 6 — `done` settles on terminality alone, and a cancel's settles at the FIRST cancel.** `settleIfTerminal`
(`runtime.ts:742-747`) is the only settle path and releases the run as it settles (ADR 0091 rule 1, `:746`); `isTerminal`
is `outcome !== 'running' && outcome !== 'awaiting_action'` (`src/fold/run-state.ts:556-557`). W158 made the first
`cancelled` settlement the run's outcome (`withOutcome`, `:444` on), so `done` settles there, the router RELEASES the
driver, and every later `task.cancelled` of that run goes nowhere (ADR 0094 consequence 7, ADR 0088 rule 4) — which is
the app's *"`done` settles before the others have stopped"*. **[Q606](../questions/q606.md)'s runtime half is still
open**: `test/scheduler/runtime.test.ts:2874`'s *"rule 1 on every door and outcome"* has two rows, `failed` and a resumed
run, and no `cancelled` row; `task.cancelled` appears under `test/scheduler/**` only as a subscription assertion
(`:2500-2502`) and in `envelope-worker.test.ts`'s direct cancel.

**Fact 7 — the rename's census, and a stored `'stopped'` is persisted.** The halt is named in `src/` by the
`RunOutcome` literal (`run-state.ts:43-44`), the fold input `{ kind: 'stopped'; reason }` (`:235`), `RunState.stoppedBy`
(`:114`, `:268`), `step`'s arm (`:277-278`), `withOutcome`'s `RN-R8` (`:444`), `ResumeRefusalReason` (`driver.ts:316`, its
table `:308`), `resumeRefusal`'s scan and message (`:388-393`), `resume()`'s regenerated-halt refusal (`:1637-1645`),
`failRun`'s append (`:1917`), two comments in `src/driver/listener.ts` (`:34`, `:106`) and `runtime.ts:286`, `:693`;
`index.ts` re-exports all of it (`export *`). `isTerminal` names none. **Literal counts**:

| where | `'stopped'` | `stoppedBy` | `kind: 'stopped'` |
|---|---|---|---|
| `src/` (four files) | 12 | 8 | 2 |
| `test/**` | 54 in 15 files | 36 in 15 files | 9 in 6 files |
| `examples/l6.ts` / `run-flow.ts` / `README.md` | 5 / 1 / 0 | 42 / 0 / 2 | 0 / 1 / 0 |
| `AGENTS.md` | 5 | 5 | 1 |
| `scripts/run-browser-tests.mjs` | 0 | 2 | 0 |

The bare word `stopped` — any meaning, unclassified — is in 35 test files, `examples/l6.ts` (47), `run-flow.ts` (11),
five script self-tests (`check-markdown-selftest` 8; `check-spec`, `check-source`, `check-register`, `check-policies`
3 each), `spec/run-state.md` (16: `RN-R8`, `RN-R12`, `RN-R23`, `RN-R25`, `RN-R28` among them), `spec/flow-definition.md`
(10), `join-policy.md` (5), `task-id.md` (4), `outcome-record.md` (2, `OR-R10` the halt rule), `spec/README.md` (2),
`README.md` (1), and `AGENTS.md` (43: sections 8, 9 and 10 carry 26). **The kind is PERSISTED**: `CHECKPOINT_FORMAT` is
`1` (`driver.ts:249`) and a checkpoint is the whole event sequence (ADR 0064). Renamed with no other change, an OLD
stored `'stopped'` element is (i) not found by `resumeRefusal`; (ii) not fed by the replay (`isFed`, `:432-433`, feeds
outcomes, resolutions and `resumed`), so the regenerated `'halted'` is compared with it by `sameData` (`:3432`) and the
resume is refused **`diverged`** rather than as a halt; and (iii) **`fold` THROWS on it** — `step` falls through to
`parseTaskId(input.record.taskId)` (`run-state.ts:344-345`), a `TypeError` with no `record`. So the kind's rename is a
format bump or a dual read — (f).

**Fact 8 — the scheduler's cancel roads, on real workers, through `createRuntime` and `start`.** Scripts in
`C:/tmp-p34/probes-a/` (`h.ts`, `a2-prepickup.ts`, `a3a4-backoff-queued.ts`), a fresh runtime per run; node through the
copy's `node_modules`, deno through `examples/deno-import-map.json`.

| road | runs | events, in order | the fold and `done` |
|---|---|---|---|
| **PRE-PICKUP** — threaded, cancelled synchronously after `start`, or after a microtask, 0, 2, 5 or 10 ms | **18/18 node, 18/18 deno** | `task.cancelling`, `task.cancelled` — **no `task.running`**; never the waiting road | `[dispatched, outcome cancelled]`, `done` `cancelled`, `forced` `false` |
| the same at 25 ms | node 3/3 pre-pickup; deno 0/3 (the ordinary running road, the worker's message once after `task.cancelling`) | | the same |
| at 50 and 100 ms | every run the ordinary running road | | the same |
| **in a retry BACKOFF** — `{ maxRetries: 1, backoffMs: 3000 }`, cancelled 50 ms after `task.retrying`, inline and threaded | **12/12** (3 per pool mode per runtime) | `task.running`, `task.retrying`, `task.cancelled` — **no `task.cancelling`**; `task.cancelled` fires INSIDE the `cancel()` call, 55-68 ms after `retrying`, the 3 s not waited | `[dispatched, outcome cancelled]` — **the fold saw nothing of the retry**; the scheduler's task `attempts` 1, `attemptNumber` 1 |
| **WAITING** behind a held `ConcurrentLimitGroup(1)`, inline | 3 per runtime | `task.cancelled` alone, **fired inside the `cancel()` call** — the driver had appended the settlement before `cancel()` returned | `done` `cancelled` |
| **PARKED** at `user_action` | 3 per runtime | none — **`cancel()` resolves `false`**, the scheduler's state stays `user_action` | `awaiting_action`, nothing appended |

**So**: a synchronous `cancel()` right after `start()` on a THREADED pool does NOT settle inside the call (the task is on
its way to a thread — the pre-pickup road), while a waiting one DOES (Q605's premise, fact 1); `task.cancelling` is never
appended under any road (`OR-R4`, P33 decision 5); and **the scheduler cannot end a parked task**, so a run-level cancel or
stop ends its parked tasks itself or not at all — (i).

**Fact 9 — `graceMs: 0` on a threaded pool: W160's F8 REPRODUCES, and it is a TIMER RACE in both runtimes, not a
difference between them.** `C:/tmp-p34/probes-a/a1-grace0.ts`: one running task, cancelled one macrotask after the
worker's `started` message, `{ graceMs: 0 }`. `forced: true` runs out of total:

| the worker | node | deno |
|---|---|---|
| **honours** the signal — W160's `waits` worker, F8's setup | **1/20** | **18/20** |
| resolves `run()` at once on abort | 0/10 | 6/20 |
| ignores it (keeps waiting 3 s) | 20/20 | 20/20 |

Every `forced: true` run had the worker's post-abort `emit` DROPPED (the task detached), every `forced: false` honouring
run delivered it; in all of them `cancel()` resolved `true`, `done` settled `cancelled` and the fold was `[dispatched
work, outcome work cancelled]`. Deno, honouring worker, 10 runs each: `graceMs: 1` 7/10 forced, `graceMs: 5` 0/10.
**The cause is one code path in both builds**: `_cancelTask` arms `_armGraceTimer`, a plain `setTimeout(retire, graceMs)`
(`dist/node/index.js:1642-1647`, `:1683-1692`; the JSR source's `workerManager.ts:504`, `:547-557`) — so `0` is a 0 ms
timer racing the worker's reply, which node's 1 ms clamp usually loses and deno's usually wins. **The scheduler's
`AGENTS.md` §5 says *"`0` forces at once"*, and at the pin that is true in neither runtime.** (g).

**Fact 10 — [Q633](../questions/q633.md) reproduces on this tree, identically in node and deno**
(`C:/tmp-p34/probes-a/a5-q633.ts`, W167's probe re-pointed): `{ word: "x" }` — `start()` THROWS `BoundaryRefused`
(*$.label required*), `tryTransform(…, { input })` `transform-passes`; `{ label: "y" }` — `start()` `completed` with the
worker RECEIVING `{}`, `tryTransform` `transform-fails` (*$.label required*). W167's table, unchanged. *(Under deno the
probe ran with `deno.json`'s imports: `examples/deno-import-map.json` names no `jsonata`.)* **What road (1) costs,
counted**: `.start(` is called at 1 site in `src/`, 486 in `test/`, 32 in `examples/`, 7 in `scripts/`,
28 in `AGENTS.md` and 3 in `README.md` — `Driver.start` and `Runtime.start` together, about 557, every one a `RunHandle`
or a `void` today.

**Fact 11 — [Q619](../questions/q619.md) option B has one site and flips one assertion.** The resolver is
`resolveRegistry` (`src/definition/registry.ts:698`): groups resolved at about `:721-737` (`ResolvedGroup.type` the type
name, `:736`), pools derived after (`:779-790`), a pool's resident keys read off the DERIVED spec (`:360`, `:505`, `:516`;
`copyResident` `:214`) — so a refusal there, after the pools map, sees a type's pool, a named instance's and a CLASS
derivation's output alike, as a `RegistryError` beside `GroupTypeMissing` (`:72`). The spec's group-types row is
`spec/flow-definition.md:1725` and its `FD-R6` row `:2350` (naming Q619); ADR 0097 rule 1's pointer is its `:55-57`;
`AGENTS.md` mentions the keyed group at `:1457`, `:2102`, `:2109`, `:2570` and `:4201`. **Exactly one assertion flips**:
the resident control at `test/scheduler/runtime.test.ts:3096-3098` (`KEYED_DOC`, `:2942`), a `createRuntime` that will
throw; `test/scheduler/bootstrap.test.ts:498`'s `residentGroups: ['api']` is a `ConcurrentLimitGroup` (`:526`), and no
document under `examples/` or `spec/examples/` holds a keyed group resident.

**Fact 12 — the nine stale sentences, re-taken at their current lines.** P33's three: `src/scheduler/envelope-worker.ts:346`
(*"`FD-C5`: the inner worker receives `{ settings, input }` and nothing else"* — the task context is passed too);
`runtime.ts:284-286` and `:304-305` (`done` *"resolves with … `completed`, `failed`, `stuck` or `stopped`"* — no
`cancelled`); `:365` (*"format, flow id, version, a stopped run"* — no `cancelled`). P37's six: `src/driver/driver.ts:2140`,
`test/driver/result-schema.test.ts:62` and `:309`, `spec/outcome-record.md:325` (`OR-R13`) — each *"thirteen keywords"*,
seventeen since W164; **`src/definition/wiring.ts:187`** (moved from `:155`) — *"`examples` is read by nothing"*, true now
of five; and the `InvalidDefinition` message built twice, `driver.ts:1383` and `runtime.ts:673-677`, both *`definition "…"
is invalid: `*.

## Scope

**In** — `driver.cancel`, a per-run stop, `pause`/`unpause`, each with its fold input and what `done` does (b)-(e);
the dispatch hold every halt shares and Q605's doors (decision 5); the rename (decision 2, (f)); `doc/concept.md`
section 7's amendment and Q18 (decision 1); Q606's runtime half; P33's two unexercised cancel roads at L2 and L6; Q633
(a); Q619 option B; the nine stale sentences; the specs `run-state.md`, `outcome-record.md`, `join-policy.md`,
`flow-definition.md`; `AGENTS.md` section 11's cancellation row made true; S6's status (pause at our layer); S12 per
(g); the exit artifact at L6 in both runtimes.

**Out** — attempts spent by a stop (P36); a deadline on a parked task (#13, P35); cancelling tasks a worker spawned
itself through `context.spawnTask()` (the driver knows only the tasks it dispatched — the scheduler's `AGENTS.md` §7:
cancelling a task does not cancel what it spawned); a cancel or stop across runtimes; the scheduler's own pause (S6
stays unraised unless (e) says otherwise).

## Decisions taken at this declaration

*Each follows from a decision above or a precedent named beside it; what the facts newly force is a stop-and-ask
below.*

8. **One hold, re-checked at three places** — decision 5 and fact 1: `dispatch()` (before its append, so a halted run
   appends no `dispatched`), `enter`'s head (door (a)) and between `appendResolution` and `advance` (door (b)). The
   replay's hold keeps its form (append, defer `addTask`); a halt, a cancel and a stop hold for good, a pause until
   unpause (fact 3). Q605 closes on its own `closes-when`, a case per door per halt. ADR 0103.
9. **A stop refuses `resolve()`** as a halt and a cancel do — fact 4. Whatever (d) answers, a stopped run's parked
   task is resolved on the runtime that resumes it, never on the one that stopped it.
10. **Each changed public surface is stated BREAKING where it changes** — P33 decision 7 and P37 decision 10:
    `RunOutcome`, `ResumeRefusalReason`, `FoldInput`, `RunState` (the rename and the new elements), and `SchedulerLike`
    if (b) widens it. All ship in 0.8.0.
11. **The decisions go to six ADRs** — ADR 0101 Q633's road (a); ADR 0102 the rename (f); ADR 0103 the dispatch hold;
    ADR 0104 cancelling a run (b), (c) — amending ADR 0094 consequences 4 and 7 and ADR 0058 rule 3's reading of
    `done`; ADR 0105 stopping a run (d) — amending ADR 0058 rule 3 and ADR 0091 rule 3; ADR 0106 pausing a run (e).
    `spec/run-state.md` takes the versions for the fold, `spec/outcome-record.md` for the halt (`OR-R10`),
    `spec/flow-definition.md` for `FD-R4` (Q633) and the group-types table (Q619), with `spec/README.md`'s rows moving.
12. **Q619 is option B as the maintainer answered it**, refused in `resolveRegistry` after the pools are derived (fact
    11), so a class derivation's resident keyed group is refused too. No stop-and-ask.

### Stop-and-asks — ANSWERED by the maintainer, 2026-10-16

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **Q633's road** — `FD-R4` holds a TRANSFORMING entry's payload before its transform (fact 10): which of the three? | **yes — answered** — **(2) — a transforming entry's payload is NOT held at `start`**, exactly as a worker declaring no `inputSchema` is not: `FD-R4`'s row says so, and that the value it holds is *what the node RECEIVES*, which for a transforming node is the transform's result and is known only in the worker. **No BREAKING change**; a caller who wants the check before a run calls `tryTransform(…, { input: payload })` on the entry (W166's `given`), which IS the check, asynchronous and by name — *check, then start*, P37's own road. The worker's result and a transform's failure (`TransformFailed`, P17 decision 5) remain the run's checks. W170, ADR 0101 | **(1) an async `start`** — `Driver.start` and `Runtime.start` return promises and evaluate the transform in the main realm first (the engine is already loaded there, P37 fact 2): the one road that HOLDS the value, at ~557 call sites (fact 10), and `FD-R4`'s *thrown at the caller* becomes a rejection; the `RunHandle`'s *header after the first events* timing changes with it. **(3) a separate schema** for what the transform receives — the node's or the type's: a new keyword, a new spec row and a second schema an author must keep beside `inputSchema` |
| **(b)** | **How does a run's cancel reach the scheduler** — `SchedulerLike` is two methods (fact 5) | **yes — answered** — **Widen `SchedulerLike` with an OPTIONAL third member, `cancel?(taskId, options?): Promise<boolean>`**, the scheduler's own signature, so a hand-built driver cancels as a runtime's does and ADR 0001's *the driver is the only thing with side effects* stays true; the runtime's per-run view forwards it. **No fake breaks** (fact 5); a driver asked to cancel or stop over a scheduler WITHOUT one refuses by name, BEFORE recording anything (a `RuntimeError` kin, as `MultipleRuns` is). The `_Q71` L0 assertion keeps a real `FyflowScheduler` satisfying it | **A REQUIRED third member**: one shape, and ~38 fakes and 4 snippets gain a `cancel` (fact 5). **Reach through the runtime only** — `RunHandle.cancel()`, the driver recording the element and returning the ids in flight for the runtime to cancel: `SchedulerLike` untouched, but a driver built by hand cannot cancel its run, and the side effect leaves the driver for the first time |
| **(c)** | **The cancel, end to end**: its call, its element, what the fold reads between request and stop, when `done` settles, a second cancel, and a paused run's held tasks | **yes — answered** — **`driver.cancel({ actor, reason?, graceMs? }): Promise<void>`**, resolving once every task it cancelled has stopped. **In order**: hold (decision 8); append ONE fold input `{ kind: 'cancelRequested', actor, reason }`; then `scheduler.cancel(id, { reason, graceMs })` for each task in flight, and for each task HELD by a pause first `addTask` then `cancel` — it ends with a genuine `task.cancelled`, at once if it waits behind a group, by the pre-pickup road on a free threaded pool (fact 8), so every outcome record is still the scheduler's (ADR 0007). **The fold reads a NEW, non-terminal `RunOutcome` `'cancelling'`** from the element while any dispatched task is unsettled, and **`'cancelled'`** once none is — so **`done` settles after the last `task.cancelled`**, from the fold alone, and the router keeps the run until then (ADR 0091 rule 1 unchanged). The settlements are APPENDED and routed nowhere; a parked task is settled already and the run does not wait on it. **A second call** appends nothing and forwards its `graceMs` to each task still stopping — the scheduler's escalation (*a shorter `graceMs` shortens the wait*). A cancel after a halt or a stop is refused by name; after a cancel, a stop is refused. ADR 0104, W173 | **`done` settles at the request** (P33's today, fact 6): no `cancelling`, and the app's #1 workaround stays. **`done` waits on the scheduler's `cancel()` promises in the RUNTIME** rather than on the fold: no new outcome, but `done` and `fold(foldInputs())` disagree while tasks stop. **Record a second cancel** as its own element: every escalation is in the log, and the fold gains nothing from it |
| **(d)** | **The stop**: where it lives, what it records, the outcome it reads, and how `done` settles for a run that is NOT terminal in its log (ADR 0058 rule 3, ADR 0091 rule 3) | **yes — answered** — **`driver.stop({ actor, reason?, graceMs? }): Promise<void>`, forwarded by `RunHandle.stop()`** — one run, on its driver, touching no sibling. **In order** (decision 3): hold; append ONE fold input `{ kind: 'interrupted', actor, reason }`; set `deaf`; refuse `resolve()` (decision 9); then cancel each task in flight (none for a parked run, fact 4). **The fold reads a new `RunOutcome` `'interrupted'`** from the element — terminal for `isTerminal`, so `done` settles and the runtime releases the run, but NOT refused by `resumeRefusal`: a resume FEEDS the element (as it feeds `resumed`), appends `resumed` naming the in-flight set, and the run reads `running` again. **`done` settles once the stop's cancels have resolved** — the runtime awaits the promise `driver.stop` returns, which is the only road, since a deaf driver appends no settlement. The run id stays in use on the old runtime (ADR 0091 rule 2), so it resumes on a FRESH one — the app's Upgrade. ADR 0105, amending ADR 0058 rule 3 and ADR 0091 rule 3, W174 | **On the RUNTIME** — `runtime.stop(runId)`: the call the app's Upgrade loops over, but a hand-built driver cannot stop. **No element** — the log ends at the last settlement and the fold reads `running` (decision 3 alone): a resume needs nothing new, but `done` would settle a non-terminal state or never, and nothing in the log says the run was stopped. **`done` settles at the element**, before the tasks have stopped: no runtime wait, and the old runtime's tasks may still run while the new one re-runs them |
| **(e)** | **Pause** — what is held, what is recorded, what the fold reads, and what a paused run does under a stop, a cancel and a resume | **yes — answered** — **`driver.pause({ actor })` / `driver.unpause({ actor })`, each appending ONE fold input** (`paused`, `unpaused`); a second pause or an unpause of a running run is refused by name. **While paused, routing continues and every dispatch is HELD as the replay holds** — `dispatched` appended, `addTask` deferred (fact 3) — and running tasks finish and settle. **Unpause hands the held tasks on in dispatch order.** **The fold gains `RunState.paused: boolean`, NOT a `RunOutcome`** — the held tasks read `running`, so the outcome logic is untouched. **A stop of a paused run** re-dispatches the held tasks on the next runtime as in flight (`RN-R21`); a resume FEEDS `paused`/`unpaused`, so a run stopped while paused resumes PAUSED and holds them again. **A cancel of a paused run** releases-and-cancels them ((c)). **S6 is not needed** — pause is ours, the scheduler's queue untouched; its index row says so. ADR 0106, W175 | **Hold BEFORE the append** — a held routing decision not yet in the log: the fold calls a paused run `completed` once its running tasks settle (fact 3), and a stop loses the held work. **A `'paused'` `RunOutcome`**: visible in `outcome`, but precedence against `awaiting_action` and `cancelling` must be decided, and `isTerminal`'s two-value test widens. **Pause by cancelling what is queued** (S6's 0.6.0 note): a queued task's progress is lost and its re-dispatch reuses an id the scheduler has cancelled (a new `FyflowTask`, fact 8) |
| **(f)** | **The rename's final names, and an OLD checkpoint** (fact 7) | **yes — answered** — **`halted` throughout**: `RunOutcome` `'halted'`, the fold input `{ kind: 'halted', reason }`, `RunState.haltedBy`, `ResumeRefusalReason` `'halted'`, `OR-R10`'s and `RN-R8`'s prose. **And a DUAL READ of the old kind, nothing else**: `step` and `resumeRefusal` read a stored `{ kind: 'stopped', reason }` as `halted` (refused `halted`, its position named), the replay treats it as the regenerated halt's equal, and nothing ever WRITES `'stopped'` again — so a 0.7.0 checkpoint of a halted run is still refused for the right reason, and one of a live run still resumes; `CHECKPOINT_FORMAT` stays `1`. **And the new stop's names avoid `stopped` too** ((d)'s `'interrupted'`), or an old halt would read as a resumable stop | **Bump `CHECKPOINT_FORMAT` to `2`**: one reading of `kind`, and every 0.7.0 checkpoint is refused `format` — including the live runs the app's ADR-0014 resumes on start. **Another name** — `aborted`, `failedRun`; or **keep the KIND `'stopped'`** and rename only the outcome and the refusal reason: no checkpoint concern, but the log and the outcome then name one thing two ways |
| **(g)** | **S12** — fact 9 reproduced, as a race: is it RAISED, and what do we do without it? | **yes — answered** — **Written at this declaration, NOT RAISED, on S10's and S11's form** (P33 stop-and-ask (g): *if it reproduces, an S entry*): the ask is that `graceMs: 0` force synchronously, or that §5 say *"after a 0 ms timer, which a prompt worker may beat"*. **What we do without it**: nothing in `src/` passes `graceMs` but a caller's own value (c), so `AGENTS.md` section 11 says `0` is a race and not a guarantee, and W176's escalation clause asserts `cancel()` resolved and `done` settled — never `forced` — at `graceMs: 0`; a test needing a FORCED stop uses a worker that ignores its signal (20/20 in both runtimes) | **Raise it now**, beside S10 and S11 — the first raise since S9, with a measured number in two runtimes and the scheduler's own sentence false. **No entry** — the race is the scheduler's documented timer semantics read literally, and this file is the only record — which CLAUDE.md's *a wish for `fyflow-scheduler` goes in `doc/scheduler-upstream.md`* leaves unmet |
| **(h)** | **Which outcome outranks which** once three new ones exist | **yes — answered** — **`halted` > `cancelled` > `cancelling` > `interrupted` > `awaiting_action` > `running`** (with `stuck`, `failed` and `completed` below as today): a defect never hides (P33 (c)); a cancel outranks a stop because a cancelled run must not read as resumable; `cancelling` and `interrupted` outrank `awaiting_action` because a parked task must not make an ended run read as waiting for a person (P33 (c)'s reasoning) | **`interrupted` above `cancelled`**: a run stopped and then cancelled reads resumable — but (c) refuses a cancel after a stop, so the order only matters for a HAND-WRITTEN log, which is what a fold must still answer |
| **(i)** | **What a cancel and a stop say about each parked task** — the app: *"parked tasks end without a Resolve"* | **yes — answered** — **Nothing per task**: the run-level element is the fact; a parked node stays `suspended` in `nodes` and the outcome says the run ended (P33 decision 3's form). No synthetic outcome record is written for a task the scheduler already settled | **A `resolution` per parked task** with `actor` the canceller and `resolvedAs: 'failed'`: each node then reads ended, but a resolution routes (`RS-R2`), which the hold must then suppress — a resolution that is not one |
| **(j)** | **Does `driver.cancel`/`stop` cancel tasks a WORKER spawned** (`context.spawnTask()`)? | **yes — answered** — **No — Out**, as the draft has it: the driver knows only what it dispatched, and the scheduler's own recipe tells a consumer to track spawned ids from `task.spawn_request` and cancel each. `AGENTS.md` section 11 says so | **Yes**: the driver subscribes `task.spawn_request` for its run and cancels descendants — a fifth event, and spawned ids carry no run id the router can route (ADR 0088) |

**The answer, as given**: *"as recommended"*, to all ten, 2026-10-16. So, as decisions of this plan:
**(a)** road (2) — a transforming entry's payload is not held at `start`; `tryTransform(…, { input })` is the check
before a run (W170, ADR 0101); **(b)** `SchedulerLike` gains an OPTIONAL `cancel?(taskId, options?)`, forwarded by the
runtime's per-run view, and a cancel or stop over a scheduler without one is refused by name before anything is recorded
(W173); **(c)** `driver.cancel({ actor, reason?, graceMs? })` — hold, one `cancelRequested` element, then each task in
flight cancelled and each held task added and cancelled; the fold reads `cancelling` then `cancelled`, so `done` settles
after the last `task.cancelled`; a second call forwards its `graceMs` and appends nothing (W173, ADR 0104); **(d)**
`driver.stop(…)`, forwarded by `RunHandle.stop()` — hold, one `interrupted` element, deaf, `resolve()` refused, then the
cancels; outcome `interrupted`, terminal for `done` and not refused by a resume, which feeds it; `done` settles once the
stop's cancels resolve (W174, ADR 0105); **(e)** `pause`/`unpause`, each one element; dispatches held as the replay holds
them; `RunState.paused: boolean`, not an outcome; S6 not needed (W175, ADR 0106); **(f)** `halted` everywhere, a stored
`'stopped'` read as `halted` and never written again, `CHECKPOINT_FORMAT` stays `1` (W171, ADR 0102); **(g)** S12
written, NOT RAISED; `AGENTS.md` says `graceMs: 0` is a race, and L6 never asserts `forced` at it (W173, W176); **(h)**
`halted` > `cancelled` > `cancelling` > `interrupted` > `awaiting_action` > `running`, the rest as today (W173-W174);
**(i)** nothing per parked task — the run-level element is the fact (W173, W174); **(j)** tasks a worker spawned are not
cancelled, and `AGENTS.md` section 11 says so (W173).

## Work items

**The four sentences P37's retro adopted for THIS declaration** (P37 Retro section 8, (k)), copied as it directs:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**: *the plan's index row names, for each item, the census
  sites its kind of change moves — a new suite → `test/definition/l4-corpus.test.ts`; a spec version → `spec/README.md`'s
  row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed snippet → `scripts/check-docs.mjs`'s
  `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and `test/driver/retention.test.ts`'s `DRIVER_FIELDS`; a fact
  `AGENTS.md` states → the whole of `AGENTS.md` — and every file that READS the surface the item changes, found by a grep
  for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`: the module's export list, the caller that
  hands the value on, the publish smokes (which no lane typechecks), and the comments and messages that state the rule
  being changed.*
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two (two
  arguments of a call, a swap and a deletion), the probe is COMPOUND, and a Record counts it as killing neither clause
  until each is re-cut alone and killed.*

**D′ applied — the sites each row moves.** **`DRIVER_FIELDS`** (`test/driver/retention.test.ts:253`, checked `:1025`;
`examples/l6.ts:11795-11826`, checked `:11827`; 25 members today) moves BY NAME with every new `Driver` instance field —
W172's hold, W173's cancel request, W174's stop, W175's pause — and `examples/run-flow.ts`'s `NOT_RUN_STATE` where the
field is configuration. **`RUN_FLOOR`** (`scripts/check-docs.mjs:728`, 37) with every `run` snippet `AGENTS.md` gains or
loses. **`LATE_SUITES`** (`test/definition/l4-corpus.test.ts:426`) with every new suite. **`examples/README.md:70`'s
`X10`** (*176 real runs, 2664 assertions*, and *69 row labels* later in the cell) with every L6 change — W169, W171 and
W176. **`spec/README.md`**: `flow-definition.md` v0.38 (`:21`), `outcome-record.md` v0.13 (`:23`), `join-policy.md` v0.20
(`:24`), `run-state.md` v0.15 (`:26`, which counts *seven* run-level outcomes — W171, W173 and W174 each move the count).
**The readers of the renamed and widened names** (fact 7): `index.ts`'s `export *`, `src/driver/listener.ts`'s comments,
`examples/run-flow.ts`, `scripts/run-browser-tests.mjs`, and the five script self-tests naming the word — classified
by W171's B′ copy, never assumed. **The always-read set**: W173 edits `doc/concept.md` section 7, so B′'s
`check:budget:selftest` clause binds it; no other row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W169 | **Q619 option B, and P37's six stale sites** — decision 12; the `InvalidDefinition` message built by ONE function both roads call | `src/definition/registry.ts`, `src/definition/wiring.ts` (the `:187` comment), `src/driver/driver.ts` (the `:2140` comment, `:1383`'s message), `src/scheduler/runtime.ts` (`:673-677`), `spec/flow-definition.md`, `spec/outcome-record.md`, `spec/README.md`, `test/definition/registry.test.ts`, `test/scheduler/runtime.test.ts`, `test/driver/result-schema.test.ts`, `AGENTS.md`, `scripts/check-docs.mjs` | — | `gate:item`; L1 a built-in keyed group in the `residentGroups` of a type's pool, a named instance's pool and a class derivation's output each refused at `createRuntime` naming the pool and the group, a CODE group type's keyed group and a `ConcurrentLimitGroup` held resident each accepted, and fact 11's one control flipped; the `InvalidDefinition` message byte-equal on both roads |
| W170 | **Q633 — the road (a) answers** — ADR 0101; `FD-R4`'s row | `src/driver/driver.ts`, `spec/flow-definition.md`, `spec/README.md`, `test/driver/boundary.test.ts`, `test/definition/l4-corpus.test.ts`, `AGENTS.md` (sections 9-11, 15), `scripts/check-docs.mjs`, `doc/decisions/0101-*` | W169 | `gate:item`; L2 a transforming ENTRY whose value differs against the schema before and after its transform — both of Q633's payloads ADMITTED by `start` (road (2)), and `tryTransform(…, { input })` still giving each its own verdict; an untransformed entry's `FD-R4` refusal unmoved |
| W171 | **Today's `stopped` renamed** — ADR 0102; (f)'s names and the dual read; P33's three stale comments, in the sentences the rename rewrites | `src/fold/run-state.ts`, `src/driver/driver.ts`, `src/driver/listener.ts`, `src/scheduler/runtime.ts`, `src/scheduler/envelope-worker.ts` (`:346`), `spec/run-state.md`, `spec/outcome-record.md`, `spec/join-policy.md`, `spec/flow-definition.md`, `spec/task-id.md`, `spec/README.md`, `test/**`, `examples/l6.ts`, `examples/run-flow.ts`, `examples/README.md`, `scripts/run-browser-tests.mjs` and the script self-tests its copy finds, `AGENTS.md`, `README.md` | W170 | `gate:item`; L0 a consumer's `outcome === 'stopped'` and `reason === 'stopped'` FAIL to compile (a typecheck probe, checked in); L1 a 0.7.0-shaped log with a stored `'stopped'` folds `halted` and its checkpoint is refused `halted` at that position; L3 every fixture folded twice equal; no `'stopped'` literal WRITTEN anywhere in `src/` |
| W172 | **The dispatch hold, and Q605** — ADR 0103; decision 8 | `src/driver/driver.ts`, `spec/run-state.md`, `spec/README.md`, `test/driver/**`, `test/definition/l4-corpus.test.ts`, `test/driver/retention.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS`) | W171 | `gate:item`; L2 Q605's `closes-when` — a halt and a cancelled settlement each raised on the stack of a fan-out's first branch and of a `map`'s first instance (door a) and of a resolution's append (door b), nothing further dispatched, routed or emitted, beside each control; every replay case unmoved |
| W173 | **Cancelling a run** — ADR 0104; (b), (c), (h), (i); `doc/concept.md` section 7 amended; Q18 resolved; Q606's runtime row; P33's pre-pickup and backoff roads at L2 | `src/driver/driver.ts`, `src/fold/run-state.ts`, `src/scheduler/runtime.ts`, `spec/run-state.md`, `spec/outcome-record.md`, `spec/join-policy.md`, `spec/README.md`, `test/driver/**`, `test/fold/**`, `test/matrix/**`, `test/scheduler/runtime.test.ts`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS`), `examples/run-flow.ts`, `AGENTS.md` (sections 6, 8, 11, 12), `scripts/check-docs.mjs`, `doc/concept.md` (section 7) | W172 | `gate:item`; L1 `cancelling` → `cancelled` by the fold alone; L2 a cancel mid-fan-out with tasks running, queued, PRE-PICKUP, in BACKOFF and parked, the element before every `task.cancelled`, nothing routed after it, a second cancel's `graceMs` forwarded and nothing appended; L3 folded twice; L5 the `cancelling` row; Q606 — `done` resolves `cancelled` after the last settlement and the run is RELEASED, through `createRuntime`'s routing; B′'s `check:budget:selftest` |
| W174 | **Stopping a run to resume it elsewhere** — ADR 0105; (d), decision 3's ORDER, decision 9 | `src/driver/driver.ts`, `src/fold/run-state.ts`, `src/scheduler/runtime.ts`, `spec/run-state.md`, `spec/README.md`, `test/driver/**`, `test/fold/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS`), `examples/run-flow.ts`, `AGENTS.md` (sections 8, 11, 18) , `scripts/check-docs.mjs` | W173 | `gate:item`; L2 the ORDER — deaf before the first `cancel`, no `task.cancelled` of a stop appended, the in-flight set unsettled; a parked run stopped with `resolve()` refused; L2 a resume of the stopped checkpoint re-dispatching exactly the in-flight set at the same ids; L1 `done` settling after the stop's cancels resolve, with a sibling run on the same runtime untouched |
| W175 | **Pausing a run** — ADR 0106; (e); S6's index row | `src/driver/driver.ts`, `src/fold/run-state.ts`, `spec/run-state.md`, `spec/README.md`, `test/driver/**`, `test/fold/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS`), `examples/run-flow.ts`, `AGENTS.md` (sections 8, 11), `scripts/check-docs.mjs`, `doc/scheduler-upstream.md` (S6 only) | W174 | `gate:item`; L2 nothing handed on while paused, the held tasks `dispatched` and `running` in the fold, handed on in dispatch order at unpause; a paused run stopped and resumed resumes PAUSED; a paused run cancelled ends `cancelled` with every held task settled by the scheduler; L3 folded twice |
| W176 | **The exit artifact** — the header's seven clauses, on real workers; at `graceMs: 0` it asserts `cancel()` resolved and `done` settled, never `forced` (g) | `examples/l6.ts`, `examples/flows/**`, `examples/workers/**`, `examples/README.md`, `examples/deno-import-map.json` (if clause (6) needs `jsonata` under deno, fact 10) | W175 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W177 | *reserved, expected unused* | | | |

**Every row shares `src/driver/driver.ts`, `spec/README.md` and `AGENTS.md` with another, so the eight are SERIAL in the
order above, never concurrent** (`doc/workflow.md` section 7 rule 2) — each declares the overlap with its predecessor
rather than an exception, because the files are in its row. **(a)-(j) were answered 2026-10-16, all as recommended**, and an item
whose answer moves its row rewrites the row's `Owns` at its declaration step, by B′, from this table. Each item's file
is written at its declaration step; this table is an index, not the declaration.

**Questions reserved per item**, so no two take one: W169 Q635-Q637, W170 Q638-Q640, W171 Q641-Q643, W172 Q644-Q646,
W173 Q647-Q650, W174 Q651-Q654, W175 Q655-Q657, W176 Q658-Q659.

## Predictions, written before the items that test them

1. **W169 flips exactly one assertion** — fact 11's resident control — and the message refactor moves none: the two
   roads already build the same text.
2. **W170 under (a)'s recommended road moves no existing assertion but the boundary cases that hold a transforming
   entry** — and no L2-L6 row today starts a run on a transforming entry with a value that differs before and after
   (Q633's own finding, P37 retro section 4 (f)).
3. **W171 is LOUD everywhere it is wrong**: every `'stopped'` site of fact 7 turns red at a typecheck or at an L1-L5
   run, and NONE stays green under the old literal — a site that does is a string comparison no type reaches, and W171's
   B′ copy lists it.
4. **W172 moves no existing L2-L6 assertion**: the doors leak only on a RE-ENTRANT halt (fact 1), which no case raises
   today beyond Q605's own description.
5. **W173 moves P33's W160 L6 rows not at all**: they cancel through `runtime.scheduler.cancel(id)`, which the driver did
   not request, so ADR 0094's road — the first `cancelled` settlement halts the run — is unchanged, `done` included.
6. **W174 changes no line of `resume()`'s re-dispatch**: a stopped run's in-flight set is `RN-R21`'s as it stands; only
   the fed element is new.
7. **W175's held tasks are invisible to every L2-L5 case that never pauses** — the hold's pause branch is reachable from
   `pause()` alone.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q18](../questions/q18.md) | what cancelling a run does — reopened by decision 1, **resolved by ADR 0104** (W173) | — |
| [Q605](../questions/q605.md) | two doors a re-entrant halt does not shut — measured as fact 1; **resolved by ADR 0103** (W172), the doors four rather than three (W172 S-1) | — |
| [Q606](../questions/q606.md) | the runtime's release of a cancelled run — its L6 half met by P33's W160; **resolved by ADR 0104** (W173's runtime row) | — |
| [Q633](../questions/q633.md) | DEFECT: `FD-R4` holds a transforming entry's payload before its transform — **resolved by ADR 0101**, road (2): W170 at L2, W176's exit clause (6) at L6; before 0.8.0, as P37's retro (g) required | — |
| [Q619](../questions/q619.md) | a built-in keyed group held only as RESIDENT — **resolved**, option B, by W169 (spec/flow-definition v0.39) | — |

## Record

*Written 2026-10-17 over `d67138f`, the tree clean before it. Every figure is read from the eight items' own files; none
is re-measured here. Ids are bare text, as in P33's and P37's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and both readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W169** `d7553ba` | Q619 option B — a built-in `KeyedRateLimitGroup` in any derived pool's `residentGroups` `DerivationRefused` at `createRuntime`, naming the pool and the group; `InvalidDefinition.fromFindings`, ONE message both roads build; P37's six stale sites | flow-definition v0.39, outcome-record v0.14 | Q619 / — | none | no defect; conformity C1 an expected value taken from output (fixed); adequacy 25, 3 survivors, each a case. **Overlap 0** | 62 / 1765; 2664 / 176 | `gate:item` EXIT 0, 955.4 s |
| **W170** `7c88a20` | Q633 road (2) — a TRANSFORMING target unchecked at `start`, `tryTransform(…, { input })` the check before a run; ADR 0101 | flow-definition v0.40 | — / — (Q633 left open for W176) | **E1** (S1, YES after the readers): `src/definition/wiring.ts` twice, `AGENTS.md` section 13 | **conformity C1 DEFECT** — the published *check, then start* recipe answered the wrong question on four shapes; adequacy 19, 3 survivors. **Overlap 1** | 62 / 1776; 2664 / 176 | `gate:item` EXIT 0, 1079.5 s |
| **W171** `24253b2` | `stopped` RENAMED `halted` in `RunOutcome`, `FoldInput`, `RunState.haltedBy`, `ResumeRefusalReason`; a stored `stopped` read as `halted`, never written; `CHECKPOINT_FORMAT` 1; ADR 0102 | flow-definition v0.41, outcome-record v0.15, run-state v0.16 | — / — | none | no defect; adequacy 33, 29 killed, B7-B9 closed. Overlap not stated | 62 / 1780; 2664 / 176 | `gate:item` EXIT 0, 906.6 s |
| **W172** `43cdd7d` | `shut()` — one dispatch hold every halt shares, checked at FOUR places; ADR 0103 | run-state v0.17 | Q605 / — | **S-1 YES** — decision 8's three places are four (`resume()`'s re-dispatch), built in `Owns`; **S-2 YES → E1**, `AGENTS.md` section 6's cell | no defect in `src/`; adequacy A1 — a check called unreachable was reachable. Overlap not stated | 63 / 1798; 2664 / 176 | `gate:item` EXIT 0, 1085.3 s |
| **W173** `a707de0` | `driver.cancel`, `SchedulerLike.cancel?`, `RunControlRefused`, `cancelRequested`, `cancelling`, `stepping`; `doc/concept.md` section 7 amended; ADR 0104 | run-state v0.18, outcome-record v0.16, join-policy v0.21 | Q18, Q606 / — | **S-1..S-5 YES → E1-E5**: `AGENTS.md` sections 9, 18, 1 and 7; `CLAUDE.md` twice; `listener.ts` and `schema.test.ts` comments | **two DEFECTS**: D-1 a mid-step cancel refused `ended`, D-2 a second call resolving early — fixed. Overlap not stated | 65 / 1826; 2664 / 176 | `gate:item` EXIT 0, 914.2 s |
| **W174** `7915005` | `driver.stop` / `RunHandle.stop`, `interrupted`, TAKEN AT REST, deaf with the hold BEFORE the element; a resume feeds it; ADR 0105 | run-state v0.19, join-policy v0.22 | — / — | **S-1..S-6 YES → E1-E6**: `AGENTS.md` sections 6, 9, 12; `CLAUDE.md`; `src/definition/types.ts`; `JP-R12`. **R2 RATIFIED** (deaf before the element, reversing (d)'s listed order) | **five DEFECTS** C1-C5 — C5 a THROWING callback leaving the stop half-done, constructible — fixed. Overlap not stated | 67 / 1854; 2664 / 176 | `gate:item` EXIT 0, 894.2 s |
| **W175** `4758862` | `driver.pause` / `unpause`, `RunState.paused`, a held dispatch handed on in dispatch order; S6 not needed; ADR 0106 | run-state v0.20 | — / — | **S-1..S-4 and S-6 YES → E1-E5**: `AGENTS.md` sections 9, 6, 18 (twice); `doc/scheduler-upstream.md:36`. **S-5 NO** (no `RunHandle.pause()`). **Three departures RATIFIED** — R1 taken at rest, `RN-R13` among the moved rules, R11 the note inside S6's section — **and G1** (a call whose step halted or cancelled the run DROPPED) | **two DEFECTS** D1, D2, each at a seam with an earlier item's mechanism — fixed. Overlap not stated | 69 / 1877; 2664 | `gate:item` EXIT 0, 845.0 s |
| **W176** `d67138f` | the exit block — seven clauses, 47 claims over 14 runs | none | Q633 / — | none | conformity: seven clauses CONFORM, one DEFECT (a stale comment), the R1 GAP; adequacy: six gaps (M1, M5, M6/M7, M8, M11, M12d) — *do not record until the first three are tightened* — all closed. Overlap not stated | 69 / 1877; **2711 / 190** | **`gate:full` EXIT 0**, 11/11 self-tests, 2113.5 s |

**Every confirming gate was green on its FIRST run, one command each** (sentence C), firefox and webkit NOT RUN in any.
**No item raised a question.**

### The exit artifact, measured

| the exit sentence's clause | what was built and measured (W176's Record and its *How each exit clause is asserted*) | verdict |
|---|---|---|
| on the final tree, ONE cross-row block in `examples/l6.ts`, green in node 24 and in deno | the `W176 exit` block; **2711 / 190, 0 failed in node 24.20.0 and deno 2.9.6** — in `npm run gate`, in `test:l6` and `test:l6:deno` 5/5 each after the readers, and in `gate:full` | **met** |
| (1) a run CANCELLED while two tasks RUN on a threaded pool — one honouring its signal, one not — and a third QUEUED behind a held group | one `Stops` pool, `maxThreads: 2` (R3); the fold `running`, `cancelling` from the request (position 7) and at each settlement while one is unsettled, `cancelled` at the last; exactly the three cancelled settlements after it, nothing dispatched or routed; `done` after the LAST `task.cancelled`, equal to the caller's fold; the second call — `graceMs: 0`, made 2.5 s after the first, past the scheduler's default grace, the pool's own `cancelGraceMs` 600 000 read back — appends nothing and stops `ignores` before its own end (`forced` never asserted, (g)); a resume refused `cancelled` at 7 | **met** |
| (2) STOPPED on A beside an untouched sibling; `done` after its tasks have stopped; resumed on a FRESH B, the in-flight set at the same ids, to `completed` | three branches — `a` honouring, `b` ignoring, `c` WAITING (R12, R14); the log ends at `interrupted` with nothing settled, `c`'s `task.cancelled` — fired inside the stop's own `cancel()` — NOT appended (deaf first); `done` `interrupted` after all three, `b` last by the forwarded `graceMs: 300`; `stop()` resolved only then (R13); the sibling never cancelling, `completed`; A refuses the resume `RunIdInUse`; B holds exactly the three ids, `resumes` naming them, no new `dispatched`, `completed` | **met** |
| (3) a run PARKED at `user_action` stopped: `resolve()` refused on A, `done` settled | `awaiting_action`, nothing in flight; stopped `interrupted`, the scheduler's task still `user_action` (nothing sent); `resolve()` refused, nothing appended; the CONTROL (R6): the same `resolve()` accepted on the runtime that resumes it, to `completed` | **met** |
| (4) PAUSED mid-fan-out, nothing handed on while paused, UNPAUSED to `completed` | run TWICE, `a` slow in one and `b` in the other (R7); while paused `a2`, `b2` dispatched and held, `running`, `paused`, the scheduler holding `a` and `b` alone; the hand-off in the ARRANGED dispatch order in the log and in `addTask`'s order, `unpaused` before it; `completed`, `paused` false | **met** |
| (5) a cancel BEFORE a thread picks its task up, and one during a retry BACKOFF, each folding as fact 8 says | each road TWICE (R1, after the conformity reader's GAP): through the scheduler's own `cancel(id)`, the fold fact 8's literal `[dispatched, outcome cancelled]`, and through `driver.cancel`, `[dispatched, cancelRequested, outcome cancelled]`; pre-pickup `task.cancelling`, `task.cancelled`, no `task.running`; backoff `task.running`, `task.retrying`, `task.cancelled`, settled inside the call, `attempts` 1 | **met** |
| (6) a transforming ENTRY started on Q633's road as (a) answers | `tryTransform` first: `{ word }` passes, `{ label }` fails naming `$.label required`; `start` admits both, each `completed`, the threaded worker receiving `{ label: "x" }` and `{}`; CONTROL: the same entry untransformed refused `BoundaryRefused` | **met** — Q633 closed |
| (7) a built-in `KeyedRateLimitGroup` in a pool's `residentGroups` refused by `createRuntime`, naming the pool and the group | `DerivationRefused` naming `node type "Holds"'s default instance` and `group "api"`, and `pool "holds-api"` for a named instance (R9); CONTROL: a `RateLimitGroup` held resident on both, BUILT | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W176, ONE command on the final tree after the readers' items: 11/11 self-test lanes ok, `check:register:selftest` included | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **62 / 1763 → 69 / 1877** in node, deno and
chromium; L6 **2664 / 176 → 2711 / 190** in node and deno; `check:spec` **7 / 75 / 135 → 7 / 75 / 142**; `check:docs`
**43 / 37 run → 46 / 40 run**; spec/flow-definition **v0.38 → v0.41**, outcome-record **v0.13 → v0.16**, join-policy
**v0.20 → v0.22**, run-state **v0.15 → v0.20**.

**What the plan answered.** A run's OWNER now has three calls, each recorded before it acts and each refused by name
(`RunControlRefused`) before anything is recorded. **Cancel** (`driver.cancel`, ADR 0104) holds the run, appends ONE
`cancelRequested`, cancels every task in flight through `SchedulerLike`'s optional `cancel`, and reads `cancelling` until
the last task has stopped — so `done` settles `cancelled` only then, and a second call escalates. **Stop**
(`RunHandle.stop` / `driver.stop`, ADR 0105) is taken at rest, goes deaf with the hold BEFORE its `interrupted` element,
then cancels; `done` settles once those cancels resolve, and the checkpoint resumes on a fresh runtime with the in-flight
set at the same ids. **Pause** (`driver.pause` / `unpause`, ADR 0106) routes on and holds every dispatch — appended,
not handed on — until the unpause hands them on in dispatch order; `RunState.paused` is a flag, not an outcome. Each
leaves ONE element per call in the log, and each shares one hold (ADR 0103). Beside them: the driver's halt is `halted`
(ADR 0102), a transforming target is not held at `start` (ADR 0101), and a resident keyed group is refused at
`createRuntime` (Q619). **What it did not do**: attempts spent by a stop (P36); a deadline on a parked task (P35);
cancelling what a worker spawned (Out, (j)); `RunHandle.pause()` (W175 S-5, NO); `graceMs: 0` as a guarantee (S12).

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W169 flips exactly one assertion; the message refactor moves none | **TRUE** | W169 M2 |
| 2 | W170 moves no existing assertion but the boundary cases holding a transforming entry, and no L2-L6 row starts a run on one | **TRUE**, and stronger: NO existing assertion moved — no case held a transforming entry | W170 M2 |
| 3 | W171 is LOUD everywhere it is wrong — no site stays green under the old literal | **FALSIFIED** — `examples/l6.ts`'s threaded `uncloneable` row, `outcomesNotSeen: ['stopped', …]` over a `string[]`, held VACUOUSLY once the name could not occur; made loud by typing the field `RunOutcome[]` (K15) | W171 M4 |
| 4 | W172 moves no existing L2-L6 assertion | **TRUE** | W172 M3 |
| 5 | W173 moves P33's W160 L6 rows not at all | **TRUE** — L6 2664 / 176 unmoved | W173 M3 |
| 6 | W174 changes no line of `resume()`'s re-dispatch | **TRUE for the loop, NARROWER than stated** — the loop is unchanged; two lines BEFORE it move (the replay's fed stop cleared before `resumed`) and the fed kinds gain `interrupted`. *(W175's D2 later moved the paused resume's hold before `resumed` — not W174's)* | W174 M3 |
| 7 | W175's held tasks are invisible to every L2-L5 case that never pauses | **TRUE** — with the item built and nothing else touched, the only red were five census sites | W175 M3 |

**The D′ paragraph's census predictions** (*Work items*), scored the same way: **wrong at three items, right at two** —
W169 moved no `X10` copy (L6 unmoved) and met a census site the paragraph did not name, `l4-corpus.test.ts`'s per-SUITE
case counts (`:812`, found by its first gate); W171 moved no outcome count (a rename keeps seven); W172 moved no
`DRIVER_FIELDS` (the hold is a method over two existing flags). W173 and W175 moved `DRIVER_FIELDS` as predicted. Each
miss was found by the item's own lanes going red by name in B′'s copy or its first gate — before an edit outside `Owns`.

**Questions**: **closed Q18 and Q606** (W173, ADR 0104), **Q605** (W172, ADR 0103), **Q619** (W169) and **Q633** (W170
and W176, ADR 0101); **raised none**. [Q599](../questions/q599.md) gains a dated note (Retro section 4). `npm run q --
--where status=open` lists **Q580, Q581**.

**Handed on**, each with its owner — gathered from the eight items' Out sections and the readers' notes:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| a consumer `onFoldInput` THROWING on `cancelRequested`: the element is in the log, nothing is sent | W174 C5's note | **P35**, one row, before 0.8.0 — (o) | P35's draft |
| a throw on a `paused`, `unpaused` or `interrupted` element taken at `leaveStep()` from a SCHEDULER EVENT escapes into the scheduler's `dispatchEvent`, not `OR-R10` | W175 N5 / R14 (inherited from W174's `takeStop`) | **P35**, the same row, before 0.8.0 — (p) | P35's draft |
| `doc/concept.md:85`, `:101`, `:217` | W173 (`:85`), W176's conformity reader | **fixed** at this record step — (k) | `doc/concept.md` |
| `doc/questions/q583.md`'s premise *a queued task cannot be cancelled* | W176's conformity reader | **fixed** at this record step — (l), still deferred | [Q583](../questions/q583.md) |
| three test titles short of the outcomes they name | W176's conformity reader | **P35**, its first item editing `test/**` — (m) | P35's draft |
| `doc/scheduler-upstream.md:194`, ADR 0014:57, ADR 0094:77 — history in the future tense | W176's conformity reader; ADR 0094 this retro | **left** — (n) | — |
| one deno L6 timing flake | W174 | [Q599](../questions/q599.md), deferred — a dated note | Q599 |
| road (2)'s cost, visible on real workers: the worker RECEIVES `{}`, which its own `inputSchema` refuses, and nothing in the run checks it | W176 | no owner — ADR 0101's stated cost, `AGENTS.md` section 9 says it | W176's Record |
| attempts spent by a stop; a deadline on a parked task | P34 *Out* | P36; P35 | their drafts |
| `RunHandle.pause()` | W175 S-5 | declined (NO) — `handle.driver.pause()` | W175's Record |

## Retro

*Pass 3 ran on 2026-10-17 over `d67138f`, the working tree clean before it, in a subagent at the maintainer's request.
Every figure is read from the eight items' Records; this retro re-ran no gate, no harness and no measurement. **The
routings and proposals were put to the maintainer in section 8, and the answers are recorded there; none moves a rule
in `doc/workflow.md`.***

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader defects | raised / closed |
|---|---|---|---|---|
| P34's declaration | — | (a)-(j), all as recommended | — | — |
| W169 | — | — | 0 | — / Q619 |
| W170 | E1 — YES | — | 1 (C1, a documented recipe) | — |
| W171 | — | — | 0 | — |
| W172 | E1 (S-2) — YES | S-1 — YES (a fourth door) | 0 (A1 a claim, not code) | — / Q605 |
| W173 | E1-E5 (S-1..S-5) — YES | — | 2 (D-1, D-2) | — / Q18, Q606 |
| W174 | E1-E6 (S-1..S-6) — YES | **R2 RATIFIED** | 5 (C1-C5) | — |
| W175 | E1-E5 (S-1..S-4, S-6) — YES; **S-5 NO** | R1, `RN-R13`, R11 and **G1 RATIFIED** | 2 (D1, D2) | — |
| W176 | — | — | 1 (a comment) and six adequacy gaps | — / Q633 |
| **P34** | **18 YES, 1 NO** | **2 asks, 5 ratifications** | **11, and six gaps** | **0 raised, 5 closed** |

**Rule 6's NO branch RAN for the first time on a widening** — W175 S-5, whose recommendation was itself NO — and, as rule
6 says only a NO on a DEFECT raises, it raised nothing: S-5 was a surface, not a defect.

### 2. The `Owns` and the census sites — B′ and C held; D′ was narrowed at the declaration

**B′ was FOLLOWED in all eight and it worked**: every census site — `DRIVER_FIELDS`, `RUN_FOR`, the `RunState` literals,
`LATE_SUITES`, `RUN_FLOOR`, `spec/README.md`'s rows, `X10` — was found by its own lane going red by name, in the copy or
at the first gate, and **no exception was a census site**. **C held**: every confirming gate green on its first run, one
command each. **E held**: every compound probe declared and counted as killing nothing alone (W172 C1, C2, K24; W174 D3,
D5; W175 P20, P35, P37, P39, N4, A3; W176 D12c, D33, M11).

**The eighteen exceptions are one class, and P37's D′ named it** — *the comments and messages that state the rule being
changed*:

| class | count | sites |
|---|---|---|
| an `AGENTS.md` section OUTSIDE the sections the row listed | **12** | W170 E1 (section 13), W172 E1 (6), W173 E1-E3 (9, 18, 1 and 7), W174 E1-E3 (6, 9, 12), W175 E1-E3, E5 (9, 6, 18, 18) |
| `CLAUDE.md` — the maintainer's file | 2 | W173 E4, W174 E4 |
| a comment in `src/` or `test/` outside the row | 2 | W173 E5, W174 E5 |
| a spec row a stop reaches | 1 | W174 E6 (`JP-R12`) |
| the upstream register's opening paragraph | 1 | W175 E4 |

**D′ says *a fact `AGENTS.md` states → the whole of `AGENTS.md`*; P34's rows listed SECTIONS** (W173 *sections 6, 8, 11,
12*, W174 *8, 11, 18*, W175 *8, 11*). Twelve of eighteen asks are that narrowing — **a rule adopted for this declaration
and not followed by it** (section 4 (a)). Every one was found before its edit — by the declaration step's grep (M4 in
W173-W175), a gate going red by name (W173 S-1, `X4`), or a reader (W170 S1, W175 S-6) — so the refusal ledger's
*`Owns` pre-declaration* row's standing ground held again.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W169 | no defect; C1 an expected value from output | 25, 3 survivors | **0** | 100th |
| W170 | **C1 DEFECT** (the recipe) | 19, 3 survivors | **1** | 101st |
| W171 | no defect | 33, 29 killed | not stated | — |
| W172 | no defect in `src/` | survivors; A1 a reachable "unreachable" | not stated | — |
| W173 | **D-1** | **D-2** (with conformity) | not stated — the Record names D-2 as BOTH readers' | — |
| W174 | **C1-C5** | 66 probes; B4-B6 = conformity C7 | not stated — the Record names C7 = B4/B5/B6 | — |
| W175 | **D1, D2**, G1, G2 | 62 probes, six gaps | not stated | — |
| W176 | one DEFECT, R1 GAP | six gaps | not stated | — |

**Six of eight Records state no overlap** — section 6's *an item's RECORD states its own overlap* (v0.26, v0.27), FOLLOWED
by all six of P37's items and by W169-W170 here, then dropped. **A rule BROKEN, not followed and failed** (pass 3 rule 3):
no rung reads it, and the briefs from W171 on did not ask for it. W173 and W174 each name one shared subject in passing
(a lower bound of 1 each); the other four cannot be recovered from the Records. **The readers are the mechanism for the
tenth plan running**: eleven code or document defects, every one a reader's — two at W173, five at W174 (C5 constructible
by a consumer), two at W175, each at a SEAM with an earlier item's mechanism — and W176's six adequacy gaps, three of
them claims an ARRANGEMENT made unfalsifiable. **Every one of the eleven was found AFTER the author's own set had run
green over it** (W173's 39 probes, W174's 52, W175's 52, W176's 45); the authors' finds were design, not defects (W174 R1/R2,
W175 R1).

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) D′'s *whole of `AGENTS.md`* narrowed to sections in the rows** — twelve asks (section 2) | **BROKEN at the declaration** — P37's adopted sentence, copied into *Work items*, its rows written narrower | M4's grep at each declaration step; one gate (`X4`) | **No change to a rule** — Proposal B for P35's author, the clause followed as written |
| **(b) the D′ paragraph's census PREDICTIONS wrong at W169, W171, W172** | followed | B′'s copy and the first gates, by name, before any edit | **No change**: D′ predicts and B′ measures, which is the division P37 adopted |
| **(c) decision 8 enumerated three doors where fact 1 had measured two `addTask` sites and the hold covered one** — the fourth, `resume()`'s re-dispatch | — the plan's author | **W172's declaration step** (M4, a probe), asked as S-1 | **No change**: one occurrence; W172's lesson — *an enumeration is checked against the measurement it came from* — is the author's |
| **(d) prediction 3 falsified** — an exclusion claim over `string[]` held vacuously after a rename | — | W171's B′ copy (M4) | **No change**: one occurrence, closed by a type |
| **(e) "taken at rest"** — W174 R1 (a stop taken mid-step drops the step's routing for good) and W175 R1 (a pause mid-step lands between two elements of one step, refused `diverged` on resume) | — the PLAN's (d) and (e) said *hold at the call* | the AUTHORS, by constructing the case, both measured as mutants (W174 D2/D19, W175 P21) | **Two occurrences, two items — it generalises, and it is a DESIGN rule, not a method rule**: any owner element a resume's replay FEEDS lands BETWEEN two steps (`RN-R19`). It is in `RN-R33` and `RN-R35`; P35 and P36 add owner elements (a deadline, an attribution), so it is section 8's Proposal B, not a workflow edit |
| **(f) a consumer callback THROWING between two of a control's side effects** — W174 C5 (stop: no cancels, `done` settling while workers ran), fixed by a `finally`; the same shape on the CANCEL's `cancelRequested` (open); W175 N5 (a take at `leaveStep()` from a scheduler event — the throw escapes into `dispatchEvent`) | — | **the conformity readers**, both times | **Three occurrences, one class, two OPEN** — stop-and-asks (o) and (p). *Read from the code, not measured here*: after a throw on `cancelRequested` the request is set and the run held, but no cancel is sent and a PAUSED run's held tasks are never handed on — and a second `cancel()` re-sends only to tasks HANDED on, so such a run reads `cancelling` for ever. W174's *its second call recovers* is true of an unpaused run only |
| **(g) mutation-harness lessons** — a time-out graded SURVIVED (W176 D17's first pass); a probe that substitutes the EXPECTED literal cannot fail (A12); a scheduler DEFAULT is part of the arrangement (M1: the pool's 2000 ms grace did the escalation's work); an order claim needs the order ARRANGED both ways (M12d); *after X* needs an X with a distinct first and last (M8); two guards on one door make single-clause probes survive by design (W172 K1/K4/K8, W176 D12, D31/D32) | each clause exists: rule 8's *grader controlled*, (b), (c) PROVENANCE, (f) ARRANGE, and E's compound counting | **the adequacy readers**; the authors for D17, A12 and the two-guard rows | **No change**: one occurrence each but the last, and the last is two items handled the SAME way — a case only one guard holds where one exists (W172, L2), and *equivalent on this road* naming the L2 case where none does (W176 D12 → `test/driver/stop.test.ts`) |
| **(h) the overlap unstated in six Records** (section 3) | BROKEN | this retro | **No change to a rule**: the brief carries it — Proposal B |
| **(i) stale prose a correct change makes false** — ten sites outside every item's `Owns` (section 8 (k)-(n)) | — | the readers, chiefly W176's conformity reader | **No change**: the ledger's first row, considered and not proposed (section 7) |

**Pass 3 rule 5 over P34's defects**, by what caught them: **a rung in `gate`** — W169's first gate on a counted suite,
W173's `X4` on the refusal census, each B′ census site; **B′'s copy** — prediction 3's vacuous row; **the authors,
constructing** — W174 R1/R2, W175 R1; **the conformity readers** — W170 C1, W173 D-1, W174 C1-C5, W175 D1/D2/G1/G2,
W176's comment and R1, every stale site of section 8; **the adequacy readers** — W173 D-2, W172 A1, every survivor and
W176's six gaps. **No rung would have caught** the throwing-callback class (f) or the stale prose (i).

**The flaky rows ([Q599](../questions/q599.md)).** **Its first row went red ONCE more** — `uncloneable / OR-R6, threaded`,
in deno, beside a row Q599 does not name (`perShard`'s cross-row ordering), on W174's first `npm run gate` before its
readers; `test:l6:deno` alone straight after was 0 failed, and the re-run EXIT 0. **None in any of the eight confirming
gates**, and none in W176's eleven deno runs across both rounds. A dated note is added to Q599; it stays deferred.

### 5. The scheduler

**S12 is written, NOT RAISED** (P34 (g), at the declaration), and nothing of ours asserts `forced` at `graceMs: 0`
(`AGENTS.md` section 11; W176's escalation asserts what the cancel DOES). **S6 is NOT NEEDED** — pause is ours (W175;
its index row, its section's closing note and the register's opening paragraph say so). **No new observation** — none of
the eight Records names a scheduler behaviour that is not already an S entry or a fact of its `AGENTS.md`; W176's M1 is
the pool's `cancelGraceMs` default, a fact of the arrangement rather than of the scheduler.

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule.** B′, C and E held (section 2); the two rules broken — D′'s
*whole of `AGENTS.md`* and the overlap line — are broken, not followed and failed; and every defect the plan produced was
caught, before its Record, by a reader whose job it already is.

**B. Recommended, for P35's (and then P36's) AUTHOR, not the workflow** — B′, C and E carried UNCHANGED, and **D′
carried with its own clause FOLLOWED as written**: *a row whose item changes a surface `AGENTS.md` documents owns the
WHOLE of `AGENTS.md`, never a list of its sections* — and two sentences for the declaration's briefs: *each item's Record
states its readers' overlap* (section 6's own rule, restated where it was dropped), and *an owner element a resume's
replay feeds is TAKEN AT REST, between two steps* (section 4 (e)).
- **Replaces**: P34's narrowed D′ in P35's declaration.
- **Saves**: twelve of section 2's eighteen asks — each a maintainer's YES a serial plan waited for.
- **Ledger**: as P37 found for D′, kin to the *`Owns` pre-declaration* row (14 refusals) — not proposed as a rule or a
  check, and its standing ground held again: all eighteen were found before their edits.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it would be the 34th refusal, P2-P37.** Section 4 (i) is the class:
  ten stale sites, all but one found by a reader. The row's standing ground holds. **No other ledger row is
  re-raised**; Proposal B is explicitly not the `Owns` row's proposal.

| file | why |
|---|---|
| this plan | the Status line; *Open questions this plan carries* — Q18, Q605, Q606, Q619 and Q633 resolved; this Record and Retro |
| `README.md` | three rows in *More examples*: cancelling a run (`AGENTS.md` section 6), pausing it (section 8), stopping it to resume it elsewhere (section 18) — P37's precedent |
| `doc/questions/q599.md` | a dated note: its first row red once in P34, at W174's gate before its readers; none in a confirming gate |
| `doc/concept.md` | (k): `:85`, `:101` and `:217` — three clauses; `check:budget` re-run |
| `doc/questions/q583.md` | (l): the `note` rewritten and a dated paragraph; still `deferred` |
| P35's draft | (m), (o), (p): two hand-off bullets; (q): B′, C, D′ (the whole of `AGENTS.md`), E and the two brief sentences for its declaration — rows and notes only, P35 NOT declared |
| `doc/workflow.md` | (r): the bookkeeping below, and nothing else |

**The bookkeeping made in `doc/workflow.md`** (P33's and P37's precedent: no new version): the Status line, *THIRTY-FIVE
times, by P1 through P34 and P37*; section 6, *a hundred and one, so the next is the HUNDRED-AND-SECOND*; the refusal
ledger's first row, *34 times, P2-P37*. **P34 does NOT join the Status line's *adopted nothing* list** — (r).

**Ids.**

- **Issued**: W169, W170, W171, W172, W173, W174, W175, W176; ADR 0101, ADR 0102, ADR 0103, ADR 0104, ADR 0105, ADR 0106;
  no question; **S12 written, NOT RAISED** (at the declaration).
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W177 CLOSED unissued, as the declaration expected;
  - Q635-Q637 SPENT (W169's), Q638-Q640 SPENT (W170's), Q641-Q643 SPENT (W171's), Q644-Q646 SPENT (W172's), Q647-Q650
    SPENT (W173's), Q651-Q654 SPENT (W174's), Q655-Q657 SPENT (W175's), Q658-Q659 SPENT (W176's). None exists in the
    tree, and (o) and (p) were answered with no question raised;
  - ADR 0107 SKIPPED — no item needed a seventh decision.

**The next plan starts at W178, Q660 and ADR 0108.** The next S id is S13; the next plan id is P38.

*`npm run state` before this section printed the tree's W177 / Q635 / ADR 0107 against the ledger's W169 / Q635 /
ADR 0101, the ledger being P37's sentence. P34 closes W177, Q635-Q659 and ADR 0107 unissued — P37's precedent for W168,
Q615-Q634 and ADR 0100. None of section 8's answers takes an id.*

### 8. Stop-and-asks for the maintainer

**Lettered after the declaration's (a)-(j). Each stale site is OUTSIDE every P34 item's `Owns` and is NOT edited
here.** *Before 0.8.0* means before the one publish after P36 (decision 6); the package ships `dist/`, `README.md` and
`AGENTS.md` only, so a stale `doc/` or `test/` sentence is not a 0.8.0 matter by itself.

| | the question | recommended | the alternative |
|---|---|---|---|
| **(k)** | **`doc/concept.md`, three sentences** in the always-read set: `:85` (*Cancel … Not yet folded here — P33* — folded since W158), `:101` (*what cancelling a RUN does is P34's*), `:217` (*stop and pause are P34's*) | **YES — three clauses, now**: `:85` *folded since P33 — the run ends `cancelled` (ADR 0094)*; `:101` *cancelling a RUN is `driver.cancel` (ADR 0104)*; `:217` *and stopping and pausing it too (ADR 0105, ADR 0106)*. About +40 bytes against concept's 864 of headroom; `check:budget` and its self-test re-run. **Not a 0.8.0 matter** (not shipped), but it is required reading and misleads every session that opens it | **A row of P35's declaration** — the same three clauses, under that item's gate; meanwhile `concept.md` states three plans as future |
| **(l)** | **`doc/questions/q583.md:9` and `:20`** — Q583's `note` and body rest on *a queued task cannot be cancelled (S2)*, false since the 0.6.0 pin and since `driver.cancel` | **YES — a record-step file**: a dated paragraph and the `note` rewritten — the losers of a race CAN now be cancelled, by id or with the run, so the hard half is what a loser's `cancelled` settlement does to a join already fired (`RN-R28` would end the run); `status` stays `deferred`. Not a 0.8.0 matter | **Leave it** for whoever reopens Q583 — the premise a reopener reads first is then false |
| **(m)** | **Three test titles short of the outcomes they name**: `test/fold/stuck.test.ts:162` and `test/definition/l4-corpus.test.ts:611` (*neither running nor awaiting_action* — `cancelling` too, `RN-R12` since v0.18; the two must move together, `l4-corpus` counts the suite by NAME), and `test/scheduler/runtime.test.ts:1989` (*the six outcomes* — nine) | **A row of P35's first item that edits `test/**`** — a title change moves `LATE_SUITES`' census and needs that item's gate. Not a 0.8.0 matter | **A `chore:` change now** under `gate:item` — three strings and the census entry |
| **(n)** | **History in the future tense**: `doc/scheduler-upstream.md:194` (a dated quote, *what a run does with a cancel is P34's*), ADR 0014:57 (*a run is over when … leaves `running` and `awaiting_action`*), and ADR 0094:77 (*that ordering is P34's to build and to test* — found by this retro) | **LEAVE all three** — each is true of the version it records, and the upstream quote is followed by S2's later notes; W171's *Out* set the precedent | **A one-line pointer** under each — *built by W174 (ADR 0105)*, *`cancelling` and `interrupted` since P34* |
| **(o)** | **The CANCEL with a throwing `onFoldInput` on `cancelRequested`** (section 4 (f), read from the code): the element is appended and the run held, no cancel is sent, and a paused run's held tasks are never handed on — `cancelling` for ever, a second call recovering only tasks already handed on. W174 C5 fixed the same shape for the stop | **Fix it BEFORE 0.8.0 — the API is new in it — as ONE row of P35's declaration**, which edits `src/driver/driver.ts` anyway: `takeStop`'s shape — the in-flight set and the release read before the element, the cancels and hand-offs in a `finally`, the throw reaching the caller; an L2 case at rest and mid-step, on a paused run too. **No question** (rule 6: one simple decision) | **Raise Q647** (W173's unused block) — owner P35, `closes-when` that L2 case — or **document it** in `AGENTS.md` section 6 as a limit and ship 0.8.0 with it |
| **(p)** | **The `OR-R10` escape** (W175 N5 / R14; W174's `takeStop` the same): a consumer's throw on a `paused`, `unpaused` or `interrupted` element TAKEN at `leaveStep()` inside a SCHEDULER EVENT's step leaves `onEvent`'s `finally` into the scheduler's `dispatchEvent` — where `OR-R10` itself says a listener's throw *is discarded* — rather than halting the run. The element is in the log and the run is what it says; what the scheduler does with the throw is NOT measured here | **The same P35 row, before 0.8.0**, with its reading decided at P35's declaration — recommended: catch it at the listener boundary as `OR-R10` catches a refusal (report it, halt the run), since a step the scheduler started has nobody else to throw to. **No question** | **Raise Q655** (W175's unused block), deferred, owner P35 — and say in `AGENTS.md` sections 8 and 18 that `onFoldInput` must not throw |
| **(q)** | Proposals A and B (section 6) | **A and B** — no workflow edit; B written into P35's draft as a hand-off for its author to copy into its declaration, as P37's retro (k) wrote B′, C, D′ and E into this plan's | any subset; or B as a workflow rule — *the WHOLE of `AGENTS.md`* would then be the `Owns` row's fifteenth refusal, and `doc/workflow.md` has 180 bytes of headroom |
| **(r)** | **`doc/workflow.md`'s bookkeeping**, outside this retro's files — the three edits P33's and P37's retros made: the Status line *THIRTY-FIVE times, by P1 through P34 and P37*; section 6's ordinal; the ledger's first row *34 times, P2-P37*. And does P34 join the *adopted nothing* list? | **YES to the three edits** (a few bytes, inside the 180 of headroom), **no version, no index entry**; the ordinal **a hundred and one, so the next is the HUNDRED-AND-SECOND** — W169's and W170's, the six unstated ones not counted; **P34 does NOT join the list** if (q) is answered as recommended — B is an adopted sentence, the maintainer's reading at P33 (i) and P37 (l) | **Count the six** at their lower bounds (W173 and W174 one each, the others unknown) — an ordinal of 107 that states four measurements nobody took; or the next plan's retro makes the edits |

**The maintainer's answer, 2026-10-17: *"as recommended"*, to all eight.**

- **(k) YES** — `doc/concept.md` `:85`, `:101` and `:217` fixed at this record step, inside `check:budget`.
- **(l) YES** — Q583's `note` rewritten and a dated paragraph added; it stays `deferred`.
- **(m) carried** — a bullet in P35's draft for its first item that edits `test/**`, the two RN-R12 titles together.
- **(n) LEAVE** — all three history sites unedited.
- **(o) and (p) — ONE row of P35's declaration, fixed BEFORE 0.8.0**: the cancel's throwing `cancelRequested` callback in
  `takeStop`'s `finally` shape, and the `OR-R10` escape caught at the listener boundary. **No question raised**; Q647 and
  Q655 stay SPENT.
- **(q) A and B** — no change to any rule in `doc/workflow.md`; B′, C, E, D′ with *the whole of `AGENTS.md`* as written,
  and the two brief sentences, written into P35's draft for its author to copy into its declaration.
- **(r) YES** — the three bookkeeping edits, made (section 7), no version; **P34 does not join the *adopted nothing*
  list**.
