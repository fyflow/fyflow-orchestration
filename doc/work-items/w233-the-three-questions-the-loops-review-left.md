# W233 — the three questions the loop's review left: a step's end takes its pending calls in ONE loop, a loop's join settles through the join's own arms, and a backstop row's clock starts when its run parks

**Status:** done 2026-11-15 — `npm run gate:item` EXIT 0 on the final tree (the Record); both readers RAN and every finding acted on; one spec clause and three test files asked and answered (a); Q811 (9) declined by the maintainer. Earlier: declared 2026-11-15 on `8cf2c47` plus W232's uncommitted tree (branch `p47-loop`), before any file under `Owns` was edited
**Plan:** none — an item outside any plan, on W231's and W232's precedent. Its source is the maintainer's instruction
of 2026-11-15: *address the newly open questions (Q811, Q812, Q813)*.

*This file carries NO relative link: ids and paths are bare text.*

**Question:** *can each of Q811, Q812 and Q813 be closed by a change that moves no element of any log?*

## What each question asks, and what was read before declaring

| | question | read on the tree, before any edit |
|---|---|---|
| Q813 | a loop whose body is an ask answered from a callback grows the stack three frames a round | `leaveStep`'s `while` over `pausePending` calls `takePending`, whose take ends in its own `leaveStep`, which runs the same `while` — one nesting per pending call. `pause()` and `unpause()` at rest hold the same `while` *(this read *and `resolve()`* until the conformity reader: `resolve()` always went through `leaveStep`)* |
| Q811 (7) | `loseLoop` and `fireLoop` repeat `settleJoin`'s two arms | the unsatisfiable tail (`joinSettled` false, `onUnsatisfiableJoin`, `JP-R10`'s `branch.lost`, the enclosing `settleJoin`) and the satisfied tail (the latch, `joinSettled` true, the reading's `offer`, the successor's `enter`) are each written twice |
| Q811 (8) | a round's terminal event type reaches `settleLoop` through `LoopRun.ended` | every one of `settleJoin`'s five call sites *(declared as six: the unsatisfiable tail was counted twice, being written twice)* follows the `emit` of a terminal event for the same region instance, so the type is known at each |
| Q811 (9) | a loop with no break `end` pays one copy a round for a state nothing reads | **`JP-R15` states both halves**: a round's entry receives *its own copy*, and *the state a round started with and its arrival are held … until the join becomes terminal*. Dropping either is a spec change |
| Q811 (10) | `conditionProblem` picks its scope and message by a display string; `loopValueOf` takes a join it never reads | as the question says |
| Q812 | L6's threaded `uncloneable` row read its run `running` once under deno | the row declares `expectBackstop` and `backstopMs: 400`, and `examples/run-flow.ts` starts that clock when the run STARTS. The row needs a worker thread started, the clone refused and the retries spent inside 400 ms. `examples/l6.ts`'s own comment: *if it were ever too short the row fails loudly, with the outcome reading `running`* — which is the failure recorded |

```
Spec:       none predicted to change. Q813 and Q811 (7), (8), (10) move no element and no message; Q812 is the
            harness. Q811 (9) is NOT done: it needs two clauses of spec/join-policy.md JP-R15 changed, and is
            put to the maintainer at the record step with a measurement instead.
Owns:       src/driver/driver.ts (leaveStep and the at-rest takes of pause(), unpause() and resolve(); settleJoin,
            settleLoop, fireLoop, loseLoop, emit's loop clause, LoopRun.ended, settleJoin's call sites);
            src/definition/validate.ts (conditionProblem and its two callers);
            src/definition/wiring.ts (loopValueOf and its two callers);
            examples/run-flow.ts (the backstop's clock); examples/l6.ts (the two backstop rows' comments, and the
            driver's field list where a field is added or removed);
            test/driver/settle-inside.test.ts and test/driver/loop.test.ts (the new cases);
            test/driver/retention.test.ts (the driver's field list, as W232 found it must follow);
            test/definition/l4-corpus.test.ts (the suites' case counts);
            doc/questions/q811.md, q812.md, q813.md; this file.
            Exceptions: the record step's files and nothing else predicted. Anything else is a STOP-AND-ASK.
Inputs:     Q811, Q812, Q813; W232's takeSettlements (the flat loop this item's follows); RN-R33, RN-R35, RN-R37,
            RN-R40, RN-R46 and OR-R10 v0.19 for the order and the throw a step's end owes; JP-R10, JP-R14, JP-R15.
Outputs:    (1) Q813: a step's end takes every pending call in ONE loop: a loop of 20,000 ask-only rounds, each
                answered on its `asked` element, completes, and the stack is as deep at round 2,400 as at round 1.
                The log is element for element what the nested takes appended, and a throw from a take reaches
                whom it reached.
            (2) Q811 (7): one function for a join that did not fire and one for a join that fired, called by
                settleJoin and by the loop's two.
            (3) Q811 (8): the round's terminal event type is an ARGUMENT of settleJoin; LoopRun.ended is gone.
            (4) Q811 (10): conditionProblem takes the site, not its display string; loopValueOf takes no join.
            (5) Q812: a row whose result IS the backstop starts its clock at the quiescent point where the run
                first reads `awaiting_action`, under the harness's default cap; with the row's backstop set to
                1 ms it is still green, where the old clock reads `running`.
Depends on: W232 (done, uncommitted)
Blocks:     nothing
Tests:      L2, test/driver/settle-inside.test.ts — Q813: T1 the 20,000 rounds and the depth probe; T2 the log of
            an ask-only loop answered on the element EQUALS the log of the same flow answered at rest (RN-R37: a
            resolution lands between two steps either way), and resumes at every cut; T3 a pause, an answer and a
            stop called on one step are taken in RN-R35's order — attempts, the calls in call order, the stop —
            and settlements after them (RN-R46); T4 a take that throws halts the run once, the calls behind it
            are dropped, a stop pending beside it is still taken, and the throw reaches the caller (OR-R10
            v0.19). T1 is RED before the fix; T2-T4 are CONTROLS, green before and after, and say so.
            Q811 (7), (8), (10): no new behaviour, so no new case — the existing loop, join and FD-V42 cases are
            the test, and rule 8 breaks each helper to show they bind.
            Q812: the 1 ms probe above, run off-gate in both runtimes and recorded; not a committed row.
            Expected values from the rules named — never from a run. No case depends on fan-out completion order.
Gate:       T1 RED on the declared tree; `npm run gate` before the readers; conformity and adequacy readers on
            isolated copies; rule 8 on what they find; `npm run gate:item` on the final tree (this item is no
            plan's last and edits no check-register*, state.mjs or doc/questions/README.md).
Reserves:   Q816-Q818 (W232's block ran to Q815); no ADR predicted (no decision is taken: each change keeps a rule already written)
```

## Exceptions — files outside `Owns`

*Asked of the maintainer 2026-11-15 after both readers reported and before any of these edits; each answered (a).*

| file | why | asked |
|---|---|---|
| spec/run-state.md (v0.39 -> v0.40), spec/README.md | the conformity reader's SHOULD 1: the flat stack for the CALLS a step's end takes was in no rule — `RN-R46` said it of settlements alone. One clause in `RN-R46`, changed as its own edit | **yes — (a) add the sentence** |
| test/definition/gate-builtins.test.ts, test/definition/loop.test.ts | the adequacy reader's C01, C04, C05: a gate handed the loop's scope or advice, and a loop handed the gate's name, passed every case | **yes — (a) all three files** |
| test/driver/input-of.test.ts | the adequacy reader's B41: a policy's join read from a store cut just before its `joinSettled` — held for a loop's join, not for this one; both now hand on through `leaveJoin` | **yes — (a)** |
| AGENTS.md | one paragraph in section 12, after the spec clause: a consumer's calls from a callback are taken in one loop | **not asked** — follows the spec clause, as W231's and W232's notes did |

**Q811 (9), put to the maintainer with the measurement: (a) leave it, close as declined.**

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- Q811 (9): the maintainer's, at the record step, with what one copy a round costs measured.
- Committing W232, the version bump to 0.15.0, the release, sending the reply: the maintainer's.

## Verification

`npm test` for the owned suites while writing; `npm run gate`; the two readers; `npm run gate:item`.

Routing cases this item covers: a branch routed away from its join — the loop's break and loss, through the shared
arms; `user_action` — not applicable; no matching decision edge — the lost round, through `settleJoin`'s new argument;
a duplicate task id — not applicable (no id is minted differently); a nested fan-out — a loop inside a fan-out branch
and a fan-out inside a loop body, both existing cases, are what binds the shared arms.

## Record

**Author's record, 2026-11-15, on `8cf2c47` plus W232's uncommitted tree.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| T1 RED on the declared tree | **RAN** — RED for the stated reason | `Maximum call stack size exceeded` reported once, the run halted. T2 and T3 green before the change, as declared; T4 red on the AUTHOR's expectation, which had left out `q`'s own `branch.suspended` — corrected from `RN-R37`, then green before and after |
| `npm run gate` before the readers | **RAN — EXIT 0** | 111 files, 2411 in node, deno and chromium; L6 2935 / 0 failed in both runtimes |
| Q812's probe, off-gate | **RAN** — as predicted, twice | both backstop rows at 1 ms: 2935 / 0 failed in node and in deno with the clock from the park; **19 failed** in node with the clock from the start. `examples/l6.ts` restored byte-identical. Repeated by the conformity reader with the same three results |
| conformity reader | **RAN**, on an isolated copy — **0 BLOCKING**, 2 SHOULD, 5 NIT | a differential against the driver before this item: **103,000 scenarios, 103,000 agree** — 17 flows, four kinds of scheduler, calls and throws from callbacks on every element kind, resumes at three cuts each — and 14 hand-built throw scenarios; six mutants of `takeCalls` each SEEN by it. 224 condition documents: 224 identical finding lists. SHOULD: the flat stack for calls was in no rule (**asked; (a)** — `RN-R46` v0.40); `LoopRun`'s TSDoc described the removed field. NITs: the declaration's *`resolve()` holds the same `while`* and *six call sites* (two and five); the pause/unpause chain overflowed too and was unnamed; the backstop comment's unstated ordering; `onParked` left armed; a brace and a stale count |
| adequacy reader | **RAN**, on isolated copies — 89 mutants, **21 survived**: 7 REAL gaps, 2 white-box only, 12 equivalent; no defect | real: a dead join's tail telling its enclosing region `arrived` or `exited` (B13, B14) and an empty map's (B29, B30) — **the declaration's *the existing nested cases bind the shared arms* was FALSE for this arm**: told `arrived`, a loop ran three rounds and fired; a policy's join handed the element before its `joinSettled` (B41, predates the item); `pause()` at rest taking no settlement (A14); three `CONDITION_SITES` swaps (C01, C04, C05). White-box: the calls behind a throw kept, not shifted (A09). T1 and T3 each the SOLE killer of mutants; T2 and T4 never alone |
| overlap | **1** shared subject | the five call sites: conformity's NIT 3 (the count) and adequacy's own count, and both read every site against its `emit` |
| rule 8, author's | **RAN** — round 1: **10 of 10 RED**, a no-op control GREEN; round 2 (after the three files were answered): **8 of 8 RED**, control GREEN | round 1, each alone in `src/driver/driver.ts`: the recursion restored; settlements from inside `takeCalls`; A14; A09; the throw swallowed; the stop skipped after a throw; B13; B14; B29; B30. Round 2: B41 and its loop twin; C01, C04, C05 and the three opposite swaps. Both files restored byte-identical each time |
| `npm run gate:item` on the final tree | **RAN — EXIT 0**, the tree unchanged at its end | 111 files, 2412 in node, deno and chromium; L6 2935 / 0 failed in both runtimes; self-tests 10 of 10 ok, `check:register:selftest` left out as `gate:item` does. Only this Record and the Status line were written after it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) Q813: a step's end takes its calls in one loop | `atRest` and `takeCalls`; `leaveStep`, `pause()` and `unpause()` call the first | the suite's four W233 cases: 20,000 ask rounds and 20,000 pause/unpause flips at a flat depth, the log equal to one answered at rest with every cut resumed, one step's takes in order, a take that throws |
| (2) Q811 (7): the join's two arms once | `joinFires`, `leaveJoin`, `joinDies` | `test/driver/loop.test.ts`'s W233 case (a dead join and an empty map in a round's body); `test/driver/input-of.test.ts`'s cut before `joinSettled`; the loop and join suites as before |
| (3) Q811 (8): the round's end an argument | `settleJoin`'s `ended`, at five call sites; `LoopRun.ended` gone | the same loop case, and the existing done / break / lost cases |
| (4) Q811 (10): the site, not its display string | `CONDITION_SITES`; `loopValueOf(last, base)` | the gate's and the loop's message assertions, each now holding its own site's words |
| (5) Q812: the backstop's clock from the park | `backstopFromParked` in `examples/run-flow.ts`, set by `examples/l6.ts` for a row with `expectBackstop` | **nothing committed** — at 400 ms both clocks pass. The probe is the evidence, and it is off-gate by declaration |

**What the declaration got wrong.** *Six* call sites (five). *`resolve()` at rest holds the same `while`* (it never did).
*Spec: none predicted* (one clause). *No new case for Q811* — the reader's B13 to B30 show the shared dead-join arm was
bound by no test where a loop encloses it, so the refactor would have shipped unheld. The `Reserves:` line first read
Q814-Q816, inside W232's block.

**What broke.** Nothing in behaviour. The intended difference is wider than declared: a chain of pauses and unpauses
overflowed as the ask loop did, into `pause()`'s caller with nothing reported.

**What this taught.** *A refactor declared as needing no test is a claim about the tests that exist, and nobody had
run it.* The adequacy reader did, and it was false for one of three arms. **No change proposed**: the reader pass is
the mechanism, and it worked.

**Questions raised.** Closed: **Q811** (7, 8, 10 done; 9 declined on a measurement), **Q812**, **Q813**. Raised: none;
Q816-Q818 unused. Not acted on, noted by the conformity reader as out of scope and unchanged by this item: the
unsatisfiable arm has no hold check after its `joinSettled`, so an enclosing POLICY join still settles after a halt
raised on that element where an enclosing loop does not — not measured, no question raised without a measurement.
