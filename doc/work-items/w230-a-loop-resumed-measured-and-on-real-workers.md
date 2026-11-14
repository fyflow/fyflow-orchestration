# W230 — a loop resumed, its footprint measured, on real workers; AGENTS.md, the reply and P47's close

**Status:** todo — declared 2026-11-14 on `df60b9e`
**Plan:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md) — its last item.

```
Spec:       spec/run-state.md: section 7 states a loop's footprint under RN-R13 (decision 3) with the measured
            figure; section 9 states that a loop resumes from its settlements (or the measurement that refutes it,
            as a stop-and-ask before any format change). Changed FIRST, as its own edit.
Owns:       spec/run-state.md, examples/** (l6.ts, its flows and workers, README counts), AGENTS.md (a loop
            section and every table that lists node kinds or refusals), test/driver/checkpoint*.test.ts and
            test/fold/*-cost.test.ts for the loop cases, the reply file in
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/ (written, not sent), P47's Record and Retro
Inputs:     W228 and W229's outputs; P47 decision 3, exit artifact (3)-(5)
Outputs:    (1) a loop checkpointed mid-round resumes to the same fold — every round's `branch.opened`
                regenerated from the settlements, no new FoldInput kind, CHECKPOINT_FORMAT unchanged.
            (2) the retained footprint of a loop MEASURED beside a map of the same task count, and the carried-
                history case of decision 1 measured beside a reader after the loop naming the rounds.
            (3) one block in examples/l6.ts, green in node 24 and deno: a training-shaped loop (a map in the body,
                `until`, a reader after the loop naming a body node's every round) and a polling loop that breaks,
                each beside its control.
            (4) AGENTS.md documents the loop, every snippet run or checked by check:docs.
            (5) fyflow-orchestration.pass8.reply.md for #2 (#1 marked not evaluated); Q582 resolved.
Depends on: W229
Blocks:     nothing
Tests:      L2 resume suites: a checkpoint taken after round 0, mid-round 1, and at a park inside round 1, each
            resumed and folded equal to the uninterrupted run; L6 assertions on real workers; the footprint
            figures as measured numbers with their command. Expected values from the spec text and P47's
            decisions, not from output.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:full` once on the
            final tree — the plan's LAST item (workflow v0.29).
Reserves:   Q817-Q818
```

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- Compaction: [Q809](../questions/q809.md).
- Sending the reply: the maintainer's call, as for every pass.

## Verification

Routing cases this item covers: a branch routed away from its join — the polling loop's break at L6; `user_action` —
the resume taken at a park; no matching decision edge — not applicable at L6 (W229's L2); a duplicate task id — every
id an L6 loop mints is distinct, asserted; a nested fan-out — the map inside the training loop's body at L6.

## Record

*Filled in when the item is done.*
