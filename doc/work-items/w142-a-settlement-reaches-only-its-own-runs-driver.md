# W142 — A settlement reaches only its own run's driver: the runtime routes each settlement by run id, and N runs on one scheduler are linear (Q244, ADR 0088)

**Status:** in progress — declared 2026-10-07 on `7ba87df`, the second item of P31
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, deliberately* — W127's note and Q142's mechanism (`M4`). A
linking document here is one more in `check-markdown`'s second `removes` probe tree and can cross
`M4`'s floor, so `check:markdown:selftest` would exit 1 while `check:markdown` stays green. Ids and
paths are bare text.

```
Spec:       none changed. P31 decision 2 (Q244's direction, the maintainer, 2026-10-07) fixes the
            change: settlements are ROUTED to their own run's driver, not broadcast to all N.
            ID-R3 to ID-R5 (spec/task-id.md), OR-R10 (spec/outcome-record.md) and RN-R25
            (spec/run-state.md) bind it and none of their texts may move — a text that would have
            to is a stop (P31 stop-and-ask (a) and this item's brief). ADR 0022, 0023, 0027 and
            0058 are the decisions it must leave meaning what they mean
Owns:       src/scheduler/runtime.ts — the runtime's event delivery (P31's W142 row:
            src/scheduler/*.ts), and a new src/scheduler/*.ts module only if the router does not
            fit there; NOTHING re-exported from src/scheduler/index.ts (that would be surface);
            src/driver/driver.ts ONLY where routing needs it — expected: no code, at most a comment
            the routing makes false;
            the tests: test/scheduler/runtime.test.ts (a W142 suite), examples/l6.ts (the two pair
            rows gain a delivery clause; DECLARED_TOTAL by arithmetic), examples/run-flow.ts (the
            per-driver delivery observer those clauses read);
            examples/run-flow.ts's per-run scheduler listeners and `poolOfTask` on a SHARED runtime —
            the maintainer's answer (B) to the prediction-3 stop, 2026-10-07;
            examples/retention.ts (a `topology` mode: N runs through runtime.start with no per-run
            harness listener on the scheduler — the scale measurement);
            doc/decisions/0088-*.md; AGENTS.md section 12 (the topology guidance);
            and this file
Inputs:     the tree at `7ba87df`; Q244; W55's Record (the O(N²), 115 / 277 / 884 / 3304 ms at
            N = 100 / 200 / 400 / 800 shared, linear own); W122's triage row for Q244; ADR 0022,
            0023, 0027, 0058; spec/task-id.md ID-R3 to ID-R5; RN-R25; createRuntime's openRun and
            Driver's constructor subscription and onEventOrThrow
Outputs:    (1) the "before" figure, re-taken on this tree by W55's own command (retention.ts
                scale, both topologies) AND by a library-only measurement (no harness listener
                per run), wall time and heap at N = 100 / 200 / 400 / 800, with the commands
            (2) ADR 0088 — where routing lives, how a settlement's run id is read (ID-R4's tier 0
                parse, the same parseTaskId), what happens to an id that does not parse and to a
                run id no driver of the runtime holds, and every consequence for ADR 0022, 0023,
                0027, 0058 and RN-R25; `resolves: Q244`
            (3) the routing in createRuntime: each driver the runtime builds subscribes to a
                per-run view of the scheduler; the runtime subscribes to the scheduler ONCE per
                settlement event and hands each settlement to the driver holding its run id
            (4) L1-L2 tests through createRuntime's scheduler seam, expected values from ADR 0088
                and the spec: N drivers on one scheduler each receive ONLY their own run's
                settlements; the scheduler carries one listener per settlement event however many
                runs; an id that does not parse still reaches EVERY driver's onUnmintedTask
                (ADR 0027, ID-R5); another run's parseable id reaches no other driver and no
                onUnmintedTask (ADR 0023 rule 3, ADR 0027 rule 4); OUR run id on an undispatched
                task still stops the run with UndispatchedTask (ID-R4 tier 2); a finished run's
                driver still hears its own id (RN-R25)
            (5) L6: both pair rows assert what each driver was DELIVERED — its own run's
                settlements plus every id minted by no driver, and nothing of the other run's
            (6) the "after" figure by the same commands; N runs on one scheduler shown linear
                (P31 prediction 3), or the residual named and stopped on
            (7) AGENTS.md section 12's topology guidance matches ADR 0088; `check:docs` EXIT 0
            (8) Q244 resolved, `resolved-by` starting "P31 W142 —", naming ADR 0088
Depends on: W140 (P31 decision 5: serial on one tree)
Blocks:     W141
Tests:      (4) and (5). Expected values come from ADR 0088 and spec/task-id.md — a delivered set is
            {own run's settlement events} ∪ {ids parseTaskId refuses}, derived from pairTaskIds and
            the UNMINTED list, never from output
Gate:       L0-L6 (L0-L5 in Node, Deno and Chromium; L6 in Node and Deno); a measured N-run
            scaling figure before and after; rule 8 on every output; the conformity and adequacy
            readers (P31 decision 6); `npm run gate:item` EXIT 0 once, on a still tree (decision 4)
Reserves:   Q556-Q558, ADR 0088. No W beyond W142
```

**Exceptions** — declared 2026-10-07, before the first edit (`doc/workflow.md` section 7 rule 2):

| file | the edit | why |
|---|---|---|
| `examples/README.md` | the two current L6 count copies `check-docs`' `X10` compares, each with the one-clause history parenthetical every copy there carries (W142 as bare text, no link) | output (5) moves `DECLARED_TOTAL`, and `X10` is red until both copies follow. No run is added, so `DECLARED_RUNS` should not move; if it does, the same two copies carry it |
| `test/definition/l4-corpus.test.ts` | one suite name appended to `LATE_SUITES` | output (4) is a new suite in `test/scheduler/runtime.test.ts`, and the L1 census holds suite names both ways |
| `spec/README.md` | its version line — **ONLY if** a spec document is bumped | none is planned; a spec text that must move is a stop, not an exception |

## Scope

**In**

1. **Measure first** (output 1), into `dev-dist/w142-4000/`, before any edit to `src/`.
2. **Design, then ADR 0088** (output 2), committed as `adr:` before the implementation. If the design
   needs a public-surface change — what `start()` returns, what a consumer passes, a new export — STOP:
   P31 stop-and-ask (a).
3. **Implement** (output 3) and **test** (outputs 4 and 5).
4. **Measure after** (output 6) with the same commands.
5. **AGENTS.md section 12** (output 7).
6. **Rule 8 on every output**, in `dev-dist/w142-4000/`, with probes that break routing back to
   broadcast, route a settlement to the wrong driver, parse the run id with a cheaper grammar than
   tier 0's, and drop an unparseable id instead of broadcasting it.
7. Grep the tree for `W142`, `Q244` and every withdrawn sentence or figure, excluding `dev-dist/`.

**Out**

- A hand-built `Driver` on `runtime.scheduler` (P18 decision 14's road): it subscribes to the
  scheduler directly and still hears every settlement. ADR 0088 states it; changing it would change
  the `Driver`'s surface.
- Detaching a finished run from the routing: RN-R25 says a finished run's driver still hears its id,
  and this item does not move that rule.
- ~~The harness's own per-run listeners in `examples/run-flow.ts` — measured, reported, not removed.~~
  **Moved IN by the maintainer, 2026-10-07 — answer (B) to this item's prediction-3 stop.** After
  ADR 0088 routed the drivers, `retention.ts scale` (W55's command) was still super-linear (10 985 ms
  and 880 MiB at N = 800 shared), because `runFlow` files about ten listeners of its own per run on the
  scheduler and copies `scheduler.tasks` into each report. The answer: on a SHARED runtime those
  listeners hear only their own run's events and every unminted id (ADR 0088's rule, applied to the
  harness), and `poolOfTask` keeps the same set. A run on its own runtime is unchanged. `runPair`'s
  `record` stays a direct listener, because it must hear every run.
- P31's other items.

## Verification

- **L0-L5**: `npm run gate` covers them in all three runtimes; L6: `npm run test:l6`,
  `npm run test:l6:deno`. Every rung is RUN and never piped: `cmd > log 2>&1; echo "EXIT=$?"`.
- **Scale**: `node --expose-gc examples/retention.ts scale N 4 1 [own]` (W55's command) and
  `node --expose-gc examples/retention.ts topology N [own]` (library-only), N = 100 / 200 / 400 / 800,
  before and after.
- **Rule 8**: probes to the RULE — broadcast restored; a settlement routed to the wrong run; the run
  id read by `split(':')[0]` instead of `parseTaskId`; an unparseable id dropped or sent to one driver;
  the scheduler subscribed once per run; the L6 delivery clause removed and made a tautology; a no-op
  control, a CRASH grader on L6 and a WRONG-REASON grader; anchors checked against the CURRENT text and
  unique, every edit asserted to change its input, restore to the first snapshot byte for byte, a
  digest before and after.
- **Readers**: conformity (ADR 0088 and the spec first, then the code; reports, does not fix) and
  adequacy (the spec first, then the tests; mutates only in an isolated `cp -r` COPY,
  `find <copy> -type l` before any removal, the copy left in place), fresh contexts, differed briefs,
  the tree still.
- **Confirming gate**: `npm run gate:item > dev-dist/w142-4000/item.log 2>&1; echo "EXIT=$?"`, once,
  on the final tree.
- **Routing cases** (template): routing as in decisions, joins and fan-out is not changed — the
  driver's routing is untouched and only WHICH driver hears a settlement moves. `user_action` (Q17) is
  IN: its two events carry one id and are both routed to the one driver. A duplicate task id (Q13) is
  IN as ID-R4's tier 2 under routing. Routed-away (Q4), no-matching-edge (Q10) and nested fan-out (Q6)
  are not applicable.

## Record

*Filled in when the item is done.*
