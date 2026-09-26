# W94 — a TV-series ingest through a GATE, on real workers

**Status:** **DONE** 2026-09-26 — see the Record. Declared 2026-09-25 on W93's tree (UNCOMMITTED on top of `fb2a981`, W92's commit; this item
does not commit W93's work), content digest `b260a55ab8e457e9` over 408 files. Its declaration-step findings are the
section below, written before any file under `Owns` was edited.
**Plan:** [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md) — *what may a node remember across a
run's branches?* — and this is its EXIT ARTIFACT.

```
Spec:       NONE — an exit artifact writes no rule and moves no rule id; `check:spec` stays 7 / 65 / 125.
            A rule this item needed would mean ADR 0066 or 0067 shipped short, and that is a stop-and-ask,
            not an edit (`spec/**` is outside `Owns`; the one `spec/` edit below is a corpus CENSUS
            sentence, a declared exception, Q360).
Owns:       examples/**, AGENTS.md, README.md, examples/README.md, package.json, deno.json
            (P24's row for W94, never this item's title)
Inputs:     P24's exit-artifact sentence, decisions 1-8, facts 2-4, stop-and-asks (a)-(d), prediction 3
            (the REACH), the seeded exceptions for W94, and the Record's hand-overs from W92 (Q381, the
            NOT_YET_AT_L6 exemption) and W93 (the `gated` kind in README's list); ADR 0066, ADR 0067;
            ADR 0064/0065 and W90's block (2g) (the kill is the consumer's store freezing, `shutdown()`
            DRAINS — Q376); spec/flow-definition.md v0.24's gate subsection and FD-R5; spec/run-state.md
            v0.11 section 10 (RN-R26) and RN-R13; Q379, Q381, Q386, Q387, Q376, Q171, Q342, Q360.
            P24 facts 2-4 RE-RUN at this declaration on the SHIPPED gate, never transcribed (P15 decision 5).
Outputs:    (1) examples/flows/tv-ingest.flow.json — a `map` over files whose branch FETCHES the file and
                fans out BESIDE: a thumbnail for every file, and IDENTIFY then a `distinct` gate keyed on
                the dotted path `series.id` — `first` to the per-series setup, `duplicate` and `nokey` to
                two `end`s (a drop is an edge to an `end`); the joins firing; the run `completed`
            (2) four new workers — download, identify, thumbnail, series — each with inputSchema and
                outputSchema and a declared example, held by `check:workers`; four node types in
                examples/registry.json, `Identify` threadable
            (3) three EXPECTED rows at L6 in BOTH runtimes: arranged LAST-first, arranged FIRST-first (its
                pair), and threaded at equal work — each asserting exactly ONE `first` per series, the
                first-routed branch the FIRST to arrive, the setup ids derived from the run's own `gated`
                elements, and what reached the gate handed on; the arranged rows asserting the
                arrangement's own effect; NO assertion naming which file won (decision 7, Q379)
            (4) block (2h): the run KILLED at EVERY kill point and resumed on a fresh runtime, identical to
                a run nobody killed on outcome, every node, every branch's decision and the gate's memory;
                the stored `gated` prefix regenerated exactly; the re-dispatched ids against the killed
                process; the kill points BEFORE the first decision included (Q386's case) and the
                selections shown to discriminate (a fresh memory, the killed process's)
            (5) examples/l6.ts' NOT_YET_AT_L6 `gate` exemption REMOVED — its expiry half RED first on this
                item's rows, then removed, the kind clause holding with no exemption
            (6) AGENTS.md section 19 — a gate as an EXECUTED `run` snippet (the TV shape, `RunState.gated`,
                a drop to an `end`, `UndeclaredRoute`) — and README.md's seventh paired fence under `X8`
            (7) the package at **0.6.0** (package.json AND deno.json, `X9`), README.md naming every break
                since 0.5.0 — the sixth node kind (Q381), the `gated` FoldInput kind, `RunState.gated` —
                and the additive members said to be additive
            (8) every copy of the L6 counts moved in the same diff (Q171), and what reverting W92, W93 and
                each gate clause costs at L6, measured
Depends on: W93
Blocks:     nothing — P24's retro follows
Tests:      examples/l6.ts at ladder L6 in node 24.20.0 and deno 2.9.6. Every expected value is written
            from the flow document, the workers' declared behaviour and `spec/` BEFORE the file is run; the
            winner-dependent values (which file opened a series) are DERIVED from the run's own `gated`
            elements and dispatches, never a literal; identity in block (2h) is against a reference run
            nobody killed.
Gate:       L0 under all five typecheck lanes and `lint`, EACH RUN SEPARATELY and RE-RUN after the last
            file is written; L1-L5 UNMOVED at 53 / 1423 in node, deno and chromium; L6 in BOTH runtimes,
            MOVED by exactly what this declaration says; `check:docs` and its self-test; `check:workers`
            and its self-test; `check:markdown`; `check:spec` unmoved; then the full `npm run gate` with a
            content digest identical at both ends.
Reserves:   Q391-Q393, and NO ADR
```

*Reserves derived by grep off the tree at this declaration: the highest question RAISED on disk is **Q387** (W93
raised Q386-Q387 and left **Q388-Q390 unused and not reused**), so this item starts at **Q391** and P24's block
Q379-Q393 leaves it THREE. W90 needed three; if this item needs more it EXTENDS the block on P11's and P12's
precedent and says so here, rather than taking an id silently. The highest ADR on disk is **0067** and P24's
0066-0067 are both taken — an ADR here would be **0068** and would have to be argued; none is expected, because an
exit artifact writes no rule. **W95 stays reserved and expected unused.***

## Scope

**In**

1. **The flow and its workers** — Outputs (1), (2).
2. **The rows** — Outputs (3): the arrangement, the pair, the threaded row.
3. **The kill** — Outputs (4), block (2h), W90's shape.
4. **The exemption's expiry** — Outputs (5).
5. **The reference and the version** — Outputs (6), (7), and every copy of the counts (8).

**Out** — named rather than left implicit, with where it goes instead

- **`src/**`, `spec/**` rules, `test/**` beyond the two seeded census files** — a defect found there is a
  stop-and-ask; L1-L5 must be UNMOVED.
- **An entry gate** — the TV flow's entry is a `map`, so [Q387](../open-questions.md) (an entry gate's type asked
  twice) is not reached by the artifact; it is OBSERVED on real workers at this declaration (row 5) and left open.
- **Memory per region instance, a second built-in type, memory across runs** — P24 Scope/Out.
- **P24's retro** — a separate step after this item.

## What the declaration step re-took before anything was edited

*On W93's tree, node 24.20.0 and deno 2.9.6, in `dev-dist/w94/` (`facts.ts`, five spike workers, logs
`f-<part>-<runtime>.log`). The flow is the one this item ships in shape — `episodes` (a `map`) → `download` →
`beside` (a `fanout` of `thumb` and `identify`) → `dedupe` (`distinct`, key `series.id`) — over seven files, three
series and one file with none. Re-run, never transcribed.*

**Row 1 — P24 fact 2 REPRODUCES on the SHIPPED gate, and it adds two things the emulation could not show.** Equal
work, ten runs per mode (`f-order-*.log`):

| identify pool | node: first-to-arrive is the lowest index | deno | arrival orders over ten runs |
|---|---|---|---|
| inline, `maxThreads` 1 | **30 of 30 keys** | 30 of 30 | ONE (`0…6`), both runtimes |
| inline, `maxThreads` 3 | **30 of 30** | 30 of 30 | ONE, both |
| threaded, `maxThreads` 3 | **23 of 30**, four winner sets | **28 of 30**, two winner sets | ten in node, six in deno |

**[Q379](../open-questions.md) is the inline pool exactly, and Deno's threaded pool is nearly the same trap**: a
threaded row at equal work separates *first to arrive* from *lowest index* on 7 of 30 keys in node and 2 of 30 in
deno — so a threaded row ALONE does not discriminate the two selections there, and the arrangement has to be made.
**And an arrangement can be defeated by the POOL'S WIDTH**, which nobody had measured. With identify's delay made
to fall with the index (later files identified faster), ten runs each:

| identify pool | arrival order | winners | first-to-arrive is the lowest index |
|---|---|---|---|
| inline, `maxThreads` 1 | `0…6`, **unmoved** | the lowest index, every series | 30 / 30 — **a serial pool runs tasks in dispatch order, so a delay cannot reorder what one slot runs** |
| inline, `maxThreads` 3 | `2,1,0,…` | ONE series moved | 20 / 30 |
| inline, `maxThreads` 8 (≥ the arity) | `6,5,4,3,2,1,0`, 10 / 10 in both runtimes | every multi-file series moved | 10 / 30 (the single-file series only) |
| threaded, `maxThreads` 8 | the same, 10 / 10 in node and 9 / 10 in deno (the tail swapping two different keys) | the same, 10 / 10 in both | 10 / 30 |

**So the artifact ARRANGES the order and sizes the pool as wide as the map**: identify's delay is proportional to
the file's size, the arranged row's sizes FALL with the index, and `Identify`'s pool is eight wide — and the row
asserts the arrangement's EFFECT from its own sequence (the first arrival per multi-file series is not its lowest
index, and the first gated branch is not the first identify dispatched) rather than trusting it (W17's
`joinSettledBy`). The pair row reverses the sizes. **The threaded row runs at EQUAL work and asserts no winner** —
only that exactly one file per series opened it, whatever the pool chose.

**Row 2 — P24 fact 3 REPRODUCES on the shipped gate (`f-drop-*.log`, identical in both runtimes)**: the run
`completed`; the four drops (three `duplicate`, one `nokey`) each give ONE `branch.exited` — on the `beside`
FANOUT region, at `i.1`, not on the map — and one `pathEnded` at their own `end`; the map's seven branches all
ARRIVE (each `beside` instance's join fires on its thumbnail), and `publish` receives all seven. **One thing the
first draft of this design did not see**: with `first` leading on to the per-file join, `beside@i`'s record and
`i.1`'s terminal event depend on WHICH file won, so every row field that names them would name the winner.
**Sending the per-series road to its own `end` after setup** (`seriesReady`) makes every `beside` instance end
`{ i.0: arrived, i.1: exited }` whatever wins — so the ONLY winner-dependent values in a run are the setup task ids
and results and the `gated` routes, and decision 7 holds by construction rather than by care.

**Beside, measured both ways (`f-variants-*.log`, five runs each)**: (A) a `fanout` inside the map branch, and (B) a
second road — every route leads on to the thumbnail. Same 25 tasks, same wall (~330 against ~345 ms); A costs **46
more fold inputs** (120 against 74: seven `regionEntered`, fourteen `branch.opened`, ten arrivals, seven join
settlements, four exits, four path ends) and B **cannot say what P24's sentence says** — its duplicates reach no
`end`, so a drop is not a drop, and its thumbnail waits behind identify and setup. **A is taken.**

**Row 3 — P24 fact 4 end to end on real workers (`f-kill-*.log`)**: the run killed after EVERY stimulus — 25 kill
points: the store frozen inside `onFoldInput`, the runtime shut down, then `runtime.resume` on a fresh one:

| | node | deno |
|---|---|---|
| inline, identical to a run nobody killed (outcome, every node, every branch's decision, the gate's memory, the stored `gated` prefix regenerated) | **25 / 25** | **25 / 25** |
| threaded, the same | **25 / 25** | **25 / 25** — the `gated` SEQUENCE equal in order at 12 of 25, because two DIFFERENT keys' arrivals swap; every decision the same |
| refused | 0 | 0 |
| kill points before the first decision / between / after the last | **15 / 9 / 1** | 15 / 9 / 1 |
| where a FRESH memory would route a post-cut decision differently (a key decided before the cut and again after) | **7** | 7 |
| where the KILLED process's memory would (it drained — Q376 — so it holds every key) | **19** | 19 |

**The driver-owned memory resumes identically at every point, the fifteen before the first decision included** —
[Q386](../open-questions.md)'s case, which is the one where a process-kept memory completed WRONG in silence at
W93's declaration. And the three memories DIFFER at the points the selection table below needs, so the block's
right answer is discriminated from both wrong ones on the run's own data. *An earlier cut of this spike read
**0 / 25** — it compared the `gated` sequence IN ORDER against a reference whose tail arrived in a different
order at two different keys; the instrument, not the product, and corrected before any number was written here.*

**Row 4 — what this item's row, block and workers move (a reading, each confirmed at the build):**

| site | what moves | owned? |
|---|---|---|
| `examples/l6.ts` `ROW_KEYS`, `DECLARED_TOTAL`, `CROSS_ROW`, `CROSS_ROW_SUBJECTS`, `PER_ROW_SUBJECTS`, `pairRunCount` | three rows, a pair block and block (2h) | yes |
| `examples/l6.ts` `THREADABLE_TYPES`' literal | `Identify` joins `ScoreWorker` and `WeighWorker` | yes |
| `examples/l6.ts` the kind clause | `gate` present at L6: the exemption's expiry half goes RED, then is removed and the clause's second constructed input changes meaning | yes |
| `examples/l6.ts` the seventeen-worker schema clause | twenty-one worker entries | yes |
| `examples/l6.ts` `Expectation.payload` | a `files` list | yes |
| `DRIVER_FIELDS`, `NOT_RUN_STATE` | **nothing** — the driver gains no field | — |
| `scripts/check-workers-selftest.mjs` `CONTROL_LINES` | *17 worker(s) … 17 ran* → 21 ([Q342](../open-questions.md)) | **no — seeded** |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 30 → 31, `README_SNIPPET_FLOOR` 6 → 7, a seventh `README_SNIPPETS` pair | **no — seeded** |
| `scripts/check-docs-selftest.mjs` | the `X9` probe's anchor `` `0.5.0` `` → `` `0.6.0` ``, which rule 7 (b) would abort | **no — seeded** |
| `test/definition/wiring.test.ts` | its L4 census literal, 27 flows → 28 and the verdict counts — **and a FALSE `no` asserted where it is** ([Q391](../open-questions.md)): the check reads the gate as a pass-through | **no — seeded** (Q342) |
| `spec/outcome-record.md` section 4 | *16 of 188* corpus task nodes → 16 of 193 (five task nodes, no `needs`), DERIVED by `test/fold/result-value.test.ts` | **no — seeded** (Q360) |
| `examples/README.md`, `README.md` | the L6 counts, the worker census | yes (Q171) |

**Row 5 — [Q387](../open-questions.md) on real workers (`f-q387-*.log`)**: an entry gate whose type COUNTS its
calls, one branch — **`fn` called TWICE**, in both runtimes, the run `completed`. OBSERVED, not ruled out; the TV
flow's entry is a `map`, so the artifact does not reach it, and the row stays open with no owner.

**Row 6 — [Q142](../open-questions.md)** (`q142-declaration.log`): probe 1 (`doc/decisions` removed) **119 files,
`M3` margin 4**; probe 2 **5330 links, `M4` margin 895**. This item adds ONE document outside `doc/decisions`
(this file), so `M3` is predicted to read **120, margin 3 — does NOT fire**; `M4` safe.

## The design the re-takes leave

| | |
|---|---|
| the flow | `episodes` (entry, `map` over `files`) → `download` → `beside` (`fanout` of `thumbnail`, `identify`); `thumbnail` → `perFile`; `identify` → `dedupe` (`distinct`, `settings.key: "series.id"`): default → `setupSeries` → `seriesReady` (end); `duplicate` → `dropDuplicate` (end); `nokey` → `dropUnidentified` (end); `perFile` (join of `beside`) → `all` (join of `episodes`) → `publish` → `done` |
| the files | seven, named as a TV library names them — three of `Dark`, two of `Lost`, one of `Fargo`, and one `trailer.mkv` whose name carries no series; `identify` PARSES the series from the name, so the key comes from data a worker computed |
| the arrangement | `identify` waits `msPerMB × sizeMB`; the LAST-first row's sizes fall with the index, the FIRST-first row's rise; the threaded row's are equal. `Identify` is eight wide (row 1) |
| the rows | `r53` LAST-first, `r54` FIRST-first, `r55` threaded — all `live-token` |
| block (2h) | `r53`'s flow and payload, inline, a reference and one killed-and-resumed pair per stimulus |

**What this item SELECTS, and the fixture where each well-formed wrong selection DIFFERS** (rule 8 obligation (a),
v0.23):

| selection | the right one | the well-formed wrong ones, each shown to DIFFER |
|---|---|---|
| which file is FIRST per series | the first to ARRIVE at the gate | the lowest index and the first dispatched — the LAST-first row, where both differ for `dark` and `lost`, asserted from the run's own sequence beside the claim; the pair row, where the order IS the index order, so its winners DIFFER from the first row's with the same count. *(**Narrowed by the adequacy reader, finding 5**: `identify` is dispatched per file as its download settles, so within a series the first DISPATCHED is the lowest index on every row — the fixture separates the right selection from both wrong ones TOGETHER, not the two wrong ones from each other.)* |
| the memory's scope | per RUN — one memory across all seven map instances | per instance: every `first` would go through; asserted as exactly one `first` per series across instances |
| the edge per route | the edge wired for the returned route | the default: a `duplicate` or `nokey` taking it would dispatch a setup — the setup ids are asserted equal to the `first` elements' branches, both ways |
| the value handed on | what reached the gate, identify's whole result | the key alone, the settings — `setupSeries` returns the file NAME it received, which neither carries |
| the kill point | every one: before the first decision, between, after the last | the three memories differ: fresh at 7 points, the killed process's at 19 (row 3) |
| the resumed memory | the one the replay rebuilds | fresh, the killed process's — both DERIVED from the killed process's sequence and shown to differ where the block says |

## The L6 arithmetic, written before the file is run

**Rows** (`PER_REGION_ROW` 22 plus the extras the harness derives from the row):

| row | base | branchEvents | nodeResults | pathEnds | regionInstances | an arrival held | gate clause | total |
|---|---|---|---|---|---|---|---|---|
| LAST-first `r53` | 22 | 21 | 22 | 1 | 14 | 1 | 7 | **88** |
| FIRST-first `r54` | 22 | 7 | 8 | 1 | 14 | 1 | 7 | **60** |
| threaded `r55` | 22 | 7 | 1 | — | 14 | 1 | 6 | **51** |

**Cross-row**: the pair — **2** (the arrangement differs only in its order; the winners differ with the same count);
block (2h) — **5** (identical at every kill point; the stored `gated` prefix regenerated; the re-dispatched ids
against the killed process; CONTROL, every kill point counted from two sources; CONTROL, the selections
discriminate). The kind clause stays ONE assertion.

**Predicted: +206 assertions and +54 real runs (3 rows, and block (2h)'s reference plus 25 killed and 25 resumed) —
L6 2059 / 154 in both runtimes**, from 1853 / 100. *To be compared at the build and corrected here, never quietly.*
**Compared**: the rows came in at exactly **199** and block (2h) and the pair at exactly **7** — 2059 / 154 on the first
complete run in both runtimes. **Then 2060**: rule 8's planning found the route control missing (`d2`), +1 cross-row before
either reader read the tree — the arithmetic's cross-row term was short by the control its own enumeration needed, and the
four count copies went on reading 2059 until the conformity reader's finding 1. **Then 2069** after the readers: +3 per row
(the fourteen `beside` ids as a set and the overlap that justifies it, and the realm), no cross-row count moved.

## Exceptions — files outside `Owns`

*Seeded from P24's table and re-taken at row 4; each marked at the build.*

| file | why | predicted? |
|---|---|---|
| `scripts/check-docs.mjs` | `RUN_FLOOR` 30 → 31, `README_SNIPPET_FLOOR` 6 → 7, a seventh `README_SNIPPETS` pair | P24 seed |
| `scripts/check-docs-selftest.mjs` | the `X9` probe's anchor `` `0.5.0` `` → `` `0.6.0` ``; the unclosed-fence probe's comment naming the last section | P24 seed |
| `test/definition/wiring.test.ts` | the L4 census literal ([Q342](../open-questions.md)) | P24 seed |
| `spec/outcome-record.md` section 4 | the corpus task-node split ([Q360](../open-questions.md)) — a census sentence, no version move, W86's precedent | P24 seed |
| `scripts/check-workers-selftest.mjs` | `CONTROL_LINES`' *17 worker(s)* | P24 seed |
| `doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md` | the W94 row, P24 COMPLETE pending its retro, the seeded W94 rows marked, prediction 3's verdict | W90's precedent — outside the plan's Record |

*`CLAUDE.md`, `doc/README.md`, `doc/open-questions.md` and `doc/decisions/**` are record-step files.*

## Verification

**Routing:** a gate IS routing. Of the states the template names: a branch routed away from its join (Q4) — every
drop is exactly that, inside a `fanout` inside a `map`, asserted with both joins firing; a nested fan-out (Q6) — the
gate sits in a `fanout` region inside a `map` region, its memory shared across all seven map instances; no matching
decision edge (Q10) — not reachable (`FD-V41` wires every route, `FD-R5` is W93's, at L1); `user_action` (Q17) and a
duplicate task id (Q13) — not applicable, a gate mints none and nothing here parks.

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each separately | the harness, the workers, the snippet | see Record |
| L1-L5 node / deno / chromium | UNMOVED at 53 / 1423, bar the two seeded census files | see Record |
| L6 node and deno | MOVED, by the arithmetic above | see Record |
| `check:docs`, `check:workers`, `check:markdown`, `check:spec`, their self-tests | the snippet, the workers, the documents | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

**DONE 2026-09-26.** P24's exit artifact runs: a TV library's seven files through a `map` whose branch fetches each file and
fans out BESIDE — a thumbnail for every file, and `identify` (which PARSES the series from the name) then a `distinct` gate
keyed on `series.id` — so the first file of each series to ARRIVE opens the per-series work and every other file ends at an
`end`, on a real `FyflowScheduler` in both L6 runtimes, killed at every kill point and resumed identically. **L6 is 2069
assertions over 154 real runs** in node 24.20.0 and deno 2.9.6, from 1853 / 100. The package is **`0.6.0`**, and
`README.md` names FOUR breaks. **No ADR** — an exit artifact writes no rule; `spec/` moved in ONE census sentence (Q360).

### Outputs, each with what fails without it (rule 8, below)

| # | output | shipped as | what fails without it |
|---|---|---|---|
| 1 | the flow | `examples/flows/tv-ingest.flow.json` — `beside` a `fanout` inside the map branch, the per-series road ending at its own `end` (`seriesReady`) so every `beside` instance ends the same way whatever wins | `e1`, the L4 census; the rows |
| 2 | four workers, schemas, `check:workers` | `download`, `identify` (the arrangement `msPerMB`, and its `realm`), `thumbnail`, `series` (echoing every identify field); four node types, `Identify` threadable and eight wide | `c2`, `c3`, `gW`, `r2`, `r4`; `check:workers` 21 / 21 |
| 3 | three rows, no winner named | `r53` LAST-first, `r54` FIRST-first, `r55` threaded — `Expectation.gate`: eight claims on an arranged row, seven on the threaded one | `a1`-`a11`, `b1`-`b5`, `b8`, `b9`, `c1`, `r2`, `r4` |
| 4 | block (2h) | 25 kill points, each DISTINCT, identical to a reference; the stored `gated` prefix regenerated and the memory REBUILT, read the instant `resume` returns; the re-dispatched ids against the killed process; two controls | `a7`-`a9`, `b10`-`b12`, `c4`, `c5`, `d1`, `r1`, `r1b`, `r3`, `r3b`, `r6`, `rc7` |
| 5 | the exemption expired | RED on the rows' first run (`b1-l6.log`: `[["gate"],["gate","phantom"],["gate"]]`), then removed; the clause's second constructed input now takes `gate` back OUT of L6 | the kind clause |
| 6 | `AGENTS.md` section 19, a README pair | an executed `run` snippet — the TV shape, `RunState.gated`, a drop to an `end`, a consumer's gate type stopping a run with `UndeclaredRoute` — and `README.md`'s seventh `X8` pair | `b7`, `b13`-`b15`, `b18`, `e2`; `X4`, `X8` |
| 7 | `0.6.0` | both manifests; README's four breaks and the whole additive list; `X9`'s probe made version-agnostic | `b17`; `X9` |
| 8 | the counts, and the reverts | four L6 copies at 2069 / 154; the revert costs below | the conformity reader's finding 1 |

### Verification — every rung RUN, never piped, its exit code read

| rung | result |
|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each separately, re-run after the last file | **exit 0, all six** — and on the first pass **`lint` exited 1** on one unused local in the gate clause, while printing *Checked 129 files* either way (section 4's W50 case) |
| L1-L5 node / deno / chromium | **53 files / 1423 assertions in all three, UNMOVED** — the census test's literal moved and its count did not |
| L6 node and deno | **2069 assertions over 154 real runs in both** on the final tree; four consecutive clean runs of EACH runtime on the pre-reader tree, the arrangement's timing included |
| `check:spec` | **7 / 65 / 125**, unmoved |
| `check:docs` | **37 snippets: 31 run, 6 check**; `X8` compares **seven** pairs |
| `check:workers` / self-test | **21 workers**, 2 not checked / **24 probes, 9 gradings** |
| `check:docs:selftest` | **34 / 34, 21 / 21** — after it was RED at **20 / 21** on my own probe edit (What broke 4) |
| `check:markdown` / self-test | **159 documents, 7240 links, 394 anchored** before the record step / **7 / 7** |
| Q142 | declaration: `M3` margin **4**, `M4` **895**; before the record step **3** / **864** — **does NOT fire**, `M3` moving by this file exactly as predicted; after it — see the gate row |
| `npm run gate` | first confirming run **`GATE EXIT=1`, ONE `FAIL` line** (What broke 11), digest `408fedc0e5c0d539` identical at both ends; the second, on the fixed tree: **`GATE EXIT=0`, 1177 s, ZERO `FAIL` lines**, content digest `dfd26e5dc23350ef` over 414 files IDENTICAL at both ends; `selftests` **8/8 in 1026 s wall**. The row you are reading is the one edit made after it |

### What reverting costs at L6 (in copies; the live tree untouched)

| revert | cost |
|---|---|
| **W93** (`src/` from `fb2a981`) | **ONE named failure** — the first TV row: *the run THREW … a gate is a valid definition and this driver cannot run one yet* (ADR 0066 rule 7) — and the row loop stops there |
| **W92 and W93** (`src/` from `03190d0`) | **a CRASH at module link, ZERO failure lines** — `does not provide an export named 'distinct'` ([Q392](../open-questions.md)); with that import neutralised, **one named failure**, `FD-V24` on the first TV row |
| each gate clause | rule 8's `a`-probes: `distinct` without memory **10**, inverted **9**, memory per map item **10**, the key handed on **3**, the settings **3**, the default edge **9**, a fresh memory on replay **4**, the process's memory **2**, `gated` fed **4**, the fold recording nothing **3**, the key path to one segment **16** — and the decision appended after its target **0** at L6 (L1 is its second road) |

### Rule 8 — three passes, v0.24's grader controls on all three

`dev-dist/w94/rule8.py`, after W93's, with a MOVE edit for renaming a file: node 24 and deno 2 asserted; a CONTROL; every anchor
exactly once against the current bytes, undone on abort; restores byte-asserted; a content digest over tracked and
untracked-unignored files at both ends; a timeout on every rung; the reason matched on the clause's own failure line (the one
line after `FAIL  <key>` for L6); **`gX` (l6.ts throws at load — right verdict CRASH) and `gW` (download's path wrong, graded
against a gate clause — right verdict WRONG-REASON) on every pass**. Obligation (b) is run as COMPOUNDS: each claim made a
tautology together with the product defect it guards, so a catch names the claim's SECOND observer.

| pass | probes | result |
|---|---|---|
| author | 43 | control clean, both grader controls RIGHT, **40 caught, 0 survived, 0 aborts, 0 against declaration**, digest `7f985f9dafe96d46` identical. Three claims have no second observer AT L6 and are held one rung over: a `gated` element's order and `RunState.gated` at L1 (`a12`, `b6`), and *what left the gate* by section 19's snippet (`b7`) |
| 2 — with the readers' exact edits | 54 | control clean, both grader controls right, 47 caught, 3 declared ceilings, **1 against declaration — the reader's `r4` SURVIVED MY FIX** (What broke 7) |
| 3 — the final tree *(it was NOT: pass 3 ran at `b6d1ae564aa3644b`, BEFORE the confirming gate turned What broke 11 up, and only `b16`, `d2` and the controls were re-run on the fix, at `12a3a199311aa160`; the whole set on the shipped tree is P24's retro's — corrected there under pass 3 rule 6)* | 54 | **control clean, `gX` CRASH and `gW` WRONG-REASON as declared, 48 caught, 3 declared ceilings RUN, 0 aborts, 0 against declaration**, digest `b6d1ae564aa3644b` identical at both ends |

**The three ceilings, each run against the rung its reason names**: `rc2` — file 0's two `beside` ids moved back into the
ORDERED comparison survives on this tree, because the inline downloads DO settle in index order; they are compared as a set
because `spec/` does not fix the order, not because it varies here; `r5` — the realm subject deleted from
`PER_ROW_SUBJECTS`, a membership entry derived from the rows ([Q217](../open-questions.md)); `r7` — the realm claim made a
tautology while the threaded row runs inline: ONE observer of threadedness at L6.

### What broke, and which rung caught it

| # | what | caught by |
|---|---|---|
| 1 | a serial pool DEFEATS an arrangement, and Deno's threaded pool nearly repeats Q379's trap (28 of 30) | a RUN at the declaration step — no rung |
| 2 | with the per-series road joining the per-file join, every row field naming `beside`'s record would have named the winner | READING at the declaration step — the design changed before a row was written |
| 3 | `checkWiring` reads the natural wiring `no` through the gate ([Q391](../open-questions.md)) | `check`-by-hand at the build, then L6's wiring clause and the L4 census, by name |
| 4 | my `X9` probe edit wrote `9.9.9-never`, which `X9`'s digit regex does not match — the probe tripped the *sentence not found* clause and the META grading read it STILL CAUGHT with the comparison disabled | `check:docs:selftest`, **20 / 21** — a provocation firing for another reason (v0.10), in a GATE ENTRY |
| 5 | two L6 TYPE clauses read a GATE's `type` (`distinct`) as a registry node type; ADR 0062 rule 4's and CONTROL 2's literals; the schema literals; the missing subjects of my own cross-row claims | L6, BY NAME, on the rows' first run — a node-kind site W92's census (`kind ===`) could not list, because its read is `.type` |
| 6 | `nokey` exercised by nothing at L6 if the file table lost the trailer — every derived count agreeing | rule 8 PLANNING, before a probe ran; closed by a control reading the TYPE's routes |
| 7 | **the fix for the adequacy reader's finding 4 compared the realm to `threaded ? 'thread' : 'harness'`, so the reader's own edit moved both sides and survived** | rule 8 pass 2's re-run of the readers' exact edits — v0.8's founding observation, in this item |
| 8 | the four L6 count copies at 2059 on a tree running 2060; the rows asserting a fan-out's COMPLETION order (W51's class) | the CONFORMITY reader — **no rung**; both BLOCKING |
| 9 | the sweep control counting kill points without checking they were DISTINCT (duplicates hid a memory fresh between decisions, green in both runtimes); *what left the gate* compared on two fields of four | the ADEQUACY reader — **no rung**; both BLOCKING |
| 10 | an unused local; a heredoc with backslashes (the discipline broken once, the bytes checked and right) | L0 `lint`, by EXIT CODE; the author |
| 11 | **the LAST-first row's `pathEnds` asserted IN ORDER — and the per-series road's `seriesReady` lands when its task SETTLES while a drop ends at the gate synchronously, so their interleaving is a COMPLETION order**: green in ten runs, then red in deno inside the confirming gate (`seriesReady, seriesReady, dropUnidentified, seriesReady, …`) | **the confirming `npm run gate`, `GATE EXIT=1`, one FAIL line** — the conformity reader's finding 2 one field over, which neither reader reached; closed by comparing a gated row's path ends as a MULTISET, the decision order being asserted where it is a fact (the arrangement clause); the probes whose second observer is `pathEnds` (`b16`, `d2`) re-run with the controls and caught |

### Readers — both in isolated byte copies with `node_modules` copied, zero links, verified green first; the tree at `7f985f9dafe96d46` until both reported

**Conformity: 9 findings, 2 BLOCKING, and ZERO disagreements on the VALUES** — every dispatched id, `gated` element, opener,
`pathEnds`, `beside` record, `publish`'s two-level record, the arrangement's effect and the pair, and block (2h)'s 25 kill
points, 15 / 9 / 1, 7 and 19, all derived on paper first. What it found were CLAIMS and one ORDER: the L6 count copies
(finding 1); a fan-out's completion order asserted (2); `AGENTS.md`'s *three ways* (3); the additive list eight names short
(4); five claims this item made false — *two* threadable types in three places, CONTROL 2's figures, `fetch` for `download`,
ADR 0067's consequence (5); Q391 cited with no row (6); block (2h)'s memory term discriminating nothing at the END of a run
(7); a table row saying decisions are replayed into the memory (8). Owns audit: **zero undeclared.**
**Adequacy: 6 findings, 2 BLOCKING** — duplicate kill points (1), the handed-on value on two fields (2), a memory cleared the
moment the replay ends with one observer at L6 (3), the threaded row green inline (4), the two wrong selections one here (5),
an entailed control component (6). **Every finding is acted on**; the readers' exact edits are probes `r1`-`r7`, `rc2`, `rc7`,
and all but the declared ceilings are CAUGHT. **Overlap 2 — the FIFTY-NINTH measurement**: the `identify` dispatch order (the
conformity reader's completion order, the adequacy reader's coinciding selections) and block (2h)'s memory observation (the
end-of-run term, the replay-end clear) — each reached from opposite ends.

### Exceptions — marked at the build

| file | used? |
|---|---|
| `scripts/check-docs.mjs` | **used** — `RUN_FLOOR` 31, `README_SNIPPET_FLOOR` 7, the seventh pair |
| `scripts/check-docs-selftest.mjs` | **used** — `X9`'s probe version-agnostic (and corrected, What broke 4); the unclosed-fence probe's comment |
| `test/definition/wiring.test.ts` | **used** — 28 flows, 72 / 2 / 5 / 2 / 8, and the false `no` asserted |
| `spec/outcome-record.md` section 4 | **used** — *16 of 193*, *177 (92%)*; no version move |
| `scripts/check-workers-selftest.mjs` | **used** — the tally at 21 |
| `doc/plans/p24-*.md` | **used** — outside its Record: the seeded rows and prediction 3 |

**Zero undeclared** (the conformity reader's audit; `doc/decisions/0067-*` is a record-step file).

### Predictions (P24)

3. **CONFIRMED — the REACH holds, with ONE named exception outside the run.** The TV flow runs as the maintainer described it:
exactly one per-series branch per series whatever the arrival order (two arranged orders, one pool-chosen order, a different
file opening each multi-file series), thumbnails for every file, the run `completed`, and identical after a kill at every kill
point in both runtimes. No shape the flow needed was one a gate could not express; **what could not follow it is the WIRING
CHECK**, which reads the gate as a pass-through and calls the per-series arc `no` ([Q391](../open-questions.md)) — an
authoring tool's conservatism, not the run's.

### Questions

**Resolved: [Q379](../open-questions.md)** (arranged, asserted, and a serial pool shown to defeat any arrangement) and
**[Q381](../open-questions.md)** (the list is README's, and it has four breaks). **Raised: [Q391](../open-questions.md)** and
**[Q392](../open-questions.md)**; [Q387](../open-questions.md) extended with its real-worker measurement. **Q393 unused and not
reused.** Census **303 / 235 / 1 / 67**, by W92's parser, which first reproduced **301 / 235 / 1 / 65**; every id in exactly one
cluster cell. W95 stays reserved, unused, for P24's retro to close.
