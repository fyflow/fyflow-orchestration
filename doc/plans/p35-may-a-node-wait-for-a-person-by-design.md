# P35 — May a node wait for a person by design?

**Status:** complete and retro'd 2026-10-18 — declared 2026-10-17 on `a4a1a18`, from the draft carrying the maintainer's decisions 1-3 of 2026-10-14/15 and the hand-offs of P34's retro (m), (o), (p) and (q); facts 1-13 measured at this declaration; stop-and-asks (a)-(j) ANSWERED by the maintainer 2026-10-17, all as recommended; W178-W182 done 2026-10-17/18; the exit artifact met on W182's final tree, `gate:full` EXIT 0 (Record below); the retro ran 2026-10-18 over `5bfd4b5`, and the maintainer answered its stop-and-asks (k)-(o) the same day, all as recommended (Retro section 8)
**Question this plan answers:** *may a flow declare a node that waits for a person, keeps what reached
it, and holds the person's answer to a schema — without a task failing to get there?*
**Exit artifact:** *on the final tree, one cross-row block in `examples/l6.ts`, green in node 24 and in deno, in which:
(1) a flow's ASK node, reached after a task on real workers, parks with NOTHING handed to the scheduler for it — the
scheduler never sees its id — the fold reading the run `awaiting_action` and the node `suspended`, carrying as its kept
input exactly the value that reached it (the predecessor's result); (2) a `done` answer its answer schema refuses is
thrown at the caller by name with NOTHING appended and the node still parked, and a conforming answer on the SAME driver
is accepted and routes by a `when` over the answer to the one of two ends the answer selects, `done` settling
`completed`; (3) a `failed` answer — the person declining — routes the node's `on: ['failed']` edge; (4) an ask inside a
fan-out branch holds the join until it is answered; (5) a run parked on an ask is STOPPED on runtime A and its checkpoint
resumed on a FRESH runtime B: the ask re-parks at the same task id with the same kept input, nothing is handed to B's
scheduler for it, and it is answered there to `completed`; (6) a run parked on an ask is CANCELLED — nothing is sent to
the scheduler and `done` settles `cancelled`; (7) a PAUSED run's ask is answered and the successor it routes to is held
until unpause; and `npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).* *(Refined from the draft's:
`resolve` is the road, as (d) was answered; clauses (3)-(7) are the facts' hazards, each measured below.)*
**Reserves:** W178-W183 (W183 expected unused), Q660-Q679, ADR 0108-0111 (ADR 0110 and ADR 0111 expected unused — (j) answered as recommended, so no ADR 0110); no S id

```
Question: may a flow declare a node that waits for a person, keeps what reached it, and holds the answer to a schema?
Items:    W178 (the throwing-callback fixes (o)+(p) before 0.8.0, and (m)'s three titles), W179 (the ask node in the
          definition — ADR 0108), W180 (asking and answering in a run — ADR 0109; concept section 7), W181 (an ask under
          cancel, stop, pause and resume), W182 (the exit artifact, on real workers in both runtimes)
Reserves: W178-W183 (W183 expected unused), Q660-Q679, ADR 0108-0111 (ADR 0110-0111 expected unused)
Raises:   no question; no S entry (fact 10's throw is the runtimes' documented EventTarget behaviour, not the scheduler's)
Baseline: ids derived by `npm run state` at this declaration — P38, W178, Q660, ADR 0108 from the tree, W178, Q660,
          ADR 0108 from the ledger (P34's Retro), which AGREE. The ladder counts are NOT taken here and are W178's
          declaration step's
Measured: 2026-10-17 in a byte copy of `a4a1a18` at C:/tmp-p35/tree (`git archive` of the clean HEAD, its
          `node_modules` copied, never linked; `find -type l` empty); node 24.20.0 and deno 2.9.6. The copy is left in place
```

## Why this plan, and why now

fyflow-app's only way to wait for a person is a task that fails on purpose and parks `user_action`
(its ADR-0013): an `Ask` worker throws its question, the app stores the task's input itself, and checks
an answer schema with our `findings()`. Its pass 1 asks for the real thing — **#2 a node that waits by
design**, **#3 keep a task's input so a Resolve can use it**, **#4 a schema for what a person may
answer** — all P1. Fact 8 has the app's code, read at this declaration.

## Decisions already taken (maintainer, 2026-10-14/15)

1. **#3 and #4 are scoped to the waiting node**, not to every task: the node's own record carries
   what reached it, and its answer schema is a key on it.
2. **#12 and #13 are answered here, not built** — see below.
3. **This plan runs THIRD, after P37 and P34** (maintainer, 2026-10-15;
   [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 7). Everything ships in 0.8.0, published once
   after P36 (P34 decision 6).

## What fyflow-app asked, held against this declaration

| ask | # | where it is answered |
|---|---|---|
| a node kind or built-in node type that parks at once, running no worker | #2 | (a), W179-W180 |
| it carries a question; *"its record says it is a question, not an error"* | #2 | (a) `settings`, (b) the `asked` element — fact 8 |
| it folds to `suspended` / `awaiting_action`, so UIs and Resume keep working | #2 | (c), W180; resume (g), W181 |
| keep the (post-transform) input that reached it, surviving a resume | #3 | (f) — scoped by decision 1; *post-transform* does not arise, an ask runs no worker (fact 6) |
| `resolve(taskId, 'done', { actor, result })` | #3 | **already there** — fact 2; the app's own runner passes `result` today (fact 8) |
| a per-node answer schema; a refusal is a returned finding, not a stopped run | #4 | (d) — thrown `BoundaryRefused` by name, nothing appended, `FD-R4`'s resolve boundary (fact 7) |
| a failed task's error visible downstream | #12 | **Deferred** (below) |
| a deadline or escalation for a parked task | #13 | **Declined** (below) |

## Answered here, not built

| # | ask | answer |
|---|---|---|
| **#12** | a failed task's error visible to the nodes after it | **Deferred.** The message string is small to expose; a structured error code is a scheduler ask, because the scheduler reduces an error to `error.message`. Revisit when the app's Ask-after-a-failure-edge use is designed here — it is the natural first consumer |
| **#13** | a deadline or escalation for a parked task | **Declined.** The driver is clock-free by design; a consumer calls `resolve` on its own timer, which is the deadline it wants. A clock in the driver would make the fold depend on time |

## Handed on, and copied here as the retros direct

*From [P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md)'s retro, by the maintainer's answer to its stop-and-asks
(m), (o), (p) and (q), 2026-10-17 — each re-taken as a fact below:*

- **ONE ROW, fixed before 0.8.0 is published, no question raised** ((o), (p)): **(1)** `driver.cancel` with a consumer
  `onFoldInput` THROWING on its `cancelRequested` element — **fact 9, now MEASURED**; fixed in `takeStop`'s shape — the
  in-flight set and the release read BEFORE the element, the cancels and hand-offs in a `finally`, the throw reaching the
  caller — with an L2 case at rest, mid-step and on a paused run. **(2)** the `OR-R10` escape — **fact 10, now
  MEASURED**; its reading is (j). **W178.**
- **Three test titles, in the first item that edits `test/**`** ((m)) — **fact 11; W178**, the two `RN-R12` titles
  together because `l4-corpus` counts the suite by name.
- **B′, C, D′ (the whole of `AGENTS.md`), E and the two brief sentences** ((q)) — copied into *Work items* below.

## Facts measured at this declaration

On `a4a1a18`, the scheduler read at the pin from `node_modules/fyflow-scheduler` and nowhere else. Each probe is a script
in `C:/tmp-p35/tree/scratch-me/` run under node 24.20.0 and, where stated, deno 2.9.6.

**Fact 1 — six node kinds, an unknown one refused by name, and only a `task` has a task id.** `spec/flow-definition.md`
section 2: `task`, `fanout`, `map`, `join`, `end`, `gate`; *"Only a `task` node is ever dispatched, and therefore only a
`task` node has a task id, produces an outcome record, or can suspend"*. A `gate` routes in the driver within one turn,
has no task id and *"produces no output"* — `FD-V27` refuses a reference to it. `probe-kind.ts`: a document with
`{ kind: 'ask' }` gets exactly `[FD-V24 "node kind \"ask\" is not task|fanout|map|join|end|gate"]`. **What a new kind
moves**, counted as lines naming a kind literal: `src/definition/wiring.ts` 17, `validate.ts` 12, `regions.ts` 9,
`src/driver/driver.ts` 9, `scripts/check-spec.mjs` 6 (and its self-test 1), `examples/l6.ts` 13,
`examples/settlement-cost.ts` 1. **The precedent**: `map` (v0.8) widened FIVE enumerating rules — `FD-V2`, `FD-V6`,
`FD-V12`, `FD-V23`, `FD-V24` — and a reader found the fifth (`spec/flow-definition.md`'s own v0.8 note). The next free
validation id is `FD-V47`; runtime ids end at `FD-R6`. Spec versions: `flow-definition.md` v0.41, `run-state.md` v0.20,
`outcome-record.md` v0.16, `join-policy.md` v0.22, `task-id.md` v0.12.

**Fact 2 — parking and resolving today rest on a SETTLEMENT.** `RS-R1`'s *suspended* is `isSuspended`
(`src/driver/log.ts:55`): the task's LAST `LogRecord` is an `outcome` with `terminalState: 'user_action'`. It is read at
FIVE sites in `src/driver/driver.ts`: the replay's fed resolution (`:2064`), `resolve()` (`:2141`), and the three `ended`
refusals of `cancel` (`:2315`), `stop` (`:2426`) and `pause` (`:2508`), each `dispatchedIds().some(isSuspended)`.
**`resolve(taskId, 'done' | 'failed', { result?, error?, actor })` already carries a result** (`:2122`) — the draft's
reading holds. `FD-R4`'s resolve boundary (`:2159-2172`) holds a `done` value to the parked node's WORKER
`outputSchema`; **an ask has no worker, so nothing would hold its answer** without a new source for the schema.
**`effectiveOutcome` returns `null` for a task with no settlement** (`log.ts:83`), so a resolution alone routes NOTHING
(`advance` returns on `null`, `:2968`); and a predicate's `DecisionContext.outcome` is an `OutcomeRecord` (`routing.ts:28`)
whose `attempts` and `schedulerTimestamp` are `number` (`log.ts:19-20`) — a record a node that never ran cannot fill
honestly. `schedulerTimestamp` is read at 4 sites in `src/` and 2 in `AGENTS.md`.

**Fact 3 — the fold's `awaiting_action` is derived from any node in state `suspended`** (`src/fold/run-state.ts:633`,
`RN-R7`), below `halted`, `cancelled`, `cancelling` and `interrupted` (P34 (h)). So an element that folds a node
`suspended` reaches `awaiting_action`, `isTerminal` `false` and a runtime's `done` pending with NO precedence moved;
and `step`'s resolution arm (`RN-R9`, `:499-527`) already replaces state, result and error from the resolution alone,
taking `nodeId` and `branchPath` from the task id when no settlement precedes it.

**Fact 4 — what a new FOLD INPUT costs.** `FoldInput` has 14 kinds (`run-state.ts:267-384`). **`RUN_FOR`**
(`test/driver/checkpoint.test.ts:148`) is a `Record<FoldInput['kind'], …>` with 14 entries, so a fifteenth kind fails to
TYPECHECK until it has a run — the census is L0's. **Fed or regenerated**: `isFed` (`driver.ts:559`) names six kinds,
each one only an outside act can produce; an element the driver appends on reaching a node is REGENERATED by the
replay and compared by `sameData` (`:544`), which is deep and key-order-free — so a kept input is compared structurally
at its stored position, and a replay that composes a different input is refused `diverged` there (`RN-R20`).
**`freezeInput`** (`:793`) falls through to a shallow `{ ...i }` for every kind but four, and its own comment says the
fall-through is sound only while the kind is FLAT — `resumed` was the first non-flat kind and shipped handing the
consumer the driver's own array (W89, caught by `RN-R17`'s every-kind copy case): **a kept input is not flat and needs
its own arm**. `resumeRefusal` scans for `halted`/`stopped` and `cancelRequested`; `CHECKPOINT_FORMAT` is `1`
(`:354`), and an ADDED kind is not a format change (P34 (f)'s reading: only a reinterpreted one is). The other census
sites: `DRIVER_FIELDS` (`test/driver/retention.test.ts:264`, `examples/l6.ts:12575`) and `NOT_RUN_STATE`
(`retention.test.ts:185`, `examples/run-flow.ts:1569`) move only with a new `Driver` instance field; `RUN_FLOOR` is 40
(`scripts/check-docs.mjs:731`); `LATE_SUITES` (`test/definition/l4-corpus.test.ts:426`) moves with every new suite;
`examples/README.md:70`'s `X10` reads *190 real runs, 2711 assertions*.

**Fact 5 — an ask under P34's run control, read from the code.** `inFlight()` is `dispatched` minus settled (`:2097`): a
node the driver never DISPATCHES is never in flight. So (i) **a stop cancels nothing for it, and a resume re-dispatches
nothing for it** (`RN-R21`) — the replay regenerates the park by re-entering the node; (ii) **a cancel sends nothing for
it**, and `cancelling` → `cancelled` reads dispatched-and-unsettled tasks only, so a run parked on an ask alone reads
`cancelled` at once (P34 (i)'s *nothing per parked task* unchanged); (iii) **a pause holds nothing for it** — there is
no `addTask` to defer — and `resolve()` is accepted while paused (`RN-R35`), its routing's dispatches held; (iv) BUT
**the three `ended` refusals (fact 2) count only a parked DISPATCHED task**: a run whose only live node is a parked ask
would be refused `ended` by `cancel`, `stop` and `pause` — a run waiting on a person called finished. That is the one
place run control must learn the new park.

**Fact 6 — retention, and what an ask can keep.** [Q19](../questions/q19.md) is RESOLVED and
[ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
keeps what tasks RETURNED; `advance`'s own comment (`driver.ts:2983` on) says a node's RECEIVED value *"appears in no
record"*, and keeping it per dispatched node *"would be a payload retained per dispatched node — Q19's own subject"*.
Scoped to an ask it is ONE value per ask reached, in the log and so in the checkpoint (ADR 0064: a checkpoint is the
whole event sequence) for the life of the run; **no element has a size limit today**. **What reaches an ask is composed
in the DRIVER** — `compose()` (`:3732`) applies a node's `needs` synchronously — while a `transform` runs only in a
worker (`FD-C6`, ADR 0101): an ask, running no worker, has a composed input and never a transformed one, so the
app's *post-transform* does not arise and a `transform` on an ask has nothing to run it.

**Fact 7 — the schema checking already there.** `findings(schema, value)` and `describeFindings` are what `FD-R4` calls
at both boundaries; `BoundaryRefused('resolve', nodeId, taskId, findings, message)` (`driver.ts:225`) is thrown BEFORE
anything is appended, the task still suspended, a corrected value accepted on the same driver (`FD-R4`'s row, W73);
`DriverOptions.validateBoundaries: false` turns both boundaries off. A worker's schemas are held to the schema SUBSET at
load (P37 W164's annotations among it), so an answer schema can be held to the same subset by the same code.

**Fact 8 — fyflow-app's workaround, read at `../fyflow-app`** (pinned to orchestration **0.7.0** in every package).
`docs/adr/0013-ask-parks-by-failing-and-cancel-is-app-side.md`: `Ask` is a built-in NODE TYPE whose worker
`throw new Error(settings.question)` (`packages/runtime/src/builtins/ask.worker.ts:9-11`), `retryPolicy` 0 and not
optional (`builtins/plugin.ts:46-47`), settings `{ question (required), answer (a JSON Schema), keepInput }`
(`plugin.ts:18-31`). The input is captured in the runner's `createTask` hook into a SQLite `task_inputs` table
(`runner.ts:781-796`). Its `resolve` (`runner.ts:1209-1243`) loads the input, and for `done` calls `askResult`
(`runtime/src/ask.ts:44-56`): **no answer schema → the result IS the input (an approval)**; with one, `findings()`
refuses as `ResolutionRefused` and the task stays parked, else the result is the answer, or `{ input, answer }` when
`keepInput` is set; then `driver.resolve(taskId, outcome, { ...value, actor })` (`:1231`). Approve/Submit resolve
`done`, Decline resolves `failed` and takes `on: ['failed']`. **Its stated cost**: a parked Ask's error IS its question,
told apart from a real failure only by its node type. Its pass 1 (`.scratch/mu-upstream-adoption/requests/
fyflow-orchestration.pass1.md:103-139`) asks #2 to *"fold to the same suspended / awaiting_action states"* and says
`resolve` cannot carry a result — **false at 0.7.0 too**: the app's own call passes one.

**Fact 9 — (o) REPRODUCES, identically in node and deno** (`probe-o.ts`; split(a → a2, b) → join over L2's fake, whose
`cancel` never settles):

| run | the first `cancel()` | cancels sent by it | a second `cancel()` (no throw) | the fold |
|---|---|---|---|---|
| control — nothing throws | returns | `a`, `b` | re-sends `a`, `b` | `cancelling` |
| `onFoldInput` throws on `cancelRequested`, at rest | **throws** | **none** | sends `a`, `b` — recovers | `cancelling` |
| the same on a PAUSED run, `a` settled and `a2` HELD | **throws** | **none** | sends `b` only — **`a2` is never handed on** | **`cancelling` for ever** (`paused` still `true`) |

The cause is the order in `cancel()` (`driver.ts:2323-2350`): the `cancelRequested` append is outside any `try`, and the
held tasks' release and the in-flight read come AFTER it; `takeStop` (`:2451-2477`) is the shape that survives it.

**Fact 10 — (p): where a throw taken at `leaveStep()` inside a SCHEDULER EVENT goes, on real workers** (`probe-p.ts`;
`x` → `y` inline through `createRuntime`, `pause()` called from `onFoldInput` on `x`'s settlement, so the pause is TAKEN
at the end of that event's step — after `y` was handed on, as `RN-R35` says; the consumer throws on the `paused`
element):

| | node 24.20.0 | deno 2.9.6 |
|---|---|---|
| control (no throw) | EXIT 0; `paused` in the log; `completed` | the same |
| throw, no global handler | the throw leaves `Driver.onEvent` → `runtime.ts:911` → the scheduler's `dispatchEvent`, and node rethrows it on `process.nextTick` (`node:internal/event_target:1136`): **an uncaught exception, the process EXITS 1** | the same road to `invokeEventListeners`; **an uncaught error, EXIT 1** |
| throw, a global handler installed (`uncaughtException` / `error` with `preventDefault`) | the handler sees it; **the run goes on UN-halted**: element in the log, `hasFailed()` `false`, no `onRunFailure`, `done` `completed` | the same |

So `OR-R10`'s *a listener's throw is discarded* is false on this road in both runtimes: **a consumer's throw on a
pause, unpause or stop taken from a scheduler event KILLS THE PROCESS** unless the consumer happens to have installed a
global handler — and then the run neither halts nor reports. Not the scheduler's defect: it is each runtime's
`EventTarget` contract (no S entry).

**Fact 11 — (m)'s three titles, at their lines on this tree**: `test/fold/stuck.test.ts:162` and
`test/definition/l4-corpus.test.ts:611` (*"RN-R12 — a run is finished exactly when it is neither running nor
awaiting_action"* — `cancelling` too since `run-state.md` v0.18), and `test/scheduler/runtime.test.ts:1989` (*"the six
outcomes"* — nine `RunOutcome` values since P34, `run-state.ts:63-64`).

**Fact 12 — `doc/concept.md` section 7's exception does not cover an ask.** It admits ADR 0004's resolve because *"it
supplies the outcome for a dispatch that already happened ([Q28](../questions/q28.md))"* — an ask's answer is the
outcome of NO dispatch. A sentence of the always-read set made false by the plan's own subject; `check:budget` gives
`doc/concept.md` **799 bytes** of headroom (`CLAUDE.md` 470, `doc/workflow.md` 165).

**Fact 13 — the driver may not author a terminal state, and a park need not be one.** `OR-R3` and
[ADR 0060](../decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md) rule 3: *no terminal state is
authored* by the driver; [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md):
every outcome record is the scheduler's. A driver-written `user_action` outcome breaks both. A `dispatched` element is
the precedent that does NOT: the driver records a structural fact and the fold reads a node state (`running`) from it.
An `asked` element folding the node `suspended` is the same kind of fact; the terminal state is still the PERSON's
resolution.

## Scope

**In** — the ask node in the definition (#2) and its validation; asking and answering in a run: the park, its kept input
(#3, decision 1), its answer schema (#4); what a predicate and a successor see of the answer; an ask under cancel, stop,
pause and resume (fact 5); `doc/concept.md` section 7 (fact 12); the throwing-callback fixes (o)+(p) and (m)'s titles;
the specs `flow-definition.md`, `run-state.md`, `outcome-record.md`, `join-policy.md`, `task-id.md`; `AGENTS.md`; the exit
artifact at L6 in both runtimes.

**Out** — #12 and #13 (above); keeping every TASK's input (ADR 0046, decision 1); a deadline (#13); re-asking or
re-dispatching a node (Q16's flow half, [Q28](../questions/q28.md)); who may answer (`actor` stays opaque, Q29); an
answer's identity or authentication; a `transform` on an ask (fact 6).

## Decisions taken at this declaration

*Each follows from a decision above or a precedent named beside it; what the facts newly force is a stop-and-ask below.*

4. **The throwing-callback fix (o) is `takeStop`'s shape, without a question** (P34 (o)): `cancel()` reads the in-flight
   set and takes the paused run's held tasks out BEFORE its `cancelRequested` append, and sends the cancels and hand-offs
   in a `finally`; the throw then reaches the caller. Fact 9's three rows are W178's L2 cases, mid-step added.
5. **A park is NOT a terminal state and NOT an outcome record** — fact 13: whatever (b) names it, the driver appends a
   structural element and the person's answer is the only terminal fact; no `OutcomeRecord` is ever written for an ask.
6. **The kept input is the COMPOSED input and an ask declares no `transform`** — fact 6: refused at load if declared.
7. **Every member of an enumerating rule is widened by name** — fact 1's precedent: W179's declaration step lists every
   `FD-V` whose text enumerates kinds, and the validator gains no behaviour a rule's text does not license.
8. **Each changed public surface is stated BREAKING where it changes** — P33 decision 7, P34 decision 10: `FlowNode` and
   `FoldInput` each gain a member (a consumer's exhaustive `switch` with a `never` check stops compiling), and whatever
   (e) changes on `OutcomeRecord`. All ship in 0.8.0.
9. **Two ADRs** — ADR 0108 the ask node in the definition ((a), (h)); ADR 0109 asking and answering in a run ((b)-(g),
   (i)), amending ADR 0004 rules 4-6's *a dispatch that already happened* and `RS-R1`. ADR 0110 was reserved for (j)
   answered otherwise; (j) was answered as recommended, so ADR 0110 and ADR 0111 are expected unused. `spec/flow-definition.md` takes the definition and `FD-R4`'s
   resolve boundary, `spec/outcome-record.md` `RS-R1`, `OR-R8` and `OR-R10`, `spec/run-state.md` the fold and run
   control, `spec/join-policy.md` an ask in a region, `spec/task-id.md` an ask's id, with `spec/README.md`'s rows moving.

### Stop-and-asks — ANSWERED by the maintainer, 2026-10-17

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **What an author writes** — the node's name and shape in a flow (fact 1) | **yes — answered** — **A seventh node KIND, `ask`**: `{ id, kind: 'ask', edges, settings?, answerSchema?, needs? }`. `settings` is an opaque plain object the library never reads — the question, a form hint — which a UI reads from the definition, as a gate's are read by its type; `answerSchema` holds a `done` answer ((d)) and is held at load to the worker-schema subset (fact 7); `needs` composes what reaches it as a task's does (fact 6). **It has a TASK ID** (`r1:approve:-:0`, `spec/task-id.md`'s scheme; one per map item) though nothing is ever dispatched, because a person's answer needs an address and later nodes reference its answer — so `FD-V27` admits a reference to an ask as to a task. Allowed wherever a `task` is, the entry included; `transform`, `type`, `pool`, `optional`, `retryPolicy` and `workerGroups` refused (`FD-V47` on). Every `FD-V` that enumerates kinds widened by name (decision 7). ADR 0108, W179 | **A built-in NODE TYPE `Ask` on a `task` node** (the app's shape, fact 8): no new kind, but a `task` node that is never dispatched breaks section 2's *only a task is dispatched* in every reader that trusts it, and every task key (`pool`, `retryPolicy`, `optional`, `transform`) needs a type-specific refusal. **An option on any task node** (`ask: { … }` — park BEFORE the worker runs, then run it on the answer): a two-phase task, a dispatch after a resolution — `RS-R2`'s *never re-dispatches* reversed. **A gate type**: a gate has no task id and no output (`FD-V27`), so its answer could be neither addressed nor referenced |
| **(b)** | **What the driver appends** when an ask is reached and when it is answered | **yes — answered** — **Reached: ONE new fold input `{ kind: 'asked', taskId, input }`** — regenerated by the replay, never fed (fact 4), with its own `freezeInput` arm (a deep copy, `RN-R17`), and `RUN_FOR`'s fifteenth entry. **Answered: the EXISTING `resolution` element** — `RS-R1` widened so *suspended* is also *an `asked` element for the task and no resolution after it*; the fold's resolution arm needs no change (fact 3), and the replay feeds it as today. Inside a region the park emits `branch.suspended` and the answer `branch.resumed`, as a parked task's do. ADR 0109, W180 | **A second new kind for the answer** (`answered`): the log says *answer* rather than *resolution*, but the fold, `isFed`, the replay, `RS-R1`'s refusals and every consumer reading resolutions gain a twin. **A driver-written `outcome` with `user_action`**: no new kind, and every reader works unchanged — but it is a terminal state the driver authored, refused by `OR-R3`, ADR 0060 and ADR 0007 (fact 13) |
| **(c)** | **What the fold reads while it waits** | **yes — answered** — **The node `suspended` and the run `awaiting_action` — REUSED**, nothing new in `RunOutcome` or `NodeState` and no precedence moved (fact 3); a reader tells an ask from a parked failure by the NODE's kind in the definition, or by the `asked` element in the log — never by an error string (the app's stated cost, fact 8). W180 | **A new `NodeState` `'asking'`** and/or **`RunOutcome` `'awaiting_answer'`**: visible without the definition, but `isTerminal`, `RN-R7`'s precedence, `RN-R12`'s titles (fact 11) and every UI keyed on `awaiting_action` move — what the app's #2 asks NOT to happen |
| **(d)** | **How the answer is supplied, and how a bad one is refused** | **yes — answered** — **`resolve(taskId, 'done', { result, actor })` — the existing call**; `'failed'` with `error` is the person DECLINING, held to nothing. A `done` answer is held to the ask's `answerSchema` — `FD-R4`'s resolve boundary reading the ask's schema where a task's reads its worker's (fact 7): refused as **`BoundaryRefused`, thrown by name, NOTHING appended**, the ask still parked and a corrected answer accepted on the same driver. An ask with no `answerSchema` holds nothing. `validateBoundaries: false` turns it off with the rest of `FD-R4`. W180 | **A new `driver.answer(taskId, answer, { actor })`**: the name says what it is, but two calls do one thing, and `RunHandle`, the runtime and every UI's resolve path gain a second road. **A refusal RETURNED** (`false` or a findings array, the app's #4 words): `resolve`'s `false` already means *not suspended*, and `FD-R4`'s rule is a thrown refusal by name. **A check the switch cannot turn off** — the ask's schema is its own contract, not a boundary check |
| **(e)** | **What a predicate and a successor see of an answered ask** (fact 2) | **yes — answered** — **The answer IS the node's result.** `OR-R8`'s effective outcome of an ask is DERIVED from its `asked` element and its resolution: `terminalState` the `resolvedAs`, `result` the answer (`null` when none was given), `error` the decline's; `attempts` `0` and `startTime`, `endTime`, `executionTime` `null` — and **`schedulerTimestamp` widened to `number \| null`, `null` for an ask** (no scheduler was involved), **BREAKING** for a consumer typed on `number`. A successor receives the answer as its input (`FD-C1`); the value that reached the ask stays reachable by `needs` on whatever produced it. W180 | **`schedulerTimestamp` `0` for an ask**: no type change, but a number that says a scheduler stamped it. **The successor receives `{ input, answer }`** (the app's `keepInput`) or **the input when no answer is given** (the app's approval): convenient, but an ask's result would differ in SHAPE by how it was answered, and `needs` already reaches the input's producer |
| **(f)** | **What is kept, and where** | **yes — answered** — **The composed input, ALWAYS, on the `asked` element** (decision 1), and in the fold as a new OPTIONAL `NodeRun.input`, set only on an ask's node — **additive, not BREAKING**: a consumer building a `NodeRun` literal is unaffected — and **kept after the answer** (the log holds it for the life of the run anyway, so dropping it from the fold saves nothing, fact 6). **No size cap**: the checkpoint grows by one input per ask reached, the same order as the result its predecessor already stored. W180 | **Opt-in** (`keepInput: true` on the node): smaller checkpoints, but decision 1 says the node's record carries what reached it. **Dropped from the fold at the answer**: a UI reading a finished run loses what the person was shown. **An accessor** (`driver.askOf(taskId)`) **instead of the fold**: no `NodeRun` change, but it is not a fold of the log (concept section 5) |
| **(g)** | **Cancel, stop, pause and resume of a run parked on an ask** (fact 5) | **yes — answered** — **Exactly as a parked task**: counted as PARKED by the three `ended` refusals (fact 5 (iv), the one change); a cancel sends nothing for it and the run reads `cancelled` (P34 (i)); a stop refuses its answer on the old runtime (P34 decision 9) and a resume elsewhere REGENERATES its `asked` element at its position — the same id and the same kept input, `sameData`-compared — with nothing re-dispatched; an answer is accepted while paused and its successors' dispatches held (`RN-R35`). **Its answer, if any, is an owner element the replay FEEDS, so it is taken at rest** — `RN-R19`, P34's (q) sentence. W181 | **A per-ask element at a cancel or stop** (a synthetic decline): each node then reads ended, but a resolution routes (`RS-R2`) — the alternative P34 (i) refused |
| **(h)** | **Does answering route like a decision?** | **yes — answered** — **Like a TASK's settlement, with the grammar a task already has**: `on: ['done' \| 'failed']` and a `when` — a registered predicate or P26's declared comparison — over `ctx.outcome.result`, the answer. No new route grammar; an unmatched `done` answer with no default edge is `Q10`'s `no-eligible-edge`, as for a task. ADR 0108, W179-W180 | **Gate-style named routes** (`{ route: 'approve', to }`, the answer naming its route): every route wired once (`FD-V41`'s discipline), but a second route grammar on a non-gate node, and the answer schema and the route set must then agree |
| **(i)** | **`doc/concept.md` section 7** says the resolve exception is *for a dispatch that already happened* (fact 12) | **yes — answered** — **Amend ONE clause, in W180** — *and since P35 the answer to a node that waits by design* (about +80 bytes against 799 of headroom; `check:budget` and its self-test, B′) | **Leave it** — the always-read set then denies what the plan built. **A row of P35's last item** — the same clause, later |
| **(j)** | **(p)'s reading** — a consumer's throw on a pause, unpause or stop TAKEN at `leaveStep()` inside a scheduler event (fact 10) | **yes — answered** — **Catch it at the listener boundary as `OR-R10` catches a refusal: REPORT it and HALT the run** — `failRun`, `onRunFailure` called, the run `halted`, beside the element already in the log; the throw never reaches the scheduler's `dispatchEvent`. A step the scheduler started has nobody else to throw to, and `onEventStep` already halts the run for a throw on any OTHER element it appends — so the take inherits its step's rule. `OR-R10`'s row names the road. W178, no ADR (a spec row) | **Catch and DISCARD** — report through `onRunFailure` and let the run go on, the element standing: no halt for a consumer's bug in a callback, but a halted-or-not that depends on WHEN the owner called `pause()`. **Document it** — `onFoldInput` must not throw, in `AGENTS.md` sections 8 and 18 — and ship the process kill (fact 10) in 0.8.0 |

**The answer, as given**: *"As recommended"*, to all ten, 2026-10-17. So, as decisions of this plan:
**(a)** a seventh node kind `ask` — `{ id, kind: 'ask', edges, settings?, answerSchema?, needs? }`, with a task id and
never dispatched, referenceable by `FD-V27`, its forbidden keys refused (W179, ADR 0108); **(b)** reached, ONE `asked`
element `{ taskId, input }`, regenerated by the replay; answered, the existing `resolution` element, `RS-R1` widened
(W180, ADR 0109); **(c)** the node `suspended` and the run `awaiting_action`, reused (W180); **(d)** `resolve()` is the
road, a `done` answer held to `answerSchema` at `FD-R4`'s resolve boundary — `BoundaryRefused` by name, nothing appended
— and `'failed'` a decline held to nothing (W180); **(e)** the answer is the node's result; `attempts` `0`, the timing
fields `null` and `schedulerTimestamp` widened to `number | null`, BREAKING (W180); **(f)** the composed input kept
always, on the element and as the optional `NodeRun.input`, kept after the answer, no cap (W180); **(g)** a parked ask is
a parked task to cancel, stop, pause and resume, the three `ended` refusals counting it (W181); **(h)** an ask routes as a
task's settlement does, `on` and `when` over the answer (W179-W180); **(i)** `doc/concept.md` section 7 amended by one
clause in W180; **(j)** a throw on a take inside a scheduler event's step is caught at the listener boundary, reported and
the run halted — a spec row, no ADR (W178), so ADR 0110 and ADR 0111 are expected unused.

## Work items

**The four sentences P37's retro adopted and P34's retro (q) carried UNCHANGED to this declaration, copied as it
directs** — with D′'s own clause FOLLOWED as written:

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
  being changed.* **Followed as written**: every row below that touches `AGENTS.md` owns the WHOLE of it, never a list of
  its sections (P34 retro section 2: twelve of eighteen exceptions were that narrowing).
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two (two
  arguments of a call, a swap and a deletion), the probe is COMPOUND, and a Record counts it as killing neither clause
  until each is re-cut alone and killed.*

**Two sentences for every item's brief** (P34 retro (q)): ***each item's Record states its readers' overlap***
(`doc/workflow.md` section 6 — six of P34's eight Records dropped it); and ***an owner element a resume's replay feeds is
TAKEN AT REST, between two steps*** (`RN-R19`; P34's W174 R1 and W175 R1) — here, an ask's answer (g).

**D′ applied — the sites each row moves.** **`RUN_FOR`** (`test/driver/checkpoint.test.ts:148`, fact 4) with the `asked`
kind — W180, forced at L0. **`LATE_SUITES`** with every new suite and with (m)'s renamed `RN-R12` suite — W178, W179,
W180, W181. **`RUN_FLOOR`** (40) with every `run` snippet `AGENTS.md` gains — W179-W181. **`DRIVER_FIELDS`** and
`NOT_RUN_STATE` only if an item adds a `Driver` instance field — W180's B′ copy says. **`X10`** — W182. **`spec/README.md`**
rows for every spec version moved. **The kind-literal readers** (fact 1): `src/definition/wiring.ts`, `validate.ts`,
`regions.ts`, `src/driver/driver.ts`, `scripts/check-spec.mjs` and its self-test, `examples/l6.ts`,
`examples/settlement-cost.ts` — classified by W179's B′ copy, never assumed. **The `isSuspended` readers** (fact 2, five
sites) and **`schedulerTimestamp`'s** (4 in `src/`, 2 in `AGENTS.md`) — W180, W181. **The always-read set**: W180 edits
`doc/concept.md` section 7 ((i)), so B′'s `check:budget:selftest` clause binds it; no row edits `CLAUDE.md` or
`doc/workflow.md`.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W178 | **The throwing-callback fixes before 0.8.0, and (m)'s titles** — decision 4 (o); (j) (p); fact 11 | `src/driver/driver.ts`, `spec/run-state.md` (`RN-R31`), `spec/outcome-record.md` (`OR-R10`), `spec/README.md`, `test/driver/cancel.test.ts`, `test/driver/pause.test.ts`, `test/driver/stop.test.ts`, `test/scheduler/runtime.test.ts`, `test/fold/stuck.test.ts`, `test/definition/l4-corpus.test.ts`, `AGENTS.md`, `scripts/check-docs.mjs` | — | `gate:item`; L2 fact 9's three rows, and mid-step: after a throwing `cancelRequested` every task in flight is sent its cancel and every HELD task handed on and cancelled, the throw reaching the caller, the run `cancelled` once the last settles; L2 (j): a throw on `paused`, `unpaused` and `interrupted` taken from a scheduler event's step reaches `onRunFailure` and halts the run, nothing escaping the listener; the three titles renamed, the two `RN-R12` titles together |
| W179 | **The ask node in the definition** — ADR 0108; (a), (h); decisions 6 and 7 | `src/definition/types.ts`, `src/definition/validate.ts`, `src/definition/regions.ts`, `src/definition/wiring.ts`, `src/definition/schema.ts`, `src/driver/driver.ts` (the kind's refusal at `enter` until W180), `spec/flow-definition.md`, `spec/task-id.md`, `spec/README.md`, `spec/examples/**`, `test/definition/**`, `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs`, `examples/l6.ts` (kind-literal sites its copy finds), `examples/settlement-cost.ts`, `index.ts`, `AGENTS.md`, `scripts/check-docs.mjs`, `doc/decisions/0108-*` | W178 | `gate:item`; L1 an `ask` accepted with each key and refused with each forbidden key by its own `FD-V`, its `answerSchema` held to the subset, a reference to it admitted by `FD-V27` and a `transform` on it refused; L4 the corpus — every existing document unchanged, the new valid and invalid documents each with its rule ids; the wiring check over an ask's edges |
| W180 | **Asking and answering in a run** — ADR 0109; (b)-(f), (i) | `src/driver/driver.ts`, `src/driver/log.ts`, `src/driver/routing.ts`, `src/fold/run-state.ts`, `src/scheduler/runtime.ts` (if its readers move), `spec/run-state.md`, `spec/outcome-record.md`, `spec/flow-definition.md` (`FD-R4`), `spec/join-policy.md`, `spec/README.md`, `test/driver/**`, `test/fold/**`, `test/matrix/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS`, if moved), `examples/run-flow.ts` (`NOT_RUN_STATE`, if moved), `AGENTS.md`, `scripts/check-docs.mjs`, `doc/concept.md` (section 7), `doc/decisions/0109-*` | W179 | `gate:item`; L1 the `asked` arm — node `suspended`, run `awaiting_action`, `NodeRun.input` the composed value — and an answered ask indistinguishable in `nodes` from a resolved task but for `input`; L2 an ask parks with nothing handed to the scheduler, a refused answer appends nothing and the corrected one routes by `when` over the answer, a decline routes `on: ['failed']`, an ask in a fan-out holds its join (L5's row); L3 folded twice; `RUN_FOR`'s `asked` run; B′'s `check:budget:selftest` |
| W181 | **An ask under cancel, stop, pause and resume** — (g); fact 5 | `src/driver/driver.ts`, `spec/run-state.md`, `spec/README.md`, `test/driver/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `AGENTS.md`, `scripts/check-docs.mjs` | W180 | `gate:item`; L2 a run parked on an ask alone is NOT refused `ended` by `cancel`, `stop` or `pause` (fact 5 (iv), each beside today's red); cancelled with nothing sent; stopped with its answer refused, and resumed — the `asked` element regenerated at its position, nothing re-dispatched — then answered to `completed`; a stored answer fed by the replay; a stored `asked` whose recomposed input differs refused `diverged` there; answered while paused with the successor held |
| W182 | **The exit artifact** — the header's seven clauses, on real workers | `examples/l6.ts`, `examples/flows/**`, `examples/workers/**`, `examples/README.md` | W181 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W183 | *reserved, expected unused* | | | |

**Every row shares `src/driver/driver.ts`, `spec/README.md` or `AGENTS.md` with its neighbour, so the five are SERIAL in
the order above, never concurrent** (`doc/workflow.md` section 7 rule 2) — each declares the overlap with its predecessor
rather than an exception, because the files are in its row. **(a)-(j) were answered 2026-10-17, all as recommended**, and an item whose answer moves
its row rewrites the row's `Owns` at its declaration step, by B′, from this table. Each item's file is written at its
declaration step; this table is an index, not the declaration. **No item edits `scripts/check-register*.mjs`,
`scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is every row's but the last.

**Questions reserved per item**, so no two take one: W178 Q660-Q662, W179 Q663-Q666, W180 Q667-Q670, W181 Q671-Q674,
W182 Q675-Q677; Q678-Q679 the plan's, expected unused.

## Predictions, written before the items that test them

1. **W178's (o) and (p) cases are RED on today's tree in both runtimes** (facts 9, 10) and green after; **no existing
   assertion moves** but the three titles and `LATE_SUITES`' one renamed entry.
2. **W179 moves no existing corpus verdict**: every document under `spec/examples/` validates as before, and the only
   assertions that flip are those quoting `FD-V24`'s kind list — which W179's copy names.
3. **W180 leaves every flow WITHOUT an ask byte-identical in its fold inputs**: the `asked` kind is appended only on an
   ask, and `RS-R1`'s widened clause is unreachable without one. The one forced edit outside the new cases is
   `RUN_FOR`'s fifteenth entry — and, if (e) is answered as recommended, the readers of `schedulerTimestamp`'s type.
4. **W181 changes only the three `ended` refusals** (fact 5 (iv)) among run control's lines; `resume()`'s re-dispatch
   is untouched, because an ask is never in flight.
5. **W182 moves `X10` by its block alone**, and no existing L6 row.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q19](../questions/q19.md) | what a run retains — resolved; #3 is scoped to the ask (decision 1, (f)) so as not to reopen it | — |
| [Q28](../questions/q28.md) | what a resolution may do — deferred; an ask's answer supplies an outcome and re-dispatches nothing (`RS-R2`), so it is not reopened | — |

## Record

*Written 2026-10-18 over `5bfd4b5`, the tree clean before it. Every figure is read from the five items' own files; none
is re-measured here. Ids are bare text, as in P33's, P34's and P37's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and both readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W178** `e375849` | (o): `cancel()`'s held tasks taken out before `cancelRequested`, the element in a `try`, every cancel and hand-off in its `finally`; (p): a throw at a scheduler event's step END caught at the listener boundary, reported, the run halted ((j)); S-1: `failRun` reports in a `finally`, both boundaries discard a throw out of it; (m)'s three titles | run-state v0.21, outcome-record v0.17 | — / — | **E1** (S-2): `src/scheduler/runtime.ts`'s comment; S-2's three assertion MESSAGES LEFT; **S-1 YES**; **S-3 YES** (dated lines under ADR 0104, 0105, 0106). **R1** — the in-flight set read AFTER the element, a departure from decision 4's letter, held sound by the conformity reader | conformity **D1** (`OR-R10`'s text false at `halted` itself — the pre-existing hole S-1 fixed), G1, G2 fixed, G3 to S-2; adequacy 29 probes, 26 killed, finding 1 (no runtime-level test) fixed. **Overlap 1** | 69 / 1882; 2711 / 190 | `gate:item` EXIT 0, selftests 912 s |
| **W179** `b71fc8e` | `AskNode` in `FlowNode` (BREAKING), `ASK_REFUSED_KEYS`; the seventh kind, `FD-V47`, `FD-V48`, ten enumerating rules widened by name; the wiring check's ask (a producer, never a consumer); the driver refusing an ask at `enter` until W180; ADR 0108 | flow-definition v0.42, task-id v0.13 | — / — | none; **S-1** left to W180; **S-2** the corpus's ask flow task-free, the realistic flows W180's | conformity **D1-D7** — the `map` v0.8 family again, seven sentences restating *a branch entry is a task* — fixed, two more by the author's re-grep; G1 to W180, G2-G4 fixed; adequacy 46 probes, 45 killed, the survivor fixed. **Overlap 1** | 70 / 1898; 2711 / 190 | `gate:item` EXIT 0, selftests 971 s |
| **W180** `7b62af1` | the `asked` fold input (BREAKING), `NodeRun.input`; the park, nothing handed to the scheduler; `RS-R1` widened at all five readers, the three `ended` refusals with them (D1); `FD-R4` at the answer; an ask's effective outcome derived, `schedulerTimestamp: number \| null` (BREAKING); `sameData` over structured-clone data; every mid-step resolution taken at rest (S-4); `doc/concept.md` section 7; ADR 0109 | run-state v0.22, outcome-record v0.18, flow-definition v0.43, join-policy v0.23, task-id v0.14 | — / — | **E1** (W179's S-2 ruling), **E2-E5** (S-1, S-2, S-3, S-5 YES); **S-4 RATIFIED** — a design change | conformity **DEFECT R4** (a mid-step answer made a checkpoint unresumable) and **GAP R13** (`sameData` by own keys) fixed; adequacy 47 probes, 43 killed, T09, T10 and the driver-call roads fixed. **Overlap 1** | 73 / 1935; 2711 / 190 | `gate:item` EXIT 0, selftests 955.1 s |
| **W181** `adb453e` | `RN-R38` — a parked ask under cancel, stop, pause and resume; `test/driver/ask-control.test.ts` (20 cases) and a runtime suite (2); no executable line of `src/` | run-state v0.23 | — / — | none; no stop-and-ask | conformity: conforms, one GAP (a shape claimed and not tested) and NOTES 1-4 fixed; adequacy 31 probes, 30 killed by W181 cases and A25 by W180's, ADEQUATE. **Overlap 1** | 74 / 1958; 2711 / 190 | `gate:item` EXIT 0, selftests 970.8 s |
| **W182** `5bfd4b5` | the `W182 exit` block — seven clauses, 32 claims over 13 runs; the L6 kind clause's `ask` exemption REMOVED | none | — / — | none | conformity: the seven clauses CONFORM, NITs C1-C3 fixed, C4 handed on; adequacy: A1 SHOULD, A2, A3 NITs and the A4 note fixed. **Overlap 0** | 74 / 1958; **2743 / 203** | **`gate:full` EXIT 0**, 11/11 self-tests, 2217.9 s |

**Every confirming gate was green on its FIRST run, one command each** (sentence C), firefox and webkit NOT RUN in any.
W180's `npm run gate` BEFORE its readers was EXIT 1 on the real tree, at exactly its two then out-of-`Owns` cases (S-1,
S-2), and EXIT 0 in a byte copy with their patches. **No item raised a question. The readers' overlap, every Record
stating its own: 1, 1, 1, 1, 0.**

### The exit artifact, measured

| the exit sentence's clause | what was built and measured (W182's Record and its *How each exit clause is asserted*) | verdict |
|---|---|---|
| on the final tree, ONE cross-row block in `examples/l6.ts`, green in node 24 and in deno | the `W182 exit` block; **2743 / 203, 0 failed in node 24.20.0 and deno 2.9.6** — in `npm run gate`, in `test:l6` and `test:l6:deno` 5/5 each before the readers and again after them, and in `gate:full` | **met** |
| (1) an ASK reached after a task on real workers parks with NOTHING handed to the scheduler, the scheduler never seeing its id; the fold `awaiting_action`, the node `suspended`, its kept input exactly the predecessor's result | `draft` on a THREADED pool, read back (R3), returning a value no payload carries; the ask's id on NONE of three observers — every id handed to `addTask`, the `tasks` map, every id a `task.*` event carried — each shown able to see a task by the CONTROL on `draft` (R2); the log `[dispatched, outcome, asked]`, the element field for field; the node `suspended` with `input` exactly `{ summary: 'w182a (drafted)' }`, equal to the fold's own `draft` result | **met** |
| (2) a `done` answer its schema refuses THROWN by name, nothing appended, the node still parked; a conforming answer on the SAME driver accepted, routing by a `when` over the answer to the end it selects, `done` `completed` | run TWICE (R1): a typo answer `BoundaryRefused` (`boundary: 'resolve'`, `$.approved required`), 0 elements appended, `suspended`, nothing handed; then on the same driver `approved: true` to `published` by the `when` and `approved: false` to `shelved` by the default edge, the `when` being false — each run the other's control; `completed`, equal to the fold | **met** — the `false` run is R1's reading (*the `when` over the answer decides*), labelled so after C1 |
| (3) a `failed` answer routes the node's `on: ['failed']` edge | the tail `[resolution failed, pathEnded end declined]`, the node `failed` with the decline's error and the input kept; the `on: ['failed']` edge listed LAST, after the `when` and the default (A2), so the first eligible edge cannot stand in for it | **met** |
| (4) an ask inside a fan-out branch holds the join until it is answered | the ask as the branch ENTRY (R4); run TWICE — answered after `score` arrived (no `joinSettled` until the answer's own call) and answered while `score` still ran, its state read back `running` (the join fires at `score`'s settlement) — so the hold is arranged both ways; `publish` receiving both branches' values (`JP-R12`) | **met** |
| (5) a run parked on an ask STOPPED on runtime A and resumed on a FRESH runtime B: re-parked at the same id with the same kept input, nothing handed to B for it, answered there to `completed` | on A `interrupted`, NO cancel sent; the answer refused on A and A refusing the resume `RunIdInUse` (R5's controls); on B nothing handed at the resume, the `asked` element at index 2 EQUAL to A's; answered on B, `publish` B's only task, `completed`, B never seeing the ask — its event observer shown live on B (A3) | **met** |
| (6) a run parked on an ask CANCELLED: nothing sent, `done` `cancelled` | NO cancel sent, `done` `cancelled`, the log ending `[asked, cancelRequested]`, the answer then refused; the CONTROL (R6) — the same flow cancelled while `draft` RUNS, its cancel sent through the same wrap | **met** |
| (7) a PAUSED run's ask answered, the successor held until unpause | the tail `[paused, resolution done, dispatched publish]`; `publish` not handed, not in the task map, `done` pending — read once a WITNESS run, slow by 1500 ms on its own timer, has parked, its elapsed time read back (A1); unpaused: `publish` handed ON the `unpaused` element; the CONTROL — the same answer unpaused hands it on inside its own call | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W182, ONE command on the final tree after the readers' items: 11/11 self-test lanes ok, `check:register:selftest` included | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **69 / 1877 → 74 / 1958** in node, deno and
chromium; L6 **2711 / 190 → 2743 / 203** in node and deno; `check:spec` **7 / 75 / 142 → 7 / 81 / 147**; `check:docs`
**40 → 43 `run` snippets**; spec/flow-definition **v0.41 → v0.43**, run-state **v0.20 → v0.23**, outcome-record
**v0.16 → v0.18**, join-policy **v0.22 → v0.23**, task-id **v0.12 → v0.14**; `doc/concept.md`'s headroom **799 → 636**
bytes.

**What the plan answered — yes.** A flow declares an `ask` — a seventh node KIND (ADR 0108) with a task id and no
dispatch, valid wherever a task is, its worker keys refused by `FD-V47` and its `answerSchema` held to the schema subset by
`FD-V48`. A run that reaches one appends ONE `asked` element carrying the composed input and hands NOTHING to the
scheduler; the fold reads the node `suspended` and the run `awaiting_action`, so nothing a UI keys on moved. The answer is
the existing `resolve()`: a `done` answer is held to `answerSchema` at `FD-R4`'s resolve boundary — refused by name with
nothing appended — and IS the node's result, routing as a task's settlement does; `failed` is the person declining. The
kept input stays on the element and on `NodeRun.input` for the life of the run. **No task fails to get there** — no
outcome record is ever written for an ask (ADR 0109). Under run control a parked ask is a parked task (`RN-R38`). Beside
it, P34's two throwing-callback defects were fixed before 0.8.0 (W178) and a pre-existing third with them (S-1).
**fyflow-app's asks**: #2, #3 and #4 BUILT as (a)-(f) answered; #12 deferred and #13 declined, as declared. **What 0.8.0
ships as BREAKING from this plan**: `FlowNode` (W179), `FoldInput` and `OutcomeRecord.schedulerTimestamp` (W180); and a
`resolve()` called mid-step now returns `true` with its resolution appended at the step's end (S-4).

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W178's (o) and (p) cases RED on today's tree in both runtimes and green after; no existing assertion moves but the three titles and `LATE_SUITES`' one entry | **red/green HOLDS; *nothing else moves* FALSIFIED** — W175's `pause.test.ts` case 5 went red: its mid-step rows ASSERTED fact 10's escape through the fake's `emit`; three per-suite counts in `l4-corpus` moved; and W142's runtime case lost its instrument to S-1 | W178 M2, M3 |
| 2 | W179 moves no existing corpus verdict, and the only assertions that flip quote `FD-V24`'s kind list | **clause 1 HOLDS** — 96 documents and reports compared, no rule id or location moved, three details widened; **clause 2 REFUTED** — no assertion quotes the list (a comment does); what flipped was `FD-V27`'s message, the `task-config` kind rows, the FD-V29 oracle and the out-of-`Owns` OR-R11 census | W179 M2-M4 |
| 3 | W180 leaves every flow WITHOUT an ask byte-identical in its fold inputs; the one forced edit is `RUN_FOR`'s entry and, under (e), `schedulerTimestamp`'s readers | **clause 1 SUPPORTED FOR THE ROADS IT DRIVES** — 324 runs identical, none resuming, cancelling, stopping or pausing — **and no longer true of every road by a RATIFIED design**: since S-4 a task resolved mid-step has its resolution at the step's end (five existing cases take that road, each green unchanged); **clause 2 REFUTED** — no `schedulerTimestamp` reader broke; `DRIVER_FIELDS` twice, W179's designed expiry and four corpus censuses moved besides | W180 M2-M5, S-4 |
| 4 | W181 changes only the three `ended` refusals among run control's lines; `resume()`'s re-dispatch untouched | **MOOT as written** — W180's D1 changed the three refusals; **restated, SUPPORTED** — W181 changed no executable line of `src/` (one comment), its 22 cases green on W180's `src/` | W181 M3, D1 |
| 5 | W182 moves `X10` by its block alone, and no existing L6 row | **HOLDS** — 2711 / 190 → 2743 / 203, the block's 32 claims and its runs; no `EXPECTED` row, pair row or other block moved; the every-kind clause changed FORM, not count | W182 *Gate before the readers* |

**The D′ paragraph's census predictions** (*Work items*), scored the same way: **right where it named a site** — `RUN_FOR`
at W180 (L0, as fact 4 said), `LATE_SUITES` at W178-W181, `RUN_FLOOR` 40 → 43 over W179-W181, `DRIVER_FIELDS` at W180 (its
B′ copy said so), `X10` at W182, the kind-literal readers classified by W179's copy (M6). **Short at three items**: W178's
per-suite counts in `l4-corpus` — the site P34's W169 met first; W179's corpus censuses — the OR-R11 sentence and its
suite (out of `Owns`, S-2), the `task-config` kind rows, the FD-V29 oracle; W180's — `wiring.test.ts`'s L4 arc total (out of
`Owns`, S-2), the region census, `spec/task-id.md` (S-3) and `src/fold/policies.ts`'s comment (S-5). Each was found by its
own lane going red by name in B′'s copy or at the first gate, before an edit outside `Owns`; **the two out of `Owns`
cost a stop-and-ask each, and W179 reshaped its corpus to avoid one** (R8).

**Questions**: **raised none, closed none.** [Q118](../questions/q118.md) gains a dated note (W180's Notes:
its deferral's condition is still unmet) and [Q599](../questions/q599.md) one (no P35 run turned its rows red); both stay
deferred. `npm run q -- --where status=open` lists **Q580, Q581**.

**Handed on**, each with its owner — gathered from the five items' Out sections, Notes and readers:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| a consumer throw on an element a DRIVER CALL's step appends: a take there throws to the caller WITHOUT halting, while `start()` halts on any other element of its step; a throw on the resolution's own element during `resolve()` leaves the answered node routed nowhere, unreported | W178's conformity reader (R3 note); W180's adequacy reader (its Notes) | **open — (k)** | Retro section 8 |
| `examples/l6.ts`'s `gateMemory` comment, *empty on every run here since no L6 row runs a gate* — false since W94 | W182's conformity reader (C4) | **open — (l)** | Retro section 8 |
| the three stale assertion MESSAGES, *dispatchEvent discards a listener throw* (`examples/l6.ts`, `test/driver/seam-paths.test.ts`, `test/driver/result-schema.test.ts`) | W178 S-2 | **left** — the maintainer's ruling | W178's Record |
| at one step's end a pause AND a stop both throwing report only the second; the re-entrant double report on `onEventStep`'s road (read, not measured) | W178 R2, its Notes | no owner — R2's stated cost | W178's Record |
| `spec/flow-definition.md`'s *P35's next item* sentences, `spec/task-id.md:67` | W180 R9, W181 | **left** — history | W181's Record |
| `doc/questions/q118.md`'s deferral note | W180's Notes | **done** at this record step | [Q118](../questions/q118.md) |
| #12 (a failed task's error downstream), #13 (a deadline) | P35 *Answered here, not built* | deferred; declined | this plan |
| attempts spent by a stop; a task's attribution; the header before the first event | P34 *Out*; P36's draft | **P36** | its draft |

## Retro

*Pass 3 ran on 2026-10-18 over `5bfd4b5`, the working tree clean before it, in a subagent at the coordinator's request.
Every figure is read from the five items' Records; this retro re-ran no harness and no measurement, and `npm run gate`
only to confirm its own edits. **Its routings and proposals were put to the maintainer in section 8, and the answers are
recorded there; none moves a rule in `doc/workflow.md`.***

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader defects | raised / closed |
|---|---|---|---|---|
| P35's declaration | — | (a)-(j), all as recommended | — | — |
| W178 | E1 (S-2) — YES; S-2's three messages — LEFT; S-3 — YES (record step) | **S-1 YES** — a pre-existing hole of the same class, fixed in `Owns` | 1 (D1, the text S-1's code made true) | — |
| W179 | S-1 — left to W180; S-2 — NO widening, the corpus reshaped | — | 7 (D1-D7, one family) | — |
| W180 | E1 (W179's S-2 ruling); E2-E5 (S-1, S-2, S-3, S-5) — YES | **S-4 RATIFIED** (every mid-step resolution taken at rest) | 2 (R4, R13) | — |
| W181 | — | — | 0 | — |
| W182 | — | — | 0 (NITs; C4 handed on) | — |
| **P35** | **6 exceptions, all YES; 3 left or declined** | **2: S-1, S-4** | **10** | **0 raised, 0 closed** |

**Six exceptions where P34 had eighteen, and none is an `AGENTS.md` section** — section 2.

### 2. The `Owns` and the census sites — B′, C, D′ and E held

**D′ was FOLLOWED as written, and the class it was copied to remove is gone**: every row touching `AGENTS.md` owned the
whole file, and **not one** of P35's six exceptions is an `AGENTS.md` section — against TWELVE of P34's eighteen. P34's
Proposal B priced exactly that saving, and it was measured. **B′ held**: every census site was found by its own lane
going red by name, in the copy or at the first gate, before its edit. **C held**: every confirming gate green on its
first run, one command each. **E held**: every compound probe declared and counted as killing nothing alone (W178 O2,
W180 JP5-FANOUT and JP5-MAP, W182 D13).

**What D′'s list still did not name** (Record, *The D′ paragraph's census predictions*) is two kinds of site, each met
TWICE:

| site | met at | cost |
|---|---|---|
| a COUNTED suite's per-suite case count and its message, `test/definition/l4-corpus.test.ts` | P34's W169; P35's W178 (and G1, the stale messages) | found by the first gate both times; no ask |
| the CORPUS censuses a new flow under `spec/examples/` moves — section 7's table, `spec/outcome-record.md` section 4's OR-R11 sentence and its suite, `test/definition/wiring.test.ts`'s L4 arc total, `test/driver/needs.test.ts`'s region census | W179 (M3, S-2, R8); W180 (M3, S-2) | **two stop-and-asks, and a corpus written to dodge one** (W179 R8) |

Two occurrences each, in different items — pass 3 rule 2's bar. Section 8 (m) proposes both as D′ clauses for P36's
author, not as a workflow rule.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W178 | D1 (text), G1-G3 | 29 probes, 26 killed; finding 1 | **1** — G1 = finding 2 | 102nd |
| W179 | D1-D7, G1-G4 | 46 probes, 45 killed; one survivor | **1** — the L4 corpus's hold on the ask | 103rd |
| W180 | DEFECT R4, GAP R13, notes | 47 probes, 43 killed; T09, T10, R13 | **1** — R13 | 104th |
| W181 | conforms; one GAP, NOTES 1-4 | 31 probes, 30 killed by W181 | **1** — the one-case thin spots | 105th |
| W182 | conforms; C1-C4 | A1-A4 | **0** | 106th |

**Every Record states its overlap** — the brief sentence P34's retro (q) carried, against six of P34's eight that
dropped it. **Five measurements, all inside section 6's 0-4 band; the ordinal is a hundred and six, so the next is the
HUNDRED-AND-SEVENTH** — written into `doc/workflow.md` by (n).

**The readers are the mechanism for the eleventh plan running.** Every one of the ten defects is a reader's — W179's
seven sentences, W178's D1 and W180's R4 and R13 — and every one was found AFTER the author's own set had run green over
it (W178's 16 probes, W179's 43, W180's 44). W180's R4 is the sharpest: a checkpoint made UNRESUMABLE by an answer given
on the `asked` element's own stack. The authors' finds were design, not defects: W178's S-1 and R2, W180's S-4 twin, each
measured by constructing the case.

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) a consumer callback THROWING on a driver's element** — P34's section 4 (f) class. P35 fixed (o) and (p) and with them a THIRD road (W178 S-1: a throw on `halted` itself, or from `onRunFailure`, escaped every boundary). Still open: **the road asymmetry** (W178's conformity reader, R3 note) — a pause, unpause or stop TAKEN at the end of a DRIVER CALL's step throws to the caller WITHOUT halting, while `start()` halts on a throw on any other element of its step; and **the resolution's own element** (W180's adequacy reader, its Notes) — a throw there during `resolve()` leaves `appendResolution`, so no `branch.resumed`, no routing and no halt follow: the answered node reads `done`, routed nowhere, the run unreported. Pre-existing for a TASK's resolution; new for an ask. Plus W178 R2's cost: two throws at one step's end report only the second | — no rule binds it; (j) decided the scheduler road only | **the conformity and adequacy readers, every time** | **The class now has SIX roads over four items** (W174 C5, (o), (p), W178 S-1, the take on a driver-call step, `resolve()`'s element). **Patching it road by road is the mechanism failing**: each fix decided one road, and the next reader found the next one. Section 8 (k): ONE rule for every road, and an L2 sweep over every driver call |
| **(b) decision 7's grain** — *every `FD-V` whose text enumerates kinds* was followed for the rules and missed seven sentences restating the premise (*a branch entry is a task*) in subsections, derivations and another spec's paragraph (W179 D1-D7, G1) | **FOLLOWED** — W179's declaration listed every enumerating rule | the conformity reader; the author's re-grep for the PREMISE found two more | **Two occurrences, two items** (`map` v0.8's fifth widening, W179): a widening is checked by grepping the PREMISE it falsifies, not the rule ids. D′ greps for changed NAMES, and a premise is not a name — section 8 (m) |
| **(c) the brief's *taken at rest* sentence** — carried by P34 (q), followed for the park and not for the answer: W180's first cut appended a mid-step answer on the stack it was given on, making a region's checkpoint unresumable (R4); measuring it found the same defect PRE-EXISTING for a parked task's resolution (S-4) | **FOLLOWED at the doors the row listed** — W180's own lesson: *a sentence copied into every brief binds every door it names* | the conformity reader (R4); the author, measuring the twin (S-4) | **No change**: the sentence was right and is now `RN-R37`'s for every resolution (S-4); one occurrence of reading it narrowly |
| **(d) a fact the declaration READ rather than ran** — fact 4: *`sameData` … is deep and key-order-free*; false for a `Map`, a `Set` and an array hole, so `RN-R37`'s and ADR 0109 rule 2's *a different input is refused `diverged`* was false on `RUN_FOR`'s own input (R13) | — | **both readers** — the one overlap of W180 | **No change**: `CLAUDE.md`'s *a written claim nobody ran*, now in a plan's facts. W89's `freezeInput` was the same flat-data assumption at the first non-flat kind; fact 4 warned of that one and repeated this one |
| **(e) a plan decision's LETTER copied from a precedent whose reason did not transfer** — decision 4 said *read the in-flight set BEFORE the element*, copying `takeStop`; a stop is DEAF, a cancel still hears, so read before, a task a callback had settle would be sent a cancel (W178 R1) | — the plan's author | W178's author, as a reading; O2 the probe telling them apart | **No change**: one occurrence, kin to P34's (c) — *an enumeration is checked against the measurement it came from* — and caught before the edit |
| **(f) a row that makes a surface REACHABLE owns the refusals the surface then meets** — W180's asks made W181's three `ended` refusals live, so W180 took them (D1) and W181's prediction 4 went moot | — the plan's row division | W180's author (D1, at the coordinator's brief) | **No change**: one occurrence, and the item that met it took it |
| **(g) test and harness lessons** — a scheduler DOUBLE whose `cancel` never resolves turns a wrong cancel into a HANG graded CRASH (W181); a cancel or observer WRAP is vacuous until a control shows it can see something, live on every runtime it reads (W181's probe → W182 R6; W182 A3); *held* needs a horizon told by an EVENT, not a sleep (W182 A1); an EDGE ORDER is part of the arrangement (W182 A2); a harness restores on ABORT (W181's first run); a heredoc stripped a regex's backslashes (W181); a probe harness should reject a DUPLICATE probe id (the coordinator's note — no Record names it) | the wrap, the edge order and the abort are existing clauses — rule 8 (d) *a control must fail where its claim is VACUOUS*, (a) *where it SELECTS, every wrong selection differs*, the harness's *an abort that undoes* — BROKEN once each, not followed and failed; the heredoc is `CLAUDE.md`'s, its remedy (the Write tool, run by path) not used | the adequacy readers (A1-A3); the authors (W181's hang, the heredoc, read back; W182 R6 from W181's probe) | **No change**: one occurrence each, or a rule already written. **P34's own lessons were CARRIED and WORKED** — W182's Tests line named *a probe substituting the expected literal invalid* and *order arranged both ways*, and clauses (2) and (4) each ran twice, each run the other's control |
| **(h) W182's provocations ran in NODE only before the readers**; A6 survived as a COINCIDENCE of this machine (a threaded settlement arriving a message after its `emit`) | declared — the Record says *node only*, section 4's *say which runtimes* | the author; A6b kills the read-back that holds the order | **No change**: the readers' R1 and R5 were graded in deno too, and NO finding of P35 was runtime-specific. The ledger's *a harness grading L6 in both runtimes* (once, P24) is not re-raised |
| **(i) stale prose a correct change makes false** — W182 found `examples/README.md`'s `l6.ts` row TAIL stale since W176's record step, which moved the cell's head and not its end ([Q171](../questions/q171.md)'s class: `X10` reads the two count copies, not the history beside them); `examples/l6.ts`'s `gateMemory` comment, false since W94 | — | W182's author (M6); its conformity reader (C4) | **No change**: the ledger's first row, considered and not proposed (section 7) |

**Pass 3 rule 5 over P35's defects**, by what caught them: **a rung in `gate`** — W178's M2 (W175's case asserting the
escape), W179's M2, M3 and M9 (a browser bundle mangling a class name), W180's M2 and M3 (`RUN_FOR` at L0, `DRIVER_FIELDS`,
the corpus censuses), W182's M3 (the kind exemption expiring LOUDLY, as W179 built it to) and M4; **the authors,
constructing** — W178 S-1 and R2, W180 S-4, W181 M4; **the conformity readers** — W178 D1 and G1-G3, W179 D1-D7 and
G1-G4, W180 R4 and R13, W181's GAP, W182 C1-C4; **the adequacy readers** — W178 finding 1, W179's survivor, W180 T09, T10,
R13 and the `resolve()` element, W181's thin spots, W182 A1-A4. **No rung would have caught** the throwing-callback roads
(a) or the stale prose (i).

**The flaky rows ([Q599](../questions/q599.md)).** **None went red in any P35 run its Records report** — every W178-W181 gate
that reached L6, 0 failed in node and deno; W182's six runs per runtime before its readers, one after them and its
`gate:full`.
A dated note is added; it stays deferred.

### 5. The scheduler

**No S entry raised** (P35 *Raises*): fact 10's process kill was each runtime's `EventTarget` contract, and W178 closed
it on our side. **No new observation** — none of the five Records names a scheduler behaviour that is not an S entry or
a fact of its `AGENTS.md`; W182's A6 is a timing of this machine's threaded pool, not a contract.

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule.** B′, C, D′ and E held (section 2); the overlap line was kept
in every Record; every defect was caught before its Record by a reader whose job it already is; and the rules broken in
section 4 (g) are broken once each, with the clause already written.

**B. Recommended, for P36's AUTHOR, not the workflow** — B′, C and E carried UNCHANGED; D′ carried with its *whole of
`AGENTS.md`* as written and **three clauses added**, each met twice (sections 2 and 4 (b)): *a new case in a COUNTED suite
→ `l4-corpus`'s per-suite count and its message*; *a flow added under `spec/examples/` → the corpus censuses (section 7's
table, `spec/outcome-record.md` section 4's OR-R11 sentence and its suite, `wiring.test.ts`'s L4 arc total,
`needs.test.ts`'s region census)*; *and a grep for each PREMISE the change falsifies, not only each changed name*. And
the two brief sentences, unchanged: *each item's Record states its readers' overlap*; *an owner element a resume's replay
feeds is TAKEN AT REST* — which any owner element P36 adds will meet.
- **Replaces**: P35's D′ in P36's declaration.
- **Saves**: W179's and W180's two S-2 asks and W179's corpus reshaping; W179's seven missed sentences.
- **Ledger**: kin to the *`Owns` pre-declaration* row (14 refusals), as P34's B was — not proposed as a rule or a check.

**C. Recommended, for P36's declaration: ONE ROW, before 0.8.0, settling the throwing-callback class on every road** —
section 4 (a), section 8 (k).

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it would be the 35th refusal, P2-P37.** Section 4 (i) is the class:
  a README tail and an `l6.ts` comment, each found by a reading. The row's standing ground holds. **No other ledger row is
  re-raised.**

| file | why |
|---|---|
| this plan | the Status line; this Record and Retro |
| `doc/questions/q118.md` | a dated paragraph — W180's Notes: `FD-V9` was WIDENED to admit an ask, not lifted, and the ask arm discards the two arguments as the task arm does, so the deferral's condition is unmet; still `deferred` |
| `doc/questions/q599.md` | a dated paragraph — none of its three rows red in any P35 run its Records report; still `deferred` |

`README.md` already carries the ask's row (W180's D4) and nothing in it is made false by P35; `doc/decisions/**` already
carries every pointer the items' record steps owed (ADR 0004, 0104-0106, 0108, 0109). **Edited after the maintainer's
answers, outside the four files by those answers**:

| file | why |
|---|---|
| `doc/workflow.md` | (n): the bookkeeping below, and nothing else |
| P36's draft | (k), (l), (m): a *Handed on* section — the throwing-callback row, the `gateMemory` phrase for its exit-artifact item, and B′, C, D′ with its three clauses, E and the two brief sentences — rows and notes only, P36 NOT declared |

**Not edited**: `examples/l6.ts` ((l) is P36's row) and `CLAUDE.md` ((o), LEFT).

**The bookkeeping made in `doc/workflow.md`** (P33's, P34's and P37's precedent: no new version): the Status line,
*THIRTY-SIX times, by P1 through P35 and P37*; section 6, *a hundred and six, so the next is the HUNDRED-AND-SEVENTH*;
the refusal ledger's first row, *35 times, P2-P37*. **P35 does NOT join the Status line's *adopted nothing* list** — (n).

**Ids.**

- **Issued**: W178, W179, W180, W181, W182; ADR 0108, ADR 0109; no question; no S entry.
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W183 CLOSED unissued, as the declaration expected;
  - Q660-Q662 SPENT (W178's), Q663-Q666 SPENT (W179's), Q667-Q670 SPENT (W180's), Q671-Q674 SPENT (W181's), Q675-Q677
    SPENT (W182's), Q678-Q679 SPENT (the plan's). None exists in the tree;
  - ADR 0110-0111 SKIPPED — (j) answered as recommended, no third decision needed.

**The next plan starts at W184, Q680 and ADR 0112.** The next S id is S13; the next plan id is P38.

*`npm run state` before this section printed the tree's W183 / Q675 / ADR 0110 against the ledger's W178 / Q660 /
ADR 0108, the ledger being P34's sentence. P35 closes W183, Q660-Q679 and ADR 0110-0111 unissued — P34's precedent for
W177, Q635-Q659 and ADR 0107. (k) was answered with no question raised, so none of section 8's answers takes an id.*

### 8. Stop-and-asks for the maintainer

**Lettered after the declaration's (a)-(j). Each site is OUTSIDE the record step's four files and is NOT edited here.**
*Before 0.8.0* means before the one publish after P36 (P34 decision 6); the package ships `dist/`, `README.md` and
`AGENTS.md` only.

| | the question | recommended | the alternatives |
|---|---|---|---|
| **(k)** | **What happens when a consumer's `onFoldInput` throws on an element a DRIVER CALL appends?** Today it depends on which call and which element. On a scheduler event's step it is now settled (W178: reported, run halted). On a driver call's step: `start()` reports, HALTS and rethrows; a pause, unpause or stop taken at the end of that step only rethrows — the run goes on; and a throw on the resolution's own element during `resolve()` rethrows and leaves the answered node routed NOWHERE — the run neither moves nor halts, and nothing reports it. Six roads have been found one at a time over four items (section 4 (a)) | **One row of P36's declaration, fixed BEFORE 0.8.0** (pause, unpause and stop are new in it): ONE rule for every road — *a consumer throw on any element the driver appends is reported once and HALTS the run, and on a driver call it also reaches the caller* — `start()`'s rule extended to `resolve()`, `resume()` and the takes. Built with an L2 SWEEP: every driver call × a callback throwing on each element it appends, each asserting the halt, the one report and the throw at the caller. **No question** (rule 6) | **Finish the routing first** — the resolution's routing and the take's side effects in a `finally`, then rethrow without halting: the run carries on, but a consumer bug is then invisible unless the caller catches it. **Or raise Q680** (deferred, owner P36) and say in `AGENTS.md` section 9 that `onFoldInput` must not throw — and ship 0.8.0 with the asymmetry |
| **(l)** | **A false code comment in `examples/l6.ts`**: `DRIVER_FIELDS`' `gateMemory` entry says the gate memory is *empty on every run here since no L6 row runs a gate* — false since W94, which runs gates at L6. Not shipped; no check reads it | **A row of P36's exit-artifact item**, which will own `examples/l6.ts` anyway — one phrase, under its gate, as P34's (m) carried three titles into P35 | **A `chore:` commit now** under `gate:item`; or **leave it** — it misleads only the next reader of that list |
| **(m)** | **Proposal B** (section 6): what P36's author copies into its declaration | **YES — written into P36's draft as a hand-off**, as P34's (q) wrote P35's: B′, C and E unchanged; D′ with *the whole of `AGENTS.md`* and the three added clauses (a counted suite's count; the corpus censuses; a grep for the PREMISE); the two brief sentences; and (k)'s row if (k) is YES | **Carry D′ unchanged** — the two census kinds and the premise grep are then found by B′ again, at the cost P35 paid (two asks, a reshaped corpus); or **make them a workflow rule** — the ledger's `Owns` row's fifteenth refusal, against `doc/workflow.md`'s 165 bytes of headroom |
| **(n)** | **`doc/workflow.md`'s bookkeeping**, the three edits P33's, P34's and P37's retros made: the Status line *THIRTY-SIX times, by P1 through P35 and P37*; section 6, *a hundred and six, so the next is the HUNDRED-AND-SEVENTH*; the ledger's first row, *35 times, P2-P37*. And does P35 join the *adopted nothing* list? | **YES to the three edits** (about one byte), **no version, no index entry**; **P35 does NOT join the list** if (m) is answered YES — B is an adopted sentence, the reading at P33 (i), P37 (l) and P34 (r) | **The next plan's retro makes them**; or **P35 joins the list** if (m) is NO |
| **(o)** | **`CLAUDE.md`'s heredoc hazard** names *a `\n` written through a heredoc into a JavaScript string literal*; W181's heredoc stripped the backslashes from a REGEX — the same hazard in a form the sentence does not name (an eighth occurrence, a fourth item) | **LEAVE it** — the sentence's remedy (*write the script with the Write tool and run it by path*) covers every backslash, and the occurrence was the remedy not being used, not the rule failing | **One phrase**: *a backslash — a `\n`, a regex's `\d` —* in place of *a `\n`*, about +30 bytes against `CLAUDE.md`'s 470 of headroom; `check:budget` re-run |

**The maintainer's answer, 2026-10-18: *"as recommended"*, to all five.**

- **(k) YES** — ONE row of P36's declaration, fixed BEFORE 0.8.0: a consumer throw on any element the driver appends,
  on every road, is reported once and halts the run, and on a driver call also reaches the caller; an L2 sweep over every
  driver call × every element it appends. **No question raised** — Q680 stays the next free. Written into P36's draft.
- **(l) YES** — the `gateMemory` comment is a row of P36's exit-artifact item. Written into P36's draft.
- **(m) YES** — B′, C and E unchanged; D′ with *the whole of `AGENTS.md`* and its three added clauses; the two brief
  sentences; and (k)'s row — written into P36's draft for its author to copy into its declaration.
- **(n) YES** — the three bookkeeping edits, made (section 7), no version; **P35 does not join the *adopted nothing*
  list**.
- **(o) NO edit** — `CLAUDE.md` left as it is.
