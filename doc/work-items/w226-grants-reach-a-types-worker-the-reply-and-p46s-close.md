# W226 — grants reach a type's worker on real workers; `AGENTS.md`; the reply; P46's Record and retro

**Status:** done 2026-11-06 — `npm run gate:full` EXIT 0 on the final tree; declared 2026-11-05 on `5113a18`; both readers RUN and acted on (2026-11-06); `npm run gate` on
the tree after their fixes in the Gate table; `gate:full` EXIT 0 (the orchestrator's, below)
**Plan:** [P46](../plans/p46-what-the-scheduler-0-7-0-admission-rework-lets-a-document-declare.md) — its LAST item.

```
Spec:       none moves.
Owns:       examples/l6.ts, examples/README.md, AGENTS.md section 13's worker paragraphs (constructor and run
            arguments, createTask), ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass7.reply.md,
            P46's Record and retro
Inputs:     P46 decision 6, fact 8; W225's built-in UnitGroup; the scheduler's AGENTS.md at 0.7.0 §4-5
Outputs:    (1) one L6 block "W226 exit", node 24 and deno: a document-declared UnitGroup(['u0','u1']); a TYPE whose
                worker returns workerContext.grants and context.grants; (a) resident { gpu: 1 } on a threaded pool and
                on an inline pool — two workers see distinct units; (b) a named instance pinned by
                { cost: 1, from: ['u1'] } sees ['u1'] resident; (c) task-held: createTask sets
                units: { gpu: { from: ['u1'] } } and context.grants.gpu is ['u1']; each beside its control (no request
                -> the lowest free unit, u0; a ConcurrentLimitGroup -> grants {}).
            (2) AGENTS.md: where a type's worker reads both grants, and that `units` set by createTask reaches the
                scheduler as limitKey does, with a snippet check:docs runs.
            (3) the reply to fyflow-app's pass 7, every item answered.
            (4) P46's Record and retro.
Depends on: W225
Blocks:     nothing
Tests:      the L6 block's claims, each able to fail (a control per claim).
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:full` ONCE on the final
            tree (the plan's last item).
Reserves:   Q803-Q804, no ADR
```

## Scope

**In** — Outputs (1)-(4). **Out** — the version bump and the publish (the maintainer's word).

## Exceptions — recorded BEFORE the edit

| file | the edit, and nothing else | granted |
|---|---|---|
| `scripts/check-docs.mjs` | `RUN_FLOOR` 56 -> 57 for section 13's new `run` snippet, and its one-line credit | by the orchestrator under P46's (f1), 2026-11-05, in this item's brief |
| `spec/flow-definition.md:2155-2158` | conformity F2: the `idleTimeout: 0` refusal's *measured on 0.5.2 … P18 fact 6* re-dated to *measured at P18 fact 6 and re-measured at P46 fact 6 (still deadlocks)*, no version number (`D7`) — a dated record sentence, nothing else | by the orchestrator under P46's (f1), 2026-11-06, after the readers |
| `doc/work-items/w225-*.md` (its Record's adequacy row) | conformity F5: a CORRECTION of a finished item's file — *76 mutations, 72 caught, 1 SHOULD survivor, 2 equivalent* sums to 75; it becomes *76 run, 72 caught, 4 survived — three detailed (1 SHOULD, 2 equivalent), the fourth not itemised in the report* | by the orchestrator under P46's (f1), 2026-11-06, after the readers |

## Record

**Author's record, 2026-11-05, on `5113a18` plus W224's and W225's uncommitted trees — in review.** Nothing committed.
Node 24.20.0, deno 2.9.6.

### Gate

| Rung | Result |
|---|---|
| `npm run test:l6` / `test:l6:deno` alone, during the build | node run 1 RED (every W226 clause THREW: `DerivationRefused`, *residentGroups beside idleTimeout: 0* — my types declared both; removed). Deno run 1 CRASHED (`TypeError: expected i32` from `BroadcastChannel.postMessage` in a timer firing after `close()` — the barrier rewritten to end on a flag, not `clearInterval`). Then node and deno EXIT 0, **2919 / 280, 0 failed** each |
| `npm run gate` run 1 | **EXIT 1** at `check:scheduler` `D7`: the block's comment named the pin's number (`examples/l6.ts:14478`); reworded to *the pin W224 moved to* (`C:/tmp-p46/w226-gate.log`) |
| `npm run gate` run 2 | **`GATE EXIT=0`** (`C:/tmp-p46/w226-gate2.log`): lint, typecheck (five lanes), the twelve checks, L1-L5 **106 files / 2334 assertions** in node, deno and chromium (parity 2334) — unmoved; L6 **2919 assertions / 280 real runs on the pin, 0 failed**, in node 24 and in deno. firefox and webkit NOT RUN (`test:browser:all` is not on the gate) |
| `check:docs` alone | EXIT 0 — **57** `run` snippets, `RUN_FLOOR` 57; `X10` compared 2 copies against 2919 / 280 |
| `check:docs:selftest` alone | EXIT 0, 24/24 noticed (`C:/tmp-p46/w226-docs-selftest.log`) — the snippet ends no function in a `throw`, W225's run-1 shape |
| Workflow rule 8 | **9 of 9 RED**, each restored byte-identical by digest (`C:/tmp-p46/w226-rule8.log`, harness in the session scratchpad) — below |
| Conformity reader | **RAN** — 2 SHOULD, 5 NIT (F1-F7), none BLOCKING |
| Adequacy reader | **RAN** — about 22 mutations; 2 SHOULD and 2 NIT survivors (A1-A4) |
| Overlap | **1** — the clash (F1 / A1) |
| Workflow rule 8 on the readers' fixes | **5 of 5 RED**, each restored byte-identical (`C:/tmp-p46/w226-rule8b.log`) — below |
| `npm run test:l6` alone after the fixes | node EXIT 0, **2923 / 284, 0 failed** (`C:/tmp-p46/w226-l6-node3.log`) |
| `npm run gate` run 3, after the readers' fixes | **`GATE EXIT=0`**, first time (`C:/tmp-p46/w226-gate3.log`): L1-L5 106 / 2334 in node, deno and chromium (parity 2334); L6 **2923 / 284, 0 failed** in node 24 and in deno; `check:docs` 57 snippets. No L6 row of Q599's class red |
| `npm run gate:full` | **`GATE:FULL EXIT=0`** 2026-11-06, by the orchestrator, on the final tree after the retro — L6 2923 assertions / 0 failed in node and deno, selftests 11/11 ok across 10 lanes, 4391.5 s wall for the self-tests (log `C:/tmp-p46/p46-gatefull.log`) |

### Rule 8 — each claim broken, the block run (node L6), the bytes restored

| probe | what broke | red |
|---|---|---|
| P1 | the worker returns a CONSTANT resident grant `{"gpu":["u0"]}` | 12: every claim but PINNED`s CONTROL, both pools (that control's expected value IS the constant) |
| P2 | the pinned instance loses `from` | PINNED, both pools; its control green |
| P3 | `createTask` drops `units` | TASK-HELD, both pools; its control green |
| P4 | the resident CONTROL holds `gpu`, not `slots` | RESIDENT`s CONTROL, both pools |
| P5 | the ARRANGEMENT broken: `maxThreads: 1`, one worker a pool | RESIDENT and the TASK sees its WORKER`s, both pools |
| P6 | the ENVELOPE drops the worker context (`new Inner(config)`) | all 14 |
| P7 | the ENVELOPE drops the task context (`run(payload)`) | 12 (every claim reading `context.grants`; RESIDENT reads the worker's alone and stays green, rightly) — plus 101 other L6 rows that read the signal or emit |
| P8 | the inline pool is not inline | the inline RESIDENT, its control, PINNED and TASK-HELD — the realm read |
| P9 | the barrier never meets | RESIDENT and its control, both pools (the premise `met`) |

*P1-P9 ran on the fourteen-claim block, before the readers.* **After them** (`C:/tmp-p46/w226-rule8b.log`):

| probe | what broke | red |
|---|---|---|
| Q1 (adequacy M5) | the ENVELOPE merges the worker's grants OVER the task's (`{ ...context.grants, ...workerContext.grants }`, frozen) | the TASK's OWN WINS a CLASH, both pools — alone |
| Q2 (adequacy M8) | the ENVELOPE hands an UNFROZEN copy of `context.grants` | the TASK sees its WORKER`s and TASK-HELD, both pools — the two claims asserting `frozen` |
| Q3 | the clash's type loses its task-held hold | the clash, both pools |
| Q4 | the clash's CONTROL gains the task-held hold | the clash's control, both pools |
| Q5 (adequacy A4) | the W226 snippet's four `if … throw` lines deleted from `AGENTS.md` | `check:docs` **X4** (1) — the helper's `throw` is now a returned sentinel, so the four lines are the snippet's only throws |

### The readers' findings, and what was done

| Finding | Done |
|---|---|
| F1 (SHOULD) / A1 (SHOULD) — the clash, *"its own winning on a clash"*, unstated and unheld (M5 survived) — **overlap** | `AGENTS.md` section 13 quotes it and *"frozen one level down - a copy, on inline pools too"*; the block gains runs D / D' and two claims a pool, held by Q1, Q3, Q4. *Derived first*: the scheduler's reference admits a pool holding a group resident AND per task, cost 1 each on two units. **Arranged by `from`, not as the brief described**: unpinned (`{ gpu: 1 }` and no request) a scratch probe measured the TASK granted `u0` at dispatch and the worker created after it `u1` — an admission order the reference does not state — so the resident hold asks `from: ['u0']` and the task `from: ['u1']`; the claim (worker `u0`, task `u1`, `context.grants.gpu` `['u1']`) is then the reference's alone. The control: the same resident request and the same factory with no task-held hold — `['u0']` (a `units` entry for a group the task does not hold is not read, measured) |
| A3 (NIT) — `frozen` unheld (M8 survived) | the worker records `Object.isFrozen(context.grants)`; asserted in *the TASK sees its WORKER`s* and *TASK-HELD*; Q2 |
| A2 (SHOULD) — PINNED and TASK-HELD cannot tell `from` from `prefer` (`u1` is free in every runtime, so `prefer` grants it too) | **a STATED SURVIVOR**, by the orchestrator's decision (no arranged busy-`u1` run). The two claims, the block comment, the header row, `AGENTS.md`'s paragraph and the reply's sections 2/4 now say *a request `from: ['u1']` reaches the scheduler and is granted `u1`*; the difference between `from` and `prefer` is the scheduler's own. A registry-side rename `from` → `prefer` is still caught by W225's section-13 snippet (`AGENTS.md`, the *Units with names* snippet: the pool's spec read back as declared) |
| A4 (NIT) — `X4` could not see the snippet's four assertions deleted: the `seen` helper's `throw` met its static clause | FIXED in the snippet: the helper RETURNS a sentinel no assertion accepts; Q5 red. *X4's static clause counting any `throw` is a general limit, carried to the retro by the orchestrator* |
| F2 (SHOULD) — `spec/flow-definition.md:2155-2158` dated the `idleTimeout: 0` refusal *measured on 0.5.2* | re-dated to *measured at P18 fact 6 and re-measured at P46 fact 6 (still deadlocks)*, no number (`D7`); an exception, above; no version bump (`check:spec` EXIT 0) |
| F3 (NIT) — PINNED said *with u0 free* and asserted nothing of it | dropped |
| F4 (NIT) — P46 exit row (3) said *seven claims each beside a control* | *each beside its control*, the declaration's words |
| F5 (NIT) — W225's and P46's *76 mutations … 2 equivalent* sums to 75 | *76 run, 72 caught, 4 survived — three detailed, the fourth not itemised in the report*, both places; an exception, above |
| F6, F7 (NIT) — the reply | `prefer` through `units` holds by the scheduler's reference and is not measured here; *no source change* → *no behavioural change*; section 6 lists `spec/runtime-targets.md` v0.15 |

### Outputs

| Output | Where | What would fail without it |
|---|---|---|
| (1) the `W226 exit` block *(as first built; since the readers, eight runs a pool and nine claims — D and D' the clash, `frozen` asserted; `CROSS_ROW` 590, 2923 / 284)*: a document-declared `UnitGroup(['u0','u1'])` and `ConcurrentLimitGroup(2)`, one type's `data:` worker reporting `workerContext.grants` at constructor, `setup()` and `run()` and `context.grants`; per pool, threaded and inline, six runs on six runtimes — (a) a resident `{ gpu: 1 }` fan-out of two held by a `BroadcastChannel` barrier, and its `slots` control; (b) a named instance pinned `{ cost: 1, from: ['u1'] }`, and its `{ gpu: 1 }` control; (c) `groups: ['gpu']` with `createTask` setting `units: { gpu: { from: ['u1'] } }`, and its control without `units`. Fourteen claims, twelve runs, every expected value from the scheduler's `AGENTS.md` §4-5, quoted in the block's comment. `CROSS_ROW` 572 -> 586, `DECLARED_TOTAL` 2905 -> 2919, `DECLARED_RUNS` 268 -> 280, fourteen `CROSS_ROW_SUBJECTS`, `pairRunCount`, the header list and table row | `examples/l6.ts` | P1-P9 |
| the stale *three built-in group classes* (`:6964`) | the comment says five, and `CONSTRUCTS_A_SCHEDULER_OBJECT` gains `UnitGroup` and `KeyedConcurrentLimitGroup` — `S16`'s list plus `Driver`, as the comment claims; no file constructs either, so no verdict moved | `examples/l6.ts` | — (not provoked) |
| L6's declared counts | both anchored copies, 2923 / 284 (2919 / 280 before the readers) | `examples/README.md` | `X10` |
| (2) where a type's worker reads both grants, and `units` through `createTask` as `limitKey`; a `ts run` snippet, inline: the lowest free card, a named instance's request, `units` through `createTask`, no request | `AGENTS.md` section 13, *Which UNITS your worker holds* | `check:docs` `X3` (it typechecks) and `X4` (it runs, and a wrong value THROWS). *Until the readers, deleting its four assertions was X4-GREEN — the helper's own `throw` met X4's static clause (A4); since the fix, Q5 red. X4 counting ANY `throw` in a snippet as its assertion is X4's general limit, carried to the retro* |
| (3) the reply, #1-#5 | `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass7.reply.md` | the readers |
| (4) P46's Record — items, exit artifact, counts, predictions, hand-offs; the Retro left to the orchestrator | `doc/plans/p46-*.md` | the readers |

### What broke

1. `idleTimeout: 0` beside a resident group in my own document — the refusal this plan re-measured. Caught at the first run.
2. Deno's `BroadcastChannel.postMessage` throws after `close()`, and a cleared interval still fired there; Node did not.
3. `D7` on a comment naming the pin's number — W224's Record item 2 again.
4. A first `sorted` helper JSON-encoded strings already JSON; caught before any run.
5. After the readers: a stray backtick in a template literal of my own edit script; and my first reading of the clash —
   `{ gpu: 1 }` and no request, expecting worker `u0` and task `u1` — measured the other way round, which is why D is
   arranged by `from`.

Q803-Q804 unused. Nothing raised, nothing closed.
