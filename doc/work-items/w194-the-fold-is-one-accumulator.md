# W194 — the fold is ONE accumulator: `fold` linear, `step` pure

**Status:** done 2026-10-21 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, the conformity reader's one BLOCKER (C1) fixed and provoked; 56 provocations KILLED, none surviving; no question raised. Earlier: declared 2026-10-21 on `c1aefb0` (P39 committed, the tree clean); P39's FIRST item: decisions 1-3, 5 and 6, stop-and-asks (a), (c) and (e) as answered; the declaration step RUN before any `src/` edit (below)
**Plan:** [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) — *what does a step cost on a long
run, and where may its owner read the run's live state?* — and this is its FIRST item: the fold, not the driver or the handle.

```
Spec:       spec/run-state.md v0.28 -> v0.29 — section 1's RN-R1 and RN-R2 (their Test text), a new RN-R43 (a fold's work
            is linear in its inputs; a step's is O(the state it is handed)); spec/README.md's row for v0.29.
Owns:       from P39's W194 row, exactly: src/fold/run-state.ts, src/fold/accumulator.ts (new, internal — not re-exported
            by index.ts), test/fold/**, test/definition/l4-corpus.test.ts, spec/run-state.md (the WHOLE file — the row's
            parenthetical is a forecast), spec/README.md, AGENTS.md (the WHOLE file, sentence D′), doc/decisions/0120-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2 — a serial item):
              deno.json — ONE line, `!src/fold/accumulator.ts` in `publish.exclude`'s allowlist: the new file is published
              source (run-state.ts imports it), and check:source S6 refuses published source outside the allowlist.
            Anything else found to need an edit is a STOP-AND-ASK, never an edit.
Inputs:     P39 decisions 1-3, 5, 6 and stop-and-asks (a), (c), (e) ANSWERED 2026-10-21 as recommended; P39 facts 1-3
            and 9, RE-RUN at this item's declaration step, never transcribed (P15 decision 5); RN-R1, RN-R2, RN-R3;
            ADR 0014 (the append order, untouched); ADR 0058 rule 5 (the runtime's stepped state — W196's, not this item's).
Outputs:    (1) ADR 0120 — the fold is ONE internal accumulator, mutated in place within a call and materialised
                once; `step` keeps its signature, stays pure and costs O(the state it is handed) per call.
            (2) src/fold/accumulator.ts — the accumulator: Map/Set-backed nodes and region lists; running counts of
                nodes per state, of region instances not joined, of region instances that opened nothing, and of
                path ends by reason; `load(state)`, `apply(input)`, `materialise()`; an optional counter ARGUMENT
                (decision 6), never module state (RN-R1); the internal entry points `foldWith` and `stepWith`.
            (3) `fold` = one accumulator over the inputs, materialised once; `step` = load, apply, materialise —
                each arm's behaviour on ANY prev kept, `prev` itself returned wherever it is returned today.
            (4) the pre-change `step`/`fold` kept under test/fold/ as the equivalence ORACLE (a frozen copy of
                today's code, never edited again) — test/fold/oracle-run-state.ts.
            (5) spec/run-state.md v0.29 (RN-R43; RN-R1/RN-R2 test text) and its spec/README.md row; AGENTS.md's
                text on `step`'s and `fold`'s cost.
            (6) the tests — test/fold/accumulator.test.ts — and l4-corpus's census row and case count for its suite.
Depends on: nothing
Blocks:     W195
Tests:      L1 — every prefix of every corpus sequence (hand-written sequences over every arm, a seeded generated corpus,
            and the sequences a driver produces over spec/examples/valid/** on a double, as the L4 suites drive them):
            `inputs.reduce(step, emptyState())` deep-equals `fold(inputs)`, and both deep-equal the ORACLE's, key
            order included — expected values from the oracle and the spec, never from the new code; `step` over each
            ORACLE prefix state equal to the oracle's step, the same object exactly where the oracle's is. Each
            early-return arm (`run-state.ts:480`, `:487`, `:496`, `:509`, `:528`, `:555`, `:593`) returning the SAME
            object. A hand-built `prev` whose `outcome` disagrees with its cells keeping that outcome across `paused`,
            `gated`, `attempted` and a `resumed` with no interruption. The COPY claim — a node's `result`, an ask's
            `input`, a gate's `key`, each NESTED — by alias and by shallow copy, read both ways (mutate the input after
            the step; mutate the returned state), and a materialised state unchanged by a later apply. RN-R1: two folds
            of one array, independent values. The fold's own COUNT ratio at 500 and 2,000 map items below 6x (decision
            6's counter); `fold` with no counter measured against the pre-change `fold` at 1,000 items (a measurement
            in this Record, not a gate entry — Q179).
Gate:       `npm run gate:item`; then the conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q720-Q724, ADR 0120
```

## Scope

**In**

1. **The accumulator** — Outputs (2): one definition of every arm and of section 3's precedence, read off counts.
2. **`fold` and `step` over it** — Outputs (3), and the oracle and equivalence suite — Outputs (4), (6).
3. **The record** — ADR 0120, `RN-R43`, `AGENTS.md`'s sentences on cost.

**Out** — named rather than left implicit, with where it goes instead

- **The runtime's own stepped state** (`runtime.ts:844-852`) — **W196**, which replaces it with the accumulator.
- **The driver's log scans** — **W195**.
- **The gate's standing ratio at 2,000 / 8,000 items and its provocations** — **W197**; this item holds its own at 500 /
  2,000 at birth.
- **Any change to `RunState`'s shape, `FoldInput`, `fold`'s result, `isTerminal` or `nodeOf`** — none (P39 decision 5).
- **A public accumulator** — refused, P39 (c).

## What the declaration step re-took, before anything was edited

*P15 decision 5: every fact is re-run by the item that acts on it. Taken 2026-10-21 on `c1aefb0`, the tree clean.*

| # | re-take | measured |
|---|---|---|
| 1 | P39 fact 1: the repro's `fold`, each size in a FRESH process | **node 24.20.0**: 134 / 3,387 / 30,073 ms at 1,000 / 2,000 / 4,000 items (4,003 / 8,003 / 16,003 inputs). **deno 2.9.6** (the L6 import map): 138 / 2,800 / 26,868 ms. Fact 1's curve — 25x then 9x per doubling in node |
| 2 | facts 2-3, every spread, `Object.values`, `some`, `includes` and `filter` in `src/fold/run-state.ts` by reading the file whole | fact 2's and fact 3's sites, AND five P39 did not list: the `halted` arm (`:472`), `cancelRequested` (`:481`), `interrupted` (`:488`) and `paused` (`:497`) each spread `prev` (O(1) cells, but every arm that calls `withOutcome` then pays its O(run) scan and a second spread), and `joinSettled` (`:599-601`) through `withRegion`. Every one is replaced; `foldLog` (`:832`) maps its log once, linear, and stays |
| 3 | whether `withOutcome` equals the stored `outcome` on every fold-REACHABLE state | **equal on every prefix of every corpus sequence** — asserted, not assumed, by the suite's case *the precedence recomputed on every reachable state is the stored one*. The arms that do not recompute (`paused`/`unpaused`, `gated`, `attempted`, `resumed` with no interruption, `halted`) move no cell the precedence reads, so the difference is visible ONLY on a hand-built state whose `outcome` disagrees with its cells — the case decision 2 names |
| 4 | every test asserting `step`'s IDENTITY | two, both in `test/fold/attempted.test.ts`: `:95` (the SAME object from the empty state) and `:98` (a NEW one from a settled run). Nothing else compares a step's return by identity; `policies.test.ts` and `matrix/variants.test.ts` are the JOIN POLICIES' `step`, not the fold's |
| 5 | where the fold clones, and what a state shares with an input | `structuredClone` at `asked`'s `input` (`:536`) and `gated`'s `key` (`:581`), once each, when applied; `resumed`'s list copied (`:569`); a settlement's and a resolution's `result` SHARED by reference (`:623`, `:640` — ADR 0058 consequence 3). The accumulator clones at the same two sites, once, and shares `result` |
| 6 | the ladder counts — `npm run gate` on `c1aefb0`, EXIT 0, 193 s | L1-L5 **84 files / 2,098 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2,789 assertions / 0 failed** in node and deno; `check:docs` 50 `run` snippets; `check:spec` C4 45 |

## Verification

`npm run gate` before the readers; then the two readers; then `npm run gate:item` once, on the final tree. **Routing
coverage**: a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10) and a nested
fan-out (Q6) — each covered by the equivalence suite's corpus as a FOLD input sequence, not as routing (the fold routes
nothing): `p1-routed-away`, the parked and resolved strategies, `failure-edge`/`fanout-failure`, and `nested-fanout` from
the valid corpus, and the hand-written rows; a duplicate task id (Q13) — the `dispatched` arm's duplicate guard (`:509`),
in the identity cases.

## The author's provocations

`C:/tmp-w194/mutate.mjs` (kept with its logs in the session scratchpad, `w194/probes/`) in the byte copy `C:/tmp-w194/m`
(synced to the tree, `find -type l` 0, node 24.20.0 asserted at the head of the run): each probe edits ONE clause, its
anchor checked to occur once in the CURRENT text; every file restored from its FIRST snapshot and its SHA-256 compared
after every probe and at the end; graded on the FAIL lines of the cases each probe DECLARES in `node test/runner.ts
fold/accumulator` — KILLED, WRONG-REASON (failures only outside them), SURVIVED, CRASH (an import failure), NO VERDICT (a
time-out). **Grader controls**: CONTROL CLEAN, GRADER-CRASH CRASH, GRADER-WRONG-REASON (P19's edit declared against the
count) WRONG-REASON.

| pass | probes | result |
|---|---|---|
| first (`mut.log`) | 45 + 3 controls | 43 KILLED; **P34 CRASH** — the suite built an ODD state with the code under test at import, so a broken fold failed the IMPORT and no case (fixed: module-level values are built with the oracle, the drain reads the oracle, a drain that does not come to rest is refused by a case, never thrown at import); **P39 WRONG-REASON** — a re-suspended path's ORDER was reachable only through the ODD states, so the corpus gained a row that parks the first branch again, and P39 is re-declared [1, 4] |
| before the readers (`mut2.log`) | 45 + 3 | 45 KILLED (P34 confirmed alone: KILLED) |
| after the readers (`mut3.log`) | **56 + 3** | **56 KILLED, 0 SURVIVED**, controls CLEAN / CRASH / WRONG-REASON, no NO VERDICT, no ABORTED, digests equal. P46 is the C1 fix broken back; P47-P56 the adequacy reader's survivors and the conformity reader's T-cases, each re-cut as ONE clause |

The clauses, by id: P01-P07 section 3's precedence (RN-R7, RN-R28's guard, RN-R30, RN-R8 first, W33's nothing-yet,
RN-R10, the path-end fallback); P08-P12 the running counts (a replaced entry, the written entries, a touched base
instance, a base instance's share, a touched instance's share); P13-P18 the region lists and key order (opened once, a
loaded duplicate, `settled` order, an instance's and a state's own keys, `nodes` first-write order); P19-P23 the copy
claim (an ask's input and a gate's key, alias and shallow; a result shared); P24-P27 no recompute in `attempted`,
`paused`, `resumed` without a stop, `gated`; P28-P33 the identity arms and `stepWith`; P34 a written entry read back;
P35-P36 RN-R43's ratio (the spread-per-step restored; a counter that counts nothing); P37 RN-R1 (a memo across calls);
P38 RN-R2 (the handed state written); P39-P40 `suspended` (added once, removed); P41 `halted` sets the outcome; P42 an
answered ask keeps its input; P43 the first `runId` kept; P44-P45 an untouched list and `nodes` are prev's own; P46 C1;
P47 a resolution's result shared (S4); P48 an answered ask keeps the SAME input copy (S9); P49 a resumed list copied (S5);
P50 counts tallied lazily (C7); P51 the precedence scans nothing (C2); P52-P53 T1, T2; P54 an opener's untouched
instances keep their places (O3); P55 the loaded-continuation loop runs (W4); P56 the oracle unedited (rule 8).

## Readers (2026-10-21), and what was acted on

*Both readers ran in their own worktrees (`C:/tmp-w194/rc`, `C:/tmp-w194/ra` — `c1aefb0` plus this diff, `node_modules`
copied, no links), spec first; each reported and fixed nothing. The author's tree held still while they read.*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | **C1 BLOCKER** — `materialise` wrote keys by ASSIGNMENT, so a key `__proto__` called the prototype setter and created nothing, where the old spreads and computed keys created an own key. FD-V16 admits a node — so a region opener — named `__proto__`: on a `Driver` the region vanished from `fold`, and on a branch routed away from its join `inputs.reduce(step, …)` read **`completed`** where the oracle and `fold` read `stuck` — RN-R2 broken | code | **FIXED** — `put`, an own data property for `__proto__`, at the three sites that were spreads; `settled` stays an ASSIGNMENT, because the old arm assigned it (measured: making it own diverged at once). ADR 0120 rule 9. Two hand rows (an opener named `__proto__`; a task id, region path and branch path so named). P46 KILLED |
| conformity | C2 NIT — `joinSettled` copies an instance's three lists where `{ ...cur, joined }` shared them; rule 4 overclaimed | doc | **FIXED** — rule 4 and the accumulator's header name the one narrowing |
| conformity | C3 NIT — a REGION PATH naming an `Object.prototype` member reads a `Map` where the old arm found the inherited member; such a sequence differs | doc | **STATED AS THE LIMIT** — ADR 0120 rule 10, `RN-R43`, the v0.29 paragraph, `fold`'s and `apply`'s comments, AGENTS.md: a region path is a branch path and no driver appends one |
| conformity | C4 SHOULD — `step`'s *Returns a new state* and AGENTS.md's *it copies the one you give it* beside seven arms that return `prev` | doc | **FIXED** in both |
| conformity | C5 SHOULD — AGENTS.md's *fold incrementally* (the `onFoldInput` paragraph) on nobody's list | doc | **FIXED** — it points at section 8's cost; W196 owns the rest |
| conformity | C6 NIT — the lists of arms omitted *a request after the run is `cancelled`* and `unpaused` | doc/spec | **FIXED** in `RN-R43` and `step`'s comment |
| conformity | C7 NIT — stale pointers: `run-state.md` section 3 (*`src/fold/run-state.ts` falls back*), `stuck.test.ts`'s `allRegionRuns`; `test/driver/fold-inputs.test.ts:228` (`parseTaskId` in run-state.ts, stale since before `c1aefb0`) | doc | **FIXED** the two owned; the third is **not in `Owns`** — left, and named for W195 (it owns `test/driver/**`) |
| adequacy | S4 SHOULD — a RESOLUTION's result shared, untested | test | **FIXED** — case 8; P47 KILLED |
| adequacy | O3 SHOULD — no corpus held two non-integer instance paths under one opener | test | **FIXED** — `'0.1'` in the generator, and a hand row; P54 KILLED |
| adequacy | C2/C4/C3 SHOULD — the ratio sees only work that calls `tick`; an uncounted scan stays green | test | **FIXED** in part — a second observer, independent of `tick`: the precedence's SOURCE iterates nothing (node and deno; the browser skip asserted); P51 KILLED. **Left for W197**: a re-tally hidden OUTSIDE `precedence()` with its ticks removed (the reader's compound C4) — W197 owns the standing provocations and the counters |
| adequacy | C7 SHOULD/NIT — laziness unmeasured | test | **FIXED** — `step` on `paused`, `gated` and an unknown `attempted` costs the same at 500 and 2,000 items; P50 KILLED |
| adequacy | S9, S5, T1, T2 NIT | test | **FIXED** — an answered ask keeps the SAME input copy; a resumed list is a copy; malformed-id probes over a node keyed `nope`; P48, P49, P52, P53 KILLED |
| adequacy | W4 SHOULD/NIT — the loaded-continuation loop unguarded, and the SOLE observer of the counts kept over a handed base across more than one apply | test | **FIXED** — counted, equal to the rows' total length; P55 KILLED |
| adequacy | oracle provenance held by convention | test | **FIXED** — case 1 pins the oracle's body to the SHA-256 of `c1aefb0`'s lines 455-833 (node and deno; the browser skip asserted); P56 KILLED |
| adequacy | R1c NIT — an absent counter charged to a module-level object is behaviourally invisible | — | **DECLARED** — a source property; no runtime test sees it |
| adequacy | W8 — the control list read off `fold` | — | equivalent (the list is a hand-written literal) |

## Notes for the plan's Record

- **For W195**: `test/driver/fold-inputs.test.ts:228` cites `parseTaskId` in `src/fold/run-state.ts`, false since before
  `c1aefb0` and now there is none there at all (C7).
- **For W196**: the accumulator is ready to be kept open — `Accumulator.load(state)`, `apply`, `materialise`. ADR 0120 rule
  5: a materialised state SHARES node entries, gate decisions, path ends, resume lists and request records with the
  accumulator (replaced, never mutated), so a later `apply` never changes it — but a caller that mutates it reaches them:
  W196's deep freeze of what `state()` hands out freezes those shared objects too, harmless because the accumulator never
  writes to one. A materialisation is O(run) (prediction 4).
- **For W197**: the counter is `FoldCounter`, an argument to `foldWith(inputs, counter)` / `stepWith(prev, input, counter)`;
  the harness's P35 (*the spread-per-step restored*) is the shape of (e)'s first provocation, and the adequacy reader's
  compound C4 is the counter-fidelity case it must also hold.
- `examples/run-flow.ts:2030` steps per input; fine at its sizes, nobody's row.

## Record

*Filled 2026-10-21, after both readers.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 1, then **EXIT 0** | the first run stopped at `check:source` S4: `constructor(from: readonly string[], …)` matched the parameter-property pattern (a false positive on a TYPE); the type became `ReadonlyArray<string>`, and the re-run was EXIT 0 — L1-L5 85 files / 2,111 cases in node 24.20.0, deno 2.9.6 and chromium; L6 2,789 / 0 failed in node and deno |
| L1 the equivalence, the identities, ANY prev, the copy claim, RN-R1/RN-R2, the count ratio | RAN — green | `test/fold/accumulator.test.ts`, 12 cases; every other suite's expected values unmoved (prediction 1) |
| conformity reader | RAN | C1 BLOCKER (fixed), C2-C7 (fixed / stated / named for W195) |
| adequacy reader | RAN | 101 entries (94 single-clause): 83 KILLED, 11 SURVIVED; every real gap closed and re-cut (P47-P56) |
| the author's probes | RAN, three times | **after the readers: 56 probes + 3 grader controls — 56 KILLED, 0 SURVIVED**, controls CLEAN / CRASH / WRONG-REASON, digests equal (`mut3.log`) |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (scratchpad `w194/gateitem.log`, 23 min) | lint; typecheck; every check, `check:docs` 50 `run`, `check:spec` C4 45; L1-L5 **85 files / 2,111 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,111); L6 **2,789 / 0 failed** in node and deno; selftests 10/10 ok (1,126.7 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and Status, and ADR 0062's dated pointer — `check:register`, `check:markdown` and `check:budget` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0120 | yes | `check:register`; `check:spec` C5 (the spec links it) |
| (2) `src/fold/accumulator.ts` | yes | every case of the suite (CRASH without it); P01-P56 |
| (3) `fold`/`step` over it | yes | the repro: 30,073 ms at 4,000 items before; P35 (ratio) |
| (4) the oracle | yes | cases 1-8 (CRASH without it); P56 (the digest) |
| (5) spec v0.29, README row, AGENTS.md | yes | `check:spec` C6/C8; `check:docs` |
| (6) the tests, l4-corpus's row and count | yes | l4-corpus's census and count case |

**The repro** (the app's, its queue walked by index; each size a fresh process; the session scratchpad's `perf/repro.ts`):

| items | inputs | `fold` before, node | after, node | before, deno | after, deno |
|---|---|---|---|---|---|
| 1,000 | 4,003 | 134 ms | 6 ms | 138 ms | 6 ms |
| 2,000 | 8,003 | 3,387 ms | 9 ms | 2,800 ms | 9 ms |
| 4,000 | 16,003 | 30,073 ms | 17 ms | 26,868 ms | 15 ms |
| 8,000 | 32,003 | — | 25 ms | — | 30 ms |
| 16,000 | 64,003 | — | 49 ms | — | 48 ms |

The driver column is untouched (W195's): 1,273 ms node / 1,610 ms deno at 16,000 items, superlinear as fact 4 says. The
counter's own cost, at 1,000 items, medians of 41: 1.62 ms without, 1.49 ms with; the pre-change fold 120.74 ms. Counted
work: 5,509 / 22,009 visits at 500 / 2,000 items — 4.00x.

**Predictions.** P39 prediction 1 **HOLDS**: no assertion's expected value moved in any lane. Prediction 2 **HOLDS**:
`fold` at 4,000 items 17 ms in node (under 100 ms), and the cliff is gone (doubling now ~1.6-2x). Prediction 5 holds for
this item: no `FoldInput`, `RunState`, `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` or `snapshot()` change.

**What broke.** At a rung: `check:source` S4 on a type (above). The readers found what no rung saw — **C1, a BLOCKER**: an
assignment where every old site was a spread, reachable through a node id FD-V16 admits. Before the readers, my own first
probe pass found the suite building corpus values with the code under test at import (P34: a broken fold CRASHED the
suite instead of failing a case).

**What this taught.** *For the retro*: **an equivalence oracle is only as wide as its corpus's KEY SPACE** — every arm was
equal on 240 generated sequences and every driven one, and the first key a grammar admits outside the corpus's alphabet
broke it. A rewrite from spreads to assignments changes SEMANTICS for exactly one key, and a corpus of "every kind" is not
one of "every key". And a test that builds fixtures with the code under test at module scope turns a defect into an import
CRASH — so fixtures come from the oracle, and a bound is a case, not a throw.

**Questions raised.** None (Q720-Q724 SPENT, unissued). **Closed.** None.
**Record step done**: ADR 0120 written; a dated pointer in ADR 0062 rule 4 (`allRegionRuns` gone, the rule unchanged).

**The readers' overlap.** **ONE** — the region key space: the conformity reader's C3 (a region PATH naming a prototype
member) and the adequacy reader's O3 (two non-integer instance paths under one opener) are both a corpus that never put a
non-trivial string in a region path. Every other finding was one reader's alone; C1 was the conformity reader's alone.
