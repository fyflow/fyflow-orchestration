# W200 — the exit artifact on real workers, the driver re-timed, and the reply to fyflow-app

**Status:** done 2026-10-22 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; 5 provocations KILLED, none surviving; the reply written. Earlier: declared 2026-10-22 on `a2c7ec1` (W199 committed, the tree clean); P40's LAST item: exit clauses (2) and (3), the reply, P40's Record and retro; the declaration step RUN before any edit (below)
**Plan:** [P40](../plans/p40-what-a-reference-read-costs-inside-a-map.md) — *what does a reference read cost inside a map,
and can it cost its answer rather than the map?* — and this is its LAST item.

```
Spec:       none moves — this item holds ADR 0124's index on real workers and re-times the driver; spec/README.md
            untouched.
Owns:       from P40's W200 row, exactly: examples/l6.ts (the WHOLE file, sentence D′), examples/README.md,
            examples/map-cost.ts, examples/flows/** and examples/workers/** (neither expected to be edited: the block
            writes its registry and flow in itself, W197's shape), test/definition/l4-corpus.test.ts (if a census
            moves); OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping ONLY (the Status line's count of plans run, section 6's overlap ordinal, the ledger rows a retro
            appends to), P39's close (9c5bd81) the precedent, P40's W200 row naming it. The record step's four files
            carry P40's Record and retro and any dated note. Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P40 decisions 1-7, facts 1-10, stop-and-asks (a)-(e) ANSWERED ((e) as (e1)); W199's Record (its numbers
            table, its "for the retro" notes) and its stop-and-ask, ANSWERED (a): `visibilityKey` an additive export,
            0.9.1 a patch, Q221 iceboxed; ADR 0124; ADR 0044 rules 1-3; FD-V28; W197's L6 block and map-cost.ts as the
            shapes this item extends; fyflow-app's pass2-followup.md.
Outputs:    (1) one L6 block in examples/l6.ts, `W200 exit`, node 24 and deno, a THREADED and an INLINE pool: a map of
                TWELVE items (ADR 0044 rule 3's two-digit segment: `10` and `11` beside `1`) whose branch is
                `work` → `mid` → `post`, `post` reading `work` (`one`, two steps back) and `mid` (`one`, one step back);
                `post` opening an INNER map of two whose `tail` reads `work` (the outer instance's, depth 1) and `leaf`
                (its own inner instance's, depth 2); and, after the outer join, a SIBLING map of THREE slots whose
                `publish` reads `["post"]` (`all`, depth 0). For every reader task: each composed payload — what the
                worker was handed, returned by it — equal to ADR 0044's predicate (`outputIsVisible`, through the package
                root) applied to the run's OWN outputs (its outcome records) and sorted segment-wise; and equal to the
                value derived BY HAND from the worker's source. Each shape its OWN claim, each carrying a CONTROL on the
                same observer: the selection for a WRONG reader path (the next instance, the other inner instance) or the
                WRONG order (the string order, where `10` sorts before `2`) differs from every payload compared — the
                absence of a mismatch is shown able to fail. A fifth claim per pool: the run completed, every task done.
            (2) examples/map-cost.ts — four REFERENCE subjects (one step back, two steps back, a nested map, a sibling
                map of three slots), the driver alone, `task.running` (attemptNumber 1) before each settlement, the
                queue walked by index, at 2,000 / 8,000 / 16,000 items, each size a fresh process, printed beside the
                BEFORE figures W199's declaration step took on `6006caa` (node 24.20.0 and deno 2.9.6, by the runtime
                running). A measurement, NOT a gate entry (Q179).
            (3) examples/README.md — X10's two copies of the L6 counts moved by this block alone.
            (4) the reply to fyflow-app (P40's "The reply" paragraph), once this item's gate is green.
            (5) P40's Record and retro; doc/workflow.md's plan-close bookkeeping (the declared exception).
Depends on: W199
Blocks:     nothing — the plan closes with this item
Tests:      Output (1) is the test: the block's claims, expected values from ADR 0044's predicate over the run's own
            outputs, from the worker's source by hand, and from FD-V28 / ADR 0044 rule 3 for the controls. Output (2) is
            a measurement. The L1-L5 cost suite (W199's) is re-run, not edited.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) — ONCE, on the final tree, after the readers
            (sentence C); `npm run gate` before the readers; L6 in node 24 and deno; then the conformity reader and the
            adequacy reader, workflow section 6.
Reserves:   Q745-Q749, ADR 0125 (expected unused)
```

## Scope

**In**

1. **The exit artifact on real workers** — Output (1): P40 exit clause (3).
2. **The driver re-timed** — Output (2): P40 exit clause (2).
3. **The counts' copies** — Output (3).
4. **The reply, the plan's close** — Outputs (4), (5).

**Out** — named rather than left implicit, with where it goes instead

- **Any logic in `src/`** — W199's; this item places none (P40's W200 row: *a counter or `src/` site it cannot read is
  an Exception named before the edit*).
- **[Q186](../questions/q186.md)** — the clone of a large value per read ((c), deferred); the reply names it.
- **The 0.9.1 version bump, the push and the publish** — the maintainer's ((d)).

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-22 on `a2c7ec1`, the tree clean; harnesses and logs in the session scratchpad's `w200/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the four cost shapes' counts on W199's tree — `node test/runner.ts fold/map-cost` and the same under deno (`w200/mc-node.log`, `mc-deno.log`) | EXIT 0 in both: 9 cases, every EXACT pin (`2n`, `2n`, `7n`, `4n` at 2,000 / 8,000) and every provocation green; the suite's wall **30.6 s node, 38.7 s deno**. Chromium: W199's `gate:item` on this tree (the bundle in one page under its 60 s limit, EXIT 0) — not re-run here; this item's `npm run gate` re-runs it |
| 2 | the ladder counts — W199's `gate:item` on the tree `a2c7ec1` commits (its Record) | L1-L5 **89 files / 2,155 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2,805 / 228, 0 failed** in node and deno; `npm run state` agrees: 2805 / 228 |
| 3 | the release state | npm `fyflow-orchestration`: versions `0.0.0-stage`, `0.7.0`, `0.8.0`, `0.9.0`, `latest` 0.9.0; JSR `@fyflow/orchestration` latest 0.9.0; tags `v0.7.0`-`v0.9.0`, `v0.9.0` at `4f21bba`; `origin/main` at `4f21bba` — P40's `6006caa` and `a2c7ec1` NOT pushed; manifests 0.9.0 / 0.9.0 |
| 4 | `outputIsVisible`, `allRegions`, `buildGraph`, `parseTaskId` reachable through the package root (`index.ts` re-exports `regions.ts` whole) | yes — the block reads ADR 0044's predicate the way a consumer would |

## Verification

`npm run gate` before the readers (sentence C); the two readers in their own worktrees (`C:/tmp-w200/rc`, `C:/tmp-w200/ra`
— `a2c7ec1` plus this diff, `node_modules` copied, `find -type l` empty and no reparse point, `node examples/l6.ts` and
`check:docs` green in each before use); the readers' findings acted on; the author's provocations in the third copy
(`C:/tmp-w200/m`); then `npm run gate:full` once, on the final tree. **Routing coverage**: a nested fan-out (Q6) — the
block's map inside a map, reads at depths 1 and 2; a branch routed away from its join (Q4), `user_action` (Q17), no
matching decision edge (Q10) and a duplicate task id (Q13) — NOT in the block, stated: it holds what a reference
resolves to on a run that completes, and W199's equality suite holds the index across `user_action`, a repeated
settlement and `p1-routed-away`.

## The author's provocations

`mut.mjs` (the session scratchpad's `w200/`, with `mut1.log`) in the byte copy `C:/tmp-w200/m`, node 24.20.0 asserted at
its head: each probe edits ONE clause of `src/`, its anchor checked to occur once in the CURRENT text and the edit
checked to change the file; `node examples/l6.ts`; the W200 claims that went red graded against the SET the probe
declares, matched exactly; every file restored from its FIRST snapshot and its SHA-256 compared after every probe.
Written to the RULE (ADR 0044 rules 1-3, ADR 0124 decisions 1-2), not to the block.

| probe | the clause broken | declared, per pool | verdict |
|---|---|---|---|
| CONTROL | none | none | **CLEAN** — 2815 / 0 |
| P1 | the index read one depth too shallow (`visibleOutputs`) | all four shapes | **KILLED** — and 4 other L6 failures |
| P2 | a group kept in STRING order (`groupsOf`) — ADR 0044 rule 3's order | the sibling | **KILLED** |
| P3 | `visibilityKey` by CHARACTERS — rule 3's two-digit defect, in the function the ORACLE shares | all four | **KILLED** — by the hand route (the conformity reader's finding 1) |
| P4 | a stray key on every composed payload (`compose`) | all four (the whole-payload keys) | **KILLED** — and 29 other L6 failures |
| P5 | the shared depth remembered per TARGET, not per (reader, target) | the sibling | **KILLED** — reachable only since the readers: `publish` reads `work` at depth 0 where `post` and `tail` read it at 1 |

**5 KILLED, 0 SURVIVED, the control CLEAN, digests equal.** Each ~53 s.

## Readers (2026-10-22), and what was acted on

*Both read the spec first; each reported and fixed nothing; the author's tree held still while they read.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | 1 SHOULD — the predicate route is NOT independent of the code under test: since W199 `outputIsVisible` is restated through `visibilityKey` and `sharedRegionDepth`, the functions the index keys on, so a defect in either moves the oracle with the payload (its provocation C: every predicate list `[]`, the hand lists red). The block's comment called the predicate *the oracle* | doc | **FIXED** — the block's comment and the header row say which route is independent: the HAND route holds the two-digit segment and every shared-key defect; the predicate route holds the index against the definition (P3 above, and the adequacy reader's O1) |
| conformity | 2 NIT — `tail`'s payload compared key by key, not whole | test | **FIXED** — every reader's payload must have EXACTLY the keys its `needs` declares, in order (P4 KILLED) |
| conformity | 3 NIT — one verdict per shape covers the predicate claim, the hand claim and the control | — | **DECLARED** — the tuple names which part failed; one claim per SHAPE is the plan's *each claim its own verdict*, and each part is a COUNTED field the check pins |
| conformity | 4 NIT — `const pairRunCount =pairResults` (a space lost by this item's edit) | text | **FIXED** |
| conformity | 5 NIT — README's *at 2,000 / 8,000 / 16,000 … beside what W199 measured* where two shapes have no BEFORE at 16,000 | doc | **FIXED** — the sentence names which |
| adequacy | 38 mutations (`src/` index and key, the oracle, the block's own clauses); every value-changing one KILLED by the claim of its shape, two confirmed on the real `l6.ts`; survivors D8/D8s (a group's in-order growth), D10, D11, D13, O2, C1/C2, T1-T3 | — | — |
| adequacy | NIT 1 — compared per key: an extra key on `tail`'s or `publish`'s payload passed all five claims of a pool | test | **FIXED** — conformity 2, the same subject |
| adequacy | NIT 2 — no target read at two depths, so a depth remembered per TARGET (D13) was invisible at L6 | test | **FIXED** — `publish` also reads `["work"]` (depth 0); P5 KILLED |
| adequacy | NIT 3 — a multi-entry group's growth after it is built is not reached at L6 (D8, D8s) | — | **DECLARED** — the block does not claim it; W199's equality suite kills both |
| adequacy | D10 (`one` takes the last), O2, D11 (no clone) | — | **DECLARED** — D10 and O2 equivalent (ADR 0124 consequence 6: no depth > 0 group holds two); D11 the copy claim, W199's, outside Output (1) |

## Record

*Filled 2026-10-22, after both readers, the provocations and the confirming gate.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0** (scratchpad `w200/gate-1.log`) | lint; typecheck; every check, `check:docs` X10 2 copies at 2815 / 230, `check:spec` C4 45; L1-L5 **89 files / 2,155 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,155); L6 **2,815 / 230, 0 failed** in node and deno — the block green on its first run |
| L6 the `W200 exit` block | RAN — green | 10 claims over 2 runs, node and deno, threaded and inline; after the readers' fixes `node examples/l6.ts` EXIT 0, 2815 / 0 |
| the cost suite, W199's, re-run unedited | RAN — green | the declaration step's re-take 1 |
| conformity reader | RAN | no BLOCKER; 1 SHOULD, 4 NIT — acted on above |
| adequacy reader | RAN | 38 mutations; no SHOULD; 3 NIT — acted on or declared above |
| the author's provocations | RAN | **5 KILLED, 0 SURVIVED**, control CLEAN |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command (scratchpad `w200/gatefull.log`, 3,710 s) | lint; typecheck; every check, `check:docs` 51 `run` and X10 2 copies at 2815 / 230, `check:spec` C4 45; L1-L5 **89 files / 2,155 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,155); L6 **2,815 / 230, 0 failed** in node and deno; selftests **11/11 ok**, `check:register:selftest` included (3,323.0 s wall, 10 lanes). The tree's diff digest equal before and after. Written after it: this Record's gate row and Status, the plan's Status and gate cells, and the commit hash — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W200 exit` L6 block | yes | P1-P5; `CROSS_ROW_SUBJECTS` (ten names); `DECLARED_TOTAL` / `DECLARED_RUNS`; `X10` |
| (2) `examples/map-cost.ts`'s four reference subjects | yes | `l6.ts`' construction clause reads its text (`CONSTRUCTION_PRICED`, unmoved); L0. A measurement, not a gate entry |
| (3) `examples/README.md`'s two copies of the L6 counts | yes | `X10` (2 copies at 2815 / 230) |
| (4) the reply | yes | — (outside the repository) |
| (5) P40's Record and retro; `doc/workflow.md`'s bookkeeping | yes | `check:register`, `check:budget` |

**The numbers** — `examples/map-cost.ts` on the final tree (no `src/` edit since W199), each size a fresh process
(scratchpad `w200/mapcost-node.log`, `-deno.log`), node 24.20.0 / deno 2.9.6, against W199's BEFORE on `6006caa`:

| shape | items | before, node | **now, node** | before, deno | **now, deno** |
|---|---|---|---|---|---|
| one step back (Q735's) | 2,000 / 8,000 / 16,000 | 701 / 22,033 / 99,029 ms | **65 / 211 / 402** | 474 / 12,006 / 64,208 | **78 / 267 / 505** |
| two steps back | 2,000 / 8,000 / 16,000 | 1,310 / 41,622 / 176,628 | **81 / 274 / 515** | 815 / 26,770 / 124,493 | **99 / 351 / 701** |
| nested map | 2,000 / 8,000 / 16,000 | 18,251 / 290,697 / — | **176 / 635 / 1,259** | 16,881 / 323,427 / — | **220 / 817 / 1,575** |
| sibling map, three slots | 2,000 / 8,000 / 16,000 | 52 / 178 / — | **48 / 150 / 288** | 59 / 206 / — | **57 / 186 / 351** |

The same run's P39 columns, unmoved: `fold` 7 / 10 / 19 / 25 / 47 ms node at 1,000-16,000; the driver with
`task.running` 24 / 36 / 61 / 116 / 204; a runtime 41 / 68 / 110 / 196 / 373.

**Predictions.** P40 prediction 6 **HOLDS**: `X10` moved by the block alone, 2805 / 228 → 2815 / 230; no `EXPECTED` row,
pair row or other block moved. Prediction 2 **HOLDS** on the final tree: 211 ms at 8,000 items against W199's 216 for a
one-output read, 402 ms at 16,000. Prediction 5 holds for this item: no `src/` file edited.

**What broke.** At a rung: nothing. The readers found what the author's set did not: an oracle that moved with the code
under test (the predicate, restated through the shared key by W199 — the hand route was what held the two-digit
segment), a payload compared key by key, and a target read at one depth only.

**What this taught.** *For the retro*: **an oracle reached through the package is part of the code under test once a
plan has made the definition ONE function** — P40 decision 2 did that on purpose (ADR 0044 rule 2), W199's equality
suite kept the OLD expression as its oracle, and this block, written later, reached for the public predicate. The hand
route saved it. One occurrence.

**Questions raised.** None (Q745-Q749 SPENT, unissued). **Closed.** None. ADR 0125 SKIPPED. **Record step**: P40's
Record and Retro; `doc/workflow.md`'s bookkeeping (the declared exception).

**The readers' overlap.** **ONE** — the payload compared key by key (the conformity reader's NIT 2, the adequacy
reader's NIT 1). The adequacy reader's account of the shared key moving the oracle answered a question its brief ASKED
(*which mutations of the shared key does the hand comparison still catch*) and is not counted as a finding: a shared
priming (section 6's caveat). Every other finding was one reader's alone.
