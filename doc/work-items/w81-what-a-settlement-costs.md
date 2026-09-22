# W81 — what a settlement costs: the check's price, and the clone nobody chose

**Status:** done
**Plan:** [P21](../plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) — *what does a
run-time schema check buy, and what does it cost against what a settlement already pays?*

```
Spec:       none — this item writes no rule. `spec/outcome-record.md` section 4's COST
            paragraph is W80's and is RE-MEASURED here rather than rewritten.
Owns:       examples/**, test/** as the measurement needs
Inputs:     P21 facts 1, 2 and 4 and W80's prediction-1 reversal, all four re-taken on this
            tree (below); ADR 0060; OR-R2, OR-R11 and OR-R13; Q179 and Q320.
Outputs:    (1) `examples/settlement-cost.ts` — what one settlement costs, on real workers,
                in both runtimes, checked in and NOT a gate entry (`retention.ts`'s precedent)
            (2) the check's price as a RATIO to the clone, at L6's scale with the check ON,
                on BOTH axes — the VALUE and the SCHEMA — with the DIRECTION asserted and no
                figure asserted (Q179, plan decision 5)
            (3) Q320 priced where it bites, and the OPT-OUT measured: exactly +1
                `structuredClone` per settled task — one more copy of everything `OR-R2`
                already copies — and the road by which a consumer declines it
            (4) `test/driver/result-schema-cost.test.ts` at L1-L2 — the CLOCK-FREE observers
                that make (2) and (3) claims a gate keeps rather than numbers a reader trusts
Depends on: W80
Blocks:     W82
Tests:      `test/driver/result-schema-cost.test.ts` on a fake scheduler, where every
            settlement is the test's own. The two observers are COUNTS and never clocks: how
            many times the driver reads a worker's `outputSchema`, and how many
            `structuredClone` calls a run makes. Expected values are derived from the number
            of settlements the case drives, never from a reading.
Gate:       L1-L5; a MEASUREMENT, not a rung; both figures as RATIOS (plan decision 5)
Reserves:   Q335-Q339, ADR 0061 (expected unused)
```

## Scope

**In**

1. **The check's price**, re-taken with the check ON, on real workers, at L6's scale — as a ratio
   to the `structuredClone` `OR-R2` already pays on the same settlement, and on **both** axes,
   because W80 measured that the two costs are linear in different things.
2. **[Q320](../open-questions.md)'s unconditional clone**, priced at a shape where it bites, and
   **whether a consumer can decline it** — decided here or declared unreachable (the plan's W81 row).
3. **A clock-free observer of both**, because [Q179](../open-questions.md) says wall time here is not
   reproducible and a cost a ceiling is dated to must be re-runnable by whoever inherits it.
4. **`z1`, W80's ceiling DATED TO THIS RUNG**, re-run with its measurement printed beside it
   (`doc/workflow.md` rule 8, the harness clause, v0.17).

**Out** — with where each goes instead

- **Any change to what the check costs.** Making `findings` cheaper is a cost change to `src/`;
  this item measures and does not move it. Nothing in `src/` is edited.
- **Turning the check on anywhere.** Plan decision 1, and W80 measured that the honest reason for
  the default is COST — which is the number this item takes.
- **The L6 row, the reference, and L6's counts.** W82's, whole. **L6 UNMOVED here.**
- **A `spec/` rule or an ADR.** ADR 0061 is reserved and expected unused; the COST paragraph in
  `spec/outcome-record.md` section 4 is W80's and its figures are re-measured rather than restated.
- **[Q244](../open-questions.md) and [Q245](../open-questions.md)** — the shared-scheduler topology's
  own super-linearity, and the scheduler's own map. Both are `examples/retention.ts`'s subject and
  neither is a settlement's price.

## The declaration step — four numbers re-taken, and two of them move the plan

*Node 24.20.0 asserted, every probe RUN and redirected to `dev-dist/w81/`, tree held still at digest
`369bbcf28a718fe4` over 369 files, identical before and after.*

| | | |
|---|---|---|
| **fact 4** | **REPRODUCES in shape and conclusion**: validation is **96.6% / 13.9% / 5.6%** of the clone at 6 / 12 / 52 settlements, against W80's 90.3 / 14.1 / 6.0 and the plan's 92.9 / 14.7 / 5.9; `publish`'s big `joinPayload` is **0.3726 ms to clone and 0.0006 ms to check — 0.00x** | `fact4.txt` |
| **fact 2** | **REPRODUCES EXACTLY in count** — 46 → 52, 94 → 106, 414 → 466, one per settled task — and the time readings move again: 0.5 → 0.4, 2.4 → 2.6, 12.9 → 15.7 ms | `fact2.txt` |
| **fact 1** | **REPRODUCES to the decimal** — 15.0 / 486.0 / 2426.3 KiB walked, `driver.opts` refused by `v8.serialize`, `opts` skipped by name | `fact1.txt` |
| **prediction 1's reversal** | **REPRODUCES in direction and NOT in magnitude** — one `enum` of a hundred on a 0.5 KiB result reads **4.35x** where W80 read 3.08x, and on a 4 KiB result **1.59x** against 1.65x. The five rows W80 marked *over the clone* are over it again | `decl-p1b.txt` |

### Finding 1 — the corpus reaches MEGABYTE results through its own DATA, so stop-and-ask (c)'s permission is granted and UNUSED

P21 fact 2 reads *this corpus's workers return small values while the large payload sits at the
ENTRY*, and stop-and-ask (c) grants this item a worker that returns megabytes on that ground.
**Measured, it is a property of the three SHAPES fact 2 chose and not of the corpus.**
`map-alias`'s `TallyWorker` returns `{ seen, word }` where `word` is the map item's own word, so the
RESULT size is a function of the data exactly as the arity is — which is the road
`examples/retention.ts` already drives to 16 KiB:

```
  shape          settled   results held by the log   clones (shipped)   clones (pre-W77)
   4 x    1 KiB     6              12.3 KiB                52                 46
   4 x  256 KiB     6            3072.3 KiB                52                 46
   4 x 1024 KiB     6           12288.3 KiB                52                 46
   8 x 1024 KiB    10           24576.6 KiB                88                 78
```

**Twenty-four megabytes of settled results (24576.6 KiB = 24.0 MiB), on the corpus's own flow,
with no new worker, no new type and no new pool.** *(This read "twenty-four and a half", and
12288.3 KiB as "12.3 MiB", in five places: KiB divided by 1000. W81's conformity reader — the
conclusion survives and the number was wrong everywhere it was used, including the sentence that
spends stop-and-ask (c).)* The seeded exception is declared UNNEEDED below.
`dev-dist/w81/decl-q320.txt`.

### Finding 2 — Q320 is EXACT in count and UNRESOLVABLE in time, at every shape this corpus can reach

The same three passes, back to back, on the same tree:

```
  shape          +clones   ms in clone, pre-W77 -> shipped        ratio
   4 x    1 KiB    +6      0.3 -> 0.4 | 0.4 -> 0.4 | 0.4 -> 0.4   1.33x | 1.00x | 1.00x
   4 x  256 KiB    +6     12.6 -> 14.1 | 12.9 -> 16.9 | 14.3 -> 14.6   1.12x | 1.31x | 1.02x
   4 x 1024 KiB    +6     49.0 -> 66.3 | 49.7 -> 63.9 | 50.4 -> 58.5   1.35x | 1.29x | 1.16x
   8 x 1024 KiB   +10    109.2 -> 115.1 | 100.6 -> 127.2 | 99.3 -> 116.3   1.05x | 1.26x | 1.17x
```

**The count is the same integer all three times and the time ratio spreads 1.02x to 1.35x on rows
that differ by nothing** — the spread between three passes of ONE row (1.05 / 1.26 / 1.17) is as
large as the effect being measured. That is [Q179](../open-questions.md) at 24.0 MiB of results,
which is where an effect this size was supposed to become visible.

**So the honest statement of Q320's cost is not a percentage at all.** `OR-R2` clones every settled
result once; the handle clones it again; so the cost is **exactly one more copy of everything
`OR-R2` already copies — a ratio of 1.00x, by construction, at every shape** — and the reason it
cannot be read off a clock is that a run makes many other clones beside those two.

### Finding 3 — a consumer CAN decline it, and the road is a decision this repository already took

[Q320](../open-questions.md) says *a consumer who wants none of this cannot opt out*. Measured:
**`new Driver(flow, { ...runtime.registry, scheduler, runId, joinPolicy })` is the opt-out**, which
is [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 14's own sentence executed — `runtime.registry` IS the object
a runtime hands its own drivers, and a driver built that way has no `onFoldInput`, so `append` never
calls `freezeInput`.

```
  arity  4 x  1 KiB   runtime.start 40 clones / new Driver(registry) 34   difference 6, over 6 settlements
  arity 10 x 16 KiB   runtime.start 82 clones / new Driver(registry) 70   difference 12, over 12 settlements
```

**Exactly the settlement count, both times, which is the same integer the `src/`-mutating probe
reads** — so the road is measurable without touching `src/`. What it costs is stated in the
artifact rather than hidden: a consumer on that road has no `done` and no fold, and every way of
getting one back either installs an `onFoldInput` (which reinstates the per-settlement clone) or
calls `foldInputs()` (which clones **the whole sequence** on every call). `dev-dist/w81/decl-decline.txt`.

### Finding 4 — the schema the DRIVER reads is not the object the document declared, and it closes one observer road and opens another

`src/definition/registry.ts:393` keeps a worker entry BY REFERENCE, so an accessor on a document's
`outputSchema` should count every read the run makes of it. **It counts two per worker — 24 over the
twelve that declare one — both at construction, and none at run time** — because `src/scheduler/runtime.ts`'s `resolveWorkerUrl` spreads the entry
(`{ ...entry, url }`) to rewrite the URL, and a spread materialises an accessor. Measured: the
driver's own map holds a DATA property where the document held an ACCESSOR.

*That is `OR-R11`'s sentence one layer up — what crosses a copy is data — applied to a schema
rather than to a result.* **The schema OBJECT still crosses by reference**, so an accessor one level
deeper survives, and that is the clock-free observer this item uses: with no callback the driver
reads a worker's `outputSchema` **exactly as many times as construction alone does**, and with one
it reads it once more per checked settlement. `dev-dist/w81/decl-counter*.txt`.

## Verification

| clause | command |
|---|---|
| L0, five typecheckers | `npm run lint`; `npm run typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **run SEPARATELY**, because `npm run typecheck` is five lanes chained by `&&` and a chained rung reports its first failure and is silent about everything downstream |
| L1-L5 | `npm test` (node), `npm run test:deno`, `npm run test:browser` — every rung REDIRECTED and read by `$?`, never piped |
| the measurement | `node examples/settlement-cost.ts` and `deno run --import-map=examples/deno-import-map.json --allow-read --allow-net --allow-env examples/settlement-cost.ts` — **a measurement, not a rung**: it is not in the gate chain, on `examples/retention.ts`'s precedent, and L0 is what keeps it compiling |
| L6 UNMOVED | `npm run test:l6` — the declared result is **1639 / 55, unchanged** |
| `z1` re-run | `dev-dist/w80/rule8.mjs --ids z1`, and the measurement against the rung its reason names |
| [Q142](../open-questions.md) | `npm run check:markdown` AND **`npm run check:markdown:selftest`**, which is the only rung `M3`/`M4` can fire in — the conformity reader's, and the Verification table had no row for it |
| rule 8 | `dev-dist/w81/rule8.mjs`, twice: the author pass, and again with the readers' exact edits checked in |
| both readers | conformity and adequacy, adequacy in an isolated copy, both reporting rather than fixing |

*Routing cases (template):* **not applicable.** This item dispatches nothing new: every run it makes
is `map-alias` or a fixture W80 already shipped, and its whole output is two counts and a ratio.

## Exceptions — files this item edits outside its `Owns` and outside the record step

*Seeded from P21's table and MEASURED at this declaration step.*

| path | verdict | why |
|---|---|---|
| `examples/**` for a worker that returns MEGABYTES | **SEEDED, and measured UNNEEDED** | stop-and-ask (c) granted it; finding 1 measures that `map-alias` settles **24.6 MiB of results** through its data alone. *A permission granted on a fact about three shapes, and the corpus was never the constraint.* |
| `test/definition/l4-corpus.test.ts` | **inside `Owns`, not an exception — and declared here anyway** | `Owns` reads `test/** as the measurement needs` and this file is that, so the row is an over-declaration rather than a miss (W81's conformity reader). It is kept because the census is a standing obligation on any item adding a suite and the seeded table named it: the census is an equality over the suites that RAN, and this item adds one suite file |
| `examples/README.md` | **NEEDED** | its file table names every top-level file in `examples/` and this item adds one — [Q171](../open-questions.md), and the paragraph W71, W72, W74 and W78 each took LATE. **Its L6 counts do NOT move** and this item asserts that they do not |
| `scripts/build-browser-tests.mjs` | **PREDICTED NEEDED, and it is a deliberate prediction** | the browser bundle carries only what this script inlines, and **W76, W77 and W80 all predicted it unneeded and all three were wrong**. This item's suite reads no file outside `spec/examples/` *as designed* — to be measured at the build rather than asserted here |
| `scripts/check-markdown.mjs` | **PREDICTED UNNEEDED** | [Q142](../open-questions.md), measured at this declaration: `M3` = 123 against a fixture of 106 and a tree of 140 (margins **17 / 17**), `M4` = 5270 against 4449 and 6092 (margins **821 / 822**) — W80's midpoint retune. One markdown file and one ordinary record step do not spend 821 links |
| `doc/plans/p21-*.md`, outside its Record | **LATE, and it had nowhere else to go** | not the Record — **decision 8**, which is where *`examples/**` may hold a hand-built `Driver`* belongs once the maintainer has ruled on it. `doc/workflow.md` section 1 rule 5's record-step list names *the plan's Record* and this is the plan's DESIGN section, so it is declared rather than assumed. **W80 took this same file late for the same shape of reason** — its Scope carried a claim the plan's own commit had withdrawn — and v0.7 change 3's argument applies unchanged: *a gap that blocks a fix is worse than one that hides an edit* |
| `src/**`, `spec/**`, `doc/decisions/**` | **PREDICTED UNNEEDED** | this item measures and changes nothing. ADR 0061 is reserved and expected unused; the spec's COST paragraph is W80's |
| `package.json`, `deno.json` | **PREDICTED UNNEEDED** | nothing is exported and no version moves |

`README.md`, `CLAUDE.md`, `doc/README.md`, `doc/open-questions.md` and the plan's Record are the
**record step's** (`doc/workflow.md` section 1 rule 5) and are not exceptions.

## Record

**Status: DONE.** `examples/settlement-cost.ts` ships, [Q320](../open-questions.md) is **RESOLVED**,
and **L6 is UNMOVED at 1639 assertions over 55 real runs in both runtimes**, which is this item's
declared result.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0, five typecheckers | **RAN, green** | `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples`, each RUN SEPARATELY and read by `$?`, never through the five-lane `&&` chain |
| L1-L5 | **RAN, green** | **46 file(s), 1295 assertions** in node 24.20.0, deno 2.9.6 and chromium, from 45 / 1290 |
| the measurement | **RAN, green, in BOTH runtimes** | `node examples/settlement-cost.ts` and the same file under Deno with the import map, both **EXIT=0**. **A measurement, not a rung**: it is in no chain entry, on `examples/retention.ts`'s precedent |
| L6 UNMOVED | **RAN, green** | **1639 assertions, 0 failed, 55 real runs**, in node AND deno — unchanged, as declared |
| the other eight checks | **RAN, green** | `check:source`, `:docs`, `:workers`, `:wiring`, `:spec` (**7 / 61 / 108**, unmoved), `:markdown`, `:scheduler`, `:policies` |
| `z1` re-run | **RAN, and it is a CATCH** | `dev-dist/w80/rule8.mjs --ids z1` on the shipped tree: **`l1` exit 1 and `art` exit 1**, where W80 declared *nothing here can see it*. Its stated reason named this item's cost rung and the rung that moved it is **both** — the L2 suite as well as the artifact. W80's other TEN dated ceilings re-run here too, and all ten HOLD |
| [Q142](../open-questions.md) | **RAN, did not fire** | `check:markdown` and `check:markdown:selftest` both green. **re-taken on the tree this item SHIPS** (section 1 rule 5's WHEN clause), after the Record and the six record-step files: `M3` = 123 against a `doc/decisions`-out fixture of **107** and `M4` = 5270 against a both-out fixture of **4501** — margins **16 / 18** and **769 / 877**, W80's midpoint retune paying for itself. *(It read 107 / 4459 and 16 / 811 before the record step, which spent 42 links against a margin of 811 — P21's declaration faced a margin of 26 on the same fixture and routed around it.)* |
| conformity reader | **RAN** | **18 findings, 7 blocking** — and **its central obligation came back with ZERO disagreements on the VALUES**: it derived `findings`' three reads of `schema.type`, the 144 / 216 / 231 / 3.00 and 144 / 216 / 246 / 3.00 counts, the L2 suite's per-chain arithmetic and every rung's figure from the documents and `src/` before reading any output, and every one matched |
| adequacy reader | **RAN** | **61 mutations, 39 survivors, 16 findings, 6 blocking**, in a plain COPY with `node_modules` copied, verified green on three rungs before mutating and scanned for links after |
| overlap | **3** — the **FIFTY-FIRST** measurement | inside the 0-4 band, neither reader primed. The three shared subjects: the `snapshot()` clone counted as the run's, the closing prose's unmade measurement, and `ARITIES` |
| rule 8, author pass | **RAN** | 30 probes, **20 caught, 9 declared ceilings, 0 UNDECLARED survivors** — after six corrections it made itself: one CRASH (the artifact died on its own truncated `ENUMS` instead of reporting), two ABORTS (both anchors) and three AGAINST DECLARATION (three of my own `expect` cells wrong, all three in the direction that flattered the set) |
| rule 8, final pass | **RAN** | **51 probes, 36 caught, 14 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, control green, digest identical at both ends, with **all eighteen of the readers' exact edits checked in** |
| `npm run gate` | **RAN, `GATE EXIT=0`, zero lines beginning `FAIL`** | **31 chain entries**; `selftests` **8/8 completed, 8 ok**, 962.8 s wall over 6 lanes against 1929.8 s serial-equivalent. **RUN TWICE** — once over the tree as the item shipped (`d4316147e9c0e4bd`) and again after the maintainer's call on decision 8, which is the one the figures below are from. Digest **`8a60bcbc1b8286e4` over 372 files, identical before and after** — the tree HELD STILL for it, and nothing was edited while it ran. `spec` **7 / 61 / 108** and `docs` **33 snippets: 27 run, 6 check** — both UNMOVED; `source` 23 published files, 16 gate entries; `workers` 14 ran on a declared example, 2 not checked; `markdown` **141 / 6150 / 311**; L1-L5 **46 / 1295** in node, deno and chromium; **L6 1639 / 0 failed / 55 real runs in BOTH runtimes**. *(How it was read: `npm run gate > log 2>&1; GATE=$?; echo "GATE EXIT=$GATE"; grep -cE …` — the exit code captured into a variable in the SAME command **before** any reading tool runs, which is W80's finding one item on: its gate command ended in `grep -c`, which exits 1 on no match, and reported a green gate as failed.)* |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `examples/settlement-cost.ts`, in both runtimes, NOT a gate entry | **yes** | **nothing, and that is measured rather than assumed** — `z1` deletes it whole and `lint`, `check:source`, `check:markdown`, L1 and L6 are all green ([Q338](../open-questions.md)). What binds its two COUNT claims is `test/driver/result-schema-cost.test.ts`; its TIMED claim has **no second observer anywhere**, recorded rather than argued |
| (2) the check's price as a RATIO, on BOTH axes, direction asserted and no figure asserted | **yes** | `d1` (`SWEEP` to one row) and `d2` (`ENUMS` to the unmodified schema) each cost 1; `r-s3` (the grid run on ONE value twice) costs 1 against the pair's own byte difference; `r-a6b` (the row loop stopped after one) and `r-c14` (every value paired with the FIRST schema) cost 1 each; `r-a5` (the check ON deleted) costs 1 against the **control run**, whose `tally` schema refuses |
| (3) Q320 priced where it bites, and the OPT-OUT measured | **yes** | `a4` (`freezeInput` made unconditional) costs 2 rungs and `a5` (never run) costs 2; `d3` (the MEGABYTE shape dropped) costs 1; `r-a6c` (the printed shape not the shape that ran) costs 1; and at L2 `b3`'s compound is what fires when the suite's own equality is made a tautology |
| (4) `test/driver/result-schema-cost.test.ts` at L1-L2 — the clock-free observers | **yes** | `a1` — W80's `z1`, the check run for everyone — costs **both** rungs; `a2` (the check narrowed to one settlement per run) costs both; `r-a7` (the check narrowed to tasks outside a region) costs the MAP-REGION test, which is the shape this suite had to gain; `d6` and `r-a3` (each equality given two identical inputs) cost 1 each against the controls the adequacy reader forced |

### What broke

1. **The clone counter was counting the byte observer's own predecessor, and BOTH readers reached
   it from opposite ends.** `driver.snapshot()` is `this.log.map((r) => Object.freeze(cloneRecord(r)))`
   and `cloneRecord` calls `structuredClone` on every non-null result — so calling it before reading
   the counter added **exactly one clone per settled result to each arm, which is precisely the
   quantity block 2 asserts.** The printed absolutes were **17%** the harness's (34 / 28 where the
   runs cost 28 / 22). *P15's* independent excludes DOWNSTREAM OF THE FIRST'S APPARATUS*, in the
   file whose header cites that clause as its reason for removing the instruments in a `finally`.*
2. **And the first fix for it was worse than the defect, which rule 8's re-run is what found.**
   Reading the count before the snapshot, compounded with a driver that clones on both roads, came
   back **GREEN**: the harness's *+1 per settlement* and the handle's *+1 per settlement* are the
   same number, so **the two defects CANCEL** and `extra === settled` cannot tell them apart. The
   counter is *removed* before the log is read now — a construction rather than a guard, after which
   there is no ordering left to get wrong. **An undeclared survivor produced by acting on a reader**,
   which is v0.8's founding observation inside the obligation that states it.
3. **Block 1's *"the check ON"* was DECORATIVE, and the binding added for it was VACUOUS.** The
   adequacy reader deleted `onNonconformingResult` for zero: block 1 times `findings` itself, so
   whether the driver ran the check contributed nothing. The fix — *the run reported what these same
   schemas say about these same values* — was `0 === 0` on every row, **because nothing this corpus
   settles fails its schema**, and the re-run read it as an undeclared survivor. What closes it is a
   CONTROL RUN with `tally`'s `outputSchema` made unsatisfiable, so the equality has two non-zero
   numbers to compare. *v0.21's clause asked of the thing added to answer v0.21's clause.*
4. **`12.3 MiB` and `24.6 MiB` are KiB ÷ 1000, in five places** — 12288.3 KiB is **12.0** MiB and
   24576.6 KiB is **24.0** — and one of them is the sentence that spends stop-and-ask (c). The
   conclusion survives and the number was wrong everywhere it was used.
5. **`as never` on the one expression that IS Outputs (3).** The hand-built `Driver` was cast, and
   this file's header claims ladder L0 as its only coverage: with the cast in place the conformity
   reader deleted `scheduler`, misspelled `joinPolicy` and set `runId: 42`, and `typecheck:examples`
   was **clean**. Removing the cast typechecks clean too, so it bought nothing and erased everything.
   **Nothing can see a cast**, which is why the answer is to delete it rather than guard it — `r-c4`
   is a declared ceiling for that reason and `r-c4b` is the positive case that proves the coverage.
6. **ADR 0055 has no decision 14 — it is P18's — in FOUR sites, and two of them link a bare
   directory.** One compression made once and copied, which is W80's finding 7 one item on, and it is
   the class a `doc/` check has been refused for nineteen times: a claim attributed to a named file
   that the file does not make.
7. **The WITHDRAWN claim stood in the file the item was editing.** `examples/l6.ts`'s own assertion
   accounting still read *"nothing under `examples/` constructs a pool, a scheduler, a driver or a
   built-in group"*, present tense, forty lines of diff from the equality that replaced it. Section 1
   rule 5's third direction, in the same commit.
8. **`ARITIES` truncated to ONE value made block 3's headline, its v0.21 control AND its
   proportionality all silent at exit 0** — every one of them is gated on `length === 2`. The only
   guard left compared the loop count with its own declaration, which is v0.14's *a count is not a
   membership* in the file that cites the clause above it. **A control fails where two values are
   EQUAL; nothing there could fail where there is only ONE**, and that is v0.21's question answered
   in the direction the clause does not cover.
9. **The L2 suite's per-settlement test had no vacuity control where BOTH its siblings did** — two
   equal chain lengths and the equality compares a run with itself, at zero.
10. **The cost suite drove a plain CHAIN, so *once per checked settlement* was asserted at ONE
    shape.** A driver reporting only outside a region cost **zero** here and its three failures were
    all in W80's behavioural suite. The MAP-REGION test is the shapes clause instantiated for the
    COST claim; the artifact covered it on real workers and the artifact is not in the gate.
11. **Three of the artifact's own declarations were unbound and one crashed the file.** `SWEEP` had
    no minimum, `REPS` was derived into the prose so `REPS = 1` moved both together, the printed
    shape label was the loop's rather than the run's, the row loop could stop after one row, and
    `ENUMS` truncated made the file die with a `TypeError` **instead of reporting** — *a crash is not
    a detection* (W59), in a measurement file whose own declaration could crash it.
12. **Each of the three blocks was deletable on its own at exit 0**, taking Outputs (2), Outputs (3)
    and the `z1` ceiling's only observer with it. `examples/retention.ts`, cited in this file's header
    as the precedent, carries `if (ran !== SWEEP.length)`; this file's own comment claimed the same
    shape one layer up while counting nothing at the block level.
13. **`examples/README.md` is walked by NO check** — `check-markdown` reads `doc/`, `spec/` and the
    three root `.md` files — so the row this item adds, its link and its figures are unchecked in
    every direction. Measured with a deliberately dead link at `check:markdown` **EXIT=0**, in the
    file that has been a late exception on five items ([Q337](../open-questions.md)).
14. **`examples/README.md` quoted two clock readings as if they were properties**, and the pair that
    maximises the gap: 15.9% against 40.4% out of readings that span 58-95% on one row. In a document
    read before every work item, under a heading citing [Q179](../open-questions.md).
15. **A PREDICTED-NEEDED exception was NOT needed**: `scripts/build-browser-tests.mjs` is unmodified
    and chromium reports 46 / 1295 with parity. **W76, W77 and W80 all predicted it UNNEEDED and all
    three were wrong**; this item predicted it NEEDED on their precedent and was wrong the other way.
    *The prediction has now been wrong in both directions in four consecutive items.*
16. **A MARKER IS PERMISSION A FILE GRANTS ITSELF, and the first cut of this item's widening was
    exactly that.** `examples/l6.ts` asserted P18's exit artifact as *nothing under `examples/`
    constructs a pool, a scheduler, a `Driver` or a built-in group*, and the Q320 opt-out is a
    hand-built `Driver`, so the file that prices the two roads had to hold one. The claim was
    replaced with an equality against the files that DECLARE it — and measured afterwards, W67's
    adequacy reader's own mutation (`new ConcurrentLimitGroup(99)` in the SHIM) is **RED declaring
    nothing and GREEN with one comment line typed above it**, with `lint` indifferent
    (`dev-dist/w81/a8-check.txt`). *What the claim was bought for survived and what it could refuse
    shrank.* **Put to the maintainer and answered: the equality is THREE-way** — the constructors,
    the declarers, and a literal list in `examples/l6.ts` — so an exemption costs an edit in the
    file that wants it and an edit in the file that makes the claim. Four probes are its evidence
    (`j1`-`j4`), and `j3` is the road that was green.
17. **And the decision was in nobody's plan.** *`examples/**` may hold a hand-built `Driver`* is a
    standing constraint on a directory, and it lived only in this file and an `l6.ts` comment —
    `doc/workflow.md` section 1 rule 3, *a decision that is not in `spec/`, an ADR, or a plan did
    not happen*, where an assertion's own comment is none of the three. It is **P21 decision 8**
    now, with the measurement in it, taken as a late exception on W80's own precedent.
18. **The seeded exception stop-and-ask (c) spent was never needed.** `map-alias` settles **24.0 MiB
    of results** through its DATA alone, so P21 fact 2's *this corpus's workers return small values*
    is a property of the three SHAPES it measured and not of the corpus. Permission granted, unused.

### What this taught

**P21 prediction 4 is NEITHER, and it is the SECOND occurrence of [Q326](../open-questions.md)'s
class — a prediction ambiguous between two observables that disagree.** It says *Q320 does not bite
at this library's own corpus and needs a shape built for it*, and both halves get different answers
from different instruments:

- **in COUNT it bites at every shape, including the smallest fact 2 measured** — +1 `structuredClone`
  per settled task, the same integer in three passes through `src/` and on the two public roads, at
  6 settlements and at 24.0 MiB of results alike. So *does not bite* is **false**;
- **in TIME it does not bite even at 24.0 MiB** — three back-to-back passes of one row read 1.05x,
  1.26x and 1.17x, a spread as large as the effect. So the prediction's conclusion **holds**, for a
  reason that is about the instrument rather than about the corpus;
- **and *needs a shape built for it* is false twice over**: the corpus reaches the shape unaided, and
  reaching it does not make the effect visible on a clock.

*A prediction whose scope column correctly named what it did not cover, and which still could not be
answered yes or no, because the thing it asked about is exact in one observable and unresolvable in
another.* P20's retro named that shape once; this is the second.

**Q320 is RESOLVED, and the answer's second half is a road this repository already owned.** The
opt-out is `new Driver(flow, { ...runtime.registry, … })` — P18 decision 14's own sentence executed —
and it is measurable **without touching `src/`**, which is what makes it a consumer's road rather
than a probe. Its price is stated rather than hidden: that consumer has no `done` and no fold, and
every road back to one either installs an `onFoldInput` (reinstating the clone, per settlement) or
calls `foldInputs()` (which clones the whole sequence on every call). *So the opt-out is for a
consumer who does not ask the driver what happened*, which is a narrower answer than *yes* and is
the one the measurement supports.

**The Gate line says *both figures as RATIOS* and this item departs, and the departure is the
finding.** Plan decision 5 is right about what it was written for — [Q179](../open-questions.md), and
a millisecond is a machine. But **a ratio of two clocks is still two clocks**: measured on one tree
over the same settled values, block 1's six-settlement row reads 58% to 95% across eight readings and
its twelve-settlement row reads 15-25% in node against 27-40% in deno. So this item states the check's
price as a RATIO with only its DIRECTION asserted, and states the handle's price as a **COUNT** —
*one more copy of everything `OR-R2` already copies* — because that came back byte-identical in both
runtimes at every shape. [Q335](../open-questions.md): decision 5 is necessary and not sufficient.

**And the one claim this item WIDENED was put to the maintainer and came back narrower than it shipped.** The Q320 opt-out is `new Driver(flow, { ...runtime.registry, … })`, so the file that prices the two roads has to build one — which `examples/l6.ts`'s *nothing under `examples/` constructs a pool, a scheduler, a `Driver` or a built-in group* forbade. Measured on the shipped tree: with a MARKER alone, W67's adequacy reader's own mutation is still RED when it declares nothing and **GREEN the moment one comment line is typed above it** — *the claim caught the careless and stopped catching the deliberate*, because a marker is permission a file grants itself. The equality is **THREE-way** now — the constructors, the files that declare it, and a literal list in `examples/l6.ts` — so an exemption costs an edit in the file that wants it AND in the file that makes the claim, and it is **P21 decision 8** rather than an assertion's own comment (`doc/workflow.md` section 1 rule 3). Still ONE assertion, so L6 stays at 1639.

**And the method finding is that the two clock-free observers are two implementations over ONE
apparatus.** Block 3 and the L2 SWITCH suite both count reads of a `get type()` accessor at the same
depth on a worker's `outputSchema`, *deliberately, so the two count the same thing* — which is
obligation (c)'s LIMIT from the side its wording admits and its argument does not.
[Q339](../open-questions.md), recorded rather than closed: the alternatives were measured at P21's
declaration and refused (bytes cannot see a clone; identity is confounded by `foldInputs()`'s own
clone), and a shared instrument present in BOTH arms cancels out of the difference.

### Questions raised

| Q | |
|---|---|
| **Q335** | **A cost quoted as a RATIO is not reproducible across RUNTIMES either, so P21 decision 5 is necessary and not sufficient.** The same values, one tree: 58-95% over eight readings of one row, and 15-25% in node against 27-40% in deno on another |
| **Q336** | **The schema the DRIVER reads is not the object the document declared** — `resolveWorkerUrl` spreads the worker entry to rewrite its url, so an accessor on `outputSchema` is materialised at construction and the run never sees it. `OR-R11`'s sentence one layer up, written down for a result and not for a schema |
| **Q337** | **`examples/README.md` is walked by NO check**, measured with a deliberately dead link at exit 0 — in the file that carries L6's counts and has been a late exception on five items |
| **Q338** | **A checked-in MEASUREMENT that nothing runs, for the second time**, and the two are bound differently: `retention.ts`'s observer by `l6.ts`, and this file's two COUNT claims by an L2 suite while its TIMED claim has no second observer anywhere |
| **Q339** | **Two observers, ONE apparatus** — obligation (c)'s LIMIT from the side the clause does not name: two independent implementations that both count reads of the same accessor at the same depth |

**Late exceptions: ONE, and ZERO undeclared.** The one is `doc/plans/p21-*.md` **outside its Record**
— decision 8, added after the maintainer ruled on the claim this item widened, which is W80's own late
exception on the same file for the same shape of reason. Every other path `git status` names is inside
`Owns` (`examples/**`, `test/**`), is this item's own file, or is one of the six the record step allows —
and `doc/decisions/**` is untouched, because there is no ADR. Every seeded prediction was MEASURED at the
build: `examples/README.md` needed, `scripts/build-browser-tests.mjs` **predicted needed and not needed**,
and `src/**`, `spec/**`, `scripts/check-markdown.mjs`, `package.json` and `deno.json` all predicted
unneeded and unneeded. The grep for this item's own id outside `doc/` returns nine files, **seven of them
this item's own** and two of them W80's forward references — *W81 owns the rung that can see it* — which
this item makes true rather than false.

**Resolved: [Q320](../open-questions.md)** — the cost is EXACT and the opt-out EXISTS. **Census
261 / 203 / 2 / 56**, 261 of 261 in exactly one cluster cell, 0 aborts. **Q340-Q344 remain for W82;
ADR 0061 is reserved and UNUSED.**
