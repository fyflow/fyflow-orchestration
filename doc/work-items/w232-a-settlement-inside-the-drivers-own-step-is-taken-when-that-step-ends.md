# W232 — a settlement that arrives INSIDE the driver's own step is copied at once and taken when that step ends

**Status:** done 2026-11-15 — `npm run gate:item` EXIT 0 on the final tree (the Record); both readers RAN twice, once per attempt, and every finding acted on; ADR 0146; two files edited outside `Owns` NOT asked (Exceptions). Earlier: declared 2026-11-15 on `8cf2c47` (branch `p47-loop`); REDECLARED the same day after its first attempt was measured wrong and reverted (below), before any file under the new `Owns` was edited
**Plan:** none — an item outside any plan, on W98's, W139's, W150's, W151's and W231's precedent. Its source is the
review of the pull request that carries P47, finding 3, and two answers of the maintainer's on 2026-11-15: *a separate
item after W231*, and, after this item's first attempt, *(b) the general fix now*.

*This file carries NO relative link: ids and paths are bare text.*

**Question:** *when a scheduler settles a task INSIDE `addTask` — on the stack of the driver's own step — can the driver
copy the settlement there and append and route it once that step has ended, so that such a scheduler produces the log a
scheduler that settles later produces, on a stack that does not grow with what the run does?*

## The finding, and the first attempt

Review finding 3: `settleLoop -> openRound -> enter -> dispatch -> addTask`, and where the scheduler settles the task
inside `addTask` the settlement's listener runs on that stack and reaches `settleLoop` again — a round's frames per
round. `fyflow-scheduler` at the pin settles asynchronously; a consumer's test double or own `SchedulerLike` need not.

**The first attempt (declared, built, read, REVERTED).** The loop opened its next round from the frame that opened the
first, the nested `settleLoop` only marking it due. Reproduced first: 5000 rounds on a settling-inside double ended in
`RangeError`. After the change the stack was flat — and **the declaration's prediction that the log would not move was
false**, measured by its conformity reader in two reachable shapes:

| | shape | what moved |
|---|---|---|
| 1 | a fan-out or map in the loop's body, under a join policy that fires before every branch is entered | the fan-out arm went on entering its remaining branches between a round's `branch.arrived` and the next `branch.opened` — three elements between the two |
| 2 | a scheduler that, inside one `addTask`, settles the new task and then another it was holding | that other settlement landed between the two; **and a resume was REFUSED as diverged at 16 of 30 cuts** (0 before), because a replay opens the round at once |

and a round could be opened on a HALTED run in both, and a throw while a round was opened reached `start()`'s caller.
The same reader measured what predates the attempt: **any fan-out on a scheduler that settles everything inside
`addTask` is already refused at resume** (a plain fan-out, no loop, the shipped policy: 7 of 14 cuts), because a nested
settlement is appended in an order no replay regenerates. The adequacy reader measured a third thing that predates it:
a `pause()` or `stop()` called from a callback on such a scheduler is taken only after the whole run. So the defect is
not the loop's: **it is that a settlement is routed on the stack of the step that dispatched it.**

## What the driver already does, read on `8cf2c47`

| | read | what it says |
|---|---|---|
| R1 | `onEventOrThrow` | a terminal event is decided in order: `ID-R4`'s tiers from the task id, then `normalizeEvent` — the COPY (`OR-R1`, `OR-R2`; it throws `OR-R6`) — then `settle(record, …)`, which appends and routes |
| R2 | `heardRunning`, `takeAttempts`, `RN-R40` | a `task.running` heard inside the driver's `addTask` is QUEUED and appended when the step ends — *each BETWEEN two of the driver's steps, where a replay feeds it*. The pattern this item applies to a settlement |
| R3 | `leaveStep` | at depth 0: the attempts, then a pending pause / unpause / resolution, then a pending stop. A step nested in another only decrements |
| R4 | `settle` | shared by the replay (`RN-R19`), which feeds each stored settlement AT REST |

```
Spec:       spec/run-state.md gains ONE rule, as its own edit before the code and after the measurement: a settlement
            heard while the driver is on the stack of its own step is COPIED there (OR-R1 is not relaxed) and
            appended and routed when that step has ended — after the attempts, a pending pause / unpause /
            resolution and a pending stop, one settlement a step, in the order heard — so the sequence is the one a
            scheduler settling LATER produces and a replay regenerates. Version bump; spec/README.md's cell.
            spec/outcome-record.md OR-R10 / OR-R1 are READ against it and changed only if a sentence is made false.
            ADR 0146 records the decision (a CORE change to the listener boundary; the maintainer's (b)).
Owns:       src/driver/driver.ts (onEventOrThrow's hand-off to settle; leaveStep; one new queue and its drain —
            nothing else); spec/run-state.md; spec/README.md; doc/decisions/0146-*.md;
            test/driver/loop.test.ts (the cases on a settling-inside double); a NEW suite test/driver/
            settle-inside.test.ts for what is not a loop's (fan-out, map, resume at every cut, pause, stop, cancel,
            a throw); test/definition/l4-corpus.test.ts (the suites' registration and counts);
            AGENTS.md (the scheduler seam's section and the BREAKING list — a double's log order moves);
            this file.
            Exceptions: the record step's files. spec/outcome-record.md ONLY if a sentence there is made false, and
            then as a stop-and-ask. Any existing test that pinned the nested order is a STOP-AND-ASK, not an edit.
Inputs:     both readers' reports on the first attempt (their scripts are the shapes this item's tests take);
            R1-R4; RN-R19, RN-R29, RN-R31, RN-R33, RN-R35, RN-R40; OR-R1, OR-R2, OR-R6, OR-R10; ID-R4.
Outputs:    (1) on a scheduler that settles inside addTask, the driver's log IS the log of the same flow on a
                scheduler settling each task later, in dispatch order — for a sequence, a fan-out, a map, a loop
                (every way out), a loop in a loop, a loop in a map, a map in a loop, and the two shapes above.
            (2) a checkpoint taken at every element of such a run RESUMES — the fan-out that was refused included.
            (3) the stack does not grow with the run: 5000 rounds of a loop complete, and the depth at which a task
                is handed over is the same at round 0 and at round k.
            (4) a pause, a stop or a cancel called from a callback on such a scheduler is taken at the step it was
                called on, as on a later-settling one.
            (5) the copy is still taken where the event is heard: a live detail mutated after `addTask` returns
                changes nothing in the record; an uncloneable result is refused there, as OR-R6 says.
Depends on: W231 (done)
Blocks:     nothing
Tests:      L2. Expected values: the later-settling log, which the existing suites already hold to the spec — so
            each comparison is a differential against a sequence other cases pin by hand — plus ids, inputs and join
            values by hand from ID-R6 and JP-R15 where a differential cannot see (a `dispatched` element carries no
            payload: the adequacy reader's finding 1). The depth probe counts stack frames in the double, at two
            rounds. RED first on `8cf2c47`'s src: the 5000 rounds (RangeError), the fan-out resume (refused), the
            pause taken late. No case depends on completion order: both doubles settle in dispatch order.
Gate:       the three RED first; `npm run gate` before the readers; conformity and adequacy readers on isolated
            copies; rule 8 on what they find; `npm run gate:item` on the final tree (workflow v0.29).
Reserves:   Q813-Q815; ADR 0146
```

## Exceptions — files outside `Owns`

| file | why | asked |
|---|---|---|
| spec/outcome-record.md (v0.21 -> v0.22) | `OR-R10` listed what is taken at the end of a driver call's step and thrown to its caller; a settlement heard inside that step is taken there too and is NOT thrown. One clause pointing at `RN-R46` (the conformity reader's finding 5) | **yes — the declaration's own stop-and-ask; (a), 2026-11-15** |
| test/driver/retention.test.ts | its list of the driver's own fields, which fails naming any field added: `settlementsPending`, `takingSettlements`, each with its sentence | **NOT asked — declared late.** The ratchet's own message calls the edit: *a new driver field fails here naming itself* |
| examples/l6.ts | the same list, L6's copy (`cross-row`); found RED by the first `npm run gate` | **NOT asked — declared late**, for the same reason |
| doc/questions/q811.md | its note said W232 would restructure the functions findings 7 and 8 sit in; the redeclared W232 does not | the record step's (`doc/questions/**`) |

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- The stack growing per round for an ASK-only loop body answered from a callback (`leaveStep -> takePending ->
  takeAnswer -> leaveStep`, three frames a round, about 3,500 rounds): the first attempt's adequacy reader, finding
  10. It is not a scheduler's settlement and this item's queue does not touch it — a question from this item's block.
- Q811's findings 7-10: not this item's.
- The version bump, the release, sending the reply: the maintainer's.

## Verification

`node test/runner.ts <suite>` while writing; `npm test`; `npm run gate`; the two readers; `npm run gate:item`.

Routing cases this item covers: a branch routed away from its join — the loop's break and lost rows; `user_action` —
a non-optional task out of retries settled inside `addTask` (the paired `task.failed` / `task.user_action`); no
matching decision edge — the lost row; a duplicate task id — not applicable; a nested fan-out — a loop in a map, a map
in a loop, a fan-out in a fan-out.

## Record

**Author's record, 2026-11-15, on `8cf2c47`.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| the first attempt (the loop opens its next round from a flat frame) | **RAN, REVERTED** | 5000 rounds RED first, then green; its conformity reader measured the appended order MOVED in two shapes and a resume refused at 16 of 30 cuts in one; its adequacy reader, 35 mutants, 11 survivors. Stopped and asked: **(b) the general fix**. `git checkout` of the driver, the spec clause and the `AGENTS.md` sentence; the tests kept and rewritten |
| RED first, on the tree before the queue | **RAN** — the queue switched off (`if (false)`) turns 8 cases red | the logs differ (a fan-out, a map, nested regions, a loop, both shapes above), every-cut resume is refused, the stack-depth and the 5000-round cases overflow, a pause and a stop are taken after the run |
| the existing suites against queueing EVERY settlement | **RAN — 10 RED**, and that is why `cancelled` is not queued | nine pin a `cancelled` settlement heard mid-step halting the run where it is heard (`RN-R28` 1, `RN-R29` 6, `RN-R33` 1, `RN-R35` 1); the tenth is the field ratchet. With `cancelled` taken in place the nine pass UNCHANGED — ADR 0146 decision 4. No existing case was edited |
| `npm run gate` before the readers | **RAN** — run 1 **RED**, run 2 **EXIT 0** | run 1: L6 `cross-row`, the driver's field list (an Exceptions row); run 2: 111 files, 2402 in node, deno and chromium, L6 2935 / 0 failed in both runtimes |
| conformity reader | **RAN**, on an isolated copy — **0 BLOCKING**, 4 SHOULD, 4 NIT | 53 of 57 further shapes equal between the two schedulers (gates, asks, predicates, attempts, messages, resolutions, a mixed scheduler, two drivers on one scheduler); the 4 that differ are a HALT heard inside a step (2) and *dispatch order* said for *the order heard* (2). 12 shapes resumed at every cut on both schedulers, 0 refused. SHOULD: `RN-R46`'s headline sentence unqualified for a halt heard in a step; `OR-R10` wrong read alone (asked, (a)); `AGENTS.md` section 9 silent on it; one settlement left queued for good when a stop's own element throws — **fixed in code** (`leaveStep`'s `finally`) |
| adequacy reader | **RAN**, on an isolated copy — 53 mutants, **21 survived**: 17 real gaps, 4 equivalent; no defect in twelve probed roads | real: a driver drained once only; a `cancelled` heard during a drain; an owner's cancel, a stop and a halt with settlements waiting; *reported once* pinned for one throw; attempts beside a completion; more than 64 in flight; slow cumulative stack growth; the ownership tiers held only by older suites. Vacuous: the depth probe's arrangement (`> 3` where a capped stack reads 11). The copy restored byte-identical |
| overlap | **2** shared subjects | a halt heard inside a step overtaking what waits (conformity 1-2, adequacy 12); the queue not empty at rest (conformity 6, adequacy's A11) |
| rule 8, author's | **RAN** — round 1: 11 of 12 RED, 1 equivalent (queued at depth 1 too), a no-op control GREEN; round 2, the adequacy reader's real-gap survivors: **18 of 18 RED** after five cases were added, a no-op control GREEN | each alone in `src/driver/driver.ts`, restored byte-identical each time (sha256 before and after equal) |
| `npm run gate:item` on the final tree | **RAN — EXIT 0**, the tree unchanged at its end | the ladder: 111 files, 2407 in node, deno and chromium; L6 2935 / 0 failed in both runtimes; self-tests 10 of 10 ok, `check:register:selftest` left out as `gate:item` does. Only this row and the Status line were written after it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the log equal to a later-settling scheduler's | the queue in `onEventOrThrow`, `takeSettlements` | `test/driver/settle-inside.test.ts` cases 1-2 and 11; `test/driver/loop.test.ts`'s *W232 RN-R46* case. **Narrowed from the declaration**: where no halt is heard inside a step, and *in the order heard*, not in dispatch order — both readers |
| (2) every cut resumes | follows from (1) | case 4 (a fan-out, a map in a loop, a loop in a map) and case 2's held shape |
| (3) a flat stack | one loop in `takeSettlements`, the guard in `leaveStep` | case 5 — the depth at round 1 and round 2400, a map's instances, a sequence; the loop suite's 5000 rounds |
| (4) a pause, a stop, a cancel taken at their step | the order in `leaveStep` | cases 6 and 13 |
| (5) the copy where the event is heard | the queue sits AFTER `normalizeEvent` and the tiers | cases 7 and 12 |

**What the declaration got wrong.** Twice. The first declaration predicted the log would not move and it did. The
second said *in dispatch order* where the code and the rule's own body say *the order heard*, and stated the equality
without the halt exception its own Scope implied. `Owns` missed the two field lists.

**What broke.** Nothing in a run on `fyflow-scheduler`: no settlement there is heard inside a step. For a double that
settles inside `addTask`, the log's order where more than one task is in flight, and where a throw surfaces — both
stated in `AGENTS.md`'s BREAKING list, item 6.

**What this taught.** *The review named a symptom in the newest code, and the defect was older than the loop.* The loop made
the stack grow with the run; the cause — a settlement routed on the stack of the step that dispatched it — was
already appending an unreplayable order for a fan-out on such a scheduler (7 of 14 cuts refused on the tree before
this item), with no test on it because
every double in `test/**` settles at rest. Fixing the symptom where it showed moved more than it fixed, and it was the
conformity reader's old-against-new comparison, not a test, that showed it. **No change proposed**: the procedure
caught it at the rung built for it.

**Questions raised.** Closed: none. Raised: **Q813** (the same stack growth for an ask answered from a callback, open).
Q814-Q815 unused. **ADR 0146.**
