# W197 — the cost check in the gate, the exit artifact, and the reply to fyflow-app

**Status:** done 2026-10-21 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; 19 provocations KILLED, none surviving; Q735 raised. Earlier: declared 2026-10-21 on `4659768` (W196 committed, the tree clean); P39's LAST item: stop-and-ask (e), the exit artifact's three clauses and the reply; the declaration step RUN before any edit (below)
**Plan:** [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) — *what does a step cost on a long
run, and where may its owner read the run's live state?* — and this is its LAST item: fyflow-app pass 2 #3, the exit
artifact, and the reply.

```
Spec:       none moves — this item holds W194's RN-R43 and W195's and W196's costs as counts; spec/README.md untouched.
Owns:       from P39's W197 row, exactly: test/fold/map-cost.test.ts (new), test/definition/l4-corpus.test.ts,
            src/fold/accumulator.ts and src/driver/driver.ts (the counters ONLY — neither edited: both counters are read
            as W194 and W195 placed them), examples/map-cost.ts (new), examples/l6.ts (the WHOLE file, sentence D′),
            examples/README.md, examples/flows/** and examples/workers/** (neither edited: the block writes its registry
            and flows in itself); OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping (the Status line's count of plans run, section 6's overlap ordinal, the ledger's first row), by the
            coordinator's brief for this item, P38's close (e928212) the precedent. The record step's four files carry
            P39's Record and retro, the question this item raises and any dated note. Anything else found to need an edit
            is a STOP-AND-ASK, never an edit.
Inputs:     P39 stop-and-asks (a)-(f) ANSWERED as recommended; P39's exit artifact and W197 row; W194's, W195's and W196's
            Records — their counters (FoldCounter through foldWith; taskLog.visits; no counter in the runtime, ADR 0122
            consequence 5), their measured tables, and their notes for W197; test/driver/result-schema-cost.test.ts (the
            counts precedent); Q179; Q186.
Outputs:    (1) test/fold/map-cost.test.ts — the COUNTED work of a `map` run at 8,000 items below 6x its work at 2,000
                (linear 4x, quadratic 16x), and PINNED EXACTLY at both sizes to values derived by hand from the counted
                code's tick sites: `fold` over a map with an `attempted` element per task, 13n + 9; the driver, an
                `attempted` element per task, n + 2 plain and 3n + 4 with a `needs` read per settlement, and 3 for a
                user_action then its resolution; a runtime run, an `attempted` element per task, whose consumer reads
                `outcome()` and `node()` after every input once the handle exists, one settlement per macrotask turn —
                5n + 6 inputs each applied once, ONE materialisation, 13n + 16 counted. And for EVERY subject a SECOND
                pass under an ITERATION observer, independent of every counter (W194's adequacy reader's open case,
                widened by W197's to the driver and the runtime): Map/Set iterator steps and `forEach`,
                `Object.keys/values/entries` and the Array methods that walk an array, its ratio below 6x.
            (2) the provocations, CHECKED IN as cases of that suite (workflow section 5 rule 7), ONE site each: the
                spread-per-step restored in the fold; a re-tally outside `precedence()` with its ticks removed; the
                whole-log scan restored in the driver's view, counted and UNCOUNTED; `outputs()` rebuilt per call;
                `current()` inside the runtime's `take`; `done`'s predicate materialising, alone; the consumer's
                `outcome()` materialising, alone; an uncounted O(run) search per runtime input — each asserting that it
                RAN and the EXACT set of clauses it turns red, none running unbounded (every observer reads against a
                CEILING and stops).
            (3) examples/map-cost.ts — the app's repro re-taken on the final tree, node 24 and deno, `fold`, the
                driver with and without `task.running`, and a runtime start to done, 1,000 to 16,000 items, each size a
                fresh process, printed beside P39 facts 1 and 4 and W196's table. A measurement, NOT a gate entry (Q179).
            (4) one L6 block in examples/l6.ts, `W197 exit`, node 24 and deno, a threaded and an inline pool: P39's
                exit clause (3). X10 moved by this block alone.
            (5) the reply to fyflow-app (P39's "The reply" paragraph), once this item's gate is green.
Depends on: W196
Blocks:     nothing — P39's Record and retro follow
Tests:      Outputs (1), (2) and (4) are the tests. The suite runs in all three L0-L5 runtimes.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29); L6 in node 24 and deno; then the conformity
            reader and the adequacy reader, workflow section 6.
Reserves:   Q735-Q739, ADR 0123 (expected unused)
```

## Scope

**In**

1. **The standing check** — Outputs (1), (2): P39 (e)'s sizes; W194 and W195 held their own at 500 / 2,000 at birth.
2. **The exit artifact** — Outputs (3), (4).
3. **The reply** — Outputs (5).

**Out** — named rather than left implicit, with where it goes instead

- **A wall-clock budget or a clock ratio in the gate** — refused, P39 (e), Q179.
- **Any change to what the counted code does** — W194-W196's; this item places no logic and edits no counter site.
- **The reference SEARCH this item's wall found** (a `needs` read inside a map instance filtering every output of the
  named node) — RAISED, [Q735](../questions/q735.md): the fix is in `resolveReference` and ADR 0044's visibility rule,
  outside every P39 row; the reply names it.
- **The 0.9.0 version bump and publish** — the maintainer's, after P39's Record.

## What the declaration step re-took, before anything was edited

*P15 decision 5: every fact is re-run by the item that acts on it. Taken 2026-10-21 on `4659768`, the tree clean.*

| # | re-take | measured |
|---|---|---|
| 1 | the ladder counts — `npm run gate` on `4659768`, EXIT 0 (scratchpad `w197/gate-base.log`) | L1-L5 **87 files / 2,134 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,134); L6 **2,789 / 222, 0 failed** in node and deno; `check:docs` 51 `run`; `check:spec` C4 45 |
| 2 | the counters W194 and W195 placed, and whether either is observable through a public surface (P39 decision 6) | `FoldCounter` is an ARGUMENT of `foldWith` / `stepWith` in `src/fold/accumulator.ts`, which neither `index.ts`, `src/scheduler/index.ts` nor `src/jsonata/index.ts` re-exports and `deno.json`'s `exports` does not name; `taskLog.visits` is a field of `TaskLog`, a class no module exports, held in a TS-`private` field of `Driver` — reachable by a cast, named by no public TYPE (ADR 0121 rule 7, as W195's C7 corrected it). The runtime has none (ADR 0122 consequence 5). **Both read as placed; no counter site edited** |
| 3 | the three subjects at 2,000 / 8,000 items, counted, before any provocation — the suite AS FIRST BUILT, its fold and runtime arms with no `attempted` element (they gained one after the readers: the Record) | `fold` **22,009 / 88,009** (4.00x); the driver **2,002 / 8,002** plain and **6,004 / 24,004** with `needs` (4.00x each); a runtime **22,014 / 88,014** counted, 8,005 / 32,005 inputs, ONE materialisation each (4.00x); the fold's iteration observer **4,011 / 16,011** (3.99x). Each the value derived beside its assertion |
| 4 | P39 facts 1 and 4 on the tree that ships — `examples/map-cost.ts`, each size a fresh process | the Record's table, node 24.20.0 and deno 2.9.6 |

**M1 — the `needs` arm's WALL, found while sizing the suite.** W195's count flow, run at 8,000 items, took **10.9 s**
where its plain arm took 0.1 s — with `taskLog.visits` exactly linear. A CPU profile: **89% `structuredClone`** — `post`
read `ingest`, whose result held the `n` items, so every read cloned an `n`-element list ([Q186](../questions/q186.md)'s
cost, deferred, decided *nothing warns*). Pointed instead at its own instance's `work` (a small value), the wall was
**WORSE — 20.5 s at 8,000, 96.9 s at 16,000** — and the profile named `outputIsVisible` and `resolveReference`'s filter:
a reference read inside a map instance searches every output of the named node. **Raised as Q735** (not small: ADR 0044's
resolution). The suite's driver flow puts the items in a `list` task before the map, so `post` reads one small output:
68 / 215 / 394 ms at 2,000 / 8,000 / 16,000 (scratchpad `w197/drv-time3.ts`).

## Verification

`npm run gate` before the readers; the author's provocations in a byte copy; then the two readers; then `npm run
gate:full` once, on the final tree. **Routing coverage**: not applicable beyond the `map` flows the cost suite and the L6
block drive — a nested fan-out (Q6), a branch routed away from its join (Q4), no matching decision edge (Q10) and a
duplicate task id (Q13) are NOT in the cost suite or the block, stated; `user_action` (Q17) — the driver case's parked
settlement and its resolution, counted 3.

## The author's provocations

`mutate.mjs` (kept with its logs in the session scratchpad, `w197/`) in the byte copy `C:/tmp-w197/m` (a worktree of
`4659768` with this diff applied, `node_modules` copied, `find -type l` 0 and no reparse point, green before use; node
24.20.0 asserted at the head of each run): each probe edits ONE clause of the SOURCE, its anchor checked to occur once in
the CURRENT text; every file restored from its FIRST snapshot and its SHA-256 compared after every probe and at the end;
graded on the FAIL lines against the SET of cases (`node test/runner.ts fold/map-cost`) or `W197 exit` claims (`node
examples/l6.ts`) each probe DECLARES, matched EXACTLY (rule 7 (c)): KILLED, WRONG-SET, SURVIVED, CRASH, NO VERDICT.
**Grader controls**: CONTROL CLEAN, GRADER-CRASH CRASH, GRADER-WRONG-SET (Q07's edit declared against the runtime)
WRONG-SET.

| pass | probes | result |
|---|---|---|
| before the readers (`mut1.log`, `mut1-l6.log`) | 16 + 3 controls | 11 of 12 suite probes KILLED with their exact sets, Q05 (the scan UNCOUNTED) the declared survivor; of the four L6 probes ONE exact, three WRONG-SET — each red on its declared claims and on more, and **L01 (`state()` not frozen) left its own claim, *every read frozen*, GREEN** (the conformity reader's finding 2, met here independently). Q01 took **216 s**: the driver arm's arrangement check was an uncounted `fold` |
| after the readers (`mut2.log`) | 20 + 3 | every probe red; 14 WRONG-SET, each on cases its declaration did not name and each EXPLAINED: the runtime case and its provocations read the driver and the accumulator too, so they see their defects (Q02-Q05, Q08-Q14); a stacked provocation's verdict moves with a broken source (Q06); a cache never dropped never shows the nested results (L04 on the freeze floor) |
| re-declared, final (`mut3.log`) | **19 + 3** | **19 KILLED, 0 SURVIVED**, controls CLEAN / CRASH / WRONG-SET, no NO VERDICT, no ABORTED, digests equal |

The clauses, by id: Q01 `RN-R43`'s materialise-once (W194's P35, in `foldWith`); Q02 a re-tally outside `precedence()`
with its ticks removed (W194's open C4, at every outcome); Q03 a tick that counts nothing; Q04-Q05 the whole-log scan in
`TaskLog.of`, counted and UNCOUNTED (the adequacy reader's D1); Q06 `outputs()` never cached; Q07 a count of calls; Q08
`current()` in `take`; Q09 `isTerminal(current())` in `done`'s predicate; Q10-Q11 `outcome()` and `node()` through
`current()`; Q12 an input applied twice; Q13 an uncounted O(run) search per input (the adequacy reader's R9); Q14 opened
membership by `lastIndexOf` (F5); Q15 the `attempted` arm re-tallying, counted (F13); L01 `state()` not frozen; L02 `done`
a different object; L03 a resume's stored events not applied — red on all six of the block's resume claims AND on every
other L6 block that resumes a run (W90's, W94's, W176's, W182's); L04 the cache never dropped.

## Readers (2026-10-21), and what was acted on

*Both readers ran in their own worktrees (`C:/tmp-w197/rc`, `C:/tmp-w197/ra` — `4659768` plus this diff, `node_modules`
copied, no links), spec first; each reported and fixed nothing. The author's tree held still while they read; the
author's own L6 probes ran in the third copy.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | C1 SHOULD — the *done's predicate* provocation was COMPOUND (sentence E): wrapping `outcomeNow` also restored a materialisation in the consumer's every `outcome()` read | test | **FIXED** — re-cut by CALL SITE: the predicate alone (no consumer read on the stack) and the consumer's `outcome()` alone, two provocations; Q09 and Q10 KILLED in the source set |
| conformity | C2 SHOULD — the L6 claim *every read frozen* could not fail on its own: a freeze regression landed on the equality claim's `why` | test | **FIXED** — every claim carries its own verdict: the first unfrozen path and the most objects a read walked (22 at least, derived); the writes, the throws and the reads a write MOVED; the resumed run's first read walked deep, not top-level. L01 KILLED with the claim red |
| conformity | C3 NIT — *after EVERY input* is one input short (`ingest`'s dispatch precedes the handle) | doc | **FIXED** — *once the handle exists*, at every site |
| conformity | C4 NIT — `examples/map-cost.ts`'s *L0 and nothing else* | doc | **FIXED** — `l6.ts`' construction clause reads its text |
| conformity | C5 NIT — the header's one-burst sentence garbled | doc | **FIXED** |
| adequacy | gap 1 SHOULD — the iteration observer blind to arrays and objects (F5 `lastIndexOf`, F6 `for…of`, F7 an array spread, F12 an object spread) | test | **FIXED in part** — `lastIndexOf`, `findLast`, `findLastIndex`, `reduceRight`, `flat`, `slice`, `concat` and `join` patched (Q14 KILLED); **F6, F7, F12 the STATED LIMIT** — patching `%ArrayIteratorPrototype%.next` was MEASURED: the rest of the suite's run broke outright (exit 1 in 6-13 s), so it is not done |
| adequacy | gap 2 SHOULD — no second observer on the driver (D1, D4, D8, D9 survive) | test | **FIXED** — the driver runs a second pass under the iteration observer; the uncounted scan is now a provocation, red on it ALONE (Q05 KILLED); **D8 and D9 — a linear search or a whole-log walk by INDEX LOOP — the stated limit**, as F6 |
| adequacy | gap 3 SHOULD — a source regression ran for minutes (F1 225 s; F11, D6 past 300 s) | test | **FIXED where it was the harness's**: the driver's arrangement check reads its last element instead of folding (Q01 216 s → 6 s); each iteration pass keeps the counter's ceiling as a STOP (an `outputs()` rebuild per read was 81 s in it). **What stays**: a cost no observer counts has nothing to stop it in the counter's pass — the in-suite uncounted provocations are therefore SPARSE (every 64th outcome, 16th read, 16th input), each still O(run) per occurrence; stated in the suite |
| adequacy | gap 4 SHOULD — no counted subject applied an `attempted` input (F13 survives) | test | **FIXED** — the fold's map gains one per task (`13n + 9`, re-derived), the runtime's drive fires `task.running` with attempt 1 (`5n + 6` inputs, `13n + 16`, re-derived); Q15 KILLED |
| adequacy | gap 5 SHOULD — no observer on the runtime beyond the accumulator (R9 survives) | test | **FIXED** — the runtime runs a second pass under the iteration observer; R9's shape is a provocation, red on it ALONE (Q13 KILLED) |
| adequacy | gap 6 NIT — the L6 freeze claim carries nothing | test | **FIXED** — conformity C2, above |
| adequacy | gap 7 NIT — the iteration observer's RATIO clause never provoked alone (H5) | — | **DECLARED** — every quadratic provocation crosses the ceiling first at these sizes; a growth above 6x yet under the ceiling is a narrow window no shape here falls in |
| adequacy | gap 8 NIT — `state()`'s read-side `catchUp()` unobservable (R6b) | — | **DECLARED** — W196's D27, equivalent by `RN-R22` |

## Record

*Filled 2026-10-21, after both readers and the provocations' final pass.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0** (scratchpad `w197/gate-1.log`) | L1-L5 **88 files / 2,142 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,142); L6 **2,805 / 228, 0 failed** in node and deno — the block green on its first run; `check:docs` 51 `run`, X10 2 copies at 2805 / 228 |
| L1-L2 the cost suite | RAN — green | 7 cases, ~7 s in node; deno and chromium in the gates |
| L6 the `W197 exit` block | RAN — green | 16 claims over 6 runs, node and deno, threaded and inline |
| conformity reader | RAN | 2 SHOULD, 3 NIT, no BLOCKER — every one fixed |
| adequacy reader | RAN | 42 mutations, 28 killed, 14 survived — ten real gaps, acted on above |
| the author's probes | RAN, three passes | **final: 19 probes + 3 grader controls — 19 KILLED, 0 SURVIVED** |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command (scratchpad `w197/gatefull.log`, 3,211 s) | lint; typecheck; every check, `check:docs` 51 `run`, `check:spec` C4 45; L1-L5 **88 files / 2,142 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,142); L6 **2,805 / 228, 0 failed** in node and deno; selftests **11/11 ok**, `check:register:selftest` included (2,914.1 s wall, 10 lanes). Written after it: this Record's gate row and Status, the plan's Record cell re-worded to the final counts, and the commit hash — `check:register`, `check:markdown`, `check:spec`, `check:budget` and `check:wiring` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `test/fold/map-cost.test.ts` — three subjects, EXACT and below 6x, each under an iteration observer | yes | Q01-Q15 |
| (2) the provocations, checked in as cases | yes | the PROVOKED cases' `RAN` assertions and exact sets; GRADER-WRONG-SET |
| (3) `examples/map-cost.ts` | yes | `l6.ts`' construction clause (its marker and `CONSTRUCTION_PRICED`); L0 |
| (4) the `W197 exit` L6 block | yes | L01-L04; `X10` |
| (5) the reply | yes | — (outside the repository) |

**The numbers** — the suite's readings, node 24.20.0, every count EQUAL to its derived value:

| subject | 2,000 | 8,000 | derived | iterations, 2,000 → 8,000 |
|---|---|---|---|---|
| `fold`, an `attempted` element per task | 26,009 | 104,009 | `13n + 9` | 4,011 → 16,011 (3.99x) |
| the driver, plain | 2,002 | 8,002 | `n + 2` | 83,142 → 329,142 (3.96x) |
| the driver, a `needs` read per settlement | 6,004 | 24,004 | `3n + 4` | 159,307 → 633,307 (3.98x) |
| a runtime — 5n + 6 applied, ONE materialisation | 26,016 | 104,016 | `13n + 16` | 78,589 → 306,589 (3.90x) |

`examples/map-cost.ts` on the final tree, each size a fresh process (scratchpad `w197/mapcost-node.log`, `-deno.log`):

| items | `fold` before | now, node / deno | driver before | now, node / deno | with `task.running`, before | now, node / deno | runtime before | now, node / deno |
|---|---|---|---|---|---|---|---|---|
| 1,000 | 135 ms | 6 / 5 | 28 | 24 / 25 | — | 25 / 26 | 987 | 44 / 45 |
| 2,000 | 3,609 | 11 / 9 | 33 | 35 / 38 | — | 38 / 39 | 8,284 | 66 / 77 |
| 4,000 | 33,664 | 18 / 16 | 98 | 58 / 65 | 113 | 62 / 70 | 34,311 | 110 / 130 |
| 8,000 | — | 25 / 25 | 351 | 102 / 114 | 517 | 109 / 124 | 157,679 | 195 / 226 |
| 16,000 | — | 43 / 51 | 988 | 185 / 217 | 2,870 | 197 / 224 | 683,151 | 390 / 418 |

**Predictions.** P39 prediction 6 **HOLDS**: `X10` moved by the block alone, 2789 / 222 → 2805 / 228; no `EXPECTED` row,
pair row or other block moved. Prediction 5 holds for this item: no `src/` file edited.

**What broke.** At a rung: nothing. **The author's WALL found what no count did**: the `needs` arm took 10.9 s at 8,000
items with `taskLog.visits` exactly linear — a reference to a large value cloned per read ([Q186](../questions/q186.md)),
and, pointed at a small value inside the instance, 20.5 s: the reference SEARCH, [Q735](../questions/q735.md), raised.
The readers found what the author's set did not: a compound provocation, a claim carrying another's verdict, and an
iteration observer that existed for the fold alone.

**What this taught.** *For the retro*: **a count is an instrument only for the work that ticks — the fourth item in a row
to meet it** (W194's re-tally, W195's counter of calls, W196's cache, and here the reference search, found by a WALL);
the answer each time was a second observer that does not go through the counter, and one per SUBJECT, not per plan.
And **sentence E's cut is per CALL SITE**: one function reached from two clauses is two probes.

**Questions raised.** [Q735](../questions/q735.md) (Q736-Q739 SPENT, unissued). **Closed.** None. ADR 0123 SKIPPED.
**Record step**: Q735 written; dated notes on [Q186](../questions/q186.md) and [Q599](../questions/q599.md); P39's Record
and Retro; `doc/workflow.md`'s bookkeeping (the declared exception).

**The readers' overlap.** **ONE** — the L6 freeze claim (the conformity reader's C2: it carried another claim's verdict;
the adequacy reader's gap 6: it could not go red). Every other finding was one reader's alone.
