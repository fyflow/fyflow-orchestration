# W214 — The chromium lane's headroom: the map-cost suite's smaller pair in the browser

**Status:** done 2026-10-24 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; no stop-and-ask, no exception used, no ADR, no question raised. Earlier: declared 2026-10-24 on `61b0344`, P44's FIRST item: (d1); decision 1; fact 7; this file written from the plan's row BEFORE any other edit
**Plan:** [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md) — *what does a join hand on, and
how does a key path reach into it?* — and this is its FIRST item: P43's retro (b), *the chromium lane at ~57 of 60 s*,
routed here by the maintainer's (d1).

```
Spec:       spec/runtime-targets.md v0.13 -> v0.14 ONLY if RT-R1's sentence moves (decision 1: "if W214 judges RT-R1's
            sentence moved"); spec/README.md's row with it.
Owns:       from P44's W214 row, exactly: test/fold/map-cost.test.ts; test/harness.ts (only if a runtime test is added
            there); spec/runtime-targets.md (v0.14, only if RT-R1's sentence moves); spec/README.md (if a version moves);
            this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files (P44's plan
            file is not touched — its Record is W218's). test/definition/l4-corpus.test.ts names the suite by its
            title and counts its nine cases: the title and the case count are NOT moved, so that file is READ, never
            written. The two sibling suites (test/fold/input-of-cost.test.ts, test/fold/reference-copy-cost.test.ts)
            are READ, moved only if the measurement says so — and moving them is a STOP-AND-ASK, being outside Owns.
            Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P44 decision 1, fact 7, (d1); scripts/run-browser-tests.mjs (the 60 s wait, RT-R1's parity by count);
            W210's in-page wall harness (scratchpad p44/chromium-wall.mjs); the suite's own derivations of n.
Outputs:    (1) test/fold/map-cost.test.ts — SMALL / LARGE chosen by host: 500 / 2,000 in a browser, 2,000 / 8,000 in
                node and deno; the host read as five other suites read it (`typeof document`); the SAME nine cases in
                all three runtimes, the suite title and every case title unmoved; every assertion message that printed
                a literal count at 2,000 / 8,000 computing it from the pair instead; a guard that the pair is 2,000 /
                8,000 wherever node or deno is detected by a second, independent observer; the header stating what
                the browser no longer runs (8,000 items) and why that is the same claim (clock-free counts, formulas
                of n, the ratio for 4x the items).
            (2) spec/runtime-targets.md v0.14 and spec/README.md — RT-R1's sentence, if it moves (judged at the edit,
                stated in the Record either way).
            (3) the chromium in-page wall before and after, and the suite's share, in the Record.
Depends on: nothing — (a)-(f) answered
Blocks:     W215
Tests:      Outputs (1). L1-L2 in node, deno and chromium: the suite's 9 cases at 2,000 / 8,000 in node and deno and
            at 500 / 2,000 in chromium, every exact count its hand-derived formula at both sizes (fold 13n + 9, driver
            n + 2 and 3n + 4, runtime 5n + 6 inputs and 13n + 16 work, reference 2n / 2n / 7n / 4n), the provocations'
            verdicts unmoved at the smaller pair; the parity count 2,267 in all three. Expected values from the
            suite's own derivations, evaluated by hand at 500 and 2,000 below, written before the first run.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs
            or doc/questions/README.md); `npm run gate` on the B′ draft and before the readers (sentence C); the
            chromium in-page wall re-taken before and after (the harness), the suite's share stated; a provocation:
            the browser pair forced back to 2,000 / 8,000 restores the wall (the change is what moved it); then the
            conformity reader and the adequacy reader, workflow section 6, scaled to the item's size.
Reserves:   Q780-Q781, ADR 0135 (expected unused, decision 1)
```

## Scope

**In**

1. **The browser pair** — Output (1).
2. **RT-R1's sentence, if it moves** — Output (2).
3. **The wall, before and after, and its provocation** — Output (3).

**Out** — named rather than left implicit, with where it goes instead

- **Raising `scripts/run-browser-tests.mjs`' 60 s wait** — refused by decision 1 (the wait stays a hang detector).
- **The two sibling 2,000 / 8,000 suites** — re-taken (the plan's *Re-takes*), moved only on a stop-and-ask.
- **The suite's title and case titles** — `test/definition/l4-corpus.test.ts` binds the title; unmoved.
- **W215-W218** — the plan's later rows.

## Hand-derived values at the browser pair (written before the first run)

From the suite's own derivations (each beside its assertion), evaluated at n = 500 and n = 2,000:

| subject | formula | 500 | 2,000 | 8,000 |
|---|---|---|---|---|
| fold, counted work | 13n + 9 | 6,509 | 26,009 | 104,009 |
| driver, plain | n + 2 | 502 | 2,002 | 8,002 |
| driver, with `needs` | 3n + 4 | 1,504 | 6,004 | 24,004 |
| runtime, inputs delivered / applied | 5n + 6 | 2,506 | 10,006 | 40,006 |
| runtime, counted work | 13n + 16 | 6,516 | 26,016 | 104,016 |
| reference, one / two steps back | 2n | 1,000 | 4,000 | 16,000 |
| reference, nested map | 7n | 3,500 | 14,000 | 56,000 |
| reference, sibling map (3 slots) | 4n | 2,000 | 8,000 | 32,000 |

The reference ratios are exactly 4x; the affine ones just under it (fold 3.996 at 500 / 2,000 and 3.999 at 2,000 / 8,000,
driver plain 3.988 at 500 / 2,000, runtime 3.993) — every one under the 6x line. *(This read "each ratio is exactly 4x"
until the conformity reader's NIT 4.)*

## Predictions, written before the change

1. **P44 prediction 1**: the chromium lane under 35 s in the page; no case count moves in any runtime (2,267).
2. The provocations' verdicts are unmoved at the smaller pair (P44 fact 7: the nine cases green in node and all 2,267
   in chromium at 500 / 2,000).
3. The two sibling suites need nothing (the plan: 1.1 s and under).

## Verification

`npm run gate` on the B′ draft in a byte copy before the `Owns` are fixed; the chromium wall by W210's harness on the
starting tree and on the change, and on the change forced back to 2,000 / 8,000 (the provocation); `npm run gate` before
the readers; the two readers in their own worktrees under `C:/tmp-w214/`; then `npm run gate:item` once, on the final
tree, held still. **Routing coverage**: not applicable — the item moves a test's sizes and no routing; no `user_action`
(Q17), map semantics (Q6), routed-away branch (Q4), unmatched decision (Q10) or task id (Q13) moves.

## Record

*Filled 2026-10-24, after both readers. Harnesses and logs in the session scratchpad's `w214/` (`chromium-wall.mjs`,
`chromium-wall-fail.mjs`, `walls.sh`, `walls-fail.sh`, `spec-edit.mjs`, `gate-m1.log`, `gate-main.log`, `gateitem.log`,
`wall-*.txt`); the readers' in `C:/tmp-w214/rc-scratch` and `C:/tmp-w214/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — the change (suite, spec v0.14, `spec/README.md`, this file) built in the byte copy `C:/tmp-w214/m` and every lane run before the `Owns` were fixed | RAN — `npm run gate` **EXIT 0**, 22:56:45 → 23:01:40 (`w214/gate-m1.log`) | L1-L5 **100 files / 2,267 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; L6 **2,861 / 0** over 246 real runs in node and deno. The `Owns` held as declared |
| `npm run gate` on the author's tree before the readers (sentence C) | RAN — **EXIT 0**, 23:07:34 → 23:14:30 (`w214/gate-main.log`) | the same counts |
| the chromium in-page wall, before and after, interleaved (`w214/walls.sh`, W210's harness) | RAN | below |
| the provocation: the browser pair forced back to 2,000 / 8,000 in the copy, restored by digest | RAN, three times | the wall comes back (below); and the suite goes RED in chromium, one case — the membership case's pair guard, *expected [500,2000], actual [2000,8000]* (`wall-r3-provoked.txt`, the harness variant that prints failures) |
| conformity reader (`C:/tmp-w214/rc`) | RAN | 0 BLOCKER, 3 SHOULD, 4 NIT, below; re-derived every pin at 500 / 2,000 / 8,000 and OBSERVED them by a probe in all three runtimes (chromium `[500, 2000]`, node and deno `[2000, 8000]`; the bundle shims neither `process` nor `Deno`) |
| adequacy reader (`C:/tmp-w214/ra`) | RAN | 17 claim probes: **12 KILLED**, 0 CRASH, 5 SURVIVED (all equivalent or out of reach, below); the positive control survived; 4 margin probes; parity provoked (`PARITY FAIL chromium ran 2266`) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 2026-10-24 23:40:28 → 2026-10-25 00:08:05 (`w214/gateitem.log`) | lint; typecheck; every check; L1-L5 **100 files / 2,267 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,861 / 0 failed** over 246 real runs in node and deno; selftests **10/10 ok** (1,218.4 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this row alone — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on it |

**The chromium wall — and the finding under it: the lane's wall is a STATE OF THE MACHINE, not a constant.** On this
laptop (i7-12700H) the same bundle at the same commit measured **51.3 s, 30.2 s, 21.8 s and 21.3 s** in four consecutive
runs on `61b0344`, with nothing else running; later the provoked bundle measured 22.7 s, 24.0 s and then **58.1 s**. Fact
7's 57 s and W211's 56-57 s are the SLOW state; the fast one is ~21 s. **The suite's SHARE is the quantity that holds**:

| tree | state | in-page wall | the map-cost suite | its share |
|---|---|---|---|---|
| `61b0344`, before | slow | 51.3 s | 36.0 s | 70% |
| `61b0344`, before | fast (six runs) | 20.6-21.8 s | 10.2-11.1 s | ~50% |
| the change, after | fast (three runs) | 13.5-16.4 s | 2.9-3.4 s | ~21% |
| the change, after | mixed (one run) | 23.5 s | 8.8 s | 38% |
| the change, after — P44 fact 7's own measurement of the same pair at the declaration | slow | 31.9 s | 8.8 s | 27% |
| provoked: the browser at 2,000 / 8,000 again | fast (two runs) | 22.7 s, 24.0 s | 10.9 s, 12.2 s | ~49% |
| provoked | slow | 58.1 s | 35.8 s | 62% |

The change takes ~7-8 s off the lane in the fast state and ~25 s in the slow one, and the provocation puts it back in
both. *No "after" was caught in the slow state by this item; fact 7 measured exactly this pair in it.* **The two sibling
suites, re-taken**: `input-of-cost` 1.1-1.2 s and `reference-copy-cost` **1.7-2.5 s fast, 6.4 s slow** — the plan's D′
bullet says *1.1 s and under*, which is true of the first only (fact 7 itself lists the 6.1-6.5 s). With the lane at
~32 s in the slow state, neither needs moving (prediction 3 HOLDS in substance), so no stop-and-ask.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the browser pair, the host read by `document`, the guard by a second observer, the header | yes | the membership case's guard (adequacy m01-m04, m10, m12 KILLED in the runtime each is about); the wall (m03, the provocation) |
| (1) the messages computed from the pair | yes — each prints the formula at the sizes that ran, BESIDE both pairs' literals (conformity NIT 6: the literals stay, hand-derived, as a reader's check) | m15, m16 KILLED in chromium |
| (2) `RT-R1`'s sentence moved, spec v0.14, `spec/README.md` | yes — judged MOVED (both readers' agreement: section 4 note 1's *a suite that had to branch on its host would defeat the point* otherwise stood uncontradicted) | `check:spec` C8 (the README's version column) |
| (3) the wall before and after | yes, above | — |
| ADR 0135 | **not written** — decision 1 needs none. SPENT, unissued | — |
| `test/harness.ts` | not touched — no runtime test added there (the host is read in the suite, as five others do) | — |

**Predictions.** 1 **HOLDS as written and is weaker than it reads**: under 35 s in the page in every state measured
(31.9 s slow, 13.5-23.5 s otherwise), and no case count moved (2,267 in all three) — but the baseline itself was 21 s in
the fast state. 2 **HOLDS**: every provocation's red set unchanged at 500 / 2,000 (chromium green; the conformity reader
read each provocation's readings) — two by a thinner margin, the adequacy reader's SHOULD below. 3 **HOLDS in substance**,
its *1.1 s and under* false for `reference-copy-cost` (above).

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | section 4 note 1's new parenthetical — *two kinds of suite read their host, and neither branches its claim* — is false: SIX suites read it (runtime skips; envelope-worker and transform substitute the `class` backend; jsonata runs none; function-table skips its source-equality check) | **FIXED** — the note names the six and what each does; the v0.14 entry with it |
| conformity SHOULD 2; adequacy NIT 1 | the suite title and case 0's title print *2,000 and 8,000* in a browser running 500 / 2,000 | **NAMED** in the header (the titles name the node and deno pair; `l4-corpus.test.ts` binds the title, outside `Owns`). Not renamed |
| conformity SHOULD 3 | the header cites this Record before it existed | **FIXED** by this Record (the re-take above) |
| conformity NIT 4 | *each ratio is exactly 4x* — the affine ones are 3.988-3.999 | **FIXED** above |
| conformity NIT 5 | *every count it pins is a formula of `n`* — the suite pins constants too (visits 0 and 3, one materialisation) | **FIXED** — *every count that grows with the run*, in the header and the spec note |
| conformity NIT 6 | two messages carry both pairs' literals beside the interpolation | **DECLARED** (Outputs above) |
| conformity NIT 7 | `spec/flow-definition.md:1830` and ADR 0124 consequence 4 say *pinned exactly at 2,000 / 8,000* — now true in node and deno only | **DECLARED** — outside `Owns`, still true where it is run at those sizes; `RT-R1`'s row states the exception |
| adequacy SHOULD | at 500 / 2,000 two sparse uncounted provocations are red by RATIO alone — the driver's uncounted scan (plain) 7.07x against 6, the reference filter 9.2x — where at 2,000 / 8,000 they cross the ceiling; thinned 4x, each goes green in chromium alone (m17, m18) | **NAMED** — in the suite header and here; not re-tuned (each is deterministic, the iteration counts are engine-independent, m21) |
| adequacy NIT 2 | the pair guard sits in the case titled *every case this suite declares actually ran* | **DECLARED** — a tenth case would move the census `l4-corpus.test.ts` holds; the message names the cause |
| adequacy survivors m04/m05 (deno), m06, m07, m11 | one observer clause alone identifies deno (deno 2.9.6 has `process.versions.node`); the guard made a tautology; 400 / 2,000 with the guard off (5x, still under 6x) | **DECLARED** — equivalent (m04, m05, m11) or out of reach of any L1-L5 assertion (m06, m07: nothing checks the guard itself) |

**Decisions taken by this item** (within decision 1): the host read in the suite by `document`, not in
`test/harness.ts`; a second observer for the guard; the guard in the membership case, so no case is added and the suite's
title, case titles and census are unmoved; `RT-R1` judged moved; no ADR.

**What broke.** At no rung. Two of this item's own sentences were false on the first green tree (the spec note's *two
kinds*, the item's *exactly 4x*), found by the conformity reader by grep and arithmetic.

**What this taught.** *For the retro*: **a wall is a property of a machine STATE as well as a machine** — the same
bundle measured 21 s and 51-58 s within the hour on one laptop, so fact 7's *~57 of 60 s* and prediction 1's *under 35 s*
were statements about one state. A headroom claim is stated as a SHARE, with the states it was measured in
([Q179](../questions/q179.md)'s *a cost is a property of a machine*, one level in). And a smaller size thins a sparse
provocation's margin before it thins any pin.

**Questions raised.** None — Q780-Q781 SPENT, unissued. **Closed.** None. **ADR 0135** SPENT, unissued. **Declared
exceptions**: none used — `l4-corpus.test.ts` and the sibling suites read, not written.

**The readers' overlap.** **ONE** — the titles that print the node and deno pair in a browser (conformity SHOULD 2,
adequacy NIT 1): one subject, the same finding.

**Leftover worktrees.** `C:/tmp-w214/m` (the B′ copy), `rc` and `ra` (git worktrees at `61b0344` with the pre-reader
change applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with `C:/tmp-w214/rc-scratch` and
`ra-scratch` — left for the maintainer; not removed with `--force`.
