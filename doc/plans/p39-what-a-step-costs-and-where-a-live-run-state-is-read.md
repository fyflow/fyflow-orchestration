# P39 — What does a step cost on a long run, and where may its owner read the run's live state?

**Status:** declared 2026-10-21 — on `93922cb` (the tree clean), answering fyflow-app's *pass 2* (#1-#4); facts 1-10 measured or read at this declaration; stop-and-asks (a)-(e) ANSWERED by the maintainer 2026-10-21, all as recommended; (f) OPEN, and only W196 waits on it; no item started. *(f) ANSWERED 2026-10-21 as recommended, before W196 started — recorded below by W196.*
**Question this plan answers:** *can a run's state be kept — by `fold`, by a runtime, and by a consumer reading it live — at a
cost per fold input that does not grow with the run, without a second definition of the fold and without moving what
`fold` returns, what `RunState` holds, or the order the driver appends?*
**Exit artifact:** *on the final tree: (1) one cost suite, green in `npm run gate:full` and in all three L0-L5 runtimes,
holding as CLOCK-FREE COUNTS that the work of a `map` run at 8,000 items is below **6x** its work at 2,000 — for `fold`, for
the driver with an `attempted` element per task, and for a runtime run whose consumer reads `handle.outcome()` after every
input — each count provoked red by restoring the cost it holds (rule 7, checked in); (2) the app's repro re-taken on the
final tree in node 24 and in deno, `fold` and driver from 1,000 to 16,000 items, printed beside fact 1's table (a measurement,
not a gate entry — [Q179](../questions/q179.md)); (3) one block in `examples/l6.ts`, green in node 24 and in deno, on a
threaded and an inline pool: a `map` run whose `handle.state()`, read on a microtask after each delivered input, deep-equals
`fold` of the delivered prefix, is frozen, is unchanged by a consumer's attempt to mutate it, and at `done` equals `await done`
and `fold(driver.foldInputs())` — and the same on a run RESUMED on a fresh runtime, whose `state()` before its first
delivered input already folds the stored events; and `npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W194-W198 (W198 expected unused), Q720-Q739, ADR 0120-0123 (ADR 0123 expected unused); no S id

```
Question: what does a step cost on a long run, and where may its owner read the run's live state?
Items:    W194 (the fold is ONE accumulator — ADR 0120), W195 (the driver's per-task index over its log — ADR 0121),
          W196 (the runtime keeps the accumulator; the run's live state on the handle — ADR 0122), W197 (the cost
          check in the gate, the exit artifact, and the reply to fyflow-app)
Reserves: W194-W198 (W198 expected unused), Q720-Q739, ADR 0120-0123 (ADR 0123 expected unused)
Raises:   no question; no S entry
Baseline: ids derived by `npm run state` at this declaration — P39, W194, Q720, ADR 0120 from the tree and W194, Q720,
          ADR 0120 from the ledger, which AGREE. The ladder counts are NOT taken here and are W194's declaration step's
Measured: 2026-10-21 on the CLEAN tree at `93922cb`, READ ONLY — the app's repro as one script outside the repository
          (the session scratchpad's `p39/repro.ts` and `p39/repro2.ts`), importing `index.ts` by file URL and driving a
          `Driver` over the app's scheduler double; nothing in the tree was edited or linked. Node 24.20.0 ONLY: deno NOT
          run at this declaration, no real scheduler, no CPU profile of mine — the profile figures in fact 4 are the
          coordinator's, taken the same day on the same tree, and each item's B′ copy re-takes what it relies on
```

## Why this plan, and why now

fyflow-app's Host stores every fold input, shows a run's state live, and resumes from its stored events. A user's flow
maps over a file's rows, and **a map over a few thousand items is unusable** (the app's own priority, P1): on the Host,
with the app's per-event cost removed, 1,000 items take 0.53 s, 2,000 take 15.9 s, 4,000 take 104.6 s and 10,000 took
599 s, and at 4,000 items 97% of its CPU is our `step` and `withOutcome`. The app folds each run TWICE — once in our
runtime to settle `done`, once in its own `onFoldInput` because the runtime's state is unreadable until `done` — so #1's
cost is paid twice because #2 is missing. 0.8.0 is published (npm `0.0.0-stage`, `0.7.0`, `0.8.0`; tags `v0.7.0`,
`v0.8.0`; `origin/main` at `93922cb`), so this lands in the NEXT release, and (d) says which.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2.md` (read, not edited).

| the app's clause | where it is answered |
|---|---|
| #1 — `step` costs the same however long the run is; one shape: outcome inputs as COUNTS, then shared structure or one mutable state inside the runtime with a frozen view; *what `fold` returns and what `RunState` holds stay the same* | facts 2, 3, 5; decisions 1-3; W194. **`fold` becomes linear; `step` stays pure and is O(run) per call** — decision 2 says why a pure `step` cannot be O(1), and #2 is the road that makes the per-input cost O(1) for a runtime |
| #2 — the runtime's live `RunState` from the `RunHandle`, frozen or a view, equal to `fold(driver.foldInputs())` at a quiescent point, on `start` and `resume`; *or* handed to `onFoldInput` | (b); W196. **A frozen copy, cached until the next input, plus two cheap reads**; handing state to `onFoldInput` DECLINED (b) |
| #3 — a check in the gate holding a large map's cost, a RATIO between two sizes rather than a time budget | (e); W197, with W194 and W195 each holding its own at birth |
| #4 — the driver's own cost; the Host's profile names `takeAttempts`/`leaveStep` and `enter` | facts 4, 6, 7; W195 — **one cause found (a full log scan per settlement), the app's named hotspot NOT reproduced here** (fact 6) |
| *if an item cuts across ADR 0014, `RN-R2` or ADR 0064, say which and how the shape keeps it* | decision 5 — none of the three moves; **two OTHER recorded rules bear on it, and are named**: ADR 0040 rule 2 is AMENDED (fact 8), and `RN-R1`'s *no module-level mutation*, unmoved, decides where the fold's counter lives (fact 9) |
| the repro's own driver number | fact 4: **~26% of the coordinator's 16,000-item driver profile was the repro HARNESS's `queue.shift()`** on a 16,000-entry array — the app's, quadratic, and named in the reply |

## Facts measured at this declaration

**Fact 1 — the repro, on this tree's source.** The app's script, its queue walked by index rather than `shift()` (fact 4),
Node 24.20.0, one process, in this order:

| items | fold inputs | driver | `fold` |
|---|---|---|---|
| 1,000 | 4,003 | 28 ms | 135 ms |
| 2,000 | 8,003 | 33 ms | 3,609 ms |
| 4,000 | 16,003 | 396 ms | 33,664 ms |

The coordinator's run the same day: `fold` 129 ms / 3.7 s / 32.6 s at 1,000 / 2,000 / 4,000 — the same curve. **Doubling the
items costs `fold` 27x and then 9x.** The cliff past ~2,000 items is plausibly V8 moving a large object to dictionary mode,
after which every spread of it is slower again — **a guess, unmeasured**, the app's and ours; W194 does not need it to be
true, because the fix removes the spread.

**Fact 2 — the fold copies the run on every input** (`src/fold/run-state.ts`). `step` (`:467`) returns a new state built by
spreading the old one: `dispatched` spreads `prev.nodes` (`:512-516`), `asked` likewise (`:530-533`), `attempted` (`:594`)
and every settlement (`:607`, `const nodes = { ...prev.nodes }`). A region event goes through `applyRegion` (`:682-712`),
which copies the region instance's `opened`, `settled` and `suspended` (`:685`) and then runs `includes` (`:690`, `:705`) or
`filter` (`:701`, `:708`) over them, and `withRegion` (`:659-671`) copies the opener's record of instances. **A `map`
region's `opened` and `settled` are as long as its item list**, so a region event costs O(items) — the app's third bullet,
confirmed. `pathEnded` (`:543`), `resumed` (`:569`) and `gated` (`:582`) copy their arrays the same way: a gate per map item
is the same quadratic, unexercised by the repro.

**Fact 3 — and derives the outcome by scanning the run on every input.** `withOutcome` (`:715-815`) takes
`Object.values(s.nodes)` (`:719`) and makes up to five `some` passes over it (`:732`, `:739`, `:752`, `:753`, `:812`),
`allRegionRuns(s)` twice (`:783`, `:802` — every instance of every region, flattened, `:678-680`) and two over `pathEnds`
(`:807-808`). It is called by every arm that can move the outcome. **So each input costs O(run) and a fold is O(run²)** —
the app's reading of 0.8.0's `dist`, confirmed against source and found WIDER: the region copy and `includes`, and the
three array arms.

**Fact 4 — the driver, on this tree's source.** The same script, driver only, its queue walked by index:

| items | fold inputs | driver, no `task.running` | fold inputs | driver, `task.running` before each settlement |
|---|---|---|---|---|
| 4,000 | 16,003 | 98 ms | 20,003 | 113 ms |
| 8,000 | 32,003 | 351 ms | 40,003 | 517 ms |
| 16,000 | 64,003 | 988 ms | 80,003 | 2,870 ms |

The coordinator's, the same day: 88 / 371 / 1,454 ms at 4,000 / 8,000 / 16,000 with no `task.running`. **Superlinear in both
columns, and steeper WITH `attempted` elements** (4.6x then 5.6x per doubling, against 3.6x then 2.8x). The same sizes run
in the same process straight after fact 1's 4,000-item fold read 527 / 1,618 / 3,818 ms — the heap the fold left behind —
which is why (e) holds this with counts and not with a clock. The coordinator's CPU profile at 16,000 items
(`--max-inlined-bytecode-size=0`, no `task.running`): **~48% in `effectiveOutcome(this.log, taskId)` called from `advance`**
(`src/driver/driver.ts:3665`), and **~26% in the REPRO's own `queue.shift()`** on a 16,000-entry array — quadratic, the
app's harness, not the library.

**Fact 5 — `effectiveOutcome` and `isSuspended` scan the WHOLE log per call.** `effectiveOutcome(log, taskId)`
(`src/driver/log.ts:91-126`) walks every record to find one task's settlement and resolution; `isSuspended` (`:66-70`)
walks it for one task's last record. The driver calls the first once per settlement from `advance` (`driver.ts:3665`), and
the second from `parked` (`:4860`) and — once per dispatched task — from `hasParked` (`:4870`), which `cancel`, `stop` and
`pause` read. `this.log` is kept as its own array **"only because `effectiveOutcome` and `isSuspended` scan it on every
settlement"** (`:1516-1518`): the comment names the scan and the cost it avoided, not the scan's own. **Both functions are
PUBLIC** (`index.ts:16` re-exports `src/driver/log.ts`), so they keep their signatures and their semantics; what changes is
what the driver hands them.

**Fact 6 — the app's named hotspot is NOT reproduced by its own repro, and fact 4's right-hand column says where to look.**
The app's double fires no `task.running`, so the repro appends no `attempted` element (4 inputs per item, the app's Host 5).
A detail of `{ id, state: 'running', attempts: 0 }` appends nothing either: `heardRunning` (`driver.ts:3288-3303`) reads
`attemptNumber` (`attemptNumberOf`, `:610-613`, an integer >= 1) and returns on anything else — measured, 16,003 inputs at
4,000 items with that detail. With `attemptNumber: 1` the elements appear (20,003) and the driver's growth steepens (fact 4).
`takeAttempts` (`:1869-1890`) appends each through `append` inside a step of its own and `leaveStep` (`:1852-1857`) ends it;
**what grows inside them is unmeasured** — W195's declaration step profiles it, with `attempted` elements, before any edit.

**Fact 7 — `outputs()` rebuilds its by-node index from the whole log whenever the log has grown** (`driver.ts:4337-4428`):
memoised on `this.log.length` (`:4372`), so any settlement invalidates it, and a node with `needs` entered once per
settlement pays O(log) each time. Its own comment measured the memo (69.5 ms against 312.1 at N = 800, `:4352-4356`) for
N dispatches in ONE turn; **one per settlement is the case the memo misses by construction**, and the repro does not reach
it (no `needs`). Same class as fact 5, read rather than measured here.

**Fact 8 — ADR 0040 rule 2 says *computed rather than maintained*, and fact 5's fix is a maintained index.** The rule
(`doc/decisions/0040-…md:90-98`) refuses a maintained index as *"a second source that can disagree with the log"* (Q43,
`arrival-count`'s re-sourcing), and `outputs()` cites it twice (`driver.ts:4330-4335`, `:4383-4389`). ADR 0118 gave way for
ONE structure (the `$item` store). **The shape the app's #4 needs — a per-task view maintained in `append` — is a second
amendment**, and `outputs()`'s own comment states the condition under which it is not a second truth: the merge stays in
`effectiveOutcome`, handed a per-task SUB-log (`:4383-4396`: *"`effectiveOutcome` filters by `taskId` anyway, so a sub-log
holding only that task's records is an input it is already total on"*). Decision 4.

**Fact 9 — `RN-R1` forbids the obvious counting hook.** `spec/run-state.md:178`: *"No clock, no scheduler, no IO, **no
module-level mutation**, and no memoisation across calls."* A module-level counter the fold increments is module-level
mutation. **So the fold's counter is an ARGUMENT** — decision 6. The driver is not under `RN-R1` (it is the only thing
with side effects), but a counter it keeps is a field `DRIVER_FIELDS` counts.

**Fact 10 — what the runtime keeps today, and the census at this declaration.** `openRun` keeps ONE `RunState`, `step`ped
per input inside the composed `onFoldInput` (`src/scheduler/runtime.ts:844-852`), and on a resume steps the stored
events lazily, at the FIRST delivered input (`seed`, `:771`, `:845-848`) — so a `state()` read before that input must
step them first (W196). ADR 0058 rule 5 states the shape (*"ONE `RunState`, `step`ped per fold input"*,
`doc/decisions/0058-…md:84-89`); `RunHandle` is `{ driver, done, stop, header }` (`runtime.ts:316-367`), its last member
added BREAKING in 0.8.0 for code that BUILDS one (P34 decision 10, `:343`). `test/driver/result-schema-cost.test.ts` holds
two costs as COUNTS (W81, P21), wrapping `structuredClone` — the precedent (e) follows. Spec versions: `run-state.md` v0.28,
`outcome-record.md` v0.21, `flow-definition.md` v0.45; next free rule id `RN-R43`. `CHECKPOINT_FORMAT` 1. Package `0.8.0` /
`0.8.0`, scheduler pin 0.6.0 (`npm run state`). `check:budget` passes; no row here edits the always-read set.

## Scope

**In** — `fold`'s cost (W194); the driver's per-settlement log reads and `outputs()` (W195); what a runtime keeps and what
its handle exposes (W196); a count-ratio check in the gate, the repro re-taken, an L6 block, and the reply (W197); the
specs `run-state.md` (W194, W195, W196) and, if W195's re-take finds its text names the scan, `outcome-record.md`;
`spec/README.md`; `AGENTS.md`; `README.md`'s examples table (W196); three ADRs.

**Out** — any change to what `fold` returns, to `RunState`'s shape, to `FoldInput`, to the append order or to a checkpoint
(decision 5); a public accumulator or incremental-fold API ((c)); state handed to `onFoldInput` ((b)); the region
semantics `RN-R6`/`RN-R10` encode (only their cost moves); a live mutable view ((b)); `step`'s signature; the scheduler's
own cost (`fyflow-scheduler`'s `addTask`/listeners, not measured here); the app's double-folding (it drops its own fold
when #2 ships, its own words); any change to `effectiveOutcome`'s or `isSuspended`'s public signature or semantics (fact 5).

## Decisions taken at this declaration

*Each follows from a fact or a precedent named beside it; what the facts leave open is a stop-and-ask below.*

1. **ONE definition of the fold's semantics: an internal accumulator, mutated in place within a call.** Map- and
   Set-backed nodes and region lists; RUNNING COUNTS of nodes per state, of region instances not joined, of region
   instances that opened nothing, and of path ends by reason — so the outcome is read off counts, never a scan. `fold`
   runs it once over its inputs and MATERIALISES one `RunState` at the end: **linear**. W194, ADR 0120.
2. **`step` keeps its signature and stays PURE**: it loads `prev` into an accumulator, applies one input, and materialises —
   **O(run) per call, documented as such**. A pure function from a plain `RunState` to a new one cannot do better without
   structural sharing that `RunState`'s plain `Record`s do not admit; a consumer who steps per input is the consumer #2
   replaces. **Each arm keeps its exact behaviour on ANY `prev`, not only a fold-reachable one**: the accumulator recomputes
   the outcome only where today's arm calls `withOutcome`, and returns `prev` itself wherever today's does (`:480`,
   `:487`, `:496`, `:509`, `:528`, `:555`, `:593`) — a hand-built `prev` whose `outcome` disagrees with its cells keeps that outcome across a
   `paused` exactly as today.
3. **`RN-R2` becomes the equivalence test, and holds by construction**: for every prefix of every corpus sequence,
   `inputs.reduce(step, emptyState())` deep-equals `fold(inputs)`, and both deep-equal the PRE-CHANGE implementation's —
   kept under `test/` as a frozen copy of today's `step`, an oracle that is not the code under test (section 5 rule 4).
   `RN-R1` holds: nothing survives a call.
4. **The driver's per-task index is a maintained index over the log, and is not a second source** — fact 8's condition:
   it holds each task's SUB-log (references to the records `append` pushed, in order) and nothing derived; the
   settlement/resolution merge stays in `effectiveOutcome`, handed that sub-log, and `isSuspended` likewise. Maintained in
   `append`, the one place every element passes (ADR 0014). ADR 0040 rule 2 amended a second time, by ADR 0121 (W195).
   `outputs()` grows from the same index instead of rebuilding.
5. **What does NOT move**: ADR 0014's single append order (no element added, removed or reordered); `RN-R2`'s statement
   (decision 3); ADR 0064's frozen copies (`onFoldInput` and `foldInputs()` still hand out frozen copies, and a checkpoint
   is still a copy) and `CHECKPOINT_FORMAT` 1; `RunState`'s shape; `fold`'s result on every sequence. **The invariant
   holds**: run state is still a pure fold of the event log, and the runtime's accumulator is that fold kept open.
6. **The fold's counter is an argument, never module state** (fact 9): an INTERNAL entry point takes an optional counter
   object the caller owns; public `fold` and `step` pass none. Not reachable from `index.ts` or any published entry, and
   W194 measures its cost when absent. The driver's counter is W195's to place, under the same two constraints — not
   observable through any public surface, and costing nothing a consumer could measure — and it names which.
7. **Three ADRs**: ADR 0120 (W194) — *the fold is one accumulator; `step` stays pure and costs the run*; ADR 0121 (W195) —
   *the driver keeps a per-task view of its log*, amending ADR 0040 rule 2; ADR 0122 (W196) — *a runtime's live state is a
   frozen copy on its handle*, amending ADR 0058 rules 1 and 5. ADR 0123 reserved, expected unused.
8. **Each changed public surface is stated where it changes** (P33 decision 7 … P38 decision 8): `RunHandle` gains three
   members, BREAKING for code that BUILDS one ((d)); `step`'s documented cost; nothing else. *(Dated 2026-10-21, W196:
   and (f)'s answer is a SECOND breaking surface — `await done` is frozen, so code that mutates it throws in 0.9.0.)*

### Stop-and-asks — (a)-(f) ANSWERED by the maintainer, 2026-10-21 — (f) the last, before W196 started

**(a)-(e) are the maintainer's, each answered as recommended.** The work-item rows below are written for those answers.
**(f) was asked at this declaration and was NOT answered then**: W194 and W195 did not wait on it; W196 did not start until
it was. ***Answered 2026-10-21, as recommended*** — **`await done` resolves with the SAME frozen object `state()` returns:
one copy, one definition; BREAKING in 0.9.0 for code that mutates the value from `await done`.** Recorded by
[W196](../work-items/w196-the-runs-live-state-on-its-handle.md), which built it ([ADR 0122](../decisions/0122-a-runtimes-live-state-is-a-frozen-copy-on-its-handle.md) rule 3).

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **Scope and shape** | **ONE plan, four items**: W194 the fold accumulator; W195 the driver's log index; W196 the runtime's live state on the handle; W197 the cost check — the LAST item, `gate:full` | **Two plans** (fold and handle; driver later): the app's P2 waits a release, and the gate's ratio check is written twice. **The fold only**: #2 unanswered, the app folds twice for ever |
| **(b)** | **What the handle exposes** | **`RunHandle.state(): RunState` — a FROZEN copy, CACHED until the next fold input** (repeated reads between inputs cost nothing), **plus `RunHandle.outcome(): RunOutcome` and `RunHandle.node(taskId): NodeRun \| null`** (frozen), the cheap reads. On `start` and on `resume`. Equal to `fold(driver.foldInputs())` at a quiescent point | **A live mutable view** — the scheduler's live-`detail` hazard, which ADR 0007 exists for: a consumer holding it sees it change under them, and one writing to it corrupts the runtime's own `done`. **The state handed to `onFoldInput` beside each input** — DECLINED: every consumer would pay a full materialisation per input whether it reads it or not, which is #1's cost moved, not removed |
| **(c)** | **Is the accumulator public?** | **NO — internal; the handle is the surface** | **Exported** (an incremental fold a consumer steps): a second public way to keep a run's state, a contract on its mutation rules, and the app's *"we would rather not own a second fold"* turned into owning ours |
| **(d)** | **Which release** | **0.9.0** — a new `RunHandle` member is BREAKING for code that BUILDS a `RunHandle`, `stop`'s precedent (P34 decision 10) | **0.8.1**: a breaking type under a patch number |
| **(e)** | **How the gate holds the cost** | **CLOCK-FREE COUNTS**: the fold counts its own property writes and element visits, the driver the log records it visits, at **2,000 and 8,000** map items; the test asserts the ratio stays **below ~6x** (linear 4x, quadratic 16x). Precedent: `test/driver/result-schema-cost.test.ts`. The counting hook costs nothing and is not observable in the shipped path — decision 6 says how for the fold; W195 says how for the driver | **A wall-clock budget** — a ratchet on hardware ([Q179](../questions/q179.md)), and fact 4 measured the same size at 988 ms in a fresh process and 3,818 ms in one that had just folded 4,000 items. **A clock RATIO** — the app's suggestion, steadier than a budget and still a property of a machine's GC |
| **(f)** | **What `done` resolves with, now that `state()` exists** — ANSWERED 2026-10-21 as recommended | **The value `state()` returns at that moment — the same frozen object**, so `await done === handle.state()` after it settles, and a consumer cannot mutate the run's final state where it can mutate nothing else the handle gives. Stated BREAKING in 0.9.0 beside (d)'s: code that MUTATES `await done` throws in strict mode | **A separate, unfrozen materialisation, as today** — no behaviour change for `done`, one extra materialisation per run at its end, and two objects for one state whose difference is only whether they freeze |

## Work items

**The sentences P36's retro proposal B carried, copied as P38's section did** — B′, C, D′ and E unchanged, with the three
brief sentences:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**, P35's three clauses and P36's two included: every
  file that READS the surface the item changes, found by a grep for each changed name over `src/`, `scripts/`,
  `examples/` and `index.ts`; a grep for each PREMISE the change falsifies; a grep for a SIBLING of each member the change
  adds. **Every row touching `AGENTS.md` owns the WHOLE of it**, and a parenthetical in an `Owns` cell is a forecast of
  where in the file, not a limit.
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two, the
  probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed.*

**Three sentences for every item's brief**: ***each item's Record states its readers' overlap***; ***an owner element a
resume's replay feeds is TAKEN AT REST, between two steps*** (`RN-R19`) — no element is added here (decision 5), so it binds
W196's resume road: the stored events are stepped into the accumulator before the first read, never by a caller's call;
and ***a COPY claim is provoked by an ALIAS and by a SHALLOW copy, over a fixture whose value is NESTED, and read in both
directions*** — W194's materialised state against its accumulator (a node's `result`, an ask's `input`, a gate's `key`) and
W196's frozen copy against the runtime's own.

**D′ applied — the sites each row moves.**

- **The siblings of `withOutcome`'s scans** (fact 3): every `Object.values(s.nodes)`, `allRegionRuns`, `pathEnds.some` —
  each becomes a count W194 maintains; a grep for `some(` and `Object.values(` over `src/fold/` finds them.
- **The siblings of `effectiveOutcome(this.log`** (facts 5, 7): `advance` (`driver.ts:3665`), `parked` (`:4860`),
  `hasParked` (`:4870`), `outputs()` (`:4337-4428`), `effectiveOutcomeOf` (`:5645-5651`) and every other `this.log` read —
  W195, by grep; `snapshot()` and the replay's prefix check (`append`, `:5189-5200`) read `this.log` or `this.inputs` and
  are re-read, not assumed.
- **The siblings of `state = step(state, …)`** (fact 10): `runtime.ts:846`, `:849`, the `done` predicate (`:783`), and
  every comment that states ADR 0058 rule 5's *one `RunState`, stepped* (`:329-334`, `:736`) — W196.
- **`DRIVER_FIELDS`** (`examples/l6.ts:14339`, `test/driver/retention.test.ts:264`) — W195's index and any counter field;
  **`NOT_RUN_STATE`** (`examples/run-flow.ts:1573`) only if W195's re-take finds a field there.
- **`LATE_SUITES`** (`test/definition/l4-corpus.test.ts:427`) and every counted suite's count with each new suite and case —
  W194, W195, W196, W197.
- **`spec/README.md`** rows: `run-state.md` v0.29 (W194, a new `RN-R43` — a fold's cost), v0.30 (W195, `RN-R13`'s retained
  terms), v0.31 (W196, `RN-R25`'s handle and a new `RN-R44` — what the handle's state is); `outcome-record.md` only if W195
  finds its section 6 names the scan.
- **`RUN_FLOOR`** (`scripts/check-docs.mjs`) — W196's `run` snippet of `handle.state()`.
- **`X10`** (`examples/README.md`) — W197's L6 block.
- **The PREMISES**: *the runtime keeps ONE `RunState`, `step`ped per fold input* (ADR 0058 rule 5, `runtime.ts:329-334`,
  `:736`, `AGENTS.md` section 8) — W196; *`this.log` is kept only because the two functions scan it* (`driver.ts:1516-1518`)
  and *computed on demand rather than maintained* (`:4330-4335`) — W195; *a step returns a new state and copies*
  (`run-state.ts:462-466`, `:651-658`) — W194; *if you fold incrementally from `onFoldInput`* (`AGENTS.md:1842`) — W196,
  which now points that consumer at the handle.
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W194 | **The fold is ONE accumulator** — linear `fold`, pure `step`; ADR 0120; decisions 1-3, 5, 6; facts 1-3, 9 | `src/fold/run-state.ts`, `src/fold/accumulator.ts` (new, internal), `test/fold/**`, `test/definition/l4-corpus.test.ts`, `spec/run-state.md` (`RN-R43`, `RN-R1`/`RN-R2`'s test text), `spec/README.md`, `AGENTS.md`, `doc/decisions/0120-*` | — | `gate:item`; L1 the equivalence over every prefix of every corpus sequence, both ways, against the pre-change oracle; each early-return arm returning `prev` itself; a hand-built inconsistent `prev` kept across `paused`; the copy claim on `result`, `input` and `key`, NESTED, both directions; the fold's own count ratio at 500 and 2,000 items below 6x; `fold` with no counter costing what it did |
| W195 | **The driver's per-task view of its log** — settlement reads and `outputs()` O(task), not O(log); ADR 0121; decision 4; facts 4-8 | `src/driver/driver.ts`, `test/driver/**`, `test/definition/l4-corpus.test.ts`, `examples/l6.ts` (`DRIVER_FIELDS` only), `examples/run-flow.ts` (`NOT_RUN_STATE`, if moved), `spec/run-state.md` (`RN-R13`), `spec/outcome-record.md` (if its re-take finds the scan named), `spec/README.md`, `AGENTS.md`, `doc/decisions/0121-*` | W194 | `gate:item`; the declaration step's PROFILE with `attempted` elements, before any edit — what in `takeAttempts`/`leaveStep`/`enter` grows; L2 every effective outcome and `isSuspended` read equal to `effectiveOutcome(this.log, id)` over the corpus, a resolution after a `user_action`, an ask answered, a resumed run; `outputs()` equal to a rebuild at every settlement of a `needs` flow; the driver's count ratio at 500 and 2,000 items, with `attempted`, below 6x |
| W196 | **The run's live state on its handle** — the runtime keeps the accumulator; `state()`, `outcome()`, `node()`; ADR 0122; (b), (c), (d), (f); fact 10 | `src/scheduler/runtime.ts`, `src/scheduler/index.ts`, `src/fold/accumulator.ts`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts`, `spec/run-state.md` (`RN-R25`, `RN-R44`), `spec/README.md`, `AGENTS.md`, `README.md` (the examples row), `scripts/check-docs.mjs` (`RUN_FLOOR`), `scripts/publish-output_test.ts` (if it lists the handle's members), `doc/decisions/0122-*` | W195, (f) | `gate:item`; L1 `state()` equal to `fold(driver.foldInputs())` at every quiescent point of a run on a double, on `start` and on `resume` (before the first delivered input too); the SAME object on two reads with no input between and a new one after; frozen, deep, and a mutation attempt changing neither a later read nor `done`; `outcome()` and `node(id)` equal to the state's; `done` per (f); after release, the final state; a `run` snippet in `AGENTS.md` |
| W197 | **The cost check, the exit artifact and the reply** — the count ratio at 2,000 / 8,000 items in the gate ((e)); the repro re-taken; the L6 block | `test/fold/map-cost.test.ts` (new) or the suite the item names, `test/definition/l4-corpus.test.ts`, `src/fold/accumulator.ts` and `src/driver/driver.ts` (the counters only), `examples/map-cost.ts` (new), `examples/l6.ts`, `examples/README.md`, `examples/flows/**`, `examples/workers/**`; outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2.reply.md` | W196 | **`gate:full`** (the plan's last item); L1-L2 the three ratios below 6x, each provoked red by its restored cost (rule 7, checked in); L6 in node 24 and deno |
| W198 | *reserved, expected unused* | | | |

**Every row shares `src/fold/`, `src/driver/driver.ts`, `spec/run-state.md` or `AGENTS.md` with its neighbour, so the four
are SERIAL in the order above, never concurrent** (`doc/workflow.md` section 7 rule 2). **No item edits
`scripts/check-register*.mjs`, `scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is every row's but the
last. **W194 and W195 hold their own ratios at small sizes at birth** — tests are part of the item (section 1 rule 2) — and
W197 makes the (e) sizes the gate's standing check with the provocations; the counters W194 and W195 place are what W197
reads.

**The reply to fyflow-app goes where P38's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass2.reply.md`, beside `fyflow-orchestration.pass1.reply.md` and
`fyflow-orchestration.pass1-followup.reply.md`. **W197 writes it**, from this plan and the four Records, once its own gate is
green: #1-#4 answered with the items and ADRs; (b)'s shape and why the `onFoldInput` road is declined; (d)'s 0.9.0; the
cost of reading `state()` after EVERY input (prediction 4) and the cheap reads that avoid it; fact 4's `queue.shift()` in
their repro; fact 6's `task.running` detail shape (`attemptNumber`, not `attempts`); and the publish state, measured.

**Questions reserved per item**, so no two take one: W194 Q720-Q724, W195 Q725-Q729, W196 Q730-Q734, W197 Q735-Q739.

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`), as W190-W192 did — no item
file is written at this declaration, so `npm run state`'s two derivations agree. What the row cannot carry is below: each
item's OUTPUTS, and what its declaration step RE-TAKES before any `src/` edit (P15 decision 5 — every fact is re-run by the
item that acts on it, never transcribed). Every item's last re-take is the ladder counts, the baseline this plan did not take.

**W194 — outputs**: ADR 0120; `src/fold/accumulator.ts` — `load(state)`, `apply(input)`, `materialise()`, and an optional
counter ARGUMENT (decision 6); `fold` and `step` over it; the pre-change `step`/`fold` kept under `test/fold/` as the
ORACLE, never edited again; `run-state.md` v0.29 (`RN-R43`; `RN-R1`/`RN-R2`'s Test text) and its `spec/README.md` row;
`AGENTS.md`'s sentences on `step`'s and `fold`'s cost. **Its corpus** is the fold suites' hand-written sequences and the
sequences a driver produces over `spec/examples/valid/**` on a double, as the L4 suites drive them. **Re-takes**: fact 1's
`fold` table, node 24 and deno; facts 2-3's spreads and scans by grep (a site this plan did not list is the item's);
whether `withOutcome` equals the stored `outcome` on every fold-REACHABLE state, and which hand-built states differ
(decision 2); every test asserting `step`'s identity; where the fold clones today (`asked`'s `input`, `gated`'s `key`) and
what a materialised state shares with an input (`result` by reference, ADR 0058 consequence 3) — the accumulator adds
and removes no share.

**W195 — outputs**: ADR 0121; the per-task view, maintained in `append`; `advance`, `parked`, `hasParked`,
`effectiveOutcomeOf` and every other per-task read through it; `outputs()` grown from it; what the profile finds on the
`attempted` road — fixed here if it is the same class, a stop-and-ask if not; the driver's counter, placed where no public
surface observes it, and `DRIVER_FIELDS` moved by its NAMES; `RN-R13`'s text. **Its second route** is the public
`effectiveOutcome` over the public `snapshot()`. **Re-takes**: fact 4's table, with and without `task.running` carrying
`attemptNumber`, node 24 and deno, each size in a FRESH process; a CPU profile at 16,000 items WITH `attempted` elements,
before any edit (fact 6); every `this.log` read and every `effectiveOutcome`/`isSuspended` call in `src/driver/` by grep;
whether `this.log` is still needed once the view exists (`snapshot()`, the replay's prefix check) — the view REPLACES a
field or adds one; `outcome-record.md` section 6 and `RN-R13` for a sentence the change falsifies.

**W196 — outputs**: ADR 0122, amending ADR 0058 rules 1 and 5; ONE accumulator per run in the runtime, the stored events
applied before the first read or the first delivered input, whichever is first; `state()` frozen at every depth and the
SAME object on every read with no input between; `outcome()` and `node(taskId)`, O(1); `done` per (f), still asked at a
microtask (ADR 0058 rule 6); after release (ADR 0091), `state()` the final state; `RN-R25`'s text and `RN-R44`;
`AGENTS.md` section 8 — the handle's reads in place of *fold incrementally from `onFoldInput`* for a runtime's consumer,
prediction 4's cost, a `run` snippet — and `README.md`'s row; BREAKING in 0.9.0 for code that BUILDS a handle. **The
version bump itself is the maintainer's `chore:` commit after the plan**, as 0.8.0's was (`581d0e5`). **Re-takes**: every
reader of `RunHandle` and every literal that BUILDS one, over `src/`, `test/`, `examples/`, `scripts/` and `AGENTS.md`, by
grep and by adding the members and counting typecheck errors per lane; the resume road's `seed`; what `freezeInput` and
`foldInputs()` share with a materialised state; every test reading `await done` by identity or mutating it.

**W197 — outputs**: the cost suite at 2,000 / 8,000 items for the three subjects in the exit artifact's clause (1), every
expected ratio derived from the item counts the case drives; the provocations, checked in — the spread restored in the
accumulator, the whole-log scan restored in the view, `outputs()` rebuilt per settlement, `state()` materialised per input
inside the runtime — each red for the reason it names and **none running unbounded** (a quadratic fold at 8,000 items is
minutes of wall, so a provocation reads its count against a ceiling and stops); `examples/map-cost.ts` (clause (2)); the L6
block (clause (3)), `X10` moved by it alone; the reply. **It places no logic**: it reads W194's and W195's counters, and
edits a counter site only if one cannot be read — an Exception named before the edit. **Re-takes**: the three ratios and
their walls in node, deno and chromium on W196's tree, against (e)'s 6x and section 8's plan-gate row; whether either
counter is observable through a public surface (decision 6); facts 1 and 4 on the final tree.

## Predictions, written before the items that test them

1. **W194 moves no assertion's expected value in any lane** — what `fold` and `step` return is unchanged on every sequence
   (decision 5). What moves is `step`'s doc comment, the counted suites' counts, and `run-state.md`'s version.
2. **`fold` at 4,000 items falls from fact 1's ~33 s to under 100 ms** on the machine fact 1 ran on, and the cliff goes with
   the spread (a guess about the cliff's cause, which this tests only indirectly).
3. **W195's index removes fact 4's superlinearity WITHOUT `attempted` elements; whether it removes it WITH them is W195's
   declaration step's question** (fact 6) — a second cause is the likelier reading of fact 4's right-hand column.
4. **`state()` read after every input is still O(run) per read** — a materialisation of a `nodes` record N entries long —
   so a consumer reading it per input pays O(run²) in total, at a far smaller constant than today's two folds. **`outcome()`
   and `node(taskId)` read per input cost O(1).** The reply says so and names the pattern: the cheap reads per input,
   `state()` when a view is drawn.
5. **No item moves `CHECKPOINT_FORMAT`, `FoldInput`, `RunState`'s shape, `RUN_FOR`, `isFed` or `snapshot()`'s value**
   (decision 5) — an item that finds it must is a stop-and-ask, not an edit.
6. **W197 moves `X10` by its block alone, and no existing L6 row.**

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q179](../questions/q179.md) | wall time is not a reproducible cost measure for this gate — why (e) holds counts, and why W197's repro re-take is a measurement and not a gate entry; `icebox` | — |
| [Q186](../questions/q186.md) | a reference to a large value inside a map — the per-instance clone cost, unchanged by this plan and not to be confused with it; `deferred` | — |
| [Q43](../questions/q43.md) | the maintained second source ADR 0040 rule 2 was written against — decision 4's condition is its answer for W195's index | W195 (ADR 0121 cites it) |
