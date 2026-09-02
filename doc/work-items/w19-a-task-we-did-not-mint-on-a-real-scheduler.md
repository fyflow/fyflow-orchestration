# W19 — A task we did not mint, on a real scheduler, with two runs

**Status:** DONE - 2026-09-02
**Plan:** [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md) — **this item is the plan's
exit artifact**: a scheduler carrying a task this library did not mint, two drivers running flows on
it, and both runs completing. It takes no decision; [W18](w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
does, and this is that decision on real workers.

```
Spec:       none new — this item writes no spec and amends none. It is W18's
            rule (spec/outcome-record.md section 6's OR-R10 and
            spec/task-id.md section 3's ID-R4, as ADR 0027 leaves them) on
            real workers, and P6 separates the two items on exactly that line.
            Its expected values are READ from those two documents plus
            spec/run-state.md section 3 (both runs reach an `end`, so both are
            `completed`) and spec/join-policy.md sections 2-3, never from what
            a run emits (doc/workflow.md section 5 rule 1).
Owns:       examples/**              (from W17, which is done — the same way
                                     W17 inherited it from W14 and W14 from
                                     W6/W5)
            That is the whole of it. No src/, no spec/, no test/.
Inputs:     ADR 0027 as W18 ships it — this item cannot start before that
            decision exists, because "both runs completing" is only reachable
            if the foreign settlement does not stop them, and what it does IS
            the decision.
            The L6 harness as W17 leaves it: examples/run-flow.ts (runFlow,
            runPair, buildScheduler, PairFacts), examples/l6.ts's EXPECTED[]
            and its pair block, examples/flows/, examples/workers/.
            The four things W17 added or repaired that must not be undone, and
            each has an assertion behind it: `finishedBy` derived from
            Promise.race's OWN result; `lateInputs` derived from `finishIndex`;
            `Expectation.joinSettledBy`; and the cross-row block asserting
            every shipped policy on every verdict section 3 lets it reach.
Outputs:    (1) a way to put a task this library did not mint onto the pair's
                shared scheduler — an option on runPair, or an exported
                buildScheduler; whichever, it is examples/run-flow.ts and it
                is public to l6.ts alone;
            (2) the pair row extended, or a second pair row beside it, in
                which the foreign task settles and BOTH runs still complete —
                the exit artifact, and the assertion that names it;
            (3) the foreign settlement asserted from the SCHEDULER's own
                record (PairFacts), not from either driver — the row's claim is
                about a settlement neither driver may act on, so reading it
                from a driver asserts the absence of a thing from the thing
                accused of dropping it;
            (4) examples/README.md and l6.ts's rendered table updated to the
                new row count, with the count derived rather than typed.
Depends on: W18 — and this is a hard dependency, not an ordering preference.
Blocks:     nothing. It is the last item of the plan.
Tests:      L6 IS the test; there is no separate suite. Three groups, all
            with values derived before running:
              - the exit artifact: both runs `completed`, each with its own
                four task ids from spec/task-id.md section 1, disjoint, and
                each log holding only its own run's records;
              - the foreign task: accepted by the scheduler, settled by it,
                and reaching both drivers — asserted from PairFacts, whose
                listeners are registered before either driver exists
                (doc/workflow.md section 5 rule 4);
              - the ORDERING, which is the part a single row hides: the
                foreign task settling BEFORE either run's own first settlement
                is the hostile case and is what the measurement below used.
Gate:       L0-L6, and L6 in BOTH runtimes — `npm run test:l6` (node 24) and
            `npm run test:l6:deno`. A green L0-L5 proves nothing here: this
            item's entire claim is about a real scheduler, and L0-L5 never see
            one. Then the two readers of doc/workflow.md section 6, the
            adequacy one in an isolated copy.
Reserves:   Q107-Q110, ADR — none. The decision is W18's, and an item that
            reserved one here would invite the exit artifact to re-take it
```

**No ADR is reserved, deliberately.** P6 reserves 0027-0028 and W18 holds both. If W19 finds
something that needs a decision, that is a finding reported to P6's retro, **not** an ADR taken by
the item whose job is to demonstrate the previous one. *(An unused reserve is skipped, never
reissued — `doc/workflow.md` section 3.)*

**`doc/decisions/**` is a record-step file** (`doc/workflow.md` v0.7 change 3), so if W19's result
falsifies a sentence in ADR 0027 or ADR 0023, correcting it needs no exception. **That is the gap
that blocked W17 from correcting ADR 0015**, and this item is the first that could plausibly hit it
again — a demonstration is exactly the thing that falsifies a decision's prose.

## Exceptions — files edited outside `Owns` and outside the record step

**None declared.** `Owns: examples/**` and the record step's six files are expected to be the whole
of it. Audited by hand after the record step with `git diff --name-only` and
`git ls-files --others --exclude-standard`, per `doc/workflow.md` section 7 rule 2;
`check-owns.mjs` stays retired.

*If ADR 0027 changes `Driver`'s public surface, `examples/l6.ts` and `examples/run-flow.ts` absorb it
inside `Owns`. If it changes a type `index.ts` exports, that is W18's file and W18's edit, made
before this item starts.*

## The load-bearing fact, measured on a REAL scheduler before this was declared

*`doc/workflow.md`: measure before declaring. **P6's urgency claim — "one foreign settlement stops
every driver subscribed to that scheduler" — had only ever been measured on a FAKE**, by W13's
conformity reader and again on 2026-08-31. This repository's own record is that fixtures-versus-reality
is where it has been wrong, and the fake establishes neither of the two things this item's premise
actually needs.*

Two questions a fake cannot answer, both run against `fyflow-scheduler@0.3.0` from npm, one real
`FyflowScheduler` with three inline `WorkerManager` pools, two `Driver`s on `valid/linear.flow.json`:

| | |
|---|---|
| **Does a real scheduler accept a task whose id is not ours, and settle it?** | **Yes.** `addTask(new FyflowTask({ id: 'nightly-cleanup', workerType: 'IngestWorker', … }))` is queued, dispatched to a real worker, and settles |
| **Does its settlement carry `detail.id`, so it reaches `parseTaskId` at all?** | **Yes.** `task.completed` fires with `detail.id === 'nightly-cleanup'` |

And then, with both questions answered yes, the claim itself:

```
1 scheduler accepted + settled the foreign id : true
2 settlement ids the scheduler dispatched     : ["nightly-cleanup","runa:ingest:-:0","runb:ingest:-:0"]
3 run failures reported                       : ["runa/InvalidTaskId","runb/InvalidTaskId"]
4 runa hasFailed / runb hasFailed             : true / true
5 runa dispatched ids                         : ["runa:ingest:-:0"]
```

**Confirmed, and sharper in two ways the fake could not show.**

1. **Row 2 is the part to carry.** The scheduler *kept working*. `runa:ingest:-:0` and
   `runb:ingest:-:0` both settled **after** the foreign task did — the drivers had already stopped, so
   neither routed a successor. Row 5 is one node of a three-node linear flow. The failure is not that
   the scheduler breaks; it is that **the drivers go deaf while everything around them proceeds
   normally**, which is the shape that will not be noticed in production.
2. **Ordering is a variable and it is the hostile direction that was measured.** The foreign task was
   added before `start()`, so both drivers died before their own first settlement arrived. A foreign
   task settling *after* both runs have finished is the benign case and would pass a row written
   carelessly. **W19's row must settle the foreign task while both runs are live**, and the
   declaration says so rather than leaving the interleaving to whatever the first draft produces.

*(`doc/workflow.md` section 5 rule 5 — this ARRANGES an ordering rather than depending on one, which
is the same move `buildScheduler`'s `SETTLES_LAST` makes and which W17 measured as the honest form.
Nothing asserts which of `pa` and `pb` settles first.)*

**What this does not establish, and W19 must:** all of the above is today's behaviour, with ADR 0027
not yet written. If ADR 0027 says *stop the run*, then **"both runs completing" is unreachable and
the exit artifact changes shape** — it would become *a scheduler carrying a foreign task, two
drivers, and both runs stopping legibly with the precondition documented*. That is a real outcome and
P6 says W18 is entitled to reach it. **This item's row is written after ADR 0027, from ADR 0027**,
which is the whole of why `Depends on: W18` is hard.

## Scope

**In**

1. **The injection point** — one way, in `examples/run-flow.ts`, to put a task this library did not
   mint onto the scheduler `runPair` builds. Added through the **instrumented** `addTask`, so
   `PairFacts.addTaskCalls` counts it and the count stays a fact about the scheduler rather than
   about the harness.
2. **The exit artifact row**, with the foreign settlement arranged to land while both runs are live.
3. **The scheduler-side assertions.** `PairFacts.settlementIds` gains the foreign id, and the
   existing *"the scheduler settled eight tasks, none of them twice"* becomes nine with the ninth
   named — **derived from the flow's node ids and the injected id, not pasted from a run.**
4. **Both L6 runtimes**, node 24 and deno. Every existing row runs in both and this one is not an
   exception.

**Out** — named rather than left implicit, with where it goes instead

- **Any decision.** W18's. If this item's demonstration argues against ADR 0027, that is a **finding
  reported to P6's retro**, and the loop is: report, do not re-decide inside the demonstration.
- **[Q90](../open-questions.md) — `ID-R4` tier 2's missing L6 coverage.** Out, per P6's Scope/Out.
  **The register asks to be re-read here and this is that re-read**, recorded rather than skipped:

  > **The instrument is now shared, which P6 could not have known.** Q90 needs a settlement carrying
  > *this* run's id for a node the driver never dispatched. W19 builds exactly the machinery that
  > produces one — injecting an arbitrary task into the pair's scheduler — so the marginal cost is
  > **the string**: `pa:notanode:-:0` instead of `nightly-cleanup`. P6's stated ground for excluding
  > it, *"a different experiment"*, was written when the two looked like different rigs. It is
  > **still out**, because widening a scope the plan settled is not this item's call
  > (`doc/workflow.md` section 1 rule 3), but the reason has weakened and **the recommendation is
  > that Q90's row be updated to say the instrument exists and to name W19's harness**. For P6's
  > retro to rule on, one way or the other.

- **`src/`, `spec/`, `test/`.** None of them. An item that reached into `src/` to make its
  demonstration pass would be demonstrating the fix rather than the system.
- **[Q99](../open-questions.md)'s three remaining harness knobs and [Q100](../open-questions.md)'s
  unread rendered table.** W17 raised both and left them honest; W19 inherits `examples/**` and does
  not close them. **Q100 is worth one line at the Record**: it is W15's renderer finding in a second
  file, and this item adds a row to that same unread table.

## Verification

How each clause of `Gate:` is run.

| Clause | Command |
|---|---|
| L0 | `npm run check:spec`, `check:source`, `check:scheduler` (+ self-test — **D3** is what stops two runtimes reporting green against two different schedulers), `check:policies` (+ self-test), `check:docs` (+ self-test), `npm run lint`, `npm run typecheck` — including `typecheck:examples`, which is the project this item's files live in |
| L1-L5 | `npm run test` (node 24), `npm run test:deno`, `npm run test:browser` — **chromium only** by default (`scripts/run-browser-tests.mjs:68`); `npm run test:browser:all` is firefox and webkit and `npm run gate` does **not** run it. Unchanged by this item, run because the ladder is climbed from L0 |
| **L6, node** | `npm run test:l6` |
| **L6, deno** | `npm run test:l6:deno` |
| conformity reader | `doc/workflow.md` section 6, fresh context, spec first, re-deriving this item's expected values independently before looking at them |
| adequacy reader | same, tests second, mutating **in an isolated copy** — `cp -r node_modules` (inert: zero symlinks and zero reparse points, re-verified before the copy), green in the copy before the reader starts, **scan for links before removing it** (`find <copy> -type l`, and `Get-ChildItem -Recurse -Force -Attributes ReparsePoint`) |

**Do not read the gate's result through a grep.** W17 did, its patterns missed `deno lint`'s failure
line, and it reported a red L0 as green for a round. Read the exit code.

**And do not chain the two assertion counts.** `npm run test`'s number is `test()` **cases**
([Q98](../open-questions.md), `test/runner.ts:62`); L6's is individual assertions. Same word,
different nouns. Both are re-derived from a run.

**Rule 8 — provocations, both obligations** (`doc/workflow.md` v0.7 change 1). The set is written to
the **rule's clauses** — `OR-R10` and `ID-R4` as ADR 0027 leaves them, every terminal state, both
orderings of the foreign settlement — **and** to the **`Outputs` table's rows**, one probe per row
asking what would fail if that output did not exist. **W17 is the item that proves the second half is
not redundant here**: its deliverable-written set found three of four real survivors and was blind to
a clause of the rule, in this very file. **And a survivor is only a survivor once a second,
independent route confirms the mutated clause was reachable** (v0.7 change 2) — a probe that changes
`examples/l6.ts` without changing an observable reads as SURVIVED with the gate green, which is the
dangerous direction.

*Per the template, this item touches routing at L6, so:* a branch routed away from its join (Q4) —
**not applicable**, the pair row's flow is `fanout-join` and no branch routes away; `user_action`
(Q17) — **not applicable**, covered by L6's `suspend-resume` rows and unchanged here; no matching
decision edge (Q10) — **not applicable**; a duplicate task id (Q13) — **not applicable to this row's
own ids, and covered adjacently**: the pair row's disjointness assertions are what `spec/task-id.md`
section 2 is about, and they stay; a nested fan-out (Q6) — **not applicable**, still unbuilt
(`FD-V15`).

## Record

**Gate — what ran.** One row per clause of the `Gate:` line above. Each verdict starts with `RAN` or
`NOT RUN`; a clause with no row reads as *did not run*.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, green** | `check-spec` 8 checks (C4 covered 23 definition refusals); `check-source` **11 checks over 13 published files**; `check-scheduler` 5 checks + **12/12** self-test probes; `check-policies` 3 checks + **13/13**; `check-docs` 5 checks over **19 snippets — 14 `run`, 5 `check`** + **14/14**; `deno lint` **42 files**; `typecheck` **5 projects**, `typecheck:examples` included — the project this item's files live in. *(One number per script, each read off its own line. `42` is `deno lint`'s and belongs to nothing else — W18's Record put it on `check-source`'s row.)* |
| L1-L5 | **RAN, green, unchanged by this item** | **410 `test()` cases over 18 files** in node 24.20.0, deno 2.9.6 and chromium, with the runner's own parity line. **`npm run gate` runs `test:browser`, which is chromium only** (`scripts/run-browser-tests.mjs:68`) — so this item **additionally ran `npm run test:browser:all`**, giving **410 in firefox and 410 in webkit** as well. All five runtimes are measured on this tree rather than inherited. `examples/**` is outside the browser bundle's input set (`RT-R10`), so this item could not have moved them. |
| **L6, node 24** | **RAN, green** | **19 row labels, 21 real runs, 373 assertions.** Was 18 / 19 / 342. Both printed numbers are derived from the arrays; neither is typed. |
| **L6, deno** | **RAN, green** | deno 2.9.6 — the same 21 runs and the same 373 assertions. |
| conformity reader | **RAN** | **11 findings, 5 blocking.** Every one acted on. The sharpest: `examples/README.md`'s new section described a row that did not exist — singular *"a task"*, *"one report each"* — in the file whose job is to state the counts, directly under a new parenthetical about counts going stale; a measurement was **read forward** from the declaration, where it had been taken on `linear.flow.json` (two task nodes) and was quoted as *"one of its four"*; and *"five of `parseTaskId`'s **six** refusal shapes"* contradicted both ADR 0027 and `spec/outcome-record.md`, which say **five**. It also found the one sentence this item's demonstration **falsifies in a decision** — see *Questions raised* and ADR 0027's producer row 4. |
| adequacy reader | **RAN** | **26 mutations, 7 nominal survivors: 2 BLOCKING, 4 non-blocking, 1 correctly self-classified as vacuous.** Both blocking ones are fixed and both fixes are provoked. |
| re-run after acting | **RAN, green** | `npm run gate` **exit 0**, read from the exit code and not through a grep (W17's finding, one item on). Uncommitted; there is no sha to name, and this row will read `<sha>` only if the item is committed. |

**Read the gate's result from its exit code.** W17 read it through a grep, its patterns missed
`deno lint`'s failure line, and it reported a red L0 as green for a round.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1)** the injection point in `run-flow.ts` | yes — `runPair`'s third argument, `foreign: readonly ForeignTask[]`, injected **after** the instrumentation and **before** `Promise.all` | Deleting the loop and ignoring `foreign`: **6** L6 failures. Injecting through the *uninstrumented* `addTask`, so `PairFacts` stops counting it: **1**. |
| **(2)** the exit-artifact row | yes — `PAIR_ROWS[1]`, `two runs / one scheduler / tasks we did not mint`, runs `pc` and `pd` | Deleting the row: **1**. Keeping the row and emptying its `foreign`: **2**. Restoring ADR 0023 rule 2 so the row is not reachable at all: **13**. |
| **(3)** the foreign settlement asserted from `PairFacts` | yes — `settlementIds` (order and duplicates kept), `listenersAtSettlement`, `addTaskCalls`, all from listeners registered before either driver exists | Reading the settlement set from the two drivers alone: **1**. Sourcing the **ordering** from a driver: **2** — and that one was worth **0** until the adequacy reader found it, see *What broke*. Making the consumer-side `parseTaskId` audit vacuous: **1**. Recording the listener count once rather than per settlement: **2**. |
| **(4)** `examples/README.md` and the rendered table's counts | **partly, and the gap is [Q100](../open-questions.md)** — `l6.ts`'s counts are derived (`pairRunCount`, `pairLabel`, `wantSettlements`); `examples/README.md`'s are typed | **Nothing, in both halves.** Un-deriving `l6.ts`'s printed run count back to a literal **survives**; so does replacing `examples/README.md`'s *"373 assertions over 21 real runs"* with *"999 assertions over 4 real runs"*. A markdown file cannot derive a count. Two more occurrences of Q100, and the row says so rather than reading *yes*. |

**`Owns` audit.** `git diff --name-only` and `git ls-files --others --exclude-standard`, by hand,
after the record step.

**`Owns: examples/**` — three files, and all three are inside it**: `examples/l6.ts`,
`examples/run-flow.ts`, `examples/README.md`.

**Record step — six files, all of them on `doc/workflow.md` section 1 rule 5's list**: this file, the
plan's Record in `doc/plans/p6-*.md`, `doc/README.md`, `CLAUDE.md`, `README.md`,
`doc/open-questions.md`, and **`doc/decisions/0027-*.md`**.

**Exceptions: none.** The declaration predicted none and none was needed. **`doc/decisions/**` is the
row to read**: this item corrected a decision's Context table, and under `doc/workflow.md` v0.7
change 3 that is a record-step file rather than an exception — see *What this taught*.

*(Everything else in `git status` at the time of writing is [W18](w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)'s
uncommitted work — `src/driver/**`, `test/driver/**`, four `spec/` documents, `AGENTS.md`,
`scripts/check-docs.mjs` and five docs. W19 wrote to none of them. `src/driver/driver.ts` was
mutated by the provocation sweep and restored; the restore is verified by diff, not assumed.)*

**The exit artifact — P6's, stated so a person can check it.**

```bash
npm run test:l6        # node 24
npm run test:l6:deno   # deno
```

Row 19 of the printed table, `two runs / one scheduler / tasks we did not mint`. **One real
`FyflowScheduler`** carrying **five tasks this library did not mint** — `nightly-cleanup`,
`pc:ingest:x:0`, `p c:ingest:-:0`, `pc:ing est:-:0`, `pc:ingest:-:00`, one per refusal `parseTaskId`
makes. All five are queued before either `Driver` is constructed, on a single-slot inline pool, so
**all five settle before either run settles anything**, with both drivers already attached. **Two
`Driver`s, and both runs read `completed`**, each having dispatched all four of its own task ids.
Each driver reported all five settlements through `onUnmintedTask`, **under its own `runId`**, and
routed past every one of them.

**Under the rule ADR 0027 supersedes, that row is not reachable**, and the number is measured on
**this** row rather than inherited. Restoring ADR 0023 rule 2 (tier 0 rethrows) and running row 19:

| | ADR 0027 | ADR 0023 rule 2 |
|---|---|---|
| `pc` / `pd` outcome | `completed` / `completed` | **`stopped` / `stopped`** |
| task ids each run dispatched | 4 of 4 | **1 of 4** |
| `InvalidTaskId` reported per run | **0** | **5** — one per foreign task |
| tasks the scheduler was handed | 13 | **7**, and it settled every one |
| L6 | green | **13 failures** |

The failure was never that the scheduler breaks — it settled everything it was given, in both
columns. It is that **the drivers go deaf while everything around them proceeds**, which is the shape
that does not get noticed in production.

**Rule 8 — the provocation set, both obligations** (`doc/workflow.md` v0.7 change 1).

**25 probes on the final tree, 22 caught, 3 survivors — all three classified.** The set was run
three times: once as written, once after closing its own survivor, and once after acting on the
readers, with **the readers' exact edits checked back in as probes** (the `R` rows). Every failure
count is L6 in node; `L1-L5` names the second, independent route. The harness names its own rule,
asserts every mutation matched its anchor (rule 7 (b)), restores **every file any probe touches**,
and **diffs the tree against the backup when the run ends** — W18's finding, acted on. Restore
verified clean over four files on every run.

**(a) written to the RULE's clauses** — `ID-R5` and ADR 0027 as they land at L6, and `ID-R4` tier 1's
asymmetry with them:

| | the edit | L6 | L1-L5 |
|---|---|---|---|
| A1 | tier 0's `return` becomes `throw e` — **ADR 0023 rule 2 restored** | **13** | red |
| A2 | the `onUnmintedTask?.(…)` call deleted, `return` kept | **2** | red |
| A3 | `runId: this.runId` → `runId: 'pc'` | **1** | red |
| A4 | `taskId` → `taskId: ''` | **2** | red |
| A5 | `reason` → `reason: 'unparseable task id'` | **2** | red |
| A6 | `event: name` → `event: 'task.settled'` | **2** | red |
| A7 | `ID-R4` tier 1 also calls `onUnmintedTask` — **the widening ADR 0027 names and refuses** | **4** | red |
| A8 | `if (typeof taskId === 'string' && taskId.includes(':')) throw e` after the `instanceof` | **15** | red |
| A9 | the injection loop wrapped in `setTimeout(…, 30)` — the order reversed | **1** | — |
| A10 | `await new Promise(r => setTimeout(r, 120))` before `Promise.all` — the foreign tasks settle into an empty room | **3** | — |
| A11 | the row's `workerType` → `'ReviewWorker'`, so the foreign tasks end `user_action` | **3** | — |

**(b) written to the `Outputs` table's ROWS** — one probe per row, asking what would fail if that
output did not exist:

| | the edit | L6 |
|---|---|---|
| B1 | the injection loop → `void foreign;` | **6** |
| B1b | injected through `realAddTask` rather than the instrumented `addTask` | **1** |
| B2 | `PAIR_ROWS[1]` deleted entirely | **1** |
| B2b | the row kept, `foreign: []` | **2** |
| B3 | `wantSettlements` compared against `runs.flatMap(r.dispatched)` | **1** |
| B3b | `mintedByADriver`'s body → `void id; return true;` | **1** |
| B4 | `pairRunCount` → the literal `2` | **SURVIVED** |

**(c) the READERS' exact edits, checked back in.** W18's carried-forward finding is that *rule 8 says
break the fix; it does not say break the fix you wrote for the last provocation*, and these are the
least-tested lines in the item:

| | the edit | L6 |
|---|---|---|
| R1 | `listenersAtSettlement.push(…)` guarded by `if (…length === 0)` | **2** |
| R1b | the array cleared before each push, so only the last is kept — the reader's original shape | **2** |
| R2 | the ordering assertion's source → `runs[0][1].unmintedTasks.map(u => u.taskId)` | **2** |
| R2b | the injection loop wrapped in `setTimeout(…, 200)` — the **benign** ordering, the reader's second route | **6** |
| R3 | tier 0 narrowed by MESSAGE SHAPE to the two refusals L6 used to reach | **15** | 
| R4 | run `b` wrapped so its driver attaches 60 ms late — the reader's second route for R1 | **3** |
| R5 | `examples/README.md`'s *"373 assertions over 21 real runs"* → *"999 … over 4"* | **SURVIVED** |

**The three survivors, each against v0.7 change 2's bar** — *a survivor is only a survivor once a
second, independent route confirms the mutated clause was reachable*:

1. **B4 and R5 are real and both are [Q100](../open-questions.md)**, in two files. `l6.ts`'s printed
   header can read *19 real runs* for a run of 21, and `examples/README.md`'s three counts can be
   falsified outright, both with the whole gate green. *Second route:* run either and the wrong
   number is printed, so the clause is plainly reachable. **Not closed** — closing them is Q100,
   which P6 scoped out and W17 left honest, and **a markdown file cannot derive a count at all**, so
   for the README half *"derived rather than typed"* is unachievable rather than unachieved. That is
   why the `Outputs` row reads *partly* rather than *yes*.
2. **B3 as written is a vacuous probe of the author's own making, and the honest form is caught.**
   Its first version — the settlement set read from the drivers **alone** — costs **1**. Rewriting it
   as *the drivers' ids plus the row's own declared foreign ids* hands the mutation the answer, so it
   changes no observable and has no second route. Recorded because the distinction is the whole of
   v0.7 change 2: **the assertion that a driver cannot satisfy is the ORDERING one** (R2, 2
   failures), not this one.
3. **`PAIR_ROW`'s derivation buys nothing, and this was measured rather than assumed.** Replacing it
   with the literal it evaluates to changes no observable: `EXPECTED_TOTAL` follows the rows on both
   sides, and only `DECLARED_TOTAL` — a number a human wrote down — notices a row disappearing. It is
   **maintenance, not an assertion**, and `l6.ts` now says so in place rather than letting a reader
   count it. W6's shared-source finding, still live.

**What broke.**

**1. Nothing in `src/` — which is the result the item was declared to produce.** `Owns` is
`examples/**` and the item reached into no other directory. The one behaviour it exists to
demonstrate worked first time on real workers, and **every hand-derived expected value matched on its
first run** — both runs' outcomes, all eight task ids, all five `UnmintedTask` records field by
field, and all five `reason` strings written from `spec/task-id.md` section 1's grammar before
anything ran.

**2. Two things the author built and could not falsify, both found by the adequacy reader, both the
same shape this file has now recorded three times.**

- **The *"both drivers were attached"* half of the hostile-ordering claim was a latched flag.**
  `listenersAtFirstSettlement` was set under `if (settlementIds.length === 0)`; deleting that guard
  so every later settlement overwrote it left **all 370 assertions green** and made
  `listenersAtFirstSettlement === listenersTotal` a tautology — taking with it the whole second half
  of a claim the harness leans on in as many words. **This is `timedOut` and `lateInputs` a third
  time**: a value tracked beside the thing that produces it rather than derived from it. Fixed the
  same way, by recording the count *per settlement* in an array beside `settlementIds` and reading
  `[0]`, with the two lengths asserted equal. Both shapes of the probe now cost **2** each.
- **The ordering assertion — the item's declared load-bearing arrangement — could be sourced from a
  driver.** Substituting `runs[0][1].unmintedTasks.map(u => u.taskId)` for `facts.settlementIds` left
  it green, and with the *benign* ordering applied as well the row went to **0 failures, exit 0**.
  That is precisely what Output (3) forbids — *reading it from a driver asserts the absence of a
  thing from the thing accused of dropping it* — with nothing saying so. Fixed by asserting the
  **shape of the whole settlement sequence** (`['foreign' × 5, 'ours' × 8]`) rather than a prefix of
  ids: a driver knows only what it was told about, so no driver-sourced list can satisfy it. The
  substitution now costs **2** and the benign ordering **6**. It also runs on the **control** row,
  where it reads *"all eight settlements the scheduler dispatched were ours"*.

**3. Five things stated in prose that were not true, all found by the conformity reader**, and the
list is worth reading as a set because four of the five are counts. `examples/README.md` described a
one-task row that had two; a measurement was quoted as *"one of its four tasks"* from a declaration
that had measured a **two**-task flow; `parseTaskId`'s refusals were called **six** where `src/`,
ADR 0027 and `spec/outcome-record.md` all say five; the `mintedByADriver` comment said *"non-empty on
both rows"* and *"exactly one"* about a value that was empty on one row and two on the other; and
*"written from the grammar, not pasted from a run"* was half true, because the message **wording** is
read from `parseTaskId`, not from `spec/`.

**What this taught.**

**1. `doc/workflow.md` v0.7 change 3 fired, in the direction its own retro predicted, on the first
item that could hit it.** W17 could not correct a false sentence in ADR 0015 because
`doc/decisions/**` was in nobody's `Owns` and in no record-step list. P5's retro added it *"so a
demonstration could correct the decision it demonstrates"*, and W19's declaration says in as many
words that it is *"the first item likely to hit it again"*. It did. **ADR 0027's producer table
listed three producers of an unparseable id and could not name the one this item built** — its third
row is *"a `detail` with **no** `id`, or an `id` that is not a string"*, while `pc:ingest:x:0` is a
four-segment string in our own shape. That is the class the decision's whole argument turns on — *"a
library that assumes `detail.id` is forever what it dispatched"*, which `test/driver/lifetime.test.ts`
calls *"a corrupted id for a task that IS ours"*. **Producer row 4 is added, no rule changes, and no
exception was declared or needed.** The rule cost one paragraph and bought a decision whose
enumeration now matches its argument.

**2. A survivor closed by the author is where the reader looks next, and half-closing one is worse
than not closing it.** The item's own sweep found that L6 injected a **colon-free** id only, so
narrowing tier 0 to `if (taskId.includes(':')) throw e` — restoring ADR 0023 rule 2 for six of the
seven shapes `SHAPES` enumerates — left all 370 assertions green. It closed that with a second id and
re-ran the set. **The adequacy reader then measured that the close had taken L6 from one refusal to
two of five**, and narrowed tier 0 by *message shape* instead, with the same result. `ID-R5` is one
guard over five refusals and a row that reaches two of them is a row that can be narrowed to two.
Closed properly: `UNMINTED` is now one id per refusal site, and both narrowings cost **15**.
*(The sixth way tier 0 fires — a `detail` with no string `id` — cannot be reached by injecting a
task, because a real `FyflowScheduler` always sets `id`. That is a property of the scheduler, not a
gap, and it is said in place.)*

**3. W18's finding held, and it held for the readers' fixes rather than for the author's.** *Rule 8
says break the fix; it does not say break the fix you wrote for the last provocation.* The whole set
was re-run after acting, twice — once after the author's own close, and once after the readers' — and
**the readers' exact edits are checked back in as probes** (`R1`, `R1b`, `R2`, `R2b`, `R3`, `R4`, and
`R5` as a declared survivor). That is what turns *"we fixed it"* into a number.

**4. Rule 8's two halves, fifth sample, and the split fell differently again.** The **rule**-written
half found the one code-level survivor (colon-free ids). The **`Outputs`**-written half found what
the deliverable did not do — that output (4) is unachievable in a markdown file and only partly
achieved in `l6.ts`. **Neither half found either of the two blocking survivors**: both were about a
*harness field's provenance* — a latched flag, and an assertion's source — which is neither a clause
of the rule nor a row of the `Outputs` table. That is a third category, and P6's retro should judge
whether it generalises: **the author's set is written to what the item CLAIMS, and a reader's is
written to where the claim's VALUE comes from.**

**5. The harness's own rule-7 (b) guard fired for real.** After the first close moved a probe's
anchor, the sweep aborted with *"the mutation matched NOTHING"* rather than reporting a pass. That is
`check-docs-selftest`'s probe 11 in a scratch harness, and it is the reason the requirement exists.
The harness also restores **every file any probe touches** and **diffs the tree against the backup
when the run ends** — W18's finding, acted on; the restore verified clean over four files on every
run.

**6. Two readers, 18 findings, 4 shared.** Ninth overlap measurement and inside the band
(`doc/workflow.md` section 6 says 1-4, whatever the item's size). Each arrived from a different
direction: `examples/README.md` (the conformity reader read the row and found the content wrong; the
adequacy reader falsified the counts and found nothing catches them); `parseTaskId`'s **five**
refusals (a wrong number in prose, and a coverage measurement of 2 of 5); the ordering assertion (one
found it pinned an order `spec/` does not fix, the other that its source was swappable); and **tier
0's `event` field taking one value at L6** — which both found independently and neither could have
got from the other. **The absolute count is what to carry.**

**Questions raised.** Q ids from Q107-Q110. They also go in `doc/open-questions.md`.

- **[Q107](../open-questions.md)** — **`ID-R5` at L6 sees `task.completed` and nothing else, and both
  readers found it independently.** All five foreign tasks succeed, so the `event` field is pinned to
  one value: replacing `event: name` with the constant `'task.completed'` survives at L6, and so does
  guarding the report with `if (name === 'task.completed')`. Both are caught at L1-L5. **The
  L6-shaped half is real and is measured**: on a real scheduler a foreign non-optional task that
  throws fires `task.failed` **and** `task.user_action` (ADR 0007 rule 2), tier 0 reports **twice**
  because it sits above `normalizeEvent`, and both runs still complete — ADR 0027's *"a cost that is
  not a cost"*, on real workers rather than on a fake, for the first time. **Not built as a row**, and
  the reason is stated rather than shrugged: every throwing pool in `buildScheduler` is in
  `SETTLES_LAST` and settles at `delayMs * 4`, so such a task cannot join this row's determinate
  ordering — it would have to come from a new worker role, or the arrangement would have to be traded
  for a timing margin, which is the exact thing W17's finding was about. The neighbouring clause is
  the same shape: inserting `void normalizeEvent(...)` above tier 0 survives at L6 and costs one
  L1-L5 failure, so **tier 0's position above `normalizeEvent` has no L6 coverage either.**
- **[Q108](../open-questions.md)** — **ADR 0027 names three producers that can never be ours and W19
  demonstrates one of them; the second is demonstrated nowhere at all.** A worker calling
  `context.spawnTask()` mints a child id the caller invents — the scheduler's own reference spells it
  `` `${payload.id}-child` `` — and ADR 0023's *Correction* 3 found that case listed among that ADR's
  own *benefits*. It has no test over a fake and no row at L6, and it is one of the two the decision
  calls **the common case on the blessed topology**. `ForeignTask` is not the instrument for it: the
  point is that the child comes from a **worker**, not from the harness. It interacts with
  [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 2 — *a
  worker computes and does not route* — which is why it is a question rather than a row.

*(Q109 and Q110 are unused and are **skipped, never reissued** — `doc/workflow.md` section 3.)*

**Recommendations to the register, made rather than acted on** (`doc/workflow.md` section 1 rule 3 —
widening a scope the plan settled is not this item's call):

- **[Q90](../open-questions.md)** asks to be re-read when W19 is declared in detail, and its stated
  ground for having no home was that tier 2 *"needs a settlement carrying **this** run's id for a
  task the driver never dispatched, and a real scheduler produces one only if something **injects**
  it — which no L6 row does."* **One now does.** `ForeignTask.id` reaches the scheduler verbatim, and
  `pc:ingest:x:0` is already this run's id with a corrupted segment; `pc:notanode:-:0` **parses**,
  reaches tier 2, and is `UndispatchedTask`. The marginal cost is the string. The row is updated to
  say the instrument exists and to name the harness; **taking it is P6's retro's call.**
- **[Q100](../open-questions.md)** gains two measured occurrences from this item: `l6.ts`'s printed
  run count can be un-derived to a literal, and `examples/README.md`'s three counts can be falsified
  outright, both with the whole gate green. The second is the sharper one — a markdown file cannot
  derive a count, so *"derived rather than typed"* is not achievable there at all.
- **[Q99](../open-questions.md)**'s three remaining harness knobs are untouched, as declared.
- **Not a Q, and not this item's file to fix:** `test/driver/lifetime.test.ts:324` says *"`ID-R5` is
  one guard over **SIX** refusals"*. `parseTaskId` has **five** (`src/driver/ids.ts:62,65,66,67,68`),
  which is what ADR 0027's producer table and `spec/outcome-record.md` section 6 both say, and what
  its own `SHAPES` table reaches through seven ids. W19 inherited the six into its own prose and its
  conformity reader caught it there. `test/driver/**` is W18's; reported for P6's retro.
