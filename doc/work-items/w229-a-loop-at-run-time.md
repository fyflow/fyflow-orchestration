# W229 — a loop at run time: a round opened, carried, decided, broken and lost, and what its join hands on

**Status:** done — declared 2026-11-14 on `df60b9e`, started 2026-11-14 on `7499d04`, done 2026-11-14
**Plan:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md) — its second item.

```
Spec:       spec/join-policy.md: section 2 states the loop's rounds in the region vocabulary (one region instance,
            one `branch.opened` per round, one terminal event per round); section 3 or 4 states that a loop's join
            takes no policy and when the driver fires it; section 4's "what a branch receives and what a join
            carries" gains the carried value and the join value. spec/flow-definition.md section 6 gains
            `maxIterationsFrom`'s run-time refusal (FD-R2's pattern). Changed FIRST, as its own edit.
Owns:       spec/join-policy.md, spec/flow-definition.md section 6 only (W228's otherwise, a declared late
            exception), src/driver/**, src/fold/** only if a measurement shows the fold must change (P47 expects
            not), test/driver/**, test/fold/** as needed, test/matrix/** (L5), doc/decisions/0147-*.md if one is
            needed
Inputs:     W228's outputs; P47 decisions 1-6; fact 16
Outputs:    (1) a round opens at its own branch-path segment with `branch.opened` before its first dispatch (JP-R5);
                round 0's entry receives the loop's value, round i > 0 the previous arrival.
            (2) on each arrival the driver reads `until` over it and the bound — maxIterations, lowered by
                maxIterationsFrom read ONCE as round 0 opens — and continues, completes or exhausts IN THE SAME
                synchronous routing step as the arrival (fact 16).
            (3) an `end` in the body is a break: the join fires. `branch.lost` in a round makes the join
                unsatisfiable (decision 2). A park holds the loop; cancel, stop and pause act as on any branch.
            (4) the join value { last, iterations, exhausted, broke?: { at, value } }, `last` per decision 5;
                "$iteration" resolved; a reader after the loop naming a body node in the array form receives every
                round's output in ROUND order, a round that routed around the node contributing nothing (decision 1
                (b′), ADR 0044's reading).
            (5) `maxIterationsFrom` absent, not an integer or < 1 at run time: a refusal naming the loop and the
                key, reported through OR-R10 from a listener, reported and rethrown from start() and resolve().
Depends on: W228
Blocks:     W230
Tests:      L2 from fixture outcome logs, one suite per way out — continue, done, exhausted, break, lost — each
            asserting the task ids minted, the region events in order, the join value field by field, and the
            fold's outcome; a reader after the loop over rounds one of which routed around the node (no entry, round
            order held whatever the settlement order); `maxIterationsFrom`
            lowering, not raising, and each of its refusals; "$iteration" in rounds 0..n. L5: the matrix gains a
            loop × lost / break / park-then-done / park-then-failed / cancel / stop / pause. Expected values from
            P47's decisions and the spec text, never from output. No test depends on completion order inside a
            map in the body.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:item` once on the
            final tree.
Reserves:   Q814-Q816, ADR 0147
```

## Exceptions — files outside `Owns`

*Declared before each edit; asked of the maintainer (2026-11-14, (a), `doc/workflow.md` section 1 rule 6) when the spec
change was written and `check:spec` C8 went red.*

| file | why | predicted? |
|---|---|---|
| `spec/README.md` | the two documents' version cells, v0.26 and v0.58 (`check-spec` C8) | **no — required by `check-spec`; asked, (a)** |
| `spec/flow-definition.md` header | the v0.58 version paragraph a bump needs; the rule itself is section 6's, declared | **no — asked, (a)** |
| `AGENTS.md` | section 9's executed snippet discovers every exported Error class, and `FD-R7`'s `UnresolvedLoopBound` is one: the class is NAMED in its import and beside `UnresolvedMapArity`, and nothing else about the loop is documented — that is W230's | **no — required by `check:docs` X4; asked, (b1)** |
| `examples/l6.ts` | its `DRIVER_FIELDS` — L6's copy of `retention.test.ts`'s ratchet — gains `loops`, the driver's new field, and nothing else; running a loop at L6 is W230's | **no — required by L6 `cross-row`; asked, (c1)** |
| `test/definition/l4-corpus.test.ts` | W228's `LATE_SUITES` entries for the four driver splits and its *W228's four suites* count test are deleted with the splits — named as W229's by W228's Record; and W229's own two suites enter the census and its count, as every item's do | **yes — W228's Record; asked, (a)** |

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- Resume of a loop and the measured footprint: W230.
- Releasing finished rounds: [Q809](../questions/q809.md), deferred.
- `onLost: "exit"`: P47 *Out*.

## Verification

Routing cases this item covers: a branch routed away from its join — the break, L2 and L5; `user_action` — a round's
park, resolved `done` and `failed`, L5; no matching decision edge — `branch.lost` in a round, L2; a duplicate task id —
a round's id unique by its segment, asserted over every id a multi-round run mints; a nested fan-out — a `map` inside
the body, its join firing once per round.

## Record

**Author's record, 2026-11-14, on `7499d04`.** Nothing committed.

### Gate

| Rung | Result |
|---|---|
| first ladder run, before the exceptions | RED — `check:spec` C8 (the README's version cells), `check:docs` X4 (`UnresolvedLoopBound` undiscovered by AGENTS.md section 9), L6 `cross-row` (`DRIVER_FIELDS`) — the stop-and-asks that granted the Exceptions above, (a), (b1), (c1) |
| `npm run gate` before the readers | **EXIT 0** (`C:/tmp-p47/w229-gate.log`) — node, deno and chromium 109 files, 2372 assertions (parity); L6 2923, 0 failed, both runtimes |
| `npm run gate` after the readers' findings | **EXIT 0** (`C:/tmp-p47/w229-gate2.log`) — 109 files, **2377** assertions in node, deno and chromium (parity); L6 2923, 0 failed, both runtimes |
| Workflow rule 8, author's | **10 of 10 RED** after the readers — the hold at `settleLoop`'s head, the policy opened on a loop, the three releases (fire, loss, halt), the join value entered outside its enclosing region, the replay's delivery gate, `"$iteration"` read as the last index and as the outermost loop's, a `null` seed defaulted — each mutated ALONE in the author's tree, `test/driver/loop.test.ts` red naming its case, both files restored byte-identical (sha256 checked) |
| Conformity reader | **RAN** (`C:/tmp-w229/rc`) — **1 BLOCKING**, 3 NIT; everything else re-derived and conforming |
| Adequacy reader | **RAN** (`C:/tmp-w229/ra`) — 58 mutations, 38 killed, **20 survived** (9 real gaps, 11 equivalent or unreachable), one conformity defect found by probing (D1); no strictly vacuous assertion; the copy restored byte-identical |
| Overlap | **1** shared SUBJECT: the hold at a loop's decision — the conformity reader's F1 (and F2, its wording) by construction, the adequacy reader's D1 by probe and M20 by mutation |
| `npm run gate:item` on the final tree | **EXIT 0** (`C:/tmp-p47/w229-gate-item.log`) — the ladder (2377 in node, deno and chromium; L6 2923, 0 failed, both runtimes) and every self-test but the register lane's, 10 of 10 ok |

### Outputs

| Output | Where | Tests |
|---|---|---|
| (1) a round opens at its own segment, `branch.opened` before its dispatch; round 0 the seed, round i > 0 the previous arrival, each its own copy | `driver.ts` `enter`'s `loop` arm, `openRound` | L2 cases 0, 2, 8 (inside a map), 6 |
| (2) `until` then the bound, in the arrival's routing step; the bound read once, `min` | `settleLoop`, `loopBound` | L2 cases 0, 1, 4 |
| (3) a break fires the join; a lost round makes it `unsatisfiable` (`policyId: "loop"`, JP-R10); a park holds; cancel, stop and pause; a halted run decides nothing | `settleLoop`, `fireLoop`, `loseLoop`, the head hold | L2 cases 2, 3, 8, 10; L5 both cases |
| (4) the join value; `"$iteration"`; a reader after the loop in ROUND order | `fireLoop`, `iterationOf`, `indicesFrom` | L2 cases 0-2, 6, 7, 14 |
| (5) `FD-R7` — `UnresolvedLoopBound`, from a listener, `start()` and `resolve()`, nothing of the loop appended | `loopBound`; `UnresolvedLoopBound` | L2 case 5 |
| a loop takes no policy; `joinStatusOf` answers from the driver | `MissingJoinPolicy`'s count, `regionsForPolicies`, `joinStatusOf` | L2 cases 3, 8, 9 |
| the lifetime | `releaseLoopValues`, `releaseLoops` beside each of the four `releaseAllItems` sites | L2 case 11 |
| spec | `spec/join-policy.md` **v0.26** (`JP-R13`-`JP-R15`), `spec/flow-definition.md` **v0.58** (`FD-R7`), still **47 refusals** | `check:spec` |

### Decisions taken within the plan's room

1. **One L2 suite, a case per way out**, where `Tests:` read *one suite per way out*: the ways out share one flow builder and one driver harness, and `l4-corpus.test.ts` counts the suite's cases, so a deleted case fails by name either way. JP-R14's `Test:` clause says so.
2. **A loop's state is the driver's, not a policy's**: `loops`, one `LoopRun` per instance, walked by the retention ratchet (and `examples/l6.ts`'s copy, (c1)).
3. **A halted run decides nothing at all** — checked at `settleLoop`'s head, before anything is read (F1, D1); JP-R14 now lists what is NOT appended on every road.
4. **`policyId: "loop"` is NOT reserved** (F4): a report is about its `fanoutId`, and whether that node is a loop is the definition's to say; JP-R14 states it. A reservation would be a refusal at construction for a policy id nothing else constrains.
5. **The result fixtures of the corpus suites gain `budget: { rounds: 2 }`** so `loop-training`'s `maxIterationsFrom` resolves; the FD-C2 census counts a loop region as collapsing ids as a map does (11 flows lose an output, was 9).
6. Q814-Q816 and ADR 0147 unused: every decision is P47's or ADR 0145's, and the spec carries the run.

### The readers' findings, and what was done

| Finding | Done |
|---|---|
| F1 (BLOCKING) / D1 / M20 — `settleLoop` decided past the hold: a cancel taken in the step of a round's terminal event had already released the values, so a break threw a `TypeError` (the run folded `halted`, not `cancelled`), an arrival at the bound appended `joinSettled` after `cancelRequested`, and a loss still reported | `if (this.shut()) return;` at `settleLoop`'s head (the later check removed as redundant); L2 case 10, every road — two arrivals, the bound, a break, a loss — the cancel taken from `onRegionEvent` on the terminal event |
| F2 (NIT) JP-R14 should say a halted loop appends no `joinSettled` | JP-R14: *a halted run DECIDES NOTHING*, and what is not appended |
| F3 (NIT) JP-R5's row should point to JP-R13 | done |
| F4 (NIT) `policyId "loop"` may collide | accepted and stated — decision 4 |
| M24 — the policy opened or stepped on a loop region | L2 case 9, a recording `live-token` over `IN_A_MAP` |
| M44-M47 — the lifetime; the retention walk never ran a loop | L2 case 11: held while a round is live, nothing after a fire, a loss, a break, a cancel |
| M49 — the join value entered outside the enclosing region | L2 case 12, a loop's join to an `end` inside a fan-out branch |
| M15 — `onUnsatisfiableJoin` on replay | L2 case 13, a lost loop resumed: not re-reported from the stored log, reported once past it |
| M42, M43 — `"$iteration"` under nesting | L2 case 14, a map in the body and an inner loop |
| M52 (NIT) — a `null` seed | L2 case 0 |
| JP-R13's *nothing between* only at top level | L2 case 8, inside a map instance |
| M53 (NIT) — a reading cut at a loop's join | **not tested** — handed to W230 with resume |
| L5's `visited.length` (NIT) cannot fail alone | **kept** — the early exit it would catch throws first; stated here |
| M19, M21-M23, M37, M50, M51, M57 | equivalent or unreachable, the reader's own reasons |

### Asked of the maintainer

- (a) the Exceptions above, at the first red ladder — 2026-11-14
- (a1) `joinStatusOf` and `onUnsatisfiableJoin` for a loop from the driver; (b1) AGENTS.md section 9's snippet; (c1) `examples/l6.ts`'s `DRIVER_FIELDS` — 2026-11-14

### What the next item inherits

- **W230** runs loops at L6 and removes `NOT_YET_AT_L6` and `KINDS_NOT_YET_AT_L6`, and the `round`/`carry` set-aside in `wiring.test.ts`'s L6 census; documents the loop in `AGENTS.md` — including `policyId: "loop"` (decision 4) and `UnresolvedLoopBound`'s rule; resume of a loop MID-ROUND (W229 replays only a lost one) and a reading cut at a loop's join (M53); the measured footprint; the reply to fyflow-app's pass 8.
