# W55 — A run at scale, on real workers

**Status:** todo
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

```
Spec:       none - this item asserts what W53 and W54 decided, on real workers
Owns:       examples/**
Inputs:     P15 facts 3 and 5, read from the PLAN's own file and RE-RUN from
            dev-dist/p15/scale.ts rather than transcribed. W53's ADR 0046 and
            W54's Q22 decision. The L6 harness in examples/run-flow.ts, and
            Expectation's knobs (joinSettledBy, unorderedDispatch).
Outputs:    (1) P15's EXIT ARTIFACT - what ONE run holds on a real
                FyflowScheduler, before and after W53, in BOTH L6 runtimes
            (2) the extrapolation to P15 fact 5's table, with its METHOD, its
                SCOPE and BOTH observers named
            (3) what reverting W53 costs, in MiB and in L6 failures
            (4) the harness checked in, so the number can be re-taken
Depends on: W53, W54
Blocks:     nothing
Tests:      expected values from ADR 0046 and from spec/, written BEFORE the
            first run. A footprint is reported; what is ASSERTED is the
            relation - that the cleared structure is empty after the join, and
            that the run's outcome and every task id are unchanged by the
            clear. A number nobody can re-take is not evidence.
Gate:       L0-L6, then spec-conformity pass (two readers)
Reserves:   Q243-Q247, no ADR
```

## Scope

**In**

1. **The exit artifact, and it is a MEASURED NUMBER rather than a flow.** P15 decision 3, on a
   measurement: `npm run test:l6` is **4236 ms for 42 real runs**, ~101 ms each, so the scale this
   plan is about cannot be a rung inside `doc/workflow.md` section 8's 90 s budget by two orders of
   magnitude. **What runs on real workers is one run measured honestly; what is extrapolated is said
   to be extrapolated.**
2. **Both L6 runtimes.** Node and Deno, as every exit artifact since P2. A footprint measured in one
   runtime is a claim about one runtime.
3. **Both observers.** `v8.serialize(...).length` over the driver's own structures in one call, and
   `process.memoryUsage().heapUsed` after a forced `gc()`. P15 fact 5 has them agreeing within 3% at
   the large sizes; **a sensor cannot corroborate itself** (v0.13 obligation (c)'s limit) and this
   item is where that matters most, because the number is the deliverable.
4. **The revert cost, in two units.** What reverting W53 costs in **MiB** (the point of the change)
   and in **L6 failures** (the rung). P15 fact 3 says the second is **0** before this item —
   [Q214](../open-questions.md)'s shape from the removal side, and prediction 4's subject.
   **If this item can move that number above zero, it has written the rung nobody had**; if it cannot,
   it says so, which is what Q214's row asks a second instance to establish.

**Out** — named rather than left implicit, with where each goes instead

- **A rung, or a row in section 8's budget table.** P15 decision 3 refuses both on a measurement, and
  both are on the plan's stop-and-ask list. This item **reports**; it does not add a level.
- **Ten thousand real runs.** Fact 5's top row is an in-process L2 measurement of 10 000 `Driver`s;
  at L6 that would be ~17 minutes of real workers. The extrapolation is stated **as** an extrapolation,
  with the per-run number that real workers produced beside it, and the two are never added.
- **Any decision.** ADR 0046 is W53's and Q22 is W54's. An exit artifact demonstrates decisions other
  items took — which is what [W43](w43-the-two-blocked-flows-on-real-workers.md)'s Record calls *what
  an exit artifact looks like in the register*.
- **Changing what a run retains.** If the real-worker measurement disagrees with W53's, that is a
  finding for the plan's Record and for W53's file under section 6 pass 3 rule 6 — not an edit this
  item makes to `src/`.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck` — `examples/**` is in `lint`'s directory list and in `tsconfig.examples.json`, and `D6` binds that both ways |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, unmoved. **`examples/**` is deliberately not under `test/**`**: the browser bundle globs `test/**/*.test.ts` and anything importing a scheduler there would be bundled for a runtime L6 does not run in (`RT-R10`) |
| L6 | `npm run test:l6` **and** `npm run test:l6:deno`. `D6` binds each rung's runtime, its resolution **and its argument** — [W35](w35-a-map-on-real-workers.md)'s finding, which is why pointing a rung at the wrong file is no longer free |
| conformity reader | spec first, code second. **Its copy is taken with the author's tree HELD STILL** (section 6, v0.15): W51's reader caught `examples/l6.ts` at six digests and one live rule-8 probe, one snapshot RED on correct code |
| adequacy reader | **in an isolated copy**, and its central question here is [W23](w23-a-nested-flow-on-real-workers.md)'s at its fifth iteration — **what does deleting this item's rows cost**. A row whose property is carried by a literal is W51's four survivors; a cross-row clause is **computed from the row definitions and from the folded run**, never declared as a fourth list |

**Routing coverage**: a branch routed away from its join ([Q4](../open-questions.md)) and a nested
fan-out ([Q6](../open-questions.md)) are both covered, because W53's never-fires case is exactly a
region that holds arrivals forever and both shapes produce one. `user_action`
([Q17](../open-questions.md)) is covered by an existing L6 row this item must not break. A duplicate
task id ([Q13](../open-questions.md)) and no matching decision edge ([Q10](../open-questions.md)) are
**not applicable**.

**Before this item is done it greps the tree for `W55`** outside `doc/` — section 1 rule 5's third
direction. At this declaration that returns **0** hits.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0-L6 | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| the exit artifact, both runtimes | | |
| the extrapolation with method, scope and both observers | | |
| the revert cost in MiB and in L6 failures | | |
| the harness checked in | | |

**What broke.**

**What this taught.**

**Questions raised.**
