# W206 — what a node was handed, on real workers; the reading timed; the reply to fyflow-app; P42's close

**Status:** done 2026-10-22 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; 10 provocations KILLED, none surviving; the reply written. Earlier: declared 2026-10-22 on `1288209` (W205 committed, the tree clean); P42's LAST item: exit clauses (2) and (3), the reply, P42's Record and retro; this file written from the plan's row BEFORE any other edit
**Plan:** [P42](../plans/p42-what-a-node-was-handed-asked-after-the-fact.md) — *what was a node handed, asked after the
fact?* — and this is its LAST item.

```
Spec:       none moves — this item holds RN-R45 / ADR 0128's reading on real workers and times it; spec/README.md
            untouched.
Owns:       from P42's W206 row, exactly: examples/l6.ts (the WHOLE file, sentence D′), examples/README.md,
            examples/flows/** and examples/workers/** (neither expected to be edited: the block writes its registry and
            flow in itself, W200's and W203's shape), a cost subject under examples/ (examples/map-cost.ts),
            test/definition/l4-corpus.test.ts (if a census moves); OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass3.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping ONLY (the Status line's count of plans run, section 6's overlap ordinal, the ledger rows a retro
            appends to), P41's close (74c776b) the precedent, P42's W206 row naming it. The record step's four files
            carry P42's Record and retro and any dated note. Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P42 decisions 1-9, facts 1-10, stop-and-asks (a)-(e) ANSWERED; W205's Record (its counts, its timing, its
            readers' findings); ADR 0128; RN-R45; W203's and W197's L6 blocks and examples/map-cost.ts as the shapes this
            item extends; fyflow-app's pass3.md and the earlier reply files beside it for form.
Outputs:    (1) one L6 block in examples/l6.ts, `W206 exit`, node 24 and deno, a THREADED and an INLINE pool. Per pool,
                one flow — `fetch` (its result the item list) -> a map of TWELVE items (`10` and `11` beside `1`) whose
                `work` reads `{ item: "$item", run: "$payload" }`, routed by a registered predicate into an `if` gate
                `route` sending items 0-5 to the END `low` inside the map and 6-11 to the join `collect`; `collect` ->
                a fanout `fan` of `fast` and `slow` (`slow` HELD) -> a join `fj` that a consumer's policy FIRES AT ITS
                FIRST ARRIVAL -> an ask `review` -> `file` -> the END `done`. EVERY task's worker ECHOES the envelope it
                was handed. Claims, each its own verdict and its control:
                (a) LIVE, through `handle.inputOf` while `review` is parked: every task dispatched so far (`fetch`,
                    twelve `work`, `fast`, `slow` — `slow` still in flight) answered `envelope`, each EQUAL to its own
                    echo and to no other task's; `file` and `done` `not-reached` — the CONTROL the export answering both
                    after the run;
                (b) STORED, through the root `inputOf` over the header and events JSON-round-tripped and read once the
                    runtime is SHUT DOWN: every one of the run's tasks equal to its echo, and to no other's;
                (c) the ENDS by hand: `low` asked by node id alone answers `received` at paths 0-5 (as a set — the
                    order is the replay's), each work's result by hand; `done` the `file` result by hand; CONTROL the
                    neighbouring path's hand value differing;
                (d) the GATE by hand: `route` at every path 0-11 `received`, each its instance's `work` result; CONTROL
                    as (c);
                (e) the JOIN's two answers by hand, at `fj`: the ARRIVAL at `0` (fast's result) and the LATE ARRIVAL at
                    `1` (slow's, entered after the firing), the COLLECTION at `-` `{ "0": fast's result }` — the
                    ARRANGEMENT asserted (fj's `joinSettled` stored before slow's outcome) and the CONTROL the collection
                    with the late arrival included differing; and `collect`'s collection, `{ "6" … "11" }` by hand;
                    the ask `review` equal to its `asked` element's `input` and to `{ got: fj's collection }` by hand;
                (f) a HALTED run (the same flow, its predicate throwing for item 5): `fetch` and every `work` envelope
                    answered by hand, `route` at `5` `not-reached`, `review` and `done` `not-reached`, NEVER
                    `diverged` — CONTROL the completed run answering `route` at `5`;
                (g) a CHANGED REGISTRY — the predicate answering `false` — refused `diverged` reading `review`, at the
                    position of the first stored `gated` element; CONTROL the same reading with the run's own registry
                    answered.
            (2) examples/map-cost.ts — the READING subjects: `inputOf` on the stored run of W205's timing shape (a map
                whose `post` reads its own instance's `work`), the FIRST and the LAST instance, at 2,000 / 8,000 /
                16,000 items, each size a fresh process, node 24 and deno, beside the whole run's driver. A measurement,
                NOT a gate entry (Q179).
            (3) examples/README.md — X10's copies of the L6 counts moved by this block alone; the map-cost row.
            (4) the reply to fyflow-app, once this item's gate is green.
            (5) P42's Record and retro; doc/workflow.md's plan-close bookkeeping (the declared exception).
Depends on: W205
Blocks:     nothing — the plan closes with this item
Tests:      Output (1) is the test: expected values by hand from the echo worker's source, RN-R45 and ADR 0128 rule 4,
            the flow's own definition and spec/flow-definition.md's `if` gate. Output (2) is a measurement. W205's
            L1-L5 suites are re-run, not edited.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) — ONCE, on the final tree, after the readers
            (sentence C); `npm run gate` before the readers; L6 in node 24 and deno; then the conformity reader and the
            adequacy reader, workflow section 6.
Reserves:   Q765-Q769, ADR 0129 (expected unused)
```

## Scope

**In**

1. **The exit artifact on real workers** — Output (1): P42 exit clause (3).
2. **The reading timed** — Output (2): P42 exit clause (2).
3. **The counts' copies** — Output (3).
4. **The reply, the plan's close** — Outputs (4), (5).

**Out** — named rather than left implicit, with where it goes instead

- **Any logic in `src/`** — W205's; this item places none (P42's W206 row: *a counter or `src/` site it cannot read is
  an Exception named before the edit*).
- **The post-transform input** — [Q760](../questions/q760.md), deferred.
- **The 0.10.0 version bump, the push and the publish** — the maintainer's ((e1)).

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-22 on `1288209`, the tree clean; harnesses and logs in the session scratchpad's `w206/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the release state (21:44 +0200) | npm `fyflow-orchestration`: `0.0.0-stage`, `0.7.0`, `0.8.0`, `0.9.0`, `0.9.1`, `latest` 0.9.1; JSR `@fyflow/orchestration` latest 0.9.1 (2026-10-22T08:54Z); tags `v0.7.0`-`v0.9.1`, `v0.9.1` at `6957919`; `origin/main` at `6957919` (`git ls-remote`) — P41's and P42's commits (`88059b7` … `1288209`) NOT pushed; manifests 0.9.1 / 0.9.1 |
| 2 | `npm run state` | P43 W206 Q765 ADR 0129 from the tree; W205 Q760 ADR 0128 from the ledger — the two DISAGREE until P42's retro writes its sentence (expected); L6 2831 / 234 |
| 3 | W205's counts on W205's tree — `npm run gate` on `1288209` in `C:/tmp-w206/base` (`node_modules` COPIED, 0 links, 0 reparse points), EXIT 0, 21:44:54 → 21:51:41 (`w206/gate-base.log`) | L1-L5 **94 files / 2,197 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,831 / 0 failed** over 234 real runs in node and deno |
| 4 | fact 4 on the final tree — `examples/map-cost.ts "one step back"`, the whole run live, each size a fresh process | node **66 / 205 / 381 ms**, deno **79 / 273 / 513** at 2,000 / 8,000 / 16,000 items (ADR 0124: 68 / 223 / 442 and 79 / 258 / 560) |

## Verification

`npm run gate` before the readers (sentence C); the two readers in their own worktrees under `C:/tmp-w206/` (`1288209`
plus this diff, `node_modules` copied, scanned for links and reparse points before use); the readers' findings acted on;
the author's provocations in a third copy, re-run after acting on the readers; then `npm run gate:full` once, on the
final tree. **Routing coverage**: a nested fan-out (Q6) — not in the block (W205's L2 holds a join's arrivals at depth 2;
the adequacy reader's A19, a nested join's COLLECTION read at its opener's path, is held by neither suite — declared
below); `user_action` (Q17) — not reached (no task fails); a branch routed away from its join (Q4) — YES: items 0-5 end
at `low` and never arrive at `collect`, and `collect` at `3` is `not-reached` as an arrival; no matching decision edge
(Q10) — not reached (every edge list ends in a default); a duplicate task id (Q13) — not applicable, a reading appends
nothing.

## The author's provocations

`mut.mjs` (the session scratchpad's `w206/`, logs `mut1.log` and `mut2.log`) in the byte copy `C:/tmp-w206/m`, node
24.20.0 asserted at its head: each probe edits ONE clause of `src/driver/driver.ts` or `src/scheduler/runtime.ts`, its
anchor checked to occur once in the CURRENT text and the edit checked to change the file; `node examples/l6.ts`; the W206
claims that went red graded against the SET the probe declares, matched exactly, any other failure a WRONG-SET; the file
restored from its FIRST snapshot and its SHA-256 compared after every probe. Written to RN-R45 / ADR 0128, not to the
block. mut1 ran CONTROL and P1-P8 before the readers; mut2 re-ran the whole set and P9-P10 on the block as the readers
left it.

| probe | the clause broken | declared, both pools | mut1 | mut2 |
|---|---|---|---|---|
| CONTROL | none | none | **CLEAN** | **CLEAN** |
| P1 | rule 4, a task: the composed input, not the envelope | LIVE, STORED, HALTED | **KILLED** | **KILLED** |
| P2 | rule 3: a join's arrival on the opener's path | JOIN | **KILLED** | **KILLED** |
| P3 | decision 4: a node id alone cut at its first answer | ENDS | **KILLED** | **KILLED** |
| P4 | rule 5: a halted run refused as a resume refuses it | HALTED | **KILLED** | **KILLED** |
| P5 | decision 7: the handle's reading built with `liveToken` | LIVE | **KILLED** | **KILLED** |
| P6 | decision 7: the handle reads its header and no events | LIVE | **KILLED** | **KILLED** |
| P7 | rule 4, a gate: its composition not offered | GATE, HALTED (its control) | **KILLED** | **KILLED** |
| P8 | rule 4, a join at its opener's path: the collection not offered | JOIN | **KILLED** | **KILLED** |
| P9 | rule 5: the verified prefix does not END at `halted` (the conformity reader's mutant) | HALTED | — | **KILLED** |
| P10 | rule 2: an offer taken at the composition, unconfirmed (the adequacy reader's A3) | CHANGED REGISTRY | — | **KILLED** |

## Readers (2026-10-22), and what was acted on

*Both read the spec first; each reported and fixed nothing; each verified its copy green first (`node examples/l6.ts`
EXIT 0, 2847 / 0; the conformity reader in deno too).*

| reader | finding | acted on |
|---|---|---|
| conformity S1; adequacy S1 | the HALTED claim cannot fail with ADR 0128 rule 5's prefix end deleted: the halt is a PREDICATE's throw, which a reading re-runs and so REGENERATES — only the `not-reached` index moves (48 → 55) | **FIXED** — each `not-reached` asserted AT the stored `halted` element's position; P9 KILLED. The sentence *a replay cannot regenerate `halted`* in RN-R45 / ADR 0128 rule 5 is outside this item's `Owns`: **P42's retro stop-and-ask (a)** |
| conformity S2 | the LIVE claim's `not-reached` control read the export, another observer | **FIXED** — the same handle, asked once the run is done, before the runtime is shut down |
| conformity N3 | the reading is timed in a JIT-warm process (a cold read ~1.5x at 2,000, equal at 16,000) | **FIXED** — said in `map-cost.ts` and the README row |
| conformity N4 | `done`'s by-hand value had no control | **FIXED** — `file`'s result for the other answer differs |
| conformity N5 | README: *every task … read live* | **FIXED** — *each task dispatched by the time an ask parks* |
| conformity N6 | the reading subjects' column printed BEFORE | **FIXED** — WHOLE RUN |
| adequacy S2 | the CHANGED REGISTRY claim reads `review`, past the divergence, so an UNCONFIRMED offer (A3, A8b) survives — ADR 0128 rule 2's own case is a changed predicate routing INTO a target | **FIXED** — `collect` at `0`, which the changed predicate routes into, refused `diverged` at the first `gated` element; P10 KILLED |
| adequacy S3 | the HALTED claim's works loop shrinkable to one (B7) | **FIXED** — the count of matched envelopes, twelve |
| adequacy NIT | LIVE reads no target at the checkpoint's end (A32, killed at L2) | **FIXED** — the parked ask `review`, live, by hand |
| adequacy NIT | the JOIN and ASK *late arrival differing* controls compare the answer with a literal and cannot fail while their claim passes; the discrimination is the order probe's (O6) | **DECLARED** — the reader's own verdict: the selection is real, held by O6 |
| adequacy NIT | A19 — a nested join's collection offered at `-` instead of its opener's path survives L6 AND L2: every join in both suites opens at the root | **DECLARED** — outside exit (3), and W205's suites own `src/`'s L2; recorded in P42's Record as a gap for the next item touching the reading |
| adequacy, the sweep | 71 mutants in node (43 code, 22 block, 6 order), 15 re-run in deno with the same verdicts; every L6 survivor re-run at L1-L5 — A3, A4, A6, A7, A8b, A9, A9b, A14, A25, A26, A26b, A27b, A32, A38 killed at L2; A5, A17b, B11 EQUIVALENT; order probes O1-O5 green in both runtimes, O6 red on its arranged premise — **no claim depends on an unarranged order** | — |

## Record

*Filled 2026-10-22, after both readers, the provocations and the confirming gate. Harnesses and logs in the session
scratchpad's `w206/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 1**, 22:06:01 → 22:11:32 (`w206/gate-1.log`) | every lane green up to the chain's LAST, `test:l6:deno`: 2847 / **2 failed**, both W94 (2h) at K=2 — a [Q599](../questions/q599.md) row, under load from other sessions on the machine. L1-L5 94 / 2,197 in node, deno and chromium; L6 node 2847 / 0. The lane alone: red on `uncloneable / OR-R6, threaded` (Q599's other row, `l6d-2.log`), then **EXIT 0**, 2847 / 0 (`l6d-3.log`). No W206 claim red in any run |
| L6 after the readers' fixes | RAN — node EXIT 0 (`l6-4.log`), deno EXIT 0 (`l6d-4.log`), 2,847 / 238, 0 failed | no claim added: every fix widened an existing tuple |
| conformity reader (`C:/tmp-w206/rc`) | RAN | no BLOCKER; 2 SHOULD, 4 NIT — above |
| adequacy reader (`C:/tmp-w206/ra`, harness and logs in `ra-scratch`) | RAN | 71 mutants; no BLOCKER; 3 SHOULD, 3 NIT — above; `ra` byte-identical after (1,073 files, its `tree.sha`) |
| the author's provocations (`C:/tmp-w206/m`) | RAN | mut1 8 KILLED, control CLEAN; mut2 **10 KILLED, 0 SURVIVED**, control CLEAN, digests equal after every probe |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command, 23:06:50 → 23:46:48 (`w206/gatefull.log`, 2,398 s) | lint; typecheck; every check, `check:docs` 52 `run` and X10 2 copies at 2847 / 238, `check:spec` C4 45; L1-L5 **94 files / 2,197 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,197); L6 **2,847 / 238, 0 failed** in node and deno — no Q599 row red; selftests **11/11 ok**, `check:register:selftest` included (2,097.2 s wall, 10 lanes). The tree's diff digest equal before and after. Written after it: this Record's gate row and Status, the plan's Status and gate cells, and the commit hash — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W206 exit` L6 block — sixteen claims, four runs | yes | P1-P10; `CROSS_ROW_SUBJECTS` (sixteen names); `DECLARED_TOTAL` / `DECLARED_RUNS`; `X10` |
| (2) `examples/map-cost.ts`' reading subjects | yes | L0 (lint, `tsconfig.examples.json`); its own answer check (a refusal is a crash). A measurement, not a gate entry |
| (3) `examples/README.md`'s copies | yes | `X10` (2 copies at 2847 / 238) |
| (4) the reply | yes | — (outside the repository) |
| (5) P42's Record and retro; `doc/workflow.md`'s bookkeeping | yes | `check:register`, `check:budget`, `npm run state` (the two id derivations AGREE) |

**The numbers** — `examples/map-cost.ts`' reading subjects, `inputOf` over `one step back`'s stored run (JSON-round-
tripped), the reading alone in the process that built the run, each size a fresh process; node 24.20.0 / deno 2.9.6
(`w206/timing-node.log`, `timing-deno.log`):

| subject | 2,000 | 8,000 | 16,000 |
|---|---|---|---|
| the FIRST instance's `post` | 15 / 17 ms | 51 / 57 | 91 / 95 |
| the LAST instance's `post` | **47 / 53** | **168 / 187** | **302 / 365** |
| the whole run live (re-take 4) | 66 / 79 | 205 / 273 | 381 / 513 |
| ADR 0124 consequence 1, the whole run | 68 / 79 | 223 / 258 | 442 / 560 |

**P42 prediction 3's timing HOLDS on this harness**: the last instance at 16,000 items is 302 ms against 442 (within
2x), the whole run's prefix being what it replays.

**Predictions.** P42 prediction 6 **HOLDS**: `X10` moved by this block alone, 2831 / 234 → 2847 / 238; no `EXPECTED` row,
pair row or other block moved. This item placed no logic: no `src/` file edited.

**What broke.** At no rung of the product. The readers found what the author's set did not — two claims whose observer
could not see the clause they named (a halt the reading regenerates, so `not-reached` without its index; a diverged
reading past the divergence, so no confirmation exercised), a loop bound counted by nothing, and a control on the wrong
observer — each now part of an existing claim, P9 and P10 killing the two clauses. Observed on the way: on an INLINE
pool a halted run's stored events hold OUTCOMES after its `halted` element (in-flight tasks settling), which the reading
correctly does not read.

**What this taught.** *For the retro*: **a claim's OBSERVER is a shape too** — the halt claim was right and its
`not-reached` blind to the prefix end, because the halt it used is one the replay regenerates; the index sees it. W205's
BLOCKER was the same class through a target form. Two items, one plan.

**Questions raised.** None (Q765-Q769 SPENT, unissued). **Closed.** None. ADR 0129 SKIPPED. **Record step**: P42's Record
and Retro; `doc/workflow.md`'s bookkeeping (the declared exception).

**The readers' overlap.** **ONE** — the HALTED claim blind to ADR 0128 rule 5's prefix end (conformity S1, adequacy S1),
each by construction. Every other finding was one reader's alone. The two briefs were written apart and named no common
specific.

**Leftover worktrees.** `C:/tmp-w206/base` (at `1288209`), `m`, `rc`, `ra` (at `1288209` plus this item's diff) — git
worktrees, `node_modules` COPIED, scanned before use: 0 links, 0 reparse points; and `rc-scratch`, `ra-scratch` (plain
directories, the readers'). Left for the maintainer; none removed with `--force`.
