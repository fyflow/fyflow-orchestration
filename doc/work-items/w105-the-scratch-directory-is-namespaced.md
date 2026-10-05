# W105 — The scratch directory is namespaced

**Status:** done — see the Record. An item outside any plan.

```
Spec: NONE expected — no rule moves.
Owns: scripts/check-docs-selftest.mjs, scripts/check-markdown-selftest.mjs,
      scripts/check-source-selftest.mjs, scripts/check-wiring-selftest.mjs,
      scripts/check-spec-selftest.mjs, scripts/check-policies-selftest.mjs,
      scripts/check-workers-selftest.mjs, scripts/check-scheduler-selftest.mjs,
      scripts/run-selftests.mjs, doc/work-items/w105-the-scratch-directory-is-namespaced.md
      — and `scripts/check-wiring.mjs` ONLY if the exclusivity markers are retired, which
      is a measurement this item takes rather than a decision it inherits
Inputs: Q181 and Q182 (the marker is bound to nothing; `dev-dist/` is a shared namespace
        with FIXED paths that nothing namespaces); Q426 (12 574 leaked directories);
        Q323 (a killed harness leaves its scratch behind); W103's finding 3
Outputs: (1) every self-test's scratch lives under a path unique to its PROCESS and is
             removed on the way out, including on the abort path
         (2) Q426 closed: no directory survives a run, and a killed run leaks one path
             rather than one per probe
         (3) whether the two `SELFTEST-EXCLUSIVE` markers can be RETIRED — measured, with
             `G4`'s derived set moving with them if they can, and recorded if they cannot
         (4) whether probe-level concurrency inside a lane is unlocked — measured on
             `check:docs:selftest`, which is 98% of the self-test wall
Depends on: W104, which edits `check-docs-selftest.mjs` too — these two are SERIAL
Blocks: W106 (workers), only in that both want a quiet tree to measure on
Tests: all eight self-tests; `check:wiring` G3/G4/G5 if the markers move
Gate: selftests, check:wiring, check:source, npm run gate:full
Reserves: W105, Q433-Q437, ADR 0072 (expected SKIPPED unless the markers are retired, which
          would supersede part of ADR 0039)
```

## Why

**`dev-dist/` is one flat namespace with fixed paths, and three separate defects come out of it.**

1. **[Q426](../questions/q426.md), measured 2026-09-30**: `scripts/check-markdown-selftest.mjs:730`
   builds `dev-dist/markdown-selftest-${process.pid}` and nothing removes it. **12 574 empty
   directories** had accumulated — 12 691 top-level entries where the useful count is 121, at roughly
   **117 per gate run**. Deleting them took **257 s**. Nothing reports it: the directories are empty,
   `dev-dist/` is gitignored so `git status` is silent, and every self-test passes.
2. **[Q182](../questions/q182.md)**: `check:wiring:selftest` stages every `scripts/check-*.mjs`
   **flat into `dev-dist/`** — the directory every other self-test uses for scratch — which is why it
   and `check:scheduler:selftest` carry `SELFTEST-EXCLUSIVE` markers and run alone.
3. **W103's finding 3**: a gate killed mid-run left `dev-dist/check-wiring-stub-27708.mjs` behind,
   it glob-matched `check-*.mjs`, and the next `check:wiring:selftest` **control** went red —
   *every verdict below would be a fact about the harness rather than about the check*. The real probe
   failure underneath it was invisible until the stub was removed. [Q323](../questions/q323.md)'s class.

**One change pays three ways**, and a fourth is the prize: per-probe scratch is what would let a lane
run its probes concurrently, which dwarfs anything W104 can win inside a single check.

## What to be careful of

1. **[Q181](../questions/q181.md) says the marker is bound to nothing** — removing it alone was
   measured at **zero** cost. `G4` derives the exclusive set from the markers and compares it to the
   runner's; if the markers go, that clause's subject goes with them, so this is a `check:wiring`
   edit and a probe, not a deletion.
2. **Retiring a marker is a DECISION about ADR 0039**, which chose concurrency with those two alone.
   If the measurement says they can now share the tree, that supersedes part of 0039 and wants ADR
   0072. If it does not, record the reason — `check:scheduler:selftest` moves
   `node_modules/fyflow-scheduler` aside, which is process-wide whatever the scratch path is, so the
   two markers may well have different answers.
3. **Removal must survive the abort path and a kill.** W103's finding 3 is exactly a cleanup that did
   not run. A `finally` covers the abort; nothing covers `SIGKILL`, so the honest target is *a killed
   run leaks ONE path, not one per probe* — which is what nesting buys and what a `finally` cannot.
4. **Do not let the cleanup become the thing that breaks.** A self-test that deletes the wrong path is
   worse than one that leaks; `dev-dist/` holds twenty-five plans' measured facts, deliberately
   gitignored, and [P22](../plans/p22-what-a-regions-identity-is.md)'s stop-and-ask (a) kept it that
   way on purpose.
5. **`CHECK_*` overrides point at fixed paths too.** `CHECK_WIRING_SCRIPTS: 'dev-dist'` is the
   control's own environment; anything namespaced has to reach those as well, or the control measures
   a directory nothing staged into — W38's adequacy reader measured an empty one printing `ok`.

## Declaration step — every input RE-TAKEN, and two of them were wrong by 76x and 7x

[P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md) decision 5: re-run, never
transcribe. Taken 2026-10-01 on `7868d91`, spawn health asserted first because
[Q179](../questions/q179.md) and [Q427](../questions/q427.md) say a timing taken in a bad window
measures Defender rather than the change: `node -e ""` through `spawnSync` is **47 / 50 / 48 / 48 /
47 / 47 / 50 ms** against the ~54 ms this machine is recorded at, and `cmd /c exit` is **18–36 ms**
against a session that has read 8 649 ms. A good window.

| input | as declared or inherited | measured | |
|---|---|---|---|
| `check:docs:selftest` | 1298.9 s (ADR 0070), 624 s (W104) | **608.2 s** | |
| `check:source:selftest` | **82.7 s** (ADR 0070) | **578.4 s** | **7.0x** |
| `check:markdown:selftest` | 477.3 s | 418.1 s | |
| `check:wiring:selftest` | **3.0 s** (ADR 0070) | **228.2 s** | **76x** |
| `check:spec:selftest` | 125.1 s | 84.4 s | |
| `check:workers:selftest` | 53.8 s | 42.8 s | |
| `check:policies:selftest` | 43.2 s | 25.1 s | |
| `check:scheduler:selftest` | 22.2 s | 14.9 s | |
| the self-test WALL | 1324 s (W103), **~649 s derived** (W104) | **851.3 s**, 2000.1 s serial-equivalent, 6 lanes | |
| the exclusive prefix | **25.2 s** | **243.1 s — 29% of the wall** | |
| the binding lane's SHARE | **98%** (W103), 96% (W104 derived) | **71%** | |
| [Q426](../questions/q426.md)'s leak total | 12 574 directories | **332 top-level entries** — 231 `markdown-selftest-<pid>`, 6 `wiring-selftest-<pid>`, 95 real | |
| Q426's leak RATE | not stated | **112 per `selftests` run, every one `markdown-selftest`, ZERO removed** | |
| `check:docs` | 4574 ms (W104) | 4166 / 4697 / 5151 ms | |

`npm run selftests` **EXIT 0, 8/8 ok** on the tree this item starts from, and the arithmetic closes
exactly: 243.1 (exclusive, serial) + max(608.2, 578.4, 418.1, 84.4, 42.8, 25.1) = **851.3 s**.

### Correction 1 — ADR 0070's `check:wiring:selftest` figure is a lane that EXITED AT ITS CONTROL

**3.0 s is not a measurement of that lane; it is the cost of failing before the probes start.** The
lane stages 22 files and spawns a check for each of 65 probes, so 3.0 s is arithmetically impossible
for a run that completes — and [W103](w103-the-local-gate-is-the-ladder.md)'s own **finding 3** says
what happened: a leftover `dev-dist/check-wiring-stub-27708.mjs` glob-matched `check-*.mjs`, `G3`
saw a check the manifest never declares, and *the control went red*, after which
`check-wiring-selftest.mjs` returns `done(1)` immediately. **So the number in ADR 0070's per-lane
table was produced by the very defect this item exists to fix**, and P11's retro's three readings of
that lane — 167.8 / 160.9 / 160.0 s — were the honest ones all along. *A lane that fails fast reports
a wall clock, and a per-lane table has no column for whether the lane ran.*

### Correction 2 — the item's output (4) is aimed at the wrong lane, and output (3) is the valuable half

> **WITHDRAWN IN PART by this item's own Record, and left standing here is itself the defect its
> conformity reader found (BLOCKING).** The 71% / 5% / ~30 s half holds. **The 1.37x and the *228 s off
> the critical path* do NOT**: the arithmetic below assumes a lane's wall clock is independent of how
> many lanes run beside it, and it is not — see **Output (3)** in the Record, where three comparable
> runs put the retired wall at 789.7 s and 1055.9 s against 851.3 s kept. *A correction that leaves its
> own superseded table standing in the present tense is the class this repository keeps recording.*

Output (4) says `check:docs:selftest` *"is 98% of the self-test wall"*. It is **71%**, and
**`check:source:selftest` is within 5% of it** — 578.4 against 608.2 — so the concurrent group's
floor is 578.4 s and halving the binding lane again is worth about **30 s**. Meanwhile the exclusive
prefix is **243.1 s of the 851.3 s wall**, and all but 14.9 s of it is `check:wiring:selftest`.
Arithmetic over these same lanes, with that one marker retired and the runner's seven concurrent
lanes against 20-way parallelism:

> 14.9 + max(608.2, 578.4, 418.1, **228.2**, 84.4, 42.8, 25.1) = **623.1 s against 851.3 — 1.37x, 228 s off the critical path.**

**[Q182](../questions/q182.md)'s price was right and W103's prefix was the artefact.** That row says
`dev-dist/`'s shared namespace costs *"roughly 175 s of critical path"*; W104 inherited 25.2 s from
ADR 0070 and derived a wall from it. Re-measured, the price is **228 s**. So the ordering inside this
item is the reverse of its `Outputs` list: the namespacing is what makes the marker retirable, and the
marker is where the saving is.

### Correction 3 — the depth constraint binds HALF the sites, and nobody had written the split down

> **WRONG, and the table below is kept with this marker rather than rewritten, because being wrong is
> what it is evidence of.** The discriminator is not *what the file IS* but **where it is EXECUTED
> from**. Four of the six rows in the mutant row are misclassified: every `.meta-*` is a copy of a
> CHECK and five of them are spawned directly, so they are depth-bound and flat — which
> `check:spec:selftest` reported as *29 of 29 graded by the CORPUS* when this table was followed. And
> `check-markdown-selftest.mjs` writes TWO copies of checks **two directories deep** and both are
> correct, because that child READS them into its own fixture. See the Record's *What broke* 1 and
> [ADR 0072](../decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)
> decision 3, which carries the rule as it ended up.

`check-wiring.mjs`'s header documents *"the directory must be a DIRECT CHILD of the repository root"*
with the three attempts that taught it. Measured, that binds only a mutant copy of a **CHECK**, which
derives `ROOT = resolve(dirname(self), '..')` — `check-policies.mjs` reads `spec/join-policy.md` at
module scope above its dispatch and dies one level deeper. A mutant copy of a **SELFTEST module** is
depth-free, because every dispatch is `selfTest(ROOT)` and passes the root in as a parameter. Verified
by grep: of NINETEEN `scripts/*.mjs`, exactly one imports a sibling (`check-spec.mjs` →
`./check-markdown.mjs`), which is why `stage()` must stay flat and nothing else must.

| site | what the file IS | depth-bound | where it goes |
|---|---|---|---|
| `check-docs.mjs` `OUT` | snippets, two tsconfigs, spawned children | no — every path is `relative(OUT, …)` | `dev-dist/docs-<pid>/` |
| `check-wiring.mjs` stub | a SELFTEST mutant | no | under a per-pid directory, so the `check-*.mjs` glob cannot see it |
| five self-tests' `dir` | fixtures | no | `dev-dist/<name>-<pid>/` |
| `.meta-docs-NN`, `.meta-spec-NN`, `.meta-sched-NN`, `.meta-NN`, `.self-source-NN`, `.self-policies-NN` | SELFTEST mutants | no | inside that `dir` |
| `.probe-NN.mjs` | a `check-source.mjs` copy | **YES** | stays flat, per-pid NAME |
| `.meta-policies-NN.mjs` | a `check-policies.mjs` copy | **YES** | stays flat, per-pid NAME |
| `stage()`'s 22 files | `check-*.mjs` copies, RUN | **YES** | stays flat — and [Q182](../questions/q182.md) already says relocating it would not help, *because the copies it runs are the real checks and they write the real paths* |

### Correction 4 — five sites write the same path TWICE, and namespacing one of the two is silent breakage

`dir` is built with `join(root, 'dev-dist', …)` and a second, independent relative literal is handed
to the override: `` `dev-dist/docs-selftest/${i}.md` `` (docs), `` `dev-dist/policies-selftest/…` ``
(twice), `` 'dev-dist/sched-selftest/absent.d.ts' `` and its sibling, and
`` `dev-dist/source-selftest/${i}` `` plus a third `join` for `tree-NN`. **Two sources for one path**,
which is [Q182](../questions/q182.md)'s original defect (`.self-NN.mjs` written by two files) one
layer in: pid one and not the other and the child reads a directory nothing staged into, which is
hazard 5's own shape and W38's adequacy reader's empty directory printing `ok`. Every one is derived
from `dir` rather than re-spelled.

### Correction 5 — Q426's victim cost has a number now, from the other side

That row prices the leak as *"deleting the 12 574 directories took 257 s"* and names
`check:wiring:selftest` as the victim at *"46 minutes at 1% CPU"*. The sharper measurement is the one
above: the same lane is **228.2 s at 332 entries** and **3.0 s when a single leftover file turns its
control red**. The accumulation does not merely slow its victim down — it is what produced the wrong
number in a shipped ADR.

## Record

**DONE, and [ADR 0072](../decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)
says what a scratch path is: it carries its PROCESS, it is removed on the way out including on the
abort path, and a self-test that shares the tree declares it.** Every scratch path a
`scripts/check-*.mjs` writes under `dev-dist/` now interpolates `process.pid`; **`G6`** in
`check-wiring.mjs` refuses one that does not; and **`check:wiring:selftest`'s exclusivity marker is
RETIRED** while `check:scheduler:selftest`'s stays — the two were measured separately, each with a
control, and they had different answers.

### What it closes, measured from both sides

| | before | after |
|---|---|---|
| [Q426](../questions/q426.md), the leak, per `npm run selftests` run | **112 directories**, every one `markdown-selftest-<pid>`, zero removed | **0** |
| three concurrent `check-docs` bodies | **0 of 3 exited 0** — one `X4` with ten snippet failures, two `ENOTEMPTY` crashes | **3 of 3**, 7179 / 7258 / 7259 ms |
| the one-child CONTROL, same tree | EXIT 0, 4469 ms | — |
| `check:wiring:selftest` beside a `check:docs` loop and `check:spec:selftest` | **19 of 96** victims green, every red `ENOENT … dev-dist/docs/tsconfig.dom.json` | **61 of 61** |
| `check:scheduler:selftest` beside a `check:docs` loop | — | **4 of 5** — the marker is KEPT |
| residue after a whole `npm run selftests` | 112 | **0** |

*The control is the point: the arrangement that proves nothing collides now is the arrangement that
went red before.* [Q182](../questions/q182.md)'s *a latent path collision is invisible until the day it
is not* is the day it was not, and that row's own prescription — *a derived scratch path per check plus
per process, and a clause that every write under `dev-dist/` goes through it* — is what shipped.

### The declaration step found two shipped figures wrong, one by 76x

Above, under **Declaration step**, with the arithmetic closing exactly: 243.1 (exclusive, serial) +
max(608.2, 578.4, 418.1, 84.4, 42.8, 25.1) = **851.3 s**. The sharpest is that ADR 0070's per-lane
table reads **3.0 s** for `check:wiring:selftest` where it measures **228.2 s** — *a lane that EXITED
AT ITS CONTROL*, which is W103's own finding 3 producing the number in a shipped ADR. `doc/workflow.md`
section 8 carried a wall DERIVED from that table and is corrected with the measurement.

### Output (3): the markers, and the item's own expectation REVERSED on cost

`check:wiring:selftest`'s marker is retired on CORRECTNESS. **No wall claim is made, and that is the
finding rather than modesty**: three end-to-end runs on this machine, twenty cores —

| | wall | serial-equivalent | lanes | |
|---|---|---|---|---|
| marker KEPT | 851.3 s | 2000.1 s | 6 concurrent + 2 alone | 8/8 ok |
| marker RETIRED | **789.7 s** | 2750.8 s | 7 + 1 | 8/8 ok |
| marker RETIRED | **1055.9 s** | 3542.0 s | 7 + 1 | 8/8 ok |
| marker RETIRED, inside the confirming `gate:full` | **747.7 s** | 2650.2 s | 7 + 1 | 8/8 ok |
| *(excluded)* | *1069.7 s* | *3925.2 s* | *7 + 1* | ***7 ok — the lane under test EXITED 1*** |

**The two COMPARABLE retired readings straddle the kept one**, so 851.3 s cannot be distinguished from
either — **308 s** of spread across three comparable retired runs (747.7 / 789.7 / 1055.9) against a 62 s difference from the kept one, which is [Q179](../questions/q179.md)'s band with a
number on it.

> **The fourth row is excluded and named, and leaving it IN was this item's own correction 1 reproduced
> in its own headline table** — its conformity reader, BLOCKING. That run was taken before the compound
> guard below existed, so `check:wiring:selftest` reported `exited 0: the mutation costs nothing` twice
> and the runner printed **7 ok**. The first version of this table carried it as evidence of a straddle.
> *A lane that fails fast still reports a wall clock, and a per-lane table has no column for whether the
> lane ran* — and neither did this one for whether the RUN passed. The straddle survived, on a second
> comparable reading taken for it. **And the arithmetic I predicted it from was wrong in exactly the way the figures I came here to
correct were wrong**: 14.9 + max(…) = 623 s assumes a lane's wall is independent of how many lanes run
beside it, and the serial-equivalent — 2000 s against 2751 and 3925 — says it is not. The seventh lane
costs every other lane **38% to 96%** of its own time, because the runner sizes its pool in LANES
while each lane spawns a deep process tree ([Q433](../questions/q433.md)). *The exclusive prefix was
accidentally a load governor and nobody chose it.*

### Output (4): probe concurrency is UNLOCKED, and it is a LOCAL-ONLY win

The blocker is gone (3 of 3 above). What remains is the PRODUCT, which is what the measurement bounds —
each `check-docs` runs its snippets through a pool eight wide since W104, so P probes is ~10P live
processes:

| P | ~live procs | per-child wall, TWO readings | throughput, two readings |
|---|---|---|---|
| 1 | 10 | 4654 / 6735 ms | 1.00x / 1.00x |
| 2 | 20 | 6350 / 8912 ms | 1.47x / 1.51x |
| 4 | 40 | 9484 / **18424** ms | **1.96x** / 1.46x |
| 8 | 80 | 23494 / 33995 ms | 1.58x / **1.58x** |

**The GAIN is about 1.5x and the SHAPE OF THE CURVE DOES NOT REPRODUCE.** The first reading peaks at
P = 4 and falls at P = 8; the second is flat within 8% and nominally best at P = 8, because the P = 1
baseline alone moved 45% between them. *That is [Q179](../questions/q179.md), and a peak read off one
pass is a claim about that pass* — which is the error this whole item is a catalogue of, so the peak is
withdrawn rather than reported.

**What DOES reproduce is the product's cost against a FIXED cap**: at P = 8 the check's own wall is
**23.5 s and 34.0 s** against [Q425](../questions/q425.md)'s **30 s per-SNIPPET deadline** — the same
order of magnitude as the thing it is measured against, where at P = 1 it is 4.7-6.7 s. **And on CI's
FOUR cores W104's width of eight is already 2x oversubscribed, so P = 1 is the limit there**: the win
exists only where nobody is waiting, which is the opposite of what ADR 0070 moved the proof to CI for.
**NOT SHIPPED**, on that, on the unreproducible curve and on W104's one-variable argument
([Q435](../questions/q435.md)).

**Output (4)'s own premise was false and is corrected**: `check:docs:selftest` is **71%** of the wall,
not 98%, and `check:source:selftest` is within 5% of it — so the lane this output names as the place to
win is capped at ~30 s of saving by a lane nobody had measured.

### What broke — FOUR defects of mine, and every one was caught by a RUNG

1. **`.meta-*` is a mutant of the CHECK, not of the self-test, so it is DEPTH-BOUND — and my own
   correction 3 said otherwise.** I classified three of them from their FILE NAME and nested them;
   every `.meta-*` is read from `check-X.mjs` and handed over as `CHECK_X_SCRIPT`, so it derives
   `ROOT = resolve(dirname(self), '..')` and read `dev-dist/` as its tree. `check:spec:selftest`
   reported **29 of 29 graded by the CORPUS, 0 by the named probe** — its own *if the whole list is
   corpus-backed, the harness broke rather than the check* clause, firing as written. The rule is
   cleaner than what I first wrote: **`.meta-*` is a check copy and stays flat with the pid in its NAME;
   `.self-*` is a selftest copy and nests**, because the dispatch hands it `ROOT`.
2. **A parameter named `dir` SHADOWED the scratch directory**, so `join(dir, 'note.txt')` in the
   scheduler's junction probe wrote into `node_modules/fyflow-scheduler` — which that probe had just
   deleted. `ENOENT`, suite dead, no verdict. The junction's TARGET is the scratch directory and its
   LOCATION is the install directory, and one name for both is how it went unnoticed; the parameter is
   `pkgDir` now and the scratch arrives as a fourth argument.
3. **A non-terminal `rmSync(dir)` between the META and SELF passes.** Invisible while `.self-*` was flat
   in `dev-dist/`, which always exists; nested, the SELF control died `ENOENT`. Closed by creating the
   directory where the `.self-*` path is built, which keeps the intervening cleanup's own meaning.
4. **`G6` fired on ITSELF, twice, and the second time it made a probe VACUOUS.** [Q178](../questions/q178.md)
   at its third and fourth occurrence: the `SHARED_SCRATCH` anchors quoted the pattern they search for,
   so the clause reported three failures against its own declaration list on its first run; then the five
   probes did the same and the control went red naming them. **The vacuity is the sharper half** — the
   probe written to assert *a declared exception's anchor no longer exists* CONTAINED that anchor, so it
   would have passed while proving nothing. Both closed by this repository's own idiom, splitting the
   token, as `run-selftests.mjs` does for the marker. [Q436](../questions/q436.md).

**And a fifth, which is the one worth carrying:** the two `SELF` entries that pin `PROBES` reported
**`exited 0: the mutation costs nothing`** after I moved that declaration onto two lines.
`if (mutated === selfSrc)` is rule 7 (b) over the WHOLE FILE, so a compound whose first `.replace`
matches and whose second does not changes the file and passes — **the entry ran, and graded a mutation
it had not made.** Closed in that file by instrumenting `String.prototype.replace` for the duration of
the call and counting the calls that matched nothing, which holds for any compound written later and
reads what the mutation DID. **It is LIVE in the other seven self-tests** ([Q434](../questions/q434.md)).

*Five defects, five rungs, and not one found by reading.* The two cheap lanes were run first on purpose
and that is what made (1) and (3) cost minutes instead of a 608 s lane.

### Also found

- **A false depth claim in `check-markdown-selftest.mjs`**, standing since W25: the comment above its
  spec mutant says *check-spec derives ROOT from its own location, so the copy must sit one directory
  below the repository root*, and `base` has been **two** directories deep since W25 put the pid in it.
  Nothing ever failed, because that mutant is never run from where it is written — the child READS it
  and writes the text into its own fixture. *A constraint quoted from a sibling file is a claim about
  this one.*
- **The `G1` unreadable-manifest probe declared that EVERY report row reads `NOT RUN`**, and `G6` reads
  the scripts DIRECTORY rather than the manifest, so it runs and reports `ok`. The probe came back *the
  report row disagrees with the failures* — **the expectation was wrong, not the clause**; gating `G6`
  on a readable `package.json` would invent a dependency to satisfy a probe and would silence a
  scratch-path collision on exactly the trees where someone is editing the manifest. `notRun` is a LIST
  now, which also makes the next clause's author choose.
- **A pid-based liveness test is not a way to reap leaked scratch on Windows.** Nine leaked directories,
  every one reporting its pid as ALIVE — pid reuse. Which is why the `rmSync` before `mkdirSync` stays
  and is load-bearing rather than tidy, and why nothing here deletes a path by guessing it is dead
  (hazard 4).

### Verification

| | |
|---|---|
| `selftests` | **EXIT 0, 8/8 ok, 789.7 s wall**, 2750.8 s serial-equivalent over 7 lanes, **zero residue** in `dev-dist/` |
| SEVEN lanes, each alone | all EXIT 0 — `check:wiring:selftest` 254 s, and `check:spec`, `check:scheduler`, `check:policies`, `check:workers`, `check:source`, `check:markdown`. **`check:docs:selftest` was NOT run alone** and is verified inside `selftests` only; the row read *the eight lanes, each alone* over a list of seven until this item's conformity reader counted it |
| `check:wiring` | EXIT 0, **G1-G6 all `ok`** |
| `check:docs` | EXIT 0; `X11` 40 rows against 40 ADRs both ways |
| `check:markdown`, `check:spec`, `check:source` | EXIT 0 |
| `check:wiring:selftest` probes | **40**, `MIN_PROBES` 39, five of them `G6`'s, each declaring `[G6]` and each CAUGHT |
| `check:wiring:selftest` | EXIT 0 — **41 probes, 41/41 caught; 14/14 graded; 6/6 bounded**, and **TWO controls** where it had one |
| `npm run gate:full` | **EXIT 0, zero `FAIL` lines**, digest **`d957581dbeaade89` identical at both ends over 434 files. `selftests` 8/8 ok, **747.7 s wall**, 2650.2 s serial-equivalent over 7 lanes. **Zero NEW residue in `dev-dist/`** — the only per-pid directories left are the three `markdown-selftest-*` a killed run left before this item, kept deliberately under hazard 4 (their pids report as ALIVE, because Windows recycles them) |
| rule 8 | **34 probes, 28 CAUGHT, 3 green controls, both GRADER controls right, ONE declared ceiling, ZERO aborts, digest `6c2c7d1ab345c80d` identical at both ends** |

### Rule 8 — 34 probes, and the TWELVE that matter are the readers' own edits

Final pass with the readers' exact mutations checked in (v0.8), the ceilings RUN (v0.14), the tree held
still by a content digest (v0.17), the environment asserted (v0.19) and the GRADER controlled (v0.24):
**28 CAUGHT, 3 green controls, 1 CRASH control right, 1 WRONG-REASON control right, ONE declared
ceiling, ZERO aborts, digest `6c2c7d1ab345c80d` at both ends.**

Obligation (a) breaks each of `G6`'s six clauses; (b) breaks each `Outputs` row and makes output (3) a
TAUTOLOGY rather than deleting it; (c) swaps the derived relative spelling for a literal and hard-codes
the directory `G6` is pointed at; (d) takes the file loop one entry out and the whole list out, and
breaks the `ALL_CHECKS` and `G6_NAMES` memberships; (e) makes `G6` NOT RUN and removes its report row.
Obligation (f) has no instance: this item runs no worker and asserts no completion order.

**The twelve reader probes are `r1`-`r12` and eleven are CAUGHT.** `r5` is the one survivor and it is a
**DECLARED CEILING NAMED IN THE CLAUSE ITSELF**: `G6` searches for the text `dev-dist`, and this check
and its self-test both SPLIT that token on purpose, because a literal quoting the pattern it searches
for is a false match for itself ([Q178](../questions/q178.md), which this clause reproduced twice before
it worked). *A check cannot both use the trick and refuse it.*

**Five probes ABORTED on the first final pass and all five were rule 7 (b) firing correctly** — their
anchors were inside the `G6` the readers' findings replaced. Re-anchored and all five CAUGHT; `d1`'s is
now agnostic (*the sort, whatever it filters*) rather than pinned to a predicate that has changed once
already.

**And the harness itself was wrong twice, both in the requirements written to catch an author.** Its
restore assertion kept one `before` per EDIT, so two edits in one file made the second's baseline the
text after the first and `g-wrong` reported **`RESTORE FAILED` on a tree the digest said was
identical** — v0.11's requirement producing a false negative, which is W58's `apply()` defect from the
other side: that one restored wrongly and said nothing, this one restored correctly and lied. And
`d3`'s anchor matched TWICE, because `ALL_CHECKS` is declared once and quoted once in a `SELF` entry —
the same pair that had to move together when `G6` was added.

### Exceptions — declared, and four were not predictable from the `Owns` block

| file | why |
|---|---|
| `scripts/check-docs.mjs` | **`OUT` is the blocker**, and [Q182](../questions/q182.md) says so: relocating the staging cannot help *because the copies it runs are the real checks and they write the real paths*. Output (4) is unmeasurable without it |
| `scripts/check-wiring.mjs` | the stub is W103's finding 3, named in this item's own **Why**; and `G6` lives here. The `Owns` line gates this file on the markers being retired, and they are — but the stub fix was never conditional on that |
| `tsconfig.docs.json` | its `include` was the fixed `dev-dist/docs/*.ts`; a tracked file cannot name a pid, so the glob widened and `X3` writes its own config extending it |
| `doc/workflow.md` | section 8 carried a wall derived from the two figures this item measured wrong — W104's `Spec:` line set that precedent for its own number |
| `doc/decisions/0072-*`, `doc/decisions/README.md`, `doc/open-questions.md`, `CLAUDE.md`, `README.md`, `doc/README.md` | section 1 rule 5's record step |

*The `Owns` block named ten files and the item edited fourteen.* None of the four was predictable from a
file SET: each is created by what the change turned out to BE — the blocker being in a check rather than
in a self-test, a tracked tsconfig naming a scratch path, and a workflow section carrying a derived
number.
