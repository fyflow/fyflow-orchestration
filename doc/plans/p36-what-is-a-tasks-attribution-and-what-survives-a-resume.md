# P36 — What is a task's attribution, and what survives a resume?

**Status:** declared — 2026-10-18 on `77cf810`, from the draft carrying the maintainer's decisions 1-3 of 2026-10-14/15 and the hand-offs of P35's retro (k), (l) and (m); facts 1-14 measured at this declaration; stop-and-asks (a)-(q) ANSWERED by the maintainer 2026-10-18, all as recommended; no item started — the next is W184
**Question this plan answers:** *which run and attempt does a task's activity belong to, without
parsing its id, and what of a run — its header, its attempts — survives a crash and a resume?*
**Exit artifact:** *on the final tree, one cross-row block in `examples/l6.ts`, green in node 24 and in deno, in which:
(1) a worker on a THREADED pool and one INLINE call `context.emit`, and the run's `onTaskMessage` receives every message
with `runId`, `nodeId`, `branchPath`, `taskId`, the flow-level attempt and the scheduler's attempt number as FIELDS, in
`seq` order per attempt, a retried attempt's messages under the next attempt number — and NOTHING of a sibling run on
the same runtime, whose own messages reach its own callback; (2) the same run's fold carries, on that task's `nodes`
entry, its run id, its flow-level attempt and the scheduler's attempt number equal to the attempts the scheduler made;
(3) a run whose `onHeader` is called ONCE inside `start()`, before the first `onFoldInput` and before anything reaches the
scheduler, with a header equal to the handle's — and a run whose `onHeader` THROWS, with nothing appended and nothing
handed to the scheduler; (4) a task of `retryPolicy: { maxRetries: 2 }` whose worker always fails, its store frozen
during its SECOND attempt and resumed on a fresh runtime, re-handed with `attemptsSpent: 2` and run ONCE more (attempt
number 3) — three worker calls across both processes where today's driver makes five, the control being the same
checkpoint with its attempt elements removed; (5) a run STOPPED during an attempt and resumed elsewhere counting the
stopped attempt as spent ((h)); (6) a task whose budget was already spent at the kill handed on and run once, folding
from the scheduler's own settlement — no settlement the driver wrote; and `npm run gate:full` EXIT 0 — the LAST item
runs it (workflow v0.29).* *(Refined from the draft's: clauses (4)-(6) are facts 6-8's measurements, (1)'s sibling run
is fact 9's router hazard. Each clause was written for its stop-and-ask answered as recommended, and (a)-(q) were
all answered so on 2026-10-18, so every clause stands as written.)*
**Reserves:** W184-W189 (W189 expected unused), Q680-Q699, ADR 0112-0116 (ADR 0115 and ADR 0116 expected unused); no S id ((q))

```
Question: which run and attempt does a task's activity belong to, and what of a run survives a crash and a resume?
Items:    W184 (P35 (k): a consumer callback that throws, on every road — before 0.8.0), W185 (#9: onHeader — ADR 0112),
          W186 (#10 and #18: attempts recorded and carried across a resume — ADR 0113), W187 (#8: attribution on the
          fold and the worker's messages passed through — ADR 0114), W188 (the exit artifact, on real workers in both
          runtimes; P35 (l)'s phrase)
Reserves: W184-W189 (W189 expected unused), Q680-Q699, ADR 0112-0116 (ADR 0115-0116 expected unused)
Raises:   no question; no S entry ((q))
Baseline: ids derived by `npm run state` at this declaration — P38, W184, Q680, ADR 0112 from the tree, W184, Q680,
          ADR 0112 from the ledger (P35's Retro), which AGREE. The ladder counts are NOT taken here and are W184's
          declaration step's
Measured: 2026-10-18 in a byte copy of `77cf810` at C:/tmp-p36/tree (`git archive` of the clean HEAD, its
          `node_modules` copied, never linked; `find -type l` empty); node 24.20.0 and deno 2.9.6. The copy and its
          probes (`scratch-p36/`) are left in place
```

## Why this plan, and why now

fyflow-app parses our task id to learn a task's run and attempt (`runtime/src/task-ids.ts`, its
stopgap for **#8**, P1), shows only `task.progress` for logs, gives a resumed task a fresh retry
budget (**#10**, P3, its ADR-0014 at-least-once), and can lose a run whose events were written before
its header (**#9**, P3). `fyflow-scheduler` 0.6.0 shipped what these need: `context.emit` →
`task.message`, `attemptsSpent`, `task.attemptNumber`, `task.retrying`. It declined `meta` on tasks, so
the task-id map stays ours. **The pin IS 0.6.0** (`package.json`, `examples/deno-import-map.json`; fact 1), so nothing
here waits on the scheduler.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **#9: the checkpoint header is delivered BEFORE the run's first event** — an `onHeader(header)`
   callback on `StartOptions`, called synchronously inside `start()` before the first dispatch and the
   first `onFoldInput`. `resume` takes none: its caller already holds the header. **This reverses
   [ADR 0064](../decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)'s
   rejected-alternative row** (*"the position already makes write order irrelevant"* — true of
   ordering, silent on a crash before the header is written); a new ADR says so. The pure
   `checkpointHeaderOf` helper was considered and dropped.
2. **#11 is answered here, not built** — see below.
3. **This plan runs LAST of P34-P37** (maintainer, 2026-10-15;
   [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 7), so orchestration 0.8.0 is
   published after it.

## Handed on, and copied here as the retros direct

*From [P35](p35-may-a-node-wait-for-a-person-by-design.md)'s retro, by the maintainer's answer to its stop-and-asks
(k), (l) and (m), 2026-10-18 — each re-taken as a fact at the declaration:*

- **ONE ROW, fixed before 0.8.0 is published, no question raised** ((k)): **a consumer callback that THROWS, on every
  road.** One rule — *a consumer throw on any element the driver appends is reported ONCE and HALTS the run, and on a
  driver call it also reaches the caller* — `start()`'s rule extended to `resolve()`, `resume()` and the pause, unpause
  and stop TAKEN at the end of a driver call's step. Today a take there rethrows without halting (W178's conformity
  reader, R3 note), and a throw on the resolution's own element during `resolve()` leaves the answered node routed
  nowhere, unreported (W180's Notes). Built with an **L2 SWEEP: every driver call × a callback throwing on each element
  it appends**, each asserting the halt, the one report and the throw at the caller. *P35 retro section 4 (a): six roads
  found one at a time over four items.* **Re-taken: fact 11 — and it found a SEVENTH road and a false outcome. W184.**
- **One phrase, in this plan's EXIT-ARTIFACT item** ((l)), which owns `examples/l6.ts`: `DRIVER_FIELDS`' `gateMemory`
  comment, *empty on every run here since no L6 row runs a gate* — false since W94. **Re-taken: fact 13. W188.**
- **B′, C and E UNCHANGED; D′ with three clauses added; the two brief sentences** ((m)) — for this declaration's
  *Work items*, copied as P35 copied P34's:
  - **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
    snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the
    change adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads
    that floor (`check:docs:selftest`, `check:budget:selftest`) as well.*
  - **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
    gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
  - **D′ — the census sites AND the readers in the plan's row**: *the plan's index row names, for each item, the census
    sites its kind of change moves — a new suite → `test/definition/l4-corpus.test.ts`; a spec version →
    `spec/README.md`'s row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed snippet →
    `scripts/check-docs.mjs`'s `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and `test/driver/retention.test.ts`'s
    `DRIVER_FIELDS`; a fact `AGENTS.md` states → the whole of `AGENTS.md` — and every file that READS the surface the
    item changes, found by a grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`: the module's
    export list, the caller that hands the value on, the publish smokes (which no lane typechecks), and the comments and
    messages that state the rule being changed.* **Every row touching `AGENTS.md` owns the WHOLE of it.** **And, added
    by P35's retro, each met twice**: *a new case in a COUNTED suite → `l4-corpus`'s per-suite count and its message*;
    *a flow added under `spec/examples/` → the corpus censuses (`spec/flow-definition.md` section 7's table,
    `spec/outcome-record.md` section 4's OR-R11 sentence and its suite, `test/definition/wiring.test.ts`'s L4 arc
    total, `test/driver/needs.test.ts`'s region census)*; *and a grep for each PREMISE the change falsifies, not only
    each changed name* (P35 W179: *a branch entry is a task*).
  - **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two,
    the probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed.*
  - **Two sentences for every item's brief**: ***each item's Record states its readers' overlap***; and ***an owner
    element a resume's replay feeds is TAKEN AT REST, between two steps*** (`RN-R19`) — which any owner element this
    plan adds will meet.

## Constraints found by the 2026-10-14 evaluation, re-taken at declaration

- **#8**: a pass-through callback (`onTaskMessage`, `onTaskProgress`) is not a fold input and does not
  touch the invariant. Derived fields on an outcome record or fold input conflict with
  `spec/outcome-record.md`'s *two sources of truth for one string*; fields on `NodeRun` — fold OUTPUT
  — are fine. The task id's attempt segment is never minted above 0 today. **Re-taken: all three HOLD** —
  `spec/outcome-record.md:124-126` (*"The record carries `taskId` and nothing derived from it … two sources of truth for
  one string"*); `buildTaskId` is called at three sites in `src/driver/driver.ts` (`:3143` with the default `0`,
  `:4102` and `:4224` with a literal `0`), and `spec/task-id.md` section 1 still calls the segment *"the flow-level
  attempt. `0` on first dispatch"*.
- **#10** is [Q365](../questions/q365.md) with [Q26](../questions/q26.md). *Budget already spent,
  so fold as failed* would have the driver synthesise a settlement, against
  [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
  and [ADR 0060](../decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md);
  0.6.0's `attemptsSpent` lets the scheduler do the counting instead. **Re-taken: both questions `deferred`** — Q365
  *"no owner — a fix needs the scheduler's attempt event (Q26)"*, Q26 *"P29 W121: defer — OR-R4 records no
  task.running … Q365's fix is the first thing that would"*; and fact 7 measures *the scheduler does the counting*.
- **#18's question** — does a stopped attempt count as spent? The app would count it, as a kill does.
  Answered here, after [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) builds the stop. **Re-taken: P34 *Out*
  row 84 hands it here; fact 8 reads what the log already says.**

## Answered here, not built

| # | ask | answer |
|---|---|---|
| **#11** | resume should notice a changed definition, not only a changed `version` | **Deferred**, with [Q372](../questions/q372.md) and [Q249](../questions/q249.md) — both `deferred` at this declaration. A hash of the definition is async (`crypto.subtle`) where `start` is sync, and a predicate's code cannot be hashed at all. The app is already safe: it resumes only against immutable Flow Versions (its ADR-0004) |

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass1.md`, items 8, 9, 10, 18
(the app is pinned to orchestration 0.7.0 and scheduler 0.5.2, and asks for the 0.6.0 peer — fact 1).

| ask | # | where it is answered |
|---|---|---|
| `runId`, `nodeId`, `branchPath`, `attempt` as FIELDS on progress events reaching the caller | #8 | (k), W187 |
| the same on `RunState.nodes` entries | #8 | (j), W187 — `nodeId` and `branchPath` are there already (fact 10) |
| BOTH attempts — the id's flow-level segment and the scheduler's 1-based `attemptNumber` — *"under names that cannot be confused"* | #8 | (j), (k): `flowAttempt` and `attemptNumber` |
| a `StartOptions` callback, e.g. `onTaskMessage`, with those fields; subscribed before the run's first task | #8 | (k), W187; fact 9 |
| `context.emit` reachable from a node type's worker | #8 | **already there** — `spec/flow-definition.md` v0.33, W159; `AGENTS.md` section 13 (*"the library reads neither"*) |
| optionally, a pool's `worker.message` passed through | #8 | (m) — Out, recommended |
| the header delivered before the first `onFoldInput` | #9 | decision 1; (d), (e), W185 |
| on `task.running` record `max(stored, attemptNumber)` as a fold input; on resume re-add with `attemptsSpent` | #10 | (f), (g), W186 |
| *"we would rather the task fold as failed under its policy … than run once more"* | #10 | (g) — recommended AGAINST: a driver-written settlement (constraint 2) |
| optionally record `task.retrying` | #10 | (n) — Out, recommended |
| *"Please say whether a stopped attempt counts as spent"* | #18 | (h), W186 |
| a content hash of the definition | #11 | deferred (above) |

## Facts measured at this declaration

On `77cf810`, the scheduler read at the pin from `node_modules/fyflow-scheduler` and nowhere else. Each probe is a script
in `C:/tmp-p36/tree/scratch-p36/`, run under node 24.20.0 and deno 2.9.6 with BYTE-IDENTICAL output in both.

**Fact 1 — the pin ships all four, and the app's premise holds.** `npm run state`: scheduler pin **0.6.0**
(`package.json:129,134`; `examples/deno-import-map.json:4` `jsr:@fyflow/scheduler@0.6.0`); `node_modules/fyflow-scheduler`
reads 0.6.0. Its `AGENTS.md` documents `attemptsSpent` (§5's task table), `attempts`/`attemptNumber` (*"Always
`attempts + 1` at dispatch"*), `task.retrying` and `task.message` (§6), and the recipe *"Resuming after a restart,
without resetting the retry budget"* (§10: record `max(stored, attemptNumber)` on `task.running`; pass `attemptsSpent`).
**No stop-and-ask on the pin.** `package.json`'s `version` already reads **0.8.0** (`npm run state`); decision 3's publish
is after this plan.

**Fact 2 — `task.message`'s detail, measured (`probe-sched.ts`, a real `FyflowScheduler`, an inline pool).** Keys exactly
`attemptNumber, data, name, seq, taskId, timestamp, workerId` — **no `id`**, where every lifecycle event's detail is the
task and carries `id`. Two emits per attempt arrive as `seq` 0 and 1, both BEFORE the attempt's `task.retrying` or
settlement; a retry restarts `seq` at 0 under the next `attemptNumber`. **A listener added between two tasks heard 2
messages — the second task's only**: the scheduler sends nothing while nobody listens (its §6), so whatever subscribes
decides whether workers pay to emit.

**Fact 3 — attempts at the pin, measured (`probe-sched.ts`).**

| task | `maxRetries` | `attemptsSpent` | the worker | events | settled `attempts` / `attemptNumber` |
|---|---|---|---|---|---|
| A | 2 | 0 | fails once | `running` 1, `retrying` (attempts 1), `running` 2, `completed` | done, **1 / 2** |
| B | 2 | 3 | succeeds | `running` **4**, `completed` | done, **3 / 4** — the budget spent, it STILL RUNS ONCE |
| C | 1 | 1 | always fails | `running` 2, `failed` + `user_action` | user_action, 1 / 2 — one attempt, not two |
| D | 1 | 0 | always fails | `running` 1, `retrying`, `running` 2, `failed` + `user_action` | user_action, **1 / 2** — the LAST failure does not increment `attempts` |
| E | none | 5 | succeeds | `running` **6**, `completed` | done, **5 / 6** — no budget to carry, and the count moves anyway |

So: `attemptNumber` is `attempts + 1` at every settlement measured; **`attempts` STARTS at `attemptsSpent`** (B, E), so an
outcome record written after a resume reports the attempts of BOTH processes; and `task.running` fires exactly once per
attempt here (a requeue repeats its number — §5, not provoked).

**Fact 4 — what the driver hears today.** `SETTLEMENT_EVENTS` (`src/driver/driver.ts:1277`) is the four settlement
events and nothing else; `normalizeEvent` returns `null` for `task.running` and `task.progress` (`src/driver/listener.ts:82`,
`OR-R4`); `TaskDetailLike` (`listener.ts:18-28`) has no `attemptNumber`. **No `src/` line names `task.message`,
`attemptsSpent`, `attemptNumber`, `task.retrying` or `onHeader`.** `doc/concept.md` section 3 (line 80) says of the four new
events *"none subscribed yet: `task.cancelled` is W158's, the rest P36's"* — a sentence of the always-read set this plan
makes false ((o)). `AGENTS.md` section 12's no-scheduler snippet says *"The driver subscribes to four of them"* — a premise
(D′'s premise grep).

**Fact 5 — #9, the header's timing, re-taken (`probe-driver.ts`, L2).** Elements delivered to `onFoldInput` before
`start()` returns: **1** for an entry task, **7** for an entry fan-out of three (2N + 1) — ADR 0064 fact 5's figures,
unchanged. The header is built at `driver.ts:1895-1896` — AFTER `FD-R4`'s walk and the payload's `structuredClone`,
BEFORE `started` is set and `enter()` dispatches — so a callback there sees a refused payload never and the first element
always after. `RunHandle.header`'s comment (`src/scheduler/runtime.ts:333-345`) and `AGENTS.md` section 18's table and
paragraph state the after-ordering as measured-and-unavoidable — premises W185 falsifies. **Where a callback can go**:
`StartOptions` is a `Pick` of `DriverOptions` (`runtime.ts:238-240`), bound both ways by
`test/scheduler/runtime.test.ts`'s *"every DriverOptions member is reachable from createRuntime — ORPHAN COUNT 0"*
(`:1233`), which pins `joinPolicy`, `runId` on the defaulted road (`:1382`) and `onFoldInput` on the composed one
(`:1384`); `ResumeOptions` is `Omit<StartOptions, 'runId'>` (`:252`). So a runtime cannot call `onHeader` before the first
dispatch unless the DRIVER does — (d).

**Fact 6 — #10, what a resume hands the scheduler today (`probe-driver.ts`).** An in-flight task with
`retryPolicy: { maxRetries: 2 }` re-dispatched by `resume()` is handed `createTask` the keys `id, optional, payload,
retryPolicy, workerType` — **no `attemptsSpent`**, so the scheduler starts it at a fresh budget: `RN-R21`'s and
`AGENTS.md` section 18's *"a re-run task gets a FRESH retry budget"*, Q365's *"a budget of two attempts ran THREE times
across one kill"* (W89). `TaskFactory`'s config type (`driver.ts:1046-1061`) carries no such key; the default factory
spreads the config into `new FyflowTask(config)`, and a consumer `createTask` building the task FIELD BY FIELD would drop
a new key in silence. `isFed` (`driver.ts:583-586`) names SIX kinds; `RUN_FOR` (`test/driver/checkpoint.test.ts:148`) is a
`Record<FoldInput['kind'], …>` over the FIFTEEN kinds, so a sixteenth fails L0 until it has a run; an ADDED kind is not a
`CHECKPOINT_FORMAT` change (P34 (f)). `OR-R4` (`spec/outcome-record.md:160`) already has the precedent for recording a
non-settlement as a FOLD INPUT and never a log record: `cancelRequested` (*"section 1 fixes the log at two kinds"*).

**Fact 7 — #10, the budget-spent case, read against the rules.** The scheduler runs a task whose budget is spent ONCE
(fact 3 B, C) — so re-handing it with `attemptsSpent` makes the overrun at most ONE attempt per resume, and every
settlement is still the scheduler's. *Fold it as failed* (the app's preference) means the driver appends an
`outcome` the scheduler never produced: `OR-R3` and [ADR 0060](../decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)
rule 3 (*no terminal state is authored* by the driver) and ADR 0007 (every outcome record is the scheduler's) refuse it,
as P35 fact 13 read for the ask. *Not re-dispatching it* leaves it dispatched and unsettled — in flight for ever, the run
`running` and its `done` pending.

**Fact 8 — #18, what the log says of a stopped attempt.** `stop()` makes the driver DEAF before its `interrupted`
element and sends the cancels after (`RN-R33` (3)-(5)); a `task.running` heard BEFORE the stop is in the log, one after
it is not. So under (f) an attempt that STARTED before the stop is recorded and counts — the app's reading, *as a kill
does* — with no line of code for it; NOT counting it needs the resume to subtract one for each task in flight at a stored
`interrupted` whose attempt had started. A cancel ends a task `cancelled`, which the scheduler never retries (its §5), so
counting costs only RETRIES: a task with `maxRetries: 0` still runs once on the resume (fact 3 C).

**Fact 9 — #8, the runtime's router and `task.message`.** `settlementRouter` (`src/scheduler/runtime.ts:890-950`, ADR 0088)
reads `detail.id` and nothing else (`:897-898`); an id that is absent or does not parse goes to EVERY driver subscribed
to that event name (`:907`, rule 4's third row). **`task.message` has no `id` (fact 2), so a per-run subscription to it
would be BROADCAST to every run's driver** — N deliveries per message, each driver dropping the others' — where
`task.progress`, spread flat, has `id` and routes. The router subscribes the scheduler ONCE per event name and never
unsubscribes (`:939`; ADR 0091 removes drivers, never subscriptions), so once one run on a runtime listens, every run's
workers emit.

**Fact 10 — #8, what the fold already carries.** `NodeRun` (`src/fold/run-state.ts:87-102`) has `nodeId`, `branchPath`,
`state`, `result`, `error` and, since P35, the optional `input`; `RunState.runId` is `string | null`. `RunState.nodes` is
keyed by TASK id, so `parseTaskId` already yields run and flow-level attempt — the parse the app's stopgap does. **No
element carries the scheduler's attempt number for a RUNNING task**; at a settlement the record's `attempts` gives it
(`attempts + 1`, fact 3) — and for a task cancelled before it ran, `0`.

**Fact 11 — P35 (k), the throwing-callback roads, re-taken (`probe-driver.ts`, L2, a double whose `cancel` resolves).**
A callback throwing ONCE on the named element; *halted* is `hasFailed()` and the fold's `halted`:

| road | the call | `onRunFailure` | halted | the fold reads |
|---|---|---|---|---|
| R1 `start()`, on the entry's `dispatched` — the CONTROL | throws | 1 | **yes** | `halted`; nothing handed to the scheduler |
| R2 `resolve()` of an ASK, on its `resolution` | throws | 0 | no | **`completed`** — the successor never dispatched, nothing running, nothing parked: a FALSE outcome |
| R3 `resolve()` of an ask, on the successor's `dispatched`, later in the same step | throws | 1 | **yes** | `halted` — a call's step DOES halt on a non-first element |
| R4 `resolve()` of a PARKED TASK, on its `resolution` | throws | 0 | no | **`completed`** — the same false outcome, pre-existing |
| R5 a pause TAKEN at the end of `resolve()`'s step, on `paused` | throws | 0 | no | `running`, the successor already handed on |
| R6 `pause()` at rest, on `paused` | throws | 0 | no | `running` |
| R7 `unpause()` at rest, on `unpaused` | throws | 0 | no | `running`, the held task handed on |
| R8 `stop()` at rest, on `interrupted` | throws | 0 | no | `interrupted` (cancels sent — W174) |
| R9 `cancel()` at rest, on `cancelRequested` | throws | 0 | no | `cancelling` (cancels sent — W178) |
| R10 a scheduler event's step, on `asked` — the reported road | returns | 1 | **yes** | `halted` (W178 (j)) |
| R11 `resume()`, on its `resumed` element | throws | 0 | no | **`running` for ever: the in-flight task was NEVER handed to the scheduler** |

**R2 and R4 are worse than P35's retro read them** (*"routed nowhere, unreported"*): the run folds `completed`, so a
runtime's `done` settles a run that never reached its `end`. **R11 is a seventh road** no item named: a hang, with
nothing reported. The asymmetry is per ELEMENT, not per call — R3 halts where R2 does not, on one `resolve()`.

**Fact 12 — what the rule (k) states would change on the owner controls at rest.** R8 halted: `halted` outranks
`interrupted` (`RN-R7`), so a STOP whose element a callback threw on is not resumable — what P35 (j) already decided for a
stop taken in a scheduler event's step (`RN-R33` v0.21). R9 halted: `halted` outranks `cancelling`, so `done` settles
`halted` at once rather than after the last task stops (`RN-R33`'s *on a runtime … `done` settles `halted` or `cancelled`
at once*). R6, R7: a pause or unpause halted. (b) and (c) put these.

**Fact 13 — P35 (l), the phrase, at its line on this tree**: `examples/l6.ts:13213`, *"`RN-R13`'s fourth term, empty on
every run here since no L6 row runs a gate"* — false since W94 (block (2h) runs a `distinct` gate; W155's rows run `if`
and `switch`). No check reads it.

**Fact 14 — the census at this declaration.** `RUN_FLOOR` **43** (`scripts/check-docs.mjs:734`); `X10` **2743 / 203**
(`examples/README.md:38`, `:70`); `RUN_FOR` 15 kinds; `isFed` 6; `DRIVER_FIELDS` at `examples/l6.ts:13198` and
`test/driver/retention.test.ts:264`; `LATE_SUITES` at `test/definition/l4-corpus.test.ts:427`. Spec versions:
`flow-definition.md` v0.43, `run-state.md` v0.23, `outcome-record.md` v0.18, `join-policy.md` v0.23, `task-id.md` v0.14;
next free rule ids `RN-R39`, `OR-R14`, `FD-R7`, `ID-R7`. `check:budget` headroom: `CLAUDE.md` 470, `doc/workflow.md` 165,
`doc/concept.md` 636 bytes. **The draft's *"`AGENTS.md` sections 17-18"* is stale**: section 17 is the `map` per-item
section; the sentences this plan falsifies are in sections 2, 8, 9, 11, 12, 13 and 18 — and D′ owns the whole file anyway.

## Scope

**In** — P35 (k): the throwing-callback rule on every road, before 0.8.0 (W184); #9 `onHeader` (W185); #10 attempts
recorded and carried across a resume, and #18's answer (W186); #8 attribution — the run, the flow-level attempt and the
scheduler's attempt number on the fold's `nodes` entries, and a task's `task.message` and `task.progress` passed through
to the caller with them, the runtime routing each to its run (W187); the specs `run-state.md`, `outcome-record.md`,
`task-id.md` (the attempt segment named `flowAttempt` on `NodeRun`, (j)), `spec/README.md`; `AGENTS.md`; `doc/concept.md` section 3's
events row ((o)); the exit artifact at L6 in both runtimes, and P35 (l)'s phrase (W188).

**Out** — #11 (answered above); `meta` on tasks (declined by the scheduler); a pool's `worker.message` ((m));
`task.retrying` as a recorded element ((n)); a flow-level re-dispatch minting an attempt above 0 ([Q16](../questions/q16.md)'s
flow half); a store, a serializer, or any write the library makes (P23 decision 1).

## Decisions taken at this declaration

*Each follows from a decision above or a precedent named beside it; what the facts newly force is a stop-and-ask below.*

4. **P35 (k)'s row is W184, FIRST** — as P35's W178 went first — so every element a later item adds is born under the
   rule and its sweep, and W188's `gate:full` runs over it. Fact 11's eleven roads are its first cases, each RED on today's
   tree where the table says so.
5. **A pass-through is never a fold input and never in a checkpoint** — constraint 1: `onTaskMessage` and
   `onTaskProgress` deliver what the scheduler said, copied at the listener boundary (ADR 0007 rule 1), and nothing the
   fold reads moves.
6. **What is recorded of an attempt is a FOLD INPUT, never a log record** — fact 6's `cancelRequested` precedent; the log
   keeps its two kinds and `snapshot()` does not move.
7. **No driver-written settlement** — fact 7: whatever (g) is answered, every `outcome` stays the scheduler's.
8. **Each changed public surface is stated BREAKING where it changes** — P33 decision 7, P34 decision 10, P35 decision 8
   — and all ship in 0.8.0 ((p)).
9. **Three ADRs** — ADR 0112 the header before the first event ((d), (e)), recording decision 1's reversal of ADR 0064's
   rejected-alternative row; ADR 0113 attempts across a resume ((f)-(i)), amending ADR 0065's *fresh budget* and answering
   Q365 and Q26; ADR 0114 attribution and the pass-through ((j)-(l)), amending ADR 0088 rule 3. **P35 (k)'s rule is a SPEC
   row, no ADR** — P35 (j)'s precedent (`OR-R10`). ADR 0115-0116 are reserved for an answer that needs a fourth.

### Stop-and-asks — ANSWERED by the maintainer, 2026-10-18

**Each is the maintainer's, and each was answered as recommended** (the answer block below the table); no row of
*Work items* moved.

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **Scope** — what this plan builds | **As *Scope* says**: P35 (k)'s row; #9; #10 with #18; #8 as BOTH the fold's fields AND two pass-throughs (`task.message` and `task.progress` — the app's ask names both); the specs, `AGENTS.md`, `doc/concept.md`'s one row; the exit artifact. Out: #11, `meta`, `worker.message`, `task.retrying`, flow-level re-dispatch | **#8 as the fold's fields only** (no pass-through): smaller, but the app keeps parsing for logs, its #8 P1. **`task.message` only, no `onTaskProgress`**: the app shows progress today by subscribing itself and parsing `id` — the stopgap stays. **Split #8 into its own plan**: 0.8.0 then ships without it (decision 3 publishes once, after P36) |
| **(b)** | **P35 (k)'s rule on the owner controls called AT REST** — a throw on `paused`, `unpaused`, `interrupted` or `cancelRequested` (fact 11 R6-R9) | **The rule as written: reported once, the run HALTED, the throw at the caller** — and the side effects the element announces still made in a `finally` (the cancels of a stop and a cancel, a hand-off of an unpause), as W174 and W178 made them. So a stop whose element a callback threw on is NOT resumable and a cancel's `done` settles `halted` at once (fact 12) — what P35 (j) already decided on the scheduler's road | **Exempt the at-rest controls** — rethrow only, as today: a stop stays resumable after a consumer bug, but the rule is two rules again, the asymmetry P35 (k) was answered to remove. **Halt but keep a stopped run resumable** — a resume that accepts a `halted` after `interrupted`: `RN-R23`'s *a halted run is not resumable* gains an exception |
| **(c)** | **A throw on `resume()`'s own `resumed` element** (fact 11 R11 — today the in-flight set is never handed on and the run hangs) | **Reported once, the run HALTED, the CONSUMER's error thrown at `resume()`'s caller; nothing handed on** — the stored run plus `resumed` plus `halted` is the checkpoint, refused `halted` if resumed again. **The lost-tail road keeps `ResumeRefused('halted')`** (`RN-R37`: a halt the REPLAY regenerates is the stored run's) | **Hand the in-flight set on in a `finally`, then halt**: the tasks run for a halted run and settle into no driver (ADR 0091 releases it). **Throw `ResumeRefused('halted')` for `resumed` too**, the consumer's error as its `cause` — one class for every refused resume, but `resumed` is the driver's own element, not the stored run's |
| **(d)** | **Where `onHeader` lives** (decision 1 says *on `StartOptions`*; fact 5) | **A `DriverOptions` member, in `StartOptions`' `Pick` and OMITTED from `ResumeOptions`** (`Omit<StartOptions, 'runId' \| 'onHeader'>`) — the driver calls it, because only the driver stands between the header and the first dispatch; a hand-built `Driver` gets it too. Called by `start()` only; `resume()` never calls it | **On `StartOptions` alone, the runtime calling it** — impossible without a driver hook (`start` dispatches synchronously inside `driver.start`). **The header as fold-input element 0** — no callback, but every log moves by one and `CHECKPOINT_FORMAT` becomes 2 (a reinterpreted shape, P34 (f)). **Accepted on `ResumeOptions` and ignored** — a member that does nothing |
| **(e)** | **`onHeader`'s contract** | **Called ONCE, synchronously, inside `start()` AFTER `FD-R4` and the payload's clone and BEFORE anything is appended or handed to the scheduler, with a FROZEN COPY equal to `checkpoint().header` and to `handle.header`. A THROW from it leaves the driver UNSTARTED** — nothing appended, nothing handed on, nothing reported (no run exists, as after an `FD-R4` refusal) — **reaches `start()`'s caller, and a corrected retry may start the same driver**; on a runtime the run id is spent (ADR 0091 rule 4, as for a refused start). `FD-R4`'s refusal and a `DataCloneError` mean it is never called | **Started-and-halted** — `halted` appended, `onRunFailure` called: a run whose header the store never wrote, which is the case #9 exists to remove. **Discard its throw**: the store failing to write the header goes unnoticed and the run starts headless — #9's crash, made silent |
| **(f)** | **What is recorded of an attempt** (facts 3, 4, 6) | **A FED fold input `{ kind: 'attempted', taskId, attemptNumber }`, appended on `task.running` for a task THIS run dispatched, only when its `attemptNumber` exceeds the last recorded for that task** (a requeue, which repeats its number, appends nothing — the app's `max`), for EVERY task. Fed by the replay at its position (`isFed`'s seventh kind) — a scheduler stimulus, regenerated by nothing; `RUN_FOR`'s sixteenth. Not deaf-exempt: a stopped driver hears none. **BREAKING** (`FoldInput`). Cost: about ONE element per task per attempt — measured by W186's B′ copy over the corpus | **Only tasks whose effective `retryPolicy` has `maxRetries > 0`**: fewer elements, but no running attempt number for the rest ((j)) and a rule that depends on a policy the fold cannot see. **`task.retrying` only**: nothing on the happy path, but the attempt in flight at a kill is NOT counted — one attempt more per kill than the app asks. **A pass-through callback only**: nothing durable, so #10 is not met |
| **(g)** | **How a resume uses it, and the budget already spent** (facts 6, 7) | **Each in-flight task re-handed with `attemptsSpent` = the highest `attemptNumber` recorded for it** — `TaskFactory`'s config gains an OPTIONAL `attemptsSpent`, present only when above 0 (W58's *a key is added only when present*), for a task with no `retryPolicy` too, so the attempt number continues (fact 3 E). **A spent budget is handed on anyway: the scheduler runs it once more and settles it** — at most ONE attempt over budget per resume, no settlement the driver wrote (decision 7). `AGENTS.md` says a `createTask` that builds field by field must carry the key | **Fold it as failed under its policy** (the app's preference): the driver authors a terminal state — reverses `OR-R3`, ADR 0060 rule 3 and ADR 0007 (fact 7), an ADR of its own. **Do not re-hand it**: in flight for ever, the run `running`, `done` pending |
| **(h)** | **#18 — does a stopped attempt count as spent?** (fact 8) | **YES, as a kill does — no special case**: the attempt's `attempted` element is in the log before `interrupted`, and the resume reads it like any other. A stop then costs a task one RETRY, never its last run (fact 3 C) | **Not counted** — the resume subtracts one for each task in flight at a stored `interrupted` whose attempt had started: the owner's stop costs no retry, at the price of a rule by which a kill and a stop differ, and a task that FINISHED before its cancel arrived is ambiguous either way |
| **(i)** | **What `OutcomeRecord.attempts` means after a resume** (fact 3 B, E) | **The scheduler's own count, unchanged — which STARTS at `attemptsSpent`**, so a settlement after a resume reports the attempts of both processes. Stated in `spec/outcome-record.md` section 2 and `AGENTS.md` (ADR 0007: the record is the scheduler's). A behaviour change, not a type change | **Subtract `attemptsSpent` in the listener** so `attempts` stays per process: driver arithmetic on a scheduler field, and a predicate reading `attempts` sees a number no scheduler reported |
| **(j)** | **The attribution on `RunState.nodes` entries** (fact 10) | **`NodeRun` gains three REQUIRED fields: `runId: string`, `flowAttempt: number` (the task id's segment — `0` until a flow-level re-dispatch exists) and `attemptNumber: number \| null` (the scheduler's, from the latest `attempted` element; `null` before the first attempt starts, on an ask, and on a log written before 0.8.0)**. Fold OUTPUT, so constraint 1 holds. **BREAKING** for code that builds a `NodeRun` literal | **Optional fields** — additive, as P35's `input`; but every reader handles `undefined` for a field that is always derivable. **Other names** — `attempt` and `schedulerAttempt`: `attempt` is the confusable word the app asked us to avoid. **No `runId`** — `RunState.runId` already says it; the app reads `nodes` entries on their own |
| **(k)** | **The pass-through** (facts 2, 9) | **`onTaskMessage(m)` and `onTaskProgress(p)`, `DriverOptions` members in `StartOptions`' `Pick`** (the binding test moves). `m` = `{ runId, nodeId, branchPath, taskId, flowAttempt, attemptNumber, name, data, seq, timestamp, dropped?, error? }`; `p` = `{ runId, nodeId, branchPath, taskId, flowAttempt, attemptNumber, progress, message, details, timestamp }` — fields copied in the listener, handed out FROZEN (`OR-R7`). **Subscribed only when the callback is given** (fact 2: workers then pay nothing). Delivered for a task THIS run dispatched only — another id is dropped, never `UndispatchedTask`, a message never stops a run by existing — and not once the driver is deaf (stopped) or released. **A THROW from either takes `onUnmintedTask`'s road**: caught at the listener boundary, reported, the run halted (one rule for every consumer callback, P35 (k)) | **One `onTaskEvent(e)` union** — one member, a discriminant every consumer switches on. **Always subscribe** — simpler, but every worker of every run emits whether anyone listens. **A throw DISCARDED** — a logging bug never stops a run, and is never heard of |
| **(l)** | **The router and `task.message`** (fact 9) | **ADR 0088 rule 3 amended: the router reads `detail.id`, else `detail.taskId`** — so a message reaches only its own run's driver, linear in N like a settlement | **No change** — every message broadcast to every run's driver, N² per message on one runtime, each dropping the others' |
| **(m)** | **A pool's `worker.message`** (the app's *optionally*) | **Out** — it belongs to no run and no task; a consumer listens on `runtime.pools[name]` | **A runtime-level `onWorkerMessage`**, keyed by type and pool — a `RuntimeOptions` member, not a run's |
| **(n)** | **`task.retrying`** (the app's *optionally*) | **Out** — (f)'s element already says an attempt started; a failed attempt's error is the scheduler's to report, and nothing here routes on it | **A fed `retried` element carrying the error** — one per failed retried attempt; a host shows *failed and retried*, the log grows only on failure |
| **(o)** | **`doc/concept.md` section 3's events row** (fact 4: *"none subscribed yet … the rest P36's"*) | **Amend one clause in W187**, the item that subscribes the last of them (within 636 bytes of headroom; B′'s `check:budget:selftest`) | **Leave it** — the always-read set then says nothing is subscribed. **A row of W188** — the same clause, later |
| **(p)** | **What ships BREAKING in 0.8.0 from this plan** | **All of it, each stated where it changes** (decision 8): `FoldInput` gains `attempted` (W186); `NodeRun`'s three required fields (W187, (j)); `OutcomeRecord.attempts` after a resume ((i), W186); a resume re-handing `attemptsSpent` (behaviour, W186); the at-rest controls HALTING on a consumer throw ((b), W184). Additive: `onHeader`, `onTaskMessage`, `onTaskProgress`, `TaskFactory`'s `attemptsSpent?` | **Hold the `NodeRun` fields optional** to keep that one additive ((j)'s alternative); or **ship #8 in a 0.8.x** after the publish — decision 3 publishes once |
| **(q)** | **An S entry for `task.message`'s `taskId`** — every other `task.*` detail carries `id` (fact 2) | **NO S entry** — the scheduler's §6 documents the shape, and (l) is the one-line workaround; `doc/scheduler-upstream.md` is not edited | **Raise S13** — *`task.message`'s detail carries `id` as every task event does* — an edit outside this plan's file, with (l) as its workaround |

**The answer, as given**: *"As recommended"*, to all seventeen, 2026-10-18. So, as decisions of this plan:
**(a)** the scope as *Scope* states it — #8 as the fold's fields AND both pass-throughs; out: #11, `meta`,
`worker.message`, `task.retrying`, flow-level re-dispatch; **(b)** a consumer throw on `paused`, `unpaused`,
`interrupted` or `cancelRequested` at rest is reported once, HALTS the run and reaches the caller, the element's side
effects (cancels, hand-offs) still made in a `finally` — a stop so halted is not resumable, a cancel so halted settles
`done` `halted` at once (W184); **(c)** a throw on `resume()`'s `resumed` element is reported once, halts the run and
throws the CONSUMER's error at `resume()`'s caller, nothing handed on; the lost-tail road keeps `ResumeRefused('halted')`
(W184); **(d)** `onHeader` is a `DriverOptions` member, in `StartOptions`' `Pick`, omitted from `ResumeOptions`, called by
`start()` only (W185, ADR 0112); **(e)** called once, synchronously, after `FD-R4` and the payload's clone and before
anything is appended or handed on, with a frozen copy of the header; its throw leaves the driver UNSTARTED, reports
nothing, reaches the caller and may be retried; on a runtime the run id is spent (W185); **(f)** a fed fold input
`{ kind: 'attempted', taskId, attemptNumber }` on `task.running`, own tasks only, only when the number rises, every task
— BREAKING (W186, ADR 0113); **(g)** a resume re-hands each in-flight task with `attemptsSpent` = the highest recorded
number (an optional `TaskFactory` key, present only above 0, with or without a `retryPolicy`), a spent budget handed on
and run once by the scheduler, no driver-written settlement (W186); **(h)** a stopped attempt counts as spent, no special
case (W186); **(i)** `OutcomeRecord.attempts` stays the scheduler's count, which after a resume includes the earlier
process's attempts (W186); **(j)** `NodeRun` gains REQUIRED `runId`, `flowAttempt` and `attemptNumber: number | null` —
BREAKING (W187, ADR 0114); **(k)** `onTaskMessage` and `onTaskProgress` as `DriverOptions` members in the `Pick`, the
shapes in the row, frozen, subscribed only when given, own tasks only, nothing after a stop or a release, a throw on
`onUnmintedTask`'s road (W187); **(l)** the router reads `detail.id`, else `detail.taskId`, ADR 0088 rule 3 amended
(W187); **(m)** `worker.message` OUT; **(n)** `task.retrying` OUT; **(o)** `doc/concept.md` section 3's events row
amended by one clause in W187; **(p)** everything ships in 0.8.0, each BREAKING surface stated where it changes;
**(q)** NO S entry, `doc/scheduler-upstream.md` not edited — the plan raises no S id and the *Raises* line stands.

**What the answers set for W184's author, who starts from this file alone** (W184 Q680-Q682; `gate:item`):

1. **The rule is ONE, with three parts, on every road**: a consumer `onFoldInput` throw on any element the driver
   appends (i) is reported ONCE through `onRunFailure`, its `kind` the consumer's error class (`OR-R10`'s form);
   (ii) HALTS the run — the `halted` element appended after the element thrown on, nothing further dispatched, routed
   or emitted for the run; (iii) on a DRIVER CALL's step — `start`, `resume`, `resolve`, `cancel`, `stop`, `pause`,
   `unpause` — the consumer's own error is ALSO thrown at the caller; on a scheduler event's step it is not (W178's road,
   unchanged). **Today's control is R1** (`start()`): fact 11's other roads are brought to it.
2. **Side effects survive the halt** ((b)): a stop's and a cancel's cancels and every `stop()`/`cancel()` promise, and
   an unpause's or a cancel's hand-off of HELD tasks, are made in a `finally` exactly as W174 and W178 made them; a
   halted run's `done` settles `halted` at once (`RN-R33`'s existing clause).
3. **`resume()`** ((c)): a throw on `resumed` hands NOTHING on — today's R11 hang becomes a halt; the lost-tail road
   (`RN-R37`) keeps `ResumeRefused('halted')`.
4. **`resolve()`**: fact 11 R2 and R4 — today folding `completed` — become `halted`; R5's pause taken at the step's end
   halts too.
5. **"Once"**: a step whose callback throws twice (W178 R2's case — a pause and a stop pending at one step's end) reports
   ONE failure; whatever the halt does not drop is taken silently (W184's declaration step reads which, at its copy).
6. **What moves** — prediction 1: the at-rest *thrown, not halted* assertions in `test/driver/pause.test.ts`,
   `stop.test.ts`, `cancel.test.ts` and the ask suites, `AGENTS.md` section 9's *"On YOUR call's step … it is thrown to
   you instead"* and sections 6, 8 and 18's throw rows, `OR-R10`, `RN-R31`, `RN-R33`, `RN-R35` and `RN-R37`'s throw
   clauses; **BREAKING** per (p) — stated in `AGENTS.md` section 9.

## Work items

**The four sentences P35's retro (m) carried, copied as it directs** — with D′'s own clause FOLLOWED as written:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**, with P35's three clauses — *a counted suite's per-suite
  count and its message; the corpus censuses a flow under `spec/examples/` moves; a grep for each PREMISE the change
  falsifies* — as *Handed on* states it. **Followed as written**: every row below that touches `AGENTS.md` owns the WHOLE
  of it.
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two, the
  probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed.*

**Two sentences for every item's brief**: ***each item's Record states its readers' overlap***; and ***an owner
element a resume's replay feeds is TAKEN AT REST, between two steps*** (`RN-R19`) — here (f)'s `attempted` is a SCHEDULER
element, fed but appended on a scheduler event's own step, so the sentence binds W186 at the replay's feed and at a
stop's deafness, not at a caller's call.

**D′ applied — the sites each row moves.** **`RUN_FOR`** with the `attempted` kind — W186, forced at L0 (fact 6).
**`isFed`**'s six — W186. **`LATE_SUITES`** and the counted suites' per-suite counts with every new suite and case —
every row. **`RUN_FLOOR`** (43) with every `run` snippet `AGENTS.md` gains — W184-W187. **`DRIVER_FIELDS`** and
`NOT_RUN_STATE` only if an item adds a `Driver` instance field — W186's and W187's B′ copies say. **`X10`** — W188.
**`spec/README.md`** rows for every spec version moved. **The `StartOptions` binding test** (`test/scheduler/runtime.test.ts:1233`,
fact 5) — W185 and W187, each adding `Pick` members, and `ResumeOptions`' `Omit` with W185. **The router**
(`src/scheduler/runtime.ts:890-950`) — W187. **The PREMISES** a grep must find, beside the names: *the header arrives
after the first events* (`RunHandle.header`'s comment, `AGENTS.md` sections 2 and 18, ADR 0064 fact 5 and its
rejected row) — W185; *a re-run task gets a FRESH retry budget* (`RN-R21`, `RN-R19`'s fed kinds, `AGENTS.md` section 18,
ADR 0065, Q365) and *`task.running` produces no record* / *the driver subscribes to four* (`OR-R4`, `listener.ts:78-82`,
`AGENTS.md` section 12) — W186; *`attempts` counts retries within one task* (`spec/task-id.md` section 1,
`ids.ts`'s `TaskIdParts` comment, `AGENTS.md` sections 3 and 11) — W186-W187; *the library reads neither* (`AGENTS.md`
section 13) and *none subscribed yet* (`doc/concept.md` section 3) — W187; *on YOUR call's step … thrown to you instead*
(`AGENTS.md` section 9, `OR-R10`, `RN-R31`, `RN-R33`, `RN-R35`, `RN-R37`'s throw clauses) — W184. **The always-read
set**: W187 edits `doc/concept.md` section 3 ((o)), so B′'s `check:budget:selftest` clause binds it; no row edits
`CLAUDE.md` or `doc/workflow.md`.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W184 | **A consumer callback that THROWS, on every road, before 0.8.0** — P35 (k); (b), (c); fact 11 | `src/driver/driver.ts`, `src/scheduler/runtime.ts` (comments stating the rule), `spec/outcome-record.md` (`OR-R10`), `spec/run-state.md` (`RN-R31`, `RN-R33`, `RN-R35`, `RN-R37`, the resume rules), `spec/README.md`, `test/driver/**`, `test/scheduler/runtime.test.ts`, `test/definition/l4-corpus.test.ts`, `AGENTS.md`, `scripts/check-docs.mjs` | — | `gate:item`; **L2 the SWEEP** — every driver call (`start`, `resume`, `resolve` of a parked task and of an ask, `cancel`, `stop`, `pause`, `unpause`), each AT REST and each control also called MID-STEP and taken at its step's end, × a callback throwing on EACH element that call's step appends — each asserting the run `halted`, `onRunFailure` ONCE with the consumer's class, the throw at the caller, and (b)'s `finally` side effects made; a non-throwing control beside each; fact 11's R2, R4, R5-R9 and R11 RED on today's tree and green after |
| W185 | **The header before the first event** — decision 1; ADR 0112; (d), (e); fact 5 | `src/driver/driver.ts`, `src/scheduler/runtime.ts`, `src/scheduler/index.ts` (if a type is exported), `spec/run-state.md` (`RN-R15`, `RN-R18`, a new `RN-R39`), `spec/README.md`, `test/driver/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `AGENTS.md`, `scripts/check-docs.mjs`, `doc/decisions/0112-*` | W184 | `gate:item`; L2 `onHeader` called once, before the first `onFoldInput` AND before `addTask` — an entry task, and an entry fan-out of three before all seven elements — with a frozen copy equal to `checkpoint().header`; a throw: nothing appended, nothing handed on, the driver unstarted and a second `start()` accepted; `FD-R4`'s refusal and an uncloneable payload: never called; `resume()`: never called; L1 through `createRuntime`: equal to `handle.header`, and after a throw the run id refused `RunIdInUse`; the binding test's pins moved by name |
| W186 | **Attempts recorded and carried across a resume, and #18** — ADR 0113; (f)-(i); facts 3, 6-8 | `src/driver/driver.ts`, `src/driver/listener.ts`, `src/fold/run-state.ts`, `src/scheduler/runtime.ts` (if its readers move), `spec/run-state.md`, `spec/outcome-record.md` (`OR-R4`, `attempts`), `spec/task-id.md` (section 1's `attempts` sentence), `spec/README.md`, `test/driver/**`, `test/fold/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS`, if moved), `examples/run-flow.ts` (`NOT_RUN_STATE`, if moved), `AGENTS.md`, `scripts/check-docs.mjs`, `doc/decisions/0113-*` | W185 | `gate:item`; L2 one `attempted` per `task.running` of a dispatched task, none for a repeated number (a requeue), none for another run's or after a stop; fed at its position by the replay and refused `diverged` nowhere it was stored; a resume re-handing each in-flight task with `attemptsSpent` the highest recorded, ABSENT where none was, and a spent budget handed on; a stopped attempt counted ((h)); `RUN_FOR`'s sixteenth run; L3 folded twice; every flow on a double that fires no `task.running` byte-identical in its fold inputs; Q365 and Q26 closed at the record step |
| W187 | **Attribution on the fold, and a task's messages and progress passed through** — ADR 0114; (j)-(l), (o); facts 2, 9, 10 | `src/fold/run-state.ts`, `src/driver/driver.ts`, `src/driver/listener.ts`, `src/scheduler/runtime.ts` (the router, `StartOptions`), `spec/run-state.md`, `spec/task-id.md`, `spec/README.md`, `test/fold/**`, `test/driver/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` and `examples/run-flow.ts` (the census sites, if moved), `AGENTS.md`, `scripts/check-docs.mjs`, `doc/concept.md` (section 3's events row), `doc/decisions/0114-*` | W186 | `gate:item`; L1 `NodeRun`'s three fields over hand-written logs — a task before its first attempt (`null`), after a retry, after a resume, an ask (`null`), a pre-0.8.0 log (`null`); L2 `onTaskMessage` and `onTaskProgress` over a double firing `task.message` and `task.progress` — every field, frozen, only this run's tasks, NO subscription without the callback, nothing after a stop, a throw halting the run; L1 through `createRuntime`: two runs on ONE runtime, each hearing only its own messages, and the router's delivery count linear; B′'s `check:budget:selftest` |
| W188 | **The exit artifact** — the header's six clauses on real workers; P35 (l)'s phrase (fact 13) | `examples/l6.ts`, `examples/flows/**`, `examples/workers/**`, `examples/README.md` | W187 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W189 | *reserved, expected unused* | | | |

**Every row shares `src/driver/driver.ts`, `spec/README.md` or `AGENTS.md` with its neighbour, so the five are SERIAL in
the order above, never concurrent** (`doc/workflow.md` section 7 rule 2) — each declares the overlap with its predecessor
rather than an exception, because the files are in its row. Each item's file is written at its declaration step; this
table is an index, not the declaration. **No item edits `scripts/check-register*.mjs`, `scripts/state.mjs` or
`doc/questions/README.md`**, so `gate:item` is every row's but the last.

**Questions reserved per item**, so no two take one: W184 Q680-Q682, W185 Q683-Q685, W186 Q686-Q689, W187 Q690-Q693,
W188 Q694-Q696; Q697-Q699 the plan's, expected unused.

## Predictions, written before the items that test them

1. **W184's sweep is RED on today's tree exactly at fact 11's non-halting roads, in both runtimes**, and green after;
   the existing assertions that move are those asserting *thrown to the caller, not halted* at rest — named by W184's
   copy in `test/driver/pause.test.ts`, `stop.test.ts`, `cancel.test.ts` and the ask suites — and `AGENTS.md` section 9's
   sentence; **no settlement-road assertion moves**.
2. **W185 moves nothing on a run that passes no `onHeader`**: every fold-input sequence byte-identical, the only forced
   edits the binding test's pins and `ResumeOptions`' type.
3. **W186 leaves every flow on a double that fires no `task.running` byte-identical in its fold inputs**; on real
   workers each run's sequence grows by exactly one `attempted` per attempt started — so L6's existing rows that compare a
   whole sequence or count elements MOVE, and W186's copy names them; `RUN_FOR` is the one L0 site.
4. **W187 moves no fold input**; (j) answered as recommended, every `NodeRun` literal — in `test/**` and in
   `AGENTS.md`'s snippets — fails L0 until it carries the three fields, and nothing else moves at L1-L5.
5. **W188 moves `X10` by its block alone**, and no existing L6 row; P35 (l)'s phrase is its one edit outside the block.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q365](../questions/q365.md), [Q26](../questions/q26.md) | attempts across a resume; whether non-settlement events are recorded — both `deferred`, closed by W186 — (f) and (g) answered as recommended | W186 |
| [Q372](../questions/q372.md), [Q249](../questions/q249.md) | a changed definition under a resume — #11 | deferred |
| [Q16](../questions/q16.md) | a flow-level re-dispatch, the attempt segment's other half — not reopened: `flowAttempt` reads the segment, mints nothing | — |

## Record

*Filled in at the join, after the work items are merged.*
