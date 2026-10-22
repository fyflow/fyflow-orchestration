# W199 — the reference index: a `needs` read inside a map costs its answer, not the map

**Status:** done 2026-10-22 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; the stop-and-ask on `visibilityKey` ANSWERED (a) by the maintainer; Q735 resolved. Earlier: declared 2026-10-22 on `6006caa`; P40's FIRST item: decisions 1-6, stop-and-asks (a)-(e) as answered ((e) as (e1), relayed mid-item); the declaration step RUN before any `src/` edit (below)
**Plan:** [P40](../plans/p40-what-a-reference-read-costs-inside-a-map.md) — *what does a reference read cost inside a map,
and can it cost its answer rather than the map?* — and this is its FIRST item: the index, ADR 0124, the count in the gate.

```
Spec:       spec/flow-definition.md v0.45 -> v0.46 — section 3's *What `needs` costs* (the SEARCH's cost beside the
            clone's) and FD-C1's test text; spec/run-state.md v0.31 -> v0.32 — RN-R13 (the index, a retained term BY
            REFERENCE, and its per-entry figure); spec/README.md's two rows. ADR 0044 NOT amended (P40 decision 2).
Owns:       from P40's W199 row, exactly: src/driver/driver.ts, src/definition/regions.ts, test/driver/**,
            test/definition/** (sibling-regions.test.ts read and run, l4-corpus.test.ts counted),
            test/fold/map-cost.test.ts, spec/flow-definition.md (section 3, FD-C1's test text — a forecast, not a limit:
            its Status line moves with the version), spec/run-state.md (RN-R13, and its Status line),
            spec/README.md, AGENTS.md (the WHOLE file, sentence D′), doc/decisions/0124-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): none at declaration. Found DURING the item
            and put to the maintainer as a stop-and-ask, not an edit outside Owns: a function the driver and
            regions.ts share is PUBLIC (index.ts re-exports regions.ts whole), so P40 decision 2 adds an export
            P40 decisions 5 and 7 say does not move — `visibilityKey`, additively (W191's `innermostMapOf` shape). The record step's four
            files carry ADR 0040's dated amendment note and Q735's closing (doc/decisions/**, doc/questions/**).
            Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P40 decisions 1-7, facts 1-10, stop-and-asks (a)-(d) ANSWERED 2026-10-22 as recommended, (e) OPEN; Q735;
            ADR 0044 rules 1-3; ADR 0040 rule 2 and its amendments (0117, 0118, 0121); ADR 0121 rules 2, 4 and 7;
            W195's and W197's Records; test/fold/map-cost.test.ts as W197 left it.
Outputs:    (1) src/definition/regions.ts: `visibilityKey(path, depth)` — the first `depth` SEGMENTS of a branch path, or
                `null` for a path with fewer; `outputIsVisible` RESTATED through it with no change of behaviour.
            (2) the index inside `outputsCache` — per named node, per shared depth a reader asks at, the node's entries
                grouped by `visibilityKey`, each group in `compareBranchPaths` order; built per `(node, depth)` on its
                first read, grown in `place` at each of fact 4's five cases; the shared depth memoised per
                `(reader, target)` (a graph fact).
            (3) `resolveReference` reading the index — a read costs its answer: one entry for `one`, the group for `all`.
            (4) the private counter `outputsCache.examined` — entries the index touches: each entry a read takes, each
                entry a build reads, one per index a `place` change lands in. Never public (ADR 0121 rule 7's two
                constraints).
            (5) test/driver/reference-index.test.ts (new, L2): the index's answer `===` the pre-change filter-and-sort
                (the ORACLE, kept in the test, section 5 rule 4) at every read of every valid corpus flow under six
                drains and a resume from every rest point; the constructed cases of P40 decision 2; the key function and
                the restated predicate (L1); the index's entries `===` `byNode`'s.
            (6) test/fold/map-cost.test.ts: the reference-read subject — EXACT at 2,000 / 8,000 items for one step
                back, two steps back and a nested map, below 6x, under the iteration observer too; the provocations
                restoring the filter (counted and uncounted) and the per-output depth, one site each, bounded; the
                header's *ONE output* sentence corrected. **The sibling-map shape waits on (e).**
            (7) ADR 0124; spec/flow-definition.md v0.46; spec/run-state.md v0.32 (RN-R13's figure re-measured by
                `v8.serialize`); spec/README.md's two rows; AGENTS.md's *What it costs* and its RN-R13 sentence;
                test/driver/retention.test.ts's alias claim extended to the index.
Depends on: P40's declaration (6006caa)
Blocks:     W200
Tests:      Outputs (5) and (6) are the tests; test/definition/sibling-regions.test.ts run UNMOVED (the restated
            predicate); retention.test.ts's alias claim. Expected values from ADR 0044's predicate (the oracle) and from
            derivations beside each count. Measurements, not gate entries: the driver re-timed (Q735's table), the
            composed payloads over the corpus byte-identical to 6006caa's, RN-R13's per-entry figure.
Gate:       `npm run gate:item` (not the plan's last item; no row edits scripts/check-register*.mjs, scripts/state.mjs or
            doc/questions/README.md); `npm run gate` before the readers (sentence C); then the conformity reader and
            the adequacy reader, workflow section 6.
Reserves:   Q740-Q744, ADR 0124
```

## Scope

**In**

1. **The key function and the restated predicate** — Outputs (1).
2. **The index, its upkeep, the read, the counter** — Outputs (2)-(4).
3. **The equality suite and the cost subject** — Outputs (5), (6).
4. **The record** — Outputs (7).

**Out** — named rather than left implicit, with where it goes instead

- **What any reference RESOLVES TO** (P40 decision 5) — no payload, order, `FD-R3` or `FD-C4` arm moves.
- **[Q186](../questions/q186.md)** — the clone of a large value per read ((c), deferred).
- **The answer's own size** — a sibling-map `all` read is O(its answer) by `FD-V28` (fact 7).
- **The L6 block, `examples/map-cost.ts`, the reply** — W200.
- **The other per-read `.filter(`/`.sort(` sites** — re-read and classed below; none is per-read over the run.

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-22 on `6006caa`, the tree clean; harnesses in the session scratchpad's `w199/`.*

| # | re-take | measured |
|---|---|---|
| 1 | Q735's driver table (fact 5), `w199/drv.ts`, each size a fresh process, `task.running` (attemptNumber 1) before every settlement, the queue walked by index | node 24.20.0, `post` reading `work`: **701 / 22,033 / 99,029 ms** at 2,000 / 8,000 / 16,000 items (4,001 / 16,001 / 32,001 settlements) — Q735's 673 / 20,492 / 96,919 REPRODUCED; deno 2.9.6 **474 / 12,006 / 64,208**. `post` reading a one-output node (Q735's `drv-time3`): 68 / 215 / 399 node, 76 / 257 / 538 deno. Two steps back (`work` → `mid` → `post`): 1,310 / 41,622 / 176,628 node, 815 / 26,770 / 124,493 deno. A reader in a NESTED map: 18,251 / 290,697 ms node, 16,881 / 323,427 deno at 2,000 / 8,000. A SIBLING map of three slots reading `["score"]`: 52 / 178 node, 59 / 206 deno (2,000 / 8,000) — linear already, its answer is the list |
| 2 | a CPU profile at 8,000 items, `post` reading `work` (`w199/prof-before`) | **`outputIsVisible` 37.9% self, the filter's callback (`driver.ts:4662`) 24.1%, `regionChainOf` 12.0%, `resolveReference` 10.4%**, `innermostRegionOf`'s callback 4.8%, GC 4.7% — Q735's profile at 6,000 reproduced |
| 3 | fact 3's no-ties claim | `buildTaskId` is called at THREE sites, `driver.ts:3775` (the settlement's id, default `attempt = 0`), `:4819` and `:4941` (`0` written) — every task id the driver mints carries attempt `0`, so `(node, branchPath)` names one task id and two entries of one node never share a path; `ID-R4` refuses a settlement it did not dispatch. **Holds** |
| 4 | the D′ census — every `.filter(`/`.sort(` in `src/driver/driver.ts` | `:574-575` `sameData` (per comparison of two results, per CALL); `:754` `collectArrivals` (once per join firing, over its arrivals — per settlement of a JOIN, not per read); `:2652` `inFlight` (per run-control call); `:3090` (per `stop`); `:3177` `pauseWanted` (over the consumer's pending calls — per call); **`:4662-4663` the per-read reference search, this plan's**. None other is O(run) per read |
| 5 | the readers of `sharedRegionDepth` / `outputIsVisible` / `regionChainOf` outside `regions.ts` | `src/driver/driver.ts`, `examples/l6.ts` (5 lines), `test/definition/sibling-regions.test.ts`, `test/definition/l4-corpus.test.ts`, `test/driver/needs.test.ts`, `test/driver/nested-regions.test.ts` — no signature moves, so none is edited |
| 6 | whether any test reads `outputsCache`'s shape beyond `byNode` | `test/driver/retention.test.ts:236-244` types it `{ byNode }`; `test/fold/map-cost.test.ts:728` sets it `null` (the rebuild provocation). Nothing else |
| 7 | the ladder counts — `npm run gate` on `6006caa` (worktree `C:/tmp-w199/base`, `node_modules` copied, no link), EXIT 0 (scratchpad `w199/gate-base.log`) | L1-L5 **88 files / 2,142 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,805 / 0 failed** in node and deno; `check:docs` 51 `run`; `check:spec` C4 45 |
| 8 | `RN-R13`'s ~88 B by its own method (`w199/bytes.ts`: one `v8.serialize` over `[inputs, log]` and over `[inputs, log, outputsCache]`) | **87.5 / 87.6 / 90.7 B an entry** at 10 / 100 / 1,000 instances — W195's C1 figures reproduced exactly, for `post` reading `ingest` and reading `work` alike |
| 9 | every composed payload and `ctx.needs` (`w199/payloads.ts`): every valid corpus flow, seven drains, a resume from every rest point | 182 lines captured as `payloads-before.jsonl` — the baseline decision 5 is held to |

## Verification

`npm run gate` before the readers; the two readers in their own worktrees; the readers' survivors re-cut by the author;
then `npm run gate:item` once, on the final tree. **Routing coverage**: a nested fan-out (Q6) — the corpus's
`nested-fanout`, `map-fanout` and `map-in-fanout`, and the constructed nested map (depths 0, 1 and 2); `user_action`
(Q17) — the corpus drains that park and resolve, the twelve-item drain resolving every other task last (an insertion
among later siblings), and the repeated settlement (an entry removed, then placed again); a branch routed away from its
join (Q4) — the corpus's `p1-routed-away`, every read equal to the oracle; no matching decision edge (Q10) — not
applicable: the index answers what a reference reaches, never which edge is taken; a duplicate task id (Q13) — not
applicable beyond fact 3, which the index's no-ties order rests on (re-take 3).

## Record

*Filled 2026-10-22, after both readers and the confirming gate.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 1** (scratchpad `w199/gate-1.log`) | every check and L1-L5 green in node and deno (89 files / 2,155); **chromium RED** — `the suite never reported: page.waitForFunction: Timeout 60000ms exceeded`: the WHOLE L1-L5 bundle runs in one page under 60 s (`scripts/run-browser-tests.mjs`), and the cost suite's new subject ran an iteration pass under every provocation on every shape (~65 s of suite in node). **Fixed**: a provocation the COUNTER is meant to see is judged on the counter's clauses over the shapes that discriminate it; the iteration pass runs for the subject and for the provocation it exists to see (the search uncounted). Suite 65 s → 32 s in node; `npm run test:browser` then EXIT 0, 89 files / 2,155 at parity; L6 not reached by that run (chromium is before it in the chain) |
| L1-L2 the equality suite, the cost subject | RAN — green | `test/driver/reference-index.test.ts` 10 cases; `test/fold/map-cost.test.ts` 9 (7 + 2); `retention.test.ts`'s alias claim; node, deno (`test:deno` EXIT 0, 89 / 2,155) and chromium |
| conformity reader | RAN | no BLOCKER; 2 SHOULD, 5 NIT — acted on below; its own differential: 312 seeded runs old `src/` against new, 0 differences in payloads, predicate arguments and fold inputs; 120 seeded constructed drains, 5,864 reads, 0 mismatches (a lexicographic-sort control: 17) |
| adequacy reader | RAN | 65 mutations; 28 green on `reference-index` of which the tick mutations (T1-T6, T8) are red on `map-cost`; SURVIVORS argued equivalent: X8, B3, T9, T10, G5, K7, V3, Dm3, Dm4, L5, T7, A1; REAL: P2, X1, X6, G2, C4 (and C9, a NIT) |
| the author's re-cut of the survivors (`w199/mut.mjs`, `mut1.log`) | RAN | P2, X1, X6, G2, C4 each **KILLED** after the new constructions; CONTROL clean; bytes restored and compared after each (SHA-256) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (scratchpad `w199/gateitem.log`) | lint; typecheck; every check, `check:docs` 51 `run`, `check:spec` C4 45; L1-L5 **89 files / 2,155 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,155); L6 **2,805 / 0 failed** over 228 real runs in node and deno; selftests **10/10 ok** (1,055.0 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and Status — `check:register`, `check:markdown`, `check:spec`, `check:budget` and `check:wiring` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `visibilityKey`; `outputIsVisible` restated | yes | case 1 (L1) against the pre-W199 body; K1-K8, V1, V2 killed |
| (2) the index in `outputsCache`, grown in `place` | yes | every equality case; P1, P3, P3a-c, X1-X7, G1-G4, B1, B2, B4 killed |
| (3) `resolveReference` reading it | yes | the cost subject's exact pins; L1-L6, C1-C6 killed |
| (4) `outputsCache.examined` | yes | map-cost case 6's pins; T1-T6, T8 killed there |
| (5) `test/driver/reference-index.test.ts` | yes | the oracle; the `l4-corpus` census counts its ten |
| (6) the cost subject, four shapes, its provocations | yes | case 6 and case 7; the census counts nine |
| (7) ADR 0124, spec v0.46 / v0.32, README rows, AGENTS.md, the retention alias | yes | `check:spec`, `check:register` (R8: ADR 0124 resolves Q735), `check:docs`; the alias claim |

**The numbers** (each size a fresh process, the session scratchpad's `w199/drv.ts`; before on `6006caa`, after on this
tree):

| shape | items | before, node | after, node | before, deno | after, deno |
|---|---|---|---|---|---|
| one step back (Q735's) | 2,000 / 8,000 / 16,000 | 701 / 22,033 / 99,029 ms | **68 / 223 / 442** | 474 / 12,006 / 64,208 | **79 / 258 / 560** |
| two steps back | 2,000 / 8,000 / 16,000 | 1,310 / 41,622 / 176,628 | **85 / 279 / 546** | 815 / 26,770 / 124,493 | **98 / 343 / 672** |
| nested map (reads at depths 1 and 2) | 2,000 / 8,000 | 18,251 / 290,697 | **178 / 661** (16,000: 1,246) | 16,881 / 323,427 | **214 / 868** (1,570) |
| sibling map, three slots | 2,000 / 8,000 | 52 / 178 | **51 / 145** (16,000: 266) | 59 / 206 | **53 / 180** (345) |
| `post` reading a one-output node | 2,000 / 8,000 / 16,000 | 68 / 215 / 399 | 66 / 216 / 438 | 76 / 257 / 538 | 76 / 255 / 517 |

The CPU profile at 8,000 items after (`w199/prof-after`): **flat** — `structuredClone` 14.0% + 8.9% (OR-R2's copy of
each result), GC 6.6%, `enter` 3.5%; no `outputIsVisible`, no filter, no `regionChainOf` in the top twelve.

**Counted** (`outputsCache.examined`, the suite's readings, every one EQUAL to its derived value): one step back
**4,000 / 16,000** (`2n`); two steps back **4,000 / 16,000** (`2n`); nested **14,000 / 56,000** (`7n`); sibling **8,000
/ 32,000** (`4n`) — 4.00x each. Iterations (the second observer), 2,000 → 8,000: 151,180 → 601,180; 197,310 → 785,310;
983,712 → 3,929,712; 113,845 → 449,845 — each below 4x.

**What it does NOT count**, timed once (the suite's own wall per subject, node, both passes, 2,000 + 8,000): one step
back ~1.0 s + 1.0 s, two steps back ~1.2 + 1.3, nested ~3.3 + 3.3, sibling ~0.6 + 0.6 — a reading, not a gate entry
(Q179).

**`RN-R13`** (`w199/bytes.ts`, RN-R13's method): `outputsCache` per entry, 10 / 100 / 1,000 instances — `post` reading
its own `work` (an index at depth 1): **87.5 / 87.6 / 90.7 → 95.8 / 93.9 / 97.1 B**, ~13 B per indexed entry; `post`
reading `ingest` (an index of one entry): 87.5 / 87.6 / 90.7 → 91.2 / 88.0 / 90.7. **P40 prediction 3 HOLDS**: the
holder sets and `DRIVER_FIELDS` did not move, and the figure rose by well under 2x.

**Payloads** (`w199/payloads.ts`): every composed payload and `ctx.needs` over every valid corpus flow under seven drains
— the six `log-view` uses and *an uncloneable result first* — each with a resume from every rest point: **182 lines,
byte-identical** to `6006caa`'s (`cmp`).

**Predictions.** P40 prediction 1 **HOLDS**: no existing assertion's expected VALUE moved in any lane — what moved is the
census (two suites' case counts, one suite renamed), and new cases. Prediction 2 **HOLDS**: 223 ms at 8,000 items
against 216 for a one-output read (within 2x), and 442 ms at 16,000 (under 1 s). Prediction 3 **HOLDS** (above).
Prediction 4 **HOLDS**: the sibling read is O(its answer), and the per-read sort restored is red on the EXACT pin alone
(7n against 4n, still 4x). Prediction 5 **HOLDS** for this item: no `FoldInput`, `RunState`, `snapshot()`, checkpoint or
public signature moved — **but one function was ADDED to the package surface**, the stop-and-ask below.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity | 1 SHOULD — the sort provocation's claim holds only for a COUNTED restoration; an uncounted one is seen by neither observer | **FIXED** — *counted* written in ADR 0124 consequence 4, the plan's (e1) record and the suite's header; an UNCOUNTED sort added as a CONTROL, asserted green — the stated limit measured |
| conformity | 2 SHOULD — `visibilityKey` is a new export; P40 decisions 5 and 7 say none | **DECLARED, and put to the maintainer** — the stop-and-ask below |
| conformity | 3 NIT — *a resume from every rest point* is over two drains | **FIXED** — ADR 0124 rule 3, `FD-C1`'s test text |
| conformity | 4 NIT — *seven drains (182 runs)* is the scratch harness's, not the suites' | **FIXED** — named as a measurement, its seven drains named |
| conformity | 5 NIT — 20.5 s and 22 s for one thing | **FIXED** — both named, Q735's and the re-take |
| conformity | 6 NIT — this file's Status stale | **FIXED** at this record |
| conformity | 7 NIT — ADR 0040's amendments counted two ways | **FIXED** — *after ADR 0117, 0118 and 0121*, P40 decision 6's list |
| adequacy | P2 / X1 SHOULD — `place`'s replacement never reached with an index built | **FIXED** — a repeated `done` with a new result, at depth 0 (a group's middle) and depth 1, read after; both KILLED |
| adequacy | X6 / G2 SHOULD — insertion only ever at a group's front | **FIXED** — groups built EARLY at depths 0 and 1, twelve settled scrambled, the whole index compared after each; X6 KILLED, and G2 too (a replacement looks up an existing path — not equivalent) |
| adequacy | C4 SHOULD — the edge site's reader id undiscriminated | **FIXED** — `h`'s edge reads `["leaf"]` at depth 1 where `leaf`'s chain is 2; KILLED |
| adequacy | note 1 SHOULD — no cost pin on the edge site | **DECLARED** — both sites read ONE lookup, the one the count and provocations sit on; an edge-only restoration is seen by the equality suite's read hook and counts; stated in the cost suite's header |
| adequacy | note 2 / C8 — an UNTICKED restoration in `src/` runs unbounded in the counter's pass: C8 (the old filter at `compose` alone, no tick) ran **20 minutes** against the cost suite and was killed by the reader's harness timeout, no case reporting | **DECLARED** — the stated limit, in the suite's header (W197's same shape: *a cost no observer counts has nothing to stop it in the counter's pass*); the equality suite kills C8 in 1 s (its read counts) |
| adequacy | A1 / T7 NIT — `one`'s first-by-path undiscriminated | **DECLARED equivalent** — several survivors for a `one` read is unreached (ADR 0124 consequence 6, measured by case 8) |
| adequacy | C9 NIT — the edge site's eager catch-up unobserved | **DECLARED** — unchanged behaviour, kept as it was |
| adequacy | K2 / A3 NIT — one witness each | **DECLARED** |

**What broke.** At a rung: **the chromium lane** — the cost suite's new subject pushed the one-page bundle past its 60 s
limit; no rung names a suite's WALL as a budget, and the lane's limit is the bundle's, so a suite's cost is a share of a
budget nobody sees until it is spent (found by `npm run gate`, before the readers). The readers found what the author's
set did not: the replacement arm and the in-order insertion unreached, the edge site's reader id undiscriminated.

**What this taught.** *For the retro*: **a count's provocations each need a second observer only where the count cannot
see them** — running every observer under every provocation on every shape is what cost the 60 s; judging a counted
provocation on the counter and an uncounted one on the iteration observer kept every verdict and halved the suite. And
**a corpus with no reference between two nodes sharing a region** (every corpus read is at depth 0, measured) means the
index's interesting depths are constructed or nothing.

**Questions raised.** None (Q740-Q744 SPENT, unissued). **Closed.** [Q735](../questions/q735.md) — by ADR 0124 and the
count in the gate. **Record step**: ADR 0124 written; ADR 0040 rule 2 dated; Q735 resolved; dated notes on
[Q186](../questions/q186.md) and [Q221](../questions/q221.md); P40's stop-and-ask (e) recorded (e1). The plan's Record is
the last item's (W200).

**The readers' overlap.** **ONE** — a restoration that TICKS NOTHING: the conformity reader's finding 1 (an uncounted
per-read sort is seen by neither observer) and the adequacy reader's note 2 (an unticked restored search runs unbounded
in the counter's pass) — one subject, its visibility and its wall. Every other finding was one reader's alone.

### Stop-and-ask — ANSWERED (a) by the maintainer 2026-10-22: `visibilityKey` joins the package surface

P40 decision 2 puts the one key function in `src/definition/regions.ts`; `index.ts` re-exports that module WHOLE, so the
function is PUBLIC; decisions 5 and 7 say the public surface does not move ("none"). Both cannot hold. W191's
`innermostMapOf` is the precedent (ADR 0118 rule 4, *additive*, stated in `spec/README.md`), and Q221's icebox note
(*reopen at a fourth occurrence*) is now met twice. (a) **Accept it ADDITIVELY** — as written: ADR 0124 consequence 5,
`spec/flow-definition.md` v0.46 and README state it; 0.9.1 stays a patch by (d)'s reading (no existing signature
moves). *Recommended* — one simple decision, W191's precedent. (b) Move the function to a module `index.ts` does not
re-export — needs `deno.json`'s publish list (outside `Owns`) and rewrites decision 2's "in regions.ts". (c) Accept (a)
and reopen Q221 (status icebox → open), since its condition is met.
**Answered (a)**, 2026-10-22: `visibilityKey` is accepted as an ADDITIVE export, W191's `innermostMapOf` precedent —
ADR 0124 consequence 5, `spec/flow-definition.md` v0.46 and the spec README row state it, and 0.9.1 stays a patch.
[Q221](../questions/q221.md) stays iceboxed. No file moved for the answer beyond this section and the Status line.
